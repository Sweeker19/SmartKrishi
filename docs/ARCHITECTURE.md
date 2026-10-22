# Architecture

```text
Browser
  React components + plain CSS
  Browser Canvas: non-diagnostic colour summary
        |
        | JSON over /api + HttpOnly session cookie
        v
Express on Node.js
  Helmet + origin checks + bounded requests + API/auth rate limits
  JWT authentication -> owner/role guards -> validation
       |                |                  |
       v                v                  v
  Mongoose         JavaScript rules    Node native fetch
       |           crop / screening    optional Open-Meteo
       v           weather / nutrients provider, 6.5s timeout
  MongoDB                               10-min bounded cache
```

## Collections and ownership

- `users`: unique email, bcrypt password hash (excluded from default selection), display name and role.
- `farms`: owner reference and validated farm inputs.
- `scans`: owner and farm references; bounded JPEG/PNG data URL; symptoms; untrusted visual summary; rule-screening result.
- `alerts`: owner/farm, category, level, title/message, read status, unique deduplication key.
- `markets`: shared read-only-for-farmers price observations with explicit `sample` / `manual` provenance.

Farm and scan access is always scoped to the current account. Administrator status permits market writes but does not grant browsing other farmers' private farm/scan data.

## Authentication

1. Registration validates input and hashes the password with bcrypt (cost 12).
2. Login compares the stored hash and issues a signed seven-day JWT in a HttpOnly SameSite=Strict cookie.
3. Protected routes verify issuer/audience/algorithm and load the current database user.
4. Mutation requests with an Origin header must match `CLIENT_ORIGIN` exactly.
5. Logout clears the browser cookie. There is no revocation collection or refresh-token rotation.

## Intelligence flow

`GET /farms/:id/intelligence` verifies ownership, gets optional weather and calculates crop, weather and nutrient views. It does not create database alerts. Rules live in `server/src/engine.js`; no hidden remote AI service is used.

`POST /farms/:id/alerts/refresh` recomputes conditions and inserts daily-deduplicated weather/irrigation/humidity/pest messages, stage-based nutrient planning reminders and qualifying same-district market changes. It is deliberately user-triggered. Existing alerts are not overwritten later that day.

`POST /scans` validates ownership/image, filters the symptom allowlist, runs symptom rules, stores the bounded record, and creates an informational screening alert. Client colour summaries never determine diagnosis or confidence.

## Weather

- Built using Node's native `fetch`, not a Python microservice.
- Exact farm coordinates are sent to the optional public provider; this should be covered in a real privacy notice.
- Cache key rounds coordinates to 2 decimal places, so nearby farms may share a cached forecast.
- A maximum of 500 cache entries is retained in process.
- Current conditions and today's daily precipitation forecast are distinct quantities.
- Offline/provider failure returns fixed illustrative readings with `sample=true`.
- There is no forecast scheduler, historical-weather database or external API credential.

## Market and chart behavior

The server returns at most 300 price records for the selected crop. The browser can filter exact district, group records by market/district/source and plot an inline SVG of modal prices. Charts use only fetched observations and are not predictions. For large datasets, add indexed, server-side time windows/pagination before production use.

## Deletion consistency

Farm deletion removes related owner scans and alerts before deleting the farm. This simple sequence does not require a MongoDB replica-set transaction. A process failure in the middle can leave a partially completed cleanup; production systems should use a transaction or retryable deletion workflow where supported.

## Security boundaries

This is a single-process local/demo architecture. In-memory rate limits and caches reset at restart and are not distributed. No reverse-proxy trust is assumed. JPEG/PNG signature checks are not full content sanitization or malware scanning. Never expose MongoDB directly to the internet. Real deployments need operational monitoring, patched dependencies, backup/restore drills and an explicit upload retention policy.
