#!/usr/bin/env python3
"""
MapRank Local SEO & AI Automation Runner
Executes automated GBP audits, keyword extraction, review responses, and post calendars via OpenRouter / Gemini.
"""

import sys
import os
import json
import argparse
import urllib.request
import urllib.error

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")

def call_llm(prompt: str, system: str = "You are an elite Google Business Profile and Local SEO growth expert.") -> str:
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY environment variable is not set. Please export OPENROUTER_API_KEY='your-key'.")
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://maprank-everywhere.local",
        "X-Title": "MapRank Everywhere Engine",
    }
    payload = {
        "model": "google/gemini-2.5-flash",
        "max_tokens": 800,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": prompt}
        ]
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            res_json = json.loads(resp.read().decode("utf-8"))
            return res_json.get("choices", [{}])[0].get("message", {}).get("content", "")
    except Exception as e:
        return f"Error executing LLM call: {e}"

def run_audit(args):
    prompt = f"""
Perform a comprehensive Google Business Profile Local SEO Audit for:
Business Name: {args.name}
Primary Category: {args.category}
Location / City: {args.city}
Rating: {args.rating} ({args.reviews} reviews)
Current Description: {args.description or 'None provided'}

Provide:
1. Health & Completeness Score (0-100) with rating breakdown
2. Missing High-Impact Secondary Categories
3. High-Ranking Search Keywords to target in Description & Services
4. Optimized 750-character GBP Description
5. Immediate 3-step action checklist to rank in Top 3 Local Pack
"""
    result = call_llm(prompt)
    print("\n" + "="*50)
    print(f"📊 GMB AUDIT REPORT: {args.name}")
    print("="*50)
    print(result)

def run_reply(args):
    prompt = f"""
Generate 3 distinct, professional Google Review replies for:
Business: {args.business}
Reviewer: {args.reviewer}
Star Rating: {args.stars} Stars
Customer Feedback: "{args.text}"

Requirements:
- Option 1 (Friendly & Warm): Appreciation, mention business name, and smooth keyword injection.
- Option 2 (Concise & Professional): Direct, polite, thanking for specific feedback.
- Option 3 (Engagement & Next Visit): Welcoming future visit, highlighting related services.
If 1-3 stars, prioritize sincere empathy, de-escalation, and offering private offline contact.
"""
    result = call_llm(prompt)
    print("\n" + "="*50)
    print(f"⭐ REVIEW REPLY DRAFTS ({args.stars}★ from {args.reviewer})")
    print("="*50)
    print(result)

def run_posts(args):
    prompt = f"""
Generate a complete 4-Week Google Posts Calendar for:
Business: {args.business}
Category: {args.category}
City / Target Area: {args.city}
Special Offer / Promotion: {args.offer or 'General seasonal highlight'}

For each of the 4 weeks, provide:
- Post Type (What's New, Offer, Event)
- Engaging Headline & Hook
- Post Body Copy (100-150 words with local keywords)
- Recommended Call-To-Action button (Book, Call Now, Learn More)
- Visual / Photo suggestion for the post
"""
    result = call_llm(prompt)
    print("\n" + "="*50)
    print(f"📝 4-WEEK GOOGLE POSTS CALENDAR: {args.business}")
    print("="*50)
    print(result)

def run_proposal(args):
    prompt = f"""
Generate an agency / freelancer Local SEO client proposal and retainer pitch:
Client Business: {args.client}
Category: {args.category}
Identified Weaknesses: {args.issues}
Proposed Retainer Price: ${args.price}/month

Include:
1. Executive Problem Summary (Why they are losing customers to competitors)
2. 30-Day Action Plan (Audit, Category Fix, Weekly Posts, Review Automation)
3. Expected Deliverables & Measurable ROI (Calls, Website clicks, Direction requests)
4. Retainer Terms and closing call to action
"""
    result = call_llm(prompt)
    print("\n" + "="*50)
    print(f"💼 CLIENT LOCAL SEO PROPOSAL: {args.client}")
    print("="*50)
    print(result)

def run_qa(args):
    prompt = f"""
Generate 5 high-converting, SEO-optimized Google Q&A (Questions & Answers) pairs for:
Business Name: {args.business}
Primary Category: {args.category}
Location / City: {args.city}

Strategic Question Hierarchy:
- Question 1: Pricing / Packages & Turnaround Time
- Question 2: Booking process, Appointments & Consultation
- Question 3: Service area coverage & On-site / Studio availability
- Question 4: Customization, Equipment & Deliverable formats
- Question 5: Payment methods accepted & Rush/Emergency orders

Requirements:
Incorporate natural target local keywords in BOTH the question and the owner answer so Google indexes them for conversational and voice search.
"""
    result = call_llm(prompt)
    print("\n" + "="*50)
    print(f"❓ PRE-SEEDED GOOGLE Q&A PAIRS: {args.business}")
    print("="*50)
    print(result)

def run_suspension(args):
    prompt = f"""
Perform a Google Business Profile Policy & Suspension Risk Audit for:
Business Name: {args.name}
Category: {args.category}
Address / Model: {args.address} (Storefront or SAB?)
Website: {args.website or 'Not specified'}

Analyze:
1. Business Name Spamming Risk (Check if non-official keywords or city names are stuffed in title)
2. Storefront vs. Service Area Business (SAB) compliance
3. Re-verification vulnerability triggers
4. Reinstatement Readiness Checklist (Utility bills, signage, business registry)
5. Overall Risk Level: LOW, MEDIUM, or HIGH
"""
    result = call_llm(prompt)
    print("\n" + "="*50)
    print(f"🛡️ SUSPENSION RISK AUDIT: {args.name}")
    print("="*50)
    print(result)

def run_dispute(args):
    prompt = f"""
Generate a formal, policy-compliant Google Review Removal Dispute Ticket for:
Business Name: {args.business}
Reviewer: {args.reviewer}
Review Text: "{args.text}"
Reason for Dispute: {args.reason or 'Competitor attack / Not a genuine customer'}

Write a professional dispute appeal to Google Support citing Google's Prohibited and Restricted Content policies (Conflict of Interest, Misinformation, Spam, or Defamation) requesting immediate removal.
"""
    result = call_llm(prompt)
    print("\n" + "="*50)
    print(f"🚫 GOOGLE REVIEW DISPUTE APPEAL")
    print("="*50)
    print(result)

def run_repurpose(args):
    prompt = f"""
Turn this 5-star customer review / client win into a multi-platform social media campaign:
Business Name: {args.business}
Category: {args.category}
Customer Review / Win: "{args.text}"

Generate:
1. Instagram Reel / TikTok Short Script (Hook in first 3 seconds, story body, and Call-To-Action)
2. Facebook / Instagram Photo Carousel Caption (Emotional hook, review quote, hashtags)
3. LinkedIn B2B / Founder Story Post (Customer experience lesson, behind the scenes)
4. Local Offer Hook to pair with the social post
"""
    result = call_llm(prompt)
    print("\n" + "="*50)
    print(f"📱 SOCIAL MEDIA REPURPOSED CAMPAIGN: {args.business}")
    print("="*50)
    print(result)

def run_adspy(args):
    prompt = f"""
Generate a Competitor Ad Library Teardown & High-Converting Ad Campaign for:
Business Name: {args.business}
Category: {args.category}
City / Target Area: {args.city}

Include:
1. Meta / TikTok Competitor Ad Analysis (What angles competitors in this niche typically run)
2. 3 Winning Ad Angles with Hooks & Copy (Problem-Agitation, Social Proof, and Irresistible Offer)
3. Visual Creative Directions (UGC style, Before/After, Studio showcase)
4. Budget & Retargeting Strategy for Local Leads
"""
    result = call_llm(prompt)
    print("\n" + "="*50)
    print(f"🎯 AD LIBRARY TEARDOWN & CAMPAIGN: {args.business}")
    print("="*50)
    print(result)

def run_agency(args):
    prompt = f"""
You are an elite AI cold outreach strategist and 1-person agency closer.
Business Name: {args.business}
Category: {args.category} in {args.city}
Observed Ranking Bottleneck: {args.gap}

Write:
1. High-Converting Cold Email (under 100 words):
   - Subject Line: 2 casual, hyper-targeted variations
   - Observation Hook: Acknowledge their business and call out their exact ranking bottleneck ({args.gap})
   - Frictionless Offer: Free 2-minute video teardown showing exact steps to rank in Top 3 Map Pack
   - Clean signature
2. Day 3 Follow-Up: 2-sentence polite bump mentioning a high-intent local search query.
3. Upwork Proposal (under 150 words): Problem-first hook, proof of work, 3-milestone plan.
4. 3-Tier Retainer Package ($500 Foundation, $1,500 Growth, $3,000 Domination) with specific deliverables.
5. Sales Call Closing Scripts for 'Too expensive' and 'Already have an agency'.
"""
    result = call_llm(prompt, "You are an elite 1-person agency cold outreach copywriter.")
    print("\n" + "="*50)
    print(f"💼 1-PERSON AGENCY & OUTREACH ENGINE: {args.business}")
    print("="*50)
    print(result)

def run_agentos(args):
    prompt = f"""
You are an autonomous AI Agent OS running the Observe-Think-Act loop for Google Business Profiles.
Business Name: {args.business}
Category: {args.category}
Raw Signals: {args.signals}
Learned Memory & SOP Rules: {args.memory}

Perform the loop:
1. [OBSERVE]: Scan listing completeness, review recency, category signal strength.
2. [THINK]: Pinpoint the #1 algorithmic bottleneck holding them back from #1 on Google Maps.
3. [ACT - EXECUTABLE SOPs]:
   - SOP 1: Immediate Listing Fix
   - SOP 2: Geo-Optimized 5-Star Review Reply template (with local keywords)
   - SOP 3: Google Post Update (catchy headline, value snippet, call to action)
"""
    result = call_llm(prompt, "You are an autonomous AI Agent OS executing local business SOPs.")
    print("\n" + "="*50)
    print(f"⚡ AGENT OS OBSERVE-THINK-ACT LOOP: {args.business}")
    print("="*50)
    print(result)

def run_fours(args):
    prompt = f"""
You are applying the 'Showcase Proof-of-Work' framework.
Create a high-impact, professional Client Teardown Case Study for:
Business: {args.business}
Niche: {args.category}
Market: {args.city}

Structure:
1. Executive Summary: Current local Google Maps visibility vs market potential.
2. The 3 Costly Bottlenecks: Unoptimized category signals, dormant review keywords, competitor geo-dominance.
3. The Transformation Roadmap (Step-by-Step implementation).
4. Estimated Financial ROI: What moving into the Top 3 Map Pack delivers in monthly customer inquiries and revenue ($15k-$30k value).
5. 4S Monetization Blueprint: How to turn this into a $10k/month recurring agency retainer product.
"""
    result = call_llm(prompt, "You are a growth engineer creating proof-of-work case studies.")
    print("\n" + "="*50)
    print(f"📊 4S PROOF-OF-WORK SHOWCASE & SCALE BLUEPRINT: {args.business}")
    print("="*50)
    print(result)

def run_orm(args):
    prompt = f"""
You are an elite Online Reputation Management (ORM) & Branded SERP Dominance Strategist.
Business: {args.business}
Category / Niche: {args.category}
Market: {args.city}
Specific Issue or Context: {args.issue or 'General brand defense & review funnel automation'}

Generate a complete ORM & Branded SERP Protection Blueprint incorporating 2026 AI SEO and Review Gating:
1. Branded SERP Defense Strategy: Define 10 high-authority assets to blanket Page 1 Google results for "{args.business} reviews/complaints", pushing negative results to Page 2.
2. Review Gating & Funnel Architecture (GoHighLevel style):
   - SMS & Email trigger sequence (timing, copy, direct Google review short-link)
   - Positive path (4-5 stars -> direct Google Maps review flow)
   - Negative interception path (1-3 stars -> private manager feedback loop)
3. 2026 AI SEO & Entity Shielding:
   - Organization Schema `sameAs` entity cluster
   - SGE / AI Overviews sentiment protection playbook
4. Rapid Crisis De-escalation Protocol (A.A.A. framework for handling hostile reviews or public complaints without brand damage)
"""
    result = call_llm(prompt, "You are a master of Online Reputation Management (ORM) and Branded SERP SEO.")
    print("\n" + "="*50)
    print(f"🛡️ ORM & BRANDED SERP DEFENSE BLUEPRINT: {args.business}")
    print("="*50)
    print(result)

def run_domain_eval(args):
    prompt = f"""
You are an expert domain evaluator and link architect (applying Kalin Karakehayov's 200k+ domain framework).
Domain to Evaluate: {args.domain}
Target Niche / Vertical: {args.niche}
Known History / Metrics: {args.history or 'Not specified'}

Analyze this domain for:
1. Authority & Harmonic Centrality Potential: How strongly its link proximity can impact Google PageRank and Common Crawl AI search ingestion.
2. The 5-Point Safety Filter: Wayback spam check, anchor text naturalness, toxic redirects, topical congruence.
3. Recommended Deployment Strategy: 301 redirect vs Private Content Hub vs Money Site rebuild.
4. Footprint Neutralization Guidelines: Hosting, WHOIS, and outbound link profile requirements.
"""
    result = call_llm(prompt, "You are a master of aged domains, link graphs, and private network architecture.")
    print("\n" + "="*50)
    print(f"🌐 AGED DOMAIN & HARMONIC CENTRALITY EVALUATION: {args.domain}")
    print("="*50)
    print(result)

def run_parasite_probe(args):
    prompt = f"""
You are an aggressive SEO market strategist applying Parasite SEO and Territory Dominance (Charles Floate & David Quaid playbook).
Business: {args.business}
Target Keyword: {args.keyword}
Niche: {args.niche}

Provide a Rapid Parasite SEO Probing Plan:
1. Top 3 Parasite Platforms for this search intent (LinkedIn Pulse, Medium, Substack, Reddit, Quora).
2. The 48-Hour Ranking Content Outline: Hook, search intent fulfillment, schema/formatting, internal link anchors.
3. Conversion & Money Funnel: How to siphon traffic from the parasite page into the primary Google Business Profile or booking funnel.
4. Scale-to-Asset Decision Criteria: When to transition from parasite ranking to buying an Aged Domain or EMD.
"""
    result = call_llm(prompt, "You are an elite parasite SEO and digital territory growth engineer.")
    print("\n" + "="*50)
    print(f"⚡ PARASITE SEO PROBING BLUEPRINT: {args.keyword}")
    print("="*50)
    print(result)

def run_link_intersect(args):
    prompt = f"""
You are an expert Ahrefs Link Intersect and Backlink Gap Specialist.
My Domain: {args.my_site}
Competitor Domains: {args.competitors}
Niche / Vertical: {args.niche}
Target Market / City: {args.city}

Perform a rigorous Competitor Backlink Gap Analysis:
1. High-Probability Overlapping Link Sources: What local business directories, industry portals, press outlets, and vendor listings do these competitors have that my site is missing?
2. Tiered Priority Action List (Tier 1: High-DA DoFollow citations; Tier 2: Niche vendor blogs; Tier 3: Local community sponsors).
3. The Outreach Angle & Pitch Script: A customized, high-converting outreach email template to request inclusion or guest contribution.
4. Anchor Text Strategy: Recommended anchor ratios to maintain a natural, penalty-free backlink profile.
"""
    result = call_llm(prompt, "You are a master of Ahrefs Link Intersect and competitor backlink analysis.")
    print("\n" + "="*50)
    print(f"🔗 AHREFS LINK INTERSECT GAP ANALYSIS: {args.my_site}")
    print("="*50)
    print(result)

def run_keyword_explorer(args):
    prompt = f"""
You are an expert Ahrefs Keyword Explorer & Search Intent Architect.
Seed Keyword: {args.keyword}
Niche / Category: {args.niche}

Perform a deep Ahrefs-Grade Keyword & Intent Decomposition:
1. Search Intent Matrix:
   - Transactional / 'Money' Keywords (High commercial buying intent + estimated CPC tier)
   - Commercial Investigation Keywords (Comparisons, best-in-city)
   - Informational & Question Queries ('How much does X cost', 'What to wear for Y')
2. Keyword Difficulty (KD) & SERP Features Analysis:
   - Estimated KD score (0-100) & estimated Referring Domains needed to crack Page 1
   - Target SERP Features (Map Pack 3-Pack, Featured Snippet, Image Carousel, People Also Ask)
3. 2026 Semantic Entity Clusters: Core secondary keywords and LSI entities to include in the content to capture Google's AI Overview.
"""
    result = call_llm(prompt, "You are a master of Ahrefs Keyword Explorer and semantic search clustering.")
    print("\n" + "="*50)
    print(f"🔍 AHREFS KEYWORD EXPLORER & INTENT MATRIX: {args.keyword}")
    print("="*50)
    print(result)

def run_site_audit(args):
    prompt = f"""
You are an Ahrefs Technical Site Audit & Core Web Vitals Engineer.
Website URL: {args.url}
Niche: {args.niche}

Generate a comprehensive Technical SEO Audit & Health Checklist:
1. Crawlability & Architecture: Robots.txt rules, XML sitemap validation, canonical hygiene, internal linking silo structure.
2. On-Page & Semantic Signals: Title tag optimization, H1/H2 hierarchy, meta description CTR hooks, image alt text keyword integration.
3. Local Schema & Entity Anchor: LocalBusiness JSON-LD markup, GeoCoordinates, AggregateRating, openingHoursSpecification.
4. Speed & Core Web Vitals (LCP, CLS, INP) Optimization: TTFB minimization, image compression (WebP), asset minification.
5. The 7-Day Technical Action Roadmap: Prioritized fixes ranked by algorithmic ranking impact.
"""
    result = call_llm(prompt, "You are an elite technical SEO auditor and Core Web Vitals performance specialist.")
    print("\n" + "="*50)
    print(f"🏥 AHREFS TECHNICAL SITE AUDIT & HEALTH CHECKLIST: {args.url}")
    print("="*50)
    print(result)

def run_ecom_architecture(args):
    prompt = f"""
You are an expert eCommerce SEO Architect (applying Ghulam Ali's eCommerce SEO masterclass).
Store / Brand Name: {args.store}
Core Categories / Services: {args.categories}

Design a Complete 3-Click Information Architecture & Silo Blueprint:
1. 3-Click Category Hierarchy: Clean parent-to-child silo structure with breadcrumb trails.
2. Faceted Navigation & Parameter Defense:
   - Canonical normalization rules for filtering/sorting parameters
   - Robots.txt disallow directives to prevent index bloat and crawl budget waste.
3. Internal Silo Linking Strategy: How category pages pass PageRank down to high-margin products and packages.
"""
    result = call_llm(prompt, "You are a master of eCommerce SEO Information Architecture.")
    print("\n" + "="*50)
    print(f"🛍️ ECOMMERCE INFORMATION ARCHITECTURE & SILO BLUEPRINT: {args.store}")
    print("="*50)
    print(result)

def run_product_schema(args):
    prompt = f"""
Generate 100% valid Google-compliant Schema.org JSON-LD for this Product / Service Package:
Name: {args.name}
Brand: {args.brand}
Price: {args.price} {args.currency}
Rating: {args.rating} ({args.reviews} reviews)

Output:
1. Pure JSON-LD snippet enclosed in <script type="application/ld+json"> including:
   - @type: 'Product'
   - name, description, brand
   - offers: @type 'Offer', price, priceCurrency, availability ('https://schema.org/InStock'), priceValidUntil
   - aggregateRating: @type 'AggregateRating', ratingValue, reviewCount
2. Implementation Instructions: Where to place it on the product/package page to trigger gold stars in Google search results.
"""
    result = call_llm(prompt, "You are a JSON-LD structured data and rich snippets expert.")
    print("\n" + "="*50)
    print(f"🏷️ PRODUCT & OFFER RICH SNIPPET SCHEMA: {args.name}")
    print("="*50)
    print(result)

def run_category_content(args):
    prompt = f"""
Write high-converting, SEO-optimized Category Page Content (Ghulam Ali formula) for:
Category: {args.category}
Niche: {args.niche}
Location / Market: {args.city}

Provide:
1. Above-the-Fold Intro (80-120 words): Catchy H1, search intent fulfillment, trust signals, and subtle keyword integration before the product/package cards.
2. Below-the-Grid Authoritative Buying Guide (600+ words):
   - H2: How to choose the right package / product
   - H2: Key features, inclusions, and deliverables comparison
   - H2: Frequently Asked Questions (FAQ) ready for FAQPage Schema
"""
    result = call_llm(prompt, "You are an elite eCommerce conversion copywriter and SEO specialist.")
    print("\n" + "="*50)
    print(f"📝 ECOMMERCE CATEGORY PAGE CONTENT & BUYING GUIDE: {args.category}")
    print("="*50)
    print(result)

def run_nap_audit(args):
    prompt = f"""
Perform a deep NAP (Name, Address, Phone) & Local Citation Consistency Audit based on Ghulam Ali's 5-Hour Local SEO Masterclass for:
Business Name: {args.business}
Street Address: {args.address}
Phone Number: {args.phone}
Website URL: {args.website}
Target City / Service Area: {args.city}

Deliver:
1. Canonical NAP Master Profile: The exact standardized string formatting for website headers, GBP, and citations (preventing suite/road abbreviation conflicts).
2. Data Aggregator & Inconsistency Risk Assessment: Where inconsistencies typically occur (postal standards, local directory formatting, tracking numbers vs primary line).
3. Primary Citation Directories Audit Checklist: Top 10 Tier-1 data sources (Google, Apple Maps, Bing, Yelp, Facebook, YellowPages, Justdial/IndiaMART if regional) with field-by-field verification checklist.
4. NAP Correction Action Plan: Step-by-step instructions to clean up duplicate listings, legacy phone numbers, or previous addresses.
"""
    result = call_llm(prompt, "You are a master Local SEO auditor specializing in NAP consistency, data aggregators, and Google Business Profile authority.")
    print("\n" + "="*50)
    print(f"📍 GHULAM ALI NAP & LOCAL CITATION AUDIT: {args.business}")
    print("="*50)
    print(result)

def run_geo_silo(args):
    prompt = f"""
Design a hyper-local Geo-Silo & Neighborhood Landing Page Architecture (Ghulam Ali formula) for:
Business: {args.business}
Primary Service: {args.service}
Target Neighborhood / Sub-locality: {args.neighborhood}
City / Metro Area: {args.city}
Key Local Landmarks / Arterials: {args.landmarks or 'Major metro station, central market, highway junction'}

Provide:
1. Page URL Structure & SEO Meta: Canonical URL slug, Meta Title (under 60 chars), Meta Description (under 155 chars).
2. Content Blueprint:
   - H1 Tag & Above-the-fold Hook
   - Geo-Targeted Driving Directions section ('How to reach us from {args.landmarks}')
   - Neighborhood proof points & local service area coverage
   - Hyper-local FAQ with 3 questions addressing neighborhood residents
3. Google Map Embed & CID Strategy: How to embed the localized Google Map and link to GBP Place ID without breaking mobile load speed.
4. Internal Linking Mesh: Upward links to city parent hub, horizontal links to neighboring localities.
"""
    result = call_llm(prompt, "You are an elite Local SEO architect specializing in neighborhood siloing, map embeds, and geo-grid proximity expansion.")
    print("\n" + "="*50)
    print(f"🗺️ LOCAL GEO-SILO & NEIGHBORHOOD PAGE: {args.neighborhood}, {args.city}")
    print("="*50)
    print(result)

def run_local_citation_matrix(args):
    prompt = f"""
Generate an authoritative Local Citation Building Matrix based on Ghulam Ali's Local SEO blueprint for:
Business: {args.business}
Category / Vertical: {args.category}
City / Region: {args.city}
Country: {args.country}

Provide:
1. Top Tier-1 Foundational Citations (Domain Authority 80+) applicable to {args.country}.
2. Top Tier-2 Regional & Business Registries for {args.city}.
3. Top 5 High-Relevance Niche / Industry Specific Citations for '{args.category}'.
4. Exact Submission Data Matrix:
   - Business Title (exact unbranded)
   - Category mapping recommendations
   - 250-character and 500-character description variations
   - Target anchor text and website tracking parameters
5. Aggregator Syndication Strategy (Data Axle, Neustar Localeze, Foursquare, etc.).
"""
    result = call_llm(prompt, "You are a senior citation builder and local search data aggregator strategist.")
    print("\n" + "="*50)
    print(f"🏛️ LOCAL CITATION MATRIX: {args.business} ({args.city})")
    print("="*50)
    print(result)

def run_local_schema(args):
    prompt = f"""
Generate a complete, production-ready LocalBusiness JSON-LD Schema (Schema.org compliant) for:
Business Name: {args.business}
Business Type / Schema @type: {args.category} (e.g. PhotographyStudio, Dentist, LocalBusiness)
Street Address: {args.address}
City: {args.city}
State / Region: {args.state}
Postal Code: {args.zip}
Country: {args.country}
Phone Number: {args.phone}
Website URL: {args.website}
Coordinates: Latitude {args.lat}, Longitude {args.lng}

Output:
1. Complete JSON-LD enclosed in <script type="application/ld+json">:
   - Must include: @context, @type, @id, name, url, telephone, address (PostalAddress), geo (GeoCoordinates), areaServed (Multiple administrative areas), openingHoursSpecification, priceRange.
   - Must include an authoritative sameAs array linking to GBP, Facebook, Instagram, Yelp, and top local citations.
2. Verification instructions for Google Rich Results Test and placement recommendation.
"""
    result = call_llm(prompt, "You are an expert technical SEO and Schema.org structured data engineer.")
    print("\n" + "="*50)
    print(f"🏷️ LOCALBUSINESS JSON-LD SCHEMA: {args.business}")
    print("="*50)
    print(result)

def main():
    parser = argparse.ArgumentParser(description="GMB Automation Playbook CLI")
    sub = parser.add_subparsers(dest="command", required=True)

    # audit
    p_audit = sub.add_parser("audit", help="Run comprehensive GBP audit")
    p_audit.add_argument("--name", required=True, help="Business name")
    p_audit.add_argument("--category", required=True, help="Primary category")
    p_audit.add_argument("--city", default="Local Area", help="City / Region")
    p_audit.add_argument("--rating", default="4.5", help="Average rating")
    p_audit.add_argument("--reviews", default="10", help="Review count")
    p_audit.add_argument("--description", default="", help="Current description")
    p_audit.set_defaults(func=run_audit)

    # reply
    p_reply = sub.add_parser("reply", help="Generate AI review reply")
    p_reply.add_argument("--business", required=True, help="Business name")
    p_reply.add_argument("--reviewer", default="Customer", help="Reviewer name")
    p_reply.add_argument("--stars", type=int, default=5, help="Star rating")
    p_reply.add_argument("--text", required=True, help="Customer review text")
    p_reply.set_defaults(func=run_reply)

    # posts
    p_posts = sub.add_parser("posts", help="Generate 4-week Google post calendar")
    p_posts.add_argument("--business", required=True, help="Business name")
    p_posts.add_argument("--category", required=True, help="Primary category")
    p_posts.add_argument("--city", default="Local Area", help="Target city")
    p_posts.add_argument("--offer", default="", help="Specific promo/discount")
    p_posts.set_defaults(func=run_posts)

    # proposal
    p_prop = sub.add_parser("proposal", help="Generate client pitch/proposal")
    p_prop.add_argument("--client", required=True, help="Client business name")
    p_prop.add_argument("--category", required=True, help="Business category")
    p_prop.add_argument("--issues", required=True, help="Key issues found in audit")
    p_prop.add_argument("--price", default="500", help="Monthly retainer price")
    p_prop.set_defaults(func=run_proposal)

    # qa
    p_qa = sub.add_parser("qa", help="Pre-seed Google Q&A pairs")
    p_qa.add_argument("--business", required=True, help="Business name")
    p_qa.add_argument("--category", required=True, help="Primary category")
    p_qa.add_argument("--city", default="Local City", help="City")
    p_qa.set_defaults(func=run_qa)

    # suspension
    p_susp = sub.add_parser("suspension", help="Audit suspension & policy risk")
    p_susp.add_argument("--name", required=True, help="Business name")
    p_susp.add_argument("--category", required=True, help="Primary category")
    p_susp.add_argument("--address", default="Storefront", help="Address or SAB")
    p_susp.add_argument("--website", default="", help="Website")
    p_susp.set_defaults(func=run_suspension)

    # dispute
    p_disp = sub.add_parser("dispute", help="Generate fake review removal dispute")
    p_disp.add_argument("--business", required=True, help="Business name")
    p_disp.add_argument("--reviewer", required=True, help="Reviewer name")
    p_disp.add_argument("--text", required=True, help="Review content")
    p_disp.add_argument("--reason", default="Not a genuine customer / Fake review", help="Dispute reason")
    p_disp.set_defaults(func=run_dispute)

    # repurpose
    p_rep = sub.add_parser("repurpose", help="Repurpose reviews into social media content")
    p_rep.add_argument("--business", required=True, help="Business name")
    p_rep.add_argument("--category", required=True, help="Category")
    p_rep.add_argument("--text", required=True, help="Review or win text")
    p_rep.set_defaults(func=run_repurpose)

    # adspy
    p_ad = sub.add_parser("adspy", help="Analyze competitor ads and generate campaigns")
    p_ad.add_argument("--business", required=True, help="Business name")
    p_ad.add_argument("--category", required=True, help="Category")
    p_ad.add_argument("--city", default="Local Area", help="Target city")
    p_ad.set_defaults(func=run_adspy)

    # agency
    p_agency = sub.add_parser("agency", help="1-Person Agency: Cold email, Upwork proposals, retainers")
    p_agency.add_argument("--business", required=True, help="Business name")
    p_agency.add_argument("--category", required=True, help="Category")
    p_agency.add_argument("--city", default="Local City", help="City")
    p_agency.add_argument("--gap", default="Missing secondary categories and review momentum", help="Audit bottleneck")
    p_agency.set_defaults(func=run_agency)

    # agentos
    p_agentos = sub.add_parser("agentos", help="Autonomous Agent OS: Observe-Think-Act loop and SOPs")
    p_agentos.add_argument("--business", required=True, help="Business name")
    p_agentos.add_argument("--category", required=True, help="Category")
    p_agentos.add_argument("--signals", default="Rating: 4.8, 30 reviews, no website, last post 30 days ago", help="Signals")
    p_agentos.add_argument("--memory", default="Tone: luxury, warm. Never mention cheap rates.", help="Client memory")
    p_agentos.set_defaults(func=run_agentos)

    # fours
    p_fours = sub.add_parser("fours", help="4S Proof-of-work teardown and scaling blueprint")
    p_fours.add_argument("--business", required=True, help="Business name")
    p_fours.add_argument("--category", required=True, help="Category")
    p_fours.add_argument("--city", default="Local City", help="City")
    p_fours.set_defaults(func=run_fours)

    # orm
    p_orm = sub.add_parser("orm", help="Online Reputation Management (ORM) & Branded SERP Dominance")
    p_orm.add_argument("--business", required=True, help="Business name")
    p_orm.add_argument("--category", required=True, help="Category")
    p_orm.add_argument("--city", default="Local City", help="City")
    p_orm.add_argument("--issue", default="", help="Specific negative keyword, review crisis, or competitor issue")
    p_orm.set_defaults(func=run_orm)

    # domain-eval
    p_de = sub.add_parser("domain-eval", help="Evaluate aged domain authority and Harmonic Centrality")
    p_de.add_argument("--domain", required=True, help="Domain name")
    p_de.add_argument("--niche", required=True, help="Target niche / vertical")
    p_de.add_argument("--history", default="", help="Known history, RD count, or Wayback summary")
    p_de.set_defaults(func=run_domain_eval)

    # parasite-probe
    p_pp = sub.add_parser("parasite-probe", help="Plan rapid parasite SEO market probing campaign")
    p_pp.add_argument("--business", required=True, help="Business name")
    p_pp.add_argument("--keyword", required=True, help="Target search keyword")
    p_pp.add_argument("--niche", required=True, help="Niche / category")
    p_pp.set_defaults(func=run_parasite_probe)

    # link-intersect
    p_li = sub.add_parser("link-intersect", help="Ahrefs Link Intersect competitor backlink gap analysis")
    p_li.add_argument("--my-site", required=True, help="Your website URL or domain")
    p_li.add_argument("--competitors", required=True, help="Comma-separated competitor URLs")
    p_li.add_argument("--niche", required=True, help="Business niche")
    p_li.add_argument("--city", default="Local City", help="City / Region")
    p_li.set_defaults(func=run_link_intersect)

    # keyword-explorer
    p_ke = sub.add_parser("keyword-explorer", help="Ahrefs Keyword Explorer intent clustering & KD estimator")
    p_ke.add_argument("--keyword", required=True, help="Seed keyword")
    p_ke.add_argument("--niche", required=True, help="Niche / Category")
    p_ke.set_defaults(func=run_keyword_explorer)

    # site-audit
    p_sa = sub.add_parser("site-audit", help="Ahrefs Technical Site Audit and On-Page Health Check")
    p_sa.add_argument("--url", required=True, help="Website URL")
    p_sa.add_argument("--niche", required=True, help="Niche / Business category")
    p_sa.set_defaults(func=run_site_audit)

    # ecom-architecture
    p_ea = sub.add_parser("ecom-architecture", help="Ghulam Ali eCommerce 3-click silo & faceted navigation architecture")
    p_ea.add_argument("--store", required=True, help="Store or Brand name")
    p_ea.add_argument("--categories", required=True, help="Comma-separated categories or packages")
    p_ea.set_defaults(func=run_ecom_architecture)

    # product-schema
    p_ps = sub.add_parser("product-schema", help="Generate Product, Offer, and AggregateRating JSON-LD schema")
    p_ps.add_argument("--name", required=True, help="Product or Package name")
    p_ps.add_argument("--price", required=True, help="Price amount")
    p_ps.add_argument("--currency", default="INR", help="Currency code (e.g. INR, USD)")
    p_ps.add_argument("--rating", default="4.9", help="Star rating")
    p_ps.add_argument("--reviews", default="25", help="Review count")
    p_ps.add_argument("--brand", default="Apex Media", help="Brand name")
    p_ps.set_defaults(func=run_product_schema)

    # category-content
    p_cc = sub.add_parser("category-content", help="Generate eCommerce category page content (Above & Below the grid)")
    p_cc.add_argument("--category", required=True, help="Category name")
    p_cc.add_argument("--niche", required=True, help="Niche / Business type")
    p_cc.add_argument("--city", default="Local Area", help="Target city")
    p_cc.set_defaults(func=run_category_content)

    # nap-audit
    p_na = sub.add_parser("nap-audit", help="Ghulam Ali NAP & citation consistency audit")
    p_na.add_argument("--business", required=True, help="Business name")
    p_na.add_argument("--address", required=True, help="Full street address")
    p_na.add_argument("--phone", required=True, help="Phone number")
    p_na.add_argument("--website", required=True, help="Website URL")
    p_na.add_argument("--city", default="Local Metro Area", help="City / Service area")
    p_na.set_defaults(func=run_nap_audit)

    # geo-silo
    p_gs = sub.add_parser("geo-silo", help="Hyper-local neighborhood geo-silo landing page blueprint")
    p_gs.add_argument("--business", required=True, help="Business name")
    p_gs.add_argument("--service", required=True, help="Primary service")
    p_gs.add_argument("--neighborhood", required=True, help="Target neighborhood / sub-locality")
    p_gs.add_argument("--city", default="Metro City", help="City")
    p_gs.add_argument("--landmarks", default="", help="Nearby landmarks, roads, or stations")
    p_gs.set_defaults(func=run_geo_silo)

    # local-citation-matrix
    p_lcm = sub.add_parser("local-citation-matrix", help="High-impact Tier-1, Tier-2, and niche citation matrix")
    p_lcm.add_argument("--business", required=True, help="Business name")
    p_lcm.add_argument("--category", required=True, help="Business vertical / category")
    p_lcm.add_argument("--city", default="Local City", help="City")
    p_lcm.add_argument("--country", default="India", help="Country (India, USA, UK, etc.)")
    p_lcm.set_defaults(func=run_local_citation_matrix)

    # local-schema
    p_ls = sub.add_parser("local-schema", help="Master Schema.org LocalBusiness JSON-LD generator")
    p_ls.add_argument("--business", required=True, help="Business name")
    p_ls.add_argument("--category", default="LocalBusiness", help="Schema subtype (e.g. PhotographyStudio, Dentist)")
    p_ls.add_argument("--address", required=True, help="Street address")
    p_ls.add_argument("--city", required=True, help="City")
    p_ls.add_argument("--state", default="Delhi", help="State / Region")
    p_ls.add_argument("--zip", required=True, help="Postal Code")
    p_ls.add_argument("--country", default="IN", help="Country code (e.g. IN, US, GB)")
    p_ls.add_argument("--phone", required=True, help="Phone number")
    p_ls.add_argument("--website", required=True, help="Website URL")
    p_ls.add_argument("--lat", default="28.6139", help="Latitude")
    p_ls.add_argument("--lng", default="77.2090", help="Longitude")
    p_ls.set_defaults(func=run_local_schema)

    args = parser.parse_args()
    args.func(args)

if __name__ == "__main__":
    main()

