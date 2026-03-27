// Deals GANADOS Marzo 2026 - Extraidos de HubSpot (2026-03-26)
// Total: 57 deals | Revenue: $4,267,958 MXN
// Ultima actualizacion: 26 Mar 2026

export interface HubspotDeal {
  id: string;
  hubspot_id: number;
  dealname: string;
  amount: number;
  closedate: string;
  owner_id: number;
  owner_name: string;
  source: string;
  source_detail: string;
  pipeline_stage: string;
}

export const VENDEDORES = [
  { id: 26395721, name: "Pricila Dominguez", role: "vendedor", color: "#8b5cf6" },
  { id: 26405238, name: "Daniel Cebada", role: "director", color: "#3b82f6" },
  { id: 414692018, name: "Gabriela Gutierrez", role: "vendedor", color: "#ec4899" },
  { id: 618845046, name: "Maria Gaytan", role: "vendedor", color: "#f59e0b" },
  { id: 88208161, name: "Erick Jimenez", role: "vendedor", color: "#10b981" },
  { id: 80956812, name: "Roxana Mendoza", role: "vendedor", color: "#ef4444" },
];

export const MARZO_DEALS: HubspotDeal[] = [
  { id: "h1", hubspot_id: 56987585565, dealname: "arquitectoma.com.mx - Photo booth CDMX", amount: 9800, closedate: "2026-03-26", owner_id: 26395721, owner_name: "Pricila Dominguez", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h2", hubspot_id: 56709280942, dealname: "Itera Process - Fortuna 2 dias CDMX", amount: 59280, closedate: "2026-03-25", owner_id: 414692018, owner_name: "Gabriela Gutierrez", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h3", hubspot_id: 54314033209, dealname: "Circulo - bubblehead CDMX/GDL/MTY", amount: 195480, closedate: "2026-03-24", owner_id: 80956812, owner_name: "Roxana Mendoza", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h4", hubspot_id: 58254433940, dealname: "Epik Events - Speed Test 2 dias CDMX", amount: 50280, closedate: "2026-03-24", owner_id: 26395721, owner_name: "Pricila Dominguez", source: "OFFLINE", source_detail: "EXTENSION", pipeline_stage: "GANADO" },
  { id: "h5", hubspot_id: 56889245827, dealname: "tuspartners.mx FEMSA - Meta human", amount: 27660, closedate: "2026-03-23", owner_id: 80956812, owner_name: "Roxana Mendoza", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h6", hubspot_id: 58136130890, dealname: "innovacc.com.mx - Super kick, Soccer, Batak", amount: 260880, closedate: "2026-03-23", owner_id: 618845046, owner_name: "Maria Gaytan", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h7", hubspot_id: 57865678966, dealname: "LBN - Cabina cerrada con impresion CDMX", amount: 38220, closedate: "2026-03-23", owner_id: 80956812, owner_name: "Roxana Mendoza", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h8", hubspot_id: 56896777906, dealname: "ifahto - tatto print CDMX", amount: 106240, closedate: "2026-03-23", owner_id: 618845046, owner_name: "Maria Gaytan", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h9", hubspot_id: 58208811448, dealname: "Ninchcompany - Impresion de Stickers CDMX", amount: 115000, closedate: "2026-03-23", owner_id: 414692018, owner_name: "Gabriela Gutierrez", source: "DIRECT_TRAFFIC", source_detail: "meetings.hubspot.com", pipeline_stage: "GANADO" },
  { id: "h10", hubspot_id: 58025430424, dealname: "DM Producciones - Mirror Booth + Football CDMX", amount: 109700, closedate: "2026-03-20", owner_id: 26395721, owner_name: "Pricila Dominguez", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h11", hubspot_id: 58208813447, dealname: "Mankuerna - batak tubular CDMX", amount: 18600, closedate: "2026-03-20", owner_id: 26395721, owner_name: "Pricila Dominguez", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h12", hubspot_id: 57941098299, dealname: "TOLKA Estudio - Robots", amount: 30200, closedate: "2026-03-20", owner_id: 26405238, owner_name: "Daniel Cebada", source: "OFFLINE", source_detail: "SALES", pipeline_stage: "GANADO" },
  { id: "h13", hubspot_id: 58208318642, dealname: "Egoz.mx - varias 20 de marzo", amount: 91920, closedate: "2026-03-20", owner_id: 26405238, owner_name: "Daniel Cebada", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h14", hubspot_id: 58136065325, dealname: "ROYAL FOKER - Ipad Booth con Impresion CDMX", amount: 14600, closedate: "2026-03-19", owner_id: 414692018, owner_name: "Gabriela Gutierrez", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h15", hubspot_id: 56709745153, dealname: "Grupo Match - Ipadbooth 4 dias", amount: 62644, closedate: "2026-03-18", owner_id: 618845046, owner_name: "Maria Gaytan", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h16", hubspot_id: 56611845653, dealname: "Grupo Match - ipadbooth CDMX", amount: 43270, closedate: "2026-03-18", owner_id: 618845046, owner_name: "Maria Gaytan", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h17", hubspot_id: 57100464698, dealname: "Seedtag - Barra de cafe 100 personas CDMX", amount: 23300, closedate: "2026-03-18", owner_id: 26395721, owner_name: "Pricila Dominguez", source: "DIRECT_TRAFFIC", source_detail: "meetings.hubspot.com", pipeline_stage: "GANADO" },
  { id: "h18", hubspot_id: 57855715648, dealname: "zeb.mx - Desarrollo de VR CDMX", amount: 218820, closedate: "2026-03-17", owner_id: 414692018, owner_name: "Gabriela Gutierrez", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h19", hubspot_id: 58025322287, dealname: "innovacc.com.mx - Super kick, Soccer, Green Screen CDMX", amount: 228780, closedate: "2026-03-17", owner_id: 618845046, owner_name: "Maria Gaytan", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h20", hubspot_id: 57865651882, dealname: "Proyectos Publicos - Ipad booth CDMX", amount: 12600, closedate: "2026-03-17", owner_id: 414692018, owner_name: "Gabriela Gutierrez", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h21", hubspot_id: 58029861797, dealname: "NINJA* - 24 de marzo", amount: 42140, closedate: "2026-03-17", owner_id: 26405238, owner_name: "Daniel Cebada", source: "OFFLINE", source_detail: "SALES", pipeline_stage: "GANADO" },
  { id: "h22", hubspot_id: 57610393475, dealname: "gsglogistica - meta human CDMX", amount: 26160, closedate: "2026-03-17", owner_id: 618845046, owner_name: "Maria Gaytan", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h23", hubspot_id: 57938963876, dealname: "grupozima.net", amount: 15156, closedate: "2026-03-13", owner_id: 618845046, owner_name: "Maria Gaytan", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h24", hubspot_id: 55624234640, dealname: "Bio Pappel - sketch booth 4 dias GDL", amount: 152584, closedate: "2026-03-12", owner_id: 80956812, owner_name: "Roxana Mendoza", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h25", hubspot_id: 57938994437, dealname: "pixelplay.com.mx", amount: 38600, closedate: "2026-03-12", owner_id: 26395721, owner_name: "Pricila Dominguez", source: "OFFLINE", source_detail: "EXTENSION", pipeline_stage: "GANADO" },
  { id: "h26", hubspot_id: 57856035933, dealname: "Chihuahua March 2026", amount: 140000, closedate: "2026-03-12", owner_id: 26405238, owner_name: "Daniel Cebada", source: "OFFLINE", source_detail: "EXTENSION", pipeline_stage: "GANADO" },
  { id: "h27", hubspot_id: 57856244888, dealname: "Glam bot CDMX", amount: 38200, closedate: "2026-03-12", owner_id: 26395721, owner_name: "Pricila Dominguez", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h28", hubspot_id: 57093692590, dealname: "Elitegroups - COFFEE PRINT CDMX", amount: 29880, closedate: "2026-03-11", owner_id: 88208161, owner_name: "Erick Jimenez", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h29", hubspot_id: 57865670792, dealname: "Smile Pill - Garrita y Matcha CDMX", amount: 23100, closedate: "2026-03-11", owner_id: 26395721, owner_name: "Pricila Dominguez", source: "OFFLINE", source_detail: "EXTENSION", pipeline_stage: "GANADO" },
  { id: "h30", hubspot_id: 57539048276, dealname: "iEvents - totem interactivo CDMX", amount: 32140, closedate: "2026-03-11", owner_id: 618845046, owner_name: "Maria Gaytan", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h31", hubspot_id: 56574872744, dealname: "OMA Media - tatto print CDMX", amount: 30980, closedate: "2026-03-10", owner_id: 618845046, owner_name: "Maria Gaytan", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h32", hubspot_id: 57539473565, dealname: "Sense Step Toluca", amount: 24100, closedate: "2026-03-09", owner_id: 26395721, owner_name: "Pricila Dominguez", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h33", hubspot_id: 54609971621, dealname: "JOURNEY - Glam bot y sketch CDMX", amount: 24600, closedate: "2026-03-09", owner_id: 80956812, owner_name: "Roxana Mendoza", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h34", hubspot_id: 57030417698, dealname: "Naotravelco - batak, fortuna 4 dias EdoMex", amount: 96840, closedate: "2026-03-06", owner_id: 80956812, owner_name: "Roxana Mendoza", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h35", hubspot_id: 57030476625, dealname: "Brocoli", amount: 44040, closedate: "2026-03-05", owner_id: 618845046, owner_name: "Maria Gaytan", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h36", hubspot_id: 57553442739, dealname: "Jogo Bonito 7 de marzo", amount: 373830, closedate: "2026-03-05", owner_id: 26405238, owner_name: "Daniel Cebada", source: "OFFLINE", source_detail: "EXTENSION", pipeline_stage: "GANADO" },
  { id: "h37", hubspot_id: 55454969165, dealname: "Privado - Claw Machine CDMX", amount: 21600, closedate: "2026-03-05", owner_id: 618845046, owner_name: "Maria Gaytan", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h38", hubspot_id: 57601792364, dealname: "Donostia Chevrolet - Pulse Challenge Cuernavaca", amount: 25920, closedate: "2026-03-05", owner_id: 80956812, owner_name: "Roxana Mendoza", source: "OFFLINE", source_detail: "PRESENTATIONS", pipeline_stage: "GANADO" },
  { id: "h39", hubspot_id: 57030417047, dealname: "AstraZeneca - Houston Merida Holo", amount: 365240, closedate: "2026-03-04", owner_id: 26405238, owner_name: "Daniel Cebada", source: "OFFLINE", source_detail: "EXTENSION", pipeline_stage: "GANADO" },
  { id: "h40", hubspot_id: 51663034929, dealname: "cuatrof.mx - holograma 3 dias Cancun", amount: 138936, closedate: "2026-03-04", owner_id: 618845046, owner_name: "Maria Gaytan", source: "OFFLINE", source_detail: "CONTACTS", pipeline_stage: "GANADO" },
  { id: "h41", hubspot_id: 56136046130, dealname: "Motorola - Juego para Liverpool Web", amount: 165000, closedate: "2026-03-04", owner_id: 414692018, owner_name: "Gabriela Gutierrez", source: "OFFLINE", source_detail: "EXTENSION", pipeline_stage: "GANADO" },
  { id: "h42", hubspot_id: 57030515108, dealname: "Agencia Descorche - Subsoccer CDMX", amount: 23600, closedate: "2026-03-04", owner_id: 26395721, owner_name: "Pricila Dominguez", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h43", hubspot_id: 56574887564, dealname: "crs21.com - Atlas CDMX", amount: 39980, closedate: "2026-03-03", owner_id: 414692018, owner_name: "Gabriela Gutierrez", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h44", hubspot_id: 57451847205, dealname: "Donostia - Coffe print barra de cafe Leon GTO", amount: 74240, closedate: "2026-03-03", owner_id: 80956812, owner_name: "Roxana Mendoza", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h45", hubspot_id: 51317341074, dealname: "ifahto - Tatto Print 3 dias CDMX", amount: 50080, closedate: "2026-03-03", owner_id: 618845046, owner_name: "Maria Gaytan", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h46", hubspot_id: 57200825877, dealname: "Igency - Cabina Cerrada 2 dias CDMX", amount: 78900, closedate: "2026-03-03", owner_id: 414692018, owner_name: "Gabriela Gutierrez", source: "OFFLINE", source_detail: "EXTENSION", pipeline_stage: "GANADO" },
  { id: "h47", hubspot_id: 57019222064, dealname: "dalecandela.mx - Laser y cabina mdf", amount: 103702, closedate: "2026-03-03", owner_id: 26405238, owner_name: "Daniel Cebada", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h48", hubspot_id: 57351005472, dealname: "FollowmeHealthcare - Batak Tubular hora extra", amount: 1800, closedate: "2026-03-02", owner_id: 26395721, owner_name: "Pricila Dominguez", source: "OFFLINE", source_detail: "CONTACTS", pipeline_stage: "GANADO" },
  { id: "h49", hubspot_id: 57350998309, dealname: "Freelance - Sense Step CDMX", amount: 20000, closedate: "2026-03-02", owner_id: 414692018, owner_name: "Gabriela Gutierrez", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h50", hubspot_id: 32728209440, dealname: "podcaste endevour", amount: 100000, closedate: "2026-03-02", owner_id: 26405238, owner_name: "Daniel Cebada", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h51", hubspot_id: 57021643907, dealname: "Igency - Mirror Booth + Green Screen CDMX", amount: 113860, closedate: "2026-03-02", owner_id: 414692018, owner_name: "Gabriela Gutierrez", source: "OFFLINE", source_detail: "SALES", pipeline_stage: "GANADO" },
  { id: "h52", hubspot_id: 57347328077, dealname: "Gonzalezhelfon - Ipad booth CDMX", amount: 16600, closedate: "2026-03-02", owner_id: 414692018, owner_name: "Gabriela Gutierrez", source: "OFFLINE", source_detail: "EXTENSION", pipeline_stage: "GANADO" },
  { id: "h53", hubspot_id: 56460953449, dealname: "Marketen - Coffee Print + Ipad Booth CDMX", amount: 38400, closedate: "2026-03-02", owner_id: 414692018, owner_name: "Gabriela Gutierrez", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h54", hubspot_id: 56289501812, dealname: "somospuntoyaparte.mx - Credenciales AI 5 dias", amount: 162310, closedate: "2026-03-02", owner_id: 618845046, owner_name: "Maria Gaytan", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h55", hubspot_id: 57939173808, dealname: "Demo", amount: 10, closedate: "2026-03-12", owner_id: 26405238, owner_name: "Daniel Cebada", source: "OFFLINE", source_detail: "SALES", pipeline_stage: "GANADO" },
  { id: "h56", hubspot_id: 58406472810, dealname: "innovacc.com.mx - Trivia 2 botones CDMX", amount: 32080, closedate: "2026-03-26", owner_id: 618845046, owner_name: "Maria Gaytan", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
  { id: "h57", hubspot_id: 58254365982, dealname: "Potenttial Group - Dax CDMX", amount: 26800, closedate: "2026-03-26", owner_id: 414692018, owner_name: "Gabriela Gutierrez", source: "OFFLINE", source_detail: "CRM_UI", pipeline_stage: "GANADO" },
];

// ─── Computed Analytics ────────────────────────────────
export function getMarzoAnalytics() {
  const deals = MARZO_DEALS.filter(d => d.amount > 100); // exclude demo
  const totalRevenue = deals.reduce((s, d) => s + d.amount, 0);
  const totalDeals = deals.length;
  const avgTicket = Math.round(totalRevenue / totalDeals);

  // By vendor
  const byVendor = VENDEDORES.map(v => {
    const vendorDeals = deals.filter(d => d.owner_id === v.id);
    const revenue = vendorDeals.reduce((s, d) => s + d.amount, 0);
    const count = vendorDeals.length;
    const avg = count > 0 ? Math.round(revenue / count) : 0;
    const pct = Math.round((revenue / totalRevenue) * 1000) / 10;
    const maxDeal = vendorDeals.reduce((max, d) => d.amount > max.amount ? d : max, { amount: 0, dealname: "" } as HubspotDeal);
    return { ...v, deals: count, revenue, avg, pct, maxDeal: maxDeal.dealname, maxDealAmount: maxDeal.amount };
  }).filter(v => v.deals > 0).sort((a, b) => b.revenue - a.revenue);

  // By week
  const byWeek = [
    { week: "Sem 1 (1-7 mar)", start: "2026-03-01", end: "2026-03-07" },
    { week: "Sem 2 (8-14 mar)", start: "2026-03-08", end: "2026-03-14" },
    { week: "Sem 3 (15-21 mar)", start: "2026-03-15", end: "2026-03-21" },
    { week: "Sem 4 (22-31 mar)", start: "2026-03-22", end: "2026-03-31" },
  ].map(w => {
    const weekDeals = deals.filter(d => d.closedate >= w.start && d.closedate <= w.end);
    return { ...w, deals: weekDeals.length, revenue: weekDeals.reduce((s, d) => s + d.amount, 0) };
  });

  // Top 10 deals
  const topDeals = [...deals].sort((a, b) => b.amount - a.amount).slice(0, 10);

  // Daily accumulation
  const dailyData: { date: string; revenue: number; cumulative: number; deals: number }[] = [];
  const sorted = [...deals].sort((a, b) => a.closedate.localeCompare(b.closedate));
  let cumulative = 0;
  const dateMap = new Map<string, { revenue: number; deals: number }>();
  sorted.forEach(d => {
    const existing = dateMap.get(d.closedate) || { revenue: 0, deals: 0 };
    dateMap.set(d.closedate, { revenue: existing.revenue + d.amount, deals: existing.deals + 1 });
  });
  for (const [date, data] of Array.from(dateMap.entries()).sort()) {
    cumulative += data.revenue;
    dailyData.push({ date, revenue: data.revenue, cumulative, deals: data.deals });
  }

  return { totalRevenue, totalDeals, avgTicket, byVendor, byWeek, topDeals, dailyData };
}
