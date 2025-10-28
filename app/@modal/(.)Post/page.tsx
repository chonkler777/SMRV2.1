'use client'

import React from 'react'
import PostEditor from '@/components/PostEvents/PostEditor'
import { useRouter } from 'next/navigation'
import PostDismiss from '@/public/assets/icons/PostDismiss'

const Page = () => {
  const router = useRouter()

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={() => router.back()}
    >
      <div 
        className="relative " 
        onClick={(e) => e.stopPropagation()}
      >

        <button
          onClick={() => router.back()}
          className="absolute top-3 right-3 cursor-pointer z-50"
          title="Close"
        >
          <PostDismiss/>
        </button>


        <div className="max-h-[90vh] overflow-y-auto rounded-[16px]">
          <PostEditor/>
        </div>

      </div>
    </div>
  )
}

export default Page