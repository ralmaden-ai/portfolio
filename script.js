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
      image: 'n8n workflows/AU_Businesshub.png',
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
      image: 'thumbs/peak-performance-workflow.png',
      imageFull: 'GHL Workflows/Appointment Confirmation + Reminders - Peak Performance.png',
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
      image: 'thumbs/harbor-vale-workflow.png',
      imageFull: 'GHL Workflows/Harbor & Vale - New Lead Intake (Buyer Seller Branch_2026-08-13.png',
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
      image: 'n8n workflows/Facebook_chatbot.png',
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
      image: 'n8n workflows/Lead_followup_system.png',
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
      image: 'n8n workflows/Medical_records_retrieval.png',
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
      category: 'Voice AI Routing',
      platform: 'n8n + VAPI',
      title: 'Voice IVR Call Router',
      description: "An AI receptionist for a clinic. It answers the phone, works out what the caller actually needs from how they describe it — no menus, no \"press 1\" — and gets them to the right place in under a second: transferred to a person, booked for a callback, or logged as a request. Six departments, each handled the way that department actually works.",
      tags: ['n8n', 'VAPI', 'Airtable', 'Voice AI', 'Groq'],
      image: 'n8n workflows/ivr_router_diagram.svg',
      caseStudy: {
        client: 'Portfolio Project (Self-Initiated, Synthetic Clinic)',
        need: "A clinic front desk spends its day on calls that mostly are not clinical — appointment changes, billing questions, refill requests, records requests — and every one of them occupies a person who could be doing something else. A phone tree is the usual answer, and everyone hates it: rigid menus, no idea what the caller actually wants, and the genuinely urgent call queued behind someone asking about a copay. The hard part is not answering the phone; it is deciding, quickly and correctly, where each call should go — and knowing when the answer is \"a human, right now.\"",
        solution: "Built a voice AI front desk on VAPI with the routing logic in n8n. The assistant handles the conversation and reports what it heard; a real-time workflow applies the routing rules and answers while the caller is still on the line, then logs and alerts after the response has gone out. A second workflow fires once the call ends and turns the outcome into a department ticket. Routing is not uniform: medical records never transfers, nurse triage always reaches a human, and below 60% confidence nothing routes at all — the assistant asks one more question instead of guessing.",
        result: "Six departments, each with routing that reflects how that department actually works rather than one generic transfer rule. The latency-critical path answers in under a second because nothing that touches the network sits upstream of the response node. Both workflows validate clean, and code review caught two silent-failure classes before any live call — an unmatched call record that would have filed a nurse-triage callback as a low-priority front-desk inquiry, and a retried webhook that would have created duplicate tickets. Not yet live-tested end to end: VAPI cannot reach a localhost webhook, so a public tunnel is the next step. Synthetic clinic, synthetic data, not HIPAA compliant."
      },
      stats: [
        { n: '2', l: 'Workflows' },
        { n: '15', l: 'Nodes' },
        { n: '58', l: 'Expressions' },
        { n: '6', l: 'Departments' }
      ],
      concept: {
        title: 'The routing decision lives in n8n, not the prompt',
        lead: "The AI could simply have been told which department to pick. Instead it reports what it heard, and the automation decides what that means. Opening hours, escalation rules, and how certain the AI has to be before it acts all live in logic you can read, test, and change — rather than being buried in the AI's instructions where nobody can check them.",
        chips: [
          { label: 'Appointments' }, { label: 'Billing' }, { label: 'Prescription refill' },
          { label: 'Front desk' }, { label: 'Medical records', kind: 'sched' }, { label: 'Nurse triage', kind: 'human' }
        ],
        notes: [
          { label: 'Medical records never transfers', text: 'Requesting records is asynchronous by nature — nobody needs a live person to lodge one. It is captured and ticketed, and it feeds straight into the retrieval pipeline in Project 06.' },
          { label: 'Nurse triage always reaches a human', text: 'Open or closed, falling through to an after-hours service, plus a high-priority alert. The assistant is instructed never to assess symptoms — it records the caller’s own words verbatim and hands off.' },
          { label: 'Everything else', text: 'Transfers during business hours and becomes a callback ticket outside them. Below 60% confidence nothing routes at all; the assistant asks one more question instead of guessing.' }
        ]
      },
      stagesTitle: 'Two Entry Points, Two Different Clocks',
      stages: [
        {
          marker: '01', title: 'Real-Time Call Router',
          desc: 'The assistant calls this mid-conversation and waits for an answer, so every millisecond is dead air on the line. The response goes out before anything is logged: parse the tool call, apply the routing rules with zero network calls, respond — then log to Airtable, then alert the on-call nurse if it was triage.',
          tags: [{ label: 'Webhook', kind: 'hook' }, { label: '7 nodes' }, { label: '29 expressions' }, { label: 'Sub-second', kind: 'ai' }],
          flow: 'caller is on the line · nothing that makes a network call may sit upstream of the response'
        },
        {
          marker: '02', title: 'Post-Call Processor',
          desc: 'Fires once the call is over, when latency no longer matters. Normalizes the end-of-call report, finds the record the router wrote, builds the department ticket, updates the record and creates the ticket, and emails if a transfer failed.',
          tags: [{ label: 'Webhook', kind: 'hook' }, { label: '8 nodes' }, { label: '29 expressions' }],
          flow: 'upsert keyed on the call ID, so a retried webhook cannot file a second ticket'
        }
      ],
      decisions: [
        {
          title: 'The automation decides the route, not the AI',
          text: "The AI reports what it heard; the workflow decides what that means. Opening hours, escalation rules, and confidence thresholds become logic you can test and change in one place — instead of instructions inside a prompt that nobody can verify until a call goes wrong.",
          cost: 'roughly a third of a second to eight-tenths of a second of extra delay on every call'
        },
        {
          title: 'Answer the caller first, save the record afterwards',
          text: "The workflow keeps running after it has replied, so writing the call to the database happens on the caller's behalf but not on their time — they hear the answer while the bookkeeping is still going on behind them.",
          cost: 'a failed database write could silently swallow the on-call alert further down the chain — fixed by letting that step fail without stopping the rest'
        },
        {
          title: 'A retried message must never create a second ticket',
          text: 'Phone providers retry the end-of-call message when they are unsure it arrived. The original build gave each ticket a random ID, so a retry would file a duplicate for the same call. Now the ticket ID is derived from the call itself, so the same call always produces the same ticket — a retry updates it rather than doubling it.',
          cost: 'ticket numbers are no longer neatly sequential'
        }
      ],
      status: [
        {
          kind: 'ok', title: 'Done',
          items: [
            'Both workflows hand-authored, imported, and validating clean — 0 errors, 0 warnings across 58 expressions',
            'Airtable base and tables built via the Metadata API, with credentials attached to every node',
            'Two silent-failure classes found and fixed in review: unmatched call records, and duplicate tickets on webhook retry'
          ]
        },
        {
          kind: 'warn', title: 'Blocked on setup',
          items: [
            'VAPI cannot reach a localhost webhook — a public tunnel has to be running before any live call works',
            'Gmail OAuth consent not yet confirmed as connected',
            'Both workflows still inactive'
          ]
        },
        {
          kind: 'stop', title: 'Known gaps',
          items: [
            'Not yet live-tested end to end — the routing logic is validated, not proven on a real call',
            'The real VAPI payload shape is still unconfirmed; the parsers hedge across four variants and report which one they found',
            'Phone transfer never tested against a real line — browser calls only, so the PSTN bridge is unexercised'
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
