import { gameStore } from '@/models/game';
import { isNil } from '@/utils/snippets';
import { createColorFilter, ellipsis, formatCurrency, querySelector } from '@/utils/util';
import { autorun, IReactionDisposer } from 'mobx';

export default class UserInfo extends Laya.Sprite {
  private reactions: IReactionDisposer[] = [];

  onAwake(): void {
    const avatar = querySelector(this, 'avatar') as Laya.Image;
    const btnCurrency = querySelector(this, 'btnCurrency') as Laya.Button;
    const btnRecharge = querySelector(this, 'btnRecharge') as Laya.Button;
    const balanceLabel = querySelector(this, 'balance') as Laya.Label;
    const currencyLabel = querySelector(this, 'currency') as Laya.Label;
    const currencyIcon = querySelector(this, 'currencyIcon') as Laya.Image;
    const nameLabel = querySelector(this, 'userName') as Laya.Label;
    currencyIcon.filters = [createColorFilter('#fdde9b')];

    avatar.skin = Math.random() < 0.5 ? 'panel/avart_dog.png' : 'panel/avart_cat.png';

    btnRecharge.on('click', this, () => {
      if (gameStore.userType !== 'user') {
        window.paladin?.account.login();
      } else {
        window.paladin?.pay.recharge({
          data: {
            currency: gameStore.gameData.rInfo.currency,
            gameNo: paladin.sys.config.gameId,
            isHorizontal: false, // 横屏游戏需要传递该参数，竖屏游戏可以不传递或者传递false
          },
        });
      }
    });

    this.reactions = [
      autorun(() => {
        btnCurrency.gray = !gameStore.switchCurrency;
      }),
      autorun(() => {
        const currencyInfo = gameStore.amountList?.find((v) => v.currency === gameStore.gameData.rInfo?.currency);
        btnRecharge.visible = gameStore.userType !== 'user' || (currencyInfo && !currencyInfo.hide);
        currencyLabel.text = gameStore.gameData?.rInfo.currency || '';
        if (isNil(currencyInfo)) return;
        balanceLabel.text = formatCurrency(Number(currencyInfo.balance), 10);
        currencyIcon.skin = currencyInfo.imageUrl;
      }),
      autorun(() => {
        const { uInfo } = gameStore.gameData;
        let showName = uInfo?.showName || window.paladin?.sys.config.showName || 'Guest';
        const c = showName.split('@');
        if (c[1] && c[1].length > 6) {
          c[1] = c[1].slice(0, 6) + '...';
          showName = c.join('@');
        } else if (showName.length > 20) {
          showName = ellipsis(showName, 17);
        }
        nameLabel.text = showName;
        // ellipsis(uInfo?.showName || window.paladin?.sys.config.showName || 'Guest', 14);
      }),
    ];
  }

  onDestroy(): void {
    this.reactions.forEach((v) => v());
    this.reactions = [];
  }
}
