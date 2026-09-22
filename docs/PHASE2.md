# Fase 2 — Endpoint Windows

Entrega: Sysmon + Wazuh Agent + health checks + timeline de incidentes.

O launcher **não instala binários oficiais por conta própria**. Ele aplica configuração versionada, consulta saúde e registra evidência local.

## Critérios de aceite (manual §17.2)
- Evento controlado de processo → Sysmon → (quando houver manager) Wazuh
- Arquivo de teste alterado → FIM → alerta
- Conexão de teste → Sysmon → correlação no dashboard
- Quarentena de teste → arquivo e hash preservados no vault local
- Sensor offline aparece como **DEGRADADO**, nunca PROTEGIDO sem heartbeat

## O que o operador instala (fontes oficiais)
1. [Sysmon](https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon) — Microsoft Sysinternals
2. [Wazuh Agent Windows](https://documentation.wazuh.com/current/installation-guide/wazuh-agent/wazuh-agent-package-windows.html)
3. Opcional Fase 2+/IR: [Velociraptor](https://docs.velociraptor.app/docs/deployment/) em servidor Linux; client MSI gerado pelo próprio servidor

## Layout no disco
```
C:\NexusDefender\
  sysmon.xml          (cópia de endpoint/sysmon/sysmon.xml)
  wazuh-local.conf    (referência)
  evidence\           (nunca commitar)
```

## Sysmon
Em PowerShell **elevado**, com o binário oficial já baixado:

```
sysmon64 -accepteula -i C:\NexusDefender\sysmon.xml
sysmon64 -c C:\NexusDefender\sysmon.xml
```

Log: Event Viewer → Applications and Services Logs → Microsoft → Windows → Sysmon/Operational

Helper versionado:

```
pwsh -File scripts/windows/Install-Endpoint.ps1 -ApplySysmon
```

## Wazuh Agent
1. Instale o MSI oficial.
2. Informe o endereço do Wazuh Manager da **sua** rede e a chave/registro do agente.
3. Inicie o serviço `WazuhSvc`.
4. Ative FIM nas pastas autorizadas (veja `endpoint/wazuh/ossec.conf.snippet.xml`).
5. Confirme o agente no dashboard do manager.

O NEXUS não envia coleta bruta para o GitHub.

## Teste controlado (laboratório próprio)
1. Criar `C:\NexusDefender\fim-test.txt`, editar o conteúdo.
2. No launcher: PC → “Registrar evento FIM de teste”.
3. Confirmar item na timeline e hash no vault.
4. Não use exploits, scanners ofensivos ou alvos de terceiros.

## Health checks que o core executa
Allowlist no Rust — sem shell genérico no frontend:
- serviço `Sysmon64` / `Sysmon`
- binário Sysmon em `C:\Windows` ou `C:\NexusDefender`
- serviço `WazuhSvc`
- arquivo de config Sysmon presente
- vault SQLite gravável
