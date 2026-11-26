export default function Logo({ className = '' }) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-njia-800 shadow-sm ring-1 ring-njia-700">
        <svg viewBox="0 0 36 36" className="h-6 w-6" fill="none" aria-hidden="true">
          <path d="M7 27L14 9H19.5L12.5 27H7Z" fill="#34d399" />
          <path d="M16.5 27L23.5 9H29L22 27H16.5Z" fill="#fbbf24" />
          <circle cx="27.5" cy="8.5" r="2.5" fill="#ffffff" />
        </svg>
      </div>
      <div className="leading-tight">
        <span className="block text-base font-extrabold tracking-tight text-slate-900">
          Njia <span className="text-njia-700">CommunityHub</span>
        </span>
        <span className="block text-[11px] font-medium text-slate-500">
          Commuter Route Intel
        </span>
      </div>
    </div>
  );
}
