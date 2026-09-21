const COUNTRY_FLAGS = {
  "United States": "🇺🇸",
  Canada: "🇨🇦",
  "United Kingdom": "🇬🇧",
  Switzerland: "🇨🇭",
  Germany: "🇩🇪",
  France: "🇫🇷",
  Italy: "🇮🇹",
  Netherlands: "🇳🇱",
  Sweden: "🇸🇪",
  Denmark: "🇩🇰",
  Ireland: "🇮🇪",
  Spain: "🇪🇸",
  China: "🇨🇳",
  Japan: "🇯🇵",
  "South Korea": "🇰🇷",
  Singapore: "🇸🇬",
  India: "🇮🇳",
  "Hong Kong": "🇭🇰",
  Malaysia: "🇲🇾",
  Australia: "🇦🇺",
  "New Zealand": "🇳🇿",
  Israel: "🇮🇱",
  "United Arab Emirates": "🇦🇪",
  Qatar: "🇶🇦",
  Turkey: "🇹🇷",
  "Saudi Arabia": "🇸🇦",
};

export function flagFor(country) {
  return COUNTRY_FLAGS[country] || "🏳️";
}
