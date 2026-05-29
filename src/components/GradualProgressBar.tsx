import { useEffect, useState } from 'react';

interface ProgressItemProps {
  label: string;
  baseline: number;
  target: number;
  unit?: string;
  delay: number;
  animate: boolean;
  inverse?: boolean;
}

function ProgressItem({ label, baseline, target, unit = '%', delay, animate, inverse = false }: ProgressItemProps) {
  const [displayed, setDisplayed] = useState(baseline);

  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => {
      // count up animation
      const start = performance.now();
      const duration = 1600;
      const from = baseline;
      const to = target;
      const frame = (now: number) => {
        const elapsed = now - start;
        const p = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplayed(parseFloat((from + (to - from) * eased).toFixed(target % 1 !== 0 ? 1 : 0)));
        if (p < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }, delay);
    return () => clearTimeout(t);
  }, [animate, target, baseline, delay]);

  const isGood = inverse ? target < baseline : target > baseline;
  const barPct = Math.min((target / 100) * 100, 100);
  const basePct = Math.min((baseline / 100) * 100, 100);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-black/70">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-black/30 font-medium">{baseline}{unit} → </span>
          <span className="text-sm font-extrabold text-black">{displayed}{unit}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isGood ? 'bg-black text-white' : 'bg-red-100 text-red-600'}`}>
            {inverse ? '' : '+'}{Math.round(((target - baseline) / baseline) * 100)}%
          </span>
        </div>
      </div>

      {/* Baseline track */}
      <div className="relative h-2 bg-black/6 rounded-full overflow-hidden">
        {/* Baseline fill */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-black/18 transition-none"
          style={{ width: `${basePct}%` }}
        />
        {/* AI fill */}
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-black"
          style={{
            width: animate ? `${barPct}%` : `${basePct}%`,
            transition: `width 1.6s cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
          }}
        />
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-[10px] text-black/25 font-medium">
        <span>0{unit}</span>
        <span>50{unit}</span>
        <span>100{unit}</span>
      </div>
    </div>
  );
}

interface Props {
  animate: boolean;
}

const progressItems = [
  { label: 'Satisfacao do Cliente', baseline: 62, target: 92, unit: '%', delay: 100 },
  { label: 'Taxa de Conversao', baseline: 18, target: 38, unit: '%', delay: 250 },
  { label: 'Volume de Atendimento', baseline: 68, target: 98, unit: '%', delay: 400 },
  { label: 'Taxa de Resolucao', baseline: 54, target: 91, unit: '%', delay: 550 },
  { label: 'Retencao de Clientes', baseline: 71, target: 94, unit: '%', delay: 700 },
  { label: 'Disponibilidade (24h)', baseline: 45, target: 100, unit: '%', delay: 850 },
];

export default function GradualProgressBar({ animate }: Props) {
  return (
    <div className="bg-white border border-black/10 rounded-3xl p-5 sm:p-8">
      <div className="flex items-start justify-between mb-5 sm:mb-8">
        <div>
          <h3 className="font-bold text-black text-base">Indicadores de Atendimento</h3>
          <p className="text-xs text-black/40 mt-0.5">Evolucao percentual — linha cinza = antes, linha preta = com IA</p>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1.5 rounded bg-black/18" />
            <span className="text-black/40">Sem IA</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1.5 rounded bg-black" />
            <span className="text-black">Com IA</span>
          </div>
        </div>
      </div>

      <div className="space-y-7">
        {progressItems.map((item) => (
          <ProgressItem key={item.label} {...item} animate={animate} />
        ))}
      </div>
    </div>
  );
}
