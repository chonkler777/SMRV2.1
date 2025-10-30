'use client'

import React, { useRef } from 'react'
import PostEditor from '@/components/PostEvents/PostEditor'
import { useRouter } from 'next/navigation'
import PostDismiss from '@/public/assets/icons/PostDismiss'
import { toast } from 'react-toastify'

const Page = () => {
  const router = useRouter()
  const cancelUploadRef = useRef<(() => void) | null>(null) // ✅ Add ref

  const handleClose = () => {
    // ✅ Cancel upload if ongoing
    if (cancelUploadRef.current) {
      cancelUploadRef.current()
      toast.info('Upload cancelled')
    }
    router.back()
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={handleClose} 
    >
      <div 
        className="relative " 
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose} 
          className="absolute top-3 right-3 cursor-pointer z-50"
          title="Close"
        >
          <PostDismiss/>
        </button>

        <div className="max-h-[90vh] overflow-y-auto rounded-[16px]">
          <PostEditor cancelUploadRef={cancelUploadRef} /> 
        </div>
      </div>
    </div>
  )
}

export default Page