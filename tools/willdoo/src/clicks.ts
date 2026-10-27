// What Will Doo says when you click something on the page: a short, plain explanation of that control or
// card, read after the click so it reflects the new state (e.g. "Our servers" in the quoter). Anything
// without its own explanation gets a fact about the section it's in.
import { LANG, SECTIONS, sectionLabel, sectionTip, type Line } from './brain'

const L = (en: string, es: string) => (LANG === 'es' ? es : en)
const line = (title: string, text: string): Line => ({ title, text })
const txt = (el: Element | null | undefined) => (el?.textContent || '').replace(/\s+/g, ' ').trim()
const money = (n: number) => `$${n.toLocaleString('en-US')}`
const pressed = (el: Element) => el.getAttribute('aria-pressed') === 'true'
/** The opening sentences of a text, enough to say something ("No." alone isn't), up to about `max` chars. */
const first = (s: string, max = 170) => {
  const sentences = s.match(/[^.!?]+[.!?]+(\s|$)/g) || [s]
  let out = ''
  for (const x of sentences) {
    if (out.length >= 40 || (out && (out + x).length > max)) break
    out += x
  }
  out = out.trim() || s
  return out.length > max ? `${out.slice(0, out.lastIndexOf(' ', max))}…` : out
}

// Same rule as the quoter (index.html): up to 20 users $100 a month, 21 to 50 $200, then $200 more per 50.
const hostMonthly = (u: number) => (u <= 20 ? 100 : u <= 50 ? 200 : 200 + 200 * Math.ceil((u - 50) / 50))

/** The quoter's current numbers, read from its outputs. */
function quote() {
  const q = (k: string) => document.querySelector(`#quoter [data-q="${k}"]`)
  const plat = document.querySelector('#quoter [data-q="plat"] [aria-pressed="true"]')?.getAttribute('data-v') || 'custom'
  const extra = parseInt(txt(q('aN'))) || 0
  // The total animates toward its new value: data-v holds where it's going.
  const fees = money(Number(q('feesT')?.getAttribute('data-v')) || 0)
  return { plat, extra, apps: 2 + extra, hostUsers: parseInt(txt(q('hN'))) || 20, mondayUsers: parseInt(txt(q('uN'))) || 10, fees }
}

/** The quoter's controls. */
function quoterLine(el: Element): Line | null {
  const k = el.getAttribute('data-q') || el.closest('[data-q]')?.getAttribute('data-q') || ''
  const v = el.getAttribute('data-v') || ''
  const Q = quote()
  if (k === 'plat')
    return v === 'monday'
      ? line('monday.com', L('Your apps live in your own monday account. You pay monday licenses directly to monday.', 'Tus apps viven en tu propia cuenta de monday. Las licencias se las pagas directo a monday.'))
      : line(L('Fully custom', 'A medida'), L("Built from scratch for your company: no monday licenses, and the code is always yours.", 'Hecho desde cero para tu empresa: sin licencias de monday, y el código siempre es tuyo.'))
  if (k === 'where')
    return v === 'ours'
      ? line(L('Our servers', 'Nuestros servidores'), L(`No installation fee. We host, back up and secure your system from week 4: ${money(hostMonthly(Q.hostUsers))} a month for ${Q.hostUsers} users.`, `Sin pago de instalación. Alojamos, respaldamos y protegemos tu sistema desde la semana 4: ${money(hostMonthly(Q.hostUsers))} al mes para ${Q.hostUsers} usuarios.`))
      : line(L('Your servers', 'Tus servidores'), L('$1,500 one-time and we install everything on your servers in week 4. No monthly fees to us after that.', '$1,500 pago único y lo instalamos todo en tus servidores en la semana 4. Después, nada de mensualidades con nosotros.'))
  if (k === 'hbill')
    return v === 'annual'
      ? line(L('Annual', 'Anual'), L('Pay 10 months and get 12: the year of hosting costs less.', 'Pagas 10 meses y tienes 12: el año de hosting sale más barato.'))
      : line(L('Monthly', 'Mensual'), L('Month by month from week 4, no commitment for the year.', 'Mes a mes desde la semana 4, sin comprometer el año.'))
  if (k === 'hPlus' || k === 'hMinus' || k === 'hN') {
    const m = hostMonthly(Q.hostUsers)
    return line(L(`${Q.hostUsers} users`, `${Q.hostUsers} usuarios`), L(`Hosting on our servers: ${money(m)} a month or ${money(m * 10)} a year. The price goes up in blocks of users.`, `Hosting en nuestros servidores: ${money(m)} al mes o ${money(m * 10)} al año. El precio sube por bloques de usuarios.`))
  }
  if (k === 'aPlus' || k === 'aMinus' || k === 'aN' || el.matches('.qt-app:not(.portal)')) {
    const name = el.matches('.qt-app') ? txt(el.querySelector('b')) : ''
    const added = el.matches('.qt-app') ? pressed(el) : k === 'aPlus'
    const deal = Q.plat === 'custom' ? (Q.extra >= 3 ? L(' Every app is now $2,000.', ' Ahora cada app cuesta $2,000.') : Q.extra ? L(' From 3 additional apps, every app drops to $2,000.', ' Desde 3 apps adicionales, todas bajan a $2,000.') : '') : ''
    const title = name ? (added ? L(`${name} app added`, `App de ${name} agregada`) : L(`${name} app removed`, `App de ${name} quitada`)) : L(`${Q.apps} apps`, `${Q.apps} apps`)
    return line(title, L(`Your system has ${Q.apps} apps, one per team, all on the same data. Fees: ${Q.fees}.${deal}`, `Tu sistema tiene ${Q.apps} apps, una por equipo, todas sobre la misma información. Honorarios: ${Q.fees}.${deal}`))
  }
  if (k === 'portal' || k === 'sysPortal')
    return pressed(el)
      ? line(L('Client portal added', 'Portal de clientes agregado'), L("Your clients log in and see only what's theirs: orders, invoices, progress.", 'Tus clientes entran y ven solo lo suyo: pedidos, facturas, avance.'))
      : line(L('Client portal removed', 'Portal de clientes quitado'), L('You can add it any time, during the program or after.', 'Lo puedes sumar cuando quieras, durante el programa o después.'))
  if (k === 'inv')
    return pressed(el)
      ? line(L('Invoicing integration', 'Integración con facturación'), L('When you invoice, the invoice is issued in your invoicing software and its number goes straight to collections. $1,000 one-time.', 'Al facturar, la factura se emite en tu facturador y su número pasa directo a cobranza. $1,000 pago único.'))
      : line(L('Invoicing integration removed', 'Integración con facturación quitada'), L('Your team can keep invoicing as it does today.', 'Tu equipo puede seguir facturando como hoy.'))
  if (k === 'bill')
    return v === 'annual'
      ? line(L('monday, annual', 'monday, anual'), L('$19 per user a month, paid for the year upfront: cheaper than monthly.', '$19 por usuario al mes, pagando el año por adelantado: más barato que mensual.'))
      : line(L('monday, monthly', 'monday, mensual'), L('$24 per user, month by month.', '$24 por usuario, mes a mes.'))
  if (k === 'uPlus' || k === 'uMinus' || k === 'uN')
    return line(L(`${Q.mondayUsers} monday users`, `${Q.mondayUsers} usuarios de monday`), L('Only the people who log or update information need a license; viewers can be free.', 'Solo quienes registran o actualizan información necesitan licencia; quienes solo miran pueden ser gratis.'))
  if (k === 'plan')
    return v === 'starter'
      ? line('Starter', L('Each app connects to up to 5 databases. Fine for simple apps.', 'Cada app se conecta hasta a 5 bases de datos. Suficiente para apps simples.'))
      : line('Pro', L('More databases per app, and it\'s needed for the client portal.', 'Más bases de datos por app, y es necesario para el portal de clientes.'))
  if (k === 'more') return line(L('Week by week', 'Semana a semana'), L('When each payment happens: 50% in week 1, 50% in week 4, and hosting or licenses if they apply.', 'Cuándo se paga cada cosa: 50% en la semana 1, 50% en la semana 4, y hosting o licencias si aplican.'))
  if (k === 'cta' || k === 'willCta') return line(L('Your quote goes with you', 'Tu cotización va contigo'), L('Calendly opens with this configuration filled in, so we start the demo from your system.', 'Calendly se abre con esta configuración, así empezamos la demo desde tu sistema.'))
  return null
}

/** Explanation for a click, or null when there's nothing to say (e.g. a link that leaves the page). */
export function explainClick(target: Element): { line: Line; interactive: boolean } | null {
  // Something made to be clicked (a button, a link, a card that opens…), or else the plain content clicked.
  const control = target.closest('a, button, input, [onclick], [data-app], .ck, .lock-card')
  const el = control || target
  const sec = target.closest('section[id], #trust')?.id || ''
  const ok = (l: Line | null) => (l ? { line: l, interactive: !!control } : null)

  if (el.closest('#quoter')) {
    const l = quoterLine(el)
    if (l) return ok(l)
  }

  // Links
  if (el.matches('a')) {
    const href = el.getAttribute('href') || ''
    if (href === '#hero' || el.matches('.nav-logo, .footer-logo')) return ok(line(L('Back to the top', 'De vuelta al inicio'), L('An AI operating system underneath, an app for every team on top.', 'Un sistema operativo con IA por debajo y una app para cada equipo por encima.')))
    if (href.startsWith('#') && href.length > 1) {
      const s = SECTIONS.find((x) => x.id === href.slice(1))
      if (s) return ok(line(L(`To ${sectionLabel(s.id)}`, `A ${sectionLabel(s.id)}`), s.tips[LANG][0]?.text || ''))
    }
    if (href.includes('calendly')) return ok(line(L('Book a consultation', 'Agenda una consulta'), L('30 minutes: we look at how your teams work and show you what your system would look like.', '30 minutos: vemos cómo trabajan tus equipos y te mostramos cómo se vería tu sistema.')))
    if (href.includes('upwork')) return ok(line('Upwork', L('100+ projects with verified reviews, and Top Rated Plus.', '100+ proyectos con reseñas verificadas, y Top Rated Plus.')))
    if (href.includes('linkedin')) {
      const fig = el.closest('.pq')
      return ok(line(txt(fig?.querySelector('.pq-name')) || 'LinkedIn', `${txt(fig?.querySelector('.pq-role'))}. ${txt(fig?.querySelector('.pq-bio'))}`.replace(/^\. |\. $/g, '')))
    }
    if (el.matches('.lang-opt')) return null // the page reloads in the other language
  }

  // Hero: the three live apps
  if (el.closest('.happ-win, .hero-stage')) {
    if (el.matches('.ck')) return ok(line(L('Checklist from the phone', 'Checklist desde el celular'), L('The driver ticks each step and the office sees it live.', 'El chofer marca cada paso y la oficina lo ve en vivo.')))
    const team = txt(el.closest('.happ-win')?.querySelector('.wc-label')) || L('Logistics team', 'Equipo de logística')
    const view = el.matches('button') ? txt(el) : ''
    return ok(line(view ? `${team} · ${view}` : team, L('Same order #1042 in every app: Sales sells it, Logistics dispatches it, Admin collects it.', 'El mismo pedido #1042 en todas las apps: Ventas lo vende, Logística lo despacha, Administración lo cobra.')))
  }

  // The problem: Ask Claude
  if (el.closest('.ask-chips')) return ok(line(L('Ask Claude', 'Pregúntale a Claude'), L('With the AI layer connected, your team asks in plain words and Claude answers with your live data.', 'Con la capa de IA conectada, tu equipo pregunta con sus palabras y Claude responde con tus datos en vivo.')))

  // What's an app: the role apps over the shared database
  if (el.matches('.ax-role')) {
    const role = txt(el)
    return ok(line(L(`${role} app`, `App de ${role}`), el.matches('.optn')
      ? L('An optional app: lit up, you see what it reads and writes in the shared database.', 'Una app opcional: encendida, ves qué lee y escribe en la base de datos compartida.')
      : L('Lit up: what this app reads and writes. Every app works on the same data, stored once.', 'Encendida: lo que esta app lee y escribe. Todas trabajan sobre la misma información, guardada una sola vez.')))
  }

  // What you can do: service cards
  const card = el.closest('.service-card')
  if (card) return ok(line(txt(card.querySelector('.sc-name')), `${txt(card.querySelector('.sc-desc'))}. ${L('Below, what we build for it.', 'Abajo, lo que construimos para eso.')}`))

  // Demos
  const demo = txt(el.closest('.demo-card, .demo-expand')?.querySelector('.demo-ind'))
  if (el.matches('[data-form="access"]')) return ok(line(L('Request access', 'Solicitar acceso'), L(`Sign the NDA right there and explore the ${demo || 'demo'} tour yourself.`, `Firmas el NDA ahí mismo y exploras tú mismo el tour de ${demo || 'la demo'}.`)))
  if (el.matches('[data-form="demo"]')) return ok(line(L('Request a demo', 'Solicitar una demo'), L(`We walk you through ${demo || 'it'} in a 30-minute meeting. No NDA needed.`, `Te mostramos ${demo || 'la demo'} en una reunión de 30 minutos. Sin NDA.`)))
  if (el.matches('.lock-card')) return ok(line(el.getAttribute('data-name') || L('Demo under NDA', 'Demo bajo NDA'), L('One of the 16 demos under NDA. Request access to open the full tour.', 'Una de las 16 demos bajo NDA. Solicita acceso para abrir el tour completo.')))
  if (el.matches('#demoSearch')) return ok(line(L('Find your industry', 'Busca tu industria'), L('Type it and I filter the 20 demos for you.', 'Escríbela y filtro las 20 demos por ti.')))

  // Case studies: the case now in front
  if (el.closest('.case-nav, .case-dots')) {
    const active = document.querySelector('.case-feature.is-active')
    return ok(line(txt(active?.querySelector('.case-clientline')).slice(0, 60) || L('Case study', 'Caso de éxito'), txt(active?.querySelector('.case-h3'))))
  }

  // How we work: the phases
  const step = el.closest('.step')
  if (step && !step.classList.contains('active')) return null // just closed it
  if (step) return ok(line(`${txt(step.querySelector('.step-name'))} · ${txt(step.querySelector('.step-duration'))}`, txt(step.querySelector('.step-tagline'))))

  // Reviews
  if (el.closest('.reviews-controls, .trust-reviews')) return ok(line(L('Verified reviews', 'Reseñas verificadas'), L('From 100+ projects on Upwork, where we are Top Rated Plus.', 'De más de 100 proyectos en Upwork, donde somos Top Rated Plus.')))

  // FAQ: the short version of the answer
  const faq = el.closest('.faq-item')
  if (faq) {
    if (!faq.classList.contains('fopen')) return null // just closed it
    return ok(line(L('In short', 'En corto'), first(txt(faq.querySelector('.faq-a')))))
  }
  if (el.matches('.faq-more')) return ok(line(L('All 21 questions', 'Las 21 preguntas'), L('Or skip the reading: click me and ask.', 'O sáltate la lectura: haz clic en mí y pregúntame.')))

  // Anything else in a section: a fact about where you clicked.
  if (sec) {
    const tip = sectionTip(sec)
    if (tip) return { line: tip, interactive: false }
  }
  return null
}
