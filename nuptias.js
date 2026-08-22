/* ==========================================================================
   Nuptias Celebration Studio — shared behaviour
   Loaded on every page with <script src="…/nuptias.js" defer></script>
   ========================================================================== */

(function () {
  'use strict';

  var ROOT = document.body.getAttribute('data-root') || '';

  /* ------------------------------------------------------------------
     Storage. sessionStorage is blocked in some sandboxed previews, so
     every call is guarded and falls back to an in-memory object. The
     basket then still works within a page, it just won't survive a
     navigation in that environment.
     ------------------------------------------------------------------ */
  var memory = {};
  var store = {
    get: function (k) {
      try { return window.sessionStorage.getItem(k); }
      catch (e) { return Object.prototype.hasOwnProperty.call(memory, k) ? memory[k] : null; }
    },
    set: function (k, v) {
      try { window.sessionStorage.setItem(k, v); }
      catch (e) { memory[k] = v; }
    },
    remove: function (k) {
      try { window.sessionStorage.removeItem(k); }
      catch (e) { delete memory[k]; }
    }
  };

  var KEY_BASKET = 'nuptias:basket';
  var KEY_COLLECTION = 'nuptias:collection';
  var KEY_PREFILL = 'nuptias:prefill';

  function money(n) { return '£' + Number(n).toFixed(2); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ------------------------------------------------------------------
     Images: swap a failed photo for a branded panel rather than a
     broken-image icon.
     ------------------------------------------------------------------ */
  function guardImages(scope) {
    (scope || document).querySelectorAll('.media img').forEach(function (img) {
      if (img.dataset.guarded) return;
      img.dataset.guarded = '1';
      img.addEventListener('error', function () {
        var frame = img.closest('.media');
        if (frame) frame.classList.add('media--fallback');
        img.remove();
      });
      if (img.complete && img.naturalWidth === 0) {
        img.dispatchEvent(new Event('error'));
      }
    });
  }
  guardImages();

  /* ------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------ */
  var navToggle = document.getElementById('navToggle');
  var nav = document.getElementById('primary-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!open));
      navToggle.setAttribute('aria-expanded', String(!open));
      navToggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.setAttribute('data-open', 'false');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ------------------------------------------------------------------
     Toast
     ------------------------------------------------------------------ */
  var toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);
  var toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.setAttribute('data-visible', 'true');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.setAttribute('data-visible', 'false'); }, 2800);
  }

  /* ------------------------------------------------------------------
     Basket drawer — injected once per page so the markup lives in one
     place instead of being copied into every HTML file.
     ------------------------------------------------------------------ */
  var shell = document.createElement('div');
  shell.innerHTML =
    '<div class="overlay" id="nxOverlay" hidden></div>' +
    '<aside class="drawer" id="nxDrawer" role="dialog" aria-modal="true" aria-labelledby="nxDrawerTitle" aria-hidden="true">' +
      '<div class="drawer-head">' +
        '<h2 id="nxDrawerTitle">Your quote basket</h2>' +
        '<button class="drawer-close" id="nxDrawerClose" aria-label="Close basket">&times;</button>' +
      '</div>' +
      '<div class="drawer-body" id="nxDrawerBody"></div>' +
      '<div class="drawer-foot">' +
        '<div class="subtotal"><span>Estimated total</span><strong id="nxSubtotal">£0.00</strong></div>' +
        '<p class="drawer-note">An estimate, not a payment. Send it over and we will confirm a firm price against your final quantities.</p>' +
        '<button class="btn btn--primary btn--block" id="nxToEnquiry">Send basket for a quote</button>' +
      '</div>' +
    '</aside>';
  while (shell.firstChild) document.body.appendChild(shell.firstChild);

  var overlay = document.getElementById('nxOverlay');
  var drawer = document.getElementById('nxDrawer');
  var drawerBody = document.getElementById('nxDrawerBody');
  var subtotalEl = document.getElementById('nxSubtotal');

  var basket = [];
  try { basket = JSON.parse(store.get(KEY_BASKET) || '[]'); } catch (e) { basket = []; }

  function persist() { store.set(KEY_BASKET, JSON.stringify(basket)); }
  function lineTotal(i) { return i.qty * i.unitPrice + (i.flat || 0); }
  function basketTotal() { return basket.reduce(function (s, i) { return s + lineTotal(i); }, 0); }

  function renderBasket() {
    var units = basket.reduce(function (s, i) { return s + i.qty; }, 0);
    document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = units; });
    subtotalEl.textContent = money(basketTotal());

    if (!basket.length) {
      drawerBody.innerHTML =
        '<div class="drawer-empty">' +
          '<h3>Nothing here yet</h3>' +
          '<p>Add items from the catalogue and we will build an estimate as you go.</p>' +
          '<a href="' + ROOT + 'index.html#products" class="btn btn--primary">Browse the catalogue</a>' +
        '</div>';
      return;
    }

    drawerBody.innerHTML = basket.map(function (item, i) {
      return '<div class="line">' +
        '<div>' +
          '<h3>' + (item.url
            ? '<a href="' + ROOT + esc(item.url) + '">' + esc(item.name) + '</a>'
            : esc(item.name)) + '</h3>' +
          '<p class="line-meta">' + money(item.unitPrice) + ' per ' + esc(item.unitSingular || 'item') +
            (item.flat ? ' &middot; ' + money(item.flat) + ' design fee' : '') +
            ' &middot; min ' + item.min + '</p>' +
          (item.summary ? '<p class="line-spec">' + esc(item.summary) + '</p>' : '') +
          '<div class="qty">' +
            '<button type="button" data-act="dec" data-i="' + i + '" aria-label="Decrease quantity of ' + esc(item.name) + '">&minus;</button>' +
            '<input type="number" min="' + item.min + '" step="1" value="' + item.qty + '" data-act="set" data-i="' + i + '" aria-label="Quantity of ' + esc(item.name) + '">' +
            '<button type="button" data-act="inc" data-i="' + i + '" aria-label="Increase quantity of ' + esc(item.name) + '">+</button>' +
          '</div>' +
          '<button type="button" class="line-remove" data-act="rm" data-i="' + i + '">Remove</button>' +
        '</div>' +
        '<div class="line-total">' + money(lineTotal(item)) + '</div>' +
      '</div>';
    }).join('');
  }

  function addToBasket(item) {
    var key = item.name + '|' + (item.summary || '');
    var found = basket.find(function (i) { return (i.name + '|' + (i.summary || '')) === key; });
    if (found) {
      found.qty += item.qty;
      showToast(found.qty + ' ' + item.unit + ' of ' + item.name + ' in your basket');
    } else {
      basket.push(item);
      showToast(item.name + ' added — ' + item.qty + ' ' + item.unit);
    }
    persist();
    renderBasket();
  }

  /* Quick-add buttons anywhere on the site */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-add][data-name]');
    if (!t) return;
    var min = parseInt(t.dataset.min, 10) || 1;
    addToBasket({
      name: t.dataset.name,
      url: t.dataset.url || '',
      unitPrice: parseFloat(t.dataset.price) || 0,
      flat: parseFloat(t.dataset.flat) || 0,
      min: min,
      qty: min,
      unit: t.dataset.unit || 'items',
      unitSingular: t.dataset.unitSingular || (t.dataset.unit || 'item').replace(/s$/, ''),
      summary: t.dataset.summary || ''
    });
  });

  drawerBody.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-act]');
    if (!btn || btn.tagName === 'INPUT') return;
    var i = parseInt(btn.dataset.i, 10);
    var item = basket[i];
    if (!item) return;
    if (btn.dataset.act === 'inc') item.qty += 1;
    if (btn.dataset.act === 'dec') item.qty = Math.max(item.min, item.qty - 1);
    if (btn.dataset.act === 'rm') { basket.splice(i, 1); showToast(item.name + ' removed'); }
    persist();
    renderBasket();
  });

  drawerBody.addEventListener('change', function (e) {
    var input = e.target.closest('input[data-act="set"]');
    if (!input) return;
    var item = basket[parseInt(input.dataset.i, 10)];
    var val = parseInt(input.value, 10);
    item.qty = (isNaN(val) || val < item.min) ? item.min : val;
    persist();
    renderBasket();
  });

  /* Drawer open / close with focus management */
  var lastFocused = null;
  function openDrawer() {
    lastFocused = document.activeElement;
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.setAttribute('data-open', 'true'); });
    drawer.setAttribute('data-open', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.getElementById('nxDrawerClose').focus();
  }
  function closeDrawer() {
    overlay.setAttribute('data-open', 'false');
    drawer.setAttribute('data-open', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(function () { overlay.hidden = true; }, 300);
    if (lastFocused) lastFocused.focus();
  }
  document.querySelectorAll('[data-open-basket]').forEach(function (b) {
    b.addEventListener('click', openDrawer);
  });
  document.getElementById('nxDrawerClose').addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer.getAttribute('data-open') === 'true') closeDrawer();
  });

  function basketAsText() {
    if (!basket.length) return '';
    var lines = basket.map(function (i) {
      return '• ' + i.qty + ' × ' + i.name + (i.summary ? '\n    ' + i.summary : '') +
        '  — ' + money(lineTotal(i));
    }).join('\n');
    return 'I would like a quote for:\n' + lines + '\n\nEstimated total: ' + money(basketTotal()) + '\n\n';
  }

  document.getElementById('nxToEnquiry').addEventListener('click', function () {
    var field = document.getElementById('f-message');
    if (field) {
      if (basket.length) field.value = basketAsText();
      closeDrawer();
      var target = document.getElementById('enquiry');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      setTimeout(function () {
        field.focus();
        field.setSelectionRange(field.value.length, field.value.length);
      }, 500);
    } else {
      store.set(KEY_PREFILL, '1');
      window.location.href = ROOT + 'index.html#enquiry';
    }
  });

  renderBasket();

  /* ------------------------------------------------------------------
     Collection preference — chosen once on a collection page, then
     carried across every product page.
     ------------------------------------------------------------------ */
  var collBar = document.getElementById('collectionBar');
  function currentCollection() { return store.get(KEY_COLLECTION); }

  function paintCollectionBar() {
    if (!collBar) return;
    var c = currentCollection();
    if (!c) { collBar.setAttribute('data-visible', 'false'); return; }
    collBar.setAttribute('data-visible', 'true');
    collBar.querySelector('[data-collection-name]').textContent = c;
  }
  if (collBar) {
    collBar.addEventListener('click', function (e) {
      if (e.target.closest('[data-clear-collection]')) {
        store.remove(KEY_COLLECTION);
        paintCollectionBar();
        showToast('Collection cleared — browsing all four');
      }
    });
    paintCollectionBar();
  }

  document.querySelectorAll('[data-set-collection]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var name = btn.getAttribute('data-set-collection');
      store.set(KEY_COLLECTION, name);
      showToast(name + ' selected — it will be pre-set on every product');
      paintCollectionBar();
    });
  });

  /* ------------------------------------------------------------------
     Live price configurator.
     Driven entirely by data attributes so no page needs its own script.

       form[data-configurator]
         data-name          product name
         data-unit          plural unit noun, e.g. "suites"
         data-unit-singular optional singular, e.g. "suite"
         data-base-unit     base price per unit
         data-base-flat     base one-off fee
         data-min           minimum quantity
         data-breaks        JSON [[qty, multiplier], …] applied to unit price

       inputs
         data-delta   adds to the per-unit price
         data-flat    adds a one-off fee
         data-label   what appears in the basket summary
     ------------------------------------------------------------------ */
  document.querySelectorAll('form[data-configurator]').forEach(function (form) {
    var cfg = form.dataset;
    var baseUnit = parseFloat(cfg.baseUnit) || 0;
    var baseFlat = parseFloat(cfg.baseFlat) || 0;
    var min = parseInt(cfg.min, 10) || 1;
    var breaks = [];
    try { breaks = JSON.parse(cfg.breaks || '[]'); } catch (e) { breaks = []; }

    var qtyInput = form.querySelector('[data-qty]');
    var totalEl = form.querySelector('[data-price-total]');
    var perEl = form.querySelector('[data-price-per]');
    var noteEl = form.querySelector('[data-break-note]');

    function selections() {
      var out = [];
      form.querySelectorAll('input[data-label]').forEach(function (input) {
        if ((input.type === 'radio' || input.type === 'checkbox') && input.checked) {
          out.push({ el: input, label: input.dataset.label, group: input.dataset.group || input.name });
        }
      });
      return out;
    }

    function multiplierFor(qty) {
      var m = 1, hit = null;
      breaks.forEach(function (b) {
        if (qty >= b[0]) { m = b[1]; hit = b[0]; }
      });
      return { m: m, at: hit };
    }

    function nextBreak(qty) {
      var next = null;
      breaks.forEach(function (b) { if (qty < b[0] && !next) next = b; });
      return next;
    }

    function compute() {
      var qty = parseInt(qtyInput.value, 10);
      if (isNaN(qty) || qty < min) qty = min;

      var unitAdd = 0, flatAdd = 0;
      selections().forEach(function (s) {
        unitAdd += parseFloat(s.el.dataset.delta) || 0;
        flatAdd += parseFloat(s.el.dataset.flat) || 0;
      });

      var brk = multiplierFor(qty);
      var perUnit = (baseUnit + unitAdd) * brk.m;
      var total = perUnit * qty + baseFlat + flatAdd;

      return { qty: qty, perUnit: perUnit, total: total, flat: baseFlat + flatAdd, brk: brk };
    }

    function summaryText() {
      var groups = {};
      selections().forEach(function (s) {
        groups[s.group] = groups[s.group] || [];
        groups[s.group].push(s.label);
      });
      return Object.keys(groups).map(function (g) {
        return groups[g].join(', ');
      }).join(' · ');
    }

    function paint() {
      var r = compute();
      if (totalEl) totalEl.textContent = money(r.total);
      if (perEl) {
        perEl.textContent = money(r.perUnit) + ' per ' + (cfg.unitSingular || 'item') +
          ' × ' + r.qty + (r.flat ? ' + ' + money(r.flat) + ' design & setup' : '');
      }
      if (noteEl) {
        var nb = nextBreak(r.qty);
        if (nb) {
          var saving = (1 - nb[1]) * 100;
          noteEl.textContent = 'Order ' + nb[0] + ' or more and the unit price drops by ' + Math.round(saving) + '%.';
        } else if (r.brk.at) {
          noteEl.textContent = 'Volume price applied at ' + r.brk.at + '+.';
        } else {
          noteEl.textContent = '';
        }
      }
    }

    form.addEventListener('change', paint);
    form.addEventListener('input', paint);
    form.addEventListener('submit', function (e) { e.preventDefault(); });

    form.querySelectorAll('[data-qty-step]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var step = parseInt(btn.dataset.qtyStep, 10);
        var v = (parseInt(qtyInput.value, 10) || min) + step;
        qtyInput.value = Math.max(min, v);
        paint();
      });
    });
    form.querySelectorAll('[data-qty-preset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        qtyInput.value = btn.dataset.qtyPreset;
        paint();
      });
    });

    /* Pre-select the collection chosen earlier, if this form offers one */
    var saved = currentCollection();
    if (saved) {
      form.querySelectorAll('input[data-collection-option]').forEach(function (input) {
        if (input.dataset.label === saved) input.checked = true;
      });
    }

    var addBtn = form.querySelector('[data-add-configured]');
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        var r = compute();
        addToBasket({
          name: cfg.name,
          url: cfg.url || '',
          unitPrice: r.perUnit,
          flat: r.flat,
          min: min,
          qty: r.qty,
          unit: cfg.unit || 'items',
          unitSingular: cfg.unitSingular || 'item',
          summary: summaryText()
        });
      });
    }

    paint();
  });

  /* ------------------------------------------------------------------
     Gallery
     ------------------------------------------------------------------ */
  document.querySelectorAll('[data-gallery]').forEach(function (gal) {
    var main = gal.querySelector('[data-gallery-main]');
    var frame = main.closest('.media');
    gal.querySelectorAll('.thumb').forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        gal.querySelectorAll('.thumb').forEach(function (t) { t.setAttribute('aria-current', 'false'); });
        thumb.setAttribute('aria-current', 'true');
        var img = thumb.querySelector('img');
        frame.classList.remove('media--fallback');
        if (!gal.querySelector('[data-gallery-main]')) {
          var fresh = document.createElement('img');
          fresh.setAttribute('data-gallery-main', '');
          frame.appendChild(fresh);
          main = fresh;
          guardImages(gal);
        }
        main.src = img ? img.src : thumb.dataset.full;
        main.alt = thumb.dataset.alt || '';
        frame.setAttribute('data-label', thumb.dataset.label || frame.dataset.label);
      });
    });
  });

  /* ------------------------------------------------------------------
     Enquiry form (index only)
     ------------------------------------------------------------------ */
  var form = document.getElementById('enquiryForm');
  if (form) {
    var status = document.getElementById('formStatus');

    if (store.get(KEY_PREFILL) === '1') {
      var msg = document.getElementById('f-message');
      if (msg && basket.length) msg.value = basketAsText();
      store.remove(KEY_PREFILL);
    }
    var savedColl = currentCollection();
    if (savedColl) {
      var sel = document.getElementById('f-collection');
      if (sel) {
        Array.prototype.forEach.call(sel.options, function (o) {
          if (o.text === savedColl) sel.value = o.value;
        });
      }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      ['name', 'email', 'message'].forEach(function (key) {
        var wrap = form.querySelector('[data-field="' + key + '"]');
        var input = wrap.querySelector('input, textarea');
        var valid = input.value.trim() !== '' &&
          (key !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim()));
        wrap.setAttribute('data-invalid', String(!valid));
        if (!valid && ok) { input.focus(); ok = false; }
      });

      if (!ok) {
        status.textContent = 'Check the highlighted fields and send again.';
        status.setAttribute('data-visible', 'true');
        return;
      }

      /* No backend is wired up yet. Hand the enquiry to the visitor's mail
         client so nothing is silently lost. Swap for a real endpoint at launch. */
      var name = form.querySelector('#f-name').value.trim();
      var mail = 'mailto:hello@nuptias.co.uk' +
        '?subject=' + encodeURIComponent('Wedding stationery enquiry — ' + name) +
        '&body=' + encodeURIComponent(
          'Name: ' + name +
          '\nEmail: ' + form.querySelector('#f-email').value.trim() +
          '\nWedding date: ' + (form.querySelector('#f-date').value || 'Not set') +
          '\nCollection: ' + form.querySelector('#f-collection').value +
          '\n\n' + form.querySelector('#f-message').value.trim()
        );

      status.innerHTML = 'Thanks, ' + esc(name.split(' ')[0]) +
        '. Your email app should open with the enquiry ready to send. If it does not, write to ' +
        '<a href="mailto:hello@nuptias.co.uk" style="color:#fff">hello@nuptias.co.uk</a>.';
      status.setAttribute('data-visible', 'true');
      window.location.href = mail;
    });
  }

  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
