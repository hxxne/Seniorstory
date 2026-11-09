/** public 폴더의 파일 경로. 사이트가 하위 경로(/Seniorstory/)에 배포돼도 맞게 붙습니다. */
export const asset = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, '')

/** 라우터 경로를 전체 주소로 (새 창을 띄울 때) */
export const appUrl = (path: string) => window.location.origin + import.meta.env.BASE_URL.replace(/\/$/, '') + path
