# MyCareerSprint — Working Prototype

This is a functional front-end prototype of the two-property structure you described:

- **`/public`** — the public marketing site (`mycareersprint.com`)
- **`/app`** — the logged-in Progressive Web App (`app.mycareersprint.com`)

Everything runs client-side with in-memory demo data (no backend yet), so you can click through the entire
experience today and use it as the spec for real engineering work.

Every one of the 12 app views opens with a short, dismissible help banner explaining what the tool does and
how it specifically moves the user closer to landing a job (e.g. Resume-to-Job Match: "Closing that gap is
often the difference between a maybe and an interview."). Dismissing one hides it for that view for the rest
of the session — edit the copy in `app/app.js` under `HELP_COPY`.

## How to view it

Because the app uses a service worker and `fetch` for its manifest, it needs to be served over `http://`,
not opened directly as a `file://` path (the public site pages work fine opened directly, but the app
should be served). From this folder, run:

```
python3 -m http.server 8000
```

Then open:
- `http://localhost:8000/public/index.html` — the marketing site
- `http://localhost:8000/app/index.html` — the app (try "Start Free" from the marketing site to flow in naturally)

On a phone on the same network, visit the app URL and use "Add to Home Screen" (iOS Safari share menu, or the
install banner on Android Chrome) to see the installable PWA behavior.

## What's real vs. simulated

**Real, working logic (not just mockups):**
- Resume-to-Job Match keyword matching (extracts real keywords from the pasted job description and compares
  against a sample resume)
- Cover Letter Builder (assembles an actual letter from your inputs and tone selection)
- LinkedIn Optimizer scoring and headline rewriting (heuristic-based)
- Job Application Tracker (add/remove rows, live stage counts)
- Today's CareerSprint checklist, streak counter, and "regenerate plan"
- Interview Practice question cycling, timer, and framework reveal
- Career Roadmap milestone progression
- The full onboarding wizard → personalized dashboard flow
- Install prompt handling (`beforeinstallprompt`) and a working offline-capable service worker

**Simulated for the prototype (swap for real integrations before launch):**
- The AI Career Coach chat replies with rule-based canned responses — replace with a real LLM call
- Resume "scoring" on upload is a placeholder formula, not real resume parsing/ATS analysis
- All data (applications, resumes, chat, bookings) is in-memory and resets on page reload — there is no
  backend, database, or auth yet
- Digital Shop and Coaching booking buttons are UI-only (no real checkout or scheduling)

## File structure

```
mycareersprint/
├── shared/tokens.css        Design tokens + base components shared by both properties
├── assets/                  Source logo crops used to build icons and inlined header logos
├── build_public.py          Generates /public/*.html from templates + content
├── build_app.py             Assembles /app/index.html from app.css + app.js + tokens
├── public/                  mycareersprint.com — 10 pages, each self-contained HTML
│   ├── index.html           Homepage
│   ├── resources.html       Career Resources (8 need-based pillars)
│   ├── blog.html / blog-post.html
│   ├── videos.html          Video Library
│   ├── tools.html           Recommended Tools (affiliate-style)
│   ├── shop.html            Digital Product Shop
│   ├── coaching.html        Coaching & Services
│   ├── pricing.html
│   ├── about.html
│   └── assets/icons/        Favicons + app icons (also used by /app)
└── app/                     app.mycareersprint.com — the installable PWA
    ├── index.html           Single-page app shell (hash-routed)
    ├── app.css / app.js     Source files (already inlined into index.html)
    ├── manifest.json        PWA manifest (icons, theme color, standalone display)
    ├── service-worker.js    Offline-first caching for the app shell
    └── icons/                192/512/maskable icons generated from your logo
```

To regenerate the HTML after editing `app.css`, `app.js`, or `shared/tokens.css`, re-run:
```
python3 build_public.py
python3 build_app.py
```

## Content architecture (as designed)

The 8 visitor-need pillars — Resume Help, Interview Preparation, Job-Search Strategy, Career Changes,
Layoff Recovery, LinkedIn, Salary Negotiation, Career Advancement — organize the Career Resources page,
the Blog, and the Video Library, and each links to a free lead magnet and the matching in-app tool, per the
"free value → one next step" content model you outlined.

The app's sidebar navigation matches your spec exactly: Dashboard, AI Career Coach, Today's CareerSprint,
Resume Center, Resume-to-Job Match, Job Application Tracker, Interview Practice, Cover Letter Builder,
LinkedIn Optimizer, Career Roadmap, Resources, Virtual Coaching.

The customer journey (discover → free content → compare plans → account → onboarding → app → home screen →
upgrade) is wired end-to-end: Pricing's "Start Pro Sprint" carries the plan choice into onboarding, onboarding
finishes into a personalized Dashboard, and the topbar/onboarding both surface an "Add to Home Screen" install
action.

## Suggested next steps

1. **Backend**: user auth, a real database for resumes/applications/chat history, and persistence across
   sessions and devices.
2. **AI integration**: connect the Resume Analyzer, Cover Letter Generator, LinkedIn Rewriter, and Interview
   Coach to an actual LLM with retrieval over the user's stored documents, replacing the current heuristics.
3. **Payments**: Stripe (or similar) for Pro Sprint subscriptions and Digital Shop checkout.
4. **CMS**: move blog/video/resource content into a headless CMS so non-engineers can publish.
5. **Real deployment**: point `mycareersprint.com` at `/public` and `app.mycareersprint.com` at `/app` (as
   separate subdomains, each served over HTTPS, which is required for the service worker and install prompt
   to work in production).
