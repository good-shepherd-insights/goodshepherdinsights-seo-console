#!/bin/sh
# Image entrypoint wrapper.
#
# Two jobs:
#  1. Answer `--help` (SOP rule 10) so `docker run --rm <image> --help` is a
#     real smoke test that does not need migrations, a database, or a
#     multi-minute vite build.
#  2. Hand everything else to the repo's own entrypoint, which ends in `exec`,
#     so the server is PID 1 and receives SIGTERM (SOP rule 11).
set -e

case "${1:-}" in
  --help|-h)
    echo "open-seo $(node -p "require('/app/package.json').version")"
    echo
    echo "Usage: docker run [OPTIONS] IMAGE"
    echo
    echo "  --help    show this message and exit"
    echo
    echo "Listens on \$PORT (default 3001). Readiness: /api/health."
    echo "Startup (preflight, migrations, vite build, serve) runs automatically."
    exit 0
    ;;
esac

exec /app/deploy/docker/docker-entrypoint.sh "$@"