// URL deines Cloudflare Workers (siehe rezept-worker/worker.js)
// Beispiel: "https://rezept.DEINNAME.workers.dev"
export const RECIPE_API_URL = "https://rezept.DEINNAME.workers.dev";

export interface ImportedRecipe {
  name: string;
  servings: string;
  ingredients: string[];
  steps: string[];
}

export class RecipeImportError extends Error {
  needCaption: boolean;
  constructor(message: string, needCaption = false) {
    super(message);
    this.needCaption = needCaption;
  }
}

export async function importRecipe(
  idToken: string,
  url: string,
  caption?: string
): Promise<ImportedRecipe> {
  let res: Response;
  try {
    res = await fetch(RECIPE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ url, caption: caption || undefined }),
    });
  } catch {
    throw new RecipeImportError("Server nicht erreichbar. Ist die Worker-URL eingetragen?");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new RecipeImportError(data.error || `Fehler ${res.status}`, !!data.needCaption);
  }
  return data as ImportedRecipe;
}
