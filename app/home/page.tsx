"use client";

import React from 'react'
import { useRouter } from 'next/navigation'
const page = () => {
  const router = useRouter();
  return (
    <div>
      <p>No camera found</p>
      <button onClick={() => router.push('/')}>Return</button>
    </div>
  )
}

export default page