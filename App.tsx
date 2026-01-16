
import React, { useState, useCallback, useRef } from 'react';
import { analyzeImageForVideoPrompt } from './services/geminiService';
import { AnalysisResult, HistoryItem } from './types';

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.split(',')[0].split(':')[1].split(';')[0];
      
      const analysisResult = await analyzeImageForVideoPrompt(base64Data, mimeType);
      setResult(analysisResult);

      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(7),
        imageUrl: selectedImage,
        result: analysisResult,
        timestamp: Date.now(),
      };
      setHistory(prev => [newItem, ...prev.slice(0, 9)]);
    } catch (err) {
      setError("Failed to analyze image. Please try again.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Prompt copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">VidioVision AI</h1>
            <p className="text-xs text-slate-400 font-medium">IMAGE TO CINEMATIC MOTION</p>
          </div>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          Reset
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Input & History (4/12) */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl overflow-hidden relative">
            <h2 className="text-2xl font-bold mb-2">Upload Your Concept</h2>
            <p className="text-slate-400 mb-8 text-sm">
              ដាក់រូបភាពរបស់អ្នកចូល ដើម្បីអោយ AI វិភាគ និងបង្កើតជា Prompt សម្រាប់ផលិតវីដេអូ។
            </p>

            <div 
              onClick={triggerFileUpload}
              className={`border-2 border-dashed rounded-2xl p-4 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[300px]
                ${selectedImage ? 'border-indigo-500/50 bg-slate-800/50' : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/30'}
              `}
            >
              {selectedImage ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img 
                    src={selectedImage} 
                    alt="Preview" 
                    className="max-h-[250px] w-auto rounded-xl shadow-2xl object-contain"
                  />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(null); setResult(null); }}
                    className="absolute -top-2 -right-2 bg-red-500 p-1.5 rounded-full text-white hover:bg-red-600 shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-slate-300">Click to upload image</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG or WebP</p>
                </div>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />

            <div className="mt-8">
              <button
                disabled={!selectedImage || isAnalyzing}
                onClick={handleAnalyze}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-2xl
                  ${!selectedImage || isAnalyzing 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  }
                `}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Analyzing Vision...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z" />
                    </svg>
                    Craft Motion Prompt
                  </>
                )}
              </button>
              {error && <p className="text-red-400 text-center mt-4 text-sm font-medium">{error}</p>}
            </div>
          </section>

          {/* History */}
          {history.length > 0 && (
            <div className="bg-slate-900/40 rounded-3xl p-6 border border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">History</h3>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {history.map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => { setResult(item.result); setSelectedImage(item.imageUrl); }}
                    className="shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-slate-700 hover:border-indigo-500 transition-all active:scale-95"
                  >
                    <img src={item.imageUrl} alt="History" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Results (8/12) */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Main Prompt Card */}
              <div className="bg-indigo-950/20 rounded-3xl p-8 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-32 h-32">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                   </svg>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2 text-indigo-400 font-bold uppercase tracking-widest text-xs">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                    Cinematic Vision
                  </div>
                  <h3 className="text-2xl font-bold mb-6">{result.concept}</h3>
                  
                  <div className="bg-black/60 rounded-2xl p-6 border border-white/5 relative group mb-6">
                    <p className="text-xl text-indigo-100 leading-relaxed italic font-medium">
                      "{result.videoPrompt}"
                    </p>
                    <button 
                      onClick={() => copyToClipboard(result.videoPrompt)}
                      className="mt-6 flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 rounded-lg text-indigo-300 text-sm font-semibold transition-all border border-indigo-500/20"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                      </svg>
                      Copy Prompt
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {result.styleKeywords.map((kw, i) => (
                      <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-xs text-slate-400 border border-white/5">
                        #{kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Technical Visualizer Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Camera Lens Visualizer */}
                <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-4">
                    {/* Stylized Lens Drawing */}
                    <div className="w-24 h-24 rounded-full border-4 border-slate-700 flex items-center justify-center relative bg-slate-800 shadow-inner">
                      <div className="w-16 h-16 rounded-full border-2 border-slate-600 bg-slate-900 flex items-center justify-center">
                         <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400/50 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-white opacity-20"></div>
                         </div>
                      </div>
                      {/* Aperture blades simulation */}
                      <div className="absolute inset-0 border-[10px] border-slate-800/50 rounded-full"></div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-indigo-500 text-[10px] font-black px-2 py-0.5 rounded shadow-lg">LENS</div>
                  </div>
                  <h4 className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">Recommended Lens</h4>
                  <p className="text-lg font-bold">{result.lensType}</p>
                </div>

                {/* Camera Rig/Movement Visualizer */}
                <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 bg-slate-800 rounded-2xl flex items-center justify-center border-2 border-slate-700">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-indigo-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m15 11.25-3-3m0 0-3 3m3-3v7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      {/* Stylized motion arrows */}
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 animate-bounce">
                        <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"/></svg>
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-indigo-500 text-[10px] font-black px-2 py-0.5 rounded shadow-lg">STYLE</div>
                  </div>
                  <h4 className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">Camera Rig & Path</h4>
                  <p className="text-lg font-bold">{result.suggestedMotion}</p>
                  <p className="text-xs text-slate-500 mt-1">{result.cinematographicStyle}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[500px] border-2 border-slate-800 border-dashed rounded-3xl flex flex-col items-center justify-center p-12 text-center opacity-60">
              <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 relative">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-slate-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                 </svg>
                 <div className="absolute inset-0 rounded-full border border-slate-700 animate-ping opacity-20"></div>
              </div>
              <h3 className="text-xl font-bold text-slate-400 mb-2">Waiting for concept...</h3>
              <p className="text-sm text-slate-500 max-w-sm">សូម Upload រូបភាព ដើម្បីអោយ AI បង្ហាញពីបច្ចេកទេស និង Prompt សម្រាប់ផលិតវីដេអូ។</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 text-center text-slate-600 text-xs px-6">
        <p>© 2024 VidioVision AI • Intelligence by Gemini 3</p>
        <p className="mt-2 max-w-lg mx-auto leading-relaxed">
          Create cinematic shots by following the AI's suggested lens and motion paths.
        </p>
      </footer>
    </div>
  );
};

export default App;
