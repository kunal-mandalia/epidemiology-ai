export interface Location {
  name: string;
  lat: number;
  lon: number;
}

export interface EventMetadata {
  description: string;
  severity: 'low' | 'medium' | 'high';
  affected_population?: number;
  keywords: string[];
}

export interface CanonicalEvent {
  id: string;
  timestamp: string;
  event_type: 'weather' | 'flood' | 'vector_signal' | 'social_media_health_signal' | 'hospital_admission' | 'mortality' | 'policy_action';
  location: Location;
  signal_value: number;
  confidence: number;
  source_type: 'news' | 'twitter' | 'hospital' | 'government';
  metadata: EventMetadata;
  raw_event_ids: string[];
}

export interface TwitterData {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
  };
  geo?: {
    place_id?: string;
    coordinates: {
      type: string;
      coordinates: [number, number];
    };
  };
  context_annotations: Array<{
    domain: { id: string; name: string };
    entity: { id: string; name: string };
  }>;
  lang: string;
  possibly_sensitive: boolean;
}

export interface NewsData {
  headline: string;
  article_text: string;
  published_at: string;
  source_outlet: string;
  author?: string;
  url: string;
  location_mentioned: string[];
  category: string;
}

export interface HospitalData {
  patient_id: string;
  admission_datetime: string;
  chief_complaint: string;
  clinical_notes: string;
  diagnosis_codes: string[];
  admission_type: 'emergency' | 'scheduled' | 'transfer';
  disposition: 'admitted' | 'discharged' | 'deceased' | 'transferred';
  demographics: {
    age: number;
    gender: 'M' | 'F' | 'O';
    location: string;
  };
}

export interface RawEvent {
  id: string;
  type: 'twitter' | 'news' | 'hospital';
  data: TwitterData | NewsData | HospitalData;
  processing: {
    retrieved_at?: string;
    scraped_at?: string;
    record_created_at?: string;
    api_version?: string;
    word_count?: number;
    hospital_system?: string;
  };
}

export interface EventsSummary {
  timestamp: string;
  time_range: {
    start: string;
    end: string;
  };
  total_events: number;
  events_by_type: {
    weather: number;
    flood: number;
    vector_signal: number;
    social_media_health_signal: number;
    hospital_admission: number;
    mortality: number;
    policy_action: number;
  };
  events_by_source: {
    news: number;
    twitter: number;
    hospital: number;
    government: number;
  };
  geographic_distribution: Array<{
    location: string;
    lat: number;
    lon: number;
    event_count: number;
    signal_strength_avg: number;
  }>;
  trends: {
    signal_velocity: number;
    health_signals_trend: 'increasing' | 'decreasing' | 'stable';
    geographic_spread: 'expanding' | 'contracting' | 'stable';
  };
  predictions: Array<{
    type: 'early_warning' | 'risk_assessment' | 'recommendation';
    message: string;
    confidence: number;
    time_horizon: string;
  }>;
  key_insights: string[];
}