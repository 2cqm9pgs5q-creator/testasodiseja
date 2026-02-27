import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { 
  Bike, 
  Users, 
  CheckCircle2, 
  ChevronRight,
  X,
  Sparkles,
  Info,
  MapPin,
  Calendar,
  Mountain,
  Clock,
  Map as MapIcon,
  Tent,
  Coffee,
  Utensils,
  Wallet,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Components ---

const RegistrationPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
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
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="relative group">
                <img 
                  src="/logo.png" 
                  alt="Utena Cycling Team" 
                  className="h-24 md:h-32 w-auto mx-auto drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const placeholder = document.createElement('div');
                      placeholder.className = "h-24 md:h-32 flex items-center justify-center text-white/20 italic text-sm border-2 border-dashed border-white/10 rounded-2xl px-8";
                      placeholder.innerText = "Logotipo vieta (logo.png)";
                      parent.appendChild(placeholder);
                    }
                  }}
                />
              </div>
            </motion.div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest mb-6"><Sparkles size={14} className="text-yellow-400" /> Gravel Odiseja 2026 • Gegužės 23–24 d.</div>
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
                { icon: <CheckCircle2 />, title: "Stovykla", desc: "Įskaičiuota palapinės vieta, maitinimas vakare ir ryte." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 sm:gap-6 group">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all shrink-0">{React.cloneElement(item.icon as React.ReactElement, { size: 20 })}</div>
                  <div className="min-w-0"><h3 className="text-lg sm:text-xl font-bold mb-1 truncate">{item.title}</h3><p className="text-white/50 text-sm sm:text-base leading-snug">{item.desc}</p></div>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setShowInfoModal(true)}
              className="mt-10 flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white hover:text-black transition-all duration-300"
            >
              <Info size={20} />
              Detali informacija apie renginį
            </button>
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
                    {isRegistering ? 'Siunčiama...' : <><span className="truncate">Patvirtinti registraciją</span><ChevronRight size={20} /></>}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
      <footer className="border-t border-white/5 py-12 text-center text-white/30 text-sm">© 2026 Aukštaitijos Gravel Odiseja</footer>

      {/* Detailed Info Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#1A1A1A] border border-white/10 rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <button 
                onClick={() => setShowInfoModal(false)}
                className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-all z-10"
              >
                <X size={24} />
              </button>

              <div className="p-8 sm:p-12">
                <div className="flex items-center gap-3 mb-4 text-yellow-400">
                  <Calendar size={24} />
                  <span className="font-bold uppercase tracking-widest text-sm">Gegužės 23–24 d.</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tighter mb-8 uppercase italic leading-none">
                  Aukštaitijos <br /> odisėja 2026
                </h2>

                <div className="space-y-12 text-white/80">
                  <section>
                    <p className="text-lg leading-relaxed text-white/90">
                      Kviečiame į rekreacinį, nevaržybinį dviračių gravel renginį, skirtą tiems, kurie nori ne lenktyniauti, o mėgautis važiavimu, gamta ir bendraminčių kompanija.
                    </p>
                    <div className="mt-6 flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                      <MapPin className="text-emerald-400 shrink-0 mt-1" />
                      <p className="text-sm">Maršrutas drieksis gražiausiomis Utenos regiono vietomis, vingiuos per parkus, miškus ir dar neatrastus keliukus. Starto ir finišo vieta - <strong>Utena</strong>.</p>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Mountain size={20} />
                      </div>
                      <h3 className="text-xl font-bold uppercase italic">Maršrutas ir patirtis</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { icon: <ChevronRight size={16} />, label: "Distancija", value: "~390 km" },
                        { icon: <Mountain size={16} />, label: "Sukilimas", value: "~3000 m" },
                        { icon: <Clock size={16} />, label: "Startas", value: "Gegužės 23 d. 8:00 val." },
                        { icon: <MapIcon size={16} />, label: "GPX failas", value: "Bus atsiųstas prieš renginį" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                          <div className="text-white/40">{item.icon}</div>
                          <div>
                            <div className="text-[10px] uppercase font-bold text-white/40">{item.label}</div>
                            <div className="text-sm font-bold">{item.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-6 text-sm italic text-white/50">Tai nėra varžybos – važiuojame savu tempu, stojam ir apžiūrim gražiąsias Utenos regiono vietas.</p>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Tent size={20} />
                      </div>
                      <h3 className="text-xl font-bold uppercase italic">Nakvynė ir sustojimas</h3>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/10 to-transparent p-6 rounded-3xl border border-blue-500/20">
                      <p className="mb-6 font-medium">Trasos viduryje visų dalyvių lauks privalomas bendras sustojimas su nakvyne:</p>
                      <ul className="space-y-4">
                        {[
                          { icon: <Utensils />, text: "Šilta vakarienė" },
                          { icon: <Coffee />, text: "Pusryčiai ryte" },
                          { icon: <Users />, text: "Jaukus vakaras bendraminčių rate" }
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60">{React.cloneElement(item.icon as React.ReactElement, { size: 16 })}</div>
                            <span className="font-bold">{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                        <Wallet size={20} />
                      </div>
                      <h3 className="text-xl font-bold uppercase italic">Dalyvio mokestis</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-8 items-start">
                      <div className="bg-white text-black p-6 rounded-3xl shrink-0">
                        <div className="text-xs font-bold uppercase opacity-50 mb-1">Kaina asmeniui</div>
                        <div className="text-4xl font-black italic">20 €</div>
                      </div>
                      <div className="space-y-3">
                        <p className="font-bold text-white">Į kainą įskaičiuota:</p>
                        <div className="grid grid-cols-1 gap-2">
                          {["Vieta palapinei", "Vakarienė ir pusryčiai", "Starto numeris", "Daiktų gabenimas", "Maršruto GPX"].map((text, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-white/60">
                              <Check size={14} className="text-emerald-400" />
                              {text}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                      <Users className="text-white/40" />
                      <h3 className="text-xl font-bold uppercase italic">Kam skirtas šis renginys?</h3>
                    </div>
                    <ul className="grid sm:grid-cols-2 gap-4">
                      {[
                        "Mėgstantiems gravel ir ilgus pasivažinėjimus",
                        "Bikepacking entuziastams",
                        "Norintiems saugiai išbandyti ilgesnę distanciją",
                        "Vertinantiems Lietuvos gamtą be skubėjimo"
                      ].map((text, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                            <Check size={10} className="text-emerald-400" />
                          </div>
                          {text}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <div className="pt-8 border-t border-white/10 text-center">
                    <p className="text-2xl font-black italic uppercase tracking-tighter text-white">
                      Tai dviejų dienų nuotykis, o ne lenktynės.
                    </p>
                    <p className="text-white/40 mt-2 font-bold uppercase tracking-widest text-xs">
                      Mažiau „rezultato“, daugiau žvyro, gamtos ir laisvės.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RegistrationPage />} />
    </Routes>
  );
}
