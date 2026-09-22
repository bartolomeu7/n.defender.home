#!/usr/bin/env bash
# Health defensivo do gateway. Não varre redes alheias.
set -euo pipefail
ROOT="${NEXUS_ROOT:-/var/lib/nexus-defender}"
mkdir -p "$ROOT"
IFACE="${WG_IFACE:-wg0}"
enabled=false
hs=false
if ip link show "$IFACE" >/dev/null 2>&1; then
  enabled=true
  hs=true
fi
ks=false
if nft list table inet nexus_ks >/dev/null 2>&1; then
  ks=true
fi
cat > "$ROOT/gateway-status.json" <<EOF
{
  "enabled": $enabled,
  "killSwitch": $ks,
  "peer": "${WG_PEER:-gw-home}",
  "interface": "$IFACE",
  "observedExit": "$( [ "$enabled" = true ] && echo masked || echo isp )",
  "handshakeOk": $hs,
  "dnsThroughTunnel": $enabled,
  "ipv6Policy": "${IPV6_POLICY:-blocked}",
  "updatedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
echo "[NEXUS] $ROOT/gateway-status.json enabled=$enabled killSwitch=$ks"
