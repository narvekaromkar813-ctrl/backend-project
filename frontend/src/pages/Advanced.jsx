import React, { useState } from 'react';
import {
  BatteryCharging,
  Car,
  Leaf,
  Award,
  Plus,
  ShieldCheck,
  CheckCircle,
  Clock,
  Zap,
  Flame,
  TreeDeciduous,
  FileText
} from 'lucide-react';
import {
  useBatteryOptimization,
  useEVScheduler,
  useCarbonSavings,
  useIncentives,
  useCreateIncentiveClaim
} from '../hooks/useAdvancedQuery';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { CardSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { formatCurrency, formatEnergy, formatPercentage } from '../utils/formatters';
import { getStatusBadge } from '../utils/helpers';

export const Advanced = () => {
  const [activeTab, setActiveTab] = useState('battery');
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  // Claim Form State
  const [claimForm, setClaimForm] = useState({
    schemeName: 'PM Surya Ghar: Muft Bijli Yojana (Rooftop Solar Subsidy)',
    subsidyAmount: '78000',
    systemCapacityKW: '5.0'
  });

  // Queries
  const { data: batteryRes, isLoading: batteryLoading } = useBatteryOptimization();
  const { data: evRes, isLoading: evLoading } = useEVScheduler();
  const { data: carbonRes, isLoading: carbonLoading } = useCarbonSavings();
  const { data: incentivesRes, isLoading: incentivesLoading } = useIncentives();

  const createClaimMutation = useCreateIncentiveClaim();

  const battery = batteryRes?.batterySystem || {};
  const ev = evRes?.evSmartCharging || {};
  const evRules = evRes?.scheduleRules || [];
  const carbon = carbonRes?.carbonOffset || {};
  const claims = incentivesRes?.userClaims || [];
  const schemes = incentivesRes?.nationalSchemesAvailable || [];

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    await createClaimMutation.mutateAsync({
      schemeName: claimForm.schemeName,
      subsidyAmount: Number(claimForm.subsidyAmount),
      systemCapacityKW: Number(claimForm.systemCapacityKW)
    });
    setIsClaimModalOpen(false);
  };

  const tabsConfig = [
    { id: 'battery', label: 'Battery Storage', icon: BatteryCharging },
    { id: 'ev', label: 'EV Smart Scheduler', icon: Car },
    { id: 'carbon', label: 'Carbon & Green Offset', icon: Leaf },
    { id: 'incentives', label: 'Government Subsidies', icon: Award, badge: claims.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Advanced Energy Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Lithium storage dispatch, smart EV charging, decarbonization, and subsidies
          </p>
        </div>

        {activeTab === 'incentives' && (
          <Button
            onClick={() => setIsClaimModalOpen(true)}
            variant="primary"
            size="sm"
            icon={Plus}
          >
            Apply for Subsidy
          </Button>
        )}
      </div>

      {/* Tabs navigation */}
      <Tabs
        tabs={tabsConfig}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* TAB 1: BATTERY STORAGE */}
      {activeTab === 'battery' && (
        <div className="space-y-6">
          {batteryLoading ? (
            <CardSkeleton count={3} />
          ) : (
            <>
              {/* Battery Hero Banner */}
              <Card className="p-6 bg-gradient-to-br from-white dark:from-navy-900 via-slate-50 dark:via-navy-850 to-emerald-500/10 border-emerald-500/30">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-bold text-emerald-500 tracking-wider">
                        Operating Mode
                      </span>
                      <Badge variant="success" size="sm">
                        {battery.operatingMode || 'Surplus Solar Absorption'}
                      </Badge>
                    </div>

                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                        {battery.currentChargePercentage ?? 65}%
                      </span>
                      <span className="text-xs text-slate-400">
                        ({battery.storedEnergyKWh ?? 6.5} kWh of {battery.capacityKWh ?? 10.0} kWh Capacity)
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                      {batteryRes?.recommendation || 'Storing daytime solar generation for peak evening load.'}
                    </p>
                  </div>

                  {/* Charge Gauge Progress */}
                  <div className="w-full md:w-64 space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <span>Battery Charge Level</span>
                      <span className="text-emerald-500 font-bold">{battery.currentChargePercentage ?? 65}%</span>
                    </div>
                    <div className="w-full h-4 rounded-full bg-slate-200 dark:bg-navy-950 overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                        style={{ width: `${battery.currentChargePercentage ?? 65}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block text-right">
                      Health Status: {battery.healthPercentage ?? 98}% (Optimal)
                    </span>
                  </div>
                </div>
              </Card>

              {/* Schedule Windows */}
              <Card>
                <CardHeader
                  title="Storage Optimization Dispatch Rules"
                  subtitle="Algorithmic schedule to minimize grid peak tariff draw"
                />
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-navy-950/40">
                    <span className="text-xs font-bold text-amber-500 block mb-1">
                      ☀️ Daytime Solar Charge Window
                    </span>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {batteryRes?.scheduleStrategy?.solarChargeWindow || '09:00 - 15:00'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Absorbs surplus solar generation to eliminate feed-in discount loss.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-navy-950/40">
                    <span className="text-xs font-bold text-rose-500 block mb-1">
                      ⚡ Peak Discharge Window
                    </span>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {batteryRes?.scheduleStrategy?.peakDischargeWindow || '18:00 - 22:00'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Powers household loads directly, dodging expensive DISCOM peak tariffs.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-navy-950/40">
                    <span className="text-xs font-bold text-sky-500 block mb-1">
                      🛡️ Emergency Reserve
                    </span>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {batteryRes?.scheduleStrategy?.overnightReserve || '22:00 - 06:00'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Preserves 20% minimum buffer in case of unexpected grid power failure.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* TAB 2: EV SCHEDULER */}
      {activeTab === 'ev' && (
        <div className="space-y-6">
          {evLoading ? (
            <CardSkeleton count={3} />
          ) : (
            <>
              {/* EV Hero Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-5 border-amber-500/30">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Recommended Charge Window
                  </span>
                  <span className="text-xl font-bold text-amber-500 mt-2 block">
                    {ev.recommendedChargingWindow || '11:00 AM - 03:00 PM'}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    {ev.reason || 'Peak solar generation surplus exceeds base household load.'}
                  </span>
                </Card>

                <Card className="p-5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Estimated Green Range Added
                  </span>
                  <span className="text-2xl font-bold text-emerald-500 mt-2 block">
                    +{ev.estimatedVehicleRangeAddedKm || 95} km
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Zero tailpipe carbon emissions
                  </span>
                </Card>

                <Card className="p-5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Grid Charging Cost Avoided
                  </span>
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 block">
                    {formatCurrency(ev.gridCostAvoidedINR || 108.75)}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Free 100% photovoltaic energy
                  </span>
                </Card>
              </div>

              {/* Charging Rules Table */}
              <Card>
                <CardHeader
                  title="Automated Smart Charging Protocol"
                  subtitle="Dynamically syncs EV charger amperage with rooftop solar generation curve"
                />
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-navy-950/60 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Time Interval</th>
                          <th className="py-3 px-4">Charger Mode</th>
                          <th className="py-3 px-4">Energy Sourcing</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {evRules.map((rule, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-navy-800/40">
                            <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-slate-100">
                              {rule.time}
                            </td>
                            <td className="py-3 px-4 font-semibold text-amber-500">
                              {rule.mode}
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                              {rule.rate}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* TAB 3: CARBON SAVINGS */}
      {activeTab === 'carbon' && (
        <div className="space-y-6">
          {carbonLoading ? (
            <CardSkeleton count={4} />
          ) : (
            <>
              {/* Carbon Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5 border-emerald-500/30 bg-emerald-500/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400">
                      Total CO₂ Avoided
                    </span>
                    <Leaf className="w-5 h-5 text-emerald-500" />
                  </div>
                  <span className="text-3xl font-extrabold text-emerald-500 mt-2 block">
                    {carbon.co2AvoidedKg ?? 1025} kg
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    (~{carbon.co2AvoidedTonnes ?? 1.025} Metric Tonnes)
                  </span>
                </Card>

                <Card className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-slate-400">
                      Trees Equivalent
                    </span>
                    <TreeDeciduous className="w-5 h-5 text-emerald-500" />
                  </div>
                  <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 block">
                    {carbon.treesEquivalent ?? 47} Trees
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Annual seedling absorption equivalent
                  </span>
                </Card>

                <Card className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-slate-400">
                      Thermal Coal Displaced
                    </span>
                    <Flame className="w-5 h-5 text-amber-500" />
                  </div>
                  <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 block">
                    {carbon.coalAvoidedKg ?? 562} kg
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Fossil coal combustion prevented
                  </span>
                </Card>

                <Card className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-slate-400">
                      Clean Energy Harvested
                    </span>
                    <Zap className="w-5 h-5 text-amber-500" />
                  </div>
                  <span className="text-3xl font-extrabold text-amber-500 mt-2 block">
                    {formatEnergy(carbonRes?.totalCleanSolarGeneratedKWh ?? 1250)}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    100% renewable generation
                  </span>
                </Card>
              </div>

              {/* Methodology Explainer */}
              <Card>
                <CardHeader
                  title="Environmental Calculation Methodology"
                  subtitle="Standard carbon accounting factors verified by Central Electricity Authority (CEA) Baseline"
                />
                <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block mb-0.5">
                      Grid Emission Baseline Factor:
                    </span>
                    0.82 kg CO₂ avoided per generated solar kilowatt-hour (CEA India Grid Carbon Intensity).
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block mb-0.5">
                      Tree Carbon Sequestration:
                    </span>
                    1 mature urban tree sequesters approximately 21.77 kg of CO₂ emissions annually.
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/60 border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block mb-0.5">
                      Coal Displaced:
                    </span>
                    0.45 kg of thermal grade bituminous coal combusted per unit of utility grid electricity.
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* TAB 4: INCENTIVES & SUBSIDIES */}
      {activeTab === 'incentives' && (
        <div className="space-y-6">
          {incentivesLoading ? (
            <CardSkeleton count={2} />
          ) : (
            <>
              {/* National Schemes Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schemes.map((scheme, idx) => (
                  <Card key={idx} className="p-5 border-amber-500/30">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {scheme.name}
                        </h4>
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
                          {scheme.benefit}
                        </p>
                      </div>
                      <Badge variant="solar" size="sm">MNRE Approved</Badge>
                    </div>
                    {scheme.eligibility && (
                      <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        Eligibility: {scheme.eligibility}
                      </p>
                    )}
                  </Card>
                ))}
              </div>

              {/* User Submitted Claims Table */}
              <Card>
                <CardHeader
                  title="Your Solar Subsidy Applications & Claims"
                  subtitle="Track government direct benefit transfer (DBT) progress"
                  action={
                    <Button
                      onClick={() => setIsClaimModalOpen(true)}
                      variant="primary"
                      size="sm"
                      icon={Plus}
                    >
                      New Application
                    </Button>
                  }
                />
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-navy-950/60 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Application Number</th>
                          <th className="py-3 px-4">Scheme Name</th>
                          <th className="py-3 px-4">System Capacity</th>
                          <th className="py-3 px-4">Subsidy Amount</th>
                          <th className="py-3 px-4">Claim Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {claims.map((claim) => (
                          <tr key={claim._id || claim.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-800/40">
                            <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                              {claim.applicationNumber || 'PMSG-982314'}
                            </td>
                            <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                              {claim.schemeName}
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                              {claim.systemCapacityKW} kW
                            </td>
                            <td className="py-3 px-4 font-bold text-emerald-500">
                              {formatCurrency(claim.subsidyAmount)}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={getStatusBadge(claim.status)} size="sm">
                                {claim.status || 'Approved'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Subsidy Application Modal */}
      <Modal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        title="Apply for Central Solar Subsidy"
        subtitle="PM Surya Ghar Muft Bijli Yojana Application"
      >
        <form onSubmit={handleClaimSubmit} className="space-y-4">
          <Input
            label="Scheme Program"
            value={claimForm.schemeName}
            onChange={(e) => setClaimForm({ ...claimForm, schemeName: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="System Capacity (kW)"
              type="number"
              step="0.1"
              value={claimForm.systemCapacityKW}
              onChange={(e) => setClaimForm({ ...claimForm, systemCapacityKW: e.target.value })}
              required
            />

            <Input
              label="Eligible Subsidy Claim (₹)"
              type="number"
              value={claimForm.subsidyAmount}
              onChange={(e) => setClaimForm({ ...claimForm, subsidyAmount: e.target.value })}
              required
            />
          </div>

          <p className="text-xs text-slate-400">
            * Note: Requires grid inspection certificate and DISCOM net-metering synchronization.
          </p>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsClaimModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createClaimMutation.isPending}
            >
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
