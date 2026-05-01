export default function CostToggle({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 flex items-center gap-1.5 px-2 rounded-md text-sm transition-colors ${
        active
          ? "bg-accent-soft text-accent"
          : "text-text-secondary hover:bg-bg-hover hover:text-text"
      }`}
      title="コスト概算パネル"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="8" cy="8" r="6" />
        <path d="M8 4v8M6 5.5h3a1.5 1.5 0 010 3H5.5M6 8.5h3a1.5 1.5 0 010 3H6" />
      </svg>
      <span>$</span>
    </button>
  );
}
