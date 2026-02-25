/* CalcHQ — models.js
   Single source of truth for all LLM model pricing.
   To update pricing: edit this file only. No other files change.
   To add a model: add one object. No logic changes required.

   Prices: USD per 1M tokens, sourced from provider documentation.
   DeepSeek input pricing defaults to cache MISS (worst-case / conservative).

   Fields:
     - Cin/Cout: USD per token
     - advanced: if true, hidden unless user enables "advanced models"
*/

window.CALC_MODELS = (function () {
  // Helper: converts per-1M prices to per-token (what the calculator uses internally)
  function m(id, label, inputPer1M, outputPer1M, advanced) {
    return {
      id:       id,
      label:    label,
      Cin:      inputPer1M  / 1_000_000,
      Cout:     outputPer1M / 1_000_000,
      advanced: !!advanced,
    };
  }

  return [
    // ── Common models (default view) ─────────────────
    m('gpt-4o',           'GPT-4o',                    2.50,  10.00, false),
    m('gpt-4o-mini',      'GPT-4o mini',               0.15,   0.60, false),
    m('claude-sonnet-4',  'Claude Sonnet 4',           3.00,  15.00, false),
    m('gemini-1.5-flash', 'Gemini 1.5 Flash',          0.075,  0.30, false),
    m('llama-3.1-70b',    'Llama 3.1 70B (hosted)',    0.52,   0.75, false),

    // Custom — user enters their own prices
    { id: 'custom', label: 'Custom — enter manually', Cin: null, Cout: null, advanced: false },

    // ── Advanced / extended set ──────────────────────
    // OpenAI
    m('o1',               'o1 (advanced reasoning)',  15.00,  60.00, true),
    m('o1-mini',          'o1-mini (advanced reasoning)', 3.00, 12.00, true),
    m('o3-mini',          'o3-mini (advanced reasoning)', 1.10,  4.40, true),

    // Anthropic
    m('claude-opus-4',    'Claude Opus 4',            15.00,  75.00, true),
    m('claude-haiku-4',   'Claude Haiku 4',            0.80,   4.00, true),

    // Google
    m('gemini-1.5-pro',   'Gemini 1.5 Pro',            1.25,   5.00, true),
    m('gemini-2.0-flash', 'Gemini 2.0 Flash (early)',  0.10,   0.40, true),

    // Meta / open (hosted)
    m('llama-3.1-405b',   'Llama 3.1 405B (hosted)',   3.00,   3.00, true),

    // Mistral
    m('mistral-large',    'Mistral Large 2',           2.00,   6.00, true),

    // DeepSeek
    // Input price = cache MISS (conservative default, never understates cost)
    m('deepseek-chat',     'DeepSeek V3 (deepseek-chat)',         0.27,  1.10, true),
    m('deepseek-reasoner', 'DeepSeek R1 (deepseek-reasoner)',     0.55,  2.19, true),
  ];
}());
