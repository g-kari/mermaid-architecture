import { afterEach, describe, expect, it, vi } from "vitest";
import type { CanvasData, CanvasNode } from "../../types";
import * as awsPricing from "../aws-pricing";
import { calculateCost, formatCurrency } from "../cost-calculator";

function makeNode(partial: Partial<CanvasNode> & { id: string; type: string }): CanvasNode {
  return {
    label: partial.type,
    x: 0,
    y: 0,
    width: 120,
    height: 80,
    ...partial,
  };
}

function makeData(nodes: CanvasNode[]): CanvasData {
  return { nodes, edges: [], groups: [] };
}

describe("calculateCost", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("specsなしの場合はminimumMonthlyCostを使う", () => {
    const data = makeData([makeNode({ id: "ec2-1", type: "ec2" })]);
    const result = calculateCost(data);

    expect(result.services).toHaveLength(1);
    const service = result.services[0];
    expect(service.serviceId).toBe("ec2");
    expect(service.monthlyCost).toBe(7.59);
    expect(service.isMinimumConfig).toBe(true);
    expect(service.details).toContain("最低構成");
  });

  it("1つのspecがマッチした場合のコスト計算", () => {
    const data = makeData([
      makeNode({ id: "ec2-1", type: "ec2", specs: { instanceType: "t3.large" } }),
    ]);
    const result = calculateCost(data);

    const service = result.services[0];
    expect(service.monthlyCost).toBe(60.74);
    expect(service.isMinimumConfig).toBe(false);
    expect(service.details).toContain("t3.large");
  });

  it("複数specがマッチした場合のコスト合算", () => {
    const spy = vi.spyOn(awsPricing, "getServicePricing").mockReturnValue({
      serviceId: "ec2",
      minimumMonthlyCost: 7.59,
      pricingUnit: "インスタンス/月",
      pricingNote: "テスト",
      tiers: {
        instanceType: [{ label: "t3.micro", monthlyCost: 7.59 }],
        storage: [{ label: "gp3 (100GB)", monthlyCost: 8.0 }],
      },
    });

    const data = makeData([
      makeNode({
        id: "ec2-1",
        type: "ec2",
        specs: { instanceType: "t3.micro", storage: "gp3" },
      }),
    ]);
    const result = calculateCost(data);

    const service = result.services[0];
    expect(service.isMinimumConfig).toBe(false);
    expect(service.monthlyCost).toBeCloseTo(7.59 + 8.0, 5);
    expect(service.details).toContain("t3.micro");
    expect(service.details).toContain("gp3");
    expect(service.details).toContain(" + ");

    spy.mockRestore();
  });

  it("マッチしないspecの場合のフォールバック", () => {
    const data = makeData([
      makeNode({ id: "ec2-1", type: "ec2", specs: { instanceType: "存在しないtype" } }),
    ]);
    const result = calculateCost(data);

    const service = result.services[0];
    expect(service.monthlyCost).toBe(7.59);
    expect(service.isMinimumConfig).toBe(true);
    expect(service.details).toContain("最低構成");
  });

  it("calculateCost全体の合計計算", () => {
    const data = makeData([
      makeNode({ id: "ec2-1", type: "ec2", specs: { instanceType: "t3.micro" } }),
      makeNode({ id: "rds-1", type: "rds", specs: { instanceClass: "db.t3.small" } }),
      makeNode({ id: "s3-1", type: "s3" }),
    ]);
    const result = calculateCost(data);

    expect(result.services).toHaveLength(3);
    const expectedTotal = 7.59 + 24.82 + 0.23;
    expect(result.totalMonthlyCost).toBeCloseTo(expectedTotal, 5);
    expect(result.totalAnnualCost).toBeCloseTo(expectedTotal * 12, 5);
    expect(result.currency).toBe("USD");
  });

  it("pricingが見つからないノードはskipされる", () => {
    const data = makeData([
      makeNode({ id: "unknown-1", type: "unknown-service" }),
      makeNode({ id: "ec2-1", type: "ec2", specs: { instanceType: "t3.micro" } }),
    ]);
    const result = calculateCost(data);

    expect(result.services).toHaveLength(1);
    expect(result.services[0].serviceId).toBe("ec2");
  });
});

describe("formatCurrency", () => {
  it("USD通貨フォーマットで小数点2桁を出力", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
    expect(formatCurrency(0)).toBe("$0.00");
  });
});
