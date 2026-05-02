import type { CanvasData, CanvasNode } from "../types";
import { getServicePricing, type PricingTier } from "./aws-pricing";
import { getServiceDef } from "./aws-services";

export interface ServiceCost {
  nodeId: string;
  serviceId: string;
  serviceName: string;
  monthlyCost: number;
  isMinimumConfig: boolean;
  details: string;
}

export interface CostSummary {
  totalMonthlyCost: number;
  totalAnnualCost: number;
  services: ServiceCost[];
  currency: "USD";
}

export function calculateNodeCost(node: CanvasNode): ServiceCost | null {
  const pricing = getServicePricing(node.type);
  if (!pricing) {
    return null;
  }

  const serviceDef = getServiceDef(node.type);
  const serviceName = serviceDef?.name ?? node.type;

  const specs = node.specs;
  const hasSpecs = specs && Object.keys(specs).length > 0;

  if (!hasSpecs || !pricing.tiers) {
    return {
      nodeId: node.id,
      serviceId: node.type,
      serviceName,
      monthlyCost: pricing.minimumMonthlyCost,
      isMinimumConfig: true,
      details: `最低構成 (${pricing.pricingNote})`,
    };
  }

  const matchedTiers: PricingTier[] = [];
  for (const [specKey, specValue] of Object.entries(specs)) {
    const tierList = pricing.tiers[specKey];
    if (!tierList) continue;

    const lowerValue = specValue.toLowerCase();
    const matched =
      tierList.find((tier) => tier.label.toLowerCase() === lowerValue) ??
      tierList.find((tier) => tier.label.toLowerCase().includes(lowerValue));
    if (matched) {
      matchedTiers.push(matched);
    }
  }

  if (matchedTiers.length > 0) {
    const totalCost = matchedTiers.reduce((sum, tier) => sum + tier.monthlyCost, 0);
    const labels = matchedTiers.map((tier) => tier.label).join(" + ");
    return {
      nodeId: node.id,
      serviceId: node.type,
      serviceName,
      monthlyCost: totalCost,
      isMinimumConfig: false,
      details: `${labels} (${pricing.pricingUnit})`,
    };
  }

  return {
    nodeId: node.id,
    serviceId: node.type,
    serviceName,
    monthlyCost: pricing.minimumMonthlyCost,
    isMinimumConfig: true,
    details: `最低構成 (${pricing.pricingNote})`,
  };
}

export function calculateCost(data: CanvasData): CostSummary {
  const services: ServiceCost[] = [];

  for (const node of data.nodes) {
    const cost = calculateNodeCost(node);
    if (cost) {
      services.push(cost);
    }
  }

  const totalMonthlyCost = services.reduce((sum, s) => sum + s.monthlyCost, 0);

  return {
    totalMonthlyCost,
    totalAnnualCost: totalMonthlyCost * 12,
    services,
    currency: "USD",
  };
}

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
