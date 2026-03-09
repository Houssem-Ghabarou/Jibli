import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { subscribeToNotifications } from '@/lib/firestore/notifications';
import { subscribeToConversations } from '@/lib/firestore/conversations';

interface NotificationsContextType {
  unreadCount: number;
  unreadMessages: number;
}

const NotificationsContext = createContext<NotificationsContextType>({ unreadCount: 0, unreadMessages: 0 });

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setUnreadMessages(0);
      return;
    }

    const unsubNotifs = subscribeToNotifications(user.uid, (notifications) => {
      setUnreadCount(notifications.length);
    });

    const unsubConvs = subscribeToConversations(user.uid, (conversations) => {
      const total = conversations.reduce((sum, conv) => {
        return sum + (conv.unreadCounts?.[user.uid] ?? 0);
      }, 0);
      setUnreadMessages(total);
    });

    return () => {
      unsubNotifs();
      unsubConvs();
    };
  }, [user]);

  return (
    <NotificationsContext.Provider value={{ unreadCount, unreadMessages }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
