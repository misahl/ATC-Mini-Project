import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Automaton, RecognizedAutomatonData, ScanApiResponse } from '../../types/automata';
import {
  Camera,
  RotateCw,
  RefreshCw,
  X,
  Upload,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Key,
  Eye,
  Settings,
} from 'lucide-react';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAutomatonExtracted: (
    automaton: Automaton,
    targetConversion?: 'NFA_TO_DFA' | 'ENFA_TO_DFA' | 'ENFA_TO_NFA' | 'DFA_TO_NFA' | 'DFA_MINIMIZATION'
  ) => void;
  onOpenSettings: () => void;
}

type ScanStage = 'camera' | 'preview' | 'analyzing' | 'review';

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onAutomatonExtracted,
  onOpenSettings,
}) => {
  const [stage, setStage] = useState<ScanStage>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<RecognizedAutomatonData | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string>('NFA_TO_DFA');
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [providerUsed, setProviderUsed] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop current video stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Start live camera stream
  const startCamera = useCallback(async (facing: 'environment' | 'user' = cameraFacing) => {
    stopStream();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API (getUserMedia) is not supported by your browser or environment. Please upload an image file instead.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
          console.warn('Video play error:', err);
        });
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser address bar, or upload a photo.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera device found on this system. You can upload an image file below.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera is currently in use by another application. Please close other camera apps and retry.');
      } else {
        setCameraError(`Camera error (${err.name || 'Unknown'}): ${err.message || 'Could not start camera preview.'}`);
      }
      setIsCameraActive(false);
    }
  }, [cameraFacing, stopStream]);

  // Handle modal open/close
  useEffect(() => {
    if (isOpen) {
      setStage('camera');
      setCapturedImage(null);
      setRotation(0);
      setExtractedData(null);
      setAnalysisError(null);
      startCamera();
    } else {
      stopStream();
    }

    return () => {
      stopStream();
    };
  }, [isOpen, startCamera, stopStream]);

  // Switch front/back camera
  const handleToggleFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  // Capture frame from video stream to Canvas
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    stopStream();
    setCapturedImage(dataUrl);
    setRotation(0);
    setStage('preview');
  };

  // Upload photo from file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result as string;
      if (result) {
        stopStream();
        setCapturedImage(result);
        setRotation(0);
        setStage('preview');
      }
    };
    reader.readAsDataURL(file);
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    setRotation(0);
    setExtractedData(null);
    setAnalysisError(null);
    setStage('camera');
    startCamera();
  };

  // Rotate image 90 degrees clockwise
  const handleRotate = () => {
    if (!capturedImage) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const rotatedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedImage(rotatedDataUrl);
      setRotation(prev => (prev + 90) % 360);
    };
    img.src = capturedImage;
  };

  // Send captured image to AI vision backend
  const handleAnalyzeImage = async () => {
    if (!capturedImage) return;
    setStage('analyzing');
    setAnalysisError(null);

    try {
      const res = await fetch('/api/scan-automaton', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: capturedImage }),
      });

      const json: ScanApiResponse = await res.json();

      if (!res.ok || !json.success || !json.data) {
        if (json.error === 'MISSING_API_KEY') {
          setAnalysisError('MISSING_API_KEY');
        } else if (
          json.error === 'INVALID_API_KEY' ||
          (json.message && json.message.toLowerCase().includes('api key'))
        ) {
          setAnalysisError('INVALID_API_KEY');
        } else {
          setAnalysisError(json.message || json.error || 'Failed to recognize the automaton.');
        }
        setStage('preview');
        return;
      }

      setExtractedData(json.data);
      setProviderUsed(json.provider || 'AI Vision');
      if (json.data.detectedTargetConversion) {
        setSelectedTarget(json.data.detectedTargetConversion);
      } else if (json.data.type === 'ENFA') {
        setSelectedTarget('ENFA_TO_DFA');
      } else if (json.data.type === 'NFA') {
        setSelectedTarget('NFA_TO_DFA');
      } else {
        setSelectedTarget('DFA_TO_NFA');
      }
      setStage('review');
    } catch (err: any) {
      console.error('Scan request error:', err);
      setAnalysisError(err.message || 'Network error reaching AI Vision backend.');
      setStage('preview');
    }
  };

  // Provide quick manual entry with notebook template
  const handleEnterManually = () => {
    setExtractedData({
      type: 'ENFA',
      states: ['q0', 'q1', 'q2'],
      alphabet: ['0', '1'],
      initialState: 'q0',
      finalStates: ['q2'],
      transitions: {
        q0: { '0': ['q0'], '1': [], 'ε': ['q1'] },
        q1: { '0': [], '1': ['q2'], 'ε': [] },
        q2: { '0': [], '1': [], 'ε': [] },
      },
      questionText: 'Convert ε-NFA to DFA using ε-closure and subset construction',
      detectedTargetConversion: 'ENFA_TO_DFA',
      uncertainties: [],
    });
    setSelectedTarget('ENFA_TO_DFA');
    setProviderUsed('Manual Setup');
    setStage('review');
  };

  // Modify cell during review
  const handleReviewCellChange = (state: string, symbol: string, value: string) => {
    if (!extractedData) return;
    const tokens = value.split(/[\s,]+/).map(s => s.trim()).filter(Boolean);

    const updatedTransitions = {
      ...extractedData.transitions,
      [state]: {
        ...(extractedData.transitions[state] || {}),
        [symbol]: tokens,
      },
    };

    setExtractedData({
      ...extractedData,
      transitions: updatedTransitions,
    });
  };

  // Toggle final state in review
  const handleReviewToggleFinal = (state: string) => {
    if (!extractedData) return;
    const isFinal = extractedData.finalStates.includes(state);
    const updatedFinals = isFinal
      ? extractedData.finalStates.filter(s => s !== state)
      : [...extractedData.finalStates, state];

    setExtractedData({
      ...extractedData,
      finalStates: updatedFinals,
    });
  };

  // Confirm and solve automaton
  const handleConfirmAndSolve = () => {
    if (!extractedData) return;

    const automaton: Automaton = {
      name: extractedData.questionText ? `Photo: ${extractedData.questionText.slice(0, 30)}...` : `Scanned ${extractedData.type}`,
      type: extractedData.type,
      states: [...extractedData.states],
      alphabet: [...extractedData.alphabet],
      initialState: extractedData.initialState,
      finalStates: [...extractedData.finalStates],
      transitions: extractedData.transitions,
    };

    onAutomatonExtracted(automaton, selectedTarget as any);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#222d3d] border border-slate-700/60 rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-200 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/60 bg-[#1a2535]">
          <div className="flex items-center gap-2 font-mono">
            <Camera className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-sm text-white">Live Camera Automata Scanner</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              AI Vision
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="API Key Configuration"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Close Scanner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hidden inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Body content based on stage */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* STAGE 1: LIVE CAMERA VIEW */}
          {stage === 'camera' && (
            <div className="space-y-4">
              {/* Video container */}
              <div className="relative bg-[#1a2535] rounded-lg border border-slate-700/60 overflow-hidden aspect-[4/3] sm:aspect-[16/9] flex items-center justify-center">
                {isCameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="p-6 text-center space-y-3">
                    {cameraError ? (
                      <div className="space-y-2 max-w-md mx-auto">
                        <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                        <div className="text-sm font-semibold text-white">Camera Unavailable</div>
                        <p className="text-xs text-slate-400 leading-relaxed">{cameraError}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
                        <p className="text-xs text-slate-400 font-mono">Initializing camera stream...</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Viewfinder crosshairs / alignment guide */}
                {isCameraActive && (
                  <div className="absolute inset-6 border-2 border-dashed border-indigo-400/40 rounded pointer-events-none flex flex-col justify-between p-3">
                    <div className="text-[11px] font-mono text-indigo-300/80 bg-black/60 px-2 py-0.5 rounded self-start">
                      Align notebook diagram or transition table inside frame
                    </div>
                    <div className="text-[10px] text-slate-400 bg-black/60 px-2 py-0.5 rounded self-end">
                      Hold steady for clear handwritten symbols
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image File</span>
                  </button>

                  <button
                    onClick={handleToggleFacing}
                    className="flex items-center gap-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
                    title="Switch between front and rear camera"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Flip: {cameraFacing === 'environment' ? 'Rear' : 'Front'}</span>
                  </button>
                </div>

                <button
                  onClick={handleCapturePhoto}
                  disabled={!isCameraActive}
                  className="flex items-center gap-2 px-6 py-2.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-mono font-semibold transition-colors shadow-sm"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Photo</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: PREVIEW & ADJUST PHOTO */}
          {stage === 'preview' && capturedImage && (
            <div className="space-y-4">
              {analysisError && (() => {
                const isApiKeyIssue =
                  analysisError === 'MISSING_API_KEY' ||
                  analysisError === 'INVALID_API_KEY' ||
                  analysisError.toLowerCase().includes('api key') ||
                  analysisError.toLowerCase().includes('invalid_argument');

                return (
                  <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-800/80 text-xs space-y-3">
                    <div className="flex items-center gap-2 font-semibold text-rose-300">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                      <span className="text-amber-200">
                        {isApiKeyIssue
                          ? 'Google Gemini API Key Required or Invalid'
                          : 'AI Vision Processing Notice'}
                      </span>
                    </div>

                    {isApiKeyIssue ? (
                      <div className="space-y-3 text-slate-300">
                        <p className="leading-relaxed text-slate-300 text-xs">
                          Automatic handwriting recognition requires an active Google Gemini API key (free tier available at{' '}
                          <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-400 underline font-mono"
                          >
                            Google AI Studio
                          </a>
                          ) or an OpenAI key.
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            onClick={onOpenSettings}
                            className="px-3.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs flex items-center gap-1.5 font-semibold transition-colors shadow-sm"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>Configure API Key</span>
                          </button>

                          <button
                            onClick={handleEnterManually}
                            className="px-3.5 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs flex items-center gap-1.5 font-semibold transition-colors shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Enter Transitions Manually & Solve</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 text-slate-300">
                        <p className="text-rose-200 text-xs">{analysisError}</p>
                        <button
                          onClick={handleEnterManually}
                          className="px-3.5 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-xs flex items-center gap-1.5 font-semibold transition-colors shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Enter Transitions Manually & Solve</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Photo preview container */}
              <div className="relative bg-[#1a2535] rounded-lg border border-slate-700/60 overflow-hidden max-h-[50vh] flex items-center justify-center p-2">
                <img
                  src={capturedImage}
                  alt="Captured Question"
                  className="max-h-[46vh] max-w-full object-contain rounded"
                />
              </div>

              {/* Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRetake}
                    className="flex items-center gap-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake Photo</span>
                  </button>

                  <button
                    onClick={handleRotate}
                    className="flex items-center gap-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Rotate 90°{rotation > 0 ? ` (${rotation}°)` : ''}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEnterManually}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
                    title="Enter or edit transitions directly from your photo"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Enter Manually</span>
                  </button>

                  <button
                    onClick={handleAnalyzeImage}
                    className="flex items-center gap-2 px-6 py-2.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-semibold transition-colors shadow-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Solve With AI Vision</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 3: ANALYZING LOADER */}
          {stage === 'analyzing' && (
            <div className="py-12 px-4 text-center space-y-4 max-w-md mx-auto font-mono">
              <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
              <div className="space-y-1.5">
                <div className="text-sm font-semibold text-white">Analyzing Automaton Question...</div>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  The multimodal vision model is extracting states, input symbols, initial state arrow, double circles (final states), and transition rules.
                </p>
              </div>
              <div className="p-3 rounded bg-[#1a2535] border border-slate-700/60 text-[11px] text-slate-500 space-y-1 text-left">
                <div>✓ Reading handwritten arrows & labels...</div>
                <div>✓ Detecting concentric double circles...</div>
                <div>✓ Checking for epsilon (ε) transitions...</div>
              </div>
            </div>
          )}

          {/* STAGE 4: REVIEW & CONFIRM */}
          {stage === 'review' && extractedData && (
            <div className="space-y-5">
              {/* Question Banner & Target algorithm */}
              <div className="p-3.5 rounded bg-[#1a2535] border border-slate-700/60 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-2">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-white">Automaton Recognized</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {extractedData.type}
                    </span>
                    <span className="text-slate-500 text-[11px]">via {providerUsed}</span>
                  </div>

                  {/* Target Conversion dropdown */}
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-slate-400">Target Conversion:</span>
                    <select
                      value={selectedTarget}
                      onChange={e => setSelectedTarget(e.target.value)}
                      className="bg-[#222d3d] border border-slate-700 text-slate-200 rounded px-2.5 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="NFA_TO_DFA">NFA → DFA (Subset Construction)</option>
                      <option value="ENFA_TO_DFA">ε-NFA → DFA (Closure + Subset)</option>
                      <option value="ENFA_TO_NFA">ε-NFA → NFA (Epsilon Elimination)</option>
                      <option value="DFA_TO_NFA">DFA → NFA (Singleton Embedding)</option>
                      <option value="DFA_MINIMIZATION">DFA Minimizer (Table-Filling)</option>
                    </select>
                  </div>
                </div>

                {extractedData.questionText && (
                  <div className="text-xs text-slate-300">
                    <span className="text-slate-500 font-mono">Recognized Question: </span>
                    <span className="font-medium italic">"{extractedData.questionText}"</span>
                  </div>
                )}
              </div>

              {/* Uncertainty Alerts if any */}
              {extractedData.uncertainties && extractedData.uncertainties.length > 0 && (
                <div className="p-3.5 rounded bg-amber-950/30 border border-amber-800/80 space-y-2 text-xs">
                  <div className="font-mono font-semibold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Please Verify Uncertain Elements:</span>
                  </div>
                  <ul className="space-y-1 text-amber-200/90 pl-5 list-disc text-[11px]">
                    {extractedData.uncertainties.map((u, i) => (
                      <li key={i}>
                        <strong className="text-amber-100">{u.element}:</strong> {u.reason}
                        {u.suggestion && <span className="text-amber-300 ml-1">({u.suggestion})</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Side-by-side: Photo thumbnail + Extracted Transition Table */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Photo Thumbnail */}
                {capturedImage && (
                  <div className="bg-[#1a2535] p-2.5 rounded border border-slate-700/60 space-y-2">
                    <div className="text-[11px] font-mono text-slate-400 font-semibold flex justify-between">
                      <span>Source Photograph</span>
                      <button
                        onClick={handleRetake}
                        className="text-indigo-400 hover:underline"
                      >
                        Retake
                      </button>
                    </div>
                    <img
                      src={capturedImage}
                      alt="Source Photograph"
                      className="w-full max-h-48 object-contain rounded border border-slate-700/60"
                    />
                    <div className="text-[10px] text-slate-500 text-center font-mono">
                      Check table against photo before solving
                    </div>
                  </div>
                )}

                {/* Editable Extracted Transition Table */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex flex-wrap items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-slate-300">
                      Extracted Transition Function δ(State, Symbol)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Click * to toggle final states
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded border border-slate-700/60 bg-[#1a2535]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-700/60 bg-slate-900 font-mono text-slate-300">
                          <th className="py-2 px-3 w-32 border-r border-slate-700/60">State</th>
                          {extractedData.alphabet.map(sym => (
                            <th key={sym} className="py-2 px-3 text-center border-r border-slate-700/60 text-cyan-400">
                              {sym}
                            </th>
                          ))}
                          {extractedData.type === 'ENFA' && (
                            <th className="py-2 px-3 text-center border-r border-slate-700/60 text-purple-400">
                              ε
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-mono">
                        {extractedData.states.map(st => {
                          const isInit = st === extractedData.initialState;
                          const isFin = extractedData.finalStates.includes(st);
                          const symbols = extractedData.type === 'ENFA'
                            ? [...extractedData.alphabet, 'ε']
                            : extractedData.alphabet;

                          return (
                            <tr key={st} className="hover:bg-slate-900/40">
                              <td className="py-1.5 px-3 font-semibold text-slate-200 border-r border-slate-700/60 flex items-center justify-between">
                                <span>
                                  <span className="text-slate-400 mr-1">{isInit ? '→' : ''}</span>
                                  {st}
                                </span>
                                <button
                                  onClick={() => handleReviewToggleFinal(st)}
                                  className={`text-xs px-1.5 py-0.2 rounded border ${
                                    isFin
                                      ? 'bg-purple-950 border-purple-600 text-purple-200 font-bold'
                                      : 'bg-slate-800 border-slate-700 text-slate-400'
                                  }`}
                                  title="Toggle Final State"
                                >
                                  {isFin ? '*Final' : 'Normal'}
                                </button>
                              </td>

                              {symbols.map(sym => {
                                const targets = extractedData.transitions[st]?.[sym] || [];
                                const cellVal = targets.join(', ');

                                return (
                                  <td key={sym} className="py-1 px-2 border-r border-slate-700/60 last:border-none">
                                    <input
                                      type="text"
                                      placeholder="∅"
                                      value={cellVal}
                                      onChange={e => handleReviewCellChange(st, sym, e.target.value)}
                                      className="w-full bg-[#222d3d] border border-slate-700/60 rounded px-2 py-1 text-xs text-center text-slate-200 font-mono focus:border-indigo-500 focus:outline-none"
                                    />
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Confirm and solve button */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-700/60">
                <button
                  onClick={handleRetake}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                >
                  Discard & Retake
                </button>

                <button
                  onClick={handleConfirmAndSolve}
                  className="flex items-center gap-2 px-6 py-2.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-semibold shadow-sm transition-colors"
                >
                  <span>Confirm & Generate Mathematical Solution</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
