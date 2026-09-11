import platform
import shutil
import subprocess

import psutil


def get_platform():
    return platform.system().lower()


def is_linux():
    return get_platform() == "linux"


def is_macos():
    return get_platform() == "darwin"


def command_exists(command: str) -> bool:
    return shutil.which(command) is not None


def process_running(process_names: list[str]) -> bool:
    names = {
        name.lower()
        for name in process_names
    }

    for process in psutil.process_iter(
        ["name", "cmdline"]
    ):
        try:
            process_name = process.info["name"]

            if process_name:
                process_name = process_name.lower()

                if process_name in names:
                    return True

            cmdline = process.info["cmdline"] or []

            for argument in cmdline:

                argument_name = argument.lower()

                if argument_name in names:
                    return True

        except (
            psutil.NoSuchProcess,
            psutil.AccessDenied,
            psutil.ZombieProcess,
        ):
            continue

    return False


def get_linux_service_status(
    service_name: str,
) -> str:

    if not command_exists("systemctl"):
        return "unsupported"

    try:

        result = subprocess.run(
            [
                "systemctl",
                "is-active",
                service_name,
            ],
            capture_output=True,
            text=True,
            timeout=3,
        )

        status = result.stdout.strip()

        if status == "active":
            return "running"

        if status == "inactive":
            return "stopped"

        if status == "failed":
            return "failed"

        return "unknown"

    except (
        subprocess.TimeoutExpired,
        OSError,
    ):
        return "unknown"


def get_service_status(
    service_name: str,
    process_names: list[str],
    command: str | None = None,
) -> str:

    if is_linux():

        return get_linux_service_status(
            service_name
        )

    if is_macos():

        if process_running(process_names):
            return "running"

        if command and command_exists(command):
            return "stopped"

        return "not_installed"

    return "unsupported"



SERVICE_DEFINITIONS = [
    {
        "id": "nginx",
        "name": "Nginx",
        "description": "Web server and reverse proxy",
        "linux_service": "nginx",
        "process_names": [
            "nginx",
        ],
        "command": "nginx",
        "category": "Web Server",
    },
    {
        "id": "mysql",
        "name": "MySQL",
        "description": "Relational database server",
        "linux_service": "mysql",
        "process_names": [
            "mysqld",
            "mysql",
        ],
        "command": "mysql",
        "category": "Database",
    },
    {
        "id": "redis",
        "name": "Redis",
        "description": "In-memory database and cache",
        "linux_service": "redis-server",
        "process_names": [
            "redis-server",
        ],
        "command": "redis-server",
        "category": "Cache",
    },
    {
        "id": "docker",
        "name": "Docker",
        "description": "Container runtime",
        "linux_service": "docker",
        "process_names": [
            "dockerd",
        ],
        "command": "docker",
        "category": "Container",
    },
]


def get_service_definition(service_id: str) -> dict | None:
    return next((item for item in SERVICE_DEFINITIONS if item["id"] == service_id), None)


def run_service_action(service_id: str, action: str) -> dict:
    """Run a limited systemctl action for an explicitly allowlisted service."""
    definition = get_service_definition(service_id)
    if not definition:
        raise ValueError("Service is not allowlisted for dashboard control.")
    allowed_actions = {"restart"}
    if service_id == "nginx":
        allowed_actions.add("reload")
    if action not in allowed_actions:
        raise ValueError("This action is not available for the selected service.")
    if not is_linux() or not command_exists("systemctl"):
        raise ValueError("Service control is available only on a systemd Linux host.")
    try:
        result = subprocess.run(
            ["systemctl", action, definition["linux_service"]],
            capture_output=True,
            text=True,
            timeout=20,
        )
    except (OSError, subprocess.TimeoutExpired) as error:
        raise ValueError("The service command did not complete safely.") from error
    if result.returncode != 0:
        detail = (result.stderr or result.stdout or "systemctl returned an error").strip()
        raise ValueError(detail[:220])
    return {"id": service_id, "action": action, "status": get_linux_service_status(definition["linux_service"])}

def get_services():

    services = []

    for definition in SERVICE_DEFINITIONS:

        status = get_service_status(
            service_name=definition["linux_service"],
            process_names=definition["process_names"],
            command=definition["command"],
        )

        services.append(
            {
                "id": definition["id"],
                "name": definition["name"],
                "description": definition["description"],
                "category": definition["category"],
                "status": status,
            }
        )

    return services
