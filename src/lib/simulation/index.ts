import { BusinessType, SaasInputs, ManufacturingInputs, B2CPlatformInputs, CostInputs, SimulationResult, MonthlyResult } from '@/types';
import { runSaasSimulation } from './saasSimulation';
import { runManufacturingSimulation } from './manufacturingSimulation';
import { runB2CPlatformSimulation } from './b2cPlatformSimulation';

export interface SimulationInputs {
  businessType: BusinessType;
  saasInputs?: SaasInputs;
  manufacturingInputs?: ManufacturingInputs;
  b2cPlatformInputs?: B2CPlatformInputs;
  costInputs: CostInputs;
  startMonth: string;
  months?: number;
}

export function runSimulation(inputs: SimulationInputs): SimulationResult {
  const { businessType, costInputs, startMonth, months = 12 } = inputs;
  
  switch (businessType) {
    case 'saas':
      if (!inputs.saasInputs) {
        throw new Error('SaaS inputs are required for SaaS simulation');
      }
      return runSaasSimulation(inputs.saasInputs, costInputs, startMonth, months);
      
    case 'manufacturing':
      if (!inputs.manufacturingInputs) {
        throw new Error('Manufacturing inputs are required for manufacturing simulation');
      }
      return runManufacturingSimulation(inputs.manufacturingInputs, costInputs, startMonth, months);
      
    case 'b2c-platform':
      if (!inputs.b2cPlatformInputs) {
        throw new Error('B2C platform inputs are required for B2C platform simulation');
      }
      return runB2CPlatformSimulation(inputs.b2cPlatformInputs, costInputs, startMonth, months);
      
    case 'hybrid':
      // 복합형의 경우 SaaS와 제조를 모두 실행하고 결과를 합산
      if (!inputs.saasInputs || !inputs.manufacturingInputs) {
        throw new Error('Both SaaS and manufacturing inputs are required for hybrid simulation');
      }
      
      const saasResult = runSaasSimulation(inputs.saasInputs, costInputs, startMonth, months);
      const manufacturingResult = runManufacturingSimulation(inputs.manufacturingInputs, costInputs, startMonth, months);
      
      return combineSimulationResults(saasResult, manufacturingResult);
      
    default:
      throw new Error(`Unsupported business type: ${businessType}`);
  }
}

function combineSimulationResults(saasResult: SimulationResult, manufacturingResult: SimulationResult): SimulationResult {
  const combinedMonthly: Record<string, MonthlyResult> = {};
  const months = Object.keys(saasResult.monthly);
  
  for (const month of months) {
    const saasMonthly = saasResult.monthly[month];
    const manufacturingMonthly = manufacturingResult.monthly[month];
    
    combinedMonthly[month] = {
      revenue: (saasMonthly?.revenue || 0) + (manufacturingMonthly?.revenue || 0),
      customers: (saasMonthly?.customers || 0) + (manufacturingMonthly?.customers || 0),
      totalCosts: (saasMonthly?.totalCosts || 0) + (manufacturingMonthly?.totalCosts || 0),
      netProfit: (saasMonthly?.netProfit || 0) + (manufacturingMonthly?.netProfit || 0),
      profitMargin: 0, // 계산 필요
      // SaaS 전용
      visitors: saasMonthly?.visitors || 0,
      signups: saasMonthly?.signups || 0,
      paidCustomers: saasMonthly?.paidCustomers || 0,
      mrr: saasMonthly?.mrr || 0,
      // 제조 전용
      sales: manufacturingMonthly?.sales || 0,
      production: manufacturingMonthly?.production || 0,
      costOfGoodsSold: manufacturingMonthly?.costOfGoodsSold || 0,
      grossMargin: manufacturingMonthly?.grossMargin || 0,
    };
    
    // 마진율 재계산
    if (combinedMonthly[month].revenue > 0) {
      combinedMonthly[month].profitMargin = combinedMonthly[month].netProfit / combinedMonthly[month].revenue;
    }
  }
  
  const combinedSummary = {
    totalRevenue: saasResult.summary.totalRevenue + manufacturingResult.summary.totalRevenue,
    totalCustomers: saasResult.summary.totalCustomers + manufacturingResult.summary.totalCustomers,
    totalCosts: saasResult.summary.totalCosts + manufacturingResult.summary.totalCosts,
    netProfit: saasResult.summary.netProfit + manufacturingResult.summary.netProfit,
    averageProfitMargin: 0, // 계산 필요
    // SaaS 전용
    mrr: saasResult.summary.mrr,
    arr: saasResult.summary.arr,
    ltv: saasResult.summary.ltv,
    cac: saasResult.summary.cac,
  };
  
  // 평균 마진율 계산
  if (combinedSummary.totalRevenue > 0) {
    combinedSummary.averageProfitMargin = combinedSummary.netProfit / combinedSummary.totalRevenue;
  }
  
  return {
    monthly: combinedMonthly,
    summary: combinedSummary,
  };
}
