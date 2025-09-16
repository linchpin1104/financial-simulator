'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BusinessType, SaasInputs, ManufacturingInputs, B2CPlatformInputs, CostInputs } from '@/types';
import { runSimulation, SimulationInputs } from '@/lib/simulation';
import RevenueChart from './RevenueChart';
import CostChart from './CostChart';
import CustomerChart from './CustomerChart';
import KPICards from './KPICards';

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
    </div>
  );
}
