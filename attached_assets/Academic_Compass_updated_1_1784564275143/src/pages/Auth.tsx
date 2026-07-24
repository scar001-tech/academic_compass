import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { School } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/store/auth";
import { DEPARTMENTS } from "@/lib/schoolData";

export default function Auth() {
  const [mode, setMode]       = useState<"signin" | "signup">("signin");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]       = useState("");
  const [department, setDepartment] = useState<string>("");
  const [busy, setBusy]       = useState(false);
  const nav = useNavigate();
  const { session, loading, signIn, signUp } = useAuth();

  useEffect(() => {
    if (!loading && session) nav("/", { replace: true });
  }, [session, loading, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup" && !department) {
      toast.error("Please select your department");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, name || undefined, department);
        toast.success("Account created. Await Principal approval to access the system.");
      } else {
        await signIn(email, password);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4">
      <Card className="w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-md bg-primary text-primary-foreground grid place-items-center">
            <School className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold">Academic Compass</div>
            <div className="text-xs text-muted-foreground">Sign in to your school account</div>
          </div>
        </div>

        {/* Email / password form */}
        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <>
              <Input
                placeholder="Full name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <div>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Helps the Principal review and approve your role faster.
                </p>
              </div>
            </>
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
          </Button>
        </form>

        <div className="mt-4 text-xs text-center text-muted-foreground">
          {mode === "signin" ? "No account?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="text-primary underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Create one" : "Sign in"}
          </button>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground text-center">
          The first account created becomes Principal (full access). Every other
          account needs Principal approval before it can access the system.
        </p>
      </Card>
    </div>
  );
}
