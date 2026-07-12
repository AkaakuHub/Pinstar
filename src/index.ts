import { PinstarApp } from "./app";
import { VERSION } from "./config";
import type { RuntimeHandle } from "./types";
import { describeError } from "./utils";

declare global {
  interface Window {
    __PINSTAR__?: RuntimeHandle;
  }
}

try {
  window.__PINSTAR__?.destroy();
  const app = new PinstarApp();
  app.start();
  window.__PINSTAR__ = {
    version: VERSION,
    destroy: () => {
      app.destroy();
      if (window.__PINSTAR__?.version === VERSION) delete window.__PINSTAR__;
    },
  };
} catch (error) {
  console.error("[Pinstar] fatal", error);
  alert(`Pinstarの起動に失敗しました。\n${describeError(error)}`);
}
