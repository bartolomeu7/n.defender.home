import { useState } from "react";
import type { GatewayHealth } from "../../adapters/tauri";
import { recordVpnCheck } from "../../adapters/tauri";

export function VpnView({
  gateway,
  onRefresh,
}: {
  gateway: GatewayHealth | null;
  onRefresh: () => void;
}) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const g = gateway;

  async function check() {
    setBusy(true);
    const ev = await recordVpnCheck();
    setBusy(false);
    setNote(ev ? ev.summary : "Abra o launcher Tauri para gravar a checagem no vault.");
    onRefresh();
  }

  return (
    <>
      <div className="banner">
        Fase 3: o túnel e o kill switch vivem no gateway. O painel só lê `gateway-status.json` e o serviço local.
      </div>
      <div className="card">
        <h2>VPN PRIVACY GATEWAY</h2>
        <p className="muted">
          Fonte {g?.source ?? "—"} · saúde {g?.overall ?? "desconhecida"}
        </p>
        <table>
          <tbody>
            <tr><td>Ativa</td><td>{String(g?.enabled ?? false)}</td></tr>
            <tr><td>Kill switch</td><td>{String(g?.killSwitch ?? false)}</td></tr>
            <tr><td>Peer</td><td>{g?.peer ?? "—"}</td></tr>
            <tr><td>Interface</td><td>{g?.interface ?? "wg0"}</td></tr>
            <tr><td>IP observado</td><td>{g?.observedExit ?? "isp"}</td></tr>
            <tr><td>Handshake</td><td>{String(g?.handshakeOk ?? false)}</td></tr>
            <tr><td>DNS no túnel</td><td>{String(g?.dnsThroughTunnel ?? false)}</td></tr>
            <tr><td>IPv6</td><td>{g?.ipv6Policy ?? "unknown"}</td></tr>
          </tbody>
        </table>
        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <button className="btn" disabled={busy} onClick={() => void check()}>
            {busy ? "…" : "Registrar checagem VPN"}
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
    </>
  );
}
