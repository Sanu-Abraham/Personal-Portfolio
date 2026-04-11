const projectGrid = document.getElementById("projects-grid");
const projectTitle = document.getElementById("project-title");
const projectMeta = document.getElementById("project-meta");
const projectContent = document.getElementById("project-content");
const projectCoverSection = document.getElementById("project-cover-section");
const projectCover = document.getElementById("project-cover");
const projectCoverImage = document.getElementById("project-cover-image");

const PROJECTS_PATH = "data/projects.json";
const PROJECT_FALLBACK_IMAGE = "assets/img/projects/entry-1/veld-ss-cover.jpeg";

function getProjectBasePath() {
  return window.location.pathname.includes("/projects/") ? "" : "projects/";
}

function getProjectSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get("slug");
}

function formatProjectMeta(project) {
  const parts = [project.category, project.date, project.role].filter(Boolean);
  return parts.join(" - ");
}

async function fetchProjects() {
  const basePath = getProjectBasePath();
  const data = await fetchJson(`${basePath}${PROJECTS_PATH}`);
  return Array.isArray(data) ? data : [];
}

function renderProjectGrid(projects) {
  if (!projectGrid) return;

  if (!projects.length) {
    projectGrid.innerHTML = `
      <article class="content-box reveal in-view">
        <h3>No projects yet</h3>
        <p>Add entries to <code>projects/data/projects.json</code> and corresponding HTML files.</p>
      </article>
    `;
    return;
  }

  const cards = projects.map((project) => {
    const previewImage = normalizeAssetPath(project.coverImage, PROJECT_FALLBACK_IMAGE);

    return `
      <article class="project-card reveal in-view">
        <a href="project.html?slug=${encodeURIComponent(project.slug)}">
          <div class="card-image">
            <img src="${escapeHtml(previewImage)}" alt="${escapeHtml(project.title)} cover image" />
          </div>
          <div class="card-body">
            <p class="meta">${escapeHtml(project.category || "Project")}</p>
            <h3>${escapeHtml(project.title)}</h3>
          </div>
        </a>
      </article>
    `;
  });

  projectGrid.innerHTML = cards.join("");
}

function resetProjectCover() {
  if (projectCoverSection) {
    projectCoverSection.classList.add("is-hidden");
  }

  if (projectCover) {
    projectCover.classList.add("is-hidden");
  }

  if (projectCoverImage) {
    projectCoverImage.removeAttribute("src");
    projectCoverImage.alt = "";
  }
}

function renderProjectCover(project) {
  if (!projectCover || !projectCoverImage) return;

  if (projectCoverSection) {
    projectCoverSection.classList.remove("is-hidden");
  }
  projectCover.classList.remove("is-hidden");
  projectCoverImage.src = normalizeAssetPath(project.coverImage, PROJECT_FALLBACK_IMAGE);
  projectCoverImage.alt = `${project.title || "Project"} cover image`;
}

async function renderProjectPage(project) {
  if (!projectTitle || !projectContent) return;

  if (!project) {
    document.title = "Project Not Found";
    projectTitle.textContent = "Project not found";
    if (projectMeta) projectMeta.textContent = "The requested project entry does not exist.";
    if (projectContent) {
      projectContent.innerHTML = `
        <h2>Nothing here yet</h2>
        <p>No matching project was found for this slug.</p>
      `;
    }
    resetProjectCover();
    return;
  }

  document.title = `${project.title} - Sanu Abraham`;
  projectTitle.textContent = project.title || "Untitled Project";

  if (projectMeta) {
    projectMeta.textContent = formatProjectMeta(project);
  }

  renderProjectCover(project);

  if (projectContent) {
    if (project.contentFile) {
      const html = await fetchHtml(project.contentFile);
      projectContent.innerHTML = html || `
        <h2>Content not found</h2>
        <p>Could not load the project content file.</p>
      `;
    } else {
      projectContent.innerHTML = `
        <h2>No content file</h2>
        <p>No content file was added for this project.</p>
      `;
    }
  }
}

async function initProjects() {
  const projects = await fetchProjects();

  if (projectGrid) {
    renderProjectGrid(projects);
  }

  if (projectTitle) {
    const slug = getProjectSlug();
    const currentProject = projects.find((project) => project.slug === slug);
    await renderProjectPage(currentProject);
  }
}

initProjects();
