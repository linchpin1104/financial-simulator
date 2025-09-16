import { B2CPlatformInputs, CostInputs, SimulationResult, MonthlyResult, SummaryResult } from '@/types';

export function runB2CPlatformSimulation(
  b2cInputs: B2CPlatformInputs,
  costInputs: CostInputs,
  startMonth: string,
  months: number = 12
): SimulationResult {
  const monthlyResults: Record<string, MonthlyResult> = {};
  let totalCosts = 0;
  let totalOrders = 0;
  let totalGmv = 0;
  let totalPlatformRevenue = 0;
  let totalRefunds = 0;

  // 월별 시뮬레이션
  for (let i = 0; i < months; i++) {
    const currentMonth = getMonthString(startMonth, i);
    
    // 구매자 및 주문 계산
    const monthlyBuyers = Math.round(b2cInputs.monthlyVisitors * b2cInputs.visitorToBuyerRate);
    const monthlyOrders = Math.round(monthlyBuyers * b2cInputs.ordersPerBuyerPerMonth);
    
    // GMV 계산
    const monthlyGmv = monthlyOrders * b2cInputs.averageOrderValue;
    
    // 환불 계산
    const monthlyRefunds = monthlyGmv * b2cInputs.refundRate;
    const netGmv = monthlyGmv - monthlyRefunds;
    
    // 플랫폼 매출 계산
    const takeRateRevenue = netGmv * b2cInputs.takeRate;
    const fixedFeeRevenue = monthlyOrders * b2cInputs.fixedFeePerOrder;
    const adRevenue = b2cInputs.adRevenuePerMonth;
    const platformRevenue = takeRateRevenue + fixedFeeRevenue + adRevenue;
    
    // 비용 계산
    const paymentFee = platformRevenue * costInputs.paymentFeeRate;
    const totalMonthlyCosts = costInputs.marketingCost + costInputs.personnelCost + costInputs.otherFixedCosts + paymentFee;
    
    // 순이익 계산
    const netProfit = platformRevenue - totalMonthlyCosts;
    const profitMargin = platformRevenue > 0 ? netProfit / platformRevenue : 0;
    
    // 누적 계산
    totalCosts += totalMonthlyCosts;
    totalOrders += monthlyOrders;
    totalGmv += monthlyGmv;
    totalPlatformRevenue += platformRevenue;
    totalRefunds += monthlyRefunds;
    
    monthlyResults[currentMonth] = {
      revenue: platformRevenue,
      customers: monthlyBuyers,
      orders: monthlyOrders,
      gmv: monthlyGmv,
      platformRevenue,
      totalCosts: totalMonthlyCosts,
      netProfit,
      profitMargin,
    };
  }
  
  // 요약 결과
  const summary: SummaryResult = {
    totalRevenue: totalPlatformRevenue,
    totalCustomers: Math.round(totalOrders / b2cInputs.ordersPerBuyerPerMonth),
    totalOrders,
    totalGmv,
    totalPlatformRevenue,
    totalCosts,
    netProfit: totalPlatformRevenue - totalCosts,
    averageProfitMargin: totalPlatformRevenue > 0 ? (totalPlatformRevenue - totalCosts) / totalPlatformRevenue : 0,
    averageTakeRate: b2cInputs.takeRate,
    totalRefunds,
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
