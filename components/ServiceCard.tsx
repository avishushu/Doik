type ServiceCardProps = {
  title: string;
  description: string;
  price?: string;
};

export default function ServiceCard({ title, description, price }: ServiceCardProps) {
  return (
    <div className="rounded-2xl border border-gold-light bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gold-dark mb-2">{title}</h3>
      <p className="text-sm text-charcoal/80 leading-relaxed">{description}</p>
      {price && <p className="mt-4 text-sm font-medium text-charcoal">{price}</p>}
    </div>
  );
}
