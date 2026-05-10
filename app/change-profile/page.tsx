'use client';

import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import Link from 'next/link';

export default function ChangeProfile() {
  const [image, setImage] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const darkRed = "#8B0000";

  // ฟังก์ชันจัดการรูปภาพให้เป็นสี่เหลี่ยมจัตุรัส (Auto Center-Crop)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = Math.min(img.width, img.height); // หาด้านที่สั้นที่สุด
          canvas.width = 800; // กำหนดขนาดมาตรฐานให้ชัด
          canvas.height = 800;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            // คำนวณเพื่อตัดจากกึ่งกลางรูป
            const sourceX = (img.width - size) / 2;
            const sourceY = (img.height - size) / 2;
            
            ctx.drawImage(
              img, 
              sourceX, sourceY, size, size, // ตัดรูปจากกลาง
              0, 0, 800, 800 // วางลงใน canvas 1:1
            );
            setImage(canvas.toDataURL('image/jpeg', 0.9));
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, { 
      useCORS: true,
      scale: 3, 
      backgroundColor: "#ffffff"
    });
    const data = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = data;
    link.download = 'paeyah-profile.png';
    link.click();
  };

  return (
    <main style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      minHeight: '100vh', backgroundColor: 'white', fontFamily: "'LINE Seed', sans-serif", padding: '20px'
    }}>
      
      <nav style={{ marginBottom: '40px' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{ color: 'black', fontWeight: 'bold', fontSize: '24px', letterSpacing: '2px' }}>HOME</span>
        </Link>
      </nav>

      <div 
        ref={printRef}
        style={{ 
          position: 'relative', width: '320px', height: '320px', 
          backgroundColor: '#f5f5f5', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.1)'
        }}
      >
        {image && (
          <img 
            src={image} 
            alt="User" 
            style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} 
          />
        )}
        <img 
          src="/frame.png" 
          alt="Frame" 
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} 
        />
      </div>

      <div style={{ marginTop: '40px', width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label style={{
          display: 'block', padding: '14px', border: `2px solid ${darkRed}`, textAlign: 'center',
          cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', backgroundColor: 'white', color: darkRed
        }}>
          UPLOAD PHOTO
          <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
        </label>
        
        <button onClick={handleDownload} style={{
          padding: '16px', backgroundColor: darkRed, color: 'white', border: 'none',
          fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', letterSpacing: '2px'
        }}>
          SAVE IMAGE
        </button>
      </div>
    </main>
  );
}