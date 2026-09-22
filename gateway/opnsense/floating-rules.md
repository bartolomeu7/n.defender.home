# OPNsense — regras flutuantes (Fase 3)

Aplique no **seu** firewall. Ordem importa.

1. **Allow** LAN net → WireGuard net (IPv4)
2. **Allow** LAN net UDP → endpoint WireGuard (porta 51820) na WAN
3. **Allow** LAN net → Unbound / DNS local no próprio firewall
4. **Block** LAN net → WAN net (IPv4) — kill switch
5. **Block** IPv6 * → * se a política for `blocked`
6. NAT outbound somente na interface `wg0` (não na WAN crua)

Unbound:
- Escutar na LAN
- Forwarders apenas se estiverem **dentro** do túnel
- Desligar DNS do ISP no WAN DHCP

Interface WireGuard:
- `Disable routes` desmarcado no peer full-tunnel
- Gateway WG como default da LAN (policy routing)
