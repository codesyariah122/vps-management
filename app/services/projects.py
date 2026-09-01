from pathlib import Path

from app.services.nginx import (
    get_nginx_config_path,
    get_nginx_sites,
)


def detect_framework(path: Path) -> str:

    if (path / "artisan").exists():
        return "Laravel"

    if (path / "wp-config.php").exists():
        return "WordPress"

    if (path / "composer.json").exists():
        return "PHP"

    if (path / "package.json").exists():

        if any(
            (
                path / filename
            ).exists()
            for filename in (
                "nuxt.config.ts",
                "nuxt.config.js",
                "nuxt.config.mjs",
            )
        ):
            return "Nuxt"

        if any(
            (
                path / filename
            ).exists()
            for filename in (
                "next.config.js",
                "next.config.ts",
                "next.config.mjs",
            )
        ):
            return "Next.js"

        if any(
            (
                path / filename
            ).exists()
            for filename in (
                "vite.config.js",
                "vite.config.ts",
                "vite.config.mjs",
            )
        ):
            return "Vite"

        return "Node.js"

    if (path / "requirements.txt").exists():
        return "Python"

    if (
        (path / "pyproject.toml").exists()
        or (path / "main.py").exists()
    ):
        return "Python"

    return "Unknown"


def get_git_info(path: Path):

    git_directory = path / ".git"

    if not git_directory.exists():

        return {
            "is_repository": False,
            "branch": None,
        }

    try:

        head_file = (
            git_directory /
            "HEAD"
        )

        if not head_file.exists():

            return {
                "is_repository": True,
                "branch": None,
            }

        head = (
            head_file
            .read_text()
            .strip()
        )

        if head.startswith("ref:"):

            branch = head.split(
                "refs/heads/",
                1,
            )[-1]

        else:

            branch = head[:8]

        return {
            "is_repository": True,
            "branch": branch,
        }

    except OSError:

        return {
            "is_repository": True,
            "branch": None,
        }


def get_nginx_prefix():

    config_path = get_nginx_config_path()

    if not config_path:
        return None

    config = Path(config_path)

    try:

        return config.parent.parent

    except Exception:

        return None


def normalize_root(
    root: str | None,
) -> Path | None:

    if not root:
        return None

    path = Path(root)

    if not path.is_absolute():

        prefix = get_nginx_prefix()

        if prefix:

            path = (
                prefix / path
            ).resolve()

        else:

            path = path.resolve()

    # Laravel / PHP projects
    # biasanya menggunakan:
    #
    # /project/public
    #
    # sedangkan project sebenarnya:
    #
    # /project

    if path.name == "public":

        parent = path.parent

        if (
            (parent / "artisan").exists()
            or (parent / "composer.json").exists()
            or (parent / "package.json").exists()
            or (parent / "wp-config.php").exists()
        ):
            return parent

    return path


def build_project(
    root: str | None,
    domains: list[str],
    listen: list[str],
    ssl: bool,
    proxy_pass: list[str] | None = None,
):

    path = normalize_root(root)

    if not path:
        return None

    exists = path.exists()

    is_directory = path.is_dir()

    git = (
        get_git_info(path)
        if is_directory
        else {
            "is_repository": False,
            "branch": None,
        }
    )

    return {
        "name": path.name or str(path),
        "path": str(path),
        "exists": exists,
        "is_directory": is_directory,
        "framework": (
            detect_framework(path)
            if is_directory
            else "Unknown"
        ),
        "git": git,
        "domains": domains,
        "listen": listen,
        "ssl": ssl,
        "type": "filesystem",
        "proxy_pass": proxy_pass or [],
    }


def build_proxy_project(
    domains: list[str],
    listen: list[str],
    ssl: bool,
    proxy_pass: list[str],
):

    primary_domain = (
        domains[0]
        if domains
        else "Unknown Project"
    )

    return {
        "name": primary_domain,
        "path": None,
        "exists": True,
        "is_directory": False,
        "framework": "Proxy",
        "git": {
            "is_repository": False,
            "branch": None,
        },
        "domains": domains,
        "listen": listen,
        "ssl": ssl,
        "type": "proxy",
        "proxy_pass": proxy_pass,
    }


def merge_project(
    project: dict,
    site: dict,
):

    domains = site.get(
        "domains",
        [],
    )

    listen = site.get(
        "listen",
        [],
    )

    proxy_pass = site.get(
        "proxy_pass",
        [],
    )

    for domain in domains:

        if domain not in project["domains"]:

            project["domains"].append(
                domain
            )

    for value in listen:

        if value not in project["listen"]:

            project["listen"].append(
                value
            )

    for target in proxy_pass:

        if target not in project["proxy_pass"]:

            project["proxy_pass"].append(
                target
            )

    if site.get("ssl"):

        project["ssl"] = True


def get_projects():

    projects_by_path = {}

    proxy_projects = {}

    sites = get_nginx_sites()

    for site in sites:

        root = site.get("root")

        domains = site.get(
            "domains",
            [],
        )

        listen = site.get(
            "listen",
            [],
        )

        ssl = site.get(
            "ssl",
            False,
        )

        proxy_pass = site.get(
            "proxy_pass",
            [],
        )

        # ==================================================
        # FILESYSTEM PROJECT
        # ==================================================

        if root:

            path = normalize_root(root)

            if not path:
                continue

            key = str(path)

            if key not in projects_by_path:

                project = build_project(
                    root=root,
                    domains=domains,
                    listen=listen,
                    ssl=ssl,
                    proxy_pass=proxy_pass,
                )

                if project:

                    projects_by_path[key] = project

            else:

                merge_project(
                    projects_by_path[key],
                    site,
                )

            continue

        # ==================================================
        # PROXY PROJECT
        # ==================================================

        if proxy_pass:

            proxy_key = "|".join(
                sorted(proxy_pass)
            )

            if proxy_key not in proxy_projects:

                proxy_projects[proxy_key] = (
                    build_proxy_project(
                        domains=domains,
                        listen=listen,
                        ssl=ssl,
                        proxy_pass=proxy_pass,
                    )
                )

            else:

                merge_project(
                    proxy_projects[proxy_key],
                    site,
                )

    return (
        list(projects_by_path.values())
        + list(proxy_projects.values())
    )