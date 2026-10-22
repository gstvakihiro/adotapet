from django.contrib.auth.base_user import BaseUserManager


class UsuarioManager(BaseUserManager):
    use_in_migrations = True

    def _criar(self, email, password, **campos):
        if not email:
            raise ValueError("O email é obrigatório.")
        usuario = self.model(email=self.normalize_email(email).lower(), **campos)
        usuario.set_password(password)
        usuario.save(using=self._db)
        return usuario

    def create_user(self, email, password=None, **campos):
        campos.setdefault("is_staff", False)
        campos.setdefault("is_superuser", False)
        return self._criar(email, password, **campos)

    def create_superuser(self, email, password=None, **campos):
        campos.setdefault("is_staff", True)
        campos.setdefault("is_superuser", True)
        if campos["is_staff"] is not True or campos["is_superuser"] is not True:
            raise ValueError("O superusuário precisa ter is_staff e is_superuser.")
        return self._criar(email, password, **campos)
