// 사업 유형 정의
export type BusinessType = 'saas' | 'manufacturing' | 'b2c-platform' | 'hybrid';

// 통화 타입
export type Currency = 'KRW' | 'USD' | 'EUR' | 'JPY';

// 온보딩 데이터
export interface OnboardingData {
  companyName: string;
  startMonth: string; // YYYY-MM 형식
  currency: Currency;
  businessType: BusinessType;
  currentRevenue?: number;
  currentCustomers?: number;
  mainCosts?: number;
}

// 채널 정보
export interface ChannelInfo {
  name: string;
  percentage: number; // 0-1
  costPerVisitor?: number;
}

// SaaS 모드 입력 데이터
export interface SaasInputs {
  monthlyVisitors: number;
  channels: ChannelInfo[];
  visitorToSignupRate: number; // 0-1
  signupToPaidRate: number; // 0-1
  monthlyChurnRate: number; // 0-1
  monthlyPrice: number;
  annualPrice: number;
  annualDiscountRate: number; // 0-1
}

// 제조/유통 모드 입력 데이터
export interface ManufacturingInputs {
  monthlySales: number;
  unitPrice: number;
  productionCapacity: number;
  materialCostPerUnit: number;
  laborCostPerUnit: number;
  shippingCostPerUnit: number;
  otherVariableCostPerUnit: number;
}

// 공급자(판매자) 정보
export interface SupplierInfo {
  newSuppliersPerMonth: number;
  activeSuppliers: number;
  averageListingsPerSupplier: number;
  averageRevenuePerSupplier: number;
}

// B2C 플랫폼 모드 입력 데이터
export interface B2CPlatformInputs {
  monthlyVisitors: number;
  visitorToBuyerRate: number; // 0-1
  buyerToRepeatRate: number; // 0-1
  ordersPerBuyerPerMonth: number;
  averageOrderValue: number;
  refundRate: number; // 0-1
  takeRate: number; // 0-1
  fixedFeePerOrder: number;
  adRevenuePerMonth: number;
  // 공급자 여정
  suppliers: SupplierInfo;
}

// 비용 데이터
export interface CostInputs {
  marketingCost: number;
  personnelCost: number;
  otherFixedCosts: number;
  paymentFeeRate: number; // 0-1
  shippingCostPerUnit?: number; // 제조/유통 모드에서만
}

// 시뮬레이션 결과
export interface SimulationResult {
  monthly: Record<string, MonthlyResult>;
  summary: SummaryResult;
}

export interface MonthlyResult {
  // 공통
  revenue: number;
  customers: number;
  orders?: number; // B2C 플랫폼에서만
  gmv?: number; // B2C 플랫폼에서만
  platformRevenue?: number; // B2C 플랫폼에서만
  
  // SaaS 전용
  visitors?: number;
  signups?: number;
  paidCustomers?: number;
  mrr?: number;
  
  // 제조/유통 전용
  sales?: number;
  production?: number;
  costOfGoodsSold?: number;
  grossMargin?: number;
  
  // 비용
  totalCosts: number;
  netProfit: number;
  profitMargin: number; // 0-1
}

export interface SummaryResult {
  totalRevenue: number;
  totalCustomers: number;
  totalOrders?: number;
  totalGmv?: number;
  totalPlatformRevenue?: number;
  totalCosts: number;
  netProfit: number;
  averageProfitMargin: number;
  
  // SaaS 전용
  ltv?: number;
  cac?: number;
  mrr?: number;
  arr?: number;
  
  // B2C 플랫폼 전용
  averageTakeRate?: number;
  totalRefunds?: number;
}

// 시나리오 타입
export type ScenarioType = 'optimistic' | 'realistic' | 'pessimistic';

export interface Scenario {
  id: string;
  name: string;
  type: ScenarioType;
  inputs: SaasInputs | ManufacturingInputs | B2CPlatformInputs;
  costs: CostInputs;
  result?: SimulationResult;
}

// 앱 상태
export interface AppState {
  onboarding: OnboardingData | null;
  currentBusinessType: BusinessType | null;
  scenarios: Scenario[];
  activeScenarioId: string | null;
  isOnboardingComplete: boolean;
}
