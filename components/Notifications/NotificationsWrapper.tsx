
'use client';

import { useAuth } from "@/AuthContext/AuthProvider";
import Notifications from "./Notification";
import type { AppUser } from "@/Types";

const NotificationWrapper: React.FC = () => {
  const { currentUser }: { currentUser: AppUser | null } = useAuth();

  if (!currentUser) {
    return null;
  }

  return <Notifications currentUser={currentUser} />;
};

export default NotificationWrapper;