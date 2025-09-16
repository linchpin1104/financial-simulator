'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SimulationResult, BusinessType } from '@/types';
import { analyzeHRCosts, Department } from '@/lib/analysis/costStructureAnalysis';
import { formatCurrency, formatPercent } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { Users, DollarSign, TrendingUp } from 'lucide-react';

interface HRCostAnalysisCardProps {
  result: SimulationResult;
  businessType: BusinessType;
  currency: string;
}

export default function HRCostAnalysisCard({ result, currency }: HRCostAnalysisCardProps) {
  const [departments, setDepartments] = useState<Department[]>([
    { name: '개발', headcount: 3, averageSalary: 7000000 },
    { name: '영업/마케팅', headcount: 2, averageSalary: 6000000 },
    { name: '운영/지원', headcount: 1, averageSalary: 5000000 },
    { name: '경영진', headcount: 1, averageSalary: 10000000 },
  ]);
  
  // const [editingDept, setEditingDept] = useState<string | null>(null);
  const [newDept, setNewDept] = useState<Department>({ name: '', headcount: 1, averageSalary: 5000000 });
  
  // 인건비 분석 수행
  const hrAnalysis = analyzeHRCosts(result.monthly, departments);
  
  // 직군별 비용 차트 데이터
  const departmentCostsData = hrAnalysis.departmentCosts.map(dept => ({
    name: dept.name,
    headcount: dept.headcount,
    averageSalary: dept.averageSalary,
    totalCost: dept.totalCost,
  }));
  
  // 직군별 비용 파이 차트 데이터
  const departmentPieData = hrAnalysis.departmentCosts.map(dept => ({
    name: dept.name,
    value: dept.totalCost,
    headcount: dept.headcount,
  }));
  
  // 성장 단계별 인력 계획 데이터
  const growthStages = [
    { stage: '현재', headcount: hrAnalysis.totalHeadcount, totalCost: hrAnalysis.totalHRCost },
    { stage: '6개월 후', headcount: Math.round(hrAnalysis.totalHeadcount * 1.2), totalCost: Math.round(hrAnalysis.totalHRCost * 1.2) },
    { stage: '1년 후', headcount: Math.round(hrAnalysis.totalHeadcount * 1.5), totalCost: Math.round(hrAnalysis.totalHRCost * 1.5) },
    { stage: '2년 후', headcount: Math.round(hrAnalysis.totalHeadcount * 2), totalCost: Math.round(hrAnalysis.totalHRCost * 2) },
  ];
  
  // 파이 차트 색상
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  const handleAddDepartment = () => {
    if (newDept.name.trim()) {
      setDepartments([...departments, { ...newDept, name: newDept.name.trim() }]);
      setNewDept({ name: '', headcount: 1, averageSalary: 5000000 });
    }
  };
  
  const handleUpdateDepartment = (index: number, field: keyof Department, value: string | number) => {
    const updated = [...departments];
    updated[index] = { ...updated[index], [field]: value };
    setDepartments(updated);
  };
  
  const handleRemoveDepartment = (index: number) => {
    setDepartments(departments.filter((_, i) => i !== index));
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          인건비 분석 및 인력 계획
        </CardTitle>
        <CardDescription>
          직군별 인건비 분석과 성장 단계별 인력 계획을 수립합니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 인건비 요약 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                총 인원수
              </h3>
              <div className="text-2xl font-bold">
                {hrAnalysis.totalHeadcount}명
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                총 인건비
              </h3>
              <div className="text-2xl font-bold">
                {formatCurrency(hrAnalysis.totalHRCost, currency)}
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                인당 매출
              </h3>
              <div className="text-2xl font-bold">
                {formatCurrency(hrAnalysis.revenuePerEmployee, currency)}
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">매출 대비 인건비</h3>
              <div className="text-2xl font-bold">
                {formatPercent(hrAnalysis.hrToRevenueRatio)}
              </div>
            </div>
          </div>
          
          {/* 직군 관리 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-4">직군별 인력 구성</h3>
            <div className="space-y-3">
              {departments.map((dept, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="flex-1 grid grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs">직군명</Label>
                      <Input
                        value={dept.name}
                        onChange={(e) => handleUpdateDepartment(index, 'name', e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">인원수</Label>
                      <Input
                        type="number"
                        value={dept.headcount}
                        onChange={(e) => handleUpdateDepartment(index, 'headcount', parseInt(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">평균 연봉</Label>
                      <Input
                        type="number"
                        value={dept.averageSalary}
                        onChange={(e) => handleUpdateDepartment(index, 'averageSalary', parseInt(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">총 비용</Label>
                      <div className="h-8 flex items-center text-sm font-medium">
                        {formatCurrency(dept.headcount * dept.averageSalary * 12, currency)}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveDepartment(index)}
                    disabled={departments.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {/* 새 직군 추가 */}
              <div className="flex items-center space-x-4 p-3 border-2 border-dashed rounded-lg">
                <div className="flex-1 grid grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs">직군명</Label>
                    <Input
                      placeholder="새 직군명"
                      value={newDept.name}
                      onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">인원수</Label>
                    <Input
                      type="number"
                      value={newDept.headcount}
                      onChange={(e) => setNewDept({ ...newDept, headcount: parseInt(e.target.value) || 0 })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">평균 연봉</Label>
                    <Input
                      type="number"
                      value={newDept.averageSalary}
                      onChange={(e) => setNewDept({ ...newDept, averageSalary: parseInt(e.target.value) || 0 })}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">총 비용</Label>
                    <div className="h-8 flex items-center text-sm font-medium">
                      {formatCurrency(newDept.headcount * newDept.averageSalary * 12, currency)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddDepartment}
                  disabled={!newDept.name.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* 차트 */}
          <Tabs defaultValue="department-costs">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="department-costs">직군별 비용</TabsTrigger>
              <TabsTrigger value="department-pie">비용 구성</TabsTrigger>
              <TabsTrigger value="growth-plan">성장 계획</TabsTrigger>
            </TabsList>
            
            <TabsContent value="department-costs" className="mt-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={departmentCostsData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis 
                      yAxisId="left"
                      orientation="left"
                      tickFormatter={(value) => 
                        new Intl.NumberFormat('ko-KR', {
                          notation: 'compact',
                          compactDisplay: 'short',
                        }).format(value)
                      }
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(value) => `${value}명`}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'totalCost') {
                          return [formatCurrency(value, currency), '총 비용'];
                        }
                        if (name === 'headcount') {
                          return [value, '인원수'];
                        }
                        return [formatCurrency(value, currency), '평균 연봉'];
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="totalCost" name="총 비용" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="headcount" name="인원수" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="department-pie" className="mt-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {departmentPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value, currency), '']}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="growth-plan" className="mt-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={growthStages}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis 
                      yAxisId="left"
                      orientation="left"
                      tickFormatter={(value) => 
                        new Intl.NumberFormat('ko-KR', {
                          notation: 'compact',
                          compactDisplay: 'short',
                        }).format(value)
                      }
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(value) => `${value}명`}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'totalCost') {
                          return [formatCurrency(value, currency), '총 인건비'];
                        }
                        return [value, '인원수'];
                      }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="totalCost" 
                      name="총 인건비" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="headcount" 
                      name="인원수" 
                      stroke="#82ca9d" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* 인력 계획 제안 */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium">인력 계획 제안</h3>
            <ul className="text-sm list-disc list-inside mt-2 space-y-1">
              <li>
                <span className="font-medium">현재 인원수: {hrAnalysis.totalHeadcount}명</span>
                {' - '}
                {hrAnalysis.totalHeadcount < 10 
                  ? '스타트업 단계로, 핵심 인력 확보에 집중하세요.' 
                  : '성장 단계로, 조직 체계화가 필요합니다.'}
              </li>
              <li>
                <span className="font-medium">인당 매출: {formatCurrency(hrAnalysis.revenuePerEmployee, currency)}</span>
                {' - '}
                {hrAnalysis.revenuePerEmployee > 100000000 
                  ? '양호한 생산성을 보이고 있습니다.' 
                  : '인력 효율성 개선이 필요합니다.'}
              </li>
              <li>
                <span className="font-medium">매출 대비 인건비: {formatPercent(hrAnalysis.hrToRevenueRatio)}</span>
                {' - '}
                {hrAnalysis.hrToRevenueRatio > 0.5 
                  ? '인건비 비율이 높습니다. 자동화나 아웃소싱을 고려하세요.' 
                  : '적절한 수준입니다.'}
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
