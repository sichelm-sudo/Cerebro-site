#!/usr/bin/env python3
"""Builds the site's pages from pages/*.html (body only) + the shared head, header and footer.
Run: python3 build.py   (no dependencies). Edit text in pages/, then rebuild."""
import pathlib, re

ROOT = pathlib.Path(__file__).parent
SITE = "https://tradecerebro.com"
APP = "https://app.tradecerebro.com"
BETA_EMAIL = "hello@tradecerebro.com"

NAV = [("product.html", "Product"), ("how-it-works.html", "How It Works"), ("technology.html", "Research &amp; Technology"), ("pricing.html", "Pricing")]

def head(title, desc, path):
    return f"""<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{SITE}/{'' if path == 'index.html' else path}">
<link rel="icon" href="assets/logo-neon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="theme-color" content="#05070d">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Cerebro">
<meta property="og:url" content="{SITE}/{'' if path == 'index.html' else path}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{SITE}/og-image.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/site.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
"""

def header(path):
    links = "".join(f'<a href="{href}"{" aria-current=\"page\"" if href == path else ""}>{label}</a>' for href, label in NAV)
    return f"""<header class="site-head">
  <div class="wrap">
    <a class="brand" href="index.html" aria-label="Cerebro home"><img src="assets/logo-neon.svg" alt="" width="32" height="31"><span>Cerebro<small>Trading Intelligence</small></span></a>
    <button class="menu-btn" aria-expanded="false" aria-controls="nav">Menu</button>
    <nav id="nav" class="nav" aria-label="Main">{links}<a href="{APP}">Sign In</a><a class="btn btn-primary" href="index.html#beta">Get Early Access</a></nav>
  </div>
</header>
<main id="main">
"""

FOOTER = f"""</main>
<footer class="site-foot">
  <div class="wrap">
    <div class="foot-grid">
      <div><a class="brand" href="index.html"><img src="assets/logo-neon.svg" alt="" width="32" height="31"><span>Cerebro<small>Trading Intelligence</small></span></a>
        <p style="margin-top:14px;font-size:14px;max-width:320px">Strategy research, testing, automated execution and portfolio management for systematic traders. In private beta.</p></div>
      <div><h4>Platform</h4><a href="product.html">Product</a><a href="how-it-works.html">How It Works</a><a href="technology.html">Research &amp; Technology</a><a href="pricing.html">Pricing</a></div>
      <div><h4>Company</h4><a href="index.html#beta">Private beta</a><a href="contact.html">Contact</a><a href="{APP}">Sign In</a><a href="intro.html">Watch the intro</a></div>
      <div><h4>Legal</h4><a href="risk.html">Risk Disclosure</a><a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms of Service</a></div>
    </div>
    <p class="risk"><b>Risk warning:</b> Spread bets and CFDs are complex instruments and come with a high risk of losing money rapidly due to leverage. You should consider whether you understand how they work and whether you can afford to take the high risk of losing your money. Backtested, simulated and paper-trading results are hypothetical and do not guarantee future performance. Cerebro is software that carries out rules you configure; it does not provide personalised investment advice or manage money on your behalf. <a href="risk.html">Read the full risk disclosure</a>.</p>
    <p style="margin-top:14px;font-size:13px">© 2026 Cerebro · tradecerebro.com</p>
  </div>
</footer>
<script src="assets/site.js" defer></script>
</body>
</html>
"""

for src in sorted((ROOT / "pages").glob("*.html")):
    text = src.read_text()
    m = re.match(r"<!--\s*title:(.*?)\n\s*description:(.*?)-->\n", text, re.S)
    title, desc = (m.group(1).strip(), m.group(2).strip()) if m else ("Cerebro", "")
    body = text[m.end():] if m else text
    out = head(title, desc, src.name) + header(src.name) + body.replace("{{APP}}", APP).replace("{{BETA_EMAIL}}", BETA_EMAIL) + FOOTER
    (ROOT / src.name).write_text(out)
    print("built", src.name)
