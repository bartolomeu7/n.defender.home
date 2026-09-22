#!/usr/bin/env bash
# Resume saúde do sensor. Não envia pcap nem eve.json ao GitHub.
set -euo pipefail
ROOT="${NEXUS_ROOT:-/opt/nexus-defender}"
WIN_COPY="${NEXUS_WIN_COPY:-}"
mkdir -p "$ROOT"

svc() {
  local n="$1"
  if command -v systemctl >/dev/null 2>&1 && systemctl is-active --quiet "$n" 2>/dev/null; then
    echo running
  elif pgrep -x "$n" >/dev/null 2>&1; then
    echo running
  else
    echo absent
  fi
}

suricata=$(svc suricata)
zeek=absent
if pgrep -f zeek >/dev/null 2>&1 || systemctl is-active --quiet zeek 2>/dev/null; then
  zeek=running
fi
so=absent
if [[ -d /opt/so ]] || [[ -f /etc/nsm/securityonion.conf ]]; then
  so=present
fi
arkime=absent
if systemctl is-active --quiet arkimecapture 2>/dev/null; then
  arkime=running
fi

alerts=0
EVE="${SURICATA_EVE:-/var/log/suricata/eve.json}"
if [[ -f "$EVE" ]] && command -v jq >/dev/null 2>&1; then
  alerts=$(jq -s '[.[] | select(.event_type=="alert")] | length' "$EVE" 2>/dev/null || echo 0)
fi

cat > "$ROOT/network-status.json" <<EOF
{
  "suricata": "$suricata",
  "zeek": "$zeek",
  "securityOnion": "$so",
  "arkime": "$arkime",
  "interface": "${CAPTURE_IFACE:-eth1}",
  "homeNet": "${HOME_NET:-192.168.0.0/16}",
  "alertsLastHour": $alerts,
  "mode": "${SURICATA_MODE:-ids}",
  "updatedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
echo "[NEXUS] $ROOT/network-status.json suricata=$suricata zeek=$zeek"
if [[ -n "$WIN_COPY" ]]; then
  cp "$ROOT/network-status.json" "$WIN_COPY"
fi
