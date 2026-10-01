import { Link, type LinkProps } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Mail, Phone } from "lucide-react";
import type { ReactNode } from "react";
import type { Case, ContactPerson, Service } from "@/content/types";
import { NobearsLogo } from "./NobearsLogo";

export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-dots" />
      <div className="absolute inset-x-0 top-0 h-[80vh] bg-glow opacity-90" />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate min-h-screen">
      <AmbientBackground />
      <header className="mx-auto flex max-w-[1360px] items-center px-4 pt-6 sm:px-8 sm:pt-8">
        <NobearsLogo />
      </header>
      <main className="mx-auto max-w-[1360px] px-4 pb-24 sm:px-8">{children}</main>
    </div>
  );
}

export function BackButton(props: LinkProps & { label?: string }) {
  const { label = "Terug", ...rest } = props;
  return (
    <Link
      {...rest}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-chip px-4 py-2 text-sm text-foreground transition hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ArrowLeft className="size-4" aria-hidden /> {label}
    </Link>
  );
}

export function DetailLayout({
  back, title, intro, body, aside, sectionTitle, children,
}: {
  back: ReactNode; title: string; intro: string; body: string[]; aside?: ReactNode; sectionTitle: string; children: ReactNode;
}) {
  return (
    <div className="mt-10 grid gap-12 lg:mt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 lg:sticky lg:top-10 lg:self-start">
        {back}
        <h1 className="mt-8 text-4xl font-medium leading-[1.05] tracking-tight text-balance sm:text-5xl">{title}</h1>
        <p className="mt-6 text-lg text-foreground/90">{intro}</p>
        <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
          {body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        {aside && <div className="mt-10">{aside}</div>}
      </div>
      <section aria-labelledby="related" className="animate-in fade-in duration-500">
        <h2 id="related" className="text-xl font-medium">{sectionTitle}</h2>
        <div className="mt-6">{children}</div>
      </section>
    </div>
  );
}

export function CardGrid({ children }: { children: ReactNode }) {
  return <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</ul>;
}

export function ServiceCard({ service, from }: { service: Service; from?: string }) {
  return (
    <li>
      <Link
        to="/dienst/$slug"
        params={{ slug: service.slug }}
        search={from ? { from } : {}}
        className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-2 transition hover:-translate-y-0.5 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="aspect-[410/223] overflow-hidden rounded-xl">
          <img src={service.image} alt="" loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
        </div>
        <div className="flex flex-1 flex-col p-3">
          <h3 className="text-lg font-medium">{service.title}</h3>
          <p className="mt-1 flex-1 text-sm text-muted-foreground">{service.shortDescription}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary">
            Ontdek meer <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
          </span>
        </div>
      </Link>
    </li>
  );
}

export function CaseCard({ item }: { item: Case }) {
  return (
    <li>
      <article className="flex h-full flex-col rounded-2xl border border-border bg-surface p-2">
        <div className="aspect-[3/2] overflow-hidden rounded-xl">
          <img src={item.image} alt={`${item.clientName} — ${item.title}`} loading="lazy" className="size-full object-cover" />
        </div>
        <div className="p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">{item.clientName}</p>
          <h3 className="mt-1 text-lg font-medium">{item.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{item.shortDescription}</p>
        </div>
      </article>
    </li>
  );
}

export function ContactCard({ person, heading = "Vragen? Neem contact op" }: { person: ContactPerson; heading?: string }) {
  const initials = person.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  return (
    <aside aria-label="Contactpersoon" className="rounded-2xl border border-border bg-surface/80 p-5 backdrop-blur">
      <p className="text-sm text-muted-foreground">{heading}</p>
      <div className="mt-4 flex items-center gap-4">
        {person.photo ? (
          <img src={person.photo} alt="" className="size-14 rounded-full object-cover" />
        ) : (
          <div aria-hidden className="grid size-14 place-items-center rounded-full bg-surface-raised text-base font-medium">{initials}</div>
        )}
        <div className="min-w-0">
          <p className="font-medium">{person.name}</p>
          <p className="text-sm text-muted-foreground">{person.role}</p>
        </div>
      </div>
      {person.note && <p className="mt-3 text-xs text-muted-foreground">{person.note}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <a href={`mailto:${person.email}`} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Mail className="size-4" aria-hidden /> {person.email}
        </a>
        {person.phone && (
          <a href={`tel:${person.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm transition hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Phone className="size-4" aria-hidden /> {person.phone}
          </a>
        )}
      </div>
    </aside>
  );
}
