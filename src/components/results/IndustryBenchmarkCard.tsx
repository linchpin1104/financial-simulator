'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SimulationResult, BusinessType } from '@/types';
import { compareWithBenchmarks, getIndustryBenchmark } from '@/lib/analysis/industryBenchmarks';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { TrendingUp, TrendingDown, Minus, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface IndustryBenchmarkCardProps {
  result: SimulationResult;
  businessType: BusinessType;
  currency: string;
}

export default function IndustryBenchmarkCard({ result, businessType, currency }: IndustryBenchmarkCardProps) {
  const [stage, setStage] = useState<'startup' | 'growth' | 'mature'>('startup');
  
  // 벤치마크 비교 분석
  const benchmarkComparison = compareWithBenchmarks(result, businessType, stage);
  
  // 벤치마크 데이터
  const benchmark = getIndustryBenchmark(businessType, stage);
  
  // 비교 차트 데이터
  const comparisonChartData = benchmarkComparison.comparisons.map(comp => ({
    metric: comp.metric,
    current: comp.current,
    benchmark: comp.benchmark,
    difference: comp.difference,
  }));
  
  // 레이더 차트 데이터 (주요 지표 5개)
  const radarData = [
    {
      metric: '전환율',
      current: benchmarkComparison.comparisons.find(c => c.metric.includes('전환율'))?.current || 0,
      benchmark: benchmarkComparison.comparisons.find(c => c.metric.includes('전환율'))?.benchmark || 0,
    },
    {
      metric: '이탈률',
      current: 100 - (benchmarkComparison.comparisons.find(c => c.metric.includes('이탈률'))?.current || 0),
      benchmark: 100 - (benchmarkComparison.comparisons.find(c => c.metric.includes('이탈률'))?.benchmark || 0),
    },
    {
      metric: '수익성',
      current: benchmarkComparison.comparisons.find(c => c.metric.includes('수익성'))?.current || 0,
      benchmark: benchmarkComparison.comparisons.find(c => c.metric.includes('수익성'))?.benchmark || 0,
    },
    {
      metric: 'LTV/CAC',
      current: benchmarkComparison.comparisons.find(c => c.metric.includes('LTV/CAC'))?.current || 0,
      benchmark: benchmarkComparison.comparisons.find(c => c.metric.includes('LTV/CAC'))?.benchmark || 0,
    },
    {
      metric: '전체 점수',
      current: benchmarkComparison.overallScore,
      benchmark: 70, // 기준점
    },
  ];
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'above':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'below':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'above':
        return 'text-green-600 bg-green-50';
      case 'below':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          산업 벤치마크 비교
        </CardTitle>
        <CardDescription>
          업계 평균 대비 성과를 분석하고 개선 방향을 제시합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 성장 단계 선택 */}
          <div className="flex items-center space-x-4">
            <Label>성장 단계</Label>
            <Select value={stage} onValueChange={(value: 'startup' | 'growth' | 'mature') => setStage(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="startup">스타트업</SelectItem>
                <SelectItem value="growth">성장기</SelectItem>
                <SelectItem value="mature">성숙기</SelectItem>
              </SelectContent>
            </Select>
            {benchmark && (
              <div className="text-sm text-gray-500">
                {benchmark.industry} {stage === 'startup' ? '스타트업' : stage === 'growth' ? '성장기' : '성숙기'} 기준
              </div>
            )}
          </div>
          
          {/* 전체 점수 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">전체 점수</h3>
              <div className="text-3xl font-bold">
                {benchmarkComparison.overallScore}/100
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${
                    benchmarkComparison.overallScore >= 80 ? 'bg-green-500' :
                    benchmarkComparison.overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${benchmarkComparison.overallScore}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {benchmarkComparison.overallScore >= 80 ? '우수' : 
                 benchmarkComparison.overallScore >= 60 ? '양호' : '개선 필요'}
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">강점</h3>
              <div className="text-lg font-bold text-green-600">
                {benchmarkComparison.strengths.length}개
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {benchmarkComparison.strengths.length > 0 
                  ? benchmarkComparison.strengths.join(', ')
                  : '업계 평균 대비 강점이 없습니다.'}
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">개선점</h3>
              <div className="text-lg font-bold text-red-600">
                {benchmarkComparison.improvements.length}개
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {benchmarkComparison.improvements.length > 0 
                  ? benchmarkComparison.improvements.join(', ')
                  : '모든 지표가 업계 평균 이상입니다.'}
              </p>
            </div>
          </div>
          
          {/* 지표별 비교 */}
          <div className="space-y-3">
            <h3 className="font-medium">지표별 비교</h3>
            {benchmarkComparison.comparisons.map((comp, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{comp.metric}</h4>
                  <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-sm ${getStatusColor(comp.status)}`}>
                    {getStatusIcon(comp.status)}
                    <span>
                      {comp.status === 'above' ? '우수' : 
                       comp.status === 'below' ? '개선 필요' : '평균'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">현재</p>
                    <p className="font-medium">
                      {comp.metric.includes('비율') || comp.metric.includes('율') 
                        ? `${comp.current.toFixed(1)}%`
                        : comp.metric.includes('LTV/CAC')
                        ? comp.current.toFixed(1)
                        : formatCurrency(comp.current, currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">업계 평균</p>
                    <p className="font-medium">
                      {comp.metric.includes('비율') || comp.metric.includes('율') 
                        ? `${comp.benchmark.toFixed(1)}%`
                        : comp.metric.includes('LTV/CAC')
                        ? comp.benchmark.toFixed(1)
                        : formatCurrency(comp.benchmark, currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">차이</p>
                    <p className={`font-medium ${comp.difference > 0 ? 'text-green-600' : comp.difference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {comp.difference > 0 ? '+' : ''}
                      {comp.metric.includes('비율') || comp.metric.includes('율') 
                        ? `${comp.difference.toFixed(1)}%p`
                        : comp.metric.includes('LTV/CAC')
                        ? comp.difference.toFixed(1)
                        : formatCurrency(comp.difference, currency)}
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mt-2">{comp.recommendation}</p>
              </div>
            ))}
          </div>
          
          {/* 차트 */}
          <Tabs defaultValue="comparison">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="comparison">지표 비교</TabsTrigger>
              <TabsTrigger value="radar">종합 분석</TabsTrigger>
            </TabsList>
            
            <TabsContent value="comparison" className="mt-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparisonChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="metric" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
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
                      formatter={(value: number, name: string) => {
                        if (name === 'current') return [value, '현재'];
                        if (name === 'benchmark') return [value, '업계 평균'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="current" name="현재" fill="#8884d8" />
                    <Bar dataKey="benchmark" name="업계 평균" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="radar" className="mt-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                    />
                    <Radar
                      name="현재"
                      dataKey="current"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="업계 평균"
                      dataKey="benchmark"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.3}
                    />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* 개선 제안 */}
          <div className="space-y-4">
            {benchmarkComparison.strengths.length > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>강점:</strong> {benchmarkComparison.strengths.join(', ')} 영역에서 업계 평균을 상회하고 있습니다. 
                  이 강점을 더욱 발전시켜 경쟁 우위를 확보하세요.
                </AlertDescription>
              </Alert>
            )}
            
            {benchmarkComparison.improvements.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>개선 필요:</strong> {benchmarkComparison.improvements.join(', ')} 영역에서 업계 평균에 미치지 못하고 있습니다. 
                  구체적인 개선 계획을 수립하여 경쟁력을 높이세요.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
