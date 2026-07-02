/* =========================================================================
   slides.js — content model + layout renderers for all 30 pages
   Each slide = { num, id, title, effect, theme, wide, layout, ...data }
   A layout renderer returns the innerHTML of .slide-content.
   Optional slide.bg(): background layer HTML.  slide.curtain: adds curtain panels.
   ========================================================================= */
(function () {
  "use strict";

  /* ---- inline icon set ---------------------------------------------------- */
  const I = {
    health: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h4l2 5 4-12 2 7h6"/></svg>',
    chip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="7" width="10" height="10" rx="1"/><path d="M10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3"/></svg>',
    building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 21V5l8-3 8 3v16M9 21v-5h6v5"/><path d="M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01"/></svg>',
    brush: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20s2-6 8-6M14 14l6-9a2 2 0 00-3-2l-7 8"/></svg>',
    food: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3v18M5 11h4V3M9 3v8M15 3c-1.5 0-2 2-2 5s.5 4 2 4 2-1 2-4-.5-5-2-5zM15 12v9"/></svg>',
    heartHand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 8.5a3 3 0 00-5.2-2A3 3 0 009.6 8.5c0 3 4.4 6 5.2 6.5.8-.5 5.2-3.5 5.2-6.5z"/><path d="M3 21l4-1 3 1"/></svg>',
    grad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 8l10-4 10 4-10 4z"/><path d="M6 10v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2h8l4 4v16H6z"/><path d="M9 12h6M9 16h6M9 8h2"/></svg>',
    handshake: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 11l3 3 5-5 3 2M2 12l4-4 4 3M14 9l3-3 5 4"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>',
    briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5a2 2 0 012-2h12v18H6a2 2 0 01-2-2z"/><path d="M4 17h14"/></svg>',
    plane: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 3l11 9-11 9-1-6-6-3 6-3z"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4l6 6-11 11H3v-6z"/></svg>',
    monitor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20h8M12 16v4"/></svg>',
    ai: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12l3 3 5-6"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  };

  /* ---- shared bits -------------------------------------------------------- */
  const anim = (t, d) => `data-animate="${t}"${d != null ? ` style="transition-delay:${d}ms"` : ""}`;
  /* AI-generated media background layer (image or looping video + veil) */
  const mediaBg = (src, o = {}) => {
    const el = o.video
      ? `<video src="${src}" autoplay muted loop playsinline preload="metadata" aria-hidden="true"></video>`
      : `<img src="${src}" alt="" loading="lazy" aria-hidden="true" />`;
    return `<div class="media-bg${o.cls ? ` ${o.cls}` : ""}">${el}</div>`;
  };
  const head = (s, opts = {}) =>
    `<div class="slide-head">
       ${s.eyebrow ? `<span class="eyebrow" ${anim("fade-right", 0)}>${s.eyebrow}</span>` : ""}
       <h2 class="stitle" ${anim("fade-up", s.eyebrow ? 90 : 0)}>${s.title}</h2>
       ${s.sub ? `<p class="ssub" ${anim("fade-up", 180)}>${s.sub}</p>` : ""}
     </div>`;
  const list = (b, from = 0, step = 90) =>
    `<ul class="bullets">${b.map((t, i) => `<li ${anim("fade-up", from + i * step)}>${t}</li>`).join("")}</ul>`;

  /* ---- gallery data (curated dept illustrations) -------------------------- */
  const GALLERY = [
    { f: "dept-nursing.png", l: "간호학과", c: "보건의료" },
    { f: "dept-physio.png", l: "물리치료과", c: "보건의료" },
    { f: "dept-dental.png", l: "치위생과", c: "보건의료" },
    { f: "dept-software.png", l: "소프트웨어융합과", c: "IT·반도체·기계" },
    { f: "dept-security.png", l: "사이버보안과", c: "IT·반도체·기계" },
    { f: "dept-semicon.png", l: "ICT반도체전자계열", c: "IT·반도체·기계" },
    { f: "dept-ecar.png", l: "스마트e-자동차과", c: "IT·반도체·기계" },
    { f: "dept-arch.png", l: "건축학과", c: "건축·생활" },
    { f: "dept-chem.png", l: "화장품화공계열", c: "건축·생활" },
    { f: "dept-visual.png", l: "시각영상디자인과", c: "디자인·콘텐츠" },
    { f: "dept-webtoon.png", l: "웹툰과", c: "디자인·콘텐츠" },
    { f: "dept-game.png", l: "게임애니메이션과", c: "디자인·콘텐츠" },
    { f: "dept-culinary.png", l: "글로벌외식조리과", c: "외식·뷰티·서비스" },
    { f: "dept-kbeauty.png", l: "K-뷰티과", c: "외식·뷰티·서비스" },
    { f: "dept-hair.png", l: "박승철헤어과", c: "외식·뷰티·서비스" },
    { f: "dept-pethealth.png", l: "반려동물보건과", c: "외식·뷰티·서비스" },
    { f: "dept-welfare.png", l: "사회복지학과", c: "복지·경영·국제" },
    { f: "dept-biz.png", l: "i-경영·회계계열", c: "복지·경영·국제" },
  ];

  /* =======================================================================
     LAYOUT RENDERERS
     ======================================================================= */
  const L = {
    /* 1. cover ------------------------------------------------------------ */
    cover: (s) => `
      <div class="cover">
        <div class="kicker" ${anim("fade-down", 0)}>TILON × YEUNGNAM UNIVERSITY COLLEGE</div>
        <h1 ${anim("fade-up", 120)}>영남이공대학교<br><span class="en grad">AX Native Campus</span><br>구축 시 기대효과</h1>
        <div class="lead" ${anim("fade-up", 320)}>VDI <span class="sep">·</span> GPU <span class="sep">·</span> Internal AI <span class="sep">·</span> Tstation <span class="sep">·</span> CBT 통합 기반</div>
        <div class="lead2" ${anim("fade-up", 420)}>미래가치 1등 직업교육대학 실행 인프라</div>
        <div class="cta" ${anim("fade-in", 640)}>
          <span class="scroll-hint"><span class="mouse"></span> 스크롤 또는 → 키로 시작하세요</span>
        </div>
      </div>`,

    /* 2 & 8. statement (eyebrow + big title + bullets + footer) ----------- */
    statement: (s) => `
      ${s.eyebrow ? `<span class="eyebrow" ${anim("fade-right", 0)}>${s.eyebrow}</span>` : ""}
      <h2 class="stitle" ${anim("fade-up", 100)}>${s.big}</h2>
      ${s.bullets ? list(s.bullets, 260, 110) : ""}
      ${s.footer ? `<p class="footnote" ${anim("fade-up", 260 + (s.bullets ? s.bullets.length : 0) * 110 + 120)}>${s.footer}</p>` : ""}`,

    /* 3. transform (Teaching AI -> Operating on AI) ---------------------- */
    transform: (s) => `
      ${head(s)}
      <div class="split" style="margin-top:4px;align-items:center;grid-template-columns:.85fr 1.15fr">
        <div>
          <div class="card" ${anim("fade-right", 200)} style="text-align:center">
            <div class="eyebrow" style="justify-content:center">TEACHING AI</div>
            <div style="font-size:clamp(17px,1.9vw,24px);font-weight:800;color:var(--muted)">AI를 <b style="color:#fff">가르치는</b> 대학</div>
            <div style="font-size:34px;color:var(--accent);margin:12px 0">↓</div>
            <div class="eyebrow" style="justify-content:center;color:var(--cyan)">OPERATING ON AI</div>
            <div style="font-size:clamp(17px,1.9vw,24px);font-weight:800">AI 인프라 <b class="hl">위에서 운영되는</b> 대학</div>
          </div>
          <div class="callout" ${anim("fade-up", 560)} style="margin-top:22px">
            <div class="big" style="font-size:clamp(15px,1.7vw,22px)">‘AI를 가르치는 대학’을 넘어<br><span class="hl">‘AI 인프라 위에서 모든 전공을 혁신하는 대학’</span>으로</div>
          </div>
        </div>
        <div class="side-visual side-visual--xl" ${anim("zoom-in", 320)}>
          <video class="fit-contain" src="assets/media/core-flow.mp4" autoplay muted loop playsinline preload="metadata" aria-label="VDI·GPU 코어에서 각 시스템으로 전류가 흐르는 통합 인프라 허브"></video>
          <div class="side-cap">VDI · GPU 코어에서 LMS · CBT · AI · 분석 · 운영으로 흐르는 데이터 전류</div>
        </div>
      </div>`,

    /* 4. quadrant (4 pillars) -------------------------------------------- */
    quadrant: (s) => `
      ${head(s)}
      <div class="quad">
        ${s.pillars.slice(0, 2).map((p, i) => pillar(p, 200 + i * 120)).join("")}
        <div class="core lift" ${anim("zoom-in", 160)}>AX Native<br>Campus Core</div>
        ${s.pillars.slice(2).map((p, i) => pillar(p, 440 + i * 120)).join("")}
      </div>
      ${s.footer ? `<p class="footnote plain" style="text-align:center;border:none;padding:0" ${anim("fade-up", 720)}>${s.footer}</p>` : ""}`,

    /* 5. flow (architecture layers, framed as one platform) --------------- */
    flow: (s) => `
      ${head(s)}
      <div class="flow-frame">
        <svg class="flow-frame__stroke" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true">
          <rect class="base" x="0.6" y="0.6" width="98.8" height="98.8" rx="3" ry="6" pathLength="100"/>
          <rect class="runner" x="0.6" y="0.6" width="98.8" height="98.8" rx="3" ry="6" pathLength="100"/>
        </svg>
        <span class="flow-frame__label">ONE PLATFORM · 한 몸으로 설계된 구조</span>
        <div class="flow">
          ${s.rows.map((r, i) => `
            <div class="flow-row" ${anim("fade-right", 200 + i * 130)}>
              <div><h3>${r.title}</h3><p>${r.desc}</p></div>
              <div class="flow-tags">${r.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
            </div>`).join("")}
        </div>
      </div>`,

    /* 6 & 18-20. table --------------------------------------------------- */
    table: (s) => `
      ${head(s)}
      <div class="table-wrap" ${anim("fade-up", 200)}>
        <table class="tbl">
          <thead><tr>${s.cols.map((c) => `<th>${c}</th>`).join("")}</tr></thead>
          <tbody>${s.rows.map((r) => `<tr>${r.map((c, i) =>
            `<td class="${i === 1 ? "sol" : i === s.cols.length - 1 && s.rvLast ? "rv" : ""}">${c}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
      </div>
      ${s.footer ? `<p class="footnote" ${anim("fade-up", 360)}>${s.footer}</p>` : ""}`,

    /* 7. index columns (5 혁신지수) -------------------------------------- */
    index5: (s) => `
      ${head(s)}
      <div class="idx5">
        ${s.items.map((it, i) => `
          <div class="idx-card" ${anim("fade-up", 200 + i * 100)}>
            <div class="ic">${I[it.icon]}</div>
            <h3>${it.title}</h3>
            <div class="bar-mini" style="margin-top:14px"><i style="--w:${it.w}%;transition-delay:${350 + i * 160}ms"></i></div>
            <p>${it.desc}</p>
          </div>`).join("")}
      </div>`,

    /* 8 handled by statement */

    /* 9. kedi columns ---------------------------------------------------- */
    kedi: (s) => `
      ${head(s)}
      <div class="split">
        <div>
          ${list(s.bullets, 220, 110)}
          <p class="footnote" ${anim("fade-up", 560)}>${s.note}</p>
        </div>
        <div>
          <div class="callout" style="margin:0 0 26px" ${anim("fade-up", 300)}>
            <div class="big"><span class="hl">디지털 버추얼 캠퍼스 전환</span>으로<br>PC사양 <span class="hl-gold">90.0점 이상</span> 달성</div>
          </div>
          <div class="cols3" ${anim("fade-up", 420)}>
            <div class="col-bar c1"><div class="fillv" style="--h:72.6%"><span class="v">72.6</span></div><div class="cap">수도권<small>대학생 PC 평균</small></div></div>
            <div class="col-bar c2"><div class="fillv" style="--h:65.3%"><span class="v">65.3</span></div><div class="cap">비수도권<small>대학생 PC 평균</small></div></div>
            <div class="col-bar c3"><div class="fillv" style="--h:100%"><span class="v">90.0</span></div><div class="cap">VDI 도입대학<small>전환 후 목표</small></div></div>
          </div>
          <p class="gal-note" style="margin-top:14px">출처: 한국교육개발원(KEDI) 2023 ‘대학생 IT학습 환경 실태조사’ (최신PC=100)</p>
        </div>
      </div>`,

    /* 10. gallery (전 학과 X+AI) — seamless auto-flow marquee ------------- */
    gallery: (s) => {
      const cards = GALLERY.map((g) => `
        <figure class="gal-card">
          <img src="assets/img/${g.f}" alt="${g.l}" loading="lazy" />
          <span class="cat">${g.c}</span>
          <figcaption class="cap">${g.l}</figcaption>
        </figure>`).join("");
      return `
      ${head(s)}
      ${list(s.bullets, 200, 110)}
      <div class="gallery" ${anim("fade-up", 380)}>
        <div class="gal-marquee">
          <div class="gal-track">${cards}${cards}</div>
        </div>
        <p class="gal-note">학과 이미지가 자동으로 흐릅니다 · 마우스를 올리면 일시정지 — 35개 전 학과·계열 맞춤형 X+AI 실습 설계</p>
      </div>`;
    },

    /* 11. split bullets + illustration ----------------------------------- */
    career: (s) => `
      ${head(s)}
      <div class="split">
        <div>
          ${list(s.bullets, 220, 100)}
        </div>
        <div class="visual">
          <div class="card" ${anim("fade-left", 300)} style="text-align:center;width:100%">
            <img class="career-shot" src="assets/media/img-career.png" alt="VDI 업무환경에서 근무하는 졸업생" loading="lazy" />
            <div class="eyebrow" style="justify-content:center">4학년 취업준비 C학생 사례</div>
            <div class="grid g-2" style="margin:10px 0 4px">
              <div class="tag" style="justify-content:center">VDI 업무환경 선행학습</div>
              <div class="tag" style="justify-content:center">클라우드PC 창업지원</div>
            </div>
            <div class="callout" style="margin-top:20px">
              <div class="big">채용서류에<br><span class="hl">“디지털 스마트 업무환경 숙련”</span><br>자신있게 기재</div>
              <div class="small">2,260여 개 협력업체 산학연계 취업 강점과 결합</div>
            </div>
          </div>
        </div>
      </div>`,

    /* 12. hub (virtual hub) ---------------------------------------------- */
    hub: (s) => `
      ${head(s)}
      <div class="hub">
        <div>
          <p class="ssub" ${anim("fade-right", 200)}>${s.lead}</p>
          ${list(s.bullets, 320, 110)}
        </div>
        <div class="side-visual" ${anim("zoom-in", 360)}>
          <video src="assets/media/global-reach.mp4" autoplay muted loop playsinline preload="metadata" aria-label="한국에서 전 세계로 뻗어나가는 글로벌 네트워크"></video>
          <div class="side-legend">
            <div ${anim("fade-up", 520)}><b>해외 유학생</b>가상 랩(Lab) 원격 학사과정 · ‘스터디 코리아 300K’ 선제 대응</div>
            <div ${anim("fade-up", 620)}><b>성인학습자</b>장소 제약 해소로 학령인구 감소 대응</div>
            <div ${anim("fade-up", 720)}><b>재직자</b>설치 없이 접속하는 실습환경 · 지역사회 교육 거점</div>
          </div>
        </div>
      </div>`,

    /* 13. talent (map stats + 6-track) ----------------------------------- */
    talent: (s) => `
      ${head(s)}
      <div class="talent">
        <div class="stat-list">
          <div class="tstat" ${anim("fade-right", 220)}><div class="n">최소 <span class="hl-gold">58만 명</span> 부족</div><div class="t">2025~2029년 전문인력 (정부 전망)</div></div>
          <div class="tstat" ${anim("fade-right", 340)}><div class="n">AI <span class="hl-gold">12,800명</span> 부족</div><div class="t">2027년 기준</div></div>
          <div class="tstat" ${anim("fade-right", 460)}><div class="n">클라우드 <span class="hl-gold">18,800명</span> 부족</div><div class="t">신기술 전문인력</div></div>
          <div class="callout" style="margin-top:8px" ${anim("fade-up", 560)}>
            <div class="big">"비어 있는 1만 8,800개의 일자리,<br><span class="hl">채우는 대학</span>"</div>
            <div class="small">AID 기반 스마트 교육 인프라로 클라우드 전문 인력 양성 촉진</div>
          </div>
        </div>
        <div class="side-visual" ${anim("zoom-in", 400)}>
          <img src="assets/media/img-talent.png" alt="GPU 가속 VDI 기반 신기술 인재 양성" loading="lazy" />
          <div class="track-chips" ${anim("fade-up", 560)}>
            <span>모빌리티</span><span>반도체</span><span>로봇</span>
            <span>ABB</span><span>헬스케어</span><span>도심형서비스</span>
          </div>
          <div class="side-cap">6-Track · GPU 가속 VDI 기반 실무형 인력 양성</div>
        </div>
      </div>`,

    /* 14. donuts (62 / 86) ----------------------------------------------- */
    donuts2: (s) => `
      ${head(s)}
      <div class="donuts g-2" style="margin-top:10px">
        ${s.items.map((d, i) => `
          <div class="donut" ${anim("zoom-in", 240 + i * 160)}>
            <div class="ring" data-p="${d.p}" style="--dc:${d.color || "var(--accent)"}"><span class="pct">${d.p}%</span></div>
            <div class="cap">${d.cap}</div>
          </div>`).join("")}
      </div>
      <div class="callout" ${anim("fade-up", 620)}>
        <div class="big">NCSI 전문대학 <span class="hl">12년 연속 전국 1위</span> 위상에 디지털 혁신 결합</div>
        <div class="small">"세계 명문 62%의 선택 — 전문대 최초·최고 수준의 AI Native Campus 선점"</div>
      </div>`,

    /* 15. efficiency ----------------------------------------------------- */
    efficiency: (s) => `
      ${head(s)}
      <img class="eff-banner" src="assets/media/img-central.png" alt="35개 학과 전산실이 하나의 중앙 관제로 통합" loading="lazy" ${anim("fade-up", 180)} />
      <div class="eff-top">
        <div ${anim("fade-right", 220)}>
          <div class="eyebrow">35개 학과 전산실</div>
          <div class="pc-grid">${Array.from({ length: 40 }).map(() => '<div class="pc"></div>').join("")}</div>
        </div>
        <div class="eff-arrow" ${anim("zoom-in", 320)}>→</div>
        <div class="eff-one" ${anim("fade-left", 420)}>
          <div class="mon">하나의<br>중앙 관제</div>
        </div>
      </div>
      <p class="ssub" style="text-align:center;max-width:none;margin:0 auto 26px" ${anim("fade-up", 480)}>35개 학과 전산실을 하나의 중앙 관제 화면으로 통합 · 하드웨어 업그레이드/보안 패치 중앙 통제 · <b class="hl">부서별 전산관리자 불필요</b></p>
      <div class="badges3">
        ${[["25% 절감", "LG전자 (2023)"], ["15% 절감", "삼성전자 (2021)"], ["20% 절감", "한국전력공사 (2022)"]].map(([n, c], i) => `
          <div class="badge-save" ${anim("fade-up", 540 + i * 110)}><div class="b-n">${n}</div><div class="b-c">${c}</div></div>`).join("")}
      </div>
      <p class="footnote plain" style="text-align:center;border:none;padding:0" ${anim("fade-up", 900)}>도입 기관 사례 기준 — 전체 운영비용 약 20% 절감 예상</p>`,

    /* 16 & 28. divider --------------------------------------------------- */
    divider: (s) => `
      <div class="divider">
        ${s.chapter ? `<div class="chapter" ${anim("zoom-in", 100)}>${s.chapter}</div>` : ""}
        <h2 ${anim("fade-up", 220)}>${s.big}</h2>
        <div class="rule" ${anim("fade-in", 420)}></div>
        ${s.sub ? `<p class="sub" ${anim("fade-up", 520)}>${s.sub}</p>` : ""}
      </div>`,

    /* 17. category cards ------------------------------------------------- */
    categories: (s) => `
      ${head(s)}
      <div class="split" style="grid-template-columns:1fr auto;align-items:start">
        <div class="cats">
          ${s.cats.map((c, i) => `
            <div class="cat-row" ${anim("fade-right", 200 + i * 90)}>
              <div class="ci" style="background:${c.color}">${I[c.icon]}</div>
              <div><h3>${c.title}</h3><p>${c.depts}</p></div>
            </div>`).join("")}
        </div>
        <div class="callout" style="margin:0;align-self:start" ${anim("zoom-in", 260)}>
          <div class="big" style="font-size:clamp(40px,6vw,88px);color:var(--accent)">35개</div>
          <div class="small">학과 · 계열</div>
        </div>
      </div>`,

    /* 21. cycle ---------------------------------------------------------- */
    cycle: (s) => `
      ${head(s)}
      <div class="split">
        <div class="cycle" ${anim("zoom-in", 300)}>
          <div class="cycle-center">Data-Driven<br>Education</div>
          ${s.nodes.map((n, i) => `
            <div class="cycle-node p${i}">
              <div class="cn-ic">${I[n.icon]}</div>
              <h4>${n.title}</h4><span class="prod">${n.prod}</span>
              <p>${n.desc}</p>
            </div>`).join("")}
        </div>
        <div>
          <p class="ssub" ${anim("fade-left", 260)}>강의 설계 → 실습 수행 → AI 활용 → 평가 운영 → 성과 분석이 하나의 루프로 연결됩니다.</p>
          <div class="callout" ${anim("fade-up", 420)}>
            <div class="big" style="font-size:clamp(16px,2vw,24px)"><span class="hl">Key Insight</span></div>
            <div class="small" style="font-size:clamp(14px,1.5vw,18px);color:#dbe6f5">교수학습 전 과정의 데이터화 · 학습 이력 축적 및 AID 성과지표 완벽 대응</div>
          </div>
        </div>
      </div>`,

    /* 22-25. timeline ---------------------------------------------------- */
    timeline: (s) => `
      ${head(s)}
      <div class="timeline" ${anim("fade-up", 220)}>
        <div class="tl-row" style="--n:${s.items.length}">
          ${s.items.map((t, i) => `
            <div class="tl-item" ${anim("fade-up", 260 + i * 130)}>
              <div class="tl-when"><span class="time">${t.time}</span><span class="place">${t.place}</span></div>
              <div><span class="prod-chip">${t.prod}</span></div>
              <h4>${t.head}</h4><p>${t.desc}</p>
            </div>`).join("")}
        </div>
      </div>
      ${s.ba ? `<div class="ba">
        <div class="b" ${anim("fade-right", 620)}><b>Before</b> · ${s.ba.b}</div>
        <div class="a" ${anim("fade-left", 620)}><b>After</b> · ${s.ba.a}</div>
      </div>` : ""}
      ${s.foot ? `<p class="tl-foot" ${anim("fade-up", 760)}>${s.foot}</p>` : ""}`,

    /* 26. compare bars (AS-IS / TO-BE) ----------------------------------- */
    compare: (s) => `
      ${head(s)}
      <div class="legend" ${anim("fade-up", 180)}>
        <span><i style="background:#61748e"></i>도입 전 (AS-IS)</span>
        <span><i style="background:var(--accent)"></i>도입 후 (TO-BE)</span>
      </div>
      <div class="bars">
        ${s.rows.map((r, i) => `
          <div ${anim("fade-up", 240 + i * 140)}>
            <div class="bar-row" style="margin-bottom:10px">
              <div class="lbl">${r.label}</div>
              <div class="bar-track"><div class="bar-fill f-muted" style="--w:${r.as.w}%;transition-delay:${300 + i * 240}ms">${r.as.t}</div></div>
            </div>
            <div class="bar-row">
              <div class="lbl"></div>
              <div class="bar-track"><div class="bar-fill f-accent" style="--w:${r.to.w}%;transition-delay:${480 + i * 240}ms">${r.to.t}</div></div>
            </div>
          </div>`).join("")}
      </div>
      <p class="footnote" ${anim("fade-up", 720)}>${s.note}</p>`,

    /* 27. values (6 cards) ----------------------------------------------- */
    values: (s) => `
      ${head(s)}
      <div class="vals">
        ${s.items.map((v, i) => `
          <div class="val-card" style="--vc:${v.color}" ${anim("fade-up", 200 + i * 90)}>
            <h3>${v.title}</h3>
            <ul>${v.points.map((p) => `<li>${p}</li>`).join("")}</ul>
          </div>`).join("")}
      </div>
      ${s.footer ? `<p class="footnote" style="text-align:center" ${anim("fade-up", 780)}>${s.footer}</p>` : ""}`,

    /* 29. survey (donuts row + note) ------------------------------------- */
    survey: (s) => `
      ${head(s)}
      <div class="donuts g-4" style="grid-template-columns:repeat(${s.items.length},1fr)">
        ${s.items.map((d, i) => `
          <div class="donut" ${anim("zoom-in", 220 + i * 130)}>
            <div class="ring" data-p="${d.p}" style="--sz:clamp(120px,13vw,180px);--dc:${d.color || "var(--accent)"}"><span class="pct" style="font-size:clamp(22px,2.6vw,38px)">${d.p}%</span></div>
            <div class="cap">${d.cap}</div>
          </div>`).join("")}
      </div>
      ${s.footer ? `<p class="footnote plain" style="text-align:center;border:none;padding:0" ${anim("fade-up", 720)}>${s.footer}</p>` : ""}`,

    /* 31. finale (mascot growth video) ------------------------------------ */
    finale: (s) => `
      ${head(s)}
      <div class="finale" ${anim("zoom-in", 240)}>
        <video class="finale-video" src="${s.video}" autoplay muted loop playsinline preload="metadata"></video>
      </div>
      ${s.footer ? `<p class="footnote plain" style="text-align:center;border:none;padding:0" ${anim("fade-up", 560)}>${s.footer}</p>` : ""}`,

    /* 30. distribution (single donut + list) ----------------------------- */
    distribution: (s) => `
      ${head(s)}
      <div class="split">
        <div class="donut" ${anim("zoom-in", 260)}>
          <div class="ring" data-p="${s.main.p}" style="--sz:clamp(180px,22vw,280px)"><span class="pct" style="font-size:clamp(40px,5vw,66px)">${s.main.p}%</span></div>
          <div class="cap" style="max-width:32ch">${s.main.cap}</div>
        </div>
        <div>
          <p class="ssub" ${anim("fade-left", 300)}>${s.lead}</p>
          <div class="bars" style="margin-top:24px">
            ${s.dist.map((d, i) => `
              <div class="bar-row" ${anim("fade-up", 380 + i * 100)}>
                <div class="lbl" style="font-size:14px">${d.label}</div>
                <div class="bar-track" style="height:34px"><div class="bar-fill f-cyan" style="--w:${d.w}%">${d.w}%</div></div>
              </div>`).join("")}
          </div>
        </div>
      </div>`,
  };

  function pillar(p, d) {
    return `<div class="pillar lift-2" style="--pc:${p.color}" ${anim("fade-up", d)}>
      <h3>${p.title}</h3><div class="prod">${p.prod}</div><div class="desc">${p.desc}</div></div>`;
  }

  /* =======================================================================
     SLIDE DATA — all 30 pages
     ======================================================================= */
  const SLIDES = [
    { id: "slide-1", title: "Opening", effect: "parallax", layout: "cover",
      bg: () => mediaBg("assets/media/hero-campus.mp4", { video: true, cls: "media-bg--strong" }) + '<div class="cover-orb"></div>' },

    { id: "slide-2", title: "종합 제안", effect: "fade", layout: "statement",
      bg: () => mediaBg("assets/media/bg-vision.mp4", { video: true }),
      eyebrow: "AI Native Campus 종합 제안",
      big: "영남이공대의 비전,<br><span class='grad'>틸론이 완성하는 인프라</span>",
      bullets: [
        "“AI-Native 실무역량으로 지역 산업을 혁신하는 <b>X+AI 직업교육 선도대학</b>” 비전 완성",
        "“실력을 넘어 학생의 미래를 여는 대학” 슬로건의 <b>기술적 실현</b>",
        "<b>3A</b>(Anyone, Anytime, Anywhere), 디지털·페이퍼리스 교육환경 구현",
        "강의와 실습, 평가, 행정, 산학협력을 <b>하나의 플랫폼</b>으로 연결하는 것",
        "<b>NCSI 12년 연속 1위</b>를 넘어 전국 전문대학 디지털 전환 표준 모델 확립",
      ],
      footer: "틸론과 함께, 영남이공대학교만의 AI Native Campus를 완성합니다." },

    { id: "slide-3", title: "제안의 핵심", effect: "zoom", layout: "transform", wide: true,
      bg: () => '<div class="darkveil-wrap"><canvas class="darkveil-canvas"></canvas></div>',
      title2: true, eyebrow: "The Core Proposal",
      title: "AI 도입은 솔루션이 아니라 <span class='hl'>인프라</span>입니다",
      sub: "VDI와 GPU를 캠퍼스의 심장에 두고, LMS · AI 플랫폼 · CBT · 학사 서비스 · 학습 분석 · 연구 데이터가 하나의 운영체계로 연결 — 이 구조가 갖춰질 때 비로소 일부 학과가 아닌 <b class='hl'>전 학과의 AX</b>가 가능합니다." },

    { id: "slide-4", title: "4 Pillars", effect: "tilt3d", layout: "quadrant", wide: true,
      eyebrow: "4 Pillars of AX Native Campus",
      title: "4개의 기둥으로 세우는 캠퍼스",
      sub: "개별 제품이 아니라 “영남이공대학교 AX Native Campus 구축 패키지”로 제안합니다.",
      pillars: [
        { title: "차별 없는 실습", color: "var(--cyan)", prod: "DstationX Enterprise · Estation 3.0", desc: "PC 성능 및 장소의 제약 완벽 해소" },
        { title: "전 학과 X+AI", color: "var(--accent)", prod: "iStation Professional · Tstation · CenterBridge", desc: "전공 데이터 기반의 맞춤형 AI 실습 인프라" },
        { title: "디지털 교수학습 플랫폼", color: "var(--gold)", prod: "CAS · TAS · CenterFace · Station", desc: "CBT·LMS·대시보드 연계를 통한 평가 데이터화" },
        { title: "보안형 스마트 캠퍼스", color: "var(--violet)", prod: "Twater · Rstation · Vstation · CenterVista", desc: "중앙저장·워터마크·MFA를 통한 완벽한 통제" },
      ],
      footer: "핵심은 AX Native Campus를 구성하는 네 가지 축이 개별이 아닌 <b class='hl'>하나의 플랫폼</b>으로 운영되는 AI 캠퍼스 운영체계를 만들어 가는 것입니다." },

    { id: "slide-5", title: "Solution Architecture", effect: "fade", layout: "flow",
      bg: () => mediaBg("assets/media/bg-vision-net.mp4", { video: true, cls: "media-bg--faint" }),
      eyebrow: "TILON Solution Architecture",
      title: "개별 제품이 아닌 ‘구축 패키지’",
      sub: "영남이공대학교 AX Native Campus를 구성하는 4개 계층.",
      rows: [
        { title: "디지털 교수학습 플랫폼", desc: "강의·실습·과제·시험 통합 운영", tags: ["CAS", "TAS", "CenterFace", "Station"] },
        { title: "AI Native 교육 인프라", desc: "전 학과 X+AI 실습 · Internal AI", tags: ["iStation", "Tstation", "CenterBridge", "CenterVista"] },
        { title: "차별 없는 실습 인프라", desc: "고성능 동일 실습환경", tags: ["DstationX", "Estation 3.0"] },
        { title: "보안 · 운영 · 관리 체계", desc: "민감정보 보호 · 원격지원 · YNC 맞춤 최적화", tags: ["Twater", "Rstation", "Vstation"] },
      ] },

    { id: "slide-6", title: "Strategic Alignment", effect: "fade", layout: "table", wide: true,
      bg: () => mediaBg("assets/media/bg-arrows.mp4", { video: true, cls: "media-bg--faint" }),
      eyebrow: "Strategic Alignment", title: "비전 실현의 가교",
      sub: "틸론 솔루션은 영남이공대의 비전 문구를 실제 수업·실습·평가·성과관리·산학협력 시스템으로 전환하는 실행 인프라입니다.",
      rvLast: true,
      cols: ["구분", "핵심 방향", "틸론 제안 연결", "결과 가치"],
      rows: [
        ["대학 비전", "<span class='red-sweep'>미래가치 1등 직업교육대학</span>", "전 학과 AI·VDI·GPU 실습환경으로 직업교육 경쟁력 고도화", "비전 선언과 실제 학습경험 간 간극 해소"],
        ["AID 비전", "<span class='red-sweep'>AI-Native 실무역량 기반 X+AI 직업교육 선도대학</span>", "DstationX·iStation·Tstation·TAS 기반 수업·실습·평가 전환", "지속 가능한 성과 기반 확보"],
        ["성과관리", "교육품질·학생교육·산학협력·글로벌·대학체계 혁신지수", "CenterVista 기반 데이터 대시보드와 학습성과 관리", "대학 혁신 지수 향상"],
        ["지역산업", "미래모빌리티·로봇·헬스케어·반도체·ABB·도심형서비스", "D6+AI 전공 실습과 산학 프로젝트형 교육 운영", "대구 전략산업 맞춤형 모델 완성"],
        ["평생교육", "지역사회 AI 평생학습 거점", "재직자·성인학습자 대상 원격 실습형 AI·DX 직무전환 교육", "지역사회 확산 및 대학 공공성 강화"],
      ],
      footer: "AX Native Campus는 전산실 개선 사업이 아니라, 비전과 AID 전환 목표를 수업·실습·평가·산학협력·평생직업교육으로 구현하는 전략사업입니다." },

    { id: "slide-7", title: "5대 혁신지수", effect: "fade", layout: "index5", wide: true,
      eyebrow: "Innovation Index", title: "5대 혁신지수 달성 및 환류 고도화",
      items: [
        { icon: "grad", title: "교육품질혁신지수", w: 88, desc: "수업별 표준 실습환경 보장, AI·GPU 접근성 확보, 학습성과 데이터 정량 관리" },
        { icon: "doc", title: "학생교육혁신지수", w: 84, desc: "개인 맞춤형 디지털 학습경로 제공 및 포트폴리오 축적을 통한 만족도 강화" },
        { icon: "handshake", title: "산학협력혁신지수", w: 90, desc: "기업 멘토·교수·학생이 동일 가상환경에서 접속하는 공동 프로젝트 허브" },
        { icon: "globe", title: "글로벌혁신지수", w: 82, desc: "해외 접속형 강의·평가 운영, 외국인 유학생 유치 및 글로벌 공동교육 확대" },
        { icon: "gear", title: "대학체계혁신지수", w: 92, desc: "VDI·GPU·CBT 사용현황 통합 대시보드로 데이터 기반 의사결정 체계 전환" },
      ] },

    { id: "slide-effects", title: "CHAPTER — 도입효과", effect: "curtain", layout: "divider",
      bg: () => mediaBg("assets/media/divider-effects.mp4", { video: true, cls: "media-bg--strong" }),
      chapter: "02", big: "AX Native Campus 도입효과",
      sub: "AI Native Campus 구현부터 운영 효율·ESG까지 — 8가지 관점에서 살펴보는 영남이공대학교의 변화", curtain: true },

    { id: "slide-8", title: "AI Native Campus 구현", effect: "curtain", layout: "statement",
      bg: () => mediaBg("assets/media/bg-ainative.mp4", { video: true }),
      eyebrow: "AI Native Campus 구현",
      big: "“AI를 가르치는 대학”에서<br><span class='grad'>“AI 위에서 운영되는 대학”</span>으로",
      bullets: [
        "교육·실습·평가·행정·산학협력을 <b>AI 기반으로 연결</b>하는 대학 운영체계 전환",
        "단일 솔루션 도입이 아닌, 캠퍼스 전체의 <b>운영 패러다임 전환</b>",
      ],
      curtain: true },

    { id: "slide-9", title: "차별없는 교육환경", effect: "zoom", layout: "kedi", wide: true,
      eyebrow: "Equal Access", title: "차별없는 디지털 교육환경",
      bullets: [
        "개인 PC·실습실·고가 SW <b>접근성 격차 해소</b>",
        "학생 장비 격차를 <b>교육 성과 격차로 만들지 않는</b> 캠퍼스",
        "학과·강의·커리큘럼별 특성에 맞는 클라우드PC <small>(Standard PC · Workstation · GPU)</small>",
      ],
      note: "학습 환경에 공정하고 우수한 IT자원 배분으로 학업 성취률 향상" },

    { id: "slide-10", title: "전 학과 X+AI", effect: "fade", layout: "gallery", wide: true,
      eyebrow: "X + AI for Every Department", title: "전 학과 X+AI 확산",
      bullets: [
        "보건·공학·디자인·서비스·복지·경영까지 <b>전공별 AI 실습 설계</b>",
        "일부 학과 중심이 아닌 <b>전 학과 AI 역량 확보</b>",
      ] },

    { id: "slide-11", title: "취업·창업 경쟁력", effect: "fade", layout: "career", wide: true,
      eyebrow: "Career & Startup", title: "취업·창업 경쟁력 강화", sub: "실무 경험으로 입사하는 4년",
      bullets: [
        "<b>(취업)</b> 국내 대기업·공공기관 대부분 VDI 업무환경 운영 — 근무환경을 교내에서 선행학습",
        "<b>(창업)</b> 창업동아리·창업 시 클라우드PC 지원으로 초기 투자비용 절감",
        "재학 중 동일 환경 선행 경험으로 입사 후 <b>적응기간 단축</b>",
        "2,260여 개 협력업체 <b>산학연계 취업 강점</b> 결합",
      ] },

    { id: "slide-12", title: "글로벌·평생교육", effect: "tilt3d", layout: "hub", wide: true,
      eyebrow: "Global & Lifelong", title: "글로벌 및 평생직업교육 확장 영역",
      lead: "언제 어디서나 접속 가능한, 장소 제약 없는 학습 환경",
      bullets: [
        "해외 학생·재직자·성인학습자의 <b>원격 실습형 교육</b> 참여",
        "학령인구 감소 대응과 <b>지역사회 교육 거점</b> 강화",
      ] },

    { id: "slide-13", title: "신기술 인재 거점", effect: "zoom", layout: "talent", wide: true,
      eyebrow: "National Talent Hub", title: "국가적 신기술 인재 부족 해소의 거점",
      sub: "GPU 가속 VDI 기반 실무형 인력 양성으로 6대 전략산업 인재난에 대응합니다." },

    { id: "slide-14", title: "세계 명문의 선택", effect: "zoom", layout: "donuts2", wide: true,
      eyebrow: "The Choice of World-Class", title: "세계 명문의 선택, 미래혁신 위상 제고",
      items: [
        { p: 62, color: "var(--accent)", cap: "2023년 기준 세계 <b>Top 100 대학</b> 중 VDI 도입률" },
        { p: 86, color: "var(--cyan)", cap: "2023년 기준 세계 <b>Top 100 기업</b> 중 VDI 사용률" },
      ] },

    { id: "slide-15", title: "운영 효율 & ESG", effect: "fade", layout: "efficiency", wide: true,
      eyebrow: "Operational Efficiency & ESG", title: "운영 효율성 및 친환경 캠퍼스" },

    { id: "slide-16", title: "CHAPTER — 학과 혁신", effect: "curtain", layout: "divider",
      bg: () => mediaBg("assets/media/divider-dept.mp4", { video: true, cls: "media-bg--strong" }),
      chapter: "03", big: "계열 학과별 교육방식의 혁신적 변화",
      sub: "35개 전 학과·계열이 어떻게 바뀌는지 살펴봅니다.", curtain: true },

    { id: "slide-17", title: "전공 학과 현황", effect: "fade", layout: "categories", wide: true,
      eyebrow: "02  Academic Programs", title: "영남이공대학교 전공 학과 현황",
      cats: [
        { title: "보건의료", color: "#e0455a", icon: "health", depts: "간호학과(4년제) · 물리치료과 · 치위생과 · 보건의료행정과" },
        { title: "IT·반도체·기계", color: "#1a2b52", icon: "chip", depts: "소프트웨어융합과 · 사이버보안과 · ICT반도체전자계열 · 스마트융합기계계열 · 전기자동화과 · 스마트e-자동차과 · 모빌리티계열" },
        { title: "건축·생활", color: "#12324e", icon: "building", depts: "건축학과 · 건설시스템과 · 화장품화공계열" },
        { title: "디자인·콘텐츠", color: "#8b5cf6", icon: "brush", depts: "시각영상디자인과 · 인테리어디자인과 · 웹툰과 · 메타버스게임애니메이션과 · 패션디자인마케팅과" },
        { title: "외식·뷰티·서비스", color: "#e8892b", icon: "food", depts: "글로벌외식조리과 · 글로벌베이커리과 · 박승철헤어과 · K-뷰티과 · 반려동물보건/스타일리스트과 · 여행·항공마스터과 · 항공·호텔·카지노계열 · 스포츠재활과 · 글로벌레저서비스과" },
        { title: "복지·경영·국제", color: "#1f9d55", icon: "heartHand", depts: "사회복지서비스과 · 사회복지·보육과 · 청소년복지상담과 · i-경영·회계계열 · 부사관과 · 글로벌교양학과(국제대학)" },
      ] },

    { id: "slide-18", title: "학과별 변화 ①", effect: "fade", layout: "table", wide: true,
      eyebrow: "03  Curriculum Transformation ①",
      title: "학과별 교육방식 변화 — 보건의료 · IT·반도체·기계",
      cols: ["학과 · 계열", "핵심 도입 솔루션", "교육방식 변화"],
      rows: [
        ["간호학과(4년제)", "TAS · DstationX", "국가시험 CBT 상시응시, 영남대병원 컨퍼런스 화상연계, VDI로 임상실습 자료 접속"],
        ["물리치료과", "TAS · Vstation", "임상사례 발표 페이퍼리스화, 재활 시뮬레이션 자료 VDI 공유"],
        ["치위생과", "TAS · DstationX", "이론평가 CBT 전환, 실습실 전체 동일 가상데스크톱 환경"],
        ["보건의료행정과", "iStation · CAS", "의료행정 사례 AI 1차 분석, 자격증 CBT 모의시험 상시 운영"],
        ["소프트웨어융합과", "Tstation · Estation", "GPU 슬라이싱으로 AI모델 학습·코딩 실습 표준화"],
        ["사이버보안과", "Estation · Rstation · Twater", "격리 모의해킹 환경, 서버 원격제어 실습, 보안리포트 워터마크 보호"],
        ["ICT반도체전자계열", "Estation 3.0 · iStation", "고가 EDA 시뮬레이션 SW 다수 동시 사용, AI 보조 회로설계"],
        ["스마트융합기계계열", "Estation · iStation", "CAD/CAM 가상화로 사양 제약 해소, AI 설계 검토"],
        ["전기자동화과", "Estation · Rstation", "PLC 시뮬레이션 가상데스크톱 구동, 원격 제어시스템 점검"],
        ["스마트 e-자동차과", "Estation · iStation", "전동화 진단 시뮬레이션 실습, AI 정비매뉴얼 검색"],
        ["모빌리티계열", "Estation · Tstation", "자율주행 시뮬레이션 GPU 가속, AI 코딩 병행 실습"],
        ["건축학과", "Estation · iStation", "BIM·CAD 고용량 SW GPU 가속 VDI 구동"],
      ] },

    { id: "slide-19", title: "학과별 변화 ②", effect: "fade", layout: "table", wide: true,
      eyebrow: "03  Curriculum Transformation ②",
      title: "학과별 교육방식 변화 — 건축·생활 · 디자인·콘텐츠 · 외식·뷰티",
      cols: ["학과 · 계열", "핵심 도입 솔루션", "교육방식 변화"],
      rows: [
        ["건설시스템과", "Estation · Rstation", "구조해석 SW 가상데스크톱 실습, 현장 PC 원격 점검"],
        ["화장품화공계열", "iStation · CAS", "성분 분석 AI 도구로 실습 데이터 해석"],
        ["시각영상디자인과", "Estation · iStation", "고용량 영상편집 가상화, AI 이미지 생성 시안 작업"],
        ["인테리어디자인과", "Estation · iStation", "3D렌더링 GPU 가속, AI 공간 시뮬레이션 보조"],
        ["웹툰과", "Estation · iStation", "저사양 기기에서도 고용량 드로잉 구동, AI 보조 작화"],
        ["메타버스게임애니메이션과", "Estation · Tstation", "게임엔진·3D 렌더링 GPU 가속, AI 코딩 프레임워크 실습"],
        ["패션디자인마케팅과", "iStation · CAS", "AI 트렌드 분석 기반 기획, LMS 캠페인 과제 관리"],
        ["글로벌외식조리과", "CAS · Station", "레시피·영양데이터 LMS 통합, 실습조 메신저 소통"],
        ["글로벌베이커리과", "CAS · iStation", "발효·온도 데이터 AI 분석으로 레시피 최적화"],
        ["박승철헤어과", "Vstation · CAS", "헤어 트렌드 컨퍼런스 무선 페이퍼리스 진행"],
        ["K-뷰티과", "iStation · Vstation", "뷰티 트렌드 AI 분석, 페이퍼리스 세미나"],
        ["반려동물보건과", "TAS · iStation", "동물보건사 CBT 모의시험, 진료사례 AI 검색"],
      ] },

    { id: "slide-20", title: "학과별 변화 ③", effect: "fade", layout: "table", wide: true,
      eyebrow: "03  Curriculum Transformation ③",
      title: "학과별 교육방식 변화 — 서비스 · 복지 · 경영 · 국제",
      cols: ["학과 · 계열", "핵심 도입 솔루션", "교육방식 변화"],
      rows: [
        ["반려동물스타일리스트과", "CAS · Station", "실습 일정·과제 LMS·메신저 통합 관리"],
        ["여행·항공마스터과", "CenterFace · iStation", "해외 파트너 화상 멘토링, AI 항공예약시스템 실습"],
        ["항공·호텔·카지노계열", "TAS · CenterFace", "자격증 CBT 상시응시, 글로벌 호텔 화상 인터뷰 실습"],
        ["스포츠재활과", "TAS · Estation", "재활 시뮬레이션 VDI 실습, 자격증 CBT화"],
        ["글로벌레저서비스과", "CenterFace · CAS", "해외 레저산업 사례 화상학습"],
        ["사회복지서비스과", "CAS · Station", "사례관리 과제 LMS 통합, 실습기관 메신저 연계"],
        ["사회복지·보육과", "CAS · Vstation", "보육 시나리오 토론 페이퍼리스 회의"],
        ["청소년복지상담과", "iStation · CenterFace", "상담사례 AI 1차 분류, 화상 상담 실습"],
        ["i-경영·회계계열", "TAS · iStation", "전산회계 등 CBT 상시응시, AI 재무데이터 분석"],
        ["부사관과", "TAS · Twater", "군사학 이론평가 CBT 전환, 보안문서 워터마크"],
        ["글로벌교양학과(국제대학)", "CenterBridge · CAS", "다국어 AI 라우팅 한국어 학습 보조, 글로벌 화상수업"],
      ],
      footer: "공통 인프라: <b class='hl'>DstationX(VDI)</b>로 전 학과 동일 실습환경 어디서나 접속 · <b class='hl'>CenterVista</b>로 총장·학과장이 전 학과 사용현황 실시간 파악" },

    { id: "slide-21", title: "교육 운영 루프", effect: "tilt3d", layout: "cycle", wide: true,
      eyebrow: "Data-Driven Loop", title: "강의·실습·과제·시험이 하나로 연결되는 AI 교육 운영 루프",
      nodes: [
        { icon: "pen", title: "강의 설계", prod: "CAS", desc: "자료/주차/과제 등록" },
        { icon: "monitor", title: "실습 수행", prod: "DstationX / Estation", desc: "표준 실습환경 배포" },
        { icon: "ai", title: "AI 활용", prod: "iStation / Tstation", desc: "전공 특화 AI 프로젝트" },
        { icon: "check", title: "평가 운영", prod: "TAS", desc: "CBT/IBT 자동채점·공정 평가" },
        { icon: "chart", title: "성과 분석", prod: "CenterVista", desc: "학습·AI 사용 Dashboard" },
      ] },

    { id: "slide-22", title: "학생의 하루 ①", effect: "parallax", layout: "timeline", wide: true,
      bg: () => mediaBg("assets/media/bg-student-am.mp4", { video: true, cls: "media-bg--faint" }),
      eyebrow: "05  Student Life — AM", title: "학생 라이프스타일 변화 ①",
      sub: "영남이공대 신입생의 오전 — 캠퍼스는 “장소”가 아니라 “접속 가능한 전공 실습환경”이 됩니다.",
      items: [
        { time: "8AM", place: "통학버스", prod: "DstationX", head: "버스 안에서 실습자료 리뷰", desc: "태블릿으로 가상 데스크톱 접속, 오늘 발표자료·실습파일 확인" },
        { time: "9AM", place: "강의실", prod: "CAS", head: "강의·출석·자료 확인", desc: "강의자료·과제·출석·질의응답이 하나의 플랫폼에서 진행" },
        { time: "10AM", place: "AI실습실", prod: "Tstation", head: "AI 개발환경 원클릭 실행", desc: "VSCode·Python·AI 프레임워크를 설정 없이 실습 시작" },
        { time: "11AM", place: "전공실습실", prod: "Estation", head: "GPU 기반 CAD·시뮬레이션", desc: "개인 노트북 성능과 무관하게 고성능 실습환경 사용" },
      ],
      ba: { b: "실습실 PC가 비어 있어야 하고, 내 노트북 성능이 좋아야 실습 가능", a: "언제 어디서나 동일한 전공 실습환경에 접속" } },

    { id: "slide-23", title: "학생의 하루 ②", effect: "fade", layout: "timeline", wide: true,
      bg: () => mediaBg("assets/media/bg-student-pm.mp4", { video: true, cls: "media-bg--faint" }),
      eyebrow: "06  Student Life — PM", title: "학생 라이프스타일 변화 ②",
      sub: "오후 — AI 활용, 팀 프로젝트, CBT 평가, 포트폴리오가 하나로 이어집니다.",
      items: [
        { time: "12PM", place: "휴게공간", prod: "Station", head: "팀 피드백·공지 확인", desc: "교수 피드백과 팀 프로젝트 이슈를 메신저 기반으로 확인" },
        { time: "1PM", place: "프로젝트룸", prod: "iStation", head: "전공 데이터 기반 AI 실습", desc: "기계·보건·관광·조리 등 전공 지식으로 Internal AI 활용" },
        { time: "3PM", place: "CBT시험실", prod: "TAS", head: "실습형 CBT·IBT 응시", desc: "문제은행·자동저장·부정행위 방지·자동채점으로 평가 공정성 강화" },
        { time: "4PM", place: "첨단강의실", prod: "Vstation", head: "팀 프로젝트 무선 발표", desc: "USB 없이 가상 데스크톱 산출물을 Paperless 방식으로 발표" },
      ],
      foot: "6PM · 집/기숙사 — <b class='hl'>DstationX + Tstation</b>으로 학교에서 작업하던 AI 코드·CAD·디자인 결과물을 그대로 이어서 작업. 캠퍼스는 “졸업까지 이어지는 나만의 전공 클라우드 환경”이 됩니다." },

    { id: "slide-24", title: "교수의 하루 ①", effect: "fade", layout: "timeline", wide: true,
      bg: () => mediaBg("assets/media/bg-prof-am.mp4", { video: true, cls: "media-bg--faint" }),
      eyebrow: "07  Teaching Life — AM", title: "교수 라이프스타일 변화 ①",
      sub: "오전 — 실습실 관리에서 벗어나 수업 설계와 학습 데이터 기반 피드백에 집중합니다.",
      items: [
        { time: "8AM", place: "연구실", prod: "CenterVista", head: "수업·AI 사용 현황 확인", desc: "학생 접속·AI 사용량·과제 진행률을 Dashboard에서 파악" },
        { time: "9AM", place: "연구실", prod: "CAS", head: "강의·과제·평가 설계", desc: "수업자료·과제·평가 기준을 하나의 교육 플랫폼에서 준비" },
        { time: "10AM", place: "강의실", prod: "DstationX", head: "표준 실습환경 즉시 배포", desc: "학생 PC 버전·설치 오류 없이 수업별 가상PC 이미지 배포" },
        { time: "11AM", place: "AI수업", prod: "Tstation + iStation", head: "AI 실습수업 운영", desc: "AI 개발환경과 GPU 자원을 학생·팀 단위로 공정하게 배분" },
      ],
      ba: { b: "PC 상태 확인·SW 설치 오류·학생별 환경 차이 해결에 수업 시간 소모", a: "실습환경은 자동 배포, 교수님은 교육 설계와 피드백에 집중" } },

    { id: "slide-25", title: "교수의 하루 ②", effect: "fade", layout: "timeline", wide: true,
      bg: () => mediaBg("assets/media/bg-prof-pm.mp4", { video: true, cls: "media-bg--faint" }),
      eyebrow: "08  Teaching Life — PM", title: "교수 라이프스타일 변화 ②",
      sub: "오후 — 산학수업, CBT 평가, AI 조교, 원격지원까지 수업 운영이 데이터화됩니다.",
      items: [
        { time: "1PM", place: "산학회의", prod: "CenterFace", head: "기업·외부전문가 원격수업", desc: "지역 기업 전문가·졸업생이 실시간으로 강의·멘토링 참여" },
        { time: "2PM", place: "실습실", prod: "Estation", head: "고성능 전공 실습 운영", desc: "CAD·3D·시뮬레이션·영상 등 GPU 기반 실습 품질 표준화" },
        { time: "3PM", place: "평가실", prod: "TAS", head: "CBT 기반 실습평가", desc: "시험지 출력·수작업 채점을 문제은행·자동채점으로 전환" },
        { time: "4PM", place: "연구실", prod: "iStation", head: "전공 지식 기반 AI 조교", desc: "수업 Q&A와 실습 매뉴얼을 Internal AI로 응대·검색" },
      ],
      foot: "5PM · 원격지원 — <b class='hl'>Rstation</b>으로 학생 실습 오류를 직접 확인하고, <b class='hl'>Twater</b>로 시험·산학자료 보안까지 강화. 교수님은 “AI 기반 수업 설계자이자 학생 성장 코치”가 됩니다." },

    { id: "slide-26", title: "정량 기대효과", effect: "zoom", layout: "compare", wide: true,
      eyebrow: "Quantitative Impact", title: "도입 전후 정량적 기대효과 비교",
      rows: [
        { label: "GPU 서버 자원 활용률", as: { w: 15, t: "15%" }, to: { w: 90, t: "90% · 최적화 9배 향상" } },
        { label: "대학 IT 학습 환경 만족도", as: { w: 63, t: "63.5점" }, to: { w: 90, t: "90.0점 · 만족도 42% 향상" } },
        { label: "연간 유지보수 비용 절감", as: { w: 8, t: "" }, to: { w: 55, t: "중앙 관리화로 전산 유지비 25%+ 절감" } },
      ],
      note: "출처: 한국교육개발원(KEDI) 대학생 IT학습 환경 데이터 및 동사 내부 데이터 분석 기준" },

    { id: "slide-27", title: "6대 전략적 가치", effect: "fade", layout: "values", wide: true,
      eyebrow: "6 Strategic Values", title: "영남이공대학교 경쟁력 강화를 위한 6대 전략적 가치",
      sub: "의사결정 관점에서 틸론 솔루션 도입은 교육혁신·운영효율·대학브랜드를 동시에 개선합니다.",
      items: [
        { title: "교육 경쟁력", color: "#e0455a", points: ["전 학과 X+AI 실습", "AI Native 실무인재 양성", "학생 포트폴리오 축적"] },
        { title: "교수학습 혁신", color: "var(--cyan)", points: ["강의·실습·과제·시험 통합", "CBT/IBT 공정평가", "AI 조교 기반 피드백"] },
        { title: "운영 효율", color: "var(--gold)", points: ["PC·SW·GPU 중앙관리", "원격 지원·자동 배포", "유지보수 비용 절감"] },
        { title: "보안 · 거버넌스", color: "var(--violet)", points: ["중앙 저장·화면 전송", "워터마크·MFA", "AI 사용량 Dashboard"] },
        { title: "정부사업 대응", color: "var(--accent)", points: ["AID·RISE 성과관리", "지역산업 연계 교육", "평생직업교육 확장"] },
        { title: "대학 브랜드", color: "#3f7fe0", points: ["AX 선도 전문대학 이미지", "글로벌 유학생·재직자 교육", "전문대 연합 모델 주도"] },
      ],
      footer: "틸론 도입은 “전산 솔루션 구매”가 아니라 영남이공대의 X+AI 직업교육 비전을 매일 쓰이는 캠퍼스 인프라로 전환하는 의사결정입니다." },

    { id: "slide-28", title: "CHAPTER — 설문조사", effect: "curtain", layout: "divider",
      bg: () => mediaBg("assets/media/divider-survey.mp4", { video: true, cls: "media-bg--strong" }),
      chapter: "04", big: "VDI 도입 설문조사",
      sub: "먼저 도입한 대학의 실제 응답 — 서강대학교 사례.", curtain: true },

    { id: "slide-29", title: "설문 결과 ①", effect: "fade", layout: "survey", wide: true,
      eyebrow: "Sogang University · Survey ①", title: "가상 데스크톱(Dstation) 사용 경험 의견",
      items: [
        { p: 92.1, color: "var(--accent)", cap: "원격 교육 및 실습 환경을 <b>제공할 수 있다</b>" },
        { p: 90.3, color: "var(--cyan)", cap: "<b>학교 이미지 향상</b>에 도움이 되었다" },
        { p: 95.1, color: "var(--accent)", cap: "원격 교육 및 <b>학사 행정</b>에 도움이 되었다" },
        { p: 90.2, color: "var(--cyan)", cap: "<b>차별 없는 학습 환경</b>을 제공할 수 있다" },
      ],
      footer: "디지털 중심 지방발전체계의 핵심 주체 — 대학교 73% · 디지털 기업 75.7% (다중 선택)" },

    { id: "slide-30", title: "설문 결과 ②", effect: "zoom", layout: "distribution", wide: true,
      eyebrow: "Sogang University · Survey ②", title: "디지털 인재 양성체계를 위한 가상 데스크톱 도입 의견",
      main: { p: 89.5, cap: "지방 혁신을 선도하는 디지털 인재 양성체계 구축을 위해 클라우드 기반 가상화 데스크톱 환경이 <b>제공되어야 한다</b>" },
      lead: "제공 범위에 대한 응답 — “서강대 전체 학생에게 제공해야 한다” 의견이 가장 높게 나타났습니다.",
      dist: [
        { label: "필요한 학생에게만 제공", w: 33.3 },
        { label: "전체 학생에게 제공", w: 28.2 },
        { label: "IT 기반 학과 학생에게 제공", w: 23.8 },
        { label: "전체 학생 및 교직원에게 제공", w: 7.7 },
      ] },

    { id: "slide-31", title: "Growing with AI", effect: "zoom", layout: "finale", wide: true,
      bg: () => mediaBg("assets/media/bg-ainative.mp4", { video: true, cls: "media-bg--faint" }),
      eyebrow: "Epilogue", title: "AI와 함께 성장하는 <span class='hl'>영남이공대학교</span>",
      sub: "실력을 넘어 학생의 미래를 여는 대학 — 틸론이 그 성장의 인프라가 되겠습니다.",
      video: "assets/media/mascot-growth.mp4?v=2",
      footer: "TILON × YEUNGNAM UNIVERSITY COLLEGE — AX Native Campus" },
  ];

  // attach index numbers
  SLIDES.forEach((s, i) => (s.num = i + 1));

  window.DECK = { SLIDES, LAYOUTS: L, GALLERY };
})();
