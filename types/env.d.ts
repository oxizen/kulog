/// <reference types="vite/client" />

interface ImportMetaEnv extends NodeJS.ProcessEnv {
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    MODE: 'development' | 'production';
    VITE_DEV_SERVER_URL: string;
    VITE_DEBUG?: string;
  }
}

