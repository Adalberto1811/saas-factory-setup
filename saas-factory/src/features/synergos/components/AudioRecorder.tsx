import React, { useState, useRef, useEffect } from 'react';
import { Mic, Pause, Play, Square, Loader2 } from 'lucide-react';
import axios from 'axios';

interface AudioRecorderProps {
    theme: any;
    onTranscriptionComplete: (text: string) => void;
}

export default function AudioRecorder({ theme, onTranscriptionComplete }: AudioRecorderProps) {
    const [status, setStatus] = useState<'idle' | 'recording' | 'paused' | 'processing'>('idle');
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (status === 'recording') {
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } else if (status === 'idle') {
            setRecordingTime(0);
            if (timerRef.current) clearInterval(timerRef.current);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const formData = new FormData();
                formData.append('file', audioBlob, 'voice-note.webm');

                setStatus('processing');

                try {
                    const response = await axios.post('/api/n8n-transcribe', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    let rawText = response.data.text || response.data.output || (typeof response.data === 'string' ? response.data : JSON.stringify(response.data));

                    const cleanText = (text: string) => {
                        const noisePhrases = ["you no se de que", "Subtítulos realizados por", "Amara.org", "MBC"];
                        let cleaned = text;
                        noisePhrases.forEach(phrase => {
                            const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                            cleaned = cleaned.replace(new RegExp(escapedPhrase, 'gi'), '');
                        });
                        return cleaned.trim();
                    };

                    const finalText = cleanText(rawText);

                    if (finalText && finalText !== "{}") {
                        onTranscriptionComplete(finalText);
                    } else {
                        alert("No se pudo obtener texto del audio. Intente nuevamente.");
                    }
                } catch (error) {
                    console.error("Error uploading audio:", error);
                    alert("Error al enviar el audio al servidor de transcripción.");
                } finally {
                    setStatus('idle');
                    stream.getTracks().forEach(track => track.stop());
                }
            };

            mediaRecorder.start();
            setStatus('recording');
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("No se pudo acceder al micrófono.");
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && status === 'recording') {
            mediaRecorderRef.current.pause();
            setStatus('paused');
        }
    };

    const resumeRecording = () => {
        if (mediaRecorderRef.current && status === 'paused') {
            mediaRecorderRef.current.resume();
            setStatus('recording');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && (status === 'recording' || status === 'paused')) {
            mediaRecorderRef.current.stop();
        }
    };

    return (
        <div
            className="p-6 rounded-3xl shadow-md border flex flex-col items-center justify-center text-center group transition-all"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all ${status === 'recording' ? 'animate-pulse bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'bg-rose-600'}`}>
                {status === 'idle' && (
                    <button onClick={startRecording} className="w-full h-full flex items-center justify-center">
                        <Mic className="w-8 h-8 text-white" />
                    </button>
                )}
                {(status === 'recording' || status === 'paused') && (
                    <button onClick={stopRecording} className="w-full h-full flex items-center justify-center">
                        <Square className="w-6 h-6 text-white" fill="white" />
                    </button>
                )}
                {status === 'processing' && <Loader2 className="w-8 h-8 text-white animate-spin" />}
            </div>

            <div className="space-y-1">
                <h3 className="font-bold text-lg" style={{ color: theme.text }}>
                    {status === 'idle' ? "Grabar Audio" :
                        status === 'processing' ? "Procesando..." :
                            formatTime(recordingTime)}
                </h3>
                {status !== 'idle' && status !== 'processing' && (
                    <div className="flex items-center justify-center gap-4 mt-2">
                        {status === 'recording' ? (
                            <button onClick={pauseRecording} className="p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700">
                                <Pause size={18} />
                            </button>
                        ) : (
                            <button onClick={resumeRecording} className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500">
                                <Play size={18} />
                            </button>
                        )}
                        <span className="text-xs font-bold uppercase tracking-widest opacity-60">
                            {status === 'paused' ? 'Pausado' : 'Grabando'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
