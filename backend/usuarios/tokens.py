from rest_framework_simplejwt.tokens import RefreshToken


def adicionar_dados_do_usuario(token, usuario):
    token["nome"] = usuario.nome
    token["tipo"] = usuario.tipo
    return token


def gerar_tokens(usuario):
    refresh = adicionar_dados_do_usuario(RefreshToken.for_user(usuario), usuario)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}
