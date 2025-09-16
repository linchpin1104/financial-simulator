'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SimulationResult, BusinessType } from '@/types';
import { analyzeScaleEconomics } from '@/lib/analysis/scaleEconomicsAnalysis';
import { formatCurrency, formatPercent } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Scale, TrendingUp, BarChart3 } from 'lucide-react';

interface ScaleEconomicsCardProps {
  result: SimulationResult;
  businessType: BusinessType;
  currency: string;
}

export default function ScaleEconomicsCard({ result, businessType, currency }: ScaleEconomicsCardProps) {
  // 규모의 경제 분석 수행
  const scaleEconomics = analyzeScaleEconomics(result.monthly, businessType);
  
  // 매출 구간별 비용 효율성 차트 데이터
  const revenueScalesData = scaleEconomics.revenueScales.map((scale, index) => ({
    name: `구간 ${index + 1}`,
    revenue: scale.avgRevenue,
    costs: scale.avgCosts,
    costRatio: scale.costRatio * 100, // 퍼센트로 변환
  }));
  
  // 매출 증가에 따른 비용 효율성 개선 예측 차트 데이터
  const projectedEfficiencyData = scaleEconomics.projectedEfficiency.map((proj, index) => ({
    name: `${index === 0 ? '현재' : `${index + 1}배`}`,
    revenue: proj.revenueGrowth,
    costRatio: proj.costRatio * 100, // 퍼센트로 변환
    savings: proj.savings,
  }));
  
  // 월별 매출-비용 관계 차트 데이터
  const monthlyScatterData = Object.entries(result.monthly).map(([monthKey, month]) => ({
    revenue: month.revenue,
    costs: month.totalCosts,
    costRatio: month.revenue > 0 ? (month.totalCosts / month.revenue) * 100 : 0,
    month: monthKey,
  }));
  
  // 비즈니스 타입별 특화 지표
  const getBusinessSpecificMetrics = () => {
    if (businessType === 'saas' && scaleEconomics.businessSpecificMetrics.saas) {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium">최적 고객 수</p>
            <p className="text-xl font-bold mt-1">
              {scaleEconomics.businessSpecificMetrics.saas.optimalCustomerCount.toLocaleString()}명
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium">고객 획득 효율성</p>
            <p className="text-xl font-bold mt-1">
              {formatPercent(scaleEconomics.businessSpecificMetrics.saas.customerAcquisitionEfficiency)}
            </p>
          </div>
        </div>
      );
    } else if (businessType === 'manufacturing' && scaleEconomics.businessSpecificMetrics.manufacturing) {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium">최적 생산량</p>
            <p className="text-xl font-bold mt-1">
              {scaleEconomics.businessSpecificMetrics.manufacturing.optimalProductionVolume.toLocaleString()}개
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium">생산 효율성</p>
            <p className="text-xl font-bold mt-1">
              {formatPercent(scaleEconomics.businessSpecificMetrics.manufacturing.productionEfficiency)}
            </p>
          </div>
        </div>
      );
    } else if (businessType === 'b2c-platform' && scaleEconomics.businessSpecificMetrics.b2cPlatform) {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium">최적 거래량</p>
            <p className="text-xl font-bold mt-1">
              {scaleEconomics.businessSpecificMetrics.b2cPlatform.optimalTransactionVolume.toLocaleString()}건
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium">네트워크 효율성</p>
            <p className="text-xl font-bold mt-1">
              {formatPercent(scaleEconomics.businessSpecificMetrics.b2cPlatform.networkEfficiencyFactor)}
            </p>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          규모의 경제 분석
        </CardTitle>
        <CardDescription>
          사업 규모에 따른 비용 구조 변화와 효율성을 분석합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 규모의 경제 지수 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                규모의 경제 지수
              </h3>
              <div className="text-2xl font-bold">
                {formatPercent(scaleEconomics.scaleEconomicsIndex)}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {scaleEconomics.scaleEconomicsIndex > 0.2 
                  ? '규모의 경제 효과가 있습니다.' 
                  : '규모의 경제 효과가 약합니다.'}
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                최적 운영 규모
              </h3>
              <div className="text-xl font-bold">
                {formatCurrency(scaleEconomics.optimalOperatingScale.minRevenue, currency)} ~ {formatCurrency(scaleEconomics.optimalOperatingScale.maxRevenue, currency)}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                비용 효율성: {formatPercent(1 - scaleEconomics.optimalOperatingScale.costRatio)}
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">예상 비용 절감</h3>
              <div className="text-xl font-bold">
                {scaleEconomics.projectedEfficiency.length > 0 
                  ? formatCurrency(scaleEconomics.projectedEfficiency[2].savings, currency)
                  : formatCurrency(0, currency)}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                매출 3배 성장 시
              </p>
            </div>
          </div>
          
          {/* 비즈니스 타입별 특화 지표 */}
          {getBusinessSpecificMetrics()}
          
          {/* 차트 */}
          <Tabs defaultValue="revenue-scales">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="revenue-scales">매출 구간별 효율성</TabsTrigger>
              <TabsTrigger value="projected-efficiency">성장 예측</TabsTrigger>
              <TabsTrigger value="monthly-scatter">월별 매출-비용 관계</TabsTrigger>
            </TabsList>
            
            <TabsContent value="revenue-scales" className="mt-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={revenueScalesData}
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
                        if (name === 'revenue' || name === 'costs') {
                          return [formatCurrency(value, currency), name === 'revenue' ? '매출' : '비용'];
                        }
                        return [`${value.toFixed(1)}%`, '비용 비율'];
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" name="매출" fill="#8884d8" />
                    <Bar yAxisId="left" dataKey="costs" name="비용" fill="#82ca9d" />
                    <Bar yAxisId="right" dataKey="costRatio" name="비용 비율" fill="#ff7300" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                매출 규모가 커질수록 비용 비율이 감소하면 규모의 경제 효과가 있음을 의미합니다.
              </p>
            </TabsContent>
            
            <TabsContent value="projected-efficiency" className="mt-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={projectedEfficiencyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis 
                      yAxisId="left"
                      orientation="left"
                      tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(value) => 
                        new Intl.NumberFormat('ko-KR', {
                          notation: 'compact',
                          compactDisplay: 'short',
                        }).format(value)
                      }
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'costRatio') {
                          return [`${value.toFixed(1)}%`, '비용 비율'];
                        }
                        if (name === 'revenue') {
                          return [formatCurrency(value, currency), '매출'];
                        }
                        return [formatCurrency(value, currency), '비용 절감'];
                      }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="costRatio" 
                      name="비용 비율" 
                      stroke="#ff7300" 
                      strokeWidth={2}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="savings" 
                      name="비용 절감" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                매출 성장에 따른 비용 효율성 개선 및 비용 절감 효과를 예측합니다.
              </p>
            </TabsContent>
            
            <TabsContent value="monthly-scatter" className="mt-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="revenue" 
                      name="매출"
                      tickFormatter={(value) => 
                        new Intl.NumberFormat('ko-KR', {
                          notation: 'compact',
                          compactDisplay: 'short',
                        }).format(value)
                      }
                    />
                    <YAxis 
                      type="number" 
                      dataKey="costs" 
                      name="비용"
                      tickFormatter={(value) => 
                        new Intl.NumberFormat('ko-KR', {
                          notation: 'compact',
                          compactDisplay: 'short',
                        }).format(value)
                      }
                    />
                    <ZAxis 
                      type="number" 
                      dataKey="costRatio" 
                      range={[50, 400]} 
                      name="비용 비율"
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value: number, name: string) => {
                        if (name === 'revenue' || name === 'costs') {
                          return [formatCurrency(value, currency), name === 'revenue' ? '매출' : '비용'];
                        }
                        if (name === 'costRatio') {
                          return [`${value.toFixed(1)}%`, '비용 비율'];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Scatter 
                      name="월별 매출-비용" 
                      data={monthlyScatterData} 
                      fill="#8884d8"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                월별 매출과 비용의 관계를 보여줍니다. 점의 크기는 비용 비율을 나타냅니다.
              </p>
            </TabsContent>
          </Tabs>
          
          {/* 규모의 경제 최적화 제안 */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium">규모의 경제 최적화 제안</h3>
            <ul className="text-sm list-disc list-inside mt-2 space-y-1">
              <li>
                <span className="font-medium">규모의 경제 지수: {formatPercent(scaleEconomics.scaleEconomicsIndex)}</span>
                {scaleEconomics.scaleEconomicsIndex > 0.2 
                  ? ' - 규모 확대를 통한 비용 효율화 기회가 있습니다.' 
                  : ' - 규모 확대보다 다른 효율화 전략을 고려하세요.'}
              </li>
              <li>
                <span className="font-medium">최적 운영 규모: {formatCurrency(scaleEconomics.optimalOperatingScale.minRevenue, currency)} ~ {formatCurrency(scaleEconomics.optimalOperatingScale.maxRevenue, currency)}</span>
                {' - 이 매출 구간에서 가장 효율적으로 운영됩니다.'}
              </li>
              <li>
                {businessType === 'saas' && scaleEconomics.businessSpecificMetrics.saas && (
                  <>
                    <span className="font-medium">최적 고객 수: {scaleEconomics.businessSpecificMetrics.saas.optimalCustomerCount.toLocaleString()}명</span>
                    {' - 이 고객 수를 목표로 성장 전략을 수립하세요.'}
                  </>
                )}
                {businessType === 'manufacturing' && scaleEconomics.businessSpecificMetrics.manufacturing && (
                  <>
                    <span className="font-medium">최적 생산량: {scaleEconomics.businessSpecificMetrics.manufacturing.optimalProductionVolume.toLocaleString()}개</span>
                    {' - 이 생산량을 목표로 설비 계획을 수립하세요.'}
                  </>
                )}
                {businessType === 'b2c-platform' && scaleEconomics.businessSpecificMetrics.b2cPlatform && (
                  <>
                    <span className="font-medium">최적 거래량: {scaleEconomics.businessSpecificMetrics.b2cPlatform.optimalTransactionVolume.toLocaleString()}건</span>
                    {' - 이 거래량을 목표로 플랫폼 성장 전략을 수립하세요.'}
                  </>
                )}
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
