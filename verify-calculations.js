// 계산 검증 스크립트
// 이 스크립트는 예상 결과와 실제 계산을 비교하여 검증합니다.

// SaaS 테스트 케이스
function verifySaasCalculations() {
  console.log('🧪 SaaS 계산 검증');
  console.log('='.repeat(40));
  
  // 입력 데이터
  const monthlyVisitors = 10000;
  const visitorToSignupRate = 0.05;
  const signupToPaidRate = 0.20;
  const monthlyChurnRate = 0.03;
  const monthlyPrice = 50000;
  const annualPrice = 500000;
  const annualDiscountRate = 0.10;
  const marketingCost = 2000000;
  const personnelCost = 5000000;
  const otherFixedCosts = 1000000;
  const paymentFeeRate = 0.03;
  
  // 계산
  const newSignups = Math.round(monthlyVisitors * visitorToSignupRate);
  const newPaidCustomers = Math.round(newSignups * signupToPaidRate);
  const activeCustomers = newPaidCustomers; // 첫 달
  const monthlyRevenue = activeCustomers * monthlyPrice;
  const annualRevenue = activeCustomers * annualPrice * (1 - annualDiscountRate) / 12;
  const totalRevenue = monthlyRevenue + annualRevenue;
  const paymentFee = totalRevenue * paymentFeeRate;
  const totalCosts = marketingCost + personnelCost + otherFixedCosts + paymentFee;
  const netProfit = totalRevenue - totalCosts;
  
  // LTV/CAC 계산
  const ltv = monthlyPrice / monthlyChurnRate;
  const cac = marketingCost / newPaidCustomers;
  const ltvCacRatio = ltv / cac;
  
  // 결과 출력
  console.log(`신규 가입자: ${newSignups}명`);
  console.log(`신규 유료고객: ${newPaidCustomers}명`);
  console.log(`활성 고객: ${activeCustomers}명`);
  console.log(`월간 매출: ${monthlyRevenue.toLocaleString()}원`);
  console.log(`연간 매출: ${annualRevenue.toLocaleString()}원`);
  console.log(`총 매출: ${totalRevenue.toLocaleString()}원`);
  console.log(`결제 수수료: ${paymentFee.toLocaleString()}원`);
  console.log(`총 비용: ${totalCosts.toLocaleString()}원`);
  console.log(`순이익: ${netProfit.toLocaleString()}원`);
  console.log(`LTV: ${ltv.toLocaleString()}원`);
  console.log(`CAC: ${cac.toLocaleString()}원`);
  console.log(`LTV/CAC 비율: ${ltvCacRatio.toFixed(2)}`);
  
  // 예상값과 비교
  const expected = {
    revenue: 8750000,
    netProfit: 487500,
    ltv: 1666667,
    cac: 20000,
    ltvCacRatio: 83.33
  };
  
  console.log('\n📊 검증 결과:');
  console.log(`매출: ${Math.abs(totalRevenue - expected.revenue) < 1000 ? '✅' : '❌'} (예상: ${expected.revenue.toLocaleString()}, 실제: ${totalRevenue.toLocaleString()})`);
  console.log(`순이익: ${Math.abs(netProfit - expected.netProfit) < 1000 ? '✅' : '❌'} (예상: ${expected.netProfit.toLocaleString()}, 실제: ${netProfit.toLocaleString()})`);
  console.log(`LTV: ${Math.abs(ltv - expected.ltv) < 1000 ? '✅' : '❌'} (예상: ${expected.ltv.toLocaleString()}, 실제: ${ltv.toLocaleString()})`);
  console.log(`CAC: ${Math.abs(cac - expected.cac) < 1000 ? '✅' : '❌'} (예상: ${expected.cac.toLocaleString()}, 실제: ${cac.toLocaleString()})`);
  console.log(`LTV/CAC: ${Math.abs(ltvCacRatio - expected.ltvCacRatio) < 1 ? '✅' : '❌'} (예상: ${expected.ltvCacRatio}, 실제: ${ltvCacRatio.toFixed(2)})`);
}

// B2C Platform 테스트 케이스
function verifyB2CCalculations() {
  console.log('\n🧪 B2C Platform 계산 검증');
  console.log('='.repeat(40));
  
  // 입력 데이터
  const monthlyVisitors = 50000;
  const visitorToBuyerRate = 0.02;
  // const buyerToRepeatRate = 0.25;
  const ordersPerBuyerPerMonth = 2;
  const averageOrderValue = 30000;
  const refundRate = 0.05;
  const takeRate = 0.10;
  const fixedFeePerOrder = 1000;
  const adRevenuePerMonth = 500000;
  const marketingCost = 3000000;
  const personnelCost = 8000000;
  const otherFixedCosts = 2000000;
  const paymentFeeRate = 0.03;
  
  // 계산
  const newBuyers = Math.round(monthlyVisitors * visitorToBuyerRate);
  const monthlyOrders = newBuyers * ordersPerBuyerPerMonth;
  const gmv = monthlyOrders * averageOrderValue;
  const refunds = gmv * refundRate;
  const netGmv = gmv - refunds;
  const takeRateRevenue = netGmv * takeRate;
  const fixedFeeRevenue = monthlyOrders * fixedFeePerOrder;
  const totalRevenue = takeRateRevenue + fixedFeeRevenue + adRevenuePerMonth;
  const paymentFee = totalRevenue * paymentFeeRate;
  const totalCosts = marketingCost + personnelCost + otherFixedCosts + paymentFee;
  const netProfit = totalRevenue - totalCosts;
  
  // LTV/CAC 계산
  const customerLifespan = 1 / refundRate; // 환불률을 이탈률로 간주
  const monthlyRevenuePerCustomer = averageOrderValue * ordersPerBuyerPerMonth * takeRate;
  const ltv = monthlyRevenuePerCustomer * customerLifespan;
  const cac = marketingCost / newBuyers;
  const ltvCacRatio = ltv / cac;
  
  // 결과 출력
  console.log(`신규 구매자: ${newBuyers}명`);
  console.log(`월간 주문 수: ${monthlyOrders}주문`);
  console.log(`GMV: ${gmv.toLocaleString()}원`);
  console.log(`환불: ${refunds.toLocaleString()}원`);
  console.log(`순 GMV: ${netGmv.toLocaleString()}원`);
  console.log(`테이크레이트 수익: ${takeRateRevenue.toLocaleString()}원`);
  console.log(`고정 수수료 수익: ${fixedFeeRevenue.toLocaleString()}원`);
  console.log(`광고 수익: ${adRevenuePerMonth.toLocaleString()}원`);
  console.log(`총 매출: ${totalRevenue.toLocaleString()}원`);
  console.log(`결제 수수료: ${paymentFee.toLocaleString()}원`);
  console.log(`총 비용: ${totalCosts.toLocaleString()}원`);
  console.log(`순이익: ${netProfit.toLocaleString()}원`);
  console.log(`고객 생존 기간: ${customerLifespan.toFixed(1)}개월`);
  console.log(`월간 수익: ${monthlyRevenuePerCustomer.toLocaleString()}원`);
  console.log(`LTV: ${ltv.toLocaleString()}원`);
  console.log(`CAC: ${cac.toLocaleString()}원`);
  console.log(`LTV/CAC 비율: ${ltvCacRatio.toFixed(2)}`);
  
  // 예상값과 비교
  const expected = {
    revenue: 8200000,
    netProfit: -5046000,
    ltv: 120000,
    cac: 3000,
    ltvCacRatio: 40
  };
  
  console.log('\n📊 검증 결과:');
  console.log(`매출: ${Math.abs(totalRevenue - expected.revenue) < 1000 ? '✅' : '❌'} (예상: ${expected.revenue.toLocaleString()}, 실제: ${totalRevenue.toLocaleString()})`);
  console.log(`순이익: ${Math.abs(netProfit - expected.netProfit) < 1000 ? '✅' : '❌'} (예상: ${expected.netProfit.toLocaleString()}, 실제: ${netProfit.toLocaleString()})`);
  console.log(`LTV: ${Math.abs(ltv - expected.ltv) < 1000 ? '✅' : '❌'} (예상: ${expected.ltv.toLocaleString()}, 실제: ${ltv.toLocaleString()})`);
  console.log(`CAC: ${Math.abs(cac - expected.cac) < 1000 ? '✅' : '❌'} (예상: ${expected.cac.toLocaleString()}, 실제: ${cac.toLocaleString()})`);
  console.log(`LTV/CAC: ${Math.abs(ltvCacRatio - expected.ltvCacRatio) < 1 ? '✅' : '❌'} (예상: ${expected.ltvCacRatio}, 실제: ${ltvCacRatio.toFixed(2)})`);
}

// Manufacturing 테스트 케이스
function verifyManufacturingCalculations() {
  console.log('\n🧪 Manufacturing 계산 검증');
  console.log('='.repeat(40));
  
  // 입력 데이터
  const monthlySales = 1000;
  const unitPrice = 100000;
  const materialCostPerUnit = 30000;
  const laborCostPerUnit = 20000;
  const shippingCostPerUnit = 5000;
  const otherVariableCostPerUnit = 10000;
  const productionCapacity = 1500;
  const marketingCost = 1000000;
  const personnelCost = 3000000;
  const otherFixedCosts = 1500000;
  const paymentFeeRate = 0.03;
  
  // 계산
  const actualSales = Math.min(monthlySales, productionCapacity);
  const revenue = actualSales * unitPrice;
  const materialCost = actualSales * materialCostPerUnit;
  const laborCost = actualSales * laborCostPerUnit;
  const shippingCost = actualSales * shippingCostPerUnit;
  const otherVariableCost = actualSales * otherVariableCostPerUnit;
  const totalCostOfGoodsSold = materialCost + laborCost + shippingCost + otherVariableCost;
  const grossMargin = revenue - totalCostOfGoodsSold;
  const paymentFee = revenue * paymentFeeRate;
  const totalCosts = marketingCost + personnelCost + otherFixedCosts + totalCostOfGoodsSold + paymentFee;
  const netProfit = revenue - totalCosts;
  
  // LTV/CAC 계산
  const unitMargin = unitPrice - (materialCostPerUnit + laborCostPerUnit + shippingCostPerUnit + otherVariableCostPerUnit);
  const customerLifespan = 12; // 1년
  const ltv = unitMargin * actualSales * customerLifespan;
  const cac = marketingCost / actualSales;
  const ltvCacRatio = ltv / cac;
  
  // 결과 출력
  console.log(`실제 판매량: ${actualSales}개`);
  console.log(`매출: ${revenue.toLocaleString()}원`);
  console.log(`재료비: ${materialCost.toLocaleString()}원`);
  console.log(`인건비: ${laborCost.toLocaleString()}원`);
  console.log(`배송비: ${shippingCost.toLocaleString()}원`);
  console.log(`기타 변동비: ${otherVariableCost.toLocaleString()}원`);
  console.log(`총 원가: ${totalCostOfGoodsSold.toLocaleString()}원`);
  console.log(`총 마진: ${grossMargin.toLocaleString()}원`);
  console.log(`결제 수수료: ${paymentFee.toLocaleString()}원`);
  console.log(`총 비용: ${totalCosts.toLocaleString()}원`);
  console.log(`순이익: ${netProfit.toLocaleString()}원`);
  console.log(`단위 마진: ${unitMargin.toLocaleString()}원`);
  console.log(`LTV: ${ltv.toLocaleString()}원`);
  console.log(`CAC: ${cac.toLocaleString()}원`);
  console.log(`LTV/CAC 비율: ${ltvCacRatio.toFixed(2)}`);
  
  // 예상값과 비교
  const expected = {
    revenue: 100000000,
    netProfit: 26500000,
    ltv: 420000000,
    cac: 1000,
    ltvCacRatio: 420000
  };
  
  console.log('\n📊 검증 결과:');
  console.log(`매출: ${Math.abs(revenue - expected.revenue) < 1000 ? '✅' : '❌'} (예상: ${expected.revenue.toLocaleString()}, 실제: ${revenue.toLocaleString()})`);
  console.log(`순이익: ${Math.abs(netProfit - expected.netProfit) < 1000 ? '✅' : '❌'} (예상: ${expected.netProfit.toLocaleString()}, 실제: ${netProfit.toLocaleString()})`);
  console.log(`LTV: ${Math.abs(ltv - expected.ltv) < 1000 ? '✅' : '❌'} (예상: ${expected.ltv.toLocaleString()}, 실제: ${ltv.toLocaleString()})`);
  console.log(`CAC: ${Math.abs(cac - expected.cac) < 1000 ? '✅' : '❌'} (예상: ${expected.cac.toLocaleString()}, 실제: ${cac.toLocaleString()})`);
  console.log(`LTV/CAC: ${Math.abs(ltvCacRatio - expected.ltvCacRatio) < 1000 ? '✅' : '❌'} (예상: ${expected.ltvCacRatio}, 실제: ${ltvCacRatio.toFixed(2)})`);
}

// 모든 테스트 실행
function runAllVerifications() {
  console.log('🚀 계산 검증 시작...\n');
  
  verifySaasCalculations();
  verifyB2CCalculations();
  verifyManufacturingCalculations();
  
  console.log('\n🎉 모든 계산 검증 완료!');
}

// 실행
if (require.main === module) {
  runAllVerifications();
}

module.exports = {
  verifySaasCalculations,
  verifyB2CCalculations,
  verifyManufacturingCalculations,
  runAllVerifications
};
