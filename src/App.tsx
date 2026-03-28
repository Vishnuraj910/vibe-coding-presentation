import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { AllSlide, PresentationData, FinalData } from "./types/slides";
import data from "./data/slides.json";
import { useTheme } from "./context/ThemeContext.tsx";
import ThemeToggle from "./components/ThemeToggle";
import FinalPage from "./components/FinalPage";

// Flatten slides with section metadata
const allSlides: AllSlide[] = [];
data.sections.forEach((section) => {
  section.slides.forEach((slide) => {
    allSlides.push({ ...slide, section_name: section.section_name, section_icon: section.section_icon, section_color: section.section_color });
  });
});

type RevealStep = { type: "stat" | "point" | "callout" | "image"; index?: number };

function getRevealSteps(slide: AllSlide): RevealStep[] {
  const steps: RevealStep[] = [];
  if (slide.stat) steps.push({ type: "stat" });
  (slide.points || []).forEach((_, i) => steps.push({ type: "point", index: i }));
  if (slide.image) steps.push({ type: "image" });
  if (slide.callout) steps.push({ type: "callout" });
  if (slide.linkedinUrl) steps.push({ type: "point" });
  return steps;
}

// Window getter/setter for cross-component callback
const getWindowOpenImage = (): (() => void) | undefined => (window as any).__openImageCallback__;
const setWindowOpenImage = (fn: (() => void) | undefined): void => {
  (window as any).__openImageCallback__ = fn;
};

interface GlassOrbProps {
  x: string | number;
  y: string | number;
  size: string;
  color: string;
  opacity?: number;
  blur?: number;
  isDark: boolean;
}

function GlassOrb({ x, y, size, color, opacity = 0.15, blur = 80, isDark }: GlassOrbProps) {
  return (
    <div style={{
      position: "absolute" as const, left: x, top: y, width: size, height: size,
      borderRadius: "50%", background: color, opacity: isDark ? (opacity ?? 0.15) : (opacity ?? 0.15) * 0.6,
      filter: `blur(${blur ?? 80}px)`, pointerEvents: "none" as const, transition: "all 1.5s ease"
    }} />
  );
}

interface ProgressBarProps {
  current: number;
  total: number;
  color: string;
  isDark: boolean;
}

function ProgressBar({ current, total, color, isDark }: ProgressBarProps) {
  return (
    <div style={{ 
      height: "3px", 
      background: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", 
      borderRadius: "2px" as const, 
      overflow: "hidden" 
    }}>
      <div style={{
        height: "100%", width: `${((current + 1) / total) * 100}%`,
        background: `linear-gradient(90deg, ${color}, ${color}cc)`,
        borderRadius: "2px", transition: "width 0.5s cubic-bezier(0.4,0,0,0.2,1)",
        boxShadow: `0 0 8px ${color}80`
      }} />
    </div>
  );
}

interface SectionNavProps {
  sections: PresentationData["sections"];
  currentSection: number;
  onSelect: (idx: number) => void;
  isDark: boolean;
}

function SectionNav({ sections, currentSection, onSelect, isDark }: SectionNavProps) {
  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
      {sections.map((sec, i) => (
        <button
          key={i}
          onClick={(e) => { e.stopPropagation(); onSelect(i); }}
          style={{
            padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
            border: `1px solid ${currentSection === i ? sec.section_color : isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"}`,
            background: currentSection === i ? `${sec.section_color}25` : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
            color: currentSection === i ? sec.section_color : isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
            cursor: "pointer", transition: "all 0.3s ease", letterSpacing: "0.03em", backdropFilter: "blur(10px)"
          }}
        >
          {sec.section_icon} {sec.section_name}
        </button>
      ))}
    </div>
  );
}

interface TitleSlideProps {
  data: PresentationData;
  onStart: () => void;
  isDark: boolean;
  themeColors: ThemeColors;
}

interface ThemeColors {
  bg: string;
  bgGradient: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  border: string;
  glassBg: string;
  glassBorder: string;
  cardBg: string;
  cardBorder: string;
}

function TitleSlide({ data, onStart, isDark, themeColors }: TitleSlideProps) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      height: "100%", textAlign: "center" as const, padding: "60px 40px", gap: "28px"
    }}>
      <div style={{
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.8s cubic-bezier(0.4,0,0,0.2,1)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "8px"
      }}>
        <div style={{
          fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", 
          color: themeColors.textMuted, 
          textTransform: "uppercase" as const, marginBottom: "8px"
        }}>
          {data.version}
        </div>
        <h1 style={{
          fontSize: "clamp(42px, 7vw, 80px)", fontWeight: 800, margin: 0,
          color: isDark ? "#ffffff" : "#1d1d1f",
          lineHeight: 1.05, letterSpacing: "-0.03em",
          transition: "color 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
        }}>
          {data.presentation_title}
        </h1>
        <div style={{
          fontSize: "clamp(20px, 3.5vw, 36px)", fontWeight: 300,
          color: themeColors.textSubtle, letterSpacing: "0.01em"
        }}>
          {data.presentation_subtitle}
        </div>
      </div>

      <div style={{
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.8s cubic-bezier(0.4,0,0,0.2,1) 0.3s"
      }}>
        <div style={{
          padding: "12px 28px", borderRadius: "100px",
          background: themeColors.glassBg, 
          border: `1px solid ${themeColors.glassBorder}`,
          backdropFilter: "blur(20px)", fontSize: "14px", 
          color: themeColors.textMuted, 
          fontStyle: "italic", letterSpacing: "0.02em"
        }}>
          "{data.tagline}"
        </div>
      </div>

      <div style={{
        display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center",
        opacity: visible ? 1 : 0, transition: "all 0.8s ease 0.5s"
      }}>
        {data.sections.map((s, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px",
            borderRadius: "20px", background: `${s.section_color}20`,
            border: `1px solid ${s.section_color}40`, fontSize: "12px",
            color: s.section_color, fontWeight: 600
          }}>
            {s.section_icon} {s.section_name}
            <span style={{ color: themeColors.textMuted, fontWeight: 400 }}>{s.slides.length}</span>
          </div>
        ))}
      </div>

      {data.into_speaker && (
        <div style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(14px)",
          transition: "all 0.8s cubic-bezier(0.4,0,0,0.2,1) 0.65s",
          marginTop: "4px"
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            padding: "12px 22px",
            borderRadius: "14px",
            background: themeColors.glassBg,
            border: `1px solid ${themeColors.glassBorder}`,
            backdropFilter: "blur(16px)"
          }}>
            <div style={{
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase" as const,
              color: themeColors.textMuted,
              fontWeight: 700
            }}>
              Speaker
            </div>
            <div style={{
              fontSize: "20px",
              fontWeight: 700,
              color: themeColors.text,
              lineHeight: 1.2
            }}>
              {data.into_speaker.name}
            </div>
            <div style={{
              fontSize: "14px",
              color: themeColors.textSubtle,
              fontWeight: 500
            }}>
              {data.into_speaker.designation}
            </div>
          </div>
        </div>
      )}

      <button onClick={onStart} style={{
        marginTop: "16px", padding: "16px 48px", borderRadius: "100px",
        background: isDark 
          ? "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))"
          : "linear-gradient(135deg, rgba(0,0,0,0.12), rgba(0,0,0,0.04))",
        border: `1px solid ${themeColors.border}`, 
        color: themeColors.text, 
        fontSize: "16px", fontWeight: 600,
        cursor: "pointer", backdropFilter: "blur(20px)", letterSpacing: "0.05em",
        transition: "all 0.3s ease", opacity: visible ? 1 : 0,
        boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.3)" : "0 8px 32px rgba(0,0,0,0.1)", 
        textTransform: "uppercase" as const
      }}
        onMouseEnter={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.background = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.18)"; btn.style.transform = "scale(1.03)"; }}
        onMouseLeave={(e) => { const btn = e.currentTarget as HTMLButtonElement; btn.style.background = isDark ? "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))" : "linear-gradient(135deg, rgba(0,0,0,0.12), rgba(0,0,0,0.04))"; btn.style.transform = "scale(1)"; }}
      >
        Begin →
      </button>
    </div>
  );
}

interface SlideContentProps {
  slide: AllSlide;
  revealIndex: number;
  onImageClick: () => void;
  isDark: boolean;
  themeColors: ThemeColors;
}

function SlideContent({ slide, revealIndex, onImageClick, isDark, themeColors }: SlideContentProps) {
  const color = slide.section_color;
  const steps = getRevealSteps(slide);

  const shown = (type: "stat" | "point" | "callout" | "image", idx?: number) => {
    const si = steps.findIndex(s => s.type === type && (idx === undefined || s.index === idx));
    return si !== -1 && revealIndex >= si;
  };

  const fadeUp = (visible: boolean) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(14px)",
    transition: "opacity 0.4s ease, transform 0.42s cubic-bezier(0.4,0,0,0.2,1)",
    pointerEvents: visible ? "auto" : "none" as any
  });

  const slideRight = (visible: boolean) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateX(0)" : "translateX(-20px)",
    transition: "opacity 0.6s ease, transform 0.62s cubic-bezier(0.22,1,0.36,1), filter 0.62s cubic-bezier(0.22,1,0.36,1)",
    filter: visible ? "blur(0px)" : "blur(4px)",
    pointerEvents: visible ? "auto" : "none" as any
  });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "38px 64px 34px", gap: "20px", overflowY: "auto" }}>
      <div>
        <h2 style={{
          margin: 0, fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 800,
          color: isDark ? "#ffffff" : "#1d1d1f",
          lineHeight: 1.1, letterSpacing: "-0.02em",
          transition: "color 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
        }}>
          {slide.heading}
        </h2>
        {slide.subheading && (
          <p style={{
            margin: "8px 0 0", fontSize: "clamp(13px, 1.8vw, 17px)",
            color: themeColors.textMuted, 
            fontWeight: 400, fontStyle: "italic", lineHeight: 1.4,
            transition: "color 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
          }}>
            {slide.subheading}
          </p>
        )}
      </div>

      {slide.stat && (
        <div style={{
          display: "flex", flexDirection: "column", gap: "4px",
          padding: "16px 24px", borderRadius: "16px",
          background: `linear-gradient(135deg, ${color}20, ${color}08)`,
          border: `1px solid ${color}35`, backdropFilter: "blur(20px)",
          marginTop: (slide.points || []).length === 0 ? "80px" : "0",
          ...fadeUp(shown("stat"))
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ fontSize: "clamp(36px, 5vw, 52px)", fontWeight: 900, color, lineHeight: 1, flexShrink: 0, maxWidth: "70%", wordWrap: "break-word" as const }}>
              <span dangerouslySetInnerHTML={{ __html: slide.stat.value }} />
            </div>
            <div style={{ fontSize: "14px", color: themeColors.textSubtle, lineHeight: 1.4 }}>
              <span dangerouslySetInnerHTML={{ __html: slide.stat.label }} />
            </div>
          </div>
          {slide.stat.source && (
            <div style={{
              fontSize: "11px",
              color: themeColors.textMuted,
              opacity: 0.6,
              marginLeft: "auto",
              fontStyle: "italic"
            }}>
              Source: {slide.stat.source}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
        {(slide.points || []).map((point, i) => (
          <div key={i} style={{
            display: "flex", gap: "12px", alignItems: "flex-start",
            ...slideRight(shown("point", i)),
            transitionDelay: shown("point", i) ? `${i * 90}ms` : "0ms"
          }}>
            <div style={{
              width: "6px", height: "6px", borderRadius: "50%", background: color,
              flexShrink: 0, marginTop: "8px", boxShadow: `0 0 8px ${color}60`
            }} />
            <p style={{
              margin: 0, fontSize: "clamp(16px, 1.92vw, 18px)",
              color: themeColors.textSubtle, 
              lineHeight: 1.65, fontWeight: 400
            }}
              dangerouslySetInnerHTML={{ __html: point }}
            />
          </div>
        ))}
      </div>

      {slide.callout && (
        <div style={{
          padding: "15px 20px", borderRadius: "12px",
          background: themeColors.cardBg, 
          border: `1px solid ${themeColors.cardBorder}`,
          borderLeft: `3px solid ${color}`, backdropFilter: "blur(20px)" as const,
          ...fadeUp(shown("callout"))
        }}>
          <p style={{ margin: 0, fontSize: "clamp(12px, 1.5vw, 14px)", color: themeColors.textMuted, lineHeight: 1.6, fontStyle: "italic" }}>
            <span style={{ color, fontWeight: 700, fontStyle: "normal" }}>→ </span>
            <span dangerouslySetInnerHTML={{ __html: slide.callout }} />
          </p>
        </div>
      )}

      {slide.image && (
        <div 
          style={{
            position: "relative" as const, overflow: "hidden", borderRadius: "16px",
            background: `linear-gradient(135deg, ${color}20, ${color}08)`,
            border: `1px solid ${color}35`, backdropFilter: "blur(20px)", marginBottom: "16px",
            ...fadeUp(shown("image"))
          }}
          onClick={(e) => {
            e.stopPropagation();
            onImageClick();
          }}
        >
          <img
            src={slide.image}
            alt={slide.heading}
            style={{
              width: "100%", height: "100%",
              objectFit: "contain",
              display: "block",
              transition: "opacity 0.4s ease, transform 0.42s cubic-bezier(0.4,0,0,0.2,1)"
            }}
          />
        </div>
      )}

      {slide.linkedinUrl && (
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "12px 20px", borderRadius: "12px",
          background: "rgba(10,102,194,0.15)", border: "1px solid rgba(10,102,194,0.3)",
          ...fadeUp(shown("point"))
        }}>
          <span style={{ fontSize: "18px" }}>💼</span>
          <span style={{ fontSize: "13px", color: themeColors.textMuted }}>Connect on LinkedIn</span>
          <span style={{ fontSize: "12px", color: "#5AA7D4", marginLeft: "auto" }}>{slide.linkedinUrl}</span>
        </div>
      )}
    </div>
  );
}

function ImageModal({ isOpen, imageSrc, onClose, sectionColor, imageTitle, isDark }: { 
  isOpen: boolean; 
  imageSrc: string; 
  onClose: () => void;
  sectionColor: string;
  imageTitle?: string;
  isDark: boolean;
}) {
  const overlayStyle = {
    position: "fixed" as const, inset: 0, 
    background: isDark ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.95)",
    display: isOpen ? "flex" : "none", alignItems: "center", justifyContent: "center",
    zIndex: 1000, transition: "opacity 0.3s ease", cursor: "pointer" as const,
    backdropFilter: "blur(5px)"
  };
  
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{
        position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
        width: "100vw", height: "100vh", padding: "20px", boxSizing: "border-box"
      }}>
        {imageSrc && (
          <img 
            src={imageSrc} 
            alt={imageTitle || "Full screen"}
            style={{
              height: "100%",
              maxWidth: "100%", maxHeight: "100%",
              borderRadius: "16px", 
              boxShadow: isDark 
                ? "0 0 60px rgba(255,255,255,0.1), 0 0 80px rgba(0,0,0,0.5)"
                : "0 0 60px rgba(0,0,0,0.1), 0 0 80px rgba(0,0,0,0.2)"
            }}
          />
        )}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            position: "absolute", top: "30px", right: "30px",
            padding: "12px 24px", fontSize: "14px", fontWeight: 600,
            background: sectionColor, color: "#fff", border: "none",
            borderRadius: "10px", cursor: "pointer", transition: "all 0.2s ease",
            fontFamily: "'Inter', sans-serif", boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.background = `${sectionColor}cc`; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          ✕ Close
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { isDark } = useTheme();
  
  // Theme-aware colors
  const themeColors: ThemeColors = useMemo(() => ({
    bg: isDark ? "#080B14" : "#F5F5F7",
    bgGradient: isDark 
      ? "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)"
      : "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
    text: isDark ? "#ffffff" : "#1d1d1f",
    textMuted: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)",
    textSubtle: isDark ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.7)",
    border: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)",
    glassBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.7)",
    glassBorder: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)",
    cardBg: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
    cardBorder: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
  }), [isDark]);

  const [showTitle, setShowTitle] = useState(true);
  const [showFinalPage, setShowFinalPage] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [revealIndex, setRevealIndex] = useState(-1);
  const [direction, setDirection] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [imageTitle, setImageTitle] = useState("");
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState<boolean>(!!document.fullscreenElement);
  const transitionTimeoutRef = useRef<number | null>(null);

  // Get final data from slides.json
  const finalData: FinalData | undefined = data.final;

  const currentSlideData = allSlides[currentSlide];
  const activeColor = currentSlideData?.section_color || "#6C63FF";
  const sectionColor = currentSlideData?.section_color || "#6C63FF";
  const steps = currentSlideData ? getRevealSteps(currentSlideData) : [];
  const totalSteps = steps.length;
  const fullyRevealed = revealIndex >= totalSteps - 1;

  const currentSectionIdx = data.sections.findIndex(s =>
    s.slides.some(sl => sl.slide_number === currentSlideData?.slide_number)
  );

  const handleOpenImage = useCallback(() => {
    if (currentSlideData?.image) {
      setImageSrc(currentSlideData.image);
      setImageTitle(currentSlideData.heading || "Full screen");
      setShowImageModal(true);
    }
  }, [currentSlideData?.image, currentSlideData?.heading]);

  // Initialize window callback
  useEffect(() => {
    setWindowOpenImage(handleOpenImage);
    return () => {
      setWindowOpenImage(undefined);
    };
  }, [handleOpenImage]);

  const goTo = useCallback((idx: number) => {
    if (isTransitioning || idx < 0 || idx >= allSlides.length) return;
    setDirection(idx > currentSlide ? 1 : -1);
    setRevealIndex(-1);
    setIsTransitioning(true);
    transitionTimeoutRef.current = window.setTimeout(() => {
      setCurrentSlide(idx);
      setRevealIndex(-1);
      setIsTransitioning(false);
    }, 280);
  }, [currentSlide, isTransitioning]);

  const advance = useCallback(() => {
    if (isTransitioning) return;
    if (revealIndex < totalSteps - 1) {
      setRevealIndex(r => r + 1);
    } else if (currentSlide < allSlides.length - 1) {
      goTo(currentSlide + 1);
    } else if (finalData) {
      // At the last slide and final data exists - go to final page (skip QR modal)
      setShowFinalPage(true);
    } else if (currentSlideData?.linkedinUrl) {
      setImageSrc("src/assets/qr-code.png");
      setImageTitle("LinkedIn QR Code");
      setShowImageModal(true);
    }
  }, [isTransitioning, revealIndex, totalSteps, currentSlide, goTo, currentSlideData?.linkedinUrl, finalData]);

  const stepBack = useCallback(() => {
    if (isTransitioning) return;
    if (showFinalPage) {
      // Go back from final page to last slide
      setShowFinalPage(false);
      return;
    }
    if (revealIndex > -1) {
      setRevealIndex(r => r - 1);
    } else if (currentSlide > 0) {
      setDirection(-1);
      setRevealIndex(-1);
      setIsTransitioning(true);
      transitionTimeoutRef.current = window.setTimeout(() => {
        const prevIdx = currentSlide - 1;
        const prevSteps = getRevealSteps(allSlides[prevIdx]);
        setCurrentSlide(prevIdx);
        setRevealIndex(prevSteps.length - 1);
        setIsTransitioning(false);
      }, 280);
    }
  }, [isTransitioning, revealIndex, currentSlide, showFinalPage]);

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showTitle) {
        if (["Enter", " ", "ArrowRight", "PageDown"].includes(e.key)) { e.preventDefault(); setShowTitle(false); return; }
      } else {
        if (showImageModal) {
          e.preventDefault();
          setShowImageModal(false);
          return;
        }
        if (["ArrowRight", "ArrowDown", " ", "PageDown"].includes(e.key)) { e.preventDefault(); advance(); return; }
        if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); stepBack(); return; }
        if (e.key === "." && currentSlideData?.image && !showImageModal) {
          e.preventDefault();
          setImageSrc(currentSlideData.image);
          setImageTitle(currentSlideData.heading || "Full screen");
          setShowImageModal(true);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showTitle, advance, stepBack, showImageModal, currentSlideData?.image]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsBrowserFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleBrowserFullscreen = useCallback(async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore browser fullscreen API errors (e.g., unsupported or blocked)
    }
  }, []);

  const jumpToSection = useCallback((sectionIdx: number) => {
    const section = data.sections[sectionIdx];
    const firstIdx = allSlides.findIndex(s => s.section_name === section.section_name);
    if (firstIdx >= 0) { setShowTitle(false); goTo(firstIdx); }
  }, [goTo]);

  const isAtStart = currentSlide === 0 && revealIndex === -1;
  const isAtEnd = currentSlide === allSlides.length - 1 && fullyRevealed;

  return (
    <div style={{
      width: "100vw", height: "100vh", 
      background: themeColors.bg,
      display: "flex", alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflow: "hidden" as const, position: "relative" as const,
      userSelect: "none" as const,
      WebkitUserSelect: "none" as const,
      msUserSelect: "none" as const,
      WebkitTapHighlightColor: "transparent",
      transition: "background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
    }}>
      <GlassOrb x="-10%" y="-15%" size="50vw" color={activeColor} opacity={0.12} blur={120} isDark={isDark} />
      <GlassOrb x="60%" y="50%" size="40vw" color={showTitle ? "#A78BFA" : activeColor} opacity={0.08} blur={100} isDark={isDark} />
      <GlassOrb x="20%" y="70%" size="30vw" color="#00D4AA" opacity={0.06} blur={80} isDark={isDark} />

      <div style={{
        position: "absolute" as const, inset: 0, 
        opacity: isDark ? 0.025 : 0.03,
        backgroundImage: isDark 
          ? "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)"
          : "linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.15) 1px, transparent 1px)",
        backgroundSize: "60px 60px", pointerEvents: "none" as const,
        transition: "opacity 0.5s ease"
      }} />

      {/* Theme Toggle - positioned at top left */}
      <ThemeToggle />

      <button
        onClick={toggleBrowserFullscreen}
        title={isBrowserFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        aria-label={isBrowserFullscreen ? "Exit browser fullscreen" : "Enter browser fullscreen"}
        style={{
          position: "absolute" as const,
          top: "18px",
          right: "18px",
          zIndex: 1100,
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          border: `1px solid ${themeColors.border}`,
          background: themeColors.glassBg,
          color: themeColors.text,
          backdropFilter: "blur(10px)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          transition: "all 0.2s ease"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.08)";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = themeColors.glassBg;
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {isBrowserFullscreen ? "🡼" : "⛶"}
      </button>

      <ImageModal
        isOpen={showImageModal}
        imageSrc={imageSrc}
        onClose={() => setShowImageModal(false)}
        sectionColor={sectionColor}
        imageTitle={imageTitle || currentSlideData?.heading}
        isDark={isDark}
      />

      <div style={{
        width: "min(99vw, 1360px)", height: "min(97vh, 860px)",
        borderRadius: "28px", position: "relative", overflow: "hidden",
        background: themeColors.bgGradient,
        border: `1px solid ${themeColors.glassBorder}`, 
        backdropFilter: "blur(40px) saturate(180%)",
        boxShadow: isDark 
          ? `0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 80px ${activeColor}15`
          : `0 40px 120px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.5), 0 0 80px ${activeColor}10`,
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)", 
        display: "flex", flexDirection: "column" as const
      }}>
        <div style={{
          position: "absolute" as const, top: 0, left: 0, right: 0, height: "50%",
          background: isDark 
            ? "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)",
          borderRadius: "28px 28px 0 0", pointerEvents: "none" as const,
          transition: "background 0.5s ease"
        }} />

        {showTitle ? (
          <TitleSlide data={data} onStart={() => setShowTitle(false)} isDark={isDark} themeColors={themeColors} />
        ) : showFinalPage && finalData ? (
          <FinalPage 
            data={finalData} 
            onBack={() => setShowFinalPage(false)} 
            sectionColor={sectionColor}
            isDark={isDark}
            themeColors={themeColors}
          />
        ) : (
          <>
            <div style={{
              padding: "14px 24px 12px", 
              borderBottom: `1px solid ${themeColors.cardBorder}`,
              display: "flex", flexDirection: "column", gap: "10px", flexShrink: 0
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <button onClick={(e) => { e.stopPropagation(); setShowTitle(true); }} style={{
                  background: "none", border: "none", 
                  color: themeColors.textMuted,
                  fontSize: "12px", cursor: "pointer" as const, padding: 0, letterSpacing: "0.05em" as const
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = themeColors.textSubtle; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = themeColors.textMuted; }}
                >← HOME</button>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                    {steps.map((_, i) => (
                      <div key={i} style={{
                        width: i <= revealIndex ? "14px" : "5px", height: "5px" as string,
                        borderRadius: "3px", transition: "all 0.3s ease",
                        background: i <= revealIndex ? activeColor : isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
                        boxShadow: i <= revealIndex ? `0 0 5px ${activeColor}60` : "none"
                      }} />
                    ))}
                  </div>
                  <div style={{ fontSize: "11px", color: themeColors.textMuted, fontWeight: 500, letterSpacing: "0.05em" }}>
                    {currentSlide + 1} / {allSlides.length}
                  </div>
                </div>
              </div>

              <SectionNav sections={data.sections} currentSection={currentSectionIdx} onSelect={jumpToSection} isDark={isDark} />
              <ProgressBar current={currentSlide} total={allSlides.length} color={activeColor} isDark={isDark} />
            </div>

            <div onClick={advance} style={{
              flex: 1, overflow: "hidden", position: "relative",
              cursor: isAtEnd ? "default" : "pointer" as const,
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? `translateX(${direction * 28}px)` : "translateX(0)",
              transition: "opacity 0.28s ease, transform 0.28s cubic-bezier(0.4,0,0,0.2,1)"
            }}>
              <SlideContent
                key={`${currentSlideData?.slide_number}-${isTransitioning ? "transition" : "stable"}`}
                slide={currentSlideData}
                revealIndex={revealIndex}
                onImageClick={handleOpenImage}
                isDark={isDark}
                themeColors={themeColors}
              />

              {!isAtEnd && !isTransitioning && (
                <div style={{
                  position: "absolute" as const, top: "14px", right: "20px",
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "5px 12px", borderRadius: "20px",
                  background: themeColors.cardBg, 
                  border: `1px solid ${activeColor}25`
                }}>
                  <div style={{ width: "5px", height: "5px" as string, borderRadius: "50%", background: activeColor, opacity: 0.7 }} />
                  <span style={{ fontSize: "10px", color: themeColors.textMuted, letterSpacing: "0.05em" }}>
                    {fullyRevealed
                      ? "click or → for next slide"
                      : `${totalSteps - 1 - revealIndex} item${totalSteps - 1 - revealIndex !== 1 ? "s" : ""} remaining`}
                  </span>
                </div>
              )}
            </div>

            <div style={{
              padding: "11px 24px", 
              borderTop: `1px solid ${themeColors.cardBorder}`,
              display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0
            }}>
              <button
                onClick={(e) => { e.stopPropagation(); stepBack(); }}
                disabled={isAtStart}
                style={{
                  padding: "8px 20px", borderRadius: "100px",
                  background: themeColors.cardBg, 
                  border: `1px solid ${themeColors.cardBorder}`,
                  color: isAtStart ? themeColors.textMuted : themeColors.textSubtle,
                  fontSize: "13px", fontWeight: 600,
                  cursor: isAtStart ? "not-allowed" : "pointer" as const,
                  transition: "all 0.2s ease", letterSpacing: "0.03em" as const, backdropFilter: "blur(10px)"
                }}
                onMouseEnter={(e) => { if (!isAtStart) e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"; }}
                onMouseLeave={(e) => e.currentTarget.style.background = themeColors.cardBg}
              >← Back</button>

              <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                {allSlides.map((_, i) => {
                  const sec = data.sections.find(s => s.slides.some(sl => sl.slide_number === allSlides[i]?.slide_number));
                  const isCur = i === currentSlide;
                  return (
                    <button key={i} onClick={(e) => { e.stopPropagation(); goTo(i); }} style={{
                      width: isCur ? "20px" : "5px" as string, height: "5px" as string, borderRadius: "3px", border: "none" as const,
                      background: isCur ? (sec?.section_color || (isDark ? "#fff" : "#1d1d1f")) : isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
                      cursor: "pointer" as const, transition: "all 0.3s ease", padding: 0,
                      boxShadow: isCur ? `0 0 6px ${sec?.section_color}80` : "none"
                    }} />
                  );
                })}
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); advance(); }}
                disabled={isAtEnd}
                style={{
                  padding: "8px 20px", borderRadius: "100px",
                  background: isAtEnd
                    ? themeColors.cardBg
                    : `linear-gradient(135deg, ${activeColor}35, ${activeColor}18)`,
                  border: `1px solid ${isAtEnd ? themeColors.cardBorder : activeColor + "45"}`,
                  color: isAtEnd ? themeColors.textMuted : "#fff",
                  fontSize: "13px", fontWeight: 600,
                  cursor: isAtEnd ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease", letterSpacing: "0.03em" as const, backdropFilter: "blur(10px)"
                }}
                onMouseEnter={(e) => { if (!isAtEnd) e.currentTarget.style.transform = "scale(1.04)"; }}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                {fullyRevealed ? "Next →" : "Reveal →"}
              </button>
            </div>
          </>
        )}
      </div>

      {!showTitle && (
        <div style={{
          position: "absolute" as const, bottom: "12px", left: "50%", transform: "translateX(-50%)",
          fontSize: "10px", color: themeColors.textMuted, letterSpacing: "0.08em", pointerEvents: "none" as const, whiteSpace: "nowrap" as const
        }}>
          SPACE / → / CLICK SLIDE — REVEAL · ← / BACKSPACE — STEP BACK · ESC — CLOSE IMAGE
        </div>
      )}
    </div>
  );
}
