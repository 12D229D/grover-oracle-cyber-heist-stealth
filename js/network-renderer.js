/**
 * Network Renderer (Canvas 2D)
 * Renderizado interactivo táctico de la topología de red 2^n:
 * - Servidores con estado visual (Decoy, Intel, Honeypot, Master Vault)
 * - Pulsos de energía cuántica que recorren los enlaces
 * - Halo de amplitud de superposición de cada servidor
 * - Efectos de interferencia constructiva (brillo cian/verde) y destructiva (atenuación)
 * - Línea de escaneo láser y retícula de selección
 */

export class NetworkRenderer {
  constructor(canvas, network, engine) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.network = network;
    this.engine = engine;
    this.selectedNodeId = null;
    this.hoveredNodeId = null;
    this.pulses = [];
    this.time = 0;
    this.resize();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
    this.calculateNodePositions();
  }

  calculateNodePositions() {
    const N = this.network.N;
    const cols = Math.ceil(Math.sqrt(N));
    const rows = Math.ceil(N / cols);
    const paddingX = 60;
    const paddingY = 60;
    const availW = this.width - paddingX * 2;
    const availH = this.height - paddingY * 2;
    const stepX = cols > 1 ? availW / (cols - 1) : availW / 2;
    const stepY = rows > 1 ? availH / (rows - 1) : availH / 2;

    this.network.nodes.forEach(node => {
      node.x = paddingX + node.gridX * stepX;
      node.y = paddingY + node.gridY * stepY;
    });
  }

  emitQuantumPulse() {
    // Añadir pulsos que viajan por los enlaces
    this.network.links.forEach(link => {
      this.pulses.push({
        source: link.source,
        target: link.target,
        progress: 0,
        speed: 0.03 + Math.random() * 0.03,
        color: 'hsla(180, 100%, 65%, 0.8)'
      });
    });
  }

  render() {
    this.time += 0.02;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Fondo con rejilla táctica cyberpunk
    this.drawBackgroundGrid(ctx);

    // 2. Enlaces de fibra óptica entre nodos
    this.drawLinks(ctx);

    // 3. Pulsos de energía cuántica
    this.drawPulses(ctx);

    // 4. Nodos de servidores
    this.drawNodes(ctx);

    // Limpiar pulsos terminados
    this.pulses = this.pulses.filter(p => p.progress <= 1);
  }

  drawBackgroundGrid(ctx) {
    ctx.save();
    ctx.strokeStyle = 'hsla(180, 50%, 15%, 0.3)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < this.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // Escáner horizontal animado
    const scanY = (Math.sin(this.time * 0.8) * 0.5 + 0.5) * this.height;
    ctx.strokeStyle = 'hsla(180, 100%, 50%, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, scanY);
    ctx.lineTo(this.width, scanY);
    ctx.stroke();
    ctx.restore();
  }

  drawLinks(ctx) {
    ctx.save();
    this.network.links.forEach(link => {
      const src = this.network.nodes[link.source];
      const tgt = this.network.nodes[link.target];
      if (!src || !tgt) return;

      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.lineTo(tgt.x, tgt.y);

      if (link.quantum) {
        ctx.strokeStyle = 'hsla(280, 80%, 60%, 0.25)';
        ctx.setLineDash([4, 6]);
      } else {
        ctx.strokeStyle = 'hsla(190, 80%, 35%, 0.35)';
        ctx.setLineDash([]);
      }
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
    ctx.restore();
  }

  drawPulses(ctx) {
    ctx.save();
    this.pulses.forEach(p => {
      p.progress += p.speed;
      const src = this.network.nodes[p.source];
      const tgt = this.network.nodes[p.target];
      if (!src || !tgt) return;

      const curX = src.x + (tgt.x - src.x) * p.progress;
      const curY = src.y + (tgt.y - src.y) * p.progress;

      ctx.fillStyle = p.color;
      ctx.shadowColor = 'hsl(180, 100%, 50%)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(curX, curY, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  drawNodes(ctx) {
    this.network.nodes.forEach(node => {
      const isSelected = this.selectedNodeId === node.id;
      const isHovered = this.hoveredNodeId === node.id;
      const amp = this.engine.amplitudes[node.id] || 0;
      const prob = Math.pow(amp, 2);
      const isNegativePhase = amp < 0;

      // Radio base
      let radius = 18;
      // Modulación por amplitud cuántica: nodos con más amplitud se expanden visualmente
      const ampBoost = Math.abs(amp) * 22;
      radius += ampBoost;

      ctx.save();
      ctx.translate(node.x, node.y);

      // 1. Halo de Amplitud Cuántica / Fase
      ctx.beginPath();
      ctx.arc(0, 0, radius + 6, 0, Math.PI * 2);
      if (isNegativePhase) {
        // Fase invertida por el oráculo (-1)
        ctx.strokeStyle = `hsla(340, 95%, 55%, ${0.4 + Math.sin(this.time * 5) * 0.2})`;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([3, 3]);
      } else {
        // Fase positiva
        ctx.strokeStyle = `hsla(180, 100%, 50%, ${Math.min(1.0, prob * 2 + 0.2)})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
      }
      ctx.stroke();

      // 2. Cuerpo del Nodo
      let fillColor = 'hsl(215, 30%, 14%)';
      let strokeColor = 'hsl(190, 70%, 40%)';

      if (node.scannedClassic) {
        strokeColor = 'hsl(45, 90%, 50%)';
      }

      if (node.type === 'vault' && node.hacked) {
        fillColor = 'hsl(145, 80%, 20%)';
        strokeColor = 'hsl(145, 90%, 55%)';
      } else if (node.type === 'honeypot' && node.scannedClassic) {
        fillColor = 'hsl(350, 80%, 20%)';
        strokeColor = 'hsl(350, 90%, 55%)';
      } else if (node.type === 'intel' && node.scannedClassic) {
        fillColor = 'hsl(280, 60%, 20%)';
        strokeColor = 'hsl(280, 80%, 65%)';
      }

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();

      ctx.strokeStyle = isSelected ? 'hsl(55, 100%, 60%)' : (isHovered ? 'hsl(180, 100%, 75%)' : strokeColor);
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.shadowColor = isSelected ? 'hsl(55, 100%, 60%)' : strokeColor;
      ctx.shadowBlur = isSelected ? 12 : 5;
      ctx.stroke();

      // 3. Etiqueta Binaria del Qubit y Probabilidad
      ctx.shadowBlur = 0;
      ctx.fillStyle = isSelected ? 'hsl(55, 100%, 90%)' : 'hsl(180, 90%, 80%)';
      ctx.font = 'bold 10px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.binary, 0, -2);

      // Porcentaje de medición P(x)
      ctx.fillStyle = isNegativePhase ? 'hsl(340, 90%, 75%)' : 'hsl(180, 80%, 60%)';
      ctx.font = '9px "Inter", sans-serif';
      ctx.fillText(`${(prob * 100).toFixed(0)}%`, 0, 9);

      // Marcador de Objetivo Bóveda Maestra si ya fue hackeado o revelado
      if (node.hacked) {
        ctx.fillStyle = 'hsl(145, 100%, 50%)';
        ctx.font = 'bold 12px "Orbitron", sans-serif';
        ctx.fillText('✓', 0, -radius - 8);
      }

      ctx.restore();
    });
  }

  getNodeAt(px, py) {
    for (let i = 0; i < this.network.nodes.length; i++) {
      const n = this.network.nodes[i];
      const dx = px - n.x;
      const dy = py - n.y;
      if (Math.hypot(dx, dy) <= 26) {
        return n;
      }
    }
    return null;
  }
}
