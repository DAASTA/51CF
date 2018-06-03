# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2018-02-14 02:20
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('FC15', '0015_auto_20180209_1135'),
    ]

    operations = [
        migrations.CreateModel(
            name='AIInfo',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('author', models.CharField(max_length=100)),
                ('team', models.CharField(max_length=100)),
                ('description', models.CharField(max_length=1000)),
                ('path', models.CharField(max_length=500)),
                ('enabled', models.BooleanField()),
            ],
        ),
    ]