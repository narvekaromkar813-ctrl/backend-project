import React, { useState } from 'react';
import {
  Activity,
  Plus,
  Sparkles,
  PieChart as PieIcon,
  Layers,
  Zap,
  Clock,
  RefreshCw
} from 'lucide-react';
import {
  useConsumption,
  useRecordConsumption,
  useSeedDemoConsumption
} from '../hooks/useConsumptionQuery';
import { usePanels } from '../hooks/usePanelsQuery';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { AppliancePieChart } from '../components/charts/AppliancePieChart';
import { formatPower, formatEnergy, formatDateTime } from '../utils/formatters';

const APPLIANCE_OPTIONS = [
  { value: 'HVAC', label: 'HVAC / Air Conditioning' },
  { value: 'water_heater', label: 'Water Heater / Geyser' },
  { value: 'appliances', label: 'Kitchen & Home Appliances' },
  { value: 'lighting', label: 'Lighting & Fans' },
  { value: 'general', label: 'General Household Base Load' },
  { value: 'ev_charging', label: 'Electric Vehicle Charger' },
];

export const Consumption = () => {
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    powerConsumed: '2.5',
    energyConsumed: '2.5',
    applianceCategory: 'HVAC',
    notes: 'Base daytime load',
  });

  // Queries
  const { data: panelsData } = usePanels();
  const panels = panelsData?.panels || [];

  const { data, isLoading, error, refetch } = useConsumption({
    applianceCategory: categoryFilter || undefined,
    limit: 50,
  });

  const recordMutation = useRecordConsumption();
  const seedMutation = useSeedDemoConsumption();

  const readings = data?.readings || [];
  const summary = data?.summary || {};

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    await recordMutation.mutateAsync({
      powerConsumed: Number(form.powerConsumed),
      energyConsumed: Number(form.energyConsumed),
      applianceCategory: form.applianceCategory,
      notes: form.notes,
    });
    setIsLogModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Household Electricity Consumption
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Load demand profiles, category breakdown, and power draw
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => seedMutation.mutate()}
            loading={seedMutation.isPending}
            variant="secondary"
            icon={Sparkles}
            size="sm"
          >
            Seed ~12 kWh Profile
          </Button>

          <Button
            onClick={() => setIsLogModalOpen(true)}
            variant="primary"
            icon={Plus}
            size="sm"
          >
            Log Consumption
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Today's Total Consumption
          </span>
          <span className="text-2xl font-bold text-sky-500 mt-1 block">
            {formatEnergy(summary.todayConsumedKWh || 0)}
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Peak Demand Load
          </span>
          <span className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1 block">
            {formatPower(summary.peakDemandKW || 0)}
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Current Instantaneous Load
          </span>
          <span className="text-2xl font-bold text-amber-500 mt-1 block">
            {formatPower(summary.currentPowerDemandKW || 0)}
          </span>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-72">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: '', label: 'All Appliance Categories' },
                ...APPLIANCE_OPTIONS,
              ]}
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Recorded <span className="font-semibold text-sky-500">{readings.length}</span> load readings
          </div>
        </div>
      </Card>

      {/* Error state */}
      {error && (
        <ErrorState
          title="Consumption Data Error"
          message={error.response?.data?.message || 'Failed to retrieve electricity consumption records.'}
          onRetry={refetch}
        />
      )}

      {/* Chart: Appliance Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader
            title="Appliance Category Breakdown"
            subtitle="Distribution of energy usage by category"
          />
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-sky-500" />
              </div>
            ) : readings.length === 0 ? (
              <EmptyState
                icon={PieIcon}
                title="No Consumption Data"
                description="Seed demo load profile or record an appliance reading."
                actionLabel="Seed ~12 kWh Profile"
                onAction={() => seedMutation.mutate()}
                actionIcon={Sparkles}
              />
            ) : (
              <AppliancePieChart readings={readings} height={280} />
            )}
          </CardContent>
        </Card>

        {/* History Table */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Consumption Telemetry Log"
            subtitle="High-resolution load demand recordings"
          />
          <CardContent className="p-0">
            {isLoading ? (
              <TableSkeleton rows={5} cols={4} />
            ) : readings.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No consumption records logged yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-navy-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Demand (kW)</th>
                      <th className="py-3 px-4">Consumed (kWh)</th>
                      <th className="py-3 px-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {readings.map((r, i) => (
                      <tr
                        key={r._id || r.id || i}
                        className="hover:bg-slate-50/80 dark:hover:bg-navy-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                          {formatDateTime(r.timestamp)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-sky-600 dark:text-sky-400 capitalize">
                          {r.applianceCategory?.replace(/_/g, ' ') || 'General'}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                          {formatPower(r.powerConsumed)}
                        </td>
                        <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                          {formatEnergy(r.energyConsumed)}
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                          {r.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Manual Entry Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Record Household Consumption"
        subtitle="Log load consumption and assign appliance category"
      >
        <form onSubmit={handleLogSubmit} className="space-y-4">
          <Select
            label="Appliance Category"
            value={form.applianceCategory}
            onChange={(e) => setForm({ ...form, applianceCategory: e.target.value })}
            options={APPLIANCE_OPTIONS}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Instantaneous Power (kW)"
              type="number"
              step="0.05"
              min="0"
              value={form.powerConsumed}
              onChange={(e) => setForm({ ...form, powerConsumed: e.target.value })}
              icon={Zap}
              required
            />

            <Input
              label="Energy Consumed (kWh)"
              type="number"
              step="0.05"
              min="0"
              value={form.energyConsumed}
              onChange={(e) => setForm({ ...form, energyConsumed: e.target.value })}
              required
            />
          </div>

          <Input
            label="Description / Appliance Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="e.g. Living room AC continuous 2-hour run"
          />

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsLogModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={recordMutation.isPending}
            >
              Record Load
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
