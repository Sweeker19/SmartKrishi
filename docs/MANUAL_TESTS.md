# Database and browser validation checklist

These are manual checks to perform after installing dependencies and starting MongoDB. They were not executed in the ZIP-generation environment.

## Bootstrap

- [ ] `npm install` succeeds on Node 22+.
- [ ] A valid `server/.env` is configured; placeholder secret is rejected.
- [ ] `npm test` passes all eight tests.
- [ ] `npm run seed` inserts labelled sample rows.
- [ ] Rerunning seed on the same day does not duplicate the same sample keys.
- [ ] `npm run dev` starts API and web; `/api/health` returns ready.
- [ ] `npm run build` succeeds; built UI loads from Express via `npm start`.

## Accounts and ownership

- [ ] Register user A, reject invalid email and short password, reject duplicate email.
- [ ] Register user B in a separate browser context.
- [ ] Incorrect password gives an authentication error.
- [ ] Page refresh restores the current account using the cookie.
- [ ] A's farm IDs are inaccessible to B for edit, delete, intelligence or refresh.
- [ ] A's scan IDs are inaccessible to B for view or deletion.
- [ ] Ordinary registration cannot set an admin role or a different owner.
- [ ] Logout requires sign-in again for protected APIs.
- [ ] Profile name edits update the application heading.

## Farm lifecycle

- [ ] Empty workspace directs the user to add a farm.
- [ ] Add each supported crop/soil/stage type.
- [ ] Invalid latitude/longitude, negative area, invalid pH and negative nutrients are rejected.
- [ ] Actual coordinates replace Chennai defaults.
- [ ] Edit sowing date, soil, nutrients, crop and stage; intelligence refreshes.
- [ ] Switch between two farms quickly; the final selected farm's result is shown.
- [ ] Cancel deletion leaves data untouched.
- [ ] Confirm deletion removes that farm's scans and alerts, not other farms' data.

## Weather and rules

- [ ] `LIVE_WEATHER=true` shows a live badge when the provider responds.
- [ ] Offline/provider failure clearly shows sample weather, never fake live data.
- [ ] `LIVE_WEATHER=false` always returns labelled sample data.
- [ ] Sample-weather alerts contain `[SAMPLE WEATHER]`.
- [ ] Rainfall is labelled a daily forecast total.
- [ ] Crop ranks expose scoring reasons and the repeated-crop penalty.
- [ ] Soil zeros are “not supplied,” never verified deficiency.
- [ ] No nutrient dose is presented as a field prescription.

## Screening

- [ ] A valid JPEG/PNG uploads and a private record is saved.
- [ ] Reject SVG, random bytes, fake MIME/signature and decoded images over 3 MB.
- [ ] Preview and colour statistics are described as non-diagnostic.
- [ ] No symptoms yields no rule matches and does NOT claim healthy.
- [ ] Symptoms yield rule coverage, not confidence.
- [ ] Saved history excludes heavy image data until an individual record is opened.
- [ ] Deleting a record removes its stored image.

## Market/admin

- [ ] Farmer sees seeded sample labels and cannot add/delete via UI or direct API.
- [ ] Admin seed creates a new admin when configured; does not promote an existing account.
- [ ] Admin can add a valid manual quotation; rejects inverted/negative price ranges.
- [ ] Changing crop resets district filter.
- [ ] Same-district filter can legitimately return no rows; no fake nearby market is generated.
- [ ] Sparkline and percentage change use one market/district/source group.
- [ ] Zero earlier modal price never causes division by zero.
- [ ] Historical trends are not labelled future predictions or sell recommendations.

## Notifications

- [ ] Refresh field alerts generates relevant weather and stage-based planning messages.
- [ ] Qualifying same-district sample/manual price changes trigger labelled market alerts.
- [ ] Warm/humid example readings produce a non-predictive pest-scouting reminder.
- [ ] Refresh twice the same UTC day does not duplicate the same category.
- [ ] Next-day category entries can be created.
- [ ] Mark one read and read-all persist after reload.
- [ ] No claims of SMS, email, push or unattended monitoring are present.

## UI and deployment

- [ ] Test narrow mobile, tablet and desktop widths.
- [ ] Keyboard focus, form labels, navigation and errors are accessible.
- [ ] Mobile sidebar closes on navigation and scrim click.
- [ ] Network and expired-session errors are understandable.
- [ ] Production deployment uses HTTPS, private MongoDB and an exact allowed origin.
- [ ] Review dependencies with `npm audit`; do not blindly apply breaking automatic fixes.
- [ ] Verify backup/restore, upload retention, consent and incident procedures before real users.
