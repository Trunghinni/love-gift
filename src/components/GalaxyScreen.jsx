import React, { useEffect, useState } from "react";
import styles from "./GalaxyScreen.module.css";

export default function GalaxyScreen({ onNext }) {
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
            <em>Quốc tế thiếu nhi </em>
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

      {/* Bottom hint */}
      <div
        className={styles.bottomHint}
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 1.2s ease 1.2s, transform 1.2s ease 1.2s",
        }}
      >
        <span className={styles.hintPulse}>✦</span>
        <span className={styles.hintText}>Chạm bất kỳ để tiếp tục</span>
        <span className={styles.hintPulse}>✦</span>
      </div>
    </div>
  );
}
