'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BusinessType, SaasInputs, ManufacturingInputs, B2CPlatformInputs, CostInputs } from '@/types';
import { runSimulation, SimulationInputs } from '@/lib/simulation';
import ScenarioComparisonChart from './ScenarioComparisonChart';
import ScenarioComparisonTable from './ScenarioComparisonTable';

interface ScenarioComparisonProps {
  businessType: BusinessType;
  baseSaasInputs?: SaasInputs;
  baseManufacturingInputs?: ManufacturingInputs;
  baseB2CPlatformInputs?: B2CPlatformInputs;
  baseCostInputs: CostInputs;
  startMonth: string;
  currency: string;
}

export default function ScenarioComparison({
  businessType,
  baseSaasInputs,
  baseManufacturingInputs,
  baseB2CPlatformInputs,
  baseCostInputs,
  startMonth,
  currency,
}: ScenarioComparisonProps) {
  const [activeTab, setActiveTab] = useState('chart');

  // 시나리오 생성 함수
  const createScenario = useCallback((type: 'optimistic' | 'realistic' | 'pessimistic', multiplier: number) => {
    const inputs: SimulationInputs = {
      businessType,
      costInputs: { ...baseCostInputs },
      startMonth,
      months: 12,
    };

    // 비용 조정
    inputs.costInputs.marketingCost = Math.round(baseCostInputs.marketingCost * multiplier);
    inputs.costInputs.personnelCost = Math.round(baseCostInputs.personnelCost * multiplier);
    inputs.costInputs.otherFixedCosts = Math.round(baseCostInputs.otherFixedCosts * multiplier);

    // 비즈니스 모델별 입력 조정
    if (businessType === 'saas' && baseSaasInputs) {
      inputs.saasInputs = {
        ...baseSaasInputs,
        monthlyVisitors: Math.round(baseSaasInputs.monthlyVisitors * multiplier),
        visitorToSignupRate: baseSaasInputs.visitorToSignupRate * (type === 'optimistic' ? 1.2 : type === 'pessimistic' ? 0.8 : 1.0),
        signupToPaidRate: baseSaasInputs.signupToPaidRate * (type === 'optimistic' ? 1.2 : type === 'pessimistic' ? 0.8 : 1.0),
        monthlyChurnRate: baseSaasInputs.monthlyChurnRate * (type === 'optimistic' ? 0.8 : type === 'pessimistic' ? 1.2 : 1.0),
        monthlyPrice: Math.round(baseSaasInputs.monthlyPrice * (type === 'optimistic' ? 1.1 : type === 'pessimistic' ? 0.9 : 1.0)),
        annualPrice: Math.round(baseSaasInputs.annualPrice * (type === 'optimistic' ? 1.1 : type === 'pessimistic' ? 0.9 : 1.0)),
      };
    }

    if (businessType === 'manufacturing' && baseManufacturingInputs) {
      inputs.manufacturingInputs = {
        ...baseManufacturingInputs,
        monthlySales: Math.round(baseManufacturingInputs.monthlySales * multiplier),
        unitPrice: Math.round(baseManufacturingInputs.unitPrice * (type === 'optimistic' ? 1.1 : type === 'pessimistic' ? 0.9 : 1.0)),
        materialCostPerUnit: Math.round(baseManufacturingInputs.materialCostPerUnit * (type === 'optimistic' ? 0.9 : type === 'pessimistic' ? 1.1 : 1.0)),
        laborCostPerUnit: Math.round(baseManufacturingInputs.laborCostPerUnit * (type === 'optimistic' ? 0.9 : type === 'pessimistic' ? 1.1 : 1.0)),
      };
    }

    if (businessType === 'b2c-platform' && baseB2CPlatformInputs) {
      inputs.b2cPlatformInputs = {
        ...baseB2CPlatformInputs,
        monthlyVisitors: Math.round(baseB2CPlatformInputs.monthlyVisitors * multiplier),
        visitorToBuyerRate: baseB2CPlatformInputs.visitorToBuyerRate * (type === 'optimistic' ? 1.2 : type === 'pessimistic' ? 0.8 : 1.0),
        averageOrderValue: Math.round(baseB2CPlatformInputs.averageOrderValue * (type === 'optimistic' ? 1.1 : type === 'pessimistic' ? 0.9 : 1.0)),
        takeRate: baseB2CPlatformInputs.takeRate * (type === 'optimistic' ? 1.1 : type === 'pessimistic' ? 0.9 : 1.0),
        refundRate: baseB2CPlatformInputs.refundRate * (type === 'optimistic' ? 0.8 : type === 'pessimistic' ? 1.2 : 1.0),
      };
    }

    if (businessType === 'hybrid' && baseSaasInputs && baseManufacturingInputs) {
      inputs.saasInputs = {
        ...baseSaasInputs,
        monthlyVisitors: Math.round(baseSaasInputs.monthlyVisitors * multiplier),
        visitorToSignupRate: baseSaasInputs.visitorToSignupRate * (type === 'optimistic' ? 1.2 : type === 'pessimistic' ? 0.8 : 1.0),
        signupToPaidRate: baseSaasInputs.signupToPaidRate * (type === 'optimistic' ? 1.2 : type === 'pessimistic' ? 0.8 : 1.0),
        monthlyChurnRate: baseSaasInputs.monthlyChurnRate * (type === 'optimistic' ? 0.8 : type === 'pessimistic' ? 1.2 : 1.0),
      };
      inputs.manufacturingInputs = {
        ...baseManufacturingInputs,
        monthlySales: Math.round(baseManufacturingInputs.monthlySales * multiplier),
        unitPrice: Math.round(baseManufacturingInputs.unitPrice * (type === 'optimistic' ? 1.1 : type === 'pessimistic' ? 0.9 : 1.0)),
      };
    }

    try {
      const result = runSimulation(inputs);
      return { type, inputs, result };
    } catch (error) {
      console.error(`Error running ${type} scenario:`, error);
      return { type, inputs, result: null };
    }
  }, [businessType, baseSaasInputs, baseManufacturingInputs, baseB2CPlatformInputs, baseCostInputs, startMonth]);

  // 시나리오 생성
  const scenarios = useMemo(() => {
    const optimistic = createScenario('optimistic', 1.2);
    const realistic = createScenario('realistic', 1.0);
    const pessimistic = createScenario('pessimistic', 0.8);

    return { optimistic, realistic, pessimistic };
  }, [createScenario]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* 시나리오 개요 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={scenarios.optimistic.result ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-800">낙관 시나리오</CardTitle>
            <CardDescription className="text-xs text-green-600">
              전환율 +20%, 가격 +10%, 비용 -10%
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scenarios.optimistic.result ? (
              <div className="space-y-1">
                <div className="text-lg font-bold text-green-800">
                  {formatCurrency(scenarios.optimistic.result.summary.totalRevenue)}
                </div>
                <div className="text-sm text-green-600">
                  순이익: {formatCurrency(scenarios.optimistic.result.summary.netProfit)}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">계산 불가</div>
            )}
          </CardContent>
        </Card>

        <Card className={scenarios.realistic.result ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">기준 시나리오</CardTitle>
            <CardDescription className="text-xs text-blue-600">
              현재 입력값 기준
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scenarios.realistic.result ? (
              <div className="space-y-1">
                <div className="text-lg font-bold text-blue-800">
                  {formatCurrency(scenarios.realistic.result.summary.totalRevenue)}
                </div>
                <div className="text-sm text-blue-600">
                  순이익: {formatCurrency(scenarios.realistic.result.summary.netProfit)}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">계산 불가</div>
            )}
          </CardContent>
        </Card>

        <Card className={scenarios.pessimistic.result ? 'border-red-200 bg-red-50' : 'border-gray-200'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-800">보수 시나리오</CardTitle>
            <CardDescription className="text-xs text-red-600">
              전환율 -20%, 가격 -10%, 비용 +10%
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scenarios.pessimistic.result ? (
              <div className="space-y-1">
                <div className="text-lg font-bold text-red-800">
                  {formatCurrency(scenarios.pessimistic.result.summary.totalRevenue)}
                </div>
                <div className="text-sm text-red-600">
                  순이익: {formatCurrency(scenarios.pessimistic.result.summary.netProfit)}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">계산 불가</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 상세 비교 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="chart">차트 비교</TabsTrigger>
          <TabsTrigger value="table">표 비교</TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          <ScenarioComparisonChart
            scenarios={scenarios}
            currency={currency}
          />
        </TabsContent>

        <TabsContent value="table">
          <ScenarioComparisonTable
            scenarios={scenarios}
            currency={currency}
            businessType={businessType}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
