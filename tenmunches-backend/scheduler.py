"""
Background scheduler for TenMunches.

Runs the data refresh pipeline on a weekly schedule using APScheduler.
Also triggers an initial refresh if the database is empty.
"""

import threading
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from db import get_all_categories

_scheduler: BackgroundScheduler | None = None


def _refresh_job() -> None:
    """Run the full refresh pipeline (imported lazily to avoid circular imports)."""
    from refresh import run_full_refresh
    try:
        run_full_refresh()
    except Exception as e:
        print(f"❌ Scheduled refresh failed: {e}")


def _initial_check() -> None:
    """If the DB is empty, run a refresh on a background thread."""
    try:
        data = get_all_categories()
        if not data:
            print("📦 Database is empty — starting initial data refresh...")
            _refresh_job()
        else:
            print(f"✅ Database has {len(data)} categories, no initial refresh needed.")
    except Exception as e:
        print(f"⚠️ Could not check DB on startup: {e}")


def start_scheduler() -> None:
    """Start the APScheduler background scheduler."""
    global _scheduler
    if _scheduler is not None:
        return  # Already started

    _scheduler = BackgroundScheduler()

    # Weekly refresh (every 7 days)
    _scheduler.add_job(
        _refresh_job,
        trigger=IntervalTrigger(days=7),
        id="weekly_refresh",
        name="Weekly data refresh",
        replace_existing=True,
    )

    _scheduler.start()
    print("⏰ Scheduler started: weekly refresh every 7 days")

    # Check if initial data load is needed (run in background thread)
    thread = threading.Thread(target=_initial_check, daemon=True)
    thread.start()
