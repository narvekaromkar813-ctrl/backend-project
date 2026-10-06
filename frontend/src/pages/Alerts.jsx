import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  RefreshCw,
  Sparkles,
  Filter,
  Layers,
  Clock,
  ShieldAlert,
  Check
} from 'lucide-react';
import {
  useAlerts,
  useCheckAlerts,
  useMarkAlertRead,
  useResolveAlert
} from '../hooks/useAlertsQuery';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { CardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { formatDateTime } from '../utils/formatters';
import { getSeverityStyle } from '../utils/helpers';

export const Alerts = () => {
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // 'unread' | 'unresolved' | ''
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Queries & Mutations
  const params = {};
  if (severityFilter) params.severity = severityFilter;
  if (statusFilter === 'unread') params.isRead = false;
  if (statusFilter === 'unresolved') params.isResolved = false;

  const { data, isLoading, error, refetch } = useAlerts(params);
  const checkMutation = useCheckAlerts();
  const markReadMutation = useMarkAlertRead();
  const resolveMutation = useResolveAlert();

  const alerts = data?.alerts || [];
  const unreadCount = data?.unreadCount ?? 0;

  const handleRunDiagnostics = async () => {
    await checkMutation.mutateAsync();
  };

  const handleMarkRead = async (id, e) => {
    if (e) e.stopPropagation();
    await markReadMutation.mutateAsync(id);
    if (selectedAlert && (selectedAlert._id === id || selectedAlert.id === id)) {
      setSelectedAlert((prev) => ({ ...prev, isRead: true }));
    }
  };

  const handleResolve = async (id, e) => {
    if (e) e.stopPropagation();
    await resolveMutation.mutateAsync(id);
    if (selectedAlert && (selectedAlert._id === id || selectedAlert.id === id)) {
      setSelectedAlert((prev) => ({ ...prev, isResolved: true }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Alerts & Diagnostic System</span>
            {unreadCount > 0 && (
              <Badge variant="warning" size="sm">
                {unreadCount} Unread
              </Badge>
            )}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated anomaly detection scans for zero-generation and underperforming strings
          </p>
        </div>

        <Button
          onClick={handleRunDiagnostics}
          loading={checkMutation.isPending}
          variant="primary"
          icon={RefreshCw}
          size="sm"
        >
          Run Diagnostics
        </Button>
      </div>

      {/* Filter toolbar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            options={[
              { value: '', label: 'All Severities' },
              { value: 'high', label: 'High / Critical' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low / Informational' },
            ]}
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Alerts (Read & Unread)' },
              { value: 'unread', label: 'Unread Only' },
              { value: 'unresolved', label: 'Unresolved Only' },
            ]}
          />
        </div>
      </Card>

      {error && (
        <ErrorState
          title="Could Not Retrieve Alerts"
          message={error.response?.data?.message || 'Failed to communicate with diagnostic service.'}
          onRetry={refetch}
        />
      )}

      {isLoading && <CardSkeleton count={3} />}

      {!isLoading && !error && alerts.length === 0 && (
        <EmptyState
          icon={CheckCircle2}
          title="All Systems Healthy"
          description="No anomalies or maintenance notices match your criteria. You can run manual diagnostics to inspect panel telemetry."
          actionLabel="Run Diagnostic Check"
          onAction={handleRunDiagnostics}
          actionIcon={RefreshCw}
        />
      )}

      {/* Alerts List */}
      {!isLoading && !error && alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const id = alert._id || alert.id;
            const style = getSeverityStyle(alert.severity);

            return (
              <div
                key={id}
                onClick={() => setSelectedAlert(alert)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  alert.isRead
                    ? 'bg-white/70 dark:bg-navy-900/60 border-slate-200 dark:border-slate-800 opacity-90'
                    : 'bg-white dark:bg-navy-900 border-amber-500/40 shadow-sm ring-1 ring-amber-500/20'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${style.bg}`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {alert.title || 'System Notice'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${style.bg}`}>
                        {alert.severity || 'Medium'}
                      </span>
                      {!alert.isRead && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Unread" />
                      )}
                      {alert.isResolved && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
                          Resolved
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {alert.message}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span>{formatDateTime(alert.createdAt || alert.timestamp)}</span>
                      {alert.panel?.name && (
                        <span>• Panel: {alert.panel.name}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {!alert.isRead && (
                    <Button
                      onClick={(e) => handleMarkRead(id, e)}
                      variant="ghost"
                      size="sm"
                      title="Mark as read"
                    >
                      Mark Read
                    </Button>
                  )}

                  {!alert.isResolved && (
                    <Button
                      onClick={(e) => handleResolve(id, e)}
                      variant="secondary"
                      size="sm"
                      icon={Check}
                      title="Mark resolved"
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Alert Detail Drawer / Modal */}
      <Modal
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        title={selectedAlert?.title || 'Diagnostic Alert Detail'}
        subtitle={`Logged ${formatDateTime(selectedAlert?.createdAt)}`}
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase border ${getSeverityStyle(selectedAlert.severity).bg}`}>
                Severity: {selectedAlert.severity || 'Medium'}
              </span>
              <Badge variant={selectedAlert.isResolved ? 'success' : 'warning'}>
                {selectedAlert.isResolved ? 'Resolved' : 'Active Issue'}
              </Badge>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950/70 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Diagnostic Message
              </span>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {selectedAlert.message}
              </p>
            </div>

            {selectedAlert.panel && (
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <span className="text-slate-400 font-semibold block">Affected Solar Asset:</span>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {selectedAlert.panel.name || 'Solar Panel'}
                </p>
                {selectedAlert.panel.capacity && (
                  <p className="text-slate-500">Rated Capacity: {selectedAlert.panel.capacity} kW</p>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              {!selectedAlert.isRead && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMarkRead(selectedAlert._id || selectedAlert.id)}
                >
                  Mark as Read
                </Button>
              )}
              {!selectedAlert.isResolved && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Check}
                  onClick={() => handleResolve(selectedAlert._id || selectedAlert.id)}
                >
                  Resolve Alert
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
