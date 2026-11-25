/**
 * Grover Quantum Search Engine
 * Implementación exacta del algoritmo de Grover y Amplificación de Amplitud:
 * - Superposición uniforme: |s> = H^⊗n |0> (amplitud inicial 1/sqrt(N))
 * - Oráculo de Fase Booleano: U_ω |x> = (-1)^f(x) |x>
 * - Operador de Difusión (Inversión sobre la media): U_s = 2|s><s| - I
 * - Estado geométrico 2D: |ψ_k> = cos((2k+1)θ)|ω_perp> + sin((2k+1)θ)|ω>
 * - Detección de Sobre-Rotación (Quantum Soufflé Problem)
 */

export class GroverEngine {
  constructor(qubits = 4) {
    this.setQubits(qubits);
  }

  setQubits(qubits) {
    this.n = Math.max(2, Math.min(6, qubits)); // 4 a 64 estados (2 a 6 qubits)
    this.N = Math.pow(2, this.n);
    this.targets = new Set(); // Índices de servidores objetivo marcados f(x)=1
    this.amplitudes = new Float64Array(this.N);
    this.phases = new Float64Array(this.N); // 0 o Math.PI
    this.iterations = 0;
    this.maxIterations = 15;
    this.history = [];
    this.resetToUniform();
  }

  resetToUniform() {
    const uniformAmp = 1 / Math.sqrt(this.N);
    for (let i = 0; i < this.N; i++) {
      this.amplitudes[i] = uniformAmp;
      this.phases[i] = 0;
    }
    this.iterations = 0;
    this.history = [this.getSnapshot()];
  }

  setTargets(targetIndices) {
    this.targets = new Set(targetIndices.filter(idx => idx >= 0 && idx < this.N));
    this.resetToUniform();
  }

  addTarget(idx) {
    if (idx >= 0 && idx < this.N) {
      this.targets.add(idx);
    }
  }

  removeTarget(idx) {
    this.targets.delete(idx);
  }

  clearTargets() {
    this.targets.clear();
    this.resetToUniform();
  }

  get M() {
    return Math.max(1, this.targets.size);
  }

  get theta() {
    // sin(θ) = sqrt(M/N)
    const sinTheta = Math.sqrt(this.M / this.N);
    return Math.asin(Math.min(1.0, sinTheta));
  }

  get optimalIterations() {
    // k_opt = floor((π / 4) * sqrt(N / M))
    return Math.max(1, Math.round((Math.PI / 4) * Math.sqrt(this.N / this.M)));
  }

  /**
   * Aplica el Oráculo de Fase: U_ω |x> = (-1)^f(x) |x>
   * Para los estados x donde f(x)=1, se invierte el signo de la amplitud.
   */
  applyOracle() {
    for (let idx of this.targets) {
      this.amplitudes[idx] = -this.amplitudes[idx];
      this.phases[idx] = this.amplitudes[idx] < 0 ? Math.PI : 0;
    }
  }

  /**
   * Aplica el Operador de Difusión (Inversión sobre la media):
   * U_s = 2|s><s| - I
   * En componentes: α'_i = 2 * μ - α_i, donde μ = (1/N) * Σ α_x
   */
  applyDiffusion() {
    let sum = 0;
    for (let i = 0; i < this.N; i++) {
      sum += this.amplitudes[i];
    }
    const mean = sum / this.N;

    for (let i = 0; i < this.N; i++) {
      this.amplitudes[i] = 2 * mean - this.amplitudes[i];
      this.phases[i] = this.amplitudes[i] < 0 ? Math.PI : 0;
    }
    this.iterations++;
    this.history.push(this.getSnapshot());
  }

  /**
   * Aplica una iteración completa del paso de Grover: G = U_s * U_ω
   */
  stepGrover() {
    this.applyOracle();
    this.applyDiffusion();
    return this.getEvaluation();
  }

  /**
   * Calcula la probabilidad acumulada de éxito sumando |α_x|^2 para los objetivos
   */
  getTargetSuccessProbability() {
    if (this.targets.size === 0) return 0;
    let prob = 0;
    for (const idx of this.targets) {
      prob += Math.pow(this.amplitudes[idx], 2);
    }
    return Math.min(1.0, Math.max(0, prob));
  }

  /**
   * Retorna el estado geométrico en el plano 2D (|ω_perp>, |ω>)
   * Ángulo actual en el círculo unitario: phi = (2k + 1) * theta
   */
  getGeometricAngle() {
    // El ángulo teórico respecto a |ω_perp> es (2k+1)*θ
    return (2 * this.iterations + 1) * this.theta;
  }

  getMeanAmplitude() {
    let sum = 0;
    for (let i = 0; i < this.N; i++) sum += this.amplitudes[i];
    return sum / this.N;
  }

  /**
   * Evalúa si el estado actual está en el pico óptimo o sufre sobre-rotación
   */
  getEvaluation() {
    const kOpt = this.optimalIterations;
    const currentK = this.iterations;
    const successProb = this.getTargetSuccessProbability();
    const isOptimal = currentK === kOpt;
    const isOverRotated = currentK > kOpt;
    const isUnderRotated = currentK < kOpt;

    let statusText = 'Superposición Uniforme Inicial';
    let statusType = 'normal'; // 'optimal', 'warning', 'danger', 'normal'

    if (currentK === 0) {
      statusText = `Listo: Inicia pulsos cuánticos. Óptimo teórico: ${kOpt} iteraciones`;
      statusType = 'normal';
    } else if (isOptimal) {
      statusText = `🎯 PICO CUÁNTICO MÁXIMO (${(successProb * 100).toFixed(1)}%). ¡Extrae los datos ahora!`;
      statusType = 'optimal';
    } else if (isOverRotated) {
      statusText = `⚠️ SOBRE-ROTACIÓN (Quantum Soufflé). La probabilidad colapsó a ${(successProb * 100).toFixed(1)}%.`;
      statusType = 'danger';
    } else {
      statusText = `Interferencia constructiva en progreso (k=${currentK}/${kOpt}). P(éxito)=${(successProb * 100).toFixed(1)}%`;
      statusType = 'warning';
    }

    return {
      iterations: currentK,
      optimalIterations: kOpt,
      successProbability: successProb,
      isOptimal,
      isOverRotated,
      isUnderRotated,
      statusText,
      statusType,
      meanAmplitude: this.getMeanAmplitude()
    };
  }

  /**
   * Ejecuta una Medición Cuántica (colapso según la regla de Born P(x) = |α_x|^2)
   */
  measure() {
    const rand = Math.random();
    let cumulative = 0;
    let measuredIndex = 0;

    for (let i = 0; i < this.N; i++) {
      cumulative += Math.pow(this.amplitudes[i], 2);
      if (rand <= cumulative) {
        measuredIndex = i;
        break;
      }
    }

    const isHit = this.targets.has(measuredIndex);
    return {
      measuredIndex,
      isHit,
      successProbability: this.getTargetSuccessProbability(),
      iterations: this.iterations,
      optimalIterations: this.optimalIterations
    };
  }

  getSnapshot() {
    return {
      iteration: this.iterations,
      amplitudes: Array.from(this.amplitudes),
      mean: this.getMeanAmplitude(),
      successProb: this.getTargetSuccessProbability()
    };
  }
}
