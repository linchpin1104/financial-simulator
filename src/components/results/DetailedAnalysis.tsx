'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SimulationResult, BusinessType, CostInputs, SaasInputs, ManufacturingInputs, B2CPlatformInputs } from '@/types';
// import { formatCurrency } from '@/lib/utils';
import { 
  TrendingUp, 
  DollarSign, 
  BarChart3,
  Activity
} from 'lucide-react';

// 기존 분석 컴포넌트들 import
import BreakEvenAnalysisCard from './BreakEvenAnalysisCard';
import CostStructureCard from './CostStructureCard';
import ScaleEconomicsCard from './ScaleEconomicsCard';
import HRCostAnalysisCard from './HRCostAnalysisCard';
// import IndustryBenchmarkCard from './IndustryBenchmarkCard';
import RevenueChart from './RevenueChart';
import CostChart from './CostChart';
import CustomerChart from './CustomerChart';

interface DetailedAnalysisProps {
  result: SimulationResult;
  businessType: BusinessType;
  currency: string;
  costInputs: CostInputs;
  saasInputs?: SaasInputs;
  manufacturingInputs?: ManufacturingInputs;
  b2cPlatformInputs?: B2CPlatformInputs;
}

export default function DetailedAnalysis({ 
  result, 
  businessType, 
  currency, 
  costInputs,
  saasInputs: _saasInputs,
  manufacturingInputs: _manufacturingInputs,
  b2cPlatformInputs: _b2cPlatformInputs
}: DetailedAnalysisProps) {
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          상세 분석
        </CardTitle>
        <CardDescription>
          각 영역별 상세한 분석 결과를 확인하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profitability" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profitability" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">수익성</span>
            </TabsTrigger>
            <TabsTrigger value="growth" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">성장성</span>
            </TabsTrigger>
            <TabsTrigger value="efficiency" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">효율성</span>
            </TabsTrigger>
          </TabsList>

          {/* 수익성 분석 탭 */}
          <TabsContent value="profitability" className="space-y-6">
            <div className="grid gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  매출 및 비용 분석
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <RevenueChart result={result} businessType={businessType} currency={currency} />
                  <CostChart result={result} currency={currency} />
                </div>
              </div>
              
              <BreakEvenAnalysisCard 
                result={result}
                currency={currency}
              />
              
              <CostStructureCard 
                result={result}
                costInputs={costInputs}
                currency={currency}
              />
            </div>
          </TabsContent>

          {/* 성장성 분석 탭 */}
          <TabsContent value="growth" className="space-y-6">
            <div className="grid gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  고객 및 성장 분석
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <CustomerChart result={result} businessType={businessType} />
                  <ScaleEconomicsCard 
                    result={result}
                    businessType={businessType}
                    currency={currency}
                  />
                </div>
              </div>
              
              <HRCostAnalysisCard 
                result={result}
                businessType={businessType}
                currency={currency}
              />
            </div>
          </TabsContent>

          {/* 효율성 분석 탭 */}
          <TabsContent value="efficiency" className="space-y-6">
            <div className="grid gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  운영 효율성 분석
                </h3>
                <div className="grid gap-4">
                  <ScaleEconomicsCard 
                    result={result}
                    businessType={businessType}
                    currency={currency}
                  />
                  
                  <HRCostAnalysisCard 
                    result={result}
                    businessType={businessType}
                    currency={currency}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 벤치마크 분석 탭 */}
        </Tabs>
      </CardContent>
    </Card>
  );
}
