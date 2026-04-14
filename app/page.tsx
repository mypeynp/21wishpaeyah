import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      backgroundColor: 'white',
      fontFamily: "'LINE Seed', sans-serif",
      margin: '0',
      padding: '0'
    }}>
      {/* รูป Welcome ตรงกลาง */}
      <img 
        src="/welcome.jpg" 
        alt="Welcome" 
        style={{ 
          width: '500px',       /* ปรับรูปให้ใหญ่ขึ้น */
          height: 'auto',      /* รักษา比例ของรูป */
          borderRadius: '0',   /* ลบขอบมนออก */
          boxShadow: 'none',   /* ลบเงาออก */
          display: 'block'     /* ป้องกันช่องว่างด้านล่างรูป */
        }} 
      />
      
      {/* ปุ่ม ENTER สีดำ */}
      <Link href="/photobooth">
        <button style={{ 
          marginTop: '30px', 
          color: 'black',        /* เปลี่ยนเป็นสีดำ */
          fontSize: '26px',     /* เพิ่มขนาดตัวอักษรนิดหน่อยให้รับกับรูป */
          background: 'none', 
          border: 'none', 
          cursor: 'pointer',
          fontWeight: 'bold',
          letterSpacing: '2px',  /* ระยะห่างตัวอักษรแบบ Minimal */
          outline: 'none',      /* ลบขอบเส้นเวลาโฟกัส */
          fontFamily: "'LINE Seed', sans-serif" /* บังคับใช้ฟอนต์ */
        }}>
          ENTER
        </button>
      </Link>
    </main>
  );
}