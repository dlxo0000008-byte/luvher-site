# 연려 LUV HER

브랜드 사이트 — 정적 HTML/CSS/JS + Google Sheets 연동 (백엔드 없음).

---

## 📁 프로젝트 구조

```
문영환/
├── index.html              ← 진입 페이지 (필수: 이름 변경 금지)
├── 404.html                ← 404 페이지 (Cloudflare Pages 자동 사용)
├── robots.txt              ← 검색엔진 크롤링 규칙
├── README.md               ← 이 문서
└── page/
    ├── style.css           ← 전체 스타일
    ├── main.js             ← 메인 페이지 스크립트
    ├── products.js         ← 상품 데이터 (현재 비어있음, 시트로 관리)
    ├── sheets.js           ← Google Sheets fetch 로직
    ├── sheets-config.js    ← 시트 URL
    ├── admin.html          ← 관리자 페이지 (URL 직접 입력으로만 접근)
    ├── admin.css
    ├── admin.js
    ├── logo_mark.png       ← 헤더 마크 + 파비콘
    ├── logo_hero.png       ← 메인 한자 로고
    └── luv_her_text.png    ← Luv Her 스크립트 로고 (메인 + 푸터)
```

---

## 🌐 배포 가이드 (가비아 도메인 + Cloudflare Pages)

### STEP 1 — 가비아에서 도메인 결제 ✅ 완료
- 구매 도메인: **luvher.kr**
- WHOIS 정보 보호 체크 추천 (무료)

### STEP 2 — GitHub에 업로드
1. https://github.com 가입
2. **New repository** → 이름 `luvher-site` (Public/Private 무관)
3. **uploading an existing file** 클릭
4. `문영환` 폴더 **내용물 전체** 드래그 (이 README 포함, 폴더 자체는 X)
5. **Commit changes**

### STEP 3 — Cloudflare Pages 배포
1. https://dash.cloudflare.com 가입
2. **Workers & Pages → Create → Pages → Connect to Git**
3. GitHub 인증 → 저장소 선택
4. 빌드 설정:
   - Framework preset: **None**
   - Build command: **(비움)**
   - Build output directory: `/`
5. **Save and Deploy** → 1~2분 후 `xxxx.pages.dev` 임시 주소 발급

### STEP 4 — 도메인 연결 (luvher.kr)
**Cloudflare Pages에서:**
- 프로젝트 → **Custom domains** → **Set up a custom domain** → `luvher.kr` 입력
- 그리고 한 번 더 추가 → `www.luvher.kr` 입력
- 안내되는 CNAME/A 레코드 값 복사

**가비아에서 (My가비아 → 서비스관리 → 도메인 → DNS 관리):**
| 타입 | 호스트 | 값 | TTL |
|---|---|---|---|
| CNAME | @ | `xxxx.pages.dev` | 600 |
| CNAME | www | `xxxx.pages.dev` | 600 |

> ⚠️ 가비아 .kr은 루트(@)에 CNAME 입력이 막힌 경우가 많습니다.
> 그럴 땐 Cloudflare가 안내하는 **A 레코드 IP 2개**를 입력하세요:
>
> | 타입 | 호스트 | 값 |
> |---|---|---|
> | A | @ | (Cloudflare가 알려주는 IP 1) |
> | A | @ | (Cloudflare가 알려주는 IP 2) |
> | CNAME | www | `xxxx.pages.dev` |

### STEP 5 — 완료
- 10분 ~ 24시간 후 도메인 접속 가능
- HTTPS 자동 발급
- https://dnschecker.org 에서 전파 확인

---

## ✏️ 콘텐츠/상품 수정 방법

### Google Sheets로 관리
- 시트 URL은 `page/sheets-config.js`의 `SHEET_URL`에 등록
- 두 개의 탭 필요: `Products` / `Content`
- 자세한 가이드: 사이트 배포 후 `https://도메인/page/admin.html` 접속

### 직접 코드 수정
- 텍스트/구조 변경: `index.html`
- 디자인: `page/style.css`
- 상품 fallback 데이터: `page/products.js`

GitHub에 푸시하면 Cloudflare Pages가 자동 재배포.

---

## 🔐 보안 메모

- `page/admin.html`은 사이트 내 어디에도 링크되어 있지 않음 (URL 직접 입력 시에만 접근)
- `robots.txt`로 검색엔진 색인 차단됨
- 더 강한 보호가 필요하면 **Cloudflare Access** 무료 플랜으로 IP/이메일 제한 가능

---

## 💸 운영 비용

| 항목 | 비용 |
|---|---|
| 가비아 .kr 도메인 | 첫해 11,000원 / 이후 22,000원/년 |
| Cloudflare Pages 호스팅 | 무료 |
| SSL 인증서 | 무료 (자동) |
| GitHub | 무료 |

**첫해 11,000원, 이후 매년 22,000원**
