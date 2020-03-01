/**
 * Deal with html template tags content
 */
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;

  constructor() {
    // Use exclamation sign here to tell TS that element with an id 100% exists
    // Use type casting here to tell that it will be html template element
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
    // Where content of template renders
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    // Render content of the template inside the host element
    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.attach();
  }

  // Attach template content to the node
  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element); 
  }
}

const projectInput = new ProjectInput();
