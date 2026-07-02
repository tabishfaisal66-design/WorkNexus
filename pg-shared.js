/* ════════ worknexus Shared Utilities ════════ */
let _toastTimer;
function showToast(msg) {
  const t = document.getElementById('pg-toast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

function pgGetUser() {
  const u = JSON.parse(localStorage.getItem('ln_current_user'));
  if (!u) { alert('Please sign in first.'); window.location.href = 'index.html'; return null; }
  return u;
}

function pgGetProfile(email) { return JSON.parse(localStorage.getItem('pg_profile_' + email)) || {}; }
function pgSaveProfile(email, data) { localStorage.setItem('pg_profile_' + email, JSON.stringify(data)); }

function pgAvatarInner(profile, user) {
  const name = profile.name || user.name || 'User';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const imgUrl = profile.avatar || profile.profileImg || user.profileImg || user.avatar;
  if (imgUrl) return `<img src="${imgUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="avatar"/>`;
  return initials;
}

function pgBuildNav(activePage) {
  const user = pgGetUser(); if (!user) return;
  const profile = pgGetProfile(user.email);
  const name = profile.name || user.name || 'User';
  const avatarInner = pgAvatarInner(profile, user);

  const pages = [
    { id: 'feed',     href: 'dashboard.html', icon: 'fa-home',      label: 'Home'     },
    { id: 'jobs',     href: 'jobs.html',       icon: 'fa-briefcase', label: 'Jobs'     },
    { id: 'messages', href: 'messages.html',   icon: 'fa-comments',  label: 'Messages' },
    { id: 'alerts',   href: 'alerts.html',     icon: 'fa-bell',      label: 'Alerts'   },
  ];

  document.getElementById('pg-nav').innerHTML = `
    <div class="page-header-inner">
      <a href="dashboard.html" class="flex items-center gap-2 text-decoration-none" style="flex-shrink:0;">
        <span class="inline-flex items-center justify-center bg-sky-600 dark:bg-sky-500 text-white font-black text-sm rounded px-1.5 py-0.5 tracking-tighter uppercase font-sans">WN</span>
        <span class="text-xs font-black tracking-widest text-slate-400 hidden sm:inline">WorkNexus</span>
      </a>

      <!-- Mobile Search Input (logo ke baad, sirf mobile par dikhta hai) -->
      <div class="pg-mobile-search">
        <i class="fas fa-search" style="position:absolute;left:9px;top:50%;transform:translateY(-50%);color:#475569;font-size:11px;pointer-events:none;"></i>
        <input type="text" placeholder="Search..." oninput="pgRunSearch(this.value)"
          style="width:100%;background:#0f172a;border:1px solid #1e293b;border-radius:9999px;padding:6px 10px 6px 28px;font-size:11px;color:#e2e8f0;outline:none;"
          onfocus="this.style.borderColor='#38bdf8'" onblur="this.style.borderColor='#1e293b'"/>
      </div>

      <div class="flex items-center gap-1">
        ${pages.map(p => {
          let badge = '';
          if (p.id === 'alerts')   badge = `<span style="position:absolute;top:2px;right:6px;width:14px;height:14px;background:#f43f5e;border-radius:50%;font-size:8px;font-weight:900;color:white;display:flex;align-items:center;justify-content:center;">3</span>`;
          if (p.id === 'messages') badge = `<span style="position:absolute;top:2px;right:6px;width:14px;height:14px;background:#38bdf8;border-radius:50%;font-size:8px;font-weight:900;color:#020617;display:flex;align-items:center;justify-content:center;">2</span>`;
          return `<button onclick="window.location='${p.href}'" class="nav-icon-btn ${activePage===p.id?'active':''}" style="position:relative;">
            <i class="fas ${p.icon}"></i><span>${p.label}</span>${badge}
          </button>`;
        }).join('')}
        <div class="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-full pl-2 pr-1 py-1 ml-1">
          <div class="w-2 h-2 rounded-full bg-emerald-500 pg-nav-online-dot" style="animation:pulse 2s infinite;flex-shrink:0;"></div>
          <span class="text-xs font-bold text-slate-300 pg-nav-username" style="max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${name}</span>
          <button onclick="window.location='profile.html'" style="width:28px;height:28px;border-radius:50%;background:#0c4a6e30;border:1px solid ${activePage==='profile'?'#38bdf8':'#0c4a6e60'};color:#38bdf8;font-size:11px;font-weight:900;cursor:pointer;overflow:hidden;display:flex;align-items:center;justify-content:center;" title="View Profile">${avatarInner}</button>
        </div>
        <button onclick="pgLogout()" class="nav-icon-btn" style="color:#f43f5e;" title="Logout">
          <i class="fas fa-sign-out-alt"></i><span>Logout</span>
        </button>
        <!-- Hamburger button (sirf mobile par, both sidebars open karta hai) -->
        <button class="pg-hamburger-nav" onclick="typeof toggleMobileMenu==='function'&&toggleMobileMenu()" title="Menu">
          <i class="fas fa-bars"></i>
        </button>
      </div>
    </div>`;
}

function pgLogout() {
  localStorage.removeItem('ln_current_user');
  window.location.href = 'index.html';
}

function pgBuildLeftSidebar(containerId) {
  const user = pgGetUser(); if (!user) return;
  const profile = pgGetProfile(user.email);
  const name = profile.name || user.name || 'User';
  const bio  = profile.bio  || user.bio  || 'WorkNexus Member';
  const city = profile.city || ''; const country = profile.country || '';
  const loc  = [city, country].filter(Boolean).join(', ');
  const avatarInner = pgAvatarInner(profile, user);
  const skills = profile.skills || (user.skills || '').split(',').map(s => s.trim()).filter(Boolean);
  const connections = JSON.parse(localStorage.getItem('pg_connections_' + user.email)) || [];

  const coverStyle = profile.cover
    ? `background-image:url('${profile.cover}');background-size:cover;background-position:center;`
    : `background:linear-gradient(135deg,#0c4a6e 0%,#0e7490 40%,#0f766e 100%);`;

  document.getElementById(containerId).innerHTML = `
    <div class="pg-card overflow-hidden" style="margin-bottom:1rem;">
      <div style="height:60px;width:100%;${coverStyle}"></div>
      <div style="padding:0 1rem 1rem;">
        <div style="margin-top:-28px;margin-bottom:8px;position:relative;z-index:2;">
          <div style="width:56px;height:56px;border-radius:50%;border:3px solid #020617;background:#0c4a6e;display:flex;align-items:center;justify-content:center;font-weight:900;color:#38bdf8;font-size:1.2rem;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,.2);">${avatarInner}</div>
        </div>
        <p style="font-weight:900;font-size:14px;color:#f1f5f9;">${name}</p>
        <p style="font-size:11px;color:#94a3b8;margin-top:2px;">${bio}</p>
        ${loc ? `<p style="font-size:10px;color:#475569;margin-top:2px;"><i class="fas fa-map-marker-alt" style="margin-right:3px;"></i>${loc}</p>` : ''}
        <div style="border-top:1px solid #1e293b;margin-top:12px;padding-top:12px;">
          <button onclick="window.location='profile.html'" style="font-size:11px;color:#38bdf8;background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:6px;width:100%;padding:0;">
            <i class="fas fa-user-circle"></i> View full profile
          </button>
          <div style="display:flex;justify-content:space-between;font-size:10px;color:#64748b;margin-top:8px;">
            <span>Profile views</span><span style="color:#38bdf8;font-weight:700;">48</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:10px;color:#64748b;margin-top:4px;">
            <span>Post impressions</span><span style="color:#38bdf8;font-weight:700;">213</span>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:10px;color:#64748b;margin-top:4px;">
            <span>Connections</span><span style="color:#38bdf8;font-weight:700;">${connections.length || 5}</span>
          </div>
        </div>
        ${skills.length ? `<div style="border-top:1px solid #1e293b;margin-top:12px;padding-top:10px;">
          <p style="font-size:9px;text-transform:uppercase;letter-spacing:.06em;font-weight:800;color:#475569;margin-bottom:6px;">Skills</p>
          <div style="display:flex;flex-wrap:wrap;gap:5px;">
            ${skills.slice(0,6).map(s=>`<span style="font-size:10px;background:#0c4a6e20;border:1px solid #0c4a6e40;color:#38bdf8;border-radius:9999px;padding:2px 8px;font-weight:600;">${s}</span>`).join('')}
          </div>
        </div>` : ''}
      </div>
    </div>
    <div class="pg-card" style="padding:1rem;">
      <p style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;font-weight:800;color:#475569;margin-bottom:10px;">People You May Know</p>
      ${pgSuggestionsHTML()}
    </div>`;
}

const PG_SLIDES = [
  { tag:'Career Tip',  icon:'fa-lightbulb',     color:'#fbbf24', title:'Update your skills weekly', desc:'Profiles with 5+ skills get 3x more recruiter views.' },
  { tag:'Community',   icon:'fa-users',         color:'#38bdf8', title:'Join the WorkNexus network',  desc:'Over 12,000 developers connecting across Pakistan.' },
  { tag:'New Feature', icon:'fa-bolt',          color:'#10b981', title:'Apply to jobs in one click', desc:'Your saved profile now auto-fills job applications.' },
];
let _pgSlideIndex = 0;
function pgSlide(dir) {
  const total = PG_SLIDES.length;
  _pgSlideIndex = (_pgSlideIndex + dir + total) % total;
  pgRenderSlide();
}
function pgGoToSlide(i) { _pgSlideIndex = i; pgRenderSlide(); }
function pgRenderSlide() {
  const track = document.getElementById('pg-slider-track');
  if (track) track.style.transform = `translateX(-${_pgSlideIndex * 100}%)`;
  PG_SLIDES.forEach((s, i) => {
    const dot = document.getElementById('pg-slider-dot-' + i);
    if (dot) dot.style.background = i === _pgSlideIndex ? '#38bdf8' : '#1e293b';
  });
}
let _pgSlideTimer = setInterval(() => pgSlide(1), 5000);

const PG_TRENDING = [
  { num:'1', cat:'Technology',    tag:'ReactJS',     keyword:'react',     posts:'1.4k', color:'#38bdf8' },
  { num:'2', cat:'Jobs',          tag:'HiringNow',   keyword:'hiring',    posts:'892',  color:'#10b981' },
  { num:'3', cat:'Pakistan Tech', tag:'FreelancePK', keyword:'freelance', posts:'678',  color:'#a78bfa' },
  { num:'4', cat:'Cloud & AWS',   tag:'AWS',         keyword:'aws',       posts:'543',  color:'#f59e0b' },
  { num:'5', cat:'Frontend',      tag:'TailwindCSS', keyword:'tailwind',  posts:'421',  color:'#06b6d4' },
  { num:'6', cat:'Backend',       tag:'NodeJS',      keyword:'node',      posts:'389',  color:'#22c55e' },
];

let _activeTrendTag = null;

function pgBuildRightSidebar(containerId) {
  document.getElementById(containerId).innerHTML = `
  <!-- SEARCH -->
    <div class="pg-card pg-right-search-card" style="padding:1rem;margin-bottom:1rem;">
      <p style="font-size:10px;text-transform:uppercase;letter-spacing:.06em;font-weight:800;color:#475569;margin-bottom:8px;">
        <i class="fas fa-search" style="margin-right:5px;"></i>Search Feed
      </p>
      <div style="position:relative;">
        <input type="text" id="pg-search-input" placeholder="Search by name, keyword..."
          oninput="pgRunSearch(this.value)"
          style="width:100%;background:#020617;border:1px solid #1e293b;border-radius:9px;padding:9px 36px 9px 13px;font-size:12px;color:#e2e8f0;outline:none;transition:border-color .15s;"
          onfocus="this.style.borderColor='#38bdf8'" onblur="this.style.borderColor='#1e293b'"/>
        <i class="fas fa-search" id="pg-search-icon" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);color:#475569;font-size:11px;pointer-events:none;"></i>
        <button id="pg-search-clear" onclick="pgClearSearch()"
          style="display:none;position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;color:#f43f5e;font-size:11px;cursor:pointer;padding:0;">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <p id="pg-search-info" style="display:none;font-size:10px;color:#64748b;margin-top:6px;"></p>
    </div>

    <!-- SLIDER / CAROUSEL -->
    <div class="pg-card" style="padding:0;margin-bottom:1rem;overflow:hidden;position:relative;">
      <div id="pg-slider-track" style="display:flex;transition:transform .4s ease;">
        ${PG_SLIDES.map(s => `
          <div style="min-width:100%;padding:16px;background:linear-gradient(135deg, ${s.color}22, ${s.color}05);">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
              <div style="width:34px;height:34px;border-radius:10px;background:${s.color}25;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <i class="fas ${s.icon}" style="color:${s.color};font-size:14px;"></i>
              </div>
              <p style="font-size:9px;text-transform:uppercase;letter-spacing:.06em;font-weight:800;color:${s.color};">${s.tag}</p>
            </div>
            <p style="font-size:13px;font-weight:800;color:#f1f5f9;margin-bottom:4px;">${s.title}</p>
            <p style="font-size:11px;color:#94a3b8;line-height:1.5;">${s.desc}</p>
          </div>`).join('')}
      </div>
      <div style="display:flex;justify-content:center;gap:5px;padding:8px 0 10px;background:#0f172a;">
        ${PG_SLIDES.map((s,i) => `<span id="pg-slider-dot-${i}" onclick="pgGoToSlide(${i})" style="width:6px;height:6px;border-radius:50%;background:${i===0?'#38bdf8':'#1e293b'};cursor:pointer;transition:background .2s;"></span>`).join('')}
      </div>
      <button onclick="pgSlide(-1)" style="position:absolute;left:6px;top:38%;transform:translateY(-50%);width:24px;height:24px;border-radius:50%;background:#0f172acc;border:1px solid #1e293b;color:#94a3b8;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;">
        <i class="fas fa-chevron-left"></i>
      </button>
      <button onclick="pgSlide(1)" style="position:absolute;right:6px;top:38%;transform:translateY(-50%);width:24px;height:24px;border-radius:50%;background:#0f172acc;border:1px solid #1e293b;color:#94a3b8;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- TRENDING  -->
    <div class="pg-card" style="padding:0;margin-bottom:1rem;overflow:hidden;">
      <div style="padding:14px 16px 10px;border-bottom:1px solid #1e293b;">
        <p style="font-size:15px;font-weight:900;color:#f1f5f9;">Trends for you</p>
      </div>
      ${PG_TRENDING.map((t,idx) => `
        <div id="trend-row-${idx}" onclick="pgClickTrend(${idx})"
          style="padding:12px 16px;border-bottom:1px solid #0f172a;cursor:pointer;transition:background .15s;position:relative;"
          onmouseover="this.style.background='#1e293b30'" onmouseout="if(_activeTrendTag!=='${t.tag}')this.style.background='transparent';else this.style.background='#0c4a6e20'">
          <p style="font-size:10px;color:#64748b;margin-bottom:2px;">${t.num} · ${t.cat} &nbsp;·&nbsp; Trending</p>
          <p style="font-size:14px;font-weight:800;color:#f1f5f9;margin-bottom:2px;">#${t.tag}</p>
          <p style="font-size:11px;color:#64748b;">${t.posts} posts</p>
        </div>`).join('')}
    </div>

    <!-- PRO -->
    <div class="pg-card" style="padding:1rem;border-color:#451a0340;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
        <i class="fas fa-star" style="color:#fbbf24;font-size:13px;"></i>
        <p style="font-size:12px;font-weight:700;color:#fbbf24;">WorkNexus Pro</p>
      </div>
      <p style="font-size:11px;color:#94a3b8;margin-bottom:10px;line-height:1.5;">Get seen by top recruiters. 3x more profile views with Pro.</p>
      <button onclick="showToast('Pro coming soon!')" style="width:100%;font-size:10px;font-weight:700;color:#fbbf24;background:transparent;border:1px solid #92400e;border-radius:9999px;padding:5px;cursor:pointer;">Try for Free</button>
    </div>`;
}

function pgClickTrend(idx) {
  const t = PG_TRENDING[idx];

  if (_activeTrendTag === t.tag) {
    _activeTrendTag = null;
    pgClearSearch();
    pgUpdateTrendStyles();
    pgRemoveTrendBanner();
    return;
  }

  _activeTrendTag = t.tag;
  pgUpdateTrendStyles();

  const inp = document.getElementById('pg-search-input');
  if (inp) inp.value = t.tag;
  pgRunSearch(t.tag, true);

  pgShowTrendBanner(t);
}

function pgUpdateTrendStyles() {
  PG_TRENDING.forEach((t, idx) => {
    const row = document.getElementById('trend-row-' + idx);
    if (!row) return;
    if (_activeTrendTag === t.tag) {
      row.style.background = '#0c4a6e25';
      row.style.borderLeft = '3px solid ' + t.color;
      row.querySelector('p:nth-child(2)').style.color = t.color;
    } else {
      row.style.background = 'transparent';
      row.style.borderLeft = 'none';
      row.querySelector('p:nth-child(2)').style.color = '#f1f5f9';
    }
  });
}

function pgShowTrendBanner(t) {
  pgRemoveTrendBanner();
  const stage = document.getElementById('contentDisplayStage');
  if (!stage) return;
  const banner = document.createElement('div');
  banner.id = 'pg-trend-banner';
  banner.style.cssText = `background:${t.color}12;border:1px solid ${t.color}40;border-radius:12px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;`;
  banner.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:34px;height:34px;border-radius:50%;background:${t.color}20;display:flex;align-items:center;justify-content:center;">
        <i class="fas fa-hashtag" style="color:${t.color};font-size:13px;"></i>
      </div>
      <div>
        <p style="font-size:13px;font-weight:900;color:${t.color};">#${t.tag}</p>
        <p style="font-size:10px;color:#64748b;margin-top:1px;">${t.posts} posts · ${t.cat}</p>
      </div>
    </div>
    <button onclick="pgClickTrend(${PG_TRENDING.indexOf(t)})"
      style="display:flex;align-items:center;gap:5px;font-size:11px;font-weight:700;color:#64748b;background:#1e293b;border:1px solid #334155;border-radius:9999px;padding:5px 12px;cursor:pointer;">
      <i class="fas fa-times" style="font-size:9px;"></i> Clear
    </button>`;
  stage.insertBefore(banner, stage.firstChild);
}

function pgRemoveTrendBanner() {
  const b = document.getElementById('pg-trend-banner');
  if (b) b.remove();
}

function pgRunSearch(query, fromTrend = false) {
  const q = query.trim().toLowerCase();
  const clearBtn   = document.getElementById('pg-search-clear');
  const searchIcon = document.getElementById('pg-search-icon');
  const infoEl     = document.getElementById('pg-search-info');

  if (clearBtn)   clearBtn.style.display   = q ? 'block' : 'none';
  if (searchIcon) searchIcon.style.display = q ? 'none'  : 'block';

  if (!fromTrend) { _activeTrendTag = null; pgUpdateTrendStyles(); pgRemoveTrendBanner(); }

  const cards = document.querySelectorAll('#contentDisplayStage .post-card, #contentDisplayStage [class*="post-card"]');
  let visible = 0;
  cards.forEach(card => {
    const text = card.innerText.toLowerCase();
    const show = !q || text.includes(q);
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  if (infoEl) {
    if (q) {
      infoEl.style.display = 'block';
      infoEl.innerHTML = `<span style="color:${visible?'#38bdf8':'#f43f5e'};font-weight:700;">${visible}</span> post${visible!==1?'s':''} found`;
    } else { infoEl.style.display = 'none'; }
  }

  const stage = document.getElementById('contentDisplayStage');
  const noRes = document.getElementById('pg-no-results');
  if (visible === 0 && q && stage) {
    if (!noRes) {
      const d = document.createElement('div');
      d.id = 'pg-no-results';
      d.className = 'pg-card';
      d.style.cssText = 'padding:36px;text-align:center;margin-top:8px;';
      d.innerHTML = `<i class="fas fa-hashtag" style="font-size:28px;color:#334155;margin-bottom:10px;display:block;"></i>
        <p style="font-size:14px;font-weight:800;color:#cbd5e1;margin-bottom:4px;">No posts for #${query.trim()}</p>
        <p style="font-size:11px;color:#475569;margin-bottom:14px;">Be the first to post about this topic!</p>
        <button onclick="pgClearSearch()" style="font-size:11px;font-weight:700;color:#38bdf8;background:#0c4a6e20;border:1px solid #0c4a6e;border-radius:9999px;padding:6px 16px;cursor:pointer;">
          ← Back to all posts
        </button>`;
      stage.appendChild(d);
    }
  } else { if (noRes) noRes.remove(); }
}

function pgClearSearch() {
  _activeTrendTag = null;
  pgUpdateTrendStyles();
  pgRemoveTrendBanner();
  const inp = document.getElementById('pg-search-input');
  if (inp) inp.value = '';
  const clearBtn   = document.getElementById('pg-search-clear');
  const searchIcon = document.getElementById('pg-search-icon');
  const infoEl     = document.getElementById('pg-search-info');
  if (clearBtn)   clearBtn.style.display   = 'none';
  if (searchIcon) searchIcon.style.display = 'block';
  if (infoEl)     infoEl.style.display     = 'none';
  document.querySelectorAll('#contentDisplayStage .post-card, #contentDisplayStage [class*="post-card"]')
    .forEach(c => c.style.display = '');
  const noRes = document.getElementById('pg-no-results');
  if (noRes) noRes.remove();
}

function pgQuickSearch(tag) {
  const inp = document.getElementById('pg-search-input');
  if (inp) { inp.value = tag; pgRunSearch(tag); inp.focus(); }
}

const PG_SUGGESTIONS = [
  {name:'Zainab Malik', role:'HR Lead @ TechMatrix', photo:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'},
  {name:'Omar Siddiqui',role:'Node.js Engineer',     photo:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'},
  {name:'Fatima Noor',  role:'UI/UX Designer',       photo:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'},
  {name:'Hamza Ali',    role:'React Developer',      photo:'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'},
];

function pgSuggestionsHTML() {
  return PG_SUGGESTIONS.map((p,i) => {
    const ini = p.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    return `
    <div id="sg-row-${i}" style="background:#0f172a;border:1px solid #1e293b;border-radius:14px;padding:10px 12px;margin-bottom:8px;">
      <!-- Header: Connect Request type -->
      <p style="font-size:9px;text-transform:uppercase;letter-spacing:.07em;font-weight:800;color:#38bdf8;margin-bottom:8px;">
        <i class="fas fa-user-plus" style="margin-right:4px;font-size:8px;"></i>Connect Request
      </p>
      <!-- User row -->
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:40px;height:40px;border-radius:50%;overflow:hidden;border:2px solid #1e293b;flex-shrink:0;background:#1e293b;position:relative;">
          <img src="${p.photo}" alt="${p.name}"
            style="width:100%;height:100%;object-fit:cover;"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
          <span style="display:none;position:absolute;inset:0;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#94a3b8;">${ini}</span>
        </div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:12px;font-weight:700;color:#f1f5f9;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.name}</p>
          <p style="font-size:10px;color:#64748b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:1px;">${p.role}</p>
        </div>
      </div>
      <!-- Accept / Reject buttons -->
      <div style="display:flex;gap:8px;margin-top:10px;">
        <button onclick="pgAcceptRequest(${i},'${p.name}')"
          style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:6px 0;border-radius:9999px;border:1px solid #10b981;background:#10b98115;color:#10b981;font-size:11px;font-weight:700;cursor:pointer;transition:all .15s;"
          onmouseover="this.style.background='#10b98130'" onmouseout="this.style.background='#10b98115'">
          <i class="fas fa-check" style="font-size:10px;"></i> Accept
        </button>
        <button onclick="pgRejectRequest(${i},'${p.name}')"
          style="flex:1;display:flex;align-items:center;justify-content:center;gap:5px;padding:6px 0;border-radius:9999px;border:1px solid #334155;background:transparent;color:#64748b;font-size:11px;font-weight:700;cursor:pointer;transition:all .15s;"
          onmouseover="this.style.background='#f43f5e15';this.style.borderColor='#f43f5e';this.style.color='#f43f5e'"
          onmouseout="this.style.background='transparent';this.style.borderColor='#334155';this.style.color='#64748b'">
          <i class="fas fa-times" style="font-size:10px;"></i> Reject
        </button>
      </div>
    </div>`;
  }).join('');
}

function pgAcceptRequest(i, name) {
  const row = document.getElementById('sg-row-'+i);
  if (!row) return;
  row.style.borderColor = '#10b981';
  row.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;padding:4px 0;">
      <div style="width:28px;height:28px;border-radius:50%;background:#10b98120;border:1px solid #10b981;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <i class="fas fa-check" style="color:#10b981;font-size:11px;"></i>
      </div>
      <p style="font-size:12px;font-weight:700;color:#10b981;">Connected with <span style="color:#f1f5f9;">${name}</span></p>
    </div>`;
  showToast('Connection accepted! 🎉');
}

function pgRejectRequest(i, name) {
  const row = document.getElementById('sg-row-'+i);
  if (!row) return;
  row.style.opacity = '0';
  row.style.transition = 'opacity .3s';
  setTimeout(() => {
    row.style.display = 'none';
  }, 300);
  showToast(`Request from ${name} removed.`);
}

function pgGetSentConnections() {
  return JSON.parse(localStorage.getItem('pg_sent_connections') || '[]');
}
function pgMarkConnectSent(btn) {
  if (!btn) return;
  btn.innerHTML = '<i class="fas fa-check" style="margin-right:4px;font-size:9px;"></i>Sent';
  btn.disabled = true;
  btn.classList.add('connected');
  btn.style.background = '#10b98120';
  btn.style.borderColor = '#10b981';
  btn.style.color = '#10b981';
  btn.style.fontWeight = '700';
  btn.style.cursor = 'default';
  btn.style.opacity = '1';
}
function pgHandleConnect(btn, name) {
  if (!btn || btn.disabled) return;
  const list = pgGetSentConnections();
  if (!list.includes(name)) { list.push(name); localStorage.setItem('pg_sent_connections', JSON.stringify(list)); }
  pgMarkConnectSent(btn);
  showToast(`Connection request sent to ${name}!`);
}

function pgRestoreConnectButtons(scopeSelector) {
  const sent = pgGetSentConnections();
  const scope = scopeSelector ? document.querySelector(scopeSelector) : document;
  if (!scope) return;
  scope.querySelectorAll('[data-connect-name]').forEach(btn => {
    const name = btn.getAttribute('data-connect-name');
    if (sent.includes(name)) pgMarkConnectSent(btn);
  });
}

function pgToggleLike(type, id, currentUserName, onDone) {
  const key = type==='post' ? 'worknexus_posts' : 'worknexus_jobs';
  let items = JSON.parse(localStorage.getItem(key))||[];
  const idx = items.findIndex(x=>x.id===id); if(idx===-1) return;
  const item = items[idx];
  item.likedBy = item.likedBy||[]; item.likes = item.likes||0;
  if(item.likedBy.includes(currentUserName)){
    item.likedBy = item.likedBy.filter(n=>n!==currentUserName); item.likes = Math.max(0,item.likes-1);
  } else { item.likedBy.push(currentUserName); item.likes++; }
  items[idx]=item; localStorage.setItem(key,JSON.stringify(items));
  if(onDone) onDone(item);
}

function pgAddComment(type, id, authorName, text) {
  const key = type==='post' ? 'worknexus_posts' : 'worknexus_jobs';
  let items = JSON.parse(localStorage.getItem(key))||[];
  const idx = items.findIndex(x=>x.id===id); if(idx===-1) return false;
  items[idx].comments = items[idx].comments||[];
  items[idx].comments.push({author:authorName, text, ts:new Date().toLocaleTimeString()});
  localStorage.setItem(key, JSON.stringify(items));
  return true;
}

function pgShare(title, snippet) {
  const text = `Check out "${title}" on WorkNexus!\n"${snippet}..."`;
  if(navigator.share) navigator.share({title:'WorkNexus',text});
  else { navigator.clipboard.writeText(text); showToast('Copied to clipboard!'); }
}

function escQ(s){ return (s||'').replace(/'/g,"\\'").replace(/"/g,'&quot;'); }

const sdState = {};
const SD_DATA = {
  country:[
    {g:'South Asia',items:['Pakistan','India','Bangladesh','Sri Lanka','Nepal','Afghanistan']},
    {g:'Middle East',items:['UAE','Saudi Arabia','Qatar','Kuwait','Bahrain','Oman','Jordan','Turkey']},
    {g:'Europe',items:['United Kingdom','Germany','France','Netherlands','Sweden','Norway','Switzerland','Italy','Spain','Poland','Belgium','Denmark','Austria']},
    {g:'North America',items:['United States','Canada','Mexico']},
    {g:'Oceania',items:['Australia','New Zealand']},
    {g:'East Asia',items:['China','Japan','South Korea','Singapore','Malaysia','Indonesia','Philippines','Thailand']},
    {g:'Africa',items:['Egypt','Nigeria','South Africa','Kenya','Morocco']},
  ],
  city:[
    {g:'Punjab, Pakistan',items:['Lahore','Gujrat','Gujranwala','Faisalabad','Rawalpindi','Sialkot','Sargodha','Multan','Bahawalpur','Sheikhupura','Jhang','Rahim Yar Khan','Sahiwal','Okara','Kasur','Narowal','Mandi Bahauddin','Hafizabad','Chiniot','Khanewal']},
    {g:'Sindh, Pakistan',items:['Karachi','Hyderabad','Sukkur','Larkana','Nawabshah','Mirpurkhas','Khairpur','Jacobabad']},
    {g:'KPK, Pakistan',items:['Peshawar','Mardan','Abbottabad','Swat','Kohat','Dera Ismail Khan','Mansehra']},
    {g:'Balochistan, Pakistan',items:['Quetta','Turbat','Khuzdar','Hub','Gwadar']},
    {g:'AJK & GB',items:['Muzaffarabad','Mirpur','Gilgit','Skardu']},
    {g:'Federal',items:['Islamabad']},
    {g:'India',items:['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad']},
    {g:'Middle East',items:['Dubai','Abu Dhabi','Riyadh','Jeddah','Doha','Kuwait City','Muscat','Sharjah']},
    {g:'Europe',items:['London','Berlin','Amsterdam','Paris','Stockholm','Zurich','Copenhagen','Oslo','Vienna']},
    {g:'North America',items:['New York','Los Angeles','Chicago','Houston','Toronto','Vancouver','San Francisco']},
    {g:'Other',items:['Sydney','Melbourne','Singapore','Tokyo','Seoul','Istanbul','Cairo']},
  ],
  skill:[
    {g:'Frontend',items:['HTML5','CSS3','JavaScript','TypeScript','React.js','Vue.js','Angular','Next.js','Nuxt.js','Tailwind CSS','Bootstrap','SASS/SCSS','jQuery','Webpack','Vite']},
    {g:'Backend',items:['Node.js','Express.js','NestJS','Django','Flask','FastAPI','Laravel','PHP','Ruby on Rails','Spring Boot','ASP.NET','Go','Rust']},
    {g:'Mobile',items:['React Native','Flutter','Android (Java/Kotlin)','iOS (Swift)','Expo','Ionic']},
    {g:'Database',items:['MongoDB','MySQL','PostgreSQL','SQLite','Redis','Firebase','Supabase','Prisma','Mongoose','DynamoDB']},
    {g:'Cloud & DevOps',items:['AWS','Google Cloud','Azure','Docker','Kubernetes','Terraform','CI/CD','GitHub Actions','Jenkins','Linux','Nginx','Vercel','Netlify']},
    {g:'AI / ML',items:['Python','TensorFlow','PyTorch','Scikit-learn','Pandas','NumPy','OpenAI API','LangChain','Computer Vision','NLP']},
    {g:'Design',items:['Figma','Adobe XD','UI/UX Design','Photoshop','Illustrator','Canva','Wireframing','Prototyping']},
    {g:'Other',items:['REST APIs','GraphQL','WebSockets','Microservices','Agile/Scrum','Git','GitHub','Jira','Postman','Cybersecurity','Blockchain']},
  ],
  institute:[
    {g:'Federal Universities, Pakistan',items:['FAST-NUCES (Karachi)','FAST-NUCES (Lahore)','FAST-NUCES (Islamabad)','FAST-NUCES (Peshawar)','FAST-NUCES (Faisalabad)','COMSATS University Islamabad','COMSATS Lahore','COMSATS Wah','Air University Islamabad','IIUI Islamabad','AIOU','Federal Urdu University']},
    {g:'Punjab Universities',items:['University of the Punjab (PU) Lahore','UET Lahore','UET Gujranwala','LUMS Lahore','GCU Lahore','University of Gujrat (UOG)','University of Sargodha','BZU Multan','Islamia University Bahawalpur','Virtual University (VU)','University of Education Lahore','UCP Lahore','UMT Lahore','Superior University Lahore','Riphah University']},
    {g:'Sindh Universities',items:['University of Karachi','NED University Karachi','IBA Karachi','Habib University Karachi','University of Sindh Jamshoro','Mehran UET Hyderabad','SZABIST Karachi']},
    {g:'KPK Universities',items:['University of Peshawar','UET Peshawar','Abdul Wali Khan University Mardan','Hazara University Mansehra']},
    {g:'Other Pakistan',items:['NUST Islamabad','Bahria University','PAF-KIET Karachi','BNU Lahore','Forman Christian College Lahore','SZABIST Islamabad','Iqra University']},
    {g:'International',items:['MIT','Stanford University','Harvard University','Oxford University','Cambridge University','Imperial College London','University of Toronto','University of Melbourne','NUS Singapore','ETH Zurich','Coursera (Online)','Udemy (Online)','edX (Online)']},
  ],
};

function sdInit(wrapId,dataKey,onSelect){ sdState[wrapId]={value:'',label:'',dataKey,onSelect}; sdRenderList(wrapId,''); }
function sdOpen(wrapId){ document.querySelectorAll('.sd-wrap.open').forEach(el=>{if(el.id!==wrapId)el.classList.remove('open');}); document.getElementById(wrapId).classList.add('open'); sdRenderList(wrapId,document.getElementById(wrapId+'-input').value); }
function sdBlur(wrapId){ setTimeout(()=>{ const w=document.getElementById(wrapId); if(w)w.classList.remove('open'); const st=sdState[wrapId]; if(st&&st.label)document.getElementById(wrapId+'-input').value=st.label; },180); }
function sdFilter(wrapId){ const q=document.getElementById(wrapId+'-input').value; const clr=document.getElementById(wrapId+'-clear'); if(clr)clr.style.display=q?'block':'none'; sdRenderList(wrapId,q); if(!document.getElementById(wrapId).classList.contains('open'))document.getElementById(wrapId).classList.add('open'); }
function sdClear(wrapId){ const st=sdState[wrapId]; if(!st)return; st.value=''; st.label=''; document.getElementById(wrapId+'-input').value=''; const clr=document.getElementById(wrapId+'-clear'); if(clr)clr.style.display='none'; const hid=document.getElementById('ef-'+wrapId.replace('sd-','')); if(hid)hid.value=''; sdRenderList(wrapId,''); if(st.onSelect)st.onSelect('',''); }
function sdRenderList(wrapId,query){ const st=sdState[wrapId]; if(!st)return; const listEl=document.getElementById(wrapId+'-list'); if(!listEl)return; const groups=SD_DATA[st.dataKey]; const q=(query||'').trim().toLowerCase(); let html=''; let count=0; groups.forEach(grp=>{ const matches=grp.items.filter(item=>!q||item.toLowerCase().includes(q)); if(!matches.length)return; html+=`<div class="sd-group-label">${grp.g}</div>`; matches.slice(0,q?30:6).forEach(item=>{ const isSel=item===st.label; const hi=q?item.replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`,'gi'),'<span class="sd-highlight">$1</span>'):item; html+=`<div class="sd-item${isSel?' selected':''}" onmousedown="sdSelect('${wrapId}','${item.replace(/'/g,"\\'")}')"><i class="fas ${isSel?'fa-check text-sky-400':'fa-circle'}" style="font-size:${isSel?'10px':'7px'};color:${isSel?'#38bdf8':'#1e293b'};"></i><span>${hi}</span></div>`; count++; }); }); if(!count)html=`<div class="sd-empty"><i class="fas fa-search" style="margin-right:4px;"></i> No results for "${query}"</div>`; listEl.innerHTML=html; }
function sdSelect(wrapId,value){ const st=sdState[wrapId]; if(!st)return; st.value=value; st.label=value; document.getElementById(wrapId+'-input').value=value; const clr=document.getElementById(wrapId+'-clear'); if(clr)clr.style.display='block'; const hid=document.getElementById('ef-'+wrapId.replace('sd-','')); if(hid)hid.value=value; document.getElementById(wrapId).classList.remove('open'); if(st.onSelect)st.onSelect(value,value); }
function sdSetValue(wrapId,value){ if(!value)return; const st=sdState[wrapId]; if(!st)return; st.value=value; st.label=value; document.getElementById(wrapId+'-input').value=value; const clr=document.getElementById(wrapId+'-clear'); if(clr)clr.style.display=value?'block':'none'; const hid=document.getElementById('ef-'+wrapId.replace('sd-','')); if(hid)hid.value=value; }
document.addEventListener('mousedown',function(e){ document.querySelectorAll('.sd-wrap.open').forEach(wrap=>{if(!wrap.contains(e.target))wrap.classList.remove('open');}); });

function pgSeedDatabase(){
  if(!localStorage.getItem('worknexus_posts')){
    localStorage.setItem('worknexus_posts',JSON.stringify([
      {id:'p1',authorName:'Sarah Jenkins',authorBio:'Senior Recruiter @ DevCorp',content:'Just shipped a full-stack dashboard using React + Tailwind + Node.js. The dark mode UI came out cleaner than expected!\n\nKey takeaway: utility-first CSS is a game changer for rapid prototyping. Who else is on the Tailwind train? 🚀',image:'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=700&q=80',timestamp:'19/06/2026, 9:15 AM',likes:14,likedBy:[],comments:[{author:'Ali Raza',text:'Looks amazing! GitHub link?'},{author:'Hamza Khan',text:'Tailwind is 🔥 never going back!'}]},
      {id:'p2',authorName:'Usman Tariq',authorBio:'Backend Engineer @ CloudSys',content:'Hot take: REST APIs are overengineered for most small apps.\n\ntRPC + Prisma gives end-to-end type safety with almost zero boilerplate. Dropped 60% of my API code last sprint. Anyone else made the switch?',image:null,timestamp:'19/06/2026, 8:40 AM',likes:9,likedBy:[],comments:[{author:'Fatima Noor',text:'Totally agree — DX is unreal with tRPC!'}]},
      {id:'p3',authorName:'Ayesha Siddiqui',authorBio:'CS Final Year @ FAST-NUCES',content:'Passed my AWS Cloud Practitioner exam today! 🎉\n\n Shared Responsibility Model\n IAM Policies & Roles\nEC2, S3, RDS basics\n Pricing & Billing models\n',image:null,timestamp:'18/06/2026, 11:20 PM',likes:31,likedBy:[],comments:[{author:'Bilal Ahmed',text:'Please share the notes! 🙋'}]},
    ]));
  }
  if(!localStorage.getItem('worknexus_jobs')){
    localStorage.setItem('worknexus_jobs',JSON.stringify([
      {id:'j1',title:'Junior Web Developer (Tailwind & JS)',company:'Systems Alpha Ltd',location:'Islamabad / Remote',salary:'75k–95k/mo',description:'Join our product team as a Junior Web Developer.\n\nResponsibilities:\n• Build responsive UI with Tailwind CSS\n• Cross-browser optimization\n• SaaS dashboard features\n\nRequirements:\n HTML5, CSS3, JavaScript ES6+\n Tailwind CSS\nGit basics\n\nFresh graduates welcome!',postedBy:'Sarah Jenkins',timestamp:'19/06/2026',likes:7,likedBy:[],comments:[{author:'Bilal Ahmed',text:'Open for fresh grads?'},{author:'Sarah Jenkins',text:'Yes! Portfolio matters most.'}]},
      {id:'j2',title:'Node.js Backend Engineer',company:'CloudNest Technologies',location:'Lahore / Hybrid',salary:'120k–160k/mo',description:'Design and maintain scalable REST APIs for our fintech platform.\n\nStack: Express.js + MongoDB + Redis + AWS\n\nRequirements:\n 2+ years Node.js\n Microservices\n CI/CD pipelines',postedBy:'Omar Siddiqui',timestamp:'18/06/2026',likes:12,likedBy:[],comments:[]},
      {id:'j3',title:'React Native Mobile Developer',company:'AppForge Studio',location:'Remote (Pakistan)',salary:'100k–140k/mo',description:'Building next-gen e-commerce mobile apps.\n\nStack: React Native + Expo + Redux Toolkit\n\n• JazzCash / EasyPaisa integration\n• Published apps on Play/App Store preferred\n\nRemote-first. Flexible hours. Learning budget PKR 50k/year.',postedBy:'Zara Malik',timestamp:'17/06/2026',likes:5,likedBy:[],comments:[{author:'Rana Kamran',text:'1 year experience OK?'},{author:'Zara Malik',text:'Yes — portfolio matters most!'}]},
    ]));
  }
  if(!localStorage.getItem('pg_alerts')){
    localStorage.setItem('pg_alerts',JSON.stringify([
      {id:'a1',type:'like',icon:'fa-heart',color:'#f43f5e',title:'Sarah Jenkins liked your post',body:'Your post about React dashboards got a reaction.',time:'2 min ago',read:false},
      {id:'a2',type:'comment',icon:'fa-comment',color:'#38bdf8',title:'Ali Raza commented on your post',body:'"Looks amazing! Can you share the GitHub link?"',time:'15 min ago',read:false},
      {id:'a3',type:'connect',icon:'fa-user-plus',color:'#10b981',title:'Zainab Malik sent you a connection request',body:'HR Lead at TechMatrix wants to connect.',time:'1 hr ago',read:false},
      {id:'a4',type:'job',icon:'fa-briefcase',color:'#a78bfa',title:'New job matches your skills',body:'Junior Web Developer at Systems Alpha Ltd — Islamabad',time:'3 hr ago',read:true},
      {id:'a5',type:'like',icon:'fa-heart',color:'#f43f5e',title:'3 people liked your AWS post',body:'Usman, Hamza and 1 other reacted to your post.',time:'5 hr ago',read:true},
      {id:'a6',type:'connect',icon:'fa-user-plus',color:'#10b981',title:'Omar Siddiqui accepted your request',body:'You are now connected with Omar Siddiqui.',time:'Yesterday',read:true},
    ]));
  }
}