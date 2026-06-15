#!/usr/bin/env bash
set -euo pipefail

PKG_NAME=camstreamerlib

run() {
  printf '\n\033[36m▶ %s\033[0m\n' "$*"
  "$@"
}

pkg_field() { 
  node -p "require('./package.json').$1";
}

version_exists() {
  npm view "$1@$2" version >/dev/null 2>&1;
}

bump_dev() {
  npm version prerelease --preid dev --no-git-tag-version >/dev/null; 
}

# --------- auth check ---------

if npm whoami >/dev/null 2>&1; then
  printf '\n\033[36m▶ npm whoami\033[0m\n  logged in as %s\n' "$(npm whoami)"
else
  printf '\n\033[33mNot logged in to npm — starting login.\033[0m\n'
  run npm login
fi

# --------- branch check ---------

BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if [[ "$BRANCH" == "master" ]]; then
  NPM_TAG=latest
  printf '\n\033[36mOn branch "%s" → stable release (tag: latest)\033[0m\n' "$BRANCH"
else
  BRANCH_NORMALIZED="${BRANCH//\//-}"
  IFS='-' read -r -a BRANCH_PARTS <<< "$BRANCH_NORMALIZED"
  PARSED_TAG="${BRANCH_PARTS[0]}"

  read -r -p "Use tag 'dev-${PARSED_TAG}'? [Y/n] " ANSWER
    case "$ANSWER" in
        [nN]|[nN][oO])
            NPM_TAG="dev"
            ;;
        *)
            NPM_TAG="dev-$PARSED_TAG"
            ;;
    esac

  printf '\n\033[33mUsing tag "%s"\033[0m\n' "$NPM_TAG"
  printf '\n\033[33mOn branch "%s" → dev prerelease (tag: %s)\033[0m\n' "$BRANCH" "$NPM_TAG"
fi

# --------- version bump ---------

run npm run lint
run npm run pretty:check

VERSION="$(pkg_field version)"


if [[ "$NPM_TAG" == "latest" ]]; then
  # --------- master release guard ---------
  # Refuse if this version is already the published "latest" on npm
  if [[ "$(npm view "$PKG_NAME@latest" version 2>/dev/null || true)" == "$VERSION" ]]; then
    printf '\n\033[31m✗ %s@%s is already published as latest on npm — bump the version first.\033[0m\n' \
      "$PKG_NAME" "$VERSION" >&2
    exit 1
  fi

  # Refuse if the package.json version is not committed to git (HEAD differs)
  COMMITTED_VERSION="$(git show "HEAD:./package.json" 2>/dev/null \
    | node -p "JSON.parse(require('fs').readFileSync(0, 'utf8')).version" 2>/dev/null || true)"
  if [[ "$VERSION" != "$COMMITTED_VERSION" ]]; then
    printf '\n\033[31m✗ package.json version %s is not committed (HEAD has %s) — commit it before releasing.\033[0m\n' \
      "$VERSION" "${COMMITTED_VERSION:-none}" >&2
    exit 1
  fi

  printf '\n\033[36mReleasing committed version %s@%s\033[0m\n' "$PKG_NAME" "$VERSION"
else
  run npm version prerelease --preid dev --no-git-tag-version

  CANDIDATE="$(pkg_field version)"
  while version_exists "$PKG_NAME" "$CANDIDATE"; do
    printf '\n\033[33m⚠ %s@%s already on npm — bumping past it\033[0m\n' "$PKG_NAME" "$CANDIDATE"
    bump_dev
    CANDIDATE="$(pkg_field version)"
  done
  printf '\n\033[36mNext dev version: %s@%s\033[0m\n' "$PKG_NAME" "$CANDIDATE"
fi

# --------- publish ---------

run npm run build

if [[ "$NPM_TAG" == "latest" ]]; then
  run npm publish ./dist --tag "$NPM_TAG"
else
  run npm publish ./dist --tag "$NPM_TAG"
fi

PUBLISHED_VERSION="$(pkg_field version)"
printf '\n\033[32m✓ Published %s@%s with tag "%s". Install it with:  npm install %s@%s\033[0m\n' \
  "$PKG_NAME" "$PUBLISHED_VERSION" "$NPM_TAG" "$PKG_NAME" "$NPM_TAG"

if [[ "$NPM_TAG" == "latest" ]]; then
  printf '\033[36mℹ Stable release: %s\033[0m\n' "$PUBLISHED_VERSION"
fi

exit 0