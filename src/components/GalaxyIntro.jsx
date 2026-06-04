/**
 * GalaxyIntro.jsx — Particle system: hạt bụi tụ thành chữ "Chúc Mừng"
 *
 * FIX:
 * 1. Canvas pixel-scan chuyển ra useEffect (tránh memory leak trong useMemo)
 * 2. Dùng useState để lưu textPositions sau khi scan xong
 * 3. bufferAttribute dùng args={[array, 3]} thay vì attach string
 *    → tương thích R3F v8+ / Three.js r150+
 * 4. Tách galaxyPositions và textPositions rõ ràng
 */

import React, { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 8000;

// Tạo vị trí ngẫu nhiên cho dải ngân hà ban đầu
function makeGalaxyPositions() {
  const pos = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const r = Math.random() * 12 + 1;
    const theta = Math.random() * 2 * Math.PI;
    const y = (Math.random() - 0.5) * 2 * (15 - r) * 0.15;
    pos[i * 3] = r * Math.cos(theta);
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = r * Math.sin(theta);
  }
  return pos;
}

// Quét pixel canvas để lấy tọa độ chữ "Chúc Mừng"
function makeTextPositions() {
  const pos = new Float32Array(COUNT * 3);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 1000, 300);
    ctx.fillStyle = "#fff";
    ctx.font = 'bold 110px "Arial", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Chúc Mừng", 500, 150);

    const imgData = ctx.getImageData(0, 0, 1000, 300).data;
    const valid = [];
    for (let y = 0; y < 300; y += 4) {
      for (let x = 0; x < 1000; x += 4) {
        if (imgData[(y * 1000 + x) * 4] > 128) {
          valid.push({ x: (x - 500) * 0.018, y: -(y - 150) * 0.018 });
        }
      }
    }

    for (let i = 0; i < COUNT; i++) {
      const c = valid[i % valid.length] ?? { x: 0, y: 0 };
      pos[i * 3] = c.x + (Math.random() - 0.5) * 0.1;
      pos[i * 3 + 1] = c.y + (Math.random() - 0.5) * 0.1;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
    }
  } catch (e) {
    console.warn("GalaxyIntro: canvas scan failed", e);
  }
  return pos;
}

export default function GalaxyIntro({ isHolding, onComplete, stage }) {
  const pointsRef = useRef();
  const progressRef = useRef(0);
  const completedRef = useRef(false);

  // Vị trí ngân hà — stable, không đổi
  const galaxyPositions = useMemo(() => makeGalaxyPositions(), []);

  // Vị trí chữ — tạo một lần sau mount (tránh canvas trong useMemo)
  const [textPositions, setTextPositions] = useState(null);
  useEffect(() => {
    // Defer ra khỏi render cycle để không block paint
    const id = requestAnimationFrame(() => {
      setTextPositions(makeTextPositions());
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useFrame(() => {
    if (!pointsRef.current || stage !== 0 || !textPositions) return;

    if (isHolding.current) {
      progressRef.current = Math.min(progressRef.current + 0.015, 1);
    } else {
      progressRef.current = Math.max(progressRef.current - 0.02, 0);
    }

    // Gọi onComplete đúng một lần
    if (progressRef.current >= 0.99 && !completedRef.current) {
      completedRef.current = true;
      onComplete();
      return;
    }

    const positions = pointsRef.current.geometry.attributes.position.array;
    const p = progressRef.current;
    const easeP = p * p * (3 - 2 * p); // smoothstep

    for (let i = 0; i < COUNT; i++) {
      const ix = i * 3,
        iy = ix + 1,
        iz = ix + 2;
      positions[ix] = THREE.MathUtils.lerp(
        galaxyPositions[ix],
        textPositions[ix],
        easeP,
      );
      positions[iy] = THREE.MathUtils.lerp(
        galaxyPositions[iy],
        textPositions[iy],
        easeP,
      );
      positions[iz] = THREE.MathUtils.lerp(
        galaxyPositions[iz],
        textPositions[iz],
        easeP,
      );
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    // Xoay chậm dần khi tụ thành chữ
    pointsRef.current.rotation.y += 0.005 * (1 - easeP);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[galaxyPositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#ff1a75"
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
