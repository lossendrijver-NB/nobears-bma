import { useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ambitionRepo, contactRepo, serviceRepo } from "@/content/repository";
import { clearBest, detectMode, rank, type SearchMode } from "@/lib/search";
import { cn } from "@/lib/utils";
import { ContactCard, ServiceCard, CardGrid } from "./ui-kit";

const LABEL: Record<SearchMode, string> = { ambition: "Ambitie", service: "Dienst" };
const PLACEHOLDER: Record<SearchMode, string> = {
  ambition: "Wat wil de klant bereiken?",
  service: "Zoek een dienst, bv. huisstijl of video",
};

type Item = { id: string; title: string; slug: string };

export function SearchExperience() {
  const navigate = useNavigate();
  const ambitions = ambitionRepo.all();
  const services = serviceRepo.all();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("ambition");
  const [active, setActive] = useState(-1);
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState("");
  const manualLock = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  // Debounced auto-detection of content type.
  useEffect(() => {
    if (!query.trim()) return;
    const t = setTimeout(() => {
      if (manualLock.current === query) return;
      const out = detectMode(query, mode, ambitions, services);
      if (out.mode !== mode) {
        setMode(out.mode);
        setNotice(`Overgeschakeld naar ${LABEL[out.mode]}`);
      }
    }, 280);
    return () => clearTimeout(t);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 2200);
    return () => clearTimeout(t);
  }, [notice]);

  const results = useMemo(() => {
    const list: Item[] = mode === "ambition" ? ambitions : services;
    if (!query.trim()) return list.map((item) => ({ item, score: 0 }));
    return mode === "ambition" ? rank(query, ambitions) : rank(query, services);
  }, [query, mode, ambitions, services]);

  const items = results.map((r) => r.item).slice(0, 12);
  const noResults = query.trim().length > 0 && items.length === 0;

  function go(item: Item, m: SearchMode = mode) {
    if (m === "ambition") navigate({ to: "/ambitie/$slug", params: { slug: item.slug } });
    else navigate({ to: "/dienst/$slug", params: { slug: item.slug } });
  }

  function switchMode(m: SearchMode) {
    setMode(m);
    setActive(-1);
    manualLock.current = query;
    inputRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" && items.length) {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp" && items.length) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      if (active >= 0) setActive(-1);
      else { setQuery(""); setSubmitted(false); }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && items[active]) return go(items[active]);
      if (!query.trim()) return;
      const out = detectMode(query, mode, ambitions, services);
      const pool = out.mode === "ambition" ? out.ambitions : out.services;
      const best = clearBest<Item>(pool);
      if (best) return go(best, out.mode);
      if (out.mode !== mode) setMode(out.mode);
      setSubmitted(true);
    }
  }

  const fallbackServices = noResults ? rank(query, services, 10).slice(0, 3).map((r) => r.item) : [];
  const fallbackContact = contactRepo.fallback();

  return (
    <div className="mx-auto mt-[12vh] max-w-3xl text-center">
      <h1 className="text-4xl font-medium tracking-tight text-balance sm:text-6xl">
        Wat wil je weten over <span className="text-primary">NOBEARS</span>?
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
        Ontdek welke ambities we kennen, welke diensten daarbij passen en wie je verder kan helpen.
      </p>

      <div className="group mt-10 flex flex-col gap-2 rounded-3xl border border-border bg-surface/90 p-2 shadow-2xl shadow-primary/10 backdrop-blur transition focus-within:border-primary/60 sm:flex-row sm:items-center sm:rounded-full">
        <label htmlFor="q" className="sr-only">Zoeken in {LABEL[mode] === "Ambitie" ? "ambities" : "diensten"}</label>
        <div className="flex flex-1 items-center gap-3 pl-4">
          <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            id="q"
            role="combobox"
            aria-expanded={items.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            autoComplete="off"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(-1); setSubmitted(false); manualLock.current = null; }}
            onKeyDown={onKeyDown}
            placeholder={PLACEHOLDER[mode]}
            className="h-12 w-full bg-transparent text-lg text-foreground outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button type="button" aria-label="Zoekopdracht wissen" onClick={() => { setQuery(""); inputRef.current?.focus(); }} className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-surface-raised hover:text-foreground">
              <X className="size-4" />
            </button>
          )}
        </div>
        <div role="radiogroup" aria-label="Zoekmodus" className="relative grid grid-cols-2 rounded-full bg-surface-raised p-1">
          <span aria-hidden className={cn("absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-primary transition-transform duration-300", mode === "service" && "translate-x-full")} />
          {(["ambition", "service"] as const).map((m) => (
            <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => switchMode(m)}
              className={cn("relative z-10 rounded-full px-6 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", mode === m ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {LABEL[m]}
            </button>
          ))}
        </div>
      </div>
      <p aria-live="polite" className="mt-3 h-5 text-sm text-primary">{notice}</p>

      {!noResults && (
        <section className="mt-6 text-left">
          <h2 className="text-sm text-muted-foreground">
            {submitted ? "Meerdere resultaten — kies wat je bedoelt" : `Voorgestelde ${mode === "ambition" ? "ambities" : "diensten"}`}
          </h2>
          <ul id={listId} role="listbox" aria-label="Suggesties" className="mt-4 flex flex-wrap gap-2">
            {items.map((item, i) => (
              <li key={item.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}
                className="animate-in fade-in zoom-in-95 duration-200">
                <button type="button" tabIndex={-1} onMouseDown={(e) => e.preventDefault()} onClick={() => go(item)}
                  className={cn("rounded-full border border-border bg-chip px-4 py-2 text-[15px] transition hover:border-primary/60 hover:bg-surface-raised",
                    i === active && "border-primary bg-surface-raised ring-2 ring-ring")}>
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
          <p className="sr-only">Gebruik pijltjestoetsen om een suggestie te kiezen en Enter om te openen.</p>
        </section>
      )}

      {noResults && (
        <section aria-live="polite" className="mt-8 animate-in fade-in duration-300 text-left">
          <h2 className="text-2xl font-medium">We herkennen je zoekopdracht niet.</h2>
          {fallbackServices.length > 0 ? (
            <>
              <p className="mt-2 text-muted-foreground">Bedoel je soms…</p>
              <div className="mt-6"><CardGrid>{fallbackServices.map((s) => <ServiceCard key={s.id} service={s} />)}</CardGrid></div>
            </>
          ) : (
            <p className="mt-2 text-muted-foreground">
              Probeer een andere omschrijving, of wis je zoekopdracht om alle {mode === "ambition" ? "ambities" : "diensten"} te zien.
            </p>
          )}
          <div className="mt-8 max-w-md">
            {fallbackContact ? (
              <ContactCard person={fallbackContact} heading={`Niet gevonden wat je zoekt? Neem contact op met ${fallbackContact.name.split(" ")[0]}.`} />
            ) : (
              <p className="text-sm text-muted-foreground">Niet gevonden wat je zoekt? Vraag het je teamleider.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
