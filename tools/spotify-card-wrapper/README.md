# spotify-card-wrapper

> **Status: not in use.** Kept just in case. The profile README links the
> kittinanx card directly.

## Why it exists

The [kittinan/spotify-github-profile](https://github.com/kittinan/spotify-github-profile)
card is a fixed `320x445` SVG. When a song title wraps to two lines, the content
overflows and the bottom (cover image and rounded corners) gets clipped.

GitHub strips `style`, `class` and positioning from README HTML, so the card
cannot be layered or padded from the README itself.

This wrapper fixes it server side: it fetches the original card, then nests it
inside a slightly larger SVG with a rounded backdrop in the card's own
background color. The clipped edge blends into the backdrop.

## When to use it

- Long song titles make the card bottom look cut off and that becomes annoying.

## Run locally

```sh
bun run start            # port 3000
PORT=3456 bun run start  # pick a port if 3000 is taken
```

Open:

```
http://localhost:3000/api/spotify?uid=217txkwdxtvo6t7ddgwgvpzsi&cover_image=true&theme=default&show_offline=false&background_color=333346&interchange=true&profanity=false&hide_remaster=false&bar_color=ffffff&bar_color_cover=true
```

All query parameters are forwarded unchanged to the kittinanx card.

## Deploy (when needed)

Needs a public host so GitHub's image proxy can reach it:

- Vercel with the Bun runtime: add `vercel.json` with `{ "bunVersion": "1.x" }`,
  check the current `Bun.serve` entrypoint docs, then `bunx vercel --prod`.
- Or any VPS: `bun run start` behind a domain.

Then replace only the host and path of the profile README `src`:

```
https://spotify-github-profile.kittinanx.com/api/view?...  ->  https://<host>/api/spotify?...
```

## Tuning

- `MARGIN` in `server.ts`: backdrop gap per side (px).
- `RADIUS` in `server.ts`: backdrop corner radius (px).

## If the card breaks

If the wrapper shows "Spotify card unavailable", the upstream token was revoked.
Re-login at https://spotify-github-profile.kittinanx.com/api/login.
