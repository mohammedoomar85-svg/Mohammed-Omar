#!/usr/bin/env bash
# Uploads every site file to KV, then deploys the worker. Needs CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID.
set -euo pipefail
cd "$(dirname "$0")/.."
python3 - <<'PY'
import base64, json, pathlib
root = pathlib.Path(".")
skip = {"_src", "_deploy", "preview"}
items = []
for p in sorted(root.rglob("*")):
    if p.is_dir() or p.parts[0] in skip or p.name in {"README.md", "wrangler.jsonc", ".assetsignore"}: continue
    items.append({"key": p.as_posix(), "value": base64.b64encode(p.read_bytes()).decode(), "base64": True})
pathlib.Path("_deploy/kv.json").write_text(json.dumps(items))
print(len(items), "files")
PY
npx --yes wrangler@4.40.0 kv bulk put _deploy/kv.json --namespace-id 3be4251495684e568187607afb31f845 --remote
rm -f _deploy/kv.json
cd _deploy && npx --yes wrangler@4.40.0 deploy
