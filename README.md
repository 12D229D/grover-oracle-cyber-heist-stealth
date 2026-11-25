# Grover Oracle: Cyber-Heist & Amplitude Amplification Stealth

> **Capa 4: Computación Cuántica Híbrida & Videojuegos Tácticos**  
> **Motor de Algoritmo:** Algoritmo de Búsqueda de Grover (Lov Grover, 1996)  
> **Complejidad:** Cuántica $\mathcal{O}(\sqrt{N})$ vs. Clásica $\mathcal{O}(N)$  
> **Plataformas de Circuito:** OpenQASM 3.0, Google Cirq y Qiskit Aer  

---

## 🎮 Concepto y Lore de Infiltración

En el año 2099, los centros de datos corporativos de la megacorporación *Arasaka-Cyberdyne* están protegidos por sistemas de detección de intrusiones (**IDS**) con contramedidas **ICE** de alta sensibilidad. 

Cualquier operador clásico que intente encontrar una **Bóveda Cifrada Maestra ($f(x) = 1$)** examinando nodo por nodo en una red de $N = 2^n$ servidores necesitará en promedio $N/2$ escaneos ($\mathcal{O}(N)$). Cada escaneo clásico alerta a los cortafuegos y desborda la alarma IDS mucho antes de ubicar el objetivo.

Como intruso cuántico, utilizas un coprocesador cuántico portátil para inicializar una **superposición uniforme**:
$$|s\rangle = H^{\otimes n} |0\rangle^{\otimes n} = \frac{1}{\sqrt{N}} \sum_{x=0}^{N-1} |x\rangle$$

Construyes un **Oráculo de Fase Booleano ($\hat{U}_\omega$)** mediante pistas y restricciones recolectadas en la red, y aplicas el **Operador de Difusión de Grover ($\hat{U}_s$)**:
$$\hat{U}_s = 2|s\rangle\langle s| - I$$

Gracias a la **inversión sobre la media**, la amplitud de probabilidad del servidor objetivo crece con cada pulso cuántico, permitiéndote extraer la clave criptográfica en solo:
$$k_{\text{opt}} \approx \left\lfloor \frac{\pi}{4}\sqrt{\frac{N}{M}} \right\rfloor$$
sin activar la alarma del cortafuegos.

---

## 🧠 El Problema del Soufflé Cuántico (Sobre-Rotación)

El algoritmo de Grover no es un algoritmo monótono: no mejora indefinidamente con más iteraciones. El vector de estado $|\psi_k\rangle$ rota en un círculo unitario en el plano generado por el estado uniforme ortogonal $|\omega_\perp\rangle$ y el estado objetivo $|\omega\rangle$:
$$|\psi_k\rangle = \cos((2k+1)\theta)|\omega_\perp\rangle + \sin((2k+1)\theta)|\omega\rangle$$
donde $\sin(\theta) = \sqrt{M/N}$.

Si el jugador se vuelve codicioso y pulsa el operador de Grover más veces que el óptimo $k_{\text{opt}}$, el vector de estado sobre-rota, superando los $90^\circ$ ($\pi/2$), lo que hace que la probabilidad de éxito caiga drásticamente hacia cero (**Quantum Soufflé Phenomenon**).

---

## 🛠️ Características del Videojuego

1. **Dashboard SPA Interactivo en Canvas 2D:**
   - Topología de servidores procedural con nodos señuelo, honeypots ICE, terminales de pistas y bóvedas maestras.
   - Halos cuánticos y pulsos de coherencia dinámicos.
2. **Osciloscopio de Amplitud Cuántica en Vivo:**
   - Barras de amplitud positiva y negativa (fase invertida por el oráculo).
   - Línea indicadora de la **media aritmética $\mu$** para visualizar la reflexión $2\mu - \alpha_i$.
3. **Dial Geométrico del Espacio de Hilbert:**
   - Visualizador de la rotación del vector de estado en el plano 2D.
4. **Mecánicas de Sigilo Realistas:**
   - El escaneo clásico incrementa severamente el nivel de detección.
   - El pulso cuántico genera una perturbación mínima en el cortafuegos.
5. **Generador y Exportador de Circuitos:**
   - Exporta el código cuántico equivalente listo para ejecutar en:
     - **OpenQASM 3.0**
     - **Google Cirq (Python)**
     - **IBM Qiskit**
6. **Efectos de Audio Procedurales:**
   - Síntesis de sonido con Web Audio API (frecuencias sintetizadas para pulsos cuánticos, escaneos y alarmas).

---

## 🚀 Cómo Jugar

1. Abre `index.html` en cualquier navegador moderno.
2. Selecciona el número de qubits en el selector superior (ej. 4 Qubits = 16 servidores).
3. Puedes hacer clic en un servidor y usar **Sonda Clásica $\mathcal{O}(N)$** para investigar pistas, pero vigilarás que la alarma IDS subirá con cada intento.
4. Haz clic en **PULSO CUÁNTICO (GROVER G)** para aplicar una iteración cuántica. Observa cómo en el osciloscopio la barra del objetivo crece y las de los señuelos decrecen.
5. Cuando alcances el número de iteraciones óptimo $k_{\text{opt}}$, pulsa **MEDICIÓN & EXTRACCIÓN** para capturar la bóveda con alta probabilidad (>95%).
6. Si sobre-rotas, pulsa **REINICIAR A $|s\rangle$** antes de que colapses en un nodo secundario.

---

## 📜 Licencia & Créditos

Desarrollado como parte del monorrepo **Codex** para la Capa 4 de Computación Cuántica.
Diseñado bajo los lineamientos de `DESIGN.md` y `AGENTS.md`.
