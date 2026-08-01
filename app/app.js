/* =========================================================
   MyCareerSprint App Shell — client-side prototype logic.
   All state is in-memory (resets on reload) since this is a
   design/UX prototype with no backend yet. Swap STATE-mutating
   functions for real API calls when wiring up a server.
   ========================================================= */

/* ---------------- Sample data pools ---------------- */
const TASK_POOL = [
  { title: "Tailor resume to Senior PM role at Acme", meta: "Resume Center · ~8 min" },
  { title: "Practice 5 behavioral interview questions", meta: "Interview Practice · ~10 min" },
  { title: "Refresh your LinkedIn headline", meta: "LinkedIn Optimizer · ~5 min" },
  { title: "Follow up on the Nimbus Corp application", meta: "Application Tracker · ~2 min" },
  { title: "Draft a cover letter for the Riverline role", meta: "Cover Letter Builder · ~6 min" },
  { title: "Research salary range for your target title", meta: "Salary Negotiation guide · ~7 min" },
  { title: "Ask one contact for a warm introduction", meta: "Networking · ~5 min" },
  { title: "Review this week's roadmap milestone", meta: "Career Roadmap · ~3 min" },
];

const INTERVIEW_QUESTIONS = {
  Behavioral: [
    { q: "Tell me about a time you had to influence someone without direct authority.", f: "Use STAR: set the Situation and Task in 2 sentences, spend most of your time on the Action you personally took, and close with a measurable Result." },
    { q: "Describe a project that failed. What did you learn?", f: "Own the failure honestly, focus on the specific decision you'd change, and end with how you've applied that lesson since." },
    { q: "Tell me about a time you disagreed with your manager.", f: "Show you raised it respectfully, with evidence, and describe the outcome — even if your view didn't win." },
  ],
  Technical: [
    { q: "Walk me through how you'd approach debugging a production incident.", f: "Start with triage and containment, then root cause, then prevention. Mention communication to stakeholders throughout." },
    { q: "How would you design a system to handle 10x current traffic?", f: "Clarify constraints first, then talk through bottlenecks, caching, and horizontal scaling before jumping to a specific stack." },
  ],
  Situational: [
    { q: "A key deadline is at risk because a dependency is late. What do you do?", f: "Show you'd quantify the risk, communicate early, and propose 2-3 options rather than just reporting the problem." },
    { q: "You inherit a project with unclear requirements. First three steps?", f: "Clarify the goal with stakeholders, audit what exists, then propose a lightweight plan before building anything." },
  ],
  "Salary Negotiation": [
    { q: "The recruiter asks your salary expectations first. How do you respond?", f: "Redirect to the range for the role, or give a well-researched range anchored slightly above your target." },
    { q: "You get an offer 15% below what you researched. What's your move?", f: "Thank them, reference specific market data, and counter with a number plus rationale — never just 'I was hoping for more.'" },
  ],
};

const SAMPLE_RESUME_TEXT = `Product manager with 6 years of experience leading cross-functional teams to launch B2B SaaS
features. Managed roadmap, prioritized backlog, ran user research, partnered with engineering and design,
shipped analytics dashboard, improved retention, led A/B testing, stakeholder communication, agile scrum,
data-driven decisions, customer discovery interviews, KPI tracking, go-to-market planning.`;

const ROADMAP_MILESTONES = [
  { title: "Clarify your target role", desc: "Defined the title, industry, and level you're aiming for." },
  { title: "Resume & LinkedIn foundation", desc: "Resume scored 80+, LinkedIn headline and About rewritten." },
  { title: "Active applications", desc: "10+ tailored applications out, tracked and followed up." },
  { title: "Interview loop", desc: "Practiced behavioral and technical rounds for your target role." },
  { title: "Offer & negotiation", desc: "Evaluate, negotiate, and accept with confidence." },
];

const COACHES = [
  { name: "Dana Whitfield", specialty: "Resume & ATS strategy", slot: "Tomorrow, 2:00 PM" },
  { name: "Reuben Cole", specialty: "Technical interview coaching", slot: "Thu, 10:30 AM" },
  { name: "Ines Park", specialty: "LinkedIn & personal brand", slot: "Fri, 1:00 PM" },
  { name: "Marco Delgado", specialty: "Salary negotiation", slot: "Mon, 4:00 PM" },
];

/* ---------------- State ---------------- */
const state = {
  onboarded: false,
  user: { name: "", role: "", situation: "", plan: "free" },
  streak: 4,
  tasks: TASK_POOL.slice(0, 3).map((t, i) => ({ id: i + 1, ...t, done: i === 0 })),
  applications: [
    { id: 1, company: "Acme Corp", role: "Senior Product Manager", stage: "Interviewing", date: "2026-07-18", link: "" },
    { id: 2, company: "Nimbus Corp", role: "Product Manager", stage: "Applied", date: "2026-07-22", link: "" },
    { id: 3, company: "Riverline", role: "Group PM", stage: "Saved", date: "2026-07-27", link: "" },
  ],
  resumes: [
    { id: 1, name: "Resume_2026_PM.pdf", score: 78, uploadedAt: "2026-07-15" },
  ],
  chatMessages: [
    { from: "bot", text: "Hi! I'm your AI Career Coach. Tell me what you're working on today — an interview, a resume, LinkedIn, or just where to start." },
  ],
  interview: { category: "Behavioral", index: 0, showFramework: false, timerSeconds: 0, timerRunning: false, timerHandle: null },
  roadmapCurrent: 2, // index of current milestone (0-based)
  savedResources: [],
  bookings: [],
  dismissedHelp: new Set(),
};

/* ---------------- Router ---------------- */
const AUTH_ROUTES = ["login", "onboarding"];
let onboardingStep = 1;
let onboardingData = { name: "", role: "", situation: "", plan: "free" };

function currentRoute() {
  const hash = location.hash.replace(/^#\/?/, "");
  return hash || (state.onboarded ? "dashboard" : "onboarding");
}

function navigate(route) {
  location.hash = "/" + route;
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  if (params.get("plan") === "pro") onboardingData.plan = "pro";
  render();
  setupInstallPrompt();
  registerServiceWorker();
});

function render() {
  const route = currentRoute();
  const isAuth = AUTH_ROUTES.includes(route);
  document.getElementById("authContainer").classList.toggle("active", isAuth);
  document.getElementById("appShell").style.display = isAuth ? "none" : "flex";

  if (isAuth) {
    renderAuth(route);
  } else {
    if (!state.onboarded) {
      // allow deep links, but keep a demo user so the shell has content
      state.user.name = state.user.name || "Guest";
    }
    renderAppShell(route);
  }
}

/* ---------------- Auth / Onboarding ---------------- */
function renderAuth(route) {
  const el = document.getElementById("authContainer");
  if (route === "login") {
    el.innerHTML = `
      <div class="auth-card">
        <img src="${window.LOGO_SRC}" alt="MyCareerSprint" style="height:34px;margin-bottom:20px;">
        <h2>Welcome back</h2>
        <p class="muted small">Demo mode — any email &amp; password signs you into a sample account.</p>
        <div class="field"><label for="loginEmail">Email</label><input id="loginEmail" type="email" placeholder="you@email.com"></div>
        <div class="field"><label for="loginPw">Password</label><input id="loginPw" type="password" placeholder="••••••••"></div>
        <button class="btn btn-primary btn-block" data-action="doLogin">Log In</button>
        <p class="text-center small muted" style="margin-top:16px;">New here? <a href="#/onboarding">Start Free</a></p>
      </div>`;
  } else {
    el.innerHTML = renderOnboardingStep();
  }
  bindAuthEvents();
}

function renderOnboardingStep() {
  const dots = [1, 2, 3, 4].map(n => `<span class="dot ${n <= onboardingStep ? 'active' : ''}"></span>`).join("");
  let content = "";
  if (onboardingStep === 1) {
    content = `
      <h2>Let's set up your sprint</h2>
      <p class="muted small">Two quick questions so your dashboard is personalized from day one.</p>
      <div class="field"><label for="obName">Your first name</label><input id="obName" type="text" value="${onboardingData.name}" placeholder="Jordan"></div>
      <div class="field"><label for="obRole">Target role</label><input id="obRole" type="text" value="${onboardingData.role}" placeholder="e.g. Senior Product Manager"></div>
      <button class="btn btn-primary btn-block" data-action="obNext">Continue</button>`;
  } else if (onboardingStep === 2) {
    const options = [
      ["Employed, looking quietly", "employed"],
      ["Recently laid off", "layoff"],
      ["Changing careers", "change"],
      ["Ready to advance where I am", "advance"],
    ];
    content = `
      <h2>Where are you starting from?</h2>
      <p class="muted small">This shapes your first recommended actions.</p>
      ${options.map(([label, val]) => `
        <label class="option-tile ${onboardingData.situation === val ? 'selected' : ''}">
          <input type="radio" name="situation" value="${val}" ${onboardingData.situation === val ? 'checked' : ''} data-action="obSituation">
          ${label}
        </label>`).join("")}
      <div class="flex gap-3" style="margin-top:8px;">
        <button class="btn btn-secondary" data-action="obBack">Back</button>
        <button class="btn btn-primary btn-block" data-action="obNext">Continue</button>
      </div>`;
  } else if (onboardingStep === 3) {
    content = `
      <h2>Add your resume</h2>
      <p class="muted small">Optional now — you can always add it from the Resume Center later.</p>
      <div class="field">
        <label for="obResume">Upload resume (PDF or DOCX)</label>
        <input id="obResume" type="file" accept=".pdf,.doc,.docx">
      </div>
      <div class="flex gap-3" style="margin-top:8px;">
        <button class="btn btn-secondary" data-action="obBack">Back</button>
        <button class="btn btn-primary btn-block" data-action="obNext">Continue</button>
      </div>`;
  } else {
    content = `
      <h2>You're set, ${onboardingData.name || "there"} 🎉</h2>
      <p class="muted small">Plan: <strong>${onboardingData.plan === 'pro' ? 'Pro Sprint' : 'Free'}</strong> · Target role: <strong>${onboardingData.role || "—"}</strong></p>
      <p class="muted small">Next, add MyCareerSprint to your home screen so it feels like a real app, and jump into your first recommended action.</p>
      <button class="btn btn-primary btn-block" data-action="obFinish">Enter my dashboard →</button>
      <button class="btn btn-ghost btn-block" data-action="installApp" id="obInstallBtn" style="display:none;margin-top:8px;">📲 Add to home screen</button>
      <div class="flex gap-3" style="margin-top:8px;">
        <button class="btn btn-secondary btn-block" data-action="obBack">Back</button>
      </div>`;
  }
  return `<div class="auth-card"><div class="wizard-progress">${dots}</div>${content}</div>`;
}

function bindAuthEvents() {
  document.querySelectorAll("[data-action]").forEach(elm => {
    elm.addEventListener("click", handleAction);
  });
  const installBtn = document.getElementById("obInstallBtn");
  if (installBtn && window.deferredInstallPrompt) installBtn.style.display = "block";
}

/* ---------------- App shell ---------------- */
const NAV = [
  { group: "Overview", items: [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "coach", label: "AI Career Coach", icon: "🤖" },
    { id: "today", label: "Today's CareerSprint", icon: "⚡" },
  ]},
  { group: "Career Tools", items: [
    { id: "resume-center", label: "Resume Center", icon: "📄" },
    { id: "resume-match", label: "Resume-to-Job Match", icon: "🎯" },
    { id: "tracker", label: "Job Application Tracker", icon: "📋" },
    { id: "interview", label: "Interview Practice", icon: "🎤" },
    { id: "cover-letter", label: "Cover Letter Builder", icon: "✉️" },
    { id: "linkedin", label: "LinkedIn Optimizer", icon: "🔗" },
  ]},
  { group: "Growth", items: [
    { id: "roadmap", label: "Career Roadmap", icon: "🗺️" },
    { id: "resources", label: "Resources", icon: "📚" },
    { id: "coaching", label: "Virtual Coaching", icon: "🧑‍🏫" },
  ]},
];

/* ---------------- In-app help copy ----------------
   One short explainer per view: what the tool does, and how it moves
   the user closer to landing the job — shown once per session per view. */
const HELP_COPY = {
  dashboard: {
    icon: "🏠",
    title: "Your daily command center",
    body: "This pulls together your progress across every tool — resume, applications, interviews, LinkedIn — so each morning you know your single best next move instead of facing a wall of tasks.",
  },
  coach: {
    icon: "🤖",
    title: "Ask instead of guessing",
    body: "Stuck on what to do next, how to phrase something, or whether an approach is smart? Ask here. Your coach knows every CareerSprint tool and points you to the right one instead of leaving you with generic advice.",
  },
  today: {
    icon: "⚡",
    title: "Small, focused, done",
    body: "Job searches stall on vague, endless to-do lists. Today's CareerSprint gives you 2-3 specific actions sized to fit a real day, so you build momentum instead of losing it.",
  },
  "resume-center": {
    icon: "📄",
    title: "Know your score before a recruiter does",
    body: "Upload any version of your resume and get a plain-English score plus specific fixes — the same signals a recruiter's 7-second scan reacts to — so you fix what matters before you hit send.",
  },
  "resume-match": {
    icon: "🎯",
    title: "Stop guessing what a job post wants",
    body: "Paste any job description and see exactly which of your skills and keywords line up, and which are missing, before you apply. Closing that gap is often the difference between a maybe and an interview.",
  },
  tracker: {
    icon: "📋",
    title: "Nothing falls through the cracks",
    body: "Log every application in one place, see your pipeline by stage, and know exactly who to follow up with this week. A tracked search moves faster than one held together by memory and open browser tabs.",
  },
  interview: {
    icon: "🎤",
    title: "Walk in having already answered the hard ones",
    body: "Practice real behavioral, technical, situational, and negotiation questions with a timer and an answer framework for each, so the first time you hear a tough question isn't in the actual interview.",
  },
  "cover-letter": {
    icon: "✉️",
    title: "A tailored letter in minutes, not an hour",
    body: "Enter the role and your real strengths and get a first draft built around this specific job, not a generic template. Edit it into your own voice, then send it with the application it belongs to.",
  },
  linkedin: {
    icon: "🔗",
    title: "Turn your profile into a recruiter magnet",
    body: "Most profiles quietly repel recruiters with vague headlines and “seeking opportunities” language. Paste yours in for a scored review plus a rewritten headline built around your target role.",
  },
  roadmap: {
    icon: "🗺️",
    title: "See the whole path, not just today",
    body: "Your search moves through real stages — foundation, active applications, interviews, offer. Knowing which one you're in keeps you focused on what actually moves you forward next.",
  },
  resources: {
    icon: "📚",
    title: "Go deeper, for free",
    body: "Every guide and video from the CareerSprint library, organized by exactly what you're dealing with right now, so you're never more than a click from the specific help you need.",
  },
  coaching: {
    icon: "🧑‍🏫",
    title: "When you want a second set of eyes",
    body: "The app gets you most of the way there on your own. For a big interview or a big decision, book time with a real coach who can catch what a tool can't.",
  },
};

function renderHelp(route) {
  if (state.dismissedHelp.has(route)) return "";
  const h = HELP_COPY[route];
  if (!h) return "";
  return `
    <div class="help-banner">
      <span class="help-icon">${h.icon}</span>
      <div class="help-text">
        <p class="help-title">${h.title}</p>
        <p class="help-body">${h.body}</p>
      </div>
      <button class="help-dismiss" data-action="dismissHelp" data-help-route="${route}" aria-label="Dismiss">✕</button>
    </div>`;
}

const VIEW_TITLES = {
  dashboard: "Dashboard", coach: "AI Career Coach", today: "Today's CareerSprint",
  "resume-center": "Resume Center", "resume-match": "Resume-to-Job Match",
  tracker: "Job Application Tracker", interview: "Interview Practice",
  "cover-letter": "Cover Letter Builder", linkedin: "LinkedIn Optimizer",
  roadmap: "Career Roadmap", resources: "Resources", coaching: "Virtual Coaching",
};

function renderAppShell(route) {
  const safeRoute = VIEW_TITLES[route] ? route : "dashboard";
  document.getElementById("appShell").innerHTML = `
    <div class="sidebar-backdrop" id="sidebarBackdrop"></div>
    <aside class="app-sidebar" id="appSidebar">
      <div class="brand-row"><div class="logo-chip"><img src="${window.LOGO_SRC}" alt="MyCareerSprint"></div></div>
      <nav class="app-nav">
        ${NAV.map(g => `
          <div class="nav-group-label">${g.group}</div>
          ${g.items.map(item => `<a href="#/${item.id}" class="${item.id === safeRoute ? 'active' : ''}"><span class="icon">${item.icon}</span>${item.label}</a>`).join("")}
        `).join("")}
      </nav>
      <div class="sidebar-footer">
        <div class="user-row">
          <div class="avatar">${(state.user.name || "G")[0].toUpperCase()}</div>
          <div>
            <div style="font-weight:700;font-size:14px;">${state.user.name || "Guest"}</div>
            <div class="plan-pill">${state.user.plan === "pro" ? "Pro Sprint" : "Free plan"}</div>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm btn-block" style="margin-top:10px;" data-action="logout">Log out</button>
      </div>
    </aside>
    <div class="app-main">
      <div class="app-topbar">
        <div class="flex items-center gap-3">
          <button class="mobile-menu-btn" data-action="toggleSidebar" aria-label="Open menu">☰</button>
          <h1>${VIEW_TITLES[safeRoute]}</h1>
        </div>
        <div class="flex items-center gap-3">
          <button class="btn btn-secondary btn-sm install-btn" id="topInstallBtn" data-action="installApp">📲 Install App</button>
          <span class="badge">🔥 ${state.streak}-day streak</span>
        </div>
      </div>
      <div class="app-view"><div class="app-view-inner" id="viewContent"></div></div>
    </div>`;

  document.getElementById("viewContent").innerHTML = renderHelp(safeRoute) + renderView(safeRoute);
  if (window.deferredInstallPrompt) document.getElementById("topInstallBtn").classList.add("show");
  bindAppEvents();
  if (safeRoute === "coach") scrollChatToBottom();
}

function renderView(route) {
  switch (route) {
    case "dashboard": return viewDashboard();
    case "coach": return viewCoach();
    case "today": return viewToday();
    case "resume-center": return viewResumeCenter();
    case "resume-match": return viewResumeMatch();
    case "tracker": return viewTracker();
    case "interview": return viewInterview();
    case "cover-letter": return viewCoverLetter();
    case "linkedin": return viewLinkedIn();
    case "roadmap": return viewRoadmap();
    case "resources": return viewResources();
    case "coaching": return viewCoaching();
    default: return viewDashboard();
  }
}

function bindAppEvents() {
  document.querySelectorAll("[data-action]").forEach(elm => {
    if (elm.dataset.bound) return;
    elm.dataset.bound = "1";
    const evt = elm.tagName === "INPUT" && elm.type === "file" ? "change" : elm.dataset.event || "click";
    elm.addEventListener(evt, handleAction);
  });
  const sidebar = document.getElementById("appSidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  if (backdrop) backdrop.addEventListener("click", () => { sidebar.classList.remove("open"); backdrop.classList.remove("show"); });
}

/* ---------------- Views ---------------- */
function greeting() {
  const h = new Date().getHours ? new Date().getHours() : 9;
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function viewDashboard() {
  const activeApps = state.applications.filter(a => a.stage !== "Rejected").length;
  const interviewingCount = state.applications.filter(a => a.stage === "Interviewing").length;
  const latestScore = state.resumes.length ? state.resumes[state.resumes.length - 1].score : "—";
  const doneCount = state.tasks.filter(t => t.done).length;
  return `
    <h2 style="margin-bottom:4px;">${greeting()}, ${state.user.name || "there"} 👋</h2>
    <p class="muted">Here's where your sprint stands today.</p>
    <div class="grid grid-4" style="margin:20px 0;">
      <div class="stat-card"><div class="value">${activeApps}</div><div class="label">Active applications</div></div>
      <div class="stat-card"><div class="value">${interviewingCount}</div><div class="label">In interview stage</div></div>
      <div class="stat-card"><div class="value">${latestScore}</div><div class="label">Latest resume score</div></div>
      <div class="stat-card"><div class="value">${state.streak} 🔥</div><div class="label">Day streak</div></div>
    </div>
    <div class="grid grid-2" style="align-items:start;">
      <div class="card">
        <div class="flex justify-between items-center"><h3 style="margin:0;">Today's plan</h3><a href="#/today" class="small">Open →</a></div>
        <p class="small muted">${doneCount} of ${state.tasks.length} done</p>
        ${state.tasks.slice(0, 3).map(t => `
          <div class="task-row ${t.done ? 'done' : ''}">
            <div class="task-check ${t.done ? 'checked' : ''}" data-action="toggleTask" data-id="${t.id}">✓</div>
            <div><div class="task-title">${t.title}</div><div class="task-meta">${t.meta}</div></div>
          </div>`).join("")}
      </div>
      <div class="card">
        <div class="flex justify-between items-center"><h3 style="margin:0;">Career roadmap</h3><a href="#/roadmap" class="small">Open →</a></div>
        <p class="small muted">Milestone ${state.roadmapCurrent + 1} of ${ROADMAP_MILESTONES.length}: <strong>${ROADMAP_MILESTONES[state.roadmapCurrent].title}</strong></p>
        <div style="height:8px;border-radius:6px;background:var(--border);overflow:hidden;margin:12px 0;">
          <div style="height:100%;background:var(--blue);width:${Math.round((state.roadmapCurrent / (ROADMAP_MILESTONES.length - 1)) * 100)}%;"></div>
        </div>
        <p class="small muted">${ROADMAP_MILESTONES[state.roadmapCurrent].desc}</p>
      </div>
    </div>
    <h3 style="margin-top:28px;">Quick actions</h3>
    <div class="grid grid-4">
      ${quickAction("🎯", "Match a job post", "resume-match")}
      ${quickAction("✉️", "Write a cover letter", "cover-letter")}
      ${quickAction("🔗", "Optimize LinkedIn", "linkedin")}
      ${quickAction("🎤", "Practice an interview", "interview")}
    </div>`;
}
function quickAction(icon, label, route) {
  return `<a href="#/${route}" class="card card-link text-center"><div style="font-size:26px;">${icon}</div><p class="small" style="font-weight:700;margin-top:8px;margin-bottom:0;">${label}</p></a>`;
}

function viewCoach() {
  return `
    <div class="chat-window" id="chatWindow">
      ${state.chatMessages.map(m => `<div class="msg ${m.from === 'bot' ? 'bot' : 'me'}">${m.text}</div>`).join("")}
    </div>
    <div>
      <span class="suggestion-chip" data-action="chatSuggest" data-text="What should I do today?">What should I do today?</span>
      <span class="suggestion-chip" data-action="chatSuggest" data-text="Help me prep for a behavioral interview">Prep for an interview</span>
      <span class="suggestion-chip" data-action="chatSuggest" data-text="Review my LinkedIn headline">Review my LinkedIn</span>
      <span class="suggestion-chip" data-action="chatSuggest" data-text="I just got laid off, where do I start?">I just got laid off</span>
    </div>
    <div class="chat-input-row">
      <input id="chatInput" type="text" placeholder="Ask your career coach anything..." data-action="chatEnter" data-event="keydown">
      <button class="btn btn-primary" data-action="chatSend">Send</button>
    </div>`;
}

function viewToday() {
  const doneCount = state.tasks.filter(t => t.done).length;
  return `
    <div class="flex justify-between items-center" style="margin-bottom:12px;">
      <div><h2 style="margin:0;">Today's CareerSprint</h2><p class="muted small">${doneCount} of ${state.tasks.length} complete · ${state.streak}-day streak</p></div>
      <button class="btn btn-secondary btn-sm" data-action="regenPlan">🔄 Regenerate plan</button>
    </div>
    ${state.tasks.map(t => `
      <div class="task-row ${t.done ? 'done' : ''}">
        <div class="task-check ${t.done ? 'checked' : ''}" data-action="toggleTask" data-id="${t.id}">✓</div>
        <div><div class="task-title">${t.title}</div><div class="task-meta">${t.meta}</div></div>
      </div>`).join("")}
    <div class="card" style="margin-top:16px;background:var(--surface-alt);">
      <div class="flex gap-3">
        <input id="customTaskInput" type="text" placeholder="Add your own task for today...">
        <button class="btn btn-secondary" data-action="addCustomTask">Add</button>
      </div>
    </div>`;
}

function scoreColorNote(score) {
  if (score >= 80) return "Strong — you're ready to send this.";
  if (score >= 60) return "Decent — a few tweaks will meaningfully help.";
  return "Needs work — start with the summary and keyword match.";
}

function viewResumeCenter() {
  return `
    <div class="flex justify-between items-center" style="margin-bottom:16px;">
      <p class="muted" style="margin:0;">Upload, score, and manage every version of your resume.</p>
      <label class="btn btn-primary btn-sm" style="cursor:pointer;">📤 Upload resume<input type="file" accept=".pdf,.doc,.docx" style="display:none;" data-action="uploadResume"></label>
    </div>
    <div class="grid grid-2">
      ${state.resumes.map(r => `
        <div class="card">
          <div class="flex justify-between items-center">
            <div><h4 style="margin-bottom:2px;">${r.name}</h4><p class="small muted" style="margin:0;">Uploaded ${r.uploadedAt}</p></div>
            <button class="icon-btn" data-action="deleteResume" data-id="${r.id}">🗑</button>
          </div>
          <div class="gauge-wrap" style="margin-top:16px;">
            <div class="gauge" style="--pct:${r.score};"><div class="gauge-inner"><div class="num">${r.score}</div><div class="lbl">Score</div></div></div>
            <div>
              <p class="small" style="font-weight:600;margin:0 0 6px;">${scoreColorNote(r.score)}</p>
              <ul class="small muted" style="margin:0;">
                <li>Add 1-2 more quantified results in your most recent role</li>
                <li>Summary line could name your target title directly</li>
              </ul>
            </div>
          </div>
        </div>`).join("")}
    </div>`;
}

function viewResumeMatch() {
  const result = window._lastMatch;
  return `
    <p class="muted">Paste a job description and see exactly how your resume lines up, keyword by keyword.</p>
    <div class="grid grid-2" style="align-items:start;">
      <div class="card">
        <div class="field">
          <label for="matchResume">Resume</label>
          <select id="matchResume">${state.resumes.map(r => `<option>${r.name}</option>`).join("")}<option>Sample Resume (demo)</option></select>
        </div>
        <div class="field">
          <label for="matchJD">Job description</label>
          <textarea id="matchJD" rows="10" placeholder="Paste the full job posting here...">${window._lastJD || ""}</textarea>
        </div>
        <button class="btn btn-primary btn-block" data-action="runMatch">Run Match</button>
      </div>
      <div class="card" id="matchResultBox">
        ${result ? renderMatchResult(result) : `<p class="muted small">Your match score and keyword breakdown will show up here.</p>`}
      </div>
    </div>`;
}
function renderMatchResult(result) {
  return `
    <div class="gauge-wrap">
      <div class="gauge" style="--pct:${result.pct};"><div class="gauge-inner"><div class="num">${result.pct}%</div><div class="lbl">Match</div></div></div>
      <p class="small muted" style="flex:1;min-width:160px;">${result.pct >= 70 ? "Strong match — tailor a few phrases and send it." : result.pct >= 40 ? "Partial match — work the missing keywords in naturally." : "Low match — this role may need a different resume angle."}</p>
    </div>
    <p class="caption" style="margin-top:16px;color:var(--success);">Matched keywords</p>
    <p class="small">${result.matched.length ? result.matched.map(k => `<span class="badge" style="background:#e2f7ee;color:var(--success);margin:2px 4px 2px 0;">${k}</span>`).join("") : '<span class="muted">None found</span>'}</p>
    <p class="caption" style="margin-top:12px;color:var(--danger);">Missing keywords to add</p>
    <p class="small">${result.missing.length ? result.missing.map(k => `<span class="badge" style="background:#fbe7e7;color:var(--danger);margin:2px 4px 2px 0;">${k}</span>`).join("") : '<span class="muted">Nice — nothing major missing</span>'}</p>
    <a href="#/cover-letter" class="btn btn-secondary btn-sm" style="margin-top:12px;">Draft a cover letter for this role →</a>`;
}

function viewTracker() {
  const counts = {};
  state.applications.forEach(a => counts[a.stage] = (counts[a.stage] || 0) + 1);
  return `
    <div class="grid grid-4" style="margin-bottom:20px;">
      ${["Saved", "Applied", "Interviewing", "Offer"].map(s => `<div class="stat-card"><div class="value">${counts[s] || 0}</div><div class="label">${s}</div></div>`).join("")}
    </div>
    <div class="card" style="margin-bottom:16px;background:var(--surface-alt);">
      <div class="grid grid-4">
        <input id="newCompany" type="text" placeholder="Company">
        <input id="newRole" type="text" placeholder="Role">
        <select id="newStage"><option>Saved</option><option>Applied</option><option>Interviewing</option><option>Offer</option><option>Rejected</option></select>
        <button class="btn btn-primary" data-action="addApplication">Add application</button>
      </div>
    </div>
    <div class="table-wrap">
      <table class="tracker">
        <thead><tr><th>Company</th><th>Role</th><th>Stage</th><th>Date</th><th></th></tr></thead>
        <tbody>
          ${state.applications.map(a => `
            <tr>
              <td style="font-weight:600;">${a.company}</td>
              <td>${a.role}</td>
              <td><span class="stage-pill stage-${a.stage}">${a.stage}</span></td>
              <td class="small muted">${a.date}</td>
              <td><button class="icon-btn" data-action="deleteApplication" data-id="${a.id}">🗑</button></td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

function viewInterview() {
  const cats = Object.keys(INTERVIEW_QUESTIONS);
  const list = INTERVIEW_QUESTIONS[state.interview.category];
  const q = list[state.interview.index];
  const mins = String(Math.floor(state.interview.timerSeconds / 60)).padStart(2, "0");
  const secs = String(state.interview.timerSeconds % 60).padStart(2, "0");
  return `
    <div class="flex gap-2" style="margin-bottom:16px;flex-wrap:wrap;">
      ${cats.map(c => `<button class="btn ${c === state.interview.category ? 'btn-primary' : 'btn-secondary'} btn-sm" data-action="setInterviewCat" data-cat="${c}">${c}</button>`).join("")}
    </div>
    <div class="question-card">
      <p class="caption">${state.interview.category} · Question ${state.interview.index + 1} of ${list.length}</p>
      <h3 style="max-width:560px;margin:12px auto;">${q.q}</h3>
      <div class="timer-display" style="margin:16px 0;">${mins}:${secs}</div>
      <div class="flex gap-3" style="justify-content:center;flex-wrap:wrap;">
        <button class="btn btn-secondary" data-action="toggleTimer">${state.interview.timerRunning ? "⏸ Pause" : "▶ Start answering"}</button>
        <button class="btn btn-secondary" data-action="resetTimer">↺ Reset</button>
        <button class="btn btn-ghost" data-action="toggleFramework">${state.interview.showFramework ? "Hide" : "Show"} sample framework</button>
        <button class="btn btn-primary" data-action="nextQuestion">Next question →</button>
      </div>
      ${state.interview.showFramework ? `<div class="card" style="margin-top:20px;text-align:left;background:var(--surface-alt);"><p class="small" style="margin:0;"><strong>Framework:</strong> ${q.f}</p></div>` : ""}
    </div>`;
}

function viewCoverLetter() {
  const out = window._lastCoverLetter;
  return `
    <div class="grid grid-2" style="align-items:start;">
      <div class="card">
        <div class="field"><label for="clCompany">Company</label><input id="clCompany" type="text" placeholder="Acme Corp"></div>
        <div class="field"><label for="clRole">Role</label><input id="clRole" type="text" placeholder="Senior Product Manager"></div>
        <div class="field"><label for="clManager">Hiring manager (optional)</label><input id="clManager" type="text" placeholder="Taylor Reyes"></div>
        <div class="field"><label for="clStrengths">Key strengths / accomplishments</label><textarea id="clStrengths" rows="4" placeholder="e.g. Led a 5-person team, grew retention 18%, shipped analytics dashboard"></textarea></div>
        <div class="field"><label for="clTone">Tone</label><select id="clTone"><option>Professional</option><option>Warm</option><option>Confident</option></select></div>
        <button class="btn btn-primary btn-block" data-action="generateCoverLetter">Generate cover letter</button>
      </div>
      <div class="card">
        ${out ? `<textarea rows="16" readonly style="border:none;background:transparent;">${out}</textarea><button class="btn btn-secondary btn-sm" data-action="copyCoverLetter">📋 Copy to clipboard</button>` : `<p class="muted small">Your tailored draft will appear here — ready to copy into an application.</p>`}
      </div>
    </div>`;
}

function viewLinkedIn() {
  const result = window._lastLinkedInAnalysis;
  return `
    <div class="grid grid-2" style="align-items:start;">
      <div class="card">
        <div class="field"><label for="liHeadline">Current headline</label><input id="liHeadline" type="text" placeholder="e.g. Marketing Manager at XYZ" value="${window._liHeadline || ''}"></div>
        <div class="field"><label for="liAbout">Current About section</label><textarea id="liAbout" rows="8" placeholder="Paste your current About section...">${window._liAbout || ''}</textarea></div>
        <div class="field"><label for="liTargetRole">Target role (for the rewrite)</label><input id="liTargetRole" type="text" value="${state.user.role || ''}" placeholder="e.g. Senior Product Manager"></div>
        <button class="btn btn-primary btn-block" data-action="analyzeLinkedIn">Analyze &amp; rewrite</button>
      </div>
      <div class="card">
        ${result ? renderLinkedInResult(result) : `<p class="muted small">Feedback and a rewritten headline will appear here.</p>`}
      </div>
    </div>`;
}
function renderLinkedInResult(r) {
  return `
    <div class="gauge-wrap">
      <div class="gauge" style="--pct:${r.score};"><div class="gauge-inner"><div class="num">${r.score}</div><div class="lbl">Score</div></div></div>
      <ul class="small" style="flex:1;min-width:180px;margin:0;">${r.feedback.map(f => `<li>${f}</li>`).join("")}</ul>
    </div>
    <p class="caption" style="margin-top:16px;color:var(--blue);">Suggested headline</p>
    <p class="card" style="background:var(--surface-alt);font-weight:600;">${r.headline}</p>`;
}

function viewRoadmap() {
  return `
    <p class="muted">Your path from where you are now to your next offer.</p>
    <div class="roadmap-line">
      ${ROADMAP_MILESTONES.map((m, i) => {
        const status = i < state.roadmapCurrent ? "done" : i === state.roadmapCurrent ? "current" : "";
        return `
        <div class="milestone ${status}">
          <div class="flex justify-between items-center">
            <h4 style="margin:0;">${m.title}</h4>
            ${status === "current" ? `<button class="btn btn-primary btn-sm" data-action="completeMilestone">Mark complete</button>` : status === "done" ? `<span class="badge" style="background:#e2f7ee;color:var(--success);">Done</span>` : `<span class="badge badge-outline">Upcoming</span>`}
          </div>
          <p class="small muted">${m.desc}</p>
        </div>`;
      }).join("")}
    </div>`;
}

function viewResources() {
  return `
    <p class="muted">Jump back into the free resource library, organized by what you're facing right now.</p>
    <div class="grid grid-4">
      ${window.PILLARS_JS.map(p => `
        <div class="card">
          <div style="font-size:26px;">${p.emoji}</div>
          <h4 style="font-size:16px;margin:8px 0 4px;">${p.name}</h4>
          <a href="../public/resources.html#${p.id}" target="_blank" class="small">Read guides →</a>
        </div>`).join("")}
    </div>
    <div class="flex gap-3" style="margin-top:20px;">
      <a href="../public/blog.html" target="_blank" class="btn btn-secondary">Visit the blog</a>
      <a href="../public/videos.html" target="_blank" class="btn btn-secondary">Visit the video library</a>
    </div>`;
}

function viewCoaching() {
  return `
    <p class="muted">Book time with a real coach when you want a second set of eyes.</p>
    <div class="grid grid-2">
      ${COACHES.map((c, i) => `
        <div class="card">
          <div class="flex items-center gap-3"><div class="avatar">${c.name[0]}</div><div><h4 style="margin:0;">${c.name}</h4><p class="small muted" style="margin:0;">${c.specialty}</p></div></div>
          <p class="small" style="margin-top:12px;">Next available: <strong>${c.slot}</strong></p>
          <button class="btn btn-primary btn-sm" data-action="bookCoach" data-idx="${i}">Book this slot</button>
        </div>`).join("")}
    </div>
    ${state.bookings.length ? `
      <h3 style="margin-top:24px;">Your upcoming sessions</h3>
      ${state.bookings.map(b => `<div class="task-row"><div class="task-check checked">✓</div><div><div class="task-title">${b.name} — ${b.specialty}</div><div class="task-meta">${b.slot}</div></div></div>`).join("")}` : ""}`;
}

/* ---------------- Action handling ---------------- */
function handleAction(e) {
  if (e.type === "keydown" && e.key !== "Enter") return;
  const action = this.dataset.action;
  const fn = ACTIONS[action];
  if (fn) fn(this, e);
}

const ACTIONS = {
  obNext() {
    if (onboardingStep === 1) {
      onboardingData.name = document.getElementById("obName").value.trim() || "there";
      onboardingData.role = document.getElementById("obRole").value.trim();
    }
    onboardingStep = Math.min(4, onboardingStep + 1);
    renderAuth("onboarding");
  },
  obBack() { onboardingStep = Math.max(1, onboardingStep - 1); renderAuth("onboarding"); },
  obSituation(el) { onboardingData.situation = el.value; renderAuth("onboarding"); },
  obFinish() {
    state.onboarded = true;
    state.user.name = onboardingData.name || "there";
    state.user.role = onboardingData.role;
    state.user.situation = onboardingData.situation;
    state.user.plan = onboardingData.plan;
    showToast(`Welcome, ${state.user.name}! Your first sprint is ready.`);
    navigate("dashboard");
  },
  doLogin() {
    state.onboarded = true;
    if (!state.user.name) state.user.name = "Alex";
    showToast("Logged in — welcome back!");
    navigate("dashboard");
  },
  logout() {
    state.onboarded = false;
    state.user = { name: "", role: "", situation: "", plan: "free" };
    navigate("login");
  },
  installApp() { triggerInstall(); },
  dismissHelp(el) {
    state.dismissedHelp.add(el.dataset.helpRoute);
    renderAppShell(currentRoute());
  },
  toggleSidebar() {
    document.getElementById("appSidebar").classList.toggle("open");
    document.getElementById("sidebarBackdrop").classList.toggle("show");
  },
  toggleTask(el) {
    const id = Number(el.dataset.id);
    const t = state.tasks.find(t => t.id === id);
    if (t) t.done = !t.done;
    renderAppShell(currentRoute());
  },
  regenPlan() {
    const shuffled = [...TASK_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
    state.tasks = shuffled.map((t, i) => ({ id: Date.now() + i, ...t, done: false }));
    showToast("Today's plan refreshed.");
    renderAppShell("today");
  },
  addCustomTask() {
    const input = document.getElementById("customTaskInput");
    if (input && input.value.trim()) {
      state.tasks.push({ id: Date.now(), title: input.value.trim(), meta: "Custom task", done: false });
      renderAppShell("today");
    }
  },
  chatSend() { sendChat(); },
  chatEnter() { sendChat(); },
  chatSuggest(el) { sendChat(el.dataset.text); },
  uploadResume(el) {
    const file = el.files && el.files[0];
    if (!file) return;
    const score = 60 + (file.name.length * 7) % 35;
    state.resumes.push({ id: Date.now(), name: file.name, score, uploadedAt: new Date().toISOString().slice(0, 10) });
    showToast("Resume uploaded and scored.");
    renderAppShell("resume-center");
  },
  deleteResume(el) {
    state.resumes = state.resumes.filter(r => r.id !== Number(el.dataset.id));
    renderAppShell("resume-center");
  },
  runMatch() {
    const jd = document.getElementById("matchJD").value;
    window._lastJD = jd;
    window._lastMatch = computeMatch(jd, SAMPLE_RESUME_TEXT);
    renderAppShell("resume-match");
  },
  addApplication() {
    const company = document.getElementById("newCompany").value.trim();
    const role = document.getElementById("newRole").value.trim();
    const stage = document.getElementById("newStage").value;
    if (!company || !role) { showToast("Add a company and role first."); return; }
    state.applications.push({ id: Date.now(), company, role, stage, date: new Date().toISOString().slice(0, 10), link: "" });
    renderAppShell("tracker");
  },
  deleteApplication(el) {
    state.applications = state.applications.filter(a => a.id !== Number(el.dataset.id));
    renderAppShell("tracker");
  },
  setInterviewCat(el) {
    state.interview.category = el.dataset.cat;
    state.interview.index = 0;
    state.interview.showFramework = false;
    renderAppShell("interview");
  },
  nextQuestion() {
    const list = INTERVIEW_QUESTIONS[state.interview.category];
    state.interview.index = (state.interview.index + 1) % list.length;
    state.interview.showFramework = false;
    renderAppShell("interview");
  },
  toggleFramework() { state.interview.showFramework = !state.interview.showFramework; renderAppShell("interview"); },
  toggleTimer() {
    if (state.interview.timerRunning) {
      clearInterval(state.interview.timerHandle);
      state.interview.timerRunning = false;
    } else {
      state.interview.timerRunning = true;
      state.interview.timerHandle = setInterval(() => {
        state.interview.timerSeconds++;
        const disp = document.querySelector(".timer-display");
        if (disp) {
          const m = String(Math.floor(state.interview.timerSeconds / 60)).padStart(2, "0");
          const s = String(state.interview.timerSeconds % 60).padStart(2, "0");
          disp.textContent = `${m}:${s}`;
        }
      }, 1000);
    }
    renderAppShell("interview");
  },
  resetTimer() {
    clearInterval(state.interview.timerHandle);
    state.interview.timerRunning = false;
    state.interview.timerSeconds = 0;
    renderAppShell("interview");
  },
  generateCoverLetter() {
    const data = {
      company: val("clCompany") || "the company",
      role: val("clRole") || "this role",
      manager: val("clManager"),
      strengths: val("clStrengths"),
      tone: val("clTone"),
    };
    window._lastCoverLetter = buildCoverLetter(data);
    renderAppShell("cover-letter");
  },
  copyCoverLetter() {
    if (window._lastCoverLetter && navigator.clipboard) {
      navigator.clipboard.writeText(window._lastCoverLetter);
      showToast("Copied to clipboard.");
    }
  },
  analyzeLinkedIn() {
    window._liHeadline = val("liHeadline");
    window._liAbout = val("liAbout");
    const role = val("liTargetRole");
    window._lastLinkedInAnalysis = analyzeLinkedIn(window._liHeadline, window._liAbout, role);
    renderAppShell("linkedin");
  },
  completeMilestone() {
    if (state.roadmapCurrent < ROADMAP_MILESTONES.length - 1) {
      state.roadmapCurrent++;
      showToast(`Milestone complete! Now: ${ROADMAP_MILESTONES[state.roadmapCurrent].title}`);
    } else {
      showToast("You've completed your roadmap! 🎉");
    }
    renderAppShell("roadmap");
  },
  bookCoach(el) {
    const c = COACHES[Number(el.dataset.idx)];
    state.bookings.push(c);
    showToast(`Booked ${c.name} for ${c.slot}.`);
    renderAppShell("coaching");
  },
};

function val(id) { const e = document.getElementById(id); return e ? e.value.trim() : ""; }

/* ---------------- Functional helpers ---------------- */
const STOPWORDS = new Set("a,an,the,and,or,but,to,of,in,on,for,with,as,is,are,be,will,you,your,we,our,this,that,at,by,from,it,have,has,who,will,strong,ability,experience,years,role,team".split(","));

function keywordsFrom(text) {
  return [...new Set((text.toLowerCase().match(/[a-z][a-z\-]{2,}/g) || []).filter(w => !STOPWORDS.has(w)))];
}
function computeMatch(jobText, resumeText) {
  const jdWords = keywordsFrom(jobText);
  const resumeWords = new Set(keywordsFrom(resumeText));
  if (!jdWords.length) return { pct: 0, matched: [], missing: [] };
  const matched = jdWords.filter(w => resumeWords.has(w));
  const missing = jdWords.filter(w => !resumeWords.has(w)).slice(0, 10);
  const pct = Math.round((matched.length / jdWords.length) * 100);
  return { pct, matched: matched.slice(0, 12), missing };
}

const OPENERS = {
  Professional: (role, company) => `I am writing to express my interest in the ${role} position at ${company}.`,
  Warm: (role, company) => `I'll admit it — when I saw the ${role} opening at ${company}, I stopped scrolling.`,
  Confident: (role, company) => `I'm the ${role} ${company} is looking for, and here's the short version of why.`,
};
function buildCoverLetter({ company, role, manager, strengths, tone }) {
  const opener = (OPENERS[tone] || OPENERS.Professional)(role, company);
  const greeting = manager ? `Dear ${manager},` : "Dear Hiring Team,";
  const strengthLines = strengths ? strengths.split(/\n|,/).map(s => s.trim()).filter(Boolean).slice(0, 4) : [];
  const body = strengthLines.length
    ? `In my recent work, I ${strengthLines.map(s => s.charAt(0).toLowerCase() + s.slice(1)).join("; I ")}. I'd bring that same focus to the ${role} team at ${company}.`
    : `My background lines up closely with what this role needs, and I'm ready to bring that impact to ${company} from day one.`;
  return `${greeting}\n\n${opener} ${body}\n\nI'd welcome the chance to talk about how I can contribute to ${company}'s goals. Thank you for your time and consideration.\n\nBest regards,\n${state.user.name || "[Your Name]"}`;
}

function analyzeLinkedIn(headline, about, role) {
  const feedback = [];
  let score = 40;
  if (headline && headline.length > 15) { score += 15; } else { feedback.push("Headline is too short — add your specialty and the value you deliver."); }
  if (headline && /\d/.test(headline)) { score += 10; feedback.push("Nice — your headline includes a number, which stands out."); } else { feedback.push("Consider adding a number or outcome to your headline."); }
  if (about && about.length > 200) { score += 15; } else { feedback.push("Your About section is short — aim for 3-4 short paragraphs."); }
  if (about && /(seeking|looking for)/i.test(about)) { feedback.push('Drop "seeking opportunities" language — lead with what you deliver instead.'); } else { score += 10; }
  score = Math.min(98, score);
  const headlineSuggestion = role
    ? `${role} | Turning ${strengthWord(about)} into measurable results | Open to new opportunities`
    : `Results-driven professional | Turning ${strengthWord(about)} into measurable outcomes`;
  return { score, feedback, headline: headlineSuggestion };
}
function strengthWord(about) {
  const words = keywordsFrom(about || "");
  return words[0] || "strategy";
}

function sendChat(text) {
  const input = document.getElementById("chatInput");
  const message = (text || (input ? input.value.trim() : ""));
  if (!message) return;
  state.chatMessages.push({ from: "me", text: message });
  if (input) input.value = "";
  renderAppShell("coach");
  setTimeout(() => {
    state.chatMessages.push({ from: "bot", text: coachReply(message) });
    renderAppShell("coach");
  }, 500);
}
function coachReply(message) {
  const m = message.toLowerCase();
  if (m.includes("interview")) return "Let's use Interview Practice — pick a category (Behavioral, Technical, Situational, or Salary Negotiation) and I'll cycle through real questions with a framework for each.";
  if (m.includes("linkedin")) return "Head to the LinkedIn Optimizer and paste your current headline and About section — I'll score them and draft an improved headline in seconds.";
  if (m.includes("resume") || m.includes("cover letter")) return "Try Resume-to-Job Match: paste the job post and I'll show exactly which keywords are missing, then you can generate a tailored cover letter in one click.";
  if (m.includes("laid off") || m.includes("layoff")) return "First: breathe. Check severance and COBRA deadlines this week, then let's set your target role so I can build your first CareerSprint plan. Want me to open the Layoff Recovery guide?";
  if (m.includes("today") || m.includes("start")) return "Open Today's CareerSprint — I've queued 3 short, high-leverage actions based on where you are in your roadmap.";
  return "Got it — I've noted that. For now, your fastest wins are usually in Today's CareerSprint or the Resume-to-Job Match tool. Want me to open one of those?";
}
function scrollChatToBottom() {
  const w = document.getElementById("chatWindow");
  if (w) w.scrollTop = w.scrollHeight;
}

/* ---------------- Toast / util ---------------- */
function showToast(msg) {
  let t = document.getElementById("toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
}

/* ---------------- PWA install + service worker ---------------- */
window.deferredInstallPrompt = null;
function setupInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    window.deferredInstallPrompt = e;
    const topBtn = document.getElementById("topInstallBtn");
    if (topBtn) topBtn.classList.add("show");
    const obBtn = document.getElementById("obInstallBtn");
    if (obBtn) obBtn.style.display = "block";
  });
  window.addEventListener("appinstalled", () => showToast("MyCareerSprint installed! Find it on your home screen."));
}
function triggerInstall() {
  if (window.deferredInstallPrompt) {
    window.deferredInstallPrompt.prompt();
    window.deferredInstallPrompt.userChoice.finally(() => { window.deferredInstallPrompt = null; });
  } else {
    showToast("To install: use your browser's “Add to Home Screen” option (Safari share menu, or Chrome menu ⋮).");
  }
}
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {/* fine in prototype/preview contexts without a server */});
  }
}
