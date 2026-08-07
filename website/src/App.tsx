import { useEffect, useState } from "react";
import { marked } from "marked";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import "./index.css";

type IndexItem = { key: string; title: string };
type Content = { key: string; title: string; markdown: string };
type SearchResult = {
  key: string;
  title: string;
  matches: { line: string; snippet: string }[];
};
type Amendment = {
  number: string;
  title: string;
  assent_date: string;
  key_changes: string;
  status: string;
  has_bill: boolean;
};

// Part keys in display order: part1..part22, then the lettered parts.
const PART_KEYS = [
  "part1", "part2", "part3", "part4", "part5", "part6", "part7", "part8", "part9",
  "part10", "part11", "part12", "part13", "part14", "part15", "part16", "part17",
  "part18", "part19", "part20", "part21", "part22",
  "part4a", "part9a", "part9b", "part14a",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Post-pass over marked's HTML: give every <h2>/<h3> a slugified id for deep links.
function withHeadingAnchors(html: string): string {
  return html.replace(/<h([23])>([^<]*)<\/h\1>/g, (_, level, text) => {
    const id = slugify(text);
    return id ? `<h${level} id="${id}">${text}</h${level}>` : `<h${level}>${text}</h${level}>`;
  });
}

function render(markdown: string): string {
  return withHeadingAnchors(marked.parse(markdown, { async: false }));
}

export function App() {
  const [preamble, setPreamble] = useState("");
  const [items, setItems] = useState<IndexItem[]>([]);
  const [selected, setSelected] = useState<Content | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [amendmentQuery, setAmendmentQuery] = useState("");

  const runSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setResults(null); // query cleared → drop stale results
      return;
    }
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      setResults([]);
      return;
    }
    setResults(await res.json());
  };

  useEffect(() => {
    fetch("/api/content/preamble")
      .then(res => res.json())
      .then((data: Content) => setPreamble(data.markdown))
      .catch(() => setError("Failed to load the Preamble."));
    fetch("/api/index")
      .then(res => res.json())
      .then(setItems)
      .catch(() => setError("Failed to load the parts and schedules index."));
    fetch("/api/amendments")
      .then(res => res.json())
      .then(setAmendments)
      .catch(() => setError("Failed to load the amendments list."));
  }, []);

  const open = async (item: IndexItem) => {
    const res = await fetch(`/api/content/${item.key}`);
    const data: Content = await res.json();
    setSelected(data);
  };

  // Group the index into Parts (explicit display order) and Schedules (numeric).
  const parts = items
    .filter(item => PART_KEYS.includes(item.key))
    .sort((a, b) => PART_KEYS.indexOf(a.key) - PART_KEYS.indexOf(b.key));
  const schedules = items
    .filter(item => /^schedule\d+$/.test(item.key))
    .sort((a, b) => Number(a.key.slice(8)) - Number(b.key.slice(8)));

  const indexButtons = (group: IndexItem[]) => (
    <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
      {group.map(item => (
        <Button
          key={item.key}
          variant="outline"
          className="h-auto justify-start py-2 text-left text-xs leading-snug"
          onClick={() => open(item)}
        >
          {item.title}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-3xl font-bold">The Constitution of India</h1>
        <p className="text-muted-foreground text-sm">
          As amended up to the 106th Amendment (in force 16-04-2026)
        </p>
      </header>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex gap-2" onSubmit={runSearch}>
            <Input
              placeholder="Search the Constitution… e.g. secular, 330A, habeas corpus"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <Button type="submit">Search</Button>
          </form>
          {results && (
            results.length === 0 ? (
              <p className="text-muted-foreground mt-4 text-sm">No matches</p>
            ) : (
              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                {results.map(r => (
                  <Button
                    key={r.key}
                    variant="outline"
                    className="h-auto justify-start py-2 text-left text-xs leading-snug"
                    onClick={() => open(r)}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{r.title}</span>
                      {r.matches[0] && (
                        <span className="text-muted-foreground block truncate">{r.matches[0].snippet}</span>
                      )}
                    </span>
                  </Button>
                ))}
              </div>
            )
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preamble</CardTitle>
        </CardHeader>
        <CardContent>
          {preamble ? (
            // Trusted content: markdown is served from this repo's own files via /api/content/:key.
            <div
              className="markdown max-w-prose"
              dangerouslySetInnerHTML={{ __html: render(preamble) }}
            />
          ) : (
            <p className="text-muted-foreground text-sm">Loading…</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parts &amp; Schedules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold">Parts</h2>
            {indexButtons(parts)}
          </div>
          <div>
            <h2 className="text-sm font-semibold">Schedules</h2>
            {indexButtons(schedules)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Amendments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            placeholder="Filter amendments… e.g. 105, women's reservation"
            value={amendmentQuery}
            onChange={e => setAmendmentQuery(e.target.value)}
          />
          <div className="max-h-[50vh] space-y-1 overflow-y-auto pr-1">
            {amendments
              .filter(a => {
                const q = amendmentQuery.trim().toLowerCase();
                return (
                  q === "" ||
                  a.number.toLowerCase().includes(q) ||
                  a.title.toLowerCase().includes(q)
                );
              })
              .map(a => (
                <div
                  key={a.number}
                  className="flex items-start justify-between gap-2 border-b py-2 text-sm last:border-b-0"
                >
                  <div className="min-w-0">
                    <span className="text-muted-foreground font-mono text-xs">{a.number}</span>
                    <span className="block font-medium leading-snug">{a.title}</span>
                    <span className="text-muted-foreground text-xs">
                      {a.assent_date}
                      {a.status === "MISSING_BILL" && (
                        <span className="italic"> · bill missing</span>
                      )}
                    </span>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button asChild variant="outline" size="sm">
                      <a href={`/api/file/act/${a.number}`} target="_blank" rel="noopener">
                        Act
                      </a>
                    </Button>
                    {a.has_bill && (
                      <Button asChild variant="outline" size="sm">
                        <a href={`/api/file/bill/${a.number}`} target="_blank" rel="noopener">
                          Bill
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle>{selected.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="markdown max-h-[70vh] max-w-prose overflow-y-auto pr-4"
              dangerouslySetInnerHTML={{ __html: render(selected.markdown) }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default App;
