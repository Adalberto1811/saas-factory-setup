"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

export interface TimerState {
    isActive: boolean;
    isPaused: boolean;
    currentTime: number; // en segundos
    currentRep: number;
    isResting: boolean;
    currentStepIndex: number;
}

export function useTimerEngine(workoutSteps: any[], onFinish?: (stats: any) => void) {
    const [state, setState] = useState<TimerState>({
        isActive: false,
        isPaused: false,
        currentTime: 0,
        currentRep: 1,
        isResting: false,
        currentStepIndex: 0,
    });

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number | null>(null);

    const currentStep = workoutSteps[state.currentStepIndex];

    const start = useCallback(() => {
        setState(s => ({ ...s, isActive: true, isPaused: false }));
        startTimeRef.current = Date.now() - (state.currentTime * 1000);
    }, [state.currentTime]);

    const pause = useCallback(() => {
        setState(s => ({ ...s, isPaused: true }));
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    const reset = useCallback(() => {
        setState({
            isActive: false,
            isPaused: false,
            currentTime: 0,
            currentRep: 1,
            isResting: false,
            currentStepIndex: 0,
        });
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    const nextStep = useCallback(() => {
        setState(s => {
            if (s.currentStepIndex < workoutSteps.length - 1) {
                return {
                    ...s,
                    currentStepIndex: s.currentStepIndex + 1,
                    currentTime: 0,
                    currentRep: 1,
                    isResting: false
                };
            }
            return { ...s, isActive: false };
        });
    }, [workoutSteps.length]);

    useEffect(() => {
        if (state.isActive && !state.isPaused) {
            timerRef.current = setInterval(() => {
                const now = Date.now();
                const elapsed = Math.floor((now - (startTimeRef.current || now)) / 1000);

                setState(s => {
                    const currentStep = workoutSteps[s.currentStepIndex];
                    if (!currentStep) return { ...s, isActive: false };

                    // Lógica de transición
                    if (s.isResting) {
                        if (elapsed >= currentStep.restSeconds) {
                            // Fin del descanso
                            if (s.currentRep < currentStep.repetitions) {
                                startTimeRef.current = Date.now();
                                return { ...s, isResting: false, currentRep: s.currentRep + 1, currentTime: 0 };
                            } else {
                                // Fin de la serie
                                if (s.currentStepIndex < workoutSteps.length - 1) {
                                    startTimeRef.current = Date.now();
                                    return { ...s, currentStepIndex: s.currentStepIndex + 1, currentRep: 1, isResting: false, currentTime: 0 };
                                } else {
                                    if (onFinish) {
                                        onFinish({
                                            durationSeconds: elapsed,
                                            completedSteps: workoutSteps.length
                                        });
                                    }
                                    return { ...s, isActive: false, currentTime: elapsed };
                                }
                            }
                        }
                    } else {
                        // Trabajando (en la repetición)
                        // Aquí podríamos pitar al llegar al targetTime si existiera un aviso sonoro
                    }

                    return { ...s, currentTime: elapsed };
                });
            }, 100);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [state.isActive, state.isPaused, state.currentStepIndex, workoutSteps]);

    // Función manual para marcar lap (fin de repetición e inicio de descanso)
    const manualLap = useCallback(() => {
        setState(s => {
            if (!s.isResting) {
                startTimeRef.current = Date.now();
                return { ...s, isResting: true, currentTime: 0 };
            }
            return s;
        });
    }, []);

    return {
        ...state,
        start,
        pause,
        reset,
        nextStep,
        manualLap,
        currentStep
    };
}
