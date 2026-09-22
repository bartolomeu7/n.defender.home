import { useState } from "react";
import type { EndpointHealth, IncidentRow, NexusEvent } from "../../adapters/tauri";
import { recordFimTest, recordProcessTest } from "../../adapters/tauri";

export function EndpointView({
  health,
  events,
  incidents,
  onRefresh,
}: {
  health: EndpointHealth | null;
  events: NexusEvent[];
  incidents: IncidentRow[];
  onRefresh: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string>("");

  async function run(kind: "fim" | "proc") {
    setBusy(kind);
    const result = kind === "fim" ? await recordFimTest() : await recordProcessTest();
    setBusy(null);
    if (!result) {
      setNote("Sem core Tauri — o teste só grava no vault quando o launcher desktop está aberto.");
      return;
    }
    setNote(`${result.event} registrado (sev ${result.severity})`);
    onRefresh();
  }

  const checks = health?.checks ?? [];

  return (
    <>
      <div className="banner">
        Fase 2: health check local. Instale Sysmon e Wazuh Agent pelos pacotes oficiais; o NEXUS só aplica perfil e lê estado.
      </div>
      <div className="card">
        <h2>PC / ENDPOINT</h2>
        <p className="muted">
          Host {health?.host ?? "—"} · saúde {health?.overall ?? "desconhecida"}
        </p>
        <table>
          <thead>
            <tr>
              <th>Componente</th>
              <th>Estado</th>
              <th>Detalhe</th>
            </tr>
          </thead>
          <tbody>
            {checks.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.state}</td>
                <td>{s.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <button className="btn" disabled={!!busy} onClick={() => void run("proc")}>
            {busy === "proc" ? "…" : "Evento processo (lab)"}
          </button>
          <button className="btn" disabled={!!busy} onClick={() => void run("fim")}>
            {busy === "fim" ? "…" : "Registrar evento FIM de teste"}
          </button>
          <button className="btn" onClick={onRefresh}>
            Atualizar health
          </button>
        </div>
        {note && <p className="muted" style={{ marginTop: 10 }}>{note}</p>}
      </div>

      <div className="grid two" style={{ marginTop: 14 }}>
        <div className="card">
          <h3>TIMELINE</h3>
          <ul className="stream">
            {events.length === 0 && <li className="muted">Nenhum evento local ainda.</li>}
            {events.map((e) => (
              <li key={`${e.id}-${e.ts}`}>
                <span className="muted">{e.ts.slice(11, 19) || e.ts}</span>{" "}
                <span className="src">{e.source}</span>
                {e.summary}
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3>INCIDENTES</h3>
          <ul className="stream">
            {incidents.length === 0 && <li className="muted">Nenhum incidente (severity &lt; 7).</li>}
            {incidents.map((i) => (
              <li key={i.id}>
                <span className="src">{i.action}</span>
                {i.title} <span className="muted">score {i.score}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
