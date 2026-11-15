---
name: ahrefs-competitive-intelligence
description: "Ahrefs-Grade Competitor & Search Intelligence: Link Intersect gap analysis, Keyword Explorer intent clustering, DR/UR link graph evaluation, and Technical Site Health Audits."
---

# Ahrefs-Grade Competitor & Search Intelligence

> Based on the industry standard workflows from **Ahrefs** (Keyword Explorer, Site Explorer, Link Intersect, Content Explorer, and Technical Site Audit).

This skill replicates the core analytical superpowers of Ahrefs inside ApexGMB, giving local businesses and agencies deep competitor visibility without requiring a \$199/month enterprise subscription.

---

## 🏛️ The 5 Ahrefs Core Modules Operationalized

### 1. 🔗 Link Intersect (Competitor Backlink Gap Analysis)
* **The Principle**: If a local news outlet, vendor directory, or industry blog links to 2 or 3 of your competitors, they will almost certainly link to you if pitched properly.
* **The Method**:
  1. Input Target URL + 3 Competitor URLs.
  2. Map out the overlapping Referring Domains (RDs).
  3. Filter by Link Type: Editorial vs. Local Citations vs. Guest Posts vs. Directory Mentions.
  4. Generate custom outreach angles for the uncovered high-DA gaps.

---

### 2. 🔍 Keyword Explorer & Intent Clustering
* **Search Intent Classification**:
  * **Informational**: *"how to choose a wedding photographer"*, *"photo studio lighting tips"*
  * **Commercial Investigation**: *"best candid wedding photographer in Delhi vs Noida"*, *"top 10 photo studios"*
  * **Transactional / High Commercial Value**: *"hire wedding photographer Delhi price"*, *"urgent passport photo near me"*
* **Difficulty & SERP Features**: Evaluates ranking difficulty based on the average Referring Domains required to rank in the Top 10, plus target SERP features (Local 3-Pack, Featured Snippets, Image Packs, People Also Ask).

---

### 3. 📈 Site Explorer & Anchor Text Profile Ratios
Monitors backlink health to avoid Google Penguin / spam algorithmic penalties:
* **Safe Anchor Text Distribution**:
  * **Branded Anchors (50–60%)**: `"[Brand Name]"`, `"[Brand Name] Studio"`
  * **Naked URLs (20–25%)**: `"bhardwajstudio.in"`, `"https://bhardwajstudio.in/"`
  * **Generic / Miscellaneous (10–15%)**: `"click here"`, `"website"`, `"source"`
  * **Exact / Partial Match Keywords (5–10% max)**: `"candid wedding photographer Delhi"` *(Over-optimizing this triggers algorithmic penalties)*.

---

### 4. 📰 Content Explorer & Unlinked Brand Mentions
* Identifies the highest-performing content topics in your niche sorted by referring domains and organic search traffic.
* **Brand Reclamation**: Scans for articles and directories that mention the business name without a clickable hyperlink, outputting a friendly 1-click link request template.

---

### 5. 🏥 Technical Site Audit & Core Web Vitals
Evaluates the technical health of the money site:
* Crawlability & Indexability (robots.txt, XML sitemaps, canonical tags).
* Broken links (404s) and redirect loops (301/302).
* Missing H1 tags, duplicate meta descriptions, and image alt text density.
* Mobile responsiveness & Core Web Vitals (LCP, CLS, INP).

---

## 💻 CLI Commands

```bash
# Run a Competitor Link Intersect Gap Analysis
python3 skills/scripts/gmb_ai_runner.py link-intersect \
  --my-site "bhardwajstudio.in" \
  --competitors "competitor1.com, competitor2.com, competitor3.com" \
  --niche "Wedding Photography" \
  --city "Delhi NCR"

# Run Keyword Explorer & Intent Clustering
python3 skills/scripts/gmb_ai_runner.py keyword-explorer \
  --keyword "wedding photographer Delhi" \
  --niche "Photography Studio"

# Run Technical Site Audit & On-Page Health Check
python3 skills/scripts/gmb_ai_runner.py site-audit \
  --url "https://bhardwajstudio.in" \
  --niche "Wedding & Portrait Studio"
```
