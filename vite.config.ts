import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// 사이트는 medimove.co.kr의 맨 위 경로에 올라갑니다. 하위 경로에 올릴 일이 생기면 VITE_BASE로 넘깁니다.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
})
