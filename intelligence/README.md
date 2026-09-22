# Intelligence pack (privado)

Este diretório guarda **regras e manifests**, nunca evidências brutas.

```
rules/sigma
rules/yara
rules/suricata
rules/crowdsec
ioc/allowlist
ioc/blocklist
policies
manifests
releases
```

Pipeline: revisão → schema → testes → hash/assinatura → release → launcher valida → staging → ativa → health check → rollback.
