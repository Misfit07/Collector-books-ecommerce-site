# The Antiquarian Guild — Rare Books & Manuscripts E-Commerce Platform

An editorial, auction-house grade e-commerce platform for rare books, first editions, signed copies, vintage, and out-of-print titles.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **SQLite/PostgreSQL**, **NextAuth**, and **Razorpay** in test mode.

---

## 🏛️ Domain Architecture & Antiquarian Core Rules

1. **Unique-Item Inventory (`quantity = 1`)**:
   - Every physical volume is unique.
   - Adding a volume to your portfolio initiates an atomic **15-minute exclusive reservation hold** in the database (`prisma.$transaction`).
   - Active holds prevent competing collectors from double-booking. Stale holds auto-expire after 15 minutes and return to public availability.
2. **Forensic Physical Metadata**:
   - Condition Grades: **Fine**, **Very Good**, **Good**, **Fair**, **Poor** (governed by ABAA / ILAB codes).
   - Dust Jacket States: *As Issued*, *Present (Clipped)*, *Present (Minor Wear)*, *Lacking*, *Not Issued*.
   - Provenance Ledger: Ownership chains, ex-libris plates, auction records.
   - Defect Notes: Microscopic foxing patterns, spine rubbing, deckle edge state.
   - 6+ High-Resolution archival photographs per listing with interactive magnifying loupe.
3. **Cryptographic Certificate of Authenticity**:
   - Every rare or signed specimen receives a permanent Certificate with unique ID (e.g. `CERT-1925-GAT-3128`), examiner signatures, physical paper/binding analysis, and dynamic QR code resolving to public verification URL `/certificate/[certificateNumber]`.
4. **Make-an-Offer Flow**:
   - Buyers can submit private acquisition proposals. Curators can review, propose counter-offers with 48-hour expiration, or accept/decline.
5. **Anti-Snipe Timed Auctions**:
   - Real-time bidding on select institutional lots.
   - 5-minute auto-extension trigger when a bid is placed within 5 minutes of closing.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v20+ or v22+
- **npm** v10+

### 2. Installation
```bash
git clone <repo-url>
cd ecommerce
npm install
```

### 3. Environment Setup
Copy the template configuration:
```bash
cp .env.example .env
```
Default `.env` settings:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="antiquarian-secret-guild-key-9821371283"
RAZORPAY_KEY_ID="rzp_test_SbLNunYxrzDbmw"
RAZORPAY_KEY_SECRET="xrfVisBaUsgZ880FJdj2Pq14"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_SbLNunYxrzDbmw"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup & Seed (43+ Realistic Masterpieces)
```bash
# Push Prisma schema to local database
npx prisma db push

# Seed 40+ realistic collectible titles with 6+ photos, provenance, and certificates
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Demo Profiles

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Senior Curator (Admin)** | `admin@antiquarianguild.com` | `admin123` | Full Curatorial House (`/admin`), intake desk, offer workbench, live reservations monitor, order fulfillment. |
| **Collector (Customer)** | `collector@antiquarianguild.com` | `collector123` | Acquisition ledger (`/account`), saved wishlist, author alerts, submitted offers. |

*(Quick-fill demo buttons are provided directly on the `/login` page).*

---

## 🧪 Automated Testing

Run the Vitest integration suite covering 15-minute concurrency locks, double-booking prevention, expiration re-claims, and auction anti-snipe auto-extension:
```bash
npm test
```

---

## 🧭 Route Map

- `/` – Editorial Home with Featured Masterpieces, Live Auctions, and Curators' Highlights.
- `/catalog` – Comprehensive catalogue with multifaceted filters (Author, Year Range, Condition Grade, Dust Jacket, Signed, Price, Category Tags) and full-text search.
- `/catalog/[slug]` – Deep specimen dossier with 6+ photo gallery, magnifying loupe zoom, provenance ledger, defect notes, 15-min reservation hold, and make-an-offer drawer.
- `/certificate/[certificateNumber]` – Public verifiable Certificate of Authenticity with SHA-256 seal, physical collation notes, and dynamic QR code.
- `/cart` – Active Portfolio with live 15-minute countdown clock and auto-release.
- `/checkout` – Secure checkout with Razorpay test mode integration.
- `/orders/[orderNumber]` – Formal deed of acquisition, white-glove packaging tracker, and certificate links.
- `/account` – Collector acquisition ledger and certificates.
- `/account/wishlist` – Saved titles and author acquisition alerts.
- `/account/offers` – Make-an-offer proposal status and counter-offer responses.
- `/admin` – Curatorial Executive Desk with real-time analytics.
- `/admin/inventory` & `/admin/inventory/new` – 30+ attribute intake suite with multi-image manager and certificate generator.
- `/admin/offers` – Curators' offer negotiation workbench (Accept / Counter / Reject).
- `/admin/reservations` – Live active cart reservation monitor with Force-Release capability.
- `/admin/orders` – Order fulfillment and white-glove dispatch workbench.
