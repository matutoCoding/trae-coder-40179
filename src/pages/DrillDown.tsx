import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Info, FileText, Link2, Tag } from 'lucide-react';
import FilterBar, { type FilterState } from '@/components/FilterBar';
import CallCard from '@/components/CallCard';
import AudioPlayer from '@/components/AudioPlayer';
import ConversationView from '@/components/ConversationView';
import { CALL_RECORDS, getCallById, getUtterancesByCallId } from '@/data/mockData';
import type { CallRecord } from '@/data/types';

export default function DrillDown() {
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMs, setCurrentMs] = useState(0);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'today',
    agentGroup: 'all',
    businessType: 'all',
    anomalyType: 'all',
    minScore: 0,
    keyword: '',
  });

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentMs((prev) => {
        if (!selectedCall) return 0;
        const next = prev + 250;
        if (next >= selectedCall.durationSec * 1000) {
          setIsPlaying(false);
          return selectedCall.durationSec * 1000;
        }
        return next;
      });
    }, 250);
    return () => clearInterval(timer);
  }, [isPlaying, selectedCall]);

  const filteredCalls = useMemo(() => {
    return CALL_RECORDS.filter((call) => {
      if (filters.agentGroup !== 'all' && call.agentGroup !== filters.agentGroup) return false;
      if (filters.businessType !== 'all' && call.businessType !== filters.businessType) return false;
      if (filters.minScore > 0 && call.customerScore > filters.minScore) return false;
      if (filters.anomalyType !== 'all') {
        if (filters.anomalyType === 'escalation' && !call.escalated) return false;
        if (filters.anomalyType !== 'escalation' && !call.anomalyTags.includes(filters.anomalyType)) return false;
      }
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        if (!call.agentName.toLowerCase().includes(kw) && !call.callId.toLowerCase().includes(kw)) return false;
      }
      return true;
    });
  }, [filters]);

  const utterances = useMemo(() => {
    return selectedCall ? getUtterancesByCallId(selectedCall.callId) : [];
  }, [selectedCall]);

  const handleSelectCall = (call: CallRecord) => {
    setSelectedCall(call);
    setCurrentMs(0);
    setIsPlaying(false);
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      <FilterBar filters={filters} onChange={setFilters} totalCount={filteredCalls.length} />

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-5 gap-4 overflow-hidden">
        <div className="xl:col-span-2 overflow-y-auto pr-1 space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredCalls.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-10 text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-deep-blue-700/40 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-deep-blue-400" />
                </div>
                <p className="text-deep-blue-200 mb-1">暂无符合条件的通话</p>
                <p className="text-sm text-deep-blue-400">请尝试调整筛选条件</p>
              </motion.div>
            ) : (
              filteredCalls.map((call, idx) => (
                <CallCard
                  key={call.callId}
                  call={call}
                  index={idx}
                  selected={selectedCall?.callId === call.callId}
                  onClick={() => handleSelectCall(call)}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        <div className="xl:col-span-3 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedCall ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full gap-4"
              >
                <div className="glass-card p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{selectedCall.agentName}</h3>
                        <span className="text-xs px-2 py-0.5 rounded bg-deep-blue-700/60 text-deep-blue-200 font-mono">
                          {selectedCall.callId}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <svg
                              key={s}
                              className={`w-4 h-4 ${
                                s <= Math.round(selectedCall.customerScore)
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-deep-blue-600'
                              }`}
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                          <span className="ml-1 text-sm font-semibold text-amber-400">
                            {selectedCall.customerScore.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-deep-blue-300">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {selectedCall.businessType}
                        </span>
                        <span>{selectedCall.agentGroup}</span>
                        <span className="font-mono">{selectedCall.startTime}</span>
                        <span>时长 {Math.floor(selectedCall.durationSec / 60)}分{selectedCall.durationSec % 60}秒</span>
                        <span>打断 {selectedCall.interruptionCount} 次</span>
                        <span>沉默 {Math.round(selectedCall.silenceDurationMs / 1000)} 秒</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCall(null)}
                      className="xl:hidden p-2 rounded-lg bg-deep-blue-700/50 text-deep-blue-200"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </div>

                  {selectedCall.escalationReason && (
                    <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-rose-200 mb-0.5">升级转人工原因</div>
                        <div className="text-xs text-rose-300">{selectedCall.escalationReason}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="glass-card p-5 flex-1 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-tech-indigo-400" />
                      通话转写文本
                    </h4>
                    <span className="text-[11px] text-deep-blue-400">点击任意文本跳转至对应音频位置</span>
                  </div>
                  <ConversationView
                    utterances={utterances}
                    currentMs={currentMs}
                    onSeek={(ms) => {
                      setCurrentMs(ms);
                    }}
                  />
                </div>

                <AudioPlayer
                  durationMs={selectedCall.durationSec * 1000}
                  currentMs={currentMs}
                  isPlaying={isPlaying}
                  onPlayToggle={() => setIsPlaying(!isPlaying)}
                  onSeek={(ms) => setCurrentMs(ms)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card p-10 flex-1 flex flex-col items-center justify-center text-center"
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-tech-indigo-500/20 to-tech-purple-600/20 border border-tech-indigo-500/30 flex items-center justify-center mb-5"
                >
                  <FileText className="w-10 h-10 text-tech-indigo-300" />
                </motion.div>
                <h3 className="text-lg font-semibold text-white mb-2">选择左侧通话查看详情</h3>
                <p className="text-sm text-deep-blue-300 max-w-sm">
                  从通话列表中选择一条异常通话，查看完整转写文本和音频播放，
                  精准定位问题话术与服务疏漏。
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3 text-center max-w-md">
                  {[
                    { label: '对话文本', desc: '时间轴标注' },
                    { label: '异常高亮', desc: '一键定位' },
                    { label: '音频同步', desc: '点击跳转' },
                  ].map((f) => (
                    <div key={f.label} className="p-3 rounded-lg bg-deep-blue-800/40">
                      <div className="text-sm font-medium text-white">{f.label}</div>
                      <div className="text-[11px] text-deep-blue-400 mt-0.5">{f.desc}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
