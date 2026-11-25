from rest_framework.exceptions import Throttled
from rest_framework.throttling import ScopedRateThrottle


class MuitasTentativas(Throttled):
    default_detail = "Muitas tentativas seguidas."
    extra_detail_singular = "Tente de novo em {wait} segundo."
    extra_detail_plural = "Tente de novo em {wait} segundos."


class ComLimiteDeTentativas:
    throttle_classes = [ScopedRateThrottle]

    def throttled(self, request, wait):
        raise MuitasTentativas(wait)
