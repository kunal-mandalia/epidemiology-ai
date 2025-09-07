(openai)
# Pre-plan

1. Narrative / Story Arc

The demo illustrates a typhoon-driven epidemiological event sequence in SE Asia, showing how different data sources signal the unfolding situation:

Typhoon landfall – weather news reports heavy rain and winds (Zambales).

Flooding – local streets submerged; social media posts report waterlogged areas.

Vector proliferation – stagnant water increases mosquito activity (news reports, social media).

Early health signals – residents report gastrointestinal symptoms on Twitter.

Hospital admissions – clinical records show patients admitted with GI symptoms.

Mortality – severe cases and deaths captured in hospital records.

Policy response – mosquito control measures and flood safety guidelines issued.

This sequence demonstrates cause-and-effect over time, emphasizing how different signals feed into AI-informed epidemiology.

2. Main Features / Components

LHS (Left-Hand Side): Controls & Details

Top: AI Summary & Predictions

Total events detected

Breakdown by type (social media, hospital, vector, environmental)

Early warning signals (e.g., rising GI symptoms)

Updates dynamically as the timeline slider moves

Middle: Timeline Slider

Horizontal slider representing the typhoon/flood period (1–8 July)

Shows events up to the selected date

Optional “play/pause” to animate event progression

Facilitates “time travel” through the narrative

Bottom: Event Feed

Scrollable list of visible events according to slider

Shows timestamp, type, location, confidence/signal value

Info icon: toggle between original source, canonical event, AI derivation

Click on item → highlights location on map

RHS (Right-Hand Side): Spatial Visualization

Offline SVG Map

Coastal areas of SE Asia, e.g., Zambales and Olongapo City

Event markers overlayed dynamically, color-coded by type

Marker size/opacity indicates signal strength or confidence

Click marker → info panel shows original/canonical/derivation

3. AI Engineering Focus

The demo emphasizes AI engineering workflows (not model development):

Data Normalization / Canonicalization

Convert heterogeneous, unstructured inputs into structured events:

Tweets → health signals

News → flood/vector/policy signals

Hospital notes → admissions/mortality

Unstructured Data Handling

NLP on social media (classification, symptom extraction, geolocation inference)

VLM / OCR for hospital handwritten notes

Text extraction from news articles

Visualization & Interaction

Map + timeline + feed + summary

Toggle between original vs canonical data

Display derivation techniques for teaching AI engineering

Offline, Preprocessed Simulation

All data prepared ahead of time (JSON / CSV)

No external API or internet dependency

4. Demo Dataset

20 preprocessed canonical events spanning:

Weather / typhoon (news)

Flooding (news / social media)

Vector signals (mosquito activity)

Social media health signals (GI symptoms)

Hospital admissions & mortality

Policy actions (government response)

Each event has:

Timestamp, lat/lon, location name

Signal value / confidence

Source type and metadata

Original source snippets available for info panel toggles

5. Lecture / Teaching Goals

Show how messy real-world data becomes structured actionable signals.

Illustrate AI engineering pipelines in epidemiology.

Highlight temporal and spatial patterns in public health events.

Demonstrate confidence, uncertainty, and derivation for AI-driven insights.

Provide interactive exploration: time travel, feed selection, map interactions.

This setup gives a self-contained, offline-ready, highly interactive lecture demo that tells a clear epidemiology + AI story, while allowing students to see both data and AI processing in action.


## Event examples

| #  | Event Type                    | Timestamp         | Location Name     | Lat   | Lon    | Signal Value | Source   | Metadata Summary                           |
| -- | ----------------------------- | ----------------- | ----------------- | ----- | ------ | ------------ | -------- | ------------------------------------------ |
| 1  | weather                       | 2025-07-01T06:00Z | Zambales          | 15.2  | 120.1  | 1.0          | news     | Typhoon Iniong makes landfall, cat 2       |
| 2  | flood                         | 2025-07-02T09:30Z | Zambales          | 15.25 | 120.12 | 0.9          | twitter  | Street underwater, #ZambalesFlood          |
| 3  | social\_media\_health\_signal | 2025-07-02T14:00Z | Zambales          | 15.25 | 120.12 | 0.7          | twitter  | Stomach upset after wading in water        |
| 4  | vector\_signal                | 2025-07-03T12:00Z | Olongapo City     | 14.84 | 120.28 | 0.75         | news     | Mosquito activity increased, Aedes         |
| 5  | social\_media\_health\_signal | 2025-07-03T15:00Z | Olongapo City     | 14.84 | 120.28 | 0.8          | twitter  | Diarrhea reports from residents            |
| 6  | hospital\_admission           | 2025-07-04T10:30Z | Olongapo Hospital | 14.85 | 120.28 | 1.0          | hospital | Patient admitted with vomiting & diarrhea  |
| 7  | hospital\_admission           | 2025-07-04T11:00Z | Olongapo Hospital | 14.85 | 120.28 | 1.0          | hospital | Patient admitted with fever & diarrhea     |
| 8  | social\_media\_health\_signal | 2025-07-04T13:00Z | Olongapo City     | 14.84 | 120.28 | 0.85         | twitter  | More people reporting stomach upset        |
| 9  | vector\_signal                | 2025-07-04T16:00Z | Olongapo City     | 14.84 | 120.28 | 0.7          | twitter  | Tweets about mosquitoes in flooded streets |
| 10 | flood                         | 2025-07-05T07:00Z | Zambales          | 15.25 | 120.12 | 0.85         | news     | Rising water levels in coastal areas       |
| 11 | hospital\_admission           | 2025-07-05T09:30Z | Olongapo Hospital | 14.85 | 120.28 | 1.0          | hospital | Severe gastroenteritis cases admitted      |
| 12 | mortality                     | 2025-07-05T14:00Z | Olongapo Hospital | 14.85 | 120.28 | 1.0          | hospital | Death, 45M, acute gastroenteritis          |
| 13 | social\_media\_health\_signal | 2025-07-05T15:00Z | Olongapo City     | 14.84 | 120.28 | 0.8          | twitter  | Residents tweeting about sickness          |
| 14 | policy\_action                | 2025-07-06T09:00Z | Olongapo City     | 14.84 | 120.28 | 1.0          | news     | Mosquito control teams deployed            |
| 15 | vector\_signal                | 2025-07-06T12:00Z | Olongapo City     | 14.84 | 120.28 | 0.65         | news     | Mosquito counts declining                  |
| 16 | social\_media\_health\_signal | 2025-07-06T13:00Z | Olongapo City     | 14.84 | 120.28 | 0.6          | twitter  | Fewer GI symptom reports                   |
| 17 | flood                         | 2025-07-07T08:00Z | Zambales          | 15.25 | 120.12 | 0.6          | news     | Floodwaters starting to recede             |
| 18 | hospital\_admission           | 2025-07-07T10:00Z | Olongapo Hospital | 14.85 | 120.28 | 0.9          | hospital | Mild GI cases, patients discharged         |
| 19 | social\_media\_health\_signal | 2025-07-07T12:00Z | Olongapo City     | 14.84 | 120.28 | 0.55         | twitter  | Tweets about recovery and cleanup          |
| 20 | policy\_action                | 2025-07-08T09:00Z | Olongapo City     | 14.84 | 120.28 | 1.0          | news     | Flood safety guidelines issued             |
