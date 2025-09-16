import { MonthlyResult, SummaryResult, BusinessType } from '@/types';

/**
 * 규모의 경제 분석 결과 타입
 */
export interface ScaleEconomicsAnalysis {
  // 매출 구간별 비용 효율성
  revenueScales: {
    range: string;
    avgRevenue: number;
    avgCosts: number;
    costRatio: number;
    efficiency: 'high' | 'medium' | 'low';
  }[];
  
  // 매출 증가에 따른 비용 효율성 개선 예측
  projectedEfficiency: {
    revenueGrowth: number;
    costRatio: number;
    savings: number;
  }[];
  
  // 규모의 경제 지수 (0-1, 높을수록 규모의 경제 효과가 큼)
  scaleEconomicsIndex: number;
  
  // 최적 운영 규모 (비용 효율성이 가장 높은 매출 구간)
  optimalOperatingScale: {
    minRevenue: number;
    maxRevenue: number;
    costRatio: number;
  };
  
  // 비즈니스 타입별 특화 지표
  businessSpecificMetrics: {
    saas?: {
      optimalCustomerCount: number;
      customerAcquisitionEfficiency: number;
    };
    manufacturing?: {
      optimalProductionVolume: number;
      productionEfficiency: number;
    };
    b2cPlatform?: {
      optimalTransactionVolume: number;
      networkEfficiencyFactor: number;
    };
  };
}

/**
 * 규모의 경제 분석을 수행합니다.
 * 
 * @param monthlyResults 월간 시뮬레이션 결과
 * @param businessType 비즈니스 타입
 * @returns 규모의 경제 분석 결과
 */
export function analyzeScaleEconomics(
  monthlyResults: Record<string, MonthlyResult>,
  businessType: BusinessType
): ScaleEconomicsAnalysis {
  const months = Object.values(monthlyResults);
  if (months.length === 0) {
    return createEmptyScaleEconomicsAnalysis();
  }
  
  // 매출 기준으로 정렬
  const sortedMonths = [...months].sort((a, b) => a.revenue - b.revenue);
  
  // 매출 구간 나누기 (4개 구간)
  const revenueScales: ScaleEconomicsAnalysis['revenueScales'] = [];
  const step = Math.max(1, Math.floor(sortedMonths.length / 4));
  
  for (let i = 0; i < 4; i++) {
    const startIdx = i * step;
    const endIdx = i === 3 ? sortedMonths.length - 1 : (i + 1) * step - 1;
    
    if (startIdx <= endIdx) {
      const segment = sortedMonths.slice(startIdx, endIdx + 1);
      const minRevenue = segment[0].revenue;
      const maxRevenue = segment[segment.length - 1].revenue;
      const avgRevenue = segment.reduce((sum, month) => sum + month.revenue, 0) / segment.length;
      const avgCosts = segment.reduce((sum, month) => sum + month.totalCosts, 0) / segment.length;
      const costRatio = avgRevenue > 0 ? avgCosts / avgRevenue : 1;
      
      // 효율성 평가
      let efficiency: 'high' | 'medium' | 'low';
      if (costRatio < 0.6) efficiency = 'high';
      else if (costRatio < 0.8) efficiency = 'medium';
      else efficiency = 'low';
      
      revenueScales.push({
        range: `${formatCurrency(minRevenue)} - ${formatCurrency(maxRevenue)}`,
        avgRevenue,
        avgCosts,
        costRatio,
        efficiency,
      });
    }
  }
  
  // 규모의 경제 지수 계산
  // (첫 구간 비용 비율 - 마지막 구간 비용 비율) / 첫 구간 비용 비율
  const scaleEconomicsIndex = revenueScales.length >= 2 
    ? Math.max(0, Math.min(1, (revenueScales[0].costRatio - revenueScales[revenueScales.length - 1].costRatio) / revenueScales[0].costRatio))
    : 0;
  
  // 매출 증가에 따른 비용 효율성 개선 예측
  const lastMonthRevenue = months.length > 0 ? months[months.length - 1].revenue : 0;
  const projectedEfficiency = [0.5, 1, 2, 3].map(factor => {
    const revenueGrowth = lastMonthRevenue * factor;
    // 규모의 경제 효과를 반영한 비용 비율 예측 (로그 함수 사용)
    const costRatio = Math.max(
      0.5, // 최소 비용 비율 (50%)
      revenueScales[0].costRatio * Math.pow(0.9, Math.log2(1 + factor)) // 로그 함수로 감소 속도 조절
    );
    const predictedCosts = revenueGrowth * costRatio;
    const currentCostRatio = revenueScales[0].costRatio;
    const savings = revenueGrowth * (currentCostRatio - costRatio);
    
    return {
      revenueGrowth,
      costRatio,
      savings,
    };
  });
  
  // 최적 운영 규모 찾기 (비용 효율성이 가장 높은 구간)
  const mostEfficientScale = [...revenueScales].sort((a, b) => a.costRatio - b.costRatio)[0];
  const [minRevStr, maxRevStr] = mostEfficientScale.range.split(' - ');
  const optimalOperatingScale = {
    minRevenue: parseFloat(minRevStr.replace(/[^0-9.]/g, '')),
    maxRevenue: parseFloat(maxRevStr.replace(/[^0-9.]/g, '')),
    costRatio: mostEfficientScale.costRatio,
  };
  
  // 비즈니스 타입별 특화 지표
  const businessSpecificMetrics: ScaleEconomicsAnalysis['businessSpecificMetrics'] = {};
  
  if (businessType === 'saas') {
    // SaaS 특화 지표
    const optimalScaleMonths = sortedMonths.filter(
      month => month.revenue >= optimalOperatingScale.minRevenue && month.revenue <= optimalOperatingScale.maxRevenue
    );
    const avgCustomers = optimalScaleMonths.length > 0
      ? optimalScaleMonths.reduce((sum, month) => sum + (month.customers || 0), 0) / optimalScaleMonths.length
      : 0;
    
    businessSpecificMetrics.saas = {
      optimalCustomerCount: Math.round(avgCustomers),
      customerAcquisitionEfficiency: scaleEconomicsIndex,
    };
  } else if (businessType === 'manufacturing') {
    // 제조/유통 특화 지표
    const optimalScaleMonths = sortedMonths.filter(
      month => month.revenue >= optimalOperatingScale.minRevenue && month.revenue <= optimalOperatingScale.maxRevenue
    );
    const avgProduction = optimalScaleMonths.length > 0
      ? optimalScaleMonths.reduce((sum, month) => sum + (month.production || 0), 0) / optimalScaleMonths.length
      : 0;
    
    businessSpecificMetrics.manufacturing = {
      optimalProductionVolume: Math.round(avgProduction),
      productionEfficiency: scaleEconomicsIndex,
    };
  } else if (businessType === 'b2c-platform') {
    // B2C 플랫폼 특화 지표
    const optimalScaleMonths = sortedMonths.filter(
      month => month.revenue >= optimalOperatingScale.minRevenue && month.revenue <= optimalOperatingScale.maxRevenue
    );
    const avgTransactions = optimalScaleMonths.length > 0
      ? optimalScaleMonths.reduce((sum, month) => sum + (month.orders || 0), 0) / optimalScaleMonths.length
      : 0;
    
    businessSpecificMetrics.b2cPlatform = {
      optimalTransactionVolume: Math.round(avgTransactions),
      networkEfficiencyFactor: scaleEconomicsIndex * 1.2, // 네트워크 효과를 반영하여 약간 더 높게 설정
    };
  }
  
  return {
    revenueScales,
    projectedEfficiency,
    scaleEconomicsIndex,
    optimalOperatingScale,
    businessSpecificMetrics,
  };
}

/**
 * 빈 규모의 경제 분석 결과를 생성합니다.
 */
function createEmptyScaleEconomicsAnalysis(): ScaleEconomicsAnalysis {
  return {
    revenueScales: [],
    projectedEfficiency: [],
    scaleEconomicsIndex: 0,
    optimalOperatingScale: {
      minRevenue: 0,
      maxRevenue: 0,
      costRatio: 0,
    },
    businessSpecificMetrics: {},
  };
}

/**
 * 금액을 간단한 형식으로 포맷합니다.
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ko-KR', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
}
