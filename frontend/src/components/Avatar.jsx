export default function Avatar({ name = 'Commuter', src = '', size = 'md' }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-xl',
  };

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'NC';

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size] || sizes.md} shrink-0 rounded-full border border-slate-200 object-cover`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${
        sizes[size] || sizes.md
      } flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-njia-700 to-njia-900 font-bold text-white shadow-inner`}
    >
      {initials}
    </div>
  );
}
