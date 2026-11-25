/**
 * Stealth Mechanics & ICE AI
 * Maneja el nivel de alerta del cortafuegos IDS corporativo:
 * - Escaneo clásico: Aumenta la alerta linealmente (+15% a +35% por nodo examinado)
 * - Escaneo / Pulso Cuántico (Grover): Mantiene bajo el perfil de intrusión (+4% por pulso)
 * - Trampas Honeypot: Disparan alarmas severas (+30% inmediato)
 * - Contramedidas ICE: Patrullas de despolarización y ruido de decoherencia T1/T2
 */

export class StealthSystem {
  constructor() {
    this.alertLevel = 0; // 0 a 100%
    this.maxAlert = 100;
    this.alarmTriggered = false;
    this.quantumNoise = 0; // Nivel de decoherencia acumulada
    this.stealthRank = 'GHOST'; // GHOST, PHANTOM, SHADOW, DETECTED, COMPROMISED
    this.decoherenceRate = 0.05; // Pérdida de pureza por cada turno retrasado
  }

  reset() {
    this.alertLevel = 0;
    this.alarmTriggered = false;
    this.quantumNoise = 0;
    this.updateRank();
  }

  /**
   * Escaneo clásico: inspección física nodo por nodo O(N)
   */
  classicProbe(node) {
    let penalty = 15;
    if (node.type === 'honeypot') {
      penalty = 35;
    } else if (node.type === 'vault') {
      penalty = 25;
    }

    this.alertLevel = Math.min(100, this.alertLevel + penalty);
    this.checkAlarm();
    this.updateRank();

    return {
      alertDelta: penalty,
      currentAlert: this.alertLevel,
      triggered: this.alarmTriggered
    };
  }

  /**
   * Pulso Cuántico de Grover O(sqrt(N)):
   * La amplificación en superposición uniforme no toca físicamente los servidores individuales.
   * La huella en el IDS es mínima (+3% por iteración G).
   */
  quantumProbePulse() {
    const penalty = 4;
    this.alertLevel = Math.min(100, this.alertLevel + penalty);
    this.quantumNoise = Math.min(1.0, this.quantumNoise + this.decoherenceRate);
    this.checkAlarm();
    this.updateRank();

    return {
      alertDelta: penalty,
      currentAlert: this.alertLevel,
      quantumNoise: this.quantumNoise,
      triggered: this.alarmTriggered
    };
  }

  /**
   * Intento de Extracción (Medición Cuántica)
   */
  quantumMeasurement(isSuccess) {
    if (isSuccess) {
      // Éxito con botín extraído de forma quirúrgica
      this.alertLevel = Math.min(100, this.alertLevel + 10);
    } else {
      // Fallo de medición colapsó en un señuelo o trampa
      this.alertLevel = Math.min(100, this.alertLevel + 40);
    }
    this.checkAlarm();
    this.updateRank();
    return {
      currentAlert: this.alertLevel,
      triggered: this.alarmTriggered
    };
  }

  checkAlarm() {
    if (this.alertLevel >= 100) {
      this.alarmTriggered = true;
    }
  }

  updateRank() {
    if (this.alertLevel >= 100) {
      this.stealthRank = 'COMPROMISED';
    } else if (this.alertLevel >= 75) {
      this.stealthRank = 'DETECTED';
    } else if (this.alertLevel >= 45) {
      this.stealthRank = 'SHADOW';
    } else if (this.alertLevel >= 20) {
      this.stealthRank = 'PHANTOM';
    } else {
      this.stealthRank = 'GHOST';
    }
  }

  getRankBadge() {
    switch (this.stealthRank) {
      case 'GHOST': return { text: 'GHOST (Infiltración Óptima)', color: 'hsl(145, 80%, 50%)' };
      case 'PHANTOM': return { text: 'PHANTOM (Baja Huella)', color: 'hsl(180, 85%, 50%)' };
      case 'SHADOW': return { text: 'SHADOW (Alerta Moderada)', color: 'hsl(45, 95%, 55%)' };
      case 'DETECTED': return { text: 'DETECTED (Peligro ICE Activo)', color: 'hsl(15, 95%, 55%)' };
      case 'COMPROMISED': return { text: 'COMPROMISED (Bloqueo Total)', color: 'hsl(350, 90%, 55%)' };
      default: return { text: this.stealthRank, color: 'hsl(210, 80%, 60%)' };
    }
  }
}
