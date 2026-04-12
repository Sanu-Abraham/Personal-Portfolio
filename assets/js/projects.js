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
        <p>Check back later to see my latest work!</p>
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

function initProjectLightbox() {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");
  const closeBtn = document.getElementById("lightbox-close");

  if (!lightbox || !lightboxImg) return;

  let images = [];
  let currentIndex = -1;
  let touchStartX = 0;
  let touchEndX = 0;

  function refreshImages() {
    images = Array.from(document.querySelectorAll(".image-gallery img"));
  }

  function openLightbox(index) {
    refreshImages();
    if (!images.length || index < 0 || index >= images.length) return;

    currentIndex = index;
    lightboxImg.src = images[currentIndex].src;
    lightboxImg.alt = images[currentIndex].alt || "Expanded gallery image";
    lightbox.classList.add("active");
    document.body.classList.add("menu-open");
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    lightboxImg.src = "";
    currentIndex = -1;
    document.body.classList.remove("menu-open");
  }

  function showNext() {
    if (!images.length) return;
    currentIndex = (currentIndex + 1) % images.length;
    lightboxImg.src = images[currentIndex].src;
    lightboxImg.alt = images[currentIndex].alt || "Expanded gallery image";
  }

  function showPrev() {
    if (!images.length) return;
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    lightboxImg.src = images[currentIndex].src;
    lightboxImg.alt = images[currentIndex].alt || "Expanded gallery image";
  }

  document.addEventListener("click", (e) => {
    const clickedImage = e.target.closest(".image-gallery img");

    if (clickedImage) {
      refreshImages();
      const index = images.indexOf(clickedImage);
      openLightbox(index);
      return;
    }

    if (e.target === lightbox || e.target === closeBtn) {
      closeLightbox();
      return;
    }

    if (e.target === nextBtn) {
      showNext();
      return;
    }

    if (e.target === prevBtn) {
      showPrev();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
  });

  lightbox.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;

    if (Math.abs(deltaX) < 40) return;

    if (deltaX < 0) {
      showNext();
    } else {
      showPrev();
    }
  }, { passive: true });
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

  initProjectLightbox();
}

initProjects();
