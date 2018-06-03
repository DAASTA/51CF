#include "ai.h"
#include "definition.h"
#include "user_toolbox.h"
#include <iostream>
#include <vector>

void player_ai(Info& info)
{
	Command c;
	TResourceD leftTech = info.playerInfo[info.myID].technologyPoint;
	for (TCellID mycell : info.playerInfo[info.myID].cells)
	{
		int enemycnt, friendcnt;
		enemycnt = friendcnt = 0;
		for (int i = 0; i != info.cellNum; ++i)
		{
			if (info.tentacleInfo[i][mycell].exist)
				if (info.cellInfo[i].owner == info.myID)
					friendcnt++;
				else
					enemycnt++;
		}

		if (info.cellInfo[mycell].resource > 40
			&& info.cellInfo[mycell].strategy != Attack
			&& CellChangeCost[info.cellInfo[mycell].strategy][Attack] < leftTech)
		{
			leftTech -= CellChangeCost[info.cellInfo[mycell].strategy][Attack];
			info.myCommandList.addCommand(changeStrategy, { mycell,Attack });
		}

		else if (info.cellInfo[mycell].resource < 20
			&& info.cellInfo[mycell].strategy != Grow
			&& CellChangeCost[info.cellInfo[mycell].strategy][Grow] < leftTech)
		{
			leftTech -= CellChangeCost[info.cellInfo[mycell].strategy][Grow];
			info.myCommandList.addCommand(changeStrategy, { mycell,Grow });
		}

		if (info.cellInfo[mycell].resource > 40 && info.cellInfo[mycell].strategy == Attack
			&& info.cellInfo[mycell].currTentacleNum < info.cellInfo[mycell].maxTentacleNum)
		{
			TCellID minCell = -1;
			TResourceD minResource = 1000;
			for (int i = 0; i != info.cellNum; ++i)
			{
				if (info.cellInfo[i].owner != info.myID
					&& !info.tentacleInfo[info.myID][i].exist)
				{
					if (info.cellInfo[i].resource < minResource)
					{
						minCell = i;
						minResource = info.cellInfo[i].resource;
					}
				}
				if (minCell != -1)
					info.myCommandList.addCommand(addTentacle, { mycell,i });
			}
		}

		if (info.cellInfo[mycell].resource < 10 && enemycnt != 0)
		{
			for (int i = 0; i != info.cellNum; ++i)
				if (info.tentacleInfo[mycell][i].exist)
					info.myCommandList.addCommand(cutTentacle, { mycell,i,int(info.tentacleInfo[mycell][i].resource) });
		}
	}
}