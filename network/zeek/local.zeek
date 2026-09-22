## NEXUS DEFENDER — Zeek local site policy (Fase 4)
## Telemetria. Sem scanners.

@load base/protocols/conn
@load base/protocols/dns
@load base/protocols/http
@load base/protocols/ssl
@load base/frameworks/notice

redef Log::default_rotation_interval = 1 hr;

event zeek_init()
{
    print "nexus-defender zeek site policy loaded";
}
