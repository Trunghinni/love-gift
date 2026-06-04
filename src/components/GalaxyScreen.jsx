/**
 * GalaxyScreen.jsx — Màn hình chào đầu tiên
 *
 * FIX:
 * - Nhận thêm prop `isHolding` để truyền xuống nút giữ
 * - Nút "Giữ để bắt đầu" set isHolding.current thay vì gọi onNext trực tiếp
 * - Vẫn giữ onClick toàn màn → onNext() để tap nhanh cũng được
 */

import React, { useEffect, useState } from "react";
import styles from "./Galaxyscreen.module.css";

export default function GalaxyScreen({ onNext, isHolding }) {
  const [revealed, setRevealed] = useState(false);
  const [ripple, setRipple] = useState(null);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 400);
    return () => clearTimeout(t);
  }, []);

  function handleClick(e) {
    if (clicked) return;
    setClicked(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    window.__spawnHearts?.(e.clientX, e.clientY, 28);
    setTimeout(() => setRipple(null), 900);
    setTimeout(onNext, 700);
  }

  // Nút giữ — chỉ set ref, GalaxyIntro lắng nghe
  const handleHoldStart = () => {
    if (isHolding) isHolding.current = true;
  };
  const handleHoldEnd = () => {
    if (isHolding) isHolding.current = false;
  };

  return (
    <div
      className={styles.screen}
      onClick={handleClick}
      style={{ cursor: revealed ? "pointer" : "default" }}
    >
      {ripple && (
        <span
          className={styles.ripple}
          style={{ left: ripple.x, top: ripple.y }}
        />
      )}

      {/* Top badge */}
      <div
        className={styles.topBadge}
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 1.2s ease 0.2s, transform 1.2s ease 0.2s",
        }}
      >
        <span className={styles.badgeLine} />
        <span className={styles.badgeText}>✦ Một món quà đặc biệt ✦</span>
        <span className={styles.badgeLine} />
      </div>

      {/* Center */}
      <div
        className={styles.center}
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 1.2s ease 0.6s, transform 1.2s ease 0.6s",
        }}
      >
        <div className={styles.quoteWrap}>
          <span className={styles.quoteDecor}>"</span>
          <p className={styles.quote}>
            Chúc Mừng
            <br />
            <em>Quốc tế thiếu nhi</em>
          </p>
          <span className={`${styles.quoteDecor} ${styles.quoteDecorClose}`}>
            "
          </span>
        </div>

        <div className={styles.divider}>
          <span className={styles.divLine} />
          <span className={styles.diamond}>✦</span>
          <span className={styles.divLine} />
        </div>

        <p className={styles.sub}>Bé iu của anh</p>
      </div>

      {/* Nút giữ để bắt đầu — ngăn sự kiện click bubble lên div cha */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.6rem",
          opacity: revealed ? 1 : 0,
          transition: "opacity 1.2s ease 1s",
          userSelect: "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "rgba(200, 140, 180, 0.7)",
            fontSize: "clamp(0.75rem, 1.8vw, 0.9rem)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          Giữ để bắt đầu
        </p>
        <div
          onPointerDown={handleHoldStart}
          onPointerUp={handleHoldEnd}
          onPointerLeave={handleHoldEnd}
          onTouchStart={handleHoldStart}
          onTouchEnd={handleHoldEnd}
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "1.5px solid rgba(255, 105, 180, 0.5)",
            background: "rgba(255, 105, 180, 0.08)",
            cursor: "pointer",
            boxShadow: "0 0 20px rgba(255, 105, 180, 0.25)",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,105,180,0.2)";
            e.currentTarget.style.boxShadow = "0 0 30px rgba(255,105,180,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,105,180,0.08)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(255,105,180,0.25)";
          }}
        >
          <span style={{ color: "rgba(255,150,200,0.6)", fontSize: "1.2rem" }}>
            ✦
          </span>
        </div>
      </div>

      {/* Bottom hint */}
      <div
        className={styles.bottomHint}
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 1.2s ease 1.4s, transform 1.2s ease 1.4s",
        }}
      >
        <span className={styles.hintPulse}>✦</span>
        <span className={styles.hintText}>Chạm bất kỳ để tiếp tục</span>
        <span className={styles.hintPulse}>✦</span>
      </div>
    </div>
  );
}
