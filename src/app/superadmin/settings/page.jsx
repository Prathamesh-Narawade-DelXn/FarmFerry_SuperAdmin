"use client";

import React, { useState, useRef, useEffect } from 'react';
import { User, Lock, Save, Eye, EyeOff, Bell, Shield, Smartphone, Mail, MapPin, Phone, Calendar, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import { getProfile, updateProfile, changePassword, uploadAvatar } from '../../../utils/superadminApi';
import { useSuperAdminProfile } from '../../../context/SuperAdminProfileContext';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    company: '',
    joinDate: '',
    avatar: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    priceAlerts: false,
    newProducts: true,
    marketing: false
  });
  const [saveStatus, setSaveStatus] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fileInputRef = useRef();
  const { setProfile } = useSuperAdminProfile();

  // Fetch profile data on mount
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError('');
      try {
        const res = await getProfile();
        // Map backend fields to frontend state
        setProfileData({
          fullName: res?.data?.name || '',
          email: res?.data?.email || '',
          phone: res?.data?.phone || '',
          location: res?.data?.location || '',
          company: res?.data?.company || '',
          joinDate: res?.data?.createdAt || '',
          avatar: res?.data?.avatar || ''
        });
        if (res?.superadmin?.notifications) setNotifications(res.superadmin.notifications);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaveStatus('saving');
    setError('');
    try {
      const payload = {
        name: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location,
        company: profileData.company
      };
      await updateProfile(payload);
      // Re-fetch the latest profile from backend
      const res = await getProfile();
      setProfileData({
        fullName: res?.data?.name || '',
        email: res?.data?.email || '',
        phone: res?.data?.phone || '',
        location: res?.data?.location || '',
        company: res?.data?.company || '',
        joinDate: res?.data?.createdAt || '',
        avatar: res?.data?.avatar || ''
      });
      setProfile({
        name: res?.data?.name || 'SuperAdmin',
        role: 'Super Admin',
        avatar: res?.data?.avatar || '',
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      setSaveStatus('error');
      setError('Failed to update profile');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSaveStatus('saving');
    setError('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveStatus('error');
      setError('Passwords do not match!');
      setTimeout(() => setSaveStatus(''), 3000);
      return;
    }
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      setSaveStatus('success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      setSaveStatus('error');
      setError('Failed to update password');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    setAvatarError('');
    try {
      const res = await uploadAvatar(file);
      setProfileData((prev) => ({
        ...prev,
        avatar: res?.data?.avatar ? res.data.avatar : prev.avatar
      }));
      setProfile((prev) => ({
        ...prev,
        avatar: res?.data?.avatar ? res.data.avatar : prev.avatar
      }));
    } catch (err) {
      setAvatarError('Failed to upload avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  const StatusMessage = () => {
    if (!saveStatus) return null;
    
    const statusConfig = {
      saving: { icon: AlertCircle, text: 'Saving changes...', color: 'text-blue-600 bg-blue-50 border-blue-200' },
      success: { icon: CheckCircle, text: 'Changes saved successfully!', color: 'text-green-600 bg-green-50 border-green-200' },
      error: { icon: AlertCircle, text: 'Passwords do not match!', color: 'text-red-600 bg-red-50 border-red-200' }
    };
    
    const config = statusConfig[saveStatus];
    const IconComponent = config.icon;
    
    return (
      <div className={`fixed top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg border ${config.color} transform transition-all duration-300 z-50`}>
        <IconComponent className="w-4 h-4" />
        <span className="text-sm font-medium">{config.text}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 p-4">
      <StatusMessage />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your Farm Ferry account and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 bg-white rounded-2xl shadow-xl p-6 h-fit">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-2xl shadow-xl p-8">
            {loading && <p className="text-center py-8">Loading settings...</p>}
            {error && <p className="text-center py-8 text-red-500">{error}</p>}

            {!loading && !error && (
              <>
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                      <p className="text-gray-600">Update your account profile information</p>
                    </div>

                    <div className="space-y-6">
                      {/* Avatar Section */}
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center overflow-hidden">
                          {profileData.avatar ? (
                            <img src={`http://localhost:9000${profileData.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-12 h-12 text-white" />
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleAvatarChange}
                            disabled={avatarUploading}
                          />
                          <button
                            type="button"
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={avatarUploading}
                          >
                            {avatarUploading ? 'Uploading...' : 'Change Avatar'}
                          </button>
                          <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                          {avatarError && <p className="text-sm text-red-500 mt-1">{avatarError}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <User className="w-4 h-4 inline mr-2" />
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={profileData.fullName || ""}
                            onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            placeholder="Enter your full name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Mail className="w-4 h-4 inline mr-2" />
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={profileData.email || ""}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            placeholder="Enter your email"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Phone className="w-4 h-4 inline mr-2" />
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={profileData.phone || ""}
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            placeholder="Enter your phone number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="w-4 h-4 inline mr-2" />
                            Location
                          </label>
                          <input
                            type="text"
                            value={profileData.location || ""}
                            onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            placeholder="Enter your location"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Building2 className="w-4 h-4 inline mr-2" />
                            Company/Farm Name
                          </label>
                          <input
                            type="text"
                            value={profileData.company || ""}
                            onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            placeholder="Enter your company name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Member Since
                          </label>
                          <input
                            type="text"
                            value={profileData.joinDate || ""}
                            disabled
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handleProfileSubmit}
                          disabled={saveStatus === 'saving'}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Password Tab */}
                {activeTab === 'password' && (
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                      <p className="text-gray-600">Update your password to keep your account secure</p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all pr-12"
                            placeholder="Enter current password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all pr-12"
                            placeholder="Enter new password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all pr-12"
                            placeholder="Confirm new password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h3 className="font-medium text-blue-900 mb-2">Password Requirements:</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• At least 8 characters long</li>
                          <li>• Include uppercase and lowercase letters</li>
                          <li>• Include at least one number</li>
                          <li>• Include at least one special character</li>
                        </ul>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handlePasswordSubmit}
                          disabled={saveStatus === 'saving'}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105 disabled:opacity-50"
                        >
                          <Lock className="w-4 h-4" />
                          {saveStatus === 'saving' ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h2 className="text-2xl font-bold text-gray-900">Notification Preferences</h2>
                      <p className="text-gray-600">Choose what notifications you want to receive</p>
                    </div>

                    <div className="space-y-4">
                      {Object.entries(notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {key === 'orderUpdates' && 'Order Updates'}
                              {key === 'priceAlerts' && 'Price Alerts'}
                              {key === 'newProducts' && 'New Products'}
                              {key === 'marketing' && 'Marketing Emails'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {key === 'orderUpdates' && 'Get notified about order status changes'}
                              {key === 'priceAlerts' && 'Receive alerts when prices change'}
                              {key === 'newProducts' && 'Learn about new products and features'}
                              {key === 'marketing' && 'Receive promotional emails and offers'}
                            </p>
                          </div>
                          <button
                            onClick={() => setNotifications({...notifications, [key]: !value})}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              value ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-4">
                      <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
                      <p className="text-gray-600">Manage your account security and privacy</p>
                    </div>

                    <div className="space-y-4">
                      <div className="p-6 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-green-500" />
                            <div>
                              <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                              <p className="text-sm text-gray-600">Add an extra layer of security</p>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                            Enable 2FA
                          </button>
                        </div>
                      </div>

                      <div className="p-6 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-blue-500" />
                            <div>
                              <h3 className="font-medium text-gray-900">Login Activity</h3>
                              <p className="text-sm text-gray-600">Review recent login attempts</p>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                            View Activity
                          </button>
                        </div>
                      </div>

                      <div className="p-6 bg-red-50 rounded-xl border border-red-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <div>
                              <h3 className="font-medium text-red-900">Delete Account</h3>
                              <p className="text-sm text-red-600">Permanently delete your account and data</p>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;