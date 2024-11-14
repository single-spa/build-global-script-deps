import { describe, expect, it, jest } from "@jest/globals";
import { vol, fs } from "memfs";
import { buildGlobalScripts } from "./build-global-script-deps";
import path from "node:path";
import { beforeEach } from "node:test";

jest.mock("fs");
jest.mock("fs/promises");

describe(`build-global-script-deps`, () => {
  beforeEach(() => {
    vol.reset();
  });

  it(`writes folders to the file system`, async () => {
    await buildGlobalScripts({
      outputDir: "deps",
      globalScripts: [
        "import-map-overrides@4.2.0",
        "@single-spa/import-map-injector@2.0.0",
      ],
    });

    expect(readDirRelative("deps")).toMatchSnapshot();
  });
});

function readDirRelative(dir: string) {
  return fs
    .readdirSync(dir, { recursive: true })
    .map((file) => path.relative(process.cwd(), file))
    .sort();
}
