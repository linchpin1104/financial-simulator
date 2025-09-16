'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimulationResult, BusinessType } from '@/types';

interface KPICardsProps {
  result: SimulationResult;
  businessType: BusinessType;
  currency: string;
}

export default function KPICards({ result, businessType, currency }: KPICardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(value);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const { summary } = result;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* 총 매출 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">총 매출</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(summary.totalRevenue)}
          </div>
          <p className="text-xs text-gray-500 mt-1">12개월 누적</p>
        </CardContent>
      </Card>

      {/* 총 고객/주문 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            {businessType === 'b2c-platform' ? '총 주문수' : '총 고객수'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatNumber(businessType === 'b2c-platform' ? summary.totalOrders || 0 : summary.totalCustomers)}
          </div>
          <p className="text-xs text-gray-500 mt-1">12개월 누적</p>
        </CardContent>
      </Card>

      {/* 순이익 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">순이익</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(summary.netProfit)}
          </div>
          <p className="text-xs text-gray-500 mt-1">12개월 누적</p>
        </CardContent>
      </Card>

      {/* 마진율 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">평균 마진율</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${summary.averageProfitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercent(summary.averageProfitMargin)}
          </div>
          <p className="text-xs text-gray-500 mt-1">매출 대비</p>
        </CardContent>
      </Card>

      {/* SaaS 전용 KPI */}
      {businessType === 'saas' && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">MRR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(summary.mrr || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">월간 반복 매출</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">ARR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(summary.arr || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">연간 반복 매출</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">LTV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                {formatCurrency(summary.ltv || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">고객 생애 가치</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">CAC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">
                {formatCurrency(summary.cac || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">고객 획득 비용</p>
            </CardContent>
          </Card>
        </>
      )}

      {/* B2C 플랫폼 전용 KPI */}
      {businessType === 'b2c-platform' && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">총 GMV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(summary.totalGmv || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">총 거래액</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Take Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatPercent(summary.averageTakeRate || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">평균 수수료율</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">총 환불</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.totalRefunds || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">환불 손실</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
