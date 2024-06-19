/**
 * 論理名から物理名を取得
 * @param status
 * @returns ステータス物理名
 */
export const getStatusName = (status: string): string => {
  switch (status) {
    case "todo":
      return "未着手"
    case "working":
      return "作業中"
    case "waiting":
      return "レビュー待ち"
    case "done":
      return "完了"
    default:
      return "未定義";
  }
}

/**
 * ステータスに紐づく色取得
 * @param status
 * @returns
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "todo":
      return "secondary"
    case "working":
      return "yellow"
    case "waiting":
      return "primary"
    case "done":
      return "green"
    default:
      return "gray";
  }
}
