// What Will Doo knows on the landing page: one block per section (what it says, what he answers about it,
// how to take you there), plus space facts and jokes for when nobody is talking to him. Everything about
// Whatever Tech here comes from the page itself, in English and Spanish: keep it in sync when the page changes.

import { excerpt, industries, industryIn, search } from './knowledge'

export interface Line {
  title: string
  text: string
  /** Section the line is about: his bubble closes when you scroll to another one. */
  section?: string
}

export interface Reply {
  text: string
  /** Suggested next questions, shown as chips under the answer. */
  follow?: string[]
  /** Section id to scroll to after answering. */
  goto?: string
  /** WhatsApp number the visitor left, to pass on to the team. */
  lead?: string
}

export type Lang = 'en' | 'es'
export const LANG: Lang = (document.documentElement.lang || 'en').toLowerCase().startsWith('es') ? 'es' : 'en'
type T<V> = Record<Lang, V>
const t = <V>(v: T<V>) => v[LANG]

// --- Live state, set by main.ts -------------------------------------------------------------------

let section = 'hero'
let lastActivity = performance.now()
/** Section currently in view (its id). */
export const setSection = (id: string) => (section = id)
export const getSection = () => section
/** Scroll, pointer or keyboard activity: when there's none for a while, he switches to space facts and jokes. */
export const markActivity = () => (lastActivity = performance.now())
const idle = () => performance.now() - lastActivity > 40000

// --- Sections ---------------------------------------------------------------------------------------

interface Section {
  id: string
  label: T<string>
  /** Words that name the section, for "take me to …". Accent-free, lowercase. */
  names: string[]
  /** What he says about it in his bubble while you're there. */
  tips: T<Line[]>
  /** Questions suggested in the chat while you're there. */
  starters: T<string[]>
}

export const SECTIONS: Section[] = [
  {
    id: 'hero',
    label: { en: 'the top', es: 'el inicio' }, // "Take me to the top" / "Llévame a el inicio" reads off, so goLabel special-cases it
    names: ['inicio', 'principio', 'arriba', 'portada', 'home', 'top', 'start', 'beginning'],
    tips: {
      en: [
        { title: "In one line", text: "An AI operating system underneath, and an app for every team on top, on desktop and mobile." },
        { title: "Your choice", text: "Fully custom or on monday.com: the same structure either way." },
        { title: "Proven", text: "100+ implementations in 15+ countries and 45,000+ hours automated." },
        { title: "These screens are live", text: "Click the menus in the three apps above: Sales, Admin and Logistics share the same order #1042." },
      ],
      es: [
        { title: "En una línea", text: "Un sistema operativo con IA por debajo y una app para cada equipo por encima, en desktop y móvil." },
        { title: "Tú eliges", text: "Totalmente a medida o sobre monday.com: la misma estructura en los dos casos." },
        { title: "Con experiencia", text: "100+ implementaciones en más de 15 países y 45,000+ horas automatizadas." },
        { title: "Estas pantallas son reales", text: "Haz clic en los menús de las tres apps de arriba: Ventas, Administración y Logística comparten el pedido #1042." },
      ],
    },
    starters: {
      en: ['What does Whatever Tech do?', "What's an AI operating system?", 'How much does it cost?'],
      es: ['¿Qué hace Whatever Tech?', '¿Qué es un sistema operativo con IA?', '¿Cuánto cuesta?'],
    },
  },
  {
    id: 'problem',
    label: { en: 'The problem', es: 'El problema' },
    names: ['problema', 'problem', 'frases', 'phrases', 'preguntale a claude', 'ask claude'],
    tips: {
      en: [
        { title: "Sound familiar?", text: "\"Which Excel is the right one?\" is one of the phrases that goes away in 8 weeks." },
        { title: "What changes", text: "Every client gets an owner and a next step, and nothing counts as closed until it is collected." },
        { title: "Ask Claude", text: "Once the AI layer is connected, Claude answers with your live numbers. Tap a question in its window below." },
      ],
      es: [
        { title: "¿Te suena?", text: "«¿Cuál es el Excel correcto?» es una de las frases que dejas de escuchar en 8 semanas." },
        { title: "Lo que cambia", text: "Cada cliente tiene dueño y siguiente paso, y nada se da por cerrado hasta que se cobra." },
        { title: "Pregúntale a Claude", text: "Con la capa de IA conectada, Claude responde con tus números en vivo. Toca una pregunta en su ventana, abajo." },
      ],
    },
    starters: {
      en: ['What changes in 8 weeks?', 'What can I ask Claude?', 'Take me to the pricing'],
      es: ['¿Qué cambia en 8 semanas?', '¿Qué le puedo preguntar a Claude?', 'Llévame a los precios'],
    },
  },
  {
    id: 'what-is-an-app',
    label: { en: "What's an app", es: 'Qué es una app' },
    names: ['que es una app', 'what s an app', 'whats an app', 'what is an app', 'diagrama', 'diagram', 'base de datos', 'database', 'arquitectura'],
    tips: {
      en: [
        { title: "Hover the diagram", text: "Each app shows exactly what it reads and writes in the shared database." },
        { title: "Stored once", text: "Clients, orders, invoices and people live in one place, and every team sees the same record." },
        { title: "One app per role", text: "Leadership, project managers, field, purchasing and admin each get their own screen." },
      ],
      es: [
        { title: "Pasa por el diagrama", text: "Cada app muestra exactamente qué lee y qué escribe en la base de datos compartida." },
        { title: "Una sola vez", text: "Clientes, pedidos, facturas y personas viven en un solo lugar, y todos los equipos ven el mismo registro." },
        { title: "Una app por rol", text: "Dirección, gerencia de proyectos, campo, compras y administración tienen su propia pantalla." },
      ],
    },
    starters: {
      en: ["What's an app?", 'How do the apps connect?', 'Is it on mobile too?'],
      es: ['¿Qué es una app?', '¿Cómo se conectan las apps?', '¿Funciona en el celular?'],
    },
  },
  {
    id: 'what-you-can-do',
    label: { en: 'What you can do', es: 'Qué puedes hacer' },
    names: ['que puedes hacer', 'que se puede hacer', 'what you can do', 'what can i do', 'servicios', 'services', 'funciones', 'features'],
    tips: {
      en: [
        { title: "Six things an app does", text: "Capture, automate, see, ask, share and connect." },
        { title: "From your phone", text: "Log a sale, an order or a site visit with photos and checklists." },
        { title: "Client portal", text: "Each of your clients can see only what's theirs." },
        { title: "Integrations", text: "WhatsApp, email or your website can connect when you need them, quoted separately." },
      ],
      es: [
        { title: "Seis cosas que hace una app", text: "Registra, automatiza, muestra, responde, comparte y conecta." },
        { title: "Desde el celular", text: "Registra una venta, un pedido o una visita con fotos y checklists." },
        { title: "Portal de clientes", text: "Cada cliente ve solo lo suyo." },
        { title: "Integraciones", text: "WhatsApp, correo o tu web se conectan cuando lo necesitas, cotizadas aparte." },
      ],
    },
    starters: {
      en: ['What can an app do?', 'Can my clients see their data?', 'Do you connect WhatsApp?'],
      es: ['¿Qué puede hacer una app?', '¿Mis clientes pueden ver su información?', '¿Conectan WhatsApp?'],
    },
  },
  {
    id: 'demos',
    label: { en: 'Demos', es: 'Demos' },
    names: ['demos', 'demo', 'industrias', 'industries', 'ejemplos', 'examples'],
    tips: {
      en: [
        { title: "20 industries", text: "Four previews here; the other 16 open under NDA." },
        { title: "Two ways in", text: "Request access to explore a demo yourself, or request a 30-minute guided demo." },
        { title: "Find yours", text: "Type your industry in the search box to filter the demos." },
        { title: "Fictional data", text: "Every demo started from a meeting with a real company and was rebuilt with fictional data." },
      ],
      es: [
        { title: "20 industrias", text: "Aquí ves cuatro; las otras 16 se abren bajo NDA." },
        { title: "Dos caminos", text: "Solicita acceso para explorar una demo tú mismo, o pide una demo guiada de 30 minutos." },
        { title: "Busca la tuya", text: "Escribe tu industria en el buscador para filtrar las demos." },
        { title: "Datos ficticios", text: "Cada demo nació de una reunión con una empresa real y se rehízo con datos ficticios." },
      ],
    },
    starters: {
      en: ['Which industries do you have?', 'Why do I need an NDA?', 'How do I request a demo?'],
      es: ['¿Qué industrias tienen?', '¿Por qué necesito un NDA?', '¿Cómo pido una demo?'],
    },
  },
  {
    id: 'cases',
    label: { en: 'Case studies', es: 'Casos de éxito' },
    names: ['casos', 'caso', 'case studies', 'case study', 'cases', 'casos de exito', 'koch', 'masen', 'arzuman', 'dentserv', 'resultados', 'results'],
    tips: {
      en: [
        { title: "Zero missed", text: "A Koch Industries subsidiary tracks 1,500+ devices across 27 U.S. locations without missing a maintenance." },
        { title: "5 to 25", text: "A Los Angeles luxury builder went from 5 projects to 25 with the same team." },
        { title: "Scheduled automatically", text: "Dentserv plans visits for 6,000+ patients across 300+ care facilities on its own." },
      ],
      es: [
        { title: "Cero olvidos", text: "Una subsidiaria de Koch Industries controla 1,500+ equipos en 27 sedes de EE. UU. sin perder un mantenimiento." },
        { title: "De 5 a 25", text: "Una constructora de lujo de Los Ángeles pasó de 5 proyectos a 25 con el mismo equipo." },
        { title: "Agenda automática", text: "Dentserv programa las visitas de más de 6,000 pacientes en más de 300 centros por su cuenta." },
      ],
    },
    starters: {
      en: ['Tell me about a case study', 'Who are your clients?', 'Take me to the demos'],
      es: ['Cuéntame un caso de éxito', '¿Quiénes son sus clientes?', 'Llévame a las demos'],
    },
  },
  {
    id: 'who-we-work-with',
    label: { en: 'Who we work with', es: 'Con quién trabajamos' },
    names: ['con quien trabajan', 'con quien trabajamos', 'who we work with', 'who do you work with', 'momentos', 'moments'],
    tips: {
      en: [
        { title: "Moment 01", text: "Growing on Excel and email, and the business outgrew them." },
        { title: "Moment 02", text: "You already bought the software (monday, a CRM) and know it can do more." },
        { title: "20+ industries", text: "The industry changes; the problem doesn't." },
      ],
      es: [
        { title: "Momento 01", text: "Creces en Excel y correo, y el negocio ya los superó." },
        { title: "Momento 02", text: "Ya compraste el software (monday, un CRM) y sabes que puede dar más." },
        { title: "20+ industrias", text: "La industria cambia; el problema no." },
      ],
    },
    starters: {
      en: ['Who do you work with?', 'I already use monday, can you help?', 'Do you work outside the US?'],
      es: ['¿Con quién trabajan?', 'Ya uso monday, ¿me ayudan?', '¿Trabajan fuera de EE. UU.?'],
    },
  },
  {
    id: 'who-we-are',
    label: { en: 'Who we are', es: 'Quiénes somos' },
    names: ['quienes somos', 'quienes son', 'who we are', 'who are you guys', 'equipo', 'team', 'fundadores', 'founders', 'alejandro', 'rodrigo', 'christopher', 'orlando'],
    tips: {
      en: [
        { title: "Four founders", text: "Alejandro, Rodrigo, Christopher and Orlando. Click a photo to see their LinkedIn." },
        { title: "Registered in the U.S.", text: "Whatever Tech LLC, Florida, working remotely across 5 continents." },
        { title: "Track record", text: "100+ implementations across 15+ countries, Official monday.com Partner and Top Rated Plus on Upwork." },
      ],
      es: [
        { title: "Cuatro fundadores", text: "Alejandro, Rodrigo, Christopher y Orlando. Haz clic en una foto para ver su LinkedIn." },
        { title: "Registrada en EE. UU.", text: "Whatever Tech LLC, Florida, trabajando remoto en 5 continentes." },
        { title: "Trayectoria", text: "100+ implementaciones en más de 15 países, Partner Oficial de monday.com y Top Rated Plus en Upwork." },
      ],
    },
    starters: {
      en: ['Who founded Whatever Tech?', 'Where are you based?', 'How many projects have you done?'],
      es: ['¿Quién fundó Whatever Tech?', '¿Dónde están?', '¿Cuántos proyectos han hecho?'],
    },
  },
  {
    id: 'how-we-work',
    label: { en: 'How we work', es: 'Cómo trabajamos' },
    names: ['como trabajan', 'como trabajamos', 'how we work', 'how do you work', 'proceso', 'process', 'fases', 'phases', 'programa', 'program', 'garantia', 'guarantee'],
    tips: {
      en: [
        { title: "8 weeks", text: "Apps in use from week 2, live with your real data by week 4, delivered in week 8." },
        { title: "Improvement rounds", text: "Every two weeks, 15 to 25 improvements per app, built from what your team asks for." },
        { title: "Our guarantee", text: "If an app doesn't do what you asked by week 4, we fix it in 10 days or refund your first payment." },
        { title: "Open the phases", text: "Each phase below shows what happens and what you get." },
      ],
      es: [
        { title: "8 semanas", text: "Apps en uso desde la semana 2, en producción con tus datos en la semana 4 y entregadas en la semana 8." },
        { title: "Rondas de mejora", text: "Cada dos semanas, de 15 a 25 mejoras por app, a partir de lo que pide tu equipo." },
        { title: "Nuestra garantía", text: "Si en la semana 4 una app no hace lo que pediste, la arreglamos en 10 días o te devolvemos el primer pago." },
        { title: "Abre las fases", text: "Cada fase de abajo muestra qué pasa y qué recibes." },
      ],
    },
    starters: {
      en: ['How does the 8-week program work?', "What's your guarantee?", 'How much of my team’s time does it take?'],
      es: ['¿Cómo funciona el programa de 8 semanas?', '¿Cuál es su garantía?', '¿Cuánto tiempo le toma a mi equipo?'],
    },
  },
  {
    id: 'pricing',
    label: { en: 'Pricing', es: 'Precios' },
    names: ['precios', 'precio', 'pricing', 'price', 'prices', 'cotizador', 'quoter', 'arma tu programa', 'build your program', 'tarifas', 'costos'],
    tips: {
      en: [
        { title: "Tap your teams", text: "In \"Your system\", pick the apps you need and the total updates." },
        { title: "Fully custom from $6,500", text: "$1,500 for the AI data architecture plus $2,500 per app, minimum two." },
        { title: "Your servers", text: "$1,500 one-time to install everything on your servers, then no monthly fees and no SaaS licenses." },
        { title: "First year vs 3 years", text: "The cards under the summary compare what you'd pay over time." },
      ],
      es: [
        { title: "Toca tus equipos", text: "En «Tu sistema» elige las apps que necesitas y el total se actualiza." },
        { title: "A medida desde $6,500", text: "$1,500 de la arquitectura de datos con IA más $2,500 por app, mínimo dos." },
        { title: "Tus servidores", text: "$1,500 pago único para instalar todo en tus servidores, y después ni mensualidades ni licencias SaaS." },
        { title: "Primer año vs 3 años", text: "Las tarjetas bajo el resumen comparan lo que pagarías en el tiempo." },
      ],
    },
    starters: {
      en: ['How much does it cost?', 'Custom or monday.com?', "What's included?"],
      es: ['¿Cuánto cuesta?', '¿A medida o sobre monday.com?', '¿Qué está incluido?'],
    },
  },
  {
    id: 'clients',
    label: { en: 'Our clients', es: 'Nuestros clientes' },
    names: ['clientes', 'clients', 'resenas', 'reviews', 'upwork', 'mapa', 'map', 'testimonios', 'testimonials'],
    tips: {
      en: [
        { title: "A live board", text: "The map shows every project we deliver, in real time." },
        { title: "Verified reviews", text: "100+ projects reviewed on Upwork. Drag the reviews to explore them." },
      ],
      es: [
        { title: "Un tablero en vivo", text: "El mapa muestra cada proyecto que entregamos, en tiempo real." },
        { title: "Reseñas verificadas", text: "100+ proyectos con reseña en Upwork. Arrastra las reseñas para explorarlas." },
      ],
    },
    starters: {
      en: ['Who are your clients?', 'Where are your clients?', 'Take me to the case studies'],
      es: ['¿Quiénes son sus clientes?', '¿Dónde están sus clientes?', 'Llévame a los casos de éxito'],
    },
  },
  {
    id: 'faq',
    label: { en: 'FAQ', es: 'Preguntas frecuentes' },
    names: ['faq', 'preguntas frecuentes', 'frequently asked', 'questions', 'dudas'],
    tips: {
      en: [
        { title: "Ask me instead", text: "I know these answers too, and I can take you to the right section." },
        { title: "n8n?", text: "It's the orchestrator we use to connect your tools." },
        { title: "Who owns it?", text: "You do: your apps, your data and, fully custom, your code." },
      ],
      es: [
        { title: "O pregúntame a mí", text: "También me sé estas respuestas, y te llevo a la sección que corresponda." },
        { title: "¿n8n?", text: "Es el orquestador que usamos para conectar tus herramientas." },
        { title: "¿De quién es?", text: "Tuyo: tus apps, tus datos y, a medida, tu código." },
      ],
    },
    starters: {
      en: ['What is an orchestrator?', 'Who owns the apps?', 'Where does Claude come in?'],
      es: ['¿Qué es un orquestador?', '¿De quién son las apps?', '¿Dónde entra Claude?'],
    },
  },
  {
    id: 'cta-final',
    label: { en: 'Book a consultation', es: 'Agenda una consulta' },
    names: ['consulta', 'consultation', 'agendar', 'agenda', 'book', 'contacto', 'contact', 'hablar', 'talk to you', 'reunion', 'meeting', 'final'],
    tips: {
      en: [
        { title: "30 minutes", text: "We'll show you what your operating system and first apps would look like, and whether it makes sense." },
      ],
      es: [
        { title: "30 minutos", text: "Te mostramos cómo se verían tu sistema operativo y tus primeras apps, y si tiene sentido." },
      ],
    },
    starters: {
      en: ['How do I book a consultation?', 'What happens in the call?', 'How much does it cost?'],
      es: ['¿Cómo agendo una consulta?', '¿Qué pasa en la llamada?', '¿Cuánto cuesta?'],
    },
  },
]
const byId = (id: string) => SECTIONS.find((s) => s.id === id)
export const sectionLabel = (id: string) => byId(id)?.label[LANG] ?? id

// --- Space facts and jokes, for when nobody is talking to him ----------------------------------------

const SPACE: T<Line[]> = {
  en: [
    { title: 'Space fact', text: 'A day on Venus lasts longer than its year: 243 Earth days to spin, 225 to orbit the Sun.' },
    { title: 'Space fact', text: 'Sunlight takes about 8 minutes and 20 seconds to reach you.' },
    { title: 'Space fact', text: 'Saturn is less dense than water: in a big enough bathtub, it would float.' },
    { title: 'Space fact', text: 'A teaspoon of neutron star would weigh billions of tons.' },
    { title: 'Space fact', text: 'Olympus Mons, on Mars, is about 22 km tall: two and a half Everests.' },
    { title: 'Space fact', text: "Footprints on the Moon can last millions of years: there's no wind to erase them." },
    { title: 'Space fact', text: 'The ISS circles the Earth every 90 minutes: about 16 sunrises a day.' },
    { title: 'Space fact', text: 'The Sun holds about 99.8% of all the mass in the solar system.' },
    { title: 'Space fact', text: "Space is silent: there's no air to carry sound." },
    { title: 'Space fact', text: 'More than 1,300 Earths would fit inside Jupiter.' },
  ],
  es: [
    { title: 'Dato espacial', text: 'Un día en Venus dura más que su año: tarda 243 días en girar y 225 en dar la vuelta al Sol.' },
    { title: 'Dato espacial', text: 'La luz del Sol tarda unos 8 minutos y 20 segundos en llegar hasta ti.' },
    { title: 'Dato espacial', text: 'Saturno es menos denso que el agua: en una bañera lo bastante grande, flotaría.' },
    { title: 'Dato espacial', text: 'Una cucharadita de estrella de neutrones pesaría miles de millones de toneladas.' },
    { title: 'Dato espacial', text: 'El Monte Olimpo, en Marte, mide unos 22 km: dos Everest y medio.' },
    { title: 'Dato espacial', text: 'Las huellas en la Luna pueden durar millones de años: no hay viento que las borre.' },
    { title: 'Dato espacial', text: 'La Estación Espacial da la vuelta a la Tierra cada 90 minutos: unos 16 amaneceres al día.' },
    { title: 'Dato espacial', text: 'El Sol concentra cerca del 99.8% de toda la masa del sistema solar.' },
    { title: 'Dato espacial', text: 'En el espacio no hay sonido: no hay aire que lo transmita.' },
    { title: 'Dato espacial', text: 'Dentro de Júpiter cabrían más de 1,300 Tierras.' },
  ],
}

const JOKES: T<Line[]> = {
  en: [
    { title: 'Joke time', text: 'A SQL query walks into a bar, goes up to two tables and asks: "Can I join you?"' },
    { title: 'Joke time', text: 'I asked a spreadsheet how it was doing. It said: "#REF!"' },
    { title: 'Joke time', text: "There are 10 kinds of people: those who understand binary and those who don't." },
    { title: 'Joke time', text: 'Why did the astronaut break up? He needed space. 🚀' },
    { title: 'Joke time', text: 'How do you throw a party in space? You planet. 🪐' },
    { title: 'Joke time', text: "Data in a good system never feels lonely: it's always in a relationship." },
    { title: 'Joke time', text: 'My favorite automation? The Monday report that writes itself while you have coffee. ☕' },
  ],
  es: [
    { title: 'Hora del chiste', text: 'Una consulta SQL entra a un bar, se acerca a dos tablas y pregunta: «¿Me puedo unir?»' },
    { title: 'Hora del chiste', text: 'Le pregunté a un Excel cómo estaba. Me respondió: «#¡REF!»' },
    { title: 'Hora del chiste', text: 'Hay 10 tipos de personas: las que entienden binario y las que no.' },
    { title: 'Hora del chiste', text: '¿Por qué el astronauta terminó con su pareja? Necesitaba espacio. 🚀' },
    { title: 'Hora del chiste', text: '¿Por qué la Luna nunca se aburre? Porque siempre está pasando por una fase. 🌙' },
    { title: 'Hora del chiste', text: 'Los datos en un buen sistema nunca se sienten solos: siempre tienen una relación.' },
    { title: 'Hora del chiste', text: '¿Mi automatización favorita? El reporte del lunes que se escribe solo mientras tomas café. ☕' },
  ],
}

// --- Bubbles --------------------------------------------------------------------------------------

export const GREETING: Line = t({
  en: { title: "Hi! I'm Will Doo 👋", text: "I'll keep you company while you explore." },
  es: { title: '¡Hola! Soy Will Doo 👋', text: 'Te acompaño mientras recorres la página.' },
})
export const INVITE: Line = t({
  en: { title: 'Ask me anything', text: 'Click me and ask whatever you want about Whatever Tech: pricing, demos, the team. I can take you straight there 💬' },
  es: { title: 'Pregúntame lo que sea', text: 'Haz clic en mí y pregúntame lo que quieras sobre Whatever Tech: precios, demos, el equipo. Te llevo directo 💬' },
})
/** When one of the static pictures of him on the page comes into view: the first one, then any later one. */
export const SELF_SPOTTED: Line[] = t({
  en: [
    { title: "Look, that's me 👀", text: 'My photo version. Pretty good likeness, right?' },
    { title: 'Look, there I am again! 😄', text: 'They put me all over this page.' },
  ],
  es: [
    { title: 'Mira, ahí estoy yo 👀', text: 'Mi versión en foto. Salgo bien, ¿no?' },
    { title: '¡Mira, ahí estoy yo de nuevo! 😄', text: 'Me pusieron por toda la página.' },
  ],
})
/** Click-me invitations, said every few bubbles while the chat is closed. */
const INVITES: T<Line[]> = {
  en: [
    { title: 'Looking for something?', text: 'Click me and ask anything about Whatever Tech. I can take you straight to it 💬' },
    { title: 'Ask me', text: 'Pricing, demos, the 8-week program, the team: click me and I answer or take you there.' },
    { title: 'Shortcut', text: 'Click me and say "take me to pricing", or any other section 🚀' },
  ],
  es: [
    { title: '¿Buscas algo?', text: 'Haz clic en mí y pregúntame lo que quieras sobre Whatever Tech. Te llevo directo 💬' },
    { title: 'Pregúntame', text: 'Precios, demos, el programa de 8 semanas, el equipo: haz clic en mí y te respondo o te llevo.' },
    { title: 'Atajo', text: 'Haz clic en mí y dime «llévame a precios», o a cualquier otra sección 🚀' },
  ],
}
/** Invitation to leave a WhatsApp number in the chat. */
const WHATSAPP_INVITE: Line = t({
  en: { title: 'Rather talk to a person?', text: "Click me and leave your WhatsApp: someone from the team will reach out 📱" },
  es: { title: '¿Prefieres hablar con alguien?', text: 'Haz clic en mí y déjame tu WhatsApp: alguien del equipo te contacta 📱' },
})

/** Invitation built on a question you could ask about the section in view. */
const ASK_ABOUT = t({ en: 'Ask me', es: 'Pregúntame' })
let askTurn = 0
function sectionInvite(id = section): Line {
  const s = byId(id)
  const asks = s?.starters[LANG].filter((q) => !/^(take me|llévame)/i.test(q)) ?? []
  if (!asks.length) return pick(INVITES[LANG])
  const q = asks[askTurn++ % asks.length]
  return { title: ASK_ABOUT, text: t({ en: `Click me and ask: "${q}" 💬`, es: `Haz clic en mí y pregúntame: «${q}» 💬` }), section: id }
}

/** Something about a section you clicked in: the next thing he hasn't told about it, else a question to ask him. */
export function sectionTip(id: string): Line | null {
  if (!byId(id)) return null
  const tip = byId(id)!.tips[LANG].find((l) => !told.has(l.text))
  if (!tip) return sectionInvite(id)
  told.add(tip.text)
  return { ...tip, section: id }
}
/** Titles that already invite a click (the bubble then skips its click-me hint). */
export const isInvite = (title: string) =>
  title === ASK_ABOUT || title === WHATSAPP_INVITE.title || INVITES[LANG].some((l) => l.title === title) || title === INVITE.title || title === GREETING.title

export const SHY: Line = t({
  en: { title: "Not looking, promise 🙈", text: 'Type your password in peace.' },
  es: { title: 'No miro, prometido 🙈', text: 'Escribe tranquilo tu contraseña.' },
})

const pick = <V>(list: V[]) => list[Math.floor(Math.random() * list.length)]
const told = new Set<string>()
let turn = 0

const fun = () => (Math.random() < 0.6 ? pick(SPACE[LANG]) : pick(JOKES[LANG]))

/**
 * His next comment, always about the section you're in: what it shows, or a question you could ask him
 * about it. Now and then (or when nobody has done anything for a while) a space fact or a joke.
 */
function nextLine(chatOpen: boolean): Line {
  turn += 1
  if (idle() || turn % 7 === 0) return fun()
  // Every third bubble invites a click: mostly a question about this section, now and then the WhatsApp.
  if (!chatOpen && turn % 3 === 0) return turn % 9 === 0 && !leadSent ? WHATSAPP_INVITE : sectionInvite()
  const tips = (byId(section)?.tips[LANG] ?? []).filter((l) => !told.has(l.text))
  // Told everything about this section: suggest a question about it instead of repeating himself.
  if (!tips.length) return chatOpen ? fun() : sectionInvite()
  told.add(tips[0].text)
  return { ...tips[0], section }
}

export type SceneName = 'home'
export interface Scene {
  greeting: Line
  /** Always his second bubble. */
  invite: Line
  next(chatOpen: boolean): Line
}
export const SCENES: Record<SceneName, Scene> = {
  home: { greeting: GREETING, invite: INVITE, next: nextLine },
}

// --- Chat -----------------------------------------------------------------------------------------

/** Lowercase, no accents, no punctuation, single spaces: so "¿Cuánto cuesta?" matches "cuanto cuesta". */
export const normalize = (text: string) =>
  ` ${text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()} `

const has = (q: string, k: string) => q.includes(normalize(k).trimEnd())

const goLabel = (id: string) =>
  id === 'hero' ? t({ en: 'Take me to the top', es: 'Llévame al inicio' }) : t({ en: `Take me to ${sectionLabel(id)}`, es: `Llévame a ${sectionLabel(id)}` })

export function starters(): string[] {
  return byId(section)?.starters[LANG] ?? SECTIONS[0].starters[LANG]
}

export function chatIntro(): Reply {
  return {
    text: t({
      en: "Hi! I'm Will Doo 🤖 Ask me anything about Whatever Tech, or tell me which section to take you to. If you'd rather talk to someone, leave me your WhatsApp and someone from the team will reach out.",
      es: '¡Hola! Soy Will Doo 🤖 Pregúntame lo que quieras sobre Whatever Tech, o dime a qué sección te llevo. Si prefieres hablar con alguien, déjame tu WhatsApp y alguien del equipo te contacta.',
    }),
    follow: starters(),
  }
}

interface Intent {
  keys: string[]
  answer: T<string>
  follow?: T<string[]>
  /** Section the answer lives in: offered as a "take me there" chip. */
  section?: string
  /** Says more than the FAQ entry on the same topic, so it wins even when the FAQ asks the same question. */
  overFaq?: boolean
  /** Generic ("how much does it cost?"): any more specific answer that also matches wins over it. */
  weak?: boolean
}

const PRICING_EN =
  'Fully custom (our main path): $1,500 for your AI data architecture plus $2,500 per app, minimum two, so it starts at $6,500. From 3 additional apps, every app drops to $2,000. A client portal counts as one more app.\n' +
  'On monday.com: $4,500 for the program with 2 apps, $2,000 per additional app, plus monday licenses paid directly to monday.\n' +
  'You pay 50% in week 1 and 50% in week 4.'
const PRICING_ES =
  'Totalmente a medida (nuestro camino principal): $1,500 de tu arquitectura de datos con IA más $2,500 por app, mínimo dos, así que empieza en $6,500. Desde 3 apps adicionales, todas bajan a $2,000. El portal de clientes cuenta como una app más.\n' +
  'Sobre monday.com: $4,500 el programa con 2 apps, $2,000 por app adicional, más las licencias de monday que pagas directo a monday.\n' +
  'Pagas el 50% en la semana 1 y el 50% en la semana 4.'

// Order breaks ties: earlier intents win when two match equally well.
const INTENTS: Intent[] = [
  {
    keys: ['mi whatsapp', 'my whatsapp', 'dejar mi', 'dejo mi', 'leave my', 'contacten', 'contactar', 'contactame', 'contact me', 'reach me', 'llamen', 'llamenme', 'call me', 'hablar con alguien', 'hablar con una persona', 'talk to someone', 'talk to a person', 'asesor', 'humano', 'human', 'vendedor', 'sales rep'],
    answer: {
      en: "Sure! Write your WhatsApp number with its country code (for example +1 305 555 0123) and someone from the team will reach out.",
      es: '¡Claro! Escribe tu número de WhatsApp con el código de país (por ejemplo +51 987 654 321) y alguien del equipo te contacta.',
    },
  },
  {
    keys: ['cuanto cuesta', 'cuanto vale', 'cuanto sale', 'precio', 'precios', 'costo', 'cuesta', 'cotiz', 'how much', 'price', 'pricing', 'cost', 'quote', 'budget', 'presupuesto', 'tarifa'],
    answer: { en: PRICING_EN, es: PRICING_ES },
    weak: true,
    follow: { en: ["What's included?", 'Custom or monday.com?', 'How does hosting work?'], es: ['¿Qué está incluido?', '¿A medida o sobre monday.com?', '¿Cómo funciona el hosting?'] },
    section: 'pricing',
  },
  {
    keys: ['incluido', 'incluye', 'que trae', 'included', 'include', 'what do i get', 'que recibo', 'que obtengo'],
    answer: {
      en: 'Every program includes data transfer (up to 2 working days of data volume; more is quoted before we start), a companion bot for your team and your branding on every app. The AI data architecture ($1,500) is the base of your system. Integration with your invoicing software is $1,000 one-time; other integrations are evaluated and quoted separately.',
      es: 'Cada programa incluye la migración de datos (hasta 2 días de trabajo de volumen de datos; si hace falta más, se cotiza antes de empezar), un bot de acompañamiento para tu equipo y tu marca en cada app. La arquitectura de datos con IA ($1,500) es la base de tu sistema. La integración con tu facturación cuesta $1,000 pago único; las demás integraciones se evalúan y cotizan aparte.',
    },
    follow: { en: ['How much does it cost?', 'How does hosting work?'], es: ['¿Cuánto cuesta?', '¿Cómo funciona el hosting?'] },
    section: 'pricing',
  },
  {
    keys: ['hosting', 'servidor', 'servidores', 'server', 'servers', 'alojamiento', 'nube', 'cloud', 'infraestructura', 'infrastructure', 'instalacion', 'instalar', 'installation', 'install', 'respaldo', 'backup'],
    answer: {
      en: "Fully custom, you choose where it lives. On your own servers it's $1,500 one-time for the whole system: in week 4 we put it live there (if you don't have servers, you sign up with your provider and we set them up), and you never pay us for infrastructure; hosting, backups and security you contract with your provider. On ours there's no installation fee: up to 20 users, $100 a month or $1,000 a year; 21 to 50 users, $200 or $2,000; then $200 more for every 50 users. Either way, the code is yours.",
      es: 'A medida, tú eliges dónde vive. En tus propios servidores son $1,500 pago único por todo el sistema: en la semana 4 lo ponemos en producción ahí (si no tienes, los contratas con tu proveedor y te los montamos) y nunca nos pagas infraestructura; el hosting, los respaldos y la seguridad los contratas con tu proveedor. En los nuestros no hay pago de instalación: hasta 20 usuarios, $100 al mes o $1,000 al año; de 21 a 50, $200 o $2,000; después, $200 más por cada 50 usuarios. En cualquier caso, el código es tuyo.',
    },
    follow: { en: ['Custom or monday.com?', 'How much does it cost?'], es: ['¿A medida o sobre monday.com?', '¿Cuánto cuesta?'] },
    section: 'pricing',
  },
  {
    keys: ['monday', 'a medida', 'custom', 'personalizado', 'saas', 'licencia', 'licencias', 'license', 'licenses', 'vibe'],
    answer: {
      en: 'Both give you the same structure: one operating system for your data and an app for every team. Fully custom is our main path: no SaaS licenses, and on your own servers no monthly fees. With 2 apps on your servers it\'s $8,000 the first year and the same over 3 years ($1,500 installation included), against $9,840 on monday.com with 10 users ($20,520 over 3 years, because of the licenses). On monday.com it runs in your own monday account.',
      es: 'Los dos te dan la misma estructura: un sistema operativo para tu información y una app para cada equipo. A medida es nuestro camino principal: sin licencias SaaS y, en tus servidores, sin mensualidades. Con 2 apps en tus servidores son $8,000 el primer año y lo mismo en 3 años (con la instalación de $1,500), contra $9,840 sobre monday.com con 10 usuarios ($20,520 en 3 años, por las licencias). Sobre monday.com corre en tu propia cuenta de monday.',
    },
    follow: { en: ['How much does it cost?', 'How does hosting work?'], es: ['¿Cuánto cuesta?', '¿Cómo funciona el hosting?'] },
    section: 'pricing',
  },
  {
    keys: ['garantia', 'garantias', 'devolucion', 'reembolso', 'guarantee', 'refund', 'money back', 'y si no funciona', 'what if it doesn t work'],
    answer: {
      en: "In week 4 we check each app against the scope you approved at the start. If an app doesn't do what you asked, we get it working within 10 days. If it still doesn't, we refund your first payment (50%) within 30 days, the program ends and you don't pay the second.",
      es: 'En la semana 4 revisamos cada app contra el alcance que aprobaste al inicio. Si una app no hace lo que pediste, la hacemos funcionar en 10 días. Si aun así no funciona, te devolvemos el pago inicial (50%) en los 30 días siguientes, el programa termina y no pagas el segundo.',
    },
    follow: { en: ['How do payments work?', 'How does the 8-week program work?'], es: ['¿Cómo se paga?', '¿Cómo funciona el programa de 8 semanas?'] },
    section: 'how-we-work',
  },
  {
    keys: ['pago', 'pagos', 'se paga', 'pagar', 'payment', 'payments', 'pay', 'cuotas', 'installments', 'cancelar', 'cancel', 'suscripcion', 'subscription', 'contrato', 'contract', 'permanencia', 'stripe', 'tarjeta', 'card', 'transferencia', 'transfer', 'wire', 'medio de pago', 'metodo de pago', 'payment method'],
    answer: {
      en: "It's a one-time payment for the program, not a subscription: 50% in week 1 and 50% in week 4, once your apps do what you asked. You pay through a Stripe link to Whatever Tech LLC (Florida), or we can arrange it with you directly in a meeting. Prices are in USD and taxes are added to your invoice.",
      es: 'Es un pago único por el programa, no una suscripción: 50% en la semana 1 y 50% en la semana 4, cuando tus apps hacen lo que pediste. Pagas a través de un link de Stripe a Whatever Tech LLC (Florida), o lo coordinamos contigo directamente en una reunión. Los precios están en USD y los impuestos se agregan en la factura.',
    },
    overFaq: true,
    follow: { en: ["What's your guarantee?", 'How much does it cost?'], es: ['¿Cuál es su garantía?', '¿Cuánto cuesta?'] },
    section: 'pricing',
  },
  {
    keys: ['ronda', 'rondas', 'round', 'rounds', 'mejoras adicionales', 'mas mejoras', 'more improvements', 'extra improvements', 'despues de la entrega', 'after delivery'],
    answer: {
      en: 'Every program includes improvement rounds until delivery in week 8: 3 per app fully custom, 4 on monday.com, each with 15 to 25 improvements. After week 8, each extra round is $500 per app, wherever your system runs.',
      es: 'Cada programa incluye rondas de mejora hasta la entrega en la semana 8: 3 por app a medida y 4 sobre monday.com, cada una con 15 a 25 mejoras. Después de la semana 8, cada ronda adicional cuesta $500 por app, viva donde viva tu sistema.',
    },
    follow: { en: ['What happens after week 8?', 'How much does it cost?'], es: ['¿Qué pasa después de la semana 8?', '¿Cuánto cuesta?'] },
    section: 'pricing',
  },
  {
    keys: ['8 semanas', 'ocho semanas', 'programa', 'proceso', 'cuanto tarda', 'cuanto tiempo toma', 'plazo', 'tiempo', '8 weeks', 'eight weeks', 'program', 'process', 'how long', 'timeline', 'fases', 'phases', 'como trabajan'],
    answer: {
      en: 'Weeks 0–1, we learn how each team works. Weeks 1–4, we design your data architecture and build your apps: in use from week 2, live with your real data by week 4. Weeks 2–8, your team uses them and we deliver a round of improvements every two weeks, 15 to 25 per app, until they run them without us.',
      es: 'Semanas 0–1: vemos cómo trabaja cada equipo. Semanas 1–4: diseñamos tu arquitectura de datos y construimos tus apps, en uso desde la semana 2 y en producción con tus datos reales en la semana 4. Semanas 2–8: tu equipo las usa y entregamos una ronda de mejoras cada dos semanas, de 15 a 25 por app, hasta que las usan sin nosotros.',
    },
    follow: { en: ["What's your guarantee?", 'How much of my team’s time does it take?'], es: ['¿Cuál es su garantía?', '¿Cuánto tiempo le toma a mi equipo?'] },
    section: 'how-we-work',
  },
  {
    keys: ['capacit', 'entrenar', 'entrenamiento', 'train', 'training', 'adopt', 'adopcion', 'onboarding', 'aprender a usar', 'learn to use'],
    answer: {
      en: "Adoption is part of the build. Your team uses its apps from week 2, and the improvements come from what they ask for, so the apps fit how they actually work. We don't consider the job done until they run the apps without us in the room.",
      es: 'La adopción es parte de la construcción. Tu equipo usa sus apps desde la semana 2 y las mejoras salen de lo que pide, así que las apps se ajustan a cómo trabaja de verdad. No damos el trabajo por terminado hasta que las usa sin nosotros en la sala.',
    },
    follow: { en: ['How much of my team’s time does it take?', 'What happens after week 8?'], es: ['¿Cuánto tiempo le toma a mi equipo?', '¿Qué pasa después de la semana 8?'] },
    section: 'how-we-work',
  },
  {
    keys: ['seguridad', 'datos seguros', 'estan seguros', 'es seguro', 'segura', 'asegurad', 'proteg', 'privacidad', 'ciber', 'hacke', 'secure', 'security', 'safe', 'privacy', 'protect', 'cyber', 'insur', 'breach'],
    answer: {
      en: 'Your data stays yours. Fully custom, your system can run on your own servers; on monday.com it lives in your own monday account. The demos use fictional data. And Whatever Tech LLC is insured: professional liability with biBERK (Berkshire Hathaway) and cyber and data with Hiscox.',
      es: 'Tu información sigue siendo tuya. A medida, tu sistema puede correr en tus propios servidores; sobre monday.com vive en tu propia cuenta de monday. Las demos usan datos ficticios. Y Whatever Tech LLC está asegurada: responsabilidad profesional con biBERK (Berkshire Hathaway) y ciber y datos con Hiscox.',
    },
    follow: { en: ['Who owns the apps?', 'How does hosting work?'], es: ['¿De quién son las apps?', '¿Cómo funciona el hosting?'] },
  },
  {
    keys: ['tiempo de mi equipo', 'tiempo le toma', 'mi equipo', 'team s time', 'my team', 'sesiones', 'sessions', 'reuniones'],
    answer: {
      en: "Mostly their usual work, now done in their apps. In week 1, each team has one discovery session with us. From week 2, each app needs about 45 minutes every other week while we watch the team work, and in the week between you review the new version with us.",
      es: 'Sobre todo su trabajo de siempre, ahora hecho en sus apps. En la semana 1, cada equipo tiene una sesión de descubrimiento con nosotros. Desde la semana 2, cada app necesita unos 45 minutos cada dos semanas mientras vemos trabajar al equipo, y en la semana intermedia revisas con nosotros la nueva versión.',
    },
    section: 'how-we-work',
  },
  {
    keys: ['sistema operativo', 'operating system', 'que hacen', 'que hace whatever', 'a que se dedican', 'what do you do', 'what does whatever', 'whatever tech'],
    answer: {
      en: 'We build AI-powered operating systems. Underneath, one system connects the data of every area; on top, each team works in its own app, on desktop and mobile. Fully custom or on monday.com.',
      es: 'Construimos sistemas operativos con IA. Por debajo, un sistema conecta la información de todas las áreas; por encima, cada equipo trabaja en su propia app, en desktop y móvil. Totalmente a medida o sobre monday.com.',
    },
    follow: { en: ["What's an app?", 'How much does it cost?', 'Take me to the demos'], es: ['¿Qué es una app?', '¿Cuánto cuesta?', 'Llévame a las demos'] },
    section: 'hero',
  },
  {
    keys: ['que es una app', 'una app', 'apps', 'what s an app', 'what is an app', 'aplicacion', 'aplicaciones', 'base de datos', 'database', 'se conectan', 'connect'],
    answer: {
      en: 'An app is the screen one team works in, connected to all your data. We store clients, orders, invoices and people once, in databases, and connect them all. Each team gets a screen with only what it needs, on desktop and mobile.',
      es: 'Una app es la pantalla en la que trabaja un equipo, conectada a toda tu información. Guardamos clientes, pedidos, facturas y personas una sola vez, en bases de datos, y las conectamos. Cada equipo recibe una pantalla con solo lo que necesita, en desktop y móvil.',
    },
    follow: { en: ['What can an app do?', 'How much does it cost?'], es: ['¿Qué puede hacer una app?', '¿Cuánto cuesta?'] },
    section: 'what-is-an-app',
  },
  {
    keys: ['que puede hacer', 'que puedo hacer', 'what can', 'capturar', 'automatizar', 'automatiza', 'automation', 'automate', 'reportes', 'reports'],
    answer: {
      en: 'Capture sales, orders or site visits from the phone. Automate reminders, follow-ups and approvals. See sales, cash and progress live. Ask your numbers in plain language. Share a client portal. Connect WhatsApp, email or your website when you need it.',
      es: 'Registra ventas, pedidos o visitas desde el celular. Automatiza recordatorios, seguimientos y aprobaciones. Ve ventas, caja y avance en vivo. Pregúntale a tus números en lenguaje natural. Comparte un portal de clientes. Conecta WhatsApp, correo o tu web cuando lo necesites.',
    },
    section: 'what-you-can-do',
  },
  {
    keys: ['celular', 'movil', 'telefono', 'mobile', 'phone', 'android', 'iphone'],
    answer: { en: 'Yes: every app works on desktop and mobile.', es: 'Sí: cada app funciona en desktop y en el celular.' },
    section: 'what-is-an-app',
  },
  {
    keys: ['portal', 'mis clientes ven', 'clients see', 'client portal'],
    answer: {
      en: "A client portal is an app where each client sees only what's theirs, with a one-page website they log in from. Fully custom it counts as one more app ($2,500); on monday.com it's $5,000.",
      es: 'El portal de clientes es una app donde cada cliente ve solo lo suyo, con una web informativa de una página para entrar. A medida cuenta como una app más ($2,500); sobre monday.com cuesta $5,000.',
    },
    section: 'pricing',
  },
  {
    keys: ['integracion', 'integraciones', 'integrar', 'integration', 'integrations', 'whatsapp', 'meta', 'api', 'erp', 'facturacion', 'facturador', 'invoicing', 'billing software', 'contable', 'accounting'],
    answer: {
      en: 'We connect your system with tools like Meta, WhatsApp, your website or your accounting software through an orchestrator (we use n8n). Integration with your invoicing software is $1,000 one-time: when you invoice, the invoice is issued there and its number flows into collections on its own. Other integrations are evaluated and quoted separately from the program.',
      es: 'Conectamos tu sistema con herramientas como Meta, WhatsApp, tu web o tu sistema contable a través de un orquestador (usamos n8n). La integración con tu facturación cuesta $1,000 pago único: al facturar, la factura se emite en tu facturador y su número entra solo a cobranza. Las demás integraciones se evalúan y cotizan aparte del programa.',
    },
    follow: { en: ['What is an orchestrator?', 'What is n8n?'], es: ['¿Qué es un orquestador?', '¿Qué es n8n?'] },
    section: 'faq',
  },
  {
    keys: ['orquestador', 'orchestrator'],
    answer: {
      en: 'The piece that moves information between your systems on its own: when something happens in one place, it runs the next steps in the others and asks the AI to decide when a decision is needed.',
      es: 'La pieza que mueve la información entre tus sistemas por su cuenta: cuando algo pasa en un lugar, ejecuta los siguientes pasos en los demás y le pide a la IA que decida cuando hace falta.',
    },
    follow: { en: ['What is n8n?'], es: ['¿Qué es n8n?'] },
    section: 'faq',
  },
  {
    keys: ['n8n'],
    answer: {
      en: "The orchestrator we use: an automation platform that connects hundreds of tools and AI models through visual workflows. It can run in the cloud or on your own servers.",
      es: 'El orquestador que usamos: una plataforma de automatización que conecta cientos de herramientas y modelos de IA con flujos visuales. Puede correr en la nube o en tus propios servidores.',
    },
    section: 'faq',
  },
  {
    keys: ['claude', 'inteligencia artificial', 'ia', ' ai ', 'chatgpt', 'preguntarle'],
    answer: {
      en: "Once the AI layer is connected to your operating system, you ask Claude about your operation in plain language: what's overdue, how sales are going, where an order is. It answers with your live data.",
      es: 'Cuando la capa de IA está conectada a tu sistema operativo, le preguntas a Claude por tu operación con tus palabras: qué está vencido, cómo van las ventas, dónde está un pedido. Responde con tus datos en vivo.',
    },
    section: 'problem',
  },
  {
    keys: ['de quien son', 'propiedad', 'dueno', 'codigo', 'who owns', 'ownership', 'own the', 'code'],
    answer: {
      en: "You do. Your apps, your data and your automations belong to your company. Fully custom, the code is always yours; on monday.com, everything lives in your own account and keeps running if you stop working with us.",
      es: 'Tuyas. Las apps, tu información y las automatizaciones son de tu empresa. A medida, el código siempre es tuyo; sobre monday.com, todo vive en tu propia cuenta y sigue funcionando si dejas de trabajar con nosotros.',
    },
    section: 'faq',
  },
  {
    keys: ['demo', 'demos', 'industria', 'industrias', 'industry', 'industries', 'ejemplo', 'ejemplos', 'example'],
    answer: {
      en: 'We have demos for 20 industries, from dental services and construction to manufacturing, event agencies and a pharmaceutical lab. Each started from a meeting with a real company and was rebuilt with fictional data. Four are previewed on the page; the rest open under NDA.',
      es: 'Tenemos demos de 20 industrias, desde servicios dentales y construcción hasta manufactura, agencias de eventos y un laboratorio farmacéutico. Cada una nació de una reunión con una empresa real y se rehízo con datos ficticios. En la página ves cuatro; el resto se abre bajo NDA.',
    },
    follow: { en: ['Why do I need an NDA?', 'How do I request a demo?'], es: ['¿Por qué necesito un NDA?', '¿Cómo pido una demo?'] },
    section: 'demos',
  },
  {
    keys: ['nda', 'confidencial', 'confidential', 'acceso', 'access'],
    answer: {
      en: 'The demos show how we design an operation: its data structure, approvals and automations. The data is fictional; the design is ours. To explore them yourself, click "Request access" on any demo and sign the NDA right there.',
      es: 'Las demos muestran cómo diseñamos una operación: su estructura de datos, aprobaciones y automatizaciones. Los datos son ficticios; el diseño es nuestro. Para explorarlas tú mismo, haz clic en «Solicitar acceso» en cualquier demo y firma el NDA ahí mismo.',
    },
    section: 'demos',
  },
  {
    keys: ['pedir una demo', 'pido una demo', 'solicitar una demo', 'request a demo', 'guided demo', 'demo guiada'],
    answer: {
      en: 'Click "Request a demo" on any demo, leave your name, work email and WhatsApp, and pick a time. We walk you through it in a 30-minute meeting, no NDA needed.',
      es: 'Haz clic en «Solicitar una demo» en cualquier demo, deja tu nombre, correo corporativo y WhatsApp, y elige un horario. Te la mostramos en una reunión de 30 minutos, sin NDA.',
    },
    section: 'demos',
  },
  {
    keys: ['caso', 'casos', 'case', 'cases', 'koch', 'masen', 'arzuman', 'dentserv', 'resultado', 'results'],
    answer: {
      en: 'Three examples: a Koch Industries subsidiary tracks 1,500+ devices across 27 U.S. locations with zero maintenances missed; a Los Angeles luxury builder went from 5 projects to 25 with the same team; and Dentserv schedules 6,000+ patients across 300+ care facilities automatically.',
      es: 'Tres ejemplos: una subsidiaria de Koch Industries controla 1,500+ equipos en 27 sedes de EE. UU. sin un solo mantenimiento perdido; una constructora de lujo de Los Ángeles pasó de 5 proyectos a 25 con el mismo equipo; y Dentserv agenda automáticamente a más de 6,000 pacientes en más de 300 centros.',
    },
    section: 'cases',
  },
  {
    keys: ['clientes', 'clients', 'resenas', 'reviews', 'upwork', 'paises', 'countries', 'fuera de', 'outside', 'internacional', 'international'],
    answer: {
      en: "100+ implementations across 15+ countries on 5 continents, with reviews verified on Upwork, where we're Top Rated Plus. All sessions are remote and we adapt to your timezone and language.",
      es: 'Más de 100 implementaciones en más de 15 países de 5 continentes, con reseñas verificadas en Upwork, donde somos Top Rated Plus. Todas las sesiones son remotas y nos adaptamos a tu zona horaria e idioma.',
    },
    section: 'clients',
  },
  {
    keys: ['quien fundo', 'fundador', 'fundadores', 'founder', 'founders', 'equipo', 'team', 'quienes son', 'who are you', 'alejandro', 'rodrigo', 'christopher', 'orlando', 'donde estan', 'where are you'],
    answer: {
      en: 'Whatever Tech was founded by Alejandro Panizo Ayza (Founder & Managing Director), an Official monday.com Partner. The co-founders are Rodrigo Espinosa Torres (Commercial Director), Christopher Cohen Grozo and Orlando Espinosa Chiroque (Board Directors). We are Whatever Tech LLC, registered in Florida, working remotely across 5 continents.',
      es: 'Whatever Tech la fundó Alejandro Panizo Ayza (Fundador y Managing Director), Partner Oficial de monday.com. Los co-fundadores son Rodrigo Espinosa Torres (Director Comercial), Christopher Cohen Grozo y Orlando Espinosa Chiroque (Miembros del Directorio). Somos Whatever Tech LLC, registrada en Florida, y trabajamos remoto en 5 continentes.',
    },
    section: 'who-we-are',
  },
  {
    keys: ['con quien trabajan', 'who do you work with', 'excel', 'ya uso', 'already use', 'para quien', 'for who', 'tamano', 'size'],
    answer: {
      en: "We come in at one of two moments: you're growing on Excel and email and hit their ceiling, or you already bought software (monday, a CRM) and know it can do more. In both cases we build the data architecture underneath and an app each team wants to open.",
      es: 'Llegamos en uno de dos momentos: creces en Excel y correo y llegaste a su techo, o ya compraste software (monday, un CRM) y sabes que puede dar más. En los dos casos construimos la arquitectura de datos por debajo y una app que cada equipo quiera abrir.',
    },
    section: 'who-we-work-with',
  },
  {
    keys: ['consulta', 'consultation', 'agendar', 'agendo', 'agenda', 'book', 'llamada', 'call', 'contacto', 'contact', 'reunion', 'meeting', 'hablar con'],
    answer: {
      en: "Book a 30-minute consultation: we look at how your teams work today and tell you what your operating system and first apps would look like, and whether it makes sense. The button is at the bottom of the page and in the top bar.",
      es: 'Agenda una consulta de 30 minutos: vemos cómo trabajan hoy tus equipos y te decimos cómo se verían tu sistema operativo y tus primeras apps, y si tiene sentido. El botón está al final de la página y en la barra de arriba.',
    },
    section: 'cta-final',
  },
  {
    keys: ['hola', 'buenas', 'hey', 'hello', 'hi ', 'que tal', 'saludos', 'buen dia', 'buenos dias', 'good morning'],
    answer: {
      en: "Hi! 👋 I know everything on this page. Ask me about pricing, demos or how we work, or tell me where to take you.",
      es: '¡Hola! 👋 Me sé todo lo de esta página. Pregúntame por precios, demos o cómo trabajamos, o dime a dónde te llevo.',
    },
  },
  {
    keys: ['gracias', 'genial', 'perfecto', 'excelente', 'crack', 'thanks', 'thank you', 'great', 'awesome', 'cool'],
    answer: { en: "Anytime! I'll keep floating around here. 🛸", es: '¡Cuando quieras! Aquí sigo flotando. 🛸' },
  },
  {
    keys: ['quien eres', 'que eres', 'will doo', 'como te llamas', 'tu nombre', 'eres un robot', 'who are you', 'what are you', 'your name'],
    answer: {
      en: "I'm Will Doo, the Whatever Tech mascot 🤖. I float around this page, answer questions about it and take you to any section you ask for.",
      es: 'Soy Will Doo, la mascota de Whatever Tech 🤖. Floto por esta página, respondo dudas sobre ella y te llevo a la sección que me pidas.',
    },
  },
  {
    keys: ['chiste', 'broma', 'joke', 'funny', 'hazme reir', 'make me laugh'],
    answer: { en: '', es: '' }, // filled at reply time with a random joke
  },
  {
    keys: ['dato curioso', 'espacio', 'planeta', 'estrella', 'universo', 'fun fact', 'space', 'planet', 'star', 'universe', 'nebulosa', 'nebula'],
    answer: { en: '', es: '' }, // filled at reply time with a random space fact
  },
]

const NAV = ['llevame', 'lleva me', 'llevar', 'ir a', 'vamos a', 'muestrame', 'ensename', 'donde esta', 'donde veo', 'quiero ver', 'take me', 'go to', 'show me', 'jump to', 'scroll to', 'where is', 'where are', 'open the', 'abre']

/** Which section a question names, if any (longest name wins). */
function namedSection(q: string): string | null {
  let best: { id: string; len: number } | null = null
  for (const s of SECTIONS) {
    for (const n of s.names) {
      if (has(q, n) && (!best || n.length > best.len)) best = { id: s.id, len: n.length }
    }
  }
  return best?.id ?? null
}

const OFF_TOPIC: T<string[]> = {
  en: [
    "That one's outside my orbit 🛸. Ask me about pricing, demos, how we work or the team, and I'll shine.",
    'My circuits are trained on this page only 🤖. Try "how much does it cost?" or "take me to the demos".',
    "Hmm, I don't know that one. But I can take you to any section: just tell me which.",
  ],
  es: [
    'Uy, eso está fuera de mi órbita 🛸. Pregúntame por precios, demos, cómo trabajamos o el equipo, y ahí sí brillo.',
    'Mis circuitos solo están entrenados en esta página 🤖. Prueba con «¿cuánto cuesta?» o «llévame a las demos».',
    'Mmm, eso no lo sé. Pero puedo llevarte a cualquier sección: dime cuál.',
  ],
}
let offTurn = Math.floor(Math.random() * 10)

/** Words that make a short message a question ("¿qué es Masen?"), not a section name to fly to ("casos"). */
const ASKING = ['que', 'quien', 'quienes', 'como', 'cual', 'cuales', 'cuanto', 'cuanta', 'por que', 'what', 'who', 'how', 'which', 'why', 'is', 'are', 'do', 'does', 'can']
/** A question about the kind of company you are: "¿trabajan con empresas de logística?". */
const INDUSTRY_CTX = ['industria', 'industry', 'industries', 'sector', 'rubro', 'empresa de', 'empresas de', 'company', 'companies', 'negocio', 'business', 'trabajan con', 'work with', 'demo de', 'demo for', 'para mi', 'for my', 'tienen algo', 'have anything']

function industryReply(name: string | null): Reply {
  const follow = t({ en: ['Why do I need an NDA?', 'How do I request a demo?'], es: ['¿Por qué necesito un NDA?', '¿Cómo pido una demo?'] })
  if (section !== 'demos') follow.unshift(goLabel('demos'))
  if (name)
    return {
      text: t({
        en: `Yes: "${name}" is one of the 20 industries we designed a system for. Request access to explore the demo yourself, or a 30-minute guided demo.`,
        es: `Sí: «${name}» es una de las 20 industrias para las que diseñamos un sistema. Solicita acceso para explorar la demo tú mismo, o una demo guiada de 30 minutos.`,
      }),
      follow,
    }
  const some = industries().slice(0, 8).join(', ')
  return {
    text: t({
      en: `Yes. The industry changes; the problem doesn't. We've designed systems for 20 industries, like ${some}. If yours isn't one of them, we scope it with you in a consultation.`,
      es: `Sí. La industria cambia; el problema no. Diseñamos sistemas para 20 industrias, como ${some}. Si la tuya no está, la vemos contigo en una consulta.`,
    }),
    follow,
  }
}

/** A phone number in a message: "+51 987 654 321", "(305) 555-0123"… */
const PHONE = /\+?\d[\d\s().-]{6,}\d/
let leadSent = false
let awaitingPhone = false // he just asked for the number
let answered = 0
const WHATSAPP_CHIP = t({ en: 'Leave my WhatsApp', es: 'Dejar mi WhatsApp' })

/** The number someone typed: thanks and pass it on, or ask for the country code. */
function phoneReply(raw: string): Reply {
  const digits = raw.replace(/\D/g, '')
  if (digits.length < 8 || digits.length > 15)
    return { text: t({ en: "Hmm, that number looks incomplete. Could you write it again with its country code? (e.g. +1 305 555 0123)", es: 'Mmm, ese número parece incompleto. ¿Me lo escribes de nuevo con el código de país? (ej. +51 987 654 321)' }) }
  if (!raw.trim().startsWith('+') && digits.length < 11)
    return { text: t({ en: 'Almost! Add the country code so the team can reach you (e.g. +1 305 555 0123).', es: '¡Casi! Agrégale el código de país para que el equipo pueda escribirte (ej. +51 987 654 321).' }) }
  leadSent = true
  const phone = `${raw.trim().startsWith('+') ? '+' : ''}${digits}`
  return {
    text: t({
      en: `Got it! 🙌 Someone from the team will message you on WhatsApp at ${raw.trim()}. Meanwhile, ask me anything you like.`,
      es: `¡Listo! 🙌 Alguien del equipo te escribe por WhatsApp al ${raw.trim()}. Mientras tanto, pregúntame lo que quieras.`,
    }),
    follow: starters().slice(0, 2),
    lead: phone,
  }
}

export function reply(question: string): Reply {
  const r = answer(question)
  if (r.lead || r.goto || awaitingPhone) return r
  // Every few answers (and whenever he doesn't know), offer to have someone from the team reach out.
  answered += 1
  const unknown = OFF_TOPIC[LANG].includes(r.text)
  if (!leadSent && (unknown || answered % 3 === 0) && !(r.follow ?? []).includes(WHATSAPP_CHIP))
    r.follow = [...(r.follow ?? []).slice(0, 2), WHATSAPP_CHIP]
  return r
}

function answer(question: string): Reply {
  // A number counts as the WhatsApp when he just asked for it, or when it's most of the message
  // (not "1500 or 2500?").
  const phone = question.match(PHONE)
  const mostly = phone && phone[0].replace(/\s/g, '').length >= question.replace(/\s/g, '').length * 0.6 && /\d{3}/.test(phone[0])
  if (phone && (awaitingPhone || mostly)) {
    const r = phoneReply(phone[0])
    awaitingPhone = !r.lead
    return r
  }
  awaitingPhone = false
  const q = normalize(question)
  const target = namedSection(q)
  const asking = ASKING.some((w) => q.startsWith(` ${w} `))
  // "Take me to …": go there.
  if (target && (NAV.some((v) => has(q, v)) || (!asking && q.trim().split(' ').length <= 3))) {
    const s = byId(target)!
    return {
      text: t({ en: `On my way to ${s.label.en}! 🚀`, es: `¡Te llevo a ${s.label.es}! 🚀` }),
      follow: s.starters[LANG],
      goto: target,
    }
  }
  let best: Intent | null = null
  let score = 0
  for (const intent of INTENTS) {
    const hits = intent.keys.reduce((c, k) => (has(q, k) ? c + 1 : c), 0)
    const n = intent.weak ? Math.min(hits, 1) * 0.5 : hits
    if (n > score) {
      best = intent
      score = n
    }
  }
  // A kind of company: the demo for it, or the industries we've worked with.
  const industry = industryIn(question)
  const aboutIndustry = INDUSTRY_CTX.some((k) => has(q, k))
  if (industry && (aboutIndustry || !best)) return industryReply(industry)
  // Anything else on the page: the FAQ wins when it asks the same thing, and a founder's own card when you
  // name them; otherwise the written answers above come first and the page text is the fallback.
  const hit = search(question)
  // A FAQ question "matches" when it shares at least two of your words ("Where do I pay?" is not "What will I
  // pay monday.com?").
  const exact =
    hit && ((hit.kind === 'faq' && hit.titleCoverage >= 0.75 && hit.inTitle >= 2 && !best?.overFaq) || (hit.kind === 'person' && hit.inTitle > 0))
  if (aboutIndustry && !exact && (!best || best.section === 'demos' || best.section === 'who-we-work-with')) return industryReply(null)
  if (hit && (!best || exact)) {
    const follow = hit.section !== section ? [goLabel(hit.section)] : []
    follow.push(...(byId(hit.section)?.starters[LANG] ?? []).filter((f) => !/^(take me|llévame)/i.test(f)).slice(0, 2))
    const where = hit.kind === 'faq' || !hit.title ? '' : `${hit.title}: `
    return { text: excerpt(where + hit.text, 360), follow: follow.slice(0, 3) }
  }
  if (!best) {
    offTurn += 1
    return { text: OFF_TOPIC[LANG][offTurn % OFF_TOPIC[LANG].length], follow: starters().slice(0, 2) }
  }
  if (!best.answer.en) {
    const line = best.keys.includes('chiste') ? pick(JOKES[LANG]) : pick(SPACE[LANG])
    return { text: line.text, follow: starters().slice(0, 2) }
  }
  if (best === INTENTS[0]) awaitingPhone = true // he asked for the WhatsApp number
  const follow = [...(best.follow?.[LANG] ?? [])]
  if (best.section && best.section !== section) follow.unshift(goLabel(best.section))
  return { text: best.answer[LANG], follow: follow.slice(0, 3) }
}
