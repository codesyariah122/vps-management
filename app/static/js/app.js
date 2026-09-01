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

    setInterval(
        loadDashboard,
        5000
    );
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

loadProjects();