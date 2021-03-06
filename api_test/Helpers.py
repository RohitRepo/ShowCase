from uuid import uuid4
from accounts.models import User
from compositions.models import Composition
from comments.models import Comment
from interpretations.models import Interpretation
import votes.signals

USER1 = {"email": "user1@user.com", "first_name": "user1", "password": "user1"}
USER2 = {"email": "user2@user.com", "first_name": "user2", "password": "user2"}
USER3 = {"email": "user3@user.com", "first_name": "user3", "password": "user3"}


def getUser(user_data=None):
    if not user_data:
        user_data = USER1

    try:
        return User.objects.get(email__iexact=user_data["email"])
    except User.DoesNotExist:
        return User.objects.create_user(user_data["email"], user_data["first_name"], user_data["password"])


def getComposition(artist=None):
    if not artist:
        artist = getUser()

    try:
        return Composition.objects.filter(artist=artist)[0]
    except IndexError:
        return Composition.objects.create(artist=artist)


def createComposition(artist=None):
    if not artist:
        artist = getUser()

    return Composition.objects.create(artist=artist)


def createComment(comment_data=None):
    if not comment_data:
        comment_data = {
            "commenter": getUser(), "interpretation": createInterpretation(), "comment": "Comment1"}

    return Comment.objects.create(**comment_data)

def createInterpretation(interpretation_data=None):
    if not interpretation_data:
        interpretation_data = {
            "user": getUser(), "composition": getComposition(), "interpretation": "Interpretation1"}
    return Interpretation.objects.create(**interpretation_data)
