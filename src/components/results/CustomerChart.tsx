'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SimulationResult, BusinessType } from '@/types';

interface CustomerChartProps {
  result: SimulationResult;
  businessType: BusinessType;
}

export default function CustomerChart({ result, businessType }: CustomerChartProps) {
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(value);
  };

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    return `${year}-${monthNum}`;
  };

  // 차트 데이터 준비
  const chartData = Object.entries(result.monthly).map(([month, data]) => ({
    month: formatMonth(month),
    customers: data.customers,
    ...(businessType === 'saas' && {
      visitors: data.visitors,
      signups: data.signups,
      paidCustomers: data.paidCustomers,
    }),
    ...(businessType === 'b2c-platform' && {
      orders: data.orders,
    }),
    ...(businessType === 'manufacturing' && {
      sales: data.sales,
      production: data.production,
    }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {businessType === 'b2c-platform' ? '주문 & 고객 변화' : 
           businessType === 'manufacturing' ? '판매 & 생산량' : 
           '고객 변화'}
        </CardTitle>
        <CardDescription>
          {businessType === 'saas' && '방문자, 가입자, 유료 고객 변화'}
          {businessType === 'manufacturing' && '판매량과 생산량 변화'}
          {businessType === 'b2c-platform' && '주문수와 구매자 변화'}
          {businessType === 'hybrid' && '고객과 판매량 변화'}
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
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  formatNumber(value), 
                  getTooltipLabel(name)
                ]}
                labelFormatter={(label) => `월: ${label}`}
              />
              <Legend />
              
              {businessType === 'saas' ? (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#6b7280" 
                    strokeWidth={2}
                    name="방문자"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="signups" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="가입자"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="paidCustomers" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="신규 유료 고객"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="customers" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="활성 유료 고객"
                  />
                </>
              ) : businessType === 'manufacturing' ? (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="판매량"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="production" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="생산량"
                  />
                </>
              ) : businessType === 'b2c-platform' ? (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="customers" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="구매자"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="주문수"
                  />
                </>
              ) : (
                // Hybrid
                <>
                  <Line 
                    type="monotone" 
                    dataKey="customers" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="고객수"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="판매량"
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
    customers: '고객수',
    visitors: '방문자',
    signups: '가입자',
    paidCustomers: '신규 유료 고객',
    orders: '주문수',
    sales: '판매량',
    production: '생산량',
  };
  return labels[name] || name;
}
