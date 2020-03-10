import { Dragable } from '../models/dragDrop.js';
import { Autobind } from '../decorators/autobind.js';
import { Component } from '../components/baseComponent.js';
import { Project } from '../models/project.js';

/**
 * Project item class
 */
export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Dragable {
  private project: Project;

  get peopleAssigned() {
    if (this.project.people === 1) {
      return '1 person';
    } else {
      return `${this.project.people} persons`;
    }
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  @Autobind
  dragStartHandler(event: DragEvent) {
    // We can attach data to the dragging thing
    event.dataTransfer!.setData('text/plain', this.project.id);
    // Specify cursor look
    event.dataTransfer!.effectAllowed = 'move';
  }

  dragEndHandler(_event: DragEvent) {
    // console.log('Drag end event');
  }

  configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }

  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.peopleAssigned;
    this.element.querySelector('p')!.textContent = this.project.description;
  }
}
