import App from "./App";
import { HelmetProvider, HelmetServerState } from "react-helmet-async";
import { StaticRouter } from "react-router-dom/server";
import { PipeableStream, renderToPipeableStream } from "react-dom/server";
import { Writable } from "node:stream";
import { parse } from "node-html-parser";

const helmetContext = {} as { helmet: HelmetServerState };

const ServerApp = ({ url }: { url: string }) => {
  return (
    <html lang="ko">
      <head>
        <meta charSet="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <div id="root">
          <HelmetProvider context={helmetContext}>
            <StaticRouter location={url}>
              <App />
            </StaticRouter>
          </HelmetProvider>
        </div>
      </body>
    </html>
  );
};

const getPipeableStream = (url: string): Promise<PipeableStream> => {
  return new Promise((resolve, reject) => {
    const stream = renderToPipeableStream(<ServerApp url={url} />, {
      onAllReady() {
        resolve(stream);
      },
      onShellError(error) {
        reject(error);
      },
    });
  });
};

export function renderFromServer(url: string) {
  return new Promise(async (resolve, reject) => {
    const allResolvedStream = await getPipeableStream(url);
    const streamBuffer: Uint8Array[] = [];
    const writer = new Writable({
      write(chunk, _, callback) {
        streamBuffer.push(chunk);
        callback();
      },
    });
    writer.on("finish", () => {
      const streamToHtmlStr = streamBuffer.toString().trim();

      const document = parse(streamToHtmlStr);
      const documentHead = document.querySelector("head");
      const documentBody = document.querySelector("body");

      const { helmet } = helmetContext;

      if (documentHead) {
        documentHead.innerHTML = `
          ${documentHead.innerHTML}
          ${`
            <script type="module">
              import RefreshRuntime from "/@react-refresh"
              RefreshRuntime.injectIntoGlobalHook(window)
              window.$RefreshReg$ = () => {}
              window.$RefreshSig$ = () => (type) => type
              window.__vite_plugin_react_preamble_installed__ = true
            </script>
          `}
          ${`<script type="module" src="/@vite/client"></script>`}
          ${helmet.title.toString()}
          ${helmet.meta.toString()}
          ${helmet.link.toString()}
          ${helmet.priority.toString()}
        `.trim();
      }

      if (documentBody) {
        documentBody.innerHTML = `
          ${documentBody.innerHTML}
          <script type="module" src="/src/Client.tsx"></script>
        `.trim();
      }

      resolve(document.toString());
    });
    allResolvedStream.pipe(writer);
  });
}
