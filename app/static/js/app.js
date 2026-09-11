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

let adminSession = {authenticated: false, csrf_token: null};

async function getAdminSession() {
    try {
        const response = await fetch("/api/auth/session");
        if (response.ok) adminSession = await response.json();
    } catch (error) {
        adminSession = {authenticated: false, csrf_token: null};
    }
    return adminSession;
}

async function runServiceAction(service, action, button) {
    if (!window.confirm(`Confirm ${action} of ${service.name}? This may briefly interrupt traffic.`)) return;
    button.disabled = true;
    button.textContent = "Working…";
    try {
        const response = await fetch(`/api/services/${service.id}/action`, {
            method: "POST",
            headers: {"Content-Type": "application/json", "X-CSRF-Token": adminSession.csrf_token || ""},
            body: JSON.stringify({action}),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Service action failed");
        await loadServices();
    } catch (error) {
        button.disabled = false;
        button.textContent = "Action failed";
        window.alert(error.message);
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

        await getAdminSession();


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

        container.querySelectorAll(".service-card").forEach((card, index) => {
            const service = services[index];
            if (!service) return;
            const actions = document.createElement("div");
            if (!adminSession.authenticated || !["running", "failed", "stopped"].includes(service.status)) {
                const note = document.createElement("p"); note.className = "service-action-note";
                note.textContent = adminSession.authenticated ? "Unavailable on this host." : "Sign in from Maintenance to enable protected controls.";
                actions.append(note);
            } else {
                actions.className = "service-actions";
                ["restart", ...(service.id === "nginx" ? ["reload"] : [])].forEach(action => {
                    const button = document.createElement("button"); button.type = "button"; button.className = "button button-secondary";
                    button.textContent = action[0].toUpperCase() + action.slice(1);
                    button.addEventListener("click", () => runServiceAction(service, action, button)); actions.append(button);
                });
            }
            card.append(actions);
        });


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

    updateNetworkDisplay(data.network, data.generated_at);
}


function formatRate(bytes) {
    return `${formatBytes(bytes)}/s`;
}


function updateNetworkDisplay(network, timestamp) {
    const chart = document.getElementById("network-chart");
    if (!chart || !network) return;
    document.getElementById("network-received").textContent = formatBytes(network.bytes_received);
    document.getElementById("network-sent").textContent = formatBytes(network.bytes_sent);
    document.getElementById("network-download-rate").textContent = formatRate(network.received_rate || 0);
    document.getElementById("network-upload-rate").textContent = formatRate(network.sent_rate || 0);
    document.getElementById("last-updated").textContent = new Date(timestamp || Date.now()).toLocaleTimeString();
    drawNetworkChart(network.history || []);
}


function drawNetworkChart(samples) {
    const canvas = document.getElementById("network-chart");
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const width = Math.max(300, rect.width);
    const height = Math.max(180, rect.height);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    const context = canvas.getContext("2d");
    context.scale(ratio, ratio);
    context.clearRect(0, 0, width, height);
    const styles = getComputedStyle(document.documentElement);
    const grid = "#e8eef7";
    const muted = styles.getPropertyValue("--muted-foreground").trim() || "#64748b";
    const received = "#2563eb";
    const sent = "#14b8a6";
    const padding = {top: 18, right: 16, bottom: 30, left: 56};
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const rates = samples.slice(1).map((sample, index) => {
        const previous = samples[index];
        const elapsed = sample.timestamp - previous.timestamp || 1;
        return {received: Math.max(0, (sample.bytes_received - previous.bytes_received) / elapsed), sent: Math.max(0, (sample.bytes_sent - previous.bytes_sent) / elapsed)};
    });
    const maxRate = Math.max(1, ...rates.flatMap(rate => [rate.received, rate.sent])) * 1.15;
    context.font = "11px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    context.fillStyle = muted;
    context.strokeStyle = grid;
    context.lineWidth = 1;
    for (let index = 0; index < 4; index += 1) {
        const y = padding.top + (plotHeight / 3) * index;
        context.beginPath(); context.moveTo(padding.left, y); context.lineTo(width - padding.right, y); context.stroke();
        const value = maxRate * (1 - index / 3);
        context.fillText(formatRate(value), 0, y + 4);
    }
    if (!rates.length) { context.fillText("Collecting network samples…", padding.left, padding.top + plotHeight / 2); return; }
    const drawSeries = (key, color) => {
        context.beginPath();
        rates.forEach((rate, index) => {
            const x = padding.left + (index / Math.max(rates.length - 1, 1)) * plotWidth;
            const y = padding.top + plotHeight - (rate[key] / maxRate) * plotHeight;
            if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
        });
        context.strokeStyle = color; context.lineWidth = 2.5; context.lineJoin = "round"; context.stroke();
    };
    drawSeries("received", received); drawSeries("sent", sent);
    context.fillStyle = muted;
    context.fillText(`${rates.length * 3}s ago`, padding.left, height - 8);
    context.textAlign = "right"; context.fillText("Now", width - padding.right, height - 8); context.textAlign = "left";
}


async function refreshNetworkChart() {
    try {
        const response = await fetch("/api/dashboard/network");
        if (response.ok) updateNetworkDisplay(await response.json(), Date.now());
    } catch (error) { console.error("Network traffic error:", error); }
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

if (document.getElementById("network-chart")) {
    setInterval(refreshNetworkChart, 3000);
    window.addEventListener("resize", () => refreshNetworkChart());
}


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


function setMaintenanceDetails(data) {
    const alert = document.getElementById("maintenance-alert");
    const findings = data.findings || [];
    alert.hidden = findings.length === 0;
    if (findings.length) {
        document.getElementById("maintenance-alert-title").textContent = `${findings.length} resource issue${findings.length > 1 ? "s" : ""} need manual review`;
        document.getElementById("maintenance-alert-copy").textContent = findings.map(item => item.message).join(" ");
    }
    const resources = document.getElementById("maintenance-resources"); resources.replaceChildren();
    [["Disk", data.resources.disk], ["Memory", data.resources.memory], ["Swap", data.resources.swap]].forEach(([name, item]) => {
        const card = document.createElement("div"); card.className = "maintenance-resource";
        const label = document.createElement("span"); label.textContent = name;
        const value = document.createElement("strong"); value.textContent = `${item.percent.toFixed(1)}%`;
        const detail = document.createElement("small"); detail.textContent = `${formatBytes(item.used)} used · ${formatBytes(item.free || item.available)} available`;
        card.append(label, value, detail); resources.append(card);
    });
    const storage = document.getElementById("storage-scan"); storage.replaceChildren();
    data.storage_scan.filter(item => item.size !== null).sort((a, b) => b.size - a.size).forEach(item => {
        const row = document.createElement("div"); row.className = "storage-row";
        const name = document.createElement("div"); const label = document.createElement("strong"); label.textContent = item.name; const path = document.createElement("span"); path.textContent = item.path; name.append(label, path);
        const size = document.createElement("strong"); size.textContent = formatBytes(item.size); row.append(name, size); storage.append(row);
    });
    const hotspots = document.getElementById("storage-hotspots");
    if (hotspots) {
        hotspots.replaceChildren();
        (data.storage_hotspots || []).forEach((item, index) => {
            const row = document.createElement("div"); row.className = "hotspot-row";
            const rank = document.createElement("span"); rank.className = "hotspot-rank"; rank.textContent = `#${index + 1}`;
            const path = document.createElement("code"); path.textContent = item.path;
            const size = document.createElement("strong"); size.textContent = formatBytes(item.size);
            const copy = document.createElement("button"); copy.type = "button"; copy.className = "icon-button"; copy.title = "Copy path"; copy.textContent = "Copy";
            copy.addEventListener("click", async () => { await navigator.clipboard?.writeText(item.path); copy.textContent = "Copied"; });
            row.append(rank, path, size, copy); hotspots.append(row);
        });
        if (!hotspots.childElementCount) hotspots.textContent = "No approved storage areas were available for inspection.";
    }
    const playbook = document.getElementById("maintenance-playbook"); playbook.replaceChildren();
    data.playbook.forEach(item => {
        const card = document.createElement("article"); card.className = "playbook-card";
        const header = document.createElement("div"); const title = document.createElement("h3"); title.textContent = item.title; const risk = document.createElement("span"); risk.textContent = item.risk; header.append(title, risk);
        const description = document.createElement("p"); description.textContent = item.description;
        const command = document.createElement("code"); command.textContent = item.command;
        const copy = document.createElement("button"); copy.type = "button"; copy.className = "button button-secondary"; copy.textContent = "Copy command"; copy.addEventListener("click", async () => { await navigator.clipboard?.writeText(item.command); copy.textContent = "Copied"; });
        card.append(header, description, command, copy); playbook.append(card);
    });
}


async function loadMaintenance() {
    const button = document.getElementById("maintenance-scan");
    if (!button) return;
    button.disabled = true; button.textContent = "Scanning…";
    try {
        const response = await fetch("/api/maintenance/overview");
        if (!response.ok) throw new Error("Scan failed");
        setMaintenanceDetails(await response.json());
    } catch (error) { button.textContent = "Scan unavailable"; return; }
    button.disabled = false; button.textContent = "Run diagnostic scan";
}


async function loadMaintenanceSettings() {
    const form = document.getElementById("maintenance-settings-form");
    if (!form) return;
    try {
        const response = await fetch("/api/maintenance/settings"); const values = await response.json();
        Object.entries(values).forEach(([key, value]) => { form.elements[key].value = value; });
    } catch (error) { document.getElementById("maintenance-settings-feedback").textContent = "Could not load configuration."; }
    form.addEventListener("submit", async event => {
        event.preventDefault(); const feedback = document.getElementById("maintenance-settings-feedback");
        const values = Object.fromEntries(new FormData(form)); Object.keys(values).forEach(key => { values[key] = Number(values[key]); });
        try { const response = await fetch("/api/maintenance/settings", {method: "PUT", headers: {"Content-Type": "application/json", "X-CSRF-Token": window.maintenanceCsrf || ""}, body: JSON.stringify(values)}); if (!response.ok) throw new Error("Save failed"); feedback.textContent = "Saved. Run a scan to apply the new thresholds."; } catch (error) { feedback.textContent = "Unable to save configuration."; }
    });
}


if (document.getElementById("maintenance-scan")) {
    document.getElementById("maintenance-scan").addEventListener("click", loadMaintenance);
    loadMaintenanceSettings();
    loadMaintenance();
    loadQuarantineCandidates();
    loadAuditEvents();
}

async function loadAuditEvents() {
    const container = document.getElementById("audit-events");
    if (!container) return;
    try {
        const response = await fetch("/api/maintenance/audit");
        if (!response.ok) throw new Error("Audit unavailable");
        const events = (await response.json()).events || [];
        container.replaceChildren();
        if (!events.length) { container.textContent = "No protected actions have been recorded yet."; return; }
        events.forEach(event => {
            const row = document.createElement("div"); row.className = "audit-row";
            const action = document.createElement("strong"); action.textContent = event.action.replaceAll(".", " · ");
            const detail = document.createElement("span"); detail.textContent = event.detail;
            const time = document.createElement("time"); time.textContent = new Date(event.timestamp).toLocaleString(); time.dateTime = event.timestamp;
            row.append(action, detail, time); container.append(row);
        });
    } catch (error) { container.textContent = "Unable to load audit activity."; }
}


async function loadQuarantineCandidates() {
    const container = document.getElementById("quarantine-candidates");
    if (!container) return;
    try {
        const response = await fetch("/api/maintenance/candidates");
        if (!response.ok) throw new Error("Could not load candidates");
        const candidates = (await response.json()).candidates || [];
        container.replaceChildren();
        if (!candidates.length) { container.textContent = "No inactive project folders were detected."; return; }
        candidates.forEach(candidate => {
            const row = document.createElement("article"); row.className = "quarantine-row";
            const info = document.createElement("div"); const title = document.createElement("h3"); title.textContent = candidate.name; const path = document.createElement("p"); path.textContent = candidate.path; const detail = document.createElement("span"); detail.textContent = `${formatBytes(candidate.size || 0)} · ${candidate.reason}`; info.append(title, path, detail);
            const button = document.createElement("button"); button.className = "button button-danger"; button.type = "button"; button.textContent = "Move to quarantine";
            button.addEventListener("click", async () => { const confirmation = window.prompt(`Type ${candidate.name} to confirm moving it to quarantine.`); if (confirmation === null) return; button.disabled = true; const result = await fetch("/api/maintenance/quarantine", {method: "POST", headers: {"Content-Type": "application/json", "X-CSRF-Token": window.maintenanceCsrf || ""}, body: JSON.stringify({candidate_id: candidate.id, confirmation})}); if (!result.ok) { button.disabled = false; alert((await result.json()).detail || "Unable to quarantine project."); return; } loadQuarantineCandidates(); loadMaintenance(); });
            row.append(info, button); container.append(row);
        });
    } catch (error) { container.textContent = "Unable to load inactive project candidates."; }
}


async function initializeLogin() {
    const form = document.getElementById("login-form");
    if (!form) return;
    form.addEventListener("submit", async event => { event.preventDefault(); const feedback = document.getElementById("login-feedback"); feedback.textContent = "Signing in…"; const response = await fetch("/api/auth/login", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({password: document.getElementById("login-password").value})}); if (!response.ok) { feedback.textContent = (await response.json()).detail || "Unable to sign in."; return; } window.location.href = "/maintenance"; });
}
initializeLogin();

if (document.getElementById("maintenance-scan")) {
    getAdminSession().then(data => { window.maintenanceCsrf = data.csrf_token; });
}


const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
const mobileMenuBackdrop = document.getElementById("mobile-menu-backdrop");

function closeMobileMenu() {
    document.body.classList.remove("mobile-menu-open");
    mobileMenuToggle?.setAttribute("aria-expanded", "false");
}

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", () => {
        const isOpen = document.body.classList.toggle("mobile-menu-open");
        mobileMenuToggle.setAttribute("aria-expanded", String(isOpen));
    });
    mobileMenuBackdrop.addEventListener("click", closeMobileMenu);
    document.querySelectorAll(".sidebar a").forEach(link => link.addEventListener("click", closeMobileMenu));
    window.addEventListener("resize", () => { if (window.innerWidth > 700) closeMobileMenu(); });
}
