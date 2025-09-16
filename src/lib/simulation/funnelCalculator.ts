import { CustomFunnel, FunnelStep } from '@/types';

/**
 * 맞춤형 퍼널을 사용하여 전환율을 계산합니다.
 * @param baseValue 기준값 (예: 월간 방문자 수)
 * @param customFunnels 맞춤형 퍼널 목록
 * @param activeFunnelId 활성 퍼널 ID
 * @param defaultConversionRate 기본 전환율 (퍼널이 없을 때 사용)
 * @returns 전환된 값
 */
export function calculateFunnelConversion(
  baseValue: number,
  customFunnels: CustomFunnel[],
  activeFunnelId?: string,
  defaultConversionRate: number = 1.0
): number {
  if (!activeFunnelId || customFunnels.length === 0) {
    return baseValue * defaultConversionRate;
  }

  const activeFunnel = customFunnels.find(funnel => funnel.id === activeFunnelId);
  if (!activeFunnel || !activeFunnel.isActive) {
    return baseValue * defaultConversionRate;
  }

  // 퍼널 단계들을 순서대로 정렬
  const sortedSteps = activeFunnel.steps.sort((a, b) => a.order - b.order);
  
  if (sortedSteps.length === 0) {
    return baseValue * defaultConversionRate;
  }

  // 각 단계의 전환율을 순차적으로 적용
  let convertedValue = baseValue;
  for (const step of sortedSteps) {
    convertedValue *= step.conversionRate;
  }

  return convertedValue;
}

/**
 * 퍼널의 전체 전환율을 계산합니다.
 * @param customFunnels 맞춤형 퍼널 목록
 * @param activeFunnelId 활성 퍼널 ID
 * @returns 전체 전환율 (0-1)
 */
export function getFunnelConversionRate(
  customFunnels: CustomFunnel[],
  activeFunnelId?: string
): number {
  if (!activeFunnelId || customFunnels.length === 0) {
    return 1.0;
  }

  const activeFunnel = customFunnels.find(funnel => funnel.id === activeFunnelId);
  if (!activeFunnel || !activeFunnel.isActive) {
    return 1.0;
  }

  const sortedSteps = activeFunnel.steps.sort((a, b) => a.order - b.order);
  
  if (sortedSteps.length === 0) {
    return 1.0;
  }

  // 모든 단계의 전환율을 곱함
  return sortedSteps.reduce((totalRate, step) => totalRate * step.conversionRate, 1.0);
}

/**
 * 퍼널 단계별 전환된 값을 계산합니다.
 * @param baseValue 기준값
 * @param customFunnels 맞춤형 퍼널 목록
 * @param activeFunnelId 활성 퍼널 ID
 * @returns 각 단계별 전환된 값
 */
export function calculateFunnelStepValues(
  baseValue: number,
  customFunnels: CustomFunnel[],
  activeFunnelId?: string
): Array<{
  step: FunnelStep;
  value: number;
  cumulativeRate: number;
}> {
  if (!activeFunnelId || customFunnels.length === 0) {
    return [];
  }

  const activeFunnel = customFunnels.find(funnel => funnel.id === activeFunnelId);
  if (!activeFunnel || !activeFunnel.isActive) {
    return [];
  }

  const sortedSteps = activeFunnel.steps.sort((a, b) => a.order - b.order);
  const result: Array<{
    step: FunnelStep;
    value: number;
    cumulativeRate: number;
  }> = [];

  let currentValue = baseValue;
  let cumulativeRate = 1.0;

  for (const step of sortedSteps) {
    currentValue *= step.conversionRate;
    cumulativeRate *= step.conversionRate;
    
    result.push({
      step,
      value: currentValue,
      cumulativeRate,
    });
  }

  return result;
}

/**
 * 퍼널의 효율성을 분석합니다.
 * @param customFunnels 맞춤형 퍼널 목록
 * @param activeFunnelId 활성 퍼널 ID
 * @returns 퍼널 효율성 분석 결과
 */
export function analyzeFunnelEfficiency(
  customFunnels: CustomFunnel[],
  activeFunnelId?: string
): {
  totalConversionRate: number;
  stepCount: number;
  averageStepConversionRate: number;
  weakestStep?: FunnelStep;
  strongestStep?: FunnelStep;
  efficiency: 'excellent' | 'good' | 'average' | 'poor';
} {
  if (!activeFunnelId || customFunnels.length === 0) {
    return {
      totalConversionRate: 1.0,
      stepCount: 0,
      averageStepConversionRate: 1.0,
      efficiency: 'excellent',
    };
  }

  const activeFunnel = customFunnels.find(funnel => funnel.id === activeFunnelId);
  if (!activeFunnel || !activeFunnel.isActive) {
    return {
      totalConversionRate: 1.0,
      stepCount: 0,
      averageStepConversionRate: 1.0,
      efficiency: 'excellent',
    };
  }

  const sortedSteps = activeFunnel.steps.sort((a, b) => a.order - b.order);
  const totalConversionRate = getFunnelConversionRate(customFunnels, activeFunnelId);
  const averageStepConversionRate = sortedSteps.length > 0
    ? sortedSteps.reduce((sum, step) => sum + step.conversionRate, 0) / sortedSteps.length
    : 1.0;

  const weakestStep = sortedSteps.reduce((weakest, current) => 
    current.conversionRate < weakest.conversionRate ? current : weakest
  );
  const strongestStep = sortedSteps.reduce((strongest, current) => 
    current.conversionRate > strongest.conversionRate ? current : strongest
  );

  let efficiency: 'excellent' | 'good' | 'average' | 'poor';
  if (totalConversionRate >= 0.1) {
    efficiency = 'excellent';
  } else if (totalConversionRate >= 0.05) {
    efficiency = 'good';
  } else if (totalConversionRate >= 0.02) {
    efficiency = 'average';
  } else {
    efficiency = 'poor';
  }

  return {
    totalConversionRate,
    stepCount: sortedSteps.length,
    averageStepConversionRate,
    weakestStep,
    strongestStep,
    efficiency,
  };
}
