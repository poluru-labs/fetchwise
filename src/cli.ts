import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { generateTypes, type GenerateSpec } from "./generate.js";

function printHelp(): void {
  console.log(`fetchwise

Usage:
  fetchwise generate <spec.json> [-o output.ts]

Generate TypeScript API types from a JSON spec.
`);
}

function readArg(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  return args[index + 1];
}

function main(argv: string[]): void {
  const [command, input, ...rest] = argv;

  if (!command || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command !== "generate" || !input) {
    printHelp();
    process.exitCode = 1;
    return;
  }

  const inputPath = resolve(input);
  const output = readArg(rest, "-o") ?? input.replace(/\.json$/i, ".ts");
  const spec = JSON.parse(readFileSync(inputPath, "utf8")) as GenerateSpec;
  writeFileSync(resolve(output), generateTypes(spec));
  console.log(`Wrote ${output}`);
}

main(process.argv.slice(2));
