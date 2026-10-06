import React, { useState } from 'react';
import {
  TrendingUp,
  IndianRupee,
  Calendar,
  Calculator,
  Percent,
  CheckCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { useROI, useCustomROI } from '../hooks/useROIQuery';
import { useDebounce } from '../hooks/useDebounce';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { CardSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { formatCurrency, formatPercentage } from '../utils/formatters';

export const ROI = () => {
  const { data: roiRes, isLoading, error, refetch } = useROI();

  // Scenario Calculator State
  const [calculatorInputs, setCalculatorInputs] = useState({
    systemCost: '250000',
    systemCapacityKW: '5.0',
    tariffPerKWh: '7.50',
    annualSunHours: '1450',
    yearsInService: '0.5'
  });

  // Debounced inputs for API calls
  const debouncedInputs = useDebounce(calculatorInputs, 500);

  const { data: customRes, isFetching: customFetching } = useCustomROI({
    systemCost: debouncedInputs.systemCost,
    systemCapacityKW: debouncedInputs.systemCapacityKW,
    tariffPerKWh: debouncedInputs.tariffPerKWh,
    annualSunHours: debouncedInputs.annualSunHours,
    yearsInService: debouncedInputs.yearsInService
  });

  const system = roiRes?.systemDetails || {};
  const metrics = roiRes?.financialMetrics || {};

  const totalCost = Number(system.totalSystemCostINR || 250000);
  const yearsRemaining = Number(metrics.yearsRemaining || 4.2);
  const totalPaybackYears = Number(metrics.totalPaybackYears || 5.0);

  // Payback progress calculation
  const paybackProgress = Math.min(100, Math.max(5, ((totalPaybackYears - yearsRemaining) / (totalPaybackYears || 1)) * 100));

  const handleInputChange = (field, value) => {
    setCalculatorInputs((prev) => ({ ...prev, [field]: value }));
  };

  const customResults = customRes?.results || {};

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Return on Investment (ROI) & Payback
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {roiRes?.summaryText || 'Break-even analytics, capital amortization, and scenario modeling'}
          </p>
        </div>

        <Button onClick={refetch} variant="outline" size="sm" icon={RefreshCw}>
          Recalculate
        </Button>
      </div>

      {error && (
        <ErrorState
          title="Could Not Load ROI Telemetry"
          message={error.response?.data?.message || 'Failed to fetch financial metrics.'}
          onRetry={refetch}
        />
      )}

      {isLoading ? (
        <CardSkeleton count={4} />
      ) : (
        <>
          {/* Payback Progress Hero Banner */}
          <Card className="p-6 bg-gradient-to-br from-white dark:from-navy-900 via-slate-50 dark:via-navy-850 to-amber-500/10 border-amber-500/30">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs uppercase font-bold text-amber-500 tracking-wider">
                    Installed System Payback Status
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {metrics.yearsRemaining ?? '4.2'} Years to Capital Break-Even
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">System Capital Cost</span>
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    {formatCurrency(totalCost)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>Payback Amortized: {paybackProgress.toFixed(1)}%</span>
                  <span>Target: {totalPaybackYears.toFixed(1)} Years Total</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-navy-950 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 transition-all duration-500 shadow-sm"
                    style={{ width: `${paybackProgress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-navy-950/70 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Net Annual Savings
                  </span>
                  <span className="text-sm font-bold text-emerald-500">
                    {formatCurrency(metrics.netAnnualSavingsINR || 52500)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-navy-950/70 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Total Payback Term
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {metrics.totalPaybackYears ?? 5.0} Years
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-navy-950/70 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Annual ROI Yield
                  </span>
                  <span className="text-sm font-bold text-amber-500">
                    {formatPercentage(metrics.roiPercentage || 21.0)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-navy-950/70 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Years in Operation
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {Number(system.yearsInService || 0.3).toFixed(1)} yrs
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Interactive Scenario Calculator */}
          <Card>
            <CardHeader
              title="Interactive Scenario Calculator"
              subtitle="Debounced scenario model for potential solar capacity expansions or new installs"
            />
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-amber-500" />
                    Simulation Parameters
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Simulated Cost (₹)"
                      type="number"
                      value={calculatorInputs.systemCost}
                      onChange={(e) => handleInputChange('systemCost', e.target.value)}
                      placeholder="250000"
                    />

                    <Input
                      label="System Capacity (kW)"
                      type="number"
                      step="0.5"
                      value={calculatorInputs.systemCapacityKW}
                      onChange={(e) => handleInputChange('systemCapacityKW', e.target.value)}
                      placeholder="5.0"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="Grid Tariff (₹/kWh)"
                      type="number"
                      step="0.1"
                      value={calculatorInputs.tariffPerKWh}
                      onChange={(e) => handleInputChange('tariffPerKWh', e.target.value)}
                    />

                    <Input
                      label="Annual Sun Hours"
                      type="number"
                      value={calculatorInputs.annualSunHours}
                      onChange={(e) => handleInputChange('annualSunHours', e.target.value)}
                      helperText="Avg 1450 hrs in India"
                    />

                    <Input
                      label="Years in Service"
                      type="number"
                      step="0.1"
                      value={calculatorInputs.yearsInService}
                      onChange={(e) => handleInputChange('yearsInService', e.target.value)}
                    />
                  </div>
                </div>

                {/* Outputs */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-navy-950/70 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500">
                        Projected Financial Yield
                      </h4>
                      {customFetching && (
                        <span className="text-[10px] text-amber-500 flex items-center gap-1 animate-pulse">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Calculating...
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline py-1 border-b border-slate-200 dark:border-slate-800">
                        <span className="text-xs text-slate-500">Projected Annual Generation:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {customResults.annualGenerationKWh ? `${customResults.annualGenerationKWh} kWh/yr` : '—'}
                        </span>
                      </div>

                      <div className="flex justify-between items-baseline py-1 border-b border-slate-200 dark:border-slate-800">
                        <span className="text-xs text-slate-500">Gross Annual Bill Offset:</span>
                        <span className="font-bold text-emerald-500">
                          {formatCurrency(customResults.annualGrossSavingsINR || 0)}
                        </span>
                      </div>

                      <div className="flex justify-between items-baseline py-1 border-b border-slate-200 dark:border-slate-800">
                        <span className="text-xs text-slate-500">Net Annual Returns (After O&M):</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(customResults.netAnnualSavingsINR || 0)}
                        </span>
                      </div>

                      <div className="flex justify-between items-baseline py-1 border-b border-slate-200 dark:border-slate-800">
                        <span className="text-xs text-slate-500">Capital Payback Period:</span>
                        <span className="font-extrabold text-amber-500 text-base">
                          {customResults.yearsRemaining !== undefined ? `${customResults.yearsRemaining} Years Remaining` : '—'}
                        </span>
                      </div>

                      <div className="flex justify-between items-baseline py-1">
                        <span className="text-xs text-slate-500">Simulated Annual ROI:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatPercentage(customResults.roiPercentage || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-4 italic">
                    {customResults.summaryText || 'Live debounced scenario calculation via /api/roi/calculate.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
