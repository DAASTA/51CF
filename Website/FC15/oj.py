#coding=utf-8
import os, time, random, signal
import threading
from FC15.models import FileInfo, AIInfo, GameRecord, UserInfo
import sys


IS_RUNNING = 0
GAME_RUNNING = 0
#COMPILE_MODE = 'VS'
COMPILE_MODE = 'G++'
FILE_SUFFIX = 'so'
RECORD_SUFFIX = 'json'
DEFAULT_RECORD_FILENAME = 'log.json'


class SingleGameInfo(object):
    username = ''
    ai_list = []


# Start running
def run():
    global IS_RUNNING
    if IS_RUNNING == 0:
        IS_RUNNING = 1
        t = threading.Thread(target = compile_all)
        t.start()


def run_game_queue():
    global GAME_RUNNING
    if GAME_RUNNING == 0:
        GAME_RUNNING = 1
        t = threading.Thread(target = run_allgame)
        t.start()


# Copy file
def copy_file(username, file_name):
    global COMPILE_MODE
    source_dir = 'fileupload/{0}/{1}'.format(username, file_name)
    if COMPILE_MODE == 'VS':
        destin_dir = 'cpp_proj/ai/ai.cpp'
    if COMPILE_MODE == 'G++':
        destin_dir = 'AI_SDK/ai.cpp'
    if os.path.isfile(source_dir):
        open(destin_dir, 'wb').write(open(source_dir, 'rb').read())
        return True
    else:
        return False


# Copy executable file
def copy_exe(username, file_name):
    global FILE_SUFFIX
    global COMPILE_MODE
    if COMPILE_MODE == 'VS':
        source_dir = 'cpp_proj/Release/ai.' + FILE_SUFFIX
    if COMPILE_MODE == 'G++':
        source_dir = 'AI_SDK/ai.' + FILE_SUFFIX
    destin_dir = 'fileupload/{0}/{1}.{2}'.format(username, file_name[:-3], FILE_SUFFIX)
    if os.path.isfile(source_dir):
        open(destin_dir, 'wb').write(open(source_dir, 'rb').read())
        return True
    else:
        return False


# Copy executable file to /playgame directory
def store_exe(username, file_name, pk):
    global FILE_SUFFIX
    global COMPILE_MODE
    source_dir = 'fileupload/{0}/{1}.{2}'.format(username, file_name[:-3], FILE_SUFFIX)
    destin_dir = 'playgame/lib_ai/{0}.{1}'.format(pk, FILE_SUFFIX)
    if os.path.isfile(source_dir):
        if os.path.exists(destin_dir):
            os.remove(destin_dir)
        open(destin_dir, 'wb').write(open(source_dir, 'rb').read())
        return True
    else:
        return False


# Delete copied executable file in /playgame directory
def delete_exe(file_object):
    global FILE_SUFFIX
    if file_object.is_compile_success == 'Successfully compiled':
        if os.path.exists('/playgame/lib_ai/{0}.{1}'.format(file_object.pk, FILE_SUFFIX)):
            os.remove('/playgame/lib_ai/{0}.{1}'.format(file_object.pk, FILE_SUFFIX))


# Compile all the file
def compile_all():
    def handler(signum, frame):
        raise AssertionError

    global IS_RUNNING
    if IS_RUNNING == 0:
        return
    is_done = True
    while is_done:
        print('Compile round running ...')
        is_done = False
        all_file = FileInfo.objects.filter(is_compiled__exact = 'Not compiled')
        if all_file:
            pass
        else:
            break
        for file in all_file:
            username = file.username
            if file.is_compiled == 'Not compiled':
                print('Compiling AI: name={0}, author={1}'.format(file.filename, file.username))
                is_done = True
                copy_result = copy_file(file.username, file.exact_name)
                if copy_result:
                    global COMPILE_MODE
                    if COMPILE_MODE == 'VS':
                        compile_result = os.system('devenv cpp_proj/ai.sln /rebuild > result.txt')
                    if COMPILE_MODE == 'G++':
                        if file.is_compile_success == '':
                            compile_result = os.system('./compile_ai') # use shell
                        else:
                            file.is_compiled = 'Compiled'
                        file.save()
                    file.is_compiled = 'Compiled'
                if file.is_compile_success == '':
                    if os.path.exists('AI_SDK/ai.so'):
                        file.is_compile_success = 'Successfully compiled'
                        copy_exe(file.username, file.exact_name)
                        store_exe(file.username, file.exact_name, file.pk)
                        os.remove('AI_SDK/ai.so')
                    else:
                        file.is_compile_success = 'Compile Error'
                else:
                    file.is_compiled = 'Compiled'
            file.is_compiled = 'Compiled'
            file.save()
    IS_RUNNING = 0
    print('Round finished ..........')


def run_allgame():
    global GAME_RUNNING
    if GAME_RUNNING == 0:
        return
    is_done = True
    while is_done:
        is_done = False
        all_record = GameRecord.objects.all()
        for record in all_record:
            if record.state == 'Unstarted':
                is_done = True
                ai1 = record.AI1
                ai2 = record.AI2
                ai3 = record.AI3
                ai4 = record.AI4
                # Edit config file
                file = '/home/songjh/playgame/config_gnu.ini'

                with open(file, 'w') as f:
                    f.write('../map/map_2.txt\n')
                    f.write('4\n')
                    f.write('../lib_ai/{0}.so\n'.format(ai1.strip()))
                    f.write('../lib_ai/{0}.so\n'.format(ai2.strip()))
                    f.write('../lib_ai/{0}.so\n'.format(ai3.strip()))
                    f.write('../lib_ai/{0}.so\n'.format(ai4.strip()))
                    f.write(record.AI1_name.strip() + '\n')
                    f.write(record.AI2_name.strip() + '\n')
                    f.write(record.AI3_name.strip() + '\n')
                    f.write(record.AI4_name.strip() + '\n')

                # Launch main logic, using shell
                os.system('./run_logic')
                # Copy record file is possible
                source_dir = '/home/songjh/playgame/log_json/log.json'
                destin_dir = '/home/songjh/gamerecord/{0}'.format(record.filename)
                destin_dir2 = '/home/songjh/static/gamerecord/{0}'.format(record.filename)
                if os.path.exists(source_dir):
                    record.state = 'Success'
                    open(destin_dir, 'wb').write(open(source_dir, 'rb').read())
                    open(destin_dir2, 'wb').write(open(source_dir, 'rb').read())
                    os.remove(source_dir)
                else:
                    record.state = 'Failure'
                record.save()
    GAME_RUNNING = 0


# Copy all available executable file
def copy_all_exe():
    file_available = FileInfo.objects.filter(is_compile_success__exact = 'Successfully compiled')
    for file in file_available:
        store_exe(file.username, file.exact_name, file.pk)


# Add game infomation into waiting queue
def play_game(ai_list, username):
    global GAME_RUNNING
    queue_item = SingleGameInfo()
    queue_item.ai_list = ai_list
    queue_item.username = username
    GAME_QUEUE.put(queue_item)
    if GAME_RUNNING == 0:
        GAME_RUNNING = 1
        t = threading.Thread(target = run_game)
        t.start()


# Launch logic once
def launch_game(ai_list, username):
    startgame_failure = -1
    result_success = 0
    result_runtimeerror = 1

    os.system('./run_logic')


def write_log(log_str):
    file = 'server.log'
    with open(file, 'w+') as f:
        f.write(log_str)
