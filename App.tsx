
import React, { useState, useEffect } from 'react';
import { VotingStep, UserState, Block, Language } from './types';
import { CANDIDATES, TRANSLATIONS, CONSTITUENCIES } from './constants';
import { verifyDocument, verifyFace } from './services/geminiService';
import { createGenesisBlock, createNewBlock } from './services/blockchainService';
import CameraModule from './components/CameraModule';
import { Logo } from './components/Logo';

const App: React.FC = () => {
  const [step, setStep] = useState<VotingStep>(VotingStep.LOGIN);
  const [user, setUser] = useState<UserState>({
    isLoggedIn: false,
    isVerified: false,
    hasVoted: false,
    language: 'en'
  });
  const [blockchain, setBlockchain] = useState<Block[]>([createGenesisBlock()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [searchQuery, setSearchQuery] = useState('');

  const t = TRANSLATIONS[user.language];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setUser(prev => ({ ...prev, isLoggedIn: true, email: 'voter@gmail.com' }));
    setStep(VotingStep.EMAIL_VERIFICATION);
  };

  const verifyEmail = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(VotingStep.CHOOSE_LOCATION);
    }, 1200);
  };

  const handleSelectLocation = (location: string) => {
    setUser(prev => ({ ...prev, selectedLocation: location }));
    setStep(VotingStep.AADHAR_VERIFICATION);
  };

  const handleAadharCapture = async (image: string) => {
    setLoading(true);
    setError(null);
    const result = await verifyDocument(image, 'AADHAR');
    if (result.success) {
      const extractedLoc = result.extractedData.location || "Unknown";
      const selected = user.selectedLocation || "";
      
      // Jurisdictional logic: Aadhar extracts the home region. 
      // It must match the chosen constituency's state/region prefix.
      const selectedState = selected.split(' - ')[0];
      if (!extractedLoc.toLowerCase().includes(selectedState.toLowerCase())) {
        setUser(prev => ({ ...prev, voterLocation: extractedLoc }));
        setStep(VotingStep.LOCATION_REJECTED);
        setLoading(false);
        return;
      }

      setUser(prev => ({ 
        ...prev, 
        aadharNumber: result.extractedData.id,
        voterName: result.extractedData.name,
        voterLocation: extractedLoc
      }));
      setStep(VotingStep.VOTER_ID_VERIFICATION);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleVoterIdCapture = async (image: string) => {
    setLoading(true);
    setError(null);
    // Voter ID verification now specifically checks for the portrait photo
    const result = await verifyDocument(image, 'VOTER_ID');
    if (result.success) {
      setUser(prev => ({ ...prev, voterId: result.extractedData.id }));
      setStep(VotingStep.FACE_RECOGNITION);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleFaceCapture = async (image: string) => {
    setLoading(true);
    setError(null);
    const result = await verifyFace(image);
    if (result.success) {
      setUser(prev => ({ ...prev, isVerified: true }));
      setStep(VotingStep.VOTING_BOOTH);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const castVote = (candidateId: string) => {
    setLoading(true);
    setTimeout(() => {
      const lastBlock = blockchain[blockchain.length - 1];
      const newBlock = createNewBlock(lastBlock, candidateId);
      setBlockchain(prev => [...prev, newBlock]);
      setUser(prev => ({ ...prev, hasVoted: true }));
      setStep(VotingStep.CONFIRMATION);
      setLoading(false);
    }, 2000); // Simulate blockchain anchoring time
  };

  const switchLanguage = (lang: Language) => {
    setUser(prev => ({ ...prev, language: lang }));
  };

  const renderProgress = () => {
    const steps = [
      { id: VotingStep.EMAIL_VERIFICATION, icon: '📧' },
      { id: VotingStep.CHOOSE_LOCATION, icon: '📍' },
      { id: VotingStep.AADHAR_VERIFICATION, icon: '🪪' },
      { id: VotingStep.VOTER_ID_VERIFICATION, icon: '🗳️' },
      { id: VotingStep.FACE_RECOGNITION, icon: '👤' },
    ];

    return (
      <div className="flex items-center justify-center gap-3 mb-12 animate-slide-up">
        {steps.map((s, idx) => {
          const isActive = step === s.id;
          const isDone = steps.findIndex(x => x.id === step) > idx;
          return (
            <React.Fragment key={s.id}>
              <div 
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-700 shadow-md step-transition ${
                  isActive ? 'bg-indigo-600 text-white scale-110 shadow-indigo-200 rotate-3 ring-2 ring-indigo-50' : 
                  isDone ? 'bg-emerald-500 text-white translate-y-[-1px]' : 'bg-white text-slate-300'
                }`}
              >
                <span className={`text-sm transition-all duration-300 ${isActive ? 'scale-110 font-bold' : ''}`}>
                  {isDone ? '✓' : s.icon}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-6 h-0.5 rounded-full transition-all duration-1000 ${isDone ? 'bg-emerald-200 w-10' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const filteredConstituencies = CONSTITUENCIES.filter(c => 
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col transition-all duration-700 overflow-x-hidden">
      <header className="bg-white/40 backdrop-blur-2xl border-b border-white/20 px-8 py-5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.location.reload()}>
          <Logo className="w-12 h-12 group-hover:rotate-12 transition-transform duration-500" />
          <div className="leading-tight">
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase group-hover:text-indigo-600 transition-colors">BharatVote</h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded tracking-[0.2em] animate-pulse">DEMOCRACY 3.0</span>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex flex-col text-right animate-slide-up">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Election Cycle</span>
            <span className="text-xs font-bold text-indigo-600 flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
              LIVE 2024
            </span>
          </div>
          <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 shadow-inner">
            {(['en', 'hi', 'kn'] as Language[]).map(lang => (
              <button
                key={lang}
                onClick={() => switchLanguage(lang)}
                className={`px-4 py-1.5 rounded-xl text-[11px] font-black uppercase transition-all duration-300 ${
                  user.language === lang 
                  ? 'bg-white text-indigo-600 shadow-md scale-105' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-8 relative z-10">
        {user.isLoggedIn && !user.hasVoted && step !== VotingStep.BLOCKCHAIN_LEDGER && step !== VotingStep.LOCATION_REJECTED && renderProgress()}

        {loading && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center z-[100] animate-in fade-in duration-300">
            <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl text-center scale-up-center relative overflow-hidden animate-pulse-glow">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 animate-loading-bar"></div>
              <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mb-8 mx-auto relative group">
                <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-[2rem] animate-spin"></div>
                <Logo className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">{user.hasVoted ? 'Anchoring Vote...' : t.verify_identity}</h2>
              <p className="text-slate-500 font-medium text-sm px-4">
                {user.hasVoted 
                  ? "Distributing your ballot to the decentralized network for permanent storage." 
                  : "Cross-referencing Aadhar jurisdiction and Voter ID portraits..."}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 bg-rose-50 border-2 border-rose-100 text-rose-600 p-6 rounded-3xl flex items-center gap-5 text-sm font-black animate-shake shadow-2xl shadow-rose-100">
            <div className="w-12 h-12 rounded-full bg-rose-200 flex items-center justify-center text-2xl animate-bounce">⚠️</div>
            <div>
              <p className="text-lg uppercase">Authentication Fail</p>
              <p className="font-medium opacity-80">{error}</p>
            </div>
          </div>
        )}

        <div className="animate-slide-up">
        {step === VotingStep.LOGIN && (
          <div className="max-w-2xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-5 gap-8 bg-white p-4 rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden hover:shadow-indigo-100/50 transition-shadow duration-500">
            <div className="md:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="relative z-10">
                <Logo className="w-16 h-16 mb-8 group-hover:scale-110 transition-transform" />
                <h2 className="text-4xl font-extrabold tracking-tighter leading-none mb-6">Securing Every Voice.</h2>
                <p className="text-slate-400 font-medium text-sm">Powered by BharatNet Blockchain. Secure. Immutable. Indian.</p>
              </div>
              <div className="relative z-10 pt-10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">ISO 27001</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Web3 Core</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 p-10">
              <div className="mb-10">
                <h3 className="text-3xl font-black text-slate-900 mb-2">{t.welcome}</h3>
                <p className="text-slate-500 font-medium">{t.login_sub}</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2 block transition-colors group-focus-within:text-indigo-600">BharatID / Phone</label>
                  <input 
                    type="text" 
                    required
                    placeholder="+91 00000 00000"
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold placeholder:text-slate-300 text-lg" 
                  />
                </div>
                <button className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-black hover:-translate-y-1 shadow-2xl shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-4 group">
                  Initiate Secure Login <span className="text-2xl transition-transform group-hover:translate-x-2">→</span>
                </button>
                <div className="relative flex items-center justify-center py-4">
                  <div className="absolute w-full h-px bg-slate-100"></div>
                  <span className="relative bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Vault Gate</span>
                </div>
                <button type="button" className="w-full py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold flex items-center justify-center gap-4 hover:border-indigo-600 hover:bg-indigo-50/30 transition-all shadow-sm group active:scale-98">
                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5 group-hover:scale-125 transition-transform" alt="Google" />
                  Continue with Gmail
                </button>
              </form>
            </div>
          </div>
        )}

        {step === VotingStep.EMAIL_VERIFICATION && (
          <div className="max-w-lg mx-auto mt-12 bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-16 -mt-16 animate-pulse opacity-50"></div>
            <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-10 shadow-lg animate-float">📧</div>
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">{t.email_verify}</h2>
            <p className="text-slate-500 font-medium mb-10 px-6 leading-relaxed">{t.email_sub}</p>
            
            <div className="flex justify-center gap-4 mb-10">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const newOtp = [...otp];
                    newOtp[i] = e.target.value;
                    setOtp(newOtp);
                    if (e.target.value && i < 5) {
                      const next = document.getElementById(`otp-${i+1}`);
                      next?.focus();
                    }
                  }}
                  id={`otp-${i}`}
                  className="w-14 h-20 border-2 border-slate-100 rounded-2xl text-3xl font-black text-indigo-600 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none text-center transition-all bg-slate-50 focus:bg-white active:scale-95"
                />
              ))}
            </div>

            <button 
              onClick={verifyEmail}
              disabled={otp.some(d => !d)}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all active:scale-95 disabled:opacity-50"
            >
              Verify Session
            </button>
            <p className="mt-8 text-[10px] text-slate-400 font-black uppercase tracking-widest cursor-pointer hover:text-indigo-600 transition-colors">Resend in 0:42</p>
          </div>
        )}

        {step === VotingStep.CHOOSE_LOCATION && (
          <div className="max-w-3xl mx-auto mt-12 animate-slide-up">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">{t.choose_location}</h2>
              <p className="text-slate-500 font-medium text-lg">{t.location_sub}</p>
            </div>

            <div className="relative mb-8 group">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search State or Constituency (e.g. Karnataka)..."
                className="w-full px-8 py-6 rounded-[2.5rem] border-2 border-slate-100 bg-white/50 backdrop-blur-xl focus:border-indigo-600 outline-none text-xl font-bold shadow-xl transition-all hover:border-slate-300"
              />
              <div className="absolute right-8 top-1/2 -translate-y-1/2 text-3xl opacity-30 group-hover:opacity-100 transition-opacity">🔍</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
              {filteredConstituencies.length > 0 ? (
                filteredConstituencies.map((loc, idx) => (
                  <button
                    key={loc}
                    onClick={() => handleSelectLocation(loc)}
                    className="p-8 bg-white/60 backdrop-blur-md rounded-[2rem] border-2 border-slate-100 text-left hover:border-indigo-600 hover:bg-white hover:shadow-2xl transition-all group animate-slide-up"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-1 block">Live Updates Active</span>
                        <h4 className="text-xl font-black text-slate-800">{loc}</h4>
                      </div>
                      <span className="text-2xl group-hover:translate-x-2 transition-transform duration-300">→</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="col-span-full p-12 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold text-lg italic">No constituency matches your search. Every location is updated in the app.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === VotingStep.LOCATION_REJECTED && (
          <div className="max-w-2xl mx-auto mt-12 bg-white p-12 rounded-[3.5rem] shadow-2xl border-4 border-rose-100 text-center relative overflow-hidden">
            <div className="w-32 h-32 bg-rose-100 text-rose-600 rounded-[2.5rem] flex items-center justify-center text-6xl mx-auto mb-10 shadow-xl shadow-rose-50 rotate-3 animate-float">📍</div>
            <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Constituency Mismatch</h2>
            <div className="bg-rose-50 p-8 rounded-3xl mb-10 text-left border border-rose-100 hover:shadow-lg transition-shadow duration-300">
              <p className="text-slate-600 font-bold mb-4 uppercase text-xs tracking-widest">Aadhar Jurisdictional Check</p>
              <div className="space-y-4">
                <div className="flex justify-between items-center group">
                  <span className="text-slate-500 font-medium">Extracted ID Region:</span>
                  <span className="text-rose-600 font-black px-4 py-2 bg-white rounded-xl shadow-sm transition-transform group-hover:scale-105">{user.voterLocation || "ID Region"}</span>
                </div>
                <div className="flex justify-between items-center group">
                  <span className="text-slate-500 font-medium">Selected Voting Booth:</span>
                  <span className="text-indigo-600 font-black px-4 py-2 bg-white rounded-xl shadow-sm transition-transform group-hover:scale-105">{user.selectedLocation}</span>
                </div>
              </div>
            </div>
            <p className="text-slate-500 font-medium mb-10 text-lg leading-relaxed px-6">
              Aadhar residence data is the ground truth. Access to this ballot is blocked because your registration is in a different state.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl hover:bg-rose-600 shadow-2xl transition-all active:scale-95"
            >
              Reset Session
            </button>
          </div>
        )}

        {step === VotingStep.AADHAR_VERIFICATION && (
          <CameraModule 
            title={t.aadhar_verify} 
            description={`Scanning PRIMARY JURISDICTION card. Location extraction will decide if you can enter: ${user.selectedLocation}`}
            onCapture={handleAadharCapture} 
          />
        )}

        {step === VotingStep.VOTER_ID_VERIFICATION && (
          <CameraModule 
            title={t.voter_verify} 
            description="Capturing the person's photo on Voter ID for biometric cross-reference."
            onCapture={handleVoterIdCapture} 
          />
        )}

        {step === VotingStep.FACE_RECOGNITION && (
          <CameraModule 
            title={t.face_verify} 
            description="Comparing live face with the image captured from your Voter ID card."
            onCapture={handleFaceCapture} 
          />
        )}

        {step === VotingStep.VOTING_BOOTH && (
          <div className="space-y-10 animate-slide-up duration-1000">
            <div className="bg-slate-900 text-white p-12 rounded-[4rem] shadow-2xl flex flex-col lg:flex-row items-center justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-1000"></div>
              <div className="relative z-10 text-center lg:text-left">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/20 backdrop-blur-md rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] mb-8 border border-white/10">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Official Digital Ballot
                </div>
                <h2 className="text-6xl font-black mb-4 tracking-tighter leading-tight">{user.selectedLocation?.split(' - ')[0]} <br/><span className="text-indigo-400">2024</span></h2>
                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex items-center justify-center lg:justify-start gap-4 transition-transform origin-left">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl border border-white/10 animate-float">🇮🇳</div>
                    <div>
                      <p className="text-indigo-300 font-black text-[10px] uppercase tracking-widest">Authorized Identity</p>
                      <p className="text-xl font-bold">{user.voterName}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 lg:mt-0 relative z-10 grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl text-center hover:bg-white/10 transition-all shadow-xl">
                  <div className="text-[9px] font-black uppercase text-indigo-300 mb-2">Block Integrity</div>
                  <div className="text-2xl font-black text-white">VALID</div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl text-center hover:bg-white/10 transition-all shadow-xl">
                  <div className="text-[9px] font-black uppercase text-indigo-300 mb-2">Active Node</div>
                  <div className="text-2xl font-black text-white">LIVE</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {CANDIDATES.map((c) => (
                <div
                  key={c.id}
                  className="group bg-white p-2 rounded-[3.5rem] shadow-xl shadow-slate-200/50 card-interaction border-2 border-transparent hover:border-indigo-100 flex flex-col"
                >
                  <div className="p-10 flex flex-col sm:flex-row items-center gap-8 flex-1">
                    <div className={`w-32 h-32 ${c.color} rounded-[2.5rem] flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:rotate-6 transition-transform duration-700`}>
                      {c.logo ? (
                        <img src={c.logo} alt={c.party} className="w-20 h-20 object-contain filter drop-shadow-xl p-3 bg-white/20 rounded-2xl group-hover:scale-110 transition-transform" />
                      ) : (
                        <span className="text-6xl animate-float">{c.symbol}</span>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="flex-1 text-center sm:text-left transition-all duration-300 group-hover:translate-x-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors">{c.party}</h3>
                        <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase self-center group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">{c.id}</span>
                      </div>
                      <p className="text-lg font-bold text-indigo-600 mb-4 opacity-80 group-hover:opacity-100">{c.name}</p>
                      <p className="text-sm text-slate-400 font-medium leading-relaxed italic line-clamp-2">"{c.description}"</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-b-[3.5rem] flex gap-3 transition-colors group-hover:bg-indigo-50/30">
                    <button className="flex-1 py-5 bg-white text-slate-600 rounded-3xl font-black text-xs uppercase tracking-widest hover:text-indigo-600 shadow-sm transition-all border border-slate-100 active:scale-95">
                      Manifesto
                    </button>
                    <button
                      onClick={() => castVote(c.id)}
                      className={`flex-[2] py-5 ${c.color} text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-100/20 hover:brightness-110 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-3`}
                    >
                      Cast Secure Vote
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="max-w-xl mx-auto p-6 bg-indigo-50/50 backdrop-blur-md rounded-3xl border border-indigo-100 flex items-center gap-6 shadow-sm hover:shadow-indigo-200 transition-shadow">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm animate-float">🛡️</div>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed uppercase tracking-wide">
                Privacy Policy: Your choice is obfuscated using Zero-Knowledge proofs before block insertion.
              </p>
            </div>
          </div>
        )}

        {user.hasVoted && step !== VotingStep.BLOCKCHAIN_LEDGER && (
          <div className="max-w-2xl mx-auto text-center py-20 animate-in zoom-in duration-700">
            <div className="relative inline-block mb-12">
              <div className="w-48 h-48 bg-emerald-50 text-emerald-600 rounded-[3.5rem] flex items-center justify-center text-8xl mx-auto shadow-2xl shadow-emerald-100 rotate-12 border-8 border-white animate-bounce">
                ✓
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center text-3xl shadow-2xl rotate-12 transition-transform duration-500">
                <Logo className="w-8 h-8" />
              </div>
            </div>
            <h2 className="text-7xl font-black text-slate-900 mb-6 tracking-tighter leading-none animate-slide-up uppercase">Vote Recorded</h2>
            <p className="text-xl text-slate-600 font-black mb-4 uppercase tracking-[0.3em] animate-pulse text-emerald-500">Stored on BharatNet Ledger</p>
            <p className="text-lg text-slate-500 font-medium mb-12 px-12 leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
              Success! Your ballot for <b>{user.selectedLocation}</b> has been cryptographically signed and permanently saved in the decentralized state machine.
            </p>
            
            <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/50 mb-12 text-left relative overflow-hidden animate-slide-up" style={{animationDelay: '0.4s'}}>
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-indigo-500 to-violet-500 animate-loading-bar"></div>
              <div className="flex items-center justify-between mb-8">
                <span className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Block Receipt: B-7724</span>
                <span className="px-5 py-2 bg-emerald-100 text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-pulse">SAVED & SECURED</span>
              </div>
              <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 group transition-all hover:bg-white hover:shadow-inner">
                  <div className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Transaction Hash</div>
                  <div className="font-mono text-xs text-indigo-600 break-all leading-relaxed bg-white p-4 rounded-xl border border-slate-100 group-hover:border-indigo-200 transition-all">
                    {blockchain[blockchain.length - 1].hash}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:shadow-sm transition-all text-center">
                    <div className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Election Chain Index</div>
                    <div className="text-3xl font-black text-slate-900">#{blockchain.length - 1}</div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:shadow-sm transition-all text-center">
                    <div className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Registry Sync</div>
                    <div className="text-xl font-bold text-slate-900">100% SUCCESS</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{animationDelay: '0.6s'}}>
              <button 
                onClick={() => window.location.reload()}
                className="flex-1 py-6 bg-white border-2 border-slate-100 rounded-[2rem] font-black text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all shadow-xl shadow-slate-100 flex items-center justify-center gap-3 active:scale-95"
              >
                End Session
              </button>
              <button 
                onClick={() => setStep(VotingStep.BLOCKCHAIN_LEDGER)}
                className="flex-[2] py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl hover:bg-indigo-600 shadow-2xl shadow-slate-300 transition-all flex items-center justify-center gap-4 group active:scale-95"
              >
                Public Ledger <span className="group-hover:translate-x-2 transition-transform">→</span>
              </button>
            </div>
          </div>
        )}

        {step === VotingStep.BLOCKCHAIN_LEDGER && (
          <div className="space-y-10 animate-in slide-in-from-right duration-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="animate-slide-up">
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Election Ledger</h2>
                <p className="text-slate-500 font-medium mt-2">Verified history of the 2024 Democratic Protocol.</p>
              </div>
              <button 
                onClick={() => user.hasVoted ? setStep(VotingStep.CONFIRMATION) : setStep(VotingStep.VOTING_BOOTH)}
                className="bg-white border-2 border-slate-100 px-8 py-4 rounded-[1.5rem] font-black text-indigo-600 hover:bg-slate-50 hover:shadow-indigo-100 transition-all shadow-xl shadow-slate-100 flex items-center gap-3 active:scale-95"
              >
                ← Return to Booth
              </button>
            </div>
            
            <div className="grid gap-6">
              {blockchain.slice().reverse().map((block, idx) => (
                <div 
                  key={block.hash} 
                  className="group bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-100/50 hover:border-indigo-400 transition-all relative overflow-hidden animate-slide-up"
                  style={{animationDelay: `${idx * 0.1}s`}}
                >
                  <div className="absolute top-0 right-0 p-10 opacity-5 text-9xl rotate-12 group-hover:rotate-0 transition-transform duration-700">⛓️</div>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-xl group-hover:rotate-6 transition-transform duration-500">#{block.index}</div>
                      <div>
                        <div className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">{block.vote === 'GENESIS' ? 'NETWORK START' : 'SECURE BALLOT'}</div>
                        <div className="text-xl font-bold text-slate-800">{new Date(block.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex-1 max-w-xl">
                      <div className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest group-hover:text-slate-600 transition-colors">SHA-256 Hash</div>
                      <div className="font-mono text-xs bg-slate-50 p-4 rounded-2xl text-slate-500 break-all border border-slate-100 group-hover:text-indigo-600 group-hover:bg-white transition-all">{block.hash}</div>
                    </div>
                    <div className="flex items-center gap-5 bg-emerald-50/50 px-6 py-4 rounded-3xl border border-emerald-100 group-hover:bg-emerald-50 transition-colors">
                      <div className="text-right">
                        <div className="text-[9px] font-black text-slate-400 uppercase">Integrity</div>
                        <div className="text-lg font-black text-emerald-600 animate-pulse">SAVED</div>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform">✓</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </main>

      <footer className="p-12 text-center text-slate-400 bg-white/50 backdrop-blur-xl border-t border-white/20 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-8 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <Logo className="w-8 h-8 opacity-40 group-hover:opacity-100 transition-opacity" />
            <span className="text-xs font-black uppercase tracking-[0.5em] text-slate-300 group-hover:text-slate-600 transition-colors">BharatVote Infrastructure</span>
          </div>
          <p className="mt-8 text-[10px] font-bold text-slate-300 max-w-2xl mx-auto leading-relaxed uppercase tracking-widest">
            Identity verification follows Aadhar jurisdictional protocols. Biometric matching utilizes Voter ID portrait data.
          </p>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(79, 70, 229, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(79, 70, 229, 0.4);
        }
      `}</style>
    </div>
  );
};

export default App;
