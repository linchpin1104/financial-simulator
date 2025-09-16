'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw } from 'lucide-react';

export interface ScenarioMultipliers {
  optimistic: {
    revenue: number; // 1.2 = 20% 증가
    customers: number;
    conversion: number;
    price: number;
    cost: number;
    growth: number;
  };
  realistic: {
    revenue: number; // 1.0 = 변화 없음
    customers: number;
    conversion: number;
    price: number;
    cost: number;
    growth: number;
  };
  pessimistic: {
    revenue: number; // 0.8 = 20% 감소
    customers: number;
    conversion: number;
    price: number;
    cost: number;
    growth: number;
  };
}

interface ScenarioSettingsProps {
  multipliers: ScenarioMultipliers;
  onMultipliersChange: (multipliers: ScenarioMultipliers) => void;
  businessType: 'saas' | 'manufacturing' | 'b2c-platform' | 'hybrid';
}

export default function ScenarioSettings({
  multipliers,
  onMultipliersChange,
  businessType,
}: ScenarioSettingsProps) {
  const [localMultipliers, setLocalMultipliers] = useState<ScenarioMultipliers>(multipliers);
  const [hasChanges, setHasChanges] = useState(false);

  const updateMultiplier = (
    scenario: keyof ScenarioMultipliers,
    field: keyof ScenarioMultipliers['optimistic'],
    value: number
  ) => {
    const newMultipliers = {
      ...localMultipliers,
      [scenario]: {
        ...localMultipliers[scenario],
        [field]: value,
      },
    };
    setLocalMultipliers(newMultipliers);
    setHasChanges(true);
  };

  const saveChanges = () => {
    onMultipliersChange(localMultipliers);
    setHasChanges(false);
  };

  const resetToDefaults = () => {
    const defaultMultipliers: ScenarioMultipliers = {
      optimistic: {
        revenue: 1.2,
        customers: 1.2,
        conversion: 1.2,
        price: 1.1,
        cost: 0.9,
        growth: 1.2,
      },
      realistic: {
        revenue: 1.0,
        customers: 1.0,
        conversion: 1.0,
        price: 1.0,
        cost: 1.0,
        growth: 1.0,
      },
      pessimistic: {
        revenue: 0.8,
        customers: 0.8,
        conversion: 0.8,
        price: 0.9,
        cost: 1.1,
        growth: 0.8,
      },
    };
    setLocalMultipliers(defaultMultipliers);
    setHasChanges(true);
  };

  const formatPercent = (value: number) => {
    const percent = ((value - 1) * 100).toFixed(1);
    return value >= 1 ? `+${percent}%` : `${percent}%`;
  };

  const getScenarioColor = (scenario: keyof ScenarioMultipliers) => {
    switch (scenario) {
      case 'optimistic':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'realistic':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'pessimistic':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getScenarioLabel = (scenario: keyof ScenarioMultipliers) => {
    switch (scenario) {
      case 'optimistic':
        return '낙관적 시나리오';
      case 'realistic':
        return '기준 시나리오';
      case 'pessimistic':
        return '보수적 시나리오';
      default:
        return scenario;
    }
  };

  const getFieldLabel = (field: keyof ScenarioMultipliers['optimistic']) => {
    switch (field) {
      case 'revenue':
        return '매출';
      case 'customers':
        return businessType === 'manufacturing' ? '판매량' : '고객수';
      case 'conversion':
        return '전환율';
      case 'price':
        return '가격';
      case 'cost':
        return '비용';
      case 'growth':
        return '성장률';
      default:
        return field;
    }
  };

  const getFieldDescription = (field: keyof ScenarioMultipliers['optimistic']) => {
    switch (field) {
      case 'revenue':
        return '전체 매출에 대한 조정 비율';
      case 'customers':
        return businessType === 'manufacturing' 
          ? '월간 판매량에 대한 조정 비율'
          : '고객 수에 대한 조정 비율';
      case 'conversion':
        return '전환율에 대한 조정 비율';
      case 'price':
        return '제품/서비스 가격에 대한 조정 비율';
      case 'cost':
        return '비용에 대한 조정 비율';
      case 'growth':
        return '성장률에 대한 조정 비율';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>시나리오 조정 비율 설정</CardTitle>
            <CardDescription>
              각 시나리오별로 조정할 비율을 설정하세요. 1.0 = 변화 없음, 1.2 = 20% 증가, 0.8 = 20% 감소
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              기본값
            </Button>
            <Button
              size="sm"
              onClick={saveChanges}
              disabled={!hasChanges}
            >
              <Save className="w-4 h-4 mr-1" />
              저장
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {(['optimistic', 'realistic', 'pessimistic'] as const).map((scenario) => (
            <div key={scenario} className={`p-4 rounded-lg border ${getScenarioColor(scenario)}`}>
              <h4 className="font-semibold mb-4">{getScenarioLabel(scenario)}</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(['revenue', 'customers', 'conversion', 'price', 'cost', 'growth'] as const).map((field) => (
                  <div key={field}>
                    <Label htmlFor={`${scenario}-${field}`} className="text-sm font-medium">
                      {getFieldLabel(field)}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`${scenario}-${field}`}
                        type="number"
                        min="0"
                        max="3"
                        step="0.1"
                        value={localMultipliers[scenario][field]}
                        onChange={(e) => updateMultiplier(
                          scenario,
                          field,
                          parseFloat(e.target.value) || 1.0
                        )}
                        className="text-right"
                      />
                      <span className="text-sm text-gray-600 min-w-[60px]">
                        {formatPercent(localMultipliers[scenario][field])}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {getFieldDescription(field)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {hasChanges && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              변경사항이 저장되지 않았습니다. 저장 버튼을 클릭하여 변경사항을 적용하세요.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
