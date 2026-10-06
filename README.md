# مَورد — Mawrid

**Mawrid** is a premium bilingual (Arabic/English, RTL-first) digital marketplace.
Buyers discover digital products, platform subscriptions, and goods from verified
sellers; sellers and freelancers get profiles, portfolios, and self-built
storefronts through the built-in **Store Studio** page builder.

🎨 **Design:** the UI is implemented from the Figma design system —
[“Mawrid” on Figma](https://www.figma.com/design/41WPnJUNI1mXZTu5mUV5SM)
(tokens, components, and page layouts live in `src/styles/tokens.css`,
`src/styles/primitives.css`, and the `mw-*` component styles).

## Stack

- **React 19 + Vite 8**, `react-router-dom` 7
- Styling: plain CSS driven by Figma design tokens (`--mw-*`), no Tailwind
- Animation: `framer-motion`, `gsap`, `lenis` smooth scroll
- Backend (hybrid): **Firebase Auth** (identity) + **Supabase** (users, products,
  categories, storefronts) + **Cloudinary** (unsigned media uploads)
- i18n: custom `LanguageContext` (`ar` default, RTL / `en` LTR), multi-currency
  via `CurrencyContext`

## Project structure

```
src/
  pages/          # Routes: Home, Marketplace, Details, SellersPage,
                  # SellerStorefront, StorePage, Cart, Checkout, Auth, dashboards
  components/
    layout/       # Navbar (Figma), Footer, Layout
    sections/     # Home sections: Hero, Categories, TrendingProducts,
                  # Pricing, WhyMawrid, Testimonials, CtaBanner
    marketplace/  # ProductCard (Figma)
    sellers/      # SellerCard (Figma), WorksModal
    store/        # StoreStudio page-builder + StoreRenderer
    ui/           # Design-system primitives: Button, Badge, SectionHeading…
  styles/
    tokens.css      # Figma tokens (colors, type, spacing, radii)
    primitives.css  # Button / Badge / Input / SectionHeading / Stat
    globals.css     # Legacy global styles & utilities
  contexts/       # Language, Currency, Auth, Cart
  lib/            # supabase, firebase, cloudinary, storefront, plans…
  i18n/           # ar/en translations
```

## Getting started

```bash
npm install
cp .env.example .env   # add VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY + Cloudinary preset
npm run dev            # → http://localhost:5173
```

Build & preview:

```bash
npm run build
npm run preview
```

## Key routes

| Route | Page |
|---|---|
| `/` | Home (hero, categories, trending, pricing, why, testimonials) |
| `/marketplace` | Catalog with RTL filter sidebar |
| `/product/:id` | Product details (gallery, stepper, tabs, related) |
| `/sellers`, `/sellers/:specialty`, `/sellers/:specialty/:id` | Seller directory & storefronts |
| `/store/:slug` | Public seller store (Store Studio renderer, `?edit=1` for owners) |
| `/cart`, `/checkout` | Cart & checkout |
| `/dashboard/*` | Buyer / seller dashboards |
| `/admin`, `/owner` | Code-gated admin panel |

## Design-system notes

- All new UI uses the `mw-*` class namespace and `--mw-*` tokens from
  `src/styles/tokens.css` (12 Figma color tokens, Tajawal/Inter type scale,
  8px spacing, 4/8/12/full radii).
- Arabic is the default language; layouts mirror automatically via
  `[dir="rtl"]` / `[dir="ltr"]`.
- Legacy pages keep their existing styles in `globals.css` — nothing was
  removed, only the redesigned surfaces moved to the token system.
