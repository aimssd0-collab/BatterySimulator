const fs = require('fs');
const html = fs.readFileSync('battery_simulation.html', 'utf8');

const calcMatch = html.match(/calculateSimulation\(\) \{([\s\S]*?)renderChart\(\) \{/);
const runSimMatch = html.match(/runSimulation\(batteryObj\) \{([\s\S]*?)\},[\s\n]*calculateSimulation/);

const script = `
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
    runSimulation: function(batteryObj) {${runSimMatch[1]}},
    calculateSimulation: function() {${calcMatch[1]}}
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
`;

fs.writeFileSync('test_run_vue.js', script);
