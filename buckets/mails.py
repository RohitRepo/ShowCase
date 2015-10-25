from django.template import Context
from django.template.loader import get_template
from django.core.mail import EmailMessage

def send_added_to_bucket(bucket_membership):
    bucket = bucket_membership.bucket
    composition = bucket_membership.composition
    target_user = bucket.owner

    to_user = []

    composition_owner = composition.uploader
    if (composition_owner.is_active):
        to_user.append(composition_owner.email)

    composition_artist = composition.artist
    if composition_artist.is_active and not(composition_owner == composition_artist):
        to_user.append(composition_artist.email)

    if not to_user:
        raise Exception('send_added_to_bucket: Counld not find valid recepient for bucket_membership: {0}'.format(bucket_membership.id))

    to = to_user
    subject = target_user.name + " added artwork " + composition.title + " to series " + bucket.name
    from_email = 'ThirdDime <info@thirddime.com>'

    ctx = {
        'target_name': target_user.name,
        'target_slug': target_user.slug,
        'target_picture': target_user.picture.url,
        'art_name': composition.title,
        'art_slug': composition.slug,
        'series_name': bucket.name,
        'series_slug': bucket.slug,
        'series_owner_slug': bucket.owner.slug,
    }

    message = get_template('mails/buckets/to_bucket.html').render(Context(ctx))
    msg = EmailMessage(subject, message, to=to, from_email=from_email)
    msg.content_subtype = 'html'
    msg.send(fail_silently=False)

