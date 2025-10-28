// app/components/ConditionalTopLoader.tsx
"use client";

import NextTopLoader from "nextjs-toploader";

export default function ConditionalTopLoader() {
  return (
    <>
      <style jsx global>{`
        /* Hide top loader on specific routes */
        body:has([data-route*="Meme"]) #nprogress,
        body:has([data-route*="TransactionsData"]) #nprogress {
          display: none !important;
        }
      `}</style>
      <NextTopLoader
        color="#86EFAC"
        height={3}
        showSpinner={false}
        shadow="0 0 10px #86EFAC,0 0 5px #86EFAC"
      />
    </>
  );
}