#include "definition.h"
#include <cmath>
TPoint operator-(const TPoint& p1, const TPoint& p2)
{
	TPoint ret;
	ret.m_x = p1.m_x - p2.m_x;
	ret.m_y = p1.m_y - p2.m_y;
	return ret;
}

TLength getDistance(const TPoint& p1, const TPoint& p2)
{
	TPoint distance = p1 - p2;
	return sqrt(distance.m_x*distance.m_x + distance.m_y*distance.m_y);
}

std::ostream& operator<<(std::ostream& os, const CommandList& cl)
{
	vector<string> stg2str{ "Normal","Attack","Defend","Grow" };
	vector<string> upgrade2str{ "Regeneration","ExtendSpeed","ExtraControl","CellWall" };
	for (const Command& c : cl)
	{
		switch (c.type)
		{
		case addLine:
			os << "Add a tentacle from cell " << c.parameters[0] << " to cell " << c.parameters[1] << endl;
			break;
		case cutLine:
			os << "Cut the tentacle from cell " << c.parameters[0] << " to cell " << c.parameters[1] << " at the postion " << c.parameters[2] << endl;
			break;
		case changeStrategy:
			os << "Change the strategy of cell " << c.parameters[0] << " to " << stg2str[c.parameters[1]] << endl;
			break;
		case upgrade:
			os << "Upgrade the ability of cell " << stg2str[c.parameters[0]] << endl;
		default:
			break;
		}
	}
	return os;
}

