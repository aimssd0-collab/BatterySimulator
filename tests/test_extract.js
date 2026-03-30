const fs = require('fs');
const html = fs.readFileSync('battery_simulation.html', 'utf8');
const jsMatch = html.match(/<script>\s*const \{ createApp \} = Vue([\s\S]*?)<\/script>/);

if (jsMatch) {
    let appConfigStr = jsMatch[1].trim();
    // Remove "createApp(" at the beginning and ")" at the end, and ".mount('#app')"
    appConfigStr = appConfigStr.replace(/^createApp\(/, '').replace(/\)\.mount\('#app'\)$/, '').trim();

    // Evaluate the object
    const appConfig = eval(`(${appConfigStr})`);

    // Mock the context
    const app = {
        ...appConfig.data(),
        ...appConfig.methods,
        ...appConfig.computed,
        $nextTick: (cb) => cb()
    };

    // Bind context
    for (const key in appConfig.methods) {
        app[key] = appConfig.methods[key].bind(app);
    }
    app.currentBattery = app.inputs.batteryA;
    Object.defineProperty(app, 'isValidA', { get: appConfig.computed.isValidA.bind(app) });
    Object.defineProperty(app, 'isValidB', { get: appConfig.computed.isValidB.bind(app) });

    // Mock Chart
    global.Chart = class { destroy() { } };
    global.document = { getElementById: () => ({ getContext: () => ({}), destroy: () => { } }) };
    global.alert = console.log;

    try {
        app.calculateSimulation();
        console.log("Initial calculation: OK");

        // Change battery A
        console.log("Changing battery A to LUNA2000-4.95-7-N...");
        app.applyBattery({ model: 'LUNA2000-4.95-7-N', effectiveCapacity: 6.7, output: 3.5, efficiency: 91.7, lifecycleCapacity: 39086, aiArbitrage: true });

        app.calculateSimulation();
        console.log("Second calculation (after applyBattery): OK");

        // Manually break battery A (clear capacity)
        console.log("Clearing battery A capacity...");
        app.inputs.batteryA.effectiveCapacity = "";
        try {
            app.calculateSimulation();
            console.log("Third calculation (empty capacity): OK");
        } catch (e) {
            console.error("Error on empty capacity:", e);
        }

    } catch (e) {
        console.error("Error during calculation:", e);
    }
}
