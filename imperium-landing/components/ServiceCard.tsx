import Link from "next/link";

type ServiceCardProps = {
  href: string;
  title: string;
  description: string;
};

export default function ServiceCard({ href, title, description }: ServiceCardProps) {
  return (
    <article className="imperium-card p-6">
      <h3 className="text-2xl text-white">{title}</h3>
      <p className="mt-3 text-sm md:text-base">{description}</p>
      <Link href={href} className="cta-primary mt-6 w-full text-center">
        Ver Serviço
      </Link>
    </article>
  );
}
