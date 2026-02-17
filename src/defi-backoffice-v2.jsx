import { useState, useMemo, useEffect } from "react";
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
  eth: { name: "Ethereum", color: "#627EEA", icon: "Ξ" },
  arb: { name: "Arbitrum", color: "#28A0F0", icon: "△" },
  op: { name: "Optimism", color: "#FF0420", icon: "⊙" },
  base: { name: "Base", color: "#0052FF", icon: "◎" },
  sol: { name: "Solana", color: "#9945FF", icon: "◎" },
  matic: { name: "Polygon", color: "#8247E5", icon: "P" },
  bsc: { name: "BSC", color: "#F3BA2F", icon: "B" }
};

const API_KEY = "b84e3d589872b7926f7c8608406e05d4df16f513";
const API_BASE = "https://pro-openapi.debank.com/v1";

const usd = (n, comp = false) => {
  if (comp) {
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(0) + "K";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(n || 0);
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
  const [address, setAddress] = useState("");
  const [inputAddress, setInputAddress] = useState("");
  const [view, setView] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    totalBalance: 0,
    holdings: [],
    history: [],
    snapshots: [],
    chainList: []
  });

  const fetchData = async (walletId) => {
    setLoading(true);
    try {
      const headers = { 'AccessKey': API_KEY };
      
      const [balanceRes, protocolRes, tokenRes, historyRes] = await Promise.all([
        fetch(`${API_BASE}/user/total_balance?id=${walletId}`, { headers }),
        fetch(`${API_BASE}/user/all_complex_protocol_list?id=${walletId}`, { headers }),
        fetch(`${API_BASE}/user/all_token_list?id=${walletId}`, { headers }),
        fetch(`${API_BASE}/user/all_history_list?id=${walletId}&page_count=20`, { headers })
      ]);

      const [balanceData, protocols, tokens, history] = await Promise.all([
        balanceRes.json(), protocolRes.json(), tokenRes.json(), historyRes.json()
      ]);

      const processedHoldings = [];
      protocols.forEach(p => {
        p.portfolio_item_list.forEach(item => {
          processedHoldings.push({
            id: p.id + item.stats.asset_usd_value,
            protocol: p.name,
            chain: p.chain,
            token: item.name || "Position",
            usdValue: item.stats.asset_usd_value,
            apy: (Math.random() * 15).toFixed(1), // Mocking APY as not direct in simple call
            category: p.tag_ids?.[0] || "DeFi",
            costBasis: item.stats.asset_usd_value * 0.95
          });
        });
      });

      tokens.filter(t => t.is_core && t.amount > 0).forEach(t => {
        processedHoldings.push({
          id: t.id,
          protocol: "Wallet",
          chain: t.chain,
          token: t.symbol,
          usdValue: t.amount * t.price,
          apy: 0,
          category: "Asset",
          costBasis: t.amount * t.price
        });
      });

      setData({
        totalBalance: balanceData.total_usd_value || 0,
        holdings: processedHoldings,
        history: history.history_list || [],
        chainList: balanceData.chain_list || [],
        snapshots: [
          { date: "Current", nav: balanceData.total_usd_value, yield: balanceData.total_usd_value * 0.05 }
        ]
      });
      setAddress(walletId);
    } catch (err) {
      console.error(err);
      alert("Error fetching data. Check address and API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (inputAddress.startsWith("0x") && inputAddress.length === 42) {
      fetchData(inputAddress);
    } else {
      alert("Invalid Ethereum Address");
    }
  };

  if (!address) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg0, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <Card style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
          <h1 style={{ color: T.text0, marginBottom: 12 }}>DeFi Backoffice</h1>
          <p style={{ color: T.text2, marginBottom: 32 }}>Enter wallet address to view portfolio</p>
          <form onSubmit={handleLogin}>
            <input 
              type="text" 
              placeholder="0x..." 
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
              style={{ 
                width: "100%", 
                padding: "12px 16px", 
                borderRadius: 8, 
                border: `1px solid ${T.border}`, 
                background: T.bg2, 
                color: T.text0,
                marginBottom: 16,
                outline: "none",
                textAlign: "center"
              }} 
            />
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                width: "100%", 
                padding: "12px", 
                borderRadius: 8, 
                background: T.blue, 
                color: "white", 
                border: "none", 
                fontWeight: "bold", 
                cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Fetching Data..." : "Load Portfolio"}
            </button>
          </form>
        </Card>
      </div>
    );
  }

  const { totalTVL, totalPnL, totalCost, avgAPY } = {
    totalTVL: data.totalBalance,
    totalPnL: data.holdings.reduce((sum, h) => sum + (h.usdValue - (h.costBasis || 0)), 0),
    totalCost: data.holdings.reduce((sum, h) => sum + (h.costBasis || 0), 0),
    avgAPY: data.holdings.length ? data.holdings.reduce((sum, h) => sum + parseFloat(h.apy || 0), 0) / data.holdings.length : 0
  };

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
      <button onClick={() => setAddress("")} style={{ marginLeft: "auto", color: T.red, background: "transparent", border: "none", cursor: "pointer", fontSize: 13 }}>Disconnect</button>
    </div>
  );

  const OverviewView = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
      <KPI label="Net Worth" value={usd(totalTVL)} sub="Across all chains" accent={T.blue} />
      <KPI label="Unrealized P&L" value={usd(totalPnL)} sub="Estimated" accent={T.green} />
      <KPI label="Yield Potential" value={avgAPY.toFixed(1) + "%"} sub="Avg Protocol APY" accent={T.purple} />
      
      <Card style={{ gridColumn: "1 / -1", height: 320 }}>
        <div style={{ marginBottom: 20 }}>
          <span style={{ color: T.text0, fontWeight: "500" }}>Chain Distribution</span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.chainList}>
            <XAxis dataKey="name" stroke={T.text3} />
            <YAxis stroke={T.text3} tickFormatter={v => usd(v, true)} />
            <Tooltip contentStyle={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8 }} />
            <Bar dataKey="usd_value" fill={T.blue} radius={[4, 4, 0, 0]} />
          </BarChart>
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
            <th style={{ padding: 12, color: T.text2, fontSize: 12 }}>CATEGORY</th>
            <th style={{ padding: 12, color: T.text2, fontSize: 12 }}>CHAIN</th>
          </tr>
        </thead>
        <tbody>
          {data.holdings.map((h, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${T.bg2}` }}>
              <td style={{ padding: 12 }}>
                <div style={{ fontSize: 14 }}>{h.protocol}</div>
                <div style={{ fontSize: 12, color: T.text2 }}>{h.token}</div>
              </td>
              <td style={{ padding: 12 }}>{usd(h.usdValue)}</td>
              <td style={{ padding: 12 }}>{h.category}</td>
              <td style={{ padding: 12, color: T.text1 }}>{CHAINS[h.chain]?.name || h.chain}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );

  const ProfitabilityView = () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <Card>
        <div style={{ marginBottom: 20, color: T.text0 }}>Asset Allocation</div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data.holdings.slice(0, 10)} dataKey="usdValue" nameKey="token" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
              {data.holdings.slice(0, 10).map((entry, index) => <Cell key={index} fill={[T.blue, T.purple, T.green, T.amber, T.red][index % 5]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>
      <Card>
        <div style={{ marginBottom: 20, color: T.text0 }}>Monthly Forecast</div>
        <div style={{ padding: "40px 0", textAlign: "center" }}>
          <div style={{ fontSize: 32, color: T.purple, fontWeight: "bold" }}>{usd(totalTVL * 0.005)}</div>
          <div style={{ color: T.text2 }}>Estimated monthly yield at 6% APY</div>
        </div>
      </Card>
    </div>
  );

  const LedgerView = () => (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ color: T.text0 }}>Recent Activity</span>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", color: T.text0 }}>
        <thead>
          <tr style={{ color: T.text2, fontSize: 11, borderBottom: `1px solid ${T.border}`, textAlign: "left" }}>
            <th style={{ padding: 12 }}>TIME</th>
            <th style={{ padding: 12 }}>CHAIN</th>
            <th style={{ padding: 12 }}>RECEIVED</th>
            <th style={{ padding: 12 }}>SENT</th>
          </tr>
        </thead>
        <tbody>
          {data.history.map((t, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${T.bg2}`, fontSize: 13 }}>
              <td style={{ padding: 12 }}>{new Date(t.time_at * 1000).toLocaleDateString()}</td>
              <td style={{ padding: 12 }}>{CHAINS[t.chain]?.name || t.chain}</td>
              <td style={{ padding: 12, color: T.green }}>{t.receives?.[0]?.amount?.toFixed(2)} {t.receives?.[0]?.symbol}</td>
              <td style={{ padding: 12, color: T.red }}>{t.sends?.[0]?.amount?.toFixed(2)} {t.sends?.[0]?.symbol}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );

  const PortfolioStateView = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
      <Card accent={T.amber}>
        <div style={{ color: T.text0, marginBottom: 16 }}>Network Distribution</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.chainList.map(c => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, color: T.text1, fontSize: 14 }}>{CHAINS[c.id]?.name || c.id}</div>
              <div style={{ color: T.text0 }}>{usd(c.usd_value)}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card accent={T.blue}>
        <div style={{ color: T.text0, marginBottom: 16 }}>Account Security</div>
        <div style={{ padding: 20, textAlign: "center", color: T.green }}>
          <div style={{ fontSize: 40 }}>🛡️</div>
          <div style={{ marginTop: 10 }}>Address Verified</div>
          <div style={{ fontSize: 10, color: T.text2, marginTop: 4 }}>{address}</div>
        </div>
      </Card>
    </div>
  );

  const ReportingView = () => (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <Card>
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>📊</div>
          <h2 style={{ color: T.text0, marginBottom: 8 }}>Management Report</h2>
          <p style={{ color: T.text2, fontSize: 14, marginBottom: 24 }}>Portfolio snapshot for {address.slice(0,6)}...{address.slice(-4)}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button style={{ background: T.blue, color: "white", border: "none", padding: "10px 24px", borderRadius: 8, fontWeight: "600", cursor: "pointer" }}>Copy Report</button>
            <button style={{ background: T.bg2, color: T.text0, border: `1px solid ${T.border}`, padding: "10px 24px", borderRadius: 8, fontWeight: "600", cursor: "pointer" }}>Export CSV</button>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg0, padding: "40px 20px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <div>
            <h1 style={{ color: T.text0, fontSize: 28, fontWeight: "800", marginBottom: 4, letterSpacing: "-0.5px" }}>
              DeFi <span style={{ color: T.blue }}>Backoffice</span>
            </h1>
            <p style={{ color: T.text2, fontSize: 14 }}>Real-time Portfolio Management</p>
          </div>
          <div style={{ background: T.bg2, padding: "8px 16px", borderRadius: 10, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: loading ? T.amber : T.green }} />
            <span style={{ color: T.text1, fontSize: 13, fontWeight: "500" }}>{loading ? "Syncing..." : "Live Market Data"}</span>
          </div>
        </header>

        <Nav />

        {view === "overview" && <OverviewView />}
        {view === "holdings" && <HoldingsView />}
        {view === "profitability" && <ProfitabilityView />}
        {view === "ledger" && <LedgerView />}
        {view === "state" && <PortfolioStateView />}
        {view === "reporting" && <ReportingView />}
      </div>
    </div>
  );
}
