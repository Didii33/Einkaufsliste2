// Cloudflare Worker: Instagram-Link -> Rezept (Name, Zutaten, Zubereitung)
//
// Einrichten (Cloudflare Dashboard -> Workers & Pages -> Create Worker):
//   1. Diesen Code komplett einfügen und deployen
//   2. Settings -> Variables and Secrets -> Secret "ANTHROPIC_API_KEY" hinzufügen
//   3. Worker-URL in src/recipeApi.ts eintragen
//
// Optionale Variablen:
//   ALLOWED_ORIGIN     (Standard: https://didii33.github.io)
//   FIREBASE_PROJECT   (Standard: einkaufsliste2-b05d3)
//   ALLOWED_EMAILS     (kommagetrennt; leer = alle eingeloggten Nutzer der App)
//   CLAUDE_MODEL       (Standard: claude-haiku-5-5)

const DEFAULTS = {
  ALLOWED_ORIGIN: "https://didii33.github.io",
  FIREBASE_PROJECT: "einkaufsliste2-b05d3",
  CLAUDE_MODEL: "claude-haiku-5-5",
};

export default {
  async fetch(request, env) {
    const cfg = { ...DEFAULTS, ...env };
    const origin = request.headers.get("Origin") || "";
    const allowed = cfg.ALLOWED_ORIGIN.split(",").map((s) => s.trim());
    const cors = {
      "Access-Control-Allow-Origin": allowed.includes(origin) || origin.startsWith("http://localhost") ? origin : allowed[0],
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Vary": "Origin",
    };
    const json = (body, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return json({ error: "Nur POST erlaubt" }, 405);

    // 1) Nur eingeloggte Nutzer der Einkaufslisten-App
    try {
      const token = (request.headers.get("Authorization") || "").replace(/^Bearer /, "");
      const claims = await verifyFirebaseToken(token, cfg.FIREBASE_PROJECT);
      if (cfg.ALLOWED_EMAILS) {
        const list = cfg.ALLOWED_EMAILS.split(",").map((s) => s.trim().toLowerCase());
        if (!list.includes((claims.email || "").toLowerCase())) return json({ error: "Kein Zugriff" }, 403);
      }
    } catch (e) {
      return json({ error: "Nicht eingeloggt" }, 401);
    }

    if (!cfg.ANTHROPIC_API_KEY) return json({ error: "ANTHROPIC_API_KEY fehlt im Worker" }, 500);

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Ungültige Anfrage" }, 400);
    }
    const url = (body.url || "").trim();
    let text = (body.caption || "").trim();

    // 2) Caption von Instagram holen (falls nicht mitgeschickt)
    if (!text && url) {
      try {
        text = await fetchInstagramCaption(url);
      } catch (e) {
        text = "";
      }
    }
    if (!text || text.length < 15) {
      return json(
        {
          error: "Konnte die Beschreibung nicht automatisch lesen. Kopiere sie in Instagram und füge sie unten ein.",
          needCaption: true,
        },
        422
      );
    }

    // 3) KI macht daraus ein Rezept
    try {
      const recipe = await extractRecipe(text, cfg);
      if (!recipe.ingredients || !recipe.ingredients.length) {
        return json(
          {
            error: "Im Text wurde kein Rezept gefunden. Steht es evtl. nur im Video? Dann Zutaten von Hand einfügen.",
            needCaption: true,
          },
          422
        );
      }
      return json(recipe);
    } catch (e) {
      return json({ error: "KI-Fehler: " + e.message }, 502);
    }
  },
};

// ---------- Instagram ----------

async function fetchInstagramCaption(url) {
  const m = url.match(/instagram\.com\/(?:[^/?#]+\/)?(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
  if (!m) throw new Error("Kein Instagram-Link");
  const code = m[1];
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
    "Accept-Language": "de-CH,de;q=0.9,en;q=0.8",
  };

  // a) Embed-Seite: enthält die volle Caption ohne Login
  const res = await fetch(`https://www.instagram.com/p/${code}/embed/captioned/`, { headers });
  if (res.ok) {
    const html = await res.text();
    const block = html.match(/<div class="Caption">([\s\S]*?)<div class="CaptionComments">/);
    if (block) {
      const cleaned = htmlToText(block[1].replace(/<a[^>]*class="CaptionUsername"[^>]*>[\s\S]*?<\/a>/, ""));
      if (cleaned.length > 15) return cleaned;
    }
    const jsonCap = html.match(/"caption"\s*:\s*\{[^}]*?"text"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (jsonCap) return JSON.parse(`"${jsonCap[1]}"`);
  }

  // b) Fallback: og:description der normalen Seite (oft gekürzt)
  const res2 = await fetch(`https://www.instagram.com/p/${code}/`, { headers });
  if (res2.ok) {
    const html = await res2.text();
    const og = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]*)"/);
    if (og) return htmlToText(og[1]);
  }
  return "";
}

function htmlToText(s) {
  return s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();
}

// ---------- Claude ----------

async function extractRecipe(text, cfg) {
  const prompt = `Hier ist die Beschreibung eines Instagram-Kochvideos:

<beschreibung>
${text.slice(0, 8000)}
</beschreibung>

Extrahiere das Rezept und antworte NUR mit JSON in diesem Format:
{
  "name": "kurzer Gerichtname auf Deutsch",
  "servings": "z.B. 2 Portionen (leer wenn unbekannt)",
  "ingredients": ["200 g Spaghetti", "2 Knoblauchzehen", "1 EL Olivenöl"],
  "steps": ["Schritt 1 ...", "Schritt 2 ..."]
}

Regeln:
- Alles auf Deutsch (Schweizer Schreibweise, "ss" statt "ß"), Mengen in metrischen Einheiten (g, ml, EL, TL, Stk.).
- Jede Zutat als kurzer Einkaufslisten-Eintrag: Menge + Zutat.
- Keine Hashtags, Emojis oder Werbung.
- Gibt es kein Rezept im Text, gib "ingredients": [] zurück.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": cfg.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: cfg.CLAUDE_MODEL,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const out = (data.content || []).map((c) => c.text || "").join("");
  const match = out.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Keine gültige Antwort");
  const r = JSON.parse(match[0]);
  return {
    name: String(r.name || "Instagram-Rezept").slice(0, 100),
    servings: String(r.servings || ""),
    ingredients: (r.ingredients || []).map(String).filter(Boolean).slice(0, 60),
    steps: (r.steps || []).map(String).filter(Boolean).slice(0, 40),
  };
}

// ---------- Firebase-Login prüfen (ohne externe Libraries) ----------

let jwksCache = { keys: null, exp: 0 };

async function verifyFirebaseToken(token, projectId) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("bad token");
  const dec = (s) => JSON.parse(new TextDecoder().decode(b64url(s)));
  const header = dec(parts[0]);
  const payload = dec(parts[1]);

  const now = Math.floor(Date.now() / 1000);
  if (header.alg !== "RS256") throw new Error("alg");
  if (payload.aud !== projectId) throw new Error("aud");
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw new Error("iss");
  if (!payload.sub || payload.exp < now || payload.iat > now + 300) throw new Error("time");

  if (!jwksCache.keys || jwksCache.exp < Date.now()) {
    const r = await fetch("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com");
    jwksCache = { keys: (await r.json()).keys, exp: Date.now() + 3600 * 1000 };
  }
  const jwk = jwksCache.keys.find((k) => k.kid === header.kid);
  if (!jwk) throw new Error("kid");

  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    b64url(parts[2]),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
  );
  if (!ok) throw new Error("sig");
  return payload;
}

function b64url(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}
