import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  UserX,
  MicOff,
  TrendingUp,
  Phone,
  Users,
  Clock,
  Star,
} from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import TrendChart from '@/components/TrendChart';
import WordCloudChart from '@/components/WordCloudChart';
import HeatmapChart from '@/components/HeatmapChart';
import AlertList from '@/components/AlertList';
import { useAppStore } from '@/store/useAppStore';
import { getDailyMetrics, getAlerts } from '@/data/mockData';
import type { AnomalyType } from '@/data/types';
import type { LucideIcon } from 'lucide-react';

import type { DailyMetric } from '@/data/types';

interface MetricConfig {
  key: string;
  title: string;
  unit: string;
  icon: LucideIcon;
  accent: 'purple' | 'orange' | 'emerald' | 'indigo';
  anomalyType: AnomalyType;
  getValue: (metrics: DailyMetric[]) => number;
  formatValue: (v: number) => string;
}

const metricConfigs: MetricConfig[] = [
  {
    key: 'complaint',
    title: '投诉率',
    unit: '%',
    icon: AlertTriangle,
    accent: 'orange',
    anomalyType: 'complaint_word',
    getValue: (m) => m[m.length - 1]?.complaintRate || 0,
    formatValue: (v) => v.toFixed(1),
  },
  {
    key: 'interruption',
    title: '平均打断次数',
    unit: '次/通',
    icon: UserX,
    accent: 'purple',
    anomalyType: 'interruption',
    getValue: (m) => m[m.length - 1]?.avgInterruptions || 0,
    formatValue: (v) => v.toFixed(1),
  },
  {
    key: 'silence',
    title: '沉默时长异常',
    unit: '%',
    icon: MicOff,
    accent: 'indigo',
    anomalyType: 'long_silence',
    getValue: (m) => m[m.length - 1]?.silenceAnomalyRate || 0,
    formatValue: (v) => v.toFixed(1),
  },
  {
    key: 'escalation',
    title: '升级转人工率',
    unit: '%',
    icon: TrendingUp,
    accent: 'orange',
    anomalyType: 'escalation',
    getValue: (m) => m[m.length - 1]?.escalationRate || 0,
    formatValue: (v) => v.toFixed(1),
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const timeRange = useAppStore((s) => s.currentTimeRange);
  const setDrillDownPayload = useAppStore((s) => s.setDrillDownPayload);
  const setDrillDownFilters = useAppStore((s) => s.setDrillDownFilters);

  const dailyMetrics = useMemo(() => getDailyMetrics(timeRange), [timeRange]);
  const today = dailyMetrics[dailyMetrics.length - 1];
  const alerts = useMemo(() => getAlerts(timeRange), [timeRange]);

  const totalCalls = dailyMetrics.reduce((sum, m) => sum + m.totalCalls, 0);
  const avgScore = today?.avgScore || 0;
  const avgDuration = 5 * 60 + 42;
  const onlineAgents = 186;

  const handleMetricClick = (config: MetricConfig) => {
    setDrillDownFilters({
      anomalyType: config.anomalyType,
      dateRange: timeRange,
    });
    setDrillDownPayload({
      anomalyType: config.anomalyType,
      sourcePage: 'dashboard',
      timestamp: Date.now(),
      sourceRange: timeRange,
    });
    navigate('/drilldown');
  };

  const getSparklineData = (key: string) => {
    const keyMap: Record<string, keyof typeof today> = {
      complaint: 'complaintRate',
      interruption: 'avgInterruptions',
      silence: 'silenceAnomalyRate',
      escalation: 'escalationRate',
    };
    const dataKey = keyMap[key];
    return dailyMetrics.map((m) => m[dataKey] as number);
  };

  const getDelta = (config: MetricConfig) => {
    const curr = config.getValue(dailyMetrics);
    const prev = dailyMetrics.length >= 2
      ? config.getValue([dailyMetrics[dailyMetrics.length - 2]])
      : curr;
    if (prev === 0) return 0;
    return Math.round(((curr - prev) / prev) * 100 * 10) / 10;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-medium text-deep-blue-200">
            当前时间范围：
            <span className="text-white font-semibold">
              {timeRange === 'today' ? '今日' : timeRange === 'week' ? '本周' : '近30天'}
            </span>
          </h2>
          <span className="text-xs text-deep-blue-400">
            数据每日 00:00 自动更新
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {metricConfigs.map((config, idx) => (
          <div key={config.key} onClick={() => handleMetricClick(config)}>
            <MetricCard
              title={config.title}
              value={config.formatValue(config.getValue(dailyMetrics))}
              unit={config.unit}
              delta={getDelta(config)}
              deltaLabel="较上一周期"
              icon={config.icon}
              accent={config.accent}
              sparklineData={getSparklineData(config.key)}
              delay={0.05 + idx * 0.05}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="glass-card p-4 xl:col-span-1">
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-3 rounded-lg bg-deep-blue-800/40"
            >
              <div className="flex items-center justify-center gap-1.5 text-deep-blue-300 text-xs mb-1">
                <Phone className="w-3.5 h-3.5" />
                <span>总通话量</span>
              </div>
              <div className="font-display text-2xl font-bold text-white tabular-nums">
                {totalCalls.toLocaleString()}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center p-3 rounded-lg bg-deep-blue-800/40"
            >
              <div className="flex items-center justify-center gap-1.5 text-deep-blue-300 text-xs mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>在线坐席</span>
              </div>
              <div className="font-display text-2xl font-bold text-white">
                {onlineAgents}<span className="text-sm text-deep-blue-400 ml-0.5">/210</span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="text-center p-3 rounded-lg bg-deep-blue-800/40"
            >
              <div className="flex items-center justify-center gap-1.5 text-deep-blue-300 text-xs mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>平均通话</span>
              </div>
              <div className="font-display text-2xl font-bold text-white">
                {Math.floor(avgDuration / 60)}<span className="text-sm text-deep-blue-400 ml-0.5">分{avgDuration % 60}秒</span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center p-3 rounded-lg bg-deep-blue-800/40"
            >
              <div className="flex items-center justify-center gap-1.5 text-deep-blue-300 text-xs mb-1">
                <Star className="w-3.5 h-3.5" />
                <span>客户评分</span>
              </div>
              <div className="font-display text-2xl font-bold text-success-emerald-400 tabular-nums">
                {avgScore.toFixed(1)}
              </div>
            </motion.div>
          </div>

          <div className="mt-4 pt-4 border-t border-deep-blue-700/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-deep-blue-300">AI质检覆盖率</span>
              <span className="text-sm font-medium text-white tabular-nums">68.4%</span>
            </div>
            <div className="h-2 rounded-full bg-deep-blue-800 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '68.4%' }}
                transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-tech-indigo-500 to-tech-purple-500"
              />
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-deep-blue-400">
              <span>AI质检 {Math.floor(totalCalls * 0.684).toLocaleString()} 通</span>
              <span>人工复核 待办 37</span>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <TrendChart metrics={dailyMetrics} timeRange={timeRange} />
        </div>

        <div className="xl:col-span-1">
          <AlertList alerts={alerts} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-2">
          <WordCloudChart timeRange={timeRange} />
        </div>
        <div className="xl:col-span-3">
          <HeatmapChart timeRange={timeRange} />
        </div>
      </div>
    </div>
  );
}
