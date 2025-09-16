'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BusinessType, SaasInputs, ManufacturingInputs, B2CPlatformInputs, CostInputs } from '@/types';
import { runSimulation, SimulationInputs } from '@/lib/simulation';
// import RevenueChart from './RevenueChart';
// import CostChart from './CostChart';
// import CustomerChart from './CustomerChart';
// import KPICards from './KPICards';
// import BreakEvenAnalysisCard from './BreakEvenAnalysisCard';
// import CostStructureCard from './CostStructureCard';
// import ScaleEconomicsCard from './ScaleEconomicsCard';
// import HRCostAnalysisCard from './HRCostAnalysisCard';
// import IndustryBenchmarkCard from './IndustryBenchmarkCard';
import ExecutiveSummary from './ExecutiveSummary';
import DetailedAnalysis from './DetailedAnalysis';
import ActionPlan from './ActionPlan';

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
    <div className="space-y-8">
      {/* 1단계: 핵심 대시보드 (Executive Summary) */}
      <ExecutiveSummary 
        result={simulationResult}
        businessType={businessType}
        currency={currency}
        costInputs={costInputs}
        saasInputs={saasInputs}
        manufacturingInputs={manufacturingInputs}
        b2cPlatformInputs={b2cPlatformInputs}
      />

      {/* 2단계: 상세 분석 (Drill-down) */}
      <DetailedAnalysis 
        result={simulationResult}
        businessType={businessType}
        currency={currency}
        costInputs={costInputs}
        saasInputs={saasInputs}
        manufacturingInputs={manufacturingInputs}
        b2cPlatformInputs={b2cPlatformInputs}
      />

      {/* 3단계: 액션 플랜 (Action Items) */}
      <ActionPlan 
        result={simulationResult}
        businessType={businessType}
        currency={currency}
        costInputs={costInputs}
      />
    </div>
  );
}
