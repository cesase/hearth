# Hearth Lessons (agent / maintainer)

Rules learned from shipping Hearth and from Toju’s engineering notes. Keep short.

### Display media handler is a singleton [electron] [screen]

- **Trigger:** Re-registering `setDisplayMediaRequestHandler` on every window create.
- **Rule:** Register once per process via `main/display-media.js` guard.
- **Why:** Tray/recreate installs stacked handlers; capture becomes flaky.
- **Example:** `setupDisplayMedia()` early-returns if already configured.

### File admit once [transfer]

- **Trigger:** Decline then drag-drop “dead” or 30s timeout.
- **Rule:** Reset `sendFileBusy` / listen for `file-abort` immediately; chunk path must not re-reject admitted transfers.
- **Why:** Silent timeouts look like “network broken”.

### UI lab before release [testing]

- **Trigger:** “Small fix, no need to test”.
- **Rule:** Run `npm run ui:smoke` after UI or settings changes; keep real userData isolated with `HEARTH_USER_DATA`.
- **Why:** Theme/i18n/modal regressions return otherwise.

### Don’t replace Hearth with full Toju fork [architecture]

- **Trigger:** “Just use Toju as the app”.
- **Rule:** Port **patterns** (signaling, media cleanup, e2e); keep Hearth friend-centric surface.
- **Why:** Angular monorepo scope ≠ Hearth product; months of wrong fit.

### Release gate [release]

- **Trigger:** Version bump without checklist.
- **Rule:** smoke green → setup → GitHub release with `latest.yml` for electron-updater.
- **Why:** Users install broken builds.
