"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Megaphone,
  PenTool,
  Calendar,
  Sparkles,
  Target,
  Image as ImageIcon,
  Video,
  FileText,
  Globe,
  Send,
  Clock,
  CheckCircle,
  TrendingUp,
  Eye,
  Heart,
  Copy,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Zap,
  Palette,
  Layout,
  Type,
  Hash,
  BarChart3,
  RefreshCw,
  Download,
  Edit3,
  BookOpen,
  Wand2,
  Layers,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MARKETING_PROMPTS, CONTENT_CALENDAR, type ContentDay } from "@/lib/marketing-config";

// ─── Types ──────────────────────────────────────────
type PostStatus = "borrador" | "revision" | "aprobado" | "programado" | "publicado";
type Platform = "instagram" | "facebook" | "linkedin" | "tiktok" | "x";
type ContentFormat = "reel" | "carrusel" | "story" | "post" | "video" | "live";

interface Publication {
  id: string;
  title: string;
  content: string;
  platforms: Platform[];
  format: ContentFormat;
  status: PostStatus;
  scheduledDate?: string;
  scheduledTime?: string;
  author: string;
  hashtags: string[];
  mediaCount: number;
  engagement?: { likes: number; comments: number; shares: number; views: number };
  objective: "alcance" | "confianza" | "ventas";
}

interface Campaign {
  id: string;
  name: string;
  objective: string;
  platforms: Platform[];
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  status: "activa" | "pausada" | "borrador" | "finalizada";
  posts: number;
  reach: number;
  engagement: number;
  leads: number;
}

interface BrandAsset {
  id: string;
  name: string;
  type: "logo" | "template" | "guia" | "tipografia" | "paleta" | "foto";
  format: string;
  lastModified: string;
}

// ─── Platform Config ────────────────────────────────
const PLATFORM_CONFIG: Record<Platform, { name: string; color: string; bg: string; textColor: string }> = {
  instagram: { name: "Instagram", color: "bg-gradient-to-r from-purple-500 to-pink-500", bg: "bg-pink-50", textColor: "text-pink-600" },
  facebook: { name: "Facebook", color: "bg-blue-600", bg: "bg-blue-50", textColor: "text-blue-600" },
  linkedin: { name: "LinkedIn", color: "bg-sky-700", bg: "bg-sky-50", textColor: "text-sky-700" },
  tiktok: { name: "TikTok", color: "bg-black", bg: "bg-gray-50", textColor: "text-gray-800" },
  x: { name: "X / Twitter", color: "bg-gray-900", bg: "bg-gray-50", textColor: "text-gray-800" },
};

const STATUS_CONFIG: Record<PostStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  borrador: { label: "Borrador", color: "bg-gray-100 text-gray-600", icon: Edit3 },
  revision: { label: "En Revision", color: "bg-yellow-100 text-yellow-700", icon: Eye },
  aprobado: { label: "Aprobado", color: "bg-green-100 text-green-700", icon: CheckCircle },
  programado: { label: "Programado", color: "bg-blue-100 text-blue-700", icon: Clock },
  publicado: { label: "Publicado", color: "bg-emerald-100 text-emerald-700", icon: Send },
};

const FORMAT_ICONS: Record<ContentFormat, typeof Video> = {
  reel: Video,
  carrusel: Layers,
  story: ImageIcon,
  post: FileText,
  video: Video,
  live: Zap,
};

// ─── Mock Data ──────────────────────────────────────
const PUBLICATIONS: Publication[] = [
  {
    id: "pub1",
    title: "Behind the scenes: montaje de 360 Booth",
    content: "Cada montaje es una obra de arte en ingeniería ✨ Mira cómo nuestro equipo transforma un espacio vacío en una experiencia inmersiva de 360° en menos de 2 horas.\n\n¿Tu próximo evento necesita el WOW factor? 🎯\n\n#360Booth #EventTech #ExperientialMarketing #BTL #PixelFactory",
    platforms: ["instagram", "tiktok"],
    format: "reel",
    status: "publicado",
    scheduledDate: "2026-03-01",
    author: "Equipo MKT",
    hashtags: ["360Booth", "EventTech", "ExperientialMarketing", "BTL", "PixelFactory"],
    mediaCount: 1,
    engagement: { likes: 847, comments: 23, shares: 45, views: 12400 },
    objective: "alcance",
  },
  {
    id: "pub2",
    title: "3 errores al elegir tecnología para tu evento",
    content: "❌ Error #1: Elegir solo por precio\n❌ Error #2: No considerar el espacio\n❌ Error #3: No pedir demo previa\n\nLa tecnología correcta puede multiplicar x10 la experiencia de tus invitados. La incorrecta puede arruinar todo.\n\nDesliza para saber cómo evitar estos errores →",
    platforms: ["instagram", "linkedin"],
    format: "carrusel",
    status: "publicado",
    scheduledDate: "2026-03-02",
    author: "Equipo MKT",
    hashtags: ["EventPlanning", "Tecnologia", "Eventos", "Tips"],
    mediaCount: 5,
    engagement: { likes: 234, comments: 18, shares: 67, views: 4200 },
    objective: "confianza",
  },
  {
    id: "pub3",
    title: "Caso de éxito: Netflix con Green Screen AI",
    content: "Cuando Netflix nos llamó para su premiere, sabíamos que necesitaban algo ÉPICO 🎬\n\nResultado: Green Screen AI que transportaba a los invitados directo a las escenas de la serie.\n\n📊 +500 fotos generadas\n📊 92% de invitados participaron\n📊 2.3M impresiones en redes\n\n¿Quieres estos resultados? Link en bio 👆",
    platforms: ["instagram", "linkedin", "facebook"],
    format: "video",
    status: "publicado",
    scheduledDate: "2026-03-03",
    author: "Equipo MKT",
    hashtags: ["CasoDeExito", "Netflix", "GreenScreen", "AI", "EventTech"],
    mediaCount: 1,
    engagement: { likes: 1250, comments: 56, shares: 123, views: 28900 },
    objective: "ventas",
  },
  {
    id: "pub4",
    title: "Qué es un Photo AI y por qué lo necesitas",
    content: "La evolución del photobooth ya está aquí 🤖\n\nPhoto AI no solo toma fotos — las transforma con inteligencia artificial en tiempo real.\n\n✅ Estilos artísticos personalizados\n✅ Fondos ilimitados sin green screen\n✅ Branding de marca integrado\n✅ Entrega digital instantánea\n\nEl futuro de la foto en eventos. Ya llegó.",
    platforms: ["instagram", "linkedin"],
    format: "carrusel",
    status: "publicado",
    scheduledDate: "2026-03-04",
    author: "Equipo MKT",
    hashtags: ["PhotoAI", "Innovacion", "EventTech", "Photobooth"],
    mediaCount: 6,
    engagement: { likes: 456, comments: 34, shares: 78, views: 8900 },
    objective: "confianza",
  },
  {
    id: "pub5",
    title: "Reacción de invitados con Mirror Booth",
    content: "La cara de tus invitados cuando ven el Mirror Booth por primera vez 😍🪞\n\nNada supera el momento WOW. Mira estas reacciones reales de eventos recientes.\n\nEl Mirror Booth no es solo una foto — es una EXPERIENCIA.\n\n¿Cuándo es tu próximo evento? 📩",
    platforms: ["instagram", "tiktok"],
    format: "reel",
    status: "programado",
    scheduledDate: "2026-03-06",
    scheduledTime: "12:00",
    author: "Equipo MKT",
    hashtags: ["MirrorBooth", "Reacciones", "EventTech", "WOWFactor"],
    mediaCount: 1,
    objective: "alcance",
  },
  {
    id: "pub6",
    title: "5 productos que transforman cualquier evento",
    content: "No importa el tamaño de tu evento — estos 5 productos lo llevan al siguiente nivel:\n\n1️⃣ 360 Booth — El favorito viral\n2️⃣ Coffee Print — Café + branding\n3️⃣ Sketch Booth — Arte en vivo\n4️⃣ Photo AI — El futuro\n5️⃣ Holograma — El factor WOW\n\nGuarda este post para tu próximo brief 📌",
    platforms: ["instagram", "linkedin", "facebook"],
    format: "carrusel",
    status: "programado",
    scheduledDate: "2026-03-07",
    scheduledTime: "10:00",
    author: "Equipo MKT",
    hashtags: ["TopProducts", "EventTech", "Activaciones", "BTL"],
    mediaCount: 7,
    objective: "ventas",
  },
  {
    id: "pub7",
    title: "Pregúntale a nuestro equipo (Q&A)",
    content: "📣 Abrimos preguntas!\n\n¿Tienes dudas sobre tecnología para eventos? ¿No sabes qué producto es mejor para tu activación?\n\nDéjanos tu pregunta en los comments o por DM y nuestro equipo de expertos responde TODO.\n\n⬇️ Pregunta lo que quieras ⬇️",
    platforms: ["instagram"],
    format: "story",
    status: "programado",
    scheduledDate: "2026-03-08",
    scheduledTime: "18:00",
    author: "Equipo MKT",
    hashtags: ["QandA", "Preguntas", "EventTech"],
    mediaCount: 3,
    objective: "confianza",
  },
  {
    id: "pub8",
    title: "Antes vs Después: evento sin tech vs con tech",
    content: "El mismo salón. El mismo presupuesto. Resultados COMPLETAMENTE diferentes.\n\n📸 Desliza para ver la transformación →\n\nLa tecnología no es un gasto — es una inversión en la experiencia de tus invitados.\n\n¿Cuánto más memorable puede ser tu evento?",
    platforms: ["instagram", "tiktok"],
    format: "reel",
    status: "revision",
    scheduledDate: "2026-03-09",
    author: "Equipo MKT",
    hashtags: ["AntesYDespues", "EventTransformation", "Tecnologia"],
    mediaCount: 1,
    objective: "ventas",
  },
  {
    id: "pub9",
    title: "Tour por nuestro lab de innovación",
    content: "Bienvenidos al lugar donde la magia sucede 🧪✨\n\nNuestro lab de innovación es donde probamos, creamos y perfeccionamos cada experiencia antes de llevarla a tu evento.\n\nDe aquí salieron: Photo AI, Hologram XL, y las próximas sorpresas que vienen en Q2 2026...\n\n¿Quieres una visita? 📩",
    platforms: ["instagram", "linkedin", "tiktok"],
    format: "video",
    status: "borrador",
    author: "Equipo MKT",
    hashtags: ["LabPixel", "Innovacion", "BehindTheScenes"],
    mediaCount: 0,
    objective: "confianza",
  },
  {
    id: "pub10",
    title: "El ROI de la tecnología en eventos (datos reales)",
    content: "Hablemos con DATOS 📊\n\nDatos reales de nuestros últimos 50 eventos:\n\n📈 +340% de interacción vs eventos sin tech\n📈 +89% de fotos compartidas en redes\n📈 +67% de recordación de marca\n📈 4.8/5 satisfacción promedio\n\nLa tecnología no es tendencia — es NECESIDAD.\n\nGuarda estos datos para tu próxima propuesta 📌",
    platforms: ["linkedin", "instagram"],
    format: "carrusel",
    status: "borrador",
    author: "Equipo MKT",
    hashtags: ["ROI", "Datos", "EventTech", "MarketingData"],
    mediaCount: 0,
    objective: "confianza",
  },
];

const CAMPAIGNS: Campaign[] = [
  {
    id: "camp1",
    name: "Q1 2026 — Brand Awareness",
    objective: "Posicionar Pixel Factory como líder en tech para eventos en CDMX",
    platforms: ["instagram", "linkedin", "tiktok"],
    startDate: "2026-01-06",
    endDate: "2026-03-31",
    budget: 45000,
    spent: 38200,
    status: "activa",
    posts: 42,
    reach: 245000,
    engagement: 18700,
    leads: 89,
  },
  {
    id: "camp2",
    name: "Photo AI Launch",
    objective: "Lanzamiento del nuevo producto Photo AI con demos y early adopters",
    platforms: ["instagram", "linkedin", "facebook"],
    startDate: "2026-02-15",
    endDate: "2026-04-15",
    budget: 25000,
    spent: 12800,
    status: "activa",
    posts: 18,
    reach: 128000,
    engagement: 9400,
    leads: 45,
  },
  {
    id: "camp3",
    name: "Casos de Éxito Corporativo",
    objective: "Generar confianza B2B con case studies de marcas grandes",
    platforms: ["linkedin"],
    startDate: "2026-03-01",
    endDate: "2026-05-31",
    budget: 15000,
    spent: 4200,
    status: "activa",
    posts: 8,
    reach: 67000,
    engagement: 3200,
    leads: 23,
  },
  {
    id: "camp4",
    name: "Summer Events Push",
    objective: "Campaña pre-verano para eventos de mayo-julio",
    platforms: ["instagram", "tiktok", "facebook"],
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    budget: 35000,
    spent: 0,
    status: "borrador",
    posts: 0,
    reach: 0,
    engagement: 0,
    leads: 0,
  },
];

const BRAND_ASSETS: BrandAsset[] = [
  { id: "a1", name: "Logo Pixel Factory - Principal", type: "logo", format: "SVG / PNG", lastModified: "2026-01-15" },
  { id: "a2", name: "Logo Oromo - Principal", type: "logo", format: "SVG / PNG", lastModified: "2026-01-15" },
  { id: "a3", name: "Logo Picbox - Principal", type: "logo", format: "SVG / PNG", lastModified: "2026-01-15" },
  { id: "a4", name: "Template Instagram Feed", type: "template", format: "Figma / PSD", lastModified: "2026-03-01" },
  { id: "a5", name: "Template Instagram Story", type: "template", format: "Figma / PSD", lastModified: "2026-03-01" },
  { id: "a6", name: "Template LinkedIn Post", type: "template", format: "Figma / PSD", lastModified: "2026-02-20" },
  { id: "a7", name: "Template Cotización PDF", type: "template", format: "Figma", lastModified: "2026-02-10" },
  { id: "a8", name: "Guía de Marca - Pixel Factory", type: "guia", format: "PDF", lastModified: "2025-12-01" },
  { id: "a9", name: "Guía de Tono y Voz", type: "guia", format: "PDF", lastModified: "2025-11-15" },
  { id: "a10", name: "Paleta de Colores Oficial", type: "paleta", format: "ASE / PDF", lastModified: "2025-12-01" },
  { id: "a11", name: "Tipografías Corporativas (Poppins + Inter)", type: "tipografia", format: "OTF / WOFF2", lastModified: "2025-06-01" },
  { id: "a12", name: "Banco de Fotos - Eventos Q1 2026", type: "foto", format: "JPG / RAW", lastModified: "2026-03-28" },
];

// ─── AI Templates ───────────────────────────────────
interface AITemplate {
  id: string;
  name: string;
  icon: typeof Sparkles;
  description: string;
  category: "copy" | "estrategia" | "visual" | "ads";
  prompt: string;
}

const AI_TEMPLATES: AITemplate[] = [
  {
    id: "ai1",
    name: "Caption para Reel",
    icon: Video,
    description: "Genera captions virales para reels con CTA y hashtags",
    category: "copy",
    prompt: "Genera un caption viral para un reel de Instagram sobre [TEMA]. Incluye: hook en la primera línea, 2-3 líneas de contenido de valor, CTA directo, y 10 hashtags relevantes para el nicho de tecnología para eventos. Tono: profesional pero cercano. Marca: Digital Pixel Studio.",
  },
  {
    id: "ai2",
    name: "Carrusel Educativo",
    icon: Layers,
    description: "Estructura completa para carrusel de 5-7 slides",
    category: "copy",
    prompt: "Crea un carrusel educativo de [5-7] slides para Instagram sobre [TEMA]. Para cada slide incluye: título (máx 6 palabras), cuerpo (máx 20 palabras), y nota para diseño. Slide 1 = hook, últimas slides = CTA. Nicho: tecnología para eventos y activaciones BTL.",
  },
  {
    id: "ai3",
    name: "Post LinkedIn B2B",
    icon: Globe,
    description: "Post profesional B2B para LinkedIn con storytelling",
    category: "copy",
    prompt: "Escribe un post de LinkedIn B2B sobre [TEMA] para Digital Pixel Studio. Estructura: apertura con dato/pregunta impactante, desarrollo con storytelling (experiencia real), cierre con reflexión + CTA. Máximo 1300 caracteres. Sin emojis excesivos. Tono: experto pero accesible.",
  },
  {
    id: "ai4",
    name: "Script para Video/Reel",
    icon: Video,
    description: "Script completo con hooks, cuerpo y CTA para video corto",
    category: "copy",
    prompt: "Escribe un script para un reel/video corto (30-60 seg) sobre [TEMA]. Formato: [HOOK 0-3s] texto, [CUERPO 3-25s] puntos clave con transiciones, [CTA 25-30s] llamada a la acción. Para Digital Pixel Studio, nicho de tech para eventos.",
  },
  {
    id: "ai5",
    name: "Calendario Semanal",
    icon: Calendar,
    description: "Plan de contenido para 7 días con temas y formatos",
    category: "estrategia",
    prompt: "Crea un plan de contenido para 7 días para Digital Pixel Studio. Para cada día incluye: plataforma, formato (reel/carrusel/story/post), tema, objetivo (alcance/confianza/ventas), y un brief de 1 línea. Balance: 40% educativo, 30% entretenimiento, 30% venta. Nicho: tech para eventos y activaciones.",
  },
  {
    id: "ai6",
    name: "Estrategia de Campaña",
    icon: Target,
    description: "Framework completo para campaña de marketing",
    category: "estrategia",
    prompt: "Diseña una estrategia de campaña de marketing para [OBJETIVO] de Digital Pixel Studio. Incluye: objetivo SMART, audiencia target, plataformas, contenidos (5-8 piezas), timeline de 2 semanas, presupuesto sugerido, KPIs de medición. Contexto: empresa de renta de tech para eventos (photo booths, VR, hologramas, etc).",
  },
  {
    id: "ai7",
    name: "Hashtag Research",
    icon: Hash,
    description: "Sets de hashtags optimizados por objetivo",
    category: "estrategia",
    prompt: "Genera 3 sets de hashtags (15 cada uno) para Digital Pixel Studio: Set 1 - Alto volumen (>100K posts), Set 2 - Nicho medio (10K-100K), Set 3 - Nicho específico (<10K). Temáticas: tecnología para eventos, activaciones BTL, photo booths, experiencias interactivas, eventos corporativos en México.",
  },
  {
    id: "ai8",
    name: "Ad Copy para Meta/Google",
    icon: Target,
    description: "Copies optimizados para anuncios pagados",
    category: "ads",
    prompt: "Genera 3 variaciones de ad copy para [PLATAFORMA] sobre [PRODUCTO/SERVICIO] de Digital Pixel Studio. Para cada variación incluye: headline (máx 40 chars), descripción (máx 125 chars), CTA text. Enfoque: beneficio > característica. Audiencia: brand managers, event planners, agencias BTL en México.",
  },
];

// ─── Helpers ────────────────────────────────────────
function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
}

// ─── Main Component ─────────────────────────────────
export default function CMOPage() {
  const [activeTab, setActiveTab] = useState("studio");
  const [selectedPost, setSelectedPost] = useState<Publication | null>(null);
  const [filterStatus, setFilterStatus] = useState<PostStatus | "todos">("todos");
  const [filterPlatform, setFilterPlatform] = useState<Platform | "todas">("todas");
  const [aiTemplateOpen, setAiTemplateOpen] = useState<string | null>(null);
  const [aiInput, setAiInput] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [calendarView, setCalendarView] = useState<"semana" | "mes">("mes");
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter posts
  const filteredPosts = PUBLICATIONS.filter((p) => {
    if (filterStatus !== "todos" && p.status !== filterStatus) return false;
    if (filterPlatform !== "todas" && !p.platforms.includes(filterPlatform)) return false;
    if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // KPIs
  const totalPublished = PUBLICATIONS.filter((p) => p.status === "publicado").length;
  const totalScheduled = PUBLICATIONS.filter((p) => p.status === "programado").length;
  const totalDrafts = PUBLICATIONS.filter((p) => p.status === "borrador" || p.status === "revision").length;
  const totalReach = PUBLICATIONS.reduce((sum, p) => sum + (p.engagement?.views ?? 0), 0);
  const totalEngagement = PUBLICATIONS.reduce((sum, p) => sum + (p.engagement?.likes ?? 0) + (p.engagement?.comments ?? 0) + (p.engagement?.shares ?? 0), 0);
  const avgEngagementRate = totalReach > 0 ? ((totalEngagement / totalReach) * 100).toFixed(1) : "0";

  // AI Generate
  const handleAIGenerate = async (template: AITemplate) => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiOutput("");
    // Simulate AI response (replace with real API call when connected)
    await new Promise((r) => setTimeout(r, 2000));
    const filledPrompt = template.prompt.replace(/\[.*?\]/g, aiInput);
    setAiOutput(`✨ **Generado con AI**\n\n---\n\n**Prompt usado:** ${filledPrompt.substring(0, 100)}...\n\n---\n\n🎯 **Resultado:**\n\nPara conectar esta funcionalidad con Claude AI, configura tu API key en .env.local\n\nMientras tanto, copia el prompt de arriba y úsalo directamente en Claude o ChatGPT para generar tu contenido.\n\n💡 Tip: Personaliza reemplazando los campos entre corchetes con tu tema específico.`);
    setAiLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            Centro de Comando CMO
          </h1>
          <p className="text-sm text-gray-500 mt-1">Crea, programa y analiza todo tu contenido desde un solo lugar</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" /> Exportar
          </Button>
          <Button size="sm" className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0" onClick={() => setNewPostOpen(!newPostOpen)}>
            <Plus className="w-4 h-4" /> Nueva Publicación
          </Button>
        </div>
      </div>

      {/* Quick KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Publicados", value: totalPublished, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Programados", value: totalScheduled, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Borradores", value: totalDrafts, icon: Edit3, color: "text-gray-600", bg: "bg-gray-50" },
          { label: "Alcance Total", value: formatNumber(totalReach), icon: Eye, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Engagement", value: formatNumber(totalEngagement), icon: Heart, color: "text-pink-600", bg: "bg-pink-50" },
          { label: "Tasa Eng.", value: `${avgEngagementRate}%`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-0 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", kpi.bg)}>
                  <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{kpi.value}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">{kpi.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 p-1">
          <TabsTrigger value="studio" className="gap-2 text-xs"><PenTool className="w-3.5 h-3.5" /> Content Studio</TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2 text-xs"><Calendar className="w-3.5 h-3.5" /> Calendario</TabsTrigger>
          <TabsTrigger value="ai" className="gap-2 text-xs"><Sparkles className="w-3.5 h-3.5" /> AI Copywriter</TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-2 text-xs"><Target className="w-3.5 h-3.5" /> Campañas</TabsTrigger>
          <TabsTrigger value="brand" className="gap-2 text-xs"><Palette className="w-3.5 h-3.5" /> Brand Hub</TabsTrigger>
          <TabsTrigger value="prompts" className="gap-2 text-xs"><BookOpen className="w-3.5 h-3.5" /> Prompts MKT</TabsTrigger>
        </TabsList>

        {/* ═══════ CONTENT STUDIO ═══════ */}
        <TabsContent value="studio" className="space-y-4 mt-4">
          {/* New Post Editor */}
          {newPostOpen && (
            <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Plus className="w-4 h-4 text-purple-600" /> Nueva Publicación
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setNewPostOpen(false)}>✕</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-3">
                    <input
                      type="text"
                      placeholder="Título de la publicación..."
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <textarea
                      placeholder="Escribe tu contenido aquí... Usa ✨ AI Copywriter para generar ideas"
                      rows={5}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-1 text-xs"><ImageIcon className="w-3 h-3" /> Imagen</Button>
                      <Button variant="outline" size="sm" className="gap-1 text-xs"><Video className="w-3 h-3" /> Video</Button>
                      <Button variant="outline" size="sm" className="gap-1 text-xs"><Layers className="w-3 h-3" /> Carrusel</Button>
                      <div className="flex-1" />
                      <Button variant="outline" size="sm" className="gap-1 text-xs"><Sparkles className="w-3 h-3 text-purple-500" /> Generar con AI</Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Plataformas</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(Object.keys(PLATFORM_CONFIG) as Platform[]).map((p) => (
                          <Badge key={p} variant="outline" className="cursor-pointer text-[10px] hover:bg-purple-50">
                            {PLATFORM_CONFIG[p].name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Formato</label>
                      <select className="w-full mt-1 px-2 py-1.5 border rounded text-xs">
                        <option>Reel</option>
                        <option>Carrusel</option>
                        <option>Story</option>
                        <option>Post</option>
                        <option>Video</option>
                        <option>Live</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Objetivo</label>
                      <select className="w-full mt-1 px-2 py-1.5 border rounded text-xs">
                        <option>Alcance</option>
                        <option>Confianza</option>
                        <option>Ventas</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600">Programar</label>
                      <div className="flex gap-2 mt-1">
                        <input type="date" className="flex-1 px-2 py-1.5 border rounded text-xs" />
                        <input type="time" className="w-24 px-2 py-1.5 border rounded text-xs" />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1 text-xs">Guardar Borrador</Button>
                      <Button size="sm" className="flex-1 text-xs bg-purple-600 hover:bg-purple-700 text-white">Programar</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar publicaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div className="flex gap-1">
              {(["todos", "borrador", "revision", "aprobado", "programado", "publicado"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-full transition-colors",
                    filterStatus === s ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {s === "todos" ? "Todos" : STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {(["todas", "instagram", "linkedin", "tiktok", "facebook"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPlatform(p)}
                  className={cn(
                    "px-2 py-1.5 text-xs rounded-full transition-colors",
                    filterPlatform === p ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {p === "todas" ? "Todas" : PLATFORM_CONFIG[p].name}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.map((post) => {
              const StatusIcon = STATUS_CONFIG[post.status].icon;
              const FormatIcon = FORMAT_ICONS[post.format];
              return (
                <Card
                  key={post.id}
                  className={cn(
                    "hover:shadow-md transition-all cursor-pointer border",
                    selectedPost?.id === post.id ? "ring-2 ring-purple-500 border-purple-300" : "border-gray-200"
                  )}
                  onClick={() => setSelectedPost(post)}
                >
                  <CardContent className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FormatIcon className="w-4 h-4 text-gray-400" />
                        <Badge className={cn("text-[10px]", STATUS_CONFIG[post.status].color)}>
                          {STATUS_CONFIG[post.status].label}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {post.objective === "alcance" ? "🎯 Alcance" : post.objective === "confianza" ? "🤝 Confianza" : "💰 Ventas"}
                      </Badge>
                    </div>

                    {/* Title & Content */}
                    <div>
                      <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{post.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-3">{post.content}</p>
                    </div>

                    {/* Platforms */}
                    <div className="flex items-center gap-1">
                      {post.platforms.map((p) => (
                        <span key={p} className={cn("px-1.5 py-0.5 text-[9px] rounded font-medium", PLATFORM_CONFIG[p].bg, PLATFORM_CONFIG[p].textColor)}>
                          {PLATFORM_CONFIG[p].name}
                        </span>
                      ))}
                    </div>

                    {/* Schedule & Media */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.scheduledDate || "Sin fecha"}
                        {post.scheduledTime && ` ${post.scheduledTime}`}
                      </span>
                      {post.mediaCount > 0 && (
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> {post.mediaCount}
                        </span>
                      )}
                    </div>

                    {/* Engagement (if published) */}
                    {post.engagement && (
                      <div className="grid grid-cols-4 gap-2 pt-2 border-t">
                        <div className="text-center">
                          <p className="text-xs font-bold text-gray-900">{formatNumber(post.engagement.views)}</p>
                          <p className="text-[9px] text-gray-400">Views</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-pink-600">{formatNumber(post.engagement.likes)}</p>
                          <p className="text-[9px] text-gray-400">Likes</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-blue-600">{formatNumber(post.engagement.comments)}</p>
                          <p className="text-[9px] text-gray-400">Comments</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-green-600">{formatNumber(post.engagement.shares)}</p>
                          <p className="text-[9px] text-gray-400">Shares</p>
                        </div>
                      </div>
                    )}

                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-1">
                      {post.hashtags.slice(0, 3).map((h) => (
                        <span key={h} className="text-[10px] text-purple-500">#{h}</span>
                      ))}
                      {post.hashtags.length > 3 && (
                        <span className="text-[10px] text-gray-400">+{post.hashtags.length - 3} más</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ═══════ CALENDAR ═══════ */}
        <TabsContent value="calendar" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setCalendarView("semana")}
                className={cn("px-3 py-1.5 text-xs rounded-lg", calendarView === "semana" ? "bg-purple-600 text-white" : "bg-gray-100")}
              >
                Semana
              </button>
              <button
                onClick={() => setCalendarView("mes")}
                className={cn("px-3 py-1.5 text-xs rounded-lg", calendarView === "mes" ? "bg-purple-600 text-white" : "bg-gray-100")}
              >
                Mes
              </button>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Publicado</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Programado</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Revisión</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400" /> Borrador</span>
            </div>
          </div>

          {/* Calendar Grid */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Marzo 2026</h3>
              <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
                {/* Day headers */}
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
                  <div key={d} className="bg-gray-50 px-2 py-2 text-center text-[10px] font-semibold text-gray-500 uppercase">
                    {d}
                  </div>
                ))}
                {/* Empty cells for March 2026 (starts on Sunday) */}
                {[...Array(6)].map((_, i) => (
                  <div key={`empty-${i}`} className="bg-white min-h-[80px] p-1" />
                ))}
                {/* Days */}
                {[...Array(31)].map((_, i) => {
                  const day = i + 1;
                  const calItem = CONTENT_CALENDAR.find((c) => c.day === day);
                  const pub = PUBLICATIONS.find((p) => p.scheduledDate === `2026-03-${String(day).padStart(2, "0")}`);
                  const statusColor = calItem?.status === "publicado"
                    ? "bg-emerald-500"
                    : calItem?.status === "programado"
                      ? "bg-blue-500"
                      : "bg-gray-300";
                  const isToday = day === 31;

                  return (
                    <div
                      key={day}
                      className={cn(
                        "bg-white min-h-[80px] p-1.5 hover:bg-purple-50/50 transition-colors",
                        isToday && "ring-2 ring-inset ring-purple-500"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn(
                          "text-xs font-medium",
                          isToday ? "bg-purple-600 text-white w-5 h-5 rounded-full flex items-center justify-center" : "text-gray-600"
                        )}>
                          {day}
                        </span>
                        {calItem && <span className={cn("w-1.5 h-1.5 rounded-full", statusColor)} />}
                      </div>
                      {calItem && (
                        <div className="space-y-0.5">
                          <p className="text-[9px] text-gray-700 line-clamp-2 leading-tight">{calItem.topic}</p>
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-[8px] px-1 py-0">{calItem.format}</Badge>
                            <Badge variant="outline" className={cn("text-[8px] px-1 py-0",
                              calItem.objective === "Alcance" ? "text-purple-600" :
                              calItem.objective === "Confianza" ? "text-blue-600" : "text-green-600"
                            )}>
                              {calItem.objective}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Calendar Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">{CONTENT_CALENDAR.filter((c) => c.status === "publicado").length}</p>
                <p className="text-xs text-gray-500 mt-1">Publicados este mes</p>
                <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(CONTENT_CALENDAR.filter((c) => c.status === "publicado").length / 30) * 100}%` }} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{CONTENT_CALENDAR.filter((c) => c.status === "programado").length}</p>
                <p className="text-xs text-gray-500 mt-1">Programados</p>
                <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(CONTENT_CALENDAR.filter((c) => c.status === "programado").length / 30) * 100}%` }} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{CONTENT_CALENDAR.filter((c) => c.status === "pendiente").length}</p>
                <p className="text-xs text-gray-500 mt-1">Pendientes</p>
                <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${(CONTENT_CALENDAR.filter((c) => c.status === "pendiente").length / 30) * 100}%` }} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════ AI COPYWRITER ═══════ */}
        <TabsContent value="ai" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Templates */}
            <div className="md:col-span-1 space-y-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-purple-600" /> Templates AI
              </h3>
              <div className="space-y-2">
                {AI_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setAiTemplateOpen(template.id);
                      setAiOutput("");
                      setAiInput("");
                    }}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border transition-all hover:shadow-sm",
                      aiTemplateOpen === template.id ? "border-purple-300 bg-purple-50 shadow-sm" : "border-gray-200 hover:border-purple-200"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <template.icon className={cn("w-4 h-4", aiTemplateOpen === template.id ? "text-purple-600" : "text-gray-400")} />
                      <span className="text-sm font-medium text-gray-900">{template.name}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 ml-6">{template.description}</p>
                    <Badge variant="outline" className="text-[9px] mt-1.5 ml-6">
                      {template.category}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Workspace */}
            <div className="md:col-span-2">
              {aiTemplateOpen ? (() => {
                const template = AI_TEMPLATES.find((t) => t.id === aiTemplateOpen)!;
                return (
                  <Card className="border-purple-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        {template.name}
                      </CardTitle>
                      <p className="text-xs text-gray-500">{template.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Prompt Preview */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-[11px] font-medium text-gray-500 mb-1">Prompt base:</p>
                        <p className="text-xs text-gray-700">{template.prompt}</p>
                      </div>

                      {/* Input */}
                      <div>
                        <label className="text-xs font-medium text-gray-600">Tu tema o producto:</label>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="text"
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            placeholder="Ej: 360 Booth para evento corporativo..."
                            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            onKeyDown={(e) => e.key === "Enter" && handleAIGenerate(template)}
                          />
                          <Button
                            onClick={() => handleAIGenerate(template)}
                            disabled={aiLoading || !aiInput.trim()}
                            className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                          >
                            {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            {aiLoading ? "Generando..." : "Generar"}
                          </Button>
                        </div>
                      </div>

                      {/* Output */}
                      {aiOutput && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-purple-700 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Resultado AI
                            </span>
                            <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1">
                              <Copy className="w-3 h-3" /> Copiar
                            </Button>
                          </div>
                          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">{aiOutput}</pre>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" className="text-xs gap-1">
                              <RefreshCw className="w-3 h-3" /> Regenerar
                            </Button>
                            <Button size="sm" className="text-xs gap-1 bg-purple-600 hover:bg-purple-700 text-white">
                              <Plus className="w-3 h-3" /> Crear Publicación
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Quick Prompt from Clipboard */}
                      <div className="border-t pt-3">
                        <p className="text-xs font-medium text-gray-600 mb-2">💡 Copiar prompt para usar en Claude/ChatGPT:</p>
                        <div className="bg-white border rounded-lg p-3">
                          <p className="text-[11px] text-gray-600 font-mono">{template.prompt.replace(/\[.*?\]/g, aiInput || "[TU TEMA]")}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 text-[10px] gap-1"
                            onClick={() => navigator.clipboard.writeText(template.prompt.replace(/\[.*?\]/g, aiInput || "[TU TEMA]"))}
                          >
                            <Copy className="w-3 h-3" /> Copiar Prompt
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })() : (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
                    <Wand2 className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Copywriter</h3>
                  <p className="text-sm text-gray-500 max-w-sm mt-2">
                    Selecciona un template a la izquierda para generar contenido con inteligencia artificial.
                    Optimizado para el nicho de Digital Pixel Studio.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ═══════ CAMPAIGNS ═══════ */}
        <TabsContent value="campaigns" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Campañas Activas</h3>
            <Button size="sm" className="gap-2 text-xs bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="w-3.5 h-3.5" /> Nueva Campaña
            </Button>
          </div>

          <div className="space-y-3">
            {CAMPAIGNS.map((camp) => {
              const budgetPct = camp.budget > 0 ? Math.round((camp.spent / camp.budget) * 100) : 0;
              const isExpanded = expandedCampaign === camp.id;
              return (
                <Card key={camp.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <button
                      className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedCampaign(isExpanded ? null : camp.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-2 h-10 rounded-full",
                            camp.status === "activa" ? "bg-green-500" :
                            camp.status === "pausada" ? "bg-yellow-500" :
                            camp.status === "borrador" ? "bg-gray-400" : "bg-blue-500"
                          )} />
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">{camp.name}</h4>
                            <p className="text-xs text-gray-500">{camp.objective}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            {camp.platforms.map((p) => (
                              <span key={p} className={cn("px-1.5 py-0.5 text-[9px] rounded", PLATFORM_CONFIG[p].bg, PLATFORM_CONFIG[p].textColor)}>
                                {PLATFORM_CONFIG[p].name}
                              </span>
                            ))}
                          </div>
                          <Badge className={cn(
                            "text-[10px]",
                            camp.status === "activa" ? "bg-green-100 text-green-700" :
                            camp.status === "pausada" ? "bg-yellow-100 text-yellow-700" :
                            camp.status === "borrador" ? "bg-gray-100 text-gray-600" : "bg-blue-100 text-blue-700"
                          )}>
                            {camp.status}
                          </Badge>
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 border-t bg-gray-50/50">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3">
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase">Presupuesto</p>
                            <p className="text-sm font-bold text-gray-900">{formatMoney(camp.budget)}</p>
                            <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                              <div className={cn("h-1.5 rounded-full", budgetPct > 90 ? "bg-red-500" : budgetPct > 70 ? "bg-yellow-500" : "bg-green-500")} style={{ width: `${budgetPct}%` }} />
                            </div>
                            <p className="text-[10px] text-gray-500 mt-0.5">{formatMoney(camp.spent)} gastado ({budgetPct}%)</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase">Publicaciones</p>
                            <p className="text-sm font-bold text-gray-900">{camp.posts}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase">Alcance</p>
                            <p className="text-sm font-bold text-purple-600">{formatNumber(camp.reach)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase">Engagement</p>
                            <p className="text-sm font-bold text-pink-600">{formatNumber(camp.engagement)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase">Leads</p>
                            <p className="text-sm font-bold text-green-600">{camp.leads}</p>
                            {camp.spent > 0 && (
                              <p className="text-[10px] text-gray-500">CPL: {formatMoney(camp.spent / camp.leads)}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t">
                          <p className="text-xs text-gray-500">
                            📅 {camp.startDate} → {camp.endDate}
                          </p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="text-xs gap-1"><Edit3 className="w-3 h-3" /> Editar</Button>
                            <Button variant="outline" size="sm" className="text-xs gap-1"><BarChart3 className="w-3 h-3" /> Ver Reporte</Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Campaign Summary */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{CAMPAIGNS.filter((c) => c.status === "activa").length}</p>
                <p className="text-xs text-green-600">Campañas Activas</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-700">{formatMoney(CAMPAIGNS.reduce((s, c) => s + c.budget, 0))}</p>
                <p className="text-xs text-purple-600">Budget Total</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-700">{formatNumber(CAMPAIGNS.reduce((s, c) => s + c.reach, 0))}</p>
                <p className="text-xs text-blue-600">Alcance Total</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-amber-700">{CAMPAIGNS.reduce((s, c) => s + c.leads, 0)}</p>
                <p className="text-xs text-amber-600">Total Leads</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════ BRAND HUB ═══════ */}
        <TabsContent value="brand" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Activos de Marca</h3>
            <Button size="sm" variant="outline" className="gap-2 text-xs">
              <Plus className="w-3.5 h-3.5" /> Subir Asset
            </Button>
          </div>

          {/* Brand Colors */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-600" /> Paleta de Colores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {[
                  { name: "Pixel Blue", hex: "#2563EB", text: "white" },
                  { name: "Pixel Dark", hex: "#111827", text: "white" },
                  { name: "Pixel Purple", hex: "#7C3AED", text: "white" },
                  { name: "Pixel Pink", hex: "#EC4899", text: "white" },
                  { name: "Pixel Cyan", hex: "#06B6D4", text: "white" },
                  { name: "Pixel Light", hex: "#F9FAFB", text: "#111827" },
                ].map((color) => (
                  <div key={color.hex} className="text-center">
                    <div
                      className="w-full h-16 rounded-lg shadow-sm flex items-end justify-center pb-1.5 cursor-pointer hover:scale-105 transition-transform"
                      style={{ backgroundColor: color.hex, color: color.text }}
                      onClick={() => navigator.clipboard.writeText(color.hex)}
                    >
                      <span className="text-[10px] font-mono opacity-80">{color.hex}</span>
                    </div>
                    <p className="text-xs font-medium text-gray-700 mt-1">{color.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Type className="w-4 h-4 text-purple-600" /> Tipografía
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Títulos — Poppins</p>
                  <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: "Poppins, sans-serif" }}>Digital Pixel Studio</p>
                  <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: "Poppins, sans-serif" }}>ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                  <p className="text-sm text-gray-500" style={{ fontFamily: "Poppins, sans-serif" }}>abcdefghijklmnopqrstuvwxyz 0123456789</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Body — Inter</p>
                  <p className="text-xl text-gray-900">Tecnología para eventos experienciales</p>
                  <p className="text-sm text-gray-500 mt-1">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                  <p className="text-sm text-gray-500">abcdefghijklmnopqrstuvwxyz 0123456789</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Asset Library */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" /> Biblioteca de Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {BRAND_ASSETS.map((asset) => {
                  const icons: Record<string, typeof ImageIcon> = {
                    logo: Star,
                    template: Layout,
                    guia: BookOpen,
                    tipografia: Type,
                    paleta: Palette,
                    foto: ImageIcon,
                  };
                  const AssetIcon = icons[asset.type] || FileText;
                  return (
                    <div key={asset.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                        <AssetIcon className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{asset.name}</p>
                        <p className="text-[10px] text-gray-500">{asset.format} • {asset.lastModified}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="shrink-0">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════ MARKETING PROMPTS ═══════ */}
        <TabsContent value="prompts" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Biblioteca de Prompts — Equipo MKT</h3>
              <p className="text-xs text-gray-500 mt-1">Prompts estratégicos creados por tu equipo de marketing</p>
            </div>
            <Button size="sm" variant="outline" className="gap-2 text-xs">
              <Plus className="w-3.5 h-3.5" /> Nuevo Prompt
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MARKETING_PROMPTS.map((prompt) => (
              <Card key={prompt.id} className="hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px]">{prompt.category}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[10px] gap-1"
                      onClick={() => navigator.clipboard.writeText(prompt.prompt)}
                    >
                      <Copy className="w-3 h-3" /> Copiar
                    </Button>
                  </div>
                  <CardTitle className="text-base mt-1">{prompt.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-500 mb-3">{prompt.description}</p>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                    <p className="text-[11px] text-gray-700 whitespace-pre-wrap">{prompt.prompt}</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="flex-1 text-xs gap-1 bg-purple-600 hover:bg-purple-700 text-white" onClick={() => {
                      setActiveTab("ai");
                      setAiInput("");
                      setAiOutput("");
                    }}>
                      <Sparkles className="w-3 h-3" /> Usar en AI
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs gap-1">
                      <Edit3 className="w-3 h-3" /> Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Best Practices */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" /> Tips para Mejores Resultados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-900">📱 Instagram</h4>
                  <ul className="text-[11px] text-gray-600 space-y-1">
                    <li>• Reels: 15-30 seg, hook en 3s</li>
                    <li>• Carruseles: 5-7 slides max</li>
                    <li>• Stories: 3-5 por día</li>
                    <li>• Horario: 12-2pm y 7-9pm</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-900">💼 LinkedIn</h4>
                  <ul className="text-[11px] text-gray-600 space-y-1">
                    <li>• Posts: 1300 chars max, sin emojis excesivos</li>
                    <li>• Storytelling &gt; datos fríos</li>
                    <li>• Publicar Mar-Jue 8-10am</li>
                    <li>• Comentar en posts relevantes</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-900">🎵 TikTok</h4>
                  <ul className="text-[11px] text-gray-600 space-y-1">
                    <li>• Behind the scenes funciona mejor</li>
                    <li>• Trend-jacking con tech de eventos</li>
                    <li>• Texto en pantalla siempre</li>
                    <li>• 3-5 publicaciones por semana</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
