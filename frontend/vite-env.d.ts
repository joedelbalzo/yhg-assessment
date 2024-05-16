/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Declare each custom environment variable as a string.
  // Adjust the names as necessary to match your actual environment variables.
  readonly VITE_TFOA_SITEPASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
