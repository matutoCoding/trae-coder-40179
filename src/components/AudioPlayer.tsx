import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  Maximize2,
  Repeat,
  GripVertical,
} from 'lucide-react';

interface AudioPlayerProps {
  durationMs: number;
  currentMs: number;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onSeek: (ms: number) => void;
}

export default function AudioPlayer({
  durationMs,
  currentMs,
  isPlaying,
  onPlayToggle,
  onSeek,
}: AudioPlayerProps) {
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const progress = durationMs > 0 ? (currentMs / durationMs) * 100 : 0;

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(pct * durationMs);
  };

  const waveformBars = 40;
  const bars = Array.from({ length: waveformBars }, (_, i) => {
    const seed = Math.sin(i * 12.9898) * 43758.5453;
    return 20 + Math.abs(seed % 1) * 80;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 sticky bottom-0 z-20"
    >
      <div className="flex items-center gap-2 mb-3 text-xs text-deep-blue-300">
        <GripVertical className="w-3.5 h-3.5 text-deep-blue-500" />
        <span>通话录音 · 实时转录</span>
        <span className="ml-auto font-mono text-deep-blue-400">2026-06-22</span>
      </div>

      <div
        ref={progressRef}
        onClick={handleProgressClick}
        className="relative h-16 mb-3 rounded-lg bg-deep-blue-900/60 border border-deep-blue-700/40 overflow-hidden cursor-pointer group"
      >
        <div className="absolute inset-0 flex items-end gap-px px-3 py-2">
          {bars.map((h, i) => {
            const isActive = (i / waveformBars) * 100 <= progress;
            return (
              <div
                key={i}
                className="flex-1 rounded-sm transition-all duration-150"
                style={{
                  height: `${h}%`,
                  background: isActive
                    ? 'linear-gradient(to top, #6366F1, #A78BFA)'
                    : 'rgba(99, 102, 241, 0.2)',
                  boxShadow: isActive ? '0 0 8px rgba(99, 102, 241, 0.4)' : 'none',
                }}
              />
            );
          })}
        </div>

        <div
          className="absolute top-0 bottom-0 left-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none"
          style={{ left: `${progress}%` }}
        />

        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
          style={{ left: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between mb-3 text-xs font-mono tabular-nums">
        <span className="text-tech-indigo-300">{formatTime(currentMs)}</span>
        <span className="text-deep-blue-400">{formatTime(durationMs)}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSeek(Math.max(0, currentMs - 5000))}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-deep-blue-200 hover:bg-deep-blue-700/60 hover:text-white transition-all"
            title="后退5秒"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={onPlayToggle}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-tech-indigo-500 to-tech-purple-600 text-white flex items-center justify-center shadow-glow-purple hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button
            onClick={() => onSeek(Math.min(durationMs, currentMs + 5000))}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-deep-blue-200 hover:bg-deep-blue-700/60 hover:text-white transition-all"
            title="前进5秒"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-deep-blue-300 hover:bg-deep-blue-700/60 hover:text-white transition-all ml-1">
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-deep-blue-800/60">
            <button onClick={() => setIsMuted(!isMuted)} className="text-deep-blue-200 hover:text-white">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume * 100}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value) / 100);
                setIsMuted(false);
              }}
              className="w-20 h-1 accent-tech-indigo-500"
            />
          </div>
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-deep-blue-300 hover:bg-deep-blue-700/60 hover:text-white transition-all">
            <Download className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-deep-blue-300 hover:bg-deep-blue-700/60 hover:text-white transition-all">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1 mt-3 pt-3 border-t border-deep-blue-700/40">
        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
          <button
            key={speed}
            className={`px-2 py-0.5 rounded text-xs font-mono transition-all ${
              speed === 1
                ? 'bg-tech-indigo-500/30 text-tech-indigo-200 border border-tech-indigo-500/40'
                : 'text-deep-blue-300 hover:bg-deep-blue-700/50'
            }`}
          >
            {speed}x
          </button>
        ))}
        <span className="text-[10px] text-deep-blue-400 ml-2">播放速度</span>
      </div>
    </motion.div>
  );
}
