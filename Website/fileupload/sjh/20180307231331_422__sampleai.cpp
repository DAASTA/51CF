#include "ai.h"
#include "definition.h"
#include "user_toolbox.h"
#include <iostream>
#include <vector>
#include <time.h>
#include <stdlib.h>

void player_ai(Info& info)
{
	srand(time(0) * (int(info.cellInfo[info.myID].resource)*info.cellInfo[info.myID + 1].resource) + info.myID); //乱打的只为随机
	for (int i = 0; i != info.myMaxControl; ++i)
	{
		Command C;
		C.type = static_cast<CommandType>(rand() % 4);
		switch (C.type)
		{
		case addTentacle:
			info.myCommandList.addCommand(addTentacle, rand() % info.cellNum, rand() % info.cellNum);
			break;
		case cutTentacle:
			info.myCommandList.addCommand(cutTentacle, rand() % info.cellNum, rand() % info.cellNum, rand() % 50);
			break;
		case changeStrategy:
			info.myCommandList.addCommand(changeStrategy, rand() % info.cellNum, rand() % 4);
			break;
		case upgrade:
			info.myCommandList.addCommand(upgrade, rand() % 4);
		default:
			break;
		}
	}
}
