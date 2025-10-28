'use client'

import dynamic from 'next/dynamic'

const CanvasStage = dynamic(() => import('./CanvasStage'), {
  ssr: false,
  loading: () => <div className="w-full " />
})

export default CanvasStage