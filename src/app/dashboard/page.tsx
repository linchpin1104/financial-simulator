'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SaasInputForm from '@/components/inputs/SaasInputForm';
import ManufacturingInputForm from '@/components/inputs/ManufacturingInputForm';
import B2CPlatformInputForm from '@/components/inputs/B2CPlatformInputForm';
import CostInputForm from '@/components/inputs/CostInputForm';
import SimulationResults from '@/components/results/SimulationResults';
import ScenarioComparison from '@/components/scenarios/ScenarioComparison';
import ExportButtons from '@/components/export/ExportButtons';
import { SaasInputs, ManufacturingInputs, B2CPlatformInputs, CostInputs } from '@/types';
import { runSimulation, SimulationInputs } from '@/lib/simulation';

export default function Dashboard() {
  const router = useRouter();
  const { isOnboardingComplete, onboarding, currentBusinessType } = useAppStore();
  
  // 입력 데이터 상태
  const [saasInputs, setSaasInputs] = useState<SaasInputs>({
    monthlyVisitors: 10000,
    channels: [
      { name: '자연 검색', percentage: 0.4, costPerVisitor: 0 },
      { name: '광고', percentage: 0.4, costPerVisitor: 2 },
      { name: '추천', percentage: 0.2, costPerVisitor: 0 },
    ],
    visitorToSignupRate: 0.05,
    signupToPaidRate: 0.08,
    monthlyChurnRate: 0.03,
    monthlyPrice: 25,
    annualPrice: 250,
    annualDiscountRate: 0.17,
    customFunnels: [],
    activeFunnelId: undefined,
    growthRateSettings: {
      quarterlyRates: [],
      applyToRevenue: true,
      applyToCustomers: true,
    },
    quarterlyDetailedSettings: {
      quarterlyMetrics: [],
      useDetailedSettings: false,
    },
  });
  
  const [manufacturingInputs, setManufacturingInputs] = useState<ManufacturingInputs>({
    monthlySales: 1000,
    unitPrice: 50,
    productionCapacity: 1200,
    materialCostPerUnit: 15,
    laborCostPerUnit: 10,
    shippingCostPerUnit: 5,
    otherVariableCostPerUnit: 3,
    growthRateSettings: {
      quarterlyRates: [],
      applyToRevenue: true,
      applyToCustomers: true,
    },
    quarterlyDetailedSettings: {
      quarterlyMetrics: [],
      useDetailedSettings: false,
    },
  });
  
  const [b2cPlatformInputs, setB2CPlatformInputs] = useState<B2CPlatformInputs>({
    monthlyVisitors: 50000,
    visitorToBuyerRate: 0.02,
    buyerToRepeatRate: 0.3,
    ordersPerBuyerPerMonth: 1.5,
    averageOrderValue: 80,
    refundRate: 0.05,
    takeRate: 0.08,
    fixedFeePerOrder: 2,
    adRevenuePerMonth: 5000,
    suppliers: {
      newSuppliersPerMonth: 50,
      activeSuppliers: 200,
      averageListingsPerSupplier: 10,
      averageRevenuePerSupplier: 500,
    },
    growthRateSettings: {
      quarterlyRates: [],
      applyToRevenue: true,
      applyToCustomers: true,
      applyToOrders: true,
    },
    quarterlyDetailedSettings: {
      quarterlyMetrics: [],
      useDetailedSettings: false,
    },
  });
  
  const [costInputs, setCostInputs] = useState<CostInputs>({
    marketingCost: 10000,
    personnelCost: 50000,
    otherFixedCosts: 15000,
    paymentFeeRate: 0.03,
    shippingCostPerUnit: 0,
  });

  // 시뮬레이션 결과 계산
  const simulationResult = useMemo(() => {
    if (!onboarding) return null;
    
    const inputs: SimulationInputs = {
      businessType: currentBusinessType || 'saas',
      costInputs,
      startMonth: onboarding.startMonth,
      months: 12,
    };

    if (currentBusinessType === 'saas' || currentBusinessType === 'hybrid') {
      inputs.saasInputs = saasInputs;
    }
    if (currentBusinessType === 'manufacturing' || currentBusinessType === 'hybrid') {
      inputs.manufacturingInputs = manufacturingInputs;
    }
    if (currentBusinessType === 'b2c-platform') {
      inputs.b2cPlatformInputs = b2cPlatformInputs;
    }

    try {
      return runSimulation(inputs);
    } catch (error) {
      console.error('Simulation error:', error);
      return null;
    }
  }, [currentBusinessType, saasInputs, manufacturingInputs, b2cPlatformInputs, costInputs, onboarding]);

  useEffect(() => {
    if (!isOnboardingComplete) {
      router.push('/');
    }
  }, [isOnboardingComplete, router]);

  if (!isOnboardingComplete || !onboarding) {
    return null;
  }

  const getBusinessTypeInfo = (type: string) => {
    switch (type) {
      case 'saas':
        return { name: '플랫폼/서비스 중심', icon: '💻', description: 'SaaS, 앱 서비스 등' };
      case 'manufacturing':
        return { name: '제조/유통 중심', icon: '🏭', description: '공장, 쇼핑몰 등' };
      case 'b2c-platform':
        return { name: 'B2C 플랫폼', icon: '🛒', description: '거래/마켓플레이스' };
      case 'hybrid':
        return { name: '복합형', icon: '🔄', description: '둘 다' };
      default:
        return { name: '알 수 없음', icon: '❓', description: '' };
    }
  };

  const businessInfo = getBusinessTypeInfo(currentBusinessType || '');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {onboarding.companyName} 매출 모델링
              </h1>
              <p className="text-sm text-gray-600">
                {businessInfo.icon} {businessInfo.name} • {onboarding.currency}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                useAppStore.getState().reset();
                router.push('/');
              }}
            >
              새로 시작
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="inputs">입력</TabsTrigger>
            <TabsTrigger value="results">결과</TabsTrigger>
            <TabsTrigger value="scenarios">시나리오</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">사업 유형</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl mb-2">{businessInfo.icon}</div>
                  <p className="font-medium">{businessInfo.name}</p>
                  <p className="text-sm text-gray-600">{businessInfo.description}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">시작 월</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{onboarding.startMonth}</p>
                  <p className="text-sm text-gray-600">모델링 시작 시점</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">통화</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{onboarding.currency}</p>
                  <p className="text-sm text-gray-600">계산 단위</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>다음 단계</CardTitle>
                <CardDescription>
                  매출 모델링을 시작하려면 아래 단계를 따라주세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <p className="font-medium">비즈니스 모델 입력</p>
                      <p className="text-sm text-gray-600">
                        {currentBusinessType === 'saas' && '고객 유입, 전환율, 가격 등을 입력하세요'}
                        {currentBusinessType === 'manufacturing' && '판매량, 생산량, 원가 등을 입력하세요'}
                        {currentBusinessType === 'b2c-platform' && 'GMV, Take Rate, 주문 정보를 입력하세요'}
                        {currentBusinessType === 'hybrid' && '플랫폼과 제조 요소를 모두 입력하세요'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div>
                      <p className="font-medium">비용 구조 설정</p>
                      <p className="text-sm text-gray-600">마케팅비, 인건비, 기타 고정비를 입력하세요</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div>
                      <p className="font-medium">시뮬레이션 실행</p>
                      <p className="text-sm text-gray-600">매출 예측 결과를 확인하세요</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inputs" className="space-y-6">
            {/* 비즈니스 모델 입력 */}
            <Card>
              <CardHeader>
                <CardTitle>비즈니스 모델 입력</CardTitle>
                <CardDescription>
                  {currentBusinessType === 'saas' && 'SaaS/플랫폼 모델 입력'}
                  {currentBusinessType === 'manufacturing' && '제조/유통 모델 입력'}
                  {currentBusinessType === 'b2c-platform' && 'B2C 플랫폼 모델 입력'}
                  {currentBusinessType === 'hybrid' && '복합 모델 입력'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentBusinessType === 'saas' && (
                  <SaasInputForm
                    initialData={saasInputs}
                    onChange={setSaasInputs}
                    currency={onboarding.currency}
                  />
                )}
                {currentBusinessType === 'manufacturing' && (
                  <ManufacturingInputForm
                    initialData={manufacturingInputs}
                    onChange={setManufacturingInputs}
                    currency={onboarding.currency}
                  />
                )}
                {currentBusinessType === 'b2c-platform' && (
                  <B2CPlatformInputForm
                    initialData={b2cPlatformInputs}
                    onChange={setB2CPlatformInputs}
                    currency={onboarding.currency}
                  />
                )}
                {currentBusinessType === 'hybrid' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">플랫폼 요소</h3>
                      <SaasInputForm
                        initialData={saasInputs}
                        onChange={setSaasInputs}
                        currency={onboarding.currency}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-4">제조/유통 요소</h3>
                      <ManufacturingInputForm
                        initialData={manufacturingInputs}
                        onChange={setManufacturingInputs}
                        currency={onboarding.currency}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 비용 입력 */}
            <Card>
              <CardHeader>
                <CardTitle>비용 구조</CardTitle>
                <CardDescription>고정비와 변동비 입력</CardDescription>
              </CardHeader>
              <CardContent>
                <CostInputForm
                  initialData={costInputs}
                  onChange={setCostInputs}
                  currency={onboarding.currency}
                  businessType={currentBusinessType || 'saas'}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <SimulationResults
              businessType={currentBusinessType || 'saas'}
              saasInputs={currentBusinessType === 'saas' || currentBusinessType === 'hybrid' ? saasInputs : undefined}
              manufacturingInputs={currentBusinessType === 'manufacturing' || currentBusinessType === 'hybrid' ? manufacturingInputs : undefined}
              b2cPlatformInputs={currentBusinessType === 'b2c-platform' ? b2cPlatformInputs : undefined}
              costInputs={costInputs}
              startMonth={onboarding.startMonth}
              currency={onboarding.currency}
            />
            
            {simulationResult && (
              <ExportButtons
                result={simulationResult}
                businessType={currentBusinessType || 'saas'}
                companyName={onboarding.companyName}
                currency={onboarding.currency}
              />
            )}
          </TabsContent>

          <TabsContent value="scenarios">
            <ScenarioComparison
              businessType={currentBusinessType || 'saas'}
              baseSaasInputs={currentBusinessType === 'saas' || currentBusinessType === 'hybrid' ? saasInputs : undefined}
              baseManufacturingInputs={currentBusinessType === 'manufacturing' || currentBusinessType === 'hybrid' ? manufacturingInputs : undefined}
              baseB2CPlatformInputs={currentBusinessType === 'b2c-platform' ? b2cPlatformInputs : undefined}
              baseCostInputs={costInputs}
              startMonth={onboarding.startMonth}
              currency={onboarding.currency}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
