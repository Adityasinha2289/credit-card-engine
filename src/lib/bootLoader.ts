/**
 * The one loading screen. It lives outside React, so it is never torn down and
 * rebuilt between loading steps (code chunk, sign-in check, first data load,
 * page chunk): every step just holds it, and it fades out once, after the last
 * step lets go and the page underneath is ready.
 *
 *   holdLoader() / releaseLoader()   from any component (see <LoaderHold />)
 *
 * It appears only if a hold lasts longer than SHOW_AFTER (fast loads never
 * flash it), and once shown it stays at least MIN_VISIBLE so it never blinks.
 */

const SHOW_AFTER = 140;
const MIN_VISIBLE = 520;
const SETTLE = 90; // a release followed by a new hold within this is one continuous wait
const FADE = 340;
const SLOW = 10_000; // after this, offer a reload instead of spinning forever

const CSS = `
#rc-loader{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:#0A1F15;opacity:0;visibility:hidden;transition:opacity ${FADE}ms cubic-bezier(.22,1,.36,1),visibility 0s linear ${FADE}ms}
#rc-loader.rc-on{opacity:1;visibility:visible;transition:opacity ${FADE}ms cubic-bezier(.22,1,.36,1),visibility 0s}
#rc-loader .rc-glow{position:absolute;width:520px;height:520px;border-radius:50%;background:radial-gradient(closest-side,rgba(227,238,212,.09),transparent);pointer-events:none}
#rc-loader .rc-stage{position:relative;display:flex;flex-direction:column;align-items:center;gap:30px;transform:translateY(6px);transition:transform 700ms cubic-bezier(.22,1,.36,1)}
#rc-loader.rc-on .rc-stage{transform:none}
#rc-loader .rc-card{position:relative;width:148px;height:93px;border-radius:13px;overflow:hidden;background:linear-gradient(140deg,#2b5236 0%,#173723 55%,#0f2a1d 100%);box-shadow:inset 0 0 0 1px rgba(227,238,212,.16),0 30px 60px -28px rgba(0,0,0,.9)}
#rc-loader .rc-card::before{content:"";position:absolute;inset:0;background:radial-gradient(120% 90% at 0% 0%,rgba(255,255,255,.14),transparent 55%)}
#rc-loader .rc-card::after{content:"";position:absolute;inset:-20% -60%;background:linear-gradient(105deg,transparent 40%,rgba(227,238,212,.20) 50%,transparent 60%);animation:rc-sheen 2.2s cubic-bezier(.45,0,.25,1) infinite}
#rc-loader .rc-chip{position:absolute;left:14px;top:34px;width:21px;height:16px;border-radius:4px;background:linear-gradient(135deg,#e9e2bd,#b9a868);opacity:.85}
#rc-loader .rc-mark{position:absolute;right:13px;bottom:11px}
#rc-loader .rc-mark path{stroke-dasharray:100;stroke-dashoffset:100;animation:rc-draw 2.2s cubic-bezier(.65,0,.35,1) infinite}
#rc-loader .rc-mark path+path{animation-delay:.18s}
#rc-loader .rc-dots{position:absolute;left:14px;bottom:14px;display:flex;gap:4px}
#rc-loader .rc-dots i{display:block;width:16px;height:3px;border-radius:2px;background:rgba(227,238,212,.28)}
#rc-loader .rc-track{width:72px;height:2px;border-radius:2px;background:rgba(227,238,212,.12);overflow:hidden}
#rc-loader .rc-track i{display:block;width:40%;height:100%;border-radius:2px;background:#E3EED4;animation:rc-run 1.25s cubic-bezier(.45,0,.55,1) infinite}
#rc-loader .rc-slow{position:absolute;bottom:calc(48px + env(safe-area-inset-bottom));left:0;right:0;display:flex;flex-direction:column;align-items:center;gap:12px;font:500 14px/1.4 Inter,system-ui,sans-serif;color:#AEC3B0;opacity:0;transform:translateY(6px);transition:opacity .4s,transform .4s;pointer-events:none}
#rc-loader.rc-late .rc-slow{opacity:1;transform:none;pointer-events:auto}
#rc-loader .rc-slow button{height:40px;padding:0 18px;border-radius:999px;border:0;background:#E3EED4;color:#0F2A1D;font:600 14px Inter,system-ui,sans-serif;cursor:pointer}
@keyframes rc-sheen{0%{transform:translateX(-60%)}60%,100%{transform:translateX(60%)}}
@keyframes rc-draw{0%{stroke-dashoffset:100}45%,75%{stroke-dashoffset:0;opacity:1}100%{stroke-dashoffset:0;opacity:0}}
@keyframes rc-run{0%{transform:translateX(-110%)}100%{transform:translateX(260%)}}
@media (prefers-reduced-motion:reduce){#rc-loader .rc-card::after,#rc-loader .rc-track i{animation:none}#rc-loader .rc-mark path{animation:none;stroke-dashoffset:0}}
`;

const MARKUP = `
<div class="rc-glow"></div>
<div class="rc-stage">
  <div class="rc-card">
    <span class="rc-chip"></span>
    <span class="rc-dots"><i></i><i></i><i></i></span>
    <svg class="rc-mark" viewBox="285 270 500 500" width="30" height="30" fill="none">
      <path pathLength="100" d="M370 335H575A120 120 0 0 1 645.5 552" stroke="#E3EED4" stroke-width="96" stroke-linecap="round" stroke-linejoin="round"/>
      <path pathLength="100" d="M372 528L596 712" stroke="#E3EED4" stroke-width="96" stroke-linecap="round"/>
    </svg>
  </div>
  <div class="rc-track"><i></i></div>
</div>
<div class="rc-slow"><span>This is taking longer than usual.</span><button type="button">Reload</button></div>`;

let el: HTMLElement | null = null;
let holds = 0;
let visible = false;
let shownAt = 0;
let showTimer: ReturnType<typeof setTimeout> | undefined;
let hideTimer: ReturnType<typeof setTimeout> | undefined;
let slowTimer: ReturnType<typeof setTimeout> | undefined;

function mount(): HTMLElement | null {
  if (el || typeof document === 'undefined') return el;
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);
  el = document.createElement('div');
  el.id = 'rc-loader';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-label', 'Loading');
  el.innerHTML = MARKUP;
  el.querySelector('.rc-slow button')?.addEventListener('click', () => window.location.reload());
  document.body.appendChild(el);
  return el;
}

function show() {
  const node = mount();
  if (!node || visible) return;
  visible = true;
  shownAt = performance.now();
  // next frame, so the fade-in transition runs
  requestAnimationFrame(() => node.classList.add('rc-on'));
  clearTimeout(slowTimer);
  slowTimer = setTimeout(() => { if (visible) node.classList.add('rc-late'); }, SLOW);
}

function hide() {
  if (!el || !visible) return;
  visible = false;
  clearTimeout(slowTimer);
  el.classList.remove('rc-on', 'rc-late');
}

/** Something is loading. Shows the screen if it takes longer than a moment. */
export function holdLoader() {
  holds += 1;
  clearTimeout(hideTimer);
  if (!visible && showTimer === undefined) {
    showTimer = setTimeout(() => { showTimer = undefined; if (holds > 0) show(); }, SHOW_AFTER);
  }
}

/** That thing finished. The screen fades once nothing else is loading. */
export function releaseLoader() {
  holds = Math.max(0, holds - 1);
  if (holds > 0) return;
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    if (holds > 0) return;
    clearTimeout(showTimer);
    showTimer = undefined;
    if (!visible) return;
    const wait = Math.max(0, MIN_VISIBLE - (performance.now() - shownAt));
    hideTimer = setTimeout(() => { if (holds === 0) hide(); }, wait);
  }, SETTLE);
}

/** Show immediately (a direct visit to a signed-in page: there is nothing else to show yet). */
export function holdLoaderNow() {
  holds += 1;
  clearTimeout(hideTimer);
  clearTimeout(showTimer);
  showTimer = undefined;
  show();
}
