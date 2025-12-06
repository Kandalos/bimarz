from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailBackend(ModelBackend):
    """
    Authenticate using email instead of username.
    """

    def authenticate(self, request, email=None, username=None, password=None, **kwargs):
        # djoser sends "email", DRF might send "username"
        login = email or username
        if login is None:
            return None

        try:
            user = User.objects.get(email=login)
        except User.DoesNotExist:
            return None

        if user.check_password(password):
            return user

        return None
