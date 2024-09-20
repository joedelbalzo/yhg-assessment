/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_ENV: string;
  readonly VITE_CODE_WORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
