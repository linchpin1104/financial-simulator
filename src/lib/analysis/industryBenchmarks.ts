import { BusinessType, SimulationResult } from '@/types';

/**
 * 산업별 벤치마크 데이터 타입
 */
export interface IndustryBenchmark {
  industry: string;
  businessType: BusinessType;
  stage: 'startup' | 'growth' | 'mature';
  metrics: {
    // 전환율 관련
    conversionRates: {
      visitorToSignup?: number; // SaaS
      visitorToBuyer?: number; // B2C
      signupToPaid?: number; // SaaS
      buyerToRepeat?: number; // B2C
    };
    
    // 고객 유지율
    churnRates: {
      monthly: number;
      annual: number;
    };
    
    // 수익성 지표
    profitability: {
      grossMargin: number;
      netMargin: number;
      costToRevenueRatio: number;
    };
    
    // 성장 지표
    growth: {
      monthlyRevenueGrowth: number;
      customerGrowth: number;
    };
    
    // 단위 경제성
    unitEconomics: {
      ltv: number;
      cac: number;
      ltvCacRatio: number;
      paybackPeriod: number; // 월
    };
    
    // 인력 관련
    hrMetrics: {
      revenuePerEmployee: number;
      hrToRevenueRatio: number;
    };
  };
}

/**
 * 산업별 벤치마크 데이터
 */
const INDUSTRY_BENCHMARKS: IndustryBenchmark[] = [
  // SaaS - 스타트업
  {
    industry: 'SaaS',
    businessType: 'saas',
    stage: 'startup',
    metrics: {
      conversionRates: {
        visitorToSignup: 0.03,
        signupToPaid: 0.15,
      },
      churnRates: {
        monthly: 0.05,
        annual: 0.45,
      },
      profitability: {
        grossMargin: 0.80,
        netMargin: -0.20,
        costToRevenueRatio: 1.20,
      },
      growth: {
        monthlyRevenueGrowth: 0.20,
        customerGrowth: 0.15,
      },
      unitEconomics: {
        ltv: 2400,
        cac: 800,
        ltvCacRatio: 3.0,
        paybackPeriod: 8,
      },
      hrMetrics: {
        revenuePerEmployee: 50000000,
        hrToRevenueRatio: 0.60,
      },
    },
  },
  
  // SaaS - 성장기
  {
    industry: 'SaaS',
    businessType: 'saas',
    stage: 'growth',
    metrics: {
      conversionRates: {
        visitorToSignup: 0.05,
        signupToPaid: 0.20,
      },
      churnRates: {
        monthly: 0.03,
        annual: 0.30,
      },
      profitability: {
        grossMargin: 0.85,
        netMargin: 0.10,
        costToRevenueRatio: 0.90,
      },
      growth: {
        monthlyRevenueGrowth: 0.15,
        customerGrowth: 0.12,
      },
      unitEconomics: {
        ltv: 4800,
        cac: 1200,
        ltvCacRatio: 4.0,
        paybackPeriod: 6,
      },
      hrMetrics: {
        revenuePerEmployee: 80000000,
        hrToRevenueRatio: 0.45,
      },
    },
  },
  
  // 제조/유통 - 스타트업
  {
    industry: '제조/유통',
    businessType: 'manufacturing',
    stage: 'startup',
    metrics: {
      conversionRates: {},
      churnRates: {
        monthly: 0.02,
        annual: 0.20,
      },
      profitability: {
        grossMargin: 0.40,
        netMargin: 0.05,
        costToRevenueRatio: 0.95,
      },
      growth: {
        monthlyRevenueGrowth: 0.10,
        customerGrowth: 0.08,
      },
      unitEconomics: {
        ltv: 1200,
        cac: 200,
        ltvCacRatio: 6.0,
        paybackPeriod: 4,
      },
      hrMetrics: {
        revenuePerEmployee: 30000000,
        hrToRevenueRatio: 0.25,
      },
    },
  },
  
  // B2C 플랫폼 - 스타트업
  {
    industry: 'B2C 플랫폼',
    businessType: 'b2c-platform',
    stage: 'startup',
    metrics: {
      conversionRates: {
        visitorToBuyer: 0.02,
        buyerToRepeat: 0.25,
      },
      churnRates: {
        monthly: 0.10,
        annual: 0.70,
      },
      profitability: {
        grossMargin: 0.15,
        netMargin: -0.30,
        costToRevenueRatio: 1.30,
      },
      growth: {
        monthlyRevenueGrowth: 0.25,
        customerGrowth: 0.20,
      },
      unitEconomics: {
        ltv: 200,
        cac: 150,
        ltvCacRatio: 1.3,
        paybackPeriod: 12,
      },
      hrMetrics: {
        revenuePerEmployee: 40000000,
        hrToRevenueRatio: 0.50,
      },
    },
  },
];

/**
 * 시뮬레이션 결과와 산업 벤치마크를 비교합니다.
 * 
 * @param result 시뮬레이션 결과
 * @param businessType 비즈니스 타입
 * @param stage 성장 단계 (기본값: 'startup')
 * @returns 벤치마크 비교 결과
 */
export function compareWithBenchmarks(
  result: SimulationResult,
  businessType: BusinessType,
  stage: 'startup' | 'growth' | 'mature' = 'startup'
): {
  benchmark: IndustryBenchmark | null;
  comparisons: {
    metric: string;
    current: number;
    benchmark: number;
    difference: number;
    status: 'above' | 'below' | 'similar';
    recommendation: string;
  }[];
  overallScore: number; // 0-100
  strengths: string[];
  improvements: string[];
} {
  // 해당 비즈니스 타입과 성장 단계의 벤치마크 찾기
  const benchmark = INDUSTRY_BENCHMARKS.find(
    b => b.businessType === businessType && b.stage === stage
  );
  
  if (!benchmark) {
    return {
      benchmark: null,
      comparisons: [],
      overallScore: 0,
      strengths: [],
      improvements: [],
    };
  }
  
  const comparisons: Array<{
    metric: string;
    current: number;
    benchmark: number;
    difference: number;
    status: 'above' | 'below' | 'similar';
    recommendation: string;
  }> = [];
  const strengths: string[] = [];
  const improvements: string[] = [];
  
  // 전환율 비교
  if (businessType === 'saas' && benchmark.metrics.conversionRates.visitorToSignup) {
    const current = 0.05; // 실제로는 시뮬레이션 결과에서 가져와야 함
    const benchmarkValue = benchmark.metrics.conversionRates.visitorToSignup;
    const difference = current - benchmarkValue;
    const status = Math.abs(difference) < 0.01 ? 'similar' : difference > 0 ? 'above' : 'below';
    
    comparisons.push({
      metric: '방문자 → 가입 전환율',
      current: current * 100,
      benchmark: benchmarkValue * 100,
      difference: difference * 100,
      status,
      recommendation: status === 'below' 
        ? '전환율 개선을 위한 랜딩 페이지 최적화가 필요합니다.'
        : status === 'above'
        ? '우수한 전환율을 보이고 있습니다.'
        : '업계 평균 수준입니다.',
    });
    
    if (status === 'above') strengths.push('높은 전환율');
    if (status === 'below') improvements.push('전환율 개선');
  }
  
  // 이탈률 비교
  const currentChurn = 0.03; // 실제로는 시뮬레이션 결과에서 가져와야 함
  const benchmarkChurn = benchmark.metrics.churnRates.monthly;
  const churnDifference = currentChurn - benchmarkChurn;
  const churnStatus = Math.abs(churnDifference) < 0.01 ? 'similar' : churnDifference < 0 ? 'above' : 'below';
  
  comparisons.push({
    metric: '월간 이탈률',
    current: currentChurn * 100,
    benchmark: benchmarkChurn * 100,
    difference: churnDifference * 100,
    status: churnStatus,
    recommendation: churnStatus === 'above'
      ? '고객 유지율 개선을 위한 리텐션 전략이 필요합니다.'
      : churnStatus === 'below'
      ? '우수한 고객 유지율을 보이고 있습니다.'
      : '업계 평균 수준입니다.',
  });
  
  if (churnStatus === 'below') strengths.push('낮은 이탈률');
  if (churnStatus === 'above') improvements.push('고객 유지율 개선');
  
  // 수익성 비교
  const currentMargin = result.summary.netProfit / result.summary.totalRevenue;
  const benchmarkMargin = benchmark.metrics.profitability.netMargin;
  const marginDifference = currentMargin - benchmarkMargin;
  const marginStatus = Math.abs(marginDifference) < 0.05 ? 'similar' : marginDifference > 0 ? 'above' : 'below';
  
  comparisons.push({
    metric: '순이익률',
    current: currentMargin * 100,
    benchmark: benchmarkMargin * 100,
    difference: marginDifference * 100,
    status: marginStatus,
    recommendation: marginStatus === 'below'
      ? '수익성 개선을 위한 비용 최적화나 가격 전략 검토가 필요합니다.'
      : marginStatus === 'above'
      ? '우수한 수익성을 보이고 있습니다.'
      : '업계 평균 수준입니다.',
  });
  
  if (marginStatus === 'above') strengths.push('높은 수익성');
  if (marginStatus === 'below') improvements.push('수익성 개선');
  
  // LTV/CAC 비교 (SaaS의 경우)
  if (businessType === 'saas' && result.summary.ltv && result.summary.cac) {
    const currentLtvCac = result.summary.ltv / result.summary.cac;
    const benchmarkLtvCac = benchmark.metrics.unitEconomics.ltvCacRatio;
    const ltvCacDifference = currentLtvCac - benchmarkLtvCac;
    const ltvCacStatus = Math.abs(ltvCacDifference) < 0.5 ? 'similar' : ltvCacDifference > 0 ? 'above' : 'below';
    
    comparisons.push({
      metric: 'LTV/CAC 비율',
      current: currentLtvCac,
      benchmark: benchmarkLtvCac,
      difference: ltvCacDifference,
      status: ltvCacStatus,
      recommendation: ltvCacStatus === 'below'
        ? 'LTV 향상이나 CAC 감소를 위한 전략이 필요합니다.'
        : ltvCacStatus === 'above'
        ? '우수한 단위 경제성을 보이고 있습니다.'
        : '업계 평균 수준입니다.',
    });
    
    if (ltvCacStatus === 'above') strengths.push('우수한 단위 경제성');
    if (ltvCacStatus === 'below') improvements.push('단위 경제성 개선');
  }
  
  // 전체 점수 계산 (0-100)
  const aboveCount = comparisons.filter(c => c.status === 'above').length;
  const similarCount = comparisons.filter(c => c.status === 'similar').length;
  const totalCount = comparisons.length;
  const overallScore = totalCount > 0 ? Math.round(((aboveCount * 100 + similarCount * 50) / totalCount)) : 0;
  
  return {
    benchmark,
    comparisons,
    overallScore,
    strengths,
    improvements,
  };
}

/**
 * 산업별 벤치마크 데이터를 가져옵니다.
 * 
 * @param businessType 비즈니스 타입
 * @param stage 성장 단계
 * @returns 해당하는 벤치마크 데이터
 */
export function getIndustryBenchmark(
  businessType: BusinessType,
  stage: 'startup' | 'growth' | 'mature' = 'startup'
): IndustryBenchmark | null {
  return INDUSTRY_BENCHMARKS.find(
    b => b.businessType === businessType && b.stage === stage
  ) || null;
}

/**
 * 모든 사용 가능한 벤치마크를 가져옵니다.
 * 
 * @returns 모든 벤치마크 데이터
 */
export function getAllBenchmarks(): IndustryBenchmark[] {
  return INDUSTRY_BENCHMARKS;
}
