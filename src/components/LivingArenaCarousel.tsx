"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  Subtitles,
  ChevronLeft,
  ChevronRight,
  Film,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import primaryLogo from "@/assets/logo.png";

interface Cue {
  start: number;
  end: number;
  name: string;
  role: string;
  text: string;
}

const DIALOGUE_CUES: Cue[] = [
  { start: 0.12, end: 2.4, name: "Ned", role: "Momentum Trader", text: "Guys! Got a hot stock tip!" },
  { start: 2.62, end: 4.86, name: "Shouri K", role: "Disciplined Analyst", text: "Hot isn’t a valuation." },
  { start: 5.1, end: 6.92, name: "Wick", role: "Risk Taker", text: "Trust me. I know heat!" },
  { start: 7.18, end: 9.38, name: "Mira", role: "Evidence Hunter", text: "But where’s the evidence?" },
  { start: 9.65, end: 12.0, name: "Tick", role: "Market Strategist", text: "Learn the why, not just the buy!" },
];

const CHARACTER_SLIDES = [
  {
    id: "video",
    tabLabel: "Living Arena Film",
    isVideo: true,
  },
  {
    id: "ned",
    tabLabel: "Ned",
    tag: "MOMENTUM & RISK",
    name: "Ned",
    role: "The Momentum Hunter",
    quote: "“Guys! Got a hot stock tip!”",
    description:
      "Chasing social buzz without valuation fundamentals leads straight into market traps. In the Arena, test when momentum is authentic and when it's just exit liquidity.",
    badge: "Scenario Arena 01 · Spotting the Hype",
    image: "/characters/ned.png",
    accent: "#E74C3C",
  },
  {
    id: "shouri",
    tabLabel: "Shouri K",
    tag: "VALUATION DISCIPLINE",
    name: "Shouri K",
    role: "The Fundamental Analyst",
    quote: "“Hot isn’t a valuation.”",
    description:
      "Every company has an intrinsic value. Learn to read cash flows, operating leverage, and margin of safety so hype never misleads your strategy.",
    badge: "Terminal Lab · DCF & Comparative Multiples",
    image: "/characters/shouri.png",
    accent: "#127A55",
  },
  {
    id: "mira",
    tabLabel: "Mira",
    tag: "EVIDENCE & DEPTH",
    name: "Mira",
    role: "The Evidence Auditor",
    quote: "“Where’s the evidence?”",
    description:
      "Price movements demand hard proof. Cross-examine volume anomalies, order books, and institutional footprints before allocating virtual capital.",
    badge: "The Curve · Data Verification Frameworks",
    image: "/characters/mira.png",
    accent: "#2E86C1",
  },
  {
    id: "tick",
    tabLabel: "Tick & The Cast",
    tag: "THE LIVING ARENA",
    name: "Tick & The Studio Cast",
    role: "The 7-Character Ensemble",
    quote: "“Learn the why, not just the buy!”",
    description:
      "Meet Shouri K, Ned, Mira, Tick, Wick, Nock, and Deuce inside the Warm Exchange Studio. Simulated decision challenges with real market mechanics and zero financial risk.",
    badge: "Daily 2–3 Minute Arenas · Simulated Play",
    image: "/characters/tick.png",
    accent: "#D4AC0D",
  },
];

export function LivingArenaCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active dialogue cue for video subtitle
  const activeCue = DIALOGUE_CUES.find(
    (c) => currentTime >= c.start && currentTime < c.end
  );

  // Auto pause/resume when entering/leaving viewport
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let inView = true;
    const handleVisibility = () => {
      if (document.hidden || !inView || activeSlide !== 0 || paused) {
        video.pause();
      } else {
        video.play().catch(() => setPaused(true));
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        handleVisibility();
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [activeSlide, paused]);

  // Pause video if user navigates to a character slide; resume if returning to video
  const goToSlide = (idx: number) => {
    setActiveSlide(idx);
    if (idx !== 0 && videoRef.current) {
      videoRef.current.pause();
    } else if (idx === 0 && videoRef.current && !paused) {
      videoRef.current.play().catch(() => setPaused(true));
    }
  };

  const nextSlide = () => {
    goToSlide((activeSlide + 1) % CHARACTER_SLIDES.length);
  };

  const prevSlide = () => {
    goToSlide((activeSlide - 1 + CHARACTER_SLIDES.length) % CHARACTER_SLIDES.length);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (paused) {
      videoRef.current.play().catch(() => setPaused(true));
      setPaused(false);
    } else {
      videoRef.current.pause();
      setPaused(true);
    }
  };

  const currentData = CHARACTER_SLIDES[activeSlide];

  return (
    <section
      ref={containerRef}
      className="living-arena-showcase"
      aria-label="FinLedge Living Arena Cinema and Character Roster"
    >
      {/* Top Banner Navigation & Status Header */}
      <div className="arena-banner-header">

        {/* Slide Navigation Tabs */}
        <div className="arena-slide-tabs" role="tablist">
          {CHARACTER_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              role="tab"
              aria-selected={activeSlide === idx}
              className={`arena-tab-btn ${activeSlide === idx ? "is-active" : ""}`}
              onClick={() => goToSlide(idx)}
            >
              {slide.isVideo ? (
                <>
                  <Film size={12} />
                  <span>Film</span>
                </>
              ) : (
                <span>{slide.tabLabel}</span>
              )}
            </button>
          ))}
        </div>

        <div className="arena-header-right">
          <button
            type="button"
            className="arena-arrow-nav"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="arena-counter">
            0{activeSlide + 1} / 0{CHARACTER_SLIDES.length}
          </span>
          <button
            type="button"
            className="arena-arrow-nav"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Main End-to-End Viewport (Short Cinematic Height) */}
      <div className="arena-viewport">
        {/* Slide 0: The Clean Video Player (Always mounted in DOM to prevent reload/flicker) */}
        <div
          className={`arena-video-stage ${activeSlide === 0 ? "is-visible" : "is-hidden"}`}
          aria-hidden={activeSlide !== 0}
        >
          <video
            ref={videoRef}
            className="arena-video-element"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/videos/living-arena/finledge-living-arena-poster.webp"
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          >
            <source
              src="/videos/living-arena/finledge-living-arena-clean.webm"
              type="video/webm"
            />
            <source
              src="/videos/living-arena/finledge-living-arena-clean.mp4"
              type="video/mp4"
            />
            <track
              kind="captions"
              src="/videos/living-arena/dialogue.vtt"
              srcLang="en"
              label="English"
            />
          </video>

          {/* Ambient Corner Branding Logo */}
          <div className="arena-stage-brand">
            <img src={typeof primaryLogo === "string" ? primaryLogo : primaryLogo.src} alt="FinLedgeArena" className="arena-stage-logo" />
          </div>

          {/* Dynamic Live Styled Dialogue Caption */}
          {captionsEnabled && activeCue && (
            <motion.div
              key={activeCue.name + activeCue.start}
              className="arena-speech-caption"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <div className="caption-actor-chip">
                <span className="actor-name">{activeCue.name}</span>
                <span className="actor-role">{activeCue.role}</span>
              </div>
              <p className="caption-text">{activeCue.text}</p>
            </motion.div>
          )}

          {/* Video Controls Bar */}
          <div className="arena-video-controls">
            <button
              type="button"
              className="arena-control-btn"
              onClick={togglePlay}
              aria-label={paused ? "Play animation" : "Pause animation"}
            >
              {paused ? <Play size={13} /> : <Pause size={13} />}
              <span>{paused ? "Play" : "Pause"}</span>
            </button>

            <button
              type="button"
              className={`arena-control-btn ${captionsEnabled ? "is-active-control" : ""}`}
              onClick={() => setCaptionsEnabled(!captionsEnabled)}
              aria-label="Toggle subtitles"
            >
              <Subtitles size={13} />
              <span>CC</span>
            </button>
          </div>
        </div>

        {/* Character Detail Slides (Slides 1-4) */}
        {activeSlide > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentData.id}
              className="arena-character-slide"
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="character-slide-grid">
                {/* Character Portrait */}
                <div className="character-visual-col">
                  <div className="character-portrait-box">
                    <img
                      src={currentData.image}
                      alt={currentData.name}
                      className="character-portrait-img"
                    />
                    <div
                      className="character-glow-halo"
                      style={{
                        background: `radial-gradient(circle, ${currentData.accent}33 0%, transparent 70%)`,
                      }}
                    />
                  </div>
                </div>

                {/* Character Content & Wisdom */}
                <div className="character-info-col">
                  <div className="character-top-bar">
                    <span
                      className="character-tag-badge"
                      style={{
                        color: currentData.accent,
                        backgroundColor: `${currentData.accent}14`,
                        borderColor: `${currentData.accent}33`,
                      }}
                    >
                      {currentData.tag}
                    </span>
                    <span className="character-role-title">{currentData.role}</span>
                  </div>

                  <h3 className="character-quote-heading">{currentData.quote}</h3>

                  <p className="character-desc-text">{currentData.description}</p>

                  <div className="character-footer-action">
                    <span className="character-badge-pill">
                      <Sparkles size={13} /> {currentData.badge}
                    </span>
                    <button
                      type="button"
                      className="character-back-to-video"
                      onClick={() => goToSlide(0)}
                    >
                      Watch in Film <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Bottom Progress Indicator Bar */}
      <div className="arena-bottom-bar">
        <div className="arena-progress-dots">
          {CHARACTER_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`arena-dot-indicator ${activeSlide === idx ? "is-active-dot" : ""}`}
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        <p className="arena-footer-hint">
          {activeSlide === 0
            ? "15-Second Continuous Scene · Click characters above to explore their philosophy"
            : `Exploring ${currentData.name} · Click "Film" to resume full Living Arena`}
        </p>
      </div>
    </section>
  );
}
