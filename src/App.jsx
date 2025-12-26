import React, { useState, useEffect } from 'react';
import './App.css';

// Import file konfigurasi
import { supabase } from './supabaseClient';
import { encryptPassword, decryptPassword } from './utils/crypto';

function App() {
  // --- STATE UNTUK AUTH (LOGIN) ---
  const [session, setSession] = useState(null); 
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [loading, setLoading] = useState(true);

  // --- STATE UNTUK PASSWORD MANAGER ---
  const [vaults, setVaults] = useState([]); 
  const [appName, setAppName] = useState('');
  const [username, setUsername] = useState('');
  const [plainPassword, setPlainPassword] = useState(''); 

  // --- CEK SESI SAAT APP DIJALANKAN ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listener jika status login berubah
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- AMBIL DATA DARI DATABASE ---
  const fetchVaults = async () => {
    if (!session) return;
    
    const { data, error } = await supabase
      .from('vaults')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching:", error);
    } else {
      setVaults(data);
    }
  };

  // Refresh data setiap kali user login/logout
  useEffect(() => {
    if (session) fetchVaults();
    else setVaults([]);
  }, [session]);

  // --- FUNGSI LOGIN & REGISTER ---
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    if (error) alert("Gagal Login: " + error.message);
  };

  const handleRegister = async () => {
    const { error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
    if (error) alert("Gagal Daftar: " + error.message);
    else alert("Pendaftaran berhasil! Silakan cek email atau login langsung.");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- FUNGSI LUPA PASSWORD (BARU DITAMBAHKAN) ---
  const handleForgotPassword = async () => {
    if (!authEmail) {
      alert("Masukkan email Anda terlebih dahulu.");
      return;
    }
    
    // 'redirectTo' adalah link tempat user akan dibawa setelah klik link di email
    const { error } = await supabase.auth.resetPasswordForEmail(authEmail, {
      redirectTo: 'http://localhost:5173', // Pastikan sesuai dengan port local Anda
    });

    if (error) alert("Gagal mengirim link reset: " + error.message);
    else alert("Link reset password telah dikirim ke email Anda!");
  };

  // --- FUNGSI TAMBAH & HAPUS PASSWORD ---
    // --- FUNGSI TAMBAH & HAPUS PASSWORD ---
  const handleAddPassword = async (e) => {
    e.preventDefault();
    
    const encryptedPass = encryptPassword(plainPassword);

    // PENTING: Ambil ID user yang sedang login dari session
    const userId = session.user.id; 

    const { error } = await supabase
      .from('vaults')
      .insert([{ 
        app_name: appName, 
        username: username, 
        encrypted_password: encryptedPass,
        user_id: userId  // <--- TAMBahkan baris ini WAJIB!
      }]);

    if (error) {
      console.error(error); // Cek console browser untuk detail error
      alert("Gagal simpan: " + error.message);
    } else {
      setAppName('');
      setUsername('');
      setPlainPassword('');
      fetchVaults(); 
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Hapus data ini?")) return;
    const { error } = await supabase.from('vaults').delete().eq('id', id);
    if (!error) fetchVaults();
  };

  // --- FUNGSI SALIN & DEKRIPSI ---
  const handleCopy = (ciphertext) => {
    const realPass = decryptPassword(ciphertext);
    navigator.clipboard.writeText(realPass);
    alert("Password asli disalin!");
  };

  // --- TAMPILAN UI ---
  if (loading) return <div style={{textAlign:'center', marginTop:50}}>Loading...</div>;

  // TAMPILAN JIKA BELUM LOGIN (Termasuk Tombol Lupa Password)
  if (!session) {
    return (
      <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
        <h2 style={{textAlign:'center'}}>Password Manager</h2>
        <div style={{marginBottom:10}}>
          <label>Email:</label>
          <input type="email" placeholder="Email" style={{width:'100%', padding:8}}
            value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} />
        </div>
        <div style={{marginBottom:5}}>
          <label>Password:</label>
          <input type="password" placeholder="Password" style={{width:'100%', padding:8}}
            value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} />
        </div>
        
        {/* TOMBOL LUPA PASSWORD */}
        <div style={{textAlign:'right', marginBottom:'20px', fontSize:'0.9em'}}>
          <span 
            onClick={handleForgotPassword} 
            style={{cursor:'pointer', color:'#007bff', textDecoration:'underline'}}
          >
            Lupa Password?
          </span>
        </div>

        <div style={{display:'flex', gap:10}}>
          <button onClick={handleLogin} style={{flex:1, padding:10, background:'#007bff', color:'white', border:'none', borderRadius:4}}>Login</button>
          <button onClick={handleRegister} style={{flex:1, padding:10, background:'#28a745', color:'white', border:'none', borderRadius:4}}>Daftar</button>
        </div>
      </div>
    );
  }

  // TAMPILAN DASHBOARD
  return (
    <div style={{ maxWidth: 800, margin: 20, fontFamily:'Arial' }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
        <h2>Halo, {session.user.email}</h2>
        <button onClick={handleLogout} style={{padding:8, background:'#dc3545', color:'white', border:'none', borderRadius:4}}>Logout</button>
      </div>

      {/* Form Input */}
      <form onSubmit={handleAddPassword} style={{background:'#f9f9f9', padding:20, borderRadius:8, marginBottom:20, display:'grid', gap:10}}>
        <h3>Tambah Password Baru</h3>
        <input placeholder="Nama Aplikasi (misal: Facebook)" required style={{padding:10}}
          value={appName} onChange={(e) => setAppName(e.target.value)} />
        <input placeholder="Username" required style={{padding:10}}
          value={username} onChange={(e) => setUsername(e.target.value)} />
        <input placeholder="Password Asli" required style={{padding:10}}
          value={plainPassword} onChange={(e) => setPlainPassword(e.target.value)} />
        <button type="submit" style={{padding:10, background:'#17a2b8', color:'white', border:'none', borderRadius:4}}>Simpan</button>
      </form>

      {/* List Password */}
      <div>
        <h3>Daftar Vault Saya</h3>
        {vaults.length === 0 && <p>Belum ada password tersimpan.</p>}
        {vaults.map((item) => (
          <div key={item.id} style={{border:'1px solid #eee', padding:15, marginBottom:10, borderRadius:5, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <strong>{item.app_name}</strong><br/>
              <span style={{color:'#666'}}>{item.username}</span><br/>
              <small style={{color:'#aaa', fontFamily:'monospace'}}>Encrypted: {item.encrypted_password.substring(0, 20)}...</small>
            </div>
            <div>
              <button onClick={() => handleCopy(item.encrypted_password)} style={{padding:8, background:'#28a745', color:'white', border:'none', borderRadius:4}}>Copy</button>
              <button onClick={() => handleDelete(item.id)} style={{padding:8, background:'#dc3545', color:'white', border:'none', borderRadius:4, marginLeft:5}}>Hapus</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;