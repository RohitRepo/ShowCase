from django.db import models
from django.conf import settings
from django.dispatch import receiver
from django.db.models.signals import post_save, post_delete
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

from postVotes.models import PostVote, bind_post_vote
from streams.conf import USER_FEED, BUCKET_FEED, NOTIFICATION_FEED
from streams.manager import bind_stream

class Post(models.Model):
    INTERPRET = 'IN'
    ADD = 'AD'
    CREATE = 'CR'
    BUCKET = 'BK'
    ADMIRE_ART = 'MA'
    ADMIRE_BUCKET = 'MB'
    ADMIRE_INTERPRET = 'AI'

    TYPE_CHOICES = (
        (INTERPRET, 'interpret'),
        (ADD, 'add'),
        (CREATE, 'create'),
        (BUCKET, 'bucket'),
        (ADMIRE_ART, 'admire_art'),
        (ADMIRE_BUCKET, 'admire_bucket'),
    )

    composition = models.ForeignKey('compositions.Composition',
        related_name='posts',
        blank=True,
        null=True)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='user_posts')
    created = models.DateTimeField(auto_now_add=True)
    public = models.BooleanField(default=True)
    post_type = models.CharField(max_length=2, choices=TYPE_CHOICES)
    content_type = models.ForeignKey(ContentType)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    def timesince(self, now=None):
        from django.utils.timesince import timesince as _
        return _(self.created, now)

    def get_comments_count(self):
        return self.comments.all().count()

    def get_voting_status(self, user):
        return self.vote.get_voting_status(user)

    @property
    def activity_actor_id(self):
        return self.creator.id

    @property
    def activity_foreign_id(self):
        return self.id

    def create_activity(self):
        activity_data = []
        target_id = 0
        if self.composition:
            target_id = self.composition.id

        activity = dict(
            actor=self.creator.id,
            verb=self.post_type,
            object=self.object_id,
            target=target_id,
            foreign_id=self.id,
            time=self.created,
        )

        activity_data.append({'activity': activity,
        'feed_type': USER_FEED,
        'feed_id': activity['actor']})

        notification_targets = self.content_object.getNotificationTarget(self)
        if notification_targets:
            for notification_target in notification_targets:
                if not (notification_target.id == activity['actor']):
                    activity_data.append({'activity': activity,
                    'feed_type': NOTIFICATION_FEED,
                    'feed_id': notification_target.id})

        if self.post_type == self.BUCKET:
            activity_data.append({'activity': activity,
            'feed_type': BUCKET_FEED,
            'feed_id': activity['object']})

        return activity_data

    def create_post_vote(self):
        return PostVote(positive=0, negative=0, post=self)

# Define Signals
def model_created(sender, instance, created, raw, **kwargs):
    post = instance.create_post(created, raw)

def model_deleted(sender, instance, **kwargs):
    try:
        posts = instance.get_post()
        posts.delete()
    except:
        pass

def bind_post(sender, **kwargs):
    post_save.connect(model_created, sender=sender)
    post_delete.connect(model_deleted, sender=sender)

# Bind Signals
bind_stream(Post)
bind_post_vote(Post)

# Remove underlying object when deleted
@receiver(post_delete, sender=Post)
def remove_post_target(sender, **kwargs):
    try:
        # instance = kwargs.get('instance')
        # instance.content_object.delete()
        pass
    except:
        pass
