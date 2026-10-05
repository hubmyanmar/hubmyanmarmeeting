import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AuthCard({ setCurrentUser }) {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    email: '',
    password: '',
  });
  
  // Position States
  const [positions, setPositions] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await fetch('http://192.168.57.191:8000/api/v1/auth/positions');
        if (response.ok) {
          const data = await response.json();
          setPositions(data.positions || []);
        }
      } catch (err) {
        console.error('Failed to fetch positions:', err);
      }
    };
    fetchPositions();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');

    if (name === 'position') {
      if (value.trim() === '') {
        setFilteredPositions([]);
        setShowDropdown(false);
      } else {
        const filtered = positions.filter((pos) =>
          pos.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredPositions(filtered);
        setShowDropdown(true);
      }
    }
  };

  const handlePositionSelect = (selectedPosition) => {
    setFormData((prev) => ({ ...prev, position: selectedPosition }));
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        
        const response = await fetch('http://192.168.57.191:8000/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'Email သို့မဟုတ် Password မှားယွင်းနေပါသည်။');
        }

        localStorage.setItem('access_token', data.access_token);

        const userData = data.user || { 
          email: formData.email, 
          name: formData.email.split('@')[0],
          position: ''
        };

        localStorage.setItem('currentUser', JSON.stringify(userData));
        setCurrentUser(userData);

        navigate('/dashboard');

      } else {
        const response = await fetch('http://192.168.57.191:8000/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            position: formData.position,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'အကောင့်ဖွင့်ခြင်း မအောင်မြင်ပါ။');
        }
        
        setIsLogin(true);
        setError('Account created successfully! Please sign in.');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Atmospheric Gradient Orbs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#a7e5d3]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#f4c5a8]/25 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-white rounded-2xl border border-[#e7e5e4] shadow-sm w-full max-w-md overflow-hidden relative z-10">
        {/* Tab Controls */}
        <div className="flex border-b border-[#e7e5e4]">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`w-1/2 py-3.5 sm:py-4 text-sm sm:text-base text-center font-medium transition-all ${
              isLogin ? 'text-[#0c0a09] border-b-2 border-[#0c0a09]' : 'text-[#777169] hover:text-[#0c0a09]'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`w-1/2 py-3.5 sm:py-4 text-sm sm:text-base text-center font-medium transition-all ${
              !isLogin ? 'text-[#0c0a09] border-b-2 border-[#0c0a09]' : 'text-[#777169] hover:text-[#0c0a09]'
            }`}
          >
            Register
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <h2 className="font-serif font-light text-2xl sm:text-3xl text-[#0c0a09] text-center mb-1">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-[#777169] text-center mb-6">
            {isLogin ? 'Please enter your details to sign in.' : 'Fill in the form to get started.'}
          </p>

          {error && (
            <div className={`mb-4 p-3 text-sm font-medium rounded-lg border ${
              error.includes('successfully') 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#777169] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 sm:py-2.5 rounded-md border border-[#e7e5e4] focus:outline-none focus:border-[#0c0a09] text-base sm:text-sm text-[#0c0a09] placeholder-[#a8a29e] transition-colors"
                />
              </div>
            )}

            {!isLogin && (
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#777169] mb-1.5">
                  Position / Role
                </label>
                <input
                  type="text"
                  name="position"
                  required
                  autoComplete="off"
                  value={formData.position}
                  onChange={handleChange}
                  onFocus={() => {
                     if(formData.position) setShowDropdown(true);
                  }}
                  placeholder="Type to search your position..."
                  className="w-full px-4 py-3 sm:py-2.5 rounded-md border border-[#e7e5e4] focus:outline-none focus:border-[#0c0a09] text-base sm:text-sm text-[#0c0a09] placeholder-[#a8a29e] transition-colors"
                />
                
                {/* Custom Autocomplete Dropdown Menu */}
                {showDropdown && filteredPositions.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-[#e7e5e4] rounded-lg shadow-lg max-h-48 sm:max-h-60 overflow-y-auto">
                    {filteredPositions.map((pos, index) => (
                      <li
                        key={index}
                        onClick={() => handlePositionSelect(pos)}
                        className="px-4 py-3 sm:py-2.5 text-base sm:text-sm text-[#0c0a09] hover:bg-[#f0efed] cursor-pointer transition-colors"
                      >
                        {pos}
                      </li>
                    ))}
                  </ul>
                )}
                {showDropdown && filteredPositions.length === 0 && formData.position && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-[#e7e5e4] rounded-lg shadow-lg px-4 py-3 text-sm text-[#777169] italic">
                    Press Register to save as custom position.
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#777169] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 sm:py-2.5 rounded-md border border-[#e7e5e4] focus:outline-none focus:border-[#0c0a09] text-base sm:text-sm text-[#0c0a09] placeholder-[#a8a29e] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#777169] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 sm:py-2.5 pr-10 rounded-md border border-[#e7e5e4] focus:outline-none focus:border-[#0c0a09] text-base sm:text-sm text-[#0c0a09] placeholder-[#a8a29e] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#a8a29e] hover:text-[#0c0a09] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#292524] hover:bg-[#0c0a09] text-white font-medium py-3 sm:py-2.5 rounded-full shadow-sm transition-all text-base sm:text-sm disabled:opacity-50"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
