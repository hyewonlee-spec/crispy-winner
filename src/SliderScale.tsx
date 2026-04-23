* { box-sizing: border-box; }
html, body, #root { min-height: 100%; margin: 0; padding: 0; }
body { background: var(--color-bg-canvas); color: var(--color-text-primary); }
a { color: var(--color-purple-700); text-decoration: none; }
button, input, textarea { font: inherit; }

.app-shell { min-height: 100vh; display: flex; flex-direction: column; }
.app-shell__main { flex: 1; padding: max(14px, env(safe-area-inset-top)) 16px 104px; }
.page-frame { width: 100%; max-width: 480px; margin: 0 auto; }
.page { display: flex; flex-direction: column; gap: var(--space-4); }
.page--workout-live { padding-bottom: 8px; }

.page-header { display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: 2px; position: sticky; top: 0; z-index: 5; backdrop-filter: blur(10px); }
.page-header--brand { padding: 4px 2px 8px; background: linear-gradient(to bottom, rgba(243,238,248,0.98), rgba(243,238,248,0.88)); border-bottom: 1px solid rgba(124,58,237,0.08); }
.page-header__brand-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.page-header__brand { margin: 0 0 6px; color: var(--color-text-secondary); font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; }
.page-header h1 { margin: 0; font-size: 28px; line-height: 1.1; font-weight: 700; }
.page-header p { margin: 6px 0 0; color: var(--color-text-secondary); font-size: 15px; line-height: 1.4; }
.page-header__utility.button { min-height: 42px; padding: 0 16px; border-radius: 999px; background: var(--color-purple-500); color: white; box-shadow: var(--shadow-floating); }
.page-header__top { min-height: 20px; }
.back-link { font-size: 14px; color: var(--color-text-secondary); }

.card {
  border: 1.5px solid var(--color-border-subtle);
  background: var(--color-surface-primary);
  border-radius: var(--radius-lg);
  padding: 18px;
  box-shadow: var(--shadow-card);
}
.card--soft { background: var(--color-surface-soft); }
.card--plum { background: var(--color-plum-50); border-color: var(--color-plum-200); }
.card__header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-3); margin-bottom: var(--space-3); }
.card__title { margin: 0; font-size: 18px; line-height: 1.3; font-weight: 700; }
.card__subtitle { margin: 6px 0 0; color: var(--color-text-secondary); font-size: 14px; line-height: 1.4; }

.button {
  min-height: 48px; border-radius: 16px; border: 1px solid transparent; padding: 0 18px;
  font-size: 16px; font-weight: 700; cursor: pointer; transition: 150ms ease;
}
.button--block { width: 100%; }
.button--primary { background: var(--color-purple-500); color: var(--color-text-inverse); }
.button--primary:hover { background: var(--color-purple-600); }
.button--secondary { background: var(--color-purple-50); color: var(--color-purple-700); border-color: var(--color-purple-100); }
.button--ghost { background: transparent; color: var(--color-purple-700); border-color: var(--color-border-subtle); }
.button--danger { background: var(--color-danger-bg); color: var(--color-danger-text); border-color: #f2bfd0; }
.today-cta { box-shadow: var(--shadow-floating); }

.field { display: flex; flex-direction: column; gap: var(--space-2); }
.field__label { font-size: 14px; font-weight: 700; color: var(--color-text-primary); }
.field__hint { font-size: 12px; color: var(--color-text-tertiary); }
.input {
  width: 100%; min-height: 48px; border-radius: 16px; border: 1.5px solid var(--color-border-subtle);
  background: var(--color-surface-primary); padding: 0 14px; color: var(--color-text-primary);
}
.input--live { border-color: #efb6da; }
.textarea { min-height: 96px; padding: 14px; resize: vertical; }

.segmented { display: flex; gap: 4px; background: rgba(35,25,66,0.06); border-radius: var(--radius-pill); padding: 4px; flex-wrap: wrap; }
.segmented__item { border: 0; background: transparent; color: var(--color-text-secondary); border-radius: var(--radius-pill); padding: 10px 18px; min-height: 42px; cursor: pointer; }
.segmented__item.is-active { background: var(--color-surface-primary); color: var(--color-purple-700); box-shadow: var(--shadow-card); }

.slider-scale { display: flex; flex-direction: column; gap: 10px; }
.slider-scale__top { display: flex; justify-content: flex-end; }
.slider-scale__value { font-size: 22px; font-weight: 800; color: var(--color-purple-500); }
.slider-scale__input {
  -webkit-appearance: none; appearance: none; width: 100%; height: 8px; border-radius: 999px;
  background: linear-gradient(to right, var(--color-purple-500) 0, var(--color-purple-500) var(--slider-percent), rgba(35,25,66,0.18) var(--slider-percent), rgba(35,25,66,0.18) 100%);
  outline: none;
}
.slider-scale__input::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--color-purple-500); box-shadow: 0 4px 12px rgba(124,58,237,0.35);
}
.slider-scale__input::-moz-range-thumb {
  width: 20px; height: 20px; border-radius: 50%; background: var(--color-purple-500); border: 0; box-shadow: 0 4px 12px rgba(124,58,237,0.35);
}
.slider-scale__labels { display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; color: var(--color-purple-700); }

.stack-sm { display: flex; flex-direction: column; gap: var(--space-2); }
.stack-md { display: flex; flex-direction: column; gap: var(--space-3); }
.stack-lg { display: flex; flex-direction: column; gap: var(--space-4); }
.button-row { display: flex; gap: var(--space-2); flex-wrap: wrap; }
.muted { color: var(--color-text-secondary); }
.notice { padding: 12px; border-radius: var(--radius-md); background: var(--color-success-bg); color: var(--color-success-text); }
.empty-state { border-radius: var(--radius-md); background: var(--color-surface-soft); padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-2); }
.empty-state h3, .empty-state p { margin: 0; }

.tab-bar {
  position: sticky; bottom: 0; z-index: 20; padding: 10px 12px calc(12px + env(safe-area-inset-bottom));
  background: transparent;
}
.tab-bar__inner {
  display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; padding: 8px;
  border: 1.5px solid var(--color-border-subtle); background: rgba(255,255,255,0.94); border-radius: 26px;
  box-shadow: var(--shadow-floating); backdrop-filter: blur(10px);
}
.tab-bar__item {
  min-height: 44px; border-radius: 18px; display: flex; justify-content: center; align-items: center;
  color: var(--color-text-secondary); font-size: 14px; font-weight: 700;
}
.tab-bar__item.is-active { color: #fff; background: var(--color-purple-500); }
.tab-bar--workout .tab-bar__item.is-active { background: #ff2a8a; }

.page-footer { margin: 10px 0 4px; padding-bottom: 4px; text-align: center; color: var(--color-text-tertiary); font-size: 12px; }
.page-footer a { margin-left: 2px; color: var(--color-purple-700); }
.inline-link { font-size: 14px; font-weight: 600; }

.chip-list { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.chip {
  min-height: 40px; border-radius: var(--radius-pill); border: 1.5px solid var(--color-border-subtle);
  background: var(--color-surface-primary); padding: 0 14px; color: var(--color-text-primary); cursor: pointer;
}
.chip--purple { border-color: var(--color-purple-100); color: var(--color-purple-700); background: var(--color-purple-50); }

.set-row { display: grid; grid-template-columns: 68px 1fr 1fr auto; gap: var(--space-2); align-items: center; }
.set-row--live { align-items: stretch; }
.set-row__meta { font-size: 13px; color: var(--color-text-secondary); font-weight: 700; }
.set-check {
  min-height: 48px; border-radius: 16px; border: 1.5px solid var(--color-border-subtle);
  background: var(--color-surface-primary); padding: 0 14px; cursor: pointer; font-weight: 700;
}
.set-check.is-complete { background: var(--color-purple-50); border-color: var(--color-purple-100); color: var(--color-purple-700); }

.timeline { display: flex; flex-direction: column; gap: var(--space-3); }
.timeline__row, .library-row { display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); }
.row-link { display: block; }
.stats-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-3); }
.stat { font-size: 32px; line-height: 1.05; font-weight: 800; color: var(--color-purple-700); }
.readiness-row, .cycle-summary { display: flex; align-items: center; gap: 8px; }
.status-pill {
  display: inline-flex; align-items: center; justify-content: center; min-height: 34px; padding: 0 14px; border-radius: 999px;
  font-size: 14px; font-weight: 700; background: var(--color-purple-50); color: var(--color-purple-700);
}
.status-pill--good, .status-pill--high { background: var(--color-success-bg); color: var(--color-success-text); }
.status-pill--moderate { background: #f7f0e5; color: #8f6620; }
.status-pill--low { background: #fcecef; color: #b23b63; }
.status-pill--purple { background: var(--color-purple-100); color: var(--color-purple-700); }

@media (max-width: 420px) {
  .set-row { grid-template-columns: 1fr 1fr; }
  .set-row__meta, .set-check { grid-column: span 2; }
  .page-header h1 { font-size: 24px; }
  .tab-bar__item { font-size: 13px; }
}
