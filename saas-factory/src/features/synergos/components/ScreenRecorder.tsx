import React, { useState, useRef } from 'react';
import { Monitor } from 'lucide-react';
import axios from 'axios';

interface ScreenRecorderProps {
    theme: any;
    onDataExtracted: (text: string) => void;
}

export default function ScreenRecorder({ theme, onDataExtracted }: ScreenRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) chunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                const formData = new FormData();
                formData.append('file', blob, 'screen-recording.webm');

                setIsLoading(true);

                try {
                    // Using the same endpoint for now, or a specific one if available. 
                    // Assuming the backend can handle video/screen recordings at the same endpoint or a similar one.
                    // Given the prompt, we use the transcribe webhook or similar.
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
                        onDataExtracted(finalText);
                    } else {
                        console.warn("Transcription was empty (likely silent video).");
                        // Fallback for silent video as requested
                        onDataExtracted("[Video sin audio detectado. Contenido visual compartido para análisis.]");
                    }

                } catch (error) {
                    console.error("Error sharing screen:", error);
                    alert("Error al enviar la grabación de pantalla.");
                } finally {
                    setIsLoading(false);
                }

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error sharing screen:", error);
            // User might have cancelled the selection
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
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
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm" style={{ backgroundColor: '#1D4ED8' }}>
                <Monitor className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-bold text-lg" style={{ color: theme.text }}>
                {isRecording ? "Detener Deep Capture" : (isLoading ? "Procesando..." : "Deep Capture (Meetings)")}
            </h3>
            <p className="text-[10px] opacity-60" style={{ color: theme.text }}>Extracción sigilosa de audio e imagen HD</p>
            {isRecording && <p className="text-sm opacity-70" style={{ color: theme.text }}>Capturando flujo de datos...</p>}
        </div>
    );
}
