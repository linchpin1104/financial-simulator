'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BusinessType } from '@/types';

interface ScenarioData {
  type: string;
  result: {
    summary: {
      totalRevenue: number;
      totalCustomers: number;
      totalCosts: number;
      netProfit: number;
      averageProfitMargin: number;
      mrr?: number;
      arr?: number;
      ltv?: number;
      cac?: number;
      totalGmv?: number;
      totalOrders?: number;
      averageTakeRate?: number;
      totalRefunds?: number;
    };
  } | null;
}

interface ScenarioComparisonTableProps {
  scenarios: {
    optimistic: ScenarioData;
    realistic: ScenarioData;
    pessimistic: ScenarioData;
  };
  currency: string;
  businessType: BusinessType;
}

export default function ScenarioComparisonTable({ scenarios, currency, businessType }: ScenarioComparisonTableProps) {
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

  const getScenarioData = (scenario: ScenarioData) => {
    if (!scenario.result) return null;
    return scenario.result.summary;
  };

  const optimisticData = getScenarioData(scenarios.optimistic);
  const realisticData = getScenarioData(scenarios.realistic);
  const pessimisticData = getScenarioData(scenarios.pessimistic);

  if (!realisticData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600 text-center">시나리오 데이터를 불러올 수 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      label: '총 매출',
      optimistic: optimisticData?.totalRevenue,
      realistic: realisticData?.totalRevenue,
      pessimistic: pessimisticData?.totalRevenue,
      format: formatCurrency,
    },
    {
      label: '총 고객수',
      optimistic: optimisticData?.totalCustomers,
      realistic: realisticData?.totalCustomers,
      pessimistic: pessimisticData?.totalCustomers,
      format: formatNumber,
    },
    {
      label: '총 비용',
      optimistic: optimisticData?.totalCosts,
      realistic: realisticData?.totalCosts,
      pessimistic: pessimisticData?.totalCosts,
      format: formatCurrency,
    },
    {
      label: '순이익',
      optimistic: optimisticData?.netProfit,
      realistic: realisticData?.netProfit,
      pessimistic: pessimisticData?.netProfit,
      format: formatCurrency,
    },
    {
      label: '평균 마진율',
      optimistic: optimisticData?.averageProfitMargin,
      realistic: realisticData?.averageProfitMargin,
      pessimistic: pessimisticData?.averageProfitMargin,
      format: formatPercent,
    },
  ];

  // SaaS 전용 메트릭
  if (businessType === 'saas') {
    metrics.push(
      {
        label: 'MRR',
        optimistic: optimisticData?.mrr,
        realistic: realisticData?.mrr,
        pessimistic: pessimisticData?.mrr,
        format: formatCurrency,
      },
      {
        label: 'ARR',
        optimistic: optimisticData?.arr,
        realistic: realisticData?.arr,
        pessimistic: pessimisticData?.arr,
        format: formatCurrency,
      },
      {
        label: 'LTV',
        optimistic: optimisticData?.ltv,
        realistic: realisticData?.ltv,
        pessimistic: pessimisticData?.ltv,
        format: formatCurrency,
      },
      {
        label: 'CAC',
        optimistic: optimisticData?.cac,
        realistic: realisticData?.cac,
        pessimistic: pessimisticData?.cac,
        format: formatCurrency,
      }
    );
  }

  // B2C 플랫폼 전용 메트릭
  if (businessType === 'b2c-platform') {
    metrics.push(
      {
        label: '총 GMV',
        optimistic: optimisticData?.totalGmv,
        realistic: realisticData?.totalGmv,
        pessimistic: pessimisticData?.totalGmv,
        format: formatCurrency,
      },
      {
        label: '총 주문수',
        optimistic: optimisticData?.totalOrders,
        realistic: realisticData?.totalOrders,
        pessimistic: pessimisticData?.totalOrders,
        format: formatNumber,
      },
      {
        label: '평균 Take Rate',
        optimistic: optimisticData?.averageTakeRate,
        realistic: realisticData?.averageTakeRate,
        pessimistic: pessimisticData?.averageTakeRate,
        format: formatPercent,
      },
      {
        label: '총 환불',
        optimistic: optimisticData?.totalRefunds,
        realistic: realisticData?.totalRefunds,
        pessimistic: pessimisticData?.totalRefunds,
        format: formatCurrency,
      }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>시나리오 비교표</CardTitle>
        <CardDescription>낙관/기준/보수 시나리오별 주요 지표 비교</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium text-gray-600">지표</th>
                <th className="text-right p-3 font-medium text-green-700">낙관 시나리오</th>
                <th className="text-right p-3 font-medium text-blue-700">기준 시나리오</th>
                <th className="text-right p-3 font-medium text-red-700">보수 시나리오</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{metric.label}</td>
                  <td className="text-right p-3 text-green-700">
                    {metric.optimistic !== undefined ? metric.format(metric.optimistic) : '-'}
                  </td>
                  <td className="text-right p-3 text-blue-700 font-medium">
                    {metric.realistic !== undefined ? metric.format(metric.realistic) : '-'}
                  </td>
                  <td className="text-right p-3 text-red-700">
                    {metric.pessimistic !== undefined ? metric.format(metric.pessimistic) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 요약 정보 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">시나리오 요약</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-green-700">낙관 시나리오</p>
              <p className="text-gray-600">
                전환율 +20%, 가격 +10%, 비용 -10% 가정
              </p>
            </div>
            <div>
              <p className="font-medium text-blue-700">기준 시나리오</p>
              <p className="text-gray-600">
                현재 입력값 기준
              </p>
            </div>
            <div>
              <p className="font-medium text-red-700">보수 시나리오</p>
              <p className="text-gray-600">
                전환율 -20%, 가격 -10%, 비용 +10% 가정
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
