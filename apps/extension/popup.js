// ApexGMB Extension - Popup Controller with AI Skills

const DEFAULT_KEY = "";

// ApexGMB Extension - Universal AI Controller (Claude & Gemini 3.8 with Auto-Fallback)

const FALLBACK_CONFIG_KEY = (typeof window !== "undefined" && window.APEXGMB_CONFIG?.OPENROUTER_KEY) || "";
const DEFAULT_MODEL = (typeof window !== "undefined" && window.APEXGMB_CONFIG?.AI_MODEL) || "anthropic/claude-sonnet-4.6";

async function fetchFromOpenRouter(key, model, prompt, system, maxTokens = 500) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/G0than/ApexGMB",
      "X-Title": "ApexGMB Extension",
    },
    body: JSON.stringify({
      model: model,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });

  const json = await res.json();
  if (json.error) {
    throw new Error(json.error.message || `OpenRouter error (${model})`);
  }
  return json.choices?.[0]?.message?.content || "";
}

async function callOpenRouter(prompt, system = "You are an elite Google Business Profile Local SEO expert.") {
  let key = FALLBACK_CONFIG_KEY;
  let model = DEFAULT_MODEL;

  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
    const data = await chrome.storage.sync.get(["openrouterKey", "aiModel"]);
    if (data.openrouterKey) key = data.openrouterKey;
    if (data.aiModel) model = data.aiModel;
  } else {
    key = localStorage.getItem("openrouterKey") || FALLBACK_CONFIG_KEY;
    model = localStorage.getItem("aiModel") || DEFAULT_MODEL;
  }

  if (!key) {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    document.querySelector('[data-tab="settings"]')?.classList.add("active");
    document.getElementById("tab-settings")?.classList.add("active");
    const keyInput = document.getElementById("openrouter-key");
    if (keyInput) {
      keyInput.focus();
      keyInput.style.border = "2px solid #f96535";
    }
    const msg = document.getElementById("settings-msg");
    if (msg) {
      msg.innerHTML = '<span style="color:#ef4444;font-weight:600;">⚠️ Paste your OpenRouter API key below.</span>';
    }
    throw new Error("Missing API Key. Switched to Settings tab.");
  }

  // 1. Direct Google Gemini API Key support (starts with AIzaSy)
  if (key.startsWith("AIzaSy")) {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${system}\n\n${prompt}` }] }],
        generationConfig: { maxOutputTokens: 600 }
      })
    });
    const json = await res.json();
    return json.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini API.";
  }

  // 2. GitHub Models API support (starts with ghp_ or github_pat_)
  if (key.startsWith("ghp_") || key.startsWith("github_pat_")) {
    const res = await fetch("https://models.inference.ai.azure.com/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 600,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt }
        ]
      })
    });
    const json = await res.json();
    return json.choices?.[0]?.message?.content || "No response from GitHub Models.";
  }

  // 3. OpenRouter API with Dual Claude / Gemini 3.8 Auto-Fallback
  const primaryModel = model || "anthropic/claude-sonnet-4.6";
  const fallbackModel = primaryModel.includes("claude") ? "google/gemini-3.8-flash" : "anthropic/claude-haiku-5.5";

  try {
    const content = await fetchFromOpenRouter(key, primaryModel, prompt, system, 500);
    if (content) return content;
  } catch (primaryErr) {
    console.warn(`Primary model (${primaryModel}) failed: ${primaryErr.message}. Attempting fallback to ${fallbackModel}...`);
    try {
      const fallbackContent = await fetchFromOpenRouter(key, fallbackModel, prompt, system, 500);
      if (fallbackContent) {
        return fallbackContent + `\n\n*(Generated via fallback engine: ${fallbackModel})*`;
      }
    } catch (fallbackErr) {
      throw new Error(`AI request failed on both ${primaryModel} and ${fallbackModel}: ${primaryErr.message}`);
    }
  }

  return "No response received from AI service.";
}

document.addEventListener("DOMContentLoaded", () => {
  // Tab Switching
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      const tabId = "tab-" + btn.dataset.tab;
      document.getElementById(tabId)?.classList.add("active");
    });
  });

  // Model Selector Custom Input Toggle
  const modelSelect = document.getElementById("ai-model");
  const modelCustom = document.getElementById("ai-model-custom");
  modelSelect?.addEventListener("change", () => {
    if (modelSelect.value === "custom") {
      modelCustom.style.display = "block";
      modelCustom.focus();
    } else {
      modelCustom.style.display = "none";
    }
  });

  function setModelDropdownValue(targetModel) {
    if (!modelSelect) return;
    const knownValues = ["anthropic/claude-sonnet-4.6", "anthropic/claude-haiku-5.5", "google/gemini-3.8-flash"];
    if (knownValues.includes(targetModel)) {
      modelSelect.value = targetModel;
      if (modelCustom) modelCustom.style.display = "none";
    } else if (targetModel) {
      modelSelect.value = "custom";
      if (modelCustom) {
        modelCustom.style.display = "block";
        modelCustom.value = targetModel;
      }
    }
  }

  // Settings Load
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(["syncUrl", "syncToken", "openrouterKey", "aiModel"], (data) => {
      if (data.syncUrl) document.getElementById("server-url").value = data.syncUrl;
      if (data.syncToken) document.getElementById("api-token").value = data.syncToken;
      const effectiveKey = data.openrouterKey || FALLBACK_CONFIG_KEY;
      const effectiveModel = data.aiModel || DEFAULT_MODEL;
      document.getElementById("openrouter-key").value = effectiveKey;
      setModelDropdownValue(effectiveModel);
      if (!data.openrouterKey && effectiveKey) {
        chrome.storage.sync.set({ openrouterKey: effectiveKey, aiModel: effectiveModel });
      }
    });
  } else {
    document.getElementById("server-url").value = localStorage.getItem("syncUrl") || "http://localhost:8080";
    document.getElementById("api-token").value = localStorage.getItem("syncToken") || "";
    document.getElementById("openrouter-key").value = localStorage.getItem("openrouterKey") || FALLBACK_CONFIG_KEY;
    const effectiveModel = localStorage.getItem("aiModel") || DEFAULT_MODEL;
    setModelDropdownValue(effectiveModel);
  }

  // Save Settings
  document.getElementById("save-settings-btn")?.addEventListener("click", () => {
    const url = document.getElementById("server-url").value.trim();
    const token = document.getElementById("api-token").value.trim();
    const openrouterKey = document.getElementById("openrouter-key").value.trim();
    let aiModel = modelSelect?.value || DEFAULT_MODEL;
    if (aiModel === "custom" && modelCustom?.value.trim()) {
      aiModel = modelCustom.value.trim();
    }
    const msg = document.getElementById("settings-msg");

    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ syncUrl: url, syncToken: token, openrouterKey, aiModel }, () => {
        msg.innerText = "Configuration saved successfully!";
        msg.style.color = "#137333";
        setTimeout(() => (msg.innerText = ""), 2500);
      });
    } else {
      localStorage.setItem("syncUrl", url);
      localStorage.setItem("syncToken", token);
      localStorage.setItem("openrouterKey", openrouterKey);
      localStorage.setItem("aiModel", aiModel);
      msg.innerText = "Configuration saved successfully!";
      msg.style.color = "#137333";
      setTimeout(() => (msg.innerText = ""), 2500);
    }
  });

  // Test Server Connection
  document.getElementById("test-conn-btn")?.addEventListener("click", async () => {
    const url = document.getElementById("server-url").value.trim() || "http://localhost:8080";
    const token = document.getElementById("api-token").value.trim();
    const msg = document.getElementById("settings-msg");
    msg.innerText = "Pinging sync server...";
    try {
      const res = await fetch(`${url}/api/v1/healthcheck`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      msg.innerText = res.ok ? "Connected to Sync Server!" : `Server returned status ${res.status}`;
      msg.style.color = res.ok ? "#137333" : "#b06000";
    } catch {
      msg.innerText = "Server not reachable.";
      msg.style.color = "#d93025";
    }
  });

  // 1. Run 100-Point Audit
  document.getElementById("btn-run-audit")?.addEventListener("click", async () => {
    const biz = document.getElementById("audit-biz").value.trim() || "Apex Media Studio";
    const cat = document.getElementById("audit-cat").value.trim() || "Photography Studio";
    const city = document.getElementById("audit-city").value.trim() || "Local Area";
    const resBox = document.getElementById("audit-results");

    resBox.style.display = "block";
    resBox.innerText = `Analyzing ${biz} with Gemini 2.5 Flash...`;

    const prompt = `Run a comprehensive 100-Point Local SEO & Google Business Profile audit for:
Business: ${biz}
Category: ${cat}
City: ${city}

Output:
1. Health Score (0-100)
2. 4 Missing High-Impact Secondary Categories
3. High-Intent Keywords for Description & Services
4. Optimized 750-Character Description
5. 3 Action Steps to Rank in Local 3-Pack`;

    try {
      const result = await callOpenRouter(prompt);
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  // 2. Generate Client Pitch ($750/mo retainer)
  document.getElementById("btn-gen-pitch")?.addEventListener("click", async () => {
    const biz = document.getElementById("audit-biz").value.trim() || "Local Business Client";
    const cat = document.getElementById("audit-cat").value.trim() || "Photography Studio";
    const city = document.getElementById("audit-city").value.trim() || "Local Market";
    const resBox = document.getElementById("audit-results");

    resBox.style.display = "block";
    resBox.innerText = `Drafting $750/mo Retainer Pitch Proposal for ${biz}...`;

    const prompt = `Write a high-converting Local SEO agency client proposal for:
Client: ${biz} (${cat} in ${city})
Retainer: $750/month

Include:
- Executive Summary (Lost calls & directions to competitors)
- 30-Day Quick Win Sprint (Categories, Review QR system, Weekly Posts)
- Expected Deliverables & Measurable ROI
- Closing Call to Action`;

    try {
      const result = await callOpenRouter(prompt);
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  // 3. Generate Review Replies
  document.getElementById("btn-gen-reply")?.addEventListener("click", async () => {
    const biz = document.getElementById("reply-biz").value.trim() || "Apex Media Studio";
    const stars = document.getElementById("reply-stars").value;
    const text = document.getElementById("reply-text").value.trim();
    const resBox = document.getElementById("reply-results");

    if (!text) {
      resBox.style.display = "block";
      resBox.innerText = "Please paste a customer review first.";
      return;
    }

    resBox.style.display = "block";
    resBox.innerText = "Drafting 3 calibrated replies...";

    const prompt = `Generate 3 distinct, professional Google Review replies for:
Business: ${biz}
Rating: ${stars} Stars
Review: "${text}"

Provide:
1. Friendly & Warm (Appreciation + keyword injection)
2. Concise & Professional
3. Engagement & Next Visit / De-escalation (if low rating)`;

    try {
      const result = await callOpenRouter(prompt);
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  // 4. Generate 4-Week Post Calendar
  document.getElementById("btn-gen-posts")?.addEventListener("click", async () => {
    const biz = document.getElementById("posts-biz").value.trim() || "Apex Media Studio";
    const promo = document.getElementById("posts-promo").value.trim() || "Seasonal Service Discount";
    const resBox = document.getElementById("posts-results");

    resBox.style.display = "block";
    resBox.innerText = `Generating 4-Week Post Calendar for ${biz}...`;

    const prompt = `Create a 4-Week Google Posts content calendar for:
Business: ${biz}
Special Focus: ${promo}

For each week (Week 1 to Week 4), provide:
- Post Type (What's New, Offer, or Event)
- Hook / Headline
- Body Copy (100-120 words with local keywords)
- Recommended CTA Button (Call Now, Book, Learn More)
- Suggested Photo / Graphic`;

    try {
      const result = await callOpenRouter(prompt);
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  // 5. Pre-Seed Google Q&A Pairs (Course Strategy)
  document.getElementById("btn-gen-qa")?.addEventListener("click", async () => {
    const biz = document.getElementById("qa-biz").value.trim() || "Apex Media Studio";
    const cat = document.getElementById("qa-cat").value.trim() || "Photography Studio";
    const city = document.getElementById("qa-city").value.trim() || "Local City";
    const resBox = document.getElementById("qa-results");

    resBox.style.display = "block";
    resBox.innerText = `Pre-seeding 5 high-ranking Q&A pairs for ${biz}...`;

    const prompt = `Generate 5 high-converting, SEO-optimized Google Q&A pairs for:
Business: ${biz}
Category: ${cat}
City: ${city}

Cover:
1. Pricing / Packages & Turnaround time
2. Booking process & Consultations
3. Service area & On-location availability
4. Customization & Deliverables format
5. Payment methods & Rush requests

Make sure keywords appear in BOTH the question and the owner answer for conversational search.`;

    try {
      const result = await callOpenRouter(prompt);
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  // 6. Suspension Risk Audit
  document.getElementById("btn-audit-suspension")?.addEventListener("click", async () => {
    const biz = document.getElementById("policy-biz").value.trim() || "Apex Media Studio";
    const resBox = document.getElementById("policy-results");

    resBox.style.display = "block";
    resBox.innerText = `Auditing suspension risks for "${biz}"...`;

    const prompt = `Perform a Google Business Profile Policy & Suspension Risk Audit for:
Listing Title: "${biz}"

Analyze:
1. Name Keyword Stuffing Risk (Is non-legal text/location/phone added?)
2. Storefront vs SAB risk triggers
3. Video re-verification likelihood
4. Suspension Prevention Checklist
5. Final Risk Score: LOW, MEDIUM, or HIGH risk`;

    try {
      const result = await callOpenRouter(prompt);
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  // Repurpose to Social Media (Multi-Platform Content Engine)
  document.getElementById("btn-repurpose-social")?.addEventListener("click", async () => {
    const biz = document.getElementById("social-biz").value.trim() || "Apex Media Studio";
    const win = document.getElementById("social-win").value.trim() || "Best photo studio in town! Delivered beautiful wedding photos and frames.";
    const resBox = document.getElementById("social-results");

    resBox.style.display = "block";
    resBox.innerText = `Repurposing review into viral social media assets for ${biz}...`;

    const prompt = `Turn this 5-star Google review into a multi-platform social media campaign:
Business: ${biz}
Review / Win: "${win}"

Output:
1. 30-Second Instagram Reel / TikTok Script (Visual Hook in first 3s, Voiceover story, Call-To-Action)
2. Facebook / Instagram Carousel Caption (Emotional hook, quote snippet, hashtags)
3. LinkedIn B2B / Founder Story Angle
4. Promotional Offer Hook to pair with this post`;

    try {
      const result = await callOpenRouter(prompt);
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  // Competitor Ad Library Teardown
  document.getElementById("btn-spy-ads")?.addEventListener("click", async () => {
    const biz = document.getElementById("social-biz").value.trim() || "Apex Media Studio";
    const resBox = document.getElementById("social-results");

    resBox.style.display = "block";
    resBox.innerText = `Analyzing competitor ad strategies for ${biz}...`;

    const prompt = `Perform a Meta Ad Library & Competitor Social Ad Teardown for:
Business / Niche: ${biz}

Provide:
1. 3 Winning Ad Angles (Problem/Agitation, Social Proof/Case Study, and Irresistible Hook)
2. Creative Visual Direction (UGC, BTS, Before/After)
3. Ad Copy & Headline examples
4. Local Audience Retargeting Strategy`;

    try {
      const result = await callOpenRouter(prompt);
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  // 7. Fake Review Removal Dispute Ticket
  document.getElementById("btn-gen-dispute")?.addEventListener("click", async () => {
    const biz = document.getElementById("policy-biz").value.trim() || "Apex Media Studio";
    const rev = document.getElementById("policy-review").value.trim() || "Terrible service, completely fake and rude staff!";
    const resBox = document.getElementById("policy-results");

    resBox.style.display = "block";
    resBox.innerText = "Drafting formal policy dispute ticket for Google Support...";

    const prompt = `Write a formal, policy-backed Google Review Dispute Ticket for Google Business Profile Support:
Business Name: ${biz}
Flagged Review: "${rev}"

Grounds:
- Violates Google's Prohibited and Restricted Content Policy (Misinformation / Conflict of Interest / Fake engagement).
- Professional tone requesting removal from local map listing.`;

    try {
      const result = await callOpenRouter(prompt);
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  // 5. Teleport Launch
  document.getElementById("teleport-btn")?.addEventListener("click", () => {
    const q = document.getElementById("teleport-query").value.trim() || "photo studio";
    const l = document.getElementById("teleport-location").value.trim() || "28.6139, 77.2090";

    let url = `https://www.google.com/maps/search/${encodeURIComponent(q + " in " + l)}`;
    if (l.includes(",")) {
      const [lat, lng] = l.split(",").map((s) => s.trim());
      url = `https://www.google.com/maps/search/${encodeURIComponent(q)}/@${lat},${lng},15z`;
    }

    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, "_blank");
    }
  });

  // 8. 1-Person Agency & Client Acquisition Handlers
  document.getElementById("btn-agency-coldemail")?.addEventListener("click", async () => {
    const biz = document.getElementById("agency-biz").value.trim() || "Apex Media Studio";
    const cat = document.getElementById("agency-cat").value.trim() || "Photography Studio";
    const loc = document.getElementById("agency-loc").value.trim() || "Delhi";
    const gap = document.getElementById("agency-gap").value.trim() || "Missing secondary categories & 15 reviews vs competitor's 180";
    const resBox = document.getElementById("agency-results");

    resBox.style.display = "block";
    resBox.innerText = "Drafting personalized Audit Cold Email...";

    const prompt = `You are an elite AI outbound cold email copywriter for local SEO.
Target Business: ${biz}
Category: ${cat} in ${loc}
Observed Bottleneck: ${gap}

Write:
1. High-Converting Cold Email (under 100 words):
   - Subject Line: 2 casual, hyper-targeted variations
   - Observation Hook: Acknowledge their business and call out their exact ranking bottleneck (${gap})
   - Frictionless Offer: Free 2-minute video teardown showing exact steps to rank in Top 3 Map Pack
   - Clean signature
2. Day 3 Follow-Up: 2-sentence polite bump mentioning a high-intent local search query.`;

    try {
      const result = await callOpenRouter(prompt, "You are an elite 1-person agency cold outreach copywriter.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  document.getElementById("btn-agency-upwork")?.addEventListener("click", async () => {
    const biz = document.getElementById("agency-biz").value.trim() || "Apex Media Studio";
    const cat = document.getElementById("agency-cat").value.trim() || "Photography Studio";
    const gap = document.getElementById("agency-gap").value.trim() || "Competitors dominating the Map Pack";
    const resBox = document.getElementById("agency-results");

    resBox.style.display = "block";
    resBox.innerText = "Writing winning Upwork proposal...";

    const prompt = `Write a winning Upwork proposal for a local SEO / Google Maps optimization contract for a client in the ${cat} niche (${biz}):
1. Opening Hook: Reference their ranking struggle (${gap}) directly in the first line.
2. Proof of Work: Explain taking a similar client from #8 to #2 in 21 days with category alignment & review velocity.
3. 3-Milestone Execution: Audit & Category fix (Day 1-3), Review Loop & Q&A (Day 4-7), Geo-Grid signals (Day 8-14).
4. Low friction CTA. Under 180 words.`;

    try {
      const result = await callOpenRouter(prompt, "You are an elite Upwork proposal specialist.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  document.getElementById("btn-agency-pricing")?.addEventListener("click", async () => {
    const biz = document.getElementById("agency-biz").value.trim() || "Apex Media Studio";
    const cat = document.getElementById("agency-cat").value.trim() || "Photography Studio";
    const resBox = document.getElementById("agency-results");

    resBox.style.display = "block";
    resBox.innerText = "Calculating 3-tier retainer packages...";

    const prompt = `Create a 3-tier monthly retainer package for ${biz} in the ${cat} niche:
Tier 1: Foundation ($500/month) - Review responses, 2 weekly posts, listing hygiene.
Tier 2: Growth ($1,500/month) - Geo-grid competitor audit, citation cleanup, pre-seeded Q&A, social repurposing to Reels/TikTok.
Tier 3: Domination ($3,000/month) - Full local pack domination, dedicated AI review engine, on-page schema sync, weekly calls.
Detail exact deliverables and expected business ROI for each.`;

    try {
      const result = await callOpenRouter(prompt, "You are an agency pricing and packaging architect.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  document.getElementById("btn-agency-closer")?.addEventListener("click", async () => {
    const biz = document.getElementById("agency-biz").value.trim() || "Apex Media Studio";
    const cat = document.getElementById("agency-cat").value.trim() || "Photography Studio";
    const resBox = document.getElementById("agency-results");

    resBox.style.display = "block";
    resBox.innerText = "Generating discovery call closing scripts...";

    const prompt = `Provide the exact word-for-word scripts to close the owner of ${biz} (${cat}) on a discovery call:
1. Handling 'It's too expensive': Compare retainer cost vs Google Local Services Ads cost-per-click.
2. Handling 'We already have someone doing our SEO/Website': Expose the difference between web design and local map pack category algorithms.
3. Handling 'How fast will we see results?': Explain category updates (7-14 days) vs review compounding (30-60 days).`;

    try {
      const result = await callOpenRouter(prompt, "You are a master B2B sales closer.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  // 9. Autonomous AI Agent OS Handlers
  const DEFAULT_MEMORY = "Never mention passport photos or cheap rates. Brand tone: luxury, warm, emotional, authoritative. Priority keywords: best wedding photographer in Delhi NCR, pre-wedding shoot Delhi, candid cinematic wedding film.";

  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(["globalAgentMemory"], (res) => {
      const memInput = document.getElementById("agentos-memory-text");
      if (memInput) memInput.value = res.globalAgentMemory || DEFAULT_MEMORY;
    });
  } else {
    const memInput = document.getElementById("agentos-memory-text");
    if (memInput && !memInput.value) memInput.value = localStorage.getItem("globalAgentMemory") || DEFAULT_MEMORY;
  }

  document.getElementById("btn-agentos-save-mem")?.addEventListener("click", () => {
    const val = document.getElementById("agentos-memory-text")?.value.trim() || "";
    const status = document.getElementById("agentos-mem-status");
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ globalAgentMemory: val }, () => {
        if (status) {
          status.innerText = "✓ Rules committed to Agent Memory!";
          status.style.display = "block";
          setTimeout(() => (status.style.display = "none"), 2500);
        }
      });
    } else {
      localStorage.setItem("globalAgentMemory", val);
      if (status) {
        status.innerText = "✓ Rules saved to localStorage!";
        status.style.display = "block";
        setTimeout(() => (status.style.display = "none"), 2500);
      }
    }
  });

  document.getElementById("btn-agentos-run")?.addEventListener("click", async () => {
    const biz = document.getElementById("agentos-biz").value.trim() || "Apex Media Studio";
    const data = document.getElementById("agentos-data").value.trim() || "Rating: 4.8, 42 reviews, missing website, last post 45 days ago";
    const mem = document.getElementById("agentos-memory-text")?.value.trim() || "";
    const resBox = document.getElementById("agentos-results");

    resBox.style.display = "block";
    resBox.innerText = "Executing autonomous Observe-Think-Act loop...";

    const prompt = `You are an autonomous AI Agent OS executing the Observe-Think-Act loop for Google Business Profiles.
Business Name: ${biz}
Raw Signals: ${data}
${mem ? `Persistent Memory & SOP Rules: ${mem}` : ""}

Perform the loop:
1. [OBSERVE]: Scan listing completeness, review recency, category signal strength.
2. [THINK]: Pinpoint the #1 algorithmic bottleneck holding them back from #1 on Google Maps.
3. [ACT - EXECUTABLE SOPs]:
   - SOP 1: Immediate Listing Fix
   - SOP 2: Geo-Optimized 5-Star Review Reply template (with local keywords)
   - SOP 3: Google Post Update (catchy headline, value snippet, call to action)`;

    try {
      const result = await callOpenRouter(prompt, "You are an autonomous AI Agent OS executing local business SOPs.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  // 10. 4S Proof of Work & Showcase Handlers
  document.getElementById("btn-fours-teardown")?.addEventListener("click", async () => {
    const biz = document.getElementById("fours-biz").value.trim() || "Apex Media Studio";
    const niche = document.getElementById("fours-niche").value.trim() || "Wedding & Commercial Photography";
    const city = document.getElementById("fours-city").value.trim() || "Delhi";
    const resBox = document.getElementById("fours-results");

    resBox.style.display = "block";
    resBox.innerText = "Constructing Proof-of-Work Teardown Case Study...";

    const prompt = `You are applying the 'Showcase Proof-of-Work' framework.
Create a high-impact, professional Client Teardown Case Study for:
Business: ${biz}
Niche: ${niche}
Market: ${city}

Structure the case study:
1. Executive Summary: Current local Google Maps visibility vs market potential.
2. The 3 Costly Bottlenecks: Unoptimized category signals, dormant review keywords, and competitor geo-dominance.
3. The Transformation Roadmap (Step-by-Step implementation).
4. Estimated Financial ROI: What moving into the Top 3 Map Pack delivers in monthly customer inquiries and revenue ($15k-$30k value).
This document serves as undeniable proof of competence to win high-ticket clients.`;

    try {
      const result = await callOpenRouter(prompt, "You are a growth engineer creating proof-of-work case studies.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  document.getElementById("btn-fours-blueprint")?.addEventListener("click", async () => {
    const niche = document.getElementById("fours-niche").value.trim() || "Wedding & Commercial Photography";
    const resBox = document.getElementById("fours-results");

    resBox.style.display = "block";
    resBox.innerText = "Generating 4S $10k/Month Scaling Blueprint...";

    const prompt = `Outline the 4S scaling blueprint to turn local SEO & AI audit capabilities (${niche} niche) into a $10,000/month recurring income model:
1. S - Select: Why local high-ticket service niches (studios, medical, legal) pay premium retainers.
2. S - Skill: High-leverage automated tooling vs manual manual agency work.
3. S - Showcase: Using public teardowns and live case studies to attract inbound clients without cold spam.
4. S - Scale: Managing 7-10 clients on $1k-$1.5k monthly retainers using automated extensions and AI agent SOPs.`;

    try {
      const result = await callOpenRouter(prompt, "You are an expert career and monetization mentor.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  // ORM & Brand Defense Listeners
  document.getElementById("btn-orm-serp")?.addEventListener("click", async () => {
    const biz = document.getElementById("orm-biz").value.trim() || "Apex Media Studio";
    const city = document.getElementById("orm-city").value.trim() || "Local Area";
    const issue = document.getElementById("orm-issue").value.trim();
    const resBox = document.getElementById("orm-results");

    resBox.style.display = "block";
    resBox.innerText = "Formulating 10-Asset Branded SERP Blanket Defense...";

    const prompt = `As an elite Online Reputation Management (ORM) & SEO strategist, design an aggressive Page 1 Google Branded Defense for:
Brand: ${biz}
Target Location: ${city}
Context / Risk: ${issue || "Proactive brand equity defense"}

Generate:
1. The 10-Position SERP Blanket: Map out exact web properties (Website, GBP, LinkedIn, YouTube, Crunchbase, Trustpilot, Substack, Medium) to dominate slots 1 through 10 on Google for "${biz} reviews/complaints".
2. Negative Link Suppression Strategy: How to push unfavorable links to Page 2 where searchers never look.
3. Entity Knowledge Graph Shielding: JSON-LD schema 'sameAs' linking to anchor brand legitimacy.`;

    try {
      const result = await callOpenRouter(prompt, "You are a master of Online Reputation Management (ORM) and Branded SEO.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  document.getElementById("btn-orm-gating")?.addEventListener("click", async () => {
    const biz = document.getElementById("orm-biz").value.trim() || "Apex Media Studio";
    const city = document.getElementById("orm-city").value.trim() || "Local Area";
    const resBox = document.getElementById("orm-results");

    resBox.style.display = "block";
    resBox.innerText = "Engineering GoHighLevel-Style Review Gating Architecture...";

    const prompt = `Create an automated Review Gating & Review Request Funnel for ${biz} in ${city}:
1. The 2-Touch SMS & Email Workflow (1 hour post-service, 24 hours follow-up) with high-converting short copy.
2. The Gating Logic:
   - 4-5 Stars Path: Seamless 1-tap redirect to Google Business Profile review screen.
   - 1-3 Stars Path: Intercepted to a private internal manager feedback form (stopping public damage).
3. In-Store NFC / Dynamic QR Code review acceleration script.`;

    try {
      const result = await callOpenRouter(prompt, "You are an expert in customer feedback automation and reputation systems.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  document.getElementById("btn-orm-crisis")?.addEventListener("click", async () => {
    const biz = document.getElementById("orm-biz").value.trim() || "Apex Media Studio";
    const issue = document.getElementById("orm-issue").value.trim() || "Customer complaint about service quality and communication delay";
    const resBox = document.getElementById("orm-results");

    resBox.style.display = "block";
    resBox.innerText = "Drafting Crisis De-escalation & Neutralization Response...";

    const prompt = `You are a crisis PR and SEO reputation counselor.
Brand: ${biz}
Customer Issue / Review: "${issue}"

Draft:
1. Public Review Response (using the A.A.A. Protocol: Acknowledge, Apologize without admitting liability, Action offline with direct executive contact).
2. Internal SOP to resolve the root grievance within 24 hours.
3. Official Press / Social Clarification statement if the issue has potential for viral backlash.`;

    try {
      const result = await callOpenRouter(prompt, "You are a crisis communication and reputation management expert.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  document.getElementById("btn-orm-domain")?.addEventListener("click", async () => {
    const biz = document.getElementById("orm-biz").value.trim() || "Apex Media Studio";
    const niche = document.getElementById("orm-city").value.trim() || "Local Business";
    const resBox = document.getElementById("orm-results");

    resBox.style.display = "block";
    resBox.innerText = "Analyzing Aged Domain Authority & Harmonic Centrality (Kalin Karakehayov Framework)...";

    const prompt = `As an elite link graph & aged domain architect (Kalin Karakehayov 200k domain framework):
Analyze an aged domain acquisition and authority strategy for ${biz} (${niche}):
1. Harmonic Centrality vs PageRank: How aged link proximity pushes the brand into Common Crawl and AI search model training.
2. The 5-Point Safety Filter: Wayback checks, anchor text naturalness, toxic redirects, topical congruence.
3. Zero-Traffic Link Value Math: Why aged domain equity passes massive rank power even with zero current traffic.
4. Footprint Neutralization Protocol: Class-C IP distribution, registrar rotation, and natural outbound profile.`;

    try {
      const result = await callOpenRouter(prompt, "You are a master of aged domains and link architecture.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  document.getElementById("btn-orm-parasite")?.addEventListener("click", async () => {
    const biz = document.getElementById("orm-biz").value.trim() || "Apex Media Studio";
    const niche = document.getElementById("orm-city").value.trim() || "Local Business";
    const resBox = document.getElementById("orm-results");

    resBox.style.display = "block";
    resBox.innerText = "Formulating 48-Hour Parasite SEO Probing Plan (Charles Floate Playbook)...";

    const prompt = `You are a digital territory growth engineer (Charles Floate & David Quaid playbook).
Business: ${biz}
Vertical: ${niche}

Generate a Parasite SEO Market Probing Action Plan:
1. Top 3 Parasite Platforms for fast ranking (LinkedIn Pulse, Medium, Substack, Reddit, Quora).
2. The 48-Hour Ranking Content Outline: Hook, search intent fulfillment, schema/formatting, internal link anchors.
3. Siphoning Traffic: How to funnel parasite readers into the Google Business Profile and booking form.
4. When to transition from Parasite ranking to acquiring an Exact-Match or Aged Domain.`;

    try {
      const result = await callOpenRouter(prompt, "You are an elite parasite SEO and territory growth engineer.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  // Ahrefs Free Suite (6 Core Platforms)
  document.getElementById("btn-ahrefs-site-explorer")?.addEventListener("click", async () => {
    const site = document.getElementById("ahrefs-site").value.trim() || "bhardwajstudio.in";
    const comps = document.getElementById("ahrefs-comps").value.trim() || "competitor.com";
    const resBox = document.getElementById("ahrefs-results");

    resBox.style.display = "block";
    resBox.innerText = `Running Free Ahrefs Site Explorer for ${site}...`;

    const prompt = `You are the Free Ahrefs Site Explorer Engine for ApexGMB.
Analyze Target Domain: ${site}
Competitor Domains: ${comps}

Deliver a full Site Explorer Decomposition:
1. Authority & Link Metrics:
   - Estimated Domain Rating (DR 0-100) & URL Rating (UR 0-100)
   - Estimated Total Backlinks & Referring Domains (RD count)
   - DoFollow vs NoFollow link equity distribution
2. Organic Search Traffic & Value:
   - Estimated monthly organic traffic and equivalent search traffic value ($ USD)
   - Top 5 organic search keywords driving traffic (with estimated ranking positions)
3. Anchor Text Distribution:
   - Percentage breakdown of Branded vs Naked URL vs Partial vs Exact Match anchors
4. Competitor Link Gap:
   - Estimated link deficit vs ${comps} and recommendations to reach parity.`;

    try {
      const result = await callOpenRouter(prompt, "You are an elite Ahrefs Site Explorer backlink and traffic intelligence analyst.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  document.getElementById("btn-ahrefs-content-explorer")?.addEventListener("click", async () => {
    const topic = document.getElementById("ahrefs-keyword").value.trim() || "wedding photography";
    const resBox = document.getElementById("ahrefs-results");

    resBox.style.display = "block";
    resBox.innerText = `Searching Free Ahrefs Content Explorer for '${topic}'...`;

    const prompt = `You are the Free Ahrefs Content Explorer Engine for ApexGMB.
Topic / Query: ${topic}

Generate high-performance content intelligence:
1. Viral & Top Performing Content Breakdown:
   - 3 winning content angles/articles in this niche with highest estimated backlinks and social velocity
   - Why they succeeded: Hook, format (Case study, listicle, comparison, data report), word count
2. Unlinked Brand Mentions & Reclamation Strategy:
   - How to uncover high-authority publications discussing '${topic}' and pitch them for contextual links
3. Repurposing & Multi-Channel Syndication Blueprint:
   - Converting top topics into LinkedIn articles, Substack newsletters, and Reddit discussions
4. Publisher Outreach Targets:
   - Specific types of editors and vertical blogs actively covering this topic.`;

    try {
      const result = await callOpenRouter(prompt, "You are an expert Ahrefs Content Explorer strategist.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  document.getElementById("btn-ahrefs-rank-tracker")?.addEventListener("click", async () => {
    const site = document.getElementById("ahrefs-site").value.trim() || "bhardwajstudio.in";
    const keywords = document.getElementById("ahrefs-keyword").value.trim() || "wedding photographer Delhi NCR, candid photoshoot, bridal photography";
    const resBox = document.getElementById("ahrefs-results");

    resBox.style.display = "block";
    resBox.innerText = `Running Free Ahrefs Rank Tracker for ${site}...`;

    const prompt = `You are the Free Ahrefs Rank Tracker Engine for ApexGMB.
Target Domain: ${site}
Tracked Keywords: ${keywords}

Generate a comprehensive Rank Tracking & SERP Visibility Report:
1. Share of Voice (SOV) & Visibility Index:
   - Estimated visibility percentage (0-100%) for this target keyword cluster
   - Average ranking position across all queries
2. Keyword-by-Keyword SERP Breakdown:
   - Keyword | Estimated Rank (1-100) | SERP Feature Won (Map Pack, Featured Snippet, AI Overview, None) | Intent
3. Striking Distance Opportunities (Positions 4–15):
   - Fast-win keywords that can break into the Top 3 with minor on-page or citation tweaks
4. Competitor SERP Domination Comparison:
   - Which competitor currently captures the highest Share of Voice and how to displace them.`;

    try {
      const result = await callOpenRouter(prompt, "You are a master Rank Tracking and SERP visibility analyst.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  document.getElementById("btn-ahrefs-ai-brand")?.addEventListener("click", async () => {
    const site = document.getElementById("ahrefs-site").value.trim() || "Apex Media Studio";
    const comps = document.getElementById("ahrefs-comps").value.trim() || "competitors";
    const resBox = document.getElementById("ahrefs-results");

    resBox.style.display = "block";
    resBox.innerText = `Running AI & Brand Tracking Radar (GEO/AEO) for ${site}...`;

    const prompt = `You are the Free Ahrefs AI & Brand Tracking Engine (GEO/AEO Radar) for ApexGMB.
Brand Name / Domain: ${site}
Competitor Brands: ${comps}

Analyze Brand Visibility & Citations Across the AI Search Landscape:
1. AI Engine Presence & Sentiment:
   - Visibility and sentiment across Perplexity AI, Google AI Overviews, ChatGPT Search, Gemini, and Claude
2. Share of AI Citations:
   - Estimated percentage of AI responses recommending '${site}' versus competitors
3. AI Citability Score (0-100):
   - Schema.org completeness, entity anchoring in Wikidata, and citation density
4. GEO / AEO Action Roadmap:
   - 3 concrete steps to ensure LLMs consistently cite and recommend '${site}'.`;

    try {
      const result = await callOpenRouter(prompt, "You are an elite AI Brand Tracking and Generative Engine Optimization (GEO/AEO) specialist.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  // Ahrefs Intelligence Listeners
  document.getElementById("btn-ahrefs-intersect")?.addEventListener("click", async () => {
    const site = document.getElementById("ahrefs-site").value.trim() || "yoursite.com";
    const comps = document.getElementById("ahrefs-comps").value.trim() || "competitors";
    const resBox = document.getElementById("ahrefs-results");

    resBox.style.display = "block";
    resBox.innerText = "Running Ahrefs-Grade Competitor Link Intersect Gap Analysis...";

    const prompt = `As an elite Ahrefs Link Intersect and backlink intelligence strategist:
Target Domain: ${site}
Competitor Domains: ${comps}

Perform a rigorous Competitor Backlink Gap Analysis:
1. High-Probability Overlapping Link Sources: What local directories, wedding portals, industry publications, and media sources link to these competitors that ${site} is missing?
2. Tiered Priority Action List (Tier 1: High-DA DoFollow citations; Tier 2: Niche vendor blogs; Tier 3: Local community sponsors).
3. The Outreach Pitch Script: A customized, high-converting email template requesting inclusion or guest contribution.
4. Anchor Text Strategy: Recommended anchor ratios (Branded, Naked, Partial) to avoid algorithmic penalties.`;

    try {
      const result = await callOpenRouter(prompt, "You are an expert Ahrefs link builder and competitive intelligence specialist.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  document.getElementById("btn-ahrefs-gap")?.addEventListener("click", async () => {
    const site = document.getElementById("ahrefs-site").value.trim() || "bhardwajstudio.in";
    const comps = document.getElementById("ahrefs-comps").value.trim() || "competitors.com";
    const topic = document.getElementById("ahrefs-keyword").value.trim() || "wedding photography";
    const resBox = document.getElementById("ahrefs-results");

    resBox.style.display = "block";
    resBox.innerText = `Running Ahrefs Content Gap Analysis against ${comps}...`;

    const prompt = `Perform a comprehensive Ahrefs Content Gap / Organic Keyword Gap Analysis (Ghulam Ali framework) comparing:
My Website: ${site}
Competitor Domains: ${comps}
Seed Topic: ${topic}

Deliver:
1. High-Opportunity Content Gap Matrix: Keywords where 2 or more competitors rank in the Top 10 on Google, but ${site} is missing.
2. Striking Distance Targets (Positions 11–20): Quick-win commercial keywords that can break into Page 1 with minor on-page optimizations or internal links.
3. Missing Sub-Topics & Category Silos: Structural content sections competitors have built that our site lacks.
4. 3 Actionable Content Briefs: H1, target secondary keywords, search intent (Commercial vs Informational), and recommended word count.`;

    try {
      const result = await callOpenRouter(prompt, "You are a master of Ahrefs Content Gap analysis and competitive search intelligence.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  document.getElementById("btn-ahrefs-top")?.addEventListener("click", async () => {
    const targetUrl = document.getElementById("ahrefs-keyword").value.trim() || "competitor.com/best-service";
    const resBox = document.getElementById("ahrefs-results");

    resBox.style.display = "block";
    resBox.innerText = `Reverse-Engineering Top-Performing Page: ${targetUrl}...`;

    const prompt = `Reverse-engineer and teardown a competitor's top-performing organic page based on Ghulam Ali's Ahrefs Masterclass:
Target Competitor URL/Topic: ${targetUrl}

Deconstruct:
1. Traffic & Intent Estimation: What primary search queries and buyer intent make this page drive 80% of their organic inquiries.
2. Structural Blueprint:
   - Target H1 and H2/H3 outline
   - Content format (Comparison table, gallery showcase, price calculator, or step-by-step guide)
   - Estimated word count and visual asset density
3. Semantic Entity & LSI Density: Key terminology and contextual entities Google associates with this page.
4. The 10x Outranking Strategy: How to build a superior asset on our own domain that satisfies search intent better and captures the #1 ranking.`;

    try {
      const result = await callOpenRouter(prompt, "You are an elite SEO strategist specializing in competitive reverse-engineering.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  document.getElementById("btn-ahrefs-broken")?.addEventListener("click", async () => {
    const site = document.getElementById("ahrefs-site").value.trim() || "bhardwajstudio.in";
    const topic = document.getElementById("ahrefs-keyword").value.trim() || "Wedding Photography Guide";
    const resBox = document.getElementById("ahrefs-results");

    resBox.style.display = "block";
    resBox.innerText = `Formulating Broken Link Steal Playbook for '${topic}'...`;

    const prompt = `Create a Broken Link Building (Dead Link Steal) campaign based on Ghulam Ali's Ahrefs Masterclass for:
Business / Domain: ${site}
Topic: ${topic}

Provide:
1. Dead Link Discovery Protocol: How to use Ahrefs Best by Links (filtered to 404 Not Found) to uncover high-authority dead links in this vertical.
2. Replacement Asset Blueprint: What valuable, link-worthy resource or guide to publish to replace the dead competitor URL.
3. High-Converting Webmaster Outreach Pitch: A personalized, non-spammy email template alerting the linking webmaster to their broken link and offering our new resource as a superior drop-in replacement.
4. Follow-up Cadence & Conversion Optimization.`;

    try {
      const result = await callOpenRouter(prompt, "You are an expert backlink strategist specializing in broken link reclamation and outreach.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  document.getElementById("btn-ahrefs-toxic")?.addEventListener("click", async () => {
    const site = document.getElementById("ahrefs-site").value.trim() || "bhardwajstudio.in";
    const resBox = document.getElementById("ahrefs-results");

    resBox.style.display = "block";
    resBox.innerText = `Auditing Backlink Profile & Generating Google Disavow Rules for ${site}...`;

    const prompt = `Perform a Backlink Profile Health & Toxic Link Audit based on Ghulam Ali's Ahrefs Masterclass for:
Domain: ${site}

Deliver:
1. Anchor Text Distribution Health Check: Evaluate against Google-safe ratios (Branded 50-60%, Naked URLs 20-25%, Generic 10-15%, Exact Match <10%).
2. Toxic Link Risk Triggers: Identifying negative SEO attacks, foreign casino/poker anchor injections, automated scraper links, or bad PBN footprints.
3. Formatted Google Disavow Rules: Exact syntax output ready for Google Search Console disavow.txt (domain-level and URL-level rules).
4. Recovery Action Plan: Timeline and re-crawl acceleration strategies post-disavow submission.`;

    try {
      const result = await callOpenRouter(prompt, "You are a senior SEO penalty and backlink audit specialist.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  document.getElementById("btn-ahrefs-explorer")?.addEventListener("click", async () => {
    const keyword = document.getElementById("ahrefs-keyword").value.trim() || "wedding photographer";
    const resBox = document.getElementById("ahrefs-results");

    resBox.style.display = "block";
    resBox.innerText = `Analyzing '${keyword}' via Ahrefs Keyword Explorer & Intent Matrix...`;

    const prompt = `Perform an in-depth Ahrefs Keyword Explorer decomposition for the seed topic: "${keyword}":
1. Search Intent Matrix:
   - High Commercial / Transactional Buying Queries (with estimated CPC tier)
   - Commercial Investigation Queries (comparisons, best-in-city)
   - Informational & Question Queries ("How much does X cost", "What to wear for Y")
2. Keyword Difficulty (KD) & SERP Features:
   - Estimated KD score (0-100) & referring domains needed to rank in Top 10
   - Target SERP Features (Local 3-Pack, Featured Snippets, Image Carousels, People Also Ask)
3. 2026 Semantic Entity Clusters: Core secondary LSI keywords to optimize for Google's AI Overview.`;

    try {
      const result = await callOpenRouter(prompt, "You are a master of Ahrefs Keyword Explorer and semantic search clustering.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  document.getElementById("btn-ahrefs-audit")?.addEventListener("click", async () => {
    const site = document.getElementById("ahrefs-site").value.trim() || "https://bhardwajstudio.in";
    const resBox = document.getElementById("ahrefs-results");

    resBox.style.display = "block";
    resBox.innerText = `Running Ahrefs Technical Site Health Audit for ${site}...`;

    const prompt = `You are an Ahrefs Technical Site Audit and Core Web Vitals specialist.
Audit Target: ${site}

Generate an Actionable Technical SEO Health Checklist:
1. Crawlability & Architecture: Robots.txt rules, XML sitemap validation, canonical tags, internal linking silo structure.
2. On-Page & Semantic Signals: Title tag optimization, H1/H2 hierarchy, meta description CTR hooks, image alt text density.
3. Local Schema & Entity Anchor: LocalBusiness JSON-LD markup, GeoCoordinates, AggregateRating, openingHoursSpecification.
4. Speed & Core Web Vitals (LCP, CLS, INP) Optimization: TTFB minimization, WebP compression, asset minification.
5. The 7-Day Technical Action Roadmap: Prioritized fixes ranked by algorithmic ranking impact.`;

    try {
      const result = await callOpenRouter(prompt, "You are an elite technical SEO auditor and Core Web Vitals specialist.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  // eCommerce & Package Listeners (Ghulam Ali Masterclass)
  document.getElementById("btn-ecom-schema")?.addEventListener("click", async () => {
    const name = document.getElementById("ecom-name").value.trim() || "Luxury Wedding Package";
    const priceStr = document.getElementById("ecom-price").value.trim() || "75000 INR";
    const resBox = document.getElementById("ecom-results");

    resBox.style.display = "block";
    resBox.innerText = "Generating Google-Compliant Product & Offer Schema (JSON-LD)...";

    const prompt = `Generate pure, validated Schema.org JSON-LD structured data for:
Product / Package: ${name}
Price & Currency: ${priceStr}

Output:
1. Valid <script type="application/ld+json"> snippet including:
   - @type: "Product"
   - name, description, brand ("Apex Media Studio")
   - offers: @type "Offer", price, priceCurrency, availability ("https://schema.org/InStock"), priceValidUntil
   - aggregateRating: @type "AggregateRating", ratingValue: "4.9", reviewCount: "85"
2. Placement instructions to trigger rich snippet gold stars in Google search results.`;

    try {
      const result = await callOpenRouter(prompt, "You are an expert in JSON-LD structured data and Google Rich Results.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  document.getElementById("btn-ecom-content")?.addEventListener("click", async () => {
    const category = document.getElementById("ecom-category").value.trim() || "Wedding Photography Packages";
    const resBox = document.getElementById("ecom-results");

    resBox.style.display = "block";
    resBox.innerText = `Writing High-Converting Category Content for '${category}'...`;

    const prompt = `Write high-converting, SEO-optimized Category Page Copy (Ghulam Ali formula) for:
Category: ${category}

Provide:
1. Above-the-Fold Intro (80-120 words): Catchy H1, immediate search intent fulfillment, trust badge, and localized keyword integration before the product/package grid.
2. Below-the-Grid Buying Guide (600+ words):
   - H2: Key Factors to Consider When Selecting a Package
   - H2: Deliverables & Timeline Breakdown
   - H2: Frequently Asked Questions (FAQ) marked up for FAQPage Schema.`;

    try {
      const result = await callOpenRouter(prompt, "You are an elite eCommerce conversion copywriter and SEO architect.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  document.getElementById("btn-ecom-silo")?.addEventListener("click", async () => {
    const category = document.getElementById("ecom-category").value.trim() || "Wedding Services";
    const resBox = document.getElementById("ecom-results");

    resBox.style.display = "block";
    resBox.innerText = "Formulating 3-Click Silo & Parameter Defense Architecture...";

    const prompt = `Design an eCommerce Information Architecture & Silo Structure for ${category}:
1. The 3-Click Hierarchy: Clean breadcrumb mapping from Homepage -> Category Silo -> Sub-package.
2. Faceted Navigation & Parameter Defense:
   - Self-referencing canonical vs filter canonicalization rules (e.g. ?budget=, ?sort=)
   - Robots.txt directives to block parameter index bloat.
3. Internal Link Equity Distribution: Funneling PageRank from high-authority guides to commercial package checkout pages.`;

    try {
      const result = await callOpenRouter(prompt, "You are an elite eCommerce information architect.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  // Local SEO Masterclass Handlers (Ghulam Ali Zero-to-Hero)
  document.getElementById("btn-localseo-nap")?.addEventListener("click", async () => {
    const biz = document.getElementById("localseo-biz").value.trim() || "Apex Media Studio";
    const addr = document.getElementById("localseo-address").value.trim() || "Shop 12, Main Market, Sector 15";
    const phone = document.getElementById("localseo-phone").value.trim() || "+91-9876543210";
    const website = document.getElementById("localseo-website").value.trim() || "https://bhardwajstudio.in";
    const city = document.getElementById("localseo-city").value.trim() || "Delhi NCR";
    const resBox = document.getElementById("localseo-results");

    resBox.style.display = "block";
    resBox.innerText = `Running Ghulam Ali NAP Consistency & Citation Audit for ${biz}...`;

    const prompt = `Perform a deep NAP (Name, Address, Phone) & Local Citation Consistency Audit based on Ghulam Ali's 5-Hour Local SEO Masterclass:
Business Name: ${biz}
Address: ${addr}
Phone: ${phone}
Website: ${website}
City / Area: ${city}

Deliver:
1. Canonical NAP Standard: The exact, immutable string standard to maintain across all directories (preventing abbreviation discrepancies like Rd vs Road, St vs Street).
2. Risk Assessment: Where citations most commonly break (tracking numbers vs primary phone, address abbreviations, suite syntax).
3. Tier-1 Directory Audit Checklist: 10 critical citation sources (Google, Apple Maps, Bing, Yelp, Facebook, YellowPages, Justdial/IndiaMART) with field-by-field verification checklist.
4. NAP Cleaning & Duplicate Removal Action Plan: 3 immediate steps to claim or correct conflicting citations.`;

    try {
      const result = await callOpenRouter(prompt, "You are a master Local SEO auditor specializing in NAP consistency and data aggregators.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  document.getElementById("btn-localseo-silo")?.addEventListener("click", async () => {
    const biz = document.getElementById("localseo-biz").value.trim() || "Apex Media Studio";
    const neighborhood = document.getElementById("localseo-neighborhood").value.trim() || "Connaught Place";
    const city = document.getElementById("localseo-city").value.trim() || "Delhi";
    const category = document.getElementById("localseo-category").value.trim() || "PhotographyStudio";
    const resBox = document.getElementById("localseo-results");

    resBox.style.display = "block";
    resBox.innerText = `Designing Geo-Silo & Neighborhood Landing Page for ${neighborhood}, ${city}...`;

    const prompt = `Design a hyper-local Geo-Silo & Neighborhood Landing Page Architecture (Ghulam Ali formula) for:
Business: ${biz}
Category / Service: ${category}
Target Neighborhood: ${neighborhood}
City / Region: ${city}

Provide:
1. Page URL Structure & SEO Meta: Canonical URL slug, H1 tag, Meta Title, Meta Description (with CTR hooks).
2. Localized Content Blueprint:
   - Above-the-fold local hook targeting residents of ${neighborhood}
   - Driving Directions & Landmarks section ("How to reach us from central stations/metro")
   - Neighborhood project highlights & proof points
   - Hyper-local FAQ with 3 localized questions
3. Google Map Embed & CID Strategy: How to embed the localized Google Map iframe with CID/Place ID without degrading Core Web Vitals.
4. Internal Linking Mesh: Upward parent link and horizontal links to adjacent neighborhoods.`;

    try {
      const result = await callOpenRouter(prompt, "You are an elite Local SEO architect specializing in neighborhood siloing and geo-grid expansion.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  document.getElementById("btn-localseo-citations")?.addEventListener("click", async () => {
    const biz = document.getElementById("localseo-biz").value.trim() || "Apex Media Studio";
    const category = document.getElementById("localseo-category").value.trim() || "Photography Studio";
    const city = document.getElementById("localseo-city").value.trim() || "Delhi NCR";
    const resBox = document.getElementById("localseo-results");

    resBox.style.display = "block";
    resBox.innerText = `Generating High-Impact Local Citation Matrix for ${biz}...`;

    const prompt = `Generate an authoritative Local Citation Building Matrix based on Ghulam Ali's Local SEO blueprint for:
Business: ${biz}
Category: ${category}
City / Market: ${city}

Provide:
1. Top Tier-1 Foundational Citations (DA 80+ directory profiles).
2. Top Tier-2 Regional & Business Registries for ${city}.
3. Top 5 High-Relevance Niche / Vertical Directories for ${category}.
4. Exact Submission Data Matrix:
   - Business Title (exact unbranded)
   - Category mapping recommendations
   - 250-character and 500-character description variations
   - Target anchor text and website tracking parameters.
5. Aggregator Syndication Strategy (Data Axle, Neustar Localeze, Foursquare).`;

    try {
      const result = await callOpenRouter(prompt, "You are a senior citation builder and local search data aggregator strategist.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });

  document.getElementById("btn-localseo-schema")?.addEventListener("click", async () => {
    const biz = document.getElementById("localseo-biz").value.trim() || "Apex Media Studio";
    const addr = document.getElementById("localseo-address").value.trim() || "Shop 12, Main Market, Sector 15";
    const phone = document.getElementById("localseo-phone").value.trim() || "+91-9876543210";
    const website = document.getElementById("localseo-website").value.trim() || "https://bhardwajstudio.in";
    const city = document.getElementById("localseo-city").value.trim() || "Delhi, 110001";
    const category = document.getElementById("localseo-category").value.trim() || "PhotographyStudio";
    const resBox = document.getElementById("localseo-results");

    resBox.style.display = "block";
    resBox.innerText = `Generating Master LocalBusiness Schema for ${biz}...`;

    const prompt = `Generate a complete, production-ready LocalBusiness JSON-LD Schema (Schema.org compliant) for:
Business Name: ${biz}
Schema @type: ${category}
Street Address: ${addr}
City & Region: ${city}
Phone: ${phone}
Website: ${website}

Output:
1. Complete JSON-LD enclosed in <script type="application/ld+json">:
   - Must include: @context, @type, @id, name, url, telephone, address (PostalAddress), geo (GeoCoordinates), areaServed (Multiple administrative areas), openingHoursSpecification, priceRange.
   - Must include an authoritative sameAs array linking to GBP, Facebook, Instagram, Yelp, and top local citations.
2. Verification instructions for Google Rich Results Test and placement recommendation.`;

    try {
      const result = await callOpenRouter(prompt, "You are an expert technical SEO and Schema.org structured data engineer.");
      resBox.innerText = result;
    } catch (e) {
      resBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">⚠️ ${e.message}</span>`;
    }
  });
});
