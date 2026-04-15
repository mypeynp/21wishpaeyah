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
  
  // เก็บค่าฟิลเตอร์ที่จะใช้กับทุกรูปพร้อมกัน
  const [globalFilter, setGlobalFilter] = useState('none');

  const videoRef = useRef<HTMLVideoElement>(null);
  const photoAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const darkRed = "#8B0000";

  const filterOptions = [
    { name: 'Original', value: 'none' },
    { name: 'B&W', value: 'grayscale(100%)' },
    { name: 'Sepia', value: 'sepia(100%)' },
    { name: 'Warm', value: 'sepia(30%) brightness(1.1)' },
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

  const takePhoto = () => {
    const video = videoRef.current;
    if (video && activeSlot !== null) {
      const canvas = document.createElement('canvas');
      const targetW = 600; const targetH = 800;
      canvas.width = targetW; canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const vW = video.videoWidth; const vH = video.videoHeight;
        const aspect = vW / vH; const targetAspect = targetW / targetH;
        let sx, sy, sw, sh;
        if (aspect > targetAspect) {
          sw = vH * targetAspect; sh = vH; sx = (vW - sw) / 2; sy = 0;
        } else {
          sw = vW; sh = vW / targetAspect; sx = 0; sy = (vH - sh) / 2;
        }
        ctx.drawImage(video, sx, sy, sw, sh, 0, 0, targetW, targetH);
        const newImages = [...images];
        newImages[activeSlot] = canvas.toDataURL('image/jpeg', 0.9);
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
          const targetW = 600; const targetH = 800;
          canvas.width = targetW; canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const aspect = img.width / img.height; const targetAspect = targetW / targetH;
            let sx, sy, sw, sh;
            if (aspect > targetAspect) {
              sw = img.height * targetAspect; sh = img.height; sx = (img.width - sw) / 2; sy = 0;
            } else {
              sw = img.width; sh = img.width / targetAspect; sx = 0; sy = (img.height - sh) / 2;
            }
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
            const newImages = [...images];
            newImages[activeSlot] = canvas.toDataURL('image/jpeg', 0.9);
            setImages(newImages);
          }
        };
        img.src = reader.result as string;
        setIsMenuOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- ฟังก์ชันดาวน์โหลด: แก้ให้ Filter ติดแค่รูป ไม่ติดเฟรม ---
  const downloadPhoto = async () => {
    if (photoAreaRef.current) {
      // 1. ถ่ายรูปพื้นที่ทั้งหมดแบบ "ดิบ" (ยังไม่มีฟิลเตอร์)
      const canvas = await html2canvas(photoAreaRef.current, { scale: 3, useCORS: true, backgroundColor: "#ffffff" });
      
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = canvas.width;
      finalCanvas.height = canvas.height;
      const ctx = finalCanvas.getContext('2d');

      if (ctx) {
        // 2. วาดส่วนที่เป็น "รูปภาพ" โดยใส่ฟิลเตอร์
        // เราจะวาด canvas เดิมลงไปก่อนแต่ใช้ Filter
        ctx.filter = globalFilter;
        ctx.drawImage(canvas, 0, 0);

        // 3. วาด "เฟรม" ทับข้างบนอีกรอบแบบ "ไม่มีฟิลเตอร์"
        // วิธีนี้จะทำให้เฟรมกลับมาสีปกติ แต่รูปข้างล่างโดนฟิลเตอร์ไปแล้ว
        ctx.filter = 'none';
        const frameImg = new Image();
        frameImg.crossOrigin = "anonymous";
        frameImg.onload = () => {
          ctx.drawImage(frameImg, 0, 0, finalCanvas.width, finalCanvas.height);
          
          // 4. ดาวน์โหลด
          const link = document.createElement('a');
          link.download = `photobooth-21wish.jpg`;
          link.href = finalCanvas.toDataURL('image/jpeg', 1.0);
          link.click();
        };
        frameImg.src = selectedFrame;
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', backgroundColor: 'white', minHeight: '100vh', fontFamily: "'LINE Seed', sans-serif" }}>
      
      <div style={{ marginBottom: '30px' }}>
        <Link href="/" style={{ textDecoration: 'none' }}><span style={{ color: 'black', fontWeight: 'bold', fontSize: '20px', letterSpacing: '2px' }}>HOME</span></Link>
      </div>

      <div style={{ marginBottom: '25px', display: 'flex', gap: '8px' }}>
        {[1, 2, 3].map(n => (
          <button key={n} onClick={() => setSelectedFrame(`/frame${n}.png`)} style={{ padding: '8px 16px', borderRadius: '25px', border: `2px solid ${darkRed}`, backgroundColor: selectedFrame === `/frame${n}.png` ? darkRed : 'white', color: selectedFrame === `/frame${n}.png` ? 'white' : darkRed, fontWeight: 'bold', fontSize: '13px' }}>FRAME {n}</button>
        ))}
      </div>

      {/* Photobooth Area */}
      <div ref={photoAreaRef} style={{ position: 'relative', width: '300px', height: '450px', backgroundColor: '#fff', overflow: 'hidden' }}>
        {/* เลเยอร์เฟรม (แสดงบนหน้าจอ) */}
        <img src={selectedFrame} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }} />
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', height: '100%', padding: '12px', gap: '6px' }}>
          {images.map((img, index) => (
            <div key={index} onClick={() => openMenu(index)} style={{ backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
              {img ? (
                <img 
                  src={img} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'block', 
                    objectFit: 'cover',
                    filter: globalFilter // แสดงฟิลเตอร์บนหน้าจอทันทีทุกรูป
                  }} 
                />
              ) : (
                <span style={{ fontSize: '10px', color: '#ccc' }}>TAP</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* เลือก Filter ครั้งเดียวเปลี่ยนทุกรูป */}
      <div style={{ marginTop: '25px', width: '300px' }}>
        <p style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>FILTER ALL PHOTOS</p>
        <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', justifyContent: 'center', paddingBottom: '10px' }}>
          {filterOptions.map(f => (
            <button 
              key={f.name} 
              onClick={() => setGlobalFilter(f.value)}
              style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: globalFilter === f.value ? 'black' : '#f0f0f0', color: globalFilter === f.value ? 'white' : 'black', border: 'none', fontWeight: 'bold' }}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      <button onClick={downloadPhoto} style={{ marginTop: '10px', width: '300px', padding: '16px', backgroundColor: darkRed, color: 'white', border: 'none', fontWeight: 'bold', fontSize: '16px' }}>DOWNLOAD</button>

      {/* Popups */}
      {isMenuOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }} onClick={() => setIsMenuOpen(false)}>
          <div style={{ backgroundColor: 'white', width: '100%', padding: '25px', borderRadius: '20px 20px 0 0' }} onClick={e => e.stopPropagation()}>
            <button onClick={openCamera} style={{ width: '100%', padding: '15px', marginBottom: '10px', backgroundColor: '#f0f0f0', border: 'none', fontWeight: 'bold' }}>📷 TAKE PHOTO</button>
            <button onClick={() => fileInputRef.current?.click()} style={{ width: '100%', padding: '15px', backgroundColor: '#f0f0f0', border: 'none', fontWeight: 'bold' }}>📁 UPLOAD</button>
            <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
          </div>
        </div>
      )}

      {isCamOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'black', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <video ref={videoRef} autoPlay playsInline style={{ width: '90vw', maxWidth: '400px', aspectRatio: '3/4', objectFit: 'cover', border: '2px solid white' }} />
          <div style={{ marginTop: '30px', display: 'flex', gap: '30px', alignItems: 'center' }}>
            <button onClick={takePhoto} style={{ width: '70px', height: '70px', borderRadius: '50%', border: '5px solid white', backgroundColor: darkRed }} />
            <button onClick={stopCamera} style={{ color: 'white', background: 'none', border: 'none', fontSize: '24px' }}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}