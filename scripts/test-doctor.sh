#!/usr/bin/env bash
# Local quality gate — mirrors GitHub Actions and lightweight CLI smoke tests.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib/assert.sh
source "${ROOT_DIR}/scripts/lib/assert.sh"

cd "${ROOT_DIR}"

echo "==> npm run lint"
npm run lint --silent

echo "==> npm run lint:docs"
npm run lint:docs --silent

echo "==> npm test"
npm test --silent

echo "==> npm run build"
npm run build --silent

run_cli() {
  set +e
  OUTPUT="$(node "${ROOT_DIR}/dist/bin/cli.js" "$@" 2>&1)"
  STATUS=$?
  set -e
}

log_test "ONOT-DOC-001"
run_cli --version
assert_exit_code "${STATUS}" 0
assert_contains "${OUTPUT}" "."
pass_test "ONOT-DOC-001"

log_test "ONOT-DOC-002"
run_cli help
assert_exit_code "${STATUS}" 0
assert_contains "${OUTPUT}" "generate"
pass_test "ONOT-DOC-002"

log_test "ONOT-DOC-003"
run_cli generate
assert_exit_code "${STATUS}" 1
assert_contains "${OUTPUT}" "--input is required"
pass_test "ONOT-DOC-003"

log_test "ONOT-DOC-004"
run_cli not-a-command
assert_exit_code "${STATUS}" 1
assert_contains "${OUTPUT}" "Unknown command"
pass_test "ONOT-DOC-004"

log_test "ONOT-DOC-005"
run_cli doctor
assert_exit_code "${STATUS}" 0
assert_contains "${OUTPUT}" "Node.js"
assert_contains "${OUTPUT}" "[OK]"
pass_test "ONOT-DOC-005"

log_test "ONOT-DOC-006"
TMP_INIT="$(mktemp -d)"
run_cli init --cwd "${TMP_INIT}" -o onot.yaml
assert_exit_code "${STATUS}" 0
assert_contains "${OUTPUT}" "onot.yaml"
test -f "${TMP_INIT}/onot.yaml"
pass_test "ONOT-DOC-006"

log_test "ONOT-DOC-007"
run_cli doctor
assert_exit_code "${STATUS}" 0
assert_contains "${OUTPUT}" "Ack pipeline scope"
assert_contains "${OUTPUT}" "s2j-acknowledgements doctor"
pass_test "ONOT-DOC-007"

log_test "ONOT-DOC-008"
L0_OUT="$(mktemp)"
run_cli generate \
  -i "${ROOT_DIR}/test/fixtures/minimal.composer.lock" \
  -f md \
  --out-file "${L0_OUT}"
assert_exit_code "${STATUS}" 0
assert_contains "${OUTPUT}" "wrote"
test -s "${L0_OUT}"
pass_test "ONOT-DOC-008"

echo ""
echo "All doctor / local quality checks passed."