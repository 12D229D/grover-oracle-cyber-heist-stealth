/**
 * OpenQASM 3.0 / Cirq / Qiskit Circuit Exporter
 * Genera el código cuántico ejecutable del algoritmo de Grover según la topología
 * del nivel actual y el oráculo booleano construido.
 */

export class QasmExporter {
  static generateOpenQASM3(numQubits, targetIndices) {
    const n = numQubits;
    const target = targetIndices[0] || 0;
    const targetBin = target.toString(2).padStart(n, '0');
    const optimalK = Math.max(1, Math.round((Math.PI / 4) * Math.sqrt(Math.pow(2, n) / Math.max(1, targetIndices.length))));

    let qasm = `OPENQASM 3.0;\ninclude "stdgates.inc";\n\n`;
    qasm += `// Algoritmo de Grover: Infiltración Cyber-Heist (${n} qubits, N=${Math.pow(2, n)})\n`;
    qasm += `// Objetivo(s) f(x)=1: [${targetIndices.map(t => `|${t.toString(2).padStart(n, '0')}⟩`).join(', ')}]\n`;
    qasm += `// Iteraciones óptimas k_opt = ${optimalK}\n\n`;
    
    qasm += `qubit[${n}] q;\n`;
    qasm += `bit[${n}] c;\n\n`;

    qasm += `// 1. Inicialización en Superposición Uniforme |s>\n`;
    for (let i = 0; i < n; i++) {
      qasm += `h q[${i}];\n`;
    }
    qasm += `\n`;

    qasm += `// 2. Bucle de Amplificación de Amplitud (G = U_s * U_ω)\n`;
    qasm += `for uint k in [0 : ${optimalK - 1}] {\n`;
    qasm += `    // --- Oráculo de Fase U_ω (Marcado de fase (-1)^f(x)) ---\n`;
    // Invertir bits que en targetBin son '0' con compuertas X
    for (let i = 0; i < n; i++) {
      if (targetBin[n - 1 - i] === '0') {
        qasm += `    x q[${i}];\n`;
      }
    }

    if (n === 2) {
      qasm += `    cz q[0], q[1];\n`;
    } else if (n === 3) {
      qasm += `    h q[${n - 1}];\n`;
      qasm += `    ccx q[0], q[1], q[2];\n`;
      qasm += `    h q[${n - 1}];\n`;
    } else {
      qasm += `    // Multi-Controlled Phase Flip (MCZ sobre n qubits)\n`;
      qasm += `    h q[${n - 1}];\n`;
      qasm += `    mcx q[0:${n - 2}], q[${n - 1}];\n`;
      qasm += `    h q[${n - 1}];\n`;
    }

    for (let i = 0; i < n; i++) {
      if (targetBin[n - 1 - i] === '0') {
        qasm += `    x q[${i}];\n`;
      }
    }

    qasm += `\n    // --- Difusor de Grover U_s = 2|s><s| - I ---\n`;
    for (let i = 0; i < n; i++) {
      qasm += `    h q[${i}];\n`;
      qasm += `    x q[${i}];\n`;
    }

    if (n === 2) {
      qasm += `    cz q[0], q[1];\n`;
    } else if (n === 3) {
      qasm += `    h q[${n - 1}];\n`;
      qasm += `    ccx q[0], q[1], q[2];\n`;
      qasm += `    h q[${n - 1}];\n`;
    } else {
      qasm += `    h q[${n - 1}];\n`;
      qasm += `    mcx q[0:${n - 2}], q[${n - 1}];\n`;
      qasm += `    h q[${n - 1}];\n`;
    }

    for (let i = 0; i < n; i++) {
      qasm += `    x q[${i}];\n`;
      qasm += `    h q[${i}];\n`;
    }
    qasm += `}\n\n`;

    qasm += `// 3. Medición en Base Computacional\n`;
    qasm += `c = measure q;\n`;

    return qasm;
  }

  static generateCirq(numQubits, targetIndices) {
    const n = numQubits;
    const target = targetIndices[0] || 0;
    const targetBin = target.toString(2).padStart(n, '0');
    const optimalK = Math.max(1, Math.round((Math.PI / 4) * Math.sqrt(Math.pow(2, n) / Math.max(1, targetIndices.length))));

    return `"""
Google Cirq - Grover Cyber-Heist Circuit
Target: ${targetBin} | Iterations: ${optimalK}
"""
import cirq

def create_grover_circuit():
    qubits = [cirq.LineQubit(i) for i in range(${n})]
    circuit = cirq.Circuit()

    # 1. Superposición uniforme
    circuit.append(cirq.H.on_each(qubits))

    def oracle():
        sub = []
        for i, bit in enumerate(reversed("${targetBin}")):
            if bit == '0':
                sub.append(cirq.X(qubits[i]))
        # Phase flip multi-controlado
        sub.append(cirq.Z(qubits[-1]).controlled_by(*qubits[:-1]))
        for i, bit in enumerate(reversed("${targetBin}")):
            if bit == '0':
                sub.append(cirq.X(qubits[i]))
        return sub

    def diffuser():
        sub = []
        sub.append(cirq.H.on_each(qubits))
        sub.append(cirq.X.on_each(qubits))
        sub.append(cirq.Z(qubits[-1]).controlled_by(*qubits[:-1]))
        sub.append(cirq.X.on_each(qubits))
        sub.append(cirq.H.on_each(qubits))
        return sub

    # 2. Iteraciones de Grover
    for _ in range(${optimalK}):
        circuit.append(oracle())
        circuit.append(diffuser())

    # 3. Medición
    circuit.append(cirq.measure(*qubits, key='result'))
    return circuit, qubits

if __name__ == '__main__':
    circuit, qubits = create_grover_circuit()
    print("--- Circuito de Grover en Cirq ---")
    print(circuit)
    simulator = cirq.Simulator()
    result = simulator.run(circuit, repetitions=1000)
    print("\\nHistograma de mediciones:")
    print(result.histogram(key='result'))
`;
  }

  static generateQiskit(numQubits, targetIndices) {
    const n = numQubits;
    const target = targetIndices[0] || 0;
    const targetBin = target.toString(2).padStart(n, '0');
    const optimalK = Math.max(1, Math.round((Math.PI / 4) * Math.sqrt(Math.pow(2, n) / Math.max(1, targetIndices.length))));

    return `# Qiskit Grover Search - Cyber Heist Simulation
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
import matplotlib.pyplot as plt

n = ${n}
qc = QuantumCircuit(n, n)

# 1. H^⊗n
qc.h(range(n))

# 2. Iteraciones
for _ in range(${optimalK}):
    # Oracle
    for i, b in enumerate(reversed("${targetBin}")):
        if b == '0':
            qc.x(i)
    qc.h(n - 1)
    qc.mcx(list(range(n - 1)), n - 1)
    qc.h(n - 1)
    for i, b in enumerate(reversed("${targetBin}")):
        if b == '0':
            qc.x(i)

    # Diffuser
    qc.h(range(n))
    qc.x(range(n))
    qc.h(n - 1)
    qc.mcx(list(range(n - 1)), n - 1)
    qc.h(n - 1)
    qc.x(range(n))
    qc.h(range(n))

# 3. Measurement
qc.measure(range(n), range(n))

# Simulación
sim = AerSimulator()
counts = sim.run(qc, shots=2048).result().get_counts()
print("Resultados de simulación:", counts)
`;
  }
}
