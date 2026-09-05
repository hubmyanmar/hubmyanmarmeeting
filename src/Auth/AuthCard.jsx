import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AuthCard() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    position: '',
    email: '',
    password: '',
    rememberMe: false,
  });

  const [registeredUsers, setRegisteredUsers] = useState([
    { email: 'test@example.com', password: 'password123', fullName: 'Test User' }
  ]);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (isLogin) {
        const userFound = registeredUsers.find(
          (u) => u.email === formData.email && u.password === formData.password
        );

        if (!userFound) {
          throw new Error('Email သို့မဟုတ် Password မှားယွင်းနေပါသည်။');
        }

        // Login အောင်မြင်ပါက Dashboard သို့ သွားမည်
        navigate('/dashboard', { state: { user: userFound } });

      } else {
        const isEmailTaken = registeredUsers.some((u) => u.email === formData.email);

        if (isEmailTaken) {
          throw new Error('ဤ Email ဖြင့် အကောင့်ဖွင့်ထားပြီးဖြစ်ပါသည်။');
        }

        setRegisteredUsers((prev) => [...prev, { ...formData }]);
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (loginStatus) => {
    setIsLogin(loginStatus);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Tab Controls */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => handleTabChange(true)}
            className={`w-1/2 py-4 text-center font-semibold transition-all ${
              isLogin
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-indigo-600'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => handleTabChange(false)}
            className={`w-1/2 py-4 text-center font-semibold transition-all ${
              !isLogin
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-indigo-600'
            }`}
          >
            Register
          </button>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-slate-500 text-center mb-6">
            {isLogin
              ? 'Please enter your details to sign in.'
              : 'Fill in the form to get started.'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Position / Role</label>
                <select
                  name="position"
                  required
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
                >
                  <option value="" disabled>Select your position</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-10 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg shadow-md transition-all text-sm disabled:opacity-50"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}