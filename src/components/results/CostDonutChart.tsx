'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CostInputs, BusinessType } from '@/types';

interface CostDonutChartProps {
  costInputs: CostInputs;
  businessType: BusinessType;
  currency: string;
  totalRevenue?: number;
}

export default function CostDonutChart({ costInputs, businessType, currency, totalRevenue }: CostDonutChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // 비용 데이터 준비
  const costData = [
    {
      name: '마케팅비',
      value: costInputs.marketingCost,
      color: '#3b82f6',
    },
    {
      name: '인건비',
      value: costInputs.personnelCost,
      color: '#10b981',
    },
    {
      name: '기타 고정비',
      value: costInputs.otherFixedCosts,
      color: '#f59e0b',
    },
  ];

  // 제조/유통 모드에서만 배송비 추가
  if (businessType === 'manufacturing' || businessType === 'hybrid') {
    costData.push({
      name: '배송비',
      value: (costInputs.shippingCostPerUnit || 0) * 1000, // 예시: 1000개 기준
      color: '#8b5cf6',
    });
  }

  const totalCosts = costData.reduce((sum, item) => sum + item.value, 0);

  // 매출 대비 비용 비율 계산
  const costRatio = totalRevenue && totalRevenue > 0 ? totalCosts / totalRevenue : 0;

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = totalCosts > 0 ? (data.value / totalCosts) * 100 : 0;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {formatCurrency(data.value)} ({percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>비용 구조</CardTitle>
        <CardDescription>
          {totalRevenue ? '매출 대비 비용 비율' : '월간 비용 구성'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={costData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {costData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry: { color: string; payload: { value: number } }) => (
                  <span style={{ color: entry.color }}>
                    {value}: {formatCurrency(entry.payload.value)}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 요약 정보 */}
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">총 비용</p>
              <p className="text-lg font-bold">{formatCurrency(totalCosts)}</p>
            </div>
            {totalRevenue && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">매출 대비 비용</p>
                <p className="text-lg font-bold">{formatPercent(costRatio)}</p>
              </div>
            )}
          </div>

          {/* 비용 상세 */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">비용 상세</h4>
            {costData.map((item, index) => {
              const percentage = totalCosts > 0 ? (item.value / totalCosts) * 100 : 0;
              return (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(item.value)}</div>
                    <div className="text-gray-500">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 매출 대비 비용 분석 */}
          {totalRevenue && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">매출 대비 비용 분석</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>총 매출:</span>
                  <span className="font-medium">{formatCurrency(totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>총 비용:</span>
                  <span className="font-medium">{formatCurrency(totalCosts)}</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span>순이익:</span>
                  <span className={`font-medium ${totalRevenue - totalCosts >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totalRevenue - totalCosts)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>마진율:</span>
                  <span className={`font-medium ${costRatio <= 0.7 ? 'text-green-600' : costRatio <= 0.9 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {formatPercent(1 - costRatio)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
