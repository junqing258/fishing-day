# Api

## 获取游客ID

**请求**

```
{
	jwt: 1001,
	cmd: 'getRequestId'
}
```

**响应**

```
{
	uid: userId,
    email: '***@qq.com',
    showName: 'GUEST'
}
```

## 获取账号筹码列表

**请求**

```javascript
{
    jwt: 10001,
    cmd: 'getAmountList'
}
```

**响应**

```javascript
{
	"cmd": "getAmountList",
	"code": 200,
	"data": {
		"list": [{
			"currency": "BUSDT",
			"balance": 9980.98,
			"imageUrl": "https://static.btgame.club/public-test/img/coin/15905806762152UL8JD1F.png"
		}, {
			"currency": "BTC",
			"balance": 0,
			"imageUrl": "https://static.btgame.club/public-test/img/coin/15905821579162UL8JD1G.png"
		}, {
			"currency": "ETH",
			"balance": 0,
			"imageUrl": "https://static.btgame.club/public-test/img/coin/15905806939742UL8JD1H.png"
		}, {
			"currency": "USDT",
			"balance": 0,
			"imageUrl": "https://static.btgame.club/public-test/img/coin/15905807050632UL8JD1J.png"
		}, {
			"currency": "EOS",
			"balance": 0,
			"imageUrl": "https://static.btgame.club/public-test/img/coin/15905806992912UL8JD1I.png"
		}, {
			"currency": "BCH",
			"balance": 0,
			"imageUrl": "https://static.btgame.club/public-test/img/coin/15905807097032UL8JD1K.png"
		}, {
			"currency": "ETC",
			"balance": 0,
			"imageUrl": "https://static.btgame.club/public-test/img/coin/15905807161882UL8JD1L.png"
		}, {
			"currency": "LTC",
			"balance": 0,
			"imageUrl": "https://static.btgame.club/public-test/img/coin/15905807197322UL8JD1M.png"
		}, {
			"currency": "XRP",
			"balance": 0,
			"imageUrl": "https://static.btgame.club/public-test/img/coin/15905821629902UL8JD1H.png"
		}, {
			"currency": "BSV",
			"balance": 0,
			"imageUrl": "https://static.btgame.club/public-test/img/coin/15910643337122UL8JDF5.png"
		}, {
			"currency": "DOGE",
			"balance": 0,
			"imageUrl": "https://static.btgame.club/public-test/img/coin/1596002481450SHWDDR1003.png"
		}, {
			"currency": "DASH",
			"balance": 0,
			"imageUrl": "https://static.btgame.club/public-test/img/coin/15910643337122UL8JDF5.png"
		}, {
			"currency": "TRX",
			"balance": 0,
			"imageUrl": "https://static.btgame.club/public-test/img/coin/1596002484423SHWDDR1004.png"
		}]
	}
}
```

## 复盘

**请求**

``` javascript
{
    jwt: 10001,
    cmd: "replay"
}
```

**响应**

``` javascript
{
    cmd:"replay",
    code:200,
    data:{
        rInfo:{
            currency:'USDT', // 币种名称
            cdTimes:20,      // cd时间
            leftTimes:10,    // 剩余秒数
            status: 0,       // 0:等待中 1:游戏中  2:结算中 3:等待下一轮开始
            unit:1,          // 最小投币单位
        },
        tInfo:{
            betInfo:[
                {
                    stakeType:1,   // 押注类型 11:狗赢, 12:猫赢, 13:平, 21:1-9, 22:10, 23:11-19, 24:0/20
                    upLimit: 5000, // 投币区域投注金额上限
                    balance: 1000  // 投币区域已投注金额
                    odds: "1:2"    // 赔率
                },
                {
                    stakeType:2,   // 押注类型 11:狗赢, 12:猫赢, 13:平, 21:1-9, 22:10, 23:11-19, 24:0/20
                    upLimit: 5000,  // 投币区域投注金额上限
                    balance: 1000   // 投币区域已投注金额
                    odds: "1:2"     // 赔率
                }, 
                {
                    stakeType:3,   // 押注类型 11:狗赢, 12:猫赢, 13:平, 21:1-9, 22:10, 23:11-19, 24:0/20
                    upLimit: 5000,  // 投币区域投注金额上限
                    balance: 1000   // 投币区域已投注金额
                    odds: "1:2"     // 赔率
                }
            ]
        },
        // 走势
        vieTrends:[
            {
                type: 1, // 1:狗赢，2:猫赢，3:平
                num: 13, // 钓鱼数据
            },
            {
                type: 2, // 1:狗赢，2:猫赢，3:平
                num: 13, // 钓鱼数据
            }
        ],
        uInfo:{
            showName:"1019***@qq.com", // 用户昵称
            balance:12.45555,  // 当前金额
            status:0,   // 0 等待中 1游戏中 2结算中 3等待下一轮
            betInfo:[
                {
                    stakeType:1,// 押注类型 11狗赢 12猫赢 13平
                    betBalance: 100, // 投注金额
                },
                {
                    stakeType:1,// 押注类型 11狗赢 12猫赢 13平
                    betBalance: 150, // 投注金额
                }, 
                {
                    stakeType:1,// 押注类型 11狗赢 12猫赢 13平
                    betBalance: 250 // 投注金额
                } 
            ]
        }
    }
}
```

## 游戏开始

> 收到该命令，客户端需要做页面重绘操作~

```
{
	"cmd": "gameStart",
	"code": 200,
	"data": {
		"msg": "比赛开始"
	}
}
```

## 押注

**请求**

``` javascript
{
    jwt: 10001,
    cmd:"bet",
    stakeType:11,  // 押注类型 11:狗赢, 12:猫赢, 13:平, 21:1-9, 22:10, 23:11-19, 24:0/20
    multiple:50   // 投币倍数 
}
```

**响应**

``` javascript
{
    "cmd":"bet",
    "code":200,
    "data":{
        multiple:50,          // 投币倍数
        type:11,              // 押注类型 11狗赢 12猫赢 13平
     }
}
```

## 模拟投币

> 投币开始后，随机用1倍和10倍的筹码，向每个投币区域内进行投币，当投币的金额达到或超过该投币区域上限的20%时，停止投币
>
> 模拟投币的金额只用作前台展示，不参与实际结算

```
{
	"cmd": "updateBet",
	"code": 200,
	"data": {
		stakeType:11,  // 押注类型 11:狗赢, 12:猫赢, 13:平, 21:1-9, 22:10, 23:11-19, 24:0/20
        betBalance:50  // 押注金额
	}
}
```

## 押注结束

> 客户端收到该命令后，禁止任何操作。服务端即将进入结算


**响应**

```
{
	"cmd": "betOver",
	"code": 200,
	"data": {
		"msg": "停止投币"
	}
}
```

## 游戏结算

**响应**

```
{
	"cmd": "gameOver",
	"code": 200,
	"data": {
		roundId: 1, // 局次
		price: 100, // 中奖
		fishings: 12, // 钓鱼总数
		betBalance: 60, // 总投币数
		bets:[
			{
				stakeType:11,  // 押注类型 11:狗赢, 12:猫赢, 13:平, 21:1-9, 22:10, 23:11-19, 24:0/20
				balance:10,    // 押注金额
				price:0        // 中奖金额
			}
		],
		dateTime:"2020-12-12 12:12:12"
	}
}
```

## 查看 HashID 记录

**请求**

```
{
	jwt: 1001,
	cmd: 'hashRecord',
	hashId: 'e80674278ed6ff466ebcf27622e0d2b7dcbdeeeca9e27e58d625db5d399bf381'
}
```

**响应**

```
{
	"cmd": "hashRecord",
	"code": 200,
	"data": {
		roundId: 1,
		price: 100,
		fishings: 12,
		betBalance: 60,
		bets:[
			{
				stakeType:11,  // 押注类型 11:狗赢, 12:猫赢, 13:平, 21:1-9, 22:10, 23:11-19, 24:0/20
				balance:10,    // 押注金额
				price:0        // 中奖金额
			}
		]
	}
}
```

## 投币记录

**请求**

```
{
    jwt: 1001,
    cmd: "recordList"
    page: 1
}
```

**响应**

```
{
	"cmd": "recordList",
	"code": 200,
	"data": {
		[
			{
				roundId: 1,
                price: 100,
                fishings: 12,
                betBalance: 60,
                bets:[
                    {
                        stakeType:11,  // 押注类型 11:狗赢, 12:猫赢, 13:平, 21:1-9, 22:10, 23:11-19, 24:0/20
                        balance:10,    // 押注金额
                        price:0        // 中奖金额
                    }
                ]
			}
		]
	}
}
```

