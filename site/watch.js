/* Films on the project cards. Covers play a muted preview on hover; play opens
   an Instagram-style viewer (video left, details and comments right). On phones the viewer
   is full screen with a side rail, and comments open in a bottom sheet.
   Likes and comments live in Supabase behind three guarded functions; the publishable key is public. */
(function () {
  const SB = 'https://vremvqzrcjjsmbkcdlmz.supabase.co';
  const KEY = 'sb_publishable_L67xydA1O2482GOHCm_BvQ_QkY30VyA';
  const SRC = (id) => `${SB}/storage/v1/object/public/pf-videos/${id}.mp4`;

  const VIDEOS = [
    { id: 'eggflow', title: 'EggFlow', len: '1:58', hook: 'Follow one farm day, start to finish', line: 'The ERP I built for my family’s three layer farms.',
      details: ['Each house entered on a phone, in petti and trays', 'Five checks before the farm day closes', 'A photo of a cash memo fills in the sale', 'Dues tracked by age, every farm on one screen'],
      meta: 'Solo, 2026.', link: 'https://eggflow.closedloopintel.com', linkText: 'The story' },
    { id: 'peptiful', title: 'Peptiful', len: '2:57', hook: 'From one peptide to a whole brand', line: 'What a peptide is, then a brand launched on one engine.',
      details: ['Peptides from first principles, GLP-1 as the example', 'Catalog, label, store and checkout', 'The lab ships under your brand', 'A payout split on every order'],
      meta: 'Built By Design, 2025 to 2026. UI and integration layer.', link: 'https://www.peptiful.com', linkText: 'peptiful.com' },
  ];

  // each film sits on its own project card: the card with id="<video id>"
  const cards = VIDEOS.map((v) => document.querySelector(`#${v.id} .art`));
  if (!cards.some(Boolean)) return;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const device = (() => { let d = localStorage.getItem('pf_device'); if (!d) { d = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join(''); localStorage.setItem('pf_device', d); } return d; })();
  const rpc = async (fn, body) => {
    const r = await fetch(`${SB}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.message || 'error');
    return j;
  };
  const ago = (iso) => {
    const s = Math.max(1, (Date.now() - new Date(iso)) / 1000);
    for (const [n, u] of [[31536000, 'y'], [604800, 'w'], [86400, 'd'], [3600, 'h'], [60, 'm']]) if (s >= n) return Math.floor(s / n) + u;
    return 'now';
  };
  const icon = {
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.6 0 5.6 3.5 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 11.6a8.5 8.5 0 0 1-12.4 7.6L3.5 20.5l1.3-4.4A8.5 8.5 0 1 1 20.5 11.6z"/></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.5 3 9.6 14.2M21.5 3l-6.8 18-3.4-7.6L3.5 10z"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19"/></svg>',
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  };

  /* ---- on the project cards --------------------------------------------------------------
     The cover keeps its shape and colour. On top: a play button and the like and comment
     counts. Hover plays a muted preview over the art. Play or the counts open the viewer;
     the rest of the card still opens the project link. */
  const overlays = [];
  VIDEOS.forEach((v, i) => {
    const art = cards[i];
    if (!art) return;
    const wrap = document.createElement('span');
    wrap.className = 'vid-wrap';
    art.parentNode.insertBefore(wrap, art);
    wrap.appendChild(art);
    const ov = document.createElement('span');
    ov.className = 'vid-ov';
    ov.innerHTML = `
      <span class="vid-play" role="button" tabindex="0" aria-label="${esc(v.hook)}. Play the ${esc(v.title)} film, ${v.len}">${icon.play}</span>
      <span class="vid-hook" aria-hidden="true">${esc(v.hook)}</span>
      <span class="vid-stats">
        <span class="vid-s vid-likes" role="button" tabindex="0" aria-label="Likes">${icon.heart}<b>0</b></span>
        <span class="vid-s vid-coms" role="button" tabindex="0" aria-label="Comments">${icon.chat}<b>0</b></span>
        <span class="vid-len">${v.len}</span>
      </span>`;
    wrap.appendChild(ov);
    overlays[i] = ov;
    const go = (e, sheet) => { e.preventDefault(); e.stopPropagation(); open(i, sheet); };
    for (const [sel, sheet] of [['.vid-play', false], ['.vid-likes', false], ['.vid-coms', true]]) {
      const el = ov.querySelector(sel);
      el.addEventListener('click', (e) => go(e, sheet));
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') go(e, sheet); });
    }
    if (fine && !reduce) {
      let pv = null, t = null;
      const card = wrap.closest('.card');
      card.addEventListener('mouseenter', () => {
        t = setTimeout(() => {
          pv = document.createElement('video');
          Object.assign(pv, { src: SRC(v.id), muted: true, playsInline: true, loop: true, preload: 'auto' });
          pv.className = 'vid-preview';
          wrap.insertBefore(pv, ov);
          pv.play().then(() => pv.classList.add('on')).catch(() => {});
        }, 200);
      });
      card.addEventListener('mouseleave', () => { clearTimeout(t); if (pv) { pv.pause(); pv.remove(); pv = null; } });
    }
    rpc('pf_video_state', { p_video: v.id, p_device: device }).then((st) => setCounts(i, st.likes, st.comments.length)).catch(() => {});
  });
  function setCounts(i, likes, coms) {
    const ov = overlays[i];
    if (!ov) return;
    ov.querySelector('.vid-likes b').textContent = likes;
    ov.querySelector('.vid-coms b').textContent = coms;
  }

  /* ---- viewer --------------------------------------------------------------------------- */
  const dlg = document.createElement('div');
  dlg.className = 'vw';
  dlg.setAttribute('role', 'dialog');
  dlg.setAttribute('aria-modal', 'true');
  dlg.hidden = true;
  dlg.innerHTML = `
    <button class="vw-x" type="button" aria-label="Close">${icon.close}</button>
    <button class="vw-nav vw-prev" type="button" aria-label="Previous film">${icon.prev}</button>
    <button class="vw-nav vw-next" type="button" aria-label="Next film">${icon.next}</button>
    <div class="vw-box">
      <div class="vw-stage">
        <video class="vw-video" playsinline preload="auto"></video>
        <div class="vw-burst" aria-hidden="true">${icon.heart}</div>
        <div class="vw-rail">
          <button class="vw-r-like" type="button" aria-label="Like">${icon.heart}<span class="n">0</span></button>
          <button class="vw-r-chat" type="button" aria-label="Comments">${icon.chat}<span class="n">0</span></button>
          <button class="vw-r-share" type="button" aria-label="Copy link">${icon.share}</button>
        </div>
        <div class="vw-cap"><b></b><span></span></div>
      </div>
      <aside class="vw-side">
        <div class="vw-sheet-grip" aria-hidden="true"></div>
        <header class="vw-head">
          <span class="vw-av">M</span>
          <span class="vw-who"><b>mbs</b><span class="vw-title"></span></span>
          <a class="vw-link" target="_blank" rel="noopener"></a>
        </header>
        <div class="vw-scroll">
          <div class="vw-about">
            <span class="vw-av sm">M</span>
            <div><p class="vw-line"></p><ul class="vw-details"></ul><p class="vw-meta"></p></div>
          </div>
          <ol class="vw-comments" aria-live="polite"></ol>
        </div>
        <footer class="vw-foot">
          <div class="vw-acts">
            <button class="vw-like" type="button" aria-pressed="false" aria-label="Like">${icon.heart}</button>
            <button class="vw-focus" type="button" aria-label="Comment">${icon.chat}</button>
            <button class="vw-share" type="button" aria-label="Copy link">${icon.share}</button>
          </div>
          <p class="vw-likes"><b>0</b> likes</p>
          <form class="vw-form" autocomplete="on">
            <div class="vw-name-row">
              <input class="vw-name" name="name" maxlength="60" placeholder="Your name" aria-label="Your name" autocomplete="name">
              <span class="vw-as" hidden>as <b></b> <button type="button" class="vw-change">change</button></span>
            </div>
            <div class="vw-say">
              <input class="vw-body" name="comment" maxlength="600" placeholder="Add a comment…" aria-label="Add a comment" autocomplete="off">
              <button class="vw-post" type="submit" disabled>Post</button>
            </div>
            <p class="vw-note" role="status"></p>
          </form>
        </footer>
      </aside>
    </div>`;
  document.body.appendChild(dlg);
  const $ = (s) => dlg.querySelector(s);
  const video = $('.vw-video'), commentsEl = $('.vw-comments'), nameEl = $('.vw-name'), bodyEl = $('.vw-body'), postEl = $('.vw-post'), noteEl = $('.vw-note');
  let cur = -1, state = { likes: 0, liked: false, comments: [] }, lastFocus = null, busy = false;

  const setName = () => {
    const n = localStorage.getItem('pf_name');
    $('.vw-as').hidden = !n; nameEl.hidden = !!n;
    if (n) $('.vw-as b').textContent = n;
  };
  const canPost = () => { postEl.disabled = !(bodyEl.value.trim() && (localStorage.getItem('pf_name') || nameEl.value.trim())); };
  nameEl.addEventListener('input', canPost); bodyEl.addEventListener('input', canPost);
  $('.vw-change').addEventListener('click', () => { localStorage.removeItem('pf_name'); setName(); nameEl.focus(); canPost(); });

  const paint = () => {
    $('.vw-likes b').textContent = state.likes;
    $('.vw-likes').lastChild.textContent = state.likes === 1 ? ' like' : ' likes';
    $('.vw-r-like .n').textContent = state.likes;
    $('.vw-r-chat .n').textContent = state.comments.length;
    if (cur >= 0) setCounts(cur, state.likes, state.comments.length);
    for (const b of [$('.vw-like'), $('.vw-r-like')]) { b.classList.toggle('on', state.liked); b.setAttribute('aria-pressed', state.liked); }
    commentsEl.innerHTML = state.comments.length
      ? state.comments.map((c) => `<li><span class="vw-av xs">${esc((c.name || '?').trim()[0] || '?').toUpperCase()}</span><p><b>${esc(c.name)}</b> ${esc(c.body)}<time datetime="${esc(c.created_at)}">${ago(c.created_at)}</time></p></li>`).join('')
      : '<li class="vw-empty">No comments yet. Say what you think.</li>';
  };

  const load = async (v) => {
    state = { likes: 0, liked: false, comments: [] }; paint();
    try { const s = await rpc('pf_video_state', { p_video: v.id, p_device: device }); if (VIDEOS[cur] === v) { state = s; paint(); } } catch (e) {}
  };

  const show = (i) => {
    cur = (i + VIDEOS.length) % VIDEOS.length;
    const v = VIDEOS[cur];
    video.src = SRC(v.id); video.poster = `assets/video/${v.id}.jpg`;
    $('.vw-title').textContent = v.title;
    $('.vw-cap b').textContent = v.title; $('.vw-cap span').textContent = v.line;
    $('.vw-line').textContent = v.line;
    $('.vw-details').innerHTML = v.details.map((d) => `<li>${esc(d)}</li>`).join('');
    $('.vw-meta').textContent = v.meta;
    const a = $('.vw-link'); a.hidden = !v.link; if (v.link) { a.href = v.link; a.textContent = (v.linkText || 'Visit') + ' ↗'; }
    noteEl.textContent = '';
    history.replaceState(null, '', `?watch=${v.id}${location.hash}`);
    video.play().catch(() => {});
    load(v);
  };

  function open(i, sheet) {
    lastFocus = document.activeElement;
    dlg.hidden = false; document.documentElement.classList.add('vw-lock');
    requestAnimationFrame(() => dlg.classList.add('in'));
    setName(); canPost(); show(i);
    if (sheet) { if (matchMedia('(max-width:760px)').matches) dlg.classList.add('sheet'); else setTimeout(() => (localStorage.getItem('pf_name') ? bodyEl : nameEl).focus({ preventScroll: true }), 50); }
    if (fine && !sheet) $('.vw-x').focus({ preventScroll: true });
  }
  const close = () => {
    video.pause(); video.removeAttribute('src'); video.load();
    dlg.classList.remove('in', 'sheet'); document.documentElement.classList.remove('vw-lock');
    setTimeout(() => { dlg.hidden = true; }, reduce ? 0 : 200);
    history.replaceState(null, '', location.pathname + location.hash);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  };

  const like = async (force) => {
    if (busy || (force && state.liked)) return;
    busy = true; state.liked = !state.liked; state.likes += state.liked ? 1 : -1; paint();
    try { const r = await rpc('pf_toggle_like', { p_video: VIDEOS[cur].id, p_device: device }); state.likes = r.likes; state.liked = r.liked; paint(); }
    catch (e) { state.liked = !state.liked; state.likes += state.liked ? 1 : -1; paint(); }
    busy = false;
  };
  const burst = () => { const b = $('.vw-burst'); b.classList.remove('go'); void b.offsetWidth; b.classList.add('go'); };
  const share = async () => {
    const url = `${location.origin}${location.pathname}?watch=${VIDEOS[cur].id}`;
    try { if (navigator.share && !fine) await navigator.share({ title: VIDEOS[cur].title, url }); else { await navigator.clipboard.writeText(url); toast('Link copied'); } } catch (e) {}
  };
  const toast = (t) => { noteEl.textContent = t; setTimeout(() => { if (noteEl.textContent === t) noteEl.textContent = ''; }, 2200); };

  $('.vw-x').addEventListener('click', close);
  $('.vw-prev').addEventListener('click', () => show(cur - 1));
  $('.vw-next').addEventListener('click', () => show(cur + 1));
  $('.vw-like').addEventListener('click', () => like());
  $('.vw-r-like').addEventListener('click', () => like());
  $('.vw-share').addEventListener('click', share);
  $('.vw-r-share').addEventListener('click', share);
  $('.vw-focus').addEventListener('click', () => (localStorage.getItem('pf_name') ? bodyEl : nameEl).focus());
  $('.vw-r-chat').addEventListener('click', () => dlg.classList.add('sheet'));
  $('.vw-sheet-grip').addEventListener('click', () => dlg.classList.remove('sheet'));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  addEventListener('keydown', (e) => {
    if (dlg.hidden) return;
    if (e.key === 'Escape') { if (dlg.classList.contains('sheet')) dlg.classList.remove('sheet'); else close(); }
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight') show(cur + 1);
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === ' ') { e.preventDefault(); video.paused ? video.play() : video.pause(); }
  });

  // tap to pause, double tap to like, as on Instagram
  let tapT = null, lastTap = 0;
  video.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastTap < 280) { clearTimeout(tapT); lastTap = 0; like(true); burst(); return; }
    lastTap = now;
    tapT = setTimeout(() => { video.paused ? video.play() : video.pause(); }, 280);
  });
  video.addEventListener('play', () => dlg.classList.remove('paused'));
  video.addEventListener('pause', () => dlg.classList.add('paused'));

  $('.vw-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = localStorage.getItem('pf_name') || nameEl.value.trim();
    const body = bodyEl.value.trim();
    if (!name || !body) return;
    postEl.disabled = true;
    try {
      const c = await rpc('pf_add_comment', { p_video: VIDEOS[cur].id, p_name: name, p_body: body, p_device: device });
      localStorage.setItem('pf_name', name); setName();
      state.comments.unshift(c); bodyEl.value = ''; paint();
      commentsEl.parentElement.scrollTo({ top: commentsEl.offsetTop - 12, behavior: reduce ? 'auto' : 'smooth' });
    } catch (err) {
      toast(/slow/.test(err.message) ? 'Easy there, try again in a few minutes.' : 'That did not post. Try again.');
    }
    canPost();
  });

  // deep link: ?watch=eggflow
  const q = new URLSearchParams(location.search).get('watch');
  const qi = VIDEOS.findIndex((v) => v.id === q);
  if (qi >= 0) setTimeout(() => open(qi), 300);
})();
