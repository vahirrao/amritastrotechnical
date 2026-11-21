// Shared with the payment server. Set a specialty price in rupees to enable enrolment.
export const traditionalNote = "Traditional knowledge for self-reflection; not scientific or medical advice; no guaranteed outcomes.";
export const wellnessNote = "General well-being and confidence; not medical or cosmetic treatment.";
export const products = [
  { id: "basic-3m", name: "3 Months Basic Course (Adults)", group: "flagship", price: 32500, referencePrice: 50000,
    topics: ["Stock market participants and market structure", "Investing approaches and risk awareness", "Chart-reading fundamentals", "Investor psychology and portfolio basics"] },
  { id: "adv-6m", name: "6 Months Advanced Course (Adults)", group: "flagship", price: 90000, referencePrice: 150000,
    topics: ["Technical analysis, chart patterns and indicators", "Volume, market structure and candle psychology", "Risk management principles", "Sector and macro basics", "Decision-making psychology"] },
  { id: "adv-1y", name: "1 Year Advanced Course + Health", group: "flagship", price: 120000, referencePrice: 200000,
    topics: ["Everything in the 6-month course", "Wealth and financial planning principles", "Stress awareness and mental well-being", "Healthy lifestyle guidance", "Self-Development Mastery Programme"] },
  { id: "adv-2y", name: "2 Years Advanced Course + Health + Overall Wellness", group: "flagship", price: 240000, referencePrice: 400000,
    topics: ["Everything in the 1-year course", "Holistic wellness and Astro-Vastu guidance", "NLP and Swar Vigyan (breath and sound awareness)", "Leadership and life mastery", traditionalNote] },
  { id: "intro-webinar", name: "Intro Webinar: Money, Mind & Wellness", group: "webinar", price: 99, referencePrice: null,
    topics: ["Explore the relationship between financial learning, mindset and everyday well-being."] },
  { id: "face-yoga", name: "Face Yoga", group: "specialty", price: null, referencePrice: null,
    topics: ["Facial exercises, tension release and mindful daily relaxation routines.", wellnessNote] },
  { id: "age-number", name: "Age Is Just a Number - Feeling Younger Than Your Present Age", group: "specialty", price: null, referencePrice: null,
    topics: ["Daily habits for energy, a positive mindset and confidence.", wellnessNote] },
  { id: "hand-lines", name: "Mind Analysis Through Hand Lines", group: "specialty", price: null, referencePrice: null,
    topics: ["Explore traditional palmistry patterns as prompts for personal reflection and self-awareness.", traditionalNote] }
];
export default products;
