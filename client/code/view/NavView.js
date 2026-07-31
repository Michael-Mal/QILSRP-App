const PAGES = [
  { key: 'home', label: 'Home' },
  { key: 'events', label: 'Events' },
  { key: 'missions', label: 'Missions' },
  { key: 'feed', label: 'Feed' },
  { key: 'messages', label: 'Messages' },
  { key: 'resources', label: 'Resources' },
  { key: 'settings', label: 'Settings' },
];

export default class NavView {
  constructor(container, app) {
    this.container = container;
    this.app = app;
  }

  build() {
    const user = this.app.auth.currentUser;
    const pages = [...PAGES];

    if (user.isRanger || user.isAdmin) pages.push({ key: 'cohorts', label: 'Cohorts' });
    if (user.isAdmin) pages.push({ key: 'admin', label: 'Admin' });

    this.container.innerHTML = pages
      .map(page => `<button id="nav-${page.key}" data-nav="${page.key}">${page.label}</button>`)
      .join('');

    this.container.addEventListener('click', event => {
      const button = event.target.closest('[data-nav]');
      if (button) this.app.navigate(button.dataset.nav);
    });
  }

  setActive(pageKey) {
    this.container.querySelectorAll('button').forEach(button => button.classList.remove('active'));
    const active = document.getElementById(`nav-${pageKey}`);
    if (active) active.classList.add('active');
  }
}
