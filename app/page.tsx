import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', // ใช้ minHeight แทน height เพื่อป้องกันปัญหาจอเล็กมากแล้วเนื้อหาล้น
      backgroundColor: 'white',
      fontFamily: "'LINE Seed', sans-serif",
      margin: '0',
      padding: '20px' // เพิ่ม padding เล็กน้อยเพื่อไม่ให้รูปชิดขอบจอเกินไปในมือถือ
    }}>
      {/* รูป Welcome ตรงกลาง */}
      <div style={{ width: '100%', maxWidth: '500px', display: 'flex', justifyContent: 'center' }}>
        <img 
          src="/welcome.jpg" 
          alt="Welcome" 
          style={{ 
            width: '100%',        /* บังคับให้ขยายเต็มความกว้างของ Container */
            height: 'auto',       /* รักษาอัตราส่วนรูปภาพ */
            maxWidth: '500px',    /* ขนาดใหญ่ที่สุดที่ยอมให้แสดง (เท่าเดิมที่คุณตั้งไว้) */
            borderRadius: '0', 
            boxShadow: 'none', 
            display: 'block'
          }} 
        />
      </div>
      
      {/* ปุ่ม ENTER สีดำ */}
      <Link href="/photobooth">
        <button style={{ 
          marginTop: '30px', 
          color: 'black', 
          fontSize: '26px', 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer',
          fontWeight: 'bold',
          letterSpacing: '2px',
          outline: 'none',
          fontFamily: "'LINE Seed', sans-serif"
        }}>
          ENTER
        </button>
      </Link>
    </main>
  );
}