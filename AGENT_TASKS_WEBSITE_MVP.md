
# Agentic-AI Build Spec — Flowers & Gifts Shop (MVP)
**Target stack:** Next.js 15 (App Router, TS) on Vercel • Node/NestJS (or Express) + Prisma + PostgreSQL on Railway • i18n: bg (default), en, ru.  
**Goal:** Ship a fast, SEO‑maxed, mobile‑first e‑commerce with admin CRUD. Separate FE/BE, Git‑driven (Cursor).

---

## 0) Deliverables (Done when all shipped)
- Public site (SSR/ISR): **Home, Catalog (+filters), Promotions, Blog, Contacts, PDP**, Cart & Checkout (guest).
- Admin (JWT): CRUD **Flowers, Packaging, Bouquets, Categories, Blog, Media, Orders**.
- API v1 (REST) with validation, auth, logging.  
- DB schema (Prisma) + migrations + seed.  
- SEO/i18n foundation: **hreflang, sitemaps, robots, JSON‑LD (Product/Offer, Org, Shipping/Returns)**.  
- CI gates: **Lighthouse mobile ≥ 90**, schema validation, link checker, Web Vitals budget.

---

## 1) Repo & Envs
**Monorepo (pnpm):**
```
/apps/web   (Next.js 15, TS, Tailwind)
/apps/api   (NestJS/Express, TS)
/packages/ui, /packages/types (optional)
```
**ENV examples**
- **web (Vercel):**
```
NEXT_PUBLIC_API_BASE=https://api.example.bg/api/v1
NEXT_PUBLIC_DEFAULT_LOCALE=bg
NEXT_PUBLIC_AVAILABLE_LOCALES=bg,en,ru
SITE_URL=https://example.bg
```
- **api (Railway):**
```
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=change_me
PAYMENT_PROVIDER=mypos|ubb
PAYMENT_RETURN_URL=https://example.bg/payment/return
PAYMENT_CALLBACK_URL=https://api.example.bg/api/v1/payment/callback
```

---

## 2) Data Model (Prisma — summary)
- **Category**: id, name, slug, parentId, description, isActive
- **Flower**: id, subcategory (flower|green|exotic...), name, priceCost, markup (1.5|2|3), price, desc, images[], sku, isActive
- **Packaging**: id, type (paper|fabric|tissue|ribbon|film), color, isTransparent, unit (piece|meter), pricePerUnit, images[], sku, isActive
- **Bouquet**: id, categoryId, name, desc, sku, priceBase, extraCharge, discountPct (0/5/10/15), priceOld, price, images[], isActive
- **BouquetFlowers**: bouquetId, flowerId, qty
- **BouquetMaterials**: bouquetId, packagingId, qty
- **Order**: id, customer, phone, email, address, time, comment, paymentMethod, paymentStatus, deliveryPrice, total, status, txId
- **OrderItem**: orderId, itemType (flower|bouquet), itemId, nameSnapshot, priceSnapshot, qty
- **BlogPost**: id, slug, title, image, content, lang, publishedAt
- **Translations**: *_translation tables or per‑locale fields (choose one; MVP ok with per‑locale on key entities)

**Price logic**
```
priceBase = Σ(flower.price * qty) + Σ(packaging.pricePerUnit * qty)
priceOld  = priceBase + extraCharge
price     = discountPct ? priceOld * (1 - discountPct/100) : priceOld
```

**SKU**
```
SKU = <prefix>[FL|PK|BQ]-<autoincrement>
```

---

## 3) API v1 (REST)
**Public**
- `GET /catalog/categories`
- `GET /products` (query: type, category, minPrice, maxPrice, size, sale, sort, page, pageSize)
- `GET /products/:idOrSku`
- `GET /blog`, `GET /blog/:slug`
- `POST /cart/estimate`
- `POST /orders` (guest checkout)

**Payments (stubs)**
- `POST /payment/initiate` → {redirectUrl}
- `POST /payment/callback` (verify signature → update order/payment)
- `GET /payment/return` (success|fail)

**Admin (JWT)**
- CRUD: `/admin/flowers`, `/admin/packaging`, `/admin/bouquets`, `/admin/categories`, `/admin/blog`, `/admin/media/upload`, `/admin/orders`
- Auth: `POST /auth/login` (bcrypt + JWT HttpOnly)

Security: rate‑limit admin, strict CORS, input validation (zod/class‑validator), request logging.

---

## 4) Frontend (Next.js)
### 4.1 Global
- Header: logo, menu **(Главная, Каталог, Акции, Блог, Контакты)**, lang switch (bg/en/ru), cart badge.
- Footer: NAP, schedule, socials, policy links. Sticky nav on mobile.

### 4.2 Pages
- **Home**: hero‑slider (½ screen), promo blocks, top categories, highlights, blog preview.
- **Catalog**: left categories tree; filters: **price (inputs+slider)**, **size S–XL**; sort: price/name/**sale‑first**; cards with old/new price.
- **PDP**: large image + up to 10 thumbs + fullscreen zoom; name, price, SKU; size (where applicable), options (wrap color, add card/flowers), description, related items.
- **Promotions**: list from sale flag/prices.
- **Blog**: list + post page.
- **Contacts**: address, clickable tel/mail, map, hours, contact form.
- **Cart & Checkout (guest)**: qty edit, totals; delivery (courier/pickup), comment; payment (card|cash) → initiate payment.

**i18n**
- Locales: `/`, `/en/`, `/ru/`; synchronized slugs; `hreflang` for each pair; alt text localized.

**Faceted indexing**
- Index only **allow‑listed** filter presets; others → `noindex,follow` + canonical to base category.

---

## 5) Admin (MVP)
- **Flowers**: name, subcategory, priceCost, markup (1.5/2/3) → auto price, desc, up to 4 photos, auto SKU.
- **Packaging**: type, color, isTransparent, unit, pricePerUnit, photos, SKU.
- **Bouquets**: name/desc/photos (≤10), **composition** selectors (flowers+qty, packaging+qty), “Recalculate”, fields: extraCharge, discountPct (0/5/10/15) → auto priceOld/price, SKU.
- **Categories/Blog/Media/Orders**: standard CRUD; order status transitions.
- Multilingual fields (bg/en/ru) or translation tables; optional **Auto‑translate** action.
- Role: single admin user (MVP).

---

## 6) SEO & Performance — must‑haves
- Rendering: **SSR/ISR** for money pages; avoid client‑only critical content.
- `Metadata` API templates for titles/descriptions/OG/Twitter; **canonical**, **hreflang**.
- `robots.txt`, `sitemap.xml` (+ pages/products/images), language alt links inside sitemaps.
- JSON‑LD:
  - `Organization` + `LocalBusiness` (Florist) on home/contacts (NAP, hours, geo, sameAs)
  - `Product`/`Offer` on PDP (BGN, availability, SKU, images)
  - `OfferShippingDetails` per PDP; `MerchantReturnPolicy` on org level
- Image pipeline: Next/Image, AVIF/WebP, fixed `width/height`, lazy‑load; stable URLs.
- Core Web Vitals mobile targets: **LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1**.
- Breadcrumbs UI + `BreadcrumbList`.
- Local/GBP readiness: add UTM’d products to GBP later (not in scope to automate).

---

## 7) Payments (myPOS/UBB readiness)
- Front: checkout flow → `POST /payment/initiate` → redirect to provider → return page.
- Back: signed `callback` handler → update `Order.paymentStatus` (paid|failed).
- Do **not** collect card data server‑side. Log txId, store minimal metadata.

---

## 8) CI/CD & QA
- **Build gates:** Lighthouse mobile ≥ 90; JSON‑LD validator (no critical errors); link checker (no 404/5xx); i18n hreflang sync test.
- **Unit/integration:** price calc, SKU gen, filters & sorting, order creation, payment webhooks.
- **E2E (playwright):** main funnel (Home → Catalog → PDP → Cart → Checkout → return success).
- Error logging (basic): console/Railway logs; 404/500 pages.

---

## 9) Rollout Plan (sprints)
**S1: Bootstrap & DB**
1) Init monorepo; Tailwind/ESLint/Prettier.  
2) Prisma schema + migrations + seed minimal data.  
3) Auth (JWT) + Admin scaffolding.

**S2: API & Catalog**
1) Public endpoints; category tree; products list with filters/sort/pagination.  
2) PDP with gallery, options, price logic.  
3) Cart/Checkout (guest), orders.

**S3: SEO/i18n & Perf**
1) Metadata, robots, sitemaps, hreflang, JSON‑LD.  
2) ISR/SSR tune; images pipeline; CWV targets.  
3) Promotions, Blog, Contacts.

**S4: Admin polish & Payments**
1) Full CRUD for Flowers/Packaging/Bouquets (composition calc).  
2) Orders page, status transitions, exports.  
3) Payment initiate/callback/return pages.

---

## 10) Definition of Done (acceptance)
- All routes implemented & localized (bg/en/ru) with valid hreflang.  
- PDPs expose Product/Offer + Shipping; site exposes Org + ReturnPolicy schema.  
- Catalog filters work; sale‑first sort; allow‑list faceted indexing enforced.  
- Price/discount logic matches spec; SKU auto‑generated.  
- Lighthouse mobile ≥ 90; CWV budget met on test data.  
- Admin performs full CRUD; images upload works; orders lifecycle covered.  
- Payment flow redirects & callback updates order correctly (mock/test keys ok).
