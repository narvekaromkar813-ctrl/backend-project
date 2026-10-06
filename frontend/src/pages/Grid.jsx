import React, { useState } from 'react';
import {
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  IndianRupee,
  ShieldCheck,
  RefreshCw,
  Info
} from 'lucide-react';
import { useGridExport, useGridImport } from '../hooks/useGridQuery';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CardSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { GridBalanceBarChart } from '../components/charts/GridBalanceBarChart';
import { formatCurrency, formatEnergy, formatPercentage } from '../utils/formatters';

export const Grid = () => {
  const {
    data: exportRes,
    isLoading: exportLoading,
    error: exportError,
    refetch: refetchExport
  } = useGridExport();

  const {
    data: importRes,
    isLoading: importLoading,
    error: importError,
    refetch: refetchImport
  } = useGridImport();

  const isLoading = exportLoading || importLoading;
  const isError = exportError || importError;

  const exportData = exportRes?.data || {};
  const importData = importRes?.data || {};

  const totalGenerationKWh = exportData.totalGenerationKWh ?? importData.totalGenerationKWh ?? 0;
  const totalConsumptionKWh = exportData.totalConsumptionKWh ?? importData.totalConsumptionKWh ?? 0;
  const exportedKWh = exportData.exportedKWh ?? 0;
  const importedKWh = importData.importedKWh ?? 0;
  const selfConsumedKWh = exportData.selfConsumedKWh ?? (totalConsumptionKWh - importedKWh);

  const netBalanceKWh = exportedKWh - importedKWh;
  const isNetExporter = netBalanceKWh >= 0;

  const estimatedCreditEarnedINR = exportData.estimatedCreditEarnedINR ?? (exportedKWh * (exportData.feedInTariffPerKWh || 3.5));
  const estimatedImportCostINR = importData.estimatedImportCostINR ?? (importedKWh * (importData.tariffPerKWh || 7.5));
  const netEnergyBillImpactINR = estimatedCreditEarnedINR - estimatedImportCostINR;

  const selfSufficiencyPct = importData.solarSelfSufficiencyPercentage ??
    (totalConsumptionKWh > 0 ? (selfConsumedKWh / totalConsumptionKWh) * 100 : 100);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Bi-Directional Grid Exchange
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time net metering import, export, and feed-in tariff balance
          </p>
        </div>

        <Button
          onClick={() => {
            refetchExport();
            refetchImport();
          }}
          variant="outline"
          size="sm"
          icon={RefreshCw}
        >
          Refresh Balance
        </Button>
      </div>

      {isError && (
        <ErrorState
          title="Grid Telemetry Unavailable"
          message="Could not load bi-directional grid export and import numbers."
          onRetry={() => {
            refetchExport();
            refetchImport();
          }}
        />
      )}

      {/* Net Metering Balance Banner */}
      <Card className="p-6 bg-gradient-to-br from-white dark:from-navy-900 via-slate-50 dark:via-navy-850 to-amber-500/5 border-amber-500/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                Net-Metering Status
              </span>
              <Badge variant={isNetExporter ? 'success' : 'warning'} size="sm">
                {isNetExporter ? 'Net Exporter' : 'Net Importer'}
              </Badge>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                {isNetExporter ? `+${formatEnergy(netBalanceKWh)}` : `-${formatEnergy(Math.abs(netBalanceKWh))}`}
              </span>
              <span className="text-xs text-slate-400">surplus balance</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg">
              {exportRes?.summaryText || importRes?.message ||
                `Solar generation covers ${selfSufficiencyPct.toFixed(1)}% of total residential consumption.`}
            </p>
          </div>

          <div className="w-full md:w-auto p-4 rounded-xl bg-slate-100 dark:bg-navy-950/80 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between gap-6">
              <span className="text-slate-500">Self-Sufficiency Yield:</span>
              <span className="font-bold text-emerald-500">{formatPercentage(selfSufficiencyPct)}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-slate-500">Feed-in Rate (Credit):</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                ₹{exportData.feedInTariffPerKWh || 3.50}/kWh
              </span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-slate-500">Grid Tariff Rate:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                ₹{importData.tariffPerKWh || 7.50}/kWh
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid Export vs Import Stat Cards */}
      {isLoading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Generation */}
          <Card className="p-5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Gross Solar Produced
            </span>
            <span className="text-2xl font-bold text-amber-500 mt-2 block">
              {formatEnergy(totalGenerationKWh)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
              Total PV array output
            </span>
          </Card>

          {/* Card 2: Self-Consumed */}
          <Card className="p-5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Self-Consumed Directly
            </span>
            <span className="text-2xl font-bold text-sky-500 mt-2 block">
              {formatEnergy(selfConsumedKWh)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
              Bypassed utility grid
            </span>
          </Card>

          {/* Card 3: Exported */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Exported to Grid
              </span>
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-2xl font-bold text-emerald-500 mt-2 block">
              {formatEnergy(exportedKWh)}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 block">
              Credits earned: {formatCurrency(estimatedCreditEarnedINR)}
            </span>
          </Card>

          {/* Card 4: Imported */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Imported from Grid
              </span>
              <ArrowDownLeft className="w-4 h-4 text-rose-500" />
            </div>
            <span className="text-2xl font-bold text-rose-500 mt-2 block">
              {formatEnergy(importedKWh)}
            </span>
            <span className="text-xs text-rose-600 dark:text-rose-400 mt-1 block">
              Import cost: {formatCurrency(estimatedImportCostINR)}
            </span>
          </Card>
        </div>
      )}

      {/* Grid Flow Bar Chart */}
      <Card>
        <CardHeader
          title="Grid Exchange Flow Profile"
          subtitle="Comparative volume of generation, consumption, export and import (kWh)"
        />
        <CardContent>
          <GridBalanceBarChart
            generationKWh={totalGenerationKWh}
            consumptionKWh={totalConsumptionKWh}
            exportedKWh={exportedKWh}
            importedKWh={importedKWh}
            height={300}
          />
        </CardContent>
      </Card>
    </div>
  );
};
