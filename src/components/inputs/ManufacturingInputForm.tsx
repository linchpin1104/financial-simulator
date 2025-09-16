'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ManufacturingInputs } from '@/types';
import GrowthRateSettingsComponent from './GrowthRateSettings';

interface ManufacturingInputFormProps {
  initialData?: Partial<ManufacturingInputs>;
  onChange: (data: ManufacturingInputs) => void;
  currency: string;
}

export default function ManufacturingInputForm({ initialData, onChange, currency }: ManufacturingInputFormProps) {
  const [data, setData] = useState<ManufacturingInputs>({
    monthlySales: 1000,
    unitPrice: 50,
    productionCapacity: 1200,
    materialCostPerUnit: 15,
    laborCostPerUnit: 10,
    shippingCostPerUnit: 5,
    otherVariableCostPerUnit: 3,
    growthRateSettings: {
      quarterlyRates: [],
      applyToRevenue: true,
      applyToCustomers: true,
    },
    quarterlyDetailedSettings: {
      quarterlyMetrics: [],
      useDetailedSettings: false,
    },
    ...initialData,
  });

  useEffect(() => {
    onChange(data);
  }, [data, onChange]);

  const updateData = (updates: Partial<ManufacturingInputs>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const totalVariableCost = data.materialCostPerUnit + data.laborCostPerUnit + data.shippingCostPerUnit + data.otherVariableCostPerUnit;
  const grossMarginPerUnit = data.unitPrice - totalVariableCost;
  const grossMarginRate = data.unitPrice > 0 ? grossMarginPerUnit / data.unitPrice : 0;

  return (
    <div className="space-y-6">
      {/* 판매량 & 가격 */}
      <Card>
        <CardHeader>
          <CardTitle>판매량 & 가격</CardTitle>
          <CardDescription>월간 판매 계획과 단가</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="monthlySales">월간 판매 수량</Label>
              <Input
                id="monthlySales"
                type="number"
                value={data.monthlySales}
                onChange={(e) => updateData({ monthlySales: Number(e.target.value) })}
                className="mt-1"
              />
              <p className="text-sm text-gray-600 mt-1">
                월간 {data.monthlySales.toLocaleString()}개 판매 예정
              </p>
            </div>
            <div>
              <Label htmlFor="unitPrice">판매 단가</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currency === 'KRW' ? '₩' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '¥'}
                </span>
                <Input
                  id="unitPrice"
                  type="number"
                  value={data.unitPrice}
                  onChange={(e) => updateData({ unitPrice: Number(e.target.value) })}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 생산량 & 원가 */}
      <Card>
        <CardHeader>
          <CardTitle>생산량 & 원가</CardTitle>
          <CardDescription>생산 계획과 단위당 원가</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="productionCapacity">월간 생산 능력</Label>
            <Input
              id="productionCapacity"
              type="number"
              value={data.productionCapacity}
              onChange={(e) => updateData({ productionCapacity: Number(e.target.value) })}
              className="mt-1"
            />
            <p className="text-sm text-gray-600 mt-1">
              월간 최대 {data.productionCapacity.toLocaleString()}개 생산 가능
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="materialCostPerUnit">원자재 단가</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currency === 'KRW' ? '₩' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '¥'}
                </span>
                <Input
                  id="materialCostPerUnit"
                  type="number"
                  value={data.materialCostPerUnit}
                  onChange={(e) => updateData({ materialCostPerUnit: Number(e.target.value) })}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="laborCostPerUnit">인건비 단가</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currency === 'KRW' ? '₩' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '¥'}
                </span>
                <Input
                  id="laborCostPerUnit"
                  type="number"
                  value={data.laborCostPerUnit}
                  onChange={(e) => updateData({ laborCostPerUnit: Number(e.target.value) })}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 물류비 & 기타 변동비 */}
      <Card>
        <CardHeader>
          <CardTitle>물류비 & 기타 변동비</CardTitle>
          <CardDescription>배송비, 포장비 등 단위당 변동비</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shippingCostPerUnit">배송비 단가</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currency === 'KRW' ? '₩' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '¥'}
                </span>
                <Input
                  id="shippingCostPerUnit"
                  type="number"
                  value={data.shippingCostPerUnit}
                  onChange={(e) => updateData({ shippingCostPerUnit: Number(e.target.value) })}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="otherVariableCostPerUnit">기타 변동비 단가</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currency === 'KRW' ? '₩' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '¥'}
                </span>
                <Input
                  id="otherVariableCostPerUnit"
                  type="number"
                  value={data.otherVariableCostPerUnit}
                  onChange={(e) => updateData({ otherVariableCostPerUnit: Number(e.target.value) })}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 미리보기 */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">예상 결과 미리보기</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(data.monthlySales * data.unitPrice)}
              </p>
              <p className="text-sm text-green-700">월 매출</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(totalVariableCost)}
              </p>
              <p className="text-sm text-green-700">단위당 원가</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(grossMarginPerUnit)}
              </p>
              <p className="text-sm text-green-700">단위당 마진</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">
                {(grossMarginRate * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-green-700">마진율</p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-white rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">원가 구조</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>원자재비:</span>
                <span>{formatCurrency(data.materialCostPerUnit)}</span>
              </div>
              <div className="flex justify-between">
                <span>인건비:</span>
                <span>{formatCurrency(data.laborCostPerUnit)}</span>
              </div>
              <div className="flex justify-between">
                <span>배송비:</span>
                <span>{formatCurrency(data.shippingCostPerUnit)}</span>
              </div>
              <div className="flex justify-between">
                <span>기타 변동비:</span>
                <span>{formatCurrency(data.otherVariableCostPerUnit)}</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2">
                <span>총 변동비:</span>
                <span>{formatCurrency(totalVariableCost)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 성장률 설정 */}
      <GrowthRateSettingsComponent
        settings={data.growthRateSettings}
        onSettingsChange={(settings) => updateData({ growthRateSettings: settings })}
        businessType="manufacturing"
      />
    </div>
  );
}
