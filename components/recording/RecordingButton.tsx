'use client';

// Core recording UI component.
// CRITICAL: iOS records in audio/mp4, Chrome in audio/webm. Always detect format first.
import { useState, useRef, useCallback } from 'react';
import { getSupportedMimeType, getFileExtension } from '@/lib/recording';
import RecordingTimer from './RecordingTimer';
import AudioQualityCheck from './AudioQualityCheck';
import LoadingState from '@/components/ui/LoadingState';
import Button from '@/components/ui/Button';
import type { RecordingSubmitResult } from '@/lib/types';

interface RecordingButtonProps {
  studentId: string;
  dayNumber: number;
  takeType: 'cold' | 'drill1' | 'drill2' | 'drill3' | 'hot';
  maxMs?: number;
  prompt: string;
  onComplete: (result: RecordingSubmitResult) => void;
  disabled?: boolean;
}

type Phase = 'idle' | 'countdown' | 'recording' | 'processing' | 'done' | 'error';

export default function RecordingButton({
  studentId,
  dayNumber,
  takeType,
  maxMs = 60000,
  prompt,
  onComplete,
  disabled = false,
}: RecordingButtonProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [countdown, setCountdown] = useState(5);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startCountdown = useCallback(async () => {
    setShowPrompt(true);
    setCountdown(5);
    setPhase('countdown');

    let mediaStream: MediaStream;
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(mediaStream);
    } catch {
      setErrorMessage('Microphone access is needed to record. Please allow it and try again.');
      setPhase('error');
      return;
    }

    let count = 5;
    const tick = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count === 0) {
        clearInterval(tick);
        startRecording(mediaStream);
      }
    }, 1000);
  }, []);

  const startRecording = useCallback((mediaStream: MediaStream) => {
    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      setErrorMessage('Your browser does not support audio recording. Try Chrome or Safari.');
      setPhase('error');
      return;
    }

    const recorder = new MediaRecorder(mediaStream, { mimeType });
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      const extension = getFileExtension(mimeType);
      const blob = new Blob(chunksRef.current, { type: mimeType });
      setPhase('processing');

      // Stop all tracks
      mediaStream.getTracks().forEach((t) => t.stop());
      setStream(null);

      await submitRecording(blob, mimeType, extension);
    };

    recorder.start(250); // chunk every 250ms
    recorderRef.current = recorder;
    setPhase('recording');
  }, [studentId, dayNumber, takeType]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }
  }, []);

  const submitRecording = async (blob: Blob, mimeType: string, extension: string) => {
    try {
      const formData = new FormData();
      formData.append('audio', blob, `recording.${extension}`);
      formData.append('mimeType', mimeType);
      formData.append('studentId', studentId);
      formData.append('dayNumber', String(dayNumber));
      formData.append('takeType', takeType);
      formData.append('extension', extension);

      const res = await fetch('/api/recordings/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error ?? 'Something went wrong. Please try again.');
        setPhase('error');
        return;
      }

      setPhase('done');
      onComplete(data as RecordingSubmitResult);
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
      setPhase('error');
    }
  };

  if (phase === 'processing') {
    return <LoadingState message="Listening to your recording..." />;
  }

  if (phase === 'error') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-600">{errorMessage}</p>
        <Button variant="secondary" onClick={() => { setPhase('idle'); setErrorMessage(''); }}>
          Try again
        </Button>
      </div>
    );
  }

  if (phase === 'done') {
    return <p className="text-sm text-slate-500">Recording saved.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Show prompt */}
      {!showPrompt && phase === 'idle' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPrompt(true)}
        >
          See prompt
        </Button>
      )}

      {showPrompt && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-slate-700 leading-relaxed">{prompt}</p>
        </div>
      )}

      {/* Countdown */}
      {phase === 'countdown' && (
        <div className="text-center">
          <div className="text-5xl font-bold text-slate-900 tabular-nums">{countdown}</div>
          <p className="text-sm text-slate-500 mt-2">Get ready...</p>
        </div>
      )}

      {/* Recording */}
      {phase === 'recording' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-medium text-slate-700">Recording</span>
          </div>
          <AudioQualityCheck stream={stream} />
          <RecordingTimer
            isRecording
            maxMs={maxMs}
            onTimeout={stopRecording}
          />
          <Button variant="secondary" onClick={stopRecording}>
            Stop recording
          </Button>
        </div>
      )}

      {/* Start button */}
      {phase === 'idle' && (
        <Button
          size="lg"
          onClick={startCountdown}
          disabled={disabled}
          className="w-full"
        >
          Start recording
        </Button>
      )}
    </div>
  );
}
