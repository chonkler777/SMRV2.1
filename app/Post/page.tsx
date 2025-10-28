'use client'


import React from 'react' 
import PostEditor from '@/components/PostEvents/PostEditor'

const page = () => {
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className='text-white '>
        {/* Post Page */}
        <PostEditor/>
      </div>
    </div>
  )
}

export default page
