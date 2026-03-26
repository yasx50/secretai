import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { SignOutButton, SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import "./Chats.css";

const categories = [
  { id: "general",       label: "General",     short: "GEN" },
  { id: "education",     label: "Education",   short: "EDU" },
  { id: "mail_messages", label: "Mail",         short: "MAIL" },
  { id: "single_words",  label: "Single Word",  short: "WORD" },
  { id: "secret",        label: "Secret",       short: "SEC" },
];

/* ─── SVG Icons ─────────────────────────────────────────────────────────── */
const LockIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="1"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const ChatIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const KeyIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="7.5" cy="15.5" r="4.5"/>
    <path d="m21 2-9.6 9.6M15.5 7.5l3 3"/>
  </svg>
);

/* ─── Component ─────────────────────────────────────────────────────────── */
const Chats = ({ apiUrl }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [user, setUser] = useState(null);
  const [activeCategory, setActiveCategory] = useState("general");
  const [secretPin, setSecretPin] = useState("");
  const [message, setMessage] = useState("");
  const [chatMap, setChatMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const [hasPin, setHasPin] = useState(false);
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [showChangePinModal, setShowChangePinModal] = useState(false);
  const [newPinInput, setNewPinInput] = useState("");
  const [oldPinInput, setOldPinInput] = useState("");

  const activeMessages = useMemo(() => chatMap[activeCategory] || [], [chatMap, activeCategory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages, loading]);

  const loadChats = useCallback(async (userId, pin) => {
    const token = await getToken();
    const query = new URLSearchParams({ userid: userId, includeSecret: "true", secretPin: pin || "" });
    const response = await fetch(`${apiUrl}/api/chats?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to load chats.");
    const nextMap = {};
    for (const c of data.chats) nextMap[c.category] = c.messages || [];
    setChatMap(nextMap);
  }, [apiUrl, getToken]);

  const checkPinStatus = useCallback(async () => {
    if (!user) return;
    try {
      const token = await getToken();
      const response = await fetch(`${apiUrl}/api/user/pin/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userid: user.id }),
      });
      const data = await response.json();
      setHasPin(data.hasPin || false);
    } catch (err) {
      console.error(err);
    }
  }, [apiUrl, getToken, user]);

  useEffect(() => {
    if (user) checkPinStatus();
  }, [user, checkPinStatus]);

  const handleSetPin = async () => {
    if (!newPinInput) return;
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const res = await fetch(`${apiUrl}/api/user/pin/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userid: user.id, newPin: newPinInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHasPin(true);
      setShowSetPinModal(false);
      setNewPinInput("");
      setSecretPin(newPinInput);
      setIsPinVerified(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePin = async () => {
    if (!oldPinInput || !newPinInput) return;
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const res = await fetch(`${apiUrl}/api/user/pin/change`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userid: user.id, oldPin: oldPinInput, newPin: newPinInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowChangePinModal(false);
      setOldPinInput("");
      setNewPinInput("");
      setSecretPin(newPinInput);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const unlockSecretChat = async () => {
    if (!user || !secretPin) return;
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const res = await fetch(`${apiUrl}/api/user/pin/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userid: user.id, secretPin }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setIsPinVerified(true);
        await loadChats(user.id, secretPin);
      } else {
        setError("Invalid Vault PIN.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !clerkUser) return;
      setError("");
      try {
        const token = await getToken();
        const displayName =
          [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
          clerkUser.username ||
          "User";
        const response = await fetch(`${apiUrl}/api/auth/sync-clerk`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: displayName }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to sync user.");
        setUser(data.user);
        await loadChats(data.user.id, "");
      } catch (err) {
        setError(err.message);
      }
    };
    syncUser();
  }, [apiUrl, getToken, isLoaded, clerkUser, loadChats]);

  const sendMessage = async () => {
    if (!message.trim() || !user) return;
    setLoading(true);
    setError("");
    try {
      const token = await getToken();
      const response = await fetch(`${apiUrl}/api/chats/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          userid: user.id,
          category: activeCategory,
          message,
          secretPin: activeCategory === "secret" ? secretPin : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not send message.");
      setChatMap((prev) => ({ ...prev, [activeCategory]: data.messages || [] }));
      setMessage("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeCat = categories.find((c) => c.id === activeCategory);

  return (
    <>
      {/* bg decorations – pointer-events:none in CSS so they never block clicks */}
      <div className="bg-layer" />
      <div className="bg-lines" />

      <div className="shell">

        {/* ── Signed out ── */}
        <SignedOut>
          <div className="gate-card">
            <div className="gate-icon"><LockIcon /></div>
            <h2>Restricted Access</h2>
            <p>This area requires authentication.<br />Return to the portal to sign in.</p>
            <Link className="gate-link" to="/">← Return to Portal</Link>
          </div>
        </SignedOut>

        {/* ── Signed in ── */}
        <SignedIn>
          <div className="panel">

            {/* Top bar */}
            <div className="top-bar">
              <div className="top-bar-left">
                <div className="top-bar-title">
                  <span className="status-dot" />
                  {user?.name || "Loading…"}
                </div>
                <span className="top-bar-sub mono">
                  Secure Session &mdash; {activeCat?.label}
                </span>
              </div>
              <div className="top-bar-right">
                <Link className="btn btn-ghost" to="/" style={{ fontSize: "0.75rem", padding: "7px 14px" }}>
                  Portal
                </Link>
                <SignOutButton>
                  <button className="btn btn-ghost" style={{ fontSize: "0.75rem", padding: "7px 14px" }}>
                    End Session
                  </button>
                </SignOutButton>
              </div>
            </div>

            {/* Category tabs */}
            <div className="tabs">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`tab${activeCategory === c.id ? " active" : ""}`}
                  onClick={() => setActiveCategory(c.id)}
                >
                  {c.short}
                </button>
              ))}
            </div>

            {/* Secret: no PIN set yet */}
            {activeCategory === "secret" && !hasPin && (
              <div className="secret-bar">
                <span className="secret-label"><KeyIcon /> Set Vault PIN</span>
                <span className="welcome-text" style={{ flex: 1, color: "var(--accent)" }}>
                  Create a PIN to unlock your secret vault.
                </span>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ fontSize: "0.72rem", padding: "7px 16px" }}
                  onClick={() => setShowSetPinModal(true)}
                >
                  Set PIN
                </button>
              </div>
            )}

            {/* Secret: PIN exists, not verified */}
            {activeCategory === "secret" && hasPin && !isPinVerified && (
              <div className="secret-bar">
                <span className="secret-label"><KeyIcon /> Vault PIN</span>
                <input
                  value={secretPin}
                  onChange={(e) => setSecretPin(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && unlockSecretChat()}
                  placeholder="Enter PIN to unlock vault"
                  type="password"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ fontSize: "0.72rem", padding: "7px 16px" }}
                  onClick={unlockSecretChat}
                  disabled={loading}
                >
                  {loading ? <span className="spinner" /> : "Unlock"}
                </button>
              </div>
            )}

            {/* Secret: unlocked */}
            {activeCategory === "secret" && hasPin && isPinVerified && (
              <div className="secret-bar" style={{ background: "rgba(201,169,110,0.06)" }}>
                <span className="secret-label" style={{ color: "var(--gold)" }}>
                  <LockIcon /> Vault Unlocked
                </span>
                <span style={{ flex: 1 }} />
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ fontSize: "0.72rem", padding: "7px 16px" }}
                  onClick={() => setShowChangePinModal(true)}
                >
                  Change PIN
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ fontSize: "0.72rem", padding: "7px 16px" }}
                  onClick={() => { setIsPinVerified(false); setSecretPin(""); setActiveCategory("general"); }}
                >
                  Lock Vault
                </button>
              </div>
            )}

            {/* Welcome / no-restriction banner */}
            <div className="welcome-banner">
              <span className="welcome-rule" />
              <p className="welcome-text">
                <strong>Ask anything, without restriction.</strong>{" "}
                This is your private space — no topic is off the table. Your conversations are yours alone, seen by no one else.
              </p>
            </div>

            {/* Chat messages */}
            <div className="chatbox">
              {((activeCategory !== "secret") || (activeCategory === "secret" && isPinVerified)) && (
                <>
                  {activeMessages.length === 0 && !loading && (
                    <div className="empty-state">
                      <div className="empty-emblem"><ChatIcon /></div>
                      <p className="empty-title">Nothing here yet.</p>
                      <p className="empty-sub">
                        Begin your private conversation.<br />
                        Search, ask, confess, explore — no judgment, no limits.
                      </p>
                    </div>
                  )}

                  {activeMessages.map((m, idx) => (
                    <div key={idx} className={`msg-row ${m.role === "user" ? "user" : "ai"}`}>
                      <div className={`bubble ${m.role === "user" ? "user" : "ai"}`}>
                        <span className="bubble-label">{m.role === "user" ? "You" : "Assistant"}</span>
                        {m.content}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="msg-row ai">
                      <div className="bubble ai">
                        <span className="bubble-label">Assistant</span>
                        <div className="typing">
                          <div className="dot" /><div className="dot" /><div className="dot" />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Error */}
            {error && <div className="error-bar">— {error}</div>}

            {/* Input */}
            <div className="input-bar">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey ? (e.preventDefault(), sendMessage()) : null
                }
                placeholder={`Type anything — ${activeCat?.label} · private & unrestricted`}
                disabled={activeCategory === "secret" && !isPinVerified}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={sendMessage}
                disabled={loading || !message.trim() || (activeCategory === "secret" && !isPinVerified)}
              >
                {loading ? <span className="spinner" /> : "Send"}
              </button>
            </div>

          </div>
        </SignedIn>

        {/* ── Set PIN Modal ── */}
        {showSetPinModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Set Vault PIN</h3>
              <p className="modal-desc">
                Choose a PIN to secure your secret vault. Keep it safe — you will need it every time you access this space.
              </p>
              <input
                type="password"
                placeholder="Enter new PIN"
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSetPin()}
              />
              <div className="modal-actions">
                <button
                  className="btn btn-ghost"
                  onClick={() => { setShowSetPinModal(false); setNewPinInput(""); }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSetPin}
                  disabled={loading || !newPinInput}
                >
                  {loading ? <span className="spinner" /> : "Save PIN"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Change PIN Modal ── */}
        {showChangePinModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">Change Vault PIN</h3>
              <p className="modal-desc">
                Confirm your current PIN, then set a new one to update vault access.
              </p>
              <input
                type="password"
                placeholder="Current PIN"
                value={oldPinInput}
                onChange={(e) => setOldPinInput(e.target.value)}
              />
              <input
                type="password"
                placeholder="New PIN"
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChangePin()}
              />
              <div className="modal-actions">
                <button
                  className="btn btn-ghost"
                  onClick={() => { setShowChangePinModal(false); setOldPinInput(""); setNewPinInput(""); }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleChangePin}
                  disabled={loading || !oldPinInput || !newPinInput}
                >
                  {loading ? <span className="spinner" /> : "Update PIN"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default Chats;