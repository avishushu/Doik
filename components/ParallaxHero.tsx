export default function ParallaxHero() {
  return (
    <div className="w-full">
      {/* מרווח ביטחון - בדיוק ברוחב/גובה ההדר הכולל, שחור אחיד */}
      <div className="w-full bg-black" style={{ height: "calc(96px + var(--sat))" }} />

      {/* התמונה - בזרימה רגילה, גובה טבעי לפי יחס הרוחב-גובה שלה, לא תלוי במסך בכלל */}
      <div className="relative w-full overflow-hidden">
        <img
          src="/icons/doik_hero_250926.jpg"
          alt="הודיה ביוטי"
          className="w-full h-auto block"
        />
        {/* השתלבות הדרגתית - בדיוק 50px ראשונים של התמונה, זזה איתה תמיד */}
        <div className="absolute inset-x-0 top-0 h-[50px] bg-gradient-to-b from-black to-transparent pointer-events-none" />
      </div>

      {/* רווח לפני המסכים הבאים */}
      <div className="h-6" />
    </div>
  );
}
