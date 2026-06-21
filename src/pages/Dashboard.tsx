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
import { DAILY_METRICS } from '@/data/mockData';

export default function Dashboard() {
  const today = DAILY_METRICS[DAILY_METRICS.length - 1];
  const yesterday = DAILY_METRICS[DAILY_METRICS.length - 2];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="投诉率"
          value={today.complaintRate.toFixed(1)}
          unit="%"
          delta={((today.complaintRate - yesterday.complaintRate) / yesterday.complaintRate * 100)}
          deltaLabel="较昨日"
          icon={AlertTriangle}
          accent="orange"
          sparklineData={DAILY_METRICS.map((d) => d.complaintRate)}
          drillPath="/drilldown"
          delay={0.05}
        />
        <MetricCard
          title="平均打断次数"
          value={today.avgInterruptions.toFixed(1)}
          unit="次/通"
          delta={((today.avgInterruptions - yesterday.avgInterruptions) / yesterday.avgInterruptions * 100)}
          deltaLabel="较昨日"
          icon={UserX}
          accent="purple"
          sparklineData={DAILY_METRICS.map((d) => d.avgInterruptions)}
          drillPath="/drilldown"
          delay={0.1}
        />
        <MetricCard
          title="沉默时长异常"
          value={today.silenceAnomalyRate.toFixed(1)}
          unit="%"
          delta={((today.silenceAnomalyRate - yesterday.silenceAnomalyRate) / yesterday.silenceAnomalyRate * 100)}
          deltaLabel="较昨日"
          icon={MicOff}
          accent="indigo"
          sparklineData={DAILY_METRICS.map((d) => d.silenceAnomalyRate)}
          drillPath="/drilldown"
          delay={0.15}
        />
        <MetricCard
          title="升级转人工率"
          value={today.escalationRate.toFixed(1)}
          unit="%"
          delta={((today.escalationRate - yesterday.escalationRate) / yesterday.escalationRate * 100)}
          deltaLabel="较昨日"
          icon={TrendingUp}
          accent="orange"
          sparklineData={DAILY_METRICS.map((d) => d.escalationRate)}
          drillPath="/drilldown"
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="glass-card p-4 xl:col-span-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-deep-blue-800/40">
              <div className="flex items-center justify-center gap-1.5 text-deep-blue-300 text-xs mb-1">
                <Phone className="w-3.5 h-3.5" />
                <span>今日通话量</span>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="font-display text-2xl font-bold text-white"
              >
                {today.totalCalls.toLocaleString()}
              </motion.div>
            </div>
            <div className="text-center p-3 rounded-lg bg-deep-blue-800/40">
              <div className="flex items-center justify-center gap-1.5 text-deep-blue-300 text-xs mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>在线坐席</span>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="font-display text-2xl font-bold text-white"
              >
                186<span className="text-sm text-deep-blue-400 ml-0.5">/210</span>
              </motion.div>
            </div>
            <div className="text-center p-3 rounded-lg bg-deep-blue-800/40">
              <div className="flex items-center justify-center gap-1.5 text-deep-blue-300 text-xs mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>平均通话</span>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="font-display text-2xl font-bold text-white"
              >
                5<span className="text-sm text-deep-blue-400 ml-0.5">分42秒</span>
              </motion.div>
            </div>
            <div className="text-center p-3 rounded-lg bg-deep-blue-800/40">
              <div className="flex items-center justify-center gap-1.5 text-deep-blue-300 text-xs mb-1">
                <Star className="w-3.5 h-3.5" />
                <span>客户评分</span>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="font-display text-2xl font-bold text-success-emerald-400"
              >
                {today.avgScore.toFixed(1)}
              </motion.div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-deep-blue-700/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-deep-blue-300">今日质检覆盖率</span>
              <span className="text-sm font-medium text-white">68.4%</span>
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
              <span>AI质检 1,459 通</span>
              <span>人工复核 待办 37</span>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <TrendChart />
        </div>

        <div className="xl:col-span-1">
          <AlertList />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-2">
          <WordCloudChart />
        </div>
        <div className="xl:col-span-3">
          <HeatmapChart />
        </div>
      </div>
    </div>
  );
}
