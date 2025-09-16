import { SaasInputs, CostInputs, SimulationResult, MonthlyResult, SummaryResult } from '@/types';
import { calculateFunnelConversion } from './funnelCalculator';
import { applyGrowthRates } from './growthRateCalculator';

export function runSaasSimulation(
  saasInputs: SaasInputs,
  costInputs: CostInputs,
  startMonth: string,
  months: number = 12
): SimulationResult {
  const monthlyResults: Record<string, MonthlyResult> = {};
  let activeCustomers = 0;
  let totalRevenue = 0;
  let totalCosts = 0;
  let totalCustomers = 0;

  // 월별 시뮬레이션
  for (let i = 0; i < months; i++) {
    const currentMonth = getMonthString(startMonth, i);
    
    // 성장률 적용된 방문자 수
    const growthAdjustedVisitors = applyGrowthRates(
      { customers: saasInputs.monthlyVisitors },
      i,
      saasInputs.growthRateSettings
    ).customers;
    
    // 맞춤형 퍼널 적용 (현재는 사용하지 않지만 향후 확장 가능)
    // const funnelConversionRate = getFunnelConversionRate(
    //   saasInputs.customFunnels,
    //   saasInputs.activeFunnelId
    // );
    
    // 고객 계산 (퍼널 적용)
    const newSignups = Math.round(
      calculateFunnelConversion(
        growthAdjustedVisitors,
        saasInputs.customFunnels,
        saasInputs.activeFunnelId,
        saasInputs.visitorToSignupRate
      )
    );
    
    const newPaidCustomers = Math.round(newSignups * saasInputs.signupToPaidRate);
    const churnedCustomers = Math.round(activeCustomers * saasInputs.monthlyChurnRate);
    
    activeCustomers = Math.max(0, activeCustomers + newPaidCustomers - churnedCustomers);
    
    // 매출 계산
    const monthlyRevenue = activeCustomers * saasInputs.monthlyPrice;
    const annualRevenue = activeCustomers * saasInputs.annualPrice * (1 - saasInputs.annualDiscountRate) / 12;
    const totalMonthlyRevenue = monthlyRevenue + annualRevenue;
    
    // 성장률 적용된 매출
    const growthAdjustedRevenue = applyGrowthRates(
      { revenue: totalMonthlyRevenue },
      i,
      saasInputs.growthRateSettings
    ).revenue;
    
    // 비용 계산 (성장률 적용된 매출 기준)
    const paymentFee = growthAdjustedRevenue * costInputs.paymentFeeRate;
    const totalMonthlyCosts = costInputs.marketingCost + costInputs.personnelCost + costInputs.otherFixedCosts + paymentFee;
    
    // 순이익 계산
    const netProfit = growthAdjustedRevenue - totalMonthlyCosts;
    const profitMargin = growthAdjustedRevenue > 0 ? netProfit / growthAdjustedRevenue : 0;
    
    // 누적 계산
    totalRevenue += growthAdjustedRevenue;
    totalCosts += totalMonthlyCosts;
    totalCustomers += newPaidCustomers;
    
    monthlyResults[currentMonth] = {
      revenue: growthAdjustedRevenue,
      customers: activeCustomers,
      visitors: Math.round(growthAdjustedVisitors),
      signups: newSignups,
      paidCustomers: newPaidCustomers,
      mrr: monthlyRevenue,
      totalCosts: totalMonthlyCosts,
      netProfit,
      profitMargin,
    };
  }
  
  // 요약 결과
  const summary: SummaryResult = {
    totalRevenue,
    totalCustomers,
    totalCosts,
    netProfit: totalRevenue - totalCosts,
    averageProfitMargin: totalRevenue > 0 ? (totalRevenue - totalCosts) / totalRevenue : 0,
    mrr: monthlyResults[getMonthString(startMonth, months - 1)]?.mrr || 0,
    arr: (monthlyResults[getMonthString(startMonth, months - 1)]?.mrr || 0) * 12,
    ltv: calculateLTV(saasInputs),
    cac: calculateCAC(saasInputs, costInputs),
  };
  
  return {
    monthly: monthlyResults,
    summary,
  };
}

function getMonthString(startMonth: string, offset: number): string {
  const [year, month] = startMonth.split('-').map(Number);
  const date = new Date(year, month - 1 + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function calculateLTV(saasInputs: SaasInputs): number {
  const monthlyChurnRate = saasInputs.monthlyChurnRate;
  const monthlyPrice = saasInputs.monthlyPrice;
  
  if (monthlyChurnRate === 0) return Infinity;
  
  return monthlyPrice / monthlyChurnRate;
}

function calculateCAC(saasInputs: SaasInputs, costInputs: CostInputs): number {
  const monthlyNewCustomers = Math.round(
    saasInputs.monthlyVisitors * 
    saasInputs.visitorToSignupRate * 
    saasInputs.signupToPaidRate
  );
  
  if (monthlyNewCustomers === 0) return 0;
  
  return costInputs.marketingCost / monthlyNewCustomers;
}
