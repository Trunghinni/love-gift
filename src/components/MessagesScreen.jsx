import React, { useState, useEffect } from "react";
import styles from "./MessagesScreen.module.css";

const LETTER_LINES = [
  {
    delay: 0.3,
    text: "Chúc vợ iu lun thành công trong học tập, công việc và ngoan ngoãn.",
  },
  {
    delay: 0.8,
    text: "Luôn vui vẻ, nở nụ cười trên môi và đặc biệt là không được tiêu cực nhé.",
  },
  { delay: 1.4, text: "Chúc bé iu ngày càng xinh xắn, dễ thương," },
  { delay: 1.9, text: "mong em có tất cả trừ vất vả." },
];
const SIGNATURE = { delay: 2.6, text: '"Thương vợ iu của tui nhiều lắm..."' };

export default function MessagesScreen({ onBack }) {
  const [revealed, setRevealed] = useState(false);
  const [heartBeat, setHeartBeat] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 200);
    return () => clearTimeout(t);
  }, []);

  function handleHeartClick() {
    window.__spawnHearts?.();
    setHeartBeat(true);
    setTimeout(() => setHeartBeat(false), 600);
  }

  return (
    <div className={styles.screen}>
      {/* Floating petals decoration */}
      <div className={styles.petalLeft}>✿</div>
      <div className={styles.petalRight}>❀</div>

      <div
        className={`${styles.letterCard} ${revealed ? styles.revealed : ""}`}
      >
        {/* Card header ornament */}
        <div className={styles.ornament}>
          <span className={styles.ornLine} />
          <span
            className={styles.ornHeart}
            onClick={handleHeartClick}
            style={{ cursor: "pointer" }}
          >
            <span
              className={`${styles.heartIcon} ${heartBeat ? styles.heartBeat : ""}`}
            >
              ♥
            </span>
          </span>
          <span className={styles.ornLine} />
        </div>

        {/* Date */}
        <div className={styles.dateBlock}>
          <span className={styles.dateLabel}>Hôm nay</span>
          <span className={styles.dateValue}>01 · 06 · 2026</span>
          <span className={styles.dateSubLabel}>Ngày Quốc Tế Thiếu Nhi</span>
        </div>

        {/* Title */}
        <h2 className={styles.title}>Là ngày "Quốc tế thiếu nhi"</h2>

        {/* Letter body with ink-reveal */}
        <div className={styles.letterBody}>
          {LETTER_LINES.map((line, i) => (
            <p
              key={i}
              className={styles.line}
              style={{ "--delay": `${line.delay}s` }}
            >
              {line.text}
            </p>
          ))}
        </div>

        {/* Signature */}
        <div
          className={styles.signatureWrap}
          style={{ "--delay": `${SIGNATURE.delay}s` }}
        >
          <span className={styles.sigLine} />
          <p className={styles.signature}>{SIGNATURE.text}</p>
          <span className={styles.sigLine} />
        </div>

        {/* Bottom ornament */}
        <div className={styles.bottomOrnament}>
          <span className={styles.ornDot}>·</span>
          <span className={styles.ornDot}>✦</span>
          <span className={styles.ornDot}>·</span>
        </div>
      </div>

      <button className={styles.backBtn} onClick={onBack}>
        ↺ Ngắm ảnh lại
      </button>
    </div>
  );
}
