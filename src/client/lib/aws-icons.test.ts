/// <reference types="node" />
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";
import { AWS_SERVICES } from "./aws-services";

describe("aws-icons", () => {
  test("全サービスIDに対応するSVGファイルが存在する", () => {
    for (const service of AWS_SERVICES) {
      const path = resolve(process.cwd(), "public/aws-icons", `${service.id}.svg`);
      expect(existsSync(path), `Missing icon: ${service.id}.svg`).toBe(true);
    }
  });
});
