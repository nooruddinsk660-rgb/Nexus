from collections import defaultdict, deque
from threading import Lock

# Session store - dict[session_id -> deque of turn dicts]
_sessions: dict[str, deque] = defaultdict(lambda: deque(maxlen=12))  # 6 turns = 12 messages
_lock = Lock()

def get_session(session_id: str) -> list[dict]:
    """Return last N messages for this session as list of role/content dicts."""
    with _lock:
        return list(_sessions[session_id])

def save_turn(session_id: str, user_msg: str, assistant_msg: str):
    """Append one turn (user + assistant) to session history."""
    with _lock:
        _sessions[session_id].append({"role": "user",      "content": user_msg})
        _sessions[session_id].append({"role": "assistant", "content": assistant_msg[:600]})

def clear_session(session_id: str):
    """Wipe session history (e.g. on "New chat" button click)."""
    with _lock:
        _sessions.pop(session_id, None)