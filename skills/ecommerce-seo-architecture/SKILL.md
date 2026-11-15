---
name: ecommerce-seo-architecture
description: "Complete eCommerce & Service-Package SEO Architecture: Category siloing, faceted navigation canonicals, Product/Offer rich snippets schema, and high-conversion category page content based on Ghulam Ali's masterclass."
---

# Complete eCommerce & Service Package SEO Architecture

> Based on the comprehensive operational principles from **Ghulam Ali's eCommerce SEO Course**.

Whether running a full Shopify/WooCommerce store or selling high-ticket service packages (photography retainers, medical treatment plans, dental packages), this skill solves the four biggest killers of eCommerce organic traffic: **index bloat**, **faceted navigation duplicates**, **thin category pages**, and **missing rich snippet schema**.

---

## 🏛️ 1. The 3-Click Information Architecture (Category Siloing)

Google crawls eCommerce sites using a strict crawl budget. A deep directory structure buries products where Googlebot rarely reaches.

```
                   Homepage (DR Anchor)
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
  Category Silo A                         Category Silo B
 (e.g. Wedding Photography)             (e.g. Portrait Shoots)
       │                                       │
  ┌────┴────┐                             ┌────┴────┐
  ▼         ▼                             ▼         ▼
Product 1  Product 2                    Product 3  Product 4
```

* **The 3-Click Rule**: No product or package should ever be more than 3 clicks away from the homepage.
* **Silo Isolation**: Internal links should strictly cross-link within the same category family (`Breadcrumbs: Home > Wedding > Pre-Wedding Cinematic Package`).
* **BreadcrumbList Schema**: Mandatory JSON-LD schema showing Google the exact physical hierarchy.

---

## ⚙️ 2. Faceted Navigation & Parameter Defense (Preventing Index Bloat)

Filters like `?color=gold&size=xl&sort=price_desc` create millions of duplicate URLs, dilute page authority, and drain crawl budget.

### The Canonical & Robots Protocol:
1. **Self-Referencing Canonical**: Every clean category page (`/category/wedding-photography/`) has a canonical pointing to itself.
2. **Filter Normalization**: All filtered URLs (`/category/wedding-photography/?budget=luxury`) MUST set their `canonical` to the clean parent category URL.
3. **Robots.txt Crawl Control**:
   ```txt
   User-agent: *
   Disallow: /*?*sort=
   Disallow: /*?*price=
   Disallow: /*?*filter=
   ```

---

## 📝 3. High-Converting Category Page Content Formula

Most category pages rank poorly because they are thin grids of images with zero topical depth.

* **Above-the-Fold Intro (80–120 Words)**:
  * Immediately addresses search intent with target primary keyword in H1.
  * Quick value proposition and trust badge before the product grid.
* **The Product / Package Grid**: Clean cards with clear pricing and high-contrast CTA buttons.
* **Below-the-Grid Buying Guide (600–900 Words)**:
  * H2: *"What to Look For When Booking [Service/Product]"*
  * H2: *"Comparing Our Packages & Deliverables"*
  * H2: Frequently Asked Questions (FAQ) marked up with `FAQPage` Schema.

---

## 🏷️ 4. Rich Snippet Schema (Product, Offer & AggregateRating)

Displaying gold stars, prices, and availability directly in Google SERP increases click-through rates (CTR) by 25–40%:

```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Luxury Pre-Wedding Cinematic Shoot Package",
  "image": "https://yoursite.com/assets/prewedding.jpg",
  "description": "Full-day pre-wedding cinematic film with drone coverage and 50 edited portraits.",
  "brand": {
    "@type": "Brand",
    "name": "Apex Media Studio"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://yoursite.com/packages/pre-wedding",
    "priceCurrency": "INR",
    "price": "75000",
    "priceValidUntil": "2027-12-31",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "128"
  }
}
```

---

## 💻 CLI Automation Runner

```bash
# 1. Generate an eCommerce 3-Click Silo & Internal Linking Plan
python3 skills/scripts/gmb_ai_runner.py ecom-architecture \
  --store "Apex Media Studio Store" \
  --categories "Pre-Wedding Shoots, Luxury Wedding Films, Handcrafted Albums, Portrait Sessions"

# 2. Generate Google Rich Snippet Schema (Product + Offer + Rating)
python3 skills/scripts/gmb_ai_runner.py product-schema \
  --name "Luxury Candid Wedding Photography" \
  --price "150000" \
  --currency "INR" \
  --rating "4.9" \
  --reviews "85" \
  --brand "Apex Media Studio"

# 3. Generate Category Page High-Converting Content (Above & Below the fold)
python3 skills/scripts/gmb_ai_runner.py category-content \
  --category "Pre-Wedding Shoot Packages" \
  --niche "Wedding Photography" \
  --city "Delhi NCR"
```
