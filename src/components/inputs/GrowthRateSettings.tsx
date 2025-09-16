'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { GrowthRateSettings, QuarterlyGrowthRate } from '@/types';

interface GrowthRateSettingsProps {
  settings: GrowthRateSettings;
  onSettingsChange: (settings: GrowthRateSettings) => void;
  businessType: 'saas' | 'manufacturing' | 'b2c-platform' | 'hybrid';
}

export default function GrowthRateSettingsComponent({
  settings,
  onSettingsChange,
  businessType,
}: GrowthRateSettingsProps) {
  const [editingRate, setEditingRate] = useState<QuarterlyGrowthRate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const getCurrentYear = () => new Date().getFullYear();
  const getCurrentQuarter = () => Math.ceil((new Date().getMonth() + 1) / 3);

  const createNewGrowthRate = () => {
    const currentYear = getCurrentYear();
    const currentQuarter = getCurrentQuarter();
    
    const newRate: QuarterlyGrowthRate = {
      quarter: currentQuarter,
      year: currentYear,
      growthRate: 0.1, // 기본 10% 성장
      description: '',
    };
    setEditingRate(newRate);
    setIsCreating(true);
  };

  const saveGrowthRate = () => {
    if (!editingRate) return;

    if (isCreating) {
      onSettingsChange({
        ...settings,
        quarterlyRates: [...settings.quarterlyRates, editingRate],
      });
    } else {
      onSettingsChange({
        ...settings,
        quarterlyRates: settings.quarterlyRates.map(rate => 
          rate.quarter === editingRate.quarter && rate.year === editingRate.year 
            ? editingRate 
            : rate
        ),
      });
    }
    
    setEditingRate(null);
    setIsCreating(false);
  };

  const deleteGrowthRate = (quarter: number, year: number) => {
    onSettingsChange({
      ...settings,
      quarterlyRates: settings.quarterlyRates.filter(
        rate => !(rate.quarter === quarter && rate.year === year)
      ),
    });
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatGrowthRate = (value: number) => {
    if (value > 0) return `+${formatPercent(value)}`;
    if (value < 0) return `-${formatPercent(Math.abs(value))}`;
    return '0%';
  };

  const getQuarterName = (quarter: number) => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    return quarters[quarter - 1];
  };


  const isDuplicateQuarter = (quarter: number, year: number) => {
    if (isCreating) {
      return settings.quarterlyRates.some(
        rate => rate.quarter === quarter && rate.year === year
      );
    }
    return false;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>분기별 성장률 설정</CardTitle>
        <CardDescription>
          3개월 분기별로 성장률을 미세조정하여 더 정확한 예측을 만들어보세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 적용 대상 설정 */}
        <div className="space-y-3">
          <Label>성장률 적용 대상</Label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.applyToRevenue}
                onChange={(e) => onSettingsChange({
                  ...settings,
                  applyToRevenue: e.target.checked,
                })}
                className="rounded"
              />
              <span className="text-sm">매출 (Revenue)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.applyToCustomers}
                onChange={(e) => onSettingsChange({
                  ...settings,
                  applyToCustomers: e.target.checked,
                })}
                className="rounded"
              />
              <span className="text-sm">고객 수 (Customers)</span>
            </label>
            {(businessType === 'b2c-platform' || businessType === 'hybrid') && (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.applyToOrders || false}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    applyToOrders: e.target.checked,
                  })}
                  className="rounded"
                />
                <span className="text-sm">주문 수 (Orders)</span>
              </label>
            )}
          </div>
        </div>

        {/* 분기별 성장률 목록 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>분기별 성장률</Label>
            <Button onClick={createNewGrowthRate} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              추가
            </Button>
          </div>
          
          {settings.quarterlyRates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>설정된 분기별 성장률이 없습니다.</p>
              <p className="text-sm">새로운 성장률을 추가해보세요.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {settings.quarterlyRates
                .sort((a, b) => a.year - b.year || a.quarter - b.quarter)
                .map((rate) => (
                  <div key={`${rate.year}-${rate.quarter}`} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {rate.year}년 {getQuarterName(rate.quarter)}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          rate.growthRate > 0 
                            ? 'bg-green-100 text-green-800' 
                            : rate.growthRate < 0 
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {formatGrowthRate(rate.growthRate)}
                        </span>
                      </div>
                      {rate.description && (
                        <p className="text-sm text-gray-600 mt-1">{rate.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingRate(rate)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteGrowthRate(rate.quarter, rate.year)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* 성장률 편집 모달 */}
        {editingRate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {isCreating ? '새 성장률 추가' : '성장률 편집'}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingRate(null);
                    setIsCreating(false);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quarter">분기</Label>
                    <select
                      id="quarter"
                      value={editingRate.quarter}
                      onChange={(e) => setEditingRate({
                        ...editingRate,
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
                      value={editingRate.year}
                      onChange={(e) => setEditingRate({
                        ...editingRate,
                        year: parseInt(e.target.value),
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="growth-rate">성장률</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="growth-rate"
                      type="number"
                      min="-1"
                      max="1"
                      step="0.01"
                      value={editingRate.growthRate}
                      onChange={(e) => setEditingRate({
                        ...editingRate,
                        growthRate: parseFloat(e.target.value) || 0,
                      })}
                      className="text-right"
                    />
                    <span className="text-sm text-gray-500 min-w-[60px]">
                      {formatGrowthRate(editingRate.growthRate)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    -1.0 (100% 감소) ~ 1.0 (100% 증가)
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">설명 (선택사항)</Label>
                  <Input
                    id="description"
                    value={editingRate.description || ''}
                    onChange={(e) => setEditingRate({
                      ...editingRate,
                      description: e.target.value,
                    })}
                    placeholder="예: 마케팅 캠페인, 신제품 출시 등"
                  />
                </div>

                {isDuplicateQuarter(editingRate.quarter, editingRate.year) && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      해당 분기의 성장률이 이미 설정되어 있습니다.
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingRate(null);
                      setIsCreating(false);
                    }}
                  >
                    취소
                  </Button>
                  <Button 
                    onClick={saveGrowthRate}
                    disabled={isDuplicateQuarter(editingRate.quarter, editingRate.year)}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    저장
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
