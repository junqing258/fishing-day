export interface UserInfoType {
  showName: string;
}

export interface GetAmountListItem {
  currency: string;
  balance: number;
  bettingMin: number;
  hide: number;
  imageUrl: string;
}

/* 获取账号筹码列表 */
export interface GetAmountList {
  list: GetAmountListItem[];
}

/* 初始化信息 */

export type RoomInfoType = {
  currency: string; // 币种名称
  cdTimes: number; // cd时间
  leftTimes: number; // 剩余秒数
  status: 1 | 2 | 3; // 0:等待中 1:游戏中  2:结算中 3:等待下一轮开始
  unit: number;
};

export type BetInfoType = {
  stakeType: string; // 押注类型 11:狗赢, 12:猫赢, 13:平, 21:1-9, 22:10, 23:11-19, 24:0/20
  upLimit: number; // 投币区域投注金额上限
  balance: number; // 投币区域已投注金额
  myBalance: number; // 我的 投币区域已投注金额
  odds: string; // 赔率
};

export type TableDataType = {
  betInfo: BetInfoType[];
};

export type TrendType = {
  type: 1 | 2 | 3; // 1:狗赢，2:猫赢，3:平
  num: number; // 钓鱼数据
};

export type UDataType = {
  showName: string; // 用户昵称
  balance: number; // 当前金额
  status: number; // 0 等待中 1游戏中 2结算中 3等待下一轮
  betInfo: {
    stakeType: string; // 押注类型 11狗赢 12猫赢 13平
    betBalance: number; // 投注金额
  }[];
};

export type GameDataType = {
  rInfo: RoomInfoType;
  tInfo: TableDataType;
  vieTrends: TrendType[];
  uInfo: UDataType;
};

export interface TrapInfoType {
  direction: 1 | -1;
  path: number;
  time: number;
}

export type BetItemType = { balance: number; price: number; stakeType: string };

export type OverDataType = {
  betBalance: number;
  currency: string;
  catFish: number;
  dogFish: number;
  dogFishInfo: TrapInfoType[];
  catFishInfo: TrapInfoType[];
  hashId: string;
  price: number;
  roundId: number;
  totalFish: number;
  bets: BetItemType[];
  time: number;
  overCdTimes: number;
  sequence?: string;
};

export type BetType = {
  bet: number;
  betTotal: number;
  betTotalMoney: number;
  multiple: number;
  stakeType: string;
  totalAvailable: number;
  uid: string;
};

/* 投币记录 */
export type RecordType = {
  round_id: number;
  currency: string;
  price: number;
  hashId: string;
  fishings: number;
  catFish: number;
  dogFish: number;
  bet_balance: number;
  time: number;
  bets: BetItemType[];
};

export type VerifyRecordType = {
  roundId: number;
  currency: string;
  price: number;
  hashId: string;
  fishings: number;
  catFish: number;
  dogFish: number;
  betBalance: number;
  time: number;
  bets: BetItemType[];
};

export type TrendRecordType = {
  id: number;
  round_id: string;
  cat_fish: number;
  dog_fish: number;
  type: 1 | 2 | 3; // 1:狗赢，2:猫赢，3:平
  num: number;
};
