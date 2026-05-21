import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth, apiClient } from "../lib/auth";

// ── MessagesPage ────────────────────────────────────────────────
//
// Three-pane unified inbox: contact list (left), thread (center), context panel (right).
// Mirrors the Ageless layout but unifies leads + patients in one inbox, and the right
// panel swaps content based on contact_type ("lead" → funnel info, "patient" → clinical).
//
// Drop this file into: src/components/MessagesPage.jsx
// Wire it in Dashboard.jsx by adding:
//   import MessagesPage from "./components/MessagesPage";
//   ...
//   <NavItem icon={<MessagesIcon />} label="Messages" active={screen === "messages"}
//            onClick={() => { setScreen("messages"); ... }} badge={...} />
//   ...
//   {screen === "messages" && <MessagesPage onUnauth={() => { logout(); onUnauth(); }} />}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "leads", label: "Leads" },
  { id: "patients", label: "Patients" },
  { id: "unread", label: "Unread" },
  { id: "starred", label: "Starred" },
];

const LEAD_STAGES = [
  { value: "nurturing", label: "Nurturing" },
  { value: "consult_requested", label: "Consult Requested" },
  { value: "consult_booked", label: "Consult Booked" },
  { value: "converted", label: "Converted" },
];
const PATIENT_STAGES = [
  { value: "active", label: "Active" },
  { value: "follow_up", label: "Follow-up" },
  { value: "retention", label: "Retention" },
  { value: "dormant", label: "Dormant" },
];

export default function MessagesPage({ onUnauth }) {
  const { apiKey } = useAuth();
  const client = apiClient(apiKey);

  const [conversations, setConversations] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState(null);

  // Fetch conversation list
  const loadConversations = useCallback(async () => {
    setLoadingList(true);
    try {
      const params = new URLSearchParams({ filter });
      if (search) params.set("search", search);
      const data = await client.get(`/api/dashboard/messages/conversations?${params}`);
      setConversations(data || []);
      setError(null);
    } catch (e) {
      if (e.message === "UNAUTHORIZED") onUnauth();
      else setError("Failed to load conversations");
    }
    setLoadingList(false);
  }, [filter, search, apiKey]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Poll for new messages every 8s while open (cheap real-time substitute)
  useEffect(() => {
    const id = setInterval(loadConversations, 8000);
    return () => clearInterval(id);
  }, [loadConversations]);

  // Fetch one conversation's detail
  const loadDetail = useCallback(async (conversationId) => {
    if (!conversationId) return;
    setLoadingDetail(true);
    try {
      const data = await client.get(`/api/dashboard/messages/conversations/${conversationId}`);
      setDetail(data);
      // Mark read on the server, then update list locally
      if (data.unread_count > 0) {
        client.post(`/api/dashboard/messages/conversations/${conversationId}/read`, {});
        setConversations(prev => prev.map(c =>
          c.id === conversationId ? { ...c, unread_count: 0 } : c
        ));
      }
    } catch (e) {
      if (e.message === "UNAUTHORIZED") onUnauth();
      else setError("Failed to load conversation");
    }
    setLoadingDetail(false);
  }, [apiKey]);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId);
    else setDetail(null);
  }, [selectedId, loadDetail]);

  const handleSent = (newMessage) => {
    setDetail(prev => prev ? {
      ...prev,
      messages: [...prev.messages, newMessage],
    } : prev);
    // Update list preview
    setConversations(prev => prev.map(c =>
      c.id === selectedId
        ? { ...c, last_message_preview: newMessage.body, last_message_at: newMessage.created_at, last_message_direction: "outbound" }
        : c
    ));
  };

  const handleContactUpdated = (updatedContact) => {
    setDetail(prev => prev ? { ...prev, contact: updatedContact } : prev);
    setConversations(prev => prev.map(c =>
      c.id === selectedId ? { ...c, contact: updatedContact } : c
    ));
  };

  return (
    <div style={{
      // Override Dashboard's main padding by negating it — messages needs full bleed
      margin: "-28px -28px -40px",
      height: "calc(100vh - 56px)",
      display: "grid",
      gridTemplateColumns: "320px 1fr 320px",
      background: "var(--bg)",
      overflow: "hidden",
    }}>
      {/* ── LEFT: Conversation list ── */}
      <aside style={{
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        <div style={{ padding: "18px 18px 12px", borderBottom: "1px solid var(--border)" }}>
          <div style={{
            fontSize: 17, fontWeight: 700, color: "var(--text-primary)",
            fontFamily: "var(--font-display)", marginBottom: 12,
          }}>Messages</div>
          <SearchInput value={search} onChange={setSearch} />
          <FilterTabs value={filter} onChange={setFilter} />
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {loadingList && conversations.length === 0 ? (
            <EmptyState text="Loading conversations…" />
          ) : conversations.length === 0 ? (
            <EmptyState text={search ? "No matches." : "No conversations yet."} />
          ) : (
            conversations.map(c => (
              <ConversationRow
                key={c.id}
                conversation={c}
                active={selectedId === c.id}
                onClick={() => setSelectedId(c.id)}
              />
            ))
          )}
        </div>
      </aside>

      {/* ── CENTER: Conversation thread ── */}
      <section style={{
        display: "flex", flexDirection: "column",
        background: "var(--bg)",
        overflow: "hidden",
      }}>
        {!selectedId ? (
          <EmptyThread />
        ) : loadingDetail && !detail ? (
          <EmptyState text="Loading…" />
        ) : detail ? (
          <ConversationThread
            detail={detail}
            client={client}
            onSent={handleSent}
            onUnauth={onUnauth}
          />
        ) : null}
      </section>

      {/* ── RIGHT: Context panel ── */}
      <aside style={{
        background: "var(--surface)",
        borderLeft: "1px solid var(--border)",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}>
        {detail ? (
          <ContextPanel
            contact={detail.contact}
            client={client}
            onContactUpdated={handleContactUpdated}
            onUnauth={onUnauth}
          />
        ) : (
          <div style={{ padding: 18, fontSize: 12, color: "var(--text-muted)" }}>
            Select a conversation to see contact details.
          </div>
        )}
      </aside>

      {error && (
        <div style={{
          position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
          background: "var(--red-subtle)", border: "1px solid var(--red)",
          borderRadius: 7, padding: "8px 16px", fontSize: 12, color: "var(--red)",
        }}>{error}</div>
      )}
    </div>
  );
}

// ── Search input ─────────────────────────────────────────────────

function SearchInput({ value, onChange }) {
  return (
    <div style={{ position: "relative", marginBottom: 10 }}>
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="var(--text-muted)" strokeWidth="1.5"
           style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
        <circle cx="6" cy="6" r="4"/><path d="M12 12l-2.5-2.5" strokeLinecap="round"/>
      </svg>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search by name, phone, email…"
        style={{
          width: "100%", padding: "7px 10px 7px 30px",
          background: "var(--bg)", border: "1px solid var(--border)",
          borderRadius: 7, fontSize: 12.5, color: "var(--text-primary)",
          outline: "none", fontFamily: "var(--font-body)",
        }}
      />
    </div>
  );
}

function FilterTabs({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {FILTERS.map(f => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          style={{
            padding: "4px 10px", borderRadius: 14, fontSize: 11.5,
            fontWeight: value === f.id ? 600 : 500,
            border: "1px solid " + (value === f.id ? "var(--teal)" : "var(--border)"),
            background: value === f.id ? "var(--teal-subtle)" : "transparent",
            color: value === f.id ? "var(--teal)" : "var(--text-secondary)",
            cursor: "pointer", fontFamily: "var(--font-body)",
            transition: "all 0.12s",
          }}
        >{f.label}</button>
      ))}
    </div>
  );
}

// ── Conversation row ────────────────────────────────────────────

function ConversationRow({ conversation, active, onClick }) {
  const c = conversation;
  const name = `${c.contact.first_name || ""} ${c.contact.last_name || ""}`.trim() || "Unknown";
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const isUnread = c.unread_count > 0;

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", display: "flex", gap: 11,
        padding: "12px 16px",
        border: "none",
        borderBottom: "1px solid var(--border)",
        background: active ? "var(--teal-subtle)" : "transparent",
        cursor: "pointer", textAlign: "left",
        fontFamily: "var(--font-body)",
        transition: "background 0.12s",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
        background: c.contact.contact_type === "patient" ? "var(--teal-subtle)" : "var(--bg)",
        border: "1px solid " + (c.contact.contact_type === "patient" ? "var(--teal)" : "var(--border)"),
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 700,
        color: c.contact.contact_type === "patient" ? "var(--teal)" : "var(--text-secondary)",
      }}>{initials}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 2 }}>
          <div style={{
            fontSize: 13, fontWeight: isUnread ? 700 : 600,
            color: "var(--text-primary)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            flex: 1,
          }}>{name}</div>
          <div style={{ fontSize: 10.5, color: "var(--text-muted)", flexShrink: 0 }}>
            {formatRelative(c.last_message_at)}
          </div>
        </div>
        <div style={{
          fontSize: 12, color: isUnread ? "var(--text-primary)" : "var(--text-muted)",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          fontWeight: isUnread ? 500 : 400,
          marginBottom: 5,
        }}>
          {c.last_message_direction === "outbound" && (
            <span style={{ color: "var(--text-muted)", marginRight: 4 }}>You:</span>
          )}
          {c.last_message_preview || "(no messages)"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <StageBadge stage={c.contact.stage} contactType={c.contact.contact_type} />
          {isUnread && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: "white",
              background: "var(--teal)", padding: "1px 6px", borderRadius: 10,
              minWidth: 16, textAlign: "center",
            }}>{c.unread_count}</span>
          )}
        </div>
      </div>
    </button>
  );
}

function StageBadge({ stage, contactType }) {
  const label = stage.replace(/_/g, " ");
  const isPatient = contactType === "patient";
  return (
    <span style={{
      fontSize: 10, fontWeight: 600,
      padding: "2px 7px", borderRadius: 4,
      background: isPatient ? "var(--teal-subtle)" : "var(--bg)",
      color: isPatient ? "var(--teal)" : "var(--text-secondary)",
      border: "1px solid " + (isPatient ? "var(--teal)" : "var(--border)"),
      textTransform: "capitalize", letterSpacing: "0.01em",
    }}>{label}</span>
  );
}

// ── Conversation thread ─────────────────────────────────────────

function ConversationThread({ detail, client, onSent, onUnauth }) {
  const [channel, setChannel] = useState(detail.primary_channel || "sms");
  const [body, setBody] = useState("");
  const [subject, setSubject] = useState("");
  const [sending, setSending] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiFlags, setAiFlags] = useState([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    setChannel(detail.primary_channel || "sms");
    setBody(""); setSubject("");
    setAiSuggestions([]); setAiFlags([]);
  }, [detail.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [detail.messages.length]);

  const name = `${detail.contact.first_name || ""} ${detail.contact.last_name || ""}`.trim() || "Unknown";

  const handleSend = async () => {
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      const msg = await client.post(
        `/api/dashboard/messages/conversations/${detail.id}/messages`,
        { body, channel, subject: channel === "email" ? subject : undefined }
      );
      onSent(msg);
      setBody(""); setSubject("");
      setAiSuggestions([]);
    } catch (e) {
      if (e.message === "UNAUTHORIZED") onUnauth();
      else alert("Failed to send. " + e.message);
    }
    setSending(false);
  };

  const handleAiSuggest = async () => {
    setLoadingAi(true);
    try {
      const data = await client.post(`/api/dashboard/messages/ai/suggest`, {
        conversation_id: detail.id,
      });
      setAiSuggestions(data.suggestions || []);
      setAiFlags(data.flags || []);
    } catch (e) {
      if (e.message === "UNAUTHORIZED") onUnauth();
    }
    setLoadingAi(false);
  };

  return (
    <>
      {/* Thread header */}
      <div style={{
        padding: "14px 24px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        display: "flex", alignItems: "center", gap: 12,
        flexShrink: 0,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>
            {name}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <StageBadge stage={detail.contact.stage} contactType={detail.contact.contact_type} />
            {detail.contact.phone && <span>· {detail.contact.phone}</span>}
            {detail.contact.email && <span>· {detail.contact.email}</span>}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
        {detail.messages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: 13 }}>
            No messages yet. Send the first one below.
          </div>
        ) : (
          detail.messages.map((m, i) => (
            <MessageBubble key={m.id} message={m} prev={detail.messages[i - 1]} />
          ))
        )}
      </div>

      {/* AI suggestions strip */}
      {aiSuggestions.length > 0 && (
        <div style={{
          padding: "10px 24px", background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          flexShrink: 0,
        }}>
          {aiFlags.length > 0 && (
            <div style={{
              background: "var(--red-subtle)", border: "1px solid var(--red)",
              borderRadius: 6, padding: "6px 10px", fontSize: 11.5, color: "var(--red)",
              marginBottom: 8, display: "flex", alignItems: "center", gap: 6,
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M6 1L1 11h10L6 1z"/><path d="M6 5v2M6 9v.5"/>
              </svg>
              <strong>Clinical flag:</strong> {aiFlags.join(" · ")}
            </div>
          )}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {aiSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => { setBody(s); setAiSuggestions([]); }}
                style={{
                  flex: "1 1 30%",
                  padding: "8px 12px", fontSize: 12,
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 7, cursor: "pointer",
                  textAlign: "left", color: "var(--text-primary)",
                  fontFamily: "var(--font-body)",
                  lineHeight: 1.4,
                }}
              >{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Composer */}
      <div style={{
        borderTop: "1px solid var(--border)",
        background: "var(--surface)",
        flexShrink: 0,
      }}>
        {/* Channel tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
          <ChannelTab label="Text" active={channel === "sms"} onClick={() => setChannel("sms")}
            disabled={!detail.contact.sms_consent}
            disabledHint="No SMS consent" />
          <ChannelTab label="Email" active={channel === "email"} onClick={() => setChannel("email")}
            disabled={!detail.contact.email_consent}
            disabledHint="No email consent" />
        </div>

        {channel === "email" && (
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Subject"
            style={{
              width: "100%", padding: "10px 24px",
              border: "none", borderBottom: "1px solid var(--border)",
              fontSize: 13, fontFamily: "var(--font-body)",
              background: "transparent", color: "var(--text-primary)",
              outline: "none",
            }}
          />
        )}

        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder={`Type your ${channel === "sms" ? "message" : "email"}…`}
          rows={3}
          style={{
            width: "100%", padding: "12px 24px",
            border: "none", outline: "none", resize: "none",
            fontSize: 13, fontFamily: "var(--font-body)",
            background: "transparent", color: "var(--text-primary)",
            lineHeight: 1.5,
          }}
        />

        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 24px 14px",
        }}>
          <ComposerButton
            label="Templates"
            icon={<TemplateIcon />}
            onClick={() => setShowTemplates(s => !s)}
          />
          <ComposerButton
            label={loadingAi ? "Thinking…" : "AI Suggest"}
            icon={<SparkleIcon />}
            onClick={handleAiSuggest}
            disabled={loadingAi}
            accent
          />
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {channel === "sms" && body.length > 0 && `${body.length} chars`}
          </div>
          <button
            onClick={handleSend}
            disabled={!body.trim() || sending}
            style={{
              padding: "8px 20px", borderRadius: 7,
              border: "none", background: "var(--teal)", color: "white",
              fontSize: 13, fontWeight: 600,
              cursor: (!body.trim() || sending) ? "not-allowed" : "pointer",
              opacity: (!body.trim() || sending) ? 0.5 : 1,
              fontFamily: "var(--font-body)",
            }}
          >{sending ? "Sending…" : "Send"}</button>
        </div>

        {showTemplates && (
          <TemplatePicker
            client={client}
            contact={detail.contact}
            channel={channel}
            onPick={(t) => {
              setBody(applyTemplateVars(t.body, detail.contact));
              if (t.subject) setSubject(applyTemplateVars(t.subject, detail.contact));
              setShowTemplates(false);
            }}
            onClose={() => setShowTemplates(false)}
          />
        )}
      </div>
    </>
  );
}

function MessageBubble({ message, prev }) {
  const isOut = message.direction === "outbound";
  const showTimestamp = !prev ||
    new Date(message.created_at) - new Date(prev.created_at) > 5 * 60 * 1000;

  return (
    <>
      {showTimestamp && (
        <div style={{
          textAlign: "center", fontSize: 10.5, color: "var(--text-muted)",
          margin: "16px 0 10px", letterSpacing: "0.02em",
        }}>{formatTimestamp(message.created_at)}</div>
      )}
      <div style={{
        display: "flex", justifyContent: isOut ? "flex-end" : "flex-start",
        marginBottom: 4,
      }}>
        <div style={{
          maxWidth: "70%",
          padding: "9px 14px", borderRadius: 14,
          background: isOut ? "var(--teal)" : "var(--surface)",
          color: isOut ? "white" : "var(--text-primary)",
          border: isOut ? "none" : "1px solid var(--border)",
          fontSize: 13, lineHeight: 1.45,
          wordBreak: "break-word",
        }}>
          {message.subject && (
            <div style={{
              fontWeight: 700, fontSize: 12, marginBottom: 4,
              paddingBottom: 4, borderBottom: "1px solid " + (isOut ? "rgba(255,255,255,0.2)" : "var(--border)"),
            }}>{message.subject}</div>
          )}
          {message.body}
          <div style={{
            fontSize: 10, marginTop: 4,
            color: isOut ? "rgba(255,255,255,0.7)" : "var(--text-muted)",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <span style={{
              padding: "1px 5px", borderRadius: 3, fontSize: 9, fontWeight: 600,
              background: isOut ? "rgba(255,255,255,0.18)" : "var(--bg)",
              textTransform: "uppercase", letterSpacing: "0.04em",
            }}>{message.channel}</span>
            {isOut && (
              <span>· {statusLabel(message.status)}{message.sent_by_ai && " · AI"}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ChannelTab({ label, active, onClick, disabled, disabledHint }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      title={disabled ? disabledHint : undefined}
      style={{
        flex: 1, padding: "10px 0",
        background: "transparent", border: "none",
        borderBottom: active ? "2px solid var(--teal)" : "2px solid transparent",
        marginBottom: -1,
        fontSize: 12.5, fontWeight: active ? 600 : 500,
        color: disabled ? "var(--text-muted)" : (active ? "var(--teal)" : "var(--text-secondary)"),
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "var(--font-body)",
        opacity: disabled ? 0.5 : 1,
      }}
    >{label}{disabled && " ✕"}</button>
  );
}

function ComposerButton({ label, icon, onClick, disabled, accent }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "5px 10px", borderRadius: 6,
        border: "1px solid " + (accent ? "var(--teal)" : "var(--border)"),
        background: accent ? "var(--teal-subtle)" : "transparent",
        color: accent ? "var(--teal)" : "var(--text-secondary)",
        fontSize: 11.5, fontWeight: 600,
        cursor: disabled ? "wait" : "pointer",
        display: "flex", alignItems: "center", gap: 5,
        fontFamily: "var(--font-body)",
      }}
    >{icon}{label}</button>
  );
}

// ── Template picker ─────────────────────────────────────────────

function TemplatePicker({ client, contact, channel, onPick, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const params = new URLSearchParams({
          category: contact.contact_type,
          stage: contact.stage,
        });
        const data = await client.get(`/api/dashboard/messages/templates?${params}`);
        const filtered = (data || []).filter(t => t.channel === channel || t.channel === "both");
        setTemplates(filtered);
      } catch (e) { /* fall through */ }
      setLoading(false);
    };
    load();
  }, [contact.id, channel]);

  return (
    <div style={{
      position: "absolute", bottom: 80, left: 24, right: 24,
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 8, padding: 8, maxHeight: 280, overflowY: "auto",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      zIndex: 10,
    }}>
      <div style={{
        fontSize: 10.5, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.08em", color: "var(--text-muted)",
        padding: "6px 10px 8px",
      }}>
        Templates · {contact.stage.replace(/_/g, " ")}
      </div>
      {loading ? (
        <div style={{ padding: 16, fontSize: 12, color: "var(--text-muted)" }}>Loading…</div>
      ) : templates.length === 0 ? (
        <div style={{ padding: 12, fontSize: 12, color: "var(--text-muted)" }}>
          No templates yet for this stage. Create them in Settings → Templates.
        </div>
      ) : templates.map(t => (
        <button
          key={t.id}
          onClick={() => onPick(t)}
          style={{
            width: "100%", padding: "8px 10px", borderRadius: 6,
            border: "none", background: "transparent",
            textAlign: "left", cursor: "pointer",
            fontFamily: "var(--font-body)",
            transition: "background 0.12s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{t.name}</div>
          <div style={{
            fontSize: 11.5, color: "var(--text-muted)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{t.body}</div>
        </button>
      ))}
    </div>
  );
}

function applyTemplateVars(text, contact) {
  return text
    .replace(/\{\{first_name\}\}/g, contact.first_name || "")
    .replace(/\{\{last_name\}\}/g, contact.last_name || "")
    .replace(/\{\{name\}\}/g, `${contact.first_name || ""} ${contact.last_name || ""}`.trim());
}

// ── Context panel (right side) ──────────────────────────────────

function ContextPanel({ contact, client, onContactUpdated, onUnauth }) {
  const [patientContext, setPatientContext] = useState(null);

  useEffect(() => {
    if (contact.contact_type === "patient" && contact.patient_id) {
      // Fetch the patient's most recent intake data using the existing dashboard endpoint
      client.get(`/api/dashboard/patients/${contact.patient_id}/progress`)
        .then(setPatientContext)
        .catch(() => setPatientContext(null));
    } else {
      setPatientContext(null);
    }
  }, [contact.id]);

  const updateStage = async (newStage) => {
    try {
      const updated = await client.patch(`/api/dashboard/messages/contacts/${contact.id}`, { stage: newStage });
      onContactUpdated(updated);
    } catch (e) {
      if (e.message === "UNAUTHORIZED") onUnauth();
    }
  };

  const isPatient = contact.contact_type === "patient";
  const stages = isPatient ? PATIENT_STAGES : LEAD_STAGES;

  return (
    <div style={{ overflowY: "auto", padding: "18px 18px 24px" }}>
      <div style={{
        fontSize: 10.5, fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 8,
      }}>{isPatient ? "Patient" : "Lead"}</div>

      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", marginBottom: 14 }}>
        {`${contact.first_name || ""} ${contact.last_name || ""}`.trim() || "Unknown"}
      </div>

      <InfoRow label="Phone" value={contact.phone || "—"} />
      <InfoRow label="Email" value={contact.email || "—"} />
      <InfoRow label="Source" value={contact.source || "—"} />
      <InfoRow label="Created" value={formatTimestamp(contact.created_at)} />

      <SectionLabel>Stage</SectionLabel>
      <select
        value={contact.stage}
        onChange={e => updateStage(e.target.value)}
        style={{
          width: "100%", padding: "7px 10px", borderRadius: 6,
          border: "1px solid var(--border)", background: "var(--bg)",
          fontSize: 12.5, color: "var(--text-primary)",
          fontFamily: "var(--font-body)", outline: "none",
          marginBottom: 14,
        }}
      >
        {stages.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>

      <SectionLabel>Consent</SectionLabel>
      <ConsentRow label="SMS" granted={contact.sms_consent} />
      <ConsentRow label="Email" granted={contact.email_consent} />

      {isPatient && patientContext && (
        <>
          <SectionLabel>Clinical Context</SectionLabel>
          <ClinicalContext data={patientContext} />
        </>
      )}

      {!isPatient && (
        <>
          <SectionLabel>Funnel</SectionLabel>
          <div style={{
            background: "var(--bg)", border: "1px solid var(--border)",
            borderRadius: 7, padding: "10px 12px", fontSize: 12,
            color: "var(--text-secondary)", lineHeight: 1.55,
          }}>
            {leadStageDescription(contact.stage)}
          </div>
        </>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", padding: "5px 0", fontSize: 12 }}>
      <div style={{ width: 70, color: "var(--text-muted)" }}>{label}</div>
      <div style={{ flex: 1, color: "var(--text-primary)", wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.09em", color: "var(--text-muted)",
      marginTop: 18, marginBottom: 6,
    }}>{children}</div>
  );
}

function ConsentRow({ label, granted }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "4px 0", fontSize: 12 }}>
      <div style={{ flex: 1, color: "var(--text-secondary)" }}>{label}</div>
      <span style={{
        fontSize: 10.5, fontWeight: 600,
        padding: "2px 8px", borderRadius: 4,
        color: granted ? "var(--green)" : "var(--text-muted)",
        background: granted ? "rgba(34, 139, 89, 0.08)" : "var(--bg)",
        border: "1px solid " + (granted ? "var(--green)" : "var(--border)"),
      }}>{granted ? "Granted" : "Not granted"}</span>
    </div>
  );
}

function ClinicalContext({ data }) {
  const allergies = data?.allergies_lifestyle?.known_allergies || {};
  const activeAllergies = Object.entries(allergies).filter(([_, v]) => v).map(([k]) => k.replace(/_/g, " "));
  const meds = data?.medical_history?.medication_flags || {};
  const activeMeds = Object.entries(meds).filter(([_, v]) => v).map(([k]) => k.replace(/_/g, " "));
  const treatments = data?.skin_profile?.previous_treatments || [];

  return (
    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
      <InfoRow label="Skin type" value={data?.skin_profile?.skin_type || "—"} />
      {activeAllergies.length > 0 && (
        <div style={{
          marginTop: 6, padding: "6px 10px",
          background: "var(--red-subtle)", border: "1px solid var(--red)",
          borderRadius: 6, color: "var(--red)", fontSize: 11.5,
        }}>
          <strong>Allergies:</strong> {activeAllergies.join(", ")}
        </div>
      )}
      {activeMeds.length > 0 && (
        <div style={{
          marginTop: 6, padding: "6px 10px",
          background: "var(--bg)", border: "1px solid var(--border)",
          borderRadius: 6, fontSize: 11.5,
        }}>
          <strong>Medications:</strong> {activeMeds.join(", ")}
        </div>
      )}
      {treatments.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Previous treatments</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {treatments.map(t => (
              <span key={t} style={{
                fontSize: 10.5, padding: "2px 7px", borderRadius: 10,
                background: "var(--teal-subtle)", color: "var(--teal)",
                textTransform: "capitalize",
              }}>{t.replace(/_/g, " ")}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function leadStageDescription(stage) {
  return {
    nurturing: "Building rapport. Send welcome offer and educational content.",
    consult_requested: "They've shown interest. Confirm consultation booking.",
    consult_booked: "Consult is on the calendar. Send pre-consult prep.",
    converted: "Converted to patient. Move to clinical workflow.",
  }[stage] || "—";
}

// ── Empty states ────────────────────────────────────────────────

function EmptyThread() {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      color: "var(--text-muted)", padding: 24,
    }}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ opacity: 0.4, marginBottom: 14 }}>
        <path d="M8 14a4 4 0 014-4h24a4 4 0 014 4v20a4 4 0 01-4 4H18l-8 6V14z"/>
        <path d="M16 20h16M16 26h10" strokeLinecap="round"/>
      </svg>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Select a conversation</div>
      <div style={{ fontSize: 12 }}>Pick someone from the list to see their messages.</div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ padding: "32px 18px", color: "var(--text-muted)", fontSize: 12, textAlign: "center" }}>{text}</div>
  );
}

// ── Icons ───────────────────────────────────────────────────────

const TemplateIcon = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="1.5" y="1.5" width="8" height="8" rx="1.5"/>
    <path d="M3.5 4h4M3.5 6h3"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5.5 1l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3zM9 7l.5 1.5L11 9l-1.5.5L9 11l-.5-1.5L7 9l1.5-.5L9 7z"/>
  </svg>
);

// ── Utilities ───────────────────────────────────────────────────

function formatRelative(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "now";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTimestamp(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function statusLabel(s) {
  return ({ queued: "Queued", sending: "Sending", sent: "Sent",
    delivered: "Delivered", read: "Read", failed: "Failed", undelivered: "Undelivered" }[s] || s);
}
