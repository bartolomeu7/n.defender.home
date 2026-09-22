# NEXUS DEFENDER

Painel local de defesa em camadas. Control plane separado dos motores. **Somente respostas defensivas.**

Repositório: `bartolomeu7/n.defender.home` (privado)

## Missão
Defesa local em camadas; rede observável; VPN privacy gateway; threat intelligence versionada; resposta defensiva; evidências locais.

## O que isto é
Launcher Tauri 2 + React/TypeScript + Rust que coordena:
- Endpoint: Wazuh + Sysmon + Velociraptor
- Gateway: OPNsense/OpenWrt + WireGuard + Suricata
- Rede: Zeek / Security Onion / Arkime
- CTI: MISP / OpenCTI + Sigma / YARA via GitHub privado
- Deception isolada: Cowrie / OpenCanary / T-Pot
- Vault local: hashes, timeline, auditoria

## O que isto **não** é
Exploração de terceiros, DDoS, roubo de credenciais, persistência em terceiros, exfiltração ou contra-ataque ofensivo.

## Fase 1 (entregue neste commit)
- UI cyberpunk com navegação completa
- Simulação Matrix **visual-only**
- Contratos TS + policy engine Rust
- SQLite Evidence Vault (audit local)
- Adapters stub
- Política de resposta versionada
- Estrutura do pack de intelligence (sem evidências)

## Rodar a UI
```bash
cd launcher
npm install
npm run dev
```

## Rodar o launcher Tauri (Windows)
Requisitos: Node LTS, Rust `stable-msvc`, WebView2, Visual Studio Build Tools.

```bash
cd launcher
npm install
npm run tauri dev
```

## Documentação
- [Arquitetura](docs/ARCHITECTURE.md)
- [Fase 1](docs/PHASE1.md)
- [Segurança](SECURITY.md)
- Manual de referência: *NEXUS DEFENDER — Manual técnico v1.0* (22/09/2026)

## Roadmap
1. Launcher + UI ← atual
2. Endpoint (Sysmon + Wazuh)
3. Gateway + WireGuard + kill switch
4. Security Onion / Suricata / Zeek
5. CTI + updater assinado
6. Deception isolada
7. Response engine
8. Release / installer / QA
