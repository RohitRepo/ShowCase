from django.conf.urls import patterns, url, include
from rest_framework.urlpatterns import format_suffix_patterns
from . import views

urlpatterns = patterns('',
                       # url(r'^/editorspick$', 'feed.views.editors_pick_list'),
                       )

urlpatterns = format_suffix_patterns(urlpatterns)