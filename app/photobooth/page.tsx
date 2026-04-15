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
  
  // State สำหรับจัดการภาพชั่วคราวและฟิลเตอร์ก่อนตกลง
  const [tempImageData, setTempImageData] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState('none');

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

  // ถ่ายภาพแล้วเก็บไว้ใน Temp ก่อนเลือกฟิลเตอร์
  const takePhoto = () => {
    const video = videoRef.current;
    if (video) {
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
        setTempImageData(canvas.toDataURL('image/jpeg', 0.9));
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
            const aspect = img.width / img.height; const targetAspect = targetW / targetH;
            let sx, sy, sw, sh;
            if (aspect > targetAspect) {
              sw = img.height * targetAspect; sh = img.height; sx = (img.width - sw) / 2; sy = 0;
            } else {
              sw = img.width; sh = img.width / targetAspect; sx = 0; sy = (img.height - sh) / 2;
            }
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
            setTempImageData(canvas.toDataURL('image/jpeg', 0.9));
            setIsMenuOpen(false);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // บันทึกฟิลเตอร์ลงในเนื้อรูปจริงก่อนเอาลงตู้
  const applyFilterToImage = () => {
    if (tempImageData && activeSlot !== null) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 600; canvas.height = 800;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.filter = currentFilter; // ฝัง Filter ลงไปที่นี่
          ctx.drawImage(img, 0, 0);
          const newImages = [...images];
          newImages[activeSlot] = canvas.toDataURL('image/jpeg', 0.9);
          setImages(newImages);
          setTempImageData(null);
          setCurrentFilter('none');
        }
      };
      img.src = tempImageData;
    }
  };

  const downloadPhoto = async () => {
    if (photoAreaRef.current) {
      const canvas = await html2canvas(photoAreaRef.current, { scale: 3, useCORS: true, backgroundColor: "#ffffff" });
      const link = document.createElement('a');
      link.download = `photobooth.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 1.0);
      link.click();
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

      <div ref={photoAreaRef} style={{ position: 'relative', width: '300px', height: '450px', backgroundColor: '#fff', overflow: 'hidden' }}>
        <img src={selectedFrame} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', height: '100%', padding: '12px', gap: '6px' }}>
          {images.map((img, index) => (
            <div key={index} onClick={() => openMenu(index)} style={{ backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
              {img ? <img src={img} style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} /> : <span style={{ fontSize: '10px', color: '#ccc' }}>TAP</span>}
            </div>
          ))}
        </div>
      </div>

      <button onClick={downloadPhoto} style={{ marginTop: '30px', width: '300px', padding: '16px', backgroundColor: darkRed, color: 'white', border: 'none', fontWeight: 'bold', fontSize: '16px' }}>DOWNLOAD</button>

      {/* --- ป๊อปอัพเลือก Filter หลังถ่าย/อัปโหลด (ตัวที่ทำให้ Filter ติดแค่ในรูป) --- */}
      {tempImageData && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'white', zIndex: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '15px' }}>PREVIEW & FILTER</p>
          <div style={{ width: '240px', height: '320px', backgroundColor: '#eee', marginBottom: '20px', overflow: 'hidden' }}>
            <img src={tempImageData} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: currentFilter }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '30px' }}>
            {filterOptions.map(f => (
              <button key={f.name} onClick={() => setCurrentFilter(f.value)} style={{ padding: '8px 12px', border: `1px solid ${darkRed}`, backgroundColor: currentFilter === f.value ? darkRed : 'white', color: currentFilter === f.value ? 'white' : darkRed, fontSize: '12px', fontWeight: 'bold' }}>{f.name}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '15px', width: '100%', maxWidth: '300px' }}>
            <button onClick={() => setTempImageData(null)} style={{ flex: 1, padding: '12px', background: '#eee', border: 'none', fontWeight: 'bold' }}>CANCEL</button>
            <button onClick={applyFilterToImage} style={{ flex: 1, padding: '12px', background: darkRed, color: 'white', border: 'none', fontWeight: 'bold' }}>ADD TO FRAME</button>
          </div>
        </div>
      )}

      {/* Menu & Camera Popups */}
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