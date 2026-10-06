// Wraps the kittinan/spotify-github-profile card in a rounded backdrop
// so the clipped bottom edge blends into a full rounded-corner card.
const UPSTREAM = "https://spotify-github-profile.kittinanx.com/api/view";
const MARGIN = 10; // gap between backdrop edge and card, px
const RADIUS = 14; // backdrop corner radius, px

const headers = {
  "Content-Type": "image/svg+xml; charset=utf-8",
  "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate",
};

function errorSvg(message: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="340" height="60">
  <rect width="340" height="60" rx="${RADIUS}" fill="#333346"/>
  <text x="170" y="35" fill="#b3b3b3" font-family="Segoe UI, Helvetica, Arial, sans-serif"
        font-size="14" text-anchor="middle">${message}</text>
</svg>`;
}

async function wrapCard(search: string): Promise<Response> {
  let card: string;
  try {
    const upstream = await fetch(UPSTREAM + search);
    card = await upstream.text();
    if (!upstream.ok || !card.trimStart().startsWith("<svg")) throw new Error(card.slice(0, 120));
  } catch {
    return new Response(errorSvg("Spotify card unavailable - re-login may be needed"), { status: 502, headers });
  }

  const width = Number(card.match(/<svg[^>]*?\swidth="(\d+)"/)?.[1] ?? 320);
  const height = Number(card.match(/<svg[^>]*?\sheight="(\d+)"/)?.[1] ?? 445);

  // Backdrop color = the card's own .container background-color
  const bg = card.match(/\.container\s*{[^}]*?background-color:\s*(#[0-9a-fA-F]{3,8})/)?.[1] ?? "#181414";

  // Nest the original card as an inner <svg> shifted by MARGIN
  const inner = card.replace(/<\?xml[^>]*\?>/, "").replace(/<svg\b/, `<svg x="${MARGIN}" y="${MARGIN}"`);

  const W = width + MARGIN * 2;
  const H = height + MARGIN * 2;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" rx="${RADIUS}" fill="${bg}"/>
  ${inner}
</svg>`;
  return new Response(svg, { headers });
}

export default Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/api/spotify") return wrapCard(url.search);
    return new Response("Not found", { status: 404 });
  },
});
