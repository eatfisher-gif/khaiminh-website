# Khai Minh Website

Static company website for Khai Minh Group.

## Structure

```text
khaiminh-website/
├── index.html
├── service.html
├── quote.html
├── assets/
│   ├── css/styles.css
│   ├── img/cases/
│   └── js/
│       ├── config.js
│       ├── i18n.js
│       └── main.js
└── i18n/
    ├── tw.json
    ├── vn.json
    └── en.json
```

## Contact Data

Contact data is centralized in `assets/js/config.js`.

- Company: Khai Minh Group / 開明集團
- Tax code: `3604066672`
- Contact: Joseph / 李旭斌
- Phone, Zalo: `0908 421 410`
- Email: `khaiminhgroup11668@gmail.com`
- Area: Dong Nai, Ho Chi Minh City and nearby industrial zones

To change phone, Zalo, email, tax code or service area later, update only:

```text
assets/js/config.js
```

## Before Launch

1. Confirm contact settings in `assets/js/config.js`:

   ```text
   khaiminhgroup11668@gmail.com
   ```

2. Verify the Zalo link:

   ```html
   https://zalo.me/84908421410
   ```

3. Verify the email link:

   ```html
   mailto:khaiminhgroup11668@gmail.com
   ```

## Notification Setup

The lowest-cost setup is:

- Quote form: browser `mailto:` email draft
- Floating contact buttons: Zalo, phone and email
- Hosting: Cloudflare Pages free plan

This setup has no Formspree or backend account requirement. The tradeoff is that the visitor's device must have an email app or webmail handler configured. For urgent cases, the floating Zalo and phone buttons remain the primary fallback.

Zalo is used as a direct customer contact channel through `zalo.me`. Automatic server-side Zalo push messages are not included in this simple setup because Zalo Official Account API requires OA/app/token setup and extra approval work.

## Cloudflare Pages Deployment

1. Push this folder to GitHub.
2. In Cloudflare Pages, create a new project from the repository.
3. Use these settings:
   - Framework preset: None
   - Build command: empty
   - Build output directory: `/`
4. Add the custom domain after the first successful deployment.

Because this is a static site, no server is needed for normal page hosting.

## Local Preview

Open `index.html` directly in a browser for a quick check. For language JSON loading, use a local static server:

```powershell
cd khaiminh-website
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```
