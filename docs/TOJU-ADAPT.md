# Toju → Hearth adaptation map

Source: `C:\Users\Faruk\Desktop\toju` (MetoYou/Toju monorepo).

## Take

| Pattern | Toju location | Hearth status |
|---------|---------------|---------------|
| Display-media singleton | `electron/window/display-media-handler.rules.ts` | **Done** — `main/display-media.js` |
| Packaged icon paths | `electron/window/create-window.ts` `getAssetPath` | **Done** — `main/icon.js` |
| Stream cleanup invariants | `agents-docs/features/voice-webrtc.md` | **In progress** — hangup/endCallUi |
| Own WS signaling | `server/` + signaling.md | Phase 2 (planned) |
| RNNoise worklet | `@timephy/rnnoise-wasm` + bundle script | Deferred (optional) |
| Multi-client e2e | `e2e/tests/voice/*` | Phase 4 |
| Domain modules | `toju-app/src/app/domains/*` | Phase 3 (`app.js` split) |
| Attachment admit-once | LESSONS attachments | Partially (file-offer + busy reset) |

## Do not take

| Item | Reason |
|------|--------|
| Full Angular client | Wrong product/stack fit |
| Rooms/plugins/CQRS | Out of Hearth MVP scope |
| Gitea release scripts | We use GitHub Releases |

## Phase order

0. Docs (this file, ARCHITECTURE, LESSONS)  
1. Electron media/icon invariants ← **current**  
2. Own signal server + RTCPeerConnection  
3. Split `public/app.js` domains  
4. Multi-client e2e  
