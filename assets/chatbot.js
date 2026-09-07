/*
 * Bhishma Constructions — lead-qualifying chat widget.
 *
 * Scripted, not generative: it runs a fixed decision tree, so it needs no API
 * key, costs nothing per conversation, and can never invent a price or a
 * promise the business has to honour. Every path ends by collecting a phone
 * number and handing the lead to the same pipeline as the contact form
 * (window.BhishmaLead.send), then offering a direct WhatsApp handoff.
 *
 * To upgrade to an LLM later, replace `answer()` with a fetch to your endpoint
 * and keep the same `push()` / `choices()` rendering calls.
 */
(function () {
  'use strict';

  var PHONE = '+919849512345';
  var WA = '919849512345';

  var toggle = document.getElementById('chat-toggle');
  var panel = document.getElementById('chat-panel');
  var closeBtn = document.getElementById('chat-close');
  var log = document.getElementById('chat-log');
  var choicesEl = document.getElementById('chat-choices');
  var form = document.getElementById('chat-form');
  var input = document.getElementById('chat-text');
  if (!toggle || !panel) return;

  var lead = { source: 'chatbot', page: location.pathname.split('/').pop() || 'index.html' };
  var started = false;

  /* ---------- rendering ---------- */
  function push(who, html) {
    var el = document.createElement('div');
    el.className = 'msg ' + who;
    el.innerHTML = html;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function typing(then, delay) {
    var el = push('bot', '<span class="typing"><span></span><span></span><span></span></span>');
    setTimeout(function () { el.remove(); then(); }, delay || 620);
  }

  function choices(list) {
    choicesEl.innerHTML = '';
    list.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = c.label;
      b.addEventListener('click', function () {
        push('me', c.label);
        choicesEl.innerHTML = '';
        c.go();
      });
      choicesEl.appendChild(b);
    });
  }

  function ask(prompt, key, next) {
    choicesEl.innerHTML = '';
    form.hidden = false;
    input.value = '';
    input.placeholder = prompt;
    form.onsubmit = function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!v) return;
      push('me', esc(v));
      lead[key] = v;
      form.hidden = true;
      input.value = '';
      next();
    };
    input.focus();
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---------- conversation ---------- */
  function start() {
    push('bot', 'Namaskaram 🙏 I can give you a ballpark cost and get an engineer out to your plot. What are you planning?');
    choices([
      { label: 'Build a house on my plot', go: function () { intent('Turnkey home construction'); } },
      { label: 'Buy a flat', go: function () { intent('Apartment purchase'); } },
      { label: 'Build a villa', go: function () { intent('Independent villa'); } },
      { label: 'Commercial space', go: function () { intent('Commercial / retail'); } },
      { label: 'Interiors / renovation', go: function () { intent('Interiors & renovation'); } },
      { label: 'Just a question', go: askQuestion }
    ]);
  }

  function intent(what) {
    lead.service = what;
    typing(function () {
      if (what === 'Apartment purchase') {
        push('bot', 'We have RERA-registered 2BHK and 3BHK homes on Amaravati Road, Gorantla and Nallapadu, currently <strong>₹42–58 lakh</strong> depending on project, floor and facing.');
        typing(function () {
          push('bot', 'Which budget range should I note down?');
          choices([
            { label: 'Under ₹45 lakh', go: function () { budget('Under ₹45L'); } },
            { label: '₹45–55 lakh', go: function () { budget('₹45–55L'); } },
            { label: 'Above ₹55 lakh', go: function () { budget('Above ₹55L'); } }
          ]);
        }, 700);
      } else if (what === 'Interiors & renovation') {
        push('bot', 'Interiors typically run <strong>₹1.8–6 lakh per room</strong> depending on scope and finish, and most jobs finish in about 45 working days.');
        typing(function () { askArea('How many rooms, roughly? (e.g. "3 bedrooms + kitchen")'); }, 700);
      } else {
        var rate = what === 'Independent villa' ? '₹2,100–2,900' :
                   what === 'Commercial / retail' ? '₹1,950–2,600' : '₹1,850–2,400';
        push('bot', 'Good — that runs <strong>' + rate + ' per sq.ft.</strong> with us, all-inclusive, and the rate is locked in writing before we break ground.');
        typing(function () { askArea('Roughly how many sq.ft. or what plot size? (e.g. "300 sq.yd")'); }, 700);
      }
    });
  }

  function budget(b) {
    lead.budget = b;
    typing(function () { askLocality(); });
  }

  function askArea(prompt) {
    ask(prompt, 'size', function () {
      typing(askLocality);
    });
  }

  function askLocality() {
    push('bot', 'Which area is it in?');
    choices([
      { label: 'Guntur city', go: function () { locality('Guntur city'); } },
      { label: 'Gorantla', go: function () { locality('Gorantla'); } },
      { label: 'Nallapadu', go: function () { locality('Nallapadu'); } },
      { label: 'Amaravati Road', go: function () { locality('Amaravati Road'); } },
      { label: 'Mangalagiri / Tenali', go: function () { locality('Mangalagiri / Tenali'); } },
      { label: 'Somewhere else', go: function () { locality('Other'); } }
    ]);
  }

  function locality(l) {
    lead.locality = l;
    typing(function () {
      push('bot', 'Noted. What name should the engineer ask for?');
      ask('Your name', 'name', function () {
        typing(function () {
          push('bot', 'And a phone number we can reach you on? We usually call before we visit.');
          ask('Phone number', 'phone', finish);
        });
      });
    });
  }

  function askQuestion() {
    lead.service = 'General enquiry';
    ask('Type your question…', 'message', function () {
      typing(function () {
        push('bot', 'Thanks — I have passed that to the office. Leave a number and we will call you back with a proper answer rather than guess here.');
        ask('Your name', 'name', function () {
          ask('Phone number', 'phone', finish);
        });
      });
    });
  }

  function finish() {
    typing(function () {
      var ok = window.BhishmaLead && window.BhishmaLead.send(lead);
      push('bot', 'Done, ' + esc((lead.name || '').split(' ')[0]) + '. Our engineer will call you within 2 hours — usually sooner.');
      typing(function () {
        var summary = [lead.service, lead.size, lead.budget, lead.locality].filter(Boolean).join(' · ');
        var wa = 'https://wa.me/' + WA + '?text=' +
          encodeURIComponent('Hi Bhishma Constructions, I enquired on your website. ' + summary +
            '. My name is ' + (lead.name || '') + '.');
        push('bot', 'Want it faster? <a href="' + wa + '" target="_blank" rel="noopener">Message us on WhatsApp</a> or call <a href="tel:' + PHONE + '">' + PHONE + '</a> directly.');
        choices([{ label: 'Start over', go: reset }]);
        if (ok === false) {
          push('bot', '<em>Note: the lead pipeline is not configured on this deployment, so please use WhatsApp or the phone number above.</em>');
        }
      }, 800);
    });
  }

  function reset() {
    lead = { source: 'chatbot', page: lead.page };
    log.innerHTML = '';
    form.hidden = true;
    start();
  }

  /* ---------- open / close ---------- */
  function open() {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.querySelector('i').className = 'fa-solid fa-xmark';
    if (!started) { started = true; start(); }
  }
  function close() {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('i').className = 'fa-solid fa-comment-dots';
  }

  toggle.addEventListener('click', function () {
    if (panel.hidden) open(); else close();
  });
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) close();
  });
})();
