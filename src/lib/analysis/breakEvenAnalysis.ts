import { MonthlyResult, SummaryResult } from '@/types';

/**
 * 손익분기점 분석 결과 타입
 */
export interface BreakEvenAnalysis {
  // 손익분기점 도달 월 (1부터 시작, 0은 미도달)
  breakEvenMonth: number;
  
  // 손익분기점 도달 시 누적 매출
  breakEvenRevenue: number;
  
  // 손익분기점 도달 시 고객 수
  breakEvenCustomers: number;
  
  // 월간 손익분기점 매출액
  monthlyBreakEvenRevenue: number;
  
  // 연간 손익분기점 매출액
  annualBreakEvenRevenue: number;
  
  // 고정 비용 총액
  totalFixedCosts: number;
  
  // 변동 비용 비율 (0-1)
  variableCostRatio: number;
  
  // 기여 마진 비율 (1 - 변동비율)
  contributionMarginRatio: number;
  
  // 손익분기점 도달까지 필요한 추가 매출 (아직 도달하지 않은 경우)
  revenueGapToBreakEven: number;
}

/**
 * 월간 결과에서 손익분기점 분석을 수행합니다.
 * 
 * @param monthlyResults 월간 시뮬레이션 결과
 * @param fixedCosts 고정 비용 (기본값: 전체 비용의 70%)
 * @param variableCostRatio 변동 비용 비율 (기본값: 0.3)
 * @returns 손익분기점 분석 결과
 */
export function analyzeBreakEven(
  monthlyResults: Record<string, MonthlyResult>,
  fixedCosts?: number,
  variableCostRatio?: number
): BreakEvenAnalysis {
  // 월별 데이터를 배열로 변환
  const monthsData = Object.values(monthlyResults);
  if (monthsData.length === 0) {
    return createEmptyBreakEvenAnalysis();
  }
  
  // 마지막 달의 데이터로 고정 비용과 변동 비용 비율 추정 (제공되지 않은 경우)
  const lastMonth = monthsData[monthsData.length - 1];
  const estimatedFixedCosts = fixedCosts ?? (lastMonth.totalCosts * 0.7); // 기본값: 전체 비용의 70%가 고정 비용
  const estimatedVariableCostRatio = variableCostRatio ?? 0.3; // 기본값: 매출의 30%가 변동 비용
  
  // 기여 마진 비율 계산 (1 - 변동비율)
  const contributionMarginRatio = 1 - estimatedVariableCostRatio;
  
  // 월간 손익분기점 매출액 계산 (고정비 ÷ 기여마진비율)
  const monthlyBreakEvenRevenue = contributionMarginRatio > 0 
    ? estimatedFixedCosts / contributionMarginRatio 
    : Infinity;
  
  // 연간 손익분기점 매출액
  const annualBreakEvenRevenue = monthlyBreakEvenRevenue * 12;
  
  // 손익분기점 도달 월 찾기
  let breakEvenMonth = 0;
  let cumulativeRevenue = 0;
  let cumulativeProfit = -estimatedFixedCosts; // 초기 고정 비용으로 시작
  let breakEvenRevenue = 0;
  let breakEvenCustomers = 0;
  
  for (let i = 0; i < monthsData.length; i++) {
    const month = monthsData[i];
    cumulativeRevenue += month.revenue;
    
    // 해당 월의 기여 마진 (매출 - 변동비)
    const contributionMargin = month.revenue * contributionMarginRatio;
    cumulativeProfit += contributionMargin;
    
    // 손익분기점 도달 확인
    if (cumulativeProfit >= 0 && breakEvenMonth === 0) {
      breakEvenMonth = i + 1; // 1부터 시작하는 월 인덱스
      breakEvenRevenue = cumulativeRevenue;
      breakEvenCustomers = month.customers;
      break;
    }
  }
  
  // 손익분기점 도달까지 필요한 추가 매출 계산
  const revenueGapToBreakEven = breakEvenMonth === 0 
    ? (Math.abs(cumulativeProfit) / contributionMarginRatio) 
    : 0;
  
  return {
    breakEvenMonth,
    breakEvenRevenue,
    breakEvenCustomers,
    monthlyBreakEvenRevenue,
    annualBreakEvenRevenue,
    totalFixedCosts: estimatedFixedCosts,
    variableCostRatio: estimatedVariableCostRatio,
    contributionMarginRatio,
    revenueGapToBreakEven,
  };
}

/**
 * 요약 결과에서 손익분기점 분석을 수행합니다.
 * 
 * @param summary 시뮬레이션 요약 결과
 * @param months 시뮬레이션 기간 (월)
 * @param fixedCostsRatio 고정 비용 비율 (기본값: 0.7)
 * @returns 손익분기점 분석 결과
 */
export function analyzeBreakEvenFromSummary(
  summary: SummaryResult,
  months: number,
  fixedCostsRatio: number = 0.7
): BreakEvenAnalysis {
  // 총 고정 비용 추정
  const totalFixedCosts = summary.totalCosts * fixedCostsRatio;
  
  // 변동 비용 비율 추정
  const totalVariableCosts = summary.totalCosts - totalFixedCosts;
  const variableCostRatio = summary.totalRevenue > 0 
    ? totalVariableCosts / summary.totalRevenue 
    : 0.3; // 기본값
  
  // 기여 마진 비율
  const contributionMarginRatio = 1 - variableCostRatio;
  
  // 월간 손익분기점 매출액
  const monthlyBreakEvenRevenue = contributionMarginRatio > 0 
    ? (totalFixedCosts / months) / contributionMarginRatio 
    : Infinity;
  
  // 연간 손익분기점 매출액
  const annualBreakEvenRevenue = monthlyBreakEvenRevenue * 12;
  
  // 손익분기점 도달 여부
  const isBreakEven = summary.netProfit >= 0;
  
  // 손익분기점 도달 월 추정 (단순 비례 계산)
  let breakEvenMonth = 0;
  if (isBreakEven && summary.totalRevenue > 0) {
    // 총 매출 중 손익분기점 매출의 비율로 월 추정
    const breakEvenRevenue = totalFixedCosts / contributionMarginRatio;
    const breakEvenRatio = breakEvenRevenue / summary.totalRevenue;
    breakEvenMonth = Math.ceil(months * breakEvenRatio);
    breakEvenMonth = Math.min(breakEvenMonth, months); // 최대 시뮬레이션 기간으로 제한
  }
  
  // 손익분기점 도달까지 필요한 추가 매출
  const revenueGapToBreakEven = isBreakEven 
    ? 0 
    : Math.abs(summary.netProfit) / contributionMarginRatio;
  
  return {
    breakEvenMonth,
    breakEvenRevenue: isBreakEven ? totalFixedCosts / contributionMarginRatio : 0,
    breakEvenCustomers: isBreakEven ? Math.round(summary.totalCustomers * (breakEvenMonth / months)) : 0,
    monthlyBreakEvenRevenue,
    annualBreakEvenRevenue,
    totalFixedCosts,
    variableCostRatio,
    contributionMarginRatio,
    revenueGapToBreakEven,
  };
}

/**
 * 빈 손익분기점 분석 결과를 생성합니다.
 */
function createEmptyBreakEvenAnalysis(): BreakEvenAnalysis {
  return {
    breakEvenMonth: 0,
    breakEvenRevenue: 0,
    breakEvenCustomers: 0,
    monthlyBreakEvenRevenue: 0,
    annualBreakEvenRevenue: 0,
    totalFixedCosts: 0,
    variableCostRatio: 0.3,
    contributionMarginRatio: 0.7,
    revenueGapToBreakEven: 0,
  };
}
