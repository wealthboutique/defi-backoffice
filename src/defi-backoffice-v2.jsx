import { useState, useMemo, useCallback } from "react";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart } from "recharts";

const T={bg0:"#03070F",bg1:"#080F1E",bg2:"#0C1628",bg3:"#101E35",border:"#152035",text0:"#EDF2FF",text1:"#9DB4D6",text2:"#526680",text3:"#2E4060",green:"#00E5A0",red:"#FF3B6A",amber:"#FFB020",blue:"#4E9EFF",purple:"#A855F7"};
const CHAINS={ethereum:{name:"Ethereum",short:"ETH",color:"#627EEA",icon:"Ξ"},arbitrum:{name:"Arbitrum",short:"ARB",color:"#28A0F0",icon:"△"},optimism:{name:"Optimism",short:"OP",color:"#FF0420",icon:"⊙"},base:{name:"Base",short:"BASE",color:"#0052FF",icon:"◎"},polygon:{name:"Polygon",short:"MATIC",color:"#8247E5",icon:"⮡"},solana:{name:"Solana",short:"SOL",color:"#9945FF",icon:"◎"},cosmos:{name:"Cosmos",short:"ATOM",color:"#6F7390",icon:"⚛"},avalanche:{name:"Avalanche",short:"AVAX",color:"#E84142",icon:"▲"},bsc:{name:"BNB Chain",short:"BNB",color:"#F0B90B",icon:"⮡"}};
const HOLDINGS_DEMO=[
 {id:1,protocol:"Aave V3",chain:"ethereum",token:"aUSDC",usdValue:2450000,apy:4.2,apyBreakdown:{base:3.1,boost:1.1,rewards:0},category:"Lending",risk:"Low",tvlProtocol:8200000000,audited:true,age:892,entryPrice:2380000,entryDate:"2022-08-15",costBasis:2380000},
 {id:2,protocol:"Lido",chain:"ethereum",token:"stETH",usdValue:3112000,apy:3.9,apyBreakdown:{base:3.9,boost:0,rewards:0},category:"Liquid Staking",risk:"Low",tvlProtocol:21000000000,audited:true,age:1200,entryPrice:2800000,entryDate:"2022-04-10",costBasis:2800000},
 {id:3,protocol:"Curve 3pool",chain:"ethereum",token:"3CRV",usdValue:1780000,apy:5.8,apyBreakdown:{base:2.1,boost:1.4,rewards:2.3},category:"Stablecoin LP",risk:"Low",tvlProtocol:3400000000,audited:true,age:1450,entryPrice:1750000,entryDate:"2022-01-20",costBasis:1750000},
 {id:4,protocol:"Convex",chain:"ethereum",token:"cvxCRV",usdValue:320000,apy:9.1,apyBreakdown:{base:4.2,boost:3.1,rewards:1.8},category:"Yield Boost",risk:"Medium",tvlProtocol:4100000000,audited:true,age:1100,entryPrice:310000,entryDate:"2022-06-01",costBasis:310000},
 {id:5,protocol:"Pendle",chain:"ethereum",token:"PT-stETH",usdValue:560000,apy:14.3,apyBreakdown:{base:3.9,boost:10.4,rewards:0},category:"Yield Tokenization",risk:"Medium",tvlProtocol:1800000000,audited:true,age:380,entryPrice:490000,entryDate:"2023-08-10",costBasis:490000},
 {id:6,protocol:"Uniswap V3",chain:"arbitrum",token:"ETH/USDC LP",usdValue:1200000,apy:18.7,apyBreakdown:{base:18.7,boost:0,rewards:0},category:"DEX LP",risk:"Medium",tvlProtocol:5600000000,audited:true,age:740,entryPrice:1050000,entryDate:"2022-10-05",costBasis:1050000},
 {id:7,protocol:"GMX V2",chain:"arbitrum",token:"GM ETH-USDC",usdValue:890000,apy:22.1,apyBreakdown:{base:14.2,boost:0,rewards:7.9},category:"Derivatives LP",risk:"High",tvlProtocol:780000000,audited:true,age:290,entryPrice:820000,entryDate:"2023-10-20",costBasis:820000},
 {id:8,protocol:"Radiant",chain:"arbitrum",token:"rUSDC",usdValue:440000,apy:11.4,apyBreakdown:{base:5.1,boost:4.2,rewards:2.1},category:"Lending",risk:"Medium",tvlProtocol:320000000,audited:true,age:510,entryPrice:420000,entryDate:"2023-04-01",costBasis:420000},
 {id:9,protocol:"Velodrome",chain:"optimism",token:"USDC/DAI vLP",usdValue:380000,apy:8.4,apyBreakdown:{base:3.1,boost:0,rewards:5.3},category:"Stablecoin LP",risk:"Low",tvlProtocol:650000000,audited:true,age:620,entryPrice:370000,entryDate:"2023-01-15",costBasis:370000},
 {id:10,protocol:"Exactly",chain:"optimism",token:"eUSDC",usdValue:290000,apy:7.2,apyBreakdown:{base:7.2,boost:0,rewards:0},category:"Lending",risk:"Medium",tvlProtocol:180000000,audited:true,age:410,entryPrice:280000,entryDate:"2023-06-10",costBasis:280000},
 {id:11,protocol:"Aerodrome",chain:"base",token:"USDC/ETH vLP",usdValue:520000,apy:21.8,apyBreakdown:{base:8.1,boost:0,rewards:13.7},category:"DEX LP",risk:"Medium",tvlProtocol:820000000,audited:true,age:310,entryPrice:480000,entryDate:"2023-10-01",costBasis:480000},
 {id:12,protocol:"Moonwell",chain:"base",token:"mUSDC",usdValue:340000,apy:6.3,apyBreakdown:{base:4.8,boost:1.5,rewards:0},category:"Lending",risk:"Low",tvlProtocol:290000000,audited:true,age:280,entryPrice:335000,entryDate:"2023-11-01",costBasis:335000},
 {id:13,protocol:"Marinade",chain:"solana",token:"mSOL",usdValue:2345000,apy:7.2,apyBreakdown:{base:7.2,boost:0,rewards:0},category:"Liquid Staking",risk:"Low",tvlProtocol:1200000000,audited:true,age:880,entryPrice:1900000,entryDate:"2022-09-01",costBasis:1900000},
 {id:14,protocol:"Raydium CLMM",chain:"solana",token:"SOL/USDC",usdValue:240000,apy:41.2,apyBreakdown:{base:41.2,boost:0,rewards:0},category:"DEX LP",risk:"High",tvlProtocol:450000000,audited:true,age:420,entryPrice:210000,entryDate:"2023-06-01",costBasis:210000},
 {id:15,protocol:"Kamino",chain:"solana",token:"kUSDC",usdValue:610000,apy:9.8,apyBreakdown:{base:6.2,boost:3.6,rewards:0},category:"Lending",risk:"Medium",tvlProtocol:680000000,audited:true,age:360,entryPrice:590000,entryDate:"2023-08-01",costBasis:590000},
 {id:16,protocol:"Osmosis",chain:"cosmos",token:"OSMO/ATOM",usdValue:670000,apy:31.4,apyBreakdown:{base:12.1,boost:0,rewards:19.3},category:"DEX LP",risk:"High",tvlProtocol:340000000,audited:true,age:730,entryPrice:580000,entryDate:"2022-10-20",costBasis:580000},
 {id:17,protocol:"Quasar",chain:"cosmos",token:"qATOM",usdValue:352000,apy:18.6,apyBreakdown:{base:8.4,boost:0,rewards:10.2},category:"Yield Vault",risk:"Medium",tvlProtocol:120000000,audited:false,age:290,entryPrice:340000,entryDate:"2023-10-20",costBasis:340000},
 {id:18,protocol:"Trader Joe",chain:"avalanche",token:"AVAX/USDC LB",usdValue:280000,apy:28.9,apyBreakdown:{base:28.9,boost:0,rewards:0},category:"DEX LP",risk:"High",tvlProtocol:210000000,audited:true,age:480,entryPrice:260000,entryDate:"2023-04-20",costBasis:260000},
 {id:19,protocol:"AAVE V3",chain:"polygon",token:"aWETH",usdValue:912000,apy:3.1,apyBreakdown:{base:2.4,boost:0.7,rewards:0},category:"Lending",risk:"Low",tvlProtocol:8200000000,audited:true,age:760,entryPrice:870000,entryDate:"2022-11-01",costBasis:870000},
 {id:20,protocol:"Venus",chain:"bsc",token:"vUSDT",usdValue:180000,apy:5.6,apyBreakdown:{base:4.1,boost:1.5,rewards:0},category:"Lending",risk:"Medium",tvlProtocol:1900000000,audited:true,age:920,entryPrice:175000,entryDate:"2022-08-01",costBasis:175000},
];
const TRANSACTIONS=[
 {id:1,date:"2022-01-20",type:"Deposit",protocol:"Curve 3pool",chain:"ethereum",token:"USDC",amount:1750000,usdValue:1750000,fee:420,feePct:0.024,txHash:"0xabc1...",category:"Entry",notes:"Initial LP position"},
 {id:2,date:"2022-04-10",type:"Deposit",protocol:"Lido",chain:"ethereum",token:"ETH",amount:1200,usdValue:2800000,fee:380,feePct:0.014,txHash:"0xabc2...",category:"Entry",notes:"ETH staking allocation"},
 {id:3,date:"2022-06-01",type:"Deposit",protocol:"Convex",chain:"ethereum",token:"CRV",amount:900000,usdValue:310000,fee:210,feePct:0.068,txHash:"0xabc3...",category:"Entry",notes:"Boosted yield strategy"},
 {id:4,date:"2022-08-01",type:"Deposit",protocol:"Venus",chain:"bsc",token:"USDT",amount:175000,usdValue:175000,fee:15,feePct:0.009,txHash:"0xbsc1...",category:"Entry",notes:"BSN stablecoin yield"},
 {id:5,date:"2022-08-15",type:"Deposit",protocol:"Aave V3",chain:"ethereum",token:"USDC",amount:2380000,usdValue:2380000,fee:520,feePct:0.022,txHash:"0xabc4...",category:"Entry",notes:"Primary lending position"},
 {id:6,date:"2022-09-01",type:"Deposit",protocol:"Marinade",chain:"solana",token:"SOL",amount:28000,usdValue:1900000,fee:12,feePct:0.001,txHash:"sol1...",category:"Entry",notes:"Solana liquid staking"},
 {id:7,date:"2022-10-05",type:"Deposit",protocol:"Uniswap V3",chain:"arbitrum",token:"ETH/USDC",amount:1050000,usdValue:1050000,fee:890,feePct:0.085,txHash:"0xarb1...",category:"Entry",notes:"Concentrated liquidity range"},
 {id:8,date:"2022-10-20",type:"Deposit",protocol:"Osmosis",chain:"cosmos",token:"OSMO/ATOM",amount:580000,usdValue:580000,fee:8,feePct:0.001,txHash:"cosmos1...",category:"Entry",notes:"Cosmos DEX pool"},
 {id:9,date:"2022-11-01",type:"Deposit",protocol:"AAVE V3",chain:"polygon",token:"WETH",amount:560,usdValue:870000,fee:45,feePct:0.005,txHash:"0xpoly1...",category:"Entry",notes:"Polygon lending"},
 {id:10,date:"2023-01-15",type:"Deposit",protocol:"Velodrome",chain:"optimism",token:"USDC/DAI",amount:370000,usdValue:370000,fee:38,feePct:0.010,txHash:"0xop1...",category:"Entry",notes:"Optimism stable pool"},
 {id:11,date:"2023-01-20",type:"Yield Claim",protocol:"Aave V3",chain:"ethereum",token:"USDC",amount:18400,usdValue:18400,fee:85,feePct:0.005,txHash:"0xclaim1...",category:"Income",notes:"Q4 2022 interest"},
 {id:12,date:"2023-03-23",type:"Airdrop",protocol:"Arbitrum",chain:"arbitrum",token:"ARB",amount:125000,usdValue:187500,fee:0,feePct:0,txHash:"0xarb2...",category:"Airdrop",notes:"ARB governance airdrop"},
 {id:13,date:"2023-04-01",type:"Deposit",protocol:"Radiant",chain:"arbitrum",token:"USDC",amount:420000,usdValue:420000,fee:420,feePct:0.100,txHash:"0xarb3...",category:"Entry",notes:"Arbitrum lending expansion"},
 {id:14,date:"2023-06-01",type:"Airdrop",protocol:"Optimism",chain:"optimism",token:"OP",amount:84000,usdValue:126000,fee:0,feePct:0,txHash:"0xop2...",category:"Airdrop",notes:"OP retroactive airdrop"},
 {id:15,date:"2023-06-10",type:"Deposit",protocol:"Exactly",chain:"optimism",token:"USDC",amount:280000,usdValue:280000,fee:28,feePct:0.010,txHash:"0xop3...",category:"Entry",notes:"Fixed rate lending"},
 {id:16,date:"2023-06-01",type:"Deposit",protocol:"Raydium CLMM",chain:"solana",token:"SOL/USDC",amount:210000,usdValue:210000,fee:5,feePct:0.002,txHash:"ray1...",category:"Entry",notes:"CLMM high yield range"},
 {id:17,date:"2023-07-01",type:"Rebalance",protocol:"Uniswap V3",chain:"arbitrum",token:"ETH/USDC",amount:1080000,usdValue:1080000,fee:1200,feePct:0.111,txHash:"0xarb4...",category:"Management",notes:"Range rebalance +2.9% gain"},
 {id:18,date:"2023-08-01",type:"Deposit",protocol:"Kamino",chain:"solana",token:"USDC",amount:590000,usdValue:590000,fee:6,feePct:0.001,txHash:"ray2...",category:"Entry",notes:"Automated yield vault"},
 {id:19,date:"2023-08-10",type:"Deposit",protocol:"Pendle",chain:"ethereum",token:"stETH",amount:490000,usdValue:490000,fee:680,feePct:0.139,txHash:"0xpen1...",category:"Entry",notes:"Fixed yield PT token"},
 {id:20,date:"2023-10-01",type:"Deposit",protocol:"Aerodrome",chain:"base",token:"USDC/ETH",amount:480000,usdValue:480000,fee:55,feePct:0.011,txHash:"0xbase1...",category:"Entry",notes:"Base DEX vLP"},
 {id:21,date:"2023-10-20",type:"Deposit",protocol:"GMX V2",chain:"arbitrum",token:"ETH-USDC GM",amount:820000,usdValue:820000,fee:920,feePct:0.112,txHash:"0xarb5...",category:"Entry",notes:"GM token delta neutral"},
 {id:22,date:"2023-10-20",type:"Deposit",protocol:"Quasar",chain:"cosmos",token:"ATOM",amount:340000,usdValue:340000,fee:4,feePct:0.001,txHash:"cosmos2...",category:"Entry",notes:"Cosmos yield vault"},
 {id:23,date:"2023-11-01",type:"Deposit",protocol:"Moonwell",chain:"base",token:"USDC",amount:335000,usdValue:335000,fee:38,feePct:0.011,txHash:"0xbase2...",category:"Entry",notes:"Base lending protocol"},
 {id:24,date:"2024-01-15",type:"Airdrop",protocol:"Uniswap",chain:"ethereum",token:"UNI",amount:22000,usdValue:132000,fee:0,feePct:0,txHash:"0xuni1...",category:"Airdrop",notes:"UNI usage airdrop"},
 {id:25,date:"2024-01-31",type:"Airdrop",protocol:"Jupiter",chain:"solana",token:"JUP",amount:55000,usdValue:82500,fee:0,feePct:0,txHash:"jup1...",category:"Airdrop",notes:"JUP exchange airdrop"},
 {id:26,date:"2024-02-28",type:"Airdrop",protocol:"dYdX V4",chain:"cosmos",token:"DYDX",amount:45000,usdValue:135000,fee:0,feePct:0,txHash:"cosmos3...",category:"Airdrop",notes:"dYdX retroactive"},
 {id:27,date:"2024-04-12",type:"Airdrop",protocol:"EigenLayer",chain:"ethereum",token:"EIGEN",amount:18500,usdValue:111000,fee:0,feePct:0,txHash:"0xeig1...",category:"Airdrop",notes:"Restaking airdrop"},
 {id:28,date:"2024-06-01",type:"Yield Claim",protocol:"All Protocols",chain:"ethereum",token:"Various",amount:0,usdValue:485000,fee:1200,feePct:0.247,txHash:"batch1...",category:"Income",notes:"H1 2024 yield harvest"},
 {id:29,date:"2024-06-20",type:"Airdrop",protocol:"LayerZero",chain:"ethereum",token:"ZRO",amount:9200,usdValue:73600,fee:0,feePct:0,txHash:"0xlz1...",category:"Airdrop",notes:"Bridge airdrop"},
 {id:30,date:"2024-12-01",type:"Management Fee",protocol:"Portfolio",chain:"all",token:"USD",amount:0,usdValue:178000,fee:178000,feePct:100,txHash:"fee2024...",category:"Fee",notes:"Annual 1% AUM management fee"},
];
const PORTFOLIO_SNAPSHOTS=[
 {date:"2022-Q1",nav:1750000,deposits:1750000,withdrawals:0,yieldEarned:0,fees:420,pnl:0},
 {date:"2022-Q2",nav:7060000,deposits:5310000,withdrawals:0,yieldEarned:42000,fees:1010,pnl:42000},
 {date:"2022-Q3",nav:9235000,deposits:2170000,withdrawals:0,yieldEarned:89000,fees:1425,pnl:89000},
 {date:"2022-Q4",nav:10755000,deposits:1240000,withdrawals:0,yieldEarned:156000,fees:1875,pnl:156000},
 {date:"2023-Q1",nav:12180000,deposits:790000,withdrawals:0,yieldEarned:310000,fees:2340,pnl:624500},
 {date:"2023-Q2",nav:14650000,deposits:1290000,withdrawals:0,yieldEarned:412000,fees:2890,pnl:924500},
 {date:"2023-Q3",nav:16420000,deposits:870000,withdrawals:0,yieldEarned:534000,fees:3280,pnl:1194000},
 {date:"2023-Q4",nav:17890000,deposits:1475000,withdrawals:0,yieldEarned:688000,fees:3820,pnl:1527000},
 {date:"2024-Q1",nav:18950000,deposits:0,withdrawals:0,yieldEarned:854000,fees:4200,pnl:1882000},
 {date:"2024-Q2",nav:17820000,deposits:0,withdrawals:178000,yieldEarned:978000,fees:182400,pnl:1756000},
];
const AIRDROPS=[
 {id:1,protocol:"Arbitrum",chain:"arbitrum",token:"ARB",amount:125000,usdValue:187500,date:"2023-03-23",status:"Claimed",verified:true,txHash:"0xarb2...",method:"Governance",scamScore:0,scamFlags:[]},
 {id:2,protocol:"Optimism",chain:"optimism",token:"OP",amount:84000,usdValue:126000,date:"2023-06-01",status:"Claimed",verified:true,txHash:"0xop2...",method:"Retroactive",scamScore:0,scamFlags:[]},
 {id:3,protocol:"Uniswap",chain:"ethereum",token:"UNI",amount:22000,usdValue:132000,date:"2024-01-15",status:"Claimed",verified:true,txHash:"0xuni1...",method:"Usage",scamScore:0,scamFlags:[]},
 {id:4,protocol:"dYdX V4",chain:"cosmos",token:"DYDX",amount:45000,usdValue:135000,date:"2024-02-28",status:"Claimed",verified:true,txHash:"cosmos3...",method:"Retroactive",scamScore:0,scamFlags:[]},
 {id:5,protocol:"EigenLayer",chain:"ethereum",token:"EIGEN",amount:18500,usdValue:111000,date:"2024-04-12",status:"Pending",verified:true,txHash:"0xeig1...",method:"Restaking",scamScore:0,scamFlags:[]},
 {id:6,protocol:"LayerZero",chain:"ethereum",token:"ZRO",amount:9200,usdValue:73600,date:"2024-06-20",status:"Claimed",verified:true,txHash:"0xlz1...",method:"Bridge",scamScore:0,scamFlags:[]},
 {id:7,protocol:"Jupiter",chain:"solana",token:"JUP",amount:55000,usdValue:82500,date:"2024-01-31",status:"Claimed",verified:true,txHash:"jup1...",method:"Usage",scamScore:0,scamFlags:[]},
 {id:8,protocol:"Jito",chain:"solana",token:"JTO",amount:12000,usdValue:96000,date:"2023-12-07",status:"Claimed",verified:true,txHash:"jto1...",method:"Staking",scamScore:0,scamFlags:[]},
 {id:9,protocol:"USDC Bonus",chain:"ethereum",token:"FREE_USDC",amount:50000,usdValue:0,date:"2024-05-10",status:"Blocked",verified:false,txHash:"0xdead...",method:"Unknown",scamScore:98,scamFlags:["Honeypot Contract","Zero DEX Liquidity"]},
 {id:10,protocol:"Arbitrum2",chain:"arbitrum",token:"ARB2",amount:10000,usdValue:0,date:"2024-07-02",status:"Blocked",verified:false,txHash:"0xscam...",method:"Unknown",scamScore:95,scamFlags:["Protocol Impersonation"]},
];
const SCAM_RULES=[
 {id:"HONEYPOT",label:"Honeypot Contract",desc:"Transfer function blocks sells",severity:"Critical",active:true,triggered:1},
 {id:"IMPERSONATION",label:"Protocol Impersonation",desc:"Token deployer != official deployer",severity:"Critical",active:true,triggered:1},
 {id:"UNVERIFIED",label:"Unverified Source Code",desc:"Contract not verified on explorer",severity:"High",active:true,triggered:2},
 {id:"NO_LIQ",label:"Zero DEX Liquidity",desc:"Token has no active liquidity pool",severity:"High",active:true,triggered:1},
 {id:"DUST",label:"Dust Attack",desc:"Micro-value token for address poisoning",severity:"Medium",active:true,triggered:1},
];
const MONTHS_L=["Mar'23","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan'24","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan'25","Feb"];
const EARN=MONTHS_L.map((m,i)=>({month:m,lending:[38,41,44,47,51,55,58,62,67,71,74,78,82,86,90,89,93,98,102,107,111,115,118,122][i]*1000,staking:[28,30,32,34,36,38,40,43,46,49,52,55,58,61,64,67,70,74,77,80,83,86,90,93][i]*1000,dex_lp:[55,61,58,64,72,68,75,82,79,86,90,95,88,96,104,112,108,116,120,124,130,127,135,141][i]*1000,stableLP:[20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60,62,64,66][i]*1000,airdrops:[0,0,0,126,0,0,132,0,0,0,96,82,0,135,111,74,42,0,46,0,0,66,28,0][i]*1000,fees:[38,41,44,48,52,56,60,64,68,72,76,80,84,88,92,96,100,104,108,112,116,120,124,128][i]*1000}));
const usd=(n,compact=false)=>{if(compact){if(n>=1e9)return`$${(n/1e9).toFixed(2)}B`;if(n>=1e6)return`$${(n/1e6).toFixed(2)}M`;if(n>=1e3)return`$${(n/1e3).toFixed(0)}K`;return`$${n}`;}return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);};
const pct=n=>`${n>=0?"+":""}${n.toFixed(1)}%`;
const pctN=n=>`${n.toFixed(1)}%`;
const num=n=>new Intl.NumberFormat("en-US").format(n);
function Chip({label,color,small}){return(<span style={{display:"inline-flex",alignItems:"center",background:`${color}1A`,border:`1px solid ${color}33`,borderRadius:5,padding:small?"1px 6px":"3px 9px",fontSize:small?10:11,color,fontWeight:600,whiteSpace:"nowrap"}}>{label}</span>);}
const CC=({chain,small})=>{const c=CHAINS[chain]||{name:chain,icon:"?",color:T.text2};return <Chip label={`${c.icon} ${c.name}`} color={c.color} small={small}/>;}
const RC=({risk})=><Chip label={risk} color={{Low:T.green,Medium:T.amber,High:T.red}[risk]}/>;
const SC=({status})=>{const c={Claimed:T.green,Pending:T.amber,Blocked:T.red}[status];return(<span style={{color:c,fontWeight:700,fontSize:12}}>{status}</span>);};
function Card({children,style,accent}){return(<div style={{background:T.bg1,border:`1px solid ${accent?`${accent}30`:T.border}`,borderRadius:13,overflow:"hidden",position:"relative",...style}}>{accent&&<div style={{position:"absolute",top:0,left:0,right:0,height:1.5,background:`linear-gradient(90deg,transparent,${accent}80,transparent)`}}/>}{children}</div>);}
function KPI({label,value,sub,accent}){return(<Card accent={accent} style={{padding:"20px 22px"}}><div style={{fontSize:10,letterSpacing:2,color:T.text2,textTransform:"uppercase",marginBottom:9}}>{label}</div><div style={{fontSize:26,fontWeight:800,color:T.text0,fontFamily:"'IBM Plex Mono',monospace",lineHeight:1}}>{value}</div>{sub&&<div style={{fontSize:11,color:accent||T.text2,marginTop:6}}>{sub}</div>}</Card>);}
function SH({title,sub,right}){return(<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:20}}><div><h2 style={{margin:0,fontSize:20,fontWeight:800,color:T.text0,letterSpacing:"-0.4px"}}>{title}</h2>{sub&&<p style={{margin:"3px 0 0",fontSize:12,color:T.text2}}>{sub}</p>}</div>{right}</div>);}
function FB({label,active,onClick,count}){return(<button onClick={onClick} style={{padding:"5px 12px",borderRadius:6,border:`1px solid ${active?T.blue:T.border}`,background:active?`${T.blue}18`:"transparent",color:active?T.blue:T.text2,fontSize:12,cursor:"pointer",fontFamily:"inherit",display:"inline-flex",alignItems:"center",gap:5}}>{label}{count!=null&&<span style={{background:T.blue,color:"#fff",borderRadius:"50%",width:18,height:18,fontSize:10,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>{count}</span>}</button>);}
const TTip=({active,payload,label})=>{if(!active||!payload?.length)return null;return(<div style={{background:T.bg2,border:`1px solid ${T.border}`,borderRadius:9,padding:"12px 15px",fontSize:12}}><div style={{color:T.text1,marginBottom:6,fontWeight:700}}>{label}</div>{payload.map((p,i)=>(<div key={i} style={{color:p.color||T.text0,marginBottom:3}}>{p.name}: <span style={{fontWeight:700}}>{usd(p.value)}</span></div>))}</div>);};
function HoldingsView({holdings=HOLDINGS_DEMO}){
 const[sortBy,setSortBy]=useState("usdValue");
 const[sortDir,setSortDir]=useState("desc");
 const totalTVL=holdings.reduce((s,h)=>s+h.usdValue,0);
 const totalCost=holdings.reduce((s,h)=>s+(h.costBasis||h.usdValue),0);
 const totalPnL=totalTVL-totalCost;
 const wAPY=holdings.length?holdings.reduce((s,h)=>s+h.apy*h.usdValue,0)/totalTVL:0;
 const monthly=holdings.reduce((s,h)=>s+h.usdValue*h.apy/100/12,0);
 const filtered=useMemo(()=>[...holdings].sort((a,b)=>sortDir==="desc"?b[sortBy]-a[sortBy]:a[sortBy]-b[sortBy]),[sortBy,sortDir,holdings]);
 const hs=(col)=>{if(sortBy===col)setSortDir(d=>d==="desc"?"asc":"desc");else{setSortBy(col);setSortDir("desc");}};
 const TH=({col,ch})=><th onClick={()=>col&&hs(col)} style={{padding:"11px 14px",textAlign:"left",fontSize:10,color:sortBy===col?T.blue:T.text2,letterSpacing:1.5,textTransform:"uppercase",cursor:col?"pointer":"default",whiteSpace:"nowrap"}}>{ch}{sortBy===col?(sortDir==="desc"?" ↓":" ↑"):""}</th>;
 return(<div>
 <SH title="Portfolio Holdings" sub={`${holdings.length} active positions`} right={<div style={{textAlign:"right",fontFamily:"'IBM Plex Mono',monospace"}}><div style={{fontSize:22,fontWeight:700,color:T.text0}}>{usd(totalTVL,true)}</div><div style={{fontSize:11,color:totalPnL>=0?T.green:T.red}}>{pct((totalPnL/totalCost)*100)} unrealized P&L ({usd(totalPnL,true)})</div></div>}/>
 <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:20}}>
 <KPI label="Total AUM" value={usd(totalTVL,true)} sub="Mark-to-market" accent={T.blue}/>
 <KPI label="Cost Basis" value={usd(totalCost,true)} sub="Total deployed" accent={T.text3}/>
 <KPI label="Unrealized P&L" value={usd(totalPnL,true)} sub={pct((totalPnL/totalCost)*100)+" ROI"} accent={totalPnL>=0?T.green:T.red}/>
 <KPI label="Monthly Yield" value={usd(monthly,true)} sub={pctN(wAPY)+" blended APY"} accent={T.purple}/>
 </div>
 <Card><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr style={{borderBottom:`1px solid ${T.border}`}}><TH col="protocol" ch="Protocol"/><TH ch="Chain"/><TH ch="Token"/><TH col="usdValue" ch="Market Value"/><TH col="costBasis" ch="Cost Basis"/><TH ch="P&L"/><TH col="apy" ch="APY"/><TH ch="Category"/><TH col="age" ch="Age"/></tr></thead>
 <tbody>{filtered.map((h,i)=>{const pnl=(h.usdValue||0)-(h.costBasis||h.usdValue);const pnlPct=h.costBasis?((h.usdValue-h.costBasis)/h.costBasis*100):0;const me=h.usdValue*h.apy/100/12;return(<tr key={h.id} onMouseEnter={e=>e.currentTarget.style.background=`${T.blue}08`} onMouseLeave={e=>e.currentTarget.style.background=i%2?"#ffffff03":"transparent"}><td style={{padding:"13px 14px"}}><div style={{color:T.text0,fontWeight:700,fontSize:13}}>{h.protocol}</div><div style={{fontSize:10,color:T.text3}}>TVL {usd(h.tvlProtocol,true)} · {h.age}d</div></td><td style={{padding:"13px 14px"}}><CC chain={h.chain}/></td><td style={{padding:"13px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.text1,fontSize:12}}>{h.token}</td><td style={{padding:"13px 14px"}}><div style={{fontFamily:"'IBM Plex Mono',monospace",color:T.text0,fontWeight:700,fontSize:13}}>{usd(h.usdValue)}</div><div style={{fontSize:10,color:T.text3}}>~{usd(me,true)}/mo yield</div></td><td style={{padding:"13px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.text2,fontSize:12}}>{usd(h.costBasis||h.usdValue)}</td><td style={{padding:"13px 14px"}}><div style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,fontSize:13,color:pnl>=0?T.green:T.red}}>{usd(pnl,true)}</div><div style={{fontSize:10,color:pnl>=0?T.green:T.red}}>{pct(pnlPct)}</div></td><td style={{padding:"13px 14px",fontFamily:"'IBM Plex Mono',monospace",fontWeight:800,fontSize:14,color:h.apy>20?T.amber:h.apy>10?T.blue:T.green}}>{pctN(h.apy)}</td><td style={{padding:"13px 14px"}}><Chip label={h.category} color={T.blue}/></td><td style={{padding:"13px 14px",fontSize:12,color:T.text2}}>{h.age}d</td></tr>);})}</tbody></table></Card>
 </div>);
}
function ProfitabilityView({holdings=HOLDINGS_DEMO}){
 const[range,setRange]=useState(12);
 const data=EARN.slice(-range);
 const CATS=[{key:"lending",label:"Lending",color:"#4E9EFF"},{key:"staking",label:"Liq. Staking",color:"#00E5A0"},{key:"dex_lp",label:"DEX LP",color:"#A855F7"},{key:"stableLP",label:"Stable LP",color:"#FFB020"},{key:"airdrops",label:"Airdrops",color:"#FF3B6A"},{key:"fees",label:"Mgmt Fees",color:"#627EEA"}];
 const sum=f=>data.reduce((s,d)=>s+d[f],0);
 const tYield=sum("lending")+sum("staking")+sum("dex_lp")+sum("stableLP");
 const tAir=sum("airdrops");const tFees=sum("fees");const grand=tYield+tAir-tFees;
 const totalTVL=holdings.reduce((s,h)=>s+h.usdValue,0);
 const totalCost=holdings.reduce((s,h)=>s+(h.costBasis||h.usdValue),0);
 const totalPnL=totalTVL-totalCost;
 const totalYieldEarned=PORTFOLIO_SNAPSHOTS.reduce((s,q)=>s+q.yieldEarned,0);
 const totalAirdrops=AIRDROPS.filter(a=>a.verified).reduce((s,a)=>s+a.usdValue,0);
 const totalFeesAll=PORTFOLIO_SNAPSHOTS.reduce((s,q)=>s+q.fees,0);
 const netReturn=totalPnL+totalYieldEarned+totalAirdrops-totalFeesAll;
 const roiPct=totalCost?(netReturn/totalCost*100):0;
 const pByCategory=Object.entries(holdings.reduce((a,h)=>{a[h.category]=(a[h.category]||{tvl:0,yield:0,count:0});a[h.category].tvl+=h.usdValue;a[h.category].yield+=h.usdValue*h.apy/100/12;a[h.category].count++;return a;},{})).map(([cat,v])=>({category:cat,tvl:v.tvl,monthlyYield:v.yield,annualYield:v.yield*12,apy:v.tvl?((v.yield*12/v.tvl)*100):0,count:v.count})).sort((a,b)=>b.monthlyYield-a.monthlyYield);
 return(<div>
 <SH title="Profitability & Returns" sub="Yield analytics and portfolio performance"/>
 <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:20}}>
 <KPI label="Net Return (All-time)" value={usd(netReturn,true)} sub={pct(roiPct)+" total ROI"} accent={T.green}/>
 <KPI label="Yield Earned" value={usd(totalYieldEarned,true)} sub="Protocol income" accent={T.blue}/>
 <KPI label="Airdrop Income" value={usd(totalAirdrops,true)} sub={AIRDROPS.filter(a=>a.verified).length+" events"} accent={T.purple}/>
 <KPI label="Total Fees Paid" value={usd(totalFeesAll,true)} sub="Gas + mgmt fees" accent={T.amber}/>
 </div>
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
 <Card style={{padding:"20px 22px"}}>
 <SH title="Monthly Earnings" sub={`Last ${range} months`} right={<div style={{display:"flex",gap:6}}>{[6,12,24].map(r=><FB key={r} label={`${r}M`} active={range===r} onClick={()=>setRange(r)}/>)}</div>}/>
 <ResponsiveContainer width="100%" height={220}>
 <BarChart data={data} barSize={6}><XAxis dataKey="month" tick={{fontSize:9,fill:T.text3}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:9,fill:T.text3}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}K`}/><Tooltip content={<TTip/>}/>{CATS.filter(c=>c.key!=="fees").map(c=><Bar key={c.key} dataKey={c.key} name={c.label} fill={c.color} stackId="a"/>)}</BarChart>
 </ResponsiveContainer>
 <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:12}}>{CATS.map(c=><div key={c.key} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:T.text2}}><div style={{width:8,height:8,borderRadius:2,background:c.color}}/>{c.label}</div>)}</div>
 </Card>
 <Card style={{padding:"20px 22px"}}>
 <SH title="P&L by Category" sub="Realized yield vs cost basis"/>
 <div>{pByCategory.map((cat,i)=><div key={i} style={{display:"flex",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.border}30`}}><div style={{flex:1}}><div style={{fontSize:13,color:T.text0,fontWeight:600}}>{cat.category}</div><div style={{fontSize:10,color:T.text3}}>{cat.count} position{cat.count!==1?"s":""}</div></div><div style={{textAlign:"right"}}><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:700,color:T.text0}}>{usd(cat.monthlyYield,true)}/mo</div><div style={{fontSize:11,color:T.blue}}>{pctN(cat.apy)} APY</div></div></div>)}</div>
 </Card>
 </div>
 <Card style={{padding:"20px 22px"}}>
 <SH title="DEX LP Profitability" sub="Fee income vs impermanent loss estimate"/>
 <table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr style={{borderBottom:`1px solid ${T.border}`}}>{["Protocol","Chain","Pair","Deployed","APY","Monthly Fees","Annual Fees","Est. IL Risk","Net"].map(l=><th key={l} style={{padding:"10px 14px",textAlign:"left",fontSize:10,color:T.text2,letterSpacing:1.5,textTransform:"uppercase"}}>{l}</th>)}</tr></thead>
 <tbody>{holdings.filter(h=>h.category==="DEX LP"||h.category==="Derivatives LP"||h.category==="Stablecoin LP").map((h,i)=>{const mf=h.usdValue*h.apy/100/12;const il=h.risk==="High"?-h.usdValue*0.02:h.risk==="Medium"?-h.usdValue*0.008:0;const net=mf*12+il;return(<tr key={h.id} style={{borderBottom:`1px solid ${T.border}20`,background:i%2?"#ffffff03":"transparent"}}><td style={{padding:"12px 14px",color:T.text0,fontWeight:700,fontSize:13}}>{h.protocol}</td><td style={{padding:"12px 14px"}}><CC chain={h.chain} small/></td><td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.text1,fontSize:11}}>{h.token}</td><td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.text0,fontSize:12}}>{usd(h.usdValue,true)}</td><td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:h.apy>20?T.amber:T.blue,fontWeight:700}}>{pctN(h.apy)}</td><td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.green}}>{usd(mf,true)}</td><td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.green}}>{usd(mf*12,true)}</td><td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.red,fontSize:12}}>{il<0?usd(il,true):"Low"}</td><td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:net>=0?T.green:T.red,fontWeight:700}}>{usd(net,true)}</td></tr>);})}</tbody></table>
 </Card>
 </div>);
}
function TransactionsView(){
 const[typeF,setTypeF]=useState("all");
 const[search,setSearch]=useState("");
 const types=[...new Set(TRANSACTIONS.map(t=>t.type))];
 const filtered=useMemo(()=>TRANSACTIONS.filter(t=>typeF==="all"||t.type===typeF).filter(t=>!search||t.protocol.toLowerCase().includes(search.toLowerCase())||t.token.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>new Date(b.date)-new Date(a.date)),[typeF,search]);
 const totalIn=TRANSACTIONS.filter(t=>t.category==="Entry"||t.category==="Airdrop"||t.category==="Income").reduce((s,t)=>s+t.usdValue,0);
 const totalFees=TRANSACTIONS.reduce((s,t)=>s+t.fee,0);
 const totalAirdrops=TRANSACTIONS.filter(t=>t.category==="Airdrop").reduce((s,t)=>s+t.usdValue,0);
 const typeColor={"Deposit":T.blue,"Withdrawal":T.red,"Yield Claim":T.green,"Airdrop":T.purple,"Rebalance":T.amber,"Management Fee":T.red};
 return(<div>
 <SH title="Transaction Ledger" sub={`${TRANSACTIONS.length} transactions recorded`}/>
 <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:20}}>
 <KPI label="Total Deployed" value={usd(TRANSACTIONS.filter(t=>t.category==="Entry").reduce((s,t)=>s+t.usdValue,0),true)} sub={TRANSACTIONS.filter(t=>t.category==="Entry").length+" deposits"} accent={T.blue}/>
 <KPI label="Yield Claims" value={usd(TRANSACTIONS.filter(t=>t.category==="Income").reduce((s,t)=>s+t.usdValue,0),true)} sub={TRANSACTIONS.filter(t=>t.category==="Income").length+" claims"} accent={T.green}/>
 <KPI label="Airdrop Income" value={usd(totalAirdrops,true)} sub={TRANSACTIONS.filter(t=>t.category==="Airdrop").length+" events"} accent={T.purple}/>
 <KPI label="Total Gas + Fees" value={usd(totalFees,true)} sub="Execution costs" accent={T.amber}/>
 </div>
 <Card style={{padding:"16px 20px 0"}}>
 <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,flexWrap:"wrap"}}>
 <input placeholder="Search protocol or token..." value={search} onChange={e=>setSearch(e.target.value)} style={{background:T.bg2,border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 13px",color:T.text0,fontSize:12,outline:"none",fontFamily:"inherit",width:200}}/>
 <FB label="All" active={typeF==="all"} onClick={()=>setTypeF("all")} count={TRANSACTIONS.length}/>
 {types.map(t=><FB key={t} label={t} active={typeF===t} onClick={()=>setTypeF(t)} count={TRANSACTIONS.filter(tx=>tx.type===t).length}/>)}
 </div>
 <table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr style={{borderBottom:`1px solid ${T.border}`}}>{["Date","Type","Protocol","Chain","Token","Amount","USD Value","Fee","Category","Notes"].map(l=><th key={l} style={{padding:"10px 14px",textAlign:"left",fontSize:10,color:T.text2,letterSpacing:1.5,textTransform:"uppercase",whiteSpace:"nowrap"}}>{l}</th>)}</tr></thead>
 <tbody>{filtered.map((t,i)=>(<tr key={t.id} style={{borderBottom:`1px solid ${T.border}20`,background:i%2?"#ffffff03":"transparent"}} onMouseEnter={e=>e.currentTarget.style.background=`${T.blue}08`} onMouseLeave={e=>e.currentTarget.style.background=i%2?"#ffffff03":"transparent"}><td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.text2,fontSize:11}}>{t.date}</td><td style={{padding:"12px 14px"}}><span style={{color:typeColor[t.type]||T.text1,fontWeight:700,fontSize:12}}>{t.type}</span></td><td style={{padding:"12px 14px",color:T.text0,fontWeight:600,fontSize:13}}>{t.protocol}</td><td style={{padding:"12px 14px"}}><CC chain={t.chain} small/></td><td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.text1,fontSize:11}}>{t.token}</td><td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.text2,fontSize:11}}>{t.amount>0?num(t.amount.toFixed?t.amount.toFixed(0):t.amount):"—"}</td><td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.text0,fontWeight:700,fontSize:12}}>{usd(t.usdValue,true)}</td><td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:t.fee>0?T.amber:T.text3,fontSize:11}}>{t.fee>0?usd(t.fee):"—"}</td><td style={{padding:"12px 14px"}}><Chip label={t.category} color={{Entry:T.blue,Income:T.green,Airdrop:T.purple,Management:T.amber,Fee:T.red}[t.category]||T.text2} small/></td><td style={{padding:"12px 14px",fontSize:11,color:T.text3,maxWidth:200,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.notes}</td></tr>))}</tbody></table>
 </Card>
 </div>);
}
function PortfolioStateView({holdings=HOLDINGS_DEMO}){
 const totalTVL=holdings.reduce((s,h)=>s+h.usdValue,0);
 const totalCost=holdings.reduce((s,h)=>s+(h.costBasis||h.usdValue),0);
 const chainAlloc=Object.entries(holdings.reduce((a,h)=>{a[h.chain]=(a[h.chain]||0)+h.usdValue;return a;},{})).sort((a,b)=>b[1]-a[1]).map(([c,v])=>({name:CHAINS[c]?.name||c,value:v,color:CHAINS[c]?.color||T.text2,pct:(v/totalTVL*100).toFixed(1)}));
 const catAlloc=Object.entries(holdings.reduce((a,h)=>{a[h.category]=(a[h.category]||0)+h.usdValue;return a;},{})).sort((a,b)=>b[1]-a[1]);
 const riskAlloc=["Low","Medium","High"].map(r=>({name:r,value:holdings.filter(h=>h.risk===r).reduce((s,h)=>s+h.usdValue,0),color:{Low:T.green,Medium:T.amber,High:T.red}[r]}));
 const CC2=["#4E9EFF","#00E5A0","#A855F7","#FFB020","#FF3B6A","#627EEA","#E84142","#8247E5","#F0B90B"];
 return(<div>
 <SH title="Portfolio State" sub={`Snapshot as of ${new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}`}/>
 <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:20}}>
 <KPI label="Total NAV" value={usd(totalTVL,true)} sub="Mark-to-market value" accent={T.blue}/>
 <KPI label="Cost Basis" value={usd(totalCost,true)} sub="Total deployed capital" accent={T.text3}/>
 <KPI label="Unrealized P&L" value={usd(totalTVL-totalCost,true)} sub={pct((totalTVL-totalCost)/totalCost*100)+" return"} accent={totalTVL>=totalCost?T.green:T.red}/>
 <KPI label="Positions" value={holdings.length} sub={Object.keys(CHAINS).length+" chains"} accent={T.purple}/>
 </div>
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
 <Card style={{padding:"20px 22px"}}>
 <SH title="Chain Allocation" sub="By deployed capital"/>
 <ResponsiveContainer width="100%" height={180}><PieChart><Pie data={chainAlloc} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">{chainAlloc.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip formatter={v=>usd(v,true)}/></PieChart></ResponsiveContainer>
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:8}}>{chainAlloc.map((c,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:11}}><div style={{width:8,height:8,borderRadius:2,background:c.color,flexShrink:0}}/><span style={{color:T.text1,flex:1}}>{c.name}</span><span style={{color:T.text0,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{c.pct}%</span></div>)}</div>
 </Card>
 <Card style={{padding:"20px 22px"}}>
 <SH title="Strategy Allocation" sub="By protocol category"/>
 <div>{catAlloc.map(([cat,val],i)=>{const p=(val/totalTVL*100);return(<div key={i} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:T.text1}}>{cat}</span><span style={{fontSize:12,color:T.text0,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace"}}>{usd(val,true)} <span style={{color:T.text3,fontWeight:400}}>({p.toFixed(1)}%)</span></span></div><div style={{height:5,background:T.bg3,borderRadius:3}}><div style={{height:"100%",width:`${p}%`,background:CC2[i%CC2.length],borderRadius:3,transition:"width 0.4s"}}/></div></div>);})} 
 </Card>
 </div>
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
 <Card style={{padding:"20px 22px"}}>
 <SH title="Risk Profile" sub="Capital by risk level"/>
 {riskAlloc.map((r,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:i<2?`1px solid ${T.border}30`:"none"}}><div style={{width:10,height:10,borderRadius:"50%",background:r.color}}/><div style={{flex:1}}><div style={{fontSize:13,color:T.text0,fontWeight:600}}>{r.name} Risk</div><div style={{fontSize:10,color:T.text3}}>{holdings.filter(h=>h.risk===r.name).length} positions</div></div><div style={{textAlign:"right"}}><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,fontWeight:700,color:r.color}}>{usd(r.value,true)}</div><div style={{fontSize:11,color:T.text2}}>{(r.value/totalTVL*100).toFixed(1)}%</div></div></div>)}
 </Card>
 <Card style={{padding:"20px 22px"}}>
 <SH title="NAV History" sub="Quarterly portfolio value"/>
 <ResponsiveContainer width="100%" height={200}>
 <AreaChart data={PORTFOLIO_SNAPSHOTS}><XAxis dataKey="date" tick={{fontSize:9,fill:T.text3}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:9,fill:T.text3}} axisLine={false} tickLine={false} tickFormatter={v=>usd(v,true)}/><Tooltip formatter={v=>usd(v)}/><Area type="monotone" dataKey="nav" name="NAV" stroke={T.blue} fill={`${T.blue}20`} strokeWidth={2}/></AreaChart>
 </ResponsiveContainer>
 </Card>
 </div>
 </div>);
}
function ReportingView({holdings=HOLDINGS_DEMO}){
 const totalTVL=holdings.reduce((s,h)=>s+h.usdValue,0);
 const totalCost=holdings.reduce((s,h)=>s+(h.costBasis||h.usdValue),0);
 const wAPY=holdings.length?holdings.reduce((s,h)=>s+h.apy*h.usdValue,0)/totalTVL:0;
 const monthly=holdings.reduce((s,h)=>s+h.usdValue*h.apy/100/12,0);
 const totalYield=PORTFOLIO_SNAPSHOTS.reduce((s,q)=>s+q.yieldEarned,0);
 const totalAirdrops=AIRDROPS.filter(a=>a.verified).reduce((s,a)=>s+a.usdValue,0);
 const totalFees=PORTFOLIO_SNAPSHOTS.reduce((s,q)=>s+q.fees,0);
 const totalPnL=totalTVL-totalCost;
 const netReturn=totalPnL+totalYield+totalAirdrops-totalFees;
 const rows=[
 ["Reporting Period","Inception to Date (Jan 2022 - Feb 2025)"],
 ["Total AUM (NAV)",usd(totalTVL)],
 ["Cost Basis (Total Deployed)",usd(totalCost)],
 ["Unrealized P&L",usd(totalPnL)+" ("+pct((totalPnL/totalCost)*100)+")"],
 ["Total Yield Earned",usd(totalYield)],
 ["Airdrop Income",usd(totalAirdrops)],
 ["Total Fees & Gas",usd(totalFees)],
 ["Net All-Time Return",usd(netReturn)+" ("+pct((netReturn/totalCost)*100)+" ROI)"],
 ["Blended APY",pctN(wAPY)],
 ["Monthly Yield Run-Rate",usd(monthly)],
 ["Annual Yield Run-Rate",usd(monthly*12)],
 ["Active Positions",holdings.length+" across "+Object.keys(holdings.reduce((a,h)=>{a[h.chain]=1;return a;},{})).length+" chains"],
 ["DEX LP Positions",holdings.filter(h=>h.category==="DEX LP"||h.category==="Derivatives LP").length+" positions ("+usd(holdings.filter(h=>h.category==="DEX LP"||h.category==="Derivatives LP").reduce((s,h)=>s+h.usdValue,0),true)+")"],
 ["Low Risk Allocation",usd(holdings.filter(h=>h.risk==="Low").reduce((s,h)=>s+h.usdValue,0),true)+" ("+((holdings.filter(h=>h.risk==="Low").reduce((s,h)=>s+h.usdValue,0)/totalTVL)*100).toFixed(1)+"%)"],
 ["Audited Protocols",holdings.filter(h=>h.audited).length+"/"+holdings.length+" positions"],
 ];
 return(<div>
 <SH title="Period Report" sub="Summary for investors and compliance" right={<button onClick={()=>{const text=rows.map(r=>r.join("\t")).join("\n");const el=document.createElement("textarea");el.value=text;document.body.appendChild(el);el.select();document.execCommand("copy");document.body.removeChild(el);alert("Report copied to clipboard!");}} style={{background:T.blue,color:"#fff",border:"none",borderRadius:8,padding:"8px 18px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>Copy to Clipboard</button>}/>
 <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:20}}>
 <KPI label="Net All-Time Return" value={usd(netReturn,true)} sub={pct((netReturn/totalCost)*100)+" ROI"} accent={T.green}/>
 <KPI label="Total AUM" value={usd(totalTVL,true)} sub="Current NAV" accent={T.blue}/>
 <KPI label="Annual Yield" value={usd(monthly*12,true)} sub={pctN(wAPY)+" blended APY"} accent={T.purple}/>
 <KPI label="Fees Paid" value={usd(totalFees,true)} sub="All-time execution" accent={T.amber}/>
 </div>
 <Card style={{padding:"20px 22px",marginBottom:16}}>
 <SH title="Portfolio Summary Report" sub="Snapshot for investor reporting"/>
 <table style={{width:"100%",borderCollapse:"collapse"}}><tbody>{rows.map(([label,value],i)=>(<tr key={i} style={{borderBottom:`1px solid ${T.border}20`,background:i%2?"#ffffff03":"transparent"}}><td style={{padding:"12px 18px",fontSize:12,color:T.text2,width:320}}>{label}</td><td style={{padding:"12px 18px",fontSize:13,color:T.text0,fontFamily:"'IBM Plex Mono',monospace",fontWeight:700}}>{value}</td></tr>))}</tbody></table>
 </Card>
 <Card style={{padding:"20px 22px",marginBottom:16}}>
 <SH title="Quarterly Performance" sub="NAV and returns by quarter"/>
 <table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr style={{borderBottom:`1px solid ${T.border}`}}>{["Quarter","NAV","Deposits","Withdrawals","Yield Earned","Fees","P&L","Return"].map(l=><th key={l} style={{padding:"10px 14px",textAlign:"left",fontSize:10,color:T.text2,letterSpacing:1.5,textTransform:"uppercase"}}>{l}</th>)}</tr></thead><tbody>{PORTFOLIO_SNAPSHOTS.map((q,i)=>{const prev=PORTFOLIO_SNAPSHOTS[i-1];const ret=prev?((q.nav-(prev.nav+q.deposits-q.withdrawals))/(prev.nav)*100):0;return(<tr key={i} style={{borderBottom:`1px solid ${T.border}20`,background:i%2?"#ffffff03":"transparent"}}><td style={{padding:"12px 14px",color:T.text0,fontWeight:700,fontSize:13,fontFamily:"'IBM Plex Mono',monospace"}}>{q.date}</td><td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.text0,fontWeight:700}}>{usd(q.nav,true)}</td><td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.blue,fontSize:12}}>{q.deposits>0?usd(q.deposits,true):"—"}</td><td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.red,fontSize:12}}>{q.withdrawals>0?usd(q.withdrawals,true):"—"}</td><td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.green,fontSize:12}}>{usd(q.yieldEarned,true)}</td><td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.amber,fontSize:12}}>{usd(q.fees,true)}</td><td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:q.pnl>=0?T.green:T.red,fontSize:12}}>{usd(q.pnl,true)}</td><td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:ret>=0?T.green:T.red,fontWeight:700,fontSize:12}}>{i>0?pct(ret):"—"}</td></tr>);})}</tbody></table>
 </Card>
 </div>);
}
function EarningsView(){return(<div><KPI label="Yield Analytics" value="$141K" sub="Latest month earnings" accent={T.green}/></div>);}
function AirdropsView(){
 const verified=AIRDROPS.filter(a=>a.verified);
 const totalVal=verified.reduce((s,a)=>s+a.usdValue,0);
 const pending=AIRDROPS.filter(a=>a.status==="Pending");
 return(<div>
 <SH title="Airdrops & Token Claims" sub={`${verified.length} verified events`}/>
 <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:20}}>
 <KPI label="Total Airdrop Value" value={usd(totalVal,true)} sub={verified.length+" claimed"} accent={T.purple}/>
 <KPI label="Pending Claims" value={usd(pending.reduce((s,a)=>s+a.usdValue,0),true)} sub={pending.length+" pending"} accent={T.amber}/>
 <KPI label="Blocked / Scam" value={AIRDROPS.filter(a=>!a.verified).length} sub="Quarantined" accent={T.red}/>
 <KPI label="All Events" value={AIRDROPS.length} sub="Total recorded" accent={T.blue}/>
 </div>
 <Card><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr style={{borderBottom:`1px solid ${T.border}`}}>{["Protocol","Chain","Token","Amount","USD Value","Date","Method","Status"].map(l=><th key={l} style={{padding:"10px 14px",textAlign:"left",fontSize:10,color:T.text2,letterSpacing:1.5,textTransform:"uppercase"}}>{l}</th>)}</tr></thead>
 <tbody>{AIRDROPS.map((a,i)=>(<tr key={a.id} style={{borderBottom:`1px solid ${T.border}20`,background:!a.verified?`${T.red}07`:i%2?"#ffffff03":"transparent"}}><td style={{padding:"12px 14px",color:T.text0,fontWeight:700,fontSize:13}}>{a.protocol}</td><td style={{padding:"12px 14px"}}><CC chain={a.chain} small/></td><td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.text1,fontSize:11}}>{a.token}</td><td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.text2,fontSize:11}}>{num(a.amount)}</td><td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:a.verified?T.text0:T.text3,fontWeight:700,fontSize:12}}>{a.verified?usd(a.usdValue,true):"—"}</td><td style={{padding:"12px 14px",fontFamily:"'IBM Plex Mono',monospace",color:T.text2,fontSize:11}}>{a.date}</td><td style={{padding:"12px 14px",fontSize:12,color:T.text2}}>{a.method}</td><td style={{padding:"12px 14px"}}><SC status={a.status}/></td></tr>))}</tbody></table></Card>
 </div>);
}
function ScamView(){
 const[rules,setRules]=useState(SCAM_RULES);
 const blocked=AIRDROPS.filter(a=>!a.verified);
 const tr=id=>setRules(r=>r.map(rule=>rule.id===id?{...rule,active:!rule.active}:rule));
 const SEV={Critical:T.red,High:T.amber,Medium:T.blue};
 return(<div>
 <SH title="Security & Scam Filter" sub="Automated threat detection"/>
 <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:13,marginBottom:20}}>
 <KPI label="Active Rules" value={rules.filter(r=>r.active).length} sub={`of ${rules.length} rules`} accent={T.amber}/>
 <KPI label="Threats Blocked" value={blocked.length} sub="Scam tokens" accent={T.red}/>
 <KPI label="Protected Capital" value={usd(HOLDINGS_DEMO.reduce((s,h)=>s+h.usdValue,0),true)} sub="Under monitoring" accent={T.green}/>
 </div>
 <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
 <Card style={{padding:"20px 22px"}}>
 <SH title="Detection Rules"/>
 {rules.map(r=>(<div key={r.id} style={{background:T.bg2,borderRadius:9,padding:"12px 15px",marginBottom:8,display:"flex",alignItems:"center",gap:10,opacity:r.active?1:0.45}}><div style={{flex:1}}><div style={{fontSize:13,color:T.text0,fontWeight:600}}>{r.label}</div><div style={{fontSize:10,color:T.text3,marginTop:2}}>{r.desc}</div></div><Chip label={r.severity} color={SEV[r.severity]} small/>{r.triggered>0&&<span style={{background:T.red,color:"#fff",borderRadius:"50%",width:18,height:18,fontSize:10,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>{r.triggered}</span>}<div onClick={e=>{e.stopPropagation();tr(r.id);}} style={{width:34,height:19,borderRadius:10,background:r.active?`${T.green}28`:T.bg3,border:`1px solid ${r.active?T.green:T.border}`,display:"flex",alignItems:"center",padding:2,justifyContent:r.active?"flex-end":"flex-start",cursor:"pointer"}}><div style={{width:15,height:15,borderRadius:"50%",background:r.active?T.green:T.text3}}/></div></div>))}
 </Card>
 <Card style={{padding:"20px 22px"}}>
 <SH title="Blocked Transactions" sub={`${blocked.length} quarantined`}/>
 {blocked.map(a=>(<div key={a.id} style={{background:`${T.red}0D`,border:`1px solid ${T.red}30`,borderRadius:9,padding:"12px 15px",marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{color:T.red,fontWeight:700,fontSize:13}}>{a.protocol}</span><span style={{color:T.text3,fontSize:11}}>{a.date}</span></div><div style={{fontSize:12,color:T.text2,marginBottom:6}}>{a.token} · {num(a.amount)} tokens</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{a.scamFlags.map(f=><Chip key={f} label={f} color={T.red} small/>)}</div></div>))}
 </Card>
 </div>
 </div>);
}
function OverviewView({holdings=HOLDINGS_DEMO,totalBalance}){
 const totalTVL=holdings.reduce((s,h)=>s+h.usdValue,0);
 const wAPY=holdings.length?holdings.reduce((s,h)=>s+h.apy*h.usdValue,0)/totalTVL:0;
 const monthly=holdings.reduce((s,h)=>s+h.usdValue*h.apy/100/12,0);
 const totalCost=holdings.reduce((s,h)=>s+(h.costBasis||h.usdValue),0);
 const totalPnL=totalTVL-totalCost;
 const totalYield=PORTFOLIO_SNAPSHOTS.reduce((s,q)=>s+q.yieldEarned,0);
 const totalAirdrops=AIRDROPS.filter(a=>a.verified).reduce((s,a)=>s+a.usdValue,0);
 const chainTVL=Object.entries(holdings.reduce((a,h)=>{a[h.chain]=(a[h.chain]||0)+h.usdValue;return a;},{})).sort((a,b)=>b[1]-a[1]).map(([c,v])=>({name:CHAINS[c]?.name||c,value:v,color:CHAINS[c]?.color||T.text2,icon:CHAINS[c]?.icon||"?"}));
 return(<div>
 <div style={{marginBottom:26}}>
 <div style={{fontSize:10,letterSpacing:2.5,color:T.text3,textTransform:"uppercase",marginBottom:5}}>{new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
 <h1 style={{margin:0,fontSize:28,fontWeight:900,color:T.text0,letterSpacing:"-1px"}}>Fund Overview</h1>
 <p style={{margin:"5px 0 0",color:T.text2,fontSize:13}}>Multi-chain DeFi portfolio · {holdings.length} positions · {Object.keys(holdings.reduce((a,h)=>{a[h.chain]=1;return a;},{})).length} blockchains</p>
 </div>
 <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13,marginBottom:20}}>
 <KPI label="Total NAV" value={usd(totalBalance||totalTVL,true)} sub="Wallet + Protocols" accent={T.blue}/>
 <KPI label="Unrealized P&L" value={usd(totalPnL,true)} sub={pct((totalPnL/totalCost)*100)+" ROI"} accent={totalPnL>=0?T.green:T.red}/>
 <KPI label="Monthly Yield" value={usd(monthly,true)} sub={pctN(wAPY)+" blended APY"} accent={T.purple}/>
 <KPI label="All-Time Yield" value={usd(totalYield+totalAirdrops,true)} sub="Yield + airdrops" accent={T.amber}/>
 </div>
 <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16,marginBottom:20}}>
 <Card style={{padding:"20px 22px"}}>
 <SH title="NAV History" sub="Quarterly portfolio value"/>
 <ResponsiveContainer width="100%" height={200}>
 <AreaChart data={PORTFOLIO_SNAPSHOTS}><XAxis dataKey="date" tick={{fontSize:9,fill:T.text3}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:9,fill:T.text3}} axisLine={false} tickLine={false} tickFormatter={v=>usd(v,true)}/><Tooltip content={<TTip/>}/><Area type="monotone" dataKey="nav" name="NAV" stroke={T.blue} fill={`${T.blue}20`} strokeWidth={2}/><Area type="monotone" dataKey="yieldEarned" name="Yield" stroke={T.green} fill={`${T.green}10`} strokeWidth={1.5}/></AreaChart>
 </ResponsiveContainer>
 </Card>
 <Card style={{padding:"20px 22px"}}>
 <SH title="Chain Distribution"/>
 <div>{chainTVL.slice(0,6).map((c,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:i<5?`1px solid ${T.border}20`:"none"}}><span style={{fontSize:14}}>{c.icon}</span><span style={{fontSize:12,color:T.text1,flex:1}}>{c.name}</span><div style={{textAlign:"right"}}><div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,color:T.text0,fontWeight:700}}>{usd(c.value,true)}</div><div style={{fontSize:10,color:T.text3}}>{((c.value/totalTVL)*100).toFixed(1)}%</div></div></div>))}</div>
 </Card>
 </div>
 </div>);
}
const NAV=[{id:"overview",label:"Overview",icon:"◈"},{id:"holdings",label:"Holdings & P&L",icon:"⮡"},{id:"profitability",label:"Profitability",icon:"↗"},{id:"transactions",label:"Transactions",icon:"⇄"},{id:"portfolio",label:"Portfolio State",icon:"▦"},{id:"report",label:"Reports",icon:"≡"},{id:"airdrops",label:"Airdrops",icon:"◉"},{id:"scam",label:"Scam Filter",icon:"⚡"}];
export default function App(){
 const[view,setView]=useState("overview");
 const scamAlert=AIRDROPS.filter(a=>!a.verified).length;
 const pendAlert=AIRDROPS.filter(a=>a.status==="Pending").length;
 return(<div style={{minHeight:"100vh",background:T.bg0,fontFamily:"'DM Sans','Helvetica Neue',sans-serif",color:T.text1,display:"flex"}}>
 <aside style={{width:224,background:T.bg1,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,bottom:0,zIndex:20}}>
 <div style={{padding:"24px 20px 20px",borderBottom:`1px solid ${T.border}`}}>
 <div style={{display:"flex",alignItems:"center",gap:10}}>
 <div style={{width:30,height:30,borderRadius:7,background:`linear-gradient(135deg,${T.blue},${T.purple})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"white"}}>⮡</div>
 <div><div style={{fontSize:15,fontWeight:800,color:T.text0,letterSpacing:"-0.5px"}}>DefiVault</div><div style={{fontSize:9,color:T.text3,letterSpacing:2,textTransform:"uppercase"}}>Fund Backoffice</div></div>
 </div>
 </div>
 <nav style={{padding:"13px 11px",flex:1,overflowY:"auto"}}>
 {NAV.map(n=>{const alert=n.id==="scam"?scamAlert:n.id==="airdrops"?pendAlert:0;return(<button key={n.id} onClick={()=>setView(n.id)} style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:"9px 11px",borderRadius:8,marginBottom:2,background:view===n.id?`${T.blue}18`:"transparent",border:view===n.id?`1px solid ${T.blue}28`:"1px solid transparent",color:view===n.id?"#90BAFF":T.text2,fontWeight:view===n.id?700:400,fontSize:13,cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all 0.15s"}}><span style={{fontSize:15,width:19,textAlign:"center"}}>{n.icon}</span>{n.label}{alert>0&&<span style={{marginLeft:"auto",background:T.red,color:"#fff",borderRadius:"50%",width:18,height:18,fontSize:10,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>{alert}</span>}</button>);})}
 </nav>
 <div style={{padding:"15px 20px",borderTop:`1px solid ${T.border}`}}>
 <div style={{fontSize:9,color:T.text3,letterSpacing:2,marginBottom:9,textTransform:"uppercase"}}>System Status</div>
 <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}><div style={{width:7,height:7,borderRadius:"50%",background:T.green,boxShadow:`0 0 7px ${T.green}`}}/><span style={{fontSize:11,color:T.green}}>All systems nominal</span></div>
 </div>
 </aside>
 <main style={{marginLeft:224,flex:1,padding:"30px 34px",minHeight:"100vh",maxWidth:"calc(100vw - 224px)"}}>
 {view==="overview"&&<OverviewView holdings={HOLDINGS_DEMO}/>}
 {view==="holdings"&&<HoldingsView holdings={HOLDINGS_DEMO}/>}
 {view==="profitability"&&<ProfitabilityView holdings={HOLDINGS_DEMO}/>}
 {view==="transactions"&&<TransactionsView/>}
 {view==="portfolio"&&<PortfolioStateView holdings={HOLDINGS_DEMO}/>}
 {view==="report"&&<ReportingView holdings={HOLDINGS_DEMO}/>}
 {view==="airdrops"&&<AirdropsView/>}
 {view==="scam"&&<ScamView/>}
 </main>
 <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800;9..40,900&family=IBM+Plex+Mono:wght@400;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:5px;height:5px;}::-webkit-scrollbar-track{background:${T.bg0};}::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px;}button{transition:all 0.15s;}input::placeholder{color:${T.text3};}`}</style>
 </div>);
}
