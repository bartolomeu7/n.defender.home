# Testes de score (Fase 1)

Fórmula: `severity + confidence + repetition + asset_criticality + threat_intel_match - allowlist_bonus`

| Caso | Entrada | Score | Ação |
| --- | --- | --- | --- |
| Ruído | 5 5 0 0 0 0 | 10 | LOG_ONLY |
| Alerta | 20 15 5 5 0 0 | 45 | ALERT |
| Bloqueio | 25 20 10 10 5 0 | 70 | BLOCK |
| Quarentena | 30 20 15 15 5 0 | 85 | QUARANTINE_ISOLATE |
| Emergência | 40 20 15 20 10 0 | 100 | EMERGENCY |
| Allowlist | 40 20 15 20 10 30 | 75 | QUARANTINE_ISOLATE |

Respostas destrutivas exigem policy explícita. Nunca executar binário baixado do GitHub como se fosse regra.
