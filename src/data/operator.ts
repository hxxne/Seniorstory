/**
 * 서비스를 운영하는 쪽의 정보. 개인정보 처리방침, 이용약관, 화면 아래쪽에 그대로 나옵니다.
 * 지어내지 않습니다. 비어 있는 값은 화면에 나오지 않고, name과 email이 비어 있으면 문의처 자리에 "준비 중"이라고 나옵니다.
 */
export const operator = {
  /** 상호 또는 운영자 이름 */
  name: 'Seniorstory (시니어스토리)',
  /** 대표자 이름 (사업자인 경우) */
  representative: '최민혁',
  /** 사업자등록번호 (사업자인 경우) */
  businessNumber: '',
  /** 사업장 주소 (사업자인 경우) */
  address: '',
  /** 문의와 개인정보 요청을 받는 이메일 */
  email: 'minhappy0916@khu.ac.kr',
  /** 전화 (선택) */
  phone: '010-4650-5747',
  /** 개인정보 보호책임자. 비우면 운영자 이름을 씁니다 */
  privacyOfficer: '최민혁',
}

/** 처리방침과 약관을 마지막으로 고친 날 */
export const POLICY_DATE = '2026년 11월 22일'

export const operatorReady = operator.name !== '' && operator.email !== ''
