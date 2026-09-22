# Network pack — Fase 4

| Artefato | Uso |
| --- | --- |
| `suricata/suricata.yaml.snippet` | HOME_NET + eve-log |
| `suricata/local.rules` | Regras de laboratório (detect only) |
| `zeek/local.zeek` | Telemetria conn/dns/http |
| `security-onion/notes.md` | Sensor oficial, NIC de sniffing |
| `status.schema.json` | Contrato do health file |
| `../scripts/linux/write-network-status.sh` | Gera network-status.json |

Não commitar: `eve.json`, pcaps, logs Zeek, credenciais do SOC.
