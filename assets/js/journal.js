const journalGrid = document.getElementById("journal-grid");
const postTitle = document.getElementById("post-title");
const postMeta = document.getElementById("post-meta");
const postContent = document.getElementById("post-content");
const postCoverSection = document.getElementById("post-cover-section");
const postCoverImage = document.getElementById("post-cover-image");

const JOURNAL_PATH = "data/journal.json";

function getJournalBasePath() {
  return window.location.pathname.includes("/journal/") ? "" : "journal/";
}

function getPostSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get("slug");
}

function formatPostMeta(post) {
  const parts = [post.date, post.category].filter(Boolean);
  return parts.join(" - ");
}

async function fetchPosts() {
  const basePath = getJournalBasePath();
  const data = await fetchJson(`${basePath}${JOURNAL_PATH}`);
  return Array.isArray(data) ? data : [];
}

function hidePostCover() {
  if (postCoverSection) {
    postCoverSection.classList.add("is-hidden");
  }

  if (postCoverImage) {
    postCoverImage.removeAttribute("src");
    postCoverImage.alt = "";
    postCoverImage.onload = null;
    postCoverImage.onerror = null;
  }
}

function renderPostCover(post) {
  if (!postCoverSection || !postCoverImage) return;

  const coverImage = normalizeAssetPath(post?.coverImage, "");

  if (!coverImage) {
    hidePostCover();
    return;
  }

  postCoverSection.classList.add("is-hidden");
  postCoverImage.alt = `${post.title || "Journal entry"} cover image`;
  postCoverImage.onload = () => {
    postCoverSection.classList.remove("is-hidden");
  };
  postCoverImage.onerror = () => {
    hidePostCover();
  };
  postCoverImage.src = coverImage;
}

function renderJournalGrid(posts) {
  if (!journalGrid) return;

  if (!posts.length) {
    journalGrid.innerHTML = `
      <article class="content-box reveal in-view">
        <h3>No journal entries yet</h3>
        <p>Come back at a later time to see what I've been writing!</p>
      </article>
    `;
    return;
  }

  journalGrid.innerHTML = posts
    .map((post) => {
      return `
        <article class="journal-card reveal in-view">
          <a href="post.html?slug=${encodeURIComponent(post.slug)}">
            <p class="meta">${escapeHtml(post.date || "Undated")}</p>
            <h3>${escapeHtml(post.title)}</h3>
            <p>${escapeHtml(post.excerpt || "")}</p>
          </a>
        </article>
      `;
    })
    .join("");
}

async function renderPostPage(post) {
  if (!postTitle || !postContent) return;

  if (!post) {
    document.title = "Entry Not Found";
    postTitle.textContent = "Entry not found";
    if (postMeta) postMeta.textContent = "The requested journal entry does not exist.";
    hidePostCover();
    if (postContent) {
      postContent.innerHTML = `
        <p>No matching journal entry was found for this slug.</p>
      `;
    }
    return;
  }

  document.title = `${post.title} - Sanu Abraham`;
  postTitle.textContent = post.title || "Untitled Entry";

  if (postMeta) {
    postMeta.textContent = formatPostMeta(post);
  }

  renderPostCover(post);

  if (postContent) {
    if (post.contentFile) {
      const html = await fetchHtml(post.contentFile);
      postContent.innerHTML = html || `<p>Could not load the journal content file.</p>`;
    } else {
      postContent.innerHTML = `
        <p>No content file added yet for this journal entry.</p>
      `;
    }
  }
}

async function initJournal() {
  const posts = await fetchPosts();

  if (journalGrid) {
    renderJournalGrid(posts);
  }

  if (postTitle) {
    const slug = getPostSlug();
    const currentPost = posts.find((post) => post.slug === slug);
    await renderPostPage(currentPost);
  }
}

initJournal();
