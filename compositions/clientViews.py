from .models import Composition
from django.template import RequestContext
from django.shortcuts import get_object_or_404, render_to_response

def composition_main(request, slug):
    composition = get_object_or_404(Composition, slug=slug)
    composition.views = composition.views + 1
    composition.save()

    context = RequestContext(request, {
        'composition': composition,
        'is_bookmarked': composition.is_bookmarked(request.user.id),
        'is_admired': composition.is_admired(request.user.id),
        'has_ownership': composition.has_ownership(request.user.id),
        'is_nsfw': composition.is_nsfw(request.user),
        'is_uploader_followed' : composition.uploader.is_followed(request.user.id),
        'is_uploader_me': composition.uploader.id == request.user.id
    })
    return render_to_response("composition.html", context)

def composition_series(request, slug):
    composition = get_object_or_404(Composition, slug=slug)

    context = RequestContext(request, {
        'composition': composition,
        'is_bookmarked': composition.is_bookmarked(request.user.id),
        'is_admired': composition.is_admired(request.user.id),
        'has_ownership': composition.has_ownership(request.user.id),
        'is_nsfw': composition.is_nsfw(request.user)
    })
    return render_to_response("composition_series.html", context)

def show_interpretation(request, slug):
    interpretation = get_object_or_404(interpretation, slug=slug)

    context = RequestContext(request, {'interpretation': interpretation, 'editMode': False})
    return render_to_response("interpret.html", context)


def upload_artwork(request):
    context = RequestContext(request, {})
    return render_to_response("upload.html", context)