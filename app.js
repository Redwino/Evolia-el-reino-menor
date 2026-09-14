/**
 * EVOLIA: EL REINO MENOR
 * Motor del juego en Vanilla JavaScript (HTML5 + CSS3)
 * Sistema de Cartas Tácticas por Turno + Combate T.E.G. (1v1 a 3v3) + Puntos de Victoria Sin Límite
 */

(function () {
  'use strict';

  // ==========================================
  // 1. SINTETIZADOR DE AUDIO (WEB AUDIO API)
  // ==========================================
  let audioCtx = null;
  let isMuted = false;

  function getAudioContext() {
    try {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
        }
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      return audioCtx;
    } catch {
      return null;
    }
  }

  function playSound(type) {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      if (type === 'tap') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.04);
      } else if (type === 'chit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.06);
      } else if (type === 'dice') {
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            if (isMuted) return;
            const c = getAudioContext();
            if (!c) return;
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(200 + Math.random() * 320, c.currentTime);
            gain.gain.setValueAtTime(0.12, c.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.05);
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start();
            osc.stop(c.currentTime + 0.05);
          }, i * 55);
        }
      } else if (type === 'victory') {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          setTimeout(() => {
            if (isMuted) return;
            const c = getAudioContext();
            if (!c) return;
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, c.currentTime);
            gain.gain.setValueAtTime(0.15, c.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.25);
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start();
            osc.stop(c.currentTime + 0.25);
          }, idx * 80);
        });
      } else if (type === 'defeat') {
        const notes = [440, 392, 349, 293.6];
        notes.forEach((freq, idx) => {
          setTimeout(() => {
            if (isMuted) return;
            const c = getAudioContext();
            if (!c) return;
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, c.currentTime);
            gain.gain.setValueAtTime(0.12, c.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.22);
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start();
            osc.stop(c.currentTime + 0.22);
          }, idx * 90);
        });
      } else if (type === 'card') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.09);
      } else if (type === 'turn') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.16);
      }
    } catch {
      // Ignore audio synthesis errors
    }
  }

  // ==========================================
  // 2. BANCO DE CARTAS TÁCTICAS (EDIFICIOS, INVESTIGACIONES, CONVERSIÓN Y MILITAR)
  // ==========================================
  const TACTICAL_CARD_TEMPLATES = [
    // --- 1. EDIFICIOS A CONSTRUIR (Tablero Físico de Colonia, Límite de Tropas y PV) ---
    {
      id: 'edificio_hongos',
      title: 'Cámara de Hongos Fúngicos',
      category: 'building',
      type: 'building',
      icon: 'yard',
      costAP: 1,
      costMaterial: 3,
      costWater: 2,
      costFood: 0,
      capacity: 2,
      materialValue: 3,
      costDesc: '1 AP + 3 Mat + 2 Agua',
      desc: 'Construye y vincula un vivero miceliar (+1 PV permanente). Alberga máx 2 tropas. Aporta +4 Alimento en cada ciclo.',
      play: (s) => {
        const ch = s.chambers.find(c => c.id === 'hongos');
        if (ch) ch.level = Math.min(ch.maxLevel + 1, ch.level + 1);
        s.resources.alimento = Math.min(s.resources.alimentoMax, s.resources.alimento + 4);
        return 'Vivero miceliar vinculado al nido (+1 PV permanente, +4 Alimento).';
      }
    },
    {
      id: 'edificio_agua',
      title: 'Depósito de Rocío y Humedad',
      category: 'building',
      type: 'building',
      icon: 'water_drop',
      costAP: 1,
      costMaterial: 2,
      costFood: 1,
      costWater: 0,
      capacity: 2,
      materialValue: 3,
      costDesc: '1 AP + 2 Mat + 1 Alim',
      desc: 'Construye y vincula un depósito de humedad (+1 PV permanente). Alberga máx 2 tropas. Capacidad de agua +10 y da +5 Agua.',
      play: (s) => {
        const ch = s.chambers.find(c => c.id === 'agua');
        if (ch) ch.level = Math.min(ch.maxLevel + 1, ch.level + 1);
        s.resources.aguaMax += 10;
        s.resources.agua = Math.min(s.resources.aguaMax, s.resources.agua + 5);
        return 'Depósito de humedad fijado (+1 PV permanente, +10 Capacidad Agua).';
      }
    },
    {
      id: 'edificio_almacen',
      title: 'Almacén de Quitina y Grava',
      category: 'building',
      type: 'building',
      icon: 'inventory_2',
      costAP: 1,
      costMaterial: 4,
      costFood: 0,
      costWater: 0,
      capacity: 3,
      materialValue: 4,
      costDesc: '1 AP + 4 Mat',
      desc: 'Construye y vincula un almacén subterráneo (+1 PV permanente). Alberga máx 3 tropas. Amplía capacidad de materiales en +15.',
      play: (s) => {
        const ch = s.chambers.find(c => c.id === 'almacen');
        if (ch) ch.level = Math.min(ch.maxLevel + 1, ch.level + 1);
        s.resources.materialMax += 15;
        return 'Almacén subterráneo fijado (+1 PV permanente, +15 Capacidad Materiales).';
      }
    },
    {
      id: 'edificio_guarderia',
      title: 'Guardería Real de Capullos',
      category: 'building',
      type: 'building',
      icon: 'egg',
      costAP: 1,
      costMaterial: 3,
      costFood: 2,
      costWater: 1,
      capacity: 3,
      materialValue: 4,
      costDesc: '1 AP + 3 Mat + 2 Alim + 1 Agua',
      desc: 'Construye y vincula una guardería de larvas (+1 PV permanente). Alberga máx 3 tropas. Población máx +5 y eclosionan +2 larvas libres.',
      play: (s) => {
        const ch = s.chambers.find(c => c.id === 'guarderia');
        if (ch) ch.level = Math.min(ch.maxLevel + 1, ch.level + 1);
        s.resources.poblacionMax += 5;
        s.resources.poblacionLibre += 2;
        s.resources.poblacion = Math.min(s.resources.poblacionMax, s.resources.poblacion + 2);
        return 'Guardería de larvas fijada (+1 PV permanente, +2 larvas libres).';
      }
    },
    {
      id: 'edificio_reina',
      title: 'Fortificación Cámara de la Reina',
      category: 'building',
      type: 'building',
      icon: 'health_and_safety',
      costAP: 1,
      costMaterial: 4,
      costFood: 3,
      costWater: 2,
      capacity: 4,
      materialValue: 5,
      costDesc: '1 AP + 4 Mat + 3 Alim + 2 Agua',
      desc: 'Amplía y blinda la cámara central (+1 PV permanente). Alberga máx 4 tropas. Fertilidad real (+3 obreras libres).',
      play: (s) => {
        const ch = s.chambers.find(c => c.id === 'reina');
        if (ch) ch.level = Math.min(ch.maxLevel + 1, ch.level + 1);
        s.resources.poblacionLibre += 3;
        s.resources.poblacion = Math.min(s.resources.poblacionMax, s.resources.poblacion + 3);
        return 'Cámara real blindada (+1 PV permanente, +3 obreras libres).';
      }
    },
    {
      id: 'edificio_fortaleza',
      title: 'Fortaleza Subterránea de Arcilla',
      category: 'building',
      type: 'building',
      icon: 'castle',
      costAP: 1,
      costMaterial: 5,
      costWater: 2,
      costFood: 0,
      capacity: 5,
      materialValue: 5,
      costDesc: '1 AP + 5 Mat + 2 Agua',
      desc: 'Bastión defensivo masivo (+2 PV directos). Alberga máx 5 tropas (nodo clave de defensa y tránsito). Sube +35% control territorial.',
      play: (s) => {
        const sec = s.sectors.find(x => x.id === 'nido') || s.sectors[0];
        sec.control = Math.min(100, (sec.control || 0) + 35);
        if (!sec.upgrades) sec.upgrades = [];
        if (!sec.upgrades.includes('Bastión de Arcilla')) sec.upgrades.push('Bastión de Arcilla');
        return 'Fortaleza de arcilla fijada y vinculada (+2 PV directos, +35% control territorial).';
      }
    },
    {
      id: 'edificio_puesto_guardia',
      title: 'Puesto de Guardia Avanzado',
      category: 'building',
      type: 'building',
      icon: 'security',
      costAP: 1,
      costMaterial: 3,
      costFood: 1,
      costWater: 0,
      capacity: 4,
      materialValue: 3,
      costDesc: '1 AP + 3 Mat + 1 Alim',
      desc: 'Puesto centinela subterráneo (+1 PV permanente). Alberga máx 4 tropas. Nodo de tránsito rápido para despliegue.',
      play: (s) => {
        return 'Puesto de centinelas subterráneo fijado (+1 PV permanente, 4 tropas de albergue).';
      }
    },
    {
      id: 'edificio_laboratorio',
      title: 'Laboratorio de Feromonas',
      category: 'building',
      type: 'building',
      icon: 'science',
      costAP: 1,
      costMaterial: 3,
      costFood: 1,
      costWater: 1,
      capacity: 2,
      materialValue: 3,
      costDesc: '1 AP + 3 Mat + 1 Alim + 1 Agua',
      desc: 'Sintetizador químico subterráneo (+1 PV permanente). Alberga máx 2 tropas. Otorga +2 ADN de inmediato.',
      play: (s) => {
        s.resources.adn += 2;
        return 'Laboratorio fijado y vinculado (+1 PV permanente, +2 ADN sintetizados).';
      }
    },

    // --- 2. INVESTIGACIONES GENÓMICAS (Árbol Genético - Únicas y No Acumulables) ---
    {
      id: 'inv_mandibulas',
      mutationId: 'mandibulas',
      title: 'Investigación: Mandíbulas Serradas',
      category: 'research',
      type: 'research',
      icon: 'hardware',
      costAP: 1,
      costMaterial: 3,
      costADN: 2,
      costFood: 0,
      costWater: 0,
      materialValue: 3,
      costDesc: '1 AP + 3 Mat + 2 ADN',
      desc: 'Investiga la mutación mandibular (+1 PV permanente). Bono único: +2 Fuerza de Choque en tiradas de combate T.E.G. (No acumulable).',
      play: (s) => {
        const m = s.mutations.find(x => x.id === 'mandibulas');
        if (m) m.unlocked = true;
        return 'Mandíbulas Serradas asimiladas (+1 PV permanente, +2 Fuerza en combate T.E.G.).';
      }
    },
    {
      id: 'inv_quitina',
      mutationId: 'quitina',
      title: 'Investigación: Exoesqueleto Reforzado',
      category: 'research',
      type: 'research',
      icon: 'shield',
      costAP: 1,
      costMaterial: 3,
      costADN: 2,
      costFood: 0,
      costWater: 0,
      materialValue: 3,
      costDesc: '1 AP + 3 Mat + 2 ADN',
      desc: 'Investiga corazas de quitina espesa (+1 PV permanente). Bono único: +2 Resistencia y reduce bajas en choques T.E.G. (No acumulable).',
      play: (s) => {
        const m = s.mutations.find(x => x.id === 'quitina');
        if (m) m.unlocked = true;
        return 'Exoesqueleto Reforzado asimilado (+1 PV permanente, blindaje biológico).';
      }
    },
    {
      id: 'inv_acido',
      mutationId: 'acido',
      title: 'Investigación: Glándulas de Ácido',
      category: 'research',
      type: 'research',
      icon: 'colorize',
      costAP: 1,
      costMaterial: 4,
      costADN: 2,
      costFood: 0,
      costWater: 0,
      materialValue: 4,
      costDesc: '1 AP + 4 Mat + 2 ADN',
      desc: 'Investiga proyectiles cáusticos (+1 PV permanente). Bono único: Habilita ataques químicos y neutraliza fortificaciones (No acumulable).',
      play: (s) => {
        const m = s.mutations.find(x => x.id === 'acido');
        if (m) m.unlocked = true;
        return 'Glándulas de Ácido asimiladas (+1 PV permanente, bio-química cáustica).';
      }
    },
    {
      id: 'inv_trofalaxis',
      mutationId: 'trofalaxis',
      title: 'Investigación: Trofalaxis Digestiva',
      category: 'research',
      type: 'research',
      icon: 'sync_alt',
      costAP: 1,
      costMaterial: 3,
      costADN: 2,
      costFood: 0,
      costWater: 0,
      materialValue: 3,
      costDesc: '1 AP + 3 Mat + 2 ADN',
      desc: 'Investiga digestión compartida eficiente (+1 PV permanente). Bono único: Reduce 25% el consumo de recursos en la colonia (No acumulable).',
      play: (s) => {
        const m = s.mutations.find(x => x.id === 'trofalaxis');
        if (m) m.unlocked = true;
        return 'Trofalaxis Digestiva asimilada (+1 PV permanente, -25% consumo).';
      }
    },
    {
      id: 'inv_antenas',
      mutationId: 'antenas',
      title: 'Investigación: Antenas Químicas',
      category: 'research',
      type: 'research',
      icon: 'sensors',
      costAP: 1,
      costMaterial: 3,
      costADN: 3,
      costFood: 0,
      costWater: 0,
      materialValue: 3,
      costDesc: '1 AP + 3 Mat + 3 ADN',
      desc: 'Investiga quimiorrecepción avanzada (+1 PV permanente). Bono único: Alerta temprana contra incursiones y eleva defensa (No acumulable).',
      play: (s) => {
        const m = s.mutations.find(x => x.id === 'antenas');
        if (m) m.unlocked = true;
        return 'Antenas Químicas asimiladas (+1 PV permanente, alerta temprana).';
      }
    },
    {
      id: 'inv_alas',
      mutationId: 'alas',
      title: 'Investigación: Casta Alada Exploradora',
      category: 'research',
      type: 'research',
      icon: 'air',
      costAP: 1,
      costMaterial: 3,
      costADN: 2,
      costFood: 0,
      costWater: 0,
      materialValue: 3,
      costDesc: '1 AP + 3 Mat + 2 ADN',
      desc: 'Investiga morfología alada (+1 PV permanente). Bono único: Roba inmediatamente 2 cartas del mazo a tu mano (No acumulable).',
      play: (s) => {
        const m = s.mutations.find(x => x.id === 'alas');
        if (m) m.unlocked = true;
        drawTacticalCard(false);
        drawTacticalCard(false);
        return 'Casta Alada asimilada (+1 PV permanente, +2 cartas robadas de inmediato).';
      }
    },

    // --- 3. CONVERSIÓN A RECURSOS (Economía y Transmutación) ---
    {
      id: 'conv_aserradero',
      title: 'Aserradero de Celulosa',
      category: 'conversion',
      type: 'conversion',
      icon: 'forest',
      costAP: 1,
      costFood: 2,
      costMaterial: 0,
      materialValue: 4,
      costDesc: '1 AP + 2 Alimento',
      desc: 'Procesa fibras vegetales: Convierte 2 unidades de Alimento en +8 Materiales inmediatos para el nido.',
      play: (s) => {
        s.resources.material = Math.min(s.resources.materialMax, s.resources.material + 8);
        return 'Fibras transformadas: +8 Materiales incorporados al nido.';
      }
    },
    {
      id: 'conv_cosecha',
      title: 'Cosecha de Savia y Melaza',
      category: 'conversion',
      type: 'conversion',
      icon: 'eco',
      costAP: 1,
      costMaterial: 0,
      materialValue: 3,
      costDesc: '1 AP',
      desc: 'Forrajeo masivo en el estrato herbáceo: Otorga +8 Alimento y +6 Agua de inmediato.',
      play: (s) => {
        s.resources.alimento = Math.min(s.resources.alimentoMax, s.resources.alimento + 8);
        s.resources.agua = Math.min(s.resources.aguaMax, s.resources.agua + 6);
        return 'Cosecha abundante: +8 Alimento y +6 Agua almacenados.';
      }
    },
    {
      id: 'conv_manantial',
      title: 'Extracción de Manantial Profundo',
      category: 'conversion',
      type: 'conversion',
      icon: 'water_drop',
      costAP: 1,
      costMaterial: 1,
      materialValue: 3,
      costDesc: '1 AP + 1 Mat',
      desc: 'Excava vetas acuíferas subterráneas: Otorga +12 Agua y amplía la reserva máxima en +5.',
      play: (s) => {
        s.resources.aguaMax += 5;
        s.resources.agua = Math.min(s.resources.aguaMax, s.resources.agua + 12);
        return 'Manantial brotando: +12 Agua y +5 Capacidad máxima de agua.';
      }
    },
    {
      id: 'conv_sintesis',
      title: 'Síntesis Metabólica de ADN',
      category: 'conversion',
      type: 'conversion',
      icon: 'biotech',
      costAP: 1,
      costFood: 4,
      costMaterial: 0,
      materialValue: 3,
      costDesc: '1 AP + 4 Alimento',
      desc: 'Metabolismo proteico de alta densidad: Transmuta 4 de Alimento en +5 ADN evolutivo.',
      play: (s) => {
        s.resources.adn += 5;
        return 'Transmutación celular: +5 ADN evolutivo sintetizado.';
      }
    },
    {
      id: 'conv_refineria',
      title: 'Refinería de Grava y Quitina',
      category: 'conversion',
      type: 'conversion',
      icon: 'grain',
      costAP: 1,
      costWater: 2,
      costMaterial: 0,
      materialValue: 4,
      costDesc: '1 AP + 2 Agua',
      desc: 'Lavado y purificación de minerales: Otorga +7 Materiales de construcción y +2 ADN.',
      play: (s) => {
        s.resources.material = Math.min(s.resources.materialMax, s.resources.material + 7);
        s.resources.adn += 2;
        return 'Refinación mineral: +7 Materiales y +2 ADN obtenidos.';
      }
    },
    {
      id: 'conv_trofalaxis',
      title: 'Trofalaxis de Enjambre',
      category: 'conversion',
      type: 'conversion',
      icon: 'swap_horiz',
      costAP: 1,
      costMaterial: 0,
      materialValue: 3,
      costDesc: '1 AP',
      desc: 'Redistribución celular óptima: Otorga +5 Alimento, +5 Agua y repone el sustento gastado.',
      play: (s) => {
        s.resources.alimento = Math.min(s.resources.alimentoMax, s.resources.alimento + 5);
        s.resources.agua = Math.min(s.resources.aguaMax, s.resources.agua + 5);
        return 'Trofalaxis colectiva: +5 Alimento y +5 Agua distribuidos en el nido.';
      }
    },

    // --- 4. FUERZAS MILITARES Y TÁCTICA DE TERRENO ---
    {
      id: 'mil_falange',
      title: 'Reclutamiento: Falange Quitina',
      category: 'military',
      type: 'military',
      icon: 'military_tech',
      costAP: 1,
      costMaterial: 3,
      costFood: 2,
      materialValue: 3,
      costDesc: '1 AP + 3 Mat + 2 Alim',
      desc: 'Despliega +2 Tropas en el sector territorial seleccionado y eleva su control territorial en +25%.',
      play: (s) => {
        const sec = s.sectors.find(x => x.id === s.selectedSectorId) || s.sectors[0];
        sec.squads = (sec.squads || 0) + 2;
        sec.control = Math.min(100, (sec.control || 0) + 25);
        return `+2 Tropas desplegadas en "${sec.name}" (Control: ${sec.control}%).`;
      }
    },
    {
      id: 'mil_trinchera',
      title: 'Zanja de Ácido Fórmico',
      category: 'military',
      type: 'military',
      icon: 'security',
      costAP: 1,
      costMaterial: 3,
      materialValue: 3,
      costDesc: '1 AP + 3 Mat',
      desc: 'Fortificación defensiva: El sector seleccionado gana +30% Control y la mejora permanente "Zanja Ácida".',
      play: (s) => {
        const sec = s.sectors.find(x => x.id === s.selectedSectorId) || s.sectors[0];
        sec.control = Math.min(100, (sec.control || 0) + 30);
        if (!sec.upgrades) sec.upgrades = [];
        if (!sec.upgrades.includes('Zanja Ácida')) sec.upgrades.push('Zanja Ácida');
        return `Sector "${sec.name}" fortificado con Zanja Ácida (+30% control territorial).`;
      }
    },
    {
      id: 'mil_emboscada',
      title: 'Emboscada de Mandíbulas',
      category: 'military',
      type: 'military',
      icon: 'sports_mma',
      costAP: 1,
      costMaterial: 3,
      materialValue: 3,
      costDesc: '1 AP + 3 Mat',
      desc: 'Acometida sorpresiva contra rivales: Otorga +1 Victoria Militar directa (+1 PV) y captura +5 Materiales.',
      play: (s) => {
        s.militaryVictories = (s.militaryVictories || 0) + 1;
        s.resources.material = Math.min(s.resources.materialMax, s.resources.material + 5);
        return '¡Emboscada exitosa! +1 Victoria Militar (+1 PV) y +5 Materiales capturados.';
      }
    },
    {
      id: 'mil_marcha',
      title: 'Marcha de Vanguardia',
      category: 'military',
      type: 'military',
      icon: 'alt_route',
      costAP: 1,
      costMaterial: 2,
      materialValue: 2,
      costDesc: '1 AP + 2 Mat',
      desc: 'Maniobra de avance territorial: Todos los sectores con tropas apostadas ganan +15% de control.',
      play: (s) => {
        s.sectors.forEach(sec => {
          if ((sec.squads || 0) > 0) sec.control = Math.min(100, (sec.control || 0) + 15);
        });
        return 'Líneas de avance reforzadas: +15% control en todos los sectores con tropas.';
      }
    }
  ];

  function createShuffledDeck() {
    const deck = [];
    // Cada carta tiene 2 copias para un mazo dinámico de 20 cartas
    TACTICAL_CARD_TEMPLATES.forEach(tpl => {
      deck.push({ ...tpl, uid: `${tpl.id}_1_${Math.random()}` });
      deck.push({ ...tpl, uid: `${tpl.id}_2_${Math.random()}` });
    });
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  // ==========================================
  // 3. ESTADO DEL JUEGO
  // ==========================================
  const SEASONS = ['Primavera', 'Verano', 'Otoño', 'Invierno'];

  const defaultState = {
    turn: 1,
    round: 1,
    year: 1,
    seasonIndex: 0,
    actionPoints: 3,
    maxActionPoints: 3,
    militaryVictories: 0,
    resources: {
      alimento: 16,
      alimentoMax: 50,
      agua: 12,
      aguaMax: 40,
      material: 14,
      materialMax: 50,
      poblacion: 18,
      poblacionMax: 30,
      poblacionLibre: 4,
      adn: 6,
      puntosVictoria: 0
    },
    castes: {
      obreras: { name: 'Obreras', count: 8, costFood: 2, costMat: 1, role: 'Cosecha y excavación' },
      soldados: { name: 'Soldados Mayores', count: 4, costFood: 3, costMat: 2, role: 'Combate frontal (+2 Ataque)' },
      artilleras: { name: 'Artilleras de Ácido', count: 2, costFood: 4, costMat: 2, role: 'Ataque químico a distancia' },
      exploradoras: { name: 'Exploradoras Aladas', count: 2, costFood: 2, costMat: 1, role: 'Reconocimiento y velocidad' }
    },
    chambers: [
      { id: 'reina', name: 'Cámara Real de la Reina', stratum: 'Profundo', desc: 'Postura continua de larvas. Vital para el enjambre.', level: 1, maxLevel: 3 },
      { id: 'hongos', name: 'Jardines de Hongos Fúngicos', stratum: 'Medio', desc: 'Convierte hojas y celulosa en alimento puro.', level: 1, maxLevel: 3 },
      { id: 'agua', name: 'Depósitos de Rocío y Humedad', stratum: 'Medio', desc: 'Almacenamiento de gotas vitales.', level: 1, maxLevel: 3 },
      { id: 'almacen', name: 'Almacén de Quitina y Grava', stratum: 'Superior', desc: 'Guarda materiales para expandir defensas.', level: 1, maxLevel: 3 },
      { id: 'guarderia', name: 'Guardería de Capullos', stratum: 'Profundo', desc: 'Protege a las futuras castas durante el invierno.', level: 1, maxLevel: 3 }
    ],
    mutations: [
      { id: 'mandibulas', name: 'Mandíbulas Serradas', cost: 4, unlocked: false, effect: '+2 Fuerza de Ataque en choques T.E.G.' },
      { id: 'quitina', name: 'Exoesqueleto Reforzado', cost: 4, unlocked: false, effect: '+2 Resistencia y menor baja en repliegues' },
      { id: 'acido', name: 'Glándulas de Ácido Fórmico', cost: 5, unlocked: false, effect: 'Permite disparos cáusticos en combate' },
      { id: 'trofalaxis', name: 'Trofalaxis Eficiente', cost: 5, unlocked: false, effect: 'Reduce 25% el consumo de alimento en Invierno' },
      { id: 'antenas', name: 'Antenas Quimiosensoriales', cost: 6, unlocked: false, effect: 'Detecta incursiones hostiles con anticipación' }
    ],
    sectors: [
      {
        id: 'nido',
        name: 'Hormiguero Central (Capital)',
        type: 'capital',
        icon: 'home',
        control: 100,
        squads: 5,
        yield: '+4 Alimento, +2 Material / ciclo',
        upgrades: ['Cámaras Excavadas', 'Pared de Arcilla'],
        desc: 'Sede subterránea del nido real, almacén central y corazón protector de la Reina.'
      },
      {
        id: 'pulgones',
        name: 'Pasto Fértil de Pulgones',
        type: 'resource',
        icon: 'bug_report',
        control: 60,
        squads: 3,
        yield: '+3 Alimento (Melaza dulce) / ciclo',
        upgrades: ['Ruta de Trofalaxis'],
        desc: 'Hierbas altas pobladas de pulgones ordeñados metódicamente para extraer néctar.'
      },
      {
        id: 'raiz',
        name: 'Estrato de Raíz Podrida',
        type: 'resource',
        icon: 'forest',
        control: 45,
        squads: 2,
        yield: '+3 Material, +1 ADN / ciclo',
        upgrades: [],
        desc: 'Corteza húmeda y porosa rica en celulosa pura, líquenes y esporas mutagénicas.'
      },
      {
        id: 'manantial',
        name: 'Manantial de Rocas Húmedas',
        type: 'resource',
        icon: 'water_drop',
        control: 30,
        squads: 1,
        yield: '+4 Agua fresca / ciclo',
        upgrades: [],
        desc: 'Condensación constante de rocío entre piedras y guijarros de superficie.'
      },
      {
        id: 'perimetro',
        name: 'Perímetro Táctico de Hojarasca',
        type: 'military',
        icon: 'shield',
        control: 40,
        squads: 3,
        yield: '+1 Seguridad Fronteriza',
        upgrades: ['Zanja Quitinosa'],
        desc: 'Línea fortificada de patrulla contra incursiones de colonias hostiles.'
      },
      {
        id: 'carcasa',
        name: 'Reliquia de Escarabajo Titán',
        type: 'rare',
        icon: 'biotech',
        control: 15,
        squads: 0,
        yield: '+3 ADN / ciclo',
        upgrades: [],
        desc: 'Coraza milenaria fosilizada repleta de proteínas complejas y péptidos raros.'
      }
    ],
    selectedSectorId: 'nido',
    deck: [],
    hand: [],
    discard: [],
    activePlayerId: 'player',
    turnTimeRemaining: 90,
    rivals: [
      {
        id: 'carmesi',
        name: 'Enjambre Carmesí',
        species: 'Formica rufa',
        color: '#ef4444',
        avatar: 'pest_control',
        pv: 0,
        actionPoints: 3,
        maxActionPoints: 3,
        hasTroops: true,
        troopsCount: 5,
        populationTotal: 22,
        chambersCount: 4,
        militaryVictories: 2,
        resources: {
          alimento: 24,
          agua: 18,
          material: 20,
          adn: 6
        },
        lastAction: 'Construyendo galería de almacenamiento...'
      },
      {
        id: 'mandibulas',
        name: 'Mandíbulas Negras',
        species: 'Camponotus vagus',
        color: '#38bdf8',
        avatar: 'shield',
        pv: 0,
        actionPoints: 3,
        maxActionPoints: 3,
        hasTroops: false,
        troopsCount: 0,
        populationTotal: 19,
        chambersCount: 5,
        militaryVictories: 1,
        resources: {
          alimento: 28,
          agua: 22,
          material: 16,
          adn: 5
        },
        lastAction: 'Almacenando reservas en nido...'
      },
      {
        id: 'dorada',
        name: 'Solenopsis Dorada',
        species: 'Solenopsis invicta',
        color: '#f59e0b',
        avatar: 'flare',
        pv: 0,
        actionPoints: 3,
        maxActionPoints: 3,
        hasTroops: true,
        troopsCount: 4,
        populationTotal: 20,
        chambersCount: 3,
        militaryVictories: 1,
        resources: {
          alimento: 20,
          agua: 15,
          material: 18,
          adn: 4
        },
        lastAction: 'Reclutando patrullas de superficie...'
      }
    ],
    logs: [
      { text: 'Inicio de la colonia en Primavera del Año 1. Sistema de cartas y combate T.E.G. listos.', time: '00:00' }
    ]
  };

  // Inicializar estado
  let state = JSON.parse(JSON.stringify(defaultState));
  try {
    const saved = localStorage.getItem('evolia_save_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      state = Object.assign({}, defaultState, parsed);
      if (!state.sectors || state.sectors.length === 0) {
        state.sectors = JSON.parse(JSON.stringify(defaultState.sectors));
      }
      if (!state.rivals || state.rivals.length === 0) {
        state.rivals = JSON.parse(JSON.stringify(defaultState.rivals));
      }
    }
  } catch (e) {
    console.warn('No se pudo cargar estado previo:', e);
  }

  // Inicializar mazo y mano si están vacíos
  if (!state.deck || state.deck.length === 0) {
    state.deck = createShuffledDeck();
  }
  if (!state.hand) {
    state.hand = [];
  }
  if (!state.discard) {
    state.discard = [];
  }
  // Repartir 3 cartas iniciales a la mano si está vacía
  if (state.hand.length === 0) {
    for (let i = 0; i < 3; i++) {
      if (state.deck.length > 0) {
        state.hand.push(state.deck.pop());
      }
    }
  }

  function saveState() {
    try {
      localStorage.setItem('evolia_save_state', JSON.stringify(state));
    } catch {}
  }

  function log(msg) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    state.logs.unshift({ text: msg, time });
    if (state.logs.length > 50) state.logs.pop();
    renderLogs();
    saveState();
  }

  function toast(title, msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<strong>${title}</strong><div style="font-size:0.75rem;margin-top:2px;color:#d1c2ba;">${msg}</div>`;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(100%)';
      el.style.transition = 'all 0.3s ease';
      setTimeout(() => el.remove(), 300);
    }, 3500);
  }

  function consumeAP(cost = 1) {
    if (!isPlayerTurn()) {
      const activeP = getActivePlayer();
      toast('Turno del Rival', `Es el turno de ${activeP.name}. Espera tu turno para realizar acciones.`, 'warning');
      return false;
    }
    if (state.actionPoints < cost) {
      toast('Sin AP Suficientes', `Esta acción requiere ${cost} Punto de Acción. Pasa el turno para recargar.`, 'warning');
      return false;
    }
    state.actionPoints -= cost;
    playSound('tap');
    renderHeader();
    saveState();
    return true;
  }

  // ==========================================
  // 4. CÁLCULO DE PUNTOS DE VICTORIA (SIN LÍMITE)
  // ==========================================
  // Regla según usuario:
  // - No hay límite de PV.
  // - Edificaciones construidas (cámaras excavadas y sus niveles acumulados) + mutaciones genómicas.
  // - Recursos que sobran: +1 PV cada 10 unidades de recursos totales acumulados (Alimento + Agua + Material + ADN).
  // - Unidades vivas: +1 PV cada 15 unidades vivas de población.
  // - Victorias tácticas militares acumuladas (+1 PV por victoria).
  function calcPlayerPVDetails() {
    ensureColonyBuildings();
    const colonyBuildingsPV = (state.colonyBuildings || []).reduce((acc, b) => acc + (b.pv || 1), 0);
    const chamberPV = (state.chambers || []).reduce((acc, c) => acc + (c.level || 1), 0);
    const mutationPV = (state.mutations || []).filter(m => m.unlocked).length;
    const edificacionesPV = colonyBuildingsPV + chamberPV + mutationPV;

    const resTotal = (state.resources.alimento || 0) +
                     (state.resources.agua || 0) +
                     (state.resources.material || 0) +
                     (state.resources.adn || 0);
    const recursosPV = Math.floor(resTotal / 10);

    const poblacionTotal = state.resources.poblacion || 0;
    const unidadesPV = Math.floor(poblacionTotal / 15);

    const militaresPV = state.militaryVictories || 0;

    const totalPV = edificacionesPV + recursosPV + unidadesPV + militaresPV;
    return {
      edificacionesPV,
      colonyBuildingsPV,
      chamberPV,
      mutationPV,
      recursosPV,
      unidadesPV,
      militaresPV,
      resTotal,
      poblacionTotal,
      totalPV
    };
  }

  function calcRivalPV(rival) {
    const resTotal = (rival.resources.alimento || 0) +
                     (rival.resources.agua || 0) +
                     (rival.resources.material || 0) +
                     (rival.resources.adn || 0);
    const recursosPV = Math.floor(resTotal / 10);
    const unidadesPV = Math.floor((rival.populationTotal || 15) / 15);
    const edificacionesPV = (rival.chambersCount || 3) + 1;
    const militaresPV = rival.militaryVictories || 0;
    return edificacionesPV + recursosPV + unidadesPV + militaresPV;
  }

  function updateAllPV() {
    const playerDetails = calcPlayerPVDetails();
    state.resources.puntosVictoria = playerDetails.totalPV;

    (state.rivals || []).forEach(r => {
      r.pv = calcRivalPV(r);
    });

    // Actualizar modal de desglose
    const elChambers = document.getElementById('pv-breakdown-chambers');
    const elMutations = document.getElementById('pv-breakdown-mutations');
    const elResources = document.getElementById('pv-breakdown-resources');
    const elPop = document.getElementById('pv-breakdown-population');
    const elMil = document.getElementById('pv-breakdown-military');
    const elTotal = document.getElementById('pv-breakdown-total');

    if (elChambers) elChambers.textContent = `+${playerDetails.chamberPV} PV`;
    if (elMutations) elMutations.textContent = `+${playerDetails.mutationPV} PV`;
    if (elResources) elResources.textContent = `+${playerDetails.recursosPV} PV (${playerDetails.resTotal} res)`;
    if (elPop) elPop.textContent = `+${playerDetails.unidadesPV} PV (${playerDetails.poblacionTotal} hab)`;
    if (elMil) elMil.textContent = `+${playerDetails.militaresPV} PV`;
    if (elTotal) elTotal.textContent = `${playerDetails.totalPV} PV Totales`;
  }

  // ==========================================
  // 5. SISTEMA DE CARTAS TÁCTICAS (MANO, CANJE Y LÍMITES ESTACIONALES)
  // ==========================================
  function getHandLimitAtTurnEnd() {
    const isAutumn = SEASONS[state.seasonIndex] === 'Otoño';
    return isAutumn ? 7 : 5;
  }

  function drawTacticalCard(notify = true) {
    // Si el mazo se agotó, barajar la pila de descarte
    if (state.deck.length === 0) {
      if (state.discard.length > 0) {
        state.deck = [...state.discard];
        state.discard = [];
        for (let i = state.deck.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [state.deck[i], state.deck[j]] = [state.deck[j], state.deck[i]];
        }
        log('Mazo de cartas barajado nuevamente desde la pila de descarte.');
      } else {
        state.deck = createShuffledDeck();
      }
    }

    if (state.deck.length === 0) {
      if (notify) toast('Mazo Vacío', 'No hay más cartas en el mazo ni en el descarte.', 'warning');
      return false;
    }

    const drawn = state.deck.pop();
    state.hand.push(drawn);
    playSound('card');
    if (notify) {
      toast('Carta Robada', `Has robado: "${drawn.title}".`, 'primary');
      log(`Robo de carta: "${drawn.title}".`);
    }

    renderTacticalHand();
    saveState();
    return true;
  }

  // ==========================================
  // 5. SISTEMA DE COLONIA FÍSICA Y TRÁNSITO DE TROPAS
  // ==========================================
  const COLONY_GRID_COLS = 5;
  const COLONY_GRID_ROWS = 5;

  function ensureColonyBuildings() {
    if (!state.colonyBuildings || state.colonyBuildings.length === 0) {
      state.colonyBuildings = [
        {
          instanceId: 'b_reina_init',
          tplId: 'edificio_reina',
          name: 'Cámara Real de la Reina',
          icon: 'health_and_safety',
          x: 2,
          y: 2,
          capacity: 4,
          stationedTroops: 2,
          level: 1,
          pv: 1,
          isCapital: true,
          desc: 'Corazón del hormiguero. Eclosión y coordinación central de la colonia.'
        },
        {
          instanceId: 'b_hongos_init',
          tplId: 'edificio_hongos',
          name: 'Jardín de Hongos Fúngicos',
          icon: 'yard',
          x: 2,
          y: 1,
          capacity: 2,
          stationedTroops: 1,
          level: 1,
          pv: 1,
          desc: 'Genera +4 Alimento por ciclo. Vivero miceliar profundo.'
        },
        {
          instanceId: 'b_agua_init',
          tplId: 'edificio_agua',
          name: 'Depósito de Rocío y Humedad',
          icon: 'water_drop',
          x: 2,
          y: 3,
          capacity: 2,
          stationedTroops: 1,
          level: 1,
          pv: 1,
          desc: 'Condensación y reserva de agua. Hidrata las larvas.'
        }
      ];
    }

    const requiredMutations = [
      { id: 'mandibulas', name: 'Mandíbulas Serradas', cost: 4, unlocked: false, effect: '+2 Fuerza de Ataque en choques T.E.G.' },
      { id: 'quitina', name: 'Exoesqueleto Reforzado', cost: 4, unlocked: false, effect: '+2 Resistencia y menor baja en repliegues' },
      { id: 'acido', name: 'Glándulas de Ácido Fórmico', cost: 5, unlocked: false, effect: 'Permite disparos cáusticos en combate y neutraliza fortificaciones' },
      { id: 'trofalaxis', name: 'Trofalaxis Digestiva', cost: 5, unlocked: false, effect: 'Reduce 25% el consumo de recursos de la colonia' },
      { id: 'antenas', name: 'Antenas Quimiosensoriales', cost: 6, unlocked: false, effect: 'Detecta incursiones hostiles y alerta temprana de emboscadas' },
      { id: 'alas', name: 'Casta Alada Exploradora', cost: 5, unlocked: false, effect: 'Reconocimiento aéreo veloz y +2 cartas robadas de inmediato' }
    ];
    if (!state.mutations) state.mutations = [];
    requiredMutations.forEach(rm => {
      const existing = state.mutations.find(m => m.id === rm.id);
      if (!existing) {
        state.mutations.push(rm);
      }
    });
  }

  function getBuildingAt(x, y) {
    return (state.colonyBuildings || []).find(b => b.x === x && b.y === y);
  }

  function isAdjacentToExistingBuilding(x, y) {
    if (!state.colonyBuildings || state.colonyBuildings.length === 0) return true;
    return state.colonyBuildings.some(b => {
      const dx = Math.abs(b.x - x);
      const dy = Math.abs(b.y - y);
      return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    });
  }

  function getConnectedAdjacentBuildings(b) {
    if (!b) return [];
    return (state.colonyBuildings || []).filter(other => {
      if (other.instanceId === b.instanceId) return false;
      const dx = Math.abs(other.x - b.x);
      const dy = Math.abs(other.y - b.y);
      return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    });
  }

  function switchToScreen(target) {
    document.querySelectorAll('.nav-item').forEach(n => {
      if (n.getAttribute('data-screen') === target) n.classList.add('active');
      else n.classList.remove('active');
    });
    document.querySelectorAll('.view-screen').forEach(scr => scr.classList.remove('active'));
    const activeScr = document.getElementById(`screen-${target}`);
    if (activeScr) activeScr.classList.add('active');
    document.getElementById('app-sidebar').classList.remove('open');
  }

  function startBuildingPlacement(card) {
    if (!isPlayerTurn()) {
      toast('Turno del Rival', 'Solo puedes construir edificios durante tu turno.', 'warning');
      return;
    }
    const apCost = card.costAP !== undefined ? card.costAP : 1;
    if (state.actionPoints < apCost) {
      toast('Sin AP', `Construir "${card.title}" requiere ${apCost} Punto de Acción (AP).`, 'warning');
      return;
    }
    if (card.costMaterial > 0 && state.resources.material < card.costMaterial) {
      toast('Faltan Materiales', `"${card.title}" requiere ${card.costMaterial} Materiales (tienes ${state.resources.material}). Canjea cartas para obtener materiales.`, 'warning');
      return;
    }
    if (card.costFood > 0 && state.resources.alimento < card.costFood) {
      toast('Falta Alimento', `"${card.title}" requiere ${card.costFood} Alimentos (tienes ${state.resources.alimento}).`, 'warning');
      return;
    }
    if (card.costWater > 0 && state.resources.agua < card.costWater) {
      toast('Falta Agua', `"${card.title}" requiere ${card.costWater} Agua (tienes ${state.resources.agua}).`, 'warning');
      return;
    }

    state.pendingBuildingPlacement = card;
    switchToScreen('nest');
    renderColonyPhysicalGrid();
    toast('Modo Construcción Activo', `Selecciona una celda contigua (iluminada en verde) para fijar "${card.title}".`, 'primary');
  }

  function placeBuildingAt(x, y, cardOverride = null) {
    const card = cardOverride || state.pendingBuildingPlacement;
    if (!card) return;

    if (getBuildingAt(x, y)) {
      toast('Celda Ocupada', 'Ya existe un edificio subterráneo en esta celda.', 'warning');
      return;
    }

    if (!isAdjacentToExistingBuilding(x, y)) {
      toast('Ubicación No Vinculada', 'Para quedar vinculado, el nuevo edificio debe construirse adyacente a otro ya existente.', 'warning');
      return;
    }

    const apCost = card.costAP !== undefined ? card.costAP : 1;
    if (state.actionPoints < apCost) {
      toast('Sin Puntos de Acción', `Construir "${card.title}" requiere ${apCost} AP (tienes ${state.actionPoints} AP).`, 'warning');
      return;
    }

    // Comprobar costes de materiales, alimento y agua
    if (card.costMaterial > 0 && state.resources.material < card.costMaterial) {
      toast('Faltan Materiales', `"${card.title}" requiere ${card.costMaterial} Materiales (tienes ${state.resources.material}). Puedes canjear cartas por materiales.`, 'warning');
      return;
    }
    if (card.costFood > 0 && state.resources.alimento < card.costFood) {
      toast('Falta Alimento', `"${card.title}" requiere ${card.costFood} Alimento (tienes ${state.resources.alimento}).`, 'warning');
      return;
    }
    if (card.costWater > 0 && state.resources.agua < card.costWater) {
      toast('Falta Agua', `"${card.title}" requiere ${card.costWater} Agua (tienes ${state.resources.agua}).`, 'warning');
      return;
    }

    if (!consumeAP(apCost)) return;

    if (card.costMaterial > 0) state.resources.material -= card.costMaterial;
    if (card.costFood > 0) state.resources.alimento -= card.costFood;
    if (card.costWater > 0) state.resources.agua -= card.costWater;

    // Efecto de carta
    let resultMsg = '';
    const tpl = TACTICAL_CARD_TEMPLATES.find(t => t.id === card.id);
    if (tpl && typeof tpl.play === 'function') {
      resultMsg = tpl.play(state);
    } else if (typeof card.play === 'function') {
      resultMsg = card.play(state);
    }

    const newBuilding = {
      instanceId: `b_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      tplId: card.id,
      name: card.title,
      icon: card.icon || 'foundation',
      x: x,
      y: y,
      capacity: card.capacity || 3,
      stationedTroops: 0,
      level: 1,
      pv: 1,
      desc: card.desc || 'Estructura fija vinculada a la colonia.'
    };

    state.colonyBuildings.push(newBuilding);

    // Mover de la mano al descarte
    const cardIdx = state.hand.findIndex(c => c.uid === card.uid);
    if (cardIdx !== -1) {
      state.hand.splice(cardIdx, 1);
      state.discard.push(card);
    }

    state.pendingBuildingPlacement = null;

    playSound('victory');
    toast('¡Edificio Construido y Vinculado!', `"${newBuilding.name}" fijado en (${x + 1}, ${y + 1}). Capacidad máx: ${newBuilding.capacity} tropas (+1 PV).`, 'success');
    log(`Construcción física: "${newBuilding.name}" fijado en (${x + 1}, ${y + 1}) con límite de ${newBuilding.capacity} tropas.`);

    updateAllPV();
    renderHeader();
    renderNest();
    renderTacticalHand();
    updateDiscardModalIfOpen();
    saveState();
  }

  function startTroopTransit(buildingInstanceId) {
    if (!isPlayerTurn()) {
      toast('Turno del Rival', 'Solo puedes mover tropas durante tu turno.', 'warning');
      return;
    }
    const b = (state.colonyBuildings || []).find(x => x.instanceId === buildingInstanceId);
    if (!b) return;

    if (b.stationedTroops <= 0) {
      toast('Sin Tropas', `"${b.name}" no tiene tropas apostadas para transitar.`, 'info');
      return;
    }

    state.troopTransitOrigin = b;
    renderColonyPhysicalGrid();
    toast('Tránsito de Tropas', `Selecciona un edificio contiguo conectado para mover 1 tropa desde "${b.name}".`, 'primary');
  }

  function completeTroopTransit(targetInstanceId) {
    const origin = state.troopTransitOrigin;
    if (!origin) return;

    const target = (state.colonyBuildings || []).find(x => x.instanceId === targetInstanceId);
    if (!target) return;

    if (target.instanceId === origin.instanceId) {
      state.troopTransitOrigin = null;
      renderColonyPhysicalGrid();
      return;
    }

    const dx = Math.abs(target.x - origin.x);
    const dy = Math.abs(target.y - origin.y);
    const isAdjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);

    if (!isAdjacent) {
      toast('Tránsito Bloqueado', 'Las tropas solo pueden transitar a través de galerías continuas hacia edificios directamente contiguos.', 'warning');
      return;
    }

    if (target.stationedTroops >= target.capacity) {
      toast('Capacidad Máxima', `"${target.name}" ha alcanzado su límite de ${target.capacity} tropas albergadas. Coloca más edificios o redistribuye tus tropas.`, 'warning');
      return;
    }

    origin.stationedTroops -= 1;
    target.stationedTroops += 1;
    state.troopTransitOrigin = null;

    playSound('tap');
    toast('Tránsito Completado', `1 tropa se desplazó de "${origin.name}" a "${target.name}".`, 'info');
    log(`Tránsito táctico interno: 1 tropa movida de "${origin.name}" a "${target.name}".`);

    renderColonyPhysicalGrid();
    saveState();
  }

  function stationFreeTroop(buildingInstanceId) {
    if (!isPlayerTurn()) {
      toast('Turno del Rival', 'Solo puedes apostar tropas en tu turno.', 'warning');
      return;
    }
    const b = (state.colonyBuildings || []).find(x => x.instanceId === buildingInstanceId);
    if (!b) return;

    if (state.resources.poblacionLibre <= 0) {
      toast('Sin Población Libre', 'No tienes hormigas libres en la colonia. Nutre a la Reina para generar larvas.', 'warning');
      return;
    }

    if (b.stationedTroops >= b.capacity) {
      toast('Capacidad Llena', `"${b.name}" ya tiene el máximo permitido (${b.capacity} tropas).`, 'warning');
      return;
    }

    state.resources.poblacionLibre -= 1;
    b.stationedTroops += 1;

    playSound('tap');
    toast('Tropa Apostada', `+1 tropa apostada en "${b.name}" (${b.stationedTroops}/${b.capacity}).`, 'success');
    log(`Defensa interna: Tropa apostada en "${b.name}".`);

    renderHeader();
    renderColonyPhysicalGrid();
    saveState();
  }

  // ==========================================
  // CONTROLADOR GLOBAL DE ARRASTRE Y SOLTADO DE CARTAS (ESTILO HEARTHSTONE / PEQUEÑAS GRANDES MAZMORRAS)
  // ==========================================
  let activeDraggedCard = null;
  let dragAvatarEl = null;

  function createOrGetDragAvatar(card) {
    if (!dragAvatarEl) {
      dragAvatarEl = document.createElement('div');
      dragAvatarEl.id = 'card-drag-avatar';
      dragAvatarEl.className = 'card-drag-avatar';
      document.body.appendChild(dragAvatarEl);
    }
    const cat = card.category || card.type || 'building';
    dragAvatarEl.className = `card-drag-avatar category-${cat}`;

    let typeLabel = 'Edificio';
    if (cat === 'building') typeLabel = 'Edificio Subterráneo';
    else if (cat === 'research') typeLabel = 'Investigación';
    else if (cat === 'conversion') typeLabel = 'Conversión';
    else if (cat === 'military') typeLabel = 'Militar';

    const apCost = card.costAP !== undefined ? card.costAP : 1;
    let costChipsHtml = `<span class="cost-chip chip-ap">⚡ ${apCost} PA</span>`;
    if (card.costMaterial > 0) costChipsHtml += `<span class="cost-chip chip-mat">🪵 ${card.costMaterial}</span>`;
    if (card.costFood > 0) costChipsHtml += `<span class="cost-chip chip-food">🍄 ${card.costFood}</span>`;
    if (card.costWater > 0) costChipsHtml += `<span class="cost-chip chip-water">💧 ${card.costWater}</span>`;

    dragAvatarEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.25rem;">
        <span class="card-type-tag ${cat}" style="font-size:0.6rem;">${typeLabel}</span>
        <div style="display:flex;gap:0.2rem;">${costChipsHtml}</div>
      </div>
      <div style="display:flex;align-items:center;gap:0.5rem;">
        <span class="material-symbols-outlined" style="font-size:24px;color:#f06536;">${card.icon || 'style'}</span>
        <strong style="font-size:0.82rem;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${card.title}</strong>
      </div>
      <div style="font-size:0.68rem;color:#ffcaa3;margin-top:0.25rem;text-align:center;background:rgba(0,0,0,0.45);border-radius:4px;padding:0.25rem;">
        ${cat === 'building' ? '⬇️ Suelta en celda verde contigua' : '⬇️ Suelta para jugar (-1 AP)'}
      </div>
    `;
    dragAvatarEl.style.display = 'flex';
    return dragAvatarEl;
  }

  function updateDragAvatarPos(x, y, tilt = 0) {
    if (!dragAvatarEl) return;
    dragAvatarEl.style.left = `${x}px`;
    dragAvatarEl.style.top = `${y}px`;
    dragAvatarEl.style.transform = `translate(-50%, -50%) rotate(${tilt}deg) scale(1.06)`;
  }

  function removeDragAvatar() {
    if (dragAvatarEl) {
      dragAvatarEl.style.display = 'none';
    }
  }

  function activateDropZonesForCard(card) {
    const cat = card.category || card.type || 'building';

    // Resaltar drop zones en la pantalla
    document.querySelectorAll('.tabletop-drop-zone').forEach(dz => {
      dz.classList.add('drop-zone-active');
    });

    if (cat === 'building') {
      // Si estamos en otra pantalla, ir al nido para visualizar el tablero de la colonia
      switchToScreen('nest');
      state.pendingBuildingPlacement = card;
      renderColonyPhysicalGrid();

      document.querySelectorAll('.colony-cell.empty').forEach(cell => {
        const cx = parseInt(cell.getAttribute('data-cell-x'), 10);
        const cy = parseInt(cell.getAttribute('data-cell-y'), 10);
        if (isAdjacentToExistingBuilding(cx, cy)) {
          cell.classList.add('placement-valid');
        }
      });
    } else if (cat === 'military') {
      document.querySelectorAll('.territory-sector-card').forEach(sec => {
        sec.classList.add('sector-drop-target');
      });
    }
  }

  function deactivateDropZones() {
    document.querySelectorAll('.tabletop-drop-zone').forEach(dz => {
      dz.classList.remove('drop-zone-active', 'drop-zone-hover');
    });
    document.querySelectorAll('.colony-cell').forEach(c => {
      c.classList.remove('hover-drop-active', 'hover-drop-invalid');
    });
    document.querySelectorAll('.territory-sector-card').forEach(s => {
      s.classList.remove('sector-drop-target', 'sector-drop-hover');
    });
  }

  function renderColonyPhysicalGrid() {
    const gridContainer = document.getElementById('colony-physical-grid');
    if (!gridContainer) return;

    ensureColonyBuildings();

    // Actualizar badges superiores
    const bCountBadge = document.getElementById('colony-buildings-count');
    const troopsCapBadge = document.getElementById('colony-troops-capacity');
    const totalTroops = state.colonyBuildings.reduce((sum, b) => sum + (b.stationedTroops || 0), 0);
    const totalCap = state.colonyBuildings.reduce((sum, b) => sum + (b.capacity || 0), 0);

    if (bCountBadge) {
      bCountBadge.textContent = `${state.colonyBuildings.length} Edificios Vinculados`;
    }
    if (troopsCapBadge) {
      troopsCapBadge.textContent = `${totalTroops}/${totalCap} Tropas Albergadas`;
    }

    // Actualizar Banner de Colocación
    const placementBanner = document.getElementById('colony-placement-banner');
    const pCardTitle = document.getElementById('placement-card-title');
    const pCardCosts = document.getElementById('placement-card-costs');

    if (state.pendingBuildingPlacement) {
      if (placementBanner) placementBanner.style.display = 'flex';
      const c = state.pendingBuildingPlacement;
      if (pCardTitle) pCardTitle.textContent = `Modo Construcción Activo: ${c.title}`;
      if (pCardCosts) {
        const costParts = [];
        costParts.push(`${c.costAP || 1} PA`);
        if (c.costMaterial > 0) costParts.push(`${c.costMaterial} Mat`);
        if (c.costFood > 0) costParts.push(`${c.costFood} Alimento`);
        if (c.costWater > 0) costParts.push(`${c.costWater} Agua`);
        pCardCosts.textContent = `Coste: ${costParts.join(' + ')} · Capacidad: ${c.capacity || 3} tropas`;
      }
    } else {
      if (placementBanner) placementBanner.style.display = 'none';
    }

    // Actualizar Banner de Tránsito
    const transitBanner = document.getElementById('colony-transit-banner');
    const tOriginTitle = document.getElementById('transit-origin-title');
    if (state.troopTransitOrigin) {
      if (transitBanner) transitBanner.style.display = 'flex';
      if (tOriginTitle) tOriginTitle.textContent = `Tránsito desde: ${state.troopTransitOrigin.name} (${state.troopTransitOrigin.stationedTroops} tropas)`;
    } else {
      if (transitBanner) transitBanner.style.display = 'none';
    }

    gridContainer.innerHTML = '';

    for (let r = 0; r < COLONY_GRID_ROWS; r++) {
      for (let c = 0; c < COLONY_GRID_COLS; c++) {
        const building = getBuildingAt(c, r);
        const cell = document.createElement('div');
        cell.setAttribute('data-cell-x', c);
        cell.setAttribute('data-cell-y', r);

        if (building) {
          const isOrigin = state.troopTransitOrigin && state.troopTransitOrigin.instanceId === building.instanceId;
          let isTargetValid = false;
          let isTargetInvalid = false;

          if (state.troopTransitOrigin && !isOrigin) {
            const dx = Math.abs(building.x - state.troopTransitOrigin.x);
            const dy = Math.abs(building.y - state.troopTransitOrigin.y);
            const isAdj = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
            if (isAdj && building.stationedTroops < building.capacity) {
              isTargetValid = true;
            } else {
              isTargetInvalid = true;
            }
          }

          cell.className = `colony-cell has-building ${building.isCapital ? 'building-capital' : ''} ${isOrigin ? 'transit-origin' : ''} ${isTargetValid ? 'transit-target-valid' : ''} ${isTargetInvalid ? 'transit-target-invalid' : ''}`;

          const pct = Math.min(100, Math.round((building.stationedTroops / building.capacity) * 100));
          const connBuildings = getConnectedAdjacentBuildings(building);

          cell.innerHTML = `
            <div class="colony-cell-top">
              <div class="colony-cell-icon">
                <span class="material-symbols-outlined" style="font-size:18px;">${building.icon || 'foundation'}</span>
              </div>
              <span class="cell-tunnel-badge" title="${connBuildings.length} conexiones activas con edificios adyacentes">
                <span class="material-symbols-outlined" style="font-size:11px;">alt_route</span>
                <span>${connBuildings.length} túnel${connBuildings.length === 1 ? '' : 'es'}</span>
              </span>
            </div>
            <div class="colony-cell-title" title="${building.name}">${building.name}</div>
            <div class="colony-cell-troops">
              <div class="colony-troops-row">
                <span>🐜 Tropas:</span>
                <span style="color:${building.stationedTroops >= building.capacity ? '#ef4444' : '#bef264'};">
                  ${building.stationedTroops}/${building.capacity}
                </span>
              </div>
              <div class="colony-capacity-bar">
                <div class="colony-capacity-fill" style="width:${pct}%;background:${building.stationedTroops >= building.capacity ? '#ef4444' : '#f06536'};"></div>
              </div>
            </div>
            <div class="colony-cell-actions">
              <button type="button" class="btn-cell-transit" data-transit-id="${building.instanceId}" title="Iniciar tránsito hacia un edificio vecino conectado" ${building.stationedTroops === 0 ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>
                <span class="material-symbols-outlined" style="font-size:12px;">arrow_forward</span>
                <span>Tránsito</span>
              </button>
              <button type="button" class="btn-cell-station" data-station-id="${building.instanceId}" title="Apostar 1 larva libre (+1 tropa)" ${building.stationedTroops >= building.capacity || state.resources.poblacionLibre <= 0 ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>
                <span class="material-symbols-outlined" style="font-size:12px;">add</span>
              </button>
            </div>
          `;

          if (isTargetValid) {
            cell.addEventListener('click', () => {
              completeTroopTransit(building.instanceId);
            });
          }

          const trBtn = cell.querySelector(`[data-transit-id="${building.instanceId}"]`);
          if (trBtn) {
            trBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              startTroopTransit(building.instanceId);
            });
          }

          const stBtn = cell.querySelector(`[data-station-id="${building.instanceId}"]`);
          if (stBtn) {
            stBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              stationFreeTroop(building.instanceId);
            });
          }
        } else {
          // Celda Vacía: Soporte para clic y Drag & Drop físico
          const isAdj = isAdjacentToExistingBuilding(c, r);
          const isPlacementMode = !!state.pendingBuildingPlacement;

          cell.className = `colony-cell empty ${isPlacementMode ? (isAdj ? 'placement-valid' : 'placement-invalid') : ''}`;

          if (isPlacementMode && isAdj) {
            cell.innerHTML = `
              <span class="material-symbols-outlined" style="font-size:20px;color:#bef264;">add_circle</span>
              <div style="font-weight:700;color:#bef264;margin-top:2px;">Fijar Aquí</div>
              <div class="empty-coords">(${c + 1}, ${r + 1}) · Vinculado</div>
            `;
            cell.addEventListener('click', () => {
              placeBuildingAt(c, r);
            });
          } else {
            cell.innerHTML = `
              <span class="material-symbols-outlined" style="font-size:16px;color:#443329;">layers</span>
              <div>Tierra Virgen</div>
              <div class="empty-coords">(${c + 1}, ${r + 1})</div>
            `;
            if (isPlacementMode && !isAdj) {
              cell.addEventListener('click', () => {
                toast('Ubicación No Permitida', 'Para quedar vinculado, el nuevo edificio debe construirse adyacente a otro ya existente.', 'warning');
              });
            }
          }

          // Listeners de Drag & Drop HTML5 en la celda vacía
          cell.addEventListener('dragover', (e) => {
            if (!activeDraggedCard) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            if (activeDraggedCard.category === 'building') {
              if (isAdjacentToExistingBuilding(c, r)) {
                cell.classList.add('hover-drop-active');
                cell.classList.remove('hover-drop-invalid');
              } else {
                cell.classList.add('hover-drop-invalid');
                cell.classList.remove('hover-drop-active');
              }
            }
          });

          cell.addEventListener('dragleave', () => {
            cell.classList.remove('hover-drop-active', 'hover-drop-invalid');
          });

          cell.addEventListener('drop', (e) => {
            e.preventDefault();
            cell.classList.remove('hover-drop-active', 'hover-drop-invalid');
            const cardUid = e.dataTransfer ? e.dataTransfer.getData('text/plain') : null;
            const cardObj = (cardUid && state.hand.find(cd => cd.uid === cardUid)) || activeDraggedCard;
            if (!cardObj) return;

            if (cardObj.category === 'building') {
              placeBuildingAt(c, r, cardObj);
            } else {
              toast('Ubicación No Válida', `"${cardObj.title}" no es un edificio subterráneo. Arrástrala a la zona táctica o haz clic en "Jugar".`, 'info');
            }
          });
        }

        gridContainer.appendChild(cell);
      }
    }
  }

  function playTacticalCard(cardUid) {
    if (!isPlayerTurn()) {
      toast('Turno del Rival', 'Solo puedes jugar cartas durante tu turno.', 'warning');
      return;
    }

    const cardIndex = state.hand.findIndex(c => c.uid === cardUid);
    if (cardIndex === -1) return;
    const card = state.hand[cardIndex];
    const cat = card.category || card.type || 'building';

    // 1. Si es edificio: activar colocación física en el tablero de colonia
    if (cat === 'building') {
      startBuildingPlacement(card);
      return;
    }

    // 2. Si es investigación: validar que no haya sido investigada previamente (efecto único no acumulable)
    if (cat === 'research') {
      const mutId = card.mutationId || (card.id ? card.id.replace('inv_', '') : null);
      const m = (state.mutations || []).find(x => x.id === mutId);
      if (m && m.unlocked) {
        const matVal = card.materialValue || card.costMaterial || 3;
        toast('Investigación ya Realizada', `"${card.title}" ya fue asimilada en tu Árbol Genético. Las investigaciones son de efecto único y NO son acumulables. Puedes canjear esta carta por +${matVal} Materiales (-1 AP) o descartarla.`, 'warning');
        return;
      }
    }

    // Comprobación de puntos de acción
    const apCost = card.costAP !== undefined ? card.costAP : 1;
    if (state.actionPoints < apCost) {
      toast('Sin Puntos de Acción', `Jugar "${card.title}" requiere ${apCost} AP (tienes ${state.actionPoints} AP).`, 'warning');
      return;
    }

    // Comprobación de costes de materiales y recursos
    if (card.costMaterial > 0 && state.resources.material < card.costMaterial) {
      toast('Faltan Materiales', `"${card.title}" requiere ${card.costMaterial} Materiales (tienes ${state.resources.material}). Puedes canjear otras cartas para obtener materiales.`, 'warning');
      return;
    }
    if (card.costFood > 0 && state.resources.alimento < card.costFood) {
      toast('Falta Alimento', `"${card.title}" requiere ${card.costFood} Alimentos (tienes ${state.resources.alimento}).`, 'warning');
      return;
    }
    if (card.costWater > 0 && state.resources.agua < card.costWater) {
      toast('Falta Agua', `"${card.title}" requiere ${card.costWater} Agua (tienes ${state.resources.agua}).`, 'warning');
      return;
    }
    if (card.costADN > 0 && state.resources.adn < card.costADN) {
      toast('Falta ADN', `"${card.title}" requiere ${card.costADN} ADN (tienes ${state.resources.adn}).`, 'warning');
      return;
    }

    // Descontar AP y recursos
    consumeAP(apCost);
    if (card.costMaterial > 0) state.resources.material -= card.costMaterial;
    if (card.costFood > 0) state.resources.alimento -= card.costFood;
    if (card.costWater > 0) state.resources.agua -= card.costWater;
    if (card.costADN > 0) state.resources.adn -= card.costADN;

    // Ejecutar efecto de la carta
    let resultMsg = '';
    const tpl = TACTICAL_CARD_TEMPLATES.find(t => t.id === card.id);
    if (tpl && typeof tpl.play === 'function') {
      resultMsg = tpl.play(state);
    } else if (typeof card.play === 'function') {
      resultMsg = card.play(state);
    } else {
      resultMsg = 'Efecto de carta aplicado con éxito.';
    }

    // Mover de la mano al descarte
    state.hand.splice(cardIndex, 1);
    state.discard.push(card);

    playSound('victory');
    toast('¡Carta Jugada!', `"${card.title}": ${resultMsg}`, 'success');
    log(`Carta jugada: "${card.title}" (${resultMsg}).`);

    updateAllPV();
    renderHeader();
    renderNest();
    renderGenetics();
    renderTacticalHand();
    renderTerritoryBoard();
    renderInspector();
    updateDiscardModalIfOpen();
    saveState();
  }

  // Canjear cualquier carta de la mano por su coste de materiales gastando 1 acción
  function exchangeCardForMaterials(cardUid) {
    if (!isPlayerTurn()) {
      toast('Turno del Rival', 'Solo puedes canjear cartas durante tu turno.', 'warning');
      return;
    }

    const cardIndex = state.hand.findIndex(c => c.uid === cardUid);
    if (cardIndex === -1) return;
    const card = state.hand[cardIndex];

    if (!consumeAP(1)) return;

    const matValue = card.materialValue || card.costMaterial || 3;
    state.resources.materialMax = Math.max(state.resources.materialMax, state.resources.material + matValue);
    state.resources.material += matValue;

    state.hand.splice(cardIndex, 1);
    state.discard.push(card);

    playSound('victory');
    toast('Carta Canjeada por Materiales', `"${card.title}" reciclada: +${matValue} Materiales obtenidos (-1 AP).`, 'success');
    log(`Canje de carta: "${card.title}" transformada en +${matValue} Materiales (-1 AP).`);

    updateAllPV();
    renderHeader();
    renderTacticalHand();
    updateDiscardModalIfOpen();
    saveState();
  }

  function discardTacticalCard(cardUid, notify = true) {
    const cardIndex = state.hand.findIndex(c => c.uid === cardUid);
    if (cardIndex === -1) return;
    const card = state.hand.splice(cardIndex, 1)[0];
    state.discard.push(card);
    playSound('tap');
    if (notify) {
      toast('Carta Descartada', `"${card.title}" enviada al descarte (sin coste de AP).`, 'info');
      log(`Descarte: "${card.title}" enviada a la pila de descarte.`);
    }
    renderTacticalHand();
    updateDiscardModalIfOpen();
    saveState();
  }

  function renderTacticalHand() {
    const container = document.getElementById('tactical-cards-hand');
    const deckCountEl = document.getElementById('hand-deck-counter');
    const handCountEl = document.getElementById('hand-cards-counter');
    const discardCountEl = document.getElementById('hand-discard-counter');
    const seasonLimitBadge = document.getElementById('hand-season-limit-badge');
    const alertBox = document.getElementById('hand-limit-alert');
    const alertText = document.getElementById('hand-limit-alert-text');

    const limit = getHandLimitAtTurnEnd();
    const isAutumn = SEASONS[state.seasonIndex] === 'Otoño';

    if (deckCountEl) deckCountEl.textContent = `🎴 Mazo: ${state.deck.length}`;
    if (handCountEl) handCountEl.textContent = `🖐️ En Mano: ${state.hand.length}/${limit}`;
    if (discardCountEl) discardCountEl.textContent = `🗑️ Descarte: ${state.discard.length}`;

    const physDeckNum = document.getElementById('physical-deck-count-num');
    const physDiscardNum = document.getElementById('physical-discard-count-num');
    if (physDeckNum) physDeckNum.textContent = `${state.deck.length}`;
    if (physDiscardNum) physDiscardNum.textContent = `${state.discard.length}`;

    if (seasonLimitBadge) {
      if (isAutumn) {
        seasonLimitBadge.textContent = '🍂 Otoño (+2 extra: 7 máx)';
        seasonLimitBadge.style.background = '#382012';
        seasonLimitBadge.style.color = '#fde68a';
        seasonLimitBadge.title = 'Regla Estacional de Otoño: Puedes conservar hasta 7 cartas en mano al terminar tu turno (+2 extra).';
      } else {
        seasonLimitBadge.textContent = '🌱 Límite Fin Turno: 5';
        seasonLimitBadge.style.background = '#1d2618';
        seasonLimitBadge.style.color = '#bef264';
        seasonLimitBadge.title = 'Límite de Fin de Turno: Al terminar tu turno debes conservar como máximo 5 cartas en mano.';
      }
    }

    if (alertBox) {
      if (state.hand.length > limit) {
        alertBox.style.display = 'flex';
        const excess = state.hand.length - limit;
        if (alertText) {
          alertText.textContent = `Tienes ${state.hand.length} cartas en mano. Al terminar el turno el límite es de ${limit} cartas ${isAutumn ? '(Otoño: 7 máx)' : '(5 máx)'}. Debes descartar o canjear ${excess} carta(s).`;
        }
      } else {
        alertBox.style.display = 'none';
      }
    }

    if (!container) return;
    container.innerHTML = '';

    if (state.hand.length === 0) {
      container.innerHTML = `
        <div class="hand-empty-hint">
          Tu mano está vacía. Robarás 2 cartas automáticamente al inicio de tu próximo turno o pulsa "Robar Carta (-1 AP)".
        </div>
      `;
      return;
    }

    state.hand.forEach(card => {
      const cardEl = document.createElement('div');
      const cat = card.category || card.type || 'building';
      cardEl.className = `tactical-card ${cat}`;
      
      let typeLabel = 'Edificio';
      let playBtnLabel = 'Construir';
      let playBtnIcon = 'foundation';

      if (cat === 'building') {
        typeLabel = 'Edificio';
        playBtnLabel = 'Construir (-1 AP)';
        playBtnIcon = 'foundation';
      } else if (cat === 'research') {
        typeLabel = 'Investigación';
        playBtnLabel = 'Investigar (-1 AP)';
        playBtnIcon = 'biotech';
      } else if (cat === 'conversion') {
        typeLabel = 'Conversión';
        playBtnLabel = 'Convertir (-1 AP)';
        playBtnIcon = 'swap_horiz';
      } else if (cat === 'military') {
        typeLabel = 'Militar';
        playBtnLabel = 'Reclutar / Táctica';
        playBtnIcon = 'swords';
      }

      const matValue = card.materialValue || card.costMaterial || 3;
      const apCost = card.costAP !== undefined ? card.costAP : 1;

      // Construcción dinámica de cost-chips
      let costChipsHtml = `<span class="cost-chip chip-ap">⚡ ${apCost} PA</span>`;
      if (card.costMaterial > 0) costChipsHtml += `<span class="cost-chip chip-mat">🪵 ${card.costMaterial} Mat</span>`;
      if (card.costFood > 0) costChipsHtml += `<span class="cost-chip chip-food">🍄 ${card.costFood} Alim</span>`;
      if (card.costWater > 0) costChipsHtml += `<span class="cost-chip chip-water">💧 ${card.costWater} Agua</span>`;
      if (card.costADN > 0) costChipsHtml += `<span class="cost-chip chip-dna">🧬 ${card.costADN} ADN</span>`;
      if (cat === 'building') {
        costChipsHtml += `<span class="cost-chip chip-capacity" title="Límite máximo de tropas albergables">🐜 Límite: ${card.capacity || 3} tropas</span>`;
      }

      // Comprobar si la investigación ya fue realizada (no acumulable)
      let isAlreadyResearched = false;
      if (cat === 'research') {
        const mutId = card.mutationId || (card.id ? card.id.replace('inv_', '') : null);
        const mut = (state.mutations || []).find(x => x.id === mutId);
        if (mut && mut.unlocked) {
          isAlreadyResearched = true;
          costChipsHtml += `<span class="cost-chip chip-unique-done" title="Esta investigación ya está activa. Efecto único no acumulable.">⚠️ Ya Investigada</span>`;
          playBtnLabel = 'Ya Investigada';
          playBtnIcon = 'check_circle';
        }
      }

      cardEl.innerHTML = `
        <div class="card-top-info">
          <span class="card-type-tag ${cat}">${typeLabel}</span>
          <div class="card-cost-chips">
            ${costChipsHtml}
          </div>
        </div>
        <div class="card-art-box">
          <span class="material-symbols-outlined" style="font-size:32px;color:#f06536;">${card.icon || 'style'}</span>
        </div>
        <div class="card-title-text">${card.title}</div>
        <div class="card-effect-desc">${card.desc}</div>
        <div style="margin-bottom:0.6rem;">
          <span class="card-exchange-pill" title="Gasta 1 AP para canjear esta carta por su valor de materiales">
            <span class="material-symbols-outlined" style="font-size:13px;">recycling</span>
            <span>Canje: +${matValue} Mat (-1 AP)</span>
          </span>
        </div>
        <div class="card-actions-bar">
          <button type="button" class="btn-play-card ${isAlreadyResearched ? 'btn-already-done' : ''}" data-play-uid="${card.uid}">
            <span class="material-symbols-outlined" style="font-size:15px;">${playBtnIcon}</span>
            <span>${playBtnLabel}</span>
          </button>
          <div class="card-actions-row">
            <button type="button" class="btn-exchange-card" data-exchange-uid="${card.uid}" title="Canjear por materiales gastando 1 acción (-1 AP)">
              <span class="material-symbols-outlined" style="font-size:14px;">recycling</span>
              <span>Canjear (+${matValue} Mat)</span>
            </button>
            <button type="button" class="btn-discard-card" data-discard-uid="${card.uid}" title="Descartar gratis de la mano">
              <span class="material-symbols-outlined" style="font-size:15px;">delete</span>
            </button>
          </div>
        </div>
      `;

      cardEl.setAttribute('draggable', 'true');
      cardEl.setAttribute('data-card-uid', card.uid);

      cardEl.querySelector(`[data-play-uid="${card.uid}"]`).addEventListener('click', (e) => {
        e.stopPropagation();
        playTacticalCard(card.uid);
      });

      cardEl.querySelector(`[data-exchange-uid="${card.uid}"]`).addEventListener('click', (e) => {
        e.stopPropagation();
        exchangeCardForMaterials(card.uid);
      });

      cardEl.querySelector(`[data-discard-uid="${card.uid}"]`).addEventListener('click', (e) => {
        e.stopPropagation();
        discardTacticalCard(card.uid);
      });

      // ==========================================
      // GESTIÓN DE ARRASTRE TÁCTICO (HTML5 + POINTER TIPO HEARTHSTONE)
      // ==========================================
      cardEl.addEventListener('dragstart', (e) => {
        if (!isPlayerTurn()) {
          e.preventDefault();
          toast('Turno del Rival', 'Solo puedes jugar cartas durante tu turno.', 'warning');
          return;
        }
        activeDraggedCard = card;
        e.dataTransfer.setData('text/plain', card.uid);
        e.dataTransfer.effectAllowed = 'copyMove';
        cardEl.classList.add('is-dragging');
        createOrGetDragAvatar(card);
        updateDragAvatarPos(e.clientX, e.clientY, 3);
        activateDropZonesForCard(card);
        playSound('tap');
      });

      cardEl.addEventListener('drag', (e) => {
        if (e.clientX !== 0 || e.clientY !== 0) {
          updateDragAvatarPos(e.clientX, e.clientY, 4);
        }
      });

      cardEl.addEventListener('dragend', () => {
        cardEl.classList.remove('is-dragging');
        removeDragAvatar();
        deactivateDropZones();
        activeDraggedCard = null;
      });

      // Soporte para gestos táctiles y arrastre fluido con el cursor
      cardEl.addEventListener('pointerdown', (e) => {
        if (e.target.closest('button')) return;
        if (!isPlayerTurn()) return;

        let isDraggingCard = false;
        const startX = e.clientX;
        const startY = e.clientY;
        let lastX = e.clientX;

        const onPointerMove = (moveEvt) => {
          const dist = Math.hypot(moveEvt.clientX - startX, moveEvt.clientY - startY);
          if (!isDraggingCard && dist > 6) {
            isDraggingCard = true;
            activeDraggedCard = card;
            cardEl.classList.add('is-dragging');
            createOrGetDragAvatar(card);
            activateDropZonesForCard(card);
          }
          if (isDraggingCard) {
            const deltaX = moveEvt.clientX - lastX;
            const tilt = Math.max(-14, Math.min(14, deltaX * 1.5));
            lastX = moveEvt.clientX;
            updateDragAvatarPos(moveEvt.clientX, moveEvt.clientY, tilt);

            // Resaltar elementos sobre los que se encuentra el cursor
            const hitEl = document.elementFromPoint(moveEvt.clientX, moveEvt.clientY);
            document.querySelectorAll('.colony-cell').forEach(c => c.classList.remove('hover-drop-active', 'hover-drop-invalid'));
            document.querySelectorAll('.tabletop-drop-zone').forEach(dz => dz.classList.remove('drop-zone-hover'));
            document.querySelectorAll('.territory-sector-card').forEach(sc => sc.classList.remove('sector-drop-hover'));

            if (hitEl) {
              const cell = hitEl.closest('.colony-cell');
              if (cell && cell.hasAttribute('data-cell-x')) {
                const cx = parseInt(cell.getAttribute('data-cell-x'), 10);
                const cy = parseInt(cell.getAttribute('data-cell-y'), 10);
                if (card.category === 'building') {
                  if (isAdjacentToExistingBuilding(cx, cy)) {
                    cell.classList.add('hover-drop-active');
                  } else {
                    cell.classList.add('hover-drop-invalid');
                  }
                }
              }
              const dz = hitEl.closest('.tabletop-drop-zone');
              if (dz) dz.classList.add('drop-zone-hover');
              const sc = hitEl.closest('.territory-sector-card');
              if (sc) sc.classList.add('sector-drop-hover');
            }
          }
        };

        const onPointerUp = (upEvt) => {
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerup', onPointerUp);
          window.removeEventListener('pointercancel', onPointerUp);

          if (isDraggingCard) {
            const hitEl = document.elementFromPoint(upEvt.clientX, upEvt.clientY);
            if (hitEl) {
              const cell = hitEl.closest('.colony-cell');
              const dz = hitEl.closest('.tabletop-drop-zone');
              const sc = hitEl.closest('.territory-sector-card');

              if (cell && cell.hasAttribute('data-cell-x')) {
                const cx = parseInt(cell.getAttribute('data-cell-x'), 10);
                const cy = parseInt(cell.getAttribute('data-cell-y'), 10);
                if (card.category === 'building') {
                  placeBuildingAt(cx, cy, card);
                } else {
                  toast('Ubicación No Válida', `"${card.title}" no es un edificio subterráneo. Arrástrala a la zona táctica o pulsa "Jugar".`, 'info');
                }
              } else if (dz) {
                if (card.category === 'building') {
                  startBuildingPlacement(card);
                } else {
                  playTacticalCard(card.uid);
                }
              } else if (sc && sc.hasAttribute('data-sector-id')) {
                const secId = sc.getAttribute('data-sector-id');
                state.selectedSectorId = secId;
                renderInspector();
                if (card.category === 'building') {
                  startBuildingPlacement(card);
                } else {
                  playTacticalCard(card.uid);
                }
              }
            }
            cardEl.classList.remove('is-dragging');
            removeDragAvatar();
            deactivateDropZones();
            activeDraggedCard = null;
          }
        };

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);
      });

      container.appendChild(cardEl);
    });
  }

  // ==========================================
  // MODAL DE DESCARTE DE FIN DE TURNO
  // ==========================================
  function openDiscardModal() {
    const modal = document.getElementById('discard-modal');
    if (!modal) return;
    renderDiscardModal();
    modal.classList.add('active');
    playSound('chit');
  }

  function closeDiscardModal() {
    const modal = document.getElementById('discard-modal');
    if (modal) modal.classList.remove('active');
  }

  function updateDiscardModalIfOpen() {
    const modal = document.getElementById('discard-modal');
    if (modal && modal.classList.contains('active')) {
      renderDiscardModal();
    }
  }

  function renderDiscardModal() {
    const limit = getHandLimitAtTurnEnd();
    const isAutumn = SEASONS[state.seasonIndex] === 'Otoño';
    const excess = Math.max(0, state.hand.length - limit);

    const descEl = document.getElementById('discard-modal-desc');
    const statusText = document.getElementById('discard-status-text');
    const seasonPill = document.getElementById('discard-season-pill');
    const cardsList = document.getElementById('discard-cards-list');
    const confirmBtn = document.getElementById('btn-confirm-pass-turn');

    if (descEl) {
      descEl.innerHTML = isAutumn
        ? `🍂 <strong>Temporada de Otoño Activa</strong>: Dispones de <strong>+2 cartas extra</strong> en mano (Límite: <strong>7 cartas</strong> al terminar el turno). Actualmente tienes <strong>${state.hand.length} cartas</strong>.`
        : `Al terminar tu turno debes quedar con un máximo de <strong>5 cartas</strong> en mano (en Otoño podrás tener 7). Actualmente tienes <strong>${state.hand.length} cartas</strong>.`;
    }

    if (statusText) {
      statusText.innerHTML = `Mano: <strong>${state.hand.length}</strong> · Límite: <strong>${limit}</strong> · Exceso a resolver: <strong style="color:${excess > 0 ? '#ef4444' : '#bef264'};">${excess}</strong>`;
    }

    if (seasonPill) {
      seasonPill.textContent = isAutumn ? '🍂 Otoño (+2 extra = 7)' : '🌱 Temporada Estándar (5)';
      seasonPill.style.color = isAutumn ? '#fde68a' : '#ffb59d';
    }

    if (confirmBtn) {
      if (excess === 0) {
        confirmBtn.disabled = false;
        confirmBtn.style.opacity = '1';
        confirmBtn.style.cursor = 'pointer';
        confirmBtn.style.background = '#8bc34a';
        confirmBtn.style.color = '#182810';
      } else {
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = '0.5';
        confirmBtn.style.cursor = 'not-allowed';
      }
    }

    if (!cardsList) return;
    cardsList.innerHTML = '';

    if (state.hand.length === 0) {
      cardsList.innerHTML = `<div style="text-align:center;padding:1rem;color:#a39287;">No tienes cartas en mano.</div>`;
      return;
    }

    state.hand.forEach(card => {
      const cat = card.category || card.type || 'building';
      const matValue = card.materialValue || card.costMaterial || 3;
      const row = document.createElement('div');
      row.className = `discard-card-item ${cat}`;

      let catName = 'Edificio';
      if (cat === 'research') catName = 'Investigación';
      else if (cat === 'conversion') catName = 'Conversión';
      else if (cat === 'military') catName = 'Militar';

      row.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="display:flex;align-items:center;gap:0.4rem;">
            <span class="material-symbols-outlined" style="font-size:18px;color:#f06536;">${card.icon || 'style'}</span>
            <span style="font-weight:700;color:#eae1dd;font-size:0.85rem;">${card.title}</span>
            <span class="card-type-tag ${cat}" style="font-size:0.6rem;">${catName}</span>
          </div>
          <span style="font-size:0.75rem;color:#a7f3d0;font-weight:700;">Valor: +${matValue} Mat</span>
        </div>
        <div style="font-size:0.72rem;color:#a39287;line-height:1.35;">${card.desc}</div>
        <div style="display:flex;justify-content:flex-end;gap:0.5rem;margin-top:0.25rem;">
          <button type="button" class="btn-action" data-discard-action="exchange" data-uid="${card.uid}" style="padding:0.25rem 0.6rem;font-size:0.72rem;background:#182820;border-color:#10b981;color:#a7f3d0;" ${state.actionPoints < 1 ? 'disabled title="Sin AP disponibles"' : ''}>
            <span class="material-symbols-outlined" style="font-size:13px;">recycling</span>
            <span>Canjear (+${matValue} Mat, -1 AP)</span>
          </button>
          <button type="button" class="btn-action" data-discard-action="discard" data-uid="${card.uid}" style="padding:0.25rem 0.6rem;font-size:0.72rem;border-color:#ef4444;color:#fca5a5;">
            <span class="material-symbols-outlined" style="font-size:13px;">delete</span>
            <span>Descartar (Gratis)</span>
          </button>
        </div>
      `;

      row.querySelector('[data-discard-action="exchange"]').addEventListener('click', () => {
        exchangeCardForMaterials(card.uid);
      });

      row.querySelector('[data-discard-action="discard"]').addEventListener('click', () => {
        discardTacticalCard(card.uid);
      });

      cardsList.appendChild(row);
    });
  }

  // ==========================================
  // 6. MAPA MODULAR: TABLERO DE SECTORES TERRITORIALES
  // ==========================================
  function renderTerritoryBoard() {
    const container = document.getElementById('colony-territory-board');
    if (!container) return;
    container.innerHTML = '';

    (state.sectors || []).forEach(sector => {
      const isSelected = state.selectedSectorId === sector.id;
      const card = document.createElement('div');
      card.className = `territory-sector-card ${sector.type || 'resource'} ${isSelected ? 'selected' : ''}`;

      const upgradesHtml = (sector.upgrades && sector.upgrades.length > 0)
        ? sector.upgrades.map(u => `<span class="sector-badge upgrade" style="background:#3a2e28;color:#ffcaa3;">✨ ${u}</span>`).join('')
        : '';

      card.innerHTML = `
        <div class="sector-card-header">
          <div class="sector-icon-box">
            <span class="material-symbols-outlined">${sector.icon || 'layers'}</span>
          </div>
          <div class="sector-title-box">
            <h4>${sector.name}</h4>
            <div style="font-size:0.68rem;color:#a39287;">${sector.type === 'capital' ? 'Nido Central' : 'Sector Exterior'}</div>
          </div>
          <div>
            ${isSelected ? '<span class="sector-badge" style="background:#f06536;color:#fff;">Seleccionado</span>' : ''}
          </div>
        </div>

        <div style="font-size:0.75rem;color:#eae1dd;margin-bottom:0.5rem;line-height:1.35;">
          ${sector.desc}
        </div>

        <div class="sector-meta-grid">
          <div class="sector-meta-item">
            <span class="label">Control Territorial</span>
            <span class="val" style="color:#8bc34a;">${sector.control || 0}%</span>
          </div>
          <div class="sector-meta-item">
            <span class="label">Tropas Apostadas</span>
            <span class="val" style="color:#f06536;">🐜 ${sector.squads || 0} Tropas</span>
          </div>
        </div>

        <div class="sector-yield-box">
          <span class="material-symbols-outlined" style="font-size:15px;color:#8bc34a;">trending_up</span>
          <span>Rendimiento: <strong>${sector.yield}</strong></span>
        </div>

        ${upgradesHtml ? `<div style="display:flex;flex-wrap:wrap;gap:0.35rem;margin-top:0.4rem;">${upgradesHtml}</div>` : ''}
      `;

      card.setAttribute('data-sector-id', sector.id);

      card.addEventListener('dragover', (e) => {
        if (!activeDraggedCard) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        card.classList.add('sector-drop-hover');
      });

      card.addEventListener('dragleave', () => {
        card.classList.remove('sector-drop-hover');
      });

      card.addEventListener('drop', (e) => {
        e.preventDefault();
        card.classList.remove('sector-drop-hover');
        const cardUid = e.dataTransfer ? e.dataTransfer.getData('text/plain') : null;
        const cardObj = (cardUid && state.hand.find(c => c.uid === cardUid)) || activeDraggedCard;
        if (!cardObj) return;

        state.selectedSectorId = sector.id;
        renderInspector();

        if (cardObj.category === 'building') {
          startBuildingPlacement(cardObj);
        } else {
          playTacticalCard(cardObj.uid);
        }
      });

      card.addEventListener('click', () => {
        playSound('chit');
        state.selectedSectorId = sector.id;
        renderTerritoryBoard();
        renderInspector();
      });

      container.appendChild(card);
    });
  }

  function renderInspector() {
    const sector = (state.sectors || []).find(s => s.id === state.selectedSectorId) || state.sectors[0];
    if (!sector) return;

    const elName = document.getElementById('inspector-name');
    const elDesc = document.getElementById('inspector-desc');
    const elControl = document.getElementById('inspector-control');
    const elSquads = document.getElementById('inspector-squads');
    const elYield = document.getElementById('inspector-yield');
    const elUpgrades = document.getElementById('inspector-upgrades');

    if (elName) elName.textContent = sector.name;
    if (elDesc) elDesc.textContent = sector.desc;
    if (elControl) elControl.textContent = `${sector.control}%`;
    if (elSquads) elSquads.textContent = `${sector.squads} Tropas Apostadas`;
    if (elYield) elYield.textContent = sector.yield;
    if (elUpgrades) {
      elUpgrades.textContent = (sector.upgrades && sector.upgrades.length > 0)
        ? sector.upgrades.join(', ')
        : 'Sin mejoras de terreno instaladas';
    }
  }

  // ==========================================
  // 7. TEMPORIZADOR Y CONTROL DE TURNO SECUENCIAL
  // ==========================================
  const TURN_PLAYERS = ['player', 'carmesi', 'mandibulas', 'dorada'];
  let turnTimerInterval = null;
  let aiTurnTimeout = null;

  function isPlayerTurn() {
    return state.activePlayerId === 'player';
  }

  function getActivePlayer() {
    if (isPlayerTurn()) {
      return { id: 'player', name: 'Tu Colonia (Enjambre Alfa)', isPlayer: true, color: '#8bc34a' };
    }
    const r = (state.rivals || []).find(x => x.id === state.activePlayerId);
    return r || { id: state.activePlayerId, name: 'Rival', isPlayer: false, color: '#f06536' };
  }

  function formatTime(seconds) {
    const s = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function startTurnTimer() {
    if (turnTimerInterval) clearInterval(turnTimerInterval);
    updateTurnTimerDisplay();

    turnTimerInterval = setInterval(() => {
      state.turnTimeRemaining -= 1;
      updateTurnTimerDisplay();

      if (state.turnTimeRemaining <= 0) {
        handleTurnTimerExpired();
      }
    }, 1000);
  }

  function updateTurnTimerDisplay() {
    const timerEl = document.getElementById('turn-timer');
    const timerText = document.getElementById('turn-timer-text');
    if (timerText) {
      timerText.textContent = formatTime(state.turnTimeRemaining);
    }

    if (timerEl) {
      if (state.turnTimeRemaining <= 15) {
        timerEl.classList.add('warning');
      } else {
        timerEl.classList.remove('warning');
      }
    }

    const badge = document.getElementById('turn-active-badge');
    const badgeLabel = document.getElementById('turn-active-label');
    const waitingBanner = document.getElementById('turn-waiting-banner');
    const passTurnBtn = document.getElementById('btn-pass-turn');

    if (isPlayerTurn()) {
      if (badge) badge.className = 'turn-turn-badge player-turn';
      if (badgeLabel) badgeLabel.textContent = 'Tu Turno (Enjambre Alfa)';
      if (waitingBanner) waitingBanner.style.display = 'none';
      document.body.classList.remove('rival-turn-active');
      if (passTurnBtn) {
        passTurnBtn.disabled = false;
        passTurnBtn.style.opacity = '1';
        passTurnBtn.style.cursor = 'pointer';
        const label = passTurnBtn.querySelector('span:last-child');
        if (label) label.textContent = 'Pasar Turno';
      }
    } else {
      const active = getActivePlayer();
      if (badge) badge.className = 'turn-turn-badge rival-turn';
      if (badgeLabel) badgeLabel.textContent = `Turno de: ${active.name}`;
      if (waitingBanner) {
        waitingBanner.style.display = 'flex';
        const titleEl = document.getElementById('turn-waiting-title');
        if (titleEl) titleEl.textContent = `Turno de: ${active.name}`;
      }
      document.body.classList.add('rival-turn-active');
      if (passTurnBtn) {
        passTurnBtn.disabled = true;
        passTurnBtn.style.opacity = '0.5';
        passTurnBtn.style.cursor = 'not-allowed';
        const label = passTurnBtn.querySelector('span:last-child');
        if (label) label.textContent = 'Turno Rival...';
      }
    }
  }

  function handleTurnTimerExpired() {
    if (isPlayerTurn()) {
      toast('Salto Automático de Turno', 'Tus 90 segundos han finalizado. Tu turno pasa automáticamente al rival.', 'warning');
      log('Temporizador de 90s agotado: Salto automático al turno del rival.');
    }
    advanceTurn();
  }

  let rivalBannerTimeout = null;
  function showRivalNotification(text) {
    const banner = document.getElementById('rival-live-banner');
    const bannerText = document.getElementById('rival-live-text');
    if (!banner || !bannerText) return;

    bannerText.textContent = text;
    banner.style.display = 'flex';
    playSound('chit');

    if (rivalBannerTimeout) clearTimeout(rivalBannerTimeout);
    rivalBannerTimeout = setTimeout(() => {
      banner.style.display = 'none';
    }, 6000);
  }

  function getPlayerTotalStationedTroops() {
    const squadsInSectors = (state.sectors || []).reduce((sum, s) => sum + (s.squads || 0), 0);
    const militaryCastes = ((state.castes && state.castes.soldados) ? state.castes.soldados.count : 0) +
                           ((state.castes && state.castes.artilleras) ? state.castes.artilleras.count : 0);
    return squadsInSectors + militaryCastes;
  }

  function updatePlayerTargetableStatus() {
    const statusBadge = document.getElementById('player-targetable-status');
    if (!statusBadge) return;
    const troops = getPlayerTotalStationedTroops();
    if (troops > 0) {
      statusBadge.className = 'badge-targetable';
      statusBadge.textContent = `Elegible para Ataque Rival: Sí (${troops} tropas activas)`;
      statusBadge.title = 'Posees tropas apostadas. Los rivales pueden seleccionarte como objetivo de incursión.';
    } else {
      statusBadge.className = 'badge-immune';
      statusBadge.textContent = 'Inmune a Incursión: Sin tropas expuestas';
      statusBadge.title = 'Al no tener tropas activas en superficie, tu colonia no es seleccionable en las listas de ataque rivales.';
    }
  }

  // ==========================================
  // 8. MARCADOR DE PUNTOS DE VICTORIA (SIN LÍMITE)
  // ==========================================
  function renderPVScoreboard() {
    updateAllPV();
    const list = document.getElementById('pv-scoreboard-list');
    if (!list) return;
    list.innerHTML = '';

    const participants = [
      {
        id: 'player',
        name: 'Tu Colonia',
        species: 'Enjambre Soberano',
        pv: state.resources.puntosVictoria,
        isPlayer: true,
        color: '#f06536'
      },
      ...(state.rivals || []).map(r => ({
        id: r.id,
        name: r.name,
        species: r.species,
        pv: r.pv,
        isPlayer: false,
        color: r.color
      }))
    ];

    // Ordenar de mayor a menor puntuación sin límite
    participants.sort((a, b) => b.pv - a.pv);
    const maxPvInGame = Math.max(15, ...participants.map(p => p.pv));

    participants.forEach((p, index) => {
      const pct = Math.min(100, Math.round((p.pv / maxPvInGame) * 100));
      const entry = document.createElement('div');
      entry.className = `pv-entry ${p.isPlayer ? 'is-player' : ''}`;
      
      const rankBadge = index === 0 ? '👑' : `#${index + 1}`;

      entry.innerHTML = `
        <div class="pv-entry-header">
          <span style="display:flex;align-items:center;gap:0.35rem;color:${p.color};">
            <span style="font-size:0.7rem;">${rankBadge}</span>
            <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:115px;">${p.name} ${p.isPlayer ? '(Tú)' : ''}</span>
          </span>
          <span style="font-size:0.76rem;color:#eae1dd;font-weight:800;">${p.pv} PV</span>
        </div>
        <div class="pv-entry-bar-track">
          <div class="pv-entry-bar-fill" style="width:${pct}%;background:${p.isPlayer ? 'linear-gradient(90deg, #f59e0b, #f06536)' : p.color};"></div>
        </div>
      `;

      entry.addEventListener('click', () => {
        openPVBreakdownModal();
      });

      list.appendChild(entry);
    });
  }

  function openPVBreakdownModal() {
    updateAllPV();
    const modal = document.getElementById('pv-breakdown-modal');
    if (modal) modal.classList.add('active');
    playSound('tap');
  }

  // ==========================================
  // 9. INTELIGENCIA DE RIVALES
  // ==========================================
  function renderRivals() {
    const container = document.getElementById('rivals-cards-container');
    if (!container) return;
    container.innerHTML = '';

    if (!state.rivals) return;

    state.rivals.forEach(rival => {
      const isCurrentTurn = state.activePlayerId === rival.id;
      const card = document.createElement('div');
      card.className = `rival-card ${rival.hasTroops ? 'targetable' : 'immune'} ${isCurrentTurn ? 'active-turn' : ''}`;

      const attackBtnHtml = rival.hasTroops
        ? `<button type="button" class="btn-action btn-primary-action" data-attack-rival="${rival.id}" style="justify-content:center;padding:0.6rem;">
             <span class="material-symbols-outlined" style="font-size:16px;">casino</span>
             <span>Incursión T.E.G. (-1 AP al lanzar)</span>
           </button>`
        : `<button type="button" class="btn-action" disabled style="justify-content:center;opacity:0.45;cursor:not-allowed;padding:0.6rem;" title="El rival no tiene tropas en superficie para ser atacado">
             <span class="material-symbols-outlined" style="font-size:16px;">block</span>
             <span>Inmune (Sin tropas para atacar)</span>
           </button>`;

      card.innerHTML = `
        <div class="rival-header">
          <div class="rival-identity">
            <div class="rival-avatar" style="background:${rival.color}33;border-color:${rival.color};">
              <span class="material-symbols-outlined" style="color:${rival.color};">${rival.avatar}</span>
            </div>
            <div class="rival-name-box">
              <div style="display:flex;align-items:center;gap:0.4rem;">
                <h3>${rival.name}</h3>
                ${isCurrentTurn ? '<span class="badge-tag" style="background:#f06536;color:#fff;font-size:0.65rem;">🎯 Jugando Ahora</span>' : ''}
              </div>
              <span>${rival.species}</span>
            </div>
          </div>
          <div>
            ${rival.hasTroops 
              ? `<span class="badge-targetable" title="Posee tropas detectadas. Puede ser atacado.">Vulnerable a Incursión (${rival.troopsCount || 3} tropas)</span>`
              : `<span class="badge-immune" title="Sin tropas activas. No puede ser seleccionado para ataque.">Inmune a Incursión</span>`
            }
          </div>
        </div>

        <div class="rival-metrics-grid">
          <div class="rival-metric-item">
            <span class="rival-metric-label">Recursos Estimados</span>
            <span class="rival-metric-val" style="font-size:0.7rem;color:#ffcaa3;">
              🍄 ${rival.resources.alimento} · 💧 ${rival.resources.agua} · 🪵 ${rival.resources.material}
            </span>
          </div>
          <div class="rival-metric-item">
            <span class="rival-metric-label">Puntuación de Dominio</span>
            <span class="rival-metric-val" style="color:#f59e0b;font-weight:800;">🏆 ${rival.pv} PV</span>
          </div>
          <div class="rival-metric-item">
            <span class="rival-metric-label">Población Total (Global)</span>
            <span class="rival-metric-val" style="color:#38bdf8;">👥 ${rival.populationTotal} unidades</span>
          </div>
          <div class="rival-metric-item">
            <span class="rival-metric-label">Estado de Turno</span>
            <span class="rival-metric-val" style="color:${isCurrentTurn ? '#f06536' : '#a39287'};font-weight:700;">
              ${isCurrentTurn ? '🎯 Jugando Ahora' : '⏳ En Espera'}
            </span>
          </div>
        </div>

        <div class="fog-notice">
          <span class="material-symbols-outlined">visibility_off</span>
          <div>
            <strong>Distribución Territorial Oculta:</strong>
            <div style="font-size:0.68rem;color:#a39287;">Su mapa y sectores son 100% privados e incomunicados para preservar su secreto estratégico.</div>
          </div>
        </div>

        <div style="font-size:0.75rem;color:#eae1dd;background:rgba(0,0,0,0.25);padding:0.45rem 0.65rem;border-radius:6px;">
          <span style="color:#a39287;">Última Actividad Observada:</span> <strong>${rival.lastAction}</strong>
        </div>

        ${attackBtnHtml}
      `;

      const attackBtn = card.querySelector(`[data-attack-rival="${rival.id}"]`);
      if (attackBtn) {
        attackBtn.addEventListener('click', () => {
          if (!isPlayerTurn()) {
            toast('Turno del Rival', 'Solo puedes ordenar ataques durante tu turno.', 'warning');
            return;
          }
          if (state.actionPoints < 1) {
            toast('Sin Puntos de Acción', 'Necesitas al menos 1 AP disponible para iniciar una incursión.', 'warning');
            return;
          }
          selectedCombatRivalId = rival.id;
          openCombat();
        });
      }

      container.appendChild(card);
    });
  }

  // ==========================================
  // 10. COMBATE ESTILO T.E.G. (1v1 HASTA 3v3 MÁXIMO)
  // ==========================================
  // Reglas del manual:
  // - 1 tropa = 1 D6, 2 tropas = 2 D6, 3+ tropas = 3 D6 (Máx 3 dados por bando).
  // - Se lanzan todos los dados al mismo tiempo.
  // - Se ordenan de mayor a menor en ambos bandos.
  // - Se comparan 1 contra 1 por orden de mayor a menor:
  //   - Primer dado atacante vs primer dado defensor
  //   - Segundo dado atacante vs segundo dado defensor (si ambos tienen)
  //   - Tercer dado atacante vs tercer dado defensor (si ambos tienen)
  // - Si empatan en un dado (ej. 4 vs 4 o 6 vs 6): EMPATE (ningún jugador obtiene ventaja).
  // - Dados no emparejados (ej. 3 atacante vs 2 defensor): el tercer dado atacante queda "Sin oposición".
  // - Se cuentan las comparaciones ganadas por cada bando.
  let selectedCombatRivalId = 'carmesi';
  let selectedAttackerTroops = 3;
  let isRollingDice = false;

  function populateCombatTargets() {
    const select = document.getElementById('combat-target-select');
    if (!select) return;
    select.innerHTML = '';

    if (!state.rivals) return;

    let firstValidFound = false;

    state.rivals.forEach(rival => {
      const opt = document.createElement('option');
      opt.value = rival.id;
      if (rival.hasTroops) {
        opt.textContent = `${rival.name} (${rival.species}) - ${rival.troopsCount || 3} tropas activas`;
        if (!firstValidFound) {
          opt.selected = true;
          selectedCombatRivalId = rival.id;
          firstValidFound = true;
        }
      } else {
        opt.textContent = `${rival.name} - Inmune [Sin tropas para atacar]`;
        opt.disabled = true;
      }
      select.appendChild(opt);
    });

    if (selectedCombatRivalId) {
      select.value = selectedCombatRivalId;
      updateCombatTargetDetails();
    }

    select.onchange = () => {
      selectedCombatRivalId = select.value;
      updateCombatTargetDetails();
    };
  }

  function updateCombatTargetDetails() {
    const rival = state.rivals.find(r => r.id === selectedCombatRivalId);
    const enemyTitle = document.getElementById('combat-enemy-title');
    const enemyLabel = document.getElementById('teg-enemy-label');
    const defTroopsText = document.getElementById('teg-defender-troops-text');

    if (rival) {
      if (enemyTitle) {
        enemyTitle.textContent = `Legión Defensora: ${rival.name}`;
        enemyTitle.style.color = rival.color;
      }
      if (enemyLabel) {
        enemyLabel.textContent = `Defensa (${rival.name})`;
      }
      const defTroops = rival.troopsCount || 3;
      const defDice = Math.min(3, Math.max(1, defTroops));
      if (defTroopsText) {
        defTroopsText.textContent = `${defTroops} tropas presentes (${defDice} D6 defensores)`;
      }
    }
  }

  function openCombat() {
    populateCombatTargets();
    const modal = document.getElementById('combat-modal');
    if (!modal) return;
    modal.classList.add('active');

    // Inicializar botones de selección de tropas atacantes
    const maxAvailable = Math.max(1, Math.min(3, getPlayerTotalStationedTroops()));
    selectedAttackerTroops = maxAvailable;

    updateTroopChoiceButtons();

    // Limpiar dados y filas de choque previo
    for (let i = 0; i < 3; i++) {
      const p = document.getElementById(`p-die-${i}`);
      const e = document.getElementById(`e-die-${i}`);
      if (p) {
        p.textContent = '-';
        p.className = 'teg-die';
      }
      if (e) {
        e.textContent = '-';
        e.className = 'teg-die';
      }
    }

    const clashRows = document.getElementById('teg-clash-rows');
    if (clashRows) {
      clashRows.innerHTML = `
        <div style="text-align:center;padding:1rem;color:#a39287;font-size:0.8rem;">
          Selecciona la cantidad de tropas atacantes (1 a 3 D6) y pulsa "Lanzar Dados de Choque T.E.G." para batallar.
        </div>
      `;
    }

    const banner = document.getElementById('combat-result-banner');
    if (banner) {
      banner.textContent = 'Cada tropa aporta 1 D6 (máximo 3 D6). Los dados se ordenarán de mayor a menor y se compararán 1 contra 1.';
    }

    const btn = document.getElementById('btn-roll-combat');
    if (btn) btn.disabled = false;
    playSound('tap');
  }

  function updateTroopChoiceButtons() {
    const maxAvailable = Math.max(1, Math.min(3, getPlayerTotalStationedTroops()));
    if (selectedAttackerTroops > maxAvailable) selectedAttackerTroops = maxAvailable;

    document.querySelectorAll('.btn-troop-choice').forEach(b => {
      const count = parseInt(b.getAttribute('data-troops'), 10);
      if (count === selectedAttackerTroops) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    const attCounter = document.getElementById('teg-attacker-dice-count');
    if (attCounter) {
      attCounter.textContent = `${selectedAttackerTroops} D6 (${selectedAttackerTroops} tropas involucradas)`;
    }
  }

  function rollCombatTEG() {
    if (isRollingDice) return;

    if (!isPlayerTurn()) {
      toast('Turno del Rival', 'Solo puedes lanzar ofensivas tácticas durante tu turno.', 'warning');
      return;
    }

    if (state.actionPoints < 1) {
      toast('Sin AP Disponibles', 'Necesitas al menos 1 AP disponible para lanzar la ofensiva.', 'warning');
      return;
    }

    const rival = (state.rivals && state.rivals.find(r => r.id === selectedCombatRivalId)) || {
      name: 'Legión Hostil',
      hasTroops: true,
      troopsCount: 3
    };

    if (!rival.hasTroops) {
      toast('Objetivo Inmune', 'Este rival no posee tropas expuestas para ser atacado.', 'warning');
      return;
    }

    // Consumir 1 AP al lanzar
    if (!consumeAP(1)) return;

    isRollingDice = true;
    playSound('dice');

    const btn = document.getElementById('btn-roll-combat');
    if (btn) btn.disabled = true;

    const banner = document.getElementById('combat-result-banner');
    if (banner) {
      banner.textContent = `¡Lanzando todos los dados de choque contra ${rival.name}! Enfrentamiento simultáneo...`;
    }

    // Determinar cantidad de dados
    const attackerDiceCount = Math.min(3, Math.max(1, selectedAttackerTroops));
    const defenderTroops = rival.troopsCount || 3;
    const defenderDiceCount = Math.min(3, Math.max(1, defenderTroops));

    // Animación de tirada
    for (let i = 0; i < 3; i++) {
      const p = document.getElementById(`p-die-${i}`);
      const e = document.getElementById(`e-die-${i}`);
      if (p) {
        p.textContent = (i < attackerDiceCount) ? Math.floor(Math.random() * 6) + 1 : '-';
        p.className = `teg-die ${i < attackerDiceCount ? 'rolling player' : 'empty'}`;
      }
      if (e) {
        e.textContent = (i < defenderDiceCount) ? Math.floor(Math.random() * 6) + 1 : '-';
        e.className = `teg-die ${i < defenderDiceCount ? 'rolling enemy' : 'empty'}`;
      }
    }

    setTimeout(() => {
      // 1. Tirar todos los dados
      const pRaw = [];
      for (let i = 0; i < attackerDiceCount; i++) {
        pRaw.push(Math.floor(Math.random() * 6) + 1);
      }
      const eRaw = [];
      for (let i = 0; i < defenderDiceCount; i++) {
        eRaw.push(Math.floor(Math.random() * 6) + 1);
      }

      // 2. Ordenar de mayor a menor
      pRaw.sort((a, b) => b - a);
      eRaw.sort((a, b) => b - a);

      // Renderizar dados ordenados
      for (let i = 0; i < 3; i++) {
        const p = document.getElementById(`p-die-${i}`);
        const e = document.getElementById(`e-die-${i}`);
        if (p) {
          p.classList.remove('rolling');
          if (i < pRaw.length) {
            p.textContent = pRaw[i];
            p.className = 'teg-die player';
          } else {
            p.textContent = '-';
            p.className = 'teg-die empty';
          }
        }
        if (e) {
          e.classList.remove('rolling');
          if (i < eRaw.length) {
            e.textContent = eRaw[i];
            e.className = 'teg-die enemy';
          } else {
            e.textContent = '-';
            e.className = 'teg-die empty';
          }
        }
      }

      // 3. Comparar 1 contra 1 por orden de mayor a menor (Regla T.E.G. Canónica)
      let attackerWins = 0;
      let defenderWins = 0;
      const comparisons = [];
      const pairedCount = Math.min(pRaw.length, eRaw.length);

      for (let i = 0; i < pairedCount; i++) {
        const pVal = pRaw[i];
        const eVal = eRaw[i];

        if (pVal > eVal) {
          attackerWins++;
          comparisons.push({
            index: i + 1,
            pVal,
            eVal,
            winner: 'attacker',
            text: `Dado #${i + 1}: ${pVal} vs ${eVal} → Gana Atacante (1 baja rival)`
          });
        } else {
          // En T.E.G. el empate favorece siempre al defensor
          defenderWins++;
          const isTie = pVal === eVal;
          comparisons.push({
            index: i + 1,
            pVal,
            eVal,
            winner: 'defender',
            text: isTie
              ? `Dado #${i + 1}: ${pVal} vs ${eVal} → Gana Defensor (Empate favorece a la defensa)`
              : `Dado #${i + 1}: ${pVal} vs ${eVal} → Gana Defensor (1 baja atacante)`
          });
        }
      }

      // Dados que no tuvieron oposición
      for (let i = pairedCount; i < Math.max(pRaw.length, eRaw.length); i++) {
        if (pRaw[i] !== undefined) {
          comparisons.push({
            index: i + 1,
            pVal: pRaw[i],
            eVal: '-',
            winner: 'uncontested',
            text: `Dado #${i + 1} Atacante (${pRaw[i]}): Sin oposición defensora (no puntúa)`
          });
        } else if (eRaw[i] !== undefined) {
          comparisons.push({
            index: i + 1,
            pVal: '-',
            eVal: eRaw[i],
            winner: 'uncontested_def',
            text: `Dado #${i + 1} Defensor (${eRaw[i]}): Sin oposición atacante (no puntúa)`
          });
        }
      }

      // 4. Renderizar desglose de enfrentamientos 1v1
      const clashRows = document.getElementById('teg-clash-rows');
      if (clashRows) {
        clashRows.innerHTML = '';
        comparisons.forEach(comp => {
          const row = document.createElement('div');
          row.className = 'clash-row';

          let badgeHtml = '';
          if (comp.winner === 'attacker') {
            badgeHtml = `<span class="clash-badge win-att">Victoria Atacante</span>`;
          } else if (comp.winner === 'defender') {
            badgeHtml = `<span class="clash-badge win-def">Victoria Defensor</span>`;
          } else if (comp.winner === 'tie') {
            badgeHtml = `<span class="clash-badge tie">Empate</span>`;
          } else {
            badgeHtml = `<span class="clash-badge unapposed">Sin Oposición</span>`;
          }

          row.innerHTML = `
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <span style="font-weight:700;color:#f06536;font-size:0.95rem;">🎲 ${comp.pVal}</span>
              <span style="color:#a39287;font-size:0.75rem;">vs</span>
              <span style="font-weight:700;color:#38bdf8;font-size:0.95rem;">🎲 ${comp.eVal}</span>
            </div>
            <div style="font-size:0.78rem;color:#eae1dd;">${comp.text}</div>
            <div>${badgeHtml}</div>
          `;
          clashRows.appendChild(row);
        });
      }

      // 5. Determinar resultado global y consecuencias
      isRollingDice = false;
      if (btn) btn.disabled = false;

      if (attackerWins > defenderWins) {
        playSound('victory');
        state.militaryVictories = (state.militaryVictories || 0) + 1;
        state.resources.material = Math.min(state.resources.materialMax, state.resources.material + 5);
        state.resources.adn += 2;

        // Bajas del rival
        if (rival.troopsCount !== undefined) {
          rival.troopsCount = Math.max(0, rival.troopsCount - Math.min(2, attackerWins));
          if (rival.troopsCount <= 0) {
            rival.hasTroops = false;
          }
        }

        if (banner) {
          banner.innerHTML = `
            <div style="color:#8bc34a;font-weight:800;font-size:0.95rem;margin-bottom:0.25rem;">
              ¡VICTORIA DEL ATACANTE! (${attackerWins} a ${defenderWins})
            </div>
            <div style="color:#d1c2ba;font-size:0.8rem;">
              Las legiones superaron a ${rival.name}. Botín capturado: +5 Materiales, +2 ADN y +1 Victoria Táctica Militar (+1 PV).
            </div>
          `;
        }

        toast('¡Victoria T.E.G.!', `Incursión victoriosa contra ${rival.name} (+1 Victoria Militar).`, 'success');
        log(`Combate T.E.G. contra ${rival.name}: Victoria (${attackerWins} a ${defenderWins}). Botín capturado.`);
      } else if (defenderWins > attackerWins) {
        playSound('defeat');
        if (banner) {
          banner.innerHTML = `
            <div style="color:#ef4444;font-weight:800;font-size:0.95rem;margin-bottom:0.25rem;">
              RECHAZO DEFENSIVO (${defenderWins} a ${attackerWins})
            </div>
            <div style="color:#d1c2ba;font-size:0.8rem;">
              La defensa de ${rival.name} repelió la acometida. Tus tropas se repliegan tácticamente al nido.
            </div>
          `;
        }

        toast('Acometida Repelida', `La defensa de ${rival.name} resistió el asalto.`, 'warning');
        log(`Combate T.E.G. contra ${rival.name}: Repliegue táctico (${attackerWins} vs ${defenderWins}).`);
      } else {
        playSound('tap');
        if (banner) {
          banner.innerHTML = `
            <div style="color:#f59e0b;font-weight:800;font-size:0.95rem;margin-bottom:0.25rem;">
              EMPATE TÁCTICO GLOBAL (${attackerWins} a ${defenderWins}, ${ties} empates)
            </div>
            <div style="color:#d1c2ba;font-size:0.8rem;">
              Fuerzas equilibradas en el choque. Ningún bando obtuvo ventaja decisiva en esta tirada.
            </div>
          `;
        }

        toast('Empate en Combate', `Fuerzas igualadas contra ${rival.name}.`, 'info');
        log(`Combate T.E.G. contra ${rival.name}: Choque empatado (${attackerWins} vs ${defenderWins}).`);
      }

      updateAllPV();
      renderHeader();
      populateCombatTargets();
      saveState();
    }, 1100);
  }

  // ==========================================
  // 11. RENDERIZADO GENERAL Y VISTAS
  // ==========================================
  function renderHeader() {
    updateAllPV();
    const res = state.resources;
    document.getElementById('res-food').textContent = `${res.alimento}/${res.alimentoMax}`;
    document.getElementById('res-water').textContent = `${res.agua}/${res.aguaMax}`;
    document.getElementById('res-mat').textContent = `${res.material}/${res.materialMax}`;
    document.getElementById('res-pop').textContent = `${res.poblacion}/${res.poblacionMax} (${res.poblacionLibre} lib.)`;
    document.getElementById('res-dna').textContent = `${res.adn} ADN`;
    document.getElementById('res-vp').textContent = `${res.puntosVictoria} PV`;

    document.getElementById('header-ap-text').textContent = `${state.actionPoints}/${state.maxActionPoints} AP`;
    const dotsContainer = document.getElementById('header-ap-dots');
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      for (let i = 0; i < state.maxActionPoints; i++) {
        const dot = document.createElement('span');
        dot.className = `ap-dot ${i < state.actionPoints ? 'active' : ''}`;
        dotsContainer.appendChild(dot);
      }
    }

    const currentSeason = SEASONS[state.seasonIndex];
    const sName = document.getElementById('sidebar-season-name');
    const sDesc = document.getElementById('sidebar-season-desc');
    const tSeason = document.getElementById('ticker-season');
    const tVp = document.getElementById('ticker-vp');
    const tTurn = document.getElementById('ticker-turn');

    if (sName) sName.textContent = currentSeason;
    if (sDesc) sDesc.textContent = `Año ${state.year} · Ronda ${state.round}`;
    if (tSeason) tSeason.textContent = `${currentSeason} - Año ${state.year} (Ronda ${state.round})`;
    if (tVp) tVp.textContent = `${res.puntosVictoria} PV Totales`;
    if (tTurn) tTurn.textContent = `Turno ${state.turn}`;

    updatePlayerTargetableStatus();
    renderPVScoreboard();
    renderRivals();
    updateTurnTimerDisplay();
  }

  function renderNest() {
    renderColonyPhysicalGrid();

    const grid = document.getElementById('nest-chambers-grid');
    if (!grid) return;
    grid.innerHTML = '';

    state.chambers.forEach(c => {
      const card = document.createElement('div');
      card.className = 'chamber-card';
      card.innerHTML = `
        <div class="chamber-name">
          <span>${c.name}</span>
          <span style="font-size:0.75rem;color:#f06536;font-weight:700;">Nv. ${c.level}/${c.maxLevel}</span>
        </div>
        <div style="font-size:0.68rem;color:#38bdf8;margin-bottom:0.4rem;">Estrato: ${c.stratum}</div>
        <div class="chamber-desc">${c.desc}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:0.75rem;">
          <span style="font-size:0.75rem;color:#ffcaa3;">Coste: ${c.level * 3} Materiales (+1 PV)</span>
          <button type="button" class="btn-action ${c.level >= c.maxLevel ? '' : 'btn-primary-action'}" data-upgrade-chamber="${c.id}" ${c.level >= c.maxLevel ? 'disabled style="opacity:0.5;"' : ''}>
            <span class="material-symbols-outlined" style="font-size:16px;">upgrade</span>
            <span>${c.level >= c.maxLevel ? 'Nivel Máximo' : 'Mejorar (-1 AP)'}</span>
          </button>
        </div>
      `;

      const upBtn = card.querySelector(`[data-upgrade-chamber="${c.id}"]`);
      if (upBtn && c.level < c.maxLevel) {
        upBtn.addEventListener('click', () => {
          if (!isPlayerTurn()) {
            toast('Turno del Rival', 'Solo puedes mejorar cámaras durante tu turno.', 'warning');
            return;
          }
          const cost = c.level * 3;
          if (state.resources.material < cost) {
            toast('Falta Material', `Necesitas ${cost} Materiales para mejorar esta cámara.`, 'warning');
            return;
          }
          if (!consumeAP(1)) return;
          state.resources.material -= cost;
          c.level += 1;
          playSound('victory');
          toast('Cámara Mejorada', `${c.name} subió a Nivel ${c.level} (+1 PV).`, 'success');
          log(`Arquitectura subterránea: ${c.name} mejorada a nivel ${c.level}.`);
          updateAllPV();
          renderHeader();
          renderNest();
          saveState();
        });
      }

      grid.appendChild(card);
    });
  }

  function renderGenetics() {
    ensureColonyBuildings();

    const unlockedMutations = (state.mutations || []).filter(m => m.unlocked);
    const activeBadge = document.getElementById('genetics-active-badge');
    if (activeBadge) {
      activeBadge.textContent = `${unlockedMutations.length}/${state.mutations.length} Asimiladas (+${unlockedMutations.length} PV)`;
    }

    // Renderizar panel de bonos activos de investigación
    const bonusesContainer = document.getElementById('genetics-active-bonuses-list');
    if (bonusesContainer) {
      bonusesContainer.innerHTML = '';
      if (unlockedMutations.length === 0) {
        bonusesContainer.innerHTML = `
          <div class="genetics-no-bonuses">
            <span class="material-symbols-outlined" style="font-size:24px;color:#f06536;margin-bottom:0.3rem;">biotech</span>
            <div>No hay investigaciones genéticas asimiladas aún.</div>
            <div style="font-size:0.75rem;color:#a8968d;margin-top:0.2rem;">
              Juega cartas de tipo "Investigación" desde tu mano gastando 1 AP o asimílalas con ADN en el catálogo inferior. Las investigaciones son de <strong>efecto único y no acumulable</strong>.
            </div>
          </div>
        `;
      } else {
        unlockedMutations.forEach(m => {
          const item = document.createElement('div');
          item.className = 'genetics-bonus-item';
          item.innerHTML = `
            <div class="bonus-item-header">
              <span class="bonus-item-name">🧬 ${m.name}</span>
              <span class="bonus-item-tag">ACTIVO (+1 PV)</span>
            </div>
            <div class="bonus-item-effect">${m.effect}</div>
            <div class="bonus-item-unique-notice">🛡️ Investigación única · Bono permanente no acumulable</div>
          `;
          bonusesContainer.appendChild(item);
        });
      }
    }

    // Renderizar tarjetas de mutaciones
    const grids = [
      document.getElementById('genetics-mutations-grid'),
      document.getElementById('genetics-grid')
    ].filter(Boolean);

    grids.forEach(grid => {
      grid.innerHTML = '';
      state.mutations.forEach(m => {
        const card = document.createElement('div');
        card.className = `mutation-card ${m.unlocked ? 'unlocked' : ''}`;
        card.innerHTML = `
          <div class="mutation-name">
            <span>${m.name}</span>
            <span style="font-size:0.7rem;color:${m.unlocked ? '#bef264' : '#f06536'};font-weight:700;">
              ${m.unlocked ? 'ASIMILADO (+1 PV)' : `Requiere ${m.cost} ADN`}
            </span>
          </div>
          <div class="mutation-effect">${m.effect}</div>
          <div style="font-size:0.7rem;color:#a8968d;margin-top:0.35rem;font-style:italic;">
            ${m.unlocked ? 'Efecto permanente único activo.' : 'Efecto único: no acumulable tras asimilar.'}
          </div>
          <div style="display:flex;justify-content:flex-end;margin-top:0.75rem;">
            <button type="button" class="btn-action ${m.unlocked ? '' : 'btn-primary-action'}" data-unlock-mutation="${m.id}" ${m.unlocked ? 'disabled style="opacity:0.5;"' : ''}>
              <span class="material-symbols-outlined" style="font-size:16px;">${m.unlocked ? 'check_circle' : 'biotech'}</span>
              <span>${m.unlocked ? 'Asimilado' : 'Asimilar (-1 AP)'}</span>
            </button>
          </div>
        `;

        const btn = card.querySelector(`[data-unlock-mutation="${m.id}"]`);
        if (btn && !m.unlocked) {
          btn.addEventListener('click', () => {
            if (!isPlayerTurn()) {
              toast('Turno del Rival', 'Solo puedes asimilar mutaciones en tu turno.', 'warning');
              return;
            }
            if (state.resources.adn < m.cost) {
              toast('Falta ADN', `Necesitas ${m.cost} ADN evolutivo para desbloquear esta mutación.`, 'warning');
              return;
            }
            if (!consumeAP(1)) return;
            state.resources.adn -= m.cost;
            m.unlocked = true;
            playSound('victory');
            toast('¡Mutación Asimilada!', `${m.name}: ${m.effect} (+1 PV). Investigación única activa.`, 'success');
            log(`Evolución genética: Mutación asimilada "${m.name}" (+1 PV).`);
            updateAllPV();
            renderHeader();
            renderGenetics();
            renderTacticalHand();
            saveState();
          });
        }

        grid.appendChild(card);
      });
    });
  }

  function renderCastes() {
    const grid = document.getElementById('castes-grid');
    if (!grid) return;
    grid.innerHTML = '';

    Object.keys(state.castes).forEach(k => {
      const caste = state.castes[k];
      const card = document.createElement('div');
      card.className = 'caste-card';
      card.innerHTML = `
        <div class="caste-name">
          <span>${caste.name}</span>
          <span style="font-size:0.85rem;color:#eae1dd;font-weight:800;">${caste.count}</span>
        </div>
        <div class="caste-role">${caste.role}</div>
        <div style="font-size:0.75rem;color:#ffcaa3;margin-top:0.4rem;">
          Coste: ${caste.costFood} Alimento, ${caste.costMat} Material (+1 Población libre)
        </div>
        <div style="display:flex;justify-content:flex-end;margin-top:0.75rem;">
          <button type="button" class="btn-action btn-primary-action" data-recruit-caste="${k}">
            <span class="material-symbols-outlined" style="font-size:16px;">add</span>
            <span>Reclutar (-1 AP)</span>
          </button>
        </div>
      `;

      card.querySelector(`[data-recruit-caste="${k}"]`).addEventListener('click', () => {
        if (!isPlayerTurn()) {
          toast('Turno del Rival', 'Solo puedes reclutar castas durante tu turno.', 'warning');
          return;
        }
        if (state.resources.poblacionLibre < 1) {
          toast('Sin Larvas Libres', 'No tienes población libre. Alimenta a la Reina para que ponga más larvas.', 'warning');
          return;
        }
        if (state.resources.alimento < caste.costFood || state.resources.material < caste.costMat) {
          toast('Recursos Insuficientes', `Reclutar requiere ${caste.costFood} Alimento y ${caste.costMat} Material.`, 'warning');
          return;
        }
        if (!consumeAP(1)) return;
        state.resources.alimento -= caste.costFood;
        state.resources.material -= caste.costMat;
        state.resources.poblacionLibre -= 1;
        caste.count += 1;
        playSound('chit');
        toast('Casta Reclutada', `+1 ${caste.name} incorporada al enjambre.`, 'success');
        log(`Reclutamiento militar: Nueva unidad de ${caste.name} desplegada.`);
        updateAllPV();
        renderHeader();
        renderCastes();
        saveState();
      });

      grid.appendChild(card);
    });
  }

  function renderLogs() {
    const list = document.getElementById('log-entries-list');
    if (!list) return;
    list.innerHTML = '';
    state.logs.forEach(item => {
      const div = document.createElement('div');
      div.style.cssText = 'padding:0.4rem 0;border-bottom:1px solid #332b26;display:flex;gap:0.5rem;font-size:0.75rem;';
      div.innerHTML = `<span style="color:#ffb59d;font-family:monospace;">[${item.time}]</span> <span style="color:#eae1dd;">${item.text}</span>`;
      list.appendChild(div);
    });
  }

  // ==========================================
  // 12. CICLO DE TURNO SECUENCIAL Y ESTACIONES
  // ==========================================
  function passTurn() {
    if (!isPlayerTurn()) {
      toast('Turno del Rival', `Es el turno de ${getActivePlayer().name}. Espera a que concluyan sus movimientos.`, 'info');
      return;
    }

    const limit = getHandLimitAtTurnEnd();
    const isAutumn = SEASONS[state.seasonIndex] === 'Otoño';
    if (state.hand.length > limit) {
      toast('Límite de Fin de Turno', `Tienes ${state.hand.length} cartas en mano. Al terminar tu turno debes conservar como máximo ${limit} cartas ${isAutumn ? '(en Otoño: 7 cartas)' : '(5 cartas)'}. Resuelve el descarte o canje.`, 'warning');
      openDiscardModal();
      return;
    }

    closeDiscardModal();
    log(`Paso voluntario de turno: Cedido el mando al siguiente jugador.`);
    advanceTurn();
  }

  function advanceTurn() {
    if (aiTurnTimeout) {
      clearTimeout(aiTurnTimeout);
      aiTurnTimeout = null;
    }

    const currentIndex = TURN_PLAYERS.indexOf(state.activePlayerId);
    const nextIndex = (currentIndex + 1) % TURN_PLAYERS.length;
    const nextPlayerId = TURN_PLAYERS[nextIndex];

    if (nextPlayerId === 'player') {
      startPlayerTurn();
    } else {
      startRivalTurn(nextPlayerId);
    }
  }

  function startPlayerTurn() {
    state.activePlayerId = 'player';
    state.turn += 1;
    state.actionPoints = state.maxActionPoints;
    state.turnTimeRemaining = 90;

    // Producción pasiva de nido
    const foodGain = 4;
    const waterGain = 3;
    const matGain = 2;
    state.resources.alimento = Math.min(state.resources.alimentoMax, state.resources.alimento + foodGain);
    state.resources.agua = Math.min(state.resources.aguaMax, state.resources.agua + waterGain);
    state.resources.material = Math.min(state.resources.materialMax, state.resources.material + matGain);

    // Consumo por población
    const consumption = Math.ceil(state.resources.poblacion / 6);
    state.resources.alimento = Math.max(0, state.resources.alimento - consumption);
    state.resources.agua = Math.max(0, state.resources.agua - consumption);

    // Progreso estacional (cada 3 rondas)
    if (state.turn % 3 === 0) {
      state.round += 1;
      state.seasonIndex = (state.seasonIndex + 1) % SEASONS.length;
      if (state.seasonIndex === 0) {
        state.year += 1;
        toast('¡Año Nuevo!', `Comienza el Año ${state.year}. La colonia resiste el ciclo natural.`, 'success');
      }
      toast('Cambio de Estación', `Ha comenzado ${SEASONS[state.seasonIndex]} del Año ${state.year}.`, 'primary');
      log(`Ciclo estacional: Ingresando en ${SEASONS[state.seasonIndex]} (Año ${state.year}).`);
    }

    // Regla: Se roban 2 cartas al inicio de cada turno del jugador
    drawTacticalCard(false);
    drawTacticalCard(false);

    playSound('turn');
    toast('¡Tu Turno!', `Inicio de turno: 2 cartas robadas a tu mano. Puntos de Acción restaurados a ${state.maxActionPoints} AP. 90 segundos disponibles.`, 'success');
    log(`Turno ${state.turn}: Tu turno ha comenzado. Robadas 2 cartas al inicio del turno.`);

    updateAllPV();
    renderHeader();
    renderNest();
    renderCastes();
    renderGenetics();
    renderTerritoryBoard();
    renderInspector();
    renderTacticalHand();
    renderRivals();
    renderPVScoreboard();
    startTurnTimer();
    saveState();
  }

  function startRivalTurn(rivalId) {
    state.activePlayerId = rivalId;
    state.turnTimeRemaining = 90;

    const rival = (state.rivals || []).find(r => r.id === rivalId);
    if (!rival) {
      advanceTurn();
      return;
    }

    rival.actionPoints = rival.maxActionPoints;

    playSound('turn');
    toast(`Turno de: ${rival.name}`, 'La IA rival está actuando. Puedes examinar tu colonia y planificar tu estrategia.', 'info');
    log(`Turno de rival: ${rival.name} inicia sus acciones.`);

    updateAllPV();
    renderHeader();
    renderRivals();
    renderPVScoreboard();
    startTurnTimer();
    saveState();

    // Simulación secuencial de la IA
    aiTurnTimeout = setTimeout(() => {
      executeRivalActions(rival);
      updateAllPV();
      renderHeader();
      renderRivals();
      renderPVScoreboard();
      saveState();

      aiTurnTimeout = setTimeout(() => {
        advanceTurn();
      }, 2500);
    }, 1800);
  }

  function executeRivalActions(rival) {
    const actions = [
      {
        type: 'build',
        actionDesc: `El jugador ${rival.name} está construyendo nuevas galerías subterráneas...`,
        apply: () => {
          rival.lastAction = 'Construyendo galería de almacenamiento';
          rival.resources.material = Math.max(0, rival.resources.material - 3);
          rival.chambersCount = (rival.chambersCount || 3) + 1;
          rival.actionPoints = Math.max(0, rival.actionPoints - 1);
        }
      },
      {
        type: 'gather',
        actionDesc: `El jugador ${rival.name} está recolectando recursos en el sotobosque...`,
        apply: () => {
          rival.lastAction = 'Forrajeando y cosechando néctar';
          rival.resources.alimento += 5;
          rival.resources.agua += 4;
          rival.actionPoints = Math.max(0, rival.actionPoints - 1);
        }
      },
      {
        type: 'recruit',
        actionDesc: `El jugador ${rival.name} está metamorfoseando nuevas legiones de combate...`,
        apply: () => {
          rival.lastAction = 'Adiestrando soldados mayores';
          rival.hasTroops = true;
          rival.troopsCount = (rival.troopsCount || 0) + 2;
          rival.populationTotal += 2;
          rival.actionPoints = Math.max(0, rival.actionPoints - 1);
        }
      },
      {
        type: 'mutate',
        actionDesc: `El jugador ${rival.name} está mutando su código biológico...`,
        apply: () => {
          rival.lastAction = 'Evolucionando glándulas cáusticas';
          rival.resources.adn = Math.max(0, rival.resources.adn - 2);
          rival.actionPoints = Math.max(0, rival.actionPoints - 1);
        }
      }
    ];

    const chosen = actions[Math.floor(Math.random() * actions.length)];
    chosen.apply();

    showRivalNotification(`Inteligencia: ${chosen.actionDesc}`);
    log(`Inteligencia: ${chosen.actionDesc}`);
  }

  function skipAiTurn() {
    if (isPlayerTurn()) return;
    if (aiTurnTimeout) {
      clearTimeout(aiTurnTimeout);
      aiTurnTimeout = null;
    }
    const activeRival = (state.rivals || []).find(r => r.id === state.activePlayerId);
    if (activeRival) {
      executeRivalActions(activeRival);
    }
    advanceTurn();
  }

  // ==========================================
  // 13. EVENT LISTENERS E INICIALIZACIÓN
  // ==========================================
  function initEvents() {
    // Cambio de pantallas (Navegación)
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        playSound('tap');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        const target = item.getAttribute('data-screen');
        document.querySelectorAll('.view-screen').forEach(scr => scr.classList.remove('active'));
        const activeScr = document.getElementById(`screen-${target}`);
        if (activeScr) activeScr.classList.add('active');

        document.getElementById('app-sidebar').classList.remove('open');
      });
    });

    // Menú hamburguesa móvil
    document.getElementById('mobile-menu-btn').addEventListener('click', () => {
      document.getElementById('app-sidebar').classList.toggle('open');
    });

    // Botón pasar turno
    document.getElementById('btn-pass-turn').addEventListener('click', passTurn);

    // Botón mute de sonido
    document.getElementById('btn-toggle-sound').addEventListener('click', () => {
      isMuted = !isMuted;
      const icon = document.getElementById('sound-icon');
      icon.textContent = isMuted ? 'volume_off' : 'volume_up';
      toast(isMuted ? 'Sonido Silenciado' : 'Sonido Activado', 'Efectos de audio sintetizados.', 'info');
    });

    // Modales: Reglas, Log, Test, Desglose PV
    document.getElementById('btn-open-rules').addEventListener('click', () => {
      document.getElementById('rules-modal').classList.add('active');
    });
    document.getElementById('btn-open-logs').addEventListener('click', () => {
      document.getElementById('logs-modal').classList.add('active');
    });
    document.getElementById('btn-open-test').addEventListener('click', () => {
      document.getElementById('test-modal').classList.add('active');
    });

    // Desglose de PV al hacer clic en las píldoras de PV
    const vpPill = document.getElementById('res-vp-pill');
    if (vpPill) vpPill.addEventListener('click', openPVBreakdownModal);
    const tickerVp = document.getElementById('ticker-vp');
    if (tickerVp) tickerVp.addEventListener('click', openPVBreakdownModal);

    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
      });
    });

    // Botón robar carta táctica (-1 AP)
    const handleDrawAction = () => {
      if (!isPlayerTurn()) {
        toast('Turno del Rival', 'Solo puedes robar cartas en tu turno.', 'warning');
        return;
      }
      if (!consumeAP(1)) return;
      drawTacticalCard(true);
    };

    const btnDrawCard = document.getElementById('btn-draw-card');
    if (btnDrawCard) {
      btnDrawCard.addEventListener('click', handleDrawAction);
    }

    const physDeckDraw = document.getElementById('physical-deck-draw');
    if (physDeckDraw) {
      physDeckDraw.addEventListener('click', handleDrawAction);
    }

    const physDeckDiscard = document.getElementById('physical-deck-discard');
    if (physDeckDiscard) {
      physDeckDiscard.addEventListener('click', () => {
        openDiscardModal();
      });
    }

    // Plegar / Desplegar Muelle de Cartas en Mano
    const btnToggleHand = document.getElementById('btn-toggle-hand-dock');
    const tabletopHandDock = document.getElementById('tabletop-hand-dock');
    const handToggleIcon = document.getElementById('hand-toggle-icon');
    const handToggleLabel = document.getElementById('hand-toggle-label');

    if (btnToggleHand && tabletopHandDock) {
      btnToggleHand.addEventListener('click', () => {
        tabletopHandDock.classList.toggle('is-minimized');
        const isMin = tabletopHandDock.classList.contains('is-minimized');
        if (handToggleIcon) {
          handToggleIcon.textContent = isMin ? 'expand_less' : 'expand_more';
        }
        if (handToggleLabel) {
          handToggleLabel.textContent = isMin ? `Ver Mano (${state.hand.length})` : 'Ocultar Mano';
        }
        playSound('tap');
      });
    }

    // Botón abrir modal de descarte desde la alerta de exceso
    const btnOpenDiscardAlert = document.getElementById('btn-open-discard-from-alert');
    if (btnOpenDiscardAlert) {
      btnOpenDiscardAlert.addEventListener('click', openDiscardModal);
    }

    // Zonas de Soltado Tácticas en Pantalla (.tabletop-drop-zone)
    document.querySelectorAll('.tabletop-drop-zone').forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        if (!activeDraggedCard) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        zone.classList.add('drop-zone-hover');
      });

      zone.addEventListener('dragleave', () => {
        zone.classList.remove('drop-zone-hover');
      });

      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drop-zone-hover');
        const cardUid = e.dataTransfer ? e.dataTransfer.getData('text/plain') : null;
        const cardObj = (cardUid && state.hand.find(c => c.uid === cardUid)) || activeDraggedCard;
        if (!cardObj) return;

        if (cardObj.category === 'building') {
          startBuildingPlacement(cardObj);
        } else {
          playTacticalCard(cardObj.uid);
        }
      });
    });

    // Selector de cantidad de tropas para combate T.E.G. (1, 2, 3)
    document.querySelectorAll('.btn-troop-choice').forEach(b => {
      b.addEventListener('click', () => {
        const troops = parseInt(b.getAttribute('data-troops'), 10);
        selectedAttackerTroops = troops;
        updateTroopChoiceButtons();
        playSound('tap');
      });
    });

    // Botón de lanzamiento de dados de choque T.E.G.
    const rollBtn = document.getElementById('btn-roll-combat');
    if (rollBtn) {
      rollBtn.addEventListener('click', rollCombatTEG);
    }

    // Botón para saltar turno de IA
    const skipAiBtn = document.getElementById('btn-skip-ai-turn');
    if (skipAiBtn) {
      skipAiBtn.addEventListener('click', skipAiTurn);
    }

    // Botones de cancelar modo colocación y tránsito de la colonia
    const cancelPlacementBtn = document.getElementById('btn-cancel-placement');
    if (cancelPlacementBtn) {
      cancelPlacementBtn.addEventListener('click', () => {
        state.pendingBuildingPlacement = null;
        renderColonyPhysicalGrid();
        toast('Construcción Cancelada', 'Se ha cancelado el modo de colocación.', 'info');
      });
    }

    const cancelTransitBtn = document.getElementById('btn-cancel-transit');
    if (cancelTransitBtn) {
      cancelTransitBtn.addEventListener('click', () => {
        state.troopTransitOrigin = null;
        renderColonyPhysicalGrid();
        toast('Tránsito Cancelado', 'Se ha cancelado la orden de tránsito.', 'info');
      });
    }

    // Inspector de Sectores del Mapa
    document.getElementById('btn-inspector-march').addEventListener('click', () => {
      if (!isPlayerTurn()) {
        toast('Turno del Rival', `Es el turno de ${getActivePlayer().name}. Solo puedes observar tu colonia.`, 'warning');
        return;
      }
      const sector = (state.sectors || []).find(s => s.id === state.selectedSectorId);
      if (!sector) return;
      if (!consumeAP(1)) return;
      sector.control = Math.min(100, (sector.control || 0) + 20);
      sector.squads = (sector.squads || 0) + 1;
      toast('Marcha Táctica', `Escuadrón apostado en "${sector.name}". Control subió a ${sector.control}%.`, 'primary');
      log(`Marcha: Refuerzo apostado en "${sector.name}" (-1 AP).`);
      renderTerritoryBoard();
      renderInspector();
    });

    document.getElementById('btn-inspector-gather').addEventListener('click', () => {
      if (!isPlayerTurn()) {
        toast('Turno del Rival', `Es el turno de ${getActivePlayer().name}. Solo puedes observar tu colonia.`, 'warning');
        return;
      }
      const sector = (state.sectors || []).find(s => s.id === state.selectedSectorId);
      if (!sector) return;
      if (!consumeAP(1)) return;
      state.resources.material = Math.min(state.resources.materialMax, state.resources.material + 3);
      state.resources.alimento = Math.min(state.resources.alimentoMax, state.resources.alimento + 2);
      toast('Exploración Exitosa', `Recolectados +3 Materiales y +2 Alimentos en "${sector.name}".`, 'success');
      log(`Recolección en "${sector.name}": +3 Materiales, +2 Alimento (-1 AP).`);
      updateAllPV();
      renderHeader();
    });

    document.getElementById('btn-inspector-combat').addEventListener('click', () => {
      if (!isPlayerTurn()) {
        toast('Turno del Rival', 'Solo puedes lanzar ataques tácticos durante tu turno.', 'warning');
        return;
      }
      openCombat();
    });

    // Excavación en Nido
    document.getElementById('btn-excavate-chamber').addEventListener('click', () => {
      if (!isPlayerTurn()) {
        toast('Turno del Rival', `Es el turno de ${getActivePlayer().name}. Solo puedes observar tu colonia.`, 'warning');
        return;
      }
      if (state.resources.material < 3) {
        toast('Falta Material', 'Excavar requiere 3 Materiales de nido.', 'warning');
        return;
      }
      if (!consumeAP(1)) return;
      state.resources.material -= 3;
      state.resources.poblacionMax += 3;
      playSound('victory');
      toast('¡Cámara Excavada!', 'Nueva galería profunda completada: +3 Capacidad de Población (+1 PV).', 'success');
      log('Excavación de estrato: Nueva galería abierta (+3 Capacidad, +1 PV por edificación).');
      showRivalNotification('Notificación de Actividad: Tu colonia está construyendo una galería subterránea...');

      updateAllPV();
      renderHeader();
      saveState();
    });

    // Alimentar a la Reina
    document.getElementById('btn-feed-queen').addEventListener('click', () => {
      if (!isPlayerTurn()) {
        toast('Turno del Rival', `Es el turno de ${getActivePlayer().name}. Solo puedes observar tu colonia.`, 'warning');
        return;
      }
      if (state.resources.alimento < 3) {
        toast('Falta Alimento', 'Se requieren 3 porciones de alimento para alimentar a la Reina.', 'warning');
        return;
      }
      if (!consumeAP(1)) return;
      state.resources.alimento -= 3;
      state.resources.poblacionLibre += 2;
      state.resources.poblacion = Math.min(state.resources.poblacionMax, state.resources.poblacion + 2);
      playSound('chit');
      toast('Postura Real Fértil', 'La Reina ha nutrido a las larvas: +2 Obreras jóvenes (+1 PV por población viva).', 'success');
      log('Cuidado Real: Reina alimentada, eclosionan +2 obreras libres.');
      updateAllPV();
      renderHeader();
      saveState();
    });

    // Botón cerrar y cancelar modal de descarte
    const btnCloseDiscard = document.getElementById('btn-close-discard-modal');
    if (btnCloseDiscard) {
      btnCloseDiscard.addEventListener('click', closeDiscardModal);
    }
    const btnCancelDiscard = document.getElementById('btn-cancel-discard');
    if (btnCancelDiscard) {
      btnCancelDiscard.addEventListener('click', closeDiscardModal);
    }
    const btnConfirmPassTurn = document.getElementById('btn-confirm-pass-turn');
    if (btnConfirmPassTurn) {
      btnConfirmPassTurn.addEventListener('click', () => {
        const limit = getHandLimitAtTurnEnd();
        if (state.hand.length <= limit) {
          closeDiscardModal();
          log('Paso voluntario de turno tras resolver descarte de mano.');
          advanceTurn();
        } else {
          toast('Límite No Alcanzado', `Aún tienes ${state.hand.length} cartas. Debes quedar con máximo ${limit}.`, 'warning');
        }
      });
    }

    // Acciones del Banco de Pruebas (Test Modal)
    const testDraw2 = document.getElementById('test-btn-draw-2');
    if (testDraw2) {
      testDraw2.addEventListener('click', () => {
        drawTacticalCard(false);
        drawTacticalCard(false);
        toast('+2 Cartas Robadas', 'Se añadieron 2 cartas a tu mano para testeo.', 'primary');
      });
    }

    const testSetAutumn = document.getElementById('test-btn-set-autumn');
    if (testSetAutumn) {
      testSetAutumn.addEventListener('click', () => {
        state.seasonIndex = 2; // Otoño
        toast('Estación Forzada: Otoño', 'Ahora la estación es Otoño (+2 cartas extra: 7 máx en mano).', 'warning');
        renderHeader();
        renderTacticalHand();
        saveState();
      });
    }

    const testOverfill = document.getElementById('test-btn-overfill-hand');
    if (testOverfill) {
      testOverfill.addEventListener('click', () => {
        drawTacticalCard(false);
        drawTacticalCard(false);
        drawTacticalCard(false);
        drawTacticalCard(false);
        toast('Mano Sobrellenada', `Tienes ${state.hand.length} cartas en mano para probar el descarte al terminar turno.`, 'info');
      });
    }

    document.getElementById('test-btn-boost').addEventListener('click', () => {
      state.resources.alimento = state.resources.alimentoMax;
      state.resources.agua = state.resources.aguaMax;
      state.resources.material = state.resources.materialMax;
      state.resources.adn += 15;
      state.actionPoints = 5;
      state.maxActionPoints = 5;
      playSound('victory');
      toast('Recursos Recargados', 'Almacenes al 100%, +15 ADN y 5 AP para pruebas.', 'success');
      updateAllPV();
      renderHeader();
      saveState();
    });

    document.getElementById('test-btn-ap').addEventListener('click', () => {
      state.actionPoints += 3;
      playSound('tap');
      toast('+3 AP Añadidos', 'Puntos de Acción extra para testeo.', 'primary');
      renderHeader();
      saveState();
    });

    document.getElementById('test-btn-unlock-all').addEventListener('click', () => {
      state.mutations.forEach(m => m.unlocked = true);
      playSound('victory');
      toast('Genoma Completo', 'Todas las mutaciones desbloqueadas para testeo (+5 PV).', 'success');
      updateAllPV();
      renderHeader();
      renderGenetics();
      saveState();
    });

    document.getElementById('test-btn-reset').addEventListener('click', () => {
      localStorage.removeItem('evolia_save_state');
      state = JSON.parse(JSON.stringify(defaultState));
      state.deck = createShuffledDeck();
      state.hand = [];
      state.discard = [];
      for (let i = 0; i < 3; i++) {
        state.hand.push(state.deck.pop());
      }
      playSound('turn');
      toast('Partida Reiniciada', 'Todos los valores restablecidos al inicio.', 'info');
      updateAllPV();
      renderHeader();
      renderTerritoryBoard();
      renderInspector();
      renderTacticalHand();
      renderNest();
      renderGenetics();
      renderCastes();
      renderLogs();
      renderPVScoreboard();
      renderRivals();
      startTurnTimer();
    });
  }

  // ==========================================
  // 14. INICIALIZACIÓN GLOBAL
  // ==========================================
  window.addEventListener('DOMContentLoaded', () => {
    updateAllPV();
    renderHeader();
    renderTerritoryBoard();
    renderInspector();
    renderTacticalHand();
    renderNest();
    renderGenetics();
    renderCastes();
    renderLogs();
    renderPVScoreboard();
    renderRivals();
    initEvents();
    startTurnTimer();
  });
})();
