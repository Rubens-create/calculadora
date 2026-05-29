import { useEffect, useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { MonthData } from '../data/metrics';

interface Props {
  animate: boolean;
  aiMonths: MonthData[];
}

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-black/10 rounded-xl px-3 py-2.5 shadow-lg shadow-black/8">
        <p className="text-xs font-bold text-black/40 uppercase tracking-widest mb-1.5">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
            <span className="text-xs font-semibold text-black">{p.name}: {p.value}%</span>
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

export default function PerformanceCharts({ animate, aiMonths }: Props) {
  const [radarOpacity, setRadarOpacity] = useState(0);
  const [barData, setBarData] = useState<any[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!animate) return;

    const t1 = setTimeout(() => setRadarOpacity(1), 300);

    const months = aiMonths.map((ai) => ({
      name: ai.shortMonth,
      Satisfacao: 0,
      Conversao: 0,
      Resolucao: 0,
    }));
    setBarData(months);

    aiMonths.forEach((ai, idx) => {
      const delay = 400 + idx * 200;
      setTimeout(() => {
        setBarData(prev => prev.map((d, j) =>
          j === idx
            ? { ...d, Satisfacao: ai.satisfactionRate, Conversao: ai.conversionRate, Resolucao: ai.resolutionRate }
            : d
        ));
      }, delay);
    });

    return () => clearTimeout(t1);
  }, [animate]);

  const radarData = [
    { metric: 'Satisfação', semIA: 62, comIA: 90 },
    { metric: 'Conversão',  semIA: 18, comIA: 30 },
    { metric: 'Resolução',  semIA: 54, comIA: 89 },
    { metric: 'Cobertura',  semIA: 68, comIA: 97 },
    { metric: 'Velocidade', semIA: 30, comIA: 92 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Radar chart */}
      <div className="bg-white border border-black/10 rounded-3xl p-6">
        <div className="mb-5">
          <h3 className="font-bold text-black text-base">Performance Geral</h3>
          <p className="text-xs text-black/40 mt-0.5">Comparativo de indicadores antes e depois da IA</p>
        </div>
        <div style={{ opacity: radarOpacity, transition: 'opacity 0.8s ease' }}>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#00000010" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: '#00000060', fontSize: 11, fontWeight: 600 }}
              />
              <Radar
                name="Sem IA"
                dataKey="semIA"
                stroke="#00000025"
                fill="#00000010"
                strokeWidth={1.5}
              />
              <Radar
                name="Com IA"
                dataKey="comIA"
                stroke="#000"
                fill="#00000020"
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-black/40">
            <div className="w-3 h-0.5 bg-black/25 rounded" />
            Sem IA
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-black">
            <div className="w-3 h-0.5 bg-black rounded" />
            Com IA
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-white border border-black/10 rounded-3xl p-6">
        <div className="mb-5">
          <h3 className="font-bold text-black text-base">Evolucao Mensal dos Indicadores</h3>
          <p className="text-xs text-black/40 mt-0.5">Satisfacao, conversao e resolucao com agente de IA</p>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={barData} barGap={3} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#00000008" vertical={false} />
            <XAxis
              dataKey="name"
              hide={isMobile}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#0000006a', fontSize: 11, fontWeight: 600 }}
            />
            <YAxis
              hide={isMobile}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#0000006a', fontSize: 10 }}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomBarTooltip />} />
            <Bar dataKey="Satisfacao" fill="#000" radius={[3, 3, 0, 0]} maxBarSize={12} isAnimationActive={false} />
            <Bar dataKey="Conversao" fill="#555" radius={[3, 3, 0, 0]} maxBarSize={12} isAnimationActive={false} />
            <Bar dataKey="Resolucao" fill="#aaa" radius={[3, 3, 0, 0]} maxBarSize={12} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-center gap-5 mt-2">
          {[
            { color: '#000', label: 'Satisfacao' },
            { color: '#555', label: 'Conversao' },
            { color: '#aaa', label: 'Resolucao' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs font-semibold text-black/50">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: item.color }} />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
