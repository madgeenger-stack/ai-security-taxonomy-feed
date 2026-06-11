import { useState, useEffect, useMemo, Fragment } from "react";

const FEED_URL =
  "https://raw.githubusercontent.com/madgeenger-stack/ai-security-taxonomy-feed/refs/heads/main/vendors.json";

// [key, full label, column code]
const CAPS = [
  ["llm_firewall", "LLM Firewall", "FW"],
  ["prompt_injection_defense", "Prompt Injection Defense", "PI"],
  ["agentic_security", "Agentic Security", "AGT"],
  ["shadow_ai_discovery", "Shadow AI Discovery", "SHD"],
  ["ai_spm", "AI-SPM", "SPM"],
  ["ai_red_teaming", "AI Red Teaming", "RT"],
  ["dspm_ai_data_sec", "DSPM / AI Data Sec", "DSP"],
  ["endpoint_ai_control", "Endpoint AI Control", "EP"],
  ["ai_governance", "AI Governance", "GOV"],
  ["ai_powered_soc_xdr", "AI SOC / XDR", "SOC"],
];

function stCls(status) {
  const v = (status || "").toUpperCase();
  if (/ACTIVE/.test(v)) return "act";
  if (/ACQUIRED|EXIT/.test(v)) return "acq";
  return "upd";
}

function Section({ cat, items, count }) {
  return (
    <section className="lb-section">
      <div className="lb-banner">{cat} <span>— {count} records</span></div>
      <div className="lb-scroll">
        <div className="lb-grid">
          <div className="lb-h lb-hv">RECORD</div>
          {CAPS.map(([k, full, code]) => (
            <div key={k} className="lb-h lb-hc" title={full}>{code}</div>
          ))}
          <div className="lb-h lb-hn">Σ</div>

          {items.map(({ v, no }) => {
            const caps = v.capabilities || {};
            const n = CAPS.filter(([k]) => caps[k]).length;
            return (
              <Fragment key={v.name + no}>
                <div className="lb-vcell">
                  <div className="lb-no">No.{String(no).padStart(3, "0")}</div>
                  <div className="lb-nmrow">
                    <span className="lb-nm">{v.name}</span>
                    <span className={"lb-st " + stCls(v.status)}>{v.status}</span>
                  </div>
                  <div className="lb-meta">{v.hq || "—"} &middot; {v.funding_stage || "—"}</div>
                  {v.key_capability && <div className="lb-kc">{v.key_capability}</div>}
                </div>
                {CAPS.map(([k]) => (
                  <div key={k} className={"lb-cell" + (caps[k] ? " on" : "")}>
                    {caps[k]
                      ? <span className="lb-fill" />
                      : <span className="lb-dot">·</span>}
                  </div>
                ))}
                <div className="lb-ncell">{n}</div>
                {v.notes && <div className="lb-notes">※ {v.notes}</div>}
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [cat, setCat] = useState("All");
  const [feed, setFeed] = useState(null);
  const [error, setError] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    fetch(FEED_URL, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`Feed returned HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (cancelled) return;
        if (!Array.isArray(json)) throw new Error("Feed is not a JSON array");
        setFeed(json);
        setFetchedAt(new Date());
      })
      .catch((e) => { if (!cancelled) setError(e.message || String(e)); });
    return () => { cancelled = true; };
  }, []);

  const data = feed || [];

  const cats = useMemo(() => {
    const order = [], counts = {};
    data.forEach((v) => {
      if (!(v.category in counts)) { counts[v.category] = 0; order.push(v.category); }
      counts[v.category]++;
    });
    return { order, counts };
  }, [data]);

  const groups = useMemo(() => {
    const g = {};
    data.forEach((v, i) => { (g[v.category] = g[v.category] || []).push({ v, no: i + 1 }); });
    return g;
  }, [data]);

  const sections = cat === "All" ? cats.order : [cat];

  return (
    <div className="lb-root">
      <style>{CSS}</style>
      <header className="lb-head">
        <h1 className="lb-title">AI Security Vendor Logbook</h1>
        <p className="lb-sub">
          Field record · vol. 1 · {data.length} entries · {cats.order.length} sections ·{" "}
          <a href={FEED_URL} target="_blank" rel="noreferrer">live feed</a>
        </p>
      </header>

      {error && (
        <div className="lb-alert">
          FEED UNREACHABLE — {error} ·{" "}
          <button className="lb-retry" onClick={() => { setFeed(null); setError(null); window.location.reload(); }}>
            retry
          </button>
        </div>
      )}

      {!feed && !error && (
        <div className="lb-loading">Fetching live feed…</div>
      )}

      {feed && (
        <>
          <div className="lb-key">
            <div className="lb-key-h">KEY — capability columns</div>
            <div className="lb-key-grid">
              {CAPS.map(([k, full, code]) => (
                <div key={k} className="lb-key-item"><b>{code}</b> {full}</div>
              ))}
            </div>
            <div className="lb-key-mark"><span className="lb-fill" /> supported &nbsp;&nbsp; <span className="lb-dot">·</span> not tracked &nbsp;&nbsp; Σ = count / 10</div>
          </div>

          <nav className="lb-index" aria-label="Sections">
            <button className={"lb-tab" + (cat === "All" ? " active" : "")} onClick={() => setCat("All")}>
              All <i>{data.length}</i>
            </button>
            {cats.order.map((c) => (
              <button key={c} className={"lb-tab" + (cat === c ? " active" : "")} onClick={() => setCat(c)}>
                {c} <i>{cats.counts[c]}</i>
              </button>
            ))}
          </nav>

          <main className="lb-body">
            {sections.map((c) => (
              <Section key={c} cat={c} items={groups[c]} count={cats.counts[c]} />
            ))}
          </main>
        </>
      )}

      <footer className="lb-foot">
        Live feed: ai-security-taxonomy-feed/vendors.json
        {fetchedAt && <> · fetched {fetchedAt.toLocaleString()}</>}
      </footer>
    </div>
  );
}

const CSS = `
.lb-root{
  --paper:#efe7d4; --paper2:#f3ecdd; --ink:#22302a; --red:#b1442f; --graph:#6f675a;
  --rule:rgba(90,120,140,.26); --blue:#5f7d92;
  --serif:'Iowan Old Style','Palatino Linotype',Georgia,'Times New Roman',serif;
  --tw:'Courier New',ui-monospace,monospace;
  background:
    linear-gradient(90deg,transparent 52px,rgba(177,68,47,.5) 52px,rgba(177,68,47,.5) 53.5px,transparent 53.5px),
    var(--paper);
  color:var(--ink); min-height:100vh; padding:34px 30px 48px 70px; box-sizing:border-box;
}
.lb-root *{box-sizing:border-box}
.lb-head{max-width:1120px;margin:0 0 16px}
.lb-title{font-family:var(--serif);font-size:30px;font-weight:700;letter-spacing:.3px;
  margin:0 0 8px;border-bottom:2px solid var(--ink);padding-bottom:8px}
.lb-sub{font-family:var(--tw);font-size:11px;color:var(--graph);letter-spacing:.5px;
  text-transform:uppercase;margin:0}
.lb-sub a{color:var(--red);text-decoration:none;border-bottom:1px solid rgba(177,68,47,.4)}

.lb-loading{max-width:1120px;font-family:var(--tw);font-size:12px;color:var(--graph);
  letter-spacing:.6px;text-transform:uppercase;padding:40px 0}
.lb-alert{max-width:1120px;font-family:var(--tw);font-size:11px;color:var(--red);
  border:1px solid var(--red);border-radius:3px;background:rgba(177,68,47,.06);
  padding:10px 14px;margin:0 0 20px;letter-spacing:.4px}
.lb-retry{appearance:none;background:none;border:none;cursor:pointer;font-family:var(--tw);
  font-size:11px;color:var(--red);text-decoration:underline;padding:0}

.lb-key{max-width:1120px;border:1px solid var(--ink);border-radius:3px;background:var(--paper2);
  padding:10px 14px;margin:0 0 20px}
.lb-key-h{font-family:var(--tw);font-size:9.5px;letter-spacing:.8px;color:var(--graph);
  text-transform:uppercase;margin-bottom:7px}
.lb-key-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:2px 18px}
.lb-key-item{font-family:var(--tw);font-size:10.5px;color:var(--ink)}
.lb-key-item b{display:inline-block;width:30px;color:var(--red)}
.lb-key-mark{font-family:var(--tw);font-size:10px;color:var(--graph);margin-top:9px;
  padding-top:8px;border-top:1px solid var(--rule);display:flex;align-items:center}
.lb-key-mark .lb-fill{margin-right:5px}
.lb-key-mark .lb-dot{margin:0 4px}

.lb-index{max-width:1120px;display:flex;flex-wrap:wrap;gap:5px 18px;margin:0 0 6px;
  padding-bottom:14px;border-bottom:1px solid var(--rule)}
.lb-tab{appearance:none;background:none;border:none;cursor:pointer;font-family:var(--tw);
  font-size:11px;color:var(--graph);letter-spacing:.3px;padding:2px 0;border-bottom:2px solid transparent}
.lb-tab:hover{color:var(--ink)}
.lb-tab.active{color:var(--ink);border-bottom-color:var(--red);font-weight:700}
.lb-tab i{font-style:normal;color:var(--graph);opacity:.75;margin-left:2px}
.lb-tab:focus-visible{outline:2px solid var(--red);outline-offset:2px}

.lb-body{max-width:1120px}
.lb-banner{font-family:var(--serif);font-size:15px;font-weight:700;letter-spacing:.4px;
  margin:24px 0 0;padding:4px 0;border-bottom:2px solid var(--ink);text-transform:uppercase}
.lb-banner span{font-family:var(--tw);font-size:10px;font-weight:400;text-transform:none;
  color:var(--graph);letter-spacing:.5px}

.lb-scroll{overflow-x:auto}
.lb-grid{display:grid;
  grid-template-columns:minmax(218px,1.4fr) repeat(10,minmax(30px,1fr)) 34px;
  min-width:680px;background:var(--paper)}
.lb-h{font-family:var(--tw);font-size:9.5px;letter-spacing:.4px;color:var(--graph);
  padding:7px 4px 6px;border-bottom:2px solid var(--ink);text-align:center;
  align-self:stretch;display:flex;align-items:flex-end;justify-content:center}
.lb-hv{justify-content:flex-start}
.lb-hc{border-left:1px solid var(--rule);font-weight:700;color:var(--ink)}
.lb-hn{border-left:2px solid var(--ink)}

.lb-vcell{padding:10px 12px 11px 0;border-bottom:1px solid var(--rule)}
.lb-no{font-family:var(--tw);font-size:9px;color:var(--graph);letter-spacing:.3px}
.lb-nmrow{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin:1px 0 0}
.lb-nm{font-family:var(--serif);font-size:16px;font-weight:700;line-height:1.12}
.lb-st{font-family:var(--tw);font-size:8px;letter-spacing:.5px;padding:1px 5px;
  border:1px solid;border-radius:2px;text-transform:uppercase;white-space:nowrap}
.lb-st.acq{color:var(--red);border-color:var(--red)}
.lb-st.act{color:#3f6b4a;border-color:#3f6b4a}
.lb-st.upd{color:var(--blue);border-color:var(--blue)}
.lb-meta{font-family:var(--tw);font-size:9.5px;color:var(--graph);margin:5px 0 0;line-height:1.45}
.lb-kc{font-family:var(--serif);font-style:italic;font-size:11.5px;color:var(--ink);
  margin:4px 0 0;line-height:1.35}

.lb-cell{display:flex;align-items:center;justify-content:center;
  border-bottom:1px solid var(--rule);border-left:1px solid var(--rule);min-height:34px}
.lb-cell.on{background:rgba(34,48,42,.07)}
.lb-fill{width:13px;height:13px;background:var(--ink);border-radius:1px;display:inline-block;flex:none}
.lb-dot{color:var(--graph);opacity:.4;font-size:15px;line-height:1}
.lb-ncell{display:flex;align-items:center;justify-content:center;font-family:var(--tw);
  font-size:11.5px;font-weight:700;color:var(--ink);border-bottom:1px solid var(--rule);
  border-left:2px solid var(--ink)}
.lb-notes{grid-column:1/-1;font-family:var(--serif);font-style:italic;font-size:11px;
  color:var(--graph);padding:7px 0 9px 2px;border-bottom:1px solid var(--rule);line-height:1.45}

.lb-foot{max-width:1120px;font-family:var(--tw);font-size:10px;color:var(--graph);
  letter-spacing:.4px;margin-top:30px;padding-top:14px;border-top:1px solid var(--rule)}

@media (max-width:620px){
  .lb-root{padding:26px 14px 40px 40px;
    background:linear-gradient(90deg,transparent 24px,rgba(177,68,47,.5) 24px,rgba(177,68,47,.5) 25.5px,transparent 25.5px),var(--paper);}
  .lb-title{font-size:23px}
}
`;
