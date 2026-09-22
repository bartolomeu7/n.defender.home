import { useMemo, useState } from "react";
import { Dashboard } from "./features/dashboard/Dashboard";
import {
  EndpointView,
  EvidenceView,
  IntelligenceView,
  NetworkView,
  SimulationsView,
  ThreatsView,
  VpnView,
  WifiView,
} from "./features/PlaceholderViews";
import { overallHealth, sensors, vpn } from "./state/store";
import { NAV, type ModuleId } from "./types/contracts";

export default function App() {
  const [module, setModule] = useState<ModuleId>("dashboard");
  const health = useMemo(() => overallHealth(sensors), []);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          NEXUS <span>DEFENDER</span>
        </div>
        <div className="status-row">
          <span>
            <i className={`dot ${health === "protected" ? "ok" : "warn"}`} />
            {health === "protected" ? "PROTECTED" : "DEGRADED"}
          </span>
          <span>
            VPN / {vpn.enabled ? vpn.peer : "OFF"} / KILL SWITCH {vpn.killSwitch ? "ON" : "OFF"}
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
        {module === "dashboard" && <Dashboard onOpenMatrix={() => setModule("simulations")} />}
        {module === "network" && <NetworkView />}
        {module === "endpoint" && <EndpointView />}
        {module === "wifi" && <WifiView />}
        {module === "vpn" && <VpnView />}
        {module === "threats" && <ThreatsView />}
        {module === "evidence" && <EvidenceView />}
        {module === "intelligence" && <IntelligenceView />}
        {module === "simulations" && <SimulationsView />}
      </main>
    </div>
  );
}
