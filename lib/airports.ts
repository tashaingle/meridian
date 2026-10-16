export type Airport = {
  iata: string;
  city: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
};

export const AIRPORTS: Airport[] = [
  { iata: "LHR", city: "London", name: "Heathrow", country: "United Kingdom", lat: 51.47, lon: -0.4543 },
  { iata: "LGW", city: "London", name: "Gatwick", country: "United Kingdom", lat: 51.1537, lon: -0.1821 },
  { iata: "STN", city: "London", name: "Stansted", country: "United Kingdom", lat: 51.885, lon: 0.235 },
  { iata: "LTN", city: "London", name: "Luton", country: "United Kingdom", lat: 51.8747, lon: -0.3683 },
  { iata: "MAN", city: "Manchester", name: "Manchester", country: "United Kingdom", lat: 53.3537, lon: -2.275 },
  { iata: "EDI", city: "Edinburgh", name: "Edinburgh", country: "United Kingdom", lat: 55.95, lon: -3.3725 },
  { iata: "BHX", city: "Birmingham", name: "Birmingham", country: "United Kingdom", lat: 52.4539, lon: -1.748 },
  { iata: "BRS", city: "Bristol", name: "Bristol", country: "United Kingdom", lat: 51.3827, lon: -2.7191 },
  { iata: "GLA", city: "Glasgow", name: "Glasgow", country: "United Kingdom", lat: 55.8719, lon: -4.4331 },
  { iata: "DUB", city: "Dublin", name: "Dublin", country: "Ireland", lat: 53.4213, lon: -6.2701 },
  { iata: "CDG", city: "Paris", name: "Charles de Gaulle", country: "France", lat: 49.0097, lon: 2.5479 },
  { iata: "ORY", city: "Paris", name: "Orly", country: "France", lat: 48.7233, lon: 2.3794 },
  { iata: "NCE", city: "Nice", name: "Côte d'Azur", country: "France", lat: 43.6584, lon: 7.2159 },
  { iata: "AMS", city: "Amsterdam", name: "Schiphol", country: "Netherlands", lat: 52.3105, lon: 4.7683 },
  { iata: "FRA", city: "Frankfurt", name: "Frankfurt", country: "Germany", lat: 50.0379, lon: 8.5622 },
  { iata: "MUC", city: "Munich", name: "Munich", country: "Germany", lat: 48.3538, lon: 11.7861 },
  { iata: "BER", city: "Berlin", name: "Berlin Brandenburg", country: "Germany", lat: 52.3667, lon: 13.5033 },
  { iata: "MAD", city: "Madrid", name: "Madrid", country: "Spain", lat: 40.4983, lon: -3.5676 },
  { iata: "BCN", city: "Barcelona", name: "Barcelona", country: "Spain", lat: 41.2971, lon: 2.0785 },
  { iata: "AGP", city: "Málaga", name: "Málaga", country: "Spain", lat: 36.6749, lon: -4.4991 },
  { iata: "LIS", city: "Lisbon", name: "Lisbon", country: "Portugal", lat: 38.7742, lon: -9.1342 },
  { iata: "OPO", city: "Porto", name: "Porto", country: "Portugal", lat: 41.2481, lon: -8.6814 },
  { iata: "FCO", city: "Rome", name: "Fiumicino", country: "Italy", lat: 41.8003, lon: 12.2389 },
  { iata: "MXP", city: "Milan", name: "Malpensa", country: "Italy", lat: 45.6306, lon: 8.7281 },
  { iata: "VCE", city: "Venice", name: "Marco Polo", country: "Italy", lat: 45.5053, lon: 12.3519 },
  { iata: "ZRH", city: "Zurich", name: "Zurich", country: "Switzerland", lat: 47.4582, lon: 8.5555 },
  { iata: "GVA", city: "Geneva", name: "Geneva", country: "Switzerland", lat: 46.2381, lon: 6.1089 },
  { iata: "VIE", city: "Vienna", name: "Vienna", country: "Austria", lat: 48.1103, lon: 16.5697 },
  { iata: "CPH", city: "Copenhagen", name: "Copenhagen", country: "Denmark", lat: 55.618, lon: 12.6508 },
  { iata: "ARN", city: "Stockholm", name: "Arlanda", country: "Sweden", lat: 59.6519, lon: 17.9186 },
  { iata: "OSL", city: "Oslo", name: "Oslo", country: "Norway", lat: 60.1939, lon: 11.1004 },
  { iata: "HEL", city: "Helsinki", name: "Helsinki", country: "Finland", lat: 60.3172, lon: 24.9633 },
  { iata: "KEF", city: "Reykjavík", name: "Keflavík", country: "Iceland", lat: 63.985, lon: -22.6056 },
  { iata: "IST", city: "Istanbul", name: "Istanbul", country: "Türkiye", lat: 41.2753, lon: 28.7519 },
  { iata: "ATH", city: "Athens", name: "Athens", country: "Greece", lat: 37.9364, lon: 23.9445 },
  { iata: "DXB", city: "Dubai", name: "Dubai", country: "United Arab Emirates", lat: 25.2532, lon: 55.3657 },
  { iata: "AUH", city: "Abu Dhabi", name: "Abu Dhabi", country: "United Arab Emirates", lat: 24.433, lon: 54.6511 },
  { iata: "DOH", city: "Doha", name: "Hamad", country: "Qatar", lat: 25.2731, lon: 51.608 },
  { iata: "SIN", city: "Singapore", name: "Changi", country: "Singapore", lat: 1.3644, lon: 103.9915 },
  { iata: "HKG", city: "Hong Kong", name: "Hong Kong", country: "Hong Kong", lat: 22.308, lon: 113.9185 },
  { iata: "NRT", city: "Tokyo", name: "Narita", country: "Japan", lat: 35.772, lon: 140.3929 },
  { iata: "HND", city: "Tokyo", name: "Haneda", country: "Japan", lat: 35.5494, lon: 139.7798 },
  { iata: "KIX", city: "Osaka", name: "Kansai", country: "Japan", lat: 34.4347, lon: 135.244 },
  { iata: "ICN", city: "Seoul", name: "Incheon", country: "South Korea", lat: 37.4602, lon: 126.4407 },
  { iata: "BKK", city: "Bangkok", name: "Suvarnabhumi", country: "Thailand", lat: 13.69, lon: 100.7501 },
  { iata: "SYD", city: "Sydney", name: "Sydney", country: "Australia", lat: -33.9399, lon: 151.1753 },
  { iata: "MEL", city: "Melbourne", name: "Melbourne", country: "Australia", lat: -37.669, lon: 144.841 },
  { iata: "AKL", city: "Auckland", name: "Auckland", country: "New Zealand", lat: -37.0082, lon: 174.785 },
  { iata: "JFK", city: "New York", name: "John F. Kennedy", country: "United States", lat: 40.6413, lon: -73.7781 },
  { iata: "EWR", city: "New York", name: "Newark", country: "United States", lat: 40.6895, lon: -74.1745 },
  { iata: "BOS", city: "Boston", name: "Logan", country: "United States", lat: 42.3656, lon: -71.0096 },
  { iata: "LAX", city: "Los Angeles", name: "Los Angeles", country: "United States", lat: 33.9416, lon: -118.4085 },
  { iata: "SFO", city: "San Francisco", name: "San Francisco", country: "United States", lat: 37.6213, lon: -122.379 },
  { iata: "SEA", city: "Seattle", name: "Seattle-Tacoma", country: "United States", lat: 47.4502, lon: -122.3088 },
  { iata: "ORD", city: "Chicago", name: "O'Hare", country: "United States", lat: 41.9742, lon: -87.9073 },
  { iata: "MIA", city: "Miami", name: "Miami", country: "United States", lat: 25.7959, lon: -80.287 },
  { iata: "YYZ", city: "Toronto", name: "Pearson", country: "Canada", lat: 43.6777, lon: -79.6248 },
  { iata: "YVR", city: "Vancouver", name: "Vancouver", country: "Canada", lat: 49.1947, lon: -123.1792 },
  { iata: "MEX", city: "Mexico City", name: "Mexico City", country: "Mexico", lat: 19.4363, lon: -99.0721 },
  { iata: "CUN", city: "Cancún", name: "Cancún", country: "Mexico", lat: 21.0365, lon: -86.8771 },
  { iata: "GRU", city: "São Paulo", name: "Guarulhos", country: "Brazil", lat: -23.4356, lon: -46.4731 },
  { iata: "EZE", city: "Buenos Aires", name: "Ezeiza", country: "Argentina", lat: -34.8222, lon: -58.5358 },
  { iata: "CPT", city: "Cape Town", name: "Cape Town", country: "South Africa", lat: -33.9648, lon: 18.6017 },
  { iata: "JNB", city: "Johannesburg", name: "O. R. Tambo", country: "South Africa", lat: -26.1392, lon: 28.246 },
  { iata: "CAI", city: "Cairo", name: "Cairo", country: "Egypt", lat: 30.112, lon: 31.4 },
  { iata: "CMN", city: "Casablanca", name: "Mohammed V", country: "Morocco", lat: 33.3675, lon: -7.59 },
  { iata: "RAK", city: "Marrakech", name: "Marrakech", country: "Morocco", lat: 31.6069, lon: -8.0363 },
  { iata: "ADD", city: "Addis Ababa", name: "Bole", country: "Ethiopia", lat: 8.9779, lon: 38.7993 },
  { iata: "NBO", city: "Nairobi", name: "Jomo Kenyatta", country: "Kenya", lat: -1.3192, lon: 36.9278 },
  { iata: "DEL", city: "Delhi", name: "Indira Gandhi", country: "India", lat: 28.5562, lon: 77.1 },
  { iata: "BOM", city: "Mumbai", name: "Mumbai", country: "India", lat: 19.0896, lon: 72.8656 },
  { iata: "LBA", city: "Leeds", name: "Leeds Bradford", country: "United Kingdom", lat: 53.8659, lon: -1.6606 },
  { iata: "NCL", city: "Newcastle", name: "Newcastle", country: "United Kingdom", lat: 55.0375, lon: -1.6917 },
  { iata: "IAD", city: "Washington", name: "Dulles", country: "United States", lat: 38.9531, lon: -77.4565 },
  { iata: "IAH", city: "Houston", name: "George Bush", country: "United States", lat: 29.9902, lon: -95.3368 },
  { iata: "DFW", city: "Dallas", name: "Dallas Fort Worth", country: "United States", lat: 32.8998, lon: -97.0403 },
  { iata: "ATL", city: "Atlanta", name: "Hartsfield-Jackson", country: "United States", lat: 33.6407, lon: -84.4277 },
  { iata: "DTW", city: "Detroit", name: "Detroit", country: "United States", lat: 42.2162, lon: -83.3554 },
  { iata: "YUL", city: "Montreal", name: "Trudeau", country: "Canada", lat: 45.4706, lon: -73.7408 },
  { iata: "YOW", city: "Ottawa", name: "Ottawa", country: "Canada", lat: 45.3225, lon: -75.6692 },
  { iata: "YYC", city: "Calgary", name: "Calgary", country: "Canada", lat: 51.1215, lon: -114.0076 },
  { iata: "JED", city: "Jeddah", name: "King Abdulaziz", country: "Saudi Arabia", lat: 21.6796, lon: 39.1565 },
  { iata: "MED", city: "Medina", name: "Prince Mohammad bin Abdulaziz", country: "Saudi Arabia", lat: 24.5534, lon: 39.7051 },
];

const BY_IATA = new Map(AIRPORTS.map((airport) => [airport.iata, airport]));

const POPULAR = ["LHR", "MAN", "JFK", "ORD", "YYZ", "YUL", "JED", "MED"]
  .map((code) => BY_IATA.get(code))
  .filter((airport): airport is Airport => Boolean(airport));

export function getAirport(iata: string | undefined): Airport | undefined {
  if (!iata) return undefined;
  return BY_IATA.get(iata.toUpperCase());
}

export function airportLabel(airport: Airport): string {
  return `${airport.city} · ${airport.name} (${airport.iata})`;
}

export function searchAirports(query: string): Airport[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return POPULAR;
  return AIRPORTS.filter((airport) => {
    return (
      airport.iata.toLowerCase().includes(needle) ||
      airport.city.toLowerCase().includes(needle) ||
      airport.name.toLowerCase().includes(needle) ||
      airport.country.toLowerCase().includes(needle)
    );
  }).slice(0, 8);
}

export function distanceKm(from: string, to: string): number {
  const origin = getAirport(from);
  const destination = getAirport(to);
  if (!origin || !destination) return 0;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(destination.lat - origin.lat);
  const dLon = toRad(destination.lon - origin.lon);
  const lat1 = toRad(origin.lat);
  const lat2 = toRad(destination.lat);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
