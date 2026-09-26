import logging
from typing import Any

from backend.config import get_settings
from backend.utils.http_client import get_http_client

logger = logging.getLogger("cycloneguard.alert_dispatcher")


async def dispatch_alert(
    message: str,
    severity: str = "CRITICAL",
    chat_id: str | None = None,
) -> dict[str, Any]:
    """
    Dispatches critical cyclone warning alerts via Telegram Bot API.
    If Telegram tokens are unconfigured or request fails, smoothly delivers via structured system console.
    """
    settings = get_settings()
    target_chat = chat_id or settings.TELEGRAM_ALERT_CHAT_ID
    token = settings.TELEGRAM_BOT_TOKEN

    severity_emojis = {
        "CRITICAL": "🚨🚨",
        "HIGH": "⚠️",
        "MODERATE": "⚡",
        "LOW": "ℹ️",
    }
    emoji = severity_emojis.get(severity.upper(), "📢")
    formatted_message = f"{emoji} *CYCLONEGUARD EMERGENCY BROADCAST [{severity.upper()}]*\n\n{message}"

    if token and target_chat:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        payload = {
            "chat_id": target_chat,
            "text": formatted_message,
            "parse_mode": "Markdown",
        }
        try:
            client = get_http_client()
            response = await client.post(url, json=payload, timeout=10.0)
            if response.status_code == 200:
                logger.info("Alert successfully dispatched to Telegram chat %s", target_chat)
                return {
                    "status": "delivered",
                    "channel": "telegram",
                    "chat_id": target_chat,
                    "response": response.json(),
                }
            logger.warning("Telegram dispatch returned HTTP %s: %s", response.status_code, response.text)
        except Exception as exc:
            logger.error("Failed to connect to Telegram API (%s); switching to console broadcast.", exc)

    # Console Fallback Delivery
    print("\n" + "=" * 60)
    print(f"CYCLONEGUARD ALERT SYSTEM [SEVERITY: {severity.upper()}]")
    print("-" * 60)
    print(formatted_message)
    print("=" * 60 + "\n")

    return {
        "status": "simulated_delivered",
        "channel": "console",
        "message": message,
        "severity": severity,
    }
