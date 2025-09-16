import { ManufacturingInputs, CostInputs, SimulationResult, MonthlyResult, SummaryResult } from '@/types';
import { applyGrowthRates } from './growthRateCalculator';
import { applyQuarterlyDetailedSettings } from './quarterlyDetailedCalculator';

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
    
    // 성장률 적용된 판매량
    const growthAdjustedSales = applyGrowthRates(
      { customers: manufacturingInputs.monthlySales },
      i,
      manufacturingInputs.growthRateSettings
    ).customers;
    
    // 분기별 세부 설정 적용
    const quarterlyAdjustedMetrics = applyQuarterlyDetailedSettings(
      i,
      manufacturingInputs.quarterlyDetailedSettings,
      'manufacturing',
      {
        price: manufacturingInputs.unitPrice,
        sales: growthAdjustedSales,
        cost: manufacturingInputs.materialCostPerUnit,
      }
    );

    // 조정된 판매량 사용
    const adjustedSales = quarterlyAdjustedMetrics.sales || growthAdjustedSales;
    
    // 판매량 계산 (생산 능력 제한 고려)
    const actualSales = Math.min(adjustedSales, manufacturingInputs.productionCapacity);
    
    // 매출 계산 (분기별 조정된 가격 사용)
    const adjustedPrice = quarterlyAdjustedMetrics.price || manufacturingInputs.unitPrice;
    const monthlyRevenue = actualSales * adjustedPrice;
    
    // 성장률 적용된 매출
    const growthAdjustedRevenue = applyGrowthRates(
      { revenue: monthlyRevenue },
      i,
      manufacturingInputs.growthRateSettings
    ).revenue;
    
    // 원가 계산
    const materialCost = actualSales * manufacturingInputs.materialCostPerUnit;
    const laborCost = actualSales * manufacturingInputs.laborCostPerUnit;
    const shippingCost = actualSales * manufacturingInputs.shippingCostPerUnit;
    const otherVariableCost = actualSales * manufacturingInputs.otherVariableCostPerUnit;
    const costOfGoodsSold = materialCost + laborCost + shippingCost + otherVariableCost;
    
    // 총 비용 계산 (성장률 적용된 매출 기준)
    const paymentFee = growthAdjustedRevenue * costInputs.paymentFeeRate;
    const totalMonthlyCosts = costInputs.marketingCost + costInputs.personnelCost + costInputs.otherFixedCosts + costOfGoodsSold + paymentFee;
    
    // 마진 계산
    const grossMargin = growthAdjustedRevenue - costOfGoodsSold;
    
    // 순이익 계산
    const netProfit = growthAdjustedRevenue - totalMonthlyCosts;
    const profitMargin = growthAdjustedRevenue > 0 ? netProfit / growthAdjustedRevenue : 0;
    
    // 누적 계산
    totalRevenue += growthAdjustedRevenue;
    totalCosts += totalMonthlyCosts;
    totalSales += actualSales;
    
    monthlyResults[currentMonth] = {
      revenue: growthAdjustedRevenue,
      customers: Math.round(actualSales), // 제조업에서는 판매량이 고객 수와 유사
      sales: Math.round(actualSales),
      production: Math.round(actualSales),
      costOfGoodsSold,
      grossMargin,
      totalCosts: totalMonthlyCosts,
      netProfit,
      profitMargin,
    };
  }
  
  // LTV/CAC 계산
  const ltv = calculateManufacturingLTV(manufacturingInputs);
  const cac = calculateManufacturingCAC(manufacturingInputs, costInputs);

  // 요약 결과
  const summary: SummaryResult = {
    totalRevenue,
    totalCustomers: totalSales,
    totalCosts,
    netProfit: totalRevenue - totalCosts,
    averageProfitMargin: totalRevenue > 0 ? (totalRevenue - totalCosts) / totalRevenue : 0,
    ltv,
    cac,
  };
  
  return {
    monthly: monthlyResults,
    summary,
  };
}

function calculateManufacturingLTV(manufacturingInputs: ManufacturingInputs): number {
  // Manufacturing LTV = 단위당 마진 × 고객당 평균 구매량 × 고객 생존 기간
  const unitPrice = manufacturingInputs.unitPrice;
  const materialCost = manufacturingInputs.materialCostPerUnit;
  const laborCost = manufacturingInputs.laborCostPerUnit;
  const shippingCost = manufacturingInputs.shippingCostPerUnit;
  const otherVariableCost = manufacturingInputs.otherVariableCostPerUnit;
  
  const unitMargin = unitPrice - (materialCost + laborCost + shippingCost + otherVariableCost);
  const monthlySales = manufacturingInputs.monthlySales;
  const customerLifespan = 12; // 제조업은 일반적으로 1년으로 가정
  
  return unitMargin * monthlySales * customerLifespan;
}

function calculateManufacturingCAC(manufacturingInputs: ManufacturingInputs, costInputs: CostInputs): number {
  // Manufacturing CAC = 마케팅 비용 / 신규 고객 수
  const monthlySales = manufacturingInputs.monthlySales;
  const monthlyNewCustomers = Math.round(monthlySales); // 제조업에서는 판매량이 고객 수와 유사
  
  if (monthlyNewCustomers === 0) return 0;
  
  // 마케팅 비용
  const totalMarketingCost = costInputs.marketingCost;
  
  return totalMarketingCost / monthlyNewCustomers;
}

function getMonthString(startMonth: string, offset: number): string {
  const [year, month] = startMonth.split('-').map(Number);
  const date = new Date(year, month - 1 + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
