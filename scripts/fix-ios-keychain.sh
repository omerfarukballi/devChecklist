#!/usr/bin/env bash
# Fix "Distribution certificate hasn't been imported successfully" for EAS local iOS build.
# Cause: Missing Apple WWDR intermediate certificate. This script installs it.

set -e
WWDR_URL="https://www.apple.com/certificateauthority/AppleWWDRCAG3.cer"
CERT_NAME="AppleWWDRCAG3.cer"
DIR="${TMPDIR:-/tmp}/apple-wwdr-cert"
mkdir -p "$DIR"
CERT_PATH="$DIR/$CERT_NAME"

echo "Downloading Apple WWDR CA G3 intermediate certificate..."
curl -sSL -o "$CERT_PATH" "$WWDR_URL"

# Prefer adding to login keychain so it's available for EAS temp keychain validation
LOGIN_KEYCHAIN="$HOME/Library/Keychains/login.keychain-db"
if [ -f "$LOGIN_KEYCHAIN" ]; then
  echo "Adding certificate to login keychain..."
  security add-certificates -k "$LOGIN_KEYCHAIN" "$CERT_PATH" 2>/dev/null || true
fi
# Also open so it's in System keychain if user has no login keychain-db (older macOS)
open "$CERT_PATH"

echo "Done. Certificate opened in Keychain Access."
echo "If prompted, add it to 'login' or 'System' keychain."
echo "Then run: npm run build:ios:local"
