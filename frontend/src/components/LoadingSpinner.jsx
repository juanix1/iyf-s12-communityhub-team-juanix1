export default function LoadingSpinner({ label = 'Loading commuter updates...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center" role="status">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-njia-200 border-t-njia-700" />
      <p className="mt-3 text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}
