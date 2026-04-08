

# Fix: WhatsApp/Social Preview — Remove "Financial Planning"

The `index.html` file contains Open Graph and Twitter meta tags that WhatsApp uses for link previews. Multiple instances of "Financial Planning" and "advisory services" need to be replaced.

## Changes in `index.html`

| Line | Current | Updated |
|------|---------|---------|
| 6 | `<title>Balancing Act — Financial Planning Built on Discipline, Clarity and Trust</title>` | `<title>Balancing Act — Investing Built on Discipline, Clarity and Trust</title>` |
| 7 | `...personalized, unbiased financial planning and advisory services...` | `...personalized, unbiased investment strategies for Indian residents and NRIs...` |
| 14 | `og:title` — same "Financial Planning" text | Same fix as title |
| 15 | `og:description` — same "financial planning and advisory" text | Same fix as description |
| 22 | `twitter:title` — same | Same fix |
| 23 | `twitter:description` — same | Same fix |

**Note**: After deploying, WhatsApp caches previews. You may need to wait or use [Facebook's Sharing Debugger](https://developers.facebook.com/tools/debug/) to force a refresh of the cached preview.

## Files to edit: 1 (`index.html`)

