#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./scripts/deploy-static.sh --bucket <s3-bucket> --distribution <cloudfront-id> --api-base <api-url>

Example:
  ./scripts/deploy-static.sh \
    --bucket bitenex-prod-admin-123456789012 \
    --distribution E123456789ABC \
    --api-base https://api.vietnq.online/api/v1
EOF
}

bucket=""
distribution=""
api_base=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --bucket)
      bucket="${2:-}"
      shift 2
      ;;
    --distribution)
      distribution="${2:-}"
      shift 2
      ;;
    --api-base)
      api_base="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$bucket" || -z "$distribution" || -z "$api_base" ]]; then
  usage
  exit 1
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "aws CLI is required." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required." >&2
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "${script_dir}/.." && pwd)"
output_dir="${project_root}/.output/public"

cd "${project_root}"

NUXT_PUBLIC_API_BASE="${api_base}" npm run generate

aws s3 sync "${output_dir}/" "s3://${bucket}" --delete
aws s3 cp "${output_dir}/" "s3://${bucket}" \
  --recursive \
  --exclude "*" \
  --include "*.html" \
  --cache-control "public,max-age=0,must-revalidate"
aws cloudfront create-invalidation --distribution-id "${distribution}" --paths "/*"

echo "Deployed bitenex-admin to s3://${bucket} and invalidated CloudFront ${distribution}."
