# Content Creator Marketplace

A modern **content creator marketplace** that empowers creators to easily sell personal items to their audience — without needing to set up a full online store, buy a domain, or learn e-commerce.

Think **Twitter for commerce**: instead of posting tweets, creators post items for sale.

---

## 🚀 Vision

We’re building the simplest way for creators to turn their influence into revenue.

- **No friction**: Creators can post items in minutes, not hours.
- **No store setup**: Skip Shopify theme development, domains, or heavy e-commerce workflows.
- **Direct-to-fan commerce**: Fans shop directly from creators’ profiles.
- **Seamless fulfillment**: Drop the item in a bag, attach the included return label, and we handle the rest via 3PL.

---

## ✨ Features

- **Creator Profiles**  
  Each creator has a page with their profile image, banner, bio, and product listings.

- **Quick Item Posting**  
  Post items as easily as posting a tweet — add a photo, description, and price.

- **Easy Payments**  
  Powered by Shopify’s checkout system for reliability, trust, and security.

- **Fulfillment System**

  - Sold items are shipped back with a return label included in the order.
  - Items go to our **3PL (Third-Party Logistics)** partner.
  - The 3PL processes and ships items to the buyer on behalf of the creator.

- **Fans First**  
  Shoppers browse creators they love, discover items, and buy directly with a few clicks.

---

## 🛠️ Tech Stack

- **Frontend** → [Hydrogen](https://shopify.dev/custom-storefronts/hydrogen) (Shopify’s React-based framework)
- **Hosting (Frontend)** → [Oxygen](https://shopify.dev/custom-storefronts/oxygen) (Shopify-native hosting)
- **Commerce Backend** → Shopify (products, orders, payments)
- **Database** → [Supabase](https://supabase.com/) (Postgres, SQL) for creator data & product associations
- **Node.js Services** → Vultr-hosted scripts for background jobs, syncing, and utilities
- **Fulfillment** → In-house + 3PL integration for shipping/returns

---

## 🧑‍💻 Development Workflow

1. **Branching**

   - `main` → production
   - `staging` → staging
   - `feature/*` → feature development
   - `hotfix/*` → bug fix

2. **PR Process**

   - All features merged into `staging` via Pull Requests.
   - Code reviewed before merging.

3. **CI/CD**
   - GitHub Actions handle linting, testing, and deployments.
   - Deployments:
     - `staging` → staging (Oxygen)
     - `main` → production (Oxygen)
