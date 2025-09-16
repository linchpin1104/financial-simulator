'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SimulationResult, CostInputs } from '@/types';
import { analyzeCostStructure } from '@/lib/analysis/costStructureAnalysis';
import { formatCurrency, formatPercent } from '@/lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DollarSign, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

interface CostStructureCardProps {
  result: SimulationResult;
  costInputs: CostInputs;
  currency: string;
}

export default function CostStructureCard({ result, costInputs, currency }: CostStructureCardProps) {
  const [costStructureType, setCostStructureType] = useState('saas'); // 기본값: SaaS 비즈니스 모델
  
  // 비즈니스 모델별 사전 정의된 비용 구조
  const costStructureTemplates = {
    saas: { name: 'SaaS', ratio: 0.7, description: '고정비 70% (개발, 인프라 중심)' },
    ecommerce: { name: '이커머스', ratio: 0.5, description: '고정비 50% (마케팅, 재고 중심)' },
    manufacturing: { name: '제조업', ratio: 0.8, description: '고정비 80% (설비, 인력 중심)' },
    service: { name: '서비스업', ratio: 0.6, description: '고정비 60% (인력, 운영 중심)' },
    custom: { name: '맞춤 설정', ratio: 0.5, description: '사용자 정의 비율' }
  };
  
  const fixedMarketingRatio = costStructureTemplates[costStructureType as keyof typeof costStructureTemplates].ratio;
  
  // 비용 구조 분석 수행
  const costStructure = analyzeCostStructure(
    result.monthly,
    costInputs,
    fixedMarketingRatio
  );
  
  // 고정비/변동비 파이 차트 데이터
  const costTypePieData = [
    { name: '고정 비용', value: costStructure.fixedCosts.total },
    { name: '변동 비용', value: costStructure.variableCosts.total },
  ];
  
  // 고정 비용 세부 내역 파이 차트 데이터
  const fixedCostsPieData = [
    { name: '인건비', value: costStructure.fixedCosts.personnel },
    { name: '마케팅 (고정)', value: costStructure.fixedCosts.marketing },
    { name: '기타 고정비', value: costStructure.fixedCosts.other },
  ];
  
  // 변동 비용 세부 내역 파이 차트 데이터
  const variableCostsPieData = [
    ...(costStructure.variableCosts.cogs ? [{ name: '제품 원가', value: costStructure.variableCosts.cogs }] : []),
    { name: '결제 수수료', value: costStructure.variableCosts.payment },
    ...(costStructure.variableCosts.shipping ? [{ name: '배송비', value: costStructure.variableCosts.shipping }] : []),
    { name: '기타 변동비', value: costStructure.variableCosts.other },
  ];
  
  // 규모별 비용 효율성 차트 데이터
  const scaleEfficiencyData = costStructure.scaleEfficiency.map((item, index) => ({
    name: `구간 ${index + 1}`,
    revenue: item.revenue,
    costRatio: item.costRatio * 100, // 퍼센트로 변환
  }));
  
  // 파이 차트 색상
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          비용 구조 분석
        </CardTitle>
        <CardDescription>
          고정 비용과 변동 비용의 비율 및 세부 내역을 분석합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 마케팅 비용 비율 설정 */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <h3 className="font-medium text-sm">마케팅 비용 구조 설정</h3>
            <div>
              <div className="flex justify-between mb-2">
                <Label>마케팅 비용 중 고정 비용 비율</Label>
                <span className="text-sm font-medium">{formatPercent(fixedMarketingRatio)}</span>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  현재 선택된 비즈니스 모델에 따라 고정비 비율이 자동으로 설정됩니다.
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                비즈니스 모델에 따라 고정비 비율이 자동으로 설정됩니다. 설정 탭에서 다른 모델을 선택할 수 있습니다.
              </p>
            </div>
          </div>
          
          {/* 비용 구조 요약 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                고정 비용
              </h3>
              <div className="text-2xl font-bold">
                {formatCurrency(costStructure.fixedCosts.total, currency)}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                전체 비용의 {formatPercent(costStructure.fixedCostRatio)}
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                변동 비용
              </h3>
              <div className="text-2xl font-bold">
                {formatCurrency(costStructure.variableCosts.total, currency)}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                전체 비용의 {formatPercent(costStructure.variableCostRatio)}
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                매출 대비 비용
              </h3>
              <div className="text-2xl font-bold">
                {formatPercent(costStructure.costToRevenueRatio)}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                총 비용 / 총 매출
              </p>
            </div>
          </div>
          
          {/* 차트 */}
          <Tabs defaultValue="cost-type">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="cost-type">비용 유형</TabsTrigger>
              <TabsTrigger value="fixed-costs">고정 비용 세부</TabsTrigger>
              <TabsTrigger value="variable-costs">변동 비용 세부</TabsTrigger>
              <TabsTrigger value="settings">설정</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cost-type" className="mt-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costTypePieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {costTypePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value, currency), '']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium">고정 비용 비율</p>
                  <p className="text-xl font-bold mt-1">{formatPercent(costStructure.fixedCostRatio)}</p>
                  <p className="text-xs text-gray-600 mt-1">매출과 관계없이 발생하는 비용</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium">변동 비용 비율</p>
                  <p className="text-xl font-bold mt-1">{formatPercent(costStructure.variableCostRatio)}</p>
                  <p className="text-xs text-gray-600 mt-1">매출에 비례하여 발생하는 비용</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="fixed-costs" className="mt-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fixedCostsPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {fixedCostsPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value, currency), '']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">인건비</p>
                    <p className="text-sm font-medium">{formatCurrency(costStructure.fixedCosts.personnel, currency)}</p>
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">마케팅 (고정)</p>
                    <p className="text-sm font-medium">{formatCurrency(costStructure.fixedCosts.marketing, currency)}</p>
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">기타 고정비</p>
                    <p className="text-sm font-medium">{formatCurrency(costStructure.fixedCosts.other, currency)}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="variable-costs" className="mt-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={variableCostsPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {variableCostsPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value, currency), '']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {costStructure.variableCosts.cogs && (
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">제품 원가</p>
                      <p className="text-sm font-medium">{formatCurrency(costStructure.variableCosts.cogs, currency)}</p>
                    </div>
                  </div>
                )}
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">결제 수수료</p>
                    <p className="text-sm font-medium">{formatCurrency(costStructure.variableCosts.payment, currency)}</p>
                  </div>
                </div>
                {costStructure.variableCosts.shipping && (
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">배송비</p>
                      <p className="text-sm font-medium">{formatCurrency(costStructure.variableCosts.shipping, currency)}</p>
                    </div>
                  </div>
                )}
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">기타 변동비</p>
                    <p className="text-sm font-medium">{formatCurrency(costStructure.variableCosts.other, currency)}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cost-structure-type" className="text-sm font-medium">
                    비즈니스 모델별 비용 구조
                  </Label>
                  <div className="mt-2">
                    <Select value={costStructureType} onValueChange={setCostStructureType}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="비즈니스 모델을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(costStructureTemplates).map(([key, template]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex flex-col">
                              <span className="font-medium">{template.name}</span>
                              <span className="text-xs text-gray-500">{template.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    현재 선택된 모델: {costStructureTemplates[costStructureType as keyof typeof costStructureTemplates].name} 
                    (고정비 {Math.round(fixedMarketingRatio * 100)}%)
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">💡 비용 구조 최적화 팁</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 고정비 비율이 높으면 시장 변화에 취약할 수 있습니다</li>
                    <li>• 변동비 중심 구조는 유연성을 높이지만 예측이 어려울 수 있습니다</li>
                    <li>• 비즈니스 모델에 맞는 적절한 비용 구조를 선택하세요</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* 규모별 비용 효율성 */}
          {scaleEfficiencyData.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-4">매출 규모별 비용 효율성</h3>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={scaleEfficiencyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis 
                      yAxisId="left"
                      orientation="left"
                      tickFormatter={(value) => 
                        new Intl.NumberFormat('ko-KR', {
                          notation: 'compact',
                          compactDisplay: 'short',
                        }).format(value)
                      }
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'revenue') {
                          return [formatCurrency(value, currency), '매출'];
                        }
                        return [`${value.toFixed(1)}%`, '비용 비율'];
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" name="매출" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="costRatio" name="비용 비율" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                매출 규모가 커질수록 비용 비율이 감소하면 규모의 경제 효과가 있음을 의미합니다.
              </p>
            </div>
          )}
          
          {/* 비용 최적화 제안 */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium">비용 최적화 제안</h3>
            <ul className="text-sm list-disc list-inside mt-2 space-y-1">
              <li>고정 비용 비율: <span className="font-medium">{formatPercent(costStructure.fixedCostRatio)}</span> - {costStructure.fixedCostRatio > 0.7 ? '고정 비용 비율이 높습니다. 필수 고정 비용을 검토하세요.' : '적절한 수준입니다.'}</li>
              <li>변동 비용 비율: <span className="font-medium">{formatPercent(costStructure.variableCostRatio)}</span> - {costStructure.variableCostRatio > 0.5 ? '공급망 최적화나 규모의 경제를 통해 변동 비용을 절감할 여지가 있습니다.' : '적절한 수준입니다.'}</li>
              <li>매출 대비 비용: <span className="font-medium">{formatPercent(costStructure.costToRevenueRatio)}</span> - {costStructure.costToRevenueRatio > 0.8 ? '수익성 개선이 필요합니다. 가격 전략과 비용 구조를 검토하세요.' : costStructure.costToRevenueRatio > 0.6 ? '비용 관리에 주의가 필요합니다.' : '양호한 수준입니다.'}</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
