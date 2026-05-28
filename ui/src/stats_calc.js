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
{"id":821,"kr":"탑승시 이동속도","en":"RideMoveSpeed","kind":"기타","group":"05_속도","scope":"공통","desc":"탈것 탑승시 이동속도 증감 옵션"},
{"id":6,"kr":"근거리 무기 최소 공격력","en":"MeleeWeaponMinDamage","kind":"공격","group":"01_무기 공격력","scope":"공통","desc":"근거리 무기 최소 공격력"},
{"id":7,"kr":"근거리 무기 최대 공격력","en":"MeleeWeaponMaxDamage","kind":"공격","group":"01_무기 공격력","scope":"공통","desc":"근거리 무기 최대 공격력"},
{"id":8,"kr":"원거리 무기 최소 공격력","en":"RangedWeaponMinDamage","kind":"공격","group":"01_무기 공격력","scope":"공통","desc":"원거리 무기 최소 공격력"},
{"id":9,"kr":"원거리 무기 최대 공격력","en":"RangedWeaponMaxDamage","kind":"공격","group":"01_무기 공격력","scope":"공통","desc":"원거리 무기 최대 공격력"},
{"id":10,"kr":"마법 무기 최소 공격력","en":"MagicWeaponMinDamage","kind":"공격","group":"01_무기 공격력","scope":"공통","desc":"마법 무기 최소 공격력"},
{"id":11,"kr":"마법 무기 최대 공격력","en":"MagicWeaponMaxDamage","kind":"공격","group":"01_무기 공격력","scope":"공통","desc":"마법 무기 최대 공격력"},
{"id":12,"kr":"공격력","en":"Attack","kind":"공격","group":"02_공격력","scope":"공통","desc":"공격력 증감 옵션"},
{"id":13,"kr":"근거리 공격력","en":"MeleeAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"근거리 공격력 증감 옵션"},
{"id":14,"kr":"원거리 공격력","en":"RangedAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"원거리 공격력 증감 옵션"},
{"id":15,"kr":"마법 공격력","en":"MagicAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"마법 공격력 증감 옵션"},
{"id":16,"kr":"최소 공격력","en":"MinAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"최소 공격력 증감 옵션"},
{"id":17,"kr":"근거리 최소 공격력","en":"MeleeMinAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"근거리 최소 공격력 증감 옵션"},
{"id":18,"kr":"원거리 최소 공격력","en":"RangedMinAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"원거리 최소 공격력 증감 옵션"},
{"id":19,"kr":"마법 최소 공격력","en":"MagicMinAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"마법 최소 공격력 증감 옵션"},
{"id":20,"kr":"최대 공격력","en":"MaxAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"최대 공격력 증감 옵션"},
{"id":21,"kr":"근거리 최대 공격력","en":"MeleeMaxAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"근거리 최대 공격력 증감 옵션"},
{"id":22,"kr":"원거리 최대 공격력","en":"RangedMaxAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"원거리 최대 공격력 증감 옵션"},
{"id":23,"kr":"마법 최대 공격력","en":"MagicMaxAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"마법 최대 공격력 증감 옵션"},
{"id":24,"kr":"치명타 공격력","en":"AtCriticalAttack","kind":"공격","group":"03_치명타 공격력","scope":"공통","desc":"치명타 공격력 증감 옵션"},
{"id":25,"kr":"치명타 근거리 공격력","en":"AtCriticalMeleeAttack","kind":"공격","group":"03_치명타 공격력","scope":"공통","desc":"치명타 근거리 공격력 증감 옵션"},
{"id":26,"kr":"치명타 원거리 공격력","en":"AtCriticalRangedAttack","kind":"공격","group":"03_치명타 공격력","scope":"공통","desc":"치명타 원거리 공격력 증감 옵션"},
{"id":27,"kr":"치명타 마법 공격력","en":"AtCriticalMagicAttack","kind":"공격","group":"03_치명타 공격력","scope":"공통","desc":"치명타 마법 공격력 증감 옵션"},
{"id":28,"kr":"명중","en":"Accuracy","kind":"공격","group":"04_명중","scope":"공통","desc":"명중 증감 옵션"},
{"id":29,"kr":"근거리 명중","en":"MeleeAccuracy","kind":"공격","group":"04_명중","scope":"공통","desc":"근거리 명중 증감 옵션"},
{"id":30,"kr":"원거리 명중","en":"RangedAccuracy","kind":"공격","group":"04_명중","scope":"공통","desc":"원거리 명중 증감 옵션"},
{"id":31,"kr":"마법 명중","en":"MagicAccuracy","kind":"공격","group":"04_명중","scope":"공통","desc":"마법 명중 증감 옵션"},
{"id":32,"kr":"물리 방어력 관통","en":"TargetPhysicalDefense","kind":"공격","group":"05_방어 관통","scope":"공통","desc":"물리 방어력 관통 증감 옵션"},
{"id":33,"kr":"마법 방어력 관통","en":"TargetMagicDefense","kind":"공격","group":"05_방어 관통","scope":"공통","desc":"마법 방어력 관통 증감 옵션"},
{"id":40,"kr":"치명타","en":"Critical","kind":"공격","group":"06_치명타","scope":"공통","desc":"치명타 확률 증감 옵션"},
{"id":41,"kr":"근거리 치명타","en":"MeleeCritical","kind":"공격","group":"06_치명타","scope":"공통","desc":"근거리 치명타 확률 증감 옵션"},
{"id":42,"kr":"원거리 치명타","en":"RangedCritical","kind":"공격","group":"06_치명타","scope":"공통","desc":"원거리 치명타 확률 증감 옵션"},
{"id":43,"kr":"마법 치명타","en":"MagicCritical","kind":"공격","group":"06_치명타","scope":"공통","desc":"마법 치명타 확률 증감 옵션"},
{"id":48,"kr":"대미지 리덕션","en":"DamageReduction","kind":"방어","group":"04_대미지 리덕션","scope":"공통","desc":"대미지 리덕션 증감 옵션"},
{"id":49,"kr":"근거리 대미지 리덕션","en":"MeleeDamageReduction","kind":"방어","group":"04_대미지 리덕션","scope":"공통","desc":"근거리 대미지 리덕션 증감 옵션"},
{"id":50,"kr":"원거리 대미지 리덕션","en":"RangedDamageReduction","kind":"방어","group":"04_대미지 리덕션","scope":"공통","desc":"원거리 대미지 리덕션 증감 옵션"},
{"id":51,"kr":"마법 대미지 리덕션","en":"MagicDamageReduction","kind":"방어","group":"04_대미지 리덕션","scope":"공통","desc":"마법 대미지 리덕션 증감 옵션"},
{"id":52,"kr":"대미지 리덕션 무시","en":"DamageReductionIgnore","kind":"공격","group":"06_피해감소 무시","scope":"공통","desc":"대미지 리덕션 무시 증감 옵션"},
{"id":53,"kr":"근거리 대미지 리덕션 무시","en":"MeleeDamageReductionIgnore","kind":"공격","group":"06_피해감소 무시","scope":"공통","desc":"근거리 대미지 리덕션 무시 증감 옵션"},
{"id":54,"kr":"원거리 대미지 리덕션 무시","en":"RangedDamageReductionIgnore","kind":"공격","group":"06_피해감소 무시","scope":"공통","desc":"원거리 대미지 리덕션 무시 증감 옵션"},
{"id":55,"kr":"마법 대미지 리덕션 무시","en":"MagicDamageReductionIgnore","kind":"공격","group":"06_피해감소 무시","scope":"공통","desc":"마법 대미지 리덕션 무시 증감 옵션"},
{"id":56,"kr":"받는 피해 감소","en":"DamageReductionRate","kind":"방어","group":"05_피해 감소","scope":"공통","desc":"받는 피해 감소 증감 옵션"},
{"id":57,"kr":"받는 근거리 피해 감소","en":"MeleeDamageReductionRate","kind":"방어","group":"05_피해 감소","scope":"공통","desc":"받는 근거리 피해 감소 증감 옵션"},
{"id":58,"kr":"받는 원거리 피해 감소","en":"RangedDamageReductionRate","kind":"방어","group":"05_피해 감소","scope":"공통","desc":"받는 원거리 피해 감소 증감 옵션"},
{"id":59,"kr":"받는 마법 피해 감소","en":"MagicDamageReductionRate","kind":"방어","group":"05_피해 감소","scope":"공통","desc":"받는 마법 피해 감소 증감 옵션"},
{"id":61,"kr":"스킬 피해 감소 무시","en":"SkillDamageReductionIgnore","kind":"공격","group":"06_피해감소 무시","scope":"공통","desc":"스킬 피해 감소 무시 증감 옵션"},
{"id":76,"kr":"상태이상 적중","en":"AbnormalHit","kind":"공격","group":"08_상태이상 적중","scope":"공통","desc":"상태이상 적중 증감 옵션"},
{"id":77,"kr":"디버프 적중","en":"DebuffHit","kind":"공격","group":"08_상태이상 적중","scope":"공통","desc":"디버프 적중 증감 옵션"},
{"id":80,"kr":"수면 적중","en":"SleepHit","kind":"공격","group":"08_상태이상 적중","scope":"공통","desc":"수면 적중 증감 옵션"},
{"id":84,"kr":"상태이상 저항","en":"AbnormalResist","kind":"방어","group":"06_상태이상 저항","scope":"공통","desc":"상태이상 저항 증감 옵션"},
{"id":85,"kr":"디버프 저항","en":"DebuffResist","kind":"방어","group":"06_상태이상 저항","scope":"공통","desc":"디버프 저항 증감 옵션"},
{"id":88,"kr":"수면 저항","en":"SleepResist","kind":"방어","group":"06_상태이상 저항","scope":"공통","desc":"수면 저항 증감 옵션"},
{"id":92,"kr":"몬스터 추가 공격력","en":"MonsterExtraAttack","kind":"공격","group":"09_보스/특수 대상","scope":"공통","desc":"몬스터 추가 공격력 증감 옵션"},
{"id":94,"kr":"언데드형 추가 공격력","en":"UndeadExtraAttack","kind":"공격","group":"09_보스/특수 대상","scope":"공통","desc":"언데드형 추가 공격력 증감 옵션"},
{"id":95,"kr":"악마형 추가 공격력","en":"DemonExtraAttack","kind":"공격","group":"09_보스/특수 대상","scope":"공통","desc":"악마형 추가 공격력 증감 옵션"},
{"id":96,"kr":"마수형 추가 공격력","en":"BeastExtraAttack","kind":"공격","group":"09_보스/특수 대상","scope":"공통","desc":"마수형 추가 공격력 증감 옵션"},
{"id":97,"kr":"마인형 추가 공격력","en":"WerebeastExtraAttack","kind":"공격","group":"09_보스/특수 대상","scope":"공통","desc":"마인형 추가 공격력 증감 옵션"},
{"id":98,"kr":"정령형 추가 공격력","en":"SpiritExtraAttack","kind":"공격","group":"09_보스/특수 대상","scope":"공통","desc":"정령형 추가 공격력 증감 옵션"},
{"id":99,"kr":"모든 군단 추가 공격력","en":"AllLegionExtraAttack","kind":"공격","group":"09_보스/특수 대상","scope":"공통","desc":"모든 군단 추가 공격력 증감 옵션"},
{"id":100,"kr":"언더어스 군단 추가 공격력","en":"UnderEarthLegionExtraAttack","kind":"공격","group":"09_보스/특수 대상","scope":"공통","desc":"언더어스 군단 추가 공격력 증감 옵션"},
{"id":101,"kr":"버스트워 군단 추가 공격력","en":"BurstWarLegionExtraAttack","kind":"공격","group":"09_보스/특수 대상","scope":"공통","desc":"버스트워 군단 추가 공격력 증감 옵션"},
{"id":102,"kr":"아크베슬 군단 추가 공격력","en":"ArcVesselLegionExtraAttack","kind":"공격","group":"09_보스/특수 대상","scope":"공통","desc":"아크베슬 군단 추가 공격력 증감 옵션"},
{"id":103,"kr":"타리스만 군단 추가 공격력","en":"TalismanLegionExtraAttack","kind":"공격","group":"09_보스/특수 대상","scope":"공통","desc":"타리스만 군단 추가 공격력 증감 옵션"},
{"id":104,"kr":"디스페어 군단 추가 공격력","en":"DespairLegionExtraAttack","kind":"공격","group":"09_보스/특수 대상","scope":"공통","desc":"디스페어 군단 추가 공격력 증감 옵션"},
{"id":105,"kr":"몬스터 추가 방어력","en":"MonsterExtraDefense","kind":"방어","group":"07_보스 방어","scope":"공통","desc":"몬스터 추가 방어력 증감 옵션"},
{"id":107,"kr":"언데드형 추가 방어력","en":"UndeadExtraDefense","kind":"방어","group":"07_보스 방어","scope":"공통","desc":"언데드형 추가 방어력 증감 옵션"},
{"id":108,"kr":"악마형 추가 방어력","en":"DemonExtraDefense","kind":"방어","group":"07_보스 방어","scope":"공통","desc":"악마형 추가 방어력 증감 옵션"},
{"id":109,"kr":"마수형 추가 방어력","en":"BeastExtraDefense","kind":"방어","group":"07_보스 방어","scope":"공통","desc":"마수형 추가 방어력 증감 옵션"},
{"id":110,"kr":"마인형 추가 방어력","en":"WerebeastExtraDefense","kind":"방어","group":"07_보스 방어","scope":"공통","desc":"마인형 추가 방어력 증감 옵션"},
{"id":111,"kr":"정령형 추가 방어력","en":"SpiritExtraDefense","kind":"방어","group":"07_보스 방어","scope":"공통","desc":"정령형 추가 방어력 증감 옵션"},
{"id":112,"kr":"모든 군단 추가 방어력","en":"AllLegionExtraDefense","kind":"방어","group":"07_보스 방어","scope":"공통","desc":"모든 군단 추가 방어력 증감 옵션"},
{"id":113,"kr":"언더어스 군단 추가 방어력","en":"UnderEarthLegionExtraDefense","kind":"방어","group":"07_보스 방어","scope":"공통","desc":"언더어스 군단 추가 방어력 증감 옵션"},
{"id":114,"kr":"버스트워 군단 추가 방어력","en":"BurstWarLegionExtraDefense","kind":"방어","group":"07_보스 방어","scope":"공통","desc":"버스트워 군단 추가 방어력 증감 옵션"},
{"id":115,"kr":"아크베슬 군단 추가 방어력","en":"ArcVesselLegionExtraDefense","kind":"방어","group":"07_보스 방어","scope":"공통","desc":"아크베슬 군단 추가 방어력 증감 옵션"},
{"id":116,"kr":"타리스만 군단 추가 방어력","en":"TalismanLegionExtraDefense","kind":"방어","group":"07_보스 방어","scope":"공통","desc":"타리스만 군단 추가 방어력 증감 옵션"},
{"id":117,"kr":"디스페어 군단 추가 방어력","en":"DespairLegionExtraDefense","kind":"방어","group":"07_보스 방어","scope":"공통","desc":"디스페어 군단 추가 방어력 증감 옵션"},
{"id":138,"kr":"PVP 물리 방어력","en":"PVPPhysicalDefense","kind":"방어","group":"01_방어력","scope":"PVP","desc":"PVP 물리 방어력 증감 옵션"},
{"id":139,"kr":"PVP 마법 방어력","en":"PVPMagicDefense","kind":"방어","group":"01_방어력","scope":"PVP","desc":"PVP 마법 방어력 증감 옵션"},
{"id":140,"kr":"PVP 회피","en":"PVPEvasion","kind":"방어","group":"02_회피","scope":"PVP","desc":"PVP 회피 증감 옵션"},
{"id":141,"kr":"PVP 근거리 회피","en":"PVPMeleeEvasion","kind":"방어","group":"02_회피","scope":"PVP","desc":"PVP 근거리 회피 증감 옵션"},
{"id":142,"kr":"PVP 원거리 회피","en":"PVPRangedEvasion","kind":"방어","group":"02_회피","scope":"PVP","desc":"PVP 원거리 회피 증감 옵션"},
{"id":143,"kr":"PVP 마법 회피","en":"PVPMagicEvasion","kind":"방어","group":"02_회피","scope":"PVP","desc":"PVP 마법 회피 증감 옵션"},
{"id":148,"kr":"PVP 치명타 저항","en":"PVPCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"PVP","desc":"PVP 치명타 저항 증감 옵션"},
{"id":149,"kr":"PVP 근거리 치명타 저항","en":"PVPMeleeCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"PVP","desc":"PVP 근거리 치명타 저항 증감 옵션"},
{"id":150,"kr":"PVP 원거리 치명타 저항","en":"PVPRangedCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"PVP","desc":"PVP 원거리 치명타 저항 증감 옵션"},
{"id":151,"kr":"PVP 마법 치명타 저항","en":"PVPMagicCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"PVP","desc":"PVP 마법 치명타 저항 증감 옵션"},
{"id":164,"kr":"PVP 스킬 피해 감소","en":"PVPSkillDamageReduction","kind":"방어","group":"05_PVP 피해 감소","scope":"PVP","desc":"PVP 스킬 피해 감소 증감 옵션"},
{"id":166,"kr":"PVP 상태이상 적중","en":"PVPAbnormalHit","kind":"공격","group":"08_상태이상 적중","scope":"PVP","desc":"PVP 상태이상 적중 증감 옵션"},
{"id":167,"kr":"PVP 상태이상 저항","en":"PVPAbnormalResist","kind":"방어","group":"06_상태이상 저항","scope":"PVP","desc":"PVP 상태이상 저항 증감 옵션"},
{"id":171,"kr":"일반 공격 추가 치명타","en":"NormalExtraCritical","kind":"공격","group":"06_치명타","scope":"공통","desc":"일반 공격 추가 치명타 증감 옵션"},
{"id":172,"kr":"일반 공격 근거리 추가 치명타","en":"NormalMeleeExtraCritical","kind":"공격","group":"06_치명타","scope":"공통","desc":"일반 공격 근거리 추가 치명타 증감 옵션"},
{"id":173,"kr":"일반 공격 원거리 추가 치명타","en":"NormalRangedExtraCritical","kind":"공격","group":"06_치명타","scope":"공통","desc":"일반 공격 원거리 추가 치명타 증감 옵션"},
{"id":174,"kr":"일반 공격 마법 추가 치명타","en":"NormalMagicExtraCritical","kind":"공격","group":"06_치명타","scope":"공통","desc":"일반 공격 마법 추가 치명타 증감 옵션"},
{"id":175,"kr":"스킬 추가 치명타","en":"SkillExtraCritical","kind":"공격","group":"06_치명타","scope":"공통","desc":"스킬 추가 치명타 증감 옵션"},
{"id":176,"kr":"스킬 근거리 추가 치명타","en":"SkillMeleeExtraCritical","kind":"공격","group":"06_치명타","scope":"공통","desc":"스킬 근거리 추가 치명타 증감 옵션"},
{"id":177,"kr":"스킬 원거리 추가 치명타","en":"SkillRangedExtraCritical","kind":"공격","group":"06_치명타","scope":"공통","desc":"스킬 원거리 추가 치명타 증감 옵션"},
{"id":178,"kr":"스킬 마법 추가 치명타","en":"SkillMagicExtraCritical","kind":"공격","group":"06_치명타","scope":"공통","desc":"스킬 마법 추가 치명타 증감 옵션"},
{"id":195,"kr":"PVP 일반 공격 추가 치명타 저항","en":"PVPNormalExtraCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"PVP","desc":"PVP 일반 공격 추가 치명타 저항 증감 옵션"},
{"id":196,"kr":"PVP 일반 공격 근거리 추가 치명타 저항","en":"PVPNormalMeleeExtraCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"PVP","desc":"PVP 일반 공격 근거리 추가 치명타 저항 증감 옵션"},
{"id":197,"kr":"PVP 일반 공격 원거리 추가 치명타 저항","en":"PVPNormalRangedExtraCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"PVP","desc":"PVP 일반 공격 원거리 추가 치명타 저항 증감 옵션"},
{"id":198,"kr":"PVP 일반 공격 마법 추가 치명타 저항","en":"PVPNormalMagicExtraCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"PVP","desc":"PVP 일반 공격 마법 추가 치명타 저항 증감 옵션"},
{"id":199,"kr":"PVP 스킬 추가 치명타 저항","en":"PVPSkillExtraCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"PVP","desc":"PVP 스킬 추가 치명타 저항 증감 옵션"},
{"id":200,"kr":"PVP 스킬 근거리 추가 치명타 저항","en":"PVPSkillMeleeExtraCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"PVP","desc":"PVP 스킬 근거리 추가 치명타 저항 증감 옵션"},
{"id":201,"kr":"PVP 스킬 원거리 추가 치명타 저항","en":"PVPSkillRangedExtraCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"PVP","desc":"PVP 스킬 원거리 추가 치명타 저항 증감 옵션"},
{"id":202,"kr":"PVP 스킬 마법 추가 치명타 저항","en":"PVPSkillMagicExtraCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"PVP","desc":"PVP 스킬 마법 추가 치명타 저항 증감 옵션"},
{"id":207,"kr":"PVE 치명타 저항","en":"PVECriticalResist","kind":"방어","group":"03_치명타 저항","scope":"PVE","desc":"PVE 치명타 저항 증감 옵션"},
{"id":208,"kr":"PVE 근거리 치명타 저항","en":"PVEMeleeCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"PVE","desc":"PVE 근거리 치명타 저항 증감 옵션"},
{"id":209,"kr":"PVE 원거리 치명타 저항","en":"PVERangedCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"PVE","desc":"PVE 원거리 치명타 저항 증감 옵션"},
{"id":210,"kr":"PVE 마법 치명타 저항","en":"PVEMagicCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"PVE","desc":"PVE 마법 치명타 저항 증감 옵션"},
{"id":219,"kr":"PVE 일반 공격 추가 치명타 저항","en":"PVENormalExtraCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"PVE","desc":"PVE 일반 공격 추가 치명타 저항 증감 옵션"},
{"id":220,"kr":"PVE 일반 공격 근거리 추가 치명타 저항","en":"PVENormalMeleeExtraCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"PVE","desc":"PVE 일반 공격 근거리 추가 치명타 저항 증감 옵션"},
{"id":221,"kr":"PVE 일반 공격 원거리 추가 치명타 저항","en":"PVENormalRangedExtraCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"PVE","desc":"PVE 일반 공격 원거리 추가 치명타 저항 증감 옵션"},
{"id":222,"kr":"PVE 일반 공격 마법 추가 치명타 저항","en":"PVENormalMagicExtraCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"PVE","desc":"PVE 일반 공격 마법 추가 치명타 저항 증감 옵션"},
{"id":223,"kr":"PVE 스킬 추가 치명타 저항","en":"PVESkillExtraCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"PVE","desc":"PVE 스킬 추가 치명타 저항 증감 옵션"},
{"id":224,"kr":"PVE 스킬 근거리 추가 치명타 저항","en":"PVESkillMeleeExtraCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"PVE","desc":"PVE 스킬 근거리 추가 치명타 저항 증감 옵션"},
{"id":225,"kr":"PVE 스킬 원거리 추가 치명타 저항","en":"PVESkillRangedExtraCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"PVE","desc":"PVE 스킬 원거리 추가 치명타 저항 증감 옵션"},
{"id":226,"kr":"PVE 스킬 마법 추가 치명타 저항","en":"PVESkillMagicExtraCriticalResist","kind":"방어","group":"03_치명타 저항","scope":"PVE","desc":"PVE 스킬 마법 추가 치명타 저항 증감 옵션"},
{"id":231,"kr":"PVE 회피","en":"PVEEvasion","kind":"방어","group":"02_회피","scope":"PVE","desc":"PVE 회피 증감 옵션"},
{"id":232,"kr":"PVE 근거리 회피","en":"PVEMeleeEvasion","kind":"방어","group":"02_회피","scope":"PVE","desc":"PVE 근거리 회피 증감 옵션"},
{"id":233,"kr":"PVE 원거리 회피","en":"PVERangedEvasion","kind":"방어","group":"02_회피","scope":"PVE","desc":"PVE 원거리 회피 증감 옵션"},
{"id":234,"kr":"PVE 마법 회피","en":"PVEMagicEvasion","kind":"방어","group":"02_회피","scope":"PVE","desc":"PVE 마법 회피 증감 옵션"},
{"id":235,"kr":"PVE 물리 방어력","en":"PVEPhysicalDefense","kind":"방어","group":"01_방어력","scope":"PVE","desc":"PVE 물리 방어력 증감 옵션"},
{"id":236,"kr":"PVE 마법 방어력","en":"PVEMagicDefense","kind":"방어","group":"01_방어력","scope":"PVE","desc":"PVE 마법 방어력 증감 옵션"},
{"id":242,"kr":"PVP 디버프 적중","en":"PVPDebuffHit","kind":"공격","group":"08_상태이상 적중","scope":"PVP","desc":"PVP 디버프 적중 증감 옵션"},
{"id":243,"kr":"PVP 스턴 적중","en":"PVPStunHit","kind":"공격","group":"08_상태이상 적중","scope":"PVP","desc":"PVP 스턴 적중 증감 옵션"},
{"id":244,"kr":"PVP 마비 적중","en":"PVPParalyzeHit","kind":"공격","group":"08_상태이상 적중","scope":"PVP","desc":"PVP 마비 적중 증감 옵션"},
{"id":245,"kr":"PVP 도발 적중","en":"PVPProvokeHit","kind":"공격","group":"08_상태이상 적중","scope":"PVP","desc":"PVP 도발 적중 증감 옵션"},
{"id":246,"kr":"PVP 홀드 적중","en":"PVPHoldHit","kind":"공격","group":"08_상태이상 적중","scope":"PVP","desc":"PVP 홀드 적중 증감 옵션"},
{"id":247,"kr":"PVP 수면 적중","en":"PVPSleepHit","kind":"공격","group":"08_상태이상 적중","scope":"PVP","desc":"PVP 수면 적중 증감 옵션"},
{"id":248,"kr":"PVP 침묵 적중","en":"PVPSilenceHit","kind":"공격","group":"08_상태이상 적중","scope":"PVP","desc":"PVP 침묵 적중 증감 옵션"},
{"id":249,"kr":"PVP 슬로우 적중","en":"PVPSlowHit","kind":"공격","group":"08_상태이상 적중","scope":"PVP","desc":"PVP 슬로우 적중 증감 옵션"},
{"id":250,"kr":"PVP 화상 적중","en":"PVPBurnHit","kind":"공격","group":"08_상태이상 적중","scope":"PVP","desc":"PVP 화상 적중 증감 옵션"},
{"id":251,"kr":"PVP 출혈 적중","en":"PVPBleedingHit","kind":"공격","group":"08_상태이상 적중","scope":"PVP","desc":"PVP 출혈 적중 증감 옵션"},
{"id":252,"kr":"PVP 중독 적중","en":"PVPPoisonHit","kind":"공격","group":"08_상태이상 적중","scope":"PVP","desc":"PVP 중독 적중 증감 옵션"},
{"id":253,"kr":"PVP 냉기 적중","en":"PVPColdHit","kind":"공격","group":"08_상태이상 적중","scope":"PVP","desc":"PVP 냉기 적중 증감 옵션"},
{"id":254,"kr":"PVE 상태이상 적중","en":"PVEAbnormalHit","kind":"공격","group":"08_상태이상 적중","scope":"PVE","desc":"PVE 상태이상 적중 증감 옵션"},
{"id":255,"kr":"PVE 디버프 적중","en":"PVEDebuffHit","kind":"공격","group":"08_상태이상 적중","scope":"PVE","desc":"PVE 디버프 적중 증감 옵션"},
{"id":256,"kr":"PVE 스턴 적중","en":"PVEStunHit","kind":"공격","group":"08_상태이상 적중","scope":"PVE","desc":"PVE 스턴 적중 증감 옵션"},
{"id":257,"kr":"PVE 마비 적중","en":"PVEParalyzeHit","kind":"공격","group":"08_상태이상 적중","scope":"PVE","desc":"PVE 마비 적중 증감 옵션"},
{"id":258,"kr":"PVE 도발 적중","en":"PVEProvokeHit","kind":"공격","group":"08_상태이상 적중","scope":"PVE","desc":"PVE 도발 적중 증감 옵션"},
{"id":259,"kr":"PVE 홀드 적중","en":"PVEHoldHit","kind":"공격","group":"08_상태이상 적중","scope":"PVE","desc":"PVE 홀드 적중 증감 옵션"},
{"id":260,"kr":"PVE 수면 적중","en":"PVESleepHit","kind":"공격","group":"08_상태이상 적중","scope":"PVE","desc":"PVE 수면 적중 증감 옵션"},
{"id":261,"kr":"PVE 침묵 적중","en":"PVESilenceHit","kind":"공격","group":"08_상태이상 적중","scope":"PVE","desc":"PVE 침묵 적중 증감 옵션"},
{"id":262,"kr":"PVE 슬로우 적중","en":"PVESlowHit","kind":"공격","group":"08_상태이상 적중","scope":"PVE","desc":"PVE 슬로우 적중 증감 옵션"},
{"id":263,"kr":"PVE 화상 적중","en":"PVEBurnHit","kind":"공격","group":"08_상태이상 적중","scope":"PVE","desc":"PVE 화상 적중 증감 옵션"},
{"id":264,"kr":"PVE 출혈 적중","en":"PVEBleedingHit","kind":"공격","group":"08_상태이상 적중","scope":"PVE","desc":"PVE 출혈 적중 증감 옵션"},
{"id":265,"kr":"PVE 중독 적중","en":"PVEPoisonHit","kind":"공격","group":"08_상태이상 적중","scope":"PVE","desc":"PVE 중독 적중 증감 옵션"},
{"id":266,"kr":"PVE 냉기 적중","en":"PVEColdHit","kind":"공격","group":"08_상태이상 적중","scope":"PVE","desc":"PVE 냉기 적중 증감 옵션"},
{"id":272,"kr":"PVP 디버프 저항","en":"PVPDebuffResist","kind":"방어","group":"06_상태이상 저항","scope":"PVP","desc":"PVP 디버프 저항 증감 옵션"},
{"id":273,"kr":"PVP 스턴 저항","en":"PVPStunResist","kind":"방어","group":"06_상태이상 저항","scope":"PVP","desc":"PVP 스턴 저항 증감 옵션"},
{"id":274,"kr":"PVP 마비 저항","en":"PVPParalyzeResist","kind":"방어","group":"06_상태이상 저항","scope":"PVP","desc":"PVP 마비 저항 증감 옵션"},
{"id":275,"kr":"PVP 도발 저항","en":"PVPProvokeResist","kind":"방어","group":"06_상태이상 저항","scope":"PVP","desc":"PVP 도발 저항 증감 옵션"},
{"id":276,"kr":"PVP 홀드 저항","en":"PVPHoldResist","kind":"방어","group":"06_상태이상 저항","scope":"PVP","desc":"PVP 홀드 저항 증감 옵션"},
{"id":277,"kr":"PVP 수면 저항","en":"PVPSleepResist","kind":"방어","group":"06_상태이상 저항","scope":"PVP","desc":"PVP 수면 저항 증감 옵션"},
{"id":278,"kr":"PVP 침묵 저항","en":"PVPSilenceResist","kind":"방어","group":"06_상태이상 저항","scope":"PVP","desc":"PVP 침묵 저항 증감 옵션"},
{"id":279,"kr":"PVP 슬로우 저항","en":"PVPSlowResist","kind":"방어","group":"06_상태이상 저항","scope":"PVP","desc":"PVP 슬로우 저항 증감 옵션"},
{"id":280,"kr":"PVP 화상 저항","en":"PVPBurnResist","kind":"방어","group":"06_상태이상 저항","scope":"PVP","desc":"PVP 화상 저항 증감 옵션"},
{"id":281,"kr":"PVP 출혈 저항","en":"PVPBleedingResist","kind":"방어","group":"06_상태이상 저항","scope":"PVP","desc":"PVP 출혈 저항 증감 옵션"},
{"id":282,"kr":"PVP 중독 저항","en":"PVPPoisonResist","kind":"방어","group":"06_상태이상 저항","scope":"PVP","desc":"PVP 중독 저항 증감 옵션"},
{"id":283,"kr":"PVP 냉기 저항","en":"PVPColdResist","kind":"방어","group":"06_상태이상 저항","scope":"PVP","desc":"PVP 냉기 저항 증감 옵션"},
{"id":284,"kr":"PVE 상태이상 저항","en":"PVEAbnormalResist","kind":"방어","group":"06_상태이상 저항","scope":"PVE","desc":"PVE 상태이상 저항 증감 옵션"},
{"id":285,"kr":"PVE 디버프 저항","en":"PVEDebuffResist","kind":"방어","group":"06_상태이상 저항","scope":"PVE","desc":"PVE 디버프 저항 증감 옵션"},
{"id":286,"kr":"PVE 스턴 저항","en":"PVEStunResist","kind":"방어","group":"06_상태이상 저항","scope":"PVE","desc":"PVE 스턴 저항 증감 옵션"},
{"id":287,"kr":"PVE 마비 저항","en":"PVEParalyzeResist","kind":"방어","group":"06_상태이상 저항","scope":"PVE","desc":"PVE 마비 저항 증감 옵션"},
{"id":288,"kr":"PVE 도발 저항","en":"PVEProvokeResist","kind":"방어","group":"06_상태이상 저항","scope":"PVE","desc":"PVE 도발 저항 증감 옵션"},
{"id":289,"kr":"PVE 홀드 저항","en":"PVEHoldResist","kind":"방어","group":"06_상태이상 저항","scope":"PVE","desc":"PVE 홀드 저항 증감 옵션"},
{"id":290,"kr":"PVE 수면 저항","en":"PVESleepResist","kind":"방어","group":"06_상태이상 저항","scope":"PVE","desc":"PVE 수면 저항 증감 옵션"},
{"id":291,"kr":"PVE 침묵 저항","en":"PVESilenceResist","kind":"방어","group":"06_상태이상 저항","scope":"PVE","desc":"PVE 침묵 저항 증감 옵션"},
{"id":292,"kr":"PVE 슬로우 저항","en":"PVESlowResist","kind":"방어","group":"06_상태이상 저항","scope":"PVE","desc":"PVE 슬로우 저항 증감 옵션"},
{"id":293,"kr":"PVE 화상 저항","en":"PVEBurnResist","kind":"방어","group":"06_상태이상 저항","scope":"PVE","desc":"PVE 화상 저항 증감 옵션"},
{"id":294,"kr":"PVE 출혈 저항","en":"PVEBleedingResist","kind":"방어","group":"06_상태이상 저항","scope":"PVE","desc":"PVE 출혈 저항 증감 옵션"},
{"id":295,"kr":"PVE 중독 저항","en":"PVEPoisonResist","kind":"방어","group":"06_상태이상 저항","scope":"PVE","desc":"PVE 중독 저항 증감 옵션"},
{"id":296,"kr":"PVE 냉기 저항","en":"PVEColdResist","kind":"방어","group":"06_상태이상 저항","scope":"PVE","desc":"PVE 냉기 저항 증감 옵션"},
{"id":313,"kr":"일반 공격 공격력","en":"NormalAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"일반 공격 공격력 증감 옵션"},
{"id":314,"kr":"일반 공격 최소 공격력","en":"NormalMinAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"일반 공격 최소 공격력 증감 옵션"},
{"id":315,"kr":"일반 공격 최대 공격력","en":"NormalMaxAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"일반 공격 최대 공격력 증감 옵션"},
{"id":316,"kr":"일반 공격 근거리 공격력","en":"NormalMeleeAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"일반 공격 근거리 공격력 증감 옵션"},
{"id":317,"kr":"일반 공격 근거리 최소 공격력","en":"NormalMeleeMinAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"일반 공격 근거리 최소 공격력 증감 옵션"},
{"id":318,"kr":"일반 공격 근거리 최대 공격력","en":"NormalMeleeMaxAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"일반 공격 근거리 최대 공격력 증감 옵션"},
{"id":319,"kr":"일반 공격 원거리 공격력","en":"NormalRangedAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"일반 공격 원거리 공격력 증감 옵션"},
{"id":320,"kr":"일반 공격 원거리 최소 공격력","en":"NormalRangedMinAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"일반 공격 원거리 최소 공격력 증감 옵션"},
{"id":321,"kr":"일반 공격 원거리 최대 공격력","en":"NormalRangedMaxAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"일반 공격 원거리 최대 공격력 증감 옵션"},
{"id":322,"kr":"일반 공격 마법 공격력","en":"NormalMagicAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"일반 공격 마법 공격력 증감 옵션"},
{"id":323,"kr":"일반 공격 마법 최소 공격력","en":"NormalMagicMinAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"일반 공격 마법 최소 공격력 증감 옵션"},
{"id":324,"kr":"일반 공격 마법 최대 공격력","en":"NormalMagicMaxAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"일반 공격 마법 최대 공격력 증감 옵션"},
{"id":328,"kr":"PVP 일반 공격 근거리 공격력","en":"PVPNormalMeleeAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격 근거리 공격력 증감 옵션"},
{"id":329,"kr":"PVP 일반 공격 근거리 최소 공격력","en":"PVPNormalMeleeMinAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격 근거리 최소 공격력 증감 옵션"},
{"id":330,"kr":"PVP 일반 공격 근거리 최대 공격력","en":"PVPNormalMeleeMaxAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격 근거리 최대 공격력 증감 옵션"},
{"id":331,"kr":"PVP 일반 공격 원거리 공격력","en":"PVPNormalRangedAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격 원거리 공격력 증감 옵션"},
{"id":332,"kr":"PVP 일반 공격 원거리 최소 공격력","en":"PVPNormalRangedMinAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격 원거리 최소 공격력 증감 옵션"},
{"id":333,"kr":"PVP 일반 공격 원거리 최대 공격력","en":"PVPNormalRangedMaxAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격 원거리 최대 공격력 증감 옵션"},
{"id":334,"kr":"PVP 일반 공격 마법 공격력","en":"PVPNormalMagicAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격 마법 공격력 증감 옵션"},
{"id":335,"kr":"PVP 일반 공격 마법 최소 공격력","en":"PVPNormalMagicMinAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격 마법 최소 공격력 증감 옵션"},
{"id":336,"kr":"PVP 일반 공격 마법 최대 공격력","en":"PVPNormalMagicMaxAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격 마법 최대 공격력 증감 옵션"},
{"id":340,"kr":"PVE 일반 공격 근거리 공격력","en":"PVENormalMeleeAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격 근거리 공격력 증감 옵션"},
{"id":341,"kr":"PVE 일반 공격 근거리 최소 공격력","en":"PVENormalMeleeMinAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격 근거리 최소 공격력 증감 옵션"},
{"id":342,"kr":"PVE 일반 공격 근거리 최대 공격력","en":"PVENormalMeleeMaxAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격 근거리 최대 공격력 증감 옵션"},
{"id":343,"kr":"PVE 일반 공격 원거리 공격력","en":"PVENormalRangedAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격 원거리 공격력 증감 옵션"},
{"id":344,"kr":"PVE 일반 공격 원거리 최소 공격력","en":"PVENormalRangedMinAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격 원거리 최소 공격력 증감 옵션"},
{"id":345,"kr":"PVE 일반 공격 원거리 최대 공격력","en":"PVENormalRangedMaxAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격 원거리 최대 공격력 증감 옵션"},
{"id":346,"kr":"PVE 일반 공격 마법 공격력","en":"PVENormalMagicAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격 마법 공격력 증감 옵션"},
{"id":347,"kr":"PVE 일반 공격 마법 최소 공격력","en":"PVENormalMagicMinAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격 마법 최소 공격력 증감 옵션"},
{"id":348,"kr":"PVE 일반 공격 마법 최대 공격력","en":"PVENormalMagicMaxAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격 마법 최대 공격력 증감 옵션"},
{"id":349,"kr":"스킬 최소 공격력","en":"SkillMinAttack","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 최소 공격력 증감 옵션"},
{"id":350,"kr":"스킬 최대 공격력","en":"SkillMaxAttack","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 최대 공격력 증감 옵션"},
{"id":351,"kr":"스킬 근거리 공격력","en":"SkillMeleeAttack","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 근거리 공격력 증감 옵션"},
{"id":352,"kr":"스킬 근거리 최소 공격력","en":"SkillMeleeMinAttack","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 근거리 최소 공격력 증감 옵션"},
{"id":353,"kr":"스킬 근거리 최대 공격력","en":"SkillMeleeMaxAttack","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 근거리 최대 공격력 증감 옵션"},
{"id":354,"kr":"스킬 원거리 공격력","en":"SkillRangedAttack","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 원거리 공격력 증감 옵션"},
{"id":355,"kr":"스킬 원거리 최소 공격력","en":"SkillRangedMinAttack","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 원거리 최소 공격력 증감 옵션"},
{"id":356,"kr":"스킬 원거리 최대 공격력","en":"SkillRangedMaxAttack","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 원거리 최대 공격력 증감 옵션"},
{"id":357,"kr":"스킬 마법 공격력","en":"SkillMagicAttack","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 마법 공격력 증감 옵션"},
{"id":358,"kr":"스킬 마법 최소 공격력","en":"SkillMagicMinAttack","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 마법 최소 공격력 증감 옵션"},
{"id":359,"kr":"스킬 마법 최대 공격력","en":"SkillMagicMaxAttack","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 마법 최대 공격력 증감 옵션"},
{"id":363,"kr":"PVP 스킬 근거리 공격력","en":"PVPSkillMeleeAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 근거리 공격력 증감 옵션"},
{"id":364,"kr":"PVP 스킬 근거리 최소 공격력","en":"PVPSkillMeleeMinAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 근거리 최소 공격력 증감 옵션"},
{"id":365,"kr":"PVP 스킬 근거리 최대 공격력","en":"PVPSkillMeleeMaxAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 근거리 최대 공격력 증감 옵션"},
{"id":366,"kr":"PVP 스킬 원거리 공격력","en":"PVPSkillRangedAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 원거리 공격력 증감 옵션"},
{"id":367,"kr":"PVP 스킬 원거리 최소 공격력","en":"PVPSkillRangedMinAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 원거리 최소 공격력 증감 옵션"},
{"id":368,"kr":"PVP 스킬 원거리 최대 공격력","en":"PVPSkillRangedMaxAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 원거리 최대 공격력 증감 옵션"},
{"id":369,"kr":"PVP 스킬 마법 공격력","en":"PVPSkillMagicAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 마법 공격력 증감 옵션"},
{"id":370,"kr":"PVP 스킬 마법 최소 공격력","en":"PVPSkillMagicMinAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 마법 최소 공격력 증감 옵션"},
{"id":371,"kr":"PVP 스킬 마법 최대 공격력","en":"PVPSkillMagicMaxAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 마법 최대 공격력 증감 옵션"},
{"id":375,"kr":"PVE 스킬 근거리 공격력","en":"PVESkillMeleeAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 근거리 공격력 증감 옵션"},
{"id":376,"kr":"PVE 스킬 근거리 최소 공격력","en":"PVESkillMeleeMinAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 근거리 최소 공격력 증감 옵션"},
{"id":377,"kr":"PVE 스킬 근거리 최대 공격력","en":"PVESkillMeleeMaxAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 근거리 최대 공격력 증감 옵션"},
{"id":378,"kr":"PVE 스킬 원거리 공격력","en":"PVESkillRangedAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 원거리 공격력 증감 옵션"},
{"id":379,"kr":"PVE 스킬 원거리 최소 공격력","en":"PVESkillRangedMinAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 원거리 최소 공격력 증감 옵션"},
{"id":380,"kr":"PVE 스킬 원거리 최대 공격력","en":"PVESkillRangedMaxAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 원거리 최대 공격력 증감 옵션"},
{"id":381,"kr":"PVE 스킬 마법 공격력","en":"PVESkillMagicAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 마법 공격력 증감 옵션"},
{"id":382,"kr":"PVE 스킬 마법 최소 공격력","en":"PVESkillMagicMinAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 마법 최소 공격력 증감 옵션"},
{"id":383,"kr":"PVE 스킬 마법 최대 공격력","en":"PVESkillMagicMaxAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 마법 최대 공격력 증감 옵션"},
{"id":384,"kr":"일반 공격 추가 공격력","en":"NormalExtraAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"일반 공격 추가 공격력 증감 옵션"},
{"id":385,"kr":"일반 공격 추가 최소 공격력","en":"NormalExtraMinAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"일반 공격 추가 최소 공격력 증감 옵션"},
{"id":386,"kr":"일반 공격 추가 최대 공격력","en":"NormalExtraMaxAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"일반 공격 추가 최대 공격력 증감 옵션"},
{"id":387,"kr":"일반 공격 근거리 추가 공격력","en":"NormalExtraMeleeAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"일반 공격 근거리 추가 공격력 증감 옵션"},
{"id":388,"kr":"일반 공격 근거리 추가 최소 공격력","en":"NormalExtraMeleeMinAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"일반 공격 근거리 추가 최소 공격력 증감 옵션"},
{"id":389,"kr":"일반 공격 근거리 추가 최대 공격력","en":"NormalExtraMeleeMaxAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"일반 공격 근거리 추가 최대 공격력 증감 옵션"},
{"id":390,"kr":"일반 공격 원거리 추가 공격력","en":"NormalExtraRangedAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"일반 공격 원거리 추가 공격력 증감 옵션"},
{"id":391,"kr":"일반 공격 원거리 추가 최소 공격력","en":"NormalExtraRangedMinAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"일반 공격 원거리 추가 최소 공격력 증감 옵션"},
{"id":392,"kr":"일반 공격 원거리 추가 최대 공격력","en":"NormalExtraRangedMaxAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"일반 공격 원거리 추가 최대 공격력 증감 옵션"},
{"id":393,"kr":"일반 공격 마법 추가 공격력","en":"NormalExtraMagicAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"일반 공격 마법 추가 공격력 증감 옵션"},
{"id":394,"kr":"일반 공격 마법 추가 최소 공격력","en":"NormalExtraMagicMinAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"일반 공격 마법 추가 최소 공격력 증감 옵션"},
{"id":395,"kr":"일반 공격 마법 추가 최대 공격력","en":"NormalExtraMagicMaxAttack","kind":"공격","group":"02_공격력","scope":"공통","desc":"일반 공격 마법 추가 최대 공격력 증감 옵션"},
{"id":396,"kr":"PVP 일반 공격 추가 공격력","en":"PVPNormalExtraAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격 추가 공격력 증감 옵션"},
{"id":397,"kr":"PVP 일반 공격 추가 최소 공격력","en":"PVPNormalExtraMinAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격 추가 최소 공격력 증감 옵션"},
{"id":398,"kr":"PVP 일반 공격 추가 최대 공격력","en":"PVPNormalExtraMaxAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격 추가 최대 공격력 증감 옵션"},
{"id":399,"kr":"PVP 일반 공격 근거리 추가 공격력","en":"PVPNormalExtraMeleeAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격 근거리 추가 공격력 증감 옵션"},
{"id":400,"kr":"PVP 일반 공격 근거리 추가 최소 공격력","en":"PVPNormalExtraMeleeMinAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격 근거리 추가 최소 공격력 증감 옵션"},
{"id":401,"kr":"PVP 일반 공격 근거리 추가 최대 공격력","en":"PVPNormalExtraMeleeMaxAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격 근거리 추가 최대 공격력 증감 옵션"},
{"id":402,"kr":"PVP 일반 공격 원거리 추가 공격력","en":"PVPNormalExtraRangedAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격 원거리 추가 공격력 증감 옵션"},
{"id":403,"kr":"PVP 일반 공격 원거리 추가 최소 공격력","en":"PVPNormalExtraRangedMinAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격 원거리 추가 최소 공격력 증감 옵션"},
{"id":404,"kr":"PVP 일반 공격 원거리 추가 최대 공격력","en":"PVPNormalExtraRangedMaxAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격 원거리 추가 최대 공격력 증감 옵션"},
{"id":405,"kr":"PVP 일반 공격 마법 추가 공격력","en":"PVPNormalExtraMagicAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격 마법 추가 공격력 증감 옵션"},
{"id":406,"kr":"PVP 일반 공격 마법 추가 최소 공격력","en":"PVPNormalExtraMagicMinAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격 마법 추가 최소 공격력 증감 옵션"},
{"id":407,"kr":"PVP 일반 공격 마법 추가 최대 공격력","en":"PVPNormalExtraMagicMaxAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 일반 공격 마법 추가 최대 공격력 증감 옵션"},
{"id":408,"kr":"PVE 일반 공격 추가 공격력","en":"PVENormalExtraAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격 추가 공격력 증감 옵션"},
{"id":409,"kr":"PVE 일반 공격 추가 최소 공격력","en":"PVENormalExtraMinAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격 추가 최소 공격력 증감 옵션"},
{"id":410,"kr":"PVE 일반 공격 추가 최대 공격력","en":"PVENormalExtraMaxAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격 추가 최대 공격력 증감 옵션"},
{"id":411,"kr":"PVE 일반 공격 근거리 추가 공격력","en":"PVENormalExtraMeleeAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격 근거리 추가 공격력 증감 옵션"},
{"id":412,"kr":"PVE 일반 공격 근거리 추가 최소 공격력","en":"PVENormalExtraMeleeMinAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격 근거리 추가 최소 공격력 증감 옵션"},
{"id":413,"kr":"PVE 일반 공격 근거리 추가 최대 공격력","en":"PVENormalExtraMeleeMaxAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격 근거리 추가 최대 공격력 증감 옵션"},
{"id":414,"kr":"PVE 일반 공격 원거리 추가 공격력","en":"PVENormalExtraRangedAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격 원거리 추가 공격력 증감 옵션"},
{"id":415,"kr":"PVE 일반 공격 원거리 추가 최소 공격력","en":"PVENormalExtraRangedMinAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격 원거리 추가 최소 공격력 증감 옵션"},
{"id":416,"kr":"PVE 일반 공격 원거리 추가 최대 공격력","en":"PVENormalExtraRangedMaxAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격 원거리 추가 최대 공격력 증감 옵션"},
{"id":417,"kr":"PVE 일반 공격 마법 추가 공격력","en":"PVENormalExtraMagicAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격 마법 추가 공격력 증감 옵션"},
{"id":418,"kr":"PVE 일반 공격 마법 추가 최소 공격력","en":"PVENormalExtraMagicMinAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격 마법 추가 최소 공격력 증감 옵션"},
{"id":419,"kr":"PVE 일반 공격 마법 추가 최대 공격력","en":"PVENormalExtraMagicMaxAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 일반 공격 마법 추가 최대 공격력 증감 옵션"},
{"id":420,"kr":"스킬 추가 공격력","en":"SkillExtraAttack","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 추가 공격력 증감 옵션"},
{"id":421,"kr":"스킬 추가 최소 공격력","en":"SkillExtraMinAttack","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 추가 최소 공격력 증감 옵션"},
{"id":422,"kr":"스킬 추가 최대 공격력","en":"SkillExtraMaxAttack","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 추가 최대 공격력 증감 옵션"},
{"id":423,"kr":"스킬 근거리 추가 공격력","en":"SkillExtraMeleeAttack","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 근거리 추가 공격력 증감 옵션"},
{"id":424,"kr":"스킬 근거리 추가 최소 공격력","en":"SkillExtraMeleeMinAttack","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 근거리 추가 최소 공격력 증감 옵션"},
{"id":425,"kr":"스킬 근거리 추가 최대 공격력","en":"SkillExtraMeleeMaxAttack","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 근거리 추가 최대 공격력 증감 옵션"},
{"id":426,"kr":"스킬 원거리 추가 공격력","en":"SkillExtraRangedAttack","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 원거리 추가 공격력 증감 옵션"},
{"id":427,"kr":"스킬 원거리 추가 최소 공격력","en":"SkillExtraRangedMinAttack","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 원거리 추가 최소 공격력 증감 옵션"},
{"id":428,"kr":"스킬 원거리 추가 최대 공격력","en":"SkillExtraRangedMaxAttack","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 원거리 추가 최대 공격력 증감 옵션"},
{"id":429,"kr":"스킬 마법 추가 공격력","en":"SkillExtraMagicAttack","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 마법 추가 공격력 증감 옵션"},
{"id":430,"kr":"스킬 마법 추가 최소 공격력","en":"SkillExtraMagicMinAttack","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 마법 추가 최소 공격력 증감 옵션"},
{"id":431,"kr":"스킬 마법 추가 최대 공격력","en":"SkillExtraMagicMaxAttack","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 마법 추가 최대 공격력 증감 옵션"},
{"id":432,"kr":"PVP 스킬 추가 공격력","en":"PVPSkillExtraAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 추가 공격력 증감 옵션"},
{"id":433,"kr":"PVP 스킬 추가 최소 공격력","en":"PVPSkillExtraMinAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 추가 최소 공격력 증감 옵션"},
{"id":434,"kr":"PVP 스킬 추가 최대 공격력","en":"PVPSkillExtraMaxAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 추가 최대 공격력 증감 옵션"},
{"id":435,"kr":"PVP 스킬 근거리 추가 공격력","en":"PVPSkillExtraMeleeAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 근거리 추가 공격력 증감 옵션"},
{"id":436,"kr":"PVP 스킬 근거리 추가 최소 공격력","en":"PVPSkillExtraMeleeMinAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 근거리 추가 최소 공격력 증감 옵션"},
{"id":437,"kr":"PVP 스킬 근거리 추가 최대 공격력","en":"PVPSkillExtraMeleeMaxAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 근거리 추가 최대 공격력 증감 옵션"},
{"id":438,"kr":"PVP 스킬 원거리 추가 공격력","en":"PVPSkillExtraRangedAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 원거리 추가 공격력 증감 옵션"},
{"id":439,"kr":"PVP 스킬 원거리 추가 최소 공격력","en":"PVPSkillExtraRangedMinAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 원거리 추가 최소 공격력 증감 옵션"},
{"id":440,"kr":"PVP 스킬 원거리 추가 최대 공격력","en":"PVPSkillExtraRangedMaxAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 원거리 추가 최대 공격력 증감 옵션"},
{"id":441,"kr":"PVP 스킬 마법 추가 공격력","en":"PVPSkillExtraMagicAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 마법 추가 공격력 증감 옵션"},
{"id":442,"kr":"PVP 스킬 마법 추가 최소 공격력","en":"PVPSkillExtraMagicMinAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 마법 추가 최소 공격력 증감 옵션"},
{"id":443,"kr":"PVP 스킬 마법 추가 최대 공격력","en":"PVPSkillExtraMagicMaxAttack","kind":"공격","group":"05_PVP 공격력","scope":"PVP","desc":"PVP 스킬 마법 추가 최대 공격력 증감 옵션"},
{"id":444,"kr":"PVE 스킬 추가 공격력","en":"PVESkillExtraAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 추가 공격력 증감 옵션"},
{"id":445,"kr":"PVE 스킬 추가 최소 공격력","en":"PVESkillExtraMinAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 추가 최소 공격력 증감 옵션"},
{"id":446,"kr":"PVE 스킬 추가 최대 공격력","en":"PVESkillExtraMaxAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 추가 최대 공격력 증감 옵션"},
{"id":447,"kr":"PVE 스킬 근거리 추가 공격력","en":"PVESkillExtraMeleeAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 근거리 추가 공격력 증감 옵션"},
{"id":448,"kr":"PVE 스킬 근거리 추가 최소 공격력","en":"PVESkillExtraMeleeMinAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 근거리 추가 최소 공격력 증감 옵션"},
{"id":449,"kr":"PVE 스킬 근거리 추가 최대 공격력","en":"PVESkillExtraMeleeMaxAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 근거리 추가 최대 공격력 증감 옵션"},
{"id":450,"kr":"PVE 스킬 원거리 추가 공격력","en":"PVESkillExtraRangedAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 원거리 추가 공격력 증감 옵션"},
{"id":451,"kr":"PVE 스킬 원거리 추가 최소 공격력","en":"PVESkillExtraRangedMinAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 원거리 추가 최소 공격력 증감 옵션"},
{"id":452,"kr":"PVE 스킬 원거리 추가 최대 공격력","en":"PVESkillExtraRangedMaxAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 원거리 추가 최대 공격력 증감 옵션"},
{"id":453,"kr":"PVE 스킬 마법 추가 공격력","en":"PVESkillExtraMagicAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 마법 추가 공격력 증감 옵션"},
{"id":454,"kr":"PVE 스킬 마법 추가 최소 공격력","en":"PVESkillExtraMagicMinAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 마법 추가 최소 공격력 증감 옵션"},
{"id":455,"kr":"PVE 스킬 마법 추가 최대 공격력","en":"PVESkillExtraMagicMaxAttack","kind":"공격","group":"02_PVE 공격력","scope":"PVE","desc":"PVE 스킬 마법 추가 최대 공격력 증감 옵션"},
{"id":456,"kr":"PVE 대미지 리덕션","en":"PVEDamageReduction","kind":"방어","group":"04_대미지 리덕션","scope":"PVE","desc":"PVE 대미지 리덕션 증감 옵션"},
{"id":457,"kr":"PVE 근거리 대미지 리덕션","en":"PVEMeleeDamageReduction","kind":"방어","group":"04_대미지 리덕션","scope":"PVE","desc":"PVE 근거리 대미지 리덕션 증감 옵션"},
{"id":458,"kr":"PVE 원거리 대미지 리덕션","en":"PVERangedDamageReduction","kind":"방어","group":"04_대미지 리덕션","scope":"PVE","desc":"PVE 원거리 대미지 리덕션 증감 옵션"},
{"id":459,"kr":"PVE 마법 대미지 리덕션","en":"PVEMagicDamageReduction","kind":"방어","group":"04_대미지 리덕션","scope":"PVE","desc":"PVE 마법 대미지 리덕션 증감 옵션"},
{"id":460,"kr":"PVE 대미지 리덕션 무시","en":"PVEDamageReductionIgnore","kind":"공격","group":"06_PVE 피해감소 무시","scope":"PVE","desc":"PVE 대미지 리덕션 무시 증감 옵션"},
{"id":461,"kr":"PVE 근거리 대미지 리덕션 무시","en":"PVEMeleeDamageReductionIgnore","kind":"공격","group":"06_PVE 피해감소 무시","scope":"PVE","desc":"PVE 근거리 대미지 리덕션 무시 증감 옵션"},
{"id":462,"kr":"PVE 원거리 대미지 리덕션 무시","en":"PVERangedDamageReductionIgnore","kind":"공격","group":"06_PVE 피해감소 무시","scope":"PVE","desc":"PVE 원거리 대미지 리덕션 무시 증감 옵션"},
{"id":463,"kr":"PVE 마법 대미지 리덕션 무시","en":"PVEMagicDamageReductionIgnore","kind":"공격","group":"06_PVE 피해감소 무시","scope":"PVE","desc":"PVE 마법 대미지 리덕션 무시 증감 옵션"},
{"id":470,"kr":"받는 피해 증가","en":"DamageIncreaseRate","kind":"공격","group":"10_받는 피해 증가","scope":"공통","desc":"받는 피해 증가 옵션"},
{"id":471,"kr":"받는 근거리 피해 증가","en":"MeleeDamageIncreaseRate","kind":"공격","group":"10_받는 피해 증가","scope":"공통","desc":"받는 근거리 피해 증가 옵션"},
{"id":472,"kr":"받는 원거리 피해 증가","en":"RangedDamageIncreaseRate","kind":"공격","group":"10_받는 피해 증가","scope":"공통","desc":"받는 원거리 피해 증가 옵션"},
{"id":473,"kr":"받는 마법 피해 증가","en":"MagicDamageIncreaseRate","kind":"공격","group":"10_받는 피해 증가","scope":"공통","desc":"받는 마법 피해 증가 옵션"},
{"id":474,"kr":"PVP 받는 피해 증가","en":"PVPDamageIncreaseRate","kind":"공격","group":"10_받는 피해 증가","scope":"PVP","desc":"PVP 받는 피해 증가 옵션"},
{"id":475,"kr":"PVP 받는 근거리 피해 증가","en":"PVPMeleeDamageIncreaseRate","kind":"공격","group":"10_받는 피해 증가","scope":"PVP","desc":"PVP 받는 근거리 피해 증가 옵션"},
{"id":476,"kr":"PVP 받는 원거리 피해 증가","en":"PVPRangedDamageIncreaseRate","kind":"공격","group":"10_받는 피해 증가","scope":"PVP","desc":"PVP 받는 원거리 피해 증가 옵션"},
{"id":477,"kr":"PVP 받는 마법 피해 증가","en":"PVPMagicDamageIncreaseRate","kind":"공격","group":"10_받는 피해 증가","scope":"PVP","desc":"PVP 받는 마법 피해 증가 옵션"},
{"id":478,"kr":"PVE 받는 피해 증가","en":"PVEDamageIncreaseRate","kind":"공격","group":"10_받는 피해 증가","scope":"PVE","desc":"PVE 받는 피해 증가 옵션"},
{"id":479,"kr":"PVE 받는 근거리 피해 증가","en":"PVEMeleeDamageIncreaseRate","kind":"공격","group":"10_받는 피해 증가","scope":"PVE","desc":"PVE 받는 근거리 피해 증가 옵션"},
{"id":480,"kr":"PVE 받는 원거리 피해 증가","en":"PVERangedDamageIncreaseRate","kind":"공격","group":"10_받는 피해 증가","scope":"PVE","desc":"PVE 받는 원거리 피해 증가 옵션"},
{"id":481,"kr":"PVE 받는 마법 피해 증가","en":"PVEMagicDamageIncreaseRate","kind":"공격","group":"10_받는 피해 증가","scope":"PVE","desc":"PVE 받는 마법 피해 증가 옵션"},
{"id":484,"kr":"일반 공격 사거리","en":"NormalAttackTargetRange","kind":"기타","group":"06_전투 보조","scope":"공통","desc":"일반 공격 사거리 증감 옵션"},
{"id":485,"kr":"일반 공격 사거리 변화율","en":"NormalAttackTargetRangeRate","kind":"기타","group":"06_전투 보조","scope":"공통","desc":"일반 공격 사거리 변화율 증감 옵션"},
{"id":486,"kr":"스킬 사거리","en":"SkillTargetRange","kind":"기타","group":"06_전투 보조","scope":"공통","desc":"스킬 사거리 증감 옵션"},
{"id":487,"kr":"스킬 사거리 변화율","en":"SkillTargetRangeRate","kind":"기타","group":"06_전투 보조","scope":"공통","desc":"스킬 사거리 변화율 증감 옵션"},
{"id":490,"kr":"최대 공격력 증폭","en":"MaxAttackAmplifyRate","kind":"공격","group":"02_공격력","scope":"공통","desc":"최대 공격력을 추가로 증폭(%)시키는 옵션"},
{"id":491,"kr":"치명타 공격력 증폭","en":"AtCriticalAttackAmplifyRate","kind":"공격","group":"03_치명타 공격력","scope":"공통","desc":"치명타 공격력을 추가로 증폭(%)시키는 옵션"},
{"id":492,"kr":"스킬 최대 공격력 증폭","en":"SkillMaxAttackAmplifyRate","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 최대 공격력을 추가로 증폭(%)시키는 옵션"},
{"id":493,"kr":"모든 방어력 관통 증폭","en":"TargetAllDefenseAmplifyRate","kind":"공격","group":"05_방어 관통","scope":"공통","desc":"모든 방어력 관통을 증폭(%)시키는 옵션"},
{"id":496,"kr":"대미지 리덕션 증폭","en":"DamageReductionAmplifyRate","kind":"방어","group":"04_대미지 리덕션","scope":"공통","desc":"대미지 리덕션을 추가로 증폭(%)시키는 옵션"},
{"id":497,"kr":"명중 증폭","en":"AccuracyAmplifyRate","kind":"공격","group":"04_명중","scope":"공통","desc":"명중을 추가로 증폭(%)시키는 옵션"},
{"id":501,"kr":"모든 몬스터 타입 추가 공격력","en":"AllMonsterTypeExtraAttack","kind":"공격","group":"09_보스/특수 대상","scope":"공통","desc":"모든 몬스터 타입 추가 공격력 증감 옵션"},
{"id":502,"kr":"모든 몬스터 타입 추가 방어력","en":"AllMonsterTypeExtraDefense","kind":"방어","group":"07_보스 방어","scope":"공통","desc":"모든 몬스터 타입 추가 방어력 증감 옵션"},
{"id":505,"kr":"PVP 질병 적중","en":"PVPDiseaseHit","kind":"공격","group":"08_상태이상 적중","scope":"PVP","desc":"PVP 질병 적중 증감 옵션"},
{"id":506,"kr":"PVE 질병 적중","en":"PVEDiseaseHit","kind":"공격","group":"08_상태이상 적중","scope":"PVE","desc":"PVE 질병 적중 증감 옵션"},
{"id":508,"kr":"PVP 질병 저항","en":"PVPDiseaseResist","kind":"방어","group":"06_상태이상 저항","scope":"PVP","desc":"PVP 질병 저항 증감 옵션"},
{"id":509,"kr":"PVE 질병 저항","en":"PVEDiseaseResist","kind":"방어","group":"06_상태이상 저항","scope":"PVE","desc":"PVE 질병 저항 증감 옵션"},
{"id":510,"kr":"디버프(방어력 감소) 적중","en":"DebuffDefenseHit","kind":"공격","group":"08_상태이상 적중","scope":"공통","desc":"디버프(방어력 감소) 적중 = 취약 적중 증감 옵션"},
{"id":511,"kr":"PVP 디버프(방어력 감소) 적중","en":"PVPDebuffDefenseHit","kind":"공격","group":"08_상태이상 적중","scope":"PVP","desc":"PVP 디버프(방어력 감소) 적중 = PVP 취약 적중 증감 옵션"},
{"id":512,"kr":"PVE 디버프(방어력 감소) 적중","en":"PVEDebuffDefenseHit","kind":"공격","group":"08_상태이상 적중","scope":"PVE","desc":"PVE 디버프(방어력 감소) 적중 = PVE 취약 적중 증감 옵션"},
{"id":513,"kr":"디버프(방어력 감소) 저항","en":"DebuffDefenseResist","kind":"방어","group":"06_상태이상 저항","scope":"공통","desc":"디버프(방어력 감소) 저항 = 취약 저항 증감 옵션"},
{"id":514,"kr":"PVP 디버프(방어력 감소) 저항","en":"PVPDebuffDefenseResist","kind":"방어","group":"06_상태이상 저항","scope":"PVP","desc":"PVP 디버프(방어력 감소) 저항 = PVP 취약 저항 증감 옵션"},
{"id":515,"kr":"PVE 디버프(방어력 감소) 저항","en":"PVEDebuffDefenseResist","kind":"방어","group":"06_상태이상 저항","scope":"PVE","desc":"PVE 디버프(방어력 감소) 저항 = PVE 취약 저항 증감 옵션"},
{"id":526,"kr":"공격력 약화","en":"AttackWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"공격력을 약화(%)시키는 옵션"},
{"id":527,"kr":"근거리 공격력 약화","en":"MeleeAttackWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"근거리 공격력을 약화(%)시키는 옵션"},
{"id":528,"kr":"원거리 공격력 약화","en":"RangedAttackWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"원거리 공격력을 약화(%)시키는 옵션"},
{"id":529,"kr":"마법 공격력 약화","en":"MagicAttackWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"마법 공격력을 약화(%)시키는 옵션"},
{"id":530,"kr":"근거리 최대 공격력 증폭","en":"MeleeMaxAttackAmplifyRate","kind":"공격","group":"02_공격력","scope":"공통","desc":"근거리 최대 공격력을 추가로 증폭(%)시키는 옵션"},
{"id":531,"kr":"원거리 최대 공격력 증폭","en":"RangedMaxAttackAmplifyRate","kind":"공격","group":"02_공격력","scope":"공통","desc":"원거리 최대 공격력을 추가로 증폭(%)시키는 옵션"},
{"id":532,"kr":"마법 최대 공격력 증폭","en":"MagicMaxAttackAmplifyRate","kind":"공격","group":"02_공격력","scope":"공통","desc":"마법 최대 공격력을 추가로 증폭(%)시키는 옵션"},
{"id":533,"kr":"치명타 근거리 공격력 증폭","en":"AtCriticalMeleeAttackAmplifyRate","kind":"공격","group":"03_치명타 공격력","scope":"공통","desc":"치명타 근거리 공격력을 추가로 증폭(%)시키는 옵션"},
{"id":534,"kr":"치명타 원거리 공격력 증폭","en":"AtCriticalRangedAttackAmplifyRate","kind":"공격","group":"03_치명타 공격력","scope":"공통","desc":"치명타 원거리 공격력을 추가로 증폭(%)시키는 옵션"},
{"id":535,"kr":"치명타 마법 공격력 증폭","en":"AtCriticalMagicAttackAmplifyRate","kind":"공격","group":"03_치명타 공격력","scope":"공통","desc":"치명타 마법 공격력을 추가로 증폭(%)시키는 옵션"},
{"id":536,"kr":"치명타 공격력 약화","en":"AtCriticalAttackWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"치명타 공격력을 약화(%)시키는 옵션"},
{"id":537,"kr":"치명타 근거리 공격력 약화","en":"AtCriticalMeleeAttackWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"치명타 근거리 공격력을 약화(%)시키는 옵션"},
{"id":538,"kr":"치명타 원거리 공격력 약화","en":"AtCriticalRangedAttackWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"치명타 원거리 공격력을 약화(%)시키는 옵션"},
{"id":539,"kr":"치명타 마법 공격력 약화","en":"AtCriticalMagicAttackWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"치명타 마법 공격력을 약화(%)시키는 옵션"},
{"id":540,"kr":"근거리 명중 증폭","en":"MeleeAccuracyAmplifyRate","kind":"공격","group":"04_명중","scope":"공통","desc":"근거리 명중을 증폭(%)시키는 옵션"},
{"id":541,"kr":"원거리 명중 증폭","en":"RangedAccuracyAmplifyRate","kind":"공격","group":"04_명중","scope":"공통","desc":"원거리 명중을 증폭(%)시키는 옵션"},
{"id":542,"kr":"마법 명중 증폭","en":"MagicAccuracyAmplifyRate","kind":"공격","group":"04_명중","scope":"공통","desc":"마법 명중을 증폭(%)시키는 옵션"},
{"id":543,"kr":"명중 약화","en":"AccuracyWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"명중을 약화(%)시키는 옵션"},
{"id":544,"kr":"근거리 명중 약화","en":"MeleeAccuracyWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"근거리 명중을 약화(%)시키는 옵션"},
{"id":545,"kr":"원거리 명중 약화","en":"RangedAccuracyWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"원거리 명중을 약화(%)시키는 옵션"},
{"id":546,"kr":"마법 명중 약화","en":"MagicAccuracyWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"마법 명중을 약화(%)시키는 옵션"},
{"id":547,"kr":"물리 방어력 관통 증폭","en":"TargetPhysicalDefenseAmplifyRate","kind":"공격","group":"05_방어 관통","scope":"공통","desc":"물리 방어력 관통을 증폭(%)시키는 옵션"},
{"id":548,"kr":"마법 방어력 관통 증폭","en":"TargetMagicDefenseAmplifyRate","kind":"공격","group":"05_방어 관통","scope":"공통","desc":"마법 방어력 관통을 증폭(%)시키는 옵션"},
{"id":549,"kr":"모든 방어력 관통 약화","en":"TargetAllDefenseWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"모든 방어력 관통을 약화(%)시키는 옵션"},
{"id":550,"kr":"물리 방어력 관통 약화","en":"TargetPhysicalDefenseWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"물리 방어력 관통을 약화(%)시키는 옵션"},
{"id":551,"kr":"마법 방어력 관통 약화","en":"TargetMagicDefenseWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"마법 방어력 관통을 약화(%)시키는 옵션"},
{"id":563,"kr":"치명타 약화","en":"CriticalWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"치명타를 약화(%)시키는 옵션"},
{"id":564,"kr":"근거리 치명타 약화","en":"MeleeCriticalWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"근거리 치명타를 약화(%)시키는 옵션"},
{"id":565,"kr":"원거리 치명타 약화","en":"RangedCriticalWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"원거리 치명타를 약화(%)시키는 옵션"},
{"id":566,"kr":"마법 치명타 약화","en":"MagicCriticalWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"마법 치명타를 약화(%)시키는 옵션"},
{"id":571,"kr":"근거리 대미지 리덕션 증폭","en":"MeleeDamageReductionAmplifyRate","kind":"방어","group":"04_대미지 리덕션","scope":"공통","desc":"근거리 대미지 리덕션을 증폭(%)시키는 옵션"},
{"id":572,"kr":"원거리 대미지 리덕션 증폭","en":"RangedDamageReductionAmplifyRate","kind":"방어","group":"04_대미지 리덕션","scope":"공통","desc":"원거리 대미지 리덕션을 증폭(%)시키는 옵션"},
{"id":573,"kr":"마법 대미지 리덕션 증폭","en":"MagicDamageReductionAmplifyRate","kind":"방어","group":"04_대미지 리덕션","scope":"공통","desc":"마법 대미지 리덕션을 증폭(%)시키는 옵션"},
{"id":574,"kr":"대미지 리덕션 약화","en":"DamageReductionWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"대미지 리덕션을 약화(%)시키는 옵션"},
{"id":575,"kr":"근거리 대미지 리덕션 약화","en":"MeleeDamageReductionWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"근거리 대미지 리덕션을 약화(%)시키는 옵션"},
{"id":576,"kr":"원거리 대미지 리덕션 약화","en":"RangedDamageReductionWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"원거리 대미지 리덕션을 약화(%)시키는 옵션"},
{"id":577,"kr":"마법 대미지 리덕션 약화","en":"MagicDamageReductionWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"마법 대미지 리덕션을 약화(%)시키는 옵션"},
{"id":578,"kr":"대미지 리덕션 무시 증폭","en":"DamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_피해감소 무시","scope":"공통","desc":"대미지 리덕션 무시를 증폭(%)시키는 옵션"},
{"id":579,"kr":"근거리 대미지 리덕션 무시 증폭","en":"MeleeDamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_피해감소 무시","scope":"공통","desc":"근거리 대미지 리덕션 무시를 증폭(%)시키는 옵션"},
{"id":580,"kr":"원거리 대미지 리덕션 무시 증폭","en":"RangedDamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_피해감소 무시","scope":"공통","desc":"원거리 대미지 리덕션 무시를 증폭(%)시키는 옵션"},
{"id":581,"kr":"마법 대미지 리덕션 무시 증폭","en":"MagicDamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_피해감소 무시","scope":"공통","desc":"마법 대미지 리덕션 무시를 증폭(%)시키는 옵션"},
{"id":582,"kr":"대미지 리덕션 무시 약화","en":"DamageReductionIgnoreWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"대미지 리덕션 무시를 약화(%)시키는 옵션"},
{"id":583,"kr":"근거리 대미지 리덕션 무시 약화","en":"MeleeDamageReductionIgnoreWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"근거리 대미지 리덕션 무시를 약화(%)시키는 옵션"},
{"id":584,"kr":"원거리 대미지 리덕션 무시 약화","en":"RangedDamageReductionIgnoreWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"원거리 대미지 리덕션 무시를 약화(%)시키는 옵션"},
{"id":585,"kr":"마법 대미지 리덕션 무시 약화","en":"MagicDamageReductionIgnoreWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"마법 대미지 리덕션 무시를 약화(%)시키는 옵션"},
{"id":586,"kr":"받는 피해 감소 약화","en":"DamageReductionRateWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"받는 피해 감소를 약화(%)시키는 옵션"},
{"id":587,"kr":"받는 근거리 피해 감소 약화","en":"MeleeDamageReductionRateWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"받는 근거리 피해 감소를 약화(%)시키는 옵션"},
{"id":588,"kr":"받는 원거리 피해 감소 약화","en":"RangedDamageReductionRateWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"받는 원거리 피해 감소를 약화(%)시키는 옵션"},
{"id":589,"kr":"받는 마법 피해 감소 약화","en":"MagicDamageReductionRateWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"받는 마법 피해 감소를 약화(%)시키는 옵션"},
{"id":591,"kr":"스킬 피해 감소 무시 증폭","en":"SkillDamageReductionIgnoreAmplifyRate","kind":"공격","group":"06_피해감소 무시","scope":"공통","desc":"스킬 피해 감소 무시를 증폭(%)시키는 옵션"},
{"id":593,"kr":"스킬 피해 감소 무시 약화","en":"SkillDamageReductionIgnoreWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"스킬 피해 감소 무시를 약화(%)시키는 옵션"},
{"id":597,"kr":"HP 자연 회복 증폭","en":"HealthRegenPointAmplifyRate","kind":"기타","group":"04_회복","scope":"공통","desc":"HP 자연 회복을 증폭(%)시키는 옵션"},
{"id":598,"kr":"HP 고정 회복 증폭","en":"HealthRegenFixedPointAmplifyRate","kind":"기타","group":"04_회복","scope":"공통","desc":"HP 고정 회복을 증폭(%)시키는 옵션"},
{"id":599,"kr":"HP 자연 회복 약화","en":"HealthRegenPointWeakenRate","kind":"기타","group":"Z_약화","scope":"공통","desc":"HP 자연 회복을 약화(%)시키는 옵션"},
{"id":600,"kr":"HP 고정 회복 약화","en":"HealthRegenFixedPointWeakenRate","kind":"기타","group":"Z_약화","scope":"공통","desc":"HP 고정 회복을 약화(%)시키는 옵션"},
{"id":601,"kr":"MP 자연 회복 증폭","en":"ManaRegenPointAmplifyRate","kind":"기타","group":"04_회복","scope":"공통","desc":"MP 자연 회복을 증폭(%)시키는 옵션"},
{"id":602,"kr":"MP 고정 회복 증폭","en":"ManaRegenFixedPointAmplifyRate","kind":"기타","group":"04_회복","scope":"공통","desc":"MP 고정 회복을 증폭(%)시키는 옵션"},
{"id":603,"kr":"MP 자연 회복 약화","en":"ManaRegenPointWeakenRate","kind":"기타","group":"Z_약화","scope":"공통","desc":"MP 자연 회복을 약화(%)시키는 옵션"},
{"id":604,"kr":"MP 고정 회복 약화","en":"ManaRegenFixedPointWeakenRate","kind":"기타","group":"Z_약화","scope":"공통","desc":"MP 고정 회복을 약화(%)시키는 옵션"},
{"id":605,"kr":"물약 회복량 증폭","en":"PotionRecoveryPointAmplifyRate","kind":"기타","group":"04_회복","scope":"공통","desc":"물약 회복량을 증폭(%)시키는 옵션"},
{"id":606,"kr":"물약 회복량 약화","en":"PotionRecoveryPointWeakenRate","kind":"기타","group":"Z_약화","scope":"공통","desc":"물약 회복량을 약화(%)시키는 옵션"},
{"id":607,"kr":"스킬 공격력 증폭","en":"SkillAttackAmplifyRate","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 공격력을 증폭(%)시키는 옵션"},
{"id":608,"kr":"스킬 공격력 약화","en":"SkillAttackWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"스킬 공격력을 약화(%)시키는 옵션"},
{"id":609,"kr":"상태이상 적중 약화","en":"AbnormalHitWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"상태이상 적중을 약화(%)시키는 옵션"},
{"id":610,"kr":"디버프 적중 약화","en":"DebuffHitWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"디버프 적중을 약화(%)시키는 옵션"},
{"id":613,"kr":"수면 적중 약화","en":"SleepHitWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"수면 적중을 약화(%)시키는 옵션"},
{"id":622,"kr":"디버프(방어력 감소) 적중 약화","en":"DebuffDefenseHitWeakenRate","kind":"공격","group":"Z_약화","scope":"공통","desc":"디버프(방어력 감소) 적중을 약화(%)시키는 옵션"},
{"id":623,"kr":"상태이상 저항 약화","en":"AbnormalResistWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"상태이상 저항을 약화(%)시키는 옵션"},
{"id":624,"kr":"디버프 저항 약화","en":"DebuffResistWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"디버프 저항을 약화(%)시키는 옵션"},
{"id":627,"kr":"수면 저항 약화","en":"SleepResistWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"수면 저항을 약화(%)시키는 옵션"},
{"id":636,"kr":"디버프(방어력 감소) 저항 약화","en":"DebuffDefenseResistWeakenRate","kind":"방어","group":"Z_약화","scope":"공통","desc":"디버프(방어력 감소) 저항을 약화(%)시키는 옵션"},
{"id":637,"kr":"몬스터 추가 공격력 증폭","en":"MonsterExtraAttackAmplifyRate","kind":"공격","group":"09_보스/특수 대상","scope":"공통","desc":"몬스터 추가 공격력을 증폭(%)시키는 옵션"},
{"id":640,"kr":"몬스터 추가 방어력 증폭","en":"MonsterExtraDefenseAmplifyRate","kind":"방어","group":"07_보스 방어","scope":"공통","desc":"몬스터 추가 방어력을 증폭(%)시키는 옵션"},
{"id":643,"kr":"모든 방어력 관통","en":"TargetAllDefense","kind":"공격","group":"05_방어 관통","scope":"공통","desc":"모든 방어력 관통(=모든 방어력 감소) 증감 옵션"},
{"id":73,"kr":"스킬 공격력","en":"SkillAttack","kind":"공격","group":"11_스킬 공격력","scope":"공통","desc":"스킬 공격력 증감 옵션"},
{"id":464,"kr":"PVE 스킬 피해 감소","en":"PVESkillDamageReduction","kind":"방어","group":"05_피해 감소","scope":"PVE","desc":"PVE 스킬 피해 감소 증감 옵션"},
{"id":9000,"kr":"전투력(스탯)","en":"StatCombatPower","kind":"특수","group":"06_전투 보조","scope":"공통","desc":"002 합산공식 보조 변수 — 스탯 기반 전투력 합산값"},
{"id":9001,"kr":"전투력(스킬)","en":"SkillCombatPowerRate","kind":"특수","group":"06_전투 보조","scope":"공통","desc":"002 합산공식 보조 변수 — 스킬 기반 전투력 비율"},
{"id":9999,"kr":"세트 옵션","en":"SetOption","kind":"특수","group":"Z_미분류","scope":"공통","desc":"세트 옵션"}
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

    // ── 공격력 (증폭 반영 — 개별 옵션 증폭 + 타입별 증폭 + 공통 증폭) ──────
    // 합산 키:
    //   - 기본: 일반 키(MeleeMinAttack) + PVE 전용 키(PVEMeleeMinAttack, STR 치환 대상)
    //   - 장신구 일반 공격력(PVENormalAttack), 스킬 공격력(PVESkillAttack)도 동일 공격력에 가산
    //   - PVE 일반 공격력(PVEAttack), 유형별 PVE 공격력(PVEMeleeAttack/PVERangedAttack/PVEMagicAttack)도 합산
    //   - PVENormalAttackAmplifyRate / PVESkillAttackAmplifyRate / PVEAttackAmplifyRate /
    //     PVEMeleeAttackAmplifyRate / PVERangedAttackAmplifyRate / PVEMagicAttackAmplifyRate
    //     각 옵션별 개별 증폭 후 합산 → 최종에 MeleeAttackPct로 일괄 증폭
    const ampPVENormalAtk = 1 + B('PVENormalAttackAmplifyRate') / 10000;
    const ampPVESkillAtk  = 1 + B('PVESkillAttackAmplifyRate')  / 10000;
    const ampPVEAtk       = 1 + B('PVEAttackAmplifyRate')       / 10000;
    const ampPVEMeleeAtk  = 1 + B('PVEMeleeAttackAmplifyRate')  / 10000;
    const ampPVERangedAtk = 1 + B('PVERangedAttackAmplifyRate') / 10000;
    const ampPVEMagicAtk  = 1 + B('PVEMagicAttackAmplifyRate')  / 10000;

    const MeleeMinAttack  = Math.floor((B('MeleeMinAttack')  + B('PVEMeleeMinAttack')
        + B('PVENormalAttack') * ampPVENormalAtk
        + B('PVESkillAttack')  * ampPVESkillAtk
        + B('PVEAttack')       * ampPVEAtk
        + B('PVEMeleeAttack')  * ampPVEMeleeAtk)
        * (1 + B('MeleeAttackPct')  / 10000));
    const MeleeMaxAttack  = Math.floor((B('MeleeMaxAttack')  + B('PVEMeleeMaxAttack')
        + B('PVENormalAttack') * ampPVENormalAtk
        + B('PVESkillAttack')  * ampPVESkillAtk
        + B('PVEAttack')       * ampPVEAtk
        + B('PVEMeleeAttack')  * ampPVEMeleeAtk)
        * (1 + B('MeleeAttackPct')  / 10000));
    const RangedMinAttack = Math.floor((B('RangedMinAttack') + B('PVERangedMinAttack')
        + B('PVENormalAttack') * ampPVENormalAtk
        + B('PVESkillAttack')  * ampPVESkillAtk
        + B('PVEAttack')       * ampPVEAtk
        + B('PVERangedAttack') * ampPVERangedAtk)
        * (1 + B('RangedAttackPct') / 10000));
    const RangedMaxAttack = Math.floor((B('RangedMaxAttack') + B('PVERangedMaxAttack')
        + B('PVENormalAttack') * ampPVENormalAtk
        + B('PVESkillAttack')  * ampPVESkillAtk
        + B('PVEAttack')       * ampPVEAtk
        + B('PVERangedAttack') * ampPVERangedAtk)
        * (1 + B('RangedAttackPct') / 10000));
    const MagicMinAttack  = Math.floor((B('MagicMinAttack')  + B('PVEMagicMinAttack')
        + B('PVENormalAttack') * ampPVENormalAtk
        + B('PVESkillAttack')  * ampPVESkillAtk
        + B('PVEAttack')       * ampPVEAtk
        + B('PVEMagicAttack')  * ampPVEMagicAtk)
        * (1 + B('MagicAttackPct')  / 10000));
    const MagicMaxAttack  = Math.floor((B('MagicMaxAttack')  + B('PVEMagicMaxAttack')
        + B('PVENormalAttack') * ampPVENormalAtk
        + B('PVESkillAttack')  * ampPVESkillAtk
        + B('PVEAttack')       * ampPVEAtk
        + B('PVEMagicAttack')  * ampPVEMagicAtk)
        * (1 + B('MagicAttackPct')  / 10000));

    // ── 방어력 (개별 증폭 + 모든 방어력 증폭 공통 가산) ────────────────────
    const allDefAmp = B('AllDefenseAmplifyRate') / 10000;
    const MeleeDefense  = Math.floor(B('PhysicalDefense') * (1 + B('PhysicalDefenseAmplifyRate') / 10000 + allDefAmp));
    const RangedDefense = Math.floor(B('RangedDefense')   * (1 + B('RangedDefenseAmplifyRate')   / 10000 + allDefAmp));
    const MagicDefense  = Math.floor(B('MagicDefense')    * (1 + B('MagicDefenseAmplifyRate')    / 10000 + allDefAmp));

    // ── 명중 / 회피 (개별 증폭 + 공통 증폭) ─────────────────────────────────
    const ampAcc       = B('PVEAccuracyAmplifyRate') / 10000;  // PVE 명중 공통 증폭
    const ampMeleeAcc  = ampAcc + B('PVEMeleeAccuracyAmplifyRate')  / 10000;
    const ampRangedAcc = ampAcc + B('PVERangedAccuracyAmplifyRate') / 10000;
    const ampMagicAcc  = ampAcc + B('PVEMagicAccuracyAmplifyRate')  / 10000;
    const Accuracy       = Math.floor(B('Accuracy'));
    const MeleeAccuracy  = Math.floor((B('PVEMeleeAccuracy')  + B('PVEAccuracy')) * (1 + ampMeleeAcc));
    const RangedAccuracy = Math.floor((B('PVERangedAccuracy') + B('PVEAccuracy')) * (1 + ampRangedAcc));
    const MagicAccuracy  = Math.floor((B('PVEMagicAccuracy')  + B('PVEAccuracy')) * (1 + ampMagicAcc));

    const evAllAmp = B('EvasionAmplifyRate') / 10000;
    const Evasion        = Math.floor(B('Evasion'));
    const MeleeEvasion   = Math.floor(B('MeleeEvasion')  * (1 + B('MeleeEvasionAmplifyRate')  / 10000 + evAllAmp));
    const RangedEvasion  = Math.floor(B('RangedEvasion') * (1 + B('RangedEvasionAmplifyRate') / 10000 + evAllAmp));
    const MagicEvasion   = Math.floor(B('MagicEvasion')  * (1 + B('MagicEvasionAmplifyRate')  / 10000 + evAllAmp));

    // ── 치명타율 (원시값 / 100 → 자연 퍼센트 0~100, 전투 계산용) ────────────
    // PVECritical(공통 PVE 치명타) + 공격 유형별 치명타 + ExtraCritical(일반/스킬 추가 치명타) 합산
    const _critMeleeExtra  = B('PVENormalExtraCritical') + B('PVEMeleeNormalExtraCritical')
                           + B('PVESkillExtraCritical')  + B('PVEMeleeSkillExtraCritical');
    const _critRangedExtra = B('PVENormalExtraCritical') + B('PVERangedNormalExtraCritical')
                           + B('PVESkillExtraCritical')  + B('PVERangedSkillExtraCritical');
    const _critMagicExtra  = B('PVENormalExtraCritical') + B('PVEMagicNormalExtraCritical')
                           + B('PVESkillExtraCritical')  + B('PVEMagicSkillExtraCritical');
    const CriticalRate   = Math.min(100, B('PVECritical') / 100);
    const MeleeCritRate  = Math.min(100, (B('PVECritical') + B('PVEMeleeCritical')  + _critMeleeExtra)  / 100);
    const RangedCritRate = Math.min(100, (B('PVECritical') + B('PVERangedCritical') + _critRangedExtra) / 100);
    const MagicCritRate  = Math.min(100, (B('PVECritical') + B('PVEMagicCritical')  + _critMagicExtra)  / 100);

    // ── 치명타 추가 공격력 (절대값 — 치명타 발생 시 MaxAtk에 직접 더해지는 고정 수치) ──
    // PVEAtCriticalAttack(공통) + 공격 유형별 AtCritical 합산, 각각 증폭 적용
    const ampAtCritAtk      = 1 + B('PVEAtCriticalAttackAmplifyRate')        / 10000;
    const ampAtCritMeleeAtk = 1 + B('PVEAtCriticalMeleeAttackAmplifyRate')   / 10000;
    const ampAtCritRangedAtk= 1 + B('PVEAtCriticalRangedAttackAmplifyRate')  / 10000;
    const ampAtCritMagicAtk = 1 + B('PVEAtCriticalMagicAttackAmplifyRate')   / 10000;
    const CritMeleeAtk  = Math.floor(B('PVEAtCriticalAttack') * ampAtCritAtk + B('PVEAtCriticalMeleeAttack')  * ampAtCritMeleeAtk);
    const CritRangedAtk = Math.floor(B('PVEAtCriticalAttack') * ampAtCritAtk + B('PVEAtCriticalRangedAttack') * ampAtCritRangedAtk);
    const CritMagicAtk  = Math.floor(B('PVEAtCriticalAttack') * ampAtCritAtk + B('PVEAtCriticalMagicAttack')  * ampAtCritMagicAtk);
    const CriticalResist   = B('CriticalResist');
    const MeleeCritResist  = B('MeleeCriticalResist');
    const RangedCritResist = B('RangedCriticalResist');
    const MagicCritResist  = B('MagicCriticalResist');

    // ── 방어 관통 (개별 증폭 + PVE 공통 증폭) ───────────────────────────────
    const ampTgtDef       = B('PVETargetDefenseAmplifyRate') / 10000;
    const PVETargetMeleeDef  = Math.floor(B('PVETargetMeleeDefense')  * (1 + ampTgtDef + B('PVETargetMeleeDefenseAmplifyRate')  / 10000));
    const PVETargetRangedDef = Math.floor(B('PVETargetRangedDefense') * (1 + ampTgtDef + B('PVETargetRangedDefenseAmplifyRate') / 10000));
    const PVETargetMagicDef  = Math.floor(B('PVETargetMagicDefense')  * (1 + ampTgtDef + B('PVETargetMagicDefenseAmplifyRate')  / 10000));

    // ── 속도 / 회복 / 기타 (개별 증폭) ──────────────────────────────────────
    const MoveSpeed   = Math.floor(B('MoveSpeed')   * (1 + B('MoveSpeedAmplifyRate')   / 10000));
    const AttackSpeed = Math.floor(B('AttackSpeed') * (1 + B('AttackSpeedAmplifyRate') / 10000));
    // HP/MP 회복 — 기본 회복(HealthRegenPoint/ManaRegenPoint) + 고정 회복(HealthRegenFixedPoint/ManaRegenFixedPoint) 합산
    // 명성 시스템의 'HP/MP 고정 회복' 옵션이 여기에 합산되어 캐릭터 회복량에 반영됨
    const HPRegen        = Math.floor(B('HealthRegenPoint') + B('HealthRegenFixedPoint'));
    const MPRegen        = Math.floor(B('ManaRegenPoint')   + B('ManaRegenFixedPoint'));
    const PotionRecovery = Math.floor(B('PotionRecoveryRate') / 100);
    // 피해 감소 계열 — 기본값 + AmplifyRate 증폭 적용 (제단 옵션 등이 여기에 합산)
    //   - 6종 base × AmplifyRate: Skill/Critical × Melee/Ranged/Magic
    //   - 6종 Ignore × AmplifyRate (PVE): Skill/Critical Ignore × Melee/Ranged/Magic
    // computeStats가 raw 10000 = 100% 단위 입력을 받아 (1 + amp/10000) 배수 적용
    const SkillDamageReduction       = Math.floor(B('SkillDamageReduction')       * (1 + B('SkillDamageReductionAmplifyRate')       / 10000));
    const MeleeSkillDamageReduction  = Math.floor(B('MeleeSkillDamageReduction')  * (1 + B('MeleeSkillDamageReductionAmplifyRate')  / 10000));
    const RangedSkillDamageReduction = Math.floor(B('RangedSkillDamageReduction') * (1 + B('RangedSkillDamageReductionAmplifyRate') / 10000));
    const MagicSkillDamageReduction  = Math.floor(B('MagicSkillDamageReduction')  * (1 + B('MagicSkillDamageReductionAmplifyRate')  / 10000));
    const MeleeCriticalDamageReductionAmp  = Math.floor(B('MeleeCriticalDamageReduction')  * (1 + B('MeleeCriticalDamageReductionAmplifyRate')  / 10000));
    const RangedCriticalDamageReductionAmp = Math.floor(B('RangedCriticalDamageReduction') * (1 + B('RangedCriticalDamageReductionAmplifyRate') / 10000));
    const MagicCriticalDamageReductionAmp  = Math.floor(B('MagicCriticalDamageReduction')  * (1 + B('MagicCriticalDamageReductionAmplifyRate')  / 10000));
    // PVE 피해 감소 무시 증폭 — 기본값 0이지만 AmplifyRate가 들어오면 raw로 그대로 사용 (캐릭터에 합산되어 broadcast)
    const PVESkillDamageReductionIgnore        = B('PVESkillDamageReductionIgnore')        + B('PVESkillDamageReductionIgnoreAmplifyRate');
    const PVEMeleeSkillDamageReductionIgnore   = B('PVEMeleeSkillDamageReductionIgnore')   + B('PVEMeleeSkillDamageReductionIgnoreAmplifyRate');
    const PVERangedSkillDamageReductionIgnore  = B('PVERangedSkillDamageReductionIgnore')  + B('PVERangedSkillDamageReductionIgnoreAmplifyRate');
    const PVEMagicSkillDamageReductionIgnore   = B('PVEMagicSkillDamageReductionIgnore')   + B('PVEMagicSkillDamageReductionIgnoreAmplifyRate');
    const PVECriticalDamageReductionIgnore       = B('PVECriticalDamageReductionIgnore')       + B('PVECriticalDamageReductionIgnoreAmplifyRate');
    const PVEMeleeCriticalDamageReductionIgnore  = B('PVEMeleeCriticalDamageReductionIgnore')  + B('PVEMeleeCriticalDamageReductionIgnoreAmplifyRate');
    const PVERangedCriticalDamageReductionIgnore = B('PVERangedCriticalDamageReductionIgnore') + B('PVERangedCriticalDamageReductionIgnoreAmplifyRate');
    const PVEMagicCriticalDamageReductionIgnore  = B('PVEMagicCriticalDamageReductionIgnore')  + B('PVEMagicCriticalDamageReductionIgnoreAmplifyRate');
    const EXPBonus       = B('EXPBonus');
    const ItemDropBonus  = B('ItemDropBonus');
    const CoolTimeRate   = B('CoolTimeRate');
    // 몬스터 종류별 추가 공격력/방어력 — 개별 증폭 적용 (현재 프로토타입은 일괄 적용)
    const BossExtraAtk        = Math.floor(B('BossMonsterExtraAttack')               * (1 + B('BossMonsterExtraAttackAmplifyRate')               / 10000));
    const EliteExtraAtk       = Math.floor(B('EliteMonsterExtraAttack')              * (1 + B('EliteMonsterExtraAttackAmplifyRate')              / 10000));
    const WorldBossExtraAtk   = Math.floor(B('WorldBossMonsterExtraAttack')          * (1 + B('WorldBossMonsterExtraAttackAmplifyRate')          / 10000));
    const StrongBossExtraAtk  = Math.floor(B('StrongPointBossMonsterExtraAttack')    * (1 + B('StrongPointBossMonsterExtraAttackAmplifyRate')    / 10000));
    const BossExtraDef        = Math.floor(B('BossMonsterExtraDefense')              * (1 + B('BossMonsterExtraDefenseAmplifyRate')              / 10000));
    const EliteExtraDef       = Math.floor(B('EliteMonsterExtraDefense')             * (1 + B('EliteMonsterExtraDefenseAmplifyRate')             / 10000));
    const WorldBossExtraDef   = Math.floor(B('WorldBossMonsterExtraDefense')         * (1 + B('WorldBossMonsterExtraDefenseAmplifyRate')         / 10000));
    const StrongBossExtraDef  = Math.floor(B('StrongPointBossMonsterExtraDefense')   * (1 + B('StrongPointBossMonsterExtraDefenseAmplifyRate')   / 10000));

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
        // 치명타 피해 감소 — AmplifyRate 적용된 증폭값
        MeleeCriticalDamageReduction:  MeleeCriticalDamageReductionAmp,
        RangedCriticalDamageReduction: RangedCriticalDamageReductionAmp,
        MagicCriticalDamageReduction:  MagicCriticalDamageReductionAmp,
        // 방어력 관통 (증폭 반영값)
        PVETargetMeleeDefense:  PVETargetMeleeDef,
        PVETargetRangedDefense: PVETargetRangedDef,
        PVETargetMagicDefense:  PVETargetMagicDef,
        // 보스 추가 방어/공격 (증폭 반영값)
        EliteMonsterExtraDefense:             EliteExtraDef,
        BossMonsterExtraDefense:              BossExtraDef,
        WorldBossMonsterExtraDefense:         WorldBossExtraDef,
        StrongPointBossMonsterExtraDefense:   StrongBossExtraDef,
        // 스킬 피해 감소 — AmplifyRate 적용된 증폭값
        MeleeSkillDamageReduction, RangedSkillDamageReduction, MagicSkillDamageReduction,
        // PVE 피해 감소 무시 — base + AmplifyRate 합산
        PVESkillDamageReductionIgnore,
        PVEMeleeSkillDamageReductionIgnore, PVERangedSkillDamageReductionIgnore, PVEMagicSkillDamageReductionIgnore,
        PVECriticalDamageReductionIgnore,
        PVEMeleeCriticalDamageReductionIgnore, PVERangedCriticalDamageReductionIgnore, PVEMagicCriticalDamageReductionIgnore,
        // 스킬 공격력
        MeleeSkillMinAttack:  B('MeleeSkillMinAttack'),
        MeleeSkillMaxAttack:  B('MeleeSkillMaxAttack'),
        RangedSkillMinAttack: B('RangedSkillMinAttack'),
        RangedSkillMaxAttack: B('RangedSkillMaxAttack'),
        MagicSkillMinAttack:  B('MagicSkillMinAttack'),
        MagicSkillMaxAttack:  B('MagicSkillMaxAttack'),
        // 월드/거점 보스 추가 공격력 (증폭 반영값)
        WorldBossMonsterExtraAttack:       WorldBossExtraAtk,
        StrongPointBossMonsterExtraAttack: StrongBossExtraAtk,
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
    // 채집·자원 계열 (마법인형 사용 옵션)
    'GatherCooldownReduction', 'RareResourceAcquisitionRate',
]);

// ─── 퍼센트 스탯 표시 헬퍼 ───────────────────────────────────────────
// 퍼센트 스탯 수치 표기 규칙: 원시값 / 10000 * 100 = 표시 퍼센트 (= 원시값 / 100)
// 예: 원시값 1500 → 1500/100 = 15.00%   원시값 750 → 0.75%
// ※ character_info.html 에서 computeStats가 이미 0~100 범위로 변환한 스탯은 직접 % 표기

// 원시값이 10000 단위인 퍼센트 스탯 (÷100 후 '%' 표기)
// SUBST_PCT_STATS(명시) + STAT_LIST 패턴 기반 자동 등록 = 전체 % 적용 키
//
// 자동 등록 규칙 — 키 끝 접미사 패턴으로 % 적용 여부 판별:
//   ✅ % 표기 후보(매치):
//      *AmplifyRate, *WeakenRate, *Rate                 → 증폭·약화·각종 율(/10000 → %)
//      *Critical (단 *AtCriticalAttack 제외)             → 치명타율 (raw/100 → %)
//      *Resist                                          → 상태이상·치명타 저항 (%)
//      *Evasion                                         → 회피 (%)
//      *Hit                                             → 상태이상 적중 (%)
//      *ExtraCritical                                   → 추가 치명타 (%)
//      *DamageReduction / *DamageReductionIgnore        → 피해 감소·무시 (%)
//      *Bonus                                           → 경험치·재화·아이템 드랍 등 (%)
//   ❌ raw 절대값(제외):
//      *Attack 끝(공격력 raw)                            예: PVEMeleeMinAttack, PVEAtCriticalAttack
//      *Defense 끝(방어력 raw)                           예: PhysicalDefense, BossMonsterExtraDefense
//      *Point / *Speed / *MinAttack / *MaxAttack 등      raw 절대값
//      MaxHealthPoint, STR/DEX/INT/AGI/CON/WIS/LUK, AllStat, Weight, MoveSpeed 등
const RAW_PCT_STAT_KEYS = (function _buildRawPctSet() {
    const set = new Set();
    // 1) 기존 SUBST_PCT_STATS 항목 모두 등록
    for (const k of SUBST_PCT_STATS) set.add(k);
    // 2) STAT_LIST 전체 순회하며 접미사 패턴으로 자동 등록
    // 정규식: 키 끝 패턴이 다음 중 하나면 % 키
    const PCT_SUFFIX_RE = /(?:Rate|Critical|Resist|Evasion|Hit|ExtraCritical|DamageReduction|DamageReductionIgnore|Bonus)$/;
    // *AtCriticalAttack 는 'Critical' 으로 끝나지만 Attack 으로 끝나므로 자연 제외됨
    // (Attack 으로 끝나는 키는 PCT_SUFFIX_RE 매치 X)
    if (typeof STAT_LIST !== 'undefined') {
        for (const stat of STAT_LIST) {
            const en = stat.en;
            if (!en) continue;
            if (PCT_SUFFIX_RE.test(en)) set.add(en);
        }
    }
    return set;
})();

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

// ════════════════════════════════════════════════════════════════════════════
// ── TOTAL_STAT_FORMULAS — 002_스탯_합산공식.cs 의 모든 Total* 합산식 정리 ──
// ════════════════════════════════════════════════════════════════════════════
// 각 항목: { o: 출력 키(Total* 이름), c: 카테고리, f: 공식 본문, i: 입력 1차 능력치 키 배열 }
// - o: TotalXxx 형식의 2차 능력치 명
// - c: 카테고리 분류 (CLAUDE.md 카테고리 매핑 규칙 따름)
// - f: 합산식 본문 (input. 접두어 및 1f/0f/RATE_BASE 정리, MulW(x)=(1-x/10000) 약식 사용)
// - i: 공식에 등장하는 Sum* 키들의 Sum 접두어 제거 결과 (== 1차 능력치 영문 키)
//      character_info.html은 이 키로 STAT_LIST.kr 조회하여 "한글명(영문명)" 형식 표시
// 자동 추출 출처: docs/[베르시온] 002_스탯_합산공식.cs (총 395개 Total*)
//
// 공식 패턴 약식 표기:
//   MulW(X)  = (1 - SumX/10000)    — 약화율을 곱연산 계수로 변환
//   /10000   = RATE_BASE 나눗셈     — 비율 스케일 (10000 = 100%)
//   [패턴 A] (Base+Related) * (1 + Amp/10000 + RelAmp/10000) * MulW(Weak) * MulW(RelWeak)
//   [패턴 B] (Base+Related) * MulW(Weak) * MulW(RelWeak)    — 증폭 없음
//   [패턴 C] Base + Related                                   — 증폭·약화 없음 (단순 합산)
//   [패턴 H] Base * (1 + Amp/10000)                           — 약화 없음
//
// 일부 NO.046~NO.050 (HP/MP 회복·물약 회복점) 공식은 원본 .cs 에 증폭 항목이 비어 있음
// (`(1f + )` 빈 괄호). 원본 그대로 보존하되 NOTE로 표기.
const TOTAL_STAT_FORMULAS = [
    // ─── 01_기본 스탯 ───────────────────────────────────────────────
    { o:'TotalSTR', c:'01_기본 스탯', f:'(SumSTR + SumAllStat) * (1 + SumSTRAmplifyRate/10000 + SumAllStatAmplifyRate/10000) * MulW(STRWeakenRate) * MulW(AllStatWeakenRate)', i:['AllStat','AllStatAmplifyRate','AllStatWeakenRate','STR','STRAmplifyRate','STRWeakenRate'] },
    { o:'TotalDEX', c:'01_기본 스탯', f:'(SumDEX + SumAllStat) * (1 + SumDEXAmplifyRate/10000 + SumAllStatAmplifyRate/10000) * MulW(DEXWeakenRate) * MulW(AllStatWeakenRate)', i:['AllStat','AllStatAmplifyRate','AllStatWeakenRate','DEX','DEXAmplifyRate','DEXWeakenRate'] },
    { o:'TotalINT', c:'01_기본 스탯', f:'(SumINT + SumAllStat) * (1 + SumINTAmplifyRate/10000 + SumAllStatAmplifyRate/10000) * MulW(INTWeakenRate) * MulW(AllStatWeakenRate)', i:['AllStat','AllStatAmplifyRate','AllStatWeakenRate','INT','INTAmplifyRate','INTWeakenRate'] },
    { o:'TotalCON', c:'01_기본 스탯', f:'(SumCON + SumAllStat) * (1 + SumCONAmplifyRate/10000 + SumAllStatAmplifyRate/10000) * MulW(CONWeakenRate) * MulW(AllStatWeakenRate)', i:['AllStat','AllStatAmplifyRate','AllStatWeakenRate','CON','CONAmplifyRate','CONWeakenRate'] },
    { o:'TotalAGI', c:'01_기본 스탯', f:'(SumAGI + SumAllStat) * (1 + SumAGIAmplifyRate/10000 + SumAllStatAmplifyRate/10000) * MulW(AGIWeakenRate) * MulW(AllStatWeakenRate)', i:['AGI','AGIAmplifyRate','AGIWeakenRate','AllStat','AllStatAmplifyRate','AllStatWeakenRate'] },
    { o:'TotalWIS', c:'01_기본 스탯', f:'(SumWIS + SumAllStat) * (1 + SumWISAmplifyRate/10000 + SumAllStatAmplifyRate/10000) * MulW(WISWeakenRate) * MulW(AllStatWeakenRate)', i:['AllStat','AllStatAmplifyRate','AllStatWeakenRate','WIS','WISAmplifyRate','WISWeakenRate'] },
    { o:'TotalLUK', c:'01_기본 스탯', f:'(SumLUK + SumAllStat) * (1 + SumLUKAmplifyRate/10000 + SumAllStatAmplifyRate/10000) * MulW(LUKWeakenRate) * MulW(AllStatWeakenRate)', i:['AllStat','AllStatAmplifyRate','AllStatWeakenRate','LUK','LUKAmplifyRate','LUKWeakenRate'] },

    // ─── 04_공격력 — 일반 근/원/마 최소·최대 ───────────────────────────
    { o:'TotalMeleeMinAttack', c:'04_공격력', f:'(SumMeleeMinAttack + SumMeleeWeaponMinDamage + SumAttack + SumMeleeAttack + SumMinAttack) * MulW(MeleeAttackWeakenRate) * MulW(AttackWeakenRate)', i:['Attack','AttackWeakenRate','MeleeAttack','MeleeAttackWeakenRate','MeleeMinAttack','MeleeWeaponMinDamage','MinAttack'] },
    { o:'TotalRangedMinAttack', c:'04_공격력', f:'(SumRangedMinAttack + SumRangedWeaponMinDamage + SumAttack + SumRangedAttack + SumMinAttack) * MulW(RangedAttackWeakenRate) * MulW(AttackWeakenRate)', i:['Attack','AttackWeakenRate','MinAttack','RangedAttack','RangedAttackWeakenRate','RangedMinAttack','RangedWeaponMinDamage'] },
    { o:'TotalMagicMinAttack', c:'04_공격력', f:'(SumMagicMinAttack + SumMagicWeaponMinDamage + SumAttack + SumMagicAttack + SumMinAttack) * MulW(MagicAttackWeakenRate) * MulW(AttackWeakenRate)', i:['Attack','AttackWeakenRate','MagicAttack','MagicAttackWeakenRate','MagicMinAttack','MagicWeaponMinDamage','MinAttack'] },
    { o:'TotalMeleeMaxAttack', c:'04_공격력', f:'(SumMeleeMaxAttack + SumMeleeWeaponMaxDamage + SumAttack + SumMeleeAttack + SumMaxAttack) * (1 + SumMeleeMaxAttackAmplifyRate/10000 + SumMaxAttackAmplifyRate/10000) * MulW(MeleeAttackWeakenRate) * MulW(AttackWeakenRate)', i:['Attack','AttackWeakenRate','MaxAttack','MaxAttackAmplifyRate','MeleeAttack','MeleeAttackWeakenRate','MeleeMaxAttack','MeleeMaxAttackAmplifyRate','MeleeWeaponMaxDamage'] },
    { o:'TotalRangedMaxAttack', c:'04_공격력', f:'(SumRangedMaxAttack + SumRangedWeaponMaxDamage + SumAttack + SumRangedAttack + SumMaxAttack) * (1 + SumRangedMaxAttackAmplifyRate/10000 + SumMaxAttackAmplifyRate/10000) * MulW(RangedAttackWeakenRate) * MulW(AttackWeakenRate)', i:['Attack','AttackWeakenRate','MaxAttack','MaxAttackAmplifyRate','RangedAttack','RangedAttackWeakenRate','RangedMaxAttack','RangedMaxAttackAmplifyRate','RangedWeaponMaxDamage'] },
    { o:'TotalMagicMaxAttack', c:'04_공격력', f:'(SumMagicMaxAttack + SumMagicWeaponMaxDamage + SumAttack + SumMagicAttack + SumMaxAttack) * (1 + SumMagicMaxAttackAmplifyRate/10000 + SumMaxAttackAmplifyRate/10000) * MulW(MagicAttackWeakenRate) * MulW(AttackWeakenRate)', i:['Attack','AttackWeakenRate','MagicAttack','MagicAttackWeakenRate','MagicMaxAttack','MagicMaxAttackAmplifyRate','MagicWeaponMaxDamage','MaxAttack','MaxAttackAmplifyRate'] },

    // ─── 06_치명타 — 치명타 공격력(At*) ─────────────────────────────────
    { o:'TotalAtCriticalMeleeAttack', c:'06_치명타', f:'(SumAtCriticalMeleeAttack + SumAtCriticalAttack) * (1 + SumAtCriticalMeleeAttackAmplifyRate/10000 + SumAtCriticalAttackAmplifyRate/10000) * MulW(AtCriticalMeleeAttackWeakenRate) * MulW(AtCriticalAttackWeakenRate)', i:['AtCriticalAttack','AtCriticalAttackAmplifyRate','AtCriticalAttackWeakenRate','AtCriticalMeleeAttack','AtCriticalMeleeAttackAmplifyRate','AtCriticalMeleeAttackWeakenRate'] },
    { o:'TotalAtCriticalRangedAttack', c:'06_치명타', f:'(SumAtCriticalRangedAttack + SumAtCriticalAttack) * (1 + SumAtCriticalRangedAttackAmplifyRate/10000 + SumAtCriticalAttackAmplifyRate/10000) * MulW(AtCriticalRangedAttackWeakenRate) * MulW(AtCriticalAttackWeakenRate)', i:['AtCriticalAttack','AtCriticalAttackAmplifyRate','AtCriticalAttackWeakenRate','AtCriticalRangedAttack','AtCriticalRangedAttackAmplifyRate','AtCriticalRangedAttackWeakenRate'] },
    { o:'TotalAtCriticalMagicAttack', c:'06_치명타', f:'(SumAtCriticalMagicAttack + SumAtCriticalAttack) * (1 + SumAtCriticalMagicAttackAmplifyRate/10000 + SumAtCriticalAttackAmplifyRate/10000) * MulW(AtCriticalMagicAttackWeakenRate) * MulW(AtCriticalAttackWeakenRate)', i:['AtCriticalAttack','AtCriticalAttackAmplifyRate','AtCriticalAttackWeakenRate','AtCriticalMagicAttack','AtCriticalMagicAttackAmplifyRate','AtCriticalMagicAttackWeakenRate'] },

    // ─── 09_명중 ──────────────────────────────────────────────────────
    { o:'TotalMeleeAccuracy', c:'09_명중', f:'(SumMeleeAccuracy + SumAccuracy) * (1 + SumMeleeAccuracyAmplifyRate/10000 + SumAccuracyAmplifyRate/10000) * MulW(MeleeAccuracyWeakenRate) * MulW(AccuracyWeakenRate)', i:['Accuracy','AccuracyAmplifyRate','AccuracyWeakenRate','MeleeAccuracy','MeleeAccuracyAmplifyRate','MeleeAccuracyWeakenRate'] },
    { o:'TotalRangedAccuracy', c:'09_명중', f:'(SumRangedAccuracy + SumAccuracy) * (1 + SumRangedAccuracyAmplifyRate/10000 + SumAccuracyAmplifyRate/10000) * MulW(RangedAccuracyWeakenRate) * MulW(AccuracyWeakenRate)', i:['Accuracy','AccuracyAmplifyRate','AccuracyWeakenRate','RangedAccuracy','RangedAccuracyAmplifyRate','RangedAccuracyWeakenRate'] },
    { o:'TotalMagicAccuracy', c:'09_명중', f:'(SumMagicAccuracy + SumAccuracy) * (1 + SumMagicAccuracyAmplifyRate/10000 + SumAccuracyAmplifyRate/10000) * MulW(MagicAccuracyWeakenRate) * MulW(AccuracyWeakenRate)', i:['Accuracy','AccuracyAmplifyRate','AccuracyWeakenRate','MagicAccuracy','MagicAccuracyAmplifyRate','MagicAccuracyWeakenRate'] },

    // ─── 13_방어 관통 — 대상 방어력 감소 ─────────────────────────────────
    { o:'TotalTargetPhysicalDefense', c:'13_방어 관통', f:'(SumTargetPhysicalDefense + SumTargetAllDefense) * (1 + SumTargetPhysicalDefenseAmplifyRate/10000 + SumTargetAllDefenseAmplifyRate/10000 + SumAllDefenseAmplifyRate/10000) * MulW(TargetPhysicalDefenseWeakenRate) * MulW(TargetAllDefenseWeakenRate)', i:['AllDefenseAmplifyRate','TargetAllDefense','TargetAllDefenseAmplifyRate','TargetAllDefenseWeakenRate','TargetPhysicalDefense','TargetPhysicalDefenseAmplifyRate','TargetPhysicalDefenseWeakenRate'] },
    { o:'TotalTargetMagicDefense', c:'13_방어 관통', f:'(SumTargetMagicDefense + SumTargetAllDefense) * (1 + SumTargetMagicDefenseAmplifyRate/10000 + SumTargetAllDefenseAmplifyRate/10000 + SumAllDefenseAmplifyRate/10000) * MulW(TargetMagicDefenseWeakenRate) * MulW(TargetAllDefenseWeakenRate)', i:['AllDefenseAmplifyRate','TargetAllDefense','TargetAllDefenseAmplifyRate','TargetAllDefenseWeakenRate','TargetMagicDefense','TargetMagicDefenseAmplifyRate','TargetMagicDefenseWeakenRate'] },

    // ─── 05_방어력 ──────────────────────────────────────────────────────
    { o:'TotalPhysicalDefense', c:'05_방어력', f:'(SumPhysicalDefense + SumAllDefense) * (1 + SumPhysicalDefenseAmplifyRate/10000 + SumAllDefenseAmplifyRate/10000) * MulW(PhysicalDefenseWeakenRate) * MulW(AllDefenseWeakenRate)', i:['AllDefense','AllDefenseAmplifyRate','AllDefenseWeakenRate','PhysicalDefense','PhysicalDefenseAmplifyRate','PhysicalDefenseWeakenRate'] },
    { o:'TotalMagicDefense', c:'05_방어력', f:'(SumMagicDefense + SumAllDefense) * (1 + SumMagicDefenseAmplifyRate/10000 + SumAllDefenseAmplifyRate/10000) * MulW(MagicDefenseWeakenRate) * MulW(AllDefenseWeakenRate)', i:['AllDefense','AllDefenseAmplifyRate','AllDefenseWeakenRate','MagicDefense','MagicDefenseAmplifyRate','MagicDefenseWeakenRate'] },

    // ─── 08_회피 ──────────────────────────────────────────────────────
    { o:'TotalMeleeEvasion', c:'08_회피', f:'(SumMeleeEvasion + SumEvasion) * (1 + SumMeleeEvasionAmplifyRate/10000 + SumEvasionAmplifyRate/10000) * MulW(MeleeEvasionWeakenRate) * MulW(EvasionWeakenRate)', i:['Evasion','EvasionAmplifyRate','EvasionWeakenRate','MeleeEvasion','MeleeEvasionAmplifyRate','MeleeEvasionWeakenRate'] },
    { o:'TotalRangedEvasion', c:'08_회피', f:'(SumRangedEvasion + SumEvasion) * (1 + SumRangedEvasionAmplifyRate/10000 + SumEvasionAmplifyRate/10000) * MulW(RangedEvasionWeakenRate) * MulW(EvasionWeakenRate)', i:['Evasion','EvasionAmplifyRate','EvasionWeakenRate','RangedEvasion','RangedEvasionAmplifyRate','RangedEvasionWeakenRate'] },
    { o:'TotalMagicEvasion', c:'08_회피', f:'(SumMagicEvasion + SumEvasion) * (1 + SumMagicEvasionAmplifyRate/10000 + SumEvasionAmplifyRate/10000) * MulW(MagicEvasionWeakenRate) * MulW(EvasionWeakenRate)', i:['Evasion','EvasionAmplifyRate','EvasionWeakenRate','MagicEvasion','MagicEvasionAmplifyRate','MagicEvasionWeakenRate'] },

    // ─── 06_치명타 — 근/원/마 치명타율 ───────────────────────────────────
    { o:'TotalMeleeCritical', c:'06_치명타', f:'(SumMeleeCritical + SumCritical) * MulW(MeleeCriticalWeakenRate) * MulW(CriticalWeakenRate)', i:['Critical','CriticalWeakenRate','MeleeCritical','MeleeCriticalWeakenRate'] },
    { o:'TotalRangedCritical', c:'06_치명타', f:'(SumRangedCritical + SumCritical) * MulW(RangedCriticalWeakenRate) * MulW(CriticalWeakenRate)', i:['Critical','CriticalWeakenRate','RangedCritical','RangedCriticalWeakenRate'] },
    { o:'TotalMagicCritical', c:'06_치명타', f:'(SumMagicCritical + SumCritical) * MulW(MagicCriticalWeakenRate) * MulW(CriticalWeakenRate)', i:['Critical','CriticalWeakenRate','MagicCritical','MagicCriticalWeakenRate'] },

    // ─── 07_치명타 저항/감소 ──────────────────────────────────────────────
    { o:'TotalMeleeCriticalResist', c:'07_치명타 저항/감소', f:'(SumMeleeCriticalResist + SumCriticalResist) * MulW(MeleeCriticalResistWeakenRate) * MulW(CriticalResistWeakenRate)', i:['CriticalResist','CriticalResistWeakenRate','MeleeCriticalResist','MeleeCriticalResistWeakenRate'] },
    { o:'TotalRangedCriticalResist', c:'07_치명타 저항/감소', f:'(SumRangedCriticalResist + SumCriticalResist) * MulW(RangedCriticalResistWeakenRate) * MulW(CriticalResistWeakenRate)', i:['CriticalResist','CriticalResistWeakenRate','RangedCriticalResist','RangedCriticalResistWeakenRate'] },
    { o:'TotalMagicCriticalResist', c:'07_치명타 저항/감소', f:'(SumMagicCriticalResist + SumCriticalResist) * MulW(MagicCriticalResistWeakenRate) * MulW(CriticalResistWeakenRate)', i:['CriticalResist','CriticalResistWeakenRate','MagicCriticalResist','MagicCriticalResistWeakenRate'] },

    // ─── 12_피해 감소 — 근/원/마 데미지 리덕션 ────────────────────────────
    { o:'TotalMeleeDamageReduction', c:'12_피해 감소', f:'(SumMeleeDamageReduction + SumDamageReduction) * (1 + SumMeleeDamageReductionAmplifyRate/10000 + SumDamageReductionAmplifyRate/10000) * MulW(MeleeDamageReductionWeakenRate) * MulW(DamageReductionWeakenRate)', i:['DamageReduction','DamageReductionAmplifyRate','DamageReductionWeakenRate','MeleeDamageReduction','MeleeDamageReductionAmplifyRate','MeleeDamageReductionWeakenRate'] },
    { o:'TotalRangedDamageReduction', c:'12_피해 감소', f:'(SumRangedDamageReduction + SumDamageReduction) * (1 + SumMeleeDamageReductionAmplifyRate/10000 + SumDamageReductionAmplifyRate/10000) * MulW(RangedDamageReductionWeakenRate) * MulW(DamageReductionWeakenRate)  // NOTE: 원본에서 MeleeAmp 참조(원본 버그 가능성)', i:['DamageReduction','DamageReductionAmplifyRate','DamageReductionWeakenRate','MeleeDamageReductionAmplifyRate','RangedDamageReduction','RangedDamageReductionWeakenRate'] },
    { o:'TotalMagicDamageReduction', c:'12_피해 감소', f:'(SumMagicDamageReduction + SumDamageReduction) * (1 + SumMeleeDamageReductionAmplifyRate/10000 + SumDamageReductionAmplifyRate/10000) * MulW(MagicDamageReductionWeakenRate) * MulW(DamageReductionWeakenRate)  // NOTE: 원본에서 MeleeAmp 참조(원본 버그 가능성)', i:['DamageReduction','DamageReductionAmplifyRate','DamageReductionWeakenRate','MagicDamageReduction','MagicDamageReductionWeakenRate','MeleeDamageReductionAmplifyRate'] },

    // ─── 12_피해 감소 — 데미지 리덕션 무시 ─────────────────────────────────
    { o:'TotalMeleeDamageReductionIgnore', c:'12_피해 감소', f:'(SumMeleeDamageReductionIgnore + SumDamageReductionIgnore) * (1 + SumMeleeDamageReductionIgnoreAmplifyRate/10000 + SumDamageReductionIgnoreAmplifyRate/10000) * MulW(MeleeDamageReductionIgnoreWeakenRate) * MulW(DamageReductionIgnoreWeakenRate)', i:['DamageReductionIgnore','DamageReductionIgnoreAmplifyRate','DamageReductionIgnoreWeakenRate','MeleeDamageReductionIgnore','MeleeDamageReductionIgnoreAmplifyRate','MeleeDamageReductionIgnoreWeakenRate'] },
    { o:'TotalRangedDamageReductionIgnore', c:'12_피해 감소', f:'(SumRangedDamageReductionIgnore + SumDamageReductionIgnore) * (1 + SumRangedDamageReductionIgnoreAmplifyRate/10000 + SumDamageReductionIgnoreAmplifyRate/10000) * MulW(RangedDamageReductionIgnoreWeakenRate) * MulW(DamageReductionIgnoreWeakenRate)', i:['DamageReductionIgnore','DamageReductionIgnoreAmplifyRate','DamageReductionIgnoreWeakenRate','RangedDamageReductionIgnore','RangedDamageReductionIgnoreAmplifyRate','RangedDamageReductionIgnoreWeakenRate'] },
    { o:'TotalMagicDamageReductionIgnore', c:'12_피해 감소', f:'(SumMagicDamageReductionIgnore + SumDamageReductionIgnore) * (1 + SumMagicDamageReductionIgnoreAmplifyRate/10000 + SumDamageReductionIgnoreAmplifyRate/10000) * MulW(MagicDamageReductionIgnoreWeakenRate) * MulW(DamageReductionIgnoreWeakenRate)', i:['DamageReductionIgnore','DamageReductionIgnoreAmplifyRate','DamageReductionIgnoreWeakenRate','MagicDamageReductionIgnore','MagicDamageReductionIgnoreAmplifyRate','MagicDamageReductionIgnoreWeakenRate'] },

    // ─── 12_피해 감소 — 받는 피해 감소율 (Rate) ─────────────────────────────
    { o:'TotalMeleeDamageReductionRate', c:'12_피해 감소', f:'(SumMeleeDamageReductionRate + SumDamageReductionRate) * MulW(MeleeDamageReductionRateWeakenRate) * MulW(MeleeDamageReductionRateWeakenRate) * MulW(DamageReductionRateWeakenRate)  // NOTE: 원본에 중복된 MulW 곱셈', i:['DamageReductionRate','DamageReductionRateWeakenRate','MeleeDamageReductionRate','MeleeDamageReductionRateWeakenRate'] },
    { o:'TotalRangedDamageReductionRate', c:'12_피해 감소', f:'(SumRangedDamageReductionRate + SumDamageReductionRate) * MulW(RangedDamageReductionRateWeakenRate) * MulW(DamageReductionRateWeakenRate)', i:['DamageReductionRate','DamageReductionRateWeakenRate','RangedDamageReductionRate','RangedDamageReductionRateWeakenRate'] },
    { o:'TotalMagicDamageReductionRate', c:'12_피해 감소', f:'(SumMagicDamageReductionRate + SumDamageReductionRate) * MulW(MagicDamageReductionRateWeakenRate) * MulW(DamageReductionRateWeakenRate)', i:['DamageReductionRate','DamageReductionRateWeakenRate','MagicDamageReductionRate','MagicDamageReductionRateWeakenRate'] },

    // ─── 12_피해 감소 — 스킬 피해 감소 ─────────────────────────────────────
    { o:'TotalSkillDamageReduction', c:'12_피해 감소', f:'(SumMeleeSkillDamageReduction + SumSkillDamageReduction) * (1 + SumMeleeSkillDamageReductionAmplifyRate/10000 + SumSkillDamageReductionAmplifyRate/10000) * MulW(MeleeSkillDamageReductionWeakenRate) * MulW(SkillDamageReductionWeakenRate)  // NOTE: AmplifyRate /10000 적용은 기획 확인 필요', i:['MeleeSkillDamageReduction','MeleeSkillDamageReductionAmplifyRate','MeleeSkillDamageReductionWeakenRate','SkillDamageReduction','SkillDamageReductionAmplifyRate','SkillDamageReductionWeakenRate'] },
    { o:'TotalSkillDamageReductionIgnore', c:'12_피해 감소', f:'(SumSkillDamageReductionIgnore) * (1 + SumSkillDamageReductionIgnoreAmplifyRate/10000) * MulW(SkillDamageReductionIgnoreWeakenRate)', i:['SkillDamageReductionIgnore','SkillDamageReductionIgnoreAmplifyRate','SkillDamageReductionIgnoreWeakenRate'] },

    // ─── 14_속도 ──────────────────────────────────────────────────────
    { o:'TotalAttackSpeed', c:'14_속도', f:'(BaseAttackSpeed + SumAttackSpeed) * (1 + SumAttackSpeedAmplifyRate/10000) * MulW(AttackSpeedWeakenRate)  // BaseAttackSpeed는 직업/무기 기본값', i:['AttackSpeed','AttackSpeedAmplifyRate','AttackSpeedWeakenRate'] },
    { o:'TotalMoveSpeed', c:'14_속도', f:'BaseMoveSpeed * (1 + SumMoveSpeed/10000 + SumRideMoveSpeed/10000) * MulW(MoveSpeedWeakenRate)  // BaseMoveSpeed는 직업/레벨 기본값', i:['MoveSpeed','MoveSpeedWeakenRate','RideMoveSpeed'] },

    // ─── 18_기타 ──────────────────────────────────────────────────────
    { o:'TotalWeight', c:'18_기타', f:'SumWeight', i:['Weight'] },

    // ─── 02_HP/MP ─────────────────────────────────────────────────────
    { o:'TotalMaxHealthPoint', c:'02_HP/MP', f:'(SumMaxHealthPoint) * (1 + SumMaxHealthPointAmplifyRate/10000)', i:['MaxHealthPoint','MaxHealthPointAmplifyRate'] },
    { o:'TotalMaxManaPoint', c:'02_HP/MP', f:'(SumMaxManaPoint) * (1 + SumMaxManaPointAmplifyRate/10000)', i:['MaxManaPoint','MaxManaPointAmplifyRate'] },
    { o:'TotalHealthRegenPoint', c:'02_HP/MP', f:'(SumHealthRegenPoint) * (1 + SumHealthRegenPointAmplifyRate/10000) * MulW(HealthRegenPointWeakenRate)', i:['HealthRegenPoint','HealthRegenPointAmplifyRate','HealthRegenPointWeakenRate'] },
    { o:'TotalHealthRegenFixedPoint', c:'02_HP/MP', f:'(SumHealthRegenFixedPoint) * (1 + SumHealthRegenFixedPointAmplifyRate/10000) * MulW(HealthRegenFixedPointWeakenRate)', i:['HealthRegenFixedPoint','HealthRegenFixedPointAmplifyRate','HealthRegenFixedPointWeakenRate'] },
    { o:'TotalManaRegenPoint', c:'02_HP/MP', f:'(SumManaRegenPoint) * (1 + SumManaRegenPointAmplifyRate/10000) * MulW(ManaRegenPointWeakenRate)', i:['ManaRegenPoint','ManaRegenPointAmplifyRate','ManaRegenPointWeakenRate'] },
    { o:'TotalManaRegenFixedPoint', c:'02_HP/MP', f:'(SumManaRegenFixedPoint) * (1 + SumManaRegenFixedPointAmplifyRate/10000) * MulW(ManaRegenFixedPointWeakenRate)', i:['ManaRegenFixedPoint','ManaRegenFixedPointAmplifyRate','ManaRegenFixedPointWeakenRate'] },

    // ─── 03_물약 회복 ──────────────────────────────────────────────────
    { o:'TotalPotionRecoveryPoint', c:'03_물약 회복', f:'(SumPotionRecoveryPoint) * (1 + SumPotionRecoveryPointAmplifyRate/10000) * MulW(PotionRecoveryPointWeakenRate)', i:['PotionRecoveryPoint','PotionRecoveryPointAmplifyRate','PotionRecoveryPointWeakenRate'] },
    { o:'TotalPotionRecoveryRate', c:'03_물약 회복', f:'max(SumPotionRecoveryRate, 0) * MulW(PotionRecoveryWeakenRate)  // 음수 방지 클램프', i:['PotionRecoveryRate','PotionRecoveryWeakenRate'] },

    // ─── 18_기타 — MP 소모/스킬 쿨타임 ─────────────────────────────────
    { o:'TotalManaCostRate', c:'18_기타', f:'SumManaCostRate', i:['ManaCostRate'] },
    { o:'TotalCoolTimeRate', c:'18_기타', f:'SumCoolTimeRate', i:['CoolTimeRate'] },

    // ─── 10_상태이상 적중 — 디버프/스턴/마비/수면/침묵/홀드/슬로우 ─────────
    { o:'TotalDebuffHit', c:'10_상태이상 적중', f:'(SumDebuffHit + SumAbnormalHit) * MulW(DebuffHitWeakenRate) * MulW(AbnormalHitWeakenRate)', i:['AbnormalHit','AbnormalHitWeakenRate','DebuffHit','DebuffHitWeakenRate'] },
    { o:'TotalStunHit', c:'10_상태이상 적중', f:'(SumStunHit + SumAbnormalHit) * MulW(StunHitWeakenRate) * MulW(AbnormalHitWeakenRate)', i:['AbnormalHit','AbnormalHitWeakenRate','StunHit','StunHitWeakenRate'] },
    { o:'TotalParalysisHit', c:'10_상태이상 적중', f:'(SumParalysisHit + SumAbnormalHit) * MulW(ParalysisHitWeakenRate) * MulW(AbnormalHitWeakenRate)', i:['AbnormalHit','AbnormalHitWeakenRate','ParalysisHit','ParalysisHitWeakenRate'] },
    { o:'TotalSleepHit', c:'10_상태이상 적중', f:'(SumSleepHit + SumAbnormalHit) * MulW(SleepHitWeakenRate) * MulW(AbnormalHitWeakenRate)', i:['AbnormalHit','AbnormalHitWeakenRate','SleepHit','SleepHitWeakenRate'] },
    { o:'TotalSilenceHit', c:'10_상태이상 적중', f:'(SumSilenceHit + SumAbnormalHit) * MulW(SilenceHitWeakenRate) * MulW(AbnormalHitWeakenRate)', i:['AbnormalHit','AbnormalHitWeakenRate','SilenceHit','SilenceHitWeakenRate'] },
    { o:'TotalHoldHit', c:'10_상태이상 적중', f:'(SumHoldHit + SumAbnormalHit) * MulW(HoldHitWeakenRate) * MulW(AbnormalHitWeakenRate)', i:['AbnormalHit','AbnormalHitWeakenRate','HoldHit','HoldHitWeakenRate'] },
    { o:'TotalSlowHit', c:'10_상태이상 적중', f:'(SumSlowHit + SumAbnormalHit) * MulW(SlowHitWeakenRate) * MulW(AbnormalHitWeakenRate)', i:['AbnormalHit','AbnormalHitWeakenRate','SlowHit','SlowHitWeakenRate'] },

    // ─── 11_상태이상 저항 ──────────────────────────────────────────────
    { o:'TotalDebuffResist', c:'11_상태이상 저항', f:'(SumDebuffResist + SumAbnormalResist) * MulW(DebuffResistWeakenRate) * MulW(AbnormalResistWeakenRate)', i:['AbnormalResist','AbnormalResistWeakenRate','DebuffResist','DebuffResistWeakenRate'] },
    { o:'TotalStunResist', c:'11_상태이상 저항', f:'(SumStunResist + SumAbnormalResist) * MulW(StunResistWeakenRate) * MulW(AbnormalResistWeakenRate)', i:['AbnormalResist','AbnormalResistWeakenRate','StunResist','StunResistWeakenRate'] },
    { o:'TotalParalysisResist', c:'11_상태이상 저항', f:'(SumParalysisResist + SumAbnormalResist) * MulW(ParalysisResistWeakenRate) * MulW(AbnormalResistWeakenRate)', i:['AbnormalResist','AbnormalResistWeakenRate','ParalysisResist','ParalysisResistWeakenRate'] },
    { o:'TotalSleepResist', c:'11_상태이상 저항', f:'(SumSleepResist + SumAbnormalResist) * MulW(SleepResistWeakenRate) * MulW(AbnormalResistWeakenRate)', i:['AbnormalResist','AbnormalResistWeakenRate','SleepResist','SleepResistWeakenRate'] },
    { o:'TotalSilenceResist', c:'11_상태이상 저항', f:'(SumSilenceResist + SumAbnormalResist) * MulW(SilenceResistWeakenRate) * MulW(AbnormalResistWeakenRate)', i:['AbnormalResist','AbnormalResistWeakenRate','SilenceResist','SilenceResistWeakenRate'] },
    { o:'TotalHoldResist', c:'11_상태이상 저항', f:'(SumHoldResist + SumAbnormalResist) * MulW(HoldResistWeakenRate) * MulW(AbnormalResistWeakenRate)', i:['AbnormalResist','AbnormalResistWeakenRate','HoldResist','HoldResistWeakenRate'] },
    { o:'TotalSlowResist', c:'11_상태이상 저항', f:'(SumSlowResist + SumAbnormalResist) * MulW(SlowResistWeakenRate) * MulW(AbnormalResistWeakenRate)', i:['AbnormalResist','AbnormalResistWeakenRate','SlowResist','SlowResistWeakenRate'] },

    // ─── 16_몬스터 특수 대상 ───────────────────────────────────────────
    { o:'TotalMonsterExtraAttack', c:'16_몬스터 특수 대상', f:'(SumMonsterExtraAttack) * (1 + SumMonsterExtraAttackAmplifyRate/10000)', i:['MonsterExtraAttack','MonsterExtraAttackAmplifyRate'] },
    { o:'TotalBossMonsterExtraAttack', c:'16_몬스터 특수 대상', f:'(SumBossMonsterExtraAttack) * (1 + SumBossMonsterExtraAttackAmplifyRate/10000)', i:['BossMonsterExtraAttack','BossMonsterExtraAttackAmplifyRate'] },
    { o:'TotalUndeadExtraAttack', c:'16_몬스터 특수 대상', f:'SumUndeadExtraAttack + SumAllMonsterTypeExtraAttack', i:['AllMonsterTypeExtraAttack','UndeadExtraAttack'] },
    { o:'TotalDemonExtraAttack', c:'16_몬스터 특수 대상', f:'SumDemonExtraAttack + SumAllMonsterTypeExtraAttack', i:['AllMonsterTypeExtraAttack','DemonExtraAttack'] },
    { o:'TotalBeastExtraAttack', c:'16_몬스터 특수 대상', f:'SumBeastExtraAttack + SumAllMonsterTypeExtraAttack', i:['AllMonsterTypeExtraAttack','BeastExtraAttack'] },
    { o:'TotalWerebeastExtraAttack', c:'16_몬스터 특수 대상', f:'SumWerebeastExtraAttack + SumAllMonsterTypeExtraAttack', i:['AllMonsterTypeExtraAttack','WerebeastExtraAttack'] },
    { o:'TotalSpiritExtraAttack', c:'16_몬스터 특수 대상', f:'SumSpiritExtraAttack + SumAllMonsterTypeExtraAttack', i:['AllMonsterTypeExtraAttack','SpiritExtraAttack'] },
    { o:'TotalUnderEarthLegionExtraAttack', c:'16_몬스터 특수 대상', f:'SumUnderEarthLegionExtraAttack + SumAllLegionExtraAttack', i:['AllLegionExtraAttack','UnderEarthLegionExtraAttack'] },
    { o:'TotalBurstWarLegionExtraAttack', c:'16_몬스터 특수 대상', f:'SumBurstWarLegionExtraAttack + SumAllLegionExtraAttack', i:['AllLegionExtraAttack','BurstWarLegionExtraAttack'] },
    { o:'TotalArcVesselLegionExtraAttack', c:'16_몬스터 특수 대상', f:'SumArcVesselLegionExtraAttack + SumAllLegionExtraAttack', i:['AllLegionExtraAttack','ArcVesselLegionExtraAttack'] },
    { o:'TotalTalismanLegionExtraAttack', c:'16_몬스터 특수 대상', f:'SumTalismanLegionExtraAttack + SumAllLegionExtraAttack', i:['AllLegionExtraAttack','TalismanLegionExtraAttack'] },
    { o:'TotalDespairLegionExtraAttack', c:'16_몬스터 특수 대상', f:'SumDespairLegionExtraAttack + SumAllLegionExtraAttack', i:['AllLegionExtraAttack','DespairLegionExtraAttack'] },
    { o:'TotalMonsterExtraDefense', c:'16_몬스터 특수 대상', f:'(SumMonsterExtraDefense) * (1 + SumMonsterExtraDefenseAmplifyRate/10000)', i:['MonsterExtraDefense','MonsterExtraDefenseAmplifyRate'] },
    { o:'TotalBossMonsterExtraDefense', c:'16_몬스터 특수 대상', f:'(SumBossMonsterExtraDefense) * (1 + SumBossMonsterExtraDefenseAmplifyRate/10000)', i:['BossMonsterExtraDefense','BossMonsterExtraDefenseAmplifyRate'] },
    { o:'TotalUndeadExtraDefense', c:'16_몬스터 특수 대상', f:'SumUndeadExtraDefense + SumAllMonsterTypeExtraDefense', i:['AllMonsterTypeExtraDefense','UndeadExtraDefense'] },
    { o:'TotalDemonExtraDefense', c:'16_몬스터 특수 대상', f:'SumDemonExtraDefense + SumAllMonsterTypeExtraDefense', i:['AllMonsterTypeExtraDefense','DemonExtraDefense'] },
    { o:'TotalBeastExtraDefense', c:'16_몬스터 특수 대상', f:'SumBeastExtraDefense + SumAllMonsterTypeExtraDefense', i:['AllMonsterTypeExtraDefense','BeastExtraDefense'] },
    { o:'TotalWerebeastExtraDefense', c:'16_몬스터 특수 대상', f:'SumWerebeastExtraDefense + SumAllMonsterTypeExtraDefense', i:['AllMonsterTypeExtraDefense','WerebeastExtraDefense'] },
    { o:'TotalSpiritExtraDefense', c:'16_몬스터 특수 대상', f:'SumSpiritExtraDefense + SumAllMonsterTypeExtraDefense', i:['AllMonsterTypeExtraDefense','SpiritExtraDefense'] },
    { o:'TotalUnderEarthLegionExtraDefense', c:'16_몬스터 특수 대상', f:'SumUnderEarthLegionExtraDefense + SumAllLegionExtraDefense', i:['AllLegionExtraDefense','UnderEarthLegionExtraDefense'] },
    { o:'TotalBurstWarLegionExtraDefense', c:'16_몬스터 특수 대상', f:'SumBurstWarLegionExtraDefense + SumAllLegionExtraDefense', i:['AllLegionExtraDefense','BurstWarLegionExtraDefense'] },
    { o:'TotalArcVesselLegionExtraDefense', c:'16_몬스터 특수 대상', f:'SumArcVesselLegionExtraDefense + SumAllLegionExtraDefense', i:['AllLegionExtraDefense','ArcVesselLegionExtraDefense'] },
    { o:'TotalTalismanLegionExtraDefense', c:'16_몬스터 특수 대상', f:'SumTalismanLegionExtraDefense + SumAllLegionExtraDefense', i:['AllLegionExtraDefense','TalismanLegionExtraDefense'] },
    { o:'TotalDespairLegionExtraDefense', c:'16_몬스터 특수 대상', f:'SumDespairLegionExtraDefense + SumAllLegionExtraDefense', i:['AllLegionExtraDefense','DespairLegionExtraDefense'] },

    // ─── 04_공격력 — PVP 일반(근/원/마 최소·최대) ─────────────────────────
    { o:'TotalPVPMeleeMinAttack', c:'04_공격력', f:'(SumPVPMeleeMinAttack + SumPVPAttack + SumPVPMinAttack + SumPVPMeleeAttack) * (1 + SumPVPAttackAmplifyRate/10000 + SumPVPMeleeAttackAmplifyRate/10000) * MulW(PVPMeleeAttackWeakenRate) * MulW(PVPAttackWeakenRate)', i:['PVPAttack','PVPAttackAmplifyRate','PVPAttackWeakenRate','PVPMeleeAttack','PVPMeleeAttackAmplifyRate','PVPMeleeAttackWeakenRate','PVPMeleeMinAttack','PVPMinAttack'] },
    { o:'TotalPVPRangedMinAttack', c:'04_공격력', f:'(SumPVPRangedMinAttack + SumPVPAttack + SumPVPMinAttack + SumPVPRangedAttack) * (1 + SumPVPAttackAmplifyRate/10000 + SumPVPRangedAttackAmplifyRate/10000) * MulW(PVPRangedAttackWeakenRate) * MulW(PVPAttackWeakenRate)', i:['PVPAttack','PVPAttackAmplifyRate','PVPAttackWeakenRate','PVPMinAttack','PVPRangedAttack','PVPRangedAttackAmplifyRate','PVPRangedAttackWeakenRate','PVPRangedMinAttack'] },
    { o:'TotalPVPMagicMinAttack', c:'04_공격력', f:'(SumPVPMagicMinAttack + SumPVPAttack + SumPVPMinAttack + SumPVPMagicAttack) * (1 + SumPVPAttackAmplifyRate/10000 + SumPVPMagicAttackAmplifyRate/10000) * MulW(PVPMagicAttackWeakenRate) * MulW(PVPAttackWeakenRate)', i:['PVPAttack','PVPAttackAmplifyRate','PVPAttackWeakenRate','PVPMagicAttack','PVPMagicAttackAmplifyRate','PVPMagicAttackWeakenRate','PVPMagicMinAttack','PVPMinAttack'] },
    { o:'TotalPVPMeleeMaxAttack', c:'04_공격력', f:'(SumPVPMeleeMaxAttack + SumPVPAttack + SumPVPMaxAttack + SumPVPMeleeAttack) * (1 + SumPVPAttackAmplifyRate/10000 + SumPVPMeleeAttackAmplifyRate/10000) * MulW(PVPMeleeAttackWeakenRate) * MulW(PVPAttackWeakenRate)', i:['PVPAttack','PVPAttackAmplifyRate','PVPAttackWeakenRate','PVPMaxAttack','PVPMeleeAttack','PVPMeleeAttackAmplifyRate','PVPMeleeAttackWeakenRate','PVPMeleeMaxAttack'] },
    { o:'TotalPVPRangedMaxAttack', c:'04_공격력', f:'(SumPVPRangedMaxAttack + SumPVPAttack + SumPVPMaxAttack + SumPVPRangedAttack) * (1 + SumPVPAttackAmplifyRate/10000 + SumPVPRangedAttackAmplifyRate/10000) * MulW(PVPRangedAttackWeakenRate) * MulW(PVPAttackWeakenRate)', i:['PVPAttack','PVPAttackAmplifyRate','PVPAttackWeakenRate','PVPMaxAttack','PVPRangedAttack','PVPRangedAttackAmplifyRate','PVPRangedAttackWeakenRate','PVPRangedMaxAttack'] },
    { o:'TotalPVPMagicMaxAttack', c:'04_공격력', f:'(SumPVPMagicMaxAttack + SumPVPAttack + SumPVPMaxAttack + SumPVPMagicAttack) * (1 + SumPVPAttackAmplifyRate/10000 + SumPVPMagicAttackAmplifyRate/10000) * MulW(PVPMagicAttackWeakenRate) * MulW(PVPAttackWeakenRate)', i:['PVPAttack','PVPAttackAmplifyRate','PVPAttackWeakenRate','PVPMagicAttack','PVPMagicAttackAmplifyRate','PVPMagicAttackWeakenRate','PVPMagicMaxAttack','PVPMaxAttack'] },

    // ─── 06_치명타 — PVP 치명타 공격력 ───────────────────────────────────
    { o:'TotalPVPAtCriticalMeleeAttack', c:'06_치명타', f:'(SumPVPAtCriticalMeleeAttack + SumPVPAtCriticalAttack) * (1 + SumPVPAtCriticalAttackAmplifyRate/10000 + SumPVPAtCriticalMeleeAttackAmplifyRate/10000) * MulW(PVPAtCriticalAttackWeakenRate)', i:['PVPAtCriticalAttack','PVPAtCriticalAttackAmplifyRate','PVPAtCriticalAttackWeakenRate','PVPAtCriticalMeleeAttack','PVPAtCriticalMeleeAttackAmplifyRate'] },
    { o:'TotalPVPAtCriticalRangedAttack', c:'06_치명타', f:'(SumPVPAtCriticalRangedAttack + SumPVPAtCriticalAttack) * (1 + SumPVPAtCriticalAttackAmplifyRate/10000 + SumPVPAtCriticalRangedAttackAmplifyRate/10000) * MulW(PVPAtCriticalAttackWeakenRate)', i:['PVPAtCriticalAttack','PVPAtCriticalAttackAmplifyRate','PVPAtCriticalAttackWeakenRate','PVPAtCriticalRangedAttack','PVPAtCriticalRangedAttackAmplifyRate'] },
    { o:'TotalPVPAtCriticalMagicAttack', c:'06_치명타', f:'(SumPVPAtCriticalMagicAttack + SumPVPAtCriticalAttack) * (1 + SumPVPAtCriticalAttackAmplifyRate/10000 + SumPVPAtCriticalMagicAttackAmplifyRate/10000) * MulW(PVPAtCriticalAttackWeakenRate)', i:['PVPAtCriticalAttack','PVPAtCriticalAttackAmplifyRate','PVPAtCriticalAttackWeakenRate','PVPAtCriticalMagicAttack','PVPAtCriticalMagicAttackAmplifyRate'] },

    // ─── 09_명중 — PVP ──────────────────────────────────────────────
    { o:'TotalPVPMeleeAccuracy', c:'09_명중', f:'(SumPVPMeleeAccuracy + SumPVPAccuracy) * (1 + SumPVPMeleeAccuracyAmplifyRate/10000 + SumPVPAccuracyAmplifyRate/10000) * MulW(PVPMeleeAccuracyWeakenRate) * MulW(PVPAccuracyWeakenRate)', i:['PVPAccuracy','PVPAccuracyAmplifyRate','PVPAccuracyWeakenRate','PVPMeleeAccuracy','PVPMeleeAccuracyAmplifyRate','PVPMeleeAccuracyWeakenRate'] },
    { o:'TotalPVPRangedAccuracy', c:'09_명중', f:'(SumPVPRangedAccuracy + SumPVPAccuracy) * (1 + SumPVPRangedAccuracyAmplifyRate/10000 + SumPVPAccuracyAmplifyRate/10000) * MulW(PVPRangedAccuracyWeakenRate) * MulW(PVPAccuracyWeakenRate)', i:['PVPAccuracy','PVPAccuracyAmplifyRate','PVPAccuracyWeakenRate','PVPRangedAccuracy','PVPRangedAccuracyAmplifyRate','PVPRangedAccuracyWeakenRate'] },
    { o:'TotalPVPMagicAccuracy', c:'09_명중', f:'(SumPVPMagicAccuracy + SumPVPAccuracy) * (1 + SumPVPMagicAccuracyAmplifyRate/10000 + SumPVPAccuracyAmplifyRate/10000) * MulW(PVPMagicAccuracyWeakenRate) * MulW(PVPAccuracyWeakenRate)', i:['PVPAccuracy','PVPAccuracyAmplifyRate','PVPAccuracyWeakenRate','PVPMagicAccuracy','PVPMagicAccuracyAmplifyRate','PVPMagicAccuracyWeakenRate'] },

    // ─── 05_방어력 — PVP ───────────────────────────────────────────────
    { o:'TotalPVPPhysicalDefense', c:'05_방어력', f:'SumPVPPhysicalDefense', i:['PVPPhysicalDefense'] },
    { o:'TotalPVPMagicDefense', c:'05_방어력', f:'SumPVPMagicDefense', i:['PVPMagicDefense'] },

    // ─── 08_회피 — PVP ────────────────────────────────────────────────
    { o:'TotalPVPMeleeEvasion', c:'08_회피', f:'SumPVPMeleeEvasion + SumPVPEvasion', i:['PVPEvasion','PVPMeleeEvasion'] },
    { o:'TotalPVPRangedEvasion', c:'08_회피', f:'SumPVPRangedEvasion + SumPVPEvasion', i:['PVPEvasion','PVPRangedEvasion'] },
    { o:'TotalPVPMagicEvasion', c:'08_회피', f:'SumPVPMagicEvasion + SumPVPEvasion', i:['PVPEvasion','PVPMagicEvasion'] },

    // ─── 06_치명타 — PVP 치명타율 ────────────────────────────────────────
    { o:'TotalPVPMeleeCritical', c:'06_치명타', f:'(SumPVPMeleeCritical + SumPVPCritical) * MulW(PVPMeleeCriticalWeakenRate) * MulW(PVPCriticalWeakenRate)', i:['PVPCritical','PVPCriticalWeakenRate','PVPMeleeCritical','PVPMeleeCriticalWeakenRate'] },
    { o:'TotalPVPRangedCritical', c:'06_치명타', f:'(SumPVPRangedCritical + SumPVPCritical) * MulW(PVPRangedCriticalWeakenRate) * MulW(PVPCriticalWeakenRate)', i:['PVPCritical','PVPCriticalWeakenRate','PVPRangedCritical','PVPRangedCriticalWeakenRate'] },
    { o:'TotalPVPMagicCritical', c:'06_치명타', f:'(SumPVPMagicCritical + SumPVPCritical) * MulW(PVPMagicCriticalWeakenRate) * MulW(PVPCriticalWeakenRate)', i:['PVPCritical','PVPCriticalWeakenRate','PVPMagicCritical','PVPMagicCriticalWeakenRate'] },
    { o:'TotalPVPMeleeCriticalResist', c:'07_치명타 저항/감소', f:'SumPVPMeleeCriticalResist + SumPVPCriticalResist', i:['PVPCriticalResist','PVPMeleeCriticalResist'] },
    { o:'TotalPVPRangedCriticalResist', c:'07_치명타 저항/감소', f:'SumPVPRangedCriticalResist + SumPVPCriticalResist', i:['PVPCriticalResist','PVPRangedCriticalResist'] },
    { o:'TotalPVPMagicCriticalResist', c:'07_치명타 저항/감소', f:'SumPVPMagicCriticalResist + SumPVPCriticalResist', i:['PVPCriticalResist','PVPMagicCriticalResist'] },

    // ─── 12_피해 감소 — PVP 데미지 리덕션 ───────────────────────────────
    { o:'TotalPVPMeleeDamageReduction', c:'12_피해 감소', f:'(SumPVPMeleeDamageReduction + SumPVPDamageReduction) * (1 + SumPVPMeleeDamageReductionAmplifyRate/10000 + SumPVPDamageReductionAmplifyRate/10000) * MulW(PVPMeleeDamageReductionWeakenRate) * MulW(PVPDamageReductionWeakenRate)', i:['PVPDamageReduction','PVPDamageReductionAmplifyRate','PVPDamageReductionWeakenRate','PVPMeleeDamageReduction','PVPMeleeDamageReductionAmplifyRate','PVPMeleeDamageReductionWeakenRate'] },
    { o:'TotalPVPRangedDamageReduction', c:'12_피해 감소', f:'(SumPVPRangedDamageReduction + SumPVPDamageReduction) * (1 + SumPVPRangedDamageReductionAmplifyRate/10000 + SumPVPDamageReductionAmplifyRate/10000) * MulW(PVPRangedDamageReductionWeakenRate) * MulW(PVPDamageReductionWeakenRate)', i:['PVPDamageReduction','PVPDamageReductionAmplifyRate','PVPDamageReductionWeakenRate','PVPRangedDamageReduction','PVPRangedDamageReductionAmplifyRate','PVPRangedDamageReductionWeakenRate'] },
    { o:'TotalPVPMagicDamageReduction', c:'12_피해 감소', f:'(SumPVPMagicDamageReduction + SumPVPDamageReduction) * (1 + SumPVPMagicDamageReductionAmplifyRate/10000 + SumPVPDamageReductionAmplifyRate/10000) * MulW(PVPMagicDamageReductionWeakenRate) * MulW(PVPDamageReductionWeakenRate)', i:['PVPDamageReduction','PVPDamageReductionAmplifyRate','PVPDamageReductionWeakenRate','PVPMagicDamageReduction','PVPMagicDamageReductionAmplifyRate','PVPMagicDamageReductionWeakenRate'] },
    { o:'TotalPVPMeleeDamageReductionIgnore', c:'12_피해 감소', f:'(SumPVPMeleeDamageReductionIgnore + SumPVPDamageReductionIgnore) * (1 + SumPVPMeleeDamageReductionIgnoreAmplifyRate/10000 + SumPVPDamageReductionIgnoreAmplifyRate/10000) * MulW(PVPDamageReductionIgnoreWeakenRate)', i:['PVPDamageReductionIgnore','PVPDamageReductionIgnoreAmplifyRate','PVPDamageReductionIgnoreWeakenRate','PVPMeleeDamageReductionIgnore','PVPMeleeDamageReductionIgnoreAmplifyRate'] },
    { o:'TotalPVPRangedDamageReductionIgnore', c:'12_피해 감소', f:'(SumPVPRangedDamageReductionIgnore + SumPVPDamageReductionIgnore) * (1 + SumPVPRangedDamageReductionIgnoreAmplifyRate/10000 + SumPVPDamageReductionIgnoreAmplifyRate/10000) * MulW(PVPDamageReductionIgnoreWeakenRate)', i:['PVPDamageReductionIgnore','PVPDamageReductionIgnoreAmplifyRate','PVPDamageReductionIgnoreWeakenRate','PVPRangedDamageReductionIgnore','PVPRangedDamageReductionIgnoreAmplifyRate'] },
    { o:'TotalPVPMagicDamageReductionIgnore', c:'12_피해 감소', f:'(SumPVPMagicDamageReductionIgnore + SumPVPDamageReductionIgnore) * (1 + SumPVPMagicDamageReductionIgnoreAmplifyRate/10000 + SumPVPDamageReductionIgnoreAmplifyRate/10000) * MulW(PVPDamageReductionIgnoreWeakenRate)', i:['PVPDamageReductionIgnore','PVPDamageReductionIgnoreAmplifyRate','PVPDamageReductionIgnoreWeakenRate','PVPMagicDamageReductionIgnore','PVPMagicDamageReductionIgnoreAmplifyRate'] },
    { o:'TotalPVPMeleeDamageReductionRate', c:'12_피해 감소', f:'SumPVPMeleeDamageReductionRate + SumPVPDamageReductionRate', i:['PVPDamageReductionRate','PVPMeleeDamageReductionRate'] },
    { o:'TotalPVPRangedDamageReductionRate', c:'12_피해 감소', f:'SumPVPRangedDamageReductionRate + SumPVPDamageReductionRate', i:['PVPDamageReductionRate','PVPRangedDamageReductionRate'] },
    { o:'TotalPVPMagicDamageReductionRate', c:'12_피해 감소', f:'SumPVPMagicDamageReductionRate + SumPVPDamageReductionRate', i:['PVPDamageReductionRate','PVPMagicDamageReductionRate'] },
    { o:'TotalPVPSkillDamageReduction', c:'12_피해 감소', f:'SumPVPSkillDamageReduction', i:['PVPSkillDamageReduction'] },
    { o:'TotalPVPSkillDamageReductionIgnore', c:'12_피해 감소', f:'(SumPVPMeleeSkillDamageReductionIgnore + SumPVPSkillDamageReductionIgnore) * (1 + SumPVPMeleeSkillDamageReductionIgnoreAmplifyRate/10000 + SumPVPSkillDamageReductionIgnoreAmplifyRate/10000) * MulW(PVPSkillDamageReductionIgnoreWeakenRate)', i:['PVPMeleeSkillDamageReductionIgnore','PVPMeleeSkillDamageReductionIgnoreAmplifyRate','PVPSkillDamageReductionIgnore','PVPSkillDamageReductionIgnoreAmplifyRate','PVPSkillDamageReductionIgnoreWeakenRate'] },

    // ─── 15_경험치/재화/드랍 ───────────────────────────────────────────
    { o:'TotalEXPBonus', c:'15_경험치/재화/드랍', f:'SumEXPBonus', i:['EXPBonus'] },
    { o:'TotalCPBonus', c:'15_경험치/재화/드랍', f:'SumCPBonus', i:['CPBonus'] },
    { o:'TotalItemDropBonus', c:'15_경험치/재화/드랍', f:'SumItemDropBonus', i:['ItemDropBonus'] },

    // ─── 06_치명타 — 일반공격/스킬 추가 치명타 (Normal/Skill ExtraCritical) ─
    { o:'TotalNormalMeleeExtraCritical', c:'06_치명타', f:'SumNormalMeleeExtraCritical + SumNormalExtraCritical', i:['NormalExtraCritical','NormalMeleeExtraCritical'] },
    { o:'TotalNormalRangedExtraCritical', c:'06_치명타', f:'SumNormalRangedExtraCritical + SumNormalExtraCritical', i:['NormalExtraCritical','NormalRangedExtraCritical'] },
    { o:'TotalNormalMagicExtraCritical', c:'06_치명타', f:'SumNormalMagicExtraCritical + SumNormalExtraCritical', i:['NormalExtraCritical','NormalMagicExtraCritical'] },
    { o:'TotalNormalMeleeExtraCriticalResist', c:'07_치명타 저항/감소', f:'SumNormalMeleeExtraCriticalResist + SumNormalExtraCriticalResist', i:['NormalExtraCriticalResist','NormalMeleeExtraCriticalResist'] },
    { o:'TotalNormalRangedExtraCriticalResist', c:'07_치명타 저항/감소', f:'SumNormalRangedExtraCriticalResist + SumNormalExtraCriticalResist', i:['NormalExtraCriticalResist','NormalRangedExtraCriticalResist'] },
    { o:'TotalNormalMagicExtraCriticalResist', c:'07_치명타 저항/감소', f:'SumNormalMagicExtraCriticalResist + SumNormalExtraCriticalResist', i:['NormalExtraCriticalResist','NormalMagicExtraCriticalResist'] },
    { o:'TotalPVPNormalMeleeExtraCritical', c:'06_치명타', f:'SumPVPNormalMeleeExtraCritical + SumPVPNormalExtraCritical', i:['PVPNormalExtraCritical','PVPNormalMeleeExtraCritical'] },
    { o:'TotalPVPNormalRangedExtraCritical', c:'06_치명타', f:'SumPVPNormalRangedExtraCritical + SumPVPNormalExtraCritical', i:['PVPNormalExtraCritical','PVPNormalRangedExtraCritical'] },
    { o:'TotalPVPNormalMagicExtraCritical', c:'06_치명타', f:'SumPVPNormalMagicExtraCritical + SumPVPNormalExtraCritical', i:['PVPNormalExtraCritical','PVPNormalMagicExtraCritical'] },
    { o:'TotalPVPNormalMeleeExtraCriticalResist', c:'07_치명타 저항/감소', f:'SumPVPNormalMeleeExtraCriticalResist + SumPVPNormalExtraCriticalResist', i:['PVPNormalExtraCriticalResist','PVPNormalMeleeExtraCriticalResist'] },
    { o:'TotalPVPNormalRangedExtraCriticalResist', c:'07_치명타 저항/감소', f:'SumPVPNormalRangedExtraCriticalResist + SumPVPNormalExtraCriticalResist', i:['PVPNormalExtraCriticalResist','PVPNormalRangedExtraCriticalResist'] },
    { o:'TotalPVPNormalMagicExtraCriticalResist', c:'07_치명타 저항/감소', f:'SumPVPNormalMagicExtraCriticalResist + SumPVPNormalExtraCriticalResist', i:['PVPNormalExtraCriticalResist','PVPNormalMagicExtraCriticalResist'] },
    { o:'TotalSkillMeleeExtraCritical', c:'06_치명타', f:'SumSkillMeleeExtraCritical + SumSkillExtraCritical', i:['SkillExtraCritical','SkillMeleeExtraCritical'] },
    { o:'TotalSkillRangedExtraCritical', c:'06_치명타', f:'SumSkillRangedExtraCritical + SumSkillExtraCritical', i:['SkillExtraCritical','SkillRangedExtraCritical'] },
    { o:'TotalSkillMagicExtraCritical', c:'06_치명타', f:'SumSkillMagicExtraCritical + SumSkillExtraCritical', i:['SkillExtraCritical','SkillMagicExtraCritical'] },
    { o:'TotalSkillMeleeExtraCriticalResist', c:'07_치명타 저항/감소', f:'SumSkillMeleeExtraCriticalResist + SumSkillExtraCriticalResist', i:['SkillExtraCriticalResist','SkillMeleeExtraCriticalResist'] },
    { o:'TotalSkillRangedExtraCriticalResist', c:'07_치명타 저항/감소', f:'SumSkillRangedExtraCriticalResist + SumSkillExtraCriticalResist', i:['SkillExtraCriticalResist','SkillRangedExtraCriticalResist'] },
    { o:'TotalSkillMagicExtraCriticalResist', c:'07_치명타 저항/감소', f:'SumSkillMagicExtraCriticalResist + SumSkillExtraCriticalResist', i:['SkillExtraCriticalResist','SkillMagicExtraCriticalResist'] },
    { o:'TotalPVPSkillMeleeExtraCritical', c:'06_치명타', f:'SumPVPSkillMeleeExtraCritical + SumPVPSkillExtraCritical', i:['PVPSkillExtraCritical','PVPSkillMeleeExtraCritical'] },
    { o:'TotalPVPSkillRangedExtraCritical', c:'06_치명타', f:'SumPVPSkillRangedExtraCritical + SumPVPSkillExtraCritical', i:['PVPSkillExtraCritical','PVPSkillRangedExtraCritical'] },
    { o:'TotalPVPSkillMagicExtraCritical', c:'06_치명타', f:'SumPVPSkillMagicExtraCritical + SumPVPSkillExtraCritical', i:['PVPSkillExtraCritical','PVPSkillMagicExtraCritical'] },
    { o:'TotalPVPSkillMeleeExtraCriticalResist', c:'07_치명타 저항/감소', f:'SumPVPSkillMeleeExtraCriticalResist + SumPVPSkillExtraCriticalResist', i:['PVPSkillExtraCriticalResist','PVPSkillMeleeExtraCriticalResist'] },
    { o:'TotalPVPSkillRangedExtraCriticalResist', c:'07_치명타 저항/감소', f:'SumPVPSkillRangedExtraCriticalResist + SumPVPSkillExtraCriticalResist', i:['PVPSkillExtraCriticalResist','PVPSkillRangedExtraCriticalResist'] },
    { o:'TotalPVPSkillMagicExtraCriticalResist', c:'07_치명타 저항/감소', f:'SumPVPSkillMagicExtraCriticalResist + SumPVPSkillExtraCriticalResist', i:['PVPSkillExtraCriticalResist','PVPSkillMagicExtraCriticalResist'] },

    // ─── 06_치명타 — PVE 치명타율 ────────────────────────────────────────
    { o:'TotalPVEMeleeCritical', c:'06_치명타', f:'(SumPVEMeleeCritical + SumPVECritical) * MulW(PVEMeleeCriticalWeakenRate) * MulW(PVECriticalWeakenRate)', i:['PVECritical','PVECriticalWeakenRate','PVEMeleeCritical','PVEMeleeCriticalWeakenRate'] },
    { o:'TotalPVERangedCritical', c:'06_치명타', f:'(SumPVERangedCritical + SumPVECritical) * MulW(PVERangedCriticalWeakenRate) * MulW(PVECriticalWeakenRate)', i:['PVECritical','PVECriticalWeakenRate','PVERangedCritical','PVERangedCriticalWeakenRate'] },
    { o:'TotalPVEMagicCritical', c:'06_치명타', f:'(SumPVEMagicCritical + SumPVECritical) * MulW(PVEMagicCriticalWeakenRate) * MulW(PVECriticalWeakenRate)', i:['PVECritical','PVECriticalWeakenRate','PVEMagicCritical','PVEMagicCriticalWeakenRate'] },
    { o:'TotalPVEMeleeCriticalResist', c:'07_치명타 저항/감소', f:'SumPVEMeleeCriticalResist + SumPVECriticalResist', i:['PVECriticalResist','PVEMeleeCriticalResist'] },
    { o:'TotalPVERangedCriticalResist', c:'07_치명타 저항/감소', f:'SumPVERangedCriticalResist + SumPVECriticalResist', i:['PVECriticalResist','PVERangedCriticalResist'] },
    { o:'TotalPVEMagicCriticalResist', c:'07_치명타 저항/감소', f:'SumPVEMagicCriticalResist + SumPVECriticalResist', i:['PVECriticalResist','PVEMagicCriticalResist'] },
    { o:'TotalPVENormalMeleeExtraCritical', c:'06_치명타', f:'SumPVENormalMeleeExtraCritical + SumPVENormalExtraCritical', i:['PVENormalExtraCritical','PVENormalMeleeExtraCritical'] },
    { o:'TotalPVENormalRangedExtraCritical', c:'06_치명타', f:'SumPVENormalRangedExtraCritical + SumPVENormalExtraCritical', i:['PVENormalExtraCritical','PVENormalRangedExtraCritical'] },
    { o:'TotalPVENormalMagicExtraCritical', c:'06_치명타', f:'SumPVENormalMagicExtraCritical + SumPVENormalExtraCritical', i:['PVENormalExtraCritical','PVENormalMagicExtraCritical'] },
    { o:'TotalPVENormalMeleeExtraCriticalResist', c:'07_치명타 저항/감소', f:'SumPVENormalMeleeExtraCriticalResist + SumPVENormalExtraCriticalResist', i:['PVENormalExtraCriticalResist','PVENormalMeleeExtraCriticalResist'] },
    { o:'TotalPVENormalRangedExtraCriticalResist', c:'07_치명타 저항/감소', f:'SumPVENormalRangedExtraCriticalResist + SumPVENormalExtraCriticalResist', i:['PVENormalExtraCriticalResist','PVENormalRangedExtraCriticalResist'] },
    { o:'TotalPVENormalMagicExtraCriticalResist', c:'07_치명타 저항/감소', f:'SumPVENormalMagicExtraCriticalResist + SumPVENormalExtraCriticalResist', i:['PVENormalExtraCriticalResist','PVENormalMagicExtraCriticalResist'] },
    { o:'TotalPVESkillMeleeExtraCritical', c:'06_치명타', f:'SumPVESkillMeleeExtraCritical + SumPVESkillExtraCritical', i:['PVESkillExtraCritical','PVESkillMeleeExtraCritical'] },
    { o:'TotalPVESkillRangedExtraCritical', c:'06_치명타', f:'SumPVESkillRangedExtraCritical + SumPVESkillExtraCritical', i:['PVESkillExtraCritical','PVESkillRangedExtraCritical'] },
    { o:'TotalPVESkillMagicExtraCritical', c:'06_치명타', f:'SumPVESkillMagicExtraCritical + SumPVESkillExtraCritical', i:['PVESkillExtraCritical','PVESkillMagicExtraCritical'] },
    { o:'TotalPVESkillMeleeExtraCriticalResist', c:'07_치명타 저항/감소', f:'SumPVESkillMeleeExtraCriticalResist + SumPVESkillExtraCriticalResist', i:['PVESkillExtraCriticalResist','PVESkillMeleeExtraCriticalResist'] },
    { o:'TotalPVESkillRangedExtraCriticalResist', c:'07_치명타 저항/감소', f:'SumPVESkillRangedExtraCriticalResist + SumPVESkillExtraCriticalResist', i:['PVESkillExtraCriticalResist','PVESkillRangedExtraCriticalResist'] },
    { o:'TotalPVESkillMagicExtraCriticalResist', c:'07_치명타 저항/감소', f:'SumPVESkillMagicExtraCriticalResist + SumPVESkillExtraCriticalResist', i:['PVESkillExtraCriticalResist','PVESkillMagicExtraCriticalResist'] },

    // ─── 09_명중 — PVE ──────────────────────────────────────────────
    { o:'TotalPVEMeleeAccuracy', c:'09_명중', f:'(SumPVEMeleeAccuracy + SumPVEAccuracy) * (1 + SumPVEMeleeAccuracyAmplifyRate/10000 + SumPVEAccuracyAmplifyRate/10000) * MulW(PVEMeleeAccuracyWeakenRate) * MulW(PVEAccuracyWeakenRate)', i:['PVEAccuracy','PVEAccuracyAmplifyRate','PVEAccuracyWeakenRate','PVEMeleeAccuracy','PVEMeleeAccuracyAmplifyRate','PVEMeleeAccuracyWeakenRate'] },
    { o:'TotalPVERangedAccuracy', c:'09_명중', f:'(SumPVERangedAccuracy + SumPVEAccuracy) * (1 + SumPVERangedAccuracyAmplifyRate/10000 + SumPVEAccuracyAmplifyRate/10000) * MulW(PVERangedAccuracyWeakenRate) * MulW(PVEAccuracyWeakenRate)', i:['PVEAccuracy','PVEAccuracyAmplifyRate','PVEAccuracyWeakenRate','PVERangedAccuracy','PVERangedAccuracyAmplifyRate','PVERangedAccuracyWeakenRate'] },
    { o:'TotalPVEMagicAccuracy', c:'09_명중', f:'(SumPVEMagicAccuracy + SumPVEAccuracy) * (1 + SumPVEMagicAccuracyAmplifyRate/10000 + SumPVEAccuracyAmplifyRate/10000) * MulW(PVEMagicAccuracyWeakenRate) * MulW(PVEAccuracyWeakenRate)', i:['PVEAccuracy','PVEAccuracyAmplifyRate','PVEAccuracyWeakenRate','PVEMagicAccuracy','PVEMagicAccuracyAmplifyRate','PVEMagicAccuracyWeakenRate'] },
    { o:'TotalPVEMeleeEvasion', c:'08_회피', f:'SumPVEMeleeEvasion + SumPVEEvasion', i:['PVEEvasion','PVEMeleeEvasion'] },
    { o:'TotalPVERangedEvasion', c:'08_회피', f:'SumPVERangedEvasion + SumPVEEvasion', i:['PVEEvasion','PVERangedEvasion'] },
    { o:'TotalPVEMagicEvasion', c:'08_회피', f:'SumPVEMagicEvasion + SumPVEEvasion', i:['PVEEvasion','PVEMagicEvasion'] },
    { o:'TotalPVEPhysicalDefense', c:'05_방어력', f:'SumPVEPhysicalDefense', i:['PVEPhysicalDefense'] },
    { o:'TotalPVEMagicDefense', c:'05_방어력', f:'SumPVEMagicDefense', i:['PVEMagicDefense'] },

    // ─── 10_상태이상 적중 — 빙결/화상/출혈/중독/한기 ──────────────────────
    { o:'TotalProvokeHit', c:'10_상태이상 적중', f:'(SumProvokeHit + SumAbnormalHit) * MulW(ProvokeHitWeakenRate) * MulW(AbnormalHitWeakenRate)', i:['AbnormalHit','AbnormalHitWeakenRate','ProvokeHit','ProvokeHitWeakenRate'] },
    { o:'TotalBurnHit', c:'10_상태이상 적중', f:'(SumBurnHit + SumAbnormalHit) * MulW(BurnHitWeakenRate) * MulW(AbnormalHitWeakenRate)', i:['AbnormalHit','AbnormalHitWeakenRate','BurnHit','BurnHitWeakenRate'] },
    { o:'TotalBleedingHit', c:'10_상태이상 적중', f:'(SumBleedingHit + SumAbnormalHit) * MulW(BleedingHitWeakenRate) * MulW(AbnormalHitWeakenRate)', i:['AbnormalHit','AbnormalHitWeakenRate','BleedingHit','BleedingHitWeakenRate'] },
    { o:'TotalPoisonHit', c:'10_상태이상 적중', f:'(SumPoisonHit + SumAbnormalHit) * MulW(PoisonHitWeakenRate) * MulW(AbnormalHitWeakenRate)', i:['AbnormalHit','AbnormalHitWeakenRate','PoisonHit','PoisonHitWeakenRate'] },
    { o:'TotalColdHit', c:'10_상태이상 적중', f:'(SumColdHit + SumAbnormalHit) * MulW(ColdHitWeakenRate) * MulW(AbnormalHitWeakenRate)', i:['AbnormalHit','AbnormalHitWeakenRate','ColdHit','ColdHitWeakenRate'] },

    // ─── 10_상태이상 적중 — PVP ──────────────────────────────────────
    { o:'TotalPVPDebuffHit', c:'10_상태이상 적중', f:'SumPVPDebuffHit + SumPVPAbnormalHit', i:['PVPAbnormalHit','PVPDebuffHit'] },
    { o:'TotalPVPStunHit', c:'10_상태이상 적중', f:'SumPVPStunHit + SumPVPAbnormalHit', i:['PVPAbnormalHit','PVPStunHit'] },
    { o:'TotalPVPParalyzeHit', c:'10_상태이상 적중', f:'SumPVPParalyzeHit + SumPVPAbnormalHit', i:['PVPAbnormalHit','PVPParalyzeHit'] },
    { o:'TotalPVPProvokeHit', c:'10_상태이상 적중', f:'SumPVPProvokeHit + SumPVPAbnormalHit', i:['PVPAbnormalHit','PVPProvokeHit'] },
    { o:'TotalPVPHoldHit', c:'10_상태이상 적중', f:'SumPVPHoldHit + SumPVPAbnormalHit', i:['PVPAbnormalHit','PVPHoldHit'] },
    { o:'TotalPVPSleepHit', c:'10_상태이상 적중', f:'SumPVPSleepHit + SumPVPAbnormalHit', i:['PVPAbnormalHit','PVPSleepHit'] },
    { o:'TotalPVPSilenceHit', c:'10_상태이상 적중', f:'SumPVPSilenceHit + SumPVPAbnormalHit', i:['PVPAbnormalHit','PVPSilenceHit'] },
    { o:'TotalPVPSlowHit', c:'10_상태이상 적중', f:'SumPVPSlowHit + SumPVPAbnormalHit', i:['PVPAbnormalHit','PVPSlowHit'] },
    { o:'TotalPVPBurnHit', c:'10_상태이상 적중', f:'SumPVPBurnHit + SumPVPAbnormalHit', i:['PVPAbnormalHit','PVPBurnHit'] },
    { o:'TotalPVPBleedingHit', c:'10_상태이상 적중', f:'SumPVPBleedingHit + SumPVPAbnormalHit', i:['PVPAbnormalHit','PVPBleedingHit'] },
    { o:'TotalPVPPoisonHit', c:'10_상태이상 적중', f:'SumPVPPoisonHit + SumPVPAbnormalHit', i:['PVPAbnormalHit','PVPPoisonHit'] },
    { o:'TotalPVPColdHit', c:'10_상태이상 적중', f:'SumPVPColdHit + SumPVPAbnormalHit', i:['PVPAbnormalHit','PVPColdHit'] },

    // ─── 10_상태이상 적중 — PVE ──────────────────────────────────────
    { o:'TotalPVEDebuffHit', c:'10_상태이상 적중', f:'SumPVEDebuffHit + SumPVEAbnormalHit', i:['PVEAbnormalHit','PVEDebuffHit'] },
    { o:'TotalPVEStunHit', c:'10_상태이상 적중', f:'SumPVEStunHit + SumPVEAbnormalHit', i:['PVEAbnormalHit','PVEStunHit'] },
    { o:'TotalPVEParalyzeHit', c:'10_상태이상 적중', f:'SumPVEParalyzeHit + SumPVEAbnormalHit', i:['PVEAbnormalHit','PVEParalyzeHit'] },
    { o:'TotalPVEProvokeHit', c:'10_상태이상 적중', f:'SumPVEProvokeHit + SumPVEAbnormalHit', i:['PVEAbnormalHit','PVEProvokeHit'] },
    { o:'TotalPVEHoldHit', c:'10_상태이상 적중', f:'SumPVEHoldHit + SumPVEAbnormalHit', i:['PVEAbnormalHit','PVEHoldHit'] },
    { o:'TotalPVESleepHit', c:'10_상태이상 적중', f:'SumPVESleepHit + SumPVEAbnormalHit', i:['PVEAbnormalHit','PVESleepHit'] },
    { o:'TotalPVESilenceHit', c:'10_상태이상 적중', f:'SumPVESilenceHit + SumPVEAbnormalHit', i:['PVEAbnormalHit','PVESilenceHit'] },
    { o:'TotalPVESlowHit', c:'10_상태이상 적중', f:'SumPVESlowHit + SumPVEAbnormalHit', i:['PVEAbnormalHit','PVESlowHit'] },
    { o:'TotalPVEBurnHit', c:'10_상태이상 적중', f:'SumPVEBurnHit + SumPVEAbnormalHit', i:['PVEAbnormalHit','PVEBurnHit'] },
    { o:'TotalPVEBleedingHit', c:'10_상태이상 적중', f:'SumPVEBleedingHit + SumPVEAbnormalHit', i:['PVEAbnormalHit','PVEBleedingHit'] },
    { o:'TotalPVEPoisonHit', c:'10_상태이상 적중', f:'SumPVEPoisonHit + SumPVEAbnormalHit', i:['PVEAbnormalHit','PVEPoisonHit'] },
    { o:'TotalPVEColdHit', c:'10_상태이상 적중', f:'SumPVEColdHit + SumPVEAbnormalHit', i:['PVEAbnormalHit','PVEColdHit'] },

    // ─── 11_상태이상 저항 — 빙결/화상/출혈/중독/한기 ──────────────────────
    { o:'TotalProvokeResist', c:'11_상태이상 저항', f:'(SumProvokeResist + SumAbnormalResist) * MulW(ProvokeResistWeakenRate) * MulW(AbnormalResistWeakenRate)', i:['AbnormalResist','AbnormalResistWeakenRate','ProvokeResist','ProvokeResistWeakenRate'] },
    { o:'TotalBurnResist', c:'11_상태이상 저항', f:'(SumBurnResist + SumAbnormalResist) * MulW(BurnResistWeakenRate) * MulW(AbnormalResistWeakenRate)', i:['AbnormalResist','AbnormalResistWeakenRate','BurnResist','BurnResistWeakenRate'] },
    { o:'TotalBleedingResist', c:'11_상태이상 저항', f:'(SumBleedingResist + SumAbnormalResist) * MulW(BleedingResistWeakenRate) * MulW(AbnormalResistWeakenRate)', i:['AbnormalResist','AbnormalResistWeakenRate','BleedingResist','BleedingResistWeakenRate'] },
    { o:'TotalPoisonResist', c:'11_상태이상 저항', f:'(SumPoisonResist + SumAbnormalResist) * MulW(PoisonResistWeakenRate) * MulW(AbnormalResistWeakenRate)', i:['AbnormalResist','AbnormalResistWeakenRate','PoisonResist','PoisonResistWeakenRate'] },
    { o:'TotalColdResist', c:'11_상태이상 저항', f:'(SumColdResist + SumAbnormalResist) * MulW(ColdResistWeakenRate) * MulW(AbnormalResistWeakenRate)', i:['AbnormalResist','AbnormalResistWeakenRate','ColdResist','ColdResistWeakenRate'] },

    // ─── 11_상태이상 저항 — PVP ──────────────────────────────────────
    { o:'TotalPVPDebuffResist', c:'11_상태이상 저항', f:'SumPVPDebuffResist + SumPVPAbnormalResist', i:['PVPAbnormalResist','PVPDebuffResist'] },
    { o:'TotalPVPStunResist', c:'11_상태이상 저항', f:'SumPVPStunResist + SumPVPAbnormalResist', i:['PVPAbnormalResist','PVPStunResist'] },
    { o:'TotalPVPParalyzeResist', c:'11_상태이상 저항', f:'SumPVPParalyzeResist + SumPVPAbnormalResist', i:['PVPAbnormalResist','PVPParalyzeResist'] },
    { o:'TotalPVPProvokeResist', c:'11_상태이상 저항', f:'SumPVPProvokeResist + SumPVPAbnormalResist', i:['PVPAbnormalResist','PVPProvokeResist'] },
    { o:'TotalPVPHoldResist', c:'11_상태이상 저항', f:'SumPVPHoldResist + SumPVPAbnormalResist', i:['PVPAbnormalResist','PVPHoldResist'] },
    { o:'TotalPVPSleepResist', c:'11_상태이상 저항', f:'SumPVPSleepResist + SumPVPAbnormalResist', i:['PVPAbnormalResist','PVPSleepResist'] },
    { o:'TotalPVPSilenceResist', c:'11_상태이상 저항', f:'SumPVPSilenceResist + SumPVPAbnormalResist', i:['PVPAbnormalResist','PVPSilenceResist'] },
    { o:'TotalPVPSlowResist', c:'11_상태이상 저항', f:'SumPVPSlowResist + SumPVPAbnormalResist', i:['PVPAbnormalResist','PVPSlowResist'] },
    { o:'TotalPVPBurnResist', c:'11_상태이상 저항', f:'SumPVPBurnResist + SumPVPAbnormalResist', i:['PVPAbnormalResist','PVPBurnResist'] },
    { o:'TotalPVPBleedingResist', c:'11_상태이상 저항', f:'SumPVPBleedingResist + SumPVPAbnormalResist', i:['PVPAbnormalResist','PVPBleedingResist'] },
    { o:'TotalPVPPoisonResist', c:'11_상태이상 저항', f:'SumPVPPoisonResist + SumPVPAbnormalResist', i:['PVPAbnormalResist','PVPPoisonResist'] },
    { o:'TotalPVPColdResist', c:'11_상태이상 저항', f:'SumPVPColdResist + SumPVPAbnormalResist', i:['PVPAbnormalResist','PVPColdResist'] },

    // ─── 11_상태이상 저항 — PVE ──────────────────────────────────────
    { o:'TotalPVEDebuffResist', c:'11_상태이상 저항', f:'SumPVEDebuffResist + SumPVEAbnormalResist', i:['PVEAbnormalResist','PVEDebuffResist'] },
    { o:'TotalPVEStunResist', c:'11_상태이상 저항', f:'SumPVEStunResist + SumPVEAbnormalResist', i:['PVEAbnormalResist','PVEStunResist'] },
    { o:'TotalPVEParalyzeResist', c:'11_상태이상 저항', f:'SumPVEParalyzeResist + SumPVEAbnormalResist', i:['PVEAbnormalResist','PVEParalyzeResist'] },
    { o:'TotalPVEProvokeResist', c:'11_상태이상 저항', f:'SumPVEProvokeResist + SumPVEAbnormalResist', i:['PVEAbnormalResist','PVEProvokeResist'] },
    { o:'TotalPVEHoldResist', c:'11_상태이상 저항', f:'SumPVEHoldResist + SumPVEAbnormalResist', i:['PVEAbnormalResist','PVEHoldResist'] },
    { o:'TotalPVESleepResist', c:'11_상태이상 저항', f:'SumPVESleepResist + SumPVEAbnormalResist', i:['PVEAbnormalResist','PVESleepResist'] },
    { o:'TotalPVESilenceResist', c:'11_상태이상 저항', f:'SumPVESilenceResist + SumPVEAbnormalResist', i:['PVEAbnormalResist','PVESilenceResist'] },
    { o:'TotalPVESlowResist', c:'11_상태이상 저항', f:'SumPVESlowResist + SumPVEAbnormalResist', i:['PVEAbnormalResist','PVESlowResist'] },
    { o:'TotalPVEBurnResist', c:'11_상태이상 저항', f:'SumPVEBurnResist + SumPVEAbnormalResist', i:['PVEAbnormalResist','PVEBurnResist'] },
    { o:'TotalPVEBleedingResist', c:'11_상태이상 저항', f:'SumPVEBleedingResist + SumPVEAbnormalResist', i:['PVEAbnormalResist','PVEBleedingResist'] },
    { o:'TotalPVEPoisonResist', c:'11_상태이상 저항', f:'SumPVEPoisonResist + SumPVEAbnormalResist', i:['PVEAbnormalResist','PVEPoisonResist'] },
    { o:'TotalPVEColdResist', c:'11_상태이상 저항', f:'SumPVEColdResist + SumPVEAbnormalResist', i:['PVEAbnormalResist','PVEColdResist'] },

    // ─── 04_공격력 — PVE 일반공격/스킬 (근/원/마 최소·최대) ─────────────
    { o:'TotalPVEMeleeMinAttack', c:'04_공격력', f:'(SumPVEMeleeMinAttack + SumPVEAttack + SumPVEMinAttack + SumPVEMeleeAttack) * (1 + SumPVEAttackAmplifyRate/10000 + SumPVEMeleeAttackAmplifyRate/10000) * MulW(PVEMeleeAttackWeakenRate) * MulW(PVEAttackWeakenRate)', i:['PVEAttack','PVEAttackAmplifyRate','PVEAttackWeakenRate','PVEMeleeAttack','PVEMeleeAttackAmplifyRate','PVEMeleeAttackWeakenRate','PVEMeleeMinAttack','PVEMinAttack'] },
    { o:'TotalPVERangedMinAttack', c:'04_공격력', f:'(SumPVERangedMinAttack + SumPVEAttack + SumPVEMinAttack + SumPVERangedAttack) * (1 + SumPVEAttackAmplifyRate/10000 + SumPVERangedAttackAmplifyRate/10000) * MulW(PVERangedAttackWeakenRate) * MulW(PVEAttackWeakenRate)', i:['PVEAttack','PVEAttackAmplifyRate','PVEAttackWeakenRate','PVEMinAttack','PVERangedAttack','PVERangedAttackAmplifyRate','PVERangedAttackWeakenRate','PVERangedMinAttack'] },
    { o:'TotalPVEMagicMinAttack', c:'04_공격력', f:'(SumPVEMagicMinAttack + SumPVEAttack + SumPVEMinAttack + SumPVEMagicAttack) * (1 + SumPVEAttackAmplifyRate/10000 + SumPVEMagicAttackAmplifyRate/10000) * MulW(PVEMagicAttackWeakenRate) * MulW(PVEAttackWeakenRate)', i:['PVEAttack','PVEAttackAmplifyRate','PVEAttackWeakenRate','PVEMagicAttack','PVEMagicAttackAmplifyRate','PVEMagicAttackWeakenRate','PVEMagicMinAttack','PVEMinAttack'] },
    { o:'TotalPVEMeleeMaxAttack', c:'04_공격력', f:'(SumPVEMeleeMaxAttack + SumPVEAttack + SumPVEMaxAttack + SumPVEMeleeAttack) * (1 + SumPVEAttackAmplifyRate/10000 + SumPVEMeleeAttackAmplifyRate/10000) * MulW(PVEMeleeAttackWeakenRate) * MulW(PVEAttackWeakenRate)', i:['PVEAttack','PVEAttackAmplifyRate','PVEAttackWeakenRate','PVEMaxAttack','PVEMeleeAttack','PVEMeleeAttackAmplifyRate','PVEMeleeAttackWeakenRate','PVEMeleeMaxAttack'] },
    { o:'TotalPVERangedMaxAttack', c:'04_공격력', f:'(SumPVERangedMaxAttack + SumPVEAttack + SumPVEMaxAttack + SumPVERangedAttack) * (1 + SumPVEAttackAmplifyRate/10000 + SumPVERangedAttackAmplifyRate/10000) * MulW(PVERangedAttackWeakenRate) * MulW(PVEAttackWeakenRate)', i:['PVEAttack','PVEAttackAmplifyRate','PVEAttackWeakenRate','PVEMaxAttack','PVERangedAttack','PVERangedAttackAmplifyRate','PVERangedAttackWeakenRate','PVERangedMaxAttack'] },
    { o:'TotalPVEMagicMaxAttack', c:'04_공격력', f:'(SumPVEMagicMaxAttack + SumPVEAttack + SumPVEMaxAttack + SumPVEMagicAttack) * (1 + SumPVEAttackAmplifyRate/10000 + SumPVEMagicAttackAmplifyRate/10000) * MulW(PVEMagicAttackWeakenRate) * MulW(PVEAttackWeakenRate)', i:['PVEAttack','PVEAttackAmplifyRate','PVEAttackWeakenRate','PVEMagicAttack','PVEMagicAttackAmplifyRate','PVEMagicAttackWeakenRate','PVEMagicMaxAttack','PVEMaxAttack'] },
    { o:'TotalPVEAtCriticalMeleeAttack', c:'06_치명타', f:'(SumPVEAtCriticalMeleeAttack + SumPVEAtCriticalAttack) * (1 + SumPVEAtCriticalAttackAmplifyRate/10000 + SumPVEAtCriticalMeleeAttackAmplifyRate/10000) * MulW(PVEAtCriticalAttackWeakenRate)', i:['PVEAtCriticalAttack','PVEAtCriticalAttackAmplifyRate','PVEAtCriticalAttackWeakenRate','PVEAtCriticalMeleeAttack','PVEAtCriticalMeleeAttackAmplifyRate'] },
    { o:'TotalPVEAtCriticalRangedAttack', c:'06_치명타', f:'(SumPVEAtCriticalRangedAttack + SumPVEAtCriticalAttack) * (1 + SumPVEAtCriticalAttackAmplifyRate/10000 + SumPVEAtCriticalRangedAttackAmplifyRate/10000) * MulW(PVEAtCriticalAttackWeakenRate)', i:['PVEAtCriticalAttack','PVEAtCriticalAttackAmplifyRate','PVEAtCriticalAttackWeakenRate','PVEAtCriticalRangedAttack','PVEAtCriticalRangedAttackAmplifyRate'] },
    { o:'TotalPVEAtCriticalMagicAttack', c:'06_치명타', f:'(SumPVEAtCriticalMagicAttack + SumPVEAtCriticalAttack) * (1 + SumPVEAtCriticalAttackAmplifyRate/10000 + SumPVEAtCriticalMagicAttackAmplifyRate/10000) * MulW(PVEAtCriticalAttackWeakenRate)', i:['PVEAtCriticalAttack','PVEAtCriticalAttackAmplifyRate','PVEAtCriticalAttackWeakenRate','PVEAtCriticalMagicAttack','PVEAtCriticalMagicAttackAmplifyRate'] },

    // ─── 04_공격력 — 일반공격(Normal) 근/원/마 ─────────────────────────
    { o:'TotalNormalMeleeMinAttack', c:'04_공격력', f:'SumNormalMeleeMinAttack + SumNormalMeleeAttack + SumNormalMinAttack + SumNormalAttack', i:['NormalAttack','NormalMeleeAttack','NormalMeleeMinAttack','NormalMinAttack'] },
    { o:'TotalNormalMeleeMaxAttack', c:'04_공격력', f:'SumNormalMeleeMaxAttack + SumNormalMeleeAttack + SumNormalMaxAttack + SumNormalAttack', i:['NormalAttack','NormalMaxAttack','NormalMeleeAttack','NormalMeleeMaxAttack'] },
    { o:'TotalNormalRangedMinAttack', c:'04_공격력', f:'SumNormalRangedMinAttack + SumNormalRangedAttack + SumNormalMinAttack + SumNormalAttack', i:['NormalAttack','NormalMinAttack','NormalRangedAttack','NormalRangedMinAttack'] },
    { o:'TotalNormalRangedMaxAttack', c:'04_공격력', f:'SumNormalRangedMaxAttack + SumNormalRangedAttack + SumNormalMaxAttack + SumNormalAttack', i:['NormalAttack','NormalMaxAttack','NormalRangedAttack','NormalRangedMaxAttack'] },
    { o:'TotalNormalMagicMinAttack', c:'04_공격력', f:'SumNormalMagicMinAttack + SumNormalMagicAttack + SumNormalMinAttack + SumNormalAttack', i:['NormalAttack','NormalMagicAttack','NormalMagicMinAttack','NormalMinAttack'] },
    { o:'TotalNormalMagicMaxAttack', c:'04_공격력', f:'SumNormalMagicMaxAttack + SumNormalMagicAttack + SumNormalMaxAttack + SumNormalAttack', i:['NormalAttack','NormalMagicAttack','NormalMagicMaxAttack','NormalMaxAttack'] },

    // ─── 04_공격력 — PVP/PVE 일반공격 근/원/마 ──────────────────────────
    { o:'TotalPVPNormalMeleeMinAttack', c:'04_공격력', f:'(SumPVPNormalMeleeMinAttack + SumPVPNormalMeleeAttack + SumPVPNormalMinAttack + SumPVPNormalAttack) * (1 + SumPVPNormalAttackAmplifyRate/10000) * MulW(PVPNormalAttackWeakenRate)', i:['PVPNormalAttack','PVPNormalAttackAmplifyRate','PVPNormalAttackWeakenRate','PVPNormalMeleeAttack','PVPNormalMeleeMinAttack','PVPNormalMinAttack'] },
    { o:'TotalPVPNormalMeleeMaxAttack', c:'04_공격력', f:'(SumPVPNormalMeleeMaxAttack + SumPVPNormalMeleeAttack + SumPVPNormalMaxAttack + SumPVPNormalAttack) * (1 + SumPVPNormalAttackAmplifyRate/10000) * MulW(PVPNormalAttackWeakenRate)', i:['PVPNormalAttack','PVPNormalAttackAmplifyRate','PVPNormalAttackWeakenRate','PVPNormalMaxAttack','PVPNormalMeleeAttack','PVPNormalMeleeMaxAttack'] },
    { o:'TotalPVPNormalRangedMinAttack', c:'04_공격력', f:'(SumPVPNormalRangedMinAttack + SumPVPNormalRangedAttack + SumPVPNormalMinAttack + SumPVPNormalAttack) * (1 + SumPVPNormalAttackAmplifyRate/10000) * MulW(PVPNormalAttackWeakenRate)', i:['PVPNormalAttack','PVPNormalAttackAmplifyRate','PVPNormalAttackWeakenRate','PVPNormalMinAttack','PVPNormalRangedAttack','PVPNormalRangedMinAttack'] },
    { o:'TotalPVPNormalRangedMaxAttack', c:'04_공격력', f:'(SumPVPNormalRangedMaxAttack + SumPVPNormalRangedAttack + SumPVPNormalMaxAttack + SumPVPNormalAttack) * (1 + SumPVPNormalAttackAmplifyRate/10000) * MulW(PVPNormalAttackWeakenRate)', i:['PVPNormalAttack','PVPNormalAttackAmplifyRate','PVPNormalAttackWeakenRate','PVPNormalMaxAttack','PVPNormalRangedAttack','PVPNormalRangedMaxAttack'] },
    { o:'TotalPVPNormalMagicMinAttack', c:'04_공격력', f:'(SumPVPNormalMagicMinAttack + SumPVPNormalMagicAttack + SumPVPNormalMinAttack + SumPVPNormalAttack) * (1 + SumPVPNormalAttackAmplifyRate/10000) * MulW(PVPNormalAttackWeakenRate)', i:['PVPNormalAttack','PVPNormalAttackAmplifyRate','PVPNormalAttackWeakenRate','PVPNormalMagicAttack','PVPNormalMagicMinAttack','PVPNormalMinAttack'] },
    { o:'TotalPVPNormalMagicMaxAttack', c:'04_공격력', f:'(SumPVPNormalMagicMaxAttack + SumPVPNormalMagicAttack + SumPVPNormalMaxAttack + SumPVPNormalAttack) * (1 + SumPVPNormalAttackAmplifyRate/10000) * MulW(PVPNormalAttackWeakenRate)', i:['PVPNormalAttack','PVPNormalAttackAmplifyRate','PVPNormalAttackWeakenRate','PVPNormalMagicAttack','PVPNormalMagicMaxAttack','PVPNormalMaxAttack'] },
    { o:'TotalPVENormalMeleeMinAttack', c:'04_공격력', f:'(SumPVENormalMeleeMinAttack + SumPVENormalMeleeAttack + SumPVENormalMinAttack + SumPVENormalAttack) * (1 + SumPVENormalAttackAmplifyRate/10000) * MulW(PVENormalAttackWeakenRate)', i:['PVENormalAttack','PVENormalAttackAmplifyRate','PVENormalAttackWeakenRate','PVENormalMeleeAttack','PVENormalMeleeMinAttack','PVENormalMinAttack'] },
    { o:'TotalPVENormalMeleeMaxAttack', c:'04_공격력', f:'(SumPVENormalMeleeMaxAttack + SumPVENormalMeleeAttack + SumPVENormalMaxAttack + SumPVENormalAttack) * (1 + SumPVENormalAttackAmplifyRate/10000) * MulW(PVENormalAttackWeakenRate)', i:['PVENormalAttack','PVENormalAttackAmplifyRate','PVENormalAttackWeakenRate','PVENormalMaxAttack','PVENormalMeleeAttack','PVENormalMeleeMaxAttack'] },
    { o:'TotalPVENormalRangedMinAttack', c:'04_공격력', f:'(SumPVENormalRangedMinAttack + SumPVENormalRangedAttack + SumPVENormalMinAttack + SumPVENormalAttack) * (1 + SumPVENormalAttackAmplifyRate/10000) * MulW(PVENormalAttackWeakenRate)', i:['PVENormalAttack','PVENormalAttackAmplifyRate','PVENormalAttackWeakenRate','PVENormalMinAttack','PVENormalRangedAttack','PVENormalRangedMinAttack'] },
    { o:'TotalPVENormalRangedMaxAttack', c:'04_공격력', f:'(SumPVENormalRangedMaxAttack + SumPVENormalRangedAttack + SumPVENormalMaxAttack + SumPVENormalAttack) * (1 + SumPVENormalAttackAmplifyRate/10000) * MulW(PVENormalAttackWeakenRate)', i:['PVENormalAttack','PVENormalAttackAmplifyRate','PVENormalAttackWeakenRate','PVENormalMaxAttack','PVENormalRangedAttack','PVENormalRangedMaxAttack'] },
    { o:'TotalPVENormalMagicMinAttack', c:'04_공격력', f:'(SumPVENormalMagicMinAttack + SumPVENormalMagicAttack + SumPVENormalMinAttack + SumPVENormalAttack) * (1 + SumPVENormalAttackAmplifyRate/10000) * MulW(PVENormalAttackWeakenRate)', i:['PVENormalAttack','PVENormalAttackAmplifyRate','PVENormalAttackWeakenRate','PVENormalMagicAttack','PVENormalMagicMinAttack','PVENormalMinAttack'] },
    { o:'TotalPVENormalMagicMaxAttack', c:'04_공격력', f:'(SumPVENormalMagicMaxAttack + SumPVENormalMagicAttack + SumPVENormalMaxAttack + SumPVENormalAttack) * (1 + SumPVENormalAttackAmplifyRate/10000) * MulW(PVENormalAttackWeakenRate)', i:['PVENormalAttack','PVENormalAttackAmplifyRate','PVENormalAttackWeakenRate','PVENormalMagicAttack','PVENormalMagicMaxAttack','PVENormalMaxAttack'] },

    // ─── 04_공격력 — 스킬(Skill) 근/원/마 ──────────────────────────────
    { o:'TotalSkillMeleeMinAttack', c:'04_공격력', f:'(SumSkillMeleeMinAttack + SumSkillMeleeAttack + SumSkillMinAttack + SumSkillAttack) * (1 + SumSkillAttackAmplifyRate/10000) * MulW(SkillAttackWeakenRate)', i:['SkillAttack','SkillAttackAmplifyRate','SkillAttackWeakenRate','SkillMeleeAttack','SkillMeleeMinAttack','SkillMinAttack'] },
    { o:'TotalSkillMeleeMaxAttack', c:'04_공격력', f:'(SumSkillMeleeMaxAttack + SumSkillMeleeAttack + SumSkillMaxAttack + SumSkillAttack) * (1 + SumSkillMaxAttackAmplifyRate/10000 + SumSkillAttackAmplifyRate/10000) * MulW(SkillAttackWeakenRate)', i:['SkillAttack','SkillAttackAmplifyRate','SkillAttackWeakenRate','SkillMaxAttack','SkillMaxAttackAmplifyRate','SkillMeleeAttack','SkillMeleeMaxAttack'] },
    { o:'TotalSkillRangedMinAttack', c:'04_공격력', f:'(SumSkillRangedMinAttack + SumSkillRangedAttack + SumSkillMinAttack + SumSkillAttack) * (1 + SumSkillAttackAmplifyRate/10000) * MulW(SkillAttackWeakenRate)', i:['SkillAttack','SkillAttackAmplifyRate','SkillAttackWeakenRate','SkillMinAttack','SkillRangedAttack','SkillRangedMinAttack'] },
    { o:'TotalSkillRangedMaxAttack', c:'04_공격력', f:'(SumSkillRangedMaxAttack + SumSkillRangedAttack + SumSkillMaxAttack + SumSkillAttack) * (1 + SumSkillMaxAttackAmplifyRate/10000 + SumSkillAttackAmplifyRate/10000) * MulW(SkillAttackWeakenRate)', i:['SkillAttack','SkillAttackAmplifyRate','SkillAttackWeakenRate','SkillMaxAttack','SkillMaxAttackAmplifyRate','SkillRangedAttack','SkillRangedMaxAttack'] },
    { o:'TotalSkillMagicMinAttack', c:'04_공격력', f:'(SumSkillMagicMinAttack + SumSkillMagicAttack + SumSkillMinAttack + SumSkillAttack) * (1 + SumSkillAttackAmplifyRate/10000) * MulW(SkillAttackWeakenRate)', i:['SkillAttack','SkillAttackAmplifyRate','SkillAttackWeakenRate','SkillMagicAttack','SkillMagicMinAttack','SkillMinAttack'] },
    { o:'TotalSkillMagicMaxAttack', c:'04_공격력', f:'(SumSkillMagicMaxAttack + SumSkillMagicAttack + SumSkillMaxAttack + SumSkillAttack) * (1 + SumSkillMaxAttackAmplifyRate/10000 + SumSkillAttackAmplifyRate/10000) * MulW(SkillAttackWeakenRate)', i:['SkillAttack','SkillAttackAmplifyRate','SkillAttackWeakenRate','SkillMagicAttack','SkillMagicMaxAttack','SkillMaxAttack','SkillMaxAttackAmplifyRate'] },

    // ─── 04_공격력 — PVP 스킬 근/원/마 ─────────────────────────────────
    { o:'TotalPVPSkillMeleeMinAttack', c:'04_공격력', f:'(SumPVPSkillMeleeMinAttack + SumPVPSkillMeleeAttack + SumPVPSkillMinAttack + SumPVPSkillAttack) * (1 + SumPVPSkillAttackAmplifyRate/10000) * MulW(PVPSkillAttackWeakenRate)', i:['PVPSkillAttack','PVPSkillAttackAmplifyRate','PVPSkillAttackWeakenRate','PVPSkillMeleeAttack','PVPSkillMeleeMinAttack','PVPSkillMinAttack'] },
    { o:'TotalPVPSkillMeleeMaxAttack', c:'04_공격력', f:'(SumPVPSkillMeleeMaxAttack + SumPVPSkillMeleeAttack + SumPVPSkillMaxAttack + SumPVPSkillAttack) * (1 + SumPVPSkillAttackAmplifyRate/10000) * MulW(PVPSkillAttackWeakenRate)', i:['PVPSkillAttack','PVPSkillAttackAmplifyRate','PVPSkillAttackWeakenRate','PVPSkillMaxAttack','PVPSkillMeleeAttack','PVPSkillMeleeMaxAttack'] },
    { o:'TotalPVPSkillRangedMinAttack', c:'04_공격력', f:'(SumPVPSkillRangedMinAttack + SumPVPSkillRangedAttack + SumPVPSkillMinAttack + SumPVPSkillAttack) * (1 + SumPVPSkillAttackAmplifyRate/10000) * MulW(PVPSkillAttackWeakenRate)', i:['PVPSkillAttack','PVPSkillAttackAmplifyRate','PVPSkillAttackWeakenRate','PVPSkillMinAttack','PVPSkillRangedAttack','PVPSkillRangedMinAttack'] },
    { o:'TotalPVPSkillRangedMaxAttack', c:'04_공격력', f:'(SumPVPSkillRangedMaxAttack + SumPVPSkillRangedAttack + SumPVPSkillMaxAttack + SumPVPSkillAttack) * (1 + SumPVPSkillAttackAmplifyRate/10000) * MulW(PVPSkillAttackWeakenRate)', i:['PVPSkillAttack','PVPSkillAttackAmplifyRate','PVPSkillAttackWeakenRate','PVPSkillMaxAttack','PVPSkillRangedAttack','PVPSkillRangedMaxAttack'] },
    { o:'TotalPVPSkillMagicMinAttack', c:'04_공격력', f:'(SumPVPSkillMagicMinAttack + SumPVPSkillMagicAttack + SumPVPSkillMinAttack + SumPVPSkillAttack) * (1 + SumPVPSkillAttackAmplifyRate/10000) * MulW(PVPSkillAttackWeakenRate)', i:['PVPSkillAttack','PVPSkillAttackAmplifyRate','PVPSkillAttackWeakenRate','PVPSkillMagicAttack','PVPSkillMagicMinAttack','PVPSkillMinAttack'] },
    { o:'TotalPVPSkillMagicMaxAttack', c:'04_공격력', f:'(SumPVPSkillMagicMaxAttack + SumPVPSkillMagicAttack + SumPVPSkillMaxAttack + SumPVPSkillAttack) * (1 + SumPVPSkillAttackAmplifyRate/10000) * MulW(PVPSkillAttackWeakenRate)', i:['PVPSkillAttack','PVPSkillAttackAmplifyRate','PVPSkillAttackWeakenRate','PVPSkillMagicAttack','PVPSkillMagicMaxAttack','PVPSkillMaxAttack'] },

    // ─── 04_공격력 — PVE 스킬 근/원/마 ─────────────────────────────────
    { o:'TotalPVESkillMeleeMinAttack', c:'04_공격력', f:'(SumPVESkillMeleeMinAttack + SumPVESkillMeleeAttack + SumPVESkillMinAttack + SumPVESkillAttack) * (1 + SumPVESkillAttackAmplifyRate/10000) * MulW(PVESkillAttackWeakenRate)', i:['PVESkillAttack','PVESkillAttackAmplifyRate','PVESkillAttackWeakenRate','PVESkillMeleeAttack','PVESkillMeleeMinAttack','PVESkillMinAttack'] },
    { o:'TotalPVESkillMeleeMaxAttack', c:'04_공격력', f:'(SumPVESkillMeleeMaxAttack + SumPVESkillMeleeAttack + SumPVESkillMaxAttack + SumPVESkillAttack) * (1 + SumPVESkillAttackAmplifyRate/10000) * MulW(PVESkillAttackWeakenRate)', i:['PVESkillAttack','PVESkillAttackAmplifyRate','PVESkillAttackWeakenRate','PVESkillMaxAttack','PVESkillMeleeAttack','PVESkillMeleeMaxAttack'] },
    { o:'TotalPVESkillRangedMinAttack', c:'04_공격력', f:'(SumPVESkillRangedMinAttack + SumPVESkillRangedAttack + SumPVESkillMinAttack + SumPVESkillAttack) * (1 + SumPVESkillAttackAmplifyRate/10000) * MulW(PVESkillAttackWeakenRate)', i:['PVESkillAttack','PVESkillAttackAmplifyRate','PVESkillAttackWeakenRate','PVESkillMinAttack','PVESkillRangedAttack','PVESkillRangedMinAttack'] },
    { o:'TotalPVESkillRangedMaxAttack', c:'04_공격력', f:'(SumPVESkillRangedMaxAttack + SumPVESkillRangedAttack + SumPVESkillMaxAttack + SumPVESkillAttack) * (1 + SumPVESkillAttackAmplifyRate/10000) * MulW(PVESkillAttackWeakenRate)', i:['PVESkillAttack','PVESkillAttackAmplifyRate','PVESkillAttackWeakenRate','PVESkillMaxAttack','PVESkillRangedAttack','PVESkillRangedMaxAttack'] },
    { o:'TotalPVESkillMagicMinAttack', c:'04_공격력', f:'(SumPVESkillMagicMinAttack + SumPVESkillMagicAttack + SumPVESkillMinAttack + SumPVESkillAttack) * (1 + SumPVESkillAttackAmplifyRate/10000) * MulW(PVESkillAttackWeakenRate)', i:['PVESkillAttack','PVESkillAttackAmplifyRate','PVESkillAttackWeakenRate','PVESkillMagicAttack','PVESkillMagicMinAttack','PVESkillMinAttack'] },
    { o:'TotalPVESkillMagicMaxAttack', c:'04_공격력', f:'(SumPVESkillMagicMaxAttack + SumPVESkillMagicAttack + SumPVESkillMaxAttack + SumPVESkillAttack) * (1 + SumPVESkillAttackAmplifyRate/10000) * MulW(PVESkillAttackWeakenRate)', i:['PVESkillAttack','PVESkillAttackAmplifyRate','PVESkillAttackWeakenRate','PVESkillMagicAttack','PVESkillMagicMaxAttack','PVESkillMaxAttack'] },

    // ─── 04_공격력 — 일반공격 추가(NormalExtra) 근/원/마 ───────────────
    { o:'TotalNormalExtraMeleeMinAttack', c:'04_공격력', f:'SumNormalExtraMeleeMinAttack + SumNormalExtraMeleeAttack + SumNormalExtraMinAttack + SumNormalExtraAttack', i:['NormalExtraAttack','NormalExtraMeleeAttack','NormalExtraMeleeMinAttack','NormalExtraMinAttack'] },
    { o:'TotalNormalExtraMeleeMaxAttack', c:'04_공격력', f:'SumNormalExtraMeleeMaxAttack + SumNormalExtraMeleeAttack + SumNormalExtraMaxAttack + SumNormalExtraAttack', i:['NormalExtraAttack','NormalExtraMaxAttack','NormalExtraMeleeAttack','NormalExtraMeleeMaxAttack'] },
    { o:'TotalNormalExtraRangedMinAttack', c:'04_공격력', f:'SumNormalExtraRangedMinAttack + SumNormalExtraRangedAttack + SumNormalExtraMinAttack + SumNormalExtraAttack', i:['NormalExtraAttack','NormalExtraMinAttack','NormalExtraRangedAttack','NormalExtraRangedMinAttack'] },
    { o:'TotalNormalExtraRangedMaxAttack', c:'04_공격력', f:'SumNormalExtraRangedMaxAttack + SumNormalExtraRangedAttack + SumNormalExtraMaxAttack + SumNormalExtraAttack', i:['NormalExtraAttack','NormalExtraMaxAttack','NormalExtraRangedAttack','NormalExtraRangedMaxAttack'] },
    { o:'TotalNormalExtraMagicMinAttack', c:'04_공격력', f:'SumNormalExtraMagicMinAttack + SumNormalExtraMagicAttack + SumNormalExtraMinAttack + SumNormalExtraAttack', i:['NormalExtraAttack','NormalExtraMagicAttack','NormalExtraMagicMinAttack','NormalExtraMinAttack'] },
    { o:'TotalNormalExtraMagicMaxAttack', c:'04_공격력', f:'SumNormalExtraMagicMaxAttack + SumNormalExtraMagicAttack + SumNormalExtraMaxAttack + SumNormalExtraAttack', i:['NormalExtraAttack','NormalExtraMagicAttack','NormalExtraMagicMaxAttack','NormalExtraMaxAttack'] },
    { o:'TotalPVPNormalExtraMeleeMinAttack', c:'04_공격력', f:'SumPVPNormalExtraMeleeMinAttack + SumPVPNormalExtraMeleeAttack + SumPVPNormalExtraMinAttack + SumPVPNormalExtraAttack', i:['PVPNormalExtraAttack','PVPNormalExtraMeleeAttack','PVPNormalExtraMeleeMinAttack','PVPNormalExtraMinAttack'] },
    { o:'TotalPVPNormalExtraMeleeMaxAttack', c:'04_공격력', f:'SumPVPNormalExtraMeleeMaxAttack + SumPVPNormalExtraMeleeAttack + SumPVPNormalExtraMaxAttack + SumPVPNormalExtraAttack', i:['PVPNormalExtraAttack','PVPNormalExtraMaxAttack','PVPNormalExtraMeleeAttack','PVPNormalExtraMeleeMaxAttack'] },
    { o:'TotalPVPNormalExtraRangedMinAttack', c:'04_공격력', f:'SumPVPNormalExtraRangedMinAttack + SumPVPNormalExtraRangedAttack + SumPVPNormalExtraMinAttack + SumPVPNormalExtraAttack', i:['PVPNormalExtraAttack','PVPNormalExtraMinAttack','PVPNormalExtraRangedAttack','PVPNormalExtraRangedMinAttack'] },
    { o:'TotalPVPNormalExtraRangedMaxAttack', c:'04_공격력', f:'SumPVPNormalExtraRangedMaxAttack + SumPVPNormalExtraRangedAttack + SumPVPNormalExtraMaxAttack + SumPVPNormalExtraAttack', i:['PVPNormalExtraAttack','PVPNormalExtraMaxAttack','PVPNormalExtraRangedAttack','PVPNormalExtraRangedMaxAttack'] },
    { o:'TotalPVPNormalExtraMagicMinAttack', c:'04_공격력', f:'SumPVPNormalExtraMagicMinAttack + SumPVPNormalExtraMagicAttack + SumPVPNormalExtraMinAttack + SumPVPNormalExtraAttack', i:['PVPNormalExtraAttack','PVPNormalExtraMagicAttack','PVPNormalExtraMagicMinAttack','PVPNormalExtraMinAttack'] },
    { o:'TotalPVPNormalExtraMagicMaxAttack', c:'04_공격력', f:'SumPVPNormalExtraMagicMaxAttack + SumPVPNormalExtraMagicAttack + SumPVPNormalExtraMaxAttack + SumPVPNormalExtraAttack', i:['PVPNormalExtraAttack','PVPNormalExtraMagicAttack','PVPNormalExtraMagicMaxAttack','PVPNormalExtraMaxAttack'] },
    { o:'TotalPVENormalExtraMeleeMinAttack', c:'04_공격력', f:'SumPVENormalExtraMeleeMinAttack + SumPVENormalExtraMeleeAttack + SumPVENormalExtraMinAttack + SumPVENormalExtraAttack', i:['PVENormalExtraAttack','PVENormalExtraMeleeAttack','PVENormalExtraMeleeMinAttack','PVENormalExtraMinAttack'] },
    { o:'TotalPVENormalExtraMeleeMaxAttack', c:'04_공격력', f:'SumPVENormalExtraMeleeMaxAttack + SumPVENormalExtraMeleeAttack + SumPVENormalExtraMaxAttack + SumPVENormalExtraAttack', i:['PVENormalExtraAttack','PVENormalExtraMaxAttack','PVENormalExtraMeleeAttack','PVENormalExtraMeleeMaxAttack'] },
    { o:'TotalPVENormalExtraRangedMinAttack', c:'04_공격력', f:'SumPVENormalExtraRangedMinAttack + SumPVENormalExtraRangedAttack + SumPVENormalExtraMinAttack + SumPVENormalExtraAttack', i:['PVENormalExtraAttack','PVENormalExtraMinAttack','PVENormalExtraRangedAttack','PVENormalExtraRangedMinAttack'] },
    { o:'TotalPVENormalExtraRangedMaxAttack', c:'04_공격력', f:'SumPVENormalExtraRangedMaxAttack + SumPVENormalExtraRangedAttack + SumPVENormalExtraMaxAttack + SumPVENormalExtraAttack', i:['PVENormalExtraAttack','PVENormalExtraMaxAttack','PVENormalExtraRangedAttack','PVENormalExtraRangedMaxAttack'] },
    { o:'TotalPVENormalExtraMagicMinAttack', c:'04_공격력', f:'SumPVENormalExtraMagicMinAttack + SumPVENormalExtraMagicAttack + SumPVENormalExtraMinAttack + SumPVENormalExtraAttack', i:['PVENormalExtraAttack','PVENormalExtraMagicAttack','PVENormalExtraMagicMinAttack','PVENormalExtraMinAttack'] },
    { o:'TotalPVENormalExtraMagicMaxAttack', c:'04_공격력', f:'SumPVENormalExtraMagicMaxAttack + SumPVENormalExtraMagicAttack + SumPVENormalExtraMaxAttack + SumPVENormalExtraAttack', i:['PVENormalExtraAttack','PVENormalExtraMagicAttack','PVENormalExtraMagicMaxAttack','PVENormalExtraMaxAttack'] },

    // ─── 04_공격력 — 스킬 추가(SkillExtra) 근/원/마 ────────────────────
    { o:'TotalSkillExtraMeleeMinAttack', c:'04_공격력', f:'SumSkillExtraMeleeMinAttack + SumSkillExtraMeleeAttack + SumSkillExtraMinAttack + SumSkillExtraAttack', i:['SkillExtraAttack','SkillExtraMeleeAttack','SkillExtraMeleeMinAttack','SkillExtraMinAttack'] },
    { o:'TotalSkillExtraMeleeMaxAttack', c:'04_공격력', f:'SumSkillExtraMeleeMaxAttack + SumSkillExtraMeleeAttack + SumSkillExtraMaxAttack + SumSkillExtraAttack', i:['SkillExtraAttack','SkillExtraMaxAttack','SkillExtraMeleeAttack','SkillExtraMeleeMaxAttack'] },
    { o:'TotalSkillExtraRangedMinAttack', c:'04_공격력', f:'SumSkillExtraRangedMinAttack + SumSkillExtraRangedAttack + SumSkillExtraMinAttack + SumSkillExtraAttack', i:['SkillExtraAttack','SkillExtraMinAttack','SkillExtraRangedAttack','SkillExtraRangedMinAttack'] },
    { o:'TotalSkillExtraRangedMaxAttack', c:'04_공격력', f:'SumSkillExtraRangedMaxAttack + SumSkillExtraRangedAttack + SumSkillExtraMaxAttack + SumSkillExtraAttack', i:['SkillExtraAttack','SkillExtraMaxAttack','SkillExtraRangedAttack','SkillExtraRangedMaxAttack'] },
    { o:'TotalSkillExtraMagicMinAttack', c:'04_공격력', f:'SumSkillExtraMagicMinAttack + SumSkillExtraMagicAttack + SumSkillExtraMinAttack + SumSkillExtraAttack', i:['SkillExtraAttack','SkillExtraMagicAttack','SkillExtraMagicMinAttack','SkillExtraMinAttack'] },
    { o:'TotalSkillExtraMagicMaxAttack', c:'04_공격력', f:'SumSkillExtraMagicMaxAttack + SumSkillExtraMagicAttack + SumSkillExtraMaxAttack + SumSkillExtraAttack', i:['SkillExtraAttack','SkillExtraMagicAttack','SkillExtraMagicMaxAttack','SkillExtraMaxAttack'] },
    { o:'TotalPVPSkillExtraMeleeMinAttack', c:'04_공격력', f:'SumPVPSkillExtraMeleeMinAttack + SumPVPSkillExtraMeleeAttack + SumPVPSkillExtraMinAttack + SumPVPSkillExtraAttack', i:['PVPSkillExtraAttack','PVPSkillExtraMeleeAttack','PVPSkillExtraMeleeMinAttack','PVPSkillExtraMinAttack'] },
    { o:'TotalPVPSkillExtraMeleeMaxAttack', c:'04_공격력', f:'SumPVPSkillExtraMeleeMaxAttack + SumPVPSkillExtraMeleeAttack + SumPVPSkillExtraMaxAttack + SumPVPSkillExtraAttack', i:['PVPSkillExtraAttack','PVPSkillExtraMaxAttack','PVPSkillExtraMeleeAttack','PVPSkillExtraMeleeMaxAttack'] },
    { o:'TotalPVPSkillExtraRangedMinAttack', c:'04_공격력', f:'SumPVPSkillExtraRangedMinAttack + SumPVPSkillExtraRangedAttack + SumPVPSkillExtraMinAttack + SumPVPSkillExtraAttack', i:['PVPSkillExtraAttack','PVPSkillExtraMinAttack','PVPSkillExtraRangedAttack','PVPSkillExtraRangedMinAttack'] },
    { o:'TotalPVPSkillExtraRangedMaxAttack', c:'04_공격력', f:'SumPVPSkillExtraRangedMaxAttack + SumPVPSkillExtraRangedAttack + SumPVPSkillExtraMaxAttack + SumPVPSkillExtraAttack', i:['PVPSkillExtraAttack','PVPSkillExtraMaxAttack','PVPSkillExtraRangedAttack','PVPSkillExtraRangedMaxAttack'] },
    { o:'TotalPVPSkillExtraMagicMinAttack', c:'04_공격력', f:'SumPVPSkillExtraMagicMinAttack + SumPVPSkillExtraMagicAttack + SumPVPSkillExtraMinAttack + SumPVPSkillExtraAttack', i:['PVPSkillExtraAttack','PVPSkillExtraMagicAttack','PVPSkillExtraMagicMinAttack','PVPSkillExtraMinAttack'] },
    { o:'TotalPVPSkillExtraMagicMaxAttack', c:'04_공격력', f:'SumPVPSkillExtraMagicMaxAttack + SumPVPSkillExtraMagicAttack + SumPVPSkillExtraMaxAttack + SumPVPSkillExtraAttack', i:['PVPSkillExtraAttack','PVPSkillExtraMagicAttack','PVPSkillExtraMagicMaxAttack','PVPSkillExtraMaxAttack'] },
    { o:'TotalPVESkillExtraMeleeMinAttack', c:'04_공격력', f:'SumPVESkillExtraMeleeMinAttack + SumPVESkillExtraMeleeAttack + SumPVESkillExtraMinAttack + SumPVESkillExtraAttack', i:['PVESkillExtraAttack','PVESkillExtraMeleeAttack','PVESkillExtraMeleeMinAttack','PVESkillExtraMinAttack'] },
    { o:'TotalPVESkillExtraMeleeMaxAttack', c:'04_공격력', f:'SumPVESkillExtraMeleeMaxAttack + SumPVESkillExtraMeleeAttack + SumPVESkillExtraMaxAttack + SumPVESkillExtraAttack', i:['PVESkillExtraAttack','PVESkillExtraMaxAttack','PVESkillExtraMeleeAttack','PVESkillExtraMeleeMaxAttack'] },
    { o:'TotalPVESkillExtraRangedMinAttack', c:'04_공격력', f:'SumPVESkillExtraRangedMinAttack + SumPVESkillExtraRangedAttack + SumPVESkillExtraMinAttack + SumPVESkillExtraAttack', i:['PVESkillExtraAttack','PVESkillExtraMinAttack','PVESkillExtraRangedAttack','PVESkillExtraRangedMinAttack'] },
    { o:'TotalPVESkillExtraRangedMaxAttack', c:'04_공격력', f:'SumPVESkillExtraRangedMaxAttack + SumPVESkillExtraRangedAttack + SumPVESkillExtraMaxAttack + SumPVESkillExtraAttack', i:['PVESkillExtraAttack','PVESkillExtraMaxAttack','PVESkillExtraRangedAttack','PVESkillExtraRangedMaxAttack'] },
    { o:'TotalPVESkillExtraMagicMinAttack', c:'04_공격력', f:'SumPVESkillExtraMagicMinAttack + SumPVESkillExtraMagicAttack + SumPVESkillExtraMinAttack + SumPVESkillExtraAttack', i:['PVESkillExtraAttack','PVESkillExtraMagicAttack','PVESkillExtraMagicMinAttack','PVESkillExtraMinAttack'] },
    { o:'TotalPVESkillExtraMagicMaxAttack', c:'04_공격력', f:'SumPVESkillExtraMagicMaxAttack + SumPVESkillExtraMagicAttack + SumPVESkillExtraMaxAttack + SumPVESkillExtraAttack', i:['PVESkillExtraAttack','PVESkillExtraMagicAttack','PVESkillExtraMagicMaxAttack','PVESkillExtraMaxAttack'] },

    // ─── 12_피해 감소 — PVE 데미지 리덕션/스킬 ──────────────────────────
    { o:'TotalPVEMeleeDamageReduction', c:'12_피해 감소', f:'SumPVEMeleeDamageReduction + SumPVEDamageReduction', i:['PVEDamageReduction','PVEMeleeDamageReduction'] },
    { o:'TotalPVERangedDamageReduction', c:'12_피해 감소', f:'SumPVERangedDamageReduction + SumPVEDamageReduction', i:['PVEDamageReduction','PVERangedDamageReduction'] },
    { o:'TotalPVEMagicDamageReduction', c:'12_피해 감소', f:'SumPVEMagicDamageReduction + SumPVEDamageReduction', i:['PVEDamageReduction','PVEMagicDamageReduction'] },
    { o:'TotalPVEMeleeDamageReductionIgnore', c:'12_피해 감소', f:'SumPVEMeleeDamageReductionIgnore + SumPVEDamageReductionIgnore', i:['PVEDamageReductionIgnore','PVEMeleeDamageReductionIgnore'] },
    { o:'TotalPVERangedDamageReductionIgnore', c:'12_피해 감소', f:'SumPVERangedDamageReductionIgnore + SumPVEDamageReductionIgnore', i:['PVEDamageReductionIgnore','PVERangedDamageReductionIgnore'] },
    { o:'TotalPVEMagicDamageReductionIgnore', c:'12_피해 감소', f:'SumPVEMagicDamageReductionIgnore + SumPVEDamageReductionIgnore', i:['PVEDamageReductionIgnore','PVEMagicDamageReductionIgnore'] },
    { o:'TotalPVESkillDamageReduction', c:'12_피해 감소', f:'SumPVESkillDamageReduction', i:['PVESkillDamageReduction'] },
    { o:'TotalPVESkillDamageReductionIgnore', c:'12_피해 감소', f:'(SumPVEMeleeSkillDamageReductionIgnore + SumPVESkillDamageReductionIgnore) * (1 + SumPVEMeleeSkillDamageReductionIgnoreAmplifyRate/10000 + SumPVESkillDamageReductionIgnoreAmplifyRate/10000) * MulW(PVESkillDamageReductionIgnoreWeakenRate)', i:['PVEMeleeSkillDamageReductionIgnore','PVEMeleeSkillDamageReductionIgnoreAmplifyRate','PVESkillDamageReductionIgnore','PVESkillDamageReductionIgnoreAmplifyRate','PVESkillDamageReductionIgnoreWeakenRate'] },
    { o:'TotalPVEMeleeDamageReductionRate', c:'12_피해 감소', f:'SumPVEMeleeDamageReductionRate + SumPVEDamageReductionRate', i:['PVEDamageReductionRate','PVEMeleeDamageReductionRate'] },
    { o:'TotalPVERangedDamageReductionRate', c:'12_피해 감소', f:'SumPVERangedDamageReductionRate + SumPVEDamageReductionRate', i:['PVEDamageReductionRate','PVERangedDamageReductionRate'] },
    { o:'TotalPVEMagicDamageReductionRate', c:'12_피해 감소', f:'SumPVEMagicDamageReductionRate + SumPVEDamageReductionRate', i:['PVEDamageReductionRate','PVEMagicDamageReductionRate'] },

    // ─── 12_피해 감소 — 받는 피해 증가율(DamageIncreaseRate) ─────────────
    { o:'TotalMeleeDamageIncreaseRate', c:'12_피해 감소', f:'SumMeleeDamageIncreaseRate + SumDamageIncreaseRate', i:['DamageIncreaseRate','MeleeDamageIncreaseRate'] },
    { o:'TotalRangedDamageIncreaseRate', c:'12_피해 감소', f:'SumRangedDamageIncreaseRate + SumDamageIncreaseRate', i:['DamageIncreaseRate','RangedDamageIncreaseRate'] },
    { o:'TotalMagicDamageIncreaseRate', c:'12_피해 감소', f:'SumMagicDamageIncreaseRate + SumDamageIncreaseRate', i:['DamageIncreaseRate','MagicDamageIncreaseRate'] },
    { o:'TotalPVPMeleeDamageIncreaseRate', c:'12_피해 감소', f:'SumPVPMeleeDamageIncreaseRate + SumPVPDamageIncreaseRate', i:['PVPDamageIncreaseRate','PVPMeleeDamageIncreaseRate'] },
    { o:'TotalPVPRangedDamageIncreaseRate', c:'12_피해 감소', f:'SumPVPRangedDamageIncreaseRate + SumPVPDamageIncreaseRate', i:['PVPDamageIncreaseRate','PVPRangedDamageIncreaseRate'] },
    { o:'TotalPVPMagicDamageIncreaseRate', c:'12_피해 감소', f:'SumPVPMagicDamageIncreaseRate + SumPVPDamageIncreaseRate', i:['PVPDamageIncreaseRate','PVPMagicDamageIncreaseRate'] },
    { o:'TotalPVEMeleeDamageIncreaseRate', c:'12_피해 감소', f:'SumPVEMeleeDamageIncreaseRate + SumPVEDamageIncreaseRate', i:['PVEDamageIncreaseRate','PVEMeleeDamageIncreaseRate'] },
    { o:'TotalPVERangedDamageIncreaseRate', c:'12_피해 감소', f:'SumPVERangedDamageIncreaseRate + SumPVEDamageIncreaseRate', i:['PVEDamageIncreaseRate','PVERangedDamageIncreaseRate'] },
    { o:'TotalPVEMagicDamageIncreaseRate', c:'12_피해 감소', f:'SumPVEMagicDamageIncreaseRate + SumPVEDamageIncreaseRate', i:['PVEDamageIncreaseRate','PVEMagicDamageIncreaseRate'] },

    // ─── 17_사거리 ──────────────────────────────────────────────────
    { o:'TotalNormalAttackTargetRange', c:'17_사거리', f:'SumNormalAttackTargetRange + SumCommonTargetRange', i:['CommonTargetRange','NormalAttackTargetRange'] },
    { o:'TotalNormalAttackTargetRangeRate', c:'17_사거리', f:'SumNormalAttackTargetRangeRate + SumCommonTargetRangeRate', i:['CommonTargetRangeRate','NormalAttackTargetRangeRate'] },
    { o:'TotalSkillTargetRange', c:'17_사거리', f:'SumSkillTargetRange + SumCommonTargetRange', i:['CommonTargetRange','SkillTargetRange'] },
    { o:'TotalSkillTargetRangeRate', c:'17_사거리', f:'SumSkillTargetRangeRate + SumCommonTargetRangeRate', i:['CommonTargetRangeRate','SkillTargetRangeRate'] },

    // ─── 16_몬스터 특수 대상 — 정예/월드보스/거점보스 ──────────────────────
    { o:'TotalEliteMonsterExtraAttack', c:'16_몬스터 특수 대상', f:'(SumEliteMonsterExtraAttack) * (1 + SumEliteMonsterExtraAttackAmplifyRate/10000)', i:['EliteMonsterExtraAttack','EliteMonsterExtraAttackAmplifyRate'] },
    { o:'TotalEliteMonsterExtraDefense', c:'16_몬스터 특수 대상', f:'(SumEliteMonsterExtraDefense) * (1 + )  // NOTE: 원본 증폭항 비어있음', i:['EliteMonsterExtraDefense'] },

    // ─── 10_상태이상 적중 — 질병/취약 ──────────────────────────────────
    { o:'TotalDiseaseHit', c:'10_상태이상 적중', f:'(SumDiseaseHit + SumAbnormalHit) * MulW(DiseaseHitWeakenRate) * MulW(AbnormalHitWeakenRate)', i:['AbnormalHit','AbnormalHitWeakenRate','DiseaseHit','DiseaseHitWeakenRate'] },
    { o:'TotalDebuffDefenseHit', c:'10_상태이상 적중', f:'(SumDebuffDefenseHit + SumAbnormalHit) * MulW(DebuffDefenseHitWeakenRate) * MulW(AbnormalHitWeakenRate)', i:['AbnormalHit','AbnormalHitWeakenRate','DebuffDefenseHit','DebuffDefenseHitWeakenRate'] },
    { o:'TotalPVPDiseaseHit', c:'10_상태이상 적중', f:'SumPVPDiseaseHit + SumPVPAbnormalHit', i:['PVPAbnormalHit','PVPDiseaseHit'] },
    { o:'TotalPVPDebuffDefenseHit', c:'10_상태이상 적중', f:'SumPVPDebuffDefenseHit + SumPVPAbnormalHit', i:['PVPAbnormalHit','PVPDebuffDefenseHit'] },
    { o:'TotalPVEDiseaseHit', c:'10_상태이상 적중', f:'SumPVEDiseaseHit + SumPVEAbnormalHit', i:['PVEAbnormalHit','PVEDiseaseHit'] },
    { o:'TotalPVEDebuffDefenseHit', c:'10_상태이상 적중', f:'SumPVEDebuffDefenseHit + SumPVEAbnormalHit', i:['PVEAbnormalHit','PVEDebuffDefenseHit'] },

    // ─── 11_상태이상 저항 — 질병/취약 ──────────────────────────────────
    { o:'TotalDiseaseResist', c:'11_상태이상 저항', f:'(SumDiseaseResist + SumAbnormalResist) * MulW(DiseaseResistWeakenRate) * MulW(AbnormalResistWeakenRate)', i:['AbnormalResist','AbnormalResistWeakenRate','DiseaseResist','DiseaseResistWeakenRate'] },
    { o:'TotalDebuffDefenseResist', c:'11_상태이상 저항', f:'(SumDebuffDefenseResist + SumAbnormalResist) * MulW(DebuffDefenseResistWeakenRate) * MulW(AbnormalResistWeakenRate)', i:['AbnormalResist','AbnormalResistWeakenRate','DebuffDefenseResist','DebuffDefenseResistWeakenRate'] },
    { o:'TotalPVPDiseaseResist', c:'11_상태이상 저항', f:'SumPVPDiseaseResist + SumPVPAbnormalResist', i:['PVPAbnormalResist','PVPDiseaseResist'] },
    { o:'TotalPVPDebuffDefenseResist', c:'11_상태이상 저항', f:'SumPVPDebuffDefenseResist + SumPVPAbnormalResist', i:['PVPAbnormalResist','PVPDebuffDefenseResist'] },
    { o:'TotalPVEDiseaseResist', c:'11_상태이상 저항', f:'SumPVEDiseaseResist + SumPVEAbnormalResist', i:['PVEAbnormalResist','PVEDiseaseResist'] },
    { o:'TotalPVEDebuffDefenseResist', c:'11_상태이상 저항', f:'SumPVEDebuffDefenseResist + SumPVEAbnormalResist', i:['PVEAbnormalResist','PVEDebuffDefenseResist'] },

    // ─── 15_경험치/재화/드랍 — 재화2·3/무기숙련도 ─────────────────────────
    { o:'TotalECBonus', c:'15_경험치/재화/드랍', f:'SumECBonus', i:['ECBonus'] },
    { o:'TotalACBonus', c:'15_경험치/재화/드랍', f:'SumACBonus', i:['ACBonus'] },
    { o:'TotalWeaponEXPBonus', c:'15_경험치/재화/드랍', f:'SumWeaponEXPBonus', i:['WeaponEXPBonus'] },

    // ─── 12_피해 감소 — 받는 피해 추가 감소량(이뮨 스킬) ─────────────────
    { o:'TotalAdditionalDamageReductionRate', c:'12_피해 감소', f:'SumAdditionalDamageReductionRate * (AffectedOptionValuePer/10000)  // 이뮨 스킬 전용', i:['AdditionalDamageReductionRate'] },

    // ─── 16_몬스터 특수 대상 — 월드보스/거점보스 ──────────────────────────
    { o:'TotalWorldBossMonsterExtraAttack', c:'16_몬스터 특수 대상', f:'(SumWorldBossMonsterExtraAttack) * (1 + SumWorldBossMonsterExtraAttackAmplifyRate/10000)', i:['WorldBossMonsterExtraAttack','WorldBossMonsterExtraAttackAmplifyRate'] },
    { o:'TotalWorldBossMonsterExtraDefense', c:'16_몬스터 특수 대상', f:'(SumWorldBossMonsterExtraDefense) * (1 + SumWorldBossMonsterExtraDefenseAmplifyRate/10000)', i:['WorldBossMonsterExtraDefense','WorldBossMonsterExtraDefenseAmplifyRate'] },
    { o:'TotalStrongPointBossMonsterExtraAttack', c:'16_몬스터 특수 대상', f:'(SumStrongPointBossMonsterExtraAttack) * (1 + SumStrongPointBossMonsterExtraAttackAmplifyRate/10000)', i:['StrongPointBossMonsterExtraAttack','StrongPointBossMonsterExtraAttackAmplifyRate'] },
    { o:'TotalStrongPointBossMonsterExtraDefense', c:'16_몬스터 특수 대상', f:'(SumStrongPointBossMonsterExtraDefense) * (1 + SumStrongPointBossMonsterExtraDefenseAmplifyRate/10000)', i:['StrongPointBossMonsterExtraDefense','StrongPointBossMonsterExtraDefenseAmplifyRate'] },

    // ─── 05_방어력 — 원거리 방어력 ─────────────────────────────────────
    { o:'TotalRangedDefense', c:'05_방어력', f:'(SumRangedDefense + SumAllDefense) * (1 + SumRangedDefenseAmplifyRate/10000 + SumAllDefenseAmplifyRate/10000) * MulW(RangedDefenseWeakenRate) * MulW(AllDefenseWeakenRate)', i:['AllDefense','AllDefenseAmplifyRate','AllDefenseWeakenRate','RangedDefense','RangedDefenseAmplifyRate','RangedDefenseWeakenRate'] },

    // ─── 13_방어 관통 — PVE/PVP 근/원/마 ─────────────────────────────────
    { o:'TotalPVETargetPhysicalDefense', c:'13_방어 관통', f:'(SumPVETargetMeleeDefense + SumPVETargetDefense) * (1 + SumPVETargetMeleeDefenseAmplifyRate/10000 + SumPVETargetDefenseAmplifyRate/10000) * MulW(PVETargetDefenseWeakenRate)', i:['PVETargetDefense','PVETargetDefenseAmplifyRate','PVETargetDefenseWeakenRate','PVETargetMeleeDefense','PVETargetMeleeDefenseAmplifyRate'] },
    { o:'TotalPVETargetRangedDefense', c:'13_방어 관통', f:'(SumPVETargetRangedDefense + SumPVETargetDefense) * (1 + SumPVETargetRangedDefenseAmplifyRate/10000 + SumPVETargetDefenseAmplifyRate/10000) * MulW(PVETargetDefenseWeakenRate)', i:['PVETargetDefense','PVETargetDefenseAmplifyRate','PVETargetDefenseWeakenRate','PVETargetRangedDefense','PVETargetRangedDefenseAmplifyRate'] },
    { o:'TotalPVETargetMagicDefense', c:'13_방어 관통', f:'(SumPVETargetMagicDefense + SumPVETargetDefense) * (1 + SumPVETargetMagicDefenseAmplifyRate/10000 + SumPVETargetDefenseAmplifyRate/10000) * MulW(PVETargetDefenseWeakenRate)', i:['PVETargetDefense','PVETargetDefenseAmplifyRate','PVETargetDefenseWeakenRate','PVETargetMagicDefense','PVETargetMagicDefenseAmplifyRate'] },
    { o:'TotalPVPTargetPhysicalDefense', c:'13_방어 관통', f:'(SumPVPTargetMeleeDefense + SumPVPTargetDefense) * (1 + SumPVPTargetMeleeDefenseAmplifyRate/10000 + SumPVPTargetDefenseAmplifyRate/10000) * MulW(PVPTargetDefenseWeakenRate)', i:['PVPTargetDefense','PVPTargetDefenseAmplifyRate','PVPTargetDefenseWeakenRate','PVPTargetMeleeDefense','PVPTargetMeleeDefenseAmplifyRate'] },
    { o:'TotalPVPTargetRangedDefense', c:'13_방어 관통', f:'(SumPVPTargetRangedDefense + SumPVPTargetDefense) * (1 + SumPVPTargetRangedDefenseAmplifyRate/10000 + SumPVPTargetDefenseAmplifyRate/10000) * MulW(PVPTargetDefenseWeakenRate)', i:['PVPTargetDefense','PVPTargetDefenseAmplifyRate','PVPTargetDefenseWeakenRate','PVPTargetRangedDefense','PVPTargetRangedDefenseAmplifyRate'] },
    { o:'TotalPVPTargetMagicDefense', c:'13_방어 관통', f:'(SumPVPTargetMagicDefense + SumPVPTargetDefense) * (1 + SumPVPTargetMagicDefenseAmplifyRate/10000 + SumPVPTargetDefenseAmplifyRate/10000) * MulW(PVPTargetDefenseWeakenRate)', i:['PVPTargetDefense','PVPTargetDefenseAmplifyRate','PVPTargetDefenseWeakenRate','PVPTargetMagicDefense','PVPTargetMagicDefenseAmplifyRate'] },

    // ─── 12_피해 감소 — 원/마법 스킬 피해 감소 ───────────────────────────
    { o:'TotalRangedSkillDamageReduction', c:'12_피해 감소', f:'(SumRangedSkillDamageReduction + SumSkillDamageReduction) * (1 + SumRangedSkillDamageReductionAmplifyRate/10000 + SumSkillDamageReductionAmplifyRate/10000) * MulW(RangedSkillDamageReductionWeakenRate) * MulW(SkillDamageReductionWeakenRate)  // NOTE: AmplifyRate /10000 적용은 기획 확인 필요', i:['RangedSkillDamageReduction','RangedSkillDamageReductionAmplifyRate','RangedSkillDamageReductionWeakenRate','SkillDamageReduction','SkillDamageReductionAmplifyRate','SkillDamageReductionWeakenRate'] },
    { o:'TotalMagicSkillDamageReduction', c:'12_피해 감소', f:'(SumMagicSkillDamageReduction + SumSkillDamageReduction) * (1 + SumMagicSkillDamageReductionAmplifyRate/10000 + SumSkillDamageReductionAmplifyRate/10000) * MulW(MagicSkillDamageReductionWeakenRate) * MulW(SkillDamageReductionWeakenRate)  // NOTE: AmplifyRate /10000 적용은 기획 확인 필요', i:['MagicSkillDamageReduction','MagicSkillDamageReductionAmplifyRate','MagicSkillDamageReductionWeakenRate','SkillDamageReduction','SkillDamageReductionAmplifyRate','SkillDamageReductionWeakenRate'] },

    // ─── 12_피해 감소 — PVE/PVP 원/마 스킬 피해 감소 무시 ──────────────
    { o:'TotalPVERangedSkillDamageReductionIgnore', c:'12_피해 감소', f:'(SumPVERangedSkillDamageReductionIgnore + SumPVESkillDamageReductionIgnore) * (1 + SumPVERangedSkillDamageReductionIgnoreAmplifyRate/10000 + SumPVESkillDamageReductionIgnoreAmplifyRate/10000) * MulW(PVESkillDamageReductionIgnoreWeakenRate)', i:['PVERangedSkillDamageReductionIgnore','PVERangedSkillDamageReductionIgnoreAmplifyRate','PVESkillDamageReductionIgnore','PVESkillDamageReductionIgnoreAmplifyRate','PVESkillDamageReductionIgnoreWeakenRate'] },
    { o:'TotalPVEMagicSkillDamageReductionIgnore', c:'12_피해 감소', f:'(SumPVEMagicSkillDamageReductionIgnore + SumPVESkillDamageReductionIgnore) * (1 + SumPVEMagicSkillDamageReductionIgnoreAmplifyRate/10000 + SumPVESkillDamageReductionIgnoreAmplifyRate/10000) * MulW(PVESkillDamageReductionIgnoreWeakenRate)', i:['PVEMagicSkillDamageReductionIgnore','PVEMagicSkillDamageReductionIgnoreAmplifyRate','PVESkillDamageReductionIgnore','PVESkillDamageReductionIgnoreAmplifyRate','PVESkillDamageReductionIgnoreWeakenRate'] },
    { o:'TotalPVPRangedSkillDamageReductionIgnore', c:'12_피해 감소', f:'(SumPVPRangedSkillDamageReductionIgnore + SumPVPSkillDamageReductionIgnore) * (1 + SumPVPRangedSkillDamageReductionIgnoreAmplifyRate/10000 + SumPVPSkillDamageReductionIgnoreAmplifyRate/10000) * MulW(PVPSkillDamageReductionIgnoreWeakenRate)', i:['PVPRangedSkillDamageReductionIgnore','PVPRangedSkillDamageReductionIgnoreAmplifyRate','PVPSkillDamageReductionIgnore','PVPSkillDamageReductionIgnoreAmplifyRate','PVPSkillDamageReductionIgnoreWeakenRate'] },
    { o:'TotalPVPMagicSkillDamageReductionIgnore', c:'12_피해 감소', f:'(SumPVPMagicSkillDamageReductionIgnore + SumPVPSkillDamageReductionIgnore) * (1 + SumPVPMagicSkillDamageReductionIgnoreAmplifyRate/10000 + SumPVPSkillDamageReductionIgnoreAmplifyRate/10000) * MulW(PVPSkillDamageReductionIgnoreWeakenRate)', i:['PVPMagicSkillDamageReductionIgnore','PVPMagicSkillDamageReductionIgnoreAmplifyRate','PVPSkillDamageReductionIgnore','PVPSkillDamageReductionIgnoreAmplifyRate','PVPSkillDamageReductionIgnoreWeakenRate'] },

    // ─── 07_치명타 저항/감소 — 치명타 피해 감소(공통/PVE/PVP) ────────────
    { o:'TotalMeleeCriticalDamageReduction', c:'07_치명타 저항/감소', f:'(SumMeleeCriticalDamageReduction + SumCriticalDamageReduction) * (1 + SumMeleeCriticalDamageReductionAmplifyRate/10000 + SumCriticalDamageReductionAmplifyRate/10000) * MulW(MeleeCriticalDamageReductionWeakenRate) * MulW(CriticalDamageReductionWeakenRate)', i:['CriticalDamageReduction','CriticalDamageReductionAmplifyRate','CriticalDamageReductionWeakenRate','MeleeCriticalDamageReduction','MeleeCriticalDamageReductionAmplifyRate','MeleeCriticalDamageReductionWeakenRate'] },
    { o:'TotalRangedCriticalDamageReduction', c:'07_치명타 저항/감소', f:'(SumRangedCriticalDamageReduction + SumCriticalDamageReduction) * (1 + SumRangedCriticalDamageReductionAmplifyRate/10000 + SumCriticalDamageReductionAmplifyRate/10000) * MulW(RangedCriticalDamageReductionWeakenRate) * MulW(CriticalDamageReductionWeakenRate)', i:['CriticalDamageReduction','CriticalDamageReductionAmplifyRate','CriticalDamageReductionWeakenRate','RangedCriticalDamageReduction','RangedCriticalDamageReductionAmplifyRate','RangedCriticalDamageReductionWeakenRate'] },
    { o:'TotalMagicCriticalDamageReduction', c:'07_치명타 저항/감소', f:'(SumMagicCriticalDamageReduction + SumCriticalDamageReduction) * (1 + SumMagicCriticalDamageReductionAmplifyRate/10000 + SumCriticalDamageReductionAmplifyRate/10000) * MulW(MagicCriticalDamageReductionWeakenRate) * MulW(CriticalDamageReductionWeakenRate)', i:['CriticalDamageReduction','CriticalDamageReductionAmplifyRate','CriticalDamageReductionWeakenRate','MagicCriticalDamageReduction','MagicCriticalDamageReductionAmplifyRate','MagicCriticalDamageReductionWeakenRate'] },
    { o:'TotalPVEMeleeCriticalDamageReductionIgnore', c:'07_치명타 저항/감소', f:'(SumPVEMeleeCriticalDamageReductionIgnore + SumPVECriticalDamageReductionIgnore) * (1 + SumPVEMeleeCriticalDamageReductionIgnoreAmplifyRate/10000 + SumPVECriticalDamageReductionIgnoreAmplifyRate/10000) * MulW(PVECriticalDamageReductionIgnoreWeakenRate)', i:['PVECriticalDamageReductionIgnore','PVECriticalDamageReductionIgnoreAmplifyRate','PVECriticalDamageReductionIgnoreWeakenRate','PVEMeleeCriticalDamageReductionIgnore','PVEMeleeCriticalDamageReductionIgnoreAmplifyRate'] },
    { o:'TotalPVERangedCriticalDamageReductionIgnore', c:'07_치명타 저항/감소', f:'(SumPVERangedCriticalDamageReductionIgnore + SumPVECriticalDamageReductionIgnore) * (1 + SumPVERangedCriticalDamageReductionIgnoreAmplifyRate/10000 + SumPVECriticalDamageReductionIgnoreAmplifyRate/10000) * MulW(PVECriticalDamageReductionIgnoreWeakenRate)', i:['PVECriticalDamageReductionIgnore','PVECriticalDamageReductionIgnoreAmplifyRate','PVECriticalDamageReductionIgnoreWeakenRate','PVERangedCriticalDamageReductionIgnore','PVERangedCriticalDamageReductionIgnoreAmplifyRate'] },
    { o:'TotalPVEMagicCriticalDamageReductionIgnore', c:'07_치명타 저항/감소', f:'(SumPVEMagicCriticalDamageReductionIgnore + SumPVECriticalDamageReductionIgnore) * (1 + SumPVEMagicCriticalDamageReductionIgnoreAmplifyRate/10000 + SumPVECriticalDamageReductionIgnoreAmplifyRate/10000) * MulW(PVECriticalDamageReductionIgnoreWeakenRate)', i:['PVECriticalDamageReductionIgnore','PVECriticalDamageReductionIgnoreAmplifyRate','PVECriticalDamageReductionIgnoreWeakenRate','PVEMagicCriticalDamageReductionIgnore','PVEMagicCriticalDamageReductionIgnoreAmplifyRate'] },
    { o:'TotalPVPMeleeCriticalDamageReductionIgnore', c:'07_치명타 저항/감소', f:'(SumPVPMeleeCriticalDamageReductionIgnore + SumPVPCriticalDamageReductionIgnore) * (1 + SumPVPMeleeCriticalDamageReductionIgnoreAmplifyRate/10000 + SumPVPCriticalDamageReductionIgnoreAmplifyRate/10000) * MulW(PVPCriticalDamageReductionIgnoreWeakenRate)', i:['PVPCriticalDamageReductionIgnore','PVPCriticalDamageReductionIgnoreAmplifyRate','PVPCriticalDamageReductionIgnoreWeakenRate','PVPMeleeCriticalDamageReductionIgnore','PVPMeleeCriticalDamageReductionIgnoreAmplifyRate'] },
    { o:'TotalPVPRangedCriticalDamageReductionIgnore', c:'07_치명타 저항/감소', f:'(SumPVPRangedCriticalDamageReductionIgnore + SumPVPCriticalDamageReductionIgnore) * (1 + SumPVPRangedCriticalDamageReductionIgnoreAmplifyRate/10000 + SumPVPCriticalDamageReductionIgnoreAmplifyRate/10000) * MulW(PVPCriticalDamageReductionIgnoreWeakenRate)', i:['PVPCriticalDamageReductionIgnore','PVPCriticalDamageReductionIgnoreAmplifyRate','PVPCriticalDamageReductionIgnoreWeakenRate','PVPRangedCriticalDamageReductionIgnore','PVPRangedCriticalDamageReductionIgnoreAmplifyRate'] },
    { o:'TotalPVPMagicCriticalDamageReductionIgnore', c:'07_치명타 저항/감소', f:'(SumPVPMagicCriticalDamageReductionIgnore + SumPVPCriticalDamageReductionIgnore) * (1 + SumPVPMagicCriticalDamageReductionIgnoreAmplifyRate/10000 + SumPVPCriticalDamageReductionIgnoreAmplifyRate/10000) * MulW(PVPCriticalDamageReductionIgnoreWeakenRate)', i:['PVPCriticalDamageReductionIgnore','PVPCriticalDamageReductionIgnoreAmplifyRate','PVPCriticalDamageReductionIgnoreWeakenRate','PVPMagicCriticalDamageReductionIgnore','PVPMagicCriticalDamageReductionIgnoreAmplifyRate'] },

    // ─── 15_경험치/재화/드랍 — 엑시스/퀘스트/컨텐츠/희귀자원 ─────────────
    { o:'TotalAxisSkillEXPBonus', c:'15_경험치/재화/드랍', f:'SumAxisSkillEXPBonus', i:['AxisSkillEXPBonus'] },
    { o:'TotalQuestClearEXPBonus', c:'15_경험치/재화/드랍', f:'SumQuestClearEXPBonus', i:['QuestClearEXPBonus'] },
    { o:'TotalContentClearEXPBonus', c:'15_경험치/재화/드랍', f:'SumContentClearEXPBonus', i:['ContentClearEXPBonus'] },
    { o:'TotalRarityResourceBonus', c:'15_경험치/재화/드랍', f:'SumRarityResourceBonus', i:['RarityResourceBonus'] },

    // ─── 18_기타 — 전투력/채집 쿨타임 ───────────────────────────────
    { o:'TotalStatCombatPower', c:'18_기타', f:'SumStatCombatPower  // 별도 전투력 공식 문서 참조', i:['StatCombatPower'] },
    { o:'TotalSkillCombatPowerRate', c:'18_기타', f:'SumSkillCombatPowerRate  // 별도 전투력 공식 문서 참조', i:['SkillCombatPowerRate'] },
    { o:'TotalCollectCoolTimeRate', c:'18_기타', f:'SumCollectCoolTimeRate', i:['CollectCoolTimeRate'] },
];

