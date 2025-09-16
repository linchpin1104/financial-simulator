'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomFunnelSettings from '@/components/inputs/CustomFunnelSettings';
import GrowthRateSettingsComponent from '@/components/inputs/GrowthRateSettings';
import QuarterlyDetailedSettingsComponent from '@/components/inputs/QuarterlyDetailedSettings';
import { BusinessType, SaasInputs, ManufacturingInputs, B2CPlatformInputs } from '@/types';
import { Settings, TrendingUp, Calendar, Funnel } from 'lucide-react';

interface AdvancedSettingsSectionProps {
  businessType: BusinessType;
  saasInputs: SaasInputs;
  manufacturingInputs: ManufacturingInputs;
  b2cPlatformInputs: B2CPlatformInputs;
  onSaasInputsChange: (inputs: SaasInputs) => void;
  onManufacturingInputsChange: (inputs: ManufacturingInputs) => void;
  onB2CPlatformInputsChange: (inputs: B2CPlatformInputs) => void;
}

export default function AdvancedSettingsSection({
  businessType,
  saasInputs,
  manufacturingInputs,
  b2cPlatformInputs,
  onSaasInputsChange,
  onManufacturingInputsChange,
  onB2CPlatformInputsChange,
}: AdvancedSettingsSectionProps) {
  
  const getCurrentInputs = () => {
    switch (businessType) {
      case 'saas':
        return saasInputs;
      case 'manufacturing':
        return manufacturingInputs;
      case 'b2c-platform':
        return b2cPlatformInputs;
      default:
        return saasInputs;
    }
  };

  const updateCurrentInputs = (updates: any) => {
    switch (businessType) {
      case 'saas':
        onSaasInputsChange({ ...saasInputs, ...updates });
        break;
      case 'manufacturing':
        onManufacturingInputsChange({ ...manufacturingInputs, ...updates });
        break;
      case 'b2c-platform':
        onB2CPlatformInputsChange({ ...b2cPlatformInputs, ...updates });
        break;
    }
  };

  const currentInputs = getCurrentInputs();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            고급 설정
          </CardTitle>
          <CardDescription>
            맞춤형 퍼널, 성장률, 분기별 상세 설정 등 고급 옵션을 관리하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="funnel" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="funnel" className="flex items-center gap-2">
                <Funnel className="h-4 w-4" />
                맞춤형 퍼널
              </TabsTrigger>
              <TabsTrigger value="growth" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                성장률
              </TabsTrigger>
              <TabsTrigger value="quarterly" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                분기별 설정
              </TabsTrigger>
            </TabsList>

            <TabsContent value="funnel" className="mt-6">
              <CustomFunnelSettings
                funnels={'customFunnels' in currentInputs ? currentInputs.customFunnels || [] : []}
                onFunnelsChange={(funnels) => updateCurrentInputs({ customFunnels: funnels })}
                activeFunnelId={'activeFunnelId' in currentInputs ? currentInputs.activeFunnelId : undefined}
                onActiveFunnelChange={(funnelId) => updateCurrentInputs({ activeFunnelId: funnelId })}
              />
            </TabsContent>

            <TabsContent value="growth" className="mt-6">
              <GrowthRateSettingsComponent
                settings={currentInputs.growthRateSettings || {
                  quarterlyRates: [],
                  applyToRevenue: true,
                  applyToCustomers: true,
                }}
                onSettingsChange={(settings) => updateCurrentInputs({ growthRateSettings: settings })}
                businessType={businessType}
              />
            </TabsContent>

            <TabsContent value="quarterly" className="mt-6">
              <QuarterlyDetailedSettingsComponent
                settings={currentInputs.quarterlyDetailedSettings || {
                  quarterlyMetrics: [],
                  useDetailedSettings: false,
                }}
                onSettingsChange={(settings) => updateCurrentInputs({ quarterlyDetailedSettings: settings })}
                businessType={businessType}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
