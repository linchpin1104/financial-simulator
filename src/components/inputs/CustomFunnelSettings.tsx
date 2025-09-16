'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { CustomFunnel, FunnelStep } from '@/types';

interface CustomFunnelSettingsProps {
  funnels: CustomFunnel[];
  onFunnelsChange: (funnels: CustomFunnel[]) => void;
  activeFunnelId?: string;
  onActiveFunnelChange: (funnelId: string | undefined) => void;
}

export default function CustomFunnelSettings({
  funnels,
  onFunnelsChange,
  activeFunnelId,
  onActiveFunnelChange,
}: CustomFunnelSettingsProps) {
  const [editingFunnel, setEditingFunnel] = useState<CustomFunnel | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const createNewFunnel = () => {
    const newFunnel: CustomFunnel = {
      id: `funnel_${Date.now()}`,
      name: '새 퍼널',
      description: '',
      steps: [
        {
          id: `step_${Date.now()}_1`,
          name: '방문자',
          description: '웹사이트 방문자',
          conversionRate: 1,
          order: 1,
        },
        {
          id: `step_${Date.now()}_2`,
          name: '가입자',
          description: '회원가입 완료',
          conversionRate: 0.05,
          order: 2,
        },
        {
          id: `step_${Date.now()}_3`,
          name: '유료고객',
          description: '결제 완료',
          conversionRate: 0.08,
          order: 3,
        },
      ],
      isActive: false,
    };
    setEditingFunnel(newFunnel);
    setIsCreating(true);
  };

  const saveFunnel = () => {
    if (!editingFunnel) return;

    if (isCreating) {
      onFunnelsChange([...funnels, editingFunnel]);
    } else {
      onFunnelsChange(funnels.map(f => f.id === editingFunnel.id ? editingFunnel : f));
    }
    
    setEditingFunnel(null);
    setIsCreating(false);
  };

  const deleteFunnel = (funnelId: string) => {
    onFunnelsChange(funnels.filter(f => f.id !== funnelId));
    if (activeFunnelId === funnelId) {
      onActiveFunnelChange(undefined);
    }
  };

  const addFunnelStep = () => {
    if (!editingFunnel) return;
    
    const newStep: FunnelStep = {
      id: `step_${Date.now()}`,
      name: '새 단계',
      description: '',
      conversionRate: 0.1,
      order: editingFunnel.steps.length + 1,
    };
    
    setEditingFunnel({
      ...editingFunnel,
      steps: [...editingFunnel.steps, newStep],
    });
  };

  const updateFunnelStep = (stepId: string, updates: Partial<FunnelStep>) => {
    if (!editingFunnel) return;
    
    setEditingFunnel({
      ...editingFunnel,
      steps: editingFunnel.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      ),
    });
  };

  const removeFunnelStep = (stepId: string) => {
    if (!editingFunnel) return;
    
    setEditingFunnel({
      ...editingFunnel,
      steps: editingFunnel.steps
        .filter(step => step.id !== stepId)
        .map((step, index) => ({ ...step, order: index + 1 })),
    });
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>맞춤형 퍼널 설정</CardTitle>
        <CardDescription>
          기본 전환율 대신 맞춤형 퍼널을 사용하여 더 정교한 전환 과정을 모델링할 수 있습니다.
          퍼널을 활성화하면 기본 전환율 대신 퍼널의 전환율이 사용됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 퍼널 목록 */}
        <div className="space-y-3">
          {funnels.map((funnel) => (
            <div key={funnel.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{funnel.name}</h4>
                  {activeFunnelId === funnel.id && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      활성
                    </span>
                  )}
                </div>
                {funnel.description && (
                  <p className="text-sm text-gray-600 mt-1">{funnel.description}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {funnel.steps.length}개 단계
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingFunnel(funnel)}
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onActiveFunnelChange(
                    activeFunnelId === funnel.id ? undefined : funnel.id
                  )}
                >
                  {activeFunnelId === funnel.id ? '비활성화' : '활성화'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteFunnel(funnel.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* 새 퍼널 생성 버튼 */}
        {funnels.length < 5 && (
          <Button onClick={createNewFunnel} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            새 퍼널 생성
          </Button>
        )}

        {/* 퍼널 편집 모달 */}
        {editingFunnel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {isCreating ? '새 퍼널 생성' : '퍼널 편집'}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingFunnel(null);
                    setIsCreating(false);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* 퍼널 기본 정보 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="funnel-name">퍼널 이름</Label>
                    <Input
                      id="funnel-name"
                      value={editingFunnel.name}
                      onChange={(e) => setEditingFunnel({
                        ...editingFunnel,
                        name: e.target.value,
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="funnel-description">설명 (선택사항)</Label>
                    <Input
                      id="funnel-description"
                      value={editingFunnel.description || ''}
                      onChange={(e) => setEditingFunnel({
                        ...editingFunnel,
                        description: e.target.value,
                      })}
                    />
                  </div>
                </div>

                {/* 퍼널 단계들 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>퍼널 단계</Label>
                    {editingFunnel.steps.length < 5 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addFunnelStep}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        단계 추가
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {editingFunnel.steps
                      .sort((a, b) => a.order - b.order)
                      .map((step) => (
                        <div key={step.id} className="p-3 border rounded-lg">
                          <div className="grid grid-cols-12 gap-3 items-end">
                            <div className="col-span-2">
                              <Label>단계 {step.order}</Label>
                              <Input
                                value={step.name}
                                onChange={(e) => updateFunnelStep(step.id, { name: e.target.value })}
                                placeholder="단계 이름"
                              />
                            </div>
                            <div className="col-span-4">
                              <Label>설명</Label>
                              <Input
                                value={step.description || ''}
                                onChange={(e) => updateFunnelStep(step.id, { description: e.target.value })}
                                placeholder="단계 설명"
                              />
                            </div>
                            <div className="col-span-3">
                              <Label>전환율</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max="1"
                                  step="0.01"
                                  value={step.conversionRate}
                                  onChange={(e) => updateFunnelStep(step.id, { 
                                    conversionRate: parseFloat(e.target.value) || 0 
                                  })}
                                  className="text-right"
                                />
                                <span className="text-sm text-gray-500">
                                  {formatPercent(step.conversionRate)}
                                </span>
                              </div>
                            </div>
                            <div className="col-span-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFunnelStep(step.id)}
                                disabled={editingFunnel.steps.length <= 2}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* 저장 버튼 */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingFunnel(null);
                      setIsCreating(false);
                    }}
                  >
                    취소
                  </Button>
                  <Button onClick={saveFunnel}>
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
