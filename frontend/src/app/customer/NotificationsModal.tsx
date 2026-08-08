'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import api from '@/lib/api';

interface NotificationsModalProps {
  open: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export default function NotificationsModal({ open, onClose, onUnreadCountChange }: NotificationsModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/notifications/my-notifications');
      const list: any[] = Array.isArray(res.data) ? res.data : (res.data?.items || []);
      setNotifications(list);
      onUnreadCountChange?.(list.filter((n) => !n.isRead).length);
    } catch {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [onUnreadCountChange]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      onUnreadCountChange?.(notifications.filter((n) => !n.isRead && n.id !== id).length);
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      onUnreadCountChange?.(0);
    } catch {}
  };

  if (!open) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div
      ref={ref}
      className="absolute -right-10 sm:right-0 top-full mt-3 w-[340px] sm:w-[360px] max-w-[calc(100vw-1rem)] bg-white border border-slate-200 rounded-2xl shadow-2xl z-[300] flex flex-col max-h-[70vh] overflow-hidden"
    >
      {/* Notch */}
      <div className="absolute -top-2 right-[50px] sm:right-10 w-4 h-4 bg-white border-l border-t border-slate-200 rotate-45 z-10" />

      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#F97316] text-xl">notifications</span>
          <h2 className="text-sm font-bold text-[#0F172A]">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] text-[#F97316] hover:underline font-semibold"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-slate-300 hover:text-slate-600 transition-colors focus:outline-none">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="material-symbols-outlined animate-spin text-3xl text-[#F97316]">progress_activity</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-5">
            <span className="material-symbols-outlined text-4xl text-red-200">error</span>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-center px-5">
            <span className="material-symbols-outlined text-5xl text-slate-200">notifications_off</span>
            <p className="text-sm text-slate-500 font-medium">No notifications yet.</p>
            <p className="text-xs text-slate-400">We'll let you know when something happens.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && markAsRead(n.id)}
                className={`flex items-start gap-3 px-5 py-3.5 transition-colors cursor-pointer ${
                  n.isRead ? 'bg-white hover:bg-slate-50' : 'bg-orange-50 hover:bg-orange-100'
                }`}
              >
                {/* Icon dot */}
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.isRead ? 'bg-slate-200' : 'bg-[#F97316]'}`} />

                <div className="flex-grow min-w-0">
                  <p className={`text-sm leading-snug ${n.isRead ? 'text-slate-500' : 'text-[#0F172A] font-medium'}`}>
                    {n.message}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>

                {!n.isRead && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                    className="shrink-0 text-[10px] text-slate-400 hover:text-[#F97316] transition-colors mt-0.5"
                    title="Mark as read"
                  >
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50 shrink-0">
          <p className="text-[11px] text-slate-400 text-center">
            {unreadCount > 0 ? `${unreadCount} unread · ` : ''}{notifications.length} total notification{notifications.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
