const fs = require('fs');
const text = fs.readFileSync('./data/電力プラン取り込みフォーマット_新_BOMあり.csv', 'utf8');
const lines = text.split(/\r?\n/);
const plansMap = new Map();
// Skip header
for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    let cols = [];
    let inQuotes = false;
    let current = '';
    for(let char of line) {
        if(char === '\"') inQuotes = !inQuotes;
        else if(char === ',' && !inQuotes) { cols.push(current); current = ''; }
        else current += char;
    }
    cols.push(current);

    if (cols.length >= 5) {
        const price = parseFloat(cols[4]);
        if (isNaN(price)) continue;
        const planName = cols[0].trim();
        const rateName = cols[1].trim() || '時間帯';
        const startHour = parseInt(cols[2], 10);
        const endHour = parseInt(cols[3], 10);
        let surcharge = 3.98;
        let months = 'all';
        let dayType = 'all';
        if (cols.length >= 6 && cols[5].trim() !== '') months = cols[5].trim().replace(/^\"|\"$/g, '');
        if (cols.length >= 7 && cols[6].trim() !== '') dayType = cols[6].trim().replace(/^\"|\"$/g, '');
        if (cols.length >= 8 && cols[7].trim() !== '') {
            const parsedSurcharge = parseFloat(cols[7]);
            if (!isNaN(parsedSurcharge)) surcharge = parsedSurcharge;
        }
        if (!plansMap.has(planName)) {
            plansMap.set(planName, { name: planName, rates: [], renewableSurcharge: surcharge });
        }
        plansMap.get(planName).rates.push({
            name: rateName, startHour, endHour, price, months, dayType
        });
    }
}
fs.writeFileSync('temp_plans.json', JSON.stringify(Array.from(plansMap.values()), null, 4));
console.log('done');
