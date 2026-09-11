import platform
import socket
import time
from collections import deque
from datetime import datetime, timezone

import psutil


NETWORK_SAMPLES = deque(maxlen=80)


def get_system_info():

    memory = psutil.virtual_memory()
    swap = psutil.swap_memory()
    disk = psutil.disk_usage("/")

    return {
        "hostname": socket.gethostname(),

        "os": platform.platform(),

        "kernel": platform.release(),

        "architecture": platform.machine(),

        "cpu": {
            "percent": psutil.cpu_percent(interval=0.5),

            "cores": psutil.cpu_count(
                logical=False
            ),

            "threads": psutil.cpu_count(
                logical=True
            ),

            "load_average": get_load_average(),
        },

        "memory": {
            "total": memory.total,
            "used": memory.used,
            "available": memory.available,
            "percent": memory.percent,
        },

        "swap": {
            "total": swap.total,
            "used": swap.used,
            "available": swap.free,
            "percent": swap.percent,
        },

        "disk": {
            "total": disk.total,
            "used": disk.used,
            "available": disk.free,
            "percent": disk.percent,
        },

        "uptime": get_uptime(),

        "network": get_network_info(),

        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def get_load_average():

    try:

        load = psutil.getloadavg()

        return {
            "1m": load[0],
            "5m": load[1],
            "15m": load[2],
        }

    except (AttributeError, OSError):

        return {
            "1m": 0,
            "5m": 0,
            "15m": 0,
        }


def get_uptime():

    boot_time = psutil.boot_time()

    uptime = time.time() - boot_time

    days = int(uptime // 86400)

    hours = int(
        (uptime % 86400) // 3600
    )

    minutes = int(
        (uptime % 3600) // 60
    )

    return {
        "seconds": int(uptime),
        "days": days,
        "hours": hours,
        "minutes": minutes,
    }


def get_network_info():
    """Return network totals and in-memory throughput samples."""
    counters = psutil.net_io_counters()

    now = time.time()
    sample = {
        "timestamp": now,
        "bytes_sent": counters.bytes_sent,
        "bytes_received": counters.bytes_recv,
    }
    previous = NETWORK_SAMPLES[-1] if NETWORK_SAMPLES else None
    elapsed = now - previous["timestamp"] if previous else 0
    received_rate = max(0, (sample["bytes_received"] - previous["bytes_received"]) / elapsed) if elapsed else 0
    sent_rate = max(0, (sample["bytes_sent"] - previous["bytes_sent"]) / elapsed) if elapsed else 0
    NETWORK_SAMPLES.append(sample)

    return {
        "bytes_sent": counters.bytes_sent,
        "bytes_received": counters.bytes_recv,
        "packets_sent": counters.packets_sent,
        "packets_received": counters.packets_recv,
        "received_rate": received_rate,
        "sent_rate": sent_rate,
        "history": list(NETWORK_SAMPLES),
    }


def get_top_processes(limit: int = 8):
    """Return a small resource-heavy process summary for diagnostics."""
    processes = []

    for process in psutil.process_iter([
        "pid", "name", "memory_percent", "cpu_percent", "status",
    ]):
        try:
            info = process.info
            processes.append({
                "pid": info["pid"],
                "name": info["name"] or "Unknown",
                "cpu_percent": round(info["cpu_percent"] or 0, 1),
                "memory_percent": round(info["memory_percent"] or 0, 1),
                "status": info["status"] or "unknown",
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue

    return sorted(
        processes,
        key=lambda item: (item["cpu_percent"], item["memory_percent"]),
        reverse=True,
    )[:limit]
