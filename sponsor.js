/* CalcHQ — sponsor.js
   Manages direct sponsorship slots across the network.
   Slots are baked into HTML but hidden by default — no layout shift when inactive.

   To activate when a sponsor is confirmed:
     1. Set SPONSOR_ACTIVE = true
     2. Fill in SPONSOR_CONTENT.banner and/or SPONSOR_CONTENT.sidebar with HTML
*/

(function () {

  var SPONSOR_ACTIVE = false;

  var SPONSOR_CONTENT = {
    label:   'Sponsors',
    banner:  '', // HTML string for the banner slot
    sidebar: ''  // HTML string for the sidebar slot
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (!SPONSOR_ACTIVE) return;

    // ── Banner slots ────────────────────────────────
    var banners = document.querySelectorAll('.sponsor-banner');
    banners.forEach(function (el) {
      var label   = el.querySelector('.sponsor-label');
      var content = el.querySelector('.sponsor-content');
      if (label)   label.textContent  = SPONSOR_CONTENT.label;
      if (content) content.innerHTML  = SPONSOR_CONTENT.banner;
      el.style.display = '';
      el.removeAttribute('aria-hidden');
    });

    // ── Sidebar slots ───────────────────────────────
    var sidebars = document.querySelectorAll('.sponsor-sidebar');
    sidebars.forEach(function (el) {
      el.innerHTML =
        '<span class="sponsor-label">' + SPONSOR_CONTENT.label + '</span>' +
        '<span class="sponsor-content">' + SPONSOR_CONTENT.sidebar + '</span>';
      el.style.display = '';
      el.removeAttribute('aria-hidden');
    });
  });

}());
