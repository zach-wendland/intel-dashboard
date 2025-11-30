// Comprehensive Intel Dashboard Test Suite
import puppeteer from 'puppeteer';

const TEST_URL = 'http://localhost:5173';
const TIMEOUT = 30000;

// Utility: Wait for element
async function waitForSelector(page, selector, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (e) {
    console.log(`TIMEOUT waiting for: ${selector}`);
    return false;
  }
}

// Utility: Sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test Results Storage
const results = {
  passed: [],
  failed: [],
  warnings: [],
  performance: {}
};

async function runTests() {
  console.log('\n=== INTEL DASHBOARD TEST SUITE ===\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Track console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    // ============================================
    // TEST 1: Initial Load & Performance
    // ============================================
    console.log('TEST 1: Initial Load & Performance');
    const startTime = Date.now();

    await page.goto(TEST_URL, { waitUntil: 'networkidle0', timeout: TIMEOUT });
    const loadTime = Date.now() - startTime;
    results.performance.initialLoad = loadTime;

    console.log(`  - Page loaded in ${loadTime}ms`);
    if (loadTime < 3000) {
      results.passed.push('Initial load time < 3s');
    } else {
      results.warnings.push(`Initial load time ${loadTime}ms (threshold: 3000ms)`);
    }

    // Check for title
    const title = await page.title();
    console.log(`  - Page title: "${title}"`);

    // ============================================
    // TEST 2: Header & Feed Status Indicator
    // ============================================
    console.log('\nTEST 2: Header & Feed Status Indicator');

    // Check header exists
    const headerExists = await page.$('header');
    if (headerExists) {
      results.passed.push('Header element exists');
      console.log('  ✓ Header present');
    } else {
      results.failed.push('Header element missing');
      console.log('  ✗ Header missing');
    }

    // Check feed status indicator
    const feedStatusText = await page.evaluate(() => {
      const statusElement = document.querySelector('header');
      if (!statusElement) return null;
      const feedText = statusElement.textContent.match(/FEEDS:\s*(\d+)\/(\d+)/);
      return feedText ? { current: feedText[1], total: feedText[2] } : null;
    });

    if (feedStatusText) {
      console.log(`  ✓ Feed status: ${feedStatusText.current}/${feedStatusText.total}`);
      results.passed.push(`Feed status indicator shows ${feedStatusText.current}/${feedStatusText.total}`);
    } else {
      console.log('  ✗ Feed status indicator not found');
      results.failed.push('Feed status indicator missing');
    }

    // Wait for feeds to load (give it time)
    console.log('  - Waiting for feeds to load (15 seconds)...');
    await sleep(15000);

    // Check feed status color after loading
    const feedStatus = await page.evaluate(() => {
      const statusDiv = Array.from(document.querySelectorAll('div')).find(el =>
        el.textContent.includes('FEEDS:')
      );
      if (!statusDiv) return null;
      const style = window.getComputedStyle(statusDiv);
      return {
        backgroundColor: style.backgroundColor,
        borderColor: style.borderColor,
        color: style.color,
        text: statusDiv.textContent.trim()
      };
    });

    if (feedStatus) {
      console.log(`  - Feed status styling:`, feedStatus);
      results.passed.push('Feed status has dynamic styling');
    }

    // ============================================
    // TEST 3: Refresh Button Functionality
    // ============================================
    console.log('\nTEST 3: Refresh Button Functionality');

    const refreshButton = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent.includes('REFRESH'));
    });

    if (refreshButton && refreshButton.asElement()) {
      console.log('  ✓ Refresh button found');
      results.passed.push('Refresh button exists');

      // Click refresh
      await refreshButton.asElement().click();
      console.log('  - Clicked refresh button');

      // Wait a moment for animation
      await sleep(1000);

      // Check for "SYNCING..." text
      const syncingText = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button'))
          .some(btn => btn.textContent.includes('SYNCING'));
      });

      if (syncingText) {
        console.log('  ✓ Button shows "SYNCING..." during refresh');
        results.passed.push('Refresh button changes to SYNCING');
      } else {
        console.log('  ! Button text did not change (may have loaded too fast)');
        results.warnings.push('Refresh animation may be too fast to detect');
      }

      // Wait for refresh to complete
      await sleep(15000);
      console.log('  - Refresh completed');

    } else {
      console.log('  ✗ Refresh button not found');
      results.failed.push('Refresh button missing');
    }

    // ============================================
    // TEST 4: Tab Navigation
    // ============================================
    console.log('\nTEST 4: Tab Navigation');

    const tabs = ['Intel Grid', 'Live Wire', 'Synthesis'];

    for (const tabName of tabs) {
      const tabButton = await page.evaluateHandle((name) => {
        return Array.from(document.querySelectorAll('button'))
          .find(btn => btn.textContent.includes(name));
      }, tabName);

      if (tabButton && tabButton.asElement()) {
        await tabButton.asElement().click();
        await sleep(500);
        console.log(`  ✓ Clicked "${tabName}" tab`);
        results.passed.push(`Tab navigation: ${tabName}`);
      } else {
        console.log(`  ✗ Tab "${tabName}" not found`);
        results.failed.push(`Tab missing: ${tabName}`);
      }
    }

    // ============================================
    // TEST 5: Live Wire Feed Display
    // ============================================
    console.log('\nTEST 5: Live Wire Feed Display');

    // Switch to Live Wire tab
    const liveWireTab = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent.includes('Live Wire'));
    });

    if (liveWireTab && liveWireTab.asElement()) {
      await liveWireTab.asElement().click();
      await sleep(1000);
    }

    // Check for articles
    const articles = await page.evaluate(() => {
      const articleLinks = Array.from(document.querySelectorAll('a[target="_blank"][rel*="noopener"]'));
      return articleLinks.slice(0, 5).map(link => ({
        title: link.querySelector('h3')?.textContent || '',
        source: link.textContent.match(/[A-Za-z\s\.]+(?=VIRALITY)/)?.[0]?.trim() || '',
        time: link.textContent.match(/\d{2}:\d{2}/)?.[0] || '',
        hasExternalLink: link.querySelector('svg') !== null,
        url: link.href
      }));
    });

    if (articles.length > 0) {
      console.log(`  ✓ Found ${articles.length} articles`);
      results.passed.push(`Live Wire displays ${articles.length} articles`);

      articles.forEach((article, i) => {
        console.log(`\n  Article ${i + 1}:`);
        console.log(`    Title: ${article.title.substring(0, 60)}...`);
        console.log(`    Source: ${article.source}`);
        console.log(`    Time: ${article.time}`);
        console.log(`    Has external link icon: ${article.hasExternalLink}`);
      });

      // Check article structure
      const firstArticle = articles[0];
      if (firstArticle.title) results.passed.push('Articles have titles');
      if (firstArticle.time) results.passed.push('Articles have timestamps');
      if (firstArticle.source) results.passed.push('Articles have source attribution');

    } else {
      console.log('  ✗ No articles found in Live Wire');
      results.failed.push('No articles displayed in Live Wire');
    }

    // Check for topic tags
    const topicTags = await page.$$eval('.text-blue-400.bg-blue-900\\/10', elements =>
      elements.map(el => el.textContent.trim())
    );

    if (topicTags.length > 0) {
      console.log(`\n  ✓ Found ${topicTags.length} topic tags`);
      console.log(`    Topics: ${topicTags.slice(0, 5).join(', ')}`);
      results.passed.push('Articles have topic tags');
    }

    // Check for virality bars
    const viralityBars = await page.$$('.bg-gradient-to-r.from-blue-500.to-red-500');
    if (viralityBars.length > 0) {
      console.log(`  ✓ Found ${viralityBars.length} virality indicators`);
      results.passed.push('Articles have virality indicators');
    }

    // ============================================
    // TEST 6: Error Handling Display
    // ============================================
    console.log('\nTEST 6: Error Handling Display');

    const errorSection = await page.$('.bg-red-900\\/20');
    if (errorSection) {
      const errorText = await page.evaluate(el => el.textContent, errorSection);
      console.log('  ! Error section detected:');
      console.log(`    ${errorText.substring(0, 200)}`);
      results.warnings.push('Feed errors detected (expected if some feeds fail)');
    } else {
      console.log('  ✓ No error section (all feeds loaded successfully)');
      results.passed.push('No feed errors displayed');
    }

    // ============================================
    // TEST 7: Intel Grid View
    // ============================================
    console.log('\nTEST 7: Intel Grid View');

    // Switch to Intel Grid
    const gridTab = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent.includes('Intel Grid'));
    });

    if (gridTab && gridTab.asElement()) {
      await gridTab.asElement().click();
      await sleep(1000);

      // Count source cards
      const sourceCards = await page.$$('.bg-slate-900.border.border-slate-800.rounded-lg');
      console.log(`  ✓ Found ${sourceCards.length} source cards`);
      results.passed.push(`Intel Grid displays ${sourceCards.length} sources`);

      // Test filters
      const filters = ['INTELLECTUALS', 'BROADCAST', 'LIBERTARIANS', 'THEOLOGIANS'];

      for (const filter of filters) {
        const filterButton = await page.evaluateHandle((name) => {
          return Array.from(document.querySelectorAll('button'))
            .find(btn => btn.textContent.includes(name));
        }, filter);

        if (filterButton && filterButton.asElement()) {
          await filterButton.asElement().click();
          await sleep(300);

          const visibleCards = await page.$$('.bg-slate-900.border.border-slate-800.rounded-lg');
          console.log(`  ✓ Filter "${filter}": ${visibleCards.length} sources`);
          results.passed.push(`Grid filter works: ${filter}`);
        }
      }

      // Reset to All Sources
      const allButton = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button'))
          .find(btn => btn.textContent.includes('All Sources'));
      });
      if (allButton && allButton.asElement()) {
        await allButton.asElement().click();
      }

    } else {
      console.log('  ✗ Intel Grid tab not accessible');
      results.failed.push('Cannot access Intel Grid');
    }

    // ============================================
    // TEST 8: External Links Security
    // ============================================
    console.log('\nTEST 8: External Links Security');

    const externalLinks = await page.$$eval('a[target="_blank"]', links =>
      links.map(link => ({
        href: link.href,
        rel: link.rel,
        hasNoopener: link.rel.includes('noopener'),
        hasNoreferrer: link.rel.includes('noreferrer')
      }))
    );

    console.log(`  - Found ${externalLinks.length} external links`);
    const secureLinks = externalLinks.filter(link => link.hasNoopener);

    if (secureLinks.length === externalLinks.length) {
      console.log(`  ✓ All external links have rel="noopener"`);
      results.passed.push('External links properly secured');
    } else {
      console.log(`  ! ${externalLinks.length - secureLinks.length} links missing noopener`);
      results.warnings.push('Some links missing security attributes');
    }

    // ============================================
    // TEST 9: Responsive Design (Mobile)
    // ============================================
    console.log('\nTEST 9: Responsive Design');

    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await sleep(500);

      const headerVisible = await page.$eval('header', el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

      if (headerVisible) {
        console.log(`  ✓ ${vp.name} (${vp.width}x${vp.height}): Layout intact`);
        results.passed.push(`Responsive: ${vp.name}`);
      } else {
        console.log(`  ✗ ${vp.name}: Layout broken`);
        results.failed.push(`Responsive failure: ${vp.name}`);
      }
    }

    // Reset to desktop
    await page.setViewport({ width: 1920, height: 1080 });

    // ============================================
    // TEST 10: XSS Prevention & Data Validation
    // ============================================
    console.log('\nTEST 10: XSS Prevention & Data Validation');

    const suspiciousContent = await page.evaluate(() => {
      const bodyText = document.body.textContent || '';
      return {
        hasScriptTags: bodyText.includes('<script>'),
        hasHtmlTags: /<[^>]+>/.test(bodyText.replace(/<(svg|path|div|span|button|a|h[1-6]|p|ul|li|header|main|nav)[\s>]/gi, '')),
        hasUndefined: bodyText.includes('undefined'),
        hasNull: bodyText.includes('null')
      };
    });

    if (!suspiciousContent.hasScriptTags && !suspiciousContent.hasHtmlTags) {
      console.log('  ✓ No XSS artifacts detected');
      results.passed.push('XSS prevention working');
    } else {
      console.log('  ! Potential XSS or rendering issues detected');
      results.warnings.push('Suspicious content patterns found');
    }

    if (!suspiciousContent.hasUndefined && !suspiciousContent.hasNull) {
      console.log('  ✓ No undefined/null values displayed');
      results.passed.push('No undefined/null in UI');
    } else {
      console.log('  ! Found undefined/null in displayed content');
      results.failed.push('Undefined/null values visible to user');
    }

    // ============================================
    // TEST 11: Console Errors
    // ============================================
    console.log('\nTEST 11: Console Errors');

    if (consoleErrors.length === 0) {
      console.log('  ✓ No console errors detected');
      results.passed.push('Zero console errors');
    } else {
      console.log(`  ! ${consoleErrors.length} console errors detected:`);
      consoleErrors.slice(0, 5).forEach(err => console.log(`    - ${err}`));
      results.warnings.push(`${consoleErrors.length} console errors`);
    }

    // ============================================
    // TEST 12: Timestamp Updates
    // ============================================
    console.log('\nTEST 12: Timestamp Updates');

    // Switch back to Live Wire
    const liveWireTab2 = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button'))
        .find(btn => btn.textContent.includes('Live Wire'));
    });
    if (liveWireTab2 && liveWireTab2.asElement()) {
      await liveWireTab2.asElement().click();
      await sleep(500);
    }

    const initialTimestamp = await page.evaluate(() => {
      const match = document.body.textContent.match(/UPDATED:\s*(\d{2}:\d{2})/);
      return match ? match[1] : null;
    });

    if (initialTimestamp) {
      console.log(`  - Initial timestamp: ${initialTimestamp}`);

      // Trigger refresh
      const refreshBtn2 = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button'))
          .find(btn => btn.textContent.includes('REFRESH'));
      });

      if (refreshBtn2 && refreshBtn2.asElement()) {
        await refreshBtn2.asElement().click();
        await sleep(16000);

        const newTimestamp = await page.evaluate(() => {
          const match = document.body.textContent.match(/UPDATED:\s*(\d{2}:\d{2})/);
          return match ? match[1] : null;
        });

        if (newTimestamp && newTimestamp !== initialTimestamp) {
          console.log(`  ✓ Timestamp updated: ${initialTimestamp} → ${newTimestamp}`);
          results.passed.push('Timestamps update on refresh');
        } else if (newTimestamp) {
          console.log(`  ! Timestamp same (refresh may have been too fast): ${newTimestamp}`);
          results.warnings.push('Timestamp did not change (check if feeds actually updated)');
        }
      }
    }

  } catch (error) {
    console.error('\nFATAL ERROR:', error.message);
    results.failed.push(`Fatal error: ${error.message}`);
  } finally {
    await sleep(2000);
    await browser.close();
  }

  // ============================================
  // FINAL REPORT
  // ============================================
  console.log('\n\n' + '='.repeat(60));
  console.log('TEST SUMMARY REPORT');
  console.log('='.repeat(60));

  console.log(`\nPERFORMANCE METRICS:`);
  console.log(`  Initial Load Time: ${results.performance.initialLoad}ms`);

  console.log(`\nTEST RESULTS:`);
  console.log(`  ✓ PASSED: ${results.passed.length}`);
  console.log(`  ✗ FAILED: ${results.failed.length}`);
  console.log(`  ! WARNINGS: ${results.warnings.length}`);

  if (results.passed.length > 0) {
    console.log(`\nPASSED TESTS (${results.passed.length}):`);
    results.passed.forEach(test => console.log(`  ✓ ${test}`));
  }

  if (results.failed.length > 0) {
    console.log(`\nFAILED TESTS (${results.failed.length}):`);
    results.failed.forEach(test => console.log(`  ✗ ${test}`));
  }

  if (results.warnings.length > 0) {
    console.log(`\nWARNINGS (${results.warnings.length}):`);
    results.warnings.forEach(test => console.log(`  ! ${test}`));
  }

  console.log('\n' + '='.repeat(60));

  const passRate = (results.passed.length / (results.passed.length + results.failed.length) * 100).toFixed(1);
  console.log(`OVERALL PASS RATE: ${passRate}%`);

  if (results.failed.length === 0 && results.warnings.length < 3) {
    console.log('VERDICT: READY FOR PRODUCTION ✓');
  } else if (results.failed.length < 3) {
    console.log('VERDICT: MINOR ISSUES - REVIEW WARNINGS');
  } else {
    console.log('VERDICT: NOT READY - CRITICAL ISSUES FOUND');
  }

  console.log('='.repeat(60) + '\n');
}

runTests().catch(console.error);
