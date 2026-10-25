<p align="center">
  <img src="icons/icon128.png" width="96" alt="ForcesBetter logo">
</p>

<h1 align="center">ForcesBetter</h1>

<p align="center">
  Codeforces, but nicer.<br>
  A dark theme, rounded cards, a modern font and LeetCode-style difficulty tags.
</p>

<p align="center">
  <a href="#install">Install</a> ·
  <a href="#what-it-does">Features</a> ·
  <a href="#updates">Updates</a> ·
  <a href="#privacy">Privacy</a> ·
  <a href="#development">Development</a>
</p>

<p align="center">
  <a href="https://github.com/DarkichJs/ForcesBetter/releases"><img src="https://img.shields.io/github/v/release/DarkichJs/ForcesBetter?label=release&color=2dd4bf" alt="Latest release"></a>
  <img src="https://img.shields.io/badge/Chrome-111%2B-4285F4?logo=googlechrome&logoColor=white" alt="Chrome 111 and newer">
  <img src="https://img.shields.io/badge/manifest-v3-8b5cf6" alt="Manifest V3">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license"></a>
</p>

<p align="center">
  <img src="store/screenshots/1-dark-theme.png" width="49%" alt="Problem page in the dark theme">
  <img src="store/screenshots/2-difficulty.png" width="49%" alt="Problem archive with Easy, Medium and Hard tags">
</p>

ForcesBetter restyles [Codeforces](https://codeforces.com) without changing how it works. Every page you use while solving gets the same calm look: problems, the archive, submit, status, standings, custom test, blogs, contests and profiles. No account, no tracking, no network requests of its own.

## What it does

### Look and feel

- **Dark theme.** Neutral dark panels with a soft glow, readable formulas and code. Switch it from the ☾ / ☀ button in the site header, or follow your system setting.
- **Light theme.** The same clean layout on a light background.
- **Rounded cards.** Corner images and hard borders are replaced with rounded cards. The radius is adjustable from 0 to 20 px.
- **Modern font.** Geist and Geist Mono instead of the default Verdana and Courier.
- **Accent color.** Teal, blue, violet, green, amber or red for links, buttons and highlights.
- **Wide page.** Optionally let the layout use the full width of large screens.

### Solving problems

- **Difficulty levels.** Every problem gets an **Easy**, **Medium** or **Hard** tag based on its rating: up to 1200, 1300 to 1900, and 2000 and above.
- **One-click filters.** Easy / Medium / Hard buttons in the archive's *Filter Problems* box fill in the rating range for you.
- **Clear limits.** Time and memory limits, input and output files are shown as a compact row with icons.
- **Readable samples.** Input and output sit side by side. Test cases in multi-test input are grouped, and hovering a line highlights its whole test.
- **Tidy submit form.** The sidebar submit box is laid out vertically with a full-width button, and the dark theme covers the code editor.

<p align="center">
  <img src="store/screenshots/3-samples.png" width="49%" alt="Samples with grouped test cases">
  <img src="store/screenshots/4-light-theme.png" width="49%" alt="Problem page in the light theme">
</p>

### Settings

Everything is configured from the toolbar popup and follows you to other devices through Chrome sync.

<p align="center">
  <img src="store/screenshots/5-settings.png" width="640" alt="The settings popup">
</p>

## Install

**Chrome Web Store.** Coming soon.

**From a release.**

1. Download `forcesbetter-<version>.zip` from [Releases](https://github.com/DarkichJs/ForcesBetter/releases) and unzip it.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and choose the unzipped folder.

**From source.** Clone the repository and load its folder the same way.

Works in Chrome 111+ and other Chromium browsers (Edge, Brave, Arc, Opera).

## Updates

Installs from the Chrome Web Store update themselves. Chrome checks for a new version every few hours and installs it in the background, so there is nothing to do. Your settings are kept.

Unpacked installs don't update automatically. Download the new release and click **Reload** on the extension card in `chrome://extensions`.

## Privacy

ForcesBetter collects nothing. Settings are stored with `chrome.storage.sync` and never leave your browser except through Chrome's own sync. The extension only runs on `codeforces.com` and asks for no permissions beyond storage. See [PRIVACY.md](PRIVACY.md).

## Development

```
src/        content script and styles injected into codeforces.com
popup/      toolbar popup with the settings
icons/      extension icons
fonts/      Geist and Geist Mono (SIL OFL 1.1)
store/      Chrome Web Store listing text and images
scripts/    packaging
```

Load the folder as an unpacked extension, edit, then click **Reload** in `chrome://extensions` and refresh the Codeforces tab.

### Releasing

1. Build the upload: `scripts/package.sh 1.0.1` bumps the version in `manifest.json` and writes `dist/forcesbetter-1.0.1.zip`.
2. Commit, tag `v1.0.1` and push the tag.
3. The [Release workflow](.github/workflows/release.yml) uploads the zip to the Chrome Web Store, publishes it and attaches it to a GitHub release.

The workflow needs four repository secrets: `CWS_EXTENSION_ID`, `CWS_CLIENT_ID`, `CWS_CLIENT_SECRET` and `CWS_REFRESH_TOKEN`. The [chrome-webstore-upload guide](https://github.com/fregante/chrome-webstore-upload-keys) explains how to get them. Until they are set, upload the zip by hand in the [Developer Dashboard](https://chrome.google.com/webstore/devconsole).

## License

[MIT](LICENSE). Geist fonts by Vercel under the [SIL Open Font License](fonts/OFL.txt). Not affiliated with Codeforces.
