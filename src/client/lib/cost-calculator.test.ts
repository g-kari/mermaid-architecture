import { describe, expect, it, vi } from "vitest";
import type { CanvasData } from "../types";
import { calculateCost, formatCurrency } from "./cost-calculator";

vi.mock("./aws-pricing", () => {
  const pricing: Record<
    string,
    {
      serviceId: string;
      minimumMonthlyCost: number;
      pricingUnit: string;
      pricingNote: string;
      tiers?: Record<string, { label: string; monthlyCost: number }[]>;
      free?: boolean;
    }
  > = {
    ec2: {
      serviceId: "ec2",
      minimumMonthlyCost: 8.47,
      pricingUnit: "USD/月",
      pricingNote: "t3.micro オンデマンド",
      tiers: {
        instanceType: [
          { label: "t3.micro", monthlyCost: 8.47 },
          { label: "t3.small", monthlyCost: 16.94 },
          { label: "t3.medium", monthlyCost: 33.87 },
          { label: "m5.large", monthlyCost: 69.12 },
        ],
      },
    },
    rds: {
      serviceId: "rds",
      minimumMonthlyCost: 12.41,
      pricingUnit: "USD/月",
      pricingNote: "db.t3.micro シングルAZ",
      tiers: {
        instanceClass: [
          { label: "db.t3.micro", monthlyCost: 12.41 },
          { label: "db.t3.small", monthlyCost: 24.82 },
          { label: "db.r6g.large", monthlyCost: 131.4 },
        ],
      },
    },
    alb: {
      serviceId: "alb",
      minimumMonthlyCost: 22.27,
      pricingUnit: "USD/月",
      pricingNote: "固定料金 + LCU",
    },
    iam: {
      serviceId: "iam",
      minimumMonthlyCost: 0,
      pricingUnit: "無料",
      pricingNote: "無料サービス",
      free: true,
    },
    s3: {
      serviceId: "s3",
      minimumMonthlyCost: 0.023,
      pricingUnit: "USD/GB/月",
      pricingNote: "Standard 1GBあたり",
      tiers: {
        storageClass: [
          { label: "Standard", monthlyCost: 0.023 },
          { label: "Intelligent-Tiering", monthlyCost: 0.023 },
          { label: "Glacier", monthlyCost: 0.004 },
        ],
      },
    },
  };

  return {
    getServicePricing: (serviceId: string) => pricing[serviceId],
    AWS_PRICING: pricing,
  };
});

const emptyCanvas: CanvasData = { nodes: [], edges: [], groups: [] };

function makeNode(id: string, type: string, specs?: Record<string, string>): CanvasData {
  return {
    nodes: [{ id, type, label: type.toUpperCase(), x: 0, y: 0, width: 80, height: 80, specs }],
    edges: [],
    groups: [],
  };
}

describe("calculateCost", () => {
  it("空のCanvasDataで合計0", () => {
    const result = calculateCost(emptyCanvas);
    expect(result.totalMonthlyCost).toBe(0);
    expect(result.totalAnnualCost).toBe(0);
    expect(result.services).toHaveLength(0);
    expect(result.currency).toBe("USD");
  });

  it("EC2 1台（specs未設定）でminimumMonthlyCostを使用", () => {
    const data = makeNode("ec2-1", "ec2");
    const result = calculateCost(data);

    expect(result.services).toHaveLength(1);
    const svc = result.services[0];
    expect(svc.nodeId).toBe("ec2-1");
    expect(svc.serviceId).toBe("ec2");
    expect(svc.monthlyCost).toBe(8.47);
    expect(svc.isMinimumConfig).toBe(true);
    expect(svc.details).toContain("最低構成");
  });

  it("EC2 1台（instanceType: t3.small）でtier一致", () => {
    const data = makeNode("ec2-1", "ec2", { instanceType: "t3.small" });
    const result = calculateCost(data);

    expect(result.services).toHaveLength(1);
    const svc = result.services[0];
    expect(svc.monthlyCost).toBe(16.94);
    expect(svc.isMinimumConfig).toBe(false);
    expect(svc.details).toContain("t3.small");
  });

  it("複数サービス（EC2 + RDS + ALB）の合計が正しい", () => {
    const data: CanvasData = {
      nodes: [
        { id: "ec2-1", type: "ec2", label: "Web", x: 0, y: 0, width: 80, height: 80 },
        { id: "rds-1", type: "rds", label: "DB", x: 200, y: 0, width: 80, height: 80 },
        { id: "alb-1", type: "alb", label: "LB", x: 100, y: -100, width: 80, height: 80 },
      ],
      edges: [],
      groups: [],
    };
    const result = calculateCost(data);

    expect(result.services).toHaveLength(3);
    const expected = 8.47 + 12.41 + 22.27;
    expect(result.totalMonthlyCost).toBeCloseTo(expected, 2);
    expect(result.totalAnnualCost).toBeCloseTo(expected * 12, 2);
  });

  it("unknownなサービスtypeはservicesに含まれない", () => {
    const data = makeNode("custom-1", "unknown-service");
    const result = calculateCost(data);

    expect(result.services).toHaveLength(0);
    expect(result.totalMonthlyCost).toBe(0);
  });

  it("freeサービス（IAM）でmonthlyCost: 0", () => {
    const data = makeNode("iam-1", "iam");
    const result = calculateCost(data);

    expect(result.services).toHaveLength(1);
    expect(result.services[0].monthlyCost).toBe(0);
    expect(result.services[0].isMinimumConfig).toBe(true);
  });

  it("specsにtierと一致しない値でminimumMonthlyCostにフォールバック", () => {
    const data = makeNode("ec2-1", "ec2", { instanceType: "c7g.16xlarge" });
    const result = calculateCost(data);

    expect(result.services).toHaveLength(1);
    const svc = result.services[0];
    expect(svc.monthlyCost).toBe(8.47);
    expect(svc.isMinimumConfig).toBe(true);
    expect(svc.details).toContain("最低構成");
  });
});

describe("formatCurrency", () => {
  it("通常の金額をフォーマット", () => {
    expect(formatCurrency(12.41)).toBe("$12.41");
  });

  it("0をフォーマット", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("カンマ区切りでフォーマット", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });

  it("小数点2桁に丸める", () => {
    expect(formatCurrency(99.999)).toBe("$100.00");
  });
});
