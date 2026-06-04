/**
 * OverlayUI.jsx — Nút overlay cho stage 0
 *
 * FIX:
 * 1. Xóa import MessagesScreen.module.css (sai file, gây crash)
 * 2. Dùng inline styles hoàn toàn
 * 3. Component này giờ chỉ còn là wrapper đơn giản cho nút giữ ở stage 0
 *    (stage 1 dùng CollageScreen internal buttons, stage 2 dùng MessagesScreen)
 *
 * NOTE: Trong App.jsx mới, OverlayUI không còn được dùng trực tiếp.
 *       Logic nút giữ đã được tích hợp vào GalaxyScreen.
 *       File này giữ lại để tương thích nếu cần dùng lại.
 */

import React from "react";

export default function OverlayUI({ stage, setStage, isHolding }) {
  const handlePointerDown = () => {
    if (isHolding) isHolding.current = true;
  };
  const handlePointerUp = () => {
    if (isHolding) isHolding.current = false;
  };

  if (stage !== 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: "15%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem",
          pointerEvents: "auto",
        }}
      >
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: "#ffb3d9",
            fontSize: "1.1rem",
            textShadow: "0 0 8px #ff69b4",
            letterSpacing: "0.1em",
          }}
        >
          Giữ để bắt đầu
        </p>
        <div
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            border: "2px solid rgba(255, 105, 180, 0.4)",
            background: "rgba(255, 105, 180, 0.1)",
            cursor: "pointer",
            boxShadow: "0 0 18px rgba(255, 105, 180, 0.35)",
            transition: "all 0.2s ease",
          }}
        />
      </div>
    </div>
  );
}
