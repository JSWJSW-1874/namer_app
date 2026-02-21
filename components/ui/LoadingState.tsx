interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Listening to your recording...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200" />
        <div className="w-12 h-12 rounded-full border-4 border-slate-900 border-t-transparent animate-spin absolute top-0 left-0" />
      </div>
      <p className="text-slate-600 text-sm">{message}</p>
    </div>
  );
}
