'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ScenarioData {
  type: string;
  result: {
    monthly: Record<string, {
      revenue: number;
      netProfit: number;
    }>;
  } | null;
}

interface ScenarioComparisonChartProps {
  scenarios: {
    optimistic: ScenarioData;
    realistic: ScenarioData;
    pessimistic: ScenarioData;
  };
  currency: string;
}

export default function ScenarioComparisonChart({ scenarios, currency }: ScenarioComparisonChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    return `${year}-${monthNum}`;
  };

  // 차트 데이터 준비
  const chartData = useMemo(() => {
    const months = Object.keys(scenarios.realistic.result?.monthly || {});
    
    return months.map(month => {
      const data: {
        month: string;
        optimisticRevenue?: number;
        optimisticProfit?: number;
        realisticRevenue?: number;
        realisticProfit?: number;
        pessimisticRevenue?: number;
        pessimisticProfit?: number;
      } = { month: formatMonth(month) };
      
      if (scenarios.optimistic.result?.monthly[month]) {
        data.optimisticRevenue = scenarios.optimistic.result.monthly[month].revenue;
        data.optimisticProfit = scenarios.optimistic.result.monthly[month].netProfit;
      }
      
      if (scenarios.realistic.result?.monthly[month]) {
        data.realisticRevenue = scenarios.realistic.result.monthly[month].revenue;
        data.realisticProfit = scenarios.realistic.result.monthly[month].netProfit;
      }
      
      if (scenarios.pessimistic.result?.monthly[month]) {
        data.pessimisticRevenue = scenarios.pessimistic.result.monthly[month].revenue;
        data.pessimisticProfit = scenarios.pessimistic.result.monthly[month].netProfit;
      }
      
      return data;
    });
  }, [scenarios]);

  if (!scenarios.realistic.result) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600 text-center">시나리오 데이터를 불러올 수 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 매출 비교 차트 */}
      <Card>
        <CardHeader>
          <CardTitle>매출 비교</CardTitle>
          <CardDescription>낙관/기준/보수 시나리오별 월간 매출</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value), 
                    getTooltipLabel(name)
                  ]}
                  labelFormatter={(label) => `월: ${label}`}
                />
                <Legend />
                
                <Line 
                  type="monotone" 
                  dataKey="optimisticRevenue" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="낙관 시나리오"
                  strokeDasharray="5 5"
                />
                <Line 
                  type="monotone" 
                  dataKey="realisticRevenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="기준 시나리오"
                />
                <Line 
                  type="monotone" 
                  dataKey="pessimisticRevenue" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="보수 시나리오"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 순이익 비교 차트 */}
      <Card>
        <CardHeader>
          <CardTitle>순이익 비교</CardTitle>
          <CardDescription>낙관/기준/보수 시나리오별 월간 순이익</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value), 
                    getTooltipLabel(name)
                  ]}
                  labelFormatter={(label) => `월: ${label}`}
                />
                <Legend />
                
                <Line 
                  type="monotone" 
                  dataKey="optimisticProfit" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="낙관 시나리오"
                  strokeDasharray="5 5"
                />
                <Line 
                  type="monotone" 
                  dataKey="realisticProfit" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="기준 시나리오"
                />
                <Line 
                  type="monotone" 
                  dataKey="pessimisticProfit" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="보수 시나리오"
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getTooltipLabel(name: string): string {
  const labels: Record<string, string> = {
    optimisticRevenue: '낙관 매출',
    realisticRevenue: '기준 매출',
    pessimisticRevenue: '보수 매출',
    optimisticProfit: '낙관 순이익',
    realisticProfit: '기준 순이익',
    pessimisticProfit: '보수 순이익',
  };
  return labels[name] || name;
}

