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

// --- Things that aren't buttons ------------------------------------------------------------------

/** The tools in the strip under the hero: what each one is, in a few words. */
const TOOLS: Record<string, [string, string]> = {
  Zapier: ['no-code automation between apps', 'automatización sin código entre apps'],
  n8n: ['the orchestrator we use to connect your tools', 'el orquestador que usamos para conectar tus herramientas'],
  Slack: ['chat for teams', 'chat para equipos'],
  Notion: ['docs and wikis for teams', 'documentos y wikis para equipos'],
  Airtable: ['a spreadsheet that works like a database', 'una hoja de cálculo que funciona como base de datos'],
  'Google Workspace': ["Google's suite: email, docs, drive and calendar", 'la suite de Google: correo, documentos, drive y calendario'],
  Gmail: ["Google's email", 'el correo de Google'],
  'Google Sheets': ["Google's spreadsheets", 'las hojas de cálculo de Google'],
  'Google Drive': ['file storage in the cloud', 'almacenamiento de archivos en la nube'],
  'Google Calendar': ['calendars and meetings', 'calendarios y reuniones'],
  HubSpot: ['CRM and marketing', 'CRM y marketing'],
  Stripe: ["online payments (it's also how you pay us)", 'pagos en línea (también es como nos pagas)'],
  OpenAI: ['AI models, the makers of ChatGPT', 'modelos de IA, los creadores de ChatGPT'],
  Twilio: ['SMS, calls and WhatsApp messages', 'SMS, llamadas y mensajes de WhatsApp'],
  Calendly: ["scheduling (it's how you book a call with us)", 'agenda de reuniones (así agendas una llamada con nosotros)'],
  Typeform: ['forms and surveys', 'formularios y encuestas'],
  Mailchimp: ['email marketing', 'email marketing'],
  Zoom: ['video calls', 'videollamadas'],
  Intercom: ['chat and support for your customers', 'chat y soporte para tus clientes'],
  Asana: ['project management', 'gestión de proyectos'],
  Trello: ['task boards', 'tableros de tareas'],
  QuickBooks: ['accounting and invoicing', 'contabilidad y facturación'],
  DocuSign: ['electronic signatures', 'firmas electrónicas'],
  Pipedrive: ['a CRM for sales teams', 'un CRM para equipos de ventas'],
  Miro: ['an online whiteboard', 'una pizarra en línea'],
  'Read AI': ['AI notes for your meetings', 'notas con IA de tus reuniones'],
  Claude: ["Anthropic's AI, which answers your questions with your live data", 'la IA de Anthropic, que responde tus preguntas con tus datos en vivo'],
  Loom: ['quick video messages', 'mensajes en video'],
  PandaDoc: ['proposals and contracts', 'propuestas y contratos'],
  ElevenLabs: ['AI voices', 'voces con IA'],
  Higgsfield: ['AI video', 'video con IA'],
}

/** The page's stats, by the words next to the number. */
function statLine(label: string, value: string): Line {
  const k = label.toLowerCase()
  const say = (en: string, es: string) => line(`${value} ${label}`.trim(), L(en, es))
  if (/implement|system|sistema/.test(k)) return say('Each one live with a real team, not a slide deck.', 'Cada uno en producción con un equipo real, no en una presentación.')
  if (/countr|pa[ií]s/.test(k)) return say('Clients on 5 continents. Everything is remote, in your timezone and language.', 'Clientes en 5 continentes. Todo es remoto, en tu zona horaria y tu idioma.')
  if (/hour|hora/.test(k)) return say('Hours of manual work our clients no longer do: the apps do it.', 'Horas de trabajo manual que nuestros clientes ya no hacen: lo hacen las apps.')
  if (/industr/.test(k)) return say("The industry changes; the problem doesn't.", 'La industria cambia; el problema no.')
  return say('A real number from our projects.', 'Un número real de nuestros proyectos.')
}

/** Logos, badges, photos, stats and other things on the page that aren't buttons. */
function thingLine(t: Element): Line | null {
  const img = t.closest('img')
  const alt = img?.getAttribute('alt') || ''

  if (t.closest('.cred-chip.monday'))
    return line(L('Official monday.com Partner', 'Partner Oficial de monday.com'), L('We are official monday.com partners and Expert Consultants, in the top 1%.', 'Somos partners oficiales de monday.com y Consultores Expertos, en el top 1%.'))
  if (t.closest('.cred-chip.upwork'))
    return line('Upwork', L("The world's largest marketplace for hiring independent experts, with verified reviews and payments. 100+ of our projects are reviewed there.", 'El marketplace más grande del mundo para contratar expertos independientes, con reseñas y pagos verificados. Ahí tenemos 100+ proyectos con reseña.'))
  if (t.closest('.cred-chip.badges'))
    return line('Top Rated Plus', L("Upwork's badge for its best talent: very high client satisfaction on large, long-term projects.", 'La insignia de Upwork para su mejor talento: satisfacción altísima en proyectos grandes y de largo plazo.'))
  if (t.closest('.hero-badges'))
    return line(L('monday.com certifications', 'Certificaciones de monday.com'), L('Professional Services, Work Management and Sales: certified by monday itself.', 'Professional Services, Work Management y Sales: certificados por la propia monday.'))
  if (t.closest('.ins-badge'))
    return line(L("We're insured", 'Estamos asegurados'), L('Professional liability with biBERK (Berkshire Hathaway) and cyber and data with Hiscox. If something goes wrong, you are covered.', 'Responsabilidad profesional con biBERK (Berkshire Hathaway) y ciber y datos con Hiscox. Si algo sale mal, estás cubierto.'))
  if (t.closest('.us-seal'))
    return line(L('Registered U.S. company', 'Empresa registrada en EE. UU.'), L('Whatever Tech LLC, Florida: you sign with a U.S. company.', 'Whatever Tech LLC, Florida: firmas con una empresa de Estados Unidos.'))
  if (t.closest('.story-photo'))
    return line(L('Part of the team', 'Parte del equipo'), L('Architects, developers, automation engineers and industrial engineers, working remotely across 5 continents.', 'Arquitectos, desarrolladores, ingenieros de automatización e ingenieros industriales, trabajando remoto en 5 continentes.'))
  if (img && t.closest('.tools-track')) {
    const d = TOOLS[alt]
    return line(alt, `${d ? `${L(d[0], d[1])[0].toUpperCase()}${L(d[0], d[1]).slice(1)}. ` : ''}${L('We connect it to your system when you need it.', 'La conectamos a tu sistema cuando la necesitas.')}`)
  }
  if (img && t.closest('.logo-wall'))
    return line(alt, L('One of the 100+ companies that already trusted us.', 'Una de las más de 100 empresas que ya confiaron en nosotros.'))
  const flag = t.closest('.flag-item')
  if (flag)
    return line(txt(flag), L('We have clients there: 100+ implementations across 15+ countries, all remote.', 'Tenemos clientes ahí: más de 100 implementaciones en más de 15 países, todo remoto.'))
  const stat = t.closest('.hero-stat, .story-stat')
  if (stat) return statLine((txt(stat.querySelector('.ss-k')) || txt(stat).replace(txt(stat.querySelector('strong')), '')).trim(), txt(stat.querySelector('strong, .ss-v')))
  const big = t.closest('.case-bigstat')
  if (big) return line(`${txt(big.querySelector('.cb-v'))} ${txt(big.querySelector('.cb-k')).toLowerCase()}`, L('A real result from this client, measured after the system went live.', 'Un resultado real de este cliente, medido con el sistema ya en producción.'))
  const caseCard = t.closest('.case-feature')
  if (caseCard && t.closest('.case-logo, .case-clientline, .case-parent'))
    return line(txt(caseCard.querySelector('.case-clientline')).slice(0, 70), txt(caseCard.querySelector('.case-h3')))
  if (t.closest('.review-card, .rv-card, .reviews-block article'))
    return line(L('A verified review', 'Una reseña verificada'), L('Written on Upwork by a real client after the project closed.', 'Escrita en Upwork por un cliente real al cerrar el proyecto.'))
  const pain = t.closest('.pain-item')
  if (pain)
    return t.closest('.pain-item')?.querySelector('.text-before')
      ? line(L('Sound familiar?', '¿Te suena?'), L(`${txt(pain)} That one goes away when every client and task has an owner in one system.`, `${txt(pain)} Esa desaparece cuando cada cliente y cada tarea tiene dueño en un solo sistema.`))
      : line(L('In 8 weeks', 'En 8 semanas'), txt(pain))
  if (t.closest('.gtee-seal'))
    return line(L('Our guarantee', 'Nuestra garantía'), L("If an app doesn't do what you asked by week 4, we fix it in 10 days or refund your first payment.", 'Si en la semana 4 una app no hace lo que pediste, la arreglamos en 10 días o te devolvemos el primer pago.'))
  if (t.closest('.pay-line'))
    return line(L('How you pay', 'Cómo pagas'), L('50% in week 1 and 50% in week 4, through a Stripe link to Whatever Tech LLC.', '50% en la semana 1 y 50% en la semana 4, con un link de Stripe a Whatever Tech LLC.'))
  if (t.closest('.qt-layer.os'))
    return line(L('AI operating system', 'Sistema operativo con IA'), L('The back-end that connects all your data, so every app works on the same information.', 'El back-end que conecta toda tu información, para que todas las apps trabajen sobre los mismos datos.'))
  if (t.closest('.qt-layer.db'))
    return line(L('AI data architecture', 'Arquitectura de datos con IA'), L('The base of everything: we map your business data and design its structure before building any app.', 'La base de todo: mapeamos la información de tu negocio y diseñamos su estructura antes de construir cualquier app.'))
  if (t.closest('.qt-years'))
    return line(L('First year vs 3 years', 'Primer año vs 3 años'), L('Everything you would pay over time, so you can compare it with SaaS licenses.', 'Todo lo que pagarías en el tiempo, para compararlo con licencias SaaS.'))
  if (img && alt) return line(alt, sectionTip(t.closest('section[id]')?.id || '')?.text || '')
  return null
}

/** Any card with a heading: what it's about, in its own first words. */
function cardLine(t: Element): Line | null {
  const HEAD = 'h3, h4, .moment-title, .sc-name, .step-name, .demo-ind, b'
  for (let el: Element | null = t, i = 0; el && i < 5 && !el.matches('section, .container'); el = el.parentElement, i++) {
    const head = el.matches(HEAD) ? el : el.querySelector(HEAD)
    const all = txt(el)
    if (!head || all.length > 700) continue
    const title = txt(head)
    // Its paragraph when it has one (not the small labels around the heading), else the rest of its text.
    const p = [...el.querySelectorAll('p')].find((x) => x !== head && txt(x).length > 15)
    const body = p ? txt(p) : all.replace(title, '').trim()
    if (title && body.length > 15) return line(title.replace(/\.$/, ''), first(body))
  }
  return null
}

/** Explanation for a click, or null when there's nothing to say (e.g. a link that leaves the page). */
export function explainClick(target: Element): { line: Line; interactive: boolean } | null {
  // Something made to be clicked (a button, a link, a card that opens…), or else the plain content clicked.
  const control = target.closest('a, button, input, [onclick], .wv.log .cd, [data-app], .ck, .lock-card')
  const el = control || target
  const sec = target.closest('section[id], #trust')?.id || ''
  const ok = (l: Line | null) => (l ? { line: l, interactive: !!control } : null)

  if (el.closest('#quoter')) {
    const l = quoterLine(el)
    if (l) return ok(l)
  }

  // Not a button: a logo, a badge, a stat, a photo… (before the hero apps, whose area holds the badges too)
  if (!control) {
    const l = thingLine(target)
    if (l) return { line: l, interactive: true }
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
    if (el.matches('.cd')) {
      const what = txt(el.querySelector('b'))
      return ok(line(what || L('Logistics team', 'Equipo de logística'), `${txt(el.querySelector('.cl'))}. ${L('Logistics sees it on the phone, and Sales and Admin see the same data on their screens.', 'Logística lo ve en el celular, y Ventas y Administración ven la misma información en sus pantallas.')}`.replace(/^\. /, '')))
    }
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

  // Any other card, read from its heading.
  if (!control) {
    const c = cardLine(target)
    if (c) return { line: c, interactive: false }
  }

  // Anything else in a section: a fact about where you clicked.
  if (sec) {
    const tip = sectionTip(sec)
    if (tip) return { line: tip, interactive: false }
  }
  return null
}
