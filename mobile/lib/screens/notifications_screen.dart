import 'package:flutter/material.dart';
import 'dart:convert';
import '../services/api_service.dart';
import '../theme.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final api = ApiService();
  List notifications = [];
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _fetchNotifications();
  }

  Future<void> _fetchNotifications() async {
    setState(() {
      isLoading = true;
      error = null;
    });
    try {
      final res = await api.get('/notifications/my-notifications');
      if (res.statusCode == 200 || res.statusCode == 201) {
        final data = jsonDecode(res.body);
        setState(() {
          if (data is List) {
            notifications = data;
          } else if (data['items'] != null) {
            notifications = data['items'];
          } else {
            notifications = [];
          }
        });
      } else {
        throw Exception('Failed to load notifications.');
      }
    } catch (e) {
      setState(() {
        error = 'Failed to load notifications.';
      });
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }

  Future<void> _markAsRead(String id) async {
    try {
      await api.patch('/notifications/$id/read', {});
      setState(() {
        for (var n in notifications) {
          if (n['id'].toString() == id) {
            n['isRead'] = true;
            n['is_read'] = true;
          }
        }
      });
    } catch (e) {
      // Ignore error as per React logic
    }
  }

  Future<void> _markAllAsRead() async {
    try {
      await api.patch('/notifications/read-all', {});
      setState(() {
        for (var n in notifications) {
          n['isRead'] = true;
          n['is_read'] = true;
        }
      });
    } catch (e) {
      // Ignore
    }
  }

  String _timeAgo(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      final diff = DateTime.now().difference(date);
      if (diff.inMinutes < 1) return 'Just now';
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      return '${diff.inDays}d ago';
    } catch (e) {
      return '';
    }
  }

  bool _isRead(dynamic n) {
    return n['isRead'] == true || n['is_read'] == true;
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = notifications.where((n) => !_isRead(n)).length;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        backgroundColor: AppTheme.surfaceContainerLowest,
        elevation: 1,
        shadowColor: Colors.black12,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: AppTheme.brandNavy),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            Icon(Icons.notifications, color: AppTheme.brandOrange, size: 20),
            const SizedBox(width: 8),
            Text(
              'Notifications',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppTheme.brandNavy, fontWeight: FontWeight.bold),
            ),
            if (unreadCount > 0) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.red,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '$unreadCount',
                  style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ]
          ],
        ),
        actions: [
          if (unreadCount > 0)
            TextButton(
              onPressed: _markAllAsRead,
              child: Text(
                'Mark all read',
                style: TextStyle(color: AppTheme.brandOrange, fontSize: 12, fontWeight: FontWeight.w600),
              ),
            ),
        ],
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator(color: AppTheme.brandOrange))
          : error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline, size: 48, color: Colors.red[200]),
                      const SizedBox(height: 8),
                      Text(error!, style: TextStyle(color: Colors.red[400])),
                    ],
                  ),
                )
              : notifications.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.notifications_off_outlined, size: 64, color: AppTheme.outlineVariant),
                          const SizedBox(height: 16),
                          Text('No notifications yet.', style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppTheme.onSurfaceVariant)),
                          const SizedBox(height: 4),
                          Text("We'll let you know when something happens.", style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.outline)),
                        ],
                      ),
                    )
                  : ListView.separated(
                      itemCount: notifications.length,
                      separatorBuilder: (context, index) => Divider(height: 1, color: AppTheme.borderSubtle, thickness: 1),
                      itemBuilder: (context, index) {
                        final n = notifications[index];
                        final isRead = _isRead(n);
                        
                        return InkWell(
                          onTap: () {
                            if (!isRead) {
                              _markAsRead(n['id'].toString());
                            }
                          },
                          child: Container(
                            color: isRead ? AppTheme.surfaceContainerLowest : AppTheme.brandOrange.withOpacity(0.05),
                            padding: const EdgeInsets.all(16),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  margin: const EdgeInsets.only(top: 6),
                                  width: 8,
                                  height: 8,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: isRead ? AppTheme.borderSubtle : AppTheme.brandOrange,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        n['message'] ?? '',
                                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                          color: isRead ? AppTheme.onSurfaceVariant : AppTheme.brandNavy,
                                          fontWeight: isRead ? FontWeight.normal : FontWeight.w500,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        _timeAgo(n['createdAt'] ?? n['created_at'] ?? ''),
                                        style: TextStyle(fontSize: 10, color: AppTheme.outline),
                                      ),
                                    ],
                                  ),
                                ),
                                if (!isRead)
                                  IconButton(
                                    icon: Icon(Icons.check, size: 16, color: AppTheme.outline),
                                    onPressed: () => _markAsRead(n['id'].toString()),
                                    tooltip: 'Mark as read',
                                    padding: EdgeInsets.zero,
                                    constraints: const BoxConstraints(),
                                  ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
    );
  }
}
