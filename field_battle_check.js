
// ────────────────────────────────────────────────
// 상수 설정
// ────────────────────────────────────────────────
const MAX_LEVEL     = 300;    // 캐릭터 최대 레벨
const MONSTER_COUNT = 15;     // 필드 몬스터 수
const ATK_INTERVAL  = 500;    // 기본 공격 주기 (ms)
const MOVE_SPEED    = 100;    // 캐릭터 이동 속도 (px/s)
const ATK_RANGE     = 44;     // 공격 사거리 (px)
const RESPAWN_DELAY = 5000;   // 몬스터 리스폰 대기 (ms)
const WANDER_SPEED  = 22;     // 몬스터 배회 속도 (px/s)

// ── 마을 구역 설정 (캔버스 좌상단 고정 크기)
const TOWN_W = 200;   // 마을 구역 너비 (px)
const TOWN_H = 180;   // 마을 구역 높이 (px)
const GRID_G = 64;    // 격자 크기 (draw / drawTownZone 공유)

// ────────────────────────────────────────────────
// 캔버스
// ────────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
    const wrap = document.getElementById('canvas-wrap');
    canvas.width  = wrap.clientWidth;
    canvas.height = wrap.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// 전투 로그 높이 드래그 조절 + localStorage 저장
(function() {
    const handle  = document.getElementById('log-resize-handle');
    const logEl   = document.getElementById('log-bottom');
    const STORAGE = 'versione_log_height';
    let dragging = false, startY = 0, startH = 0;
    const MIN_H = 48;

    // 저장된 높이 복원
    const saved = parseInt(localStorage.getItem(STORAGE), 10);
    if (!isNaN(saved) && saved >= MIN_H) {
        logEl.style.height = saved + 'px';
    }

    handle.addEventListener('mousedown', function(e) {
        dragging = true;
        startY = e.clientY;
        startH = logEl.offsetHeight;
        handle.classList.add('dragging');
        document.body.style.userSelect = 'none';
        e.preventDefault();
    });
    document.addEventListener('mousemove', function(e) {
        if (!dragging) return;
        const canvasCol = document.getElementById('canvas-col');
        const MAX_H = Math.floor(canvasCol.clientHeight * 0.7);
        const delta = startY - e.clientY; // 위로 드래그 → 높이 증가
        const newH = Math.min(MAX_H, Math.max(MIN_H, startH + delta));
        logEl.style.height = newH + 'px';
        resizeCanvas();
    });
    document.addEventListener('mouseup', function() {
        if (dragging) {
            dragging = false;
            handle.classList.remove('dragging');
            document.body.style.userSelect = '';
            // 드래그 완료 시 높이 저장
            localStorage.setItem(STORAGE, logEl.offsetHeight);
        }
    });
})();

// ────────────────────────────────────────────────
// 패치 노트 팝업
// ────────────────────────────────────────────────
let _patchNotePaused = false;
function openPatchNotes() {
    document.getElementById('patchnote-overlay').classList.add('open');
    if (gameState === 'playing') { _patchNotePaused = true; gameState = 'paused'; }
    else { _patchNotePaused = false; }
}
function closePatchNotes() {
    document.getElementById('patchnote-overlay').classList.remove('open');
    if (_patchNotePaused) { gameState = 'playing'; lastTime = performance.now(); }
    _patchNotePaused = false;
}

// ────────────────────────────────────────────────
// 게임 상태 변수
// ────────────────────────────────────────────────
// gameState: 'title' | 'playing' | 'paused'
// inTown: true = 마을 체류 중 (전투 정지)
let gameState    = 'title';
let character    = {};
let monsters     = [];
let particles    = [];
let totalKills   = 0;
let gameSpeed    = 1;
let lastTime     = 0;
let logs         = [];
let uiThrottle   = 0;

// ── 스테이지 시스템
let currentStage  = 1;          // 현재 스테이지 (1 ~ 1,000,000)
let stageKills    = 0;          // 현재 스테이지에서 일반 몬스터 처치 수
let bossSpawned   = false;      // 보스가 이미 등장했는지 여부
let bossDefeated  = false;      // 보스가 처치됐는지 여부
const MAX_STAGE   = 1000000;    // 최대 스테이지

// 스테이지 레벨 계산 (스테이지 1 → 레벨 1)
function stageLevel(stage) { return stage; }

// 보스 등장에 필요한 처치 수 (스테이지 × 10)
function bossRequiredKills(stage) { return stage * 10; }

// ────────────────────────────────────────────────
// 타이틀 → 게임 전환
// ────────────────────────────────────────────────
function startGame() {
    const titleEl = document.getElementById('title-screen');
    titleEl.style.opacity = '0';
    // 페이드아웃(0.8s) 후 타이틀 숨기고 게임 시작
    setTimeout(() => {
        titleEl.style.display = 'none';
        gameState = 'playing';
        initGame();
    }, 800);
}

// 타이틀 화면 데이터 최신화 — localStorage에 저장된 게임 설정을 메모리에 다시 불러옴
// (게임 시작은 하지 않음 — 타이틀 화면 상태 유지)
function refreshGameData() {
    // 페이지 전체를 새로고침하여 HTML(패치 노트 등 정적 콘텐츠 포함)과
    // localStorage 기반 설정(스탯·클래스·레벨 능력치 등)을 모두 최신 상태로 반영한다.
    // localStorage는 새로고침 후에도 유지되므로 기존 설정은 그대로 보존된다.
    const btn = document.getElementById('btn-refresh-data');
    if (btn) {
        btn.textContent = '🔄 최신화 중...';
        btn.disabled = true;
        btn.style.opacity = '0.7';
    }
    setTimeout(() => { location.reload(); }, 350);
}

// ────────────────────────────────────────────────
// 일시정지 / 재개
// ────────────────────────────────────────────────
function togglePause() {
    if (gameState === 'playing')  { pauseGame(); return; }
    if (gameState === 'paused')   { resumeGame(); }
}

// HP바 표시 On/Off 토글
function toggleHPBars() {
    showHPBars = !showHPBars;
    const btn = document.getElementById('btn-hp-toggle');
    if (showHPBars) {
        btn.textContent = '♥ HP바 ON';
        btn.classList.add('active');
    } else {
        btn.textContent = '♥ HP바 OFF';
        btn.classList.remove('active');
    }
}

function pauseGame() {
    if (gameState !== 'playing') return;
    gameState = 'paused';
    document.getElementById('pause-overlay').style.display = 'flex';
    document.getElementById('pause-info').textContent =
        `Lv.${character.level} · 처치 ${totalKills}회`;
    document.getElementById('btn-pause').textContent   = '▶ 재개';
    document.getElementById('btn-pause').classList.add('paused');
}

function resumeGame() {
    if (gameState !== 'paused') return;
    gameState = 'playing';
    document.getElementById('pause-overlay').style.display = 'none';
    document.getElementById('btn-pause').textContent = '⏸ 일시정지';
    document.getElementById('btn-pause').classList.remove('paused');
    // 일시정지 동안 흐른 시간을 무시하기 위해 lastTime 리셋
    lastTime = performance.now();
}

// ────────────────────────────────────────────────
// 타이틀 화면으로 돌아가기 (처음부터 재시작)
// 쿼리스트링에 타임스탬프를 붙여 브라우저 캐시를 무효화하고 파일을 강제 재로딩한다.
// localStorage 데이터는 재로딩 후에도 그대로 유지된다.
// ────────────────────────────────────────────────
function goToTitle() {
    location.href = location.pathname + '?_=' + Date.now();
}

// ────────────────────────────────────────────────
// 현재 필드를 유지하며 Lv.1 초기화
// ────────────────────────────────────────────────
function hardReset() {
    if (gameState === 'paused') resumeGame();
    initGame();
    addLog('필드 초기화 — Lv.1로 돌아갑니다.', 'info');
    saveCharacterState(); // 즉시 저장 → character_info.html 반영
}

// ────────────────────────────────────────────────
// 레벨에 따른 캐릭터 스탯 계산 (stats_calc.js의 computeStats와 동일 공식)
// 별도 파일 없이 field_battle.html 내에서도 동작하도록 동일 공식을 내장
// ────────────────────────────────────────────────
// ─── 레벨 능력치 설정 (localStorage 영구 저장) ─────────────────────
// 각 항목: { en: 'STR', base: 10, perLv: 2 }
let LV_STAT_CONFIG = [];

// 퍼센트 계열 en 키 판별
function isStatPct(en) {
    return /Rate$|Pct$|AmplifyRate$|WeakenRate$/.test(en);
}

// 레벨에 따른 LV_STAT_CONFIG 보너스 객체 반환
function getLvStatBonuses(lv) {
    const bonuses = {};
    for (const row of LV_STAT_CONFIG) {
        bonuses[row.en] = (bonuses[row.en] || 0) + row.base + (lv - 1) * row.perLv;
    }
    return bonuses;
}

// computeStats(stats_calc.js)에 레벨 보너스 + 기본 스탯 치환 보너스를 합산하여 반환
function calcCharStats(lv) {
    // 1단계 기본 합산: 레벨 능력치 + 치환 보너스(computeStats 내부에서 자동 계산)
    const s = computeStats(getLvStatBonuses(lv), BASE_STATS);
    return {
        maxHP:         s.MaxHP,
        maxMP:         s.MaxMP,
        hpRegen:       s.HPRegen,
        mpRegen:       s.MPRegen,
        meleeMinAtk:   s.MeleeMinAttack,
        meleeMaxAtk:   s.MeleeMaxAttack,
        meleeDef:      s.MeleeDefense,
        rangedDef:     s.RangedDefense,
        meleeAccuracy: s.MeleeAccuracy,
        meleeEvasion:  s.MeleeEvasion,
        critRate:            s.MeleeCritRate,
        critMul:             s.CritMultiplier,
        critResist:          s.MeleeCritResist / 100,
        meleeCritDmgReduc:   s.MeleyCriticalDamageReduction, // 치명타 피해 감소율 (10000 단위, 방어자 적용)
        defPenetrationMelee: s.PVETargetMeleeDefense,        // PVE 근거리 방어력 관통 (raw)
        attackSpeed:         s.AttackSpeed,
        moveSpeed:           s.MoveSpeed,
        // 원거리 공격 스탯
        rangedMinAtk:         s.RangedMinAttack,
        rangedMaxAtk:         s.RangedMaxAttack,
        magicDef:             s.MagicDefense,
        rangedAccuracy:       s.RangedAccuracy,
        rangedEvasion:        s.RangedEvasion,
        rangedCritRate:       s.RangedCritRate,
        rangedCritResist:     s.RangedCritResist / 100,
        rangedCritDmgReduc:   s.RangedCriticalDamageReduction,
        defPenetrationRanged: s.PVETargetRangedDefense,
        // 마법 공격 스탯
        magicMinAtk:          s.MagicMinAttack,
        magicMaxAtk:          s.MagicMaxAttack,
        magicAccuracy:        s.MagicAccuracy,
        magicEvasion:         s.MagicEvasion,
        magicCritRate:        s.MagicCritRate,
        magicCritResist:      s.MagicCritResist / 100,
        magicCritDmgReduc:    s.MagicCriticalDamageReduction,
        defPenetrationMagic:  s.PVETargetMagicDefense,
    };
}

// 몬스터 전투 스탯 계산
// 몬스터 레벨별 능력치 보너스 — computeStats가 요구하는 키 형식으로 기존 수치를 그대로 매핑
// (기존 임의 공식을 동일한 계산 결과가 나오도록 대응 bonus 키로 변환)
function getMonsterStatBonuses(lv) {
    return {
        // HP: MaxHealthPoint 직접 보너스
        MaxHealthPoint:   lv * 3,
        // 공격력: MeleeMinAttack / MeleeMaxAttack 직접 보너스 (PVEMeleeMinAttack에 합산됨)
        MeleeMinAttack:   Math.floor(lv * 2 + 3),
        MeleeMaxAttack:   Math.floor(lv * 3 + 5),
        // 방어력: computeStats는 PhysicalDefense 키를 MeleeDefense로 계산함
        PhysicalDefense:  Math.floor(lv * 1.5),
        // 명중: computeStats는 PVEMeleeAccuracy 키를 MeleeAccuracy로 계산함
        PVEMeleeAccuracy: Math.floor(70 + lv / 4),
        // 회피: MeleeEvasion 직접 보너스 (10000 단위 스케일)
        MeleeEvasion:     Math.floor(lv / 6),
        // 치명타율: PVECritical (10000 단위). MeleyCritRate = min(100, PVECritical / 100)
        // 기존 critRate = min(30, 2 + lv/20) → PVECritical = min(3000, floor((2 + lv/20) * 100))
        PVECritical:      Math.min(3000, Math.floor((2 + lv / 20) * 100)),
        // 치명타 배율: PVEAtCriticalAttack (10000 단위). CritMultiplier = floor(value / 100)
        // 기존 critMul = 130 → PVEAtCriticalAttack = 13000
        PVEAtCriticalAttack: 13000,
    };
}

// 몬스터용 기본 7스탯 — 몬스터는 기본 스탯 치환 없이 능력치 직접 지정 방식 사용
const MONSTER_BASE_STATS = { STR: 0, DEX: 0, INT: 0, AGI: 0, CON: 0, WIS: 0, LUK: 0 };

// 몬스터 능력치 계산 — computeStats 파이프라인 통과 (캐릭터와 동일한 구조)
// 반환 필드명은 calcCharStats와 완전히 동일하게 유지
function calcMonsterStats(lv) {
    const s = computeStats(getMonsterStatBonuses(lv), MONSTER_BASE_STATS);
    return {
        maxHP:         s.MaxHP,
        maxMP:         s.MaxMP,
        hpRegen:       s.HPRegen,
        mpRegen:       s.MPRegen,
        meleeMinAtk:   s.MeleeMinAttack,
        meleeMaxAtk:   s.MeleeMaxAttack,
        meleeDef:      s.MeleeDefense,
        rangedDef:     s.RangedDefense,
        magicDef:      s.MagicDefense,
        meleeAccuracy: s.MeleeAccuracy,
        meleeEvasion:  s.MeleeEvasion,
        critRate:          s.MeleeCritRate,
        critMul:           s.CritMultiplier,
        critResist:        s.MeleeCritResist / 100,
        meleeCritDmgReduc: s.MeleyCriticalDamageReduction, // 치명타 피해 감소율 (10000 단위, 방어자 적용)
        rangedEvasion:      s.RangedEvasion,
        magicEvasion:       s.MagicEvasion,
        rangedCritResist:   s.RangedCritResist / 100,
        magicCritResist:    s.MagicCritResist / 100,
        rangedCritDmgReduc: s.RangedCriticalDamageReduction,
        magicCritDmgReduc:  s.MagicCriticalDamageReduction,
        attackSpeed:       s.AttackSpeed,
        moveSpeed:         s.MoveSpeed,
    };
}

// 공격 타입(melee/ranged/magic)에 따라 공격자·방어자 스탯과 1차 대미지 감소 한계를 묶어 반환
// cStats: 공격자(캐릭터) 스탯, mStats: 방어자(몬스터) 스탯
function getAtkBundle(cStats, mStats, type) {
    if (type === 'ranged') return {
        minAtk:       cStats.rangedMinAtk   || 0,
        maxAtk:       cStats.rangedMaxAtk   || 0,
        accuracy:     cStats.rangedAccuracy || 0,
        critRate:     cStats.rangedCritRate || 0,
        defAll:       Math.max(0, (mStats.rangedDef || 0) - (cStats.defPenetrationRanged || 0)),
        defCritReduc: mStats.rangedCritDmgReduc || 0,
        min1st:       MIN_1ST_DEC_RANGE,
        max1st:       MAX_1ST_DEC_RANGE,
        critResist:   mStats.rangedCritResist || 0,
        evasion:      mStats.rangedEvasion   || 0,
        typeLabel:    '원거리',
    };
    if (type === 'magic') return {
        minAtk:       cStats.magicMinAtk   || 0,
        maxAtk:       cStats.magicMaxAtk   || 0,
        accuracy:     cStats.magicAccuracy || 0,
        critRate:     cStats.magicCritRate || 0,
        defAll:       Math.max(0, (mStats.magicDef || 0) - (cStats.defPenetrationMagic || 0)),
        defCritReduc: mStats.magicCritDmgReduc || 0,
        min1st:       MIN_1ST_DEC_MAGIC,
        max1st:       MAX_1ST_DEC_MAGIC,
        critResist:   mStats.magicCritResist || 0,
        evasion:      mStats.magicEvasion   || 0,
        typeLabel:    '마법',
    };
    // 기본: melee (근거리)
    return {
        minAtk:       cStats.meleeMinAtk   || 0,
        maxAtk:       cStats.meleeMaxAtk   || 0,
        accuracy:     cStats.meleeAccuracy || 0,
        critRate:     cStats.critRate      || 0,
        defAll:       Math.max(0, (mStats.meleeDef || 0) - (cStats.defPenetrationMelee || 0)),
        defCritReduc: mStats.meleeCritDmgReduc || 0,
        min1st:       MIN_1ST_DEC_PHYS,
        max1st:       MAX_1ST_DEC_PHYS,
        critResist:   mStats.critResist    || 0,
        evasion:      mStats.meleeEvasion  || 0,
        typeLabel:    '근거리',
    };
}

// ── 기획서 103_전투_속도 공식 ──────────────────────────────────────────────────
// ResultNormalAttackSpeed(초) = 1 / ( TotalAttackSpeed / AttackSpeedCorrectionValue )
// TotalAttackSpeed = 레벨 능력치(AttackSpeed 합산). 0이면 Infinity 반환 → 공격 불가
function getCharAttackInterval() {
    const s       = calcCharStats(character.level || 1);
    const totalAS = s.attackSpeed || 0;
    if (totalAS <= 0) return Infinity; // 공격속도 미설정 시 공격 불가
    return Math.max(100, Math.round(1000 / (totalAS / Math.max(1, ATTACK_SPEED_CORRECTION))));
}

// ResultMoveSpeed = TotalMoveSpeed = 레벨 능력치(MoveSpeed 합산). 0이면 이동 불가
function getCharMoveSpeed() {
    const s = calcCharStats(character.level || 1);
    return Math.max(0, s.moveSpeed || 0);
}

// 1차 대미지 감소율 계산 — 기획서 102_전투_대미지 §5 공식 (10단계 선형 보간)
// defAll: 방어력 합산값, minLim/maxLim: 클램프 범위 (10000 단위)
// 반환값: 최종 1차 감소율 (10000 단위, minLim~maxLim 범위 내)
function calc1stDamageDecreaseRate(defAll, minLim, maxLim) {
    if (defAll <= 0) return Math.max(minLim, 0);
    const v = DEF_CORR_VAL;
    const r = DEF_DEC_RATE;
    let raw;
    if      (defAll <= v[0]) raw = r[0] * defAll / v[0];
    else if (defAll <= v[1]) raw = r[0] + r[1] * (defAll - v[0]) / (v[1] - v[0]);
    else if (defAll <= v[2]) raw = r[0]+r[1] + r[2] * (defAll - v[1]) / (v[2] - v[1]);
    else if (defAll <= v[3]) raw = r[0]+r[1]+r[2] + r[3] * (defAll - v[2]) / (v[3] - v[2]);
    else if (defAll <= v[4]) raw = r[0]+r[1]+r[2]+r[3] + r[4] * (defAll - v[3]) / (v[4] - v[3]);
    else if (defAll <= v[5]) raw = r[0]+r[1]+r[2]+r[3]+r[4] + r[5] * (defAll - v[4]) / (v[5] - v[4]);
    else if (defAll <= v[6]) raw = r[0]+r[1]+r[2]+r[3]+r[4]+r[5] + r[6] * (defAll - v[5]) / (v[6] - v[5]);
    else if (defAll <= v[7]) raw = r[0]+r[1]+r[2]+r[3]+r[4]+r[5]+r[6] + r[7] * (defAll - v[6]) / (v[7] - v[6]);
    else if (defAll <= v[8]) raw = r[0]+r[1]+r[2]+r[3]+r[4]+r[5]+r[6]+r[7] + r[8] * (defAll - v[7]) / (v[8] - v[7]);
    else {
        const base = r[0]+r[1]+r[2]+r[3]+r[4]+r[5]+r[6]+r[7]+r[8];
        const span = v[9] - v[8];
        raw = base + (span > 0 ? r[9] * (defAll - v[8]) / span : r[9]);
    }
    return Math.min(maxLim, Math.max(minLim, Math.round(raw)));
}

// 최종 치명타율 계산 — 기획서 101_전투_치명타 ResultNormalMeleeCritical 공식 (PVE 근거리 기준)
// attackerCritPct: 공격자 치명타율 (0~100 자연 퍼센트), defenderResistPct: 방어자 치명타저항 (0~100)
// 반환값: 10000 단위 최종 치명타율 (CRIT_MIN_LIMIT ~ CRIT_MAX_LIMIT 범위 클램프 적용)
function calcCritRate(attackerCritPct, defenderResistPct) {
    const raw = Math.round((attackerCritPct - (defenderResistPct || 0)) * 100);
    return Math.min(CRIT_MAX_LIMIT, Math.max(CRIT_MIN_LIMIT, raw));
}

// ── 명중/회피 판정 (기획서 ResultMeleeAvoidanceRate 공식)
// 회피율 = (방어자 회피) - (공격자 명중), 범위 클램프 적용
// Random(1~10000) <= 회피율 → 회피 성공(Miss), 초과 → 명중(Hit)
// Config TID=5 / TID=4 — 기획자가 UI에서 실시간 변경 가능
// 입력 범위: 0~10000 (10000분의 1 단위, 예: 7500 = 75%)
// 내부 저장은 음수 포함 가능하지만, UI 입력은 0~10000만 허용
let MIN_AVOIDANCE = 0;      // 최소 회피율 (기본 0 = 0%)
let MAX_AVOIDANCE = 7500;   // 최대 회피율 (기본 7500 = 75%)
let showHPBars = false;     // HP바 표시 여부 (기본: 숨김)
let inTown     = false;     // 마을 체류 중 여부 (true = 전투 없음)

// ── 속도 설정 (기획서 103_전투_속도 기준) — 기획자가 공통 능력치 설정 UI에서 변경 가능
// ConfigTable.AttackSpeedCorrectionValue: 공격 주기 계산 시 기준이 되는 보정 계수
// 공격 주기(초) = 1 / (TotalAttackSpeed / AttackSpeedCorrectionValue)
// TotalAttackSpeed = 레벨 능력치(LV_STAT_CONFIG)에서 설정된 AttackSpeed 합산. 미설정 시 0 → 공격 불가
// TotalMoveSpeed   = 레벨 능력치(LV_STAT_CONFIG)에서 설정된 MoveSpeed 합산.   미설정 시 0 → 이동 불가
let ATTACK_SPEED_CORRECTION = 100;

// ── 치명타 제한 설정 (기획서 101_전투_치명타 기준) — 기획자가 공통 능력치 설정 UI에서 변경 가능
// ConfigTable.MaxCritialLimit (TID=82): 최종 치명타율 상한선
// ConfigTable.MinCritialLimit (TID=83): 최종 치명타율 하한선
// 단위: 10000분의 1 (예: 9500 = 95%, 0 = 0%)
// 판정 공식: Random(1~10000) ≤ ResultCriticalRate → 치명타 발동
let CRIT_MIN_LIMIT = 0;      // 치명타 최소 제한 (기본 0 = 0%)
let CRIT_MAX_LIMIT = 9500;   // 치명타 최대 제한 (기본 9500 = 95%)

// ── 대미지 공식 Config (기획서 102_전투_대미지) ───────────────────────────────
// 최솟값 보정 배율 (TID=74): 결과 대미지 < 공격자레벨 × (값/10000) 이면 해당 최솟값으로 대체
let MIN_DAMAGE_CORR_RATE = 1000;

// 1차 대미지 감소 — 방어력 구간 기준값 (TID=25, 34~42, DefenceCorrectionValue0~9)
// 방어력을 10개 구간으로 나누어 각 구간까지의 경계 방어력 수치
let DEF_CORR_VAL = [10, 25, 50, 100, 200, 350, 550, 800, 1100, 1500];

// 1차 대미지 감소 — 구간별 누적 최대 감소율 (TID=43~52, 10000 단위)
// 각 구간이 추가할 수 있는 최대 감소율. 누적 합산으로 최종 감소율이 결정됨
let DEF_DEC_RATE = [1000, 1500, 1500, 1000, 700, 500, 500, 300, 300, 200];

// 1차 대미지 감소율 Min/Max 클램프 (10000 단위 = 100%)
let MIN_1ST_DEC_PHYS  = 0;     // TID=15 근거리 1차 감소율 최솟값
let MAX_1ST_DEC_PHYS  = 7500;  // TID=16 근거리 1차 감소율 최댓값
let MIN_1ST_DEC_RANGE = 0;     // TID=75 원거리 1차 감소율 최솟값
let MAX_1ST_DEC_RANGE = 7500;  // TID=76 원거리 1차 감소율 최댓값
let MIN_1ST_DEC_MAGIC = 0;     // TID=17 마법 1차 감소율 최솟값
let MAX_1ST_DEC_MAGIC = 7500;  // TID=18 마법 1차 감소율 최댓값

// 3차 대미지 감소율(피해 감소율) Min/Max 클램프 (10000 단위)
let MIN_3RD_DEC_MELEE = 0;     // TID=28
let MAX_3RD_DEC_MELEE = 7500;  // TID=29
let MIN_3RD_DEC_RANGE = 0;     // TID=30
let MAX_3RD_DEC_RANGE = 7500;  // TID=31
let MIN_3RD_DEC_MAGIC = 0;     // TID=32
let MAX_3RD_DEC_MAGIC = 7500;  // TID=33

// 치명타 대미지 감소율 Min/Max + 보정 계수 (10000 단위)
let MIN_CRIT_DMG_DEC  = 0;     // TID=77
let MAX_CRIT_DMG_DEC  = 7500;  // TID=78
let CRIT_DMG_DEC_CORR = 100;   // TID=79 치명타 대미지 감소율 보정 계수

// 스킬 대미지 감소율 Min/Max + 보정 계수 (10000 단위)
let MIN_SKILL_DMG_DEC  = 0;    // TID=9
let MAX_SKILL_DMG_DEC  = 7500; // TID=10
let SKILL_DMG_DEC_CORR = 100;  // TID=11 스킬 대미지 감소율 보정 계수

// ─── 클래스 시스템 ───────────────────────────────────────────────────────────
// 클래스별 기본 스탯은 localStorage('versione_class_stats_<id>')에 저장.
// knight는 기존 versione_base_stats도 마이그레이션 소스로 활용.
const CLASS_DEFS = {
    knight:   { id:'knight',   label:'나이트', color:'#a8cce0', glow:'#3370c8',
                desc:'방패와 검으로 적을 막아서는 수호자',
                statHint:'CON·STR 중점',
                normalAtkType:'melee',  skillAtkType:'melee',
                defaultStats:{ STR:60, DEX:30, INT:20, AGI:30, CON:80, WIS:30, LUK:20 } },
    warrior:  { id:'warrior',  label:'워리어', color:'#e84040', glow:'#cc2222',
                desc:'양손 대검으로 적을 압도하는 돌격형 전사',
                statHint:'STR·CON 중점',
                normalAtkType:'melee',  skillAtkType:'melee',
                defaultStats:{ STR:100,DEX:40, INT:10, AGI:40, CON:70, WIS:10, LUK:20 } },
    assassin: { id:'assassin', label:'어쌔신', color:'#c060f0', glow:'#9020cc',
                desc:'쌍수 단검으로 급소를 노리는 암살자',
                statHint:'DEX·AGI·LUK 중점',
                normalAtkType:'melee',  skillAtkType:'melee',
                defaultStats:{ STR:60, DEX:100,INT:20, AGI:100,CON:40, WIS:20, LUK:60 } },
    archer:   { id:'archer',   label:'아처',   color:'#f07030', glow:'#c05010',
                desc:'장거리 활로 적을 정밀 타격하는 궁수',
                statHint:'DEX·AGI·LUK 중점',
                normalAtkType:'ranged', skillAtkType:'ranged',
                defaultStats:{ STR:40, DEX:80, INT:30, AGI:80, CON:50, WIS:30, LUK:70 } },
    cleric:   { id:'cleric',   label:'클레릭', color:'#ffd030', glow:'#c8a010',
                desc:'성스러운 오브로 적을 심판하는 성직자',
                statHint:'WIS·INT·CON 중점',
                normalAtkType:'magic',  skillAtkType:'magic',
                defaultStats:{ STR:30, DEX:30, INT:70, AGI:30, CON:60, WIS:100,LUK:40 } },
    sorcerer: { id:'sorcerer', label:'소서러', color:'#38d0e8', glow:'#20a8c8',
                desc:'강력한 마법 지팡이로 원거리를 공격하는 마법사',
                statHint:'INT·WIS·AGI 중점',
                normalAtkType:'magic',  skillAtkType:'magic',
                defaultStats:{ STR:20, DEX:40, INT:100,AGI:60, CON:40, WIS:80, LUK:40 } },
};
const CLASS_ORDER = ['knight','warrior','assassin','archer','cleric','sorcerer'];

// 현재 클래스 ID (기본: knight)
let currentClass = 'knight';

function loadCurrentClass() {
    currentClass = localStorage.getItem('versione_current_class') || 'knight';
    if (!CLASS_DEFS[currentClass]) currentClass = 'knight';
}
function saveCurrentClass() {
    localStorage.setItem('versione_current_class', currentClass);
}

// 클래스별 기본 스탯 로드 (없으면 기본값)
function loadClassBaseStats(classId) {
    try {
        const key = 'versione_class_stats_' + classId;
        const raw = localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
        // knight는 기존 versione_base_stats 마이그레이션
        if (classId === 'knight') {
            const legacy = localStorage.getItem('versione_base_stats');
            if (legacy) return JSON.parse(legacy);
        }
    } catch (_) {}
    return { ...CLASS_DEFS[classId].defaultStats };
}
function saveClassBaseStats(classId, stats) {
    localStorage.setItem('versione_class_stats_' + classId, JSON.stringify(stats));
    // knight는 호환성을 위해 기존 키도 갱신
    if (classId === 'knight') {
        localStorage.setItem('versione_base_stats', JSON.stringify(stats));
    }
}

// 클래스별 공격 타입(평타/스킬) 로드 (없으면 CLASS_DEFS 기본값 사용)
function loadClassAtkType(classId) {
    try {
        const raw = localStorage.getItem('versione_class_atktype_' + classId);
        if (raw) return JSON.parse(raw);
    } catch(_) {}
    const def = CLASS_DEFS[classId];
    return { normalAtkType: def.normalAtkType, skillAtkType: def.skillAtkType };
}

// 클래스별 공격 타입 저장
function saveClassAtkType(classId, normalType, skillType) {
    localStorage.setItem('versione_class_atktype_' + classId,
        JSON.stringify({ normalAtkType: normalType, skillAtkType: skillType }));
}

// 클래스 전환: 현재 스탯 저장 → 새 클래스 로드 → 재계산
function switchClass(classId) {
    if (!CLASS_DEFS[classId]) return;
    saveClassBaseStats(currentClass, { ...BASE_STATS });
    currentClass = classId;
    saveCurrentClass();
    BASE_STATS = loadClassBaseStats(classId);
    saveClassBaseStats(classId, BASE_STATS);
    // 공격 타입 로드 및 반영
    const at = loadClassAtkType(classId);
    character.normalAtkType = at.normalAtkType;
    character.skillAtkType  = at.skillAtkType;
    // 전투 스탯 즉시 재계산
    const s = calcCharStats(character.level);
    character.maxHP = s.maxHP;
    character.maxMP = s.maxMP;
    if (character.currentHP > character.maxHP) character.currentHP = character.maxHP;
    if (character.currentMP > character.maxMP) character.currentMP = character.maxMP;
    refreshUI();
    updateClassBadge();
    renderBaseStatGrid();
    saveCharacterState();
    // 모달 내 선택 상태 갱신
    renderClassGrid();
}

function updateClassBadge() {
    const def = CLASS_DEFS[currentClass];
    const dot  = document.getElementById('class-badge-dot');
    const name = document.getElementById('class-badge-name');
    if (dot)  { dot.style.background = def.color; }
    if (name) { name.textContent = def.label; name.style.color = def.color; }
}

// 클래스 모달에서 현재 편집 중인 클래스 ID (실제 currentClass와 독립적으로 관리)
let _cbsTargetClass  = null;
let _classModalPaused = false; // 모달이 게임을 일시정지했는지 추적

function openClassModal() {
    _cbsTargetClass = currentClass;
    renderClassGrid();
    renderClassStatPanel(_cbsTargetClass);
    document.getElementById('class-overlay').classList.add('open');
    // 게임 진행 중이면 일시정지 (모달 닫을 때 자동 재개)
    if (gameState === 'playing') { _classModalPaused = true; gameState = 'paused'; }
    else { _classModalPaused = false; }
}
function closeClassModal() {
    document.getElementById('class-overlay').classList.remove('open');
    // 모달이 일시정지한 경우에만 재개
    if (_classModalPaused) { gameState = 'playing'; lastTime = performance.now(); }
    _classModalPaused = false;
}

function renderClassGrid() {
    const grid = document.getElementById('class-grid');
    if (!grid) return;
    grid.innerHTML = CLASS_ORDER.map(id => {
        const def = CLASS_DEFS[id];
        const sel = id === (_cbsTargetClass || currentClass);
        return `<div class="class-card${sel ? ' selected' : ''}"
                     style="--selected-color:${def.color}"
                     id="class-card-${id}"
                     onclick="onClassCardClick('${id}')">
            <svg class="class-card-icon" viewBox="0 0 72 72">${getClassSVGIcon(id)}</svg>
            <div class="class-card-info">
                <div class="class-card-name" style="color:${def.color}">${def.label}</div>
                <div class="class-card-stats">${def.statHint}</div>
            </div>
        </div>`;
    }).join('');
}

function onClassCardClick(classId) {
    // 클래스 카드 선택 → 오른쪽 스탯 패널 갱신 (실제 클래스 변경은 [적용] 버튼으로)
    _cbsTargetClass = classId;
    // 선택 표시 갱신
    CLASS_ORDER.forEach(id => {
        const card = document.getElementById('class-card-' + id);
        if (card) card.classList.toggle('selected', id === classId);
    });
    renderClassStatPanel(classId);
    // 이미 현재 클래스이면 메시지 없음, 다른 클래스이면 안내
    const msg = document.getElementById('class-select-msg');
    if (msg) {
        if (classId === currentClass) {
            msg.textContent = '';
        } else {
            const def = CLASS_DEFS[classId];
            msg.textContent = `✔ ${def.label} 선택됨 — [적용] 버튼으로 클래스를 변경합니다.`;
        }
    }
}

// 오른쪽 스탯 편집 패널 렌더링
function renderClassStatPanel(classId) {
    const def  = CLASS_DEFS[classId];
    if (!def) return;

    // 헤더 업데이트
    const hName = document.getElementById('cbs-header-name');
    const hDesc = document.getElementById('cbs-header-desc');
    const hHint = document.getElementById('cbs-header-hint');
    if (hName) { hName.textContent = def.label; hName.style.color = def.color; }
    if (hDesc)   hDesc.textContent = def.desc;
    if (hHint)   hHint.textContent = def.statHint;

    // 해당 클래스의 저장된 스탯 로드 (없으면 defaultStats 사용)
    const storageKey = 'versione_class_stats_' + classId;
    let savedStats = def.defaultStats;
    try {
        const raw = localStorage.getItem(storageKey);
        if (raw) savedStats = Object.assign({}, def.defaultStats, JSON.parse(raw));
    } catch(e) {}

    // 치환 미리보기용 krMap
    const krMap = {};
    if (typeof STAT_LIST !== 'undefined') STAT_LIST.forEach(s => { krMap[s.en] = s.kr; });

    // 공격 타입 선택 영역 렌더링
    const atDiv = document.getElementById('cbs-atktype');
    if (atDiv) {
        const at = loadClassAtkType(classId);
        const typeOpts = [
            { val:'melee',  label:'근거리' },
            { val:'ranged', label:'원거리' },
            { val:'magic',  label:'마법'   },
        ];
        const btnStyle = (val, cur) =>
            `style="padding:4px 12px;border-radius:4px;border:1px solid ${val===cur ? def.color : '#30363d'};` +
            `background:${val===cur ? def.color+'22' : 'transparent'};color:${val===cur ? def.color : '#8b949e'};` +
            `font-size:15px;cursor:pointer;"`;
        const makeRow = (rowLabel, inputName, cur) =>
            `<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">` +
            `<span style="width:75px;font-size:15px;color:#8b949e;flex-shrink:0;">${rowLabel}</span>` +
            typeOpts.map(o =>
                `<label ${btnStyle(o.val, cur)}>` +
                `<input type="radio" name="${inputName}" value="${o.val}" ` +
                `${o.val===cur ? 'checked' : ''} style="display:none;" ` +
                `onchange="onCbsAtkTypeChange('${classId}')">` +
                `${o.label}</label>`
            ).join('') +
            `</div>`;
        atDiv.innerHTML =
            `<div style="font-size:15px;color:#c9d1d9;font-weight:700;margin-bottom:7px;">⚔ 공격 타입 설정</div>` +
            makeRow('평타 공격 타입', 'cbs-normal-atktype', at.normalAtkType) +
            makeRow('스킬 공격 타입', 'cbs-skill-atktype',  at.skillAtkType);
    }

    // 슬라이더 영역 렌더링
    const scroll = document.getElementById('cbs-scroll');
    if (!scroll) return;
    scroll.innerHTML = BASE_STAT_DEFS.map(d => {
        const val = (savedStats[d.key] !== undefined) ? savedStats[d.key] : 10;
        const preview = computeSubstitutionPreview(d.key, val, krMap);
        const previewHtml = preview.map(p =>
            `<div class="bsp-row"><span class="bsp-name">${p.label}(${p.key})</span><span class="bsp-val">${p.isPct ? '+' + (p.val/100).toFixed(2) + '%' : '+' + p.val}</span></div>`
        ).join('');
        return `
        <div class="bsc-card">
            <div class="bsc-left">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                    <span style="font-weight:700;color:#c9d1d9;">${d.label}</span>
                    <span style="font-size:15px;color:#8b949e;">${d.desc}</span>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                    <input type="range" min="1" max="1000"
                           value="${val}"
                           id="cbs-range-${d.key}"
                           style="flex:1;accent-color:${def.color};"
                           oninput="syncCbsInput('${d.key}')">
                    <input type="number" min="1" max="1000"
                           value="${val}"
                           id="cbs-num-${d.key}"
                           style="width:60px;background:#0d1117;border:1px solid #30363d;color:#c9d1d9;
                                  border-radius:4px;padding:3px 6px;text-align:center;font-size:15px;"
                           oninput="syncCbsRange('${d.key}')">
                </div>
            </div>
            <div class="bsc-right">
                <div class="bsp-title">▸ 치환 능력치 (현재값 기준)</div>
                <div class="bsp-grid" id="cbs-preview-${d.key}">${previewHtml}</div>
            </div>
        </div>`;
    }).join('');

    // 메시지 초기화
    const cbsMsg = document.getElementById('cbs-msg');
    if (cbsMsg) cbsMsg.textContent = '';
}

// 공격 타입 라디오 변경 시 버튼 색상 즉시 갱신
function onCbsAtkTypeChange(classId) {
    const def = CLASS_DEFS[classId];
    if (!def) return;
    ['cbs-normal-atktype', 'cbs-skill-atktype'].forEach(name => {
        document.querySelectorAll(`input[name="${name}"]`).forEach(input => {
            const label = input.parentElement;
            const sel   = input.checked;
            label.style.border     = `1px solid ${sel ? def.color : '#30363d'}`;
            label.style.background = sel ? def.color + '22' : 'transparent';
            label.style.color      = sel ? def.color : '#8b949e';
        });
    });
}

// 슬라이더 → 숫자 입력 동기화
function syncCbsInput(key) {
    const v = parseInt(document.getElementById('cbs-range-' + key).value) || 10;
    document.getElementById('cbs-num-' + key).value = v;
    updateCbsPreview(key);
}

// 숫자 입력 → 슬라이더 동기화
function syncCbsRange(key) {
    let v = parseInt(document.getElementById('cbs-num-' + key).value) || 10;
    v = Math.max(1, Math.min(1000, v));
    document.getElementById('cbs-num-' + key).value = v;
    document.getElementById('cbs-range-' + key).value = v;
    updateCbsPreview(key);
}

// 치환 미리보기 업데이트
function updateCbsPreview(key) {
    const v  = parseInt(document.getElementById('cbs-num-' + key).value) || 10;
    const el = document.getElementById('cbs-preview-' + key);
    if (!el) return;
    const krMap = {};
    if (typeof STAT_LIST !== 'undefined') STAT_LIST.forEach(s => { krMap[s.en] = s.kr; });
    const preview = computeSubstitutionPreview(key, v, krMap);
    el.innerHTML = preview.map(p =>
        `<div class="bsp-row"><span class="bsp-name">${p.label}(${p.key})</span><span class="bsp-val">${p.isPct ? '+' + (p.val/100).toFixed(2) + '%' : '+' + p.val}</span></div>`
    ).join('');
}

// [적용] 버튼 — 선택된 클래스로 변경 + 편집한 스탯 저장
function applyClassModalStats() {
    if (!_cbsTargetClass) return;
    const classId    = _cbsTargetClass;
    const def        = CLASS_DEFS[classId];
    const isNewClass = (classId !== currentClass);
    const newStats   = {};
    BASE_STAT_DEFS.forEach(d => {
        const v = parseInt(document.getElementById('cbs-num-' + d.key).value) || 10;
        newStats[d.key] = Math.max(1, Math.min(1000, v));
    });

    // 공격 타입 저장 (평타/스킬)
    const normalType = document.querySelector('input[name="cbs-normal-atktype"]:checked')?.value || def.normalAtkType;
    const skillType  = document.querySelector('input[name="cbs-skill-atktype"]:checked')?.value  || def.skillAtkType;
    saveClassAtkType(classId, normalType, skillType);

    // 해당 클래스 스탯 저장
    try {
        localStorage.setItem('versione_class_stats_' + classId, JSON.stringify(newStats));
        if (classId === 'knight') localStorage.setItem('versione_base_stats', JSON.stringify(newStats));
    } catch(e) {}

    // 클래스 변경 적용 (다른 클래스를 선택한 경우)
    if (isNewClass) {
        currentClass = classId;
        try { localStorage.setItem('versione_current_class', classId); } catch(e) {}
    }

    // 현재 클래스 스탯 및 공격 타입 반영
    BASE_STATS = Object.assign({}, newStats);
    saveBaseStats();
    if (classId === currentClass) {
        character.normalAtkType = normalType;
        character.skillAtkType  = skillType;
    }
    const s = calcCharStats(character.level);
    character.maxHP = s.maxHP;
    character.maxMP = s.maxMP;
    if (character.currentHP > character.maxHP) character.currentHP = character.maxHP;
    if (character.currentMP > character.maxMP) character.currentMP = character.maxMP;
    refreshUI();
    updateClassBadge();

    // 카드 선택 표시 갱신
    CLASS_ORDER.forEach(id => {
        const card = document.getElementById('class-card-' + id);
        if (card) card.classList.toggle('selected', id === classId);
    });

    const cbsMsg = document.getElementById('cbs-msg');
    if (cbsMsg) {
        cbsMsg.textContent = `✔ ${def.label} 기본 스탯이 저장되었습니다.`;
        setTimeout(() => { if (cbsMsg) cbsMsg.textContent = ''; }, 2500);
    }
    const selMsg = document.getElementById('class-select-msg');
    if (selMsg && isNewClass) {
        selMsg.textContent = `✔ ${def.label} 클래스로 변경되었습니다.`;
        setTimeout(() => { if (selMsg) selMsg.textContent = ''; }, 2500);
    }
}

// [초기화] 버튼 — 선택된 클래스의 defaultStats 으로 슬라이더 초기화
function resetClassModalStats() {
    if (!_cbsTargetClass) return;
    const def = CLASS_DEFS[_cbsTargetClass];
    if (!def) return;
    BASE_STAT_DEFS.forEach(d => {
        const defaultVal = (def.defaultStats[d.key] !== undefined) ? def.defaultStats[d.key] : 10;
        const numEl   = document.getElementById('cbs-num-'   + d.key);
        const rangeEl = document.getElementById('cbs-range-' + d.key);
        if (numEl)   numEl.value   = defaultVal;
        if (rangeEl) rangeEl.value = defaultVal;
        updateCbsPreview(d.key);
    });
    const cbsMsg = document.getElementById('cbs-msg');
    if (cbsMsg) {
        cbsMsg.style.color = '#e3b341';
        cbsMsg.textContent = `↺ ${def.label} 기본값으로 초기화되었습니다.`;
        setTimeout(() => { if (cbsMsg) { cbsMsg.textContent = ''; cbsMsg.style.color = '#3fb950'; } }, 2500);
    }
}

// 클래스별 SVG 아이콘 (72×72 뷰박스, 인라인 SVG)
function getClassSVGIcon(id) {
    switch (id) {
    case 'knight':
        // 방패+한손검 기사 (강철 청색)
        return `
        <defs><radialGradient id="kg" cx="50%" cy="40%"><stop offset="0%" stop-color="#d0eaf8"/><stop offset="100%" stop-color="#a8cce0"/></radialGradient></defs>
        <ellipse cx="36" cy="64" rx="18" ry="4" fill="#00000040"/>
        <rect x="26" y="34" width="18" height="24" rx="3" fill="url(#kg)" stroke="#080808" stroke-width="1.5"/>
        <ellipse cx="36" cy="28" rx="12" ry="13" fill="url(#kg)" stroke="#080808" stroke-width="1.5"/>
        <rect x="28" y="36" width="16" height="6" rx="1" fill="#00000030"/>
        <rect x="30" y="37" width="5" height="4" rx="1" fill="#00000060"/>
        <rect x="37" y="37" width="5" height="4" rx="1" fill="#00000060"/>
        <path d="M16 34 L16 52 L24 56 L24 34Z" fill="url(#kg)" stroke="#080808" stroke-width="1.5"/>
        <line x1="20" y1="38" x2="20" y2="52" stroke="#f0c030" stroke-width="1"/>
        <line x1="20" y1="45" x2="23" y2="45" stroke="#f0c030" stroke-width="1"/>
        <line x1="48" y1="16" x2="48" y2="44" stroke="#080808" stroke-width="4" stroke-linecap="round"/>
        <line x1="48" y1="16" x2="48" y2="44" stroke="#e8f4ff" stroke-width="2" stroke-linecap="round"/>
        <path d="M43 18 L48 10 L53 18Z" fill="#e8f4ff" stroke="#080808" stroke-width="1"/>
        <rect x="43" y="30" width="10" height="3" rx="1" fill="#f0c030" stroke="#080808" stroke-width="0.5"/>
        <ellipse cx="36" cy="27" rx="12" ry="4" fill="#a8cce020"/>
        <line x1="36" y1="18" x2="36" y2="38" stroke="#f0c030" stroke-width="1.2"/>`;
    case 'warrior':
        // 양손 대검 전사 (붉은 갑옷)
        return `
        <defs><radialGradient id="wg" cx="50%" cy="40%"><stop offset="0%" stop-color="#ff6060"/><stop offset="100%" stop-color="#e84040"/></radialGradient></defs>
        <ellipse cx="36" cy="64" rx="18" ry="4" fill="#00000040"/>
        <rect x="22" y="33" width="22" height="26" rx="3" fill="url(#wg)" stroke="#080808" stroke-width="1.5"/>
        <ellipse cx="33" cy="26" rx="12" ry="13" fill="url(#wg)" stroke="#080808" stroke-width="1.5"/>
        <rect x="25" y="35" width="20" height="7" rx="1" fill="#00000030"/>
        <rect x="27" y="36" width="6" height="5" rx="1" fill="#00000060"/>
        <rect x="35" y="36" width="6" height="5" rx="1" fill="#00000060"/>
        <ellipse cx="22" cy="32" rx="5" ry="4" fill="url(#wg)" stroke="#080808" stroke-width="1"/>
        <ellipse cx="44" cy="32" rx="5" ry="4" fill="url(#wg)" stroke="#080808" stroke-width="1"/>
        <line x1="50" y1="10" x2="50" y2="62" stroke="#080808" stroke-width="6" stroke-linecap="round"/>
        <line x1="50" y1="10" x2="50" y2="62" stroke="#e8f4ff" stroke-width="3" stroke-linecap="round"/>
        <path d="M44 12 L50 4 L56 12Z" fill="#e8f4ff" stroke="#080808" stroke-width="1.5"/>
        <rect x="44" y="34" width="12" height="4" rx="2" fill="#f0c030" stroke="#080808" stroke-width="1"/>
        <rect x="48" y="48" width="4" height="8" rx="1" fill="#7a5418" stroke="#080808" stroke-width="1"/>
        <line x1="33" y1="15" x2="33" y2="32" stroke="#f0c03060" stroke-width="1.5"/>`;
    case 'assassin':
        // 쌍수 단검 암살자 (선명 보라 후드)
        return `
        <defs><radialGradient id="ag" cx="50%" cy="40%"><stop offset="0%" stop-color="#e0a0ff"/><stop offset="100%" stop-color="#c060f0"/></radialGradient></defs>
        <ellipse cx="36" cy="64" rx="14" ry="4" fill="#00000040"/>
        <path d="M20 58 Q24 34 36 32 Q48 34 52 58Z" fill="#6633aa" stroke="#080808" stroke-width="1.5"/>
        <ellipse cx="36" cy="26" rx="10" ry="11" fill="url(#ag)" stroke="#080808" stroke-width="1.5"/>
        <path d="M26 20 Q36 12 46 20 Q48 26 36 28 Q24 26 26 20Z" fill="#4a2080" stroke="#080808" stroke-width="1"/>
        <rect x="25" y="30" width="8" height="4" rx="1" fill="#00000040"/>
        <rect x="39" y="30" width="8" height="4" rx="1" fill="#00000040"/>
        <line x1="18" y1="50" x2="26" y2="34" stroke="#080808" stroke-width="3" stroke-linecap="round"/>
        <line x1="18" y1="50" x2="26" y2="34" stroke="#c0c0d8" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M15 54 L18 48 L21 54Z" fill="#c0c0d8" stroke="#080808" stroke-width="1"/>
        <line x1="54" y1="50" x2="46" y2="34" stroke="#080808" stroke-width="3" stroke-linecap="round"/>
        <line x1="54" y1="50" x2="46" y2="34" stroke="#c0c0d8" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M51 54 L54 48 L57 54Z" fill="#c0c0d8" stroke="#080808" stroke-width="1"/>
        <ellipse cx="36" cy="26" rx="7" ry="3" fill="#c060f020"/>`;
    case 'archer':
        // 활 궁수 (주황 레인저)
        return `
        <defs><radialGradient id="rcg" cx="50%" cy="40%"><stop offset="0%" stop-color="#f8a060"/><stop offset="100%" stop-color="#f07030"/></radialGradient></defs>
        <ellipse cx="36" cy="64" rx="16" ry="4" fill="#00000040"/>
        <rect x="26" y="34" width="18" height="24" rx="3" fill="url(#rcg)" stroke="#080808" stroke-width="1.5"/>
        <ellipse cx="36" cy="26" rx="11" ry="12" fill="url(#rcg)" stroke="#080808" stroke-width="1.5"/>
        <path d="M25 19 Q36 10 47 19 Q48 24 36 26 Q24 24 25 19Z" fill="#7a4010" stroke="#080808" stroke-width="1"/>
        <rect x="27" y="36" width="16" height="7" rx="1" fill="#00000025"/>
        <path d="M16 12 Q12 36 16 58" stroke="#7a5418" stroke-width="2.5" stroke-linecap="round" fill="none"/>
        <line x1="16" y1="12" x2="16" y2="58" stroke="#5a3a08" stroke-width="0.5"/>
        <line x1="16" y1="12" x2="16" y2="58" stroke="#c8a060" stroke-width="0.8" stroke-dasharray="0"/>
        <line x1="16" y1="12" x2="16" y2="58" stroke="#c8a060" stroke-width="2" stroke-dasharray="46" stroke-dashoffset="0"/>
        <path d="M14 12 Q16 8 18 12" stroke="#7a5418" stroke-width="2" fill="none"/>
        <path d="M14 58 Q16 62 18 58" stroke="#7a5418" stroke-width="2" fill="none"/>
        <line x1="16" y1="35" x2="44" y2="35" stroke="#8b6914" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M44 31 L48 35 L44 39Z" fill="#f0e060" stroke="#080808" stroke-width="0.5"/>`;
    case 'cleric':
        // 오브 성직자 (순금/신성빛)
        return `
        <defs>
            <radialGradient id="clg" cx="50%" cy="40%"><stop offset="0%" stop-color="#fff090"/><stop offset="100%" stop-color="#ffd030"/></radialGradient>
            <radialGradient id="orb" cx="40%" cy="35%"><stop offset="0%" stop-color="#ffffff"/><stop offset="60%" stop-color="#ffffa0"/><stop offset="100%" stop-color="#ffd030"/></radialGradient>
        </defs>
        <ellipse cx="36" cy="64" rx="16" ry="4" fill="#00000040"/>
        <path d="M22 60 Q22 38 36 36 Q50 38 50 60Z" fill="#b08020" stroke="#080808" stroke-width="1.5"/>
        <rect x="28" y="40" width="16" height="20" rx="2" fill="#ffd030" stroke="#080808" stroke-width="1"/>
        <ellipse cx="36" cy="26" rx="11" ry="12" fill="url(#clg)" stroke="#080808" stroke-width="1.5"/>
        <path d="M25 20 Q36 12 47 20 Q48 25 36 28 Q24 25 25 20Z" fill="#9a7010" stroke="#080808" stroke-width="1"/>
        <ellipse cx="36" cy="16" rx="14" ry="3" fill="none" stroke="#ffd030" stroke-width="1.5" stroke-dasharray="3 2"/>
        <line x1="28" y1="44" x2="28" y2="58" stroke="#e8a80060" stroke-width="1.5"/>
        <line x1="36" y1="42" x2="36" y2="58" stroke="#e8a80060" stroke-width="1.5"/>
        <line x1="44" y1="44" x2="44" y2="58" stroke="#e8a80060" stroke-width="1.5"/>
        <circle cx="54" cy="32" r="9" fill="url(#orb)" stroke="#ffd030" stroke-width="1.5" filter="url(#glow)"/>
        <circle cx="51" cy="29" r="3" fill="white" opacity="0.5"/>
        <circle cx="54" cy="32" r="9" fill="none" stroke="#ffffff50" stroke-width="0.5"/>`;
    case 'sorcerer':
        // 지팡이 마법사 (시안 마법)
        return `
        <defs>
            <radialGradient id="sog" cx="50%" cy="40%"><stop offset="0%" stop-color="#90e8f8"/><stop offset="100%" stop-color="#38d0e8"/></radialGradient>
            <radialGradient id="gem" cx="35%" cy="35%"><stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#80f0f8"/><stop offset="100%" stop-color="#38d0e8"/></radialGradient>
        </defs>
        <ellipse cx="36" cy="64" rx="15" ry="4" fill="#00000040"/>
        <path d="M24 60 L24 38 Q24 34 28 34 L44 34 Q48 34 48 38 L48 60Z" fill="#3848a8" stroke="#080808" stroke-width="1.5"/>
        <rect x="28" y="42" width="16" height="18" rx="2" fill="url(#sog)" stroke="#080808" stroke-width="1" opacity="0.8"/>
        <ellipse cx="36" cy="26" rx="10" ry="11" fill="url(#sog)" stroke="#080808" stroke-width="1.5"/>
        <path d="M22 20 L36 10 L50 20 L48 28 L36 30 L24 28Z" fill="#2838a0" stroke="#080808" stroke-width="1.5"/>
        <path d="M36 10 L34 18 L38 18Z" fill="#38d0e8" stroke="#080808" stroke-width="0.5"/>
        <rect x="29" y="28" width="14" height="7" rx="1" fill="#00000030"/>
        <line x1="56" y1="10" x2="52" y2="62" stroke="#080808" stroke-width="3" stroke-linecap="round"/>
        <line x1="56" y1="10" x2="52" y2="62" stroke="#8890c8" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="56" cy="8" r="7" fill="url(#gem)" stroke="#38d0e8" stroke-width="1.5"/>
        <circle cx="53" cy="5" r="2.5" fill="white" opacity="0.6"/>
        <circle cx="56" cy="8" r="7" fill="none" stroke="#80e8f840" stroke-width="1.5"/>
        <circle cx="56" cy="8" r="10" fill="none" stroke="#38d0e820" stroke-width="2"/>`;
    default: return '';
    }
}

// ─── 기본 스탯 (STR/DEX/INT/AGI/CON/WIS/LUK) ─────────────────────────────
// 기본값은 클래스별 defaultStats. loadBaseStats()가 currentClass 기반으로 적재.
let BASE_STATS = { STR:10, DEX:10, INT:10, AGI:10, CON:10, WIS:10, LUK:10 };

function loadBaseStats() {
    BASE_STATS = loadClassBaseStats(currentClass);
}

function saveBaseStats() {
    saveClassBaseStats(currentClass, BASE_STATS);
    // 캐릭터 상태도 함께 저장해 character_info.html이 최신값을 가져갈 수 있도록 함
    saveCharacterState();
}

function judgeHit(attackerAcc, defenderEva) {
    const raw  = defenderEva - attackerAcc;
    const rate = Math.max(MIN_AVOIDANCE, Math.min(MAX_AVOIDANCE, raw));
    const roll = Math.floor(Math.random() * 10000) + 1;
    return roll > rate;   // true = 명중, false = 회피
}

// ────────────────────────────────────────────────
// 게임 초기화
// ────────────────────────────────────────────────
function initGame() {
    // 클래스 및 기본 스탯 로드
    loadCurrentClass();
    loadBaseStats();
    updateClassBadge();

    resizeCanvas();
    totalKills   = 0;
    particles    = [];
    logs         = [];
    currentStage = 1;
    stageKills   = 0;
    bossSpawned  = false;
    bossDefeated = false;
    // 게임 시작/재시작 시 항상 마을에서 출발
    inTown = true;
    updateTownUI();

    const stats  = calcCharStats(1);
    const atkTyp = loadClassAtkType(currentClass);
    character = {
        x:          TOWN_W / 2,
        y:          TOWN_H / 2 + 10,
        level:      1,
        exp:        0,
        atkTimer:   0,
        target:     null,
        radius:     18,
        hitFlash:   0,
        levelFlash: 0,
        normalAtkType: atkTyp.normalAtkType, // 평타 공격 타입 (melee/ranged/magic)
        skillAtkType:  atkTyp.skillAtkType,  // 스킬 공격 타입 (melee/ranged/magic)
        // HP / MP 시스템 (실제 전투용)
        maxHP:     stats.maxHP,
        currentHP: stats.maxHP,
        maxMP:     stats.maxMP,
        currentMP: stats.maxMP,
        regenTimer: 0,      // 자연 회복 타이머 (ms)
    };

    monsters = [];
    const monLv = stageLevel(currentStage);
    for (let i = 0; i < MONSTER_COUNT; i++) {
        monsters.push(spawnMonster(monLv, false, false));
    }

    addLog('게임 시작 — 1스테이지 필드에 입장했습니다.', 'info');
    refreshUI();
}

// 몬스터 객체 생성 (isBoss: 보스 몬스터 여부)
function spawnMonster(level, avoidCenter = true, isBoss = false) {
    let x, y, tries = 0;
    do {
        x = 40 + Math.random() * (canvas.width  - 80);
        y = 40 + Math.random() * (canvas.height - 80);
        tries++;
    } while (
        tries < 40 && (
            // 마을 구역(좌상단 TOWN_W×TOWN_H) 내에 스폰 금지
            (x < TOWN_W + 20 && y < TOWN_H + 20) ||
            // 캐릭터 주변 회피 (avoidCenter 옵션)
            (avoidCenter && Math.hypot(x - character.x, y - character.y) < 120)
        )
    );

    const baseHp = calcMonsterStats(level).maxHP;
    const maxHP  = isBoss ? baseHp * 10 : baseHp; // 보스는 HP 10배
    return {
        x, y, level,
        isBoss,
        maxHP,
        hp:          maxHP,
        isDead:      false,
        respawnLeft: 0,
        radius:      isBoss ? 22 : 13,   // 보스는 더 큰 반지름
        wDx: Math.cos(Math.random() * Math.PI * 2),
        wDy: Math.sin(Math.random() * Math.PI * 2),
        wTimer: Math.random() * 3000,
        hitFlash: 0,
    };
}

// 레벨에 따른 몬스터 색상 (초록 → 노랑 → 주황 → 빨강 → 보라)
function monsterColor(level) {
    const t = (level - 1) / (MAX_LEVEL - 1);
    let r, g, b;
    if      (t < 0.25) { const s=t/0.25;        r=Math.round(s*255); g=200; b=50; }
    else if (t < 0.5)  { const s=(t-0.25)/0.25; r=255; g=Math.round(200-s*150); b=50; }
    else if (t < 0.75) { const s=(t-0.5)/0.25;  r=255; g=Math.round(50-s*50); b=Math.round(s*100); }
    else               { const s=(t-0.75)/0.25;  r=255; g=0; b=Math.round(100+s*155); }
    return `rgb(${r},${g},${b})`;
}

// ────────────────────────────────────────────────
// 게임 로직 업데이트
// ────────────────────────────────────────────────
function update(rawDelta) {
    const delta = rawDelta * gameSpeed;

    // 마을 체류 중이면 타겟을 해제
    if (inTown) {
        character.target = null;
    } else if (!character.target || character.target.isDead) {
        character.target = findNearest();
    }

    character.hitFlash   = Math.max(0, character.hitFlash   - delta);
    character.levelFlash = Math.max(0, character.levelFlash - delta);

    // HP / MP 자연 회복 (1초마다 회복, 마을에서는 2배 속도)
    character.regenTimer += delta;
    const regenTick = inTown ? 500 : 1000; // 마을에서 회복 주기 절반 (2배 빠름)
    if (character.regenTimer >= regenTick) {
        character.regenTimer -= regenTick;
        const s = calcCharStats(character.level);
        character.currentHP = Math.min(character.maxHP, character.currentHP + s.hpRegen);
        character.currentMP = Math.min(character.maxMP, character.currentMP + s.mpRegen);
    }

    // 캐릭터 이동·공격: 마을 체류 중에는 정지
    if (!inTown && character.currentHP > 0 && character.target) {
        const dx   = character.target.x - character.x;
        const dy   = character.target.y - character.y;
        const dist = Math.hypot(dx, dy);

        if (dist > ATK_RANGE) {
            const spd = getCharMoveSpeed() * (delta / 1000);
            character.x += (dx / dist) * spd;
            character.y += (dy / dist) * spd;
        } else {
            character.atkTimer -= delta;
            if (character.atkTimer <= 0) {
                character.atkTimer = getCharAttackInterval();
                doAttack(character.target);
            }
        }
    }

    character.x = Math.max(character.radius, Math.min(canvas.width  - character.radius, character.x));
    character.y = Math.max(character.radius, Math.min(canvas.height - character.radius, character.y));

    for (const m of monsters) {
        if (m.isDead) {
            m.respawnLeft -= delta;
            if (m.respawnLeft <= 0) reviveMonster(m);
        } else {
            m.hitFlash = Math.max(0, m.hitFlash - delta);
            m.wTimer -= delta;
            if (m.wTimer <= 0) {
                m.wTimer = 2000 + Math.random() * 2000;
                const a = Math.random() * Math.PI * 2;
                m.wDx = Math.cos(a);
                m.wDy = Math.sin(a);
            }
            // 타겟 당한 몬스터는 캐릭터에게 접근하며 반격
            // 보스는 이동·반격 속도 1.5배
            const bossSpeedMul = m.isBoss ? 1.5 : 1.0;
            // 마을 체류 중이면 몬스터가 캐릭터를 추적·반격하지 않음
            if (!inTown && character.target === m && character.currentHP > 0) {
                const mdx  = character.x - m.x;
                const mdy  = character.y - m.y;
                const mdist = Math.hypot(mdx, mdy);
                if (mdist > ATK_RANGE) {
                    const mspd = WANDER_SPEED * 1.5 * bossSpeedMul * (delta / 1000);
                    m.x += (mdx / mdist) * mspd;
                    m.y += (mdy / mdist) * mspd;
                } else {
                    // 보스 반격 주기: 기본 800~1200ms → 보스 533~800ms (1.5배 빠름)
                    const baseTimer = Math.round((800 + Math.random() * 400) / bossSpeedMul);
                    if (!m.atkTimer) m.atkTimer = baseTimer;
                    m.atkTimer -= delta;
                    if (m.atkTimer <= 0) {
                        m.atkTimer = baseTimer;
                        monsterAttack(m);
                    }
                }
            } else {
                m.x += m.wDx * WANDER_SPEED * bossSpeedMul * (delta / 1000);
                m.y += m.wDy * WANDER_SPEED * bossSpeedMul * (delta / 1000);
            }
            if (m.x < m.radius || m.x > canvas.width  - m.radius) {
                m.wDx *= -1;
                m.x = Math.max(m.radius, Math.min(canvas.width  - m.radius, m.x));
            }
            if (m.y < m.radius || m.y > canvas.height - m.radius) {
                m.wDy *= -1;
                m.y = Math.max(m.radius, Math.min(canvas.height - m.radius, m.y));
            }
            // 마을 구역(좌상단) 진입 방지: 경계에서 튕겨냄
            if (m.x - m.radius < TOWN_W && m.y - m.radius < TOWN_H) {
                const overX = TOWN_W - (m.x - m.radius);
                const overY = TOWN_H - (m.y - m.radius);
                if (overX < overY) {
                    m.x = TOWN_W + m.radius;
                    m.wDx = Math.abs(m.wDx); // 오른쪽으로 방향 전환
                } else {
                    m.y = TOWN_H + m.radius;
                    m.wDy = Math.abs(m.wDy); // 아래로 방향 전환
                }
            }
        }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.y  += p.vy * (delta / 1000);
        p.vy *= 0.94;
        p.life -= delta;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function findNearest() {
    let best = null, minD = Infinity;
    for (const m of monsters) {
        if (m.isDead) continue;
        const d = Math.hypot(m.x - character.x, m.y - character.y);
        if (d < minD) { minD = d; best = m; }
    }
    return best;
}

// 캐릭터 → 몬스터 공격
function doAttack(m) {
    const cStats  = calcCharStats(character.level);
    const mStats  = calcMonsterStats(m.level);
    const atkType = character.normalAtkType || 'melee'; // 평타 공격 타입
    const b       = getAtkBundle(cStats, mStats, atkType); // 타입별 스탯 묶음

    // ── 명중 판정 (PVE: 공격자=PC, 방어자=Monster)
    if (!judgeHit(b.accuracy, b.evasion)) {
        m.hitFlash = 80;
        particles.push({ x: m.x, y: m.y - m.radius - 4, text: 'MISS', color: '#8b949e', vy: -55, life: 700 });
        addLog(`⚡ 공격[${b.typeLabel}] → Miss! (명중:${b.accuracy} / 몬스터 회피:${b.evasion})`, 'miss');
        return;
    }

    // ── 치명타 판정 (기획서 101_전투_치명타, PVE NormalMelee/Ranged/Magic, JudgeType=1)
    const resultCritRate = calcCritRate(b.critRate, b.critResist);
    const isCrit = (Math.floor(Math.random() * 10000) + 1) <= resultCritRate;

    // ── 대미지 계산 (기획서 102_전투_대미지 PVE, AbilityType=1/2/3) ─────────
    // 1단계: 기본 공격력 산출
    //   치명타 실패: Random(Min~Max)
    //   치명타 성공: Max × 치명타 배율 (CritMultiplier = PVEAtCriticalAttack 합산 / 100)
    let baseAtk;
    if (isCrit) {
        baseAtk = Math.floor(b.maxAtk * cStats.critMul / 100);
    } else {
        baseAtk = b.minAtk + Math.floor(Math.random() * (b.maxAtk - b.minAtk + 1));
    }

    // 2단계: DamageBaseApliyPer 배율 (기본 공격 = 10000 = ×1)
    let dmg = baseAtk;

    // 3단계: 1차 대미지 감소 — 방어력 기반 10구간 선형 보간 (타입별 방어력·클램프 사용)
    const rate1st = calc1stDamageDecreaseRate(b.defAll, b.min1st, b.max1st);
    dmg = Math.floor(dmg * (1 - rate1st / 10000));

    // 5단계: 치명타 대미지 감소율 (치명타 성공 시에만, 방어자 타입별 감소율)
    if (isCrit) {
        const critReduc = Math.min(MAX_CRIT_DMG_DEC, Math.max(MIN_CRIT_DMG_DEC,
            CRIT_DMG_DEC_CORR > 0 ? Math.floor(b.defCritReduc / CRIT_DMG_DEC_CORR) : 0));
        dmg = Math.floor(dmg * (1 - critReduc / 10000));
    }

    // 8단계: 최솟값 보정 — 결과 < 공격자레벨 × (MinDamageCorrectionRate/10000) 이면 최솟값으로 대체
    const minDmg = Math.floor(character.level * MIN_DAMAGE_CORR_RATE / 10000);
    dmg = Math.max(minDmg, dmg);

    m.hp      -= dmg;
    m.hitFlash = 150;

    const color = isCrit ? '#ffd700' : '#ff7675';
    const label = isCrit ? `💥 ${dmg}!` : `-${dmg}`;
    particles.push({ x: m.x + (Math.random() - 0.5) * 14, y: m.y - m.radius - 4, text: label, color, vy: -65, life: 750 });

    if (isCrit)
        addLog(`⚡ 크리티컬[${b.typeLabel}]! → Lv.${m.level} 몬스터 ${dmg} 데미지 (공격:${baseAtk} 1차감소:${(rate1st/100).toFixed(2)}% | 치명타율:${(resultCritRate/100).toFixed(2)}%)`, 'crit');
    else
        addLog(`⚔ [${b.typeLabel}] Lv.${m.level} 몬스터 ${dmg} 데미지 (공격:${baseAtk} 1차감소:${(rate1st/100).toFixed(2)}%)`, 'normal');

    if (m.hp <= 0) killMonster(m);
}

// 몬스터 → 캐릭터 반격
function monsterAttack(m) {
    const cStats = calcCharStats(character.level);
    const mStats = calcMonsterStats(m.level);

    // ── 명중 판정 (PVE: 공격자=Monster, 방어자=PC)
    if (!judgeHit(mStats.meleeAccuracy, cStats.meleeEvasion)) {
        particles.push({ x: character.x, y: character.y - character.radius - 4, text: 'MISS', color: '#58a6ff', vy: -50, life: 650 });
        return;
    }

    // ── 치명타 판정 (기획서 101_전투_치명타, NormalMelee PVE)
    const resultCritRate = calcCritRate(mStats.critRate, cStats.critResist);
    const isCrit = (Math.floor(Math.random() * 10000) + 1) <= resultCritRate;

    // ── 대미지 계산 (기획서 102_전투_대미지 NormalMelee PVE, AbilityType=1) ─────
    // 1단계: 기본 공격력 (치명타 성공 = MaxAtk × 배율, 실패 = Random(Min~Max))
    let baseAtk;
    if (isCrit) {
        baseAtk = Math.floor(mStats.meleeMaxAtk * mStats.critMul / 100);
    } else {
        baseAtk = mStats.meleeMinAtk + Math.floor(Math.random() * (mStats.meleeMaxAtk - mStats.meleeMinAtk + 1));
    }

    // 2단계: DamageBaseApliyPer = 10000 (×1), 3단계: 추가 고정 공격력 없음

    // 4단계: 1차 대미지 감소 — 캐릭터 근거리 방어력 기반 (몬스터는 관통 없음)
    const defAll  = Math.max(0, cStats.meleeDef);
    const rate1st = calc1stDamageDecreaseRate(defAll, MIN_1ST_DEC_PHYS, MAX_1ST_DEC_PHYS);
    let dmg = Math.floor(baseAtk * (1 - rate1st / 10000));

    // 5단계: 치명타 대미지 감소율 (치명타 성공 시에만)
    if (isCrit) {
        const critReduc = Math.min(MAX_CRIT_DMG_DEC, Math.max(MIN_CRIT_DMG_DEC,
            CRIT_DMG_DEC_CORR > 0 ? Math.floor(cStats.meleeCritDmgReduc / CRIT_DMG_DEC_CORR) : 0));
        dmg = Math.floor(dmg * (1 - critReduc / 10000));
    }

    // 6단계: 최솟값 보정 (공격자 = 몬스터 레벨)
    const minDmg = Math.floor(m.level * MIN_DAMAGE_CORR_RATE / 10000);
    dmg = Math.max(minDmg, dmg);

    character.currentHP -= dmg;
    character.hitFlash   = 200;

    const color = isCrit ? '#ff4444' : '#ff7675';
    const label = isCrit ? `💥 -${dmg}!` : `-${dmg}`;
    particles.push({ x: character.x + (Math.random() - 0.5) * 12, y: character.y - character.radius - 4, text: label, color, vy: -55, life: 700 });

    if (isCrit)
        addLog(`⚡ 몬스터 크리티컬! → 캐릭터 ${dmg} 피해 (공격:${baseAtk} 1차감소:${(rate1st/100).toFixed(2)}%)`, 'damage');
    else
        addLog(`🩸 몬스터 반격 → 캐릭터 ${dmg} 피해 (HP: ${Math.max(0, character.currentHP)}/${character.maxHP})`, 'damage');

    if (character.currentHP <= 0) {
        character.currentHP = 0;
        addLog('💀 캐릭터 사망! 3초 후 부활합니다...', 'kill');
        // 부활: 3초 후 HP 완전 회복
        setTimeout(() => {
            character.currentHP = character.maxHP;
            character.currentMP = character.maxMP;
            character.target    = null;
            addLog('✨ 부활했습니다!', 'levelup');
            refreshUI();
        }, 3000);
    }
    refreshUI();
}

function killMonster(m) {
    m.isDead      = true;
    m.respawnLeft = m.isBoss ? 0 : RESPAWN_DELAY; // 보스는 부활하지 않음
    character.target = null;
    totalKills++;
    character.exp++;

    const starCount = m.isBoss ? 12 : 5;
    const starColor = m.isBoss ? '#ff4444' : '#f9ca24';
    for (let i = 0; i < starCount; i++) {
        particles.push({
            x: m.x + (Math.random() - 0.5) * 20,
            y: m.y,
            text: m.isBoss ? '💀' : '★',
            color: starColor,
            vy: -80 + Math.random() * 40,
            life: 700 + Math.random() * 400,
        });
    }

    // ── 보스 처치 → 스테이지 상승
    if (m.isBoss) {
        bossDefeated = true;
        addLog(`💀 보스 처치! [${currentStage}스테이지] 클리어!`, 'kill');
        advanceStage();
        refreshUI();
        return;
    }

    // ── 일반 몬스터 처치
    stageKills++;
    const need = expNeeded(character.level);
    addLog(`Lv.${m.level} 몬스터 처치 (${stageKills}/${bossRequiredKills(currentStage)}) → EXP ${character.exp}/${need}`, 'kill');

    // 보스 등장 조건 확인
    if (!bossSpawned && stageKills >= bossRequiredKills(currentStage)) {
        spawnBossMonster();
    }

    // 레벨업 처리
    while (character.exp >= expNeeded(character.level)) {
        character.exp -= expNeeded(character.level);
        character.level++;

        if (character.level > MAX_LEVEL) {
            character.level = 1;
            character.exp   = 0;
            addLog('🎊 MAX 레벨(300) 달성! 레벨이 1로 초기화됩니다.', 'reset');
            character.levelFlash = 1200;
            onLevelChanged(true);
            break;
        }

        addLog(`⬆ 레벨 업! Lv.${character.level}  (다음 레벨: ${expNeeded(character.level)} EXP)`, 'levelup');
        character.levelFlash = 600;
        onLevelChanged(true); // 레벨업 = 완전 회복 + 스탯 즉시 재계산
    }
    refreshUI();
}

// 보스 몬스터 등장
function spawnBossMonster() {
    bossSpawned = true;
    const monLv = stageLevel(currentStage);
    const boss  = spawnMonster(monLv, true, true);
    monsters.push(boss);
    addLog(`🔥 보스 등장! [${currentStage}스테이지] Lv.${monLv} 보스 — HP ${boss.maxHP}`, 'kill');

    // 보스 등장 화면 플래시
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: boss.x + (Math.random() - 0.5) * 40,
            y: boss.y - 20,
            text: '⚠',
            color: '#ff4500',
            vy: -60 + Math.random() * 30,
            life: 1000 + Math.random() * 500,
        });
    }
}

// 스테이지 클리어 → 다음 스테이지로
function advanceStage() {
    if (currentStage >= MAX_STAGE) {
        addLog('🏆 전체 스테이지 클리어! 최고 단계에 도달했습니다.', 'reset');
        return;
    }

    currentStage++;
    stageKills   = 0;
    bossSpawned  = false;
    bossDefeated = false;

    addLog(`▶ ${currentStage}스테이지 시작! 몬스터 레벨: ${stageLevel(currentStage)}`, 'info');

    // 기존 일반 몬스터들을 새 스테이지 레벨로 교체
    const monLv = stageLevel(currentStage);
    // 보스(isBoss)는 제거, 일반 몬스터만 새로 세팅
    for (let i = monsters.length - 1; i >= 0; i--) {
        if (monsters[i].isBoss) { monsters.splice(i, 1); }
    }
    // 살아있는 일반 몬스터 레벨 갱신
    for (const m of monsters) {
        if (!m.isDead) {
            m.level  = monLv;
            m.maxHP  = calcMonsterStats(monLv).maxHP;
            m.hp     = m.maxHP;
        }
    }
    // 죽은 몬스터도 레벨 업데이트
    for (const m of monsters) {
        if (m.isDead) {
            m.level       = monLv;
            m.maxHP       = calcMonsterStats(monLv).maxHP;
            m.respawnLeft = Math.min(m.respawnLeft, RESPAWN_DELAY);
        }
    }
}

function upgradeLivingMonsters() {
    // 몬스터 레벨은 스테이지 기준 — 캐릭터 레벨업 시에도 변경 없음
}

function resetAllMonsters() {
    const monLv = stageLevel(currentStage);
    // 보스는 제거
    for (let i = monsters.length - 1; i >= 0; i--) {
        if (monsters[i].isBoss) monsters.splice(i, 1);
    }
    for (const m of monsters) {
        m.isDead = false; m.respawnLeft = 0;
        m.level  = monLv;
        m.maxHP  = calcMonsterStats(monLv).maxHP;
        m.hp     = m.maxHP;
        m.x = 40 + Math.random() * (canvas.width  - 80);
        m.y = 40 + Math.random() * (canvas.height - 80);
        m.hitFlash = 0;
        const a = Math.random() * Math.PI * 2;
        m.wDx = Math.cos(a); m.wDy = Math.sin(a);
        m.wTimer = Math.random() * 3000;
    }
}

function reviveMonster(m) {
    // 보스 몬스터는 부활하지 않음 — 배열에서 제거
    if (m.isBoss) {
        const idx = monsters.indexOf(m);
        if (idx !== -1) monsters.splice(idx, 1);
        return;
    }

    let x, y, tries = 0;
    do {
        x = 40 + Math.random() * (canvas.width  - 80);
        y = 40 + Math.random() * (canvas.height - 80);
        tries++;
    } while (Math.hypot(x - character.x, y - character.y) < 90 && tries < 30);

    const monLv = stageLevel(currentStage);
    m.x = x; m.y = y;
    m.level       = monLv;
    m.maxHP       = calcMonsterStats(monLv).maxHP;
    m.hp          = m.maxHP;
    m.isDead      = false;
    m.respawnLeft = 0;
    m.hitFlash    = 0;
    const a = Math.random() * Math.PI * 2;
    m.wDx = Math.cos(a); m.wDy = Math.sin(a);
    m.wTimer = Math.random() * 3000;
}

function expNeeded(lv) { return lv * 10; }

// ────────────────────────────────────────────────
// 렌더링
// ────────────────────────────────────────────────
function draw() {
    const W = canvas.width, H = canvas.height;

    ctx.fillStyle = '#1a2a1a';
    ctx.fillRect(0, 0, W, H);

    // 격자
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += GRID_G) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += GRID_G) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    // ── 마을 구역 (좌상단 TOWN_W × TOWN_H)
    drawTownZone(W, H);

    // 레벨업 플래시
    if (character.levelFlash > 0) {
        const a = (character.levelFlash / 1200) * 0.25;
        ctx.fillStyle = `rgba(255,215,0,${a})`;
        ctx.fillRect(0, 0, W, H);
    }

    // 보스 등장 시 화면 붉은 경계선 효과 (맥동)
    if (bossSpawned && !bossDefeated) {
        const pulse = 0.04 + 0.03 * Math.sin(Date.now() / 400);
        ctx.fillStyle = `rgba(180,0,0,${pulse})`;
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = `rgba(255,50,0,${pulse * 4})`;
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, W - 6, H - 6);
    }

    // 스테이지 정보 캔버스 오버레이 (우상단)
    ctx.save();
    ctx.fillStyle = bossSpawned && !bossDefeated ? 'rgba(255,80,0,0.85)' : 'rgba(0,0,0,0.55)';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(
        bossSpawned && !bossDefeated
            ? `⚠ ${currentStage.toLocaleString()}스테이지 보스`
            : `${currentStage.toLocaleString()}스테이지  ${stageKills}/${bossRequiredKills(currentStage)}킬`,
        W - 8, 8
    );
    ctx.restore();

    // 일시정지 중에도 마지막 프레임 표시 (정적으로 유지)
    for (const m of monsters) drawMonster(m);
    drawCharacter();

    // 파티클
    for (const p of particles) {
        const a = Math.max(0, p.life / 700);
        ctx.globalAlpha   = a;
        ctx.fillStyle     = p.color;
        ctx.font          = 'bold 13px Arial';
        ctx.textAlign     = 'center';
        ctx.textBaseline  = 'middle';
        ctx.fillText(p.text, p.x, p.y);
    }
    ctx.globalAlpha = 1;
}

// 악마 스프라이트 — 보스 몬스터 전용 (뿔, 날개, 빛나는 눈, 송곳니)
function drawDemonSprite(cx, cy, r, bodyColor) {
    const isFlash  = bodyColor === '#ffffff';
    const body     = isFlash ? '#ffffff' : '#7a0000';
    const bodyDark = isFlash ? '#cccccc' : '#440000';
    const hornCol  = isFlash ? '#ffffff' : '#cc3300';
    const eyeCol   = isFlash ? '#ffffff' : '#ff5500';
    const wingCol  = isFlash ? 'rgba(200,200,200,0.75)' : 'rgba(55,0,0,0.88)';
    const wingLine = isFlash ? '#bbb' : '#550000';

    ctx.save();
    ctx.translate(cx, cy);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 지면 그림자
    ctx.fillStyle = 'rgba(80,0,0,0.32)';
    ctx.beginPath();
    ctx.ellipse(0, r*0.92, r*0.68, r*0.18, 0, 0, Math.PI*2);
    ctx.fill();

    // ── 날개 (몸통 뒤) ──
    const drawWing = (s) => {
        ctx.fillStyle = wingCol;
        ctx.strokeStyle = isFlash ? '#999' : '#2a0000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s*r*0.28, -r*0.18);
        ctx.quadraticCurveTo(s*r*1.28, -r*0.95, s*r*1.12, r*0.45);
        ctx.quadraticCurveTo(s*r*0.85,  r*0.18,  s*r*0.28,  r*0.32);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // 날개 갈비뼈 선
        ctx.strokeStyle = wingLine; ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(s*r*0.28,-r*0.08); ctx.quadraticCurveTo(s*r*1.05,-r*0.55,s*r*1.08,r*0.28);
        ctx.moveTo(s*r*0.28, r*0.08); ctx.quadraticCurveTo(s*r*0.78,-r*0.28,s*r*1.0, r*0.38);
        ctx.stroke();
    };
    drawWing(-1); drawWing(1);

    // ── 몸통 ──
    ctx.fillStyle = '#050000'; // 외곽 그림자
    ctx.beginPath(); ctx.ellipse(0,r*0.18,r*0.46,r*0.62,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(0,r*0.18,r*0.43,r*0.59,0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.stroke();
    // 몸통 근육선
    ctx.strokeStyle = bodyDark; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0,-r*0.3); ctx.lineTo(0,r*0.6); ctx.stroke();

    // ── 머리 ──
    ctx.fillStyle = '#050000';
    ctx.beginPath(); ctx.ellipse(0,-r*0.54,r*0.40,r*0.38,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.ellipse(0,-r*0.53,r*0.37,r*0.36,0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.stroke();

    // ── 뿔 ──
    ctx.strokeStyle = '#000'; ctx.lineWidth = 5.5; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r*0.22,-r*0.80); ctx.quadraticCurveTo(-r*0.58,-r*1.18,-r*0.34,-r*1.32); ctx.stroke();
    ctx.moveTo( r*0.22,-r*0.80); ctx.quadraticCurveTo( r*0.58,-r*1.18, r*0.34,-r*1.32); ctx.stroke();
    ctx.strokeStyle = hornCol; ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-r*0.22,-r*0.80); ctx.quadraticCurveTo(-r*0.56,-r*1.16,-r*0.33,-r*1.30); ctx.stroke();
    ctx.moveTo( r*0.22,-r*0.80); ctx.quadraticCurveTo( r*0.56,-r*1.16, r*0.33,-r*1.30); ctx.stroke();

    // ── 눈 (발광) ──
    ctx.save();
    ctx.shadowColor = eyeCol; ctx.shadowBlur = 12;
    ctx.fillStyle   = eyeCol;
    ctx.beginPath(); ctx.ellipse(-r*0.15,-r*0.58,r*0.10,r*0.07,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( r*0.15,-r*0.58,r*0.10,r*0.07,0,0,Math.PI*2); ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#ff0000';
    ctx.beginPath(); ctx.arc(-r*0.15,-r*0.58,r*0.05,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc( r*0.15,-r*0.58,r*0.05,0,Math.PI*2); ctx.fill();

    // ── 송곳니 ──
    ctx.fillStyle = isFlash ? '#ddd' : '#f4f0e0';
    ctx.strokeStyle = '#555'; ctx.lineWidth = 0.6;
    [[-0.10,-0.22],[ 0.02,-0.22]].forEach(([ox, bot]) => {
        ctx.beginPath();
        ctx.moveTo((ox-0.04)*r, -r*0.35);
        ctx.lineTo((ox)*r,       r*bot);
        ctx.lineTo((ox+0.04)*r, -r*0.35);
        ctx.closePath(); ctx.fill(); ctx.stroke();
    });

    // ── 발톱 ──
    ctx.fillStyle = isFlash ? '#ccc' : '#1a0000';
    ctx.strokeStyle = '#000'; ctx.lineWidth = 0.8;
    [-0.18,0,0.18].forEach(ox => {
        ctx.beginPath();
        ctx.moveTo(ox*r, r*0.68);
        ctx.lineTo((ox-0.06)*r, r*0.84);
        ctx.lineTo((ox+0.06)*r, r*0.84);
        ctx.closePath(); ctx.fill(); ctx.stroke();
    });

    ctx.restore();
}

function drawMonster(m) {
    if (m.isDead) {
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#555';
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#888';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const sec = Math.ceil(m.respawnLeft / 1000 / gameSpeed);
        ctx.fillText(sec + 's', m.x, m.y);
        return;
    }

    const isTarget = (character.target === m);

    if (isTarget) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,100,0.9)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius + 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    // 보스 외곽 발광 효과
    if (m.isBoss) {
        const pulse = 0.3 + 0.2 * Math.sin(Date.now() / 300); // 맥동 효과
        ctx.save();
        ctx.shadowColor = '#ff2200';
        ctx.shadowBlur  = 18;
        ctx.strokeStyle = `rgba(255,34,0,${pulse})`;
        ctx.lineWidth   = 3;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    // 몬스터 본체 색상: 보스는 위험한 짙은 빨강 계열
    let bodyColor;
    if (m.hitFlash > 0) {
        bodyColor = '#ffffff';
    } else if (m.isBoss) {
        bodyColor = '#cc0000'; // 보스: 짙은 빨강
    } else {
        bodyColor = monsterColor(m.level);
    }

    if (m.isBoss) {
        // 보스: 악마 스프라이트
        drawDemonSprite(m.x, m.y, m.radius, bodyColor);
    } else {
        // 일반 몬스터: 원형
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isTarget ? '#ffff64' : 'rgba(0,0,0,0.6)';
        ctx.lineWidth   = isTarget ? 2 : 1;
        ctx.stroke();
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('M', m.x, m.y);
    }

    // HP 바 (showHPBars가 true일 때만 표시)
    if (showHPBars) {
        const bW = m.isBoss ? 60 : 34, bH = m.isBoss ? 7 : 5;
        // 보스는 뿔이 radius*1.3 위까지 올라오므로 HP바를 더 높이 배치
        const bX = m.x - bW/2, bY = m.y - m.radius - (m.isBoss ? Math.round(m.radius*1.4) : 11);
        const hpR = m.hp / m.maxHP;
        ctx.fillStyle = m.isBoss ? '#330000' : '#222';
        ctx.fillRect(bX, bY, bW, bH);
        ctx.fillStyle = m.isBoss
            ? (hpR > 0.5 ? '#ff6600' : hpR > 0.25 ? '#ff3300' : '#cc0000')
            : (hpR > 0.5 ? '#3fb950' : hpR > 0.25 ? '#d29922' : '#f85149');
        ctx.fillRect(bX, bY, bW * hpR, bH);
        ctx.strokeStyle = m.isBoss ? '#660000' : '#111';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(bX, bY, bW, bH);

        ctx.fillStyle = m.isBoss ? '#ff9966' : '#ccc';
        ctx.font = m.isBoss ? 'bold 9px Arial' : '9px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(m.isBoss ? `[BOSS] Lv.${m.level}` : `Lv.${m.level}`, m.x, bY - 2);
        ctx.fillStyle = '#aaa';
        ctx.font = '8px Arial';
        ctx.textBaseline = 'top';
        ctx.fillText(`${m.hp}/${m.maxHP}`, m.x, bY + bH + 1);
    }
}

// ── 마을 구역 그리기
function drawTownZone(W, H) {
    ctx.save();

    // ── 마을 바닥: 따뜻한 돌바닥 갈색 (필드 #1a2a1a 숲 초록과 명확히 대비)
    ctx.fillStyle = '#2b1f10';
    ctx.fillRect(0, 0, TOWN_W, TOWN_H);

    // ── 돌 타일 패턴 (20×20 격자, 교차 행 오프셋으로 벽돌 느낌)
    const TILE = 20;
    ctx.strokeStyle = 'rgba(90,60,25,0.55)';
    ctx.lineWidth = 0.8;
    for (let row = 0; row * TILE < TOWN_H; row++) {
        const offset = (row % 2 === 0) ? 0 : TILE / 2;
        for (let col = -1; col * TILE + offset < TOWN_W + TILE; col++) {
            const tx = col * TILE + offset;
            const ty = row * TILE;
            // 타일 내부를 약간 밝게
            ctx.fillStyle = (row + col) % 2 === 0
                ? 'rgba(180,120,55,0.07)'
                : 'rgba(130,85,35,0.05)';
            ctx.fillRect(tx, ty, TILE - 1, TILE - 1);
            ctx.strokeRect(tx, ty, TILE - 1, TILE - 1);
        }
    }

    // ── 마을 체류 시 따뜻한 황금빛 안전 오버레이 (맥동)
    if (inTown) {
        const pulse = 0.05 + 0.03 * Math.sin(Date.now() / 600);
        ctx.fillStyle = `rgba(210,160,60,${pulse})`;
        ctx.fillRect(0, 0, TOWN_W, TOWN_H);
    }

    // ── 경계선: 황금빛(체류) / 주황(대기)
    const borderColor = inTown ? '#d4a017' : '#8a5a1a';
    ctx.strokeStyle = borderColor;
    ctx.lineWidth   = inTown ? 2.5 : 1.5;
    ctx.strokeRect(1, 1, TOWN_W - 2, TOWN_H - 2);

    // ── 마을 지역 정보 + 전투 정지 텍스트 — 모두 하단에 배치
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'bottom';

    // 힌트 (맨 아래)
    if (inTown) {
        ctx.fillStyle = 'rgba(248,81,73,0.80)';
        ctx.font      = '10px Arial';
        ctx.fillText('사이드바 [전투 재개] 버튼으로 나가기', TOWN_W / 2, TOWN_H - 4);
    }

    // 안전 구역 / 전투 정지
    ctx.fillStyle = inTown ? 'rgba(255,215,0,0.95)' : 'rgba(200,130,50,0.55)';
    ctx.font      = inTown ? 'bold 11px Arial' : '10px Arial';
    ctx.fillText(
        inTown ? '🛡 안전 구역 — 전투 정지' : '안전 구역',
        TOWN_W / 2,
        inTown ? TOWN_H - 18 : TOWN_H - 6
    );

    // 스테이지 귀환처 이름
    ctx.fillStyle = `rgba(200,130,50,${inTown ? 0.85 : 0.55})`;
    ctx.font      = '10px Arial';
    ctx.fillText(`${currentStage.toLocaleString()}스테이지 귀환처`, TOWN_W / 2, TOWN_H - 32);

    // 마을 타이틀
    ctx.fillStyle = inTown ? '#ffd700' : '#c8832a';
    ctx.font      = 'bold 13px Arial';
    ctx.fillText('🏠 마을', TOWN_W / 2, TOWN_H - 46);

    // ── 필드와의 경계: 오른쪽·아래쪽에 그림자 효과
    const grad = ctx.createLinearGradient(TOWN_W - 20, 0, TOWN_W, 0);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(TOWN_W - 20, 0, 20, TOWN_H);

    const gradB = ctx.createLinearGradient(0, TOWN_H - 20, 0, TOWN_H);
    gradB.addColorStop(0, 'rgba(0,0,0,0)');
    gradB.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = gradB;
    ctx.fillRect(0, TOWN_H - 20, TOWN_W, 20);

    // ── 경계 강조선
    ctx.strokeStyle = 'rgba(200,130,50,0.5)';
    ctx.lineWidth   = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(TOWN_W, 0); ctx.lineTo(TOWN_W, TOWN_H);
    ctx.moveTo(0, TOWN_H); ctx.lineTo(TOWN_W, TOWN_H);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
}

// 기사 스프라이트 — canvas 벡터로 그린 갑옷 기사
// armorColor: 갑옷 주색 (플래시 상태 반영됨)
function drawKnightSprite(cx, cy, r, armorColor) {
    const outline = '#080808';          // 강한 다크 외곽선
    const trim    = '#f0c030';          // 밝은 금장
    const metal   = '#e8f4ff';          // 밝은 검날 은색
    const visor   = 'rgba(5,10,22,0.95)'; // 바이저 슬릿
    const grip    = '#7a5418';          // 손잡이

    ctx.save();
    ctx.translate(cx, cy);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 지면 그림자
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(0, r * 0.92, r * 0.68, r * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── 검 (몸통보다 먼저 그려 뒤에 위치) ──
    ctx.save();
    // 검날 외곽
    ctx.strokeStyle = outline;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(r * 0.56, r * 0.52);
    ctx.lineTo(r * 0.56, -r * 0.8);
    ctx.stroke();
    // 검날 색
    ctx.strokeStyle = metal;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(r * 0.56, r * 0.52);
    ctx.lineTo(r * 0.56, -r * 0.8);
    ctx.stroke();
    // 검 끝 (외곽 → 색)
    ctx.fillStyle = outline;
    ctx.beginPath();
    ctx.moveTo(r*0.44,-r*0.73); ctx.lineTo(r*0.56,-r*1.02); ctx.lineTo(r*0.68,-r*0.73); ctx.closePath(); ctx.fill();
    ctx.fillStyle = metal;
    ctx.beginPath();
    ctx.moveTo(r*0.46,-r*0.74); ctx.lineTo(r*0.56,-r*1.0); ctx.lineTo(r*0.66,-r*0.74); ctx.closePath(); ctx.fill();
    // 가드
    ctx.fillStyle = outline;
    ctx.fillRect(r*0.30, -r*0.06, r*0.52, r*0.13);
    ctx.fillStyle = trim;
    ctx.fillRect(r*0.32, -r*0.04, r*0.48, r*0.10);
    // 손잡이
    ctx.strokeStyle = outline; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(r*0.56,r*0.06); ctx.lineTo(r*0.56,r*0.42); ctx.stroke();
    ctx.strokeStyle = grip; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(r*0.56,r*0.06); ctx.lineTo(r*0.56,r*0.42); ctx.stroke();
    ctx.restore();

    // ── 방패 (왼쪽) ── 외곽 먼저, 색 위에
    ctx.beginPath();
    ctx.moveTo(-r*0.88,-r*0.18); ctx.lineTo(-r*0.36,-r*0.18);
    ctx.lineTo(-r*0.36,r*0.52);  ctx.lineTo(-r*0.62,r*0.72);
    ctx.lineTo(-r*0.88,r*0.52);  ctx.closePath();
    ctx.fillStyle = outline; ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r*0.86,-r*0.16); ctx.lineTo(-r*0.38,-r*0.16);
    ctx.lineTo(-r*0.38,r*0.50);  ctx.lineTo(-r*0.62,r*0.70);
    ctx.lineTo(-r*0.86,r*0.50);  ctx.closePath();
    ctx.fillStyle = armorColor; ctx.fill();
    ctx.strokeStyle = trim; ctx.lineWidth = 1.2; ctx.stroke();
    // 방패 십자 문양
    ctx.strokeStyle = trim; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-r*0.62,r*0.04); ctx.lineTo(-r*0.62,r*0.50);
    ctx.moveTo(-r*0.84,r*0.27); ctx.lineTo(-r*0.40,r*0.27);
    ctx.stroke();

    // ── 몸통 갑옷 ── 외곽 → 색
    ctx.fillStyle = outline;
    ctx.beginPath(); ctx.roundRect(-r*0.32,-r*0.28,r*0.66,r*0.90,4); ctx.fill();
    ctx.fillStyle = armorColor;
    ctx.beginPath(); ctx.roundRect(-r*0.30,-r*0.26,r*0.62,r*0.86,3); ctx.fill();
    ctx.strokeStyle = trim; ctx.lineWidth = 1; ctx.stroke();
    // 몸통 세로 선 장식
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-r*0.08,-r*0.10); ctx.lineTo(-r*0.08,r*0.50);
    ctx.moveTo( r*0.08,-r*0.10); ctx.lineTo( r*0.08,r*0.50);
    ctx.stroke();

    // ── 어깨 보호대 ──
    const drawPauldron = (sx) => {
        ctx.fillStyle = outline;
        ctx.beginPath(); ctx.ellipse(sx*r*0.43,-r*0.28,r*0.21,r*0.13,sx*0.25,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = armorColor;
        ctx.beginPath(); ctx.ellipse(sx*r*0.42,-r*0.27,r*0.19,r*0.11,sx*0.25,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle = trim; ctx.lineWidth = 1; ctx.stroke();
    };
    drawPauldron(-1); drawPauldron(1);

    // ── 투구 ── 외곽 → 색
    ctx.fillStyle = outline;
    ctx.beginPath();
    ctx.arc(0,-r*0.54,r*0.45,Math.PI,0);
    ctx.lineTo(r*0.45,-r*0.21); ctx.lineTo(-r*0.45,-r*0.21); ctx.closePath(); ctx.fill();
    ctx.fillStyle = armorColor;
    ctx.beginPath();
    ctx.arc(0,-r*0.54,r*0.43,Math.PI,0);
    ctx.lineTo(r*0.43,-r*0.22); ctx.lineTo(-r*0.43,-r*0.22); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = trim; ctx.lineWidth = 1; ctx.stroke();
    // 챙
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(-r*0.43,-r*0.30,r*0.86,r*0.10);
    // 바이저 슬릿
    ctx.fillStyle = visor;
    ctx.beginPath(); ctx.roundRect(-r*0.27,-r*0.57,r*0.20,r*0.09,2); ctx.fill();
    ctx.beginPath(); ctx.roundRect( r*0.07,-r*0.57,r*0.20,r*0.09,2); ctx.fill();
    // 투구 능선
    ctx.strokeStyle = trim; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(0,-r*0.97); ctx.lineTo(0,-r*0.22); ctx.stroke();

    ctx.restore();
}

// 워리어 스프라이트 — 양손 대검을 든 붉은 갑옷 전사
function drawWarriorSprite(cx, cy, r, armorColor) {
    const outline = '#080808';
    const trim    = '#cc2222';
    const metal   = '#e8f4ff';
    const grip    = '#5a2a0a';
    ctx.save();
    ctx.translate(cx, cy);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    // 지면 그림자
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath(); ctx.ellipse(0, r*0.92, r*0.72, r*0.20, 0, 0, Math.PI*2); ctx.fill();

    // ── 대검 (중앙 앞, 양손 그립) ──
    ctx.save();
    // 검날 외곽 (두꺼운 대검)
    ctx.strokeStyle = outline; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(r*0.08, r*0.55); ctx.lineTo(r*0.08, -r*0.90); ctx.stroke();
    ctx.strokeStyle = metal; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(r*0.08, r*0.55); ctx.lineTo(r*0.08, -r*0.90); ctx.stroke();
    // 검 끝
    ctx.fillStyle = outline;
    ctx.beginPath(); ctx.moveTo(-r*0.08,-r*0.82); ctx.lineTo(r*0.08,-r*1.12); ctx.lineTo(r*0.24,-r*0.82); ctx.closePath(); ctx.fill();
    ctx.fillStyle = metal;
    ctx.beginPath(); ctx.moveTo(-r*0.04,-r*0.83); ctx.lineTo(r*0.08,-r*1.09); ctx.lineTo(r*0.20,-r*0.83); ctx.closePath(); ctx.fill();
    // 크로스가드 (넓음)
    ctx.fillStyle = outline; ctx.fillRect(-r*0.36, -r*0.10, r*0.88, r*0.16);
    ctx.fillStyle = trim;    ctx.fillRect(-r*0.34, -r*0.08, r*0.84, r*0.12);
    // 그립 (양손 길이)
    ctx.strokeStyle = outline; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(r*0.08, r*0.10); ctx.lineTo(r*0.08, r*0.52); ctx.stroke();
    ctx.strokeStyle = grip; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(r*0.08, r*0.10); ctx.lineTo(r*0.08, r*0.52); ctx.stroke();
    // 폼멜
    ctx.fillStyle = outline; ctx.beginPath(); ctx.arc(r*0.08, r*0.55, r*0.09, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = trim;    ctx.beginPath(); ctx.arc(r*0.08, r*0.55, r*0.07, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    // ── 몸통 갑옷 (넓은 전사 체형) ──
    ctx.fillStyle = outline;
    ctx.beginPath(); ctx.roundRect(-r*0.40,-r*0.28,r*0.72,r*0.92,4); ctx.fill();
    ctx.fillStyle = armorColor;
    ctx.beginPath(); ctx.roundRect(-r*0.38,-r*0.26,r*0.68,r*0.88,3); ctx.fill();
    ctx.strokeStyle = trim; ctx.lineWidth = 1.5; ctx.stroke();
    // 흉갑 선
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-r*0.10,-r*0.10); ctx.lineTo(-r*0.10,r*0.50); ctx.stroke();
    ctx.beginPath(); ctx.moveTo( r*0.10,-r*0.10); ctx.lineTo( r*0.10,r*0.50); ctx.stroke();

    // ── 넓은 어깨 보호대 ──
    const drawPauldron = (sx) => {
        ctx.fillStyle = outline;
        ctx.beginPath(); ctx.ellipse(sx*r*0.48,-r*0.28,r*0.26,r*0.15,sx*0.3,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = armorColor;
        ctx.beginPath(); ctx.ellipse(sx*r*0.47,-r*0.27,r*0.23,r*0.13,sx*0.3,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle = trim; ctx.lineWidth = 1.2; ctx.stroke();
    };
    drawPauldron(-1); drawPauldron(1);

    // ── 투구 (오픈 바비큐 투구) ──
    ctx.fillStyle = outline;
    ctx.beginPath();
    ctx.arc(-r*0.02,-r*0.54,r*0.46,Math.PI,0);
    ctx.lineTo(r*0.44,-r*0.20); ctx.lineTo(-r*0.48,-r*0.20); ctx.closePath(); ctx.fill();
    ctx.fillStyle = armorColor;
    ctx.beginPath();
    ctx.arc(-r*0.02,-r*0.54,r*0.44,Math.PI,0);
    ctx.lineTo(r*0.42,-r*0.21); ctx.lineTo(-r*0.46,-r*0.21); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = trim; ctx.lineWidth = 1.2; ctx.stroke();
    // 얼굴 노출 (오픈 투구)
    ctx.fillStyle = '#3a2010';
    ctx.beginPath(); ctx.roundRect(-r*0.28,-r*0.68,r*0.52,r*0.46,r*0.12); ctx.fill();
    // 눈
    ctx.fillStyle = '#ff6622';
    ctx.beginPath(); ctx.ellipse(-r*0.14,-r*0.50,r*0.07,r*0.05,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( r*0.14,-r*0.50,r*0.07,r*0.05,0,0,Math.PI*2); ctx.fill();
    // 투구 능선
    ctx.strokeStyle = trim; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-r*0.02,-r*0.98); ctx.lineTo(-r*0.02,-r*0.20); ctx.stroke();

    ctx.restore();
}

// 어쌔신 스프라이트 — 쌍수 단검 암살자 (보라색 후드 망토)
function drawAssassinSprite(cx, cy, r, armorColor) {
    const outline = '#080808';
    const cloak   = '#4a2080';
    const metal   = '#d0d0e8';
    ctx.save();
    ctx.translate(cx, cy);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    // 지면 그림자
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath(); ctx.ellipse(0, r*0.92, r*0.55, r*0.15, 0, 0, Math.PI*2); ctx.fill();

    // ── 왼쪽 단검 ──
    ctx.save();
    ctx.strokeStyle = outline; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-r*0.62, r*0.55); ctx.lineTo(-r*0.28, -r*0.60); ctx.stroke();
    ctx.strokeStyle = metal; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-r*0.62, r*0.55); ctx.lineTo(-r*0.28, -r*0.60); ctx.stroke();
    ctx.fillStyle = outline;
    ctx.beginPath(); ctx.moveTo(-r*0.38,-r*0.52); ctx.lineTo(-r*0.28,-r*0.72); ctx.lineTo(-r*0.18,-r*0.52); ctx.closePath(); ctx.fill();
    ctx.fillStyle = metal;
    ctx.beginPath(); ctx.moveTo(-r*0.36,-r*0.53); ctx.lineTo(-r*0.28,-r*0.70); ctx.lineTo(-r*0.20,-r*0.53); ctx.closePath(); ctx.fill();
    ctx.fillStyle = outline; ctx.fillRect(-r*0.76, -r*0.08, r*0.40, r*0.10);
    ctx.fillStyle = '#7040a0'; ctx.fillRect(-r*0.74, -r*0.06, r*0.36, r*0.07);
    ctx.restore();

    // ── 오른쪽 단검 ──
    ctx.save();
    ctx.strokeStyle = outline; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(r*0.70, r*0.55); ctx.lineTo(r*0.36, -r*0.55); ctx.stroke();
    ctx.strokeStyle = metal; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(r*0.70, r*0.55); ctx.lineTo(r*0.36, -r*0.55); ctx.stroke();
    ctx.fillStyle = outline;
    ctx.beginPath(); ctx.moveTo(r*0.26,-r*0.47); ctx.lineTo(r*0.36,-r*0.68); ctx.lineTo(r*0.46,-r*0.47); ctx.closePath(); ctx.fill();
    ctx.fillStyle = metal;
    ctx.beginPath(); ctx.moveTo(r*0.28,-r*0.48); ctx.lineTo(r*0.36,-r*0.66); ctx.lineTo(r*0.44,-r*0.48); ctx.closePath(); ctx.fill();
    ctx.fillStyle = outline; ctx.fillRect(r*0.40, -r*0.05, r*0.40, r*0.10);
    ctx.fillStyle = '#7040a0'; ctx.fillRect(r*0.42, -r*0.03, r*0.36, r*0.07);
    ctx.restore();

    // ── 망토/로브 몸통 ──
    ctx.fillStyle = outline;
    ctx.beginPath();
    ctx.moveTo(-r*0.50, -r*0.10);
    ctx.lineTo(-r*0.38, r*0.85);
    ctx.lineTo(r*0.38, r*0.85);
    ctx.lineTo(r*0.50, -r*0.10);
    ctx.lineTo(r*0.30, -r*0.28);
    ctx.lineTo(-r*0.30, -r*0.28);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = cloak;
    ctx.beginPath();
    ctx.moveTo(-r*0.48, -r*0.09);
    ctx.lineTo(-r*0.36, r*0.83);
    ctx.lineTo(r*0.36, r*0.83);
    ctx.lineTo(r*0.48, -r*0.09);
    ctx.lineTo(r*0.28, -r*0.26);
    ctx.lineTo(-r*0.28, -r*0.26);
    ctx.closePath(); ctx.fill();
    // 망토 위에 어두운 갑옷
    ctx.fillStyle = armorColor;
    ctx.beginPath(); ctx.roundRect(-r*0.22,-r*0.26,r*0.44,r*0.60,3); ctx.fill();
    ctx.strokeStyle = '#9055cc'; ctx.lineWidth = 1; ctx.stroke();

    // ── 후드 얼굴 ──
    ctx.fillStyle = outline;
    ctx.beginPath();
    ctx.arc(0,-r*0.54,r*0.42,Math.PI*1.1,Math.PI*0.0,true);
    ctx.lineTo(r*0.36,-r*0.14); ctx.lineTo(-r*0.36,-r*0.14); ctx.closePath(); ctx.fill();
    ctx.fillStyle = cloak;
    ctx.beginPath();
    ctx.arc(0,-r*0.54,r*0.40,Math.PI*1.08,Math.PI*0.02,true);
    ctx.lineTo(r*0.34,-r*0.15); ctx.lineTo(-r*0.34,-r*0.15); ctx.closePath(); ctx.fill();
    // 얼굴 그림자 (후드 내부)
    ctx.fillStyle = '#1a0830';
    ctx.beginPath(); ctx.roundRect(-r*0.24,-r*0.65,r*0.48,r*0.46,r*0.14); ctx.fill();
    // 눈 (빛나는 보라)
    ctx.fillStyle = armorColor;
    ctx.shadowColor = armorColor; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.ellipse(-r*0.12,-r*0.48,r*0.06,r*0.04,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( r*0.12,-r*0.48,r*0.06,r*0.04,0,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
}

// 아처 스프라이트 — 활을 든 궁수 (레인저 갑옷)
function drawArcherSprite(cx, cy, r, armorColor) {
    const outline = '#080808';
    const leather = '#5a4020';
    const bowClr  = '#8b6014';
    const string  = '#e8e8c8';
    const metal   = '#e8e0b0'; // 화살촉 금속 색상
    ctx.save();
    ctx.translate(cx, cy);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    // 지면 그림자
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath(); ctx.ellipse(0, r*0.92, r*0.58, r*0.16, 0, 0, Math.PI*2); ctx.fill();

    // ── 장궁 (왼쪽) ──
    ctx.save();
    // 활 곡선 (위아래로 구부러진 형태)
    ctx.strokeStyle = outline; ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-r*0.70, -r*0.85);
    ctx.quadraticCurveTo(-r*1.05, 0, -r*0.70, r*0.85);
    ctx.stroke();
    ctx.strokeStyle = bowClr; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-r*0.70, -r*0.85);
    ctx.quadraticCurveTo(-r*1.03, 0, -r*0.70, r*0.85);
    ctx.stroke();
    // 활시위
    ctx.strokeStyle = string; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-r*0.70, -r*0.85); ctx.lineTo(-r*0.70, r*0.85); ctx.stroke();
    // 화살
    ctx.strokeStyle = outline; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-r*0.70, 0); ctx.lineTo(r*0.35, 0); ctx.stroke();
    ctx.strokeStyle = '#c8a060'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-r*0.70, 0); ctx.lineTo(r*0.35, 0); ctx.stroke();
    // 화살촉
    ctx.fillStyle = metal || '#e8e8f8';
    ctx.beginPath(); ctx.moveTo(r*0.20,-r*0.06); ctx.lineTo(r*0.40,0); ctx.lineTo(r*0.20,r*0.06); ctx.closePath(); ctx.fill();
    ctx.restore();

    // ── 몸통 (슬림 가죽 갑옷) ──
    ctx.fillStyle = outline;
    ctx.beginPath(); ctx.roundRect(-r*0.26,-r*0.28,r*0.54,r*0.85,3); ctx.fill();
    ctx.fillStyle = armorColor;
    ctx.beginPath(); ctx.roundRect(-r*0.24,-r*0.26,r*0.50,r*0.81,2); ctx.fill();
    ctx.strokeStyle = outline; ctx.lineWidth = 1; ctx.stroke();
    // 가죽 허리띠
    ctx.fillStyle = leather;
    ctx.fillRect(-r*0.24, r*0.20, r*0.50, r*0.10);
    // 파우치/벨트 포인트
    ctx.fillStyle = '#3a2a10';
    ctx.beginPath(); ctx.roundRect(-r*0.06, r*0.22, r*0.12, r*0.08, 2); ctx.fill();

    // ── 어깨 (슬림) ──
    const drawPauldron = (sx) => {
        ctx.fillStyle = outline;
        ctx.beginPath(); ctx.ellipse(sx*r*0.34,-r*0.26,r*0.16,r*0.10,sx*0.2,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = armorColor;
        ctx.beginPath(); ctx.ellipse(sx*r*0.33,-r*0.25,r*0.14,r*0.08,sx*0.2,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle = outline; ctx.lineWidth = 1; ctx.stroke();
    };
    drawPauldron(-1); drawPauldron(1);

    // ── 투구/후드 ──
    ctx.fillStyle = outline;
    ctx.beginPath();
    ctx.arc(0,-r*0.56,r*0.40,Math.PI,0);
    ctx.lineTo(r*0.40,-r*0.22); ctx.lineTo(-r*0.40,-r*0.22); ctx.closePath(); ctx.fill();
    ctx.fillStyle = armorColor;
    ctx.beginPath();
    ctx.arc(0,-r*0.56,r*0.38,Math.PI,0);
    ctx.lineTo(r*0.38,-r*0.23); ctx.lineTo(-r*0.38,-r*0.23); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = outline; ctx.lineWidth = 1; ctx.stroke();
    // 얼굴
    ctx.fillStyle = '#3a2a18';
    ctx.beginPath(); ctx.roundRect(-r*0.24,-r*0.66,r*0.48,r*0.42,r*0.10); ctx.fill();
    // 눈 (armorColor 계열로 통일)
    ctx.fillStyle = armorColor;
    ctx.beginPath(); ctx.ellipse(-r*0.12,-r*0.52,r*0.06,r*0.04,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( r*0.12,-r*0.52,r*0.06,r*0.04,0,0,Math.PI*2); ctx.fill();

    ctx.restore();
}

// 클레릭 스프라이트 — 오브를 들고 있는 성직자 (금빛 제의)
function drawClericSprite(cx, cy, r, armorColor) {
    const outline = '#080808';
    const robe    = '#8a6a10';
    const holy    = '#ffffa0';
    ctx.save();
    ctx.translate(cx, cy);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    // 지면 그림자
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath(); ctx.ellipse(0, r*0.92, r*0.62, r*0.17, 0, 0, Math.PI*2); ctx.fill();

    // ── 오브 (왼쪽 손) ──
    ctx.save();
    ctx.shadowColor = armorColor; ctx.shadowBlur = 14;
    ctx.fillStyle = armorColor;
    ctx.beginPath(); ctx.arc(-r*0.72, -r*0.22, r*0.26, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = outline;
    ctx.beginPath(); ctx.arc(-r*0.72, -r*0.22, r*0.26, 0, Math.PI*2); ctx.stroke();
    // 오브 내부 빛
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(-r*0.82, -r*0.30, r*0.09, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(-r*0.72, -r*0.22, r*0.22, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
    // 오브 링
    ctx.strokeStyle = '#ffffff80'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(-r*0.72, -r*0.22, r*0.30, 0, Math.PI*2); ctx.stroke();
    ctx.restore();

    // ── 로브 몸통 ──
    ctx.fillStyle = outline;
    ctx.beginPath();
    ctx.moveTo(-r*0.38, -r*0.24);
    ctx.lineTo(-r*0.48, r*0.88);
    ctx.lineTo(r*0.48, r*0.88);
    ctx.lineTo(r*0.38, -r*0.24);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = robe;
    ctx.beginPath();
    ctx.moveTo(-r*0.36, -r*0.22);
    ctx.lineTo(-r*0.46, r*0.86);
    ctx.lineTo(r*0.46, r*0.86);
    ctx.lineTo(r*0.36, -r*0.22);
    ctx.closePath(); ctx.fill();
    // 제의 장식 (금빛 줄)
    ctx.strokeStyle = armorColor; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0,-r*0.20); ctx.lineTo(0,r*0.80); ctx.stroke();
    ctx.strokeStyle = armorColor; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-r*0.30,r*0.10); ctx.lineTo(r*0.30,r*0.10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r*0.36,r*0.40); ctx.lineTo(r*0.36,r*0.40); ctx.stroke();
    // 오버레이 갑옷
    ctx.fillStyle = armorColor;
    ctx.globalAlpha = 0.25;
    ctx.beginPath(); ctx.roundRect(-r*0.26,-r*0.24,r*0.52,r*0.55,3); ctx.fill();
    ctx.globalAlpha = 1;

    // ── 어깨 ──
    const drawPauldron = (sx) => {
        ctx.fillStyle = outline;
        ctx.beginPath(); ctx.ellipse(sx*r*0.38,-r*0.24,r*0.18,r*0.12,sx*0.2,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = armorColor;
        ctx.beginPath(); ctx.ellipse(sx*r*0.37,-r*0.23,r*0.16,r*0.10,sx*0.2,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#d4a820'; ctx.lineWidth = 1; ctx.stroke();
    };
    drawPauldron(-1); drawPauldron(1);

    // ── 머리/두건 ──
    ctx.fillStyle = outline;
    ctx.beginPath(); ctx.arc(0,-r*0.56,r*0.42,Math.PI,0);
    ctx.lineTo(r*0.42,-r*0.22); ctx.lineTo(-r*0.42,-r*0.22); ctx.closePath(); ctx.fill();
    ctx.fillStyle = robe;
    ctx.beginPath(); ctx.arc(0,-r*0.56,r*0.40,Math.PI,0);
    ctx.lineTo(r*0.40,-r*0.23); ctx.lineTo(-r*0.40,-r*0.23); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = armorColor; ctx.lineWidth = 1.2; ctx.stroke();
    // 얼굴
    ctx.fillStyle = '#c89060';
    ctx.beginPath(); ctx.roundRect(-r*0.26,-r*0.66,r*0.52,r*0.44,r*0.12); ctx.fill();
    // 눈
    ctx.fillStyle = armorColor;
    ctx.beginPath(); ctx.ellipse(-r*0.12,-r*0.52,r*0.06,r*0.04,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( r*0.12,-r*0.52,r*0.06,r*0.04,0,0,Math.PI*2); ctx.fill();
    // 후광 링
    ctx.save();
    ctx.strokeStyle = armorColor; ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.ellipse(0,-r*1.02, r*0.38, r*0.10, 0, 0, Math.PI*2); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();

    ctx.restore();
}

// 소서러 스프라이트 — 지팡이를 든 마법사 (파란 로브, 마법 수정)
function drawSorcererSprite(cx, cy, r, armorColor) {
    const outline = '#080808';
    const robe    = '#223080';
    const gemClr  = armorColor;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    // 지면 그림자
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath(); ctx.ellipse(0, r*0.92, r*0.58, r*0.16, 0, 0, Math.PI*2); ctx.fill();

    // ── 지팡이 (오른쪽) ──
    ctx.save();
    ctx.strokeStyle = outline; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(r*0.62, r*0.80); ctx.lineTo(r*0.66, -r*0.72); ctx.stroke();
    ctx.strokeStyle = '#7050d0'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(r*0.62, r*0.80); ctx.lineTo(r*0.66, -r*0.72); ctx.stroke();
    // 수정 보석 (지팡이 끝)
    ctx.save();
    ctx.shadowColor = gemClr; ctx.shadowBlur = 16;
    ctx.fillStyle = gemClr;
    ctx.beginPath(); ctx.arc(r*0.66, -r*0.82, r*0.20, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = outline; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(r*0.66, -r*0.82, r*0.20, 0, Math.PI*2); ctx.stroke();
    // 수정 하이라이트
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(r*0.58, -r*0.89, r*0.07, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(r*0.66, -r*0.82, r*0.18, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;
    // 수정 링 (마법 효과)
    ctx.strokeStyle = gemClr + '80'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(r*0.66, -r*0.82, r*0.28, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(r*0.66, -r*0.82, r*0.36, 0, Math.PI*2); ctx.stroke();
    ctx.restore();
    ctx.restore();

    // ── 로브 몸통 ──
    ctx.fillStyle = outline;
    ctx.beginPath();
    ctx.moveTo(-r*0.34, -r*0.24);
    ctx.lineTo(-r*0.44, r*0.88);
    ctx.lineTo(r*0.42, r*0.88);
    ctx.lineTo(r*0.36, -r*0.24);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = robe;
    ctx.beginPath();
    ctx.moveTo(-r*0.32, -r*0.22);
    ctx.lineTo(-r*0.42, r*0.86);
    ctx.lineTo(r*0.40, r*0.86);
    ctx.lineTo(r*0.34, -r*0.22);
    ctx.closePath(); ctx.fill();
    // 로브 장식선
    ctx.strokeStyle = gemClr; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-r*0.28,r*0.00); ctx.lineTo(r*0.30,r*0.00); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r*0.34,r*0.30); ctx.lineTo(r*0.34,r*0.30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r*0.40,r*0.60); ctx.lineTo(r*0.38,r*0.60); ctx.stroke();
    // 가슴 갑옷 (마법 문양)
    ctx.fillStyle = gemClr;
    ctx.globalAlpha = 0.20;
    ctx.beginPath(); ctx.roundRect(-r*0.20,-r*0.22,r*0.40,r*0.40,3); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = gemClr; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.roundRect(-r*0.20,-r*0.22,r*0.40,r*0.40,3); ctx.stroke();

    // ── 어깨 (소서러는 작게) ──
    const drawPauldron = (sx) => {
        ctx.fillStyle = outline;
        ctx.beginPath(); ctx.ellipse(sx*r*0.34,-r*0.24,r*0.15,r*0.09,sx*0.2,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = armorColor;
        ctx.globalAlpha = 0.6;
        ctx.beginPath(); ctx.ellipse(sx*r*0.33,-r*0.23,r*0.13,r*0.07,sx*0.2,0,Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1;
    };
    drawPauldron(-1); drawPauldron(1);

    // ── 마법사 모자 ──
    ctx.fillStyle = outline;
    ctx.beginPath();
    ctx.arc(0,-r*0.54,r*0.40,Math.PI,0);
    ctx.lineTo(r*0.40,-r*0.22); ctx.lineTo(-r*0.40,-r*0.22); ctx.closePath(); ctx.fill();
    ctx.fillStyle = robe;
    ctx.beginPath();
    ctx.arc(0,-r*0.54,r*0.38,Math.PI,0);
    ctx.lineTo(r*0.38,-r*0.23); ctx.lineTo(-r*0.38,-r*0.23); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = gemClr; ctx.lineWidth = 1; ctx.stroke();
    // 모자 챙 (넓은)
    ctx.fillStyle = outline;
    ctx.beginPath(); ctx.ellipse(0,-r*0.30,r*0.52,r*0.12,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle = robe;
    ctx.beginPath(); ctx.ellipse(0,-r*0.30,r*0.50,r*0.10,0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = gemClr; ctx.lineWidth = 0.8; ctx.stroke();
    // 모자 뾰족한 끝
    ctx.fillStyle = outline;
    ctx.beginPath(); ctx.moveTo(-r*0.20,-r*0.80); ctx.lineTo(0,-r*1.10); ctx.lineTo(r*0.20,-r*0.80); ctx.closePath(); ctx.fill();
    ctx.fillStyle = robe;
    ctx.beginPath(); ctx.moveTo(-r*0.18,-r*0.80); ctx.lineTo(0,-r*1.08); ctx.lineTo(r*0.18,-r*0.80); ctx.closePath(); ctx.fill();
    // 모자 별 장식
    ctx.fillStyle = gemClr;
    ctx.beginPath(); ctx.arc(0,-r*0.96, r*0.06, 0, Math.PI*2); ctx.fill();
    // 얼굴
    ctx.fillStyle = '#2838a0';
    ctx.beginPath(); ctx.roundRect(-r*0.24,-r*0.62,r*0.48,r*0.40,r*0.10); ctx.fill();
    // 눈
    ctx.fillStyle = gemClr;
    ctx.shadowColor = gemClr; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.ellipse(-r*0.12,-r*0.50,r*0.07,r*0.05,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse( r*0.12,-r*0.50,r*0.07,r*0.05,0,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
}

function drawCharacter() {
    const c = character;

    // 공격 범위
    ctx.strokeStyle = 'rgba(88,166,255,0.10)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(c.x, c.y, ATK_RANGE, 0, Math.PI * 2);
    ctx.stroke();

    // 타겟 연결선
    if (c.target && !c.target.isDead) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,100,0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 5]);
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.target.x, c.target.y);
        ctx.stroke();
        ctx.restore();
    }

    // 클래스 색상 기반 갑옷 주색
    // inTown 상태는 별도 발광 링으로 표현 — 스프라이트 색 자체는 클래스 고유색 유지
    const classDef = CLASS_DEFS[currentClass] || CLASS_DEFS.knight;
    const baseArmorColor = classDef.color;
    const armorColor = c.hitFlash > 0   ? '#ffffff'
                     : c.levelFlash > 0 ? '#ffd700'
                     : baseArmorColor;

    // 항상 표시되는 클래스 색상 기반 외곽 발광
    ctx.save();
    ctx.shadowColor = classDef.glow;
    ctx.shadowBlur  = 8;                    // 발광 효과 활성화
    ctx.strokeStyle = classDef.glow + 'b0'; // 클래스별 고유 발광 링 색상 (약 69% 불투명도)
    ctx.lineWidth   = 2.5;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 마을 체류 / 레벨업 시 추가 발광
    if (inTown || c.levelFlash > 0) {
        ctx.save();
        ctx.shadowColor = c.levelFlash > 0 ? '#ffd700' : '#3fb950';
        ctx.shadowBlur  = 20;
        ctx.strokeStyle = c.levelFlash > 0 ? 'rgba(255,215,0,0.8)' : 'rgba(63,185,80,0.7)';
        ctx.lineWidth   = 3;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius + 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    // 피격 시 빨간 강한 링
    if (c.hitFlash > 0) {
        ctx.save();
        ctx.shadowColor = '#f85149';
        ctx.shadowBlur  = 16;
        ctx.strokeStyle = 'rgba(248,81,73,0.9)';
        ctx.lineWidth   = 3;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }

    // 클래스별 스프라이트 그리기
    switch (currentClass) {
        case 'warrior':  drawWarriorSprite(c.x, c.y, c.radius, armorColor);  break;
        case 'assassin': drawAssassinSprite(c.x, c.y, c.radius, armorColor); break;
        case 'archer':   drawArcherSprite(c.x, c.y, c.radius, armorColor);   break;
        case 'cleric':   drawClericSprite(c.x, c.y, c.radius, armorColor);   break;
        case 'sorcerer': drawSorcererSprite(c.x, c.y, c.radius, armorColor); break;
        default:         drawKnightSprite(c.x, c.y, c.radius, armorColor);   break;
    }

    // 레벨 텍스트 (캐릭터 위)
    ctx.fillStyle = c.levelFlash > 0 ? '#ffd700' : '#e6edf3';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`Lv.${c.level}`, c.x, c.y - c.radius - 6);

    // 클래스 이름 (캐릭터 아래)
    ctx.fillStyle = classDef.color;
    ctx.font = 'bold 10px Arial';
    ctx.textBaseline = 'top';
    ctx.fillText(classDef.label, c.x, c.y + c.radius + 9);

    // 캐릭터 HP 바 (showHPBars가 true일 때만 표시)
    if (showHPBars) {
        const bW = 50, bH = 5;
        const bX = c.x - bW / 2;
        const bY = c.y + c.radius + 10;
        const hpR = Math.max(0, c.currentHP / c.maxHP);
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(bX, bY, bW, bH);
        ctx.fillStyle = hpR > 0.5 ? '#3fb950' : hpR > 0.25 ? '#d29922' : '#f85149';
        ctx.fillRect(bX, bY, bW * hpR, bH);
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(bX, bY, bW, bH);
        ctx.fillStyle = '#aaa';
        ctx.font = '8px Arial';
        ctx.textBaseline = 'top';
        ctx.fillText(`${Math.max(0, c.currentHP)}/${c.maxHP}`, c.x, bY + bH + 1);
    }

    // 사망 상태 표시
    if (c.currentHP <= 0) {
        ctx.fillStyle = 'rgba(248,81,73,0.8)';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💀 사망', c.x, c.y);
    }
}

// ────────────────────────────────────────────────
// UI 갱신
// ────────────────────────────────────────────────
function refreshUI() {
    if (gameState === 'title') return;
    const need   = expNeeded(character.level);
    const expPct = Math.min(100, (character.exp / need) * 100).toFixed(1);

    document.getElementById('h-level').textContent    = character.level;
    document.getElementById('h-kills').textContent    = totalKills;
    document.getElementById('h-exp-bar').style.width  = expPct + '%';
    document.getElementById('h-exp-text').textContent = `${character.exp} / ${need}`;
    document.getElementById('h-stage').textContent    = currentStage.toLocaleString();

    document.getElementById('s-level').textContent    = character.level;
    document.getElementById('s-exp').textContent      = `${character.exp} / ${need}`;
    document.getElementById('s-kills').textContent    = totalKills;
    document.getElementById('s-monlevel').textContent = stageLevel(currentStage);
    document.getElementById('level-input').value      = character.level;

    // 스테이지 정보 갱신
    document.getElementById('s-stage').textContent       = currentStage.toLocaleString();
    const bossNeed = bossRequiredKills(currentStage);
    document.getElementById('s-stage-kills').textContent = `${stageKills} / ${bossNeed}`;
    const bossEl = document.getElementById('s-boss-status');
    if (bossDefeated) {
        bossEl.textContent = '처치 완료 ✓'; bossEl.style.color = '#3fb950';
    } else if (bossSpawned) {
        bossEl.textContent = '⚠ 보스 등장!'; bossEl.style.color = '#ff4500';
    } else {
        bossEl.textContent = `대기 중 (${bossNeed - stageKills}킬 남음)`; bossEl.style.color = '#8b949e';
    }

    const alive = monsters.filter(m => !m.isDead).length;
    document.getElementById('s-total').textContent = monsters.length;
    document.getElementById('s-alive').textContent = alive;
    document.getElementById('s-dead').textContent  = monsters.length - alive;

    // 1초마다 캐릭터 상태 저장 (캐릭터 정보 창 실시간 반영용, HP/MP 포함)
    if (!refreshUI._lastSave || Date.now() - refreshUI._lastSave > 1000) {
        saveCharacterState();
        refreshUI._lastSave = Date.now();
    }
}

// ────────────────────────────────────────────────
// 로그
// ────────────────────────────────────────────────
function addLog(msg, type = 'normal') {
    const ts = new Date().toLocaleTimeString('ko-KR', { hour12: false });
    logs.unshift({ msg, type, ts });
    if (logs.length > 80) logs.pop();
    const el = document.getElementById('log-list');
    // flex-direction:column-reverse 이므로 배열 그대로 렌더 → 최신이 아래에 표시됨
    el.innerHTML = logs.slice(0, 60).map(e =>
        `<div class="log-entry ${e.type}">[${e.ts}] ${e.msg}</div>`
    ).join('');
}

function clearLog() {
    logs = [];
    const el = document.getElementById('log-list');
    if (el) el.innerHTML = '';
}

// ────────────────────────────────────────────────
// UI 컨트롤
// ────────────────────────────────────────────────
function setSpeed(spd) {
    gameSpeed = spd;
    [1, 2, 5, 10, 50, 100, 1000].forEach(s => {
        const btn = document.getElementById('spd-' + s);
        if (btn) btn.classList.toggle('active', s === spd);
    });
}

function shiftLevel(delta) {
    const nv = Math.max(1, Math.min(MAX_LEVEL, character.level + delta));
    applyLevel(nv);
}

function applyLevelInput() {
    const v = parseInt(document.getElementById('level-input').value);
    if (v >= 1 && v <= MAX_LEVEL) applyLevel(v);
}

// 레벨 변경 후 스탯 재계산 공통 함수
// fullHeal=true: 레벨업처럼 완전 회복 / false: 수동 변경처럼 HP 비율 유지
function onLevelChanged(fullHeal) {
    const newStats = calcCharStats(character.level);
    if (fullHeal) {
        character.maxHP     = newStats.maxHP;
        character.maxMP     = newStats.maxMP;
        character.currentHP = newStats.maxHP;
        character.currentMP = newStats.maxMP;
    } else {
        const hpRatio = character.maxHP > 0 ? character.currentHP / character.maxHP : 1;
        const mpRatio = character.maxMP > 0 ? character.currentMP / character.maxMP : 1;
        character.maxHP     = newStats.maxHP;
        character.maxMP     = newStats.maxMP;
        character.currentHP = Math.max(1, Math.round(character.maxHP * hpRatio));
        character.currentMP = Math.round(character.maxMP * mpRatio);
    }
    saveCharacterState(); // 즉시 저장 → character_info.html 실시간 반영
    refreshUI();
}

function applyLevel(newLv) {
    const old = character.level;
    character.level = newLv;
    character.exp   = 0;
    // 몬스터 레벨은 스테이지 기준이므로 캐릭터 레벨 변경과 무관
    addLog(`레벨 수동 변경: Lv.${old} → Lv.${newLv} (EXP 초기화, 몬스터는 스테이지 ${currentStage} 유지)`, 'levelup');
    onLevelChanged(false); // HP 비율 유지하며 스탯 즉시 재계산
}

// ────────────────────────────────────────────────
// 능력치 제한값 설정 팝업 (Limit Settings Modal)
// ────────────────────────────────────────────────

// ────────────────────────────────────────────────
// 몬스터 능력치 조회 팝업
// ────────────────────────────────────────────────
let _monInfoTab = 'normal'; // 현재 선택 탭: 'normal' | 'boss'

function openMonsterInfo() {
    // 현재 스테이지 레벨로 초기화
    document.getElementById('moninfo-lv-input').value = stageLevel(currentStage);
    _monInfoTab = 'normal';
    document.getElementById('montab-normal').classList.add('active');
    document.getElementById('montab-boss').classList.remove('active');
    renderMonsterInfo();
    document.getElementById('moninfo-overlay').classList.add('open');
    // 게임 일시정지 없이 팝업만 표시
    if (gameState === 'playing') {
        gameState = 'paused';
        _monInfoPaused = true;
    } else {
        _monInfoPaused = false;
    }
}
let _monInfoPaused = false;

function closeMonsterInfo() {
    document.getElementById('moninfo-overlay').classList.remove('open');
    if (_monInfoPaused) {
        gameState = 'playing';
        lastTime  = performance.now();
        _monInfoPaused = false;
    }
}

function setMonInfoToCurrentStage() {
    document.getElementById('moninfo-lv-input').value = stageLevel(currentStage);
    renderMonsterInfo();
}

function switchMonTab(tab) {
    _monInfoTab = tab;
    document.getElementById('montab-normal').classList.toggle('active', tab === 'normal');
    document.getElementById('montab-boss').classList.toggle('active', tab === 'boss');
    renderMonsterInfo();
}

function renderMonsterInfo() {
    const raw = parseInt(document.getElementById('moninfo-lv-input').value, 10);
    const lv  = isNaN(raw) || raw < 1 ? 1 : Math.min(raw, 1000000);
    const isBoss = (_monInfoTab === 'boss');
    const s   = calcMonsterStats(lv);

    // 보스는 HP만 10배
    const hp    = isBoss ? s.maxHP * 10 : s.maxHP;
    const maxHpForBar = isBoss ? s.maxHP * 10 : s.maxHP; // 바 100% 기준
    const hpPct = 100; // 항상 full (비교 없이 절댓값 표시)

    // 현재 스테이지 몬스터와 같은 레벨인지 표시
    const isCurrent = (lv === stageLevel(currentStage));
    const badge = isCurrent ? '<span class="mon-current-badge">현재 스테이지</span>' : '';

    const cls = isBoss ? 'boss' : 'normal';

    // 회피율 계산 (기획서 공식 기준 % 표기)
    const avoidVsAvgChar = Math.max(MIN_AVOIDANCE, Math.min(MAX_AVOIDANCE, s.meleeEvasion - 100));
    const avoidPct = (avoidVsAvgChar / 100).toFixed(2);

    const html = `
        <div class="mon-hp-bar-wrap ${isBoss ? 'boss-wrap' : ''}">
            <div class="mon-hp-label">
                ${isBoss ? '💀 보스' : '⚔ 일반'} 몬스터 · Lv.${lv} ${badge}
                ${isBoss ? '<span style="font-size:15px;color:#ff6666;margin-left:8px;">(HP × 10)</span>' : ''}
            </div>
            <div class="mon-hp-track">
                <div class="mon-hp-fill ${isBoss ? 'boss-fill' : ''}" style="width:100%"></div>
            </div>
            <div class="mon-hp-text">HP ${hp.toLocaleString()}</div>
        </div>

        <div class="mon-section-title">기본 능력치</div>
        <div class="mon-stat-grid">
            <div class="mon-stat-row ${isBoss ? 'boss-row' : ''}">
                <span class="mon-stat-lbl">최대 HP</span>
                <span class="mon-stat-val ${isBoss ? 'boss-val' : 'highlight'}">${hp.toLocaleString()}</span>
            </div>
            <div class="mon-stat-row ${isBoss ? 'boss-row' : ''}">
                <span class="mon-stat-lbl">근거리 방어</span>
                <span class="mon-stat-val">${s.meleeDef.toLocaleString()}</span>
            </div>
            <div class="mon-stat-row ${isBoss ? 'boss-row' : ''}">
                <span class="mon-stat-lbl">최소 공격력</span>
                <span class="mon-stat-val">${s.meleeMinAtk.toLocaleString()}</span>
            </div>
            <div class="mon-stat-row ${isBoss ? 'boss-row' : ''}">
                <span class="mon-stat-lbl">최대 공격력</span>
                <span class="mon-stat-val">${s.meleeMaxAtk.toLocaleString()}</span>
            </div>
        </div>

        <div class="mon-section-title">명중 / 회피</div>
        <div class="mon-stat-grid">
            <div class="mon-stat-row ${isBoss ? 'boss-row' : ''}">
                <span class="mon-stat-lbl">명중 (Accuracy)</span>
                <span class="mon-stat-val">${s.meleeAccuracy}</span>
            </div>
            <div class="mon-stat-row ${isBoss ? 'boss-row' : ''}">
                <span class="mon-stat-lbl">회피 (Evasion)</span>
                <span class="mon-stat-val">${s.meleeEvasion}</span>
            </div>
        </div>

        <div class="mon-section-title">치명타</div>
        <div class="mon-stat-grid">
            <div class="mon-stat-row ${isBoss ? 'boss-row' : ''}">
                <span class="mon-stat-lbl">치명타율</span>
                <span class="mon-stat-val">${s.critRate.toFixed(2)}%</span>
            </div>
            <div class="mon-stat-row ${isBoss ? 'boss-row' : ''}">
                <span class="mon-stat-lbl">치명타 배율</span>
                <span class="mon-stat-val">${s.critMul}%</span>
            </div>
            <div class="mon-stat-row ${isBoss ? 'boss-row' : ''}">
                <span class="mon-stat-lbl">치명타 저항</span>
                <span class="mon-stat-val">${s.critResist.toFixed(2)}%</span>
            </div>
        </div>

        ${isBoss ? `
        <div class="mon-section-title">보스 전용 정보</div>
        <div class="mon-stat-grid">
            <div class="mon-stat-row boss-row">
                <span class="mon-stat-lbl">이동 속도 배율</span>
                <span class="mon-stat-val boss-val">× 1.5 (일반 대비)</span>
            </div>
            <div class="mon-stat-row boss-row">
                <span class="mon-stat-lbl">반격 속도 배율</span>
                <span class="mon-stat-val boss-val">× 1.5 (일반 대비)</span>
            </div>
            <div class="mon-stat-row boss-row">
                <span class="mon-stat-lbl">보스 등장 조건</span>
                <span class="mon-stat-val">일반 ${bossRequiredKills(currentStage)}킬</span>
            </div>
            <div class="mon-stat-row boss-row">
                <span class="mon-stat-lbl">부활 여부</span>
                <span class="mon-stat-val boss-val">없음 (1회 등장)</span>
            </div>
        </div>` : `
        <div class="mon-section-title">필드 정보</div>
        <div class="mon-stat-grid">
            <div class="mon-stat-row">
                <span class="mon-stat-lbl">리스폰 대기</span>
                <span class="mon-stat-val">${(RESPAWN_DELAY / 1000).toFixed(1)}초</span>
            </div>
            <div class="mon-stat-row">
                <span class="mon-stat-lbl">동시 등장 수</span>
                <span class="mon-stat-val">${MONSTER_COUNT}마리</span>
            </div>
        </div>`}

        <p class="mon-compare-note">※ 능력치 제한값 설정(회피율 한계 등)은 별도 설정 참조</p>
    `;

    document.getElementById('moninfo-body').innerHTML = html;
}

// 10000분의 1 단위 값 → % 문자열 변환
function limitToPct(val) {
    return (val / 100).toFixed(2) + '%';
}

// 제한값 패널 내 서브탭 전환 (명중/회피 등)
function switchLimitTab(tabId) {
    // 제한값 패널 내 서브탭만 전환 (상위 탭과 분리)
    const panel = document.getElementById('stab-limit');
    panel.querySelectorAll('.limit-tab').forEach(t => t.classList.remove('active'));
    panel.querySelectorAll('.settings-limit-content').forEach(c => c.classList.remove('active'));
    const tabBtn = document.getElementById('tab-' + tabId);
    if (tabBtn) tabBtn.classList.add('active');
    const content = document.getElementById('ltab-' + tabId);
    if (content) content.classList.add('active');
}

// 속도 탭 입력 변경 시 실시간 예상 공격 주기 미리보기
function onSpeedInput() {
    const corr = parseFloat(document.getElementById('atk-correction-input').value) || 100;
    // 현재 TotalAttackSpeed (레벨 능력치 기준)
    const curAS = (typeof character !== 'undefined' && character.level)
        ? (calcCharStats(character.level).attackSpeed || 0) : 0;
    const atkHint = document.getElementById('atk-interval-hint');
    if (atkHint) {
        if (curAS <= 0) {
            atkHint.textContent = `현재 TotalAttackSpeed = 0 — 레벨 능력치에 AttackSpeed를 추가해야 공격 가능`;
        } else {
            const ms = Math.max(100, Math.round(1000 / (curAS / Math.max(1, corr))));
            atkHint.textContent = `현재 공격 주기: ${(ms/1000).toFixed(2)}초 (TotalAttackSpeed=${curAS}, 보정=${corr})`;
        }
    }
    document.getElementById('limit-apply-msg').textContent = '';
}

// 입력값 변경 시 퍼센트 미리보기 + 유효성 검사
function onLimitInput(fieldId) {
    // 입력 요소: fieldId+'-input' 형식 우선, 없으면 fieldId 직접 탐색 (새 대미지 탭 필드)
    const inputEl = document.getElementById(fieldId + '-input') || document.getElementById(fieldId);
    const pctEl   = document.getElementById(fieldId + '-pct');
    const hintEl  = document.getElementById(fieldId + '-hint');

    if (!inputEl) return;
    const raw = parseInt(inputEl.value);
    const ok  = !isNaN(raw) && raw >= 0 && raw <= 10000;

    if (ok) {
        inputEl.classList.remove('invalid');
        if (pctEl) pctEl.textContent = limitToPct(raw);
        if (hintEl) hintEl.textContent = '';

        // 최소/최대 교차 검증 (명중/회피 탭)
        if (fieldId === 'min-avoid' || fieldId === 'max-avoid') {
            const minV = parseInt(document.getElementById('min-avoid-input').value);
            const maxV = parseInt(document.getElementById('max-avoid-input').value);
            if (!isNaN(minV) && !isNaN(maxV) && minV > maxV) {
                hintEl.textContent = '⚠ 최소값이 최대값보다 큽니다';
            }
        }
        // 최소/최대 교차 검증 (치명타 탭)
        if (fieldId === 'min-crit' || fieldId === 'max-crit') {
            const minV = parseInt(document.getElementById('min-crit-input').value);
            const maxV = parseInt(document.getElementById('max-crit-input').value);
            if (!isNaN(minV) && !isNaN(maxV) && minV > maxV) {
                hintEl.textContent = '⚠ 최소값이 최대값보다 큽니다';
            }
        }
        // 1차 감소율 Min/Max 교차 검증
        const phys1stPairs  = [['min-1st-phys','max-1st-phys'],['min-1st-range','max-1st-range'],['min-1st-magic','max-1st-magic']];
        const th3rdPairs    = [['min-3rd-melee','max-3rd-melee'],['min-3rd-range','max-3rd-range'],['min-3rd-magic','max-3rd-magic']];
        const critDecPair   = ['min-crit-dmg-dec','max-crit-dmg-dec'];
        const skillDecPair  = ['min-skill-dmg-dec','max-skill-dmg-dec'];
        for (const [minId, maxId] of [...phys1stPairs, ...th3rdPairs, [critDecPair[0], critDecPair[1]], [skillDecPair[0], skillDecPair[1]]]) {
            if (fieldId === minId || fieldId === maxId) {
                const minEl = document.getElementById(minId + '-input') || document.getElementById(minId);
                const maxEl = document.getElementById(maxId + '-input') || document.getElementById(maxId);
                if (minEl && maxEl) {
                    const minV = parseInt(minEl.value), maxV = parseInt(maxEl.value);
                    if (!isNaN(minV) && !isNaN(maxV) && minV > maxV && hintEl)
                        hintEl.textContent = '⚠ 최소값이 최대값보다 큽니다';
                }
            }
        }
    } else {
        inputEl.classList.add('invalid');
        pctEl.textContent  = '—';
        if (hintEl) hintEl.textContent = '0 ~ 10000 범위로 입력하세요';
    }
    document.getElementById('limit-apply-msg').textContent = '';
}

// 1차 감소 탭: DefCorr / DecRate 입력 시 합산 힌트 갱신
function onDmg1stInput() {
    const el = (id) => document.getElementById(id);
    let sum = 0;
    for (let i = 0; i < 10; i++) {
        const v = parseInt((el('ddr-' + i) || {}).value);
        if (!isNaN(v) && v >= 0) sum += v;
    }
    const hintEl = el('ddr-sum-hint');
    if (hintEl) {
        hintEl.style.color = sum > 10000 ? '#f85149' : '#8b949e';
        hintEl.textContent = `구간별 합산: ${sum} / 10000 (${(sum / 100).toFixed(2)}%) ${sum > 10000 ? '⚠ 합산이 10000을 초과합니다' : ''}`;
    }
    document.getElementById('limit-apply-msg').textContent = '';
}

// "적용" 버튼: 각 탭의 값을 모두 검증 후 게임 변수에 반영
function applyLimitSettings() {
    const msgEl  = document.getElementById('limit-apply-msg');

    // ── 명중/회피 탭 값 검증
    const minRaw = parseInt(document.getElementById('min-avoid-input').value);
    const maxRaw = parseInt(document.getElementById('max-avoid-input').value);
    if (isNaN(minRaw) || minRaw < 0 || minRaw > 10000) {
        msgEl.style.color = '#f85149';
        msgEl.textContent = '최소 회피율 값이 올바르지 않습니다 (0~10000)';
        return;
    }
    if (isNaN(maxRaw) || maxRaw < 0 || maxRaw > 10000) {
        msgEl.style.color = '#f85149';
        msgEl.textContent = '최대 회피율 값이 올바르지 않습니다 (0~10000)';
        return;
    }
    if (minRaw > maxRaw) {
        msgEl.style.color = '#f85149';
        msgEl.textContent = '최소 회피율이 최대 회피율보다 클 수 없습니다';
        return;
    }

    // ── 속도 탭 값 검증
    const corr = parseFloat(document.getElementById('atk-correction-input').value);
    if (isNaN(corr) || corr < 1 || corr > 9999) {
        msgEl.style.color = '#f85149';
        msgEl.textContent = '공격속도 보정 계수 값이 올바르지 않습니다 (1~9999)';
        return;
    }

    // ── 치명타 탭 값 검증
    const minCrit = parseInt(document.getElementById('min-crit-input').value);
    const maxCrit = parseInt(document.getElementById('max-crit-input').value);
    if (isNaN(minCrit) || minCrit < 0 || minCrit > 10000) {
        msgEl.style.color = '#f85149';
        msgEl.textContent = '치명타 최소 제한 값이 올바르지 않습니다 (0~10000)';
        return;
    }
    if (isNaN(maxCrit) || maxCrit < 0 || maxCrit > 10000) {
        msgEl.style.color = '#f85149';
        msgEl.textContent = '치명타 최대 제한 값이 올바르지 않습니다 (0~10000)';
        return;
    }
    if (minCrit > maxCrit) {
        msgEl.style.color = '#f85149';
        msgEl.textContent = '치명타 최소 제한이 최대 제한보다 클 수 없습니다';
        return;
    }

    // ── 대미지 1차 감소 탭 값 검증
    const el = (id) => document.getElementById(id);
    const newDCV = [], newDDR = [];
    for (let i = 0; i < 10; i++) {
        const cv = parseInt((el('dcv-' + i) || {}).value);
        const dr = parseInt((el('ddr-' + i) || {}).value);
        if (isNaN(cv) || cv < 1) {
            msgEl.style.color = '#f85149';
            msgEl.textContent = `방어력 구간 기준값 ${i}단계가 올바르지 않습니다 (1 이상)`;
            return;
        }
        if (isNaN(dr) || dr < 0 || dr > 10000) {
            msgEl.style.color = '#f85149';
            msgEl.textContent = `구간별 감소율 ${i}단계가 올바르지 않습니다 (0~10000)`;
            return;
        }
        newDCV.push(cv);
        newDDR.push(dr);
    }
    // 구간 기준값 오름차순 검증
    for (let i = 1; i < 10; i++) {
        if (newDCV[i] <= newDCV[i - 1]) {
            msgEl.style.color = '#f85149';
            msgEl.textContent = `방어력 구간 기준값이 오름차순이어야 합니다 (${i-1}단계: ${newDCV[i-1]}, ${i}단계: ${newDCV[i]})`;
            return;
        }
    }
    // 1차 감소율 Min/Max 클램프 읽기
    const pairs1st = [
        ['min-1st-phys', 'max-1st-phys'],
        ['min-1st-range', 'max-1st-range'],
        ['min-1st-magic', 'max-1st-magic'],
    ];
    const vals1st = [];
    for (const [minId, maxId] of pairs1st) {
        const minV = parseInt((el(minId) || {}).value);
        const maxV = parseInt((el(maxId) || {}).value);
        if (isNaN(minV) || minV < 0 || minV > 10000 || isNaN(maxV) || maxV < 0 || maxV > 10000) {
            msgEl.style.color = '#f85149';
            msgEl.textContent = `1차 감소율 Min/Max 값이 올바르지 않습니다 (0~10000)`;
            return;
        }
        if (minV > maxV) {
            msgEl.style.color = '#f85149';
            msgEl.textContent = '1차 감소율 최소값이 최대값보다 클 수 없습니다';
            return;
        }
        vals1st.push(minV, maxV);
    }

    // ── 대미지 3차 감소 탭 값 검증
    const pairs3rd = [
        ['min-3rd-melee', 'max-3rd-melee'],
        ['min-3rd-range', 'max-3rd-range'],
        ['min-3rd-magic', 'max-3rd-magic'],
    ];
    const vals3rd = [];
    for (const [minId, maxId] of pairs3rd) {
        const minV = parseInt((el(minId) || {}).value);
        const maxV = parseInt((el(maxId) || {}).value);
        if (isNaN(minV) || minV < 0 || minV > 10000 || isNaN(maxV) || maxV < 0 || maxV > 10000) {
            msgEl.style.color = '#f85149';
            msgEl.textContent = '3차 피해 감소율 Min/Max 값이 올바르지 않습니다 (0~10000)';
            return;
        }
        vals3rd.push(minV, maxV);
    }
    const minCritDec  = parseInt((el('min-crit-dmg-dec') || {}).value);
    const maxCritDec  = parseInt((el('max-crit-dmg-dec') || {}).value);
    const critDecCorr = parseInt((el('crit-dmg-dec-corr') || {}).value);
    const minSkillDec = parseInt((el('min-skill-dmg-dec') || {}).value);
    const maxSkillDec = parseInt((el('max-skill-dmg-dec') || {}).value);
    const skillDecCorr = parseInt((el('skill-dmg-dec-corr') || {}).value);
    const minDmgCorr  = parseInt((el('min-dmg-corr-input') || {}).value);
    if ([minCritDec, maxCritDec, minSkillDec, maxSkillDec, minDmgCorr].some(v => isNaN(v) || v < 0 || v > 10000)) {
        msgEl.style.color = '#f85149';
        msgEl.textContent = '3차 감소 탭 값 중 올바르지 않은 항목이 있습니다 (0~10000)';
        return;
    }
    if (isNaN(critDecCorr) || critDecCorr < 1 || isNaN(skillDecCorr) || skillDecCorr < 1) {
        msgEl.style.color = '#f85149';
        msgEl.textContent = '보정 계수는 1 이상이어야 합니다';
        return;
    }

    // ── 게임 변수에 반영
    MIN_AVOIDANCE           = minRaw;
    MAX_AVOIDANCE           = maxRaw;
    ATTACK_SPEED_CORRECTION = corr;
    CRIT_MIN_LIMIT          = minCrit;
    CRIT_MAX_LIMIT          = maxCrit;
    DEF_CORR_VAL            = newDCV;
    DEF_DEC_RATE            = newDDR;
    [MIN_1ST_DEC_PHYS, MAX_1ST_DEC_PHYS, MIN_1ST_DEC_RANGE, MAX_1ST_DEC_RANGE, MIN_1ST_DEC_MAGIC, MAX_1ST_DEC_MAGIC] = vals1st;
    [MIN_3RD_DEC_MELEE, MAX_3RD_DEC_MELEE, MIN_3RD_DEC_RANGE, MAX_3RD_DEC_RANGE, MIN_3RD_DEC_MAGIC, MAX_3RD_DEC_MAGIC] = vals3rd;
    MIN_CRIT_DMG_DEC  = minCritDec;
    MAX_CRIT_DMG_DEC  = maxCritDec;
    CRIT_DMG_DEC_CORR = critDecCorr;
    MIN_SKILL_DMG_DEC = minSkillDec;
    MAX_SKILL_DMG_DEC = maxSkillDec;
    SKILL_DMG_DEC_CORR = skillDecCorr;
    MIN_DAMAGE_CORR_RATE = minDmgCorr;

    // localStorage에 영구 저장
    saveLimitSettings();

    msgEl.style.color = '#3fb950';
    msgEl.textContent = `✔ 적용 및 저장됨`;
    addLog(`⚙ 제한값 설정 — 회피율 최소: ${minRaw} / 최대: ${maxRaw} | 공격속도 보정: ${corr} | 치명타 ${limitToPct(minCrit)}~${limitToPct(maxCrit)} | 대미지 공식 갱신됨`, 'info');

    // 1.2초 후 팝업 자동 닫기
    setTimeout(() => closeLimitSettings(), 1200);
}

// 제한값 설정을 localStorage에 저장
function saveLimitSettings() {
    localStorage.setItem('versione_limit_settings', JSON.stringify({
        minAvoidance:          MIN_AVOIDANCE,
        maxAvoidance:          MAX_AVOIDANCE,
        attackSpeedCorrection: ATTACK_SPEED_CORRECTION,
        critMinLimit:          CRIT_MIN_LIMIT,
        critMaxLimit:          CRIT_MAX_LIMIT,
        defCorrVal:            DEF_CORR_VAL,
        defDecRate:            DEF_DEC_RATE,
        min1stPhys:            MIN_1ST_DEC_PHYS,  max1stPhys:  MAX_1ST_DEC_PHYS,
        min1stRange:           MIN_1ST_DEC_RANGE, max1stRange: MAX_1ST_DEC_RANGE,
        min1stMagic:           MIN_1ST_DEC_MAGIC, max1stMagic: MAX_1ST_DEC_MAGIC,
        min3rdMelee:           MIN_3RD_DEC_MELEE, max3rdMelee: MAX_3RD_DEC_MELEE,
        min3rdRange:           MIN_3RD_DEC_RANGE, max3rdRange: MAX_3RD_DEC_RANGE,
        min3rdMagic:           MIN_3RD_DEC_MAGIC, max3rdMagic: MAX_3RD_DEC_MAGIC,
        minCritDmgDec:         MIN_CRIT_DMG_DEC,  maxCritDmgDec:  MAX_CRIT_DMG_DEC,  critDmgDecCorr:  CRIT_DMG_DEC_CORR,
        minSkillDmgDec:        MIN_SKILL_DMG_DEC, maxSkillDmgDec: MAX_SKILL_DMG_DEC, skillDmgDecCorr: SKILL_DMG_DEC_CORR,
        minDamageCorrRate:     MIN_DAMAGE_CORR_RATE,
    }));
}

// localStorage에서 제한값 설정 불러오기
function loadLimitSettings() {
    try {
        const raw = localStorage.getItem('versione_limit_settings');
        if (!raw) return;
        const d = JSON.parse(raw);
        if (typeof d.minAvoidance          === 'number') MIN_AVOIDANCE           = d.minAvoidance;
        if (typeof d.maxAvoidance          === 'number') MAX_AVOIDANCE           = d.maxAvoidance;
        if (typeof d.attackSpeedCorrection === 'number') ATTACK_SPEED_CORRECTION = d.attackSpeedCorrection;
        if (typeof d.critMinLimit          === 'number') CRIT_MIN_LIMIT          = d.critMinLimit;
        if (typeof d.critMaxLimit          === 'number') CRIT_MAX_LIMIT          = d.critMaxLimit;
        if (Array.isArray(d.defCorrVal) && d.defCorrVal.length === 10) DEF_CORR_VAL = d.defCorrVal;
        if (Array.isArray(d.defDecRate) && d.defDecRate.length === 10) DEF_DEC_RATE = d.defDecRate;
        if (typeof d.min1stPhys  === 'number') MIN_1ST_DEC_PHYS  = d.min1stPhys;
        if (typeof d.max1stPhys  === 'number') MAX_1ST_DEC_PHYS  = d.max1stPhys;
        if (typeof d.min1stRange === 'number') MIN_1ST_DEC_RANGE = d.min1stRange;
        if (typeof d.max1stRange === 'number') MAX_1ST_DEC_RANGE = d.max1stRange;
        if (typeof d.min1stMagic === 'number') MIN_1ST_DEC_MAGIC = d.min1stMagic;
        if (typeof d.max1stMagic === 'number') MAX_1ST_DEC_MAGIC = d.max1stMagic;
        if (typeof d.min3rdMelee === 'number') MIN_3RD_DEC_MELEE = d.min3rdMelee;
        if (typeof d.max3rdMelee === 'number') MAX_3RD_DEC_MELEE = d.max3rdMelee;
        if (typeof d.min3rdRange === 'number') MIN_3RD_DEC_RANGE = d.min3rdRange;
        if (typeof d.max3rdRange === 'number') MAX_3RD_DEC_RANGE = d.max3rdRange;
        if (typeof d.min3rdMagic === 'number') MIN_3RD_DEC_MAGIC = d.min3rdMagic;
        if (typeof d.max3rdMagic === 'number') MAX_3RD_DEC_MAGIC = d.max3rdMagic;
        if (typeof d.minCritDmgDec    === 'number') MIN_CRIT_DMG_DEC   = d.minCritDmgDec;
        if (typeof d.maxCritDmgDec    === 'number') MAX_CRIT_DMG_DEC   = d.maxCritDmgDec;
        if (typeof d.critDmgDecCorr   === 'number') CRIT_DMG_DEC_CORR  = d.critDmgDecCorr;
        if (typeof d.minSkillDmgDec   === 'number') MIN_SKILL_DMG_DEC  = d.minSkillDmgDec;
        if (typeof d.maxSkillDmgDec   === 'number') MAX_SKILL_DMG_DEC  = d.maxSkillDmgDec;
        if (typeof d.skillDmgDecCorr  === 'number') SKILL_DMG_DEC_CORR = d.skillDmgDecCorr;
        if (typeof d.minDamageCorrRate === 'number') MIN_DAMAGE_CORR_RATE = d.minDamageCorrRate;
    } catch (e) {
        // 저장 데이터가 손상된 경우 기본값 유지
    }
}

// 제한값 모달을 열 때 현재 게임 변수를 UI 입력값에 동기화
function syncLimitSettingsUI() {
    const el = (id) => document.getElementById(id);
    // 명중/회피
    if (el('min-avoid-input')) { el('min-avoid-input').value = MIN_AVOIDANCE; onLimitInput('min-avoid'); }
    if (el('max-avoid-input')) { el('max-avoid-input').value = MAX_AVOIDANCE; onLimitInput('max-avoid'); }
    // 속도 보정 계수
    if (el('atk-correction-input')) el('atk-correction-input').value = ATTACK_SPEED_CORRECTION;
    onSpeedInput();
    // 치명타 제한
    if (el('min-crit-input')) { el('min-crit-input').value = CRIT_MIN_LIMIT; onLimitInput('min-crit'); }
    if (el('max-crit-input')) { el('max-crit-input').value = CRIT_MAX_LIMIT; onLimitInput('max-crit'); }
    // 1차 감소 탭 — DefCorr / DecRate 배열
    for (let i = 0; i < 10; i++) {
        if (el('dcv-' + i)) el('dcv-' + i).value = DEF_CORR_VAL[i];
        if (el('ddr-' + i)) el('ddr-' + i).value = DEF_DEC_RATE[i];
    }
    onDmg1stInput();
    // 1차 감소 Min/Max 클램프
    const sync1st = (minId, minVal, maxId, maxVal) => {
        if (el(minId)) { el(minId).value = minVal; onLimitInput(minId); }
        if (el(maxId)) { el(maxId).value = maxVal; onLimitInput(maxId); }
    };
    sync1st('min-1st-phys',  MIN_1ST_DEC_PHYS,  'max-1st-phys',  MAX_1ST_DEC_PHYS);
    sync1st('min-1st-range', MIN_1ST_DEC_RANGE, 'max-1st-range', MAX_1ST_DEC_RANGE);
    sync1st('min-1st-magic', MIN_1ST_DEC_MAGIC, 'max-1st-magic', MAX_1ST_DEC_MAGIC);
    // 3차 감소 Min/Max
    sync1st('min-3rd-melee', MIN_3RD_DEC_MELEE, 'max-3rd-melee', MAX_3RD_DEC_MELEE);
    sync1st('min-3rd-range', MIN_3RD_DEC_RANGE, 'max-3rd-range', MAX_3RD_DEC_RANGE);
    sync1st('min-3rd-magic', MIN_3RD_DEC_MAGIC, 'max-3rd-magic', MAX_3RD_DEC_MAGIC);
    // 치명타/스킬 감소율
    if (el('min-crit-dmg-dec'))  { el('min-crit-dmg-dec').value  = MIN_CRIT_DMG_DEC;  onLimitInput('min-crit-dmg-dec');  }
    if (el('max-crit-dmg-dec'))  { el('max-crit-dmg-dec').value  = MAX_CRIT_DMG_DEC;  onLimitInput('max-crit-dmg-dec');  }
    if (el('crit-dmg-dec-corr')) el('crit-dmg-dec-corr').value  = CRIT_DMG_DEC_CORR;
    if (el('min-skill-dmg-dec')) { el('min-skill-dmg-dec').value = MIN_SKILL_DMG_DEC; onLimitInput('min-skill-dmg-dec'); }
    if (el('max-skill-dmg-dec')) { el('max-skill-dmg-dec').value = MAX_SKILL_DMG_DEC; onLimitInput('max-skill-dmg-dec'); }
    if (el('skill-dmg-dec-corr')) el('skill-dmg-dec-corr').value = SKILL_DMG_DEC_CORR;
    // 최소 대미지 보정
    if (el('min-dmg-corr-input')) { el('min-dmg-corr-input').value = MIN_DAMAGE_CORR_RATE; onLimitInput('min-dmg-corr'); }
}

// 페이지 로드 시: 저장된 설정 복원 + 첫 번째 탭 활성화
window.addEventListener('DOMContentLoaded', () => {
    loadBaseStats();
    loadLimitSettings();
    loadLvStatConfig();
    buildLvStatSelect();
    switchLimitTab('hit');
});

// ────────────────────────────────────────────────
// 레벨 능력치 설정 팝업
// ────────────────────────────────────────────────

// localStorage 저장/불러오기
function saveLvStatConfig() {
    // 팝업 내 현재 입력값을 LV_STAT_CONFIG에 반영
    const rows = document.querySelectorAll('#lvstat-rows .lvstat-row');
    const cfg  = [];
    let hasErr = false;
    rows.forEach(row => {
        const en    = row.dataset.en;
        const baseEl  = row.querySelector('.lvstat-base');
        const perLvEl = row.querySelector('.lvstat-perlv');
        const base  = parseFloat(baseEl.value);
        const perLv = parseFloat(perLvEl.value);
        if (isNaN(base) || isNaN(perLv)) { hasErr = true; return; }
        cfg.push({ en, base, perLv });
    });
    if (hasErr) {
        showLvStatMsg('입력값에 오류가 있습니다. 숫자를 확인해 주세요.', '#f85149');
        return;
    }
    LV_STAT_CONFIG = cfg;
    localStorage.setItem('versione_lv_stat_config', JSON.stringify(LV_STAT_CONFIG));
    applyLvStatToCharacter();   // 캐릭터에 즉시 반영
    showLvStatMsg('✔ 저장 완료 — 캐릭터에 즉시 반영되었습니다.', '#3fb950');
    setTimeout(() => closeLvStatSettings(), 1200);
}

// 변경된 LV_STAT_CONFIG를 현재 살아있는 캐릭터에 즉시 적용
function applyLvStatToCharacter() {
    if (gameState === 'title' || !character || !character.level) return;
    const newStats = calcCharStats(character.level);
    // HP/MP는 현재 비율을 유지하면서 최대값만 재계산
    const hpRatio = character.maxHP > 0 ? character.currentHP / character.maxHP : 1;
    const mpRatio = character.maxMP > 0 ? character.currentMP / character.maxMP : 1;
    character.maxHP    = newStats.maxHP;
    character.maxMP    = newStats.maxMP;
    character.currentHP = Math.max(1, Math.round(character.maxHP * hpRatio));
    character.currentMP = Math.round(character.maxMP * mpRatio);
    refreshUI();
}

function loadLvStatConfig() {
    try {
        const raw = localStorage.getItem('versione_lv_stat_config');
        if (!raw) return;
        const data = JSON.parse(raw);
        if (Array.isArray(data)) LV_STAT_CONFIG = data;
    } catch (e) {}
}

function resetLvStatConfig() {
    if (!confirm('레벨 능력치 설정을 모두 초기화하시겠습니까?')) return;
    LV_STAT_CONFIG = [];
    localStorage.removeItem('versione_lv_stat_config');
    renderLvStatRows();
    showLvStatMsg('초기화되었습니다.', '#8b949e');
}

// 능력치 선택 <select> 빌드 (그룹별 optgroup)
// buildLvStatSelect — 검색 UI는 STAT_LIST를 직접 참조하므로 별도 빌드 불필요 (함수 유지)
function buildLvStatSelect() { /* 검색 방식으로 교체, 호환성을 위해 빈 함수 유지 */ }

// 행 목록 렌더링
function renderLvStatRows() {
    const container = document.getElementById('lvstat-rows');
    if (!container) return;
    if (LV_STAT_CONFIG.length === 0) {
        container.innerHTML = '<div class="lvstat-empty">추가된 능력치가 없습니다.<br>아래에서 능력치를 선택하여 추가하세요.</div>';
        return;
    }
    container.innerHTML = '';
    LV_STAT_CONFIG.forEach((row, idx) => {
        const stat   = (typeof STAT_LIST !== 'undefined' ? STAT_LIST : []).find(s => s.en === row.en);
        const kr     = stat ? stat.kr : row.en;
        const isPct  = isStatPct(row.en);
        const pctTip = isPct ? `<span class="lvstat-pct" id="lvsp-base-${idx}"></span>` : '';
        const pctTip2 = isPct ? `<span class="lvstat-pct" id="lvsp-perlv-${idx}"></span>` : '';

        const div = document.createElement('div');
        div.className  = 'lvstat-row';
        div.dataset.en = row.en;
        div.innerHTML  = `
            <div class="lvstat-name">
                <span class="lvstat-name-kr">${kr}</span>
                <span class="lvstat-name-en">${row.en}</span>
            </div>
            <div class="lvstat-field">
                <input class="lvstat-input lvstat-base" type="number" step="any" value="${row.base}"
                    oninput="onLvStatInput(this, 'base-${idx}', ${isPct})">
                ${pctTip}
            </div>
            <div class="lvstat-field">
                <input class="lvstat-input lvstat-perlv" type="number" step="any" value="${row.perLv}"
                    oninput="onLvStatInput(this, 'perlv-${idx}', ${isPct})">
                ${pctTip2}
            </div>
            <button class="lvstat-del" onclick="removeLvStatRow(${idx})" title="삭제">✕</button>
        `;
        container.appendChild(div);
        // 퍼센트 초기값 표시
        if (isPct) {
            updateLvStatPct(`base-${idx}`,  row.base);
            updateLvStatPct(`perlv-${idx}`, row.perLv);
        }
    });
}

function onLvStatInput(inputEl, id, isPct) {
    if (isPct) updateLvStatPct(id, parseFloat(inputEl.value));
}
function updateLvStatPct(id, val) {
    const el = document.getElementById('lvsp-' + id);
    if (!el) return;
    // 퍼센트 스탯: 원시값/100 = 표시 퍼센트 (10000 단위, 예: 1500 → 15.00%)
    el.textContent = isNaN(val) ? '—' : (val / 100).toFixed(2) + '%';
}

// ── 검색 상태 변수
let _lvSearchSelected = null;   // { en, kr } 현재 선택된 능력치

// 검색어 하이라이트 (일치 부분을 노란색으로)
function hlText(text, query) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx < 0) return text;
    return text.slice(0, idx)
        + `<span class="lvstat-si-match">${text.slice(idx, idx + query.length)}</span>`
        + text.slice(idx + query.length);
}

// 드롭다운 닫기
function hideLvStatDropdown() {
    const list = document.getElementById('lvstat-search-list');
    if (list) list.classList.remove('open');
}

// 드롭다운 열기 (현재 검색어 기준으로 필터 후 표시)
function showLvStatDropdown() {
    filterLvStatSearch();
}

// 검색 필터링 및 드롭다운 렌더
function filterLvStatSearch() {
    const input = document.getElementById('lvstat-search-input');
    const list  = document.getElementById('lvstat-search-list');
    if (!input || !list || typeof STAT_LIST === 'undefined') return;

    const q = input.value.trim();

    // 검색어가 비면 선택 해제
    if (q === '') {
        _lvSearchSelected = null;
        input.classList.remove('has-selection');
    }

    // 필터링: kr 또는 en에 검색어 포함
    const matched = q === ''
        ? STAT_LIST.slice(0, 80)        // 검색어 없으면 처음 80개 미리보기
        : STAT_LIST.filter(s =>
            s.kr.includes(q) || s.en.toLowerCase().includes(q.toLowerCase())
          ).slice(0, 100);

    if (matched.length === 0) {
        list.innerHTML = '<div class="lvstat-search-empty">검색 결과가 없습니다.</div>';
        list.classList.add('open');
        return;
    }

    // 그룹별로 묶어서 렌더
    const groups = {};
    matched.forEach(s => {
        const g = (s.group || '기타').replace(/^\d+_/, '');
        if (!groups[g]) groups[g] = [];
        groups[g].push(s);
    });

    list.innerHTML = '';
    let allItems = [];

    Object.keys(groups).forEach(g => {
        const gDiv = document.createElement('div');
        gDiv.className   = 'lvstat-search-group';
        gDiv.textContent = g;
        list.appendChild(gDiv);

        groups[g].forEach(s => {
            const item = document.createElement('div');
            item.className   = 'lvstat-search-item';
            item.dataset.en  = s.en;
            item.dataset.kr  = s.kr;
            item.innerHTML   = `
                <span class="lvstat-si-kr">${hlText(s.kr, q)}</span>
                <span class="lvstat-si-en">${hlText(s.en, q)}</span>
            `;
            item.addEventListener('mousedown', e => {
                e.preventDefault();   // blur 방지
                selectLvStatItem(s.en, s.kr);
            });
            list.appendChild(item);
            allItems.push(item);
        });
    });

    list._allItems = allItems;
    list.classList.add('open');
}

// 항목 선택 (마우스 클릭 또는 Enter)
function selectLvStatItem(en, kr) {
    _lvSearchSelected = { en, kr };
    const input = document.getElementById('lvstat-search-input');
    if (input) {
        input.value = `${kr}  (${en})`;
        input.classList.add('has-selection');
    }
    hideLvStatDropdown();
}

// 검색창 외부 클릭 시 드롭다운 닫기
document.addEventListener('click', e => {
    const wrap = document.querySelector('.lvstat-search-wrap');
    if (wrap && !wrap.contains(e.target)) hideLvStatDropdown();
});

// "+ 추가" 버튼
function addSelectedLvStat() {
    if (!_lvSearchSelected) {
        showLvStatMsg('추가할 능력치를 검색하여 선택해 주세요.', '#d29922');
        return;
    }
    LV_STAT_CONFIG.push({ en: _lvSearchSelected.en, base: 0, perLv: 0 });
    // 입력창 초기화
    const input = document.getElementById('lvstat-search-input');
    if (input) { input.value = ''; input.classList.remove('has-selection'); }
    _lvSearchSelected = null;
    renderLvStatRows();
    const rows = document.getElementById('lvstat-rows');
    if (rows) rows.scrollTop = rows.scrollHeight;
}

// 행 삭제
function removeLvStatRow(idx) {
    LV_STAT_CONFIG.splice(idx, 1);
    renderLvStatRows();
}

// 팝업 열기/닫기
// ────────────────────────────────────────────────
// 기본 스탯 설정 팝업 (STR / DEX / INT / AGI / CON / WIS / LUK)
// ────────────────────────────────────────────────
const BASE_STAT_DEFS = [
    { key:'STR', label:'힘 (STR)',     desc:'근거리 공격, 명중, 치명타' },
    { key:'DEX', label:'민첩 (DEX)',   desc:'원거리 공격, 명중, 치명타' },
    { key:'INT', label:'지능 (INT)',   desc:'마법 공격, 명중, 치명타, MP' },
    { key:'AGI', label:'순발 (AGI)',   desc:'공격속도, 원거리 방어/회피' },
    { key:'CON', label:'건강 (CON)',   desc:'최대 HP, 근거리 방어/회피' },
    { key:'WIS', label:'지혜 (WIS)',   desc:'최대 MP, 마법 방어/회피' },
    { key:'LUK', label:'행운 (LUK)',   desc:'치명타, 드랍률, 상태이상 저항' },
];

// ────────────────────────────────────────────────
// 공통 능력치 설정 모달 (레벨 능력치 / 제한값)
// ────────────────────────────────────────────────
let _currentSettingsTab = 'lvstat';

function openSettingsModal(tab) {
    tab = tab || _currentSettingsTab || 'lvstat';
    // basestat 탭은 삭제됨 → 클래스 모달로 리다이렉트
    if (tab === 'basestat') tab = 'lvstat';
    switchSettingsTab(tab);
    // 제한값 탭 입력 필드를 현재 게임 변수 값으로 동기화
    syncLimitSettingsUI();
    document.getElementById('settings-overlay').classList.add('open');
    if (gameState === 'playing') gameState = 'paused';
}

function closeSettingsModal() {
    hideLvStatDropdown();
    document.getElementById('settings-overlay').classList.remove('open');
    if (gameState === 'paused') { gameState = 'playing'; lastTime = performance.now(); }
}

function switchSettingsTab(tab) {
    _currentSettingsTab = tab;
    ['lvstat','limit'].forEach(t => {
        document.getElementById('stab-btn-' + t).classList.toggle('active', t === tab);
        document.getElementById('stab-' + t).classList.toggle('active', t === tab);
    });
    if (tab === 'lvstat') {
        renderLvStatRows();
        const input = document.getElementById('lvstat-search-input');
        if (input) { input.value = ''; input.classList.remove('has-selection'); }
        _lvSearchSelected = null;
        hideLvStatDropdown();
        document.getElementById('lvstat-apply-msg').textContent = '';
    } else if (tab === 'limit') {
        document.getElementById('min-avoid-input').value = MIN_AVOIDANCE;
        document.getElementById('max-avoid-input').value = MAX_AVOIDANCE;
        document.getElementById('min-avoid-pct').textContent = limitToPct(MIN_AVOIDANCE);
        document.getElementById('max-avoid-pct').textContent = limitToPct(MAX_AVOIDANCE);
        document.getElementById('min-avoid-hint').textContent = '';
        document.getElementById('max-avoid-hint').textContent = '';
        document.getElementById('limit-apply-msg').textContent = '';
    }
}

// 하위 호환성 — 기본 스탯 설정은 클래스 모달로 이동됨
function openBaseStatSettings()  { openClassModal(); }
function openLvStatSettings()    { openSettingsModal('lvstat'); }
function openLimitSettings()     { openSettingsModal('limit');    }
function closeBaseStatSettings() { closeSettingsModal(); }
function closeLvStatSettings()   { closeSettingsModal(); }
function closeLimitSettings()    { closeSettingsModal(); }

// 기본 스탯 하나에 대해 치환 능력치 목록을 계산하여 반환
// 010_스탯_치환값 문서 순서 그대로 각 항목을 개별 행으로 반환 (병합·정렬 없음)
function computeSubstitutionPreview(statKey, val, krMap) {
    const entries  = (typeof BASE_STAT_SUBSTITUTION !== 'undefined' && BASE_STAT_SUBSTITUTION[statKey]) || [];
    const substKr  = (typeof SUBST_KR_MAP  !== 'undefined') ? SUBST_KR_MAP  : {};
    const pctStats = (typeof SUBST_PCT_STATS !== 'undefined') ? SUBST_PCT_STATS : new Set();
    return entries.map(({ key, c1, c2, label }) => ({
        key,
        label: label || (krMap && krMap[key]) || substKr[key] || key,
        val:   Math.floor(val / c1 * c2),
        isPct: pctStats.has(key),
    }));
}

// #bs-preview-{key} 영역을 현재 슬라이더 값으로 재렌더링
function updateBaseStatPreview(key) {
    const v  = parseInt(document.getElementById('bs-num-'+key).value) || 10;
    const el = document.getElementById('bs-preview-'+key);
    if (!el) return;
    const krMap = {};
    if (typeof STAT_LIST !== 'undefined') STAT_LIST.forEach(s => { krMap[s.en] = s.kr; });
    const preview = computeSubstitutionPreview(key, v, krMap);
    el.innerHTML  = preview.map(p =>
        `<div class="bsp-row"><span class="bsp-name">${p.label}(${p.key})</span><span class="bsp-val">${p.isPct ? '+' + (p.val/100).toFixed(2) + '%' : '+' + p.val}</span></div>`
    ).join('');
}

function renderBaseStatGrid() {
    const krMap = {};
    if (typeof STAT_LIST !== 'undefined') STAT_LIST.forEach(s => { krMap[s.en] = s.kr; });
    const grid = document.getElementById('basestat-grid');
    if (!grid) return; // 기본 스탯 탭이 삭제됐으므로 DOM이 없으면 조용히 종료
    grid.innerHTML = BASE_STAT_DEFS.map(d => {
        const preview    = computeSubstitutionPreview(d.key, BASE_STATS[d.key], krMap);
        const previewHtml = preview.map(p =>
            `<div class="bsp-row"><span class="bsp-name">${p.label}(${p.key})</span><span class="bsp-val">${p.isPct ? '+' + (p.val/100).toFixed(2) + '%' : '+' + p.val}</span></div>`
        ).join('');
        return `
        <div class="bsc-card">
            <div class="bsc-left">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                    <span style="font-weight:700;color:#c9d1d9;">${d.label}</span>
                    <span style="font-size:15px;color:#8b949e;">${d.desc}</span>
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                    <input type="range" min="1" max="1000"
                           value="${BASE_STATS[d.key]}"
                           id="bs-range-${d.key}"
                           style="flex:1;accent-color:#3fb950;"
                           oninput="syncBaseStatInput('${d.key}')">
                    <input type="number" min="1" max="1000"
                           value="${BASE_STATS[d.key]}"
                           id="bs-num-${d.key}"
                           style="width:60px;background:#0d1117;border:1px solid #30363d;color:#c9d1d9;
                                  border-radius:4px;padding:3px 6px;text-align:center;font-size:15px;"
                           oninput="syncBaseStatRange('${d.key}')">
                </div>
            </div>
            <div class="bsc-right">
                <div class="bsp-title">▸ 치환 능력치 (현재값 기준)</div>
                <div class="bsp-grid" id="bs-preview-${d.key}">${previewHtml}</div>
            </div>
        </div>`;
    }).join('');
}

function syncBaseStatInput(key) {
    const v = parseInt(document.getElementById('bs-range-'+key).value) || 10;
    document.getElementById('bs-num-'+key).value = v;
    updateBaseStatPreview(key);
}
function syncBaseStatRange(key) {
    let v = parseInt(document.getElementById('bs-num-'+key).value) || 10;
    v = Math.max(1, Math.min(1000, v));
    document.getElementById('bs-num-'+key).value = v;
    document.getElementById('bs-range-'+key).value = v;
    updateBaseStatPreview(key);
}

function applyBaseStats() {
    BASE_STAT_DEFS.forEach(d => {
        const v = parseInt(document.getElementById('bs-num-'+d.key).value) || 10;
        BASE_STATS[d.key] = Math.max(1, Math.min(1000, v));
    });
    saveBaseStats();
    // 전투 스탯 즉시 재계산 → HP/MP 상한 변경 반영
    const s = calcCharStats(character.level);
    character.maxHP = s.maxHP;
    character.maxMP = s.maxMP;
    if (character.currentHP > character.maxHP) character.currentHP = character.maxHP;
    if (character.currentMP > character.maxMP) character.currentMP = character.maxMP;
    refreshUI();
    const msg = document.getElementById('basestat-msg');
    if (msg) { msg.style.color = '#3fb950'; msg.textContent = '✔ 기본 스탯이 적용되었습니다.'; setTimeout(() => { if (msg) msg.textContent = ''; }, 2500); }
}

function resetBaseStats() {
    // 클래스 기본값으로 초기화 (공통 기본값 10 대신 클래스 설계 기본값 사용)
    const def = CLASS_DEFS[currentClass];
    BASE_STAT_DEFS.forEach(d => {
        BASE_STATS[d.key] = (def && def.defaultStats[d.key]) ? def.defaultStats[d.key] : 10;
    });
    saveBaseStats();
    renderBaseStatGrid();
    const s = calcCharStats(character.level);
    character.maxHP = s.maxHP;
    character.maxMP = s.maxMP;
    if (character.currentHP > character.maxHP) character.currentHP = character.maxHP;
    if (character.currentMP > character.maxMP) character.currentMP = character.maxMP;
    refreshUI();
    const msg = document.getElementById('basestat-msg');
    if (msg) { msg.style.color = '#d29922'; msg.textContent = '↺ 기본값(10)으로 초기화했습니다.'; setTimeout(() => { if (msg) msg.textContent = ''; }, 2500); }
}

function showLvStatMsg(msg, color) {
    const el = document.getElementById('lvstat-apply-msg');
    if (!el) return;
    el.style.color   = color || '#3fb950';
    el.textContent   = msg;
}

// ────────────────────────────────────────────────
// 캐릭터 데이터를 localStorage에 저장 (캐릭터 정보 창과 공유)
// ────────────────────────────────────────────────
function saveCharacterState() {
    if (gameState === 'title') return;
    localStorage.setItem('versione_char', JSON.stringify({
        level:      character.level,
        exp:        character.exp,
        totalKills: totalKills,
        currentHP:  character.currentHP,
        maxHP:      character.maxHP,
        currentMP:  character.currentMP,
        maxMP:      character.maxMP,
        savedAt:    Date.now(),
        classId:    currentClass,
    }));
    // 기본 스탯도 함께 동기화 (character_info.html이 최신 값 읽을 수 있도록)
    saveClassBaseStats(currentClass, BASE_STATS);
}

// ────────────────────────────────────────────────
// 마을 귀환 / 전투 재개
// ────────────────────────────────────────────────

// 사이드바의 귀환·재개 버튼 표시 상태를 inTown에 맞춰 업데이트
function updateTownUI() {
    const btnReturn = document.getElementById('btn-return-town');
    const btnResume = document.getElementById('btn-resume-combat');
    const statusTxt = document.getElementById('town-status-txt');
    if (!btnReturn) return;
    if (inTown) {
        btnReturn.style.display = 'none';
        btnResume.style.display = '';
        statusTxt.textContent   = '🏠 마을 체류 중 (안전)';
        statusTxt.style.color   = '#3fb950';
    } else {
        btnReturn.style.display = '';
        btnResume.style.display = 'none';
        statusTxt.textContent   = '⚔ 전투 중';
        statusTxt.style.color   = '#8b949e';
    }
}

// 마을 귀환: 캐릭터를 마을 구역 중앙으로 이동, 전투 차단
function returnToTown() {
    if (gameState === 'title') return;
    inTown = true;
    character.target   = null;
    character.atkTimer = 10000; // 공격 타이머 초기화
    // 마을 중앙으로 순간이동
    character.x = TOWN_W / 2;
    character.y = TOWN_H / 2 + 10;
    updateTownUI();
    addLog('🏠 마을로 귀환했습니다. HP/MP가 2배 속도로 회복됩니다.', 'info');
    saveCharacterState();
}

// 전투 재개: 마을 경계 바로 오른쪽에 캐릭터를 배치, 전투 허용
function resumeCombat() {
    if (gameState === 'title') return;
    inTown = false;
    character.atkTimer = getCharAttackInterval();
    // 마을 경계 오른쪽으로 순간이동
    character.x = TOWN_W + 50;
    character.y = TOWN_H / 2;
    updateTownUI();
    addLog('⚔ 전투 구역으로 진입합니다.', 'info');
}

// 캐릭터 능력치 상세 팝업 열기 (게임 내 iframe 모달)
let _charInfoPaused = false;
function openCharInfo() {
    saveCharacterState();
    // iframe src 재로드하여 최신 localStorage 반영
    const frame = document.getElementById('charinfo-frame');
    frame.src = 'character_info.html';
    document.getElementById('charinfo-overlay').classList.add('open');
    if (gameState === 'playing') { _charInfoPaused = true; gameState = 'paused'; }
    else { _charInfoPaused = false; }
}
function closeCharInfo() {
    document.getElementById('charinfo-overlay').classList.remove('open');
    if (_charInfoPaused) { gameState = 'playing'; lastTime = performance.now(); }
    _charInfoPaused = false;
}


// ────────────────────────────────────────────────
// 메인 루프
// ────────────────────────────────────────────────
function loop(ts) {
    const rawDelta = Math.min(ts - lastTime, 100); // 최대 100ms 캡
    lastTime = ts;

    if (gameState === 'playing') {
        update(rawDelta);
        draw();
        uiThrottle += rawDelta;
        if (uiThrottle >= 50) {
            refreshUI();
            uiThrottle = 0;
        }
    }
    // 일시정지 / 타이틀 중에는 루프만 유지하고 업데이트는 하지 않음
    requestAnimationFrame(loop);
}

// ────────────────────────────────────────────────
// 시작 (타이틀 화면부터)
// ────────────────────────────────────────────────
requestAnimationFrame(ts => {
    lastTime = ts;
    requestAnimationFrame(loop);
});
