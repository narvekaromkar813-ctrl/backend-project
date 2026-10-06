import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  TrendingDown,
  Calendar,
  IndianRupee,
  CheckCircle,
  Clock,
  Sparkles,
  Download
} from 'lucide-react';
import {
  useBills,
  usePredictBill,
  useMonthlyBills,
  useCreateBill
} from '../hooks/useBillsQuery';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { CardSkeleton, TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { MonthlySavingsChart } from '../components/charts/MonthlySavingsChart';
import { formatCurrency, formatEnergy, formatPercentage } from '../utils/formatters';
import { getStatusBadge } from '../utils/helpers';

export const Bills = () => {
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Form State
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [form, setForm] = useState({
    billingMonth: defaultMonth,
    totalConsumedKWh: '350',
    totalGeneratedKWh: '480',
    tariffPerKWh: '7.50',
    status: 'pending',
    notes: 'Utility DISCOM statement'
  });

  // Queries
  const { data: billsRes, isLoading: billsLoading, error: billsError, refetch: refetchBills } = useBills();
  const { data: predictRes, isLoading: predictLoading } = usePredictBill();
  const { data: monthlyRes, isLoading: monthlyLoading } = useMonthlyBills();

  const createMutation = useCreateBill();

  const bills = billsRes?.bills || [];
  const summary = billsRes?.summary || {};
  const prediction = predictRes?.prediction || {};
  const monthlyBreakdown = monthlyRes?.monthlyBreakdown || [];

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      billingMonth: form.billingMonth,
      totalConsumedKWh: Number(form.totalConsumedKWh),
      totalGeneratedKWh: Number(form.totalGeneratedKWh),
      tariffPerKWh: Number(form.tariffPerKWh),
      status: form.status,
      notes: form.notes
    });
    setIsRecordModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Utility Bills & Solar Savings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {summary.summaryText || 'Track bill history, net payable, and solar tariff offset'}
          </p>
        </div>

        <Button
          onClick={() => setIsRecordModalOpen(true)}
          variant="primary"
          icon={Plus}
          size="sm"
        >
          Record Electricity Bill
        </Button>
      </div>

      {billsError && (
        <ErrorState
          title="Could Not Load Bills"
          message={billsError.response?.data?.message || 'Failed to retrieve billing records.'}
          onRetry={refetchBills}
        />
      )}

      {/* Predicted Upcoming Bill Highlight Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 p-5 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Current Month Projection
              </span>
              <Badge variant="solar" size="sm">
                {predictRes?.currentMonth || defaultMonth}
              </Badge>
            </div>

            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Estimated Net Payable
            </h3>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {formatCurrency(prediction.estimatedNetPayableINR ?? 350)}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-100 dark:bg-navy-950/70 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Bill without Solar:</span>
                <span className="font-semibold line-through text-slate-400">
                  {formatCurrency(prediction.estimatedBillWithoutSolarINR ?? 2800)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Solar Savings:</span>
                <span className="font-bold text-emerald-500">
                  {formatCurrency(prediction.estimatedSavingsINR ?? 2450)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Savings Ratio:</span>
                <span className="font-bold text-amber-500">
                  {formatPercentage(prediction.savingsPercentage ?? 87)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 italic">
            {prediction.summaryText || 'Projected based on month-to-date run rate telemetry.'}
          </p>
        </Card>

        {/* Monthly Savings Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Monthly Savings Breakdown (₹)"
            subtitle="Comparing standard utility costs vs actual net amount payable"
          />
          <CardContent>
            {monthlyLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <MonthlySavingsChart monthlyBreakdown={monthlyBreakdown} height={250} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bill History Table */}
      <Card>
        <CardHeader
          title="Electricity Bills History"
          subtitle="All archived monthly utility statements and net settlement amounts"
        />
        <CardContent className="p-0">
          {billsLoading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : bills.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No Recorded Utility Bills"
              description="Record your monthly electricity bills to track historical solar savings against utility tariffs."
              actionLabel="Record New Bill"
              onAction={() => setIsRecordModalOpen(true)}
              actionIcon={Plus}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-navy-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Billing Month</th>
                    <th className="py-3 px-4">Consumed</th>
                    <th className="py-3 px-4">Generated</th>
                    <th className="py-3 px-4">Gross Cost (No Solar)</th>
                    <th className="py-3 px-4">Solar Savings</th>
                    <th className="py-3 px-4">Net Payable</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {bills.map((b, i) => (
                    <tr
                      key={b._id || b.id || i}
                      className="hover:bg-slate-50/80 dark:hover:bg-navy-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-slate-100">
                        {b.billingMonth}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {formatEnergy(b.totalConsumedKWh)}
                      </td>
                      <td className="py-3 px-4 text-amber-500 font-semibold">
                        {formatEnergy(b.totalGeneratedKWh)}
                      </td>
                      <td className="py-3 px-4 text-slate-400 line-through">
                        {formatCurrency(b.grossAmountWithoutSolar)}
                      </td>
                      <td className="py-3 px-4 text-emerald-500 font-bold">
                        {formatCurrency(b.solarSavings)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {formatCurrency(b.netPayable)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusBadge(b.status)} size="sm">
                          {b.status || 'Paid'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Bill Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Utility Electricity Bill"
        subtitle="Input monthly consumption and generation figures"
      >
        <form onSubmit={handleRecordSubmit} className="space-y-4">
          <Input
            label="Billing Month (YYYY-MM)"
            type="month"
            value={form.billingMonth}
            onChange={(e) => setForm({ ...form, billingMonth: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Total Consumed (kWh)"
              type="number"
              step="1"
              min="0"
              value={form.totalConsumedKWh}
              onChange={(e) => setForm({ ...form, totalConsumedKWh: e.target.value })}
              required
            />

            <Input
              label="Total Solar Generated (kWh)"
              type="number"
              step="1"
              min="0"
              value={form.totalGeneratedKWh}
              onChange={(e) => setForm({ ...form, totalGeneratedKWh: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="DISCOM Tariff Rate (₹/kWh)"
              type="number"
              step="0.05"
              value={form.tariffPerKWh}
              onChange={(e) => setForm({ ...form, tariffPerKWh: e.target.value })}
              required
            />

            <Select
              label="Payment Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={[
                { value: 'paid', label: 'Paid in Full' },
                { value: 'pending', label: 'Pending Payment' },
                { value: 'overdue', label: 'Overdue' },
              ]}
            />
          </div>

          <Input
            label="Notes / Bill Reference"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="e.g. MSEDCL Consumer #12345678"
          />

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRecordModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createMutation.isPending}
            >
              Save Statement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
