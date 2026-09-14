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
        <p>The live calendar didn't load — this can happen with an ad blocker or privacy extension active.</p>
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
      category: '5-Module System',
      platform: 'n8n',
      title: 'Business Automation Hub',
      description: "Five routines an Australian business group used to do by hand every week — the operations report, chasing cold leads, chasing unpaid invoices, flagging stalled property projects, and industry research — rebuilt as five automations that run on their own schedule and email the right person, without anyone opening a spreadsheet.",
      tags: ['n8n', 'Groq AI', 'Google Sheets', 'Gmail API', 'Serper.dev'],
      image: 'assets/projects/au-business-hub.png',
      caseStudy: {
        client: 'Portfolio Project (Confidential Client)',
        need: "A multi-industry Australian business group was running five completely separate manual processes — someone had to compile the weekly operations report by hand, track and score incoming leads in a spreadsheet, chase down unpaid invoices individually, update project status across properties, and manually research and summarize industry information. None of these connected to each other, so the team was re-entering the same information across tools every week.",
        solution: 'Built a five-module automation ecosystem in n8n, tied together with Google Sheets, the Gmail API, Groq AI, and Serper.dev. The operations report module pulls data straight from Google Sheets and distributes the summary automatically; the lead tracker captures and scores new leads with AI before logging them to the CRM; the invoice module triggers Gmail follow-up sequences on a schedule; and the research summarizer queries Serper.dev and hands the results to Groq to generate a digest — all without anyone touching a keyboard.',
        result: "The five manual processes now run on autopilot as one connected system instead of five disconnected tools. Reporting, lead capture, invoice follow-up, project tracking, and research all happen automatically on their own schedule, eliminating the weekly manual data re-entry across spreadsheets and tools."
      },
      stats: [
        { n: '5', l: 'Modules' },
        { n: '5', l: 'Divisions reported' },
        { n: '4', l: 'Tools connected' }
      ],
      concept: {
        title: 'Five modules, one repeating shape',
        lead: 'Every module does the same five things in the same order: read the spreadsheet, work out which rows need attention, have AI write the message in plain English, send it, then write the status back so the same row never gets chased twice. Only the subject matter changes — leads, invoices, projects, reporting.',
        chain: [
          { label: 'Read the sheet' }, { label: 'Find what needs attention' },
          { label: 'AI drafts the message' }, { label: 'Send it' },
          { label: 'Write the status back', kind: 'term' }
        ],
        notes: [
          { label: 'Why this matters to the business', text: 'A sixth routine is a copy of an existing one with different filters, not a build from scratch. The pattern is the asset — once it works, adding to it is an afternoon rather than a project.' },
          { label: 'Where the AI actually sits', text: 'It writes, it does not decide. Plain rules pick which invoice is overdue and which lead has gone quiet; the model only turns that decision into an email a person would be happy to receive.' }
        ]
      },
      stagesTitle: 'The Five Modules',
      stages: [
        {
          marker: '01', title: 'Weekly Operations Report',
          desc: 'Pulls the week from five separate division sheets — property, farming, restaurant, accounting, and marketing — merges them, has AI write the summary, and emails one report to operations. This replaced a person compiling the same figures by hand every week.',
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
          desc: 'Checks which invoices are past due, drafts the chase email, sends it to the client, and flags the row as alerted — so nobody gets chased twice for the same invoice.',
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
          text: 'These are routines that happen daily or weekly, not events that need answering in seconds — so each module wakes up on a timer, checks what needs doing, and goes back to sleep.',
          cost: 'up to a full cycle of delay before something is picked up'
        }
      ]
    },
    {
      number: 'PROJECT 02',
      category: 'Workflow Audit',
      platform: 'GoHighLevel',
      title: 'Peak Performance Fitness Funnel',
      description: "A fitness brand was getting sign-ups but losing them on the way to a booked session, and no-shows were eating the sessions that did get booked. I audited what they had, fixed where leads were dropping out, and built an automatic confirmation and three-stage reminder sequence so every booking gets chased without the owner remembering to do it.",
      tags: ['GoHighLevel', 'Appointment Reminders', 'Workflow Audit', 'CRM Pipelines'],
      image: 'assets/projects/peak-performance-workflow.png',
      imageFull: 'assets/projects/full/peak-performance-workflow.png',
      caseStudy: {
        client: 'Peak Performance Fitness',
        need: "Peak Performance Fitness had opt-ins coming into their GoHighLevel setup, but gaps in the lead capture and follow-up automation meant a chunk of those leads never turned into a booked consultation. There was no consistent reminder system in place, so booked appointments were also at risk of no-shows with nothing automated to bring people back.",
        solution: "Audited the existing GoHighLevel CRM pipeline, then rebuilt the parts that were leaking leads and added an appointment confirmation and reminder workflow. Once a session is booked, the contact is tagged, moved to the Booked pipeline stage, and sent a confirmation email — then a three-stage reminder cascade runs at 24, 12, and 4 hours before the appointment, with a condition check before each send so reminders never fire for a contact who already cancelled or no-showed.",
        result: "The system now moves opt-ins into booked sessions without leads falling through the cracks, and every booked appointment gets three automated reminders leading up to it instead of relying on the client to remember."
      },
      stats: [
        { n: '3', l: 'Reminders per booking' },
        { n: '3', l: 'Safety checks' },
        { n: '0', l: 'Manual reminders' }
      ],
      concept: {
        title: 'Every reminder checks the booking is still real',
        lead: "The reminder sequence doesn't just fire on a timer. Before each of the three sends, it re-checks that the person hasn't cancelled and that the appointment is still on the books — so someone who called to cancel yesterday doesn't get three more reminders for a session that isn't happening.",
        chain: [
          { label: 'Booked' }, { label: 'Tagged & staged' }, { label: '24h check' },
          { label: '12h check' }, { label: '4h check' }, { label: 'Attended', kind: 'term' }
        ],
        notes: [
          { label: 'Why the checks matter', text: "Reminding someone about an appointment they already cancelled is worse than not reminding them at all — it reads as a business that isn't paying attention. The checks cost nothing to run and prevent exactly that." },
          { label: 'What it replaced', text: 'The owner remembering to text people the day before. That works until the day it gets busy, which is precisely when a no-show costs the most.' }
        ]
      },
      stagesTitle: 'What Happens After a Booking',
      stages: [
        {
          marker: '01', title: 'Booking Captured & Cleaned Up',
          desc: 'The moment a session is booked the contact is tagged, and any stale tags from a previous cancellation or no-show are stripped off — so an old record does not derail the new booking.',
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
          desc: 'The same check runs again before the second reminder — a cancellation in the last twelve hours stops the sequence here.',
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
          text: 'It would be simpler to check the booking once and then let all three reminders fire. But most cancellations happen in the last day or two — exactly the window the reminders live in — so the check has to run each time to be worth anything.',
          cost: 'three condition checks to maintain instead of one'
        },
        {
          title: 'Audit the existing setup before building anything new',
          text: 'The funnel already had opt-ins coming in and automation running; the problem was where leads were quietly falling out. Mapping that first meant the rebuild fixed the leak rather than layering new automation on top of it.',
          cost: 'a slower start before anything visible got built'
        }
      ]
    },
    {
      number: 'PROJECT 03',
      category: 'Lead Generation',
      platform: 'GoHighLevel',
      title: 'Harbor & Vale Realty',
      description: "A Charlotte brokerage had every website enquiry landing in one shared inbox, where someone had to read each one and work out which agent should get it. I built the home-valuation page and nine workflows behind it, so a lead is sorted into the right buyer or seller pipeline and sent to the assigned agent the moment they hit submit.",
      tags: ['GoHighLevel', 'CRM Pipelines', 'Landing Pages', 'Real Estate'],
      image: 'assets/projects/harbor-vale-workflow.png',
      imageFull: 'assets/projects/full/harbor-vale-workflow.png',
      caseStudy: {
        client: 'Harbor & Vale Realty',
        need: "Every home-valuation lead coming through Harbor & Vale Realty's website landed in the same inbox regardless of whether the person wanted to buy, sell, or both — leaving someone to manually read each submission and figure out which agent and pipeline it belonged to before any follow-up could start.",
        solution: "Built a home-valuation landing page feeding a 9-workflow GoHighLevel automation system. The New Lead Intake workflow reads the \"I'm looking to\" field from the submitted form and branches the contact by intent — Buy, Sell, or Both — tagging them accordingly, moving the opportunity into the matching New Lead pipeline stage, sending an automatic confirmation email, and notifying the assigned agent.",
        result: "Leads are now sorted into the correct Buyer or Seller pipeline the instant they submit the form, and the assigned agent gets notified immediately instead of leads sitting unrouted in a shared inbox."
      },
      stats: [
        { n: '9', l: 'Workflows built' },
        { n: '3', l: 'Lead routes' },
        { n: '0', l: 'Manual sorting' }
      ],
      concept: {
        title: 'The form decides the pipeline, not a person',
        lead: "One home-valuation form serves buyers, sellers, and people doing both at once. The intake workflow reads the “I'm looking to” answer and sends the lead straight down the matching path — tagged, placed in the right pipeline, confirmed by email, and handed to an agent — without waiting on someone to read the submission first.",
        chain: [
          { label: 'Form submitted' }, { label: 'Buy / Sell / Both' }, { label: 'Tagged' },
          { label: 'Pipeline stage' }, { label: 'Agent notified', kind: 'term' }
        ],
        notes: [
          { label: 'Why speed matters here', text: 'In real estate the first agent to respond usually wins the listing. Cutting the gap between "form submitted" and "agent knows" from hours to seconds is the whole point of the build.' },
          { label: 'What it replaced', text: 'Every enquiry landing in one shared inbox, where someone had to read it, work out whether the person wanted to buy or sell, and forward it to the right agent before any follow-up could start.' }
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
          desc: 'The workflow splits three ways on that answer — buying, selling, or both — because those are genuinely different conversations, not variations of one.',
          tags: [{ label: 'Branch', kind: 'sched' }, { label: '3 paths' }],
          flow: 'Buy · Sell · Both'
        },
        {
          marker: '03', title: 'Tagged & Placed in the Pipeline',
          desc: 'The contact is tagged as a Buyer, Seller, or Buyer + Seller lead, and the opportunity is created in the matching pipeline at the New Lead stage — so the board reflects reality without anyone dragging cards around.',
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
          text: 'The routing reads a direct answer the lead gave, rather than trying to infer intent from free text. It is less clever and far more reliable — and when it is wrong, it is wrong because the form asked badly, which is fixable.',
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
      number: 'PROJECT 04',
      category: 'AI Automation',
      platform: 'n8n',
      title: 'AI Facebook Chatbot',
      description: 'An AI-powered Facebook Messenger chatbot that answers customer inquiries about a business in real time, pulling from a live knowledge base stored in Google Docs.',
      tags: ['n8n', 'Google Gemini', 'AI Agent'],
      image: 'assets/projects/facebook-chatbot.png',
      caseStudy: {
        client: 'Portfolio Project (Self-Initiated)',
        need: "Businesses often struggle to respond to Facebook Messenger inquiries quickly, especially outside business hours — manual replies slow response times and increase support workload. Without dedicated staff monitoring Messenger around the clock, valid customer questions about hours, pricing, services, or availability risk going unanswered, and any automated response needed to stay grounded in real business information rather than generic AI guesses.",
        solution: "Built an AI-powered Facebook Messenger agent using n8n, Google Gemini, and a live business knowledge base stored in Google Docs. The workflow listens for incoming Messenger webhooks, filters valid customer messages, retrieves relevant business information from the connected document, and uses an AI Agent (with Google Gemini as the chat model and Simple Memory for conversation context) to generate accurate, context-aware responses that are sent back through Facebook Messenger automatically.",
        result: "The automation delivers 24/7 customer support without manual staffing, reduces repetitive inquiries handled by a human, and keeps responses grounded in real business information instead of generic AI guesses. The same pattern (document-based knowledge retrieval + AI Agent) can be adapted for other AI-powered business workflows beyond Messenger."
      },
      stats: [
        { n: '24/7', l: 'Coverage' },
        { n: '6', l: 'Workflow steps' },
        { n: '1', l: 'Doc to update' }
      ],
      concept: {
        title: "Answers come from the business's own document, not the model's memory",
        lead: "The chatbot doesn't improvise. Every reply is grounded in a Google Doc the business owns and controls — opening hours, pricing, services, policies. Edit the doc and the next answer changes: no rebuild, no developer, nobody touching the automation.",
        chain: [
          { label: 'Message arrives' }, { label: 'Validated' }, { label: 'Business info pulled' },
          { label: 'AI writes the reply' }, { label: 'Sent back', kind: 'term' }
        ],
        notes: [
          { label: 'Why a Google Doc', text: 'It is the one place a non-technical owner can confidently edit. Putting the knowledge base somewhere they already know how to use is what keeps it current — a knowledge base nobody updates is worse than none.' },
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
          desc: 'Two checks strip out everything that is not an actual question from a person — delivery receipts, echoes of the page\'s own replies, and system events that would otherwise trigger a pointless answer.',
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
          desc: 'Google Gemini drafts a response using that business information, with short-term memory of the conversation so far — so a follow-up question like "and how much is that?" still makes sense.',
          tags: [{ label: 'Google Gemini', kind: 'ai' }, { label: 'Conversation memory' }],
          flow: 'grounded in the document, aware of the thread'
        },
        {
          marker: '05', title: 'Sent Back to Messenger',
          desc: 'The reply goes back through Facebook to the customer, typically before they have finished waiting to see if anyone is there.',
          tags: [{ label: 'Messenger reply' }],
          flow: 'answered without a person involved'
        }
      ],
      decisions: [
        {
          title: 'The knowledge base is a document the client controls',
          text: 'Business facts change constantly — prices, hours, a service added. Keeping them in a Google Doc means the owner updates their own bot in thirty seconds, instead of messaging whoever built it and waiting.',
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
      number: 'PROJECT 05',
      category: 'AI Automation',
      platform: 'n8n',
      title: 'Lead Follow-up & Recovery System',
      description: 'An automated lead follow-up system that detects replies and re-engages cold leads with AI-personalized outreach — reducing manual follow-up work and recovering leads that would otherwise go cold.',
      tags: ['n8n', 'Groq AI', 'Google Sheets'],
      image: 'assets/projects/lead-followup-system.png',
      caseStudy: {
        client: 'Portfolio Project (Self-Initiated)',
        need: "Businesses that capture leads through forms often lose them simply because follow-up is inconsistent — a lead comes in, gets one confirmation email, and then falls through the cracks if no one manually tracks whether they replied or needs a nudge. Manually tracking every lead's reply status and remembering to send follow-ups at the right intervals doesn't scale — it depends on someone checking inboxes and sheets every day, and leads that don't respond right away are the ones most likely to be forgotten entirely.",
        solution: "Built an n8n workflow that logs incoming leads to Google Sheets, uses an AI Agent (Groq) to draft and send a personalized confirmation email, then waits 3 days and checks for a reply. If there's no response, it automatically sends a first follow-up, waits again, checks again, and sends a final follow-up before marking the lead as closed/no-response — with every stage logged back to the sheet so lead status is always visible.",
        result: "The system removes the need for manual reply-tracking and follow-up timing entirely. Leads are automatically re-engaged at the right intervals without anyone having to remember, and the sheet gives full visibility into where every lead stands in the follow-up sequence at any moment."
      },
      stats: [
        { n: '2', l: 'Automated follow-ups' },
        { n: '3', l: 'Days between touches' },
        { n: '0', l: 'Manual reply tracking' }
      ],
      concept: {
        title: 'The sheet always knows where every lead stands',
        lead: 'Every stage writes back to Google Sheets — logged, confirmed, followed up once, followed up twice, replied, or closed. Nobody has to remember who was chased and when, or dig through an inbox to find out. The sheet is the answer, and it is always current.',
        chain: [
          { label: 'Lead arrives' }, { label: 'Logged' }, { label: 'Confirmation sent' },
          { label: 'Wait 3 days' }, { label: 'Follow-up' }, { label: 'Final follow-up' },
          { label: 'Replied', kind: 'term' }, { label: 'Closed', kind: 'side', detached: true }
        ],
        notes: [
          { label: 'The problem it solves', text: 'Leads rarely go cold because the offer was wrong. They go cold because the second and third follow-up never happened — someone got busy, and the lead who needed one more nudge quietly disappeared.' },
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
          desc: 'Three days pass, then the workflow checks whether the lead responded. A reply ends the sequence immediately — nobody who already answered gets chased.',
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
          text: 'The sequence closes the lead rather than chasing forever. Two well-timed follow-ups recover most of what is recoverable; beyond that the returns collapse and the sender starts looking desperate.',
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
      category: '7-Workflow System',
      platform: 'n8n',
      title: 'Medical Records Retrieval System',
      description: "Getting a patient's records out of a hospital takes weeks of chasing: check the provider is real, send the request, chase it when nobody replies, read whatever comes back, then check what arrived is actually complete. This runs that entire job — seven automations that pass a case along from first request to closed file, and stop for a human at every point where someone genuinely needs to decide something.",
      tags: ['n8n', 'Groq AI', 'Airtable', 'Webhooks', 'Human-in-the-Loop'],
      image: 'assets/projects/medical-records-retrieval.png',
      caseStudy: {
        client: 'Portfolio Project (Self-Initiated, Synthetic Data)',
        need: "Medical records retrieval is high-volume, deadline-driven work that still runs almost entirely on manual effort — someone verifies facility and provider details by hand, drafts and sends each request, tracks dozens of open cases across separate portals, remembers to follow up before the deadline, and reads every facility reply to work out what happens next. None of it connects, case status lives in a spreadsheet or in someone's head, and there's no reliable record of what was sent, when, and who approved it — which in a healthcare setting is the part that matters most.",
        solution: "Built a seven-workflow n8n system on a shared Airtable case tracker, modeling the lifecycle from request to closed case. A webhook takes in the request, validates it, and issues a case ID; a scheduled workflow verifies the facility and provider against a directory API and has Groq judge the match field by field with a confidence score; verified cases get a generated request letter that waits for explicit human approval; approved requests are transmitted by channel priority, then tracked on a priority-based clock that chases unanswered requests and escalates after three attempts rather than nagging a facility forever; inbound replies are classified by AI into five distinct outcomes; and a final workflow builds a completeness checklist for a human to sign off before the case can close. Every stage appends to a per-case audit log.",
        result: "The lifecycle runs end to end on its own — a case moves from intake to completion without anyone manually tracking status — while every call that needs real judgment stays with a person: an uncertain facility match, a request about to go out, a denied or unclear reply, and the final completeness sign-off each stop and wait for a human. Live-tested end to end in n8n, with an unbroken audit trail from CASE_CREATED through CASE_COMPLETED on a single case. Built entirely on synthetic patient, provider, and facility data — a working prototype of the process, not a HIPAA-compliant deployment."
      },
      stats: [
        { n: '8', l: 'Workflows' },
        { n: '68', l: 'Nodes' },
        { n: '5', l: 'Human gates' },
        { n: '0', l: 'Validation errors', good: true }
      ],
      concept: {
        title: 'Airtable is the wiring',
        lead: "Eight automations run a case from request to closed file, and none of them calls the next one directly. Each one watches the shared case tracker for records at a particular stage, does its one job, and marks the case as having moved on. The next automation is already watching for that.",
        chain: [
          { label: 'NEW' }, { label: 'VERIFIED' }, { label: 'PENDING_REVIEW' },
          { label: 'APPROVED' }, { label: 'SENT' }, { label: 'RECEIVED' },
          { label: 'COMPLETED', kind: 'term' }, { label: 'NEEDS_REVIEW', kind: 'side', detached: true }
        ],
        notes: [
          { label: 'Why build it this way', text: "Any single stage can be fixed, restarted, or rewritten without touching the others. And a case that gets stuck is visible as a row sitting at a stage — you can see it, rather than having to hunt through error logs for a job that failed silently three days ago. It also means a person steps in by editing a record, which is exactly how the approval steps work." },
          { label: 'What it costs', text: "Nothing chases the humans. A case waiting on a person sits there until someone opens the tracker and looks — there's no email, no alert. That's the most obvious thing still missing, and it's the next thing I'd build." }
        ]
      },
      stagesTitle: 'The Pipeline, Stage by Stage',
      stages: [
        {
          marker: '00', infra: true, title: 'Mock Facility Directory API',
          desc: "A stand-in provider directory that answers lookups. It exists because there is no real directory to call for invented facilities — stage 02 needs something genuine to verify against.",
          tags: [{ label: 'Webhook', kind: 'hook' }, { label: '3 nodes' }, { label: 'Supporting infra' }]
        },
        {
          marker: '01', title: 'Request Intake & Validation',
          desc: 'Accepts a JSON request, normalizes it, assigns a case ID, and validates required fields. Writes the case whether or not it passes — an incomplete request becomes a tracked case needing information, not a rejected payload that vanishes. Resubmitting with the same case ID corrects that case in place instead of creating a duplicate.',
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
          desc: 'Picks a channel by what contact details exist — email first, then fax, then physical mail — and sends. Fully automated with no human gate, because the decision already happened at stage 03. The send itself is simulated.',
          tags: [{ label: 'Schedule', kind: 'sched' }, { label: '5 nodes' }, { label: 'Simulated send' }],
          flow: 'reads APPROVED → writes SENT'
        },
        {
          marker: '05', title: 'Tracking & Automated Follow-Up',
          desc: "Works out how long it has been since last contact by reading the case's own audit log, then chases based on priority. Physical mail gets an extra six-day buffer on top — chasing a letter at the same interval as an email just generates noise. Escalates after three attempts rather than nagging a facility forever.",
          tags: [{ label: 'Schedule', kind: 'sched' }, { label: '6 nodes' }, { label: 'STAT 4h · URGENT 24h · STANDARD 72h' }],
          flow: 'reads SENT → increments follow-up count, or flags ESCALATION_NEEDED'
        },
        {
          marker: '06', title: 'Provider Response & AI Classification',
          desc: 'Takes an inbound reply and sorts it five ways: records received, needs more info, denied, no records found, or unclear. Only a confident "records received" advances automatically. Every other outcome is a business decision, so it goes to a person — the AI is a quality gate, not a decision-maker.',
          tags: [{ label: 'Webhook', kind: 'hook' }, { label: '10 nodes' }, { label: 'Groq · 5-way classify', kind: 'ai' }],
          flow: 'writes RECEIVED or NEEDS_REVIEW'
        },
        {
          marker: '07', title: 'Records Received & Completion',
          desc: "Mirrors stage 03's two-phase shape. Generates a completeness checklist comparing what was asked for against what arrived, then waits for a human verdict. It deliberately does not try to auto-verify completeness — the system cannot actually read the documents, so claiming otherwise would be a lie in the audit trail.",
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
          text: 'There is no e-fax account and no provider directory for facilities that do not exist. Those integrations are stubbed at a clean boundary — swapping in a real endpoint is a node change, not a redesign.',
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
      number: 'PROJECT 07',
      category: 'Voice AI Receptionist',
      platform: 'n8n + VAPI',
      title: 'AI Receptionist for HVAC',
      description: "A voice agent that answers the phone for an HVAC and plumbing company. It works out what the caller needs from how they describe it, checks the real calendar, books the job into a two-hour window, cancels an existing one from a reference number, and flags a genuine emergency to the on-call phone — no menus, no \"press 1\", and no call that ends without a record.",
      tags: ['n8n', 'VAPI', 'Google Calendar', 'Google Sheets', 'Voice AI'],
      image: 'assets/projects/ai-receptionist.png',
      caseStudy: {
        client: 'Portfolio Project (Self-Initiated, Synthetic HVAC Company)',
        need: "A trades business loses work on the phone. Calls arrive while every technician is already on a job, so they ring out and the customer calls the next company on the list. The ones that do get answered are mostly routine — book me in, move my appointment, are you open Saturday — and each one still occupies whoever picked up. An answering service takes a message but cannot see the calendar, so nothing is actually booked until someone calls back. The hard part is not answering; it is finishing the job on the call: reading the real schedule, writing a real appointment into it, and knowing which call is the burst pipe that should interrupt someone.",
        solution: "Built a voice receptionist on VAPI with all the logic in a single 44-node n8n workflow. The assistant handles the conversation and calls one of four tools; the workflow routes on the tool name, applies the rules, and answers while the caller is still on the line. Booking reads Google Calendar for genuinely open windows, offers them, then re-checks that exact window immediately before writing so two callers cannot be given the same slot. Every booking is written into the calendar event itself — phone, email, address, problem, and a short reference number — because on the second round trip the model sends only what it thinks is needed, and the conversation cannot be trusted as the record. Cancellation matches on that reference first and phone second, which is what makes it work on web calls, where there is no caller ID at all.",
        result: "All four tools run end to end on VAPI web calls: a booking lands in Google Calendar with a reference number, logs to Google Sheets, emails the customer, and alerts the office on Telegram. Eleven separate response paths, every one of them terminating at a Respond node, verified by a pre-flight script written for this build that traces every path from the webhook and catches unwired error outputs before a call ever hits them. The work is documented as a 426-line playbook of symptom, cause and fix — written so the next voice build starts where this one finished. Not yet on a provisioned phone number: tested through VAPI web calls, so the PSTN leg is the remaining step. Synthetic company, synthetic bookings."
      },
      stats: [
        { n: '44', l: 'Nodes' },
        { n: '4', l: 'Voice tools' },
        { n: '11', l: 'Respond paths' },
        { n: '5', l: 'Integrations' }
      ],
      concept: {
        title: 'The calendar event is the record, not the conversation',
        lead: "A booking takes more than one round trip, and on the second one the assistant sends only what it judges relevant — usually just a reference number. Anything held only in the conversation arrives blank. So the details are written into the calendar event at booking time and read back out of it later. The event is the source of truth; the call is just how it got filled in.",
        chain: [
          { label: 'Caller describes the problem' },
          { label: 'Assistant calls a tool' },
          { label: 'n8n applies the rules' },
          { label: 'Answer while they wait' },
          { label: 'Event, sheet, alert', kind: 'term' }
        ],
        notes: [
          { label: 'A reference number beats caller ID', text: 'Web calls carry no caller number, and in real life people ring from a different phone. Booking issues a short reference and puts it in the event title, so cancelling matches on something the caller actually has rather than on where they happen to be calling from.' },
          { label: 'Re-check the window before writing it', text: 'The calendar is read on the first round trip and written on the second. Two callers offered the same window would both get it, so the exact window is queried again immediately before the write — and if it has gone, the assistant says so rather than double-booking a technician.' },
          { label: 'Answer first, bookkeeping after', text: 'The response goes out before the calendar write, the sheet row, the email and the alert, so the caller is never listening to silence while an API call finishes. Logging steps are set to fail open — a Telegram hiccup must never take down a live call.' }
        ]
      },
      stagesTitle: 'One Webhook, Four Tools',
      stages: [
        {
          marker: '01', title: 'Parse and Route',
          desc: 'Every tool call from the assistant arrives at one webhook. The payload is parsed, the tool name read, and the call routed to its branch — with a fallback branch for a tool name that does not match, so an unrecognised call still gets a spoken answer and a logged row instead of dead air.',
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
          desc: 'A caller describing damage happening right now skips the booking flow entirely and goes straight to a high-priority Telegram alert, with an after-hours check deciding how it is routed. The caller decides what counts as an emergency, not the model — asking someone standing in water whether it can wait a few days is the wrong question.',
          tags: [{ label: 'After-hours check', kind: 'sched' }, { label: 'Priority alert', kind: 'human' }],
          flow: 'caller says it is urgent → alert now → log'
        },
        {
          marker: '05', title: 'log_lead',
          desc: 'The catch-all, and the reason no call ends empty-handed. Anything that is not a booking, a cancellation or an emergency is captured as a lead — and the assistant is instructed that every call must end with a tool call, so a conversation it cannot finish still leaves a row someone can follow up.',
          tags: [{ label: 'Google Sheets', kind: 'sched' }, { label: 'Every call leaves a row' }],
          flow: 'no call disappears without a record'
        }
      ],
      decisions: [
        {
          title: 'The rule goes in the parameter description, not the prompt',
          text: 'The assistant kept sending an empty slot field however firmly the system prompt was worded. Moving the instruction into the description of the parameter itself — where the model is actually deciding what to write into that field — fixed in one change what three prompt rewrites could not. The prompt is context; the parameter description is the point of decision.',
          cost: 'the tool schema becomes the real documentation, so a rule changed in the prompt alone silently does nothing'
        },
        {
          title: 'Delete any parameter you do not want filled',
          text: 'The prompt said not to ask for a phone number, but the schema still had a phone field — and the alerts started arriving with invented numbers in them. A model given an empty slot will fill it rather than leave it blank. Removing the field entirely is the only reliable fix, because an absent field cannot be hallucinated.',
          cost: 'a second guard is still needed in the parser for the fields that do have to stay'
        },
        {
          title: 'Normalise what the model says, server-side',
          text: 'Emails arrive as the literal words "mark reyes at example dot com". Phone numbers arrive as placeholder digits. Read-backs group digits into "eight ninety-five four" unless the value is sent pre-spaced. None of this is reliably fixable from the prompt, so every value is normalised and sanity-checked in the workflow before it is written anywhere.',
          cost: 'parser code that has to be maintained alongside the prompt'
        },
        {
          title: 'Transfers removed on purpose',
          text: 'Blind-transferring an emergency to a technician already on a job helps nobody, and a transfer that cannot be completed is worse than one never offered — the assistant announces it, the call drops, and no record exists. Emergencies became an immediate alert to a person who can call back instead.',
          cost: 'no path to a live human mid-call; the fastest response is a callback, not a transfer'
        }
      ],
      status: [
        {
          kind: 'ok', title: 'Done',
          items: [
            'All four tools working end to end on VAPI web calls — booking writes a real calendar event, logs to Sheets, emails the customer and alerts Telegram',
            'Pre-flight script written for this build: traces every path from the webhook to a Respond node, checks node references resolve, and catches unwired error outputs',
            'Every failure mode documented as a 426-line symptom / cause / fix playbook so the next voice build does not re-learn them'
          ]
        },
        {
          kind: 'warn', title: 'Not yet exercised',
          items: [
            'No provisioned phone number — tested on web calls, so the PSTN leg is unproven',
            'Seven-day booking horizon: "next Friday" books the near one, and a bare date like "the 25th" does not parse',
            'Two-hour windows only, with no custom durations'
          ]
        },
        {
          kind: 'stop', title: 'Known boundaries',
          items: [
            'One calendar with no technician assignment — nothing models who is actually doing the work',
            'No rescheduling primitive: a reschedule is a cancel plus a booking in one call, two operations that can half-fail',
            'Transfers deliberately not implemented — an emergency becomes an alert and a callback, never a live handoff'
          ]
        }
      ]
    },
    {
      number: 'PROJECT 08',
      category: 'Voice AI Call Routing',
      platform: 'n8n + VAPI + GHL',
      title: 'Northshore Urgent Care',
      description: "A voice receptionist for an urgent care clinic. Maya answers, looks the caller up, works out which department they actually need from how they describe it, and either transfers them or takes a message that lands in the CRM as a task someone owns. The routing decision is made in the automation, not in the assistant's instructions — so it can be read, tested, and corrected.",
      tags: ['n8n', 'VAPI', 'Groq', 'Google Sheets', 'GoHighLevel'],
      image: 'assets/projects/northshore-receptionist.png',
      caseStudy: {
        client: 'Portfolio Project (Self-Initiated, Fictional Clinic)',
        need: "An urgent care front desk answers the same handful of calls all day — billing questions, test results, wait times, occupational health, and the occasional caller who genuinely needs a nurse. A phone tree makes every one of them press through a menu that never quite fits, and an answering service cannot see who the caller is or decide what is urgent. The real problem is the decision: working out, in a few seconds and from the caller's own words, which department this is — and being able to prove afterwards that the decision was right.",
        solution: "Built a VAPI voice assistant with a single n8n workflow behind it. One webhook takes every event and fans out on VAPI's message type into three branches: a tool call looks the patient up in Google Sheets and builds context; a transfer request classifies the transcript with Groq, checks it against a department routing sheet, and approves or declines the transfer against opening hours; the end-of-call report logs the call and decides whether it needs escalating. Anything that cannot be transferred becomes a contact and a task in GoHighLevel, so the callback is owned by a person rather than sitting in a message queue. Every routing decision is written to its own sheet with the classification that produced it — which is what makes the system auditable rather than merely functional.",
        result: "Routing confirmed correct on real VAPI calls across three departments — billing, triage, and occupational health — verified in the Routing_Decisions sheet by checking the workflow's own classification against the department the assistant actually announced. Getting there meant finding a bug that every green node in n8n was hiding: a doubled character in one request body made the classifier fail on every single call, and a safe fallback quietly sent all of them to the front desk. It also meant discovering that the earlier fix had been confirmed against a test payload of the wrong shape, so the confirmation was worthless. Two departments remain untested, and the transfer bridge itself cannot be proven from a browser call."
      },
      stats: [
        { n: '3', l: 'Event types' },
        { n: '3', l: 'Departments proven live' },
        { n: '28', l: 'Nodes' },
        { n: '5', l: 'Integrations' }
      ],
      concept: {
        title: 'Every node was green while every call was misrouted',
        lead: "One request body had a doubled leading character, so the classifier rejected every call it was sent. The code downstream caught the failure and fell back to the front desk — which is exactly what a careful fallback is supposed to do. The result was a system with a one hundred percent failure rate, reporting success at every step, for an unknown length of time. Nothing was red. Nothing was logged. The calls simply all went to the wrong place.",
        chain: [
          { label: 'Classifier rejects the call' },
          { label: 'Fallback catches it' },
          { label: 'Routes to front desk' },
          { label: 'Node shows green' },
          { label: 'Nobody finds out', kind: 'term' }
        ],
        notes: [
          { label: 'The lesson is visibility, not the fallback', text: 'The fallback was correct — losing a call is worse than misrouting one. What was missing is that it fired silently. A fallback with no counter, flag or logged reason behind it will eventually hide a total failure behind a working interface, and the longer it works the less anyone thinks to check it.' },
          { label: 'A synthetic payload proves only your assumption', text: 'The first fix looked confirmed because it was tested against a payload written by hand. The real transfer events had a different shape — no flat transcript at all, only an array of messages — so the classifier had been receiving an empty string every time. The test proved the code handled the shape it was given, and nothing more. Real payloads get captured first now.' },
          { label: 'The tool cannot carry the answer', text: "VAPI's built-in transfer tool has no custom parameter schema, so the assistant can never pass the department as an argument no matter how the prompt is worded — the arguments always arrive empty. Routing rests entirely on the workflow's own reading of the transcript. That makes the transcript reconstruction load-bearing rather than a nicety." }
        ]
      },
      stagesTitle: 'One Webhook, Three Event Types',
      stages: [
        {
          marker: '01', title: 'Authenticate and Fan Out',
          desc: 'Every VAPI event hits the same webhook. The payload is parsed, a shared secret checked, and the call routed on its message type — with an unauthorized response and a fallback branch both wired, so a bad secret or an unexpected event type still gets an answer instead of dead air.',
          tags: [{ label: 'Webhook', kind: 'hook' }, { label: 'Shared secret', kind: 'human' }, { label: 'Switch · 3 types' }],
          flow: 'one entry point · auth before anything else'
        },
        {
          marker: '02', title: 'Patient Lookup',
          desc: 'A tool call from the assistant mid-conversation. Reads the patient sheet, builds a context object the assistant can speak from, responds, and appends the lookup to a log. Matching by phone only works on a real phone call — on a browser test there is no caller ID to match on at all.',
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
          desc: 'Fires once the call is over. Extracts the report, logs it, and decides whether it needs escalating — an internal notification if so. If a callback number was captured, the caller is upserted into GoHighLevel and a task created against them, so the follow-up is owned rather than queued.',
          tags: [{ label: 'GHL contact + task' }, { label: 'Escalation branch', kind: 'human' }, { label: 'Gmail notify' }],
          flow: 'report → log → escalate if needed → CRM contact and task'
        }
      ],
      decisions: [
        {
          title: 'The routing decision lives in the automation, not the prompt',
          text: 'The assistant could have been told which department to pick. Instead it talks, and the workflow decides what the conversation meant — classification, opening hours, and per-department rules all sit in logic that can be read and tested. It also turned out to be the only option available: the transfer tool cannot carry a department argument at all.',
          cost: 'a network round trip mid-call, and a classifier that has to be right'
        },
        {
          title: 'A silent fallback needs its own visibility',
          text: 'The fallback that hid the misrouting bug was not removed — it is still the right behaviour. What changed is that the routing decision and the classification behind it are now written to their own sheet on every call, so a fallback firing repeatedly is something you can see rather than something you have to suspect.',
          cost: 'a log row per call, and a habit of actually reading it'
        },
        {
          title: 'The spoken callback number beats caller ID',
          text: "There are two numbers for a caller and they are not the same thing: the one telephony reports, and the one the caller says out loud. The spoken number works even on a browser call, and respects a caller who asks to be reached somewhere else — so it takes priority when writing to the CRM.",
          cost: 'a returning caller who gives a different number can end up as more than one contact'
        },
        {
          title: 'The emergency check had to be made silent, explicitly',
          text: 'An instruction to screen for emergencies was read by the assistant as a script to perform out loud — a caller ringing about a bill was told to hang up and dial emergency services. Saying "run this check" is not enough; the instruction has to state that the list is never spoken, and that a caller asking about a bill must never hear the word at all.',
          cost: 'prompt rules that read as oddly emphatic until you know what they are preventing'
        }
      ],
      status: [
        {
          kind: 'ok', title: 'Proven on real calls',
          items: [
            'Routing confirmed correct on live VAPI calls for billing, triage and occupational health — checked in the routing log, not just heard on the call',
            'Transcript reconstruction from the message array, after the flat transcript field turned out never to exist on transfer events',
            'Structured outputs used to capture caller name, callback number and reason, working around a call summary this VAPI version never populates'
          ]
        },
        {
          kind: 'warn', title: 'Not yet retested',
          items: [
            'CRM contact and task fixes, plus the callback-number guard, are live in the workflow but have not been re-run on a real call',
            'Two departments — wait times and results — have never been tested at all',
            'No error workflow attached yet, so a failure outside the handled branches surfaces nowhere'
          ]
        },
        {
          kind: 'stop', title: 'What a browser call cannot prove',
          items: [
            'There is no phone leg, so a correctly approved transfer still ends in a transfer failure every time — the bridge itself is unprovable from a browser',
            'There is no caller ID, so the patient sheet lookup can never match on phone from a test call',
            'Fictional clinic, synthetic patient data — a working model of the process, not a compliant deployment'
          ]
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
    document.getElementById('projectDetailClient').textContent = project.caseStudy.client;
    document.getElementById('projectDetailNeed').textContent = project.caseStudy.need;
    document.getElementById('projectDetailSolution').textContent = project.caseStudy.solution;
    document.getElementById('projectDetailResult').textContent = project.caseStudy.result;

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
