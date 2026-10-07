# syntax=docker/dockerfile:1.7
#
# SOP-conformant root Dockerfile, adopted from deploy/docker/Dockerfile.
# Every rule number below refers to ~/repos/CONTAINER_IMAGE_SOP.md §1.
#
# Shape is unchanged from the adopted file: this app compiles itself at
# container start (deploy/docker/docker-entrypoint.sh runs migrations then
# `vite build`, because vite inlines build-relevant env into the bundle), so
# the runtime legitimately needs the devDependencies. The split here is
# therefore dependency resolution (deps stage) from the application tree and
# its configuration (runtime stage) — not a build/runtime dependency split.

# rule 1 — tag AND digest, both stages. Digest re-resolved 2026-10-02 with
#   docker buildx imagetools inspect docker.io/library/node:22 \
#     --format '{{json .Manifest.Digest}}'
# The full (non-slim) node image is deliberate: workerd needs a real CA trust
# store for outbound HTTPS.
ARG NODE_VERSION=22
ARG NODE_IMAGE=node:${NODE_VERSION}

# ---- deps -------------------------------------------------------------------
FROM ${NODE_IMAGE}@sha256:363e1587494626837fa7f9a23bdb453d13b0ff3c67c705c2805cfc69c2d2fad7 AS deps
# rule 13 — SHELL is an instruction, not an ENV (`ENV SHELL [...]` is ignored).
SHELL ["/bin/bash","-o","pipefail","-c"]
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
WORKDIR /app
# corepack pins pnpm to the exact version package.json declares.
RUN corepack enable && corepack prepare pnpm@10.30.1 --activate
# rule 6 — frozen lockfile, never a bare `pnpm install <pkg>`.
# rule 12 — manifests only, so a source-only change does not re-resolve.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
# rule 13 — cache mount keeps the store out of the layer.
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---- runtime ----------------------------------------------------------------
FROM ${NODE_IMAGE}@sha256:363e1587494626837fa7f9a23bdb453d13b0ff3c67c705c2805cfc69c2d2fad7 AS runtime
SHELL ["/bin/bash","-o","pipefail","-c"]
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NODE_ENV=production
# the repo entrypoint shells out to pnpm at start, so the runtime stage needs
# the same corepack shim the deps stage installed, not just node_modules.
RUN corepack enable && corepack prepare pnpm@10.30.1 --activate
# rule 5 — fixed UID so a bind-mounted volume has predictable ownership.
RUN groupadd --gid 10001 app && useradd --create-home --uid 10001 --gid 10001 app
WORKDIR /app
# rule 2 — node_modules from the deps stage is the only thing carried over.
COPY --from=deps --chown=app:app /app/node_modules /app/node_modules
# rule 4 — copy narrowly. This is the application tree the build and the server
# actually read; docs/, tests/, .git and every .env are excluded by
# .dockerignore rather than copied-then-deleted.
# package.json carries the `build`/`db:migrate:local` scripts the repo's own
# entrypoint runs at start; the lockfiles and .npmrc travel with it (.npmrc
# raises the V8 heap ceiling via node-options so the ~7400-module SSR build
# does not OOM under Node's ~2GB default). All copied from the deps stage so
# what the app reads is byte-identical to what was installed against.
COPY --from=deps --chown=app:app /app/package.json /app/pnpm-lock.yaml \
     /app/pnpm-workspace.yaml /app/.npmrc ./
COPY --chown=app:app vite.config.ts vite-plugin-lean-worker-bundle.ts \
     tsconfig.json components.json wrangler.jsonc wrangler.audit.jsonc ./
COPY --chown=app:app src ./src
COPY --chown=app:app scripts ./scripts
COPY --chown=app:app drizzle ./drizzle
# .agents/skills is a build input, not documentation: the client imports
# setup-openseo/SKILL.md?raw and the server globs every skill into SAM.
COPY --chown=app:app .agents ./.agents
# tests/fixtures are dynamically imported at build time by the SSR bundle
# (src/serverFunctions/{domain,keywords}.ts); the rest of tests/ stays out.
COPY --chown=app:app tests/fixtures ./tests/fixtures
COPY --chown=app:app deploy/docker/docker-entrypoint.sh ./deploy/docker/
# the repo's entrypoint is a plain /bin/sh script; make it executable in the
# layer rather than relying on the host's file mode
RUN chmod +x /app/deploy/docker/docker-entrypoint.sh
# The app writes its local D1 state and build output under /app at start.
RUN mkdir -p /app/.wrangler /app/dist && chown -R app:app /app
USER app
EXPOSE 3001
# rule 11 — graceful shutdown reaches the app, not /bin/sh -c.
STOPSIGNAL SIGTERM
# rule 7 — readiness probe against the unauthenticated setup/health endpoint.
# The long start period covers migrations plus the boot-time vite build.
HEALTHCHECK --interval=30s --timeout=10s --start-period=300s --retries=3 \
  CMD ["node","-e","fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/api/health').then(function(r){process.exit(r.ok?0:1)}).catch(function(){process.exit(1)})"]
# rule 8
ARG BUILD_VERSION=0.1.12
ARG GIT_REV=unknown
LABEL org.opencontainers.image.title="open-seo" \
      org.opencontainers.image.source="https://github.com/good-shepherd-insights/open-seo" \
      org.opencontainers.image.version="$BUILD_VERSION" \
      org.opencontainers.image.revision="$GIT_REV" \
      org.opencontainers.image.licenses="MIT"
# rule 11 — exec form. Rule 10 — `docker run --rm <img> --help` exercises this.
# The wrapper answers --help without booting the app; anything else is handed
# to the repo's own entrypoint (preflight, migrations, conditional build,
# `vite preview`), which ends in `exec`, so PID 1 is the server itself.
COPY --chown=app:app deploy/docker/sop-entrypoint.sh /usr/local/bin/openseo-entrypoint
RUN chmod +x /usr/local/bin/openseo-entrypoint
ENTRYPOINT ["/usr/local/bin/openseo-entrypoint"]
CMD []