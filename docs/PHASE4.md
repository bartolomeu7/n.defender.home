# Fase 4 — Security Onion / Suricata / Zeek

Camada de visibilidade da LAN **própria**. O PC sozinho não espelha o Wi-Fi; o sensor mora no gateway ou numa VM com SPAN/mirror.

O launcher **não** instala Security Onion. Ele versiona política, lê `network-status.json` e registra alertas defensivos no vault.

## Critérios de aceite
- Suricata em modo IDS no **seu** gateway/sensor (alert, não exploit)
- Zeek gera `conn.log` / `dns.log` locais
- Alerta de teste aparece na tela Rede e na timeline
- Sensor offline = DEGRADADO (nunca PROTEGIDO sem heartbeat)
- Nenhum dump de tráfego de terceiros no GitHub

## O que o operador instala (oficial)
1. [Suricata](https://docs.suricata.io/) no OpenWrt/OPNsense/Linux do gateway **ou**
2. [Security Onion](https://docs.securityonion.net/) em VM com interface de captura
3. [Zeek](https://docs.zeek.org/) (incluso no Security Onion)
4. Opcional: [Arkime](https://arkime.com/) para sessão — dados ficam no sensor, não no repo

Regras Emerging Threats / OpenCTI entram na **Fase 5** (manifesto assinado). Aqui só o esqueleto local.

## Layout
```
/opt/nexus-defender/          (Linux sensor)
  network-status.json
  eve.json                    (Suricata, fora do Git)
  zeek/logs/
C:\NexusDefender\
  network-status.json         (cópia/resumo para o launcher Windows)
network/                      (templates versionados)
```

## Suricata
- `HOME_NET` = LAN própria
- Interface de captura = WAN ou SPAN — nunca interface de terceiros
- Default: `outputs.eve-log` + `fast.log`
- IPS (`drop`) só no **seu** gateway, depois que o IDS estiver estável

Template: `network/suricata/suricata.yaml.snippet`
Regras de laboratório: `network/suricata/local.rules`

Teste controlado:
```
curl http://testmynids.org/uid/index.html
```
Isso dispara a regra de teste ET/GPL *uid* em muitas bases comunitárias. Use só no seu lab.

## Zeek
Scripts locais em `network/zeek/local.zeek`:
- `conn`, `dns`, `http`, `ssl` — telemetria
- Sem scanners, sem exploit kits

## Security Onion
1. Instale o ISO oficial.
2. Defina a NIC de gerenciamento e a NIC de sniffing.
3. Não exponha o SOC à internet sem VPN (Fase 3).
4. Exporte um resumo para `network-status.json` (helper Linux).

## Status que o core aceita
```json
{
  "suricata": "running",
  "zeek": "running",
  "securityOnion": "present",
  "arkime": "offline",
  "interface": "eth1",
  "homeNet": "192.168.1.0/24",
  "alertsLastHour": 0,
  "mode": "ids",
  "updatedAt": "2026-09-22T21:00:00Z"
}
```
