type ServiceCardProps = {
  title: string;
  description: string;
  price?: string;
};

export default function ServiceCard({ title, description, price }: ServiceCardProps) {
  return (
    <div className="py-8 grid md:grid-cols-12 gap-3 md:gap-6 items-baseline">
      <h3 className="md:col-span-5 font-serif text-xl text-ink">{title}</h3>
      <p className="md:col-span-5 text-sm text-ink/70 leading-relaxed">{description}</p>
      {price && <p className="md:col-span-2 md:text-left text-sm text-ink/50">{price}</p>}
    </div>
  );
}
