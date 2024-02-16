import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import fs from "fs";
import path from "path";

export default [
  {
    input: "youtube-regulator/limitweekday-ai/index.tm.ts",
    output: {
      format: "iife",
      banner: async (chunk) => {
        const configFilePath = chunk.facadeModuleId.replace(
          "index.tm.ts",
          "config.tm.txt"
        );

        try {
          const configContents = await fs.promises.readFile(configFilePath, {
            encoding: "utf8",
          });
          return configContents;
        } catch (error) {
          console.error(
            `Error reading config file at ${configFilePath}:`,
            error
          );
          return "";
        }
      },
    },
    plugins: [typescript(), resolve(), commonjs()],
  },
];
