import React, { useState } from 'react';
import {
  SunMedium,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Layers,
  MapPin,
  IndianRupee,
  Gauge,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  usePanels,
  useCreatePanel,
  useUpdatePanel,
  useDeletePanel
} from '../hooks/usePanelsQuery';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { TableSkeleton, CardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { getStatusBadge } from '../utils/helpers';

export const Panels = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [panelTypeFilter, setPanelTypeFilter] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPanel, setEditingPanel] = useState(null);
  const [deletingPanel, setDeletingPanel] = useState(null);

  // Form State
  const initialForm = {
    name: '',
    capacity: '5.0',
    location: 'Rooftop Array',
    panelType: 'Monocrystalline',
    cost: '250000',
    efficiency: '20.0',
    status: 'active',
  };
  const [formData, setFormData] = useState(initialForm);

  // Queries & Mutations
  const { data, isLoading, error, refetch } = usePanels({
    search: search || undefined,
    status: statusFilter || undefined,
    panelType: panelTypeFilter || undefined,
  });

  const createMutation = useCreatePanel();
  const updateMutation = useUpdatePanel();
  const deleteMutation = useDeletePanel();

  const panels = data?.panels || [];
  const totalCapacityKW = data?.totalCapacityKW || panels.reduce((sum, p) => sum + (p.capacity || 0), 0);

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (panel) => {
    setEditingPanel(panel);
    setFormData({
      name: panel.name || '',
      capacity: String(panel.capacity || '5.0'),
      location: panel.location || 'Rooftop Array',
      panelType: panel.panelType || 'Monocrystalline',
      cost: String(panel.cost || '250000'),
      efficiency: String(panel.efficiency || '20.0'),
      status: panel.status || 'active',
    });
  };

  const handleSavePanel = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      capacity: Number(formData.capacity),
      location: formData.location,
      panelType: formData.panelType,
      cost: Number(formData.cost),
      efficiency: Number(formData.efficiency),
      status: formData.status,
    };

    if (editingPanel) {
      await updateMutation.mutateAsync({
        id: editingPanel._id || editingPanel.id,
        panelData: payload,
      });
      setEditingPanel(null);
    } else {
      await createMutation.mutateAsync(payload);
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPanel) return;
    await deleteMutation.mutateAsync(deletingPanel._id || deletingPanel.id);
    setDeletingPanel(null);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Solar Panel Arrays ({panels.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Aggregated system capacity: <span className="font-semibold text-amber-500">{totalCapacityKW} kW</span>
          </p>
        </div>

        <Button onClick={handleOpenAdd} variant="primary" icon={Plus}>
          Add Solar Panel
        </Button>
      </div>

      {/* Filters and Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search panels or locations..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select
            value={panelTypeFilter}
            onChange={(e) => setPanelTypeFilter(e.target.value)}
            options={[
              { value: '', label: 'All Panel Technologies' },
              { value: 'Monocrystalline', label: 'Monocrystalline' },
              { value: 'Polycrystalline', label: 'Polycrystalline' },
              { value: 'Thin-film', label: 'Thin-film' },
              { value: 'Bifacial', label: 'Bifacial' },
            ]}
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'active', label: 'Active (Generating)' },
              { value: 'maintenance', label: 'Under Maintenance' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </div>
      </Card>

      {/* Error state */}
      {error && (
        <ErrorState
          title="Failed to Load Solar Panels"
          message={error.response?.data?.message || 'Could not retrieve solar panel inventory.'}
          onRetry={refetch}
        />
      )}

      {/* Loading state */}
      {isLoading && <CardSkeleton count={4} />}

      {/* Empty State */}
      {!isLoading && !error && panels.length === 0 && (
        <EmptyState
          icon={SunMedium}
          title="No Solar Panels Configured"
          description="Register your photovoltaic modules and rooftop strings to start capturing generation telemetry."
          actionLabel="Register First Panel"
          onAction={handleOpenAdd}
          actionIcon={Plus}
        />
      )}

      {/* Panel Cards Grid */}
      {!isLoading && !error && panels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {panels.map((panel) => {
            const id = panel._id || panel.id;
            return (
              <Card
                key={id}
                hoverEffect
                glow
                className="p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {panel.name || 'Solar Panel'}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{panel.location || 'Rooftop Array'}</span>
                      </div>
                    </div>
                    <Badge className={getStatusBadge(panel.status)} size="sm">
                      {panel.status || 'Active'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 my-4 p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-100 dark:border-slate-800/80">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Rated Capacity
                      </span>
                      <span className="text-sm font-bold text-amber-500">
                        {panel.capacity || 0} kW
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Efficiency
                      </span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {formatPercentage(panel.efficiency || 20)}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Type
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate block">
                        {panel.panelType || 'Monocrystalline'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Capital Cost
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {formatCurrency(panel.cost || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-end gap-2">
                  <Button
                    onClick={() => handleOpenEdit(panel)}
                    variant="ghost"
                    size="sm"
                    icon={Edit2}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => setDeletingPanel(panel)}
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:text-rose-700 dark:text-rose-400"
                    icon={Trash2}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingPanel}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingPanel(null);
        }}
        title={editingPanel ? 'Edit Solar Panel' : 'Add New Solar Panel'}
        subtitle="Configure telemetry parameters and specifications"
      >
        <form onSubmit={handleSavePanel} className="space-y-4">
          <Input
            label="Panel Name / String Identifier"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. String #1 (North-East Array)"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Rated Capacity (kW)"
              type="number"
              step="0.1"
              min="0.1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              required
            />

            <Select
              label="Panel Technology"
              value={formData.panelType}
              onChange={(e) => setFormData({ ...formData, panelType: e.target.value })}
              options={[
                { value: 'Monocrystalline', label: 'Monocrystalline' },
                { value: 'Polycrystalline', label: 'Polycrystalline' },
                { value: 'Thin-film', label: 'Thin-film' },
                { value: 'Bifacial', label: 'Bifacial' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Installation Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Main Terrace East"
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'active', label: 'Active (Generating)' },
                { value: 'maintenance', label: 'Maintenance Required' },
                { value: 'inactive', label: 'Inactive / Offline' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="System Cost (₹)"
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            />

            <Input
              label="Efficiency Rating (%)"
              type="number"
              step="0.1"
              value={formData.efficiency}
              onChange={(e) => setFormData({ ...formData, efficiency: e.target.value })}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingPanel(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingPanel ? 'Update Panel' : 'Create Panel'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingPanel}
        onClose={() => setDeletingPanel(null)}
        title="Confirm Solar Panel Removal"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to remove <span className="font-bold text-slate-900 dark:text-white">{deletingPanel?.name}</span>? This will permanently erase associated telemetry logs.
          </p>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeletingPanel(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={handleDeleteConfirm}
            >
              Delete Panel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
