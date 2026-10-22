const demoMode =
  new URLSearchParams(window.location.search).get("demo") === "1";

export const crops = [
  "rice",
  "maize",
  "groundnut",
  "cotton",
  "tomato",
  "millet"
];

export const cap = (value) =>
  value
    ? String(value)
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "";

export const date = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    : "—";

export const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);

const now = () => new Date().toISOString();

function dayAgo(days) {
  const value = new Date();
  value.setUTCDate(value.getUTCDate() - days);
  value.setUTCHours(0, 0, 0, 0);
  return value.toISOString();
}

function id(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function copy(value) {
  return structuredClone(value);
}

let demoUser = null;

let farms = [
  {
    _id: "demo-farm",
    name: "Green Valley Farm",
    district: "Chennai",
    state: "Tamil Nadu",
    latitude: 13.0827,
    longitude: 80.2707,
    soil: "loamy",
    crop: "rice",
    previousCrop: "groundnut",
    areaHa: 2.5,
    sowingDate: dayAgo(35),
    stage: "vegetative",
    season: "kharif",
    ph: 6.5,
    n: 120,
    p: 35,
    k: 180,
    createdAt: now(),
    updatedAt: now()
  }
];

let scans = [];

let alerts = [
  {
    _id: "demo-alert-1",
    farm: "demo-farm",
    title: "Sample rainfall advisory",
    message:
      "[DEMO] Inspect drainage before forecast rainfall. " +
      "These are illustrative conditions.",
    category: "rain",
    level: "warning",
    read: false,
    createdAt: now()
  },
  {
    _id: "demo-alert-2",
    farm: "demo-farm",
    title: "Sample nutrient-planning reminder",
    message:
      "[DEMO] Review your soil-test report with an agronomist. " +
      "No fertilizer dose is prescribed.",
    category: "fertilizer",
    level: "info",
    read: false,
    createdAt: now()
  }
];

const marketBases = {
  rice: 2300,
  maize: 2100,
  groundnut: 6200,
  cotton: 7000,
  tomato: 1800,
  millet: 2600
};

const sampleMarkets = [
  ["Chennai Demo Market", "Chennai", 1.04],
  ["Coimbatore Demo Market", "Coimbatore", 1],
  ["Dindigul Demo Market", "Dindigul", 0.98]
];

let markets = [];

for (const crop of crops) {
  for (const [mandi, district, factor] of sampleMarkets) {
    for (let days = 6; days >= 0; days--) {
      const modal = Math.round(
        marketBases[crop] * factor * (1 + (6 - days) * 0.012)
      );

      markets.push({
        _id: `sample-${crop}-${district}-${days}`,
        crop,
        mandi,
        district,
        state: "Tamil Nadu",
        min: Math.round(modal * 0.9),
        modal,
        max: Math.round(modal * 1.1),
        date: dayAgo(days),
        source: "sample"
      });
    }
  }
}

function findFarm(farmId) {
  const farm = farms.find((item) => item._id === farmId);

  if (!farm) {
    throw new Error("Demo farm not found.");
  }

  return farm;
}

function intelligence(farm) {
  const profileScores = {
    rice: 95,
    maize: 85,
    groundnut: 80,
    cotton: 70,
    tomato: 65,
    millet: 75
  };

  const rankings = crops
    .map((crop) => ({
      crop,
      score: profileScores[crop],
      reasons: [
        "Illustrative crop-profile compatibility",
        `Selected soil: ${farm.soil}`,
        `Selected season: ${farm.season}`
      ],
      note:
        "Fixed demo ranking for interface demonstration. " +
        "Not a prediction of yield, suitability or profit."
    }))
    .sort((first, second) => second.score - first.score);

  const advisories = [
    {
      category: "rain",
      level: "warning",
      title: "Rainfall precaution",
      message:
        "[DEMO] Inspect drainage and check a verified local " +
        "forecast before planning field operations."
    },
    {
      category: "disease",
      level: "warning",
      title: "Humid-condition disease watch",
      message:
        "[DEMO] Inspect both sides of leaves for new lesions. " +
        "Weather alone cannot diagnose disease."
    },
    {
      category: "irrigation",
      level: "info",
      title: "Inspect soil moisture",
      message:
        "[DEMO] Check root-zone moisture before deciding " +
        "whether irrigation is needed."
    }
  ];

  return {
    weather: {
      temperature: 31,
      humidity: 82,
      wind: 12,
      rainfall: 12,
      forecast: [
        { date: dayAgo(0).slice(0, 10), rainfall: 12 },
        { date: dayAgo(-1).slice(0, 10), rainfall: 8 },
        { date: dayAgo(-2).slice(0, 10), rainfall: 3 }
      ],
      source: "Illustrative demo weather — not live",
      sample: true,
      observedAt: null,
      timezone: "Asia/Kolkata"
    },

    crops: rankings,

    advisories,

    fertilizer: {
      levels: {
        n: Number(farm.n) === 0
          ? "not supplied"
          : "medium in this demo",

        p: Number(farm.p) === 0
          ? "not supplied"
          : "medium in this demo",

        k: Number(farm.k) === 0
          ? "not supplied"
          : "medium in this demo"
      },

      units:
        "Entered values are displayed in kg/ha. " +
        "Demo bands are not calibrated to a soil-test method.",

      suggestions: [
        {
          nutrient: "Nitrogen",
          type:
            "Discuss a suitable nitrogen source with " +
            "a local agronomist.",
          schedule:
            "Confirm crop-stage requirements and an " +
            "appropriate split-application plan."
        },
        {
          nutrient: "Phosphorus",
          type:
            "Select a phosphorus source only using " +
            "a validated soil-test recommendation.",
          schedule:
            "Review basal application needs; do not " +
            "automatically repeat an application."
        },
        {
          nutrient: "Potassium",
          type:
            "Discuss potassium needs using the crop " +
            "and soil-test report.",
          schedule:
            "Confirm timing and dose with local guidance."
        }
      ],

      warning:
        "[DEMO] No fertilizer dose is calculated. " +
        "Zero means not supplied, not a verified deficiency."
    },

    disclaimer:
      "DEMO MODE: All weather, rankings and market observations " +
      "are illustrative. No database is connected. " +
      "Do not use these values for field decisions."
  };
}

function screeningResult(symptoms) {
  const rules = [
    {
      name: "Leaf-spot-like symptoms",
      symptoms: ["spots", "yellowing"],
      action:
        "Photograph both sides of affected leaves and " +
        "seek expert identification."
    },
    {
      name: "Blight-like symptoms",
      symptoms: ["spots", "browning", "wilting"],
      action:
        "Inspect symptom progression and obtain expert " +
        "confirmation before selecting treatment."
    },
    {
      name: "Powdery-coating symptoms",
      symptoms: ["powder", "yellowing"],
      action:
        "Submit clear close-up photographs for expert review."
    },
    {
      name: "Possible sucking-pest injury",
      symptoms: ["insects", "curling", "yellowing"],
      action:
        "Inspect leaf undersides and confirm the pest identity."
    },
    {
      name: "Possible water or root stress",
      symptoms: ["wilting", "yellowing"],
      action:
        "Inspect soil moisture and root condition."
    }
  ];

  const matches = rules
    .map((rule) => {
      const matched = rule.symptoms.filter((symptom) =>
        symptoms.includes(symptom)
      );

      return {
        name: rule.name,
        matched,
        score: Math.round(
          (matched.length / rule.symptoms.length) * 100
        ),
        action: rule.action
      };
    })
    .filter((rule) => rule.matched.length > 0)
    .sort((first, second) =>
      second.matched.length - first.matched.length
    )
    .slice(0, 3);

  return {
    method: "Demo symptom-rule screening, not image diagnosis",
    matches,
    summary: matches.length
      ? "Possible symptom patterns, not a diagnosis."
      : "No symptom rule matched. This does not mean the plant is healthy.",
    warning:
      "Rule coverage is NOT AI confidence or disease probability. " +
      "The photo is not diagnosed by a trained model."
  };
}

async function demoApi(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body || {};

  const url = new URL(path, window.location.origin);
  const route = url.pathname.replace(/\/+$/, "") || "/";

  if (route === "/health") {
    return {
      ok: true,
      service: "smartkrishi-browser-demo",
      demo: true
    };
  }

  if (
    (route === "/auth/login" || route === "/auth/register") &&
    method === "POST"
  ) {
    demoUser = {
      id: "demo-user",
      name: body.name?.trim() || "Demo Farmer",
      email: body.email?.trim() || "demo@example.com",
      role: "admin"
    };

    return demoUser;
  }

  if (route === "/auth/logout" && method === "POST") {
    demoUser = null;
    return { ok: true };
  }

  if (!demoUser) {
    throw new Error("Please sign in to the demo.");
  }

  if (route === "/auth/me") {
    if (method === "PATCH") {
      demoUser = {
        ...demoUser,
        name: String(body.name || demoUser.name).trim()
      };
    }

    return demoUser;
  }

  if (route === "/farms") {
    if (method === "GET") {
      return farms;
    }

    if (method === "POST") {
      const farm = {
        ...body,
        _id: id("farm"),
        owner: demoUser.id,
        latitude: Number(body.latitude),
        longitude: Number(body.longitude),
        areaHa: Number(body.areaHa),
        ph: Number(body.ph),
        n: Number(body.n),
        p: Number(body.p),
        k: Number(body.k),
        sowingDate: new Date(body.sowingDate).toISOString(),
        createdAt: now(),
        updatedAt: now()
      };

      farms = [farm, ...farms];
      return farm;
    }
  }

  const intelligenceMatch = route.match(
    /^\/farms\/([^/]+)\/intelligence$/
  );

  if (intelligenceMatch && method === "GET") {
    return intelligence(findFarm(intelligenceMatch[1]));
  }

  const refreshMatch = route.match(
    /^\/farms\/([^/]+)\/alerts\/refresh$/
  );

  if (refreshMatch && method === "POST") {
    const farm = findFarm(refreshMatch[1]);
    const items = intelligence(farm).advisories;

    for (const item of items) {
      const exists = alerts.some(
        (alert) =>
          alert.farm === farm._id &&
          alert.category === item.category &&
          alert.createdAt.slice(0, 10) === now().slice(0, 10)
      );

      if (!exists) {
        alerts.unshift({
          ...item,
          _id: id("alert"),
          farm: farm._id,
          read: false,
          createdAt: now()
        });
      }
    }

    return { ok: true, sample: true };
  }

  const farmMatch = route.match(/^\/farms\/([^/]+)$/);

  if (farmMatch) {
    const farm = findFarm(farmMatch[1]);

    if (method === "PUT") {
      const updated = {
        ...farm,
        ...body,
        _id: farm._id,
        latitude: Number(body.latitude),
        longitude: Number(body.longitude),
        areaHa: Number(body.areaHa),
        ph: Number(body.ph),
        n: Number(body.n),
        p: Number(body.p),
        k: Number(body.k),
        sowingDate: new Date(body.sowingDate).toISOString(),
        updatedAt: now()
      };

      farms = farms.map((item) =>
        item._id === farm._id ? updated : item
      );

      return updated;
    }

    if (method === "DELETE") {
      farms = farms.filter((item) => item._id !== farm._id);
      scans = scans.filter((item) => item.farm !== farm._id);
      alerts = alerts.filter((item) => item.farm !== farm._id);

      return { ok: true };
    }
  }

  if (route === "/scans") {
    if (method === "GET") {
      const farmId = url.searchParams.get("farm");

      return scans
        .filter((scan) => !farmId || scan.farm === farmId)
        .map(({ image, ...record }) => record)
        .slice(0, 30);
    }

    if (method === "POST") {
      const farm = findFarm(body.farm);

      const allowed = [
        "spots",
        "yellowing",
        "browning",
        "wilting",
        "powder",
        "curling",
        "insects"
      ];

      const symptoms = Array.isArray(body.symptoms)
        ? [...new Set(
            body.symptoms.filter((item) => allowed.includes(item))
          )]
        : [];

      const scan = {
        _id: id("scan"),
        owner: demoUser.id,
        farm: farm._id,
        image: body.image,
        symptoms,
        visual: body.visual || {},
        result: screeningResult(symptoms),
        createdAt: now()
      };

      scans.unshift(scan);

      alerts.unshift({
        _id: id("alert"),
        farm: farm._id,
        title: "Demo leaf screening saved",
        message:
          "[DEMO] Preliminary symptom record saved. " +
          "Expert confirmation is required.",
        category: "screening",
        level: "info",
        read: false,
        createdAt: now()
      });

      return scan;
    }
  }

  const scanMatch = route.match(/^\/scans\/([^/]+)$/);

  if (scanMatch) {
    const scan = scans.find(
      (item) => item._id === scanMatch[1]
    );

    if (!scan) {
      throw new Error("Demo screening not found.");
    }

    if (method === "GET") {
      return scan;
    }

    if (method === "DELETE") {
      scans = scans.filter((item) => item._id !== scan._id);
      return { ok: true };
    }
  }

  if (route === "/markets") {
    if (method === "GET") {
      const crop = url.searchParams.get("crop");
      const district = url.searchParams.get("district");

      return markets
        .filter((item) =>
          (!crop || item.crop === crop) &&
          (!district || item.district === district)
        )
        .sort((first, second) =>
          new Date(second.date) - new Date(first.date)
        );
    }

    if (method === "POST") {
      const minimum = Number(body.min);
      const modal = Number(body.modal);
      const maximum = Number(body.max);

      if (
        ![minimum, modal, maximum].every(Number.isFinite) ||
        minimum < 0 ||
        minimum > modal ||
        modal > maximum
      ) {
        throw new Error(
          "Require 0 ≤ minimum ≤ modal ≤ maximum."
        );
      }

      const record = {
        ...body,
        _id: id("market"),
        min: minimum,
        modal,
        max: maximum,
        date: new Date(body.date).toISOString(),
        source: "manual"
      };

      markets.unshift(record);
      return record;
    }
  }

  const marketMatch = route.match(/^\/markets\/([^/]+)$/);

  if (marketMatch && method === "DELETE") {
    markets = markets.filter(
      (item) => item._id !== marketMatch[1]
    );

    return { ok: true };
  }

  if (route === "/alerts" && method === "GET") {
    return alerts;
  }

  if (route === "/alerts/read-all" && method === "PATCH") {
    alerts = alerts.map((alert) => ({
      ...alert,
      read: true
    }));

    return { ok: true };
  }

  const alertMatch = route.match(/^\/alerts\/([^/]+)\/read$/);

  if (alertMatch && method === "PATCH") {
    const alert = alerts.find(
      (item) => item._id === alertMatch[1]
    );

    if (!alert) {
      throw new Error("Demo alert not found.");
    }

    alert.read = true;
    return alert;
  }

  throw new Error(
    `Demo route not implemented: ${method} ${route}`
  );
}

export async function api(path, options = {}) {
  if (demoMode) {
    const result = await demoApi(path, options);
    return copy(result);
  }

  let response;

  try {
    response = await fetch("/api" + path, {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      },
      body:
        options.body === undefined
          ? undefined
          : JSON.stringify(options.body)
    });
  } catch {
    throw new Error(
      "Cannot reach the API. Check that the Node server is running."
    );
  }

  const data = await response.json().catch(() => ({
    message: "Unexpected server response."
  }));

  if (!response.ok) {
    if (
      response.status === 401 &&
      !path.startsWith("/auth/")
    ) {
      window.dispatchEvent(
        new Event("session-expired")
      );
    }

    throw new Error(data.message || "Request failed.");
  }

  return data;
}

if (demoMode) {
  document.title = "SmartKrishi — Demo";

  if (!document.getElementById("smartkrishi-demo-label")) {
    const label = document.createElement("div");

    label.id = "smartkrishi-demo-label";
    label.textContent = "DEMO • Sample data • No database";
    label.setAttribute("role", "note");

    label.style.cssText = [
      "position:fixed",
      "bottom:8px",
      "right:8px",
      "z-index:9999",
      "padding:7px 12px",
      "border:1px solid #dcc276",
      "border-radius:7px",
      "background:#fff4ce",
      "color:#725415",
      "font:600 11px system-ui,sans-serif",
      "pointer-events:none"
    ].join(";");

    document.body.appendChild(label);
  }
}