import React, { useState } from 'react';
import {
  User,
  Lock,
  Bell,
  LogOut,
  IndianRupee,
  Zap,
  Check,
  Send,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import { notificationApi } from '../api/notificationApi';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

export const Settings = () => {
  const { user, updateUser, logout } = useAuth();

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    electricityTariff: String(user?.electricityTariff ?? '7.50'),
    installedCapacity: String(user?.installedCapacity ?? '5.0'),
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Notification Test State
  const [notifForm, setNotifForm] = useState({
    title: 'Routine Maintenance Notice',
    body: 'Inverter string #2 efficiency nominal. Scheduled cleaning due in 7 days.',
  });
  const [notifLoading, setNotifLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      const res = await authApi.updateProfile({
        name: profileForm.name,
        electricityTariff: Number(profileForm.electricityTariff),
        installedCapacity: Number(profileForm.installedCapacity),
      });
      if (res?.user) {
        updateUser(res.user);
      }
      toast.success(res?.message || 'Profile settings updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success(res?.message || 'Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSendTestNotification = async (e) => {
    e.preventDefault();
    try {
      setNotifLoading(true);
      const res = await notificationApi.sendNotification({
        title: notifForm.title,
        body: notifForm.body,
        severity: 'medium',
      });
      toast.success(res?.message || 'Test notification broadcast via Socket.IO!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to dispatch notification');
    } finally {
      setNotifLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header bar */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          System Settings & Operator Profile
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage system tariffs, security credentials, and push notifications
        </p>
      </div>

      {/* Profile & Telemetry Configuration */}
      <Card>
        <CardHeader
          title="Solar Operator Profile & DISCOM Tariff"
          subtitle="Update rated plant capacity and electricity unit costs"
        />
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                icon={User}
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
              />

              <Input
                label="Registered Email"
                value={user?.email || ''}
                disabled
                helperText="Account email cannot be modified"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Aggregate Installed Capacity (kW)"
                type="number"
                step="0.1"
                min="0.1"
                icon={Zap}
                value={profileForm.installedCapacity}
                onChange={(e) => setProfileForm({ ...profileForm, installedCapacity: e.target.value })}
                required
              />

              <Input
                label="Electricity Tariff Rate (₹/kWh)"
                type="number"
                step="0.05"
                min="0.5"
                icon={IndianRupee}
                value={profileForm.electricityTariff}
                onChange={(e) => setProfileForm({ ...profileForm, electricityTariff: e.target.value })}
                helperText="Used for accurate bill & savings predictions"
                required
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" loading={profileLoading}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader
          title="Account Security & Password"
          subtitle="Ensure your monitoring dashboard remains secure"
        />
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              icon={Lock}
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="New Password"
                type="password"
                placeholder="Min. 8 characters"
                icon={Lock}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Repeat new password"
                icon={Lock}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="secondary" loading={passwordLoading}>
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Test Notification Dispatcher */}
      <Card>
        <CardHeader
          title="Real-Time Notification Dispatcher"
          subtitle="Test WebSocket and Firebase multi-channel push alerts"
        />
        <CardContent>
          <form onSubmit={handleSendTestNotification} className="space-y-4">
            <Input
              label="Notification Headline / Title"
              value={notifForm.title}
              onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
              required
            />

            <Input
              label="Notification Body"
              value={notifForm.body}
              onChange={(e) => setNotifForm({ ...notifForm, body: e.target.value })}
              required
            />

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Dispatches an in-app alert and broadcasts via Socket.io event `alert:new`
              </span>
              <Button
                type="submit"
                variant="outline"
                loading={notifLoading}
                icon={Send}
              >
                Send Test Alert
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone / Logout */}
      <Card className="border-rose-200 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10">
        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400">
              Sign Out of SolarSight Session
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Clear your security token and disconnect real-time WebSockets
            </p>
          </div>

          <Button
            onClick={logout}
            variant="danger"
            size="sm"
            icon={LogOut}
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
