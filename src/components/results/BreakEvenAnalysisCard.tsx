'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SimulationResult } from '@/types';
import { analyzeBreakEven } from '@/lib/analysis/breakEvenAnalysis';
import { formatCurrency, formatPercent } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { AlertCircle, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BreakEvenAnalysisCardProps {
  result: SimulationResult;
  currency: string;
}

export default function BreakEvenAnalysisCard({ result, currency }: BreakEvenAnalysisCardProps) {
  const [fixedCostsRatio, setFixedCostsRatio] = useState(0.7); // 기본값: 70%가 고정 비용
  const [variableCostRatio, setVariableCostRatio] = useState(0.3); // 기본값: 30%가 변동 비용
  
  // 월별 결과를 배열로 변환
  const monthsData = Object.entries(result.monthly).map(([month, data]) => ({
    month,
    ...data,
  }));
  
  // 손익분기점 분석 수행
  const breakEvenAnalysis = analyzeBreakEven(
    result.monthly,
    result.summary.totalCosts * fixedCostsRatio,
    variableCostRatio
  );
  
  // 누적 매출 및 비용 데이터 생성
  const cumulativeData = monthsData.reduce((acc, curr, index) => {
    const prevRevenue = index > 0 ? acc[index - 1].cumulativeRevenue : 0;
    const prevCosts = index > 0 ? acc[index - 1].cumulativeCosts : 0;
    
    // 고정 비용과 변동 비용 분리
    const fixedCosts = result.summary.totalCosts * fixedCostsRatio / monthsData.length;
    const variableCosts = curr.revenue * variableCostRatio;
    
    return [
      ...acc,
      {
        month: curr.month,
        revenue: curr.revenue,
        fixedCosts,
        variableCosts,
        totalCosts: fixedCosts + variableCosts,
        cumulativeRevenue: prevRevenue + curr.revenue,
        cumulativeCosts: prevCosts + fixedCosts + variableCosts,
        profit: curr.revenue - (fixedCosts + variableCosts),
        cumulativeProfit: (prevRevenue + curr.revenue) - (prevCosts + fixedCosts + variableCosts),
      }
    ];
  }, [] as Array<{
    month: string;
    revenue: number;
    fixedCosts: number;
    variableCosts: number;
    totalCosts: number;
    cumulativeRevenue: number;
    cumulativeCosts: number;
    profit: number;
    cumulativeProfit: number;
  }>);
  
  // 손익분기점 차트 데이터
  const breakEvenChartData = [
    { name: '고정 비용', value: breakEvenAnalysis.totalFixedCosts },
    { name: '변동 비용', value: result.summary.totalCosts - breakEvenAnalysis.totalFixedCosts },
  ];
  
  // 월간 손익분기점 매출 차트 데이터
  const monthlyBreakEvenData = monthsData.map((data, index) => ({
    month: data.month,
    revenue: data.revenue,
    breakEvenRevenue: breakEvenAnalysis.monthlyBreakEvenRevenue,
  }));
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          손익분기점 분석
        </CardTitle>
        <CardDescription>
          고정 비용과 변동 비용 비율에 따른 손익분기점 분석 결과입니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 비용 구조 설정 */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <h3 className="font-medium text-sm">비용 구조 설정</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <Label>고정 비용 비율</Label>
                  <span className="text-sm font-medium">{formatPercent(fixedCostsRatio)}</span>
                </div>
                <Slider
                  value={[fixedCostsRatio * 100]}
                  onValueChange={([value]) => {
                    setFixedCostsRatio(value / 100);
                    setVariableCostRatio(1 - (value / 100));
                  }}
                  max={100}
                  step={1}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <Label>변동 비용 비율</Label>
                  <span className="text-sm font-medium">{formatPercent(variableCostRatio)}</span>
                </div>
                <Slider
                  value={[variableCostRatio * 100]}
                  onValueChange={([value]) => {
                    setVariableCostRatio(value / 100);
                    setFixedCostsRatio(1 - (value / 100));
                  }}
                  max={100}
                  step={1}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 손익분기점 요약 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                손익분기점 도달 시점
              </h3>
              {breakEvenAnalysis.breakEvenMonth > 0 ? (
                <div className="text-2xl font-bold">
                  {breakEvenAnalysis.breakEvenMonth}개월
                </div>
              ) : (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>미도달</AlertTitle>
                  <AlertDescription>
                    시뮬레이션 기간 내에 손익분기점에 도달하지 못했습니다.
                  </AlertDescription>
                </Alert>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {breakEvenAnalysis.breakEvenMonth > 0
                  ? `${breakEvenAnalysis.breakEvenMonth}개월 후 누적 수익이 누적 비용을 초과합니다.`
                  : '손익분기점 도달을 위해 매출 증가 또는 비용 감소가 필요합니다.'}
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                월간 손익분기점 매출
              </h3>
              <div className="text-2xl font-bold">
                {formatCurrency(breakEvenAnalysis.monthlyBreakEvenRevenue, currency)}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                이 금액 이상의 월 매출이 발생하면 수익이 발생합니다.
              </p>
              <p className="text-sm font-medium mt-2">
                연간: {formatCurrency(breakEvenAnalysis.annualBreakEvenRevenue, currency)}
              </p>
            </div>
          </div>
          
          {/* 차트 */}
          <Tabs defaultValue="cumulative">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="cumulative">누적 손익</TabsTrigger>
              <TabsTrigger value="monthly">월별 손익분기점</TabsTrigger>
              <TabsTrigger value="cost-structure">비용 구조</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cumulative" className="mt-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={cumulativeData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      interval={Math.ceil(cumulativeData.length / 12) - 1}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => 
                        new Intl.NumberFormat('ko-KR', {
                          notation: 'compact',
                          compactDisplay: 'short',
                        }).format(value)
                      }
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value, currency), '']}
                      labelFormatter={(label) => `${label}월`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="cumulativeRevenue"
                      name="누적 매출"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulativeCosts"
                      name="누적 비용"
                      stroke="#ef4444"
                      strokeWidth={2}
                    />
                    <ReferenceLine
                      y={0}
                      stroke="#888"
                      strokeDasharray="3 3"
                    />
                    {breakEvenAnalysis.breakEvenMonth > 0 && (
                      <ReferenceLine
                        x={cumulativeData[breakEvenAnalysis.breakEvenMonth - 1]?.month}
                        stroke="#10b981"
                        strokeDasharray="3 3"
                        label={{ value: "BEP", position: "top", fill: "#10b981" }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="monthly" className="mt-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyBreakEvenData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      interval={Math.ceil(monthlyBreakEvenData.length / 12) - 1}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => 
                        new Intl.NumberFormat('ko-KR', {
                          notation: 'compact',
                          compactDisplay: 'short',
                        }).format(value)
                      }
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value, currency), '']}
                      labelFormatter={(label) => `${label}월`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="월 매출"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="breakEvenRevenue"
                      name="손익분기점 매출"
                      stroke="#ef4444"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="cost-structure" className="mt-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={breakEvenChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => 
                        new Intl.NumberFormat('ko-KR', {
                          notation: 'compact',
                          compactDisplay: 'short',
                        }).format(value)
                      }
                    />
                    <YAxis 
                      type="category"
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      width={100}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value, currency), '']}
                    />
                    <Legend />
                    <Bar
                      dataKey="value"
                      name="비용"
                      fill="#8884d8"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium">기여 마진 비율</p>
                  <p className="text-xl font-bold mt-1">{formatPercent(breakEvenAnalysis.contributionMarginRatio)}</p>
                  <p className="text-xs text-gray-600 mt-1">매출에서 변동 비용을 제외한 비율</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium">손익분기점 매출</p>
                  <p className="text-xl font-bold mt-1">{formatCurrency(breakEvenAnalysis.monthlyBreakEvenRevenue, currency)}</p>
                  <p className="text-xs text-gray-600 mt-1">월간 기준</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* 추가 정보 */}
          {breakEvenAnalysis.breakEvenMonth === 0 && (
            <div className="p-4 bg-amber-50 rounded-lg">
              <h3 className="font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                손익분기점 도달을 위한 제안
              </h3>
              <p className="text-sm mt-2">
                손익분기점 도달을 위해 필요한 추가 매출: {formatCurrency(breakEvenAnalysis.revenueGapToBreakEven, currency)}
              </p>
              <ul className="text-sm list-disc list-inside mt-2 space-y-1">
                <li>매출 증가: 가격 인상, 고객 확보 전략 개선, 제품 라인 확장 등을 고려하세요.</li>
                <li>비용 감소: 고정 비용 절감, 효율성 향상, 자원 재할당 등을 검토하세요.</li>
                <li>기여 마진 개선: 변동 비용을 줄이거나 고부가가치 제품/서비스로 전환하세요.</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
