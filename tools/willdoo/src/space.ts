// Nebula trail ported from WTProposalPlatform (frontend/src/lib/space.ts). On the landing page it runs over
// the background of every section and stops wherever there is content.
import { createFluid } from './fluid'

/**
 * Page content: the nebula stops following the cursor over these, and Will Doo never flies over them.
 * Everything inside a section lives in .container, so its direct children are the content blocks; the gaps
 * between them, the section paddings and the side gutters are the background.
 */
export const CONTENT = '.container > *, nav, header, footer, .dfm, .nda, .qm'
/** Will Doo's own pieces (click target, open chat): no nebula over them, but he doesn't avoid himself. */
const SELF = '[data-will-doo]'

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches
export const hasFinePointer = () => matchMedia('(pointer: fine)').matches

function hsv(h: number, s: number, v: number): [number, number, number] {
  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)
  const sectors: [number, number, number][] = [
    [v, t, p],
    [q, v, p],
    [p, v, t],
    [p, q, v],
    [t, p, v],
    [v, p, q],
  ]
  return sectors[i % 6]
}

// --- Behind the content ------------------------------------------------------------------------
// The canvas sits above the section backgrounds, and many cards on the page are see-through. To keep the
// nebula *behind* every card, panel and box, the canvas is clipped with the shape of the ones on screen.

interface Box {
  el: Element
  /** Corner radius in px, or a fraction of the shorter side when the CSS gives a percentage. */
  radius: number
  pct: boolean
}
/** Cards that stay behind the nebula: in the case carousel only the active case sits in front. Checked
 * every frame, so it follows the carousel as it turns. */
const BEHIND = '.case-carousel .case-feature:not(.is-active)'
let boxes: Box[] = []
let boxesAt = -Infinity

const alpha = (c: string) => {
  const m = c.match(/rgba?\(([^)]+)\)/)
  if (!m) return c === 'transparent' ? 0 : 1
  const parts = m[1].split(/[ ,/]+/).filter(Boolean)
  return parts.length > 3 ? parseFloat(parts[3]) : 1
}

/** Outermost elements inside the sections that paint a box (background or border): the cards. The trust
 * strip under the hero (reviews, insurance, countries) is a div, not a section. */
function findBoxes(): Box[] {
  const found: Box[] = []
  const inside = new Set<Element>()
  for (const el of document.querySelectorAll('section *, #trust *')) {
    if (el.closest('[data-will-doo]')) continue
    let up = el.parentElement
    let nested = false
    while (up && !nested) {
      if (inside.has(up)) nested = true
      up = up.parentElement
    }
    if (nested) continue
    const r = el.getBoundingClientRect()
    if (r.width < 60 || r.height < 30) continue
    const cs = getComputedStyle(el)
    const paints =
      alpha(cs.backgroundColor) > 0.02 ||
      (cs.backgroundImage !== 'none' && !cs.backgroundImage.startsWith('url(')) ||
      (parseFloat(cs.borderTopWidth) > 0 && alpha(cs.borderTopColor) > 0.04 && parseFloat(cs.borderBottomWidth) > 0)
    if (!paints || cs.visibility === 'hidden' || cs.display === 'none') continue
    // Soft glows and halos are decoration, not cards: the nebula may drift over them.
    if (cs.pointerEvents === 'none' || cs.filter !== 'none' || (alpha(cs.backgroundColor) <= 0.02 && cs.backgroundImage.includes('transparent'))) continue
    inside.add(el)
    const rad = cs.borderTopLeftRadius
    found.push({ el, radius: rad.endsWith('%') ? parseFloat(rad) / 100 : parseFloat(rad) || 0, pct: rad.endsWith('%') })
  }
  return found
}

/** SVG path of a rounded rectangle. */
const rounded = (x: number, y: number, w: number, h: number, r: number) => {
  r = Math.max(0, Math.min(r, w / 2, h / 2))
  return `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`
}

/** Clips the canvas to everything but the cards on screen. */
function clipBehindContent(canvas: HTMLCanvasElement, now: number) {
  if (now - boxesAt > 3000) {
    boxes = findBoxes()
    boxesAt = now
  }
  const w = innerWidth
  const h = innerHeight
  let d = `M0 0H${w}V${h}H0Z`
  for (const b of boxes) {
    if (b.el.matches(BEHIND)) continue
    const r = b.el.getBoundingClientRect()
    if (r.bottom < 0 || r.top > h || r.right < 0 || r.left > w || !r.width) continue
    d += rounded(r.left, r.top, r.width, r.height, b.pct ? b.radius * Math.min(r.width, r.height) : b.radius)
  }
  canvas.style.clipPath = `path(evenodd, "${d}")`
}

/** Smoke that trails the mouse across the background, shifting hue as it goes. */
export function startNebula(canvas: HTMLCanvasElement) {
  if (prefersReducedMotion() || !hasFinePointer()) return
  const fluid = createFluid(canvas)
  if (!fluid) return

  const INTENSITY = 0.07
  const MAX_STEP = 0.025 // caps a flick of the wrist so it can't fire a jet across the screen
  const EMBER = 0.0009 // faint glow kept at a resting pointer so you can still tell where it is
  const EMBER_MS = 6000
  const IDLE_MS = 14000 // the dye has fully dissipated by then; stop burning GPU
  let hue = Math.random()
  let prev: { x: number; y: number } | null = null
  let lastInput = 0
  let last = 0
  let frame = 0
  const queue: { x: number; y: number; dx: number; dy: number }[] = []

  const loop = (now: number) => {
    const dt = Math.min((now - last) / 1000, 1 / 60)
    last = now
    hue = (hue + dt * 0.03) % 1
    const [r, g, b] = hsv(hue, 0.75, 1)
    for (const s of queue.splice(0)) {
      fluid.splat(s.x, s.y, s.dx, s.dy, [r * INTENSITY, g * INTENSITY, b * INTENSITY])
    }
    if (prev && now - lastInput < EMBER_MS) {
      const swirl = now / 900
      fluid.splat(prev.x, prev.y, Math.cos(swirl) * 0.001, Math.sin(swirl) * 0.001, [r * EMBER, g * EMBER, b * EMBER], 0.4)
    }
    fluid.step(dt)
    fluid.render()
    clipBehindContent(canvas, now)
    if (now - lastInput > IDLE_MS) {
      fluid.clear()
      frame = 0
      return
    }
    frame = requestAnimationFrame(loop)
  }

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return
    const over = e.target as Element | null
    if (over?.closest?.(CONTENT) || over?.closest?.(SELF)) {
      prev = null
      return
    }
    const x = e.clientX / innerWidth
    const y = 1 - e.clientY / innerHeight
    if (prev && (x !== prev.x || y !== prev.y)) {
      const dist = Math.hypot(x - prev.x, y - prev.y)
      const k = Math.min(1, MAX_STEP / dist)
      hue = (hue + dist * 0.3) % 1
      queue.push({ x, y, dx: (x - prev.x) * k, dy: (y - prev.y) * k })
      lastInput = performance.now()
      if (!frame) {
        last = lastInput
        frame = requestAnimationFrame(loop)
      }
    }
    prev = { x, y }
  }
  const onLeave = () => (prev = null)
  // Scrolling moves the page under a still pointer: the trail should not jump with it.
  const onScroll = () => (prev = null)

  addEventListener('pointermove', onMove, { passive: true })
  addEventListener('scroll', onScroll, { passive: true })
  document.documentElement.addEventListener('pointerleave', onLeave)
  addEventListener('resize', fluid.resize)
}
