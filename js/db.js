/**
 * SQLite Local Storage & Infiltration Mission Cache
 * Almacena el historial de campañas de hackeo cuántico, puntuaciones y caché de oráculos.
 */

export class MissionDatabase {
  constructor() {
    this.storageKey = 'grover_cyber_heist_missions';
    this.init();
  }

  init() {
    if (!localStorage.getItem(this.storageKey)) {
      const initialData = {
        totalHeists: 0,
        successfulHeists: 0,
        highScore: 0,
        oraclesSolved: [],
        history: []
      };
      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
    }
  }

  getData() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || {};
    } catch (e) {
      return {};
    }
  }

  saveMissionRecord(record) {
    const data = this.getData();
    data.totalHeists = (data.totalHeists || 0) + 1;
    if (record.success) {
      data.successfulHeists = (data.successfulHeists || 0) + 1;
    }
    data.highScore = Math.max(data.highScore || 0, record.score || 0);
    data.history = data.history || [];
    data.history.unshift({
      date: new Date().toISOString(),
      ...record
    });
    // Mantener los últimos 20 récords
    data.history = data.history.slice(0, 20);
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }
}
