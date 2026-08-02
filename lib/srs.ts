// 라이트너 박스 방식의 아주 단순한 간격 반복(spaced repetition) 계산
// 박스가 높을수록(=여러 번 맞출수록) 복습 간격이 길어짐
const BOX_INTERVAL_DAYS: Record<number, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
};

export function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayStr(): string {
  return toDateStr(new Date());
}

// 정답이면 박스를 한 단계 올리고(최대 5), 오답이면 1번 박스로 되돌림
export function nextBox(currentBox: number, correct: boolean): number {
  if (!correct) return 1;
  return Math.min(currentBox + 1, 5);
}

export function nextReviewDate(box: number): string {
  const days = BOX_INTERVAL_DAYS[box] ?? 1;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateStr(date);
}
