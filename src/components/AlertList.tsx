import type { ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  MicOff,
  UserMinus,
  Hand,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { AlertItem } from '@/data/types';

interface AlertListProps {
  alerts: AlertItem[];
}

const typeConfig: Record<AlertItem['type'], { icon: ComponentType<{ className?: string }>; label: string }> = {
  complaint: { icon: AlertTriangle, label: '投诉词' },
  interruption: { icon: Hand, label: '频繁打断' },
  silence: { icon: MicOff, label: '沉默异常' },
  escalation: { icon: UserMinus, label: '升级转人工' },
};

const anomalyLabelMap: Record<string, string> = {
  complaint_word: '投诉词',
  rude_language: '违规用语',
  negative_sentiment: '负面情绪',
  interruption: '频繁打断',
  long_silence: '沉默异常',
  escalation: '升级转人工',
  script_deviation: '流程偏差',
};

const severityColor: Record<AlertItem['severity'], string> = {
  high: 'bg-alert-orange-500/20 text-alert-orange-300 border-alert-orange-500/40 animate-pulse-glow',
  medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  low: 'bg-tech-indigo-500/15 text-tech-indigo-300 border-tech-indigo-500/30',
};

const severityLabel: Record<AlertItem['severity'], string> = {
  high: '高危',
  medium: '中危',
  low: '低危',
};

export default function AlertList({ alerts }: AlertListProps) {
  const navigate = useNavigate();
  const setDrillDownFilters = useAppStore((s) => s.setDrillDownFilters);
  const setDrillDownPayload = useAppStore((s) => s.setDrillDownPayload);
  const timeRange = useAppStore((s) => s.currentTimeRange);

  const handleAlertClick = (alert: AlertItem) => {
    const anomalyType = alert.anomalyType;
    setDrillDownFilters({
      anomalyType,
      dateRange: timeRange,
    });
    setDrillDownPayload({
      anomalyType,
      callId: alert.callId,
      sourcePage: 'dashboard',
      timestamp: Date.now(),
      sourceRange: timeRange,
    });
    navigate('/drilldown');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className="glass-card p-5 flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alert-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-alert-orange-500" />
            </span>
            实时异常告警
          </h3>
          <p className="text-xs text-deep-blue-300 mt-0.5">AI质检引擎自动检出</p>
        </div>
        <button
          onClick={() => navigate('/drilldown')}
          className="text-xs text-tech-indigo-300 hover:text-tech-indigo-200 flex items-center gap-0.5"
        >
          全部
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {alerts.map((alert, idx) => {
            const config = typeConfig[alert.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                onClick={() => handleAlertClick(alert)}
                className="group relative p-3 rounded-lg bg-deep-blue-800/40 border border-deep-blue-700/40 hover:border-tech-indigo-500/40 hover:bg-deep-blue-700/40 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${severityColor[alert.severity]} border`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-white">{alert.agentName}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${severityColor[alert.severity]} border`}>
                        {severityLabel[alert.severity]}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-deep-blue-700/60 text-deep-blue-200">
                        {anomalyLabelMap[alert.anomalyType] || config.label}
                      </span>
                    </div>
                    <p className="text-xs text-deep-blue-200 truncate">{alert.message}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-deep-blue-400 font-mono">{alert.callId.slice(-6)}</span>
                      <span className="text-[10px] text-deep-blue-400">{alert.timestamp}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-deep-blue-400 group-hover:text-tech-indigo-300 group-hover:translate-x-0.5 transition-all" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
