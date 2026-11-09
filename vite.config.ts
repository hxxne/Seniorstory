import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages는 사이트를 /<저장소 이름>/ 아래에 올립니다. 배포 워크플로가 VITE_BASE로 그 경로를 넘깁니다.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
})
