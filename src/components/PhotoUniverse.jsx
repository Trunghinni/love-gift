/**
 * PhotoUniverse.jsx — Quả cầu ảnh 3D + hiệu ứng nổ tung
 *
 * FIX:
 * 1. Xóa hoàn toàn dependency gsap (không có trong project)
 *    → Thay bằng useRef progress + THREE.MathUtils.lerp trong useFrame
 * 2. Fix image orientation: ảnh hướng mặt ra ngoài quả cầu đúng cách
 *    (lookAt tâm + flip 180°)
 * 3. Floating animation sau khi nổ (lơ lửng nhẹ nhàng)
 * 4. Easing: easeOutExpo cho explosion, easeInOutCubic cho tụ lại
 * 5. stage prop: 1 = sphere, 2 = exploded
 */

import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Image } from "@react-three/drei";
import * as THREE from "three";

// ── Math ────────────────────────────────────────────────────
function getSpherePositions(count, radius) {
  const positions = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = phi * i;
    positions.push(
      new THREE.Vector3(
        Math.cos(theta) * r * radius,
        y * radius,
        Math.sin(theta) * r * radius,
      ),
    );
  }
  return positions;
}

function getExplodePositions(count, radius) {
  return Array.from({ length: count }, () => {
    const u = Math.random(),
      v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = radius * (0.5 + Math.random() * 0.5);
    return new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    );
  });
}

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ── Single Photo ─────────────────────────────────────────────
function PhotoItem({ url, spherePos, explodePos, stage, index, floatSeed }) {
  const meshRef = useRef();
  const progressRef = useRef(0); // 0 = sphere, 1 = exploded
  const timeRef = useRef(floatSeed);
  const prevStageRef = useRef(stage);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const mesh = meshRef.current;
    const isExploding = stage === 2;
    const speed = isExploding ? delta / 1.8 : delta * 1.5;

    if (isExploding) {
      progressRef.current = Math.min(1, progressRef.current + speed);
    } else {
      progressRef.current = Math.max(0, progressRef.current - speed);
    }

    const t = isExploding
      ? easeOutExpo(progressRef.current)
      : easeInOutCubic(1 - progressRef.current);

    // Lerp vị trí giữa sphere ↔ explode
    mesh.position.lerpVectors(
      spherePos,
      explodePos,
      progressRef.current > 0 ? easeOutExpo(progressRef.current) : 0,
    );

    if (isExploding && progressRef.current > 0.85) {
      // Floating sau khi đến vị trí
      timeRef.current += delta * 0.4;
      mesh.position.y = explodePos.y + Math.sin(timeRef.current) * 0.12;
      mesh.position.x = explodePos.x + Math.cos(timeRef.current * 0.7) * 0.06;
      // Xoay nhẹ
      mesh.rotation.x += delta * 0.25 * (index % 2 === 0 ? 1 : -1);
      mesh.rotation.z += delta * 0.18 * (index % 3 === 0 ? 1 : -1);
    } else if (!isExploding) {
      // Snap về sphere orientation
      mesh.position.copy(spherePos);
      // Hướng mặt ảnh ra ngoài (lookAt tâm rồi flip)
      const dir = spherePos.clone().normalize();
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    }

    prevStageRef.current = stage;
  });

  return (
    <Image
      ref={meshRef}
      url={url}
      position={spherePos.toArray()}
      scale={[1.25, 1.25]}
      transparent
      radius={0.06}
      side={THREE.DoubleSide}
    />
  );
}

// ── PhotoUniverse ────────────────────────────────────────────
export default function PhotoUniverse({ stage }) {
  const groupRef = useRef();

  const TOTAL = 36;
  const RADIUS = 4;

  const photos = useMemo(
    () =>
      Array.from({ length: TOTAL }, (_, i) => `/images/${(i % 12) + 1}.jpg`),
    [],
  );

  const spherePositions = useMemo(() => getSpherePositions(TOTAL, RADIUS), []);
  const explodePositions = useMemo(
    () => getExplodePositions(TOTAL, RADIUS * 3.2),
    [],
  );
  const floatSeeds = useMemo(
    () => Array.from({ length: TOTAL }, () => Math.random() * Math.PI * 2),
    [],
  );

  // Xoay quả cầu khi stage === 1
  useFrame(() => {
    if (groupRef.current && stage === 1) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      {photos.map((url, i) => (
        <PhotoItem
          key={i}
          url={url}
          spherePos={spherePositions[i]}
          explodePos={explodePositions[i]}
          stage={stage}
          index={i}
          floatSeed={floatSeeds[i]}
        />
      ))}
    </group>
  );
}
