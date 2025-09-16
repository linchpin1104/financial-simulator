'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SimulationResult } from '@/types';

interface CostChartProps {
  result: SimulationResult;
  currency: string;
}

export default function CostChart({ result, currency }: CostChartProps) {
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
  const chartData = Object.entries(result.monthly).map(([month, data]) => ({
    month: formatMonth(month),
    revenue: data.revenue,
    totalCosts: data.totalCosts,
    netProfit: data.netProfit,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>비용 vs 매출</CardTitle>
        <CardDescription>월간 매출, 비용, 순이익 비교</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
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
              
              <Bar 
                dataKey="revenue" 
                fill="#3b82f6" 
                name="매출"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="totalCosts" 
                fill="#ef4444" 
                name="총 비용"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="netProfit" 
                fill="#10b981" 
                name="순이익"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function getTooltipLabel(name: string): string {
  const labels: Record<string, string> = {
    revenue: '매출',
    totalCosts: '총 비용',
    netProfit: '순이익',
  };
  return labels[name] || name;
}
