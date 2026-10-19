/**
 * The one loading screen. Its markup and styles are in index.html, so on a
 * signed-in page it is on screen from the first frame, before any JavaScript.
 * This module only shows and hides that element; it is never rebuilt, so it
 * never restarts or flickers between loading steps (code, sign-in check, first
 * data load, page code): every step holds it, and it fades out once, after the
 * last one lets go.
 *
 *   holdLoader() / releaseLoader()   from any component (see <LoaderHold />)
 *
 * It appears only if a hold lasts longer than SHOW_AFTER (fast loads never
 * flash it), and once shown it stays at least MIN_VISIBLE so it never blinks.
 */

const SHOW_AFTER = 140;
const MIN_VISIBLE = 520;
const SETTLE = 400; // a release followed by a new hold within this is one continuous wait
const SLOW = 10_000; // after this, offer a reload instead of spinning forever

const el: HTMLElement | null = typeof document === 'undefined' ? null : document.getElementById('rc-loader');
// already up from the first paint (index.html shows it on signed-in pages)
let visible = !!el?.classList.contains('rc-on');
let shownAt = visible ? 0 : -Infinity;
let holds = 0;
let showTimer: ReturnType<typeof setTimeout> | undefined;
let hideTimer: ReturnType<typeof setTimeout> | undefined;
let slowTimer: ReturnType<typeof setTimeout> | undefined;

function armSlow() {
  clearTimeout(slowTimer);
  slowTimer = setTimeout(() => { if (visible) el?.classList.add('rc-late'); }, SLOW);
}
if (visible) armSlow();

function show() {
  if (!el || visible) return;
  visible = true;
  shownAt = performance.now();
  el.classList.remove('rc-instant');
  // next frame, so the fade-in runs
  requestAnimationFrame(() => el.classList.add('rc-on'));
  armSlow();
}

function hide() {
  if (!el || !visible) return;
  visible = false;
  clearTimeout(slowTimer);
  el.classList.remove('rc-instant', 'rc-late', 'rc-on');
}

/**
 * Something is loading. Shows the screen if it takes longer than a moment, or
 * straight away (`now`) when the wait is certain, e.g. opening My RenoCred.
 */
export function holdLoader(now = false) {
  holds += 1;
  clearTimeout(hideTimer);
  hideTimer = undefined;
  if (now) {
    clearTimeout(showTimer);
    showTimer = undefined;
    show();
    return;
  }
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

/** A direct visit to a signed-in page: keep the screen up until the app takes over. */
export function holdLoaderNow() {
  holds += 1;
  clearTimeout(hideTimer);
  clearTimeout(showTimer);
  showTimer = undefined;
  if (!visible && el) {
    el.classList.add('rc-on', 'rc-instant');
    visible = true;
    shownAt = performance.now();
    armSlow();
  }
}
