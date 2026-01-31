import{j as e}from"./vendor-ui-CO0mBmim.js";import{a as A}from"./vendor-react-BQC692LR.js";import{a as T,w as R,b as re,c as ce,e as le,B as S,S as de,I as he,d as Ae}from"./index-CrdvL8SR.js";import{b6 as z,b5 as me,R as Q,bh as ue,X as pe,r as fe,bi as ge,bj as ye,bk as xe,q as we,bl as Ie,ba as Pe,bm as Le,bn as Te,z as Re,a2 as Ee,D as De,G as ze,h as He}from"./vendor-icons-DmoIqCnf.js";import"./vendor-charts-CCS-1Xlq.js";class Me{context={};isInitialized=!1;async getGlobalSettingsGracefully(){try{if(typeof T.getGlobalSettings=="function")return await T.getGlobalSettings();const o=await T.makeAuthenticatedRequest("/v1/globalsettings");return o.ok?await o.json():null}catch{return null}}async initialize(){if(!this.isInitialized)try{await this.refreshContext(),this.isInitialized=!0,console.log("Chatbot service initialized with context")}catch(o){console.warn("Failed to initialize chatbot context:",o)}}async refreshContext(){try{const[o,f,t,r]=await Promise.allSettled([T.getAccessPoints().catch(()=>[]),T.getStationsWithSiteCorrelation().catch(()=>[]),T.getSites().catch(()=>[]),this.getGlobalSettingsGracefully().catch(()=>null)]);this.context={accessPoints:o.status==="fulfilled"?o.value:[],stations:f.status==="fulfilled"?f.value:[],sites:t.status==="fulfilled"?t.value:[],globalSettings:r.status==="fulfilled"?r.value:null}}catch(o){console.warn("Failed to refresh chatbot context:",o)}}async processQuery(o,f){await this.initialize();const t=o.toLowerCase().trim(),r=`bot-${Date.now()}`;try{const c=this.detectIntent(t);let m,s=null,h=[],n,a,d;switch(c.type){case"access_points_status":m=await this.handleAccessPointsQuery(t,c);break;case"connected_clients":m=await this.handleConnectedClientsQuery(t,c);break;case"client_search":m=await this.handleClientSearchQuery(t,c);break;case"roaming_info":m=await this.handleRoamingQuery(t,c);break;case"client_health":const l=await this.handleClientHealthQuery(t,c,f);m=l.response,h=l.actions;break;case"ap_health":const u=await this.handleAPHealthQuery(t,c,f);m=u.response,h=u.actions;break;case"worst_clients":const v=await this.handleWorstClientsQuery(t,c,f);m=v.response,h=v.actions,n=v.suggestions,a=v.evidence,d=v.copyableValues;break;case"what_changed":const b=await this.handleWhatChangedQuery(t,c,f);m=b.response,h=b.actions,n=b.suggestions,a=b.evidence;break;case"network_settings":m=await this.handleNetworkSettingsQuery(t,c);break;case"site_info":m=await this.handleSiteInfoQuery(t,c);break;case"troubleshooting":m=await this.handleTroubleshootingQuery(t,c);break;case"stats_summary":m=await this.handleStatsQuery(t,c);break;default:m=this.getHelpResponse()}return{id:r,type:"bot",content:m,timestamp:new Date,data:s,actions:h.length>0?h:void 0,suggestions:n,evidence:a,copyableValues:d}}catch(c){return console.error("Error processing chatbot query:",c),{id:r,type:"bot",content:"I encountered an error while processing your request. Please try again or contact support if the issue persists.",timestamp:new Date}}}detectIntent(o){const f={access_points_status:[/access\s*point|ap\s|aps\s/,/how\s+many\s+aps?/,/ap\s+status|access\s+point\s+status/,/offline\s+aps?|down\s+aps?/,/ap\s+health|access\s+point\s+health/],connected_clients:[/how\s+many\s+clients?/,/connected\s+users?/,/client\s+count|device\s+count/,/wireless\s+clients?/,/^clients?$/,/^show\s+(me\s+)?clients?$/],client_search:[/find\s+(client|device|station)/,/search\s+(for\s+)?(client|device|station)/,/look\s*(ing)?\s*(for|up)\s+(client|device|station)?/,/where\s+is\s+(client|device)?/,/locate\s+(client|device|station)/,/client\s+.+/,/device\s+.+/,/station\s+.+/],roaming_info:[/roam(ing)?\s+(of|for|history|trail|events?)/,/roam(ing)?\s+.+/,/show\s+(me\s+)?roam/,/client\s+roam/,/where\s+(has|did)\s+.+\s+(roam|move|connect)/,/movement\s+(of|for)/,/connection\s+history/],client_health:[/is\s+(this\s+)?client\s+healthy/,/client\s+health/,/why\s+is\s+(this\s+)?(client|device)\s+slow/,/is\s+it\s+a\s+wi-?fi\s+issue/,/client\s+connection\s+(details|info)/,/how\s+is\s+(this\s+)?client/,/what('s|\s+is)\s+(wrong\s+with|the\s+issue\s+with)\s+(this\s+)?client/,/show\s+(me\s+)?connection\s+details/,/client\s+status/],ap_health:[/is\s+(this\s+)?ap\s+healthy/,/how\s+is\s+(this\s+)?ap\s+perform/,/ap\s+health\s+check/,/how\s+is\s+(this\s+)?(access\s+point|ap)\s+(doing|performing)?/,/are\s+clients\s+having\s+issues/,/is\s+(any\s+)?radio\s+overloaded/,/is\s+this\s+an?\s+(rf|uplink)\s+issue/,/ap\s+status\s+check/,/show\s+ap\s+health/],worst_clients:[/worst\s+clients?/,/problem\s+clients?/,/clients?\s+with\s+issues/,/struggling\s+clients?/,/bad\s+clients?/,/clients?\s+(having|with)\s+(problems?|issues?|trouble)/,/unhealthy\s+clients?/,/poor\s+(performing\s+)?clients?/,/triage\s+clients?/],what_changed:[/what\s+(changed|happened)/,/recent\s+changes?/,/what's\s+(new|different)/,/any\s+changes?/,/show\s+(me\s+)?changes?/,/events?\s+(in\s+)?(the\s+)?(last|past)/,/activity\s+(log|history)/,/recent\s+(events?|activity)/],network_settings:[/settings?|config|configuration/,/network\s+config|wifi\s+config/,/ssid|network\s+name/,/security|password|encryption/],site_info:[/site|location|sites?/,/which\s+sites?|what\s+sites?/,/site\s+status|site\s+health/],troubleshooting:[/problem|issue|error|trouble|help/,/not\s+working|broken|down/,/can't\s+connect|cannot\s+connect/,/slow|performance/],stats_summary:[/overview|summary|stats|statistics/,/dashboard|report|status/,/network\s+health|system\s+health/]};for(const[t,r]of Object.entries(f))if(r.some(c=>c.test(o)))return{type:t,confidence:.8,extractedEntities:this.extractEntities(o)};return{type:"unknown",confidence:0,extractedEntities:{}}}extractEntities(o){const f={};if(this.context.sites){const m=this.context.sites.map(s=>s.name?.toLowerCase()).filter(Boolean).find(s=>o.includes(s));m&&(f.site=m)}const t=o.match(/([a-z0-9]{12,})/i);t&&(f.serialNumber=t[1]);const r=o.match(/([0-9a-f]{2}[:-]){5}[0-9a-f]{2}/i);return r&&(f.macAddress=r[0]),f}isApOnline(o){if(o.clientCount&&o.clientCount>0||o.connectedClients&&o.connectedClients>0)return!0;const f=(o.status||o.connectionState||o.operationalState||o.state||"").toLowerCase(),t=o.isUp,r=o.online,c=o.connected;return f==="inservice"||f==="online"||f.includes("up")||f.includes("online")||f.includes("connected")||t===!0||r===!0||c===!0||!f&&t!==!1&&r!==!1&&c!==!1}async handleAccessPointsQuery(o,f){const t=this.context.accessPoints||[];if(t.length===0)return"I couldn't retrieve access point information at the moment. Please ensure you have the necessary permissions and try again.";const r=t.filter(h=>this.isApOnline(h)),c=t.filter(h=>!this.isApOnline(h));if(o.includes("how many")||o.includes("count"))return`You have **${t.length} total access points**:
• **${r.length} online** (${(r.length/t.length*100).toFixed(1)}%)
• **${c.length} offline** (${(c.length/t.length*100).toFixed(1)}%)

${c.length>0?`⚠️ **Attention needed**: ${c.length} access points are offline.`:"✅ All access points are online!"}`;if(o.includes("offline")||o.includes("down")||o.includes("problem")){if(c.length===0)return"✅ Great news! All your access points are currently online and operational.";{const h=c.slice(0,5).map(n=>`• **${n.apName||n.displayName||n.serialNumber}** (${n.siteName||"Unknown Site"})`).join(`
`);return`⚠️ **${c.length} access points are offline:**

${h}${c.length>5?`
...and ${c.length-5} more`:""}

**Recommendations:**
1. Check physical power connections
2. Verify network connectivity
3. Check for firmware issues
4. Contact support if problems persist`}}const m=this.groupAPsBySite(t),s=Object.entries(m).slice(0,3).map(([h,n])=>`• **${h}**: ${n} APs`).join(`
`);return`📡 **Access Points Overview:**

**Total**: ${t.length} access points
**Status**: ${r.length} online, ${c.length} offline

**Top Sites:**
${s}

**Health Score**: ${(r.length/t.length*100).toFixed(1)}%

Type "offline APs" to see details about any issues.`}async handleConnectedClientsQuery(o,f){const t=this.context.stations||[];if(t.length===0)return"I couldn't retrieve connected client information at the moment. Please check your permissions and try again.";const r=t.filter(s=>s.status?.toLowerCase()==="connected"||s.status?.toLowerCase()==="associated"||s.status?.toLowerCase()==="active");if(o.includes("how many")||o.includes("count")){const s=this.groupClientsByType(r),h=Object.entries(s).slice(0,3).map(([n,a])=>`• **${n}**: ${a} devices`).join(`
`);return`👥 **Connected Clients:**

**Total Active**: ${r.length} clients
**Total Tracked**: ${t.length} clients

**Device Breakdown:**
${h}

**Connection Quality:**
• **Excellent**: ${this.getClientsBySignalQuality(r,"excellent")} clients
• **Good**: ${this.getClientsBySignalQuality(r,"good")} clients  
• **Fair/Poor**: ${this.getClientsBySignalQuality(r,"poor")} clients`}if(f.extractedEntities.macAddress){const s=t.find(h=>h.macAddress?.toLowerCase()===f.extractedEntities.macAddress.toLowerCase());return s?`📱 **Client Found**: ${s.hostName||s.macAddress}

**Status**: ${s.status||"Unknown"}
**IP Address**: ${s.ipAddress||"Not assigned"}
**Access Point**: ${s.apName||s.apSerial||"Unknown"}
**Site**: ${s.siteName||"Unknown"}
**Signal Strength**: ${s.rss||s.signalStrength||"N/A"} dBm
**Connected Since**: ${s.firstSeen||"Unknown"}`:`❌ **Client not found**: No active client with MAC address ${f.extractedEntities.macAddress} was found.`}const c=this.groupClientsBySite(r),m=Object.entries(c).slice(0,3).map(([s,h])=>`• **${s}**: ${h} clients`).join(`
`);return`👥 **Connected Clients Overview:**

**Active Connections**: ${r.length}
**Total Devices Seen**: ${t.length}

**Site Distribution:**
${m}

**Recent Activity**: ${this.getRecentActivitySummary(t)}

Need details about a specific client? Provide the MAC address!`}async handleClientSearchQuery(o,f){const t=this.context.stations||[];if(t.length===0)return"I couldn't retrieve client information at the moment. Please check your permissions and try again.";const r=this.extractSearchTerm(o);if(!r||r==="by name or mac"||r==="name or mac"){const n=t.filter(d=>d.status?.toLowerCase()==="connected"||d.status?.toLowerCase()==="associated").slice(0,10);return n.length===0?`🔍 **Client Search**

No connected clients found. Please specify a search term.

Example: "find client aa:bb:cc:dd:ee:ff"`:`🔍 **Client Search - Connected Clients**

Type "find client" followed by a name, MAC, or IP:

${n.map(d=>{const l=d.hostName||"Unknown",u=d.macAddress,v=d.ipAddress||"No IP",b=d.siteName||"",w=[d.deviceType||"",b].filter(Boolean).join(" • ");return`• **${l}** - ${v}
  \`${u}\`${w?` (${w})`:""}`}).join(`

`)}${t.length>10?`

...and ${t.length-10} more clients`:""}

**Example queries:**
• "find client ${n[0]?.hostName||n[0]?.macAddress}"
• "find client ${n[0]?.macAddress}"`}const c=r.toLowerCase(),m=t.filter(n=>n.macAddress?.toLowerCase().includes(c)||n.ipAddress?.toLowerCase().includes(c)||n.hostName?.toLowerCase().includes(c)||n.apName?.toLowerCase().includes(c)||n.apSerial?.toLowerCase().includes(c)||n.username?.toLowerCase().includes(c)||n.siteName?.toLowerCase().includes(c)||n.network?.toLowerCase().includes(c)||n.manufacturer?.toLowerCase().includes(c)||n.deviceType?.toLowerCase().includes(c));if(m.length===0)return`❌ **No clients found matching "${r}"**

Try searching by:
• Hostname (e.g., "iPhone", "MacBook")
• MAC address (e.g., "aa:bb:cc:dd:ee:ff")
• IP address (e.g., "192.168.1.50")
• Device type (e.g., "laptop", "phone")
• Site name`;if(m.length===1){const n=m[0];return`📱 **Client Found**: ${n.hostName||n.macAddress}

**Status**: ${n.status||"Unknown"}
**MAC Address**: ${n.macAddress||"N/A"}
**IP Address**: ${n.ipAddress||"Not assigned"}
**Device Type**: ${n.deviceType||"Unknown"}
**Manufacturer**: ${n.manufacturer||"Unknown"}
**Access Point**: ${n.apName||n.apSerial||"Unknown"}
**Site**: ${n.siteName||"Unknown"}
**Network/SSID**: ${n.network||"Unknown"}
**Signal Strength**: ${n.rss||n.signalStrength||"N/A"} dBm
**Connected Since**: ${n.firstSeen||"Unknown"}`}const h=m.slice(0,8).map(n=>{const a=n.status?.toLowerCase()==="connected"?"🟢":"⚪",d=n.hostName||n.macAddress,l=n.siteName||"Unknown Site",u=n.ipAddress||"No IP";return`${a} **${d}** - ${u} (${l})`}).join(`
`);return`🔍 **Found ${m.length} clients matching "${r}":**

${h}${m.length>8?`

...and ${m.length-8} more matches`:""}

**Tip**: Search with a more specific term (MAC address or full hostname) to see detailed info for a single client.`}extractSearchTerm(o){return o.replace(/^(find|search|look\s*(for|up)?|where\s+is|locate)\s*/i,"").replace(/^(client|device|station|for)\s*/i,"").trim()}extractRoamingSearchTerm(o){return o.replace(/^(show\s+(me\s+)?)?roam(ing)?\s*(of|for|history|trail|events?)?\s*/i,"").replace(/^(client\s+roam(ing)?|connection\s+history|movement)\s*(of|for)?\s*/i,"").replace(/^(where\s+(has|did))\s*/i,"").replace(/\s*(roam|move|connect).*$/i,"").trim()}async handleRoamingQuery(o,f){const t=this.context.stations||[],r=this.extractRoamingSearchTerm(o);if(!r||r==="a client"||r==="client"){const n=t.filter(d=>d.status?.toLowerCase()==="connected"||d.status?.toLowerCase()==="associated").slice(0,10);return n.length===0?`📍 **Client Roaming**

No connected clients found. Please specify a client MAC address or hostname.

Example: "roaming aa:bb:cc:dd:ee:ff"`:`📍 **Client Roaming - Select a Client**

Type "roaming" followed by a name or MAC address:

${n.map(d=>{const l=d.hostName||"Unknown",u=d.macAddress,v=d.siteName||"",I=[d.deviceType||"",v].filter(Boolean).join(" • ");return`• **${l}**
  \`${u}\`${I?` (${I})`:""}`}).join(`

`)}${t.length>10?`

...and ${t.length-10} more clients`:""}

**Example queries:**
• "roaming ${n[0]?.hostName||n[0]?.macAddress}"
• "roaming ${n[0]?.macAddress}"`}const c=r.toLowerCase(),m=t.filter(n=>n.macAddress?.toLowerCase().includes(c)||n.ipAddress?.toLowerCase().includes(c)||n.hostName?.toLowerCase().includes(c)||n.deviceType?.toLowerCase().includes(c));if(m.length===0)return`❌ **No client found matching "${r}"**

Try searching by:
• Hostname (e.g., "roaming of iPhone")
• MAC address (e.g., "roaming aa:bb:cc:dd:ee:ff")
• IP address (e.g., "roaming 192.168.1.50")`;if(m.length>1){const n=m.slice(0,5).map(a=>`• **${a.hostName||a.macAddress}** (${a.macAddress})`).join(`
`);return`🔍 **Multiple clients found matching "${r}":**

${n}${m.length>5?`
...and ${m.length-5} more`:""}

Please specify the exact MAC address for roaming history.
Example: "roaming ${m[0].macAddress}"`}const s=m[0],h=s.macAddress;try{const n=await T.fetchStationEvents(h);if(!n||n.length===0)return`📍 **Roaming History for ${s.hostName||h}**

**Current Connection:**
• **Access Point**: ${s.apName||s.apSerial||"Unknown"}
• **Site**: ${s.siteName||"Unknown"}
• **Network**: ${s.network||"Unknown"}
• **Signal**: ${s.rss||s.signalStrength||"N/A"} dBm

ℹ️ No roaming events found in the last 30 days. This client may have stayed connected to the same AP.`;const a=["Roam","Registration","Associate","Disassociate","State Change"],d=n.filter(w=>a.includes(w.eventType)),l=new Set;d.forEach(w=>{w.apName&&l.add(w.apName)});const u={};d.forEach(w=>{u[w.eventType]=(u[w.eventType]||0)+1});const b=d.sort((w,x)=>parseInt(x.timestamp)-parseInt(w.timestamp)).slice(0,5).map(w=>{const x=new Date(parseInt(w.timestamp)).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});return`${w.eventType==="Roam"?"🔄":w.eventType==="Associate"||w.eventType==="Registration"?"✅":w.eventType==="Disassociate"||w.eventType==="De-registration"?"❌":"📍"} ${x} - ${w.eventType} → ${w.apName||"Unknown AP"}`}).join(`
`),I=Object.entries(u).map(([w,x])=>`• **${w}**: ${x}`).join(`
`);return`📍 **Roaming History for ${s.hostName||h}**

**Summary (Last 30 Days):**
• **Total Events**: ${d.length}
• **Unique APs Visited**: ${l.size}
• **Roams**: ${u.Roam||0}

**Event Breakdown:**
${I}

**Current Connection:**
• **AP**: ${s.apName||s.apSerial||"Unknown"}
• **Site**: ${s.siteName||"Unknown"}
• **Signal**: ${s.rss||s.signalStrength||"N/A"} dBm

**Recent Activity:**
${b}

💡 **Tip**: Open the client details page to see the full Roaming Trail visualization.`}catch(n){return console.error("Error fetching roaming events:",n),`📍 **Roaming for ${s.hostName||h}**

**Current Connection:**
• **Access Point**: ${s.apName||s.apSerial||"Unknown"}
• **Site**: ${s.siteName||"Unknown"}
• **Signal**: ${s.rss||s.signalStrength||"N/A"} dBm

⚠️ Unable to fetch detailed roaming history at this time. Please check the client details page for the full Roaming Trail.`}}async handleClientHealthQuery(o,f,t){const r=this.context.stations||[],c=[];let m=null;if(t?.type==="client"&&t.entityId&&(m=r.find(x=>x.macAddress?.toLowerCase()===t.entityId?.toLowerCase())),!m){const x=this.extractSearchTerm(o);if(x&&x!=="this client"&&x!=="client"){const $=r.filter(p=>p.macAddress?.toLowerCase().includes(x.toLowerCase())||p.hostName?.toLowerCase().includes(x.toLowerCase()));if($.length===1)m=$[0];else if($.length>1)return{response:`🔍 **Multiple clients found. Please be more specific:**

${$.slice(0,5).map(y=>`• **${y.hostName||y.macAddress}** (\`${y.macAddress}\`)`).join(`
`)}`,actions:$.slice(0,5).map(y=>({label:y.hostName||y.macAddress,type:"client",entityId:y.macAddress,entityName:y.hostName}))}}}if(!m){const x=r.filter(p=>p.status?.toLowerCase()==="connected").slice(0,8);return x.length===0?{response:"No connected clients found to analyze.",actions:[]}:{response:`🩺 **Client Health Check**

Please specify which client to analyze:

${x.map(p=>`• **${p.hostName||"Unknown"}** - \`${p.macAddress}\``).join(`
`)}

Example: "Is client ${x[0]?.hostName||x[0]?.macAddress} healthy?"`,actions:x.map(p=>({label:p.hostName||p.macAddress,type:"client",entityId:p.macAddress,entityName:p.hostName}))}}const s=m,h=s.hostName||s.macAddress;c.push({label:`View ${h} Details`,type:"client",entityId:s.macAddress,entityName:h});let n=[];try{n=await T.fetchStationEvents(s.macAddress)}catch{}const a=[],d=[];let l="good";const u=s.rss||s.signalStrength;if(u){const x=parseInt(u);x>=-65?a.push(`✅ **Signal**: ${u} dBm (Excellent)`):x>=-75?a.push(`✅ **Signal**: ${u} dBm (Good)`):x>=-85?(a.push(`⚠️ **Signal**: ${u} dBm (Fair)`),d.push("Weak signal strength may cause slow speeds"),l="warning"):(a.push(`❌ **Signal**: ${u} dBm (Poor)`),d.push("Very weak signal - likely cause of connectivity issues"),l="critical")}const v=s.status?.toLowerCase();if(v==="connected"||v==="associated"?a.push("✅ **Status**: Connected"):(a.push(`❌ **Status**: ${s.status||"Unknown"}`),d.push("Client is not currently connected"),l="critical"),s.txRate||s.rxRate){const x=parseInt(s.txRate)||0,$=parseInt(s.rxRate)||0;x>100||$>100?a.push(`✅ **Data Rate**: TX ${s.txRate||"N/A"} / RX ${s.rxRate||"N/A"} Mbps`):x>50||$>50?(a.push(`⚠️ **Data Rate**: TX ${s.txRate||"N/A"} / RX ${s.rxRate||"N/A"} Mbps`),d.push("Lower than optimal data rates"),l==="good"&&(l="warning")):(a.push(`❌ **Data Rate**: TX ${s.txRate||"N/A"} / RX ${s.rxRate||"N/A"} Mbps`),d.push("Very low data rates - may indicate interference or distance issues"),l="critical")}if(s.band||s.frequency){const x=s.band||s.frequency;x?.includes("5")||x?.includes("6")?a.push(`✅ **Band**: ${x}`):x?.includes("2.4")&&(a.push(`⚠️ **Band**: ${x} (consider 5GHz for better performance)`),d.push("Client on 2.4GHz - may experience congestion"),l==="good"&&(l="warning"))}if(n.length>0){const $=n.filter(p=>p.eventType==="Roam").filter(p=>{const y=parseInt(p.timestamp),C=Date.now()-3600*1e3;return y>C});$.length>5?(a.push(`⚠️ **Roaming**: ${$.length} roams in last hour (excessive)`),d.push("Frequent roaming may indicate coverage gaps or RF issues"),l==="good"&&(l="warning")):$.length>0?a.push(`✅ **Roaming**: ${$.length} roams in last hour (normal)`):a.push("✅ **Roaming**: Stable connection")}const b=l==="good"?"🟢":l==="warning"?"🟡":"🔴",I=l==="good"?"Healthy":l==="warning"?"Some Issues":"Needs Attention";let w=`🩺 **Client Health Check: ${h}**

`;return w+=`**Overall Status**: ${b} ${I}

`,w+=`**Health Indicators:**
${a.join(`
`)}

`,w+=`**Connection Details:**
`,w+=`• **AP**: ${s.apName||s.apSerial||"Unknown"}
`,w+=`• **Network**: ${s.network||s.ssid||"Unknown"}
`,w+=`• **IP Address**: ${s.ipAddress||"Not assigned"}
`,w+=`• **Site**: ${s.siteName||"Unknown"}
`,d.length>0&&(w+=`
**⚠️ Potential Issues:**
${d.map(x=>`• ${x}`).join(`
`)}
`),(s.apName||s.apSerial)&&c.push({label:`View AP: ${s.apName||s.apSerial}`,type:"access-point",entityId:s.apSerial,entityName:s.apName}),w+=`
💡 **Tip**: Click the buttons below to view detailed information.`,{response:w,actions:c}}async handleAPHealthQuery(o,f,t){const r=this.context.accessPoints||[],c=this.context.stations||[],m=[];let s=null;if(t?.type==="access-point"&&t.entityId&&(s=r.find(p=>p.serialNumber?.toLowerCase()===t.entityId?.toLowerCase()||p.apSerial?.toLowerCase()===t.entityId?.toLowerCase())),!s){const p=o.replace(/^(is\s+(this\s+)?|how\s+is\s+(this\s+)?|show\s+)/i,"").replace(/\s*(ap|access\s+point)?\s*(health|perform|doing|status|check).*$/i,"").trim();if(p&&p!=="this"&&p.length>2){const y=r.filter(C=>C.serialNumber?.toLowerCase().includes(p.toLowerCase())||C.name?.toLowerCase().includes(p.toLowerCase())||C.apName?.toLowerCase().includes(p.toLowerCase()));y.length===1&&(s=y[0])}}if(!s){const p=r.filter(C=>C.status?.toLowerCase()==="online"||C.connectionState?.toLowerCase()==="connected").slice(0,8);return p.length===0?{response:"No online access points found to analyze.",actions:[]}:{response:`📡 **AP Health Check**

Please specify which AP to analyze:

${p.map(C=>`• **${C.name||C.apName||C.serialNumber}** - \`${C.serialNumber}\``).join(`
`)}

Example: "How is AP ${p[0]?.name||p[0]?.serialNumber} performing?"`,actions:p.map(C=>({label:C.name||C.apName||C.serialNumber,type:"access-point",entityId:C.serialNumber,entityName:C.name||C.apName}))}}const h=s,n=h.name||h.apName||h.serialNumber;m.push({label:`View ${n} Details`,type:"access-point",entityId:h.serialNumber,entityName:n});const a=c.filter(p=>p.apSerial?.toLowerCase()===h.serialNumber?.toLowerCase()||p.apSerialNumber?.toLowerCase()===h.serialNumber?.toLowerCase()),d=[],l=[];let u="good";const v=h.status?.toLowerCase()||h.connectionState?.toLowerCase();v==="online"||v==="connected"?d.push("✅ **Status**: Online"):(d.push(`❌ **Status**: ${h.status||"Unknown"}`),l.push("AP is not online"),u="critical");const b=a.length;if(b<20?d.push(`✅ **Client Load**: ${b} clients (Light)`):b<50?(d.push(`⚠️ **Client Load**: ${b} clients (Moderate)`),u==="good"&&(u="warning")):(d.push(`❌ **Client Load**: ${b} clients (Heavy)`),l.push("High client density may impact performance"),u="critical"),h.radios&&Array.isArray(h.radios)&&h.radios.forEach((p,y)=>{const C=p.band||p.frequency||`Radio ${y+1}`,E=p.channel||"Auto",H=p.txPower||p.power||"Auto",W=p.status?.toLowerCase()==="up"?"✅":"⚠️";d.push(`${W} **${C}**: Ch ${E}, Power ${H}`)}),h.uplinkStatus||h.ethernetStatus){const p=h.uplinkStatus||h.ethernetStatus;p.toLowerCase().includes("up")||p.toLowerCase().includes("connected")?d.push("✅ **Uplink**: Connected"):(d.push(`❌ **Uplink**: ${p}`),l.push("Uplink connectivity issue"),u="critical")}if(a.length>0){const p=a.map(y=>parseInt(y.rss||y.signalStrength)).filter(y=>!isNaN(y));if(p.length>0){const y=Math.round(p.reduce((E,H)=>E+H,0)/p.length),C=p.filter(E=>E<-80).length;y>=-70?d.push(`✅ **Avg Client Signal**: ${y} dBm (Good)`):y>=-80?(d.push(`⚠️ **Avg Client Signal**: ${y} dBm (Fair)`),u==="good"&&(u="warning")):(d.push(`❌ **Avg Client Signal**: ${y} dBm (Poor)`),l.push("Clients experiencing weak signals"),u="critical"),C>0&&d.push(`⚠️ **Weak Signal Clients**: ${C} clients below -80 dBm`)}}const I=u==="good"?"🟢":u==="warning"?"🟡":"🔴",w=u==="good"?"Healthy":u==="warning"?"Some Issues":"Needs Attention";let x=`📡 **AP Health Check: ${n}**

`;return x+=`**Overall Status**: ${I} ${w}

`,x+=`**Health Indicators:**
${d.join(`
`)}

`,x+=`**AP Details:**
`,x+=`• **Serial**: ${h.serialNumber}
`,x+=`• **Model**: ${h.model||h.hardwareType||"Unknown"}
`,x+=`• **IP Address**: ${h.ipAddress||"Unknown"}
`,x+=`• **Site**: ${h.siteName||h.site||"Unknown"}
`,l.length>0&&(x+=`
**⚠️ Potential Issues:**
${l.map(p=>`• ${p}`).join(`
`)}
`),a.filter(p=>{const y=parseInt(p.rss||p.signalStrength);return!isNaN(y)&&y<-80}).slice(0,3).forEach(p=>{m.push({label:`View Client: ${p.hostName||p.macAddress}`,type:"client",entityId:p.macAddress,entityName:p.hostName})}),x+=`
💡 **Tip**: Click the buttons below to drill into specific entities.`,{response:x,actions:m}}async handleWorstClientsQuery(o,f,t){const r=this.context.stations||[],c=[],m=[],h=r.map(a=>{let d=100;const l=[],u=parseInt(a.rss||a.signalStrength);isNaN(u)||(u<-85?(d-=40,l.push("Very weak signal")):u<-75?(d-=20,l.push("Weak signal")):u<-65&&(d-=5));const v=parseInt(a.txRate)||0,b=parseInt(a.rxRate)||0;v<50&&b<50&&(d-=25,l.push("Low data rates")),(a.band||a.frequency||"").includes("2.4")&&(d-=10,l.push("On 2.4GHz"));const w=a.status?.toLowerCase();return w!=="connected"&&w!=="associated"&&(d-=50,l.push("Disconnected")),{...a,healthScore:Math.max(0,d),issues:l}}).filter(a=>a.healthScore<80).sort((a,d)=>a.healthScore-d.healthScore).slice(0,10);if(h.length===0)return{response:`✅ **All Clients Healthy!**

No clients with significant issues found. All ${r.length} connected clients are performing well.`,actions:[],suggestions:["Show me connected clients","How many APs are online?","Show site health status"],evidence:{endpointsCalled:["/v1/stations"],dataFields:["rss","txRate","rxRate","band","status"],timestamp:new Date},copyableValues:[]};let n=`⚠️ **Clients Needing Attention** (${h.length} found)

`;return h.forEach((a,d)=>{const l=a.hostName||a.macAddress,u=a.healthScore<40?"🔴":a.healthScore<70?"🟡":"🟢",v=a.issues.slice(0,2).join(", ");n+=`${d+1}. ${u} **${l}**
`,n+=`   Score: ${a.healthScore}/100 • ${v}
`,n+=`   AP: ${a.apName||"Unknown"} • Signal: ${a.rss||"N/A"} dBm

`,c.push({label:l.length>20?l.substring(0,20)+"...":l,type:"client",entityId:a.macAddress,entityName:a.hostName}),m.push({label:l,value:a.macAddress,type:"mac"})}),{response:n,actions:c.slice(0,5),suggestions:["Is this client healthy?","Show roaming history","How is this AP performing?"],evidence:{endpointsCalled:["/v1/stations"],dataFields:["rss","txRate","rxRate","band","status","hostName","apName"],timestamp:new Date},copyableValues:m}}async handleWhatChangedQuery(o,f,t){const r=[],c=[];let m=[];if(t?.type==="client"&&t.entityId)try{const l=await T.fetchStationEvents(t.entityId);c.push("/platformmanager/v2/logging/stations/events/query"),m=l.map(u=>({...u,source:"client",entityName:t.entityName}))}catch{}try{const l=await T.getAuditLogs?.()||[];c.push("/v1/audit/logs"),m=[...m,...l.slice(0,20).map(u=>({timestamp:u.timestamp,eventType:u.action||u.type||"Config Change",details:u.message||u.details,source:"audit"}))]}catch{}m.sort((l,u)=>{const v=parseInt(l.timestamp)||new Date(l.timestamp).getTime();return(parseInt(u.timestamp)||new Date(u.timestamp).getTime())-v});const s=Date.now()-3600*1e3,h=m.filter(l=>(parseInt(l.timestamp)||new Date(l.timestamp).getTime())>s).slice(0,15);if(h.length===0)return{response:`📋 **Recent Activity${t?.entityName?` for ${t.entityName}`:""}**

No significant changes detected in the last hour.

💡 Try expanding the time range or checking specific clients/APs.`,actions:[],suggestions:["Show worst clients","Show site health status","Are there any offline devices?"],evidence:{endpointsCalled:c,dataFields:["timestamp","eventType","details"],timestamp:new Date}};let a=`📋 **Recent Activity${t?.entityName?` for ${t.entityName}`:""}** (Last Hour)

`;const d={};return h.forEach(l=>{const u=l.eventType||"Unknown";d[u]=(d[u]||0)+1}),a+=`**Summary:**
`,Object.entries(d).forEach(([l,u])=>{const v=l.includes("Roam")?"🔄":l.includes("Associate")||l.includes("Registration")?"✅":l.includes("Disassociate")||l.includes("De-registration")?"❌":l.includes("Config")?"⚙️":"📍";a+=`${v} ${l}: ${u}
`}),a+=`
**Recent Events:**
`,h.slice(0,8).forEach(l=>{const u=new Date(parseInt(l.timestamp)||l.timestamp).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}),v=l.eventType?.includes("Roam")?"🔄":l.eventType?.includes("Associate")?"✅":l.eventType?.includes("Disassociate")?"❌":"📍";a+=`${v} ${u} - ${l.eventType||"Event"}`,l.apName&&(a+=` → ${l.apName}`),a+=`
`}),h.length>8&&(a+=`
...and ${h.length-8} more events`),{response:a,actions:r,suggestions:["Is this client healthy?","Show worst clients","Show roaming history"],evidence:{endpointsCalled:c,dataFields:["timestamp","eventType","apName","details"],timestamp:new Date}}}async handleNetworkSettingsQuery(o,f){try{const t=await T.getServices().catch(()=>[]),r=this.context.globalSettings;if(t.length===0&&!r)return"I couldn't retrieve network configuration information. Please check your permissions.";if(o.includes("ssid")||o.includes("network name")){const c=t.filter(m=>m.ssid).map(m=>`• **${m.ssid}** (${m.networkName||"Default"})`).slice(0,10);return`📶 **Network SSIDs:**

${c.length>0?c.join(`
`):"No SSIDs configured or visible."}

${c.length>10?`
...and ${t.length-10} more networks`:""}

Type "security settings" for encryption details.`}if(o.includes("security")||o.includes("encryption")){const c=t.filter(m=>m.ssid).map(m=>`• **${m.ssid}**: ${m.securityMode||"Unknown"} ${m.encryptionMethod||""}`).slice(0,8);return`🔒 **Network Security:**

${c.length>0?c.join(`
`):"No security information available."}

**Security Recommendations:**
✅ Use WPA3 when possible
✅ Enable strong passphrases  
✅ Regular security audits
✅ Guest network isolation`}return`⚙️ **Network Configuration:**

**Total Networks**: ${t.length}
**Active SSIDs**: ${t.filter(c=>c.ssid).length}

**Configuration Areas:**
• Wireless Networks & SSIDs
• Security & Encryption
• Access Control Policies
• Guest Access Settings
• Quality of Service (QoS)

Ask about specific settings like "SSIDs" or "security settings" for details.`}catch{return"I encountered an error retrieving network settings. Please try again."}}async handleSiteInfoQuery(o,f){const t=this.context.sites||[];if(t.length===0)return"I couldn't retrieve site information. Please check your permissions.";if(f.extractedEntities.site){const n=t.find(a=>a.name?.toLowerCase().includes(f.extractedEntities.site));if(n){const a=this.context.accessPoints?.filter(l=>l.siteId===n.id)||[],d=this.context.stations?.filter(l=>l.siteId===n.id)||[];return`🏢 **Site: ${n.name}**

**Access Points**: ${a.length} (${a.filter(l=>l.status?.toLowerCase()==="online").length} online)
**Connected Clients**: ${d.filter(l=>l.status?.toLowerCase()==="connected").length}
**Location**: ${n.address||n.location||"Not specified"}
**Timezone**: ${n.timezone||"Not specified"}

**Health Status**: ${this.calculateSiteHealth(a,d)}`}}const r=t.map(n=>{const a=this.context.accessPoints?.filter(u=>u.siteId===n.id)||[],d=a.filter(u=>u.status?.toLowerCase()==="online"),l=a.length>0?d.length/a.length*100:0;return{name:n.name,health:l,apCount:a.length}}).sort((n,a)=>a.health-n.health),c=r.filter(n=>n.health>=90).length,m=r.filter(n=>n.health>=70&&n.health<90).length,s=r.filter(n=>n.health<70).length,h=r.slice(0,5).map(n=>`• **${n.name}**: ${n.health.toFixed(1)}% (${n.apCount} APs)`).join(`
`);return`🏢 **Sites Overview:**

**Total Sites**: ${t.length}
**Health Distribution**:
• 🟢 **Healthy** (≥90%): ${c} sites
• 🟡 **Warning** (70-89%): ${m} sites  
• 🔴 **Critical** (<70%): ${s} sites

**Site Health Rankings:**
${h}

Ask about a specific site by name for detailed information.`}async handleTroubleshootingQuery(o,f){const t=this.context.accessPoints||[],r=this.context.stations||[];if(o.includes("can't connect")||o.includes("cannot connect"))return`🔧 **Connection Troubleshooting:**

**Quick Checks:**
1. **Verify SSID**: Ensure you're connecting to the correct network
2. **Check Password**: Confirm WiFi password is correct  
3. **Signal Strength**: Move closer to access point
4. **Device Limits**: Check if network has client limits

**Network Status:**
• Access Points Online: ${t.filter(s=>s.status?.toLowerCase()==="online").length}/${t.length}
• Active Clients: ${r.filter(s=>s.status?.toLowerCase()==="connected").length}

**If problems persist:**
• Restart your device's WiFi
• Forget and reconnect to network
• Check for device-specific issues
• Contact IT support`;if(o.includes("slow")||o.includes("performance")){const s=r.filter(h=>{const n=h.rss||h.signalStrength;return n&&parseInt(n)<-70}).length;return`🐌 **Performance Troubleshooting:**

**Current Network Load:**
• Connected Clients: ${r.filter(h=>h.status?.toLowerCase()==="connected").length}
• Poor Signal Clients: ${s}

**Performance Optimization:**
1. **Signal Strength**: Move closer to access point
2. **Bandwidth**: Check for heavy usage applications
3. **Interference**: Avoid 2.4GHz congestion
4. **Access Point Load**: Balance across multiple APs

**Recommendations:**
• Use 5GHz when available
• Update device drivers
• Check background applications
• Consider mesh network expansion`}const c=t.filter(s=>s.status?.toLowerCase()==="offline").length,m=[];return c>0&&m.push(`${c} access points offline`),poorSignalClients>0&&m.push(`${poorSignalClients} clients with poor signal`),`🛠️ **Network Health Check:**

${m.length>0?`**Issues Detected:**
${m.map(s=>`⚠️ ${s}`).join(`
`)}`:"✅ **No major issues detected**"}

**Common Solutions:**
• **Connectivity**: Check "offline APs" for access point issues
• **Performance**: Ask about "slow performance" 
• **Client Issues**: Provide MAC address for specific client help
• **Network Settings**: Ask about "network configuration"

What specific issue can I help you troubleshoot?`}async handleStatsQuery(o,f){const t=this.context.accessPoints||[],r=this.context.stations||[],c=this.context.sites||[],m=t.filter(a=>a.status?.toLowerCase()==="online"),s=r.filter(a=>a.status?.toLowerCase()==="connected"||a.status?.toLowerCase()==="associated"),h=t.length>0?m.length/t.length*100:0;let n=0;return r.forEach(a=>{const d=a.rxBytes||a.inBytes||0,l=a.txBytes||a.outBytes||0;n+=d+l}),`📊 **Network Statistics Summary:**

**🏢 Infrastructure:**
• Sites: ${c.length}
• Access Points: ${t.length} (${m.length} online)
• Network Health: ${h.toFixed(1)}%

**👥 Clients:**
• Active Connections: ${s.length}
• Total Devices Tracked: ${r.length}
• Device Types: ${this.getUniqueDeviceTypesCount()} different types

**📈 Performance:**
• Total Data Transfer: ${this.formatBytes(n)}
• Average Clients per AP: ${t.length>0?(s.length/t.length).toFixed(1):0}
• Signal Quality: ${this.getSignalQualitySummary(s)}

**⚡ Quick Actions:**
• Type "problems" for troubleshooting
• Type "offline APs" for device issues  
• Type "client count" for user details
• Type "sites" for location breakdown`}getHelpResponse(){return`🤖 **Network Assistant Help:**

I can help you with information about your EDGE network:

**📡 Access Points:**
• "How many access points?" - Get AP count and status
• "Offline APs" - Check for device issues
• "AP health" - Overall access point status

**👥 Connected Clients:**
• "How many clients?" - Client count and breakdown
• "Client [MAC address]" - Specific client details
• "Device types" - Connected device categories

**🔍 Search Clients:**
• "Find client [name]" - Search by hostname
• "Search device [IP]" - Search by IP address
• "Find client [MAC]" - Search by MAC address
• "Search for iPhone" - Search by device type

**📍 Roaming History:**
• "Roaming of [client]" - View client roaming history
• "Roaming [MAC address]" - Roaming events by MAC
• "Connection history [name]" - Where client has connected

**⚙️ Network Settings:**  
• "SSIDs" or "Network names" - View wireless networks
• "Security settings" - Encryption and security info
• "Network configuration" - General settings overview

**🏢 Sites & Locations:**
• "Sites" - Site health and status
• "Site [name]" - Specific site details

**🛠️ Troubleshooting:**
• "Problems" or "Issues" - Network health check
• "Can't connect" - Connection troubleshooting
• "Slow performance" - Performance optimization

**📊 Statistics:**
• "Overview" or "Summary" - Network statistics
• "Network health" - Overall system status

Try asking something like "How many clients are connected?" or "Show me offline access points"`}groupAPsBySite(o){return o.reduce((f,t)=>{const r=t.siteName||"Unknown Site";return f[r]=(f[r]||0)+1,f},{})}groupClientsByType(o){return o.reduce((f,t)=>{const r=t.deviceType||"Unknown Device";return f[r]=(f[r]||0)+1,f},{})}groupClientsBySite(o){return o.reduce((f,t)=>{const r=t.siteName||"Unknown Site";return f[r]=(f[r]||0)+1,f},{})}getClientsBySignalQuality(o,f){return o.filter(t=>{const r=t.rss||t.signalStrength;if(!r)return!1;const c=parseInt(r);switch(f){case"excellent":return c>=-30;case"good":return c>=-60&&c<-30;case"poor":return c<-60;default:return!1}}).length}calculateSiteHealth(o,f){if(o.length===0)return"No APs";const r=o.filter(c=>c.status?.toLowerCase()==="online").length/o.length*100;return r>=90?"🟢 Excellent":r>=70?"🟡 Good":"🔴 Needs Attention"}getRecentActivitySummary(o){return`${o.filter(t=>{if(!t.lastSeen)return!1;const r=new Date(t.lastSeen),c=new Date(Date.now()-300*1e3);return r>c}).length} clients active in last 5 minutes`}getUniqueDeviceTypesCount(){return new Set(this.context.stations?.map(f=>f.deviceType).filter(Boolean)).size}getSignalQualitySummary(o){const f=this.getClientsBySignalQuality(o,"excellent"),t=this.getClientsBySignalQuality(o,"good"),r=this.getClientsBySignalQuality(o,"poor"),c=f+t+r;return c===0?"No signal data":`${(f/c*100).toFixed(0)}% excellent signal`}formatBytes(o){if(o===0)return"0 B";const f=1024,t=["B","KB","MB","GB","TB"],r=Math.floor(Math.log(o)/Math.log(f));return parseFloat((o/Math.pow(f,r)).toFixed(2))+" "+t[r]}}const q=new Me,K="network-assistant-history";function Ve({isOpen:D=!1,onToggle:o,className:f="",context:t,onShowClientDetail:r,onShowAccessPointDetail:c,onShowSiteDetail:m}){console.log("NetworkChatbot render:",{isOpen:D,onToggle:!!o});const[s,h]=A.useState([]),[n,a]=A.useState(""),[d,l]=A.useState(!1),[u,v]=A.useState(!0),[b,I]=A.useState(!1),[w,x]=A.useState(!1),[$,p]=A.useState(!1),[y,C]=A.useState(!1),[E,H]=A.useState(null),[W,Ne]=A.useState(null),V=A.useRef(null),U=A.useRef(null);A.useEffect(()=>{try{const i=localStorage.getItem(K);if(i){const N=JSON.parse(i).map(k=>({...k,timestamp:new Date(k.timestamp)}));h(N)}}catch(i){console.warn("Failed to load chat history:",i)}},[]),A.useEffect(()=>{if(s.length>0)try{const i=s.slice(-50);localStorage.setItem(K,JSON.stringify(i))}catch(i){console.warn("Failed to save chat history:",i)}},[s]),A.useEffect(()=>{const i=g=>{(g.metaKey||g.ctrlKey)&&g.key==="k"&&(g.preventDefault(),o?.()),g.key==="Escape"&&D&&o?.()};return window.addEventListener("keydown",i),()=>window.removeEventListener("keydown",i)},[o,D]),A.useEffect(()=>{ve();const i=()=>{C(window.innerWidth<768)};return i(),window.addEventListener("resize",i),()=>window.removeEventListener("resize",i)},[]),A.useEffect(()=>{be()},[s]),A.useEffect(()=>{D&&!w&&U.current&&U.current.focus()},[D,w]);const ve=async()=>{try{v(!0),await q.initialize(),h([])}catch(i){console.error("Failed to initialize chatbot:",i),R.error("Failed to initialize network assistant")}finally{v(!1)}},be=()=>{V.current?.scrollIntoView({behavior:"smooth"})},M=async()=>{if(!n.trim()||d)return;const i={id:`user-${Date.now()}`,type:"user",content:n.trim(),timestamp:new Date};h(g=>[...g,i]),a(""),l(!0);try{const g=t?{type:t.type,entityId:t.entityId,entityName:t.entityName,siteId:t.siteId,siteName:t.siteName,timeRange:t.timeRange}:void 0,N=await q.processQuery(i.content,g);h(k=>[...k,N])}catch(g){console.error("Failed to process query:",g);const N={id:`bot-error-${Date.now()}`,type:"bot",content:"I'm sorry, I encountered an error processing your request. Please try again or contact support if the issue persists.",timestamp:new Date};h(k=>[...k,N])}finally{l(!1)}},_=i=>{i.key==="Enter"&&!i.shiftKey&&(i.preventDefault(),M())},X=()=>{if(!("webkitSpeechRecognition"in window)&&!("SpeechRecognition"in window)){R.error("Speech recognition is not supported in this browser");return}if(b){I(!1);return}const i=window.webkitSpeechRecognition||window.SpeechRecognition,g=new i;g.continuous=!1,g.interimResults=!1,g.lang="en-US",g.onstart=()=>{I(!0),R.info("Listening... Speak your question")},g.onresult=N=>{const k=N.results[0][0].transcript;a(k),I(!1)},g.onerror=N=>{console.error("Speech recognition error:",N.error),I(!1),R.error("Speech recognition failed. Please try again.")},g.onend=()=>{I(!1)},g.start()},G=async()=>{try{await q.refreshContext(),R.success("Network data refreshed");const i={id:`bot-refresh-${Date.now()}`,type:"bot",content:"✅ **Data refreshed!** I now have the latest information about your network. Feel free to ask me anything!",timestamp:new Date};h(g=>[...g,i])}catch{R.error("Failed to refresh network data")}},Y=()=>t?.type==="client"?["Is this client healthy?","Why is this client slow?","Show roaming history","Is it a Wi-Fi issue or upstream?","What AP is this client on?","Show connection details"]:t?.type==="access-point"?["How is this AP performing?","Are clients having issues?","Is any radio overloaded?","Show connected clients","Is this an RF or uplink issue?","Show AP health status"]:t?.type==="site"||t?.siteId?["Show worst clients at this site","Are any APs unhealthy?","What changed recently?","Show offline devices","Find client by name or MAC","Show site health status"]:["How many access points are online?","Show me connected clients","Find client by name or MAC","Roaming history of a client","Are there any offline devices?","Show me site health status"],J=i=>{switch(i.type){case"client":r?.(i.entityId,i.entityName);break;case"access-point":c?.(i.entityId,i.entityName);break;case"site":m?.(i.entityId,i.entityName||i.entityId);break;case"quick-action":i.action==="refresh"?G():R.info(`Quick action: ${i.action} for ${i.entityName||i.entityId}`);break}},Ce=A.useCallback(async(i,g)=>{try{await navigator.clipboard.writeText(i),H(i),R.success(`Copied ${g}`),setTimeout(()=>H(null),2e3)}catch{R.error("Failed to copy to clipboard")}},[]),$e=i=>{a(i),setTimeout(()=>{_({key:"Enter",shiftKey:!1,preventDefault:()=>{}})},100)},Z=()=>{h([]),localStorage.removeItem(K),R.success("Chat history cleared")},ee=(i,g=!1)=>!i||i.length===0?null:e.jsx("div",{className:`flex flex-wrap gap-1 ${g?"mt-1":"mt-2"}`,children:i.slice(0,g?3:6).map((N,k)=>e.jsxs(S,{variant:"ghost",size:"sm",className:`${g?"h-5 text-[10px] px-1.5":"h-6 text-xs px-2"} font-mono bg-muted/50 hover:bg-muted`,onClick:()=>Ce(N.value,N.label),children:[E===N.value?e.jsx(Re,{className:`${g?"h-2.5 w-2.5":"h-3 w-3"} mr-1 text-green-500`}):e.jsx(Ee,{className:`${g?"h-2.5 w-2.5":"h-3 w-3"} mr-1`}),e.jsx("span",{className:"truncate max-w-[100px]",children:N.value})]},k))}),te=(i,g,N=!1)=>{if(!i)return null;const k=W===g;return e.jsxs("div",{className:`${N?"mt-1":"mt-2"} pt-1 border-t border-border/30`,children:[e.jsxs("button",{onClick:()=>Ne(k?null:g),className:`flex items-center gap-1 text-muted-foreground hover:text-foreground ${N?"text-[10px]":"text-xs"}`,children:[e.jsx(De,{className:N?"h-2.5 w-2.5":"h-3 w-3"}),e.jsx("span",{children:"Evidence trail"}),k?e.jsx(ze,{className:N?"h-2.5 w-2.5":"h-3 w-3"}):e.jsx(He,{className:N?"h-2.5 w-2.5":"h-3 w-3"})]}),k&&e.jsxs("div",{className:`${N?"mt-1 text-[10px]":"mt-2 text-xs"} text-muted-foreground space-y-1`,children:[e.jsxs("div",{children:[e.jsx("span",{className:"font-medium",children:"Endpoints:"}),e.jsx("div",{className:"ml-2",children:i.endpointsCalled.map((j,P)=>e.jsx("div",{className:"font-mono",children:j},P))})]}),e.jsxs("div",{children:[e.jsx("span",{className:"font-medium",children:"Data fields:"}),e.jsx("span",{className:"ml-1",children:i.dataFields.join(", ")})]}),e.jsxs("div",{children:[e.jsx("span",{className:"font-medium",children:"Retrieved:"}),e.jsx("span",{className:"ml-1",children:i.timestamp.toLocaleTimeString()})]})]})]})},se=(i,g=!1)=>!i||i.length===0?null:e.jsxs("div",{className:`${g?"mt-1.5":"mt-2"} pt-1.5 border-t border-border/30`,children:[e.jsx("div",{className:`${g?"text-[10px]":"text-xs"} text-muted-foreground mb-1`,children:"Follow-up questions:"}),e.jsx("div",{className:"flex flex-wrap gap-1",children:i.slice(0,g?2:3).map((N,k)=>e.jsx(S,{variant:"outline",size:"sm",className:`${g?"h-5 text-[10px] px-1.5":"h-6 text-xs px-2"}`,onClick:()=>$e(N),children:N},k))})]}),Se=()=>{if(!t?.type)return null;const i={client:{icon:"👤",label:"Client",name:t.entityName||t.entityId},"access-point":{icon:"📡",label:"AP",name:t.entityName||t.entityId},site:{icon:"🏢",label:"Site",name:t.siteName||t.entityName},wlan:{icon:"📶",label:"WLAN",name:t.entityName}}[t.type];return i?e.jsxs("div",{className:"flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-xs",children:[e.jsx("span",{children:i.icon}),e.jsxs("span",{className:"text-muted-foreground",children:[i.label,":"]}),e.jsx("span",{className:"font-medium truncate max-w-[150px]",children:i.name}),t.siteName&&t.type!=="site"&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"text-muted-foreground",children:"at"}),e.jsx("span",{className:"truncate max-w-[100px]",children:t.siteName})]})]}):null},ke=()=>t?.type?{client:`What would you like to know about ${t.entityName||"this client"}?`,"access-point":`What would you like to know about ${t.entityName||"this AP"}?`,site:`What would you like to troubleshoot at ${t.siteName||"this site"}?`,wlan:`What would you like to know about ${t.entityName||"this network"}?`}[t.type]||"What would you like to know?":"What would you like to know about your network?",ne=i=>{const g=i.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|•.*?(?=\n|$))/g),N=/([0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}/g,k=(j,P)=>{const L=j.match(N);if(L){const B=j.split(N),O=[];let F=0;return B.forEach((ae,je)=>{if(ae&&O.push(e.jsx("span",{children:ae},`${P}-seg-${je}`)),F<L.length){const oe=L[F];O.push(e.jsx("button",{className:"font-mono text-primary hover:underline cursor-pointer",onClick:()=>r?.(oe),children:oe},`${P}-mac-${F}`)),F++}}),O}return j};return g.map((j,P)=>{if(j.startsWith("**")&&j.endsWith("**")){const L=j.slice(2,-2);return e.jsx("strong",{className:"text-foreground",children:k(L,`strong-${P}`)},P)}if(j.startsWith("*")&&j.endsWith("*")&&!j.startsWith("**"))return e.jsx("em",{children:j.slice(1,-1)},P);if(j.startsWith("`")&&j.endsWith("`")){const L=j.slice(1,-1);return N.test(L)?e.jsx("button",{className:"bg-muted px-1 py-0.5 rounded text-xs font-mono text-primary hover:underline cursor-pointer",onClick:()=>r?.(L),children:L},P):e.jsx("code",{className:"bg-muted px-1 py-0.5 rounded text-xs font-mono",children:L},P)}return j.startsWith("• ")?e.jsx("div",{className:"ml-2",children:k(j,`bullet-${P}`)},P):j.split(`
`).map((L,B)=>e.jsxs("span",{children:[k(L,`line-${P}-${B}`),B<j.split(`
`).length-1&&e.jsx("br",{})]},`${P}-${B}`))})},ie=e.jsx("div",{style:{position:"fixed",bottom:"clamp(16px, 4vw, 24px)",right:"clamp(16px, 4vw, 24px)",zIndex:99999,width:"clamp(56px, 12vw, 64px)",height:"clamp(56px, 12vw, 64px)"},children:e.jsx(S,{onClick:o,size:"icon",style:{width:"100%",height:"100%",borderRadius:"50%",backgroundColor:"#BB86FC",color:"#000000",boxShadow:"0 8px 32px rgba(187, 134, 252, 0.4), 0 4px 16px rgba(0, 0, 0, 0.2)",border:"2px solid rgba(255, 255, 255, 0.1)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.2s ease"},onMouseEnter:i=>{i.target.style.transform="scale(1.1)",i.target.style.boxShadow="0 12px 48px rgba(187, 134, 252, 0.6), 0 6px 24px rgba(0, 0, 0, 0.3)"},onMouseLeave:i=>{i.target.style.transform="scale(1)",i.target.style.boxShadow="0 8px 32px rgba(187, 134, 252, 0.4), 0 4px 16px rgba(0, 0, 0, 0.2)"},children:e.jsx(Te,{size:typeof window<"u"?Math.min(28,Math.max(20,window.innerWidth*.04)):24})})});return D?$?e.jsxs("div",{style:{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:99999,backgroundColor:"var(--background)",display:"flex",flexDirection:"column"},children:[e.jsxs(re,{className:"flex flex-row items-center justify-between space-y-0 py-4 px-6 border-b border-border",children:[e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsxs("div",{className:"relative",children:[e.jsx(z,{className:"h-6 w-6 text-primary"}),e.jsx(me,{className:"h-3 w-3 text-secondary absolute -top-1 -right-1"})]}),e.jsx(ce,{className:"text-lg font-semibold",children:"Network Assistant"}),Se(),u&&e.jsxs(le,{variant:"secondary",className:"text-xs",children:[e.jsx(Q,{className:"h-3 w-3 mr-1 animate-spin"}),"Initializing"]})]}),e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsx(S,{variant:"ghost",size:"icon",onClick:G,className:"h-8 w-8",title:"Refresh network data",children:e.jsx(Q,{className:"h-4 w-4"})}),e.jsx(S,{variant:"ghost",size:"icon",onClick:()=>p(!1),className:"h-8 w-8",title:"Exit full screen",children:e.jsx(ue,{className:"h-4 w-4"})}),e.jsx(S,{variant:"ghost",size:"icon",onClick:()=>{p(!1),o?.()},className:"h-8 w-8",title:"Close",children:e.jsx(pe,{className:"h-4 w-4"})})]})]}),e.jsx("div",{className:"flex-1 flex overflow-hidden",style:{minHeight:0},children:e.jsxs("div",{className:"flex-1 flex flex-col max-w-4xl mx-auto w-full px-4",style:{minHeight:0},children:[e.jsx(de,{className:"flex-1",style:{minHeight:0},children:e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"space-y-4",children:[s.length===0&&!d&&e.jsxs("div",{className:"text-center py-12",children:[e.jsx(z,{className:"h-16 w-16 mx-auto mb-4 text-primary opacity-50"}),e.jsx("h3",{className:"text-xl font-semibold mb-2",children:"Network Assistant"}),e.jsx("p",{className:"text-muted-foreground mb-6",children:ke()}),e.jsx("div",{className:"grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto",children:Y().map((i,g)=>e.jsx(S,{variant:"outline",className:"h-auto py-3 px-4 text-sm text-left whitespace-normal",onClick:()=>a(i),children:i},g))})]}),s.map(i=>e.jsx("div",{className:`flex ${i.type==="user"?"justify-end":"justify-start"}`,children:e.jsx("div",{className:`max-w-[70%] rounded-lg px-4 py-3 ${i.type==="user"?"bg-primary text-primary-foreground":"surface-1dp border border-border"}`,children:e.jsxs("div",{className:"flex items-start space-x-3",children:[i.type==="bot"&&e.jsx(z,{className:"h-5 w-5 text-primary mt-0.5 flex-shrink-0"}),i.type==="user"&&e.jsx(fe,{className:"h-5 w-5 text-primary-foreground mt-0.5 flex-shrink-0"}),e.jsxs("div",{className:"flex-1 space-y-1",children:[e.jsx("div",{className:"whitespace-pre-wrap",children:ne(i.content)}),e.jsx("div",{className:`text-xs opacity-70 ${i.type==="user"?"text-primary-foreground":"text-muted-foreground"}`,children:i.timestamp.toLocaleTimeString()}),i.actions&&i.actions.length>0&&e.jsx("div",{className:"flex flex-wrap gap-2 mt-2 pt-2 border-t border-border/50",children:i.actions.map((g,N)=>e.jsxs(S,{variant:"outline",size:"sm",className:"h-7 text-xs",onClick:()=>J(g),children:[g.type==="client"?"👤":g.type==="access-point"?"📡":g.type==="quick-action"?"⚡":"🏢",e.jsx("span",{className:"ml-1",children:g.label})]},N))}),ee(i.copyableValues,!1),se(i.suggestions,!1),te(i.evidence,i.id,!1)]})]})})},i.id)),d&&e.jsx("div",{className:"flex justify-start",children:e.jsx("div",{className:"max-w-[70%] surface-1dp border border-border rounded-lg px-4 py-3",children:e.jsxs("div",{className:"flex items-center space-x-3",children:[e.jsx(z,{className:"h-5 w-5 text-primary"}),e.jsxs("div",{className:"flex space-x-1",children:[e.jsx("div",{className:"h-2 w-2 bg-primary rounded-full animate-bounce"}),e.jsx("div",{className:"h-2 w-2 bg-primary rounded-full animate-bounce",style:{animationDelay:"0.1s"}}),e.jsx("div",{className:"h-2 w-2 bg-primary rounded-full animate-bounce",style:{animationDelay:"0.2s"}})]})]})})})]}),e.jsx("div",{ref:V})]})}),e.jsxs("div",{className:"border-t border-border p-4",children:[e.jsxs("div",{className:"flex items-center space-x-3 max-w-3xl mx-auto",children:[e.jsxs("div",{className:"flex-1 relative",children:[e.jsx(he,{ref:U,placeholder:"Ask about your network...",value:n,onChange:i=>a(i.target.value),onKeyPress:_,disabled:d||u,className:"pr-10 h-12 text-base"}),b&&e.jsx("div",{className:"absolute right-3 top-1/2 transform -translate-y-1/2",children:e.jsx("div",{className:"h-3 w-3 bg-red-500 rounded-full animate-pulse"})})]}),e.jsx(S,{variant:"ghost",size:"icon",onClick:X,disabled:d||u,className:`h-12 w-12 ${b?"text-red-500":""}`,title:"Voice input",children:b?e.jsx(ge,{className:"h-5 w-5"}):e.jsx(ye,{className:"h-5 w-5"})}),e.jsx(S,{onClick:M,disabled:!n.trim()||d||u,size:"icon",className:"h-12 w-12",children:e.jsx(xe,{className:"h-5 w-5"})})]}),e.jsxs("div",{className:"flex items-center justify-between mt-3 max-w-3xl mx-auto",children:[e.jsxs("div",{className:"text-sm text-muted-foreground",children:["Press Enter to send • ",e.jsx("kbd",{className:"px-1.5 py-0.5 bg-muted rounded text-xs",children:"⌘K"})," to toggle"]}),e.jsxs("div",{className:"flex items-center gap-2",children:[s.length>0&&e.jsx(S,{variant:"ghost",size:"sm",onClick:Z,className:"text-sm text-muted-foreground hover:text-destructive",children:"Clear history"}),e.jsxs(S,{variant:"ghost",size:"sm",onClick:()=>{a("help"),setTimeout(()=>M(),100)},className:"text-sm",children:[e.jsx(we,{className:"h-4 w-4 mr-1"}),"Help"]})]})]})]})]})})]}):e.jsxs(e.Fragment,{children:[ie,e.jsxs("div",{style:{position:"fixed",bottom:y?"clamp(80px, 15vh, 100px)":"clamp(88px, 20vh, 120px)",right:y?"8px":"clamp(16px, 4vw, 24px)",left:y?"8px":"auto",width:y?"calc(100vw - 16px)":"min(384px, calc(100vw - 32px))",height:w?"64px":y?"min(70vh, calc(100vh - 140px))":"min(600px, calc(100vh - 160px))",maxWidth:y?"none":"384px",maxHeight:w?"64px":"calc(100vh - 140px)",minHeight:w?"64px":y?"280px":"320px",zIndex:99998,backgroundColor:"var(--background)",border:"1px solid var(--border)",borderRadius:y?"12px 12px 0 0":"12px",boxShadow:"0 20px 64px rgba(0, 0, 0, 0.3), 0 8px 32px rgba(0, 0, 0, 0.15)",display:"flex",flexDirection:"column"},children:[e.jsxs(re,{className:`flex flex-col space-y-2 pb-2 border-b border-border ${y?"px-3 py-2":"px-4 py-3"}`,children:[e.jsxs("div",{className:"flex flex-row items-center justify-between",children:[e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsxs("div",{className:"relative",children:[e.jsx(z,{className:"h-5 w-5 text-primary"}),e.jsx(me,{className:"h-2 w-2 text-secondary absolute -top-1 -right-1"})]}),e.jsx(ce,{className:`font-medium ${y?"text-xs":"text-sm"}`,children:"Network Assistant"}),u&&e.jsxs(le,{variant:"secondary",className:"text-xs",children:[e.jsx(Q,{className:"h-3 w-3 mr-1 animate-spin"}),"Initializing"]})]}),e.jsxs("div",{className:"flex items-center space-x-1",children:[e.jsx(S,{variant:"ghost",size:"icon",onClick:G,className:"h-6 w-6",title:"Refresh network data",children:e.jsx(Q,{className:"h-3 w-3"})}),e.jsx(S,{variant:"ghost",size:"icon",onClick:()=>{p(!$),x(!1)},className:"h-6 w-6",title:$?"Exit full screen":"Full screen",children:$?e.jsx(ue,{className:"h-3 w-3"}):e.jsx(Ie,{className:"h-3 w-3"})}),!$&&e.jsx(S,{variant:"ghost",size:"icon",onClick:()=>x(!w),className:"h-6 w-6",title:w?"Expand":"Minimize",children:w?e.jsx(Pe,{className:"h-3 w-3"}):e.jsx(Le,{className:"h-3 w-3"})}),e.jsx(S,{variant:"ghost",size:"icon",onClick:()=>{p(!1),o?.()},className:"h-6 w-6",title:"Close",children:e.jsx(pe,{className:"h-3 w-3"})})]})]}),t?.type&&e.jsxs("div",{className:"flex items-center gap-1.5 text-xs",children:[e.jsx("span",{children:t.type==="client"?"👤":t.type==="access-point"?"📡":"🏢"}),e.jsx("span",{className:"text-muted-foreground truncate max-w-[200px]",children:t.entityName||t.entityId})]})]}),!w&&e.jsxs(e.Fragment,{children:[e.jsx(Ae,{className:"flex-1 flex flex-col p-0 min-h-0",children:e.jsxs(de,{className:"flex-1 p-4",style:{minHeight:0},children:[e.jsxs("div",{className:"space-y-4",children:[s.map(i=>e.jsx("div",{className:`flex ${i.type==="user"?"justify-end":"justify-start"}`,children:e.jsx("div",{className:`max-w-[85%] rounded-lg px-3 py-2 text-sm ${i.type==="user"?"bg-primary text-primary-foreground":"surface-1dp border border-border"}`,children:e.jsxs("div",{className:"flex items-start space-x-2",children:[i.type==="bot"&&e.jsx(z,{className:"h-4 w-4 text-primary mt-0.5 flex-shrink-0"}),i.type==="user"&&e.jsx(fe,{className:"h-4 w-4 text-primary-foreground mt-0.5 flex-shrink-0"}),e.jsxs("div",{className:"flex-1 space-y-1",children:[e.jsx("div",{className:"whitespace-pre-wrap",children:ne(i.content)}),e.jsx("div",{className:`text-xs opacity-70 ${i.type==="user"?"text-primary-foreground":"text-muted-foreground"}`,children:i.timestamp.toLocaleTimeString()}),i.actions&&i.actions.length>0&&e.jsxs("div",{className:"flex flex-wrap gap-1 mt-2 pt-2 border-t border-border/50",children:[i.actions.slice(0,3).map((g,N)=>e.jsxs(S,{variant:"outline",size:"sm",className:"h-6 text-xs px-2",onClick:()=>J(g),children:[g.type==="client"?"👤":g.type==="access-point"?"📡":g.type==="quick-action"?"⚡":"🏢",e.jsx("span",{className:"ml-1 truncate max-w-[100px]",children:g.label})]},N)),i.actions.length>3&&e.jsxs("span",{className:"text-xs text-muted-foreground self-center",children:["+",i.actions.length-3," more"]})]}),ee(i.copyableValues,!0),se(i.suggestions,!0),te(i.evidence,i.id,!0)]})]})})},i.id)),d&&e.jsx("div",{className:"flex justify-start",children:e.jsx("div",{className:"max-w-[85%] surface-1dp border border-border rounded-lg px-3 py-2",children:e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsx(z,{className:"h-4 w-4 text-primary"}),e.jsxs("div",{className:"flex space-x-1",children:[e.jsx("div",{className:"h-2 w-2 bg-primary rounded-full animate-bounce"}),e.jsx("div",{className:"h-2 w-2 bg-primary rounded-full animate-bounce",style:{animationDelay:"0.1s"}}),e.jsx("div",{className:"h-2 w-2 bg-primary rounded-full animate-bounce",style:{animationDelay:"0.2s"}})]})]})})}),s.length<=1&&!d&&e.jsxs("div",{className:"space-y-2",children:[e.jsx("div",{className:"text-xs text-muted-foreground font-medium",children:"Suggested questions:"}),e.jsx("div",{className:"flex flex-wrap gap-1",children:Y().slice(0,y?2:3).map((i,g)=>e.jsx(S,{variant:"outline",size:"sm",className:`text-xs h-6 px-2 ${y?"flex-1 min-w-0":""}`,onClick:()=>a(i),children:e.jsx("span",{className:y?"truncate":"",children:i})},g))})]})]}),e.jsx("div",{ref:V})]})}),e.jsxs("div",{className:`border-t border-border ${y?"p-2":"p-3"}`,children:[e.jsxs("div",{className:"flex items-center space-x-2",children:[e.jsxs("div",{className:"flex-1 relative",children:[e.jsx(he,{ref:U,placeholder:y?"Ask about network...":"Ask about your network...",value:n,onChange:i=>a(i.target.value),onKeyPress:_,disabled:d||u,className:"pr-8",style:{fontSize:y?"16px":void 0}}),b&&e.jsx("div",{className:"absolute right-2 top-1/2 transform -translate-y-1/2",children:e.jsx("div",{className:"h-2 w-2 bg-red-500 rounded-full animate-pulse"})})]}),e.jsx(S,{variant:"ghost",size:"icon",onClick:X,disabled:d||u,className:`${y?"h-9 w-9":"h-8 w-8"} ${b?"text-red-500":""}`,title:"Voice input",children:b?e.jsx(ge,{className:"h-4 w-4"}):e.jsx(ye,{className:"h-4 w-4"})}),e.jsx(S,{onClick:M,disabled:!n.trim()||d||u,size:"icon",className:y?"h-9 w-9":"h-8 w-8",children:e.jsx(xe,{className:"h-4 w-4"})})]}),e.jsxs("div",{className:`flex items-center justify-between ${y?"mt-1":"mt-2"}`,children:[e.jsxs("div",{className:`text-xs text-muted-foreground ${y?"hidden":""}`,children:[e.jsx("kbd",{className:"px-1 py-0.5 bg-muted rounded text-[10px]",children:"⌘K"})," to toggle"]}),e.jsxs("div",{className:`flex items-center gap-1 ${y?"ml-auto":""}`,children:[s.length>0&&!y&&e.jsx(S,{variant:"ghost",size:"sm",onClick:Z,className:"text-xs h-6 px-2 text-muted-foreground hover:text-destructive",children:"Clear"}),e.jsxs(S,{variant:"ghost",size:"sm",onClick:()=>{const i={id:`user-help-${Date.now()}`,type:"user",content:"help",timestamp:new Date};h(g=>[...g,i]),M()},className:"text-xs h-6 px-2",children:[e.jsx(we,{className:"h-3 w-3 mr-1"}),"Help"]})]})]})]})]})]})]}):ie}export{Ve as NetworkChatbot};
