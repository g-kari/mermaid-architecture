const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.userAgent);
const MOD = isMac ? "⌘" : "Ctrl";

const SHORTCUTS = [
  { keys: `${MOD}+Z`, desc: "元に戻す" },
  { keys: `${MOD}+Shift+Z`, desc: "やり直す" },
  { keys: `${MOD}+D`, desc: "ノードを複製" },
  { keys: `${MOD}+E`, desc: "エクスポート" },
  { keys: `${MOD}+G`, desc: "AI図生成" },
  { keys: `${MOD}+I`, desc: "インポート" },
  { keys: `${MOD}+=/-`, desc: "ズームイン/アウト" },
  { keys: `${MOD}+0`, desc: "ズームリセット" },
  { keys: "Delete", desc: "選択を削除" },
  { keys: "←↑→↓", desc: "ノードを移動" },
  { keys: "Shift+←↑→↓", desc: "ノードを大きく移動" },
  { keys: "Escape", desc: "選択解除" },
  { keys: "?", desc: "このヘルプを表示" },
];

interface Props {
  onClose: () => void;
}

export default function ShortcutHelp({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-overlay flex items-center justify-center z-50"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcut-help-title"
    >
      <div
        className="bg-bg-panel rounded-lg border border-border w-[400px] max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 id="shortcut-help-title" className="font-medium">
            キーボードショートカット
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text">
            &times;
          </button>
        </div>
        <div className="p-4">
          <table className="w-full text-sm">
            <tbody>
              {SHORTCUTS.map((s) => (
                <tr key={s.keys} className="border-b border-border last:border-0">
                  <td className="py-2 pr-4">
                    <kbd className="bg-bg-hover border border-border rounded px-1.5 py-0.5 text-xs font-mono">
                      {s.keys}
                    </kbd>
                  </td>
                  <td className="py-2 text-text-secondary">{s.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
