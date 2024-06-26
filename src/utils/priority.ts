interface Priorities {
  key: string;
  value: string
}

/**
 * 優先度一覧取得
 * @returns 優先度オブジェクト
 */
export const getPrioritesList = (): Priorities[] => {
  return [
    {
      key: "low",
      value: "低"
    },
    {
      key: "mid",
      value: "中"
    },
    {
      key: "high",
      value: "高"
    }
  ]
}
