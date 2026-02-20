export const clientConfig = {
  agentName: "Synergos Solutions",
  agentRole: "CEO & Fundador",
  slogan: "La Sinergia que Transforma tu Negocio",
  owner: "Adalberto Vargas",

  license: {
    package: "empresarial",
    label: "Empresarial",
    createdAt: "2026-01-07"
  },

  // Configuración Visual (Synergos Branding) - Paleta V2
  // Colores: Verde, Oro/Amarillo, Turquesa, Rojo
  theme: {
    primaryColor: "#059669",   // Verde Esmeralda (Etna Moros)
    accentColor: "#D4AF37",    // Oro Clásico (Premium)
    secondaryColor: "#14B8A6", // Turquoise
    dangerColor: "#DC2626",    // Red
    backgroundColor: "#020617", // Default to Dark Background
    chatBubbleColor: "#0f172a",
    textColor: "#F8FAFC",

    // Paleta completa para uso en componentes
    colors: {
      primary: "#059669",      // Verde Esmeralda
      accent: "#D4AF37",       // Oro Clásico
      secondary: "#14B8A6",    // Turquesa
      danger: "#DC2626",       // Rojo Carmesí
      yellow: "#FBBF24",       // Amarillo Amber
      background: "#020617",
      text: "#F8FAFC"
    }
  },

  webhooks: {
    // URL base del servidor N8N
    baseUrl: "http://3.148.170.122:5678",
    // Rutas de webhooks
    // AGENTE SYNERGOS V2: Usa Gemini Flash + Tracking + Calendar
    agentSyn: "webhook/ef270b01-9c77-45d3-9e6b-67183746f597",  // AgentSyn-Synergos (Gemini Flash)
    transcripSyn: "webhook/68eaa1a6-e250-4f52-863c-338cd9dd9119",
    // TEMPORAL: Usando AgentSyn para marketing hasta que se restaure el workflow dedicado
    marketSyn: "webhook/ef270b01-9c77-45d3-9e6b-67183746f597",
    socialSyn: "webhook/synergos-v4-publish", // Robust V4 Hybrid Flow
    competenciaSyn: "webhook/marketing",
    pdfSyn: "webhook/gemini-quote-generator",
    metricsSyn: "webhook/video-analytics",
    synCards: "webhook/syn-cards"
  },

  social: {
    facebookAppId: "1426340769066785",
    instagramAppId: "1432714301607365"
  },

  modules: {
    agentSyn: true,
    transcripSyn: true,
    marketSyn: true,
    socialSyn: true,
    synCards: true,
    competenciaSyn: true,
    voiceSyn: true
  },

  logoPath: "/logo.png",
  systemPromptId: "synergos_core_v1",

  companyInfo: {
    name: "Synergos Solutions",
    owner: "Adalberto Vargas",
    role: "CEO",
    slogan: "Artificial Intelligence for Business",
    industry: "Tech"
  },

  // Motor AI - Modelos Especializados (Nativo Google SDK)
  aiModels: {
    research: "gemini-1.5-pro",
    reasoning: "gemini-1.5-flash",
    thinking: "gemini-1.5-flash",
    balanced: "gemini-1.5-flash",
    multimodal: "gemini-1.5-flash",
    lite: "gemini-1.5-flash-lite",
    image: "imagen-3.0-generate-001",
    video: "veo-1.0-generate-001"
  }
};

export const projectConfig = clientConfig;
export default clientConfig;
