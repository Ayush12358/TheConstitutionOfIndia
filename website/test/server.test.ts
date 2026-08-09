import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import net from "node:net";
import path from "node:path";

// Black-box HTTP tests against the real server (src/index.ts) spawned as a
// child process, covering the routes end to end: /content.json, /api/content,
// /api/index, /api/search, /api/amendments, /api/file, /amendments PDFs,
// /history, the /api/* 404 and the SPA fallback. The server must run with
// cwd = website/ because its repo-root resolution is
// path.resolve(process.cwd(), ".."). Bun.serve honors $PORT when no port is
// given, so we hand it an ephemeral port and poll until it answers.

const websiteDir = path.resolve(import.meta.dir, "..");
const READY_TIMEOUT_MS = 15_000;
const TEST_TIMEOUT_MS = 30_000;

let child: { proc: Bun.Subprocess; base: string; log: () => string } | null = null;
const baseUrl = () => child!.base;

/** A free port: bind :0, note the port, close, hand it to the server. */
function freePort(): Promise<number> {
  const { promise, resolve, reject } = Promise.withResolvers<number>();
  const srv = net.createServer();
  srv.once("error", reject);
  srv.listen(0, "127.0.0.1", () => {
    const { port } = srv.address() as net.AddressInfo;
    srv.close(() => resolve(port));
  });
  return promise;
}

async function collect(stream: ReadableStream<Uint8Array>, into: { text: string }): Promise<void> {
  const decoder = new TextDecoder();
  const reader = stream.getReader();
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    into.text += decoder.decode(value, { stream: true });
  }
}

async function waitForServer(): Promise<{ proc: Bun.Subprocess; base: string; log: () => string }> {
  const port = await freePort();
  const proc = Bun.spawn([process.execPath, "src/index.ts"], {
    cwd: websiteDir,
    env: { ...process.env, PORT: String(port), NODE_ENV: "production" },
    stdout: "pipe",
    stderr: "pipe",
  });
  const out = { text: "" };
  const err = { text: "" };
  collect(proc.stdout as ReadableStream<Uint8Array>, out).catch(() => {});
  collect(proc.stderr as ReadableStream<Uint8Array>, err).catch(() => {});
  const base = `http://127.0.0.1:${port}`;

  // Real-time poll: the child is an external process, so its readiness can
  // only be observed against the platform clock (fake timers can't advance
  // another process).
  const deadline = Date.now() + READY_TIMEOUT_MS;
  for (;;) {
    // Ready once the startup log line appears or the port answers at all.
    if (!out.text.includes("Server running at")) {
      try {
        const res = await fetch(base);
        if (res.status >= 200 && res.status < 500) break;
      } catch {}
    } else break;
    if (Date.now() > deadline) {
      proc.kill();
      throw new Error(
        `Server did not become ready within ${READY_TIMEOUT_MS}ms.\nstdout:\n${out.text}\nstderr:\n${err.text}`,
      );
    }
    await Bun.sleep(100);
  }
  return { proc, base, log: () => `${out.text}\n${err.text}` };
}

/** Raw TCP request so the client can't normalize the path before the server sees it. */
function rawResponse(rawPath: string): Promise<{ status: number; contentType: string }> {
  const { promise, resolve, reject } = Promise.withResolvers<{ status: number; contentType: string }>();
  const url = new URL(baseUrl());
  const sock = net.connect(Number(url.port), "127.0.0.1", () => {
    sock.write(`GET ${rawPath} HTTP/1.1\r\nHost: ${url.host}\r\nConnection: close\r\n\r\n`);
  });
  let buf = "";
  sock.setTimeout(10_000, () => {
    sock.destroy();
    reject(new Error(`raw request timed out: ${rawPath}`));
  });
  sock.on("data", d => {
    buf += d.toString("latin1");
    const headEnd = buf.indexOf("\r\n\r\n");
    if (headEnd === -1) return;
    // Response head is complete — that's all we assert on, so don't wait for
    // the connection to close (Bun's server intermittently delays the FIN on
    // the SPA fallback; the body/teardown isn't part of the contract).
    sock.destroy();
    const head = buf.slice(0, headEnd);
    const statusLine = head.split("\r\n")[0] ?? "";
    const status = Number(statusLine.split(" ")[1] ?? "0");
    const contentType =
      head
        .split("\r\n")
        .find(l => l.toLowerCase().startsWith("content-type:"))
        ?.split(":")[1]
        ?.trim() ?? "";
    resolve({ status, contentType });
  });
  sock.on("error", reject);
  return promise;
}

describe("server routes", () => {
  beforeAll(async () => {
    child = await waitForServer();
  }, READY_TIMEOUT_MS + 5_000);

  afterAll(async () => {
    if (!child) return;
    const proc = child.proc;
    child = null;
    proc.kill();
    // Real-time grace: bound the wait for the external process to exit.
    await Promise.race([proc.exited, Bun.sleep(2_000)]);
  });

  test("GET /content.json: full static payload", async () => {
    const res = await fetch(`${baseUrl()}/content.json`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");
    const body = await res.json();
    expect(Object.keys(body.act_texts)).toHaveLength(106);
    expect(Object.keys(body.bill_texts)).toHaveLength(85);
    expect(body.amendments).toHaveLength(106);
    expect(Object.keys(body.contents)).toHaveLength(39);
  }, TEST_TIMEOUT_MS);

  test("GET /api/search: secular hits the preamble; 1-char query -> 400", async () => {
    const res = await fetch(`${baseUrl()}/api/search?q=secular`);
    expect(res.status).toBe(200);
    const results: Array<{ key: string; title: string; matches: Array<{ line: string; snippet: string }> }> =
      await res.json();
    expect(results.length).toBeGreaterThan(0);
    const preamble = results.find(r => r.key === "preamble");
    expect(preamble).toBeDefined();
    expect(preamble!.matches.some(m => m.line.includes("SECULAR"))).toBe(true);

    const short = await fetch(`${baseUrl()}/api/search?q=s`);
    expect(short.status).toBe(400);
  }, TEST_TIMEOUT_MS);

  test("GET /api/amendments: 106 rows, amendment 01 has a bill", async () => {
    const res = await fetch(`${baseUrl()}/api/amendments`);
    expect(res.status).toBe(200);
    const rows = (await res.json()) as Array<{ number: string; has_bill: boolean; act_url?: string }>;
    expect(rows).toHaveLength(106);
    const first = rows.find(r => r.number === "01");
    expect(first?.has_bill).toBe(true);
    // Historical 6-field shape: external URLs are only in /content.json.
    expect(first).not.toHaveProperty("act_url");
  }, TEST_TIMEOUT_MS);

  test("GET /api/content/preamble: markdown; unknown key -> 404", async () => {
    const res = await fetch(`${baseUrl()}/api/content/preamble`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { key: string; markdown: string };
    expect(body.key).toBe("preamble");
    expect(body.markdown).toContain("WE, THE PEOPLE");

    const missing = await fetch(`${baseUrl()}/api/content/notakey`);
    expect(missing.status).toBe(404);
  }, TEST_TIMEOUT_MS);

  test("GET /api/file/:kind/:n: act/bill 106 are PDFs, invalid -> 404", async () => {
    for (const kind of ["act", "bill"]) {
      const res = await fetch(`${baseUrl()}/api/file/${kind}/106`);
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toBe("application/pdf");
    }
    expect((await fetch(`${baseUrl()}/api/file/act/999`)).status).toBe(404);
    expect((await fetch(`${baseUrl()}/api/file/bogus/1`)).status).toBe(404);
  }, TEST_TIMEOUT_MS);

  test("GET /amendments/:file: canonical PDF 200, unknown name 404, traversal never serves a file", async () => {
    const ok = await fetch(`${baseUrl()}/amendments/AMENDMENT_106_ACT.pdf`);
    expect(ok.status).toBe(200);
    expect(ok.headers.get("content-type")).toBe("application/pdf");
    const magic = new TextDecoder().decode(new Uint8Array(await ok.arrayBuffer()).subarray(0, 4));
    expect(magic).toBe("%PDF");

    expect((await fetch(`${baseUrl()}/amendments/AMENDMENT_999_ACT.pdf`)).status).toBe(404);

    // Raw socket so the client can't rewrite the path. Bun normalizes dot
    // segments (WHATWG URL) before any handler runs, so a literal ".." can
    // never reach the file resolver — it falls through to the SPA fallback.
    // Contract: traversal must never serve a PDF.
    const { status, contentType } = await rawResponse("/amendments/../etc");
    expect(contentType).not.toBe("application/pdf");
    if (status === 404) {
      expect(contentType).toContain("application/json");
    } else {
      expect(contentType.startsWith("text/html")).toBe(true);
    }
  }, TEST_TIMEOUT_MS);

  test("GET /history/index.json: 107 states", async () => {
    const res = await fetch(`${baseUrl()}/history/index.json`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { states: unknown[] };
    expect(body.states).toHaveLength(107);
  }, TEST_TIMEOUT_MS);

  test("GET /history/:file: part3 has versions; unknown key -> 404", async () => {
    const res = await fetch(`${baseUrl()}/history/part3.json`);
    expect(res.status).toBe(200);
    const versions = (await res.json()) as Array<{ from: number; text: string }>;
    expect(Array.isArray(versions)).toBe(true);
    expect(versions.length).toBeGreaterThanOrEqual(1);
    expect(versions[0]?.from).toBeTypeOf("number");
    expect(versions[0]?.text).toBeTypeOf("string");

    expect((await fetch(`${baseUrl()}/history/nope.json`)).status).toBe(404);
  }, TEST_TIMEOUT_MS);

  test("GET /api/nonexistent: 404 JSON, not the SPA fallback", async () => {
    const res = await fetch(`${baseUrl()}/api/nonexistent`);
    expect(res.status).toBe(404);
    expect(res.headers.get("content-type")).toContain("application/json");
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("Not found");
  });

  test("GET /: SPA shell with #root", async () => {
    const res = await fetch(`${baseUrl()}/`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('<div id="root">');
  });
});
