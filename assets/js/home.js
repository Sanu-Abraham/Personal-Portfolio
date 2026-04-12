const homeProjects = document.getElementById("home-projects");
const homeJournal = document.getElementById("home-journal");
const heroSection = document.querySelector(".hero");
const heroCopy = document.querySelector(".hero-copy");
const heroVisual = document.querySelector(".hero-visual");
const profileFrame = document.querySelector(".profile-frame");
const noiseLayer = document.querySelector(".noise");

const HOME_PROJECT_FALLBACK = "assets/img/projects/entry-1/veld-ss-cover.jpeg";

function renderHomeProjects(projects) {
  if (!homeProjects) return;

  const featured = Array.isArray(projects)
    ? projects.filter((project) => project.featured === true).slice(0, 2)
    : [];

  if (!featured.length) {
    homeProjects.innerHTML = `
      <article class="content-box">
        <h3>No featured projects yet</h3>
        <p>Check back later to see my latest work!</p>
      </article>
    `;
    return;
  }

  const cards = featured.map((project) => {
    const previewImage = normalizeAssetPath(project.coverImage, HOME_PROJECT_FALLBACK);

    return `
      <article class="feature-card">
        <a href="projects/project.html?slug=${encodeURIComponent(project.slug)}">
          <div class="card-image">
            <img src="${escapeHtml(previewImage)}" alt="${escapeHtml(project.title)} cover image">
          </div>
          <div class="card-body">
            <p class="meta">${escapeHtml(project.category || "Project")}</p>
            <h3>${escapeHtml(project.title || "Untitled")}</h3>
          </div>
        </a>
      </article>
    `;
  });

  homeProjects.innerHTML = cards.join("");
}

function renderHomeJournal(posts) {
  if (!homeJournal) return;

  const featured = Array.isArray(posts)
    ? posts.filter((post) => post.featured === true).slice(0, 3)
    : [];

  if (!featured.length) {
    homeJournal.innerHTML = `
      <article class="content-box">
        <h3>No featured journal entries yet</h3>
        <p>Come back at a later time to see what I've been writing!</p>
      </article>
    `;
    return;
  }

  homeJournal.innerHTML = featured.map((post) => `
    <article class="journal-card">
      <a href="journal/post.html?slug=${encodeURIComponent(post.slug)}">
        <p class="meta">${escapeHtml(post.date || "Undated")}</p>
        <h3>${escapeHtml(post.title || "Untitled")}</h3>
        <p>${escapeHtml(post.excerpt || "")}</p>
      </a>
    </article>
  `).join("");
}

function initHeroMotion() {
  if (!heroSection || !heroCopy || !heroVisual || !profileFrame) return;
  if (window.innerWidth <= 900) return;

  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let ticking = false;

  function animate() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    heroCopy.style.transform = `translate3d(${currentX * -12}px, ${currentY * -10}px, 0)`;
    heroVisual.style.transform = `translate3d(${currentX * 14}px, ${currentY * 12}px, 0)`;

    profileFrame.style.transform = `
      rotate(${2.8 + currentX * 2.2}deg)
      perspective(900px)
      rotateY(${currentX * 8}deg)
      rotateX(${currentY * -8}deg)
      translate3d(${currentX * 8}px, ${currentY * 6}px, 0)
    `;

    if (noiseLayer) {
      noiseLayer.style.opacity = `${0.065 + Math.abs(currentX) * 0.035}`;
    }

    ticking = false;
  }

  heroSection.addEventListener("mousemove", (event) => {
    const rect = heroSection.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    targetX = (x - 0.5) * 2;
    targetY = (y - 0.5) * 2;

    if (!ticking) {
      requestAnimationFrame(animate);
      ticking = true;
    }
  });

  heroSection.addEventListener("mouseleave", () => {
    targetX = 0;
    targetY = 0;

    if (!ticking) {
      requestAnimationFrame(animate);
      ticking = true;
    }
  });
}

async function initHomePage() {
  const projects = await fetchJson("./projects/data/projects.json");
  const posts = await fetchJson("./journal/data/journal.json");

  renderHomeProjects(projects);
  renderHomeJournal(posts);
  initHeroMotion();
}

initHomePage();
