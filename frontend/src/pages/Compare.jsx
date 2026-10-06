import React from 'react';
import {
  Users,
  Trophy,
  ShieldCheck,
  TrendingUp,
  Award,
  Zap,
  Info,
  RefreshCw
} from 'lucide-react';
import { useNeighborsComparison } from '../hooks/useCompareQuery';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CardSkeleton, TableSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { BenchmarkBarChart } from '../components/charts/BenchmarkBarChart';
import { formatEnergy, formatPercentage } from '../utils/formatters';

export const Compare = () => {
  const { data: compareRes, isLoading, error, refetch } = useNeighborsComparison();

  const userPerf = compareRes?.userPerformance || {};
  const benchmark = compareRes?.neighborhoodBenchmark || {};
  const leaderboard = compareRes?.leaderboard || [];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Neighborhood Peer Benchmark</span>
            <Badge variant="solar" size="sm">
              {compareRes?.region || 'Mumbai Regional Pool'}
            </Badge>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Privacy-preserving comparative yield normalized by installed capacity (kWh/kWp)
          </p>
        </div>

        <Button onClick={refetch} variant="outline" size="sm" icon={RefreshCw}>
          Refresh Leaderboard
        </Button>
      </div>

      {error && (
        <ErrorState
          title="Could Not Load Neighborhood Benchmark"
          message={error.response?.data?.message || 'Failed to retrieve peer comparison pool.'}
          onRetry={refetch}
        />
      )}

      {/* Hero Rank Banner */}
      {isLoading ? (
        <CardSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: User Rank */}
          <Card className="p-5 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-amber-500 tracking-wider">
                Neighborhood Rank
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {userPerf.neighborhoodRank || '#2 of 6'}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Top {userPerf.percentile || 83}th percentile among regional solar homes
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-500 shadow-solar-glow">
              <Trophy className="w-8 h-8" />
            </div>
          </Card>

          {/* Card 2: Normalized Yield */}
          <Card className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Your Specific Yield
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                {userPerf.efficiencyYieldKWhPerKW || 3.6} <span className="text-sm font-normal text-slate-400">kWh/kWp</span>
              </div>
              <p className="text-xs text-emerald-500 font-semibold mt-1">
                {userPerf.performanceVsAverage || '+8.5% vs neighborhood average'}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Zap className="w-7 h-7" />
            </div>
          </Card>

          {/* Card 3: Neighborhood Benchmark Average */}
          <Card className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Regional Average Yield
              </span>
              <div className="text-3xl font-extrabold text-slate-700 dark:text-slate-300 mt-1">
                {benchmark.averageYieldKWhPerKW || 3.46} <span className="text-sm font-normal text-slate-400">kWh/kWp</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Sampled from {benchmark.activeInstallationsSampled || 6} active local plants
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-500">
              <Award className="w-7 h-7" />
            </div>
          </Card>
        </div>
      )}

      {/* Leaderboard Chart */}
      <Card>
        <CardHeader
          title="Comparative Yield Leaderboard"
          subtitle="Specific yield (kWh generated per kW capacity installed) — Your plant highlighted in amber"
        />
        <CardContent>
          <BenchmarkBarChart leaderboard={leaderboard} height={300} />
        </CardContent>
      </Card>

      {/* Leaderboard Detail Table */}
      <Card>
        <CardHeader
          title="Regional Pool Leaderboard Table"
          subtitle={compareRes?.privacyStatement || 'All peer identities and exact locations are strictly anonymized.'}
        />
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton rows={6} cols={5} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-navy-950/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Installation ID</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4">Today's Generation</th>
                    <th className="py-3 px-4">Normalized Yield</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {leaderboard.map((item) => (
                    <tr
                      key={item.id}
                      className={
                        item.isUser
                          ? 'bg-amber-500/10 dark:bg-amber-500/15 font-semibold text-amber-500'
                          : 'hover:bg-slate-50/80 dark:hover:bg-navy-800/40'
                      }
                    >
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          item.rank === 1
                            ? 'bg-amber-500 text-white'
                            : item.rank === 2
                            ? 'bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white'
                            : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {item.rank}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {item.isUser ? (
                          <span className="inline-flex items-center gap-1.5 font-bold text-amber-500">
                            ★ {item.id} (YOU)
                          </span>
                        ) : (
                          item.id
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.systemCapacityKW} kW
                      </td>
                      <td className="py-3.5 px-4">
                        {formatEnergy(item.todayGenerationKWh)}
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        {item.yieldKWhPerKW} kWh/kWp
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
  );
};
