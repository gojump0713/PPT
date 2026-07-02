# 영남이공대학교 AX Native Campus 구축 시 기대 효과

**PPT처럼 장표 단위로 발표하되, 웹사이트처럼 스크롤·패럴랙스·줌·3D·커튼 전환 효과를 적용한 HTML 기반 몰입형 발표 슬라이드.**

틸론 × 영남이공대학교 제안서(30페이지)를 정적 HTML/CSS/Vanilla JS 만으로 재구성한 인터랙티브 발표 자료입니다. 서버 없이 `index.html` 하나로 실행되며 GitHub Pages 로 바로 배포됩니다.

## 실행

```bash
# 정적 파일이라 그냥 열어도 되지만, 폰트/이미지 로딩을 위해 로컬 서버 권장
npx serve .
# 또는
python -m http.server 8000
```

브라우저에서 열고 **F** 키로 발표(전체화면) 모드를 시작하세요.

## 발표 조작

| 키 | 동작 |
|----|------|
| `↓` `→` `Space` `PageDown` | 다음 슬라이드 |
| `↑` `←` `PageUp` | 이전 슬라이드 |
| `Home` / `End` | 처음 / 마지막 |
| `F` | 발표(전체화면) 모드 |
| `O` | 목차(개요) 보기 |
| `?` | 도움말 |

마우스 휠·터치 스와이프·우측 도트 네비게이션·URL 해시(`#slide-3`)도 지원합니다.

## 전환 효과 (F-05)

`data-effect` 속성으로 슬라이드별 지정: `fade` · `curtain` · `parallax` · `zoom` · `tilt3d`.
내부 요소는 `data-animate`(`fade-up`/`fade-in`/`zoom-in` 등) + `data-delay`로 순차 등장합니다.

## 구조

```
index.html    발표 셸(deck 컨테이너 + UI 크롬)
styles.css    디자인 시스템 · 5종 전환 효과 · 레이아웃 컴포넌트
slides.js     30개 슬라이드 데이터 + 레이아웃 렌더러 (콘텐츠 수정은 여기서)
script.js     런타임(스크롤 스냅 · 키보드 · IntersectionObserver · 발표 모드 등)
assets/img/   학과 일러스트 · 로고
```

콘텐츠를 바꾸려면 `slides.js` 의 `SLIDES` 배열만 수정하면 됩니다. (비개발자도 텍스트 교체 가능)

## 슬라이드 구성 (30면)

1. 표지 · 2. 종합 제안 · 3. 제안의 핵심(AI=인프라) · 4. 4 Pillars · 5. Solution Architecture · 6. Strategic Alignment · 7. 5대 혁신지수 · 8. AI Native Campus 구현 · 9. 차별없는 교육환경(KEDI) · 10. 전 학과 X+AI · 11. 취업·창업 경쟁력 · 12. 글로벌·평생교육 Hub · 13. 신기술 인재 거점 · 14. 세계 명문의 선택 · 15. 운영 효율 & ESG · 16. [챕터] 학과별 혁신 · 17. 전공 학과 현황 · 18–20. 학과별 교육방식 변화 ①②③ · 21. 교육 운영 루프 · 22–23. 학생 라이프스타일 ①② · 24–25. 교수 라이프스타일 ①② · 26. 정량 기대효과 · 27. 6대 전략적 가치 · 28. [챕터] 설문조사 · 29–30. 서강대 설문 결과 ①②

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)
