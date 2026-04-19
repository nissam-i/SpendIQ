const puppeteer = require('puppeteer');

(async () => {
    let hasError = false;
    const browser = await puppeteer.launch({ 
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
    
    const page = await browser.newPage();
    
    // Capture and throw errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('BROWSER CONSOLE ERROR:', msg.text());
        }
    });
    page.on('pageerror', err => {
        console.log('PAGE ERROR:', err.toString());
        hasError = true;
    });

    await page.evaluateOnNewDocument(() => {
       localStorage.setItem('fintrack_user', JSON.stringify({ name: "Ravi Kumar", email: "demo@spendiq.in" }));
       localStorage.setItem('fintrack_settings', JSON.stringify({ currency: 'INR', alertsEnabled: true }));
    });

    console.log("Navigating to index...");
    await page.goto(`file://C:/report%20project/finance_tracker.html`, { waitUntil: 'networkidle0' });

    const routes = ['#/dashboard', '#/settings', '#/analytics', '#/transactions', '#/budget', '#/investments', '#/reports'];
    
    for (const route of routes) {
        console.log(`Testing route: ${route}`);
        await page.evaluate((r) => {
           window.location.hash = r;
        }, route);
        await new Promise(res => setTimeout(res, 1000));
        
        const html = await page.$eval('#root', el => el.innerHTML);
        if(!html || html.length < 50) {
            console.log(`CRITICAL: Render failed on ${route}. HTML length: ${html?.length}`);
            hasError = true;
        } else {
            console.log(`Rendered ${route}: ${html.substring(0, 40)}`);
        }
    }

    await browser.close();
    if(hasError) process.exit(1);
    console.log("ALL ROUTES RENDERED SUCCESSFULLY.");
})();
