import Resource from '../model/Resource.js';
import Folder from '../model/Folder.js';

import LocalRepository from '../util/LocalRepository.js';

const ROOT_ID = 1;

const SEED = [
{ id: 1, type: 'image', title: 'Welcome to QILSRP! (Root Folder)', 
uploaderID: 2, fileRef: 'qilsrp.com/dummy-url', parentID: 1, creationDate: new Date().toISOString()},
{ id: 2, type: 'video', title: 'Welcome to QILSRP! (Student Folder)',
uploaderID: 2, fileRef: 'qilsrp.com/dummy-url', parentID: 2, creationDate: new Date().toISOString()},
{ id: 3, type: 'video', title: 'Welcome to QILSRP! (Ranger Folder)',
uploaderID: 2, fileRef: 'qilsrp.com/dummy-url', parentID: 3, accessLevel: 'Ranger', creationDate: new Date().toISOString()},
{ id: 4, type: 'video', title: 'Welcome to QILSRP! (Admin Folder)',
uploaderID: 2, fileRef: 'qilsrp.com/dummy-url', parentID: 4, accessLevel: 'admin', creationDate: new Date().toISOString()},
]

const FOLDER_SEED = [
  { id: 1, name: 'Root Folder', parentID: null, accessLevel: 'student' },
  { id: 2, name: 'student folder', parentID: 1, accessLevel: 'student' },
  { id: 3, name: 'ranger folder', parentID: 1, accessLevel: 'ranger' },
  { id: 4, name: 'admin folder', parentID: 2, accessLevel: 'admin' }
]

export default class ResourceController {
  constructor(apiClient) {
    this.repo = new LocalRepository('qilsrp.resources', SEED);
    this.folders = new LocalRepository('qilsrp.folders', FOLDER_SEED);
    this.api = apiClient;
  }

  /// Gets and returns a list of all resources as Resource objects
  async getAllResources() {
  const rows = await this.repo.all();
  return rows.map(row => new Resource(row));
  }

  // Gets all folders the user has access to in a folder
  async getFolderChildren(folderID) {
    const rows = await this.folders.all();
    const folderChildren = rows.filter(row => row.parentID === folderID);
    return folderChildren.map (row => new Folder(row));
    // Get all folders that have folderID as their parentFolderId
  }

  // Gets all resources the user has access to in a folder
  async getFolderResources(folderID) {
    const rows = await this.repo.all();
    const folderResources = rows.filter(row => row.parentID === folderID);
    return folderResources.map(row => new Resource(row));
  }

  async listFolderContents(folderID) {
    const folders = await this.getFolderChildren(folderID);
    const resources = await this.getFolderResources(folderID);
    return { folders, resources };
  }

  async getFolder(folderID) {
    const rows = await this.folders.all();
    const row = rows.find(row => row.id === folderID);
    return row ? new Folder(row) : null;
  }

  // Gets an array of the folder path starting at the root and ending at the folder corresponding to the provided folderID
  async getFolderPath(folderID) {
    let currentFolder = await this.getFolder(folderID);
    let path = [currentFolder];

    while (currentFolder.parentID != null) {
      currentFolder = await this.getFolder(currentFolder.parentID);
      path.push(currentFolder);
    }

    return path.reverse();
  }

  /// Passes a Resources info through to the repo and creates a new Resource object.
  /// Likely needs to be reworked for each resource type, as they will have different attributes.
  async createResource({type, title, fileRef, parentID, uploaderID}) {
  const row = await this.repo.insert({ type, title, uploaderID, fileRef, parentID, creationDate: new Date().toISOString()});
  try {
    return new Resource(row);
  } catch (error) {
    console.error("Error creating resource:", error);
    throw error;
  }
  }
}