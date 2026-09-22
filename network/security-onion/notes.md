# Security Onion — notas Fase 4

1. ISO oficial: https://docs.securityonion.net/
2. Duas NICs: management (LAN/VPN) e sniffing (SPAN/mirror do **seu** switch/gateway).
3. Não publique 443/22 do SOC na WAN sem o túnel da Fase 3.
4. Regras ET/Sigma versionadas entram na Fase 5 (manifesto assinado).
5. Arkime/Hunt ficam no sensor. O launcher só consome o resumo `network-status.json`.
