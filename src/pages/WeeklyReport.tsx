import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  FileOutput,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Sparkles,
  Calendar,
  Eye,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getWeeklyInsights, getReportData, generateReportHTML, generateReportText } from '@/data/mockData';
import type { TimeRange } from '@/data/types';

const categoryConfig = {
  problem: {
    label: '常见客户问题',
    icon: AlertTriangle,
    color: 'orange',
    gradient: 'from-alert-orange-500/20 to-alert-orange-500/5',
    border: 'border-alert-orange-500/30',
    accent: 'text-alert-orange-400',
    bgActive: 'bg-alert-orange-500/15',
    bg: 'bg-alert-orange-500/10',
  },
  violation: {
    label: '坐席高频违规句式',
    icon: ThumbsDown,
    color: 'rose',
    gradient: 'from-rose-500/20 to-rose-500/5',
    border: 'border-rose-500/30',
    accent: 'text-rose-400',
    bgActive: 'bg-rose-500/15',
    bg: 'bg-rose-500/10',
  },
  praise: {
    label: '优秀安抚话术',
    icon: ThumbsUp,
    color: 'emerald',
    gradient: 'from-success-emerald-500/20 to-success-emerald-500/5',
    border: 'border-success-emerald-500/30',
    accent: 'text-success-emerald-400',
    bgActive: 'bg-success-emerald-500/15',
    bg: 'bg-success-emerald-500/10',
  },
} as const;

type Category = keyof typeof categoryConfig;

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: 'today', label: '今日' },
  { value: 'week', label: '本周' },
  { value: '30d', label: '近30天' },
];

export default function WeeklyReport() {
  const timeRange = useAppStore((s) => s.currentTimeRange);
  const setCurrentTimeRange = useAppStore((s) => s.setCurrentTimeRange);
  const selectedInsightIds = useAppStore((s) => s.selectedInsightIds);
  const toggleInsightSelection = useAppStore((s) => s.toggleInsightSelection);
  const selectAllInsightsByCategory = useAppStore((s) => s.selectAllInsightsByCategory);
  const clearAllSelections = useAppStore((s) => s.clearAllSelections);

  const [previewMode, setPreviewMode] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const weeklyInsights = useMemo(() => getWeeklyInsights(timeRange), [timeRange]);

  useEffect(() => {
    clearAllSelections();
  }, [timeRange, clearAllSelections]);

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpanded(next);
  };

  const groupedInsights = useMemo(() => {
    return {
      problem: weeklyInsights.filter((i) => i.category === 'problem'),
      violation: weeklyInsights.filter((i) => i.category === 'violation'),
      praise: weeklyInsights.filter((i) => i.category === 'praise'),
    };
  }, [weeklyInsights]);

  const selectedByCategory = useMemo(() => {
    return {
      problem: groupedInsights.problem.filter((i) => selectedInsightIds.has(i.id)).length,
      violation: groupedInsights.violation.filter((i) => selectedInsightIds.has(i.id)).length,
      praise: groupedInsights.praise.filter((i) => selectedInsightIds.has(i.id)).length,
    };
  }, [groupedInsights, selectedInsightIds]);

  const totalSelected = useMemo(() => {
    return weeklyInsights.filter((i) => selectedInsightIds.has(i.id)).length;
  }, [weeklyInsights, selectedInsightIds]);

  const reportData = useMemo(() => {
    const currentIds = new Set(weeklyInsights.filter((i) => selectedInsightIds.has(i.id)).map((i) => i.id));
    return getReportData(timeRange, currentIds);
  }, [timeRange, weeklyInsights, selectedInsightIds]);

  const actionsDisabled = totalSelected === 0;

  const handleCopyReport = () => {
    const text = generateReportText(reportData);
    navigator.clipboard?.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleDownloadReport = () => {
    const html = generateReportHTML(reportData);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `质检报告_${reportData.period}_${reportData.endDate}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const handleShare = () => {
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  const rangeLabel = timeRangeOptions.find((o) => o.value === timeRange)?.label || '本周';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
      <div className="xl:col-span-3 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4.5 h-4.5 text-tech-indigo-400" />
                <span className="text-sm text-deep-blue-300">{rangeLabel}质检洞察</span>
              </div>
              <h2 className="text-xl font-display font-bold text-white">
                {rangeLabel}质检洞察报告
              </h2>
              <p className="text-sm text-deep-blue-300 mt-1">
                勾选下方条目，自动生成可用于周会汇报的会议材料
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex p-1 rounded-lg bg-deep-blue-800/60 border border-deep-blue-700/50">
                {timeRangeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setCurrentTimeRange(opt.value)}
                    className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                      timeRange === opt.value
                        ? 'bg-tech-indigo-500/25 text-tech-indigo-200 border border-tech-indigo-500/40'
                        : 'text-deep-blue-300 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`btn-secondary !py-2 !px-3.5 text-sm ${
                    previewMode ? '!bg-tech-indigo-500/25 !border-tech-indigo-500/50 !text-tech-indigo-200' : ''
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  {previewMode ? '返回编辑' : '预览报告'}
                </button>
                <button onClick={clearAllSelections} className="btn-ghost text-sm">
                  清空选择
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['problem', 'violation', 'praise'] as Category[]).map((cat) => {
              const cfg = categoryConfig[cat];
              const Icon = cfg.icon;
              const items = groupedInsights[cat];
              const selected = selectedByCategory[cat];
              const allSelected = selected === items.length && items.length > 0;

              return (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: cat === 'problem' ? 0 : cat === 'violation' ? 0.05 : 0.1 }}
                  onClick={() => selectAllInsightsByCategory(cat, !allSelected)}
                  className={`p-4 rounded-xl text-left bg-gradient-to-br ${cfg.gradient} border ${cfg.border} transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                      <Icon className={`w-4.5 h-4.5 ${cfg.accent}`} />
                    </div>
                    {allSelected ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white flex items-center gap-1">
                        <Check className="w-3 h-3" /> 已全选
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-deep-blue-800/60 text-deep-blue-300">
                        点击全选
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-white font-medium mb-0.5">{cfg.label}</div>
                  <div className={`text-2xl font-display font-bold ${cfg.accent}`}>
                    {selected}<span className="text-sm font-normal text-deep-blue-400"> / {items.length}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {(['problem', 'violation', 'praise'] as Category[]).map((cat, catIdx) => {
          const cfg = categoryConfig[cat];
          const Icon = cfg.icon;
          const items = groupedInsights[cat];

          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + catIdx * 0.1 }}
              className="glass-card p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${cfg.accent}`} />
                </div>
                <h3 className="text-base font-semibold text-white">{cfg.label}</h3>
                <span className="text-xs text-deep-blue-400">共 {items.length} 条</span>
              </div>

              <div className="space-y-2.5">
                {items.map((item, idx) => {
                  const isSelected = selectedInsightIds.has(item.id);
                  const isExpanded = expanded.has(item.id);

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`group rounded-xl border transition-all ${
                        isSelected
                          ? `${cfg.bgActive} border-current ${cfg.accent.replace('text-', 'border-').replace('400', '500/50')} shadow-[0_0_15px_var(--tw-shadow-color)]`
                          : 'bg-deep-blue-800/30 border-deep-blue-700/40 hover:border-deep-blue-600/50'
                      }`}
                      style={isSelected ? {
                        boxShadow: `0 0 20px ${
                          cat === 'problem' ? 'rgba(255, 107, 53, 0.1)' :
                          cat === 'violation' ? 'rgba(244, 63, 94, 0.1)' :
                          'rgba(16, 185, 129, 0.1)'
                        }`
                      } : {}}
                    >
                      <label className="flex items-start gap-3 p-4 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleInsightSelection(item.id)}
                          className="mt-0.5 w-4 h-4 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-white">{item.title}</span>
                                <span className={`text-[11px] px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.accent} font-medium`}>
                                  {item.frequency} 次
                                </span>
                                {item.agentName && (
                                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-deep-blue-700/60 text-deep-blue-200">
                                    {item.agentName}
                                    {item.score && <span className="ml-1 text-amber-400">★{item.score}</span>}
                                  </span>
                                )}
                              </div>
                              <AnimatePresence>
                                <motion.p
                                  initial={false}
                                  animate={{ height: isExpanded ? 'auto' : 44 }}
                                  className="text-sm text-deep-blue-200 leading-relaxed overflow-hidden"
                                >
                                  {item.content}
                                </motion.p>
                              </AnimatePresence>
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                toggleExpand(item.id);
                              }}
                              className="p-1.5 rounded-lg text-deep-blue-400 hover:bg-deep-blue-700/50 hover:text-white transition-all shrink-0"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </label>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="xl:col-span-1">
        <div className="sticky top-24 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4.5 h-4.5 text-tech-indigo-400" />
              <h3 className="text-sm font-semibold text-white">材料生成</h3>
            </div>

            {previewMode ? (
              <div className="p-3 rounded-lg bg-deep-blue-900/60 border border-deep-blue-700/40 mb-4 max-h-[380px] overflow-y-auto">
                <pre className="text-[11px] text-deep-blue-100 whitespace-pre-wrap font-sans leading-relaxed">
                  {generateReportText(reportData)}
                </pre>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                {(['problem', 'violation', 'praise'] as Category[]).map((cat) => {
                  const cfg = categoryConfig[cat];
                  return (
                    <div
                      key={cat}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-deep-blue-800/40"
                    >
                      <span className="text-xs text-deep-blue-200">{cfg.label}</span>
                      <span className={`text-sm font-semibold font-mono ${cfg.accent}`}>
                        {selectedByCategory[cat]}
                      </span>
                    </div>
                  );
                })}
                <div className="pt-2 border-t border-deep-blue-700/40">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white font-medium">已选条目</span>
                    <span className="text-lg font-display font-bold text-white">{totalSelected}</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-deep-blue-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(totalSelected / weeklyInsights.length) * 100}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-tech-indigo-500 via-tech-purple-500 to-tech-indigo-500"
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={handleDownloadReport}
                disabled={actionsDisabled}
                className={`btn-primary w-full justify-center relative overflow-hidden ${
                  actionsDisabled ? 'opacity-50 cursor-not-allowed grayscale' : ''
                }`}
              >
                <AnimatePresence mode="wait">
                  {downloadSuccess ? (
                    <motion.span
                      key="success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      下载成功
                    </motion.span>
                  ) : (
                    <motion.span
                      key="default"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex items-center gap-2"
                    >
                      <FileOutput className="w-4 h-4" />
                      {actionsDisabled ? '请先勾选条目' : '下载 HTML 会议材料'}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <button
                onClick={handleCopyReport}
                disabled={actionsDisabled}
                className={`btn-secondary w-full justify-center relative overflow-hidden ${
                  actionsDisabled ? 'opacity-50 cursor-not-allowed grayscale' : ''
                }`}
              >
                <AnimatePresence mode="wait">
                  {copySuccess ? (
                    <motion.span
                      key="success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      已复制到剪贴板
                    </motion.span>
                  ) : (
                    <motion.span
                      key="default"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      {actionsDisabled ? '请先勾选条目' : '复制文字版'}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <button
                onClick={handleShare}
                disabled={actionsDisabled}
                className={`btn-ghost w-full justify-center text-deep-blue-200 relative overflow-hidden ${
                  actionsDisabled ? 'opacity-50 cursor-not-allowed grayscale' : ''
                }`}
              >
                <AnimatePresence mode="wait">
                  {shareSuccess ? (
                    <motion.span
                      key="success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 text-success-emerald-400"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      已分享至团队
                    </motion.span>
                  ) : (
                    <motion.span
                      key="default"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      {actionsDisabled ? '请先勾选条目' : '分享给团队'}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4"
          >
            <h4 className="text-xs font-medium text-deep-blue-300 mb-3 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              质检摘要
            </h4>
            <ul className="space-y-2 text-xs text-deep-blue-200">
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-alert-orange-400 mt-1.5 shrink-0" />
                {rangeLabel}投诉率较上一周期上升 <span className="text-alert-orange-400 font-semibold">12.4%</span>，需关注贷款利率相关投诉
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                三组-售后支持违规用语次数环比增加，建议安排专项培训
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-success-emerald-400 mt-1.5 shrink-0" />
                坐席赵子涵、王思琪表现突出，可作为优秀案例分享
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-tech-indigo-400 mt-1.5 shrink-0" />
                AI质检覆盖率已达 <span className="text-tech-indigo-400 font-semibold">68.4%</span>，建议推进人工复核流程
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
