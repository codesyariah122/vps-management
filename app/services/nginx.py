import os
import platform
import re
import shutil
import subprocess
from pathlib import Path


def nginx_command():
    return shutil.which("nginx")


def nginx_installed():
    return nginx_command() is not None


def get_nginx_status():
    command = nginx_command()

    if not command:
        return "not_installed"

    try:

        result = subprocess.run(
            [command, "-t"],
            capture_output=True,
            text=True,
            timeout=5,
        )

        if result.returncode == 0:
            return "available"

        return "error"

    except (
        subprocess.TimeoutExpired,
        OSError,
    ):
        return "unknown"


def get_nginx_config_path():

    command = nginx_command()

    if not command:
        return None

    try:

        result = subprocess.run(
            [command, "-V"],
            capture_output=True,
            text=True,
            timeout=5,
        )

        output = (
            result.stdout +
            result.stderr
        )

        match = re.search(
            r"--conf-path=([^\s]+)",
            output,
        )

        if match:
            return match.group(1)

    except (
        subprocess.TimeoutExpired,
        OSError,
    ):
        pass

    system = platform.system().lower()

    if system == "linux":

        return "/etc/nginx/nginx.conf"

    if system == "darwin":

        possible_paths = [
            "/usr/local/etc/nginx/nginx.conf",
            "/opt/homebrew/etc/nginx/nginx.conf",
        ]

        for path in possible_paths:

            if os.path.exists(path):
                return path

    return None


def get_nginx_test():

    command = nginx_command()

    if not command:

        return {
            "success": False,
            "message": "Nginx is not installed",
        }

    try:

        result = subprocess.run(
            [command, "-t"],
            capture_output=True,
            text=True,
            timeout=5,
        )

        output = (
            result.stderr.strip()
            or result.stdout.strip()
        )

        return {
            "success": result.returncode == 0,
            "message": output,
        }

    except subprocess.TimeoutExpired:

        return {
            "success": False,
            "message": "Nginx config test timed out",
        }

    except OSError as error:

        return {
            "success": False,
            "message": str(error),
        }


def get_nginx_sites():

    command = nginx_command()

    if not command:
        return []

    try:

        result = subprocess.run(
            [command, "-T"],
            capture_output=True,
            text=True,
            timeout=10,
        )

        if result.returncode != 0:
            return []

        config = (
            result.stderr
            + "\n"
            + result.stdout
        )

        return parse_nginx_config(config)

    except (
        subprocess.TimeoutExpired,
        OSError,
    ):
        return []


def parse_nginx_config(config: str):

    sites = []

    blocks = re.findall(
        r"server\s*\{(.*?)\}",
        config,
        re.DOTALL,
    )

    for block in blocks:

        server_names = re.findall(
            r"server_name\s+([^;]+);",
            block,
        )

        root_match = re.search(
            r"\broot\s+([^;]+);",
            block,
        )

        listen_matches = re.findall(
            r"\blisten\s+([^;]+);",
            block,
        )

        proxy_matches = re.findall(
            r"\bproxy_pass\s+([^;]+);",
            block,
        )

        ssl = bool(
            re.search(
                r"\bssl\b",
                block,
            )
        )

        if not server_names:
            continue

        domains = []

        for names in server_names:

            domains.extend(
                name.strip()
                for name in names.split()
                if name.strip()
            )

        root = (
            root_match.group(1).strip()
            if root_match
            else None
        )

        listen = [
            value.strip()
            for value in listen_matches
        ]

        proxy_pass = [
            value.strip()
            for value in proxy_matches
        ]

        sites.append(
            {
                "domains": domains,
                "root": root,
                "listen": listen,
                "proxy_pass": proxy_pass,
                "ssl": ssl,
            }
        )

    return sites


def get_nginx_info():

    return {
        "installed": nginx_installed(),
        "status": get_nginx_status(),
        "config_path": get_nginx_config_path(),
        "config_test": get_nginx_test(),
        "sites": get_nginx_sites(),
    }