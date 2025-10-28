
export function getTimestampMs(timestamp: any): number {
    if (!timestamp) return 0;
    
    
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? 0 : date.getTime();
    }
    

    if (timestamp && typeof timestamp === 'object') {

      if ('toMillis' in timestamp && typeof timestamp.toMillis === 'function') {
        return timestamp.toMillis();
      }
      
      if ('seconds' in timestamp && typeof timestamp.seconds === 'number') {
        return timestamp.seconds * 1000;
      }

      if ('toDate' in timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().getTime();
      }
    }

    if (typeof timestamp === 'number') {
      if (timestamp < 10000000000) {
        return timestamp * 1000;
      }
      return timestamp;
    }
    
    return 0; 
  }
  

  export function timestampToDate(timestamp: any): Date {
    const ms = getTimestampMs(timestamp);
    return new Date(ms);
  }
  

  export function formatRelativeTime(timestamp: any): string {
    const ms = getTimestampMs(timestamp);
    if (ms === 0) return 'Unknown time';
    
    const now = Date.now();
    const diffInSeconds = Math.floor((now - ms) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? 'min' : 'mins'} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hr' : 'hrs'} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} ${diffInWeeks === 1 ? 'wk' : 'wks'} ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      if (diffInMonths === 0) return `${diffInWeeks} ${diffInWeeks === 1 ? 'wk' : 'wks'} ago`;
      return `${diffInMonths} ${diffInMonths === 1 ? 'mon' : 'mons'} ago`;
    }
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} ${diffInYears === 1 ? 'yr' : 'yrs'} ago`;
  }
  

  export function formatExactDate(timestamp: any): string {
    const date = timestampToDate(timestamp);
    if (date.getTime() === 0) return 'Unknown date';
    
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  

  export function getWeekDiff(timestamp: any): number {
    const ms = getTimestampMs(timestamp);
    if (ms === 0) return Infinity;
    
    const now = Date.now();
    const diffInMs = now - ms;
    return Math.floor(diffInMs / (7 * 24 * 60 * 60 * 1000));
  }