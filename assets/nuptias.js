/* ==========================================================================
   Nuptias Celebration Studio — shared behaviour
   Loaded on every page: <script src="…/nuptias.js" defer></script>
   ========================================================================== */

(function () {
  'use strict';

  var ROOT = document.body.getAttribute('data-root') || '';
  var LEAD_TIME = '3 weeks from proof approval';

  /* ---------- Storage (guarded: sandboxed previews block sessionStorage) --- */
  var memory = {};
  var store = {
    get: function (k) {
      try { return window.sessionStorage.getItem(k); }
      catch (e) { return Object.prototype.hasOwnProperty.call(memory, k) ? memory[k] : null; }
    },
    set: function (k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) { memory[k] = v; } },
    remove: function (k) { try { window.sessionStorage.removeItem(k); } catch (e) { delete memory[k]; } }
  };

  var KEY_BASKET = 'nuptias:basket';
  var KEY_COLLECTION = 'nuptias:collection';
  var KEY_PREFILL = 'nuptias:prefill';

  function money(n) { return '£' + Number(n).toFixed(2); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function prettyDate(iso) {
    if (!iso) return '';
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  /* ------------------------------------------------------------------
     Images: try images/<name> first, then the placeholder in
     data-fallback, then a branded panel. This is what lets you drop a
     real photograph into the images/ folder and have it appear with no
     code change at all.
     ------------------------------------------------------------------ */
  function guardImages(scope) {
    (scope || document).querySelectorAll('.media img').forEach(function (img) {
      if (img.dataset.guarded) return;
      img.dataset.guarded = '1';
      img.addEventListener('error', function () {
        var fb = img.getAttribute('data-fallback');
        if (fb && img.src.indexOf(fb) === -1) { img.removeAttribute('data-fallback'); img.src = fb; return; }
        var frame = img.closest('.media');
        if (frame) frame.classList.add('media--fallback');
        img.remove();
      });
      if (img.complete && img.naturalWidth === 0) img.dispatchEvent(new Event('error'));
    });
  }
  guardImages();

  /* ---------- Mobile navigation ---------- */
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

  /* ---------- Toast ---------- */
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

  /* ---------- Basket drawer (injected once per page) ---------- */
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
        '<p class="drawer-note">An estimate, not a payment. We confirm a firm price against your final quantities. ' +
        'Please allow <strong>' + LEAD_TIME + '</strong> for production.</p>' +
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
          '<p>Add pieces from the range and we will build an estimate as you go.</p>' +
          '<a href="' + ROOT + 'index.html#range" class="btn btn--primary">See the range</a>' +
        '</div>';
      return;
    }

    drawerBody.innerHTML = basket.map(function (item, i) {
      return '<div class="line">' +
        '<div>' +
          '<h3>' + (item.url ? '<a href="' + ROOT + esc(item.url) + '">' + esc(item.name) + '</a>' : esc(item.name)) + '</h3>' +
          '<p class="line-meta">' + money(item.unitPrice) + ' per ' + esc(item.unitSingular || 'item') +
            (item.flat ? ' &middot; ' + money(item.flat) + ' setup' : '') + ' &middot; min ' + item.min + '</p>' +
          (item.spec ? '<p class="line-spec">' + esc(item.spec) + '</p>' : '') +
          (item.details ? '<p class="line-spec">' + esc(item.details) + '</p>' : '') +
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
    var key = item.name + '|' + (item.spec || '') + '|' + (item.details || '');
    var found = basket.find(function (i) { return (i.name + '|' + (i.spec || '') + '|' + (i.details || '')) === key; });
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

  /* Simple quick-add buttons (sample pack, packages) */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-add][data-name]');
    if (!t) return;
    var min = parseInt(t.dataset.min, 10) || 1;
    addToBasket({
      name: t.dataset.name, url: t.dataset.url || '',
      unitPrice: parseFloat(t.dataset.price) || 0, flat: parseFloat(t.dataset.flat) || 0,
      min: min, qty: min, unit: t.dataset.unit || 'items',
      unitSingular: t.dataset.unitSingular || (t.dataset.unit || 'item').replace(/s$/, ''),
      spec: t.dataset.spec || '', details: ''
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
    persist(); renderBasket();
  });

  drawerBody.addEventListener('change', function (e) {
    var input = e.target.closest('input[data-act="set"]');
    if (!input) return;
    var item = basket[parseInt(input.dataset.i, 10)];
    var val = parseInt(input.value, 10);
    item.qty = (isNaN(val) || val < item.min) ? item.min : val;
    persist(); renderBasket();
  });

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
  document.querySelectorAll('[data-open-basket]').forEach(function (b) { b.addEventListener('click', openDrawer); });
  document.getElementById('nxDrawerClose').addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (dlg && dlg.getAttribute('data-open') === 'true') { closeDialog(); return; }
    if (drawer.getAttribute('data-open') === 'true') closeDrawer();
  });

  function basketAsText() {
    if (!basket.length) return '';
    var lines = basket.map(function (i) {
      return '• ' + i.qty + ' × ' + i.name +
        (i.spec ? '\n    Options: ' + i.spec : '') +
        (i.details ? '\n    Details: ' + i.details : '') +
        '\n    ' + money(lineTotal(i));
    }).join('\n\n');
    return 'I would like a quote for:\n\n' + lines +
      '\n\nEstimated total: ' + money(basketTotal()) +
      '\n\nI understand production takes ' + LEAD_TIME + '.\n\n';
  }

  document.getElementById('nxToEnquiry').addEventListener('click', function () {
    var field = document.getElementById('f-message');
    if (field) {
      if (basket.length) field.value = basketAsText();
      closeDrawer();
      var target = document.getElementById('enquiry');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      setTimeout(function () { field.focus(); field.setSelectionRange(field.value.length, field.value.length); }, 500);
    } else {
      store.set(KEY_PREFILL, '1');
      window.location.href = ROOT + 'index.html#enquiry';
    }
  });

  renderBasket();

  /* ------------------------------------------------------------------
     Personalisation dialog.
     Products are described in window.NUPTIAS_PRODUCTS (see index.html).
     Every product captures the couple's names and the event date, plus
     whatever extra fields that product needs.
     ------------------------------------------------------------------ */
  var PRODUCTS = window.NUPTIAS_PRODUCTS || {};
  var dlg = null, current = null;

  function buildDialog() {
    dlg = document.createElement('div');
    dlg.className = 'dlg';
    dlg.setAttribute('data-open', 'false');
    dlg.setAttribute('role', 'dialog');
    dlg.setAttribute('aria-modal', 'true');
    dlg.setAttribute('aria-labelledby', 'dlgTitle');
    dlg.innerHTML =
      '<div class="dlg-panel">' +
        '<div class="dlg-head">' +
          '<div><h2 id="dlgTitle"></h2><p id="dlgSub"></p></div>' +
          '<button class="dlg-close" aria-label="Close">&times;</button>' +
        '</div>' +
        '<div class="dlg-body" id="dlgBody"></div>' +
        '<div class="dlg-foot">' +
          '<div class="dlg-price"><span>Estimated total</span><strong id="dlgTotal">£0.00</strong></div>' +
          '<div class="dlg-per" id="dlgPer"></div>' +
          '<div class="dlg-lead">Production takes ' + LEAD_TIME + '. Order early for peak season.</div>' +
          '<button class="btn btn--primary btn--block" id="dlgAdd">Add to my quote</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(dlg);
    dlg.querySelector('.dlg-close').addEventListener('click', closeDialog);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closeDialog(); });
    dlg.querySelector('#dlgAdd').addEventListener('click', submitDialog);
    dlg.addEventListener('input', paintDialog);
    dlg.addEventListener('change', paintDialog);
  }

  function fieldHTML(f) {
    var req = f.required ? ' <span class="req" aria-hidden="true">*</span>' : '';
    var input;
    if (f.type === 'select') {
      input = '<select id="pf-' + f.key + '" data-key="' + f.key + '">' +
        f.options.map(function (o, i) {
          return '<option value="' + i + '" data-delta="' + (o.delta || 0) + '" data-flat="' + (o.flat || 0) + '"' +
            (i === (f.defaultIndex || 0) ? ' selected' : '') + '>' + esc(o.label) +
            (o.delta ? '  (' + (o.delta > 0 ? '+' : '') + money(o.delta) + ' each)' : '') +
            (o.flat ? '  (' + (o.flat > 0 ? '+' : '') + money(o.flat) + ')' : '') +
            '</option>';
        }).join('') + '</select>';
    } else if (f.type === 'textarea') {
      input = '<textarea id="pf-' + f.key + '" data-key="' + f.key + '" placeholder="' + esc(f.placeholder || '') + '"></textarea>';
    } else if (f.type === 'number') {
      input = '<input type="number" id="pf-' + f.key + '" data-key="' + f.key + '" value="' + f.value + '" min="' + f.min + '" step="1">';
    } else {
      input = '<input type="' + (f.type || 'text') + '" id="pf-' + f.key + '" data-key="' + f.key +
        '" placeholder="' + esc(f.placeholder || '') + '">';
    }
    return '<div class="field" data-field="' + f.key + '"' + (f.required ? ' data-required="1"' : '') + '>' +
      '<label for="pf-' + f.key + '">' + esc(f.label) + req + '</label>' + input +
      (f.hint ? '<p class="hint">' + esc(f.hint) + '</p>' : '') +
      '<p class="err">' + esc(f.error || 'This one is needed so we can start your proof.') + '</p>' +
    '</div>';
  }

  function openDialog(id) {
    var p = PRODUCTS[id];
    if (!p) return;
    if (!dlg) buildDialog();
    current = p;
    lastFocused = document.activeElement;

    dlg.querySelector('#dlgTitle').textContent = p.name;
    dlg.querySelector('#dlgSub').textContent = p.blurb || '';

    var fields = [
      { key: 'couple', label: "Couple's names", required: true, placeholder: 'e.g. Aneesah & Yusuf',
        hint: 'Exactly as you want them printed.', error: 'We need the names that go on the artwork.' },
      { key: 'date', label: 'Date of the event', type: 'date', required: true,
        error: 'The date appears on most pieces, and it sets your production schedule.' }
    ];
    if (p.eventType !== false) {
      fields.push({ key: 'event', label: 'Type of event', type: 'select', options: [
        { label: 'Wedding' }, { label: 'Nikah' }, { label: 'Walima' }, { label: 'Engagement' },
        { label: 'Mehndi' }, { label: 'Reception' }, { label: 'Other celebration' }
      ] });
    }
    fields = fields.concat(p.fields || []);
    fields.push({ key: 'qty', label: p.qtyLabel || 'Quantity', type: 'number',
      value: p.min, min: p.min, hint: 'Minimum ' + p.min + ' ' + p.unit + '.' });
    fields.push({ key: 'notes', label: 'Wording and anything else we should know', type: 'textarea',
      placeholder: p.notesPlaceholder || 'Exact wording, colours, venue name, anything you have seen and liked.' });

    dlg.querySelector('#dlgBody').innerHTML =
      (p.tiers && p.tiers.length > 1 ? tierTable(p) : '') +
      fields.map(fieldHTML).join('');

    dlg.setAttribute('data-open', 'true');
    document.body.style.overflow = 'hidden';
    paintDialog();
    setTimeout(function () { var f = dlg.querySelector('#pf-couple'); if (f) f.focus(); }, 60);
  }

  function tierTable(p) {
    return '<table class="tiers-table"><caption class="visually-hidden">Volume pricing</caption>' +
      '<tbody>' + p.tiers.map(function (t, i) {
        var next = p.tiers[i + 1];
        var range = next ? t[0] + '–' + (next[0] - 1) : t[0] + '+';
        return '<tr data-tier="' + t[0] + '"><th scope="row">' + range + ' ' + p.unit + '</th>' +
          '<td>' + money(p.base * t[1]) + ' each</td></tr>';
      }).join('') + '</tbody></table>';
  }

  function readDialog() {
    var p = current, unitAdd = 0, flatAdd = 0, spec = [], details = [];
    var qtyEl = dlg.querySelector('#pf-qty');
    var qty = parseInt(qtyEl ? qtyEl.value : p.min, 10);
    if (isNaN(qty) || qty < p.min) qty = p.min;

    dlg.querySelectorAll('[data-key]').forEach(function (el) {
      var key = el.dataset.key;
      if (key === 'qty') return;
      if (el.tagName === 'SELECT') {
        var opt = el.options[el.selectedIndex];
        unitAdd += parseFloat(opt.dataset.delta) || 0;
        flatAdd += parseFloat(opt.dataset.flat) || 0;
        if (key !== 'event') spec.push(opt.textContent.split('  (')[0].trim());
        else details.push('Event: ' + opt.textContent.trim());
      } else if (el.value.trim()) {
        if (key === 'couple') details.unshift(el.value.trim());
        else if (key === 'date') details.push(prettyDate(el.value));
        else if (key === 'notes') details.push('Notes: ' + el.value.trim());
        else details.push(el.value.trim());
      }
    });

    var mult = 1, hit = null;
    (p.tiers || []).forEach(function (t) { if (qty >= t[0]) { mult = t[1]; hit = t[0]; } });
    var perUnit = (p.base + unitAdd) * mult;
    var flat = (p.flat || 0) + flatAdd;

    return { qty: qty, perUnit: perUnit, flat: flat, total: perUnit * qty + flat,
             spec: spec.join(' · '), details: details.join(' · '), tierAt: hit };
  }

  function paintDialog() {
    if (!current) return;
    var r = readDialog();
    dlg.querySelector('#dlgTotal').textContent = money(r.total);
    dlg.querySelector('#dlgPer').textContent =
      money(r.perUnit) + ' per ' + current.unitSingular + ' × ' + r.qty +
      (r.flat ? ' + ' + money(r.flat) + ' setup' : '');
    dlg.querySelectorAll('.tiers-table tr').forEach(function (tr) {
      tr.classList.toggle('is-active', parseInt(tr.dataset.tier, 10) === r.tierAt);
    });
  }

  function submitDialog() {
    var ok = true;
    dlg.querySelectorAll('.field[data-required="1"]').forEach(function (wrap) {
      var el = wrap.querySelector('input, select, textarea');
      var valid = el.value.trim() !== '';
      wrap.setAttribute('data-invalid', String(!valid));
      if (!valid && ok) { el.focus(); ok = false; }
    });
    if (!ok) return;

    var r = readDialog();
    addToBasket({
      name: current.name, url: current.url || '',
      unitPrice: r.perUnit, flat: r.flat, min: current.min, qty: r.qty,
      unit: current.unit, unitSingular: current.unitSingular,
      spec: r.spec, details: r.details
    });
    closeDialog();
  }

  function closeDialog() {
    if (!dlg) return;
    dlg.setAttribute('data-open', 'false');
    document.body.style.overflow = '';
    current = null;
    if (lastFocused) lastFocused.focus();
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-personalise]');
    if (!t) return;
    e.preventDefault();
    openDialog(t.getAttribute('data-personalise'));
  });

  /* ---------- Collection preference ---------- */
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
        store.remove(KEY_COLLECTION); paintCollectionBar();
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

  /* ---------- Data-attribute configurator (product detail pages) ---------- */
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
      breaks.forEach(function (b) { if (qty >= b[0]) { m = b[1]; hit = b[0]; } });
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
      return { qty: qty, perUnit: perUnit, total: perUnit * qty + baseFlat + flatAdd,
               flat: baseFlat + flatAdd, brk: brk };
    }
    function summaryText() {
      var groups = {};
      selections().forEach(function (s) { (groups[s.group] = groups[s.group] || []).push(s.label); });
      return Object.keys(groups).map(function (g) { return groups[g].join(', '); }).join(' · ');
    }
    function paint() {
      var r = compute();
      if (totalEl) totalEl.textContent = money(r.total);
      if (perEl) perEl.textContent = money(r.perUnit) + ' per ' + (cfg.unitSingular || 'item') +
        ' × ' + r.qty + (r.flat ? ' + ' + money(r.flat) + ' design & setup' : '');
      if (noteEl) {
        var nb = nextBreak(r.qty);
        if (nb) noteEl.textContent = 'Order ' + nb[0] + ' or more and the unit price drops by ' + Math.round((1 - nb[1]) * 100) + '%.';
        else if (r.brk.at) noteEl.textContent = 'Volume price applied at ' + r.brk.at + '+.';
        else noteEl.textContent = '';
      }
    }
    form.addEventListener('change', paint);
    form.addEventListener('input', paint);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    form.querySelectorAll('[data-qty-step]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        qtyInput.value = Math.max(min, (parseInt(qtyInput.value, 10) || min) + parseInt(btn.dataset.qtyStep, 10));
        paint();
      });
    });
    form.querySelectorAll('[data-qty-preset]').forEach(function (btn) {
      btn.addEventListener('click', function () { qtyInput.value = btn.dataset.qtyPreset; paint(); });
    });
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
          name: cfg.name, url: cfg.url || '', unitPrice: r.perUnit, flat: r.flat,
          min: min, qty: r.qty, unit: cfg.unit || 'items',
          unitSingular: cfg.unitSingular || 'item', spec: summaryText(), details: ''
        });
      });
    }
    paint();
  });

  /* ---------- Gallery ---------- */
  document.querySelectorAll('[data-gallery]').forEach(function (gal) {
    var main = gal.querySelector('[data-gallery-main]');
    if (!main) return;
    var frame = main.closest('.media');
    gal.querySelectorAll('.thumb').forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        gal.querySelectorAll('.thumb').forEach(function (t) { t.setAttribute('aria-current', 'false'); });
        thumb.setAttribute('aria-current', 'true');
        var img = thumb.querySelector('img');
        frame.classList.remove('media--fallback');
        main.src = img ? img.src : thumb.dataset.full;
        main.alt = thumb.dataset.alt || '';
        frame.setAttribute('data-label', thumb.dataset.label || frame.dataset.label);
      });
    });
  });

  /* ---------- Enquiry form ---------- */
  var form = document.getElementById('enquiryForm');
  if (form) {
    var status = document.getElementById('formStatus');
    if (store.get(KEY_PREFILL) === '1') {
      var msg = document.getElementById('f-message');
      if (msg && basket.length) msg.value = basketAsText();
      store.remove(KEY_PREFILL);
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
      var name = form.querySelector('#f-name').value.trim();
      var mail = 'mailto:hello@nuptias.co.uk' +
        '?subject=' + encodeURIComponent('Enquiry — ' + name) +
        '&body=' + encodeURIComponent(
          'Name: ' + name +
          '\nEmail: ' + form.querySelector('#f-email').value.trim() +
          '\nEvent date: ' + (form.querySelector('#f-date').value || 'Not set') +
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
