#pragma once
#ifndef DEFINITION_H
#define DEFINITION_H

#include <vector>
#include <string>
#include <initializer_list>
#include <stdexcept>
#include <map>
#include <set>
#include <iostream>

using namespace std;
typedef double TSpeed;
typedef double TResourceD;  //double 的资源数，用于内部操作
typedef int    TResourceI;  //int    的资源数，用于显示
typedef double TTechPoint;  //科技点数

typedef double TLength;
typedef int    TCellID;
typedef int    TPlayerID;
typedef int    TTentacleID;

typedef int    TPosition;

typedef string TMapID;
typedef int    TMap;
typedef int    TLevel;  //各项属性等级
typedef int    TRound;  //回合数
typedef double TPower;  //倍率
typedef int    TTentacleNum;


//兵力密度
const double       Density = 0.1;
const TSpeed       BaseExtendSpeed = 3;
const TSpeed       BaseFrontSpeed = 12;
const TSpeed       BaseBackSpeed = 20;
const TLevel       STUDENT_LEVEL_COUNT = 5;
const TResourceI   MAX_RESOURCE = 200;
const TSpeed       BASE_REGENERETION_SPEED[STUDENT_LEVEL_COUNT]{ 1,1.5,2,2.5,3 };
const TTentacleNum MAX_TENTACLE_NUMBER[STUDENT_LEVEL_COUNT]{ 1,2,2,3,3 };  //可伸触手数量
const TResourceI   STUDENT_STAGE[STUDENT_LEVEL_COUNT + 1]{ 0 ,10,40,80,150,MAX_RESOURCE };
const int          NO_DATA = -1;
const TPlayerID        Neutral = NO_DATA;

//最大技能等级
const TLevel MAX_REGENERATION_SPEED_LEVEL = 5;
const TLevel MAX_EXTENDING_SPEED_LEVEL = 5;
const TLevel MAX_EXTRA_CONTROL_LEVEL = 3;
const TLevel MAX_DEFENCE_LEVEL = 3;

//各技能等级对应数值
const TPower RegenerationSpeedStage[MAX_REGENERATION_SPEED_LEVEL + 1] = { 1,1.05,1.1,1.15,1.2,1.25 };
const TPower SpeedStage[MAX_EXTENDING_SPEED_LEVEL + 1] = { 1,1.1,1.2,1.3,1.4,1.5 };
const TPower ExtraControlStage[MAX_EXTRA_CONTROL_LEVEL + 1] = { 0,0.5,1,1.5 };
const TPower DefenceStage[MAX_DEFENCE_LEVEL + 1] = { 1.5,1.4,1.3,1.2 };

//各个技能升级所需科创点数
const TResourceD RegenerationSpeedUpdateCost[MAX_REGENERATION_SPEED_LEVEL] = { 2,4,6,8,10 };
const TResourceD ExtendingSpeedUpdateCost[MAX_EXTENDING_SPEED_LEVEL] = { 2,4,6,8,10 };
const TResourceD ExtraControlStageUpdateCost[MAX_EXTRA_CONTROL_LEVEL] = { 3,5,7 };
const TResourceD DefenceStageUpdateCost[MAX_DEFENCE_LEVEL] = { 3,5,7 };

enum CellStrategy
{
	Normal    //初始状态
	, Attack  //攻击  
	, Defence //防御
	, Grow    //发育
};

//细胞策略改变花费科技点
const TTechPoint CellChangeCost[4][4] =
{
	//TO        N    A    D    G
	/*F  N */   0,   2,   2,   2,
	/*R  A */   3,   0,   5,   5,
	/*O  D */   3,   5,   0,   5,
	/*M  G */   3,   5,   5,   0
};

//细胞对峙消耗倍率
const TPower CellConfrontPower[4][4] =
{
	//TO        N    A    D    G
	/*F  N */  1.0, 1.0, 1.0, 1.0,
	/*R  A */  2.0, 1.0, 1.0, 5.0,
	/*O  D */  1.0, 3.0, 1.0, 1.0,
	/*M  G */  2.0, 1.0, 1.0, 1.0
};

//细胞压制消耗倍率
const TPower CellSupressPower[4][4] =
{
	//TO        N    A    D    G
	/*F  N */  1.5, 1.5, 1.5, 1.5,
	/*R  A */  3.0, 1.5, 1.5, 6.0,
	/*O  D */  1.0, 1.0, 1.0, 1.0,
	/*M  G */  3.0, 1.5, 1.5, 1.5
};

//细胞资源生长倍率
const TPower CellStrategyRegenerate[4] =
{
	//    N    A    D    G
		 1.0, 1.0, 0.5, 1.5
};

const TPower TentacleDecay[4] = 
{
	//触手数量   0    1    2    3
	           1.0, 1.0, 0.8, 0.6
};

enum TPlayerProperty
{
	RegenerationSpeed    //再生速度
	, ExtendingSpeed //延伸速度
	, ExtraControl   //额外控制数
	, CellWall        //防御等级
};

enum TentacleState
{
	Extending           //延伸中
	, Attacking          //攻击中（面对对方触手）
	, Backing            //退后中（被打退）
	, Confrontation      //对峙中
	, Arrived            //已到达目的地
	, AfterCut           //被切断
};

struct TPoint
{
	TPosition  m_x;
	TPosition  m_y;
};


TPoint operator-(const TPoint& p1, const TPoint& p2);

//计算欧式距离
TLength getDistance(const TPoint& p1, const TPoint& p2);

enum CellType  //细胞种类的枚举
{
	Alpha = 0,
	Beta_1,
	Beta_2,
	Gamma_1,
	Gamma_2
};

struct CellInfo
{
	TCellID id;
	CellType type;
	TPlayerID owner;
	CellStrategy strategy;

	TResourceD resource;
	TResourceD occupyPoint;  //只有中立时才有意义
	TPlayerID occupyOwner;//只有中立时才有意义

	TPoint position;

	TResourceD maxResource;
	int maxTentacleNum;  //最大触手数量
	int currTentacleNum;
	TPower techSpeed;    //科创点数是资源再生速率的几倍
};

struct PlayerInfo
{
	TPlayerID id;

	int rank;          //排名/按总资源/包括触手上的
	set<TCellID> cells; //所有的细胞
	TResourceD technologyPoint;        //科技点数

	TLevel RegenerationSpeedLevel;      //再生倍率等级
	TLevel ExtendingSpeedLevel;         //延伸速度等级
	TLevel ExtraControlLevel;           //额外操作数等级
	TLevel DefenceLevel;          //防御等级

	size_t maxControlNumber;    //最大控制数

	bool alive;                  //是否还活着
};

struct TentacleInfo
{
	bool exist; //是否存在
	TCellID         sourceCell;              //源同学
	TCellID         targetCell;              //目标同学
	TentacleState   state;                     //触手状态
	TLength         maxlength;                     //触手长度（由源/目标决定）
	TResourceD      resource;                   //当前资源      （切断前有效）
	TResourceD      frontResource;              //切断后前方资源（切断后有效）
	TResourceD      backResource;               //切断后后方资源（切断后有效）
};

struct TBarrier
{
	TPoint m_beginPoint;
	TPoint m_endPoint;
};

class BaseMap
{
public:
	void   setID(TMapID _id) { id = _id; }
	TMap   getWidth()  const { return m_width; }
	TMap   getHeigth() const { return m_height; }
	bool   passable(TPoint p1, TPoint p2)   //判断触手能否连接这两个点
	{
		for (auto b : m_barrier)
		{
			//快速排斥实验
			int minFX = max(min(p1.m_x, p2.m_x), min(b.m_beginPoint.m_x, b.m_endPoint.m_x));
			int maxFX = min(max(p1.m_x, p2.m_x), max(b.m_beginPoint.m_x, b.m_endPoint.m_x));
			int minFY = max(min(p1.m_y, p2.m_y), min(b.m_beginPoint.m_y, b.m_endPoint.m_y));
			int maxFY = min(max(p1.m_y, p2.m_y), max(b.m_beginPoint.m_y, b.m_endPoint.m_y));
			if (minFX > maxFX || minFY > maxFY)
				return false;
			//跨越实验
			if (cross(p1 - b.m_beginPoint, b.m_endPoint - b.m_beginPoint)*cross(b.m_endPoint - b.m_beginPoint, p2 - b.m_beginPoint) >= 0
				|| cross(b.m_beginPoint - p1, p2 - p1)*cross(p2 - p1, b.m_endPoint - p1) >= 0)
				return false;
		}
		return true;
	}
	bool   isPosValid(TPoint p) { return isPosValid(p.m_x, p.m_y); }             //判断点是否越界
	bool   isPosValid(int x, int y) { return x >= 0 && x < m_width&&y >= 0 && y <= m_height; }

	const  vector<TPoint>  &  getStudentPos() const { return m_studentPos; }
	const  vector<TBarrier>&  getBarriar()    const { return m_barrier; }
//protected:
	string             id;                  //记录地图的id，由game赋值，被init函数使用，选择对应的文件
	TMap               m_width;
	TMap               m_height;
	vector<TPoint>     m_studentPos;        //只设定细胞的坐标，之后的势力分配交给game
	vector<TBarrier>   m_barrier;
private:
	int cross(const TPoint& p1, const TPoint& p2) { return p1.m_x*p2.m_y - p1.m_y*p2.m_x; }//叉乘
	int min(int a, int b) { return a < b ? a : b; }
	int max(int a, int b) { return a < b ? b : a; }
};

//命令种类
enum CommandType
{
	upgrade          //升级属性
	, changeStrategy //改变细胞策略
	, addTentacle    //添加触手
	, cutTentacle    //切断触手
};

//保存命令相关信息
struct Command
{
	Command(CommandType _type, initializer_list<int> _parameters) :
		type(_type), parameters(_parameters) {}
	Command(CommandType _type, vector<int> _parameters) :
		type(_type), parameters(_parameters) {}
	Command(){}
	CommandType type;
	vector<int> parameters;  //参数
};

//命令列表
class CommandList
{
public:
	void addCommand(CommandType _type, initializer_list<int> _parameters)
	{
		m_commands.emplace_back(_type, _parameters);
	}
	void addCommand(CommandType _type, vector<int> _parameters)
	{
		Command c;
		c.type = _type;
		c.parameters = _parameters;
		m_commands.push_back(c);
	}
	void addCommand(CommandType _type, int para1)
	{
		Command c;
		c.type = _type;
		c.parameters.push_back(para1);
		m_commands.push_back(c);
	}
	void addCommand(CommandType _type, int para1, int para2)
	{
		Command c;
		c.type = _type;
		c.parameters.push_back(para1);
		c.parameters.push_back(para2);
		m_commands.push_back(c);
	}
	void addCommand(CommandType _type, int para1, int para2, int para3)
	{
		Command c;
		c.type = _type;
		c.parameters.push_back(para1);
		c.parameters.push_back(para2);
		c.parameters.push_back(para3);
		m_commands.push_back(c);
	}
	void removeCommand(int n)
	{
		m_commands.erase(m_commands.begin() + n);
	}
	int  size() const { return int(m_commands.size()); }
	vector<Command>::iterator begin() { return m_commands.begin(); }
	vector<Command>::iterator end() { return m_commands.end(); }
	vector<Command>::const_iterator  begin()const { return m_commands.cbegin(); }
	vector<Command>::const_iterator end() const  { return m_commands.cend(); }
	Command& operator[](int n)
	{
		if (n < 0 || size() <= n)
			throw std::out_of_range("访问命令时越界");
		return m_commands[n];
	}
private:
	vector<Command> m_commands;
};

std::ostream& operator<<(std::ostream& os, const CommandList& cl);

struct Info
{
	int playerSize;  //总玩家数
	int playerAlive;  //剩余玩家数
	int myID;           //选手ID号
	int myMaxControl;   //最大操作数
	
	TRound round;     //回合数
	CommandList myCommandList;
	vector<PlayerInfo> playerInfo;   //势力信息
	vector<CellInfo> cellInfo; //同学信息
	int cellNum;    //细胞总数量
	vector<vector<TentacleInfo> > tentacleInfo; //触手信息
	BaseMap* mapInfo;  //地图信息
};

#endif // DEFINITION_H