/* ============================================================
   BrandGrowthMedia — Auth & Onboarding System
   Powered by Supabase
   ============================================================ */

(function () {
  'use strict';

  // ---- Supabase Config ----
  const SUPABASE_URL = 'https://zvyxphrynnuukyhsrqcg.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_2RBY7xSt4kZTpmCj3Urw0A_z1e648X9';

  let sb = null;
  let currentUser = null;
  let selectedTier = null;
  let selectedPrice = null;
  let addedServices = []; // additional services added by user

  // ---- All Services Catalog ----
  const ALL_SERVICES = {
    'website-development': {
      name: 'Website Development',
      url: 'services/website-development.html',
      billing: 'one-time',
      tiers: [
        { key: 'wd-starter', name: 'Starter Growth Site', price: 899 },
        { key: 'wd-business', name: 'Business Growth Engine', price: 1499 },
        { key: 'wd-authority', name: 'Authority & Scale System', price: 2999 }
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
        { key: 'ga-starter', name: 'Starter', price: 500 },
        { key: 'ga-growth', name: 'Growth', price: 1200 },
        { key: 'ga-domination', name: 'Domination', price: 2500 }
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
  document.addEventListener('DOMContentLoaded', async () => {
    if (!window.supabase) {
      console.warn('Supabase SDK not loaded');
      return;
    }
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Restore pending tier from sessionStorage (survives OAuth redirect)
    const pendingTier = sessionStorage.getItem('bgm_pending_tier');
    const pendingPrice = sessionStorage.getItem('bgm_pending_price');
    if (pendingTier) {
      selectedTier = pendingTier;
      selectedPrice = parseInt(pendingPrice) || 0;
    }

    injectModals();
    injectHeaderAuth();
    wireGetStartedButtons();
    await checkAuthState();

    sb.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        currentUser = session.user;
        syncHeader(true);

        // If returning from OAuth with a pending tier, show onboarding
        if (selectedTier && sessionStorage.getItem('bgm_pending_tier')) {
          sessionStorage.removeItem('bgm_pending_tier');
          sessionStorage.removeItem('bgm_pending_price');
          setTimeout(() => showOnboardingModal(), 300);
        }
      } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        syncHeader(false);
      }
    });
  });

  // ---- Check Auth State ----
  async function checkAuthState() {
    try {
      const { data: { session } } = await sb.auth.getSession();
      if (session) {
        currentUser = session.user;
        syncHeader(true);
      } else {
        syncHeader(false);
      }
    } catch (e) {
      console.error('Auth check failed:', e);
      syncHeader(false);
    }
  }

  // ============================================================
  //  HEADER LOGIN BUTTON
  // ============================================================

  function injectHeaderAuth() {
    const navCta = document.querySelector('.nav-cta');
    if (navCta) {
      const loginBtn = document.createElement('button');
      loginBtn.className = 'header-login-btn';
      loginBtn.id = 'header-login-btn';
      loginBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Login`;
      loginBtn.addEventListener('click', () => showAuthModal('login'));
      navCta.insertBefore(loginBtn, navCta.firstChild);

      const avatarWrap = document.createElement('div');
      avatarWrap.className = 'header-user-wrap';
      avatarWrap.id = 'header-user-wrap';
      avatarWrap.style.display = 'none';
      avatarWrap.innerHTML = `
        <button class="header-user-avatar" id="header-avatar-btn">
          <span class="avatar-initial" id="avatar-initial">U</span>
        </button>
        <div class="header-user-dropdown" id="header-user-dropdown">
          <div class="dropdown-user-info">
            <span class="dropdown-user-name" id="dropdown-user-name">User</span>
            <span class="dropdown-user-email" id="dropdown-user-email">user@email.com</span>
          </div>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item" id="dropdown-logout">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      `;
      navCta.insertBefore(avatarWrap, navCta.firstChild);

      document.getElementById('header-avatar-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('header-user-dropdown').classList.toggle('show');
      });

      document.getElementById('dropdown-logout').addEventListener('click', async () => {
        await sb.auth.signOut();
        currentUser = null;
        syncHeader(false);
        document.getElementById('header-user-dropdown').classList.remove('show');
      });

      document.addEventListener('click', () => {
        const dd = document.getElementById('header-user-dropdown');
        if (dd) dd.classList.remove('show');
      });
    }

    const mobileLinks = document.querySelector('.mobile-nav-links');
    if (mobileLinks) {
      const mobileLogin = document.createElement('a');
      mobileLogin.href = '#';
      mobileLogin.id = 'mobile-login-link';
      mobileLogin.textContent = 'Login';
      mobileLogin.addEventListener('click', (e) => {
        e.preventDefault();
        const toggle = document.querySelector('.mobile-toggle');
        const overlay = document.querySelector('.mobile-nav-overlay');
        if (toggle) toggle.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
        showAuthModal('login');
      });
      mobileLinks.appendChild(mobileLogin);
    }
  }

  function syncHeader(isLoggedIn) {
    const loginBtn = document.getElementById('header-login-btn');
    const userWrap = document.getElementById('header-user-wrap');
    const mobileLogin = document.getElementById('mobile-login-link');

    if (isLoggedIn && currentUser) {
      const email = currentUser.email || '';
      const name = currentUser.user_metadata?.full_name || email.split('@')[0] || 'User';
      const initial = name.charAt(0).toUpperCase();

      if (loginBtn) loginBtn.style.display = 'none';
      if (userWrap) {
        userWrap.style.display = 'flex';
        document.getElementById('avatar-initial').textContent = initial;
        document.getElementById('dropdown-user-name').textContent = name;
        document.getElementById('dropdown-user-email').textContent = email;
      }
      if (mobileLogin) {
        mobileLogin.textContent = name;
        mobileLogin.onclick = (e) => { e.preventDefault(); };
      }
    } else {
      if (loginBtn) loginBtn.style.display = 'inline-flex';
      if (userWrap) userWrap.style.display = 'none';
      if (mobileLogin) {
        mobileLogin.textContent = 'Login';
        mobileLogin.onclick = (e) => {
          e.preventDefault();
          const toggle = document.querySelector('.mobile-toggle');
          const overlay = document.querySelector('.mobile-nav-overlay');
          if (toggle) toggle.classList.remove('active');
          if (overlay) overlay.classList.remove('active');
          document.body.style.overflow = '';
          showAuthModal('login');
        };
      }
    }
  }

  // ============================================================
  //  GET STARTED BUTTONS
  // ============================================================

  function wireGetStartedButtons() {
    document.querySelectorAll('[data-tier]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        selectedTier = btn.dataset.tier;
        selectedPrice = parseInt(btn.dataset.price);

        if (currentUser) {
          showOnboardingModal();
        } else {
          showAuthModal('signup');
        }
      });
    });
  }

  // ============================================================
  //  AUTH MODAL
  // ============================================================

  function showAuthModal(mode) {
    const overlay = document.getElementById('bgm-modal-overlay');
    const authCard = document.getElementById('bgm-auth-card');
    const obCard = document.getElementById('bgm-onboarding-card');
    if (!overlay) return;

    authCard.classList.add('active');
    obCard.classList.remove('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    switchAuthTab(mode || 'signup');
    clearAuthErrors();
  }

  function hideAllModals() {
    const overlay = document.getElementById('bgm-modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    document.body.style.overflow = '';

    setTimeout(() => {
      document.getElementById('bgm-auth-card').classList.remove('active');
      document.getElementById('bgm-onboarding-card').classList.remove('active');
      clearAuthErrors();
    }, 350);
  }

  // Smooth crossfade from auth card → onboarding card
  function transitionToOnboarding() {
    const authCard = document.getElementById('bgm-auth-card');
    const obCard = document.getElementById('bgm-onboarding-card');

    // Fade out auth card
    authCard.classList.add('exiting');

    setTimeout(() => {
      authCard.classList.remove('active', 'exiting');

      // Pre-fill onboarding data
      prefillOnboarding();
      populateRecommendedServices();

      // Fade in onboarding card
      obCard.classList.add('active');
    }, 300);
  }

  function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form-panel').forEach(p => p.classList.remove('active'));
    const tabEl = document.querySelector(`.auth-tab[data-tab="${tab}"]`);
    const panelEl = document.getElementById(`auth-${tab}-panel`);
    if (tabEl) tabEl.classList.add('active');
    if (panelEl) panelEl.classList.add('active');
  }

  function clearAuthErrors() {
    document.querySelectorAll('.auth-error').forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });
  }

  function showAuthError(panelId, message) {
    const el = document.querySelector(`#${panelId} .auth-error`);
    if (el) { el.textContent = message; el.style.display = 'block'; }
  }

  // Signup handler
  async function handleSignup(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('[name="signup-email"]').value.trim();
    const password = form.querySelector('[name="signup-password"]').value;
    const confirmPw = form.querySelector('[name="signup-confirm"]').value;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (password !== confirmPw) { showAuthError('auth-signup-panel', 'Passwords do not match.'); return; }
    if (password.length < 6) { showAuthError('auth-signup-panel', 'Password must be at least 6 characters.'); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';

    try {
      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) throw error;
      currentUser = data.user;
      form.reset();
      transitionToOnboarding();
    } catch (err) {
      showAuthError('auth-signup-panel', err.message || 'Signup failed. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  }

  // Login handler
  async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('[name="login-email"]').value.trim();
    const password = form.querySelector('[name="login-password"]').value;
    const submitBtn = form.querySelector('button[type="submit"]');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing In...';

    try {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      currentUser = data.user;
      form.reset();

      if (selectedTier) {
        transitionToOnboarding();
      } else {
        hideAllModals();
      }
    } catch (err) {
      showAuthError('auth-login-panel', err.message || 'Login failed. Check your credentials.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  }

  // Google OAuth
  async function handleGoogleAuth() {
    try {
      // Save pending tier so it survives the OAuth redirect
      if (selectedTier) {
        sessionStorage.setItem('bgm_pending_tier', selectedTier);
        sessionStorage.setItem('bgm_pending_price', selectedPrice);
      }
      const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.href } });
      if (error) throw error;
    } catch (err) { alert('Google sign-in failed: ' + (err.message || 'Unknown error')); }
  }



  // ============================================================
  //  ONBOARDING MODAL
  // ============================================================

  function prefillOnboarding() {
    const modal = document.getElementById('bgm-onboarding-card');
    if (!modal) return;

    const emailField = modal.querySelector('[name="ob-email"]');
    if (emailField && currentUser) emailField.value = currentUser.email || '';

    const tierSelect = modal.querySelector('[name="ob-tier"]');
    if (tierSelect && selectedTier) tierSelect.value = selectedTier;

    updatePaymentButton();
  }

  function showOnboardingModal() {
    const overlay = document.getElementById('bgm-modal-overlay');
    const authCard = document.getElementById('bgm-auth-card');
    const obCard = document.getElementById('bgm-onboarding-card');
    if (!overlay) return;

    authCard.classList.remove('active');
    obCard.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    prefillOnboarding();
    populateRecommendedServices();
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
      payBtn.innerHTML = `Continue to Payment — <strong>$${total.toLocaleString()}</strong> <span class="ob-price-breakdown">(Plan $${primaryPrice.toLocaleString()} + Add-ons $${addonsTotal.toLocaleString()})</span>`;
    } else {
      payBtn.innerHTML = `Continue to Payment — <strong>$${total.toLocaleString()}</strong>`;
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

    // Determine base path for links
    const isInSubfolder = window.location.pathname.includes('/services/');
    const basePath = isInSubfolder ? '' : 'services/';

    Object.entries(ALL_SERVICES).forEach(([key, service]) => {
      if (key === currentServiceKey) return; // skip current service

      const billingLabel = service.billing === 'one-time' ? ' one-time' : service.billing;

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
                <button type="button" class="ob-view-btn" data-url="${basePath}${service.url}" title="View pricing details">View</button>
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
          const url = btn.dataset.url;
          window.open(url, '_blank');
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
            // Remove
            addedServices.splice(existing, 1);
            btn.textContent = 'Add';
            btn.classList.remove('added');
            document.getElementById(`ob-row-${tierKey}`).classList.remove('added');
          } else {
            // Remove any other tier from the same service first
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

    // Build address from parts
    const city = form.querySelector('[name="ob-city"]').value.trim();
    const state = form.querySelector('[name="ob-state"]').value.trim();
    const zip = form.querySelector('[name="ob-zip"]').value.trim();
    const country = form.querySelector('[name="ob-country"]').value.trim();
    const address = [city, state, zip, country].filter(Boolean).join(', ');

    const data = {
      user_id: currentUser.id,
      full_name: form.querySelector('[name="ob-name"]').value.trim(),
      business_name: form.querySelector('[name="ob-business"]').value.trim(),
      email: form.querySelector('[name="ob-email"]').value.trim(),
      phone: form.querySelector('[name="ob-phone"]').value.trim(),
      address: address,
      selected_tier: selectedTier,
      tier_price: selectedPrice,
      requirements: form.querySelector('[name="ob-requirements"]').value.trim(),
      website_url: form.querySelector('[name="ob-website"]').value.trim()
    };

    if (!data.full_name || !data.business_name || !data.email) {
      if (errorEl) { errorEl.textContent = 'Please fill in all required fields.'; errorEl.style.display = 'block'; }
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Submitting...';

    try {
      const { error } = await sb.from('onboarding').insert([data]);
      if (error) throw error;

      hideAllModals();
      form.reset();
      addedServices = [];
      showSuccessToast();
    } catch (err) {
      if (errorEl) { errorEl.textContent = err.message || 'Submission failed. Please try again.'; errorEl.style.display = 'block'; }
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
        <span>Our team will reach out shortly to get your project started.</span>
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
  //  INJECT MODAL HTML (Single Overlay, Two Cards)
  // ============================================================

  function injectModals() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
    <div class="auth-overlay" id="bgm-modal-overlay">

      <!-- Auth Card -->
      <div class="auth-modal auth-panel active" id="bgm-auth-card">
        <button class="auth-close" id="auth-close-btn" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div class="auth-header">
          <div class="auth-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F6A724" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <h2 class="auth-title">Welcome to BrandGrowthMedia</h2>
          <p class="auth-subtitle">Start your growth journey today</p>
        </div>

        <div class="auth-tabs">
          <button class="auth-tab active" data-tab="signup">Sign Up</button>
          <button class="auth-tab" data-tab="login">Log In</button>
        </div>

        <!-- Signup Panel -->
        <div class="auth-form-panel active" id="auth-signup-panel">
          <form id="auth-signup-form" autocomplete="off">
            <div class="auth-field">
              <label>Email</label>
              <input type="email" name="signup-email" placeholder="you@company.com" required>
            </div>
            <div class="auth-field">
              <label>Password</label>
              <input type="password" name="signup-password" placeholder="Min 6 characters" required minlength="6">
            </div>
            <div class="auth-field">
              <label>Confirm Password</label>
              <input type="password" name="signup-confirm" placeholder="Re-enter password" required minlength="6">
            </div>
            <div class="auth-error"></div>
            <button type="submit" class="auth-submit-btn">Create Account</button>
          </form>
          <div class="auth-divider"><span>or continue with</span></div>
          <div class="auth-social-row">
            <button class="auth-social-btn" id="auth-google-btn" type="button">
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Google
            </button>

          </div>
        </div>

        <!-- Login Panel -->
        <div class="auth-form-panel" id="auth-login-panel">
          <form id="auth-login-form" autocomplete="off">
            <div class="auth-field">
              <label>Email</label>
              <input type="email" name="login-email" placeholder="you@company.com" required>
            </div>
            <div class="auth-field">
              <label>Password</label>
              <input type="password" name="login-password" placeholder="Enter your password" required>
            </div>
            <div class="auth-error"></div>
            <button type="submit" class="auth-submit-btn">Sign In</button>
          </form>
          <div class="auth-divider"><span>or continue with</span></div>
          <div class="auth-social-row">
            <button class="auth-social-btn auth-google-btn-login" type="button">
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Google
            </button>

          </div>
        </div>
      </div>

      <!-- Onboarding Card -->
      <div class="auth-modal onboarding-modal auth-panel" id="bgm-onboarding-card">
        <button class="auth-close" id="ob-close-btn" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div class="auth-header">
          <div class="ob-step-badge">Almost There</div>
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
            Continue to Payment — <strong>$899</strong>
          </button>

          <p class="ob-disclaimer">You won't be charged now. Our team will review your requirements and prepare a custom project proposal.</p>
        </form>
      </div>

    </div>`;

    document.body.appendChild(wrapper);

    // Wire close buttons
    document.getElementById('auth-close-btn').addEventListener('click', hideAllModals);
    document.getElementById('ob-close-btn').addEventListener('click', hideAllModals);

    // Close on overlay click
    document.getElementById('bgm-modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) hideAllModals();
    });

    // Tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
    });

    // Forms
    document.getElementById('auth-signup-form').addEventListener('submit', handleSignup);
    document.getElementById('auth-login-form').addEventListener('submit', handleLogin);
    document.getElementById('ob-form').addEventListener('submit', handleOnboarding);

    // Social auth
    document.getElementById('auth-google-btn').addEventListener('click', handleGoogleAuth);
    document.querySelector('.auth-google-btn-login').addEventListener('click', handleGoogleAuth);

    // Tier select
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
