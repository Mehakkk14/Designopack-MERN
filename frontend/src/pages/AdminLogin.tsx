import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  auth,
} from "@/lib/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/designopack-logo-black.webp";

type AuthError = {
  code?: string;
};

const getAuthErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (typeof error === "object" && error !== null && "code" in error) {
    const authError = error as AuthError;

    if (authError.code === "auth/user-not-found") {
      return "No account found with this email";
    }

    if (authError.code === "auth/wrong-password") {
      return "Incorrect password";
    }

    if (authError.code === "auth/too-many-requests") {
      return "Too many failed attempts. Please try again later";
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Clear history and navigate to admin
        window.history.replaceState(null, "", "/admin");
        navigate("/admin", { replace: true });
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Prevent going back to admin pages if user is not authenticated
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // If user tries to go back to admin pages without authentication
      if (window.location.pathname.startsWith("/admin") && !auth.currentUser) {
        window.history.replaceState(null, "", "/");
        navigate("/", { replace: true });
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Welcome Back! ✨",
        description: "Logging you into the admin dashboard...",
      });
      // Clear history and navigate to admin
      window.history.replaceState(null, "", "/admin");
      navigate("/admin", { replace: true });
    } catch (error: unknown) {
      const errorMessage = getAuthErrorMessage(
        error,
        "Invalid email or password",
      );

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first",
        variant: "destructive",
      });
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      toast({
        title: "Reset Email Sent! 📧",
        description: "Check your email for password reset instructions",
      });
    } catch (error: unknown) {
      const errorMessage = getAuthErrorMessage(
        error,
        "Failed to send reset email",
      );

      toast({
        title: "Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white mx-auto mb-4"></div>
          <p className="text-white/70 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-gray-800 bg-white/95 backdrop-blur">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="flex justify-center mb-2">
            <div className="bg-gradient-to-br from-gray-900 to-gray-700 p-4 rounded-2xl shadow-xl">
              <img
                src={logo}
                alt="DesignOPack"
                className="h-16 w-auto filter brightness-0 invert"
              />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Admin Portal
          </CardTitle>
          <CardDescription className="text-base">
            Sign in to access the DesignOPack dashboard
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@designopack.com"
                  required
                  disabled={loading}
                  className="pl-10 h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="pl-10 pr-10 h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading || !email}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetLoading ? (
                  <div className="flex items-center gap-1">
                    <div className="animate-spin rounded-full h-3 w-3 border border-gray-400 border-t-transparent"></div>
                    <span>Sending...</span>
                  </div>
                ) : resetEmailSent ? (
                  "Reset email sent! Check your inbox"
                ) : (
                  "Forgot your password?"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Protected by JWT & Secure Admin Authentication
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
