import { useCallback, useEffect, useMemo, useState } from "react";
import { SignOutButton, SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const categories = [
  { id: "general", label: "General" },
  { id: "education", label: "Education" },
  { id: "mail_messages", label: "Mail" },
  { id: "single_words", label: "Single Word" },
  { id: "secret", label: "Secret" }
];

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

  const activeMessages = useMemo(() => chatMap[activeCategory] || [], [chatMap, activeCategory]);

  const loadChats = useCallback(async (userId, pin) => {
    const token = await getToken();
    const query = new URLSearchParams({
      userid: userId,
      includeSecret: "true",
      secretPin: pin || ""
    });
    const response = await fetch(`${apiUrl}/api/chats?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to load chats.");
    const nextMap = {};
    for (const c of data.chats) nextMap[c.category] = c.messages || [];
    setChatMap(nextMap);
  }, [apiUrl, getToken]);

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !clerkUser) return;
      setError("");
      try {
        const token = await getToken();
        const displayName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || "User";
        const response = await fetch(`${apiUrl}/api/auth/sync-clerk`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ name: displayName })
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userid: user.id,
          category: activeCategory,
          message,
          secretPin: activeCategory === "secret" ? secretPin : undefined
        })
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

  return (
    <main className="app-shell">
      <SignedOut>
        <section className="card">
          <h2>Please sign in first</h2>
          <Link className="link-btn" to="/">Go to Home</Link>
        </section>
      </SignedOut>

      <SignedIn>
        <section className="card wide">
          <header className="header">
            <div>
              <h2>Chats - {user?.name || "User"}</h2>
              <p className="sub">Social login active with Clerk</p>
            </div>
            <div className="row">
              <Link className="link-btn" to="/">Home</Link>
              <SignOutButton>
                <button className="ghost">Logout</button>
              </SignOutButton>
            </div>
          </header>

          <div className="tabs">
            {categories.map((c) => (
              <button key={c.id} className={activeCategory === c.id ? "tab active" : "tab"} onClick={() => setActiveCategory(c.id)}>
                {c.label}
              </button>
            ))}
          </div>

          {activeCategory === "secret" ? (
            <div className="secret">
              <input
                value={secretPin}
                onChange={(e) => setSecretPin(e.target.value)}
                placeholder="Secret PIN (first use sets it)"
                type="password"
              />
              <button className="ghost" onClick={() => user && loadChats(user.id, secretPin)}>Unlock secret history</button>
            </div>
          ) : null}

          <div className="chatbox">
            {activeMessages.length === 0 ? <p className="sub">No messages yet.</p> : null}
            {activeMessages.map((m, idx) => (
              <p key={idx} className={m.role === "user" ? "msg user" : "msg ai"}>
                <strong>{m.role === "user" ? "You" : "AI"}:</strong> {m.content}
              </p>
            ))}
          </div>

          <div className="row">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey ? (e.preventDefault(), sendMessage()) : null}
              placeholder={`Message ${activeCategory}`}
            />
            <button onClick={sendMessage} disabled={loading}>{loading ? "Sending..." : "Send"}</button>
          </div>
          {error ? <p className="error">{error}</p> : null}
        </section>
      </SignedIn>
    </main>
  );
};

export default Chats;
