import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Headphones, AlertTriangle, MessageCircleOff } from 'lucide-react';
import type { Utterance } from '@/data/types';

interface ConversationViewProps {
  utterances: Utterance[];
  currentMs: number;
  highlightedId?: string | null;
  onSeek: (ms: number) => void;
}

const anomalyInfo: Record<string, { label: string; color: string }> = {
  complaint_word: { label: '投诉关键词', color: 'bg-alert-orange-500/20 border-alert-orange-500/40 text-alert-orange-200' },
  long_silence: { label: '长时间沉默', color: 'bg-tech-indigo-500/20 border-tech-indigo-500/40 text-tech-indigo-200' },
  rude_language: { label: '违规用语', color: 'bg-rose-500/20 border-rose-500/40 text-rose-200' },
  escalation: { label: '升级诉求', color: 'bg-amber-500/20 border-amber-500/40 text-amber-200' },
};

export default function ConversationView({ utterances, currentMs, highlightedId, onSeek }: ConversationViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasScrolledToHighlight = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    if (highlightedId && !hasScrolledToHighlight.current) {
      const idx = utterances.findIndex((u) => u.utteranceId === highlightedId);
      if (idx >= 0) {
        setTimeout(() => {
          const el = containerRef.current?.children[idx] as HTMLElement;
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            hasScrolledToHighlight.current = true;
          }
        }, 100);
      }
      return;
    }

    const currentIdx = utterances.findIndex((u) => currentMs >= u.startTimeMs && currentMs < u.endTimeMs);
    if (currentIdx >= 0) {
      const el = containerRef.current.children[currentIdx] as HTMLElement;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentMs, utterances, highlightedId]);

  useEffect(() => {
    hasScrolledToHighlight.current = false;
  }, [highlightedId]);

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={containerRef} className="space-y-3 max-h-[calc(100vh-440px)] overflow-y-auto pr-1">
      {utterances.map((u, idx) => {
        const isActive = currentMs >= u.startTimeMs && currentMs < u.endTimeMs;
        const isHighlighted = highlightedId === u.utteranceId;
        const isAgent = u.speaker === 'agent';
        const anomaly = u.anomalyType ? anomalyInfo[u.anomalyType] : null;

        return (
          <motion.div
            key={u.utteranceId}
            initial={{ opacity: 0, x: isAgent ? -20 : 20 }}
            animate={{
              opacity: 1,
              x: 0,
              scale: isActive || isHighlighted ? 1.01 : 1,
            }}
            transition={{ duration: 0.3, delay: idx * 0.03 }}
            onClick={() => onSeek(u.startTimeMs)}
            className={`group relative p-3.5 rounded-xl transition-all duration-300 cursor-pointer ${
              isHighlighted
                ? 'bg-alert-orange-500/15 border-2 border-alert-orange-500/60 shadow-[0_0_25px_rgba(255,107,53,0.25)] animate-pulse-glow'
                : isActive
                ? isAgent
                  ? 'bg-tech-indigo-500/20 border border-tech-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                  : 'bg-deep-blue-700/40 border border-deep-blue-500/40'
                : isAgent
                ? 'bg-tech-indigo-500/8 border border-tech-indigo-500/15 hover:border-tech-indigo-500/30'
                : 'bg-deep-blue-800/30 border border-deep-blue-700/20 hover:border-deep-blue-600/40'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isAgent
                    ? 'bg-gradient-to-br from-tech-indigo-500/40 to-tech-purple-600/40'
                    : 'bg-deep-blue-700/60'
                }`}
              >
                {isAgent ? (
                  <Headphones className="w-4 h-4 text-tech-indigo-300" />
                ) : (
                  <User className="w-4 h-4 text-deep-blue-300" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-medium ${isAgent ? 'text-tech-indigo-200' : 'text-white'}`}>
                    {isAgent ? '坐席' : '客户'}
                  </span>
                  <span className="text-[10px] font-mono text-deep-blue-400 tabular-nums">
                    {formatTime(u.startTimeMs)}
                  </span>
                  {u.emotionScore !== undefined && (
                    <div className="flex items-center gap-0.5 ml-auto">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <div
                          key={lvl}
                          className={`w-1 h-2.5 rounded-sm ${
                            lvl <= Math.ceil(u.emotionScore! * 5)
                              ? u.emotionScore! > 0.5
                                ? 'bg-success-emerald-400'
                                : u.emotionScore! > 0.25
                                ? 'bg-amber-400'
                                : 'bg-alert-orange-400'
                              : 'bg-deep-blue-700'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <p className={`text-sm leading-relaxed ${anomaly ? '' : 'text-deep-blue-50'}`}>
                  {anomaly ? (
                    <span className={`px-1.5 py-0.5 rounded border ${anomaly.color}`}>
                      {u.text}
                    </span>
                  ) : (
                    u.text
                  )}
                </p>

                {anomaly && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-alert-orange-400" />
                    <span className="text-[11px] text-alert-orange-300">{anomaly.label}</span>
                    {u.anomalyType === 'long_silence' && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] text-tech-indigo-300">
                        <MessageCircleOff className="w-3 h-3" />
                        持续 {Math.round((u.endTimeMs - u.startTimeMs) / 1000)} 秒
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-deep-blue-900/80 text-deep-blue-300 border border-deep-blue-600/40">
                点击跳转
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
