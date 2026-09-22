# Segurança — NEXUS DEFENDER

Este repositório implementa **somente defesa**.

## Permitido
- Visibilidade de endpoint e rede própria
- Bloqueio, isolamento e quarentena da própria infraestrutura
- Kill switch de VPN/WAN da própria LAN
- Coleta local de evidências (hash, timeline, auditoria)
- Regras versionadas (Sigma/YARA/Suricata) com validação de hash/assinatura
- Honeypots isolados, sem credenciais reais

## Proibido (não entra no produto)
- Exploração de terceiros
- DDoS
- Roubo de credenciais
- Persistência em sistemas de terceiros
- Exfiltração de dados de terceiros
- Qualquer mecanismo de contra-ataque ofensivo

## Regras do launcher
- Frontend **não** recebe permissão genérica de shell
- Comandos Rust são allowlist explícita
- Janela Matrix é 100% cênica: sem shell, socket, fetch, FS arbitrário ou exec
- Releases sem hash/assinatura válidos são rejeitados
- Evidências pessoais e PCAPs **não** vão para o GitHub

## Dados que nunca entram no Git
Senhas, tokens, chaves privadas, cookies, PCAP bruto, dumps de memória, documentos pessoais.
