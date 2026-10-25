# Chrome Web Store listing

Paste these into the Developer Dashboard (https://chrome.google.com/webstore/devconsole).

## Store listing

**Name** (from manifest): ForcesBetter — Codeforces, but nicer

**Summary** (from manifest, 132 chars max):
Dark theme, rounded corners, cleaner spacing, a modern font and Easy/Medium/Hard difficulty tags for Codeforces.

**Category:** Developer Tools

**Language:** English

**Description:**

ForcesBetter gives Codeforces a calm, modern look without changing how it works.

LOOK AND FEEL
• Dark theme with neutral panels, readable formulas and code. Toggle it from the header or follow your system.
• Light theme with the same clean layout.
• Rounded cards instead of corner images. Adjustable radius.
• Modern font (Geist and Geist Mono).
• Six accent colors and an optional wide page.

SOLVING PROBLEMS
• Easy / Medium / Hard tags for every problem, based on its rating (≤1200, 1300–1900, ≥2000).
• One-click difficulty filters in the problem archive.
• Compact time and memory limits with icons.
• Samples side by side, test cases grouped and highlighted on hover.
• A tidy submit form and a dark code editor.

Works on problems, the archive, submit, status, standings, custom test, blogs, contests and profiles.

PRIVACY
No account, no analytics, no network requests. Settings are stored in Chrome sync storage. The only permission is "storage".

Open source: https://github.com/DarkichJs/ForcesBetter
Not affiliated with Codeforces.

## Graphics

- Store icon: `icons/icon128.png`
- Screenshots (1280×800): `store/screenshots/1-dark-theme.png` … `5-settings.png`
- Small promo tile (440×280): `store/promo-tile-440x280.png`

## Privacy practices

**Single purpose:** Restyle codeforces.com pages: dark/light theme, rounded corners, modern font and difficulty tags.

**Permission justification**
- `storage`: saves the user's appearance settings (theme, accent color, corner radius, font, page width).
- Host access (`codeforces.com`, `*.codeforces.com` via content scripts): injects the stylesheet and script that change the page's appearance. No other sites are accessed.

**Remote code:** No, the extension uses no remote code. All scripts, styles and fonts ship in the package.

**Data usage:** The extension does not collect or use any user data. Tick none of the data types and confirm all three certifications.

**Privacy policy URL:** https://github.com/DarkichJs/ForcesBetter/blob/main/PRIVACY.md
