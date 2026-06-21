import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Filter,
  Calendar,
  Users,
  Briefcase,
  AlertCircle,
  Star,
  ChevronDown,
  X,
  Search,
} from 'lucide-react';
import { AGENT_GROUPS, BUSINESS_TYPES } from '@/data/mockData';

export interface FilterState {
  dateRange: string;
  agentGroup: string;
  businessType: string;
  anomalyType: string;
  minScore: number;
  keyword: string;
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  totalCount: number;
}

const anomalyOptions = [
  { value: 'all', label: '全部异常' },
  { value: 'interruption', label: '频繁打断' },
  { value: 'long_silence', label: '长时间沉默' },
  { value: 'negative_sentiment', label: '客户负面情绪' },
  { value: 'escalation', label: '升级转人工' },
  { value: 'complaint_word', label: '投诉关键词' },
  { value: 'rude_language', label: '坐席违规用语' },
];

export default function FilterBar({ filters, onChange, totalCount }: FilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const updateFilter = (key: keyof FilterState, value: any) => {
    onChange({ ...filters, [key]: value });
    setOpenDropdown(null);
  };

  const clearAll = () => {
    onChange({
      dateRange: 'today',
      agentGroup: 'all',
      businessType: 'all',
      anomalyType: 'all',
      minScore: 0,
      keyword: '',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 mb-4"
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-white mr-2">
          <Filter className="w-4 h-4 text-tech-indigo-400" />
          筛选条件
        </div>

        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'date' ? null : 'date')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-deep-blue-800/60 border border-deep-blue-600/50 text-sm text-deep-blue-100 hover:border-tech-indigo-500/50 transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-tech-indigo-400" />
            {filters.dateRange === 'today' ? '今日' : filters.dateRange === 'week' ? '本周' : '本月'}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {openDropdown === 'date' && (
            <Dropdown>
              {['today', 'week', 'month'].map((v) => (
                <DropdownItem key={v} active={filters.dateRange === v} onClick={() => updateFilter('dateRange', v)}>
                  {v === 'today' ? '今日' : v === 'week' ? '本周' : '本月'}
                </DropdownItem>
              ))}
            </Dropdown>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'group' ? null : 'group')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-deep-blue-800/60 border border-deep-blue-600/50 text-sm text-deep-blue-100 hover:border-tech-indigo-500/50 transition-all"
          >
            <Users className="w-3.5 h-3.5 text-tech-indigo-400" />
            {filters.agentGroup === 'all' ? '全部坐席组' : filters.agentGroup.split('-')[0]}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {openDropdown === 'group' && (
            <Dropdown>
              <DropdownItem active={filters.agentGroup === 'all'} onClick={() => updateFilter('agentGroup', 'all')}>
                全部坐席组
              </DropdownItem>
              {AGENT_GROUPS.map((g) => (
                <DropdownItem key={g} active={filters.agentGroup === g} onClick={() => updateFilter('agentGroup', g)}>
                  {g}
                </DropdownItem>
              ))}
            </Dropdown>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'business' ? null : 'business')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-deep-blue-800/60 border border-deep-blue-600/50 text-sm text-deep-blue-100 hover:border-tech-indigo-500/50 transition-all"
          >
            <Briefcase className="w-3.5 h-3.5 text-tech-indigo-400" />
            {filters.businessType === 'all' ? '全部业务' : filters.businessType}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {openDropdown === 'business' && (
            <Dropdown>
              <DropdownItem active={filters.businessType === 'all'} onClick={() => updateFilter('businessType', 'all')}>
                全部业务
              </DropdownItem>
              {BUSINESS_TYPES.map((b) => (
                <DropdownItem key={b} active={filters.businessType === b} onClick={() => updateFilter('businessType', b)}>
                  {b}
                </DropdownItem>
              ))}
            </Dropdown>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === 'anomaly' ? null : 'anomaly')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-deep-blue-800/60 border border-deep-blue-600/50 text-sm text-deep-blue-100 hover:border-tech-indigo-500/50 transition-all"
          >
            <AlertCircle className="w-3.5 h-3.5 text-alert-orange-400" />
            {anomalyOptions.find((o) => o.value === filters.anomalyType)?.label || '全部异常'}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {openDropdown === 'anomaly' && (
            <Dropdown>
              {anomalyOptions.map((o) => (
                <DropdownItem key={o.value} active={filters.anomalyType === o.value} onClick={() => updateFilter('anomalyType', o.value)}>
                  {o.label}
                </DropdownItem>
              ))}
            </Dropdown>
          )}
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-deep-blue-800/60 border border-deep-blue-600/50">
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-sm text-deep-blue-100">评分 ≤</span>
          <input
            type="number"
            min={0}
            max={5}
            step={0.5}
            value={filters.minScore || ''}
            onChange={(e) => updateFilter('minScore', parseFloat(e.target.value) || 0)}
            className="w-12 bg-deep-blue-900/50 border border-deep-blue-600/30 rounded px-1.5 py-0.5 text-sm text-white text-center outline-none focus:border-tech-indigo-500/50"
            placeholder="5.0"
          />
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-deep-blue-800/60 border border-deep-blue-600/50 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-deep-blue-400" />
          <input
            type="text"
            value={filters.keyword}
            onChange={(e) => updateFilter('keyword', e.target.value)}
            placeholder="搜索通话ID / 坐席姓名..."
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-deep-blue-400"
          />
          {filters.keyword && (
            <X
              className="w-3.5 h-3.5 text-deep-blue-400 cursor-pointer hover:text-white"
              onClick={() => updateFilter('keyword', '')}
            />
          )}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button onClick={clearAll} className="text-xs text-deep-blue-300 hover:text-white flex items-center gap-1">
            <X className="w-3 h-3" />
            清空
          </button>
          <div className="h-5 w-px bg-deep-blue-600/50" />
          <span className="text-sm text-deep-blue-200">
            共 <span className="text-white font-semibold">{totalCount}</span> 条通话
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function Dropdown({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute top-full left-0 mt-1.5 z-30 min-w-[180px] max-h-64 overflow-y-auto py-1.5 rounded-lg bg-deep-blue-900 border border-deep-blue-600/50 shadow-2xl backdrop-blur-xl">
      {children}
    </div>
  );
}

function DropdownItem({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-1.5 text-sm transition-all ${
        active
          ? 'bg-tech-indigo-500/20 text-tech-indigo-200'
          : 'text-deep-blue-100 hover:bg-deep-blue-700/50'
      }`}
    >
      {children}
    </button>
  );
}
