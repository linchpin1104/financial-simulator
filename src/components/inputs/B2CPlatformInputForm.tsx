'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { B2CPlatformInputs } from '@/types';
import GrowthRateSettingsComponent from './GrowthRateSettings';

interface B2CPlatformInputFormProps {
  initialData?: Partial<B2CPlatformInputs>;
  onChange: (data: B2CPlatformInputs) => void;
  currency: string;
}

export default function B2CPlatformInputForm({ initialData, onChange, currency }: B2CPlatformInputFormProps) {
  const [data, setData] = useState<B2CPlatformInputs>({
    monthlyVisitors: 50000,
    visitorToBuyerRate: 0.02,
    buyerToRepeatRate: 0.3,
    ordersPerBuyerPerMonth: 1.5,
    averageOrderValue: 80,
    refundRate: 0.05,
    takeRate: 0.08,
    fixedFeePerOrder: 2,
    adRevenuePerMonth: 5000,
    suppliers: {
      newSuppliersPerMonth: 50,
      activeSuppliers: 200,
      averageListingsPerSupplier: 10,
      averageRevenuePerSupplier: 500,
    },
    growthRateSettings: {
      quarterlyRates: [],
      applyToRevenue: true,
      applyToCustomers: true,
      applyToOrders: true,
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

  const updateData = (updates: Partial<B2CPlatformInputs>) => {
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

  // 계산된 값들
  const monthlyBuyers = Math.round(data.monthlyVisitors * data.visitorToBuyerRate);
  const monthlyOrders = Math.round(monthlyBuyers * data.ordersPerBuyerPerMonth);
  const monthlyGmv = monthlyOrders * data.averageOrderValue;
  const monthlyTakeRateRevenue = monthlyGmv * data.takeRate;
  const monthlyFixedFeeRevenue = monthlyOrders * data.fixedFeePerOrder;
  const monthlyPlatformRevenue = monthlyTakeRateRevenue + monthlyFixedFeeRevenue + data.adRevenuePerMonth;
  const monthlyRefunds = monthlyGmv * data.refundRate;

  return (
    <div className="space-y-6">
      {/* 수요(구매자) 여정 */}
      <Card>
        <CardHeader>
          <CardTitle>수요(구매자) 여정</CardTitle>
          <CardDescription>방문자 → 가입 → 구매 → 재구매 과정</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="monthlyVisitors">월간 방문자 수</Label>
            <Input
              id="monthlyVisitors"
              type="number"
              value={data.monthlyVisitors}
              onChange={(e) => updateData({ monthlyVisitors: Number(e.target.value) })}
              className="mt-1"
            />
            <p className="text-sm text-gray-600 mt-1">
              월간 {data.monthlyVisitors.toLocaleString()}명이 플랫폼을 방문합니다
            </p>
          </div>

          <div>
            <Label>방문자 → 구매자 전환율</Label>
            <div className="mt-2">
              <Slider
                value={[data.visitorToBuyerRate * 100]}
                onValueChange={([value]) => updateData({ visitorToBuyerRate: value / 100 })}
                max={10}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>0%</span>
                <span className="font-medium">{formatPercent(data.visitorToBuyerRate)}</span>
                <span>10%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              월간 {monthlyBuyers.toLocaleString()}명이 구매자로 전환됩니다
            </p>
          </div>

          <div>
            <Label>구매자 → 재구매자 전환율</Label>
            <div className="mt-2">
              <Slider
                value={[data.buyerToRepeatRate * 100]}
                onValueChange={([value]) => updateData({ buyerToRepeatRate: value / 100 })}
                max={80}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>0%</span>
                <span className="font-medium">{formatPercent(data.buyerToRepeatRate)}</span>
                <span>80%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              구매자의 {formatPercent(data.buyerToRepeatRate)}가 재구매합니다
            </p>
          </div>

          <div>
            <Label htmlFor="ordersPerBuyerPerMonth">구매자당 월 주문수 (AOB)</Label>
            <Input
              id="ordersPerBuyerPerMonth"
              type="number"
              step="0.1"
              value={data.ordersPerBuyerPerMonth}
              onChange={(e) => updateData({ ordersPerBuyerPerMonth: Number(e.target.value) })}
              className="mt-1"
            />
            <p className="text-sm text-gray-600 mt-1">
              구매자 1명당 월간 {data.ordersPerBuyerPerMonth}회 주문
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 주문/거래 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>주문/거래 정보</CardTitle>
          <CardDescription>주문 금액과 환불/취소 정보</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="averageOrderValue">평균 주문금액 (AOV)</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {currency === 'KRW' ? '₩' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '¥'}
              </span>
              <Input
                id="averageOrderValue"
                type="number"
                value={data.averageOrderValue}
                onChange={(e) => updateData({ averageOrderValue: Number(e.target.value) })}
                className="pl-8"
              />
            </div>
          </div>

          <div>
            <Label>환불/취소율</Label>
            <div className="mt-2">
              <Slider
                value={[data.refundRate * 100]}
                onValueChange={([value]) => updateData({ refundRate: value / 100 })}
                max={20}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>0%</span>
                <span className="font-medium">{formatPercent(data.refundRate)}</span>
                <span>20%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              주문의 {formatPercent(data.refundRate)}가 환불/취소됩니다
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 공급(판매자) 여정 */}
      <Card>
        <CardHeader>
          <CardTitle>공급(판매자) 여정</CardTitle>
          <CardDescription>신규 판매자, 활성 판매자, 공급능력</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="newSuppliersPerMonth">월간 신규 판매자</Label>
              <Input
                id="newSuppliersPerMonth"
                type="number"
                value={data.suppliers.newSuppliersPerMonth}
                onChange={(e) => updateData({ 
                  suppliers: { 
                    ...data.suppliers, 
                    newSuppliersPerMonth: Number(e.target.value) 
                  } 
                })}
                className="mt-1"
              />
              <p className="text-sm text-gray-600 mt-1">
                월간 {data.suppliers.newSuppliersPerMonth}명의 신규 판매자가 가입합니다
              </p>
            </div>
            <div>
              <Label htmlFor="activeSuppliers">활성 판매자 수</Label>
              <Input
                id="activeSuppliers"
                type="number"
                value={data.suppliers.activeSuppliers}
                onChange={(e) => updateData({ 
                  suppliers: { 
                    ...data.suppliers, 
                    activeSuppliers: Number(e.target.value) 
                  } 
                })}
                className="mt-1"
              />
              <p className="text-sm text-gray-600 mt-1">
                현재 {data.suppliers.activeSuppliers}명의 활성 판매자가 있습니다
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="averageListingsPerSupplier">판매자당 평균 상품 수</Label>
              <Input
                id="averageListingsPerSupplier"
                type="number"
                value={data.suppliers.averageListingsPerSupplier}
                onChange={(e) => updateData({ 
                  suppliers: { 
                    ...data.suppliers, 
                    averageListingsPerSupplier: Number(e.target.value) 
                  } 
                })}
                className="mt-1"
              />
              <p className="text-sm text-gray-600 mt-1">
                판매자 1명당 평균 {data.suppliers.averageListingsPerSupplier}개의 상품을 등록합니다
              </p>
            </div>
            <div>
              <Label htmlFor="averageRevenuePerSupplier">판매자당 평균 월 매출</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currency === 'KRW' ? '₩' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '¥'}
                </span>
                <Input
                  id="averageRevenuePerSupplier"
                  type="number"
                  value={data.suppliers.averageRevenuePerSupplier}
                  onChange={(e) => updateData({ 
                    suppliers: { 
                      ...data.suppliers, 
                      averageRevenuePerSupplier: Number(e.target.value) 
                    } 
                  })}
                  className="pl-8"
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">
                판매자 1명당 월간 {formatCurrency(data.suppliers.averageRevenuePerSupplier)}의 매출을 발생시킵니다
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 수익화 모델 */}
      <Card>
        <CardHeader>
          <CardTitle>수익화 모델</CardTitle>
          <CardDescription>Take Rate, 수수료, 광고 매출</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Take Rate (수수료율)</Label>
            <div className="mt-2">
              <Slider
                value={[data.takeRate * 100]}
                onValueChange={([value]) => updateData({ takeRate: value / 100 })}
                max={20}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>0%</span>
                <span className="font-medium">{formatPercent(data.takeRate)}</span>
                <span>20%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              GMV의 {formatPercent(data.takeRate)}를 수수료로 받습니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fixedFeePerOrder">주문당 고정 수수료</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currency === 'KRW' ? '₩' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '¥'}
                </span>
                <Input
                  id="fixedFeePerOrder"
                  type="number"
                  value={data.fixedFeePerOrder}
                  onChange={(e) => updateData({ fixedFeePerOrder: Number(e.target.value) })}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="adRevenuePerMonth">월간 광고 매출</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currency === 'KRW' ? '₩' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '¥'}
                </span>
                <Input
                  id="adRevenuePerMonth"
                  type="number"
                  value={data.adRevenuePerMonth}
                  onChange={(e) => updateData({ adRevenuePerMonth: Number(e.target.value) })}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 미리보기 */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">예상 결과 미리보기</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
            <div>
              <p className="text-2xl font-bold text-purple-900">
                {formatCurrency(monthlyGmv)}
              </p>
              <p className="text-sm text-purple-700">월 GMV</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900">
                {monthlyOrders.toLocaleString()}
              </p>
              <p className="text-sm text-purple-700">월 주문수</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900">
                {formatCurrency(monthlyPlatformRevenue)}
              </p>
              <p className="text-sm text-purple-700">플랫폼 매출</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-900">
                {formatCurrency(monthlyRefunds)}
              </p>
              <p className="text-sm text-purple-700">환불 손실</p>
            </div>
          </div>
          
          <div className="p-4 bg-white rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">수익 구조</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Take Rate 수익:</span>
                <span>{formatCurrency(monthlyTakeRateRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span>고정 수수료:</span>
                <span>{formatCurrency(monthlyFixedFeeRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span>광고 매출:</span>
                <span>{formatCurrency(data.adRevenuePerMonth)}</span>
              </div>
              <div className="flex justify-between font-medium border-t pt-2">
                <span>총 플랫폼 매출:</span>
                <span>{formatCurrency(monthlyPlatformRevenue)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 성장률 설정 */}
      <GrowthRateSettingsComponent
        settings={data.growthRateSettings}
        onSettingsChange={(settings) => updateData({ growthRateSettings: settings })}
        businessType="b2c-platform"
      />
    </div>
  );
}
