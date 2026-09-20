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
        const response = await fetch('http://localhost:8000/api/v1/auth/positions');
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
        
        const response = await fetch('http://localhost:8000/api/v1/auth/login', {
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
        const response = await fetch('http://localhost:8000/api/v1/auth/register', {
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
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Tab Controls */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`w-1/2 py-4 text-center font-semibold transition-all ${
              isLogin ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-indigo-600'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`w-1/2 py-4 text-center font-semibold transition-all ${
              !isLogin ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-indigo-600'
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
            {isLogin ? 'Please enter your details to sign in.' : 'Fill in the form to get started.'}
          </p>

          {error && (
            <div className={`mb-4 p-3 text-sm font-medium rounded-lg border ${
              error.includes('successfully') 
                ? 'bg-green-50 text-green-600 border-green-200' 
                : 'bg-red-50 text-red-600 border-red-200'
            }`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            )}

            {!isLogin && (
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
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
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
                
                {/* Custom Autocomplete Dropdown Menu */}
                {showDropdown && filteredPositions.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredPositions.map((pos, index) => (
                      <li
                        key={index}
                        onClick={() => handlePositionSelect(pos)}
                        className="px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer transition-colors"
                      >
                        {pos}
                      </li>
                    ))}
                  </ul>
                )}
                {showDropdown && filteredPositions.length === 0 && formData.position && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg px-4 py-3 text-sm text-slate-500 italic">
                    Press Register to save as custom position.
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">
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