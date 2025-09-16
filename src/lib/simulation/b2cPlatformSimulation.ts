import { B2CPlatformInputs, CostInputs, SimulationResult, MonthlyResult, SummaryResult, SupplierInfo } from '@/types';
import { applyGrowthRates } from './growthRateCalculator';
import { applyQuarterlyDetailedSettings } from './quarterlyDetailedCalculator';

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
  let activeSuppliers = b2cInputs.suppliers.activeSuppliers;

  // 월별 시뮬레이션
  for (let i = 0; i < months; i++) {
    const currentMonth = getMonthString(startMonth, i);
    
    // 성장률 적용된 방문자 수
    const growthAdjustedVisitors = applyGrowthRates(
      { customers: b2cInputs.monthlyVisitors },
      i,
      b2cInputs.growthRateSettings
    ).customers;
    
    // 분기별 세부 설정 적용
    const quarterlyAdjustedMetrics = applyQuarterlyDetailedSettings(
      i,
      b2cInputs.quarterlyDetailedSettings,
      'b2c-platform',
      {
        conversionRate: b2cInputs.visitorToBuyerRate,
        price: b2cInputs.averageOrderValue,
        visitors: growthAdjustedVisitors,
        refundRate: b2cInputs.refundRate,
        takeRate: b2cInputs.takeRate,
      }
    );

    // 조정된 방문자 수 사용
    const adjustedVisitors = quarterlyAdjustedMetrics.visitors || growthAdjustedVisitors;
    
    // 구매자 및 주문 계산 (분기별 조정된 전환율 사용)
    const adjustedConversionRate = quarterlyAdjustedMetrics.conversionRate || b2cInputs.visitorToBuyerRate;
    const monthlyBuyers = Math.round(adjustedVisitors * adjustedConversionRate);
    const monthlyOrders = Math.round(monthlyBuyers * b2cInputs.ordersPerBuyerPerMonth);
    
    // 성장률 적용된 주문 수
    const growthAdjustedOrders = applyGrowthRates(
      { orders: monthlyOrders },
      i,
      b2cInputs.growthRateSettings
    ).orders || monthlyOrders;
    
    // 공급자 여정 계산
    const supplierData = calculateSupplierMetrics(
      activeSuppliers,
      b2cInputs.suppliers,
      i
    );
    
    // GMV 계산 (기존 주문 + 공급자 기반, 분기별 조정된 가격 사용)
    const adjustedOrderValue = quarterlyAdjustedMetrics.price || b2cInputs.averageOrderValue;
    const customerGmv = growthAdjustedOrders * adjustedOrderValue;
    const supplierGmv = supplierData.totalRevenue;
    const monthlyGmv = customerGmv + supplierGmv;
    
    // 성장률 적용된 GMV
    const growthAdjustedGmv = applyGrowthRates(
      { revenue: monthlyGmv },
      i,
      b2cInputs.growthRateSettings
    ).revenue;
    
    // 환불 계산 (성장률 적용된 GMV 기준, 분기별 조정된 환불률 사용)
    const adjustedRefundRate = quarterlyAdjustedMetrics.refundRate || b2cInputs.refundRate;
    const monthlyRefunds = growthAdjustedGmv * adjustedRefundRate;
    const netGmv = growthAdjustedGmv - monthlyRefunds;
    
    // 플랫폼 매출 계산 (분기별 조정된 테이크레이트 사용)
    const adjustedTakeRate = quarterlyAdjustedMetrics.takeRate || b2cInputs.takeRate;
    const takeRateRevenue = netGmv * adjustedTakeRate;
    const fixedFeeRevenue = growthAdjustedOrders * b2cInputs.fixedFeePerOrder;
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
    totalOrders += Math.round(growthAdjustedOrders);
    totalGmv += growthAdjustedGmv;
    totalPlatformRevenue += platformRevenue;
    totalRefunds += monthlyRefunds;
    
    // 다음 달을 위한 공급자 수 업데이트
    activeSuppliers += b2cInputs.suppliers.newSuppliersPerMonth;
    
    monthlyResults[currentMonth] = {
      revenue: platformRevenue,
      customers: monthlyBuyers,
      orders: Math.round(growthAdjustedOrders),
      gmv: growthAdjustedGmv,
      platformRevenue,
      totalCosts: totalMonthlyCosts,
      netProfit,
      profitMargin,
      supplierData: supplierData,
    };
  }
  
  // LTV/CAC 계산
  const ltv = calculateB2CLTV(b2cInputs);
  const cac = calculateB2CCAC(b2cInputs, costInputs);

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
    ltv,
    cac,
  };
  
  return {
    monthly: monthlyResults,
    summary,
  };
}

function calculateB2CLTV(b2cInputs: B2CPlatformInputs): number {
  // B2C Platform LTV = (평균 주문 가치 × 월간 주문 수 × 고객 생존 기간) × 테이크레이트
  const averageOrderValue = b2cInputs.averageOrderValue;
  const ordersPerMonth = b2cInputs.ordersPerBuyerPerMonth;
  const monthlyChurnRate = b2cInputs.refundRate; // 환불률을 이탈률로 간주
  const takeRate = b2cInputs.takeRate;
  
  if (monthlyChurnRate >= 1) return 0; // 100% 이탈률인 경우
  
  const customerLifespan = monthlyChurnRate > 0 ? 1 / monthlyChurnRate : 12; // 월 단위
  const monthlyRevenue = averageOrderValue * ordersPerMonth * takeRate;
  
  return monthlyRevenue * customerLifespan;
}

function calculateB2CCAC(b2cInputs: B2CPlatformInputs, costInputs: CostInputs): number {
  // B2C Platform CAC = 마케팅 비용 / 신규 고객 수
  const monthlyVisitors = b2cInputs.monthlyVisitors;
  const conversionRate = b2cInputs.visitorToBuyerRate;
  const monthlyNewCustomers = Math.round(monthlyVisitors * conversionRate);
  
  if (monthlyNewCustomers === 0) return 0;
  
  // 마케팅 비용 (월간 마케팅 비용 사용)
  const totalMarketingCost = costInputs.marketingCost;
  
  return totalMarketingCost / monthlyNewCustomers;
}


function getMonthString(startMonth: string, offset: number): string {
  const [year, month] = startMonth.split('-').map(Number);
  const date = new Date(year, month - 1 + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

// 공급자 지표 계산 함수
function calculateSupplierMetrics(
  activeSuppliers: number,
  supplierInfo: SupplierInfo,
  _monthIndex: number
) {
  // 공급자당 평균 상품 수
  const totalListings = activeSuppliers * supplierInfo.averageListingsPerSupplier;
  
  // 공급자 기반 총 매출 (공급자당 평균 매출 * 활성 공급자 수)
  const totalRevenue = activeSuppliers * supplierInfo.averageRevenuePerSupplier;
  
  // 공급자 기반 주문 수 (추정)
  const estimatedOrders = Math.round(totalRevenue / 50); // 평균 주문당 50달러 가정
  
  return {
    activeSuppliers,
    totalListings,
    totalRevenue,
    estimatedOrders,
    averageRevenuePerSupplier: supplierInfo.averageRevenuePerSupplier,
    averageListingsPerSupplier: supplierInfo.averageListingsPerSupplier,
  };
}
