'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SimulationResult, BusinessType } from '@/types';

interface RevenueChartProps {
  result: SimulationResult;
  businessType: BusinessType;
  currency: string;
}

export default function RevenueChart({ result, businessType, currency }: RevenueChartProps) {
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
    netProfit: data.netProfit,
    ...(businessType === 'saas' && {
      mrr: data.mrr,
    }),
    ...(businessType === 'b2c-platform' && {
      gmv: data.gmv,
      platformRevenue: data.platformRevenue,
    }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {businessType === 'b2c-platform' ? 'GMV & 플랫폼 매출' : '매출 추이'}
        </CardTitle>
        <CardDescription>
          {businessType === 'saas' && '월간 매출과 MRR 변화'}
          {businessType === 'manufacturing' && '월간 매출과 순이익 변화'}
          {businessType === 'b2c-platform' && 'GMV와 플랫폼 매출 변화'}
          {businessType === 'hybrid' && '월간 매출과 순이익 변화'}
        </CardDescription>
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
              
              {businessType === 'saas' ? (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="총 매출"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="mrr" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="MRR"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="netProfit" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="순이익"
                  />
                </>
              ) : businessType === 'b2c-platform' ? (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="gmv" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="GMV"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="platformRevenue" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="플랫폼 매출"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="netProfit" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="순이익"
                  />
                </>
              ) : (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="매출"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="netProfit" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="순이익"
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function getTooltipLabel(name: string): string {
  const labels: Record<string, string> = {
    revenue: '총 매출',
    mrr: 'MRR',
    netProfit: '순이익',
    gmv: 'GMV',
    platformRevenue: '플랫폼 매출',
  };
  return labels[name] || name;
}
