import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  label: string;
  unit: string;
  baselineValue: number;
  aiValue: number;
  improvement: number;
  description: string;
  inverse: boolean;
  delay?: number;
  animate: boolean;
}

function useCountUp(target: number, duration: number, active: boolean, decimals = 0) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const frame = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [target, duration, active, decimals]);

  return current;
}

export default function KPICard({ label, unit, baselineValue, aiValue, improvement, description, inverse, delay = 0, animate }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (animate) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
  }, [animate, delay]);

  const isTime = unit === 'min';
  const showSeconds = isTime && aiValue < 1;

  const countedAi = useCountUp(aiValue, 1400, visible, showSeconds ? 3 : (aiValue % 1 !== 0 ? 1 : 0));
  const countedImprovement = useCountUp(Math.abs(improvement), 1600, visible, 0);

  const displayAiValue = showSeconds ? Math.round(countedAi * 60) : countedAi;
  const displayUnit = showSeconds ? ' segundos' : unit;

  const formatCompareValue = (val: number) => {
    if (isTime) {
      if (val < 1) {
        return `${Math.round(val * 60)} segundos`;
      }
      return `${val} min`;
    }
    return `${val}${unit}`;
  };

  const isPositive = improvement > 0;

  return (
    <div
      className="bg-white border border-black/10 rounded-3xl p-4 sm:p-6 flex flex-col gap-5 transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms, box-shadow 0.2s ease`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold tracking-widest uppercase text-black/40">{label}</span>
        <div
          className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
            (isPositive && !inverse) || (!isPositive && inverse)
              ? 'bg-black text-white'
              : 'bg-red-50 text-red-600'
          }`}
        >
          {inverse
            ? <TrendingDown size={11} />
            : <TrendingUp size={11} />
          }
          {inverse ? '-' : '+'}{countedImprovement}%
        </div>
      </div>

      {/* Main Value */}
      <div className="space-y-1">
        <div className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-none text-black">
          {displayAiValue}{displayUnit}
        </div>
        <div className="text-xs text-black/35 font-medium">
          com agente de IA
        </div>
      </div>

      {/* Comparison bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium text-black/40">
          <span>Sem IA: {formatCompareValue(baselineValue)}</span>
          <span>Com IA: {formatCompareValue(aiValue)}</span>
        </div>
        <div className="relative h-1.5 bg-black/8 rounded-full overflow-hidden">
          {/* Baseline */}
          <div
            className="absolute left-0 top-0 h-full bg-black/20 rounded-full transition-all duration-1000"
            style={{ width: visible ? `${Math.min((baselineValue / Math.max(baselineValue, aiValue)) * 100, 100)}%` : '0%' }}
          />
        </div>
        <div className="relative h-1.5 bg-black/8 rounded-full overflow-hidden">
          {/* AI */}
          <div
            className="absolute left-0 top-0 h-full bg-black rounded-full transition-all duration-1400"
            style={{ width: visible ? `${Math.min((aiValue / Math.max(baselineValue, aiValue)) * 100, 100)}%` : '0%' }}
          />
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-black/40 leading-relaxed border-t border-black/6 pt-4">
        {description}
      </p>
    </div>
  );
}
