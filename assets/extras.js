/* Whatever Tech home · demo request forms (access with NDA, demo meeting) and the "Ask Claude" block */
(function(){
  'use strict';

  // Where both forms send their lead (n8n webhook). Empty = nothing is sent yet.
  var LEAD_HOOK = '';

  var LANG = (document.documentElement.lang || 'en').slice(0, 2) === 'es' ? 'es' : 'en';
  var TX = {
    en: {
      close: 'Close',
      accK: 'Guided tour access', accT: 'Request access to this demo',
      accP: 'Explore the full guided tour on your own. Leave your details and sign the NDA: the demos show our designs, so they open under confidentiality.',
      demK: 'Demo meeting', demT: 'Request a demo of this system',
      demP: 'We walk you through it in a 30-minute meeting. Leave your details and pick a time; we confirm the meeting by WhatsApp.',
      you: 'You', first: 'First name', last: 'Last name', email: 'Work email', emailPh: 'you@company.com',
      phone: 'Phone (WhatsApp)', phonePh: '+1 305 555 0123',
      company: 'Your company', legal: 'Company legal name', legalPh: 'Acme Builders, Inc.', title: 'Your title', titlePh: 'CEO, COO…',
      sig: 'Signature', typeB: 'Type', drawB: 'Draw', typedPh: 'Type your full name', clear: 'Clear',
      consent: 'I have read this Agreement, I am authorized to sign on behalf of the company above, and I agree to sign electronically.',
      docNote: '',
      sendAcc: 'Sign NDA and request access', sendDem: 'Continue to pick a time',
      eFill: 'Please complete all fields.', eMail: 'Please enter a valid email.', eWork: 'Please use your work email.',
      ePhone: 'Please enter a phone number with its country code.', eSig: 'Please add your signature.', eCons: 'Please confirm you agree to sign electronically.',
      okAccT: 'Request received.', okAccP: 'We countersign the NDA and email your access to the guided tour of {d} to {e}.',
      save: 'Save a copy of the NDA (PDF)', done: 'Back to the demos',
      okDemT: 'Thanks, {n}. Now pick a time.', okDemP: 'Choose the slot that works for you for the {d} demo. We confirm it by WhatsApp at {p}.',
      pick: 'Pick a time', fict: 'Fictional data',
      cal: 'https://calendly.com/discoverycall-alejandro/demo-your-first-app'
    },
    es: {
      close: 'Cerrar',
      accK: 'Acceso al tour guiado', accT: 'Solicita acceso a esta demo',
      accP: 'Explora el tour guiado completo por tu cuenta. Deja tus datos y firma el NDA: las demos muestran nuestros diseños, por eso se abren bajo confidencialidad.',
      demK: 'Reunión de demo', demT: 'Solicita una demo de este sistema',
      demP: 'Te lo mostramos en una reunión de 30 minutos. Deja tus datos y elige un horario; confirmamos la reunión por WhatsApp.',
      you: 'Tus datos', first: 'Nombre', last: 'Apellidos', email: 'Correo corporativo', emailPh: 'tu@empresa.com',
      phone: 'Teléfono (WhatsApp)', phonePh: '+52 55 1234 5678',
      company: 'Tu empresa', legal: 'Razón social', legalPh: 'Constructora Ejemplo, S.A. de C.V.', title: 'Tu cargo', titlePh: 'Director general, COO…',
      sig: 'Firma', typeB: 'Escribir', drawB: 'Dibujar', typedPh: 'Escribe tu nombre completo', clear: 'Borrar',
      consent: 'Leí este Acuerdo, estoy autorizado para firmar en nombre de la empresa indicada y acepto firmar de forma electrónica.',
      docNote: 'El acuerdo se firma en inglés porque se rige por las leyes de Florida.',
      sendAcc: 'Firmar NDA y solicitar acceso', sendDem: 'Continuar para elegir horario',
      eFill: 'Completa todos los campos.', eMail: 'Escribe un correo válido.', eWork: 'Usa tu correo corporativo.',
      ePhone: 'Escribe un teléfono con su código de país.', eSig: 'Agrega tu firma.', eCons: 'Confirma que aceptas firmar de forma electrónica.',
      okAccT: 'Solicitud recibida.', okAccP: 'Contrafirmamos el NDA y enviamos tu acceso al tour guiado de {d} a {e}.',
      save: 'Guardar una copia del NDA (PDF)', done: 'Volver a las demos',
      okDemT: 'Gracias, {n}. Ahora elige un horario.', okDemP: 'Elige el horario que te funcione para la demo de {d}. Te la confirmamos por WhatsApp al {p}.',
      pick: 'Elegir horario', fict: 'Datos ficticios',
      cal: 'https://calendly.com/discoverycall-alejandro/demo-tu-primera-app'
    }
  }[LANG];

  var FREE = /@(gmail|googlemail|yahoo|ymail|hotmail|outlook|live|msn|icloud|me|mac|aol|proton|protonmail|pm|gmx|mail|yandex|zoho|tutanota|hey)\.[a-z.]+$/i;
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function fill(s, o){ return s.replace(/\{(\w)\}/g, function(_, k){ return o[k] == null ? '' : o[k]; }); }
  function send(rec){
    if (!LEAD_HOOK) { if (window.console) console.warn('[WT] Lead not sent: LEAD_HOOK is empty', rec); return; }
    try { fetch(LEAD_HOOK, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(rec), keepalive: true }); } catch (_) {}
  }

  /* ───────── Demo forms ───────── */
  function demoInfo(btn){
    var box = btn.closest('.demo-card, .demo-expand') || document;
    var img = box.querySelector('.demo-shot img'), t = function(sel){ var e = box.querySelector(sel); return e ? e.textContent.trim() : ''; };
    return { slug: btn.getAttribute('data-industry') || '', name: t('.demo-ind'), quote: t('.demo-quote'), spec: t('.demo-spec'), img: img ? img.getAttribute('src') : '' };
  }

  var M = null, lastFocus = null;
  function shell(kind, d){
    var head = '<div class="dfm-k"><span>' + esc(kind === 'access' ? TX.accK : TX.demK) + '</span><span>' + esc(d.name) + '</span></div>'
      + '<h3 id="dfmT">' + esc(kind === 'access' ? TX.accT : TX.demT) + '</h3><p class="dfm-lead">' + esc(kind === 'access' ? TX.accP : TX.demP) + '</p>';
    var card = '<div class="dfm-demo">' + (d.img ? '<img src="' + esc(d.img) + '" alt="" loading="lazy">' : '')
      + '<div><b>' + esc(d.name) + '</b>' + (d.quote ? '<q>' + esc(d.quote.replace(/^"|"$/g, '')) + '</q>' : '') + '<small>' + esc(d.spec) + ' · ' + esc(TX.fict) + '</small></div></div>';
    var you = '<div class="dfm-sec">' + esc(TX.you) + '</div>'
      + '<div class="dfm-2"><label>' + esc(TX.first) + '<input name="first" autocomplete="given-name" required></label><label>' + esc(TX.last) + '<input name="last" autocomplete="family-name" required></label></div>'
      + '<label>' + esc(TX.email) + '<input name="email" type="email" autocomplete="email" placeholder="' + esc(TX.emailPh) + '" required></label>';
    var form;
    if (kind === 'access') {
      form = you
        + '<div class="dfm-sec">' + esc(TX.company) + '</div>'
        + '<div class="dfm-2"><label>' + esc(TX.legal) + '<input name="company" autocomplete="organization" placeholder="' + esc(TX.legalPh) + '" required></label><label>' + esc(TX.title) + '<input name="title" autocomplete="organization-title" placeholder="' + esc(TX.titlePh) + '" required></label></div>'
        + '<div class="dfm-sec">' + esc(TX.sig) + '</div>'
        + '<div class="dfm-seg" role="group"><button type="button" data-sm="type" aria-pressed="true">' + esc(TX.typeB) + '</button><button type="button" data-sm="draw" aria-pressed="false">' + esc(TX.drawB) + '</button></div>'
        + '<div data-w="type"><input class="dfm-typed" name="typed" placeholder="' + esc(TX.typedPh) + '" aria-label="' + esc(TX.sig) + '"></div>'
        + '<div data-w="draw" class="dfm-padw" hidden><canvas class="dfm-pad" aria-label="' + esc(TX.sig) + '"></canvas><button type="button" class="dfm-clear">' + esc(TX.clear) + '</button></div>'
        + '<label class="dfm-ck"><input type="checkbox" name="consent"><span>' + esc(TX.consent) + '</span></label>'
        + '<p class="dfm-err" hidden></p><button type="submit" class="btn-primary dfm-go">' + esc(TX.sendAcc) + ' <i class="msi" data-i="arrow_forward"></i></button>';
      return '<div class="dfm-body">' + head + '<div class="dfm-grid dfm-grid-nda"><div class="dfm-left">' + card + '<div class="dfm-doc" tabindex="0" aria-label="NDA"></div>' + (TX.docNote ? '<p class="dfm-note">' + esc(TX.docNote) + '</p>' : '') + '</div><form class="dfm-form" novalidate>' + form + '</form></div></div>';
    }
    form = you
      + '<label>' + esc(TX.phone) + '<input name="phone" type="tel" autocomplete="tel" placeholder="' + esc(TX.phonePh) + '" required></label>'
      + '<p class="dfm-err" hidden></p><button type="submit" class="btn-primary dfm-go">' + esc(TX.sendDem) + ' <i class="msi" data-i="arrow_forward"></i></button>';
    return '<div class="dfm-body">' + head + '<div class="dfm-grid"><div class="dfm-left">' + card + '</div><form class="dfm-form" novalidate>' + form + '</form></div></div>';
  }

  function ndaHTML(v, sig, date){
    function f(x, ph){ return x ? '<span class="nf ok">' + esc(x) + '</span>' : '<span class="nf">' + ph + '</span>'; }
    var co = f(v.company, '[Company legal name]');
    return '<div class="nd-h"><b>WHATEVER TECH, LLC</b><br>848 Brickell Ave, Ste 950<br>Miami, FL</div>'
      + '<h4>Confidentiality Agreement</h4><div class="nd-sub">Demo Access</div>'
      + '<p>This Confidentiality Agreement (the “Agreement”) is dated ' + date + ', and is entered into by and between WHATEVER TECH, LLC, a Florida limited liability company with its address at 848 Brickell Ave, Ste 950, Miami, FL (the “Disclosing Party”), and ' + co + ' (the “Receiving Party”).</p>'
      + '<p>WHEREAS, the Receiving Party wishes to access and review the demonstration systems designed by the Disclosing Party, including the ' + f(v.demo, '[demo]') + ' demo (the “Demos”), for the limited purpose of evaluating whether to engage the Disclosing Party (the “Purpose”);</p>'
      + '<p>WHEREAS, the Demos contain the Disclosing Party’s proprietary designs, and the Disclosing Party is willing to grant such access only under the terms of this Agreement;</p>'
      + '<p>NOW, THEREFORE, in consideration of the access granted and the mutual covenants set forth herein, the parties agree as follows:</p>'
      + '<p><b>1. Confidential Information.</b> “Confidential Information” means the Demos and any information disclosed by or on behalf of the Disclosing Party in connection with the Purpose, including without limitation data structures, database designs, app screens and layouts, workflows, approval flows, automations, AI configurations, guided tours, documentation, pricing, methodologies and know-how. The data shown in the Demos is fictional; the designs are confidential.</p>'
      + '<p><b>2. Obligations.</b> Subject to Section 3, the Receiving Party shall:</p>'
      + '<p class="ind">(a) use the Confidential Information solely for the Purpose;<br>(b) not disclose it to any third party without the Disclosing Party’s prior written consent, except to its employees who need to know it for the Purpose and are bound by confidentiality obligations at least as protective as these, for whom the Receiving Party remains responsible;<br>(c) not copy, record, capture screenshots of, publish or share the Demos or any part of them;<br>(d) not reproduce, reverse engineer, imitate or create derivative works of the Demos, or use them to design, build or commission a similar system, by itself or through any third party; and<br>(e) protect the Confidential Information with at least a reasonable degree of care.</p>'
      + '<p><b>3. Exceptions.</b> The obligations in Section 2 shall not apply to information that: (a) is or becomes publicly available through no fault of the Receiving Party; (b) is lawfully received from a third party without an obligation of confidentiality; (c) was in the Receiving Party’s possession before its disclosure; (d) is independently developed without use of or reference to the Confidential Information; or (e) must be disclosed by law or legal process, provided that the Receiving Party, to the extent legally permitted, promptly notifies the Disclosing Party and discloses only what is legally required.</p>'
      + '<p><b>4. Term.</b> The obligations under Section 2 shall continue for three (3) years from the date of this Agreement.</p>'
      + '<p><b>5. Ownership; No License.</b> All Confidential Information, including the Demos and everything shown in them, is and shall remain the sole property of the Disclosing Party. This Agreement grants no license or right of any kind, by implication, estoppel or otherwise.</p>'
      + '<p><b>6. Access.</b> Access to the Demos is personal to the individual signing below, may not be shared, and may be limited or revoked by the Disclosing Party at any time.</p>'
      + '<p><b>7. No Obligation to Contract.</b> Nothing in this Agreement obligates either party to enter into any further agreement or to provide or purchase any services.</p>'
      + '<p><b>8. Return or Destruction.</b> Upon the Disclosing Party’s request, the Receiving Party shall promptly destroy any materials containing Confidential Information and confirm it in writing.</p>'
      + '<p><b>9. Remedies.</b> The Receiving Party acknowledges that a breach of this Agreement may cause the Disclosing Party irreparable harm, and that the Disclosing Party shall be entitled to seek injunctive relief in addition to any other remedy available at law or in equity.</p>'
      + '<p><b>10. Entire Agreement; Electronic Signatures.</b> This Agreement is the entire agreement of the parties on its subject and may be amended only in writing. It may be executed in counterparts and signed electronically, including under the U.S. ESIGN Act and the Florida Uniform Electronic Transaction Act.</p>'
      + '<p><b>11. Governing Law; Jurisdiction.</b> This Agreement shall be governed by the laws of the State of Florida, without regard to its conflict of laws principles. Any action arising in connection with it shall be brought in the federal or state courts located in Miami-Dade County, Florida.</p>'
      + '<p><b>12. WAIVER OF JURY TRIAL.</b> IN ANY ACTION ARISING HEREUNDER, THE PARTIES CONSENT TO TRIAL WITHOUT A JURY.</p>'
      + '<div class="nd-sig"><div><div class="nd-k">Receiving Party</div><div class="nd-line">' + (sig ? '<img src="' + sig + '" alt="Signature">' : '') + '</div>By: ' + f(v.name, '[Full name]') + '<br>Title: ' + f(v.title, '[Title]') + '<br>Company: ' + co + '<br>Email: ' + f(v.email, '[Work email]') + '<br>Date: ' + date + '</div>'
      + '<div><div class="nd-k">Whatever Tech, LLC</div><div class="nd-line nd-pend">Countersignature on receipt</div>By: Alejandro Panizo<br>Title: Managing Director<br>Date: ' + date + '</div></div>';
  }

  function icons(root){
    var P = { arrow_forward: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>' };
    [].forEach.call(root.querySelectorAll('.msi[data-i]'), function(el){ var p = P[el.getAttribute('data-i')]; if (p && !el.firstChild) el.innerHTML = '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; });
  }

  function close(){
    if (!M) return;
    M.remove(); M = null;
    document.documentElement.classList.remove('dfm-lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function open(kind, btn){
    close();
    lastFocus = btn;
    var d = demoInfo(btn), now = new Date(), DATE = MONTHS[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear();
    M = document.createElement('div');
    M.className = 'dfm' + (kind === 'access' ? ' dfm-wide' : '');
    M.innerHTML = '<div class="dfm-scrim" data-x></div><div class="dfm-card" role="dialog" aria-modal="true" aria-labelledby="dfmT"><button type="button" class="dfm-x" data-x aria-label="' + esc(TX.close) + '">×</button>' + shell(kind, d) + '<div class="dfm-ok" hidden></div></div>';
    document.body.appendChild(M);
    document.documentElement.classList.add('dfm-lock');
    icons(M);
    var F = M.querySelector('.dfm-form'), err = M.querySelector('.dfm-err');
    M.addEventListener('click', function(e){ if (e.target.closest('[data-x]')) close(); });
    setTimeout(function(){ F.first.focus(); }, 30);

    var sig = '', doc = M.querySelector('.dfm-doc');
    function vals(){ return { company: F.company ? F.company.value.trim() : '', title: F.title ? F.title.value.trim() : '', name: (F.first.value.trim() + ' ' + F.last.value.trim()).trim(), email: F.email.value.trim(), demo: d.name }; }
    function draw(){ if (doc) doc.innerHTML = ndaHTML(vals(), sig, DATE); }

    if (kind === 'access') {
      var cv = M.querySelector('.dfm-pad'), cx = cv.getContext('2d'), typed = F.typed, mode = 'type', drew = false, down = false;
      var sizePad = function(){ var r = cv.getBoundingClientRect(), k = window.devicePixelRatio || 1; cv.width = r.width * k; cv.height = r.height * k; cx.setTransform(k, 0, 0, k, 0, 0); cx.lineWidth = 2.2; cx.lineCap = 'round'; cx.lineJoin = 'round'; cx.strokeStyle = '#0d0d10'; drew = false; };
      var pt = function(e){ var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
      var typedSig = function(){ var t = typed.value.trim(); if (!t) return ''; var c = document.createElement('canvas'); c.width = 900; c.height = 180; var k = c.getContext('2d'); k.fillStyle = '#0d0d10'; k.font = 'italic 600 76px "Brush Script MT","Segoe Script","Snell Roundhand",cursive'; k.textBaseline = 'middle'; k.fillText(t, 20, 95, 860); return c.toDataURL('image/png'); };
      var makeSig = function(){ sig = mode === 'type' ? typedSig() : (drew ? cv.toDataURL('image/png') : ''); draw(); };
      cv.addEventListener('pointerdown', function(e){ down = true; cv.setPointerCapture(e.pointerId); var p = pt(e); cx.beginPath(); cx.moveTo(p[0], p[1]); });
      cv.addEventListener('pointermove', function(e){ if (!down) return; var p = pt(e); cx.lineTo(p[0], p[1]); cx.stroke(); drew = true; });
      ['pointerup', 'pointercancel'].forEach(function(t){ cv.addEventListener(t, function(){ if (down) { down = false; makeSig(); } }); });
      M.querySelector('.dfm-clear').addEventListener('click', function(){ cx.clearRect(0, 0, cv.width, cv.height); drew = false; makeSig(); });
      [].forEach.call(M.querySelectorAll('[data-sm]'), function(b){ b.addEventListener('click', function(){
        mode = b.getAttribute('data-sm');
        [].forEach.call(M.querySelectorAll('[data-sm]'), function(x){ x.setAttribute('aria-pressed', String(x === b)); });
        M.querySelector('[data-w="type"]').hidden = mode !== 'type'; M.querySelector('[data-w="draw"]').hidden = mode !== 'draw';
        if (mode === 'draw') sizePad();
        makeSig();
      }); });
      typed.addEventListener('keydown', function(){ typed.setAttribute('data-touched', '1'); });
      F.addEventListener('input', function(e){
        if ((e.target.name === 'first' || e.target.name === 'last') && !typed.getAttribute('data-touched')) { typed.value = (F.first.value + ' ' + F.last.value).trim(); }
        if (e.target === typed || e.target.name === 'first' || e.target.name === 'last') makeSig(); else draw();
      });
      draw();
    }

    F.addEventListener('submit', function(e){
      e.preventDefault();
      var need = kind === 'access' ? ['first', 'last', 'email', 'company', 'title'] : ['first', 'last', 'email', 'phone'];
      var miss = need.some(function(n){ return !F[n].value.trim(); }), em = F.email.value.trim(), msg = '';
      if (miss) msg = TX.eFill;
      else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) msg = TX.eMail;
      else if (FREE.test(em)) msg = TX.eWork;
      else if (kind === 'demo' && F.phone.value.replace(/\D/g, '').length < 8) msg = TX.ePhone;
      else if (kind === 'access' && !sig) msg = TX.eSig;
      else if (kind === 'access' && !F.consent.checked) msg = TX.eCons;
      if (msg) { err.hidden = false; err.textContent = msg; return; }
      err.hidden = true;

      var first = F.first.value.trim(), last = F.last.value.trim();
      var rec = { type: kind, lang: LANG, industry: d.slug, industryName: d.name, firstName: first, lastName: last, email: em, page: location.href, submittedAt: new Date().toISOString() };
      var ok = M.querySelector('.dfm-ok');
      if (kind === 'access') {
        rec.company = F.company.value.trim(); rec.title = F.title.value.trim();
        rec.nda = { date: DATE, signedAt: rec.submittedAt, signature: sig, agreementHTML: ndaHTML(vals(), sig, DATE), userAgent: navigator.userAgent };
        send(rec);
        ok.innerHTML = '<div class="dfm-ck-i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><h3>' + esc(TX.okAccT) + '</h3><p>' + fill(esc(TX.okAccP), { d: esc(d.name), e: esc(em) }) + '</p>'
          + '<div class="dfm-ok-a"><button type="button" class="btn-ghost" data-print>' + esc(TX.save) + '</button><button type="button" class="btn-primary" data-x>' + esc(TX.done) + '</button></div>';
        ok.querySelector('[data-print]').addEventListener('click', function(){
          var w = window.open('', '_blank'); if (!w) return;
          w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>NDA · ' + esc(rec.company) + ' · Whatever Tech</title><style>body{font:14px/1.55 Georgia,serif;color:#111;max-width:720px;margin:40px auto;padding:0 24px}h4{font-size:20px;text-align:center;margin:24px 0 2px;text-transform:uppercase;letter-spacing:.05em}.nd-sub{text-align:center;margin-bottom:22px}.nd-h{text-align:center;font-size:12px;letter-spacing:.06em}.ind{padding-left:22px}.nd-sig{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:30px}.nd-k{font-weight:700;text-transform:uppercase;font-size:12px;margin-bottom:8px}.nd-line{height:64px;border-bottom:1px solid #111;margin-bottom:8px;display:flex;align-items:flex-end}.nd-line img{max-height:60px;max-width:100%}.nd-pend{font-size:11px;color:#777}.audit{margin-top:36px;font:11px/1.5 monospace;color:#555;border-top:1px solid #ccc;padding-top:10px}</style></head><body>' + rec.nda.agreementHTML + '<div class="audit">Electronically signed by ' + esc(first + ' ' + last) + ' (' + esc(em) + ') on ' + rec.nda.signedAt + '</div><script>onload=function(){print()}<\/script></body></html>');
          w.document.close();
        });
      } else {
        rec.phone = F.phone.value.trim();
        send(rec);
        var url = TX.cal + '?name=' + encodeURIComponent(first + ' ' + last) + '&email=' + encodeURIComponent(em)
          + '&utm_source=landing&utm_medium=demos&utm_content=' + encodeURIComponent('industry=' + d.slug);
        ok.innerHTML = '<div class="dfm-ck-i"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div><h3>' + fill(esc(TX.okDemT), { n: esc(first) }) + '</h3><p>' + fill(esc(TX.okDemP), { d: esc(d.name), p: esc(rec.phone) }) + '</p>'
          + '<div class="dfm-ok-a"><a class="btn-primary" href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(TX.pick) + ' <i class="msi" data-i="arrow_forward"></i></a></div>';
        icons(ok);
      }
      M.querySelector('.dfm-body').hidden = true; ok.hidden = false;
      var f = ok.querySelector('a, button'); if (f) f.focus();
    });
  }

  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('[data-form]');
    if (!b) return;
    e.preventDefault();
    open(b.getAttribute('data-form') === 'access' ? 'access' : 'demo', b);
  });
  document.addEventListener('keydown', function(e){
    if (!M) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    var f = [].filter.call(M.querySelectorAll('button, a[href], input, textarea, [tabindex="0"]'), function(x){ return x.offsetParent !== null && !x.disabled; });
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });

  /* ───────── The problem · Ask Claude ───────── */
  (function(){
    var root = document.querySelector('.ask'); if (!root) return;
    var list = root.querySelector('.ask-list'), stage = root.querySelector('.ask-stage'), chips = root.querySelector('.ask-chips');
    if (!list || !stage || !chips) return;
    var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var P = [].map.call(list.querySelectorAll('li'), function(li){ return { q: li.querySelector('.ask-q').textContent, a: li.querySelector('.ask-a').textContent }; });
    if (!P.length) return;
    root.classList.add('is-live');
    chips.innerHTML = P.map(function(p, i){ return '<button type="button" data-i="' + i + '">' + esc(p.q) + '</button>'; }).join('');
    var SPARK = '<svg viewBox="0 0 24 24" fill="none" stroke="#d97757" stroke-width="1.35" stroke-linecap="round"><line x1="13.60" y1="12.00" x2="22.20" y2="12.00" style="animation-delay:0.00s"/><line x1="13.37" y1="12.82" x2="19.20" y2="16.33" style="animation-delay:0.07s"/><line x1="12.85" y1="13.36" x2="17.09" y2="20.14" style="animation-delay:0.14s"/><line x1="11.94" y1="13.60" x2="11.73" y2="19.60" style="animation-delay:0.21s"/><line x1="11.18" y1="13.37" x2="6.85" y2="20.57" style="animation-delay:0.28s"/><line x1="10.63" y1="12.82" x2="4.97" y2="16.22" style="animation-delay:0.35s"/><line x1="10.40" y1="11.92" x2="2.11" y2="11.48" style="animation-delay:0.42s"/><line x1="10.63" y1="11.18" x2="4.63" y2="7.57" style="animation-delay:0.49s"/><line x1="11.18" y1="10.63" x2="7.21" y2="4.03" style="animation-delay:0.56s"/><line x1="12.06" y1="10.40" x2="12.28" y2="4.10" style="animation-delay:0.63s"/><line x1="12.78" y1="10.60" x2="16.99" y2="2.99" style="animation-delay:0.70s"/><line x1="13.40" y1="11.22" x2="19.70" y2="7.73" style="animation-delay:0.77s"/></svg>';
    var cur = -1, timers = [], vis = false, held = 0;
    function clear(){ timers.forEach(clearTimeout); timers = []; }
    function later(fn, ms){ timers.push(setTimeout(fn, ms)); }
    function show(i){
      clear(); cur = i;
      [].forEach.call(chips.children, function(c, k){ c.setAttribute('aria-pressed', String(k === i)); });
      var p = P[i];
      stage.innerHTML = '<div class="ask-msg ask-me"><p></p></div><div class="ask-msg ask-ai"><span class="ask-spark is-writing" aria-hidden="true">' + SPARK + '</span><p></p></div>';
      var me = stage.querySelector('.ask-me p'), ai = stage.querySelector('.ask-ai p'), spark = stage.querySelector('.ask-spark');
      me.textContent = p.q;
      if (RM) { ai.textContent = p.a; spark.classList.remove('is-writing'); return; }
      later(function(){
        var n = 0;
        (function type(){
          n = Math.min(p.a.length, n + 2);
          ai.textContent = p.a.slice(0, n);
          if (n < p.a.length) later(type, 16);
          else { spark.classList.remove('is-writing'); later(function next(){ if (vis && Date.now() > held) show((cur + 1) % P.length); else later(next, 800); }, 3600); }
        })();
      }, 900);
    }
    chips.addEventListener('click', function(e){ var b = e.target.closest('button'); if (!b) return; held = Date.now() + 9000; show(+b.getAttribute('data-i')); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function(es){ vis = es[0].isIntersecting; if (vis && cur < 0) show(0); }, { threshold: 0.35 }).observe(root);
    } else { vis = true; show(0); }
  })();
})();
