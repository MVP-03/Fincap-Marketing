"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState, useRef, type FormEvent, type KeyboardEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Compass,
  Flame,
  GraduationCap,
  Layers,
  LineChart,
  LockKeyhole,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Swords,
  TerminalSquare,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import primaryLogo from "@/assets/logo.png";
import { LivingArenaCarousel } from "@/components/LivingArenaCarousel";

type PreviewTab = "learn" | "arena" | "terminal";
type SubmitState = "idle" | "loading" | "success" | "duplicate" | "error";

const launchDates = {
  early: new Date("2026-10-30T00:00:00+05:30"),
  public: new Date("2026-11-10T00:00:00+05:30"),
};

function getLaunchTarget(now: number) {
  if (now < launchDates.early.getTime())
    return { date: launchDates.early, label: "FIRST 100 · EARLY ACCESS" };
  if (now < launchDates.public.getTime())
    return { date: launchDates.public, label: "PUBLIC LAUNCH" };
  return { date: null, label: "FINLEDGEARENA IS LIVE" };
}

function countdownParts(now: number) {
  const current = now || new Date("2026-10-14T00:00:00+05:30").getTime();
  const target = getLaunchTarget(current);
  if (!target.date) return { ...target, days: 0, hours: 0, minutes: 0, seconds: 0 };
  const secondsLeft = Math.max(0, Math.floor((target.date.getTime() - current) / 1000));
  return {
    ...target,
    days: Math.floor(secondsLeft / 86400),
    hours: Math.floor((secondsLeft % 86400) / 3600),
    minutes: Math.floor((secondsLeft % 3600) / 60),
    seconds: secondsLeft % 60,
  };
}

export default function Landing() {
  const reducedMotion = useReducedMotion();
  const [now, setNow] = useState(0);
  const [activeTab, setActiveTab] = useState<PreviewTab>("learn");
  const [learnStage, setLearnStage] = useState(0);
  const [notifiedMonthly, setNotifiedMonthly] = useState(false);
  const [arenaChoice, setArenaChoice] = useState<string | null>(null);
  const [arenaLeaderboardTab, setArenaLeaderboardTab] = useState<"today" | "alltime">("today");
  const [strategyPreset, setStrategyPreset] = useState<"momentum" | "quality" | "dividend" | "custom">("momentum");
  const [selectedStocks, setSelectedStocks] = useState(["RELIANCE", "TCS", "INFY"]);
  const [terminalLeaderboardTab, setTerminalLeaderboardTab] = useState<"current" | "past">("current");
  const [isSimulating, setIsSimulating] = useState(false);
  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const sectionRef = useRef<HTMLDivElement>(null);
  const [stInstance, setStInstance] = useState<ScrollTrigger | null>(null);

  // GSAP ScrollTrigger Pinned Card Stack Effect
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!sectionRef.current) return;
    const cards = gsap.utils.toArray<HTMLElement>(".stacked-experience-card");
    if (cards.length < 3) return;

    const ctx = gsap.context(() => {
      gsap.set(cards, { transformOrigin: "center top", backfaceVisibility: "hidden" });
      gsap.set(cards[0], { zIndex: 1, yPercent: 0, scale: 1, filter: "blur(0px)" });
      gsap.set(cards[1], { zIndex: 2, yPercent: 105, scale: 1, filter: "blur(0px)" });
      gsap.set(cards[2], { zIndex: 3, yPercent: 105, scale: 1, filter: "blur(0px)" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          start: "top top",
          end: "+=2400",
          scrub: 0.8,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            if (p < 0.35) {
              setActiveTab("learn");
            } else if (p < 0.72) {
              setActiveTab("arena");
            } else {
              setActiveTab("terminal");
            }
          },
        },
      });

      setStInstance(tl.scrollTrigger || null);

      // Card 1 -> Card 2: outgoing gets blur push-back, incoming slides up
      tl.to(cards[0], {
        scale: 0.93,
        y: -12,
        filter: "blur(3px)",
        duration: 1,
        ease: "power2.inOut",
      }, 0);
      tl.to(cards[1], {
        yPercent: 0,
        filter: "blur(0px)",
        duration: 1,
        ease: "power2.inOut",
      }, 0);

      // Card 2 -> Card 3: outgoing gets blur push-back, incoming slides up
      tl.to(cards[1], {
        scale: 0.96,
        y: -6,
        filter: "blur(3px)",
        duration: 1,
        ease: "power2.inOut",
      }, 1);
      tl.to(cards[2], {
        yPercent: 0,
        filter: "blur(0px)",
        duration: 1,
        ease: "power2.inOut",
      }, 1);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  function jumpToTab(tab: PreviewTab) {
    setActiveTab(tab);
    if (!stInstance) return;
    const start = stInstance.start;
    const distance = stInstance.end - start;
    let target = start;
    if (tab === "arena") target = start + distance * 0.45;
    if (tab === "terminal") target = start + distance * 0.95;
    window.scrollTo({
      top: target,
      behavior: "smooth",
    });
  }

  const countdown = countdownParts(now);
  const allStockOptions = ["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "ITC"];
  const allocation = Math.round(100 / selectedStocks.length);
  const statusMessage = {
    idle: "We’ll only use your email to contact you about FinLedgeArena early access.",
    loading: "Sending your waitlist request…",
    success: "You’re on the list. We’ll email you with early-access updates.",
    duplicate: "This email is already on the waitlist. We’ll be in touch.",
    error: "We couldn’t save your request. Check your connection and try again.",
  }[submitState];

  const strategyPresetsData = {
    momentum: {
      name: "Nifty Momentum Leaders",
      stocks: ["RELIANCE", "TCS", "INFY"],
      cagr: "+22.4%",
      drawdown: "-13.8%",
      sharpe: "1.74",
      winRate: "78%",
      thesis: "Trend-following top index heavyweights on 6-month momentum breakout.",
    },
    quality: {
      name: "All-Weather Quality Core",
      stocks: ["HDFCBANK", "TCS", "ITC"],
      cagr: "+18.1%",
      drawdown: "-8.2%",
      sharpe: "1.86",
      winRate: "82%",
      thesis: "High ROCE, low leverage balance sheets built for steady compounding.",
    },
    dividend: {
      name: "High-Dividend Cashflow",
      stocks: ["ITC", "RELIANCE", "ICICIBANK"],
      cagr: "+15.6%",
      drawdown: "-9.1%",
      sharpe: "1.52",
      winRate: "71%",
      thesis: "Defensive dividend yields with reinvestment for lower market volatility.",
    },
    custom: {
      name: "Custom Sandbox Allocation",
      stocks: selectedStocks,
      cagr: `+${(14 + selectedStocks.length * 1.8).toFixed(1)}%`,
      drawdown: `-${(13.5 - selectedStocks.length * 0.9).toFixed(1)}%`,
      sharpe: (1.2 + selectedStocks.length * 0.11).toFixed(2),
      winRate: `${62 + selectedStocks.length * 3}%`,
      thesis: "User-defined custom basket testing against benchmark.",
    },
  };

  const currentStrategy = strategyPresetsData[strategyPreset];

  function handleSelectPreset(key: "momentum" | "quality" | "dividend") {
    setStrategyPreset(key);
    setSelectedStocks(strategyPresetsData[key].stocks);
    triggerSimulationAnimation();
  }

  function triggerSimulationAnimation() {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 700);
  }

  async function joinWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || submitState === "loading") return;
    setSubmitState("loading");
    const { error } = await supabase
      .from("early_access_waitlist")
      .insert({ email: normalizedEmail });
    if (!error) {
      setSubmitState("success");
      setEmail("");
      return;
    }
    if (error.code === "23505") {
      setSubmitState("duplicate");
      return;
    }
    console.error("Early-access waitlist submission failed", error);
    setSubmitState("error");
  }

  function toggleStock(symbol: string) {
    setSelectedStocks((current) => {
      const updated = current.includes(symbol)
        ? current.length > 1
          ? current.filter((stock) => stock !== symbol)
          : current
        : [...current, symbol];
      return updated;
    });
    setStrategyPreset("custom");
    triggerSimulationAnimation();
  }

  return (
    <main className="launch-page">
      <header className="launch-header">
        <a href="#top" className="launch-brand launch-brand-logo-only" aria-label="FinLedgeArena home">
          <img src={typeof primaryLogo === "string" ? primaryLogo : primaryLogo.src} alt="FinLedgeArena" className="launch-mark header-mark-xl" />
        </a>
        <nav aria-label="Main navigation" className="launch-nav">
          <a href="#experience">The experience</a>
          <a href="#learning">Learning path</a>
        </nav>
        <a href="#top" className="launch-nav-cta">
          Get early access <ArrowRight size={15} />
        </a>
      </header>

      <section className="launch-countdown" aria-label="Launch countdown">
        <div className="countdown-copy">
          <span className="countdown-label">
            <Clock3 size={15} /> {countdown.label}
          </span>
          <p>
            {countdown.date ? (
              <>
                Early doors for the first 100 on <strong>30 October</strong>.
                <br className="countdown-break" /> Public launch follows on{" "}
                <strong>10 November 2026</strong>.
              </>
            ) : (
              <>
                The first chapter starts now. <strong>Welcome in.</strong>
              </>
            )}
          </p>
        </div>
        <div className="countdown-units" aria-live="off">
          {[
            [countdown.days, "DAYS"],
            [countdown.hours, "HRS"],
            [countdown.minutes, "MIN"],
            [countdown.seconds, "SEC"],
          ].map(([value, label]) => (
            <div key={label} className="countdown-unit">
              <strong>{String(value).padStart(2, "0")}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <span className="countdown-zone">INDIA STANDARD TIME</span>
      </section>

      <section id="top" className="launch-hero">
        <div className="hero-copy">
          <motion.p
            className="launch-kicker"
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="kicker-dot" /> INDIA’S NEW FINANCIAL LEARNING ARENA
          </motion.p>
          <motion.h1
            initial={reducedMotion ? false : { opacity: 0, y: 18, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.62, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            Learn it.
            <br />
            <em>Test it.</em>
            <br />
            Make it yours.
          </motion.h1>
          <p className="hero-subcopy">
            A fresh way to understand money and markets. Learn the ideas, test your thinking in the
            Arena, then shape a virtual portfolio of your own.
          </p>
          <form className="waitlist-form hero-waitlist-form" onSubmit={joinWaitlist}>
            <label htmlFor="waitlist-email">Get early access updates</label>
            <div className="email-control">
              <input
                id="waitlist-email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (submitState !== "idle" && submitState !== "loading") setSubmitState("idle");
                }}
                placeholder="you@example.com"
                aria-describedby="waitlist-status"
                disabled={submitState === "loading" || submitState === "success"}
              />
              <button
                type="submit"
                disabled={submitState === "loading" || submitState === "success"}
              >
                {submitState === "loading" ? (
                  "Sending…"
                ) : submitState === "success" ? (
                  <>
                    On the list <Check size={16} />
                  </>
                ) : (
                  <>
                    Join the waitlist <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
            <p
              id="waitlist-status"
              className={`waitlist-status status-${submitState}`}
              role="status"
              aria-live="polite"
            >
              {submitState === "success" && <Check size={15} />}
              {statusMessage}
            </p>
          </form>
          <div className="hero-actions">
            <a className="button button-quiet" href="#experience">
              Explore the experience <ChevronDown size={17} />
            </a>
          </div>
          <p className="hero-note">
            <ShieldCheck size={15} /> Built for learning. Practice uses simulated examples.
          </p>
        </div>

        <div
          className="hero-stage"
          aria-label="Illustration of the FinLedgeArena learning experience"
        >
          <div className="stage-sun" />
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="stage-chart" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className="floating-note note-learn">
            <BookOpen size={16} />
            <span>Learn a concept</span>
            <b>01</b>
          </div>
          <div className="floating-note note-arena">
            <Swords size={17} />
            <span>Challenge your thinking</span>
            <b>02</b>
          </div>
          <div className="floating-note note-portfolio">
            <LineChart size={17} />
            <span>Build a basket</span>
            <b>03</b>
          </div>
          <div className="stage-sheet">
            <div className="sheet-top">
              <span>FINLEDGE / FIELD NOTES</span>
              <span>VOL. 01</span>
            </div>
            <div className="sheet-title">
              Your first
              <br />
              market move.
            </div>
            <div className="sheet-graph" aria-hidden="true">
              <svg viewBox="0 0 350 130" preserveAspectRatio="none">
                <path d="M2 110 C36 102, 43 70, 74 85 S123 99, 143 58 S185 76, 207 53 S237 80, 260 34 S301 55, 348 10" />
              </svg>
              <i />
            </div>
            <div className="sheet-foot">
              <span>
                <span className="live-dot" /> YOUR PACE, YOUR PRACTICE
              </span>
              <span>→ SWIPE TO EXPLORE</span>
            </div>
          </div>
          <div className="stage-stamp">
            <span>OPENING</span>
            <b>SOON</b>
            <span>INDIA · IST</span>
          </div>
        </div>
      </section>

      <section className="launch-calendar-section" aria-label="Launch schedule">
        <div className="calendar-kicker-wrap">
          <span className="calendar-kicker">MARK YOUR CALENDAR</span>
        </div>

        <div className="calendar-cards-grid">
          <div className="calendar-card">
            <span className="calendar-badge">PHASE 01</span>
            <strong className="calendar-date">30 OCT</strong>
            <small className="calendar-subtext">FIRST 100 · EARLY ACCESS</small>
          </div>

          <div className="calendar-card">
            <span className="calendar-badge">PHASE 02</span>
            <strong className="calendar-date">10 NOV</strong>
            <small className="calendar-subtext">PUBLIC LAUNCH · 2026</small>
          </div>
        </div>

        <div className="calendar-cta-wrap">
          <form className="waitlist-form calendar-waitlist-form" onSubmit={joinWaitlist}>
            <label htmlFor="calendar-email">Join the list</label>
            <div className="email-control">
              <input
                id="calendar-email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (submitState !== "idle" && submitState !== "loading") setSubmitState("idle");
                }}
                placeholder="you@example.com"
                aria-describedby="calendar-waitlist-status"
                disabled={submitState === "loading" || submitState === "success"}
              />
              <button
                type="submit"
                disabled={submitState === "loading" || submitState === "success"}
              >
                {submitState === "loading" ? (
                  "Sending…"
                ) : submitState === "success" ? (
                  <>
                    On the list <Check size={16} />
                  </>
                ) : (
                  <>
                    Join the list <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
            <p
              id="calendar-waitlist-status"
              className={`waitlist-status status-${submitState}`}
              role="status"
              aria-live="polite"
            >
              {submitState === "success" && <Check size={15} />}
              {statusMessage}
            </p>
          </form>
        </div>
      </section>

      {/* Living Arena Full-Width Cinematic Carousel */}
      <LivingArenaCarousel />

      <section id="experience" className="experience-section cards-stack-section">
        <div className="section-heading">
          <p className="launch-kicker">
            <span className="kicker-dash" /> ONE IDEA. THREE WAYS IN.
          </p>
          <h2>
            Markets feel different
            <br />
            <em>when you get to try.</em>
          </h2>
          <p>
            Scroll to explore each dimension: learn market mechanics from the basics to the why, where, and how with monthly additions, test decisions in daily 2–3 minute scenario arenas, and experiment with strategies on the weekly terminal leaderboard.
          </p>
        </div>

        {/* Pinned block: tabs + cards */}
        <div className="cards-pin-block" ref={sectionRef}>
          {/* Sticky Scroll-Spy Nav */}
          <div className="experience-sticky-nav">
            <div className="experience-tabs" role="tablist" aria-label="FinLedgeArena product preview">
              {[
                { id: "exp-learn", key: "learn" as const, icon: GraduationCap, label: "01 Learn", badge: "The Curve & Monthly Drops" },
                { id: "exp-arena", key: "arena" as const, icon: Swords, label: "02 Arena", badge: "Daily 2-3m Scenarios" },
                { id: "exp-terminal", key: "terminal" as const, icon: TerminalSquare, label: "03 Terminal", badge: "Weekly Strategy Leaderboard" },
              ].map(({ id, key, icon: Icon, label, badge }) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === key}
                  className={activeTab === key ? "experience-tab is-active" : "experience-tab"}
                  onClick={() => jumpToTab(key)}
                >
                  <Icon size={18} />
                  <span className="tab-label-group">
                    <strong>{label}</strong>
                    <small>{badge}</small>
                  </span>
                  {activeTab === key && <span className="tab-pill-indicator" />}
                </button>
              ))}
            </div>
          </div>

        <div className="cards-stack-container">
          {/* CARD 1: LEARN */}
          <article id="exp-learn" className={`stacked-experience-card card-learn ${activeTab === "learn" ? "is-mobile-active" : ""}`}>

            <div className="chapter-badge-bar">
              <span className="preview-chip">
                <BookOpen size={14} /> 01 / THE KNOWLEDGE SPACE
              </span>
              <span className="chapter-indicator-tag">THE LEARNING CURVE · MONTHLY DROPS</span>
            </div>

            <div className="chapter-main-grid learn-grid">
              <div className="chapter-copy">
                <h3>
                  From Basics to the
                  <br />
                  Why, Where & How.
                </h3>
                <p>
                  We don't throw you into confusing jargon. Our learning curve breaks markets into intuitive steps — why companies list, how order books clear, where capital flows in India, and how to evaluate long-term business health.
                </p>

                {/* 4-Stage Learning Curve Interactive Selector */}
                <div className="learning-curve-widget">
                  <div className="curve-header">
                    <span>INTERACTIVE LEARNING CURVE</span>
                    <span className="curve-step-indicator">STAGE 0{learnStage + 1} OF 04</span>
                  </div>
                  <div className="curve-tabs-grid">
                    {[
                      { num: "01", label: "Basics of Markets", sub: "Shares & Exchanges" },
                      { num: "02", label: "The Why", sub: "Price vs Value" },
                      { num: "03", label: "The Where", sub: "Where Money Flows" },
                      { num: "04", label: "The How", sub: "Company Valuation" },
                    ].map((step, idx) => (
                      <button
                        key={step.num}
                        type="button"
                        className={learnStage === idx ? "curve-tab active" : "curve-tab"}
                        onClick={() => setLearnStage(idx)}
                      >
                        <span className="curve-tab-num">{step.num}</span>
                        <div>
                          <strong>{step.label}</strong>
                          <small>{step.sub}</small>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Active Curve Stage Detail */}
                  <div className="curve-stage-detail">
                    {learnStage === 0 && (
                      <div className="curve-detail-content">
                        <h4>Stage 01: Basics of Markets</h4>
                        <p>
                          What is a share? Why do exchanges like NSE & BSE exist? How does an electronic order book match buyers with sellers every second?
                        </p>
                        <div className="concept-callout">
                          <Compass size={16} />
                          <span><strong>Key Metaphor:</strong> The Vegetable Mandi — understanding price discovery when supply meets real-time demand.</span>
                        </div>
                      </div>
                    )}
                    {learnStage === 1 && (
                      <div className="curve-detail-content">
                        <h4>Stage 02: The Why</h4>
                        <p>
                          Why do stock prices move up or down? Unpack quarterly earnings, crowd sentiment, macro liquidity, and separating short-term hype from real business cash flow.
                        </p>
                        <div className="concept-callout">
                          <TrendingUp size={16} />
                          <span><strong>Core Principle:</strong> Price is what you pay; value is what you get. A business is worth its discounted future earnings.</span>
                        </div>
                      </div>
                    )}
                    {learnStage === 2 && (
                      <div className="curve-detail-content">
                        <h4>Stage 03: The Where</h4>
                        <p>
                          Where does capital actually flow in India? Map the primary IPO market, secondary equity trading, mutual funds, debt instruments, and institutional money.
                        </p>
                        <div className="concept-callout">
                          <Layers size={16} />
                          <span><strong>Flow of Money:</strong> How your ₹1,000 monthly SIP travels from fund house to companies building factories.</span>
                        </div>
                      </div>
                    )}
                    {learnStage === 3 && (
                      <div className="curve-detail-content">
                        <h4>Stage 04: The How</h4>
                        <p>
                          How do you read a balance sheet without getting overwhelmed? Learn how to spot high ROCE, sensible debt-to-equity ratios, and durable competitive moats.
                        </p>
                        <div className="concept-callout">
                          <BarChart3 size={16} />
                          <span><strong>The 5-Minute Filter:</strong> 3 essential numbers that tell you if a business creates or destroys value.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Monthly Additions Roadmap */}
                <div className="monthly-drop-card">
                  <div className="monthly-drop-head">
                    <Calendar size={16} />
                    <span>MONTHLY CURRICULUM ADDITIONS</span>
                    <span className="live-pulse-badge">1 NEW MODULE / MONTH</span>
                  </div>
                  <div className="monthly-timeline">
                    <div className="monthly-step current">
                      <span className="month-tag">OCT 2026</span>
                      <div>
                        <strong>Market Foundations & Valuation Multiples</strong>
                        <small>8 core modules live</small>
                      </div>
                      <span className="step-status live">ACTIVE</span>
                    </div>
                    <div className="monthly-step next">
                      <span className="month-tag">NOV 2026</span>
                      <div>
                        <strong>Derivatives, Hedging & Options Demystified</strong>
                        <small>6 modules releasing Nov 1</small>
                      </div>
                      <span className="step-status upcoming">DROPPING SOON</span>
                    </div>
                    <div className="monthly-step upcoming">
                      <span className="month-tag">DEC 2026</span>
                      <div>
                        <strong>Macro Trends, RBI Signals & Bond Markets</strong>
                        <small>5 modules releasing Dec 1</small>
                      </div>
                      <span className="step-status upcoming">UPCOMING</span>
                    </div>
                  </div>
                  <div className="monthly-action">
                    <button
                      type="button"
                      className={notifiedMonthly ? "notify-btn active" : "notify-btn"}
                      onClick={() => setNotifiedMonthly(!notifiedMonthly)}
                    >
                      {notifiedMonthly ? <Check size={14} /> : <Zap size={14} />}
                      {notifiedMonthly ? "Reminders active for monthly drops" : "Notify me on new monthly drops"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Lesson Visual Card */}
              <div className="chapter-visual-pane">
                <div className="lesson-preview-card">
                  <div className="lesson-card-art">
                    <div className="lesson-orbit" />
                    <div className="lesson-coin">₹</div>
                    <span>STAGE 0{learnStage + 1} / {learnStage === 0 ? "FOUNDATIONS" : learnStage === 1 ? "THE WHY" : learnStage === 2 ? "THE WHERE" : "THE HOW"}</span>
                    <BookOpen size={19} />
                  </div>
                  <div className="lesson-card-copy">
                    <span className="lesson-level-badge">{learnStage === 0 ? "3 MIN · BEGINNER" : learnStage === 1 ? "4 MIN · CORE LOGIC" : learnStage === 2 ? "4 MIN · ECOSYSTEM" : "5 MIN · PRACTICAL"}</span>
                    <h4>
                      {learnStage === 0 && "What is a Share?"}
                      {learnStage === 1 && "Why Stock Prices Move"}
                      {learnStage === 2 && "The Indian Money River"}
                      {learnStage === 3 && "How to Read Earnings"}
                    </h4>
                    <p>
                      {learnStage === 0 && "A tiny piece of a much bigger business story."}
                      {learnStage === 1 && "Separating quarterly surprises from long-term intrinsic value."}
                      {learnStage === 2 && "Mapping where institutional and retail capital flows."}
                      {learnStage === 3 && "3 critical numbers to spot sustainable compounders."}
                    </p>
                    <div className="lesson-progress">
                      <i style={{ width: `${(learnStage + 1) * 25}%` }} />
                    </div>
                    <span className="lesson-flow-tag">STORY · MEET · TRY · REFLECT</span>
                  </div>
                </div>
                <div className="preview-side-note">
                  <Sparkles size={18} />
                  <span>Stories turn unfamiliar market concepts into clear, everyday ideas.</span>
                </div>
              </div>
            </div>
          </article>

          {/* CHAPTER 2: ARENA */}
          <article id="exp-arena" className={`stacked-experience-card card-arena ${activeTab === "arena" ? "is-mobile-active" : ""}`}>
            <div className="chapter-badge-bar">
              <span className="preview-chip">
                <Swords size={14} /> 02 / THE ARENA
              </span>
              <span className="chapter-indicator-tag">DAILY 2–3 MIN READS · PERSONAL FINANCE SCENARIOS · LEADERBOARD</span>
            </div>

            <div className="chapter-main-grid arena-grid">
              <div className="chapter-copy">
                <h3>
                  Daily 2–3 Min Reads.
                  <br />
                  Real Decision Scenarios.
                </h3>
                <p>
                  Financial awareness comes from testing judgment, not memorizing formulas. Work through daily real-life personal finance scenarios, weigh trade-offs under uncertainty, and compare your logic with fellow learners on the live leaderboard.
                </p>

                {/* Daily Quest Header */}
                <div className="daily-quest-banner">
                  <div className="quest-pill">
                    <Flame size={15} />
                    <span>DAILY QUEST #42</span>
                  </div>
                  <div className="quest-pill streak">
                    <Zap size={15} />
                    <span>🔥 5-DAY STREAK (+150 XP)</span>
                  </div>
                  <div className="quest-pill time">
                    <Clock3 size={15} />
                    <span>2–3 MIN READ</span>
                  </div>
                </div>

                {/* Scenario Interactive Card */}
                <div className="arena-challenge">
                  <div className="challenge-top">
                    <span>REAL-LIFE DILEMMA / PERSONAL FINANCE</span>
                    <span>DIWALI BONUS SCENARIO</span>
                  </div>
                  <h4>
                    You just received an annual bonus of ₹1,00,000. You owe ₹40,000 on a credit card charging 38% APR, your emergency fund only covers 2 weeks of living expenses, and a friend recommends an IPO tip. What is your move?
                  </h4>
                  <div className="challenge-options">
                    {[
                      {
                        id: "A",
                        text: "Put all ₹1,00,000 into the IPO tip to try to double it before settling debts.",
                        isBest: false,
                        feedback: "High risk! Chasing speculative returns while carrying 38% compounding debt almost always leads to severe wealth destruction.",
                      },
                      {
                        id: "B",
                        text: "Pay off the ₹40k credit card debt (guaranteed 38% risk-free return), put ₹50k in emergency liquid fund, and invest ₹10k in index SIP.",
                        isBest: true,
                        feedback: "Masterclass choice! Eliminating 38% debt guarantees an unbeatable return. Building an emergency cushion stops future high-interest borrowing.",
                      },
                      {
                        id: "C",
                        text: "Spend ₹50k celebrating, keep ₹50k in low-interest checking account.",
                        isBest: false,
                        feedback: "Lifestyle trap! Neglecting high-interest revolving debt while spending cash guarantees finance charges will erase your wealth.",
                      },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={arenaChoice === item.id ? "challenge-choice selected" : "challenge-choice"}
                        onClick={() => setArenaChoice(item.id)}
                        aria-pressed={arenaChoice === item.id}
                      >
                        <span>{item.id}</span>
                        <div className="choice-text-wrap">{item.text}</div>
                        {arenaChoice === item.id && <Check size={16} />}
                      </button>
                    ))}
                  </div>

                  {arenaChoice && (
                    <div className={arenaChoice === "B" ? "arena-feedback-box success" : "arena-feedback-box notice"}>
                      <div className="feedback-head">
                        {arenaChoice === "B" ? <Award size={16} /> : <CircleHelp size={16} />}
                        <strong>{arenaChoice === "B" ? "Sharp Thinking! +100 XP Awarded" : "Learning Insight"}</strong>
                      </div>
                      <p>
                        {arenaChoice === "A" && "Chasing speculative returns while carrying 38% compounding debt almost always destroys wealth. High interest works against you 365 days a year."}
                        {arenaChoice === "B" && "Clearing 38% debt is equivalent to a guaranteed, risk-free 38% post-tax return! Securing 3 months of emergency buffer protects you from dipping back into debt."}
                        {arenaChoice === "C" && "Delaying high-interest debt repayment leads to compound interest compounding against you. Always extinguish debt before upgrading lifestyle."}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Arena Leaderboard */}
              <div className="chapter-visual-pane">
                <div className="leaderboard-card">
                  <div className="leaderboard-header">
                    <div>
                      <span className="leaderboard-kicker">
                        <Trophy size={14} /> LIVE ARENA LEADERBOARD
                      </span>
                      <h4>Today's Scenario Thinkers</h4>
                    </div>
                    <span className="leaderboard-badge">UPDATED MIDNIGHT IST</span>
                  </div>

                  <div className="leaderboard-tabs">
                    <button
                      type="button"
                      className={arenaLeaderboardTab === "today" ? "lb-tab active" : "lb-tab"}
                      onClick={() => setArenaLeaderboardTab("today")}
                    >
                      Today's XP
                    </button>
                    <button
                      type="button"
                      className={arenaLeaderboardTab === "alltime" ? "lb-tab active" : "lb-tab"}
                      onClick={() => setArenaLeaderboardTab("alltime")}
                    >
                      Top Streaks
                    </button>
                  </div>

                  <div className="leaderboard-rows">
                    {[
                      { rank: 1, name: "Aarav Sharma", xp: "1,520 XP", streak: "19 Days", tag: "🥇 #1" },
                      { rank: 2, name: "Priya Menon", xp: "1,390 XP", streak: "15 Days", tag: "🥈 #2" },
                      { rank: 3, name: "Rohan Kapoor", xp: "1,310 XP", streak: "12 Days", tag: "🥉 #3" },
                      { rank: 4, name: "You (Learner)", xp: arenaChoice === "B" ? "950 XP" : "850 XP", streak: "5 Days", tag: "⚡ You", isYou: true },
                      { rank: 5, name: "Devansh Verma", xp: "820 XP", streak: "5 Days", tag: "⭐ #5" },
                    ].map((user) => (
                      <div key={user.name} className={user.isYou ? "leaderboard-row is-user" : "leaderboard-row"}>
                        <span className="user-rank">{user.tag}</span>
                        <div className="user-info">
                          <strong>{user.name}</strong>
                          <small>🔥 {user.streak} streak</small>
                        </div>
                        <span className="user-score">{user.xp}</span>
                      </div>
                    ))}
                  </div>

                  <div className="leaderboard-footer">
                    <div className="level-bar-label">
                      <span>Level 4 Analytical Thinker</span>
                      <span>850 / 1000 XP</span>
                    </div>
                    <div className="level-bar-track">
                      <div className="level-bar-fill" style={{ width: arenaChoice === "B" ? "95%" : "85%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* CHAPTER 3: TERMINAL */}
          <article id="exp-terminal" className={`stacked-experience-card card-terminal ${activeTab === "terminal" ? "is-mobile-active" : ""}`}>
            <div className="chapter-badge-bar">
              <span className="preview-chip">
                <TerminalSquare size={14} /> 03 / THE TERMINAL
              </span>
              <span className="chapter-indicator-tag">STRATEGY LAB · EXPERIMENTATION · WEEKLY LEADERBOARD</span>
            </div>

            <div className="chapter-main-grid terminal-grid">
              <div className="chapter-copy">
                <h3>
                  Build Your Own Strategies.
                  <br />
                  Weekly Leaderboard.
                </h3>
                <p>
                  Put ideas to the test with zero financial risk. Formulate investment rules, select Indian benchmark companies, simulate performance against historical data, and compete on the weekly strategy leaderboard to see whose rules perform best.
                </p>

                {/* Strategy Presets */}
                <div className="strategy-presets-bar">
                  <span className="presets-label">TEST STRATEGY PRESETS:</span>
                  <div className="preset-buttons">
                    <button
                      type="button"
                      className={strategyPreset === "momentum" ? "preset-btn active" : "preset-btn"}
                      onClick={() => handleSelectPreset("momentum")}
                    >
                      <TrendingUp size={13} /> Momentum Leaders
                    </button>
                    <button
                      type="button"
                      className={strategyPreset === "quality" ? "preset-btn active" : "preset-btn"}
                      onClick={() => handleSelectPreset("quality")}
                    >
                      <Award size={13} /> All-Weather Quality
                    </button>
                    <button
                      type="button"
                      className={strategyPreset === "dividend" ? "preset-btn active" : "preset-btn"}
                      onClick={() => handleSelectPreset("dividend")}
                    >
                      <BarChart3 size={13} /> High Dividend
                    </button>
                  </div>
                </div>

                {/* Strategy Terminal Window */}
                <div className="terminal-window">
                  <div className="terminal-bar">
                    <div>
                      <i />
                      <i />
                      <i />
                    </div>
                    <span>FINLEDGE TERMINAL / {currentStrategy.name.toUpperCase()}</span>
                    <span>SIMULATED ENVIRONMENT</span>
                  </div>

                  <div className="terminal-inner">
                    <div className="terminal-caption">
                      <span>HOLDINGS IN BASKET ({selectedStocks.length} EQUAL WEIGHT)</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStocks(["RELIANCE", "TCS", "INFY"]);
                          setStrategyPreset("momentum");
                          triggerSimulationAnimation();
                        }}
                        aria-label="Reset basket"
                      >
                        <RotateCcw size={12} /> RESET BASKET
                      </button>
                    </div>

                    <div className="stock-list">
                      {allStockOptions.map((stock) => {
                        const active = selectedStocks.includes(stock);
                        return (
                          <button
                            type="button"
                            key={stock}
                            className={active ? "stock-row selected" : "stock-row"}
                            aria-pressed={active}
                            onClick={() => toggleStock(stock)}
                          >
                            <span className="stock-check">
                              {active ? <Check size={13} /> : <Plus size={13} />}
                            </span>
                            <span className="stock-symbol">{stock}</span>
                            <span className="stock-allocation">
                              {active ? `${allocation}%` : "ADD"}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Simulation Metrics Grid */}
                    <div className="terminal-metrics-grid">
                      <div className="metric-box">
                        <small>SIMULATED CAGR</small>
                        <strong className={isSimulating ? "pulse-text" : "green-text"}>
                          {isSimulating ? "Calculating…" : currentStrategy.cagr}
                        </strong>
                      </div>
                      <div className="metric-box">
                        <small>MAX DRAWDOWN</small>
                        <strong>{isSimulating ? "…" : currentStrategy.drawdown}</strong>
                      </div>
                      <div className="metric-box">
                        <small>SHARPE RATIO</small>
                        <strong>{isSimulating ? "…" : currentStrategy.sharpe}</strong>
                      </div>
                      <div className="metric-box">
                        <small>WIN RATE</small>
                        <strong>{isSimulating ? "…" : currentStrategy.winRate}</strong>
                      </div>
                    </div>

                    <div className="terminal-actions-bar">
                      <button
                        type="button"
                        className="simulate-run-btn"
                        onClick={triggerSimulationAnimation}
                        disabled={isSimulating}
                      >
                        <Play size={13} /> {isSimulating ? "Running Backtest Simulation…" : "Run Strategy Simulation"}
                      </button>
                      <span className="terminal-thesis-note">
                        <CircleHelp size={12} /> {currentStrategy.thesis}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Strategy Leaderboard */}
              <div className="chapter-visual-pane">
                <div className="leaderboard-card strategy-leaderboard">
                  <div className="leaderboard-header">
                    <div>
                      <span className="leaderboard-kicker">
                        <Trophy size={14} /> WEEKLY STRATEGY LEADERBOARD
                      </span>
                      <h4>Best Performing Strategies</h4>
                    </div>
                    <span className="leaderboard-badge">RANKED WEEKLY</span>
                  </div>

                  <div className="leaderboard-tabs">
                    <button
                      type="button"
                      className={terminalLeaderboardTab === "current" ? "lb-tab active" : "lb-tab"}
                      onClick={() => setTerminalLeaderboardTab("current")}
                    >
                      This Week's Standings
                    </button>
                    <button
                      type="button"
                      className={terminalLeaderboardTab === "past" ? "lb-tab active" : "lb-tab"}
                      onClick={() => setTerminalLeaderboardTab("past")}
                    >
                      Past Week's Performance
                    </button>
                  </div>

                  <div className="leaderboard-rows">
                    {(terminalLeaderboardTab === "current"
                      ? [
                          { rank: 1, name: "Nifty Trend Momentum 50", creator: "@quant_dev", ret: "+5.4%", sharpe: "1.88", tag: "🥇 #1" },
                          { rank: 2, name: "Quality Compounders Core", creator: "@mira_fin", ret: "+3.9%", sharpe: "1.65", tag: "🥈 #2" },
                          { rank: 3, name: "Low-Volatility Defensive", creator: "@kavya_invest", ret: "+2.3%", sharpe: "1.42", tag: "🥉 #3" },
                          { rank: 4, name: "Dividend Cashflow Basket", creator: "@arjun_b", ret: "+1.9%", sharpe: "1.35", tag: "⭐ #4" },
                        ]
                      : [
                          { rank: 1, name: "High-ROCE Smallcap Filter", creator: "@rohan_trader", ret: "+6.8%", sharpe: "2.05", tag: "🏆 Winner" },
                          { rank: 2, name: "Nifty Trend Momentum 50", creator: "@quant_dev", ret: "+4.9%", sharpe: "1.79", tag: "🥈 #2" },
                          { rank: 3, name: "All-Weather 60/40 Equity-Debt", creator: "@safe_harbor", ret: "+2.7%", sharpe: "1.92", tag: "🥉 #3" },
                          { rank: 4, name: "Value Contrarian Basket", creator: "@deep_value", ret: "+2.1%", sharpe: "1.28", tag: "⭐ #4" },
                        ]
                    ).map((strat) => (
                      <div key={strat.name} className="strategy-rank-row">
                        <span className="strategy-rank-badge">{strat.tag}</span>
                        <div className="strategy-meta">
                          <strong>{strat.name}</strong>
                          <small>Created by {strat.creator} · Sharpe {strat.sharpe}</small>
                        </div>
                        <span className="strategy-return-pill">{strat.ret}</span>
                      </div>
                    ))}
                  </div>

                  <div className="strategy-leaderboard-foot">
                    <p>
                      <Clock3 size={13} /> Leaderboard locks every Friday 3:30 PM IST. Top strategy featured in the Sunday Community Digest.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div> {/* end cards-stack-container */}
        </div> {/* end cards-pin-block */}
      </section>

      <section id="learning" className="learning-section">
        <div className="learning-heading">
          <div>
            <p className="launch-kicker">
              <span className="kicker-dash" /> A CLEARER WAY THROUGH
            </p>
            <h2>
              From first question
              <br />
              to <em>confident practice.</em>
            </h2>
          </div>
          <p>
            Build your market vocabulary one useful idea at a time. Each lesson opens a door to the
            next.
          </p>
        </div>
        <div className="learning-route">
          <article className="route-stop route-start">
            <span className="route-icon">
              <Compass size={21} />
            </span>
            <span className="route-label">START HERE</span>
            <h3>Get your bearings</h3>
            <p>Money, saving, risk, and the language of investing.</p>
            <span className="route-number">01</span>
          </article>
          <div className="route-connector">
            <span />
          </div>
          <article className="route-stop">
            <span className="route-icon">
              <BookOpen size={21} />
            </span>
            <span className="route-label">BUILD KNOWLEDGE</span>
            <h3>Explore the lessons</h3>
            <p>Stories about businesses, markets, and decisions.</p>
            <span className="route-number">02</span>
          </article>
          <div className="route-connector">
            <span />
          </div>
          <article className="route-stop">
            <span className="route-icon">
              <Swords size={21} />
            </span>
            <span className="route-label">PUT IT TO WORK</span>
            <h3>Try the Arena</h3>
            <p>Practice weighing a choice and explaining why.</p>
            <span className="route-number">03</span>
          </article>
          <div className="route-connector">
            <span />
          </div>
          <article className="route-stop route-finish">
            <span className="route-icon">
              <LineChart size={21} />
            </span>
            <span className="route-label">MAKE IT YOURS</span>
            <h3>Shape a basket</h3>
            <p>Test ideas in a virtual portfolio, at your own pace.</p>
            <span className="route-number">04</span>
          </article>
        </div>
        <div className="learning-foot">
          <span>
            <LockKeyhole size={14} /> PRACTICE IS SIMULATED
          </span>
          <span>Start anywhere. Keep what you learn.</span>
        </div>
      </section>

      <section id="waitlist" className="waitlist-section">
        <div className="waitlist-art" aria-hidden="true">
          <div className="waitlist-coin coin-a">₹</div>
          <div className="waitlist-coin coin-b">
            <LineChart size={23} />
          </div>
          <div className="waitlist-curve" />
          <div className="waitlist-ticket">
            <span>FINLEDGEARENA</span>
            <b>
              YOUR
              <br />
              NEXT
              <br />
              MOVE
            </b>
            <i>ADMIT ONE / EARLY ACCESS</i>
          </div>
        </div>
        <div className="waitlist-copy">
          <p className="launch-kicker">
            <span className="kicker-dash" /> YOUR PLACE STARTS WITH A NOTE
          </p>
          <h2>
            The next market
            <br />
            <em>story starts here.</em>
          </h2>
          <p>
            Leave your email for early-access updates. We’re opening to the first 100 on October 20,
            then launching publicly on October 23.
          </p>
          <p className="waitlist-fineprint">
            <ShieldCheck size={15} /> This is a waitlist request, not a guaranteed seat. We’ll only
            email about FinLedgeArena. Add your email in the form above to join.
          </p>
        </div>
      </section>

      <footer className="launch-footer">
        <a href="#top" className="launch-brand launch-brand-logo-only" aria-label="FinLedgeArena home">
          <img src={typeof primaryLogo === "string" ? primaryLogo : primaryLogo.src} alt="FinLedgeArena" className="launch-mark footer-mark-xl" />
        </a>
        <p>
          <ShieldCheck size={15} /> FinLedgeArena is an educational platform. Scenarios and
          portfolio tools are simulated for learning and do not provide investment advice or execute
          trades.
        </p>
        <span className="footer-location">MADE FOR LEARNING IN INDIA · IST</span>
      </footer>
    </main>
  );
}
