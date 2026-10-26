# Your own short-link service (free, about 5 minutes)

Public shorteners (is.gd, TinyURL) sometimes refuse or time out. This small
Cloudflare Worker gives UPIlink links its own reliable shortener, e.g.
`https://upilink-go.your-name.workers.dev/Ab3dEf7`.

Cloudflare's free plan covers this comfortably (100,000 requests a day).

## Set it up

1. Make a free account at <https://dash.cloudflare.com>.
2. On a computer with Node.js, open a terminal in this `worker` folder and run:

   ```bash
   npx wrangler login
   npx wrangler kv namespace create LINKS
   ```

3. Copy the `id` it prints into `wrangler.toml` (replace `PASTE_YOUR_KV_NAMESPACE_ID_HERE`).
4. Check `SITE_ORIGIN` and `SITE_PATH` in `wrangler.toml` match your GitHub Pages address.
5. Deploy:

   ```bash
   npx wrangler deploy
   ```

   It prints your worker address, like `https://upilink-go.your-name.workers.dev`.
6. Put that address in `js/config.js`:

   ```js
   window.LINKPE_CONFIG = { shortenerUrl: "https://upilink-go.your-name.workers.dev" };
   ```

7. Add this line to `linkpe.html`, just above `<script src="js/linkpe.js">`:

   ```html
   <script src="js/config.js"></script>
   ```

   (Already done if you use the latest zip.)

Commit and push. New links will use your shortener first, and fall back to the
public ones only if your worker is unreachable.

## Good to know

- It only accepts links to your own payment page, so nobody can use it to hide other websites.
- The same payment link always gets the same short code.
- For a nicer address (`go.yourdomain.com/Ab3dEf7`) attach a custom domain to the worker in the Cloudflare dashboard.
