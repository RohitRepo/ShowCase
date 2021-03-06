from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework import status, permissions
from rest_framework.response import Response

from .manager import get_user_feed, get_news_feeds, get_user_notification_feed, mark_activity_seen
from .serializers import NotificationSerializer

from posts.models import Post
from posts.serializers import PostSerializer

from accounts.models import User

def fetch_activity_posts(feed, next_token):
    if next_token:
        user_activities = feed.get(limit=11, id_lte=next_token)['results']
    else:
        user_activities = feed.get(limit=11)['results']

    if (len(user_activities) == 11):
        new_next_token = user_activities.pop()['id']
    else:
        new_next_token = ''

    user_activity_post_ids = [activity['foreign_id'] for activity in user_activities]
    user_activity_posts = Post.objects.filter(id__in=user_activity_post_ids).order_by('-created')

    return (user_activity_posts, new_next_token)

class UserActivities(APIView):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, )

    def get(self, request, user_id, format=None):
        next_token = request.GET.get('next_token', '')
        user_feed = get_user_feed(user_id)

        user_activity_posts, new_next_token = fetch_activity_posts(user_feed, next_token)

        serializer = PostSerializer(user_activity_posts, context={'request': request})

        return Response(data={'results': serializer.data, 'next_token': new_next_token, 'count': len(serializer.data)})

class UserNews(APIView):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, )

    def get(self, request, user_id, format=None):
        next_token = request.GET.get('next_token', '')
        user_feed = get_news_feeds(user_id)['flat']

        user_activity_posts, new_next_token = fetch_activity_posts(user_feed, next_token)

        serializer = PostSerializer(user_activity_posts, context={'request': request})

        return Response(data={'results': serializer.data, 'next_token': new_next_token, 'count': len(serializer.data)})


class UserNotifications(APIView):
    permission_classes = (permissions.IsAuthenticated, )

    def fetch_activity_notification(self, feed, next_token, aggregated=False):
        if next_token:
            user_activities = feed.get(limit=11, id_lte=next_token)['results']
        else:
            user_activities = feed.get(limit=11)['results']

        if (len(user_activities) == 11):
            new_next_token = user_activities.pop()['id']
        else:
            new_next_token = ''

        return (user_activities, new_next_token)

    def get(self, request, format=None):
        next_token = request.GET.get('next_token', '')
        notification_feed = get_user_notification_feed(request.user.id)

        user_activities, new_next_token = self.fetch_activity_notification(notification_feed, next_token, True)
        serializer = NotificationSerializer(user_activities, context={'request': request})

        return Response(data={
            'results': serializer.data,
            'next_token': new_next_token,
            'count': len(serializer.data),
            'feed_token': notification_feed.token
        })

    def put(self, request, format=None):
        notification_feed = get_user_notification_feed(request.user.id)
        activity_ids = request.DATA.get('activity_ids', '')

        if not activity_ids:
            return Response(data={'error': 'activity_ids is required'}, status=status.HTTP_400_BAD_REQUEST)

        mark_activity_seen(notification_feed, activity_ids)
        return Response(status=status.HTTP_201_CREATED)

    def post(self, request, format=None):

        activities = request.DATA.get('activities', '')

        if not activities:
            return Response(data={'error': 'activities is required'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = NotificationSerializer(activities, context={'request': request})

        return Response(data=serializer.data)


