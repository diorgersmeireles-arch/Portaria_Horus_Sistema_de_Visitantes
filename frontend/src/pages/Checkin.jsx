import React, { useState, useRef, useEffect } from 'react';
import { Search, Camera, Check, X, AlertTriangle, User, GraduationCap } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Checkin() {
  const [mode, setMode] = useState('student'); // 'student' | 'visitor'
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [photoData, setPhotoData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        stopCamera();
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao acessar câmera' });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setPhotoData(dataUrl);
      stopCamera();
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setMessage(null);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length < 2) {
      setResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('horus_token');
        const endpoint = mode === 'student' 
          ? `/student/search?q=${encodeURIComponent(query)}`
          : `/visitor/search/${encodeURIComponent(query)}`;
        
        const res = await fetch(`${API_URL}${endpoint}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Erro na busca' });
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleCheckin = async () => {
    if (!selectedPerson) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('horus_token');
      const endpoint = mode === 'student' 
        ? '/checkin/student' 
        : '/checkin/visitor';
      
      const body = mode === 'student' 
        ? { query: selectedPerson.matricula || selectedPerson.full_name, gate_id: 'principal' }
        : { 
            full_name: selectedPerson.full_name,
            cpf: selectedPerson.cpf,
            visitor_type: 'visitante',
            reason: 'Visita',
            department: 'Administração',
            gate_id: 'principal'
          };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage({ 
          type: mode === 'student' && data.is_late ? 'warning' : 'success',
          text: mode === 'student' 
            ? `${data.full_name} - ${data.is_late ? `ATRASO: ${data.late_minutes} min` : 'Entrada OK'}`
            : `Entrada registrada: ${data.visitor}`
        });
        setSelectedPerson(null);
        setSearchQuery('');
        setResults([]);
        setPhotoData(null);
      } else {
        setMessage({ type: 'error', text: data.detail || 'Erro no check-in' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao registrar' });
    } finally {
      setIsLoading(false);
    }
  };

  const StatusBadge = ({ type, data }) => {
    if (type === 'student') {
      if (data.is_late) {
        return (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            <AlertTriangle size={16} />
            <span className="text-sm font-medium">ATRASO: {data.late_minutes} min</span>
          </div>
        );
      }
      return (
        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
          <Check size={16} />
          <span className="text-sm font-medium">No horário</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Portaria HÓRUS</h1>
          <p className="text-slate-400">Registro rápido de entrada</p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setMode('student'); setSearchQuery(''); setResults([]); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                mode === 'student' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              <GraduationCap size={20} />
              Aluno
            </button>
            <button
              onClick={() => { setMode('visitor'); setSearchQuery(''); setResults([]); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all ${
                mode === 'visitor' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              <User size={20} />
              Visitante
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder={mode === 'student' ? "Buscar por RA, CPF ou nome..." : "Buscar por nome, CPF ou RG..."}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-slate-700 text-white placeholder-slate-400 py-4 pl-12 pr-4 rounded-xl border border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              autoFocus
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {results.length > 0 && !selectedPerson && (
            <div className="bg-slate-700 rounded-xl overflow-hidden mb-4 max-h-60 overflow-y-auto">
              {results.map((person) => (
                <button
                  key={person.id}
                  onClick={() => { setSelectedPerson(person); setResults([]); }}
                  className="w-full text-left px-4 py-3 hover:bg-slate-600 border-b border-slate-600 last:border-0 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{person.full_name}</div>
                      {mode === 'student' && (
                        <div className="text-slate-400 text-sm">{person.matricula} - {person.class_name}</div>
                      )}
                      {mode === 'visitor' && (
                        <div className="text-slate-400 text-sm">{person.cpf || person.rg}</div>
                      )}
                    </div>
                    {person.is_blocked && (
                      <X className="text-red-500" size={20} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedPerson && (
            <div className="bg-slate-700 rounded-xl p-4 mb-4 border border-indigo-500/30">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">{selectedPerson.full_name}</h3>
                  {mode === 'student' && (
                    <p className="text-slate-400 text-sm">{selectedPerson.matricula} - {selectedPerson.class_name}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedPerson(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {mode === 'student' && selectedPerson.can_leave_alone && (
                <div className="bg-emerald-500/20 text-emerald-400 text-sm px-3 py-2 rounded-lg mb-4">
                  Autorizado a sair sozinho
                </div>
              )}

              {!photoData && (
                <button
                  onClick={startCamera}
                  className="w-full flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-500 text-white py-3 rounded-xl transition-colors"
                >
                  <Camera size={20} />
                  Capturar foto
                </button>
              )}

              {photoData && (
                <div className="mb-4">
                  <img src={photoData} alt="Foto" className="w-32 h-32 object-cover rounded-xl mx-auto border-2 border-indigo-500" />
                </div>
              )}

              <button
                onClick={handleCheckin}
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={20} />
                    Registrar Entrada
                  </>
                )}
              </button>
            </div>
          )}

          {showCamera && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 rounded-2xl p-4 max-w-lg w-full">
                <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl mb-4" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="flex gap-2">
                  <button
                    onClick={capturePhoto}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium"
                  >
                    Capturar
                  </button>
                  <button
                    onClick={stopCamera}
                    className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-3 rounded-xl font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
              message.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {message.type === 'success' && <Check size={20} />}
              {message.type === 'warning' && <AlertTriangle size={20} />}
              {message.type === 'error' && <X size={20} />}
              <span className="font-medium">{message.text}</span>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-slate-500 text-sm">
          Pressione <kbd className="bg-slate-700 px-2 py-1 rounded">Enter</kbd> para buscar
        </div>
      </div>
    </div>
  );
}