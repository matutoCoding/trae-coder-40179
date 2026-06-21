import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts';

interface MiniSparklineProps {
  data: number[];
  accent: 'purple' | 'orange' | 'emerald' | 'indigo';
}

const colorMap = {
  purple: { stroke: '#A78BFA', fill: 'url(#purple-grad)' },
  orange: { stroke: '#FF8A50', fill: 'url(#orange-grad)' },
  emerald: { stroke: '#34D399', fill: 'url(#emerald-grad)' },
  indigo: { stroke: '#818CF8', fill: 'url(#indigo-grad)' },
};

export default function MiniSparkline({ data, accent }: MiniSparklineProps) {
  const chartData = data.map((v, i) => ({ v, i }));
  const colors = colorMap[accent];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
        <defs>
          <linearGradient id={`purple-grad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={`orange-grad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF8A50" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#FF8A50" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={`emerald-grad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34D399" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={`indigo-grad`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818CF8" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#818CF8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis domain={['dataMin', 'dataMax']} hide />
        <Area
          type="monotone"
          dataKey="v"
          stroke={colors.stroke}
          strokeWidth={2}
          fill={colors.fill}
          dot={false}
          isAnimationActive
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
