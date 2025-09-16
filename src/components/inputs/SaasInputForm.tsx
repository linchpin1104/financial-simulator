'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { SaasInputs, ChannelInfo } from '@/types';
// import CustomFunnelSettings from './CustomFunnelSettings';
// import GrowthRateSettingsComponent from './GrowthRateSettings';

interface SaasInputFormProps {
  initialData?: Partial<SaasInputs>;
  onChange: (data: SaasInputs) => void;
  currency: string;
}

export default function SaasInputForm({ initialData, onChange, currency }: SaasInputFormProps) {
  const [data, setData] = useState<SaasInputs>({
    monthlyVisitors: 10000,
    channels: [
      { name: '자연 검색', percentage: 0.4, costPerVisitor: 0 },
      { name: '광고', percentage: 0.4, costPerVisitor: 2 },
      { name: '추천', percentage: 0.2, costPerVisitor: 0 },
    ],
    visitorToSignupRate: 0.05,
    signupToPaidRate: 0.08,
    monthlyChurnRate: 0.03,
    monthlyPrice: 25,
    annualPrice: 250,
    annualDiscountRate: 0.17,
    customFunnels: [],
    activeFunnelId: undefined,
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

  const updateData = (updates: Partial<SaasInputs>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const addChannel = () => {
    const newChannel: ChannelInfo = {
      name: `채널 ${data.channels.length + 1}`,
      percentage: 0,
      costPerVisitor: 0,
    };
    setData(prev => ({
      ...prev,
      channels: [...prev.channels, newChannel],
    }));
  };

  const removeChannel = (index: number) => {
    if (data.channels.length > 1) {
      setData(prev => ({
        ...prev,
        channels: prev.channels.filter((_, i) => i !== index),
      }));
    }
  };

  const updateChannel = (index: number, updates: Partial<ChannelInfo>) => {
    setData(prev => ({
      ...prev,
      channels: prev.channels.map((channel, i) => 
        i === index ? { ...channel, ...updates } : channel
      ),
    }));
  };

  const normalizeChannelPercentages = () => {
    const totalPercentage = data.channels.reduce((sum, channel) => sum + channel.percentage, 0);
    if (totalPercentage > 0) {
      setData(prev => ({
        ...prev,
        channels: prev.channels.map(channel => ({
          ...channel,
          percentage: channel.percentage / totalPercentage,
        })),
      }));
    }
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

  return (
    <div className="space-y-6">
      {/* 고객 유입 */}
      <Card>
        <CardHeader>
          <CardTitle>고객 유입</CardTitle>
          <CardDescription>월간 방문자 수와 채널 정보</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              월간 {data.monthlyVisitors.toLocaleString()}명이 웹사이트를 방문합니다
            </p>
          </div>

          {/* 채널 비중 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>채널 비중</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addChannel}
                className="flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                채널 추가
              </Button>
            </div>
            
            <div className="space-y-3">
              {data.channels.map((channel, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <Input
                      placeholder="채널명"
                      value={channel.name}
                      onChange={(e) => updateChannel(index, { name: e.target.value })}
                      className="mb-2"
                    />
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Label className="text-xs">비중</Label>
                        <Slider
                          value={[channel.percentage * 100]}
                          onValueChange={([value]) => updateChannel(index, { percentage: value / 100 })}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0%</span>
                          <span className="font-medium">{formatPercent(channel.percentage)}</span>
                          <span>100%</span>
                        </div>
                      </div>
                      <div className="w-24">
                        <Label className="text-xs">방문자당 비용</Label>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">
                            {currency === 'KRW' ? '₩' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '¥'}
                          </span>
                          <Input
                            type="number"
                            value={channel.costPerVisitor || 0}
                            onChange={(e) => updateChannel(index, { costPerVisitor: Number(e.target.value) })}
                            className="pl-6 text-xs"
                          />
                        </div>
                      </div>
                      {data.channels.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeChannel(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">총 비중</span>
                <span className="text-sm font-bold">
                  {formatPercent(data.channels.reduce((sum, channel) => sum + channel.percentage, 0))}
                </span>
              </div>
              {data.channels.reduce((sum, channel) => sum + channel.percentage, 0) !== 1 && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={normalizeChannelPercentages}
                  className="w-full"
                >
                  비중 정규화 (100%로 맞추기)
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 기본 전환율 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 전환율 설정</CardTitle>
          <CardDescription>방문자에서 유료 고객까지의 기본 전환율을 설정하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>방문자 → 회원 가입율</Label>
              <div className="mt-2">
                <Slider
                  value={[data.visitorToSignupRate * 100]}
                  onValueChange={([value]) => updateData({ visitorToSignupRate: value / 100 })}
                  max={20}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>0%</span>
                  <span className="font-medium">{formatPercent(data.visitorToSignupRate)}</span>
                  <span>20%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                월간 {Math.round(data.monthlyVisitors * data.visitorToSignupRate).toLocaleString()}명이 회원가입합니다
              </p>
            </div>

            <div>
              <Label>회원 → 유료 고객 전환율</Label>
              <div className="mt-2">
                <Slider
                  value={[data.signupToPaidRate * 100]}
                  onValueChange={([value]) => updateData({ signupToPaidRate: value / 100 })}
                  max={50}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>0%</span>
                  <span className="font-medium">{formatPercent(data.signupToPaidRate)}</span>
                  <span>50%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                월간 {Math.round(data.monthlyVisitors * data.visitorToSignupRate * data.signupToPaidRate).toLocaleString()}명이 유료 고객이 됩니다
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 고객 유지율 */}
      <Card>
        <CardHeader>
          <CardTitle>고객 유지율</CardTitle>
          <CardDescription>월간 고객 이탈률</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label>월간 이탈률</Label>
            <div className="mt-2">
              <Slider
                value={[data.monthlyChurnRate * 100]}
                onValueChange={([value]) => updateData({ monthlyChurnRate: value / 100 })}
                max={20}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>0%</span>
                <span className="font-medium">{formatPercent(data.monthlyChurnRate)}</span>
                <span>20%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              매월 {formatPercent(data.monthlyChurnRate)}의 고객이 이탈합니다
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 가격 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>가격 설정</CardTitle>
          <CardDescription>월간 및 연간 구독 가격</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="monthlyPrice">월간 가격</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currency === 'KRW' ? '₩' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '¥'}
                </span>
                <Input
                  id="monthlyPrice"
                  type="number"
                  value={data.monthlyPrice}
                  onChange={(e) => updateData({ monthlyPrice: Number(e.target.value) })}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="annualPrice">연간 가격</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {currency === 'KRW' ? '₩' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '¥'}
                </span>
                <Input
                  id="annualPrice"
                  type="number"
                  value={data.annualPrice}
                  onChange={(e) => updateData({ annualPrice: Number(e.target.value) })}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          
          <div>
            <Label>연간 할인율</Label>
            <div className="mt-2">
              <Slider
                value={[data.annualDiscountRate * 100]}
                onValueChange={([value]) => updateData({ annualDiscountRate: value / 100 })}
                max={50}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>0%</span>
                <span className="font-medium">{formatPercent(data.annualDiscountRate)}</span>
                <span>50%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              연간 구독 시 {formatPercent(data.annualDiscountRate)} 할인
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 미리보기 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">예상 결과 미리보기</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-900">
                {Math.round(data.monthlyVisitors * data.visitorToSignupRate * data.signupToPaidRate).toLocaleString()}
              </p>
              <p className="text-sm text-blue-700">월 신규 유료 고객</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(data.monthlyPrice)}
              </p>
              <p className="text-sm text-blue-700">월간 가격</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(data.annualPrice)}
              </p>
              <p className="text-sm text-blue-700">연간 가격</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">
                {formatPercent(1 - data.monthlyChurnRate)}
              </p>
              <p className="text-sm text-blue-700">월간 유지율</p>
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}
