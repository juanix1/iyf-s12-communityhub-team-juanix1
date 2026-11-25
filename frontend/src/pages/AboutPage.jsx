import { Link } from 'react-router-dom';
import { ShieldAlert, Clock, Users, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section className="card p-6 sm:p-8">
        <span className="inline-block rounded-full bg-njia-50 px-3 py-1 text-xs font-bold text-njia-800">
          About Njia CommunityHub
        </span>
        <h1 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Built by commuters, for everyday journeys.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
          “Njia” means <em>path</em> or <em>route</em> in Kiswahili. Every day across Nairobi and
          neighbouring towns, thousands of commuters face unpredictable matatu fares, sudden stage
          queues, stalled vehicles, and peak-hour gridlocks. Njia CommunityHub gives travellers a
          shared space to post practical, timely notes from the ground.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <Users className="h-5 w-5 text-njia-700" />
            <h2 className="mt-2 text-sm font-bold text-slate-900">Community-Powered</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              Every update comes directly from registered passengers sharing what they see at the
              stage or along the highway.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <Clock className="h-5 w-5 text-amber-600" />
            <h2 className="mt-2 text-sm font-bold text-slate-900">Honest & Transparent</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              We never label user-submitted posts as “verified” or “live”. Reports older than two
              hours are clearly flagged so you know conditions may have shifted.
            </p>
          </div>
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <div className="flex items-center gap-2 text-slate-900">
          <ShieldAlert className="h-5 w-5 text-njia-700" />
          <h2 className="text-lg font-bold">Community Posting Guidelines</h2>
        </div>

        <ul className="mt-4 space-y-3 text-sm text-slate-700">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-njia-700" />
            <span>
              <strong>Be specific:</strong> Mention the exact stage, direction (e.g., towards CBD
              or outbound), sacco availability, and fare in KSh.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-njia-700" />
            <span>
              <strong>No false alarms or spam:</strong> Deliberately misleading fare claims or
              promotional spam will be removed by moderators.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-njia-700" />
            <span>
              <strong>Keep discussions respectful:</strong> Help fellow commuters plan safer,
              smoother trips.
            </span>
          </li>
        </ul>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/feed" className="btn-primary">
            Explore Community Feed
          </Link>
          <Link to="/share" className="btn-secondary">
            Share an Update
          </Link>
        </div>
      </section>
    </div>
  );
}
