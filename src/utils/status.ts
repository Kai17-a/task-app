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
