import { SaasInputs, CostInputs, SimulationResult, MonthlyResult, SummaryResult, ChannelInfo } from '@/types';
import { calculateFunnelConversion, getFunnelConversionRate } from './funnelCalculator';
import { applyGrowthRates } from './growthRateCalculator';
import { applyQuarterlyDetailedSettings } from './quarterlyDetailedCalculator';

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
    
    // 분기별 세부 설정 적용
    const quarterlyAdjustedMetrics = applyQuarterlyDetailedSettings(
      i,
      saasInputs.quarterlyDetailedSettings,
      'saas',
      {
        conversionRate: saasInputs.visitorToSignupRate,
        price: saasInputs.monthlyPrice,
        visitors: growthAdjustedVisitors,
        churnRate: saasInputs.monthlyChurnRate,
      }
    );

    // 조정된 방문자 수 사용
    const adjustedVisitors = quarterlyAdjustedMetrics.visitors || growthAdjustedVisitors;
    
    // 채널별 방문자 수 및 비용 계산
    const channelData = calculateChannelMetrics(adjustedVisitors, saasInputs.channels);
    
    // 맞춤형 퍼널 적용 (사용하지 않지만 향후 확장을 위해 유지)
    // const funnelConversionRate = getFunnelConversionRate(
    //   saasInputs.customFunnels,
    //   saasInputs.activeFunnelId
    // );
    
    // 고객 계산 (퍼널 적용, 분기별 조정된 전환율 사용)
    const adjustedConversionRate = quarterlyAdjustedMetrics.conversionRate || saasInputs.visitorToSignupRate;
    const newSignups = Math.round(
      calculateFunnelConversion(
        adjustedVisitors,
        saasInputs.customFunnels,
        saasInputs.activeFunnelId,
        adjustedConversionRate
      )
    );
    const newPaidCustomers = Math.round(newSignups * saasInputs.signupToPaidRate);
    const adjustedChurnRate = quarterlyAdjustedMetrics.churnRate || saasInputs.monthlyChurnRate;
    const churnedCustomers = Math.round(activeCustomers * adjustedChurnRate);
    
    activeCustomers = Math.max(0, activeCustomers + newPaidCustomers - churnedCustomers);
    
    // 매출 계산 (분기별 조정된 가격 사용)
    const adjustedPrice = quarterlyAdjustedMetrics.price || saasInputs.monthlyPrice;
    const monthlyRevenue = activeCustomers * adjustedPrice;
    const annualRevenue = activeCustomers * saasInputs.annualPrice * (1 - saasInputs.annualDiscountRate) / 12;
    const totalMonthlyRevenue = monthlyRevenue + annualRevenue;
    
    // 성장률 적용된 매출
    const growthAdjustedRevenue = applyGrowthRates(
      { revenue: totalMonthlyRevenue },
      i,
      saasInputs.growthRateSettings
    ).revenue;
    
    // 비용 계산 (채널별 마케팅 비용 포함)
    const paymentFee = growthAdjustedRevenue * costInputs.paymentFeeRate;
    const channelMarketingCost = channelData.totalCost;
    const totalMonthlyCosts = channelMarketingCost + costInputs.personnelCost + costInputs.otherFixedCosts + paymentFee;
    
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
      channelData: channelData,
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

function calculateCAC(saasInputs: SaasInputs, _costInputs: CostInputs): number {
  const monthlyNewCustomers = Math.round(
    saasInputs.monthlyVisitors * 
    saasInputs.visitorToSignupRate * 
    saasInputs.signupToPaidRate
  );
  
  if (monthlyNewCustomers === 0) return 0;
  
  // 채널별 마케팅 비용 포함
  const channelData = calculateChannelMetrics(saasInputs.monthlyVisitors, saasInputs.channels);
  const totalMarketingCost = channelData.totalCost;
  
  return totalMarketingCost / monthlyNewCustomers;
}

// 채널별 지표 계산 함수
function calculateChannelMetrics(totalVisitors: number, channels: ChannelInfo[]) {
  const channelData = channels.map(channel => ({
    ...channel,
    visitors: Math.round(totalVisitors * channel.percentage),
    cost: Math.round(totalVisitors * channel.percentage * (channel.costPerVisitor || 0)),
  }));
  
  const totalCost = channelData.reduce((sum, channel) => sum + channel.cost, 0);
  
  return {
    channels: channelData,
    totalCost,
    totalVisitors: channelData.reduce((sum, channel) => sum + channel.visitors, 0),
  };
}

