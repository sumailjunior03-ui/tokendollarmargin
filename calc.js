/* Token-to-Dollar Margin Calculator — calc.js
   Scope: gross margin + breakeven. Nothing else.

   Architecture:
     1. DATA    — model pricing constants (edit here only)
     2. LOGIC   — pure functions, no DOM, no side effects
     3. UI      — reads inputs, calls logic, writes output
*/


/* ─────────────────────────────────────────────
   1. DATA
   Model pricing lives in models.js (loaded before this script).
   To add/update models: edit models.js only. Nothing here changes.
───────────────────────────────────────────────*/
// MODELS is sourced from window.CALC_MODELS (models.js)
var MODELS = window.CALC_MODELS;

var __prevModelId = null;
var __lastCustomCin = '';
var __lastCustomCout = '';



/* ─────────────────────────────────────────────
   2. LOGIC
   Pure functions only.
   Input: numbers. Output: numbers or null.
   No DOM. No formatting. No advice.
───────────────────────────────────────────────*/

function apiCostPerUser(R, Tin, Tout, Cin, Cout) {
  return (R * Tin * Cin) + (R * Tout * Cout);
}

function varCostPerUser(apiCost, V) {
  return apiCost + V;
}

function grossProfitPerUser(P, varCost) {
  return P - varCost;
}

function grossMarginPct(GP, P) {
  if (P === 0) return null;
  return (GP / P) * 100;
}

function breakevenUsers(F, GP) {
  if (GP <= 0) return null;
  return Math.ceil(F / GP);
}

function totalApiAtN(N, apiCost) {
  return N * apiCost;
}


/* ─────────────────────────────────────────────
   3. UI
   All DOM reads and writes live here only.
───────────────────────────────────────────────*/

function fmtUSD(n) {
  if (n === null || isNaN(n)) return '—';
  if (Math.abs(n) > 0 && Math.abs(n) < 0.001) return '$' + n.toFixed(6);
  if (Math.abs(n) < 1) return '$' + n.toFixed(4);
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(n) {
  if (n === null || isNaN(n)) return '—';
  return n.toFixed(1) + '%';
}

function fmtInt(n) {
  if (n === null) return '∞';
  return n.toLocaleString('en-US');
}

function getNum(id) {
  const raw = document.getElementById(id).value.replace(/,/g, '').trim();
  const n = parseFloat(raw);
  return isNaN(n) ? NaN : Math.max(0, n);
}

function getInt(id) {
  const n = getNum(id);
  return isNaN(n) ? NaN : Math.floor(n);
}

function populateModels(showAdvanced) {
  const sel = document.getElementById('model');
  const previous = sel.value;

  // Reset options
  sel.innerHTML = '';

  // Filter: hide advanced unless toggled on
  const list = MODELS.filter(function (m) {
    return !m.advanced || !!showAdvanced;
  });

  list.forEach(function (m) {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.label;
    sel.appendChild(opt);
  });

  // Preserve previous selection when possible
  if (previous && list.some(function (m) { return m.id === previous; })) {
    sel.value = previous;
    return;
  }

  // Default away from Custom so the calculator looks ready on first load.
  const preferred = list.find(function (m) { return m.id === 'gpt-4o-mini'; }) ||
                    list.find(function (m) { return m.id !== 'custom'; });
  if (preferred) sel.value = preferred.id;
}

function onModelChange() {
  const id    = document.getElementById('model').value;
  const model = MODELS.find(function (m) { return m.id === id; });
  const customRow = document.getElementById('custom-row');

  // If we're leaving Custom, remember what the user typed.
  if (__prevModelId === 'custom') {
    __lastCustomCin  = document.getElementById('cin').value || __lastCustomCin;
    __lastCustomCout = document.getElementById('cout').value || __lastCustomCout;
  }

  if (!model || model.id === 'custom') {
    customRow.style.display = '';
    // Restore last custom values (don’t wipe user input).
    document.getElementById('cin').value  = (__lastCustomCin  || '');
    document.getElementById('cout').value = (__lastCustomCout || '');
  } else {
    customRow.style.display = 'none';
    // Fill from known model pricing.
    document.getElementById('cin').value  = (model.Cin  * 1_000_000).toString();
    document.getElementById('cout').value = (model.Cout * 1_000_000).toString();
  }

  __prevModelId = id;
  run();
}

function setOutput(id, val) {
  document.getElementById(id).textContent = val;
}

function run() {
  const P    = getNum('price-per-user');
  const R    = getNum('requests-per-user');
  const Tin  = getInt('tokens-in');
  const Tout = getInt('tokens-out');
  const F    = getNum('fixed-costs');
  const V    = getNum('variable-other');
  const N    = getNum('optional-n');

  const cinRaw  = getNum('cin');
  const coutRaw = getNum('cout');
  const Cin  = isNaN(cinRaw)  ? NaN : cinRaw  / 1_000_000;
  const Cout = isNaN(coutRaw) ? NaN : coutRaw / 1_000_000;

  const coreValid = [R, Tin, Tout, Cin, Cout].every(function (n) { return !isNaN(n); });

  const resultEl = document.getElementById('result');
  const errorEl  = document.getElementById('result-empty');

  if (!coreValid) {
    resultEl.style.display = 'none';
    errorEl.style.display  = '';
    return;
  }

  const apiCost = apiCostPerUser(R, Tin, Tout, Cin, Cout);
  const varCost = varCostPerUser(apiCost, isNaN(V) ? 0 : V);
  const pSafe   = isNaN(P) ? 0 : P;
  const fSafe   = isNaN(F) ? 0 : F;
  const GP      = grossProfitPerUser(pSafe, varCost);
  const GM      = grossMarginPct(GP, pSafe);
  const BE      = breakevenUsers(fSafe, GP);

  setOutput('out-api-cost', fmtUSD(apiCost));
  setOutput('out-var-cost', fmtUSD(varCost));
  setOutput('out-gp',       fmtUSD(GP));
  setOutput('out-gm',       fmtPct(GM));
  setOutput('out-be',
    BE === null
      ? 'Not reachable with current pricing'
      : fmtInt(BE) + ' users'
  );

  const nRow = document.getElementById('out-total-n-row');
  if (!isNaN(N) && N > 0) {
    setOutput('out-total-n', fmtUSD(totalApiAtN(N, apiCost)) + ' / mo at ' + fmtInt(N) + ' users');
    nRow.style.display = '';
  } else {
    nRow.style.display = 'none';
  }

  resultEl.style.display = '';
  errorEl.style.display  = 'none';
}

document.addEventListener('DOMContentLoaded', function () {
  const adv = document.getElementById('showAdvanced');
  if (adv) {
    adv.checked = false;
    adv.addEventListener('change', function () {
      populateModels(adv.checked);
      onModelChange();
    });
  }
  populateModels(false);

  ['price-per-user','requests-per-user','tokens-in','tokens-out',
   'fixed-costs','variable-other','optional-n','cin','cout'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', run);
  });

  document.getElementById('model').addEventListener('change', onModelChange);
  document.getElementById('year').textContent = new Date().getFullYear();
  onModelChange();
});
