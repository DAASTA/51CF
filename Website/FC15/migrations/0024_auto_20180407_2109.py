# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2018-04-07 21:09
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('FC15', '0023_auto_20180407_2022'),
    ]

    operations = [
        migrations.AddField(
            model_name='teaminfo',
            name='rank',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='teaminfo',
            name='score',
            field=models.IntegerField(default=0),
        ),
    ]
