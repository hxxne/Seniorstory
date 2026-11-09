import { appUrl } from './asset'
import { markOnboarding } from './store'

/** 하드웨어 화면을 별도 창으로 띄우는 원클릭 런처 */

const open = (path: string, name: string, w: number, h: number) => {
  const left = Math.max(0, Math.round((window.screen.width - w) / 2))
  const top = Math.max(0, Math.round((window.screen.height - h) / 2))
  const win = window.open(
    appUrl(path),
    name,
    `popup=yes,width=${w},height=${h},left=${left},top=${top}`,
  )
  win?.focus()
  return win
}

export const openTv = () => {
  markOnboarding('tv')
  return open('/tv', 'seniorstory-tv', 1280, 720)
}
export const openTablet = () => {
  markOnboarding('tablet')
  return open('/tablet', 'seniorstory-tablet', 1024, 768)
}
