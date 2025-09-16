import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { SimulationResult, BusinessType } from '@/types';

export function exportSimulationToExcel(
  result: SimulationResult,
  businessType: BusinessType,
  companyName: string,
  currency: string
) {
  const workbook = XLSX.utils.book_new();

  // 1. 요약 시트
  const summaryData = [
    ['지표', '값'],
    ['회사명', companyName],
    ['사업 유형', getBusinessTypeName(businessType)],
    ['통화', currency],
    ['', ''],
    ['총 매출', result.summary.totalRevenue],
    ['총 고객수', result.summary.totalCustomers],
    ['총 비용', result.summary.totalCosts],
    ['순이익', result.summary.netProfit],
    ['평균 마진율', `${(result.summary.averageProfitMargin * 100).toFixed(1)}%`],
  ];

  // SaaS 전용 지표
  if (businessType === 'saas') {
    summaryData.push(
      ['MRR', result.summary.mrr || 0],
      ['ARR', result.summary.arr || 0],
      ['LTV', result.summary.ltv || 0],
      ['CAC', result.summary.cac || 0]
    );
  }

  // B2C 플랫폼 전용 지표
  if (businessType === 'b2c-platform') {
    summaryData.push(
      ['총 GMV', result.summary.totalGmv || 0],
      ['총 주문수', result.summary.totalOrders || 0],
      ['평균 Take Rate', `${((result.summary.averageTakeRate || 0) * 100).toFixed(1)}%`],
      ['총 환불', result.summary.totalRefunds || 0]
    );
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, '요약');

  // 2. 월별 데이터 시트
  const monthlyData = Object.entries(result.monthly).map(([month, data]) => ({
    월: month,
    매출: data.revenue,
    고객수: data.customers,
    총비용: data.totalCosts,
    순이익: data.netProfit,
    마진율: `${(data.profitMargin * 100).toFixed(1)}%`,
    ...(businessType === 'saas' && {
      방문자: data.visitors || 0,
      가입자: data.signups || 0,
      신규유료고객: data.paidCustomers || 0,
      MRR: data.mrr || 0,
    }),
    ...(businessType === 'manufacturing' && {
      판매량: data.sales || 0,
      생산량: data.production || 0,
      매출원가: data.costOfGoodsSold || 0,
      총마진: data.grossMargin || 0,
    }),
    ...(businessType === 'b2c-platform' && {
      주문수: data.orders || 0,
      GMV: data.gmv || 0,
      플랫폼매출: data.platformRevenue || 0,
    }),
  }));

  const monthlySheet = XLSX.utils.json_to_sheet(monthlyData);
  XLSX.utils.book_append_sheet(workbook, monthlySheet, '월별데이터');

  // 3. 차트 데이터 시트 (차트 생성용)
  const chartData = Object.entries(result.monthly).map(([month, data]) => ({
    월: month,
    매출: data.revenue,
    순이익: data.netProfit,
    ...(businessType === 'saas' && {
      MRR: data.mrr || 0,
    }),
    ...(businessType === 'b2c-platform' && {
      GMV: data.gmv || 0,
      플랫폼매출: data.platformRevenue || 0,
    }),
  }));

  const chartSheet = XLSX.utils.json_to_sheet(chartData);
  XLSX.utils.book_append_sheet(workbook, chartSheet, '차트데이터');

  // 파일 저장
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(data, `${companyName}_매출모델링_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportToPDF(result: SimulationResult, businessType: BusinessType, companyName: string) {
  // PDF 내보내기는 별도 라이브러리가 필요하므로 여기서는 간단한 텍스트 형태로 제공
  const content = generatePDFContent(result, businessType, companyName);
  const blob = new Blob([content], { type: 'text/plain' });
  saveAs(blob, `${companyName}_매출모델링_${new Date().toISOString().split('T')[0]}.txt`);
}

function getBusinessTypeName(businessType: BusinessType): string {
  const names: Record<BusinessType, string> = {
    'saas': 'SaaS/플랫폼',
    'manufacturing': '제조/유통',
    'b2c-platform': 'B2C 플랫폼',
    'hybrid': '복합형',
  };
  return names[businessType];
}

function generatePDFContent(result: SimulationResult, businessType: BusinessType, companyName: string): string {
  const { summary } = result;
  
  return `
${companyName} 매출 모델링 보고서
생성일: ${new Date().toLocaleDateString('ko-KR')}
사업 유형: ${getBusinessTypeName(businessType)}

=== 요약 ===
총 매출: ${summary.totalRevenue.toLocaleString()}
총 고객수: ${summary.totalCustomers.toLocaleString()}
총 비용: ${summary.totalCosts.toLocaleString()}
순이익: ${summary.netProfit.toLocaleString()}
평균 마진율: ${(summary.averageProfitMargin * 100).toFixed(1)}%

${businessType === 'saas' ? `
=== SaaS 지표 ===
MRR: ${(summary.mrr || 0).toLocaleString()}
ARR: ${(summary.arr || 0).toLocaleString()}
LTV: ${(summary.ltv || 0).toLocaleString()}
CAC: ${(summary.cac || 0).toLocaleString()}
` : ''}

${businessType === 'b2c-platform' ? `
=== B2C 플랫폼 지표 ===
총 GMV: ${(summary.totalGmv || 0).toLocaleString()}
총 주문수: ${(summary.totalOrders || 0).toLocaleString()}
평균 Take Rate: ${((summary.averageTakeRate || 0) * 100).toFixed(1)}%
총 환불: ${(summary.totalRefunds || 0).toLocaleString()}
` : ''}

=== 월별 데이터 ===
${Object.entries(result.monthly).map(([month, data]) => 
  `${month}: 매출 ${data.revenue.toLocaleString()}, 순이익 ${data.netProfit.toLocaleString()}`
).join('\n')}
`;
}
