/**
 * 세션 시계. 기기마다 시계가 조금씩 달라서, 다른 기기와 연결되면
 * 서버 시각과의 차이를 받아 두고 모든 기기가 같은 시각을 쓰게 합니다.
 */
let offset = 0

export const now = () => Date.now() + offset

export const setClockOffset = (ms: number) => {
  offset = ms
}
