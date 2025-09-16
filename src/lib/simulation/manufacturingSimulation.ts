import { ManufacturingInputs, CostInputs, SimulationResult, MonthlyResult, SummaryResult } from '@/types';

export function runManufacturingSimulation(
  manufacturingInputs: ManufacturingInputs,
  costInputs: CostInputs,
  startMonth: string,
  months: number = 12
): SimulationResult {
  const monthlyResults: Record<string, MonthlyResult> = {};
  let totalRevenue = 0;
  let totalCosts = 0;
  let totalSales = 0;

  // 월별 시뮬레이션
  for (let i = 0; i < months; i++) {
    const currentMonth = getMonthString(startMonth, i);
    
    // 판매량 계산 (생산 능력 제한 고려)
    const actualSales = Math.min(manufacturingInputs.monthlySales, manufacturingInputs.productionCapacity);
    
    // 매출 계산
    const monthlyRevenue = actualSales * manufacturingInputs.unitPrice;
    
    // 원가 계산
    const materialCost = actualSales * manufacturingInputs.materialCostPerUnit;
    const laborCost = actualSales * manufacturingInputs.laborCostPerUnit;
    const shippingCost = actualSales * manufacturingInputs.shippingCostPerUnit;
    const otherVariableCost = actualSales * manufacturingInputs.otherVariableCostPerUnit;
    const costOfGoodsSold = materialCost + laborCost + shippingCost + otherVariableCost;
    
    // 총 비용 계산
    const paymentFee = monthlyRevenue * costInputs.paymentFeeRate;
    const totalMonthlyCosts = costInputs.marketingCost + costInputs.personnelCost + costInputs.otherFixedCosts + costOfGoodsSold + paymentFee;
    
    // 마진 계산
    const grossMargin = monthlyRevenue - costOfGoodsSold;
    
    // 순이익 계산
    const netProfit = monthlyRevenue - totalMonthlyCosts;
    const profitMargin = monthlyRevenue > 0 ? netProfit / monthlyRevenue : 0;
    
    // 누적 계산
    totalRevenue += monthlyRevenue;
    totalCosts += totalMonthlyCosts;
    totalSales += actualSales;
    
    monthlyResults[currentMonth] = {
      revenue: monthlyRevenue,
      customers: actualSales, // 제조업에서는 판매량이 고객 수와 유사
      sales: actualSales,
      production: actualSales,
      costOfGoodsSold,
      grossMargin,
      totalCosts: totalMonthlyCosts,
      netProfit,
      profitMargin,
    };
  }
  
  // 요약 결과
  const summary: SummaryResult = {
    totalRevenue,
    totalCustomers: totalSales,
    totalCosts,
    netProfit: totalRevenue - totalCosts,
    averageProfitMargin: totalRevenue > 0 ? (totalRevenue - totalCosts) / totalRevenue : 0,
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
