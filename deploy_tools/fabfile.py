from fabric.contrib.files import append, exists, sed
from fabric.api import env, local, run
import random

REPO_URL = 'https://github.com/RohitRepo/ShowCase.git'


def deploy():
    site_folder = '/home/%s/sites/%s' % (env.user, env.host)
    source_folder = site_folder + '/source'
    _create_directory_structure_if_necessary(site_folder)
    _get_latest_source(source_folder)
    _update_settings(source_folder, env.host)
    _update_virtualenv(source_folder)
    _update_bower(source_folder)
    _build_client(source_folder)
    _update_static_files(source_folder)
    _update_database(source_folder)
    _restart_service()


def _create_directory_structure_if_necessary(site_folder):
    for subfolder in ('source', 'static', 'database', 'virtualenv', 'media'):
        run('mkdir -p %s/%s' % (site_folder, subfolder))


def _get_latest_source(source_folder):
    if exists(source_folder + '/.git'):
        run('cd %s && git fetch' % (source_folder,))
    else:
        run('git clone %s %s' % (REPO_URL, source_folder))
    current_commit = local("git log -n 1 --format=%H", capture=True)
    run('cd %s && git reset --hard %s' % (source_folder, current_commit))


def _update_settings(source_folder, site_name):
    settings_path = source_folder + '/ShowCase/settings.py'
    sed(settings_path, "DEBUG = True", "DEBUG = False")
    sed(settings_path,
        'ALLOWED_HOSTS =.+$',
        'ALLOWED_HOSTS = ["%s", "thirddime.com", "www.thirddime.com"]' % (site_name,)
        )
    sed(settings_path,
        'STREAM_API_KEY =.+$',
        'STREAM_API_KEY = "kvkuck3w9thv"'
        )
    sed(settings_path,
        'STREAM_API_SECRET =.+$',
        'STREAM_API_SECRET = "can7n5vuyw5k556e7nz7wjzx98r6umm3yn3uy559rch8xd4m5aqu9rmxgw8xyy5r"'
        )
    sed(settings_path,
        'EMAIL_HOST_USER =.+$',
        'EMAIL_HOST_USER = "postmaster@thirddime.com"'
        )
    sed(settings_path,
        'EMAIL_HOST_PASSWORD =.+$',
        'EMAIL_HOST_PASSWORD = "671b18a15bd67beabc3b0738bd5f8d7a"'
        )
    sed(settings_path,
        'CLOUDINARY_API_KEY =.+$',
        'CLOUDINARY_API_KEY = "185157468258313"'
        )
    sed(settings_path,
        'CLOUDINARY_API_SECRET =.+$',
        'CLOUDINARY_API_SECRET = "8SqyGOFi6gXBcy9dfTUsGxj9c3c"'
        )
    sed(settings_path,
        'CLOUDINARY_CLOUDNAME =.+$',
        'CLOUDINARY_CLOUDNAME = "thirddime"'
        )

    secret_key_file = source_folder + '/ShowCase/secret_key.py'
    if not exists(secret_key_file):
        chars = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)'
        key = ''.join(random.SystemRandom().choice(chars) for _ in range(50))
        append(secret_key_file, "SECRET_KEY = '%s'" % (key,))
    append(settings_path, '\nfrom .secret_key import SECRET_KEY')


def _update_virtualenv(source_folder):
    virtualenv_folder = source_folder + '/../virtualenv'
    if not exists(virtualenv_folder + '/bin/pip'):
        run('virtualenv %s --no-site-packages' % (virtualenv_folder,))
    run('%s/bin/pip install -r %s/deploy_tools/requirements.txt' % (
        virtualenv_folder, source_folder))

def _update_bower(source_folder):
    run('cd %s/ShowCase/static && bower install' % (source_folder, ))

def _build_client(source_folder):
    run('cd %s/ShowCase && npm install && grunt build' % (source_folder,))


def _update_static_files(source_folder):
    run('cd %s && ../virtualenv/bin/python manage.py collectstatic --noinput' % (
        source_folder,))


def _update_database(source_folder):
    run('cd %s && ../virtualenv/bin/python manage.py migrate --noinput' % (
        source_folder,))

def _restart_service():
    run('sudo stop canvasblues.com')
    run('sudo start canvasblues.com')
