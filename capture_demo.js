const { chromium } = require('playwright');
const path = require('path');

const BASE = 'http://localhost:5173';
const OUT = path.join(__dirname, 'demo_screenshots');
let seq = 0;

async function shot(page, name, delay = 1200) {
  await page.waitForTimeout(delay);
  // Wait for network idle
  try { await page.waitForLoadState('networkidle', { timeout: 3000 }); } catch {}
  seq++;
  const file = path.join(OUT, `${String(seq).padStart(3, '0')}_${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  [${seq}] ${name}`);
}

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1500);
  // Wait for form to render
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.fill('input[type="email"]', '');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', '');
  await page.fill('input[type="password"]', password);
  await shot(page, 'login_page', 500);
  await page.click('button[type="submit"]');
  // Wait for redirect to dashboard
  await page.waitForTimeout(3000);
  try { await page.waitForLoadState('networkidle', { timeout: 5000 }); } catch {}
}

async function makeSlide(page, bgColor, title, subtitle) {
  await page.setContent(`
    <html><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:${bgColor};font-family:system-ui,-apple-system,sans-serif">
      <div style="text-align:center">
        <div style="width:80px;height:80px;background:#C8A951;border-radius:20px;margin:0 auto 24px;display:flex;align-items:center;justify-content:center">
          <span style="font-size:40px;color:#0F2340;font-weight:bold">L</span>
        </div>
        <h1 style="color:white;font-size:48px;font-weight:bold;margin:0 0 8px">${title}</h1>
        <p style="color:rgba(255,255,255,0.7);font-size:20px;margin:0">${subtitle}</p>
      </div>
    </body></html>
  `, { waitUntil: 'load' });
  await shot(page, title.replace(/[^a-zA-Z0-9]/g, '_'), 200);
}

async function sectionSlide(page, persona, section) {
  const colors = { Admin: '#1B365D', Broker: '#2A4A7F', Client: '#8B6914', Analyst: '#065F46' };
  await page.setContent(`
    <html><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:${colors[persona] || '#1B365D'};font-family:system-ui,-apple-system,sans-serif">
      <div style="text-align:center">
        <p style="color:rgba(255,255,255,0.6);font-size:14px;text-transform:uppercase;letter-spacing:6px;margin:0 0 16px">${persona} Persona</p>
        <h1 style="color:white;font-size:44px;font-weight:bold;margin:0">${section}</h1>
      </div>
    </body></html>
  `, { waitUntil: 'load' });
  await shot(page, `${persona}_${section.replace(/[^a-zA-Z0-9]/g, '_')}`, 200);
}

async function navTo(page, path, name, delay = 2000) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(delay);
  try { await page.waitForLoadState('networkidle', { timeout: 5000 }); } catch {}
  await shot(page, name, 500);
}

async function scrollAndShot(page, name, px = 500) {
  await page.evaluate((p) => window.scrollBy(0, p), px);
  await shot(page, name, 1000);
}

async function clickAndShot(page, selector, name, timeout = 2000) {
  try {
    const el = await page.waitForSelector(selector, { timeout: 3000 });
    if (el) { await el.click(); await shot(page, name, timeout); return true; }
  } catch {}
  return false;
}

async function run() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  // ── INTRO SLIDES ──
  await makeSlide(page, 'linear-gradient(135deg,#0F2340,#1B365D,#2A4A7F)', 'Lockton Insurance Platform', 'Comprehensive Feature Demo');

  await page.setContent(`
    <html><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:linear-gradient(135deg,#0F2340,#1B365D);font-family:system-ui,-apple-system,sans-serif">
      <div style="text-align:center;color:white">
        <h2 style="font-size:36px;font-weight:bold;margin-bottom:40px">Four Personas</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:650px;margin:0 auto">
          <div style="background:rgba(255,255,255,0.1);padding:24px;border-radius:16px;border:1px solid rgba(255,255,255,0.1)"><p style="font-size:22px;font-weight:bold;color:#C8A951;margin:0">Admin</p><p style="font-size:13px;opacity:0.7;margin:8px 0 0">Full system access &amp; settings</p></div>
          <div style="background:rgba(255,255,255,0.1);padding:24px;border-radius:16px;border:1px solid rgba(255,255,255,0.1)"><p style="font-size:22px;font-weight:bold;color:#C8A951;margin:0">Broker</p><p style="font-size:13px;opacity:0.7;margin:8px 0 0">Client &amp; policy management</p></div>
          <div style="background:rgba(255,255,255,0.1);padding:24px;border-radius:16px;border:1px solid rgba(255,255,255,0.1)"><p style="font-size:22px;font-weight:bold;color:#C8A951;margin:0">Client</p><p style="font-size:13px;opacity:0.7;margin:8px 0 0">Self-service portal</p></div>
          <div style="background:rgba(255,255,255,0.1);padding:24px;border-radius:16px;border:1px solid rgba(255,255,255,0.1)"><p style="font-size:22px;font-weight:bold;color:#C8A951;margin:0">Analyst</p><p style="font-size:13px;opacity:0.7;margin:8px 0 0">Analytics &amp; reporting</p></div>
        </div>
      </div>
    </body></html>
  `, { waitUntil: 'load' });
  await shot(page, 'personas_overview', 200);

  // ═════════════════════════════════════════
  // ADMIN PERSONA
  // ═════════════════════════════════════════
  await sectionSlide(page, 'Admin', 'Dashboard & Overview');
  await login(page, 'admin@lockton.com', 'admin123');
  await shot(page, 'admin_dashboard_top', 1000);
  await scrollAndShot(page, 'admin_dashboard_charts', 500);
  await scrollAndShot(page, 'admin_dashboard_more', 500);

  await sectionSlide(page, 'Admin', 'Client Management');
  await navTo(page, '/clients', 'admin_clients_list');
  await clickAndShot(page, 'table tbody tr:first-child', 'admin_client_detail', 2000);
  await scrollAndShot(page, 'admin_client_crosssell', 400);
  await scrollAndShot(page, 'admin_client_policies', 400);

  await sectionSlide(page, 'Admin', 'Analytics & BI');
  await navTo(page, '/analytics', 'admin_analytics_overview', 2500);
  await scrollAndShot(page, 'admin_analytics_charts2', 400);
  await clickAndShot(page, 'button:has-text("Loss Ratio")', 'admin_loss_ratio', 2000);
  await scrollAndShot(page, 'admin_loss_ratio_pct', 300);
  await clickAndShot(page, 'button:has-text("Broker Productivity")', 'admin_broker_prod', 2000);
  await clickAndShot(page, 'button:has-text("Revenue Forecast")', 'admin_revenue_forecast', 2000);

  await sectionSlide(page, 'Admin', 'Settings & Administration');
  await navTo(page, '/settings', 'admin_settings_users');
  await clickAndShot(page, 'button:has-text("Roles")', 'admin_settings_roles', 1500);
  await clickAndShot(page, 'button:has-text("Audit")', 'admin_settings_audit', 1500);

  await sectionSlide(page, 'Admin', 'Workflow Automation');
  await navTo(page, '/workflows', 'admin_workflows');
  await clickAndShot(page, 'div[class*="cursor-pointer"]:has-text("Renewal")', 'admin_workflow_detail', 1500);

  await page.evaluate(() => localStorage.clear());

  // ═════════════════════════════════════════
  // BROKER PERSONA
  // ═════════════════════════════════════════
  await sectionSlide(page, 'Broker', 'Dashboard');
  await login(page, 'broker@lockton.com', 'broker123');
  await shot(page, 'broker_dashboard', 1500);

  await sectionSlide(page, 'Broker', 'Policy Management');
  await navTo(page, '/policies', 'broker_policies_list');
  await clickAndShot(page, 'table tbody tr:first-child', 'broker_policy_detail', 2000);
  await scrollAndShot(page, 'broker_policy_info', 400);

  await sectionSlide(page, 'Broker', 'Claims Management');
  await navTo(page, '/claims', 'broker_claims_kpis');
  await scrollAndShot(page, 'broker_claims_charts', 400);
  await scrollAndShot(page, 'broker_claims_table', 400);
  await clickAndShot(page, 'table tbody tr:first-child', 'broker_claim_modal', 1500);
  // Close modal by pressing Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  await sectionSlide(page, 'Broker', 'Renewal Pipeline');
  await navTo(page, '/renewals', 'broker_renewals_kanban', 2500);
  await clickAndShot(page, 'button:has-text("List")', 'broker_renewals_list', 1500);

  await sectionSlide(page, 'Broker', 'Carrier Management');
  await navTo(page, '/carriers', 'broker_carriers');
  await clickAndShot(page, 'table tbody tr:first-child', 'broker_carrier_detail', 2000);

  await sectionSlide(page, 'Broker', 'Certificates');
  await navTo(page, '/certificates', 'broker_certificates');

  await sectionSlide(page, 'Broker', 'Document Vault');
  await navTo(page, '/documents', 'broker_documents');

  await sectionSlide(page, 'Broker', 'AI Assistant');
  await navTo(page, '/ai', 'broker_ai_landing', 2000);
  try {
    await page.fill('input[placeholder*="Ask"]', 'What coverage does Apex Manufacturing have?');
    await shot(page, 'broker_ai_typed', 800);
    await page.click('button[type="submit"]');
    await shot(page, 'broker_ai_response', 4000);
  } catch {}

  await page.evaluate(() => localStorage.clear());

  // ═════════════════════════════════════════
  // CLIENT PERSONA
  // ═════════════════════════════════════════
  await sectionSlide(page, 'Client', 'Self-Service Portal');
  await login(page, 'client@lockton.com', 'client123');
  await shot(page, 'client_dashboard', 2000);

  await navTo(page, '/policies', 'client_policies');
  await navTo(page, '/claims', 'client_claims');
  await navTo(page, '/certificates', 'client_certificates');
  await navTo(page, '/documents', 'client_documents');

  await page.evaluate(() => localStorage.clear());

  // ═════════════════════════════════════════
  // ANALYST PERSONA
  // ═════════════════════════════════════════
  await sectionSlide(page, 'Analyst', 'Analytics & Insights');
  await login(page, 'analyst@lockton.com', 'analyst123');
  await shot(page, 'analyst_dashboard', 2000);

  await navTo(page, '/analytics', 'analyst_analytics', 2500);
  await scrollAndShot(page, 'analyst_analytics_charts', 400);
  await clickAndShot(page, 'button:has-text("Loss Ratio")', 'analyst_loss_ratio', 2000);
  await clickAndShot(page, 'button:has-text("Broker Productivity")', 'analyst_broker_prod', 2000);
  await clickAndShot(page, 'button:has-text("Revenue Forecast")', 'analyst_forecast', 2000);

  await navTo(page, '/ai', 'analyst_ai', 2000);

  // ── OUTRO ──
  await makeSlide(page, 'linear-gradient(135deg,#0F2340,#1B365D,#2A4A7F)', 'Thank You', 'Lockton Insurance Management Platform');

  await browser.close();
  console.log(`\nDone! ${seq} screenshots captured in ${OUT}`);
}

run().catch(e => { console.error(e); process.exit(1); });
