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
typedef double TResourceD;  //double ����Դ���������ڲ�����
typedef int    TResourceI;  //int    ����Դ����������ʾ
typedef double TTechPoint;  //�Ƽ�����

typedef double TLength;
typedef int    TCellID;
typedef int    TPlayerID;
typedef int    TTentacleID;

typedef int    TPosition;

typedef string TMapID;
typedef int    TMap;
typedef int    TLevel;  //�������Եȼ�
typedef int    TRound;  //�غ���
typedef double TPower;  //����
typedef int    TTentacleNum;


//�����ܶ�
const double       Density = 0.1;
const TSpeed       BaseExtendSpeed = 3;
const TSpeed       BaseFrontSpeed = 12;
const TSpeed       BaseBackSpeed = 20;
const TLevel       STUDENT_LEVEL_COUNT = 5;
const TResourceI   MAX_RESOURCE = 200;
const TSpeed       BASE_REGENERETION_SPEED[STUDENT_LEVEL_COUNT]{ 1,1.5,2,2.5,3 };
const TTentacleNum MAX_TENTACLE_NUMBER[STUDENT_LEVEL_COUNT]{ 1,2,2,3,3 };  //���촥������
const TResourceI   STUDENT_STAGE[STUDENT_LEVEL_COUNT + 1]{ 0 ,10,40,80,150,MAX_RESOURCE };
const int          NO_DATA = -1;
const TPlayerID        Neutral = NO_DATA;

//����ܵȼ�
const TLevel MAX_REGENERATION_SPEED_LEVEL = 5;
const TLevel MAX_EXTENDING_SPEED_LEVEL = 5;
const TLevel MAX_EXTRA_CONTROL_LEVEL = 3;
const TLevel MAX_DEFENCE_LEVEL = 3;

//�����ܵȼ���Ӧ��ֵ
const TPower RegenerationSpeedStage[MAX_REGENERATION_SPEED_LEVEL + 1] = { 1,1.05,1.1,1.15,1.2,1.25 };
const TPower SpeedStage[MAX_EXTENDING_SPEED_LEVEL + 1] = { 1,1.1,1.2,1.3,1.4,1.5 };
const TPower ExtraControlStage[MAX_EXTRA_CONTROL_LEVEL + 1] = { 0,0.5,1,1.5 };
const TPower DefenceStage[MAX_DEFENCE_LEVEL + 1] = { 1.5,1.4,1.3,1.2 };

//����������������ƴ�����
const TResourceD RegenerationSpeedUpdateCost[MAX_REGENERATION_SPEED_LEVEL] = { 2,4,6,8,10 };
const TResourceD ExtendingSpeedUpdateCost[MAX_EXTENDING_SPEED_LEVEL] = { 2,4,6,8,10 };
const TResourceD ExtraControlStageUpdateCost[MAX_EXTRA_CONTROL_LEVEL] = { 3,5,7 };
const TResourceD DefenceStageUpdateCost[MAX_DEFENCE_LEVEL] = { 3,5,7 };

enum CellStrategy
{
	Normal    //��ʼ״̬
	, Attack  //����  
	, Defence //����
	, Grow    //����
};

//ϸ�����Ըı仨�ѿƼ���
const TTechPoint CellChangeCost[4][4] =
{
	//TO        N    A    D    G
	/*F  N */   0,   2,   2,   2,
	/*R  A */   3,   0,   5,   5,
	/*O  D */   3,   5,   0,   5,
	/*M  G */   3,   5,   5,   0
};

//ϸ���������ı���
const TPower CellConfrontPower[4][4] =
{
	//TO        N    A    D    G
	/*F  N */  1.0, 1.0, 1.0, 1.0,
	/*R  A */  2.0, 1.0, 1.0, 5.0,
	/*O  D */  1.0, 3.0, 1.0, 1.0,
	/*M  G */  2.0, 1.0, 1.0, 1.0
};

//ϸ��ѹ�����ı���
const TPower CellSupressPower[4][4] =
{
	//TO        N    A    D    G
	/*F  N */  1.5, 1.5, 1.5, 1.5,
	/*R  A */  3.0, 1.5, 1.5, 6.0,
	/*O  D */  1.0, 1.0, 1.0, 1.0,
	/*M  G */  3.0, 1.5, 1.5, 1.5
};

//ϸ����Դ��������
const TPower CellStrategyRegenerate[4] =
{
	//    N    A    D    G
		 1.0, 1.0, 0.5, 1.5
};

const TPower TentacleDecay[4] = 
{
	//��������   0    1    2    3
	           1.0, 1.0, 0.8, 0.6
};

enum TPlayerProperty
{
	RegenerationSpeed    //�����ٶ�
	, ExtendingSpeed //�����ٶ�
	, ExtraControl   //���������
	, CellWall        //�����ȼ�
};

enum TentacleState
{
	Extending           //������
	, Attacking          //�����У���ԶԷ����֣�
	, Backing            //�˺��У������ˣ�
	, Confrontation      //������
	, Arrived            //�ѵ���Ŀ�ĵ�
	, AfterCut           //���ж�
};

struct TPoint
{
	TPosition  m_x;
	TPosition  m_y;
};


TPoint operator-(const TPoint& p1, const TPoint& p2);

//����ŷʽ����
TLength getDistance(const TPoint& p1, const TPoint& p2);

enum CellType  //ϸ�������ö��
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
	TResourceD occupyPoint;  //ֻ������ʱ��������
	TPlayerID occupyOwner;//ֻ������ʱ��������

	TPoint position;

	TResourceD maxResource;
	int maxTentacleNum;  //���������
	int currTentacleNum;
	TPower techSpeed;    //�ƴ���������Դ�������ʵļ���
};

struct PlayerInfo
{
	TPlayerID id;

	int rank;          //����/������Դ/���������ϵ�
	set<TCellID> cells; //���е�ϸ��
	TResourceD technologyPoint;        //�Ƽ�����

	TLevel RegenerationSpeedLevel;      //�������ʵȼ�
	TLevel ExtendingSpeedLevel;         //�����ٶȵȼ�
	TLevel ExtraControlLevel;           //����������ȼ�
	TLevel DefenceLevel;          //�����ȼ�

	size_t maxControlNumber;    //��������

	bool alive;                  //�Ƿ񻹻���
};

struct TentacleInfo
{
	bool exist; //�Ƿ����
	TCellID         sourceCell;              //Դͬѧ
	TCellID         targetCell;              //Ŀ��ͬѧ
	TentacleState   state;                     //����״̬
	TLength         maxlength;                     //���ֳ��ȣ���Դ/Ŀ�������
	TResourceD      resource;                   //��ǰ��Դ      ���ж�ǰ��Ч��
	TResourceD      frontResource;              //�жϺ�ǰ����Դ���жϺ���Ч��
	TResourceD      backResource;               //�жϺ����Դ���жϺ���Ч��
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
	bool   passable(TPoint p1, TPoint p2)   //�жϴ����ܷ�������������
	{
		for (auto b : m_barrier)
		{
			//�����ų�ʵ��
			int minFX = max(min(p1.m_x, p2.m_x), min(b.m_beginPoint.m_x, b.m_endPoint.m_x));
			int maxFX = min(max(p1.m_x, p2.m_x), max(b.m_beginPoint.m_x, b.m_endPoint.m_x));
			int minFY = max(min(p1.m_y, p2.m_y), min(b.m_beginPoint.m_y, b.m_endPoint.m_y));
			int maxFY = min(max(p1.m_y, p2.m_y), max(b.m_beginPoint.m_y, b.m_endPoint.m_y));
			if (minFX > maxFX || minFY > maxFY)
				return false;
			//��Խʵ��
			if (cross(p1 - b.m_beginPoint, b.m_endPoint - b.m_beginPoint)*cross(b.m_endPoint - b.m_beginPoint, p2 - b.m_beginPoint) >= 0
				|| cross(b.m_beginPoint - p1, p2 - p1)*cross(p2 - p1, b.m_endPoint - p1) >= 0)
				return false;
		}
		return true;
	}
	bool   isPosValid(TPoint p) { return isPosValid(p.m_x, p.m_y); }             //�жϵ��Ƿ�Խ��
	bool   isPosValid(int x, int y) { return x >= 0 && x < m_width&&y >= 0 && y <= m_height; }

	const  vector<TPoint>  &  getStudentPos() const { return m_studentPos; }
	const  vector<TBarrier>&  getBarriar()    const { return m_barrier; }
//protected:
	string             id;                  //��¼��ͼ��id����game��ֵ����init����ʹ�ã�ѡ���Ӧ���ļ�
	TMap               m_width;
	TMap               m_height;
	vector<TPoint>     m_studentPos;        //ֻ�趨ϸ�������֮꣬����������佻��game
	vector<TBarrier>   m_barrier;
private:
	int cross(const TPoint& p1, const TPoint& p2) { return p1.m_x*p2.m_y - p1.m_y*p2.m_x; }//���
	int min(int a, int b) { return a < b ? a : b; }
	int max(int a, int b) { return a < b ? b : a; }
};

//��������
enum CommandType
{
	upgrade          //��������
	, changeStrategy //�ı�ϸ������
	, addTentacle    //��Ӵ���
	, cutTentacle    //�жϴ���
};

//�������������Ϣ
struct Command
{
	Command(CommandType _type, initializer_list<int> _parameters) :
		type(_type), parameters(_parameters) {}
	Command(CommandType _type, vector<int> _parameters) :
		type(_type), parameters(_parameters) {}
	Command(){}
	CommandType type;
	vector<int> parameters;  //����
};

//�����б�
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
			throw std::out_of_range("��������ʱԽ��");
		return m_commands[n];
	}
private:
	vector<Command> m_commands;
};

std::ostream& operator<<(std::ostream& os, const CommandList& cl);

struct Info
{
	int playerSize;  //�������
	int playerAlive;  //ʣ�������
	int myID;           //ѡ��ID��
	int myMaxControl;   //��������
	
	TRound round;     //�غ���
	CommandList myCommandList;
	vector<PlayerInfo> playerInfo;   //������Ϣ
	vector<CellInfo> cellInfo; //ͬѧ��Ϣ
	int cellNum;    //ϸ��������
	vector<vector<TentacleInfo> > tentacleInfo; //������Ϣ
	BaseMap* mapInfo;  //��ͼ��Ϣ
};

#endif // DEFINITION_H