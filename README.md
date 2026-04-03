# Smart Money Manager

A full-stack personal finance web app built with React + Supabase.
Track income, expenses, and loans with automatic calculations and beautiful reports.

---

## Tech Stack

- **Frontend**: React 18 + React Router
- **Backend/Auth/DB**: Supabase (free tier)
- **Charts**: Chart.js + react-chartjs-2
- **Hosting**: Vercel (free tier)

---

## Setup Guide (Step by Step)

### Step 1 — Install Node.js
Download from https://nodejs.org (choose LTS version)

### Step 2 — Set up Supabase (your database)

1. Go to https://supabase.com and create a free account
2. Click "New project" — give it a name like "smart-money-manager"
3. Choose a strong database password (save it!)
4. Wait ~2 minutes for your project to be created
5. Go to **SQL Editor** (left sidebar)
6. Copy the entire contents of `supabase-schema.sql` and paste it in, then click **Run**
7. Go to **Settings → API**
8. Copy your **Project URL** and **anon public** key — you'll need these next

### Step 3 — Configure your environment

1. Copy `.env.example` to a new file called `.env`
2. Fill in your Supabase values:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

You can leave the Stripe keys empty for now.

### Step 4 — Run the app locally

Open your terminal in the project folder:

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser. The app is running!

### Step 5 — Deploy to Vercel (put it online)

1. Go to https://github.com and create a free account if you don't have one
2. Create a new repository called `smart-money-manager`
3. Upload all your project files to GitHub
4. Go to https://vercel.com and sign in with GitHub
5. Click "New Project" → import your repository
6. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL` → your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
7. Click **Deploy** — done! Your app is live in ~2 minutes.

---

## Adding Stripe Payments (optional, for selling)

1. Create a free account at https://stripe.com
2. Go to **Products** → create a new product called "Smart Money Manager Lifetime"
3. Set a one-time price (e.g. $9.99 or Rp 149.000)
4. Copy the **Price ID** (starts with `price_...`)
5. Go to **Developers → API Keys** and copy your **Publishable key**
6. Add to your `.env` and Vercel environment variables:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   VITE_STRIPE_ONE_TIME_PRICE_ID=price_...
   ```

---

## Project Structure

```
smart-money-manager/
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # App shell with sidebar
│   │   ├── Sidebar.jsx         # Navigation + currency toggle
│   │   └── TransactionModal.jsx # Add/edit transaction form
│   ├── context/
│   │   ├── AuthContext.jsx     # User session management
│   │   └── CurrencyContext.jsx # IDR/USD currency switching
│   ├── lib/
│   │   └── supabase.js         # Supabase client
│   ├── pages/
│   │   ├── Landing.jsx         # Public landing/sales page
│   │   ├── Auth.jsx            # Login + Register
│   │   ├── Dashboard.jsx       # Main overview
│   │   ├── Transactions.jsx    # Full transaction CRUD
│   │   ├── Loans.jsx           # Loan tracker
│   │   ├── Reports.jsx         # Charts & analytics
│   │   └── Settings.jsx        # Profile & preferences
│   ├── App.jsx                 # Routes
│   ├── main.jsx                # Entry point
│   └── index.css               # Global design system
├── supabase-schema.sql         # Run this in Supabase SQL Editor
├── vercel.json                 # Vercel SPA routing config
├── .env.example                # Copy to .env and fill in keys
└── package.json
```

---

## Features

- Register/Login with email (Supabase Auth)
- Add, edit, delete income & expenses
- Category breakdown with visual charts
- Loan tracker with progress bars and monthly payment info
- Monthly & yearly reports
- Multi-currency: IDR and USD
- Each user sees only their own data (Row Level Security)
- Mobile-friendly layout

---

## Switching to Monthly Subscription (later)

When you're ready to switch from one-time to subscription:
1. In Stripe, create a new Product with a **recurring** price
2. Update `VITE_STRIPE_ONE_TIME_PRICE_ID` with the new subscription Price ID
3. That's it — the payment flow is the same

---

## Security

- All data is protected by Supabase Row Level Security (RLS)
- Users can only access their own data — enforced at the database level
- Passwords are handled entirely by Supabase (never stored in your code)
- Environment variables keep your API keys safe

---

Built with ❤️ — Smart Money Manager
