import json
from collections import defaultdict
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, Request

from app.config import settings

_buckets: dict[str, list[datetime]] = defaultdict(list)


def check_rate_limit(request: Request) -> None:
    client_ip = request.client.host if request.client else "unknown"
    now = datetime.now(timezone.utc)
    window = timedelta(minutes=1)

    timestamps = _buckets[client_ip]
    _buckets[client_ip] = [ts for ts in timestamps if now - ts < window]

    if len(_buckets[client_ip]) >= settings.rate_limit_per_minute:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again later.")

    _buckets[client_ip].append(now)
