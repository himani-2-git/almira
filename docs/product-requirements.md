# Almira product requirements

_Recorded from the user's instructions on 1 October 2026. These requirements guide the remaining rebuild._

## Fixed requirements

- **Student project, ₹0 service budget:** use free tiers and local tools. Do not enable paid plans, paid APIs, automatic upgrades or paid fallback services. When a free allowance is exhausted, reduce work or use the local fallback. Check current provider allowances before deployment; a free pilot does not imply unlimited public capacity.
- **Public portfolio web app:** the launch goal is to demonstrate the student's skills for their resume. Prepare a usable phone/desktop deployment, clear project documentation and a labeled demo that can be explored before sign-in. Personal cloud data and AI requests require an authenticated account and shared free-quota controls.
- **Unisex:** everyone can use every garment category and style. Recommendations follow the person's stated tastes and wardrobe. Do not assign tastes, garment access or fashion interests from gender, appearance or a photograph.
- **Preserve the loved UI:** keep Almira's purple gradients, glass cards, Playfair headings and playful doodles while improving phone and desktop usability.
- **Profile is foundational:** introduce profile setup and editable preferences before enabling personalized AI or a personalized live trends feed.
- **Image quality is a publication gate:** only relevant, verified, high-quality images can become editorial photos. A failed image must never be replaced by a random stock photo.

## 1. Profile setup and preferences

Use a short, skippable setup with four groups. Each field is optional and editable in Settings → My style. A person can use their wardrobe without completing a profile.

| Group | Initial fields | What they guide |
| --- | --- | --- |
| Your style | Optional Fashion Preference; preferred style influences such as minimal, streetwear, classic, relaxed, playful, tailoring, traditional or experimental; optional favorite brands; a short “Fashion, to me, means…” note | Outfit explanations and the mix of editorial stories |
| Colors and comfort | Favorite/avoided colors, preferred fits, fabrics to avoid, coverage preferences and footwear comfort | Ranking and explicit constraints, when garment metadata supports them |
| Your everyday | Usual occasions, climate, optional region, cultural/event interests | Practical suggestions and locally relevant discovery; climate is user supplied, not live weather |
| Exploration | Familiar looks versus adventurous suggestions; rewear-first preference | How much discovery appears alongside known tastes |

Do not require gender, body measurements, an exact location or a profile photo. Clothing categories remain available to everyone. Article classifications describe the clothing/event, never a rule about who can wear it.

**Fashion Preference:** exactly `Womenswear`, `Menswear`, `Unisex`, `Mix of all`, or `Prefer not to say`. This is an optional fashion interest, editable anytime, and never required for account creation. Leave it unset by default. Use a stated preference as a ranking signal for trends and outfit suggestions; do not infer gender or exclude garment categories. Unset and “Prefer not to say” apply no preference weighting; “Mix of all” requests broad coverage.

### UI

- Add a calm “Make Almira feel like you” card on Today and a “My style” section in Settings, preserving the existing visual language and five navigation items.
- Use readable multi-select chips and optional notes; show progress without forcing every field.
- Provide a “What Almira remembers” screen with the reason for each remembered preference, edit/delete controls and a reset action.
- Offer “This feels like me”, “Try something different”, “Hide this trend” and a “Remember this preference” action with a preview of what will be saved.
- A saved outfit or a worn item is useful feedback, but one action must not become a permanent rule about someone's taste.

## Confirmed fashion coverage and feed

- **Region:** India + Global, with each user's region/climate/preferences guiding relevance.
- **Coverage:** everyday fashion, street style, runway, red carpet, traditional wear, and Indo-western/fusion.
- **Language:** English.
- **Feed:** visual Pinterest-like cards with approved images, original concise summaries, source links, tags and like/save controls. Use a responsive grid with a predictable reading/tab order, restrained image proportions and explicit image loading/error states. Keep the original Almira palette and five navigation items.
- **Personalization:** combine stated preferences with the person's wardrobe, likes, saved posts, preferred colors, styles and brands. Add private post likes/bookmarks and include them in export/reset/deletion rules. Favor useful wardrobe matches over product-purchase links.
- **Wearability:** rank practical ideas for the person's routine, occasions, climate, comfort and Exploration setting. Bulky or editorial-only looks are low priority unless the person explicitly likes that style or the occasion supports it.
- **Recreate from owned clothes:** each eligible trend offers “Wear this with mine.” Translate a statement look into supported elements such as color, silhouette, layering or accessories, then use real owned garment IDs. Explain partial matches and missing information; never fabricate an exact match or suggest buying a piece as the default path.
- Preserve the source's actual event/article facts. Label the practical adaptation as Almira's styling interpretation so it is not mistaken for a claim made by the publisher.

### Initial source shortlist · checked 1 October 2026

| Source | Editorial role | Publication status |
| --- | --- | --- |
| [Who What Wear](https://www.whowhatwear.com/fashion) | Global everyday outfit formulas, basics, street style and wearable seasonal ideas | Selected for discovery/review; an automated feed/API and reuse terms must be verified before ingestion |
| [Vogue India](https://www.vogue.in/fashion) | Indian fashion, traditional/fusion styling, street style and occasional event coverage | Selected for discovery/review; its page states reuse requires prior written permission, so publisher photos/content are not approved for republication |
| [GQ India](https://www.gqindia.com/live-in-style/style-fashion) | Menswear-informed everyday styling and wardrobe ideas to balance coverage | Selected for discovery/review; permissions and accessible official ingestion route remain to be verified |
| [Lakmé Fashion Week x FDCI](https://www.lakmefashionweek.co.in/) | Primary evidence for Indian runway events and designer context | Selected for event verification; no automatic approval to reuse gallery images |
| [Wikimedia Commons](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia) | Individual freely licensed fashion/event photos when genuinely relevant | A candidate image source, not a news feed; each file's license/credit and relationship to the story must pass the image gates |

These are reading/discovery sources, not a running feed or a blanket photo license. Prefer editorial pieces with usable wardrobe principles; filter sponsored shopping lists, irrelevant celebrity items and inaccessible stories. Start with manual reviewed selections while establishing a permitted ingestion route. Timely event photos may be unavailable within the free budget; retain verified images or use labeled original artwork instead of substituting random stock.

## 2. Personal memory

Personalization uses a private profile and relevant remembered preferences supplied with a request. This does not require training or fine-tuning a model for every person. Groq requests do not automatically carry Almira's user history; Almira must retrieve the context it needs.

### Separate three kinds of context

1. **Explicit preferences:** what the person entered or confirmed. These have priority over inferred tastes. Distinguish “avoid” from a soft favorite.
2. **Observed signals:** saved/worn looks and like/hide feedback. Use them for bounded, reversible ranking adjustments. Do not infer a fashion identity from a single click or browsing dwell time.
3. **Remembered preferences:** a concise, user-visible fact the person confirmed, such as “I prefer relaxed fits for college.” Keep scope, origin and update time. Only approved facts enter durable memory in the first release.

### Planned storage

- Prepared second migration: extend private `preferences` with structured profile fields and a revision; store separate controls for personalization and learning from feedback.
- Prepared private `style_memories`: ID, owner, confirmed text, occasion/scope, user-confirmed source and creation time, capped at 20 per profile save. This explicit-memory first slice is simpler than the eventual schema with source references, confidence, status, update time and expiry. It does not store chat history or inferred facts.
- Keep `suggestion_feedback` and trend feedback scoped to the authenticated user. Bound history and document retention; remove obsolete signals on reset instead of immediately recreating deleted memories from old feedback.
- Apply per-user RLS to every profile, memory and feedback table. Retrieve ownership from the authenticated identity, never a client-supplied user ID. Clear account-scoped local caches on sign-out/account change.

### Context and ranking

- Build a small context packet server-side: explicit constraints, up to a small number of relevant confirmed memories, occasion, selected trend tags and the candidate owned garments. Cap context length; avoid sending name, email, exact location or full history.
- Current request choices take priority over soft historic tastes. If the request conflicts with an explicit avoidance, explain the conflict and let the person change that avoidance.
- Enforce checks that structured garment metadata can support in code. Do not claim to guarantee fabric, comfort or coverage constraints when the item has no supporting metadata; ask for or flag missing information.
- Rank a shared, approved trend digest for each user using optional Fashion Preference, styles/brands/colors, region, lifestyle/climate/comfort, wardrobe match, likes/bookmarks and explicit feedback. Include a small discovery portion controlled by Exploration. Show a short “Why this is for you” reason and prioritize ideas that can be recreated with owned pieces.
- Keep personalization caches private, keyed by user, profile/memory version, wardrobe version, request and model version. Invalidate on edits, deletion and reset. Only public editorial results may be shared across users.
- Turning off feedback learning stops new learned signals. Turning off personalization stops use of profile/memory for recommendations. Reset removes remembered preferences and their learning signals; profile export/deletion must include this data.

## 3. Groq routing and fallback within free quotas

Multiple keys can be configured for credential rotation and separating development/editorial/stylist workloads. They are not independent free allowances. Groq project limits sit below an organization ceiling; all routed work must respect the applicable organization, project and model limits. See [Groq Projects](https://console.groq.com/docs/projects) and [Rate Limits](https://console.groq.com/docs/rate-limits), checked 1 October 2026.

### Planned request flow

`Personalized cache → shared budget reservation → eligible configured model → validate result → return draft`

On a failure: `honor cooldown → eligible compatible fallback within its real quota → local wardrobe styling`.

- Keep credentials on the server. Maintain a registry of credential aliases and their organization/project/model quota scopes; never track limits independently for keys that share a scope.
- Use atomic shared budget reservations in the backend for requests and estimated tokens across concurrent function instances. A browser counter or an in-memory counter in one Edge Function is insufficient.
- Set conservative user/day and organization/day budgets before the pilot. The prepared 10/hour/user limit alone does not protect the shared free allowance. Reserve some capacity for interactive styling so the editorial job cannot consume it all.
- Bound wardrobe context and completion length to the available token budget. Rank candidate garments first when needed, preserving the chosen starting piece. Check actual account limits rather than assuming the maximum 200-piece request fits the free plan.
- Honor `Retry-After` and available remaining/reset headers on a 429. Do not immediately retry a different key in the same exhausted scope. For a short interactive request, return a fallback when waiting would exceed the request deadline.
- Allow at most one eligible alternate attempt per interactive request. Cool down temporarily unavailable providers. Disable a rejected credential on authentication errors. An alternate model must support the required structured response contract, and its result receives the same ownership/constraint validation.
- Introduce a second provider only after its current free allowance, data handling and compatible outputs are verified and the user configures it. Do not silently switch personal data to a new provider.
- Cache approved article labels and summaries once per canonical story/content version. Publish a small daily digest for everyone and rank it locally/server-side per person; do not run a full news search for every user or page visit.
- Do inexpensive metadata/image checks before any vision request. Cache image decisions by content hash and check only the best candidates with a supported vision model when its free allowance permits.
- Stop optional background work when budgets are low. Keep the last approved digest with its real timestamp and keep wardrobe functions available. Label deterministic suggestions as quick styling.

No plan depends on creating extra accounts to obtain quota or automatically enabling billing. Hosting, database, storage, egress and function allowances are also finite; use compressed wardrobe photos and small editorial derivatives where rights allow. Review [Supabase's current Free plan](https://supabase.com/pricing) before sizing a pilot.

## 4. Editorial image publication gates

These are proposed starting thresholds to calibrate with permitted real samples. Resolution alone never proves quality.

| Gate | Required check | On failure |
| --- | --- | --- |
| Source and rights | Approved publisher/event source; canonical article and image URLs; documented permission/license, photographer/credit and any reuse restrictions | Skip or hold for editorial review; a link to an article is not permission to copy its photos |
| Authentic connection | Image depicts the reported clothing, style or event; event/date claims have evidence; no unrelated stock image, advert, logo, screenshot or clickbait collage | Reject; AI similarity does not establish provenance |
| Native resolution | Featured image: at least 1,200 px on the long edge and 800 px on the short edge. Small card: at least 800 px and 600 px respectively. Verify the actual decoded image, not HTML width or an upscale | Use a smaller eligible placement or reject; do not enlarge a tiny thumbnail to pass |
| Technical quality | Decode successfully; acceptable sharpness, exposure, compression/artifacts; no intrusive text overlays; clothing remains visible at the chosen crop | Reject or review; evaluate the delivered derivative as well as the original |
| Diversity and duplication | Content hash plus perceptual similarity checks; avoid repeating syndicated photos or flooding the digest with one event/style | Deduplicate or rerank |
| Labeling and editorial review | Source-backed fashion labels, subject/crop position, alt text, dimensions and gate results stored; human approval for the first pilot and ambiguous candidates | Keep unpublished until approved |

Run cheap checks first, then targeted vision-assisted relevance/labeling. Vision may help review an image; it does not establish legal permission, a true event date or certain quality. Sharpness thresholds and crop rules need calibration on varied backgrounds and editorial styles before automated publication.

Only an approved image may be used in a photo card. Generate responsive crops without cutting away the garment that illustrates the story. If permission or quality is missing, omit the photo story, retain another verified story, or use an explicitly labeled original illustration/text treatment. Never fill the slot with a random low-quality image or pretend an illustration is event photography.

## Implementation order and acceptance

1. **Profile foundation:** local skippable setup, editing, backup compatibility and a preview of remembered preferences. Then connect private cloud profiles during Auth/sync work.
2. **Memory and feedback:** explicit confirmation, per-user storage, relevant context retrieval, correction/reset/export and personalized ranking. Verify conflicting preferences and two-account isolation.
3. **Budgeted stylist:** shared quota/token controls, private cache invalidation, cooldowns, compatible fallback and real Groq tests. Simulate concurrent requests, exhausted quotas, timeout and invalid output.
4. **Approved trend imagery:** approved sources and permitted photo samples, calibrated image gates and review queue; then a small scheduled digest and preference-based ordering.
5. **Free pilot:** measure usage, useful-look feedback, image rejection reasons and stale digests. Increase scope only while the free allowances can support it.

### Implementation status · 1 October 2026

The local wardrobe, styling sheet and illustrated sample feed work. Optional profile setup/editing and confirmed, occasion-scoped memories now persist on this device and travel in backups. Quick styling uses supported color preferences; it does not guarantee unknown fit, fabric, comfort or coverage attributes. Account UI uses the configured Supabase SDK and separates guest/account device data. The user has applied the database setup, including private revision-aware profile RPCs. Manual cloud Save/Load and two-account isolation still need signed-in live tests.

Supabase Auth is reachable with the user's public local configuration. The user reports saving the Groq secret; no live AI call has verified it. The prepared stylist retrieves authenticated preferences and relevant memories, honors opt-out and strips identity from model context. Feedback learning, wardrobe sync, shared provider budgets/key routing and the approved live image pipeline remain implementation requirements. All 22 local tests, both TypeScript checks and build pass; cloud isolation and real-model gates remain open. No paid resource or AI function deployment has been configured.
