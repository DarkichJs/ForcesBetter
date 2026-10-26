# Chrome Web Store listing

Paste these into the Developer Dashboard (https://chrome.google.com/webstore/devconsole).

## Store listing

**Name** (from manifest): ForcesBetter — Codeforces, but nicer

**Summary** (from manifest, 132 chars max):
Dark theme, a code editor with sample tests beside the statement, rounded cards and Easy/Medium/Hard tags for Codeforces.

**Category:** Developer Tools

**Language:** English

**Description:**

ForcesBetter gives Codeforces a calm, modern look and a code editor right next to the problem.

CODE EDITOR
• The statement on the left, an editor on the right, like on modern judges. Drag to resize.
• Syntax highlighting and autocompletion for C++, Python, Java, Kotlin, Rust, Go and more.
• Run your code on your own input, or check it against every sample in one click. Codeforces runs it through its Custom Invocation, so you get real verdicts, time and memory.
• The Samples tab shows each input with its expected answer and your output.
• Submit sends the code to the Codeforces submit form with the problem and language filled in.
• Drafts are saved per problem. Optional focus mode hides the site navigation.

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
• A tidy submit form, an optional hidden footer.

Works on problems, the archive, submit, status, standings, custom test, blogs, contests and profiles.

PRIVACY
No analytics and no servers of our own. Code is only sent to codeforces.com, when you press Run, Samples or Submit. Settings are stored in Chrome sync storage. The only permission is "storage".

Open source: https://github.com/DarkichJs/ForcesBetter
Not affiliated with Codeforces.

## Graphics

- Store icon: `icons/icon128.png`
- Screenshots (1280×800): `store/screenshots/1-dark-theme.png` … `5-settings.png`
- Small promo tile (440×280): `store/promo-tile-440x280.png`

## Privacy practices

**Single purpose:** Improve solving problems on codeforces.com: a cleaner dark/light look, difficulty tags and a code editor with sample testing next to the statement.

**Permission justification**
- `storage`: saves the user's appearance settings (theme, accent color, corner radius, font, page width).
- Host access (`codeforces.com`, `*.codeforces.com` via content scripts): injects the stylesheet and scripts that change the page's appearance and add the code editor. On Run, the editor posts the code to Codeforces' own Custom Invocation in the user's session. No other sites are accessed.

**Remote code:** No, the extension uses no remote code. All scripts (including the bundled Ace editor), styles and fonts ship in the package.

**Data usage:** The extension does not collect user data: code is only sent to codeforces.com at the user's request, never to the developer. Tick none of the data types and confirm all three certifications.

**Privacy policy URL:** https://github.com/DarkichJs/ForcesBetter/blob/main/PRIVACY.md
