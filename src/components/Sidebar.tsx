import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  SearchX,
  FileText,
  PhoneCall,
  Signal,
  BarChart3,
  Bell,
  Settings,
  ChevronRight,
  User,
} from 'lucide-react';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: '总览大屏', desc: '核心指标与趋势' },
  { path: '/drilldown', icon: SearchX, label: '异常下钻', desc: '通话详情分析' },
  { path: '/weekly', icon: FileText, label: '周报生成', desc: '会议材料准备' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col bg-deep-blue-900/80 backdrop-blur-xl border-r border-deep-blue-700/60">
      <div className="px-6 py-5 border-b border-deep-blue-700/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tech-indigo-500 to-tech-purple-600 flex items-center justify-center shadow-glow-purple">
            <Signal className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white tracking-wide">QC Insight</h1>
            <p className="text-[11px] text-deep-blue-200">通话质检智能平台</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        <div className="px-3 mb-2 text-[10px] uppercase tracking-widest text-deep-blue-300 font-medium">
          工作台
        </div>
        {menuItems.map((item, idx) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item group relative ${isActive ? 'nav-item-active' : ''}`
            }
          >
            {({ isActive }) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 w-full"
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-tech-indigo-400' : 'text-deep-blue-300 group-hover:text-white'}`} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-[11px] text-deep-blue-300 group-hover:text-deep-blue-100">{item.desc}</div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-all ${isActive ? 'opacity-100 text-tech-indigo-400' : 'opacity-0 group-hover:opacity-50'}`} />
              </motion.div>
            )}
          </NavLink>
        ))}

        <div className="mt-8 px-3 mb-2 text-[10px] uppercase tracking-widest text-deep-blue-300 font-medium">
          数据分析
        </div>
        <div className="nav-item opacity-50 cursor-not-allowed">
          <BarChart3 className="w-5 h-5 text-deep-blue-300" />
          <span className="text-sm">多维度分析</span>
          <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-deep-blue-700 rounded text-deep-blue-200">即将上线</span>
        </div>
        <div className="nav-item opacity-50 cursor-not-allowed">
          <PhoneCall className="w-5 h-5 text-deep-blue-300" />
          <span className="text-sm">通话检索</span>
        </div>
      </nav>

      <div className="px-3 py-4 border-t border-deep-blue-700/40 space-y-1">
        <div className="nav-item">
          <Bell className="w-5 h-5 text-deep-blue-300" />
          <span className="text-sm">告警设置</span>
          <span className="ml-auto w-2 h-2 rounded-full bg-alert-orange-400 animate-pulse" />
        </div>
        <div className="nav-item">
          <Settings className="w-5 h-5 text-deep-blue-300" />
          <span className="text-sm">系统配置</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 mt-2 rounded-lg bg-deep-blue-800/60 border border-deep-blue-700/40">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-tech-purple-500 to-tech-indigo-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">陈总监</div>
            <div className="text-[11px] text-deep-blue-300 truncate">客服中心负责人</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
