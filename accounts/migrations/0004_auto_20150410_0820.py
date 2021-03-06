# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_user_login_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='login_type',
            field=models.CharField(default=b'NT', max_length=2, choices=[(b'FB', b'facebook'), (b'TW', b'twitter'), (b'NT', b'native')]),
        ),
    ]
