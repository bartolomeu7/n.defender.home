# Gateway pack — Fase 3

| Artefato | Uso |
| --- | --- |
| `wireguard/wg0.conf.example` | Cliente/servidor com placeholders |
| `wireguard/status.schema.json` | Contrato do health file |
| `openwrt/nft-killswitch.nft` | nftables: LAN não sai pela WAN |
| `opnsense/floating-rules.md` | Regras equivalentes no OPNsense |
| `dns/unbound-forward.conf` | DNS local, sem ISP |
| `../scripts/windows/Write-GatewayStatus.ps1` | Gera `gateway-status.json` |
| `../scripts/linux/check-gateway.sh` | Health em Linux |

Não commitar: chaves privadas, PSK, endpoint real com IP de produção, dumps de tráfego.
