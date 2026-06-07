// app/api/requests/[id]/pdf/route.ts
import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  headless: true,
  executablePath: 
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // ← path Chrome Windows
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});