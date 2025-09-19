/*
 Export UF-Xray docs HTML to PDFs using Puppeteer.
 Usage:
   npm run docs:pdf
 Output:
   docs/pdf/UF_Xray_Viva_Guide.pdf
   docs/pdf/UF_Xray_Deployment_Guide.pdf
*/

const fs = require('fs');
const path = require('path');

(async () => {
  const puppeteer = require('puppeteer');
  const root = process.cwd();
  const docsDir = path.join(root, 'docs');
  const outDir = path.join(docsDir, 'pdf');
  await fs.promises.mkdir(outDir, { recursive: true });

  const inputs = [
    {
      html: path.join(docsDir, 'UF_Xray_Viva_Guide.html'),
      pdf: path.join(outDir, 'UF_Xray_Viva_Guide.pdf'),
      title: 'UF‑Xray Viva Guide'
    },
    {
      html: path.join(docsDir, 'UF_Xray_Deployment_Guide.html'),
      pdf: path.join(outDir, 'UF_Xray_Deployment_Guide.pdf'),
      title: 'UF‑Xray Deployment Guide'
    }
  ];

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox','--disable-setuid-sandbox']
  });

  for (const doc of inputs) {
    if (!fs.existsSync(doc.html)) {
      console.error('Missing HTML file:', doc.html);
      continue;
    }
    const page = await browser.newPage();
    const fileUrl = 'file://' + doc.html.replace(/\\/g, '/');
    await page.goto(fileUrl, { waitUntil: ['load','domcontentloaded','networkidle0'] });
    await page.pdf({
      path: doc.pdf,
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', right: '12mm', bottom: '14mm', left: '12mm' }
    });
    console.log('Saved PDF:', path.relative(root, doc.pdf));
    await page.close();
  }

  await browser.close();
})();
