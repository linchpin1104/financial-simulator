import { GrowthRateSettings } from '@/types';

/**
 * 특정 월에 적용할 성장률을 계산합니다.
 * @param monthIndex 0부터 시작하는 월 인덱스 (0 = 첫 번째 월)
 * @param growthRateSettings 성장률 설정
 * @returns 해당 월의 성장률 (1.0 = 변화 없음, 1.1 = 10% 증가)
 */
export function getGrowthRateForMonth(
  monthIndex: number,
  growthRateSettings: GrowthRateSettings
): number {
  if (!growthRateSettings.quarterlyRates.length) {
    return 1.0; // 성장률이 설정되지 않은 경우 변화 없음
  }

  // 월 인덱스를 분기로 변환 (0-2 = Q1, 3-5 = Q2, 6-8 = Q3, 9-11 = Q4)
  const quarter = Math.floor(monthIndex / 3) + 1;
  
  // 현재 연도 계산 (시작 월을 기준으로)
  const currentYear = new Date().getFullYear();
  const year = currentYear + Math.floor(monthIndex / 12);

  // 해당 분기의 성장률 찾기
  const quarterlyRate = growthRateSettings.quarterlyRates.find(
    rate => rate.quarter === quarter && rate.year === year
  );

  if (!quarterlyRate) {
    return 1.0; // 해당 분기의 성장률이 설정되지 않은 경우 변화 없음
  }

  return 1 + quarterlyRate.growthRate; // 0.1 -> 1.1 (10% 증가)
}

/**
 * 성장률을 적용하여 값을 계산합니다.
 * @param baseValue 기준값
 * @param monthIndex 월 인덱스
 * @param growthRateSettings 성장률 설정
 * @param applyGrowthRate 성장률 적용 여부
 * @returns 성장률이 적용된 값
 */
export function applyGrowthRate(
  baseValue: number,
  monthIndex: number,
  growthRateSettings: GrowthRateSettings,
  applyGrowthRate: boolean
): number {
  if (!applyGrowthRate) {
    return baseValue;
  }

  const growthRate = getGrowthRateForMonth(monthIndex, growthRateSettings);
  return baseValue * growthRate;
}

/**
 * 여러 값에 성장률을 적용합니다.
 * @param values 적용할 값들
 * @param monthIndex 월 인덱스
 * @param growthRateSettings 성장률 설정
 * @returns 성장률이 적용된 값들
 */
export function applyGrowthRates(
  values: {
    revenue?: number;
    customers?: number;
    orders?: number;
  },
  monthIndex: number,
  growthRateSettings: GrowthRateSettings
): {
  revenue: number;
  customers: number;
  orders?: number;
} {
  const result = {
    revenue: values.revenue || 0,
    customers: values.customers || 0,
    orders: values.orders,
  };

  // 매출에 성장률 적용
  if (values.revenue !== undefined) {
    result.revenue = applyGrowthRate(
      values.revenue,
      monthIndex,
      growthRateSettings,
      growthRateSettings.applyToRevenue
    );
  }

  // 고객수에 성장률 적용
  if (values.customers !== undefined) {
    result.customers = applyGrowthRate(
      values.customers,
      monthIndex,
      growthRateSettings,
      growthRateSettings.applyToCustomers
    );
  }

  // 주문수에 성장률 적용 (B2C 플랫폼에서만)
  if (values.orders !== undefined && growthRateSettings.applyToOrders) {
    result.orders = applyGrowthRate(
      values.orders,
      monthIndex,
      growthRateSettings,
      growthRateSettings.applyToOrders
    );
  }

  return result;
}

/**
 * 분기별 성장률 요약을 생성합니다.
 * @param growthRateSettings 성장률 설정
 * @returns 분기별 성장률 요약
 */
export function getGrowthRateSummary(growthRateSettings: GrowthRateSettings): {
  totalQuarters: number;
  averageGrowthRate: number;
  quarters: Array<{
    quarter: number;
    year: number;
    growthRate: number;
    description?: string;
  }>;
} {
  const quarters = growthRateSettings.quarterlyRates
    .sort((a, b) => a.year - b.year || a.quarter - b.quarter);

  const averageGrowthRate = quarters.length > 0
    ? quarters.reduce((sum, q) => sum + q.growthRate, 0) / quarters.length
    : 0;

  return {
    totalQuarters: quarters.length,
    averageGrowthRate,
    quarters: quarters.map(q => ({
      quarter: q.quarter,
      year: q.year,
      growthRate: q.growthRate,
      description: q.description,
    })),
  };
}
