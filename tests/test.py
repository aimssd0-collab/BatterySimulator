import json

# I will write a mock of the runSimulation and calculateSimulation methods
import sys

def test_js_logic():
    code = """
function runSimulation() {
    let yearlyData = [];
    for (let year = 1; year <= 15; year++) {
        let selfConsumptionRate = null;
        if (year === 1 && 5000 > 0) {
            selfConsumptionRate = ((5000 - 3000) / 5000) * 100;
        }
        yearlyData.push({
            year: year,
            selfConsumptionRate: selfConsumptionRate
        });
    }
    return { yearlyData: yearlyData, year1SelfConsumptionRate: yearlyData[0].selfConsumptionRate };
}
console.log(runSimulation());
"""
    with open("test.js", "w") as f:
        f.write(code)
test_js_logic()
