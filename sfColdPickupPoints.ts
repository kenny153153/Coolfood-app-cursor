/**
 * 順豐冷運自提點數據 (SF Express Cold Chain Self-Pickup Points)
 * 僅包含支援冷運服務 (✔️) 的順豐站，數據來源：順豐官方
 *
 * 此檔案為本地靜態數據，不需要 API 請求，確保極速載入。
 * 按地區 (district) 分組，供二級下拉選單使用。
 *
 * ⚠️ 重要：自動腳本 (scripts/update-sf-cold-points.ts) 只會覆蓋
 *    SF_COLD_PICKUP_DISTRICTS 區塊。下方的 MANUAL_OVERRIDES 區塊
 *    不會被覆蓋，你可以安全地手動編輯。
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
  // ═══════════════════════ 香港島 ═══════════════════════
  {
    district: '南區',
    points: [
      {
        code: '852TAL',
        name: '香港仔富嘉工廈順豐站',
        address: '香港香港島南區香港仔大道234號富嘉工業大廈9樓6室',
        area: '香港仔',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852Z601',
        name: '鴨脷洲海怡西商場順豐站',
        address: '香港香港島南區鴨脷洲海怡路12A號海怡西商場209D舖',
        area: '鴨脷洲',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
    ],
  },
  {
    district: '東區',
    points: [
      {
        code: '852Z552',
        name: '小西灣藍灣廣場順豐站',
        address: '香港香港島東區柴灣小西灣道28號藍灣廣場G01舖',
        area: '小西灣',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852NPTM',
        name: '北角豐富商場順豐站',
        address: '香港香港島東區北角英皇道480號豐富商場地下8號舖',
        area: '北角',
        hours: { weekday: '10:00-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852PCL',
        name: '柴灣國貿中心順豐站',
        address: '香港香港島東區柴灣祥利街29號國貿中心5樓1室',
        area: '柴灣',
        hours: { weekday: '11:00-21:00', weekend: '星期六 12:00-20:00 / 星期日及公眾假期休息' },
      },
      {
        code: '852Z551',
        name: '天后美城花園大廈順豐站',
        address: '香港香港島東區天后永興街2A-2E號美城花園大廈地下D舖',
        area: '天后',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
    ],
  },
  // ═══════════════════════ 九龍 ═══════════════════════
  {
    district: '油尖旺區',
    points: [
      {
        code: '852BDL',
        name: '太子大南街順豐站',
        address: '香港九龍油尖旺區太子大南街24, 24A及26號地下A舖',
        area: '太子',
        hours: { weekday: '10:00-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852BFL',
        name: '大角咀中興樓順豐站',
        address: '香港九龍油尖旺區大角咀中匯街41號中興樓地下12號舖',
        area: '大角咀',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
    ],
  },
  {
    district: '九龍城區',
    points: [
      {
        code: '852KCL',
        name: '九龍城太子道西順豐站',
        address: '香港九龍九龍城區九龍城太子道西414號地下',
        area: '九龍城',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852KEL',
        name: '紅磡黃埔花園順豐站',
        address: '香港九龍九龍城區紅磡黃埔花園12期地庫9A及9B號舖',
        area: '紅磡',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852KBL',
        name: '何文田愛民邨康民樓順豐站',
        address: '香港九龍九龍城區何文田忠孝街60號愛民邨康民樓（C座）地下5號舖',
        area: '何文田',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
      {
        code: '852KDL',
        name: '土瓜灣興基豪園順豐站',
        address: '香港九龍九龍城區土瓜灣炮仗街178號興基豪園地下B舖',
        area: '土瓜灣',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852KFL',
        name: '土瓜灣樂民新邨順豐站',
        address: '香港九龍九龍城區土瓜灣樂民新邨G座平台地下126號舖（連閣樓）',
        area: '土瓜灣',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
    ],
  },
  {
    district: '黃大仙區',
    points: [
      {
        code: '852HDL',
        name: '慈雲山華麗樓順豐站',
        address: '香港九龍黃大仙區慈雲山蒲崗村道153-155號華麗樓地下2號舖',
        area: '慈雲山',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
    ],
  },
  {
    district: '觀塘區',
    points: [
      {
        code: '852ACL',
        name: '藍田匯景廣場順豐站',
        address: '香港九龍觀塘區藍田匯景道8號匯景廣場3樓4A20-22號舖',
        area: '藍田',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852CKL',
        name: '藍田廣田商場順豐站',
        address: '香港九龍觀塘區藍田碧雲道廣田邨廣田商場1樓105號舖',
        area: '藍田',
        hours: { weekday: '11:00-20:00', weekend: '12:00-20:00' },
      },
      {
        code: '852CNL',
        name: '秀茂坪安達商場順豐站',
        address: '香港九龍觀塘區秀茂坪安達邨安達商場地下低層LG21號舖',
        area: '秀茂坪',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852AJL',
        name: '油塘大本型順豐站',
        address: '香港九龍觀塘區油塘大本型2樓229號舖',
        area: '油塘',
        hours: { weekday: '10:00-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852Z151',
        name: '觀塘泓富廣場順豐站',
        address: '香港九龍觀塘區觀塘成業街6號泓富廣場7樓708室',
        area: '觀塘',
        hours: { weekday: '11:00-20:00', weekend: '星期六 12:00-20:00 / 星期日及公眾假期休息' },
      },
      {
        code: '852HGL',
        name: '牛頭角安基商場順豐站',
        address: '香港九龍觀塘區牛頭角安基苑安基商場1樓131A號舖',
        area: '牛頭角',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
    ],
  },
  {
    district: '深水埗區',
    points: [
      {
        code: '852DCL',
        name: '荔枝角泓景匯順豐站',
        address: '香港九龍深水埗區荔枝角荔枝角道863號泓景台泓景匯地下2A舖',
        area: '荔枝角',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
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
  // ═══════════════════════ 新界 ═══════════════════════
  {
    district: '西貢區',
    points: [
      {
        code: '852AAL',
        name: '將軍澳茵怡花園順豐站',
        address: '香港新界西貢區將軍澳貿泰路8號茵怡花園第1座地下6號舖',
        area: '將軍澳',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852ABL',
        name: '將軍澳寶盈花園商場順豐站',
        address: '香港新界西貢區將軍澳唐俊街11號寶盈花園商場一樓S21-S21A號舖',
        area: '將軍澳',
        hours: { weekday: '10:00-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852CUL',
        name: '坑口安寧花園順豐站',
        address: '香港新界西貢區將軍澳常寧道10號安寧花園1座地下14號舖',
        area: '坑口',
        hours: { weekday: '11:00-20:00', weekend: '12:00-20:00' },
      },
      {
        code: '852Z101',
        name: '將軍澳康城順豐站',
        address: '香港新界西貢區將軍澳康城路1號THE LOHAS康城商場3樓340舖',
        area: '康城',
        hours: { weekday: '10:00-22:00', weekend: '12:00-20:00' },
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
  {
    district: '沙田區',
    points: [
      {
        code: '852FUL',
        name: '馬鞍山WeGoMall順豐站',
        address: '香港新界沙田區馬鞍山保泰街16號WeGoMall地下G09舖',
        area: '馬鞍山',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
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
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
      {
        code: '852NJL',
        name: '沙田瀝源邨華豐樓順豐站',
        address: '香港新界沙田區沙田瀝源街6號瀝源邨華豐樓地下ST5號舖',
        area: '沙田',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
    ],
  },
  {
    district: '大埔區',
    points: [
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
        address: '香港新界大埔區大埔富善商場1樓F122B舖',
        area: '大埔',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
      {
        code: '852NHL',
        name: '大埔太和中心順豐站',
        address: '香港新界大埔區大埔太和路15號太和中心地下30號舖',
        area: '大埔',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
    ],
  },
  {
    district: '屯門區',
    points: [
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
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
    ],
  },
  {
    district: '元朗區',
    points: [
      {
        code: '852FGL',
        name: '元朗大福大廈順豐站',
        address: '香港新界元朗區元朗建德街57號大福大廈地下7號舖',
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
        code: '852UBL',
        name: '洪水橋德祥樓順豐站',
        address: '香港新界元朗區元朗洪水橋大街1號德祥樓地下20及21號舖',
        area: '洪水橋',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
      {
        code: '852UFL',
        name: '元朗好順利大廈順豐站',
        address: '香港新界元朗區元朗鳯攸南街9號好順利大廈地下79號舖',
        area: '元朗',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
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
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
      {
        code: '852UCL',
        name: '天水圍天澤商場順豐站',
        address: '香港新界元朗區天水圍天瑞路71-77號天澤商場3樓310舖',
        area: '天水圍',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
    ],
  },
  {
    district: '北區',
    points: [
      {
        code: '852Z011',
        name: '粉嶺花都廣場順豐站',
        address: '香港新界北區粉嶺百和路88號花都廣場廣都地下103舖',
        area: '粉嶺',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
      {
        code: '852Z010',
        name: '粉嶺皇后山邨順豐站',
        address: '香港新界北區粉嶺皇后山商場地下7號舖',
        area: '粉嶺',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
      {
        code: '852FTL',
        name: '上水彩園邨彩珠樓順豐站',
        address: '香港新界北區上水彩園路彩園邨彩珠樓地下117號舖',
        area: '上水',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
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
  {
    district: '荃灣區',
    points: [
      {
        code: '852GDL',
        name: '荃灣南豐中心順豐站',
        address: '香港新界荃灣區荃灣西樓角路64-98號及荃灣青山公路264-298號南豐中心638-639室',
        area: '荃灣',
        hours: { weekday: '11:00-22:00', weekend: '12:00-20:00' },
      },
    ],
  },
  {
    district: '葵青區',
    points: [
      {
        code: '852LBL',
        name: '葵涌大隴街葵都大廈順豐站',
        address: '香港新界葵青區葵涌大隴街129-151號葵都大廈地下7號舖',
        area: '葵涌',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
      },
      {
        code: '852DEL',
        name: '荔景邨明景樓順豐站',
        address: '香港新界葵青區荔景荔景邨明景樓地下4號舖',
        area: '荔景',
        hours: { weekday: '11:00-20:00', weekend: '12:00-20:00' },
      },
    ],
  },
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
      {
        code: '852Z353',
        name: '馬灣順豐站',
        address: '香港新界大嶼山區馬灣田寮新村65號地下',
        area: '馬灣',
        hours: { weekday: '11:00-21:00', weekend: '12:00-20:00' },
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
  // Step 1: 從 RAW 數據中移除被排除的網點
  const merged: SfColdDistrict[] = SF_COLD_PICKUP_DISTRICTS_RAW.map(d => ({
    district: d.district,
    points: d.points.filter(p => !_excludeSet.has(p.code)),
  }));

  // Step 2: 追加手動新增的網點（不重複）
  for (const mp of MANUAL_INCLUDE_POINTS) {
    if (_excludeSet.has(mp.code)) continue; // 排除名單優先
    let districtGroup = merged.find(d => d.district === mp.district);
    if (!districtGroup) {
      districtGroup = { district: mp.district, points: [] };
      merged.push(districtGroup);
    }
    // 避免重複
    if (!districtGroup.points.some(p => p.code === mp.code)) {
      const { district: _, ...pointData } = mp;
      districtGroup.points.push(pointData);
    }
  }

  // 移除空地區
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
