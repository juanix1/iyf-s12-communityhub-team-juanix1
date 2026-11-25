export const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffSeconds = Math.floor((now - date) / 1000);

  if (diffSeconds < 60) return 'Just now';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatFullDateTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('en-KE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Traffic and matatu fares change quickly.
 * Clearly flags posts older than 2 hours so commuters do not mistake them for current conditions.
 */
export const getFreshnessStatus = (dateString) => {
  if (!dateString) return { isStale: false, label: 'Community report' };
  const ageHours = (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60);

  if (ageHours >= 6) {
    return {
      isStale: true,
      severity: 'old',
      label: 'Older update (6h+ ago) — fares & traffic may have changed',
    };
  }

  if (ageHours >= 2) {
    return {
      isStale: true,
      severity: 'aging',
      label: 'Posted over 2h ago — verify current stage conditions',
    };
  }

  return {
    isStale: false,
    severity: 'recent',
    label: 'Recent community report (unverified)',
  };
};
