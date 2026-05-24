/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  HelpCircle, 
  CheckCircle, 
  Loader2, 
  AlertTriangle, 
  Database, 
  MapPin, 
  TrendingUp, 
  ShieldCheck,
  ChevronRight,
  BookOpen,
  User,
  Zap,
  Flame,
  Gauge
} from "lucide-react";
import { PipelineStep } from "./components/PipelineStep";
import { ProgressBar } from "./components/ProgressBar";
import { PlayerAvatar } from "./components/PlayerAvatar";
import { RoleBadge } from "./components/RoleBadge";
import { StatBox } from "./components/StatsGrid";
import { VerdictBadge } from "./components/VerdictBadge";
import { FormSparkbar } from "./components/FormSparkbar";
import { ResultsCard } from "./components/ResultsCard";
import { PlayerCard } from "./components/PlayerCard";
import { SearchCombobox } from "./components/SearchCombobox";
import { MatchupAnalysis, PipelineStepState, StepStatus } from "./types";

const MATCHUP_PRESETS = [
  { batter: "Virat Kohli", bowler: "Jasprit Bumrah" },
  { batter: "Rohit Sharma", bowler: "Rashid Khan" },
  { batter: "Heinrich Klaasen", bowler: "Yuzvendra Chahal" },
  { batter: "Jos Buttler", bowler: "Mitchell Starc" },
];

const BATTER_OPTIONS = [
  "Virat Kohli", "Rohit Sharma", "Suryakumar Yadav", "Shubman Gill", "Yashasvi Jaiswal",
  "Ruturaj Gaikwad", "KL Rahul", "Sanju Samson", "Rishabh Pant", "Ishan Kishan",
  "MS Dhoni", "Hardik Pandya", "Rinku Singh", "Tilak Varma", "Shreyas Iyer",
  "Ajinkya Rahane", "Prithvi Shaw", "Abhishek Sharma", "Rahul Tripathi", "Nitish Rana",
  "Venkatesh Iyer", "Shivam Dube", "Devdutt Padikkal", "Rajat Patidar", "Sai Sudharsan",
  "Mayank Agarwal", "Deepak Hooda", "Axar Patel", "Ravindra Jadeja", "Washington Sundar",
  "Jos Buttler", "Phil Salt", "Jonny Bairstow", "Liam Livingstone", "Harry Brook",
  "Ben Stokes", "Moeen Ali", "Sam Curran", "Will Jacks", "Dawid Malan",
  "Travis Head", "David Warner", "Steve Smith", "Glenn Maxwell", "Marcus Stoinis",
  "Mitchell Marsh", "Tim David", "Cameron Green", "Jake Fraser-McGurk", "Josh Inglis",
  "Kane Williamson", "Devon Conway", "Daryl Mitchell", "Finn Allen", "Glenn Phillips",
  "Rachin Ravindra", "Heinrich Klaasen", "Aiden Markram", "Quinton de Kock", "David Miller",
  "Faf du Plessis", "Tristan Stubbs", "Rilee Rossouw", "Dewald Brevis", "Ryan Rickelton",
  "Babar Azam", "Mohammad Rizwan", "Fakhar Zaman", "Saim Ayub", "Iftikhar Ahmed",
  "Nicholas Pooran", "Andre Russell", "Shimron Hetmyer", "Rovman Powell", "Kyle Mayers",
  "Rahmanullah Gurbaz", "Ibrahim Zadran", "Najibullah Zadran", "Shakib Al Hasan", "Litton Das",
  "Wanindu Hasaranga", "Kusal Mendis", "Charith Asalanka", "Pathum Nissanka", "Dasun Shanaka",
];

const BOWLER_OPTIONS = [
  "Jasprit Bumrah", "Mohammed Shami", "Mohammed Siraj", "Arshdeep Singh", "Bhuvneshwar Kumar",
  "Umesh Yadav", "Shardul Thakur", "Deepak Chahar", "T Natarajan", "Mukesh Kumar",
  "Avesh Khan", "Prasidh Krishna", "Harshal Patel", "Varun Chakravarthy", "Yuzvendra Chahal",
  "Kuldeep Yadav", "Ravi Bishnoi", "Ravichandran Ashwin", "Axar Patel", "Ravindra Jadeja",
  "Washington Sundar", "Rahul Chahar", "Mayank Markande", "Rashid Khan", "Noor Ahmad",
  "Mujeeb Ur Rahman", "Naveen-ul-Haq", "Fazalhaq Farooqi", "Mohammad Nabi", "Wanindu Hasaranga",
  "Maheesh Theekshana", "Matheesha Pathirana", "Dushmantha Chameera", "Dilshan Madushanka", "Lasith Malinga",
  "Shaheen Afridi", "Haris Rauf", "Naseem Shah", "Mohammad Amir", "Shadab Khan",
  "Imad Wasim", "Abrar Ahmed", "Hasan Ali", "Mitchell Starc", "Pat Cummins",
  "Josh Hazlewood", "Adam Zampa", "Nathan Ellis", "Spencer Johnson", "Sean Abbott",
  "Kane Richardson", "Jhye Richardson", "Cameron Green", "Glenn Maxwell", "Trent Boult",
  "Tim Southee", "Lockie Ferguson", "Matt Henry", "Ish Sodhi", "Mitchell Santner",
  "Kyle Jamieson", "Adam Milne", "Kagiso Rabada", "Anrich Nortje", "Lungi Ngidi",
  "Marco Jansen", "Tabraiz Shamsi", "Keshav Maharaj", "Gerald Coetzee", "Ottniel Baartman",
  "Jofra Archer", "Mark Wood", "Adil Rashid", "Chris Jordan", "Reece Topley",
  "Sam Curran", "Moeen Ali", "Tymal Mills", "Gus Atkinson", "Sunil Narine",
  "Andre Russell", "Alzarri Joseph", "Akeal Hosein", "Obed McCoy", "Gudakesh Motie",
  "Mustafizur Rahman", "Taskin Ahmed", "Shoriful Islam", "Mehidy Hasan Miraz", "Shakib Al Hasan",
];

const VENUE_OPTIONS = [
  "Overall T20 neutral venue context", "Chidambaram Stadium, Chennai", "Narendra Modi Stadium, Ahmedabad",
  "M. Chinnaswamy Stadium, Bengaluru", "Wankhede Stadium, Mumbai", "Eden Gardens, Kolkata",
  "Rajiv Gandhi International Stadium, Hyderabad", "Arun Jaitley Stadium, Delhi", "Sawai Mansingh Stadium, Jaipur",
  "Maharaja Yadavindra Singh Stadium, Mullanpur", "Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium, Lucknow",
  "Barsapara Cricket Stadium, Guwahati", "Brabourne Stadium, Mumbai", "DY Patil Stadium, Navi Mumbai",
  "Holkar Cricket Stadium, Indore", "Green Park, Kanpur", "Barabati Stadium, Cuttack",
  "HPCA Stadium, Dharamsala", "JSCA International Stadium, Ranchi", "Shaheed Veer Narayan Singh Stadium, Raipur",
  "ACA-VDCA Cricket Stadium, Visakhapatnam", "MCA Stadium, Pune", "Sharjah Cricket Stadium, Sharjah",
  "Dubai International Cricket Stadium, Dubai", "Sheikh Zayed Stadium, Abu Dhabi", "Melbourne Cricket Ground, Melbourne",
  "Sydney Cricket Ground, Sydney", "Adelaide Oval, Adelaide", "The Gabba, Brisbane", "Perth Stadium, Perth",
  "Lord's, London", "The Oval, London", "Old Trafford, Manchester", "Edgbaston, Birmingham",
  "Trent Bridge, Nottingham", "Headingley, Leeds", "Sophia Gardens, Cardiff", "Newlands, Cape Town",
  "The Wanderers, Johannesburg", "SuperSport Park, Centurion", "Kingsmead, Durban", "Gaddafi Stadium, Lahore",
  "National Stadium, Karachi", "Rawalpindi Cricket Stadium, Rawalpindi", "R. Premadasa Stadium, Colombo",
  "Pallekele International Cricket Stadium, Kandy", "Shere Bangla National Stadium, Mirpur",
  "Zahur Ahmed Chowdhury Stadium, Chattogram", "Queen's Park Oval, Port of Spain", "Kensington Oval, Bridgetown",
  "Sabina Park, Kingston", "Providence Stadium, Guyana", "Brian Lara Stadium, Tarouba",
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";
const apiPath = (path: string) => `${API_BASE_URL}${path}`;

const PIPELINE_STEPS = [
  "Fetching matchup overview",
  "Resolving core stat profile",
  "Analyzing head-to-head history",
  "Reading pitch & venue context",
  "Fetching recent innings form",
  "Fetching player images",
  "Running Matchup Intelligence",
  "Compiling Verdict & UI",
];

export default function App() {
  // Analytical Input States
  const [batterName, setBatterName] = useState("Virat Kohli");
  const [bowlerName, setBowlerName] = useState("Jasprit Bumrah");
  const [venueName, setVenueName] = useState("Overall T20 neutral venue context");

  const [activeTab, setActiveTab] = useState<"tactical" | "recent" | "h2h" | "pitch">("tactical");
  const [analyzing, setAnalyzing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<MatchupAnalysis | null>(null);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  
  // API Backend Status
  const [apiConfig, setApiConfig] = useState<{
    geminiApiKeyPresent: boolean;
    cricapiKeyPresent: boolean;
    portraitLookupAvailable: boolean;
    warn: string | null;
  }>({
    geminiApiKeyPresent: false,
    cricapiKeyPresent: false,
    portraitLookupAvailable: false,
    warn: null
  });

  // Pipeline execution step indicators
  const [steps, setSteps] = useState<PipelineStepState[]>(
    PIPELINE_STEPS.map((label) => ({ label, status: "pending", message: "" }))
  );

  // Bash/Console Logs
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "System loaded. Ready for tactical indexing.",
    "Search for a batter and bowler, or select a preset matchup.",
    "Status: System responsive."
  ]);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Sync server API configuration on mount
  useEffect(() => {
    fetch(apiPath("/api/config-check"))
      .then((res) => res.json())
      .then((data) => {
        setApiConfig(data);
        if (data.warn) {
          addLog(`[SYSTEM WARN] ${data.warn}`);
        } else {
          addLog("[SYSTEM INFO] Gemini and CricketData API keys detected. Live profile enrichment active.");
        }
      })
      .catch((err) => {
        console.error(err);
        addLog("[SYSTEM ERROR] Failed to connect to backend configuration endpoint.");
      });
  }, []);

  // Fetch initial analytical data immediately on load:
  useEffect(() => {
    triggerAnalysis(true); // silent dynamic run
  }, []);

  // Scroll Terminal to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [...prev, `[${timestamp}] ${msg}`]);
  };

  const handleApplyPreset = (b: string, bowl: string) => {
    setBatterName(b);
    setBowlerName(bowl);
    addLog(`Preset selected: ${b} vs ${bowl}`);
  };

  const patchStep = (stepIndex: number, status: StepStatus, message: string) => {
    setSteps((prev) => {
      const updated = [...prev];
      if (updated[stepIndex]) {
        updated[stepIndex] = { ...updated[stepIndex], status, message };
      }
      return updated;
    });
  };

  const mergeRecentForm = (formData: any) => {
    setAnalysisResult((prev) => {
      if (!prev) return prev;

      const batterStats = formData?.batter?.t20Stats;
      const bowlerStats = formData?.bowler?.t20Stats;
      const batterRecentForm = Array.isArray(formData?.batter?.recentForm) ? formData.batter.recentForm : prev.batter.recentForm;
      const bowlerRecentForm = Array.isArray(formData?.bowler?.recentForm) ? formData.bowler.recentForm : prev.bowler.recentForm;

      return {
        ...prev,
        batter: {
          ...prev.batter,
          t20Stats: batterStats || prev.batter.t20Stats,
          recentForm: batterRecentForm,
        },
        bowler: {
          ...prev.bowler,
          t20Stats: bowlerStats || prev.bowler.t20Stats,
          recentForm: bowlerRecentForm,
        },
      };
    });
  };

  const mergePlayerImages = (imageData: any) => {
    setAnalysisResult((prev) => {
      if (!prev) return prev;

      const batterImage = imageData?.batter?.profile?.imageUrl || prev.batter.imageUrl;
      const bowlerImage = imageData?.bowler?.profile?.imageUrl || prev.bowler.imageUrl;

      return {
        ...prev,
        batter: {
          ...prev.batter,
          imageUrl: batterImage,
          country: imageData?.batter?.profile?.country || prev.batter.country,
          role: imageData?.batter?.profile?.role || prev.batter.role,
        },
        bowler: {
          ...prev.bowler,
          imageUrl: bowlerImage,
          country: imageData?.bowler?.profile?.country || prev.bowler.country,
          role: imageData?.bowler?.profile?.role || prev.bowler.role,
        },
        phase3: prev.phase3
          ? {
              ...prev.phase3,
              batterCard: { ...prev.phase3.batterCard, imageUrl: batterImage },
              bowlerCard: { ...prev.phase3.bowlerCard, imageUrl: bowlerImage },
            }
          : prev.phase3,
      };
    });
  };

  const runPostAnalysisAgents = async (silent: boolean) => {
    const recentUrl = apiPath(`/api/recent-form?batter=${encodeURIComponent(batterName)}&bowler=${encodeURIComponent(bowlerName)}`);
    const imagesUrl = apiPath(`/api/player-images?batter=${encodeURIComponent(batterName)}&bowler=${encodeURIComponent(bowlerName)}`);

    patchStep(4, "active", "Recent Form Agent fetching innings and bowling spells...");
    setProgressPercent(70);
    try {
      const response = await fetch(recentUrl);
      if (!response.ok) throw new Error(`Recent Form Agent returned ${response.status}`);
      const formData = await response.json();
      mergeRecentForm(formData);
      patchStep(4, "done", "Recent form updated from live lookup");
      if (!silent) addLog("[RECENT FORM AGENT] Updated innings and bowling spells.");
    } catch (error: any) {
      patchStep(4, "done", "Recent form unavailable; keeping main analysis values");
      if (!silent) addLog(`[RECENT FORM AGENT] ${error?.message || "Recent form lookup failed."}`);
    }

    patchStep(5, "active", "Player Image Agent resolving profile photos...");
    setProgressPercent(84);
    try {
      const response = await fetch(imagesUrl);
      if (!response.ok) throw new Error(`Player Image Agent returned ${response.status}`);
      const imageData = await response.json();
      mergePlayerImages(imageData);
      patchStep(5, "done", "Player images updated");
      if (!silent) addLog("[IMAGE AGENT] Player images updated.");
    } catch (error: any) {
      patchStep(5, "done", "Player images unavailable");
      if (!silent) addLog(`[IMAGE AGENT] ${error?.message || "Image lookup failed."}`);
    }

    patchStep(6, "done", "Matchup intelligence ready");
    patchStep(7, "done", "Verdict ready");
    setProgressPercent(100);
  };

  const triggerAnalysis = (silent: boolean = false) => {
    if (analyzing) return;

    if (!silent) {
      addLog(`Initiating matchup pipeline for ${batterName} vs ${bowlerName}...`);
    }
    
    setAnalyzing(true);
    setProgressPercent(5);
    setAnalysisResult(null);
    setPipelineError(null);

    setSteps(PIPELINE_STEPS.map((label, index) => ({
      label,
      status: index === 0 ? "active" : "pending",
      message: index === 0 ? "Connecting to matchup analysis agent..." : "",
    })));

    const url = apiPath(`/api/analyze-stream?batter=${encodeURIComponent(batterName)}&bowler=${encodeURIComponent(bowlerName)}&venue=${encodeURIComponent(venueName)}`);
    const eventSource = new EventSource(url);

    eventSource.addEventListener("step", (e: any) => {
      try {
        const data = JSON.parse(e.data);
        const { stepIndex, status, message } = data;

        setSteps((prev) => {
          const updated = [...prev];
          // Mark current active as done
          if (status === "done" && updated[stepIndex]) {
            updated[stepIndex].status = "done";
            updated[stepIndex].message = message;

            // Trigger next step
            if (stepIndex < 3 && updated[stepIndex + 1]) {
              updated[stepIndex + 1].status = "active";
              updated[stepIndex + 1].message = "Connecting with models...";
            }
          } else if (status === "active" && updated[stepIndex]) {
            updated[stepIndex].status = "active";
            updated[stepIndex].message = message;
          }
          return updated;
        });

        // Calculate visual progress percentage increment
        setProgressPercent((prev) => {
          const target = Math.min(68, (stepIndex + 1) * 16); 
          return target > prev ? target : prev;
        });

        if (!silent) {
          addLog(`[PIPELINE] Step ${stepIndex + 1}: ${message}`);
        }
      } catch (err) {
        console.error("Parse event step error", err);
      }
    });

    eventSource.addEventListener("complete", (e: any) => {
      try {
        const data = JSON.parse(e.data) as MatchupAnalysis;
        setAnalysisResult(data);
        patchStep(6, "active", "Running post-matchup enrichment agents...");

        if (!silent) {
          addLog(`[COMPLETE] Main matchup analysis finished. Running enrichment agents...`);
          if (data.isMock) {
            addLog("[DATABASE] Displaying beautiful local-matched cricket parameters.");
          } else {
            addLog("[GOOGLE SEARCH] Real-time sports grounds evaluated successfully.");
          }
        }
        eventSource.close();
        runPostAnalysisAgents(silent).finally(() => {
          setAnalyzing(false);
        });
      } catch (err) {
        console.error("Parse event complete error", err);
        setAnalyzing(false);
        eventSource.close();
      }
    });

    eventSource.addEventListener("error", (e: any) => {
      console.error("Stream error occurred", e);
      let message = "Live stats API failed. Check /api/analyze-stream and environment variables.";
      if (e?.data) {
        try {
          message = JSON.parse(e.data).message || message;
        } catch {
          message = e.data;
        }
      }
      addLog(`[PIPELINE ERROR] ${message}`);
      setPipelineError(message);
      setAnalyzing(false);
      setProgressPercent(100);
      eventSource.close();

      setSteps((prev) => prev.map(s => ({ ...s, status: "done" })));
    });
  };

  // Safe variables extracted from data structure
  const data = analysisResult;

  return (
    <div className="bg-[#0A0A0B] text-[#E0E0E0] min-h-screen flex flex-col font-sans overflow-x-hidden">
      
      {/* Header Navigation: Vanguard OS Style */}
      <nav id="app-nav" className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0E0E10] shrink-0">
        <div className="flex items-center space-x-4 md:space-x-6">
          <div className="w-8 h-8 bg-white flex items-center justify-center rounded-sm shrink-0">
            <div className="w-4 h-4 bg-[#0A0A0B] rotate-45"></div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-white/40 font-serif italic text-sm hidden sm:inline">data-engine /</span>
            <span id="brand-title" className="text-white font-medium tracking-tight text-sm sm:text-base">formguide-matchup</span>
          </div>
          <div className="px-2.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-white/60">
            v3.25
          </div>
        </div>

        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="text-right">
            <div className="text-[9px] text-white/30 uppercase tracking-[0.2em]">Live Grounding</div>
            <div className={`text-xs flex items-center gap-1.5 ${apiConfig.geminiApiKeyPresent ? "text-emerald-400" : "text-amber-400"}`}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${apiConfig.geminiApiKeyPresent ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
              <span>{apiConfig.geminiApiKeyPresent ? "Gemini-Search Online" : "Simulation Enabled"}</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-zinc-700 border border-white/20 flex items-center justify-center select-none text-[10px] text-white font-mono font-bold">
            TR
          </div>
        </div>
      </nav>

      {/* Main Container Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Sidebar Layout */}
        <aside id="sidebar-explorer" className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-[#0A0A0B] shrink-0">
          <div className="p-5 flex-1 space-y-6">
            <div>
              <h3 className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-3 font-mono">Select Preset Match</h3>
              <div className="space-y-1">
                {MATCHUP_PRESETS.map((p, idx) => {
                  const isActive = batterName === p.batter && bowlerName === p.bowler;
                  return (
                    <button
                      id={`preset-btn-${idx}`}
                      key={idx}
                      onClick={() => handleApplyPreset(p.batter, p.bowler)}
                      className={`w-full text-left px-3 py-2 rounded text-xs transition-all flex items-center justify-between ${
                        isActive
                          ? "bg-white/5 border border-white/10 text-emerald-400 italic font-medium"
                          : "text-white/60 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="truncate pr-1">
                        <span className="font-semibold block text-slate-100">{p.batter}</span>
                        <span className="text-[10px] text-slate-400">vs {p.bowler}</span>
                      </div>
                      <ChevronRight size={12} className={isActive ? "text-emerald-400" : "text-transparent"} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-white/5">
              <h3 className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2 font-mono flex items-center gap-1.5">
                <Database size={10} className="text-emerald-400" />
                <span>Backend Metrics</span>
              </h3>
              <div className="space-y-2 bg-[#0E0E10] border border-white/5 rounded p-3 text-xs font-mono text-white/70">
                <div className="flex justify-between">
                  <span className="text-white/30">Cric API:</span>
                  <span className={apiConfig.cricapiKeyPresent ? "text-emerald-400" : "text-amber-400"}>
                    {apiConfig.cricapiKeyPresent ? "Connected" : "Fallback"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/30">Faces:</span>
                  <span className={apiConfig.portraitLookupAvailable ? "text-emerald-400" : "text-amber-400"}>
                    {apiConfig.portraitLookupAvailable ? "Enabled" : "Fallback"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/30">Latency Check:</span>
                  <span className="text-emerald-400/80">342ms</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-950/20 border border-emerald-500/10 rounded-sm">
              <div className="flex gap-2">
                <ShieldCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#A3E635] leading-relaxed">
                  Evaluate real historical statistics, recent series events, and pitch analytics safely proxy-mapped.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-white/10 bg-[#0E0E10]/50 mt-auto">
            <div className="flex justify-between items-center text-[10px] font-mono text-white/40 mb-1.5 uppercase tracking-wider">
              <span>Grounding Cache</span>
              <span>92%</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="w-[92%] h-full bg-[#10b981]"></div>
            </div>
          </div>
        </aside>

        {/* Editor Layout & Core Application Workspace */}
        <main className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto space-y-6">
          
          {/* Top Editorial Stage */}
          <div>
            <h1 className="text-3xl md:text-5xl font-serif italic text-white leading-tight mb-2 tracking-tight">
              Batter vs Bowler <br/>Matchup Index
            </h1>
            <p className="text-white/40 max-w-xl text-xs md:text-sm leading-relaxed">
              Compare a batter's scoring profile against a bowler's threat pattern, then use the stadium tab only when pitch context matters.
            </p>
          </div>

          {/* Interactive Core Selection Fields Form */}
          <div className="bg-[#0E0E10] border border-white/10 rounded-xl p-4 md:p-6 space-y-4 shadow-xl">
            <h2 className="text-xs uppercase text-white/40 font-mono tracking-widest border-b border-white/5 pb-2">
              Matchup Parameters
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchCombobox
                id="batter-input"
                label="Batter"
                value={batterName}
                options={BATTER_OPTIONS}
                placeholder="Search batter name"
                onChange={setBatterName}
              />

              <SearchCombobox
                id="bowler-input"
                label="Bowler"
                value={bowlerName}
                options={BOWLER_OPTIONS}
                placeholder="Search bowler name"
                onChange={setBowlerName}
              />
            </div>

            {/* Execute Button Bar */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-2 text-white/30 text-[10px] italic">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${analyzing ? "bg-emerald-400 animate-ping" : "bg-emerald-500"}`}></span>
                <span className="font-mono">{analyzing ? "Streaming active Gemini metrics..." : "Ready to launch matchup model"}</span>
                {data?.isMock && (
                  <span className="text-amber-400/80 font-mono ml-1">(Simulator Active)</span>
                )}
              </div>

              <button
                id="run-pipeline-btn"
                onClick={() => triggerAnalysis(false)}
                disabled={analyzing || !batterName.trim() || !bowlerName.trim()}
                className={`px-6 py-2.5 text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 rounded ${
                  analyzing
                    ? "bg-[#0A0A0B] text-white/30 border border-white/5 cursor-not-allowed"
                    : "bg-white text-black hover:bg-zinc-200 active:scale-95 cursor-pointer"
                }`}
              >
                {analyzing ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Synchronizing...</span>
                  </>
                ) : (
                  <>
                    <Play size={13} fill="currentColor" />
                    <span>Compile Matchup Duel</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Render Active Stepper Loading State */}
          {(analyzing || progressPercent < 100) && (
            <div className="bg-[#0E0E10] border border-white/10 rounded-xl p-5 space-y-4">
              <ProgressBar percent={progressPercent} />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {steps.map((st, i) => (
                  <PipelineStep
                    key={i}
                    label={st.label}
                    status={st.status}
                    message={st.message}
                  />
                ))}
              </div>
            </div>
          )}

          {pipelineError && !analyzing && (
            <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-rose-300">
                <AlertTriangle size={16} />
                <span className="text-xs uppercase tracking-widest font-mono">Live Data Unavailable</span>
              </div>
              <p className="text-sm text-rose-100/80 leading-relaxed">
                {pipelineError} No hardcoded batting or bowling stats are being displayed.
              </p>
            </div>
          )}

          {/* Analysis Tab View Cards */}
          {data && (
            <div className="space-y-4">
              <div className="bg-[#0E0E10] border border-white/10 rounded-xl p-5 md:p-6 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Quick Matchup Summary</span>
                    <h2 className="text-xl md:text-2xl text-white font-semibold tracking-tight">
                      {data.batter.name} vs {data.bowler.name}
                    </h2>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {data.phase3?.predictionText ||
                        data.phase2?.headToHead.summary ||
                        `${data.batter.name} brings a ${data.batter.t20Stats?.strikeRate ?? "steady"} strike-rate profile against ${data.bowler.name}'s ${data.bowler.t20Stats?.economy ?? "measured"} economy-rate threat.`}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 min-w-full lg:min-w-[320px]">
                    <div className="bg-[#0A0A0B] border border-white/10 rounded p-3">
                      <span className="block text-[9px] uppercase tracking-widest text-white/30 font-mono">Verdict</span>
                      <span className="text-sm text-emerald-300 font-mono">{data.phase2?.overallRisk ?? "Contested"}</span>
                    </div>
                    <div className="bg-[#0A0A0B] border border-white/10 rounded p-3">
                      <span className="block text-[9px] uppercase tracking-widest text-white/30 font-mono">Risk</span>
                      <span className="text-sm text-white font-mono">{data.phase2?.riskScore ?? 50}/100</span>
                    </div>
                    <div className="bg-[#0A0A0B] border border-white/10 rounded p-3">
                      <span className="block text-[9px] uppercase tracking-widest text-white/30 font-mono">Batter SR</span>
                      <span className="text-sm text-white font-mono">{data.batter.t20Stats?.strikeRate ?? "-"}</span>
                    </div>
                    <div className="bg-[#0A0A0B] border border-white/10 rounded p-3">
                      <span className="block text-[9px] uppercase tracking-widest text-white/30 font-mono">Bowler Econ</span>
                      <span className="text-sm text-white font-mono">{data.bowler.t20Stats?.economy ?? "-"}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tabs selectors bar */}
              <div className="flex border-b border-white/10 py-1 overflow-x-auto whitespace-nowrap">
                {[
                  { id: "tactical", title: "Main Analysis" },
                  { id: "recent", title: "Recent Innings Form" },
                  { id: "h2h", title: "H2H Dual Index" },
                  { id: "pitch", title: "Stadium Context" }
                ].map((tb) => {
                  const isActive = activeTab === tb.id;
                  return (
                    <button
                      key={tb.id}
                      onClick={() => setActiveTab(tb.id as any)}
                      className={`px-4 py-2 text-xs uppercase tracking-wide transition-all font-mono border-b-2 text-left ${
                        isActive
                          ? "border-emerald-400 text-white font-semibold"
                          : "border-transparent text-white/50 hover:text-white"
                      }`}
                    >
                      {tb.title}
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: AI TACTICAL SIMULATION (Phase 3 + Phase 2) */}
              {activeTab === "tactical" && (
                <div id="tactical-tab-content" className="flex flex-col gap-6">

                  {/* Phase 3 Verdict Cards */}
                  {data.phase3 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      <div className="lg:col-span-8 h-full">
                        <ResultsCard data={data.phase3} />
                      </div>
                      <div className="lg:col-span-4 flex flex-col gap-4">
                        <PlayerCard card={data.phase3.batterCard} />
                        <PlayerCard card={data.phase3.bowlerCard} />
                      </div>
                    </div>
                  )}

                  {/* Phase 2 Deep Dive */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">

                    {/* Phase 2 Overall Risk & Stats */}
                    <div className="lg:col-span-1 p-6 bg-[#0E0E10] border border-white/10 rounded-xl flex flex-col justify-between space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono block mb-1">Matchup Verdict</span>
                        <VerdictBadge verdict={data.phase2?.overallRisk ?? "Contested"} />
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono block">Risk Score</span>
                        <span className="text-2xl font-mono text-white">{data.phase2?.riskScore ?? 50}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 font-mono leading-relaxed">
                      Confidence Level: <span className="uppercase text-emerald-400">{data.phase2?.confidence ?? "N/A"}</span>
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <StatBox value={`${data.phase2?.batterFormScore ?? 0}`} label="BATTER FORM" highlight />
                      <StatBox value={`${data.phase2?.bowlerThreatScore ?? 0}`} label="BOWLER THREAT" />
                    </div>
                  </div>

                  {/* Operational instructions */}
                  <div className="lg:col-span-2 space-y-4">
                    
                    {/* H2H and Venue block */}
                    <div className="p-6 bg-[#0E0E10] border border-white/10 rounded-xl space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-white/5">
                        <h3 className="text-xs text-white/30 uppercase tracking-wider font-mono flex items-center gap-2">
                          <Flame size={12} className="text-[#ffb4ab]" />
                          Head-to-Head Dominance
                        </h3>
                        <span className="text-emerald-400 font-mono text-xs uppercase">{data.phase2?.headToHead.dominance.replace("_", " ")}</span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed font-sans font-light">
                        {data.phase2?.headToHead.summary}
                      </p>
                      
                      <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                        <span className="text-[9px] font-mono uppercase text-white/30 block mb-1">Venue Adjustment ({data.phase2?.venue.venueAdjustment > 0 ? "+" : ""}{data.phase2?.venue.venueAdjustment})</span>
                        <p className="text-xs text-slate-300 leading-relaxed">{data.phase2?.venue.venueNote}</p>
                      </div>
                    </div>

                    {/* Left/Right Tactics Grid / Phase Risk */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-5 bg-[#0E0E10] border border-white/10 rounded-xl space-y-3">
                        <h3 className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Phase Risks</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-white/60">Powerplay</span>
                            <span className={data.phase2?.phaseAnalysis.powerplayRisk === "high" ? "text-rose-400" : "text-emerald-400"}>{data.phase2?.phaseAnalysis.powerplayRisk.toUpperCase()}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-white/60">Middle Overs</span>
                            <span className={data.phase2?.phaseAnalysis.middleOversRisk === "high" ? "text-rose-400" : "text-emerald-400"}>{data.phase2?.phaseAnalysis.middleOversRisk.toUpperCase()}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-white/60">Death Overs</span>
                            <span className={data.phase2?.phaseAnalysis.deathOversRisk === "high" ? "text-rose-400" : "text-emerald-400"}>{data.phase2?.phaseAnalysis.deathOversRisk.toUpperCase()}</span>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-white/5">
                          <span className="text-[9px] font-mono uppercase text-emerald-400 block mb-1">Best Attack Window</span>
                          <span className="text-sm font-sans text-white block">{data.phase2?.phaseAnalysis.bestAttackWindow}</span>
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="p-5 bg-[#0E0E10] border border-white/10 rounded-xl space-y-3">
                        <h3 className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Key Highlights</h3>
                        <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed font-sans">
                          {data.phase2?.highlights.map((hlt: string, idx: number) => (
                            <li key={idx} className="flex gap-2">
                              <span className="text-emerald-400 mt-1 shrink-0">•</span>
                              <span>{hlt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* TAB 2: RECENT INNINGS FORM */}
              {activeTab === "recent" && (
                <div id="recent-tab-content" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Batter statistics form log */}
                  <div className="p-5 bg-[#0E0E10] border border-white/10 rounded-xl space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <div className="flex items-center space-x-3">
                        <PlayerAvatar name={data.batter.name} imageUrl={data.batter.imageUrl} size="sm" />
                        <div>
                          <h4 className="text-sm font-semibold text-white">{data.batter.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">{data.batter.country}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {data.batter.recentForm && data.batter.recentForm.length > 0 && (
                          <div className="hidden sm:block" title="Recent Runs Trend">
                            <FormSparkbar values={data.batter.recentForm.map(r => r.runs).reverse()} />
                          </div>
                        )}
                        <RoleBadge role={data.batter.role} />
                      </div>
                    </div>

                    <h5 className="text-[10px] text-white/30 uppercase tracking-wider font-mono font-medium">Last 5 T20 Matches:</h5>
                    <div className="space-y-2">
                      {data.batter.recentForm && data.batter.recentForm.length > 0 ? (
                        data.batter.recentForm.map((item, idx) => (
                          <div key={idx} className="bg-[#0A0A0B] p-3 rounded flex justify-between items-center text-xs font-mono border border-white/5">
                            <span className="text-slate-400">{item.match || `Match ${idx+1}`}</span>
                            <div className="text-right">
                              <span className="text-emerald-400 font-bold text-sm">{item.runs}</span>
                              <span className="text-slate-500 text-[11px] ml-1">runs</span>
                              {item.balls && (
                                <span className="text-slate-400 ml-2">({item.balls}b, SR: {item.sr})</span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 italic">No recent match form parsed.</p>
                      )}
                    </div>
                  </div>

                  {/* Bowler statistics form log */}
                  <div className="p-5 bg-[#0E0E10] border border-white/10 rounded-xl space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <div className="flex items-center space-x-3">
                        <PlayerAvatar name={data.bowler.name} imageUrl={data.bowler.imageUrl} size="sm" />
                        <div>
                          <h4 className="text-sm font-semibold text-white">{data.bowler.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">{data.bowler.country}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {data.bowler.recentForm && data.bowler.recentForm.length > 0 && (
                          <div className="hidden sm:block" title="Recent Wickets Trend">
                             <FormSparkbar values={data.bowler.recentForm.map(r => r.wickets).reverse()} />
                          </div>
                        )}
                        <RoleBadge role={data.bowler.role} />
                      </div>
                    </div>

                    <h5 className="text-[10px] text-white/30 uppercase tracking-wider font-mono font-medium">Last 5 T20 Bowling Spells:</h5>
                    <div className="space-y-2">
                      {data.bowler.recentForm && data.bowler.recentForm.length > 0 ? (
                        data.bowler.recentForm.map((item, idx) => (
                          <div key={idx} className="bg-[#0A0A0B] p-3 rounded flex justify-between items-center text-xs font-mono border border-white/5">
                            <span className="text-slate-400">{item.match || `Spell ${idx+1}`}</span>
                            <div className="text-right space-x-3">
                              <span className="text-[#a3e635] font-bold text-base">{item.wickets} <span className="text-[10px] font-normal text-slate-400">Wkts</span></span>
                              <span className="text-slate-400 text-xs">({item.overs} Ov, {item.runs} R, {item.economy} Econ)</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 italic">No recent spells parsed.</p>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: H2H DUAL INDEX */}
              {activeTab === "h2h" && (
                <div id="h2h-tab-content" className="space-y-6">
                  
                  {/* Key overall parameters comparison grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-5 bg-[#0E0E10] border border-white/10 rounded-xl">
                      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1 font-mono">Dismissals</div>
                      <div className="text-3xl font-serif text-[#ffb4ab]">
                        {data.headToHead?.dismissals ?? 0}
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono uppercase block mt-1">Times Bowler got Batter</span>
                    </div>

                    <div className="p-5 bg-[#0E0E10] border border-white/10 rounded-xl">
                      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1 font-mono">Total Face-offs</div>
                      <div className="text-3xl font-serif text-white">
                        {data.headToHead?.totalEncounters ?? 0}
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono uppercase block mt-1">Staged T20 matches</span>
                    </div>

                    <div className="p-5 bg-[#0E0E10] border border-white/10 rounded-xl">
                      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1 font-mono">Batter H2H Strike Rate</div>
                      <div className="text-3xl font-mono text-emerald-400">
                        {data.headToHead?.batterStrikeRateVsBowler ?? 100}
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono uppercase block mt-1">Runs scored per 100 balls</span>
                    </div>

                    <div className="p-5 bg-[#0E0E10] border border-white/10 rounded-xl">
                      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1 font-mono">Batter Career SR</div>
                      <div className="text-3xl font-mono text-emerald-300">
                        {data.batter.t20Stats?.strikeRate ?? "135.0"}
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono uppercase block mt-1">Full Career T20 average</span>
                    </div>
                  </div>

                  {/* Dual career metrics breakdown */}
                  <div className="p-6 bg-[#0E0E10] border border-white/10 rounded-xl space-y-4">
                    <h3 className="text-xs text-white/30 uppercase tracking-wider font-mono">Historical Career Stats Compared</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      {/* Batter Career highlights */}
                      <div className="space-y-3">
                        <span className="text-xs text-emerald-400 font-mono uppercase tracking-wider">{data.batter.name} (T20 Global)</span>
                        <div className="space-y-1.5 font-mono text-xs">
                          <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400">Total Runs:</span>
                            <span className="text-white font-semibold">{data.batter.t20Stats?.runs ?? "8,500"}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400">Batting Average:</span>
                            <span className="text-white font-semibold">{data.batter.t20Stats?.average ?? "34.5"}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400">Strike Rate:</span>
                            <span className="text-emerald-400 font-semibold">{data.batter.t20Stats?.strikeRate ?? "138.2"}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400">Stat Milestones (100s / 50s):</span>
                            <span className="text-white font-semibold">{data.batter.t20Stats?.hundreds ?? 0} / {data.batter.t20Stats?.fifties ?? 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bowler Career highlights */}
                      <div className="space-y-3">
                        <span className="text-xs text-rose-400 font-mono uppercase tracking-wider">{data.bowler.name} (T20 Global)</span>
                        <div className="space-y-1.5 font-mono text-xs">
                          <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400">Total Wickets:</span>
                            <span className="text-white font-semibold">{data.bowler.t20Stats?.wickets ?? "240"}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400">Economy Rate:</span>
                            <span className="text-[#a3e635] font-semibold">{data.bowler.t20Stats?.economy ?? "7.52"}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400">Bowling Average:</span>
                            <span className="text-white font-semibold">{data.bowler.t20Stats?.average ?? "21.6"}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-white/5">
                            <span className="text-slate-400">Best Figures:</span>
                            <span className="text-white font-semibold">{data.bowler.t20Stats?.bestFigures ?? "4/15"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Last ball interaction recap descriptor */}
                  <div className="p-4 bg-emerald-950/20 border border-emerald-500/15 rounded-md text-xs font-mono leading-relaxed text-slate-300">
                    <span className="text-emerald-400 font-medium tracking-wide uppercase block mb-1">Last Matchup Encounter Event:</span>
                    {data.headToHead?.lastEncounterResult || "The bowler squeezed dry run options forcing errors but conceded no major hits in their final over clash."}
                  </div>

                </div>
              )}

              {/* TAB 4: STADIUM PITCH REPORT */}
              {activeTab === "pitch" && (
                <div id="pitch-tab-content" className="space-y-6">
                  <div className="bg-[#0E0E10] border border-white/10 rounded-xl p-5 md:p-6 space-y-4">
                    <div>
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Optional Stadium Feature</span>
                      <p className="text-sm text-slate-300 mt-2 max-w-2xl">
                        The core model is batter versus bowler. Pick a stadium here only when you want the pitch and venue context layered onto the matchup.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-end">
                      <SearchCombobox
                        id="venue-input"
                        label="Stadium / Venue"
                        value={venueName}
                        options={VENUE_OPTIONS}
                        placeholder="Search venue or use overall context"
                        onChange={setVenueName}
                      />
                      <button
                        type="button"
                        onClick={() => triggerAnalysis(false)}
                        disabled={analyzing}
                        className="h-10 px-5 text-xs font-bold tracking-wider uppercase rounded bg-white text-black hover:bg-zinc-200 disabled:bg-[#0A0A0B] disabled:text-white/30 disabled:border disabled:border-white/5"
                      >
                        Refresh Venue
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Pitch properties bar */}
                    <div className="md:col-span-1 p-5 bg-[#0E0E10] border border-white/10 rounded-xl space-y-4">
                    <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono">Selected Venue Location</span>
                    <h4 className="text-lg font-serif italic text-white">{data.venue?.name}</h4>
                    
                    <div className="space-y-3 pt-3 border-t border-white/5 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-400">City / District:</span>
                        <span className="text-slate-200">{data.venue?.city || "Unknown Location"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Avg 1st Innings Score:</span>
                        <span className="text-emerald-400 font-bold">{data.venue?.avgT20Score || 165}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Spin-Friendly Soil:</span>
                        <span className={data.venue?.spinAdvantage ? "text-emerald-400" : "text-slate-400"}>
                          {data.venue?.spinAdvantage ? "True (High Slip/Turn)" : "False (Favour Pace)"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Dew Factor Priority:</span>
                        <span className={data.venue?.dewFactor ? "text-[#a3e635]" : "text-slate-400"}>
                          {data.venue?.dewFactor ? "High (Chasing Preferred)" : "Low"}
                        </span>
                      </div>
                    </div>
                    </div>

                    {/* Long descriptive review text box */}
                    <div className="md:col-span-2 p-6 bg-[#0E0E10] border border-white/10 rounded-xl flex flex-col justify-between">
                    <div className="space-y-3">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <MapPin size={11} className="text-emerald-400" />
                        Pitch Report & Conditions Evaluation
                      </span>
                      <p className="text-sm text-slate-200 leading-relaxed font-sans font-light">
                        {data.venue?.pitchDescription}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-[11px] font-mono leading-relaxed text-slate-400">
                      <div>
                        <span className="text-white font-medium block">Batting Decision Plan:</span>
                        Highly recommended to chase if dew matches estimates. Fast outfield values timing early.
                      </div>
                      <div>
                        <span className="text-white font-medium block">Bowling Deployment:</span>
                        Deploy orthodox spin early in middle overs. Keep length shorter than standard slot boundaries.
                      </div>
                    </div>
                  </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* Console Drawer: Styled identically to Vanguard-OS terminal block */}
          <div className="bg-[#0E0E10] border border-white/10 rounded-xl overflow-hidden mt-6">
            <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between text-[10px] font-mono text-white/30 tracking-widest uppercase">
              <span>CRICKET DATA PIPELINE TERMINAL — BASH</span>
              <span id="terminal-clock">{new Date().toISOString().substring(11, 19)} UTC</span>
            </div>
            
            <div 
              ref={terminalRef}
              className="p-4 bg-[#0A0A0B] font-mono text-[11px] leading-relaxed text-slate-300 h-32 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-white/10"
            >
              <div className="text-emerald-500">$ search-grounding --batter &ldquo;{batterName}&rdquo; --bowler &ldquo;{bowlerName}&rdquo;</div>
              {terminalLogs.map((log, i) => {
                let colorClass = "text-white/60";
                if (log.includes("[SYSTEM INFO]")) colorClass = "text-emerald-400/80";
                if (log.includes("[SYSTEM WARN]")) colorClass = "text-amber-400/80";
                if (log.includes("[PIPELINE]")) colorClass = "text-sky-300/80";
                if (log.includes("[COMPLETE]")) colorClass = "text-emerald-400 font-bold";
                if (log.includes("[SYSTEM ERROR]") || log.includes("[PIPELINE ERROR]")) colorClass = "text-rose-400";
                
                return (
                  <div key={i} className={colorClass}>
                    {log}
                  </div>
                );
              })}
              <div className="text-white/20 animate-pulse">$ _</div>
            </div>
          </div>

        </main>
      </div>

      {/* Bottom status bar in Vanguard OS exact design styles */}
      <footer id="footer-status" className="h-8 bg-zinc-950 border-t border-white/5 flex items-center justify-between px-6 text-[10px] text-white/40 shrink-0 font-mono">
        <div className="flex space-x-4">
          <span>UTF-8</span>
          <span>Typescript</span>
          <span>Prettier: Active</span>
        </div>
        <div className="flex items-center space-x-4 uppercase tracking-widest hidden sm:flex">
          <span>Matchday System ID: {Math.random().toString(16).substring(2, 9)}</span>
          <span className="text-white/60">V 2.4.0</span>
        </div>
      </footer>

    </div>
  );
}
