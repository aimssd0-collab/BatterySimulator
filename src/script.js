const { createApp } = Vue

        createApp({
            data() {
                return {
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
                            { name: '夜間', startHour: 23, endHour: 7, price: 31.64, months: 'all', dayType: 'all' }
                        ],
                        batteryA: {
                            model: 'LUNA2000-4.95-14-N',
                            effectiveCapacity: 13.4,
                            output: 4.95,
                            overloadCharge: 7.0,
                            efficiency: 91.7,
                            lifecycleCapacity: 78173,
                            aiArbitrage: true
                        },
                        batteryB: {
                            model: '12.7kWh蓄電池',
                            effectiveCapacity: 10.9,
                            output: 5,
                            overloadCharge: 1.0,
                            efficiency: 87.2,
                            lifecycleCapacity: 54084,
                            aiArbitrage: true
                        }
                    },
                    activeTab: 'A',
                    results: null,
                    chartInstance: null,
                    loanChartInstance: null,
                    savedBatteries: [
                        { model: 'LUNA2000-4.95-7-N', effectiveCapacity: 6.7, output: 3.5, overloadCharge: 3.5, efficiency: 91.7, lifecycleCapacity: 39086, aiArbitrage: true },
                        { model: 'LUNA2000-4.95-21-N', effectiveCapacity: 20.1, output: 4.95, overloadCharge: 7.0, efficiency: 91.7, lifecycleCapacity: 117260, aiArbitrage: true }
                    ],
                    showBatteryModal: false,
                    savedPlans: [
                        {
                            "name": "東京電力夜トク８",
                            "rates": [
                                {
                                    "name": "昼間",
                                    "startHour": 7,
                                    "endHour": 23,
                                    "price": 42.6,
                                    "months": "all",
                                    "dayType": "all"
                                },
                                {
                                    "name": "夜間",
                                    "startHour": 23,
                                    "endHour": 7,
                                    "price": 31.64,
                                    "months": "all",
                                    "dayType": "all"
                                }
                            ],
                            "renewableSurcharge": 3.98
                        },
                        {
                            "name": "東京電力夜トク１２",
                            "rates": [
                                {
                                    "name": "昼間",
                                    "startHour": 9,
                                    "endHour": 21,
                                    "price": 44.16,
                                    "months": "all",
                                    "dayType": "all"
                                },
                                {
                                    "name": "夜間",
                                    "startHour": 21,
                                    "endHour": 9,
                                    "price": 33.33,
                                    "months": "all",
                                    "dayType": "all"
                                }
                            ],
                            "renewableSurcharge": 3.98
                        },
                        {
                            "name": "関西電力はぴｅタイムＲ",
                            "rates": [
                                {
                                    "name": "リビングタイム１",
                                    "startHour": 7,
                                    "endHour": 10,
                                    "price": 22.8,
                                    "months": "all",
                                    "dayType": "all"
                                },
                                {
                                    "name": "デイタイム夏季",
                                    "startHour": 10,
                                    "endHour": 17,
                                    "price": 28.87,
                                    "months": "7-9",
                                    "dayType": "all"
                                },
                                {
                                    "name": "デイタイムその他",
                                    "startHour": 10,
                                    "endHour": 17,
                                    "price": 26.24,
                                    "months": "10,11,12,1,2,3,4,5,6",
                                    "dayType": "all"
                                },
                                {
                                    "name": "リビングタイム２",
                                    "startHour": 17,
                                    "endHour": 23,
                                    "price": 22.8,
                                    "months": "all",
                                    "dayType": "all"
                                },
                                {
                                    "name": "ナイトタイム",
                                    "startHour": 23,
                                    "endHour": 7,
                                    "price": 15.37,
                                    "months": "all",
                                    "dayType": "all"
                                }
                            ],
                            "renewableSurcharge": 3.98
                        },
                        {
                            "name": "ほくでんエネとくスマートプラン",
                            "rates": [
                                {
                                    "name": "日中",
                                    "startHour": 8,
                                    "endHour": 22,
                                    "price": 38.22,
                                    "months": "all",
                                    "dayType": "平日"
                                },
                                {
                                    "name": "夜間・日祝",
                                    "startHour": 0,
                                    "endHour": 24,
                                    "price": 29.44,
                                    "months": "all",
                                    "dayType": "休日"
                                },
                                {
                                    "name": "夜間・日祝",
                                    "startHour": 8,
                                    "endHour": 22,
                                    "price": 29.44,
                                    "months": "all",
                                    "dayType": "平日"
                                }
                            ],
                            "renewableSurcharge": 3.98
                        },
                        {
                            "name": "東北電力よりそう＋スマートタイム",
                            "rates": [
                                {
                                    "name": "平日昼間",
                                    "startHour": 8,
                                    "endHour": 22,
                                    "price": 36.86,
                                    "months": "all",
                                    "dayType": "平日"
                                },
                                {
                                    "name": "休日・夜間",
                                    "startHour": 0,
                                    "endHour": 24,
                                    "price": 29.86,
                                    "months": "all",
                                    "dayType": "休日"
                                },
                                {
                                    "name": "休日・夜間",
                                    "startHour": 8,
                                    "endHour": 22,
                                    "price": 29.86,
                                    "months": "all",
                                    "dayType": "平日"
                                }
                            ],
                            "renewableSurcharge": 3.98
                        },
                        {
                            "name": "北陸電力くつろぎナイト１２",
                            "rates": [
                                {
                                    "name": "昼間時間（夏季料金）",
                                    "startHour": 8,
                                    "endHour": 20,
                                    "price": 39.87,
                                    "months": "7-9",
                                    "dayType": "平日"
                                },
                                {
                                    "name": "夜間時間",
                                    "startHour": 20,
                                    "endHour": 8,
                                    "price": 39.87,
                                    "months": "all",
                                    "dayType": "all"
                                },
                                {
                                    "name": "ウィークエンド時間",
                                    "startHour": 20,
                                    "endHour": 8,
                                    "price": 33.8,
                                    "months": "all",
                                    "dayType": "休日"
                                },
                                {
                                    "name": "昼間時間（その他季料金）",
                                    "startHour": 8,
                                    "endHour": 20,
                                    "price": 39.87,
                                    "months": "10,11,12,1,2,3,4,5,6",
                                    "dayType": "平日"
                                }
                            ],
                            "renewableSurcharge": 3.98
                        },
                        {
                            "name": "中部電力スマートライフプラン",
                            "rates": [
                                {
                                    "name": "デイタイム",
                                    "startHour": 10,
                                    "endHour": 17,
                                    "price": 38.8,
                                    "months": "all",
                                    "dayType": "平日"
                                },
                                {
                                    "name": "アットホームタイム平日",
                                    "startHour": 17,
                                    "endHour": 22,
                                    "price": 28.61,
                                    "months": "all",
                                    "dayType": "平日"
                                },
                                {
                                    "name": "ナイトタイム平日",
                                    "startHour": 22,
                                    "endHour": 8,
                                    "price": 16.52,
                                    "months": "all",
                                    "dayType": "平日"
                                },
                                {
                                    "name": "アットホームタイム土日祝日",
                                    "startHour": 8,
                                    "endHour": 22,
                                    "price": 28.61,
                                    "months": "all",
                                    "dayType": "休日"
                                },
                                {
                                    "name": "ナイトタイム土日祝日",
                                    "startHour": 22,
                                    "endHour": 8,
                                    "price": 16.52,
                                    "months": "all",
                                    "dayType": "休日"
                                }
                            ],
                            "renewableSurcharge": 3.98
                        },
                        {
                            "name": "中国電力電化Styleコース",
                            "rates": [
                                {
                                    "name": "デイタイム夏季",
                                    "startHour": 9,
                                    "endHour": 21,
                                    "price": 46.46,
                                    "months": "7-9",
                                    "dayType": "平日"
                                },
                                {
                                    "name": "デイタイムその他",
                                    "startHour": 9,
                                    "endHour": 21,
                                    "price": 44.4,
                                    "months": "10,11,12,1,2,3,4,5,6",
                                    "dayType": "平日"
                                },
                                {
                                    "name": "ナイトタイム",
                                    "startHour": 21,
                                    "endHour": 9,
                                    "price": 30.35,
                                    "months": "all",
                                    "dayType": "平日"
                                },
                                {
                                    "name": "ホリデータイム",
                                    "startHour": 0,
                                    "endHour": 24,
                                    "price": 30.35,
                                    "months": "all",
                                    "dayType": "休日"
                                }
                            ],
                            "renewableSurcharge": 3.98
                        },
                        {
                            "name": "中国電力ナイトホリデーコース",
                            "rates": [
                                {
                                    "name": "デイタイム夏季",
                                    "startHour": 9,
                                    "endHour": 21,
                                    "price": 49.44,
                                    "months": "7-9",
                                    "dayType": "平日"
                                },
                                {
                                    "name": "デイタイムその他",
                                    "startHour": 9,
                                    "endHour": 21,
                                    "price": 46.98,
                                    "months": "10,11,12,1,2,3,4,5,6",
                                    "dayType": "平日"
                                },
                                {
                                    "name": "ナイトタイム",
                                    "startHour": 21,
                                    "endHour": 9,
                                    "price": 34.65,
                                    "months": "all",
                                    "dayType": "平日"
                                },
                                {
                                    "name": "ホリデータイム",
                                    "startHour": 0,
                                    "endHour": 24,
                                    "price": 34.65,
                                    "months": "all",
                                    "dayType": "休日"
                                }
                            ],
                            "renewableSurcharge": 3.98
                        },
                        {
                            "name": "四国電力でんかeプラン",
                            "rates": [
                                {
                                    "name": "平日昼間",
                                    "startHour": 9,
                                    "endHour": 23,
                                    "price": 42.97,
                                    "months": "all",
                                    "dayType": "平日"
                                },
                                {
                                    "name": "休日",
                                    "startHour": 0,
                                    "endHour": 24,
                                    "price": 33.98,
                                    "months": "all",
                                    "dayType": "休日"
                                },
                                {
                                    "name": "平日夜間",
                                    "startHour": 23,
                                    "endHour": 9,
                                    "price": 33.98,
                                    "months": "all",
                                    "dayType": "平日"
                                }
                            ],
                            "renewableSurcharge": 3.98
                        },
                        {
                            "name": "九州電力電化でナイト・セレクト",
                            "rates": [
                                {
                                    "name": "平日昼間夏・冬",
                                    "startHour": 8,
                                    "endHour": 22,
                                    "price": 27.63,
                                    "months": "1,2,7,8,9,12",
                                    "dayType": "平日"
                                },
                                {
                                    "name": "平日昼間春・秋",
                                    "startHour": 8,
                                    "endHour": 22,
                                    "price": 24.74,
                                    "months": "3,4,5,6,10,11",
                                    "dayType": "平日"
                                },
                                {
                                    "name": "夜間",
                                    "startHour": 22,
                                    "endHour": 8,
                                    "price": 14.59,
                                    "months": "all",
                                    "dayType": "all"
                                },
                                {
                                    "name": "休日昼間夏・冬",
                                    "startHour": 8,
                                    "endHour": 22,
                                    "price": 22.01,
                                    "months": "1,2,7,8,9,12",
                                    "dayType": "休日"
                                },
                                {
                                    "name": "休日昼間春・秋",
                                    "startHour": 8,
                                    "endHour": 22,
                                    "price": 18.61,
                                    "months": "3,4,5,6,10,11",
                                    "dayType": "休日"
                                }
                            ],
                            "renewableSurcharge": 3.98
                        },
                        {
                            "name": "沖縄電力Eeスマート",
                            "rates": [
                                {
                                    "name": "昼間時間",
                                    "startHour": 7,
                                    "endHour": 23,
                                    "price": 45.32,
                                    "months": "all",
                                    "dayType": "all"
                                },
                                {
                                    "name": "夜間時間",
                                    "startHour": 23,
                                    "endHour": 7,
                                    "price": 34.77,
                                    "months": "all",
                                    "dayType": "all"
                                }
                            ],
                            "renewableSurcharge": 3.98
                        }
                    ],
                    showPlanModal: false,
                    rateError: ''
                }
            },
            computed: {
                currentBattery: {
                    get() { return this.activeTab === 'A' ? this.inputs.batteryA : this.inputs.batteryB; },
                    set(val) { if (this.activeTab === 'A') this.inputs.batteryA = val; else this.inputs.batteryB = val; }
                },
                isValidA() { return this.isBatteryValid(this.inputs.batteryA); },
                isValidB() { return this.isBatteryValid(this.inputs.batteryB); }
            },
            methods: {
                getDefaultOverloadCharge(model) {
                    if (!model) return 1.0;
                    const str = model.toString().trim();
                    if (str.includes('LUNA2000-4.95-14-N')) return 7.0;
                    if (str.includes('LUNA2000-4.95-7-N')) return 3.5;
                    if (str.includes('LUNA2000-4.95-21-N')) return 7.0;
                    if (str.includes('LUNA2000-4.95-5-N')) return 1.5;
                    if (str.includes('LUNA2000-4.95-10-N')) return 3.0;
                    if (str.includes('LUNA2000-4.95-15-N')) return 4.5;
                    return 1.0;
                },
                isBatteryValid(bat) {
                    if (!bat) return false;
                    if (!bat.model || bat.model.toString().trim() === '') return false;
                    if (typeof bat.effectiveCapacity !== 'number' || isNaN(bat.effectiveCapacity) || bat.effectiveCapacity <= 0) return false;
                    if (typeof bat.output !== 'number' || isNaN(bat.output) || bat.output <= 0) return false;
                    if (typeof bat.efficiency !== 'number' || isNaN(bat.efficiency) || bat.efficiency <= 0 || bat.efficiency > 100) return false;
                    if (typeof bat.lifecycleCapacity !== 'number' || isNaN(bat.lifecycleCapacity) || bat.lifecycleCapacity <= 0) return false;
                    if (bat.overloadCharge === undefined || bat.overloadCharge === null || isNaN(bat.overloadCharge) || bat.overloadCharge < 0) {
                        bat.overloadCharge = this.getDefaultOverloadCharge(bat.model);
                    }
                    return true;
                },
                formatNumber(num) { return Math.round(num).toLocaleString(); },
                loadSavedData() {
                    const savedBat = localStorage.getItem('savedBatteryList3');
                    if (savedBat) {
                        try { this.savedBatteries = JSON.parse(savedBat); } catch (e) { }
                    } else {
                        
                        localStorage.setItem('savedBatteryList3', JSON.stringify(this.savedBatteries));
                    }
                    const savedPl = localStorage.getItem('savedPlanList');
                    if (savedPl) {
                        try { this.savedPlans = JSON.parse(savedPl); } catch (e) { }
                    }
                },
                saveCurrentBattery() {
                    const bat = JSON.parse(JSON.stringify(this.currentBattery));
                    this.savedBatteries.push(bat);
                    localStorage.setItem('savedBatteryList3', JSON.stringify(this.savedBatteries));
                    alert("done");
                },
                applyBattery(bat) {
                    if (this.activeTab === 'A') {
                        this.inputs.batteryA = JSON.parse(JSON.stringify(bat));
                    } else {
                        this.inputs.batteryB = JSON.parse(JSON.stringify(bat));
                    }
                    this.showBatteryModal = false;
                },
                deleteBattery(index) {
                    if (confirm("are you sure?")) {
                        this.savedBatteries.splice(index, 1);
                        localStorage.setItem('savedBatteryList3', JSON.stringify(this.savedBatteries));
                    }
                },
                importBatteryCSV(event) {
                    const file = event.target.files[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const text = e.target.result;
                        const lines = text.split(/\r?\n/);
                        let importedCount = 0;

                        for (let i = 0; i < lines.length; i++) {
                            const line = lines[i].trim();
                            if (!line) continue;
                            const cols = line.split(',');
                            if (cols.length >= 5) {
                                const effectiveCapacity = parseFloat(cols[1]);
                                if (isNaN(effectiveCapacity)) continue;

                                const model = cols[0].trim();
                                const output = parseFloat(cols[2]);
                                const efficiency = parseFloat(cols[3]);
                                const lifecycleCapacity = parseFloat(cols[4]);
                                let overloadCharge = this.getDefaultOverloadCharge(model);
                                if (cols.length > 6 && cols[6] && !isNaN(parseFloat(cols[6]))) {
                                    overloadCharge = parseFloat(cols[6]);
                                } else if (cols.length > 5 && !isNaN(parseFloat(cols[5]))) {
                                    overloadCharge = parseFloat(cols[5]);
                                }
                                let aiArbitrage = true;
                                if (cols.length > 5 && cols[5]) {
                                    const aiStr = cols[5].trim().toLowerCase();
                                    if (aiStr === '0' || aiStr === 'false' || aiStr === 'none' || aiStr === 'なし') {
                                        aiArbitrage = false;
                                    }
                                }
                                const bat = { model, effectiveCapacity, output, overloadCharge, efficiency, lifecycleCapacity, aiArbitrage };
                                if (this.isBatteryValid(bat)) {
                                    this.savedBatteries.push(bat);
                                    importedCount++;
                                }
                            }
                        }
                        if (importedCount > 0) {
                            localStorage.setItem('savedBatteryList3', JSON.stringify(this.savedBatteries));
                            alert("done");
                        } else {
                            alert("done");
                        }
                        event.target.value = ''; 
                    };
                    reader.readAsText(file, 'UTF-8');
                },
                importPlanCSV(event) {
                    const file = event.target.files[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const text = e.target.result;
                        const lines = text.split(/\r?\n/);
                        const plansMap = new Map();
                        let importedCount = 0;

                        
                        
                        
                        
                        
                        
                        for (let i = 0; i < lines.length; i++) {
                            const line = lines[i].trim();
                            if (!line) continue;
                            const cols = line.split(',');
                            if (cols.length >= 5) {
                                const price = parseFloat(cols[4]);
                                if (isNaN(price)) continue; 

                                const planName = cols[0].trim();
                                if (!planName) continue;

                                const rateName = cols[1].trim() || '時間帯';
                                const startHour = parseInt(cols[2], 10);
                                const endHour = parseInt(cols[3], 10);

                                if (isNaN(startHour) || isNaN(endHour) || startHour < 0 || startHour > 23 || endHour < 1 || endHour > 24) continue;

                                let surcharge = 3.98; 
                                let months = 'all';
                                let dayType = 'all';
                                if (cols.length >= 6 && cols[5].trim() !== '') {
                                    months = cols[5].trim();
                                    if (months.match(/^(\d+)月(\d+)日$/)) {
                                        months = months.replace(/^(\d+)月(\d+)日$/, '$1-$2');
                                    }
                                }
                                if (cols.length >= 7 && cols[6].trim() !== '') dayType = cols[6].trim();

                                if (cols.length >= 8 && cols[7].trim() !== '') {
                                    const parsedSurcharge = parseFloat(cols[7]);
                                    if (!isNaN(parsedSurcharge)) surcharge = parsedSurcharge;
                                } else if (cols.length >= 6 && !isNaN(parseFloat(cols[5]))) {
                                    
                                    const parsedSurcharge = parseFloat(cols[5]);
                                    if (!isNaN(parsedSurcharge)) {
                                        surcharge = parsedSurcharge;
                                        months = 'all';
                                    }
                                }

                                if (!plansMap.has(planName)) {
                                    plansMap.set(planName, {
                                        name: planName,
                                        rates: [],
                                        renewableSurcharge: surcharge
                                    });
                                }

                                const plan = plansMap.get(planName);
                                plan.rates.push({
                                    name: rateName,
                                    startHour: startHour,
                                    endHour: endHour,
                                    price: price,
                                    months: months,
                                    dayType: dayType
                                });
                            }
                        }

                        
                        for (const plan of plansMap.values()) {
                            
                            if (plan.rates.length > 0) {
                                this.savedPlans.push(plan);
                                importedCount++;
                            }
                        }

                        if (importedCount > 0) {
                            localStorage.setItem('savedPlanList', JSON.stringify(this.savedPlans));
                            alert("done");
                        } else {
                            alert("done");
                        }
                        event.target.value = '';
                    };
                    reader.readAsText(file, 'UTF-8');
                },
                addRate() {
                    this.inputs.rates.push({ name: '新規時間帯', startHour: 10, endHour: 15, price: 30, months: 'all', dayType: 'all' });
                    this.validateRates();
                },
                removeRate(index) {
                    this.inputs.rates.splice(index, 1);
                    this.validateRates();
                },

                saveCurrentPlan() {
                    if (this.rateError) {
                        alert("done");
                        return;
                    }
                    const name = prompt("保存する�Eラン名を入力してください", "新しいプラン");
                    if (!name) return;

                    const plan = {
                        name: name,
                        rates: JSON.parse(JSON.stringify(this.inputs.rates)),
                        renewableSurcharge: this.inputs.renewableSurcharge
                    };
                    this.savedPlans.push(plan);
                    localStorage.setItem('savedPlanList', JSON.stringify(this.savedPlans));
                    alert("done");
                },
                applyPlan(plan) {
                    this.inputs.rates = JSON.parse(JSON.stringify(plan.rates));
                    this.inputs.renewableSurcharge = plan.renewableSurcharge;
                    this.showPlanModal = false;
                    this.validateRates();
                },
                deletePlan(index) {
                    if (confirm("are you sure?")) {
                        this.savedPlans.splice(index, 1);
                        localStorage.setItem('savedPlanList', JSON.stringify(this.savedPlans));
                    }
                },

                validateRates() {
                    this.rateError = '';
                    let coverage = new Array(24).fill(0);

                    for (let rate of this.inputs.rates) {
                        if (rate.startHour === rate.endHour) continue;

                        let h = rate.startHour;
                        while (h !== rate.endHour) {
                            coverage[h]++;
                            h = (h + 1) % 24;
                        }
                    }

                    let overlaps = [];
                    let missing = [];
                    for (let i = 0; i < 24; i++) {
                        if (coverage[i] > 1) overlaps.push(`${i}:00~${i + 1}:00`);
                        if (coverage[i] === 0) missing.push(`${i}:00~${i + 1}:00`);
                    }

                    if (overlaps.length > 0) {
                        this.rateError = `時間が重褁E��てぁE��す。正しく計算できません: ${overlaps.slice(0, 3).join(', ')}${overlaps.length > 3 ? '...' : ''}`;
                    } else if (missing.length > 0) {
                        this.rateError = `時間が設定されてぁE��ぁE��白の帯域がありまぁE ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? '...' : ''}`;
                    }
                },

                getPriceForHour(hour, month, isDayOff, yearIndex) {
                    let matchingRate = this.inputs.rates.find(rate => {
                        let okMonth = true;
                        if (rate.months && rate.months !== 'all' && rate.months !== 'すべて') {
                            const mStr = String(rate.months).replace('月', ''); 
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
                    
                    let inflatedPrice = basePrice * Math.pow(1 + (this.inputs.inflationRate / 100), yearIndex);
                    
                    return inflatedPrice + this.inputs.renewableSurcharge;
                },

                getLowestPrice(month, isDayOff, yearIndex) {
                    let minPrice = 999;
                    for (let h = 0; h < 24; h++) {
                        let p = this.getPriceForHour(h, month, isDayOff, yearIndex);
                        if (p < minPrice) minPrice = p;
                    }
                    return minPrice;
                },

                getHighestPrice(month, isDayOff, yearIndex) {
                    let maxPrice = 0;
                    for (let h = 0; h < 24; h++) {
                        let p = this.getPriceForHour(h, month, isDayOff, yearIndex);
                        if (p > maxPrice) maxPrice = p;
                    }
                    return maxPrice;
                },

                runSimulation(batteryObj) {
                    const dailyProdBase = this.inputs.annualProduction / 365;
                    const dailyConsBase = this.inputs.annualConsumption / 365;
                    const eff = (batteryObj ? (batteryObj.efficiency || 100) / 100 : 1.0);
                    const pcsLossRate = (1 - eff) / 2; // PCS変換ロス率は蓄電池ロスの半分
                    const maxCapOriginal = batteryObj ? (batteryObj.effectiveCapacity || 0) : 0;
                    const maxOut = batteryObj ? (batteryObj.output || 999) : 0;          // PCS定格出力（売電・負荷給電上限）
                    const maxBatOut = batteryObj ? (batteryObj.batteryOutput !== undefined && batteryObj.batteryOutput !== null && !isNaN(batteryObj.batteryOutput) && batteryObj.batteryOutput > 0 ? Number(batteryObj.batteryOutput) : (batteryObj.output || 999)) : 0; // 蓄電池充放電能力
                    const defaultOverload = batteryObj ? this.getDefaultOverloadCharge(batteryObj.model) : 1.0;
                    const overloadCharge = batteryObj ? (batteryObj.overloadCharge !== undefined && batteryObj.overloadCharge !== null && !isNaN(batteryObj.overloadCharge) ? Number(batteryObj.overloadCharge) : defaultOverload) : 0;
                    const lifecycleLimit = batteryObj ? (batteryObj.lifecycleCapacity || 9999999) : 9999999;
                    const hasAiArbitrage = batteryObj ? batteryObj.aiArbitrage : false;

                    // 山形発電モデル（6:00〜18:00の正弦波プロファイル）
                    const solarProfile = (function() {
                        const weights = new Array(24).fill(0);
                        let sum = 0;
                        for (let h = 6; h < 18; h++) {
                            const w = Math.sin((h - 6 + 0.5) / 12 * Math.PI);
                            weights[h] = w;
                            sum += w;
                        }
                        return weights.map(w => w / sum);
                    })();

                    let yearlyData = [];
                    let totalDischargedKwh = 0;
                    let deathYear = null;

                    let firstYearSelfConsKwh = 0;
                    let firstYearSoldKwh = 0;
                    let firstYearLossKwh = 0;
                    let firstYearPeakCutKwh = 0;

                    for (let year = 1; year <= 15; year++) {
                        let maxCapThisYear = (totalDischargedKwh >= lifecycleLimit) ? 0 : maxCapOriginal;
                        if (maxCapThisYear === 0 && deathYear === null) {
                            deathYear = year;
                        }

                        let annualGridCostStandard = 0;
                        let annualSoldStandardKwh = 0;
                        let annualGridCostNoSolarNoBattery = 0;
                        let annualBatteryConsumed = 0;
                        let arbitrageBonusCostReduction = 0;
                        let arbitrageDischargedKwh = 0;
                        let batteryLevel = 0;

                        // 各月の日数と休日数の目安 (土日祝 + お盆年末年始などを加味し 年間120日休日想定)
                        const monthData = [
                            { m: 1, days: 31, off: 12 },
                            { m: 2, days: 28, off: 10 },
                            { m: 3, days: 31, off: 10 },
                            { m: 4, days: 30, off: 10 },
                            { m: 5, days: 31, off: 13 },
                            { m: 6, days: 30, off: 8 },
                            { m: 7, days: 31, off: 10 },
                            { m: 8, days: 31, off: 11 },
                            { m: 9, days: 30, off: 10 },
                            { m: 10, days: 31, off: 10 },
                            { m: 11, days: 30, off: 10 },
                            { m: 12, days: 31, off: 10 }
                        ];

                        // 月別季節変動係数の定義
                        // 太陽光発電: 春〜初夏(4〜5月)が高く、冬(12〜1月)が低い
                        const rawSolarCoeffs = [0.78, 0.90, 1.08, 1.25, 1.35, 1.05, 1.10, 1.18, 0.95, 0.88, 0.75, 0.73];
                        // 消費電力: 冬(1〜2月:暖房)・夏(7〜8月:冷房)が高く、春・秋(4〜5,10月)が低い
                        const rawConsCoeffs  = [1.25, 1.22, 1.05, 0.85, 0.80, 0.88, 1.12, 1.20, 0.98, 0.82, 0.90, 1.13];

                        // 年間合計量が入力値と厳密に一致するよう正規化
                        const totalSolarWeight = monthData.reduce((sum, md) => sum + rawSolarCoeffs[md.m - 1] * md.days, 0);
                        const solarNorm = 365 / totalSolarWeight;
                        const totalConsWeight  = monthData.reduce((sum, md) => sum + rawConsCoeffs[md.m - 1] * md.days, 0);
                        const consNorm  = 365 / totalConsWeight;

                        for (let md of monthData) {
                            let month = md.m;
                            let offDays = md.off;
                            let workDays = md.days - offDays;

                            let dailyProd = dailyProdBase * rawSolarCoeffs[month - 1] * solarNorm;
                            let dailyCons = dailyConsBase * rawConsCoeffs[month - 1] * consNorm;

                            for (let isOff of [false, true]) {
                                let daysCount = isOff ? offDays : workDays;
                                if (daysCount <= 0) continue;

                                let dailyGridCost = 0;
                                let dailySold = 0;
                                let dailyBatteryConsumed = 0;
                                let dailyGridCostNoSolarNoBattery = 0;
                                let dailySelfCons = 0;
                                let dailySoldKwh = 0;
                                let dailyLossKwh = 0;
                                let dailyPeakCutKwh = 0;

                                // 安定化のために2日回して2日目を採用
                                let tempBatteryLevel = batteryLevel;
                                for (let d = 0; d < 2; d++) {
                                    if (d === 1) { 
                                        dailyGridCost = 0; 
                                        dailySold = 0; 
                                        dailyBatteryConsumed = 0; 
                                        dailyGridCostNoSolarNoBattery = 0;
                                        dailySelfCons = 0;
                                        dailySoldKwh = 0;
                                        dailyLossKwh = 0;
                                        dailyPeakCutKwh = 0;
                                    }

                                    for (let h = 0; h < 24; h++) {
                                        let load_h = 0;
                                        if (h < 8) load_h = (dailyCons * 0.2) / 8;
                                        else if (h < 16) load_h = (dailyCons * 0.4) / 8;
                                        else load_h = (dailyCons * 0.4) / 8;

                                        let yield_h = dailyProd * solarProfile[h];
                                        const price_h = this.getPriceForHour(h, year - 1, month, isOff);

                                        // 過積載充電を考慮した太陽光受容上限電力（PCS出力 + 過積載分）
                                        const Y_cap = batteryObj ? (maxOut + overloadCharge) : maxOut;
                                        const effectiveYield = Math.min(yield_h, Y_cap);

                                        let selfCons_h = 0;
                                        let sold_h = 0;
                                        let loss_h = 0;

                                        if (effectiveYield >= load_h) {
                                            let directYield = load_h;
                                            let directSelfCons = directYield * (1 - pcsLossRate);
                                            let directLoss = directYield * pcsLossRate;

                                            let excess = effectiveYield - load_h;
                                            let chargeSpace = Math.max(0, maxCapThisYear - tempBatteryLevel);
                                            let chargeAmount = Math.min(excess, maxBatOut, chargeSpace); // 充電は蓄電池充放電能力で制限
                                            tempBatteryLevel += chargeAmount * eff;

                                            let excessAfterCharge = excess - chargeAmount;
                                            // AC出力上限（PCS定格出力 maxOut）の制約：負荷給電で load_h 使用中のため、PCSからの売電上限は max(0, maxOut - load_h)
                                            let maxSoldCapacity = Math.max(0, maxOut - load_h);
                                            let soldYield = Math.min(excessAfterCharge, maxSoldCapacity);
                                            let soldAmount = soldYield * (1 - pcsLossRate);
                                            let soldLoss = soldYield * pcsLossRate;

                                            let batterySelfCons = chargeAmount * eff;
                                            let chargeLoss = chargeAmount * (1 - eff);

                                            selfCons_h = directSelfCons + batterySelfCons;
                                            sold_h = soldAmount;
                                            loss_h = directLoss + chargeLoss + soldLoss;

                                            if (d === 1) dailySold += soldAmount;
                                        } else {
                                            let directYield = effectiveYield;
                                            let directSelfCons = directYield * (1 - pcsLossRate);
                                            let directLoss = directYield * pcsLossRate;

                                            selfCons_h = directSelfCons;
                                            sold_h = 0;
                                            loss_h = directLoss;

                                            let shortage = load_h - effectiveYield;
                                            let dischargeAmount = Math.min(shortage, maxBatOut, tempBatteryLevel); // 放電は蓄電池充放電能力で制限
                                            tempBatteryLevel -= dischargeAmount;
                                            if (d === 1) dailyBatteryConsumed += dischargeAmount;
                                            let gridBuyAmount = shortage - dischargeAmount;
                                            if (d === 1) dailyGridCost += gridBuyAmount * price_h;
                                        }

                                        if (d === 1) {
                                            let peakCut_h = Math.max(0, yield_h - (selfCons_h + sold_h + loss_h));
                                            dailySelfCons += selfCons_h;
                                            dailySoldKwh += sold_h;
                                            dailyLossKwh += loss_h;
                                            dailyPeakCutKwh += peakCut_h;
                                        }

                                        if (d === 1 && !batteryObj) {
                                            dailyGridCostNoSolarNoBattery += load_h * price_h;
                                        }
                                    }
                                }
                                batteryLevel = tempBatteryLevel;

                                annualGridCostStandard += dailyGridCost * daysCount;
                                annualSoldStandardKwh += dailySold * daysCount;
                                annualGridCostNoSolarNoBattery += dailyGridCostNoSolarNoBattery * daysCount;
                                annualBatteryConsumed += dailyBatteryConsumed * daysCount;

                                if (year === 1) {
                                    firstYearSelfConsKwh += dailySelfCons * daysCount;
                                    firstYearSoldKwh += dailySoldKwh * daysCount;
                                    firstYearLossKwh += dailyLossKwh * daysCount;
                                    firstYearPeakCutKwh += dailyPeakCutKwh * daysCount;
                                }

                                // アービトラージ計算 (年間約100日想定 -> 各月に按分)
                                if (hasAiArbitrage && maxCapThisYear > 0) {
                                    let lowest = this.getLowestPrice(year - 1, month, isOff);
                                    let highest = this.getHighestPrice(year - 1, month, isOff);
                                    if (highest > lowest) {
                                        // 全体の稼働日割合で按分（年間100日が12ヶ月に平準化される想定）
                                        let arbitrageDays = (daysCount / 365) * 100;
                                        let chargeVolume = maxCapThisYear;
                                        let extraNightCost = (chargeVolume / eff) * lowest;
                                        let savedDayCost = chargeVolume * highest;

                                        let dailyArbitrageProfit = savedDayCost - extraNightCost;
                                        if (dailyArbitrageProfit > 0) {
                                            arbitrageBonusCostReduction += dailyArbitrageProfit * arbitrageDays;
                                            arbitrageDischargedKwh += chargeVolume * arbitrageDays;
                                        }
                                    }
                                }
                            }
                        }

                        const finalGridCost = Math.max(0, annualGridCostStandard - arbitrageBonusCostReduction);
                        const finalDischargedKwh = annualBatteryConsumed + arbitrageDischargedKwh;

                        let sellPrice = year <= this.inputs.sellPriceFirstPeriodYears ? this.inputs.sellPriceFirstPeriod : this.inputs.sellPriceSecondPeriod;
                        let finalSoldRevenue = annualSoldStandardKwh * sellPrice;

                        totalDischargedKwh += finalDischargedKwh;

                        yearlyData.push({
                            year: year,
                            gridCost: finalGridCost,
                            soldRevenue: finalSoldRevenue,
                            dischargedKwh: finalDischargedKwh,
                            gridCostNoSolarNoBattery: annualGridCostNoSolarNoBattery
                        });
                    }

                    const annualProdTotal = this.inputs.annualProduction || (firstYearSelfConsKwh + firstYearSoldKwh + firstYearLossKwh + firstYearPeakCutKwh);
                    const selfPct = annualProdTotal > 0 ? (firstYearSelfConsKwh / annualProdTotal) * 100 : 0;
                    const sellPct = annualProdTotal > 0 ? (firstYearSoldKwh / annualProdTotal) * 100 : 0;
                    const lossPct = annualProdTotal > 0 ? (firstYearLossKwh / annualProdTotal) * 100 : 0;
                    const peakCutPct = annualProdTotal > 0 ? Math.max(0, 100 - selfPct - sellPct - lossPct) : 0;

                    return {
                        yearlyData: yearlyData,
                        deathYear: deathYear,
                        solarBreakdown: {
                            selfKwh: firstYearSelfConsKwh,
                            selfPct: selfPct,
                            sellKwh: firstYearSoldKwh,
                            sellPct: sellPct,
                            lossKwh: firstYearLossKwh,
                            lossPct: lossPct,
                            peakCutKwh: firstYearPeakCutKwh,
                            peakCutPct: peakCutPct,
                            totalKwh: annualProdTotal
                        }
                    };
                },

                calculateSimulation() {
                    this.validateRates();
                    if (this.rateError) {
                        alert("done");
                        return; 
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

                        if (this.inputs.scenario === '1') {
                            
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

                renderChart() {
                    if (this.chartInstance) this.chartInstance.destroy();
                    const ctx = document.getElementById('compareChart').getContext('2d');

                    this.chartInstance = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: Array.from({ length: 15 }, (_, i) => (i + 1) + '年目'),
                            datasets: [
                                ...(this.isValidA ? [{ label: `【蓄電池A、E${this.inputs.batteryA.model}`, data: this.results.A.yearlyPureAcc, backgroundColor: Array.from({ length: 15 }, (_, i) => (this.results.A.deathYear && (i + 1) >= this.results.A.deathYear) ? '#cbd5e1' : '#3b82f6'), borderRadius: 4 }] : []),
                                ...(this.isValidB ? [{ label: `【蓄電池B、E${this.inputs.batteryB.model}`, data: this.results.B.yearlyPureAcc, backgroundColor: Array.from({ length: 15 }, (_, i) => (this.results.B.deathYear && (i + 1) >= this.results.B.deathYear) ? '#cbd5e1' : '#f59e0b'), borderRadius: 4 }] : [])
                            ]
                        },
                        options: {
                            responsive: true, maintainAspectRatio: false,
                            interaction: { mode: 'index', intersect: false },
                            plugins: {
                                datalabels: { display: false },
                                tooltip: {
                                    callbacks: {
                                        label: (context) => {
                                            let label = context.dataset.label;
                                            let isDeadA = context.datasetIndex === 0 && this.results.A.deathYear && (context.dataIndex + 1) >= this.results.A.deathYear;
                                            let isDeadB = context.datasetIndex === 1 && this.results.B.deathYear && (context.dataIndex + 1) >= this.results.B.deathYear;
                                            if (isDeadA || isDeadB) {
                                                label += "";
                                            }
                                            return label + ": " + Math.round(context.parsed.y).toLocaleString();
                                        }
                                    }
                                }
                            },
                            scales: { y: { ticks: { callback: function (value) { return value.toLocaleString(); } } } }
                        }
                    });
                },

                renderLoanChart() {
                    if (this.loanChartInstance) this.loanChartInstance.destroy();
                    let chartEl = document.getElementById('loanChart');
                    if (!chartEl) return;
                    const ctx = chartEl.getContext('2d');

                    let chartLabels = ['1年目', '15年目'];
                    let datasets = [];

                    
                    datasets.push({
                        label: '太陽光のみ（残りの電気代）',
                        data: [this.results.baselineYear1MonthlyGrid, this.results.baselineYear15MonthlyGrid],
                        backgroundColor: '#94a3b8', 
                        stack: 'Baseline'
                    });

                    
                    if (this.isValidA && this.inputs.loanA > 0) {
                        datasets.push({
                            label: '【電池A】導E後（残りの電気代',
                            data: [this.results.year1MonthlyGridA, this.results.year15MonthlyGridA],
                            backgroundColor: ['#93c5fd', (this.results.A.deathYear && this.results.A.deathYear <= 15) ? '#cbd5e1' : '#93c5fd'],
                            stack: 'Battery A'
                        });
                        datasets.push({
                            label: '【電池A】導�E後（ローン等返済！',
                            data: [this.inputs.loanA, 0], 
                            backgroundColor: '#3b82f6', 
                            stack: 'Battery A'
                        });
                    }

                    
                    if (this.isValidB && this.inputs.loanB > 0) {
                        datasets.push({
                            label: '【電池B】導�E後（残りの電気代�E�',
                            data: [this.results.year1MonthlyGridB, this.results.year15MonthlyGridB],
                            backgroundColor: ['#fcd34d', (this.results.B.deathYear && this.results.B.deathYear <= 15) ? '#cbd5e1' : '#fcd34d'],
                            stack: 'Battery B'
                        });
                        datasets.push({
                            label: '【電池B】導�E後（ローン等返済！',
                            data: [this.inputs.loanB, 0], 
                            backgroundColor: '#f59e0b', 
                            stack: 'Battery B'
                        });
                    }

                    this.loanChartInstance = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: chartLabels,
                            datasets: datasets
                        },
                        options: {
                            responsive: true, maintainAspectRatio: false,
                            plugins: {
                                datalabels: {
                                    color: '#1e293b',
                                    font: { weight: 'bold', size: 14 },
                                    formatter: function (value) {
                                        return value > 0 ? Math.round(value).toLocaleString() : '';
                                    }
                                },
                                title: { display: true, text: '導入前と導入後の「月々の家計の出費（1年目 vs 15年目）」比較', font: { size: 14 } },
                                tooltip: {
                                    callbacks: {
                                        label: (context) => {
                                            let label = context.dataset.label;
                                            if (context.dataIndex === 1) {
                                                if (context.dataset.stack === 'Battery A' && this.results.A.deathYear && this.results.A.deathYear <= 15) {
                                                    label += "";
                                                }
                                                if (context.dataset.stack === 'Battery B' && this.results.B.deathYear && this.results.B.deathYear <= 15) {
                                                    label += "";
                                                }
                                            }
                                            return label + ": " + Math.round(context.parsed.y).toLocaleString();
                                        }
                                    }
                                }
                            },
                            scales: {
                                x: { stacked: true },
                                y: { stacked: true, title: { display: true, text: '月、E�E総負拁E��E(冁E' }, ticks: { callback: function (value) { return value.toLocaleString(); } } }
                            }
                        }
                    });
                }
            },
            mounted() {
                this.loadSavedData();
                this.validateRates();
                this.calculateSimulation();
            }
        }).mount('#app')
    
