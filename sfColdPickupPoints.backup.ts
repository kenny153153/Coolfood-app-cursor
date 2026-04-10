/**
 * 順豐冷運自提點數據 (SF Express Cold Chain Self-Pickup Points)
 * 僅包含支援冷運服務 (✔️) 的順豐站，數據來源：順豐官方
 *
 * 此檔案為本地靜態數據，不需要 API 請求，確保極速載入。
 * 按地區 (district) 分組，供二級下拉選單使用。
 *
 * 最後自動更新：2026-02-10
 * 由 scripts/update-sf-cold-points.ts (Playwright) 自動生成
 * 來源頁面：https://htm.sf-express.com/hk/tc/dynamic_function/S.F.Network/SF_store_address/
 *
 * ⚠️ 重要：自動腳本只會覆蓋 SF_COLD_PICKUP_DISTRICTS_RAW 區塊。
 *    下方的 MANUAL_OVERRIDES 區塊不會被覆蓋，你可以安全地手動編輯。
 */

export interface SfColdPickupPoint {
  /** 順豐站點碼 e.g. "852TAL" */
  code: string;
  /** 網點簡稱 e.g. "香港仔富嘉工廈順豐站" */
  name: string;
  /** 完整地址 */
  address: string;
  /** 子區域 e.g. "香港仔" */
  area: string;
  /** 營業時間 */
  hours: { weekday: string; weekend: string };
}

export interface SfColdDistrict {
  /** 地區名稱 (第一層下拉) */
  district: string;
  /** 該地區的冷運自提點 */
  points: SfColdPickupPoint[];
}

// ╔══════════════════════════════════════════════════════════════════╗
// ║  MANUAL_OVERRIDES — 手動加註區塊（不會被自動腳本覆蓋）          ║
// ║                                                                ║
// ║  用途 1：EXCLUDE — 排除已知有問題的網點（冷櫃壞了、搬遷等）    ║
// ║  用途 2：INCLUDE — 手動新增腳本未抓到但確認可用的網點            ║
// ║                                                                ║
// ║  規則：                                                        ║
// ║  - EXCLUDE 優先：若一個 code 同時出現在 EXCLUDE 和主數據中，     ║
// ║    最終結果會排除它                                              ║
// ║  - INCLUDE 的網點會被追加到對應地區，不會重複                    ║
// ╚══════════════════════════════════════════════════════════════════╝

/**
 * 手動排除的網點 code 列表
 * 例如冷櫃故障、已搬遷、服務差等原因
 * 加上備註方便日後回溯
 */
export const MANUAL_EXCLUDE_CODES: { code: string; reason: string }[] = [
  // { code: '852XXXX', reason: '2025-01 冷櫃長期故障，已向順豐反映' },
  // { code: '852YYYY', reason: '2025-03 已搬遷，新址未確認' },
];
/**
 * 手動新增的網點（腳本未抓到但你已驗證可用的）
 * 格式與 SfColdPickupPoint 相同，額外加上 district 欄位
 */
export const MANUAL_INCLUDE_POINTS: (SfColdPickupPoint & { district: string })[] = [
  // {
  //   code: '852ZZZZ',
  //   name: '測試站點',
  //   address: '香港某區某街某號',
  //   area: '某區',
  //   district: '油尖旺區',
  //   hours: { weekday: '10:00-20:00', weekend: '12:00-18:00' },
  // },
];
// ═══════════════════════════════════════════════════════════════════
//  以下為自動生成的主數據（由 scripts/update-sf-cold-points.ts 管理）
//  手動編輯亦可，但下次跑腳本時此區塊會被覆蓋
// ═══════════════════════════════════════════════════════════════════

/**
 * 全港順豐冷運自提點 — 按地區分組（原始數據）
 * 僅包含「冷運服務 ✔️」的網點
 */
export const SF_COLD_PICKUP_DISTRICTS_RAW: SfColdDistrict[] = [
  // ─── 中西區 ───
  {
    district: '中西區',
    points: [
      {
        code: '852M',
        name: '上環文樂商廈順豐站',
        address: '香港香港島中西區中上環文咸東街91號文樂商業大廈地下A號舖',
        area: '上環',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 09:00-18:00' },
      },
      {
        code: '852MD',
        name: '上環嘉安大廈順豐站',
        address: '香港香港島中西區上環新街市街15-27號，干諾道西8-14號嘉安大廈地下15號舖',
        area: '上環',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852MB',
        name: '中環勝基中心順豐站',
        address: '香港香港島中西區中環皇后大道中208號勝基中心地下D舖',
        area: '中環',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852MA',
        name: '西營盤兆祥坊順豐站',
        address: '香港香港島中西區西營盤朝光街4A號兆祥坊A2地下',
        area: '西營盤',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852Z502',
        name: '西環恒裕大廈順豐站',
        address: '香港香港島中西區西環堅尼地城加多近街45-55號恒裕大廈地下3及4號舖',
        area: '堅尼地城',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
      {
        code: '852Z501',
        name: '西環曉暉大廈順豐站',
        address: '香港香港島中西區西環卑路乍街1L-1Q號曉暉大廈地下1號',
        area: '堅尼地城',
        hours: { weekday: '11:00-20:30', weekend: '12:00-20:00' },
      },
    ],
  },
  // ─── 灣仔區 ───
  {
    district: '灣仔區',
    points: [
      {
        code: '852TA',
        name: '灣仔莊士敦大樓順豐站',
        address: '香港香港島灣仔區灣仔聯發街9, 11-13號莊士敦大樓地下D舖',
        area: '灣仔',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852TC',
        name: '灣仔謝菲道順豐站',
        address: '香港香港島灣仔區灣仔謝菲道182號地下',
        area: '灣仔',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
    ],
  },
  // ─── 東區 ───
  {
    district: '東區',
    points: [
      {
        code: '852P',
        name: '炮台山海城洋樓順豐站',
        address: '香港香港島東區炮台山威非路道1-1B號,電氣道141-155號海城洋樓地下E舖',
        area: '炮台山',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852PB',
        name: '柴灣益高工廈順豐站',
        address: '香港香港島東區柴灣嘉業街10號益高工業大廈地下B室',
        area: '柴灣',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 09:00-18:00' },
      },
      {
        code: '852PCL',
        name: '柴灣國貿中心順豐站',
        address: '香港香港島東區柴灣祥利街29號國貿中心5樓1室',
        area: '柴灣',
        hours: { weekday: '11:00-21:00', weekend: '星期六 12:00-20:00 / 星期日 休息' },
      },
      {
        code: '852PC',
        name: '筲箕灣新高聲工廈順豐站',
        address: '香港香港島東區筲箕灣阿公岩村道6號新高聲工業大廈地下1號舖',
        area: '筲箕灣',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852Z552',
        name: '小西灣富景花園順豐站',
        address: '香港香港島東區小西灣小西灣道18號富景花園商場1樓173號舖 & 128號舖',
        area: '小西灣',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
      {
        code: '852PD',
        name: '北角錦屏街順豐站',
        address: '香港香港島東區北角錦屏街59&61號東發大廈D座地下19&20號舖',
        area: '北角',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852NPTM',
        name: '北角豐富商場順豐站',
        address: '香港香港島東區北角英皇道480號豐富商場地下8號舖',
        area: '北角',
        hours: { weekday: '10:00-22:00', weekend: '12:00-20:00' },
      },
    ],
  },
  // ─── 南區 ───
  {
    district: '南區',
    points: [
      {
        code: '852TB',
        name: '黃竹坑益年工廈順豐站',
        address: '香港香港島南區黃竹坑香業道6號及業發街6號益年工業大廈地下A2號舖',
        area: '黃竹坑',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852TE',
        name: '黃竹坑保濟工廈順豐站',
        address: '香港香港島南區黃竹坑黃竹坑道28號保濟工業大廈地下A室',
        area: '黃竹坑',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852TAL',
        name: '香港仔富嘉工廈順豐站',
        address: '香港香港島南區香港仔大道234號富嘉工業大廈9樓6室',
        area: '香港仔',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
      {
        code: '852Z601',
        name: '鴨脷洲海怡西商場順豐站',
        address: '香港香港島南區鴨脷洲海怡路12A號海怡西商場209D舖',
        area: '鴨脷洲',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
    ],
  },
  // ─── 油尖旺區 ───
  {
    district: '油尖旺區',
    points: [
      {
        code: '852BB',
        name: '油麻地金華大廈順豐站',
        address: '香港九龍油尖旺區油麻地廣東道831號金華大廈B座地下B1舖',
        area: '油麻地',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852BA',
        name: '太子汝洲街順豐站',
        address: '香港九龍油尖旺區太子汝州街58號地下',
        area: '太子',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852BF',
        name: '太子基隆街順豐站',
        address: '香港九龍油尖旺區太子基隆街19號地下',
        area: '太子',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852BDL',
        name: '太子大南街順豐站',
        address: '香港九龍油尖旺區太子大南街24, 24A及26號地下A舖',
        area: '太子',
        hours: { weekday: '10:00-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852BD',
        name: '旺角福全街順豐站',
        address: '香港九龍油尖旺區旺角福全街福康大樓17-19號地下AB1舖',
        area: '旺角',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 09:00-18:00' },
      },
      {
        code: '852BE',
        name: '旺角黑布街順豐站',
        address: '香港九龍油尖旺區旺角黑布街15號地舖',
        area: '旺角',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852E',
        name: '尖沙咀余仁生中心順豐站',
        address: '香港九龍油尖旺區尖沙咀漆咸道南11-15號余仁生中心地下A, B及C舖',
        area: '尖沙咀',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 09:00-18:00' },
      },
      {
        code: '852EB',
        name: '尖沙咀南洋中心順豐站',
        address: '香港九龍油尖旺區東部麽地道75號南洋中心UG層21&22室',
        area: '尖沙咀',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852EE',
        name: '尖沙咀漆咸圍順豐站',
        address: '香港九龍油尖旺區尖沙咀漆咸圍10-12號意公寓地下商舖',
        area: '尖沙咀',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852ED',
        name: '尖沙咀力寶太陽廣場順豐站',
        address: '香港九龍油尖旺區尖沙咀廣東道28號力寶太陽廣場310室',
        area: '尖沙咀',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852BFL',
        name: '大角咀中興樓順豐站',
        address: '香港九龍油尖旺區大角咀中匯街41號中興樓地下12號舖',
        area: '大角咀',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
    ],
  },
  // ─── 深水埗區 ───
  {
    district: '深水埗區',
    points: [
      {
        code: '852D',
        name: '荔枝角順昌工廈順豐站',
        address: '香港九龍深水埗區荔枝角永康街24-26號順昌工業大廈地下A舖',
        area: '荔枝角',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 09:00-18:00' },
      },
      {
        code: '852DB',
        name: '荔枝角福源廣場順豐站',
        address: '香港九龍深水埗區荔枝角永康街37號福源廣場地下A2舖',
        area: '荔枝角',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852NC',
        name: '荔枝角麗昌工廠大廈順豐站',
        address: '香港九龍深水埗區荔枝角青山道479-479A號麗昌工廠大廈地下3號舖',
        area: '荔枝角',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852DCL',
        name: '荔枝角泓景匯順豐站',
        address: '香港九龍深水埗區荔枝角荔枝角道863號泓景台泓景匯地下2A舖',
        area: '荔枝角',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852DA',
        name: '長沙灣楊耀松順豐站',
        address: '香港九龍長沙灣長順街19號楊耀松第六工業大廈地下A鋪',
        area: '長沙灣',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852DDL',
        name: '深水埗青山道順豐站',
        address: '香港九龍深水埗區深水埗青山道143號地下',
        area: '深水埗',
        hours: { weekday: '10:00-22:00', weekend: '12:00-20:00' },
      },
    ],
  },
  // ─── 九龍城區 ───
  {
    district: '九龍城區',
    points: [
      {
        code: '852Z403',
        name: '啟德零售館順豐站',
        address: '香港九龍九龍城區啟德啟德體育園零售館2期2樓M2-205室舖',
        area: '啟德',
        hours: { weekday: '12:00- 21:00', weekend: '12:00-20:00' },
      },
      {
        code: '852K',
        name: '紅磡恆豐工廈順豐站',
        address: '香港九龍九龍城區紅磡鶴園街2G號恆豐工業大廈2期地下A2室',
        area: '紅磡',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 09:00-18:00' },
      },
      {
        code: '852KEL',
        name: '紅磡黃埔花園順豐站',
        address: '香港九龍九龍城區紅磡黃埔花園12期地庫9A及9B號舖',
        area: '紅磡',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852Z253',
        name: '九龍城太子道西順豐站',
        address: '香港九龍九龍城區九龍城太子道西368-374號龍珠樓地下',
        area: '九龍城',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
      {
        code: '852KBL',
        name: '何文田愛民邨康民樓順豐站',
        address: '香港九龍九龍城區何文田忠孝街60號愛民邨康民樓（C座）地下5號舖',
        area: '何文田',
        hours: { weekday: '11:00-20:30', weekend: '12:00-20:00' },
      },
      {
        code: '852KDL',
        name: '土瓜灣興基豪園順豐站',
        address: '香港九龍九龍城區土瓜灣炮仗街178號興基豪園地下B舖',
        area: '土瓜灣',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
      {
        code: '852KFL',
        name: '土瓜灣樂民新邨順豐站',
        address: '香港九龍九龍城區土瓜灣樂民新邨G座平台地下126號舖（連閣樓）',
        area: '土瓜灣',
        hours: { weekday: '12:00-21:00', weekend: '12:00-20:00' },
      },
    ],
  },
  // ─── 黃大仙區 ───
  {
    district: '黃大仙區',
    points: [
      {
        code: '852J',
        name: '新蒲崗福和工廈順豐站',
        address: '香港九龍黃大仙區新蒲崗雙喜街5號福和工業大廈地下',
        area: '新蒲崗',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 09:00-18:00' },
      },
      {
        code: '852Z402',
        name: '慈雲山中心順豐站',
        address: '香港九龍黃大仙區慈雲山毓華街23號慈雲山中心4樓410B舖',
        area: '慈雲山',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
    ],
  },
  // ─── 觀塘區 ───
  {
    district: '觀塘區',
    points: [
      {
        code: '852HB',
        name: '九龍灣環球工商大廈順豐站',
        address: '香港九龍觀塘區九龍灣常悅街20號環球工商大廈地下4A號舖',
        area: '九龍灣',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852HC',
        name: '九龍灣榮發工廈順豐站',
        address: '香港九龍觀塘區九龍灣宏泰道12號榮發工業大廈地下5號舖',
        area: '九龍灣',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852C',
        name: '觀塘豐業大廈順豐站',
        address: '香港九龍觀塘區觀塘偉業街170號豐業工業大廈B地舖',
        area: '觀塘',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 09:00-18:00' },
      },
      {
        code: '852CAB',
        name: '觀塘鴻圖工廈順豐站',
        address: '香港九龍觀塘區觀塘鴻圖道80號鴻圖工業大廈地下1號舖',
        area: '觀塘',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 09:00-18:00' },
      },
      {
        code: '852CAC',
        name: '觀塘友聯大廈順豐站',
        address: '香港九龍觀塘區觀塘巧明街112號友聯大廈地倉',
        area: '觀塘',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852CH',
        name: '觀塘金凱工廈順豐站',
        address: '香港九龍觀塘區觀塘鴻圖道58號金凱工業大廈地下',
        area: '觀塘',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852HD',
        name: '觀塘振邦工廈順豐站',
        address: '香港九龍觀塘區觀塘偉業街103號振邦工業大廈地下',
        area: '觀塘',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852Z151',
        name: '觀塘泓富廣場順豐站',
        address: '香港九龍觀塘區觀塘成業街6號泓富廣場7樓708室',
        area: '觀塘',
        hours: { weekday: '11:00-20:00', weekend: '星期六 12:00-20:00 / 星期日 星期日及公眾假期休息' },
      },
      {
        code: '852Z152',
        name: '秀茂坪寶達商場順豐站',
        address: '香港九龍觀塘區秀茂坪寶達邨寶達商場P1樓108號',
        area: '觀塘',
        hours: { weekday: '12:00- 21:00', weekend: '12:00- 20:00' },
      },
      {
        code: '852CAD',
        name: '油塘味千集團大廈順豐站',
        address: '香港九龍觀塘區油塘仁宇圍味千集團大厦B座地庫（蔚藍東岸對面）',
        area: '油塘',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852ACL',
        name: '藍田匯景廣場順豐站',
        address: '香港九龍觀塘區藍田匯景道8號匯景廣場3樓4A20-22號舖',
        area: '藍田',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852CNL',
        name: '秀茂坪安達商場順豐站',
        address: '香港九龍觀塘區秀茂坪安達邨安達商場地下低層LG21號舖',
        area: '秀茂坪',
        hours: { weekday: '12:00-21:00', weekend: '12:00-20:00' },
      },
    ],
  },
  // ─── 荃灣區 ───
  {
    district: '荃灣區',
    points: [
      {
        code: '852G',
        name: '荃灣匯力工業中心順豐站',
        address: '香港新界荃灣區荃灣沙咀道26-38號匯力工業中心地下7及8B舖',
        area: '荃灣',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 09:00-18:00' },
      },
      {
        code: '852GA',
        name: '荃灣金銘聯合中心順豐站',
        address: '香港新界荃灣區荃灣楊屋道127-135號金銘聯合中心地下',
        area: '荃灣',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852Z355',
        name: '荃灣南豐中心順豐站',
        address: '香港新界荃灣區荃灣西樓角路64-98號及荃灣青山公路264-298號南豐中心807-808室',
        area: '荃灣',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
    ],
  },
  // ─── 屯門區 ───
  {
    district: '屯門區',
    points: [
      {
        code: '852U',
        name: '屯門凱昌工廈順豐站',
        address: '香港新界屯門區屯門河田街4號凱昌工業大廈地下F舖',
        area: '屯門',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 09:00-18:00' },
      },
      {
        code: '852UD',
        name: '屯門萬能閣順豐站',
        address: '香港新界屯門區屯門海榮路9號萬能閣地下01室',
        area: '屯門',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852Z661',
        name: '屯門時代廣場順豐站',
        address: '香港新界屯門區屯門時代廣場北翼2樓32號舖',
        area: '屯門',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852FNL',
        name: '屯門富泰商場順豐站',
        address: '香港新界屯門區屯門富泰邨富泰商場1樓102B舖',
        area: '屯門',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
      {
        code: '852UAL',
        name: '屯門美樂花園商場順豐站',
        address: '香港新界屯門區屯門碼頭美樂花園商場65號舖',
        area: '屯門',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
      {
        code: '852TCSM',
        name: '屯門井財街順豐站',
        address: '香港新界屯門區屯門井財街11號仁愛大廈地下9號舖',
        area: '屯門',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
      {
        code: '852Z660',
        name: '屯門愛定商場順豐站',
        address: '香港新界屯門鄉事會路2A號愛定邨愛定商場3樓N-313號舖',
        area: '屯門',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
    ],
  },
  // ─── 元朗區 ───
  {
    district: '元朗區',
    points: [
      {
        code: '852UAA',
        name: '元朗麗新元朗中心順豐站',
        address: '香港新界元朗區元朗宏業東街27號麗新元朗中心地下12C',
        area: '元朗',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 09:00-18:00' },
      },
      {
        code: '852UAB',
        name: '元朗雄偉工廈順豐站',
        address: '香港新界元朗區元朗喜業街1-5號雄偉工業大廈地下F室',
        area: '元朗',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 09:00-18:00' },
      },
      {
        code: '852Z701',
        name: '元朗安景樓順豐站',
        address: '香港新界元朗區元朗合益路81-97號安景樓地下 A 舖',
        area: '元朗',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852FLL',
        name: '元朗同發大廈順豐站',
        address: '香港新界元朗區元朗屏會街9號同發大廈地下F舖連閣樓',
        area: '元朗',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852Z662',
        name: '洪水橋德祥樓順豐站',
        address: '香港新界元朗區元朗洪水橋大街1號德祥樓地下25, 26A 及12B號舖',
        area: '元朗',
        hours: { weekday: '12:00-21:00', weekend: '12:00-20:00' },
      },
      {
        code: '852UFL',
        name: '元朗好順利大廈順豐站',
        address: '香港新界元朗區元朗鳯攸南街9號好順利大廈地下79號舖',
        area: '元朗',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
      {
        code: '852UGL',
        name: '元朗安泰樓順豐站',
        address: '香港新界元朗區元朗安興街59-67號安泰樓地下3號舖',
        area: '元朗',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852UHL',
        name: '元朗萬金中心順豐站',
        address: '香港新界元朗區元朗水車館街28號萬金中心地下23舖',
        area: '元朗',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852FBL',
        name: '天水圍天瑞商場順豐站',
        address: '香港新界元朗區天水圍天瑞邨天瑞商場地下24-25號舖',
        area: '天水圍',
        hours: { weekday: '10:30-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852UCL',
        name: '天水圍天澤商場順豐站',
        address: '香港新界元朗區天水圍天瑞路71-77號天澤商場3樓310舖',
        area: '天水圍',
        hours: { weekday: '10:30-22:00', weekend: '12:00-20:00' },
      },
    ],
  },
  // ─── 北區 ───
  {
    district: '北區',
    points: [
      {
        code: '852Z010',
        name: '粉嶺皇后山邨順豐站',
        address: '香港新界北區粉嶺皇后山商場地下7號舖',
        area: '粉嶺',
        hours: { weekday: '11:00-20:30', weekend: '12:00-20:00' },
      },
      {
        code: '852FTL',
        name: '上水彩園邨彩珠樓順豐站',
        address: '香港新界北區上水彩園路彩園邨彩珠樓地下117號舖',
        area: '上水',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
      {
        code: '852NDL',
        name: '上水符興街順豐站',
        address: '香港新界北區上水符興街4號地下',
        area: '上水',
        hours: { weekday: '10:00-22:00', weekend: '12:00-20:00' },
      },
    ],
  },
  // ─── 大埔區 ───
  {
    district: '大埔區',
    points: [
      {
        code: '852AA',
        name: '大埔同茂坊順豐站',
        address: '香港新界大埔區大埔同茂坊1及3號北翼地舖',
        area: '大埔',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 09:00-18:00' },
      },
      {
        code: '852FCL',
        name: '大埔昌運中心順豐站',
        address: '香港新界大埔區大埔安慈路4號昌運中心地下A5舖',
        area: '大埔',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852NLL',
        name: '大埔富善商場順豐站',
        address: '香港新界大埔區埔富善商場1樓 F122B舖',
        area: '大埔',
        hours: { weekday: '12:00-21:00', weekend: '12:00-20:00' },
      },
    ],
  },
  // ─── 沙田區 ───
  {
    district: '沙田區',
    points: [
      {
        code: '852F',
        name: '沙田美高工廈順豐站',
        address: '香港新界沙田區火炭坳背灣街53-55號美高工業大廈地下B室',
        area: '火炭',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852FH',
        name: '華樂工業中心順豐站',
        address: '香港新界沙田區火炭牛湖托街華樂工業中心2期UG樓C5室',
        area: '火炭',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 09:00-18:00' },
      },
      {
        code: '852FB',
        name: '沙田新貿中心順豐站',
        address: '香港沙田區沙田安平街6號新貿中心B座地下7號',
        area: '沙田',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852FE',
        name: '沙田工業中心順豐站',
        address: '香港新界沙田區沙田源順圍5-7號沙田工業中心B座地下16室',
        area: '沙田',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852FSL',
        name: '沙田第一城樂薈順豐站',
        address: '香港新界沙田區沙田百得街置富第一城樂薈地下G41號舖',
        area: '沙田',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852NAL',
        name: '沙田乙明邨明信樓順豐站',
        address: '香港新界沙田區沙田乙明邨街3號明信樓地下51號舖',
        area: '沙田',
        hours: { weekday: '12:00-21:00', weekend: '12:00-20:00' },
      },
      {
        code: '852NJL',
        name: '沙田瀝源邨華豐樓順豐站',
        address: '香港新界沙田區沙田瀝源街6號瀝源邨華豐樓地下ST5號舖',
        area: '沙田',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
      {
        code: '852FUL',
        name: '馬鞍山WeGoMall順豐站',
        address: '香港新界沙田區馬鞍山保泰街16號WeGoMall地下G09舖',
        area: '馬鞍山',
        hours: { weekday: '12:00-21:00', weekend: '12:00-20:00' },
      },
    ],
  },
  // ─── 西貢區 ───
  {
    district: '西貢區',
    points: [
      {
        code: '852AAL',
        name: '將軍澳茵怡花園順豐站',
        address: '香港新界西貢區將軍澳貿泰路8號茵怡花園第1座地下6號舖',
        area: '將軍澳',
        hours: { weekday: '10:30-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852ABL',
        name: '將軍澳寶盈花園商場順豐站',
        address: '香港新界西貢區將軍澳唐俊街11號寶盈花園商場一樓S21-S21A號舖',
        area: '將軍澳',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
      {
        code: '852SKL',
        name: '西貢宜春街順豐站',
        address: '香港新界西貢區西貢宜春街66號地下10號舖',
        area: '西貢',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
    ],
  },
  // ─── 葵青區 ───
  {
    district: '葵青區',
    points: [
      {
        code: '852L',
        name: '葵涌禎昌工廈順豐站',
        address: '香港新界葵青區葵涌大連排道葵昌路1-7號禎昌工業大廈地下C舖',
        area: '葵涌',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 09:00-18:00' },
      },
      {
        code: '852LA',
        name: '葵涌和豐工廈順豐站',
        address: '香港新界葵青區葵涌打磚坪街68號和豐工業中心地下6號6B室',
        area: '葵涌',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852LB',
        name: '葵涌鍾意恆勝中心順豐站',
        address: '香港新界葵青區葵涌貨櫃碼頭路71-75號鍾意恆勝中心地下3室',
        area: '葵涌',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852LC',
        name: '葵涌嘉慶中心順豐站',
        address: '香港新界葵青區葵涌嘉慶路5-9號嘉慶中心地下B鋪',
        area: '葵涌',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 休息' },
      },
      {
        code: '852LBL',
        name: '葵涌大隴街葵都大廈順豐站',
        address: '香港新界葵青區葵涌大隴街129-151號葵都大廈地下7號舖',
        area: '葵涌',
        hours: { weekday: '12:00-21:00', weekend: '12:00-20:00' },
      },
      {
        code: '852DEL',
        name: '荔景邨明景樓順豐站',
        address: '香港新界葵青區荔景邨明景樓地下4號舖',
        area: '荔景',
        hours: { weekday: '11:00-20:00', weekend: '12:00-20:00' },
      },
      {
        code: '852GH',
        name: '青衣工業中心順豐站',
        address: '香港新界青衣長隆街青衣工業中心1期B座地下G樓B2室',
        area: '青衣',
        hours: { weekday: '09:00-20:00', weekend: '星期六 09:00-20:00 / 星期日 09:00-18:00' },
      },
    ],
  },
  // ─── 離島區 ───
  {
    district: '離島區',
    points: [
      {
        code: '852GBL',
        name: '東涌逸東商場順豐站',
        address: '香港新界離島區東涌逸東街8號逸東邨逸東商場2樓201號舖',
        area: '東涌',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════
//  合併邏輯：RAW 數據 + MANUAL_INCLUDE − MANUAL_EXCLUDE = 最終數據
//  所有下游 export 均使用合併後的 SF_COLD_PICKUP_DISTRICTS
// ═══════════════════════════════════════════════════════════════════

const _excludeSet = new Set(MANUAL_EXCLUDE_CODES.map(e => e.code));

function _applyOverrides(): SfColdDistrict[] {
  const merged: SfColdDistrict[] = SF_COLD_PICKUP_DISTRICTS_RAW.map(d => ({
    district: d.district,
    points: d.points.filter(p => !_excludeSet.has(p.code)),
  }));

  for (const mp of MANUAL_INCLUDE_POINTS) {
    if (_excludeSet.has(mp.code)) continue;
    let districtGroup = merged.find(d => d.district === mp.district);
    if (!districtGroup) {
      districtGroup = { district: mp.district, points: [] };
      merged.push(districtGroup);
    }
    if (!districtGroup.points.some(p => p.code === mp.code)) {
      const { district: _, ...pointData } = mp;
      districtGroup.points.push(pointData);
    }
  }

  return merged.filter(d => d.points.length > 0);
}

/** 最終合併後的冷運自提點數據（= RAW + MANUAL_INCLUDE − MANUAL_EXCLUDE） */
export const SF_COLD_PICKUP_DISTRICTS: SfColdDistrict[] = _applyOverrides();

/** Flat list of all cold chain pickup points (for quick lookups) */
export const ALL_SF_COLD_POINTS: SfColdPickupPoint[] = SF_COLD_PICKUP_DISTRICTS.flatMap(d => d.points);

/** Get all district names (for first dropdown) */
export const SF_COLD_DISTRICT_NAMES: string[] = SF_COLD_PICKUP_DISTRICTS.map(d => d.district);

/** Find a pickup point by code */
export const findPointByCode = (code: string): SfColdPickupPoint | undefined =>
  ALL_SF_COLD_POINTS.find(p => p.code === code);

/** Get points for a specific district */
export const getPointsByDistrict = (district: string): SfColdPickupPoint[] =>
  SF_COLD_PICKUP_DISTRICTS.find(d => d.district === district)?.points ?? [];

/** Format address for SF order: 地區 + 自提點名稱 + 點碼 */
export const formatLockerAddress = (point: SfColdPickupPoint, district: string): string =>
  `${district} ${point.name} [${point.code}]`;
