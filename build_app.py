#!/usr/bin/env python3
"""Assembles app/index.html: shared tokens + app.css + app.js inlined,
so the file works both as a real PWA (with manifest.json + service-worker.js
alongside it) and as a single-file preview."""
import base64, os

ROOT = os.path.dirname(os.path.abspath(__file__))
APP = os.path.join(ROOT, "app")

TOKENS_CSS = open(os.path.join(ROOT, "shared", "tokens.css")).read()
APP_CSS = open(os.path.join(APP, "app.css")).read()
APP_JS = open(os.path.join(APP, "app.js")).read()
LOGO_B64 = base64.b64encode(open(os.path.join(ROOT, "assets", "logo-header-t.png"), "rb").read()).decode()

PILLARS = [
    ("resume-help", "Resume Help", "📄"),
    ("interview-prep", "Interview Preparation", "🎯"),
    ("job-search-strategy", "Job-Search Strategy", "🧭"),
    ("career-change", "Career Changes", "🔀"),
    ("layoff-recovery", "Layoff Recovery", "🛟"),
    ("linkedin", "LinkedIn", "🔗"),
    ("salary-negotiation", "Salary Negotiation", "💬"),
    ("career-advancement", "Career Advancement", "📈"),
]
PILLARS_JS_ARRAY = "[" + ",".join(
    "{id:%r,name:%r,emoji:%r}" % (pid, name, emoji) for pid, name, emoji in PILLARS
) + "]"

HTML = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>MyCareerSprint App</title>
<meta name="description" content="Your personal career-management dashboard: resume tailoring, LinkedIn optimization, interview practice, and a daily CareerSprint plan.">
<meta name="theme-color" content="#161852">
<link rel="manifest" href="manifest.json">
<link rel="icon" href="icons/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="CareerSprint">
<style>
{TOKENS_CSS}
{APP_CSS}
</style>
</head>
<body>
  <div id="authContainer" class="auth-shell"></div>
  <div id="appShell" style="display:none;"></div>
  <div id="toast"></div>

  <script>
    window.LOGO_SRC = "data:image/png;base64,{LOGO_B64}";
    window.PILLARS_JS = {PILLARS_JS_ARRAY};
  </script>
  <script>
{APP_JS}
  </script>
</body>
</html>"""

with open(os.path.join(APP, "index.html"), "w") as f:
    f.write(HTML)
print("wrote app/index.html", len(HTML), "bytes")
