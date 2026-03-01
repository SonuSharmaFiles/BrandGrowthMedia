/* ============================================================
   BrandGrowthMedia — Project Inquiry Popup System
   No login required — opens directly on "Get Started" click
   ============================================================ */

(function () {
  'use strict';

  let selectedTier = null;
  let selectedPrice = null;
  let addedServices = [];

  // ---- All Services Catalog ----
  const ALL_SERVICES = {
    'website-development': {
      name: 'Website Development',
      url: 'services/website-development.html',
      billing: 'one-time',
      tiers: [
        { key: 'wd-starter', name: 'Starter Growth Site', price: 499 },
        { key: 'wd-business', name: 'Business Growth Engine', price: 899 },
        { key: 'wd-authority', name: 'Authority & Scale System', price: 1499 }
      ]
    },
    'performance-marketing': {
      name: 'Performance Marketing (Facebook & Google Ads)',
      url: 'services/facebook-instagram-ads.html',
      billing: '/month',
      tiers: [
        { key: 'pm-launch', name: 'Launch & Validate', price: 750 },
        { key: 'pm-scale', name: 'Scale System', price: 1500 },
        { key: 'pm-growth', name: 'Growth Partner', price: 2800 }
      ]
    },
    'social-media': {
      name: 'Social Media Management',
      url: 'services/social-media.html',
      billing: '/month',
      tiers: [
        { key: 'sm-presence', name: 'Brand Presence', price: 600 },
        { key: 'sm-authority', name: 'Brand Authority', price: 1200 },
        { key: 'sm-leader', name: 'Market Leader', price: 2200 }
      ]
    },
    'google-ads': {
      name: 'Google Ads Management',
      url: 'services/google-ads.html',
      billing: '/month',
      tiers: [
        { key: 'ga-launch', name: 'Search Launch', price: 900 },
        { key: 'ga-retargeting', name: 'Search + Retargeting', price: 1600 },
        { key: 'ga-fullfunnel', name: 'Full-Funnel Google Growth', price: 3000 }
      ]
    },
    'local-seo': {
      name: 'Local SEO & Maps',
      url: 'services/local-seo.html',
      billing: '/month',
      tiers: [
        { key: 'ls-foundation', name: 'Local Foundation', price: 800 },
        { key: 'ls-growth', name: 'Local Growth Engine', price: 1500 },
        { key: 'ls-domination', name: 'Market Domination', price: 2800 }
      ]
    },
    'ai-automation': {
      name: 'AI Automation & Business Systems',
      url: 'services/ai-automation.html',
      billing: ' one-time',
      tiers: [
        { key: 'ai-starter', name: 'Automation Starter', price: 1200 },
        { key: 'ai-growth', name: 'Growth Automation System', price: 2500 },
        { key: 'ai-enterprise', name: 'Intelligent Business Infrastructure', price: 5000 }
      ]
    }
  };

  // Detect which service page we're on
  function detectCurrentService() {
    const path = window.location.pathname + window.location.href;
    if (path.includes('website-development')) return 'website-development';
    if (path.includes('facebook-instagram') || path.includes('performance-marketing')) return 'performance-marketing';
    if (path.includes('social-media')) return 'social-media';
    if (path.includes('google-ads')) return 'google-ads';
    if (path.includes('local-seo')) return 'local-seo';
    if (path.includes('ai-automation')) return 'ai-automation';
    return null;
  }

  // Build tiers dynamically from data-tier buttons on page
  function getPageTiers() {
    const tiers = {};
    document.querySelectorAll('[data-tier]').forEach(btn => {
      const key = btn.dataset.tier;
      const price = parseInt(btn.dataset.price) || 0;
      const label = btn.dataset.tierLabel || key;
      tiers[key] = { name: label, price: price };
    });
    if (Object.keys(tiers).length === 0) {
      return {
        starter: { name: 'Starter Growth Site', price: 899 },
        business: { name: 'Business Growth Engine', price: 1499 },
        authority: { name: 'Authority & Scale System', price: 2999 }
      };
    }
    return tiers;
  }

  // ---- Initialize ----
  document.addEventListener('DOMContentLoaded', () => {
    injectModals();
    wireGetStartedButtons();
  });

  // ============================================================
  //  GET STARTED BUTTONS — Opens popup directly, no login
  // ============================================================

  function wireGetStartedButtons() {
    document.querySelectorAll('[data-tier]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        selectedTier = btn.dataset.tier;
        selectedPrice = parseInt(btn.dataset.price);
        showOnboardingModal();
      });
    });
  }

  // ============================================================
  //  ONBOARDING / REQUIREMENTS MODAL
  // ============================================================

  function showOnboardingModal() {
    const overlay = document.getElementById('bgm-modal-overlay');
    const obCard = document.getElementById('bgm-onboarding-card');
    if (!overlay) return;

    obCard.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    prefillOnboarding();
    populateRecommendedServices();
  }

  function hideAllModals() {
    const overlay = document.getElementById('bgm-modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';

    setTimeout(() => {
      document.getElementById('bgm-onboarding-card').classList.remove('active');
    }, 350);
  }

  function prefillOnboarding() {
    const tierSelect = document.querySelector('[name="ob-tier"]');
    if (tierSelect && selectedTier) tierSelect.value = selectedTier;
    updatePaymentButton();
  }

  function updatePaymentButton() {
    const tierSelect = document.querySelector('[name="ob-tier"]');
    const payBtn = document.getElementById('ob-payment-btn');
    if (!tierSelect || !payBtn) return;

    const tiers = getPageTiers();
    const tier = tiers[tierSelect.value];
    let primaryPrice = 0;
    if (tier) {
      selectedTier = tierSelect.value;
      selectedPrice = tier.price;
      primaryPrice = tier.price;
    }

    // Add additional services total
    const addonsTotal = addedServices.reduce((sum, s) => sum + s.price, 0);
    const total = primaryPrice + addonsTotal;

    if (addonsTotal > 0) {
      payBtn.innerHTML = `Submit Inquiry — <strong>$${total.toLocaleString()}</strong> <span class="ob-price-breakdown">(Plan $${primaryPrice.toLocaleString()} + Add-ons $${addonsTotal.toLocaleString()})</span>`;
    } else {
      payBtn.innerHTML = `Submit Inquiry — <strong>$${total.toLocaleString()}</strong>`;
    }
  }

  // ============================================================
  //  RECOMMENDED SERVICES
  // ============================================================

  function populateRecommendedServices() {
    const container = document.getElementById('ob-recommended-services');
    if (!container) return;

    container.innerHTML = '';
    addedServices = [];

    const currentServiceKey = detectCurrentService();
    const isInSubfolder = window.location.pathname.includes('/services/');

    Object.entries(ALL_SERVICES).forEach(([key, service]) => {
      if (key === currentServiceKey) return;

      const billingLabel = service.billing === 'one-time' ? ' one-time' : service.billing;
      // Build correct relative URL: strip 'services/' prefix when already inside /services/
      const viewUrl = isInSubfolder ? service.url.replace('services/', '') : service.url;

      const serviceEl = document.createElement('div');
      serviceEl.className = 'ob-service-item';
      serviceEl.innerHTML = `
        <button class="ob-service-header" type="button" data-service="${key}">
          <span class="ob-service-name">${service.name}</span>
          <svg class="ob-service-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="ob-service-tiers" id="ob-tiers-${key}">
          ${service.tiers.map(tier => `
            <div class="ob-tier-row" id="ob-row-${tier.key}">
              <div class="ob-tier-info">
                <span class="ob-tier-name">${tier.name}</span>
                <span class="ob-tier-price">$${tier.price.toLocaleString()}${billingLabel}</span>
              </div>
              <div class="ob-tier-actions">
                <button type="button" class="ob-view-btn" data-url="${viewUrl}" title="View pricing details">View</button>
                <button type="button" class="ob-add-btn" data-tier-key="${tier.key}" data-tier-name="${tier.name}" data-tier-price="${tier.price}" data-service-name="${service.name}" title="Add to your project">Add</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      container.appendChild(serviceEl);

      // Accordion toggle
      serviceEl.querySelector('.ob-service-header').addEventListener('click', () => {
        serviceEl.classList.toggle('expanded');
      });

      // View buttons
      serviceEl.querySelectorAll('.ob-view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          window.open(btn.dataset.url, '_blank');
        });
      });

      // Add buttons
      serviceEl.querySelectorAll('.ob-add-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const tierKey = btn.dataset.tierKey;
          const tierName = btn.dataset.tierName;
          const tierPrice = parseInt(btn.dataset.tierPrice);
          const serviceName = btn.dataset.serviceName;

          const existing = addedServices.findIndex(s => s.key === tierKey);
          if (existing >= 0) {
            addedServices.splice(existing, 1);
            btn.textContent = 'Add';
            btn.classList.remove('added');
            document.getElementById(`ob-row-${tierKey}`).classList.remove('added');
          } else {
            const sameServiceKeys = ALL_SERVICES[Object.keys(ALL_SERVICES).find(k => ALL_SERVICES[k].name === serviceName)]?.tiers.map(t => t.key) || [];
            sameServiceKeys.forEach(k => {
              const idx = addedServices.findIndex(s => s.key === k);
              if (idx >= 0) {
                addedServices.splice(idx, 1);
                const otherBtn = container.querySelector(`[data-tier-key="${k}"]`);
                if (otherBtn) { otherBtn.textContent = 'Add'; otherBtn.classList.remove('added'); }
                const otherRow = document.getElementById(`ob-row-${k}`);
                if (otherRow) otherRow.classList.remove('added');
              }
            });

            addedServices.push({ key: tierKey, name: `${serviceName} — ${tierName}`, price: tierPrice });
            btn.textContent = 'Added ✓';
            btn.classList.add('added');
            document.getElementById(`ob-row-${tierKey}`).classList.add('added');
          }

          updatePaymentButton();
          updateAddedServicesSummary();
        });
      });
    });
  }

  function updateAddedServicesSummary() {
    const summary = document.getElementById('ob-added-summary');
    if (!summary) return;

    if (addedServices.length === 0) {
      summary.style.display = 'none';
      summary.innerHTML = '';
      return;
    }

    summary.style.display = 'block';
    summary.innerHTML = `
      <div class="ob-added-title">Added Services:</div>
      ${addedServices.map(s => `
        <div class="ob-added-item">
          <span>${s.name}</span>
          <span class="ob-added-price">$${s.price.toLocaleString()}</span>
        </div>
      `).join('')}
    `;
  }

  // Onboarding submit
  async function handleOnboarding(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = document.getElementById('ob-payment-btn');
    const errorEl = document.getElementById('ob-error');

    const city = form.querySelector('[name="ob-city"]').value.trim();
    const state = form.querySelector('[name="ob-state"]').value.trim();
    const zip = form.querySelector('[name="ob-zip"]').value.trim();
    const country = form.querySelector('[name="ob-country"]').value.trim();
    const address = [city, state, zip, country].filter(Boolean).join(', ');

    const data = {
      full_name: form.querySelector('[name="ob-name"]').value.trim(),
      business_name: form.querySelector('[name="ob-business"]').value.trim(),
      email: form.querySelector('[name="ob-email"]').value.trim(),
      phone: form.querySelector('[name="ob-phone"]').value.trim(),
      address: address,
      selected_tier: selectedTier,
      tier_price: selectedPrice,
      requirements: form.querySelector('[name="ob-requirements"]').value.trim(),
      website_url: form.querySelector('[name="ob-website"]').value.trim(),
      added_services: addedServices.map(s => s.name).join(', '),
      submitted_at: new Date().toISOString()
    };

    if (!data.full_name || !data.business_name || !data.email) {
      if (errorEl) { errorEl.textContent = 'Please fill in all required fields.'; errorEl.style.display = 'block'; }
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Submitting...';

    // Simulate submission (replace with your own endpoint if needed)
    try {
      // You can replace this with a real API call, e.g.:
      // await fetch('https://your-api.com/inquiries', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
      await new Promise(resolve => setTimeout(resolve, 1000));

      hideAllModals();
      form.reset();
      addedServices = [];
      showSuccessToast();
    } catch (err) {
      if (errorEl) { errorEl.textContent = 'Submission failed. Please try again.'; errorEl.style.display = 'block'; }
    } finally {
      submitBtn.disabled = false;
      updatePaymentButton();
    }
  }

  function showSuccessToast() {
    const toast = document.createElement('div');
    toast.className = 'bgm-success-toast';
    toast.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34D399" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <div>
        <strong>You're all set!</strong>
        <span>Our team will review your requirements and reach out shortly.</span>
      </div>
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 5000);
  }

  // ============================================================
  //  INJECT MODAL HTML (Onboarding Card Only — No Auth Card)
  // ============================================================

  function injectModals() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
    <div class="auth-overlay" id="bgm-modal-overlay">

      <!-- Onboarding / Requirements Card -->
      <div class="auth-modal onboarding-modal auth-panel" id="bgm-onboarding-card">
        <button class="auth-close" id="ob-close-btn" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div class="auth-header">
          <div class="ob-step-badge">Get Started</div>
          <h2 class="auth-title">Tell Us About Your Project</h2>
          <p class="auth-subtitle">Help us build the perfect growth engine for your business</p>
        </div>

        <form id="ob-form" autocomplete="off">
          <div class="ob-grid">
            <div class="auth-field">
              <label>Full Name <span class="required">*</span></label>
              <input type="text" name="ob-name" placeholder="John Smith" required>
            </div>
            <div class="auth-field">
              <label>Business Name <span class="required">*</span></label>
              <input type="text" name="ob-business" placeholder="Your Company" required>
            </div>
          </div>

          <div class="ob-grid">
            <div class="auth-field">
              <label>Email <span class="required">*</span></label>
              <input type="email" name="ob-email" placeholder="you@company.com" required>
            </div>
            <div class="auth-field">
              <label>Phone</label>
              <input type="tel" name="ob-phone" placeholder="+1 (555) 000-0000">
            </div>
          </div>

          <div class="ob-grid ob-grid--address">
            <div class="auth-field">
              <label>City</label>
              <input type="text" name="ob-city" placeholder="New York">
            </div>
            <div class="auth-field">
              <label>State</label>
              <input type="text" name="ob-state" placeholder="NY">
            </div>
            <div class="auth-field">
              <label>ZIP Code</label>
              <input type="text" name="ob-zip" placeholder="10001">
            </div>
            <div class="auth-field">
              <label>Country</label>
              <input type="text" name="ob-country" placeholder="United States" value="United States">
            </div>
          </div>

          <div class="ob-grid">
            <div class="auth-field">
              <label>Select Your Plan <span class="required">*</span></label>
              <select name="ob-tier" id="ob-tier-select" required>
              </select>
            </div>
            <div class="auth-field">
              <label>Current Website URL</label>
              <input type="url" name="ob-website" placeholder="https://yoursite.com">
            </div>
          </div>

          <div class="auth-field">
            <label>Project Requirements & Goals</label>
            <textarea name="ob-requirements" rows="3" placeholder="Tell us about your business goals, target audience, must-have features, design preferences, or any reference websites you like..."></textarea>
          </div>

          <!-- Recommended Services -->
          <div class="ob-services-section">
            <label class="ob-services-label">Other Recommended Services</label>
            <p class="ob-services-subtitle">Explore our other services and add them to your project</p>
            <div id="ob-recommended-services"></div>
            <div id="ob-added-summary" class="ob-added-summary" style="display:none;"></div>
          </div>

          <div class="auth-error" id="ob-error"></div>

          <button type="submit" class="ob-payment-btn" id="ob-payment-btn">
            Submit Inquiry — <strong>$899</strong>
          </button>

          <p class="ob-disclaimer">You won't be charged now. Our team will review your requirements and prepare a custom project proposal.</p>
        </form>
      </div>

    </div>`;

    document.body.appendChild(wrapper);

    // Wire close button
    document.getElementById('ob-close-btn').addEventListener('click', hideAllModals);

    // Close on overlay click
    document.getElementById('bgm-modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) hideAllModals();
    });

    // Form submit
    document.getElementById('ob-form').addEventListener('submit', handleOnboarding);

    // Tier select change
    document.getElementById('ob-tier-select').addEventListener('change', updatePaymentButton);

    // Populate tier dropdown
    const tierSelect = document.getElementById('ob-tier-select');
    const pageTiers = getPageTiers();
    Object.entries(pageTiers).forEach(([key, tier]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = `${tier.name} — $${tier.price.toLocaleString()}`;
      tierSelect.appendChild(opt);
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hideAllModals();
    });
  }

})();
