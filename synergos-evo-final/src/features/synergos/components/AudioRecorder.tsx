import React, { useState, useRef, useEffect } from 'react';
import { Mic } from 'lucide-react';
import axios from 'axios';

interface AudioRecorderProps {
    theme: any;
    onTranscriptionComplete: (text: string) => void;
}

export default function AudioRecorder({ theme, onTranscriptionComplete }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } else {
            setRecordingTime(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

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

                setIsLoading(true);

                try {
                    // Use Secure Proxy Path to avoid Mixed Content (HTTPS -> HTTP)
                    const response = await axios.post('/api/n8n-transcribe', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });

                    // Robust response parsing
                    let rawText = "";
                    if (response.data.text) {
                        rawText = response.data.text;
                    } else if (response.data.output) {
                        rawText = response.data.output;
                    } else if (typeof response.data === 'string') {
                        rawText = response.data;
                    } else {
                        rawText = JSON.stringify(response.data);
                    }

                    const cleanText = (text: string) => {
                        const noisePhrases = [
                            "you no se de que",
                            "Subtítulos realizados por",
                            "Amara.org",
                            "MBC"
                        ];
                        let cleaned = text;
                        noisePhrases.forEach(phrase => {
                            // Escape special regex characters to prevent "..." matching any char
                            const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                            cleaned = cleaned.replace(new RegExp(escapedPhrase, 'gi'), '');
                        });
                        return cleaned.trim();
                    };

                    const finalText = cleanText(rawText);

                    if (finalText) {
                        onTranscriptionComplete(finalText);
                    } else {
                        console.warn("Transcription was empty after cleaning or failed.");
                        alert("No se pudo obtener texto del audio. Intente nuevamente.");
                    }

                } catch (error) {
                    console.error("Error uploading audio:", error);
                    alert("Error al enviar el audio al servidor N8N. Verifique la consola.");
                } finally {
                    setIsLoading(false);
                }

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("No se pudo acceder al micrófono. Verifique los permisos.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div
            className="p-6 rounded-3xl shadow-md border flex flex-col items-center justify-center text-center cursor-pointer hover:scale-[1.02] transition-transform"
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
            onClick={() => !isRecording ? startRecording() : stopRecording()}
        >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isRecording ? 'animate-pulse' : ''}`} style={{ backgroundColor: '#F43F5E' }}>
                {isRecording ? <div className="w-6 h-6 bg-white rounded-sm" /> : <Mic className="w-8 h-8 text-white" />}
            </div>
            <h3 className="font-bold text-lg" style={{ color: theme.text }}>
                {isRecording ? formatTime(recordingTime) : (isLoading ? "Procesando..." : "Grabar Audio")}
            </h3>
            {isRecording && <p className="text-sm opacity-70" style={{ color: theme.text }}>Grabando...</p>}
        </div>
    );
}
