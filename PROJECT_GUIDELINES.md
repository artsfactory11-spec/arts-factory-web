# Arts Factory Renewal: 프로젝트 운영 지침 & 로드맵 (개정판)

이 문서는 `artsfactory.co.kr` 사이트 분석 결과를 바탕으로 고도화된 Arts Factory 재구축 프로젝트의 마스터 가이드입니다.

## 1. 기술 스택 개요
- **Frontend:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Framer Motion (프리미엄 애니메이션)
- **Database:** MongoDB Atlas (Mongoose)
- **Storage:** Firebase Storage (이미지 및 파일 저장)
- **Deployment:** Vercel

## 2. 핵심 운영 로직 및 데이터 구조

### 확장된 작품 정보 (Artwork Schema)
실제 아트 갤러리 운영에 필요한 상세 필드를 반영하였습니다:
- **기본 정보:** 제목, 작가(User 참조), 카테고리, 설명
- **상세 정보:** 호수/크기(`size`), 제작연도(`year`), 재료(`material`)
- **가격 시스템:** 판매가(`price`) 및 월 대여료(`rental_price`) 이원화
- **메타 정보:** 추천 계절(`season`), 추천 공간(`space`)

### 이미지 관리 (성능 우선)
- **업로드 흐름:** `browser-image-compression`을 통해 클라이언트 단에서 1MB 미만으로 압축 후 Firebase 전송.
- **이미지 제공:** Next.js `<Image />`를 사용하여 디바이스별 최적 리사이징 및 LCP(Largest Contentful Paint) 최적화.

### 관리 시스템 (콘텐츠 거버넌스)
- **승인 프로세스:** `status: 'pending'`(대기), `'approved'`(승인), `'rejected'`(거절) 관리.
- **큐레이션:** `isCurated` 플래그를 통해 메인 페이지 강조 작품 설정.
- **데이터 활용:** 전체 도록 데이터를 엑셀(Excel)로 추출하여 전시 기획 및 재고 관리에 활용.

## 3. SEO 및 검색 최적화
- **동적 SEO:** 각 작품 상세 페이지(`/artwork/[id]`)별 자동 메타데이터 생성.
- **공유 최적화:** 카카오톡, 인스타그램 등 SNS 공유 시 작품 썸네일과 작가 정보가 아름답게 노출되도록 OG 태그 구성.

## 4. 향후 확장 로드맵
1. **NextAuth 인증:** 작가별 개별 포트폴리오 관리 권한 부여.
2. **결제 모듈:** 토스페이먼츠/포트원 연동을 통한 렌탈 결제 자동화.
3. **VR 갤러리:** 작품을 가상 공간에 배치해보는 인터랙티브 기능 추가.

---
*Created by Antigravity for Arts Factory*
