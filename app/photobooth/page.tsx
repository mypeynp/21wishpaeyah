"use client";
import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import Link from 'next/link';

export default function Photobooth() {
  const [selectedFrame, setSelectedFrame] = useState('/frame1.png');
  const [images, setImages] = useState<(string | null)[]>([null, null, null, null]);
  const [isCamOpen, setIsCamOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const darkRed = "#8B0000";

  const openMenu = (index: number) => {
    setActiveSlot(index);
    setIsMenuOpen(true);
  };

  const openCamera = async () => {
    setIsMenuOpen(false);
    setIsCamOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("ไม่สามารถเข้าถึงกล้องได้");
      setIsCamOpen(false);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsCamOpen(false);
  };

  const takePhoto = () => {
    const video = videoRef.current;
    if (video && activeSlot !== null) {
      const canvas = document.createElement('canvas');
      const outputWidth = 600;
      const outputHeight = 800;
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const vH = video.videoHeight;
        const vW = video.videoWidth;
        const tW = vH * (outputWidth / outputHeight);
        const sx = (vW - tW) / 2;
        ctx.drawImage(video, sx, 0, tW, vH, 0, 0, outputWidth, outputHeight);
        const newImages = [...images];
        newImages[activeSlot] = canvas.toDataURL('image/jpeg');
        setImages(newImages);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeSlot !== null) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const outputWidth = 600;
          const outputHeight = 800;
          canvas.width = outputWidth;
          canvas.height = outputHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const imgAspect = img.width / img.height;
            const targetAspect = outputWidth / outputHeight;
            let sx, sy, sw, sh;
            if (imgAspect > targetAspect) {
              sw = img.height * targetAspect;
              sh = img.height;
              sx = (img.width - sw) / 2;
              sy = 0;
            } else {
              sw = img.width;
              sh = img.width / targetAspect;
              sx = 0;
              sy = (img.height - sh) / 2;
            }
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outputWidth, outputHeight);
            const newImages = [...images];
            newImages[activeSlot] = canvas.toDataURL('image/jpeg');
            setImages(newImages);
          }
        };
        img.src = reader.result as string;
        setIsMenuOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadPhoto = async () => {
    if (photoAreaRef.current) {
      const canvas = await html2canvas(photoAreaRef.current, { 
        scale: 3, 
        useCORS: true,
        backgroundColor: "#ffffff" 
      });
      const link = document.createElement('a');
      link.download = `21wish-photobooth.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 1.0);
      link.click();
    }
  };

  const sharePhoto = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: '21WISH Photobooth', url: window.location.href });
      } catch (err) { console.log(err); }
    } else { alert("ไม่รองรับการแชร์"); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', backgroundColor: 'white', minHeight: '100vh', fontFamily: "'LINE Seed', sans-serif" }}>
      
      {/* ปุ่ม HOME อยู่ตรงกลาง และเว้นระยะด้านล่าง */}
      <div style={{ marginBottom: '40px' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ color: 'black', fontWeight: 'bold', fontSize: '20px', cursor: 'pointer', letterSpacing: '2px' }}>
            HOME
          </span>
        </Link>
      </div>

      {/* เลือกกรอบ และเว้นระยะนิดหน่อยก่อนถึงตู้สติ๊กเกอร์ */}
      <div style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
        {[1, 2, 3].map(n => (
          <button key={n} onClick={() => setSelectedFrame(`/frame${n}.png`)} style={{ padding: '8px 20px', borderRadius: '25px', border: `2px solid ${darkRed}`, backgroundColor: selectedFrame === `/frame${n}.png` ? darkRed : 'white', color: selectedFrame === `/frame${n}.png` ? 'white' : darkRed, fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>
            FRAME {n}
          </button>
        ))}
      </div>

      {/* Capture Area */}
      <div ref={photoAreaRef} style={{ position: 'relative', width: '320px', height: '480px', backgroundColor: '#fff', overflow: 'hidden' }}>
        <img src={selectedFrame} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', height: '100%', padding: '15px', gap: '8px' }}>
          {images.map((img, index) => (
            <div key={index} onClick={() => openMenu(index)} style={{ backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', borderRadius: '0' }}>
              {img ? (
                <img src={img} style={{ width: '100%', height: '100%', display: 'block' }} />
              ) : (
                <span style={{ fontSize: '12px', color: '#bbb' }}>TAP TO ADD</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ปุ่มกดด้านล่าง */}
      <div style={{ marginTop: '35px', display: 'flex', flexDirection: 'column', gap: '12px', width: '320px' }}>
        <button onClick={downloadPhoto} style={{ padding: '16px', backgroundColor: darkRed, color: 'white', border: 'none', borderRadius: '0', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }}>
          DOWNLOAD
        </button>
        <button onClick={sharePhoto} style={{ padding: '12px', backgroundColor: 'transparent', color: darkRed, border: `2px solid ${darkRed}`, borderRadius: '0', fontWeight: 'bold', cursor: 'pointer' }}>
          SHARE
        </button>
      </div>

      {/* Popup Menu & Camera UI (เหมือนเดิม) */}
      {isMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }} onClick={() => setIsMenuOpen(false)}>
          <div style={{ backgroundColor: 'white', width: '100%', padding: '30px 20px', borderRadius: '20px 20px 0 0', display: 'flex', flexDirection: 'column', gap: '12px' }} onClick={e => e.stopPropagation()}>
            <button onClick={openCamera} style={{ padding: '16px', borderRadius: '0', border: 'none', backgroundColor: '#f0f0f0', fontSize: '16px', fontWeight: 'bold' }}>📷 เปิดกล้องถ่ายรูป</button>
            <button onClick={() => fileInputRef.current?.click()} style={{ padding: '16px', borderRadius: '0', border: 'none', backgroundColor: '#f0f0f0', fontSize: '16px', fontWeight: 'bold' }}>📁 เลือกรูปจากเครื่อง</button>
            {images[activeSlot!] && (
              <button onClick={() => { const n = [...images]; n[activeSlot!] = null; setImages(n); setIsMenuOpen(false); }} style={{ padding: '16px', borderRadius: '0', border: 'none', backgroundColor: '#fff0f0', color: 'red', fontWeight: 'bold' }}>🗑️ ลบรูปนี้</button>
            )}
            <button onClick={() => setIsMenuOpen(false)} style={{ marginTop: '5px', color: '#999', border: 'none', background: 'none' }}>ยกเลิก</button>
            <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
          </div>
        </div>
      )}

      {isCamOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'black', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '90vw', maxWidth: '400px', aspectRatio: '3/4', border: '2px solid white' }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '40px' }}>
            <button onClick={takePhoto} style={{ width: '70px', height: '70px', borderRadius: '50%', border: '5px solid white', backgroundColor: darkRed }} />
            <button onClick={stopCamera} style={{ color: 'white', background: 'none', border: 'none', fontSize: '30px' }}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}