// =============================================================================
// stats_calc.js — 공유 스탯 계산 엔진 (그룹 + scope 버전)
// =============================================================================

// ─── 스탯 목록 (총 400개, group+scope 적용) ─────────────────────────
const STAT_LIST=[
{"id":1,"kr":"모든 스텟","en":"AllStat","kind":"기타","group":"01_기본 스탯","scope":"공통","desc":"모든 스텟 증감 옵션"},
{"id":2,"kr":"힘","en":"STR","kind":"기타","group":"01_기본 스탯","scope":"공통","desc":"힘 스텟 증감 옵션"},
{"id":3,"kr":"민첩","en":"DEX","kind":"기타","group":"01_기본 스탯","scope":"공통","desc":"민첩 스텟 증감 옵션"},
{"id":4,"kr":"지능","en":"INT","kind":"기타","group":"01_기본 스탯","scope":"공통","desc":"지능 스텟 증감 옵션"},
{"id":5,"kr":"건강","en":"CON","kind":"기타","group":"01_기본 스탯","scope":"공통","desc":"건강 스텟 증감 옵션"},
{"id":34,"kr":"근거리 방어력","en":"PhysicalDefense","kind":"방어","group":"01_방어력","scope":"공통","desc":"근거리(=물리) 방어력 증감 옵션"},
{"id":35,"kr":"마법 방어력","en":"MagicDefense","kind":"방어","group":"01_방어력","scope":"공통","desc":"마법 방어력 증감 옵션"},
{"id":36,"kr":"회피","en":"Evasion","kind":"방어","group":"02_회피","scope":"공통","desc":"회피 증감 옵션"},
{"id":37,"kr":"근거리 회피","en":"MeleeEvasion","kind":"방어","group":"02_회피","scope":"공통","desc":"근거리 회피 증감 옵션"},
{"id":38,"kr":"원거리 회피","en":"RangedEvasion","kind":"방어","group":"02_회피","scope":"공통","desc":"원거리 회피 증감 옵션"},
{"id":39,"kr":"마법 회피","en":"MagicEvasion","kind":"방어","group":"02_회피","scope":"공통","desc":"마법 회피 증감 옵션"},
{"id":44,"kr":"치명타 저항","en":"CriticalResist","kind":"방어","group":"03_치명타 저항","scope":"공통","desc":"치명타 저항 증감 옵션"},
{"id":45,"kr":"근거리 치명타 저항","en":"MeleeCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"공통","desc":"근거리 치명타 저항 증감 옵션"},
{"id":46,"kr":"원거리 치명타 저항","en":"RangedCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"공통","desc":"원거리 치명타 저항 증감 옵션"},
{"id":47,"kr":"마법 치명타 저항","en":"MagicCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"공통","desc":"마법 치명타 저항 증감 옵션"},
{"id":60,"kr":"스킬 피해 감소","en":"SkillDamageReduction","kind":"방어","group":"05_피해 감소","scope":"공통","desc":"스킬 피해 감소 증감 옵션"},
{"id":62,"kr":"공격속도","en":"AttackSpeed","kind":"기타","group":"05_속도","scope":"공통","desc":"공격속도 증감 옵션"},
{"id":63,"kr":"이동속도","en":"MoveSpeed","kind":"기타","group":"05_속도","scope":"공통","desc":"이동속도 증감 옵션"},
{"id":64,"kr":"무게","en":"Weight","kind":"기타","group":"06_전투 보조","scope":"공통","desc":"무게 증감 옵션"},
{"id":65,"kr":"최대 HP","en":"MaxHealthPoint","kind":"기타","group":"03_HP / MP","scope":"공통","desc":"최대 HP 증감 옵션"},
{"id":66,"kr":"최대 MP","en":"MaxManaPoint","kind":"기타","group":"03_HP / MP","scope":"공통","desc":"최대 MP 증감 옵션"},
{"id":67,"kr":"HP 자연 회복","en":"HealthRegenPoint","kind":"기타","group":"04_회복","scope":"공통","desc":"틱당 회복되는 HP 자연 회복 증감 옵션"},
{"id":68,"kr":"HP 고정 회복","en":"HealthRegenFixedPoint","kind":"기타","group":"04_회복","scope":"공통","desc":"무게에 관계 없이 틱당 회복되는 HP 고정 회복 증감 옵션"},
{"id":69,"kr":"MP 자연 회복","en":"ManaRegenPoint","kind":"기타","group":"04_회복","scope":"공통","desc":"틱당 회복되는 MP 자연 회복 증감 옵션"},
{"id":70,"kr":"MP 고정 회복","en":"ManaRegenFixedPoint","kind":"기타","group":"04_회복","scope":"공통","desc":"무게에 관계 없이 틱당 회복되는 MP 고정 회복 증감 옵션"},
{"id":71,"kr":"물약 회복량","en":"PotionRecoveryPoint","kind":"기타","group":"04_회복","scope":"공통","desc":"물약 회복량 증감 옵션"},
{"id":72,"kr":"물약 회복률","en":"PotionRecoveryRate","kind":"기타","group":"04_회복","scope":"공통","desc":"물약 회복률 증감 옵션"},
{"id":74,"kr":"MP 소모 감소","en":"ManaCostRate","kind":"기타","group":"06_전투 보조","scope":"공통","desc":"MP 소모 감소 증감 옵션"},
{"id":75,"kr":"스킬 쿨타임 감소","en":"CoolTimeRate","kind":"기타","group":"06_전투 보조","scope":"공통","desc":"스킬 쿨타임 감소 증감 옵션"},
{"id":78,"kr":"스턴 적중","en":"StunHit","kind":"공격","group":"08_상태이상 적중","scope":"공통","desc":"스턴 적중 증감 옵션"},
{"id":79,"kr":"마비 적중","en":"ParalysisHit","kind":"공격","group":"08_상태이상 적중","scope":"공통","desc":"마비 적중 증감 옵션"},
{"id":81,"kr":"침묵 적중","en":"SilenceHit","kind":"공격","group":"08_상태이상 적중","scope":"공통","desc":"침묵 적중 증감 옵션"},
{"id":82,"kr":"홀드 적중","en":"HoldHit","kind":"공격","group":"08_상태이상 적중","scope":"공통","desc":"홀드 적중 증감 옵션"},
{"id":83,"kr":"슬로우 적중","en":"SlowHit","kind":"공격","group":"08_상태이상 적중","scope":"공통","desc":"슬로우 적중 증감 옵션"},
{"id":86,"kr":"스턴 저항","en":"StunResist","kind":"방어","group":"06_상태이상 저항","scope":"공통","desc":"스턴 저항 증감 옵션"},
{"id":87,"kr":"마비 저항","en":"ParalysisResist","kind":"방어","group":"06_상태이상 저항","scope":"공통","desc":"마비 저항 증감 옵션"},
{"id":89,"kr":"침묵 저항","en":"SilenceResist","kind":"방어","group":"06_상태이상 저항","scope":"공통","desc":"침묵 저항 증감 옵션"},
{"id":90,"kr":"홀드 저항","en":"HoldResist","kind":"방어","group":"06_상태이상 저항","scope":"공통","desc":"홀드 저항 증감 옵션"},
{"id":91,"kr":"슬로우 저항","en":"SlowResist","kind":"방어","group":"06_상태이상 저항","scope":"공통","desc":"슬로우 저항 증감 옵션"},
{"id":93,"kr":"보스 몬스터 추가 공격력","en":"BossMonsterExtraAttack","kind":"공격","group":"09_보스/특수 대상","scope":"공통","desc":"보스몬스터와 전투시 최대 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":106,"kr":"보스 몬스터 추가 방어력","en":"BossMonsterExtraDefense","kind":"방어","group":"07_보스 방어","scope":"공통","desc":"보스몬스터와 전투시 모든 방어력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":118,"kr":"PVP 공격력","en":"PVPAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 전투시 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":119,"kr":"PVP 근거리 공격력","en":"PVPMeleeAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 전투시 근거리 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":120,"kr":"PVP 원거리 공격력","en":"PVPRangedAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 전투시 원거리 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":121,"kr":"PVP 마법 공격력","en":"PVPMagicAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 전투시 마법 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":122,"kr":"PVP 최소 공격력","en":"PVPMinAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 전투시 최소 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":123,"kr":"PVP 최소 근거리 공격력","en":"PVPMeleeMinAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 전투시 최소 근거리 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":124,"kr":"PVP 최소 원거리 공격력","en":"PVPRangedMinAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 전투시 최소 원거리 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":125,"kr":"PVP 최소 마법 공격력","en":"PVPMagicMinAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 전투시 최소 마법 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":126,"kr":"PVP 최대 공격력","en":"PVPMaxAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 전투시 최대 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":127,"kr":"PVP 최대 근거리 공격력","en":"PVPMeleeMaxAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 전투시 최대 근거리 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":128,"kr":"PVP 최대 원거리 공격력","en":"PVPRangedMaxAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 전투시 최대 원거리 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":129,"kr":"PVP 최대 마법 공격력","en":"PVPMagicMaxAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 전투시 최대 마법 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":130,"kr":"PVP 치명타 추가 공격력","en":"PVPAtCriticalAttack","kind":"공격","group":"06_PVP 치명타","scope":"PVP","desc":"PVP 전투 중 치명타 발생시 치명타 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":131,"kr":"PVP 치명타 근거리 공격력","en":"PVPAtCriticalMeleeAttack","kind":"공격","group":"06_PVP 치명타","scope":"PVP","desc":"PVP 전투 중 치명타 발생시 치명타 근거리 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":132,"kr":"PVP 치명타 원거리 공격력","en":"PVPAtCriticalRangedAttack","kind":"공격","group":"06_PVP 치명타","scope":"PVP","desc":"PVP 전투 중 치명타 발생시 치명타 원거리 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":133,"kr":"PVP 치명타 마법 공격력","en":"PVPAtCriticalMagicAttack","kind":"공격","group":"06_PVP 치명타","scope":"PVP","desc":"PVP 전투 중 치명타 발생시 치명타 마법 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":134,"kr":"PVP 명중","en":"PVPAccuracy","kind":"공격","group":"07_PVP 명중","scope":"PVP","desc":"PVP 전투시 명중 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":135,"kr":"PVP 근거리 명중","en":"PVPMeleeAccuracy","kind":"공격","group":"07_PVP 명중","scope":"PVP","desc":"PVP 전투시 근거리 명중 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":136,"kr":"PVP 원거리 명중","en":"PVPRangedAccuracy","kind":"공격","group":"07_PVP 명중","scope":"PVP","desc":"PVP 전투시 원거리 명중 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":137,"kr":"PVP 마법 명중","en":"PVPMagicAccuracy","kind":"공격","group":"07_PVP 명중","scope":"PVP","desc":"PVP 전투시 마법 명중 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":144,"kr":"PVP 치명타","en":"PVPCritical","kind":"공격","group":"06_PVP 치명타","scope":"PVP","desc":"PVP 전투시 치명타 확률 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":145,"kr":"PVP 근거리 치명타","en":"PVPMeleeCritical","kind":"공격","group":"06_PVP 치명타","scope":"PVP","desc":"PVP 전투시 근거리 치명타 확률 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":146,"kr":"PVP 원거리 치명타","en":"PVPRangedCritical","kind":"공격","group":"06_PVP 치명타","scope":"PVP","desc":"PVP 전투시 원거리 치명타 확률 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":147,"kr":"PVP 마법 치명타","en":"PVPMagicCritical","kind":"공격","group":"06_PVP 치명타","scope":"PVP","desc":"PVP 전투시 마법 치명타 확률 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":152,"kr":"PVP 대미지 리덕션","en":"PVPDamageReduction","kind":"방어","group":"05_PVP 피해 감소","scope":"PVP","desc":"PVP 전투시 대미지 리덕션 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":153,"kr":"PVP 근거리 대미지 리덕션","en":"PVPMeleeDamageReduction","kind":"방어","group":"05_PVP 피해 감소","scope":"PVP","desc":"PVP 전투시 근거리 대미지 리덕션 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":154,"kr":"PVP 원거리 대미지 리덕션","en":"PVPRangedDamageReduction","kind":"방어","group":"05_PVP 피해 감소","scope":"PVP","desc":"PVP 전투시 원거리 대미지 리덕션 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":155,"kr":"PVP 마법 대미지 리덕션","en":"PVPMagicDamageReduction","kind":"방어","group":"05_PVP 피해 감소","scope":"PVP","desc":"PVP 전투시 마법 대미지 리덕션 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":156,"kr":"PVP 대미지 리덕션 무시","en":"PVPDamageReductionIgnore","kind":"공격","group":"06_PVP 피해감소 무시","scope":"PVP","desc":"PVP 전투시 대미지 리덕션 무시 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":157,"kr":"PVP 근거리 대미지 리덕션 무시","en":"PVPMeleeDamageReductionIgnore","kind":"공격","group":"06_PVP 피해감소 무시","scope":"PVP","desc":"PVP 전투시 근거리 대미지 리덕션 무시 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":158,"kr":"PVP 원거리 대미지 리덕션 무시","en":"PVPRangedDamageReductionIgnore","kind":"공격","group":"06_PVP 피해감소 무시","scope":"PVP","desc":"PVP 전투시 원거리 대미지 리덕션 무시 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":159,"kr":"PVP 마법 대미지 리덕션 무시","en":"PVPMagicDamageReductionIgnore","kind":"공격","group":"06_PVP 피해감소 무시","scope":"PVP","desc":"PVP 전투시 마법 대미지 리덕션 무시 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":160,"kr":"PVP 받는 피해 감소","en":"PVPDamageReductionRate","kind":"방어","group":"05_PVP 피해 감소","scope":"PVP","desc":"PVP 전투시 받는 피해 감소 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":161,"kr":"PVP 받는 근거리 피해 감소","en":"PVPMeleeDamageReductionRate","kind":"방어","group":"05_PVP 피해 감소","scope":"PVP","desc":"PVP 전투시 받는 근거리 피해 감소 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":162,"kr":"PVP 받는 원거리 피해 감소","en":"PVPRangedDamageReductionRate","kind":"방어","group":"05_PVP 피해 감소","scope":"PVP","desc":"PVP 전투시 받는 원거리 피해 감소 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":163,"kr":"PVP 받는 마법 피해 감소","en":"PVPMagicDamageReductionRate","kind":"방어","group":"05_PVP 피해 감소","scope":"PVP","desc":"PVP 전투시 받는 마법 피해 감소 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":165,"kr":"PVP 스킬 피해 감소 무시","en":"PVPSkillDamageReductionIgnore","kind":"공격","group":"06_PVP 피해감소 무시","scope":"PVP","desc":"PVP 전투시 스킬 피해 감소 무시에 추가 적용되는 능력치 증감 옵션"},
{"id":168,"kr":"경험치 획득량","en":"EXPBonus","kind":"특수","group":"01_경험치/성장","scope":"공통","desc":"몬스터 처치시 경험치 획득량 증감 옵션"},
{"id":169,"kr":"재화1 드랍량","en":"CPBonus","kind":"특수","group":"02_재화","scope":"공통","desc":"몬스터 처치시 드랍되는 재화1 드랍량 증감 옵션"},
{"id":170,"kr":"아이템 드랍율","en":"ItemDropBonus","kind":"기타","group":"06_전투 보조","scope":"공통","desc":"몬스터 처치시 아이템 드랍율 증감 옵션"},
{"id":179,"kr":"일반 공격 추가 치명타 저항","en":"NormalExtraCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"공통","desc":"일반 공격 추가 치명타 저항 증감 옵션"},
{"id":180,"kr":"일반 공격 근거리 추가 치명타 저항","en":"NormalMeleeExtraCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"공통","desc":"일반 공격 근거리 추가 치명타 저항 증감 옵션"},
{"id":181,"kr":"일반 공격 원거리 추가 치명타 저항","en":"NormalRangedExtraCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"공통","desc":"일반 공격 원거리 추가 치명타 저항 증감 옵션"},
{"id":182,"kr":"일반 공격 마법 추가 치명타 저항","en":"NormalMagicExtraCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"공통","desc":"일반 공격 마법 추가 치명타 저항 증감 옵션"},
{"id":183,"kr":"스킬 추가 치명타 저항","en":"SkillExtraCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"공통","desc":"스킬 추가 치명타 저항 증감 옵션"},
{"id":184,"kr":"스킬 근거리 추가 치명타 저항","en":"SkillMeleeExtraCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"공통","desc":"스킬 근거리 추가 치명타 저항 증감 옵션"},
{"id":185,"kr":"스킬 원거리 추가 치명타 저항","en":"SkillRangedExtraCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"공통","desc":"스킬 원거리 추가 치명타 저항 증감 옵션"},
{"id":186,"kr":"스킬 마법 추가 치명타 저항","en":"SkillMagicExtraCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"공통","desc":"스킬 마법 추가 치명타 저항 증감 옵션"},
{"id":187,"kr":"PVP 일반 공격 추가 치명타","en":"PVPNormalExtraCritical","kind":"공격","group":"06_PVP 치명타","scope":"PVP","desc":"PVP 일반 공격 추가 치명타 증감 옵션"},
{"id":188,"kr":"PVP 일반 공격 근거리 추가 치명타","en":"PVPNormalMeleeExtraCritical","kind":"공격","group":"06_PVP 치명타","scope":"PVP","desc":"PVP 일반 공격 근거리 추가 치명타 증감 옵션"},
{"id":189,"kr":"PVP 일반 공격 원거리 추가 치명타","en":"PVPNormalRangedExtraCritical","kind":"공격","group":"06_PVP 치명타","scope":"PVP","desc":"PVP 일반 공격 원거리 추가 치명타 증감 옵션"},
{"id":190,"kr":"PVP 일반 공격 마법 추가 치명타","en":"PVPNormalMagicExtraCritical","kind":"공격","group":"06_PVP 치명타","scope":"PVP","desc":"PVP 일반 공격 마법 추가 치명타 증감 옵션"},
{"id":191,"kr":"PVP 스킬 추가 치명타","en":"PVPSkillExtraCritical","kind":"공격","group":"06_PVP 치명타","scope":"PVP","desc":"PVP 스킬 추가 치명타 증감 옵션"},
{"id":192,"kr":"PVP 스킬 근거리 추가 치명타","en":"PVPSkillMeleeExtraCritical","kind":"공격","group":"06_PVP 치명타","scope":"PVP","desc":"PVP 스킬 근거리 추가 치명타 증감 옵션"},
{"id":193,"kr":"PVP 스킬 원거리 추가 치명타","en":"PVPSkillRangedExtraCritical","kind":"공격","group":"06_PVP 치명타","scope":"PVP","desc":"PVP 스킬 원거리 추가 치명타 증감 옵션"},
{"id":194,"kr":"PVP 스킬 마법 추가 치명타","en":"PVPSkillMagicExtraCritical","kind":"공격","group":"06_PVP 치명타","scope":"PVP","desc":"PVP 스킬 마법 추가 치명타 증감 옵션"},
{"id":203,"kr":"PVE 치명타","en":"PVECritical","kind":"공격","group":"03_PVE 치명타","scope":"PVE","desc":"PVE 전투시 치명타 확률 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":204,"kr":"PVE 근거리 치명타","en":"PVEMeleeCritical","kind":"공격","group":"03_PVE 치명타","scope":"PVE","desc":"PVE 전투시 근거리 치명타 확률 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":205,"kr":"PVE 원거리 치명타","en":"PVERangedCritical","kind":"공격","group":"03_PVE 치명타","scope":"PVE","desc":"PVE 전투시 원거리 치명타 확률 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":206,"kr":"PVE 마법 치명타","en":"PVEMagicCritical","kind":"공격","group":"03_PVE 치명타","scope":"PVE","desc":"PVE 전투시 마법 치명타 확률 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":211,"kr":"PVE 일반 공격 추가 치명타","en":"PVENormalExtraCritical","kind":"공격","group":"03_PVE 치명타","scope":"PVE","desc":"PVE 일반 공격 추가 치명타 증감 옵션"},
{"id":212,"kr":"PVE 일반 공격 근거리 추가 치명타","en":"PVENormalMeleeExtraCritical","kind":"공격","group":"03_PVE 치명타","scope":"PVE","desc":"PVE 일반 공격 근거리 추가 치명타 증감 옵션"},
{"id":213,"kr":"PVE 일반 공격 원거리 추가 치명타","en":"PVENormalRangedExtraCritical","kind":"공격","group":"03_PVE 치명타","scope":"PVE","desc":"PVE 일반 공격 원거리 추가 치명타 증감 옵션"},
{"id":214,"kr":"PVE 일반 공격 마법 추가 치명타","en":"PVENormalMagicExtraCritical","kind":"공격","group":"03_PVE 치명타","scope":"PVE","desc":"PVE 일반 공격 마법 추가 치명타 증감 옵션"},
{"id":215,"kr":"PVE 스킬 추가 치명타","en":"PVESkillExtraCritical","kind":"공격","group":"03_PVE 치명타","scope":"PVE","desc":"PVE 스킬 추가 치명타 증감 옵션"},
{"id":216,"kr":"PVE 스킬 근거리 추가 치명타","en":"PVESkillMeleeExtraCritical","kind":"공격","group":"03_PVE 치명타","scope":"PVE","desc":"PVE 스킬 근거리 추가 치명타 증감 옵션"},
{"id":217,"kr":"PVE 스킬 원거리 추가 치명타","en":"PVESkillRangedExtraCritical","kind":"공격","group":"03_PVE 치명타","scope":"PVE","desc":"PVE 스킬 원거리 추가 치명타 증감 옵션"},
{"id":218,"kr":"PVE 스킬 마법 추가 치명타","en":"PVESkillMagicExtraCritical","kind":"공격","group":"03_PVE 치명타","scope":"PVE","desc":"PVE 스킬 마법 추가 치명타 증감 옵션"},
{"id":227,"kr":"PVE 명중","en":"PVEAccuracy","kind":"공격","group":"04_PVE 명중","scope":"PVE","desc":"PVE 명중 증감 옵션"},
{"id":228,"kr":"PVE 근거리 명중","en":"PVEMeleeAccuracy","kind":"공격","group":"04_PVE 명중","scope":"PVE","desc":"PVE 근거리 명중 증감 옵션"},
{"id":229,"kr":"PVE 원거리 명중","en":"PVERangedAccuracy","kind":"공격","group":"04_PVE 명중","scope":"PVE","desc":"PVE 원거리 명중 증감 옵션"},
{"id":230,"kr":"PVE 마법 명중","en":"PVEMagicAccuracy","kind":"공격","group":"04_PVE 명중","scope":"PVE","desc":"PVE 마법 명중 증감 옵션"},
{"id":237,"kr":"도발 적중","en":"ProvokeHit","kind":"공격","group":"08_상태이상 적중","scope":"공통","desc":"도발 적중 증감 옵션"},
{"id":238,"kr":"화상 적중","en":"BurnHit","kind":"공격","group":"08_상태이상 적중","scope":"공통","desc":"화상 적중 증감 옵션"},
{"id":239,"kr":"출혈 적중","en":"BleedingHit","kind":"공격","group":"08_상태이상 적중","scope":"공통","desc":"출혈 적중 증감 옵션"},
{"id":240,"kr":"중독 적중","en":"PoisonHit","kind":"공격","group":"08_상태이상 적중","scope":"공통","desc":"중독 적중 증감 옵션"},
{"id":241,"kr":"냉기 적중","en":"ColdHit","kind":"공격","group":"08_상태이상 적중","scope":"공통","desc":"냉기 적중 증감 옵션"},
{"id":267,"kr":"도발 저항","en":"ProvokeResist","kind":"방어","group":"06_상태이상 저항","scope":"공통","desc":"도발 저항 증감 옵션"},
{"id":268,"kr":"화상 저항","en":"BurnResist","kind":"방어","group":"06_상태이상 저항","scope":"공통","desc":"화상 저항 증감 옵션"},
{"id":269,"kr":"출혈 저항","en":"BleedingResist","kind":"방어","group":"06_상태이상 저항","scope":"공통","desc":"출혈 저항 증감 옵션"},
{"id":270,"kr":"중독 저항","en":"PoisonResist","kind":"방어","group":"06_상태이상 저항","scope":"공통","desc":"중독 저항 증감 옵션"},
{"id":271,"kr":"냉기 저항","en":"ColdResist","kind":"방어","group":"06_상태이상 저항","scope":"공통","desc":"냉기 저항 증감 옵션"},
{"id":297,"kr":"PVE 공격력","en":"PVEAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 전투시 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":298,"kr":"PVE 근거리 공격력","en":"PVEMeleeAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 전투시 근거리 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":299,"kr":"PVE 원거리 공격력","en":"PVERangedAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 전투시 원거리 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":300,"kr":"PVE 마법 공격력","en":"PVEMagicAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 전투시 마법 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":301,"kr":"PVE 최소 공격력","en":"PVEMinAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 전투시 최소 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":302,"kr":"PVE 최소 근거리 공격력","en":"PVEMeleeMinAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 전투시 최소 근거리 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":303,"kr":"PVE 최소 원거리 공격력","en":"PVERangedMinAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 전투시 최소 원거리 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":304,"kr":"PVE 최소 마법 공격력","en":"PVEMagicMinAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 전투시 최소 마법 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":305,"kr":"PVE 최대 공격력","en":"PVEMaxAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 전투시 최대 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":306,"kr":"PVE 최대 근거리 공격력","en":"PVEMeleeMaxAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 전투시 최대 근거리 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":307,"kr":"PVE 최대 원거리 공격력","en":"PVERangedMaxAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 전투시 최대 원거리 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":308,"kr":"PVE 최대 마법 공격력","en":"PVEMagicMaxAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 전투시 최대 마법 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":309,"kr":"PVE 치명타 추가 공격력","en":"PVEAtCriticalAttack","kind":"공격","group":"03_PVE 치명타","scope":"PVE","desc":"PVE 전투 중 치명타 발생시 치명타 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":310,"kr":"PVE 치명타 근거리 공격력","en":"PVEAtCriticalMeleeAttack","kind":"공격","group":"03_PVE 치명타","scope":"PVE","desc":"PVE 전투 중 치명타 발생시 치명타 근거리 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":311,"kr":"PVE 치명타 원거리 공격력","en":"PVEAtCriticalRangedAttack","kind":"공격","group":"03_PVE 치명타","scope":"PVE","desc":"PVE 전투 중 치명타 발생시 치명타 원거리 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":312,"kr":"PVE 치명타 마법 공격력","en":"PVEAtCriticalMagicAttack","kind":"공격","group":"03_PVE 치명타","scope":"PVE","desc":"PVE 전투 중 치명타 발생시 치명타 마법 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":325,"kr":"PVP 일반 공격 공격력","en":"PVPNormalAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격시 PVP 일반 공격 공격력 능력치에 추가 적용되는 능력치 증갑 옵션"},
{"id":326,"kr":"PVP 일반 공격 최소 공격력","en":"PVPNormalMinAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격시 PVP 일반 공격 최소 공격력 능력치에 추가 적용되는 능력치 증갑 옵션"},
{"id":327,"kr":"PVP 일반 공격 최대 공격력","en":"PVPNormalMaxAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격시 PVP 일반 공격 최대 공격력 능력치에 추가 적용되는 능력치 증갑 옵션"},
{"id":337,"kr":"PVE 일반 공격 공격력","en":"PVENormalAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격시 PVE 일반 공격 공격력 능력치에 추가 적용되는 능력치 증갑 옵션"},
{"id":338,"kr":"PVE 일반 공격 최소 공격력","en":"PVENormalMinAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격시 PVE 일반 공격 최소 공격력 능력치에 추가 적용되는 능력치 증갑 옵션"},
{"id":339,"kr":"PVE 일반 공격 최대 공격력","en":"PVENormalMaxAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격시 PVE 일반 공격 최대 공격력 능력치에 추가 적용되는 능력치 증갑 옵션"},
{"id":360,"kr":"PVP 스킬 공격력","en":"PVPSkillAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 공격시 PVP 스킬 공격력 능력치에 추가 적용되는 능력치 증갑 옵션"},
{"id":361,"kr":"PVP 스킬 최소 공격력","en":"PVPSkillMinAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 공격시 PVP 스킬 최소 공격력 능력치에 추가 적용되는 능력치 증갑 옵션"},
{"id":362,"kr":"PVP 스킬 최대 공격력","en":"PVPSkillMaxAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 공격시 PVP 스킬 최대 공격력 능력치에 추가 적용되는 능력치 증갑 옵션"},
{"id":372,"kr":"PVE 스킬 공격력","en":"PVESkillAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 공격시 PVE 스킬 공격력 능력치에 추가 적용되는 능력치 증갑 옵션"},
{"id":373,"kr":"PVE 스킬 최소 공격력","en":"PVESkillMinAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 공격시 PVE 스킬 최소 공격력 능력치에 추가 적용되는 능력치 증갑 옵션"},
{"id":374,"kr":"PVE 스킬 최대 공격력","en":"PVESkillMaxAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 공격시 PVE 스킬 최대 공격력 능력치에 추가 적용되는 능력치 증갑 옵션"},
{"id":465,"kr":"PVE 스킬 피해 감소 무시","en":"PVESkillDamageReductionIgnore","kind":"공격","group":"06_PVE 피해감소 무시","scope":"PVE","desc":"PVE 전투시 스킬 피해 감소 무시에 추가 적용되는 능력치 증감 옵션"},
{"id":466,"kr":"PVE 받는 피해 감소","en":"PVEDamageReductionRate","kind":"방어","group":"05_피해 감소","scope":"PVE","desc":"PVE 전투시 받는 피해 감소 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":467,"kr":"PVE 받는 근거리 피해 감소","en":"PVEMeleeDamageReductionRate","kind":"방어","group":"05_피해 감소","scope":"PVE","desc":"PVE 전투시 받는 근거리 피해 감소 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":468,"kr":"PVE 받는 원거리 피해 감소","en":"PVERangedDamageReductionRate","kind":"방어","group":"05_피해 감소","scope":"PVE","desc":"PVE 전투시 받는 원거리 피해 감소 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":469,"kr":"PVE 받는 마법 피해 감소","en":"PVEMagicDamageReductionRate","kind":"방어","group":"05_피해 감소","scope":"PVE","desc":"PVE 전투시 받는 마법 피해 감소 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":482,"kr":"사거리","en":"CommonTargetRange","kind":"기타","group":"06_전투 보조","scope":"공통","desc":"사거리 증감 옵션"},
{"id":483,"kr":"사거리 변화율","en":"CommonTargetRangeRate","kind":"기타","group":"06_전투 보조","scope":"공통","desc":"사거리 증감 옵션"},
{"id":488,"kr":"정예 몬스터 추가 공격력","en":"EliteMonsterExtraAttack","kind":"공격","group":"09_보스/특수 대상","scope":"공통","desc":"정예 몬스터와 전투시 최대 공격력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":489,"kr":"정예 몬스터 추가 방어력","en":"EliteMonsterExtraDefense","kind":"방어","group":"07_보스 방어","scope":"공통","desc":"정예 몬스터와 전투시 방어력 능력치에 추가 적용되는 능력치 증감 옵션"},
{"id":494,"kr":"근거리 방어력 증폭","en":"PhysicalDefenseAmplifyRate","kind":"방어","group":"08_방어 증폭","scope":"공통","desc":"근거리(=물리) 방어력을 추가로 증폭(%)하는 증감 옵션"},
{"id":495,"kr":"마법 방어력 증폭","en":"MagicDefenseAmplifyRate","kind":"방어","group":"08_방어 증폭","scope":"공통","desc":"마법 방어력을 추가로 증폭(%)하는 증감 옵션"},
{"id":498,"kr":"회피 증폭","en":"EvasionAmplifyRate","kind":"방어","group":"02_회피","scope":"공통","desc":"회피를 추가로 증폭(%)하는 증감 옵션"},
{"id":499,"kr":"최대 HP 증폭","en":"MaxHealthPointAmplifyRate","kind":"기타","group":"03_HP / MP","scope":"공통","desc":"최대 HP를 추가로 증가시키는 증감 옵션"},
{"id":500,"kr":"최대 MP 증폭","en":"MaxManaPointAmplifyRate","kind":"기타","group":"03_HP / MP","scope":"공통","desc":"최대 MP를 추가로 증가시키는 증감 옵션"},
{"id":503,"kr":"전투력","en":"CombatPower","kind":"기타","group":"06_전투 보조","scope":"공통","desc":"정해진 기준에 맞게 스탯, 스킬, 세트 옵션으로 산출된 수치"},
{"id":504,"kr":"질병 적중","en":"DiseaseHit","kind":"공격","group":"08_상태이상 적중","scope":"공통","desc":"질병 적중 증감 옵션"},
{"id":507,"kr":"질병 저항","en":"DiseaseResist","kind":"방어","group":"06_상태이상 저항","scope":"공통","desc":"질병 저항 증감 옵션"},
{"id":516,"kr":"모든 스탯 증폭","en":"AllStatAmplifyRate","kind":"기타","group":"02_기본 스탯 증폭","scope":"공통","desc":"모든 스탯을 추가로 증폭(%)하는 증감 옵션"},
{"id":517,"kr":"힘 증폭","en":"STRAmplifyRate","kind":"기타","group":"02_기본 스탯 증폭","scope":"공통","desc":"힘 스탯을 추가로 증폭(%)하는 증감 옵션"},
{"id":518,"kr":"민첩 증폭","en":"DEXAmplifyRate","kind":"기타","group":"02_기본 스탯 증폭","scope":"공통","desc":"민첩 스탯을 추가로 증폭(%)하는 증감 옵션"},
{"id":519,"kr":"지능 증폭","en":"INTAmplifyRate","kind":"기타","group":"02_기본 스탯 증폭","scope":"공통","desc":"지능 스탯을 추가로 증폭(%)하는 증감 옵션"},
{"id":520,"kr":"건강 증폭","en":"CONAmplifyRate","kind":"기타","group":"02_기본 스탯 증폭","scope":"공통","desc":"건강 스탯을 추가로 증폭(%)하는 증감 옵션"},
{"id":521,"kr":"모든 스탯 약화","en":"AllStatWeakenRate","kind":"기타","group":"Z_약화","scope":"공통","desc":"모든 스탯을 추가로 약화(%)시키는 옵션"},
{"id":522,"kr":"힘 약화","en":"STRWeakenRate","kind":"기타","group":"Z_약화","scope":"공통","desc":"힘 스탯을 추가로 약화(%)시키는 옵션"},
{"id":523,"kr":"민첩 약화","en":"DEXWeakenRate","kind":"기타","group":"Z_약화","scope":"공통","desc":"민첩 스탯을 추가로 약화(%)시키는 옵션"},
{"id":524,"kr":"지능 약화","en":"INTWeakenRate","kind":"기타","group":"Z_약화","scope":"공통","desc":"지능 스탯을 추가로 약화(%)시키는 옵션"},
{"id":525,"kr":"건강 약화","en":"CONWeakenRate","kind":"기타","group":"Z_약화","scope":"공통","desc":"건강 스탯을 추가로 약화(%)시키는 옵션"},
{"id":552,"kr":"모든 방어력 증폭","en":"AllDefenseAmplifyRate","kind":"방어","group":"08_방어 증폭","scope":"공통","desc":"모든 방어력을 증폭(%)시키는 증감 옵션"},
{"id":553,"kr":"모든 방어력 약화","en":"AllDefenseWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"모든 방어력을 약화(%)시키는 옵션"},
{"id":554,"kr":"근거리 방어력 약화","en":"PhysicalDefenseWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"근거리(=물리) 방어력을 약화(%)시키는 옵션"},
{"id":555,"kr":"마법 방어력 약화","en":"MagicDefenseWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"마법 방어력을 약화(%)시키는 옵션"},
{"id":556,"kr":"근거리 회피 증폭","en":"MeleeEvasionAmplifyRate","kind":"방어","group":"02_회피","scope":"공통","desc":"근거리 회피를 증폭(%)시키는 증감 옵션"},
{"id":557,"kr":"원거리 회피 증폭","en":"RangedEvasionAmplifyRate","kind":"방어","group":"02_회피","scope":"공통","desc":"원거리 회피를 증폭(%)시키는 증감 옵션"},
{"id":558,"kr":"마법 회피 증폭","en":"MagicEvasionAmplifyRate","kind":"방어","group":"02_회피","scope":"공통","desc":"마법 회피를 증폭(%)시키는 증감 옵션"},
{"id":559,"kr":"회피 약화","en":"EvasionWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"회피를 약화(%)시키는 옵션"},
{"id":560,"kr":"근거리 회피 약화","en":"MeleeEvasionWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"근거리 회피를 약화(%)시키는 옵션"},
{"id":561,"kr":"원거리 회피 약화","en":"RangedEvasionWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"원거리 회피를 약화(%)시키는 옵션"},
{"id":562,"kr":"마법 회피 약화","en":"MagicEvasionWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"마법 회피를 약화(%)시키는 옵션"},
{"id":567,"kr":"치명타 저항 약화","en":"CriticalResistWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"치명타 저항을 약화(%)시키는 옵션"},
{"id":568,"kr":"근거리 치명타 저항 약화","en":"MeleeCriticalResistWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"근거리 치명타 저항을 약화(%)시키는 옵션"},
{"id":569,"kr":"원거리 치명타 저항 약화","en":"RangedCriticalResistWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"원거리 치명타 저항을 약화(%)시키는 옵션"},
{"id":570,"kr":"마법 치명타 저항 약화","en":"MagicCriticalResistWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"마법 치명타 저항을 약화(%)시키는 옵션"},
{"id":590,"kr":"스킬 피해 감소 증폭","en":"SkillDamageReductionAmplifyRate","kind":"방어","group":"05_피해 감소","scope":"공통","desc":"스킬 피해 감소를 증폭(%)시키는 증감 옵션"},
{"id":592,"kr":"스킬 피해 감소 약화","en":"SkillDamageReductionWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"스킬 피해 감소를 약화(%)시키는 옵션"},
{"id":594,"kr":"공격속도 증폭","en":"AttackSpeedAmplifyRate","kind":"기타","group":"05_속도","scope":"공통","desc":"공격속도를 증폭(%)시키는 증감 옵션"},
{"id":595,"kr":"공격속도 약화","en":"AttackSpeedWeakenRate","kind":"기타","group":"Z_약화","scope":"공통","desc":"공격속도를 약화(%)시키는 옵션"},
{"id":596,"kr":"이동속도 약화","en":"MoveSpeedWeakenRate","kind":"기타","group":"Z_약화","scope":"공통","desc":"이동속도를 약화(%)시키는 옵션"},
{"id":611,"kr":"스턴 적중 약화","en":"StunHitWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"스턴 적중을 약화(%)시키는 옵션"},
{"id":612,"kr":"마비 적중 약화","en":"ParalysisHitWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"마비 적중을 약화(%)시키는 옵션"},
{"id":614,"kr":"침묵 적중 약화","en":"SilenceHitWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"침묵 적중을 약화(%)시키는 옵션"},
{"id":615,"kr":"홀드 적중 약화","en":"HoldHitWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"홀드 적중을 약화(%)시키는 옵션"},
{"id":616,"kr":"슬로우 적중 약화","en":"SlowHitWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"슬로우 적중을 약화(%)시키는 옵션"},
{"id":617,"kr":"화상 적중 약화","en":"BurnHitWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"화상 적중을 약화(%)시키는 옵션"},
{"id":618,"kr":"출혈 적중 약화","en":"BleedingHitWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"출혈 적중을 약화(%)시키는 옵션"},
{"id":619,"kr":"중독 적중 약화","en":"PoisonHitWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"중독 적중을 약화(%)시키는 옵션"},
{"id":620,"kr":"냉기 적중 약화","en":"ColdHitWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"냉기 적중을 약화(%)시키는 옵션"},
{"id":621,"kr":"질병 적중 약화","en":"DiseaseHitWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"질병 적중을 약화(%)시키는 옵션"},
{"id":625,"kr":"스턴 저항 약화","en":"StunResistWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"스턴 저항을 약화(%)시키는 옵션"},
{"id":626,"kr":"마비 저항 약화","en":"ParalysisResistWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"마비 저항을 약화(%)시키는 옵션"},
{"id":628,"kr":"침묵 저항 약화","en":"SilenceResistWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"침묵 저항을 약화(%)시키는 옵션"},
{"id":629,"kr":"홀드 저항 약화","en":"HoldResistWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"홀드 저항을 약화(%)시키는 옵션"},
{"id":630,"kr":"슬로우 저항 약화","en":"SlowResistWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"슬로우 저항을 약화(%)시키는 옵션"},
{"id":631,"kr":"화상 저항 약화","en":"BurnResistWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"화상 저항을 약화(%)시키는 옵션"},
{"id":632,"kr":"출혈 저항 약화","en":"BleedingResistWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"출혈 저항을 약화(%)시키는 옵션"},
{"id":633,"kr":"중독 저항 약화","en":"PoisonResistWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"중독 저항을 약화(%)시키는 옵션"},
{"id":634,"kr":"냉기 저항 약화","en":"ColdResistWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"냉기 저항을 약화(%)시키는 옵션"},
{"id":635,"kr":"질병 저항 약화","en":"DiseaseResistWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"질병 저항을 약화(%)시키는 옵션"},
{"id":638,"kr":"보스 몬스터 추가 공격력 증폭","en":"BossMonsterExtraAttackAmplifyRate","kind":"공격","group":"09_보스/특수 대상","scope":"공통","desc":"보스몬스터와 전투시 최대 공격력 능력치에 추가 적용되는 능력치를 증폭(%)시키는 증감 옵션"},
{"id":639,"kr":"정예 몬스터 추가 공격력 증폭","en":"EliteMonsterExtraAttackAmplifyRate","kind":"공격","group":"09_보스/특수 대상","scope":"공통","desc":"정예 몬스터와 전투시 최대 공격력 능력치에 추가 적용되는 능력치를 증폭(%)시키는 증감 옵션"},
{"id":641,"kr":"보스 몬스터 추가 방어력 증폭","en":"BossMonsterExtraDefenseAmplifyRate","kind":"방어","group":"07_보스 방어","scope":"공통","desc":"보스몬스터와 전투시 모든 방어력 능력치에 추가 적용되는 능력치를 증폭(%)시키는 증감 옵션"},
{"id":642,"kr":"정예 몬스터 추가 방어력 증폭","en":"EliteMonsterExtraDefenseAmplifyRate","kind":"방어","group":"07_보스 방어","scope":"공통","desc":"정예 몬스터와 전투시 방어력 능력치에 추가 적용되는 능력치를 증폭(%)시키는 증감 옵션"},
{"id":644,"kr":"PVE 공격력 증폭","en":"PVEAttackAmplifyRate","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 공격력을 증폭(%)시키는 옵션"},
{"id":645,"kr":"PVE 근거리 공격력 증폭","en":"PVEMeleeAttackAmplifyRate","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 근거리 공격력을 증폭(%)시키는 옵션"},
{"id":646,"kr":"PVE 원거리 공격력 증폭","en":"PVERangedAttackAmplifyRate","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 원거리 공격력을 증폭(%)시키는 옵션"},
{"id":647,"kr":"PVE 마법 공격력 증폭","en":"PVEMagicAttackAmplifyRate","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 마법 공격력을 증폭(%)시키는 옵션"},
{"id":648,"kr":"PVE 공격력 약화","en":"PVEAttackWeakenRate","kind":"공격","group":"Z_약화","scope":"PVE","desc":"PVE 공격력 을 약화(%)시키는 옵션"},
{"id":649,"kr":"PVE 치명타 공격력 증폭","en":"PVEAtCriticalAttackAmplifyRate","kind":"공격","group":"03_PVE 치명타","scope":"PVE","desc":"PVE 치명타 공격력을 증폭(%)시키는 옵션"},
{"id":650,"kr":"PVE 치명타 근거리 공격력 증폭","en":"PVEAtCriticalMeleeAttackAmplifyRate","kind":"공격","group":"03_PVE 치명타","scope":"PVE","desc":"PVE 치명타 근거리 공격력을 증폭(%)시키는 옵션"},
{"id":651,"kr":"PVE 치명타 원거리 공격력 증폭","en":"PVEAtCriticalRangedAttackAmplifyRate","kind":"공격","group":"03_PVE 치명타","scope":"PVE","desc":"PVE 치명타 원거리 공격력을 증폭(%)시키는 옵션"},
{"id":652,"kr":"PVE 치명타 마법 공격력 증폭","en":"PVEAtCriticalMagicAttackAmplifyRate","kind":"공격","group":"03_PVE 치명타","scope":"PVE","desc":"PVE 치명타 마법 공격력을 증폭(%)시키는 옵션"},
{"id":653,"kr":"PVE 치명타 공격력 약화","en":"PVEAtCriticalAttackWeakenRate","kind":"공격","group":"Z_약화","scope":"PVE","desc":"PVE 치명타 공격력 을 약화(%)시키는 옵션"},
{"id":654,"kr":"PVE 스킬 공격력 증폭","en":"PVESkillAttackAmplifyRate","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 공격력을 증폭(%)시키는 옵션"},
{"id":655,"kr":"PVE 스킬 공격력 약화","en":"PVESkillAttackWeakenRate","kind":"공격","group":"Z_약화","scope":"PVE","desc":"PVE 스킬 공격력 을 약화(%)시키는 옵션"},
{"id":656,"kr":"PVP 공격력 증폭","en":"PVPAttackAmplifyRate","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 공격력을 증폭(%)시키는 옵션"},
{"id":657,"kr":"PVP 근거리 공격력 증폭","en":"PVPMeleeAttackAmplifyRate","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 근거리 공격력을 증폭(%)시키는 옵션"},
{"id":658,"kr":"PVP 원거리 공격력 증폭","en":"PVPRangedAttackAmplifyRate","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 원거리 공격력을 증폭(%)시키는 옵션"},
{"id":659,"kr":"PVP 마법 공격력 증폭","en":"PVPMagicAttackAmplifyRate","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 마법 공격력을 증폭(%)시키는 옵션"},
{"id":660,"kr":"PVP 공격력 약화","en":"PVPAttackWeakenRate","kind":"공격","group":"Z_약화","scope":"PVP","desc":"PVP 공격력 을 약화(%)시키는 옵션"},
{"id":661,"kr":"PVP 치명타 공격력 증폭","en":"PVPAtCriticalAttackAmplifyRate","kind":"공격","group":"06_PVP 치명타","scope":"PVP","desc":"PVP 치명타 공격력을 증폭(%)시키는 옵션"},
{"id":662,"kr":"PVP 치명타 근거리 공격력 증폭","en":"PVPAtCriticalMeleeAttackAmplifyRate","kind":"공격","group":"06_PVP 치명타","scope":"PVP","desc":"PVP 치명타 근거리 공격력을 증폭(%)시키는 옵션"},
{"id":663,"kr":"PVP 치명타 원거리 공격력 증폭","en":"PVPAtCriticalRangedAttackAmplifyRate","kind":"공격","group":"06_PVP 치명타","scope":"PVP","desc":"PVP 치명타 원거리 공격력을 증폭(%)시키는 옵션"},
{"id":664,"kr":"PVP 치명타 마법 공격력 증폭","en":"PVPAtCriticalMagicAttackAmplifyRate","kind":"공격","group":"06_PVP 치명타","scope":"PVP","desc":"PVP 치명타 마법 공격력을 증폭(%)시키는 옵션"},
{"id":665,"kr":"PVP 치명타 공격력 약화","en":"PVPAtCriticalAttackWeakenRate","kind":"공격","group":"Z_약화","scope":"PVP","desc":"PVP 치명타 공격력 을 약화(%)시키는 옵션"},
{"id":666,"kr":"PVP 스킬 공격력 증폭","en":"PVPSkillAttackAmplifyRate","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 공격력을 증폭(%)시키는 옵션"},
{"id":667,"kr":"PVP 스킬 공격력 약화","en":"PVPSkillAttackWeakenRate","kind":"공격","group":"Z_약화","scope":"PVP","desc":"PVP 스킬 공격력 을 약화(%)시키는 옵션"},
{"id":668,"kr":"재화2 드랍량","en":"ECBonus","kind":"특수","group":"02_재화","scope":"공통","desc":"몬스터 처치시 드랍되는 재화2 드랍량을 증감시키는 옵션"},
{"id":669,"kr":"재화3 드랍량","en":"ACBonus","kind":"특수","group":"02_재화","scope":"공통","desc":"몬스터 처치시 드랍되는 재화3 드랍량을 증감시키는 옵션"},
{"id":670,"kr":"물약 회복률 약화","en":"PotionRecoveryWeakenRate","kind":"기타","group":"Z_약화","scope":"공통","desc":"물약 회복률을 을 약화(%) 시키는시키는 옵션"},
{"id":671,"kr":"무기 숙련도 획득량","en":"WeaponEXPBonus","kind":"특수","group":"01_경험치/성장","scope":"공통","desc":"몬스터 처치시 무기 숙련도 증감시키는 옵션"},
{"id":672,"kr":"받는 피해 추가 감소","en":"AdditionalDamageReductionRate","kind":"방어","group":"05_피해 감소","scope":"공통","desc":"받는 피해 추가 감소 증감 옵션 : 4차 방어 공식(블레스 오브 엘리멘탈)에 사용"},
{"id":673,"kr":"PVE 명중 증폭","en":"PVEAccuracyAmplifyRate","kind":"공격","group":"04_PVE 명중","scope":"PVE","desc":"PVE 명중을 증폭(%)시키는 옵션"},
{"id":674,"kr":"PVE 근거리 명중 증폭","en":"PVEMeleeAccuracyAmplifyRate","kind":"공격","group":"04_PVE 명중","scope":"PVE","desc":"PVE 근거리 명중을 증폭(%)시키는 옵션"},
{"id":675,"kr":"PVE 원거리 명중 증폭","en":"PVERangedAccuracyAmplifyRate","kind":"공격","group":"04_PVE 명중","scope":"PVE","desc":"PVE 원거리 명중을 증폭(%)시키는 옵션"},
{"id":676,"kr":"PVE 마법 명중 증폭","en":"PVEMagicAccuracyAmplifyRate","kind":"공격","group":"04_PVE 명중","scope":"PVE","desc":"PVE 마법 명중을 증폭(%)시키는 옵션"},
{"id":677,"kr":"PVP 명중 증폭","en":"PVPAccuracyAmplifyRate","kind":"공격","group":"07_PVP 명중","scope":"PVP","desc":"PVP 명중을 증폭(%)시키는 옵션"},
{"id":678,"kr":"PVP 근거리 명중 증폭","en":"PVPMeleeAccuracyAmplifyRate","kind":"공격","group":"07_PVP 명중","scope":"PVP","desc":"PVP 근거리 명중을 증폭(%)시키는 옵션"},
{"id":679,"kr":"PVP 원거리 명중 증폭","en":"PVPRangedAccuracyAmplifyRate","kind":"공격","group":"07_PVP 명중","scope":"PVP","desc":"PVP 원거리 명중을 증폭(%)시키는 옵션"},
{"id":680,"kr":"PVP 마법 명중 증폭","en":"PVPMagicAccuracyAmplifyRate","kind":"공격","group":"07_PVP 명중","scope":"PVP","desc":"PVP 마법 명중을 증폭(%)시키는 옵션"},
{"id":681,"kr":"PVE 명중 약화","en":"PVEAccuracyWeakenRate","kind":"공격","group":"Z_약화","scope":"PVE","desc":"PVE 명중을 약화(%)시키는 옵션"},
{"id":682,"kr":"PVE 근거리 명중 약화","en":"PVEMeleeAccuracyWeakenRate","kind":"공격","group":"Z_약화","scope":"PVE","desc":"PVE 근거리 명중을 약화(%)시키는 옵션"},
{"id":683,"kr":"PVE 원거리 명중 약화","en":"PVERangedAccuracyWeakenRate","kind":"공격","group":"Z_약화","scope":"PVE","desc":"PVE 원거리 명중을 약화(%)시키는 옵션"},
{"id":684,"kr":"PVE 마법 명중 약화","en":"PVEMagicAccuracyWeakenRate","kind":"공격","group":"Z_약화","scope":"PVE","desc":"PVE 마법 명중을 약화(%)시키는 옵션"},
{"id":685,"kr":"PVP 명중 약화","en":"PVPAccuracyWeakenRate","kind":"공격","group":"Z_약화","scope":"PVP","desc":"PVP 명중을 약화(%)시키는 옵션"},
{"id":686,"kr":"PVP 근거리 명중 약화","en":"PVPMeleeAccuracyWeakenRate","kind":"공격","group":"Z_약화","scope":"PVP","desc":"PVP 근거리 명중을 약화(%)시키는 옵션"},
{"id":687,"kr":"PVP 원거리 명중 약화","en":"PVPRangedAccuracyWeakenRate","kind":"공격","group":"Z_약화","scope":"PVP","desc":"PVP 원거리 명중을 약화(%)시키는 옵션"},
{"id":688,"kr":"PVP 마법 명중 약화","en":"PVPMagicAccuracyWeakenRate","kind":"공격","group":"Z_약화","scope":"PVP","desc":"PVP 마법 명중을 약화(%)시키는 옵션"},
{"id":689,"kr":"PVE 치명타 약화","en":"PVECriticalWeakenRate","kind":"공격","group":"Z_약화","scope":"PVE","desc":"PVE 치명타을 약화(%)시키는 옵션"},
{"id":690,"kr":"PVE 근거리 치명타 약화","en":"PVEMeleeCriticalWeakenRate","kind":"공격","group":"Z_약화","scope":"PVE","desc":"PVE 근거리 치명타을 약화(%)시키는 옵션"},
{"id":691,"kr":"PVE 원거리 치명타 약화","en":"PVERangedCriticalWeakenRate","kind":"공격","group":"Z_약화","scope":"PVE","desc":"PVE 원거리 치명타을 약화(%)시키는 옵션"},
{"id":692,"kr":"PVE 마법 치명타 약화","en":"PVEMagicCriticalWeakenRate","kind":"공격","group":"Z_약화","scope":"PVE","desc":"PVE 마법 치명타을 약화(%)시키는 옵션"},
{"id":693,"kr":"PVP 치명타 약화","en":"PVPCriticalWeakenRate","kind":"공격","group":"Z_약화","scope":"PVP","desc":"PVP 치명타을 약화(%)시키는 옵션"},
{"id":694,"kr":"PVP 근거리 치명타 약화","en":"PVPMeleeCriticalWeakenRate","kind":"공격","group":"Z_약화","scope":"PVP","desc":"PVP 근거리 치명타을 약화(%)시키는 옵션"},
{"id":695,"kr":"PVP 원거리 치명타 약화","en":"PVPRangedCriticalWeakenRate","kind":"공격","group":"Z_약화","scope":"PVP","desc":"PVP 원거리 치명타을 약화(%)시키는 옵션"},
{"id":696,"kr":"PVP 마법 치명타 약화","en":"PVPMagicCriticalWeakenRate","kind":"공격","group":"Z_약화","scope":"PVP","desc":"PVP 마법 치명타을 약화(%)시키는 옵션"},
{"id":697,"kr":"PVE 근거리 공격력 약화","en":"PVEMeleeAttackWeakenRate","kind":"공격","group":"Z_약화","scope":"PVE","desc":"PVE 근거리 공격력을 약화(%)시키는 옵션"},
{"id":698,"kr":"PVE 원거리 공격력 약화","en":"PVERangedAttackWeakenRate","kind":"공격","group":"Z_약화","scope":"PVE","desc":"PVE 원거리 공격력을 약화(%)시키는 옵션"},
{"id":699,"kr":"PVE 마법 공격력 약화","en":"PVEMagicAttackWeakenRate","kind":"공격","group":"Z_약화","scope":"PVE","desc":"PVE 마법 공격력을 약화(%)시키는 옵션"},
{"id":700,"kr":"PVP 근거리 공격력 약화","en":"PVPMeleeAttackWeakenRate","kind":"공격","group":"Z_약화","scope":"PVP","desc":"PVP 근거리 공격력을 약화(%)시키는 옵션"},
{"id":701,"kr":"PVP 원거리 공격력 약화","en":"PVPRangedAttackWeakenRate","kind":"공격","group":"Z_약화","scope":"PVP","desc":"PVP 원거리 공격력을 약화(%)시키는 옵션"},
{"id":702,"kr":"PVP 마법 공격력 약화","en":"PVPMagicAttackWeakenRate","kind":"공격","group":"Z_약화","scope":"PVP","desc":"PVP 마법 공격력을 약화(%)시키는 옵션"},
{"id":703,"kr":"PVE 일반 공격 공격력 증폭","en":"PVENormalAttackAmplifyRate","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격 공격력을 증폭(%)시키는 옵션"},
{"id":704,"kr":"PVP 일반 공격 공격력 증폭","en":"PVPNormalAttackAmplifyRate","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격 공격력을 증폭(%)시키는 옵션"},
{"id":705,"kr":"PVE 일반 공격 공격력 약화","en":"PVENormalAttackWeakenRate","kind":"공격","group":"Z_약화","scope":"PVE","desc":"PVE 일반 공격 공격력을 약화(%)시키는 옵션"},
{"id":706,"kr":"PVP 일반 공격 공격력 약화","en":"PVPNormalAttackWeakenRate","kind":"공격","group":"Z_약화","scope":"PVP","desc":"PVP 일반 공격 공격력을 약화(%)시키는 옵션"},
{"id":707,"kr":"월드 보스 몬스터 추가 공격력","en":"WorldBossMonsterExtraAttack","kind":"공격","group":"09_보스/특수 대상","scope":"공통","desc":"월드 보스 몬스터 추가 공격력을 증감시키는 옵션"},
{"id":708,"kr":"거점 보스 몬스터 추가 공격력","en":"StrongPointBossMonsterExtraAttack","kind":"공격","group":"09_보스/특수 대상","scope":"공통","desc":"거점 보스 몬스터 추가 공격력을 증감시키는 옵션"},
{"id":709,"kr":"월드 보스 몬스터 추가 공격력 증폭","en":"WorldBossMonsterExtraAttackAmplifyRate","kind":"공격","group":"09_보스/특수 대상","scope":"공통","desc":"월드 보스 몬스터 추가 공격력을 증폭(%)시키는 옵션"},
{"id":710,"kr":"거점 보스 몬스터 추가 공격력 증폭","en":"StrongPointBossMonsterExtraAttackAmplifyRate","kind":"공격","group":"09_보스/특수 대상","scope":"공통","desc":"거점 보스 몬스터 추가 공격력을 증폭(%)시키는 옵션"},
{"id":711,"kr":"PVE 방어력 관통","en":"PVETargetDefense","kind":"공격","group":"05_PVE 방어 관통","scope":"PVE","desc":"PVE 방어력 관통을 증감시키는 옵션"},
{"id":712,"kr":"PVE 근거리 방어력 관통","en":"PVETargetMeleeDefense","kind":"공격","group":"05_PVE 방어 관통","scope":"PVE","desc":"PVE 근거리 방어력 관통을 증감시키는 옵션"},
{"id":713,"kr":"PVE 원거리 방어력 관통","en":"PVETargetRangedDefense","kind":"공격","group":"05_PVE 방어 관통","scope":"PVE","desc":"PVE 원거리 방어력 관통을 증감시키는 옵션"},
{"id":714,"kr":"PVE 마법 방어력 관통","en":"PVETargetMagicDefense","kind":"공격","group":"05_PVE 방어 관통","scope":"PVE","desc":"PVE 마법 방어력 관통을 증감시키는 옵션"},
{"id":715,"kr":"PVP 방어력 관통","en":"PVPTargetDefense","kind":"공격","group":"05_PVP 방어 관통","scope":"PVP","desc":"PVP 방어력 관통을 증감시키는 옵션"},
{"id":716,"kr":"PVP 근거리 방어력 관통","en":"PVPTargetMeleeDefense","kind":"공격","group":"05_PVP 방어 관통","scope":"PVP","desc":"PVP 근거리 방어력 관통을 증감시키는 옵션"},
{"id":717,"kr":"PVP 원거리 방어력 관통","en":"PVPTargetRangedDefense","kind":"공격","group":"05_PVP 방어 관통","scope":"PVP","desc":"PVP 원거리 방어력 관통을 증감시키는 옵션"},
{"id":718,"kr":"PVP 마법 방어력 관통","en":"PVPTargetMagicDefense","kind":"공격","group":"05_PVP 방어 관통","scope":"PVP","desc":"PVP 마법 방어력 관통을 증감시키는 옵션"},
{"id":719,"kr":"PVE 방어력 관통 증폭","en":"PVETargetDefenseAmplifyRate","kind":"공격","group":"05_PVE 방어 관통","scope":"PVE","desc":"PVE 방어력 관통을 증폭(%)시키는 옵션"},
{"id":720,"kr":"PVE 근거리 방어력 관통 증폭","en":"PVETargetMeleeDefenseAmplifyRate","kind":"공격","group":"05_PVE 방어 관통","scope":"PVE","desc":"PVE 근거리 방어력 관통을 증폭(%)시키는 옵션"},
{"id":721,"kr":"PVE 원거리 방어력 관통 증폭","en":"PVETargetRangedDefenseAmplifyRate","kind":"공격","group":"05_PVE 방어 관통","scope":"PVE","desc":"PVE 원거리 방어력 관통을 증폭(%)시키는 옵션"},
{"id":722,"kr":"PVE 마법 방어력 관통 증폭","en":"PVETargetMagicDefenseAmplifyRate","kind":"공격","group":"05_PVE 방어 관통","scope":"PVE","desc":"PVE 마법 방어력 관통을 증폭(%)시키는 옵션"},
{"id":723,"kr":"PVP 방어력 관통 증폭","en":"PVPTargetDefenseAmplifyRate","kind":"공격","group":"05_PVP 방어 관통","scope":"PVP","desc":"PVP 방어력 관통을 증폭(%)시키는 옵션"},
{"id":724,"kr":"PVP 근거리 방어력 관통 증폭","en":"PVPTargetMeleeDefenseAmplifyRate","kind":"공격","group":"05_PVP 방어 관통","scope":"PVP","desc":"PVP 근거리 방어력 관통을 증폭(%)시키는 옵션"},
{"id":725,"kr":"PVP 원거리 방어력 관통 증폭","en":"PVPTargetRangedDefenseAmplifyRate","kind":"공격","group":"05_PVP 방어 관통","scope":"PVP","desc":"PVP 원거리 방어력 관통을 증폭(%)시키는 옵션"},
{"id":726,"kr":"PVP 마법 방어력 관통 증폭","en":"PVPTargetMagicDefenseAmplifyRate","kind":"공격","group":"05_PVP 방어 관통","scope":"PVP","desc":"PVP 마법 방어력 관통을 증폭(%)시키는 옵션"},
{"id":727,"kr":"PVE 방어력 관통 약화","en":"PVETargetDefenseWeakenRate","kind":"공격","group":"Z_약화","scope":"PVE","desc":"PVE 방어력 관통을 약화(%)시키는 옵션"},
{"id":728,"kr":"PVP 방어력 관통 약화","en":"PVPTargetDefenseWeakenRate","kind":"공격","group":"Z_약화","scope":"PVP","desc":"PVP 방어력 관통을 약화(%)시키는 옵션"},
{"id":729,"kr":"PVE 근거리 스킬 피해 감소 무시","en":"PVEMeleeSkillDamageReductionIgnore","kind":"공격","group":"06_PVE 피해감소 무시","scope":"PVE","desc":"PVE 근거리 스킬 피해 감소 무시를 증감 시키는 옵션"},
{"id":730,"kr":"PVE 원거리 스킬 피해 감소 무시","en":"PVERangedSkillDamageReductionIgnore","kind":"공격","group":"06_PVE 피해감소 무시","scope":"PVE","desc":"PVE 원거리 스킬 피해 감소 무시를 증감 시키는 옵션"},
{"id":731,"kr":"PVE 마법 스킬 피해 감소 무시","en":"PVEMagicSkillDamageReductionIgnore","kind":"공격","group":"06_PVE 피해감소 무시","scope":"PVE","desc":"PVE 마법 스킬 피해 감소 무시를 증감 시키는 옵션"},
{"id":732,"kr":"PVP 근거리 스킬 피해 감소 무시","en":"PVPMeleeSkillDamageReductionIgnore","kind":"공격","group":"06_PVP 피해감소 무시","scope":"PVP","desc":"PVP 근거리 스킬 피해 감소 무시를 증감 시키는 옵션"},
{"id":733,"kr":"PVP 원거리 스킬 피해 감소 무시","en":"PVPRangedSkillDamageReductionIgnore","kind":"공격","group":"06_PVP 피해감소 무시","scope":"PVP","desc":"PVP 원거리 스킬 피해 감소 무시를 증감 시키는 옵션"},
{"id":734,"kr":"PVP 마법 스킬 피해 감소 무시","en":"PVPMagicSkillDamageReductionIgnore","kind":"공격","group":"06_PVP 피해감소 무시","scope":"PVP","desc":"PVP 마법 스킬 피해 감소 무시를 증감 시키는 옵션"},
{"id":735,"kr":"PVE 스킬 피해 감소 무시 증폭","en":"PVESkillDamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_PVE 피해감소 무시","scope":"PVE","desc":"PVE 스킬 피해 감소 무시를 증폭(%)시키는 옵션"},
{"id":736,"kr":"PVE 근거리 스킬 피해 감소 무시 증폭","en":"PVEMeleeSkillDamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_PVE 피해감소 무시","scope":"PVE","desc":"PVE 근거리 스킬 피해 감소 무시를 증폭(%)시키는 옵션"},
{"id":737,"kr":"PVE 원거리 스킬 피해 감소 무시 증폭","en":"PVERangedSkillDamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_PVE 피해감소 무시","scope":"PVE","desc":"PVE 원거리 스킬 피해 감소 무시를 증폭(%)시키는 옵션"},
{"id":738,"kr":"PVE 마법 스킬 피해 감소 무시 증폭","en":"PVEMagicSkillDamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_PVE 피해감소 무시","scope":"PVE","desc":"PVE 마법 스킬 피해 감소 무시를 증폭(%)시키는 옵션"},
{"id":739,"kr":"PVP 스킬 피해 감소 무시 증폭","en":"PVPSkillDamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_PVP 피해감소 무시","scope":"PVP","desc":"PVP 스킬 피해 감소 무시를 증폭(%)시키는 옵션"},
{"id":740,"kr":"PVP 근거리 스킬 피해 감소 무시 증폭","en":"PVPMeleeSkillDamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_PVP 피해감소 무시","scope":"PVP","desc":"PVP 근거리 스킬 피해 감소 무시를 증폭(%)시키는 옵션"},
{"id":741,"kr":"PVP 원거리 스킬 피해 감소 무시 증폭","en":"PVPRangedSkillDamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_PVP 피해감소 무시","scope":"PVP","desc":"PVP 원거리 스킬 피해 감소 무시를 증폭(%)시키는 옵션"},
{"id":742,"kr":"PVP 마법 스킬 피해 감소 무시 증폭","en":"PVPMagicSkillDamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_PVP 피해감소 무시","scope":"PVP","desc":"PVP 마법 스킬 피해 감소 무시를 증폭(%)시키는 옵션"},
{"id":743,"kr":"PVE 스킬 피해 감소 무시 약화","en":"PVESkillDamageReductionIgnoreWeakenRate","kind":"공격","group":"Z_약화","scope":"PVE","desc":"PVE 스킬 피해 감소 무시를 증폭(%)시키는 옵션"},
{"id":744,"kr":"PVP 스킬 피해 감소 무시 약화","en":"PVPSkillDamageReductionIgnoreWeakenRate","kind":"공격","group":"Z_약화","scope":"PVP","desc":"PVP 스킬 피해 감소 무시를 증폭(%)시키는 옵션"},
{"id":745,"kr":"PVE 치명타 피해 감소 무시","en":"PVECriticalDamageReductionIgnore","kind":"공격","group":"06_PVE 피해감소 무시","scope":"PVE","desc":"PVE 치명타 피해 감소 무시를 증감시키는 옵션"},
{"id":746,"kr":"PVE 근거리 치명타 피해 감소 무시","en":"PVEMeleeCriticalDamageReductionIgnore","kind":"공격","group":"06_PVE 피해감소 무시","scope":"PVE","desc":"PVE 근거리 치명타 피해 감소 무시를 증감시키는 옵션"},
{"id":747,"kr":"PVE 원거리 치명타 피해 감소 무시","en":"PVERangedCriticalDamageReductionIgnore","kind":"공격","group":"06_PVE 피해감소 무시","scope":"PVE","desc":"PVE 원거리 치명타 피해 감소 무시를 증감시키는 옵션"},
{"id":748,"kr":"PVE 마법 치명타 피해 감소 무시","en":"PVEMagicCriticalDamageReductionIgnore","kind":"공격","group":"06_PVE 피해감소 무시","scope":"PVE","desc":"PVE 마법 치명타 피해 감소 무시를 증감시키는 옵션"},
{"id":749,"kr":"PVP 치명타 피해 감소 무시","en":"PVPCriticalDamageReductionIgnore","kind":"공격","group":"06_PVP 피해감소 무시","scope":"PVP","desc":"PVP 치명타 피해 감소 무시를 증감시키는 옵션"},
{"id":750,"kr":"PVP 근거리 치명타 피해 감소 무시","en":"PVPMeleeCriticalDamageReductionIgnore","kind":"공격","group":"06_PVP 피해감소 무시","scope":"PVP","desc":"PVP 근거리 치명타 피해 감소 무시를 증감시키는 옵션"},
{"id":751,"kr":"PVP 원거리 치명타 피해 감소 무시","en":"PVPRangedCriticalDamageReductionIgnore","kind":"공격","group":"06_PVP 피해감소 무시","scope":"PVP","desc":"PVP 원거리 치명타 피해 감소 무시를 증감시키는 옵션"},
{"id":752,"kr":"PVP 마법 치명타 피해 감소 무시","en":"PVPMagicCriticalDamageReductionIgnore","kind":"공격","group":"06_PVP 피해감소 무시","scope":"PVP","desc":"PVP 마법 치명타 피해 감소 무시를 증감시키는 옵션"},
{"id":753,"kr":"PVE 치명타 피해 감소 무시 증폭","en":"PVECriticalDamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_PVE 피해감소 무시","scope":"PVE","desc":"PVE 치명타 피해 감소 무시를 증폭(%)시키는 옵션"},
{"id":754,"kr":"PVE 근거리 치명타 피해 감소 무시 증폭","en":"PVEMeleeCriticalDamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_PVE 피해감소 무시","scope":"PVE","desc":"PVE 근거리 치명타 피해 감소 무시를 증폭(%)시키는 옵션"},
{"id":755,"kr":"PVE 원거리 치명타 피해 감소 무시 증폭","en":"PVERangedCriticalDamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_PVE 피해감소 무시","scope":"PVE","desc":"PVE 원거리 치명타 피해 감소 무시를 증폭(%)시키는 옵션"},
{"id":756,"kr":"PVE 마법 치명타 피해 감소 무시 증폭","en":"PVEMagicCriticalDamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_PVE 피해감소 무시","scope":"PVE","desc":"PVE 마법 치명타 피해 감소 무시를 증폭(%)시키는 옵션"},
{"id":757,"kr":"PVP 치명타 피해 감소 무시 증폭","en":"PVPCriticalDamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_PVP 피해감소 무시","scope":"PVP","desc":"PVP 치명타 피해 감소 무시를 증폭(%)시키는 옵션"},
{"id":758,"kr":"PVP 근거리 치명타 피해 감소 무시 증폭","en":"PVPMeleeCriticalDamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_PVP 피해감소 무시","scope":"PVP","desc":"PVP 근거리 치명타 피해 감소 무시를 증폭(%)시키는 옵션"},
{"id":759,"kr":"PVP 원거리 치명타 피해 감소 무시 증폭","en":"PVPRangedCriticalDamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_PVP 피해감소 무시","scope":"PVP","desc":"PVP 원거리 치명타 피해 감소 무시를 증폭(%)시키는 옵션"},
{"id":760,"kr":"PVP 마법 치명타 피해 감소 무시 증폭","en":"PVPMagicCriticalDamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_PVP 피해감소 무시","scope":"PVP","desc":"PVP 마법 치명타 피해 감소 무시를 증폭(%)시키는 옵션"},
{"id":761,"kr":"PVE 치명타 피해 감소 무시 약화","en":"PVECriticalDamageReductionIgnoreWeakenRate","kind":"공격","group":"Z_약화","scope":"PVE","desc":"PVE 치명타 피해 감소 무시를 약화(%)시키는 옵션"},
{"id":762,"kr":"PVP 치명타 피해 감소 무시 약화","en":"PVPCriticalDamageReductionIgnoreWeakenRate","kind":"공격","group":"Z_약화","scope":"PVP","desc":"PVP 치명타 피해 감소 무시를 약화(%)시키는 옵션"},
{"id":763,"kr":"PVP 대미지 리덕션 무시 증폭","en":"PVPDamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_PVP 피해감소 무시","scope":"PVP","desc":"PVP 대미지 리덕션 무시를 증폭(%)시키는 옵션"},
{"id":764,"kr":"PVP 근거리 대미지 리덕션 무시 증폭","en":"PVPMeleeDamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_PVP 피해감소 무시","scope":"PVP","desc":"PVP 근거리 대미지 리덕션 무시를 증폭(%)시키는 옵션"},
{"id":765,"kr":"PVP 원거리 대미지 리덕션 무시 증폭","en":"PVPRangedDamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_PVP 피해감소 무시","scope":"PVP","desc":"PVP 원거리 대미지 리덕션 무시를 증폭(%)시키는 옵션"},
{"id":766,"kr":"PVP 마법 대미지 리덕션 무시 증폭","en":"PVPMagicDamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_PVP 피해감소 무시","scope":"PVP","desc":"PVP 마법 대미지 리덕션 무시를 증폭(%)시키는 옵션"},
{"id":767,"kr":"PVP 대미지 리덕션 무시 약화","en":"PVPDamageReductionIgnoreWeakenRate","kind":"공격","group":"Z_약화","scope":"PVP","desc":"PVP 대미지 리덕션 무시를 약화(%)시키는 옵션"},
{"id":768,"kr":"모든 방어력","en":"AllDefense","kind":"방어","group":"01_방어력","scope":"공통","desc":"모든 방어력을 증감시키는 옵션"},
{"id":769,"kr":"원거리 방어력","en":"RangedDefense","kind":"방어","group":"01_방어력","scope":"공통","desc":"원거리 방어력을 증감시키는 옵션"},
{"id":770,"kr":"원거리 방어력 증폭","en":"RangedDefenseAmplifyRate","kind":"방어","group":"08_방어 증폭","scope":"공통","desc":"원거리 방어력을 증폭(%)시키는 옵션"},
{"id":771,"kr":"원거리 방어력 약화","en":"RangedDefenseWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"원거리 방어력을 약화(%)시키는 옵션"},
{"id":772,"kr":"월드 보스 몬스터 추가 방어력","en":"WorldBossMonsterExtraDefense","kind":"방어","group":"07_보스 방어","scope":"공통","desc":"월드 보스 몬스터 추가 방어력을 증감시키는 옵션"},
{"id":773,"kr":"월드 보스 몬스터 추가 방어력 증폭","en":"WorldBossMonsterExtraDefenseAmplifyRate","kind":"방어","group":"07_보스 방어","scope":"공통","desc":"월드 보스 몬스터 추가 방어력을 증폭(%)시키는 옵션"},
{"id":774,"kr":"거점 보스 몬스터 추가 방어력","en":"StrongPointBossMonsterExtraDefense","kind":"방어","group":"07_보스 방어","scope":"공통","desc":"거점 보스 몬스터 추가 방어력을 증감시키는 옵션"},
{"id":775,"kr":"거점 보스 몬스터 추가 방어력 증폭","en":"StrongPointBossMonsterExtraDefenseAmplifyRate","kind":"방어","group":"07_보스 방어","scope":"공통","desc":"거점 보스 몬스터 추가 방어력을 증폭(%)시키는 옵션"},
{"id":776,"kr":"PVP 대미지 리덕션 증폭","en":"PVPDamageReductionAmplifyRate","kind":"방어","group":"05_PVP 피해 감소","scope":"PVP","desc":"PVP 대미지 리덕션을 증폭(%)시키는 옵션"},
{"id":777,"kr":"PVP 근거리 대미지 리덕션 증폭","en":"PVPMeleeDamageReductionAmplifyRate","kind":"방어","group":"05_PVP 피해 감소","scope":"PVP","desc":"PVP 근거리 대미지 리덕션을 증폭(%)시키는 옵션"},
{"id":778,"kr":"PVP 원거리 대미지 리덕션 증폭","en":"PVPRangedDamageReductionAmplifyRate","kind":"방어","group":"05_PVP 피해 감소","scope":"PVP","desc":"PVP 원거리 대미지 리덕션을 증폭(%)시키는 옵션"},
{"id":779,"kr":"PVP 마법 대미지 리덕션 증폭","en":"PVPMagicDamageReductionAmplifyRate","kind":"방어","group":"05_PVP 피해 감소","scope":"PVP","desc":"PVP 마법 대미지 리덕션을 증폭(%)시키는 옵션"},
{"id":780,"kr":"PVP 대미지 리덕션 약화","en":"PVPDamageReductionWeakenRate","kind":"방어","group":"Z_약화","scope":"PVP","desc":"PVP 대미지 리덕션을 약화(%)시키는 옵션"},
{"id":781,"kr":"PVP 근거리 대미지 리덕션 약화","en":"PVPMeleeDamageReductionWeakenRate","kind":"방어","group":"Z_약화","scope":"PVP","desc":"PVP 근거리 대미지 리덕션을 약화(%)시키는 옵션"},
{"id":782,"kr":"PVP 원거리 대미지 리덕션 약화","en":"PVPRangedDamageReductionWeakenRate","kind":"방어","group":"Z_약화","scope":"PVP","desc":"PVP 원거리 대미지 리덕션을 약화(%)시키는 옵션"},
{"id":783,"kr":"PVP 마법 대미지 리덕션 약화","en":"PVPMagicDamageReductionWeakenRate","kind":"방어","group":"Z_약화","scope":"PVP","desc":"PVP 마법 대미지 리덕션을 약화(%)시키는 옵션"},
{"id":784,"kr":"근거리 스킬 피해 감소","en":"MeleeSkillDamageReduction","kind":"방어","group":"05_피해 감소","scope":"공통","desc":"근거리 스킬 피해 감소를 증감시키는 옵션"},
{"id":785,"kr":"원거리 스킬 피해 감소","en":"RangedSkillDamageReduction","kind":"방어","group":"05_피해 감소","scope":"공통","desc":"원거리 스킬 피해 감소를 증감시키는 옵션"},
{"id":786,"kr":"마법 스킬 피해 감소","en":"MagicSkillDamageReduction","kind":"방어","group":"05_피해 감소","scope":"공통","desc":"마법 스킬 피해 감소를 증감시키는 옵션"},
{"id":787,"kr":"근거리 스킬 피해 감소 증폭","en":"MeleeSkillDamageReductionAmplifyRate","kind":"방어","group":"05_피해 감소","scope":"공통","desc":"근거리 스킬 피해 감소를 증폭(%)시키는 옵션"},
{"id":788,"kr":"원거리 스킬 피해 감소 증폭","en":"RangedSkillDamageReductionAmplifyRate","kind":"방어","group":"05_피해 감소","scope":"공통","desc":"원거리 스킬 피해 감소를 증폭(%)시키는 옵션"},
{"id":789,"kr":"마법 스킬 피해 감소 증폭","en":"MagicSkillDamageReductionAmplifyRate","kind":"방어","group":"05_피해 감소","scope":"공통","desc":"마법 스킬 피해 감소를 증폭(%)시키는 옵션"},
{"id":790,"kr":"근거리 스킬 피해 감소 약화","en":"MeleeSkillDamageReductionWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"근거리 스킬 피해 감소를 약화(%)시키는 옵션"},
{"id":791,"kr":"원거리 스킬 피해 감소 약화","en":"RangedSkillDamageReductionWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"원거리 스킬 피해 감소를 약화(%)시키는 옵션"},
{"id":792,"kr":"마법 스킬 피해 감소 약화","en":"MagicSkillDamageReductionWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"마법 스킬 피해 감소를 약화(%)시키는 옵션"},
{"id":793,"kr":"치명타 피해 감소","en":"CriticalDamageReduction","kind":"방어","group":"03_치명타 저항","scope":"공통","desc":"치명타 피해 감소를 증감시키는 옵션"},
{"id":794,"kr":"근거리 치명타 피해 감소","en":"MeleeCriticalDamageReduction","kind":"방어","group":"03_치명타 저항","scope":"공통","desc":"근거리 치명타 피해 감소를 증감시키는 옵션"},
{"id":795,"kr":"원거리 치명타 피해 감소","en":"RangedCriticalDamageReduction","kind":"방어","group":"03_치명타 저항","scope":"공통","desc":"원거리 치명타 피해 감소를 증감시키는 옵션"},
{"id":796,"kr":"마법 치명타 피해 감소","en":"MagicCriticalDamageReduction","kind":"방어","group":"03_치명타 저항","scope":"공통","desc":"마법 치명타 피해 감소를 증감시키는 옵션"},
{"id":797,"kr":"치명타 피해 감소 증폭","en":"CriticalDamageReductionAmplifyRate","kind":"방어","group":"03_치명타 저항","scope":"공통","desc":"치명타 피해 감소를 증폭(%)시키는 옵션"},
{"id":798,"kr":"근거리 치명타 피해 감소 증폭","en":"MeleeCriticalDamageReductionAmplifyRate","kind":"방어","group":"03_치명타 저항","scope":"공통","desc":"근거리 치명타 피해 감소를 증폭(%)시키는 옵션"},
{"id":799,"kr":"원거리 치명타 피해 감소 증폭","en":"RangedCriticalDamageReductionAmplifyRate","kind":"방어","group":"03_치명타 저항","scope":"공통","desc":"원거리 치명타 피해 감소를 증폭(%)시키는 옵션"},
{"id":800,"kr":"마법 치명타 피해 감소 증폭","en":"MagicCriticalDamageReductionAmplifyRate","kind":"방어","group":"03_치명타 저항","scope":"공통","desc":"마법 치명타 피해 감소를 증폭(%)시키는 옵션"},
{"id":801,"kr":"치명타 피해 감소 약화","en":"CriticalDamageReductionWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"치명타 피해 감소를 약화(%)시키는 옵션"},
{"id":802,"kr":"근거리 치명타 피해 감소 약화","en":"MeleeCriticalDamageReductionWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"근거리 치명타 피해 감소를 약화(%)시키는 옵션"},
{"id":803,"kr":"원거리 치명타 피해 감소 약화","en":"RangedCriticalDamageReductionWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"원거리 치명타 피해 감소를 약화(%)시키는 옵션"},
{"id":804,"kr":"마법 치명타 피해 감소 약화","en":"MagicCriticalDamageReductionWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"마법 치명타 피해 감소를 약화(%)시키는 옵션"},
{"id":805,"kr":"도발 적중 약화","en":"ProvokeHitWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"도발 적중을 약화(%)시키는 옵션"},
{"id":806,"kr":"도발 저항 약화","en":"ProvokeResistWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"도발 저항을 약화(%)시키는 옵션"},
{"id":807,"kr":"순발(AGI)","en":"AGI","kind":"기타","group":"01_기본 스탯","scope":"공통","desc":"순발 스탯을 증감시키는 옵션"},
{"id":808,"kr":"지혜(WIS)","en":"WIS","kind":"기타","group":"01_기본 스탯","scope":"공통","desc":"지혜 스탯을 증감시키는 옵션"},
{"id":809,"kr":"행운(LUK)","en":"LUK","kind":"기타","group":"01_기본 스탯","scope":"공통","desc":"행운 스탯을 증감시키는 옵션"},
{"id":810,"kr":"순발(AGI) 증폭","en":"AGIAmplifyRate","kind":"기타","group":"02_기본 스탯 증폭","scope":"공통","desc":"순발 스탯을 추가로 증폭(%)시키는 옵션"},
{"id":811,"kr":"지혜(WIS) 증폭","en":"WISAmplifyRate","kind":"기타","group":"02_기본 스탯 증폭","scope":"공통","desc":"지혜 스탯을 추가로 증폭(%)시키는 옵션"},
{"id":812,"kr":"행운(LUK) 증폭","en":"LUKAmplifyRate","kind":"기타","group":"02_기본 스탯 증폭","scope":"공통","desc":"행운 스탯을 추가로 증폭(%)시키는 옵션"},
{"id":813,"kr":"순발(AGI) 약화","en":"AGIWeakenRate","kind":"기타","group":"Z_약화","scope":"공통","desc":"순발 스탯을 추가로 약화(%)시키는 옵션"},
{"id":814,"kr":"지혜(WIS) 약화","en":"WISWeakenRate","kind":"기타","group":"Z_약화","scope":"공통","desc":"지혜 스탯을 추가로 약화(%)시키는 옵션"},
{"id":815,"kr":"행운(LUK) 약화","en":"LUKWeakenRate","kind":"기타","group":"Z_약화","scope":"공통","desc":"행운 스탯을 추가로 약화(%)시키는 옵션"},
{"id":816,"kr":"엑시스 스킬 숙련도 획득량","en":"AxisSkillEXPBonus","kind":"특수","group":"01_경험치/성장","scope":"공통","desc":"엑시스 스킬 숙련도 획득량을 증감시키는 옵션"},
{"id":817,"kr":"퀘스트 클리어 경험치 획득량","en":"QuestClearEXPBonus","kind":"특수","group":"01_경험치/성장","scope":"공통","desc":"퀘스트 클리어 경험치 획득량을 증감시키는 옵션"},
{"id":818,"kr":"컨텐츠 클리어 경험치 획득량","en":"ContentClearEXPBonus","kind":"특수","group":"01_경험치/성장","scope":"공통","desc":"컨텐츠 클리어 경험치 획득량을 증감시키는 옵션"},
{"id":819,"kr":"채집 쿨타임 감소","en":"CollectCoolTimeRate","kind":"특수","group":"03_채집/생활","scope":"공통","desc":"채집 쿨타임 감소 증감 옵션"},
{"id":820,"kr":"희귀 자원 획득 확률","en":"RarityResourceBonus","kind":"특수","group":"03_채집/생활","scope":"공통","desc":"채집시 희귀 자원 획득 확률 증감 옵션"},
{"id":821,"kr":"탑승시 이동속도","en":"RideMoveSpeed","kind":"기타","group":"05_속도","scope":"공통","desc":"탈것 탑승시 이동속도 증감 옵션"}
];

// ─── 스탯 계산 함수 ────────────────────────────────────────────────────────────
// bonuses  : 레벨 능력치(getLvStatBonuses) + 외부 보너스(장비·버프 등) 합산 객체
// baseStats: 기본 스탯 7종 { STR, DEX, INT, AGI, CON, WIS, LUK }
// ─ 3단계 계산 흐름 ─
//   1단계 기본 합산: baseStats 치환값(computeSubstitutedBonuses) + bonuses 합산
//   2단계 증폭 적용: × (1 + AmplifyRate / 10000)
//   3단계 약화 적용: × (1 - WeakenRate / 10000)  ← 현재 게임에서 미구현(값 0 유지)
function computeStats(bonuses, baseStats) {
    bonuses   = bonuses   || {};
    baseStats = baseStats || {};

    // 1단계: 기본 스탯 실효값 계산 (설정값 + 레벨 보너스 + AllStat 보너스)
    // 치환 공식은 실효 기본 스탯 기준으로 계산해야 레벨 능력치·AllStat이 2차 스탯에 반영됨
    // 예: STR 설정=10, 레벨 보너스=490 → 실효 STR=500 → PVEMeleeMinAttack 치환도 500 기준
    const allStatBonus = bonuses['AllStat'] || 0;
    const totalBaseStats = {};
    for (const stat of ['STR','DEX','INT','AGI','CON','WIS','LUK']) {
        totalBaseStats[stat] = (baseStats[stat] || 0) + (bonuses[stat] || 0) + allStatBonus;
    }
    const subBon = computeSubstitutedBonuses(totalBaseStats);
    // 통합 조회: 레벨/외부 보너스 + 치환 보너스
    function B(en) { return (bonuses[en] || 0) + (subBon[en] || 0); }

    // ── 기본 스탯 7종 (baseStats 설정값 + 레벨 보너스 + 2단계 증폭) ─────────
    const STR = Math.floor(((baseStats.STR || 0) + B('STR') + B('AllStat'))
        * (1 + B('STRAmplifyRate') / 10000 + B('AllStatAmplifyRate') / 10000));
    const DEX = Math.floor(((baseStats.DEX || 0) + B('DEX') + B('AllStat'))
        * (1 + B('DEXAmplifyRate') / 10000 + B('AllStatAmplifyRate') / 10000));
    const INT = Math.floor(((baseStats.INT || 0) + B('INT') + B('AllStat'))
        * (1 + B('INTAmplifyRate') / 10000 + B('AllStatAmplifyRate') / 10000));
    const AGI = Math.floor(((baseStats.AGI || 0) + B('AGI') + B('AllStat'))
        * (1 + B('AGIAmplifyRate') / 10000 + B('AllStatAmplifyRate') / 10000));
    const CON = Math.floor(((baseStats.CON || 0) + B('CON') + B('AllStat'))
        * (1 + B('CONAmplifyRate') / 10000 + B('AllStatAmplifyRate') / 10000));
    const WIS = Math.floor(((baseStats.WIS || 0) + B('WIS') + B('AllStat'))
        * (1 + B('WISAmplifyRate') / 10000 + B('AllStatAmplifyRate') / 10000));
    const LUK = Math.floor(((baseStats.LUK || 0) + B('LUK') + B('AllStat'))
        * (1 + B('LUKAmplifyRate') / 10000 + B('AllStatAmplifyRate') / 10000));

    // ── HP / MP (증폭 반영) ─────────────────────────────────────────────────
    const MaxHP = Math.floor(B('MaxHealthPoint') * (1 + B('MaxHealthPointAmplifyRate') / 10000));
    const MaxMP = Math.floor(B('MaxManaPoint')   * (1 + B('MaxManaPointAmplifyRate')   / 10000));

    // ── 공격력 (증폭 반영) ──────────────────────────────────────────────────
    // 일반 키(MeleeMinAttack) + PVE 전용 키(PVEMeleeMinAttack, STR 치환 대상)를 합산 후 증폭
    // PVEMeleeMinAttack 등은 BASE_STAT_SUBSTITUTION에서 기본 스탯이 치환하는 실제 공격력 키
    const MeleeMinAttack  = Math.floor((B('MeleeMinAttack')  + B('PVEMeleeMinAttack'))  * (1 + B('MeleeAttackPct')  / 10000));
    const MeleeMaxAttack  = Math.floor((B('MeleeMaxAttack')  + B('PVEMeleeMaxAttack'))  * (1 + B('MeleeAttackPct')  / 10000));
    const RangedMinAttack = Math.floor((B('RangedMinAttack') + B('PVERangedMinAttack')) * (1 + B('RangedAttackPct') / 10000));
    const RangedMaxAttack = Math.floor((B('RangedMaxAttack') + B('PVERangedMaxAttack')) * (1 + B('RangedAttackPct') / 10000));
    const MagicMinAttack  = Math.floor((B('MagicMinAttack')  + B('PVEMagicMinAttack'))  * (1 + B('MagicAttackPct')  / 10000));
    const MagicMaxAttack  = Math.floor((B('MagicMaxAttack')  + B('PVEMagicMaxAttack'))  * (1 + B('MagicAttackPct')  / 10000));

    // ── 방어력 (증폭 반영) ──────────────────────────────────────────────────
    const MeleeDefense  = Math.floor(B('PhysicalDefense') * (1 + B('PhysicalDefenseAmplifyRate') / 10000));
    const RangedDefense = Math.floor(B('RangedDefense')   * (1 + B('RangedDefenseAmplifyRate')   / 10000));
    const MagicDefense  = Math.floor(B('MagicDefense')    * (1 + B('MagicDefenseAmplifyRate')    / 10000));

    // ── 명중 / 회피 ─────────────────────────────────────────────────────────
    const Accuracy       = Math.floor(B('Accuracy'));
    const MeleeAccuracy  = Math.floor(B('PVEMeleeAccuracy'));
    const RangedAccuracy = Math.floor(B('PVERangedAccuracy'));
    const MagicAccuracy  = Math.floor(B('PVEMagicAccuracy'));
    const Evasion        = Math.floor(B('Evasion'));
    const MeleeEvasion   = Math.floor(B('MeleeEvasion'));
    const RangedEvasion  = Math.floor(B('RangedEvasion'));
    const MagicEvasion   = Math.floor(B('MagicEvasion'));

    // ── 치명타율 (원시값 / 100 → 자연 퍼센트 0~100, 전투 계산용) ────────────
    // PVECritical(공통 PVE 치명타) + 공격 유형별 치명타를 합산
    // 예: 근거리 전투 → PVECritical(공통) + PVEMeleeCritical(STR 치환 대상) 합산
    const CriticalRate   = Math.min(100, B('PVECritical') / 100);
    const MeleeCritRate  = Math.min(100, (B('PVECritical') + B('PVEMeleeCritical'))  / 100);
    const RangedCritRate = Math.min(100, (B('PVECritical') + B('PVERangedCritical')) / 100);
    const MagicCritRate  = Math.min(100, (B('PVECritical') + B('PVEMagicCritical'))  / 100);

    // ── 치명타 추가 공격력 (절대값 — 치명타 발생 시 MaxAtk에 직접 더해지는 고정 수치) ──
    // PVEAtCriticalAttack(공통) + 공격 유형별 AtCritical 합산, 퍼센트 변환 없음
    const CritMeleeAtk  = B('PVEAtCriticalAttack') + B('PVEAtCriticalMeleeAttack');
    const CritRangedAtk = B('PVEAtCriticalAttack') + B('PVEAtCriticalRangedAttack');
    const CritMagicAtk  = B('PVEAtCriticalAttack') + B('PVEAtCriticalMagicAttack');
    const CriticalResist   = B('CriticalResist');
    const MeleeCritResist  = B('MeleeCriticalResist');
    const RangedCritResist = B('RangedCriticalResist');
    const MagicCritResist  = B('MagicCriticalResist');

    // ── 속도 / 회복 / 기타 ──────────────────────────────────────────────────
    // 상한값 하드코딩 제거 — 기획자가 LV_STAT_CONFIG로 원하는 값을 직접 설정
    const MoveSpeed   = Math.floor(B('MoveSpeed'));
    const AttackSpeed = Math.floor(B('AttackSpeed'));
    const HPRegen        = Math.floor(B('HealthRegenPoint'));
    const MPRegen        = Math.floor(B('ManaRegenPoint'));
    const PotionRecovery = Math.floor(B('PotionRecoveryRate') / 100);
    const SkillDamageReduction = B('SkillDamageReduction');
    const EXPBonus       = B('EXPBonus');
    const ItemDropBonus  = B('ItemDropBonus');
    const CoolTimeRate   = B('CoolTimeRate');
    const BossExtraAtk   = B('BossMonsterExtraAttack');
    const EliteExtraAtk  = B('EliteMonsterExtraAttack');

    // ── 결과 객체 구성 ────────────────────────────────────────────────────────
    // 1단계: BASE_STAT_SUBSTITUTION 치환 대상 스탯 전체를 원시값으로 추가
    // renderKeyCards 등에서 currentStats[e.key] 조회 시 정확한 값을 반환하기 위함
    const result = {};
    if (typeof BASE_STAT_SUBSTITUTION !== 'undefined') {
        for (const entries of Object.values(BASE_STAT_SUBSTITUTION)) {
            for (const e of entries) {
                if (!(e.key in result)) result[e.key] = B(e.key);
            }
        }
    }

    // 2단계: 명시적 계산값 추가 — 증폭/변환이 적용된 값으로 덮어씀
    Object.assign(result, {
        AllStat: B('AllStat'),
        STR, DEX, INT, AGI, CON, WIS, LUK,
        MaxHP, MaxMP, MoveSpeed, AttackSpeed, HPRegen, MPRegen, PotionRecovery,
        MeleeMinAttack, MeleeMaxAttack, RangedMinAttack, RangedMaxAttack,
        MagicMinAttack, MagicMaxAttack,
        Accuracy, MeleeAccuracy, RangedAccuracy, MagicAccuracy,
        CriticalRate, MeleeCritRate, RangedCritRate, MagicCritRate,
        CritMeleeAtk, CritRangedAtk, CritMagicAtk,
        CriticalResist, MeleeCritResist, RangedCritResist, MagicCritResist,
        MeleeDefense, RangedDefense, MagicDefense,
        Evasion, MeleeEvasion, RangedEvasion, MagicEvasion,
        SkillDamageReduction, EXPBonus, ItemDropBonus, CoolTimeRate,
        BossExtraAtk, EliteExtraAtk,
        // 저항 계열
        StunResist:      B('StunResist'),
        ParalysisResist: B('ParalysisResist'),
        SilenceResist:   B('SilenceResist'),
        HoldResist:      B('HoldResist'),
        SlowResist:      B('SlowResist'),
        ProvokeResist:   B('ProvokeResist'),
        // 치명타 피해 감소
        MeleeCriticalDamageReduction:  B('MeleeCriticalDamageReduction'),
        RangedCriticalDamageReduction: B('RangedCriticalDamageReduction'),
        MagicCriticalDamageReduction:  B('MagicCriticalDamageReduction'),
        // 방어력 관통
        PVETargetMeleeDefense:  B('PVETargetMeleeDefense'),
        PVETargetRangedDefense: B('PVETargetRangedDefense'),
        PVETargetMagicDefense:  B('PVETargetMagicDefense'),
        // 보스 추가 방어/공격
        EliteMonsterExtraDefense:             B('EliteMonsterExtraDefense'),
        BossMonsterExtraDefense:              B('BossMonsterExtraDefense'),
        WorldBossMonsterExtraDefense:         B('WorldBossMonsterExtraDefense'),
        StrongPointBossMonsterExtraDefense:   B('StrongPointBossMonsterExtraDefense'),
        // 스킬 피해 감소
        MeleeSkillDamageReduction:  B('MeleeSkillDamageReduction'),
        RangedSkillDamageReduction: B('RangedSkillDamageReduction'),
        MagicSkillDamageReduction:  B('MagicSkillDamageReduction'),
        // 스킬 공격력
        MeleeSkillMinAttack:  B('MeleeSkillMinAttack'),
        MeleeSkillMaxAttack:  B('MeleeSkillMaxAttack'),
        RangedSkillMinAttack: B('RangedSkillMinAttack'),
        RangedSkillMaxAttack: B('RangedSkillMaxAttack'),
        MagicSkillMinAttack:  B('MagicSkillMinAttack'),
        MagicSkillMaxAttack:  B('MagicSkillMaxAttack'),
        // 월드/거점 보스 추가 공격력
        WorldBossMonsterExtraAttack:       B('WorldBossMonsterExtraAttack'),
        StrongPointBossMonsterExtraAttack: B('StrongPointBossMonsterExtraAttack'),
        // ── STAT_LIST 별칭 (character_info.html 스탯 목록 표시용) ──
        // 증폭 적용값 또는 변환값으로 덮어씀
        MaxHealthPoint:       MaxHP,
        MaxManaPoint:         MaxMP,
        HealthRegenPoint:     HPRegen,
        ManaRegenPoint:       MPRegen,
        PotionRecoveryRate:   PotionRecovery,
        PhysicalDefense:      MeleeDefense,
        PVEAtCriticalAttack:  B('PVEAtCriticalAttack'),
        MeleeCriticalResist:  MeleeCritResist,
        RangedCriticalResist: RangedCritResist,
        MagicCriticalResist:  MagicCritResist,
        PVEMeleeAccuracy:     MeleeAccuracy,
        PVERangedAccuracy:    RangedAccuracy,
        PVEMagicAccuracy:     MagicAccuracy,
        BossMonsterExtraAttack:  BossExtraAtk,
        EliteMonsterExtraAttack: EliteExtraAtk,
    });

    return result;
}

// ─── 기본 스탯 치환 테이블 ────────────────────────────────────────────────────
// [베르시온] 010_스탯_치환값.md 기준
// 치환값 = Math.floor(baseStatValue / c1 * c2)
// label: [베르시온] 010_스탯_치환값.md 의 "치환 스탯" 열 한글명 (파일 갱신 시 함께 수정)
const BASE_STAT_SUBSTITUTION = {
    STR: [
        { key:'PVEMeleeMinAttack',                 c1:1,  c2:1,  label:'PVE 최소 근거리 공격력'       },
        { key:'PVEMeleeMaxAttack',                 c1:1,  c2:3,  label:'PVE 최대 근거리 공격력'       },
        { key:'PVPMeleeMinAttack',                 c1:4,  c2:1,  label:'PVP 최소 근거리 공격력'       },
        { key:'PVPMeleeMaxAttack',                 c1:2,  c2:1,  label:'PVP 최대 근거리 공격력'       },
        { key:'PVEMeleeAccuracy',                  c1:2,  c2:3,  label:'PVE 근거리 명중'              },
        { key:'PVPMeleeAccuracy',                  c1:1,  c2:1,  label:'PVP 근거리 명중'              },
        { key:'PVEMeleeCritical',                  c1:2,  c2:3,  label:'PVE 근거리 치명타'            },
        { key:'PVPMeleeCritical',                  c1:1,  c2:1,  label:'PVP 근거리 치명타'            },
        { key:'PVEAtCriticalMeleeAttack',          c1:2,  c2:3,  label:'PVE 근거리 치명타 공격력'     },
        { key:'PVPAtCriticalMeleeAttack',          c1:4,  c2:1,  label:'PVP 근거리 치명타 공격력'     },
        { key:'PVETargetMeleeDefense',             c1:1,  c2:5,  label:'PVE 근거리 방어력 관통'       },
        { key:'PVPTargetMeleeDefense',             c1:1,  c2:3,  label:'PVP 근거리 방어력 관통'       },
        { key:'PVENormalMeleeMinAttack',           c1:5,  c2:1,  label:'PVE 일반 공격 최소 공격력'    },
        { key:'PVENormalMeleeMaxAttack',           c1:5,  c2:3,  label:'PVE 일반 공격 최대 공격력'    },
        { key:'PVPNormalMeleeMinAttack',           c1:15, c2:1,  label:'PVP 일반 공격 최소 공격력'    },
        { key:'PVPNormalMeleeMaxAttack',           c1:15, c2:2,  label:'PVP 일반 공격 최대 공격력'    },
        { key:'PVEMeleeSkillMinAttack',            c1:5,  c2:1,  label:'PVE 스킬 최소 공격력'         },
        { key:'PVEMeleeSkillMaxAttack',            c1:5,  c2:3,  label:'PVE 스킬 최대 공격력'         },
        { key:'PVPMeleeSkillMinAttack',            c1:15, c2:1,  label:'PVP 스킬 최소 공격력'         },
        { key:'PVPMeleeSkillMaxAttack',            c1:15, c2:2,  label:'PVP 스킬 최대 공격력'         },
        { key:'EliteMonsterExtraAttack',           c1:2,  c2:1,  label:'정예 몬스터 추가 공격력'       },
        { key:'BossMonsterExtraAttack',            c1:2,  c2:1,  label:'보스 몬스터 추가 공격력'       },
        { key:'WorldBossMonsterExtraAttack',       c1:2,  c2:1,  label:'월드 보스 몬스터 추가 공격력'  },
        { key:'StrongPointBossMonsterExtraAttack', c1:2,  c2:1,  label:'거점 보스 몬스터 추가 공격력'  },
    ],
    DEX: [
        { key:'PVERangedMinAttack',                c1:1,  c2:1,  label:'PVE 최소 원거리 공격력'       },
        { key:'PVERangedMaxAttack',                c1:1,  c2:3,  label:'PVE 최대 원거리 공격력'       },
        { key:'PVPRangedMinAttack',                c1:4,  c2:1,  label:'PVP 최소 원거리 공격력'       },
        { key:'PVPRangedMaxAttack',                c1:2,  c2:1,  label:'PVP 최대 원거리 공격력'       },
        { key:'PVERangedAccuracy',                 c1:2,  c2:3,  label:'PVE 원거리 명중'              },
        { key:'PVPRangedAccuracy',                 c1:1,  c2:1,  label:'PVP 원거리 명중'              },
        { key:'PVERangedCritical',                 c1:2,  c2:3,  label:'PVE 원거리 치명타'            },
        { key:'PVPRangedCritical',                 c1:1,  c2:1,  label:'PVP 원거리 치명타'            },
        { key:'PVEAtCriticalRangedAttack',         c1:2,  c2:3,  label:'PVE 원거리 치명타 공격력'     },
        { key:'PVPAtCriticalRangedAttack',         c1:4,  c2:1,  label:'PVP 원거리 치명타 공격력'     },
        { key:'PVETargetRangedDefense',            c1:1,  c2:5,  label:'PVE 원거리 방어력 관통'       },
        { key:'PVPTargetRangedDefense',            c1:1,  c2:3,  label:'PVP 원거리 방어력 관통'       },
        { key:'PVENormalRangedMinAttack',          c1:5,  c2:1,  label:'PVE 일반 공격 최소 공격력'    },
        { key:'PVENormalRangedMaxAttack',          c1:5,  c2:3,  label:'PVE 일반 공격 최대 공격력'    },
        { key:'PVPNormalRangedMinAttack',          c1:15, c2:1,  label:'PVP 일반 공격 최소 공격력'    },
        { key:'PVPNormalRangedMaxAttack',          c1:15, c2:2,  label:'PVP 일반 공격 최대 공격력'    },
        { key:'PVERangedSkillMinAttack',           c1:5,  c2:1,  label:'PVE 스킬 최소 공격력'         },
        { key:'PVERangedSkillMaxAttack',           c1:5,  c2:3,  label:'PVE 스킬 최대 공격력'         },
        { key:'PVPRangedSkillMinAttack',           c1:15, c2:1,  label:'PVP 스킬 최소 공격력'         },
        { key:'PVPRangedSkillMaxAttack',           c1:15, c2:2,  label:'PVP 스킬 최대 공격력'         },
        { key:'EliteMonsterExtraAttack',           c1:2,  c2:1,  label:'정예 몬스터 추가 공격력'       },
        { key:'BossMonsterExtraAttack',            c1:2,  c2:1,  label:'보스 몬스터 추가 공격력'       },
        { key:'WorldBossMonsterExtraAttack',       c1:2,  c2:1,  label:'월드 보스 몬스터 추가 공격력'  },
        { key:'StrongPointBossMonsterExtraAttack', c1:2,  c2:1,  label:'거점 보스 몬스터 추가 공격력'  },
    ],
    INT: [
        { key:'PVEMagicMinAttack',                 c1:1,  c2:1,  label:'PVE 최소 마법 공격력'         },
        { key:'PVEMagicMaxAttack',                 c1:1,  c2:3,  label:'PVE 최대 마법 공격력'         },
        { key:'PVPMagicMinAttack',                 c1:4,  c2:1,  label:'PVP 최소 마법 공격력'         },
        { key:'PVPMagicMaxAttack',                 c1:2,  c2:1,  label:'PVP 최대 마법 공격력'         },
        { key:'PVEMagicAccuracy',                  c1:2,  c2:3,  label:'PVE 마법 명중'                },
        { key:'PVPMagicAccuracy',                  c1:1,  c2:1,  label:'PVP 마법 명중'                },
        { key:'PVEMagicCritical',                  c1:2,  c2:3,  label:'PVE 마법 치명타'              },
        { key:'PVPMagicCritical',                  c1:1,  c2:1,  label:'PVP 마법 치명타'              },
        { key:'PVEAtCriticalMagicAttack',          c1:2,  c2:3,  label:'PVE 마법 치명타 공격력'       },
        { key:'PVPAtCriticalMagicAttack',          c1:4,  c2:1,  label:'PVP 마법 치명타 공격력'       },
        { key:'PVETargetMagicDefense',             c1:1,  c2:5,  label:'PVE 마법 방어력 관통'         },
        { key:'PVPTargetMagicDefense',             c1:1,  c2:3,  label:'PVP 마법 방어력 관통'         },
        { key:'PVENormalMagicMinAttack',           c1:5,  c2:1,  label:'PVE 일반 공격 최소 공격력'    },
        { key:'PVENormalMagicMaxAttack',           c1:5,  c2:3,  label:'PVE 일반 공격 최대 공격력'    },
        { key:'PVPNormalMagicMinAttack',           c1:15, c2:1,  label:'PVP 일반 공격 최소 공격력'    },
        { key:'PVPNormalMagicMaxAttack',           c1:15, c2:2,  label:'PVP 일반 공격 최대 공격력'    },
        { key:'PVEMagicSkillMinAttack',            c1:5,  c2:1,  label:'PVE 스킬 최소 공격력'         },
        { key:'PVEMagicSkillMaxAttack',            c1:5,  c2:3,  label:'PVE 스킬 최대 공격력'         },
        { key:'PVPMagicSkillMinAttack',            c1:15, c2:1,  label:'PVP 스킬 최소 공격력'         },
        { key:'PVPMagicSkillMaxAttack',            c1:15, c2:2,  label:'PVP 스킬 최대 공격력'         },
        { key:'EliteMonsterExtraAttack',           c1:2,  c2:1,  label:'정예 몬스터 추가 공격력'       },
        { key:'BossMonsterExtraAttack',            c1:2,  c2:1,  label:'보스 몬스터 추가 공격력'       },
        { key:'WorldBossMonsterExtraAttack',       c1:2,  c2:1,  label:'월드 보스 몬스터 추가 공격력'  },
        { key:'StrongPointBossMonsterExtraAttack', c1:2,  c2:1,  label:'거점 보스 몬스터 추가 공격력'  },
    ],
    AGI: [
        { key:'AttackSpeedAmplifyRate',              c1:2, c2:3,  label:'공격속도 증폭'                },
        { key:'PVENormalRangedExtraCritical',        c1:2, c2:3,  label:'PVE 일반 공격 추가 치명타'   },
        { key:'PVPNormalRangedExtraCritical',        c1:4, c2:3,  label:'PVP 일반 공격 추가 치명타'   },
        { key:'RangedDefense',                       c1:1, c2:10, label:'원거리 방어력'                },
        { key:'RangedEvasion',                       c1:1, c2:2,  label:'원거리 회피'                  },
        { key:'RangedCriticalResist',                c1:2, c2:3,  label:'원거리 치명타 저항'           },
        { key:'RangedCriticalDamageReduction',       c1:2, c2:3,  label:'원거리 치명타 피해 감소'      },
        { key:'RangedSkillDamageReduction',          c1:2, c2:3,  label:'원거리 스킬 피해 감소'        },
        { key:'HoldResist',                          c1:2, c2:3,  label:'홀드 저항'                    },
        { key:'SlowResist',                          c1:2, c2:3,  label:'슬로우 저항'                  },
        { key:'EliteMonsterExtraDefense',            c1:1, c2:2,  label:'정예 몬스터 추가 방어력'       },
        { key:'BossMonsterExtraDefense',             c1:1, c2:2,  label:'보스 몬스터 추가 방어력'       },
        { key:'WorldBossMonsterExtraDefense',        c1:1, c2:2,  label:'월드 보스 몬스터 추가 방어력'  },
        { key:'StrongPointBossMonsterExtraDefense',  c1:1, c2:2,  label:'거점 보스 몬스터 추가 방어력'  },
    ],
    CON: [
        { key:'MaxHealthPointAmplifyRate',           c1:2, c2:3,  label:'최대 HP 증폭'                 },
        { key:'CriticalDamageReductionAmplifyRate',  c1:5, c2:4,  label:'치명타 피해 감소 증폭'        },
        { key:'SkillDamageReductionAmplifyRate',     c1:5, c2:4,  label:'스킬 피해 감소 증폭'          },
        { key:'PhysicalDefense',                     c1:1, c2:10, label:'근거리 방어력'                 },
        { key:'MeleeEvasion',                        c1:1, c2:2,  label:'근거리 회피'                   },
        { key:'MeleeCriticalResist',                 c1:2, c2:3,  label:'근거리 치명타 저항'            },
        { key:'MeleeCriticalDamageReduction',        c1:2, c2:3,  label:'근거리 치명타 피해 감소'       },
        { key:'MeleeSkillDamageReduction',           c1:2, c2:3,  label:'근거리 스킬 피해 감소'         },
        { key:'StunResist',                          c1:2, c2:3,  label:'스턴 저항'                     },
        { key:'ParalysisResist',                     c1:2, c2:3,  label:'마비 저항'                     },
        { key:'EliteMonsterExtraDefense',            c1:1, c2:2,  label:'정예 몬스터 추가 방어력'        },
        { key:'BossMonsterExtraDefense',             c1:1, c2:2,  label:'보스 몬스터 추가 방어력'        },
        { key:'WorldBossMonsterExtraDefense',        c1:1, c2:2,  label:'월드 보스 몬스터 추가 방어력'   },
        { key:'StrongPointBossMonsterExtraDefense',  c1:1, c2:2,  label:'거점 보스 몬스터 추가 방어력'   },
    ],
    WIS: [
        { key:'MaxManaPointAmplifyRate',             c1:2, c2:3,  label:'최대 MP 증폭'                  },
        { key:'PVESkillExtraCritical',               c1:2, c2:3,  label:'PVE 스킬 추가 치명타'          },
        { key:'PVESkillExtraCritical',               c1:4, c2:3,  label:'PVE 스킬 추가 치명타'          },
        { key:'MagicDefense',                        c1:1, c2:10, label:'마법 방어력'                    },
        { key:'MagicEvasion',                        c1:1, c2:2,  label:'마법 회피'                      },
        { key:'MagicCriticalResist',                 c1:2, c2:3,  label:'마법 치명타 저항'               },
        { key:'MagicCriticalDamageReduction',        c1:2, c2:3,  label:'마법 치명타 피해 감소'          },
        { key:'MagicSkillDamageReduction',           c1:2, c2:3,  label:'마법 스킬 피해 감소'            },
        { key:'SilenceResist',                       c1:2, c2:3,  label:'침묵 저항'                      },
        { key:'ProvokeResist',                       c1:2, c2:3,  label:'도발 저항'                      },
        { key:'EliteMonsterExtraDefense',            c1:1, c2:2,  label:'정예 몬스터 추가 방어력'         },
        { key:'BossMonsterExtraDefense',             c1:1, c2:2,  label:'보스 몬스터 추가 방어력'         },
        { key:'WorldBossMonsterExtraDefense',        c1:1, c2:2,  label:'월드 보스 몬스터 추가 방어력'    },
        { key:'StrongPointBossMonsterExtraDefense',  c1:1, c2:2,  label:'거점 보스 몬스터 추가 방어력'    },
    ],
    LUK: [
        { key:'ItemDropBonus',                       c1:2, c2:3,  label:'아이템 드랍률'                  },
        { key:'AxisSkillEXPBonus',                   c1:2, c2:3,  label:'엑시스 스킬 숙련도 획득량'      },
        { key:'WeaponEXPBonus',                      c1:2, c2:3,  label:'무기 숙련도 획득량'             },
        { key:'PVECritical',                         c1:2, c2:3,  label:'PVE 치명타'                    },
        { key:'PVPCritical',                         c1:1, c2:1,  label:'PVP 치명타'                    },
        { key:'StunResist',                          c1:2, c2:3,  label:'스턴 저항'                      },
        { key:'ParalysisResist',                     c1:2, c2:3,  label:'마비 저항'                      },
        { key:'SilenceResist',                       c1:2, c2:3,  label:'침묵 저항'                      },
        { key:'HoldResist',                          c1:2, c2:3,  label:'홀드 저항'                      },
        { key:'SlowResist',                          c1:2, c2:3,  label:'슬로우 저항'                    },
        { key:'ProvokeResist',                       c1:2, c2:3,  label:'도발 저항'                      },
        { key:'EliteMonsterExtraDefense',            c1:1, c2:2,  label:'정예 몬스터 추가 방어력'         },
        { key:'BossMonsterExtraDefense',             c1:1, c2:2,  label:'보스 몬스터 추가 방어력'         },
        { key:'WorldBossMonsterExtraDefense',        c1:1, c2:2,  label:'월드 보스 몬스터 추가 방어력'    },
        { key:'StrongPointBossMonsterExtraDefense',  c1:1, c2:2,  label:'거점 보스 몬스터 추가 방어력'    },
    ],
};

// BASE_STAT_SUBSTITUTION 키 중 STAT_LIST에 없는 항목의 한글명 보조 맵
// (001_스탯_종류_분류 기준 공식 한글명, 비공식 키는 010_스탯_치환값 주석 기준)
const SUBST_KR_MAP = {
    // PVE 기본 공격력 (근거리/원거리/마법)
    PVEMeleeMinAttack:         'PVE 최소 근거리 공격력',
    PVEMeleeMaxAttack:         'PVE 최대 근거리 공격력',
    PVERangedMinAttack:        'PVE 최소 원거리 공격력',
    PVERangedMaxAttack:        'PVE 최대 원거리 공격력',
    PVEMagicMinAttack:         'PVE 최소 마법 공격력',
    PVEMagicMaxAttack:         'PVE 최대 마법 공격력',
    // PVE 일반 공격 최소/최대 (근거리/원거리/마법)
    PVENormalMeleeMinAttack:   'PVE 일반 공격 최소 근거리 공격력',
    PVENormalMeleeMaxAttack:   'PVE 일반 공격 최대 근거리 공격력',
    PVENormalRangedMinAttack:  'PVE 일반 공격 최소 원거리 공격력',
    PVENormalRangedMaxAttack:  'PVE 일반 공격 최대 원거리 공격력',
    PVENormalMagicMinAttack:   'PVE 일반 공격 최소 마법 공격력',
    PVENormalMagicMaxAttack:   'PVE 일반 공격 최대 마법 공격력',
    // PVP 일반 공격 최소/최대 (근거리/원거리/마법)
    PVPNormalMeleeMinAttack:   'PVP 일반 공격 최소 근거리 공격력',
    PVPNormalMeleeMaxAttack:   'PVP 일반 공격 최대 근거리 공격력',
    PVPNormalRangedMinAttack:  'PVP 일반 공격 최소 원거리 공격력',
    PVPNormalRangedMaxAttack:  'PVP 일반 공격 최대 원거리 공격력',
    PVPNormalMagicMinAttack:   'PVP 일반 공격 최소 마법 공격력',
    PVPNormalMagicMaxAttack:   'PVP 일반 공격 최대 마법 공격력',
    // PVE 스킬 공격력 최소/최대 (근거리/원거리/마법)
    PVEMeleeSkillMinAttack:    'PVE 스킬 최소 근거리 공격력',
    PVEMeleeSkillMaxAttack:    'PVE 스킬 최대 근거리 공격력',
    PVERangedSkillMinAttack:   'PVE 스킬 최소 원거리 공격력',
    PVERangedSkillMaxAttack:   'PVE 스킬 최대 원거리 공격력',
    PVEMagicSkillMinAttack:    'PVE 스킬 최소 마법 공격력',
    PVEMagicSkillMaxAttack:    'PVE 스킬 최대 마법 공격력',
    // PVP 스킬 공격력 최소/최대 (근거리/원거리/마법)
    PVPMeleeSkillMinAttack:    'PVP 스킬 최소 근거리 공격력',
    PVPMeleeSkillMaxAttack:    'PVP 스킬 최대 근거리 공격력',
    PVPRangedSkillMinAttack:   'PVP 스킬 최소 원거리 공격력',
    PVPRangedSkillMaxAttack:   'PVP 스킬 최대 원거리 공격력',
    PVPMagicSkillMinAttack:    'PVP 스킬 최소 마법 공격력',
    PVPMagicSkillMaxAttack:    'PVP 스킬 최대 마법 공격력',
};

// 게임 내에서 퍼센트(%)로 적용되는 치환 대상 스탯 목록
// 이 목록에 포함된 스탯은 미리보기에서 +N% 형태로 표시된다
const SUBST_PCT_STATS = new Set([
    // 증폭 계열
    'MaxHealthPointAmplifyRate', 'MaxManaPointAmplifyRate', 'AttackSpeedAmplifyRate',
    'CriticalDamageReductionAmplifyRate', 'SkillDamageReductionAmplifyRate',
    // 치명타 확률 계열
    'PVECritical', 'PVPCritical',
    'PVEMeleeCritical', 'PVPMeleeCritical',
    'PVERangedCritical', 'PVPRangedCritical',
    'PVEMagicCritical', 'PVPMagicCritical',
    'PVESkillExtraCritical',
    'PVENormalRangedExtraCritical', 'PVPNormalRangedExtraCritical',
    // AtCriticalAttack 계열은 절대값(추가 공격력)이므로 퍼센트 표기 제외
    // 저항 계열
    'StunResist', 'ParalysisResist', 'SilenceResist',
    'HoldResist', 'SlowResist', 'ProvokeResist',
    // 치명타 저항/피해 감소 계열
    'MeleeCriticalResist', 'RangedCriticalResist', 'MagicCriticalResist',
    'MeleeCriticalDamageReduction', 'RangedCriticalDamageReduction', 'MagicCriticalDamageReduction',
    'MeleeSkillDamageReduction', 'RangedSkillDamageReduction', 'MagicSkillDamageReduction',
    // 보너스/드랍 계열
    'ItemDropBonus', 'AxisSkillEXPBonus', 'WeaponEXPBonus',
    // 회피 계열
    'MeleeEvasion', 'RangedEvasion', 'MagicEvasion',
]);

// ─── 퍼센트 스탯 표시 헬퍼 ───────────────────────────────────────────
// 퍼센트 스탯 수치 표기 규칙: 원시값 / 10000 * 100 = 표시 퍼센트 (= 원시값 / 100)
// 예: 원시값 1500 → 1500/100 = 15.00%   원시값 750 → 0.75%
// ※ character_info.html 에서 computeStats가 이미 0~100 범위로 변환한 스탯은 직접 % 표기

// 원시값이 10000 단위인 퍼센트 스탯 (÷100 후 '%' 표기)
// BASE_STAT_SUBSTITUTION 치환 대상 스탯 + STAT_LIST 내 퍼센트 적용 스탯 포함
const RAW_PCT_STAT_KEYS = SUBST_PCT_STATS;  // SUBST_PCT_STATS 와 동일 집합

// computeStats 가 0~100(%) 자연 단위로 이미 변환한 스탯 (나누기 없이 직접 % 표기)
// ※ 치명타율 계열(PVECritical 등)은 이제 원시값(RAW_PCT_STAT_KEYS)으로 반환 — 여기서 제외
const COMPUTED_PCT_STAT_KEYS = new Set([
    'PotionRecoveryRate',
]);

// 스탯 값을 올바른 형식으로 포맷 (character_info.html 스탯 목록용)
// en: 영문 스탯 키, val: computeStats 반환값
function fmtStatDisplay(en, val) {
    if (COMPUTED_PCT_STAT_KEYS.has(en)) {
        return val.toFixed(2) + '%';
    }
    if (RAW_PCT_STAT_KEYS.has(en)) {
        return (val / 100).toFixed(2) + '%';
    }
    return val.toLocaleString();
}

// 기본 스탯 → 치환 보너스 객체 반환
// baseStats: { STR:10, DEX:10, INT:10, AGI:10, CON:10, WIS:10, LUK:10 }
function computeSubstitutedBonuses(baseStats) {
    const bonus = {};
    for (const [stat, entries] of Object.entries(BASE_STAT_SUBSTITUTION)) {
        const val = (baseStats && baseStats[stat] != null) ? baseStats[stat] : 0;
        for (const { key, c1, c2 } of entries) {
            bonus[key] = (bonus[key] || 0) + Math.floor(val / c1 * c2);
        }
    }
    return bonus;
}

