import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Target, Lock, Mail, ArrowRight, User } from 'lucide-react';
import { authAPI } from '../utils/api';
import GlassCard from '../components/GlassCard';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.register(formData);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userName', response.data.name);
        localStorage.setItem('userEmail', response.data.email);
        
        // Immediate redirection. User receives a pre-filled resume instantly!
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      {/* Background circles */}
      <div className="absolute w-[400px] h-[400px] bg-brandBlue/15 rounded-full blur-[100px] -top-20 -left-20"></div>
      <div className="absolute w-[400px] h-[400px] bg-brandPurple/10 rounded-full blur-[100px] -bottom-20 -right-20"></div>

      <div className="w-full max-w-md z-10">
        <GlassCard className="p-8 border border-borderGlass shadow-glass">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brandBlue to-brandPurple flex items-center justify-center shadow-neonBlue mb-3">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-extrabold text-2xl bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              CAREER AI
            </h1>
            <p className="text-xs text-gray-500 mt-1">Unlock ATS-Optimized job placements</p>
          </div>

          <h3 className="text-xl font-bold text-white mb-6 text-center">Create Free Account</h3>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 block mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="•••••••• (Min 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-2.5 rounded-xl bg-gradient-to-r from-brandBlue to-brandPurple text-white font-bold text-sm flex items-center justify-center gap-2 hover:shadow-neonBlue transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Setting up workspace...' : 'Get Instant Access'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brandBlue hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
};

export default Register;
