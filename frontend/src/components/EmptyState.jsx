import { Compass } from 'lucide-react';

export default function EmptyState({
  title = 'No route updates found',
  description = 'Be the first commuter to share current fares and traffic conditions on this route.',
  action = null,
}) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-njia-50 text-njia-700">
        <Compass className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-slate-600">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
