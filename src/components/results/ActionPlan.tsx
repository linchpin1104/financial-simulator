'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SimulationResult, BusinessType } from '@/types';
// import { formatCurrency, formatPercent } from '@/lib/utils';
import { analyzeBreakEven } from '@/lib/analysis/breakEvenAnalysis';
import { analyzeCostStructure } from '@/lib/analysis/costStructureAnalysis';
// import { compareWithBenchmarks } from '@/lib/analysis/industryBenchmarks';
import { 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  Users,
  Target,
  ArrowRight,
  Lightbulb
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ActionPlanProps {
  result: SimulationResult;
  businessType: BusinessType;
  currency: string;
  costInputs: any;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'revenue' | 'cost' | 'growth' | 'efficiency';
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  timeline: string;
  expectedBenefit: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export default function ActionPlan({ result, costInputs }: ActionPlanProps) {
  
  // 분석 결과 가져오기
  const breakEvenAnalysis = analyzeBreakEven(result.monthly);
  const costStructure = analyzeCostStructure(result.monthly, costInputs);
  
  // 액션 아이템 생성
  const generateActionItems = (): ActionItem[] => {
    const actions: ActionItem[] = [];
    
    // 손익분기점 관련 액션
    if (breakEvenAnalysis.breakEvenMonth > 12) {
      actions.push({
        id: 'bep-1',
        title: '손익분기점 단축',
        description: '현재 손익분기점까지 12개월 이상 소요됩니다. 비용 구조 개선이 필요합니다.',
        priority: 'high',
        category: 'cost',
        impact: 'high',
        effort: 'medium',
        timeline: '3-6개월',
        expectedBenefit: '손익분기점 6개월 단축',
        status: 'pending'
      });
    }
    
    // 수익성 관련 액션
    if (result.summary.netProfit < 0) {
      actions.push({
        id: 'profit-1',
        title: '수익성 개선',
        description: '현재 손실 상태입니다. 비용 절감 또는 매출 증대가 필요합니다.',
        priority: 'high',
        category: 'revenue',
        impact: 'high',
        effort: 'high',
        timeline: '1-3개월',
        expectedBenefit: '월간 흑자 전환',
        status: 'pending'
      });
    }
    
    // LTV/CAC 비율 관련 액션
    const ltvCacRatio = result.summary.ltv && result.summary.cac ? result.summary.ltv / result.summary.cac : 0;
    if (ltvCacRatio > 0 && ltvCacRatio < 2) {
      actions.push({
        id: 'ltv-1',
        title: '단위 경제성 개선',
        description: 'LTV/CAC 비율이 낮습니다. 고객 생애 가치 향상 또는 고객 획득 비용 절감이 필요합니다.',
        priority: 'high',
        category: 'efficiency',
        impact: 'high',
        effort: 'medium',
        timeline: '3-6개월',
        expectedBenefit: 'LTV/CAC 비율 3:1 달성',
        status: 'pending'
      });
    }
    
    // 비용 구조 관련 액션
    if (costStructure.fixedCostRatio > 0.8) {
      actions.push({
        id: 'cost-1',
        title: '비용 구조 유연화',
        description: '고정비 비율이 높습니다. 변동비 중심의 유연한 비용 구조로 전환하세요.',
        priority: 'medium',
        category: 'cost',
        impact: 'medium',
        effort: 'high',
        timeline: '6-12개월',
        expectedBenefit: '고정비 비율 20% 감소',
        status: 'pending'
      });
    }
    
    
    // 성장 관련 액션
    if (result.summary.totalRevenue > 0) {
      actions.push({
        id: 'growth-1',
        title: '성장 가속화',
        description: '현재 성장 모멘텀을 활용하여 확장 투자를 검토하세요.',
        priority: 'low',
        category: 'growth',
        impact: 'high',
        effort: 'high',
        timeline: '6-12개월',
        expectedBenefit: '매출 2배 성장',
        status: 'pending'
      });
    }
    
    return actions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const actionItems = generateActionItems();
  const highPriorityActions = actionItems.filter(action => action.priority === 'high');
  const otherActions = actionItems.filter(action => action.priority !== 'high');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue': return <DollarSign className="h-4 w-4" />;
      case 'cost': return <TrendingUp className="h-4 w-4" />;
      case 'growth': return <Users className="h-4 w-4" />;
      case 'efficiency': return <Target className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-6 w-6" />
          액션 플랜
        </CardTitle>
        <CardDescription>
          분석 결과를 바탕으로 한 구체적인 개선 방안과 실행 계획입니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 우선순위 높은 액션 */}
          {highPriorityActions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                우선순위 높은 액션
              </h3>
              <div className="space-y-4">
                {highPriorityActions.map((action) => (
                  <div key={action.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(action.category)}
                          <h4 className="font-semibold">{action.title}</h4>
                          <Badge className={getPriorityColor(action.priority)}>
                            {action.priority === 'high' ? '높음' : action.priority === 'medium' ? '보통' : '낮음'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">예상 효과:</span>
                            <p className={getImpactColor(action.impact)}>{action.expectedBenefit}</p>
                          </div>
                          <div>
                            <span className="font-medium">소요 시간:</span>
                            <p>{action.timeline}</p>
                          </div>
                          <div>
                            <span className="font-medium">난이도:</span>
                            <p>{action.effort === 'high' ? '높음' : action.effort === 'medium' ? '보통' : '낮음'}</p>
                          </div>
                          <div>
                            <span className="font-medium">영역:</span>
                            <p className="capitalize">{action.category}</p>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="ml-4">
                        실행하기
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 기타 액션 */}
          {otherActions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                추가 액션
              </h3>
              <div className="space-y-4">
                {otherActions.map((action) => (
                  <div key={action.id} className="border border-gray-200 bg-white rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(action.category)}
                          <h4 className="font-semibold">{action.title}</h4>
                          <Badge className={getPriorityColor(action.priority)}>
                            {action.priority === 'high' ? '높음' : action.priority === 'medium' ? '보통' : '낮음'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">예상 효과:</span>
                            <p className={getImpactColor(action.impact)}>{action.expectedBenefit}</p>
                          </div>
                          <div>
                            <span className="font-medium">소요 시간:</span>
                            <p>{action.timeline}</p>
                          </div>
                          <div>
                            <span className="font-medium">난이도:</span>
                            <p>{action.effort === 'high' ? '높음' : action.effort === 'medium' ? '보통' : '낮음'}</p>
                          </div>
                          <div>
                            <span className="font-medium">영역:</span>
                            <p className="capitalize">{action.category}</p>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="ml-4">
                        실행하기
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {actionItems.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>현재 특별한 액션이 필요하지 않습니다.</p>
              <p className="text-sm">비즈니스가 양호한 상태를 유지하고 있습니다.</p>
            </div>
          )}

          {/* 액션 요약 */}
          {actionItems.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">📊 액션 요약</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">총 액션 수:</span>
                  <p className="text-lg font-bold">{actionItems.length}개</p>
                </div>
                <div>
                  <span className="font-medium">우선순위 높음:</span>
                  <p className="text-lg font-bold text-red-600">{highPriorityActions.length}개</p>
                </div>
                <div>
                  <span className="font-medium">예상 완료:</span>
                  <p className="text-lg font-bold">{actionItems.filter(a => a.timeline.includes('1-3')).length}개 (1-3개월)</p>
                </div>
                <div>
                  <span className="font-medium">영역별 분포:</span>
                  <p className="text-sm">
                    수익성: {actionItems.filter(a => a.category === 'revenue').length}개, 
                    비용: {actionItems.filter(a => a.category === 'cost').length}개
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
