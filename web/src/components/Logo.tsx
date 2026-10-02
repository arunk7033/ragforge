export function Logo({ inverted = false, size = 28 }: { inverted?: boolean; size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5 font-medium tracking-tight" style={{ fontSize: size }}>
      <svg width={size * 1.3} height={size * 1.3} viewBox="0 0 36 36" aria-hidden="true">
        <rect width="36" height="36" rx="9" fill={inverted ? "#b9ff66" : "#191a23"} />
        <path
          d="M11 9h9a6 6 0 0 1 1.6 11.8L26 27h-4.6l-4-6H15v6h-4zm4 4v4h5a2 2 0 0 0 0-4z"
          fill={inverted ? "#191a23" : "#b9ff66"}
        />
      </svg>
      <span className={inverted ? "text-white" : "text-dark"}>ragforge</span>
    </span>
  );
}
