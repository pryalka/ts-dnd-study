import { ProjectStatus, Project } from '../models/project.js';
/**
 * Listener custom type
 */
type Listener<T> = (items: T[]) => void;

/**
 * Base State class
 */
class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

/**
 * State management
 */
export class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new ProjectState();
    return this.instance;
  }

  private updateListeners() {
    // Call all listeners functions
    for (const listenerFn of this.listeners) {
      // Return new copy of state
      listenerFn(this.projects.slice());
    }
  }

  addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      people,
      ProjectStatus.ACTIVE
    );

    this.projects.push(newProject);
    this.updateListeners();
  }

  // Handle move project from one list to another
  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find(project => project.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }
}

// App state
export const projectState = ProjectState.getInstance();
