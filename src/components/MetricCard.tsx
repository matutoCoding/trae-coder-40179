import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MiniSparkline from './MiniSparkline';

interface MetricCardProps {
  title: string;
  value: string;
  unit?: string;
  delta: number;
  deltaLabel: string;
  icon: LucideIcon;
  accent: 'purple' | 'orange' | 'emerald' | 'indigo';
  sparklineData: number[];
  drillPath?: string;
  delay?: number;
}

const accentMap = {
  purple: {
    gradient: 'from-tech-purple-600/20 via-tech-indigo-600/10 to-transparent',
    border: 'border-tech-purple-500/30 hover:border-tech-purple-400/60',
    iconBg: 'bg-tech-purple-500/20 text-tech-purple-400',
    glow: 'hover:shadow-glow-purple',
  },
  orange: {
    gradient: 'from-alert-orange-500/20 via-alert-orange-400/5 to-transparent',
    border: 'border-alert-orange-500/30 hover:border-alert-orange-400/60',
    iconBg: 'bg-alert-orange-500/20 text-alert-orange-400',
    glow: 'hover:shadow-glow-orange',
  },
  emerald: {
    gradient: 'from-success-emerald-500/20 via-success-emerald-400/5 to-transparent',
    border: 'border-success-emerald-500/30 hover:border-success-emerald-400/60',
    iconBg: 'bg-success-emerald-500/20 text-success-emerald-400',
    glow: 'hover:shadow-glow-emerald',
  },
  indigo: {
    gradient: 'from-tech-indigo-600/20 via-tech-indigo-500/5 to-transparent',
    border: 'border-tech-indigo-500/30 hover:border-tech-indigo-400/60',
    iconBg: 'bg-tech-indigo-500/20 text-tech-indigo-400',
    glow: 'hover:shadow-glow-purple',
  },
};

export default function MetricCard({
  title,
  value,
  unit,
  delta,
  deltaLabel,
  icon: Icon,
  accent,
  sparklineData,
  drillPath,
  delay = 0,
}: MetricCardProps) {
  const navigate = useNavigate();
  const config = accentMap[accent];
  const isUp = delta > 0;
  const isPositiveDirection = accent === 'emerald' ? !isUp : isUp;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={() => drillPath && navigate(drillPath)}
      className={`relative overflow-hidden glass-card border ${config.border} ${config.glow} p-5 cursor-pointer transition-all duration-300`}
    >
      <div className={`absolute inset-0 bg-gradient-radial ${config.gradient} pointer-events-none`} />
      <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-white/[0.02] blur-2xl" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-lg ${config.iconBg} flex items-center justify-center`}>
              <Icon className="w-4.5 h-4.5" strokeWidth={2} />
            </div>
            <span className="text-sm text-deep-blue-200">{title}</span>
          </div>

          <div className="flex items-baseline gap-1 pt-2">
            <motion.span
              key={value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="metric-value text-4xl text-white"
            >
              {value}
            </motion.span>
            {unit && <span className="text-deep-blue-300 text-base">{unit}</span>}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <div
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${
                isPositiveDirection
                  ? 'bg-alert-orange-500/15 text-alert-orange-300'
                  : 'bg-success-emerald-500/15 text-success-emerald-300'
              }`}
            >
              {isUp ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {Math.abs(delta)}%
            </div>
            <span className="text-xs text-deep-blue-300">{deltaLabel}</span>
          </div>
        </div>

        <div className="w-24 h-14">
          <MiniSparkline data={sparklineData} accent={accent} />
        </div>
      </div>

      {drillPath && (
        <div className="relative mt-4 pt-3 border-t border-deep-blue-700/40 flex items-center justify-between text-xs text-deep-blue-300">
          <span>点击下钻查看异常详情</span>
          <ArrowUpRight className="w-3.5 h-3.5 rotate-45" />
        </div>
      )}
    </motion.div>
  );
}
