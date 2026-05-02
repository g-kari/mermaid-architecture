import { describe, expect, it } from "vitest";
import { getSpecOptions } from "../aws-pricing";

describe("getSpecOptions", () => {
  it("EC2のinstanceTypeで正しい選択肢を返す", () => {
    const options = getSpecOptions("ec2", "instanceType");
    expect(options).not.toBeNull();
    expect(options?.length).toBeGreaterThan(0);
    const micro = options?.find((o) => o.value === "t3.micro");
    expect(micro).toBeDefined();
    expect(micro?.monthlyCost).toBe(7.59);
    expect(micro?.label).toBe("t3.micro - $7.59/月");
  });

  it("全ての選択肢にvalue, label, monthlyCostが含まれる", () => {
    const options = getSpecOptions("ec2", "instanceType");
    expect(options).not.toBeNull();
    for (const option of options ?? []) {
      expect(option.value).toBeTruthy();
      expect(option.label).toContain(option.value);
      expect(option.label).toContain("/月");
      expect(typeof option.monthlyCost).toBe("number");
    }
  });

  it("tiersがないサービスではnullを返す", () => {
    expect(getSpecOptions("vpc", "anything")).toBeNull();
    expect(getSpecOptions("lambda", "memory")).toBeNull();
  });

  it("存在しないserviceIdではnullを返す", () => {
    expect(getSpecOptions("nonexistent-service", "instanceType")).toBeNull();
  });

  it("存在しないspecKeyではnullを返す", () => {
    expect(getSpecOptions("ec2", "nonexistentKey")).toBeNull();
  });

  it("コスト表示は小数点以下2桁でフォーマットされる", () => {
    const options = getSpecOptions("kinesis", "shardCount");
    const oneShard = options?.find((o) => o.value === "1 シャード");
    expect(oneShard?.label).toBe("1 シャード - $15.00/月");
  });
});
