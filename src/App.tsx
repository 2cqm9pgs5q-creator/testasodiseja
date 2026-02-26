import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { 
  Bike, 
  User, 
  Mail, 
  Users, 
  Trash2, 
  Plus, 
  Send, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  LogOut,
  X,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Participant = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  club: string;
  gender: string;
  isNew: number;
  createdAt: string;
};

// --- Components ---

const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({ subject: 'Aukštaitijos Gravel Odisėja 2026', message: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    club: '',
    gender: 'Vyras'
  });

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      const res = await fetch('/api/participants');
      const data = await res.json();
      setParticipants(data);
    } catch (error) {
      console.error('Failed to fetch participants');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchParticipants();
        setFormData({ firstName: '', lastName: '', email: '', club: '', gender: 'Vyras' });
      }
    } catch (error) {
      alert('Klaida');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Ar tikrai?')) return;
    await fetch(`/api/participants/${id}`, { method: 'DELETE' });
    fetchParticipants();
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Ištrinti ${selectedIds.length}?`)) return;
    await fetch('/api/participants/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds })
    });
    setSelectedIds([]);
    fetchParticipants();
  };

  const handleMarkSeen = async () => {
    await fetch('/api/participants/mark-seen', { method: 'POST' });
    fetchParticipants();
  };

  const handleSendBulkEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const recipients = participants.filter(p => selectedIds.includes(p.id)).map(p => p.email);
    
    if (recipients.length === 0) return;

    const subject = encodeURIComponent(emailData.subject);
    const body = encodeURIComponent(emailData.message);
    const to = recipients.join(',');
    
    // Using mailto: protocol to open default email client
    const mailtoLink = `mailto:${to}?subject=${subject}&body=${body}`;
    
    window.location.href = mailtoLink;
    
    setShowEmailModal(false);
    setEmailData({ subject: 'Aukštaitijos Gravel Odisėja 2026', message: '' });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-black p-1.5 rounded-lg"><Bike className="text-white w-4 h-4" /></div>
            <h1 className="font-bold text-sm sm:text-lg">Admin Panele</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleMarkSeen} className="text-[10px] sm:text-sm font-medium text-gray-500 hover:text-black">Pažymėti visus</button>
            <button onClick={onLogout} className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-gray-200 text-[10px] sm:text-sm font-medium hover:bg-gray-50">
              <LogOut size={14} /><span>Atsijungti</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold">Dalyvių Sąrašas</h2>
            <p className="text-gray-500">Iš viso: {participants.length}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.length > 0 && (
              <div className="flex gap-2">
                <button onClick={() => setShowEmailModal(true)} className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium"><Send size={16} /> Siųsti ({selectedIds.length})</button>
                <button onClick={handleBulkDelete} className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium"><Trash2 size={16} /> Ištrinti</button>
              </div>
            )}
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg text-xs font-medium"><Plus size={16} /> Pridėti</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 w-12"><input type="checkbox" checked={selectedIds.length === participants.length && participants.length > 0} onChange={() => selectedIds.length === participants.length ? setSelectedIds([]) : setSelectedIds(participants.map(p => p.id))} /></th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Dalyvis</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">El. Paštas</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Klubas</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Lytis</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Veiksmai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {participants.map((p) => (
                <tr key={p.id} className={`hover:bg-gray-50 ${p.isNew ? 'bg-blue-50/30' : ''}`}>
                  <td className="p-4"><input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => setSelectedIds(prev => prev.includes(p.id) ? prev.filter(i => i !== p.id) : [...prev, p.id])} /></td>
                  <td className="p-4 font-semibold flex items-center gap-2">
                    {p.firstName} {p.lastName}
                    {p.isNew === 1 && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center gap-1"><Sparkles size={10} /> Naujas</span>}
                  </td>
                  <td className="p-4 text-gray-600 text-sm">{p.email}</td>
                  <td className="p-4 text-gray-600 text-sm">{p.club || '—'}</td>
                  <td className="p-4 text-xs font-medium">{p.gender}</td>
                  <td className="p-4 text-right"><button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between mb-4"><h3 className="text-xl font-bold">Pridėti dalyvį</h3><button onClick={() => setShowAddModal(false)}><X size={24} /></button></div>
            <form onSubmit={handleRegister} className="space-y-4">
              <input required placeholder="Vardas" className="w-full p-2 border rounded" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              <input required placeholder="Pavardė" className="w-full p-2 border rounded" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              <input required type="email" placeholder="El. paštas" className="w-full p-2 border rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              <input placeholder="Klubas" className="w-full p-2 border rounded" value={formData.club} onChange={e => setFormData({...formData, club: e.target.value})} />
              <select className="w-full p-2 border rounded" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}><option value="Vyras">Vyras</option><option value="Moteris">Moteris</option></select>
              <button disabled={isRegistering} className="w-full py-3 bg-black text-white rounded-xl font-bold">{isRegistering ? 'Pridedama...' : 'Pridėti'}</button>
            </form>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl">
            <div className="flex justify-between mb-4"><div><h3 className="text-xl font-bold">Siųsti laišką</h3><p className="text-sm text-gray-500">Gavėjų: {selectedIds.length}</p></div><button onClick={() => setShowEmailModal(false)}><X size={24} /></button></div>
            <form onSubmit={handleSendBulkEmail} className="space-y-4">
              <input required placeholder="Tema" className="w-full p-2 border rounded" value={emailData.subject} onChange={e => setEmailData({...emailData, subject: e.target.value})} />
              <textarea required rows={6} placeholder="Žinutė" className="w-full p-2 border rounded" value={emailData.message} onChange={e => setEmailData({...emailData, message: e.target.value})} />
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowEmailModal(false)}>Atšaukti</button><button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold">Siųsti</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const RegistrationPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', club: '', gender: 'Vyras' });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setRegistrationSuccess(true);
        setFormData({ firstName: '', lastName: '', email: '', club: '', gender: 'Vyras' });
      }
    } catch (error) {
      alert('Klaida');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-white selection:text-black">
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <img src="https://picsum.photos/seed/gravel/1920/1080?blur=2" className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105" alt="Gravel" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-[#0A0A0A]" />
        <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center items-center text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest mb-6"><Sparkles size={14} className="text-yellow-400" /> Gravel Odiseja 2026</div>
            <h1 className="text-3xl sm:text-5xl md:text-8xl font-black tracking-tighter mb-6 uppercase italic break-words leading-[0.9]">Aukštaitijos <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">Gravel Odiseja</span></h1>
            <p className="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-medium leading-relaxed px-4">Leiskis į nepamirštamą nuotykį Aukštaitijos miškais ir žvyrkeliais.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="w-full">
            <h2 className="text-2xl sm:text-4xl font-bold mb-8 tracking-tight">Informacija apie renginį</h2>
            <div className="space-y-6 sm:space-y-8">
              {[
                { icon: <Bike />, title: "Trasa", desc: "Beveik 400km žvyrkelio, asfalto ir miško takų." },
                { icon: <Users />, title: "Bendruomenės stiprinimas", desc: "Susitik su bendraminčiais ir dalinkis patirtimi." },
                { icon: <CheckCircle2 />, title: "Stovykla", desc: "Įskaičiuotas maitinimas vakare ir ryte." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 sm:gap-6 group">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all shrink-0">{React.cloneElement(item.icon as React.ReactElement, { size: 20 })}</div>
                  <div className="min-w-0"><h3 className="text-lg sm:text-xl font-bold mb-1 truncate">{item.title}</h3><p className="text-white/50 text-sm sm:text-base leading-snug">{item.desc}</p></div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 md:p-12 text-black shadow-2xl relative overflow-hidden w-full">
            {registrationSuccess ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
                <h3 className="text-3xl font-bold mb-4">Registracija sėkminga!</h3>
                <p className="text-gray-500 mb-8">Lauksime tavęs prie starto linijos.</p>
                <button onClick={() => setRegistrationSuccess(false)} className="px-8 py-3 bg-black text-white rounded-2xl font-bold">Registruoti kitą</button>
              </div>
            ) : (
              <>
                <div className="mb-6 md:mb-10"><h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-2 uppercase italic leading-tight">Dalyvio anketa</h2><p className="text-gray-500 font-medium text-xs sm:text-base">Užpildykite visus laukus registracijai.</p></div>
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input required className="w-full p-4 bg-gray-50 rounded-2xl outline-none" placeholder="Vardas" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                    <input required className="w-full p-4 bg-gray-50 rounded-2xl outline-none" placeholder="Pavardė" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                  </div>
                  <input required type="email" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" placeholder="El. paštas" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  <input className="w-full p-4 bg-gray-50 rounded-2xl outline-none" placeholder="Klubas" value={formData.club} onChange={e => setFormData({...formData, club: e.target.value})} />
                  <div className="flex gap-4">
                    {['Vyras', 'Moteris'].map((option) => (
                      <button key={option} type="button" onClick={() => setFormData({...formData, gender: option})} className={`flex-1 py-4 rounded-2xl font-bold border-2 ${formData.gender === option ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100'}`}>{option}</button>
                    ))}
                  </div>
                  <button disabled={isRegistering} className="w-full py-4 sm:py-5 bg-black text-white rounded-xl sm:rounded-[1.5rem] font-black text-base sm:text-xl uppercase italic tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 mt-6">
                    {isRegistering ? 'Registruojama...' : <><span className="truncate">Patvirtinti registraciją</span><ChevronRight size={20} /></>}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
      <footer className="border-t border-white/5 py-12 text-center text-white/30 text-sm">© 2026 Aukštaitijos Gravel Odiseja</footer>
    </div>
  );
};

const AdminPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin2026') {
      setIsAdmin(true);
    } else {
      alert('Neteisingas slaptažodis');
    }
  };

  if (isAdmin) {
    return <AdminDashboard onLogout={() => setIsAdmin(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <ShieldCheck className="text-emerald-600" size={32} />
          <h2 className="text-2xl font-bold text-black">Admin Prieiga</h2>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <input 
            type="password" 
            placeholder="Slaptažodis" 
            className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-black border border-gray-100" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
          <button className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all">Prisijungti</button>
          <button type="button" onClick={() => navigate('/')} className="w-full text-gray-400 text-sm font-medium">Grįžti į pagrindinį</button>
        </form>
      </motion.div>
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RegistrationPage />} />
      <Route path="/efkka" element={<AdminPage />} />
    </Routes>
  );
}
