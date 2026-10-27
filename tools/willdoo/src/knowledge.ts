// Everything the page says, as a small search index: when a question isn't one of the answers written in
// brain.ts, Will Doo looks for it here (the FAQ first, then the text of every section) and answers with what
// the page itself says. Read from the DOM the first time he's asked, so it stays in sync with the page.

/** faq: a question and its answer; person: a founder; text: anything else on the page. */
type Kind = 'faq' | 'person' | 'text'

export interface Hit {
  section: string
  /** FAQ question, founder name, card heading or section heading the text sits under. */
  title: string
  text: string
  kind: Kind
  score: number
  /** How many of the question's words are in the title (the FAQ question, the founder's name…). */
  inTitle: number
  /** Share of the question's words found in the title. */
  titleCoverage: number
}

interface Block {
  section: string
  title: string
  text: string
  kind: Kind
  words: Set<string>
  titleWords: Set<string>
}

/** Mockups, demo chats and widgets: fictional data or numbers that change, not answers. */
const SKIP =
  '[aria-hidden="true"], [data-will-doo], script, style, svg, .hero-stage, .stage, .win, .happ-win, .phone, .ask-q, .ask-a, .qt-sum, .qt-lane, .qt-will, .qt-ln, .fp-map-wrap, .trust-reviews, .reviews-block, .review-card, .logo-wall, .search'

const STOP = new Set(
  (
    'a al algo algun alguna como con cual cuales cuando de del donde el ella ellos en es esa ese eso esta este esto estos fue ha hay la las le les lo los mas me mi mis muy no nos o para pero por que se si sin sobre son su sus te tiene tu tus un una uno unos y ya yo puedo puede pueden hacer hace tienen tengo quiero saber dime decir cosa cosas usted ustedes ' +
    'about an and are as at be but by can could do does for from get got have how i if in into is it its me my of on or our so than that the their them then there these they this to us was we what when where which who why will with would you your yours tell want know'
  ).split(' '),
)
/** Short words that do carry meaning here. */
const SHORT = new Set(['ia', 'ai', 'n8n', 'crm', 'erp', 'nda', 'api', 'llc', 'usa', 'pdf', 'app', 'bot'])

const clean = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')

const SPANISH = (document.documentElement.lang || '').toLowerCase().startsWith('es')

/** Singular of a plural: in Spanish "-es" goes after a consonant (servidores, integraciones), else just "-s". */
const singular = (w: string) => {
  if (w.length <= 3 || !w.endsWith('s')) return w
  if (SPANISH && w.length > 5 && w.endsWith('es') && 'lrndzj'.includes(w[w.length - 3])) return w.slice(0, -2)
  return w.slice(0, -1)
}

/** Lowercase, accent-free singular words without stop words: "¿Cuánto cuestan las integraciones?" → cuestan, integracion. */
export function words(s: string): string[] {
  const out: string[] = []
  for (const w of clean(s).split(/\s+/)) {
    if (!w || STOP.has(w) || (w.length < 3 && !SHORT.has(w))) continue
    out.push(singular(w))
  }
  return out
}

const squash = (s: string) => s.replace(/\s+/g, ' ').trim()
const textOf = (el: Element) => {
  const copy = el.cloneNode(true) as Element
  copy.querySelectorAll(SKIP).forEach((n) => n.remove())
  copy.querySelectorAll('.faq-icon').forEach((n) => n.remove())
  return squash(copy.textContent || '')
}

let blocks: Block[] | null = null
const df = new Map<string, number>()

function build(): Block[] {
  const found: Block[] = []
  const seen = new Set<string>()
  const add = (section: string, title: string, text: string, kind: Kind = 'text') => {
    title = squash(title)
    text = squash(text)
    if (text.length < 25 || seen.has(text)) return
    seen.add(text)
    found.push({ section, title, text, kind, words: new Set([...words(title), ...words(text)]), titleWords: new Set(words(title)) })
  }

  for (const sec of document.querySelectorAll<HTMLElement>('section[id]')) {
    const id = sec.id
    const heading = squash(sec.querySelector('h2')?.textContent || '')

    // FAQ: question and answer.
    for (const item of sec.querySelectorAll('.faq-item')) {
      const q = item.querySelector('.faq-q')
      const a = item.querySelector('.faq-a')
      if (q && a) add(id, textOf(q), textOf(a), 'faq')
    }

    // Founders: name, role, background and quote.
    const used = new Set<Element>()
    for (const fig of sec.querySelectorAll('.pq')) {
      const name = fig.querySelector('.pq-name')
      if (!name) continue
      const part = (sel: string) => (fig.querySelector(sel) ? textOf(fig.querySelector(sel)!) : '')
      const quote = part('.pq-text')
      const source = part('.pq-source')
      const about = [part('.pq-role'), part('.pq-bio')].filter(Boolean).join('. ')
      add(id, textOf(name), `${about}.${quote ? ` "${quote}"${source ? ` (${source})` : ''}` : ''}`, 'person')
      used.add(fig)
    }

    // Cards: a heading and the text around it.
    for (const h of sec.querySelectorAll('h3, h4')) {
      if (h.closest(SKIP) || h.closest('.faq-item')) continue
      const card = h.parentElement
      if (!card || card === sec) continue
      const title = textOf(h)
      const body = textOf(card).replace(title, '')
      if (body.length > 700) add(id, title, textOf(h.nextElementSibling || h))
      else {
        add(id, title, body)
        used.add(card)
      }
    }

    // Everything else: paragraphs and list items, under the section heading.
    for (const el of sec.querySelectorAll('p, li, blockquote')) {
      if (el.closest(SKIP) || el.closest('.faq-item') || [...used].some((c) => c.contains(el))) continue
      add(id, heading, textOf(el))
    }
  }

  df.clear()
  for (const b of found) for (const w of b.words) df.set(w, (df.get(w) || 0) + 1)
  return found
}

/** The block of the page that best answers the question, or null when nothing on the page is close. */
export function search(question: string): Hit | null {
  blocks ??= build()
  const q = [...new Set(words(question))]
  if (!q.length) return null
  const n = blocks.length
  let best: Hit | null = null
  for (const b of blocks) {
    let score = 0
    let matched = 0
    let inTitle = 0
    for (const w of q) {
      if (!b.words.has(w)) continue
      matched++
      const idf = Math.log(1 + n / (df.get(w) || 1))
      score += idf * (b.titleWords.has(w) ? 1.6 : 1)
      if (b.titleWords.has(w)) inTitle++
    }
    if (!matched) continue
    const coverage = matched / q.length
    score *= 0.4 + 0.6 * coverage
    if (b.kind !== 'text') score *= 1.15
    if (!best || score > best.score)
      best = { section: b.section, title: b.title, text: b.text, kind: b.kind, score, inTitle, titleCoverage: inTitle / q.length }
  }
  return best && best.score >= 3 ? best : null
}

/** The 20 demo industries, as the demo cards name them. */
export const industries = () =>
  [...document.querySelectorAll('#demoOpen .demo-card, #demoLocked .lock-card')].map((el) => el.getAttribute('data-name') || '').filter(Boolean)

/** Words too common in industry names to identify one ("equipo" is also "team"). */
const GENERIC = new Set(words('and services service company agency control sales sale orders order equipment de y servicios servicio empresa agencia venta ventas pedidos pedido equipo equipos control'))
const near = (a: string, b: string) => a === b || (a.length >= 6 && b.length >= 6 && a.slice(0, 6) === b.slice(0, 6))

/** The demo industry the question names, if any: "¿tienen algo para farmacéuticas?" → "Laboratorio farmacéutico". */
export function industryIn(question: string): string | null {
  const q = words(question)
  for (const name of industries()) {
    const key = words(name).filter((w) => !GENERIC.has(w))
    if (key.some((k) => q.some((w) => near(w, k)))) return name
  }
  return null
}

/** First sentences of a text, up to about `max` characters. */
export function excerpt(text: string, max = 320) {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '))
  return end > max * 0.4 ? cut.slice(0, end + 1) : `${cut.slice(0, cut.lastIndexOf(' '))}…`
}
