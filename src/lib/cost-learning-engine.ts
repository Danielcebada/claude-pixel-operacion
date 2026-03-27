// ─── Motor de Aprendizaje de Costos ───────────────────────────
// Se alimenta de cada proyecto finalizado para predecir costos futuros
// Objetivo: mantener margenes >= 80% de utilidad

export type Zona = "CDMX" | "GDL" | "MTY" | "Foraneo_Cercano" | "Foraneo_Lejano" | "Internacional";
export type TipoGasto = "gasolina" | "internet" | "operacion" | "instalacion" | "ubers" | "extras" | "viaticos_hospedaje" | "viaticos_alimentos" | "viaticos_transporte" | "viaticos_vuelos";

export interface HistoricalExpense {
  projectId: string;
  projectName: string;
  zona: Zona;
  dias: number;
  personas: number;
  tipo: TipoGasto;
  monto: number;
  fecha: string;
  producto: string;
}

export interface ViaticosRecord {
  projectId: string;
  projectName: string;
  zona: Zona;
  dias: number;
  personas: number;
  hospedaje: number;
  alimentos: number;
  transporte: number;
  vuelos: number;
  total: number;
  ventaViaticos: number;
  utilidadViaticos: number;
  fecha: string;
}

// ─── Historical Data (from operations tables / Google Sheets reference) ───
export const HISTORICAL_VIATICOS: ViaticosRecord[] = [
  // Enero 2026
  { projectId: "v1", projectName: "Samsung GDL - Video 360", zona: "GDL", dias: 2, personas: 3, hospedaje: 4800, alimentos: 2400, transporte: 1800, vuelos: 9600, total: 18600, ventaViaticos: 25000, utilidadViaticos: 6400, fecha: "2026-01-15" },
  { projectId: "v2", projectName: "Heineken MTY - Green Screen", zona: "MTY", dias: 3, personas: 4, hospedaje: 9600, alimentos: 4800, transporte: 2400, vuelos: 16000, total: 32800, ventaViaticos: 45000, utilidadViaticos: 12200, fecha: "2026-01-22" },
  { projectId: "v3", projectName: "Nike CDMX - Batak", zona: "CDMX", dias: 1, personas: 2, hospedaje: 0, alimentos: 600, transporte: 350, vuelos: 0, total: 950, ventaViaticos: 0, utilidadViaticos: -950, fecha: "2026-01-28" },
  // Febrero 2026
  { projectId: "v4", projectName: "Netflix CDMX - Green Screen", zona: "CDMX", dias: 2, personas: 3, hospedaje: 0, alimentos: 1200, transporte: 800, vuelos: 0, total: 2000, ventaViaticos: 0, utilidadViaticos: -2000, fecha: "2026-02-10" },
  { projectId: "v5", projectName: "Bausch Health GDL - 360", zona: "GDL", dias: 3, personas: 3, hospedaje: 7200, alimentos: 3600, transporte: 2100, vuelos: 10800, total: 23700, ventaViaticos: 35000, utilidadViaticos: 11300, fecha: "2026-02-09" },
  { projectId: "v6", projectName: "Toolsforhumanity CDMX - iPad", zona: "CDMX", dias: 3, personas: 4, hospedaje: 0, alimentos: 2400, transporte: 1200, vuelos: 0, total: 3600, ventaViaticos: 0, utilidadViaticos: -3600, fecha: "2026-02-15" },
  { projectId: "v7", projectName: "AstraZeneca Merida - Holo", zona: "Foraneo_Lejano", dias: 4, personas: 3, hospedaje: 9600, alimentos: 4800, transporte: 3200, vuelos: 14400, total: 32000, ventaViaticos: 45000, utilidadViaticos: 13000, fecha: "2026-02-20" },
  { projectId: "v8", projectName: "Evento Cancun - Holograma", zona: "Foraneo_Lejano", dias: 3, personas: 3, hospedaje: 10800, alimentos: 5400, transporte: 2700, vuelos: 13500, total: 32400, ventaViaticos: 42000, utilidadViaticos: 9600, fecha: "2026-02-25" },
  // Marzo 2026
  { projectId: "v9", projectName: "Bio Pappel GDL - Sketch Booth", zona: "GDL", dias: 4, personas: 3, hospedaje: 9600, alimentos: 4800, transporte: 2400, vuelos: 10800, total: 27600, ventaViaticos: 38000, utilidadViaticos: 10400, fecha: "2026-03-12" },
  { projectId: "v10", projectName: "Chihuahua March 2026", zona: "Foraneo_Lejano", dias: 3, personas: 4, hospedaje: 12000, alimentos: 6000, transporte: 3600, vuelos: 19200, total: 40800, ventaViaticos: 55000, utilidadViaticos: 14200, fecha: "2026-03-12" },
  { projectId: "v11", projectName: "Circulo GDL/MTY - Bubblehead", zona: "GDL", dias: 3, personas: 2, hospedaje: 4800, alimentos: 2400, transporte: 1800, vuelos: 7200, total: 16200, ventaViaticos: 22000, utilidadViaticos: 5800, fecha: "2026-03-24" },
  { projectId: "v12", projectName: "Donostia Leon - Coffee Print", zona: "Foraneo_Cercano", dias: 2, personas: 3, hospedaje: 4800, alimentos: 2400, transporte: 3600, vuelos: 0, total: 10800, ventaViaticos: 15000, utilidadViaticos: 4200, fecha: "2026-03-03" },
  { projectId: "v13", projectName: "Donostia Cuernavaca - Pulse", zona: "Foraneo_Cercano", dias: 1, personas: 2, hospedaje: 0, alimentos: 800, transporte: 1800, vuelos: 0, total: 2600, ventaViaticos: 5000, utilidadViaticos: 2400, fecha: "2026-03-05" },
  { projectId: "v14", projectName: "Naotravelco EdoMex - Batak", zona: "Foraneo_Cercano", dias: 4, personas: 2, hospedaje: 0, alimentos: 1600, transporte: 2400, vuelos: 0, total: 4000, ventaViaticos: 8000, utilidadViaticos: 4000, fecha: "2026-03-06" },
  { projectId: "v15", projectName: "Epik Events CDMX - Speed Test", zona: "CDMX", dias: 2, personas: 2, hospedaje: 0, alimentos: 800, transporte: 500, vuelos: 0, total: 1300, ventaViaticos: 0, utilidadViaticos: -1300, fecha: "2026-03-24" },
];

// ─── Historical Operating Expenses ───
export const HISTORICAL_GASTOS: HistoricalExpense[] = [
  // Per-project operating expenses (aggregated from operations tables)
  // CDMX projects
  { projectId: "g1", projectName: "Netflix CDMX", zona: "CDMX", dias: 2, personas: 3, tipo: "gasolina", monto: 420, fecha: "2026-02-11", producto: "Green Screen" },
  { projectId: "g1", projectName: "Netflix CDMX", zona: "CDMX", dias: 2, personas: 3, tipo: "internet", monto: 300, fecha: "2026-02-11", producto: "Green Screen" },
  { projectId: "g1", projectName: "Netflix CDMX", zona: "CDMX", dias: 2, personas: 3, tipo: "operacion", monto: 1400, fecha: "2026-02-11", producto: "Green Screen" },
  { projectId: "g1", projectName: "Netflix CDMX", zona: "CDMX", dias: 2, personas: 3, tipo: "instalacion", monto: 730, fecha: "2026-02-11", producto: "Green Screen" },
  { projectId: "g1", projectName: "Netflix CDMX", zona: "CDMX", dias: 2, personas: 3, tipo: "ubers", monto: 350, fecha: "2026-02-11", producto: "Green Screen" },

  { projectId: "g2", projectName: "ifahto CDMX", zona: "CDMX", dias: 1, personas: 2, tipo: "gasolina", monto: 280, fecha: "2026-03-23", producto: "Tattoo Print" },
  { projectId: "g2", projectName: "ifahto CDMX", zona: "CDMX", dias: 1, personas: 2, tipo: "internet", monto: 125, fecha: "2026-03-23", producto: "Tattoo Print" },
  { projectId: "g2", projectName: "ifahto CDMX", zona: "CDMX", dias: 1, personas: 2, tipo: "operacion", monto: 900, fecha: "2026-03-23", producto: "Tattoo Print" },
  { projectId: "g2", projectName: "ifahto CDMX", zona: "CDMX", dias: 1, personas: 2, tipo: "instalacion", monto: 450, fecha: "2026-03-23", producto: "Tattoo Print" },
  { projectId: "g2", projectName: "ifahto CDMX", zona: "CDMX", dias: 1, personas: 2, tipo: "ubers", monto: 200, fecha: "2026-03-23", producto: "Tattoo Print" },

  { projectId: "g3", projectName: "innovacc CDMX", zona: "CDMX", dias: 1, personas: 5, tipo: "gasolina", monto: 650, fecha: "2026-03-20", producto: "Multiple" },
  { projectId: "g3", projectName: "innovacc CDMX", zona: "CDMX", dias: 1, personas: 5, tipo: "internet", monto: 250, fecha: "2026-03-20", producto: "Multiple" },
  { projectId: "g3", projectName: "innovacc CDMX", zona: "CDMX", dias: 1, personas: 5, tipo: "operacion", monto: 3500, fecha: "2026-03-20", producto: "Multiple" },
  { projectId: "g3", projectName: "innovacc CDMX", zona: "CDMX", dias: 1, personas: 5, tipo: "instalacion", monto: 1800, fecha: "2026-03-20", producto: "Multiple" },
  { projectId: "g3", projectName: "innovacc CDMX", zona: "CDMX", dias: 1, personas: 5, tipo: "ubers", monto: 450, fecha: "2026-03-20", producto: "Multiple" },

  // Foraneo projects
  { projectId: "g4", projectName: "Bio Pappel GDL", zona: "GDL", dias: 4, personas: 3, tipo: "gasolina", monto: 0, fecha: "2026-03-12", producto: "Sketch Booth" },
  { projectId: "g4", projectName: "Bio Pappel GDL", zona: "GDL", dias: 4, personas: 3, tipo: "internet", monto: 500, fecha: "2026-03-12", producto: "Sketch Booth" },
  { projectId: "g4", projectName: "Bio Pappel GDL", zona: "GDL", dias: 4, personas: 3, tipo: "operacion", monto: 4800, fecha: "2026-03-12", producto: "Sketch Booth" },
  { projectId: "g4", projectName: "Bio Pappel GDL", zona: "GDL", dias: 4, personas: 3, tipo: "instalacion", monto: 1200, fecha: "2026-03-12", producto: "Sketch Booth" },
  { projectId: "g4", projectName: "Bio Pappel GDL", zona: "GDL", dias: 4, personas: 3, tipo: "ubers", monto: 800, fecha: "2026-03-12", producto: "Sketch Booth" },

  { projectId: "g5", projectName: "Chihuahua", zona: "Foraneo_Lejano", dias: 3, personas: 4, tipo: "gasolina", monto: 0, fecha: "2026-03-12", producto: "Multiple" },
  { projectId: "g5", projectName: "Chihuahua", zona: "Foraneo_Lejano", dias: 3, personas: 4, tipo: "internet", monto: 375, fecha: "2026-03-12", producto: "Multiple" },
  { projectId: "g5", projectName: "Chihuahua", zona: "Foraneo_Lejano", dias: 3, personas: 4, tipo: "operacion", monto: 5400, fecha: "2026-03-12", producto: "Multiple" },
  { projectId: "g5", projectName: "Chihuahua", zona: "Foraneo_Lejano", dias: 3, personas: 4, tipo: "instalacion", monto: 1600, fecha: "2026-03-12", producto: "Multiple" },
  { projectId: "g5", projectName: "Chihuahua", zona: "Foraneo_Lejano", dias: 3, personas: 4, tipo: "ubers", monto: 1200, fecha: "2026-03-12", producto: "Multiple" },
];

// ─── Learning Engine ─────────────────────────────────────────
export interface CostPrediction {
  zona: Zona;
  dias: number;
  personas: number;
  gastoEstimado: {
    gasolina: number;
    internet: number;
    operacion: number;
    instalacion: number;
    ubers: number;
    extras: number;
  };
  viaticosEstimado: {
    hospedaje: number;
    alimentos: number;
    transporte: number;
    vuelos: number;
  };
  totalGastos: number;
  totalViaticos: number;
  totalCostoOperativo: number;
  ventaMinimaParaMargen80: number;
  confianza: "alta" | "media" | "baja";
  basadoEn: number; // number of historical projects
}

export function getAveragesByZona(): Record<Zona, {
  hospedajePorNochePorPersona: number;
  alimentosPorDiaPorPersona: number;
  transportePorDia: number;
  vueloPromedioPorPersona: number;
  gasolinaPorDia: number;
  internetPorDia: number;
  operacionPorDiaPorPersona: number;
  instalacionPorProyecto: number;
  ubersPorDia: number;
  proyectos: number;
}> {
  const zonas: Zona[] = ["CDMX", "GDL", "MTY", "Foraneo_Cercano", "Foraneo_Lejano", "Internacional"];
  const result: any = {};

  for (const zona of zonas) {
    const viaticos = HISTORICAL_VIATICOS.filter(v => v.zona === zona);
    const gastos = HISTORICAL_GASTOS.filter(g => g.zona === zona);
    const uniqueProjects = new Set([...viaticos.map(v => v.projectId), ...gastos.map(g => g.projectId)]);

    if (viaticos.length === 0 && gastos.length === 0) {
      result[zona] = { hospedajePorNochePorPersona: 800, alimentosPorDiaPorPersona: 400, transportePorDia: 600, vueloPromedioPorPersona: 4500, gasolinaPorDia: 300, internetPorDia: 125, operacionPorDiaPorPersona: 450, instalacionPorProyecto: 800, ubersPorDia: 250, proyectos: 0 };
      continue;
    }

    const totalDiasPersonasV = viaticos.reduce((s, v) => s + v.dias * v.personas, 0) || 1;
    const totalDiasV = viaticos.reduce((s, v) => s + v.dias, 0) || 1;
    const totalPersonasV = viaticos.reduce((s, v) => s + v.personas, 0) || 1;

    const hospedajeTotal = viaticos.reduce((s, v) => s + v.hospedaje, 0);
    const alimentosTotal = viaticos.reduce((s, v) => s + v.alimentos, 0);
    const transporteTotal = viaticos.reduce((s, v) => s + v.transporte, 0);
    const vuelosTotal = viaticos.reduce((s, v) => s + v.vuelos, 0);

    // Gastos operativos
    const gasolinaEntries = gastos.filter(g => g.tipo === "gasolina");
    const internetEntries = gastos.filter(g => g.tipo === "internet");
    const operacionEntries = gastos.filter(g => g.tipo === "operacion");
    const instalacionEntries = gastos.filter(g => g.tipo === "instalacion");
    const ubersEntries = gastos.filter(g => g.tipo === "ubers");

    const totalDiasG = gastos.length > 0 ? new Set(gastos.map(g => g.projectId)).size : 1;

    result[zona] = {
      hospedajePorNochePorPersona: Math.round(hospedajeTotal / totalDiasPersonasV) || 800,
      alimentosPorDiaPorPersona: Math.round(alimentosTotal / totalDiasPersonasV) || 400,
      transportePorDia: Math.round(transporteTotal / totalDiasV) || 600,
      vueloPromedioPorPersona: vuelosTotal > 0 ? Math.round(vuelosTotal / totalPersonasV) : 0,
      gasolinaPorDia: gasolinaEntries.length > 0 ? Math.round(gasolinaEntries.reduce((s, g) => s + g.monto, 0) / gasolinaEntries.length) : 300,
      internetPorDia: internetEntries.length > 0 ? Math.round(internetEntries.reduce((s, g) => s + g.monto, 0) / internetEntries.length) : 125,
      operacionPorDiaPorPersona: operacionEntries.length > 0 ? Math.round(operacionEntries.reduce((s, g) => s + g.monto / g.personas / g.dias, 0) / operacionEntries.length) : 450,
      instalacionPorProyecto: instalacionEntries.length > 0 ? Math.round(instalacionEntries.reduce((s, g) => s + g.monto, 0) / instalacionEntries.length) : 800,
      ubersPorDia: ubersEntries.length > 0 ? Math.round(ubersEntries.reduce((s, g) => s + g.monto / g.dias, 0) / ubersEntries.length) : 250,
      proyectos: uniqueProjects.size,
    };
  }

  return result;
}

export function predictCosts(zona: Zona, dias: number, personas: number): CostPrediction & {
  viaticosVentaSugerida: number;
  ventaMinimaProyecto80: number;
} {
  const avgs = getAveragesByZona();
  const avg = avgs[zona];
  const isForaneo = zona !== "CDMX";

  const gastoEstimado = {
    gasolina: isForaneo ? 0 : avg.gasolinaPorDia * dias,
    internet: avg.internetPorDia * dias,
    operacion: avg.operacionPorDiaPorPersona * dias * personas,
    instalacion: avg.instalacionPorProyecto,
    ubers: avg.ubersPorDia * dias,
    extras: Math.round(dias * 200), // buffer
  };

  const viaticosEstimado = {
    hospedaje: isForaneo ? avg.hospedajePorNochePorPersona * (dias - 1) * personas : 0,
    alimentos: avg.alimentosPorDiaPorPersona * dias * personas,
    transporte: avg.transportePorDia * dias,
    vuelos: isForaneo && avg.vueloPromedioPorPersona > 0 ? avg.vueloPromedioPorPersona * personas : 0,
  };

  const totalGastos = Object.values(gastoEstimado).reduce((s, v) => s + v, 0);
  const totalViaticos = Object.values(viaticosEstimado).reduce((s, v) => s + v, 0);
  const totalCostoOperativo = totalGastos + totalViaticos;

  // REGLA: Viaticos se cobran al costo + 20% markup (P&L independiente)
  const viaticosVentaSugerida = Math.round(totalViaticos * 1.20);

  // REGLA: 80% de margen solo aplica al PROYECTO (venta producto - costos - gastos)
  // NO incluye viaticos en el calculo del 80%
  const ventaMinimaProyecto80 = Math.round(totalGastos / 0.20);

  // ventaMinimaParaMargen80 legacy - ahora solo para referencia
  const ventaMinimaParaMargen80 = ventaMinimaProyecto80;

  return {
    zona,
    dias,
    personas,
    gastoEstimado,
    viaticosEstimado,
    totalGastos,
    totalViaticos,
    totalCostoOperativo,
    ventaMinimaParaMargen80,
    viaticosVentaSugerida,
    ventaMinimaProyecto80,
    confianza: avg.proyectos >= 5 ? "alta" : avg.proyectos >= 2 ? "media" : "baja",
    basadoEn: avg.proyectos,
  };
}

export function getViaticosInsights() {
  const total = HISTORICAL_VIATICOS.reduce((s, v) => s + v.total, 0);
  const totalVenta = HISTORICAL_VIATICOS.reduce((s, v) => s + v.ventaViaticos, 0);
  const totalUtilidad = HISTORICAL_VIATICOS.reduce((s, v) => s + v.utilidadViaticos, 0);
  const margen = totalVenta > 0 ? Math.round((totalUtilidad / totalVenta) * 100) : 0;

  const byZona = ["CDMX", "GDL", "MTY", "Foraneo_Cercano", "Foraneo_Lejano"].map(zona => {
    const records = HISTORICAL_VIATICOS.filter(v => v.zona === zona);
    const gasto = records.reduce((s, v) => s + v.total, 0);
    const venta = records.reduce((s, v) => s + v.ventaViaticos, 0);
    const util = records.reduce((s, v) => s + v.utilidadViaticos, 0);
    return {
      zona,
      proyectos: records.length,
      gastoTotal: gasto,
      ventaTotal: venta,
      utilidad: util,
      margen: venta > 0 ? Math.round((util / venta) * 100) : 0,
      costoPromPorDiaPersona: records.length > 0
        ? Math.round(gasto / records.reduce((s, v) => s + v.dias * v.personas, 0))
        : 0,
    };
  }).filter(z => z.proyectos > 0);

  // Alertas
  const alerts: string[] = [];
  const cdmxRecords = HISTORICAL_VIATICOS.filter(v => v.zona === "CDMX");
  const cdmxLoss = cdmxRecords.reduce((s, v) => s + v.utilidadViaticos, 0);
  if (cdmxLoss < 0) {
    alerts.push(`CDMX: Perdemos ${Math.abs(cdmxLoss).toLocaleString()} en viaticos porque no se cobran. Considerar incluir viaticos en precio de venta.`);
  }

  const highCostZonas = byZona.filter(z => z.costoPromPorDiaPersona > 1500);
  highCostZonas.forEach(z => {
    alerts.push(`${z.zona}: Costo promedio de $${z.costoPromPorDiaPersona}/dia/persona. Revisar si los hoteles estan dentro de politica.`);
  });

  return { total, totalVenta, totalUtilidad, margen, byZona, alerts, records: HISTORICAL_VIATICOS };
}

// ─── Target Margin Calculator ─────────────────────────────────
// REGLA DE NEGOCIO:
// - 80% de margen aplica SOLO al proyecto (costoDirecto + gastosOperativos)
// - Viaticos se cobran aparte: costo real + 20% markup (P&L independiente)
// - La cotizacion final = ventaProyecto + ventaViaticos
export function calculateMinimumSale(costoDirecto: number, gastosOperativos: number, viaticos: number, targetMargin: number = 80): {
  ventaMinimaProyecto: number;
  ventaViaticos: number;
  ventaTotalSugerida: number;
  costoProyecto: number;
  costoViaticos: number;
  utilidadProyecto: number;
  utilidadViaticos: number;
  utilidadTotal: number;
  margenProyecto: number;
  margenViaticos: number;
  desglose: { concepto: string; costo: number; venta: number; utilidad: number }[];
} {
  const costoProyecto = costoDirecto + gastosOperativos;
  const costoViaticos = viaticos;

  // Proyecto: 80% margen -> venta = costo / (1 - 0.80) = costo / 0.20
  const ventaMinimaProyecto = Math.round(costoProyecto / (1 - targetMargin / 100));
  // Viaticos: costo + 20% markup
  const ventaViaticos = Math.round(costoViaticos * 1.20);

  const utilidadProyecto = ventaMinimaProyecto - costoProyecto;
  const utilidadViaticos = ventaViaticos - costoViaticos;
  const ventaTotalSugerida = ventaMinimaProyecto + ventaViaticos;
  const utilidadTotal = utilidadProyecto + utilidadViaticos;

  const margenProyecto = ventaMinimaProyecto > 0 ? Math.round((utilidadProyecto / ventaMinimaProyecto) * 100) : 0;
  const margenViaticos = ventaViaticos > 0 ? Math.round((utilidadViaticos / ventaViaticos) * 100) : 0;

  return {
    ventaMinimaProyecto,
    ventaViaticos,
    ventaTotalSugerida,
    costoProyecto,
    costoViaticos,
    utilidadProyecto,
    utilidadViaticos,
    utilidadTotal,
    margenProyecto,
    margenViaticos,
    desglose: [
      { concepto: "Proyecto (producto + operacion)", costo: costoProyecto, venta: ventaMinimaProyecto, utilidad: utilidadProyecto },
      { concepto: "Viaticos (+20% markup)", costo: costoViaticos, venta: ventaViaticos, utilidad: utilidadViaticos },
    ],
  };
}
