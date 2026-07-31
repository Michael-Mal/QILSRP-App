/**
 * Static page shell. Layout/markup only for now — photo posting, liking,
 * and listing logic will be wired up once the feature is built out.
 */
export default class FeedView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
  }

  async mount() {
    const user = this.app.auth.currentUser;
    const canPost = !user.isStudent;

    let html = '<h2>Photo Feed</h2>';

    if (canPost) {
      html += `
        <div class="card">
          <h3>New Post</h3>
          <label>Caption</label><input type="text" id="post-caption" />
          <label>Photo</label><input type="file" id="post-image" accept="image/*" />
          <br/><br/>
          <button disabled>Post</button>
        </div>
      `;
    }

    html += '<p>No posts yet.</p>';

    this.container.innerHTML = html;
  }
}
