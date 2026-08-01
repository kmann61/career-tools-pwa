#!/usr/bin/env python3
"""Generates the public marketing site for mycareersprint.com as
self-contained HTML files (shared CSS inlined, logo inlined as base64)."""
import base64, os

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "public")
os.makedirs(OUT, exist_ok=True)

TOKENS_CSS = open(os.path.join(ROOT, "shared", "tokens.css")).read()
LOGO_B64 = base64.b64encode(open(os.path.join(ROOT, "assets", "logo-header-t.png"), "rb").read()).decode()
LOGO_SRC = f"data:image/png;base64,{LOGO_B64}"
APP_URL = "../app/index.html"  # relative link from /public into /app for this prototype bundle

NAV = [
    ("Home", "index.html"),
    ("Career Resources", "resources.html"),
    ("Blog", "blog.html"),
    ("Video Library", "videos.html"),
    ("Tools", "tools.html"),
    ("Shop", "shop.html"),
    ("Coaching", "coaching.html"),
    ("Pricing", "pricing.html"),
    ("About", "about.html"),
]

PILLARS = [
    ("resume-help", "Resume Help", "Get past the ATS and in front of a human.", "📄"),
    ("interview-prep", "Interview Preparation", "Walk in ready for anything they ask.", "🎯"),
    ("job-search-strategy", "Job-Search Strategy", "Stop applying blind. Work a real plan.", "🧭"),
    ("career-change", "Career Changes", "Move into a new field without starting over.", "🔀"),
    ("layoff-recovery", "Layoff Recovery", "Get steady, then get moving, fast.", "🛟"),
    ("linkedin", "LinkedIn", "Turn your profile into a lead magnet.", "🔗"),
    ("salary-negotiation", "Salary Negotiation", "Ask for what you're worth, with numbers.", "💬"),
    ("career-advancement", "Career Advancement", "Get promoted instead of overlooked.", "📈"),
]

def head(title, desc, extra_css=""):
    return f"""<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} | MyCareerSprint</title>
<meta name="description" content="{desc}">
<link rel="icon" href="assets/icons/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="assets/icons/apple-touch-icon.png">
<meta property="og:title" content="{title} | MyCareerSprint">
<meta property="og:description" content="{desc}">
<style>{TOKENS_CSS}
{extra_css}</style>"""

def header(active):
    link_parts = []
    for label, href in NAV:
        cls = ' class="active"' if href == active else ''
        link_parts.append(f'<a href="{href}"{cls}>{label}</a>')
    links = "\n".join(link_parts)
    return f"""
<a href="#main" class="skip-link">Skip to content</a>
<header class="site-header">
  <div class="container">
    <a href="index.html" class="brand" aria-label="MyCareerSprint home">
      <img src="{LOGO_SRC}" alt="MyCareerSprint logo">
    </a>
    <nav class="nav-links" id="navLinks" aria-label="Primary">
      {links}
    </nav>
    <div class="header-cta">
      <a href="{APP_URL}#/login" class="btn btn-ghost">Log In</a>
      <a href="{APP_URL}#/onboarding" class="btn btn-primary">Start Free</a>
      <button class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>
<script>
  document.getElementById('navToggle').addEventListener('click', function(){{
    var nav = document.getElementById('navLinks');
    var open = nav.classList.toggle('open');
    this.setAttribute('aria-expanded', open);
  }});
</script>"""

def footer():
    return f"""
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <div style="background:#fff;display:inline-flex;padding:8px 14px;border-radius:10px;margin-bottom:12px;">
          <img src="{LOGO_SRC}" alt="MyCareerSprint" style="height:28px;">
        </div>
        <p>The career-management platform that turns job searching into a system: resumes, cover letters, LinkedIn, and interviews, tightened into a daily sprint.</p>
        <div class="social-row" style="margin-top:16px;">
          <a href="#" aria-label="YouTube">▶</a>
          <a href="#" aria-label="LinkedIn">in</a>
          <a href="#" aria-label="Instagram">◎</a>
          <a href="#" aria-label="TikTok">♪</a>
        </div>
      </div>
      <div>
        <h4>Get Started</h4>
        <ul>
          <li><a href="{APP_URL}#/onboarding">Start Free</a></li>
          <li><a href="pricing.html">Pricing</a></li>
          <li><a href="{APP_URL}#/login">Log In</a></li>
          <li><a href="resources.html">Free Toolkit</a></li>
        </ul>
      </div>
      <div>
        <h4>Explore</h4>
        <ul>
          <li><a href="resources.html">Career Resources</a></li>
          <li><a href="blog.html">Blog</a></li>
          <li><a href="videos.html">Video Library</a></li>
          <li><a href="tools.html">Recommended Tools</a></li>
        </ul>
      </div>
      <div>
        <h4>Products</h4>
        <ul>
          <li><a href="shop.html">Digital Shop</a></li>
          <li><a href="coaching.html">Coaching &amp; Services</a></li>
          <li><a href="pricing.html">PWA Subscription</a></li>
          <li><a href="pricing.html#employer">Employer Licenses</a></li>
        </ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="about.html">About</a></li>
          <li><a href="about.html#contact">Contact</a></li>
          <li><a href="#">Affiliates</a></li>
          <li><a href="#">Privacy &amp; Terms</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 MyCareerSprint.com. All rights reserved.</span>
      <span>Made for people between jobs, moving up, or starting over.</span>
    </div>
  </div>
</footer>"""

def page(slug, title, desc, body, extra_css=""):
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
{head(title, desc, extra_css)}
</head>
<body>
{header(slug)}
<main id="main">
{body}
</main>
{footer()}
</body>
</html>"""
    with open(os.path.join(OUT, slug), "w") as f:
        f.write(html)
    print("wrote", slug, len(html), "bytes")

def pillar_cards(link_prefix="resources.html#"):
    cards = ""
    for pid, name, tag, emoji in PILLARS:
        cards += f"""
      <a href="{link_prefix}{pid}" class="card card-link">
        <div style="font-size:32px;margin-bottom:12px;">{emoji}</div>
        <h3 style="font-size:19px;">{name}</h3>
        <p class="small muted" style="margin:0;">{tag}</p>
      </a>"""
    return cards

# ============================================================= HOME
def build_home():
    body = f"""
<section class="section" style="padding-top:64px;">
  <div class="container grid grid-2" style="align-items:center;gap:64px;">
    <div>
      <span class="badge badge-gold">Now with a full career-management app</span>
      <h1 class="display" style="margin-top:16px;">Your career, run like a sprint &mdash; not a scramble.</h1>
      <p class="body-lg muted">MyCareerSprint pairs free, real-world career content with an AI-powered app that
      tailors your resume, rewrites your LinkedIn, drafts your cover letters, and preps you for interviews &mdash;
      in half the time it takes to do it with a plain prompt.</p>
      <div class="flex gap-3" style="margin-top:24px;flex-wrap:wrap;">
        <a href="{APP_URL}#/onboarding" class="btn btn-primary">Start Free &rarr;</a>
        <a href="#how-it-works" class="btn btn-secondary">See how it works</a>
      </div>
      <p class="small muted" style="margin-top:16px;">No credit card required &middot; Free forever plan &middot; Upgrade when you need more</p>
    </div>
    <div class="card" style="background:var(--navy);border:none;padding:0;overflow:hidden;box-shadow:var(--shadow-lg);">
      <div style="background:var(--navy);padding:20px 24px;display:flex;align-items:center;gap:8px;">
        <span style="width:10px;height:10px;border-radius:50%;background:#eda837;"></span>
        <span style="width:10px;height:10px;border-radius:50%;background:#3f52f7;"></span>
        <span style="width:10px;height:10px;border-radius:50%;background:#5b6172;"></span>
        <span class="small" style="color:#aeb2d6;margin-left:8px;">app.mycareersprint.com</span>
      </div>
      <div style="background:#fff;padding:28px;">
        <p class="caption" style="color:var(--blue);">Today&rsquo;s CareerSprint</p>
        <h3 style="margin-bottom:4px;">Good morning, Jordan 👋</h3>
        <p class="small muted">3 recommended actions &middot; ~25 minutes total</p>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:16px;">
          <div class="flex items-center gap-3" style="padding:12px;border:1px solid var(--border);border-radius:10px;">
            <span style="color:var(--success);">✓</span><span class="small">Tailor resume to Senior PM role at Acme</span>
          </div>
          <div class="flex items-center gap-3" style="padding:12px;border:1px solid var(--border);border-radius:10px;">
            <span style="color:var(--gold);">●</span><span class="small">Practice 5 behavioral questions</span>
          </div>
          <div class="flex items-center gap-3" style="padding:12px;border:1px solid var(--border);border-radius:10px;">
            <span class="muted">○</span><span class="small">Refresh LinkedIn headline</span>
          </div>
        </div>
        <a href="{APP_URL}#/dashboard" class="btn btn-primary btn-block" style="margin-top:20px;">Open my dashboard</a>
      </div>
    </div>
  </div>
</section>

<section class="section-sm section-alt">
  <div class="container">
    <div class="grid grid-4 text-center">
      <div><h2 style="font-size:36px;">42,000+</h2><p class="small muted">resumes tailored through the app</p></div>
      <div><h2 style="font-size:36px;">2.8x</h2><p class="small muted">more interview callbacks reported by users*</p></div>
      <div><h2 style="font-size:36px;">15 min</h2><p class="small muted">average time to a tailored application</p></div>
      <div><h2 style="font-size:36px;">4.8/5</h2><p class="small muted">average rating from CareerSprint members</p></div>
    </div>
    <p class="caption" style="text-align:center;margin-top:16px;font-weight:400;text-transform:none;letter-spacing:normal;">*Illustrative figures for this prototype &mdash; replace with real product analytics before launch.</p>
  </div>
</section>

<section class="section" id="how-it-works">
  <div class="container">
    <div class="text-center" style="max-width:640px;margin:0 auto 48px;">
      <span class="badge">Built around what you're going through</span>
      <h2 style="margin-top:16px;">Free content for every stage of the search</h2>
      <p class="muted">Every guide, video, and tool is organized around a real situation &mdash; not a keyword. Find yours, then go deeper in the app.</p>
    </div>
    <div class="grid grid-4">{pillar_cards()}</div>
  </div>
</section>

<section class="section section-dark">
  <div class="container">
    <div class="text-center" style="max-width:680px;margin:0 auto 48px;">
      <span class="badge badge-gold">Not just a prompt. A system.</span>
      <h2 style="margin-top:16px;">The CareerSprint System</h2>
      <p>A ChatGPT prompt gives you one draft. The CareerSprint System chains four tools together, remembers your
      story across all of them, and hands you a finished, tailored application &mdash; not a starting point.</p>
    </div>
    <div class="grid grid-4">
      <div class="card" style="background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.12);">
        <div class="badge badge-gold" style="margin-bottom:12px;">01</div>
        <h4 style="color:#fff;">Resume Analyzer</h4>
        <p class="small">Scores your resume against any job post and shows exactly what's missing.</p>
      </div>
      <div class="card" style="background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.12);">
        <div class="badge badge-gold" style="margin-bottom:12px;">02</div>
        <h4 style="color:#fff;">Cover Letter Generator</h4>
        <p class="small">Drafts a letter using the same job data and your real accomplishments, not filler.</p>
      </div>
      <div class="card" style="background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.12);">
        <div class="badge badge-gold" style="margin-bottom:12px;">03</div>
        <h4 style="color:#fff;">LinkedIn Rewriter</h4>
        <p class="small">Rewrites your headline, About section, and recent role to match your target title.</p>
      </div>
      <div class="card" style="background:rgba(255,255,255,.04);border-color:rgba(255,255,255,.12);">
        <div class="badge badge-gold" style="margin-bottom:12px;">04</div>
        <h4 style="color:#fff;">Interview Coach</h4>
        <p class="small">Runs mock behavioral and technical rounds based on the exact role you're chasing.</p>
      </div>
    </div>
    <div class="text-center" style="margin-top:40px;">
      <a href="{APP_URL}#/onboarding" class="btn btn-on-dark">Try the system free &rarr;</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="container grid grid-2" style="align-items:center;gap:64px;">
    <div>
      <span class="badge">Install it like an app</span>
      <h2 style="margin-top:16px;">One dashboard for your whole search</h2>
      <p class="muted">Add MyCareerSprint to your home screen and get a personal career command center: application
      tracker, resume center, interview practice, a daily recommended action, and a roadmap toward your next role.</p>
      <ul class="muted">
        <li>Works offline once installed, syncs when you're back online</li>
        <li>One login across phone, tablet, and desktop</li>
        <li>Your documents, scores, and progress saved in one place</li>
      </ul>
      <a href="{APP_URL}#/onboarding" class="btn btn-primary" style="margin-top:12px;">Get the app &rarr;</a>
    </div>
    <div class="card" style="padding:0;overflow:hidden;">
      <div style="background:var(--surface-alt);padding:32px;display:grid;gap:12px;">
        <div class="flex justify-between items-center card" style="padding:14px 18px;"><span class="small" style="font-weight:600;">📊 Dashboard</span><span class="small muted">Today's plan ready</span></div>
        <div class="flex justify-between items-center card" style="padding:14px 18px;"><span class="small" style="font-weight:600;">📁 Job Application Tracker</span><span class="small muted">12 active</span></div>
        <div class="flex justify-between items-center card" style="padding:14px 18px;"><span class="small" style="font-weight:600;">🎤 Interview Practice</span><span class="small muted">2 sessions this week</span></div>
        <div class="flex justify-between items-center card" style="padding:14px 18px;"><span class="small" style="font-weight:600;">🗺️ Career Roadmap</span><span class="small muted">Milestone 2 of 5</span></div>
      </div>
    </div>
  </div>
</section>

<section class="section-alt section-sm">
  <div class="container">
    <div class="flex justify-between items-center" style="margin-bottom:24px;flex-wrap:wrap;gap:12px;">
      <h2 style="margin:0;">Fresh from the blog &amp; channel</h2>
      <a href="blog.html" class="btn btn-ghost">View all articles &rarr;</a>
    </div>
    <div class="grid grid-3">
      <a class="card card-link" href="blog-post.html">
        <span class="badge" style="margin-bottom:12px;">Resume Help</span>
        <h3 style="font-size:19px;">Why your resume gets rejected in 7 seconds (and the 3-line fix)</h3>
        <p class="small muted">The ATS isn't the villain you think it is. Here's what's actually filtering you out.</p>
      </a>
      <a class="card card-link" href="blog.html">
        <span class="badge" style="margin-bottom:12px;">Layoff Recovery</span>
        <h3 style="font-size:19px;">Laid off this week? Do these 5 things before you touch your resume</h3>
        <p class="small muted">The first 72 hours after a layoff set the tone for the whole search.</p>
      </a>
      <a class="card card-link" href="videos.html">
        <span class="badge" style="margin-bottom:12px;">Video &middot; 11 min</span>
        <h3 style="font-size:19px;">I rewrote a real LinkedIn profile live &mdash; before and after</h3>
        <p class="small muted">Watch the exact prompts and edits that took this profile from invisible to interviewing.</p>
      </a>
    </div>
  </div>
</section>

<section class="section">
  <div class="container grid grid-2" style="gap:32px;">
    <div class="card" style="background:linear-gradient(135deg,var(--blue-100),#fff);">
      <span class="badge badge-gold">Digital Products</span>
      <h3 style="margin-top:12px;">Hired in 30: The Career Sprint Course</h3>
      <p class="muted">Our flagship, self-paced program: a 30-day system to land interviews, negotiate offers, and start strong. Includes templates, scripts, and app access.</p>
      <a href="shop.html" class="btn btn-secondary">Browse the shop &rarr;</a>
    </div>
    <div class="card" style="background:linear-gradient(135deg,var(--gold-100),#fff);">
      <span class="badge">Coaching</span>
      <h3 style="margin-top:12px;">Talk to a human, not just an AI</h3>
      <p class="muted">1:1 resume reviews, LinkedIn makeovers, and mock interviews with real career coaches, when you want a second set of eyes.</p>
      <a href="coaching.html" class="btn btn-secondary">See coaching options &rarr;</a>
    </div>
  </div>
</section>

<section class="section section-alt">
  <div class="container text-center">
    <span class="badge">Simple pricing</span>
    <h2 style="margin-top:16px;">Free to start. Upgrade when the sprint gets serious.</h2>
    <div class="grid grid-3" style="margin-top:32px;max-width:920px;margin-left:auto;margin-right:auto;">
      <div class="card">
        <h4>Free</h4>
        <p class="display" style="font-size:36px;">$0</p>
        <p class="small muted">Resume score, 1 tailored resume/mo, resource library</p>
        <a href="{APP_URL}#/onboarding" class="btn btn-secondary btn-block">Start Free</a>
      </div>
      <div class="card" style="border:2px solid var(--blue);position:relative;">
        <span class="badge badge-gold" style="position:absolute;top:-14px;left:24px;">Most popular</span>
        <h4>Pro Sprint</h4>
        <p class="display" style="font-size:36px;">$19<span class="small muted">/mo</span></p>
        <p class="small muted">Unlimited tailoring, cover letters, LinkedIn rewrites, interview coach</p>
        <a href="pricing.html" class="btn btn-primary btn-block">See Pro details</a>
      </div>
      <div class="card">
        <h4>Teams &amp; Institutions</h4>
        <p class="display" style="font-size:36px;">Custom</p>
        <p class="small muted">Career centers, bootcamps, and employers supporting job seekers at scale</p>
        <a href="pricing.html#employer" class="btn btn-secondary btn-block">Get a quote</a>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <h2 class="text-center" style="margin-bottom:32px;">People used the sprint. It worked.</h2>
    <div class="grid grid-3">
      <div class="card"><p>&ldquo;I went from 40 applications with silence to 3 interviews in 12 days after the resume rewrite.&rdquo;</p><p class="small muted" style="margin:0;">&mdash; Priya S., Product Manager</p></div>
      <div class="card"><p>&ldquo;The interview coach asked harder questions than the real panel did. I walked in relaxed.&rdquo;</p><p class="small muted" style="margin:0;">&mdash; Marcus T., Data Analyst</p></div>
      <div class="card"><p>&ldquo;Losing my job at 51 felt like the end. The layoff recovery guide gave me an actual plan for week one.&rdquo;</p><p class="small muted" style="margin:0;">&mdash; Denise R., Operations Director</p></div>
    </div>
  </div>
</section>

<section class="section section-dark text-center">
  <div class="container">
    <h2>Your next role starts with today's sprint.</h2>
    <p style="max-width:520px;margin:0 auto 24px;">Create your free account, tell us where you're headed, and get your first recommended action in under two minutes.</p>
    <a href="{APP_URL}#/onboarding" class="btn btn-on-dark">Start Free &rarr;</a>
  </div>
</section>
"""
    page("index.html", "Home", "MyCareerSprint pairs free career content with an AI-powered app that tailors your resume, LinkedIn, cover letters, and interview prep.", body)

# ============================================================= RESOURCES
def build_resources():
    sections = ""
    topics_map = {
        "resume-help": ["ATS-proof formatting checklist", "How to quantify accomplishments with no hard numbers", "One-page vs two-page: what actually matters"],
        "interview-prep": ["The STAR method, rebuilt for how people actually talk", "20 behavioral questions ranked by how often they're asked", "What to do in the 10 minutes before a video interview"],
        "job-search-strategy": ["The weekly job-search schedule that beats spray-and-apply", "How to find roles before they're posted", "Tracking applications so nothing falls through"],
        "career-change": ["Translating your resume into a new industry's language", "Transferable skills employers actually value", "How to explain a career pivot in one sentence"],
        "layoff-recovery": ["The first 72 hours after a layoff", "Severance, COBRA, and unemployment: what to check first", "Telling your network without it feeling like a plea"],
        "linkedin": ["Rewriting your headline in under 10 minutes", "The About section formula recruiters respond to", "Getting your first 5 recommendations"],
        "salary-negotiation": ["Researching a real salary range before you talk numbers", "Scripts for countering a lowball offer", "Negotiating beyond base pay"],
        "career-advancement": ["Making your manager see your impact without bragging", "Building a promotion case with evidence", "When to ask, and when to leave"],
    }
    lead_magnets = {
        "resume-help": "The ATS-Proof Resume Checklist",
        "interview-prep": "50 Behavioral Interview Questions (with answer frameworks)",
        "job-search-strategy": "The 5-Hour Weekly Job Search Plan",
        "career-change": "The Career Pivot Translator Worksheet",
        "layoff-recovery": "The Layoff Recovery 7-Day Action Plan",
        "linkedin": "The LinkedIn Profile Teardown Checklist",
        "salary-negotiation": "The Salary Negotiation Script Pack",
        "career-advancement": "The Promotion Case Builder Template",
    }
    for pid, name, tag, emoji in PILLARS:
        topics = "".join(f"<li><a href=\"blog.html\">{t}</a></li>" for t in topics_map[pid])
        sections += f"""
    <div id="{pid}" class="card" style="scroll-margin-top:100px;">
      <div class="flex items-center gap-3" style="margin-bottom:8px;">
        <span style="font-size:28px;">{emoji}</span><h3 style="margin:0;">{name}</h3>
      </div>
      <p class="muted">{tag}</p>
      <div class="grid grid-2" style="gap:24px;margin-top:16px;">
        <div>
          <p class="caption">Start reading</p>
          <ul>{topics}</ul>
        </div>
        <div class="card" style="background:var(--surface-alt);">
          <p class="caption" style="color:var(--blue);">Free download</p>
          <h4 style="margin-top:6px;">{lead_magnets[pid]}</h4>
          <p class="small muted">Delivered by email, plus a nudge to try the related app tool.</p>
          <a href="#" class="btn btn-gold btn-sm">Get it free</a>
          <a href="{APP_URL}#/onboarding" class="btn btn-ghost btn-sm">Try it in the app</a>
        </div>
      </div>
    </div>"""
    body = f"""
<section class="section" style="padding-bottom:0;">
  <div class="container text-center" style="max-width:680px;margin:0 auto 40px;">
    <span class="badge">Career Resources</span>
    <h1 style="margin-top:16px;">Whatever you're facing, start here.</h1>
    <p class="muted">Free guides organized by real situations, not generic advice. Each one points to the exact
    tool in the app that finishes the job for you.</p>
  </div>
</section>
<section class="section" style="padding-top:0;">
  <div class="container" style="display:flex;flex-direction:column;gap:32px;">
    {sections}
  </div>
</section>
"""
    page("resources.html", "Career Resources", "Free career guides organized by situation: resume help, interview prep, job-search strategy, career change, layoff recovery, LinkedIn, salary negotiation, and advancement.", body)

# ============================================================= BLOG
def build_blog():
    posts = [
        ("Resume Help", "Why your resume gets rejected in 7 seconds (and the 3-line fix)", "The ATS isn't the villain you think it is. Here's what's actually filtering you out.", "blog-post.html"),
        ("Layoff Recovery", "Laid off this week? Do these 5 things before you touch your resume", "The first 72 hours after a layoff set the tone for the whole search.", "blog.html"),
        ("Interview Preparation", "The STAR method, rebuilt for how people actually talk", "Ditch the robotic script. Here's a version that still sounds like you.", "blog.html"),
        ("LinkedIn", "Your headline is costing you interviews. Here's what to write instead", "Five real headline rewrites, before and after.", "blog.html"),
        ("Salary Negotiation", "The one question that gets you a better offer, every time", "It's not \"can you go higher.\" It's this.", "blog.html"),
        ("Job-Search Strategy", "Spray-and-apply is dead. Here's the plan that replaced it", "Fewer applications, more replies. The math behind it.", "blog.html"),
        ("Career Changes", "How I explained a 3-industry pivot in one sentence", "A framework for translating your story so it lands in 10 seconds.", "blog.html"),
        ("Career Advancement", "You're doing great work. Nobody knows it. Fix that this week.", "Visibility isn't bragging when you do it right.", "blog.html"),
        ("Resume Help", "One page or two? The real answer, by career stage", "The rule everyone repeats is wrong for about half of you.", "blog.html"),
    ]
    cards = ""
    for tag, title, desc, href in posts:
        cards += f"""
      <a class="card card-link" href="{href}">
        <span class="badge" style="margin-bottom:12px;">{tag}</span>
        <h3 style="font-size:19px;">{title}</h3>
        <p class="small muted">{desc}</p>
      </a>"""
    chips = "".join(f'<button class="btn btn-ghost btn-sm chip">{name}</button>' for _, name, _, _ in PILLARS)
    body = f"""
<section class="section" style="padding-bottom:24px;">
  <div class="container text-center" style="max-width:680px;margin:0 auto 24px;">
    <span class="badge">Blog</span>
    <h1 style="margin-top:16px;">Real advice, one next step at a time.</h1>
    <p class="muted">Every post ends with something to actually do: a free download, an app tool, or a product that finishes the job.</p>
  </div>
  <div class="container flex gap-2" style="flex-wrap:wrap;justify-content:center;">
    <button class="btn btn-secondary btn-sm chip" data-active="true">All</button>
    {chips}
  </div>
</section>
<section class="section" style="padding-top:0;">
  <div class="container grid grid-3">
    {cards}
  </div>
</section>
"""
    page("blog.html", "Blog", "Career advice organized by real situations: resume help, interviews, LinkedIn, salary negotiation, layoffs, career change, and advancement.", body)

# ============================================================= BLOG POST
def build_blog_post():
    body = f"""
<article class="section" style="padding-top:56px;">
  <div class="container" style="max-width:760px;">
    <span class="badge">Resume Help</span>
    <h1 style="margin-top:16px;">Why your resume gets rejected in 7 seconds (and the 3-line fix)</h1>
    <p class="muted small">By the MyCareerSprint Team &middot; 6 min read &middot; Updated July 2026</p>

    <p class="body-lg" style="margin-top:24px;">Somewhere around the fortieth rejection email, most job seekers start blaming a robot. "The
    ATS ate my resume." It's a comforting story, because it means the problem isn't you. It's also mostly wrong.</p>

    <p>Applicant tracking systems reject far fewer resumes outright than people assume &mdash; most modern ATS
    software doesn't auto-reject anything; it organizes and ranks. The real 7-second rejection happens further
    down the line, when an actual recruiter opens your resume, scans the top third, and decides whether to keep
    reading. That's the moment you're losing, and it's fixable.</p>

    <h2>What a recruiter actually looks for in those first 7 seconds</h2>
    <p>In roughly that order: your most recent title and company, whether your last role matches the one they're
    hiring for, and one number that proves you did something, not just attended something. If those three things
    aren't obvious at a glance, the resume goes in the "maybe" pile, and the maybe pile rarely gets a second look.</p>

    <h2>The 3-line fix</h2>
    <p>Add a three-line summary block directly under your name, before your work history. Not an objective
    statement &mdash; nobody cares what you're "seeking." A summary that states what you are, what you've measurably
    done, and what you're aiming at next.</p>
    <div class="card" style="background:var(--surface-alt);">
      <p class="small" style="margin:0;"><strong>Before:</strong> "Motivated marketing professional seeking a challenging role in a growth-oriented company."</p>
      <p class="small" style="margin:12px 0 0;"><strong>After:</strong> "Growth marketer who took a 40-person SaaS company from $2M to $9M ARR in 18 months. Now looking to lead demand gen for a Series B team."</p>
    </div>

    <h2>Why this works better than keyword-stuffing</h2>
    <p>Keyword-matching matters for search and filtering, but it doesn't win the human read. A recruiter who
    sees a specific outcome in line one trusts the rest of the resume more, reads further, and remembers you
    when the hiring manager asks "who stood out?" Specificity is the actual keyword.</p>

    <div class="card" style="background:linear-gradient(135deg,var(--blue-100),#fff);margin:32px 0;">
      <span class="badge badge-gold">Try it now</span>
      <h3 style="margin-top:10px;">See your resume's score in under 2 minutes</h3>
      <p class="muted">The Resume Analyzer in the app checks for this exact pattern &mdash; plus 20 other things
      recruiters scan for &mdash; and rewrites your summary line for you.</p>
      <a href="{APP_URL}#/resume-center" class="btn btn-primary">Score my resume free &rarr;</a>
    </div>

    <h2>The takeaway</h2>
    <p>You don't need a longer resume, more keywords, or a different template. You need the first three lines
    to do their job. Fix those, and the other 90 percent of your resume finally gets read the way you meant it.</p>

    <hr style="border:none;border-top:1px solid var(--border);margin:32px 0;">
    <p><strong>Next step:</strong> Download the free <a href="resources.html#resume-help">ATS-Proof Resume
    Checklist</a>, or run your resume through the <a href="{APP_URL}#/resume-center">Resume Analyzer</a> to get
    a rewritten summary line in your own voice.</p>
  </div>
</article>
"""
    page("blog-post.html", "Why your resume gets rejected in 7 seconds", "The 3-line resume fix that gets you past the first 7-second recruiter scan.", body)

# ============================================================= VIDEOS
def build_videos():
    vids = [
        ("Resume Help", "8:42", "I rewrote a stranger's resume live &mdash; full breakdown"),
        ("LinkedIn", "11:03", "I rewrote a real LinkedIn profile live: before and after"),
        ("Interview Preparation", "14:20", "Mock interview: senior PM role, unscripted"),
        ("Layoff Recovery", "9:15", "What I'd do in the first week after a layoff"),
        ("Salary Negotiation", "6:58", "Negotiating a $14k raise: the exact script"),
        ("Job-Search Strategy", "12:31", "The weekly system that replaced spray-and-apply"),
        ("Career Changes", "10:04", "From teacher to UX designer in 7 months"),
        ("Career Advancement", "7:47", "How to ask for a promotion without sounding desperate"),
        ("Resume Help", "5:33", "3 resume mistakes I see in almost every review"),
    ]
    cards = ""
    for tag, dur, title in vids:
        cards += f"""
      <a class="card card-link" href="#" style="padding:0;overflow:hidden;">
        <div style="aspect-ratio:16/9;background:linear-gradient(135deg,var(--navy),var(--blue));display:flex;align-items:center;justify-content:center;position:relative;">
          <span style="width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;">▶</span>
          <span class="small" style="position:absolute;bottom:8px;right:10px;background:rgba(0,0,0,.6);color:#fff;padding:2px 8px;border-radius:4px;">{dur}</span>
        </div>
        <div style="padding:18px;">
          <span class="badge" style="margin-bottom:8px;">{tag}</span>
          <h3 style="font-size:17px;">{title}</h3>
        </div>
      </a>"""
    body = f"""
<section class="section" style="padding-bottom:24px;">
  <div class="container text-center" style="max-width:680px;margin:0 auto;">
    <span class="badge">Video Library</span>
    <h1 style="margin-top:16px;">Watch it done, not just explained.</h1>
    <p class="muted">Live resume rewrites, mock interviews, and LinkedIn makeovers from the CareerSprint YouTube channel.</p>
    <a href="#" class="btn btn-secondary" style="margin-top:8px;">Subscribe on YouTube &rarr;</a>
  </div>
</section>
<section class="section" style="padding-top:0;">
  <div class="container grid grid-3">{cards}</div>
</section>
"""
    page("videos.html", "Video Library", "Watch real resume rewrites, mock interviews, and LinkedIn makeovers from MyCareerSprint.", body)

# ============================================================= TOOLS
def build_tools():
    groups = [
        ("Resume &amp; LinkedIn", [
            ("A polished template library beyond our own", "Design-forward resume templates for creative and technical roles alike."),
            ("Professional headshot generator", "Get an interview-ready headshot without booking a photographer."),
        ]),
        ("Job Search Platforms", [
            ("Niche job boards by industry", "Curated boards that surface roles before they hit the major aggregators."),
            ("Company research browser extension", "See funding, layoffs, and Glassdoor scores while you browse listings."),
        ]),
        ("Interview Prep", [
            ("Live technical interview practice", "Pair up with a real engineer for a mock coding round."),
            ("Salary and compensation database", "Cross-check offers against real, reported comp data."),
        ]),
        ("Networking", [
            ("Informational interview scheduler", "A lightweight way to request and track networking chats."),
            ("Alumni and community directories", "Warm intros through schools and professional groups."),
        ]),
    ]
    sections = ""
    for gname, items in groups:
        cards = "".join(f"""
      <div class="card">
        <h4>{name}</h4>
        <p class="small muted">{desc}</p>
        <a href="#" class="btn btn-secondary btn-sm">Check it out &rarr;</a>
      </div>""" for name, desc in items)
        sections += f"""
    <div>
      <h3>{gname}</h3>
      <div class="grid grid-2">{cards}</div>
    </div>"""
    body = f"""
<section class="section" style="padding-bottom:24px;">
  <div class="container text-center" style="max-width:680px;margin:0 auto;">
    <span class="badge">Recommended Tools</span>
    <h1 style="margin-top:16px;">Tools we actually use and recommend</h1>
    <p class="muted">A curated shortlist &mdash; not everything, just what earns a place in a real job search. Some
    links are affiliate links, which support the free content on this site at no extra cost to you.</p>
  </div>
</section>
<section class="section" style="padding-top:0;">
  <div class="container" style="display:flex;flex-direction:column;gap:40px;">
    {sections}
  </div>
</section>
"""
    page("tools.html", "Recommended Tools", "A curated shortlist of tools MyCareerSprint recommends for resumes, job search, interviews, and networking.", body)

# ============================================================= SHOP
def build_shop():
    products = [
        ("Flagship Course", "Hired in 30: The Career Sprint Course", "$149", "A 30-day, self-paced system to land interviews, negotiate offers, and start strong. Includes templates, scripts, and 3 months of app Pro access."),
        ("Template Pack", "ATS-Proof Resume Template Pack (6 designs)", "$29", "Editable in Google Docs and Word. Built to pass parsing and still look designed."),
        ("Template Pack", "Cover Letter Template + Formula Pack", "$19", "Five formulas for five situations: career change, layoff, promotion ask, new grad, and executive."),
        ("Toolkit", "LinkedIn Banner &amp; Profile Kit", "$15", "Banner templates, headline formulas, and a 30-day posting calendar to build visibility."),
        ("Question Bank", "300-Question Interview Question Bank", "$25", "Organized by role, industry, and question type, with answer frameworks for each."),
        ("Bundle", "The Full Career Sprint Bundle", "$179", "Every template pack, the question bank, and the flagship course, bundled and discounted."),
    ]
    cards = ""
    for tag, name, price, desc in products:
        cards += f"""
      <div class="card">
        <span class="badge badge-gold" style="margin-bottom:10px;">{tag}</span>
        <h3 style="font-size:19px;">{name}</h3>
        <p class="small muted">{desc}</p>
        <div class="flex justify-between items-center" style="margin-top:16px;">
          <span style="font-weight:700;font-size:20px;color:var(--navy);">{price}</span>
          <a href="#" class="btn btn-primary btn-sm">Add to cart</a>
        </div>
      </div>"""
    body = f"""
<section class="section" style="padding-bottom:24px;">
  <div class="container text-center" style="max-width:680px;margin:0 auto;">
    <span class="badge">Digital Product Shop</span>
    <h1 style="margin-top:16px;">Own it once, use it every search.</h1>
    <p class="muted">Templates, guides, and the flagship Hired in 30 course &mdash; for when you want more than the free tier and less than a subscription.</p>
  </div>
</section>
<section class="section" style="padding-top:0;">
  <div class="container grid grid-3">{cards}</div>
</section>
<section class="section-alt section-sm">
  <div class="container text-center">
    <h3>Prefer everything in one place?</h3>
    <p class="muted">Pro Sprint subscribers get app-based tailoring plus a discount on every product in the shop.</p>
    <a href="pricing.html" class="btn btn-secondary">Compare with Pro Sprint &rarr;</a>
  </div>
</section>
"""
    page("shop.html", "Digital Product Shop", "Resume templates, cover letter packs, LinkedIn kits, interview question banks, and the Hired in 30 flagship course.", body)

# ============================================================= COACHING
def build_coaching():
    services = [
        ("Resume Review", "45 min", "$99", "A career coach marks up your resume line by line and hands you a prioritized fix list."),
        ("LinkedIn Makeover", "45 min", "$99", "Rebuild your headline, About section, and featured work together, live."),
        ("Mock Interview", "60 min", "$149", "A full mock round for your specific role, with recorded feedback after."),
        ("Career Strategy Session", "60 min", "$179", "For career changes, layoffs, or advancement plans that need a real plan, not just a resume."),
    ]
    cards = "".join(f"""
      <div class="card">
        <h4>{name}</h4>
        <p class="small muted">{dur} session</p>
        <p class="muted">{desc}</p>
        <div class="flex justify-between items-center" style="margin-top:12px;">
          <span style="font-weight:700;font-size:20px;color:var(--navy);">{price}</span>
          <a href="#" class="btn btn-primary btn-sm">Book a time</a>
        </div>
      </div>""" for name, dur, price, desc in services)
    body = f"""
<section class="section" style="padding-bottom:24px;">
  <div class="container text-center" style="max-width:680px;margin:0 auto;">
    <span class="badge">Coaching &amp; Services</span>
    <h1 style="margin-top:16px;">Sometimes you want a human in the loop.</h1>
    <p class="muted">The app gets you 90% of the way in minutes. When it's a big career decision or a big interview, book time with a real coach.</p>
  </div>
</section>
<section class="section" style="padding-top:0;">
  <div class="container grid grid-2">{cards}</div>
</section>
<section class="section-alt section-sm text-center">
  <div class="container">
    <span class="badge">For organizations</span>
    <h3 style="margin-top:12px;">Bootcamps, universities, and outplacement programs</h3>
    <p class="muted" style="max-width:560px;margin:0 auto;">License MyCareerSprint coaching and the app for your cohort or your laid-off employees. Volume pricing available.</p>
    <a href="pricing.html#employer" class="btn btn-secondary" style="margin-top:8px;">Get institutional pricing &rarr;</a>
  </div>
</section>
"""
    page("coaching.html", "Coaching & Services", "1:1 resume reviews, LinkedIn makeovers, mock interviews, and career strategy sessions with real coaches.", body)

# ============================================================= PRICING
def build_pricing():
    body = f"""
<section class="section" style="padding-bottom:24px;">
  <div class="container text-center" style="max-width:680px;margin:0 auto;">
    <span class="badge">Pricing</span>
    <h1 style="margin-top:16px;">Free to start. Simple to grow into.</h1>
    <p class="muted">Every plan includes the free content library. Paid plans unlock the full CareerSprint System in the app.</p>
  </div>
</section>
<section class="section" style="padding-top:0;">
  <div class="container grid grid-3" style="align-items:stretch;">
    <div class="card" style="display:flex;flex-direction:column;">
      <h4>Free</h4>
      <p class="display" style="font-size:40px;">$0</p>
      <ul class="muted" style="flex:1;">
        <li>Full resource library, blog, and video access</li>
        <li>1 resume score + tailor per month</li>
        <li>Job application tracker (up to 5 active)</li>
        <li>Today's CareerSprint (basic daily tasks)</li>
      </ul>
      <a href="{APP_URL}#/onboarding" class="btn btn-secondary btn-block">Start Free</a>
    </div>
    <div class="card" style="border:2px solid var(--blue);position:relative;display:flex;flex-direction:column;">
      <span class="badge badge-gold" style="position:absolute;top:-14px;left:24px;">Most popular</span>
      <h4>Pro Sprint</h4>
      <p class="display" style="font-size:40px;">$19<span class="small muted">/mo</span></p>
      <p class="small muted">or $180/yr (save 20%)</p>
      <ul class="muted" style="flex:1;">
        <li>Unlimited resume tailoring &amp; Resume-to-Job Match</li>
        <li>Unlimited cover letter generation</li>
        <li>LinkedIn Optimizer with full rewrites</li>
        <li>AI Interview Coach, unlimited mock sessions</li>
        <li>Unlimited application tracking + Career Roadmap</li>
        <li>15% off the Digital Product Shop</li>
      </ul>
      <a href="{APP_URL}?plan=pro#/onboarding" class="btn btn-primary btn-block">Start Pro Sprint</a>
    </div>
    <div class="card" id="employer" style="display:flex;flex-direction:column;scroll-margin-top:100px;">
      <h4>Teams &amp; Institutions</h4>
      <p class="display" style="font-size:40px;">Custom</p>
      <ul class="muted" style="flex:1;">
        <li>Bulk seats for career centers, bootcamps, and employers</li>
        <li>Cohort dashboards and progress reporting</li>
        <li>Bundled group coaching sessions</li>
        <li>Custom onboarding and branding</li>
      </ul>
      <a href="about.html#contact" class="btn btn-secondary btn-block">Talk to us</a>
    </div>
  </div>
</section>
<section class="section-alt">
  <div class="container" style="max-width:760px;margin:0 auto;">
    <h2 class="text-center">Questions people ask before upgrading</h2>
    <div class="card" style="margin-top:16px;"><h4>Can I cancel anytime?</h4><p class="muted" style="margin:0;">Yes. Pro Sprint is month-to-month or annual, and you can cancel from account settings at any time.</p></div>
    <div class="card" style="margin-top:16px;"><h4>What happens to my documents if I downgrade?</h4><p class="muted" style="margin:0;">Everything you've created stays saved. You'll just be limited to the Free plan's monthly tailoring limit going forward.</p></div>
    <div class="card" style="margin-top:16px;"><h4>Do you offer discounts for layoffs?</h4><p class="muted" style="margin:0;">Yes &mdash; email us and we'll set you up with 60 days of Pro Sprint at no cost while you're between roles.</p></div>
  </div>
</section>
"""
    page("pricing.html", "Pricing", "Free and Pro Sprint plans for MyCareerSprint, plus custom pricing for teams and institutions.", body)

# ============================================================= ABOUT
def build_about():
    body = f"""
<section class="section" style="padding-bottom:24px;">
  <div class="container text-center" style="max-width:680px;margin:0 auto;">
    <span class="badge">About</span>
    <h1 style="margin-top:16px;">We got tired of watching good people lose to a bad process.</h1>
    <p class="muted">MyCareerSprint exists because job searching shouldn't take six months of guesswork, and a single AI prompt was never going to be a career strategy.</p>
  </div>
</section>
<section class="section" style="padding-top:0;">
  <div class="container grid grid-2" style="align-items:center;gap:48px;">
    <div>
      <h2>Why "sprint"?</h2>
      <p class="muted">Most career advice assumes you have unlimited time and energy. You don't &mdash; especially if
      you're doing this while employed, freshly laid off, or raising a family. A sprint is focused, time-boxed,
      and finishes with something in hand. That's the whole design philosophy behind the app: pick today's three
      highest-leverage actions and get them done, instead of drowning in fifty open tabs.</p>
      <h2>Why we built more than a prompt</h2>
      <p class="muted">A generic AI prompt gives you a draft with no memory of your story, your target role, or
      what you tried yesterday. The CareerSprint System keeps that context across your resume, cover letters,
      LinkedIn, and interview prep, so every tool gets smarter about you the more you use it.</p>
    </div>
    <div class="card" style="background:var(--surface-alt);">
      <h4>What we believe</h4>
      <ul class="muted">
        <li>Free content should be genuinely useful, not bait for a paywall</li>
        <li>A layoff is a logistics problem first, an identity crisis second &mdash; treat it that way</li>
        <li>Templates save time; judgment still matters, which is why coaching exists</li>
        <li>Your data and documents are yours, exportable anytime</li>
      </ul>
    </div>
  </div>
</section>
<section id="contact" class="section-alt section-sm">
  <div class="container text-center" style="max-width:560px;margin:0 auto;">
    <h2>Get in touch</h2>
    <p class="muted">Press, partnerships, institutional pricing, or just want to say hi.</p>
    <form>
      <div class="field"><label for="name">Name</label><input id="name" type="text" placeholder="Your name"></div>
      <div class="field"><label for="email">Email</label><input id="email" type="email" placeholder="you@email.com"></div>
      <div class="field"><label for="msg">Message</label><textarea id="msg" rows="4" placeholder="How can we help?"></textarea></div>
      <button type="button" class="btn btn-primary btn-block">Send message</button>
    </form>
  </div>
</section>
"""
    page("about.html", "About", "Why MyCareerSprint exists, what we believe about job searching, and how to get in touch.", body)

if __name__ == "__main__":
    build_home()
    build_resources()
    build_blog()
    build_blog_post()
    build_videos()
    build_tools()
    build_shop()
    build_coaching()
    build_pricing()
    build_about()
    print("Public site build complete.")
