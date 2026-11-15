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

    args = parser.parse_args()
    args.func(args)

if __name__ == "__main__":
    main()

