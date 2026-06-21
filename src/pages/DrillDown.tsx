import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Info, FileText, Link2, Tag, LayoutGrid, List, TrendingUp, Users, Briefcase, MessageSquare, AlertTriangle, X } from 'lucide-react';
import FilterBar from '@/components/FilterBar';
import CallCard from '@/components/CallCard';
import AudioPlayer from '@/components/AudioPlayer';
import ConversationView from '@/components/ConversationView';
import {
  getCallsByTimeRange,
  getCallById,
  getUtterancesByCallId,
  getMostRepresentativeCall,
  getCombinationAnalysis,
  getCallsByCombination,
} from '@/data/mockData';
import { useAppStore } from '@/store/useAppStore';
import type { CallRecord, CombinationCell } from '@/data/types';

type ViewMode = 'list' | 'combination';
type CombinationDim = 'business' | 'group' | 'reason';

export default function DrillDown() {
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMs, setCurrentMs] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [combinationDim, setCombinationDim] = useState<CombinationDim>('business');
  const [highlightedPhrase, setHighlightedPhrase] = useState<string | null>(null);
  const [selectedCombination, setSelectedCombination] = useState<CombinationCell | null>(null);

  const drillDownFilters = useAppStore((s) => s.drillDownFilters);
  const setDrillDownFilters = useAppStore((s) => s.setDrillDownFilters);
  const drillDownPayload = useAppStore((s) => s.drillDownPayload);
  const setCurrentTimeRange = useAppStore((s) => s.setCurrentTimeRange);
  const setDrillDownPayload = useAppStore((s) => s.setDrillDownPayload);

  const activeRange = drillDownFilters.dateRange;

  const conversationRef = useRef<HTMLDivElement>(null);
  const hasAutoSelected = useRef(false);

  const calls = useMemo(() => getCallsByTimeRange(activeRange), [activeRange]);
  const combinationData = useMemo(() => getCombinationAnalysis(activeRange), [activeRange]);

  useEffect(() => {
    hasAutoSelected.current = false;
  }, [activeRange]);

  useEffect(() => {
    if (!drillDownPayload || hasAutoSelected.current) return;

    const { callId, anomalyType, sourceRange } = drillDownPayload;

    if (callId) {
      const call = getCallById(callId, sourceRange);
      if (call) {
        setSelectedCall(call);
        const utterances = getUtterancesByCallId(callId);
        
        let anomalyUtterance = utterances.find((u) => u.anomalyType === anomalyType);
        
        if (!anomalyUtterance && anomalyType !== 'all') {
          const anomalyMap: Record<string, string[]> = {
            'complaint_word': ['complaint_word', 'negative_sentiment'],
            'rude_language': ['rude_language', 'negative_sentiment'],
            'negative_sentiment': ['negative_sentiment', 'complaint_word', 'rude_language'],
            'escalation': ['escalation', 'complaint_word', 'negative_sentiment'],
            'interruption': ['interruption'],
            'long_silence': ['long_silence'],
            'script_deviation': ['script_deviation'],
          };
          const tryTypes = anomalyMap[anomalyType] || [anomalyType];
          for (const t of tryTypes) {
            anomalyUtterance = utterances.find((u) => u.anomalyType === t);
            if (anomalyUtterance) break;
          }
        }
        
        if (!anomalyUtterance) {
          anomalyUtterance = utterances.find((u) => u.anomalyType);
        }
        
        if (anomalyUtterance) {
          setTimeout(() => {
            setCurrentMs(anomalyUtterance.startTimeMs);
            setHighlightedPhrase(anomalyUtterance.utteranceId);
          }, 300);
        }
        hasAutoSelected.current = true;
        return;
      }
    }

    const repCall = getMostRepresentativeCall(activeRange, anomalyType);
    if (repCall) {
      setSelectedCall(repCall);
      const utterances = getUtterancesByCallId(repCall.callId);
      let anomalyUtterance = utterances.find((u) => u.anomalyType === anomalyType);
      
      if (!anomalyUtterance && anomalyType !== 'all') {
        const anomalyMap: Record<string, string[]> = {
          'complaint_word': ['complaint_word', 'negative_sentiment'],
          'rude_language': ['rude_language', 'negative_sentiment'],
          'negative_sentiment': ['negative_sentiment', 'complaint_word', 'rude_language'],
          'escalation': ['escalation', 'complaint_word', 'negative_sentiment'],
          'interruption': ['interruption'],
          'long_silence': ['long_silence'],
          'script_deviation': ['script_deviation'],
        };
        const tryTypes = anomalyMap[anomalyType] || [anomalyType];
        for (const t of tryTypes) {
          anomalyUtterance = utterances.find((u) => u.anomalyType === t);
          if (anomalyUtterance) break;
        }
      }
      
      if (!anomalyUtterance) {
        anomalyUtterance = utterances.find((u) => u.anomalyType);
      }
      
      if (anomalyUtterance) {
        setTimeout(() => {
          setCurrentMs(anomalyUtterance.startTimeMs);
          setHighlightedPhrase(anomalyUtterance.utteranceId);
        }, 300);
      }
      hasAutoSelected.current = true;
    }
  }, [drillDownPayload, activeRange]);

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
    return calls.filter((call) => {
      if (drillDownFilters.agentGroup !== 'all' && call.agentGroup !== drillDownFilters.agentGroup) return false;
      if (drillDownFilters.businessType !== 'all' && call.businessType !== drillDownFilters.businessType) return false;
      if (drillDownFilters.callReason !== 'all' && call.callReason !== drillDownFilters.callReason) return false;
      if (drillDownFilters.minScore > 0 && call.customerScore > drillDownFilters.minScore) return false;
      if (drillDownFilters.anomalyType !== 'all') {
        if (drillDownFilters.anomalyType === 'escalation' && !call.escalated) return false;
        if (drillDownFilters.anomalyType !== 'escalation' && !call.anomalyTags.includes(drillDownFilters.anomalyType)) return false;
      }
      if (drillDownFilters.keyword) {
        const kw = drillDownFilters.keyword.toLowerCase();
        if (!call.agentName.toLowerCase().includes(kw) && !call.callId.toLowerCase().includes(kw)) return false;
      }
      return true;
    });
  }, [calls, drillDownFilters]);

  const utterances = useMemo(() => {
    return selectedCall ? getUtterancesByCallId(selectedCall.callId) : [];
  }, [selectedCall]);

  const handleFilterChange = (filters: typeof drillDownFilters) => {
    if (filters.dateRange !== drillDownFilters.dateRange) {
      setCurrentTimeRange(filters.dateRange);
      setSelectedCall(null);
      setCurrentMs(0);
      setIsPlaying(false);
      setHighlightedPhrase(null);
      setSelectedCombination(null);
    }
    setDrillDownFilters(filters);
  };

  const handleSelectCall = (call: CallRecord) => {
    setSelectedCall(call);
    setCurrentMs(0);
    setIsPlaying(false);
    setHighlightedPhrase(null);
    setDrillDownPayload(null);
  };

  const handleCombinationCellClick = (cell: CombinationCell) => {
    setSelectedCombination(cell);
    setDrillDownFilters({
      businessType: cell.businessType,
      agentGroup: cell.agentGroup,
      callReason: cell.callReason,
    });
    setViewMode('list');
    setDrillDownPayload(null);

    setTimeout(() => {
      const comboCalls = getCallsByCombination(
        activeRange,
        cell.businessType,
        cell.agentGroup,
        cell.callReason
      );
      if (comboCalls.length > 0) {
        const topCall = comboCalls.sort((a, b) => b.anomalyTags.length - a.anomalyTags.length)[0];
        setSelectedCall(topCall);
        setCurrentMs(0);
        setIsPlaying(false);
        const topCallUtterances = getUtterancesByCallId(topCall.callId);
        const anomalyUtterance = topCallUtterances.find((u) => u.anomalyType);
        if (anomalyUtterance) {
          setTimeout(() => {
            setCurrentMs(anomalyUtterance.startTimeMs);
            setHighlightedPhrase(anomalyUtterance.utteranceId);
          }, 200);
        }
      } else {
        setSelectedCall(null);
        setCurrentMs(0);
        setIsPlaying(false);
        setHighlightedPhrase(null);
      }
    }, 50);
  };

  const groupedCombinations = useMemo(() => {
    const groups: Record<string, CombinationCell[]> = {};
    combinationData.forEach((cell) => {
      let key: string;
      if (combinationDim === 'business') key = cell.businessType;
      else if (combinationDim === 'group') key = cell.agentGroup;
      else key = cell.callReason;
      if (!groups[key]) groups[key] = [];
      groups[key].push(cell);
    });
    return Object.entries(groups).map(([name, cells]) => ({
      name,
      totalCalls: cells.reduce((sum, c) => sum + c.totalCalls, 0),
      avgAnomalyRate: Math.round((cells.reduce((sum, c) => sum + c.anomalyRate, 0) / cells.length) * 10) / 10,
      topIssue: cells.sort((a, b) => b.anomalyRate - a.anomalyRate)[0]?.topIssue || '-',
      cells: cells.sort((a, b) => b.anomalyRate - a.anomalyRate),
    })).sort((a, b) => b.avgAnomalyRate - a.avgAnomalyRate);
  }, [combinationData, combinationDim]);

  const handleSeek = (ms: number) => {
    setCurrentMs(ms);
    setHighlightedPhrase(null);
  };

  const dimOptions: { value: CombinationDim; label: string; icon: typeof Briefcase }[] = [
    { value: 'business', label: '按业务类型', icon: Briefcase },
    { value: 'group', label: '按坐席组', icon: Users },
    { value: 'reason', label: '按来电原因', icon: MessageSquare },
  ];

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex p-1 rounded-lg bg-deep-blue-800/60 border border-deep-blue-700/50">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
                viewMode === 'list'
                  ? 'bg-tech-indigo-500/25 text-tech-indigo-200 border border-tech-indigo-500/40'
                  : 'text-deep-blue-300 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              通话列表
            </button>
            <button
              onClick={() => setViewMode('combination')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
                viewMode === 'combination'
                  ? 'bg-tech-indigo-500/25 text-tech-indigo-200 border border-tech-indigo-500/40'
                  : 'text-deep-blue-300 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              组合分析
            </button>
          </div>
        </div>
      </div>

      <FilterBar
        filters={drillDownFilters}
        onChange={handleFilterChange}
        totalCount={filteredCalls.length}
      />

      {viewMode === 'list' ? (
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
              {selectedCombination && !selectedCall ? (
                <motion.div
                  key="combination-empty"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="glass-card p-10 flex-1 flex flex-col items-center justify-center text-center"
                >
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-deep-blue-700/40 flex items-center justify-center mb-5">
                    <FileText className="w-10 h-10 text-deep-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">该组合暂无通话样本</h3>
                  <p className="text-sm text-deep-blue-300 max-w-sm mb-6">
                    当前筛选条件下，「{selectedCombination.businessType} / {selectedCombination.agentGroup} / {selectedCombination.callReason}」组合没有通话记录
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-center max-w-md">
                    <div className="p-3 rounded-lg bg-deep-blue-800/40">
                      <div className="text-2xl font-display font-bold text-alert-orange-400">{selectedCombination.anomalyRate}%</div>
                      <div className="text-[11px] text-deep-blue-400 mt-0.5">异常率</div>
                    </div>
                    <div className="p-3 rounded-lg bg-deep-blue-800/40">
                      <div className="text-2xl font-display font-bold text-deep-blue-200">{selectedCombination.totalCalls}</div>
                      <div className="text-[11px] text-deep-blue-400 mt-0.5">总通话数</div>
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-alert-orange-300 bg-alert-orange-500/10 border border-alert-orange-500/20 px-4 py-2 rounded-lg">
                    主要问题：{selectedCombination.topIssue}
                  </div>
                </motion.div>
              ) : selectedCall ? (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col h-full gap-4"
                >
                  {selectedCombination && (
                    <div className="glass-card p-4 bg-gradient-to-r from-tech-indigo-500/10 to-tech-purple-500/10 border-tech-indigo-500/30">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <LayoutGrid className="w-4 h-4 text-tech-indigo-400" />
                            <span className="text-xs text-tech-indigo-300 font-medium">当前组合分析</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-1 rounded bg-deep-blue-800/60 text-deep-blue-200 border border-deep-blue-700/40">
                              {selectedCombination.businessType}
                            </span>
                            <span className="text-xs text-deep-blue-500">×</span>
                            <span className="text-xs px-2 py-1 rounded bg-deep-blue-800/60 text-deep-blue-200 border border-deep-blue-700/40">
                              {selectedCombination.agentGroup}
                            </span>
                            <span className="text-xs text-deep-blue-500">×</span>
                            <span className="text-xs px-2 py-1 rounded bg-deep-blue-800/60 text-deep-blue-200 border border-deep-blue-700/40">
                              {selectedCombination.callReason}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-deep-blue-300">
                              主要问题：<span className="text-alert-orange-300 font-medium">{selectedCombination.topIssue}</span>
                            </span>
                            <span className="text-deep-blue-400">|</span>
                            <span className="text-deep-blue-300">
                              异常率 <span className="text-alert-orange-400 font-semibold">{selectedCombination.anomalyRate}%</span>
                            </span>
                            <span className="text-deep-blue-400">|</span>
                            <span className="text-deep-blue-300">
                              {selectedCombination.totalCalls} 通通话
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedCombination(null)}
                          className="p-1.5 rounded-lg text-deep-blue-400 hover:bg-deep-blue-700/50 hover:text-white transition-all"
                          title="清除组合筛选"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

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
                          <span>{selectedCall.callReason}</span>
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

                    {drillDownPayload && selectedCall.anomalyTags.length > 0 && (
                      <div className="mt-3 p-3 rounded-lg bg-tech-indigo-500/10 border border-tech-indigo-500/20 flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-tech-indigo-400 mt-0.5 shrink-0 animate-pulse" />
                        <div>
                          <div className="text-sm font-medium text-tech-indigo-200 mb-0.5">已定位异常片段</div>
                          <div className="text-xs text-tech-indigo-300">
                            检测到 {selectedCall.anomalyTags.length} 处异常，已自动定位至首个异常位置
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div ref={conversationRef} className="glass-card p-5 flex-1 overflow-hidden flex flex-col">
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
                      highlightedId={highlightedPhrase}
                      onSeek={handleSeek}
                    />
                  </div>

                  <AudioPlayer
                    durationMs={selectedCall.durationSec * 1000}
                    currentMs={currentMs}
                    isPlaying={isPlaying}
                    onPlayToggle={() => setIsPlaying(!isPlaying)}
                    onSeek={handleSeek}
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
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-deep-blue-300">分组维度：</span>
            <div className="flex p-1 rounded-lg bg-deep-blue-800/60 border border-deep-blue-700/50">
              {dimOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setCombinationDim(opt.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all ${
                      combinationDim === opt.value
                        ? 'bg-tech-indigo-500/25 text-tech-indigo-200 border border-tech-indigo-500/40'
                        : 'text-deep-blue-300 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <div className="ml-auto text-xs text-deep-blue-400">
              共 {groupedCombinations.length} 个分组 · {combinationData.length} 个组合
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            {groupedCombinations.map((group, gIdx) => (
              <motion.div
                key={group.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: gIdx * 0.05 }}
                className="glass-card p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-tech-indigo-500/20 to-tech-purple-500/20 border border-tech-indigo-500/30 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-tech-indigo-300" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{group.name}</h3>
                      <p className="text-xs text-deep-blue-400">
                        {group.totalCalls} 通通话 · 平均异常率 {group.avgAnomalyRate}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-deep-blue-400 mb-1">首要问题</div>
                    <span className="text-sm font-medium text-alert-orange-400">{group.topIssue}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.cells.slice(0, 6).map((cell, cIdx) => (
                    <motion.div
                      key={`${cell.businessType}-${cell.agentGroup}-${cell.callReason}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: gIdx * 0.05 + cIdx * 0.03 }}
                      onClick={() => handleCombinationCellClick(cell)}
                      className="group p-4 rounded-xl bg-deep-blue-800/40 border border-deep-blue-700/40 hover:border-tech-indigo-500/40 hover:bg-deep-blue-700/40 cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-sm font-medium text-white mb-1">
                            {combinationDim !== 'business' && <span className="text-deep-blue-400">{cell.businessType} · </span>}
                            {combinationDim !== 'group' && <span className="text-deep-blue-400">{cell.agentGroup.split('-')[0]} · </span>}
                            {combinationDim !== 'reason' && <span className="text-deep-blue-400">{cell.callReason}</span>}
                          </div>
                          <div className="text-[11px] text-deep-blue-400">
                            {cell.totalCalls} 通通话
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-display font-bold ${
                            cell.anomalyRate >= 6 ? 'text-alert-orange-400' :
                            cell.anomalyRate >= 4 ? 'text-amber-400' : 'text-tech-indigo-300'
                          }`}>
                            {cell.anomalyRate}%
                          </div>
                          <div className="text-[10px] text-deep-blue-400">异常率</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-deep-blue-400">主要问题：</span>
                          <span className="text-[11px] text-alert-orange-300">{cell.topIssue}</span>
                        </div>
                        <span className="text-[11px] text-tech-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity">
                          查看通话 →
                        </span>
                      </div>

                      <div className="mt-3 h-1.5 rounded-full bg-deep-blue-900/60 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(cell.anomalyRate * 8, 100)}%` }}
                          transition={{ duration: 0.8, delay: gIdx * 0.05 + cIdx * 0.05 }}
                          className={`h-full rounded-full ${
                            cell.anomalyRate >= 6
                              ? 'bg-gradient-to-r from-alert-orange-500 to-rose-500'
                              : cell.anomalyRate >= 4
                              ? 'bg-gradient-to-r from-amber-500 to-alert-orange-500'
                              : 'bg-gradient-to-r from-tech-indigo-500 to-tech-purple-500'
                          }`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
