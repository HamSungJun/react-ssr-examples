import App from "./App";
import { HelmetProvider, HelmetServerState } from "react-helmet-async";
import { StaticRouter } from "react-router-dom/server";
import { renderToString } from "react-dom/server";
import { parse } from "node-html-parser";

const helmetContext = {} as { helmet: HelmetServerState };

const ServerApp = ({ url }: { url: string }) => {
  return (
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </HelmetProvider>
  );
};

export function renderFromServer(template: string, url: string) {
  const reactAppExecutedHtml = renderToString(<ServerApp url={url} />);
  const reactRenderedHtml = parse(
    template.replace("<!--SSR-OUTLET-->", reactAppExecutedHtml)
  );

  const head = reactRenderedHtml.querySelector("head");
  const { helmet } = helmetContext;

  if (head) {
    head.innerHTML = `
        ${head.innerHTML}
        ${helmet.title.toString()}
        ${helmet.link.toString()}
        ${helmet.meta.toString()}
    `;
  }

  return reactRenderedHtml.toString();
}
