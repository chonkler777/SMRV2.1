"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Bell, X, Heart, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import type {
  Notification,
  TipNotification,
  LikeNotification,
} from "@/Types/notifications";
import type { AppUser } from "@/Types";
import Link from "next/link";

import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  Unsubscribe,
} from "firebase/firestore";

const ITEMS_PER_PAGE = 10;
const REALTIME_LIMIT = 50;

interface NotificationsProps {
  currentUser: AppUser | null;
}

const MemeThumbnail: React.FC<{
  imageUrl: string;
  fileType: string;
  thumbnailUrl?: string;
}> = ({ imageUrl, thumbnailUrl, fileType }) => {
  const isVideo = fileType?.toLowerCase().includes("video");

  return (
    <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-600 flex-shrink-0">
      {isVideo ? (
        <img
          src={thumbnailUrl || imageUrl || undefined}
          alt="Video thumbnail"
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }}
        />
      ) : (
        <img
          src={imageUrl || undefined}
          alt="Meme thumbnail"
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }}
        />
      )}
    </div>
  );
};

const Notifications: React.FC<NotificationsProps> = ({ currentUser }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [serverClickedNotifications, setServerClickedNotifications] = useState<
    Set<string>
  >(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLUListElement>(null);
  const unsubscribeTipsRef = useRef<Unsubscribe | null>(null);
  const unsubscribeLikesRef = useRef<Unsubscribe | null>(null);
  const initialLoadRef = useRef(false);
  const isDropdownOpenRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!currentUser) {
      if (unsubscribeTipsRef.current) {
        unsubscribeTipsRef.current();
        unsubscribeTipsRef.current = null;
      }
      if (unsubscribeLikesRef.current) {
        unsubscribeLikesRef.current();
        unsubscribeLikesRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      initialLoadRef.current = false;
      return;
    }

    if (unsubscribeTipsRef.current) unsubscribeTipsRef.current();
    if (unsubscribeLikesRef.current) unsubscribeLikesRef.current();

    const listenStartTime = Date.now();

    if (currentUser.walletAddress) {
      const tipsQuery = query(
        collection(db, "tips"),
        where("recipientWallet", "==", currentUser.walletAddress),
        orderBy("timestamp", "desc"),
        limit(REALTIME_LIMIT)
      );

      unsubscribeTipsRef.current = onSnapshot(
        tipsQuery,
        (snapshot) => {
          setRealtimeConnected(true);

          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const tipData = change.doc.data();

              if (tipData.timestamp > listenStartTime) {
                const newTip: TipNotification = {
                  id: `tip-${tipData.memeId}-${tipData.timestamp}-${tipData.senderWallet}`,
                  type: "tip",
                  memeId: tipData.memeId,
                  memeTitle: tipData.memeTitle || "Untitled",
                  imageUrl: tipData.memeImageUrl || "",
                  thumbnailUrl:
                    tipData.memeThumbnailUrl || tipData.memeImageUrl || "",
                  fileType: tipData.memeFileType || "image/jpeg",
                  priceAtSend: tipData.priceAtSend || 0,
                  from: tipData.senderWallet,
                  amount: tipData.amount,
                  timestamp: tipData.timestamp,
                  senderUsername: tipData.senderUsername || "Anonymous",
                };

                setNotifications((prev) => {
                  if (prev.some((n) => n.id === newTip.id)) return prev;
                  return [newTip, ...prev];
                });

                if (!isDropdownOpenRef.current) {
                  setUnreadCount((prev) => prev + 1);
                }

                if (
                  typeof window !== "undefined" &&
                  "Notification" in window &&
                  Notification.permission === "granted"
                ) {
                  const usdAmount = (
                    newTip.amount * newTip.priceAtSend
                  ).toFixed(2);
                  const senderName =
                    newTip.senderUsername || newTip.from.slice(0, 8) + "...";

                  new Notification("💰 New Tip Received!", {
                    body: `You received $${usdAmount} from ${senderName}`,
                    icon: newTip.imageUrl || "/favicon.ico",
                    tag: "tip-notification",
                    requireInteraction: false,
                  });
                }
              }
            }
          });
        },
        (error) => {
          console.error("❌ Tips listener error:", error);
          setRealtimeConnected(false);
        }
      );
    }

    if (currentUser.username) {
      const likesQuery = query(
        collection(db, "likes"),
        where("recipientUsername", "==", currentUser.username),
        orderBy("timestamp", "desc"),
        limit(REALTIME_LIMIT)
      );

      unsubscribeLikesRef.current = onSnapshot(
        likesQuery,
        (snapshot) => {
          setRealtimeConnected(true);

          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const likeData = change.doc.data();

              if (likeData.timestamp > listenStartTime) {
                const newLike: LikeNotification = {
                  id: `like-${likeData.memeId}-${likeData.timestamp}-${likeData.likerUsername}`,
                  type: "like",
                  memeId: likeData.memeId,
                  memeTitle: likeData.memeTitle || "Untitled",
                  imageUrl: likeData.memeImageUrl || "",
                  thumbnailUrl:
                    likeData.memeThumbnailUrl || likeData.memeImageUrl || "",
                  fileType: likeData.memeFileType || "image/jpeg",
                  from: likeData.likerUsername,
                  timestamp: likeData.timestamp,
                  likerUsername: likeData.likerUsername,
                };

                setNotifications((prev) => {
                  if (prev.some((n) => n.id === newLike.id)) return prev;
                  return [newLike, ...prev];
                });

                if (!isDropdownOpenRef.current) {
                  setUnreadCount((prev) => prev + 1);
                }

                if (
                  typeof window !== "undefined" &&
                  "Notification" in window &&
                  Notification.permission === "granted"
                ) {
                  const likerName = newLike.likerUsername || newLike.from;

                  new Notification("❤️ New Like!", {
                    body: `${likerName} liked your meme`,
                    icon: newLike.imageUrl || "/favicon.ico",
                    tag: "like-notification",
                    requireInteraction: false,
                  });
                }
              }
            }
          });
        },
        (error) => {
          console.error("❌ Likes listener error:", error);
          setRealtimeConnected(false);
        }
      );
    }

    return () => {
      if (unsubscribeTipsRef.current) unsubscribeTipsRef.current();
      if (unsubscribeLikesRef.current) unsubscribeLikesRef.current();
    };
  }, [currentUser?.walletAddress, currentUser?.username]);

  const fetchNotifications = useCallback(
    async (cursor: string | null = null, append: boolean = false) => {
      if (!currentUser) return;

      setLoading(true);

      try {
        const params = new URLSearchParams({
          limit: ITEMS_PER_PAGE.toString(),
        });

        if (currentUser.walletAddress) {
          params.append("wallet", currentUser.walletAddress);
        }

        if (currentUser.username) {
          params.append("username", currentUser.username);
        }

        if (cursor) {
          params.append("cursor", cursor);
        }

        const res = await fetch(`/api/notifications?${params.toString()}`);
        const data = await res.json();

        if (append) {
          setNotifications((prev) => [...prev, ...(data.notifications || [])]);
        } else {
          setNotifications(data.notifications || []);
          if (data.unreadCount !== undefined) {
            setUnreadCount(data.unreadCount);
          }
          if (data.clickedNotifications) {
            setServerClickedNotifications(new Set(data.clickedNotifications));
          }
        }

        setHasMore(data.hasMore || false);
        setNextCursor(data.nextCursor || null);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    },
    [currentUser]
  );

  useEffect(() => {
    if (!currentUser || initialLoadRef.current) return;

    fetchNotifications(null, false);
    initialLoadRef.current = true;
  }, [currentUser, fetchNotifications]);

  const getNotificationId = (notification: Notification): string => {
    return notification.id;
  };

  const isNotificationClicked = (notification: Notification): boolean => {
    return serverClickedNotifications.has(getNotificationId(notification));
  };

  const loadMoreNotifications = useCallback(() => {
    if (loading || !hasMore || !nextCursor) return;

    fetchNotifications(nextCursor, true);
  }, [loading, hasMore, nextCursor, fetchNotifications]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLUListElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

      if (scrollHeight - scrollTop <= clientHeight + 50) {
        loadMoreNotifications();
      }
    },
    [loadMoreNotifications]
  );

  const handleDropdownToggle = async () => {
    if (open) {
      setOpen(false);
      isDropdownOpenRef.current = false;
    } else {
      setOpen(true);
      isDropdownOpenRef.current = true;

      if (!initialLoadRef.current) {
        fetchNotifications(null, false);
      }

      if (currentUser && unreadCount > 0) {
        setUnreadCount(0);

        try {
          const userDocId =
            currentUser.walletAddress ||
            currentUser.username ||
            currentUser.uid;
          await updateDoc(doc(db, "users", userDocId), {
            lastReadNotifications: serverTimestamp(),
          });
        } catch (error) {
          console.error("Error marking notifications as read:", error);
        }
      }
    }
  };

  

  const handleNotificationClick = async (notification: Notification) => {
    const notificationId = getNotificationId(notification);

    const newClickedNotifications = new Set(serverClickedNotifications);
    newClickedNotifications.add(notificationId);
    setServerClickedNotifications(newClickedNotifications);

    try {
      const userDocId =
        currentUser?.walletAddress || currentUser?.username || currentUser?.uid;
      if (userDocId) {
        await updateDoc(doc(db, "users", userDocId), {
          clickedNotifications: arrayUnion(notificationId),
        });
      }
    } catch (error) {
      console.error("Error marking notification as clicked:", error);
      setServerClickedNotifications(serverClickedNotifications);
    }
  };

  const formatUsdAmount = (solAmount: number, priceAtSend: number): string => {
    const usd = solAmount * priceAtSend;
    return `$${usd.toFixed(2)}`;
  };

  const renderNotificationContent = (notification: Notification) => {
    if (notification.type === "tip") {
      return (
        <>
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
            <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-400" />
            </div>
          </div>
          <div className="flex items-start gap-3 pl-8">
            <MemeThumbnail
              imageUrl={notification.imageUrl}
              thumbnailUrl={notification.thumbnailUrl}
              fileType={notification.fileType}
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium">
                Received{" "}
                {formatUsdAmount(notification.amount, notification.priceAtSend)}{" "}
                from{" "}
                {notification.senderUsername ||
                  notification.from.slice(0, 8) + "..."}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {formatDistanceToNow(new Date(notification.timestamp), {
                  addSuffix: true,
                })}
              </div>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
          <div className="w-6 h-6 bg-pink-500/20 rounded-full flex items-center justify-center">
            <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
          </div>
        </div>
        <div className="flex items-start gap-3 pl-8">
          <MemeThumbnail
            imageUrl={notification.imageUrl}
            thumbnailUrl={notification.thumbnailUrl}
            fileType={notification.fileType}
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium">
              {notification.likerUsername || notification.from} liked your meme
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {formatDistanceToNow(new Date(notification.timestamp), {
                addSuffix: true,
              })}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={handleDropdownToggle}
        className="md:p-2 cursor-pointer lg:bg-transparent rounded-full lg:hover:bg-[#86EFAC]/30 transition relative"
      >
        <Bell className="w-6 h-6 text-gray-300 lg:hover:text-[#86EFAC]" />

        {/* <div 
          className={`absolute -top-0.5 -left-0.5 w-2 h-2 rounded-full ${
            realtimeConnected ? 'bg-green-500' : 'bg-yellow-500'
          }`} 
          title={realtimeConnected ? 'Real-time connected' : 'Connecting...'}
        /> */}

        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1.5 lg:-right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </button>

      {open && (
        <div className="fixed bottom-16 lg:top-[75px] left-0 lg:left-auto lg:right-0 w-[350px] h-[500px] 2xl:w-[500px] 2xl:h-[650px] bg-[#0c1219] shadow-lg rounded-sm border border-gray-700 z-50 flex flex-col">
          <div className="pl-3 text-gray-200 font-medium border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Notifications</span>
              {/* {realtimeConnected ? (
                <span className="text-xs text-green-400">● Live</span>
              ) : (
                <span className="text-xs text-yellow-400">● Connecting...</span>
              )} */}
            </div>
            <button
              onClick={() => {
                setOpen(false);
                isDropdownOpenRef.current = false;
              }}
              className="p-3 rounded-full hover:bg-blue-500/20 transition-colors"
              aria-label="Close notifications"
            >
              <X className="w-6 h-6 text-gray-400 hover:text-blue-400" />
            </button>
          </div>

          {notifications.length > 0 ? (
            <ul
              ref={scrollRef}
              className="flex-1 overflow-y-auto"
              onScroll={handleScroll}
            >
              {notifications.map((notification, idx) => (
                <li
                  key={`${notification.id}-${idx}`}
                  className="border-b border-gray-700 last:border-b-0"
                >
                  <Link
                    scroll={false}
                    href={
                      notification.type === "like"
                        ? `/Meme/${notification.memeId}`
                        : `/TransactionsData/${notification.memeId}`
                    }
                    onClick={() => handleNotificationClick(notification)}
                    className={`block w-full text-left p-3 text-sm text-gray-200 cursor-pointer hover:bg-blue-500/5 relative ${
                      !isNotificationClicked(notification)
                        ? "bg-blue-500/10"
                        : ""
                    }`}
                  >
                    {!isNotificationClicked(notification) && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}

                    {renderNotificationContent(notification)}
                  </Link>
                </li>
              ))}

              {loading && (
                <li className="p-3 text-center text-gray-400 text-sm">
                  Loading more...
                </li>
              )}

              {!hasMore && notifications.length > 0 && (
                <li className="p-3 text-center text-gray-500 text-xs">
                  No more notifications
                </li>
              )}
            </ul>
          ) : loading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Loading notifications...
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              No notifications yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
