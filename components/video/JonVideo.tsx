'use client';

// Embeds Jon's Vimeo video and tracks whether the student has played it.
// Day 13 and Day 20 videos are mandatory — they gate the cold take.

interface JonVideoProps {
  vimeoId: string;
  dayNumber: number;
  onWatched: () => void;
  mustWatchBeforeColdTake?: boolean;
}

export default function JonVideo({ vimeoId, dayNumber, onWatched, mustWatchBeforeColdTake = false }: JonVideoProps) {
  if (!vimeoId) {
    // Video not yet recorded — show placeholder
    return (
      <div className="bg-slate-100 rounded-xl aspect-video flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-slate-200 rounded-full mx-auto flex items-center justify-center">
            <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
          <p className="text-sm text-slate-500">Day {dayNumber} video coming soon</p>
          {mustWatchBeforeColdTake && (
            <p className="text-xs text-amber-600">This video must be watched before recording</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {mustWatchBeforeColdTake && (
        <p className="text-xs text-amber-600 font-medium">Watch this before you record today.</p>
      )}
      <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?badge=0&autopause=0&player_id=0&app_id=58479`}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          title={`Day ${dayNumber} — Jon Weaver`}
          onLoad={() => {
            // Vimeo Player API would be used here to detect actual play event.
            // For now, mark as watched when iframe loads.
            // TODO: Integrate Vimeo Player SDK for accurate play tracking.
            onWatched();
          }}
        />
      </div>
    </div>
  );
}
