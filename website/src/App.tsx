import { useEffect, useState } from "react";
import { marked } from "marked";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import "./index.css";

type IndexItem = { key: string; title: string };
type Content = { key: string; title: string; markdown: string };

export function App() {
  const [preamble, setPreamble] = useState("");
  const [items, setItems] = useState<IndexItem[]>([]);
  const [selected, setSelected] = useState<Content | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/content/preamble")
      .then(res => res.json())
      .then((data: Content) => setPreamble(data.markdown))
      .catch(() => setError("Failed to load the Preamble."));
    fetch("/api/index")
      .then(res => res.json())
      .then(setItems)
      .catch(() => setError("Failed to load the parts and schedules index."));
  }, []);

  const open = async (item: IndexItem) => {
    const res = await fetch(`/api/content/${item.key}`);
    const data: Content = await res.json();
    setSelected(data);
  };

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
          <CardTitle>Preamble</CardTitle>
        </CardHeader>
        <CardContent>
          {preamble ? (
            // Trusted content: markdown is served from this repo's own files via /api/content/:key.
            <div
              className="markdown max-w-prose"
              dangerouslySetInnerHTML={{ __html: marked.parse(preamble, { async: false }) }}
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
        <CardContent>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {items.map(item => (
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
              dangerouslySetInnerHTML={{ __html: marked.parse(selected.markdown, { async: false }) }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default App;
