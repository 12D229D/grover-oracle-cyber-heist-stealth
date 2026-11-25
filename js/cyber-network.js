/**
 * Cyber Network Procedural Generator
 * Genera la topología de la red matricial de servidores 2^n:
 * - Nodos señuelo (decoys)
 * - Nodos de pista / terminales de inteligencia (intel nodes)
 * - Servidores de datos y bases de datos intermedias
 * - Bóvedas cifradas maestras (Master Vaults - Objetivos f(x)=1)
 * - Firewalls y honeypots
 */

export class CyberNetwork {
  constructor(qubits = 4, targetCount = 1) {
    this.n = qubits;
    this.N = Math.pow(2, qubits);
    this.targetCount = targetCount;
    this.nodes = [];
    this.links = [];
    this.intelClues = [];
    this.collectedClues = [];
    this.oracleConstraints = [];
    this.generateNetwork();
  }

  generateNetwork() {
    this.nodes = [];
    this.links = [];
    this.intelClues = [];
    this.collectedClues = [];

    // Selección aleatoria de bóvedas maestras (targets)
    const targetSet = new Set();
    while (targetSet.size < this.targetCount) {
      targetSet.add(Math.floor(Math.random() * this.N));
    }
    this.targetIndices = Array.from(targetSet);

    // Generar pistas lógicas para el Oráculo Booleano
    this.generateOracleClues();

    // Disposición en matriz o anillo fractal según N
    const cols = Math.ceil(Math.sqrt(this.N));
    const rows = Math.ceil(this.N / cols);

    for (let i = 0; i < this.N; i++) {
      const isTarget = targetSet.has(i);
      const binaryString = i.toString(2).padStart(this.n, '0');
      const r = Math.floor(i / cols);
      const c = i % cols;

      let type = 'decoy';
      let name = `SRV-${binaryString}`;
      let security = Math.floor(Math.random() * 40) + 20;

      if (isTarget) {
        type = 'vault';
        name = `VAULT-${binaryString}`;
        security = 95;
      } else if (i % 3 === 0 && this.intelClues.some(clue => clue.sourceNode === i)) {
        type = 'intel';
        name = `INTEL-${binaryString}`;
        security = 45;
      } else if (i % 5 === 0) {
        type = 'honeypot';
        name = `TRAP-${binaryString}`;
        security = 80;
      } else {
        type = 'decoy';
        name = `NODE-${binaryString}`;
      }

      this.nodes.push({
        id: i,
        binary: binaryString,
        name,
        type,
        security,
        gridX: c,
        gridY: r,
        x: 0, // Se computan en el renderer
        y: 0,
        hacked: false,
        scannedClassic: false,
        alertContribution: type === 'honeypot' ? 25 : (type === 'vault' ? 35 : 10)
      });
    }

    // Generar enlaces de fibra óptica de la topología
    for (let i = 0; i < this.N; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;

      // Enlace horizontal
      if (c + 1 < cols && (i + 1) < this.N) {
        this.links.push({ source: i, target: i + 1, active: true, load: Math.random() });
      }
      // Enlace vertical
      if (r + 1 < rows && (i + cols) < this.N) {
        this.links.push({ source: i, target: i + cols, active: true, load: Math.random() });
      }
      // Enlace hipercubo cuántico (flip 1 bit aleatorio para ilustrar conectividad de n-qubits)
      const bitFlip = 1 << Math.floor(Math.random() * this.n);
      const hyperTarget = i ^ bitFlip;
      if (hyperTarget < this.N && hyperTarget > i) {
        this.links.push({ source: i, target: hyperTarget, active: false, quantum: true });
      }
    }
  }

  generateOracleClues() {
    this.intelClues = [];
    const target = this.targetIndices[0];
    const targetBin = target.toString(2).padStart(this.n, '0');

    // Asignar pistas sobre bits específicos del objetivo
    for (let bitIdx = 0; bitIdx < this.n; bitIdx++) {
      const val = targetBin[bitIdx];
      const sourceNode = (bitIdx * 3 + 1) % this.N;
      
      this.intelClues.push({
        id: `clue-${bitIdx}`,
        sourceNode,
        bitIndex: bitIdx,
        expectedValue: val,
        discovered: false,
        text: `Qubit q[${this.n - 1 - bitIdx}] de la bóveda maestra está en estado |${val}⟩`,
        type: 'bit_constraint'
      });
    }

    // Pista de paridad o suma
    const ones = targetBin.split('').filter(c => c === '1').length;
    this.intelClues.push({
      id: `clue-parity`,
      sourceNode: (this.N - 2) >= 0 ? (this.N - 2) : 0,
      expectedValue: ones % 2 === 0 ? 'PAR' : 'IMPAR',
      discovered: false,
      text: `La paridad del checksum de dirección de la bóveda es ${ones % 2 === 0 ? 'PAR' : 'IMPAR'} (peso Hamming)`,
      type: 'parity'
    });
  }

  collectClueFromNode(nodeId) {
    const clue = this.intelClues.find(c => c.sourceNode === nodeId && !c.discovered);
    if (clue) {
      clue.discovered = true;
      this.collectedClues.push(clue);
      return clue;
    }
    return null;
  }

  /**
   * Evalúa si un nodo coincide con las pistas del oráculo actualmente descubiertas
   */
  matchesDiscoveredClues(nodeIndex) {
    const bin = nodeIndex.toString(2).padStart(this.n, '0');
    for (const clue of this.collectedClues) {
      if (clue.type === 'bit_constraint') {
        if (bin[clue.bitIndex] !== clue.expectedValue) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Retorna los candidatos actuales según las pistas descubiertas
   */
  getFilteredCandidates() {
    return this.nodes.filter(n => this.matchesDiscoveredClues(n.id)).map(n => n.id);
  }
}
