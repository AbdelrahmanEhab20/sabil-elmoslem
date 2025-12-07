'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Loader2 } from 'lucide-react';

// Re-export from data file for convenience
export { QURAN_RECITERS, getAyahAudioUrl } from '@/data/reciters';

// ============================================================================
// AUDIO PLAYER COMPONENT
// ============================================================================
interface AudioPlayerProps {
    src: string;
    onEnded?: () => void;
    onNext?: () => void;
    onPrevious?: () => void;
    showNavigation?: boolean;
    autoPlay?: boolean;
    className?: string;
}

export default function AudioPlayer({
    src,
    onEnded,
    onNext,
    onPrevious,
    showNavigation = false,
    autoPlay = false,
    className = ''
}: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState(false);

    // Reset on src change
    useEffect(() => {
        setIsPlaying(false);
        setProgress(0);
        setDuration(0);
        setError(false);
        setIsLoading(false);

        if (autoPlay && src) {
            const timer = setTimeout(() => {
                handlePlay();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [src, autoPlay]);

    const handlePlay = useCallback(async () => {
        if (!audioRef.current || !src) return;
        try {
            setIsLoading(true);
            setError(false);
            await audioRef.current.play();
            setIsPlaying(true);
        } catch (err) {
            console.error('Playback error:', err);
            setError(true);
        } finally {
            setIsLoading(false);
        }
    }, [src]);

    const handlePause = useCallback(() => {
        audioRef.current?.pause();
        setIsPlaying(false);
    }, []);

    const togglePlay = () => isPlaying ? handlePause() : handlePlay();

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
        setIsLoading(false);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setProgress(time);
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        onEnded?.();
    };

    const formatTime = (seconds: number) => {
        if (!isFinite(seconds)) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                onError={() => { setError(true); setIsLoading(false); }}
                onLoadStart={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
                preload="metadata"
            />

            {/* Previous */}
            {showNavigation && onPrevious && (
                <button
                    onClick={onPrevious}
                    className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    aria-label="Previous"
                >
                    <SkipBack className="w-4 h-4" />
                </button>
            )}

            {/* Play/Pause */}
            <button
                onClick={togglePlay}
                disabled={!src || error}
                className={`p-2.5 rounded-full transition-all duration-200 ${error
                    ? 'bg-red-100 text-red-500 dark:bg-red-900/30 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
                    }`}
                aria-label={isPlaying ? 'Pause' : 'Play'}
            >
                {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : isPlaying ? (
                    <Pause className="w-5 h-5" />
                ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                )}
            </button>

            {/* Next */}
            {showNavigation && onNext && (
                <button
                    onClick={onNext}
                    className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    aria-label="Next"
                >
                    <SkipForward className="w-4 h-4" />
                </button>
            )}

            {/* Progress Bar */}
            <div className="flex-1 flex items-center gap-2 min-w-0">
                <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums w-10 text-right">
                    {formatTime(progress)}
                </span>
                <div className="flex-1 relative h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                        className="absolute h-full bg-green-500 rounded-full transition-all duration-100"
                        style={{ width: duration > 0 ? `${(progress / duration) * 100}%` : '0%' }}
                    />
                    <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={progress}
                        onChange={handleSeek}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums w-10">
                    {formatTime(duration)}
                </span>
            </div>

            {/* Volume Icon (visual only) */}
            <Volume2 className="w-4 h-4 text-gray-400 hidden sm:block" />
        </div>
    );
}
