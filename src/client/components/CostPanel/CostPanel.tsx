import { useMemo, useState } from "react";
import { getServiceDef } from "../../lib/aws-services";
import type { ServiceCost } from "../../lib/cost-calculator";
import { calculateCost, formatCurrency } from "../../lib/cost-calculator";
import { useCanvasStore } from "../../stores/canvas";

function CostRow({ cost }: { cost: ServiceCost }) {
  const service = getServiceDef(cost.serviceId);
  const color = service?.color ?? "var(--text-tertiary)";

  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-bg-hover transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <div className="min-w-0">
          <div className="text-sm text-text truncate">{cost.serviceName}</div>
          <div className="text-xs text-text-tertiary truncate">{cost.details}</div>
        </div>
      </div>
      <div className="text-sm font-mono text-text shrink-0 ml-2">
        {formatCurrency(cost.monthlyCost)}
      </div>
    </div>
  );
}

export default function CostPanel({ onClose }: { onClose: () => void }) {
  const data = useCanvasStore((s) => s.data);
  const [showAnnual, setShowAnnual] = useState(false);

  const summary = useMemo(() => calculateCost(data), [data]);

  const sortedServices = useMemo(
    () => [...summary.services].sort((a, b) => b.monthlyCost - a.monthlyCost),
    [summary.services],
  );

  const freeCount = sortedServices.filter((s) => s.monthlyCost === 0).length;
  const paidServices = sortedServices.filter((s) => s.monthlyCost > 0);

  return (
    <div className="w-72 bg-bg-panel border-l border-border flex flex-col shrink-0 h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <h2 className="text-sm font-medium text-text">コスト概算</h2>
        <button
          type="button"
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-md text-text-tertiary hover:text-text hover:bg-bg-hover transition-colors"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M2 2l8 8M10 2l-8 8" />
          </svg>
        </button>
      </div>

      <div className="px-3 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-text-secondary">
            {showAnnual ? "年間概算" : "月額概算"}
          </span>
          <button
            type="button"
            onClick={() => setShowAnnual((v) => !v)}
            className="text-xs text-accent hover:text-accent-hover transition-colors"
          >
            {showAnnual ? "月額で表示" : "年額で表示"}
          </button>
        </div>
        <div className="text-2xl font-bold font-mono text-text">
          {formatCurrency(showAnnual ? summary.totalAnnualCost : summary.totalMonthlyCost)}
        </div>
        <div className="text-xs text-text-tertiary mt-1">
          {summary.services.length}サービス（うち無料{freeCount}）
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-1 py-2">
        {paidServices.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-medium text-text-secondary px-2 mb-1">有料サービス</div>
            {paidServices.map((cost) => (
              <CostRow key={cost.nodeId} cost={cost} />
            ))}
          </div>
        )}

        {freeCount > 0 && (
          <details className="group">
            <summary className="text-xs font-medium text-text-secondary px-2 mb-1 cursor-pointer select-none flex items-center gap-1">
              <span className="transition-transform group-open:rotate-90">▶</span>
              無料サービス ({freeCount})
            </summary>
            {sortedServices
              .filter((s) => s.monthlyCost === 0)
              .map((cost) => (
                <CostRow key={cost.nodeId} cost={cost} />
              ))}
          </details>
        )}

        {summary.services.length === 0 && (
          <p className="text-text-tertiary text-xs px-2">
            サービスを配置するとコストが表示されます
          </p>
        )}
      </div>

      <div className="px-3 py-2 border-t border-border">
        <p className="text-xs text-text-tertiary leading-relaxed">
          ※ us-east-1 リージョン基準の概算です。実際の料金は使用量・契約により異なります。
        </p>
      </div>
    </div>
  );
}
