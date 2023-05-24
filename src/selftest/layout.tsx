import { html, raw } from 'hono/html';

export const Layout = (props: LayoutProps) => {
  const css = props.css ? `<link rel="stylesheet" href="${props.css}" />` : '';
  return html`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>${props.title}</title>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <!--link rel="manifest" href="/site.webmanifest" /-->
        <!-- fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Serif+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600& display=swap"
          rel="stylesheet"
        />
        <link href="/static/css/modern-normalize.css" rel="stylesheet" />
        <link href="/static/css/lf.css" rel="stylesheet" />
        <link href="/static/css/aces.css" rel="stylesheet" />
        ${css}
        <script>
          const _VERSION_ = '${props.version}';
          const _ROWID_ = '${props.rowid}';
          const _SEQUENCE_ = '${props.sequence}';
          const _BATCH_ = '${props.user.batch}';
          const _USER_ = ${raw(JSON.stringify(props.user))};
          const _SERVERTIME_ = ${new Date().getTime()};
        </script>
      </head>
      <body>
        ${props.children}
        <script src="${props.script}"></script>
      </body>
    </html>`;
};