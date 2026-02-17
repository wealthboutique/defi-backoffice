import { useState, useMemo, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// DeBank API Configuration
const DEBANK_API_CONFIG = {
  baseURL: 'https://pro-openapi.debank.com',
  accessKey: 'b84e3d589872b7926f7c8608406e05d4df16f513',
  rateLimit: 100 // requests per second
};

// Test wallet address
const TEST_WALLET_ADDRESS = '0x4061d0F768C7ffDc8dbfD72a520861dDFdf3c106';

// API Helper Functions
const debankAPI = {
  // Get user total balance on all chains
  getUserTotalBalance: async (address) => {
    const response = await fetch(
      `${DEBANK_API_CONFIG.baseURL}/v1/user/total_balance?id=${address}`,
      {
        headers: {
          'accept': 'application/json',
          'AccessKey': DEBANK_API_CONFIG.accessKey
        }
      }
    );
    return response.json();
  },

  // Get user token list on a specific chain
  getUserTokenList: async (address, chainId, isAll = true) => {
    const response = await fetch(
      `${DEBANK_API_CONFIG.baseURL}/v1/user/token_list?id=${address}&chain_id=${chainId}&is_all=${isAll}`,
      {
        headers: {
          'accept': 'application/json',
          'AccessKey': DEBANK_API_CONFIG.accessKey
        }
      }
    );
    return response.json();
  },

  // Get user complex protocol list on a chain
  getUserComplexProtocolList: async (address, chainId) => {
    const response = await fetch(
      `${DEBANK_API_CONFIG.baseURL}/v1/user/complex_protocol_list?id=${address}&chain_id=${chainId}`,
      {
        headers: {
          'accept': 'application/json',
          'AccessKey': DEBANK_API_CONFIG.accessKey
        }
      }
    );
    return response.json();
  }
};

// Transform DeBank API data to internal format
const transformDebankData = (walletData) => {
  if (!walletData?.totalBalance) return [];
  
  const holdings = [];
  let id = 1;

  // Transform chain_list to holdings
  walletData.totalBalance.chain_list?.forEach((chain) => {
    if (chain.usd_value > 0) {
      holdings.push({
        id: id++,
        protocol: chain.name || chain.id,
        chain: chain.id,
        token: chain.native_token_id?.toUpperCase() || 'NATIVE',
        usdValue: chain.usd_value,
        apy: 0, // Will be enhanced later with protocol data
        apyBreakdown: { base: 0, boost: 0, rewards: 0 },
        category: 'Multi-Chain',
        risk: chain.usd_value > 100000 ? 'Low' : chain.usd_value > 10000 ? 'Medium' : 'High',
        tvlProtocol: 0,
        audited: true,
        age: 0
      });
    }
  });

  return holdings;
};

const T={bg0:"#03070F",bg1:"#080F1E",bg2:"#0C1628",bg3:"#101E35",border:"#152035",text0:"#EDF2FF",text1:"#9DB4D6",text2:"#526680",text3:"#2E4060",green:"#00E5A0",red:"#FF3B6A",amber:"#FFB020",blue:"#4E9EFF",purple:"#A855F7"};
const CHAINS={ethereum:{name:"Ethereum",short:"ETH",color:"#627EEA",icon:"Ξ"},arbitrum:{name:"Arbitrum",short:"ARB",color:"#28A0F0",icon:"△"},optimism:{name:"Optimism",short:"OP",color:"#FF0420",icon:"⊙"},base:{name:"Base",short:"BASE",color:"#0052FF",icon:"◎"},polygon:{name:"Polygon",short:"MATIC",color:"#8247E5",icon:"⬡"},solana:{name:"Solana",short:"SOL",color:"#9945FF",icon:"◎"},cosmos:{name:"Cosmos",short:"ATOM",color:"#6F7390",icon:"⚛"},avalanche:{name:"Avalanche",short:"AVAX",color:"#E84142",icon:"▲"},bsc:{name:"BNB Chain",short:"BNB",color:"#F0B90B",icon:"⬡"}};

const HOLDINGS = [
  {id:1,protocol:"Aave V3",chain:"ethereum",token:"aUSDC",usdValue:2450000,apy:4.2,apyBreakdown:{base:3.1,boost:1.1,rewards:0},category:"Lending",risk:"Low",tvlProtocol:8200000000,audited:true,age:892},
  {id:2,protocol:"Lido",chain:"ethereum",token:"stETH",usdValue:3112000,apy:3.9,apyBreakdown:{base:3.9,boost:0,rewards:0},category:"Liquid Staking",risk:"Low",tvlProtocol:21000000000,audited:true,age:1200},
  {id:19,protocol:"AAVE V3",chain:"polygon",token:"aWETH",usdValue:912000,apy:3.1,apyBreakdown:{base:2.4,boost:0.7,rewards:0},category:"Lending",risk:"Low",tvlProtocol:8200000000,audited:true,age:760}
];

const AIRDROPS = [
  {id:1,protocol:"Arbitrum",chain:"arbitrum",token:"ARB",amount:125000,usdValue:187500,date:"2023-03-23",status:"Claimed",verified:true,txHash:"0xab12...cd34",method:"Governance",scamScore:0,scamFlags:[]}
];

const MONTHS_L=["Mar'23","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan'24","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan'25","Feb"];
const EARN=MONTHS_L.map((m,i)=>({month:m,lending:[38,41,44,47,51,55,58,62,67,71,74,78,82,86,90,89,93,98,102,107,111,115,118,122][i]*1000,staking:[28,30,32,34,36,38,40,43,46,49,52,55,58,61,64,67,70,74,77,80,83,86,90,93][i]*1000,dex_lp:[55,61,58,64,72,68,75,82,79,86,90,95,88,96,104,112,108,116,120,124,130,127,135,141][i]*1000,stableLP:[20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60,62,64,66][i]*1000,airdrops:[0,0,0,126,0,0,132,0,0,0,96,82,0,135,111,74,42,0,46,0,0,66,28,0][i]*1000,fees:[38,41,44,48,52,56,60,64,68,72,76,80,84,88,92,96,100,104,108,112,116,120,124,128][i]*1000}));

const SCAM_RULES = [
  {id:"HONEYPOT",label:"Honeypot Contract",desc:"Transfer function blocks sells — cannot exit position",severity:"Critical",active:true,triggered:1}
];

const usd=(n,compact=false)=>{if(compact){if(n>=1e9)return`$${(n/1e9).toFixed(2)}B`;if(n>=1e6)return`$${(n/1e6).toFixed(2)}M`;if(n>=1e3)return`$${(n/1e3).toFixed(0)}K`;return`$${n}`;}return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);};
const pct=n=>`${n.toFixed(1)}%`;
const num=n=>new Intl.NumberFormat("en-US").format(n);

function Card({children,style,accent}){return(<div style={{background:T.bg1,border:`1px solid ${T.border}`,borderRadius:12,padding:20,position:"relative",overflow:"hidden",...style}}>{accent&&<div style={{position:"absolute",top:0,left:0,right:0,height:3,background:accent}}/>}{children}</div>);}
function KPI({label,value,sub,accent}){return(<Card accent={accent}><div style={{fontSize:11,color:T.text2,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>{label}</div><div style={{fontSize:28,fontWeight:800,color:T.text0}}>{value}</div>{sub&&<div style={{fontSize:12,marginTop:4}}>{sub}</div>}</Card>)}

function HoldingsView({ holdings = HOLDINGS }) {
  const[sortBy,setSortBy]=useState("usdValue");
  const[sortDir,setSortDir]=useState("desc");
  const[chainF,setChainF]=useState("all");
  const[riskF,setRiskF]=useState("all");
  const[search,setSearch]=useState("");

  const totalTVL = holdings.reduce((s, h) => s + h.usdValue, 0);
  const wAPY = holdings.reduce((s, h) => s + h.apy * h.usdValue, 0) / (totalTVL || 1);
  
  const filtered = useMemo(() => holdings
    .filter(h => chainF === "all" || h.chain === chainF)
    .filter(h => riskF === "all" || h.risk === riskF)
    .filter(h => !search || h.protocol.toLowerCase().includes(search.toLowerCase()) || h.token.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortDir === "desc" ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy]),
  [holdings, sortBy, sortDir, chainF, riskF, search]);

  return (
    <div style={{padding: 24}}>
      <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 24}}>
        <KPI label="Total AUM" value={usd(totalTVL)} sub={pct(wAPY) + " blended APY"} accent={T.blue}/>
      </div>
      
      <Card>
        <div style={{display: "flex", justifyContent: "space-between", marginBottom: 20}}>
          <input 
            placeholder="Search protocol or token..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            style={{background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 16px", color: T.text0, width: 300}}
          />
        </div>
        
        <table style={{width: "100%", borderCollapse: "collapse"}}>
          <thead>
            <tr style={{borderBottom: `1px solid ${T.border}`}}>
              <th style={{padding: 12, textAlign: "left", color: T.text2, fontSize: 12}}>PROTOCOL</th>
              <th style={{padding: 12, textAlign: "left", color: T.text2, fontSize: 12}}>CHAIN</th>
              <th style={{padding: 12, textAlign: "left", color: T.text2, fontSize: 12}}>TOKEN</th>
              <th style={{padding: 12, textAlign: "right", color: T.text2, fontSize: 12}}>VALUE</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(h => (
              <tr key={h.id} style={{borderBottom: `1px solid ${T.border}`}}>
                <td style={{padding: 12, color: T.text0}}>{h.protocol}</td>
                <td style={{padding: 12, color: T.text1}}>{h.chain}</td>
                <td style={{padding: 12, color: T.text1}}>{h.token}</td>
                <td style={{padding: 12, textAlign: "right", color: T.text0}}>{usd(h.usdValue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function OverviewView({ holdings = HOLDINGS }) {
  const totalTVL = holdings.reduce((s, h) => s + h.usdValue, 0);
  return (
    <div style={{padding: 24}}>
      <h1 style={{color: T.text0, marginBottom: 8}}>Fund Overview</h1>
      <p style={{color: T.text2, marginBottom: 24}}>{holdings.length} positions across multiple chains</p>
      
      <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20}}>
        <KPI label="Total Portfolio Value" value={usd(totalTVL)} accent={T.green}/>
      </div>
    </div>
  );
}

const NAV = [
  {id:"overview",label:"Overview",icon:"◈"},
  {id:"holdings",label:"Holdings",icon:"⬡"}
];

export default function App() {
  const [view, setView] = useState("overview");
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useRealData, setUseRealData] = useState(true);

  useEffect(() => {
    async function fetchWalletData() {
      if (!useRealData) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching DeBank data...');
        const data = await debankAPI.getUserTotalBalance(TEST_WALLET_ADDRESS);
        setWalletData({ totalBalance: data });
        console.log('Data loaded:', data);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        setUseRealData(false);
      } finally {
        setLoading(false);
      }
    }
    fetchWalletData();
  }, [useRealData]);

  const realHoldings = walletData ? transformDebankData(walletData) : HOLDINGS;

  if (loading) return (
    <div style={{background: T.bg0, color: T.text0, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center"}}>
      Loading DeBank data...
    </div>
  );

  return (
    <div style={{display: "flex", minHeight: "100vh", background: T.bg0, color: T.text1, fontFamily: "sans-serif"}}>
      <aside style={{width: 240, background: T.bg1, borderRight: `1px solid ${T.border}`, padding: 20}}>
        <div style={{fontSize: 20, fontWeight: 800, color: T.text0, marginBottom: 40}}>DefiVault</div>
        {NAV.map(n => (
          <button 
            key={n.id}
            onClick={() => setView(n.id)}
            style={{
              width: "100%", padding: 12, marginBottom: 8, textAlign: "left",
              background: view === n.id ? T.bg2 : "transparent",
              border: "none", color: view === n.id ? T.blue : T.text2,
              borderRadius: 8, cursor: "pointer"
            }}
          >
            {n.icon} {n.label}
          </button>
        ))}
      </aside>

      <main style={{flex: 1, position: "relative"}}>
        <div style={{padding: "12px 24px", background: walletData ? T.green : T.amber, color: "white", textAlign: "center", fontSize: 13}}>
          {walletData ? "✓ LIVE DATA: Connected to DeBank" : "⚠ DEMO MODE: Using mock data"}
        </div>
        
        {view === "overview" && <OverviewView holdings={realHoldings}/>}
        {view === "holdings" && <HoldingsView holdings={realHoldings}/>}
      </main>
    </div>
  );
}
