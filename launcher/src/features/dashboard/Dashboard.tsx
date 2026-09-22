import { events, overallHealth, sensors, vpn } from "../../state/store";

export function Dashboard({ onOpenMatrix }: { onOpenMatrix: () => void }) {
  const health = overallHealth(sensors);
  const criticals = events.filter((e) => e.severity >= 8).length;
  const bars = [20, 28, 18, 34, 22, 40, 26, 31, 19, 36, 24, 29];

  return (
    <>
      <div className="banner">
        Sensores de rede/endpoint ainda não implantados. O launcher nunca mostra PROTEGIDO sem telemetria real.
      </div>
      <div className="grid kpis">
        <div className="card">
          <h3>SEGURANÇA</h3>
          <div className={`kpi-value ${health === "protected" ? "" : "warn"}`}>
            {health === "protected" ? "PROTEGIDO" : "DEGRADADO"}
          </div>
        </div>
        <div className="card">
          <h3>REDE</h3>
          <div className="kpi-value warn">SEM SENSOR</div>
        </div>
        <div className="card">
          <h3>VPN</h3>
          <div className={`kpi-value ${vpn.enabled ? "" : "bad"}`}>
            {vpn.enabled ? `${vpn.peer}` : "OFF"}
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
            {events.map((e) => (
              <li key={e.id}>
                <span className="muted">{e.ts}</span> <span className="src">{e.source}</span>
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
