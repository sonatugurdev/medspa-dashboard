import { useState, useEffect, useCallback } from "react";
import { useAuth, apiClient, PRACTICE_SLUG } from "../lib/auth";

// ── Shared helpers ─────────────────────────────────────────────

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

function Select({ value, onChange, options }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputStyle,
        borderColor: focused ? "var(--teal)" : "var(--border)",
        cursor: "pointer",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        paddingRight: 32,
      }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
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

const TIMEZONES = [
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Phoenix", label: "Arizona (MST, no DST)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
];

// ── Practice Profile Tab ───────────────────────────────────────

function PracticeProfileTab({ settings, onSaved, client, onUnauth }) {
  const p = settings?.practice || {};
  const [form, setForm] = useState({
    name: p.name || "",
    email: p.email || "",
    phone: p.phone || "",
    address: p.address || "",
    website: p.website || "",
    timezone: p.timezone || "America/Los_Angeles",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // Sync if settings load after mount
  useEffect(() => {
    if (settings?.practice) {
      const pr = settings.practice;
      setForm({
        name: pr.name || "",
        email: pr.email || "",
        phone: pr.phone || "",
        address: pr.address || "",
        website: pr.website || "",
        timezone: pr.timezone || "America/Los_Angeles",
      });
    }
  }, [settings]);

  const set = (field) => (val) => {
    setForm(f => ({ ...f, [field]: val }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await client.patch(
        `/api/dashboard/settings/${PRACTICE_SLUG}/profile`,
        form
      );
      onSaved(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      if (e.message === "UNAUTHORIZED") onUnauth();
      else setError("Failed to save. Please try again.");
    }
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <SectionHeader title="Practice Profile" subtitle="Your practice's public-facing details." />
      <ErrorBanner message={error} />
      <Card>
        <Field label="Practice Name">
          <Input value={form.name} onChange={set("name")} placeholder="Glow & Co. MedSpa" />
        </Field>
        <Field label="Email" hint="Used for patient communications and account notifications.">
          <Input value={form.email} onChange={set("email")} type="email" placeholder="hello@yourpractice.com" />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={set("phone")} type="tel" placeholder="(310) 555-0192" />
        </Field>
        <Field label="Address">
          <Input value={form.address} onChange={set("address")} placeholder="120 Wilshire Blvd, Suite 4, Beverly Hills, CA 90210" />
        </Field>
        <Field label="Website">
          <Input value={form.website} onChange={set("website")} placeholder="yourpractice.com" />
        </Field>
        <Field label="Timezone">
          <Select value={form.timezone} onChange={set("timezone")} options={TIMEZONES} />
        </Field>
        <div style={{ paddingTop: 4 }}>
          <SaveButton onClick={handleSave} saving={saving} saved={saved} />
        </div>
      </Card>
    </div>
  );
}

// ── Practitioners Tab ─────────────────────────────────────────

const CREDENTIALS = [
  { value: "", label: "No credentials" },
  { value: "MD", label: "MD — Medical Doctor" },
  { value: "DO", label: "DO — Doctor of Osteopathy" },
  { value: "NP", label: "NP — Nurse Practitioner" },
  { value: "PA", label: "PA — Physician Assistant" },
  { value: "RN", label: "RN — Registered Nurse" },
  { value: "LE", label: "LE — Licensed Esthetician" },
];

const ROLES = [
  { value: "practitioner", label: "Practitioner" },
  { value: "admin", label: "Admin" },
  { value: "owner", label: "Owner" },
];

function PractitionerRow({ practitioner, onUpdate, client, onUnauth }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleActive = async () => {
    setSaving(true);
    try {
      const updated = await client.patch(
        `/api/dashboard/settings/${PRACTICE_SLUG}/practitioners/${practitioner.id}`,
        { is_active: !practitioner.is_active }
      );
      onUpdate(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      if (e.message === "UNAUTHORIZED") onUnauth();
    }
    setSaving(false);
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      padding: "14px 0",
      borderBottom: "1px solid var(--border)",
      opacity: practitioner.is_active ? 1 : 0.5,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        background: "var(--teal-subtle)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700, color: "var(--teal)", flexShrink: 0,
      }}>
        {practitioner.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
          {practitioner.name}
          {practitioner.credentials && (
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400, marginLeft: 6 }}>
              {practitioner.credentials}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{practitioner.email}</div>
      </div>
      <span style={{
        fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 5,
        background: "var(--bg)", border: "1px solid var(--border)",
        color: "var(--text-secondary)", textTransform: "capitalize",
      }}>
        {practitioner.role}
      </span>
      <button
        onClick={toggleActive}
        disabled={saving}
        style={{
          padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500,
          border: "1px solid var(--border)", background: "var(--bg)",
          color: practitioner.is_active ? "var(--red)" : "var(--green)",
          cursor: "pointer", fontFamily: "var(--font-body)",
        }}
      >
        {saving ? "…" : practitioner.is_active ? "Deactivate" : "Reactivate"}
      </button>
    </div>
  );
}

function PractitionersTab({ settings, onSettingsUpdate, client, onUnauth }) {
  const practitioners = settings?.practitioners || [];
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", credentials: "", role: "practitioner" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (field) => (val) => setForm(f => ({ ...f, [field]: val }));

  const handleAdd = async () => {
    if (!form.name || !form.email) { setError("Name and email are required."); return; }
    setSaving(true);
    setError(null);
    try {
      const newP = await client.post(
        `/api/dashboard/settings/${PRACTICE_SLUG}/practitioners`,
        form
      );
      onSettingsUpdate(prev => ({
        ...prev,
        practitioners: [...(prev.practitioners || []), newP],
      }));
      setForm({ name: "", email: "", credentials: "", role: "practitioner" });
      setShowAdd(false);
    } catch (e) {
      if (e.message === "UNAUTHORIZED") onUnauth();
      else setError("Failed to add practitioner.");
    }
    setSaving(false);
  };

  const handleUpdate = (updated) => {
    onSettingsUpdate(prev => ({
      ...prev,
      practitioners: prev.practitioners.map(p => p.id === updated.id ? updated : p),
    }));
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <SectionHeader title="Practitioners" subtitle="Manage who has access to this practice's dashboard." />
      <Card style={{ marginBottom: 16 }}>
        {practitioners.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text-muted)", padding: "8px 0" }}>
            No practitioners added yet.
          </div>
        ) : (
          <div>
            {practitioners.map(p => (
              <PractitionerRow
                key={p.id}
                practitioner={p}
                onUpdate={handleUpdate}
                client={client}
                onUnauth={onUnauth}
              />
            ))}
          </div>
        )}
      </Card>

      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          style={{
            padding: "9px 18px", borderRadius: 7, fontSize: 13, fontWeight: 600,
            border: "1px solid var(--teal)", background: "var(--teal-subtle)",
            color: "var(--teal)", cursor: "pointer", fontFamily: "var(--font-body)",
          }}
        >
          + Add Practitioner
        </button>
      ) : (
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
            New Practitioner
          </div>
          <ErrorBanner message={error} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
            <Field label="Full Name">
              <Input value={form.name} onChange={set("name")} placeholder="Dr. Sarah Kim" />
            </Field>
            <Field label="Email">
              <Input value={form.email} onChange={set("email")} type="email" placeholder="sarah@practice.com" />
            </Field>
            <Field label="Credentials">
              <Select value={form.credentials} onChange={set("credentials")} options={CREDENTIALS} />
            </Field>
            <Field label="Role">
              <Select value={form.role} onChange={set("role")} options={ROLES} />
            </Field>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <SaveButton onClick={handleAdd} saving={saving} saved={false} label="Add Practitioner" />
            <button
              onClick={() => { setShowAdd(false); setError(null); }}
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

// ── Analysis Settings Tab ──────────────────────────────────────

function AnalysisSettingsTab({ settings, onSaved, client, onUnauth }) {
  const concerns = settings?.concern_options || [];
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  // Local enabled state: concern key → boolean
  const [enabled, setEnabled] = useState(() =>
    Object.fromEntries(concerns.map(c => [c.key || c.id, c.enabled !== false]))
  );

  useEffect(() => {
    if (settings?.concern_options) {
      setEnabled(Object.fromEntries(
        settings.concern_options.map(c => [c.key || c.id, c.enabled !== false])
      ));
    }
  }, [settings]);

  const toggle = (key) => {
    setEnabled(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const updated = concerns.map(c => ({
      ...c,
      enabled: enabled[c.key || c.id] !== false,
    }));
    try {
      const result = await client.patch(
        `/api/dashboard/settings/${PRACTICE_SLUG}/profile`,
        { concern_options: updated }
      );
      onSaved(result);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      if (e.message === "UNAUTHORIZED") onUnauth();
      else setError("Failed to save.");
    }
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <SectionHeader
        title="Analysis Settings"
        subtitle="Control which skin concerns appear in patient intake forms for this practice."
      />
      <ErrorBanner message={error} />
      <Card style={{ marginBottom: 16 }}>
        {concerns.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            No concern options configured. Contact support to set up your form configuration.
          </div>
        ) : (
          <div>
            {concerns.map((c, i) => {
              const key = c.key || c.id;
              const isEnabled = enabled[key] !== false;
              return (
                <div
                  key={key}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "13px 0",
                    borderBottom: i < concerns.length - 1 ? "1px solid var(--border)" : "none",
                  }}
                >
                  {/* Toggle */}
                  <div
                    onClick={() => toggle(key)}
                    style={{
                      width: 36, height: 20, borderRadius: 10, flexShrink: 0,
                      background: isEnabled ? "var(--teal)" : "var(--border)",
                      position: "relative", cursor: "pointer", transition: "background 0.2s",
                    }}
                  >
                    <div style={{
                      position: "absolute", top: 2, left: isEnabled ? 18 : 2,
                      width: 16, height: 16, borderRadius: "50%",
                      background: "white", transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                    }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: isEnabled ? "var(--text-primary)" : "var(--text-muted)" }}>
                      {c.label}
                    </div>
                    {c.description && (
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{c.description}</div>
                    )}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: isEnabled ? "var(--green)" : "var(--text-muted)",
                  }}>
                    {isEnabled ? "Active" : "Off"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
      {concerns.length > 0 && (
        <SaveButton onClick={handleSave} saving={saving} saved={saved} />
      )}
    </div>
  );
}

// ── Main SettingsPage ──────────────────────────────────────────

const TABS = [
  { id: "profile", label: "Practice Profile" },
  { id: "practitioners", label: "Practitioners" },
  { id: "analysis", label: "Analysis Settings" },
];

export default function SettingsPage({ onUnauth }) {
  const { apiKey, logout } = useAuth();
  const client = apiClient(apiKey);

  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleUnauth = useCallback(() => {
    logout();
    onUnauth?.();
  }, [logout, onUnauth]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await client.get(`/api/dashboard/settings/${PRACTICE_SLUG}`);
        setSettings(data);
      } catch (e) {
        if (e.message === "UNAUTHORIZED") handleUnauth();
        else setError("Failed to load settings.");
      }
      setLoading(false);
    };
    load();
  }, [apiKey]);

  const handlePracticeSaved = (updated) => {
    setSettings(prev => ({ ...prev, practice: updated }));
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "40px 0", color: "var(--text-muted)", fontSize: 13 }}>
        <div style={{ width: 16, height: 16, border: "2px solid var(--border)", borderTopColor: "var(--teal)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        Loading settings…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 500, paddingTop: 40 }}>
        <ErrorBanner message={error} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, maxWidth: 900 }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
          Settings
        </div>
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>
          Manage your practice profile and configuration.
        </div>
      </div>

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
      {activeTab === "profile" && (
        <PracticeProfileTab
          settings={settings}
          onSaved={handlePracticeSaved}
          client={client}
          onUnauth={handleUnauth}
        />
      )}
      {activeTab === "practitioners" && (
        <PractitionersTab
          settings={settings}
          onSettingsUpdate={setSettings}
          client={client}
          onUnauth={handleUnauth}
        />
      )}
      {activeTab === "analysis" && (
        <AnalysisSettingsTab
          settings={settings}
          onSaved={handlePracticeSaved}
          client={client}
          onUnauth={handleUnauth}
        />
      )}

    </div>
  );
}
