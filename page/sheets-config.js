// =====================================================
// 구글 시트 연동 설정
// =====================================================
//
// 1. 구글 시트에 두 개의 탭(시트)을 만드세요:
//    - "Products" : 제품 목록 (id, name, price, image, instagram)
//    - "Content"  : 사이트 텍스트 (key, value)
//
// 2. 시트 우측 상단 [공유] → 일반 액세스
//    "링크가 있는 모든 사용자: 뷰어" 로 설정
//
// 3. 시트 URL을 아래 SHEET_URL에 그대로 붙여넣기
//
// 4. 자세한 가이드와 사용 가능한 콘텐츠 키 목록은
//    page/admin.html 에서 확인 가능
//
// 비워두면("") 시트 연동 비활성화 → products.js의 기본값 사용
// =====================================================

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1kcL1v7mwXSgAdhkm03Zwm6zDUlXwcK8vplIV-PFFXD4/edit?gid=0#gid=0';
