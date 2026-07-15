# Cocktail

TheCocktailDB API를 활용한 칵테일 탐색 React 앱

## 주요 기능

- 칵테일 검색
- 재료 기반 필터링
- 무한 스크롤로 칵테일 목록 탐색
- 북마크(마이바) 기능
- 기본적인 네비게이션 및 뷰 전환

## 사용 기술

- React
- Vite
- TanStack React Query
- Axios
- Tailwind CSS
- react-intersection-observer

## 실행 방법

1. 의존성 설치
   ```bash
   npm install
   ```
2. 개발 서버 실행
   ```bash
   npm run dev
   ```
3. 브라우저에서 아래 주소로 접속
   ```text
   http://localhost:5173
   ```

## 빌드

```bash
npm run build
```

## 참고

- 칵테일 데이터는 TheCocktailDB API를 사용
- 북마크 정보는 브라우저의 localStorage에 저장
