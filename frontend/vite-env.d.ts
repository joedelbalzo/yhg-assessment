/// <reference types="vite/client" />

interface ImportMetaEnv {
  // readonly VITE_TFOA_SITEPASSWORD: string;
  readonly VITE_API_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
