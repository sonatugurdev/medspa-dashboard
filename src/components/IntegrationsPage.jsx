import { useState, useEffect, useCallback } from "react";
import { useAuth, apiClient, PRACTICE_SLUG } from "../lib/auth";

// ── Shared helpers (copied from SettingsPage) ──────────────────

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>{title}</div>
      {subtitle && <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>{subtitle}</div>}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.01em" }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{hint}</div>}
    </div>
  );
}

const inputStyle = {
  padding: "9px 12px",
  borderRadius: 7,
  border: "1px solid var(--border)",
  background: "var(--bg)",
  fontSize: 13,
  color: "var(--text-primary)",
  fontFamily: "var(--font-body)",
  outline: "none",
  width: "100%",
  transition: "border-color 0.15s",
};

function Input({ value, onChange, placeholder, type = "text", disabled }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputStyle,
        borderColor: focused ? "var(--teal)" : "var(--border)",
        opacity: disabled ? 0.6 : 1,
      }}
    />
  );
}

function SaveButton({ onClick, saving, saved, label = "Save Changes" }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      style={{
        padding: "9px 20px",
        borderRadius: 7,
        border: "none",
        background: saved ? "var(--green)" : "var(--teal)",
        color: "white",
        fontSize: 13,
        fontWeight: 600,
        cursor: saving ? "wait" : "pointer",
        fontFamily: "var(--font-body)",
        transition: "background 0.2s",
        opacity: saving ? 0.7 : 1,
        minWidth: 130,
      }}
    >
      {saving ? "Saving…" : saved ? "✓ Saved" : label}
    </button>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{
      background: "var(--red-subtle)", border: "1px solid var(--red)",
      borderRadius: 7, padding: "10px 14px", fontSize: 13, color: "var(--red)", marginBottom: 16,
    }}>
      {message}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "24px 28px",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Keragon / Zapier Connect Section ───────────────────────────

function ConnectSection() {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: "var(--text-muted)",
        textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 12,
      }}>
        Connect via Keragon / Zapier
      </div>
      <div style={{ display: "flex", gap: 16 }}>

        {/* Keragon */}
        <div style={{
          flex: 1,
          background: "var(--surface)",
          border: "2px solid var(--teal)",
          borderRadius: 10,
          padding: "20px 22px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
              Keragon
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
              background: "var(--teal-subtle)", color: "var(--teal)",
            }}>
              Recommended
            </span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10, lineHeight: 1.5 }}>
            HIPAA-compliant automation. Supports PHI and patient data end-to-end.
          </div>
          <span style={{
            display: "inline-flex", alignItems: "center",
            fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 5,
            background: "rgba(34, 197, 94, 0.1)", color: "var(--green)",
            border: "1px solid var(--green)",
            marginBottom: 14,
          }}>
            HIPAA compliant · PHI supported
          </span>
          <ol style={{ paddingLeft: 16, margin: "0 0 16px", fontSize: 12, color: "var(--text-secondary)", lineHeight: 2 }}>
            <li>Generate an API key below</li>
            <li>Go to Keragon and find your platform</li>
            <li>Paste the API key when prompted</li>
            <li>Choose a template or build your workflow</li>
          </ol>
          <a
            href="https://www.keragon.com/integrations"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: "8px 16px", borderRadius: 7, fontSize: 13, fontWeight: 600,
              background: "var(--teal)", color: "white",
              textDecoration: "none", fontFamily: "var(--font-body)",
            }}
          >
            Connect via Keragon →
          </a>
        </div>

        {/* Zapier */}
        <div style={{
          flex: 1,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "20px 22px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
              Zapier
            </span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10, lineHeight: 1.5 }}>
            General-purpose automation. Connects to 5,000+ apps.
          </div>
          <span style={{
            display: "inline-flex", alignItems: "center",
            fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 5,
            background: "rgba(245, 158, 11, 0.1)", color: "#D97706",
            border: "1px solid #D97706",
            marginBottom: 14,
          }}>
            Non-PHI workflows only
          </span>
          <ol style={{ paddingLeft: 16, margin: "0 0 16px", fontSize: 12, color: "var(--text-secondary)", lineHeight: 2 }}>
            <li>Generate an API key below</li>
            <li>Go to Zapier and find your platform</li>
            <li>Paste the API key when prompted</li>
            <li>Choose a template or build your workflow</li>
          </ol>
          <a
            href="https://zapier.com/apps"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-block",
              padding: "8px 16px", borderRadius: 7, fontSize: 13, fontWeight: 600,
              background: "var(--bg)", color: "var(--text-secondary)",
              border: "1px solid var(--border)",
              textDecoration: "none", fontFamily: "var(--font-body)",
            }}
          >
            Connect via Zapier →
          </a>
        </div>

      </div>
    </div>
  );
}

// ── One-Time Secret Banner ─────────────────────────────────────

function OneTimeBanner({ title, value, onDismiss }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      background: "var(--teal-subtle)", border: "1px solid var(--teal)",
      borderRadius: 8, padding: "14px 16px", marginBottom: 20,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--teal)" }}>{title}</div>
        <button
          onClick={onDismiss}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontSize: 18, lineHeight: 1, padding: "0 0 0 8px",
          }}
        >
          ×
        </button>
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "var(--bg)", borderRadius: 6, padding: "10px 12px",
        border: "1px solid var(--border)",
      }}>
        <code style={{
          flex: 1, fontSize: 12, fontFamily: "monospace",
          color: "var(--text-primary)", wordBreak: "break-all",
        }}>
          {value}
        </code>
        <button
          onClick={handleCopy}
          style={{
            padding: "4px 10px", borderRadius: 5, fontSize: 11, fontWeight: 600,
            border: "1px solid var(--border)",
            background: copied ? "var(--green)" : "var(--surface)",
            color: copied ? "white" : "var(--text-secondary)",
            cursor: "pointer", fontFamily: "var(--font-body)", flexShrink: 0,
            transition: "all 0.15s",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div style={{ fontSize: 11, color: "var(--red)", marginTop: 8, fontWeight: 500 }}>
        Copy this key now. It will never be shown again.
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatRelativeDate(iso) {
  if (!iso) return "Never";
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  const months = Math.floor(diffDays / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "40px 0", color: "var(--text-muted)", fontSize: 13 }}>
      <div style={{ width: 16, height: 16, border: "2px solid var(--border)", borderTopColor: "var(--teal)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      Loading…
    </div>
  );
}

// ── API Keys Tab ───────────────────────────────────────────────

function ApiKeysTab({ client, onUnauth }) {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [generating, setGenerating] = useState(false);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await client.get(`/api/v1/integrations/${PRACTICE_SLUG}/api-keys`);
        if (!cancelled) setKeys(Array.isArray(data) ? data : (data.keys || []));
      } catch (e) {
        if (!cancelled) {
          if (e.message === "UNAUTHORIZED") onUnauth();
          else setError("Failed to load API keys.");
        }
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleGenerate = async () => {
    if (!newLabel.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      const data = await client.post(`/api/v1/integrations/${PRACTICE_SLUG}/api-keys`, { label: newLabel.trim() });
      setBanner({ key: data.raw_key, label: data.label || newLabel.trim() });
      setKeys(prev => [data, ...prev]);
      setNewLabel("");
      setShowForm(false);
    } catch (e) {
      if (e.message === "UNAUTHORIZED") onUnauth();
      else setError("Failed to generate API key.");
    }
    setGenerating(false);
  };

  const handleRevoke = async (keyId) => {
    if (!window.confirm("Revoke this API key? Apps using it will lose access immediately.")) return;
    try {
      await client.delete(`/api/v1/integrations/${PRACTICE_SLUG}/api-keys/${keyId}`);
      setKeys(prev => prev.map(k => k.id === keyId ? { ...k, revoked_at: new Date().toISOString() } : k));
    } catch (e) {
      if (e.message === "UNAUTHORIZED") onUnauth();
    }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 720 }}>
      <SectionHeader
        title="API Keys"
        subtitle="Use API keys to authenticate your integrations with Keragon, Zapier, and direct API access."
      />
      <ErrorBanner message={error} />

      {banner && (
        <OneTimeBanner
          title={`API Key generated: ${banner.label}`}
          value={banner.key}
          onDismiss={() => setBanner(null)}
        />
      )}

      <Card style={{ marginBottom: 16 }}>
        {keys.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text-muted)", padding: "8px 0" }}>
            No API keys yet. Generate one to get started.
          </div>
        ) : (
          <div>
            {keys.map((k, i) => (
              <div
                key={k.id}
                style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "13px 0",
                  borderBottom: i < keys.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>
                    {k.label}
                  </div>
                  <div style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-muted)" }}>
                    {k.key_prefix || (k.key ? k.key.slice(0, 14) + "•••" : "msp_live_••••••••")}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0, textAlign: "right" }}>
                  <div>Created {formatDate(k.created_at)}</div>
                  <div>Used: {k.last_used_at ? formatRelativeDate(k.last_used_at) : "Never"}</div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 5, flexShrink: 0,
                  background: !!k.revoked_at ? "var(--red-subtle)" : "rgba(34, 197, 94, 0.1)",
                  color: !!k.revoked_at ? "var(--red)" : "var(--green)",
                  border: `1px solid ${!!k.revoked_at ? "var(--red)" : "var(--green)"}`,
                }}>
                  {!!k.revoked_at ? "Revoked" : "Active"}
                </span>
                {k.status !== "revoked" && (
                  <button
                    onClick={() => handleRevoke(k.id)}
                    style={{
                      padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500,
                      border: "1px solid var(--border)", background: "var(--bg)",
                      color: "var(--red)", cursor: "pointer", fontFamily: "var(--font-body)", flexShrink: 0,
                    }}
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: "9px 18px", borderRadius: 7, fontSize: 13, fontWeight: 600,
            border: "1px solid var(--teal)", background: "var(--teal-subtle)",
            color: "var(--teal)", cursor: "pointer", fontFamily: "var(--font-body)",
          }}
        >
          + Generate New API Key
        </button>
      ) : (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            New API Key
          </div>
          <Field label="Label">
            <Input value={newLabel} onChange={setNewLabel} placeholder="e.g. Keragon Production" />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <SaveButton onClick={handleGenerate} saving={generating} saved={false} label="Generate" />
            <button
              onClick={() => { setShowForm(false); setNewLabel(""); setError(null); }}
              style={{
                padding: "9px 16px", borderRadius: 7, fontSize: 13, fontWeight: 500,
                border: "1px solid var(--border)", background: "var(--bg)",
                color: "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-body)",
              }}
            >
              Cancel
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Webhooks Tab ───────────────────────────────────────────────

const WEBHOOK_EVENTS = [
  { value: "assessment.completed", label: "assessment.completed" },
  { value: "contact.created", label: "contact.created" },
  { value: "recommendation.generated", label: "recommendation.generated" },
];

function WebhooksTab({ client, onUnauth }) {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ url: "", label: "", events: [] });
  const [adding, setAdding] = useState(false);
  const [banner, setBanner] = useState(null);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await client.get(`/api/v1/integrations/${PRACTICE_SLUG}/webhooks`);
        if (!cancelled) setWebhooks(Array.isArray(data) ? data : (data.webhooks || []));
      } catch (e) {
        if (!cancelled) {
          if (e.message === "UNAUTHORIZED") onUnauth();
          else setError("Failed to load webhooks.");
        }
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const toggleEvent = (eventVal) => {
    setForm(f => ({
      ...f,
      events: f.events.includes(eventVal)
        ? f.events.filter(e => e !== eventVal)
        : [...f.events, eventVal],
    }));
  };

  const handleAdd = async () => {
    if (!form.url.trim()) { setError("URL is required."); return; }
    if (form.events.length === 0) { setError("Select at least one event."); return; }
    setAdding(true);
    setError(null);
    try {
      const data = await client.post(`/api/v1/integrations/${PRACTICE_SLUG}/webhooks`, {
        url: form.url.trim(),
        label: form.label.trim(),
        events: form.events,
      });
      if (data.secret) setBanner({ secret: data.secret, label: data.label || form.label || form.url });
      setWebhooks(prev => [data, ...prev]);
      setForm({ url: "", label: "", events: [] });
      setShowForm(false);
    } catch (e) {
      if (e.message === "UNAUTHORIZED") onUnauth();
      else setError("Failed to add webhook.");
    }
    setAdding(false);
  };

  const handleTest = async (webhook) => {
    setTestResults(prev => ({ ...prev, [webhook.id]: "testing" }));
    try {
      await client.post(`/api/v1/integrations/${PRACTICE_SLUG}/webhooks/${webhook.id}/test`, {});
      setTestResults(prev => ({ ...prev, [webhook.id]: "success" }));
    } catch (e) {
      if (e.message === "UNAUTHORIZED") onUnauth();
      else setTestResults(prev => ({ ...prev, [webhook.id]: "fail" }));
    }
    setTimeout(() => {
      setTestResults(prev => {
        const next = { ...prev };
        delete next[webhook.id];
        return next;
      });
    }, 3000);
  };

  const handleRemove = async (webhookId) => {
    if (!window.confirm("Remove this webhook? It will stop receiving events immediately.")) return;
    try {
      await client.delete(`/api/v1/integrations/${PRACTICE_SLUG}/webhooks/${webhookId}`);
      setWebhooks(prev => prev.filter(w => w.id !== webhookId));
    } catch (e) {
      if (e.message === "UNAUTHORIZED") onUnauth();
    }
  };

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: 720 }}>
      <SectionHeader
        title="Webhooks"
        subtitle="Receive real-time events from your practice to external services."
      />
      <ErrorBanner message={error} />

      {banner && (
        <OneTimeBanner
          title={`Webhook secret: ${banner.label}`}
          value={banner.secret}
          onDismiss={() => setBanner(null)}
        />
      )}

      <Card style={{ marginBottom: 16 }}>
        {webhooks.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text-muted)", padding: "8px 0" }}>
            No webhooks configured yet.
          </div>
        ) : (
          <div>
            {webhooks.map((w, i) => {
              const testResult = testResults[w.id];
              return (
                <div
                  key={w.id}
                  style={{
                    padding: "14px 0",
                    borderBottom: i < webhooks.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 600, color: "var(--text-primary)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        marginBottom: 4,
                      }}>
                        {w.url}
                      </div>
                      {w.label && (
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
                          {w.label}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 4 }}>
                        {(w.events || []).map(ev => (
                          <span key={ev} style={{
                            fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 4,
                            background: "var(--bg)", border: "1px solid var(--border)",
                            color: "var(--text-muted)",
                          }}>
                            {ev}
                          </span>
                        ))}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        Last fired: {w.last_fired_at ? formatRelativeDate(w.last_fired_at) : "Never"}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                      {testResult && (
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 5,
                          background: testResult === "success" ? "rgba(34, 197, 94, 0.1)"
                            : testResult === "fail" ? "var(--red-subtle)"
                            : "var(--bg)",
                          color: testResult === "success" ? "var(--green)"
                            : testResult === "fail" ? "var(--red)"
                            : "var(--text-muted)",
                          border: `1px solid ${testResult === "success" ? "var(--green)"
                            : testResult === "fail" ? "var(--red)"
                            : "var(--border)"}`,
                        }}>
                          {testResult === "testing" ? "Testing…"
                            : testResult === "success" ? "✓ Sent"
                            : "✗ Failed"}
                        </span>
                      )}
                      <button
                        onClick={() => handleTest(w)}
                        disabled={testResult === "testing"}
                        style={{
                          padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500,
                          border: "1px solid var(--border)", background: "var(--bg)",
                          color: "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-body)",
                        }}
                      >
                        Test
                      </button>
                      <button
                        onClick={() => handleRemove(w.id)}
                        style={{
                          padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500,
                          border: "1px solid var(--border)", background: "var(--bg)",
                          color: "var(--red)", cursor: "pointer", fontFamily: "var(--font-body)",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: "9px 18px", borderRadius: 7, fontSize: 13, fontWeight: 600,
            border: "1px solid var(--teal)", background: "var(--teal-subtle)",
            color: "var(--teal)", cursor: "pointer", fontFamily: "var(--font-body)",
          }}
        >
          + Add Webhook
        </button>
      ) : (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            New Webhook
          </div>
          <Field label="Endpoint URL">
            <Input
              value={form.url}
              onChange={v => setForm(f => ({ ...f, url: v }))}
              placeholder="https://hooks.example.com/endpoint"
            />
          </Field>
          <Field label="Label">
            <Input
              value={form.label}
              onChange={v => setForm(f => ({ ...f, label: v }))}
              placeholder="e.g. Keragon trigger"
            />
          </Field>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.01em", marginBottom: 8 }}>
              Events
            </div>
            {WEBHOOK_EVENTS.map(ev => (
              <label key={ev.value} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.events.includes(ev.value)}
                  onChange={() => toggleEvent(ev.value)}
                  style={{ accentColor: "var(--teal)", width: 14, height: 14 }}
                />
                <span style={{ fontSize: 13, color: "var(--text-primary)", fontFamily: "monospace" }}>
                  {ev.label}
                </span>
              </label>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <SaveButton onClick={handleAdd} saving={adding} saved={false} label="Add Webhook" />
            <button
              onClick={() => { setShowForm(false); setForm({ url: "", label: "", events: [] }); setError(null); }}
              style={{
                padding: "9px 16px", borderRadius: 7, fontSize: 13, fontWeight: 500,
                border: "1px solid var(--border)", background: "var(--bg)",
                color: "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-body)",
              }}
            >
              Cancel
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Main IntegrationsPage ──────────────────────────────────────

const TABS = [
  { id: "apikeys", label: "API Keys" },
  { id: "webhooks", label: "Webhooks" },
];

export default function IntegrationsPage({ onUnauth }) {
  const { apiKey, logout } = useAuth();
  const client = apiClient(apiKey);
  const [activeTab, setActiveTab] = useState("apikeys");

  const handleUnauth = useCallback(() => {
    logout();
    onUnauth?.();
  }, [logout, onUnauth]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, maxWidth: 900 }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
          Integrations
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>
          Connect your practice to automation platforms and external services.
        </div>
      </div>

      {/* Keragon / Zapier cards */}
      <ConnectSection />

      {/* Tab nav */}
      <div style={{
        display: "flex", gap: 2, borderBottom: "1px solid var(--border)",
        marginBottom: 28,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "9px 16px",
              fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? "var(--teal)" : "var(--text-muted)",
              background: "none", border: "none",
              borderBottom: activeTab === tab.id ? "2px solid var(--teal)" : "2px solid transparent",
              cursor: "pointer", fontFamily: "var(--font-body)",
              marginBottom: -1, transition: "all 0.12s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "apikeys" && (
        <ApiKeysTab client={client} onUnauth={handleUnauth} />
      )}
      {activeTab === "webhooks" && (
        <WebhooksTab client={client} onUnauth={handleUnauth} />
      )}

    </div>
  );
}
