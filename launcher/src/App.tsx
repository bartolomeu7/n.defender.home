import { useCallback, useEffect, useState } from "react";
import {
  fetchEndpointHealth,
  fetchEvents,
  fetchGatewayHealth,
  fetchIncidents,
  type EndpointHealth,
  type GatewayHealth,
  type IncidentRow,
  type NexusEvent,
} from "./adapters/tauri";
import { Dashboard } from "./features/dashboard/Dashboard";
import { EndpointView } from "./features/endpoint/EndpointView";
import { VpnView } from "./features/vpn/VpnView";
import {
  EvidenceView,
  IntelligenceView,
  NetworkView,
  SimulationsView,
  ThreatsView,
  WifiView,
} from "./features/PlaceholderViews";
import { NAV, type ModuleId } from "./types/contracts";

export default function App() {
  const [module, setModule] = useState<ModuleId>("dashboard");
  const [health, setHealth] = useState<EndpointHealth | null>(null);
  const [gateway, setGateway] = useState<GatewayHealth | null>(null);
  const [events, setEvents] = useState<NexusEvent[]>([]);
  const [incidents, setIncidents] = useState<IncidentRow[]>([]);

  const refresh = useCallback(() => {
    void fetchEndpointHealth().then(setHealth);
    void fetchGatewayHealth().then(setGateway);
    void fetchEvents().then(setEvents);
    void fetchIncidents().then(setIncidents);
  }, []);

  useEffect(() => {
    refresh();
    const t = window.setInterval(refresh, 15000);
    return () => window.clearInterval(t);
  }, [refresh]);

  const overall =
    health?.overall === "protected" && gateway?.overall === "protected" ? "protected" : "degraded";

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          NEXUS <span>DEFENDER</span>
        </div>
        <div className="status-row">
          <span>
            <i className={`dot ${overall === "protected" ? "ok" : "warn"}`} />
            {overall === "protected" ? "PROTECTED" : "DEGRADED"}
          </span>
          <span>
            VPN / {gateway?.enabled ? gateway.peer : "OFF"} / KILL SWITCH{" "}
            {gateway?.killSwitch ? "ON" : "OFF"}
          </span>
        </div>
      </header>
      <nav className="nav">
        {NAV.map((item) => (
          <button
            key={item.id}
            className={module === item.id ? "active" : ""}
            onClick={() => setModule(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <main className="main">
        {module === "dashboard" && (
          <Dashboard
            onOpenMatrix={() => setModule("simulations")}
            health={health}
            gateway={gateway}
            events={events}
          />
        )}
        {module === "network" && <NetworkView />}
        {module === "endpoint" && (
          <EndpointView health={health} events={events} incidents={incidents} onRefresh={refresh} />
        )}
        {module === "wifi" && <WifiView />}
        {module === "vpn" && <VpnView gateway={gateway} onRefresh={refresh} />}
        {module === "threats" && <ThreatsView incidents={incidents} />}
        {module === "evidence" && <EvidenceView events={events} />}
        {module === "intelligence" && <IntelligenceView />}
        {module === "simulations" && <SimulationsView />}
      </main>
    </div>
  );
}
