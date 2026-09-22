import { useState } from "react";
import type { NetworkHealth, NexusEvent } from "../../adapters/tauri";
import { recordIdsTest } from "../../adapters/tauri";

export function NetworkView({
  network,
  events,
  onRefresh,
}: {
  network: NetworkHealth | null;
  events: NexusEvent[];
  onRefresh: () => void;
}) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const n = network;
  const alerts = events.filter((e) => e.source === "suricata" || e.source === "zeek");

  async function lab() {
    setBusy(true);
    const ev = await recordIdsTest();
    setBusy(false);
    setNote(ev ? ev.summary : "Abra o launcher Tauri para gravar o alerta no vault.");
    onRefresh();
  }

  return (
    <>
      <div className="banner">
        Fase 4: Suricata/Zeek no sensor. O PC sozinho não espelha a LAN — copie network-status.json para C:\NexusDefender.
      </div>
      <div className="card">
        <h2>REDE</h2>
        <p className="muted">
          Fonte {n?.source ?? "—"} · saúde {n?.overall ?? "desconhecida"} · modo {n?.mode ?? "ids"}
        </p>
        <table>
          <tbody>
            <tr><td>Suricata</td><td>{n?.suricata ?? "absent"}</td></tr>
            <tr><td>Zeek</td><td>{n?.zeek ?? "absent"}</td></tr>
            <tr><td>Security Onion</td><td>{n?.securityOnion ?? "absent"}</td></tr>
            <tr><td>Arkime</td><td>{n?.arkime ?? "absent"}</td></tr>
            <tr><td>Interface</td><td>{n?.interface ?? "—"}</td></tr>
            <tr><td>HOME_NET</td><td>{n?.homeNet ?? "—"}</td></tr>
            <tr><td>Alertas (arquivo)</td><td>{n?.alertsLastHour ?? 0}</td></tr>
          </tbody>
        </table>
        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <button className="btn" disabled={busy} onClick={() => void lab()}>
            {busy ? "…" : "Alerta IDS de laboratório"}
          </button>
          <button className="btn" onClick={onRefresh}>
            Atualizar
          </button>
        </div>
        {note && (
          <p className="muted" style={{ marginTop: 10 }}>
            {note}
          </p>
        )}
      </div>
      <div className="card" style={{ marginTop: 14 }}>
        <h3>ALERTAS</h3>
        <ul className="stream">
          {alerts.length === 0 && <li className="muted">Nenhum alerta Suricata/Zeek no vault.</li>}
          {alerts.map((e) => (
            <li key={`${e.id}-${e.ts}`}>
              <span className="src">{e.source}</span>
              {e.summary}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
