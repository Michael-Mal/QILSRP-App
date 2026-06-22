const API_URL = "http://localhost:3000"

//  Temp data (no database yet)

const users = [
  { email: 'ranger1', password: 'pass', role: 'ranger', name: 'Sarah Ranger' },
  { email: 'student1', password: 'pass', role: 'student', name: 'Tom Junior' },
  { email: 'admin1', password: 'pass', role: 'admin', name: 'Admin User' },
];

let cohorts = [
  { id: 1, name: 'Cohort A - Brisbane North', rangerName: 'Sarah Ranger', members: ['student1'] },
  { id: 2, name: 'Cohort B - Cairns', rangerName: 'Sarah Ranger', members: [] },
];

let events = [
  { id: 1, title: 'On-Country Day', date: '2025-06-10', cohortId: 1, description: 'Meet at the wetlands at 9am.' },
  { id: 2, title: 'Ranger Expo 2025', date: '2025-07-20', cohortId: 1, description: 'Annual ranger showcase.' },
];

let missions = [
  { id: 1, title: 'Spot a local bird', description: 'Find and photograph 3 native birds.', cohortId: 1 },
  { id: 2, title: 'Plant a seedling', description: 'Plant a native seedling and record its growth.', cohortId: 1 },
];

let photoPosts = [
  { id: 1, author: 'Elly Ranger', caption: 'Checking on the mangroves today.', likes: 4, likedBy: [], cohortId: 1 },
  { id: 2, author: 'Elly Ranger', caption: 'Junior Rangers learning about Country.', likes: 7, likedBy: [], cohortId: 1 },
];

// Messages stored per cohort id
let messages = {
  1: [
    { sender: 'Elly Ranger', text: 'Welcome to the cohort chat!' },
    { sender: 'Josh Junior', text: 'Thanks, excited to be here!' },
  ],
  2: [],
};

let resources = [
  { id: 1, title: 'Introduction to Country', type: 'PDF' },
  { id: 2, title: 'Ranger Podcast Ep 1', type: 'Podcast' },
  { id: 3, title: 'Bird ID Guide', type: 'PDF' },
];

// ── Session state 
let currentUser = null;

// ── Auth 

async function doLogin() {
  const u = document.getElementById('login-email').value.trim();
  const p = document.getElementById('login-password').value.trim();
  let response = await fetch(`${API_URL}/user/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: u,
      password: p
    })
  })
  if (!response.ok) {
    document.getElementById('login-error').style.display = 'block';
    return;
  }
  let jsonresponse = await response.json()
  currentUser = {
    name: jsonresponse.name,
    email: u,
    role: jsonresponse.role
  }
  localStorage.setItem("token", jsonresponse.token)
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  document.getElementById('header-user').textContent = currentUser.name;
  buildNav();
  show('home');
}

function doLogout() {
  currentUser = null;
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-screen').style.display = 'block';
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-error').style.display = 'none';
}

// ── Navigation 
function buildNav() {
  // Pages available to all roles
  let pages = ['Home', 'Events', 'Missions', 'Feed', 'Messages', 'Resources', 'Settings'];

  // Cohort management for rangers and admins
  if (currentUser.role === 'ranger' || currentUser.role === 'admin') pages.push('Cohorts');

  // Admin-only page
  if (currentUser.role === 'admin') pages.push('Admin');

  document.getElementById('nav').innerHTML = pages.map(p =>
    `<button id="nav-${p.toLowerCase()}" onclick="show('${p.toLowerCase()}')">${p}</button>`
  ).join('');
}

function show(page) {
  // Highlight active nav button
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('nav-' + page);
  if (btn) btn.classList.add('active');

  // Render the right page
  const pages = {
    home: renderHome,
    events: renderEvents,
    missions: renderMissions,
    feed: renderFeed,
    messages: renderMessages,
    resources: renderResources,
    settings: renderSettings,
    cohorts: renderCohorts,
    admin: renderAdmin,
  };
  if (pages[page]) pages[page]();
}

//  Home 
function renderHome() {
  const myCohorts = currentUser.role === 'student'
    ? cohorts.filter(c => c.members.includes(currentUser.email))
    : cohorts;

  document.getElementById('page').innerHTML = `
      <h2>Home</h2>
      <p>Welcome, ${currentUser.name}.</p>
  
      <div class="card">
        <h3>Next Event</h3>
        <p>${events.length ? events[0].title + ' - ' + events[0].date : 'No upcoming events.'}</p>
      </div>
  
      <div class="card">
        <h3>Active Missions</h3>
        <p>${missions.length} mission(s) available.</p>
      </div>
  
      <div class="card">
        <h3>My Cohorts</h3>
        ${myCohorts.length ? myCohorts.map(c => '<p>' + c.name + '</p>').join('') : '<p>No cohorts.</p>'}
      </div>
    `;
}

//  Events 
function renderEvents() {
  const canCreate = currentUser.role !== 'student';
  let html = '<h2>Events</h2>';

  if (canCreate) {
    html += `
        <div class="card">
          <h3>Create Event</h3>
          <label>Title</label><input type="text" id="evt-title" />
          <label>Date</label><input type="date" id="evt-date" />
          <label>Description</label><textarea id="evt-desc" rows="2"></textarea>
          <label>Cohort</label>
          <select id="evt-cohort">${cohorts.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select>
          <button onclick="addEvent()">Add Event</button>
        </div>
      `;
  }

  html += events.map(e => {
    const c = cohorts.find(x => x.id === e.cohortId);
    return `<div class="card"><h3>${e.title}</h3><p>Date: ${e.date}</p><p>Cohort: ${c ? c.name : '-'}</p><p>${e.description}</p></div>`;
  }).join('') || '<p>No events.</p>';

  document.getElementById('page').innerHTML = html;
}

function addEvent() {
  const title = document.getElementById('evt-title').value.trim();
  const date = document.getElementById('evt-date').value;
  const desc = document.getElementById('evt-desc').value.trim();
  const cohortId = parseInt(document.getElementById('evt-cohort').value);
  if (!title || !date) { alert('Title and date required.'); return; }
  events.push({ id: events.length + 1, title, date, cohortId, description: desc });
  renderEvents();
}

//  Missions 
function renderMissions() {
  const canCreate = currentUser.role !== 'student';
  let html = '<h2>Missions</h2>';

  if (canCreate) {
    html += `
        <div class="card">
          <h3>Create Mission</h3>
          <label>Title</label><input type="text" id="msn-title" />
          <label>Description</label><textarea id="msn-desc" rows="2"></textarea>
          <label>Cohort</label>
          <select id="msn-cohort">${cohorts.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select>
          <button onclick="addMission()">Publish</button>
        </div>
      `;
  }

  html += missions.map(m => {
    const c = cohorts.find(x => x.id === m.cohortId);
    return `
        <div class="card">
          <h3>${m.title}</h3>
          <p>${m.description}</p>
          <small>Cohort: ${c ? c.name : '-'}</small><br/>
          ${currentUser.role === 'student' ? '<br/><button onclick="alert(\'Submitted! (prototype)\')">Submit Response</button>' : ''}
        </div>
      `;
  }).join('') || '<p>No missions.</p>';

  document.getElementById('page').innerHTML = html;
}

function addMission() {
  const title = document.getElementById('msn-title').value.trim();
  const desc = document.getElementById('msn-desc').value.trim();
  const cohortId = parseInt(document.getElementById('msn-cohort').value);
  if (!title) { alert('Title required.'); return; }
  missions.push({ id: missions.length + 1, title, description: desc, cohortId });
  renderMissions();
}

//  Photo Feed 
function renderFeed() {
  const canPost = currentUser.role !== 'student';
  let html = '<h2>Photo Feed</h2>';

  if (canPost) {
    html += `
        <div class="card">
          <h3>New Post</h3>
          <label>Caption</label><input type="text" id="post-caption" />
          <small>Image upload not wired up in prototype.</small><br/><br/>
          <button onclick="addPost()">Post</button>
        </div>
      `;
  }

  html += photoPosts.map(p => `
      <div class="card">
        <p>[Image Placeholder]</p>
        <p><strong>${p.author}</strong> - ${p.caption}</p>
        <button onclick="toggleLike(${p.id})">${p.likedBy.includes(currentUser.email) ? 'Unlike' : 'Like'}</button>
        <span> ${p.likes} like(s)</span>
      </div>
    `).join('') || '<p>No posts yet.</p>';

  document.getElementById('page').innerHTML = html;
}

function toggleLike(postId) {
  const post = photoPosts.find(p => p.id === postId);
  if (!post) return;
  if (post.likedBy.includes(currentUser.email)) {
    post.likes--;
    post.likedBy = post.likedBy.filter(u => u !== currentUser.email);
  } else {
    post.likes++;
    post.likedBy.push(currentUser.email);
  }
  renderFeed();
}

function addPost() {
  const caption = document.getElementById('post-caption').value.trim();
  if (!caption) { alert('Caption required.'); return; }
  photoPosts.unshift({ id: photoPosts.length + 1, author: currentUser.name, caption, likes: 0, likedBy: [], cohortId: 1 });
  renderFeed();
}

//  Messages 
function renderMessages() {
  let html = '<h2>Messages</h2>';

  cohorts.forEach(cohort => {
    // Students only see their own cohorts
    if (currentUser.role === 'student' && !cohort.members.includes(currentUser.email)) return;

    const msgs = messages[cohort.id] || [];
    html += `
        <div class="card">
          <h3>${cohort.name}</h3>
          <div class="msg-list">
            ${msgs.map(m => `<div class="msg"><strong>${m.sender}:</strong> ${m.text}</div>`).join('') || '<i>No messages.</i>'}
          </div>
          <div class="msg-input-row">
            <input type="text" id="msg-${cohort.id}" placeholder="Type a message..." />
            <button onclick="sendMessage(${cohort.id})">Send</button>
          </div>
        </div>
      `;
  });

  document.getElementById('page').innerHTML = html || '<p>No cohorts available.</p>';
}

function sendMessage(cohortId) {
  const input = document.getElementById('msg-' + cohortId);
  const text = input.value.trim();
  if (!text) return;
  if (!messages[cohortId]) messages[cohortId] = [];
  messages[cohortId].push({ sender: currentUser.name, text });
  input.value = '';
  renderMessages();
}

//  Resources 
function renderResources() {
  const canAdd = currentUser.role !== 'student';
  let html = '<h2>Resource Hub</h2>';

  if (canAdd) {
    html += `
        <div class="card">
          <h3>Add Resource</h3>
          <label>Title</label><input type="text" id="res-title" />
          <label>Type</label>
          <select id="res-type"><option>PDF</option><option>Podcast</option><option>Video</option><option>Link</option></select>
          <button onclick="addResource()">Add</button>
        </div>
      `;
  }

  html += resources.map(r => `
      <div class="card">
        <h3>${r.title}</h3>
        <p>Type: ${r.type}</p>
        <button onclick="alert('Open/download not wired up in prototype.')">Open</button>
      </div>
    `).join('') || '<p>No resources.</p>';

  document.getElementById('page').innerHTML = html;
}

function addResource() {
  const title = document.getElementById('res-title').value.trim();
  const type = document.getElementById('res-type').value;
  if (!title) { alert('Title required.'); return; }
  resources.push({ id: resources.length + 1, title, type });
  renderResources();
}

//  Cohorts 
function renderCohorts() {
  if (currentUser.role !== 'admin') {
    document.getElementById('page').innerHTML = '<p>Access denied.</p>';
    return;
  }

  let html = `
      <h2>Cohort Management</h2>
      <div class="card">
        <h3>Create Cohort</h3>
        <label>Name</label><input type="text" id="coh-name" />
        <button onclick="addCohort()">Create</button>
      </div>
    `;

  html += cohorts.map(c => `
      <div class="card">
        <h3>${c.name}</h3>
        <p>Ranger: ${c.rangerName}</p>
        <p>Members: ${c.members.length === 0 ? 'None' : c.members.join(', ')}</p>
        <button onclick="renderCohortManagement()">Manage Cohort</button>
      </div>
    `).join('');

  document.getElementById('page').innerHTML = html;
}

function addCohort() {
  const name = document.getElementById('coh-name').value.trim();
  if (!name) { alert('Name required.'); return; }
  const id = cohorts.length + 1;
  cohorts.push({ id, name, rangerName: currentUser.name, members: [] });
  messages[id] = [];
  renderCohorts();
}

async function renderCohortManagement() {
  if (currentUser.role !== 'admin') {
    document.getElementById('page').innerHTML = '<p>Access denied.</p>';
    return;
  }

  let html = `
      <h2>Cohort Management</h2>
      <div class="card">
        <h3>Add Ranger</h3>
        <label>Name</label>
        <input type="text" id="register-name" />
        <label>Email</label>
        <input type="text" id="register-email" />
        <label>Password</label>
        <input type="password" id="register-password" />
        <button onclick="doRegister()">Create</button>
        <p id="register-error">Email already exists</p>
      </div>
    `;

  const token = localStorage.getItem("token")
  if (token == null) {
    throw new Error()
  }

  let response = await fetch(`${API_URL}/user/`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  })
  let responsejson = await response.json()

  html += responsejson.map(ranger => `
      <div class="card">
        <h3>${ranger.name}</h3>
        <p>Email: ${ranger.email}</p>
        <p>Status: ${ranger.status}</p>
        <p>Created: ${ranger.created}</p>
        <button>Edit Details</button> <button>Delete Account</button>
      </div>
    `).join('');

  html += `<button onclick="renderCohorts()">Back</button>`

  document.getElementById('page').innerHTML = html;
}

async function doRegister() {
  const n = document.getElementById('register-name').value.trim();
  const u = document.getElementById('register-email').value.trim();
  const p = document.getElementById('register-password').value.trim();
  const token = localStorage.getItem("token")

  if (token == null) {
    throw new Error()
  }

  let response = await fetch(`${API_URL}/user/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      name: n,
      email: u,
      password: p
    })
  })
  if (!response.ok) {
    document.getElementById('register-error').style.display = 'block';
    return;
  }
  else {
    renderCohortManagement()
  }
}

// Settings 
function renderSettings() {
  document.getElementById('page').innerHTML = `
      <h2>Settings</h2>
      <div class="card">
        <h3>Account</h3>
        <p>Name: ${currentUser.name}</p>
        <p>Role: ${currentUser.role}</p>
        <p>Email: ${currentUser.email}</p>
      </div>
      <div class="card">
        <h3>Preferences</h3>
        <label><input type="checkbox" checked /> Push Notifications</label><br/>
        <label><input type="checkbox" /> Offline Mode</label>
      </div>
      <div class="card">
        <h3>About</h3>
        <p>Junior Ranger App - Prototype v0.1</p>
        <p>QILSRP / QUT Team 184</p>
      </div>
      <br/>
      <button onclick="doLogout()">Logout</button>
    `;
}

// ── Admin 
function renderAdmin() {
  if (currentUser.role !== 'admin') {
    document.getElementById('page').innerHTML = '<p>Access denied.</p>';
    return;
  }

  document.getElementById('page').innerHTML = `
      <h2>Admin Panel</h2>
  
      <div class="card">
        <h3>Users</h3>
        <table>
          <thead><tr><th>Email</th><th>Name</th><th>Role</th><th>Action</th></tr></thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td>${u.email}</td>
                <td>${u.name}</td>
                <td>${u.role}</td>
                <td><button onclick="alert('Edit not implemented in prototype.')">Edit</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
  
      <div class="card">
        <h3>Cohorts</h3>
        <table>
          <thead><tr><th>Name</th><th>Ranger</th><th>Members</th></tr></thead>
          <tbody>
            ${cohorts.map(c => `<tr><td>${c.name}</td><td>${c.rangerName}</td><td>${c.members.length}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
  
      <div class="card">
        <h3>Summary</h3>
        <p>Users: ${users.length} | Cohorts: ${cohorts.length} | Events: ${events.length} | Missions: ${missions.length}</p>
        <button onclick="alert('Export not implemented in prototype.')">Export Report</button>
      </div>
    `;
}

// Allow pressing Enter on login
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('login-screen').style.display !== 'none') doLogin();
});
