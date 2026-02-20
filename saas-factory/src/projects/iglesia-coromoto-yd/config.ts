export const clientConfig = {
    agentName: "IGLESIA COROMOTO YD",
    agentRole: "TAREA PASTORAL Y ADMINISTRATIVA",
    slogan: "LA FE QUE ORGANIZA EL SERVICIO QUE TRANSFORMA",
    owner: "YADIRA DIAZ",
    license: {
        package: "empresarial",
        label: "Empresarial",
        createdAt: "2026-01-18"
    },
    theme: {
        primaryColor: "#022c22",
        accentColor: "#34d399",
        backgroundColor: "#f0fdf4",
        textColor: "#064e3b"
    },
    webhooks: {
        baseUrl: "http://3.148.170.122:5678",
        agentSyn: "webhook/780c1a60-ecb4-4c68-ab7b-20a28d00fc83",
        transcripSyn: "webhook/68eaa1a6-e250-4f52-863c-338cd9dd9119",
        marketSyn: "webhook/ff18cfa1-95a9-4413-98e7-26bac9592d2a",
        socialSyn: "social-publisher"
    },
    social: {
        facebookAppId: "",
        instagramAppId: ""
    },
    modules: {
        agentSyn: true,
        transcripSyn: true,
        marketSyn: true,
        socialSyn: true,
        synCards: true,
        competenciaSyn: true,
        voiceSyn: true
    }
};
