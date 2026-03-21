import { SignedIn, SignedOut, SignOutButton, useSignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const { signIn, isLoaded } = useSignIn();

  const loginWithProvider = async (strategy) => {
    if (!isLoaded) return;
    await signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/chats"
    });
  };

  return (
    <main className="app-shell">
      <SignedOut>
        <section className="card">
          <h1>Secret AI Chat</h1>
          <p className="sub">Private chats with social login.</p>
          <div className="stack">
            <button onClick={() => loginWithProvider("oauth_google")}>Continue with Google</button>
            <button onClick={() => loginWithProvider("oauth_facebook")}>Continue with Facebook</button>
          </div>
        </section>
      </SignedOut>

      <SignedIn>
        <section className="card">
          <h1>Secret AI Chat</h1>
          <p className="sub">You are signed in.</p>
          <div className="row">
            <Link className="link-btn" to="/chats">Open Chats</Link>
            <SignOutButton>
              <button className="ghost">Logout</button>
            </SignOutButton>
          </div>
        </section>
      </SignedIn>
    </main>
  );
};

export default HomePage;
