#coding=utf-8
from FC15.models import EmailActivate, PasswordReset, UserInfo
from django.core.mail import send_mail
from FC15Website.settings import DEFAULT_EMAIL_FROM
from random import Random
import threading


SERVER_URL = '166.111.72.13' # should be the url of IP address of the server


# Generate a random string
def random_string(str_length = 50):
    ans_str = ''
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    length = len(chars) - 1
    random = Random()
    for i in range(str_length):
        ans_str += chars[random.randint(0, length)]
    return ans_str


# Add a record and send a mail to activate accounts
def mail_activate(email_address, username):
    # Delete old info
    old_items = EmailActivate.objects.filter(username__exact = username)
    if old_items:
        for item in old_items:
            item.delete()

    email_activate = EmailActivate()
    email_activate.username = username
    randstring = random_string(str_length = 50)
    item = EmailActivate.objects.filter(activate_string = randstring)
    while item:
        randstring = random_string(str_length = 50)
        item = EmailActivate.objects.filter(activate_stirng = randstring)
    email_activate.activate_string = randstring
    email_activate.save()

    email_title = 'Please activate your account for FC15'
    email_body = 'Please click the link to activate your account for FC15:\nhttp://' + SERVER_URL + '/'
    email_body += 'mailactivate/' + email_activate.activate_string
    send_mail(email_title, email_body, 'songjh16@mails.tsinghua.edu.cn', [email_address, ], fail_silently = False)


def send_mail_to_mine():
    t = threading.Thread(target = send_mail, args = ('Test', 'Only for a test.', DEFAULT_EMAIL_FROM, ['songjh16@mails.tsinghua.edu.cn'],))
    t.start()


# Add a record and send a mail to reset the password
def password_reset(email_address, username):
    pw_reset = PasswordReset()
    pw_reset.username = username
    randstring = random_string(str_length = 60)
    item = PasswordReset.objects.filter(reset_string = randstring)
    while item:
        randstring = random_string(str_length = 60)
        item = PasswordReset.objects.filter(reset_string = randstring)
    pw_reset.reset_string = randstring
    pw_reset.new_password = random_string(str_length = 10)
    pw_reset.save()

    email_title = 'You requested to reset your password for FC15'
    email_body = 'Please click the link to reset your password for FC15\n'
    email_body += 'http://' + SERVER_URL + '/resetpassword/' + pw_reset.reset_string
    email_body += '\nYour new password will be\n\n' + pw_reset.new_password
    email_body += '\n\nPlease change your password after you login.'
    email_body += '\n\nIf this is not your operation or you do not want to change your password now,\n'
    email_body += 'please do not click the link and ignore this e-mail.'
    # Use a new thread to send email so that the page won't lag
    t = threading.Thread(target = send_mail, args = (email_title, email_body, DEFAULT_EMAIL_FROM, [email_address],))
    t.start()