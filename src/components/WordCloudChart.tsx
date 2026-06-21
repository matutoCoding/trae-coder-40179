import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { WORD_CLOUD_DATA } from '@/data/mockData';
import type { WordCloudItem } from '@/data/types';

const categoryColors: Record<WordCloudItem['category'], string[]> = {
  complaint: ['#FF6B35', '#FF8A50', '#E04F1A'],
  praise: ['#10B981', '#34D399', '#6EE7B7'],
  neutral: ['#818CF8', '#A78BFA', '#6366F1'],
};

export default function WordCloudChart() {
  const [activeCategory, setActiveCategory] = useState<WordCloudItem['category'] | 'all'>('all');
  const [hovered, setHovered] = useState<WordCloudItem | null>(null);

  const filteredData = useMemo(() => {
    return activeCategory === 'all'
      ? WORD_CLOUD_DATA
      : WORD_CLOUD_DATA.filter((w) => w.category === activeCategory);
  }, [activeCategory]);

  const maxValue = Math.max(...WORD_CLOUD_DATA.map((w) => w.value));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="glass-card p-5 h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">投诉高发词云</h3>
          <p className="text-xs text-deep-blue-300 mt-0.5">字号越大代表出现频次越高</p>
        </div>
        <div className="flex gap-1">
          {[
            { key: 'all', label: '全部' },
            { key: 'complaint', label: '投诉' },
            { key: 'praise', label: '好评' },
          ].map((c) => (
            <button
              key={c.key}
              onClick={() => setActiveCategory(c.key as WordCloudItem['category'] | 'all')}
              className={`px-2.5 py-1 rounded text-xs transition-all ${
                activeCategory === c.key
                  ? 'bg-tech-indigo-500/25 text-tech-indigo-300 border border-tech-indigo-500/40'
                  : 'text-deep-blue-300 hover:bg-deep-blue-700/50 border border-transparent'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[280px] flex flex-wrap items-center justify-center content-center gap-x-4 gap-y-3 p-4 overflow-hidden">
        {filteredData.map((item, idx) => {
          const sizeRatio = item.value / maxValue;
          const fontSize = 12 + sizeRatio * 28;
          const colors = categoryColors[item.category];
          const color = colors[idx % colors.length];
          const opacity = 0.6 + sizeRatio * 0.4;

          return (
            <motion.span
              key={item.text}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity, scale: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.02 }}
              onMouseEnter={() => setHovered(item)}
              onMouseLeave={() => setHovered(null)}
              className="relative cursor-pointer select-none transition-all duration-200 hover:scale-110"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 600,
                fontSize,
                color,
                textShadow: `0 0 12px ${color}40`,
              }}
            >
              {item.text}
            </motion.span>
          );
        })}
      </div>

      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-deep-blue-900/95 border border-tech-indigo-500/40 text-sm backdrop-blur-sm shadow-glow-purple"
        >
          <span className="text-white font-medium">{hovered.text}</span>
          <span className="mx-2 text-deep-blue-400">·</span>
          <span className="text-tech-indigo-300">出现 {hovered.value} 次</span>
        </motion.div>
      )}
    </motion.div>
  );
}
