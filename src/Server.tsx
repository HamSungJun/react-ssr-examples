import App from "./App";
import { HelmetProvider, HelmetServerState } from "react-helmet-async";
import { StaticRouter } from "react-router-dom/server";
import { PipeableStream, renderToPipeableStream } from "react-dom/server";
import { Writable } from "node:stream";
import { parse } from "node-html-parser";
import {
  QueryClient,
  QueryClientProvider,
  Hydrate,
  dehydrate,
} from "@tanstack/react-query";

const renderServerApp = async ({ url }: { url: string }) => {
  const queryClient = new QueryClient();
  const dehydratedState = dehydrate(queryClient);
  const helmetContext = {} as { helmet: HelmetServerState };
  const ServerApp = () => (
    <html lang="ko">
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <div id="root">
          <HelmetProvider context={helmetContext}>
            <QueryClientProvider client={queryClient}>
              <Hydrate state={dehydratedState}>
                <StaticRouter location={url}>
                  <App />
                </StaticRouter>
              </Hydrate>
            </QueryClientProvider>
          </HelmetProvider>
        </div>
      </body>
    </html>
  );

  const renderStream = (): Promise<PipeableStream> => {
    return new Promise((resolve, reject) => {
      const stream = renderToPipeableStream(<ServerApp />, {
        onAllReady() {
          resolve(stream);
        },
        onShellError(error) {
          reject(error);
        },
      });
    });
  };

  return {
    stream: await renderStream(),
    helmetContext,
    queryClient,
  };
};

export function renderFromServer(url: string) {
  return new Promise(async (resolve, reject) => {
    const { stream, helmetContext, queryClient } = await renderServerApp({
      url,
    });
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
          ${`<script type="module" src="/src/Client.tsx"></script>`}
          ${helmet.title.toString()}
          ${helmet.meta.toString()}
          ${helmet.link.toString()}
          ${helmet.priority.toString()}
        `.trim();
      }

      if (documentBody) {
        documentBody.innerHTML += `
          ${`<script>window.__REACT_QUERY_STATE__ = ${JSON.stringify(
            dehydrate(queryClient)
          )}</script>`}
        `;
      }

      resolve(document.toString());
      queryClient.clear();
    });
    stream.pipe(writer);
    writer.end();
  });
}
