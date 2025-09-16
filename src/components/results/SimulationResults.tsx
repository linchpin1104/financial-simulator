'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BusinessType, SaasInputs, ManufacturingInputs, B2CPlatformInputs, CostInputs } from '@/types';
import { runSimulation, SimulationInputs } from '@/lib/simulation';
import RevenueChart from './RevenueChart';
import CostChart from './CostChart';
import CustomerChart from './CustomerChart';
import KPICards from './KPICards';
import BreakEvenAnalysisCard from './BreakEvenAnalysisCard';
import CostStructureCard from './CostStructureCard';
import ScaleEconomicsCard from './ScaleEconomicsCard';
import HRCostAnalysisCard from './HRCostAnalysisCard';
import IndustryBenchmarkCard from './IndustryBenchmarkCard';

interface SimulationResultsProps {
  businessType: BusinessType;
  saasInputs?: SaasInputs;
  manufacturingInputs?: ManufacturingInputs;
  b2cPlatformInputs?: B2CPlatformInputs;
  costInputs: CostInputs;
  startMonth: string;
  currency: string;
}

export default function SimulationResults({
  businessType,
  saasInputs,
  manufacturingInputs,
  b2cPlatformInputs,
  costInputs,
  startMonth,
  currency,
}: SimulationResultsProps) {
  const simulationResult = useMemo(() => {
    const inputs: SimulationInputs = {
      businessType,
      costInputs,
      startMonth,
      months: 12,
    };

    if (saasInputs) inputs.saasInputs = saasInputs;
    if (manufacturingInputs) inputs.manufacturingInputs = manufacturingInputs;
    if (b2cPlatformInputs) inputs.b2cPlatformInputs = b2cPlatformInputs;

    try {
      return runSimulation(inputs);
    } catch (error) {
      console.error('Simulation error:', error);
      return null;
    }
  }, [businessType, saasInputs, manufacturingInputs, b2cPlatformInputs, costInputs, startMonth]);

  if (!simulationResult) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600 text-center">시뮬레이션을 실행할 수 없습니다. 입력값을 확인해주세요.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI 카드 */}
      <KPICards 
        result={simulationResult} 
        businessType={businessType} 
        currency={currency} 
      />

      {/* 차트들 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart 
          result={simulationResult} 
          businessType={businessType} 
          currency={currency} 
        />
        <CostChart 
          result={simulationResult} 
          currency={currency} 
        />
      </div>

      <CustomerChart 
        result={simulationResult} 
        businessType={businessType} 
      />

      {/* 손익분기점 분석 */}
      <BreakEvenAnalysisCard 
        result={simulationResult}
        currency={currency}
      />

      {/* 비용 구조 분석 */}
      <CostStructureCard 
        result={simulationResult}
        costInputs={costInputs}
        currency={currency}
      />

      {/* 규모의 경제 분석 */}
      <ScaleEconomicsCard 
        result={simulationResult}
        businessType={businessType}
        currency={currency}
      />

      {/* 인건비 분석 */}
      <HRCostAnalysisCard 
        result={simulationResult}
        businessType={businessType}
        currency={currency}
      />

      {/* 산업 벤치마크 비교 */}
      <IndustryBenchmarkCard 
        result={simulationResult}
        businessType={businessType}
        currency={currency}
      />
    </div>
  );
}
