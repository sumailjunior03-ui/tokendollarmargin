/* CalcHQ — ads.js (v4)
   Keeps AdSense rails present but COLLAPSED by default (no empty space).
   - If ADS_ACTIVE is false: no-op; everything stays hidden.
   - If ADS_ACTIVE is true: requests ads and only reveals a slot once an iframe is injected.
*/
(function () {
  var cfg = (window.CALCHQ_CONFIG || {});
  if (!cfg.ADS_ACTIVE) return;

  function tryPush() {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      return true;
    } catch (e) {
      return false;
    }
  }

  function reveal(wrapper) {
    wrapper.classList.remove('is-off');
    wrapper.classList.add('is-filled');
  }

  function applyCfg(ins, slotId) {
    if (cfg.ADSENSE_CLIENT) ins.setAttribute('data-ad-client', cfg.ADSENSE_CLIENT);
    if (slotId) ins.setAttribute('data-ad-slot', slotId);
  }

  function initSlot(wrapper, slotId) {
    var ins = wrapper.querySelector('ins.adsbygoogle');
    if (!ins) return;

    applyCfg(ins, slotId);

    // Request an ad (quietly fails if not approved / blocked)
    tryPush();

    // If iframe exists immediately, reveal now
    if (ins.querySelector('iframe')) {
      reveal(wrapper);
      return;
    }

    // Reveal only when an iframe appears
    var obs = new MutationObserver(function () {
      if (ins.querySelector('iframe')) {
        reveal(wrapper);
        try { obs.disconnect(); } catch (e) {}
      }
    });
    obs.observe(ins, { childList: true, subtree: true });

    // Defensive re-check
    setTimeout(function () {
      if (ins.querySelector('iframe')) reveal(wrapper);
    }, 1200);
  }

  // Slot mapping
  var slot1 = cfg.AD_SLOT_1 || "";
  var slot2 = cfg.AD_SLOT_2 || "";

  // If no slots configured yet, keep everything hidden
  if (!slot1 && !slot2) return;

  var ad1 = document.getElementById('ad1');
  var ad2 = document.getElementById('ad2');

  if (ad1 && slot1) initSlot(ad1, slot1);
  if (ad2 && slot2) initSlot(ad2, slot2);
})();
