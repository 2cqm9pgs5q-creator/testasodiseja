import React, { useState, useEffect } from 'react';
import { 
  Bike, 
  User, 
  Mail, 
  Users, 
  Trash2, 
  Plus, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  LogOut,
  Search,
  Filter,
  MoreVertical,
  Check,
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

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({ subject: '', message: '' });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    club: '',
    gender: 'Vyras'
  });

  useEffect(() => {
    if (isAdmin) {
      fetchParticipants();
    }
  }, [isAdmin]);

  const fetchParticipants = async () => {
    try {
      const res = await fetch('/api/participants');
      const data = await res.json();
      setParticipants(data);
    } catch (error) {
      console.error('Failed to fetch participants');
    }
  };

  const handleRegister = async (e: React.FormEvent, isManual = false) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        if (isManual) {
          setShowAddModal(false);
          fetchParticipants();
        } else {
          setRegistrationSuccess(true);
        }
        setFormData({ firstName: '', lastName: '', email: '', club: '', gender: 'Vyras' });
      }
    } catch (error) {
      alert('Registracijos klaida');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Ar tikrai norite ištrinti šį dalyvį?')) return;
    try {
      await fetch(`/api/participants/${id}`, { method: 'DELETE' });
      fetchParticipants();
    } catch (error) {
      alert('Klaida trinant');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Ar tikrai norite ištrinti ${selectedIds.length} dalyvius?`)) return;
    try {
      await fetch('/api/participants/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      setSelectedIds([]);
      fetchParticipants();
    } catch (error) {
      alert('Klaida trinant');
    }
  };

  const handleMarkSeen = async () => {
    try {
      await fetch('/api/participants/mark-seen', { method: 'POST' });
      fetchParticipants();
    } catch (error) {
      console.error('Failed to mark as seen');
    }
  };

  const handleSendBulkEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const recipients = participants
      .filter(p => selectedIds.includes(p.id))
      .map(p => p.email);
    
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipients, ...emailData })
      });
      if (res.ok) {
        alert('Laiškas išsiųstas!');
        setShowEmailModal(false);
        setEmailData({ subject: '', message: '' });
      }
    } catch (error) {
      alert('Klaida siunčiant laišką');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === participants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(participants.map(p => p.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
        {/* Admin Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="bg-black p-1.5 sm:p-2 rounded-lg shrink-0">
                <Bike className="text-white w-4 h-4 sm:w-5 h-5" />
              </div>
              <h1 className="font-bold text-sm sm:text-lg tracking-tight truncate">Admin Panele</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <button 
                onClick={handleMarkSeen}
                className="hidden xs:block text-[10px] sm:text-sm font-medium text-gray-500 hover:text-black transition-colors"
              >
                Pažymėti visus
              </button>
              <button 
                onClick={() => setIsAdmin(false)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-200 text-[10px] sm:text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <LogOut size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Atsijungti</span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Dalyvių Sąrašas</h2>
              <p className="text-gray-500 mt-1">Iš viso dalyvių: {participants.length}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {selectedIds.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-wrap items-center gap-2"
                >
                  <button 
                    onClick={() => setShowEmailModal(true)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
                    Siųsti ({selectedIds.length})
                  </button>
                  <button 
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                    Ištrinti
                  </button>
                </motion.div>
              )}
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-black text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
              >
                <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                Pridėti
              </button>
            </div>
          </div>

          {/* Data Grid */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-4 w-12">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                        checked={selectedIds.length === participants.length && participants.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dalyvis</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">El. Paštas</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Klubas</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lytis</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Veiksmai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence mode="popLayout">
                    {participants.map((p) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={p.id} 
                        className={`group hover:bg-gray-50 transition-colors ${p.isNew ? 'bg-blue-50/30' : ''}`}
                      >
                        <td className="p-4">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                            checked={selectedIds.includes(p.id)}
                            onChange={() => toggleSelect(p.id)}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">
                              {p.firstName[0]}{p.lastName[0]}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 flex items-center gap-2">
                                {p.firstName} {p.lastName}
                                {p.isNew === 1 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wide">
                                    <Sparkles size={10} />
                                    Naujas
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600 text-sm">{p.email}</td>
                        <td className="p-4 text-gray-600 text-sm">{p.club || '—'}</td>
                        <td className="p-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            p.gender === 'Vyras' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                          }`}>
                            {p.gender}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400 text-xs">
                          {new Date(p.createdAt).toLocaleDateString('lt-LT')}
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleDelete(p.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              {participants.length === 0 && (
                <div className="py-20 text-center">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="text-gray-300" size={32} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Nėra dalyvių</h3>
                  <p className="text-gray-500">Kol kas niekas neužsiregistravo.</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-bold">Pridėti naują dalyvį</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-black">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={(e) => handleRegister(e, true)} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Vardas</label>
                    <input 
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase">Pavardė</label>
                    <input 
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">El. Paštas</label>
                  <input 
                    required
                    type="email"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Klubas</label>
                  <input 
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                    value={formData.club}
                    onChange={e => setFormData({...formData, club: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Lytis</label>
                  <select 
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all appearance-none bg-white"
                    value={formData.gender}
                    onChange={e => setFormData({...formData, gender: e.target.value})}
                  >
                    <option value="Vyras">Vyras</option>
                    <option value="Moteris">Moteris</option>
                  </select>
                </div>
                <button 
                  disabled={isRegistering}
                  className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-black/10 disabled:opacity-50"
                >
                  {isRegistering ? 'Pridedama...' : 'Pridėti dalyvį'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Siųsti bendrą el. laišką</h3>
                  <p className="text-sm text-gray-500">Gavėjų skaičius: {selectedIds.length}</p>
                </div>
                <button onClick={() => setShowEmailModal(false)} className="text-gray-400 hover:text-black">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSendBulkEmail} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Tema</label>
                  <input 
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                    value={emailData.subject}
                    onChange={e => setEmailData({...emailData, subject: e.target.value})}
                    placeholder="Pvz: Informacija apie startą"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Žinutė</label>
                  <textarea 
                    required
                    rows={8}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all resize-none"
                    value={emailData.message}
                    onChange={e => setEmailData({...emailData, message: e.target.value})}
                    placeholder="Sveiki, dalyviai..."
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="px-6 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Atšaukti
                  </button>
                  <button 
                    className="px-8 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
                  >
                    <Send size={18} />
                    Siųsti dabar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-white selection:text-black">
      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <img 
          src="https://picsum.photos/seed/gravel/1920/1080?blur=2" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
          alt="Gravel bike background"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-[#0A0A0A]" />
        
        <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col justify-center items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles size={14} className="text-yellow-400" />
              Gravel Odiseja 2026
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-8xl font-black tracking-tighter mb-6 uppercase italic break-words leading-[0.9]">
              Aukštaitijos <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">
                Gravel Odiseja
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-medium leading-relaxed px-4">
              Leiskis į nepamirštamą nuotykį Aukštaitijos miškais ir žvyrkeliais. 
              Išbandyk savo jėgas ir pajusk laisvę.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Registration Form */}
      <div id="register" className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full"
          >
            <h2 className="text-2xl sm:text-4xl font-bold mb-8 tracking-tight">Informacija apie renginį</h2>
            <div className="space-y-6 sm:space-y-8">
              {[
                { icon: <Bike />, title: "Trasa", desc: "100km gryno žvyrkelio ir miško takų." },
                { icon: <Users />, title: "Bendruomenė", desc: "Susitik su bendraminčiais ir dalinkis patirtimi." },
                { icon: <CheckCircle2 />, title: "Servisas", desc: "Pagalbos punktai trasoje ir maitinimas finiše." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 sm:gap-6 group">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all duration-500 shrink-0">
                    {React.cloneElement(item.icon as React.ReactElement, { size: 20 })}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold mb-1 truncate">{item.title}</h3>
                    <p className="text-white/50 text-sm sm:text-base leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
              <div className="flex items-center gap-3 sm:gap-4 mb-4">
                <ShieldCheck className="text-emerald-400 shrink-0" />
                <h4 className="font-bold text-sm sm:text-base">Administratoriaus prieiga</h4>
              </div>
              <p className="text-white/40 text-xs sm:text-sm mb-6">Tik organizatoriams skirta zona dalyvių valdymui.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="password"
                  placeholder="Slaptažodis"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-white outline-none transition-all"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                />
                <button 
                  onClick={() => {
                    if (adminPassword === 'admin2026') setIsAdmin(true);
                    else alert('Neteisingas slaptažodis');
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 bg-white text-black rounded-xl font-bold text-sm hover:bg-white/90 transition-all whitespace-nowrap"
                >
                  Prisijungti
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 md:p-12 text-black shadow-2xl relative overflow-hidden w-full"
          >
            {registrationSuccess ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-3xl font-bold mb-4">Registracija sėkminga!</h3>
                <p className="text-gray-500 mb-8">Lauksime tavęs prie starto linijos. Visa informacija bus išsiųsta el. paštu.</p>
                <button 
                  onClick={() => setRegistrationSuccess(false)}
                  className="px-8 py-3 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all"
                >
                  Registruoti kitą dalyvį
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 md:mb-10">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-2 uppercase italic leading-tight">Dalyvio anketa</h2>
                  <p className="text-gray-500 font-medium text-xs sm:text-base">Užpildykite visus laukus registracijai.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Vardas</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          required
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-medium"
                          placeholder="Vardenis"
                          value={formData.firstName}
                          onChange={e => setFormData({...formData, firstName: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Pavardė</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          required
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-medium"
                          placeholder="Pavardenis"
                          value={formData.lastName}
                          onChange={e => setFormData({...formData, lastName: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">El. Paštas</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        required
                        type="email"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-medium"
                        placeholder="pastas@pavyzdys.lt"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Klubas / Komanda</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all font-medium"
                        placeholder="Pvz: Gravel Kings"
                        value={formData.club}
                        onChange={e => setFormData({...formData, club: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Lytis</label>
                    <div className="flex gap-4">
                      {['Vyras', 'Moteris'].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setFormData({...formData, gender: option})}
                          className={`flex-1 py-4 rounded-2xl font-bold transition-all border-2 ${
                            formData.gender === option 
                              ? 'bg-black text-white border-black' 
                              : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    disabled={isRegistering}
                    className="w-full py-4 sm:py-5 bg-black text-white rounded-xl sm:rounded-[1.5rem] font-black text-base sm:text-xl uppercase italic tracking-wider hover:bg-gray-800 transition-all shadow-xl shadow-black/10 disabled:opacity-50 flex items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-8"
                  >
                    {isRegistering ? (
                      'Registruojama...'
                    ) : (
                      <>
                        <span className="truncate">Patvirtinti registraciją</span>
                        <ChevronRight size={20} className="shrink-0" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-4">
                    Registruodamiesi sutinkate su taisyklėmis
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <Bike className="text-black w-5 h-5" />
            </div>
            <span className="font-black uppercase italic tracking-tighter">Aukštaitijos Gravel Odiseja 2026</span>
          </div>
          <p className="text-white/30 text-sm">© 2026 Visos teisės saugomos.</p>
        </div>
      </footer>
    </div>
  );
}
