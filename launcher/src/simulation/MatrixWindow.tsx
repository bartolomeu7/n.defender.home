import { useEffect, useRef } from "react";

/**
 * Visual-only Matrix layer.
 * No shell, sockets, fetch, filesystem or process execution.
 * Permanent label: SIMULACAO - NAO EXECUTA CODIGO
 */
export function MatrixWindow() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();

    const glyphs = "01NEXUS//VISUALΣΩΔ01";
    const font = 14;
    let columns = Math.floor(canvas.width / font);
    let drops = Array.from({ length: columns }, () => Math.random() * 40);

    let frame = 0;
    const timer = window.setInterval(() => {
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#39ff14";
      ctx.font = `${font}px monospace`;
      drops.forEach((y, i) => {
        const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
        ctx.fillText(ch, i * font, y * font);
        if (y * font > canvas.height && Math.random() > 0.975) drops[i] = 0;
        else drops[i] = y + 1;
      });
      frame += 1;
      if (frame % 40 === 0) {
        columns = Math.floor(canvas.width / font);
        if (columns !== drops.length) {
          drops = Array.from({ length: columns }, () => Math.random() * 40);
        }
      }
    }, 50);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="matrix-wrap">
      <div className="matrix-label">SIMULATION WINDOW 01 &nbsp; SIMULACAO - NAO EXECUTA CODIGO</div>
      <canvas ref={ref} />
      <div className="matrix-note">Sem shell / sem sockets / sem exec / sem fetch</div>
    </div>
  );
}
