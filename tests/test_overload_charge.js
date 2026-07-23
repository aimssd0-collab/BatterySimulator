const assert = require('assert');

function getDefaultOverloadCharge(model) {
    if (!model) return 1.0;
    const str = model.toString().trim();
    if (str.includes('LUNA2000-4.95-14-N')) return 7.0;
    if (str.includes('LUNA2000-4.95-7-N')) return 3.5;
    if (str.includes('LUNA2000-4.95-21-N')) return 7.0;
    if (str.includes('LUNA2000-4.95-5-N')) return 1.5;
    if (str.includes('LUNA2000-4.95-10-N')) return 3.0;
    if (str.includes('LUNA2000-4.95-15-N')) return 4.5;
    return 1.0;
}

// 1時間あたりの余剰・充電・売電・ピークカット計算関数
function calculateHourlyBalance(yield_h, load_h, pcsOutput, batteryOutput, overloadCharge, currentBatteryLevel, maxCapacity) {
    const P_pcs = pcsOutput;
    const O = (overloadCharge !== undefined && overloadCharge !== null && !isNaN(overloadCharge)) ? Number(overloadCharge) : 1.0;
    const C_max = batteryOutput;
    const Y_cap = P_pcs + O;

    const effectiveYield = Math.min(yield_h, Y_cap);
    const initialPeakCut = yield_h - effectiveYield;

    if (effectiveYield >= load_h) {
        const excess = effectiveYield - load_h;
        const chargeSpace = Math.max(0, maxCapacity - currentBatteryLevel);
        const chargeAmount = Math.min(excess, C_max, chargeSpace);
        const excessAfterCharge = excess - chargeAmount;
        
        const maxSoldCapacity = Math.max(0, P_pcs - load_h);
        const soldAmount = Math.min(excessAfterCharge, maxSoldCapacity);
        const additionalPeakCut = excessAfterCharge - soldAmount;
        const totalPeakCut = initialPeakCut + additionalPeakCut;

        return {
            chargeAmount,
            soldAmount,
            peakCut: totalPeakCut,
            gridBuy: 0
        };
    } else {
        const shortage = load_h - effectiveYield;
        const dischargeAmount = Math.min(shortage, C_max, currentBatteryLevel);
        const gridBuyAmount = shortage - dischargeAmount;
        return {
            chargeAmount: 0,
            soldAmount: 0,
            peakCut: initialPeakCut,
            gridBuy: gridBuyAmount,
            dischargeAmount
        };
    }
}

console.log("--- LUNA2000各機種 デフォルト過積載充電値 テスト ---");
assert.strictEqual(getDefaultOverloadCharge('LUNA2000-4.95-14-N'), 7.0, 'LUNA2000-4.95-14-N は 7kW');
assert.strictEqual(getDefaultOverloadCharge('LUNA2000-4.95-7-N'), 3.5, 'LUNA2000-4.95-7-N は 3.5kW');
assert.strictEqual(getDefaultOverloadCharge('LUNA2000-4.95-21-N'), 7.0, 'LUNA2000-4.95-21-N は 7kW');
assert.strictEqual(getDefaultOverloadCharge('LUNA2000-4.95-5-N'), 1.5, 'LUNA2000-4.95-5-N は 1.5kW');
assert.strictEqual(getDefaultOverloadCharge('LUNA2000-4.95-10-N'), 3.0, 'LUNA2000-4.95-10-N は 3kW');
assert.strictEqual(getDefaultOverloadCharge('LUNA2000-4.95-15-N'), 4.5, 'LUNA2000-4.95-15-N は 4.5kW');
assert.strictEqual(getDefaultOverloadCharge('OTHER-MODEL'), 1.0, '未定義機種は 1kW');
console.log("✅ LUNA2000全6機種のデフォルト判定テストクリア！");

console.log("\n--- 過積載充電単体計算テスト ---");
const pcsOutput = 5;
const batteryOutput = 2;
const load_h = 3;
const batteryLevel = 0;
const maxCap = 10;

let r1 = calculateHourlyBalance(4, load_h, pcsOutput, batteryOutput, 1, batteryLevel, maxCap);
assert.strictEqual(r1.chargeAmount, 1);

let r5 = calculateHourlyBalance(7, load_h, pcsOutput, batteryOutput, 2, batteryLevel, maxCap);
assert.strictEqual(r5.chargeAmount, 2);
assert.strictEqual(r5.soldAmount, 2);
assert.strictEqual(r5.peakCut, 0);

console.log("✅ すべてのテストを通過しました！");
