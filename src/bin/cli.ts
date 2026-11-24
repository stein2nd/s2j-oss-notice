import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { runDoctorCommand } from "./doctor.js";
import { runGenerateCommand } from "./generate.js";
import { runInitCommand } from "./init.js";

const require = createRequire(import.meta.url);
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const PACKAGE_VERSION =
  (require(join(packageRoot, "package.json")) as { version?: string }).version ?? "unknown";

const HELP = `S2J OSS Notice — Open Source Notice generator.

Usage:
  s2j-oss-notice <command> [options]

Commands:
  generate  Build from SPDX JSON (L1, -o dir) or lockfile (L0, --out-file)
  init      Write onot.yaml from template (standalone; Ack init is canonical for full host)
  doctor    Standalone environment / input checks (Node 22+, optional -i)
  help      Show this message

Examples:
  s2j-oss-notice init
  s2j-oss-notice generate -i sbom.spdx.json -f md -o ./out --config onot.yaml
  s2j-oss-notice doctor --input sbom.spdx.json
  s2j-oss-notice --version

Documentation: docs/specs.md
`;

function runHelp(): number {
  console.log(HELP);
  return 0;
}

async function main(): Promise<number> {
  const argv = process.argv.slice(2);

  if (argv.length === 0 || argv[0] === "help") {
    return runHelp();
  }

  const first = argv[0];

  if (first === "--help" || first === "-h") {
    return runHelp();
  }

  if (first === "--version" || first === "-V") {
    console.log(PACKAGE_VERSION);
    return 0;
  }

  if (first === "generate") {
    return runGenerateCommand(argv.slice(1));
  }

  if (first === "doctor") {
    return runDoctorCommand(argv.slice(1));
  }

  if (first === "init") {
    return runInitCommand(argv.slice(1));
  }

  console.error(`Unknown command: ${first}\n`);
  console.error(HELP);
  return 1;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });