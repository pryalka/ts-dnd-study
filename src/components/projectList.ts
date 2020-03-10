import { Autobind } from '../decorators/autobind.js';
import { Component } from '../components/baseComponent.js';
import { ProjectItem } from '../components/projectItem.js';
import { Project, ProjectStatus } from '../models/project.js';
import { projectState } from '../state/projectState.js';
import { DragTarget } from '../models/dragDrop.js';

/**
 * Lists class
 */
export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];
    this.configure();
    this.renderContent();
  }

  @Autobind
  dragOverHandler(event: DragEvent) {
    // Check if we able to drag and drop by dragging thing type
    if (event.dataTransfer?.types[0] === 'text/plain') {
      event.preventDefault();
      const listEl = this.element.querySelector('ul')!;
      listEl.classList.add('droppable');
    }
  }

  @Autobind
  dropHandler(event: DragEvent) {
    const projectId = event.dataTransfer!.getData('text/plain');
    // Update projects state
    projectState.moveProject(
      projectId,
      this.type === 'active' ? ProjectStatus.ACTIVE : ProjectStatus.FINISHED
    );

    const listEl = this.element.querySelector('ul')!;
    listEl.classList.remove('droppable');
  }

  @Autobind
  dragLeaveHandler(_event: DragEvent) {
    const listEl = this.element.querySelector('ul')!;
    listEl.classList.remove('droppable');
  }

  configure() {
    // Subscribe drag events
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);

    // Add listener function
    projectState.addListener((projects: Project[]) => {
      // Filter projects
      const relevantProjects = projects.filter(project => {
        if (this.type === 'active') {
          return project.status === ProjectStatus.ACTIVE;
        }
        return project.status === ProjectStatus.FINISHED;
      });

      // Update projects according to actual state changes
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  renderContent() {
    const listID = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listID;
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
  }

  // Render projects in lists
  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    // Fix projects duplication bug clear all existing 'li' inside 'ul' and add all projects again
    listEl.innerHTML = '';
    for (const prjItem of this.assignedProjects) {
      // const listItem = document.createElement('li');
      // listItem.textContent = prjItem.title;
      // listEl.appendChild(listItem);
      new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
    }
  }
}
