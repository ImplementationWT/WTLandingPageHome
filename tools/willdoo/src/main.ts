// Will Doo on the landing page: the nebula that trails the cursor over the background, the 3D robot that
// roams the empty space (three.js loads in its own chunk, once the page is idle), his speech bubble and
// the chat panel where he answers questions about the page and scrolls to any section you ask for.
// Built by tools/willdoo/build.sh into assets/willdoo/. Desktop only: a fine pointer is required.
import { LANG, SELF_SPOTTED, chatIntro, getSection, isInvite, markActivity, reply, setSection, type Reply } from './brain'
import { hasFinePointer, startNebula } from './space'
import type { WillDooHandle } from './will-doo'

const TXT = {
  en: { talk: 'Talk to Will Doo', chat: 'Chat with Will Doo', sub: 'Your guide to this page', close: 'Close chat', ask: 'Ask Will Doo…', send: 'Send', typing: 'Will Doo is typing', hint: 'Click me to ask anything' },
  es: { talk: 'Hablar con Will Doo', chat: 'Chat con Will Doo', sub: 'Tu guía de esta página', close: 'Cerrar chat', ask: 'Pregúntale a Will Doo…', send: 'Enviar', typing: 'Will Doo está escribiendo', hint: 'Haz clic en mí para preguntar' },
}[LANG]

const SEND_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.7 3.3 20.5 12 3.7 20.7 6.5 12z"/><path d="M6.5 12h14"/></svg>'

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, attrs: Record<string, string> = {}) {
  const e = document.createElement(tag)
  e.className = cls
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v)
  return e
}

function boot() {
  if (!hasFinePointer()) return

  // --- Nebula: a full-screen canvas above the section backgrounds, below the content.
  const nebula = el('canvas', 'wd-nebula', { 'aria-hidden': 'true' })
  document.body.append(nebula)
  startNebula(nebula)

  // --- Which section is in view: drives his tips and the suggested questions.
  const sections = [...document.querySelectorAll<HTMLElement>('section[id]')].filter((s) => s.id !== 'trust')
  const ratios = new Map<string, number>()
  let settle = 0
  let settled = ''
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) ratios.set(e.target.id, e.intersectionRect.height)
      let best = ''
      let h = 0
      for (const [id, v] of ratios) if (v > h) [best, h] = [id, v]
      if (!best) return
      setSection(best)
      // Tell him once you stay on it (not for every section flown past while scrolling).
      clearTimeout(settle)
      settle = setTimeout(() => {
        if (best !== settled) handle?.sectionChanged((settled = best))
      }, 900)
    },
    { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
  )
  sections.forEach((s) => io.observe(s))
  for (const ev of ['scroll', 'pointermove', 'keydown', 'pointerdown'] as const) addEventListener(ev, markActivity, { passive: true })

  // --- Robot, click target and speech bubble.
  const robot = el('div', 'wd-robot', { 'aria-hidden': 'true', 'data-hidden': 'true' })
  const canvas = el('canvas', 'wd-canvas')
  robot.append(el('div', 'wd-halo'), canvas)
  const hit = el('button', 'wd-hit cur-noframe', { type: 'button', 'data-will-doo': '', 'data-hidden': 'true', 'aria-label': TXT.talk, 'aria-expanded': 'false' })
  const bubble = el('div', 'wd-bubble', { role: 'status', 'data-open': 'false', 'data-side': 'left' })
  const title = el('p', 'wd-title')
  const text = el('p', 'wd-text')
  const hint = el('p', 'wd-hint')
  hint.textContent = TXT.hint
  bubble.append(Object.assign(el('p', 'wd-name'), { textContent: 'Will Doo' }), title, text, hint, el('span', 'wd-tail'))
  // The click-me hint shows under his comments, not when the comment already invites a click or the chat is
  // open. Set before he measures the bubble, so its height is right from the first frame.
  const prepare = (t: string) => (hint.hidden = open || isInvite(t))

  // --- Chat panel.
  const panel = el('div', 'wd-chat', { role: 'dialog', 'aria-label': TXT.chat, 'data-will-doo': '', 'data-open': 'false', inert: '' })
  const head = el('header', 'wd-chat-h')
  const closeBtn = el('button', 'wd-x', { type: 'button', 'aria-label': TXT.close })
  closeBtn.textContent = '×'
  head.innerHTML = `<div><p class="wd-chat-name">Will Doo</p><p class="wd-chat-sub">${TXT.sub}</p></div>`
  head.append(closeBtn)
  const list = el('div', 'wd-list', { 'aria-live': 'polite' })
  const form = el('form', 'wd-form')
  const input = el('input', 'wd-input', { placeholder: TXT.ask, 'aria-label': TXT.ask, autocomplete: 'off' })
  const send = el('button', 'wd-send', { type: 'submit', 'aria-label': TXT.send })
  send.innerHTML = SEND_ICON
  form.append(input, send)
  panel.append(head, list, form)

  document.body.append(robot, hit, bubble, panel)

  let handle: WillDooHandle | null = null
  let open = false
  let typing = false
  let started = false

  const bot = (r: Reply) => {
    list.querySelector('.wd-chips')?.remove()
    list.append(Object.assign(el('p', 'wd-msg wd-bot'), { textContent: r.text }))
    if (r.follow?.length) {
      const chips = el('div', 'wd-chips')
      for (const f of r.follow) {
        const b = el('button', 'wd-chip', { type: 'button' })
        b.textContent = f
        b.addEventListener('click', () => ask(f))
        chips.append(b)
      }
      list.append(chips)
    }
    list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' })
  }

  const goTo = (id: string) => {
    const target = document.getElementById(id)
    if (!target) return
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches
    const go = (behavior: ScrollBehavior) => scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + scrollY - 72), behavior })
    go(smooth ? 'smooth' : 'instant')
    // Content above can change height after we land (lazy images, the Ask Claude block typing its
    // answers): keep the section aligned for a couple of seconds, unless the visitor scrolls on their own.
    let userMoved = false
    const stop = () => (userMoved = true)
    const opts = { passive: true, once: true } as const
    setTimeout(() => {
      addEventListener('wheel', stop, opts)
      addEventListener('touchmove', stop, opts)
      addEventListener('keydown', stop, opts)
    }, 50)
    for (const ms of [700, 1200, 1800, 2600]) {
      setTimeout(() => {
        if (!userMoved && Math.abs(target.getBoundingClientRect().top - 72) > 6) go('instant')
      }, ms)
    }
    setTimeout(() => {
      removeEventListener('wheel', stop)
      removeEventListener('touchmove', stop)
      removeEventListener('keydown', stop)
    }, 2700)
  }

  // A WhatsApp number left in the chat goes to the team through the same hook as the demo forms (extras.js),
  // with the last lines of the conversation for context.
  const sendLead = (phone: string) => {
    const conversation = [...list.querySelectorAll('.wd-msg:not(.wd-typing)')]
      .slice(-8)
      .map((m) => `${m.classList.contains('wd-me') ? 'Visitor' : 'Will Doo'}: ${m.textContent}`)
    const post = (window as unknown as { wtSendLead?: (rec: object) => void }).wtSendLead
    post?.({ type: 'will-doo-whatsapp', lang: LANG, phone, section: getSection(), conversation, page: location.href, submittedAt: new Date().toISOString() })
  }

  const ask = (question: string) => {
    const q = question.trim()
    if (!q || typing) return
    list.querySelector('.wd-chips')?.remove()
    list.append(Object.assign(el('p', 'wd-msg wd-me'), { textContent: q }))
    input.value = ''
    typing = true
    send.disabled = true
    const dots = el('p', 'wd-msg wd-bot wd-typing', { 'aria-label': TXT.typing })
    dots.innerHTML = '<span></span><span></span><span></span>'
    list.append(dots)
    list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' })
    // A short "thinking" beat reads friendlier than an instant answer.
    setTimeout(() => {
      dots.remove()
      const r = reply(q)
      bot(r)
      typing = false
      send.disabled = !input.value.trim()
      handle?.talk()
      if (r.lead) sendLead(r.lead)
      if (r.goto) setTimeout(() => goTo(r.goto!), 350)
    }, 450 + Math.min(q.length * 12, 600))
  }

  const setOpen = (v: boolean) => {
    open = v
    panel.dataset.open = String(v)
    hit.setAttribute('aria-expanded', String(v))
    hint.hidden = v || isInvite(title.textContent || '')
    if (v) {
      panel.removeAttribute('inert')
      if (!started) {
        started = true
        bot(chatIntro())
      }
      input.focus({ preventScroll: true })
    } else panel.setAttribute('inert', '')
    handle?.setChat(v ? panel : null)
  }

  hit.addEventListener('click', () => setOpen(!open))
  closeBtn.addEventListener('click', () => setOpen(false))
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    ask(input.value)
  })
  input.addEventListener('input', () => (send.disabled = !input.value.trim() || typing))
  send.disabled = true
  addEventListener('keydown', (e) => e.key === 'Escape' && open && setOpen(false))
  // A click anywhere outside closes it; his own click toggles it.
  addEventListener('pointerdown', (e) => open && !(e.target as Element | null)?.closest?.('[data-will-doo]') && setOpen(false), true)

  // --- The static pictures of him (hero, quoter): the first one he spots gets "that's me", later ones
  // "there I am again". Each one once; if it scrolls away before he can say it, it waits for the next time.
  let spotted = 0
  const pics = [...document.querySelectorAll('.bot-img, .qt-will-fig')]
  const saying = new Set<Element>()
  const picIO = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting || !handle || saying.has(e.target)) continue
        saying.add(e.target)
        // The line is picked when he says it, so the order follows what he actually spotted first.
        handle.remark(() => SELF_SPOTTED[Math.min(spotted, SELF_SPOTTED.length - 1)], e.target, (said) => {
          saying.delete(e.target)
          if (!said) return
          spotted++
          picIO.unobserve(e.target)
        })
      }
    },
    { threshold: 0.6 },
  )

  // three.js is big: load it once the page has settled.
  const load = () =>
    import('./will-doo').then(({ startWillDoo }) => {
      handle = startWillDoo(robot, canvas, { el: bubble, title, text, prepare }, hit, 'home')
      pics.forEach((p) => picIO.observe(p))
    }).catch(() => {
      // No WebGL (or the chunk didn't load): no robot, the rest of the page is unaffected.
      robot.remove()
      hit.remove()
      bubble.remove()
    })
  if ('requestIdleCallback' in window) requestIdleCallback(() => load(), { timeout: 2500 })
  else setTimeout(load, 1200)
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot)
else boot()
