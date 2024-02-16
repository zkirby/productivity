import { globSync } from "glob";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";

const TM_INDEX_FILE = "index.tm.ts";
const TM_CONFIG_FILE = "config.tm.txt";

export default globSync("scripts/**/index.tm.ts").map((file) => ({
  // key: scripts/.../index.tm.ts -> .../index.tm
  // value: scripts/.../index.tm.ts -> project/scripts/.../index.tm.ts
  input: {
    [path.relative(
      "scripts",
      file.slice(0, file.length - path.extname(file).length)
    )]: fileURLToPath(new URL(file, import.meta.url)),
  },
  output: {
    dir: "dist",
    format: "iife",
    banner: async (chunk) => {
      // HACK: semi-hack to put the config at the top of the
      // built-script since it makes it easier to copy and paste into tapermonkey.
      const configFilePath = chunk.facadeModuleId.replace(
        TM_INDEX_FILE,
        TM_CONFIG_FILE
      );

      try {
        const configContents = await fs.promises.readFile(configFilePath, {
          encoding: "utf8",
        });
        return configContents;
      } catch (error) {
        console.error(`Error reading config file at ${configFilePath}:`, error);
        return "";
      }
    },
  },
  plugins: [typescript(), resolve(), commonjs()],
}));
