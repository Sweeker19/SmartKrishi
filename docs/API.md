# REST API

Base path: `/api`. All request/response bodies are JSON. Session authentication uses a HttpOnly cookie; keep cookies when using an API client. Mutations from a browser must use the configured origin. Ordinary registration cannot choose `role` or `owner`.

## Public

| Method | Route | Input / behavior |
| --- | --- | --- |
| GET | `/health` | API and database-ready flag |
| POST | `/auth/register` | `{ "name", "email", "password" }`; creates farmer; sets cookie |
| POST | `/auth/login` | `{ "email", "password" }`; sets cookie |
| POST | `/auth/logout` | Clears browser cookie |

## Current account and farms

| Method | Route | Behavior |
| --- | --- | --- |
| GET | `/auth/me` | Public account fields only |
| PATCH | `/auth/me` | Update `{ "name" }` |
| GET | `/farms` | Current owner's farms, newest first |
| POST | `/farms` | Create validated farm; maximum 50 per account |
| PUT | `/farms/:id` | Replace allowed farm fields; owner is immutable |
| DELETE | `/farms/:id` | Delete owned farm and its scans/alerts |
| GET | `/farms/:id/intelligence` | `{ weather, crops, advisories, fertilizer, disclaimer }` |
| POST | `/farms/:id/alerts/refresh` | Generate on-demand daily-deduplicated field alerts |

Farm request example:

```json
{
  "name": "North field",
  "district": "Chennai",
  "state": "Tamil Nadu",
  "latitude": 13.0827,
  "longitude": 80.2707,
  "soil": "loamy",
  "crop": "rice",
  "previousCrop": "groundnut",
  "areaHa": 1.5,
  "sowingDate": "2026-10-01",
  "stage": "vegetative",
  "season": "kharif",
  "ph": 6.5,
  "n": 0,
  "p": 0,
  "k": 0
}
```

Supported crops: rice, maize, groundnut, cotton, tomato, millet.
Soils: loamy, clay, sandy, black, red.
Stages: sowing, vegetative, flowering, maturity.
Seasons: kharif, rabi, summer.

## Screening

| Method | Route | Behavior |
| --- | --- | --- |
| POST | `/scans` | `{ farm, image, symptoms, visual }`; save non-diagnostic result |
| GET | `/scans?farm=ID` | Latest 30 owned records; images excluded from list |
| GET | `/scans/:id` | Owned record including image |
| DELETE | `/scans/:id` | Delete owned screening and image |

`image` is a JPEG/PNG data URL under 3 MB decoded, with a matching byte signature. Multipart form uploads are not used. `symptoms` accepts spots, yellowing, browning, wilting, powder, curling, insects. `visual` optionally accepts `greenPercent`, `yellowPercent`, `brownPercent` from 0 to 100; these values are explicitly untrusted display metadata.

Result: method label, possible symptom-pattern matches, `score` as rule coverage, summary and warning. No disease-confidence field is returned.

## Markets

| Method | Route | Behavior |
| --- | --- | --- |
| GET | `/markets?crop=rice&district=Chennai` | Authenticated; up to 300 recent shared records |
| POST | `/markets` | Admin only; creates a manual quotation |
| DELETE | `/markets/:id` | Admin only; deletes quotation |

Manual record fields: crop, mandi, district, state, min, modal, max, date. All prices are INR/quintal. Requires `0 <= min <= modal <= max`. Clients cannot mark a manual quotation as independently verified or live.

## Alerts

| Method | Route | Behavior |
| --- | --- | --- |
| GET | `/alerts` | Latest 100 current-owner alerts |
| PATCH | `/alerts/read-all` | Mark all current-owner alerts read |
| PATCH | `/alerts/:id/read` | Mark an owned alert read |

## Error shape

```json
{ "message": "Human-readable error description." }
```

Common status codes: 400 invalid input, 401 missing/expired sign-in, 403 unauthorized role or origin, 404 missing or other-owner record, 409 duplicate, 413 request body too large, 429 request rate exceeded, 500 generic internal error.

The global rate limit is 240 API requests/minute/IP; authentication attempts 20/15 minutes/IP; new screenings 20/hour/IP. Limits are single-process and intentionally simple. Registration/login share their authentication limiter.
