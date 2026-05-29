import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, RotateCcw, TrendingUp, Zap, BarChart2, Clock, Star,
  Users, ShieldCheck, CheckCircle2, Sliders, X, Sparkles, Building2, ShoppingBag, Laptop
} from 'lucide-react';
import KPICard from './KPICard';
import RevenueChart from './RevenueChart';
import PerformanceCharts from './PerformanceCharts';
import ResponseTimeChart from './ResponseTimeChart';
import GradualProgressBar from './GradualProgressBar';
import { getBaselineMonths, getAiMonths, getKpiCards } from '../data/metrics';

interface Props {
  revenue: number;
  onReset: () => void;
}

interface Personalization {
  revenue: number;
  segment: 'clinica' | 'ecommerce' | 'imobiliaria' | 'saas' | 'geral';
  leadsPerDay: number;
  agentsCount: number;
}

function formatRevenue(value: number) {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}K`;
  return `R$ ${value.toLocaleString('pt-BR')}`;
}

const sections = [
  { id: 'kpis', label: 'KPIs', Icon: BarChart2 },
  { id: 'revenue', label: 'Faturamento', Icon: TrendingUp },
  { id: 'efficiency', label: 'Eficiência', Icon: Users },
  { id: 'performance', label: 'Performance', Icon: Star },
  { id: 'response', label: 'Atendimento', Icon: Clock },
  { id: 'progress', label: 'Indicadores', Icon: Zap },
];

const segmentConfig = {
  geral: {
    name: 'Geral / Outros',
    icon: Sparkles,
    heroBadge: 'Relatório de Impacto — Agente de IA',
    heroDesc: 'Análise completa do potencial de crescimento com implementação de agente de inteligência artificial no seu atendimento ao cliente.',
    ctaDesc: 'Esses números são baseados em implementações reais de agentes de IA no atendimento. Os resultados aparecem de forma gradual e consistente a partir do primeiro mês.',
    conversionLabel: 'Taxa de Conversão',
    conversionDesc: 'Crescimento na conversão de leads em clientes pagantes',
    resolutionLabel: 'Volume Atendido',
    resolutionDesc: 'Percentual de demandas respondidas dentro do SLA',
    kpiDesc: 'Comparativo direto — sem IA vs. com agente de IA',
    revenueTitle: 'Impacto no Faturamento',
    revenueDesc: 'Projeção anual de crescimento com implementação de IA',
    impactPhrase: 'resposta imediata no atendimento comercial garante maior retenção de clientes.',
  },
  clinica: {
    name: 'Clínicas & Saúde',
    icon: ShieldCheck,
    heroBadge: 'Relatório de Impacto — Agendamento Inteligente',
    heroDesc: 'Automatize o agendamento de consultas, triagem prévia e lembretes 24h para reduzir no-shows e otimizar a agenda da sua clínica.',
    ctaDesc: 'Com atendimento imediato 24/7 no WhatsApp, sua clínica elimina chamadas perdidas e aumenta o volume de agendamentos diários.',
    conversionLabel: 'Agendamento de Consultas',
    conversionDesc: 'Aumento na conversão de contatos interessados em consultas agendadas',
    resolutionLabel: 'Triagens Automatizadas',
    resolutionDesc: 'Pacientes atendidos e triados sem necessidade de intervenção humana na recepção',
    kpiDesc: 'Comparativo de produtividade da recepção — sem IA vs. com agente de IA',
    revenueTitle: 'Faturamento de Agendamentos',
    revenueDesc: 'Projeção de aumento na receita de consultas e exames por conversão ativa',
    impactPhrase: 'agendamento rápido sem esperas faz a taxa de marcação de novas consultas decolar.',
  },
  ecommerce: {
    name: 'E-commerce & Varejo',
    icon: ShoppingBag,
    heroBadge: 'Relatório de Impacto — Vendas & Carrinhos',
    heroDesc: 'Recupere carrinhos abandonados, responda dúvidas de frete e rastreamento de forma instantânea no WhatsApp e impulsione suas conversões.',
    ctaDesc: 'Respostas rápidas a dúvidas de tamanho, estoque e entrega garantem uma experiência de compra sem atritos e maximizam as vendas.',
    conversionLabel: 'Recuperação de Carrinho',
    conversionDesc: 'Aumento na conversão de clientes que demonstraram interesse ou abandonaram compras',
    resolutionLabel: 'Dúvidas & Rastreios Resolvidos',
    resolutionDesc: 'Consultas de frete e status de entrega respondidas na hora de forma automatizada',
    kpiDesc: 'Performance de e-commerce — sem IA vs. com suporte inteligente no chat',
    revenueTitle: 'Faturamento de Vendas',
    revenueDesc: 'Projeção de aumento no GMV com recuperação ativa de carrinhos abandonados',
    impactPhrase: 'resposta pré-venda em segundos e recuperação ativa aumentam o faturamento direto da loja online.',
  },
  imobiliaria: {
    name: 'Imobiliárias & Corretores',
    icon: Building2,
    heroBadge: 'Relatório de Impacto — Qualificação de Leads',
    heroDesc: 'Atenda contatos de portais (Zap, VivaReal) em segundos, qualifique o perfil de interesse/financeiro e agende visitas automaticamente.',
    ctaDesc: 'Seus corretores recebem leads qualificados e visitas pré-agendadas direto no CRM, otimizando o tempo de fechamento de contratos.',
    conversionLabel: 'Agendamentos de Visitas',
    conversionDesc: 'Taxa de contatos de portais convertidos em visitas agendadas aos imóveis',
    resolutionLabel: 'Leads Qualificados',
    resolutionDesc: 'Leads de portais respondidos, filtrados e qualificados de forma automatizada',
    kpiDesc: 'Funil de vendas imobiliário — sem IA vs. com inteligência no WhatsApp',
    revenueTitle: 'Comissões & Vendas',
    revenueDesc: 'Projeção de impacto no volume de novos contratos imobiliários fechados',
    impactPhrase: 'atendimento instantâneo a leads de portais garante que a imobiliária capte o cliente antes dos concorrentes.',
  },
  saas: {
    name: 'SaaS / Tecnologia',
    icon: Laptop,
    heroBadge: 'Relatório de Impacto — Suporte & Conversão',
    heroDesc: 'Automatize o suporte técnico nível 1, responda dúvidas de APIs e plataforma e converta usuários de trial para planos pagos.',
    ctaDesc: 'Ao resolver dúvidas de uso na hora e conduzir um onboarding automatizado, a IA eleva a retenção e diminui o churn de novos clientes.',
    conversionLabel: 'Conversão de Trial para Pago',
    conversionDesc: 'Aumento no número de usuários em teste grátis que migram para planos pagos',
    resolutionLabel: 'Tickets Resolvidos N1',
    resolutionDesc: 'Consultas de documentação e tickets simples finalizados sem escalar para o suporte humano',
    kpiDesc: 'Métricas de produto e suporte — sem IA vs. com suporte autônomo',
    revenueTitle: 'Receita Recorrente (MRR)',
    revenueDesc: 'Projeção de impacto no crescimento da receita recorrente mensal (MRR)',
    impactPhrase: 'suporte nível 1 24h tira dúvidas na hora de uso da plataforma, aumentando ativação de usuários.',
  }
};

const loadingPhrasesBySegment = {
  geral: [
    "Analisando faturamento...",
    "Calculando impacto de conversão...",
    "Montando plano personalizado..."
  ],
  clinica: [
    "Mapeando consultas e exames perdidos por tempo de espera na recepção...",
    "Simulando agenda e marcação automática fora do horário comercial...",
    "Estruturando fluxos inteligentes de triagem e lembrete de consultas..."
  ],
  ecommerce: [
    "Rastreando carrinhos abandonados no WhatsApp por falta de resposta rápida...",
    "Ajustando FAQs automatizados de prazos de frete e rastreio de entregas...",
    "Configurando mensagens ativas de cupons pós-venda para clientes frios..."
  ],
  imobiliaria: [
    "Medindo taxas de desistência em leads de portais imobiliários...",
    "Desenhando questionário interativo de qualificação financeira...",
    "Sincronizando agenda e roteiros para agendamento rápido de visitas..."
  ],
  saas: [
    "Analisando filas técnicas e gargalos em tickets de suporte nível 1...",
    "Estruturando onboarding interativo e documentação para usuários trial...",
    "Ajustando taxas de ativação de planos pagos a partir do suporte instantâneo..."
  ]
};

export default function Dashboard({ revenue: initialRevenue, onReset }: Props) {
  const [animate, setAnimate] = useState(false);
  const [activeSection, setActiveSection] = useState('kpis');
  const [isPersonalizing, setIsPersonalizing] = useState(false);
  const [isApplyingPersonalization, setIsApplyingPersonalization] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState(0);
  
  const [personalization, setPersonalization] = useState<Personalization>({
    revenue: initialRevenue,
    segment: 'geral',
    leadsPerDay: 30,
    agentsCount: 3,
  });

  // Estado temporário para o formulário de personalização
  const [tempRevenue, setTempRevenue] = useState(String(initialRevenue));
  const [tempSegment, setTempSegment] = useState<Personalization['segment']>('geral');
  const [tempLeads, setTempLeads] = useState(30);
  const [tempAgents, setTempAgents] = useState(3);
  const [inputFocused, setInputFocused] = useState(false);

  const dashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sectionEls = sections.map(s => ({
        id: s.id,
        el: document.getElementById(s.id),
      }));
      const scrollY = window.scrollY + 120;
      let current = 'kpis';
      for (const { id, el } of sectionEls) {
        if (el && el.offsetTop <= scrollY) current = id;
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const config = segmentConfig[personalization.segment];
  const loadingPhrases = loadingPhrasesBySegment[tempSegment] || loadingPhrasesBySegment.geral;

  // Gerar dados específicos por segmento
  const segmentBaselineMonths = getBaselineMonths(personalization.segment);
  const segmentAiMonths = getAiMonths(personalization.segment);

  // Faturamento final no Mês 12
  const currentMonthBaselineVal = segmentBaselineMonths[segmentBaselineMonths.length - 1].revenueMultiplier;
  const currentMonthAiVal = segmentAiMonths[segmentAiMonths.length - 1].revenueMultiplier;
  const totalGainPct = Math.round(((currentMonthAiVal / currentMonthBaselineVal) - 1) * 100);

  const projectedRevenue = Math.round(personalization.revenue * (currentMonthAiVal / currentMonthBaselineVal));
  const monthlyGain = projectedRevenue - personalization.revenue;

  // Cálculos de eficiência operacional
  const averageSalary = 2500; // salário médio por atendente
  const currentCost = personalization.agentsCount * averageSalary;
  // A IA assume 80% do trabalho repetitivo
  const efficiencyGain = Math.round((currentCost * 0.8));
  // leads por dia * 8 minutos * 30 dias * 80% automação / 60 minutos
  const hoursSaved = Math.round((personalization.leadsPerDay * 8 * 30 * 0.8) / 60);

  const handleOpenPersonalization = () => {
    setTempRevenue(String(personalization.revenue));
    setTempSegment(personalization.segment);
    setTempLeads(personalization.leadsPerDay);
    setTempAgents(personalization.agentsCount);
    setIsPersonalizing(true);
  };

  const handleApplyPersonalization = (e: React.FormEvent) => {
    e.preventDefault();
    const revNum = Number(tempRevenue.replace(/\D/g, ''));
    if (!revNum || revNum < 1000) return;

    // Fecha o modal antes de começar o carregamento
    setIsPersonalizing(false);
    setIsApplyingPersonalization(true);
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
        setPersonalization({
          revenue: revNum,
          segment: tempSegment,
          leadsPerDay: tempLeads,
          agentsCount: tempAgents,
        });
        setIsApplyingPersonalization(false);
        // Reseta animações após aplicar novos dados
        setAnimate(false);
        setTimeout(() => setAnimate(true), 100);
      }
    };

    requestAnimationFrame(updateProgress);
  };

  // Adaptação dinâmica dos KPIs com base no segmento
  const adaptedKpiCards = getKpiCards(personalization.segment).map(card => {
    if (card.id === 'conversion') {
      return {
        ...card,
        label: config.conversionLabel,
        description: config.conversionDesc,
      };
    }
    if (card.id === 'volume') {
      return {
        ...card,
        label: config.resolutionLabel,
        description: config.resolutionDesc,
      };
    }
    return card;
  });

  return (
    <div ref={dashRef} className="min-h-screen bg-white">

      {/* Tela de Loading de Alta Fidelidade na Personalização */}
      {isApplyingPersonalization && (
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
                strokeDasharray={251.3}
                strokeDashoffset={251.3 - (251.3 * loadingProgress) / 100}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.05s linear' }}
              />
            </svg>
            <span className="absolute text-sm font-extrabold text-black tabular-nums">
              {Math.round(loadingProgress)}%
            </span>
          </div>

          <div className="space-y-1.5 text-center px-6 max-w-lg">
            <p className="text-base font-bold text-black tracking-wide h-12 flex items-center justify-center">
              {loadingPhrases[loadingPhase]}
            </p>
            <p className="text-xs text-black/35 font-medium tracking-wider uppercase">
              Gerando Dados de {segmentConfig[tempSegment].name}
            </p>
          </div>
        </div>
      )}

      {/* Sticky header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-black/8">
        <div className="max-w-7xl mx-auto px-3 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-2 sm:gap-5">
            <button
              onClick={onReset}
              className="flex items-center gap-2 text-xs font-semibold text-black/50 hover:text-black transition-colors"
            >
              <ArrowLeft size={14} />
              Nova Analise
            </button>
            <div className="w-px h-4 bg-black/15" />
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center shrink-0">
                <TrendingUp size={14} className="text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-sm text-black">Calculadora</span>
                <span className="text-[9px] text-black/50 font-bold tracking-wider uppercase">
                  {config.name}
                </span>
              </div>
            </div>
          </div>

          {/* Revenue badge */}
          <div className="hidden xl:flex items-center gap-3">
            <div className="text-xs text-black/40 font-medium">Base mensal:</div>
            <div className="font-extrabold text-black text-sm">{formatRevenue(personalization.revenue)}</div>
            <div className="w-px h-4 bg-black/15" />
            <div className="flex items-center gap-1.5 bg-black rounded-full px-3 py-1.5">
              <TrendingUp size={11} className="text-white" />
              <span className="text-white text-xs font-bold">+{formatRevenue(monthlyGain)}/mes</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {sections.map(({ id, label, Icon }) => (
              <a
                key={id}
                href={`#${id}`}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeSection === id
                    ? 'bg-black text-white'
                    : 'text-black/40 hover:text-black hover:bg-black/5'
                }`}
              >
                <Icon size={10} />
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero banner */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2 space-y-3">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 text-xs font-semibold tracking-widest uppercase">
                <config.icon size={10} />
                {config.heroBadge}
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold leading-tight">
                Projeção para {config.name} baseada em {formatRevenue(personalization.revenue)}/mês
              </h2>
              <p className="text-white/50 text-sm leading-relaxed max-w-lg">
                {config.heroDesc} O faturamento é projetado a partir do mês atual com a simulação de fechamento.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="bg-white/8 rounded-2xl p-3 sm:p-4 border border-white/10">
                <div className="text-lg sm:text-2xl font-extrabold">{formatRevenue(projectedRevenue)}</div>
                <div className="text-[10px] sm:text-xs text-white/40 font-medium mt-1">Faturamento projetado/mes</div>
              </div>
              <div className="bg-white/8 rounded-2xl p-3 sm:p-4 border border-white/10">
                <div className="text-lg sm:text-2xl font-extrabold">+{totalGainPct}%</div>
                <div className="text-[10px] sm:text-xs text-white/40 font-medium mt-1">Crescimento estimado</div>
              </div>
              <div className="bg-white/8 rounded-2xl p-3 sm:p-4 border border-white/10">
                <div className="text-lg sm:text-2xl font-extrabold">90%</div>
                <div className="text-[10px] sm:text-xs text-white/40 font-medium mt-1">Satisfação do cliente</div>
              </div>
              <div className="bg-white/8 rounded-2xl p-3 sm:p-4 border border-white/10">
                <div className="text-lg sm:text-2xl font-extrabold">&lt;40s</div>
                <div className="text-[10px] sm:text-xs text-white/40 font-medium mt-1">Tempo de resposta</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10 sm:px-6 sm:py-12 sm:space-y-16">

        {/* KPIs */}
        <section id="kpis" className="space-y-6 scroll-mt-24">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
              <BarChart2 size={15} className="text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-black text-base sm:text-xl">Indicadores-Chave (KPIs) para {config.name}</h2>
              <p className="text-xs text-black/40 font-medium mt-0.5">{config.kpiDesc}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {adaptedKpiCards.map((card, i) => (
              <KPICard key={card.id + '-' + personalization.segment} {...card} delay={i * 120} animate={animate} />
            ))}
          </div>
        </section>

        {/* Revenue */}
        <section id="revenue" className="space-y-6 scroll-mt-24">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
              <TrendingUp size={15} className="text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-black text-base sm:text-xl">{config.revenueTitle}</h2>
              <p className="text-xs text-black/40 font-medium mt-0.5">{config.revenueDesc}</p>
            </div>
          </div>
          <RevenueChart 
            baseRevenue={personalization.revenue} 
            animate={animate} 
            baselineMonths={segmentBaselineMonths} 
            aiMonths={segmentAiMonths} 
          />
        </section>

        {/* Eficiência Operacional Section */}
        <section id="efficiency" className="space-y-6 scroll-mt-24">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
              <Users size={15} className="text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-black text-base sm:text-xl">Ganhos de Eficiência Operacional</h2>
              <p className="text-xs text-black/40 font-medium mt-0.5">Retorno sobre o tempo e escala baseados na sua equipe de {personalization.agentsCount} atendente(s)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-black/10 rounded-3xl p-4 sm:p-6 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-black/40">Tempo Liberado</span>
                <h4 className="text-3xl sm:text-4xl font-extrabold text-black mt-2">{hoursSaved} horas</h4>
                <p className="text-xs text-black/35 font-medium">economizadas por mês</p>
              </div>
              <p className="text-xs text-black/50 leading-relaxed border-t border-black/5 pt-3">
                Com <strong>{personalization.leadsPerDay} leads por dia</strong>, a automação de 80% dos contatos repetitivos poupa sua equipe técnica ou de recepção de tarefas mecânicas.
              </p>
            </div>

            <div className="bg-white border border-black/10 rounded-3xl p-4 sm:p-6 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-black/40">Capacidade de Resposta</span>
                <h4 className="text-3xl sm:text-4xl font-extrabold text-black mt-2">100%</h4>
                <p className="text-xs text-black/35 font-medium">dos leads respondidos em &lt;40s</p>
              </div>
              <p className="text-xs text-black/50 leading-relaxed border-t border-black/5 pt-3">
                A IA atende simultaneamente qualquer volume de mensagens, impedindo gargalos em picos de tráfego ou perdas de contatos fora do horário comercial.
              </p>
            </div>

            <div className="bg-white border border-black/10 rounded-3xl p-4 sm:p-6 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-black/40">Otimização de Custos</span>
                <h4 className="text-3xl sm:text-4xl font-extrabold text-black mt-2">~{formatRevenue(efficiencyGain)}</h4>
                <p className="text-xs text-black/35 font-medium">em escala e eficiência de equipe</p>
              </div>
              <p className="text-xs text-black/50 leading-relaxed border-t border-black/5 pt-3">
                Sua equipe atual de <strong>{personalization.agentsCount} pessoa(s)</strong> ganha superpoderes, focando apenas nas negociações e fechamentos complexos.
              </p>
            </div>
          </div>
        </section>

        {/* Performance */}
        <section id="performance" className="space-y-6 scroll-mt-24">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
              <Star size={15} className="text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-black text-base sm:text-xl">Analise de Performance</h2>
              <p className="text-xs text-black/40 font-medium mt-0.5">Radar geral e evolucao mensal de indicadores de {config.name}</p>
            </div>
          </div>
          <PerformanceCharts animate={animate} aiMonths={segmentAiMonths} />
        </section>

        {/* Response Time */}
        <section id="response" className="space-y-6 scroll-mt-24">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
              <Clock size={15} className="text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-black text-base sm:text-xl">Velocidade de Atendimento</h2>
              <p className="text-xs text-black/40 font-medium mt-0.5">Redução do tempo médio de resposta com atendimento inteligente</p>
            </div>
          </div>
          <ResponseTimeChart 
            animate={animate} 
            baselineMonths={segmentBaselineMonths} 
            aiMonths={segmentAiMonths} 
          />
        </section>

        {/* Progress bars */}
        <section id="progress" className="space-y-6 scroll-mt-24">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center">
              <Zap size={15} className="text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-black text-base sm:text-xl">Visao Geral dos Indicadores</h2>
              <p className="text-xs text-black/40 font-medium mt-0.5">Todos os metricos em um unico painel comparativo</p>
            </div>
          </div>
          <GradualProgressBar animate={animate} />
        </section>

        {/* CTA Bottom */}
        <section className="bg-black rounded-3xl p-6 sm:p-10 text-center text-white space-y-5">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
            <Zap size={10} />
            Proximo Passo
          </div>
          <h3 className="text-xl sm:text-3xl font-extrabold leading-tight">
            Pronto para crescer<br />{formatRevenue(monthlyGain)} a mais por mes?
          </h3>
          <p className="text-white/50 max-w-lg mx-auto text-sm leading-relaxed">
            {config.ctaDesc} Os resultados de {config.name} mostram que a {config.impactPhrase}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleOpenPersonalization}
              className="flex items-center gap-2 bg-white text-black font-bold px-6 py-3.5 rounded-xl hover:bg-white/90 active:scale-95 transition-all text-sm shadow-lg shadow-white/5"
            >
              <Sliders size={15} />
              Personalizar Análise
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-2 bg-white/10 text-white font-bold px-6 py-3.5 rounded-xl hover:bg-white/20 active:scale-95 transition-all text-sm"
            >
              <RotateCcw size={15} />
              Simular novo valor do zero
            </button>
          </div>
        </section>

      </main>

      {/* Modal de Personalização Glassmorphism */}
      {isPersonalizing && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/45 backdrop-blur-md transition-opacity"
            onClick={() => setIsPersonalizing(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-xl bg-white border border-black/10 rounded-3xl shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in duration-200 z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-black" />
                <h3 className="font-extrabold text-black text-lg">Personalizar sua Simulação</h3>
              </div>
              <button
                onClick={() => setIsPersonalizing(false)}
                className="text-black/45 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApplyPersonalization} className="space-y-6">
              {/* Faturamento Mensal */}
              <div className="space-y-2">
                <label className="block text-left text-xs font-bold tracking-widest uppercase text-black/40">
                  Faturamento Mensal Médio (R$)
                </label>
                <div className={`flex items-center border rounded-2xl px-4 py-3 bg-white transition-all ${
                  inputFocused ? 'border-black ring-2 ring-black/5' : 'border-black/15'
                }`}>
                  <span className="text-black/40 font-semibold mr-1">R$</span>
                  <input
                    type="text"
                    value={Number(tempRevenue.replace(/\D/g, '') || 0).toLocaleString('pt-BR')}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    onChange={(e) => setTempRevenue(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-transparent border-none outline-none font-bold text-black text-lg"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Segmento */}
              <div className="space-y-2">
                <label className="block text-left text-xs font-bold tracking-widest uppercase text-black/40">
                  Segmento de Negócio / Serviço
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(segmentConfig) as Array<Personalization['segment']>).map((seg) => {
                    const item = segmentConfig[seg];
                    const Icon = item.icon;
                    const isSelected = tempSegment === seg;
                    return (
                      <button
                        key={seg}
                        type="button"
                        onClick={() => setTempSegment(seg)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-black border-black text-white'
                            : 'bg-white border-black/10 text-black/60 hover:border-black/30 hover:text-black'
                        }`}
                      >
                        <Icon size={18} />
                        <span className="text-xs font-bold leading-tight">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Leads por dia */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-left text-xs font-bold tracking-widest uppercase text-black/40">
                    Leads por dia
                  </label>
                  <span className="text-sm font-extrabold text-black">{tempLeads} leads</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={tempLeads}
                  onChange={(e) => setTempLeads(Number(e.target.value))}
                  className="w-full h-1 bg-black/10 rounded-lg appearance-none cursor-pointer accent-black"
                />
              </div>

              {/* Pessoas no atendimento */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-left text-xs font-bold tracking-widest uppercase text-black/40">
                    Pessoas no atendimento
                  </label>
                  <span className="text-sm font-extrabold text-black">{tempAgents} atendentes</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={tempAgents}
                  onChange={(e) => setTempAgents(Number(e.target.value))}
                  className="w-full h-1 bg-black/10 rounded-lg appearance-none cursor-pointer accent-black"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-black/10 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsPersonalizing(false)}
                  className="px-5 py-2.5 rounded-xl border border-black/10 text-black/60 hover:text-black hover:border-black/30 font-bold text-sm transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-black text-white hover:bg-black/90 active:scale-[0.98] font-bold text-sm transition-all"
                >
                  Aplicar Configurações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-black/8 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center">
              <TrendingUp size={12} className="text-white" />
            </div>
            <span className="font-bold text-sm text-black">Calculadora</span>
          </div>
          <p className="text-xs text-black/30 font-medium text-center">
            Simulador baseado em medias de mercado para {config.name}. Os resultados reais podem variar conforme a estratégia de implementação.
          </p>
          <div className="text-xs text-black/25 font-medium">
            Dados atualizados — 2026
          </div>
        </div>
      </footer>
    </div>
  );
}
