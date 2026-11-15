---
name: gmb-review-automation
description: "Generate intelligent, context-aware Google review replies with local keyword injection and de-escalation protocols. Automates customer sentiment management."
---

# Google Business Profile Review Automation

Turn customer reviews into ranking signals and loyal client touchpoints.

## What this skill does:
1. **5-Star Positive Replies**: Generates warm, sincere appreciation while subtly weaving in target service keywords and business name (Google indexes keywords in review responses for local rankings).
2. **3-4 Star Neutral Replies**: Acknowledges positive elements, directly addresses specific friction points, and demonstrates proactive owner oversight.
3. **1-2 Star Critical Reviews**: De-escalates conflict with empathy, avoids admitting legal fault, ensures privacy (HIPAA/legal safety), and redirects customer to an offline direct channel (email/phone).

## How to run:

```bash
python3 /Users/lucifer/.gemini/antigravity/scratch/ApexGMB/skills/scripts/gmb_ai_runner.py reply \
  --business "Apex Media Studio" \
  --reviewer "Rahul Verma" \
  --stars 5 \
  --text "Amazing wedding photoshoot and album quality! The entire family loved the candid video."
```

## Review Rules:
- Never paste boilerplate one-line replies.
- Never argue with unhappy reviewers publicly.
- Always include an invite for repeat visits or referrals.

