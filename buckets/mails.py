from django.template import Context
from django.template.loader import get_template
from django.core.mail import EmailMessage
from django.db.models.loading import get_model

def send_added_to_bucket(bucket_membership_id):
    BucketMembership = get_model('buckets', 'BucketMembership')
    bucket_membership = BucketMembership.objects.get(id = bucket_membership_id)

    bucket = bucket_membership.bucket
    composition = bucket_membership.composition
    target_user = bucket.owner

    to_user = []

    composition_owner = composition.uploader

    MailOptions = get_model('accounts', 'MailOptions')
    owner_mail_options = MailOptions.objects.get(user=composition_owner)

    if (composition_owner.is_active  and not (target_user.id == composition_owner.id) and owner_mail_options.to_bucket):
        to_user.append(composition_owner.email)

    composition_artist = composition.artist
    artist_mail_options = MailOptions.objects.get(user=composition_artist)

    if composition_artist.is_active and not(composition_owner == composition_artist) and not (target_user.id == composition_artist.id) and artist_mail_options.to_bucket:
        to_user.append(composition_artist.email)

    if not to_user:
        return 'send_added_to_bucket: Counld not find valid recepient for bucket_membership: {0}'.format(bucket_membership.id)

    to = to_user
    subject = target_user.name + " added artwork " + composition.title + " to series " + bucket.name
    from_email = 'ThirdDime <notifications@thirddime.com>'

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

    count = 1
    while count:
        try:
            msg.send(fail_silently=False)
            break;
        except:
            if (count > 3):
                raise
            count += count


