import { actions } from '@/models/game';
import { getGuest } from '@/services/game';
import { setParams } from '@/services/util/socket';
import dayjs from 'dayjs';
import { i18n } from './i18n';
import Toast from './Toast';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const loadGuestToken = async () => {
  return getGuest({ currency: 'BUSDT' })
    .then((rep) => {
      const jwt = rep.data?.jwt;
      setParams({ jwt });
      actions.updateUserType('guest');
      if (jwt) {
        try {
          localStorage.setItem('guest_access_token', jwt);
        } catch (error) {
          console.error(error);
        }
      }
    })
    .catch((e) => {
      console.error(e);
      Toast.getInstance().showMsg(i18n('error_1'));
    });
};

export const StakeTypesConf = [
  ['12', '13', '11'],
  ['21', '22', '23', '24'],
];

// 押注类型 11:狗赢, 12:猫赢, 13:平, 21:1-9, 22:10, 23:11-19, 24:0/20
export const getStakeNames = () => ({
  '11': i18n('dog_win'),
  '12': i18n('cat_win'),
  '13': i18n('draw'),
  '21': '1-9',
  '22': '10',
  '23': '11-19',
  '24': '0/20',
});

export const getStakeColors = () => ({
  '11': '#ffaa72',
  '12': '#d5bcff',
  '13': '#ffdf08',
});

export const checkMyself = (uid: string) => {
  return uid && window.paladin?.sys.config.uid === uid;
};

const matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi;
const chunkOffset = /([\+\-]|\d\d)/gi;

function offsetFromString(matcher, string) {
  const matches = (string || '').match(matcher);
  if (matches === null) {
    return null;
  }
  const chunk = matches[matches.length - 1] || [];
  const parts: any[] = (chunk + '').match(chunkOffset) || ['-', 0, 0];
  const minutes = +(parseInt(parts[1]) * 60) + parseInt(parts[2]);
  return minutes === 0 ? 0 : parts[0] === '+' ? minutes : -minutes;
}

export const formatTime = (createTime: number, fmt = 'MM/DD HH:mm:ss') => {
  const utc = (window.paladin && paladin.sys.config.utc) || '+08:00';
  const offset = offsetFromString(matchShortOffset, utc);
  return dayjs
    .utc(createTime * 1000)
    .utcOffset(offset)
    .format(fmt);
};
