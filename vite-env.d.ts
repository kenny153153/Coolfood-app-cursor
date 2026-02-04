/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_PUBLIC_SUPABASE?: string;
  readonly VITE_PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_AIRWALLEX_CLIENT_ID?: string;
  readonly VITE_AIRWALLEX_API_KEY?: string;
  readonly VITE_AIRWALLEX_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
