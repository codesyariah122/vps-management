async function loadDashboard() {

    const cpuElement =
        document.getElementById("cpu");

    if (!cpuElement) {
        return;
    }

    try {

        const response = await fetch(
            "/api/dashboard/overview"
        );

        if (!response.ok) {
            throw new Error(
                "Failed to load dashboard"
            );
        }

        const data = await response.json();


        document.getElementById("cpu").textContent =
            `${data.cpu.percent.toFixed(1)}%`;


        document.getElementById("memory").textContent =
            `${data.memory.percent.toFixed(1)}%`;


        document.getElementById("disk").textContent =
            `${data.disk.percent.toFixed(1)}%`;


        document.getElementById("swap").textContent =
            `${data.swap.percent.toFixed(1)}%`;


        document.getElementById("hostname").textContent =
            data.hostname;


        document.getElementById("os").textContent =
            data.os;


        document.getElementById("kernel").textContent =
            data.kernel;


        document.getElementById("architecture").textContent =
            data.architecture;


        document.getElementById("cores").textContent =
            `${data.cpu.cores} cores / ${data.cpu.threads} threads`;


        document.getElementById("uptime").textContent =
            `${data.uptime.days}d ${data.uptime.hours}h ${data.uptime.minutes}m`;

        setDashboardDetail(data);


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }
}


async function loadServers() {

    const container =
        document.getElementById("servers-container");

    if (!container) {
        return;
    }


    try {

        const response =
            await fetch("/api/servers/");


        if (!response.ok) {

            throw new Error(
                "Failed to load servers"
            );

        }


        const data =
            await response.json();


        const servers =
            data.servers || [];


        document.getElementById(
            "server-count"
        ).textContent =
            `${servers.length} Server`;


        if (servers.length === 0) {

            container.innerHTML = `
                <div class="server-card">
                    No servers found.
                </div>
            `;

            return;
        }


        container.innerHTML =
            servers
                .map(server => {

                    return `
                        <article class="server-card">

                            <div class="server-card-header">

                                <div class="server-card-title">

                                    <h2>
                                        ${server.name}
                                    </h2>

                                </div>


                                <div class="server-online">

                                    <span></span>

                                    Online

                                </div>

                            </div>


                            <div class="server-info">

                                <div class="server-info-item">

                                    <span>
                                        Hostname
                                    </span>

                                    <strong>
                                        ${server.hostname}
                                    </strong>

                                </div>


                                <div class="server-info-item">

                                    <span>
                                        Architecture
                                    </span>

                                    <strong>
                                        ${server.architecture}
                                    </strong>

                                </div>


                                <div class="server-info-item">

                                    <span>
                                        Operating System
                                    </span>

                                    <strong>
                                        ${server.os}
                                    </strong>

                                </div>


                                <div class="server-info-item">

                                    <span>
                                        Kernel
                                    </span>

                                    <strong>
                                        ${server.kernel}
                                    </strong>

                                </div>

                            </div>


                            <div class="server-resources">

                                <div class="resource">

                                    <div class="resource-label">
                                        CPU
                                    </div>

                                    <div class="resource-value">
                                        ${server.cpu.percent.toFixed(1)}%
                                    </div>

                                </div>


                                <div class="resource">

                                    <div class="resource-label">
                                        Memory
                                    </div>

                                    <div class="resource-value">
                                        ${server.memory.percent.toFixed(1)}%
                                    </div>

                                </div>


                                <div class="resource">

                                    <div class="resource-label">
                                        Disk
                                    </div>

                                    <div class="resource-value">
                                        ${server.disk.percent.toFixed(1)}%
                                    </div>

                                </div>

                            </div>

                        </article>
                    `;

                })
                .join("");


    } catch (error) {

        console.error(
            "Servers error:",
            error
        );


        container.innerHTML = `
            <div class="server-card">
                Failed to load servers.
            </div>
        `;

    }

}

async function loadServices() {

    const container =
        document.getElementById("services-container");

    if (!container) {
        return;
    }


    try {

        const response =
            await fetch("/api/services/");


        if (!response.ok) {

            throw new Error(
                "Failed to load services"
            );

        }


        const data =
            await response.json();


        const services =
            data.services || [];


        document.getElementById(
            "service-count"
        ).textContent =
            `${services.length} Services`;


        if (services.length === 0) {

            container.innerHTML = `
                <div class="service-card">
                    No services found.
                </div>
            `;

            return;
        }


        container.innerHTML =
            services
                .map(service => {

                    const status =
                        service.status;


                    const statusLabel =
                        status
                            .replaceAll("_", " ")
                            .replace(
                                /\b\w/g,
                                character =>
                                    character.toUpperCase()
                            );


                    return `
                        <article class="service-card">

                            <div class="service-card-header">

                                <div class="service-title">

                                    <h2>
                                        ${service.name}
                                    </h2>

                                    <p>
                                        ${service.description}
                                    </p>

                                </div>


                                <div
                                    class="service-status ${status}"
                                >
                                    ${statusLabel}
                                </div>

                            </div>


                            <div class="service-details">

                                <div class="service-detail">

                                    <span>
                                        Category
                                    </span>

                                    <strong>
                                        ${service.category}
                                    </strong>

                                </div>


                                <div class="service-detail">

                                    <span>
                                        Status
                                    </span>

                                    <strong>
                                        ${statusLabel}
                                    </strong>

                                </div>

                            </div>

                        </article>
                    `;

                })
                .join("");


    } catch (error) {

        console.error(
            "Services error:",
            error
        );


        container.innerHTML = `
            <div class="service-card">

                Failed to load services.

            </div>
        `;

    }

}

if (document.getElementById("cpu")) {

    loadDashboard();

    setInterval(loadDashboard, 10000);
}

async function loadNginx() {

    const sitesContainer =
        document.getElementById("nginx-sites");

    if (!sitesContainer) {
        return;
    }


    try {

        const response =
            await fetch("/api/nginx/");


        if (!response.ok) {

            throw new Error(
                "Failed to load Nginx information"
            );

        }


        const data =
            await response.json();


        const status =
            data.status;


        const statusElement =
            document.getElementById(
                "nginx-status"
            );


        const stateElement =
            document.getElementById(
                "nginx-state"
            );


        const configElement =
            document.getElementById(
                "nginx-config"
            );


        const siteCountElement =
            document.getElementById(
                "nginx-site-count"
            );


        const testElement =
            document.getElementById(
                "nginx-test"
            );


        let statusLabel;


        if (status === "available") {

            statusLabel = "Available";

        } else if (status === "not_installed") {

            statusLabel = "Not Installed";

        } else if (status === "error") {

            statusLabel = "Configuration Error";

        } else {

            statusLabel = "Unknown";

        }


        statusElement.className =
            `service-status ${status}`;


        statusElement.textContent =
            statusLabel;


        stateElement.textContent =
            statusLabel;


        configElement.textContent =
            data.config_path || "-";


        const sites =
            data.sites || [];


        siteCountElement.textContent =
            `${sites.length} Sites`;


        testElement.textContent =
            data.config_test?.success
                ? "Valid"
                : "Failed";


        if (sites.length === 0) {

            sitesContainer.innerHTML = `
                <div class="nginx-site">
                    No server blocks detected.
                </div>
            `;

            return;

        }


        sitesContainer.innerHTML =
            sites
                .map(site => {

                    const domains =
                        site.domains || [];


                    const primaryDomain =
                        domains[0] || "-";


                    return `
                        <article class="nginx-site">

                            <div class="nginx-site-header">

                                <div class="nginx-domain">

                                    ${primaryDomain}

                                </div>


                                <div
                                    class="nginx-ssl ${site.ssl
                            ? "enabled"
                            : "disabled"
                        }"
                                >

                                    ${site.ssl
                            ? "SSL Enabled"
                            : "HTTP"
                        }

                                </div>

                            </div>


                            <div class="nginx-site-details">

                                <div class="nginx-site-detail">

                                    <span>
                                        Domains
                                    </span>

                                    <strong>
                                        ${domains.join(", ")}
                                    </strong>

                                </div>


                                <div class="nginx-site-detail">

                                    <span>
                                        Root
                                    </span>

                                    <strong>
                                        ${site.root || "-"}
                                    </strong>

                                </div>


                                <div class="nginx-site-detail">

                                    <span>
                                        Listen
                                    </span>

                                    <strong>
                                        ${site.listen?.join(", ")
                        || "-"
                        }
                                    </strong>

                                </div>

                            </div>

                        </article>
                    `;

                })
                .join("");


    } catch (error) {

        console.error(
            "Nginx error:",
            error
        );


        sitesContainer.innerHTML = `
            <div class="nginx-site">
                Failed to load Nginx information.
            </div>
        `;

    }

}

async function loadProjects() {

    const container =
        document.getElementById(
            "projects-container"
        );

    if (!container) {
        return;
    }


    try {

        const response =
            await fetch("/api/projects/");


        if (!response.ok) {

            throw new Error(
                "Failed to load projects"
            );

        }


        const data =
            await response.json();


        const projects =
            data.projects || [];


        const countElement =
            document.getElementById(
                "project-count"
            );


        if (countElement) {

            countElement.textContent =
                `${projects.length} Projects`;

        }


        if (projects.length === 0) {

            container.innerHTML = `
                <div class="project-card">

                    No projects detected.

                </div>
            `;

            return;

        }


        container.innerHTML =
            projects
                .map(project => {

                    const status =
                        project.exists &&
                            project.is_directory
                            ? "online"
                            : "missing";


                    const statusLabel =
                        status === "online"
                            ? "Directory Found"
                            : "Missing";


                    return `

                        <article class="project-card">

                            <div class="project-card-header">

                                <div class="project-title">

                                    <h2>
                                        ${project.name}
                                    </h2>

                                    <div class="project-path">
                                        ${project.path}
                                    </div>

                                </div>


                                <div
                                    class="project-status ${status}"
                                >
                                    ${statusLabel}
                                </div>

                            </div>


                            <div class="project-details">


                                <div class="project-detail">

                                    <span>
                                        Framework
                                    </span>

                                    <strong>
                                        ${project.framework}
                                    </strong>

                                </div>

                                <div class="project-detail">

                                    <span>
                                        Last Detected Change
                                    </span>

                                    <strong>
                                        ${project.activity?.last_modified
                            ? new Date(project.activity.last_modified).toLocaleString()
                            : "-"
                        }
                                    </strong>

                                </div>


                                <div class="project-detail">

                                    <span>
                                        Git Branch
                                    </span>

                                    <strong>
                                        ${project.git?.branch
                        || "-"
                        }
                                    </strong>

                                </div>


                                <div class="project-detail">

                                    <span>
                                        SSL
                                    </span>

                                    <strong>
                                        ${project.ssl
                            ? "Enabled"
                            : "Disabled"
                        }
                                    </strong>

                                </div>


                                <div class="project-detail">

                                    <span>
                                        Listen
                                    </span>

                                    <strong>
                                        ${project.listen?.join(", ")
                        || "-"
                        }
                                    </strong>

                                </div>


                                <div
                                    class="
                                        project-detail
                                        project-domains
                                    "
                                >

                                    <span>
                                        Domains
                                    </span>

                                    <strong>
                                        ${project.domains?.join(", ")
                        || "-"
                        }
                                    </strong>

                                </div>


                            </div>

                        </article>

                    `;

                })
                .join("");


    } catch (error) {

        console.error(
            "Projects error:",
            error
        );


        container.innerHTML = `

            <div class="project-card">

                Failed to load projects.

            </div>

        `;

    }

}

if (document.getElementById("nginx-sites")) {

    loadNginx();

}

loadServers();

loadServices();

if (document.getElementById("projects-container")) loadProjectWorkspace();


function formatBytes(bytes) {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / (1024 ** index)).toFixed(index ? 1 : 0)} ${units[index]}`;
}


function setDashboardDetail(data) {
    const alertsPanel = document.getElementById("alerts-panel");
    if (!alertsPanel) return;

    const warnings = data.warnings || [];
    alertsPanel.hidden = warnings.length === 0;
    if (warnings.length) {
        const names = warnings.map(item => item.resource.toUpperCase()).join(", ");
        document.getElementById("alerts-title").textContent = `${names} usage is above its warning threshold`;
        document.getElementById("alerts-copy").textContent = warnings.map(item => `${item.resource.toUpperCase()} ${item.percent.toFixed(1)}% (limit ${item.threshold}%)`).join(" · ");
    }

    const serviceContainer = document.getElementById("dashboard-services");
    serviceContainer.replaceChildren();
    (data.services || []).forEach(service => {
        const row = document.createElement("div");
        row.className = "health-row";
        const name = document.createElement("strong");
        name.textContent = service.name;
        const status = document.createElement("span");
        status.className = `service-status ${service.status}`;
        status.textContent = service.status.replaceAll("_", " ");
        row.append(name, status);
        serviceContainer.append(row);
    });

    const processes = document.getElementById("top-processes");
    processes.replaceChildren();
    (data.top_processes || []).forEach(process => {
        const row = document.createElement("div");
        row.className = "process-row";
        const name = document.createElement("strong");
        name.textContent = `${process.name} · #${process.pid}`;
        const usage = document.createElement("span");
        usage.textContent = `CPU ${process.cpu_percent}% · RAM ${process.memory_percent}%`;
        row.append(name, usage);
        processes.append(row);
    });

    document.getElementById("network-received").textContent = formatBytes(data.network.bytes_received);
    document.getElementById("network-sent").textContent = formatBytes(data.network.bytes_sent);
    document.getElementById("last-updated").textContent = new Date(data.generated_at).toLocaleTimeString();
}


async function loadLogs() {
    const output = document.getElementById("logs-output");
    if (!output) return;
    output.textContent = "Loading...";
    try {
        const response = await fetch("/api/logs/?lines=100");
        const data = await response.json();
        document.getElementById("log-source").textContent = `Source: ${data.source}`;
        document.getElementById("log-message").textContent = data.message || "Latest entries from the host.";
        document.getElementById("log-count").textContent = `${data.lines.length} entries`;
        output.textContent = data.lines.join("\n") || "No log entries available.";
    } catch (error) {
        output.textContent = "Failed to load system logs.";
    }
}


async function loadSettings() {
    const form = document.getElementById("settings-form");
    if (!form) return;
    try {
        const response = await fetch("/api/settings/");
        const settings = await response.json();
        Object.entries(settings).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; });
    } catch (error) {
        document.getElementById("settings-feedback").textContent = "Could not load settings.";
    }
    form.addEventListener("submit", async event => {
        event.preventDefault();
        const feedback = document.getElementById("settings-feedback");
        const values = Object.fromEntries(new FormData(form));
        Object.keys(values).forEach(key => { values[key] = Number(values[key]); });
        feedback.textContent = "Saving...";
        try {
            const response = await fetch("/api/settings/", {method: "PUT", headers: {"Content-Type": "application/json"}, body: JSON.stringify(values)});
            if (!response.ok) throw new Error("Failed");
            feedback.textContent = "Saved successfully.";
        } catch (error) { feedback.textContent = "Unable to save settings."; }
    });
}


if (document.getElementById("logs-output")) {
    loadLogs();
    document.getElementById("refresh-logs").addEventListener("click", loadLogs);
}
loadSettings();


let managedProjects = [];
let projectView = "grid";

function projectStatus(project) {
    if (!project.exists || !project.is_directory && project.type !== "proxy") return "missing";
    if (project.git?.is_dirty) return "dirty";
    return "healthy";
}

function displayDate(value) {
    return value ? new Date(value).toLocaleString([], {dateStyle: "medium", timeStyle: "short"}) : "No activity data";
}

function createProjectCard(project) {
    const status = projectStatus(project);
    const card = document.createElement("article");
    card.className = "project-workspace-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Open details for ${project.name}`);

    const header = document.createElement("div"); header.className = "workspace-card-header";
    const title = document.createElement("div");
    const name = document.createElement("h2"); name.textContent = project.name;
    const path = document.createElement("p"); path.className = "workspace-path"; path.textContent = project.path || project.proxy_pass?.[0] || "Reverse proxy";
    title.append(name, path);
    const badge = document.createElement("span"); badge.className = `workspace-status ${status}`;
    badge.textContent = status === "healthy" ? "Healthy" : status === "dirty" ? "Git changes" : "Missing";
    header.append(title, badge);

    const tags = document.createElement("div"); tags.className = "project-tags";
    [project.framework, project.ssl ? "SSL" : "HTTP", project.type === "proxy" ? "Proxy" : "Filesystem"].forEach(label => {
        const tag = document.createElement("span"); tag.textContent = label; tags.append(tag);
    });

    const meta = document.createElement("div"); meta.className = "workspace-meta";
    const domain = document.createElement("div"); domain.innerHTML = "<span>Primary domain</span>";
    const domainValue = document.createElement("strong"); domainValue.textContent = project.domains?.[0] || "Not configured"; domain.append(domainValue);
    const git = document.createElement("div"); git.innerHTML = "<span>Git branch</span>";
    const gitValue = document.createElement("strong"); gitValue.textContent = project.git?.branch || "Not a repository"; git.append(gitValue);
    meta.append(domain, git);

    const footer = document.createElement("div"); footer.className = "workspace-card-footer";
    const updated = document.createElement("span"); updated.textContent = `Updated ${displayDate(project.activity?.last_modified)}`;
    const details = document.createElement("span"); details.className = "details-arrow"; details.textContent = "Details →";
    footer.append(updated, details);
    card.append(header, tags, meta, footer);
    card.addEventListener("click", () => openProjectModal(project));
    card.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openProjectModal(project); } });
    return card;
}

function renderProjectWorkspace() {
    const search = document.getElementById("project-search").value.toLowerCase().trim();
    const framework = document.getElementById("project-framework-filter").value;
    const statusFilter = document.getElementById("project-status-filter").value;
    const projects = managedProjects.filter(project => {
        const haystack = [project.name, project.path, project.framework, project.git?.branch, ...(project.domains || [])].join(" ").toLowerCase();
        return (!search || haystack.includes(search)) && (framework === "all" || project.framework === framework) && (statusFilter === "all" || projectStatus(project) === statusFilter);
    });
    const container = document.getElementById("projects-container");
    container.classList.toggle("projects-list", projectView === "list");
    container.replaceChildren();
    if (!projects.length) {
        const empty = document.createElement("div"); empty.className = "project-empty"; empty.textContent = "No projects match the current filters."; container.append(empty); return;
    }
    projects.forEach(project => container.append(createProjectCard(project)));
}

function updateProjectSummary() {
    const statuses = managedProjects.map(projectStatus);
    document.getElementById("summary-total").textContent = managedProjects.length;
    document.getElementById("summary-healthy").textContent = statuses.filter(status => status === "healthy").length;
    document.getElementById("summary-dirty").textContent = statuses.filter(status => status === "dirty").length;
    document.getElementById("summary-missing").textContent = statuses.filter(status => status === "missing").length;
}

function openProjectModal(project) {
    const modal = document.getElementById("project-modal");
    const content = document.getElementById("project-modal-content");
    content.replaceChildren();
    const eyebrow = document.createElement("span"); eyebrow.className = "eyebrow"; eyebrow.textContent = "Project workspace";
    const title = document.createElement("h2"); title.id = "project-modal-title"; title.textContent = project.name;
    const intro = document.createElement("p"); intro.className = "modal-path"; intro.textContent = project.path || project.proxy_pass?.join(", ") || "Reverse proxy";
    const actions = document.createElement("div"); actions.className = "project-modal-actions";
    if (project.domains?.[0] && !project.domains[0].includes("_")) {
        const open = document.createElement("a"); open.className = "button"; open.target = "_blank"; open.rel = "noreferrer"; open.href = `${project.ssl ? "https" : "http"}://${project.domains[0]}`; open.textContent = "Open site ↗"; actions.append(open);
    }
    const copy = document.createElement("button"); copy.className = "button button-secondary"; copy.type = "button"; copy.textContent = "Copy path"; copy.disabled = !project.path;
    copy.addEventListener("click", async () => { await navigator.clipboard?.writeText(project.path); copy.textContent = "Copied"; }); actions.append(copy);
    const notice = document.createElement("p"); notice.className = "action-notice"; notice.textContent = "Deploy, restart, and configuration edits will be enabled after admin authentication is configured.";
    const details = document.createElement("div"); details.className = "project-detail-grid";
    const rows = [["Framework", project.framework], ["Status", projectStatus(project)], ["SSL", project.ssl ? "Enabled" : "Disabled"], ["Git branch", project.git?.branch || "Not a repository"], ["Last commit", project.git?.latest_commit ? `${project.git.latest_commit.hash} · ${project.git.latest_commit.message}` : "Unavailable"], ["Last detected change", displayDate(project.activity?.last_modified)], ["Domains", project.domains?.join(", ") || "None"], ["Listen / upstream", project.listen?.join(", ") || project.proxy_pass?.join(", ") || "None"]];
    rows.forEach(([label, value]) => { const row = document.createElement("div"); const key = document.createElement("span"); const val = document.createElement("strong"); key.textContent = label; val.textContent = value; row.append(key, val); details.append(row); });
    content.append(eyebrow, title, intro, actions, notice, details);
    modal.hidden = false;
    document.body.classList.add("modal-open");
}

function closeProjectModal() { document.getElementById("project-modal").hidden = true; document.body.classList.remove("modal-open"); }

async function loadProjectWorkspace() {
    const container = document.getElementById("projects-container");
    try {
        const response = await fetch("/api/projects/");
        if (!response.ok) throw new Error("Failed to load projects");
        managedProjects = (await response.json()).projects || [];
        document.getElementById("project-count").textContent = `${managedProjects.length} Projects`;
        const frameworkFilter = document.getElementById("project-framework-filter");
        [...new Set(managedProjects.map(project => project.framework).filter(Boolean))].sort().forEach(framework => { const option = document.createElement("option"); option.value = framework; option.textContent = framework; frameworkFilter.append(option); });
        updateProjectSummary(); renderProjectWorkspace();
        ["project-search", "project-framework-filter", "project-status-filter"].forEach(id => document.getElementById(id).addEventListener(id === "project-search" ? "input" : "change", renderProjectWorkspace));
        document.querySelectorAll(".view-toggle").forEach(button => button.addEventListener("click", () => { projectView = button.dataset.view; document.querySelectorAll(".view-toggle").forEach(item => item.classList.toggle("active", item === button)); renderProjectWorkspace(); }));
        document.querySelectorAll("[data-close-project-modal]").forEach(button => button.addEventListener("click", closeProjectModal));
        document.addEventListener("keydown", event => { if (event.key === "Escape" && !document.getElementById("project-modal").hidden) closeProjectModal(); });
    } catch (error) { container.textContent = "Failed to load project workspace."; }
}
