export interface MonthData {
  month: string;
  shortMonth: string;
  responseTime: number;        // minutos
  satisfactionRate: number;    // %
  conversionRate: number;      // %
  revenueMultiplier: number;   // fator sobre o faturamento base
  attendedVolume: number;      // % do volume atendido
  resolutionRate: number;      // % resolvidos sem escalonamento
  isCurrentMonth?: boolean;    // marca o mês atual
}

// Nomes dos meses em português
export const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const shortMonthNames = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

// Mês atual (0-based)
export const currentMonthIndex = new Date().getMonth();

// Multiplicadores da baseline por segmento (variação de faturamento sem IA)
const segmentBaselines = {
  geral: [0.88, 0.92, 1.02, 0.97, 1.00, 1.04, 0.95, 0.98, 1.03, 1.01, 1.08, 1.16],
  clinica: [0.72, 0.85, 1.00, 0.98, 1.00, 1.02, 0.76, 0.95, 1.00, 0.98, 1.04, 1.10], // Perda acentuada em férias de Jan e Julho por falta de recepção ativa
  ecommerce: [0.70, 0.78, 0.95, 0.88, 1.00, 1.06, 0.90, 0.95, 1.00, 1.08, 1.25, 1.40], // Sazonalidade agressiva de comércio eletrônico, forte em Nov/Dez
  imobiliaria: [0.85, 0.80, 1.10, 0.92, 1.00, 1.05, 0.82, 0.95, 1.05, 0.98, 1.10, 1.18], // Flutuações fortes dependendo da disponibilidade de corretores
  saas: [0.95, 0.96, 0.98, 0.97, 1.00, 1.01, 1.02, 1.03, 1.04, 1.05, 1.06, 1.08] // Crescimento recorrente de SaaS, mais estável
};

// Configurações específicas de velocidade de resposta por segmento
const segmentResponseTimes = {
  geral: { baseline: 2.0, ai: 0.92, aiProgression: [1.8, 1.5, 1.3, 1.1, 1.0, 0.92, 0.92, 0.92, 0.92, 0.92, 0.92, 0.92] },
  clinica: { baseline: 8.0, ai: 0.92, aiProgression: [5.0, 3.2, 2.0, 1.5, 1.1, 0.92, 0.92, 0.92, 0.92, 0.92, 0.92, 0.92] }, // Secretária ocupada / fora de hora
  ecommerce: { baseline: 15.0, ai: 0.6, aiProgression: [8.0, 4.0, 2.0, 1.2, 0.8, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6] }, // Fila de chat pré-venda
  imobiliaria: { baseline: 45.0, ai: 0.75, aiProgression: [25.0, 12.0, 6.0, 3.0, 1.5, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75] }, // Corretores em visita externa
  saas: { baseline: 90.0, ai: 0.8, aiProgression: [50.0, 25.0, 12.0, 5.0, 2.0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8] } // Ticket de suporte na fila técnica
};

const aiProgressionMultipliers = [1.03, 1.07, 1.11, 1.15, 1.18, 1.20, 1.20, 1.20, 1.20, 1.20, 1.20, 1.20];
const aiProgressionSatisfaction = [68, 73, 78, 83, 87, 90, 90, 90, 90, 90, 90, 90];
const aiProgressionConversion = [20, 22, 24, 26, 28, 30, 30, 30, 30, 30, 30, 30];
const aiProgressionVolume = [78, 83, 88, 92, 95, 97, 97, 97, 97, 97, 97, 97];
const aiProgressionResolution = [60, 66, 72, 78, 84, 89, 89, 89, 89, 89, 89, 89];

// Retorna a lista de 12 meses SEM IA (baseline) para o segmento
export function getBaselineMonths(segment: keyof typeof segmentBaselines = 'geral'): MonthData[] {
  const multipliers = segmentBaselines[segment] || segmentBaselines.geral;
  const respConf = segmentResponseTimes[segment] || segmentResponseTimes.geral;

  return monthNames.map((name, i) => ({
    month: name,
    shortMonth: shortMonthNames[i],
    responseTime: respConf.baseline,
    satisfactionRate: 62,
    conversionRate: 18,
    revenueMultiplier: multipliers[i],
    attendedVolume: 68,
    resolutionRate: 54,
    isCurrentMonth: i === currentMonthIndex,
  }));
}

// Retorna a lista de 12 meses COM IA (projeção gradual a partir de Maio)
export function getAiMonths(segment: keyof typeof segmentBaselines = 'geral'): MonthData[] {
  const multipliers = segmentBaselines[segment] || segmentBaselines.geral;
  const respConf = segmentResponseTimes[segment] || segmentResponseTimes.geral;

  return monthNames.map((name, i) => {
    const monthsAfterImplementation = i - currentMonthIndex;

    if (monthsAfterImplementation < 0) {
      return {
        month: name,
        shortMonth: shortMonthNames[i],
        responseTime: respConf.baseline,
        satisfactionRate: 62,
        conversionRate: 18,
        revenueMultiplier: multipliers[i],
        attendedVolume: 68,
        resolutionRate: 54,
        isCurrentMonth: false,
      };
    }

    const progIdx = Math.min(monthsAfterImplementation, aiProgressionMultipliers.length - 1);
    const aiFactor = aiProgressionMultipliers[progIdx];
    const respTimeProg = respConf.aiProgression[progIdx] !== undefined 
      ? respConf.aiProgression[progIdx] 
      : respConf.ai;

    return {
      month: name,
      shortMonth: shortMonthNames[i],
      responseTime: respTimeProg,
      satisfactionRate: aiProgressionSatisfaction[progIdx],
      conversionRate: aiProgressionConversion[progIdx],
      revenueMultiplier: Number((multipliers[i] * aiFactor).toFixed(4)),
      attendedVolume: aiProgressionVolume[progIdx],
      resolutionRate: aiProgressionResolution[progIdx],
      isCurrentMonth: i === currentMonthIndex,
    };
  });
}

// Retorna os KPI Cards padrão e adaptados do segmento
export function getKpiCards(segment: keyof typeof segmentBaselines = 'geral') {
  const respConf = segmentResponseTimes[segment] || segmentResponseTimes.geral;
  const improvement = Math.round(((respConf.ai - respConf.baseline) / respConf.baseline) * 100);

  return [
    {
      id: 'response',
      label: 'Tempo de Resposta',
      unit: 'min',
      baselineValue: respConf.baseline,
      aiValue: respConf.ai,
      improvement: improvement,
      description: 'Redução no tempo médio de primeira resposta ao cliente',
      inverse: true,
    },
    {
      id: 'satisfaction',
      label: 'Satisfação do Cliente',
      unit: '%',
      baselineValue: 62,
      aiValue: 90,
      improvement: 45,
      description: 'Aumento no índice de satisfação (NPS e CSAT combinados)',
      inverse: false,
    },
    {
      id: 'conversion',
      label: 'Taxa de Conversão',
      unit: '%',
      baselineValue: 18,
      aiValue: 30,
      improvement: 67,
      description: 'Crescimento na conversão de leads em clientes pagantes',
      inverse: false,
    },
    {
      id: 'volume',
      label: 'Volume Atendido',
      unit: '%',
      baselineValue: 68,
      aiValue: 97,
      improvement: 43,
      description: 'Percentual de demandas respondidas dentro do SLA',
      inverse: false,
    },
  ];
}
