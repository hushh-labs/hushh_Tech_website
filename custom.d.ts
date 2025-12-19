declare module "*.svg" {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

declare module "*.jpeg" {
  const content: string;
  export default content;
}

declare module "*.webp" {
  const content: string;
  export default content;
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_REDIRECT_URL?: string;
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_FINNHUB_API_KEY?: string;
  
  // KYC A2A Network Configuration
  readonly VITE_KYC_ENV?: 'development' | 'staging' | 'production';
  readonly VITE_KYC_API_BASE?: string;
  readonly VITE_KYC_DEMO_MODE?: string;
  readonly VITE_KYC_TEST_BANK_IDS?: string;
  
  // Development flag
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
