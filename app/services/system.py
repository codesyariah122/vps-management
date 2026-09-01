import platform
import socket
import time

import psutil


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