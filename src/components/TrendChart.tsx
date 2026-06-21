import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DAILY_METRICS } from '@/data/mockData';

const metricConfig = [
  { key: 'complaintRate', label: '投诉率 (%)', color: '#FF6B35', unit: '%' },
  { key: 'avgInterruptions', label: '平均打断次数', color: '#8B5CF6', unit: '次' },
  { key: 'silenceAnomalyRate', label: '沉默异常率 (%)', color: '#F59E0B', unit: '%' },
  { key: 'escalationRate', label: '升级转人工率 (%)', color: '#EF4444', unit: '%' },
];

export default function TrendChart() {
  const [activeMetrics, setActiveMetrics] = useState<string[]>([
    'complaintRate',
    'avgInterruptions',
  ]);

  const toggleMetric = (key: string) => {
    setActiveMetrics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="glass-card p-5"
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-white">7日质量趋势</h3>
          <p className="text-xs text-deep-blue-300 mt-0.5">近一周核心异常指标波动</p>
        </div>
        <div className="flex gap-2">
          {['7d', '14d', '30d'].map((range, i) => (
            <button
              key={range}
              className={`px-3 py-1 rounded-md text-xs transition-all ${
                i === 0
                  ? 'bg-tech-indigo-500/20 text-tech-indigo-300 border border-tech-indigo-500/40'
                  : 'text-deep-blue-300 hover:bg-deep-blue-700/50 border border-transparent'
              }`}
            >
              {range === '7d' ? '近7天' : range === '14d' ? '近14天' : '近30天'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {metricConfig.map((m) => (
          <button
            key={m.key}
            onClick={() => toggleMetric(m.key)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-all ${
              activeMetrics.includes(m.key)
                ? 'bg-deep-blue-700/60 border-deep-blue-500/50'
                : 'bg-deep-blue-900/40 border-deep-blue-700/30 opacity-50 hover:opacity-80'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: m.color }}
            />
            <span className="text-deep-blue-100">{m.label}</span>
          </button>
        ))}
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={DAILY_METRICS} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
            <defs>
              {metricConfig.map((m) => (
                <linearGradient key={m.key} id={`line-${m.key}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={m.color} stopOpacity={1} />
                  <stop offset="100%" stopColor={m.color} stopOpacity={0.7} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0B1D3A',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: 8,
                boxShadow: '0 0 30px rgba(0,0,0,0.4)',
              }}
              labelStyle={{ color: '#E6EBF5', fontWeight: 600, marginBottom: 4 }}
              itemStyle={{ color: '#C2CFE8', fontSize: 12 }}
            />
            <Legend
              verticalAlign="top"
              height={0}
              iconType="circle"
              wrapperStyle={{ display: 'none' }}
            />
            {metricConfig
              .filter((m) => activeMetrics.includes(m.key))
              .map((m) => (
                <Line
                  key={m.key}
                  type="monotone"
                  dataKey={m.key}
                  name={m.label}
                  stroke={`url(#line-${m.key})`}
                  strokeWidth={2.5}
                  dot={{
                    r: 3,
                    fill: '#0B1D3A',
                    stroke: m.color,
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 6,
                    fill: m.color,
                    stroke: '#fff',
                    strokeWidth: 2,
                  }}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
