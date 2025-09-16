'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SimulationResult, BusinessType } from '@/types';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { analyzeBreakEven } from '@/lib/analysis/breakEvenAnalysis';
import { analyzeCostStructure } from '@/lib/analysis/costStructureAnalysis';
// import { compareWithBenchmarks } from '@/lib/analysis/industryBenchmarks';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  DollarSign,
  Calendar,
  Users,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface ExecutiveSummaryProps {
  result: SimulationResult;
  businessType: BusinessType;
  currency: string;
  costInputs: any;
  saasInputs?: any;
  manufacturingInputs?: any;
  b2cPlatformInputs?: any;
}

interface SmartInsight {
  type: 'warning' | 'opportunity' | 'success' | 'info';
  title: string;
  description: string;
  actionItems: string[];
  priority: 'high' | 'medium' | 'low';
  impact?: string;
}

export default function ExecutiveSummary({ 
  result, 
  currency, 
  costInputs
}: ExecutiveSummaryProps) {
  
  // 핵심 지표 계산
  const breakEvenAnalysis = analyzeBreakEven(result.monthly);
  const costStructure = analyzeCostStructure(result.monthly, costInputs);
  
  // 핵심 KPI
  const keyMetrics = {
    totalRevenue: result.summary.totalRevenue,
    netProfit: result.summary.netProfit,
    profitMargin: result.summary.averageProfitMargin,
    breakEvenMonth: breakEvenAnalysis.breakEvenMonth,
    ltv: result.summary.ltv || 0,
    cac: result.summary.cac || 0,
    ltvCacRatio: result.summary.ltv && result.summary.cac ? result.summary.ltv / result.summary.cac : 0,
  };

  // 스마트 인사이트 생성
  const generateInsights = (): SmartInsight[] => {
    const insights: SmartInsight[] = [];
    
    // 손익분기점 관련 인사이트
    if (breakEvenAnalysis.breakEvenMonth > 0) {
      if (breakEvenAnalysis.breakEvenMonth <= 6) {
        insights.push({
          type: 'success',
          title: '빠른 손익분기점 달성',
          description: `${breakEvenAnalysis.breakEvenMonth}개월 내에 손익분기점에 도달할 것으로 예상됩니다.`,
          actionItems: ['현재 성장 전략 유지', '확장 투자 검토'],
          priority: 'high',
          impact: '긍정적'
        });
      } else if (breakEvenAnalysis.breakEvenMonth <= 12) {
        insights.push({
          type: 'info',
          title: '적정 손익분기점',
          description: `${breakEvenAnalysis.breakEvenMonth}개월 내에 손익분기점에 도달할 것으로 예상됩니다.`,
          actionItems: ['성장률 개선 방안 검토', '비용 최적화'],
          priority: 'medium',
          impact: '보통'
        });
      } else {
        insights.push({
          type: 'warning',
          title: '손익분기점 지연',
          description: `손익분기점까지 ${breakEvenAnalysis.breakEvenMonth}개월이 소요될 것으로 예상됩니다.`,
          actionItems: ['비용 구조 재검토', '매출 증대 전략 수립', '자금 조달 계획 수립'],
          priority: 'high',
          impact: '부정적'
        });
      }
    } else {
      insights.push({
        type: 'warning',
        title: '손익분기점 미도달',
        description: '예측 기간 내에 손익분기점에 도달하지 못할 것으로 예상됩니다.',
        actionItems: ['비즈니스 모델 재검토', '비용 대폭 절감', '매출 증대 전략 수립'],
        priority: 'high',
        impact: '부정적'
      });
    }

    // 수익성 관련 인사이트
    if (keyMetrics.profitMargin > 0.2) {
      insights.push({
        type: 'success',
        title: '우수한 수익성',
        description: `순이익률이 ${formatPercent(keyMetrics.profitMargin)}로 매우 양호합니다.`,
        actionItems: ['확장 투자 검토', '신제품 개발'],
        priority: 'medium',
        impact: '긍정적'
      });
    } else if (keyMetrics.profitMargin < 0) {
      insights.push({
        type: 'warning',
        title: '수익성 부족',
        description: `현재 순이익률이 ${formatPercent(keyMetrics.profitMargin)}로 손실 상태입니다.`,
        actionItems: ['비용 절감', '가격 정책 재검토', '매출 증대 전략'],
        priority: 'high',
        impact: '부정적'
      });
    }

    // LTV/CAC 비율 관련 인사이트
    if (keyMetrics.ltvCacRatio > 3) {
      insights.push({
        type: 'success',
        title: '우수한 단위 경제성',
        description: `LTV/CAC 비율이 ${keyMetrics.ltvCacRatio.toFixed(1)}로 매우 양호합니다.`,
        actionItems: ['마케팅 투자 확대', '고객 획득 가속화'],
        priority: 'medium',
        impact: '긍정적'
      });
    } else if (keyMetrics.ltvCacRatio > 0 && keyMetrics.ltvCacRatio < 1) {
      insights.push({
        type: 'warning',
        title: '단위 경제성 부족',
        description: `LTV/CAC 비율이 ${keyMetrics.ltvCacRatio.toFixed(1)}로 개선이 필요합니다.`,
        actionItems: ['LTV 향상 방안', 'CAC 최적화', '가격 정책 재검토'],
        priority: 'high',
        impact: '부정적'
      });
    }

    // 비용 구조 관련 인사이트
    if (costStructure.fixedCostRatio > 0.8) {
      insights.push({
        type: 'warning',
        title: '고정비 비율 과다',
        description: `고정비 비율이 ${formatPercent(costStructure.fixedCostRatio)}로 시장 변화에 취약할 수 있습니다.`,
        actionItems: ['변동비 중심 구조 전환', '아웃소싱 검토', '유연한 인력 구조'],
        priority: 'high',
        impact: '부정적'
      });
    }


    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const insights = generateInsights();
  const highPriorityInsights = insights.filter(insight => insight.priority === 'high');
  const otherInsights = insights.filter(insight => insight.priority !== 'high');

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'opportunity': return <TrendingUp className="h-5 w-5 text-blue-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'opportunity': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* 핵심 지표 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            핵심 지표
          </CardTitle>
          <CardDescription>
            비즈니스 성과의 핵심 지표를 한눈에 확인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">총 매출</p>
                <p className="text-2xl font-bold">{formatCurrency(keyMetrics.totalRevenue, currency)}</p>
              </div>
            </div>
            
            <div className={`flex items-center space-x-3 p-4 border rounded-lg ${keyMetrics.netProfit >= 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <TrendingUp className={`h-8 w-8 ${keyMetrics.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              <div>
                <p className="text-sm font-medium text-gray-500">순이익</p>
                <p className={`text-2xl font-bold ${keyMetrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(keyMetrics.netProfit, currency)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">손익분기점</p>
                <p className="text-2xl font-bold">
                  {breakEvenAnalysis.breakEvenMonth > 0 ? `${breakEvenAnalysis.breakEvenMonth}개월` : '미도달'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 border rounded-lg">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">LTV/CAC</p>
                <p className="text-2xl font-bold">
                  {keyMetrics.ltvCacRatio > 0 ? keyMetrics.ltvCacRatio.toFixed(1) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 스마트 인사이트 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            스마트 인사이트
          </CardTitle>
          <CardDescription>
            AI가 분석한 핵심 인사이트와 개선 방안을 확인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 고우선순위 인사이트 */}
            {highPriorityInsights.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-3">🚨 우선순위 높음</h4>
                <div className="space-y-3">
                  {highPriorityInsights.map((insight, index) => (
                    <Alert key={index} className={getInsightColor(insight.type)}>
                      <div className="flex items-start space-x-3">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <h5 className="font-medium">{insight.title}</h5>
                          <AlertDescription className="mt-1">
                            {insight.description}
                          </AlertDescription>
                          {insight.actionItems.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium mb-2">권장 조치:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {insight.actionItems.map((item, itemIndex) => (
                                  <li key={itemIndex} className="text-sm">{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <Badge variant={insight.priority === 'high' ? 'destructive' : 'secondary'}>
                          {insight.priority === 'high' ? '높음' : insight.priority === 'medium' ? '보통' : '낮음'}
                        </Badge>
                      </div>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* 기타 인사이트 */}
            {otherInsights.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-3">💡 추가 인사이트</h4>
                <div className="space-y-3">
                  {otherInsights.map((insight, index) => (
                    <Alert key={index} className={getInsightColor(insight.type)}>
                      <div className="flex items-start space-x-3">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <h5 className="font-medium">{insight.title}</h5>
                          <AlertDescription className="mt-1">
                            {insight.description}
                          </AlertDescription>
                          {insight.actionItems.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium mb-2">권장 조치:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {insight.actionItems.map((item, itemIndex) => (
                                  <li key={itemIndex} className="text-sm">{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary">
                          {insight.priority === 'high' ? '높음' : insight.priority === 'medium' ? '보통' : '낮음'}
                        </Badge>
                      </div>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {insights.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>현재 특별한 인사이트가 없습니다.</p>
                <p className="text-sm">더 많은 데이터를 입력하면 상세한 분석을 제공할 수 있습니다.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
