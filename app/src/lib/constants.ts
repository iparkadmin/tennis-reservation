/**
 * アプリ共通の文言
 */

/** トップページ：テニスコート利用ガイド（セクション構造） */
export const TOP_PAGE_GUIDE_TITLE = "テニスコート利用ガイド";

export const TOP_PAGE_GUIDE_SECTIONS: { title: string; items: string[] }[] = [
  {
    title: "ご予約について",
    items: [
      "ご予約は湘南アイパークセキュリティカード保有者に限ります。",
      "予約可能日：土曜・日曜・祝日のみ（今日から30日以内）",
      "予約可能時間：9時−11時、11時−13時、13時−15時、15時−17時（2時間枠）",
      "1日2時間1枠・1週間（表示の7日）で2枠まで予約可能です。",
      "キャンセルは前日17時まで可能です。",
      "ご予約の際に利用者全員（当日参加される方の氏名）をご登録ください。登録されていない方のご利用はできません。",
      "有効でないメールアドレス（プライベートメール等）の登録や、利用実態のない予約を繰り返した場合、利用停止またはアカウント削除となる場合があります。",
    ],
  },
  {
    title: "入退館",
    items: ["セキュリティカード保有者が西守衛所にて入退館手続きを行ってください。"],
  },
  {
    title: "ご利用時の注意事項",
    items: [
      "利用時間を厳守してください（準備・片付け含む）。",
      "テニスシューズもしくは運動靴にて、安全に考慮し、ご使用ください。スパイク等コート破損の恐れがあるものは使用禁止です。",
      "ケガ防止のため、準備体操・ストレッチ等を入念に行ってください。",
      "コート内での飲食はご遠慮ください。",
      "審判台やベンチを移動させないでください。",
      "大声・音楽再生など周辺への迷惑行為は禁止します。",
      "ゴミは各自お持ち帰りください。",
      "更衣室・トイレは所定の場所をご利用ください。執務施設内への立ち入りはお控えください。",
    ],
  },
  {
    title: "ご利用後",
    items: ["コート使用後は必ずコートブラシをかけ、ネットを緩めてください。"],
  },
  {
    title: "事故・緊急時",
    items: [
      "事故・設備破損が発生した場合は、速やかに防災センターへ連絡してください。（守衛所連絡先：0466-50-1825）",
    ],
  },
  {
    title: "ご利用停止について",
    items: [
      "無断キャンセル（予約日を迎えても利用しない、事前連絡なく欠席する等）やマナー違反を繰り返す場合、今後のご利用をお断りすることがあります。",
    ],
  },
];

/** ご利用時の注意事項 セクションタイトル（予約詳細等で参照リンク用） */
export const NOTICE_TITLE = "ご利用時の注意事項";

/** 予約カレンダー：トップページへのリンク（前後の文言） */
export const NOTICE_LINK_PREFIX = "※ご利用時の注意事項は";
export const NOTICE_LINK_TEXT = "トップページの利用ガイドをご確認ください（こちら）";

/** 予約詳細：トップページへのリンク（前後の文言） */
export const NOTICE_DETAIL_LINK_PREFIX = "※詳しい利用ルールは";
export const NOTICE_DETAIL_LINK_TEXT = "トップページでご確認ください（こちら）";

/** 当日のご案内（予約詳細ページ用） */
export const SAME_DAY_GUIDE_ITEMS = [
  "入退館：西守衛所にてセキュリティカードで手続きを行ってください。",
  "利用時間を厳守してください（準備・片付け含む）。",
  "利用後はコートブラシをかけ、ネットを緩めてください。",
  "事故・設備破損時は速やかに守衛所へ連絡してください。（守衛所連絡先：0466-50-1825）",
];

/** メールアドレス入力の注意（ログイン・新規登録・パスワードリセット） */
export const EMAIL_IPARK_PORTAL_NOTICE =
  "メールアドレスはアイパークポータルでご利用のメールアドレスをご入力ください。";

/** 利用実績記録：利用有無の選択肢 */
export const UTILIZATION_STATUS_OPTIONS = [
  { value: "unrecorded", label: "未記録" },
  { value: "used", label: "利用済" },
  { value: "no_show", label: "無断キャンセル" },
] as const;

/** 利用実績記録：マナー状況の選択肢 */
export const MANNERS_STATUS_OPTIONS = [
  { value: "no_violation", label: "違反なし" },
  { value: "loud_music", label: "大声・音楽再生" },
  { value: "time_exceeded", label: "利用時間超過" },
  { value: "garbage", label: "ゴミの持ち帰り不備" },
  { value: "smoking", label: "喫煙の疑いあり" },
  { value: "restoration", label: "現状復旧不備" },
  { value: "manners_other", label: "マナー状況その他" },
] as const;

/** 利用実績記録：利用有無の表示用ラベル */
export const UTILIZATION_STATUS_LABELS: Record<string, string> = {
  unrecorded: "未記録",
  used: "利用済",
  no_show: "無断キャンセル",
};

/** 利用実績記録：マナー状況の表示用ラベル */
export const MANNERS_STATUS_LABELS: Record<string, string> = {
  no_violation: "違反なし",
  loud_music: "大声・音楽再生",
  time_exceeded: "利用時間超過",
  garbage: "ゴミの持ち帰り不備",
  smoking: "喫煙の疑いあり",
  restoration: "現状復旧不備",
  manners_other: "マナー状況その他",
};

/** 予約時の利用者入力 */
export const UTILIZERS_LABEL = "利用者（当日参加される方の氏名）";
export const UTILIZERS_DESCRIPTION =
  "当日参加される方の氏名をご入力ください。過去に登録した利用者がいればデフォルトで表示されます。編集・追加・削除できます。";
