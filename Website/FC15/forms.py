#coding=utf-8
from django import forms
from django.contrib import messages
from FC15.models import UserInfo, FileInfo, BlogPost, TeamInfo

# All forms for this website

# For users to login
class UserLoginForm(forms.Form):
    username = forms.CharField(max_length = 100, widget = forms.TextInput(attrs = {'class': 'form_input'}))
    password = forms.CharField(max_length = 100, widget = forms.PasswordInput(attrs = {'class': 'form_input'}))


# For users to register
class UserRegistForm(forms.Form):
    username = forms.CharField(max_length = 100, widget = forms.TextInput)
    realname = forms.CharField(max_length = 100, widget = forms.TextInput)
    email = forms.CharField(widget = forms.EmailInput)
    stu_number = forms.CharField(max_length = 10, widget = forms.TextInput)
    password = forms.CharField(max_length = 100, widget = forms.PasswordInput)
    password_confirm = forms.CharField(max_length = 100, widget = forms.PasswordInput)


# For users to upload code
class FileUploadForm(forms.Form):
    filename = forms.CharField(max_length = 255)
    description = forms.CharField(max_length = 500, widget = forms.Textarea)
    file = forms.FileField()


class ResultUploadForm(forms.Form):
    file = forms.FileField()


# For users to post blogs
class BlogPostForm(forms.Form):
    title = forms.CharField(max_length = 100)
    content = forms.CharField(widget = forms.Textarea)


# For users to create teams
class CreateTeamForm(forms.Form):
    teamname = forms.CharField(max_length = 100)
    introduction = forms.CharField(max_length = 500, widget = forms.Textarea)


# For users to reset password
class ResetPasswordForm(forms.Form):
    username = forms.CharField(max_length = 100)
    email = forms.EmailField()


# For users to change password
class ChangeForm(forms.Form):
    email = forms.EmailField()
    old_password = forms.CharField(max_length = 100, widget = forms.PasswordInput)
    new_password = forms.CharField(max_length = 100, widget = forms.PasswordInput)
    confirm_password = forms.CharField(max_length = 100, widget = forms.PasswordInput)


# For users to send requests to join the team
class TeamRequestForm(forms.Form):
    destin_team = forms.CharField(max_length = 100)
    message = forms.CharField(max_length = 500, widget = forms.Textarea)


# Add a message and show it
# The function may be unable to use if the version of Django changes
def flash(request, title, text, level = 'info'):
    level_map = {
        'info': messages.INFO,
        'debug': messages.DEBUG,
        'success': messages.SUCCESS,
        'warning': messages.WARNING,
        'error': messages.ERROR
    }
    level = level_map[level]
    messages.add_message(request, level, text, extra_tags = title)
    return 'ok'