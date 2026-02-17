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
    if (n >= 1e6) return `$` + (n / 1e6).toFixed(1) + "M";
    if (n >= 1e3) return `$` + (n / 1e3).toFixed(0) + "K";
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
};

function Card({ children, accent, style }) {
  return (
    <div style={{ background: T.bg1, border: `1px solid ` + (accent ? accent + '40' : T.border), borderRadius: 12, padding: 20, position: "relative", overflow: "hidden", ...style }}>
      {accent && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accent }} />}
      {children}
    </div>
  );
}

function KPI({ label, value, sub, accent }) {
  return (
    <Card accent={accent}>
      <div style={{ fontSize: 10, color: T.text2, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: T.text0, fontFamily: "monospace" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: accent || T.text2, marginTop: 4 }}>{sub}</div>}
    </Card>
  );
}

const TTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.bg2, border: `1px solid ` + T.border, borderRadius: 8, padding: 10, fontSize: 12 }}>
      <div style={{ color: T.text1, fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color }}>{p.name}: {usd(p.value)}</div>)}
    </div>
  );
};

export default function App() {
  const [view, setView] = useState("overview");
  const totalTVL = useMemo(() => HOLDINGS_DEMO.reduce((s, h) => s + h.usdValue, 0), []);
  const totalCost = useMemo(() => HOLDINGS_DEMO.reduce((s, h) => s + h.costBasis, 0), []);
  const totalPnL = totalTVL - totalCost;

  const copyReport = () => {
    const text = "Portfolio Report
NAV: " + usd(totalTVL) + "
P&L: " + usd(totalPnL) + " (" + ((totalPnL/totalCost)*100).toFixed(1) + "%)
Positions: " + HOLDINGS_DEMO.length;
    navigator.clipboard.writeText(text);
    alert("Report copied!");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg0, color: T.text1, fontFamily: "sans-serif" }}>
      <aside style={{ width: 220, background: T.bg1, borderRight: `1px solid ` + T.border, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 20, fontSize: 18, fontWeight: 900, color: T.text0, borderBottom: `1px solid ` + T.border }}>DefiVault</div>
        <nav style={{ padding: 10, flex: 1 }}>
          {[
            { id: "overview", label: "Overview", icon: "◈" },
            { id: "holdings", label: "Holdings", icon: "▦" },
            { id: "profit", label: "Profitability", icon: "↗" },
            { id: "ledger", label: "Ledger", icon: "⇄" },
            { id: "report", label: "Reports", icon: "≡" }
          ].map(n => (
            <button key={n.id} onClick={() => setView(n.id)} style={{
              width: "100%", padding: "10px 12px", borderRadius: 8, marginBottom: 4, textAlign: "left", cursor: "pointer",
              background: view === n.id ? T.blue + "20" : "transparent", border: "none", color: view === n.id ? T.blue : T.text2,
              fontWeight: view === n.id ? 700 : 400, fontSize: 14, transition: "all 0.2s"
            }}>{n.icon} {n.label}</button>
          ))}
        </nav>
      </aside>

      <main style={{ flex: 1, padding: 30, maxWidth: 1200 }}>
        {view === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 15, marginBottom: 25 }}>
              <KPI label="Total NAV" value={usd(totalTVL, true)} sub="Current Balance" accent={T.blue} />
              <KPI label="Unrealized P&L" value={usd(totalPnL, true)} sub={((totalPnL/totalCost)*100).toFixed(1) + "% ROI"} accent={totalPnL >= 0 ? T.green : T.red} />
              <KPI label="Monthly Yield" value={usd(totalTVL * 0.005, true)} sub="~6% APY Est." accent={T.purple} />
              <KPI label="Risk Level" value="Low" sub="85% Audited" accent={T.amber} />
            </div>
            <Card style={{ marginBottom: 25 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.text0, marginBottom: 20 }}>Portfolio Growth</div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={SNAPSHOTS}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: T.text3 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: T.text3 }} axisLine={false} tickLine={false} tickFormatter={v => usd(v, true)} />
                  <Tooltip content={<TTip />} />
                  <Area type="monotone" dataKey="nav" stroke={T.blue} fill={T.blue + "20"} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {view === "holdings" && (
          <Card style={{ padding: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ` + T.border }}>
                  {["Protocol", "Chain", "Asset", "Value", "PnL", "APY"].map(h => (
                    <th key={h} style={{ padding: "15px 20px", fontSize: 10, color: T.text2, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOLDINGS_DEMO.map((h, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ` + T.border + "40" }}>
                    <td style={{ padding: "15px 20px", color: T.text0, fontWeight: 700 }}>{h.protocol}</td>
                    <td style={{ padding: "15px 20px", color: T.text1 }}>{h.chain}</td>
                    <td style={{ padding: "15px 20px", color: T.text1 }}>{h.token}</td>
                    <td style={{ padding: "15px 20px", color: T.text0 }}>{usd(h.usdValue)}</td>
                    <td style={{ padding: "15px 20px", color: h.usdValue >= h.costBasis ? T.green : T.red }}>{usd(h.usdValue - h.costBasis)}</td>
                    <td style={{ padding: "15px 20px", color: T.green, fontWeight: 700 }}>{h.apy}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {view === "profit" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card>
              <div style={{ marginBottom: 15, fontWeight: 700 }}>Profit by Category</div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={[
                    { name: 'Lending', value: 45 },
                    { name: 'Staking', value: 30 },
                    { name: 'DEX LP', value: 25 }
                  ]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value">
                    {[T.blue, T.green, T.purple].map((c, i) => <Cell key={i} fill={c} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <div style={{ marginBottom: 15, fontWeight: 700 }}>Monthly Performance</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={SNAPSHOTS}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={v => usd(v, true)} />
                  <Tooltip content={<TTip />} />
                  <Bar dataKey="yield" fill={T.green} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {view === "ledger" && (
          <Card style={{ padding: 0 }}>
            <div style={{ padding: 20, borderBottom: `1px solid ` + T.border }}>
              <input placeholder="Search transactions..." style={{ background: T.bg2, border: `1px solid ` + T.border, padding: "8px 12px", borderRadius: 6, color: T.text0, width: 250 }} />
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ` + T.border }}>
                  {["Date", "Type", "Protocol", "Value", "Fee"].map(h => (
                    <th key={h} style={{ padding: "15px 20px", fontSize: 10, color: T.text2 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TRANSACTIONS.map((t, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ` + T.border + "40" }}>
                    <td style={{ padding: "15px 20px", color: T.text2 }}>{t.date}</td>
                    <td style={{ padding: "15px 20px", color: T.blue }}>{t.type}</td>Implement full portfolio system with all requested modules: tracking, profit, ledger, state, reporting
                    <td style={{ padding: "15px 20px", color: T.text0 }}>{t.protocol}</td>
                    <td style={{ padding: "15px 20px", color: T.text0 }}>{usd(t.usdValue)}</td>
                    <td style={{ padding: "15px 20px", color: T.amber }}>{usd(t.fee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {view === "report" && (
          <Card style={{ textAlign: "center", padding: 40 }}>
            <h2 style={{ marginBottom: 10 }}>Portfolio Status Report</h2>
            <p style={{ color: T.text2, marginBottom: 30 }}>Generated on {new Date().toLocaleDateString()}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 40 }}>
              <div><div style={{ color: T.text3 }}>NAV</div><div style={{ fontSize: 20, fontWeight: 700 }}>{usd(totalTVL)}</div></div>
              <div><div style={{ color: T.text3 }}>ROI</div><div style={{ fontSize: 20, fontWeight: 700, color: T.green }}>{((totalPnL/totalCost)*100).toFixed(1)}%</div></div>
              <div><div style={{ color: T.text3 }}>Positions</div><div style={{ fontSize: 20, fontWeight: 700 }}>{HOLDINGS_DEMO.length}</div></div>
            </div>
            <button onClick={copyReport} style={{ background: T.blue, color: "white", border: "none", padding: "12px 24px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Copy to Clipboard</button>
          </Card>
        )}
      </main>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ` + T.border + `; border-radius: 3px; }
        button:hover { filter: brightness(1.1); }
      `}</style>
    </div>
  );
}
