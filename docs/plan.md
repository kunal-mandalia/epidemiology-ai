(claude)

⏺ Implementation Plan Summary

  Architecture

  - Frontend: React + TypeScript
  - Map: Static SVG world map (focus on SE Asia/Philippines region)
  - Data: Static JSON files, fully offline
  - No external dependencies: D3.js not needed, pure SVG manipulation

  Core Components

  Left Panel

  - AI Summary: Dynamic stats/predictions based on timeline position
  - Timeline Slider: July 1-8, 2025 with play/pause animation
  - Event Feed: Scrollable list with 3-way toggle (raw → canonical → AI
  derivation)

  Right Panel

  - SVG Map: World map cropped to Zambales/Olongapo region
  - Dynamic Markers: Color-coded by event type, sized by signal strength
  - Interactive: Click markers for details, click feed items to highlight on
  map

  Data Structure

  Canonical Events (20 total)

  - Pre-plan table structure: timestamp, lat/lon, signal_value, source_type,
  metadata
  - Event types: weather, flood, vector_signal, social_media_health_signal,
  hospital_admission, mortality, policy_action

  Raw Source Data (to generate)

  - Twitter: Real API v2 response structure with metrics, geo,
  context_annotations
  - News: Headlines, snippets, outlet attribution
  - Hospital: Clinical notes, diagnosis codes, patient demographics

  AI Derivations (to generate)

  - NLP processing steps showing raw → canonical transformation
  - Confidence scoring and uncertainty indicators

  AI Summary & Predictions (to generate)

  - Dynamic analysis based on timeline position
  - Pattern recognition from historical canonical events
  - Early warnings and actionable insights
  - Risk scoring with confidence levels

  Teaching Goals

  - Demonstrate messy data → structured signals pipeline
  - Show temporal/spatial epidemiological patterns
  - Illustrate AI engineering workflows (not ML model development)
  - Enable interactive exploration through time travel interface

⏺ JSON Schemas

  1. Canonical Events Schema

  {
    "id": "string",
    "timestamp": "string (ISO 8601)",
    "event_type": "weather | flood | vector_signal | social_media_health_signal
   | hospital_admission | mortality | policy_action",
    "location": {
      "name": "string",
      "lat": "number",
      "lon": "number"
    },
    "signal_value": "number (0-1)",
    "confidence": "number (0-1)",
    "source_type": "news | twitter | hospital | government",
    "metadata": {
      "description": "string",
      "severity": "low | medium | high",
      "affected_population": "number?",
      "keywords": "string[]"
    },
    "raw_event_ids": "string[]"
  }

2. Raw Events Schemas (by type)

  Twitter Raw Event

  {
    "id": "string",
    "type": "twitter",
    "data": {
      "id": "string",
      "text": "string",
      "created_at": "string (ISO 8601)",
      "author_id": "string",
      "public_metrics": {
        "retweet_count": "number",
        "like_count": "number",
        "reply_count": "number",
        "quote_count": "number"
      },
      "geo": {
        "place_id": "string?",
        "coordinates": {
          "type": "Point",
          "coordinates": "[number, number]"
        }
      },
      "context_annotations": [{
        "domain": {"id": "string", "name": "string"},
        "entity": {"id": "string", "name": "string"}
      }],
      "lang": "string",
      "possibly_sensitive": "boolean"
    },
    "processing": {
      "retrieved_at": "string (ISO 8601)",
      "api_version": "string"
    }
  }

  News Raw Event

  {
    "id": "string",
    "type": "news",
    "data": {
      "headline": "string",
      "article_text": "string",
      "published_at": "string (ISO 8601)",
      "source_outlet": "string",
      "author": "string?",
      "url": "string",
      "location_mentioned": "string[]",
      "category": "string"
    },
    "processing": {
      "scraped_at": "string (ISO 8601)",
      "word_count": "number"
    }
  }

  Hospital Raw Event

  {
    "id": "string",
    "type": "hospital",
    "data": {
      "patient_id": "string (anonymized)",
      "admission_datetime": "string (ISO 8601)",
      "chief_complaint": "string",
      "clinical_notes": "string",
      "diagnosis_codes": "string[]",
      "admission_type": "emergency | scheduled | transfer",
      "disposition": "admitted | discharged | deceased | transferred",
      "demographics": {
        "age": "number",
        "gender": "M | F | O",
        "location": "string"
      }
    },
    "processing": {
      "record_created_at": "string (ISO 8601)",
      "hospital_system": "string"
    }
  }

3. Events Summary Schema

  {
    "timestamp": "string (ISO 8601)",
    "time_range": {
      "start": "string (ISO 8601)",
      "end": "string (ISO 8601)"
    },
    "total_events": "number",
    "events_by_type": {
      "weather": "number",
      "flood": "number",
      "vector_signal": "number",
      "social_media_health_signal": "number",
      "hospital_admission": "number",
      "mortality": "number",
      "policy_action": "number"
    },
    "events_by_source": {
      "news": "number",
      "twitter": "number",
      "hospital": "number",
      "government": "number"
    },
    "geographic_distribution": [{
      "location": "string",
      "lat": "number",
      "lon": "number",
      "event_count": "number",
      "signal_strength_avg": "number"
    }],
    "trends": {
      "signal_velocity": "number",
      "health_signals_trend": "increasing | decreasing | stable",
      "geographic_spread": "expanding | contracting | stable"
    },
    "predictions": [{
      "type": "early_warning | risk_assessment | recommendation",
      "message": "string",
      "confidence": "number (0-1)",
      "time_horizon": "string (e.g., '24h', '48h')"
    }],
    "key_insights": "string[]"
  }