'use client'


import { Timestamp } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

export const useDateFormatter = () => {

  const formatExactDate = (timestamp: any): string => {
    if (!timestamp) return "Unknown date";

    let date: Date;
    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) return "Invalid date";

    const day = date.getDate().toString().padStart(2, "0");
    const month = date
      .toLocaleDateString("en-US", { month: "short" })
      .toLowerCase();
    const year = date.getFullYear();

    return `${day}, ${month} ${year}`;
  };


  const formatRelativeTime = (timestamp: any): string => {
    if (!timestamp) return "<1m";

    let date: Date;
    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) return "Invalid date";

    return formatDistanceToNow(date, { addSuffix: true })
      .replace("about ", "")
      .replace("less than a minute", "<1m")
      .replace("1 minute", "1min")
      .replace(" hours", "hrs")
      .replace(" minutes", "mins")
      .replace(" seconds", "sec")
      .replace(" days", "d")
      .replace(" months", "mon")
      .replace(" years", "yr")
      .replace(" weeks", "w");
  };

  return {
    formatExactDate,
    formatRelativeTime,
  };
};