#!/usr/bin/env bash
set -euo pipefail

run() {
  printf '\n\033[36m▶ %s\033[0m\n' "$*"
  "$@"
}

readPackage() { 
  node -p "require('./package.json').$1";
}
writePackage() {
  node -e "const p=require('./package.json'); p['$1']='$2'; require('fs').writeFileSync('./package.json', JSON.stringify(p, null, 2) + '\n')"
}

#   ----------------------------------------
#                   AUTH CHECK
#   ----------------------------------------

if npm whoami >/dev/null 2>&1; then
  if [[ "$(npm whoami)" != "camstreamer" ]]; then
    printf '\n\033[31m✗ Logged in as "%s", but expected "camstreamer". Please log out and log in with the correct account.\033[0m\n' "$(npm whoami)" >&2
    exit 1
  fi
  printf '\n\033[36m▶ npm whoami\033[0m\n  logged in as %s\n' "$(npm whoami)"
else
  printf '\n\033[33mNot logged in to npm — starting login.\033[0m\n'
  run npm login camstreamer
fi

#   ----------------------------------------
#                   BRANCH CHECK
#   ----------------------------------------

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

#   ----------------------------------------
#                BUILD PACKAGE
#   ----------------------------------------

run npm run lint
run npm run pretty:check
run npm run build

#   ----------------------------------------
#         PREPARE PACKAGE FOR PUBLISH
#   ----------------------------------------

COMMIT="$(git rev-parse --short HEAD)"
VERSION="$(readPackage version)"
PKG_NAME="$(readPackage name)"

if [[ "$NPM_TAG" == "latest" ]]; then
  
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
  cd ./dist
  CANDIDATE="$(readPackage version)-${COMMIT}"
  writePackage version "$CANDIDATE"
  cd ..
  printf '\n\033[36mNext dev version: %s@%s\033[0m\n' "$PKG_NAME" "$CANDIDATE"
fi

#   ----------------------------------------
#                   PUBLISH
#   ----------------------------------------

if [[ "$NPM_TAG" == "latest" ]]; then
  run npm publish ./dist --tag "$NPM_TAG"
else
  run npm publish ./dist --tag "$NPM_TAG"
fi

cd ./dist
PUBLISHED_VERSION="$(readPackage version)"

printf '\n\033[32m✓ Published %s@%s with tag "%s". Install it with:  npm install %s@%s\033[0m\n' \
  "$PKG_NAME" "$PUBLISHED_VERSION" "$NPM_TAG" "$PKG_NAME" "$NPM_TAG"

if [[ "$NPM_TAG" == "latest" ]]; then
  printf '\033[36mℹ Stable release: %s\033[0m\n' "$PUBLISHED_VERSION"
fi

exit 0