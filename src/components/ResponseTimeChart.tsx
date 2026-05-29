import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { MonthData, currentMonthIndex } from '../data/metrics';

interface Props {
  animate: boolean;
  baselineMonths: MonthData[];
  aiMonths: MonthData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-black/10 rounded-xl px-3 py-2.5 shadow-lg shadow-black/8">
        <p className="text-xs font-bold text-black/40 uppercase tracking-widest mb-1.5">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: p.stroke }} />
            <span className="text-xs font-semibold text-black">
              {p.name}: {p.value >= 1 ? `${p.value} min` : `${Math.round(p.value * 60)}s`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

export default function ResponseTimeChart({ animate, baselineMonths, aiMonths }: Props) {
  const [opacity, setOpacity] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setOpacity(1), 200);
    return () => clearTimeout(t);
  }, [animate]);

  const data = baselineMonths.map((b, i) => ({
    name: b.shortMonth,
    'Sem IA': b.responseTime,
    'Com IA': i >= currentMonthIndex ? aiMonths[i].responseTime : undefined,
  }));

  return (
    <div className="bg-white border border-black/10 rounded-3xl p-6">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="font-bold text-black text-base">Tempo Medio de Resposta</h3>
          <p className="text-xs text-black/40 mt-0.5">Sem IA: ~2 min · Com IA: menos de 40 segundos</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-extrabold text-black">-72%</div>
          <div className="text-xs text-black/40 font-medium">no tempo de resposta</div>
        </div>
      </div>

      <div style={{ opacity, transition: 'opacity 0.8s ease' }}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#00000008" vertical={false} />
            <XAxis
              dataKey="name"
              hide={isMobile}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#0000006a', fontSize: 11, fontWeight: 600 }}
              dy={8}
            />
            <YAxis
              hide={isMobile}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#0000006a', fontSize: 10 }}
              tickFormatter={(v) => `${v}m`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="Sem IA"
              stroke="#00000030"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={{ r: 3, fill: '#fff', stroke: '#00000040', strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: '#000', strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="Com IA"
              stroke="#000"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#fff', stroke: '#000', strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: '#000', strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Timeline detail */}
      <div className="grid grid-cols-12 gap-1 mt-5 pt-4 border-t border-black/6">
        {aiMonths.map((m, i) => {
          const hasAI = i >= currentMonthIndex;
          return (
            <div key={i} className="text-center">
              <div className="text-xs font-extrabold text-black">
                {hasAI
                  ? (m.responseTime >= 1 ? `${m.responseTime}m` : `${Math.round(m.responseTime * 60)}s`)
                  : '—'}
              </div>
              <div className="text-[10px] text-black/35 font-medium mt-0.5">{m.shortMonth}</div>
              <div
                className="mt-1.5 mx-auto rounded-full bg-black transition-all duration-700"
                style={{
                  width: 6,
                  height: 6,
                  opacity: animate && hasAI ? 1 : 0,
                  transitionDelay: `${i * 150 + 400}ms`,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
