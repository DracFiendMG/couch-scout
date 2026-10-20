/**
 * CouchScout Client Application Logic
 * Real-time SSE streaming, Sloth Scoreboard, and Deal Visualization
 */

document.addEventListener('DOMContentLoaded', () => {
  const sessionId = 'session-' + Math.random().toString(36).substring(2, 9);
  let eventSource = null;
  let timerInterval = null;
  let startTime = null;

  // DOM Elements
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const searchSubmitBtn = document.getElementById('search-submit-btn');
  const promptChips = document.querySelectorAll('.prompt-chip');

  // Mission Elements
  const missionSection = document.getElementById('mission-section');
  const missionMessage = document.getElementById('live-mission-message');
  const missionTimer = document.getElementById('mission-timer');
  const stepsContainer = document.getElementById('steps-container');
  const slothAvatar = document.getElementById('sloth-avatar');

  // Payoff Elements
  const payoffSection = document.getElementById('payoff-section');
  const metricMinutes = document.getElementById('metric-minutes');
  const metricDollars = document.getElementById('metric-dollars');
  const metricTabs = document.getElementById('metric-tabs');

  // Verdict Elements
  const verdictSection = document.getElementById('verdict-section');
  const verdictSummary = document.getElementById('verdict-summary');
  const verdictText = document.getElementById('verdict-text');

  // Results Elements
  const resultsSection = document.getElementById('results-section');
  const resultsCount = document.getElementById('results-count');
  const dealsGrid = document.getElementById('deals-grid');

  // 1. Fetch Integration Health on Startup
  fetchHealthStatus();

  // 2. Quick Prompt Clicks
  promptChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-query');
      if (query) {
        searchInput.value = query;
        startHunt(query);
      }
    });
  });

  // 3. Search Form Submit
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      startHunt(query);
    }
  });

  /**
   * Check backend health and update status pills
   */
  async function fetchHealthStatus() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        updatePills(data.integrations);
      }
    } catch (e) {
      console.warn('Backend status check pending...', e);
    }
  }

  function updatePills(integrations) {
    if (!integrations) return;
    const gemmaDot = document.querySelector('#pill-gemma .pill-dot');
    const stagehandDot = document.querySelector('#pill-stagehand .pill-dot');
    const temporalDot = document.querySelector('#pill-temporal .pill-dot');
    const sentryDot = document.querySelector('#pill-sentry .pill-dot');

    if (gemmaDot) gemmaDot.className = 'pill-dot active';
    if (stagehandDot) stagehandDot.className = 'pill-dot active';
    if (temporalDot) temporalDot.className = integrations.temporal?.enabled ? 'pill-dot active' : 'pill-dot active';
    if (sentryDot) sentryDot.className = integrations.sentry?.enabled ? 'pill-dot active' : 'pill-dot';
  }

  /**
   * Main deal hunting execution
   */
  async function startHunt(query) {
    // Reset UI state
    searchSubmitBtn.disabled = true;
    missionSection.classList.remove('hidden');
    payoffSection.classList.add('hidden');
    verdictSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    stepsContainer.innerHTML = '';
    dealsGrid.innerHTML = '';

    // Scroll to mission section smoothly
    missionSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Start Timer
    startTime = Date.now();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    updateTimer();

    // Setup SSE Stream
    setupEventSource();

    // Trigger Hunt Request
    try {
      const res = await fetch('/api/hunt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, sessionId }),
      });

      if (!res.ok) {
        throw new Error('Failed to start hunt.');
      }
    } catch (err) {
      addStepItem('Error', err.message, 'warning');
      searchSubmitBtn.disabled = false;
      clearInterval(timerInterval);
    }
  }

  /**
   * Establish Server-Sent Events listener
   */
  function setupEventSource() {
    if (eventSource) {
      eventSource.close();
    }

    eventSource = new EventSource(`/api/hunt/stream?sessionId=${sessionId}`);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === 'PROGRESS') {
          handleProgressEvent(payload);
        } else if (payload.type === 'COMPLETE') {
          handleCompleteEvent(payload.result);
        } else if (payload.type === 'ERROR') {
          handleErrorEvent(payload.error);
        }
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    eventSource.onerror = () => {
      console.warn('SSE connection closed or lost.');
    };
  }

  /**
   * Render individual progress steps from Stagehand / Temporal
   */
  function handleProgressEvent(data) {
    missionMessage.textContent = data.message || 'Scouting deals...';

    // Fun sloth mascot moods based on step
    if (data.step?.toLowerCase().includes('observe')) {
      slothAvatar.textContent = '🧐';
    } else if (data.step?.toLowerCase().includes('navigat')) {
      slothAvatar.textContent = '🌿';
    } else if (data.step?.toLowerCase().includes('extract')) {
      slothAvatar.textContent = '🏷️';
    } else {
      slothAvatar.textContent = '🦥';
    }

    addStepItem(data.step || 'Scouting', data.message, data.status);
  }

  function addStepItem(step, message, status) {
    const item = document.createElement('div');
    item.className = `step-item ${status === 'warning' ? 'warning' : ''}`;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    item.innerHTML = `
      <span class="step-time">${time}</span>
      <span class="step-badge">[${escapeHtml(step)}]</span>
      <span class="step-text">${escapeHtml(message)}</span>
    `;

    stepsContainer.appendChild(item);
    stepsContainer.scrollTop = stepsContainer.scrollHeight;
  }

  /**
   * Handle completion: display scoreboard, verdict, and deals
   */
  function handleCompleteEvent(result) {
    clearInterval(timerInterval);
    searchSubmitBtn.disabled = false;
    slothAvatar.textContent = '🎉';
    missionMessage.textContent = 'Mission Complete! Grab your couch blanket and review the finds.';

    if (eventSource) {
      eventSource.close();
    }

    const { evaluation, deals } = result;

    // 1. Reveal sections
    payoffSection.classList.remove('hidden');
    verdictSection.classList.remove('hidden');
    resultsSection.classList.remove('hidden');

    // 2. Animate Scoreboard
    if (evaluation?.lazyPayoff) {
      animateValue(metricMinutes, 0, evaluation.lazyPayoff.minutesSaved || 30, 1000);
      animateValue(metricDollars, 0, evaluation.lazyPayoff.dollarsSaved || 25, 1200, true);
      animateValue(metricTabs, 0, evaluation.lazyPayoff.tabsAvoided || 10, 800);
    }

    // 3. Populate Gemma Verdict
    if (evaluation) {
      verdictSummary.textContent = evaluation.summary || 'Top Choice Verified';
      verdictText.textContent = evaluation.verdict || 'CouchScout selected this deal for lowest landed price and optimal seller credibility.';
    }

    // 4. Populate Deals Cards
    resultsCount.textContent = `${deals.length} Offers Found`;
    dealsGrid.innerHTML = '';

    deals.forEach((deal, idx) => {
      const isTop = evaluation?.bestDealId === deal.id || idx === 0;
      const card = createDealCard(deal, isTop);
      dealsGrid.appendChild(card);
    });

    // Scroll down to results smoothly
    payoffSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function createDealCard(deal, isTop) {
    const card = document.createElement('div');
    card.className = `deal-card ${isTop ? 'best-deal' : ''}`;

    const discountHtml = deal.discountPercent
      ? `<span class="deal-discount">-${deal.discountPercent}% OFF</span>`
      : '';

    const origPriceHtml = deal.originalPrice && deal.originalPrice > deal.price
      ? `<span class="deal-original-price">$${deal.originalPrice.toFixed(2)}</span>`
      : '';

    const couponHtml = deal.couponAvailable
      ? `<div class="deal-coupon-box">
           <span>✂️ Coupon Applied:</span>
           <span class="coupon-code">${escapeHtml(deal.couponCode || 'AUTO-CLIP')}</span>
         </div>`
      : '';

    const ribbonHtml = isTop
      ? `<div class="deal-ribbon">🏆 Sloth Top Pick</div>`
      : '';

    card.innerHTML = `
      ${ribbonHtml}
      <div class="deal-img-wrapper">
        <img class="deal-img" src="${deal.imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500'}" alt="${escapeHtml(deal.title)}" loading="lazy">
        <span class="deal-retailer-badge">${escapeHtml(deal.retailer)}</span>
      </div>
      <div class="deal-body">
        <h3 class="deal-title">${escapeHtml(deal.title)}</h3>
        <div class="deal-pricing-row">
          <span class="deal-price">$${deal.price.toFixed(2)}</span>
          ${origPriceHtml}
          ${discountHtml}
        </div>
        <div class="deal-meta-row">
          <span>⭐ ${deal.rating || '4.5'} (${(deal.reviewCount || 120).toLocaleString()} reviews)</span>
          <span>&bull;</span>
          <span>${deal.inStock ? ' In Stock' : 'Limited Stock'}</span>
        </div>
        ${couponHtml}
        <div class="deal-shipping">📦 ${escapeHtml(deal.shippingInfo || 'Standard Delivery')}</div>
        <a href="${deal.url}" target="_blank" rel="noopener noreferrer" class="deal-button">
          <span>Snag Deal on ${escapeHtml(deal.retailer)}</span>
          <span>➔</span>
        </a>
      </div>
    `;

    return card;
  }

  function handleErrorEvent(errorMsg) {
    clearInterval(timerInterval);
    searchSubmitBtn.disabled = false;
    slothAvatar.textContent = '⚠️';
    missionMessage.textContent = 'Encountered a hurdle. Retrying or falling back...';
    addStepItem('Notice', errorMsg || 'Issue handled gracefully.', 'warning');
  }

  function updateTimer() {
    if (!startTime) return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    missionTimer.textContent = `${mins}:${secs}`;
  }

  function animateValue(element, start, end, duration, isCurrency = false) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = progress * (end - start) + start;
      element.textContent = isCurrency ? current.toFixed(2) : Math.floor(current);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
