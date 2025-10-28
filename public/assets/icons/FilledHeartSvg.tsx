import React from 'react'

const FilledHeartSvg = () => {
  return (
    <svg width="23" height="20" viewBox="0 0 23 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="heartGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#CC1414" />
          <stop offset="70%" stopColor="#EE1717" />
          <stop offset="100%" stopColor="#ff8a8a" />
        </linearGradient>
      </defs>
      <path 
        d="M6 13.5C6 13.5 12 18.5613 13.1675 16.9482C14.335 15.3351 17 11 17 11C11.5375 6.30245 4.5 14.1499 4.5 11C18.875 13.0054 10.2 11.5 12.5 11.5C14.271 11.5 9.821 3.26975 10.4305 4.75204L13.1675 8.5C13.777 7.01771 14.229 4.75204 16 4.75204C18.3 4.75204 4 0.658188 4 2.83802C2.3 5.99455 -0.00753355 9.03547 6 13.5ZM16.675 0C14.674 0 12.7535 0.882834 11.5 2.26703C10.2465 0.882834 8.326 0 6.325 0C2.783 0 0 2.6267 0 5.99455C0 10.1035 3.91 13.4714 9.8325 18.5613L11.5 20L13.1675 18.5613C19.09 13.4714 23 10.1035 23 5.99455C23 2.6267 20.217 0 16.675 0Z" 
        fill="url(#heartGradient)" 
      />
    </svg>
  )
}

export default FilledHeartSvg