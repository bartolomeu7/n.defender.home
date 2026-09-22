import type { EndpointHealth, GatewayHealth, NexusEvent } from "../../adapters/tauri";

export function Dashboard({
  onOpenMatrix,
  health,
  gateway,
  events,
}: {
  onOpenMatrix: () => void;
  health: EndpointHealth | null;
  gateway: GatewayHealth | null;
  events: NexusEvent[];
}) {
  const overall = health?.overall ?? "degraded";
  const criticals = events.filter((e) => e.severity >= 8).length;
  const bars = [20, 28, 18, 34, 22, 40, 26, 31, 19, 36, 24, 29];
  const sysmon = health?.checks.find((c) => c.id === "sysmon");
  const stream = events.slice(0, 8);

  return (
    <>
      <div className="banner">
        Sensores reais só entram no estado PROTEGIDO com heartbeat. Fase 3 lê Sysmon/Wazuh e o status do gateway.
      </div>
      <div className="grid kpis">
        <div className="card">
          <h3>SEGURANÇA</h3>
          <div className={`kpi-value ${overall === "protected" ? "" : "warn"}`}>
            {overall === "protected" ? "PROTEGIDO" : "DEGRADADO"}
          </div>
        </div>
        <div className="card">
          <h3>ENDPOINT</h3>
          <div className={`kpi-value ${sysmon?.state === "normal" ? "" : "warn"}`}>
            {sysmon?.state?.toUpperCase() ?? "SEM SENSOR"}
          </div>
        </div>
        <div className="card">
          <h3>VPN</h3>
          <div className={`kpi-value ${gateway?.enabled ? "" : "bad"}`}>
            {gateway?.enabled ? `${gateway.peer}` : "OFF"}
          </div>
        </div>
        <div className="card">
          <h3>CRÍTICAS</h3>
          <div className="kpi-value">{criticals}</div>
        </div>
      </div>
      <div className="grid two" style={{ marginTop: 14 }}>
        <div className="card">
          <h3>EVENT STREAM</h3>
          <ul className="stream">
            {stream.length === 0 && <li className="muted">Aguardando eventos do vault / sensores.</li>}
            {stream.map((e) => (
              <li key={`${e.id}-${e.ts}`}>
                <span className="muted">{(e.ts.split("T")[1] || e.ts).slice(0, 8)}</span>{" "}
                <span className="src">{e.source}</span>
                {e.summary}
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3>RISK / 60 MIN</h3>
          <div className="spark">
            {bars.map((h, i) => (
              <i key={i} style={{ height: `${h + 40}px` }} />
            ))}
          </div>
          <button className="btn" style={{ marginTop: 12 }} onClick={onOpenMatrix}>
            NOVA JANELA MATRIX
          </button>
        </div>
      </div>
    </>
  );
}
