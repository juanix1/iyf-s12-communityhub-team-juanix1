import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-600">
              Commuter-to-commuter route intelligence for Nairobi and surrounding corridors.
              Check stage queues, matatu fares, and road conditions before you leave.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Platform Navigation
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/feed" className="hover:text-njia-700">
                  Community Feed
                </Link>
              </li>
              <li>
                <Link to="/share" className="hover:text-njia-700">
                  Share Route Update
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-njia-700">
                  About & Safety Guidelines
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Community Disclaimer
            </h3>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              All traffic reports, matatu fares, and stage availability notes on Njia CommunityHub
              are user-submitted and are not automatically verified. Always exercise personal
              safety and confirm fares before boarding.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Njia CommunityHub. Built for Kenyan commuters.</p>
          <p>IYF Weekend Academy Full-Stack Capstone MVP</p>
        </div>
      </div>
    </footer>
  );
}
