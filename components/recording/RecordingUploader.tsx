'use client';

// Handles the upload of a recorded audio blob to the backend.
import { useState } from 'react';
import type { RecordingSubmitResult } from '@/lib/types';

interface RecordingUploaderProps {
  blob: Blob;
  mimeType: string;
  extension: string;
  studentId: string;
  dayNumber: number;
  takeType: string;
  onSuccess: (result: RecordingSubmitResult) => void;
  onError: (message: string) => void;
}

export default function RecordingUploader({
  blob,
  mimeType,
  extension,
  studentId,
  dayNumber,
  takeType,
  onSuccess,
  onError,
}: RecordingUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const upload = async () => {
    setUploading(true);
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
        onError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      onSuccess(data as RecordingSubmitResult);
    } catch {
      onError('Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Auto-trigger upload on mount
  if (!uploading) {
    upload();
  }

  return null; // This component is headless — parent handles UI
}
