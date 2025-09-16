'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit3, Save, X, Settings } from 'lucide-react';
import { QuarterlyDetailedSettings, QuarterlyMetrics } from '@/types';

interface QuarterlyDetailedSettingsProps {
  settings: QuarterlyDetailedSettings;
  onSettingsChange: (settings: QuarterlyDetailedSettings) => void;
  businessType: 'saas' | 'manufacturing' | 'b2c-platform' | 'hybrid';
}

export default function QuarterlyDetailedSettingsComponent({
  settings,
  onSettingsChange,
  businessType,
}: QuarterlyDetailedSettingsProps) {
  const [editingMetrics, setEditingMetrics] = useState<QuarterlyMetrics | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const getCurrentYear = () => new Date().getFullYear();
  const getCurrentQuarter = () => Math.ceil((new Date().getMonth() + 1) / 3);

  const createNewQuarterlyMetrics = () => {
    const currentYear = getCurrentYear();
    const currentQuarter = getCurrentQuarter();
    
    const newMetrics: QuarterlyMetrics = {
      quarter: currentQuarter,
      year: currentYear,
      conversionRates: {},
      pricing: {},
      costs: {
        marketingCost: 0,
        personnelCost: 0,
        otherFixedCosts: 0,
      },
      metrics: {},
      description: '',
    };
    setEditingMetrics(newMetrics);
    setIsCreating(true);
  };

  const saveQuarterlyMetrics = () => {
    if (!editingMetrics) return;

    if (isCreating) {
      onSettingsChange({
        ...settings,
        quarterlyMetrics: [...settings.quarterlyMetrics, editingMetrics],
      });
    } else {
      onSettingsChange({
        ...settings,
        quarterlyMetrics: settings.quarterlyMetrics.map(metrics => 
          metrics.quarter === editingMetrics.quarter && metrics.year === editingMetrics.year 
            ? editingMetrics 
            : metrics
        ),
      });
    }
    
    setEditingMetrics(null);
    setIsCreating(false);
  };

  const deleteQuarterlyMetrics = (quarter: number, year: number) => {
    onSettingsChange({
      ...settings,
      quarterlyMetrics: settings.quarterlyMetrics.filter(
        metrics => !(metrics.quarter === quarter && metrics.year === year)
      ),
    });
  };

  const getQuarterName = (quarter: number) => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    return quarters[quarter - 1];
  };

  const isDuplicateQuarter = (quarter: number, year: number) => {
    if (isCreating) {
      return settings.quarterlyMetrics.some(
        metrics => metrics.quarter === quarter && metrics.year === year
      );
    }
    return false;
  };

  const getBusinessTypeFields = () => {
    switch (businessType) {
      case 'saas':
        return {
          conversionRates: ['visitorToSignup', 'signupToPaid'],
          pricing: ['monthlyPrice', 'annualPrice'],
          metrics: ['monthlyVisitors', 'churnRate'],
        };
      case 'manufacturing':
        return {
          conversionRates: [],
          pricing: ['unitPrice'],
          metrics: ['monthlySales'],
          costs: ['materialCostPerUnit', 'laborCostPerUnit', 'shippingCostPerUnit'],
        };
      case 'b2c-platform':
        return {
          conversionRates: ['visitorToBuyer', 'buyerToRepeat'],
          pricing: ['averageOrderValue'],
          metrics: ['monthlyVisitors', 'refundRate', 'takeRate'],
        };
      default:
        return {
          conversionRates: ['visitorToSignup', 'signupToPaid', 'visitorToBuyer', 'buyerToRepeat'],
          pricing: ['monthlyPrice', 'annualPrice', 'unitPrice', 'averageOrderValue'],
          metrics: ['monthlyVisitors', 'monthlySales', 'churnRate', 'refundRate', 'takeRate'],
        };
    }
  };

  const fields = getBusinessTypeFields();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              분기별 세부 지표 설정
            </CardTitle>
            <CardDescription>
              각 분기별로 전환율, 가격, 비용, 기타 지표를 세부적으로 설정하여 더 정확한 시뮬레이션을 만들어보세요.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.useDetailedSettings}
                onChange={(e) => onSettingsChange({
                  ...settings,
                  useDetailedSettings: e.target.checked,
                })}
                className="rounded"
              />
              <span className="text-sm font-medium">세부 설정 사용</span>
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!settings.useDetailedSettings ? (
          <div className="text-center py-8 text-gray-500">
            <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>분기별 세부 설정을 사용하려면 위의 &quot;세부 설정 사용&quot;을 체크하세요.</p>
            <p className="text-sm mt-2">이 기능을 사용하면 각 분기별로 전환율, 가격, 비용 등을 개별적으로 설정할 수 있습니다.</p>
          </div>
        ) : (
          <>
            {/* 분기별 지표 목록 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>분기별 세부 지표</Label>
                <Button onClick={createNewQuarterlyMetrics} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  추가
                </Button>
              </div>
              
              {settings.quarterlyMetrics.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>설정된 분기별 지표가 없습니다.</p>
                  <p className="text-sm">새로운 분기별 지표를 추가해보세요.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {settings.quarterlyMetrics
                    .sort((a, b) => a.year - b.year || a.quarter - b.quarter)
                    .map((metrics) => (
                      <div key={`${metrics.year}-${metrics.quarter}`} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">
                              {metrics.year}년 {getQuarterName(metrics.quarter)}
                            </h4>
                            {metrics.description && (
                              <p className="text-sm text-gray-600 mt-1">{metrics.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingMetrics(metrics)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteQuarterlyMetrics(metrics.quarter, metrics.year)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* 지표 미리보기 */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {Object.entries(metrics.costs).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600">{key}:</span>
                              <span className="font-medium">{value.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* 분기별 지표 편집 모달 */}
            {editingMetrics && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {isCreating ? '새 분기별 지표 추가' : '분기별 지표 편집'}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingMetrics(null);
                        setIsCreating(false);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {/* 기본 정보 */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="quarter">분기</Label>
                        <select
                          id="quarter"
                          value={editingMetrics.quarter}
                          onChange={(e) => setEditingMetrics({
                            ...editingMetrics,
                            quarter: parseInt(e.target.value),
                          })}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value={1}>Q1 (1-3월)</option>
                          <option value={2}>Q2 (4-6월)</option>
                          <option value={3}>Q3 (7-9월)</option>
                          <option value={4}>Q4 (10-12월)</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="year">연도</Label>
                        <Input
                          id="year"
                          type="number"
                          min="2020"
                          max="2030"
                          value={editingMetrics.year}
                          onChange={(e) => setEditingMetrics({
                            ...editingMetrics,
                            year: parseInt(e.target.value),
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">설명 (선택사항)</Label>
                        <Input
                          id="description"
                          value={editingMetrics.description || ''}
                          onChange={(e) => setEditingMetrics({
                            ...editingMetrics,
                            description: e.target.value,
                          })}
                          placeholder="예: 마케팅 캠페인, 신제품 출시 등"
                        />
                      </div>
                    </div>

                    {/* 전환율 설정 */}
                    {fields.conversionRates.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">전환율 설정</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {fields.conversionRates.map((field) => (
                            <div key={field}>
                              <Label htmlFor={`conversion-${field}`}>
                                {field === 'visitorToSignup' && '방문자 → 가입'}
                                {field === 'signupToPaid' && '가입 → 유료'}
                                {field === 'visitorToBuyer' && '방문자 → 구매자'}
                                {field === 'buyerToRepeat' && '구매자 → 재구매'}
                              </Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  id={`conversion-${field}`}
                                  type="number"
                                  min="0"
                                  max="1"
                                  step="0.01"
                                  value={editingMetrics.conversionRates[field as keyof typeof editingMetrics.conversionRates] || 0}
                                  onChange={(e) => setEditingMetrics({
                                    ...editingMetrics,
                                    conversionRates: {
                                      ...editingMetrics.conversionRates,
                                      [field]: parseFloat(e.target.value) || 0,
                                    },
                                  })}
                                  className="text-right"
                                />
                                <span className="text-sm text-gray-500 min-w-[60px]">
                                  {((editingMetrics.conversionRates[field as keyof typeof editingMetrics.conversionRates] || 0) * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 가격 설정 */}
                    {fields.pricing.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">가격 설정</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {fields.pricing.map((field) => (
                            <div key={field}>
                              <Label htmlFor={`pricing-${field}`}>
                                {field === 'monthlyPrice' && '월간 가격'}
                                {field === 'annualPrice' && '연간 가격'}
                                {field === 'unitPrice' && '단위 가격'}
                                {field === 'averageOrderValue' && '평균 주문 금액'}
                              </Label>
                              <Input
                                id={`pricing-${field}`}
                                type="number"
                                min="0"
                                step="0.01"
                                value={editingMetrics.pricing[field as keyof typeof editingMetrics.pricing] || 0}
                                onChange={(e) => setEditingMetrics({
                                  ...editingMetrics,
                                  pricing: {
                                    ...editingMetrics.pricing,
                                    [field]: parseFloat(e.target.value) || 0,
                                  },
                                })}
                                className="text-right"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 비용 설정 */}
                    <div>
                      <h4 className="font-medium mb-3">비용 설정</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="marketing-cost">마케팅 비용</Label>
                          <Input
                            id="marketing-cost"
                            type="number"
                            min="0"
                            value={editingMetrics.costs.marketingCost}
                            onChange={(e) => setEditingMetrics({
                              ...editingMetrics,
                              costs: {
                                ...editingMetrics.costs,
                                marketingCost: parseFloat(e.target.value) || 0,
                              },
                            })}
                            className="text-right"
                          />
                        </div>
                        <div>
                          <Label htmlFor="personnel-cost">인력 비용</Label>
                          <Input
                            id="personnel-cost"
                            type="number"
                            min="0"
                            value={editingMetrics.costs.personnelCost}
                            onChange={(e) => setEditingMetrics({
                              ...editingMetrics,
                              costs: {
                                ...editingMetrics.costs,
                                personnelCost: parseFloat(e.target.value) || 0,
                              },
                            })}
                            className="text-right"
                          />
                        </div>
                        <div>
                          <Label htmlFor="other-fixed-cost">기타 고정비</Label>
                          <Input
                            id="other-fixed-cost"
                            type="number"
                            min="0"
                            value={editingMetrics.costs.otherFixedCosts}
                            onChange={(e) => setEditingMetrics({
                              ...editingMetrics,
                              costs: {
                                ...editingMetrics.costs,
                                otherFixedCosts: parseFloat(e.target.value) || 0,
                              },
                            })}
                            className="text-right"
                          />
                        </div>
                        {fields.costs?.map((field) => (
                          <div key={field}>
                            <Label htmlFor={`cost-${field}`}>
                              {field === 'materialCostPerUnit' && '재료비 (단위당)'}
                              {field === 'laborCostPerUnit' && '인건비 (단위당)'}
                              {field === 'shippingCostPerUnit' && '배송비 (단위당)'}
                            </Label>
                            <Input
                              id={`cost-${field}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={editingMetrics.costs[field as keyof typeof editingMetrics.costs] || 0}
                              onChange={(e) => setEditingMetrics({
                                ...editingMetrics,
                                costs: {
                                  ...editingMetrics.costs,
                                  [field]: parseFloat(e.target.value) || 0,
                                },
                              })}
                              className="text-right"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 기타 지표 설정 */}
                    {fields.metrics.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">기타 지표</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {fields.metrics.map((field) => (
                            <div key={field}>
                              <Label htmlFor={`metrics-${field}`}>
                                {field === 'monthlyVisitors' && '월간 방문자'}
                                {field === 'monthlySales' && '월간 판매량'}
                                {field === 'churnRate' && '이탈률'}
                                {field === 'refundRate' && '환불률'}
                                {field === 'takeRate' && '수수료율'}
                              </Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  id={`metrics-${field}`}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={editingMetrics.metrics[field as keyof typeof editingMetrics.metrics] || 0}
                                  onChange={(e) => setEditingMetrics({
                                    ...editingMetrics,
                                    metrics: {
                                      ...editingMetrics.metrics,
                                      [field]: parseFloat(e.target.value) || 0,
                                    },
                                  })}
                                  className="text-right"
                                />
                                {(field === 'churnRate' || field === 'refundRate' || field === 'takeRate') && (
                                  <span className="text-sm text-gray-500 min-w-[60px]">
                                    {((editingMetrics.metrics[field as keyof typeof editingMetrics.metrics] || 0) * 100).toFixed(1)}%
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {isDuplicateQuarter(editingMetrics.quarter, editingMetrics.year) && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">
                          해당 분기의 지표가 이미 설정되어 있습니다.
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingMetrics(null);
                          setIsCreating(false);
                        }}
                      >
                        취소
                      </Button>
                      <Button 
                        onClick={saveQuarterlyMetrics}
                        disabled={isDuplicateQuarter(editingMetrics.quarter, editingMetrics.year)}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        저장
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
