import { supabase } from "@/services/supabase";
import { Session, User } from "@supabase/supabase-js";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  username: string | null;
  signIn: (username: string, password: string) => Promise<{ error?: string }>;
  signUp: (username: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function usernameToEmail(username: string): string {
  return `${username.toLowerCase().trim()}@jobhunting.local`;
}

function emailToUsername(email: string): string {
  return email.replace("@jobhunting.local", "");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (
    username: string,
    password: string
  ): Promise<{ error?: string }> => {
    const email = usernameToEmail(username);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
    return {};
  };

  const signUp = async (
    username: string,
    password: string
  ): Promise<{ error?: string }> => {
    const email = usernameToEmail(username);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username.trim() },
      },
    });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const username = user?.email ? emailToUsername(user.email) : null;

  return (
    <AuthContext.Provider
      value={{ user, session, isLoading, username, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
