from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.api.routes import (
    dashboard,
    servers,
    services,
    nginx,
    projects,
    logs,
    settings,
    maintenance,
)


app = FastAPI(
    title="VPS Management",
    description="VPS monitoring and management dashboard",
    version="0.1.0",
)


app.mount(
    "/static",
    StaticFiles(directory="app/static"),
    name="static",
)


templates = Jinja2Templates(
    directory="app/templates"
)


@app.get("/")
async def dashboard_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="dashboard.html",
    )


@app.get("/servers")
async def servers_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="servers.html",
    )

@app.get("/services")
async def services_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="services.html",
    )
    
@app.get("/nginx")
async def nginx_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="nginx.html",
    )
    
@app.get("/projects")
async def projects_page(request: Request):

    return templates.TemplateResponse(
        request=request,
        name="projects.html",
    )


@app.get("/logs")
async def logs_page(request: Request):
    return templates.TemplateResponse(request=request, name="logs.html")


@app.get("/settings")
async def settings_page(request: Request):
    return templates.TemplateResponse(request=request, name="settings.html")


@app.get("/maintenance")
async def maintenance_page(request: Request):
    return templates.TemplateResponse(request=request, name="maintenance.html")

@app.get("/health")
async def health():

    return {
        "status": "ok",
        "application": "vps-management",
        "version": "0.1.0",
    }


app.include_router(
    dashboard.router,
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


app.include_router(
    servers.router,
    prefix="/api/servers",
    tags=["Servers"],
)


app.include_router(
    services.router,
    prefix="/api/services",
    tags=["Services"],
)


app.include_router(
    nginx.router,
    prefix="/api/nginx",
    tags=["Nginx"],
)


app.include_router(
    projects.router,
    prefix="/api/projects",
    tags=["Projects"],
)

app.include_router(logs.router, prefix="/api/logs", tags=["Logs"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])
app.include_router(maintenance.router, prefix="/api/maintenance", tags=["Maintenance"])
