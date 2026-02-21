// lib/recording.ts — browser-side audio capture utilities
// CRITICAL: iOS records in audio/mp4, Chrome in audio/webm. Always detect format.

export function getSupportedMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg',
  ];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? '';
}

export function getFileExtension(mimeType: string): string {
  if (mimeType.includes('webm')) return 'webm';
  if (mimeType.includes('mp4')) return 'mp4';
  if (mimeType.includes('ogg')) return 'ogg';
  return 'audio';
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, '0')}`;
}

export function formatMLR(mlr: number): string {
  return mlr.toFixed(1);
}

export function mlrContext(mlr: number): string {
  if (mlr < 9) return 'Your runs are short right now — the course is designed to change that.';
  if (mlr < 12) return 'Solid starting point. This is exactly where most students begin.';
  if (mlr < 14) return 'You are already in the upper B1 range. There is meaningful ground to cover.';
  if (mlr < 18) return 'You are producing B2-level runs. The sprint will consolidate that.';
  return 'Strong fluency already. The course will test it under real conditions.';
}
