---
version: 1
slug: "src-layouts-dashboardlayout-tsx"
primary_target: "src/layouts/DashboardLayout.tsx"
related_targets: ["src/pages/dashboard/Home.tsx","src/pages/Tablet.tsx","src/pages/TV.tsx"]
---

# Surface brief: dashboard, tablet, TV

Scope: `/dashboard/*`, `/tablet`, `/tv`. Visitor mode: Operate.

Audience and job: 기관 관리자와 요양보호사가 출석을 체크하고 세션을 송출·제어하고 어르신 상태를 살핀다.
Constraints: 사용자가 Linear·Notion을 기준으로 지정했다. 스케치 4종을 거절한 이유는 촌스러움, 박스 과다, 과한 색, 시각 요소 부족이다.

## Direction contract

THESIS: 정교한 업무 도구. 카드 상자를 쌓는 대시보드 대신, 흰 종이 위에 가는 선과 여백으로 나뉜 하나의 문서처럼 읽히는 관제 화면.

OWN-WORLD: 흰 바탕과 아주 옅은 회색 사이드바, 가는 구분선, Pretendard 13~14px 본문, 차분한 파랑 하나. 상태는 원형 상태 아이콘(빈 원, 채워지는 원, 체크)으로 말한다. 이름 옆 모노그램 아바타, 페이지 상단 커버 사진, 면이 채워진 추이 차트가 시각 요소다.

STORY: 들어오면 다음 세션과 출석이 먼저 보이고, 한 번의 클릭으로 세션을 시작하며, 살펴볼 어르신과 일정이 그 아래 목록으로 이어진다.

FIRST VIEWPORT: 왼쪽 244px 사이드바(기관명, 내비, 하드웨어, 세션 상태). 본문 맨 위에 커버 사진 띠와 페이지 제목. 그 아래 왼쪽에 다음 세션 시각과 4단계 스테퍼, 주요 버튼. 오른쪽에 스마트 TV 미리보기.

FORM: 사용자가 지정한 분야 표준(Linear·Notion). 주사위 배정 대신 사용자의 지정을 따름. seed:e3a26ad8dc32d5d3

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
