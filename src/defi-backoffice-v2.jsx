import { useState, useMemo } from "react";
import { AreaChart, Area, BarChart, Bar, useEffect, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

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
  },
  
  // Get user history list
  getUserHistoryList: async (address, chainId, startTime = null, pageCount = 20) => {
    let url = `${DEBANK_API_CONFIG.baseURL}/v1/user/history_list?id=${address}&chain_id=${chainId}&page_count=${pageCount}`;
    if (startTime) {
      url += `&start_time=${startTime}`;
    }
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json',
        'AccessKey': DEBANK_API_CONFIG.accessKey
      }
    });
    return response.json();
  },
  
  // Get chain list
  getChainList: async () => {
    const response = await fetch(
      `${DEBANK_API_CONFIG.baseURL}/v1/chain/list`,
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


const T={bg0:"#03070F",bg1:"#080F1E",bg2:"#0C1628",bg3:"#101E35",border:"#152035",text0:"#EDF2FF",text1:"#9DB4D6",text2:"#526680",text3:"#2E4060",green:"#00E5A0",red:"#FF3B6A",amber:"#FFB020",blue:"#4E9EFF",purple:"#A855F7"};
const CHAINS={ethereum:{name:"Ethereum",short:"ETH",color:"#627EEA",icon:"Ξ"},arbitrum:{name:"Arbitrum",short:"ARB",color:"#28A0F0",icon:"△"},optimism:{name:"Optimism",short:"OP",color:"#FF0420",icon:"⊙"},base:{name:"Base",short:"BASE",color:"#0052FF",icon:"◎"},polygon:{name:"Polygon",short:"MATIC",color:"#8247E5",icon:"⬡"},solana:{name:"Solana",short:"SOL",color:"#9945FF",icon:"◎"},cosmos:{name:"Cosmos",short:"ATOM",color:"#6F7390",icon:"⚛"},avalanche:{name:"Avalanche",short:"AVAX",color:"#E84142",icon:"▲"},bsc:{name:"BNB Chain",short:"BNB",color:"#F0B90B",icon:"⬡"}};
const HOLDINGS=[
  {id:1,protocol:"Aave V3",chain:"ethereum",token:"aUSDC",usdValue:2450000,apy:4.2,apyBreakdown:{base:3.1,boost:1.1,rewards:0},category:"Lending",risk:"Low",tvlProtocol:8200000000,audited:true,age:892},
  {id:2,protocol:"Lido",chain:"ethereum",token:"stETH",usdValue:3112000,apy:3.9,apyBreakdown:{base:3.9,boost:0,rewards:0},category:"Liquid Staking",risk:"Low",tvlProtocol:21000000000,audited:true,age:1200},
  {id:3,protocol:"Curve 3pool",chain:"ethereum",token:"3CRV",usdValue:1780000,apy:5.8,apyBreakdown:{base:2.1,boost:1.4,rewards:2.3},category:"Stablecoin LP",risk:"Low",tvlProtocol:3400000000,audited:true,age:1450},
  {id:4,protocol:"Convex",chain:"ethereum",token:"cvxCRV",usdValue:320000,apy:9.1,apyBreakdown:{base:4.2,boost:3.1,rewards:1.8},category:"Yield Boost",risk:"Medium",tvlProtocol:4100000000,audited:true,age:1100},
  {id:5,protocol:"Pendle",chain:"ethereum",token:"PT-stETH",usdValue:560000,apy:14.3,apyBreakdown:{base:3.9,boost:10.4,rewards:0},category:"Yield Tokenization",risk:"Medium",tvlProtocol:1800000000,audited:true,age:380},
  {id:6,protocol:"Uniswap V3",chain:"arbitrum",token:"ETH/USDC LP",usdValue:1200000,apy:18.7,apyBreakdown:{base:18.7,boost:0,rewards:0},category:"DEX LP",risk:"Medium",tvlProtocol:5600000000,audited:true,age:740},
  {id:7,protocol:"GMX V2",chain:"arbitrum",token:"GM ETH-USDC",usdValue:890000,apy:22.1,apyBreakdown:{base:14.2,boost:0,rewards:7.9},category:"Derivatives LP",risk:"High",tvlProtocol:780000000,audited:true,age:290},
  {id:8,protocol:"Radiant",chain:"arbitrum",token:"rUSDC",usdValue:440000,apy:11.4,apyBreakdown:{base:5.1,boost:4.2,rewards:2.1},category:"Lending",risk:"Medium",tvlProtocol:320000000,audited:true,age:510},
  {id:9,protocol:"Velodrome",chain:"optimism",token:"USDC/DAI vLP",usdValue:380000,apy:8.4,apyBreakdown:{base:3.1,boost:0,rewards:5.3},category:"Stablecoin LP",risk:"Low",tvlProtocol:650000000,audited:true,age:620},
  {id:10,protocol:"Exactly",chain:"optimism",token:"eUSDC",usdValue:290000,apy:7.2,apyBreakdown:{base:7.2,boost:0,rewards:0},category:"Lending",risk:"Medium",tvlProtocol:180000000,audited:true,age:410},
  {id:11,protocol:"Aerodrome",chain:"base",token:"USDC/ETH vLP",usdValue:520000,apy:21.8,apyBreakdown:{base:8.1,boost:0,rewards:13.7},category:"DEX LP",risk:"Medium",tvlProtocol:820000000,audited:true,age:310},
  {id:12,protocol:"Moonwell",chain:"base",token:"mUSDC",usdValue:340000,apy:6.3,apyBreakdown:{base:4.8,boost:1.5,rewards:0},category:"Lending",risk:"Low",tvlProtocol:290000000,audited:true,age:280},
  {id:13,protocol:"Marinade",chain:"solana",token:"mSOL",usdValue:2345000,apy:7.2,apyBreakdown:{base:7.2,boost:0,rewards:0},category:"Liquid Staking",risk:"Low",tvlProtocol:1200000000,audited:true,age:880},
  {id:14,protocol:"Raydium CLMM",chain:"solana",token:"SOL/USDC",usdValue:240000,apy:41.2,apyBreakdown:{base:41.2,boost:0,rewards:0},category:"DEX LP",risk:"High",tvlProtocol:450000000,audited:true,age:420},
  {id:15,protocol:"Kamino",chain:"solana",token:"kUSDC",usdValue:610000,apy:9.8,apyBreakdown:{base:6.2,boost:3.6,rewards:0},category:"Lending",risk:"Medium",tvlProtocol:680000000,audited:true,age:360},
  {id:16,protocol:"Osmosis",chain:"cosmos",token:"OSMO/ATOM",usdValue:670000,apy:31.4,apyBreakdown:{base:12.1,boost:0,rewards:19.3},category:"DEX LP",risk:"High",tvlProtocol:340000000,audited:true,age:730},
  {id:17,protocol:"Quasar",chain:"cosmos",token:"qATOM",usdValue:352000,apy:18.6,apyBreakdown:{base:8.4,boost:0,rewards:10.2},category:"Yield Vault",risk:"Medium",tvlProtocol:120000000,audited:false,age:290},
  {id:18,protocol:"Trader Joe",chain:"avalanche",token:"AVAX/USDC LB",usdValue:280000,apy:28.9,apyBreakdown:{base:28.9,boost:0,rewards:0},category:"DEX LP",risk:"High",tvlProtocol:210000000,audited:true,age:480},
  {id:19,protocol:"AAVE V3",chain:"polygon",token:"aWETH",usdValue:912000,apy:3.1,apyBreakdown:{base:2.4,boost:0.7,rewards:0},category:"Lending",risk:"Low",tvlProtocol:8200000000,audited:true,age:760},
  {id:20,protocol:"Venus",chain:"bsc",token:"vUSDT",usdValue:180000,apy:5.6,apyBreakdown:{base:4.1,boost:1.5,rewards:0},category:"Lending",risk:"Medium",tvlProtocol:1900000000,audited:true,age:920},
];
const AIRDROPS=[
  {id:1,protocol:"Arbitrum",chain:"arbitrum",token:"ARB",amount:125000,usdValue:187500,date:"2023-03-23",status:"Claimed",verified:true,txHash:"0xab12...cd34",method:"Governance",scamScore:0,scamFlags:[]},
  {id:2,protocol:"Optimism",chain:"optimism",token:"OP",amount:84000,usdValue:126000,date:"2023-06-01",status:"Claimed",verified:true,txHash:"0xef56...gh78",method:"Retroactive",scamScore:0,scamFlags:[]},
  {id:3,protocol:"Uniswap",chain:"ethereum",token:"UNI",amount:22000,usdValue:132000,date:"2024-01-15",status:"Claimed",verified:true,txHash:"0xij90...kl12",method:"Usage",scamScore:0,scamFlags:[]},
  {id:4,protocol:"dYdX V4",chain:"cosmos",token:"DYDX",amount:45000,usdValue:135000,date:"2024-02-28",status:"Claimed",verified:true,txHash:"cosmos1ab...",method:"Retroactive",scamScore:0,scamFlags:[]},
  {id:5,protocol:"EigenLayer",chain:"ethereum",token:"EIGEN",amount:18500,usdValue:111000,date:"2024-04-12",status:"Pending",verified:true,txHash:"0xmn34...op56",method:"Restaking",scamScore:0,scamFlags:[]},
  {id:6,protocol:"LayerZero",chain:"ethereum",token:"ZRO",amount:9200,usdValue:73600,date:"2024-06-20",status:"Claimed",verified:true,txHash:"0xqr78...st90",method:"Bridge",scamScore:0,scamFlags:[]},
  {id:7,protocol:"Wormhole",chain:"ethereum",token:"W",amount:31000,usdValue:46500,date:"2024-04-03",status:"Claimed",verified:true,txHash:"0xuv12...wx34",method:"Bridge",scamScore:0,scamFlags:[]},
  {id:8,protocol:"Starknet",chain:"ethereum",token:"STRK",amount:55000,usdValue:82500,date:"2024-02-20",status:"Claimed",verified:true,txHash:"0xyz56...ab78",method:"Usage",scamScore:0,scamFlags:[]},
  {id:9,protocol:"Kelp DAO",chain:"ethereum",token:"KELP",amount:44000,usdValue:66000,date:"2024-05-18",status:"Claimed",verified:true,txHash:"0xba98...dc76",method:"Restaking",scamScore:0,scamFlags:[]},
  {id:10,protocol:"Ethena",chain:"ethereum",token:"ENA",amount:38000,usdValue:57000,date:"2024-04-02",status:"Claimed",verified:true,txHash:"0xfe54...ba32",method:"Sats Campaign",scamScore:0,scamFlags:[]},
  {id:11,protocol:"Jito",chain:"solana",token:"JTO",amount:12000,usdValue:96000,date:"2023-12-07",status:"Claimed",verified:true,txHash:"3VzP...mE4a",method:"Staking",scamScore:0,scamFlags:[]},
  {id:12,protocol:"Jupiter",chain:"solana",token:"JUP",amount:55000,usdValue:82500,date:"2024-01-31",status:"Claimed",verified:true,txHash:"8kLp...nQ2x",method:"Usage",scamScore:0,scamFlags:[]},
  {id:13,protocol:"Pyth Network",chain:"solana",token:"PYTH",amount:28000,usdValue:42000,date:"2023-11-20",status:"Claimed",verified:true,txHash:"7mKq...pR3s",method:"Usage",scamScore:0,scamFlags:[]},
  {id:14,protocol:"Saga",chain:"cosmos",token:"SAGA",amount:14000,usdValue:28000,date:"2024-04-09",status:"Claimed",verified:true,txHash:"saga1xy...",method:"Staking",scamScore:0,scamFlags:[]},
  {id:15,protocol:"USDC Bonus",chain:"ethereum",token:"FREE_USDC",amount:50000,usdValue:0,date:"2024-05-10",status:"Blocked",verified:false,txHash:"0xdead...beef",method:"Unknown",scamScore:98,scamFlags:["Honeypot Contract","Zero DEX Liquidity","Unverified Source Code"]},
  {id:16,protocol:"Arbitrum2",chain:"arbitrum",token:"ARB2",amount:10000,usdValue:0,date:"2024-07-02",status:"Blocked",verified:false,txHash:"0xscam...1111",method:"Unknown",scamScore:95,scamFlags:["Protocol Impersonation","Fake Deployer Address"]},
  {id:17,protocol:"ETH Rewards",chain:"ethereum",token:"ETHX",amount:2000,usdValue:0,date:"2024-08-14",status:"Blocked",verified:false,txHash:"0xph15h...00",method:"Unknown",scamScore:88,scamFlags:["Dust Attack","Unverified Source Code"]},
];
const MONTHS_L=["Mar'23","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan'24","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan'25","Feb"];
const EARN=MONTHS_L.map((m,i)=>({month:m,lending:[38,41,44,47,51,55,58,62,67,71,74,78,82,86,90,89,93,98,102,107,111,115,118,122][i]*1000,staking:[28,30,32,34,36,38,40,43,46,49,52,55,58,61,64,67,70,74,77,80,83,86,90,93][i]*1000,dex_lp:[55,61,58,64,72,68,75,82,79,86,90,95,88,96,104,112,108,116,120,124,130,127,135,141][i]*1000,stableLP:[20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60,62,64,66][i]*1000,airdrops:[0,0,0,126,0,0,132,0,0,0,96,82,0,135,111,74,42,0,46,0,0,66,28,0][i]*1000,fees:[38,41,44,48,52,56,60,64,68,72,76,80,84,88,92,96,100,104,108,112,116,120,124,128][i]*1000}));
const SCAM_RULES=[
  {id:"HONEYPOT",label:"Honeypot Contract",desc:"Transfer function blocks sells — cannot exit position",severity:"Critical",active:true,triggered:1},
  {id:"IMPERSONATION",label:"Protocol Impersonation",desc:"Token deployer ≠ official protocol deployer address",severity:"Critical",active:true,triggered:1},
  {id:"UNVERIFIED",label:"Unverified Source Code",desc:"Contract source not verified on any block explorer",severity:"High",active:true,triggered:2},
  {id:"NO_LIQ",label:"Zero DEX Liquidity",desc:"Token has no active liquidity pool on any DEX",severity:"High",active:true,triggered:1},
  {id:"DUST",label:"Dust Attack",desc:"Micro-value token for address poisoning/tracking",severity:"Medium",active:true,triggered:1},
  {id:"FAKE_DEPLOY",label:"Fake Deployer",desc:"Contract deployed by address impersonating known team",severity:"Critical",active:true,triggered:1},
  {id:"MINT",label:"Unlimited Mint Authority",desc:"Owner retains mint authority — infinite supply risk",severity:"High",active:true,triggered:0},
  {id:"PROXY",label:"Malicious Proxy",desc:"Upgradeable proxy with untrusted admin key",severity:"Medium",active:false,triggered:0},
  {id:"TORNADO",label:"Tornado Cash Funding",desc:"Deployer funded via Tornado Cash mixer",severity:"Medium",active:true,triggered:0},
  {id:"TAX",label:"Hidden Transfer Tax",desc:"Contract embeds >10% transfer tax not disclosed",severity:"High",active:false,triggered:0},
];

const usd=(n,compact=false)=>{if(compact){if(n>=1e9)return`$${(n/1e9).toFixed(2)}B`;if(n>=1e6)return`$${(n/1e6).toFixed(2)}M`;if(n>=1e3)return`$${(n/1e3).toFixed(0)}K`;return`$${n}`;}return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);};
const pct=n=>`${n.toFixed(1)}%`;
const num=n=>new Intl.NumberFormat("en-US").format(n);

function Chip({label,color,small}){return(<span style={{display:"inline-flex",alignItems:"center",background:`${color}1A`,border:`1px solid ${color}33`,borderRadius:5,padding:small?"1px 6px":"3px 9px",fontSize:small?10:11,color,fontWeight:600,whiteSpace:"nowrap"}}>{label}</span>);}
const CC=({chain,small})=>{const c=CHAINS[chain];return <Chip label={`${c.icon} ${c.name}`} color={c.color} small={small}/>;};
const RC=({risk})=><Chip label={risk} color={{Low:T.green,Medium:T.amber,High:T.red}[risk]}/>;
const SC=({status})=>{const c={Claimed:T.green,Pending:T.amber,Blocked:T.red}[status];return(<span style={{display:"inline-flex",alignItems:"center",gap:5,background:`${c}1A`,border:`1px solid ${c}33`,borderRadius:5,padding:"3px 9px",fontSize:11,color:c,fontWeight:600}}><span style={{width:5,height:5,borderRadius:"50%",background:c}}/>{status}</span>);};
function Card({children,style,accent}){return(<div style={{background:T.bg1,border:`1px solid ${accent?`${accent}30`:T.border}`,borderRadius:13,overflow:"hidden",position:"relative",...style}}>{accent&&<div style={{position:"absolute",top:0,left:0,right:0,height:1.5,background:`linear-gradient(90deg,transparent,${accent}80,transparent)`}}/>}{children}</div>);}
function KPI({label,value,sub,accent}){return(<Card accent={accent} style={{padding:"20px 22px"}}><div style={{fontSize:10,letterSpacing:2,color:T.text2,textTransform:"uppercase",marginBottom:9}}>{label}</div><div style={{fontSize:26,fontWeight:800,color:T.text0,fontFamily:"'IBM Plex Mono',monospace",lineHeight:1}}>{value}</div>{sub&&<div style={{fontSize:11,color:accent||T.text2,marginTop:6}}>{sub}</div>}</Card>);}
function SH({title,sub,right}){return(<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:20}}><div><h2 style={{margin:0,fontSize:20,fontWeight:800,color:T.text0,letterSpacing:"-0.4px"}}>{title}</h2>{sub&&<p style={{margin:"3px 0 0",fontSize:12,color:T.text2}}>{sub}</p>}</div>{right}</div>);}
function FB({label,active,onClick,count}){return(<button onClick={onClick} style={{background:active?`${T.blue}18`:"transparent",border:`1px solid ${active?T.blue:T.border}`,borderRadius:8,padding:"6px 13px",color:active?T.blue:T.text2,fontSize:12,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>{label}{count!=null&&<span style={{background:active?`${T.blue}22`:T.bg3,borderRadius:8,padding:"0px 5px",fontSize:10}}>{count}</span>}</button>);}

const TCAT={lending:"Lending",staking:"Liq. Staking",dex_lp:"DEX LP",stableLP:"Stable LP",airdrops:"Airdrops",fees:"Mgmt Fees"};
const TTip=({active,payload,label})=>{if(!active||!payload?.length)return null;return(<div style={{background:T.bg2,border:`1px solid ${T.border}`,borderRadius:9,padding:"11px 15px",fontSize:12}}><div style={{color:T.text2,marginBottom:7,fontSize:10,letterSpacing:1}}>{label}</div>{payload.map((p,i)=>(<div key={i} style={{display:"flex",gap:10,marginBottom:2,color:T.text1}}><span style={{color:p.color}}>▪</span><span style={{flex:1}}>{TCAT[p.name]||p.name}</span><span style={{fontFamily:"'IBM Plex Mono',monospace",color:T.text0}}>{usd(p.value)}</span></div>))}</div>);};

function HoldingsView(){
  const[sortBy,setSortBy]=useState("usdValue");
  const[sortDir,setSortDir]=useState("desc");
  const[chainF,setChainF]=useState("all");
  const[riskF,setRiskF]=useState("all");
  const[search,setSearch]=useState("");
  const totalTVL=HOLDINGS.reduce((s,h)=>s+h.usdValue,0);
  const wAPY=HOLDINGS.reduce((s,h)=>s+h.apy*h.usdValue,0)/totalTVL;
  const monthly=HOLDINGS.reduce((s,h)=>s+h.usdValue*h.apy/100/12,0);
  const chainData=Object.entries(HOLDINGS.reduce((a,h)=>{a[h.chain]=(a[h.chain]||0)+h.usdValue;return a;},{})).sort((a,b)=>b[1]-a[1]).map(([c,v])=>({name:CHAINS[c].name,value:v,color:CHAINS[c].color}));
  const catData=Object.entries(HOLDINGS.reduce((a,h)=>{a[h.category]=(a[h.category]||0)+h.usdValue;return a;},{})).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({name,value}));
  const CC2=["#4E9EFF","#00E5A0","#A855F7","#FFB020","#FF3B6A","#627EEA","#E84142"];
  const filtered=useMemo(()=>HOLDINGS.filter(h=>chainF==="all"||h.chain===chainF).filter(h=>riskF==="all"||h.risk===riskF).filter(h=>!search||h.protocol.toLowerCase().includes(search.toLowerCase())||h.token.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>sortDir==="desc"?b[sortBy]-a[sortBy]:a[sortBy]-b[sortBy]),[sortBy,sortDir,chainF,riskF,search]);
  const hs=(col)=>{if(sortBy===col)setSortDir(d=>d==="desc"?"asc":"desc");else{setSortBy(col);setSortDir("desc");}};
  const TH=({col,ch})=><th onClick={()=>col&&hs(col)} style={{padding:"11px 14px",textAlign:"left",fontSize:10,color:sortBy===col?T.blue:T.text2,letterSpacing:1.5,textTransform:"uppercase",cursor:col?"pointer":"default",background:sortBy===col?`${T.blue}09`:"transparent",userSelect:"none",whiteSpace:"nowrap"}}>{ch}{sortBy===col?(sortDir==="desc"?" ↓":" ↑"):""}</th>;
  return(<div>
    <SH title="Portfolio Holdings" sub={`${HOLDINGS.length} positions · ${Object.keys(CHAINS).length} chains`} right={<div style={{fontFamily:"'IBM Plex Mono',monospace",textAlign:"right"}}><div style={{fontSize:22,fontWeight:700,color:T.text0}}>{usd(totalTVL,true)}</div><div style={{fontSize:11,color:T.green}}>↑ {pct(wAPY)} blended APY</div></div>}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:20}}>
      <KPI label="Total AUM" value={usd(totalTVL,true)} sub="Across all chains" accent={T.blue}/>
      <KPI label="Monthly Yield" value={usd(monthly,true)} sub="Protocol earnings" accent={T.green}/>
      <KPI label="Blended APY" value={pct(wAPY)} sub="Weighted average" accent={T.purple}/>
      <KPI label="Positions" value={HOLDINGS.length} sub={`${Object.keys(CHAINS).length} blockchains`} accent={T.amber}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:18}}>
      <Card style={{padding:20}}>
        <div style={{fontSize:10,letterSpacing:2,color:T.text2,textTransform:"uppercase",marginBottom:14}}>Chain Allocation</div>
        <div style={{display:"flex",gap:16,alignItems:"center"}}>
          <ResponsiveContainer width={130} height={130}><PieChart><Pie data={chainData} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" paddingAngle={2}>{chainData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip contentStyle={{background:T.bg2,border:`1px solid ${T.border}`,borderRadius:8,fontSize:11}} formatter={v=>[usd(v,true)]}/></PieChart></ResponsiveContainer>
          <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>{chainData.map(c=>(<div key={c.name} style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:7,height:7,borderRadius:2,background:c.color}}/><span style={{fontSize:11,color:T.text1,flex:1}}>{c.name}</span><span style={{fontSize:11,fontFamily:"'IBM Plex Mono',monospace",color:T.text0}}>{((c.value/totalTVL)*100).toFixed(1)}%</span></div>))}</div>
        </div>
      </Card>
      <Card style={{padding:20}}>
        <div style={{fontSize:10,letterSpacing:2,color:T.text2,textTransform:"uppercase",marginBottom:12}}>Strategy Allocation</div>
        <ResponsiveContainer width="100%" height={130}><BarChart data={catData} layout="vertical" margin={{left:0,right:36}}><XAxis type="number" hide/><YAxis type="category" dataKey="name" width={130} tick={{fill:T.text1,fontSize:10}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:T.bg2,border:`1px solid ${T.border}`,borderRadius:8,fontSize:11}} formatter={v=>[usd(v,true)]}/><Bar dataKey="value" radius={[0,4,4,0]}>{catData.map((_,i)=><Cell key={i} fill={CC2[i]}/>)}</Bar></BarChart></ResponsiveContainer>
      </Card>
    </div>
    <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
      <input placeholder="Search protocol or token…" value={search} onChange={e=>setSearch(e.target.value)} style={{background:T.bg2,border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 13px",color:T.text0,fontSize:12,outline:"none",fontFamily:"inherit",width:210,marginRight:6}}/>
      <FB label="All" active={chainF==="all"} onClick={()=>setChainF("all")}/>
      {Object.entries(CHAINS).map(([k,c])=>(<FB key={k} label={`${c.icon} ${c.short}`} active={chainF===k} onClick={()=>setChainF(k)}/>))}
      <div style={{flex:1}}/>
      {["all","Low","Medium","High"].map(r=>(<FB key={r} label={r==="all"?"All Risk":r} active={riskF===r} onClick={()=>setRiskF(r)}/>))}
    </div>
    <Card>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{borderBottom:`1px solid ${T.border}`}}><TH col="protocol" ch="Protocol"/><TH ch="Chain"/><TH ch="Token"/><TH col="usdValue" ch="USD Value"/><TH col="apy" ch="APY"/><TH ch="APY Breakdown"/><TH ch="Strategy"/><TH ch="Risk"/><TH ch="Alloc"/></tr></thead>
        <tbody>{filtered.map((h,i)=>{const alloc=(h.usdValue/totalTVL)*100;const me=h.usdValue*h.apy/100/12;return(<tr key={h.id} style={{borderBottom:`1px solid ${T.border}30`,background:i%2?"#ffffff03":"transparent",transition:"background 0.12s"}} onMouseEnter={e=>e.currentTarget.style.background=`${T.blue}08`} onMouseLeave={e=>e.currentTarget.style.background=i%2?"#ffffff03":"transparent"}>
          <td style={{padding:"13px 14px"}}><div style={{color:T.text0,fontWeight:700,fontSize:13}}>{h.protocol}</div><div style={{fontSize:10,color:T.text3,marginTop:2}}>TVL {usd(h.tvlProtocol,true)} · {h.age}d · {h.audited?"✓ Audited":"⚠ Unaudited"}</div></td>
          <td style={{padding:"13px 14px"}}><CC chain={h.chain}/></td>
          <td style={{padding:"13px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.text1,fontSize:12}}>{h.token}</td>
          <td style={{padding:"13px 14px"}}><div style={{fontFamily:"'IBM Plex Mono',monospace",color:T.text0,fontWeight:700,fontSize:13}}>{usd(h.usdValue)}</div><div style={{fontSize:10,color:T.text3,marginTop:2}}>~{usd(me,true)}/mo</div></td>
          <td style={{padding:"13px 14px",fontFamily:"'IBM Plex Mono',monospace",fontWeight:800,fontSize:14,color:h.apy>20?T.amber:h.apy>10?T.blue:T.green}}>{pct(h.apy)}</td>
          <td style={{padding:"13px 14px"}}><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{h.apyBreakdown.base>0&&<Chip label={`Base ${pct(h.apyBreakdown.base)}`} color={T.green} small/>}{h.apyBreakdown.boost>0&&<Chip label={`Boost ${pct(h.apyBreakdown.boost)}`} color={T.blue} small/>}{h.apyBreakdown.rewards>0&&<Chip label={`Rwds ${pct(h.apyBreakdown.rewards)}`} color={T.purple} small/>}</div></td>
          <td style={{padding:"13px 14px",color:T.text1,fontSize:12}}>{h.category}</td>
          <td style={{padding:"13px 14px"}}><RC risk={h.risk}/></td>
          <td style={{padding:"13px 14px"}}><div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:70,height:3,background:T.bg3,borderRadius:3}}><div style={{width:`${Math.min(alloc*3.5,100)}%`,height:"100%",background:CHAINS[h.chain].color,borderRadius:3}}/></div><span style={{fontSize:10,color:T.text2,fontFamily:"'IBM Plex Mono',monospace"}}>{pct(alloc)}</span></div></td>
        </tr>);})}</tbody>
      </table>
    </Card>
  </div>);}

function EarningsView(){
  const[range,setRange]=useState(12);
  const[mode,setMode]=useState("stacked");
  const data=EARN.slice(-range);
  const CATS=[{key:"lending",label:"Lending",color:"#4E9EFF"},{key:"staking",label:"Liq. Staking",color:"#00E5A0"},{key:"dex_lp",label:"DEX LP",color:"#A855F7"},{key:"stableLP",label:"Stable LP",color:"#FFB020"},{key:"airdrops",label:"Airdrops",color:"#FF3B6A"},{key:"fees",label:"Mgmt Fees",color:"#627EEA"}];
  const sum=f=>data.reduce((s,d)=>s+d[f],0);
  const tYield=sum("lending")+sum("staking")+sum("dex_lp")+sum("stableLP");
  const tAir=sum("airdrops");const tFees=sum("fees");const grand=tYield+tAir+tFees;
  const lm=data[data.length-1];const pm=data[data.length-2];
  const ly=lm.lending+lm.staking+lm.dex_lp+lm.stableLP;const py=pm.lending+pm.staking+pm.dex_lp+pm.stableLP;
  const mom=((ly-py)/py*100).toFixed(1);
  const pYield=HOLDINGS.map(h=>({protocol:h.protocol,chain:h.chain,category:h.category,apy:h.apy,tvl:h.usdValue,monthly:Math.round(h.usdValue*h.apy/100/12),annual:Math.round(h.usdValue*h.apy/100)})).sort((a,b)=>b.monthly-a.monthly);
  const totM=pYield.reduce((s,p)=>s+p.monthly,0);
  let cum=0;const cumD=data.map(d=>{const t=d.lending+d.staking+d.dex_lp+d.stableLP+d.airdrops+d.fees;cum+=t;return{...d,monthly:t,cumulative:cum};});
  return(<div>
    <SH title="Yield & Earnings Analytics" sub={`${range}-month trailing · ${data[0]?.month} → ${data[data.length-1]?.month}`} right={<div style={{display:"flex",gap:8}}>{[6,12,24].map(r=><FB key={r} label={`${r}M`} active={range===r} onClick={()=>setRange(r)}/>)}</div>}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:20}}>
      <KPI label="Total Earnings" value={usd(grand,true)} sub={`${range}-month cumulative`} accent={T.green}/>
      <KPI label="Protocol Yield" value={usd(tYield,true)} sub={`MoM ${mom>0?"+":""}${mom}%`} accent={T.blue}/>
      <KPI label="Airdrop Revenue" value={usd(tAir,true)} sub={`${AIRDROPS.filter(a=>a.verified).length} verified events`} accent={T.purple}/>
      <KPI label="Monthly Run Rate" value={usd(totM,true)} sub={`Ann. ${usd(totM*12,true)}`} accent={T.amber}/>
    </div>
    <Card accent={T.blue} style={{padding:24,marginBottom:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div style={{fontSize:10,letterSpacing:2,color:T.text2,textTransform:"uppercase"}}>Monthly Earnings Breakdown</div>
        <div style={{display:"flex",gap:8}}>{["stacked","bar","line"].map(v=><FB key={v} label={v.charAt(0).toUpperCase()+v.slice(1)} active={mode===v} onClick={()=>setMode(v)}/>)}</div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        {mode==="stacked"?(<AreaChart data={data} margin={{left:10}}><defs>{CATS.map(c=>(<linearGradient key={c.key} id={`g${c.key}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={c.color} stopOpacity={0.4}/><stop offset="95%" stopColor={c.color} stopOpacity={0}/></linearGradient>))}</defs><XAxis dataKey="month" stroke={T.border} tick={{fill:T.text2,fontSize:10}}/><YAxis stroke={T.border} tick={{fill:T.text2,fontSize:10}} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/><Tooltip content={<TTip/>}/>{CATS.map(c=><Area key={c.key} type="monotone" dataKey={c.key} stackId="1" stroke={c.color} fill={`url(#g${c.key})`} strokeWidth={1}/>)}</AreaChart>
        ):mode==="bar"?(<BarChart data={data} margin={{left:10}}><XAxis dataKey="month" stroke={T.border} tick={{fill:T.text2,fontSize:10}}/><YAxis stroke={T.border} tick={{fill:T.text2,fontSize:10}} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/><Tooltip content={<TTip/>}/>{CATS.map(c=><Bar key={c.key} dataKey={c.key} stackId="a" fill={c.color}/>)}</BarChart>
        ):(<LineChart data={cumD} margin={{left:10}}><XAxis dataKey="month" stroke={T.border} tick={{fill:T.text2,fontSize:10}}/><YAxis stroke={T.border} tick={{fill:T.text2,fontSize:10}} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/><Tooltip contentStyle={{background:T.bg2,border:`1px solid ${T.border}`,borderRadius:8,fontSize:12}} formatter={v=>[usd(v)]}/><Line type="monotone" dataKey="monthly" stroke={T.blue} strokeWidth={2.5} dot={false} name="Monthly"/><Line type="monotone" dataKey="cumulative" stroke={T.green} strokeWidth={2} dot={false} strokeDasharray="5 3" name="Cumulative"/></LineChart>)}
      </ResponsiveContainer>
      <div style={{display:"flex",gap:16,marginTop:12,flexWrap:"wrap"}}>{CATS.map(c=><div key={c.key} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.text2}}><div style={{width:9,height:9,borderRadius:2,background:c.color}}/>{c.label}</div>)}</div>
    </Card>
    <Card>
      <div style={{padding:"14px 18px",borderBottom:`1px solid ${T.border}`,fontSize:10,letterSpacing:2,color:T.text2,textTransform:"uppercase"}}>Protocol-Level Yield Breakdown</div>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{borderBottom:`1px solid ${T.border}`}}>{["Protocol","Chain","Strategy","TVL Deployed","APY","Monthly Yield","Annual Yield","Share"].map(l=>(<th key={l} style={{padding:"10px 14px",textAlign:"left",fontSize:10,color:T.text2,letterSpacing:1.5,textTransform:"uppercase"}}>{l}</th>))}</tr></thead>
        <tbody>{pYield.map((p,i)=>(<tr key={i} style={{borderBottom:`1px solid ${T.border}30`,background:i%2?"#ffffff03":"transparent"}} onMouseEnter={e=>e.currentTarget.style.background=`${T.blue}08`} onMouseLeave={e=>e.currentTarget.style.background=i%2?"#ffffff03":"transparent"}>
          <td style={{padding:"11px 14px",color:T.text0,fontWeight:700,fontSize:13}}>{p.protocol}</td>
          <td style={{padding:"11px 14px"}}><CC chain={p.chain} small/></td>
          <td style={{padding:"11px 14px",color:T.text1,fontSize:12}}>{p.category}</td>
          <td style={{padding:"11px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.text1,fontSize:12}}>{usd(p.tvl)}</td>
          <td style={{padding:"11px 14px",fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:13,color:p.apy>20?T.amber:p.apy>10?T.blue:T.green}}>{pct(p.apy)}</td>
          <td style={{padding:"11px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.text0,fontWeight:600,fontSize:13}}>{usd(p.monthly)}</td>
          <td style={{padding:"11px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.text1,fontSize:12}}>{usd(p.annual)}</td>
          <td style={{padding:"11px 14px"}}><div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:72,height:3,background:T.bg3,borderRadius:3}}><div style={{width:`${(p.monthly/totM)*100}%`,height:"100%",background:CHAINS[p.chain].color,borderRadius:3}}/></div><span style={{fontSize:10,color:T.text2,fontFamily:"'IBM Plex Mono',monospace"}}>{((p.monthly/totM)*100).toFixed(1)}%</span></div></td>
        </tr>))}</tbody>
        <tfoot><tr style={{borderTop:`1px solid ${T.border}`,background:T.bg2}}><td colSpan={5} style={{padding:"11px 14px",color:T.text2,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Total</td><td style={{padding:"11px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.green,fontWeight:800,fontSize:14}}>{usd(totM)}</td><td style={{padding:"11px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.green,fontWeight:700}}>{usd(totM*12)}</td><td style={{padding:"11px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.text2,fontSize:12}}>100%</td></tr></tfoot>
      </table>
    </Card>
  </div>);}

function ScamView(){
  const[rules,setRules]=useState(SCAM_RULES);
  const[exp,setExp]=useState(null);
  const blocked=AIRDROPS.filter(a=>!a.verified);const verified=AIRDROPS.filter(a=>a.verified);const pending=AIRDROPS.filter(a=>a.status==="Pending");
  const tr=id=>setRules(r=>r.map(rule=>rule.id===id?{...rule,active:!rule.active}:rule));
  const SEV={Critical:T.red,High:T.amber,Medium:T.blue};
  const SBar=({score})=>(<div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:72,height:5,background:T.bg3,borderRadius:4,overflow:"hidden"}}><div style={{width:`${score}%`,height:"100%",borderRadius:4,background:`linear-gradient(90deg,${T.amber},${T.red})`}}/></div><span style={{fontSize:11,color:T.red,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{score}/100</span></div>);
  const LOG=[{time:"Today 14:22",chain:"ethereum",msg:"Routine scan complete — 0 new threats",type:"ok"},{time:"Today 09:01",chain:"ethereum",msg:"EigenLayer EIGEN verified vs. official deployer",type:"ok"},{time:"Aug 14",chain:"ethereum",msg:"ETHX BLOCKED — Dust attack + Unverified contract",type:"block"},{time:"Jul 02",chain:"arbitrum",msg:"ARB2 BLOCKED — Impersonation + Fake deployer",type:"block"},{time:"Jun 20",chain:"ethereum",msg:"LayerZero ZRO verified — Foundation multisig OK",type:"ok"},{time:"May 10",chain:"ethereum",msg:"FREE_USDC BLOCKED — Honeypot + Zero liquidity",type:"block"},{time:"Mar 21",chain:"ethereum",msg:"Rule PROXY disabled by admin",type:"admin"},{time:"Feb 28",chain:"cosmos",msg:"dYdX DYDX verified — governance snapshot OK",type:"ok"}];
  return(<div>
    <SH title="Scam Filter & Transaction Audit" sub="Multi-layer detection engine · All incoming token events"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:20}}>
      <KPI label="Transactions" value={num(AIRDROPS.length)} sub="Total analyzed" accent={T.blue}/>
      <KPI label="Verified Safe" value={verified.length} sub="Passed all checks" accent={T.green}/>
      <KPI label="Threats Blocked" value={blocked.length} sub="Quarantined" accent={T.red}/>
      <KPI label="Rules Active" value={rules.filter(r=>r.active).length} sub={`of ${rules.length} rules`} accent={T.amber}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
      <div>
        <div style={{fontSize:10,letterSpacing:2,color:T.text2,textTransform:"uppercase",marginBottom:13}}>Detection Rules</div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>{rules.map(r=>(<div key={r.id} onClick={()=>setExp(exp===r.id?null:r.id)} style={{background:exp===r.id?`${SEV[r.severity]}0D`:T.bg1,border:`1px solid ${exp===r.id?`${SEV[r.severity]}40`:T.border}`,borderRadius:9,padding:"12px 15px",cursor:"pointer",opacity:r.active?1:0.45,transition:"all 0.15s"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}><Chip label={r.severity} color={SEV[r.severity]} small/><span style={{color:T.text0,fontWeight:600,fontSize:13}}>{r.label}</span>{r.triggered>0&&<Chip label={`${r.triggered} caught`} color={T.red} small/>}</div>
            <div onClick={e=>{e.stopPropagation();tr(r.id);}} style={{width:34,height:19,borderRadius:10,background:r.active?`${T.green}28`:T.bg3,border:`1px solid ${r.active?T.green:T.border}`,display:"flex",alignItems:"center",padding:2,justifyContent:r.active?"flex-end":"flex-start",cursor:"pointer",transition:"all 0.2s"}}><div style={{width:13,height:13,borderRadius:"50%",background:r.active?T.green:T.text3,transition:"all 0.2s"}}/></div>
          </div>
          {exp===r.id&&<div style={{marginTop:9,paddingTop:9,borderTop:`1px solid ${T.border}`,fontSize:12,color:T.text1}}>{r.desc}</div>}
        </div>))}</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        <div>
          <div style={{fontSize:10,letterSpacing:2,color:T.red,textTransform:"uppercase",marginBottom:11}}>⚠ Blocked Transactions ({blocked.length})</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>{blocked.map(a=>(<Card key={a.id} accent={T.red} style={{padding:15}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}><div><div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}><span style={{color:T.red,fontWeight:800,fontSize:14}}>{a.protocol}</span><SC status="Blocked"/></div><CC chain={a.chain} small/></div><SBar score={a.scamScore}/></div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>{a.scamFlags.map(f=><Chip key={f} label={f} color={T.red} small/>)}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:10,color:T.text3,fontFamily:"'IBM Plex Mono',monospace"}}>{a.txHash}</span><span style={{fontSize:10,color:T.text2}}>{a.date} · {num(a.amount)} {a.token}</span></div>
          </Card>))}</div>
        </div>
        {pending.length>0&&(<div>
          <div style={{fontSize:10,letterSpacing:2,color:T.amber,textTransform:"uppercase",marginBottom:11}}>⏳ Pending Claim</div>
          {pending.map(a=>(<Card key={a.id} accent={T.amber} style={{padding:15}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{color:T.amber,fontWeight:700,fontSize:14,marginBottom:4}}>{a.protocol} — {a.token}</div><CC chain={a.chain} small/></div><div style={{textAlign:"right"}}><div style={{fontFamily:"'IBM Plex Mono',monospace",color:T.text0,fontWeight:700}}>{usd(a.usdValue)}</div><div style={{fontSize:10,color:T.text2}}>{num(a.amount)} tokens</div></div></div></Card>))}
        </div>)}
      </div>
    </div>
    <Card><div style={{padding:"13px 18px",borderBottom:`1px solid ${T.border}`,fontSize:10,letterSpacing:2,color:T.text2,textTransform:"uppercase"}}>Audit Log</div>{LOG.map((l,i)=>{const color=l.type==="ok"?T.green:l.type==="block"?T.red:T.amber;const icon=l.type==="ok"?"✓":l.type==="block"?"✗":"⚙";return(<div key={i} style={{display:"flex",gap:13,padding:"11px 18px",borderBottom:`1px solid ${T.border}28`,alignItems:"flex-start"}}><div style={{width:18,height:18,borderRadius:4,background:`${color}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}><span style={{fontSize:9,color}}>{icon}</span></div><div style={{flex:1}}><div style={{fontSize:12,color:T.text0}}>{l.msg}</div><div style={{fontSize:10,color:T.text3,marginTop:2,display:"flex",alignItems:"center",gap:7}}>{l.time} · <CC chain={l.chain} small/></div></div></div>);})}
    </Card>
  </div>);}

function AirdropsView(){
  const[showB,setShowB]=useState(false);const[search,setSearch]=useState("");
  const verified=AIRDROPS.filter(a=>a.verified);const totalVal=verified.reduce((s,a)=>s+a.usdValue,0);const pendingVal=AIRDROPS.filter(a=>a.status==="Pending").reduce((s,a)=>s+a.usdValue,0);
  const filtered=AIRDROPS.filter(a=>showB||a.verified).filter(a=>!search||a.protocol.toLowerCase().includes(search.toLowerCase())||a.token.toLowerCase().includes(search.toLowerCase()));
  return(<div>
    <SH title="Airdrop Tracker" sub="All token distribution events · Verified and blocked" right={<div style={{display:"flex",gap:8,alignItems:"center"}}><input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{background:T.bg2,border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 13px",color:T.text0,fontSize:12,outline:"none",fontFamily:"inherit",width:190}}/><FB label="Show Blocked" active={showB} onClick={()=>setShowB(!showB)} count={AIRDROPS.filter(a=>!a.verified).length}/></div>}/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:20}}>
      <KPI label="Airdrop Revenue" value={usd(totalVal,true)} sub="Verified only" accent={T.purple}/>
      <KPI label="Events Tracked" value={verified.length} sub="All chains" accent={T.blue}/>
      <KPI label="Pending Claim" value={usd(pendingVal,true)} sub="Ready to claim" accent={T.amber}/>
      <KPI label="Scams Blocked" value={AIRDROPS.filter(a=>!a.verified).length} sub="Quarantined" accent={T.red}/>
    </div>
    <Card>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{borderBottom:`1px solid ${T.border}`}}>{["Protocol","Chain","Token","Amount","USD Value","Date","Method","Status","Tx Hash"].map(l=>(<th key={l} style={{padding:"11px 14px",textAlign:"left",fontSize:10,color:T.text2,letterSpacing:1.5,textTransform:"uppercase"}}>{l}</th>))}</tr></thead>
        <tbody>{filtered.map((a,i)=>(<tr key={a.id} style={{borderBottom:`1px solid ${T.border}30`,background:!a.verified?`${T.red}07`:i%2?"#ffffff03":"transparent"}} onMouseEnter={e=>e.currentTarget.style.background=!a.verified?`${T.red}12`:`${T.blue}08`} onMouseLeave={e=>e.currentTarget.style.background=!a.verified?`${T.red}07`:i%2?"#ffffff03":"transparent"}>
          <td style={{padding:"12px 14px"}}><div style={{display:"flex",alignItems:"center",gap:7}}><span style={{color:T.text0,fontWeight:700,fontSize:13}}>{a.protocol}</span>{!a.verified&&<Chip label="SCAM" color={T.red} small/>}</div>{!a.verified&&<div style={{display:"flex",gap:4,marginTop:4,flexWrap:"wrap"}}>{a.scamFlags.map(f=><Chip key={f} label={f} color={T.red} small/>)}</div>}</td>
          <td style={{padding:"12px 14px"}}><CC chain={a.chain} small/></td>
          <td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:a.verified?T.purple:T.text3,fontSize:12,fontWeight:600}}>{a.token}</td>
          <td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.text1,fontSize:12}}>{num(a.amount)}</td>
          <td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:a.verified?T.text0:T.text3,fontWeight:a.verified?600:400,fontSize:13}}>{a.verified?usd(a.usdValue):"—"}</td>
          <td style={{padding:"12px 14px",color:T.text2,fontSize:12}}>{a.date}</td>
          <td style={{padding:"12px 14px",color:T.text2,fontSize:12}}>{a.method}</td>
          <td style={{padding:"12px 14px"}}><SC status={a.status}/></td>
          <td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.text3,fontSize:10}}>{a.txHash}</td>
        </tr>))}</tbody>
      </table>
    </Card>
  </div>);}

function OverviewView(){
  const totalTVL=HOLDINGS.reduce((s,h)=>s+h.usdValue,0);const wAPY=HOLDINGS.reduce((s,h)=>s+h.apy*h.usdValue,0)/totalTVL;const monthly=HOLDINGS.reduce((s,h)=>s+h.usdValue*h.apy/100/12,0);const airVal=AIRDROPS.filter(a=>a.verified).reduce((s,a)=>s+a.usdValue,0);
  const chainTVL=Object.entries(HOLDINGS.reduce((a,h)=>{a[h.chain]=(a[h.chain]||0)+h.usdValue;return a;},{})).sort((a,b)=>b[1]-a[1]).map(([c,v])=>({name:CHAINS[c].name,value:v,color:CHAINS[c].color,icon:CHAINS[c].icon}));
  const riskAlloc=["Low","Medium","High"].map(r=>({name:r,value:HOLDINGS.filter(h=>h.risk===r).reduce((s,h)=>s+h.usdValue,0),color:{Low:T.green,Medium:T.amber,High:T.red}[r]}));
  return(<div>
    <div style={{marginBottom:26}}>
      <div style={{fontSize:10,letterSpacing:2.5,color:T.text3,textTransform:"uppercase",marginBottom:5}}>{new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
      <h1 style={{margin:0,fontSize:28,fontWeight:900,color:T.text0,letterSpacing:"-1px"}}>Fund Overview</h1>
      <p style={{margin:"5px 0 0",color:T.text2,fontSize:13}}>Multi-chain DeFi portfolio · {HOLDINGS.length} positions · {Object.keys(CHAINS).length} blockchains</p>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:20}}>
      <KPI label="Total AUM" value={usd(totalTVL,true)} sub="↑ 6.4% this month" accent={T.blue}/>
      <KPI label="Blended APY" value={pct(wAPY)} sub="Weighted average" accent={T.green}/>
      <KPI label="Monthly Yield" value={usd(monthly,true)} sub="Protocol run rate" accent={T.purple}/>
      <KPI label="Airdrop Revenue" value={usd(airVal,true)} sub={`${AIRDROPS.filter(a=>a.verified).length} events`} accent={T.amber}/>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:18,marginBottom:18}}>
      <Card accent={T.blue} style={{padding:24}}>
        <div style={{fontSize:10,letterSpacing:2,color:T.text2,textTransform:"uppercase",marginBottom:16}}>24-Month Earnings History</div>
        <ResponsiveContainer width="100%" height={240}><AreaChart data={EARN}><defs>{[[T.blue,"bl"],[T.green,"gr"],[T.purple,"pu"],[T.amber,"am"]].map(([c,k])=>(<linearGradient key={k} id={`ov${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={c} stopOpacity={0.35}/><stop offset="95%" stopColor={c} stopOpacity={0}/></linearGradient>))}</defs>
          <XAxis dataKey="month" stroke={T.border} tick={{fill:T.text2,fontSize:9}} interval={2}/><YAxis stroke={T.border} tick={{fill:T.text2,fontSize:9}} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/><Tooltip content={<TTip/>}/>
          <Area type="monotone" dataKey="lending"  stackId="1" stroke={T.blue}   fill="url(#ovbl)" strokeWidth={0} name="lending"/>
          <Area type="monotone" dataKey="dex_lp"   stackId="1" stroke={T.purple} fill="url(#ovpu)" strokeWidth={0} name="dex_lp"/>
          <Area type="monotone" dataKey="staking"  stackId="1" stroke={T.green}  fill="url(#ovgr)" strokeWidth={0} name="staking"/>
          <Area type="monotone" dataKey="airdrops" stackId="1" stroke={T.amber}  fill="url(#ovam)" strokeWidth={0} name="airdrops"/>
        </AreaChart></ResponsiveContainer>
      </Card>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Card style={{padding:20}}>
          <div style={{fontSize:10,letterSpacing:2,color:T.text2,textTransform:"uppercase",marginBottom:12}}>Risk Allocation</div>
          {riskAlloc.map(r=>(<div key={r.name} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:r.color,fontWeight:600}}>{r.name} Risk</span><span style={{fontSize:12,fontFamily:"'IBM Plex Mono',monospace",color:T.text1}}>{usd(r.value,true)}</span></div><div style={{height:4,background:T.bg3,borderRadius:4}}><div style={{width:`${(r.value/totalTVL)*100}%`,height:"100%",background:r.color,borderRadius:4}}/></div><div style={{fontSize:10,color:T.text3,marginTop:2,textAlign:"right"}}>{pct((r.value/totalTVL)*100)}</div></div>))}
        </Card>
        <Card style={{padding:20}}>
          <div style={{fontSize:10,letterSpacing:2,color:T.red,textTransform:"uppercase",marginBottom:11}}>Security Status</div>
          {[["Threats blocked",`${AIRDROPS.filter(a=>!a.verified).length} scams`,T.red],["Rules active",`${SCAM_RULES.filter(r=>r.active).length}/${SCAM_RULES.length}`,T.green],["Last scan","14:22 UTC",T.blue],["Pending claims",`${AIRDROPS.filter(a=>a.status==="Pending").length} events`,T.amber]].map(([l,v,c])=>(<div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}><span style={{fontSize:12,color:T.text1}}>{l}</span><Chip label={v} color={c} small/></div>))}
        </Card>
      </div>
    </div>
    <Card style={{padding:22}}>
      <div style={{fontSize:10,letterSpacing:2,color:T.text2,textTransform:"uppercase",marginBottom:16}}>Chain Distribution</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:11}}>{chainTVL.map(c=>(<div key={c.name} style={{background:T.bg2,border:`1px solid ${T.border}`,borderRadius:10,padding:"13px 15px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}><span style={{fontSize:15,color:c.color}}>{c.icon}</span><span style={{fontSize:10,color:T.text3,fontFamily:"'IBM Plex Mono',monospace"}}>{pct((c.value/totalTVL)*100)}</span></div><div style={{fontSize:11,color:T.text1,marginBottom:4,fontWeight:600}}>{c.name}</div><div style={{fontSize:13,fontWeight:800,fontFamily:"'IBM Plex Mono',monospace",color:T.text0}}>{usd(c.value,true)}</div><div style={{height:2.5,background:T.bg3,borderRadius:4,marginTop:9}}><div style={{width:`${(c.value/chainTVL[0].value)*100}%`,height:"100%",background:c.color,borderRadius:4}}/></div></div>))}</div>
    </Card>
  </div>);}

const NAV=[{id:"overview",label:"Overview",icon:"◈"},{id:"holdings",label:"Holdings",icon:"⬡"},{id:"earnings",label:"Yield & Earnings",icon:"↗"},{id:"airdrops",label:"Airdrops",icon:"◉"},{id:"scam",label:"Scam Filter",icon:"⚡"}];

export default function App(){
  const[view,setView]=useState("overview");
  const scamAlert=AIRDROPS.filter(a=>!a.verified).length;const pendAlert=AIRDROPS.filter(a=>a.status==="Pending").length;
  return(<div style={{minHeight:"100vh",background:T.bg0,fontFamily:"'DM Sans','Helvetica Neue',sans-serif",color:T.text1,display:"flex"}}>
    <aside style={{width:224,background:T.bg1,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,bottom:0,zIndex:20}}>
        // State for real DeBank API data
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useRealData, setUseRealData] = useState(true); // Toggle between demo and real data

  // Fetch data from DeBank API on component mount
  useEffect(() => {
    async function fetchWalletData() {
      if (!useRealData) {
        setLoading(false);
        return; // Use demo data
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching DeBank data for wallet:', TEST_WALLET_ADDRESS);
        
        // Fetch data in parallel
        const [totalBalanceData, ethTokens, ethProtocols] = await Promise.all([
          debankAPI.getUserTotalBalance(TEST_WALLET_ADDRESS),
          debankAPI.getUserTokenList(TEST_WALLET_ADDRESS, 'eth', true),
          debankAPI.getUserComplexProtocolList(TEST_WALLET_ADDRESS, 'eth')
        ]);

        setWalletData({
          totalBalance: totalBalanceData,
          ethTokens: ethTokens,
          ethProtocols: ethProtocols
        });
        
        console.log('DeBank data loaded successfully:', {
          totalBalance: totalBalanceData,
          tokensCount: ethTokens.length,
          protocolsCount: ethProtocols.length
        });
      } catch (err) {
        console.error('Error fetching DeBank data:', err);
        setError(err.message || 'Failed to fetch wallet data');
        // Fallback to demo data on error
        setUseRealData(false);
      } finally {
        setLoading(false);
      }
        }
      

    fetchWalletData();
  }, [useRealData]);

  // Loading state
  if (loading) {
    return (
      <div style={{minHeight:"100vh",background:"T.bg0",fontFamily:"'DM Sans','Helvetica Neue',sans-serif",color:"T.text1",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:24,marginBottom:16}}>Loading DeBank data...</div>
          <div style={{fontSize:14,color:"T.text3"}}>Wallet: {TEST_WALLET_ADDRESS.slice(0,6)}...{TEST_WALLET_ADDRESS.slice(-4)}</div>
        </div>
      </div>
    );
  }

  // Error state with fallback to demo data
  if (error && !walletData) {
    console.warn('Using demo data due to error:', error);
  }

      <div style={{padding:"24px 20px 20px",borderBottom:`1px solid ${T.border}`}}>
              {/* Data Source Banner */}
      {walletData ? (
        <div style={{padding:"12px 24px",background:"linear-gradient(135deg,#10b981,#059669)",color:"white",fontSize:13,fontWeight:600,textAlign:"center"}}>
          ✓ LIVE DATA: Connected to DeBank API | Wallet: {TEST_WALLET_ADDRESS.slice(0,6)}...{TEST_WALLET_ADDRESS.slice(-4)}
        </div>
      ) : (
        <div style={{padding:"12px 24px",background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"white",fontSize:13,fontWeight:600,textAlign:"center"}}>
          ⚠ DEMO MODE: Using mock data | Waiting for DeBank API credits | <button onClick={()=>setUseRealData(true)} style={{marginLeft:8,padding:"4px 12px",background:"rgba(255,255,255,0.2)",border:"1px solid white",borderRadius:4,color:"white",cursor:"pointer"}}>Retry Connection</button>
        </div>
      )}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,borderRadius:7,background:`linear-gradient(135deg,${T.blue},${T.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>⬡</div>
          <div><div style={{fontSize:15,fontWeight:800,color:T.text0,letterSpacing:"-0.5px"}}>DefiVault</div><div style={{fontSize:9,color:T.text3,letterSpacing:2,textTransform:"uppercase"}}>Fund Backoffice</div></div>
        </div>
      </div>
      <nav style={{padding:"13px 11px",flex:1}}>{NAV.map(n=>{const alert=n.id==="scam"?scamAlert:n.id==="airdrops"?pendAlert:0;return(<button key={n.id} onClick={()=>setView(n.id)} style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:"9px 11px",borderRadius:8,marginBottom:2,background:view===n.id?`${T.blue}18`:"transparent",border:view===n.id?`1px solid ${T.blue}28`:"1px solid transparent",color:view===n.id?"#90BAFF":T.text2,fontWeight:view===n.id?700:400,fontSize:13,cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all 0.15s"}}><span style={{fontSize:15,width:19,textAlign:"center"}}>{n.icon}</span><span style={{flex:1}}>{n.label}</span>{alert>0&&<span style={{background:n.id==="scam"?`${T.red}1A`:`${T.amber}1A`,color:n.id==="scam"?T.red:T.amber,border:`1px solid ${n.id==="scam"?T.red:T.amber}30`,borderRadius:9,padding:"1px 6px",fontSize:10,fontWeight:700}}>{alert}</span>}</button>);})}</nav>
      <div style={{padding:"15px 20px",borderTop:`1px solid ${T.border}`}}>
        <div style={{fontSize:9,color:T.text3,letterSpacing:2,marginBottom:9,textTransform:"uppercase"}}>System Status</div>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}><div style={{width:7,height:7,borderRadius:"50%",background:T.green,boxShadow:`0 0 7px ${T.green}`}}/><span style={{fontSize:11,color:T.green}}>All systems nominal</span></div>
        <div style={{fontSize:10,color:T.text3}}>Last scan · 14:22 UTC</div>
        <div style={{fontSize:10,color:T.text3,marginTop:2}}>{Object.keys(CHAINS).length} chains monitored</div>
      </div>
    </aside>
    <main style={{marginLeft:224,flex:1,padding:"30px 34px",minHeight:"100vh",maxWidth:"calc(100vw - 224px)"}}>
      {view==="overview"&&<OverviewView/>}{view==="holdings"&&<HoldingsView/>}{view==="earnings"&&<EarningsView/>}{view==="airdrops"&&<AirdropsView/>}{view==="scam"&&<ScamView/>}
    </main>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&family=IBM+Plex+Mono:wght@400;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:5px;height:5px;}::-webkit-scrollbar-track{background:${T.bg0};}::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px;}button{transition:all 0.15s;}input::placeholder{color:${T.text3};}`}</style>
  <
    
    /*
 * USAGE INSTRUCTIONS FOR DEBANK API:
 * 
 * To fetch real data from DeBank API for the test wallet:
 * 
 * Example 1: Get total balance
 * const data = await debankAPI.getUserTotalBalance(TEST_WALLET_ADDRESS);
 * console.log(data);
 * 
 * Example 2: Get tokens on Ethereum
 * const tokens = await debankAPI.getUserTokenList(TEST_WALLET_ADDRESS, 'eth');
 * console.log(tokens);
 * 
 * Example 3: Get protocol positions on Ethereum
 * const protocols = await debankAPI.getUserComplexProtocolList(TEST_WALLET_ADDRESS, 'eth');
 * console.log(protocols);
 * 
 * Example 4: Get transaction history
 * const history = await debankAPI.getUserHistoryList(TEST_WALLET_ADDRESS, 'eth');
 * console.log(history);
 * 
 * NOTE: You need to purchase DeBank API units at https://cloud.debank.com/open-api
 * Current balance: 0 units
 * Or request a 14-day free trial by contacting: hello.cloud@debank.com
 *//div>);}
