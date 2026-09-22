document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  const themeToggle = document.getElementById('theme-toggle');
  const themeToggleMobile = document.getElementById('theme-toggle-mobile');

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  }

  themeToggle.addEventListener('click', toggleTheme);
  themeToggleMobile.addEventListener('click', toggleTheme);

  // Calendly inline widget — initialized manually (rather than via its
  // auto-scanning class/data-url) so the calendar's own colors can match
  // whichever theme is active on first load. window.Calendly isn't
  // guaranteed to exist the instant this handler runs (ad blockers and
  // privacy extensions commonly block calendly.com's script outright, and
  // even when it loads, its own internal setup can land after
  // DOMContentLoaded) — so this polls briefly instead of checking once,
  // and falls back to a plain link rather than leaving the loading
  // spinner stuck on-screen forever if Calendly never becomes available.
  const calendlyEmbed = document.getElementById('calendlyEmbed');
  const calendlyUrl = 'https://calendly.com/reymarcalmaden704/30min';

  function tryInitCalendly(attemptsLeft) {
    if (!calendlyEmbed) return;
    if (window.Calendly) {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const colors = isDark
        ? { bg: '0f0f0f', text: 'f5f5f4', primary: 'a78bfa' }
        : { bg: 'fafaf9', text: '1a1a1a', primary: '7c3aed' };
      calendlyEmbed.innerHTML = '';
      Calendly.initInlineWidget({
        url: `${calendlyUrl}?primary_color=${colors.primary}&text_color=${colors.text}&background_color=${colors.bg}&hide_gdpr_banner=1`,
        parentElement: calendlyEmbed
      });
      return;
    }
    if (attemptsLeft > 0) {
      setTimeout(() => tryInitCalendly(attemptsLeft - 1), 200);
      return;
    }
    // Gave up after ~8 seconds — show a direct link instead of a dead spinner.
    calendlyEmbed.innerHTML = `
      <div class="calendly-fallback">
        <p>The live calendar didn't load. This can happen with an ad blocker or privacy extension active.</p>
        <a href="${calendlyUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Open the booking calendar</a>
      </div>
    `;
  }

  if (calendlyEmbed) {
    tryInitCalendly(40);
  }

  // Rotating roles animation
  const roles = document.querySelectorAll('.role-text');
  let currentRoleIndex = 0;

  function rotateRoles() {
    roles[currentRoleIndex].classList.remove('active');
    currentRoleIndex = (currentRoleIndex + 1) % roles.length;
    roles[currentRoleIndex].classList.add('active');
  }

  if (roles.length > 1) {
    setInterval(rotateRoles, 3000);
  }

  // Expand/collapse the deep half of the project modal.
  const detailMoreBtn = document.getElementById('projectDetailMoreBtn');
  const detailDeep = document.getElementById('projectDetailDeep');

  if (detailMoreBtn && detailDeep) {
    detailMoreBtn.addEventListener('click', event => {
      event.stopPropagation();
      const open = detailDeep.hidden;
      detailDeep.hidden = !open;
      detailMoreBtn.setAttribute('aria-expanded', String(open));
      document.getElementById('projectDetailMoreLabel').textContent =
        open ? 'Hide the technical detail' : 'Show the technical detail';
    });
  }

  // Platform filter for the projects grid. Cards carry data-platforms
  // (space separated), so a project on both stacks matches either filter.
  const filterButtons = document.querySelectorAll('.project-filter');
  const filterCards = document.querySelectorAll('.project-card[data-platforms]');

  if (filterButtons.length && filterCards.length) {
    const applyFilter = wanted => {
      filterButtons.forEach(b => {
        const on = b.dataset.filter === wanted;
        b.classList.toggle('active', on);
        b.setAttribute('aria-pressed', String(on));
      });

      filterCards.forEach(card => {
        const show = (card.dataset.platforms || '').split(' ').includes(wanted);
        card.hidden = !show;
        // Cards revealed while hidden never got the observer's class.
        if (show) card.classList.add('active');
      });
    };

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
    });

    // Match the markup's default rather than assuming one.
    const initial = document.querySelector('.project-filter.active');
    if (initial) applyFilter(initial.dataset.filter);
  }

  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const spans = navToggle.querySelectorAll('span');
    if (navMenu.classList.contains('active')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      const spans = navToggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });

  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('active');
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerOffset = 72;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Animated counters
  const counters = document.querySelectorAll('.stats-row .stat-number[data-target]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
          current += increment;
          if (current < target) {
            counter.textContent = Math.ceil(current);
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target;
          }
        };

        updateCounter();
        counterObserver.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));

  // Close modals with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Close certifications grid lightbox — if it's open, close only that
      // and leave the project detail modal (if any) open underneath it.
      const certGridLightbox = document.getElementById('certGridLightbox');
      if (certGridLightbox && certGridLightbox.classList.contains('active')) {
        certGridLightbox.classList.remove('active');
        const certGridLightboxImage = document.getElementById('certGridLightboxImage');
        if (certGridLightboxImage) certGridLightboxImage.src = '';

        const projectDetailModalOpen = document.getElementById('projectDetailModal');
        if (!projectDetailModalOpen || !projectDetailModalOpen.classList.contains('active')) {
          document.body.style.overflow = '';
        }
        return;
      }

      // Also close project detail modal
      const projectDetailModal = document.getElementById('projectDetailModal');
      if (projectDetailModal && projectDetailModal.classList.contains('active')) {
        projectDetailModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });

  // Project Detail Modal
  const projectDetails = [
    {
      number: 'PROJECT 01',
      category: 'Voice AI Call Routing',
      platform: 'n8n + VAPI + GHL',
      title: 'Urgent Care Voice Receptionist for Call Routing',
      description: "A demo of a voice assistant for an urgent care clinic. Maya answers the phone, looks up the caller, works out which department they need from how they describe the problem, and either transfers them or files a callback task for a real person in the CRM. Every routing decision is recorded so it can be checked afterwards.",
      tags: ['n8n', 'VAPI', 'Groq', 'Google Sheets', 'GoHighLevel'],
      image: 'assets/projects/northshore-receptionist.png',
      caseStudy: {
        client: 'Demo build: urgent care clinic',
        situation: "An urgent care front desk answers the same handful of calls all day: billing, test results, wait times, occupational health, and now and then someone who needs a nurse. Every call arrives on one line, and someone has to work out in seconds where it should go.",
        breaking: "A phone menu makes callers press through options that never quite fit. An answering service cannot see who is calling or judge what is urgent. And afterwards, there is no way to check whether a call went to the right place.",
        built: "A voice assistant called Maya that answers the phone, works out which department the caller needs from what they say, and transfers them if that department is open. If she cannot, a callback task goes to a real person in the CRM. Every routing decision is recorded so you can check it afterwards.",
        changed: "Callers reach the right department without pressing through a menu, and anything that cannot be transferred lands with a named person instead of in a message queue. In browser test calls, billing, triage and occupational health calls were routed correctly, checked against the recorded decisions. Two departments are untested, and a browser call cannot prove the handover itself.",
        learned: "For a while, every step of the system reported success while every call was quietly going to the front desk. A small error made it look like it was working when it was not. A workflow can look healthy and still be wrong, so next time I would check the actual outputs from the start rather than trusting that each step ran.",
        technical: "Built on VAPI with a single n8n workflow behind it. One webhook receives every VAPI event, checks a shared secret, and fans out on message type into three branches. A tool call looks the patient up in Google Sheets and builds a context object the assistant can speak from. A transfer request reconstructs the transcript from VAPI's message array, classifies it with Groq, looks the result up in a department routing sheet, and approves or declines the transfer against opening hours. The end-of-call report logs the call and decides whether it needs escalating. Anything that cannot be transferred becomes a contact and a task in GoHighLevel. Every routing decision is written to a Routing_Decisions sheet with the classification that produced it, which is what makes the system auditable rather than merely functional. Routing was confirmed correct on VAPI browser calls across billing, triage and occupational health, verified in the Routing_Decisions sheet by checking the workflow's own classification against the department the assistant announced. Getting there meant finding a bug that every green node in n8n was hiding: a doubled leading character in one request body made the Groq classifier fail on every call, and a safe fallback quietly sent all of them to the front desk. The earlier fix had been confirmed against a hand-written test payload of the wrong shape, since real transfer events carry no flat transcript field, only an array of messages. Two departments (wait times and results) remain untested, and the transfer bridge itself cannot be proven from a browser call."
      },
      stats: [
        { n: '3', l: 'Event types' },
        { n: '3', l: 'Departments proven live' },
        { n: '28', l: 'Nodes' },
        { n: '5', l: 'Integrations' }
      ],
      concept: {
        title: 'Every node was green while every call was misrouted',
        lead: "One request body had a doubled leading character, so the classifier rejected every call it was sent. The code downstream caught the failure and fell back to the front desk, which is exactly what a careful fallback is supposed to do. The result was a system with a one hundred percent failure rate, reporting success at every step, for an unknown length of time. Nothing was red. Nothing was logged. The calls simply all went to the wrong place.",
        chain: [
          { label: 'Classifier rejects the call' },
          { label: 'Fallback catches it' },
          { label: 'Routes to front desk' },
          { label: 'Node shows green' },
          { label: 'Nobody finds out', kind: 'term' }
        ],
        notes: [
          { label: 'The lesson is visibility, not the fallback', text: 'The fallback was correct: losing a call is worse than misrouting one. What was missing is that it fired silently. A fallback with no counter, flag or logged reason behind it will eventually hide a total failure behind a working interface, and the longer it works the less anyone thinks to check it.' },
          { label: 'A synthetic payload proves only your assumption', text: 'The first fix looked confirmed because it was tested against a payload written by hand. The real transfer events had a different shape (no flat transcript at all, only an array of messages), so the classifier had been receiving an empty string every time. The test proved the code handled the shape it was given, and nothing more. Real payloads get captured first now.' },
          { label: 'The tool cannot carry the answer', text: "VAPI's built-in transfer tool has no custom parameter schema, so the assistant can never pass the department as an argument no matter how the prompt is worded. The arguments always arrive empty. Routing rests entirely on the workflow's own reading of the transcript. That makes the transcript reconstruction load-bearing rather than a nicety." }
        ]
      },
      stagesTitle: 'One Webhook, Three Event Types',
      stages: [
        {
          marker: '01', title: 'Authenticate and Fan Out',
          desc: 'Every VAPI event hits the same webhook. The payload is parsed, a shared secret checked, and the call routed on its message type, with an unauthorized response and a fallback branch both wired, so a bad secret or an unexpected event type still gets an answer instead of dead air.',
          tags: [{ label: 'Webhook', kind: 'hook' }, { label: 'Shared secret', kind: 'human' }, { label: 'Switch · 3 types' }],
          flow: 'one entry point · auth before anything else'
        },
        {
          marker: '02', title: 'Patient Lookup',
          desc: 'A tool call from the assistant mid-conversation. Reads the patient sheet, builds a context object the assistant can speak from, responds, and appends the lookup to a log. Matching by phone only works on a real phone call. On a browser test there is no caller ID to match on at all.',
          tags: [{ label: 'Google Sheets', kind: 'sched' }, { label: 'Context build' }, { label: 'Logged' }],
          flow: 'tool call → sheet lookup → context → spoken answer'
        },
        {
          marker: '03', title: 'Department Routing',
          desc: "The decision the whole system exists for. Reconstructs the transcript from VAPI's message array, sends it to Groq for classification, looks the result up in a department routing sheet, and checks the transfer against opening hours before approving or declining it. Both outcomes are written to the routing log with the classification that produced them.",
          tags: [{ label: 'Groq classify', kind: 'ai' }, { label: 'Routing sheet', kind: 'sched' }, { label: 'Hours check', kind: 'human' }],
          flow: 'transcript → classification → routing rules → approve or decline'
        },
        {
          marker: '04', title: 'End of Call, Escalation and CRM',
          desc: 'Fires once the call is over. Extracts the report, logs it, and decides whether it needs escalating: an internal notification if so. If a callback number was captured, the caller is upserted into GoHighLevel and a task created against them, so the follow-up is owned rather than queued.',
          tags: [{ label: 'GHL contact + task' }, { label: 'Escalation branch', kind: 'human' }, { label: 'Gmail notify' }],
          flow: 'report → log → escalate if needed → CRM contact and task'
        }
      ],
      decisions: [
        {
          title: 'The routing decision lives in the automation, not the prompt',
          text: 'The assistant could have been told which department to pick. Instead it talks, and the workflow decides what the conversation meant: classification, opening hours, and per-department rules all sit in logic that can be read and tested. It also turned out to be the only option available: the transfer tool cannot carry a department argument at all.',
          cost: 'a network round trip mid-call, and a classifier that has to be right'
        },
        {
          title: 'A silent fallback needs its own visibility',
          text: 'The fallback that hid the misrouting bug was not removed. It is still the right behaviour. What changed is that the routing decision and the classification behind it are now written to their own sheet on every call, so a fallback firing repeatedly is something you can see rather than something you have to suspect.',
          cost: 'a log row per call, and a habit of actually reading it'
        },
        {
          title: 'The spoken callback number beats caller ID',
          text: "There are two numbers for a caller and they are not the same thing: the one telephony reports, and the one the caller says out loud. The spoken number works even on a browser call, and respects a caller who asks to be reached somewhere else, so it takes priority when writing to the CRM.",
          cost: 'a returning caller who gives a different number can end up as more than one contact'
        },
        {
          title: 'The emergency check had to be made silent, explicitly',
          text: 'An instruction to screen for emergencies was read by the assistant as a script to perform out loud. A caller ringing about a bill was told to hang up and dial emergency services. Saying "run this check" is not enough; the instruction has to state that the list is never spoken, and that a caller asking about a bill must never hear the word at all.',
          cost: 'prompt rules that read as oddly emphatic until you know what they are preventing'
        }
      ],
      status: [
        {
          kind: 'ok', title: 'Proven on real calls',
          items: [
            'Routing confirmed correct on live VAPI calls for billing, triage and occupational health: checked in the routing log, not just heard on the call',
            'Transcript reconstruction from the message array, after the flat transcript field turned out never to exist on transfer events',
            'Structured outputs used to capture caller name, callback number and reason, working around a call summary this VAPI version never populates'
          ]
        },
        {
          kind: 'warn', title: 'Not yet retested',
          items: [
            'CRM contact and task fixes, plus the callback-number guard, are live in the workflow but have not been re-run on a real call',
            'Two departments (wait times and results) have never been tested at all',
            'No error workflow attached yet, so a failure outside the handled branches surfaces nowhere'
          ]
        },
        {
          kind: 'stop', title: 'What a browser call cannot prove',
          items: [
            'There is no phone leg, so a correctly approved transfer still ends in a transfer failure every time. The bridge itself is unprovable from a browser',
            'There is no caller ID, so the patient sheet lookup can never match on phone from a test call',
            'Sample clinic and synthetic patient data: a working model of the process, not a compliant deployment'
          ]
        }
      ]
    },
    {
      number: 'PROJECT 02',
      category: 'Voice AI Receptionist',
      platform: 'n8n + VAPI',
      title: 'Voice Receptionist for Service Bookings',
      description: "A demo of a voice assistant for a heating, cooling and plumbing company. It answers the phone, checks the real calendar, books the job into a free two-hour window, cancels a booking from a reference number, and raises the alarm for a genuine emergency. No menus, no \"press 1\", and no call that ends without a record.",
      tags: ['n8n', 'VAPI', 'Google Calendar', 'Google Sheets', 'Voice AI'],
      image: 'assets/projects/ai-receptionist.png',
      caseStudy: {
        client: 'Demo build: heating, cooling and plumbing company',
        situation: "A trades business loses work on the phone. Calls arrive while every technician is on a job, they ring out, and the customer calls the next company. The ones that are answered are mostly routine, and each still takes up whoever picked up.",
        breaking: "An answering service takes a message but cannot see the calendar, so nothing is booked until someone calls back. The hard part is finishing the job on the call: reading the real schedule, putting a real appointment in it, and knowing which call is the burst pipe.",
        built: "A voice assistant that answers the phone, offers two-hour windows that are genuinely free, and books the job while the caller is on the line. Every booking gets a reference number for cancelling later, an emergency triggers an urgent alert to the office, and any other call is saved as a lead so nothing ends without a record.",
        changed: "A call that would have gone to voicemail ends with the job in the diary, and the office sees it straight away. In browser test calls, all four call types worked end to end: booked, logged, customer emailed, office alerted. It is not yet on a phone number and works from one shared calendar with no technician assignment.",
        learned: "The assistant kept inventing phone numbers to fill in a blank field, and telling it not to made no difference. Removing the field fixed it in one go. Next time I would decide exactly what the assistant is allowed to fill in before writing a single instruction, so there is nothing left for it to guess.",
        technical: "Built on VAPI with all the logic in a single 44-node n8n workflow. The assistant handles the conversation and calls one of four tools (book_appointment, cancel_appointment, escalate_emergency, log_lead); the workflow routes on the tool name, applies the rules, and responds while the caller is still on the line. Booking reads Google Calendar for genuinely open two-hour windows, offers them, then re-queries that exact window immediately before writing so two callers cannot be given the same slot. Every booking is written into the calendar event itself (phone, email, address, problem and a short reference number), because on the second round trip the model sends only what it judges relevant, so the conversation cannot be trusted as the record. Cancellation matches on that reference first and phone second, which is what makes it work on web calls where there is no caller ID. Emergencies skip the booking flow and go straight to a high-priority Telegram alert with an after-hours check; transfers were deliberately not implemented. Bookings log to Google Sheets, email the customer via Gmail and alert the office on Telegram, with the response sent before the bookkeeping so the caller never waits on an API call, and logging steps set to fail open. All four tools run end to end on VAPI web calls. Eleven response paths, every one terminating at a Respond node, verified by a pre-flight script that traces every path from the webhook and catches unwired error outputs. Fixes that came out of the build: rules moved from the system prompt into tool parameter descriptions, unwanted parameters deleted from the schema so they cannot be hallucinated, and all spoken values (emails, phone numbers) normalised server-side. The work is documented as a 426-line symptom / cause / fix playbook. Not yet on a provisioned phone number, so the PSTN leg is unproven. Seven-day booking horizon, two-hour windows only, one calendar with no technician assignment, and no rescheduling primitive. Synthetic company, synthetic bookings."
      },
      stats: [
        { n: '44', l: 'Nodes' },
        { n: '4', l: 'Voice tools' },
        { n: '11', l: 'Respond paths' },
        { n: '5', l: 'Integrations' }
      ],
      concept: {
        title: 'The calendar event is the record, not the conversation',
        lead: "A booking takes more than one round trip, and on the second one the assistant sends only what it judges relevant: usually just a reference number. Anything held only in the conversation arrives blank. So the details are written into the calendar event at booking time and read back out of it later. The event is the source of truth; the call is just how it got filled in.",
        chain: [
          { label: 'Caller describes the problem' },
          { label: 'Assistant calls a tool' },
          { label: 'n8n applies the rules' },
          { label: 'Answer while they wait' },
          { label: 'Event, sheet, alert', kind: 'term' }
        ],
        notes: [
          { label: 'A reference number beats caller ID', text: 'Web calls carry no caller number, and in real life people ring from a different phone. Booking issues a short reference and puts it in the event title, so cancelling matches on something the caller actually has rather than on where they happen to be calling from.' },
          { label: 'Re-check the window before writing it', text: 'The calendar is read on the first round trip and written on the second. Two callers offered the same window would both get it, so the exact window is queried again immediately before the write, and if it has gone, the assistant says so rather than double-booking a technician.' },
          { label: 'Answer first, bookkeeping after', text: 'The response goes out before the calendar write, the sheet row, the email and the alert, so the caller is never listening to silence while an API call finishes. Logging steps are set to fail open. A Telegram hiccup must never take down a live call.' }
        ]
      },
      stagesTitle: 'One Webhook, Four Tools',
      stages: [
        {
          marker: '01', title: 'Parse and Route',
          desc: 'Every tool call from the assistant arrives at one webhook. The payload is parsed, the tool name read, and the call routed to its branch, with a fallback branch for a tool name that does not match, so an unrecognised call still gets a spoken answer and a logged row instead of dead air.',
          tags: [{ label: 'Webhook', kind: 'hook' }, { label: 'Switch · 4 ways' }, { label: 'Fallback wired' }],
          flow: 'one entry point · every path ends at a Respond node'
        },
        {
          marker: '02', title: 'book_appointment',
          desc: 'Reads the calendar for the day the caller named, works out which two-hour windows are genuinely free, and offers them. Once a window is chosen it re-queries that exact slot, writes the event with the caller details and a reference number in the description, logs the booking, emails the customer, and tells the office.',
          tags: [{ label: 'Google Calendar', kind: 'sched' }, { label: 'Re-check before write', kind: 'human' }, { label: 'Email + Telegram' }],
          flow: 'find open windows → caller picks → re-check → write event → confirm'
        },
        {
          marker: '03', title: 'cancel_appointment',
          desc: 'Finds the booking by the reference number read out at booking time, falling back to phone. The details come back out of the event description rather than the conversation, so the cancellation log is complete even when the assistant sends nothing but the reference. Cancels the event, logs it, alerts the office.',
          tags: [{ label: 'Match on reference' }, { label: 'Phone fallback' }, { label: 'Telegram alert' }],
          flow: 'reference → event → cancel → log → alert'
        },
        {
          marker: '04', title: 'escalate_emergency',
          desc: 'A caller describing damage happening right now skips the booking flow entirely and goes straight to a high-priority Telegram alert, with an after-hours check deciding how it is routed. The caller decides what counts as an emergency, not the model: asking someone standing in water whether it can wait a few days is the wrong question.',
          tags: [{ label: 'After-hours check', kind: 'sched' }, { label: 'Priority alert', kind: 'human' }],
          flow: 'caller says it is urgent → alert now → log'
        },
        {
          marker: '05', title: 'log_lead',
          desc: 'The catch-all, and the reason no call ends empty-handed. Anything that is not a booking, a cancellation or an emergency is captured as a lead, and the assistant is instructed that every call must end with a tool call, so a conversation it cannot finish still leaves a row someone can follow up.',
          tags: [{ label: 'Google Sheets', kind: 'sched' }, { label: 'Every call leaves a row' }],
          flow: 'no call disappears without a record'
        }
      ],
      decisions: [
        {
          title: 'The rule goes in the parameter description, not the prompt',
          text: 'The assistant kept sending an empty slot field however firmly the system prompt was worded. Moving the instruction into the description of the parameter itself (where the model is actually deciding what to write into that field), fixed in one change what three prompt rewrites could not. The prompt is context; the parameter description is the point of decision.',
          cost: 'the tool schema becomes the real documentation, so a rule changed in the prompt alone silently does nothing'
        },
        {
          title: 'Delete any parameter you do not want filled',
          text: 'The prompt said not to ask for a phone number, but the schema still had a phone field, and the alerts started arriving with invented numbers in them. A model given an empty slot will fill it rather than leave it blank. Removing the field entirely is the only reliable fix, because an absent field cannot be hallucinated.',
          cost: 'a second guard is still needed in the parser for the fields that do have to stay'
        },
        {
          title: 'Normalise what the model says, server-side',
          text: 'Emails arrive as the literal words "mark reyes at example dot com". Phone numbers arrive as placeholder digits. Read-backs group digits into "eight ninety-five four" unless the value is sent pre-spaced. None of this is reliably fixable from the prompt, so every value is normalised and sanity-checked in the workflow before it is written anywhere.',
          cost: 'parser code that has to be maintained alongside the prompt'
        },
        {
          title: 'Transfers removed on purpose',
          text: 'Blind-transferring an emergency to a technician already on a job helps nobody, and a transfer that cannot be completed is worse than one never offered: the assistant announces it, the call drops, and no record exists. Emergencies became an immediate alert to a person who can call back instead.',
          cost: 'no path to a live human mid-call; the fastest response is a callback, not a transfer'
        }
      ],
      status: [
        {
          kind: 'ok', title: 'Done',
          items: [
            'All four tools working end to end on VAPI web calls. Booking writes a real calendar event, logs to Sheets, emails the customer and alerts Telegram',
            'Pre-flight script written for this build: traces every path from the webhook to a Respond node, checks node references resolve, and catches unwired error outputs',
            'Every failure mode documented as a 426-line symptom / cause / fix playbook so the next voice build does not re-learn them'
          ]
        },
        {
          kind: 'warn', title: 'Not yet exercised',
          items: [
            'No provisioned phone number: tested on web calls, so the PSTN leg is unproven',
            'Seven-day booking horizon: "next Friday" books the near one, and a bare date like "the 25th" does not parse',
            'Two-hour windows only, with no custom durations'
          ]
        },
        {
          kind: 'stop', title: 'Known boundaries',
          items: [
            'One calendar with no technician assignment. Nothing models who is actually doing the work',
            'No rescheduling primitive: a reschedule is a cancel plus a booking in one call, two operations that can half-fail',
            'Transfers deliberately not implemented. An emergency becomes an alert and a callback, never a live handoff'
          ]
        }
      ]
    },
    {
      number: 'PROJECT 03',
      category: 'AI Automation',
      platform: 'n8n',
      title: 'Messenger Assistant for Business FAQs',
      description: 'A demo of a Facebook Messenger assistant for a small business. It answers customer questions about hours, prices, services and availability using one document the owner keeps up to date, and it remembers earlier messages in the conversation so follow-up questions make sense.',
      tags: ['n8n', 'Google Gemini', 'AI Agent'],
      image: 'assets/projects/facebook-chatbot.png',
      caseStudy: {
        client: 'Demo build: small business Messenger inbox',
        situation: "A small business gets the same questions on Messenger all day: opening hours, prices, what you offer, whether Saturday is free. Many arrive in the evening or at the weekend, when nobody is watching the inbox.",
        breaking: "Replies depend on someone noticing and typing an answer, and a customer who waits too long asks somewhere else. A generic auto-reply does not help, because it cannot answer the actual question, and any automated answer has to be right for this business.",
        built: "An assistant that answers Messenger questions from one document the business keeps up to date, and remembers earlier messages so follow-up questions make sense. Changing what it says means editing the document. Nothing else needs touching.",
        changed: "This one is built but not yet connected to a live Facebook page, so there are no results to report. Every answer is designed to come from the business's own document rather than general knowledge. Live, I would measure how many messages are answered without a person, how quickly, and how often the assistant has to say it does not know.",
        learned: "The assistant is only as good as the document behind it, and I built the answering part before deciding who would keep that document current. Next time I would settle that first. I would also test with real customer messages from day one, rather than the questions I wrote myself.",
        technical: "Built in n8n with Google Gemini as the chat model. A webhook receives Facebook Messenger events and also answers Facebook's GET verification challenge. Two filter steps strip delivery receipts, echoes of the page's own replies and system events, so only genuine customer messages continue. The workflow fetches the current contents of a Google Doc that serves as the business knowledge base, then an AI Agent node (Gemini plus Simple Memory scoped to the conversation) drafts a reply grounded in that document and sends it back through the Messenger Send API. Six workflow steps in total. Memory lasts the current thread only; there is no long-term customer profile. Built but not yet connected to a live Facebook page, so behaviour with real customers is unverified."
      },
      stats: [
        { n: '6', l: 'Workflow steps' },
        { n: '1', l: 'Doc to update' }
      ],
      concept: {
        title: "Answers come from the business's own document, not the model's memory",
        lead: "The chatbot doesn't improvise. Every reply is grounded in a Google Doc the business owns and controls: opening hours, pricing, services, policies. Edit the doc and the next answer changes: no rebuild, no developer, nobody touching the automation.",
        chain: [
          { label: 'Message arrives' }, { label: 'Validated' }, { label: 'Business info pulled' },
          { label: 'AI writes the reply' }, { label: 'Sent back', kind: 'term' }
        ],
        notes: [
          { label: 'Why a Google Doc', text: 'It is the one place a non-technical owner can confidently edit. Putting the knowledge base somewhere they already know how to use is what keeps it current. A knowledge base nobody updates is worse than none.' },
          { label: 'What it stops', text: "Generic AI guessing. The prompt anchors the reply to what's actually in the document, so the bot answers questions about this business rather than plausible-sounding answers about businesses in general." }
        ]
      },
      stagesTitle: 'What Happens When a Customer Messages',
      stages: [
        {
          marker: '01', title: 'Message Received',
          desc: "Facebook sends the incoming message straight to the workflow. The same endpoint also answers Facebook's own verification checks, which is what keeps the connection live.",
          tags: [{ label: 'Webhook', kind: 'hook' }, { label: 'Messenger' }],
          flow: 'GET for verification · POST for real messages'
        },
        {
          marker: '02', title: 'Filtered to Real Customer Messages',
          desc: 'Two checks strip out everything that is not an actual question from a person: delivery receipts, echoes of the page\'s own replies, and system events that would otherwise trigger a pointless answer.',
          tags: [{ label: 'Validation' }, { label: 'Filter' }],
          flow: 'only genuine customer messages continue'
        },
        {
          marker: '03', title: 'Business Info Pulled',
          desc: 'The workflow fetches the current contents of the business knowledge document, so every answer is based on what is true right now rather than what was true when it was built.',
          tags: [{ label: 'Google Docs', kind: 'sched' }, { label: 'Live lookup' }],
          flow: 'reads the knowledge base on every message'
        },
        {
          marker: '04', title: 'AI Writes the Reply',
          desc: 'Google Gemini drafts a response using that business information, with short-term memory of the conversation so far, so a follow-up question like "and how much is that?" still makes sense.',
          tags: [{ label: 'Google Gemini', kind: 'ai' }, { label: 'Conversation memory' }],
          flow: 'grounded in the document, aware of the thread'
        },
        {
          marker: '05', title: 'Sent Back to Messenger',
          desc: 'The reply goes back through Facebook to the customer, answered without a person involved.',
          tags: [{ label: 'Messenger reply' }],
          flow: 'answered without a person involved'
        }
      ],
      decisions: [
        {
          title: 'The knowledge base is a document the business owner controls',
          text: 'Business facts change constantly: prices, hours, a service added. Keeping them in a Google Doc means the owner updates their own bot in thirty seconds, instead of messaging whoever built it and waiting.',
          cost: 'a stale document means stale answers, so someone has to own keeping it current'
        },
        {
          title: 'Memory lasts a conversation, not forever',
          text: 'The bot remembers the current thread so follow-up questions work naturally, but it does not build a long-term profile of each customer. For answering business questions that is the right amount of memory.',
          cost: 'a returning customer starts from scratch each time'
        }
      ]
    },
    {
      number: 'PROJECT 04',
      category: '7-Workflow System',
      platform: 'n8n',
      title: 'Medical Records Retrieval Automation',
      description: "A demo of a records retrieval system, drawn from my time doing this job by hand. Seven automations pass each case from first request to closed file, stopping for a person at every point where someone genuinely needs to decide.",
      tags: ['n8n', 'Groq AI', 'Airtable', 'Webhooks', 'Human-in-the-Loop'],
      image: 'assets/projects/medical-records-retrieval.png',
      caseStudy: {
        client: 'Demo build: medical records retrieval team',
        situation: "A records retrieval team handles dozens of open requests at once, each with a deadline. For every case, someone checks the facility details by hand, sends the request, remembers to follow up, and reads every reply to work out what happens next.",
        breaking: "None of it connects. Case status lives in a spreadsheet or in someone's head, follow-ups depend on memory, and there is no reliable record of what was sent, when, and who approved it. In healthcare, that record is the part that matters most.",
        built: "Seven automations that pass a case from first request to closed file: verify the facility, draft the request, chase on a schedule that matches the urgency, read the reply, and check what arrived. Wherever real judgement is needed (a doubtful match, a request about to go out, a denied reply, the final sign-off) it stops and waits for a person. Every step is written to a log for that case.",
        changed: "Nobody tracks status by hand, and every decision that matters still belongs to a person. In testing, one case ran end to end with an unbroken log from first request to closed file. Sending is simulated, and this is a working model of the process, not something that could handle real patient records today.",
        learned: "The system stops for a person at four points, but nothing tells that person it is waiting. A case sits there until someone opens the tracker and looks. Next time I would build the alert to the reviewer at the same time as the pause, because a case nobody knows about is as stuck as one that failed.",
        technical: "Seven n8n workflows plus a mock facility directory API (a three-node webhook standing in for a real provider directory), coordinated through a shared Airtable case tracker rather than direct workflow-to-workflow calls: each workflow watches for records at a given status, does its job, and advances the status, so any stage can be fixed or rerun independently and a stuck case is visible as a row. Intake: a webhook accepts JSON, normalises it, assigns a case ID (MRR-YYYYMMDD-####), validates required fields, and writes the case whether or not it passes; resubmitting with the same ID corrects in place. Verification: a schedule looks the facility and provider up in the directory and has Groq (llama-3.1-8b) judge the match field by field with a confidence score; 80% or above on both clears the case, anything less routes to NEEDS_REVIEW. Request generation: drafts the letter and sets PENDING_REVIEW; a second schedule watches for a human to flip the approval field in Airtable. Transmission: picks a channel by available contact details (email, then fax, then mail) and sends; the send is simulated. Tracking: reads the case's own audit log to work out time since last contact and chases by priority (STAT 4h, URGENT 24h, STANDARD 72h, plus a six-day buffer for physical mail), escalating after three attempts. Response handling: a webhook takes inbound replies and Groq classifies them five ways; only a confident \"records received\" auto-advances. Completion: generates a completeness checklist and waits for a human verdict; it deliberately does not attempt to read the documents. 68 nodes, zero validation errors, every stage appending to a per-case audit log. Live-tested end to end in n8n on a single case with an unbroken trail from CASE_CREATED to CASE_COMPLETED. Human gates are field edits in Airtable with no notification, which is the most obvious gap. Synthetic patient, provider and facility data throughout: a prototype of the process, not a HIPAA-compliant deployment."
      },
      stats: [
        { n: '7', l: 'Workflows' },
        { n: '68', l: 'Nodes' },
        { n: '4', l: 'Human gates' },
        { n: '0', l: 'Validation errors', good: true }
      ],
      concept: {
        title: 'Airtable is the wiring',
        lead: "Seven automations plus a stand-in directory run a case from request to closed file, and none of them calls the next one directly. Each one watches the shared case tracker for records at a particular stage, does its one job, and marks the case as having moved on. The next automation is already watching for that.",
        chain: [
          { label: 'NEW' }, { label: 'VERIFIED' }, { label: 'PENDING_REVIEW' },
          { label: 'APPROVED' }, { label: 'SENT' }, { label: 'RECEIVED' },
          { label: 'COMPLETED', kind: 'term' }, { label: 'NEEDS_REVIEW', kind: 'side', detached: true }
        ],
        notes: [
          { label: 'Why build it this way', text: "Any single stage can be fixed, restarted, or rewritten without touching the others. And a case that gets stuck is visible as a row sitting at a stage. You can see it, rather than having to hunt through error logs for a job that failed silently three days ago. It also means a person steps in by editing a record, which is exactly how the approval steps work." },
          { label: 'What it costs', text: "Nothing chases the humans. A case waiting on a person sits there until someone opens the tracker and looks: there's no email, no alert. That's the most obvious thing still missing, and it's the next thing I'd build." }
        ]
      },
      stagesTitle: 'The Pipeline, Stage by Stage',
      stages: [
        {
          marker: '00', infra: true, title: 'Mock Facility Directory API',
          desc: "A stand-in provider directory that answers lookups. It exists because there is no real directory to call for invented facilities: stage 02 needs something genuine to verify against.",
          tags: [{ label: 'Webhook', kind: 'hook' }, { label: '3 nodes' }, { label: 'Supporting infra' }]
        },
        {
          marker: '01', title: 'Request Intake & Validation',
          desc: 'Accepts a JSON request, normalizes it, assigns a case ID, and validates required fields. Writes the case whether or not it passes. An incomplete request becomes a tracked case needing information, not a rejected payload that vanishes. Resubmitting with the same case ID corrects that case in place instead of creating a duplicate.',
          tags: [{ label: 'Webhook', kind: 'hook' }, { label: '8 nodes' }, { label: '41 expressions' }],
          flow: 'writes NEW · case ID format MRR-YYYYMMDD-####'
        },
        {
          marker: '02', title: 'Facility & Provider Verification',
          desc: 'Looks the facility and provider up in the directory, then asks an LLM whether the submitted details actually match what came back. Confidence at or above 80% on both clears the case; anything less routes to a human.',
          tags: [{ label: 'Schedule', kind: 'sched' }, { label: '12 nodes' }, { label: 'Groq · llama-3.1-8b', kind: 'ai' }],
          flow: 'reads NEW → writes VERIFIED or NEEDS_REVIEW'
        },
        {
          marker: '03', title: 'Request Generation & Human Approval',
          desc: 'Two independent schedules in one workflow. The first drafts a request letter and marks it pending review. The second watches for a human to flip the approval field in Airtable, then advances or rejects the case. They are chained through the database, not through a connection.',
          tags: [{ label: '2 schedules', kind: 'sched' }, { label: '12 nodes' }, { label: 'Human gate', kind: 'human' }],
          flow: 'reads VERIFIED → writes APPROVED or REJECTED'
        },
        {
          marker: '04', title: 'Request Transmission',
          desc: 'Picks a channel by what contact details exist (email first, then fax, then physical mail), and sends. Fully automated with no human gate, because the decision already happened at stage 03. The send itself is simulated.',
          tags: [{ label: 'Schedule', kind: 'sched' }, { label: '5 nodes' }, { label: 'Simulated send' }],
          flow: 'reads APPROVED → writes SENT'
        },
        {
          marker: '05', title: 'Tracking & Automated Follow-Up',
          desc: "Works out how long it has been since last contact by reading the case's own audit log, then chases based on priority. Physical mail gets an extra six-day buffer on top: chasing a letter at the same interval as an email just generates noise. Escalates after three attempts rather than nagging a facility forever.",
          tags: [{ label: 'Schedule', kind: 'sched' }, { label: '6 nodes' }, { label: 'STAT 4h · URGENT 24h · STANDARD 72h' }],
          flow: 'reads SENT → increments follow-up count, or flags ESCALATION_NEEDED'
        },
        {
          marker: '06', title: 'Provider Response & AI Classification',
          desc: 'Takes an inbound reply and sorts it five ways: records received, needs more info, denied, no records found, or unclear. Only a confident "records received" advances automatically. Every other outcome is a business decision, so it goes to a person. The AI is a quality gate, not a decision-maker.',
          tags: [{ label: 'Webhook', kind: 'hook' }, { label: '10 nodes' }, { label: 'Groq · 5-way classify', kind: 'ai' }],
          flow: 'writes RECEIVED or NEEDS_REVIEW'
        },
        {
          marker: '07', title: 'Records Received & Completion',
          desc: "Mirrors stage 03's two-phase shape. Generates a completeness checklist comparing what was asked for against what arrived, then waits for a human verdict. It deliberately does not try to auto-verify completeness. The system cannot actually read the documents, so claiming otherwise would be a lie in the audit trail.",
          tags: [{ label: '2 schedules', kind: 'sched' }, { label: '12 nodes' }, { label: 'Human gate', kind: 'human' }],
          flow: 'reads RECEIVED → writes COMPLETED, or back to NEEDS_REVIEW'
        }
      ],
      decisions: [
        {
          title: 'Approval is a field edit, not a button',
          text: 'Human gates work by flipping a value in Airtable, which is where the reviewer already is. There is no front-end in this project, and a fake dashboard button would have been theatre.',
          cost: 'no notification when something needs attention'
        },
        {
          title: 'External vendors are simulated, not faked into looking real',
          text: 'There is no e-fax account and no provider directory for facilities that do not exist. Those integrations are stubbed at a clean boundary: swapping in a real endpoint is a node change, not a redesign.',
          cost: 'the transmission path is unproven against a real vendor'
        },
        {
          title: 'AI only ever auto-advances the happy path',
          text: 'The model classifies and scores, but only a confident, unambiguous positive moves a case forward on its own. Every other branch routes to a person. A wrong "denied" classification would be far more expensive than a human glance.',
          cost: 'more manual review than a bolder design would need'
        }
      ]
    },
    {
      number: 'PROJECT 05',
      category: 'AI Automation',
      platform: 'n8n',
      title: 'Lead Follow-Up System for Lost Leads',
      description: 'A demo of an automatic follow-up sequence for a business that gets leads through a website form. Every new lead gets a personal confirmation, a follow-up three days later if they have not replied, and one more after that, with the status of every lead logged so you can see where each one stands.',
      tags: ['n8n', 'Groq AI', 'Google Sheets'],
      image: 'assets/projects/lead-followup-system.png',
      caseStudy: {
        client: 'Demo build: service business with a website enquiry form',
        situation: "A business that gets leads through a form usually sends one confirmation and then moves on. Whether anyone follows up depends on someone checking the inbox and remembering who has gone quiet.",
        breaking: "The leads that do not reply straight away are the ones most likely to be forgotten, and they are often the ones who just needed a nudge. Tracking who replied and when to chase them does not scale past a handful of leads.",
        built: "Every new lead is logged the moment the form is submitted and gets a personal confirmation written from the details they gave. If they have not replied after three days, a follow-up goes out, then one more, and then the lead is marked closed rather than chased forever. Every step is written to a log so you can see where each lead stands.",
        changed: "This one is built but has not yet run with real leads, so there are no results to report. It is designed so that no lead goes quiet without two follow-ups, and nobody has to remember who was chased and when. Live, I would measure how many quiet leads reply after a follow-up, and how many close with no response.",
        learned: "The system only knows about replies that arrive by email, so a lead who phones back would still get chased. Next time I would give the owner a one-click way to mark a lead as answered, so the automation never contradicts a conversation that already happened.",
        technical: "An n8n workflow triggered by a form webhook. Each lead is appended to a Google Sheet, then a Groq-backed AI Agent drafts a personalised confirmation email from the submitted fields and sends it. A three-day Wait node is followed by a reply check; a reply marks the lead Responded and ends the sequence. No reply sends the first follow-up and writes the status back, then another wait and check, then a final follow-up before the lead is marked Closed / No Response. Every stage writes its status to the sheet, so the sheet is always the current record. Two follow-ups, three days apart. Reply detection is email-only, so a reply by phone looks like silence. Built but not run end to end with real leads."
      },
      stats: [
        { n: '2', l: 'Automated follow-ups' },
        { n: '3', l: 'Days between touches' }
      ],
      concept: {
        title: 'The sheet always knows where every lead stands',
        lead: 'Every stage writes back to Google Sheets: logged, confirmed, followed up once, followed up twice, replied, or closed. Nobody has to remember who was chased and when, or dig through an inbox to find out. The sheet is the answer, and it is always current.',
        chain: [
          { label: 'Lead arrives' }, { label: 'Logged' }, { label: 'Confirmation sent' },
          { label: 'Wait 3 days' }, { label: 'Follow-up' }, { label: 'Final follow-up' },
          { label: 'Replied', kind: 'term' }, { label: 'Closed', kind: 'side', detached: true }
        ],
        notes: [
          { label: 'The problem it solves', text: 'Leads rarely go cold because the offer was wrong. They go cold because the second and third follow-up never happened: someone got busy, and the lead who needed one more nudge quietly disappeared.' },
          { label: 'Why it stops', text: "After two unanswered follow-ups the lead is closed rather than chased indefinitely. Persistence works up to a point; past it you're just training people to ignore you." }
        ]
      },
      stagesTitle: 'The Follow-Up Sequence',
      stages: [
        {
          marker: '01', title: 'Lead Captured & Logged',
          desc: 'A form submission comes in and is written straight to the tracking sheet, so the lead exists as a tracked record from the first second rather than as an email someone might miss.',
          tags: [{ label: 'Webhook', kind: 'hook' }, { label: 'Google Sheets', kind: 'sched' }],
          flow: 'logged before anything else happens'
        },
        {
          marker: '02', title: 'Personalised Confirmation',
          desc: 'Groq drafts a confirmation email using the details the lead actually submitted, so the first contact reads like a reply from a person rather than an autoresponder.',
          tags: [{ label: 'Groq AI', kind: 'ai' }, { label: 'Email' }],
          flow: 'AI drafts → formatted → sent'
        },
        {
          marker: '03', title: 'Wait, Then Check for a Reply',
          desc: 'Three days pass, then the workflow checks whether the lead responded. A reply ends the sequence immediately. Nobody who already answered gets chased.',
          tags: [{ label: 'Wait 3 days', kind: 'sched' }, { label: 'Reply detection' }],
          flow: 'replied → marked Responded, sequence ends'
        },
        {
          marker: '04', title: 'First Follow-Up',
          desc: 'Silence triggers a follow-up, then another wait and another check. This is the touch that most manual processes never get to.',
          tags: [{ label: 'Email' }, { label: 'Sheet updated', kind: 'sched' }],
          flow: 'no reply → follow-up sent → status written back'
        },
        {
          marker: '05', title: 'Final Follow-Up & Close',
          desc: 'One last attempt, one last wait, then the lead is marked closed. The record stays in the sheet with its full history, so a future campaign knows exactly who was contacted and how often.',
          tags: [{ label: 'Email' }, { label: 'Closed', kind: 'human' }],
          flow: 'still no reply → marked Closed / No Response'
        }
      ],
      decisions: [
        {
          title: 'Stop after two follow-ups',
          text: 'The sequence closes the lead rather than chasing forever. Two follow-ups are enough to catch the lead who was simply busy; beyond that the sender starts looking desperate.',
          cost: 'a small number of slow-moving leads get closed that a third touch might have saved'
        },
        {
          title: 'Reply detection drives the branch, not a manual tick',
          text: 'The workflow checks for an actual response before every follow-up, so the sequence stops on its own. Asking a person to mark leads as replied would put the whole thing back on someone remembering.',
          cost: 'a reply that arrives by phone still looks like silence to the workflow'
        }
      ]
    },
    {
      number: 'PROJECT 06',
      category: 'Booking Funnel',
      platform: 'GoHighLevel',
      title: 'Fitness Funnel for Lead Booking',
      description: "A demo of a booking funnel for a fitness studio. A visitor books a consultation, gets a confirmation straight away, and then three reminders before the session, each one checking first that the booking is still on.",
      tags: ['GoHighLevel', 'Appointment Reminders', 'Appointment Booking', 'CRM Pipelines'],
      image: 'assets/projects/peak-performance-workflow.png',
      imageFull: 'assets/projects/full/peak-performance-workflow.png',
      caseStudy: {
        client: 'Demo build: fitness studio',
        situation: "A fitness studio gets sign-ups from its website, but a sign-up is not a booked session. Some people never book. Some book and do not turn up. Reminding them depends on the owner remembering to text the day before.",
        breaking: "Leads drop out between signing up and booking, and no-shows eat the sessions that do get booked. The owner remembering to text people works until the day it gets busy, which is exactly when a no-show costs the most.",
        built: "A booking funnel where every booked session triggers a confirmation, then three reminders: a day before, twelve hours before, and four hours before. Before each reminder, the system checks the booking is still on, so someone who cancelled yesterday does not get chased for a session that is not happening. The pipeline updates itself as people move from sign-up to booked.",
        changed: "Every booked session gets a confirmation and three reminders without the owner sending any of them, and a cancelled session stops the reminders on its own. This was built in a demo account and has not run with real members, so there are no numbers on no-shows. Live, I would measure the no-show rate before and after, and how many sign-ups go on to book.",
        technical: "Built in GoHighLevel. The funnel (a landing page with a consultation form and an appointment calendar) feeds a pipeline; when a session is booked, the workflow tags the contact Appointment Booked, strips stale Cancelled / Lost / No-Show tags from any previous booking, moves the opportunity to the Booked stage, and sends a confirmation email. A three-stage reminder cascade then waits until 24, 12 and 4 hours before the appointment start, with a condition check before each send (tag still present and appointment date still valid) so reminders never fire for a contact who cancelled or no-showed. Built and configured in a demo sub-account; not tested with live bookings."
      },
      stats: [
        { n: '3', l: 'Reminders per booking' },
        { n: '3', l: 'Safety checks' }
      ],
      concept: {
        title: 'Every reminder checks the booking is still real',
        lead: "The reminder sequence doesn't just fire on a timer. Before each of the three sends, it re-checks that the person hasn't cancelled and that the appointment is still on the books, so someone who called to cancel yesterday doesn't get three more reminders for a session that isn't happening.",
        chain: [
          { label: 'Booked' }, { label: 'Tagged & staged' }, { label: '24h check' },
          { label: '12h check' }, { label: '4h check' }, { label: 'Attended', kind: 'term' }
        ],
        notes: [
          { label: 'Why the checks matter', text: "Reminding someone about an appointment they already cancelled is worse than not reminding them at all. It reads as a business that isn't paying attention. The checks cost nothing to run and prevent exactly that." },
          { label: 'What it replaced', text: 'The owner remembering to text people the day before. That works until the day it gets busy, which is precisely when a no-show costs the most.' }
        ]
      },
      stagesTitle: 'What Happens After a Booking',
      stages: [
        {
          marker: '01', title: 'Booking Captured & Cleaned Up',
          desc: 'The moment a session is booked the contact is tagged, and any stale tags from a previous cancellation or no-show are stripped off, so an old record does not derail the new booking.',
          tags: [{ label: 'Trigger', kind: 'hook' }, { label: 'Tag cleanup' }],
          flow: 'tags "Appointment Booked" · removes cancelled / lost / no-show tags'
        },
        {
          marker: '02', title: 'Pipeline Move & Confirmation',
          desc: 'The opportunity moves into the Booked stage so the pipeline reflects reality, and the client gets an immediate confirmation email without anyone sending it.',
          tags: [{ label: 'Pipeline', kind: 'sched' }, { label: 'Email' }],
          flow: 'stage → Booked · confirmation sent automatically'
        },
        {
          marker: '03', title: 'Reminder at 24 Hours',
          desc: 'A day out, the workflow re-checks the tag and the appointment date, then sends the first reminder only if the booking is still live.',
          tags: [{ label: 'Wait 1 day', kind: 'sched' }, { label: 'Condition check', kind: 'human' }],
          flow: 'checks tag + start date → sends 24h reminder'
        },
        {
          marker: '04', title: 'Reminder at 12 Hours',
          desc: 'The same check runs again before the second reminder. A cancellation in the last twelve hours stops the sequence here.',
          tags: [{ label: 'Wait 12h', kind: 'sched' }, { label: 'Condition check', kind: 'human' }],
          flow: 're-checks → sends 12h reminder'
        },
        {
          marker: '05', title: 'Final Reminder at 4 Hours',
          desc: 'The last nudge, four hours before the session, gated by one final check. This is the one that catches the person who genuinely forgot.',
          tags: [{ label: 'Wait 4h', kind: 'sched' }, { label: 'Condition check', kind: 'human' }],
          flow: 're-checks → sends final reminder'
        }
      ],
      decisions: [
        {
          title: 'Re-check before every send, not just once at the start',
          text: 'It would be simpler to check the booking once and then let all three reminders fire. But most cancellations happen in the last day or two (exactly the window the reminders live in), so the check has to run each time to be worth anything.',
          cost: 'three condition checks to maintain instead of one'
        },
        {
          title: 'Clear old tags before starting a new booking',
          text: 'A returning contact may still carry a Cancelled or No-Show tag from last time. If those are left in place, the condition checks read the new booking as already dead and the reminders never fire. Stripping stale tags at the moment of booking is what lets the same person book again cleanly.',
          cost: 'one more step at the start of the workflow, and a tag scheme that has to stay consistent'
        }
      ]
    },
    {
      number: 'PROJECT 07',
      category: 'Lead Generation',
      platform: 'GoHighLevel',
      title: 'Real Estate CRM for Lead Routing',
      description: "A demo of a lead routing system for a real estate brokerage. A homeowner requests a valuation, and the CRM sorts them as a buyer, seller or both, places them in the right pipeline, sends a confirmation, and alerts the assigned agent, all before anyone has read the enquiry.",
      tags: ['GoHighLevel', 'CRM Pipelines', 'Landing Pages', 'Real Estate'],
      image: 'assets/projects/harbor-vale-workflow.png',
      imageFull: 'assets/projects/full/harbor-vale-workflow.png',
      caseStudy: {
        client: 'Demo build: real estate brokerage',
        situation: "A brokerage gets enquiries through its website all day: people wanting to sell, people wanting to buy, and people doing both at once. They all land in the same inbox, and the first agent to respond usually wins the listing.",
        breaking: "Before any follow-up can start, someone has to read each enquiry, work out what the person wants, and forward it to the right agent. That gap between \"form submitted\" and \"agent knows\" is where listings are lost.",
        built: "A home valuation page that asks the one question everything depends on: are you looking to buy, sell, or both. The CRM reads that answer and sorts the lead into the right pipeline, sends a confirmation, and alerts the assigned agent, so the first thing the agent does is follow up rather than triage. Buyer-and-seller leads get their own path, because someone selling one home and buying the next is the most valuable enquiry a brokerage gets.",
        changed: "A new lead is sorted and with the right agent the moment they submit, instead of sitting unread in a shared inbox. This was built in a demo account and has not run with real enquiries, so there are no response-time numbers. Live, I would measure the time from form submission to first agent contact, and how many leads end up in the wrong pipeline.",
        technical: "Built in GoHighLevel: a home valuation landing page feeding a nine-workflow automation system; the New Lead Intake workflow is the one documented here. It reads the \"I'm looking to\" field from the form and branches three ways (Buy, Sell, Both), tags the contact accordingly (Buyer, Seller, or Buyer + Seller), creates the opportunity in the matching pipeline at the New Lead stage, sends an automatic confirmation email, and notifies the assigned agent. Routing is driven by the explicit form answer rather than inferred from free text, so a wrong route traces back to the form asking badly, which is fixable. Built and configured in a demo sub-account; not tested with live enquiries."
      },
      stats: [
        { n: '9', l: 'Workflows built' },
        { n: '3', l: 'Lead routes' }
      ],
      concept: {
        title: 'The form decides the pipeline, not a person',
        lead: "One home-valuation form serves buyers, sellers, and people doing both at once. The intake workflow reads the “I'm looking to” answer and sends the lead straight down the matching path (tagged, placed in the right pipeline, confirmed by email, and handed to an agent), without waiting on someone to read the submission first.",
        chain: [
          { label: 'Form submitted' }, { label: 'Buy / Sell / Both' }, { label: 'Tagged' },
          { label: 'Pipeline stage' }, { label: 'Agent notified', kind: 'term' }
        ],
        notes: [
          { label: 'Why speed matters here', text: 'In real estate the first agent to respond usually wins the listing. Cutting the gap between "form submitted" and "agent knows" from hours to seconds is the whole point of the build.' },
          { label: 'What it is designed to replace', text: 'Every enquiry landing in one shared inbox, where someone has to read it, work out whether the person wants to buy or sell, and forward it to the right agent before any follow-up can start.' }
        ]
      },
      stagesTitle: 'How a New Lead Gets Routed',
      stages: [
        {
          marker: '01', title: 'Form Submitted',
          desc: 'A homeowner requests a valuation through the landing page. The form asks directly what they are looking to do, which is the answer everything downstream depends on.',
          tags: [{ label: 'Landing page', kind: 'hook' }, { label: 'Intake form' }],
          flow: 'captures intent explicitly rather than guessing it later'
        },
        {
          marker: '02', title: 'Branch by Intent',
          desc: 'The workflow splits three ways on that answer (buying, selling, or both), because those are genuinely different conversations, not variations of one.',
          tags: [{ label: 'Branch', kind: 'sched' }, { label: '3 paths' }],
          flow: 'Buy · Sell · Both'
        },
        {
          marker: '03', title: 'Tagged & Placed in the Pipeline',
          desc: 'The contact is tagged as a Buyer, Seller, or Buyer + Seller lead, and the opportunity is created in the matching pipeline at the New Lead stage, so the board reflects reality without anyone dragging cards around.',
          tags: [{ label: 'CRM', kind: 'sched' }, { label: 'Tag + stage' }],
          flow: 'contact tagged → opportunity created in the matching pipeline'
        },
        {
          marker: '04', title: 'Confirmation Sent',
          desc: 'The lead gets an immediate acknowledgement, which buys the agent time to prepare a real response instead of racing the clock on a first impression.',
          tags: [{ label: 'Email' }],
          flow: 'automatic confirmation on submission'
        },
        {
          marker: '05', title: 'Agent Notified',
          desc: 'The assigned agent is notified with the lead already sorted, so the first thing they do is follow up rather than triage.',
          tags: [{ label: 'Notification', kind: 'human' }],
          flow: 'assigned agent alerted to follow up'
        }
      ],
      decisions: [
        {
          title: 'Branch on what the form asked, not on guessing from the message',
          text: 'The routing reads a direct answer the lead gave, rather than trying to infer intent from free text. It is less clever and far more reliable, and when it is wrong, it is wrong because the form asked badly, which is fixable.',
          cost: 'the form has to ask the question explicitly, adding a field'
        },
        {
          title: '"Both" is its own route, not a fallback into the buyer path',
          text: 'Someone selling their current home and buying the next one is the highest-value lead a brokerage gets. Collapsing them into the buyer pipeline would lose half the opportunity, so they get their own tag and their own path.',
          cost: 'a third branch to build and maintain'
        }
      ]
    },
    {
      number: 'PROJECT 08',
      category: '5-Module System',
      platform: 'n8n',
      title: 'Automation Hub for Business Operations',
      description: "A demo of an automation hub for a business group with several divisions. Five weekly routines that used to mean someone opening spreadsheets and writing emails now run on their own schedule and email the right person.",
      tags: ['n8n', 'Groq AI', 'Google Sheets', 'Gmail API', 'Serper.dev'],
      image: 'assets/projects/au-business-hub.png',
      caseStudy: {
        client: 'Demo build: multi-division business group',
        situation: "A business group with several divisions runs on a handful of weekly routines. Someone compiles the operations report from each division's spreadsheet, chases leads that have gone quiet, chases unpaid invoices, checks which projects have slipped, and reads up on the industry.",
        breaking: "None of these connect. The same information is re-entered across spreadsheets and emails every week, a lead or an invoice can be chased twice or not at all, and the routines only happen if the person doing them is not busy with something else.",
        built: "Five automations, each doing the same thing in the same order: read the spreadsheet, find the rows that need attention, write the email in plain English, send it, then mark the row so it is never chased twice. One compiles the weekly report from five division sheets. One chases quiet leads. One chases overdue invoices. One flags projects running late. One searches the web and writes an industry digest. Adding a sixth routine is a copy of an existing one with different filters.",
        changed: "The five weekly chores run on their own schedule and land in the right inbox, with nothing re-typed and nothing chased twice. This was built with sample spreadsheets and has not run on live business data, so there are no figures on hours saved. Live, I would measure the hours per week the team stops spending on these routines, and how quickly overdue invoices get paid after the first reminder.",
        technical: "Five n8n workflows on schedule triggers, tied together with Google Sheets, the Gmail API, Groq and Serper.dev. Weekly Operations Report (17 nodes): reads five division sheets (property, farming, restaurant, accounting, marketing), merges them, has Groq write the summary, and emails one report to operations. Lead Tracker (9 nodes): filters the lead sheet for contacts gone quiet, Groq drafts the follow-up, sends via Gmail, marks the lead contacted. Invoice Follow-Up (9 nodes): finds past-due invoices, drafts and sends the reminder, flags the row as alerted. Property Project Tracker (9 nodes): checks for delayed projects and emails management an alert naming the project and the delay. Research Summarizer: runs an industry search through Serper.dev and hands the results to Groq for a digest. Every module ends by writing its status back to the sheet, which is what prevents double-chasing; the AI writes the messages but plain rules decide which rows qualify. Built with synthetic spreadsheets; not run on live business data."
      },
      stats: [
        { n: '5', l: 'Modules' },
        { n: '5', l: 'Divisions reported' },
        { n: '4', l: 'Tools connected' }
      ],
      concept: {
        title: 'Five modules, one repeating shape',
        lead: 'Every module does the same five things in the same order: read the spreadsheet, work out which rows need attention, have AI write the message in plain English, send it, then write the status back so the same row never gets chased twice. Only the subject matter changes: leads, invoices, projects, reporting.',
        chain: [
          { label: 'Read the sheet' }, { label: 'Find what needs attention' },
          { label: 'AI drafts the message' }, { label: 'Send it' },
          { label: 'Write the status back', kind: 'term' }
        ],
        notes: [
          { label: 'Why this matters to the business', text: 'A sixth routine is a copy of an existing one with different filters, not a build from scratch. The pattern is the asset: once it works, adding to it is an afternoon rather than a project.' },
          { label: 'Where the AI actually sits', text: 'It writes, it does not decide. Plain rules pick which invoice is overdue and which lead has gone quiet; the model only turns that decision into an email a person would be happy to receive.' }
        ]
      },
      stagesTitle: 'The Five Modules',
      stages: [
        {
          marker: '01', title: 'Weekly Operations Report',
          desc: 'Pulls the week from five separate division sheets (property, farming, restaurant, accounting, and marketing), merges them, has AI write the summary, and emails one report to operations. This replaced a person compiling the same figures by hand every week.',
          tags: [{ label: 'Schedule', kind: 'sched' }, { label: '17 nodes' }, { label: 'Groq summary', kind: 'ai' }],
          flow: 'reads 5 division sheets → one merged email report'
        },
        {
          marker: '02', title: 'Lead Tracker & Follow-Up',
          desc: 'Filters the lead sheet for contacts who have gone quiet, has AI draft a follow-up in the right tone, sends it, and marks the lead as contacted so the next run skips them.',
          tags: [{ label: 'Schedule', kind: 'sched' }, { label: '9 nodes' }, { label: 'Groq draft', kind: 'ai' }],
          flow: 'filters cold leads → sends follow-up → updates lead status'
        },
        {
          marker: '03', title: 'Invoice Follow-Up',
          desc: 'Checks which invoices are past due, drafts the chase email, sends it to the client, and flags the row as alerted, so nobody gets chased twice for the same invoice.',
          tags: [{ label: 'Schedule', kind: 'sched' }, { label: '9 nodes' }, { label: 'Groq draft', kind: 'ai' }],
          flow: 'finds past-due invoices → sends reminder → marks alert sent'
        },
        {
          marker: '04', title: 'Property Project Tracker',
          desc: 'Watches active property projects for ones that have slipped behind, and emails management an alert naming the project and the delay, rather than waiting for it to surface in a meeting.',
          tags: [{ label: 'Schedule', kind: 'sched' }, { label: '9 nodes' }, { label: 'Groq draft', kind: 'ai' }],
          flow: 'checks delayed status → alerts management → updates alert status'
        },
        {
          marker: '05', title: 'Research Summarizer',
          desc: 'Runs an industry search through Serper.dev and hands the results to Groq to produce a readable digest, replacing the manual "go read the news and write it up" task.',
          tags: [{ label: 'Schedule', kind: 'sched' }, { label: 'Serper.dev + Groq', kind: 'ai' }],
          flow: 'web search → AI digest'
        }
      ],
      decisions: [
        {
          title: 'Every module writes its status back to the sheet',
          text: 'Each run ends by marking the row it just acted on. That single habit is what stops a client being chased twice for the same invoice, or a lead getting the same follow-up every morning.',
          cost: 'the spreadsheet becomes the source of truth, so it has to stay tidy'
        },
        {
          title: 'Everything runs on a schedule, not on instant triggers',
          text: 'These are routines that happen daily or weekly, not events that need answering in seconds, so each module wakes up on a timer, checks what needs doing, and goes back to sleep.',
          cost: 'up to a full cycle of delay before something is picked up'
        }
      ]
    }
  
  ];

  window.openProjectDetail = function(index) {
    const project = projectDetails[index];
    const modal = document.getElementById('projectDetailModal');
    if (!project || !modal) return;

    document.getElementById('projectDetailNumber').textContent = project.number;
    document.getElementById('projectDetailCategory').textContent = project.category;
    document.getElementById('projectDetailPlatform').textContent = project.platform;
    document.getElementById('projectDetailTitle').textContent = project.title;
    document.getElementById('projectDetailDesc').textContent = project.description;
    const cs = project.caseStudy;
    document.getElementById('projectDetailClient').textContent = cs.client;
    const caseBlocks = [
      ['Situation', cs.situation],
      ['Breaking', cs.breaking],
      ['Built', cs.built],
      ['Changed', cs.changed],
      ['Learned', cs.learned]
    ];
    caseBlocks.forEach(([key, text]) => {
      document.getElementById('projectDetail' + key).textContent = text || '';
      document.getElementById('projectDetail' + key + 'Wrap').style.display = text ? '' : 'none';
    });

    const technicalWrap = document.getElementById('projectDetailTechnicalWrap');
    document.getElementById('projectDetailTechnical').textContent = cs.technical || '';
    technicalWrap.style.display = cs.technical ? '' : 'none';

    const mainImage = document.getElementById('projectDetailMainImage');
    mainImage.src = project.image;
    mainImage.alt = project.title;

    // Zoom pulls the full-resolution original where one exists — it is only
    // fetched on click, so the heavy file never costs anything on scroll.
    const zoomBtn = document.getElementById('projectDetailZoomBtn');
    zoomBtn.onclick = function(event) {
      event.stopPropagation();
      window.openCertLightbox(project.imageFull || project.image);
    };

    const liveBtn = document.getElementById('projectDetailLiveBtn');
    if (project.liveUrl) {
      liveBtn.href = project.liveUrl;
      liveBtn.style.display = '';
    } else {
      liveBtn.style.display = 'none';
    }

    const tagsEl = document.getElementById('projectDetailTags');
    tagsEl.innerHTML = '';
    project.tags.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'tech-tag';
      span.textContent = tag;
      tagsEl.appendChild(span);
    });

    // Optional stat strip
    const statsEl = document.getElementById('projectDetailStats');
    statsEl.innerHTML = '';
    if (project.stats && project.stats.length) {
      statsEl.style.display = '';
      project.stats.forEach(stat => {
        const cell = document.createElement('div');
        cell.className = 'detail-stat' + (stat.good ? ' good' : '');
        const n = document.createElement('span');
        n.className = 'detail-stat-n';
        n.textContent = stat.n;
        const l = document.createElement('span');
        l.className = 'detail-stat-l';
        l.textContent = stat.l;
        cell.appendChild(n);
        cell.appendChild(l);
        statsEl.appendChild(cell);
      });
    } else {
      statsEl.style.display = 'none';
    }

    // Optional "how it's wired" concept panel
    const conceptWrap = document.getElementById('projectDetailConceptWrap');
    const chainEl = document.getElementById('projectDetailConceptChain');
    const notesEl = document.getElementById('projectDetailConceptNotes');
    chainEl.innerHTML = '';
    notesEl.innerHTML = '';
    if (project.concept) {
      conceptWrap.style.display = '';
      document.getElementById('projectDetailConceptTitle').textContent = project.concept.title;
      document.getElementById('projectDetailConceptLead').textContent = project.concept.lead;

      const chainItems = project.concept.chain || project.concept.chips;
      const arrowed = !!project.concept.chain;
      chainEl.style.display = chainItems ? '' : 'none';
      if (chainItems) {
        chainItems.forEach((item, i) => {
          if (arrowed && i > 0) {
            const ar = document.createElement('span');
            ar.className = 'chain-arrow';
            ar.textContent = item.detached ? '·' : '→';
            chainEl.appendChild(ar);
          }
          const st = document.createElement('span');
          st.className = 'chain-node' + (item.kind ? ' ' + item.kind : '');
          st.textContent = item.label;
          chainEl.appendChild(st);
        });
      }

      (project.concept.notes || []).forEach(note => {
        const p = document.createElement('p');
        const b = document.createElement('strong');
        b.textContent = note.label + ': ';
        p.appendChild(b);
        p.appendChild(document.createTextNode(note.text));
        notesEl.appendChild(p);
      });
    } else {
      conceptWrap.style.display = 'none';
    }

    // Execution path — either the simple numbered list or the detailed stage rail
    const workflowWrap = document.getElementById('projectDetailWorkflowWrap');
    const workflowTitleEl = document.getElementById('projectDetailWorkflowTitle');
    const workflowStepsEl = document.getElementById('projectDetailWorkflowSteps');
    const stagesEl = document.getElementById('projectDetailStages');
    workflowStepsEl.innerHTML = '';
    stagesEl.innerHTML = '';

    if (project.stages && project.stages.length) {
      workflowWrap.style.display = '';
      workflowTitleEl.textContent = project.stagesTitle || 'Automated Workflow Execution Path';
      workflowStepsEl.style.display = 'none';
      stagesEl.style.display = '';

      project.stages.forEach(stage => {
        const row = document.createElement('div');
        row.className = 'stage' + (stage.infra ? ' infra' : '');

        const marker = document.createElement('div');
        marker.className = 'stage-marker';
        marker.textContent = stage.marker;

        const body = document.createElement('div');
        body.className = 'stage-body';

        const title = document.createElement('div');
        title.className = 'stage-title';
        title.textContent = stage.title;
        body.appendChild(title);

        const desc = document.createElement('p');
        desc.textContent = stage.desc;
        body.appendChild(desc);

        if (stage.tags && stage.tags.length) {
          const meta = document.createElement('div');
          meta.className = 'stage-meta';
          stage.tags.forEach(tag => {
            const t = document.createElement('span');
            t.className = 'stage-tag' + (tag.kind ? ' ' + tag.kind : '');
            t.textContent = tag.label;
            meta.appendChild(t);
          });
          body.appendChild(meta);
        }

        if (stage.flow) {
          const flow = document.createElement('div');
          flow.className = 'stage-flow';
          flow.textContent = stage.flow;
          body.appendChild(flow);
        }

        row.appendChild(marker);
        row.appendChild(body);
        stagesEl.appendChild(row);
      });
    } else if (project.workflowSteps && project.workflowSteps.length) {
      workflowWrap.style.display = '';
      workflowTitleEl.textContent = 'Automated Workflow Execution Path';
      workflowStepsEl.style.display = '';
      stagesEl.style.display = 'none';
      project.workflowSteps.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        workflowStepsEl.appendChild(li);
      });
    } else {
      workflowWrap.style.display = 'none';
    }

    // Optional trade-off list
    const decisionsWrap = document.getElementById('projectDetailDecisionsWrap');
    const decisionsEl = document.getElementById('projectDetailDecisions');
    decisionsEl.innerHTML = '';
    if (project.decisions && project.decisions.length) {
      decisionsWrap.style.display = '';
      project.decisions.forEach(dec => {
        const item = document.createElement('div');
        item.className = 'decision';

        const h = document.createElement('h5');
        h.textContent = dec.title;
        item.appendChild(h);

        const p = document.createElement('p');
        p.textContent = dec.text;
        item.appendChild(p);

        if (dec.cost) {
          const cost = document.createElement('div');
          cost.className = 'decision-cost';
          cost.appendChild(document.createTextNode('Cost: '));
          const b = document.createElement('strong');
          b.textContent = dec.cost;
          cost.appendChild(b);
          item.appendChild(cost);
        }

        decisionsEl.appendChild(item);
      });
    } else {
      decisionsWrap.style.display = 'none';
    }

    // Optional honest-status block
    const statusWrap = document.getElementById('projectDetailStatusWrap');
    const statusEl = document.getElementById('projectDetailStatus');
    statusEl.innerHTML = '';
    if (project.status && project.status.length) {
      statusWrap.style.display = '';
      project.status.forEach(col => {
        const card = document.createElement('div');
        card.className = 'status-card';

        const head = document.createElement('div');
        head.className = 'status-head';
        const dot = document.createElement('span');
        dot.className = 'status-dot ' + col.kind;
        const h = document.createElement('h5');
        h.textContent = col.title;
        head.appendChild(dot);
        head.appendChild(h);
        card.appendChild(head);

        const ul = document.createElement('ul');
        col.items.forEach(text => {
          const li = document.createElement('li');
          li.textContent = text;
          ul.appendChild(li);
        });
        card.appendChild(ul);

        statusEl.appendChild(card);
      });
    } else {
      statusWrap.style.display = 'none';
    }

    // Always open collapsed, whichever way the last project was left.
    const deep = document.getElementById('projectDetailDeep');
    const moreBtn = document.getElementById('projectDetailMoreBtn');
    if (deep && moreBtn) {
      deep.hidden = true;
      moreBtn.setAttribute('aria-expanded', 'false');
      document.getElementById('projectDetailMoreLabel').textContent = 'Show the technical detail';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeProjectDetail = function(event) {
    const modal = document.getElementById('projectDetailModal');
    if (!modal) return;

    if (event.target === modal || event.target.closest('.project-detail-close')) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // Certifications Grid Lightbox (for the new Certifications section)
  window.openCertLightbox = function(imageSrc) {
    const lightbox = document.getElementById('certGridLightbox');
    const lightboxImage = document.getElementById('certGridLightboxImage');

    if (lightbox && lightboxImage) {
      lightboxImage.src = imageSrc;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeCertGridLightbox = function(event) {
    const lightbox = document.getElementById('certGridLightbox');
    const lightboxImage = document.getElementById('certGridLightboxImage');

    if (!lightbox) return;

    // Close if clicked on backdrop or close button
    if (event.target === lightbox || event.target.closest('.cert-grid-lightbox-close')) {
      lightbox.classList.remove('active');
      if (lightboxImage) lightboxImage.src = '';

      // Only release the body scroll lock if the project detail modal
      // isn't also open underneath — otherwise the page would scroll
      // behind the still-open modal.
      const projectDetailModal = document.getElementById('projectDetailModal');
      if (!projectDetailModal || !projectDetailModal.classList.contains('active')) {
        document.body.style.overflow = '';
      }
    }
  };
});
