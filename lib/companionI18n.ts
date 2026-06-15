import type { LanguageCode } from "@/lib/companionLanguage";
import { effectiveOutputLanguage } from "@/lib/companionLanguage";

export type UiTranslationKey =
  | "settings.title"
  | "settings.language"
  | "settings.languageHint"
  | "settings.companionResponseLanguage"
  | "settings.interfaceLanguage"
  | "settings.contentLanguage"
  | "settings.voiceLanguage"
  | "auth.welcome"
  | "auth.signIn"
  | "auth.signUp"
  | "auth.createAccount"
  | "auth.email"
  | "auth.password"
  | "auth.yourName"
  | "nav.home"
  | "nav.settings";

const EN: Record<UiTranslationKey, string> = {
  "settings.title": "Settings",
  "settings.language": "Language & Communication",
  "settings.languageHint":
    "Choose your app language. Shari replies in this language unless you ask otherwise.",
  "settings.companionResponseLanguage": "App language",
  "settings.interfaceLanguage": "Interface language",
  "settings.contentLanguage": "Content creation language",
  "settings.voiceLanguage": "Voice language",
  "auth.welcome": "Welcome to your ADHD Ecosystem",
  "auth.signIn": "Sign in",
  "auth.signUp": "Create your account",
  "auth.createAccount": "Create account",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.yourName": "Your name",
  "nav.home": "Home",
  "nav.settings": "Settings",
};

const ES: Partial<Record<UiTranslationKey, string>> = {
  "settings.title": "Configuración",
  "settings.language": "Idioma y comunicación",
  "settings.languageHint":
    "Elige el idioma de la app. Shari responderá en este idioma salvo que pidas otro.",
  "settings.companionResponseLanguage": "Idioma de la app",
  "settings.interfaceLanguage": "Idioma de la interfaz",
  "settings.contentLanguage": "Idioma de contenido",
  "settings.voiceLanguage": "Idioma de voz",
  "auth.welcome": "Bienvenido a tu Ecosistema TDAH",
  "auth.signIn": "Iniciar sesión",
  "auth.signUp": "Crear tu cuenta",
  "auth.createAccount": "Crear cuenta",
  "auth.email": "Correo",
  "auth.password": "Contraseña",
  "auth.yourName": "Tu nombre",
  "nav.home": "Inicio",
  "nav.settings": "Configuración",
};

const UR: Partial<Record<UiTranslationKey, string>> = {
  "settings.title": "ترتیبات",
  "settings.language": "زبان اور رابطہ",
  "settings.languageHint":
    "اپنی ایپ کی زبان منتخب کریں۔ شاری اسی زبان میں جواب دے گی جب تک آپ کچھ اور نہ کہیں۔",
  "settings.companionResponseLanguage": "ایپ کی زبان",
  "settings.interfaceLanguage": "انٹرفیس کی زبان",
  "settings.contentLanguage": "مواد کی زبان",
  "settings.voiceLanguage": "آواز کی زبان",
  "auth.welcome": "اپنے ADHD ایکو سسٹم میں خوش آمدید",
  "auth.signIn": "سائن ان",
  "auth.signUp": "اکاؤنٹ بنائیں",
  "auth.createAccount": "اکاؤنٹ بنائیں",
  "auth.email": "ای میل",
  "auth.password": "پاس ورڈ",
  "auth.yourName": "آپ کا نام",
  "nav.home": "ہوم",
  "nav.settings": "ترتیبات",
};

const TL: Partial<Record<UiTranslationKey, string>> = {
  "settings.title": "Mga Setting",
  "settings.language": "Wika at komunikasyon",
  "settings.languageHint":
    "Piliin ang wika ng app. Sasagot si Shari sa wikang ito maliban kung humiling ka ng iba.",
  "settings.companionResponseLanguage": "Wika ng app",
  "settings.interfaceLanguage": "Wika ng interface",
  "settings.contentLanguage": "Wika ng nilalaman",
  "settings.voiceLanguage": "Wika ng boses",
  "auth.welcome": "Maligayang pagdating sa iyong ADHD Ecosystem",
  "auth.signIn": "Mag-sign in",
  "auth.signUp": "Gumawa ng account",
  "auth.createAccount": "Gumawa ng account",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.yourName": "Iyong pangalan",
  "nav.home": "Home",
  "nav.settings": "Mga Setting",
};

const PACKS: Partial<Record<LanguageCode, Partial<Record<UiTranslationKey, string>>>> = {
  en: EN,
  es: ES,
  ur: UR,
  tl: TL,
};

export function getUiString(
  key: UiTranslationKey,
  language: LanguageCode,
): string {
  const lang = effectiveOutputLanguage(language);
  return PACKS[lang]?.[key] ?? EN[key];
}
