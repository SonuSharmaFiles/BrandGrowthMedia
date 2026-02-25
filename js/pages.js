/* ============================================================
   BrandGrowth Media — Pages JS v2
   Accordion, pricing toggle, case filters, form handlers
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ---- FAQ Accordion ----
    document.querySelectorAll('.accordion-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const content = item.querySelector('.accordion-content');
            const isActive = item.classList.contains('active');

            // Close all
            document.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('active');
                i.querySelector('.accordion-content').style.maxHeight = null;
            });

            // Toggle current
            if (!isActive) {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });

    // Open first accordion by default
    const firstAccordion = document.querySelector('.accordion-item.active .accordion-content');
    if (firstAccordion) firstAccordion.style.maxHeight = firstAccordion.scrollHeight + 'px';

    // ---- Pricing Toggle ----
    const toggle = document.getElementById('pricing-toggle');
    const monthlyLabel = document.getElementById('monthly-label');
    const annualLabel = document.getElementById('annual-label');

    if (toggle) {
        let isAnnual = false;

        toggle.addEventListener('click', () => {
            isAnnual = !isAnnual;
            toggle.classList.toggle('active', isAnnual);
            monthlyLabel.classList.toggle('active', !isAnnual);
            annualLabel.classList.toggle('active', isAnnual);

            document.querySelectorAll('.price[data-monthly]').forEach(el => {
                const val = isAnnual ? el.dataset.annual : el.dataset.monthly;
                el.innerHTML = `$${val}<span>/mo</span>`;
            });
        });
    }

    // ---- Case Study Filters ----
    document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            document.querySelectorAll('.case-card').forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // ---- Contact Form ----
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            btn.textContent = 'Message Sent';
            btn.style.background = 'var(--success)';
            btn.style.color = 'var(--white-pure)';
            btn.disabled = true;
            setTimeout(() => {
                btn.textContent = 'Send Message';
                btn.style.background = '';
                btn.style.color = '';
                btn.disabled = false;
                contactForm.reset();
            }, 3000);
        });
    }

    // ---- Portal Form ----
    const portalForm = document.getElementById('portal-form');
    if (portalForm) {
        portalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = portalForm.querySelector('button[type="submit"]');
            btn.textContent = 'Signing In...';
            btn.disabled = true;
            setTimeout(() => {
                btn.textContent = 'Sign In';
                btn.disabled = false;
            }, 2000);
        });
    }

});
