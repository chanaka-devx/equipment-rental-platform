'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';

const SETTING_TABS = [
  { id: 'profile', icon: 'person', title: 'Profile', desc: 'Manage your personal information' },
  { id: 'business', icon: 'domain', title: 'Business Information', desc: 'Update your business details' },
  { id: 'rental', icon: 'payments', title: 'Rental Settings', desc: 'Configure rental preferences' },
  { id: 'reservation', icon: 'calendar_today', title: 'Reservation Settings', desc: 'Manage reservation preferences' },
  { id: 'notification', icon: 'notifications', title: 'Notification Settings', desc: 'Configure email & alerts' },
  { id: 'inventory', icon: 'inventory_2', title: 'Inventory Settings', desc: 'Inventory preferences' },
  { id: 'security', icon: 'lock', title: 'Security', desc: 'Password and security' },
  { id: 'appearance', icon: 'palette', title: 'Appearance', desc: 'Theme and display settings' },
  { id: 'system', icon: 'desktop_windows', title: 'System', desc: 'System configuration' },
];

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useAuth();
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F1F5F9] flex">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen">
          <Header title="Settings" onOpenSidebar={() => setSidebarOpen(true)} />

          <div className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row min-h-[800px]">
              
              {/* Left Sidebar Menu */}
              <div className="w-full md:w-[320px] border-b md:border-b-0 md:border-r border-slate-100 p-4 shrink-0">
                <div className="space-y-1">
                  {SETTING_TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-start gap-3 p-4 rounded-xl text-left transition-all ${
                          isActive 
                            ? 'border border-[#F97316] bg-orange-50/30 shadow-sm' 
                            : 'border border-transparent hover:bg-slate-50'
                        }`}
                      >
                        <span className={`material-symbols-outlined mt-0.5 ${isActive ? 'text-[#F97316]' : 'text-slate-400'}`}>
                          {tab.icon}
                        </span>
                        <div>
                          <p className={`text-sm font-bold ${isActive ? 'text-[#F97316]' : 'text-[#0F172A]'}`}>
                            {tab.title}
                          </p>
                          <p className={`text-xs ${isActive ? 'text-orange-700/70' : 'text-slate-500'}`}>
                            {tab.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Content Area */}
              <div className="flex-1 p-6 lg:p-10">
                {activeTab === 'profile' ? (
                  <div className="max-w-3xl">
                    <div className="mb-8">
                      <h2 className="text-xl font-bold text-[#0F172A]">Profile Settings</h2>
                      <p className="text-sm text-slate-500 mt-1">Update your personal information and account details</p>
                    </div>

                    <div className="space-y-8">
                      {/* Top Row: Picture + Details */}
                      <div className="flex flex-col sm:flex-row gap-8">
                        {/* Profile Picture */}
                        <div>
                          <p className="text-xs font-bold text-[#0F172A] mb-3">Profile Picture</p>
                          <div className="relative inline-block">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-md">
                              <img 
                                src="https://i.pravatar.cc/150?img=11" 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[#F97316] shadow-sm hover:bg-orange-50 transition-colors">
                              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-3 font-medium">
                            JPG, PNG or SVG. Max size 2MB.
                          </p>
                        </div>

                        {/* Name & Email */}
                        <div className="flex-1 space-y-4">
                          <div>
                            <label className="text-xs font-bold text-[#0F172A] mb-1.5 block">Full Name</label>
                            <input 
                              type="text" 
                              defaultValue={user?.name || 'Coyote Starrk'} 
                              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-[#0F172A] font-medium focus:border-[#F97316] focus:ring-1 focus:ring-orange-200 outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-[#0F172A] mb-1.5 block">Email Address</label>
                            <input 
                              type="email" 
                              defaultValue={user?.email || 'admin@rentforge.com'} 
                              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-[#0F172A] font-medium focus:border-[#F97316] focus:ring-1 focus:ring-orange-200 outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Phone & Role */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <label className="text-xs font-bold text-[#0F172A] mb-1.5 block">Phone Number</label>
                          <input 
                            type="text" 
                            defaultValue="+94 77 123 4567" 
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-[#0F172A] font-medium focus:border-[#F97316] focus:ring-1 focus:ring-orange-200 outline-none transition-all"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-bold text-[#0F172A] mb-1.5 block">Role</label>
                          <input 
                            type="text" 
                            defaultValue={user?.role === 'ADMIN' ? 'Administrator' : user?.role || 'Administrator'} 
                            disabled
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 font-medium cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <hr className="border-slate-100" />

                      {/* Password Change */}
                      <div>
                        <h3 className="text-base font-bold text-[#0F172A] mb-1">Change Password</h3>
                        <p className="text-xs text-slate-500 mb-5">Update your password to keep your account secure</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="text-xs font-bold text-[#0F172A] mb-1.5 block">Current Password</label>
                            <div className="relative">
                              <input 
                                type={showCurrentPassword ? "text" : "password"} 
                                placeholder="Enter current password"
                                className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-[#0F172A] focus:border-[#F97316] focus:ring-1 focus:ring-orange-200 outline-none transition-all"
                              />
                              <button 
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                <span className="material-symbols-outlined text-[18px]">{showCurrentPassword ? 'visibility_off' : 'visibility'}</span>
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-[#0F172A] mb-1.5 block">New Password</label>
                            <div className="relative">
                              <input 
                                type={showNewPassword ? "text" : "password"} 
                                placeholder="Enter new password"
                                className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-[#0F172A] focus:border-[#F97316] focus:ring-1 focus:ring-orange-200 outline-none transition-all"
                              />
                              <button 
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                <span className="material-symbols-outlined text-[18px]">{showNewPassword ? 'visibility_off' : 'visibility'}</span>
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1.5 font-medium">Password must be at least 8 characters long</p>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-[#0F172A] mb-1.5 block">Confirm New Password</label>
                            <div className="relative">
                              <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                placeholder="Confirm new password"
                                className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-[#0F172A] focus:border-[#F97316] focus:ring-1 focus:ring-orange-200 outline-none transition-all"
                              />
                              <button 
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                <span className="material-symbols-outlined text-[18px]">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex justify-end pt-2">
                        <button className="px-5 py-2.5 bg-[#F97316] hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
                          Save Changes
                        </button>
                      </div>

                      {/* Security Banner */}
                      <div className="mt-8 flex items-center justify-between p-5 bg-orange-50/50 border border-orange-100 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-orange-200 shrink-0 shadow-sm">
                            <span className="material-symbols-outlined text-[#F97316]">security</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#0F172A]">Your account is secure</h4>
                            <p className="text-xs text-slate-500 mt-0.5">Last password change: 14 days ago</p>
                            <p className="text-xs text-slate-500">Last login: Today, 09:45 AM</p>
                          </div>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                          <span className="material-symbols-outlined text-sm">history</span>
                          View Login History
                        </button>
                      </div>
                      
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-3xl text-slate-400">
                        build
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#0F172A] mb-1">Coming Soon</h3>
                    <p className="text-sm text-slate-500 max-w-md">
                      This settings page is under construction. Please check back later for updates.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
