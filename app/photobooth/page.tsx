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
  
  // เพิ่ม State สำหรับจัดการ Filter
  const [tempImage, setTempImage] = useState<HTMLCanvasElement | null>(null);
  const [currentFilter, setCurrentFilter] = useState('none');

  const videoRef = useRef<HTMLVideoElement>(null);
  const photoAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const darkRed = "#8B0000";

  const filters = [
    { name: 'Original', value: 'none' },
    { name: 'B&W', value: 'grayscale(100%)' },
    { name: 'Sepia', value: 'sepia(100%)' },
    { name: 'Bright', value: 'brightness(1.2)' }
  ];

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

  // ปรับปรุงการถ่ายรูปให้เก็บเป็น Canvas ชั่วคราวก่อนเลือก Filter
  const takePhoto = () => {
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement('canvas');
      const targetW = 600; const targetH = 800;
      canvas.width = targetW; canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const vW = video.videoWidth; const vH = video.videoHeight;
        const videoAspect = vW / vH; const targetAspect = targetW / targetH;
        let sx, sy, sW, sH;
        if (videoAspect > targetAspect) {
          sW = vH * targetAspect; sH = vH; sx = (vW - sW) / 2; sy = 0;
        } else {
          sW = vW; sH = vW / targetAspect; sx = 0; sy = (vH - sH) / 2;
        }
        ctx.drawImage(video, sx, sy, sW, sH, 0, 0, targetW, targetH);
        setTempImage(canvas); // เก็บภาพดิบไว้ใน Temp
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const targetW = 600; const targetH = 800;
          canvas.width = targetW; canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const imgAspect = img.width / img.height;
            const targetAspect = targetW / targetH;
            let sx, sy, sw, sh;
            if (imgAspect > targetAspect) {
              sw = img.height * targetAspect; sh = img.height; sx = (img.width - sw) / 2; sy = 0;
            } else {
              sw = img.width; sh = img.width / targetAspect; sx = 0; sy = (img.height - sh) / 2;
            }
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
            setTempImage(canvas);
            setIsMenuOpen(false);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // ฟังก์ชันยืนยันการใช้ Filter
  const applyFilterAndSave = () => {
    if (tempImage && activeSlot !== null) {
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = 600; finalCanvas.height = 800;
      const ctx = finalCanvas.getContext('2d');
      if (ctx) {
        ctx.filter = currentFilter; // ใส่ Filter ตรงนี้
        ctx.drawImage(tempImage, 0, 0);
        const newImages = [...images];
        newImages[activeSlot] = finalCanvas.toDataURL('image/jpeg', 0.9);
        setImages(newImages);
        setTempImage(null);
        setCurrentFilter('none');
      }
    }
  };

  const downloadPhoto = async () => {
    if (photoAreaRef.current) {
      const canvas = await html2canvas(photoAreaRef.current, { scale: 3, useCORS: true, backgroundColor: "#ffffff" });
      const link = document.createElement('a');
      link.download = `21wish-photobooth.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 1.0);
      link.click();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', backgroundColor: 'white', minHeight: '100vh', fontFamily: "'LINE Seed', sans-serif" }}>
      
      <div style={{ marginBottom: '40px' }}>
        <Link href="/" style={{ textDecoration: 'none' }}><span style={{ color: 'black', fontWeight: 'bold', fontSize: '20px', letterSpacing: '2px' }}>HOME</span></Link>
      </div>

      <div style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
        {[1, 2, 3].map(n => (
          <button key={n} onClick={() => setSelectedFrame(`/frame${n}.png`)} style={{ padding: '8px 20px', borderRadius: '25px', border: `2px solid ${darkRed}`, backgroundColor: selectedFrame === `/frame${n}.png` ? darkRed : 'white', color: selectedFrame === `/frame${n}.png` ? 'white' : darkRed, fontWeight: 'bold' }}>FRAME {n}</button>
        ))}
      </div>

      <div ref={photoAreaRef} style={{ position: 'relative', width: '320px', height: '480px', backgroundColor: '#fff', overflow: 'hidden' }}>
        <img src={selectedFrame} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', height: '100%', padding: '15px', gap: '8px' }}>
          {images.map((img, index) => (
            <div key={index} onClick={() => openMenu(index)} style={{ backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
              {img ? <img src={img} style={{ width: '100%', height: '100%', display: 'block' }} /> : <span style={{ fontSize: '12px', color: '#bbb' }}>TAP TO ADD</span>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '35px', display: 'flex', flexDirection: 'column', gap: '12px', width: '320px' }}>
        <button onClick={downloadPhoto} style={{ padding: '16px', backgroundColor: darkRed, color: 'white', border: 'none', fontWeight: 'bold', fontSize: '18px' }}>DOWNLOAD</button>
      </div>

      {/* --- Filter Preview UI --- */}
      {tempImage && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'white', zIndex: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <h3 style={{ marginBottom: '20px' }}>CHOOSE FILTER</h3>
          <div style={{ width: '240px', height: '320px', overflow: 'hidden', marginBottom: '30px', border: '4px solid #f0f0f0' }}>
            <img 
              src={tempImage.toDataURL()} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: currentFilter }} 
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {filters.map(f => (
              <button key={f.name} onClick={() => setCurrentFilter(f.value)} style={{ padding: '10px 15px', border: `1px solid ${darkRed}`, backgroundColor: currentFilter === f.value ? darkRed : 'white', color: currentFilter === f.value ? 'white' : darkRed, fontWeight: 'bold' }}>{f.name}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '20px', width: '100%', maxWidth: '320px' }}>
            <button onClick={() => setTempImage(null)} style={{ flex: 1, padding: '15px', background: '#eee', border: 'none', fontWeight: 'bold' }}>CANCEL</button>
            <button onClick={applyFilterAndSave} style={{ flex: 1, padding: '15px', background: darkRed, color: 'white', border: 'none', fontWeight: 'bold' }}>DONE</button>
          </div>
        </div>
      )}

      {/* Popups & Camera (เหมือนเดิม) */}
      {isMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }} onClick={() => setIsMenuOpen(false)}>
          <div style={{ backgroundColor: 'white', width: '100%', padding: '30px 20px', borderRadius: '20px 20px 0 0', display: 'flex', flexDirection: 'column', gap: '12px' }} onClick={e => e.stopPropagation()}>
            <button onClick={openCamera} style={{ padding: '16px', backgroundColor: '#f0f0f0', border: 'none', fontWeight: 'bold' }}>📷 TAKE PHOTO</button>
            <button onClick={() => fileInputRef.current?.click()} style={{ padding: '16px', backgroundColor: '#f0f0f0', border: 'none', fontWeight: 'bold' }}>📁 UPLOAD</button>
            <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
            <button onClick={() => setIsMenuOpen(false)} style={{ padding: '10px', background: 'none', border: 'none', color: '#999' }}>CANCEL</button>
          </div>
        </div>
      )}

      {isCamOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'black', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '90vw', maxWidth: '400px', aspectRatio: '3/4', border: '2px solid white' }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ marginTop: '40px', display: 'flex', gap: '40px' }}>
            <button onClick={takePhoto} style={{ width: '70px', height: '70px', borderRadius: '50%', border: '5px solid white', backgroundColor: darkRed }} />
            <button onClick={stopCamera} style={{ color: 'white', background: 'none', border: 'none', fontSize: '30px' }}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}