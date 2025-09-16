'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { CostInputs, BusinessType } from '@/types';

interface CostInputFormProps {
  initialData?: Partial<CostInputs>;
  onChange: (data: CostInputs) => void;
  currency: string;
  businessType: BusinessType;
}

export default function CostInputForm({ initialData, onChange, currency, businessType }: CostInputFormProps) {
  const [data, setData] = useState<CostInputs>({
    marketingCost: 10000,
    personnelCost: 50000,
    otherFixedCosts: 15000,
    paymentFeeRate: 0.03,
    shippingCostPerUnit: 0,
    ...initialData,
  });

  useEffect(() => {
    onChange(data);
  }, [data, onChange]);

  const updateData = (updates: Partial<CostInputs>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

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

  const totalFixedCosts = data.marketingCost + data.personnelCost + data.otherFixedCosts;

  return (
    <div className="space-y-6">
      {/* 마케팅비 */}
      <Card>
        <CardHeader>
          <CardTitle>마케팅비</CardTitle>
          <CardDescription>월간 마케팅 및 광고 비용</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="marketingCost">월간 마케팅비</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {currency === 'KRW' ? '₩' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '¥'}
              </span>
              <Input
                id="marketingCost"
                type="number"
                value={data.marketingCost}
                onChange={(e) => updateData({ marketingCost: Number(e.target.value) })}
                className="pl-8"
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              월간 {formatCurrency(data.marketingCost)}의 마케팅 비용
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 인건비 */}
      <Card>
        <CardHeader>
          <CardTitle>인건비</CardTitle>
          <CardDescription>월간 인력 비용</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="personnelCost">월간 인건비</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {currency === 'KRW' ? '₩' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '¥'}
              </span>
              <Input
                id="personnelCost"
                type="number"
                value={data.personnelCost}
                onChange={(e) => updateData({ personnelCost: Number(e.target.value) })}
                className="pl-8"
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              월간 {formatCurrency(data.personnelCost)}의 인력 비용
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 기타 고정비 */}
      <Card>
        <CardHeader>
          <CardTitle>기타 고정비</CardTitle>
          <CardDescription>임대료, SaaS 구독, 기타 운영비</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="otherFixedCosts">월간 기타 고정비</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {currency === 'KRW' ? '₩' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '¥'}
              </span>
              <Input
                id="otherFixedCosts"
                type="number"
                value={data.otherFixedCosts}
                onChange={(e) => updateData({ otherFixedCosts: Number(e.target.value) })}
                className="pl-8"
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              월간 {formatCurrency(data.otherFixedCosts)}의 기타 고정비
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 결제 수수료 */}
      <Card>
        <CardHeader>
          <CardTitle>결제 수수료</CardTitle>
          <CardDescription>결제 처리 수수료율</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label>결제 수수료율</Label>
            <div className="mt-2">
              <Slider
                value={[data.paymentFeeRate * 100]}
                onValueChange={([value]) => updateData({ paymentFeeRate: value / 100 })}
                max={10}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>0%</span>
                <span className="font-medium">{formatPercent(data.paymentFeeRate)}</span>
                <span>10%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              매출의 {formatPercent(data.paymentFeeRate)}를 결제 수수료로 지불
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 배송비 (제조/유통 모드에서만) */}
      {(businessType === 'manufacturing' || businessType === 'hybrid') && (
        <Card>
          <CardHeader>
            <CardTitle>배송비</CardTitle>
            <CardDescription>단위당 배송 비용</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="shippingCostPerUnit">단위당 배송비</Label>
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
              <p className="text-sm text-gray-600 mt-1">
                단위당 {formatCurrency(data.shippingCostPerUnit)}의 배송 비용
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 비용 구조 미리보기 */}
      <Card className="bg-orange-50 border-orange-200">
        <CardHeader>
          <CardTitle className="text-orange-900">비용 구조 미리보기</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-orange-900">
                  {formatCurrency(data.marketingCost)}
                </p>
                <p className="text-sm text-orange-700">마케팅비</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-900">
                  {formatCurrency(data.personnelCost)}
                </p>
                <p className="text-sm text-orange-700">인건비</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-900">
                  {formatCurrency(data.otherFixedCosts)}
                </p>
                <p className="text-sm text-orange-700">기타 고정비</p>
              </div>
            </div>
            
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">고정비 구조</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>마케팅비:</span>
                  <span>{formatCurrency(data.marketingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>인건비:</span>
                  <span>{formatCurrency(data.personnelCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>기타 고정비:</span>
                  <span>{formatCurrency(data.otherFixedCosts)}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>총 고정비:</span>
                  <span>{formatCurrency(totalFixedCosts)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">변동비</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>결제 수수료율:</span>
                  <span>{formatPercent(data.paymentFeeRate)}</span>
                </div>
                {(businessType === 'manufacturing' || businessType === 'hybrid') && (
                  <div className="flex justify-between">
                    <span>배송비 (단위당):</span>
                    <span>{formatCurrency(data.shippingCostPerUnit)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
