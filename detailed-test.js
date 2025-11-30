/**
 * Detailed Manual Testing - Focused on Critical Test Cases
 */

import puppeteer from 'puppeteer';

async function detailedTests() {
  console.log('='.repeat(80));
  console.log('DETAILED CRITICAL TEST CASES - Intel Dashboard');
  console.log('='.repeat(80));

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();

  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });

  try {
    console.log('\n[1] Loading application...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

    // Wait for initial feed load
    await page.waitForTimeout(10000);

    // CRITICAL TEST: Feed Status Indicator Details
    console.log('\n' + '='.repeat(80));
    console.log('CRITICAL TEST: Feed Status Indicator (Detailed Analysis)');
    console.log('='.repeat(80));

    const feedStatusAnalysis = await page.evaluate(() => {
      // Find the feed status element
      const statusElements = Array.from(document.querySelectorAll('div')).filter(el =>
        el.textContent.includes('FEEDS:')
      );

      if (statusElements.length === 0) return { found: false };

      const statusEl = statusElements.find(el => {
        const text = el.textContent;
        return text.match(/FEEDS:\s*\d+\/\d+/);
      }) || statusElements[0];

      const computedStyle = window.getComputedStyle(statusEl);
      const text = statusEl.textContent;
      const match = text.match(/FEEDS:\s*(\d+)\/(\d+)/);

      return {
        found: true,
        text: statusEl.innerText || statusEl.textContent,
        feedCount: match ? { current: parseInt(match[1]), total: parseInt(match[2]) } : null,
        styling: {
          backgroundColor: computedStyle.backgroundColor,
          borderColor: computedStyle.borderColor,
          color: computedStyle.color,
          opacity: computedStyle.opacity,
          display: computedStyle.display
        },
        classes: statusEl.className,
        hasPulsingChild: statusEl.querySelector('[class*="pulse"]') !== null
      };
    });

    console.log('\nFeed Status Indicator Analysis:');
    console.log('  Found:', feedStatusAnalysis.found);
    if (feedStatusAnalysis.found) {
      console.log('  Feed Count:', feedStatusAnalysis.feedCount);
      console.log('  Styling:');
      console.log('    Background Color:', feedStatusAnalysis.styling.backgroundColor);
      console.log('    Border Color:', feedStatusAnalysis.styling.borderColor);
      console.log('    Text Color:', feedStatusAnalysis.styling.color);
      console.log('  Has Pulsing Animation:', feedStatusAnalysis.hasPulsingChild);

      // Determine expected color based on feed count
      const allOk = feedStatusAnalysis.feedCount.current === feedStatusAnalysis.feedCount.total;
      const someOk = feedStatusAnalysis.feedCount.current > 0 && feedStatusAnalysis.feedCount.current < feedStatusAnalysis.feedCount.total;
      const allFailed = feedStatusAnalysis.feedCount.current === 0;

      console.log('  Expected Color Coding:');
      if (allOk) {
        console.log('    All feeds OK - Should be GREEN');
      } else if (someOk) {
        console.log('    Partial success - Should be ORANGE/YELLOW');
      } else if (allFailed) {
        console.log('    All failed - Should be RED');
      }
    }

    // CRITICAL TEST: Article Data Quality (Deep Inspection)
    console.log('\n' + '='.repeat(80));
    console.log('CRITICAL TEST: Article Data Quality & XSS Prevention');
    console.log('='.repeat(80));

    // Switch to Live Wire
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Live Wire')
      );
      btn?.click();
    });
    await page.waitForTimeout(1000);

    const articleQuality = await page.evaluate(() => {
      const articles = Array.from(document.querySelectorAll('a[target="_blank"][rel*="noopener"]'));

      const samples = articles.slice(0, 10).map(article => {
        const topicEl = article.querySelector('span[class*="blue-400"]');
        const titleEl = article.querySelector('h3');
        const timeEls = article.querySelectorAll('span');
        const sourceEl = Array.from(article.querySelectorAll('span')).find(s =>
          s.querySelector('svg') && s.textContent.trim().length > 0
        );

        // Find time (HH:MM format)
        let time = null;
        for (const span of timeEls) {
          const match = span.textContent.match(/^(\d{2}:\d{2})$/);
          if (match) {
            time = match[1];
            break;
          }
        }

        const topic = topicEl?.textContent || 'MISSING';
        const title = titleEl?.textContent || 'MISSING';
        const source = sourceEl?.textContent.trim() || 'MISSING';
        const url = article.href;
        const rel = article.rel;

        // Check for XSS indicators
        const htmlPattern = /<(script|iframe|embed|object|img|svg|link|style)[^>]*>/gi;
        const hasHtmlInTitle = htmlPattern.test(title);
        const hasAmpersandCodes = /&(lt|gt|quot|amp|#\d+);/.test(title);

        // Check for proper encoding
        const hasProperEncoding = !title.includes('<') && !title.includes('>') && !source.includes('<');

        // Check external link icon
        const hasExternalIcon = article.querySelector('svg.lucide-external-link') !== null ||
                               Array.from(article.querySelectorAll('svg')).some(svg =>
                                 svg.outerHTML.includes('external-link')
                               );

        // Check virality bar
        const viralityBar = article.querySelector('[class*="bg-gradient"]');
        const viralityWidth = viralityBar ?
          viralityBar.style.width || window.getComputedStyle(viralityBar).width :
          'MISSING';

        return {
          topic,
          title: title.substring(0, 80),
          time,
          source: source.substring(0, 30),
          url: url.substring(0, 50),
          rel,
          hasHtmlInTitle,
          hasAmpersandCodes,
          hasProperEncoding,
          hasExternalIcon,
          viralityWidth,
          // Validation checks
          valid: {
            topic: topic !== 'MISSING' && topic.length > 0,
            title: title !== 'MISSING' && title.length > 5 && !title.includes('undefined') && !title.includes('null'),
            time: time !== null && /^\d{2}:\d{2}$/.test(time),
            source: source !== 'MISSING' && source.length > 2,
            url: url.startsWith('http'),
            security: rel.includes('noopener') && rel.includes('noreferrer')
          }
        };
      });

      return {
        totalArticles: articles.length,
        samples
      };
    });

    console.log(`\nTotal Articles Found: ${articleQuality.totalArticles}`);
    console.log('\nArticle Quality Analysis (First 5):');

    articleQuality.samples.slice(0, 5).forEach((article, i) => {
      console.log(`\n  Article #${i + 1}:`);
      console.log(`    Topic: ${article.topic} ✓${article.valid.topic ? '✓' : '✗'}`);
      console.log(`    Title: ${article.title}... ${article.valid.title ? '✓' : '✗'}`);
      console.log(`    Time: ${article.time} ${article.valid.time ? '✓' : '✗'}`);
      console.log(`    Source: ${article.source} ${article.valid.source ? '✓' : '✗'}`);
      console.log(`    URL Valid: ${article.valid.url ? '✓' : '✗'}`);
      console.log(`    Security (noopener/noreferrer): ${article.valid.security ? '✓' : '✗'}`);
      console.log(`    Has External Link Icon: ${article.hasExternalIcon ? '✓' : '✗'}`);
      console.log(`    Virality Width: ${article.viralityWidth}`);
      console.log(`    XSS Checks:`);
      console.log(`      - No HTML tags in title: ${!article.hasHtmlInTitle ? '✓' : '✗ CRITICAL'}`);
      console.log(`      - Proper encoding: ${article.hasProperEncoding ? '✓' : '✗'}`);
      console.log(`      - No &amp; codes: ${!article.hasAmpersandCodes ? '✓' : 'INFO (escaped HTML)'}`);
    });

    // Overall validation
    const allValid = articleQuality.samples.every(a =>
      a.valid.topic && a.valid.title && a.valid.time && a.valid.source && a.valid.url && a.valid.security
    );

    console.log(`\n  Overall Validation: ${allValid ? 'ALL PASS ✓' : 'SOME FAILURES ✗'}`);

    // CRITICAL TEST: Refresh Button Behavior (Detailed)
    console.log('\n' + '='.repeat(80));
    console.log('CRITICAL TEST: Refresh Button Behavior (Detailed)');
    console.log('='.repeat(80));

    const preRefreshState = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('REFRESH')
      );

      return {
        text: btn?.textContent.trim(),
        disabled: btn?.disabled,
        className: btn?.className
      };
    });

    console.log('\nPre-Refresh State:');
    console.log('  Button Text:', preRefreshState.text);
    console.log('  Disabled:', preRefreshState.disabled);

    // Click refresh
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('REFRESH')
      );
      btn?.click();
    });

    // Immediately check state
    await page.waitForTimeout(100);

    const duringRefreshState = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('REFRESH') || b.textContent.includes('SYNC')
      );

      const spinner = document.querySelector('[class*="animate-spin"]');

      return {
        text: btn?.textContent.trim(),
        disabled: btn?.disabled,
        hasSpinner: spinner !== null,
        spinnerClass: spinner?.className
      };
    });

    console.log('\nDuring Refresh State (100ms after click):');
    console.log('  Button Text:', duringRefreshState.text);
    console.log('  Disabled:', duringRefreshState.disabled);
    console.log('  Has Spinner:', duringRefreshState.hasSpinner);
    console.log('  Spinner Class:', duringRefreshState.spinnerClass);

    // Test rapid clicking
    console.log('\nTesting Rapid Click Prevention...');
    const rapidClickResult = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('REFRESH') || b.textContent.includes('SYNC')
      );

      let clicksAccepted = 0;
      for (let i = 0; i < 10; i++) {
        if (!btn.disabled) {
          btn.click();
          clicksAccepted++;
        }
      }

      return {
        clicksAccepted,
        finalDisabled: btn?.disabled,
        finalText: btn?.textContent.trim()
      };
    });

    console.log('  Clicks Accepted:', rapidClickResult.clicksAccepted, '/ 10');
    console.log('  Button Disabled After:', rapidClickResult.finalDisabled ? '✓' : '✗');
    console.log('  Prevention Working:', rapidClickResult.clicksAccepted <= 1 ? '✓ YES' : '✗ NO');

    // Wait for refresh to complete
    console.log('\nWaiting for refresh to complete...');
    await page.waitForFunction(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('REFRESH') || b.textContent.includes('SYNC')
      );
      return btn && !btn.disabled && btn.textContent.includes('REFRESH');
    }, { timeout: 30000 });

    const postRefreshState = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('REFRESH')
      );

      return {
        text: btn?.textContent.trim(),
        disabled: btn?.disabled
      };
    });

    console.log('\nPost-Refresh State:');
    console.log('  Button Text:', postRefreshState.text);
    console.log('  Disabled:', postRefreshState.disabled);
    console.log('  Refresh Cycle Complete:', postRefreshState.text === preRefreshState.text && !postRefreshState.disabled ? '✓' : '✗');

    // CRITICAL TEST: Console Errors (Detailed)
    console.log('\n' + '='.repeat(80));
    console.log('CRITICAL TEST: Console Messages Analysis');
    console.log('='.repeat(80));

    const errorMessages = consoleMessages.filter(m => m.type === 'error');
    const warningMessages = consoleMessages.filter(m => m.type === 'warning');
    const infoMessages = consoleMessages.filter(m => m.type === 'log' || m.type === 'info');

    console.log(`\nConsole Error Count: ${errorMessages.length}`);
    if (errorMessages.length > 0) {
      console.log('Errors:');
      errorMessages.slice(0, 10).forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.text}`);
      });
    } else {
      console.log('  ✓ No JavaScript errors detected');
    }

    console.log(`\nConsole Warning Count: ${warningMessages.length}`);
    if (warningMessages.length > 0) {
      console.log('Warnings:');
      warningMessages.slice(0, 5).forEach((warn, i) => {
        console.log(`  ${i + 1}. ${warn.text}`);
      });
    }

    // CRITICAL TEST: Performance Timing
    console.log('\n' + '='.repeat(80));
    console.log('CRITICAL TEST: Performance Metrics (Detailed)');
    console.log('='.repeat(80));

    const perfMetrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      const paintMetrics = performance.getEntriesByType('paint');

      return {
        navigation: {
          redirectTime: perf.redirectEnd - perf.redirectStart,
          dnsTime: perf.domainLookupEnd - perf.domainLookupStart,
          connectTime: perf.connectEnd - perf.connectStart,
          requestTime: perf.responseStart - perf.requestStart,
          responseTime: perf.responseEnd - perf.responseStart,
          domParsing: perf.domInteractive - perf.domLoading,
          domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
          loadComplete: perf.loadEventEnd - perf.loadEventStart,
          totalLoad: perf.loadEventEnd - perf.fetchStart
        },
        paint: paintMetrics.map(p => ({
          name: p.name,
          time: p.startTime
        })),
        memory: performance.memory ? {
          usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
          totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
          limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
        } : null
      };
    });

    console.log('\nNavigation Timing:');
    console.log('  DNS Lookup:', perfMetrics.navigation.dnsTime.toFixed(2), 'ms');
    console.log('  Connection:', perfMetrics.navigation.connectTime.toFixed(2), 'ms');
    console.log('  Request:', perfMetrics.navigation.requestTime.toFixed(2), 'ms');
    console.log('  Response:', perfMetrics.navigation.responseTime.toFixed(2), 'ms');
    console.log('  DOM Parsing:', perfMetrics.navigation.domParsing.toFixed(2), 'ms');
    console.log('  DOM Content Loaded:', perfMetrics.navigation.domContentLoaded.toFixed(2), 'ms');
    console.log('  Total Load Time:', perfMetrics.navigation.totalLoad.toFixed(2), 'ms',
                perfMetrics.navigation.totalLoad < 3000 ? '✓' : '✗ (>3s threshold)');

    console.log('\nPaint Timing:');
    perfMetrics.paint.forEach(p => {
      console.log(`  ${p.name}:`, p.time.toFixed(2), 'ms');
    });

    if (perfMetrics.memory) {
      console.log('\nMemory Usage:');
      console.log('  Used:', perfMetrics.memory.usedJSHeapSize);
      console.log('  Total:', perfMetrics.memory.totalJSHeapSize);
      console.log('  Limit:', perfMetrics.memory.limit);
    }

    // Take final screenshot
    await page.screenshot({ path: 'test-screenshots/detailed-final-state.png', fullPage: true });
    console.log('\n✓ Screenshot saved: test-screenshots/detailed-final-state.png');

  } catch (error) {
    console.error('\nERROR:', error.message);
  } finally {
    console.log('\n' + '='.repeat(80));
    console.log('Detailed testing complete. Browser will close in 5 seconds...');
    console.log('='.repeat(80));
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

detailedTests().catch(console.error);
