/**
 * 期限確認
 * @param deadline 対象期限
 * @param status 対象ステータス
 * @returns
 */
export const isOverDeadline = (deadline: string, status: string): boolean => {
  const now: Date = new Date();
  const deadlineDate: Date = new Date(deadline)
  return compareDate(now, deadlineDate) === 1 && status !== 'done'
}

/**
 * 期限カラー取得
 * @param isOver 期限超過フラグ
 * @returns vuetify textクラス
 */
export const getOverDeadlineColor = (isOver: boolean): string => {
  return isOver ? 'text-red-accent-4' : ''
}
