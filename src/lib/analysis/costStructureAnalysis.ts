import { MonthlyResult, CostInputs } from '@/types';

/**
 * 비용 구조 분석 결과 타입
 */
export interface CostStructureAnalysis {
  // 고정 비용 항목별 금액
  fixedCosts: {
    personnel: number;
    marketing: number;
    other: number;
    total: number;
  };
  
  // 변동 비용 항목별 금액
  variableCosts: {
    cogs?: number; // 제조/유통 전용
    payment: number;
    shipping?: number; // 제조/유통 전용
    other: number;
    total: number;
  };
  
  // 총 비용
  totalCosts: number;
  
  // 고정비 비율 (0-1)
  fixedCostRatio: number;
  
  // 변동비 비율 (0-1)
  variableCostRatio: number;
  
  // 매출 대비 비용 비율
  costToRevenueRatio: number;
  
  // 규모별 비용 효율성 (매출 구간별 비용 비율)
  scaleEfficiency: {
    revenue: number;
    costRatio: number;
  }[];
}

/**
 * 비용 구조 분석을 수행합니다.
 * 
 * @param monthlyResults 월간 시뮬레이션 결과
 * @param costInputs 비용 입력 데이터
 * @param fixedMarketingRatio 마케팅 비용 중 고정 비용 비율 (기본값: 0.5)
 * @returns 비용 구조 분석 결과
 */
export function analyzeCostStructure(
  monthlyResults: Record<string, MonthlyResult>,
  costInputs: CostInputs,
  fixedMarketingRatio: number = 0.5
): CostStructureAnalysis {
  const months = Object.values(monthlyResults);
  if (months.length === 0) {
    return createEmptyCostStructureAnalysis();
  }
  
  // 총 매출
  const totalRevenue = months.reduce((sum, month) => sum + month.revenue, 0);
  
  // 고정 비용 계산
  const fixedPersonnel = costInputs.personnelCost * months.length;
  const fixedMarketing = costInputs.marketingCost * months.length * fixedMarketingRatio;
  const fixedOther = costInputs.otherFixedCosts * months.length;
  const totalFixedCosts = fixedPersonnel + fixedMarketing + fixedOther;
  
  // 변동 비용 계산
  const variableMarketing = costInputs.marketingCost * months.length * (1 - fixedMarketingRatio);
  
  // 제품 원가 (COGS) 계산
  let cogs = 0;
  if (months.some(month => month.costOfGoodsSold !== undefined)) {
    cogs = months.reduce((sum, month) => sum + (month.costOfGoodsSold || 0), 0);
  }
  
  // 결제 수수료 계산
  const paymentFees = totalRevenue * costInputs.paymentFeeRate;
  
  // 배송 비용 계산
  let shippingCosts = 0;
  if (costInputs.shippingCostPerUnit) {
    const totalUnits = months.reduce((sum, month) => sum + (month.sales || 0), 0);
    shippingCosts = totalUnits * costInputs.shippingCostPerUnit;
  }
  
  // 기타 변동 비용 (총 비용에서 식별된 비용을 뺀 나머지)
  const totalCosts = months.reduce((sum, month) => sum + month.totalCosts, 0);
  const identifiedCosts = totalFixedCosts + variableMarketing + cogs + paymentFees + shippingCosts;
  const otherVariableCosts = Math.max(0, totalCosts - identifiedCosts);
  
  // 총 변동 비용
  const totalVariableCosts = variableMarketing + cogs + paymentFees + shippingCosts + otherVariableCosts;
  
  // 비율 계산
  const fixedCostRatio = totalCosts > 0 ? totalFixedCosts / totalCosts : 0;
  const variableCostRatio = totalCosts > 0 ? totalVariableCosts / totalCosts : 0;
  const costToRevenueRatio = totalRevenue > 0 ? totalCosts / totalRevenue : 0;
  
  // 규모별 비용 효율성 분석
  const scaleEfficiency = analyzeScaleEfficiency(months);
  
  return {
    fixedCosts: {
      personnel: fixedPersonnel,
      marketing: fixedMarketing,
      other: fixedOther,
      total: totalFixedCosts,
    },
    variableCosts: {
      cogs: cogs || undefined,
      payment: paymentFees,
      shipping: shippingCosts || undefined,
      other: otherVariableCosts + variableMarketing,
      total: totalVariableCosts,
    },
    totalCosts,
    fixedCostRatio,
    variableCostRatio,
    costToRevenueRatio,
    scaleEfficiency,
  };
}

/**
 * 매출 규모별 비용 효율성을 분석합니다.
 * 
 * @param months 월간 결과 배열
 * @returns 매출 구간별 비용 비율
 */
function analyzeScaleEfficiency(months: MonthlyResult[]): { revenue: number; costRatio: number }[] {
  if (months.length === 0) return [];
  
  // 매출 기준으로 정렬
  const sortedMonths = [...months].sort((a, b) => a.revenue - b.revenue);
  
  // 매출 구간 나누기 (4개 구간)
  const quartiles: { revenue: number; costRatio: number }[] = [];
  
  // 4개 구간으로 나누기 위한 인덱스 계산
  const step = Math.max(1, Math.floor(sortedMonths.length / 4));
  
  for (let i = 0; i < 4; i++) {
    const startIdx = i * step;
    const endIdx = i === 3 ? sortedMonths.length - 1 : (i + 1) * step - 1;
    
    if (startIdx <= endIdx) {
      const segment = sortedMonths.slice(startIdx, endIdx + 1);
      const avgRevenue = segment.reduce((sum, month) => sum + month.revenue, 0) / segment.length;
      const avgCosts = segment.reduce((sum, month) => sum + month.totalCosts, 0) / segment.length;
      const costRatio = avgRevenue > 0 ? avgCosts / avgRevenue : 0;
      
      quartiles.push({
        revenue: avgRevenue,
        costRatio,
      });
    }
  }
  
  return quartiles;
}

/**
 * 빈 비용 구조 분석 결과를 생성합니다.
 */
function createEmptyCostStructureAnalysis(): CostStructureAnalysis {
  return {
    fixedCosts: {
      personnel: 0,
      marketing: 0,
      other: 0,
      total: 0,
    },
    variableCosts: {
      payment: 0,
      other: 0,
      total: 0,
    },
    totalCosts: 0,
    fixedCostRatio: 0,
    variableCostRatio: 0,
    costToRevenueRatio: 0,
    scaleEfficiency: [],
  };
}

/**
 * 인건비 분석 결과 타입
 */
export interface HRCostAnalysis {
  // 직군별 인건비
  departmentCosts: {
    name: string;
    headcount: number;
    averageSalary: number;
    totalCost: number;
  }[];
  
  // 총 인건비
  totalHRCost: number;
  
  // 매출 대비 인건비 비율
  hrToRevenueRatio: number;
  
  // 총 인원수
  totalHeadcount: number;
  
  // 인당 매출 (Revenue per Employee)
  revenuePerEmployee: number;
}

/**
 * 기본 직군 정보
 */
export interface Department {
  name: string;
  headcount: number;
  averageSalary: number;
}

/**
 * 인건비 분석을 수행합니다.
 * 
 * @param monthlyResults 월간 시뮬레이션 결과
 * @param departments 직군별 정보 (제공되지 않으면 기본 직군 사용)
 * @returns 인건비 분석 결과
 */
export function analyzeHRCosts(
  monthlyResults: Record<string, MonthlyResult>,
  departments?: Department[]
): HRCostAnalysis {
  const months = Object.values(monthlyResults);
  if (months.length === 0) {
    return createEmptyHRCostAnalysis();
  }
  
  // 총 매출
  const totalRevenue = months.reduce((sum, month) => sum + month.revenue, 0);
  
  // 기본 직군 정보 (제공되지 않은 경우)
  const defaultDepartments: Department[] = [
    { name: '개발', headcount: 3, averageSalary: 7000000 },
    { name: '영업/마케팅', headcount: 2, averageSalary: 6000000 },
    { name: '운영/지원', headcount: 1, averageSalary: 5000000 },
    { name: '경영진', headcount: 1, averageSalary: 10000000 },
  ];
  
  const depts = departments || defaultDepartments;
  
  // 직군별 비용 계산
  const departmentCosts = depts.map(dept => ({
    name: dept.name,
    headcount: dept.headcount,
    averageSalary: dept.averageSalary,
    totalCost: dept.headcount * dept.averageSalary * months.length,
  }));
  
  // 총 인건비
  const totalHRCost = departmentCosts.reduce((sum, dept) => sum + dept.totalCost, 0);
  
  // 총 인원수
  const totalHeadcount = departmentCosts.reduce((sum, dept) => sum + dept.headcount, 0);
  
  // 매출 대비 인건비 비율
  const hrToRevenueRatio = totalRevenue > 0 ? totalHRCost / totalRevenue : 0;
  
  // 인당 매출 (Revenue per Employee)
  const revenuePerEmployee = totalHeadcount > 0 ? totalRevenue / totalHeadcount : 0;
  
  return {
    departmentCosts,
    totalHRCost,
    hrToRevenueRatio,
    totalHeadcount,
    revenuePerEmployee,
  };
}

/**
 * 빈 인건비 분석 결과를 생성합니다.
 */
function createEmptyHRCostAnalysis(): HRCostAnalysis {
  return {
    departmentCosts: [],
    totalHRCost: 0,
    hrToRevenueRatio: 0,
    totalHeadcount: 0,
    revenuePerEmployee: 0,
  };
}
