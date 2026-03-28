import { useState, useEffect } from "react";
import type { FinalData, ThemeColors } from "../types/slides";

interface FinalPageProps {
  data: FinalData;
  onBack: () => void;
  sectionColor: string;
  isDark: boolean;
  themeColors: ThemeColors;
}

export default function FinalPage({ data, onBack, sectionColor, isDark, themeColors }: FinalPageProps) {
  const [visible, setVisible] = useState(false);
  const [cardVisible, setCardVisible] = useState<boolean[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (visible && data.cards.length > 0) {
      const timers: number[] = [];
      data.cards.forEach((_, i) => {
        const timer = window.setTimeout(() => {
          setCardVisible(prev => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, 300 + i * 150);
        timers.push(timer);
      });
      return () => timers.forEach(clearTimeout);
    }
  }, [visible, data.cards.length]);

  // Responsive grid based on card count
  const getGridStyle = () => {
    const count = data.cards.length;
    if (count === 1) {
      return { gridTemplateColumns: "1fr", maxWidth: "600px", margin: "0 auto", gap: "33px" };
    } else if (count === 2) {
      return { gridTemplateColumns: "repeat(2, 1fr)", maxWidth: "1050px", margin: "0 auto", gap: "33px" };
    } else if (count === 3 || count === 4) {
      return { gridTemplateColumns: "repeat(2, 1fr)", gap: "33px" };
    } else {
      return { gridTemplateColumns: "repeat(3, 1fr)", gap: "33px" };
    }
  };

  const fadeUp = (delay: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.4,0,0,0.2,1) ${delay}ms`,
  });

  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      padding: "38px 64px 34px",
      gap: "28px",
      overflowY: "auto"
    }}>
      {/* Header Section */}
      <div style={{
        textAlign: "center",
        ...fadeUp(0)
      }}>
        <h2 style={{
          margin: 0,
          fontSize: "clamp(32px, 5vw, 52px)",
          fontWeight: 800,
          color: isDark ? "#ffffff" : "#1d1d1f",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          transition: "color 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
        }}>
          {data.heading}
        </h2>
        {data.subheading && (
          <p style={{
            margin: "12px 0 0",
            fontSize: "clamp(14px, 2vw, 18px)",
            color: themeColors.textMuted,
            fontWeight: 400,
            fontStyle: "italic",
            lineHeight: 1.5,
            transition: "color 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
          }}>
            {data.subheading}
          </p>
        )}
      </div>

      {/* Cards Grid */}
      <div style={{
        display: "grid",
        flex: 1,
        alignContent: "center",
        ...getGridStyle(),
        ...fadeUp(150)
      }}>
        {data.cards.map((card, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              borderRadius: "20px",
              background: themeColors.glassBg,
              border: `1px solid ${themeColors.glassBorder}`,
              backdropFilter: "blur(20px) saturate(180%)",
              overflow: "hidden",
              cursor: "pointer",
              transition: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1) ${cardVisible[i] ? "0ms" : "0ms"}`,
              transform: cardVisible[i] ? "scale(1)" : "scale(0.95)",
              opacity: cardVisible[i] ? 1 : 0,
              boxShadow: isDark
                ? "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
                : "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)"
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.transform = "scale(1.03)";
              el.style.boxShadow = isDark
                ? `0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 30px ${sectionColor}30`
                : `0 12px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.5), 0 0 30px ${sectionColor}20`;
              el.style.borderColor = `${sectionColor}50`;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.transform = "scale(1)";
              el.style.boxShadow = isDark
                ? "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
                : "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)";
              el.style.borderColor = themeColors.glassBorder;
            }}
          >
            {/* Image */}
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `linear-gradient(135deg, ${sectionColor}15, ${sectionColor}05)`,
              minHeight: "160px"
            }}>
              <img
                src={card.image}
                alt={card.title}
                style={{
                  maxWidth: "100%",
                  maxHeight: "75%",
                  objectFit: "contain",
                  borderRadius: "12px"
                }}
              />
            </div>

            {/* Title */}
            <div style={{
              padding: "16px 20px",
              borderTop: `1px solid ${themeColors.cardBorder}`,
              textAlign: "center"
            }}>
              <span style={{
                fontSize: "clamp(13px, 1.5vw, 15px)",
                fontWeight: 600,
                color: themeColors.textSubtle,
                letterSpacing: "0.02em"
              }}>
                {card.title}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Back Button */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        paddingTop: "8px",
        ...fadeUp(400)
      }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          style={{
            padding: "12px 32px",
            borderRadius: "100px",
            background: themeColors.cardBg,
            border: `1px solid ${themeColors.cardBorder}`,
            color: themeColors.textSubtle,
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s ease",
            letterSpacing: "0.03em"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
            e.currentTarget.style.transform = "scale(1.03)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = themeColors.cardBg;
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          ← Back to Slides
        </button>
      </div>
    </div>
  );
}
