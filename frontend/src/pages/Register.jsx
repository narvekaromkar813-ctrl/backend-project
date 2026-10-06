import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SunMedium, Lock, Mail, User, Zap, IndianRupee, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    installedCapacity: '5.0',
    electricityTariff: '7.50',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Name, email, and password are required');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'user',
        installedCapacity: Number(formData.installedCapacity) || 5.0,
        electricityTariff: Number(formData.electricityTariff) || 7.50,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 relative overflow-hidden">
      {/* Background Solar Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-orange-500/10 dark:bg-orange-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Brand Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-solar-glow mb-3">
            <SunMedium className="w-7 h-7 animate-spin-slow" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Register for Solar<span className="text-amber-500">Sight</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Setup your photovoltaic plant profile & grid tariff
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-navy-900/90 shadow-xl backdrop-blur-xl p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              placeholder="Aditya Sharma"
              icon={User}
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="aditya@solarsight.io"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Installed Capacity (kW)"
                name="installedCapacity"
                type="number"
                step="0.1"
                min="0.1"
                placeholder="5.0"
                icon={Zap}
                value={formData.installedCapacity}
                onChange={handleChange}
                helperText="Total solar panel capacity"
                required
              />

              <Input
                label="Electricity Tariff (₹/kWh)"
                name="electricityTariff"
                type="number"
                step="0.05"
                min="0.5"
                placeholder="7.50"
                icon={IndianRupee}
                value={formData.electricityTariff}
                onChange={handleChange}
                helperText="DISCOM unit rate"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                required
              />

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                icon={Lock}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-3"
              loading={loading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Complete Registration
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Already have a SolarSight account?{' '}
            <Link
              to="/login"
              className="font-semibold text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 underline underline-offset-2"
            >
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
