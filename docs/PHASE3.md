# Fase 3 — Gateway + WireGuard + kill switch

Modo B do manual: a casa passa pelo gateway; o PC sozinho não vê a LAN inteira.

O launcher **não** sobe OPNsense/OpenWrt. Ele versiona política, lê saúde e registra evidência.

## Critérios de aceite
- Túnel WireGuard sobe no gateway **ou** no cliente Windows do laboratório
- Kill switch: sem handshake, tráfego de saída WAN cai (exceto UDP do endpoint WG)
- DNS sai pelo túnel ou Unbound local — não pelo resolvedor do ISP
- IPv6: `blocked` ou `tunneled` — nunca `unknown` em produção
- Painel VPN reflete o arquivo de status; sem handshake = DEGRADADO

## Topologia alvo
```
LAN (PCs/IoT)
   → OPNsense ou OpenWrt
        → filtro DNS / Unbound
        → Suricata (IDS, Fase 4)
        → WireGuard (full tunnel)
        → peer próprio (VPS ou segundo gateway)
```

## O que o operador instala (oficial)
1. [OPNsense](https://docs.opnsense.org/) **ou** [OpenWrt](https://openwrt.org/docs/guide-user/start)
2. Pacote WireGuard da distribuição / plugin oficial
3. No Windows de laboratório: [WireGuard](https://www.wireguard.com/install/)

Chaves e `Endpoint` reais **não** entram no Git. Copie os exemplos e preencha fora do repositório.

## Layout
```
C:\NexusDefender\
  wg0.conf                 (cliente, fora do Git)
  gateway-status.json      (health que o launcher lê)
  evidence\
gateway/                   (templates versionados)
```

## Kill switch (princípio)
Permitir:
- LAN ↔ gateway
- UDP para o endpoint WireGuard configurado
- tráfego na interface `wg0`

Negar:
- LAN → WAN direto
- IPv6 nativo se a política for `blocked`
- DNS para resolvedores do ISP quando o túnel estiver ativo

Templates:
- `gateway/openwrt/nft-killswitch.nft`
- `gateway/opnsense/floating-rules.md`
- `gateway/wireguard/wg0.conf.example` (`PostUp`/`PostDown`)

## Status que o core aceita
`C:\NexusDefender\gateway-status.json` (ou `$NEXUS_ROOT/gateway-status.json`):

```json
{
  "enabled": true,
  "killSwitch": true,
  "peer": "gw-home",
  "interface": "wg0",
  "observedExit": "masked",
  "handshakeOk": true,
  "dnsThroughTunnel": true,
  "ipv6Policy": "blocked",
  "updatedAt": "2026-09-22T20:00:00Z"
}
```

O helper `scripts/windows/Write-GatewayStatus.ps1` preenche o arquivo a partir do serviço WireGuard local. Não publica o IP real no GitHub.

## Teste controlado
1. Subir o túnel no **seu** peer.
2. Confirmar handshake.
3. Derrubar o túnel e verificar que a WAN cai (kill switch).
4. No launcher: VPN → “Registrar checagem VPN”.
5. Não teste contra redes de terceiros.
