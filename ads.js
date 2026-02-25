/* CalcHQ — ads.js
   Purpose: keep AdSense placeholders present, but hide them until an ad is actually rendered
   to avoid dead space. Safe no-op if ads are not yet serving.
*/
(function () {
  function tryPush(ins) {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      return true;
    } catch (e) {
      return false;
    }
  }

  function markFilled(wrapper) {
    if (!wrapper.classList.contains('is-filled')) wrapper.classList.add('is-filled');
  }

  function initOne(wrapper) {
    var ins = wrapper.querySelector('ins.adsbygoogle');
    if (!ins) return;

    // Attempt to request an ad (will quietly fail if not approved / blocked)
    tryPush(ins);

    // If an iframe already exists, show now
    if (ins.querySelector('iframe')) {
      markFilled(wrapper);
      return;
    }

    // Observe for the moment an iframe appears
    var obs = new MutationObserver(function () {
      if (ins.querySelector('iframe')) {
        markFilled(wrapper);
        try { obs.disconnect(); } catch (e) {}
      }
    });
    obs.observe(ins, { childList: true, subtree: true });

    // Defensive: if ad fills via async layout, re-check later
    setTimeout(function () {
      if (ins.querySelector('iframe')) markFilled(wrapper);
    }, 2000);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var slots = document.querySelectorAll('.ad-slot');
    for (var i = 0; i < slots.length; i++) initOne(slots[i]);
  });
})();
