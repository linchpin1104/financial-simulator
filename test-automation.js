// 자동화된 테스트 스크립트
// 이 스크립트는 Puppeteer를 사용하여 웹 애플리케이션을 자동으로 테스트합니다.

// const puppeteer = require('puppeteer');

// 테스트 데이터
const testCases = {
  saas: {
    companyName: 'TestSaaS Corp',
    startMonth: '2024-01',
    currency: 'KRW',
    businessType: 'saas',
    monthlyVisitors: 10000,
    visitorToSignupRate: 0.05,
    signupToPaidRate: 0.20,
    monthlyChurnRate: 0.03,
    monthlyPrice: 50000,
    annualPrice: 500000,
    annualDiscountRate: 0.10,
    marketingCost: 2000000,
    personnelCost: 5000000,
    otherFixedCosts: 1000000,
    paymentFeeRate: 0.03,
    expectedResults: {
      revenue: 8750000,
      netProfit: 487500,
      ltv: 1666667,
      cac: 20000,
      ltvCacRatio: 83.33
    }
  },
  b2c: {
    companyName: 'TestB2C Platform',
    startMonth: '2024-01',
    currency: 'KRW',
    businessType: 'b2c-platform',
    monthlyVisitors: 50000,
    visitorToBuyerRate: 0.02,
    buyerToRepeatRate: 0.25,
    ordersPerBuyerPerMonth: 2,
    averageOrderValue: 30000,
    refundRate: 0.05,
    takeRate: 0.10,
    fixedFeePerOrder: 1000,
    adRevenuePerMonth: 500000,
    marketingCost: 3000000,
    personnelCost: 8000000,
    otherFixedCosts: 2000000,
    paymentFeeRate: 0.03,
    expectedResults: {
      revenue: 8200000,
      netProfit: -5046000,
      ltv: 120000,
      cac: 3000,
      ltvCacRatio: 40
    }
  },
  manufacturing: {
    companyName: 'TestManufacturing',
    startMonth: '2024-01',
    currency: 'KRW',
    businessType: 'manufacturing',
    monthlySales: 1000,
    unitPrice: 100000,
    materialCostPerUnit: 30000,
    laborCostPerUnit: 20000,
    shippingCostPerUnit: 5000,
    otherVariableCostPerUnit: 10000,
    productionCapacity: 1500,
    marketingCost: 1000000,
    personnelCost: 3000000,
    otherFixedCosts: 1500000,
    paymentFeeRate: 0.03,
    expectedResults: {
      revenue: 100000000,
      netProfit: 26500000,
      ltv: 420000000,
      cac: 1000,
      ltvCacRatio: 420000
    }
  }
};

async function runTest(browser, testCase) {
  const page = await browser.newPage();
  
  try {
    console.log(`\n🧪 ${testCase.businessType.toUpperCase()} 테스트 시작...`);
    
    // 대시보드 페이지로 이동
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForSelector('[data-testid="onboarding-form"]', { timeout: 10000 });
    
    // 온보딩 데이터 입력
    await page.type('[data-testid="company-name"]', testCase.companyName);
    await page.select('[data-testid="start-month"]', testCase.startMonth);
    await page.select('[data-testid="currency"]', testCase.currency);
    await page.click(`[data-testid="business-type-${testCase.businessType}"]`);
    
    // 온보딩 완료
    await page.click('[data-testid="onboarding-submit"]');
    await page.waitForSelector('[data-testid="simulation-form"]', { timeout: 10000 });
    
    // 비즈니스 타입별 입력 데이터 입력
    if (testCase.businessType === 'saas') {
      await page.type('[data-testid="monthly-visitors"]', testCase.monthlyVisitors.toString());
      await page.type('[data-testid="visitor-to-signup-rate"]', (testCase.visitorToSignupRate * 100).toString());
      await page.type('[data-testid="signup-to-paid-rate"]', (testCase.signupToPaidRate * 100).toString());
      await page.type('[data-testid="monthly-churn-rate"]', (testCase.monthlyChurnRate * 100).toString());
      await page.type('[data-testid="monthly-price"]', testCase.monthlyPrice.toString());
      await page.type('[data-testid="annual-price"]', testCase.annualPrice.toString());
      await page.type('[data-testid="annual-discount-rate"]', (testCase.annualDiscountRate * 100).toString());
    } else if (testCase.businessType === 'b2c-platform') {
      await page.type('[data-testid="monthly-visitors"]', testCase.monthlyVisitors.toString());
      await page.type('[data-testid="visitor-to-buyer-rate"]', (testCase.visitorToBuyerRate * 100).toString());
      await page.type('[data-testid="buyer-to-repeat-rate"]', (testCase.buyerToRepeatRate * 100).toString());
      await page.type('[data-testid="orders-per-buyer-per-month"]', testCase.ordersPerBuyerPerMonth.toString());
      await page.type('[data-testid="average-order-value"]', testCase.averageOrderValue.toString());
      await page.type('[data-testid="refund-rate"]', (testCase.refundRate * 100).toString());
      await page.type('[data-testid="take-rate"]', (testCase.takeRate * 100).toString());
      await page.type('[data-testid="fixed-fee-per-order"]', testCase.fixedFeePerOrder.toString());
      await page.type('[data-testid="ad-revenue-per-month"]', testCase.adRevenuePerMonth.toString());
    } else if (testCase.businessType === 'manufacturing') {
      await page.type('[data-testid="monthly-sales"]', testCase.monthlySales.toString());
      await page.type('[data-testid="unit-price"]', testCase.unitPrice.toString());
      await page.type('[data-testid="material-cost-per-unit"]', testCase.materialCostPerUnit.toString());
      await page.type('[data-testid="labor-cost-per-unit"]', testCase.laborCostPerUnit.toString());
      await page.type('[data-testid="shipping-cost-per-unit"]', testCase.shippingCostPerUnit.toString());
      await page.type('[data-testid="other-variable-cost-per-unit"]', testCase.otherVariableCostPerUnit.toString());
      await page.type('[data-testid="production-capacity"]', testCase.productionCapacity.toString());
    }
    
    // 비용 데이터 입력
    await page.type('[data-testid="marketing-cost"]', testCase.marketingCost.toString());
    await page.type('[data-testid="personnel-cost"]', testCase.personnelCost.toString());
    await page.type('[data-testid="other-fixed-costs"]', testCase.otherFixedCosts.toString());
    await page.type('[data-testid="payment-fee-rate"]', (testCase.paymentFeeRate * 100).toString());
    
    // 시뮬레이션 실행
    await page.click('[data-testid="run-simulation"]');
    await page.waitForSelector('[data-testid="simulation-results"]', { timeout: 15000 });
    
    // 결과 검증
    const results = await page.evaluate(() => {
      const revenueElement = document.querySelector('[data-testid="total-revenue"]');
      const netProfitElement = document.querySelector('[data-testid="net-profit"]');
      const ltvElement = document.querySelector('[data-testid="ltv"]');
      const cacElement = document.querySelector('[data-testid="cac"]');
      
      return {
        revenue: revenueElement ? parseFloat(revenueElement.textContent.replace(/[^\d.-]/g, '')) : 0,
        netProfit: netProfitElement ? parseFloat(netProfitElement.textContent.replace(/[^\d.-]/g, '')) : 0,
        ltv: ltvElement ? parseFloat(ltvElement.textContent.replace(/[^\d.-]/g, '')) : 0,
        cac: cacElement ? parseFloat(cacElement.textContent.replace(/[^\d.-]/g, '')) : 0,
      };
    });
    
    // LTV/CAC 비율 계산
    results.ltvCacRatio = results.cac > 0 ? results.ltv / results.cac : 0;
    
    // 결과 검증
    const tolerance = 0.01; // 1% 허용 오차
    const checks = [
      { name: 'Revenue', expected: testCase.expectedResults.revenue, actual: results.revenue },
      { name: 'Net Profit', expected: testCase.expectedResults.netProfit, actual: results.netProfit },
      { name: 'LTV', expected: testCase.expectedResults.ltv, actual: results.ltv },
      { name: 'CAC', expected: testCase.expectedResults.cac, actual: results.cac },
      { name: 'LTV/CAC Ratio', expected: testCase.expectedResults.ltvCacRatio, actual: results.ltvCacRatio },
    ];
    
    console.log('\n📊 결과 검증:');
    let allPassed = true;
    
    checks.forEach(check => {
      const difference = Math.abs(check.expected - check.actual);
      const percentageDiff = (difference / Math.abs(check.expected)) * 100;
      const passed = percentageDiff <= (tolerance * 100);
      
      console.log(`${passed ? '✅' : '❌'} ${check.name}:`);
      console.log(`   예상: ${check.expected.toLocaleString()}`);
      console.log(`   실제: ${check.actual.toLocaleString()}`);
      console.log(`   차이: ${percentageDiff.toFixed(2)}%`);
      
      if (!passed) allPassed = false;
    });
    
    if (allPassed) {
      console.log(`\n🎉 ${testCase.businessType.toUpperCase()} 테스트 통과!`);
    } else {
      console.log(`\n⚠️  ${testCase.businessType.toUpperCase()} 테스트 실패!`);
    }
    
    return { passed: allPassed, results };
    
  } catch (error) {
    console.error(`❌ ${testCase.businessType.toUpperCase()} 테스트 오류:`, error.message);
    return { passed: false, error: error.message };
  } finally {
    await page.close();
  }
}

async function runAllTests() {
  console.log('🚀 자동화된 테스트 시작...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, // 브라우저 창을 보여줍니다
    slowMo: 100 // 각 동작 사이에 100ms 지연
  });
  
  const results = {};
  
  try {
    for (const [testName, testCase] of Object.entries(testCases)) {
      results[testName] = await runTest(browser, testCase);
    }
    
    // 전체 결과 요약
    console.log('\n📋 전체 테스트 결과:');
    console.log('='.repeat(50));
    
    const passedTests = Object.values(results).filter(r => r.passed).length;
    const totalTests = Object.keys(results).length;
    
    Object.entries(results).forEach(([testName, result]) => {
      console.log(`${result.passed ? '✅' : '❌'} ${testName.toUpperCase()}: ${result.passed ? 'PASS' : 'FAIL'}`);
    });
    
    console.log('='.repeat(50));
    console.log(`총 ${totalTests}개 테스트 중 ${passedTests}개 통과 (${((passedTests/totalTests)*100).toFixed(1)}%)`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 모든 테스트 통과!');
    } else {
      console.log('\n⚠️  일부 테스트 실패. 로그를 확인하세요.');
    }
    
  } finally {
    await browser.close();
  }
}

// 테스트 실행
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, runTest, testCases };
