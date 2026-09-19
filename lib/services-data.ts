export type ServiceItem = {
  title: string;
  price: string;
  duration: string;
  emoji: string;
  image: string;
  badge?: string;
  featured?: boolean;
};

const nailsImg = "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?auto=format&fit=crop&q=80&w=600";
const makeupImg = "https://images.unsplash.com/photo-1500840216050-6ffa99d75160?auto=format&fit=crop&q=80&w=600";
const hairImg = "https://images.unsplash.com/photo-1602549179763-ce6c9df961b7?auto=format&fit=crop&q=80&w=600";

export const services: ServiceItem[] = [
  { title: "בניית ציפורניים", price: "₪220", duration: "75 דק׳", emoji: "💅", image: nailsImg },
  { title: "מניקור ולק ג'ל", price: "₪180", duration: "45 דק׳", emoji: "💅", badge: "🔥 מבוקש", image: nailsImg, featured: true },
  { title: "איפור ערב", price: "₪350", duration: "60 דק׳", emoji: "💄", image: makeupImg, featured: true },
  { title: "איפור כלה", price: "₪450", duration: "90 דק׳", emoji: "💄", image: makeupImg },
  { title: "תסרוקת ערב", price: "₪250", duration: "50 דק׳", emoji: "💇‍♀️", image: hairImg, featured: true },
  { title: "תסרוקת כלה", price: "₪380", duration: "70 דק׳", emoji: "💇‍♀️", image: hairImg },
];
