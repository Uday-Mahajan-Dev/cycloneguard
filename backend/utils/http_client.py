import httpx

_client: httpx.AsyncClient | None = None


def get_http_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        limits = httpx.Limits(max_connections=20, max_keepalive_connections=10)
        timeout = httpx.Timeout(30.0, connect=10.0)
        headers = {
            "User-Agent": "CycloneGuard/1.0 (Emergency-Action-Platform)",
            "Accept": "*/*",
        }
        _client = httpx.AsyncClient(limits=limits, timeout=timeout, headers=headers)
    return _client


async def close_http_client() -> None:
    global _client
    if _client is not None and not _client.is_closed:
        await _client.aclose()
        _client = None
