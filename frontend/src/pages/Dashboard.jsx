import React, { useState } from 'react';
import {
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  Sun,
  CloudSun,
  Database,
  Sparkles,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGeneration, useSeedDemoGeneration } from '../hooks/useGenerationQuery';
import { useConsumption, useSeedDemoConsumption } from '../hooks/useConsumptionQuery';
import { useGridExport, useGridImport } from '../hooks/useGridQuery';
import { usePredictBill, useBills } from '../hooks/useBillsQuery';
import { useROI } from '../hooks/useROIQuery';
import { useAlerts } from '../hooks/useAlertsQuery';
import { useWeatherImpact } from '../hooks/useWeatherQuery';
import { useSocket } from '../context/SocketContext';
import { StatCard } from '../components/ui/StatCard';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { FallbackCard } from '../components/ui/FallbackCard';
import { GenerationVsConsumptionChart } from '../components/charts/GenerationVsConsumptionChart';
import { formatCurrency, formatEnergy, formatPower, formatPercentage } from '../utils/formatters';
import toast from 'react-hot-toast';

export const Dashboard = () => {
  const { latestGeneration, isLive } = useSocket();

  // Queries
  const {
    data: genData,
    isLoading: genLoading,
    error: genError,
    refetch: refetchGen
  } = useGeneration();

  const {
    data: conData,
    isLoading: conLoading,
    error: conError,
    refetch: refetchCon
  } = useConsumption();

  const { data: gridExportData } = useGridExport();
  const { data: gridImportData } = useGridImport();
  const { data: predictBillData } = usePredictBill();
  const { data: billsData } = useBills();
  const { data: roiData } = useROI();
  const { data: alertsData } = useAlerts({ isRead: false });
  const { data: weatherData } = useWeatherImpact();

  // Mutations for seeding
  const seedGenMutation = useSeedDemoGeneration();
  const seedConMutation = useSeedDemoConsumption();
  const [seeding, setSeeding] = useState(false);

  const handleSeedAllDemo = async () => {
    try {
      setSeeding(true);
      await Promise.all([
        seedGenMutation.mutateAsync(),
        seedConMutation.mutateAsync(),
      ]);
      toast.success('Successfully seeded daylight generation & consumption telemetry!');
      refetchGen();
      refetchCon();
    } catch (err) {
      toast.error('Failed to seed demo data. Please try again.');
    } finally {
      setSeeding(false);
    }
  };

  const isLoading = genLoading || conLoading;
  const isError = genError || conError;

  // Real-time telemetry fallback with socket update
  const currentPowerOutputKW =
    latestGeneration?.powerOutput !== undefined
      ? Number(latestGeneration.powerOutput)
      : Number(genData?.summary?.currentPowerKW ?? 0);

  const todayGenerationKWh = Number(genData?.summary?.todayEnergyKWh ?? 0);
  const todayConsumptionKWh = Number(conData?.summary?.todayConsumedKWh ?? 0);

  const exportedKWh = Number(gridExportData?.data?.exportedKWh ?? 0);
  const importedKWh = Number(gridImportData?.data?.importedKWh ?? 0);

  const predictedSavingsINR =
    predictBillData?.prediction?.estimatedSavingsINR ??
    billsData?.summary?.latestMonthSavingsINR ??
    2450;

  const roiYearsRemaining =
    roiData?.financialMetrics?.yearsRemaining ??
    roiData?.summaryText?.match(/\d+(\.\d+)?/)?.[0] ??
    '4.2';

  const unreadAlertsCount = alertsData?.unreadCount ?? alertsData?.count ?? 0;

  // Chart data unification
  const genReadings = genData?.readings || [];
  const conReadings = conData?.readings || [];
  const hasData = genReadings.length > 0 || conReadings.length > 0;

  // Merge timestamps for combined generation vs consumption curve
  const chartPoints = [];
  const maxPoints = Math.max(genReadings.length, conReadings.length, 8);
  for (let i = 0; i < maxPoints; i++) {
    const g = genReadings[i];
    const c = conReadings[i];
    if (g || c) {
      chartPoints.push({
        timestamp: g?.timestamp || c?.timestamp || new Date(Date.now() - (maxPoints - i) * 3600000),
        generationKW: g?.powerOutput ?? 0,
        consumptionKW: c?.powerConsumed ?? 0,
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Photovoltaic Plant Overview
            </h2>
            <Badge variant="solar" size="sm">
              {genData?.summary?.systemCapacityKW || 5.0} kW Rated
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {genData?.summary?.todaySummaryText || 'Live generation & household load telemetry'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={handleSeedAllDemo}
            loading={seeding}
            variant="primary"
            size="sm"
            icon={Sparkles}
          >
            Seed Demo Telemetry
          </Button>

          <Button
            onClick={() => {
              refetchGen();
              refetchCon();
            }}
            variant="outline"
            size="sm"
            icon={RefreshCw}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <ErrorState
          title="Telemetry Connection Issue"
          message="Could not load real-time telemetry from the backend API. Ensure the server is running on port 5001."
          onRetry={() => {
            refetchGen();
            refetchCon();
          }}
        />
      )}

      {/* Stat Cards Grid */}
      {isLoading ? (
        <CardSkeleton count={7} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Current Output */}
          <StatCard
            title="Current Solar Output"
            value={formatPower(currentPowerOutputKW)}
            subtitle={`Rated ${genData?.summary?.systemCapacityKW || 5.0} kW`}
            icon={Zap}
            accentColor="amber"
            live={isLive}
          />

          {/* 2. Today's Generation */}
          <StatCard
            title="Today's Generation"
            value={formatEnergy(todayGenerationKWh)}
            subtitle={`Peak: ${formatPower(genData?.summary?.peakPowerKW || currentPowerOutputKW)}`}
            icon={Sun}
            accentColor="orange"
            trend={{ value: '+14% vs avg', isPositive: true }}
          />

          {/* 3. Today's Consumption */}
          <StatCard
            title="Today's Consumption"
            value={formatEnergy(todayConsumptionKWh)}
            subtitle={`Peak demand: ${formatPower(conData?.summary?.peakDemandKW || 2.4)}`}
            icon={Activity}
            accentColor="sky"
          />

          {/* 4. Grid Export & Import */}
          <StatCard
            title="Grid Net Balance"
            value={
              exportedKWh >= importedKWh
                ? `+${formatEnergy(exportedKWh - importedKWh)}`
                : `-${formatEnergy(importedKWh - exportedKWh)}`
            }
            subtitle={`Exp: ${exportedKWh.toFixed(1)} kWh | Imp: ${importedKWh.toFixed(1)} kWh`}
            icon={exportedKWh >= importedKWh ? ArrowUpRight : ArrowDownLeft}
            accentColor={exportedKWh >= importedKWh ? 'emerald' : 'rose'}
          />

          {/* 5. Predicted Monthly Savings */}
          <StatCard
            title="Est. Monthly Savings"
            value={formatCurrency(predictedSavingsINR)}
            subtitle="Tariff-calculated offset"
            icon={IndianRupee}
            accentColor="emerald"
            trend={{ value: `${predictBillData?.prediction?.savingsPercentage || 70}% saved`, isPositive: true }}
          />

          {/* 6. ROI Payback */}
          <StatCard
            title="ROI Payback Period"
            value={`${roiYearsRemaining} yrs`}
            subtitle={roiData?.financialMetrics?.breakEvenStatus || 'To complete capital break-even'}
            icon={TrendingUp}
            accentColor="purple"
          />

          {/* 7. Unread Alerts */}
          <StatCard
            title="System Diagnostics"
            value={unreadAlertsCount}
            subtitle={unreadAlertsCount > 0 ? 'Maintenance attention required' : 'All systems operating normally'}
            icon={AlertTriangle}
            accentColor={unreadAlertsCount > 0 ? 'rose' : 'emerald'}
          />

          {/* 8. Weather Snippet */}
          <Card className="p-5 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Weather Irradiance
              </span>
              <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500">
                <CloudSun className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-50">
                  {weatherData?.currentWeather?.solarIrradianceWPerM2 ?? 850}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">W/m²</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {weatherData?.location?.city || 'Mumbai'}:{' '}
                <span className="font-semibold text-emerald-500">
                  {formatPercentage(weatherData?.impactAnalysis?.overallEfficiencyPercentage ?? 88)} efficiency
                </span>
              </p>
            </div>

            <Link
              to="/weather"
              className="mt-3 text-xs font-semibold text-amber-500 hover:text-amber-600 flex items-center gap-1"
            >
              <span>View 48-hr Forecast</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </Card>
        </div>
      )}

      {/* Main Generation vs Consumption Chart */}
      <Card>
        <CardHeader
          title="Photovoltaic Generation vs Load Profile"
          subtitle="Real-time comparative power telemetry (kW)"
          action={
            <div className="flex items-center gap-2">
              <Link to="/generation">
                <Button variant="ghost" size="sm" icon={Zap}>
                  Generation Log
                </Button>
              </Link>
              <Link to="/consumption">
                <Button variant="ghost" size="sm" icon={Activity}>
                  Consumption Log
                </Button>
              </Link>
            </div>
          }
        />
        <CardContent>
          {!hasData && !isLoading ? (
            <EmptyState
              icon={Sun}
              title="No Telemetry Data Seeded"
              description="Your system does not have recent generation or consumption records. Seed demo daylight telemetry to view live curves and analytics."
              actionLabel="Seed 10-Hour Daylight Curve"
              onAction={handleSeedAllDemo}
              actionIcon={Database}
            />
          ) : (
            <GenerationVsConsumptionChart data={chartPoints} height={320} />
          )}
        </CardContent>
      </Card>

      {/* Defensive Fallback Card for any unexpected root backend response keys */}
      {genData?.summary && (
        <FallbackCard
          title="Telemetry Summary Diagnostics"
          subtitle="Direct payload telemetry properties from API"
          data={genData.summary}
        />
      )}
    </div>
  );
};
