
import React, { useRef, useState, useCallback, useEffect } from 'react';

interface CameraModuleProps {
  onCapture: (image: string) => void;
  title: string;
  description: string;
}

const CameraModule: React.FC<CameraModuleProps> = ({ onCapture, title, description }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 1280, height: 720 } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    startCamera();
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const capture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const image = canvasRef.current.toDataURL('image/jpeg');
        onCapture(image);
      }
    }
  }, [onCapture]);

  return (
    <div className="flex flex-col items-center gap-6 bg-white/40 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl border border-white/50 max-w-xl mx-auto mt-8 animate-slide-up duration-500 group/container">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 transition-all group-hover/container:shadow-lg group-hover/container:shadow-indigo-100">
          <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-ping"></span>
          AI Visual Recognition Active
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight transition-all group-hover/container:text-indigo-900">{title}</h2>
        <p className="text-slate-500 font-medium text-sm mt-2">{description}</p>
      </div>
      
      <div className="relative w-full aspect-[4/3] bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl group/camera border-4 border-white/10 transition-all hover:border-indigo-400/30">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover opacity-90 grayscale-[20%] group-hover/camera:grayscale-0 group-hover/camera:scale-[1.02] transition-all duration-1000"
        />
        
        {/* Scifi Scanning Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-scan-line shadow-[0_0_15px_rgba(129,140,248,0.8)]"></div>
          <div className="absolute inset-0 border-[30px] border-black/40 group-hover/camera:border-black/20 transition-all duration-500"></div>
          
          {/* Corner Brackets */}
          <div className="absolute top-12 left-12 w-16 h-16 border-t-4 border-l-4 border-white/80 rounded-tl-xl transition-all group-hover/camera:scale-110"></div>
          <div className="absolute top-12 right-12 w-16 h-16 border-t-4 border-r-4 border-white/80 rounded-tr-xl transition-all group-hover/camera:scale-110"></div>
          <div className="absolute bottom-12 left-12 w-16 h-16 border-b-4 border-l-4 border-white/80 rounded-bl-xl transition-all group-hover/camera:scale-110"></div>
          <div className="absolute bottom-12 right-12 w-16 h-16 border-b-4 border-r-4 border-white/80 rounded-br-xl transition-all group-hover/camera:scale-110"></div>
          
          {/* Center Guide */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover/camera:opacity-60 transition-opacity">
            <div className="w-56 h-56 border-2 border-dashed border-white/50 rounded-full animate-spin-slow"></div>
            <div className="absolute w-1 h-10 bg-white/50"></div>
            <div className="absolute w-10 h-1 bg-white/50"></div>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] text-white font-mono flex items-center gap-2 group-hover/camera:bg-indigo-900/60 transition-colors">
          <span className="text-emerald-400 animate-pulse">●</span> ISO 400 | AF-S | AI-LINK: ESTABLISHED
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <button
        onClick={capture}
        className="group/btn w-full relative overflow-hidden bg-slate-900 text-white font-black py-6 px-10 rounded-[1.5rem] shadow-xl transition-all hover:shadow-indigo-200 active:scale-95 flex items-center justify-center gap-3 overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-3 transition-transform group-hover/btn:scale-110">
          <span className="text-2xl animate-bounce">⚡</span> Verify Identity
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 animate-loading-bar" style={{backgroundSize: '200% 100%'}}></div>
      </button>

      <style>{`
        @keyframes scan-line {
          0% { top: -5%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 105%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CameraModule;
