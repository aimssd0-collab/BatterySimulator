const fs = require('fs');

const inputs = {
    annualProduction: 5000,
    annualConsumption: 6000,
    sellPriceFirstPeriodYears: 4,
    sellPriceFirstPeriod: 24,
    sellPriceSecondPeriod: 8.3,
    inflationRate: 2.0,
    renewableSurcharge: 3.98,
    rates: [
        { name: '昼間', startHour: 7, endHour: 23, price: 42.6 },
        { name: '夜間', startHour: 23, endHour: 7, price: 31.64 }
    ]
};

function getPriceForHour(hour, yearIndex) {
    let matchingRate = inputs.rates.find(rate => {
        if (rate.startHour <= rate.endHour) return hour >= rate.startHour && hour < rate.endHour;
        else return hour >= rate.startHour || hour < rate.endHour;
    });
    let basePrice = matchingRate ? matchingRate.price : 30;
    let inflatedPrice = basePrice * Math.pow(1 + (inputs.inflationRate / 100), yearIndex);
    return inflatedPrice + inputs.renewableSurcharge;
}

function getLowestPrice(yearIndex) {
    let minPrice = 999;
    for (let h = 0; h < 24; h++) {
        let p = getPriceForHour(h, yearIndex);
        if (p < minPrice) minPrice = p;
    }
    return minPrice;
}

function getHighestPrice(yearIndex) {
    let maxPrice = 0;
    for (let h = 0; h < 24; h++) {
        let p = getPriceForHour(h, yearIndex);
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

    for (let year = 1; year <= 15; year++) {
        let maxCapThisYear = (totalDischargedKwh >= lifecycleLimit) ? 0 : maxCapOriginal;
        if (maxCapThisYear === 0 && deathYear === null) {
            deathYear = year;
        }
        let dailyGridCost = 0;
        let dailySold = 0;
        let dailyBatteryConsumed = 0;
        let batteryLevel = 0;
        let dailyGridCostNoSolarNoBattery = 0;

        for (let d = 0; d < 2; d++) {
            if (d === 1) { dailyGridCost = 0; dailySold = 0; dailyBatteryConsumed = 0; }

            for (let h = 0; h < 24; h++) {
                let load_h = 0;
                if (h < 8) load_h = (dailyCons * 0.2) / 8;
                else if (h < 16) load_h = (dailyCons * 0.4) / 8;
                else load_h = (dailyCons * 0.4) / 8;

                let yield_h = (h >= 8 && h < 16) ? dailyProd / 8 : 0;
                const price_h = getPriceForHour(h, year - 1);

                if (yield_h >= load_h) {
                    let excess = yield_h - load_h;
                    let chargeSpace = Math.max(0, maxCapThisYear - batteryLevel);
                    let chargeAmount = Math.min(excess, maxOut, chargeSpace);
                    batteryLevel += chargeAmount * eff;
                    let soldAmount = excess - chargeAmount;
                    if (d === 1) dailySold += soldAmount;
                } else {
                    let shortage = load_h - yield_h;
                    let dischargeAmount = Math.min(shortage, maxOut, batteryLevel);
                    batteryLevel -= dischargeAmount;
                    if (d === 1) dailyBatteryConsumed += dischargeAmount;
                    let gridBuyAmount = shortage - dischargeAmount;
                    if (d === 1) dailyGridCost += gridBuyAmount * price_h;
                }
                if (d === 1 && !batteryObj) {
                    dailyGridCostNoSolarNoBattery += load_h * price_h;
                }
            }
        }

        const annualGridCostStandard = dailyGridCost * 365;
        const annualSoldStandardKwh = dailySold * 365;
        const annualGridCostNoSolarNoBattery = dailyGridCostNoSolarNoBattery * 365;

        let selfConsumptionRate = null;
        if (year === 1 && inputs.annualProduction > 0) {
            selfConsumptionRate = ((inputs.annualProduction - annualSoldStandardKwh) / inputs.annualProduction) * 100;
        }

        let arbitrageBonusCostReduction = 0;
        let arbitrageDischargedKwh = 0;

        if (hasAiArbitrage && maxCapThisYear > 0) {
            let lowest = getLowestPrice(year - 1);
            let highest = getHighestPrice(year - 1);
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
        const finalDischargedKwh = (dailyBatteryConsumed * 365) + arbitrageDischargedKwh;

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

const batteryA = {
    model: 'LUNA2000-4.95-14-N',
    effectiveCapacity: 13.4,
    output: 4.95,
    efficiency: 91.7,
    lifecycleCapacity: 78173,
    aiArbitrage: true
};

const batteryB = { model: 'LUNA2000-4.95-7-N', effectiveCapacity: 6.7, output: 3.5, efficiency: 91.7, lifecycleCapacity: 39086, aiArbitrage: true };

const simA = runSimulation(batteryA);
const simB = runSimulation(batteryB);

let totalDischargedB = simB.yearlyData.reduce((sum, d) => sum + d.dischargedKwh, 0);

fs.writeFileSync('out3.json', JSON.stringify({ simB, totalDischargedB }, null, 2));

