'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { SimulationResult, BusinessType } from '@/types';
import { exportSimulationToExcel, exportToPDF } from '@/lib/export/exportToExcel';

interface ExportButtonsProps {
  result: SimulationResult;
  businessType: BusinessType;
  companyName: string;
  currency: string;
}

export default function ExportButtons({ result, businessType, companyName, currency }: ExportButtonsProps) {
  const handleExcelExport = () => {
    try {
      exportSimulationToExcel(result, businessType, companyName, currency);
    } catch (error) {
      console.error('Excel export error:', error);
      alert('Excel 내보내기 중 오류가 발생했습니다.');
    }
  };

  const handlePDFExport = () => {
    try {
      exportToPDF(result, businessType, companyName);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('PDF 내보내기 중 오류가 발생했습니다.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>데이터 내보내기</CardTitle>
        <CardDescription>
          시뮬레이션 결과를 Excel 또는 PDF로 내보낼 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleExcelExport}
            className="flex items-center gap-2"
            variant="outline"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel로 내보내기
          </Button>
          
          <Button
            onClick={handlePDFExport}
            className="flex items-center gap-2"
            variant="outline"
          >
            <FileText className="h-4 w-4" />
            PDF로 내보내기
          </Button>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm text-gray-900 mb-2">내보내기 내용</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 요약 시트: 주요 지표 및 KPI</li>
            <li>• 월별 데이터: 12개월 상세 데이터</li>
            <li>• 차트 데이터: 차트 생성용 데이터</li>
            <li>• 비즈니스 유형별 맞춤 지표 포함</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
