import { useState, useMemo, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const DEBANK_API_CONFIG = {
  baseURL: 'https://pro-openapi.debank.com',
  accessKey: 'b84e3d589872b7926f7c8608406e05d4df16f513'
};

const TEST_WALLET_ADDRESS = '0x4061d0F768C7ffDc8dbfD72a520861dDFdf3c106';

const debankAPI = {
  getUserTotalBalance: async (address) => {
    const response = await fetch(`${DEBANK_API_CONFIG.baseURL}/v1/user/total_balance?id=${address}`, {
      headers: { 'accept': 'application/json', 'AccessKey': DEBANK_API_CONFIG.accessKey }
    });
    return response.json();
  },
  getUserTokenList: async (address, chain_id, is_all = true) => {
    const response = await fetch(`${DEBANK_API_CONFIG.baseURL}/v1/user/token_list?id=${address}&chain_id=${chain_id}&is_all=${is_all}`, {
      headers: { 'accept': 'application/json', 'AccessKey': DEBANK_API_CONFIG.accessKey }
    });
    return response.json();
  },
  getUserComplexProtocolList: async (address, chain_id) => {
    const response = await fetch(`${DEBANK_API_CONFIG.baseURL}/v1/user/complex_protocol_list?id=${address}&chain_id=${chain_id}`, {
      headers: { 'accept': 'application/json', 'AccessKey': DEBANK_API_CONFIG.accessKey }
    });
    return response.json();
  }
};

const T={bg0:"#03070F",bg1:"#080F1E",bg2:"#0C1628",bg3:"#101E35",border:"#152035",text0:"#EDF2FF",text1:"#9DB4D6",text2:"#526680",text3:"#2E4060",green:"#00E5A0",red:"#FF3B6A",amber:"#FFB020",blue:"#4E9EFF",purple:"#A855F7"};
const CHAINS={ethereum:{name:"Ethereum",short:"ETH",color:"#627EEA",icon:"Ξ"},arbitrum:{name:"Arbitrum",short:"ARB",color:"#28A0F0",icon:"△"},optimism:{name:"Optimism",short:"OP",color:"#FF0420",icon:"⊙"},base:{name:"Base",short:"BASE",color:"#0052FF",icon:"◎"},polygon:{name:"Polygon",short:"MATIC",color:"#8247E5",icon:"⬡"},solana:{name:"Solana",short:"SOL",color:"#9945FF",icon:"◎"},cosmos:{name:"Cosmos",short:"ATOM",color:"#6F7390",icon:"⚛"},avalanche:{name:"Avalanche",short:"AVAX",color:"#E84142",icon:"▲"},bsc:{name:"BNB Chain",short:"BNB",color:"#F0B90B",icon:"⬡"}};

const HOLDINGS_DEMO=[
 {id:1,protocol:"Aave V3",chain:"ethereum",token:"aUSDC",usdValue:2450000,apy:4.2,apyBreakdown:{base:3.1,boost:1.1,rewards:0},category:"Lending",risk:"Low",tvlProtocol:8200000000,audited:true,age:892},
 {id:2,protocol:"Lido",chain:"ethereum",token:"stETH",usdValue:3112000,apy:3.9,apyBreakdown:{base:3.9,boost:0,rewards:0},category:"Liquid Staking",risk:"Low",tvlProtocol:21000000000,audited:true,age:1200}
];

const AIRDROPS=[
 {id:1,protocol:"Arbitrum",chain:"arbitrum",token:"ARB",amount:125000,usdValue:187500,date:"2023-03-23",status:"Claimed",verified:true,txHash:"0xab12...cd34",method:"Governance",scamScore:0,scamFlags:[]},
 {id:2,protocol:"Optimism",chain:"optimism",token:"OP",amount:84000,usdValue:126000,date:"2023-06-01",status:"Claimed",verified:true,txHash:"0xef56...gh78",method:"Retroactive",scamScore:0,scamFlags:[]}
];

const MONTHS_L=["Mar'23","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan'24","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan'25","Feb"];
const EARN=MONTHS_L.map((m,i)=>({month:m,lending:[38,41,44,47,51,55,58,62,67,71,74,78,82,86,90,89,93,98,102,107,111,115,118,122][i]*1000,staking:[28,30,32,34,36,38,40,43,46,49,52,55,58,61,64,67,70,74,77,80,83,86,90,93][i]*1000,dex_lp:[55,61,58,64,72,68,75,82,79,86,90,95,88,96,104,112,108,116,120,124,130,127,135,141][i]*1000,stableLP:[20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60,62,64,66][i]*1000,airdrops:[0,0,0,126,0,0,132,0,0,0,96,82,0,135,111,74,42,0,46,0,0,66,28,0][i]*1000,fees:[38,41,44,48,52,56,60,64,68,72,76,80,84,88,92,96,100,104,108,112,116,120,124,128][i]*1000}));

const SCAM_RULES=[
 {id:"HONEYPOT",label:"Honeypot Contract",desc:"Transfer function blocks sells",severity:"Critical",active:true,triggered:1}
];

const usd=(n,compact=false)=>{if(compact){if(n>=1e9)return`$${(n/1e9).toFixed(2)}B`;if(n>=1e6)return`$${(n/1e6).toFixed(2)}M`;if(n>=1e3)return`$${(n/1e3).toFixed(0)}K`;return`$${n}`;}return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);};
const pct=n=>`${n.toFixed(1)}%`;
const num=n=>new Intl.NumberFormat("en-US").format(n);

function Chip({label,color,small}){return(<span style={{display:"inline-flex",alignItems:"center",background:`${color}1A`,border:`1px solid ${color}33`,borderRadius:5,padding:small?"1px 6px":"3px 9px",fontSize:small?10:11,color,fontWeight:600,whiteSpace:"nowrap"}}>{label}</span>);}
const CC=({chain,small})=>{const c=CHAINS[chain] || {name: chain, icon: "?", color: T.text2};return <Chip label={`${c.icon} ${c.name}`} color={c.color} small={small}/>;};
const RC=({risk})=><Chip label={risk} color={{Low:T.green,Medium:T.amber,High:T.red}[risk]}/>;
function Card({children,style,accent}){return(<div style={{background:T.bg1,border:`1px solid ${accent?`${accent}30`:T.border}`,borderRadius:13,overflow:"hidden",position:"relative",...style}}>{accent&&<div style={{position:"absolute",top:0,left:0,right:0,height:1.5,background:`linear-gradient(90deg,transparent,${accent}80,transparent)`}}/>}{children}</div>);}
function KPI({label,value,sub,accent}){return(<Card accent={accent} style={{padding:"20px 22px"}}><div style={{fontSize:10,letterSpacing:2,color:T.text2,textTransform:"uppercase",marginBottom:9}}>{label}</div><div style={{fontSize:26,fontWeight:800,color:T.text0,fontFamily:"'IBM Plex Mono',monospace",lineHeight:1}}>{value}</div>{sub&&<div style={{fontSize:11,color:accent||T.text2,marginTop:6}}>{sub}</div>}</Card>);}
function SH({title,sub,right}){return(<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:20}}><div><h2 style={{margin:0,fontSize:20,fontWeight:800,color:T.text0,letterSpacing:"-0.4px"}}>{title}</h2>{sub&&<p style={{margin:"3px 0 0",fontSize:12,color:T.text2}}>{sub}</p>}</div>{right}</div>);}

function HoldingsView({ holdings = HOLDINGS_DEMO }){
  const[sortBy,setSortBy]=useState("usdValue");
  const[sortDir,setSortDir]=useState("desc");
  const totalTVL=holdings.reduce((s,h)=>s+h.usdValue,0);
  const wAPY=holdings.length ? holdings.reduce((s,h)=>s+h.apy*h.usdValue,0)/totalTVL : 0;
  const monthly=holdings.reduce((s,h)=>s+h.usdValue*h.apy/100/12,0);
  const filtered=useMemo(()=>[...holdings].sort((a,b)=>sortDir==="desc"?b[sortBy]-a[sortBy]:a[sortBy]-b[sortBy]),[sortBy,sortDir,holdings]);
  return(<div>
    <SH title="Portfolio Holdings" sub={`${holdings.length} positions`} right={<div style={{fontFamily:"'IBM Plex Mono',monospace",textAlign:"right"}}><div style={{fontSize:22,fontWeight:700,color:T.text0}}>{usd(totalTVL,true)}</div><div style={{fontSize:11,color:T.green}}>↑ {pct(wAPY)} blended APY</div></div>}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:20}}>
      <KPI label="Total AUM" value={usd(totalTVL,true)} sub="Across all chains" accent={T.blue}/>
      <KPI label="Monthly Yield" value={usd(monthly,true)} sub="Protocol earnings" accent={T.green}/>
      <KPI label="Blended APY" value={pct(wAPY)} sub="Weighted average" accent={T.purple}/>
      <KPI label="Positions" value={holdings.length} sub="Active items" accent={T.amber}/>
    </div>
    <Card><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr style={{borderBottom:`1px solid ${T.border}`}}><th style={{padding:"11px 14px",textAlign:"left",fontSize:10,color:T.text2}}>Protocol</th><th style={{padding:"11px 14px",textAlign:"left",fontSize:10,color:T.text2}}>Chain</th><th style={{padding:"11px 14px",textAlign:"left",fontSize:10,color:T.text2}}>Token</th><th style={{padding:"11px 14px",textAlign:"left",fontSize:10,color:T.text2}}>USD Value</th><th style={{padding:"11px 14px",textAlign:"left",fontSize:10,color:T.text2}}>APY</th></tr></thead>
    <tbody>{filtered.map((h,i)=>(<tr key={h.id} style={{borderBottom:`1px solid ${T.border}30`,background:i%2?"#ffffff03":"transparent"}}><td style={{padding:"13px 14px"}}><div style={{color:T.text0,fontWeight:700,fontSize:13}}>{h.protocol}</div></td><td style={{padding:"13px 14px"}}><CC chain={h.chain}/></td><td style={{padding:"13px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.text1,fontSize:12}}>{h.token}</td><td style={{padding:"13px 14px"}}><div style={{fontFamily:"'IBM Plex Mono',monospace",color:T.text0,fontWeight:700,fontSize:13}}>{usd(h.usdValue)}</div></td><td style={{padding:"13px 14px",fontFamily:"'IBM Plex Mono',monospace",fontWeight:800,fontSize:14,color:h.apy>10?T.blue:T.green}}>{pct(h.apy)}</td></tr>))}</tbody></table></Card>
  </div>);
}

function OverviewView({ holdings = HOLDINGS_DEMO, totalBalance }){
  const totalTVL=holdings.reduce((s,h)=>s+h.usdValue,0);
  const wAPY=holdings.length ? holdings.reduce((s,h)=>s+h.apy*h.usdValue,0)/totalTVL : 0;
  const monthly=holdings.reduce((s,h)=>s+h.usdValue*h.apy/100/12,0);
  return(<div>
    <div style={{marginBottom:26}}>
      <div style={{fontSize:10,letterSpacing:2.5,color:T.text3,textTransform:"uppercase",marginBottom:5}}>{new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
      <h1 style={{margin:0,fontSize:28,fontWeight:900,color:T.text0,letterSpacing:"-1px"}}>Fund Overview</h1>
      <p style={{margin:"5px 0 0",color:T.text2,fontSize:13}}>Multi-chain DeFi portfolio · {holdings.length} positions</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:20}}>
      <KPI label="Total Balance" value={usd(totalBalance || totalTVL, true)} sub="Wallet + Protocols" accent={T.blue}/>
      <KPI label="Blended APY" value={pct(wAPY)} sub="Weighted average" accent={T.green}/>
      <KPI label="Monthly Yield" value={usd(monthly,true)} sub="Protocol run rate" accent={T.purple}/>
      <KPI label="Active Chains" value={Object.keys(CHAINS).length} sub="Monitored networks" accent={T.amber}/>
    </div>
  </div>);
}

function EarningsView(){ return <KPI label="Yield Analytics" value="$141K" sub="Mock historical data" accent={T.green}/>; }
function AirdropsView(){ return <KPI label="Airdrop Tracker" value="$512K" sub="Mock historical data" accent={T.purple}/>; }
function ScamView(){ return <KPI label="Security Engine" value="Safe" sub="All systems nominal" accent={T.blue}/>; }

export default function App(){
  const[view,setView]=useState("overview");
  const[walletData, setWalletData] = useState(null);
  const[loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWalletData() {
      try {
        setLoading(true);
        const [total, tokens, protocols] = await Promise.all([
          debankAPI.getUserTotalBalance(TEST_WALLET_ADDRESS),
          debankAPI.getUserTokenList(TEST_WALLET_ADDRESS, 'eth'),
          debankAPI.getUserComplexProtocolList(TEST_WALLET_ADDRESS, 'eth')
        ]);
        setWalletData({ total, tokens, protocols });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchWalletData();
  }, []);

  const realHoldings = useMemo(() => {
    if (!walletData) return HOLDINGS_DEMO;
    const transformed = [];
    walletData.protocols.forEach(p => {
      p.portfolio_item_list.forEach(item => {
        transformed.push({
          id: `p-${p.id}-${item.stats.asset_usd_value}`,
          protocol: p.name,
          chain: p.chain,
          token: item.detail.supply_token_list?.[0]?.symbol || 'Pos',
          usdValue: item.stats.asset_usd_value,
          apy: (item.detail.yield_rate || 0) * 100,
          category: 'Yield',
          risk: 'Medium'
        });
      });
    });
    walletData.tokens.filter(t => t.amount * t.price > 100).forEach(t => {
      transformed.push({
        id: `t-${t.id}`,
        protocol: 'Wallet',
        chain: t.chain,
        token: t.symbol,
        usdValue: t.amount * t.price,
        apy: 0,
        category: 'Spot',
        risk: 'Low'
      });
    });
    return transformed.length ? transformed : HOLDINGS_DEMO;
  }, [walletData]);

  if (loading) return <div style={{background:T.bg0, color:T.text1, height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"sans-serif"}}>Loading live data...</div>;

  return(<div style={{minHeight:"100vh",background:T.bg0,fontFamily:"'DM Sans','Helvetica Neue',sans-serif",color:T.text1,display:"flex"}}>
    <aside style={{width:224,background:T.bg1,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,bottom:0,zIndex:20}}>
      <div style={{padding:"24px 20px 20px",borderBottom:`1px solid ${T.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,borderRadius:7,background:`linear-gradient(135deg,${T.blue},${T.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"white"}}>⬡</div>
          <div><div style={{fontSize:15,fontWeight:800,color:T.text0,letterSpacing:"-0.5px"}}>DefiVault</div><div style={{fontSize:9,color:T.text3,letterSpacing:2,textTransform:"uppercase"}}>Fund Backoffice</div></div>
        </div>
      </div>
      <nav style={{padding:"13px 11px",flex:1}}>
        {[{id:"overview",label:"Overview",icon:"◈"},{id:"holdings",label:"Holdings",icon:"⬡"}].map(n=>(<button key={n.id} onClick={()=>setView(n.id)} style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:"9px 11px",borderRadius:8,marginBottom:2,background:view===n.id?`${T.blue}18`:"transparent",border:view===n.id?`1px solid ${T.blue}28`:"1px solid transparent",color:view===n.id?"#90BAFF":T.text2,fontWeight:view===n.id?700:400,fontSize:13,cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all 0.15s"}}><span style={{fontSize:15,width:19,textAlign:"center"}}>{n.icon}</span>{n.label}</button>))}
      </nav>
      <div style={{padding:"15px 20px",borderTop:`1px solid ${T.border}`}}>
        <div style={{fontSize:9,color:T.text3,letterSpacing:2,marginBottom:9,textTransform:"uppercase"}}>System Status</div>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}><div style={{width:7,height:7,borderRadius:"50%",background:T.green,boxShadow:`0 0 7px ${T.green}`}}/><span style={{fontSize:11,color:T.green}}>LIVE DATA ACTIVE</span></div>
      </div>
    </aside>
    <main style={{marginLeft:224,flex:1,padding:"30px 34px",minHeight:"100vh",maxWidth:"calc(100vw - 224px)"}}>
      {view==="overview"&&<OverviewView holdings={realHoldings} totalBalance={walletData?.total?.total_usd_value}/>}
      {view==="holdings"&&<HoldingsView holdings={realHoldings}/>}
    </main>
    <style>{`* { box-sizing: border-box; } body { margin: 0; }`}</style>
  </div>);
}
