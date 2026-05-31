/* =========================================================
   OBM2 Pro — Documentation JS
   scrollSpy · copyCode · search · sidebar · backToTop
   ========================================================= */

(function () {
  'use strict';

  /* ── Sidebar toggle (mobile) ───────────────────────────── */
  function initSidebar() {
    const toggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.docs-sidebar');
    if (!toggle || !sidebar) return;

    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
    });

    document.addEventListener('click', function (e) {
      if (sidebar.classList.contains('open') &&
          !sidebar.contains(e.target) &&
          e.target !== toggle) {
        sidebar.classList.remove('open');
      }
    });
  }

  /* ── Scroll-spy (sidebar active link) ─────────────────── */
  function initScrollSpy() {
    const links = document.querySelectorAll('.docs-sidebar .sidebar-link[data-target]');
    if (!links.length) return;

    const targets = Array.from(links).map(function (l) {
      return document.getElementById(l.dataset.target);
    }).filter(Boolean);

    function onScroll() {
      const scrollY = window.scrollY + 80;
      let active = null;
      targets.forEach(function (el) {
        if (el.offsetTop <= scrollY) active = el;
      });
      links.forEach(function (l) {
        const target = active ? active.id : null;
        l.classList.toggle('active', l.dataset.target === target);
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Copy-code buttons ─────────────────────────────────── */
  function initCopyCode() {
    document.querySelectorAll('.code-wrapper').forEach(function (wrapper) {
      const pre = wrapper.querySelector('pre');
      if (!pre) return;

      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'Copy';
      wrapper.appendChild(btn);

      btn.addEventListener('click', function () {
        const text = pre.innerText || pre.textContent;
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
          }, 1800);
        });
      });
    });
  }

  /* ── Back to top ───────────────────────────────────────── */
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      btn.classList.toggle('visible', window.scrollY > 320);
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Active header nav link ────────────────────────────── */
  function initActiveNav() {
    const path = window.location.pathname;
    document.querySelectorAll('.header-nav a').forEach(function (a) {
      const href = a.getAttribute('href');
      if (!href) return;
      const match = path.endsWith(href) || path.endsWith(href.replace('.html', ''));
      a.classList.toggle('active', match);
    });
  }

  /* ── Search (Fuse.js) ──────────────────────────────────── */
  function initSearch() {
    const input = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    if (!input || !results) return;

    /* Build index from headings on the current page */
    const searchIndex = [];
    document.querySelectorAll('h2[id], h3[id], .block-section[id]').forEach(function (el) {
      const section = el.closest('.block-section');
      searchIndex.push({
        id: el.id || (section && section.id),
        title: el.textContent.trim(),
        section: section
          ? (section.querySelector('.block-header-text h2') || section).textContent.trim()
          : el.textContent.trim()
      });
    });

    /* Cross-page index entries (static, covers all docs pages) */
    const globalIndex = [
      { id: null, href: 'index.html',      title: 'Home',              section: 'Documentation' },
      { id: null, href: 'usage.html',       title: 'Usage Guide',       section: 'Documentation' },
      { id: null, href: 'stacker.html',     title: 'Stacker & Blocks',  section: 'Documentation' },
      { id: null, href: 'variables.html',   title: 'Variables & BotData', section: 'Documentation' },
      { id: null, href: 'loliscript.html',  title: 'LoliScript Reference', section: 'Documentation' },
      { id: null, href: 'remote.html',      title: 'Remote API',        section: 'Documentation' },
      { id: null, href: 'examples.html',    title: 'Examples',          section: 'Documentation' },
      { id: null, href: 'contribute.html',  title: 'Contribute',        section: 'Documentation' },
      /* Stacker blocks */
      { id: 'request',      href: 'stacker.html#request',      title: 'HTTP Request Block',   section: 'Stacker' },
      { id: 'tls-request',  href: 'stacker.html#tls-request',  title: 'TLS Request Block',    section: 'Stacker' },
      { id: 'keycheck',     href: 'stacker.html#keycheck',     title: 'Keycheck Block',       section: 'Stacker' },
      { id: 'parse',        href: 'stacker.html#parse',        title: 'Parse Block',          section: 'Stacker' },
      { id: 'function',     href: 'stacker.html#function',     title: 'Function Block',       section: 'Stacker' },
      { id: 'captcha',      href: 'stacker.html#captcha',      title: 'Captcha Block',        section: 'Stacker' },
      { id: 'utility',      href: 'stacker.html#utility',      title: 'Utility Block',        section: 'Stacker' },
      { id: 'imap',         href: 'stacker.html#imap',         title: 'IMAP Block',           section: 'Stacker' },
      { id: 'pop3',         href: 'stacker.html#pop3',         title: 'POP3 Block',           section: 'Stacker' },
      { id: 'smtp',         href: 'stacker.html#smtp',         title: 'SMTP Block',           section: 'Stacker' },
      { id: 'ftp',          href: 'stacker.html#ftp',          title: 'FTP Block',            section: 'Stacker' },
      { id: 'browseraction',href: 'stacker.html#browseraction','title': 'Browser Action Block', section: 'Stacker' },
      { id: 'tcp',          href: 'stacker.html#tcp',          title: 'TCP Block',            section: 'Stacker' },
    ];

    const combined = searchIndex.concat(globalIndex);

    /* Simple fuzzy search without Fuse dependency */
    function search(query) {
      const q = query.toLowerCase().trim();
      if (!q) return [];
      return combined.filter(function (item) {
        return item.title.toLowerCase().includes(q) ||
               item.section.toLowerCase().includes(q);
      }).slice(0, 8);
    }

    function render(items) {
      if (!items.length) {
        results.innerHTML = '<div class="search-result-item"><span class="sr-title" style="color:var(--text-dim)">No results</span></div>';
        results.classList.add('visible');
        return;
      }
      results.innerHTML = items.map(function (item) {
        const href = item.href
          ? item.href
          : (item.id ? '#' + item.id : '#');
        return '<a class="search-result-item" href="' + href + '">' +
               '<div class="sr-title">' + item.title + '</div>' +
               '<div class="sr-section">' + item.section + '</div>' +
               '</a>';
      }).join('');
      results.classList.add('visible');
    }

    input.addEventListener('input', function () {
      const q = input.value.trim();
      if (!q) { results.classList.remove('visible'); return; }
      render(search(q));
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        results.classList.remove('visible');
        input.blur();
      }
    });

    document.addEventListener('click', function (e) {
      if (!input.contains(e.target) && !results.contains(e.target)) {
        results.classList.remove('visible');
      }
    });
  }

  /* ── Smooth anchor scroll (compensate fixed header) ──── */
  function initAnchorScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--header-h')) || 56;
        const top = target.getBoundingClientRect().top + window.scrollY - offset - 16;
        window.scrollTo({ top: top, behavior: 'smooth' });
        history.pushState(null, '', '#' + id);
      });
    });
  }

  /* ── External links open in new tab ────────────────────── */
  function initExternalLinks() {
    document.querySelectorAll('a[href^="http"]').forEach(function (a) {
      if (!a.hostname || a.hostname === window.location.hostname) return;
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    });
  }

  /* ── Init ───────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initSidebar();
    initScrollSpy();
    initCopyCode();
    initBackToTop();
    initActiveNav();
    initSearch();
    initAnchorScroll();
    initExternalLinks();
  });
})();
