import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getHeatmapData, BUSINESS_TYPES, AGENT_GROUPS } from '@/data/mockData';
import type { TimeRange } from '@/data/types';

interface HeatmapChartProps {
  timeRange: TimeRange;
}

function getHeatColor(value: number): string {
  if (value >= 70) return 'rgba(255, 107, 53, 0.85)';
  if (value >= 50) return 'rgba(255, 138, 80, 0.65)';
  if (value >= 35) return 'rgba(245, 158, 11, 0.5)';
  if (value >= 20) return 'rgba(99, 102, 241, 0.4)';
  return 'rgba(99, 102, 241, 0.15)';
}

export default function HeatmapChart({ timeRange }: HeatmapChartProps) {
  const heatmapData = useMemo(() => getHeatmapData(timeRange), [timeRange]);
  const maxValue = Math.max(...heatmapData.map((d) => d.value));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="glass-card p-5"
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-white">异常分布热力图</h3>
          <p className="text-xs text-deep-blue-300 mt-0.5">业务类型 × 坐席组</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-deep-blue-300">
          <span>低</span>
          <div className="flex h-3">
            {[0, 20, 35, 50, 70].map((v) => (
              <div
                key={v}
                className="w-4 h-3"
                style={{ backgroundColor: getHeatColor(v + 1) }}
              />
            ))}
          </div>
          <span>高</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="flex ml-24 mb-2">
            {AGENT_GROUPS.map((g) => (
              <div
                key={g}
                className="flex-1 text-center text-[11px] text-deep-blue-300 font-medium truncate px-1"
                title={g}
              >
                {g.split('-')[0]}
              </div>
            ))}
          </div>

          {BUSINESS_TYPES.map((business) => (
            <div key={business} className="flex items-center mb-1">
              <div className="w-24 text-xs text-deep-blue-200 pr-3 text-right truncate" title={business}>
                {business}
              </div>
              <div className="flex-1 flex gap-1">
                {AGENT_GROUPS.map((group) => {
                  const cell = heatmapData.find(
                    (d) => d.businessType === business && d.agentGroup === group
                  );
                  const value = cell?.value || 0;
                  const intensity = value / maxValue;

                  return (
                    <motion.div
                      key={group}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: Math.random() * 0.3 }}
                      className="flex-1 h-10 rounded-md relative cursor-pointer group transition-all duration-200 hover:scale-105 hover:z-10"
                      style={{
                        backgroundColor: getHeatColor(value),
                        boxShadow: value >= 50 ? `0 0 12px rgba(255, 107, 53, ${intensity * 0.4})` : 'none',
                      }}
                    >
                      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-medium text-white/90">
                        {value}
                      </span>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-deep-blue-900 border border-deep-blue-600 text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20">
                        {business} · {group.split('-')[1]}
                        <br />
                        <span className="text-alert-orange-300">{value} 次异常</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
