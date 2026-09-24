/** Decorative chevron pattern approximating the Figma onboarding art. */
export function ZigzagPattern({ className }: { className?: string }) {
  const cols = 6;
  const rows = 3;
  const chevrons = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      chevrons.push(
        <path
          key={`${r}-${c}`}
          d={`M${c * 20} ${r * 14} l10 10 l10 -10`}
          stroke="currentColor"
          strokeOpacity={0.28}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />,
      );
    }
  }
  return (
    <svg viewBox={`0 0 ${cols * 20 + 10} ${rows * 14 + 10}`} className={className} aria-hidden>
      {chevrons}
    </svg>
  );
}
