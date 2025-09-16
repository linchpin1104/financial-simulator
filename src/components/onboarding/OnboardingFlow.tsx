'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingData, BusinessType, Currency } from '@/types';
import { useAppStore } from '@/store/useAppStore';

const businessTypes = [
  {
    id: 'saas' as BusinessType,
    name: '플랫폼/서비스 중심',
    description: 'SaaS, 앱 서비스 등',
    icon: '💻',
  },
  {
    id: 'manufacturing' as BusinessType,
    name: '제조/유통 중심',
    description: '공장, 쇼핑몰 등',
    icon: '🏭',
  },
  {
    id: 'b2c-platform' as BusinessType,
    name: 'B2C 플랫폼',
    description: '거래/마켓플레이스',
    icon: '🛒',
  },
  {
    id: 'hybrid' as BusinessType,
    name: '복합형',
    description: '둘 다',
    icon: '🔄',
  },
];

const currencies: { value: Currency; label: string; symbol: string }[] = [
  { value: 'KRW', label: '한국 원 (₩)', symbol: '₩' },
  { value: 'USD', label: '미국 달러 ($)', symbol: '$' },
  { value: 'EUR', label: '유로 (€)', symbol: '€' },
  { value: 'JPY', label: '일본 엔 (¥)', symbol: '¥' },
];

export default function OnboardingFlow() {
  const router = useRouter();
  const { setOnboarding, completeOnboarding, setBusinessType } = useAppStore();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    currency: 'KRW',
  });

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // 온보딩 완료
      if (formData.companyName && formData.startMonth && formData.businessType) {
        setOnboarding(formData as OnboardingData);
        setBusinessType(formData.businessType);
        completeOnboarding();
        router.push('/dashboard');
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const updateFormData = (updates: Partial<OnboardingData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.companyName && formData.startMonth;
      case 2:
        return formData.businessType;
      case 3:
        return true; // 선택사항
      case 4:
        return true; // 미리보기
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900">
            매출 모델링 시작하기
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            스타트업 대표가 자신의 사업 흐름을 직관적으로 시뮬레이션할 수 있는 계산기
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 진행 표시 */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber <= step
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {stepNumber}
              </div>
            ))}
          </div>

          {/* Step 1: 기본 정보 */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">기본 정보 입력</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">회사명</Label>
                  <Input
                    id="companyName"
                    placeholder="회사명을 입력하세요"
                    value={formData.companyName || ''}
                    onChange={(e) => updateFormData({ companyName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="startMonth">시작 월</Label>
                  <Input
                    id="startMonth"
                    type="month"
                    value={formData.startMonth || ''}
                    onChange={(e) => updateFormData({ startMonth: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">통화</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value: Currency) => updateFormData({ currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: 사업 유형 선택 */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">사업 유형 선택</h3>
              <p className="text-gray-600">어떤 유형의 사업을 운영하고 계신가요?</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businessTypes.map((type) => (
                  <Card
                    key={type.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.businessType === type.id
                        ? 'ring-2 ring-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => updateFormData({ businessType: type.id })}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-4xl mb-2">{type.icon}</div>
                      <h4 className="font-semibold">{type.name}</h4>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: 현재 상황 (선택사항) */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">현재 상황 (선택사항)</h3>
              <p className="text-gray-600">현재 매출이나 고객 수가 있다면 입력해주세요.</p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentRevenue">현재 월 매출</Label>
                  <Input
                    id="currentRevenue"
                    type="number"
                    placeholder="0"
                    value={formData.currentRevenue || ''}
                    onChange={(e) => updateFormData({ currentRevenue: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="currentCustomers">현재 고객 수</Label>
                  <Input
                    id="currentCustomers"
                    type="number"
                    placeholder="0"
                    value={formData.currentCustomers || ''}
                    onChange={(e) => updateFormData({ currentCustomers: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="mainCosts">주요 월 비용</Label>
                  <Input
                    id="mainCosts"
                    type="number"
                    placeholder="0"
                    value={formData.mainCosts || ''}
                    onChange={(e) => updateFormData({ mainCosts: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: 미리보기 */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">설정 미리보기</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><strong>회사명:</strong> {formData.companyName}</p>
                <p><strong>시작 월:</strong> {formData.startMonth}</p>
                <p><strong>통화:</strong> {currencies.find(c => c.value === formData.currency)?.label}</p>
                <p><strong>사업 유형:</strong> {businessTypes.find(t => t.id === formData.businessType)?.name}</p>
                {formData.currentRevenue && <p><strong>현재 월 매출:</strong> {formData.currentRevenue.toLocaleString()}</p>}
                {formData.currentCustomers && <p><strong>현재 고객 수:</strong> {formData.currentCustomers.toLocaleString()}</p>}
              </div>
              <p className="text-sm text-gray-600">
                이제 {businessTypes.find(t => t.id === formData.businessType)?.name} 모드로 맞춤화된 입력 화면을 제공해드립니다.
              </p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
            >
              이전
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              {step === 4 ? '시작하기' : '다음'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
