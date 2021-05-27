import { getAmountList, getInitialize } from '@/services/game';
import {
  BetType,
  GameDataType,
  GetAmountListItem,
  OverDataType,
  TableDataType,
  TrendType,
  UDataType,
} from '@/services/model';
import { AppResponseType, OK_CODE, onCmd } from '@/services/util/socket';
import { isEmpty, isNil } from '@/utils/snippets';
import { observable, action } from 'mobx';
import { checkMyself } from '@/common/Helper';
import { getLogger } from '@/utils/getLogger';
import md5 from 'blueimp-md5';
import PrizeCoins from '@/modules/panels/PrizeCoins';

export type StatusType = 'waiting' | 'start' | 'betting' | 'betOver' | 'fishing' | 'fishing_cd' | 'ended';

const logger = getLogger('store');

type StoreType = {
  guideStep?: number;
  switchCurrency: boolean;
  status: StatusType;
  amountList: GetAmountListItem[];
  gameData: GameDataType;
  overData: OverDataType | null;
  userType: string;
  counter: {
    dog: number;
    cat: number;
  };
};

const initialGameData = {
  rInfo: {},
  tInfo: {},
  vieTrends: [],
  uInfo: {},
} as GameDataType;

/* state */
export const gameStore = observable<StoreType>({
  guideStep: null,
  switchCurrency: true,
  amountList: [],
  status: undefined,
  gameData: initialGameData,
  counter: {
    dog: 0,
    cat: 0,
  },
  overData: {} as OverDataType,
  userType: 'guess',
});

//  type ActionsType = { [cmd: string]: () => void };
type ActionsType = {
  reset: () => void;
  updateGuide: (v: number) => void;
  updateAmountList: (v?: GetAmountListItem[]) => void;
  updateStatus: (v: StatusType) => void;
  updateGameData: (v: GameDataType, replay: boolean) => void;
  updateTableData: (v: TableDataType) => void;
  updateTrends: (v: TrendType[]) => void;
  updateUData: (v: UDataType) => void;
  updateOverData: (v: OverDataType) => void;
  updateCounter: (v: { dog: number; cat: number }) => void;
  updateCurrencySwitch: (v: boolean) => void;
  updateCurrency: (v: string) => void;
  updateUserType: (v: string) => void;
};

let resetting = false;

export const actions: ActionsType = {
  reset: action(() => {
    if (resetting) return;
    resetting = true;
    setTimeout(() => (resetting = false), 500);
    getInitialize().then((rep) => {
      if (rep.code === OK_CODE) {
        const uid = window.paladin?.sys.config.uid || '';
        const gameId = window.paladin?.sys.config.gameId || '';
        const newUser = !localStorage.getItem(`__user_guide__${gameId}_${uid}`);
        const status =
          newUser || String(rep.data.rInfo.status) === '1'
            ? 'waiting'
            : String(rep.data.rInfo.status) === '2'
            ? 'betting'
            : 'waiting';
        logger.log('[Initialize]', status);
        gameStore.status = status;
        gameStore.gameData = { ...rep.data };
        gameStore.guideStep = newUser ? 1 : -1;
      }
    });
  }),
  updateUserType: action((val) => {
    gameStore.userType = val;
  }),
  updateGuide: action((val) => {
    gameStore.guideStep = val;
  }),
  updateAmountList: action((val) => {
    if (!isEmpty(val)) {
      gameStore.amountList = val;
    } else {
      getAmountList().then((rep) => {
        if (rep.code === OK_CODE) {
          gameStore.amountList = rep.data.list;
        }
      });
    }
  }),
  updateCurrencySwitch: action((val) => {
    gameStore.switchCurrency = val;
  }),
  updateCurrency: action((val) => {
    gameStore.gameData.rInfo.currency = val;
  }),
  updateStatus: action((val) => {
    logger.debug('[status]', val);
    gameStore.status = val;
  }),
  updateGameData: action((val) => {
    gameStore.gameData = val;
  }),
  updateCounter: action((val) => {
    gameStore.counter = val;
  }),
  updateUData: action((val) => {
    gameStore.gameData.uInfo = val;
  }),
  updateTableData: action((val) => {
    gameStore.gameData.tInfo = val;
  }),
  updateOverData: action((val) => {
    gameStore.overData = val;
  }),
  updateTrends: action((val) => {
    gameStore.gameData.vieTrends = val;
  }),
};

/* effects */
type EffectsType = {
  disposers: (() => void)[];
  running: boolean;
  setup: () => void;
  dispose: () => void;
};

export const effects: EffectsType = {
  disposers: [],
  running: false,
  setup: () => {
    if (effects.running) return;
    effects.running = true;
    effects.disposers = [
      onCmd('getChangeCurrency', (rep: AppResponseType<any>) => {
        actions.updateOverData({} as OverDataType);
        actions.updateCurrency(rep.data.currency);
      }),
      onCmd('gameStart', () => {
        actions.updateStatus('start');
        setTimeout(() => {
          const { gameData } = gameStore;
          const newBetInfo = gameData.tInfo.betInfo.map((v) => ({ ...v, balance: 0, myBalance: 0 }));
          const tInfo = { ...gameData.tInfo, betInfo: newBetInfo };
          actions.updateGameData({ ...gameData, tInfo }, false);
        });
      }),
      onCmd('betOver', () => {
        if (gameStore.status === 'betting') actions.updateStatus('betOver');
      }),
      onCmd('gameOver', (rep: AppResponseType<OverDataType>) => {
        const overData = rep.data;
        if (rep.code === OK_CODE) {
          const sequence = md5(JSON.stringify(overData));
          overData.sequence = sequence;
          actions.updateOverData(overData);
        }
        actions.updateStatus('fishing');
      }),
      onCmd('bet', (rep: AppResponseType<BetType>) => {
        if (!isNil(rep.data) && !isEmpty(gameStore.gameData?.tInfo)) {
          // TODO: bet rename to balance
          const { betTotal, betTotalMoney, stakeType, uid } = rep.data;
          const isMy = checkMyself(uid);
          if (isMy) {
            PrizeCoins.getInstance().playMyBet(rep.data as any);
          } else {
            PrizeCoins.getInstance().playAutoBet(rep.data as any);
          }
          const betInfo = gameStore.gameData.tInfo.betInfo;
          const newBetInfo = betInfo.map((b) => {
            if (String(b.stakeType) !== String(stakeType)) return b;
            return {
              ...b,
              balance: Number(betTotal || 0),
              myBalance: isMy ? Number(betTotalMoney || 0) : b.myBalance,
            };
          });

          actions.updateTableData({ betInfo: newBetInfo });

          if (isMy) {
            const currency = gameStore.gameData.rInfo.currency;
            const amountList = gameStore.amountList.map((v) => ({
              ...v,
              balance: v.currency === currency ? rep.data.totalAvailable : v.balance,
            }));
            actions.updateAmountList(amountList);

            if (gameStore.switchCurrency) {
              actions.updateCurrencySwitch(false);
            }
          }
        }
      }),
      onCmd('autoBet', (rep: AppResponseType<any>) => {
        if (gameStore.status !== 'betting') return;
        if (!isNil(rep.data) && !isEmpty(gameStore.gameData?.tInfo)) {
          const { stakeType, betTotal } = rep.data;
          PrizeCoins.getInstance().playAutoBet(rep.data);
          const betInfo = gameStore.gameData.tInfo.betInfo || [];
          const newBetInfo = betInfo.map((b) => {
            if (String(b.stakeType) !== String(stakeType)) return b;
            return {
              ...b,
              balance: Number(betTotal || 0),
            };
          });
          actions.updateTableData({
            betInfo: newBetInfo,
          });
        }
      }),
    ];
  },
  dispose: () => {
    if (!effects.running) return;
    logger.debug('effect dispose');
    effects.disposers.forEach((v) => v());
    effects.running = false;
  },
};

window.__gameStore = gameStore;
