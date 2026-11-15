---
name: ahrefs-competitive-intelligence
description: "Free Ahrefs Suite (All 6 Core SaaS Platforms): Site Explorer, Keywords Explorer, Site Audit, Content Explorer, Rank Tracker, and AI & Brand Tracking (GEO/AEO Radar), plus Content Gap, Link Intersect, Broken Link Steal, and Toxic Link Disavow."
version: 3.0.0
author: Ghulam Ali SEO & ApexGMB
tags: [ahrefs, site-explorer, keywords-explorer, site-audit, content-explorer, rank-tracker, brand-tracking, geo-aeo]
---

# Free Ahrefs Suite: Complete 6-in-1 Open-Source Alternative

> Based on the core SaaS product architecture of **Ahrefs** and **Ghulam Ali's Ahrefs Masterclass** (`https://youtu.be/WjEIx9kbVY8`).

ApexGMB provides a 100% free, automated alternative to Ahrefs' \$199–\$999/month subscription suite. Powered by Gemini 2.5 Flash and autonomous scraping/parsing logic, it operationalizes all 6 core Ahrefs platforms directly on your desktop or via CLI.

---

## 🏛️ The 6 Core Ahrefs Platforms

### 1. 🌐 Site Explorer
* **What it Does**: Deeply analyzes any website's backlink profile, referring domain velocity, organic search traffic, and ranking keyword landscape.
* **Key Metrics Replicated**:
  * **Domain Rating (DR 0–100) & URL Rating (UR 0–100)**: Authority score calculation.
  * **Referring Domains & Backlinks**: DoFollow vs. NoFollow link equity ratios.
  * **Organic Search Traffic & Value**: Estimated monthly organic search visitors and equivalent Google Ads traffic value.
  * **Anchor Text Health Ratios**: Evaluates anchor distribution to prevent Google Penguin penalties (Branded 50-60%, Naked URLs 20-25%, Generic 10-15%, Exact Match <10%).

### 2. 🔍 Keywords Explorer
* **What it Does**: Conducts search intent classification, search volume estimation, Keyword Difficulty (KD), and SERP real estate targeting.
* **Key Metrics Replicated**:
  * **3-Tier Intent Matrix**: Transactional ("Money"), Commercial Investigation, and Informational.
  * **Keyword Difficulty (KD 0–100)**: Estimated referring domains needed to rank on Page 1.
  * **SERP Feature Alignment**: Map Pack 3-Pack, Featured Snippets, People Also Ask, and Google AI Overviews.
  * **Semantic Entity & LSI Clusters**: Semantic topics rewarded by Google's RankBrain and modern LLMs.

### 3. 🏥 Site Audit
* **What it Does**: Crawls websites to detect technical SEO flaws, crawl errors, speed bottlenecks, and on-page issues.
* **Key Checks Replicated**:
  * **Crawlability & Indexability**: Robots.txt directives, XML sitemaps, canonical loops, HTTP status codes (200, 301, 404, 500).
  * **On-Page & Metadata**: Single H1 tag enforcement, title tag pixel length, meta descriptions with CTR hooks, image alt text keyword integration.
  * **Core Web Vitals**: Largest Contentful Paint (LCP < 2.5s), Cumulative Layout Shift (CLS < 0.1), and Interaction to Next Paint (INP < 200ms).
  * **Structured Data**: JSON-LD schema verification (`LocalBusiness`, `Product`, `FAQPage`).

### 4. 📰 Content Explorer
* **What it Does**: Discovers high-performing content, trending topics, and backlink-worthy angles in any vertical.
* **Key Capabilities Replicated**:
  * **Viral Content Decomposition**: Unpacks the top 3 articles/guides in a niche with highest backlink velocity and social engagement.
  * **Unlinked Brand Mentions**: Identifies web pages discussing the brand or relevant service without a clickable hyperlink, producing a 1-click outreach script.
  * **Content Syndication Blueprint**: SOPs for converting top guides into LinkedIn newsletters, Medium articles, and Reddit authority posts.

### 5. 📈 Rank Tracker
* **What it Does**: Monitors desktop and mobile search engine rankings across custom keyword sets over time.
* **Key Metrics Replicated**:
  * **Share of Voice (SOV %)**: Total percentage of search impressions captured by the domain within its target keyword cluster.
  * **Average Position**: Mean ranking across tracked commercial and informational queries.
  * **SERP Features Won**: Tracks wins in Google Map 3-Pack, Featured Snippets, Knowledge Panels, and Sitelinks.
  * **Striking Distance Radar**: Flags keywords ranked #4–#15 that can quickly leap to Top 3 with minor on-page or internal link updates.

### 6. 🤖 AI & Brand Tracking (GEO / AEO Radar)
* **What it Does**: Tracks brand citations, share of voice, and sentiment across generative AI engines (Perplexity, Google AI Overviews, ChatGPT Search, Gemini, Claude).
* **Key Capabilities Replicated**:
  * **AI Citation Share**: Measures how frequently LLMs recommend your brand compared to direct competitors.
  * **AI Citability Readiness Score (0–100)**: Evaluates structured data completeness, Wikidata entity grounding, and third-party authority citations.
  * **Generative Engine Optimization (GEO) Roadmap**: Concrete steps to turn the brand into an authoritative source for AI-generated answers.

---

## ⚡ Specialized Competitive Intelligence Sub-Engines

* **🎯 Content Gap Analysis**: Uncovers high-converting keywords where 2+ competitors rank in the Top 10, but your website does not rank at all.
* **🔗 Link Intersect**: Pinpoints authoritative local directories and vendor portals that link to competitors but not to your domain.
* **🏆 Top Pages Teardown**: Deconstructs the exact 5–10 pages driving 80% of competitor search inquiries.
* **⚡ Broken Link Building (Dead Link Steal)**: Reclaims high-authority backlinks pointing to competitor 404 pages using friendly notification emails.
* **🛡️ Toxic Link & Disavow Generator**: Generates formatted Google Search Console `disavow.txt` rules to neutralize negative SEO attacks.

---

## 💻 CLI Command Execution Matrix

```bash
# ==========================================
# 1. THE 6 CORE FREE AHREFS PLATFORMS
# ==========================================

# 1. Site Explorer (Backlinks, RDs, Traffic & DR/UR)
python3 skills/scripts/gmb_ai_runner.py site-explorer \
  --domain "bhardwajstudio.in" \
  --competitors "weddingwire.in, shaadisaga.com" \
  --niche "Wedding Photography"

# 2. Keywords Explorer (Search Volume, KD & Intent)
python3 skills/scripts/gmb_ai_runner.py keywords-explorer \
  --keyword "wedding photographer Delhi" \
  --niche "Photography Studio"

# 3. Site Audit (Crawl, 404s & Core Web Vitals)
python3 skills/scripts/gmb_ai_runner.py site-audit \
  --url "https://bhardwajstudio.in" \
  --niche "Local Studio"

# 4. Content Explorer (Viral Topics & Mentions)
python3 skills/scripts/gmb_ai_runner.py content-explorer \
  --topic "pre wedding shoot poses and locations" \
  --niche "Wedding Photography"

# 5. Rank Tracker (Track Desktop/Mobile Ranks & SOV)
python3 skills/scripts/gmb_ai_runner.py rank-tracker \
  --domain "bhardwajstudio.in" \
  --keywords "wedding photographer Delhi, candid wedding shoot Noida, pre wedding studio" \
  --location "Delhi NCR"

# 6. AI & Brand Tracking (GEO/AEO Radar in Perplexity & SGE)
python3 skills/scripts/gmb_ai_runner.py ai-brand-tracker \
  --brand "Apex Media Studio" \
  --domain "bhardwajstudio.in" \
  --competitors "Studio Memory, WeddingFilmCo" \
  --niche "Wedding Photography"


# ==========================================
# 2. SPECIALIZED COMPETITIVE SUB-ENGINES
# ==========================================

# Content Gap Analysis
python3 skills/scripts/gmb_ai_runner.py content-gap \
  --my-site "bhardwajstudio.in" \
  --competitors "weddingwire.in, shaadisaga.com" \
  --niche "Wedding Photography" \
  --city "Delhi NCR"

# Competitor Link Intersect Gap
python3 skills/scripts/gmb_ai_runner.py link-intersect \
  --my-site "bhardwajstudio.in" \
  --competitors "comp1.com, comp2.com" \
  --niche "Wedding Photography"

# Reverse-Engineer Competitor Top Performing Page
python3 skills/scripts/gmb_ai_runner.py top-pages-teardown \
  --competitor "competitorstudio.com/pre-wedding-shoot-delhi" \
  --niche "Wedding Photography"

# Broken Link Steal & Pitch Generator
python3 skills/scripts/gmb_ai_runner.py broken-link-builder \
  --business "Apex Media Studio" \
  --topic "Ultimate Wedding Photography Checklist" \
  --niche "Photography Studio"

# Toxic Link Profile & Google Disavow Generator
python3 skills/scripts/gmb_ai_runner.py toxic-link-audit \
  --domain "bhardwajstudio.in" \
  --anchors "cheap casino, buy followers, best wedding photographer"
```
