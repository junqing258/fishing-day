
/**
 * @version 1.1.11
 * 
 * @description
 * Paladin SDK的主要命名空间，引擎代码中所有的类，函数，属性和常量都在这个命名空间中定义。
 * 游戏可以直接使用和管理获取配置，登录、登出、支付、数据统计等功能。
 * 
 * @example
 * 1.引入JS文件
   在需要使用SDK的项目引入paladin.min.js文件。<script src="paladin.min.js"></script>

   2.游戏初始化
   首先通过SDK获取游戏配置信息，加载必需的脚本，然后加载游戏引擎启动方法。
    paladin.init({
        files: ['src/settings.js', 'main.js'],
        loadType: 2,
        success: function(res) {
            loadEngine(res.cdn);
        }
    });

    3.使用组件
    先检测组件是否存在，然后调用组件方法，推荐该方法
    list 需要检测的组件列表 ['launch', 'toolbar']
    success 以键值对的形式返回，可用的组件可用为true，不可用为false { 'launch': true, 'toolbar': false } 
    paladin.checkComponents({
        list: ['launch'],
        success: function(res) {
            if (res.launch) {
            paladin.comps.launch.show({
                design: { width: 1334, height: 750, mode: 'horizontal' },
                logo: { url: 'splash.ff3cc.png' },
                load: { color: '#6d8ac8' },
                tips: { color: '#6d8ac8' },
                notice: { color: '#6d8ac8' },
                maintain: {
                  color: '#6d8ac8',
                  strokeColor: '#fff',
                  url: 'maintain.jpg'
                }
            });
            }
        }
    });
 *
 * 获取组件，如果没有对应组件，则返回null
    const comp = paladin.getComponent(name);
    !!comp && comp.xxx();
 *
 * 直接调用组件
    const comp = paladin.comps[name];
    const comp = paladin.comps.xxx;
 *
 * 检测组件是否存在
    if (paladin.hasComponent(name)) {
        todo();
    }
 *
 * 批量初始化组件
    paladin.loadComponents([{
        name,
        params 
    }]);
 * 获取初始语言
    paladin.getLang();
 *
 * 获取初始语言
    paladin.getLang();
 *
 * 获取初始渠道
    paladin.getChannel();
 *
 * 获取平台类型
    paladin.getPlatform();
 *
 */
declare namespace paladin {
    // 版本号
    export const version: string;

    /**
     * 发送请求数据
     * @param {string} url 请求地址
     * @param {string} method 请求方式 GET | POST
     * @param {object} data 数据
     * @param {function} success 成功回调
     * @param {function} fail 失败回调
     * @param {function} complete 完成回调
     * @param {function} resolve Promise resolve
     * @param {function} reject Promise reject
     */
    interface IRequestData {
        url: string;
        method: string;
        data: any;
        success: Function;
        fail?: Function;
        complete?: Function;
        resolve?: Function;
        reject?: Function;
    }

    // http 请求
    export class Request {
        /**
         * 发送请求
         * @param {object} data 发送请求数据
         */
        send(data: IRequestData): void;
        // 中断请求
        abort(): void;
    }

    /**
     * cookie
     * @function get 获取cookie
     * @function set 设置cookie
     * @function remove 删除cookie
     */
    interface ICookie {
        get: (key: string) => string;
        set: (key: string, value: string, expires: number) => void;
        remove: (key: string) => void;
    }

    // 工具 - Cookie
    export const cookie: ICookie;

    /**
     * 常用工具
     * @function uuid 生成uuid
     * @function formatData 截取字符串，支持中文
     * @function formatData 截取字符串，支持中文
     * @function formatSensitiveData 截取字符串，支持中文
     * @function getQueryParams 在url查询部分中，通过key获取value
     * @function convertTimezone 通过时间戳进行时区转换
     * @function getTimezoneOffset 获取UTC时间差
     */
    interface ITools {
        uuid: Function;
        formatData: (str: string, len: number, correction: number) => string;
        formatSensitiveData: (str: string, len: number) => string;
        getQueryParams: (key: string) => string;
        convertTimezone: (value: string | number, source: string, target: string) => number;
        getTimezoneOffset: (utc: string) => number;

        /**
         * 格式化金额显示
         * 最高支持显示12位（不含小数点符号）, 优先保证显示12位整数位
         * 显示的精度为小数点后6位（截取显示）
         * 整数位不足12位时, 依次显示小数点后的小数位
         * 整数位大于12位, 从个位数向前显示能显示的12位最大值, 如123456789012345共15位, 显示为999999999999
         * 当显示出来的小数位最后一位是0时, 该0不做显示
         * 当显示出来的没有小数位时, 小数点不做显示
         * @param {number} amount 金额
         * @param {number} integer 整数 默认12位
         * @param {number} decimal 小数 默认6位
         * @return {number} result
         */
        formatAmount(amount: number, maxInteger: number = 12, maxDecimal: number = 6): number;
    }

    // 工具 - 常用工具
    export const tools: ITools;

    // 模块 - 系统管理
    export const sys: SystemManager;
    // 模块 - 账户管理
    export const account: AccountManager;
    // 模块 - 支付管理
    export const pay: PayManager;
    // 模块 - 加载管理
    export const loader: LoaderManager;
    // 模块 - 渠道管理
    export const channel: ChannelManager;
    // 模块 - 统计管理
    export const analytics: AnalyticsManager;

    /**
     * 检测组件数据
     * @param {array} list 组件名称列表
     * @param {function} success 成功回调
     */
    interface ICheckComponentsData {
        list: string[];
        success: (res: { [compName: string]: boolean }) => void;
    }

    /** 
     * 检测组件是否存在
     * @param {object} data 检测组件数据
     */
    export function checkComponents(data: ICheckComponentsData): void;

    /**
     * 加载组件数据
     * @param {string} name 组件名称
     * @param {array} params 组件参数
     */
    interface ILoadComponentsData {
        name: string;
        params: any;
    }

    /** 
     * 批量加载组件
     * @param {array} data 组件列表配置
     */
    export function loadComponents(data: Array<ILoadComponentsData>): void;

    /** 
     * 获取组件
     * @param {string} name 组件名称
     * @return {object} comp 组件
     */
    export function getComponent(name: string): any;

    /** 
     * 检测组件是否存在
     * @param {string} name 组件名称
     * @return {boolean} result
     */
    export function hasComponent(name: string): boolean;

    /** 
     * 获取初始语言
     * @return {string} lang
     */
    export function getLang(): string;

    /** 
     * 获取初始语言
     * @return {string} lang
     */
    export function getLang(): string;

    /**
     * 获取初始渠道
     * @return {string} channel
     */
    export function getChannel(): string;

    /**
     * 获取平台类型
     * @return {string} platform
     */
    export function getPlatform(): string;

    /*
     * 组件
     * @param {object} launch 启动
     */
    interface IComps {
        launch: Launch
    }

    export const comps: IComps;
}

/**
 * 模块 - 系统管理
 * @description
 * 游戏引擎加载之前, 通过paladin.sys.init获取配置信息
 * 根据得到的配置信息, 加载游戏引擎, 初始化游戏配置
 * 
 * @example
 * 初始化获取语言，渠道，配置和终端信息
   paladin.sys.init({
        url,
        origin,
        data
        success: () => {
            loadEngine();
        }
    });
 * 
 * 初始化后，可获取配置信息 paladin.sys.config;
 * 
 * 初始化后，可获取终端环境 paladin.sys.browser;
 *
 * 获取终端环境 paladin.sys.getBrowser();
 * 
 * 获取语言环境 paladin.sys.getLanguage();
 * 
 * 获取渠道信息 paladin.sys.getChannel();
 * 
 * 获取时区信息 paladin.sys.getTimezone()  
 * 
 * 获取配置信息
 * 如果定义url，则使用url请求接口
 * 如果定义origin，则使用origin + '/platform/game/domains' 请求接口
 * 如果两者都未定义，则使用默认地址请求接口，默认地址 = location.origin + '/platform/game/domains'
 * 优先级 url > origin > default
    paladin.sys.getConfig({
        url,
        origin,
        data
        success
    });
 * 
 * 更新语言环境 paladin.sys.updateLanguage('en');
 */
declare namespace paladin {
    /**
     * 初始化数据
     * @param {string} url 请求地址
     * @param {string} origin 请求域名
     * @param {object} data 请求数据
     * @param {function} success 成功回调
     * @param {function} error 失败回调
     * 
     * @default url: ''
     * @default origin: ''
     * @default data: {}
     */
    interface ISystemInitData {
        url?: string;
        origin?: string;
        data: any;
        success: Function;
        error?: Function;
    }

    /**
     * 配置信息数据
     * @param {string} lang 语言
     * @param {string} channel 渠道
     * @param {string} cdn cdn地址
     * @param {string} host 平台地址
     * @param {string} ws websocket地址
     * @param {string} api api地址
     * @param {string} login 登录地址
     * @param {string} logout 登出地址
     * @param {string} charge 充值地址
     * @param {string} withdraw 提现地址
     * @param {string} accessToken 用于兑换websocket token
     * @param {string} refreshToken 用于兑换websocket token
     * @param {string} jwtToken 用于websocket token
     * @param {string} clientId 客户端ID
     * @param {string} gameId 游戏ID
     * @param {string} uid 用户ID
     * @param {string} storeId 渠道ID备用
     * @param {boolean} isLogin 是否登录
     * @param {number} timestamp 时间戳
     * @param {string} utc 时区
     * @param {string} showName 昵称
     */
    interface ISystemConfigData {
        lang: string;
        channel: string;
        cdn: string;
        host: string;
        ws: string;
        api: string;
        login: string;
        logout: string;
        charge: string;
        withdraw: string;
        accessToken: string;
        refreshToken: string;
        jwtToken: string;
        clientId: string;
        gameId: string;
        uid: string;
        storeId: string;
        isLogin: boolean;
        timestamp: number;
        utc: string;
        showName: string;
    }

    /**
     * 终端环境数据
     * @param {boolean} trident IE内核
     * @param {boolean} presto opera内核
     * @param {boolean} webKit 苹果、谷歌内核
     * @param {boolean} gecko 火狐内核
     * @param {boolean} mobile 是否为移动终端
     * @param {boolean} ios ios终端
     * @param {boolean} android android终端
     * @param {boolean} iPhone 是否为iPhone或者QQHD浏览器
     * @param {boolean} iPad 是否iPad
     * @param {boolean} webApp 是否web应该程序，没有头部与底部
     * @param {boolean} wechat 是否微信
     * @param {boolean} qq 是否QQ
     */
    interface ISystemBrowserData {
        trident: boolean;
        presto: boolean;
        webKit: boolean;
        gecko: boolean;
        mobile: boolean;
        ios: boolean;
        android: boolean;
        iPhone: boolean;
        iPad: boolean;
        webApp: boolean;
        wechat: boolean;
        qq: boolean;
    }

    class SystemManager {
        /**
         * 获取配置信息
         * @return {object} result
         */
        get config(): ISystemConfigData;

        /**
         * 获取终端环境
         * @return {object} result
         */
        get browser(): ISystemBrowserData;

        /**
         * 初始化
         * @param {object} data 初始化数据
         */
        init(data: ISystemInitData): void;

        /**
         * 获取终端环境
         * @param {obejct} browser
         */
        getBrowser(): ISystemBrowserData;

        /**
         * 获取语言环境
         * @param {string} lang
         */
        getLanguage(): string;

        /**
         * 获取渠道信息
         * @param {string} channel
         */
        getChannel(): { channel: string, storeId: string };

        /**
         * 获取配置信息
         * @param {object} data 初始化数据
         */
        getConfig(data: ISystemInitData): void;

        /**
         * 获取时区信息, 默认当前时区
         * @return {string} utc 时区(UTC+8:00)
         */
        getTimezone(): string;

        /**
        * 更新语言环境
        * @param {string} lang 语言
        */
        updateLanguage(lang: string): void;
    }
}

/**
 * 模块 - 账户管理
 * @description
 * 根据传入type使用对应的登入或者登出方式，默认平台。
 * 目前暂时只支持平台登入 & 登出，预留其他方式类型，以及回调监听
 * 
 * @example 
 * 账户类型 ios: 苹果, android: 安卓, wechat: 微信, channel: 渠道
 * 登录(默认平台) paladin.account.login(); 
 * 登录（ios）paladin.account.login({ platform: 'ios' }); 
 * 
 * 登出 paladin.account.logout(); 
 * 
 * 注册 paladin.account.register(); 
 * 
 * 下载应用 paladin.account.app();
 * 
 * 进入首页 paladin.account.home();
 *
 * 复制 paladin.account.copy(text);
 *
 * 粘贴 paladin.account.paste();
 */
declare namespace paladin {
    /**
     * 账户登录状态数据
     * @param {string} code 平台登录态
     * @param {string} accessToken 用于换取jwt
     * @param {string} refreshToken 用于换取jwt
     */
    interface IAccountStateData {
        code: string;
        accessToken: string;
        refreshToken: string;
    }

    /**
     * 账户请求基础数据
     * @param {object} data 数据
     * @param {function} success 成功回调
     * @param {function} error 失败回调
     * @param {function} complete 完成回调
     * 
     * @default data: {}
     */
    interface IAccountBasicData {
        data: any;
        success?: Function;
        error?: Function;
        complete?: Function;
    }

    class AccountManager {
        /**
         * 检查登录态
         * @return {object} data 登录状态
         */
        getState(): IAccountStateData;

        /**
         * 登录
         * @param {object} data 数据
         */
        login(data?: IAccountBasicData): void;

        /**
         * 登出
         * @param {object} data 数据
         */
        logout(data?: IAccountBasicData): void;

        /**
         * 注册
         * @param {object} data 数据
         */
        register(data?: IAccountBasicData): void;

        // 首页
        home(): void;

        // 应用
        app(): void;

        /**
         * 复制
         * @param {string} text 文案
         * @return {Promise<void>} promise
         */
        copy(text: string): Promise<void>;

        /**
         * 粘贴
         * @return {Promise<string>} promise
         */
        paste(): Promise<string>;

        /**
         * 跳转页面
         * @param {string} key 关键词
         */
        landingPageUrl(key: string): void;

        /**
         * 获取账户类型
         * @param {string} channel 渠道
         * @return {number} result 渠道类型
         */
        getAccountType(channel: string): number;
    }
}

/**
 * 模块 - 支付管理
 * @description
 * 支付管理，支持各种平台充值 & 提现，暂时支持平台
 * 
 * @example
 * 支付请求，type 1:提现, 2:充值 
    paladin.account.request({
        type,
        data = {},
        success,
        error,
        complete
    });
 * 
 * 充值 paladin.account.recharge({ data, success, error, complete });
 * 
 * 提现 paladin.account.withdraw({ data, success, error, complete });
 */
declare namespace paladin {
    /**
     * 请求数据
     * @param {string} type 支付类型 0:提现, 1:充值 
     * @param {object} data 支付数据
     * @param {function} success 成功回调
     * @param {function} error 失败回调
     * @param {function} complete 完成回调
     * 
     * @default data: {}
     */
    interface IPayRequestData {
        type: string;
        data: any;
        success?: Function;
        error?: Function;
        complete?: Function;
    }

    /**
     * 请求基础数据
     * @param {object} data 支付数据
     * @param {function} success 成功回调
     * @param {function} error 失败回调
     * @param {function} complete 完成回调
     * 
     * @default data: {}
     */
    interface IPayRequestBasicData {
        data: any;
        success?: Function;
        error?: Function;
        complete?: Function;
    }

    class PayManager {
        /** 支付请求
         * @param {object} data 支付数据
         */
        request(data: IPayRequestData): void;

        /**
         * 充值 
         * @param {object} data 充值数据
         */
        recharge(data: IPayRequestBasicData): void;

        /**
         * 提币 
         * @param {object} data 提币数据
         */
        withdraw(data: IPayRequestBasicData): void;
    }
}

/**
 * 模块 - 加载管理
 * @description
 * 能够通过cdn动态加载脚本，加载方式有默认, defer和async。
 * 同时支持Promise监听加载情况
 * 
 * @example
 * 加载脚本
    paladin.loader.load({
        files,
        loadType,
        isPromise: true
    });
 */
declare namespace paladin {
    /**
     * 加载数据
     * @param {array} files 脚本列表
     * @param {function} success 成功回调
     * @param {function} error 失败回调
     * @param {number} loadType 执行类型 0:默认, 1: defer, 2: async
     * @param {boolean} isPromise 是否开启Promise
     * 
     * @default loadType: 0
     * @default isPromise: false
     */
    interface ILoaderData {
        files: string[];
        success: Function;
        error?: Function;
        loadType?: number;
        isPromise?: boolean;
    }

    class LoaderManager {
        /** 
         * 加载脚本
         * @param {object} data 加载数据
         */
        load(data: ILoaderData): void;
    }
}

// 模块 - 渠道管理
declare namespace paladin {
    /**
     * 初始化数据
     * @param {string} url 请求地址
     * @param {string} origin 请求域名
     * @param {object} data 请求数据
     * @param {function} success 成功回调
     * @param {function} error 失败回调
     * 
     * @default url: ''
     * @default origin: ''
     * @default data: {}
     */
    interface IChannelInitData {
        url?: string;
        origin?: string;
        data: any;
        success: Function;
        error?: Function;
    }

    /**
     * 初始化数据
     * @param {string} clientId 客户端ID
     * @param {string} lang 渠道语言
     * @param {string} sdkUrl 渠道sdk
     * @param {array} disable 渠道禁用模块 deposit:充值, withdraw:提现
     * @param {string} 'portrait' // 'portrait'(竖 屏)、'landscape'(横屏)
     * 
     * @default clientId: ''
     * @default lang: 'zh-Hans'
     * @default sdkUrl: ''
     * @default disable: []
     * @default orientation: ''
     */
    interface IChannelConfigData {
        clientId: string;
        lang: string;
        sdkUrl: string;
        disable: string[];
        orientation: string;
    }

    class ChannelManager {
        /*
         * 获取配置信息
         * @return {object} result
         */
        get config(): IChannelConfigData;

        /**
         * 初始化
         */
        async init(): Promise<string>;

        /**
         * 获取配置信息
         * @param {string} url 请求地址
         * @param {string} origin 请求域名
         * @param {object} data 请求数据
         * @param {function} success 成功回调
         * @param {function} error 失败回调
         */
        async getConfig(data: IChannelInitData): Promise<string>;
    }
}

/**
 * 模块 - 统计管理
 * @description
 * 使用Cocos Analytics进行PV & UV统计，只需要进行简单的设置就能够开启，方便在游戏开发过程中快速接入。
 * 帮助管理者、产品、运营、开发等多角色，精准有效了解产品情况，更高效的获取目标客户，实现业务增长。
 * 
 * @example
 * 统计初始化
    paladin.analytics.init({
        appId: '607862359',
        channel: paladin.sys.config.channel,
        version: mage.GAME_VERSION,
        engine: 'cocos ' + cc.ENGINE_VERSION
    });
 *
 * 统计开始登录
    paladin.analytics.login(paladin.analytics.EventID.LOGIN_START, {
        channel: paladin.sys.config.channel
    });
 *
 * 统计登录成功
    paladin.analytics.login(paladin.analytics.EventID.LOGIN_SUCCESS, {
        userID: uid
    });
 * 
 * 统计登录退出
 * paladin.analytics.logout();
 */
declare namespace paladin {
    /**
     * 事件ID
     * @param LOGIN_START 登录开始
     * @param LOGIN_SUCCESS 登录成功
     * @param LOGIN_FAILED 登录失败
     * @param PAY_BEGIN 支付开始
     * @param PAY_SUCCESS 支付成功
     * @param PAY_FAILED 支付失败
     * @param PAY_CANCELED 支付取消
     * @param EVENT_STARTED 自定义事件开始
     * @param EVENT_SUCCESS 自定义事件成功
     * @param EVENT_CANCELLED 自定义事件取消
     * @param EVENT_FAILED 自定义事件失败
     * 
     * @default LOGIN_START: 1
     * @default LOGIN_SUCCESS: 2
     * @default LOGIN_FAILED: 3
     * @default PAY_BEGIN: 4
     * @default PAY_SUCCESS: 5
     * @default PAY_FAILED: 6
     * @default PAY_CANCELED: 7
     * @default EVENT_STARTED: 8
     * @default EVENT_SUCCESS: 9
     * @default EVENT_CANCELLED: 10
     * @default EVENT_FAILED: 11
     */
    interface IAnalyticsEventID {
        LOGIN_START: number;
        LOGIN_SUCCESS: number;
        LOGIN_FAILED: number;
        // 支付
        PAY_BEGIN: number;
        PAY_SUCCESS: number;
        PAY_FAILED: number;
        PAY_CANCELED: number;
        // 自定义事件
        EVENT_STARTED: number;
        EVENT_SUCCESS: number;
        EVENT_CANCELLED: number;
        EVENT_FAILED: number;
    }

    /**
     * 初始化数据
     * @param {string} appId 游戏ID
     * @param {string} version 游戏版本
     * @param {string} storeId 分发渠道
     * @param {string} engine 游戏引擎
     * 
     * @default appId: ''
     * @default version: '1.0.0'
     * @default channel: ''
     * @default engine: 'cocos'
     */
    interface IAnalyticsInitData {
        appId: string;
        version: string;
        channel: string;
        engine: string;
    }

    /**
     * 登录数据
     * @param {string} channel 获客渠道，指获取该客户的广告渠道信息
     * @param {string} userID 获客渠道，指获取该客户的广告渠道信息   
     * @param {number} age 年龄  
     * @param {number} sex 性别：1为男，2为女，其它表示未知 
     * @param {string} reason 失败原因
     * 
     * @default channel: ''
     * @default userID: ''
     * @default age: 0
     * @default sex: 0       
     * @default reason: ''
     */
    interface IAnalyticsLoginData {
        channel?: string;
        userID?: string;
        age?: number;
        sex?: number;
        reason?: string;
    }

    /**
     * 支付数据
     * @param {number} amount 现金金额或现金等价物的额度。例如1元传入100，100元则传入10000
     * @param {string} orderID 订单ID，唯一标识一次交易
     * @param {string} payType 支付方式。如：支付宝、苹果iap、银联支付、爱贝支付聚合等
     * @param {string} iapID 商品ID。玩家购买的充值包类型。例如：人民币15元600虚拟币
     * @param {string} currencyType 请使用ISO 4217中规范的3位字母代码标记货币类型。充值货币类型
     * @param {number} virtualCurrencyAmount 充值获得的虚拟币额度
     * @param {string} accountID 消费的账号  苹果是appleid 安卓是？？
     * @param {string} partner 账户渠道名称  例如：QQ、微信
     * @param {string} gameServer 玩家充值的区服
     * @param {number} level 玩家充值时的等级
     * @param {string} mission 玩家充值时所在的关卡或任务。亦可传入一个玩家打到的最高关卡。
     * 
     * @default amount: 0  
     * @default orderID: ''
     * @default payType: '' 
     * @default iapID: ''    
     * @default currencyType: '' 
     * @default virtualCurrencyAmount: 0  
     * @default accountID: '' 
     * @default partner: ''             
     * @default gameServer: ''    
     * @default level: 0              
     * @default mission: 0   
     */
    interface IAnalyticsPaymentData {
        amount: number;
        orderID: string;
        payType: string;
        iapID: string;
        currencyType: string;
        virtualCurrencyAmount: number;
        accountID: string;
        partner?: string;
        gameServer?: string;
        level?: number;
        mission?: string;
    }

    class AnalyticsManager {
        EventID: IAnalyticsEventID;

        /**
         * 初始化
         * @param {object} data 初始化数据
         */
        init(data: IAnalyticsInitData): void;

        /**
         * 开启日志
         * @param {boolean} enable 是否开启
         */
        enableDebug(enable: boolean): void;

        /**
         * 登录
         * @param {number} id ID
         * @param {object} data 登录数据
         */
        login(id: number, data: IAnalyticsLoginData): void;

        // 登出
        logout(): void;

        /**
         * 支付
         * @param {number} id ID
         * @param {object} data 支付数据
         */
        payment(id: number, data: IAnalyticsPaymentData): void;

        /**
         * 自定义
         * @param {number} id ID
         * @param {number} eventId 事件ID
         * @param {object} data 事件数据 
         */
        customEvent(id: number, eventId: string, data: any): void;
    }
}

/**
 * 组件 - 启动
 * @description
 * 加载过渡启动页，提高游戏体验，避免用户看到加载黑屏
 * 支持样式自定义，包括设计尺寸，横竖屏显示，背景色，字体大小颜色文案，logo图片和圆点样式
 * 
 * @example
 * 默认竖屏
    paladin.comps.launch.show({
        logo: { url: 'splash.ff3cc.png' },
        load: { color: '#6d8ac8' },
        tips: { color: '#6d8ac8' },
        notice: { color: '#6d8ac8' },
        maintain: {
            color: '#6d8ac8',
            strokeColor: '#fff',
            url: 'maintain.jpg'
        }
    });
 * 横屏 paladin.comps.launch.show({ design: { width: 1334, height: 750, mode: 'horizontal' } });
 */
declare namespace paladin {
    /**
     * 设计配置数据
     * @param {number} width 屏幕宽 
     * @param {number} height 屏幕高 
     * @param {string} mode 显示模式 horizontal:横屏, vertical:竖屏
     * 
     * @default width: 750
     * @default height: 1334
     * @default mode: 'vertical'
     */
    interface ILaunchDesignData {
        width: number;
        height: number;
        mode: string;
    }

    /**
     * 标识配置数据
     * @param {boolean} disable 是否禁用 
     * @param {string} url 地址 
     * 
     * @default disable: false
     */
    interface ILaunchLogoData {
        disable: boolean;
        url: string;
    }

    /**
     * 背景配置数据
     * @param {string} color 背景色
     * 
     * @default color: '#fff'
     */
    interface ILaunchBackgroundData {
        color: string;
    }

    /**
     * 加载配置数据
     * @param {boolean} disable 是否禁用 
     * @param {string} color 圆颜色 
     * @param {number} radius 半径
     * @param {number} nums 数量
     * @param {number} space 间距
     * 
     * @default disable: false
     * @default color: '#000'
     * @default radius: 10
     * @default nums: 3
     * @default space: 10
     */
    interface ILaunchLoadData {
        disable: boolean;
        color: string;
        radius: number;
        nums: number;
        space: number;
    }

    /**
     * 提示配置数据
     * @param {boolean} disable 是否禁用 
     * @param {string} color 字体颜色 
     * @param {number} fontSize 字体大小
     * 
     * @default disable: false
     * @default color: '#000'
     * @default fontSize: 24
     */
    interface LaunchTipsData {
        disable: boolean;
        color: string;
        fontSize: number;
    }

    /**
     * 公告配置数据
     * @param {boolean} disable 是否禁用 
     * @param {string} color 字体颜色 
     * @param {string} title 标题 
     * @param {number} titleFontSize 标题字体大小 
     * @param {array} desc 描述 
     * @param {number} descFontSize 描述字体大小 
     * 
     * @default disable: false
     * @default color: '#000'
     * @default titleFontSize: 28
     * @default descFontSize: 22
     */
    interface LaunchNoticeData {
        disable: boolean;
        color: string;
        title: string;
        titleFontSize: number;
        desc: string[];
        descFontSize: number;
    }

    /**
     * 显示数据
     * @param {object} design 设计配置
     * @param {object} logo 标识配置
     * @param {object} load 加载配置
     * @param {object} background 背景配置
     * @param {object} tips 提示配置
     * @param {object} notice 公告配置
     */
    interface ILaunchShowData {
        design?: ILaunchDesignData;
        logo?: ILaunchLogoData;
        background?: ILaunchBackgroundData;
        load?: ILaunchLoadData;
        tips?: LaunchTipsData;
        notice?: LaunchNoticeData;
    }

    class Launch {
        /**
         * 显示
         * @param data 显示数据
         */
        show(data: ILaunchShowData): void;

        /**
         * 维护
         * @param {string} start 开始时间
         * @param {string} end 结束时间
         */
        maintain(start, end): void;

        // 隐藏
        hide(): void;
    }
}