#coding=utf-8
from django.shortcuts import render, get_object_or_404, render_to_response
from django.http import HttpResponse, HttpResponseRedirect, StreamingHttpResponse, JsonResponse
from django.template import RequestContext
from django.contrib import messages
from django.core.mail import send_mail

from FC15.models import UserInfo, TeamInfo, FileInfo, BlogPost, EmailActivate, PasswordReset, TeamRequest, GameRecord, RankingList
from FC15.forms import BlogPostForm, UserLoginForm, UserRegistForm, FileUploadForm, CreateTeamForm, ResetPasswordForm, ChangeForm, TeamRequestForm, ResultUploadForm
from FC15.sendmail import mail_activate, password_reset, random_string
from FC15.forms import flash
from FC15.oj import run, copy_all_exe, play_game, delete_exe, FILE_SUFFIX, run_game_queue, run_allgame, IS_RUNNING, compile_all
import time, os, random
from django.views.decorators.csrf import csrf_exempt


import sys
default_encoding = 'utf-8'
if default_encoding != sys.getdefaultencoding():
    reload(sys)
    sys.setdefaultencoding(default_encoding)


AUTO_COMPILE = True
EMAIL_ACTIVATE = True
TSINGHUA_ONLY = True
MAX_TEAM_MEMBER_NUMBER = 3
MAX_SELECTED_AI_NUMBER = 1


# All of the views

# Home page
def home(request):
    username = request.COOKIES.get('username', '')
    posts1 = BlogPost.objects.all()[: 2]
    posts2 = BlogPost.objects.all()[2: 4]
    return render(request, 'home.html', {'posts1': posts1, 'posts2': posts2, 'username': username})


# Login
def login(request):
    current_username = request.COOKIES.get('username', '')
    if current_username != '':
        flash(request, 'Error', 'You have already login! Please logout first.')
        return HttpResponseRedirect('/index/')
    if request.method == 'POST':
        userform = UserLoginForm(request.POST)
        if userform.is_valid():
            username = userform.cleaned_data['username']
            password = userform.cleaned_data['password']

            user = UserInfo.objects.filter(username__exact = username, password__exact = password)

            if user:
                user_exact = UserInfo.objects.get(username = username, password = password)
                if user_exact.activated:
                    response = HttpResponseRedirect('/index/')
                    # User will automatically login within 1 hour
                    response.set_cookie('username', username, 3600)
                    response.set_cookie('tmp_username', '', 7200)
                    return response
                else:
                    response = HttpResponseRedirect('/login/')
                    response.set_cookie('tmp_username', username, 600)
                    flash(request, 'Error', 'This user account has not been activated!', 'error')
                    return response
            else:
                flash(request, 'Error', 'Incorrect username or password, please retry.', 'error')
    else:
        userform = UserLoginForm()
    return render(request, 'login.html', {'form': userform})


# Logout
def logout(request):
    response = HttpResponseRedirect('/home/')
    flash(request, 'Success', 'Logout successfully', 'success')
    response.delete_cookie('username')
    return response


# Register
def regist(request):
    if request.method == 'POST':
        userform = UserRegistForm(request.POST)
        un = request.POST['username']
        print(un)
        if userform.is_valid():
            username = userform.cleaned_data['username']
            realname = userform.cleaned_data['realname']
            password = userform.cleaned_data['password']
            str_email = userform.cleaned_data['email']
            stu_number = userform.cleaned_data['stu_number']
            password_confirm = userform.cleaned_data['password_confirm']

            if password == password_confirm:
                existing_user = UserInfo.objects.filter(username__exact = username)
                username_invalid = False
                if existing_user:
                    for user in existing_user:
                        if user.activated:
                            username_invalid = True
                if username_invalid:
                    flash(request, 'Error', 'The username already exists!', 'error')
                    return render(request, 'regist.html', {'form': userform})

                existing_realname = UserInfo.objects.filter(realname__exact = realname, activated = True)
                realname_invalid = False
                if existing_realname:
                    for user in existing_realname:
                        if user.activated:
                            existing_realname = True;
                if existing_realname:
                    flash(request, 'Error', 'The realname already exists!', 'error')
                    return render(request, 'regist.html', {'form': userform})

                existing_email = UserInfo.objects.filter(email__exact = str_email)
                email_invalid = False
                if existing_email:
                    for email in existing_email:
                        if email.activated:
                            email_invalid = True
                if email_invalid:
                    flash(request, 'Error', 'The email address has already been used!', 'error')
                    return render(request, 'regist.html', {'form': userform})

                # Judge if the student number is valids
                if stu_number.isdigit() and len(stu_number) == 10:
                    pass
                else:
                    flash(request, 'Error', 'Incorrect format of student number!')
                    return render(request, 'regist.html', {'form': userform})

                existing_stunumber = UserInfo.objects.filter(stu_number__exact = stu_number)
                stunumber_invalid = False
                if existing_stunumber:
                    for stunumber in existing_stunumber:
                        if stunumber.activated:
                            stunumber_invalid = True
                if stunumber_invalid:
                    flash(request, 'Error', 'One student number can only be used once!', 'error')
                    return render(request, 'regist.html', {'form': userform})

                # Judge if the email address belongs to Tsinghua mailbox
                if TSINGHUA_ONLY:
                    low_email = str_email.lower()
                    if len(low_email) < 15 or low_email[-15:] != 'tsinghua.edu.cn':
                        flash(request, 'Error', 'Only addresses of Tsinghua mailbox will be accepted.')
                        return render(request, 'regist.html', {'form': userform})

                print('Regist: username={0}, realname={1}'.format(username, realname))

                # Delete user that are not activated and has the same information
                existing_username = UserInfo.objects.filter(username__exact = username, activated = False)
                for item in existing_username:
                    item.delete()
                existing_email = UserInfo.objects.filter(email__exact = str_email, activated = False)
                for item in existing_email:
                    item.delete()
                existing_stunumber = UserInfo.objects.filter(stu_number__exact = stu_number, activated = False)
                for item in existing_stunumber:
                    item.delete()
                existing_realname = UserInfo.objects.filter(realname__exact = realname, activated = False)
                for item in existing_realname:
                    item.delete()

                # Switch whether the account should be activated with email
                if EMAIL_ACTIVATE:
                    new_user = UserInfo()
                    new_user.username = username
                    new_user.password = password
                    new_user.email = str_email
                    new_user.stu_number = stu_number
                    new_user.realname = realname
                    new_user.activated = False
                    new_user.save()
                    mail_activate(str_email, username)
                    flash(request, 'Success', 'The confirmation email has been successfully sent. Please check you email!')
                else:
                    new_user = UserInfo()
                    new_user.username = username
                    new_user.password = password
                    new_user.email = email
                    new_user.stu_number = stu_number
                    new_user.realname = realname
                    new_user.activated = True
                    new_user.save()
                    flash(request, 'Success', 'Your account has been successfully created.')

                return HttpResponseRedirect('/login/')
            else:
                flash(request, 'Error', 'You should enter the same password!')
                return HttpResponseRedirect('/regist/')
        else:
            flash(request, 'Error', 'Please complete the form and then submit.')
            print('userform is invalid')
    else:
        userform = UserRegistForm()
    return render(request, 'regist.html', {'form': userform})


# Introduction of game rule
def about_rule(request):
    return render(request, 'about_rule.html')


# Introduction for DAASTA
def about_story(request):
    return render(request, 'about_story.html')


# Introduction for the sponsor
def about_sponsor(request):
    return render(request, 'about_sponsor.html')


# Documents of the game
def document(request):
    return render(request, 'document.html')


# Activate account with email
def activate(request, activate_code):
    activate_record = get_object_or_404(EmailActivate, activate_string = activate_code)
    if activate_record:
        username = activate_record.username
        user = get_object_or_404(UserInfo, username = username)
        if user:
            user.activated = True
            user.save()
            activate_record.delete()
            flash(request, 'Success', 'You have successfully activated the account!')
            return HttpResponseRedirect('/login/')
        else:
            flash(request, 'Error', 'Invalid activating code!')
            return HttpResponseRedirect('/home/')
    else:
        return HttpResponse('Invalid activating url!')


# Fill in the request to reset password
def resetrequest(request):
    username = request.COOKIES.get('username', '')
    if request.method == 'POST':
        userform = ResetPasswordForm(request.POST)
        if userform.is_valid():
            username = userform.cleaned_data['username']
            email = userform.cleaned_data['email']
            user = UserInfo.objects.filter(username__exact = username, email__exact = email)
            if user:
                password_reset(email, username)
                flash(request, 'Success', 'The email has been send, please check you email!')
                return HttpResponseRedirect('/home/')
            else:
                flash(request, 'Error', 'Incorrect user information!')
                return HttpResponseRedirect('/resetrequest/')
    else:
        userform = ResetPasswordForm()
    return render(request, 'resetrequest.html', {'username': username, 'form': userform})


# Reset the password
def resetpassword(request, reset_code):
    reset_record = PasswordReset.objects.get(reset_string = reset_code)
    if reset_record:
        user = UserInfo.objects.get(username = reset_record.username)
        user.password = reset_record.new_password
        user.save()
        reset_record.delete()
        flash(request, 'Success', 'Your password has been successfully reset!\nPlease change your password after you login.', 'success')
        return HttpResponseRedirect('/login/')
    else:
        flash(request, 'Error', 'Invalid reset code!', 'error')
        return HttpResponseRedirect('/home/')


# Change the password or email
def change(request):
    username = request.COOKIES.get('username', '')
    if username == '':
        flash(request, 'Error', 'Please login first', 'error')
        return HttpResponseRedirect('/login/')
    user = UserInfo.objects.get(username = username)
    if request.method == 'POST':
        userform = ChangeForm(request.POST)
        if userform.is_valid():
            old_password = userform.cleaned_data['old_password']
            new_password = userform.cleaned_data['new_password']
            confirm_password = userform.cleaned_data['confirm_password']
            if old_password != user.password:
                flash(request, 'Error', 'Incorrect old password!', 'error')
                return render(request, 'change.html', {'username': username, 'form': userform})
            if new_password != confirm_password:
                flash(request, 'Error', 'Please enter the same password!', 'error')
                return render(request, 'change.html', {'username': username, 'form': userform})
            user.password = new_password
            user.email = userform.cleaned_data['email']
            user.save()
            flash(request, 'Success', 'You have successfully changed your account. Please login.', 'success')
            response = HttpResponseRedirect('/login/')
            response.delete_cookie('username')
            return response
        else:
            flash(request, 'Error', 'Please complete the form!', 'error')
            return render(request, 'change.html', {'username': username, 'form': userform})
    else:
        userform = ChangeForm(data = {'email': user.email})
    return render(request, 'change.html', {'username': username, 'form': userform})


# To index page
def index(request):
    username = request.COOKIES.get('username', '')
    if username == '':
        flash(request, 'Error', 'Please login first', 'error')
        return HttpResponseRedirect('/login/')
    posts = BlogPost.objects.filter(username__exact = username)
    files = FileInfo.objects.filter(username__exact = username)
    me = get_object_or_404(UserInfo, username = username)
    if me.team == '':
        warning = 'You have not joined a team yet'
        return render(request, 'userindex.html', {'username': username, 'posts': posts, 'files': files, 'warning': warning})
    else:
        warning = ''
        codes = FileInfo.objects.filter(teamname__exact = me.team).exclude(username = username)
        return render(request, 'userindex.html', {'username': username, 'posts': posts, 'files': files, 'warning': '', 'codes': codes})


# Upload the result of ranking
def resultupload(request):
    username = request.COOKIES.get('username', '')
    if username != 'RunTimeError2' and username != '千叶':
        return render(request, 'pgae404.html')
    if request.method == 'POST':
        userform = ResultUploadForm(request.POST, request.FILES)
        if userform.is_valid():
            myfile = request.FILES.get('file', None)
            if myfile:
                pass
            else:
                flash(request, 'Error', 'Invalid file!', 'error')
                return render(request, 'page500.html')
            print('result file, name = {0}'.format(myfile.name))
            f = open('fileupload/result_ranking.txt', 'wb')
            for chunk in myfile.chunks():
                f.write(chunk)
            f.close()
            validation = checkresult()
            if validation:
                source_dir = 'fileupload/result_ranking.txt'
                destin_dir = 'playgame/log_txt/result_ranking.txt'
                open(destin_dir, 'wb').write(open(source_dir, 'rb').read())
                saverankingresult()
            else:
                flash(request, 'Error', 'Incorrect file format.', 'error')
                return render(request, 'page500.html')
            flash(request, 'Success', 'Result has been successfully uploaded.', 'success')
            return HttpResponseRedirect('/rank/')
        else:
            flash(request, 'Error', 'Invalid file!', 'error')
            return render(request, 'page500.html')
    else:
        userform = FileUploadForm()
    return render(request, 'resultupload.html', {'username': username, 'form': userform})


# Check if the result is valid
def checkresult():
    f = open('fileupload/result_ranking.txt', 'r')
    line1 = f.readline()
    line2 = f.readline()
    is_dll = False
    line1 = line1.strip()
    if line1[-3:] == 'dll':
        is_dll = True
    print('is_dll={0}'.format(is_dll))
    while line1:
        if line1 != 'random':
            if line1 == '' or line1 == '\n' or line1 == '\r\n':
                break
            line1 = line1.strip()
            if is_dll:
                pk = line1[:-4].strip()
            else:
                pk = line1[:-3].strip()
            score = line2.strip()
            if pk.isdigit() and score.isdigit():
                pass
            else:
                print('wrong! pk={0}, score={1}'.format(pk, score))
                return False
        line1 = f.readline()
        line2 = f.readline()
    return True


# Uplaod file
def upload(request):
    username = request.COOKIES.get('username', '')
    if username == '':
        flash(request, 'Error', 'Please login first', 'error')
        return HttpResponseRedirect('/login/')
    if request.method == 'POST':
        userform = FileUploadForm(request.POST, request.FILES)
        if userform.is_valid():
            #limit the size and type of file to be uploaded
            myfile = request.FILES.get('file', None)
            if myfile:
                if myfile.size >= 1048576:
                    flash(request, 'Error', 'File should not be larger than 1 MiB.', 'error')
                    return render(request, 'upload.html', {'username': username, 'form': userform})
                if myfile.name.endswith('.cpp') == False:
                    flash(request, 'Error', 'Only .cpp file will be accepted.', 'error')
                    return render(request, 'upload.html', {'username': username, 'form': userform})
            else:
                flash(request, 'Error', 'File does not exist.', 'error')
                return render(request, 'upload.html', {'username': username, 'form': userform})

            user = get_object_or_404(UserInfo, username = username)
            fileupload = FileInfo()
            fileupload.filename = userform.cleaned_data['filename']
            fileupload.username = username
            fileupload.teamname = user.team
            fileupload.description = userform.cleaned_data['description']
            fileupload.file = userform.cleaned_data['file']
            fileupload.timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
            fileupload.is_compiled = 'Not compiled'
            fileupload.is_compile_success = ''
            fileupload.compile_result = ''
            fileupload.save()
            print('Code uploaded. author={0}, name={1}'.format(username, fileupload.filename))
            flash(request, 'Success', 'You have successfully uploaded the code.', 'success') 
            global AUTO_COMPILE
            if AUTO_COMPILE:
                run()
            return HttpResponseRedirect('/index/')
        else:
            pass
    else:
        userform = FileUploadForm()
        username = request.COOKIES.get('username', '')
        if username == '':
            return HttpResponseRedirect('/login/')
    return render(request, 'upload.html', {'username': username, 'form': userform, 'filename': '', 'description': ''})


# Edit a file
def fileedit(request, pk):
    file = get_object_or_404(FileInfo, pk = pk)
    username = request.COOKIES.get('username', '')
    filename = file.filename
    description = file.description
    if username == '':
        flash(request, 'Error', 'Please login first', 'error')
        return HttpResponseRedirect('/login/')
    if username != file.username:
        flash(request, 'Error', 'You can only edit your own file.', 'error')
        return HttpResponseRedirect('/index/')
    if request.method == 'POST':
        selected = file.selected
        me = get_object_or_404(UserInfo, username = username)
        teams = TeamInfo.objects.filter(teamname__exact = me.team)
        if teams and selected:
            myteam = teams[0]
            if myteam.AI_selected > 0:
                myteam.AI_selected = myteam.AI_selected - 1
                myteam.save()

        userform = FileUploadForm(request.POST, request.FILES)

        #limit the size and type of file to be uploaded
        myfile = request.FILES.get('file', None)
        if myfile:
            if myfile.size >= 1048576:
                flash(request, 'Error', 'File should not be larger than 1 MiB', 'error')
                return render(request, 'upload.html', {'username': username, 'form': userform, 'filename': filename, 'description': description})
            if myfile.name.endswith('.cpp') == False:
                flash(request, 'Error', 'Only .cpp file is accepted.', 'error')
                return render(request, 'upload.html', {'username': username, 'form': userform, 'filename': filename, 'description': description})
        else:
            flash(request, 'Error', 'File does not exist.', 'error')
            return render(request, 'upload.html', {'username': username, 'form': userform, 'filename': filename, 'description': description})

        if userform.is_valid():
            # delete old file
            os.remove(file.path)
            if os.path.exists(file.path[:-4] + '.exe'):
                os.remove(file.path[:-4] + '.exe')
            delete_exe(file) # delete copied executable file in /playgame directory

            file.filename = userform.cleaned_data['filename']
            file.description = userform.cleaned_data['description']
            file.timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
            file.file = userform.cleaned_data['file']
            file.is_compiled = 'Not compiled'
            file.is_compile_success = ''
            file.compile_result = ''
            file.selected = False
            file.save()
            flash(request, 'Success', 'You have successfully edited the file', 'success')
            global AUTO_COMPILE
            if AUTO_COMPILE:
                run()
            return HttpResponseRedirect('/index/')
    else:
        userform = FileUploadForm(data = {'filename': file.filename, 'description': file.description, 'file': file.file})
    return render(request, 'upload.html', {'username': username, 'form': userform, 'filename': filename, 'description': description})


# Delete a file
def filedelete(request, pk):
    file = get_object_or_404(FileInfo, pk = pk)
    username = request.COOKIES.get('username', '')
    if username == '':
        flash(request, 'Error', 'Please login first', 'error')
        return HttpResponseRedirect('/login/')
    if username != file.username:
        flash(request, 'Error', 'You can only delete your own file.', 'error')
        return HttpResponseRedirect('/index/')
    me = get_object_or_404(UserInfo, username = username)

    # Delete source file
    if os.path.exists(file.path):
        os.remove(file.path)
    # Delete executable file in user folder
    global FILE_SUFFIX
    if os.path.exists(file.path[:-4] + '.' + FILE_SUFFIX):
        os.remove(file.path[:-4] + '.' + FILE_SUFFIX)
    # Delete executable file in 'playgame' folder
    if os.path.exists('playgame/{0}.{1}'.format(pk, FILE_SUFFIX)):
        os.remove('playgame/{0}.{1}'.format(pk, FILE_SUFFIX))
    teamname = me.team
    if teamname:
        team = get_object_or_404(TeamInfo, teamname = teamname)
        if file.selected and team.AI_selected > 0:
            team.AI_selected = team.AI_selected - 1
            team.save()
    file.delete()
    flash(request, 'Success', 'You have successfully deleted the file.', 'success')
    return HttpResponseRedirect('/index/')


# Download a file
def filedownload(request ,pk):
    def file_iterator(file_name, chunk_size = 2048):  
        with open(file_name) as f:  
            while True:  
                c = f.read(chunk_size)  
                if c:
                    yield c
                else:
                    break  

    file = get_object_or_404(FileInfo, pk = pk)
    username = request.COOKIES.get('username', '')
    if username == '':
        flash(request, 'Error', 'Please login first', 'error')
        return HttpResponseRedirect('/login/')
    me = get_object_or_404(UserInfo, username = username)
    authors = UserInfo.objects.filter(username__exact = file.username)
    if authors:
        author = UserInfo.objects.get(username = username)
    else:
        author = None
        flash(request, 'Error', 'Invalid code! The author of the code does not exist.')
        return HttpResponseRedirect('/index/')
    if username != file.username:
        if author.team == '' or me.team == '' or author.team != me.team:
            flash(request, 'Error', 'You can only download your own file or code of your teammates!')
            return HttpResponseRedirect('/index/')
    response = StreamingHttpResponse(file_iterator(file.path))  
    response['Content-Type'] = 'application/octet-stream'  
    response['Content-Disposition'] = 'attachment;filename="{0}"'.format(file.origin_name)
    return response


# View all blogs
def viewblogs(request):
    username = request.COOKIES.get('username', '')
    if username == '':
        flash(request, 'Error', 'Please login first', 'error')
        return HttpResponseRedirect('/login/')
    blogs = BlogPost.objects.all()
    return render(request, 'viewblogs.html', {'username': username, 'blogs': blogs})


# Post a blog
def postblog(request):
    username = request.COOKIES.get('username', '')
    if username == '':
        flash(request, 'Error', 'Please login first', 'error')
        return HttpResponseRedirect('/login/')
    if request.method == 'POST':
        userform = BlogPostForm(request.POST)
        if userform.is_valid():
            blogpost = BlogPost()
            blogpost.title = userform.cleaned_data['title']
            blogpost.content = userform.cleaned_data['content']
            blogpost.username = username
            blogpost.timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
            blogpost.save()
            flash(request, 'Success', 'The blog has been successfully posted.')
            return HttpResponseRedirect('/index/')
        else:
            print('Invalid userform')
    else:
        userform = BlogPostForm()
    return render(request, 'blogpost.html', {'username': username, 'form': userform, 'title': '', 'content': ''})


# Return an 'unfinished' message
def unfinished(request):
    return HttpResponse('Oh, this function has not been finished yet!')


# Show the detail of a blog
def blogdetail(request, pk):
    username = request.COOKIES.get('username', '')
    post = get_object_or_404(BlogPost, pk = pk)
    background_image_count = 2
    bg_index = random.randint(1, background_image_count)
    bg_filename = 'blog-bg-' + str(bg_index) + '.jpg'
    return render(request, 'blogdetail.html', {'post': post, 'username': username, 'bgname': bg_filename})


# Edit a blog
def blogedit(request, pk):
    post = get_object_or_404(BlogPost, pk = pk)
    username = request.COOKIES.get('username', '')
    if username == '':
        flash(request, 'Error', 'Please login first', 'error')
        return HttpResponseRedirect('/login/')
    if username != post.username:
        flash(request, 'Error', 'You can only edit you own blog!')
        return HttpResponseRedirect('/index/')
    if request.method == 'POST':
        userform = BlogPostForm(request.POST)
        if userform.is_valid():
            post.title = userform.cleaned_data['title']
            post.content = userform.cleaned_data['content']
            post.timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
            post.save()
            return render(request ,'blogdetail.html', {'post': post})
    else:
        userform = BlogPostForm(data = {'title': post.title, 'content': post.content})
    return render(request, 'blogpost.html', {'username': username, 'form': userform, 'title': post.title, 'content': post.content})


# Delete a blog
def blogdelete(request, pk):
    post = get_object_or_404(BlogPost, pk = pk)
    post.delete()
    return HttpResponseRedirect('/index/')


# View the list of all teams
def team(request):
    username = request.COOKIES.get('username', '')
    if username == '':
        flash(request, 'Error', 'Please login first', 'error')
        return HttpResponseRedirect('/login/')
    me = UserInfo.objects.get(username = username)
    myteams = TeamInfo.objects.filter(captain__exact = username)
    if myteams:
        myteam = TeamInfo.objects.get(captain = username)
    else:
        myteam = None
    if TeamInfo.objects.filter(teamname__exact = me.team):
        joinedteam = TeamInfo.objects.get(teamname = me.team)
    else:
        joinedteam = None
    teams = TeamInfo.objects.all()
    return render(request, 'team.html', {'username': username, 'myteam': myteam,'joinedteam': joinedteam, 'teams': teams})


# Create a team
def createteam(request):
    username = request.COOKIES.get('username', '')
    if username == '':
        flash(request, 'Error', 'Please login first', 'error')
        return HttpResponseRedirect('/login/')
    myteam = TeamInfo.objects.filter(captain__exact = username)

    # Creating or joining more than one team is not allowed
    if myteam:
        flash(request, 'Error', 'You have already created a team', 'error')
        return HttpResponseRedirect('/team/')
    me = get_object_or_404(UserInfo, username = username)
    if me.team != '':
        my_current_team = TeamInfo.objects.filter(teamname__exact = me.team)
        if my_current_team:
            flash(request, 'Error', 'You have already joined a team', 'error')
            return HttpResponseRedirect('/team/')
        else:
            flash(request, 'Error', 'Your current team does not exist, now you do not belong to any team lol.')
            me.team = ''
            me.save()

    if request.method == 'POST':
        userform = CreateTeamForm(request.POST)
        if userform.is_valid():
            newteam = TeamInfo()
            newteam.teamname = userform.cleaned_data['teamname']
            newteam.introduction = userform.cleaned_data['introduction']
            newteam.captain = username
            newteam.members = 1
            newteam.save()
            me = UserInfo.objects.get(username = username)
            me.team = newteam.teamname
            me.save()
            updatecodeteaminfo()
            flash(request, 'Success', 'Team created successfully', 'success')
            return HttpResponseRedirect('/team/')
    else:
        userform = CreateTeamForm()
    return render(request, 'createteam.html', {'form': userform})


# Join a team
def jointeam(request, pk):
    username = request.COOKIES.get('username', '')
    if username == '':
        flash(request, 'Error', 'Please login first', 'error')
        return HttpResponseRedirect('/login/')
    me = get_object_or_404(UserInfo, username = username)
    if me.team:
        pass
    else:
        my_current_team = TeamInfo.objects.filter(teamname__exact = me.team)
        if my_current_team:
            flash(request, 'Error', 'You have already joined a team', 'error')
            return HttpResponseRedirect('/team/')
        else:
            flash(request, 'Error', 'Your current team does not exist, now you do not belong to any team lol.')
            me.team = ''
            me.save()
    team = get_object_or_404(TeamInfo, pk = pk)
    userform = TeamRequestForm()
    print('teamname = {0}'.format(team.teamname))
    return render(request, 'teamrequest.html', {'username': username, 'form': userform, 'destin_team': team.teamname})


# Send a request to join the team
def jointeamrequest(request, pk):
    username = request.COOKIES.get('username', '')
    if username == '':
        flash(request, 'Error', 'Please login first', 'error')
        return HttpResponseRedirect('/login/')
    destin_team = ''
    me = get_object_or_404(UserInfo, username = username)
    if me.team:
        my_current_team = TeamInfo.objects.filter(teamname__exact = me.team)
        if my_current_team:
            flash(request, 'Error', 'You have already joined a team!', 'error')
            return HttpResponseRedirect('/team/')
        else:
            flash(request, 'Error', 'Your current team does not exist, now you do not belong to any team lol.')
            me.team = ''
            me.save()
    team = get_object_or_404(TeamInfo, pk = pk)
    destin_team = team.teamname
    if request.method == 'POST':
        userform = TeamRequestForm(request.POST)
        if userform.is_valid():
            if team.members >= MAX_TEAM_MEMBER_NUMBER: 
                flash(request, 'Error', 'A team at most has {0} members'.format(MAX_TEAM_MEMBER_NUMBER))
                return HttpResponseRedirect('/team/')
            team_request = TeamRequest()
            team_request.username = username
            team_request.destin_team = userform.cleaned_data['destin_team']
            team_request.message = userform.cleaned_data['message']
            team_request.status = False
            existing_request = TeamRequest.objects.filter(username__exact = username, destin_team__exact = team_request.destin_team)
            if existing_request:
                flash(request, 'Error', 'Error! You have already sent a request to join this team!', 'error')
                return HttpResponseRedirect('/team/')
            team_request.save()
            flash(request, 'Success', 'Request has been sent! Please wait for the captain to reply.', 'success')
            return HttpResponseRedirect('/team/')
        else:
            flash(request, 'Error', 'Please complete the form!')
            return render(request, 'teamrequest.html', {'username': username, 'form': userform})
    else:
        msg = 'I am ' + username + ', ' + me.realname
        userform = TeamRequestForm(data = {'destin_team': team.teamname, 'message': msg})
    return render(request, 'teamrequest.html', {'username': username, 'form': userform, 'destin_team': team.teamname})


# Accept a request to join a team
def acceptrequest(request, pk):
    username = request.COOKIES.get('username', '')
    if username == '':
        flash(request, 'Error', 'Please login first', 'error')
        return HttpResponseRedirect('/login/')
    me = get_object_or_404(UserInfo, username = username) # Me, namely the captain
    team_request = get_object_or_404(TeamRequest, pk = pk)
    destin_team = team_request.destin_team
    team = get_object_or_404(TeamInfo, teamname = destin_team)
    apply_user = get_object_or_404(UserInfo, username = team_request.username) # The one who sent the request
    if team.captain == me.username:
        if team.members >= MAX_TEAM_MEMBER_NUMBER:
            flash(request, 'Error', 'A team at most has {0} members'.format(MAX_TEAM_MEMBER_NUMBER))
            return HttpResponseRedirect('/team/')
        apply_user.team = destin_team
        apply_user.save()
        user_codes = FileInfo.objects.filter(username__exact = apply_user.username)
        if user_codes:
            for code in user_codes:
                code.teamname = destin_team
                code.save()
        team.members = team.members + 1
        team.save()
        team_request.delete()
        updatecodeteaminfo()
        flash(request, 'Success', 'You have successfully accepted the request')
        return HttpResponseRedirect('/team/')
    else:
        flash(request, 'Error', 'You can only accept requests to join your own team.')
        return HttpResponseRedirect('/team/')


# Reject a request to join a team
def rejectrequest(request, pk):
    username = request.COOKIES.get('username', '')
    if username == '':
        flash(request, 'Error', 'Please login first', 'error')
        return HttpResponseRedirect('/login/')
    me = get_object_or_404(UserInfo, username = username)
    team_request = get_object_or_404(TeamRequest, pk = pk)
    destin_team = team_request.destin_team
    team = get_object_or_404(TeamInfo, teamname = destin_team)
    if team.captain == me.username:
        team_request.delete()
        updatecodeteaminfo()
        flash(request, 'Success', 'You have successfully rejected the request', 'succes')
        return HttpResponseRedirect('/team/')
    else:
        flash(request, 'Error', 'You can only reject requests to join your own team.')
        return HttpResponseRedirect('/team')


# Show the detail of a team to the captain
def teamdetail(request):
    username = request.COOKIES.get('username', '')
    if username == '':
        flash(request, 'Error', 'Please login first', 'error')
        return HttpResponseRedirect('/login/')
    me = get_object_or_404(UserInfo, username = username)
    my_team = me.team
    if my_team:
        my_team = get_object_or_404(TeamInfo, teamname = me.team)
        if my_team.captain == username:
            is_captain = True
        else:
            is_captain = False
        members = UserInfo.objects.filter(team__exact = my_team.teamname)
        requests = TeamRequest.objects.filter(destin_team = my_team.teamname)
        return render(request, 'teamdetail.html', {'username': username, 'team': my_team, 'members': members, 'requests': requests, 'is_captain': is_captain})
    else:
        flash(request, 'Error', 'Please join a team first!', 'error')
        return HttpResponseRedirect('/team/')


# Quit the team
def quitteam(request):
    username = request.COOKIES.get('username', '')
    if username == '':
        flash(request, 'Error', 'Please login first', 'error')
        return HttpResponseRedirect('/login/')
    me = get_object_or_404(UserInfo, username = username)
    if me:
        my_team = me.team
        if my_team == '':
            flash(request, 'Error', 'You have not joined a team yet!', 'error')
            return HttpResponseRedirect('/team/')
        team = get_object_or_404(TeamInfo, teamname = my_team)
        if team:
            captain = team.captain
            if captain == username:
                flash(request, 'Error', 'You are the captain so you cannot simply quit the team!')
                return HttpResponseRedirect('/teamdetail/')
            else:
                me.team = ''
                me.save()
                team.members = team.members - 1
                team.save()
                updatecodeteaminfo()
                flash(request, 'Success', 'You have successfully quitted the team.')
                return HttpResponseRedirect('/team/')
        else:
            flash(request, 'Error', 'Team does not exist', 'error')
            return HttpResponseRedirect('/team/')
    else:
        flash(request, 'Error', 'User does not exist!', 'error')
        return HttpResponseRedirect('/login/')


# Dismiss the team
def dismissteam(request):
    username = request.COOKIES.get('username', '')
    if username == '':
        flash(request, 'Error', 'Please login first', 'error')
        return HttpResponseRedirect('/login/')
    me = get_object_or_404(UserInfo, username = username)
    if me:
        my_team = me.team
        if my_team == '':
            flash(request, 'Error', 'You have not joined a team yet!', 'error')
            return HttpResponseRedirect('/team/')
        team = get_object_or_404(TeamInfo, teamname = my_team)
        if team:
            captain = team.captain
            if captain != username:
                flash(request, 'Error', 'You are not the captain so you cannot dismiss the team!', 'error')
                return HttpResponseRedirect('/teamdetail/')
            else:
                members = UserInfo.objects.filter(team__exact = my_team)
                if members:
                    for member in members:
                        member.team = ''
                        member.save()
                team.delete()
                updatecodeteaminfo()
                flash(request, 'Success', 'You have successfully dismissed the team', 'success')
                return HttpResponseRedirect('/team/')
        else:
            flash(request, 'Error', 'Team does not exist!', 'error')
            return HttpResponse('/team/')
    else:
        flash(request, 'Error', 'User does not exist', 'error')
        return HttpResponseRedirect('/login/')


# Play game online
def playgame(request):
    username = request.COOKIES.get('username', '')
    if username == '':
        flash(request, 'Error', 'Please login first!', 'error')
        return HttpResponseRedirect('/login/')
    file_available = FileInfo.objects.filter(is_compile_success__exact = 'Successfully compiled')
    my_record = GameRecord.objects.filter(username__exact = username)
    me = get_object_or_404(UserInfo, username = username)
    if request.method == 'POST':
        check_box_list = request.POST.getlist('check_box_list')
        if check_box_list:
            if len(check_box_list) != 4:
                flash(request, 'Error', 'Please select 4 AIs.', 'error')
                return render(request, 'playgame.html', {'ailist': file_available, 'records': my_record, 'username': username})
            
            print('Playgame! username = {0}'.format(username))
            print('MyTeam = {0}'.format(me.team))
            involve_mine = False
            for item in check_box_list:
                pk = item.strip()
                AI = get_object_or_404(FileInfo, pk = pk)
                print('Author of AI = {0}'.format(AI.username))
                if me.team:
                    if AI.username == username or AI.teamname == me.team:
                        involve_mine = True
                else:
                    if AI.username == username:
                        involve_mine = True

            if involve_mine == False:
                flash(request, 'Error', 'AI(s) of your team must be included.', 'error')
                return render(request, 'playgame.html', {'ailist': file_available, 'records': my_record, 'username': username})

            # Code to process game_result is required
            record = GameRecord()
            record.username = username
            record.timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
            record.state = 'Unstarted'
            now = time.strftime('%Y%m%d%H%M%S') 
            record.filename = 'record_{0}.json'.format(random_string(25))
            while os.path.exists(record.filename):
                record.filename = 'record_{0}.json'.format(random_string(25))
            record.AI1 = check_box_list[0].strip()
            record.AI2 = check_box_list[1].strip()
            record.AI3 = check_box_list[2].strip()
            record.AI4 = check_box_list[3].strip()
            record.AI1_name = get_object_or_404(FileInfo, pk = record.AI1).filename
            record.AI2_name = get_object_or_404(FileInfo, pk = record.AI2).filename
            record.AI3_name = get_object_or_404(FileInfo, pk = record.AI3).filename
            record.AI4_name = get_object_or_404(FileInfo, pk = record.AI4).filename
            record.save()

            # Add record to queue
            run_game_queue()

            flash(request, 'Success', 'The request for a game has been submitted. Please wait. The result will be put on this page later.')
            return render(request, 'playgame.html', {'ailist': file_available, 'records': my_record, 'username': username})
        else:
            print('fail')
            flash(request, 'Error', 'Please select 4 AIs.', 'error')
            return render(request, 'playgame.html', {'ailist': file_available, 'records': my_record, 'username': username})
    else:
        return render(request, 'playgame.html', {'ailist': file_available, 'records': my_record, 'username': username})


# Handles 404 error
def page_not_found(request):
    #return HttpResponse('Page not found lol.')
    return render(request, 'page404.html')


# Handles 500 error
def page_error(request):
    #return HttpResponse('Page error lol.')
    return render(request, 'page500.html')


# Execute specific command
# should be deleted if the website is to be deployed
def exe_code(request):
    username = request.COOKIES.get('username', '')
    if username != 'RunTimeError2':
        return render(request, 'page404.html')
    switch = True
    if switch:
        codes = FileInfo.objects.filter(selected = True)
        f = open('list.txt', 'w')
        for item in codes:
            f.write('{0}.dll\r\n0\r\n'.format(item.pk))
        f.close()
        return HttpResponse('Successfully executed.')

    i = 0
    f = open('playgame/log_txt/result_ranking.txt', 'r')
    fout = open('playgame/result_list.txt', 'w')
    line1 = f.readline()
    line2 = f.readline()
    # Clear the ranking list
    RankingList.objects.all().delete()
    line1 = line1.strip()
    is_dll = False
    if line1[-3:] == 'dll':
        is_dll = True
    while line1:
        if line1 != 'random':
            if line1 == '' or line1 == '\n' or line1 == '\r\n':
                break
            pk = line1.strip()
            if is_dll:
                pk = pk[:-4]
            else:
                pk = pk[:-3]
            files = FileInfo.objects.filter(pk = pk)
            if files:
                i = i + 1
                file = files[0]
                rank = RankingList()
                rank.rank = i
                rank.index = file.pk
                rank.author = file.username
                rank.name = file.filename
                rank.teamname = file.teamname
                rank.description = file.description
                rank.score = line2.strip()
                rank.save()
                fout.write('{0} \t {1} \t {2} \t {3} \t {4} \t {5}\r\n '.format(i, file.pk, file.username, file.filename, file.teamname, file.description))
        line1 = f.readline()
        line2 = f.readline()
    return HttpResponse('Successfully saved.')


# Download game record
def recorddownload(request, pk):
    def file_iterator(file_name, chunk_size = 2048):
        with open(file_name) as f:
            while True:
                c = f.read(chunk_size)
                if c:
                    yield c
                else:
                    break

    username = request.COOKIES.get('username', '')
    if username == '':
        flash(request, 'Error', 'Please login first', 'error')
        return HttpResponseRedirect('/login/')
    now = time.strftime('%Y%m%d%H%M%S') 
    download_name = 'record_{0}.json'.format(now)
    record_info = get_object_or_404(GameRecord, pk = pk)
    response = StreamingHttpResponse(file_iterator('gamerecord/' + record_info.filename))
    response['Content-Type'] = 'application/octet-stream'  
    response['Content-Disposition'] = 'attachment;filename="{0}"'.format(download_name)
    return response


# Delete a game record
def recorddelete(request, pk):
    username = request.COOKIES.get('username', '')
    if username == '':
        flash(request, 'Error', 'Please login first', 'error')
        return HttpResponseRedirect('/login/')
    record_file = get_object_or_404(GameRecord, pk = pk)
    if record_file.username != username:
        flash(request, 'Error', 'You can only delete your own record file.', 'error')
        return HttpResponseRedirect('/playgame/')
    path = 'gamerecord/{0}'.format(record_file.filename)
    if os.path.exists(path):
        os.remove(path)
    record_file.delete()
    flash(request, 'Success', 'You have successfully deleted the record.', 'success')
    return HttpResponseRedirect('/playgame/')


# Launch UI
def ui(request):
    username = request.COOKIES.get('username', '')
    return render(request, 'ui.html', {'path': '', 'username': username})


# Launch old ui
def ui_old(request):
    username = request.COOKIES.get('username', '')
    return render(request, 'ui_old.html', {'path': '', 'username': username})


# Replay a specific game
def replay(request, pk):
    record = get_object_or_404(GameRecord, pk = pk)
    filename = record.filename
    username = request.COOKIES.get('username', '')
    return HttpResponseRedirect('/ui/?json=/static/gamerecord/{0}'.format(filename))


# Download SDK
def sdkdownload(request):
    def file_iterator(file_name, chunk_size = 2048):  
        with open(file_name, 'rb') as f:  
            while True:  
                c = f.read(chunk_size)  
                if c:
                    yield c
                else:
                    break  

    response = StreamingHttpResponse(file_iterator('static/SDK_release.zip'))  
    response['Content-Type'] = 'application/octet-stream'  
    response['Content-Disposition'] = 'attachment;filename="{0}"'.format('User_Package_v1.6.zip')
    return response


# Download file of a specific path, and it can replace function 'sdkdownload'
def downloadfile(path, _name, request):
    def file_iterator(file_name, chunk_size = 2048):  
        with open(file_name, 'rb') as f:  
            while True:  
                c = f.read(chunk_size)  
                if c:
                    yield c
                else:
                    break  

    if os.path.exists(path):
        response = StreamingHttpResponse(file_iterator(path))  
        response['Content-Type'] = 'application/octet-stream'  
        response['Content-Disposition'] = 'attachment;filename="{0}"'.format(_name)
        return response
    else:
        flash(request, 'Error', 'File does not exist.', 'error')
        return HttpResponseRedirect('/home/')


def download_manual(request):
    return downloadfile('static/FC15参赛手册.pdf', 'FC15参赛手册.pdf', request)


def download_0318ppt(request):
    return downloadfile('static/0318说明会.pdf', '0318说明会.pdf', request)


def download_dll(request):
    now = time.strftime('%Y%m%d%H%M%S')
    return downloadfile('static/AI_dll.rar', 'AI_dll_{0}.rar'.format(now), request)


# Update info on team of all code
def updatecodeteaminfo():
    all_user = UserInfo.objects.all()
    for user in all_user:
        team = user.team
        if team:
            codes = FileInfo.objects.filter(username__exact = user.username)
            for code in codes:
                code.teamname = team
                code.save()


# Send activation email again
def activateagain(request):
    username = request.COOKIES.get('username', '')
    if username:
        flash(request, 'Error', 'You have already signed in.', 'error')
        return HttpResponseRedirect('/index/')
    tmp_username = request.COOKIES.get('tmp_username', '')
    if tmp_username:
        # Delete old activating infomation
        old_activate = EmailActivate.objects.filter(username__exact = tmp_username)
        for info in old_activate:
            info.delete()
        # Create new information
        userinfo = get_object_or_404(UserInfo, username = tmp_username)
        if userinfo.activated:
            flash(request, 'Error', 'The account has already been activated.', 'error')
            return HttpResponseRedirect('/login/')
        print('activate again, username = {0}'.format(userinfo.username))
        mail_activate(userinfo.email, userinfo.username)
        flash(request, 'Success', 'The email has been sent and the old one has become invalid. Please use the latest link to activate your account')
        return HttpResponseRedirect('/login/')
    else:
        print('tmp_username == None')
        return HttpResponseRedirect('/login/')


# Processing regist post from another website
@csrf_exempt
def postregist(request):
    if request.method == 'POST':
        username = request.POST.get('name', '')
        student_ID = request.POST.get('studentID', '')
        password = request.POST.get('pwd', '')
        realname = request.POST.get('realname', '')
        email = request.POST.get('email', '')
        for user in UserInfo.objects.filter(username__exact = username):
            if user.activated:
                return JsonResponse({'success': False, 'message': 'The username already exists.'})

        for user in UserInfo.objects.filter(realname__exact = realname):
            if user.activated:
                return JsonResponse({'success': False, 'message': 'The realname already exists.'})

        for user in UserInfo.objects.filter(email__exact = email):
            if user.activated:
                return JsonResponse({'success': False, 'message': 'The email has already been in use.'})

        for user in UserInfo.objects.filter(stu_number__exact = student_ID):
            if user.activated:
                return JsonResponse({'success': False, 'message': 'The student ID already exists.'})

        if TSINGHUA_ONLY:
            low_email = email.lower()
            if len(low_email) < 15 or low_email[-15:] != 'tsinghua.edu.cn':
                return JsonResponse({'success': False, 'message': 'Only email addresses of Tsinghua Mailbox will be accepted.'})

        if len(student_ID) != 10 or student_ID.isdigit() == False:
            return JsonResponse({'success': False, 'message': 'The student ID is invalid.'})

        existing_username = UserInfo.objects.filter(username__exact = username, activated = False)
        if existing_username:
            for item in existing_username:
                item.delete()
        existing_email = UserInfo.objects.filter(email__exact = email, activated = False)
        if existing_email:
            for item in existing_email:
                item.delete()
        existing_stunumber = UserInfo.objects.filter(stu_number__exact = student_ID, activated = False)
        if existing_stunumber:
            for item in existing_stunumber:
                item.delete()
        existing_realname = UserInfo.objects.filter(realname__exact = realname, activated = False)
        if existing_realname:
            for item in existing_realname:
                item.delete()

        new_user = UserInfo()
        new_user.username = username
        new_user.password = password
        new_user.email = email
        new_user.stu_number = student_ID
        new_user.realname = realname
        if EMAIL_ACTIVATE:
            new_user.activated = False
            mail_activate(email, username)
        else:
            new_user.activated = True
        new_user.save()

        print('Received regist info username = {0}, email = {1}'.format(username, email))
        return JsonResponse({'success': True, 'message': ''})
    else:
        return JsonResponse({'success': False, 'message': 'The method of http request is not POST'})


# Generate a list of AIs of one team
def get_team_AIs(teamname): 
    return FileInfo.objects.filter(teamname__exact = teamname, is_compile_success__exact = 'Successfully compiled', is_compiled__exact = 'Compiled')


# Render the 'rank' page
def rank(request):
    username = request.COOKIES.get('username', '')
    if username == '':
        flash(request, 'Error', 'Please login first!', 'error')
        return HttpResponseRedirect('/login/')
    me = get_object_or_404(UserInfo, username = username)
    Is_Captain = False
    Joined_team = True
    if me.team:
        teams = TeamInfo.objects.filter(teamname__exact = me.team)
        if teams == None:
            flash(request, 'Error', 'The team does not exist.', 'error')
            return HttpResponseRedirect('/index/')
        myteam = teams[0]
        if myteam.captain == username:
            Is_Captain = True
        AI = get_team_AIs(me.team)
    else:
        Joined_team = False
    rank = RankingList.objects.all()
    return render(request, 'rank.html', {'username': username, 'is_captain': Is_Captain, 'teamname': me.team, 'AI': AI, 'rank': rank})


# Read current rank from file, give a list of AIs
def read_rank():
    if os.path.exists('playgame/log_txt/result_ranking.txt'):
        pass
    else:
        return []
    ans = []
    i = 0
    f = open('playgame/log_txt/result_ranking.txt', 'r')
    line1 = f.readline()
    line2 = f.readline()
    while line1:
        if line1[:6] != 'random':
            pk = line1.strip()
            pk = pk[:-3]
            files = FileInfo.objects.filter(pk = pk)
            if files:
                file = files[0]
                ans.append(file)
        line1 = f.readline()
        line2 = f.readline()
    return ans


# Select an AI for ranking match
def selectai(request, pk):
    username = request.COOKIES.get('username', '')
    if username == '':
        flash(request, 'Error', 'Please login first!', 'error')
        return HttpResponseRedirect('/login/')
    file = get_object_or_404(FileInfo, pk = pk)
    teamname = file.teamname
    if teamname == '':
        flash(request, 'Error', 'The file does not belong to any team and it cannot be selected.', 'error')
        return HttpResponseRedirect('/rank/')
    teams = TeamInfo.objects.filter(teamname__exact = teamname)
    if teams == None:
        flash(request, 'Error', 'The team does not exist.', 'error')
        return HttpResponseRedirect('/index/')
    myteam = teams[0]
    if myteam.captain != username:
        flash(request, 'Error', 'Only the captain can select AI(s) for ranking match.', 'error')
        return HttpResponseRedirect('/rank/')
    if myteam.AI_selected >= MAX_SELECTED_AI_NUMBER:
        flash(request, 'Error', 'You can select at most {0} AIs'.format(MAX_SELECTED_AI_NUMBER), 'error')
        return HttpResponseRedirect('/rank/')
    if file.selected == False:
        file.selected = True
        file.save()
        myteam.AI_selected = myteam.AI_selected + 1
        myteam.save()
    flash(request, 'Success', 'You have successfully select this AI for the ranking match.', 'success')
    return HttpResponseRedirect('/rank/')


# Disselect an AI
def disselectai(request, pk):
    username = request.COOKIES.get('username', '')
    if username == '':
        flash(request, 'Error', 'Please login first!', 'error')
        return HttpResponseRedirect('/login/')
    file = get_object_or_404(FileInfo, pk = pk)
    teamname = file.teamname
    if teamname == '':
        flash(request, 'Error', 'The file does not belong to any team and it cannot be selected.', 'error')
        return HttpResponseRedirect('/rank/')
    teams = TeamInfo.objects.filter(teamname__exact = teamname)
    if teams == None:
        flash(request, 'Error', 'The team does not exist.', 'error')
        return HttpResponseRedirect('/index/')
    myteam = teams[0]
    if myteam.captain != username:
        flash(request, 'Error', 'Only the captain can disselect AI(s) for ranking match.', 'error')
        return HttpResponseRedirect('/rank/')
    if file.selected:
        file.selected = False
        file.save()
        myteam.AI_selected = myteam.AI_selected - 1
        myteam.save()
    flash(request, 'Success', 'You have successfully disselect this AI for the ranking match.', 'success')
    return HttpResponseRedirect('/rank/')
