import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      backgroundColor: 'white',
      fontFamily: "'LINE Seed', sans-serif",
      margin: '0',
      padding: '20px'
    }}>
      {/* รูป Welcome */}
      <div style={{ width: '100%', maxWidth: '500px', display: 'flex', justifyContent: 'center' }}>
        <img 
          src="/welcome.jpg" 
          alt="Welcome" 
          style={{ width: '100%', height: 'auto', maxWidth: '500px', display: 'block' }} 
        />
      </div>
      
      {/* ปุ่ม PHOTOBOOTH */}
      <Link href="/photobooth">
        <button style={buttonStyle}>PHOTOBOOTH</button>
      </Link>

      {/* ปุ่ม CHANGE PROFILE */}
      <Link href="/change-profile">
        <button style={{ ...buttonStyle, marginTop: '10px', fontSize: '20px' }}>
          CHANGE PROFILE
        </button>
      </Link>
    </main>
  );
}

const buttonStyle = {
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
};