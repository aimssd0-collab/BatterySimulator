const fs = require('fs');

const inputs = {
    annualProduction: 5000,
    annualConsumption: 2000,
    sellPriceFirstPeriodYears: 4,
    sellPriceFirstPeriod: 24,
    sellPriceSecondPeriod: 8.3,
    inflationRate: 2.0,
    loanA: 15000,
    loanB: 13000,
    scenario: '2',
    pcsReplacementCost: 250000,
    renewableSurcharge: 3.98,
    rates: [
        { name: '昼間', startHour: 7, endHour: 23, price: 42.6, months: 'all', dayType: 'all' },
        { name: '夜間', startHour: 23, endHour: 7, price: 31.64, months: 'all', dayType: 'all' },
        { name: '休日安', startHour: 7, endHour: 23, price: 20.0, months: 'all', dayType: '休日' }
    ],
    batteryA: {
        model: 'LUNA2000-4.95-14-N',
        effectiveCapacity: 13.4,
        output: 4.95,
        efficiency: 91.7,
        lifecycleCapacity: 78173,
        aiArbitrage: true
    },
    batteryB: { model: 'LUNA2000-4.95-7-N', effectiveCapacity: 6.7, output: 3.5, efficiency: 91.7, lifecycleCapacity: 39086, aiArbitrage: true }
};

function getPriceForHour(hour, month, isDayOff, yearIndex) {
    let matchingRate = inputs.rates.find(rate => {
        let okMonth = true;
        if (rate.months && rate.months !== 'all' && rate.months !== 'すべて') {
            const mStr = String(rate.months).replace('月', ''); // e.g. "7,8,9" or "7-9"
            if (mStr.includes('-')) {
                let parts = mStr.split('-');
                let sm = parseInt(parts[0], 10);
                let em = parseInt(parts[1], 10);
                okMonth = (month >= sm && month <= em);
            } else if (mStr.includes('夏')) {
                okMonth = (month >= 7 && month <= 9);
            } else if (mStr.includes('冬')) {
                okMonth = (month === 12 || month <= 2);
            } else {
                okMonth = mStr.split(/[,、]/).map(s=>parseInt(s.trim())).includes(month);
            }
        }
        if (!okMonth) return false;

        let okDay = true;
        if (rate.dayType && rate.dayType !== 'all' && rate.dayType !== 'すべて') {
            if (rate.dayType.includes('平日') && isDayOff) okDay = false;
            if ((rate.dayType.includes('休日') || rate.dayType.includes('土日祝')) && !isDayOff) okDay = false;
        }
        if (!okDay) return false;

        if (rate.startHour <= rate.endHour) return hour >= rate.startHour && hour < rate.endHour;
        else return hour >= rate.startHour || hour < rate.endHour;
    });

    let basePrice = matchingRate ? matchingRate.price : 30;
    let inflatedPrice = basePrice * Math.pow(1 + (inputs.inflationRate / 100), yearIndex);
    return inflatedPrice + inputs.renewableSurcharge;
}

function getLowestPrice(month, isDayOff, yearIndex) {
    let minPrice = 999;
    for (let h = 0; h < 24; h++) {
        let p = getPriceForHour(h, month, isDayOff, yearIndex);
        if (p < minPrice) minPrice = p;
    }
    return minPrice;
}

function getHighestPrice(month, isDayOff, yearIndex) {
    let maxPrice = 0;
    for (let h = 0; h < 24; h++) {
        let p = getPriceForHour(h, month, isDayOff, yearIndex);
        if (p > maxPrice) maxPrice = p;
    }
    return maxPrice;
}

function runSimulation(batteryObj) {
    const dailyProd = inputs.annualProduction / 365;
    const dailyCons = inputs.annualConsumption / 365;
    const eff = (batteryObj ? (batteryObj.efficiency || 100) / 100 : 1.0);
    const maxCapOriginal = batteryObj ? (batteryObj.effectiveCapacity || 0) : 0;
    const maxOut = batteryObj ? (batteryObj.output || 999) : 0;
    const lifecycleLimit = batteryObj ? (batteryObj.lifecycleCapacity || 9999999) : 9999999;
    const hasAiArbitrage = batteryObj ? batteryObj.aiArbitrage : false;

    let yearlyData = [];
    let totalDischargedKwh = 0;
    let deathYear = null;

    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const holidays = ["1-1","1-8","2-11","2-12","2-23","3-20","4-29","5-3","5-4","5-5","5-6","7-15","8-11","8-12","9-16","9-22","9-23","10-14","11-3","11-4","11-23"];

    for (let year = 1; year <= 15; year++) {
        let maxCapThisYear = (totalDischargedKwh >= lifecycleLimit) ? 0 : maxCapOriginal;
        if (maxCapThisYear === 0 && deathYear === null) {
            deathYear = year;
        }
        
        let annualGridCostStandard = 0;
        let annualSoldStandardKwh = 0;
        let annualBatteryConsumed = 0;
        let annualGridCostNoSolarNoBattery = 0;
        let batteryLevel = 0;

        let month = 1;
        let date = 1;
        let startDayOfWeek = 1;

        for (let d = 0; d < 365; d++) {
            let hw = startDayOfWeek;
            let dateStr = month + "-" + date;
            let isDayOff = (hw === 0 || hw === 6 || holidays.includes(dateStr));

            let dailyGridCost = 0;
            let dailySold = 0;
            let dailyBatteryConsumed = 0;
            let dailyGridCostNoSolarNoBattery = 0;

            for (let h = 0; h < 24; h++) {
                let load_h = 0;
                if (h < 8) load_h = (dailyCons * 0.2) / 8;
                else if (h < 16) load_h = (dailyCons * 0.4) / 8;
                else load_h = (dailyCons * 0.4) / 8;

                let yield_h = (h >= 8 && h < 16) ? dailyProd / 8 : 0;
                const price_h = getPriceForHour(h, month, isDayOff, year - 1);

                if (yield_h >= load_h) {
                    let excess = yield_h - load_h;
                    let chargeSpace = Math.max(0, maxCapThisYear - batteryLevel);
                    let chargeAmount = Math.min(excess, maxOut, chargeSpace);
                    batteryLevel += chargeAmount * eff;
                    let soldAmount = excess - chargeAmount;
                    dailySold += soldAmount;
                } else {
                    let shortage = load_h - yield_h;
                    let dischargeAmount = Math.min(shortage, maxOut, batteryLevel);
                    batteryLevel -= dischargeAmount;
                    
                    dailyBatteryConsumed += dischargeAmount;
                    let gridBuyAmount = shortage - dischargeAmount;
                    dailyGridCost += gridBuyAmount * price_h;
                }
                
                if (!batteryObj) {
                    dailyGridCostNoSolarNoBattery += load_h * price_h;
                }
            }

            annualGridCostStandard += dailyGridCost;
            annualSoldStandardKwh += dailySold;
            annualBatteryConsumed += dailyBatteryConsumed;
            annualGridCostNoSolarNoBattery += dailyGridCostNoSolarNoBattery;

            startDayOfWeek = (startDayOfWeek + 1) % 7;
            date++;
            if (date > daysInMonth[month - 1]) {
                date = 1;
                month++;
            }
        }

        let selfConsumptionRate = null;
        if (year === 1 && inputs.annualProduction > 0) {
            selfConsumptionRate = ((inputs.annualProduction - annualSoldStandardKwh) / inputs.annualProduction) * 100;
        }

        let arbitrageBonusCostReduction = 0;
        let arbitrageDischargedKwh = 0;

        if (hasAiArbitrage && maxCapThisYear > 0) {
            let lowest = getLowestPrice(1, false, year - 1);
            let highest = getHighestPrice(1, false, year - 1);
            if (highest > lowest) {
                let arbitrageDays = 100;
                let chargeVolume = maxCapThisYear;
                let extraNightCost = (chargeVolume / eff) * lowest;
                let savedDayCost = chargeVolume * highest;

                let dailyArbitrageProfit = savedDayCost - extraNightCost;
                if (dailyArbitrageProfit > 0) {
                    arbitrageBonusCostReduction = dailyArbitrageProfit * arbitrageDays;
                    arbitrageDischargedKwh = chargeVolume * arbitrageDays;
                }
            }
        }

        const finalGridCost = Math.max(0, annualGridCostStandard - arbitrageBonusCostReduction);
        const finalDischargedKwh = annualBatteryConsumed + arbitrageDischargedKwh;

        let sellPrice = year <= inputs.sellPriceFirstPeriodYears ? inputs.sellPriceFirstPeriod : inputs.sellPriceSecondPeriod;
        let finalSoldRevenue = annualSoldStandardKwh * sellPrice;

        totalDischargedKwh += finalDischargedKwh;

        yearlyData.push({
            year: year,
            gridCost: finalGridCost,
            soldRevenue: finalSoldRevenue,
            dischargedKwh: finalDischargedKwh,
            gridCostNoSolarNoBattery: annualGridCostNoSolarNoBattery,
            selfConsumptionRate: selfConsumptionRate
        });
    }

    return { yearlyData: yearlyData, deathYear: deathYear, year1SelfConsumptionRate: yearlyData[0].selfConsumptionRate };
}

function calculateSimulation() {
    const baseline = runSimulation(null);
    const simA = runSimulation(inputs.batteryA);
    const simB = runSimulation(inputs.batteryB);

    let totalDischargedA = simA.yearlyData.reduce((sum, d) => sum + d.dischargedKwh, 0);
    let totalDischargedB = simB.yearlyData.reduce((sum, d) => sum + d.dischargedKwh, 0);

    let resA = { yearlyPureAcc: [], batteryPureBenefit15Y: 0, year1Saving: 0, deathYear: simA.deathYear, remainingCapacity: Math.max(0, inputs.batteryA.lifecycleCapacity - totalDischargedA), remainingBenefit: 0, selfConsumptionRate: simA.year1SelfConsumptionRate };
    let resB = { yearlyPureAcc: [], batteryPureBenefit15Y: 0, year1Saving: 0, deathYear: simB.deathYear, remainingCapacity: Math.max(0, inputs.batteryB.lifecycleCapacity - totalDischargedB), remainingBenefit: 0, selfConsumptionRate: simB.year1SelfConsumptionRate };

    let accPureA = 0; let accPureB = 0;
    let baselineCost15Y = 0;

    for (let i = 0; i < 15; i++) {
        let baseGridCost = 0;
        let baseSoldRev = 0;

        if (inputs.scenario === '1') {
            baseGridCost = baseline.yearlyData[i].gridCostNoSolarNoBattery;
            baseSoldRev = 0;
        } else {
            baseGridCost = baseline.yearlyData[i].gridCost;
            baseSoldRev = baseline.yearlyData[i].soldRevenue;
        }

        baselineCost15Y += baseGridCost;

        let pureBatteryProfitA = 0;
        let pureBatteryProfitB = 0;
        let gridSavingsA = 0;
        let gridSavingsB = 0;

        if (inputs.scenario === '1') {
            gridSavingsA = baseGridCost - simA.yearlyData[i].gridCost;
            pureBatteryProfitA = gridSavingsA + simA.yearlyData[i].soldRevenue;

            gridSavingsB = baseGridCost - simB.yearlyData[i].gridCost;
            pureBatteryProfitB = gridSavingsB + simB.yearlyData[i].soldRevenue;
        } else {
            gridSavingsA = baseGridCost - simA.yearlyData[i].gridCost;
            let soldLossA = (baseSoldRev || 0) - (simA.yearlyData[i].soldRevenue || 0);
            pureBatteryProfitA = gridSavingsA - soldLossA;

            gridSavingsB = baseGridCost - simB.yearlyData[i].gridCost;
            let soldLossB = (baseSoldRev || 0) - (simB.yearlyData[i].soldRevenue || 0);
            pureBatteryProfitB = gridSavingsB - soldLossB;

            if (i === 9 && inputs.pcsReplacementCost > 0) {
                pureBatteryProfitA += inputs.pcsReplacementCost;
                pureBatteryProfitB += inputs.pcsReplacementCost;
            }
        }

        accPureA += pureBatteryProfitA;
        resA.yearlyPureAcc.push(accPureA);
        resA.batteryPureBenefit15Y += pureBatteryProfitA;

        if (i === 0) resA.year1Saving = gridSavingsA;

        accPureB += pureBatteryProfitB;
        resB.yearlyPureAcc.push(accPureB);
        resB.batteryPureBenefit15Y += pureBatteryProfitB;

        if (i === 0) resB.year1Saving = gridSavingsB;
    }

    if (totalDischargedA > 0 && !simA.deathYear) {
        let benefitPerKwhA = resA.batteryPureBenefit15Y / totalDischargedA;
        resA.remainingBenefit = Math.floor(benefitPerKwhA * resA.remainingCapacity);
    }
    if (totalDischargedB > 0 && !simB.deathYear) {
        let benefitPerKwhB = resB.batteryPureBenefit15Y / totalDischargedB;
        resB.remainingBenefit = Math.floor(benefitPerKwhB * resB.remainingCapacity);
    }

    return { A: resA, B: resB };
}

const res = calculateSimulation();
fs.writeFileSync('output/out_final.json', JSON.stringify(res, null, 2));
