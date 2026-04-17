/* ═══════════════════════════════════════
   EXPOSUREGUARD — script.js
   ═══════════════════════════════════════ */

// ─── SVG GRADIENT (inject into DOM) ───
document.body.insertAdjacentHTML('afterbegin', `
  <svg class="svg-defs">
    <defs>
      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stop-color="#4ade80"/>
        <stop offset="50%"  stop-color="#fbbf24"/>
        <stop offset="100%" stop-color="#f87171"/>
      </linearGradient>
    </defs>
  </svg>
`);

// ─── STATE ───
let scanHistory = [];
let currentTheme = 'dark';

// ─── THEME ───
function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  document.getElementById('themeIcon').textContent = currentTheme === 'dark' ? '☀️' : '🌙';
}

// ─── ENTER KEY ───
document.getElementById('domainInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') handleScan();
});

// ─── SCAN ───
function handleScan() {
  const domain = document.getElementById('domainInput').value.trim();

  if (!domain) {
    showError('⚠️  Please enter a domain or IP address');
    return;
  }

  hideError();
  showLoading(domain);
  hideResults();
  hideHero();

  // Animate loading steps
  const steps = ['lstep1', 'lstep2', 'lstep3', 'lstep4'];
  steps.forEach((id, i) => {
    const el = document.getElementById(id);
    el.className = 'lstep';
  });

  steps.forEach((id, i) => {
    setTimeout(() => {
      // Mark previous as done
      if (i > 0) {
        const prev = document.getElementById(steps[i - 1]);
        prev.className = 'lstep done';
      }
      document.getElementById(id).className = 'lstep active';
    }, i * 240);
  });

  // Simulate scan delay
  setTimeout(() => {
    const score = 78;
    const result = {
      score,
      risk: score > 60 ? 'High' : score > 30 ? 'Medium' : 'Low',
      ports: [22, 80, 3306],
      services: ['SSH', 'HTTP', 'MySQL'],
      abuse: 75,
      ip: '93.184.216.34',
      location: '🇺🇸 United States',
      isp: 'Edgecast Inc.',
      malicious: 3,
      suspicious: 1,
      domain
    };

    // Mark last step done
    document.getElementById(steps[steps.length - 1]).className = 'lstep done';

    setTimeout(() => {
      hideLoading();
      renderResults(result);
    }, 300);
  }, 1400);
}

// ─── RENDER RESULTS ───
function renderResults(data) {
  // Score ring
  const circumference = 314;
  const offset = circumference - (data.score / 100) * circumference;
  const ring = document.getElementById('ringFill');
  ring.style.strokeDashoffset = circumference; // reset
  setTimeout(() => { ring.style.strokeDashoffset = offset; }, 50);

  // Animated score counter
  animateNumber('scoreNumber', 0, data.score, 900);

  // Gauge bar
  setTimeout(() => {
    document.getElementById('gaugeBar').style.width = data.score + '%';
  }, 50);

  // Risk badge
  const badge = document.getElementById('riskBadge');
  const riskClass = data.risk.toLowerCase();
  badge.className = 'risk-badge ' + riskClass;
  badge.textContent = data.risk === 'High' ? '🚨 HIGH RISK'
    : data.risk === 'Medium' ? '⚠️ MEDIUM RISK' : '✅ SECURE';

  // Score domain label
  document.getElementById('scoreDomain').textContent = data.domain;

  // Stats
  document.getElementById('statPortsVal').textContent = data.ports.length;
  document.getElementById('statSuspiciousVal').textContent = data.suspicious;
  document.getElementById('statAbuseVal').textContent = data.abuse + '%';
  document.getElementById('statMaliciousVal').textContent = data.malicious;

  // AI text
  document.getElementById('aiText').innerHTML =
    `This system is at <b>${data.risk.toUpperCase()} RISK</b> due to ${data.ports.length} open ports, a ${data.abuse}% abuse score, and ${data.malicious} malicious flag${data.malicious !== 1 ? 's' : ''} detected.`;

  // Overview tab
  document.getElementById('infoIp').textContent = data.ip;
  document.getElementById('infoLocation').textContent = data.location;
  document.getElementById('infoIsp').textContent = data.isp;
  document.getElementById('infoStatus').textContent = '⬡ Flagged';
  document.getElementById('infoStatus').className = 'info-val red';

  // Technical tab (ports)
  const portsList = document.getElementById('portsList');
  portsList.innerHTML = data.ports.map((p, i) => `
    <div class="port-row">
      <span class="port-num">${p}</span>
      <span class="port-service">${data.services[i]}</span>
      <span class="port-status">OPEN</span>
    </div>
  `).join('');

  // Threats tab
  const threatBars = document.getElementById('threatBars');
  const total = data.malicious + data.suspicious;
  threatBars.innerHTML = `
    <div class="threat-row">
      <div class="threat-row-head">
        <span class="threat-name">Malicious</span>
        <span class="threat-count red">${data.malicious}</span>
      </div>
      <div class="threat-bar-bg">
        <div class="threat-bar-fill red" style="width:${Math.min(100, (data.malicious / (total + 1)) * 100)}%"></div>
      </div>
    </div>
    <div class="threat-row">
      <div class="threat-row-head">
        <span class="threat-name">Suspicious</span>
        <span class="threat-count yellow">${data.suspicious}</span>
      </div>
      <div class="threat-bar-bg">
        <div class="threat-bar-fill yellow" style="width:${Math.min(100, (data.suspicious / (total + 1)) * 100)}%"></div>
      </div>
    </div>
    <div class="threat-row">
      <div class="threat-row-head">
        <span class="threat-name">Abuse Score</span>
        <span class="threat-count red">${data.abuse}%</span>
      </div>
      <div class="threat-bar-bg">
        <div class="threat-bar-fill red" style="width:${data.abuse}%"></div>
      </div>
    </div>
  `;

  // History
  scanHistory = [{ domain: data.domain, score: data.score, risk: data.risk }, ...scanHistory.slice(0, 4)];
  renderHistory();

  showResults();

  // Reset to overview tab
  switchTab('overview', document.querySelector('.tab[data-tab="overview"]'));
}

// ─── HISTORY ───
function renderHistory() {
  const list = document.getElementById('historyList');
  if (scanHistory.length === 0) {
    list.innerHTML = '<div class="history-empty">No previous scans this session.</div>';
    return;
  }
  list.innerHTML = scanHistory.map(h => `
    <div class="history-row">
      <span class="history-domain">${h.domain}</span>
      <span class="history-score ${h.risk.toLowerCase()}">${h.score} — ${h.risk}</span>
    </div>
  `).join('');
}

// ─── TABS ───
function switchTab(name, btn) {
  // Buttons
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');

  // Panels
  ['overview', 'technical', 'threats'].forEach(t => {
    const panel = document.getElementById('tab-' + t);
    if (panel) panel.style.display = t === name ? 'block' : 'none';
  });
}

// ─── ACCORDION ───
function toggleAccordion(id) {
  const card = document.getElementById(id);
  card.classList.toggle('open');
}

// ─── HELPERS ───
function showError(msg) {
  const el = document.getElementById('errorBanner');
  el.textContent = msg;
  el.style.display = 'block';
}
function hideError() {
  document.getElementById('errorBanner').style.display = 'none';
}
function showLoading(domain) {
  document.getElementById('loadingDomain').textContent = domain;
  document.getElementById('loadingState').style.display = 'flex';
}
function hideLoading() {
  document.getElementById('loadingState').style.display = 'none';
}
function showResults() {
  document.getElementById('results').style.display = 'flex';
}
function hideResults() {
  document.getElementById('results').style.display = 'none';
}
function hideHero() {
  document.getElementById('heroSection').style.display = 'none';
}

function animateNumber(id, from, to, duration) {
  const el = document.getElementById(id);
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3); // ease-out-cubic
    el.textContent = Math.round(from + (to - from) * ease);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
