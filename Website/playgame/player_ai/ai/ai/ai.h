#pragma once
/* FC15 2017 ai.h
*
*/

#ifndef _FC15_AI_H_
#define _FC15_AI_H__

#include "definition.h"

#ifdef _MSC_VER
extern "C" _declspec(dllexport) void player_ai(Info& info);
#endif


#ifdef __GNUC__
extern "C" void player_ai(Info& info);

#endif


#endif