import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Bell,
  Search,
  Calendar,
  ChevronDown,
  RefreshCw,
  Download,
  Maximize2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: '质检总览大屏', subtitle: '实时掌握全中心服务质量动态' },
  '/drilldown': { title: '异常通话下钻', subtitle: '定位问题通话，追溯具体话术' },
  '/weekly': { title: '周度质检报告', subtitle: '一键生成会议材料与行动项' },
};

export default function Header() {
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || { title: '质检平台', subtitle: '' };
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-6 bg-deep-blue-900/70 backdrop-blur-xl border-b border-deep-blue-700/40">
      <div className="flex items-center gap-4">
        <div>
          <AnimatePresence mode="wait">
            <motion.h2
              key={pageInfo.title}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="text-lg font-display font-semibold text-white"
            >
              {pageInfo.title}
            </motion.h2>
          </AnimatePresence>
          <p className="text-xs text-deep-blue-300">{pageInfo.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-deep-blue-800/60 border border-deep-blue-700/50">
          <Calendar className="w-4 h-4 text-tech-indigo-400" />
          <span className="text-sm text-deep-blue-100 font-mono">
            2026-06-15 ~ 2026-06-22
          </span>
          <ChevronDown className="w-4 h-4 text-deep-blue-300" />
        </div>

        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-deep-blue-800/60 border border-deep-blue-700/50 min-w-[260px]">
          <Search className="w-4 h-4 text-deep-blue-400" />
          <input
            type="text"
            placeholder="搜索通话ID / 坐席姓名 / 关键词..."
            className="flex-1 bg-transparent outline-none text-sm text-deep-blue-50 placeholder:text-deep-blue-400"
          />
          <kbd className="hidden lg:inline-flex text-[10px] px-1.5 py-0.5 rounded bg-deep-blue-700 text-deep-blue-300 font-mono">
            ⌘K
          </kbd>
        </div>

        <button className="w-9 h-9 rounded-lg bg-deep-blue-800/60 border border-deep-blue-700/50 flex items-center justify-center text-deep-blue-200 hover:text-white hover:border-tech-indigo-500/50 transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
        <button className="w-9 h-9 rounded-lg bg-deep-blue-800/60 border border-deep-blue-700/50 flex items-center justify-center text-deep-blue-200 hover:text-white hover:border-tech-indigo-500/50 transition-all">
          <Download className="w-4 h-4" />
        </button>
        <button className="w-9 h-9 rounded-lg bg-deep-blue-800/60 border border-deep-blue-700/50 flex items-center justify-center text-deep-blue-200 hover:text-white hover:border-tech-indigo-500/50 transition-all">
          <Maximize2 className="w-4 h-4" />
        </button>
        <button className="relative w-9 h-9 rounded-lg bg-deep-blue-800/60 border border-deep-blue-700/50 flex items-center justify-center text-deep-blue-200 hover:text-white hover:border-tech-indigo-500/50 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-alert-orange-400 animate-pulse" />
        </button>

        <div className="hidden md:flex flex-col items-end pl-2 border-l border-deep-blue-700/50">
          <span className="text-sm font-mono text-white tabular-nums">
            {currentTime.toLocaleTimeString('zh-CN', { hour12: false })}
          </span>
          <span className="text-[11px] text-deep-blue-300">
            {currentTime.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
          </span>
        </div>
      </div>
    </header>
  );
}
