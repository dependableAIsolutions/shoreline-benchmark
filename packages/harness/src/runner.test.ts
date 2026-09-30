import { beforeEach, describe, expect, it, vi } from "vitest";

const { files, state } = vi.hoisted(() => ({
  files: new Map<string, string>(),
  state: { checkpointWrites: 0, failOnCheckpointWrite: 0 }
}));

vi.mock("node:fs/promises", () => ({
  access: vi.fn(async (filePath: string) => {
    if (!files.has(filePath)) {
      const error = new Error(`ENOENT: ${filePath}`) as NodeJS.ErrnoException;
      error.code = "ENOENT";
      throw error;
    }
  }),
  appendFile: vi.fn(async (filePath: string, data: string) => {
    files.set(filePath, `${files.get(filePath) ?? ""}${data}`);
  }),
  mkdir: vi.fn(async () => undefined),
  readFile: vi.fn(async (filePath: string) => {
    const content = files.get(filePath);
    if (content === undefined) {
      const error = new Error(`ENOENT: ${filePath}`) as NodeJS.ErrnoException;
      error.code = "ENOENT";
      throw error;
    }
    return content;
  }),
  rename: vi.fn(async (fromPath: string, toPath: string) => {
    const content = files.get(fromPath);
    if (content === undefined) throw new Error(`ENOENT: ${fromPath}`);
    files.set(toPath, content);
    files.delete(fromPath);
  }),
  writeFile: vi.fn(async (filePath: string, data: string) => {
    if (filePath.includes("checkpoint.json")) {
      state.checkpointWrites += 1;
      if (state.checkpointWrites === state.failOnCheckpointWrite) {
        files.set(filePath, "{");
        throw new Error("simulated interruption during checkpoint write");
      }
    }
    files.set(filePath, data);
  })
}));

import { runBenchmark } from "./runner";

beforeEach(() => {
  files.clear();
  state.checkpointWrites = 0;
  state.failOnCheckpointWrite = 2;
});

describe("runBenchmark checkpoint persistence", () => {
  it("keeps the previous checkpoint readable if an update is interrupted", async () => {
    const outputDir = "/virtual/benchmark-run";

    await expect(
      runBenchmark({
        adapter: {
          getModelId: () => "test-model",
          complete: async () => ({ content: "", tokensUsed: 0, latencyMs: 0 })
        },
        categories: ["mult"],
        trialsPerDifficulty: 1,
        outputDir,
        adapterName: "localapi",
        temperature: 0,
        quickMode: true,
        quickPoints: 1
      })
    ).rejects.toThrow("simulated interruption during checkpoint write");

    const checkpoint = JSON.parse(files.get(`${outputDir}/checkpoint.json`) ?? "") as {
      version: number;
      categories: Record<string, unknown>;
    };
    expect(checkpoint.version).toBe(1);
    expect(checkpoint.categories).toEqual({});
  });
});
