# RO Inventory — first interactive implementation

Arabic RTL, responsive buildless application. Entry: dist/index.html. No dependencies.

## Implemented
- Company, supervisor and counter experience previews.
- Create open/reference operations; select supervisor and assigned counters.
- CSV reference parser (quoted fields, BOM, duplicate barcode and quantity validation).
- Barcode/manual external scanner input, quantities, location and notes.
- Duplicate review scoped by operation/barcode/location; accept sum or exclude last entry; local audit.
- Reference variance including uncounted and unexpected items; close guard for unresolved duplicates.
- Per-counter record and unit totals, CSV/JSON export, browser PDF printing.
- Four package previews using prices/durations from the existing Drive registry.

## Explicit limitations
This is a local browser demo, NOT production SaaS. Data resides in localStorage on each browser. Role switching is a preview, not authentication. No real cloud sync, tenant security, device enforcement, billing activation, Excel/Word export, or super-admin console is implemented yet. Do not enter real inventory or credentials.

No existing Drive data has been modified. No existing GitHub repository was provided or modified. Hosted source is versioned in the Site's managed repository.

## Backend foundation
backend/Schema.gs defines central/tenant schema and count validation. roSetupNewEnvironment creates a NEW central workbook only and is idempotent via Script Properties. It has not been run. There is no unauthenticated public endpoint.

Before production integration:
1. Provide the existing GitHub repository and Apps Script project/deployment.
2. Implement verified identity, hashed short-lived sessions, server-side company/role/assignment checks, expiry and package limits. Never reuse plaintext passwords or sample tokens in existing sheets.
3. Add isolated company files, frozen per-operation references and count writes under locks with unique client request IDs. Resolve retry idempotency before incrementing quotas.
4. Implement server-verified device credentials and administrator-approved reset.
5. Add super-admin plan activation and configuration (record and operation limits remain undecided).
6. Connect UI through a supported authenticated transport; handle Apps Script redirects/CORS explicitly. Add cross-device synchronization with offline conflict handling.
7. Add actual XLSX/DOCX/PDF generation and company logos; integration/security/load tests before launch.

## Local preview
Serve dist using any static file server. All demo state can be reset from Settings.

## Subscription and employee update
- Landing page now displays four packages; choosing one routes through company signup/login and receipt submission.
- Local demo accounts use PBKDF2-SHA256 with 210,000 iterations and a random salt. Plaintext passwords are never persisted. This is still a browser-local demo, not server authentication.
- Receipts are restricted to PNG/JPEG/PDF signatures, max 5 MiB, stored in IndexedDB. No files are uploaded externally. Metadata and request status are stored locally.
- Super-admin preview (Settings -> Subscription requests) reviews local requests and downloads their receipts. It does not activate real subscriptions. Company status reflects pending/accepted/revision-needed decisions; accepted accounts are not granted access to the sample company's inventory.
- Employee view only lists assigned open operations and provides a dedicated count screen; no reports/team/company dashboard.
- Camera uses locally bundled @zxing/browser 0.1.5 (MIT, included license). It requests rear camera on explicit click, decodes on-device, fills barcode without saving quantity, and releases tracks on result, navigation, cancellation and backgrounding. Real camera testing on physical phones remains outstanding.
- Shortcuts 6 / 12 / 24 set quantity; +1 increments it. All counts still use the original assignment/status validation.
- SVG icon system replaces the old navigation and scanner symbols.
- Physical device lock, shared cloud request queue, production authentication and live plan activation still require the actual Apps Script server and GitHub integration.

## Platform and operation-credit update
- Dedicated platform view with super-admin, subscription-review and device-monitoring role previews. Employee entries are local records, not live accounts/invitations.
- Packages now use total created operation credits and user limits rather than branch counts. First package starts at 2 operations. Other operation and all user limits are intentionally unset until configured in Platform -> Package limits.
- User limit includes the company account plus supervisors/counters. Closing operations never refunds a credit. Guards run before opening the creation form and again before committing the new operation.
- Addon requests: 1 operation = SAR 50; 2 operations = SAR 70. Local receipt review adds credits once only; repeated approval is rejected.
- Device events are explicitly labeled simulations. No real cross-device monitoring/enforcement can occur without a shared authenticated backend.
- Counter screen requests camera automatically on entry. Decoder stays active and the video element remains mounted through count saves. A captured barcode remains locked while quantity is entered; the next scan becomes available after saving with a cooldown. Tracks stop on navigation/background/cancel.
- Tests include credit consumption, no-refund on closure, user caps, addon pricing/replay rejection, staff scopes and mocked continuous camera lifecycle. Physical mobile camera validation is still required.

## Blue reference design
The latest visual system follows the supplied navy/electric-blue reference: full-width grid hero, barcode scanner illustration labeled as an example, translucent badges, operational feature cards and blue application/admin views. Public stats describe actual product structure (2 inventory modes, 3 company roles, 4 packages); no customer counts or uptime claims are fabricated. Dedicated preview links route to company/counter/platform screens. Existing local functionality and explicit backend limitations remain unchanged.

## UI/UX requirements update
- Landing comparison, feature availability per package, and four retained packages with editable details.
- Branch allocation uses a shared company operation balance; branches are not a subscription quota. Company can pause/resume counting.
- Branch-scoped team management and assignment checks; employee sees assigned enabled operations only.
- Arabic/English CSV headers and bounded XLSX import, with barcode text preservation.
- Administrative barcode correction preserves prior entries and records its reason.
- Company report branding, browser PDF printing and downloadable DOCX.
- Employee welcome with Quran verse and continuous camera scanning after permission.
- Local company directory with approval/suspension preview; configurable package feature switches.

All management state remains browser-local. Live synchronization, device binding and company isolation require an authenticated backend. Tests: `node tests/ux.cjs` in addition to the three existing suites.
