
const VueObj = {
    inputs: {
        annualProduction: 5000,
        annualConsumption: 6000,
        sellPriceFirstPeriodYears: 4,
        sellPriceFirstPeriod: 24,
        sellPriceSecondPeriod: 8.3,
        inflationRate: 2.0,
        loanA: 15000,
        loanB: 13000,
        scenario: '1',
        pcsReplacementCost: 250000,
        renewableSurcharge: 3.98,
        rates: [
            { name: '昼間', startHour: 7, endHour: 23, price: 42.6 },
            { name: '夜間', startHour: 23, endHour: 7, price: 31.64 }
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
    },
    results: null,
    rateError: '',
    isValidA: true,
    isValidB: true,
    validateRates() {},
    getPriceForHour: function(hour, yearIndex) {
        let matchingRate = this.inputs.rates.find(rate => {
            if (rate.startHour <= rate.endHour) return hour >= rate.startHour && hour < rate.endHour;
            else return hour >= rate.startHour || hour < rate.endHour;
        });
        let basePrice = matchingRate ? matchingRate.price : 30;
        let inflatedPrice = basePrice * Math.pow(1 + (this.inputs.inflationRate / 100), yearIndex);
        return inflatedPrice + this.inputs.renewableSurcharge;
    },
    getLowestPrice: function(yearIndex) {
        let minPrice = 999;
        for (let h = 0; h < 24; h++) {
            let p = this.getPriceForHour(h, yearIndex);
            if (p < minPrice) minPrice = p;
        }
        return minPrice;
    },
    getHighestPrice: function(yearIndex) {
        let maxPrice = 0;
        for (let h = 0; h < 24; h++) {
            let p = this.getPriceForHour(h, yearIndex);
            if (p > maxPrice) maxPrice = p;
        }
        return maxPrice;
    },
    $nextTick(cb) { cb && cb(); },
    renderChart() {},
    renderLoanChart() {},
    runSimulation: function(batteryObj) {
                    const dailyProd = this.inputs.annualProduction / 365;
                    const dailyCons = this.inputs.annualConsumption / 365;
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
                        let dailyGridCostNoSolarNoBattery = 0; // シナリオ1用のベースライン

                        // 2日間ループして安定化
                        for (let d = 0; d < 2; d++) {
                            if (d === 1) { dailyGridCost = 0; dailySold = 0; dailyBatteryConsumed = 0; }

                            for (let h = 0; h < 24; h++) {
                                let load_h = 0;
                                if (h < 8) load_h = (dailyCons * 0.2) / 8;
                                else if (h < 16) load_h = (dailyCons * 0.4) / 8;
                                else load_h = (dailyCons * 0.4) / 8;

                                let yield_h = (h >= 8 && h < 16) ? dailyProd / 8 : 0;
                                const price_h = this.getPriceForHour(h, year - 1);

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
                                // シナリオ1のベースライン（太陽光も蓄電池もない場合の全消費を買電）計算
                                if (d === 1 && !batteryObj) {
                                    dailyGridCostNoSolarNoBattery += load_h * price_h;
                                }
                            }
                        }

                        // 1日あたりの標準結果
                        const annualGridCostStandard = dailyGridCost * 365;
                        const annualSoldStandardKwh = dailySold * 365;
                        const annualGridCostNoSolarNoBattery = dailyGridCostNoSolarNoBattery * 365;

                        // 1年目のみ自家消費率を計算（年間太陽光発電量のうち、売られずに自家消費・充電に回った割合）
                        let selfConsumptionRate = null;
                        if (year === 1 && this.inputs.annualProduction > 0) {
                            selfConsumptionRate = ((this.inputs.annualProduction - annualSoldStandardKwh) / this.inputs.annualProduction) * 100;
                        }

                        // 拡販機能：深夜電力（アービトラージ）の活用ボーナス計算
                        // 想定：年間100日は太陽光が足りず、深夜の安い電気を満充電して昼間高い電気の代わりに使うとする
                        let arbitrageBonusCostReduction = 0;
                        let arbitrageDischargedKwh = 0;

                        if (hasAiArbitrage && maxCapThisYear > 0) {
                            let lowest = this.getLowestPrice(year - 1);
                            let highest = this.getHighestPrice(year - 1);
                            if (highest > lowest) {
                                // 100日分のアービトラージによる差額利益（＝昼間の高い買電を減らし、安い深夜買電に振り替える）
                                let arbitrageDays = 100;
                                let chargeVolume = maxCapThisYear;
                                // 蓄電池を満タンにするための深夜買電コスト
                                let extraNightCost = (chargeVolume / eff) * lowest;
                                // 昼間に放電して浮いた電気代
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

                        let sellPrice = year <= this.inputs.sellPriceFirstPeriodYears ? this.inputs.sellPriceFirstPeriod : this.inputs.sellPriceSecondPeriod;
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
                },
    calculateSimulation: function() {
                    this.validateRates();
                    if (this.rateError) {
                        alert("料金設定にエラーがあります。\n" + this.rateError);
                        return; // エラー時は計算しない
                    }

                    const baseline = this.runSimulation(null);
                    const simA = this.runSimulation(this.inputs.batteryA);
                    const simB = this.runSimulation(this.inputs.batteryB);

                    let totalDischargedA = simA.yearlyData.reduce((sum, d) => sum + d.dischargedKwh, 0);
                    let totalDischargedB = simB.yearlyData.reduce((sum, d) => sum + d.dischargedKwh, 0);

                    let resA = { yearlyPureAcc: [], batteryPureBenefit15Y: 0, year1Saving: 0, deathYear: simA.deathYear, remainingCapacity: Math.max(0, this.inputs.batteryA.lifecycleCapacity - totalDischargedA), remainingBenefit: 0, selfConsumptionRate: simA.year1SelfConsumptionRate };
                    let resB = { yearlyPureAcc: [], batteryPureBenefit15Y: 0, year1Saving: 0, deathYear: simB.deathYear, remainingCapacity: Math.max(0, this.inputs.batteryB.lifecycleCapacity - totalDischargedB), remainingBenefit: 0, selfConsumptionRate: simB.year1SelfConsumptionRate };

                    let accPureA = 0; let accPureB = 0;
                    let baselineCost15Y = 0;

                    for (let i = 0; i < 15; i++) {
                        let baseGridCost = 0;
                        let baseSoldRev = 0;

                        if (this.inputs.scenario === '1') {
                            // シナリオ1：太陽光＋蓄電池（ベースは何も導入していない全体の買電額）
                            baseGridCost = baseline.yearlyData[i].gridCostNoSolarNoBattery;
                            baseSoldRev = 0; // 何も導入してないなら売電も0
                        } else {
                            // シナリオ2：蓄電池後付け（ベースは太陽光のみある状態）
                            baseGridCost = baseline.yearlyData[i].gridCost;
                            baseSoldRev = baseline.yearlyData[i].soldRevenue;
                        }

                        baselineCost15Y += baseGridCost;

                        let pureBatteryProfitA = 0;
                        let pureBatteryProfitB = 0;
                        let gridSavingsA = 0;
                        let gridSavingsB = 0;

                        if (this.inputs.scenario === '1') {
                            // メリット ＝ （元々払うはずだった電気代） － （太陽光＋蓄電池導入後の電気代） ＋ （売電収入）
                            gridSavingsA = baseGridCost - simA.yearlyData[i].gridCost;
                            pureBatteryProfitA = gridSavingsA + simA.yearlyData[i].soldRevenue;

                            gridSavingsB = baseGridCost - simB.yearlyData[i].gridCost;
                            pureBatteryProfitB = gridSavingsB + simB.yearlyData[i].soldRevenue;
                        } else {
                            // メリット ＝ （太陽光のみの電気代 － 蓄電池ありの電気代） － （太陽光のみの売電 － 蓄電池ありの売電）
                            gridSavingsA = baseGridCost - simA.yearlyData[i].gridCost;
                            let soldLossA = (baseSoldRev || 0) - (simA.yearlyData[i].soldRevenue || 0);
                            pureBatteryProfitA = gridSavingsA - soldLossA;

                            gridSavingsB = baseGridCost - simB.yearlyData[i].gridCost;
                            let soldLossB = (baseSoldRev || 0) - (simB.yearlyData[i].soldRevenue || 0);
                            pureBatteryProfitB = gridSavingsB - soldLossB;

                            // 10年目にPCS交換費用のメリットを加算（シナリオ2のみ）
                            if (i === 9 && this.inputs.pcsReplacementCost > 0) {
                                pureBatteryProfitA += this.inputs.pcsReplacementCost;
                                pureBatteryProfitB += this.inputs.pcsReplacementCost;
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

                    this.results = {
                        A: resA, B: resB,
                        baselineCost15Y: baselineCost15Y,
                        baselineSelfConsumptionRate: baseline.year1SelfConsumptionRate,
                        baselineYear1MonthlyGrid: baseline.yearlyData[0].gridCost / 12,
                        year1MonthlyGridA: simA.yearlyData[0].gridCost / 12,
                        year1MonthlyGridB: simB.yearlyData[0].gridCost / 12,
                        baselineYear15MonthlyGrid: baseline.yearlyData[14].gridCost / 12,
                        year15MonthlyGridA: simA.yearlyData[14].gridCost / 12,
                        year15MonthlyGridB: simB.yearlyData[14].gridCost / 12
                    };

                    this.$nextTick(() => {
                        this.renderChart();
                        if (this.inputs.loanA > 0 || this.inputs.loanB > 0) {
                            this.renderLoanChart();
                        }
                    });
                },

                }
};

VueObj.calculateSimulation();
const fs = require('fs');
fs.writeFileSync('out_full.json', JSON.stringify({
    A: {
        yearlyPureAcc: VueObj.results.A.yearlyPureAcc,
        deathYear: VueObj.results.A.deathYear
    },
    B: {
        yearlyPureAcc: VueObj.results.B.yearlyPureAcc,
        deathYear: VueObj.results.B.deathYear
    }
}, null, 2));
