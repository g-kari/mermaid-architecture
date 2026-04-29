import { useState } from "react";
import {
  AWS_CATEGORIES,
  type AwsCategory,
  type AwsServiceDef,
  getServicesByCategory,
} from "../../lib/aws-services";

interface PaletteProps {
  onDragStart: (service: AwsServiceDef) => void;
}

export default function Palette({ onDragStart }: PaletteProps) {
  const [openCategories, setOpenCategories] = useState<Set<AwsCategory>>(
    new Set(["compute", "network", "database"]),
  );
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
    <div className="w-56 bg-gray-800 border-r border-gray-700 overflow-y-auto shrink-0 select-none">
      <div className="p-3 border-b border-gray-700">
        <h2 className="text-sm font-medium text-gray-300">AWS Services</h2>
      </div>
      {(Object.entries(AWS_CATEGORIES) as [AwsCategory, { label: string; color: string }][]).map(
        ([category, { label, color }]) => {
          const services = servicesByCategory.get(category) || [];
          const isOpen = openCategories.has(category);
          return (
            <div key={category}>
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-700 transition-colors"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-300">{label}</span>
                <span className="ml-auto text-gray-500 text-xs">{isOpen ? "−" : "+"}</span>
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
                      className="flex flex-col items-center gap-1 p-2 rounded cursor-grab hover:bg-gray-700 active:cursor-grabbing transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: service.color }}
                      >
                        {service.name.slice(0, 3)}
                      </div>
                      <span className="text-xs text-gray-400 text-center leading-tight">
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
    </div>
  );
}
