import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceDot
} from 'recharts';
import { MonthData, currentMonthIndex } from '../data/metrics';

interface Props {
  baseRevenue: number;
  animate: boolean;
  baselineMonths: MonthData[];
  aiMonths: MonthData[];
}

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}K`;
  return `R$ ${value.toLocaleString('pt-BR')}`;
}

function formatCurrencyFull(value: number) {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-black/10 rounded-2xl px-4 py-3 shadow-xl shadow-black/8 min-w-[180px]">
        <p className="text-xs font-bold uppercase tracking-widest text-black/40 mb-3">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-4 mb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
              <span className="text-xs font-medium text-black/60">{entry.name}</span>
            </div>
            <span className="text-xs font-bold text-black">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Pino customizado para marcar o mês atual
const CurrentMonthPin = (props: any) => {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy - 24} r="8" fill="#000" opacity="0.15">
        <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.15;0;0.15" dur="2s" repeatCount="indefinite" />
      </circle>
      <path
        d={`M${cx},${cy - 8} L${cx},${cy - 18}`}
        stroke="#000"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy - 22} r="5" fill="#000" stroke="#fff" strokeWidth="2" />
      <text x={cx} y={cy - 32} textAnchor="middle" fill="#000" fontSize="9" fontWeight="700">
        INÍCIO
      </text>
    </g>
  );
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

export default function RevenueChart({ baseRevenue, animate, baselineMonths, aiMonths }: Props) {
  const [progress, setProgress] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!animate) return;
    const start = performance.now();
    const duration = 2200;
    const frame = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p < 1) requestAnimationFrame(frame);
    };
    const id = setTimeout(() => requestAnimationFrame(frame), 200);
    return () => clearTimeout(id);
  }, [animate]);

  const currentMonthName = baselineMonths[currentMonthIndex].month;
  const totalMonths = baselineMonths.length;

  const data = baselineMonths.map((b, i) => {
    const ai = aiMonths[i];
    const baseVal = Math.round(baseRevenue * b.revenueMultiplier);
    const aiVal = Math.round(baseRevenue * ai.revenueMultiplier);

    // Antes do mês atual: com IA não existe (undefined)
    // A partir do mês atual: progressão gradual com animação
    const isAfterImpl = i >= currentMonthIndex;
    const animatedAiVal = isAfterImpl
      ? Math.round(baseVal + (aiVal - baseVal) * progress)
      : undefined;

    // Controle de revelação progressiva dos meses com IA
    const monthsToReveal = Math.floor(progress * (totalMonths - currentMonthIndex));
    const showAi = isAfterImpl && (i - currentMonthIndex) <= monthsToReveal;

    return {
      name: b.shortMonth,
      fullName: b.month,
      'Sem IA': baseVal,
      'Com IA': showAi ? animatedAiVal : undefined,
      isCurrentMonth: b.isCurrentMonth,
    };
  });

  // Calcular ganhos apenas dos meses com implementação (do mês atual em diante)
  const monthsWithAI = aiMonths.filter((_, i) => i >= currentMonthIndex);
  const totalGainPct = Math.round(((aiMonths[aiMonths.length - 1].revenueMultiplier / baselineMonths[baselineMonths.length - 1].revenueMultiplier) - 1) * 100);
  const totalGainAccumulated = monthsWithAI.reduce(
    (sum, m, idx) => {
      const realIdx = currentMonthIndex + idx;
      const semIA = Math.round(baseRevenue * baselineMonths[realIdx].revenueMultiplier);
      const comIA = Math.round(baseRevenue * m.revenueMultiplier);
      return sum + (comIA - semIA);
    },
    0
  );

  // Dados para a tabela (12 meses)
  const tableData = baselineMonths.map((b, i) => {
    const ai = aiMonths[i];
    const semIA = Math.round(baseRevenue * b.revenueMultiplier);
    const comIA = Math.round(baseRevenue * ai.revenueMultiplier);
    return {
      month: b.month,
      shortMonth: b.shortMonth,
      semIA,
      comIA,
      diff: comIA - semIA,
      isCurrentMonth: b.isCurrentMonth,
      hasAI: i >= currentMonthIndex,
    };
  });

  const totalSemIA = tableData.reduce((sum, d) => sum + d.semIA, 0);
  const totalComIA = tableData.reduce((sum, d) => sum + d.comIA, 0);
  const totalDiff = totalComIA - totalSemIA;

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: `Ganho Acumulado (${monthsWithAI.length} meses)`, value: formatCurrency(totalGainAccumulated), sub: 'estimativa conservadora' },
          { label: 'Aumento Máximo', value: `+${totalGainPct}%`, sub: 'sobre o faturamento base' },
          { label: 'Projeção Anualizada', value: formatCurrency(totalComIA), sub: 'faturamento total com IA' },
        ].map((item, i) => (
          <div key={i} className="bg-black rounded-2xl px-5 py-4">
            <div className="text-xl font-extrabold text-white leading-tight">{item.value}</div>
            <div className="text-xs font-semibold text-white/50 mt-1">{item.label}</div>
            <div className="text-[10px] text-white/30 mt-0.5">{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white border border-black/10 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-black text-base">Evolução do Faturamento — Ano Completo</h3>
            <p className="text-xs text-black/40 mt-0.5">Projeção a partir de {currentMonthName} (implementação do agente de IA)</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-black/20" />
              <span className="text-black/40">Sem IA</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-black" />
              <span className="text-black">Com IA</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12">
                <circle cx="6" cy="3.5" r="3" fill="#000" stroke="#fff" strokeWidth="1.5" />
                <path d="M6 6.5 L6 11" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span className="text-black/60">Início</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 30, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradBaseline" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#000" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#000" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="gradAI" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#000" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#000" stopOpacity={0.03} />
              </linearGradient>
            </defs>
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
              tickFormatter={formatCurrency}
              hide={isMobile}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#0000006a', fontSize: 10, fontWeight: 500 }}
              width={isMobile ? 0 : 70}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Linha vertical tracejada no mês atual */}
            <ReferenceLine
              x={baselineMonths[currentMonthIndex].shortMonth}
              stroke="#000"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              opacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="Sem IA"
              stroke="#00000030"
              strokeWidth={2}
              fill="url(#gradBaseline)"
              strokeDasharray="5 4"
              dot={false}
              activeDot={{ r: 4, fill: '#000', strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="Com IA"
              stroke="#000000"
              strokeWidth={2.5}
              fill="url(#gradAI)"
              dot={false}
              activeDot={{ r: 5, fill: '#000', strokeWidth: 0 }}
              connectNulls={false}
            />
            {/* Pino no mês atual */}
            <ReferenceDot
              x={baselineMonths[currentMonthIndex].shortMonth}
              y={data[currentMonthIndex]?.['Com IA'] ?? baseRevenue}
              shape={<CurrentMonthPin />}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela Comparativa */}
      <div className="bg-white border border-black/10 rounded-3xl p-6">
        <div className="mb-5">
          <h3 className="font-bold text-black text-base">Comparativo Mensal Detalhado</h3>
          <p className="text-xs text-black/40 mt-0.5">Faturamento projetado com e sem IA — ano completo</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-black/10">
                <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-black/40">Mês</th>
                <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-widest text-black/40">Sem IA</th>
                <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-widest text-black/40">Com IA</th>
                <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-widest text-black/40">Diferença</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, i) => (
                <tr
                  key={i}
                  className={`border-b border-black/5 transition-colors ${
                    row.isCurrentMonth
                      ? 'bg-black/[0.04]'
                      : 'hover:bg-black/[0.02]'
                  }`}
                >
                  <td className="py-3 px-4 font-semibold text-black flex items-center gap-2">
                    {row.isCurrentMonth && (
                      <span className="inline-flex items-center justify-center w-5 h-5 bg-black rounded-full flex-shrink-0">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <circle cx="5" cy="2.5" r="2" fill="white" />
                          <path d="M5 4.5 L5 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </span>
                    )}
                    {row.month}
                    {row.isCurrentMonth && (
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                        Início
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-black/60 font-medium tabular-nums">
                    {formatCurrencyFull(row.semIA)}
                  </td>
                  <td className="py-3 px-4 text-right text-black font-bold tabular-nums">
                    {row.hasAI ? formatCurrencyFull(row.comIA) : '—'}
                  </td>
                  <td className={`py-3 px-4 text-right font-bold tabular-nums ${
                    row.diff > 0 && row.hasAI ? 'text-emerald-600' : 'text-black/30'
                  }`}>
                    {row.diff > 0 && row.hasAI ? `+${formatCurrencyFull(row.diff)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-black/15 bg-black/[0.03]">
                <td className="py-4 px-4 font-extrabold text-black text-sm uppercase tracking-wide">Total</td>
                <td className="py-4 px-4 text-right text-black/70 font-bold text-sm tabular-nums">
                  {formatCurrencyFull(totalSemIA)}
                </td>
                <td className="py-4 px-4 text-right text-black font-extrabold text-sm tabular-nums">
                  {formatCurrencyFull(totalComIA)}
                </td>
                <td className="py-4 px-4 text-right font-extrabold text-sm tabular-nums text-emerald-600">
                  +{formatCurrencyFull(totalDiff)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
