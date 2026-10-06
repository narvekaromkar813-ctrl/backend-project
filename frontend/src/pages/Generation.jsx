import React, { useState } from 'react';
import {
  Zap,
  Plus,
  Sparkles,
  Calendar,
  Filter,
  Thermometer,
  Sun,
  Clock,
  RefreshCw
} from 'lucide-react';
import {
  useGeneration,
  useRecordGeneration,
  useSeedDemoGeneration
} from '../hooks/useGenerationQuery';
import { usePanels } from '../hooks/usePanelsQuery';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { PowerOutputAreaChart } from '../components/charts/PowerOutputAreaChart';
import { formatPower, formatEnergy, formatDateTime } from '../utils/formatters';

export const Generation = () => {
  const [selectedPanel, setSelectedPanel] = useState('');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    panelId: '',
    powerOutput: '3.8',
    energyGenerated: '3.8',
    temperature: '28',
    irradiance: '820',
    notes: 'Manual entry'
  });

  // Queries
  const { data: panelsData } = usePanels();
  const panels = panelsData?.panels || [];

  const { data, isLoading, error, refetch } = useGeneration({
    panelId: selectedPanel || undefined,
    limit: 50,
  });

  const recordMutation = useRecordGeneration();
  const seedMutation = useSeedDemoGeneration();

  const readings = data?.readings || [];

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    const panelIdToUse = form.panelId || selectedPanel || panels[0]?._id || panels[0]?.id;
    if (!panelIdToUse) {
      alert('Please create or select a solar panel first');
      return;
    }

    await recordMutation.mutateAsync({
      panelId: panelIdToUse,
      powerOutput: Number(form.powerOutput),
      energyGenerated: Number(form.energyGenerated),
      temperature: Number(form.temperature),
      irradiance: Number(form.irradiance),
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
            Solar Generation Telemetry
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Photovoltaic electrical output (kW) and energy harvested (kWh)
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
            Seed 10-Hr Daylight Curve
          </Button>

          <Button
            onClick={() => setIsLogModalOpen(true)}
            variant="primary"
            icon={Plus}
            size="sm"
          >
            Log Reading
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-72">
            <Select
              value={selectedPanel}
              onChange={(e) => setSelectedPanel(e.target.value)}
              options={[
                { value: '', label: 'All Registered Panels' },
                ...panels.map((p) => ({
                  value: p._id || p.id,
                  label: `${p.name} (${p.capacity} kW)`,
                })),
              ]}
            />
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-semibold text-amber-500">{readings.length}</span> telemetry readings
          </div>
        </div>
      </Card>

      {/* Error state */}
      {error && (
        <ErrorState
          title="Telemetry Fetch Failed"
          message={error.response?.data?.message || 'Failed to load generation telemetry.'}
          onRetry={refetch}
        />
      )}

      {/* Telemetry Chart */}
      <Card>
        <CardHeader
          title="Photovoltaic Generation Curve"
          subtitle="Instantaneous power telemetry (kW) over time"
        />
        <CardContent>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
            </div>
          ) : readings.length === 0 ? (
            <EmptyState
              icon={Zap}
              title="No Generation Records"
              description="No electrical generation has been recorded for this view. Seed demo daylight telemetry or log a reading manually."
              actionLabel="Seed Demo Curve"
              onAction={() => seedMutation.mutate()}
              actionIcon={Sparkles}
            />
          ) : (
            <PowerOutputAreaChart readings={readings} height={300} />
          )}
        </CardContent>
      </Card>

      {/* Telemetry History Table */}
      <Card>
        <CardHeader
          title="Telemetry Log Stream"
          subtitle="Time-series data points with temperature and solar irradiance"
        />
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton rows={6} cols={5} />
          ) : readings.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No historical records in database
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-navy-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Panel / String</th>
                    <th className="py-3 px-4">Power Output</th>
                    <th className="py-3 px-4">Energy Generated</th>
                    <th className="py-3 px-4">Irradiance</th>
                    <th className="py-3 px-4">Temperature</th>
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
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                        {r.panel?.name || 'Rooftop Array'}
                      </td>
                      <td className="py-3 px-4 font-bold text-amber-500">
                        {formatPower(r.powerOutput)}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {formatEnergy(r.energyGenerated)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {r.irradiance ? `${r.irradiance} W/m²` : '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {r.temperature ? `${r.temperature} °C` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Reading Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log Generation Telemetry"
        subtitle="Record electrical power readings from inverter"
      >
        <form onSubmit={handleLogSubmit} className="space-y-4">
          <Select
            label="Target Solar Panel"
            value={form.panelId}
            onChange={(e) => setForm({ ...form, panelId: e.target.value })}
            options={panels.map((p) => ({
              value: p._id || p.id,
              label: `${p.name} (${p.capacity} kW)`,
            }))}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Power Output (kW)"
              type="number"
              step="0.05"
              min="0"
              value={form.powerOutput}
              onChange={(e) => setForm({ ...form, powerOutput: e.target.value })}
              icon={Zap}
              required
            />

            <Input
              label="Energy Generated (kWh)"
              type="number"
              step="0.05"
              min="0"
              value={form.energyGenerated}
              onChange={(e) => setForm({ ...form, energyGenerated: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Solar Irradiance (W/m²)"
              type="number"
              value={form.irradiance}
              onChange={(e) => setForm({ ...form, irradiance: e.target.value })}
              icon={Sun}
            />

            <Input
              label="Cell Temperature (°C)"
              type="number"
              value={form.temperature}
              onChange={(e) => setForm({ ...form, temperature: e.target.value })}
              icon={Thermometer}
            />
          </div>

          <Input
            label="Operational Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="e.g. Clear skies, peak noon reading"
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
              Record Telemetry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
