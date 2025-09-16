'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CostInputForm from '@/components/inputs/CostInputForm';
import { CostInputs, BusinessType } from '@/types';
import { Calculator } from 'lucide-react';

interface CostInputSectionProps {
  costInputs: CostInputs;
  onCostInputsChange: (inputs: CostInputs) => void;
  currency: string;
  businessType: BusinessType;
}

export default function CostInputSection({
  costInputs,
  onCostInputsChange,
  currency,
  businessType,
}: CostInputSectionProps) {
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            비용 설정
          </CardTitle>
          <CardDescription>
            인건비, 마케팅 비용, 운영 비용 등 모든 비용 요소를 설정하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CostInputForm
            initialData={costInputs}
            onChange={onCostInputsChange}
            currency={currency}
            businessType={businessType}
          />
        </CardContent>
      </Card>
    </div>
  );
}
