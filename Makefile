
# Run `npm run audit` quietly. On failure, prefer the concise jq summary of
# high/critical vulnerabilities; if that yields nothing (e.g. npm changed the
# JSON structure), fall back to the full `npm run audit` output.
audit-node:
	@out=$$(npm run audit --silent 2>&1) && exit 0; \
	summary=$$(npm audit --json 2>/dev/null | jq '.vulnerabilities | map_values(select(.severity=="high" or .severity=="critical"))' 2>/dev/null); \
	if [ -n "$$summary" ] && [ "$$summary" != "{}" ] && [ "$$summary" != "null" ]; then \
		echo "$$summary"; \
	else \
		echo "$$out"; \
	fi; \
	exit 1
