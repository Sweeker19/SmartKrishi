# Proposal traceability and exact implementation status

Source artifact: `FSD-Review0.pptx`, project title **SmartKrishi AI**. This archive is an educational implementation, not a claim of full research-model completion.

| Proposed feature | Delivered | Boundary / next required work |
| --- | --- | --- |
| Farmer accounts | Registration, login/logout, profile name editing, farmer/admin roles | No password reset, email verification or account deletion |
| Farm registration | Multiple farms; district/state; latitude/longitude; soil; current/previous crop; area; sowing date; manual growth stage; season; pH/N/P/K | No geocoding, soil-sensor integration or automatic crop-stage inference |
| Centralized dashboard | Active-farm switching, weather metrics, rules, unread count, farm snapshot | Not a continuously monitored sensor dashboard |
| Crop recommendation | Six crops; transparent weighted ranking for soil/season/pH/current temperature/rainfall, rotation penalty | Rules, not trained AI. District, humidity and N/P/K are not modeled in suitability. Current weather does not estimate seasonal climate. Needs calibrated regional datasets |
| Weather advisory | Optional Open-Meteo current conditions / 3-day rainfall forecast; rain/heat/wind/humidity/moisture rules | No forecast accuracy guarantee; labelled fallback when unavailable; no field moisture sensor |
| Leaf image upload | JPEG/PNG validation, private MongoDB image records, browser colour summary, history/view/delete | Photos are not passed to a trained disease classifier |
| Disease identification | Farmer-entered symptoms yield tentative patterns and prevention/escalation prompts | NOT image diagnosis, NOT AI confidence. A validated model/dataset is still required for the proposal's AI disease-identification goal |
| Pest alerts | Warm/humid illustrative scouting rule and insect-related symptom patterns | No species identification or calibrated pest-outbreak prediction |
| Fertilizer suggestions | Entered nutrient bands, example fertilizer categories and stage-aware timing discussion, reminder alerts | No exact dose, deficiency diagnosis, agronomic calibration or scheduled application dates |
| Market insights | Sample seed; admin manual entry/delete; crop/district filters; historical charts; min/modal/max; percentage change | No live Agmarknet/e-NAM integration, GPS distance, transport cost or reliable future-price prediction |
| Notifications | Persisted in-app inbox, unread/read-all, daily deduplication, owner isolation | On demand, not a background scheduler. No SMS/email/push |
| Market-change alerts | Same crop/district/market/source comparison; 1% historical change threshold on refresh | Sample/manual records only; not a real-time market feed |
| Mobile-friendly interface | Responsive sidebar, cards, forms and scrollable tables | Browser/device accessibility and visual testing still required |

## Why no fake AI model?

The uploaded presentation describes the desired model behavior but contains no training dataset, model weights, inference architecture or measured validation results. A full machine-learning model cannot be honestly substituted with random confidence values or colour thresholds. This implementation keeps the entire system runnable in MERN and exposes a clear, non-diagnostic screening workflow instead.

Future disease-model work can remain in JavaScript/Node, but must provide validated weights, supported disease classes, appropriate preprocessing, real field-image validation, calibrated uncertainty and an explicit unsupported-input pathway. Merely running a model in JavaScript would not establish its medical/agronomic reliability.

## Numeric conventions

- Area: hectares.
- Soil inputs: pH, and N/P/K entered in kg/ha under the demo convention. Laboratory extractant/elemental reporting differences are not converted.
- Weather temperature: degrees Celsius; relative humidity: percent; wind: km/h.
- Rain: daily forecast total, millimeters.
- Market prices: INR per quintal, where one quintal is 100 kg.
- Crop score: weighted-rule compatibility, 0–100.
- Screening score: matched symptoms / symptoms in that rule × 100, not disease probability.
- Market change: `(latest modal - earlier modal) / earlier modal × 100`, within one market/district/source group. No comparison when earlier modal is zero.
- Alert deduplication: UTC calendar day, one owner/farm/category alert per day; market category includes market/source grouping.
