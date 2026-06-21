import type { ComponentType } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  User,
  Star,
  AlertTriangle,
  ChevronRight,
  Headphones,
  Users,
  Briefcase,
  MessageCircleOff,
  UserX,
} from 'lucide-react';
import type { CallRecord } from '@/data/types';

const anomalyBadgeConfig: Record<string, { label: string; className: string; icon: ComponentType<{ className?: string }> }> = {
  interruption: { label: '频繁打断', icon: UserX, className: 'bg-tech-purple-500/20 text-tech-purple-300 border-tech-purple-500/30' },
  long_silence: { label: '沉默异常', icon: MessageCircleOff, className: 'bg-tech-indigo-500/20 text-tech-indigo-300 border-tech-indigo-500/30' },
  negative_sentiment: { label: '负面情绪', icon: AlertTriangle, className: 'bg-alert-orange-500/20 text-alert-orange-300 border-alert-orange-500/30' },
  escalation: { label: '升级转人工', icon: Users, className: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  complaint_word: { label: '投诉词', icon: AlertTriangle, className: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  rude_language: { label: '违规用语', icon: AlertTriangle, className: 'bg-red-500/20 text-red-300 border-red-500/30' },
  script_deviation: { label: '流程偏差', icon: Briefcase, className: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
};

interface CallCardProps {
  call: CallRecord;
  index: number;
  selected?: boolean;
  onClick?: () => void;
}

export default function CallCard({ call, index, selected, onClick }: CallCardProps) {
  const navigate = useNavigate();
  const scoreColor = call.customerScore >= 4 ? 'text-success-emerald-400' : call.customerScore >= 3 ? 'text-amber-400' : 'text-alert-orange-400';

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`glass-card-hover p-4 cursor-pointer relative overflow-hidden ${
        selected ? 'border-tech-indigo-500/70 shadow-glow-purple' : ''
      }`}
    >
      {call.sentiment === 'negative' && (
        <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-alert-orange-400 animate-pulse m-3" />
      )}

      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-tech-indigo-500/30 to-tech-purple-600/30 border border-tech-indigo-500/30 flex items-center justify-center">
            <User className="w-5 h-5 text-tech-indigo-300" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-medium text-white">{call.agentName}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-deep-blue-700/60 text-deep-blue-200 font-mono">
              {call.callId.slice(-8)}
            </span>
            <span className={`flex items-center gap-0.5 ${scoreColor}`}>
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-sm font-semibold tabular-nums">{call.customerScore}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-deep-blue-300 mb-2.5">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {call.businessType}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {call.agentGroup.split('-')[1]}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(call.durationSec)}
            </span>
            <span className="font-mono opacity-70">{call.startTime.slice(11)}</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-2">
            {call.anomalyTags.length === 0 ? (
              <span className="anomaly-badge bg-success-emerald-500/15 text-success-emerald-300 border border-success-emerald-500/30">
                无异常
              </span>
            ) : (
              call.anomalyTags.map((tag) => {
                const config = anomalyBadgeConfig[tag] || { label: tag, className: 'bg-deep-blue-600/40 text-deep-blue-200 border border-deep-blue-500/30', icon: AlertTriangle };
                const Icon = config.icon;
                return (
                  <span key={tag} className={`anomaly-badge border ${config.className}`}>
                    <Icon className="w-3 h-3" />
                    {config.label}
                  </span>
                );
              })
            )}
          </div>

          {call.escalated && call.escalationReason && (
            <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded px-2.5 py-1.5">
              <span className="font-medium">升级原因：</span>
              {call.escalationReason}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate('/drilldown');
            }}
            className="p-2 rounded-lg bg-tech-indigo-500/20 text-tech-indigo-300 border border-tech-indigo-500/30 hover:bg-tech-indigo-500/30 transition-all"
            title="收听录音"
          >
            <Headphones className="w-4 h-4" />
          </button>
          <ChevronRight className="w-5 h-5 text-deep-blue-400" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-tech-indigo-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}
