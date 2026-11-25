/**
 * App Controller & UI Manager
 * Orquesta el ciclo de vida del juego:
 * - Inicialización del motor de Grover y la Red de Servidores
 * - Manejo de interacción de usuario (escaneo clásico, pulsos de Grover, extracción cuántica)
 * - Renderizado en tiempo real del dial de Bloch / plano 2D (|ω_perp>, |ω>)
 * - Actualización del osciloscopio de inversión sobre la media
 * - Síntesis de sonido procedural con Web Audio API
 * - Exportación de circuitos a OpenQASM 3.0, Cirq y Qiskit
 */

import { GroverEngine } from './grover-engine.js';
import { CyberNetwork } from './cyber-network.js';
import { StealthSystem } from './stealth-mechanics.js';
import { NetworkRenderer } from './network-renderer.js';
import { QasmExporter } from './qasm-exporter.js';

class SoundEffects {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep(freq = 440, type = 'sine', duration = 0.08) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playQuantumPulse() {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {}
  }

  playAlert() {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(160, this.ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch (e) {}
  }

  playSuccess() {
    if (!this.ctx) return;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      setTimeout(() => this.playBeep(freq, 'sine', 0.2), idx * 80);
    });
  }
}

class CyberHeistGame {
  constructor() {
    this.qubits = 4;
    this.targetCount = 1;
    this.missionScore = 0;
    this.missionRound = 1;

    this.engine = new GroverEngine(this.qubits);
    this.network = new CyberNetwork(this.qubits, this.targetCount);
    this.stealth = new StealthSystem();
    this.sounds = new SoundEffects();

    this.initDOM();
    this.initRenderer();
    this.bindEvents();
    this.startMission();
    this.startLoop();
  }

  initDOM() {
    this.canvas = document.getElementById('networkCanvas');
    this.dialCanvas = document.getElementById('dialCanvas');
    this.ampBarsContainer = document.getElementById('ampBarsContainer');
    this.meanLine = document.getElementById('meanLine');

    // Telemetría HUD
    this.lblQubits = document.getElementById('lblQubits');
    this.lblStates = document.getElementById('lblStates');
    this.lblIter = document.getElementById('lblIter');
    this.lblOptimal = document.getElementById('lblOptimal');
    this.lblSuccessProb = document.getElementById('lblSuccessProb');
    this.lblScore = document.getElementById('lblScore');

    // Alerta IDS
    this.alertFill = document.getElementById('alertFill');
    this.lblAlertPercent = document.getElementById('lblAlertPercent');
    this.lblStealthRank = document.getElementById('lblStealthRank');

    // Oráculo
    this.cluesList = document.getElementById('cluesList');
    this.lblOracleStatus = document.getElementById('lblOracleStatus');
    this.lblEngineStatus = document.getElementById('lblEngineStatus');

    // Botones
    this.btnQuantumStep = document.getElementById('btnQuantumStep');
    this.btnMeasure = document.getElementById('btnMeasure');
    this.btnClassicScan = document.getElementById('btnClassicScan');
    this.btnResetGrover = document.getElementById('btnResetGrover');
    this.btnNextMission = document.getElementById('btnNextMission');
    this.selectQubits = document.getElementById('selectQubits');
    this.btnExportQASM = document.getElementById('btnExportQASM');
    this.btnExportCirq = document.getElementById('btnExportCirq');
    this.btnExportQiskit = document.getElementById('btnExportQiskit');
    this.codeOutput = document.getElementById('codeOutput');

    // Modales
    this.modalOverlay = document.getElementById('modalOverlay');
    this.modalTitle = document.getElementById('modalTitle');
    this.modalBody = document.getElementById('modalBody');
    this.btnModalAction = document.getElementById('btnModalAction');
  }

  initRenderer() {
    this.renderer = new NetworkRenderer(this.canvas, this.network, this.engine);
    window.addEventListener('resize', () => {
      this.renderer.resize();
      this.drawDial();
    });
  }

  bindEvents() {
    document.addEventListener('click', () => this.sounds.init(), { once: true });

    this.btnQuantumStep.addEventListener('click', () => this.executeGroverPulse());
    this.btnMeasure.addEventListener('click', () => this.executeQuantumExtraction());
    this.btnClassicScan.addEventListener('click', () => this.executeSelectedClassicScan());
    this.btnResetGrover.addEventListener('click', () => this.resetSuperposition());
    this.btnNextMission.addEventListener('click', () => this.startMission());

    this.selectQubits.addEventListener('change', (e) => {
      this.qubits = parseInt(e.target.value, 10);
      this.startMission();
    });

    this.btnExportQASM.addEventListener('click', () => this.showCode('qasm'));
    this.btnExportCirq.addEventListener('click', () => this.showCode('cirq'));
    this.btnExportQiskit.addEventListener('click', () => this.showCode('qiskit'));

    // Interacción Canvas con el ratón
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const node = this.renderer.getNodeAt(e.clientX - rect.left, e.clientY - rect.top);
      this.renderer.hoveredNodeId = node ? node.id : null;
      this.canvas.style.cursor = node ? 'pointer' : 'crosshair';
    });

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const node = this.renderer.getNodeAt(e.clientX - rect.left, e.clientY - rect.top);
      if (node) {
        this.renderer.selectedNodeId = node.id;
        this.sounds.playBeep(600, 'sine', 0.05);
        this.updateHUD();
      }
    });

    this.btnModalAction.addEventListener('click', () => {
      this.modalOverlay.classList.remove('active');
      if (this.stealth.alarmTriggered) {
        this.startMission();
      }
    });
  }

  startMission() {
    this.engine.setQubits(this.qubits);
    this.network = new CyberNetwork(this.qubits, this.targetCount);
    this.renderer.network = this.network;
    this.renderer.selectedNodeId = null;
    this.renderer.calculateNodePositions();

    // Sincronizar objetivos con el motor cuántico
    this.engine.setTargets(this.network.targetIndices);
    this.stealth.reset();

    this.updateHUD();
    this.updateOracleCluesUI();
    this.rebuildOscilloscopeUI();
    this.drawDial();
    this.showCode('qasm');
  }

  resetSuperposition() {
    this.engine.resetToUniform();
    this.sounds.playBeep(400, 'triangle', 0.1);
    this.updateHUD();
    this.updateOscilloscope();
    this.drawDial();
  }

  executeGroverPulse() {
    if (this.stealth.alarmTriggered) return;

    // Aplicar paso completo del motor (U_ω y luego U_s)
    const evalResult = this.engine.stepGrover();
    this.stealth.quantumProbePulse();
    this.renderer.emitQuantumPulse();
    this.sounds.playQuantumPulse();

    // Actualizar visualizaciones
    this.updateHUD();
    this.updateOscilloscope();
    this.drawDial();

    if (this.stealth.alarmTriggered) {
      this.triggerGameOverModal("ALARMA IDS: DETECCIÓN TOTAL", "El cortafuegos corporativo rastreó las fluctuaciones del canal cuántico y bloqueó el nodo. La intrusión ha fallado.");
    }
  }

  executeSelectedClassicScan() {
    if (this.stealth.alarmTriggered) return;

    const nodeId = this.renderer.selectedNodeId;
    if (nodeId === null) {
      alert("Selecciona primero un servidor en la matriz para escanearlo con la sonda clásica.");
      return;
    }

    const node = this.network.nodes[nodeId];
    if (node.scannedClassic) return;

    node.scannedClassic = true;
    const probe = this.stealth.classicProbe(node);
    this.sounds.playAlert();

    // Verificar si contenía pistas del oráculo
    const clue = this.network.collectClueFromNode(node.id);
    if (clue) {
      this.sounds.playBeep(880, 'sine', 0.15);
      this.updateOracleCluesUI();
    }

    this.updateHUD();

    if (probe.triggered) {
      this.triggerGameOverModal("ALARMA IDS ACTIVADA", `El escaneo clásico O(N) del servidor [${node.name}] desbordó los umbrales del firewall.`);
    }
  }

  executeQuantumExtraction() {
    if (this.stealth.alarmTriggered) return;

    const measurement = this.engine.measure();
    this.stealth.quantumMeasurement(measurement.isHit);

    if (measurement.isHit) {
      this.sounds.playSuccess();
      const node = this.network.nodes[measurement.measuredIndex];
      node.hacked = true;
      this.missionScore += 1000 + Math.floor(measurement.successProbability * 500);

      this.triggerSuccessModal(
        "¡EXTRACCIÓN CUÁNTICA EXITOSA!",
        `Has medido el estado |${node.binary}⟩ en el servidor [${node.name}] con un ${ (measurement.successProbability * 100).toFixed(1) }% de probabilidad cuántica. La bóveda ha sido transferida limpiamente en O(√N).`
      );
    } else {
      this.sounds.playAlert();
      const node = this.network.nodes[measurement.measuredIndex];
      node.scannedClassic = true;

      if (this.stealth.alarmTriggered) {
        this.triggerGameOverModal(
          "COLAPSO DE MEDICIÓN FALLIDO",
          `La función de onda colapsó en el señuelo |${node.binary}⟩ (${node.name}). Las contramedidas ICE han aislado la red.`
        );
      } else {
        alert(`Colapso en nodo secundario |${node.binary}⟩. Amplitud insuficiente o sobre-rotación. Nivel de alerta aumentado.`);
      }
    }

    this.updateHUD();
    this.updateOscilloscope();
    this.drawDial();
  }

  updateHUD() {
    this.lblQubits.textContent = `${this.qubits} QUBITS`;
    this.lblStates.textContent = `2^${this.qubits} = ${this.engine.N}`;
    this.lblIter.textContent = this.engine.iterations;
    this.lblOptimal.textContent = this.engine.optimalIterations;

    const prob = (this.engine.getTargetSuccessProbability() * 100).toFixed(1);
    this.lblSuccessProb.textContent = `${prob}%`;
    this.lblScore.textContent = this.missionScore;

    // Alerta IDS
    this.alertFill.style.width = `${this.stealth.alertLevel}%`;
    this.lblAlertPercent.textContent = `${this.stealth.alertLevel}%`;

    const rank = this.stealth.getRankBadge();
    this.lblStealthRank.textContent = rank.text;
    this.lblStealthRank.style.color = rank.color;

    // Estado del Motor
    const evalData = this.engine.getEvaluation();
    this.lblEngineStatus.textContent = evalData.statusText;
    if (evalData.statusType === 'optimal') {
      this.lblEngineStatus.style.color = 'var(--accent-matrix-green)';
    } else if (evalData.statusType === 'danger') {
      this.lblEngineStatus.style.color = 'var(--accent-crimson)';
    } else {
      this.lblEngineStatus.style.color = 'var(--accent-cyan)';
    }
  }

  updateOracleCluesUI() {
    this.cluesList.innerHTML = '';
    if (this.network.collectedClues.length === 0) {
      this.cluesList.innerHTML = '<div style="color:var(--text-dim);font-size:0.75rem;padding:0.5rem;">Explora servidores o pulsa Grover para amplificar la firma de la bóveda.</div>';
    } else {
      this.network.collectedClues.forEach(c => {
        const item = document.createElement('div');
        item.className = `clue-item ${c.type === 'parity' ? 'parity' : ''}`;
        item.textContent = c.text;
        this.cluesList.appendChild(item);
      });
    }

    const discoveredCount = this.network.collectedClues.length;
    this.lblOracleStatus.textContent = `${discoveredCount}/${this.network.intelClues.length} Pistas Obtenidas`;
  }

  rebuildOscilloscopeUI() {
    this.ampBarsContainer.innerHTML = '';
    this.barElements = [];

    for (let i = 0; i < this.engine.N; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'amp-bar-wrapper';
      wrapper.title = `Nodo ${i} (|${i.toString(2).padStart(this.qubits, '0')}⟩)`;

      const bar = document.createElement('div');
      bar.className = 'amp-bar-core amp-bar-positive';
      wrapper.appendChild(bar);

      this.ampBarsContainer.appendChild(wrapper);
      this.barElements.push(bar);
    }
    this.updateOscilloscope();
  }

  updateOscilloscope() {
    if (!this.barElements) return;
    const isTargetSet = this.engine.targets;
    const mean = this.engine.getMeanAmplitude();

    // Línea de la media aritmética
    const meanPct = Math.max(0, Math.min(100, (mean * 80 + 50)));
    this.meanLine.style.bottom = `${meanPct}%`;

    for (let i = 0; i < this.engine.N; i++) {
      const amp = this.engine.amplitudes[i];
      const isTarget = isTargetSet.has(i);
      const bar = this.barElements[i];

      const heightPx = Math.min(55, Math.abs(amp) * 60);
      bar.style.height = `${Math.max(3, heightPx)}px`;

      if (amp < 0) {
        bar.className = 'amp-bar-core amp-bar-negative';
      } else if (isTarget) {
        bar.className = 'amp-bar-core amp-bar-positive amp-bar-target';
      } else {
        bar.className = 'amp-bar-core amp-bar-positive';
      }
    }
  }

  drawDial() {
    const ctx = this.dialCanvas.getContext('2d');
    const w = this.dialCanvas.width = 140;
    const h = this.dialCanvas.height = 140;
    const cx = w / 2;
    const cy = h / 2;
    const r = 52;

    ctx.clearRect(0, 0, w, h);

    // Círculo base unitario
    ctx.strokeStyle = 'hsla(180, 50%, 25%, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Ejes ortogonales (|ω_perp> horizontal, |ω> vertical)
    ctx.strokeStyle = 'hsla(180, 50%, 30%, 0.6)';
    ctx.beginPath();
    ctx.moveTo(cx - r - 6, cy);
    ctx.lineTo(cx + r + 6, cy);
    ctx.moveTo(cx, cy - r - 6);
    ctx.lineTo(cx, cy + r + 6);
    ctx.stroke();

    // Etiquetas de los ejes
    ctx.fillStyle = 'hsl(215, 20%, 65%)';
    ctx.font = '8px "Fira Code", monospace';
    ctx.fillText('|ω_⊥⟩', cx + r - 12, cy - 4);
    ctx.fillText('|ω⟩', cx + 4, cy - r + 10);

    // Ángulo geométrico actual (2k+1)*θ
    const currentAngle = this.engine.getGeometricAngle();
    const vecX = cx + Math.cos(currentAngle) * r;
    const vecY = cy - Math.sin(currentAngle) * r;

    // Vector de Estado |ψ_k>
    ctx.strokeStyle = 'hsl(180, 100%, 50%)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'hsl(180, 100%, 50%)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(vecX, vecY);
    ctx.stroke();

    // Punto terminal
    ctx.fillStyle = 'hsl(145, 90%, 55%)';
    ctx.beginPath();
    ctx.arc(vecX, vecY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  showCode(lang) {
    const targets = Array.from(this.engine.targets);
    if (lang === 'qasm') {
      this.codeOutput.textContent = QasmExporter.generateOpenQASM3(this.qubits, targets);
    } else if (lang === 'cirq') {
      this.codeOutput.textContent = QasmExporter.generateCirq(this.qubits, targets);
    } else if (lang === 'qiskit') {
      this.codeOutput.textContent = QasmExporter.generateQiskit(this.qubits, targets);
    }
  }

  triggerGameOverModal(title, message) {
    this.modalTitle.textContent = title;
    this.modalTitle.style.color = 'var(--accent-crimson)';
    this.modalBody.textContent = message;
    this.btnModalAction.textContent = "REINICIAR OPERACIÓN";
    this.modalOverlay.classList.add('active');
  }

  triggerSuccessModal(title, message) {
    this.modalTitle.textContent = title;
    this.modalTitle.style.color = 'var(--accent-matrix-green)';
    this.modalBody.textContent = message;
    this.btnModalAction.textContent = "SIGUIENTE NIVEL";
    this.modalOverlay.classList.add('active');
  }

  startLoop() {
    const loop = () => {
      this.renderer.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

// Inicializar al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
  window.game = new CyberHeistGame();
});
