# Project 베르시온 (Versione)

MMORPG 기획 검증용 프로토타입 — 오토배틀 필드 전투 시뮬레이터

## 플레이

> **[▶ 게임 플레이하기](https://[GitHub아이디].github.io/[저장소이름]/)**

*(배포 후 위 링크를 실제 주소로 교체해 주세요)*

## 주요 기능

- 레벨 1 ~ 300 오토배틀 전투
- 스테이지 1 ~ 1,000,000 필드 사냥
- 기본 스탯 7종 (STR / DEX / INT / AGI / CON / WIS / LUK) 치환 능력치 시스템
- 레벨별 능력치 성장 설정
- 능력치 상세 팝업 (치환 능력치 / 전체 능력치 탭)
- 전투 로그 크기 조절 (자동 저장)
- 패치 노트 기록

## 기술 스택

- HTML / CSS / JavaScript (빌드 도구 없음, 순수 정적 파일)
- GitHub Pages 자동 배포 (GitHub Actions)

## 폴더 구조

```
ui/src/          ← 실제 게임 파일 (GitHub Pages 배포 대상)
  field_battle.html   메인 게임 화면
  character_info.html 캐릭터 능력치 상세 팝업
  stats_calc.js       능력치 계산 로직
docs/            ← 기획 문서 (배포 제외)
data/            ← 데이터 파일 (배포 제외)
```
