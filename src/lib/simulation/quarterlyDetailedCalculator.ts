import { QuarterlyDetailedSettings, BusinessType } from '@/types';

/**
 * 분기별 세부 설정을 적용하여 지표를 조정합니다.
 * @param monthIndex 월 인덱스 (0부터 시작)
 * @param quarterlyDetailedSettings 분기별 세부 설정
 * @param businessType 비즈니스 타입
 * @param baseMetrics 기본 지표들
 * @returns 조정된 지표들
 */
export function applyQuarterlyDetailedSettings(
  monthIndex: number,
  quarterlyDetailedSettings: QuarterlyDetailedSettings,
  businessType: BusinessType,
  baseMetrics: {
    conversionRate?: number;
    price?: number;
    cost?: number;
    visitors?: number;
    sales?: number;
    churnRate?: number;
    refundRate?: number;
    takeRate?: number;
  }
) {
  if (!quarterlyDetailedSettings.useDetailedSettings) {
    return baseMetrics;
  }

  const quarter = Math.floor(monthIndex / 3) + 1;
  const year = new Date().getFullYear(); // 실제로는 시뮬레이션 시작 연도 사용해야 함
  
  // 해당 분기의 세부 설정 찾기
  const quarterlyMetric = quarterlyDetailedSettings.quarterlyMetrics.find(
    metric => metric.quarter === quarter && metric.year === year
  );

  if (!quarterlyMetric) {
    return baseMetrics;
  }

  const adjustedMetrics = { ...baseMetrics };

  // 전환율 조정
  if (quarterlyMetric.conversionRates) {
    if (businessType === 'saas' && quarterlyMetric.conversionRates.visitorToSignup !== undefined) {
      adjustedMetrics.conversionRate = quarterlyMetric.conversionRates.visitorToSignup;
    }
    if (businessType === 'b2c-platform' && quarterlyMetric.conversionRates.visitorToBuyer !== undefined) {
      adjustedMetrics.conversionRate = quarterlyMetric.conversionRates.visitorToBuyer;
    }
  }

  // 가격 조정
  if (quarterlyMetric.pricing) {
    if (quarterlyMetric.pricing.monthlyPrice !== undefined) {
      adjustedMetrics.price = quarterlyMetric.pricing.monthlyPrice;
    }
    if (quarterlyMetric.pricing.unitPrice !== undefined) {
      adjustedMetrics.price = quarterlyMetric.pricing.unitPrice;
    }
    if (quarterlyMetric.pricing.averageOrderValue !== undefined) {
      adjustedMetrics.price = quarterlyMetric.pricing.averageOrderValue;
    }
  }

  // 비용 조정
  if (quarterlyMetric.costs) {
    if (quarterlyMetric.costs.marketingCost !== undefined) {
      adjustedMetrics.cost = quarterlyMetric.costs.marketingCost;
    }
    if (quarterlyMetric.costs.personnelCost !== undefined) {
      adjustedMetrics.cost = quarterlyMetric.costs.personnelCost;
    }
    if (quarterlyMetric.costs.otherFixedCosts !== undefined) {
      adjustedMetrics.cost = quarterlyMetric.costs.otherFixedCosts;
    }
  }

  // 방문자/판매량 조정
  if (quarterlyMetric.metrics) {
    if (quarterlyMetric.metrics.monthlyVisitors !== undefined) {
      adjustedMetrics.visitors = quarterlyMetric.metrics.monthlyVisitors;
    }
    if (quarterlyMetric.metrics.monthlySales !== undefined) {
      adjustedMetrics.sales = quarterlyMetric.metrics.monthlySales;
    }
  }

  // 기타 지표 조정
  if (quarterlyMetric.metrics) {
    if (quarterlyMetric.metrics.churnRate !== undefined) {
      adjustedMetrics.churnRate = quarterlyMetric.metrics.churnRate;
    }
    if (quarterlyMetric.metrics.refundRate !== undefined) {
      adjustedMetrics.refundRate = quarterlyMetric.metrics.refundRate;
    }
    if (quarterlyMetric.metrics.takeRate !== undefined) {
      adjustedMetrics.takeRate = quarterlyMetric.metrics.takeRate;
    }
  }

  return adjustedMetrics;
}

/**
 * 분기별 세부 설정이 적용 가능한지 확인합니다.
 * @param quarterlyDetailedSettings 분기별 세부 설정
 * @param monthIndex 월 인덱스
 * @returns 적용 가능 여부
 */
export function isQuarterlyDetailedSettingsApplicable(
  quarterlyDetailedSettings: QuarterlyDetailedSettings,
  monthIndex: number
): boolean {
  if (!quarterlyDetailedSettings.useDetailedSettings) {
    return false;
  }

  const quarter = Math.floor(monthIndex / 3) + 1;
  const year = new Date().getFullYear();
  
  return quarterlyDetailedSettings.quarterlyMetrics.some(
    metric => metric.quarter === quarter && metric.year === year
  );
}

/**
 * 분기별 세부 설정의 적용 범위를 분석합니다.
 * @param quarterlyDetailedSettings 분기별 세부 설정
 * @param totalMonths 총 시뮬레이션 월수
 * @returns 적용 범위 분석 결과
 */
export function analyzeQuarterlyDetailedSettings(
  quarterlyDetailedSettings: QuarterlyDetailedSettings,
  totalMonths: number
): {
  totalQuarters: number;
  configuredQuarters: number;
  coverageRate: number;
  missingQuarters: Array<{ quarter: number; year: number }>;
} {
  if (!quarterlyDetailedSettings.useDetailedSettings) {
    return {
      totalQuarters: Math.ceil(totalMonths / 3),
      configuredQuarters: 0,
      coverageRate: 0,
      missingQuarters: [],
    };
  }

  const totalQuarters = Math.ceil(totalMonths / 3);
  const configuredQuarters = quarterlyDetailedSettings.quarterlyMetrics.length;
  const coverageRate = configuredQuarters / totalQuarters;

  const missingQuarters: Array<{ quarter: number; year: number }> = [];
  const currentYear = new Date().getFullYear();
  
  for (let i = 0; i < totalQuarters; i++) {
    const quarter = (i % 4) + 1;
    const year = currentYear + Math.floor(i / 4);
    
    const hasConfig = quarterlyDetailedSettings.quarterlyMetrics.some(
      metric => metric.quarter === quarter && metric.year === year
    );
    
    if (!hasConfig) {
      missingQuarters.push({ quarter, year });
    }
  }

  return {
    totalQuarters,
    configuredQuarters,
    coverageRate,
    missingQuarters,
  };
}
