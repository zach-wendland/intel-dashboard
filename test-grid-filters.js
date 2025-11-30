// Detailed Grid Filter Testing
import puppeteer from 'puppeteer';

const TEST_URL = 'http://localhost:5173';

async function testGridFilters() {
  console.log('\n=== GRID FILTER DETAILED TEST ===\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  await page.goto(TEST_URL, { waitUntil: 'networkidle0' });

  // Wait for initial load
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Switch to Intel Grid
  await page.evaluate(() => {
    const gridTab = Array.from(document.querySelectorAll('button'))
      .find(btn => btn.textContent.includes('Intel Grid'));
    if (gridTab) gridTab.click();
  });

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test each filter
  const filters = [
    'All Sources',
    'Paleoconservative Vanguard',
    'MAGA Broadcast Network',
    'Libertarian / Anti-War',
    'Theological Dissent'
  ];

  const results = {};

  for (const filterName of filters) {
    console.log(`\nTesting filter: ${filterName}`);

    // Click the filter
    const clicked = await page.evaluate((name) => {
      const filterBtn = Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent.includes(name));
      if (filterBtn) {
        filterBtn.click();
        return true;
      }
      return false;
    }, filterName);

    if (!clicked) {
      console.log(`  ✗ Filter button not found`);
      continue;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Count visible cards
    const cardInfo = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.bg-slate-900.border.border-slate-800.rounded-lg'));
      return {
        count: cards.length,
        sources: cards.slice(0, 5).map(card => ({
          name: card.querySelector('h3')?.textContent.trim() || 'Unknown',
          tier: card.textContent.match(/TIER:\s*(\w+)/)?.[1] || 'Unknown',
          category: card.querySelector('p')?.textContent.trim() || ''
        }))
      };
    });

    console.log(`  ✓ Shows ${cardInfo.count} sources`);
    cardInfo.sources.forEach((src, i) => {
      console.log(`    ${i + 1}. ${src.name} (${src.tier}) - ${src.category}`);
    });

    results[filterName] = cardInfo.count;
  }

  console.log('\n=== FILTER SUMMARY ===');
  Object.entries(results).forEach(([filter, count]) => {
    console.log(`  ${filter}: ${count} sources`);
  });

  // Test feed status color changes
  console.log('\n=== FEED STATUS COLOR TEST ===');

  const statusColors = await page.evaluate(() => {
    const statusDiv = Array.from(document.querySelectorAll('div')).find(el =>
      el.textContent.includes('FEEDS:')
    );
    if (!statusDiv) return null;

    const style = window.getComputedStyle(statusDiv);
    const feedCount = statusDiv.textContent.match(/FEEDS:\s*(\d+)\/(\d+)/);

    return {
      backgroundColor: style.backgroundColor,
      borderColor: style.borderColor,
      color: style.color,
      feedsLoaded: feedCount ? feedCount[1] : '?',
      totalFeeds: feedCount ? feedCount[2] : '?'
    };
  });

  console.log('Feed Status Indicator:');
  console.log(`  Feeds Loaded: ${statusColors.feedsLoaded}/${statusColors.totalFeeds}`);
  console.log(`  Background: ${statusColors.backgroundColor}`);
  console.log(`  Border: ${statusColors.borderColor}`);
  console.log(`  Text Color: ${statusColors.color}`);

  // Determine color status
  if (statusColors.feedsLoaded === statusColors.totalFeeds) {
    console.log('  Status: GREEN (All feeds loaded) ✓');
  } else if (parseInt(statusColors.feedsLoaded) > 0) {
    console.log('  Status: YELLOW/AMBER (Partial load) !');
  } else {
    console.log('  Status: RED (Failed) ✗');
  }

  // Test rapid refresh clicks
  console.log('\n=== RAPID REFRESH TEST ===');
  console.log('Clicking refresh button 3 times rapidly...');

  for (let i = 1; i <= 3; i++) {
    await page.evaluate(() => {
      const refreshBtn = Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent.includes('REFRESH'));
      if (refreshBtn && !refreshBtn.disabled) {
        refreshBtn.click();
      }
    });
    console.log(`  Click ${i}`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  await new Promise(resolve => setTimeout(resolve, 2000));

  const buttonState = await page.evaluate(() => {
    const refreshBtn = Array.from(document.querySelectorAll('button'))
      .find(btn => btn.textContent.includes('REFRESH') || btn.textContent.includes('SYNCING'));
    return {
      text: refreshBtn?.textContent.includes('SYNCING') ? 'SYNCING...' : 'REFRESH INTEL',
      disabled: refreshBtn?.disabled || false
    };
  });

  console.log(`  Button state: ${buttonState.text}`);
  console.log(`  Button disabled: ${buttonState.disabled}`);

  if (buttonState.disabled || buttonState.text === 'SYNCING...') {
    console.log('  ✓ Rapid refresh protection working');
  } else {
    console.log('  ! Multiple simultaneous requests may be possible');
  }

  await new Promise(resolve => setTimeout(resolve, 3000));
  await browser.close();

  console.log('\n=== TEST COMPLETE ===\n');
}

testGridFilters().catch(console.error);
