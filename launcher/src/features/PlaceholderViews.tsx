import { evidence, release, sensors, vpn } from "../state/store";
import { scoreRisk, type IncidentRow, type NexusEvent } from "../adapters/tauri";
import { useEffect, useState } from "react";
import type { RiskResult } from "../types/contracts";
import { MatrixWindow } from "../simulation/MatrixWindow";

export function NetworkView() {
  return (
    <div className="card">
      <h2>REDE</h2>
      <p className="muted">
        Conexões, DNS, protocolos e alertas Suricata/Zeek aparecem aqui no Modo B/C. O PC sozinho não enxerga o restante da Wi-Fi.
      </p>
      <table>
        <thead>
          <tr>
            <th>Sensor</th>
            <th>Estado</th>
            <th>Detalhe</th>
          </tr>
        </thead>
        <tbody>
          {sensors
            .filter((s) => s.layer === "network" || s.layer === "gateway")
            .map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.state}</td>
                <td>{s.detail}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export function WifiView() {
  return (
    <div className="card">
      <h2>WI-FI</h2>
      <p className="muted">
        Clientes, novos dispositivos e DNS exigem o launcher consultando o gateway. Sem gateway, esta tela permanece degradada.
      </p>
    </div>
  );
}

export function VpnView() {
  return (
    <div className="card">
      <h2>VPN PRIVACY GATEWAY</h2>
      <p className="muted">
        LAN → OPNsense/OpenWrt → WireGuard → gateway externo. VPN mascara IP de saída; não garante anonimato absoluto.
      </p>
      <table>
        <tbody>
          <tr><td>Ativa</td><td>{String(vpn.enabled)}</td></tr>
          <tr><td>Kill switch</td><td>{String(vpn.killSwitch)}</td></tr>
          <tr><td>Peer</td><td>{vpn.peer}</td></tr>
          <tr><td>IP observado</td><td>{vpn.observedExit}</td></tr>
          <tr><td>Handshake</td><td>{String(vpn.handshakeOk)}</td></tr>
          <tr><td>DNS no túnel</td><td>{String(vpn.dnsThroughTunnel)}</td></tr>
          <tr><td>IPv6</td><td>{vpn.ipv6Policy}</td></tr>
        </tbody>
      </table>
    </div>
  );
}

export function ThreatsView({ incidents = [] }: { incidents?: IncidentRow[] }) {
  const [demo, setDemo] = useState<RiskResult | null>(null);
  useEffect(() => {
    void scoreRisk({
      severity: 20,
      confidence: 15,
      repetition: 5,
      assetCriticality: 10,
      threatIntelMatch: 0,
      allowlistBonus: 5,
    }).then(setDemo);
  }, []);

  return (
    <div className="card">
      <h2>AMEAÇAS</h2>
      <p className="muted">
        Score auditável: severity + confidence + repetition + asset_criticality + threat_intel_match − allowlist_bonus.
      </p>
      {incidents.length === 0 ? (
        <p>Nenhum incidente ativo.</p>
      ) : (
        <ul className="stream">
          {incidents.map((i) => (
            <li key={i.id}>
              <span className="src">{i.action}</span>
              {i.title} <span className="muted">score {i.score}</span>
            </li>
          ))}
        </ul>
      )}
      {demo && (
        <p className="muted">
          Demo local: score {demo.score} · nível {demo.level} · ação {demo.action}
        </p>
      )}
    </div>
  );
}

export function EvidenceView({ events = [] }: { events?: NexusEvent[] }) {
  const hashed = events.filter((e) => e.sha256);
  return (
    <div className="card">
      <h2>EVIDÊNCIAS</h2>
      <p className="muted">Vault local. Hashes e timelines permanecem fora do GitHub.</p>
      {hashed.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Evento</th>
              <th>Hash local</th>
            </tr>
          </thead>
          <tbody>
            {hashed.map((e) => (
              <tr key={`${e.id}-h`}>
                <td>{e.summary}</td>
                <td>{e.sha256}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Tipo</th>
            <th>Label</th>
            <th>Local</th>
          </tr>
        </thead>
        <tbody>
          {evidence.map((e) => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e.kind}</td>
              <td>{e.label}</td>
              <td>{e.storedLocally ? "sim" : "não"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function IntelligenceView() {
  return (
    <div className="card">
      <h2>INTELLIGENCE</h2>
      <p className="muted">GitHub privado só distribui regras/manifests assinados. Release inválido é recusado.</p>
      <table>
        <tbody>
          <tr><td>Versão</td><td>{release.version}</td></tr>
          <tr><td>Assinado</td><td>{String(release.signed)}</td></tr>
          <tr><td>Hash</td><td>{String(release.hashValid)}</td></tr>
          <tr><td>Status</td><td>{release.status}</td></tr>
        </tbody>
      </table>
    </div>
  );
}

export function SimulationsView() {
  return (
    <>
      <div className="banner">Camada cênica. Esta janela não executa código, não abre shell e não fala com a rede.</div>
      <MatrixWindow />
    </>
  );
}
