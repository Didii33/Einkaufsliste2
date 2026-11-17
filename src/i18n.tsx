import { createContext, ReactNode, useContext, useState } from "react";

export type Lang = "de" | "en";

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "de", label: "🇨🇭 Deutsch" },
  { code: "en", label: "🇬🇧 English" },
];

const de = {
  // Navigation
  navList: "Liste",
  navMenus: "Menüs",
  navRecipes: "Rezepte",
  navSettings: "Einstellungen",

  appTitle: "{name}'s Einkaufsliste 🛒",

  // Einkaufsliste
  product: "Produkt",
  deleteSelected: "Ausgewählte löschen",

  // Menüs
  menu: "Menü",
  addProduct: "Produkt hinzufügen",
  selectAll: "Alle auswählen",
  selectNone: "Keine auswählen",
  toShopping: "➜ Einkaufsliste",
  preparation: "👨‍🍳 Zubereitung",
  links: "🔗 Links",
  link: "Link",
  back: "⬅ Zurück",

  // Instagram-Import
  igTitle: "📸 Menü aus Instagram-Video",
  igPlaceholder: "Instagram-Link einfügen",
  igCaptionPlaceholder:
    "Beschreibung des Videos hier einfügen (in Instagram: Text antippen → kopieren)",
  igCreate: "✨ Menü erstellen",
  igLoading: "⏳ Rezept wird erstellt...",
  igPasteText: "Text einfügen",
  pasteDenied: "Einfügen nicht erlaubt – Link bitte manuell einfügen.",
  unknownError: "Unbekannter Fehler",

  // Rezepte
  recipe: "Rezept",
  toMenu: "➜ Ausgewählte in Menü",

  // Löschen
  confirmTitle: "Löschen bestätigen",
  confirmDeleteChecked: "Willst du {n} ausgewählte Einträge wirklich löschen?",
  confirmDeleteItem: "Willst du diesen Eintrag wirklich löschen?",
  confirmDeleteMenu: "Willst du dieses Menü wirklich löschen?",
  confirmDeleteRecipe: "Willst du dieses Rezept wirklich löschen?",
  confirmDeleteProduct: "Willst du dieses Produkt wirklich löschen?",
  confirmDeleteLink: "Willst du diesen Link wirklich löschen?",
  cancel: "Abbrechen",
  delete: "Löschen",
  deleting: "Lösche...",

  // Einstellungen
  settingsTitle: "Einstellungen",
  language: "Sprache",
  syncText:
    "Falls die PWA noch eine alte Version zeigt, hier auf Synchronisieren klicken. Die App lädt danach direkt die neueste Version.",
  syncNow: "Jetzt synchronisieren",
  syncing: "Synchronisiere...",
  syncRunning: "Synchronisierung läuft...",
  syncLoading: "Neueste Version wird geladen...",
  syncFailed: "Synchronisierung fehlgeschlagen. Bitte Seite neu laden.",
  logout: "Logout",
  loggingOut: "Logge aus...",
  donateTitle: "☕ App unterstützen",
  donateText: "Gefällt dir die App? Über eine kleine Spende freue ich mich.",
  donateButton: "Mit PayPal spenden",
  myGithub: "1. Mein GitHub",
  byNicola: "2. by Nicola",

  // Login
  loginKicker: "Einkaufsliste",
  loginCreateTitle: "Account erstellen",
  loginWelcomeTitle: "Willkommen zurück",
  loginCreateSubtitle: "Erstelle dein Konto und starte direkt.",
  loginWelcomeSubtitle: "Melde dich an, um deine Listen weiterzuführen.",
  loginTab: "Login",
  registerTab: "Registrierung",
  email: "E-Mail",
  password: "Passwort",
  passwordPlaceholder: "Mindestens 6 Zeichen",
  pleaseWait: "Bitte warten...",
  register: "Registrieren",
  signIn: "Einloggen",
  registerFailed: "Registrierung fehlgeschlagen.",
  loginFailed: "Login fehlgeschlagen.",
};

export type TKey = keyof typeof de;

const en: Record<TKey, string> = {
  navList: "List",
  navMenus: "Menus",
  navRecipes: "Recipes",
  navSettings: "Settings",

  appTitle: "{name}'s shopping list 🛒",

  product: "Product",
  deleteSelected: "Delete selected",

  menu: "Menu",
  addProduct: "Add product",
  selectAll: "Select all",
  selectNone: "Select none",
  toShopping: "➜ Shopping list",
  preparation: "👨‍🍳 Preparation",
  links: "🔗 Links",
  link: "Link",
  back: "⬅ Back",

  igTitle: "📸 Menu from Instagram video",
  igPlaceholder: "Paste Instagram link",
  igCaptionPlaceholder:
    "Paste the video description here (in Instagram: tap the text → copy)",
  igCreate: "✨ Create menu",
  igLoading: "⏳ Creating recipe...",
  igPasteText: "Paste text",
  pasteDenied: "Pasting not allowed – please paste the link manually.",
  unknownError: "Unknown error",

  recipe: "Recipe",
  toMenu: "➜ Selected to menu",

  confirmTitle: "Confirm delete",
  confirmDeleteChecked: "Do you really want to delete {n} selected items?",
  confirmDeleteItem: "Do you really want to delete this item?",
  confirmDeleteMenu: "Do you really want to delete this menu?",
  confirmDeleteRecipe: "Do you really want to delete this recipe?",
  confirmDeleteProduct: "Do you really want to delete this product?",
  confirmDeleteLink: "Do you really want to delete this link?",
  cancel: "Cancel",
  delete: "Delete",
  deleting: "Deleting...",

  settingsTitle: "Settings",
  language: "Language",
  syncText:
    "If the app still shows an old version, tap Sync. The app will then load the latest version.",
  syncNow: "Sync now",
  syncing: "Syncing...",
  syncRunning: "Syncing...",
  syncLoading: "Loading latest version...",
  syncFailed: "Sync failed. Please reload the page.",
  logout: "Log out",
  loggingOut: "Logging out...",
  donateTitle: "☕ Support the app",
  donateText: "Enjoying the app? A small donation is much appreciated.",
  donateButton: "Donate with PayPal",
  myGithub: "1. My GitHub",
  byNicola: "2. by Nicola",

  loginKicker: "Shopping list",
  loginCreateTitle: "Create account",
  loginWelcomeTitle: "Welcome back",
  loginCreateSubtitle: "Create your account and get started.",
  loginWelcomeSubtitle: "Sign in to continue with your lists.",
  loginTab: "Login",
  registerTab: "Sign up",
  email: "Email",
  password: "Password",
  passwordPlaceholder: "At least 6 characters",
  pleaseWait: "Please wait...",
  register: "Sign up",
  signIn: "Sign in",
  registerFailed: "Sign up failed.",
  loginFailed: "Login failed.",
};

const DICT: Record<Lang, Record<TKey, string>> = { de, en };
const STORAGE_KEY = "lang";

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "de" || saved === "en") return saved;
  } catch {}
  const browser = (navigator.language || "de").toLowerCase();
  return browser.startsWith("de") ? "de" : "en";
}

interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
    document.documentElement.lang = l;
  };

  const t = (key: TKey, vars?: Record<string, string | number>) => {
    let s = DICT[lang][key] ?? DICT.de[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
    return s;
  };

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
