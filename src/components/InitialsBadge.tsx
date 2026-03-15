'use client';

export function InitialsBadge({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const hue = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <span
      className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white shadow-sm ring-2 ring-white"
      style={{ backgroundColor: `hsl(${hue}, 55%, 45%)` }}
      title={name}
    >
      {initials || '?'}
    </span>
  );
}
