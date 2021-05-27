import { GetAmountList, GameDataType, GetAmountListItem, RecordType, VerifyRecordType, TrendRecordType } from './model';
import { AppResponseType, fetchCmd, OK_CODE, sendCmd } from './util/socket';

/* 获取游客ID */
export function getGuest(param: any): Promise<AppResponseType<any>> {
  return fetchCmd('getGuestId', param);
}

/** 币种列表 */
// GetAmountListItem
type GetAmountType = { [currency: string]: GetAmountListItem };

let isAmountFirst = true;

export function getAmountList(): Promise<AppResponseType<GetAmountList>> {
  return fetchCmd('getAmountList', null, { tips: !isAmountFirst }).then((rep: AppResponseType<GetAmountType>) => {
    isAmountFirst = false;
    const list = Object.values(rep.data) as GetAmountListItem[];
    return {
      ...rep,
      data: { list },
    };
  });
}

/* 初始化-复盘 */
let isnInitFirst = true;
export function getInitialize(): Promise<AppResponseType<GameDataType>> {
  return fetchCmd('replay', null, { tips: !isnInitFirst }).then((rep: AppResponseType<GameDataType>) => {
    isnInitFirst = false;
    if (rep.code === OK_CODE) {
      rep.data.tInfo.betInfo = rep.data.tInfo.betInfo.map((v) => {
        // const myBet = rep.data.uInfo?.betInfo?.find((m) => String(m.stakeType) === String(v.stakeType));
        return {
          ...v,
          // myBalance: myBet?.betBalance || 0,
        };
      });
    }
    return rep;
  });
}

/* 投币 */
export function putBet(stakeType: string, multiple: number): void {
  sendCmd('bet', { stakeType: Number(stakeType), multiple });
}

/* 切换币种 - 房间 */
export function putChangeCurrency(currency: string): void {
  sendCmd('getChangeCurrency', { currency });
}

/* 查看 HashID 记录 */
export function getHashRecord(hashId: string): Promise<AppResponseType<VerifyRecordType>> {
  return fetchCmd('hashRecord', { hashId });
}

/* 投币记录 */
export function getRecordList(currency: string): Promise<AppResponseType<RecordType[]>> {
  return fetchCmd('recordList', { currency });
}

/* 趋势记录 */
export function getTrendList(currency: string): Promise<AppResponseType<TrendRecordType[]>> {
  return fetchCmd('getTrendList', { currency });
}
