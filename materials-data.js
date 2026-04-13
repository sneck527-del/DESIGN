var MATERIAL_DATA_VERSION='3.0';

var CATEGORIES=[
'拆除工程','砌筑工程','水电工程','防水工程','泥瓦工程',
'木作工程','油漆工程','墙面工程','地面工程','顶面工程',
'门窗工程','暖气改造','下水改造','安装工程','楼梯工程',
'设备产品','定制产品','背景墙'
];

var CALC_TYPES={
wall_area:'墙面面积',floor_area:'地面面积',ceiling_area:'顶面面积',
skirting:'踢脚线长度',door_count:'门数量',door_perimeter:'门套周长',
window_perimeter:'窗套周长',window_width:'窗口总宽',window_sill:'大理石窗台板',
building_area:'建筑面积',item:'按项',length_m:'长度(m)'
};

var DEFAULT_SPACE_TYPES=[
{id:'st_living',name:'客厅',icon:'🛋️'},{id:'st_dining',name:'餐厅',icon:'🍽️'},
{id:'st_master',name:'主卧',icon:'🛏️'},{id:'st_second',name:'次卧',icon:'🛏️'},
{id:'st_kitchen',name:'厨房',icon:'🍳'},{id:'st_bathroom',name:'卫生间',icon:'🚿'},
{id:'st_balcony',name:'阳台',icon:'🌿'},{id:'st_entry',name:'玄关',icon:'🚪'},
{id:'st_hallway',name:'走廊',icon:'📐'},{id:'st_study',name:'书房',icon:'📚'},
{id:'st_storage',name:'储物间',icon:'📦'},{id:'st_basement',name:'地下室',icon:'🏠'},
{id:'st_staircase',name:'楼梯间',icon:'🏗️'},{id:'st_courtyard',name:'庭院',icon:'🌳'},
{id:'st_laundry',name:'洗衣房',icon:'🧺'},{id:'st_cloakroom',name:'衣帽间',icon:'👗'}
];

var DEFAULT_EQUIPMENT=[
{name:'新风系统',brand:'松下/兰舍',unitPrice:18000,unit:'套',description:'全热交换新风系统，PM2.5过滤≥95%，风量按面积匹配'},
{name:'中央空调',brand:'大金/三菱电机',unitPrice:28000,unit:'套',description:'变频多联机中央空调系统，含室内外机+铜管+冷媒'},
{name:'净水设备',brand:'3M/滨特尔',unitPrice:6800,unit:'套',description:'全屋中央净水系统，前置+中央净水+末端'},
{name:'直饮机',brand:'3M/滨特尔',unitPrice:4500,unit:'台',description:'RO反渗透直饮机，五级过滤，废水比2:1'},
{name:'软水机',brand:'3M/滨特尔',unitPrice:7800,unit:'套',description:'中央软水系统，树脂再生，硬度≤50mg/L'},
{name:'中央加湿器',brand:'霍尼韦尔/森乐',unitPrice:8500,unit:'套',description:'中央加湿系统，自动湿度控制，湿度40%-60%'},
{name:'音响设备',brand:'Bose/尊宝',unitPrice:15000,unit:'套',description:'全屋背景音乐系统，含功放+吸顶喇叭+控制面板'},
{name:'家庭影院',brand:'Bose/JBL',unitPrice:35000,unit:'套',description:'5.1/7.1声道影院系统，含投影+幕布+功放+音箱'},
{name:'智能设备',brand:'Control4/快思聪',unitPrice:25000,unit:'套',description:'全屋智能控制系统，灯光/窗帘/安防/场景联动'},
{name:'地暖系统',brand:'威能/博世',unitPrice:22000,unit:'套',description:'水地暖系统，含壁挂炉+分集水器+地暖管'},
{name:'暖气片系统',brand:'森德/努奥罗',unitPrice:12000,unit:'套',description:'钢制暖气片+大循环管路，含阀门+温控'},
{name:'智能家居网关',brand:'绿米/涂鸦',unitPrice:3500,unit:'套',description:'Zigbee/WiFi双协议网关，支持200+设备'},
{name:'智能门锁',brand:'德施曼/鹿客',unitPrice:2800,unit:'把',description:'3D人脸识别+指纹+密码+NFC开锁'},
{name:'智能窗帘',brand:'绿米/杜亚',unitPrice:1200,unit:'轨道',description:'电动窗帘电机+轨道，支持语音/APP控制'},
{name:'安防监控',brand:'海康威视/大华',unitPrice:6500,unit:'套',description:'4路高清摄像头+NVR，手机远程查看'},
{name:'门禁系统',brand:'海康威视/大华',unitPrice:4500,unit:'套',description:'可视门禁+电磁锁+IC卡/人脸识别'},
{name:'全屋WiFi',brand:'TP-Link/华为',unitPrice:3200,unit:'套',description:'AC+AP全屋WiFi覆盖，无缝漫游'},
{name:'增压泵',brand:'格兰富/威乐',unitPrice:3800,unit:'台',description:'变频恒压增压泵，扬程≥15m'},
{name:'回水器',brand:'A.O.史密斯/林内',unitPrice:2800,unit:'台',description:'即热式回水循环泵，零冷水系统'},
{name:'热水器',brand:'A.O.史密斯/林内',unitPrice:6500,unit:'台',description:'16L恒温燃气热水器，零冷水'},
{name:'集成灶',brand:'火星人/美大',unitPrice:12000,unit:'台',description:'蒸烤一体集成灶，风量≥18m³/min'},
{name:'洗碗机',brand:'西门子/美的',unitPrice:6500,unit:'台',description:'13套嵌入式洗碗机，热风烘干'},
{name:'烤箱',brand:'西门子/美的',unitPrice:4500,unit:'台',description:'嵌入式电烤箱，70L大容量'},
{name:'蒸箱',brand:'西门子/美的',unitPrice:3800,unit:'台',description:'嵌入式电蒸箱，40L容量'},
{name:'冰箱',brand:'西门子/海尔',unitPrice:8500,unit:'台',description:'对开门/十字对开门冰箱，500L+'},
{name:'油烟机',brand:'方太/老板',unitPrice:5500,unit:'台',description:'侧吸式油烟机，风量≥22m³/min'},
{name:'垃圾处理器',brand:'贝克巴斯/爱适易',unitPrice:3200,unit:'台',description:'大功率食物垃圾处理器，研磨等级4级'},
{name:'浴霸',brand:'奥普/松下',unitPrice:1800,unit:'台',description:'风暖浴霸，PTC陶瓷加热+换气+照明'},
{name:'排风扇',brand:'松下/绿岛风',unitPrice:600,unit:'台',description:'静音换气扇，风量≥150m³/h'},
{name:'除湿机',brand:'松下/德龙',unitPrice:4500,unit:'台',description:'工业级除湿机，日除湿量≥50L'}
];

var DEFAULT_MATERIALS=[

{id:'m01',name:'墙体拆除',brand:'-',unit:'㎡',prices:{luxury:65,premium:55,standard:45},description:'含非承重墙体拆除、垃圾装袋清运',category:'拆除工程',calcType:'wall_area',spaceTypeFilter:[],processDetail:{luxury:'专业拆除设备+水切工艺降尘，拆除后墙面基层清理修整，垃圾装袋清运至指定地点',premium:'机械拆除+人工清理，拆除后基层简单修整，垃圾装袋清运',standard:'人工拆除+清理，垃圾装袋清运'}},
{id:'m02',name:'地砖拆除',brand:'-',unit:'㎡',prices:{luxury:55,premium:45,standard:35},description:'含原有地砖及粘结层拆除',category:'拆除工程',calcType:'floor_area',spaceTypeFilter:[],processDetail:{luxury:'电镐拆除+水切降尘，拆除至原结构层，分类清运',premium:'电镐拆除至原结构层，装袋清运',standard:'人工+电镐拆除，装袋清运'}},
{id:'m03',name:'墙砖拆除',brand:'-',unit:'㎡',prices:{luxury:60,premium:50,standard:38},description:'含原有墙砖及粘结层拆除',category:'拆除工程',calcType:'wall_area',spaceTypeFilter:[],processDetail:{luxury:'电镐拆除+水切降尘，拆除至原结构层，分类清运',premium:'电镐拆除至原结构层，装袋清运',standard:'人工+电镐拆除，装袋清运'}},
{id:'m04',name:'吊顶拆除',brand:'-',unit:'㎡',prices:{luxury:45,premium:38,standard:28},description:'含原有吊顶龙骨及饰面拆除',category:'拆除工程',calcType:'ceiling_area',spaceTypeFilter:[],processDetail:{luxury:'整体拆除含龙骨，分类清运，管线保护',premium:'整体拆除含龙骨，装袋清运',standard:'拆除饰面层，简单清运'}},
{id:'m05',name:'旧门窗拆除',brand:'-',unit:'樘',prices:{luxury:200,premium:160,standard:120},description:'含旧门/窗框拆除及洞口修整',category:'拆除工程',calcType:'door_count',spaceTypeFilter:[],processDetail:{luxury:'无损拆除+洞口修整+临时封堵防护，保护周边成品',premium:'拆除+洞口修整',standard:'拆除+简单修整'}},
{id:'m06',name:'木地板拆除',brand:'-',unit:'㎡',prices:{luxury:35,premium:28,standard:20},description:'含原有木地板及龙骨拆除',category:'拆除工程',calcType:'floor_area',spaceTypeFilter:[],processDetail:{luxury:'整体拆除含龙骨+防潮层，基层清理至结构层',premium:'拆除含龙骨，基层清理',standard:'拆除木地板面层'}},
{id:'m07',name:'洁具拆除',brand:'-',unit:'项',prices:{luxury:300,premium:200,standard:150},description:'含马桶/浴缸/花洒/浴室柜等拆除',category:'拆除工程',calcType:'item',spaceTypeFilter:['st_bathroom'],processDetail:{luxury:'专业拆除+排水口封堵保护+周边防水层检查',premium:'拆除+排水口封堵',standard:'拆除+简单封堵'}},
{id:'m08',name:'铲除原墙面',brand:'-',unit:'㎡',prices:{luxury:18,premium:14,standard:10},description:'铲除原墙面腻子/涂料至基层',category:'拆除工程',calcType:'wall_area',spaceTypeFilter:[],processDetail:{luxury:'机械铲除+水洗基层，铲至原水泥砂浆层，涂刷界面剂',premium:'铲除至原水泥层',standard:'铲除腻子层'}},

{id:'m10',name:'砌筑隔墙',brand:'-',unit:'㎡',prices:{luxury:120,premium:95,standard:75},description:'轻质砖砌筑隔墙，含抹灰',category:'砌筑工程',calcType:'wall_area',spaceTypeFilter:[],processDetail:{luxury:'蒸压加气混凝土砌块，M5水泥砂浆，顶部斜砌顶紧，构造柱+圈梁加固，双面抹灰压光',premium:'轻质砖砌筑，M5水泥砂浆，顶部斜砌，双面抹灰',standard:'轻质砖砌筑，水泥砂浆，双面抹灰'}},
{id:'m11',name:'红砖砌墙',brand:'-',unit:'㎡',prices:{luxury:150,premium:120,standard:90},description:'标准红砖砌墙，含抹灰',category:'砌筑工程',calcType:'wall_area',spaceTypeFilter:[],processDetail:{luxury:'MU10标准红砖，M7.5水泥砂浆，满浆错缝砌筑，构造柱+圈梁，双面抹灰压光',premium:'标准红砖砌筑，M5水泥砂浆，双面抹灰',standard:'红砖砌筑，水泥砂浆，双面抹灰'}},
{id:'m12',name:'包管道砌筑',brand:'-',unit:'根',prices:{luxury:350,premium:280,standard:200},description:'红砖包立管，含抹灰',category:'砌筑工程',calcType:'item',spaceTypeFilter:[],processDetail:{luxury:'红砖砌筑+隔音棉包裹+钢丝网加固+双面抹灰',premium:'红砖砌筑+隔音棉+抹灰',standard:'红砖砌筑+抹灰'}},
{id:'m13',name:'地圈梁/过梁',brand:'-',unit:'m',prices:{luxury:85,premium:65,standard:50},description:'钢筋混凝土圈梁/过梁',category:'砌筑工程',calcType:'length_m',spaceTypeFilter:[],processDetail:{luxury:'C25混凝土浇筑，4φ12主筋+φ6@200箍筋，模板支护',premium:'C20混凝土浇筑，4φ10主筋+箍筋',standard:'C20混凝土浇筑，钢筋网'}},

{id:'m20',name:'电路改造',brand:'正泰/施耐德',unit:'㎡',prices:{luxury:120,premium:90,standard:65},description:'全屋电路改造',category:'水电工程',calcType:'building_area',spaceTypeFilter:[],processDetail:{luxury:'阻燃线管+BV4mm²主线/BV2.5mm²支线，强弱电分槽≥200mm，86型底盒，管线横平竖直',premium:'品牌线管+BV线材，强弱电分槽，86型底盒',standard:'PVC线管+国标线材，底盒安装'}},
{id:'m21',name:'水路改造',brand:'日丰/伟星',unit:'㎡',prices:{luxury:95,premium:72,standard:50},description:'全屋水路改造',category:'水电工程',calcType:'building_area',spaceTypeFilter:[],processDetail:{luxury:'PPR热熔管，冷水25mm/热水20mm，水管走顶，保温棉包裹，打压0.8MPa/30min',premium:'品牌PPR管，冷热水管分色，打压0.6MPa',standard:'PPR管，打压测试'}},
{id:'m22',name:'开关面板',brand:'西门子/施耐德',unit:'个',prices:{luxury:45,premium:30,standard:18},description:'品牌开关插座面板',category:'水电工程',calcType:'building_area',spaceTypeFilter:[],processDetail:{luxury:'西门子/施耐德高端系列，含USB/Type-C五孔插座，面板与墙面平齐',premium:'品牌面板，含部分功能插座',standard:'品牌基础面板'}},
{id:'m23',name:'强弱电箱',brand:'施耐德/正泰',unit:'个',prices:{luxury:1800,premium:1200,standard:800},description:'强电箱+弱电箱',category:'水电工程',calcType:'item',spaceTypeFilter:[],processDetail:{luxury:'施耐德强电箱+空开漏保，弱电箱含光纤+网络模块，品牌元器件',premium:'品牌强电箱+弱电箱，空开漏保齐全',standard:'国标强电箱+弱电箱'}},
{id:'m24',name:'水电开槽',brand:'-',unit:'m',prices:{luxury:18,premium:14,standard:10},description:'墙面/地面开槽',category:'水电工程',calcType:'building_area',spaceTypeFilter:[],processDetail:{luxury:'切割机开槽+水切降尘，槽深≥管径+15mm，槽宽适中，开槽后清理',premium:'切割机开槽，槽深达标',standard:'电锤开槽'}},
{id:'m25',name:'等电位连接',brand:'-',unit:'项',prices:{luxury:800,premium:500,standard:300},description:'卫生间等电位连接',category:'水电工程',calcType:'item',spaceTypeFilter:['st_bathroom'],processDetail:{luxury:'黄铜等电位端子箱+BV4mm²专线连接，所有金属管道/构件等电位联结',premium:'等电位端子箱+专线连接',standard:'基础等电位连接'}},

{id:'m30',name:'防水处理',brand:'德高/西卡',unit:'㎡',prices:{luxury:68,premium:52,standard:38},description:'柔性防水涂料',category:'防水工程',calcType:'floor_area',spaceTypeFilter:['st_bathroom','st_kitchen','st_balcony'],processDetail:{luxury:'德高K11柔性防水三遍涂刷，墙面上翻180cm，淋浴区满墙，48h闭水试验验收，门槛石处防水翻边',premium:'柔性防水两遍涂刷，墙面上翻120cm，闭水试验',standard:'柔性防水两遍涂刷，墙面上翻30cm'}},
{id:'m31',name:'地下室防水',brand:'德高/西卡',unit:'㎡',prices:{luxury:95,premium:75,standard:55},description:'地下室防潮防水处理',category:'防水工程',calcType:'wall_area',spaceTypeFilter:['st_basement'],processDetail:{luxury:'渗透结晶型防水涂料+柔性防水两遍，墙面满做，地面+墙面上翻300mm，48h闭水试验',premium:'柔性防水两遍涂刷，墙面满做',standard:'防水涂料两遍'}},
{id:'m32',name:'堵漏灵处理',brand:'德高/西卡',unit:'处',prices:{luxury:150,premium:100,standard:60},description:'管根/阴角堵漏加强',category:'防水工程',calcType:'item',spaceTypeFilter:[],processDetail:{luxury:'管根/地漏/阴角处堵漏灵抹弧处理+防水附加层，每处单独施工',premium:'管根/阴角堵漏灵处理',standard:'管根堵漏处理'}},

{id:'m40',name:'地砖密缝铺贴',brand:'马可波罗/诺贝尔',unit:'㎡',prices:{luxury:85,premium:65,standard:50},description:'大板密缝铺贴',category:'泥瓦工程',calcType:'floor_area',spaceTypeFilter:[],processDetail:{luxury:'大规格瓷砖密缝铺贴，留缝≤0.5mm，瓷砖胶薄贴法，平整度≤1mm/2m',premium:'瓷砖铺贴，留缝1mm，水泥砂浆',standard:'瓷砖常规铺贴，留缝2mm'}},
{id:'m41',name:'地砖常规铺贴',brand:'马可波罗/诺贝尔',unit:'㎡',prices:{luxury:65,premium:50,standard:38},description:'瓷砖常规铺贴',category:'泥瓦工程',calcType:'floor_area',spaceTypeFilter:[],processDetail:{luxury:'瓷砖胶薄贴法，留缝1.5mm，十字定位卡，勾缝剂填缝',premium:'水泥砂浆铺贴，留缝2mm，勾缝处理',standard:'水泥砂浆铺贴，留缝2mm，白水泥勾缝'}},
{id:'m42',name:'墙面瓷砖铺贴',brand:'马可波罗/诺贝尔',unit:'㎡',prices:{luxury:95,premium:72,standard:55},description:'墙面瓷砖铺贴',category:'泥瓦工程',calcType:'wall_area',spaceTypeFilter:['st_bathroom','st_kitchen'],processDetail:{luxury:'薄贴法施工，瓷砖胶+齿形刮板，留缝1.5mm，十字定位卡，平整度≤1mm/2m',premium:'水泥砂浆满浆铺贴，留缝2mm，勾缝处理',standard:'水泥砂浆铺贴，留缝2mm，白水泥勾缝'}},
{id:'m43',name:'木地板安装',brand:'大自然/圣象',unit:'㎡',prices:{luxury:280,premium:180,standard:120},description:'实木/实木复合地板安装',category:'泥瓦工程',calcType:'floor_area',spaceTypeFilter:[],processDetail:{luxury:'大自然/圣象实木复合地板，锁扣式安装，防潮垫+踢脚线+扣条',premium:'品牌实木复合地板，悬浮式安装',standard:'品牌强化地板安装'}},
{id:'m44',name:'大理石/岩板铺贴',brand:'天然大理石/岩板',unit:'㎡',prices:{luxury:350,premium:250,standard:180},description:'大理石/岩板地面铺贴',category:'泥瓦工程',calcType:'floor_area',spaceTypeFilter:[],processDetail:{luxury:'天然大理石/岩板，AB胶+瓷砖胶铺贴，六面防护，无缝拼接+结晶养护',premium:'大理石/岩板铺贴，AB胶粘贴',standard:'大理石铺贴'}},
{id:'m45',name:'自流平找平',brand:'圣戈班',unit:'㎡',prices:{luxury:55,premium:40,standard:30},description:'自流平水泥找平',category:'泥瓦工程',calcType:'floor_area',spaceTypeFilter:[],processDetail:{luxury:'圣戈班自流平水泥，厚度≥5mm，平整度≤2mm/2m',premium:'自流平水泥找平，厚度≥3mm',standard:'水泥砂浆找平'}},
{id:'m46',name:'美缝施工',brand:'卓高/皇氏工匠',unit:'㎡',prices:{luxury:35,premium:25,standard:15},description:'瓷砖美缝施工',category:'泥瓦工程',calcType:'floor_area',spaceTypeFilter:[],processDetail:{luxury:'卓高环氧彩砂美缝，双组份满填，颜色与砖搭配，防霉抗菌',premium:'品牌聚脲美缝剂施工',standard:'普通美缝剂施工'}},
{id:'m47',name:'石材安装',brand:'天然石材',unit:'㎡',prices:{luxury:320,premium:240,standard:160},description:'墙面石材干挂/湿贴',category:'泥瓦工程',calcType:'wall_area',spaceTypeFilter:[],processDetail:{luxury:'天然石材干挂法，不锈钢挂件+AB胶，六面防护，拼花对纹',premium:'石材湿贴法，AB胶粘贴',standard:'石材水泥砂浆铺贴'}},

{id:'m50',name:'无主灯吊顶',brand:'圣戈班/可耐福',unit:'㎡',prices:{luxury:180,premium:130,standard:0},description:'无主灯吊顶系统',category:'木作工程',calcType:'ceiling_area',spaceTypeFilter:[],processDetail:{luxury:'轻钢龙骨+12mm石膏板双层错缝铺贴，含灯槽/射灯开孔/检修口/窗帘盒',premium:'轻钢龙骨+单层石膏板吊顶，含灯位开孔',standard:''}},
{id:'m51',name:'石膏板吊顶',brand:'圣戈班/可耐福',unit:'㎡',prices:{luxury:120,premium:90,standard:65},description:'轻钢龙骨石膏板平顶',category:'木作工程',calcType:'ceiling_area',spaceTypeFilter:[],processDetail:{luxury:'轻钢龙骨+双层12mm石膏板错缝铺贴，防潮处理，自攻丝间距≤200mm',premium:'轻钢龙骨+单层石膏板，自攻丝间距≤250mm',standard:'轻钢龙骨+单层石膏板平顶'}},
{id:'m52',name:'造型吊顶',brand:'圣戈班/可耐福',unit:'㎡',prices:{luxury:220,premium:160,standard:100},description:'弧形/异形吊顶',category:'木作工程',calcType:'ceiling_area',spaceTypeFilter:[],processDetail:{luxury:'轻钢龙骨+木龙骨造型+双层石膏板，弧形处理，接缝贴绷带防裂',premium:'木龙骨造型+单层石膏板',standard:'简单造型吊顶'}},
{id:'m53',name:'背景墙打底',brand:'圣戈班/可耐福',unit:'㎡',prices:{luxury:85,premium:60,standard:40},description:'背景墙基层打底',category:'木作工程',calcType:'wall_area',spaceTypeFilter:[],processDetail:{luxury:'欧松板/多层板基层打底+轻钢龙骨框架，预留灯带槽+电源线',premium:'欧松板基层打底',standard:'木工板基层'}},
{id:'m54',name:'窗帘盒制作',brand:'圣戈班/可耐福',unit:'m',prices:{luxury:120,premium:85,standard:55},description:'石膏板窗帘盒',category:'木作工程',calcType:'length_m',spaceTypeFilter:[],processDetail:{luxury:'轻钢龙骨+双层石膏板窗帘盒，宽度≥200mm，含灯带槽',premium:'轻钢龙骨+石膏板窗帘盒',standard:'单层石膏板窗帘盒'}},
{id:'m55',name:'木作喷漆',brand:'多乐士/立邦',unit:'㎡',prices:{luxury:120,premium:85,standard:55},description:'木制品表面喷漆',category:'木作工程',calcType:'wall_area',spaceTypeFilter:[],processDetail:{luxury:'三底两面PU聚酯漆喷涂，水灰补钉眼+打磨，漆膜饱满均匀',premium:'两底两面喷漆，修补打磨',standard:'两遍面漆'}},

{id:'m60',name:'墙面冲筋找平',brand:'多乐士/立邦',unit:'㎡',prices:{luxury:45,premium:35,standard:28},description:'冲筋打点找平',category:'油漆工程',calcType:'wall_area',spaceTypeFilter:[],processDetail:{luxury:'2m靠尺冲筋打点，找平层≥15mm，平整度≤2mm/2m，阴阳角方正度≤2mm',premium:'2m靠尺冲筋打点，找平层≥10mm，平整度≤3mm/2m',standard:'局部找平，平整度≤4mm/2m'}},
{id:'m61',name:'墙面刮腻子',brand:'美巢/多乐士',unit:'㎡',prices:{luxury:35,premium:28,standard:22},description:'耐水腻子批刮',category:'油漆工程',calcType:'wall_area',spaceTypeFilter:[],processDetail:{luxury:'美巢800耐水腻子三遍批刮，每遍干透后打磨，平整度≤1mm/2m',premium:'耐水腻子三遍批刮，两遍打磨',standard:'耐水腻子两遍批刮，一遍打磨'}},
{id:'m62',name:'墙面乳胶漆',brand:'芬琳/本杰明摩尔',unit:'㎡',prices:{luxury:65,premium:45,standard:30},description:'乳胶漆涂刷',category:'油漆工程',calcType:'wall_area',spaceTypeFilter:[],processDetail:{luxury:'芬琳/本杰明摩尔进口乳胶漆，一底两面，底漆抗碱封闭，面漆均匀无流挂',premium:'品牌乳胶漆一底两面涂刷',standard:'品牌乳胶漆两遍面漆'}},
{id:'m63',name:'墙面防裂处理',brand:'圣戈班/可耐福',unit:'㎡',prices:{luxury:38,premium:28,standard:0},description:'网格布满铺防裂',category:'油漆工程',calcType:'wall_area',spaceTypeFilter:[],processDetail:{luxury:'圣戈班玻纤网格布满铺+接缝带处理，新旧墙交接处加强',premium:'玻纤网格布满铺+接缝处理',standard:''}},
{id:'m64',name:'界面剂涂刷',brand:'美巢/德高',unit:'㎡',prices:{luxury:12,premium:8,standard:5},description:'墙面界面剂涂刷',category:'油漆工程',calcType:'wall_area',spaceTypeFilter:[],processDetail:{luxury:'美巢墙锢界面剂滚涂，增强基层附着力，防止空鼓脱落',premium:'品牌界面剂滚涂',standard:'界面剂涂刷'}},
{id:'m65',name:'顶面乳胶漆',brand:'芬琳/本杰明摩尔',unit:'㎡',prices:{luxury:55,premium:38,standard:25},description:'顶面乳胶漆涂刷',category:'油漆工程',calcType:'ceiling_area',spaceTypeFilter:[],processDetail:{luxury:'进口乳胶漆一底两面，石膏板接缝处贴绷带防裂',premium:'品牌乳胶漆一底两面',standard:'品牌乳胶漆两遍面漆'}},
{id:'m66',name:'墙布/壁纸铺贴',brand:'特普丽/柔然',unit:'㎡',prices:{luxury:85,premium:55,standard:35},description:'墙布/壁纸铺贴',category:'油漆工程',calcType:'wall_area',spaceTypeFilter:[],processDetail:{luxury:'品牌无缝墙布，糯米胶环保铺贴，阴阳角包边处理，无气泡无褶皱',premium:'品牌壁纸铺贴，环保胶水',standard:'壁纸铺贴'}},

{id:'m70',name:'踢脚线',brand:'凯恩佳美',unit:'m',prices:{luxury:45,premium:32,standard:22},description:'实木/实木复合踢脚线',category:'墙面工程',calcType:'skirting',spaceTypeFilter:[],processDetail:{luxury:'凯恩佳美实木踢脚线，高度80-100mm，与门套同色，阴阳角45°拼接',premium:'实木复合踢脚线，高度80mm',standard:'复合踢脚线，高度70mm'}},
{id:'m71',name:'护墙板安装',brand:'凯恩佳美',unit:'㎡',prices:{luxury:680,premium:480,standard:0},description:'定制护墙板安装',category:'墙面工程',calcType:'wall_area',spaceTypeFilter:[],processDetail:{luxury:'凯恩佳美实木复合护墙板，厚度≥12mm，含线条收口，防潮背板',premium:'凯恩佳美护墙板，厚度≥10mm，含收口线条',standard:''}},
{id:'m72',name:'集成墙板',brand:'法狮龙/奥普',unit:'㎡',prices:{luxury:180,premium:130,standard:85},description:'集成墙面安装',category:'墙面工程',calcType:'wall_area',spaceTypeFilter:[],processDetail:{luxury:'品牌竹木纤维集成墙板，卡扣式安装，含线条收口',premium:'品牌集成墙板安装',standard:'集成墙板安装'}},
{id:'m73',name:'墙面石材铺贴',brand:'天然石材',unit:'㎡',prices:{luxury:320,premium:240,standard:160},description:'墙面石材安装',category:'墙面工程',calcType:'wall_area',spaceTypeFilter:[],processDetail:{luxury:'天然石材干挂法，不锈钢挂件+AB胶，六面防护，拼花对纹',premium:'石材湿贴法，AB胶粘贴',standard:'石材水泥砂浆铺贴'}},

{id:'m80',name:'铝扣板吊顶',brand:'奥普/友邦',unit:'㎡',prices:{luxury:150,premium:110,standard:75},description:'集成铝扣板吊顶',category:'顶面工程',calcType:'ceiling_area',spaceTypeFilter:['st_bathroom','st_kitchen'],processDetail:{luxury:'奥普/友邦集成吊顶，0.7mm铝扣板+轻钢龙骨，含换气扇/浴霸开孔',premium:'品牌集成吊顶，0.6mm铝扣板+龙骨',standard:'集成吊顶，0.5mm铝扣板'}},

{id:'m90',name:'室内门',brand:'凯恩佳美',unit:'樘',prices:{luxury:3800,premium:2600,standard:1600},description:'实木复合门含门套五金',category:'门窗工程',calcType:'door_count',spaceTypeFilter:[],processDetail:{luxury:'凯恩佳美实木复合门，45mm厚门扇，静音磁吸锁，不锈钢合页',premium:'实木复合门，40mm厚门扇，品牌五金',standard:'实木复合门，38mm厚门扇'}},
{id:'m91',name:'门套',brand:'凯恩佳美',unit:'m',prices:{luxury:120,premium:85,standard:55},description:'实木门套线',category:'门窗工程',calcType:'door_perimeter',spaceTypeFilter:[],processDetail:{luxury:'凯恩佳美实木门套，60mm宽套线，双面门套',premium:'实木门套，50mm宽套线',standard:'复合门套线'}},
{id:'m92',name:'窗套',brand:'凯恩佳美',unit:'m',prices:{luxury:100,premium:70,standard:45},description:'实木窗套线',category:'门窗工程',calcType:'window_perimeter',spaceTypeFilter:[],processDetail:{luxury:'凯恩佳美实木窗套，50mm宽套线',premium:'实木窗套线',standard:'复合窗套线'}},
{id:'m93',name:'大理石窗台板',brand:'天然大理石',unit:'块',prices:{luxury:280,premium:200,standard:140},description:'天然大理石窗台板',category:'门窗工程',calcType:'window_sill',spaceTypeFilter:[],processDetail:{luxury:'天然大理石，厚度≥20mm，前缘倒角抛光，含安装',premium:'天然大理石，厚度≥18mm，含安装',standard:'人造石窗台板，含安装'}},
{id:'m94',name:'玻璃移门',brand:'凯恩佳美/顶固',unit:'㎡',prices:{luxury:480,premium:350,standard:250},description:'玻璃推拉/吊轨移门',category:'门窗工程',calcType:'door_count',spaceTypeFilter:[],processDetail:{luxury:'钢化玻璃移门，吊轨式安装，阻尼缓冲，含五金轨道',premium:'钢化玻璃移门，含轨道五金',standard:'普通移门'}},
{id:'m95',name:'窗户更换',brand:'断桥铝/铝包木',unit:'㎡',prices:{luxury:850,premium:600,standard:400},description:'断桥铝/铝包木窗户更换',category:'门窗工程',calcType:'window_perimeter',spaceTypeFilter:[],processDetail:{luxury:'铝包木窗/断桥铝70系列，三层中空钢化玻璃，进口五金，密封胶条',premium:'断桥铝60系列，双层中空玻璃',standard:'断桥铝55系列，双层玻璃'}},

{id:'m100',name:'暖气片改造',brand:'森德/努奥罗',unit:'组',prices:{luxury:2800,premium:2200,standard:1600},description:'暖气片+大循环管路',category:'暖气改造',calcType:'building_area',spaceTypeFilter:[],processDetail:{luxury:'森德钢制暖气片+大循环PPR铜管，含阀门+温控器，管道保温，打压0.6MPa',premium:'品牌暖气片+PPR管大循环，含阀门，打压测试',standard:'暖气片+PPR管路，打压测试'}},
{id:'m101',name:'地暖铺设',brand:'威能/博世',unit:'㎡',prices:{luxury:180,premium:140,standard:110},description:'水地暖系统铺设',category:'暖气改造',calcType:'floor_area',spaceTypeFilter:[],processDetail:{luxury:'壁挂炉+PE-RT地暖管，间距150mm，2cm挤塑板+反射膜+边界条，打压0.6MPa',premium:'品牌壁挂炉+地暖管，间距200mm，保温层+反射膜',standard:'地暖管铺设，间距200mm，保温层'}},

{id:'m110',name:'下水改造',brand:'联塑/日丰',unit:'项',prices:{luxury:3500,premium:2800,standard:2000},description:'全屋下水管路改造',category:'下水改造',calcType:'building_area',spaceTypeFilter:[],processDetail:{luxury:'PVC排水管75mm/110mm，存水弯防臭，坡度≥2%，通球+灌水试验',premium:'品牌PVC排水管，存水弯防臭，坡度达标',standard:'PVC排水管改造，存水弯处理'}},
{id:'m111',name:'下水管隔音',brand:'志海/欧文斯科宁',unit:'根',prices:{luxury:280,premium:200,standard:0},description:'下水管隔音包覆',category:'下水改造',calcType:'building_area',spaceTypeFilter:[],processDetail:{luxury:'阻尼片+隔音棉双层包裹+红砖砌筑，降噪≥30dB',premium:'隔音棉包裹+红砖砌筑',standard:''}},

{id:'m120',name:'洁具安装',brand:'-',unit:'套',prices:{luxury:800,premium:500,standard:300},description:'马桶/花洒/龙头等安装',category:'安装工程',calcType:'item',spaceTypeFilter:['st_bathroom'],processDetail:{luxury:'专业安装+硅胶密封+角阀+软管，安装后功能调试，成品保护',premium:'品牌洁具安装+密封+调试',standard:'洁具安装'}},
{id:'m121',name:'五金安装',brand:'-',unit:'套',prices:{luxury:500,premium:350,standard:200},description:'毛巾架/置物架/镜柜等安装',category:'安装工程',calcType:'item',spaceTypeFilter:['st_bathroom'],processDetail:{luxury:'全部五金件定位安装，膨胀螺栓固定，水平度≤1mm，硅胶封边',premium:'五金件安装，固定牢靠',standard:'五金件安装'}},
{id:'m122',name:'灯具安装',brand:'-',unit:'套',prices:{luxury:1200,premium:800,standard:500},description:'全屋灯具安装调试',category:'安装工程',calcType:'building_area',spaceTypeFilter:[],processDetail:{luxury:'全部灯具安装+定位+调光+分组控制调试，射灯角度调整，成品保护',premium:'灯具安装+调试',standard:'灯具安装'}},
{id:'m123',name:'设备调试',brand:'-',unit:'套',prices:{luxury:1500,premium:1000,standard:500},description:'全屋设备安装调试',category:'安装工程',calcType:'item',spaceTypeFilter:[],processDetail:{luxury:'新风/空调/净水/智能等设备安装调试，功能验证，使用说明',premium:'设备安装调试，功能验证',standard:'设备基本调试'}},
{id:'m124',name:'卫浴洁具',brand:'TOTO/科勒',unit:'套',prices:{luxury:8500,premium:5500,standard:3500},description:'马桶+花洒+龙头+地漏',category:'安装工程',calcType:'item',spaceTypeFilter:['st_bathroom'],processDetail:{luxury:'TOTO/科勒全套卫浴，智能马桶+恒温花洒+台盆龙头+防臭地漏',premium:'品牌卫浴套装，含马桶+花洒+龙头',standard:'品牌基础卫浴套装'}},
{id:'m125',name:'浴室柜',brand:'TOTO/科勒',unit:'套',prices:{luxury:4500,premium:2800,standard:1800},description:'定制浴室柜+镜柜',category:'安装工程',calcType:'item',spaceTypeFilter:['st_bathroom'],processDetail:{luxury:'品牌实木浴室柜+智能镜柜，含LED灯+除雾+收纳',premium:'品牌浴室柜+镜柜',standard:'PVC浴室柜+镜子'}},

{id:'m130',name:'楼梯踏步',brand:'凯恩佳美',unit:'步',prices:{luxury:1200,premium:800,standard:500},description:'实木/石材楼梯踏步板',category:'楼梯工程',calcType:'item',spaceTypeFilter:[],processDetail:{luxury:'凯恩佳美实木踏步板，厚度≥40mm，防滑槽处理，含安装',premium:'实木踏步板，厚度≥30mm',standard:'复合踏步板'}},
{id:'m131',name:'楼梯扶手栏杆',brand:'凯恩佳美',unit:'m',prices:{luxury:680,premium:450,standard:280},description:'实木/铁艺扶手栏杆',category:'楼梯工程',calcType:'length_m',spaceTypeFilter:[],processDetail:{luxury:'凯恩佳美实木扶手+铁艺栏杆，高度900mm，间距≤110mm',premium:'实木扶手+栏杆',standard:'铁艺扶手栏杆'}},

{id:'m140',name:'衣柜',brand:'凯恩佳美',unit:'㎡',prices:{luxury:1200,premium:880,standard:650},description:'定制衣柜',category:'定制产品',calcType:'item',spaceTypeFilter:[],processDetail:{luxury:'凯恩佳美E0级实木颗粒板/多层板，海蒂诗五金，阻尼铰链+抽屉轨道',premium:'凯恩佳美E1级板材，品牌五金',standard:'E1级板材，国产五金'}},
{id:'m141',name:'电视柜',brand:'凯恩佳美',unit:'㎡',prices:{luxury:1100,premium:800,standard:580},description:'定制电视柜',category:'定制产品',calcType:'item',spaceTypeFilter:[],processDetail:{luxury:'凯恩佳美E0级板材，隐藏式线缆管理，LED灯带预埋',premium:'凯恩佳美E1级板材，含线缆管理',standard:'E1级板材'}},
{id:'m142',name:'书柜',brand:'凯恩佳美',unit:'㎡',prices:{luxury:1050,premium:780,standard:560},description:'定制书柜',category:'定制产品',calcType:'item',spaceTypeFilter:[],processDetail:{luxury:'凯恩佳美E0级实木多层板，层板25mm防变形，含玻璃门+灯带',premium:'凯恩佳美E1级板材，层板18mm',standard:'E1级板材'}},
{id:'m143',name:'橱柜',brand:'凯恩佳美',unit:'㎡',prices:{luxury:1500,premium:1100,standard:800},description:'定制橱柜',category:'定制产品',calcType:'item',spaceTypeFilter:[],processDetail:{luxury:'凯恩佳美E0级多层柜体+石英石台面20mm，百隆阻尼铰链',premium:'凯恩佳美E1级柜体+石英石台面15mm',standard:'E1级柜体+石英石台面'}},
{id:'m144',name:'护墙板',brand:'凯恩佳美',unit:'㎡',prices:{luxury:680,premium:480,standard:0},description:'定制护墙板',category:'定制产品',calcType:'item',spaceTypeFilter:[],processDetail:{luxury:'凯恩佳美实木复合护墙板，厚度≥12mm，含线条收口，防潮背板',premium:'凯恩佳美护墙板，厚度≥10mm，含收口线条',standard:''}},
{id:'m145',name:'定制门',brand:'凯恩佳美',unit:'樘',prices:{luxury:4200,premium:3000,standard:0},description:'定制木门',category:'定制产品',calcType:'item',spaceTypeFilter:[],processDetail:{luxury:'凯恩佳美定制实木复合门，45mm厚，静音磁吸锁+隐藏合页',premium:'凯恩佳美定制门，40mm厚，品牌五金',standard:''}},
{id:'m146',name:'定制踢脚线',brand:'凯恩佳美',unit:'m',prices:{luxury:55,premium:40,standard:0},description:'定制踢脚线',category:'定制产品',calcType:'item',spaceTypeFilter:[],processDetail:{luxury:'凯恩佳美实木踢脚线，高度80-100mm，与护墙板/门套同色',premium:'凯恩佳美实木踢脚线，高度80mm',standard:''}},
{id:'m147',name:'衣帽间',brand:'凯恩佳美',unit:'㎡',prices:{luxury:1300,premium:950,standard:700},description:'定制衣帽间',category:'定制产品',calcType:'item',spaceTypeFilter:[],processDetail:{luxury:'凯恩佳美E0级板材，U型/L型布局，含穿衣镜+灯带+收纳配件',premium:'凯恩佳美E1级板材，含收纳配件',standard:'E1级板材衣帽间'}},

{id:'m150',name:'背景墙制作',brand:'-',unit:'㎡',prices:{luxury:380,premium:260,standard:160},description:'背景墙饰面制作安装',category:'背景墙',calcType:'wall_area',spaceTypeFilter:[],processDetail:{luxury:'石材/木饰面/硬包背景墙，含基层打底+面层安装+灯带+收口线条',premium:'背景墙饰面安装，含基层',standard:'背景墙基础制作'}},
{id:'m151',name:'岩板背景墙',brand:'岩板品牌',unit:'㎡',prices:{luxury:550,premium:400,standard:280},description:'大板岩板背景墙',category:'背景墙',calcType:'wall_area',spaceTypeFilter:[],processDetail:{luxury:'大规格岩板密缝铺贴，AB胶粘贴，连纹对缝，含基层+灯带',premium:'岩板铺贴，含基层',standard:'岩板铺贴'}},
{id:'m152',name:'硬包/软包背景墙',brand:'-',unit:'㎡',prices:{luxury:420,premium:300,standard:200},description:'硬包/软包背景墙',category:'背景墙',calcType:'wall_area',spaceTypeFilter:[],processDetail:{luxury:'高密度海绵+面料硬包/软包，含基层打底+分格+收口',premium:'硬包/软包制作安装',standard:'软包制作安装'}}
];

var PRODUCT_MAIN_CATEGORIES=[
{id:'main_material',name:'主材',icon:'🧱',subcategories:[
{id:'pm_tiles',name:'瓷砖'},{id:'pm_flooring',name:'地板'},{id:'pm_marble',name:'大理石/岩板'},
{id:'pm_sanitary',name:'洁具/卫浴'},{id:'pm_doors',name:'室内门'},{id:'pm_windows',name:'窗户'},
{id:'pm_paint',name:'涂料/乳胶漆'},{id:'pm_wallpaper',name:'壁纸/墙布'},{id:'pm_wood_veneer',name:'木饰面/护墙板'},
{id:'pm_hardware',name:'五金配件'},{id:'pm_lighting',name:'灯具'},{id:'pm_switches',name:'开关插座'},
{id:'pm_kitchen_appliance',name:'厨房电器'},{id:'pm_bath_fitting',name:'卫浴五金'},
{id:'pm_countertop',name:'橱柜/台面'},{id:'pm_wardrobe',name:'定制柜类'},
{id:'pm_skirting',name:'踢脚线/线条'},{id:'pm_glass',name:'玻璃/镜面'}
]},
{id:'auxiliary',name:'辅料',icon:'🔧',subcategories:[
{id:'pa_cement',name:'水泥/砂浆'},{id:'pa_tile_adhesive',name:'瓷砖胶/粘结剂'},
{id:'pa_waterproof',name:'防水涂料'},{id:'pa_putty',name:'腻子粉'},
{id:'pa_gypsum',name:'石膏板/硅钙板'},{id:'pa_keel',name:'龙骨/轻钢'},
{id:'pa_water_pipe',name:'水管/管件'},{id:'pa_wire',name:'电线/线管'},
{id:'pa_insulation',name:'保温/隔音'},{id:'pa_sealant',name:'密封胶/美缝剂'},
{id:'pa_tape',name:'网格布/胶带'},{id:'pa_fastener',name:'膨胀螺栓/钉类'},
{id:'pa_other',name:'其他辅料'}
]},
{id:'equipment',name:'设备',icon:'⚙️',subcategories:[
{id:'pe_fresh_air',name:'新风系统'},{id:'pe_central_ac',name:'中央空调'},
{id:'pe_underfloor_heating',name:'地暖系统'},{id:'pe_water_purifier',name:'净水设备'},
{id:'pe_water_heater',name:'热水器'},{id:'pe_smart_home',name:'智能家居'},
{id:'pe_security',name:'安防监控'},{id:'pe_ventilation',name:'排气/换气设备'},
{id:'pe_dehumidifier',name:'除湿设备'},{id:'pe_pump',name:'增压泵/回水器'},
{id:'heating',name:'暖气系统'},{id:'pe_other',name:'其他设备'}
]},
{id:'soft_furnishing',name:'软装',icon:'🛋️',subcategories:[
{id:'ps_curtain',name:'窗帘/布艺'},{id:'ps_carpet',name:'地毯/地垫'},
{id:'ps_artwork',name:'挂画/装饰画'},{id:'ps_plants',name:'绿植花艺'},
{id:'ps_decor',name:'摆件/饰品'},{id:'ps_bedding',name:'床品/家纺'},
{id:'ps_tableware',name:'餐具/茶具'},{id:'ps_storage',name:'收纳用品'},
{id:'ps_furniture',name:'活动家具'},{id:'ps_other',name:'其他软装'}
]}];
