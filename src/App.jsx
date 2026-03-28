import { useState, useEffect, useCallback } from "react";
import data from "../public/data/slides.json";
// Flatten slides with section metadata
const allSlides = [];
data.sections.forEach((section) => {
  section.slides.forEach((slide) => {
    allSlides.push({ ...slide, section_name: section.section_name, section_icon: section.section_icon, section_color: section.section_color });
  });
});

// Build the ordered reveal steps for a slide
// stat → points (one by one) → callout → linkedinUrl
function getRevealSteps(slide) {
  const steps = [];
  if (slide.stat) steps.push({ type: "stat" });
  (slide.points || []).forEach((_, i) => steps.push({ type: "point", index: i }));
  if (slide.callout) steps.push({ type: "callout" });
  if (slide.linkedinUrl) steps.push({ type: "linkedin" });
  return steps;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function GlassOrb({ x, y, size, color, opacity = 0.15, blur = 80 }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: size, height: size,
      borderRadius: "50%", background: color, opacity,
      filter: `blur(${blur}px)`, pointerEvents: "none", transition: "all 1.5s ease"
    }} />
  );
}

function ProgressBar({ current, total, color }) {
  return (
    <div style={{ height: "3px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
      <div style={{
        height: "100%", width: `${((current + 1) / total) * 100}%`,
        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
        borderRadius: "2px", transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: `0 0 8px ${color}80`
      }} />
    </div>
  );
}

function SectionNav({ sections, currentSection, onSelect }) {
  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
      {sections.map((sec, i) => (
        <button key={i} onClick={(e) => { e.stopPropagation(); onSelect(i); }} style={{
          padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
          border: `1px solid ${currentSection === i ? sec.section_color : "rgba(255,255,255,0.15)"}`,
          background: currentSection === i ? `${sec.section_color}25` : "rgba(255,255,255,0.05)",
          color: currentSection === i ? sec.section_color : "rgba(255,255,255,0.5)",
          cursor: "pointer", transition: "all 0.3s ease", letterSpacing: "0.03em", backdropFilter: "blur(10px)"
        }}>
          {sec.section_icon} {sec.section_name}
        </button>
      ))}
    </div>
  );
}

// ─── Title Slide ──────────────────────────────────────────────────────────────

function TitleSlide({ data, onStart }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      height: "100%", textAlign: "center", padding: "60px 40px", gap: "28px"
    }}>
      <div style={{
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "8px"
      }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "8px" }}>
          {data.version}
        </div>
        <h1 style={{
          fontSize: "clamp(42px, 7vw, 80px)", fontWeight: 800, margin: 0,
          background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          lineHeight: 1.05, letterSpacing: "-0.03em"
        }}>{data.presentation_title}</h1>
        <div style={{ fontSize: "clamp(20px, 3.5vw, 36px)", fontWeight: 300, color: "rgba(255,255,255,0.6)", letterSpacing: "0.01em" }}>
          {data.presentation_subtitle}
        </div>
      </div>

      <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s cubic-bezier(0.4,0,0.2,1) 0.3s" }}>
        <div style={{
          padding: "12px 28px", borderRadius: "100px",
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(20px)", fontSize: "14px", color: "rgba(255,255,255,0.7)", fontStyle: "italic", letterSpacing: "0.02em"
        }}>"{data.tagline}"</div>
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", opacity: visible ? 1 : 0, transition: "all 0.8s ease 0.5s" }}>
        {data.sections.map((s, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px",
            borderRadius: "20px", background: `${s.section_color}20`, border: `1px solid ${s.section_color}40`,
            fontSize: "12px", color: s.section_color, fontWeight: 600
          }}>
            {s.section_icon} {s.section_name}
            <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>{s.slides.length}</span>
          </div>
        ))}
      </div>

      <button onClick={onStart} style={{
        marginTop: "16px", padding: "16px 48px", borderRadius: "100px",
        background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
        border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: "16px", fontWeight: 600,
        cursor: "pointer", backdropFilter: "blur(20px)", letterSpacing: "0.05em",
        transition: "all 0.3s ease", opacity: visible ? 1 : 0,
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)", textTransform: "uppercase"
      }}
        onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.2)"; e.target.style.transform = "scale(1.03)"; }}
        onMouseLeave={e => { e.target.style.background = "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))"; e.target.style.transform = "scale(1)"; }}
      >Begin →</button>
    </div>
  );
}

// ─── Slide Content ────────────────────────────────────────────────────────────
// revealIndex: -1 = only heading + subheading shown
// 0, 1, 2...  = reveal steps shown up to and including that index
function SlideContent({ slide, revealIndex }) {
  const color = slide.section_color;
  const steps = getRevealSteps(slide);

  // Is step with given type (and optional point index) visible yet?
  const shown = (type, idx) => {
    const si = steps.findIndex(s => s.type === type && (idx === undefined || s.index === idx));
    return si !== -1 && revealIndex >= si;
  };

  const fadeUp = (visible) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(14px)",
    transition: "opacity 0.4s ease, transform 0.42s cubic-bezier(0.4,0,0.2,1)",
    pointerEvents: visible ? "auto" : "none"
  });

  const slideRight = (visible) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateX(0)" : "translateX(-20px)",
    transition: "opacity 0.38s ease, transform 0.38s cubic-bezier(0.4,0,0.2,1)",
    pointerEvents: visible ? "auto" : "none"
  });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "32px 52px 28px", gap: "18px", overflowY: "auto" }}>

      {/* Section badge — always visible */}
      {/* <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{
          padding: "4px 14px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
          background: `${color}20`, border: `1px solid ${color}40`, color,
          letterSpacing: "0.1em", textTransform: "uppercase"
        }}>
          {slide.section_icon} {slide.section_name}
        </div>
        <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>
          Slide {slide.slide_number}
        </div>
      </div> */}

      {/* Heading + subheading — ALWAYS visible (initial state) */}
      <div>
        <h2 style={{
          margin: 0, fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 800,
          background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.75) 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          lineHeight: 1.1, letterSpacing: "-0.02em"
        }}>{slide.heading}</h2>
        {slide.subheading && (
          <p style={{
            margin: "8px 0 0", fontSize: "clamp(13px, 1.8vw, 17px)",
            color: "rgba(255,255,255,0.45)", fontWeight: 400, fontStyle: "italic", lineHeight: 1.4
          }}>{slide.subheading}</p>
        )}
      </div>

      {/* Stat card — appears on its reveal step */}
      {slide.stat && (
        <div style={{
          display: "flex", alignItems: "center", gap: "20px",
          padding: "16px 24px", borderRadius: "16px",
          background: `linear-gradient(135deg, ${color}20, ${color}08)`,
          border: `1px solid ${color}35`, backdropFilter: "blur(20px)",
          ...fadeUp(shown("stat"))
        }}>
          <div style={{ fontSize: "clamp(36px, 5vw, 52px)", fontWeight: 900, color, lineHeight: 1, flexShrink: 0 }}>
            {slide.stat.value}
          </div>
          <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: 1.4 }}>
            {slide.stat.label}
          </div>
        </div>
      )}

      {/* Points — each revealed one by one */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
        {(slide.points || []).map((point, i) => (
          <div key={i} style={{
            display: "flex", gap: "12px", alignItems: "flex-start",
            ...slideRight(shown("point", i))
          }}>
            <div style={{
              width: "6px", height: "6px", borderRadius: "50%", background: color,
              flexShrink: 0, marginTop: "8px", boxShadow: `0 0 8px ${color}60`
            }} />
            <p style={{
              margin: 0, fontSize: "clamp(13px, 1.6vw, 15px)",
              color: "rgba(255,255,255,0.78)", lineHeight: 1.65, fontWeight: 400
            }}>{point}</p>
          </div>
        ))}
      </div>

      {/* Callout — appears on its reveal step */}
      {slide.callout && (
        <div style={{
          padding: "15px 20px", borderRadius: "12px",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
          borderLeft: `3px solid ${color}`, backdropFilter: "blur(20px)",
          ...fadeUp(shown("callout"))
        }}>
          <p style={{ margin: 0, fontSize: "clamp(12px, 1.5vw, 14px)", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, fontStyle: "italic" }}>
            <span style={{ color, fontWeight: 700, fontStyle: "normal" }}>→ </span>
            {slide.callout}
          </p>
        </div>
      )}

      {/* LinkedIn card — appears on its reveal step */}
      {slide.linkedinUrl && (
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "12px 20px", borderRadius: "12px",
          background: "rgba(10,102,194,0.15)", border: "1px solid rgba(10,102,194,0.3)",
          ...fadeUp(shown("linkedin"))
        }}>
          <span style={{ fontSize: "18px" }}>💼</span>
          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>Connect on LinkedIn</span>
          <span style={{ fontSize: "12px", color: "#5AA7D4", marginLeft: "auto" }}>{slide.linkedinUrl}</span>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [showTitle, setShowTitle] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [revealIndex, setRevealIndex] = useState(-1);
  const [direction, setDirection] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentSlideData = allSlides[currentSlide];
  const activeColor = currentSlideData?.section_color || "#6C63FF";
  const steps = currentSlideData ? getRevealSteps(currentSlideData) : [];
  const totalSteps = steps.length;
  const fullyRevealed = revealIndex >= totalSteps - 1;

  const currentSectionIdx = data.sections.findIndex(s =>
    s.slides.some(sl => sl.slide_number === currentSlideData?.slide_number)
  );

  // Hard jump to a specific slide index (resets reveal to -1)
  const goTo = useCallback((idx) => {
    if (isTransitioning || idx < 0 || idx >= allSlides.length) return;
    setDirection(idx > currentSlide ? 1 : -1);
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(idx);
      setRevealIndex(-1);
      setIsTransitioning(false);
    }, 280);
  }, [currentSlide, isTransitioning]);

  // ADVANCE: reveal next element → when done, advance to next slide
  const advance = useCallback(() => {
    if (isTransitioning) return;
    if (revealIndex < totalSteps - 1) {
      setRevealIndex(r => r + 1);
    } else if (currentSlide < allSlides.length - 1) {
      goTo(currentSlide + 1);
    }
  }, [isTransitioning, revealIndex, totalSteps, currentSlide, goTo]);

  // STEP BACK: un-reveal last element → when at -1, go to previous slide (fully revealed)
  const stepBack = useCallback(() => {
    if (isTransitioning) return;
    if (revealIndex > -1) {
      setRevealIndex(r => r - 1);
    } else if (currentSlide > 0) {
      setDirection(-1);
      setIsTransitioning(true);
      setTimeout(() => {
        const prevIdx = currentSlide - 1;
        const prevSteps = getRevealSteps(allSlides[prevIdx]);
        setCurrentSlide(prevIdx);
        setRevealIndex(prevSteps.length - 1); // land fully revealed
        setIsTransitioning(false);
      }, 280);
    }
  }, [isTransitioning, revealIndex, currentSlide]);

  // Keyboard / clicker support
  useEffect(() => {
    const handler = (e) => {
      if (showTitle) {
        if (["Enter", " ", "ArrowRight", "PageDown"].includes(e.key)) { e.preventDefault(); setShowTitle(false); }
        return;
      }
      if (["ArrowRight", "ArrowDown", " ", "PageDown"].includes(e.key)) { e.preventDefault(); advance(); }
      if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); stepBack(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showTitle, advance, stepBack]);

  const jumpToSection = (sectionIdx) => {
    const section = data.sections[sectionIdx];
    const firstIdx = allSlides.findIndex(s => s.section_name === section.section_name);
    if (firstIdx >= 0) { setShowTitle(false); goTo(firstIdx); }
  };

  const isAtStart = currentSlide === 0 && revealIndex === -1;
  const isAtEnd = currentSlide === allSlides.length - 1 && fullyRevealed;

  return (
    <div style={{
      width: "100vw", height: "100vh", background: "#080B14",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflow: "hidden", position: "relative"
    }}>
      {/* Background glow orbs */}
      <GlassOrb x="-10%" y="-15%" size="50vw" color={activeColor} opacity={0.12} blur={120} />
      <GlassOrb x="60%" y="50%" size="40vw" color={showTitle ? "#A78BFA" : activeColor} opacity={0.08} blur={100} />
      <GlassOrb x="20%" y="70%" size="30vw" color="#00D4AA" opacity={0.06} blur={80} />

      {/* Subtle grid */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.025,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "60px 60px", pointerEvents: "none"
      }} />

      {/* Main glass card */}
      <div style={{
        width: "min(96vw, 1100px)", height: "min(92vh, 700px)",
        borderRadius: "28px", position: "relative", overflow: "hidden",
        background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
        border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(40px) saturate(180%)",
        boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 80px ${activeColor}15`,
        transition: "box-shadow 1s ease", display: "flex", flexDirection: "column"
      }}>
        {/* Glass shine */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "50%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)",
          borderRadius: "28px 28px 0 0", pointerEvents: "none"
        }} />

        {showTitle ? (
          <TitleSlide data={data} onStart={() => setShowTitle(false)} />
        ) : (
          <>
            {/* ── Top bar ── */}
            <div style={{
              padding: "14px 24px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)",
              display: "flex", flexDirection: "column", gap: "10px", flexShrink: 0
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <button onClick={(e) => { e.stopPropagation(); setShowTitle(true); }} style={{
                  background: "none", border: "none", color: "rgba(255,255,255,0.3)",
                  fontSize: "12px", cursor: "pointer", padding: 0, letterSpacing: "0.05em", transition: "color 0.2s"
                }}
                  onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.7)"}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.3)"}
                >← HOME</button>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {/* Per-slide step indicator dots */}
                  <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                    {steps.map((_, i) => (
                      <div key={i} style={{
                        width: i <= revealIndex ? "14px" : "5px", height: "5px",
                        borderRadius: "3px", transition: "all 0.3s ease",
                        background: i <= revealIndex ? activeColor : "rgba(255,255,255,0.15)",
                        boxShadow: i <= revealIndex ? `0 0 5px ${activeColor}60` : "none"
                      }} />
                    ))}
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", fontWeight: 500, letterSpacing: "0.05em" }}>
                    {currentSlide + 1} / {allSlides.length}
                  </div>
                </div>
              </div>

              <SectionNav sections={data.sections} currentSection={currentSectionIdx} onSelect={jumpToSection} />
              <ProgressBar current={currentSlide} total={allSlides.length} color={activeColor} />
            </div>

            {/* ── Clickable slide area ── */}
            <div
              onClick={advance}
              style={{
                flex: 1, overflow: "hidden", position: "relative",
                cursor: isAtEnd ? "default" : "pointer",
                opacity: isTransitioning ? 0 : 1,
                transform: isTransitioning ? `translateX(${direction * 28}px)` : "translateX(0)",
                transition: "opacity 0.28s ease, transform 0.28s cubic-bezier(0.4,0,0.2,1)"
              }}
            >
              <SlideContent slide={currentSlideData} revealIndex={revealIndex} />

              {/* Subtle click-to-reveal hint */}
              {!isAtEnd && !isTransitioning && (
                <div style={{
                  position: "absolute", bottom: "14px", right: "20px",
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "5px 12px", borderRadius: "20px",
                  background: "rgba(255,255,255,0.04)", border: `1px solid ${activeColor}25`,
                  pointerEvents: "none"
                }}>
                  <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: activeColor, opacity: 0.7 }} />
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.05em" }}>
                    {fullyRevealed
                      ? "click or → for next slide"
                      : `${totalSteps - 1 - revealIndex} item${totalSteps - 1 - revealIndex !== 1 ? "s" : ""} remaining`}
                  </span>
                </div>
              )}
            </div>

            {/* ── Bottom nav ── */}
            <div style={{
              padding: "11px 24px", borderTop: "1px solid rgba(255,255,255,0.07)",
              display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0
            }}>
              {/* Back button */}
              <button
                onClick={(e) => { e.stopPropagation(); stepBack(); }}
                disabled={isAtStart}
                style={{
                  padding: "8px 20px", borderRadius: "100px",
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                  color: isAtStart ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)",
                  fontSize: "13px", fontWeight: 600,
                  cursor: isAtStart ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease", letterSpacing: "0.03em", backdropFilter: "blur(10px)"
                }}
                onMouseEnter={e => { if (!isAtStart) e.target.style.background = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={e => e.target.style.background = "rgba(255,255,255,0.06)"}
              >← Back</button>

              {/* Slide dots (click to jump to slide) */}
              <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                {allSlides.map((_, i) => {
                  const sec = data.sections.find(s => s.slides.some(sl => sl.slide_number === allSlides[i]?.slide_number));
                  const isCur = i === currentSlide;
                  return (
                    <button key={i} onClick={(e) => { e.stopPropagation(); goTo(i); }} style={{
                      width: isCur ? "20px" : "5px", height: "5px", borderRadius: "3px", border: "none",
                      background: isCur ? (sec?.section_color || "#fff") : "rgba(255,255,255,0.15)",
                      cursor: "pointer", transition: "all 0.3s ease", padding: 0,
                      boxShadow: isCur ? `0 0 6px ${sec?.section_color}80` : "none"
                    }} />
                  );
                })}
              </div>

              {/* Next / Reveal button */}
              <button
                onClick={(e) => { e.stopPropagation(); advance(); }}
                disabled={isAtEnd}
                style={{
                  padding: "8px 20px", borderRadius: "100px",
                  background: isAtEnd
                    ? "rgba(255,255,255,0.04)"
                    : `linear-gradient(135deg, ${activeColor}35, ${activeColor}18)`,
                  border: `1px solid ${isAtEnd ? "rgba(255,255,255,0.08)" : activeColor + "45"}`,
                  color: isAtEnd ? "rgba(255,255,255,0.2)" : "#fff",
                  fontSize: "13px", fontWeight: 600,
                  cursor: isAtEnd ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease", letterSpacing: "0.03em", backdropFilter: "blur(10px)"
                }}
                onMouseEnter={e => { if (!isAtEnd) e.target.style.transform = "scale(1.04)"; }}
                onMouseLeave={e => e.target.style.transform = "scale(1)"}
              >
                {fullyRevealed ? "Next →" : "Reveal →"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Bottom hint */}
      {!showTitle && (
        <div style={{
          position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)",
          fontSize: "10px", color: "rgba(255,255,255,0.16)", letterSpacing: "0.08em", pointerEvents: "none", whiteSpace: "nowrap"
        }}>
          SPACE / → / CLICK SLIDE — REVEAL · ← / BACKSPACE — STEP BACK
        </div>
      )}
    </div>
  );
}