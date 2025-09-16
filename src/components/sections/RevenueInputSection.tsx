'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SaasInputForm from '@/components/inputs/SaasInputForm';
import ManufacturingInputForm from '@/components/inputs/ManufacturingInputForm';
import B2CPlatformInputForm from '@/components/inputs/B2CPlatformInputForm';
import { BusinessType, SaasInputs, ManufacturingInputs, B2CPlatformInputs } from '@/types';
import { DollarSign, Factory, ShoppingCart } from 'lucide-react';

interface RevenueInputSectionProps {
  businessType: BusinessType;
  saasInputs: SaasInputs;
  manufacturingInputs: ManufacturingInputs;
  b2cPlatformInputs: B2CPlatformInputs;
  onSaasInputsChange: (inputs: SaasInputs) => void;
  onManufacturingInputsChange: (inputs: ManufacturingInputs) => void;
  onB2CPlatformInputsChange: (inputs: B2CPlatformInputs) => void;
  currency: string;
}

export default function RevenueInputSection({
  businessType,
  saasInputs,
  manufacturingInputs,
  b2cPlatformInputs,
  onSaasInputsChange,
  onManufacturingInputsChange,
  onB2CPlatformInputsChange,
  currency,
}: RevenueInputSectionProps) {
  
  const getBusinessTypeIcon = (type: BusinessType) => {
    switch (type) {
      case 'saas':
        return <DollarSign className="h-5 w-5" />;
      case 'manufacturing':
        return <Factory className="h-5 w-5" />;
      case 'b2c-platform':
        return <ShoppingCart className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  const getBusinessTypeName = (type: BusinessType) => {
    switch (type) {
      case 'saas':
        return 'SaaS';
      case 'manufacturing':
        return '제조업';
      case 'b2c-platform':
        return 'B2C 플랫폼';
      default:
        return 'SaaS';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getBusinessTypeIcon(businessType)}
            {getBusinessTypeName(businessType)} 매출 설정
          </CardTitle>
          <CardDescription>
            {businessType === 'saas' && '구독 기반 서비스의 매출 모델을 설정하세요.'}
            {businessType === 'manufacturing' && '제품 제조 및 판매의 매출 모델을 설정하세요.'}
            {businessType === 'b2c-platform' && '플랫폼 기반 거래의 매출 모델을 설정하세요.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={businessType} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="saas" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                SaaS
              </TabsTrigger>
              <TabsTrigger value="manufacturing" className="flex items-center gap-2">
                <Factory className="h-4 w-4" />
                제조업
              </TabsTrigger>
              <TabsTrigger value="b2c-platform" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                B2C 플랫폼
              </TabsTrigger>
            </TabsList>

            <TabsContent value="saas" className="mt-6">
              <SaasInputForm
                initialData={saasInputs}
                onChange={onSaasInputsChange}
                currency={currency}
              />
            </TabsContent>

            <TabsContent value="manufacturing" className="mt-6">
              <ManufacturingInputForm
                initialData={manufacturingInputs}
                onChange={onManufacturingInputsChange}
                currency={currency}
              />
            </TabsContent>

            <TabsContent value="b2c-platform" className="mt-6">
              <B2CPlatformInputForm
                initialData={b2cPlatformInputs}
                onChange={onB2CPlatformInputsChange}
                currency={currency}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
