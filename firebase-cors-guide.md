# Firebase Storage CORS 해결 가이드

현재 발생하고 있는 에러(`CORS error`, `Preflight 404`)는 Firebase Storage 서버에서 외부 도메인(localhost 등)의 접근을 허용하지 않거나 버킷 설정이 프로젝트와 다를 때 발생합니다. 아래 단계를 따라 해결해 주세요.

## 1. `.env.local` 파일 확인 (가장 중요)
`.env.local` 파일에서 `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` 값이 정확한지 확인해 주세요.
- **올바른 예:** `artfactory-20ba7.firebasestorage.app` 또는 `artfactory-20ba7.appspot.com`
- **잘못된 예:** `gs://artfactory-20ba7...` (앞에 `gs://`가 붙으면 안 됩니다.)

## 2. Firebase Storage CORS 설정 (서버 설정)
웹 브라우저에서 파일을 업로드하려면 Firebase 프로젝트에 CORS 설정이 필요합니다.

### 방법 A: 간단한 방법 (콘솔 사용 불가, CLI 필요)
1. 아래 내용으로 `cors.json` 파일을 만듭니다 (이미 아래에 생성해 두었습니다).
2. 터미널(CMD 또는 PowerShell)에서 다음 명령어를 실행합니다.
   ```bash
   gsutil cors set cors.json gs://<여러분의-버킷-이름>
   ```
   *참고: `gsutil`은 [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)가 설치되어 있어야 사용 가능합니다.*

### 방법 B: Google Cloud Console 이용 (CLI가 없는 경우)
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속합니다.
2. 해당 프로젝트를 선택하고 **Cloud Storage** -> **버킷(Buckets)** 메뉴로 이동합니다.
3. 해당 버킷을 선택하고 **[권한(Permissions)]** 탭에서 **CORS** 설정을 확인하거나, 브라우저에서 직접 업로드가 가능하도록 설정을 추가해야 합니다. (보통 CLI 방법이 권장됩니다.)

---

## 생성된 cors.json 파일 내용
프로젝트 루트 디렉토리에 이 파일을 저장하고 위 명령어를 실행하세요.

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```
