import { useState, useRef } from 'react';
import { DollarSign, ChevronRight, TrendingUp, Info } from 'lucide-react';

interface Props {
  onSubmit: (value: number) => void;
}

export default function InputSection({ onSubmit }: Props) {
  const [raw, setRaw] = useState('');
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadingPhrases = [
    "Analisando faturamento...",
    "Calculando impacto de conversão...",
    "Montando plano personalizado..."
  ];

  const formatDisplay = (val: string) => {
    const num = val.replace(/\D/g, '');
    if (!num) return '';
    return Number(num).toLocaleString('pt-BR');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading) return;
    const digits = e.target.value.replace(/\D/g, '');
    setRaw(digits);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const num = Number(raw);
    if (!raw || num < 1000) {
      setError('Informe um faturamento mensal de ao menos R$ 1.000');
      inputRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setLoadingProgress(0);
    setLoadingPhase(0);

    const startTime = performance.now();
    const duration = 4000;

    const updateProgress = (now: number) => {
      const elapsed = now - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setLoadingProgress(pct);

      if (elapsed < 1300) {
        setLoadingPhase(0);
      } else if (elapsed < 2600) {
        setLoadingPhase(1);
      } else {
        setLoadingPhase(2);
      }

      if (elapsed < duration) {
        requestAnimationFrame(updateProgress);
      } else {
        onSubmit(num);
        setIsLoading(false);
      }
    };

    requestAnimationFrame(updateProgress);
  };

  const presets = [
    { label: 'R$ 10.000', value: 10000 },
    { label: 'R$ 50.000', value: 50000 },
    { label: 'R$ 100.000', value: 100000 },
    { label: 'R$ 500.000', value: 500000 },
  ];

  return (
    <section className="min-h-screen flex flex-col">
      {/* Tela de Loading de Alta Fidelidade */}
      {isLoading && (
        <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center gap-6">
          <div className="relative flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="rgba(0, 0, 0, 0.05)"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="black"
                strokeWidth="5"
                fill="transparent"
                strokeLinecap="round"
                style={{
                  strokeDasharray: '251.2',
                  strokeDashoffset: 251.2 - (251.2 * loadingProgress) / 100,
                  transition: 'stroke-dashoffset 0.1s ease'
                }}
              />
            </svg>
            <span className="absolute text-sm font-extrabold text-black tabular-nums">
              {Math.round(loadingProgress)}%
            </span>
          </div>

          <div className="space-y-1.5 text-center">
            <p className="text-base font-bold text-black tracking-wide h-6">
              {loadingPhrases[loadingPhase]}
            </p>
            <p className="text-xs text-black/35 font-medium tracking-wider uppercase">
              Calculadora Comercial
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-black/10 px-4 py-3 sm:px-8 sm:py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="font-semibold text-sm tracking-wide uppercase">Calculadora</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-black/40 font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-black/30" />
          Simulador de Performance
        </div>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-20">
        <div className="max-w-2xl w-full mx-auto text-center space-y-10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-black/10 rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-black/50">
            <span className="w-1.5 h-1.5 rounded-full bg-black/60 inline-block" />
            Analise de Impacto com IA
          </div>

          {/* Title */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-black">
              Quanto um Agente de IA
              <br />
              <span className="relative">
                pode gerar no seu negocio?
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 400 8" fill="none">
                  <path d="M0 6 Q100 1 200 5 Q300 9 400 4" stroke="black" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.2"/>
                </svg>
              </span>
            </h1>
            <p className="text-base sm:text-lg text-black/50 font-normal leading-relaxed max-w-lg mx-auto">
              Insira seu faturamento mensal medio e visualize projecoes reais baseadas em dados de implementacao de agentes de IA no atendimento.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <label className="block text-left text-xs font-semibold tracking-widest uppercase text-black/40 mb-2 ml-1">
                Faturamento Mensal Medio
              </label>
              <div
                className={`relative flex items-center border-2 rounded-2xl transition-all duration-200 bg-white ${
                  focused ? 'border-black shadow-[0_0_0_4px_rgba(0,0,0,0.06)]' : error ? 'border-red-400' : 'border-black/15'
                }`}
              >
                <div className="pl-5 pr-3 flex items-center gap-1.5 text-black/50 font-semibold text-sm border-r border-black/10 h-full py-4">
                  <DollarSign size={16} />
                  <span>R$</span>
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  disabled={isLoading}
                  value={raw ? formatDisplay(raw) : ''}
                  onChange={handleChange}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="0,00"
                  className="flex-1 px-4 py-4 text-xl sm:text-2xl font-bold tracking-tight bg-transparent outline-none text-black placeholder:text-black/20 disabled:opacity-50"
                />
              </div>
              {error && (
                <p className="text-red-500 text-xs mt-2 ml-1 font-medium">{error}</p>
              )}
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-2 justify-center">
              {presets.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  disabled={isLoading}
                  onClick={() => { setRaw(String(p.value)); setError(''); }}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                    raw === String(p.value)
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black/60 border-black/15 hover:border-black/40 hover:text-black'
                  } disabled:opacity-50`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white font-bold text-base py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-black/85 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-black/10 disabled:opacity-85 disabled:cursor-not-allowed min-h-[60px]"
            >
              Gerar Analise Completa
              <ChevronRight size={20} />
            </button>
          </form>

          {/* Info */}
          <div className="flex items-start gap-2.5 text-left bg-black/[0.03] border border-black/[0.07] rounded-2xl p-4 max-w-md mx-auto">
            <Info size={14} className="text-black/40 mt-0.5 shrink-0" />
            <p className="text-xs text-black/40 leading-relaxed">
              Os dados sao baseados em medias de mercado de implementacoes reais de agentes de IA em operacoes de atendimento B2B e B2C no Brasil e globalmente.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
