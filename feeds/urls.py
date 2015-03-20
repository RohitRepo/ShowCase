from django.conf.urls import patterns, url, include
from rest_framework.urlpatterns import format_suffix_patterns
from . import views

urlpatterns = patterns('',
                       url(r'^/editors$', 'feeds.views.editors_pick_list'),
                       url(r'^/editors/next$', 'feeds.views.editors_pick_next')
                       )

urlpatterns = format_suffix_patterns(urlpatterns)