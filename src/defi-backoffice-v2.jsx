import { useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const T = {
  bg0: "#03070F", bg1: "#080F1E", bg2: "#0C1628", bg3: "#101E35",
  border: "#152035", text0: "#EDF2FF", text1: "#9DB4D6", text2: "#526680",
  text3: "#2E4060", green: "#00E5A0", red: "#FF3B6A", amber: "#FFB020",
  blue: "#4E9EFF", purple: "#A855F7"
};

const CHAINS = {
  ethereum: { name: "Ethereum", color: "#627EEA", icon: "Ξ" },
  arbitrum: { name: "Arbitrum", color: "#28A0F0", icon: "△" },
  optimism: { name: "Optimism", color: "#FF0420", icon: "⊙" },
  base: { name: "Base", color: "#0052FF", icon: "◎" },
  solana: { name: "Solana", color: "#9945FF", icon: "◎" }
};

const HOLDINGS_DEMO = [
  { id: 1, protocol: "Aave V3", chain: "ethereum", token: "aUSDC", usdValue: 2450000, apy: 4.2, category: "Lending", risk: "Low", costBasis: 2380000 },
  { id: 2, protocol: "Lido", chain: "ethereum", token: "stETH", usdValue: 3112000, apy: 3.9, category: "Staking", risk: "Low", costBasis: 2800000 },
  { id: 3, protocol: "Curve", chain: "ethereum", token: "3CRV", usdValue: 1780000, apy: 5.8, category: "DEX LP", risk: "Low", costBasis: 1750000 },
  { id: 4, protocol: "Uniswap", chain: "arbitrum", token: "ETH/USDC", usdValue: 1200000, apy: 18.7, category: "DEX LP", risk: "Medium", costBasis: 1050000 },
  { id: 5, protocol: "GMX V2", chain: "arbitrum", token: "GM", usdValue: 890000, apy: 22.1, category: "DEX LP", risk: "High", costBasis: 820000 }
];

const TRANSACTIONS = [
  { id: 1, date: "2024-02-15", type: "Deposit", protocol: "Aave V3", chain: "ethereum", token: "USDC", amount: 2380000, usdValue: 2380000, fee: 45, category: "Entry" },
  { id: 2, date: "2024-02-10", type: "Yield", protocol: "Lido", chain: "ethereum", token: "stETH", amount: 1.2, usdValue: 3400, fee: 12, category: "Income" },
  { id: 3, date: "2024-01-20", type: "Airdrop", protocol: "Jupiter", chain: "solana", token: "JUP", amount: 55000, usdValue: 82500, fee: 0, category: "Airdrop" }
];

const SNAPSHOTS = [
  { date: "Q3 '23", nav: 12000000, yield: 450000 },
  { date: "Q4 '23", nav: 14500000, yield: 520000 },
  { date: "Q1 '24", nav: 17800000, yield: 680000 },
  { date: "Q2 '24", nav: 18200000, yield: 710000 }
];

const usd = (n, comp = false) => {
  if (comp) {
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(0) + "K";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(n);
};

function Card({ children, accent, style }) {
  return (
    <div style={{
      background: T.bg1,
      border: `1px solid ` + (accent ? accent + '40' : T.border),
      borderRadius: 12,
      padding: 20,
      position: "relative",
      overflow: "hidden",
      ...style
    }}>
      {accent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accent }} />}
      {children}
    </div>
  );
}

function KPI({ label, value, sub, accent }) {
  return (
    <Card accent={accent}>
      <div style={{ fontSize: 10, color: T.text2, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: "bold", color: T.text0, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: accent || T.text1 }}>{sub}</div>
    </Card>
  );
}

export default function DeFiBackoffice() {
  const [view, setView] = useState("overview");

  const { totalTVL, totalPnL, totalCost, avgAPY } = useMemo(() => {
    const val = HOLDINGS_DEMO.reduce((sum, h) => sum + h.usdValue, 0);
    const cost = HOLDINGS_DEMO.reduce((sum, h) => sum + h.costBasis, 0);
    const apy = HOLDINGS_DEMO.reduce((sum, h) => sum + (h.apy * h.usdValue), 0) / val;
    return { totalTVL: val, totalPnL: val - cost, totalCost: cost, avgAPY: apy };
  }, []);

  const Nav = () => (
    <div style={{ display: "flex", gap: 12, marginBottom: 32, padding: "0 4px", overflowX: "auto" }}>
      {[
        { id: "overview", label: "Overview" },
        { id: "holdings", label: "Holdings & P&L" },
        { id: "profitability", label: "Profitability" },
        { id: "ledger", label: "Ledger" },
        { id: "state", label: "Portfolio State" },
        { id: "reporting", label: "Reporting" }
      ].map(b => (
        <button
          key={b.id}
          onClick={() => setView(b.id)}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: "500",
            background: view === b.id ? T.blue + '20' : "transparent",
            color: view === b.id ? T.blue : T.text1,
            transition: "all 0.2s"
          }}
        >
          {b.label}
        </button>
      ))}
    </div>
  );

  const OverviewView = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
      <KPI label="Total NAV" value={usd(totalTVL)} sub="+2.4% vs last week" accent={T.blue} />
      <KPI label="Total P&L" value={usd(totalPnL)} sub={((totalPnL/totalCost)*100).toFixed(1) + "% ROI"} accent={T.green} />
      <KPI label="Average APY" value={avgAPY.toFixed(1) + "%"} sub="Weighted by size" accent={T.purple} />
      
      <Card style={{ gridColumn: "1 / -1", height: 320 }}>
        <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: T.text0, fontWeight: "500" }}>NAV Growth & Yield History</span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={SNAPSHOTS}>
            <defs>
              <linearGradient id="colorNav" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={T.blue} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={T.blue} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke={T.text3} />
            <YAxis stroke={T.text3} tickFormatter={v => usd(v, true)} />
            <Tooltip contentStyle={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8 }} />
            <Area type="monotone" dataKey="nav" stroke={T.blue} fillOpacity={1} fill="url(#colorNav)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );

  const HoldingsView = () => (
    <Card>
      <table style={{ width: "100%", borderCollapse: "collapse", color: T.text0 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${T.border}`, textAlign: "left" }}>
            <th style={{ padding: 12, color: T.text2, fontSize: 12 }}>PROTOCOL</th>
            <th style={{ padding: 12, color: T.text2, fontSize: 12 }}>VALUE</th>
            <th style={{ padding: 12, color: T.text2, fontSize: 12 }}>P&L</th>
            <th style={{ padding: 12, color: T.text2, fontSize: 12 }}>APY</th>
          </tr>
        </thead>
        <tbody>
          {HOLDINGS_DEMO.map(h => (
            <tr key={h.id} style={{ borderBottom: `1px solid ${T.bg2}` }}>
              <td style={{ padding: 12 }}>
                <div style={{ fontSize: 14 }}>{h.protocol}</div>
                <div style={{ fontSize: 12, color: T.text2 }}>{h.token} • {CHAINS[h.chain].name}</div>
              </td>
              <td style={{ padding: 12 }}>{usd(h.usdValue)}</td>
              <td style={{ padding: 12, color: h.usdValue > h.costBasis ? T.green : T.red }}>
                {usd(h.usdValue - h.costBasis)}
              </td>
              <td style={{ padding: 12, color: T.purple }}>{h.apy}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );

  const ProfitabilityView = () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <Card>
        <div style={{ marginBottom: 20, color: T.text0 }}>Yield Contribution by Asset</div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={HOLDINGS_DEMO} dataKey="usdValue" nameKey="token" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
              {HOLDINGS_DEMO.map((entry, index) => <Cell key={index} fill={[T.blue, T.purple, T.green, T.amber, T.red][index % 5]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>
      <Card>
        <div style={{ marginBottom: 20, color: T.text0 }}>Monthly Revenue Forecast</div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={SNAPSHOTS}>
            <XAxis dataKey="date" stroke={T.text3} />
            <YAxis stroke={T.text3} tickFormatter={v => usd(v, true)} />
            <Tooltip cursor={{ fill: T.bg2 }} />
            <Bar dataKey="yield" fill={T.purple} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );

  const LedgerView = () => (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ color: T.text0 }}>Recent Activity</span>
        <button style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.text1, padding: "4px 12px", borderRadius: 6, fontSize: 12 }}>Export CSV</button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", color: T.text0 }}>
        <thead>
          <tr style={{ color: T.text2, fontSize: 11, borderBottom: `1px solid ${T.border}`, textAlign: "left" }}>
            <th style={{ padding: 12 }}>DATE</th>
            <th style={{ padding: 12 }}>TYPE</th>
            <th style={{ padding: 12 }}>ASSET</th>
            <th style={{ padding: 12 }}>AMOUNT</th>
            <th style={{ padding: 12 }}>FEE</th>
          </tr>
        </thead>
        <tbody>
          {TRANSACTIONS.map(t => (
            <tr key={t.id} style={{ borderBottom: `1px solid ${T.bg2}`, fontSize: 13 }}>
              <td style={{ padding: 12 }}>{t.date}</td>
              <td style={{ padding: 12 }}>
                <span style={{ padding: "2px 8px", borderRadius: 4, background: t.type === "Deposit" ? T.green + '20' : T.blue + '20', color: t.type === "Deposit" ? T.green : T.blue }}>
                  {t.type}
                </span>
              </td>
              <td style={{ padding: 12 }}>{t.token}</td>
              <td style={{ padding: 12 }}>{usd(t.usdValue)}</td>
              <td style={{ padding: 12, color: T.text2 }}>${t.fee}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );

  const PortfolioStateView = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
      <Card accent={T.amber}>
        <div style={{ color: T.text0, marginBottom: 16 }}>Current Asset Allocation</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {["Stablecoins", "LSTs", "LPs", "Governance"].map((cat, i) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: [T.blue, T.purple, T.green, T.amber][i] }} />
              <div style={{ flex: 1, color: T.text1, fontSize: 14 }}>{cat}</div>
              <div style={{ color: T.text0 }}>{[45, 25, 20, 10][i]}%</div>
            </div>
          ))}
        </div>
      </Card>
      <Card accent={T.blue}>
        <div style={{ color: T.text0, marginBottom: 16 }}>Network Distribution</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Object.values(CHAINS).map(c => (
            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 16 }}>{c.icon}</div>
              <div style={{ flex: 1, color: T.text1, fontSize: 14 }}>{c.name}</div>
              <div style={{ color: T.text0 }}>{(Math.random() * 50 + 10).toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const ReportingView = () => {
    const copyReport = () => {
      const text = "Portfolio Report\
NAV: " + usd(totalTVL) + "\
P&L: " + usd(totalPnL) + " (" + ((totalPnL/totalCost)*100).toFixed(1) + "%)";
      navigator.clipboard.writeText(text);
      alert("Report copied to clipboard!");
    };

    return (
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <Card>
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 20 }}>📊</div>
            <h2 style={{ color: T.text0, marginBottom: 8 }}>Generate Management Report</h2>
            <p style={{ color: T.text2, fontSize: 14, marginBottom: 24 }}>Create a snapshot of current performance for stakeholders.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={copyReport} style={{ background: T.blue, color: "white", border: "none", padding: "10px 24px", borderRadius: 8, fontWeight: "600", cursor: "pointer" }}>Copy Quick Report</button>
              <button style={{ background: T.bg2, color: T.text0, border: `1px solid ${T.border}`, padding: "10px 24px", borderRadius: 8, fontWeight: "600", cursor: "pointer" }}>Download PDF</button>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg0, padding: "40px 20px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <div>
            <h1 style={{ color: T.text0, fontSize: 28, fontWeight: "800", marginBottom: 4, letterSpacing: "-0.5px" }}>
              DeFi <span style={{ color: T.blue }}>Backoffice</span>
            </h1>
            <p style={{ color: T.text2, fontSize: 14 }}>Institutional Grade Portfolio Management</p>
          </div>
          <div style={{ background: T.bg2, padding: "8px 16px", borderRadius: 10, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.green }} />
            <span style={{ color: T.text1, fontSize: 13, fontWeight: "500" }}>Live Market Data</span>
          </div>
        </header>

        <Nav />

        {view === "overview" &amp;&amp; <OverviewView />}
        {view === "holdings" &amp;&amp; <HoldingsView />}
        {view === "profitability" &amp;&amp; <ProfitabilityView />}
        {view === "ledger" &amp;&amp; <LedgerView />}
        {view === "state" &amp;&amp; <PortfolioStateView />}
        {view === "reporting" &amp;&amp; <ReportingView />}
      </div>
    </div>
  );
}
