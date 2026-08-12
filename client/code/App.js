import ApiClient from './util/ApiClient.js';

import AuthController from './controller/AuthController.js';
import UserController from './controller/UserController.js';
import CohortController from './controller/CohortController.js';
import MessageController from './controller/MessageController.js';

import LoginView from './view/LoginView.js';
import NavView from './view/NavView.js';
import HomeView from './view/HomeView.js';
import EventsView from './view/EventsView.js';
import MissionsView from './view/MissionsView.js';
import FeedView from './view/FeedView.js';
import MessagesView from './view/MessagesView.js';
import ResourcesView from './view/ResourcesView.js';
import CohortsView from './view/CohortsView.js';
import AdminView from './view/AdminView.js';
import SettingsView from './view/SettingsView.js';

const API_URL = 'http://localhost:3000';

/**
 * Top-level application: owns the controllers (data/business logic) and the
 * views (rendering), and acts as a simple router between pages.
 */
export default class App {
  constructor() {
    this.api = new ApiClient(API_URL);

    this.auth = new AuthController(this.api);
    this.users = new UserController(this.api);
    this.cohorts = new CohortController(this.api);
    this.messages = new MessageController();

    this.loginScreen = document.getElementById('login-screen');
    this.appScreen = document.getElementById('app');
    this.headerUser = document.getElementById('header-user');
    this.navEl = document.getElementById('nav');
    this.pageEl = document.getElementById('page');

    this.loginView = new LoginView(this.loginScreen, this);
    this.navView = new NavView(this.navEl, this);

    this.pages = {
      home: new HomeView(this.pageEl, this),
      events: new EventsView(this.pageEl, this),
      missions: new MissionsView(this.pageEl, this),
      feed: new FeedView(this.pageEl, this),
      messages: new MessagesView(this.pageEl, this),
      resources: new ResourcesView(this.pageEl, this),
      cohorts: new CohortsView(this.pageEl, this),
      admin: new AdminView(this.pageEl, this),
      settings: new SettingsView(this.pageEl, this),
    };
  }

  init() {
    this.loginView.mount();

    document.addEventListener('keydown', event => {
      if (event.key === 'Enter' && this.loginScreen.style.display !== 'none') {
        this.loginView.submit();
      }
    });

    if (this.auth.isAuthenticated) {
      this.showApp();
    }
  }

  showApp() {
    this.loginScreen.style.display = 'none';
    this.appScreen.style.display = 'block';
    this.headerUser.textContent = `${this.auth.currentUser.name} (${this.auth.currentUser.role})`;
    this.navView.build();
    return this.navigate('home');
  }

  logout() {
    this.auth.logout();
    this.appScreen.style.display = 'none';
    this.loginScreen.style.display = 'block';
    this.loginView.reset();
  }

  async navigate(pageKey) {
    const view = this.pages[pageKey];
    if (!view) return;

    this.navView.setActive(pageKey);

    try {
      await view.mount();
    } catch (error) {
      if (error.status === 401) {
        this.logout();
        alert('Your session has expired. Please log in again.');
      } else {
        console.error(error);
        this.pageEl.innerHTML = '<p>Something went wrong loading this page.</p>';
      }
    }
  }
}
