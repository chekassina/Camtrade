import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: (data) => {
      if (data.success && data.token) {
        localStorage.setItem("admin_token", data.token);
        toast.success("Login successful!");
        navigate("/admin");
      } else {
        setError(data.error || "Login failed");
      }
    },
    onError: (err) => {
      setError(err.message || "Invalid credentials");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-4"
      >
        <div className="bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-8 md:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#D4A843] rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <h1 className="text-xl font-bold">
              CAMER<span className="text-[#D4A843]">TRADE</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Admin Dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full h-11 pl-10 pr-10 border border-gray-200 rounded-lg text-sm focus:border-[#D4A843] focus:outline-none focus:ring-1 focus:ring-[#D4A843]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full btn-primary !h-11 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loginMutation.isPending ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Default credentials: <span className="font-medium">khassy</span> / <span className="font-medium">khassy</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
