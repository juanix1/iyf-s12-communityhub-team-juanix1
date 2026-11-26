import { TRAFFIC_STATUSES } from '../utils/constants';

export default function TrafficBadge({ status }) {
  const config =
    TRAFFIC_STATUSES.find((item) => item.value === status) || TRAFFIC_STATUSES[1];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.badgeClass}`}
    >
      <span className={`h-2 w-2 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}
