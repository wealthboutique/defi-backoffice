# DeFi Backoffice v3 - Deployment Guide

## 📋 Required Services & Accounts

### 1. **Blockchain Data APIs**

#### DeBank Pro API (Primary)
- **Website**: https://cloud.debank.com/open-api
- **Status**: API key exists (`b84e3d589872b7926f7c8608406e05d4df16f513`)
- **Action Required**: Purchase API credits
  - Minimum: 1,000 units (~$10)
  - Recommended: 10,000 units (~$90) for 1 month
  - Free trial: Contact hello.cloud@debank.com for 14-day trial
- **Rate Limit**: 100 requests/second
- **Coverage**: ETH, ARB, OP, BASE, Polygon, Solana, Cosmos, Avalanche, BSC

#### Covalent API (Supplementary)
- **Website**: https://www.covalenthq.com/
- **Plan**: Free tier (100K credits/month)
- **Action Required**: Create account & get API key
- **Use Case**: Additional networks (TON, Sui, Aptos, Near)

#### CoinGecko API (Price Data)
- **Website**: https://www.coingecko.com/en/api/pricing
- **Plan**: Free tier (10-50 calls/min)
- **Action Required**: Sign up for API key
- **Use Case**: Historical price data, token metadata

### 2. **Database & Backend**

#### Supabase (RECOMMENDED)
- **Website**: https://supabase.com/
- **Plan**: Free tier
  - 500MB database
  - 2GB bandwidth/month
  - 50,000 monthly active users
  - Unlimited API requests
- **Features**:
  - PostgreSQL database
  - Real-time subscriptions
  - Built-in authentication
  - Auto-generated REST API
  - Row Level Security (RLS)
- **Action Required**:
  1. Create Supabase account
  2. Create new project: `defi-backoffice-prod`
  3. Save connection credentials
  4. Run database schema (see below)

**Alternative Options**:
- **Firebase** (Google): Easier but more expensive
- **PlanetScale**: MySQL, generous free tier
- **MongoDB Atlas**: NoSQL approach

### 3. **Hosting & CI/CD**

#### GitHub Pages (Current)
- **Status**: ✅ Already configured
- **URL**: https://wealthboutique.github.io/defi-backoffice/
- **Cost**: Free
- **Limitations**: Static site only (no backend)

#### GitHub Actions
- **Status**: ✅ Configured for auto-deployment
- **Cost**: Free for public repos
- **File**: `.github/workflows/deploy.yml`

---

## 🗄️ Database Schema

### Supabase Tables

```sql
-- Wallets table
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address VARCHAR(42) UNIQUE NOT NULL,
  label VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID REFERENCES wallets(id),
  tx_hash VARCHAR(66) UNIQUE NOT NULL,
  chain VARCHAR(20) NOT NULL,
  from_address VARCHAR(42),
  to_address VARCHAR(42),
  token_address VARCHAR(42),
  token_symbol VARCHAR(20),
  amount NUMERIC(38, 18),
  usd_value NUMERIC(20, 2),
  tx_type VARCHAR(20), -- 'deposit', 'withdrawal', 'swap', 'internal'
  timestamp TIMESTAMP NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Positions table (for tracking investments)
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID REFERENCES wallets(id),
  protocol VARCHAR(50) NOT NULL,
  chain VARCHAR(20) NOT NULL,
  token VARCHAR(20),
  amount NUMERIC(38, 18),
  usd_value NUMERIC(20, 2),
  initial_investment NUMERIC(20, 2),
  expected_apy NUMERIC(5, 2),
  category VARCHAR(30), -- 'Lending', 'Staking', 'DEX LP', etc.
  opened_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Historical snapshots
CREATE TABLE portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_usd NUMERIC(20, 2),
  invested_usd NUMERIC(20, 2),
  snapshot_date DATE UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- APY history
CREATE TABLE apy_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  protocol VARCHAR(50) NOT NULL,
  chain VARCHAR(20) NOT NULL,
  apy NUMERIC(5, 2),
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(protocol, chain, date)
);

-- Indexes for performance
CREATE INDEX idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX idx_transactions_chain ON transactions(chain);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX idx_positions_wallet ON positions(wallet_id);
CREATE INDEX idx_apy_history_lookup ON apy_history(protocol, chain, date DESC);
```

---

## 🔧 Environment Variables

Create `.env.local` file in project root:

```env
# DeBank API
VITE_DEBANK_API_KEY=b84e3d589872b7926f7c8608406e05d4df16f513
VITE_DEBANK_BASE_URL=https://pro-openapi.debank.com

# Covalent API
VITE_COVALENT_API_KEY=your_covalent_key_here

# CoinGecko API
VITE_COINGECKO_API_KEY=your_coingecko_key_here

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Feature flags
VITE_ENABLE_REAL_API=true
VITE_ENABLE_MULTI_WALLET=true
```

**⚠️ Security Note**: Never commit `.env.local` to Git. It's already in `.gitignore`.

For GitHub Pages deployment, add these as **Repository Secrets**:
1. Go to Settings → Secrets and variables → Actions
2. Add each variable as a secret
3. Update `.github/workflows/deploy.yml` to inject them

---

## 📦 Dependencies to Add

Update `package.json`:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "axios": "^1.6.5",
    "date-fns": "^3.3.1",
    "recharts": "^2.10.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-query": "^3.39.3"
  }
}
```

Install:
```bash
npm install @supabase/supabase-js axios date-fns react-query
```

---

## 🚀 Deployment Steps

### Step 1: Setup Supabase
1. Create account at https://supabase.com/
2. Create new project: `defi-backoffice-prod`
3. Go to SQL Editor and run the schema above
4. Go to Settings → API to get:
   - Project URL
   - Anon/Public key
5. Add to `.env.local`

### Step 2: Get API Keys
1. **DeBank**: Purchase credits at https://cloud.debank.com/pricing
2. **Covalent**: Sign up at https://www.covalenthq.com/platform/
3. **CoinGecko**: Get free key at https://www.coingecko.com/en/api

### Step 3: Configure GitHub Secrets
```bash
# In repository Settings → Secrets → Actions, add:
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_DEBANK_API_KEY
VITE_COVALENT_API_KEY
VITE_COINGECKO_API_KEY
```

### Step 4: Deploy
```bash
# Local development
npm install
npm run dev

# Build and preview
npm run build
npm run preview

# Deploy (automatic on push to main)
git add .
git commit -m "feat: Add full database integration and multi-wallet support"
git push origin main

# GitHub Actions will auto-deploy to:
# https://wealthboutique.github.io/defi-backoffice/
```

---

## 📊 New Features Implemented

### ✅ Multi-Wallet Support
- Add/remove multiple wallet addresses
- Consolidated portfolio view
- Per-wallet breakdown

### ✅ Transaction Tracking
- Automatic transaction history from DeBank
- Classification (deposits, withdrawals, swaps)
- Internal transfer detection
- Double-counting prevention

### ✅ ROI Calculations
- Return on Invested Capital (ROIC)
- Time-Weighted Return (TWR)
- Realized vs Unrealized P&L
- Per-protocol ROI

### ✅ Historical Data
- Daily portfolio snapshots
- APY trends (7d, 15d, 30d)
- Protocol performance over time

### ✅ Additional Networks
- Sui (via Covalent)
- TON (via Covalent)
- Aptos (via Covalent)
- Near (via Covalent)

### ✅ Gas Monitoring
- Native token balances per chain
- Low balance alerts
- Estimated gas costs

### ✅ Enhanced Reporting
- PDF export
- CSV export
- Email reports (optional)
- Custom date ranges

---

## 🔒 Security Considerations

1. **API Keys**: Store in environment variables, never in code
2. **Supabase RLS**: Enable Row Level Security policies
3. **Rate Limiting**: Implement caching to avoid API limits
4. **CORS**: Configure Supabase to allow your domain
5. **Authentication**: Optional - add Supabase Auth for multi-user

---

## 📝 Maintenance

### Daily
- Automatic portfolio snapshots (via cron)
- Transaction sync (on page load)

### Weekly
- APY history updates
- Gas balance checks

### Monthly
- Database cleanup (old snapshots)
- API usage review
- Cost optimization

---

## 💰 Cost Estimate

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| Supabase | Free tier | $0 |
| DeBank API | 10K units | ~$90 |
| Covalent | Free tier | $0 |
| CoinGecko | Free tier | $0 |
| GitHub Pages | Free | $0 |
| **Total** | | **~$90/month** |

**Note**: DeBank is the only paid service. For lower usage, can reduce to 1K units (~$10/month).

---

## 🆘 Troubleshooting

### "DeBank API rate limit exceeded"
- Implement caching layer
- Reduce polling frequency
- Purchase more units

### "Supabase connection failed"
- Check API keys in .env.local
- Verify project URL
- Check CORS settings

### "Transactions not syncing"
- Verify wallet address format
- Check DeBank API credits
- Review console logs

---

## 📞 Support Contacts

- **DeBank Support**: hello.cloud@debank.com
- **Supabase Support**: https://supabase.com/docs
- **Project Issues**: GitHub Issues tab

---

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Multi-wallet support
- ✅ Transaction tracking
- ✅ Database integration

### Phase 2 (Next)
- ⬜ Mobile responsive design
- ⬜ Real-time WebSocket updates
- ⬜ Advanced analytics

### Phase 3 (Future)
- ⬜ Multi-user support
- ⬜ Trading signals
- ⬜ Automated rebalancing suggestions

---

**Last Updated**: February 16, 2026  
**Version**: 3.0.0  
**Maintainer**: Wealth Boutique OÜ
