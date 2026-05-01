import { useState } from "react";
import { getIconUrl } from "../../lib/aws-icons";
import {
  AWS_CATEGORIES,
  type AwsCategory,
  type AwsServiceDef,
  GROUP_TYPES,
  getServicesByCategory,
} from "../../lib/aws-services";

interface PaletteProps {
  onDragStart: (service: AwsServiceDef) => void;
}

export default function Palette({ onDragStart }: PaletteProps) {
  const [openCategories, setOpenCategories] = useState<Set<AwsCategory>>(
    new Set(["compute", "network", "database"]),
  );
  const [groupsOpen, setGroupsOpen] = useState(true);
  const servicesByCategory = getServicesByCategory();

  const toggleCategory = (cat: AwsCategory) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <div className="w-56 bg-bg-panel border-r border-border overflow-y-auto shrink-0 select-none">
      <div className="p-3 border-b border-border">
        <h2 className="text-sm font-medium text-text-secondary">AWS Services</h2>
      </div>
      {(Object.entries(AWS_CATEGORIES) as [AwsCategory, { label: string; color: string }][]).map(
        ([category, { label, color }]) => {
          const services = servicesByCategory.get(category) || [];
          const isOpen = openCategories.has(category);
          return (
            <div key={category}>
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-bg-hover transition-colors"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-text-secondary">{label}</span>
                <span className="ml-auto text-text-tertiary text-xs">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && (
                <div className="px-2 pb-2 grid grid-cols-2 gap-1">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("application/json", JSON.stringify(service));
                        onDragStart(service);
                      }}
                      className="flex flex-col items-center gap-1 p-2 rounded cursor-grab hover:bg-bg-hover active:cursor-grabbing transition-colors"
                    >
                      <div className="w-8 h-8 rounded flex items-center justify-center">
                        <img
                          src={getIconUrl(service.id)}
                          alt={service.name}
                          width={24}
                          height={24}
                          loading="lazy"
                          draggable={false}
                        />
                      </div>
                      <span className="text-xs text-text-secondary text-center leading-tight">
                        {service.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        },
      )}
      <div>
        <button
          onClick={() => setGroupsOpen((prev) => !prev)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-bg-hover transition-colors"
        >
          <span className="w-2 h-2 rounded-full shrink-0 border border-current opacity-50" />
          <span className="text-text-secondary">ゾーン</span>
          <span className="ml-auto text-text-tertiary text-xs">{groupsOpen ? "−" : "+"}</span>
        </button>
        {groupsOpen && (
          <div className="px-2 pb-2 grid grid-cols-2 gap-1">
            {GROUP_TYPES.map((gt) => (
              <div
                key={gt.type}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("application/x-canvas-group", JSON.stringify(gt));
                }}
                className="flex flex-col items-center gap-1 p-2 rounded cursor-grab hover:bg-bg-hover active:cursor-grabbing transition-colors"
              >
                <div className="w-8 h-8 rounded flex items-center justify-center">
                  <img
                    src={getIconUrl(gt.type)}
                    alt={gt.label}
                    width={24}
                    height={24}
                    loading="lazy"
                    draggable={false}
                  />
                </div>
                <span className="text-xs text-text-secondary text-center leading-tight">
                  {gt.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-3 border-t border-border">
        <button
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = () => {
              const file = input.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === "string") {
                  window.dispatchEvent(
                    new CustomEvent("add-custom-image", {
                      detail: { dataUrl: reader.result, name: file.name.replace(/\.[^.]+$/, "") },
                    }),
                  );
                }
              };
              reader.readAsDataURL(file);
            };
            input.click();
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md bg-bg-hover hover:bg-bg text-text-secondary hover:text-text transition-colors"
        >
          <span>🖼</span>
          <span>画像を追加</span>
        </button>
      </div>
    </div>
  );
}
