import React, { useRef, useState, useEffect, useCallback } from "react";
import styles from "./CollageScreen.module.css";

const MAX_PHOTOS = 12;

// Trình tự lời bài hát trích xuất từ file bgm.mp3 và video
// Trình tự lời bài hát trích xuất từ file bgm.mp3 và video
const LYRICS = [
  '"Ngày ta nắm tay yêu công khai giữa đời"',
  '"Là ngày thế giới mất hai nỗi buồn"',
  '"Cả kiếp này anh có được em là siêu đẳng cấp rồi"',
  '"Ah em xinh ngoan yêu em số một trên thế giới"',
  '"Làm gì có được ai thế thay"',
  '"Tay trong tay đưa em đi ngắm hoàng hôn kéo tới"',
  '"Em cười vẽ trời thêm màu thơ"',
  '"Như bao bông hoa tươi em còn hơn cả thế"',
  '"Vì em xinh số một trên thế giới"',
  '"Ánh mắt em hiền là muốn đến hôn lên liền trời ơi"',
];

export default function CollageScreen({ onNext }) {
  const [photos, setPhotos] = useState([]);
  const [lyricIdx, setLyricIdx] = useState(0);
  const [lyricVisible, setLyricVisible] = useState(true);
  const [viewMode, setViewMode] = useState("sphere");
  const inputRef = useRef(null);
  const sphereRef = useRef(null);
  const dragRef = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    rotX: 15,
    rotY: 0,
  });
  const rotRef = useRef({ x: 15, y: 0, velX: 0, velY: 0.18 });

  // Lyric cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setLyricVisible(false);
      setTimeout(() => {
        setLyricIdx((i) => (i + 1) % LYRICS.length);
        setLyricVisible(true);
      }, 500);
    }, 2500); // Tốc độ chuyển lời bài hát 3.5s/câu
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate sphere
  useEffect(() => {
    if (viewMode !== "sphere") return;
    let raf;
    function tick() {
      if (!dragRef.current.dragging) {
        rotRef.current.y += rotRef.current.velY;
        rotRef.current.x += rotRef.current.velX;
        rotRef.current.x = Math.max(-40, Math.min(40, rotRef.current.x));
        rotRef.current.velX *= 0.97;
        updateSpherePositions();
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [viewMode, photos]);

  function updateSpherePositions() {
    const container = sphereRef.current;
    if (!container) return;
    const items = container.querySelectorAll("[data-idx]");
    const n = items.length;
    if (n === 0) return;
    const rx = (rotRef.current.x * Math.PI) / 180;
    const ry = (rotRef.current.y * Math.PI) / 180;
    items.forEach((el, i) => {
      const phi = Math.acos(-1 + (2 * i) / n);
      const theta = Math.sqrt(n * Math.PI) * phi;
      const x0 = Math.sin(phi) * Math.cos(theta);
      const y0 = Math.cos(phi);
      const z0 = Math.sin(phi) * Math.sin(theta);
      const y1 = y0 * Math.cos(rx) - z0 * Math.sin(rx);
      const z1 = y0 * Math.sin(rx) + z0 * Math.cos(rx);
      const x2 = x0 * Math.cos(ry) + z1 * Math.sin(ry);
      const z2 = -x0 * Math.sin(ry) + z1 * Math.cos(ry);
      const radius = Math.min(window.innerWidth, window.innerHeight) * 0.3;
      const scale = (z2 + 1.8) / 2.8;
      const opacity = Math.max(0.15, (z2 + 1.2) / 2.2);
      el.style.transform = `translate3d(${x2 * radius}px, ${y1 * radius}px, ${z2 * 100}px) scale(${scale * 0.85})`;
      el.style.opacity = opacity;
      el.style.zIndex = Math.round(z2 * 100 + 100);
    });
  }

  const onPointerDown = useCallback((e) => {
    dragRef.current.dragging = true;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!dragRef.current.dragging) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    rotRef.current.y += dx * 0.4;
    rotRef.current.velX = dy * 0.05;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    updateSpherePositions();
  }, []);

  const onPointerUp = useCallback(() => {
    dragRef.current.dragging = false;
    rotRef.current.velY = 0.18;
  }, []);

  function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    const urls = files
      .slice(0, MAX_PHOTOS - photos.length)
      .map((f) => URL.createObjectURL(f));
    setPhotos((prev) => [...prev, ...urls].slice(0, MAX_PHOTOS));
    e.target.value = "";
  }

  function removePhoto(i) {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleNext() {
    window.__spawnHearts?.();
    setTimeout(onNext, 400);
  }

  const slots = [
    ...photos,
    ...Array(Math.max(0, MAX_PHOTOS - photos.length)).fill(null),
  ];

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <span className={styles.tag}>"Aaa em xinh ngoan yêu em số 1"</span>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleBtn} ${viewMode === "sphere" ? styles.active : ""}`}
            onClick={() => setViewMode("sphere")}
          >
            Khối 3D
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === "grid" ? styles.active : ""}`}
            onClick={() => setViewMode("grid")}
          >
            Lưới Oval
          </button>
        </div>
      </div>

      {viewMode === "sphere" && (
        <div
          className={styles.sphereWrap}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          <div className={styles.sphereAura} />
          <div
            className={styles.sphere}
            ref={sphereRef}
            style={{ perspective: "800px" }}
          >
            {slots.map((src, i) => (
              <div key={i} data-idx={i} className={styles.sphereItem}>
                {src ? (
                  <>
                    <img src={src} alt="" className={styles.sphereImg} />
                    <button
                      className={styles.removeBtn}
                      onClick={() => removePhoto(i)}
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <button
                    className={styles.addSphereBtn}
                    onClick={() => inputRef.current?.click()}
                  >
                    <span>+</span>
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className={styles.dragHint}>✦ Kéo để xoay ảnh ✦</p>
        </div>
      )}

      {viewMode === "grid" && (
        <div className={styles.gridWrap}>
          <div className={styles.ovalOuter}>
            <div className={styles.ring1} />
            <div className={styles.ring2} />
            <div className={styles.ring3} />
            <div className={styles.oval}>
              <div className={styles.grid}>
                {slots.map((src, i) => (
                  <div key={i} className={styles.cell}>
                    {src ? (
                      <>
                        <img src={src} alt="" className={styles.img} />
                        <button
                          className={styles.removeBtn}
                          onClick={() => removePhoto(i)}
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <button
                        className={styles.addBtn}
                        onClick={() => inputRef.current?.click()}
                      >
                        <span className={styles.plus}>+</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.ovalGlow} />
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
      />

      <div
        className={`${styles.lyricWrap} ${lyricVisible ? styles.lyricIn : styles.lyricOut}`}
      >
        <p className={styles.lyric}>{LYRICS[lyricIdx]}</p>
      </div>

      <button className={styles.nextBtn} onClick={handleNext}>
        Đọc thư 💌
      </button>
    </div>
  );
}
