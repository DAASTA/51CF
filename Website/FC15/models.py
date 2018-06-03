from django.db import models
from django.contrib import admin
import time, random, os


def user_dirpath():
    return ''


# Model which stores information of users
class UserInfo(models.Model):
    username = models.CharField(max_length = 100)
    realname = models.CharField(max_length = 100, default = '')
    password = models.CharField(max_length = 100)
    stu_number = models.CharField(max_length = 20)
    email = models.EmailField()
    team = models.CharField(max_length = 100, default = '', null = True, blank = True)
    activated = models.BooleanField(default = False)

    def __unicode__(self):
        return self.username


# Determines how to display class UserInfo in tables for admin
class UserInfoAdmin(admin.ModelAdmin):
    list_display = ('username', 'realname', 'stu_number', 'team', 'email')


# Model which stores information of teams
class TeamInfo(models.Model):
    teamname = models.CharField(max_length = 100)
    captain = models.CharField(max_length = 100)
    introduction = models.CharField(max_length = 500)
    members = models.IntegerField(default = 0)
    AI_selected = models.IntegerField(default = 0)


# Determines how to display class TeamInfo in tables for admin
class TeamInfoAdmin(admin.ModelAdmin):
    list_display = ('teamname', 'captain', 'members', 'introduction')


# Model for file uploaded
class FileInfo(models.Model):
    # Determines where the file will be saved
    def user_dirpath(instance, filename):
        now = time.strftime('%Y%m%d%H%M%S')
        exact_name = '{0}_{1}__{2}'.format(now, random.randint(0, 1000), filename)
        while os.path.exists('fileupload/{0}/{1}'.format(instance.username, exact_name)):
            exact_name = '{0}_{1}__{2}'.format(now, random.randint(0, 1000), filename)
        _path = 'fileupload/{0}/{1}'.format(instance.username, exact_name)
        instance.path = _path
        instance.origin_name = filename
        instance.exact_name = exact_name
        return './' + _path

    filename = models.CharField(max_length = 255)
    username = models.CharField(max_length = 100)
    teamname = models.CharField(max_length = 100, null = True, blank = True, default = '')
    description = models.CharField(max_length = 1000, null = True, blank = True, default = '')
    file = models.FileField(upload_to = user_dirpath)
    path = models.CharField(max_length = 500)
    origin_name = models.CharField(max_length = 255, default = filename)
    exact_name = models.CharField(max_length = 255, default = origin_name)
    timestamp = models.DateTimeField()
    selected = models.BooleanField(default = False)
    rank = models.IntegerField(default = 0)
    score = models.IntegerField(default = 0)

    is_compiled = models.CharField(max_length = 50, default = '', null = True, blank = True)
    is_compile_success = models.CharField(max_length = 50, default = '', null = True, blank = True)
    compile_result = models.CharField(max_length = 4096, default = '', null = True, blank = True)

    def __unicode__(self):
        return self.filename

    class Meta:
        verbose_name = 'FileInfo'
        ordering = ['-timestamp']


# Determines how to display class FileInfo in tables for admin
class FileInfoAdmin(admin.ModelAdmin):
    list_display = ('filename', 'username', 'is_compiled', 'is_compile_success', 'description')


# Model for AI (successfully compiled file)
class AIInfo(models.Model):
    name = models.CharField(max_length = 255) # filename
    author = models.CharField(max_length = 100) # username
    team = models.CharField(max_length = 100) # teamname
    description = models.CharField(max_length = 1000, null = True, blank = True)
    path = models.CharField(max_length = 500)
    enabled = models.BooleanField()


# Determines how to display class AIInfo in tables for admin
class AIInfoAdmin(admin.ModelAdmin):
    list_display = ('name', 'author', 'enabled')


# Model for record of game
class GameRecord(models.Model):
    username = models.CharField(max_length = 100) # the user who launched the game
    timestamp = models.DateTimeField()
    filename = models.CharField(max_length = 255) # name of the record file
    state = models.CharField(max_length = 50)
    AI1 = models.CharField(max_length = 20, blank = True, null = True, default = '')
    AI2 = models.CharField(max_length = 20, blank = True, null = True, default = '')
    AI3 = models.CharField(max_length = 20, blank = True, null = True, default = '')
    AI4 = models.CharField(max_length = 20, blank = True, null = True, default = '')
    AI1_name = models.CharField(max_length = 20, blank = True, null = True, default = '')
    AI2_name = models.CharField(max_length = 20, blank = True, null = True, default = '')
    AI3_name = models.CharField(max_length = 20, blank = True, null = True, default = '')
    AI4_name = models.CharField(max_length = 20, blank = True, null = True, default = '')

    class Meta:
        verbose_name = 'GameRecord'
        ordering = ['-timestamp']


# Determines how to display class AIInfo in tables for admin
class GameRecordAdmin(admin.ModelAdmin):
    list_display = ('username', 'timestamp', 'filename')


# Model for blogs
class BlogPost(models.Model):
    title = models.CharField(max_length = 150)
    username = models.CharField(max_length = 100)
    content = models.TextField()
    timestamp = models.DateTimeField()

    def __unicode__(self):
        return self.title

    class Meta:
        verbose_name = 'blogpost'
        ordering = ['-timestamp']


# Determines how to display class BlogPost in tables for admin
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'username', 'timestamp')


# Stores codes for activating with email
class EmailActivate(models.Model):
    username = models.CharField(max_length = 100)
    activate_string = models.CharField(max_length = 100)


# Determines how to display class EmailActivate in table for admin
class EmailActivateAdmin(admin.ModelAdmin):
    list_display = ('username', 'activate_string')


# Stores codes for reseting password with email
class PasswordReset(models.Model):
    username = models.CharField(max_length = 100)
    reset_string = models.CharField(max_length = 100)
    new_password = models.CharField(max_length = 10)


# Determines how to display class PasswordReset in table for admin
class PasswordResetAdmin(admin.ModelAdmin):
    list_display = ('username', 'reset_string')


# Requests to join or quit teams
class TeamRequest(models.Model):
    username = models.CharField(max_length = 100)
    destin_team = models.CharField(max_length = 100)
    message = models.CharField(max_length = 500)
    status = models.BooleanField(default = False) # False means the captain has not dealt with this request


# Determines how to display class TeamRequest in table for admin
class TeamRequestAdmin(admin.ModelAdmin):
    list_display = ('username', 'destin_team', 'status')


# Ranking list
class RankingList(models.Model):
    rank = models.IntegerField(default = 0)
    index = models.IntegerField(default = 0)
    name = models.CharField(max_length = 100, default = '')
    author = models.CharField(max_length = 100)
    teamname = models.CharField(max_length = 100, null = True, blank = True, default = '')
    description = models.CharField(max_length = 1000, null = True, blank = True, default = '')
    score = models.IntegerField(default = 0)


# Determines how to display class RankingList in table for admin
class RankingListAdmin(admin.ModelAdmin):
    list_display = ('rank', 'index', 'author', 'teamname', 'score')


# Register all the models to admin
admin.site.register(UserInfo, UserInfoAdmin)
admin.site.register(TeamInfo, TeamInfoAdmin)
admin.site.register(FileInfo, FileInfoAdmin)
admin.site.register(AIInfo, AIInfoAdmin)
admin.site.register(GameRecord, GameRecordAdmin)
admin.site.register(BlogPost, BlogPostAdmin)
admin.site.register(EmailActivate, EmailActivateAdmin)
admin.site.register(PasswordReset, PasswordResetAdmin)
admin.site.register(TeamRequest, TeamRequestAdmin)
admin.site.register(RankingList, RankingListAdmin)
