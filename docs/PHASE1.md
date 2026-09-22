# Fase 1 — Launcher + UI

## Entrega
- Dashboard cyberpunk
- Navegação: Dashboard, Rede, PC, Wi-Fi, VPN, Ameaças, Evidências, Intelligence, Simulações
- Janela Matrix visual-only com etiqueta permanente `SIMULACAO - NAO EXECUTA CODIGO`
- Contratos TypeScript + Rust
- SQLite local (estado, incidentes, auditoria)
- Policy engine com score de risco auditável
- Adapters stub (Wazuh, Sysmon, gateway, CTI) — sem ação ofensiva

## Como rodar (Windows)
Pré-requisitos: Node LTS, Rust stable-msvc, WebView2, VS Build Tools.

```
cd launcher
npm install
npm run tauri dev
```

Frontend isolado (UI only):

```
cd launcher
npm install
npm run dev
```
