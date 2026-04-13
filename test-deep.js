const puppeteer = require('puppeteer-core');
const http = require('http');
const fs = require('fs');
const path = require 'path');

(async () => {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await puppeteer.launch({ headless: true, executablePath: edgePath });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, req.url === '/' ? 'quotation.html' : req.url);
    const ext = path.extname(filePath).slice(1);
    const types = { html: 'text/html', js: 'application/javascript' };
    try {
      const data = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': (types[ext] || 'text/plain') + '; charset=utf-8' });
      res.end(data);
    } catch(e) {
      res.writeHead(404);
      res.end('Not found');
    }
  });
  server.listen(9882);

  await page.goto('http://localhost:9882/', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1000));

  // Click new quotation
  await page.click('button.sidebar-btn');
  await new Promise(r => setTimeout(r, 500));

  const deepInfo = await page.evaluate(() => {
    const appMain = document.getElementById('appMain');
    const qv = document.getElementById('quotationView');

    // Check parent-child relationship
    const isChild = appMain.contains(qv);
    const parentTag = qv.parentElement ? qv.parentElement.id : 'NO PARENT';

    // Check all computed styles
    const styles = {};
    const importantProps = ['display','position','width','height','min-width','min-height',
      'max-width','max-height','overflow','overflow-y','visibility','opacity',
      'float','clear','flex','flex-grow','flex-shrink','flex-basis',
      'grid-column','grid-row','box-sizing','margin','padding','top','left','right','bottom',
      'transform','z-index'];
    importantProps.forEach(p => {
      styles[p] = getComputedStyle(qv)[p];
    });

    // Check scroll dimensions
    const scrollInfo = {
      appMainScrollHeight: appMain.scrollHeight,
      appMainClientHeight: appMain.clientHeight,
      appMainScrollTop: appMain.scrollTop
    };

    // Force a layout and check again
    qv.style.width = '100%';
    const afterFix = {
      offsetWidth: qv.offsetWidth,
      offsetHeight: qv.offsetHeight,
      computedWidth: getComputedStyle(qv).width,
      computedHeight: getComputedStyle(qv).height
    };
    qv.style.width = ''; // reset

    return {
      isChild,
      parentTag,
      styles,
      scrollInfo,
      afterFix
    };
  });

  console.log('Deep info:', JSON.stringify(deepInfo, null, 2));

  await browser.close();
  server.close();
})();
