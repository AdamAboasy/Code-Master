// ── Language System ──
let currentLang = 'en';

function setLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.body.classList.toggle('ar', lang === 'ar');
  const toggleEl = document.getElementById('lang-toggle');
  if (toggleEl) toggleEl.textContent = lang === 'en' ? 'عربي' : 'English';

  // Translate all data-en / data-ar elements
  document.querySelectorAll('[data-en]').forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (!text) return;
    // Handle innerHTML for elements with spans or markup
    if (text.includes('<span>') || text.includes('<br') || text.includes('&lt;')) {
      el.innerHTML = text;
    } else {
      el.textContent = text;
    }
  });

  // Translate placeholders
  document.querySelectorAll('[data-ph-en]').forEach(el => {
    el.placeholder = el.getAttribute(`data-ph-${lang}`) || '';
  });

  // Translate select options
  document.querySelectorAll('select option[data-en]').forEach(opt => {
    opt.textContent = opt.getAttribute(`data-${lang}`) || opt.getAttribute('data-en');
  });

  try { localStorage.setItem('lang', lang); } catch (e) { }
}

const langToggleBtn = document.getElementById('lang-toggle');
if (langToggleBtn) {
  langToggleBtn.addEventListener('click', () => {
    setLang(currentLang === 'en' ? 'ar' : 'en');
  });
}

// ── Scroll Progress ──
const bar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = `${(scrollTop / docHeight) * 100}%`;
});

// ── Reveal on scroll ──
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
reveals.forEach(el => observer.observe(el));

// ── Hamburger ──
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── Contact Form → WhatsApp ──
document.getElementById('contact-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const btn = document.getElementById('submit-btn');
  const text = document.getElementById('btn-text');

  // Collect fields
  const name = (this.querySelector('[name="name"]').value || '—').trim();
  const email = (this.querySelector('[name="email"]').value || '—').trim();
  const phone = (this.querySelector('[name="phone"]').value || '—').trim();
  const service = (this.querySelector('[name="service"]').value || '—').trim();
  const budget = (this.querySelector('[name="budget"]').value || '—').trim();
  const message = (this.querySelector('[name="message"]').value || '—').trim();

  const waNumber = '201010014590';

  const msg =
    `🌐 *New Project Request — Code Màster*

👤 *Name:* ${name}
📧 *Email:* ${email}
📱 *Phone:* ${phone}
🛠 *Service:* ${service}
💰 *Budget:* ${budget}

📝 *Message:*
${message}`;

  btn.disabled = true;
  text.textContent = currentLang === 'en' ? '⏳ Opening WhatsApp...' : '⏳ جاري فتح واتساب...';

  setTimeout(() => {
    const waURL = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
    window.open(waURL, '_blank');
    this.style.display = 'none';
    document.getElementById('form-success').style.display = 'block';
  }, 800);
});

// Apply saved or document language on load
try {
  const saved = localStorage.getItem('lang');
  const initial = saved || document.documentElement.lang || 'en';
  setLang(initial);
} catch (e) {
  setLang(document.documentElement.lang || 'en');
}

// ── Counter animation ──
function animateCounter(el, target) {
  let current = 0;
  const duration = 1500;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = (target >= 50 ? '+' : '') + Math.floor(current) + (target === 2 ? '+' : '');
    if (current >= target) clearInterval(timer);
  }, 16);
}

const statNums = document.querySelectorAll('.stat-num');
const statObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const rawText = entry.target.textContent;
      const num = parseInt(rawText.replace(/\D/g, ''), 10);
      animateCounter(entry.target, num);
      statObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
statNums.forEach(el => statObs.observe(el));

// ── Jobs Filters ──
document.querySelectorAll('.filter-btn-j').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn-j').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.jfilter;
    let visible = 0;
    document.querySelectorAll('.job-card').forEach(card => {
      const cats = card.dataset.jcat || '';
      if (filter === 'all' || cats.includes(filter)) {
        card.classList.remove('j-hidden'); visible++;
      } else {
        card.classList.add('j-hidden');
      }
    });
    document.getElementById('jobs-no-results').style.display = visible === 0 ? 'block' : 'none';
  });
});

// ── Apply Modal ──
function openApplyModal(jobTitle) {
  document.getElementById('modal-job-title').textContent = jobTitle;
  document.getElementById('apply-form').style.display = 'block';
  document.getElementById('apply-success').style.display = 'none';
  document.getElementById('apply-submit-btn').disabled = false;
  const btnTxt = document.getElementById('apply-btn-text');
  btnTxt.textContent = currentLang === 'en' ? '🚀 Submit Application' : '🚀 أرسل الطلب';
  document.getElementById('apply-modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeApplyModal() {
  document.getElementById('apply-modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('apply-modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('apply-modal-overlay')) closeApplyModal();
});

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeApplyModal(); });

document.getElementById('apply-form').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('apply-submit-btn');
  const txt = document.getElementById('apply-btn-text');

  const jobTitle = document.getElementById('modal-job-title').textContent || '—';
  const inputs = form.querySelectorAll('input, select, textarea');
  const name = (inputs[0]?.value || '—').trim();
  const email = (inputs[1]?.value || '—').trim();
  const phone = (inputs[2]?.value || '—').trim();
  const exp = (inputs[3]?.value || '—').trim();
  const portfolio = (inputs[4]?.value || '—').trim();
  const why = (inputs[5]?.value || '—').trim();

  const waNumber = '201010014590';

  const msg =
    `💼 *New Job Application — Code Màster*

🎯 *Position:* ${jobTitle}

👤 *Name:* ${name}
📧 *Email:* ${email}
📱 *Phone:* ${phone}
📅 *Experience:* ${exp}
🔗 *Portfolio:* ${portfolio}

✍️ *Why Code Màster?*
${why}`;

  btn.disabled = true;
  txt.textContent = currentLang === 'en' ? '⏳ Opening WhatsApp...' : '⏳ جاري فتح واتساب...';

  setTimeout(() => {
    const waURL = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
    window.open(waURL, '_blank');
    document.getElementById('apply-form').style.display = 'none';
    document.getElementById('apply-success').style.display = 'block';
  }, 800);
});

function updateCVName(input) {
  if (input.files && input.files[0]) {
    document.getElementById('upload-label').innerHTML = `✅ <span>${input.files[0].name}</span>`;
  }
}