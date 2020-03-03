/**
 * State management
 */
class ProjectState {
  private projects: any[] = [];
  private static instance: ProjectState;
  private listeners: any[] = [];

  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, people: number) {
    const newProject = {
      id: Math.random().toString(),
      title,
      description,
      people
    };

    this.projects.push(newProject);

    // Call all listeners functions
    for (const listenerFn of this.listeners) {
      // Return new copy of state
      listenerFn(this.projects.slice());
    }
  }

  addListener(listenerFn: Function) {
    this.listeners.push(listenerFn);
  }
}

// App state
const projectState = ProjectState.getInstance();

/**
 * Validation logic
 */
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (validatableInput.min != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (validatableInput.max != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }

  return isValid;
}

/**
 * Autobind decorator
 */
function Autobind(_target: any, _methodName: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      // Bind original method to the object on which method was called
      const boundMethod = originalMethod.bind(this);
      return boundMethod;
    }
  };

  return adjustedDescriptor;
}

/**
 * Deal with lists
 */
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: any[];

  constructor(private type: 'active' | 'finished') {
    this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;
    this.assignedProjects = [];

    // Render content of the template inside the host element
    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${type}-projects`;

    // Add listener function
    projectState.addListener((projects: any[]) => {
      // Update projects according to actual state changes
      this.assignedProjects = projects;
      this.renderProjects();
    });

    this.attach();
    this.renderContent();
  }

  private attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.element);
  }

  private renderContent() {
    const listID = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listID;
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
  }

  // Render projects in lists
  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    for (const prjItem of this.assignedProjects) {
      const listItem = document.createElement('li');
      listItem.textContent = prjItem.title;
      listEl.appendChild(listItem);
    }
  }
}

/**
 * Deal with form rendering submission and validating
 */
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  // Form input fields
  titleInputElement: HTMLInputElement;
  desctiptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    // Use exclamation sign here to tell TS that element with an id 100% exists
    // Use type casting here to tell that it will be html template element
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
    // Where content of template renders
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    // Render content of the template inside the host element
    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLFormElement;

    // Setup form input elements
    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
    this.desctiptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;
    // Set id to the form to perform styling
    this.element.id = 'user-input';

    this.configure();
    this.attach();
  }

  // Get all data enterd by the user
  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.desctiptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    // Construct validatable object
    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true
    };
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5
    };
    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5
    };

    // Trivial validation
    if (!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)) {
      alert('Invalid input please try again');
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  // Clear all inputs
  private clearInputs() {
    this.titleInputElement.value = '';
    this.desctiptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  // Handle form submission
  @Autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();

    // If array was returned
    if (Array.isArray(userInput)) {
      this.clearInputs();
      const [title, description, people] = userInput;

      // Save entered data in state
      projectState.addProject(title, description, people);
    }
  }

  // Attach event listeners to the form inputs
  private configure() {
    // Bind submitHandler method here to the class 'this'
    // not the event target 'this'
    this.element.addEventListener('submit', this.submitHandler);
  }

  // Attach template content to the node
  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

const projectInput = new ProjectInput();
const activeProjectsList = new ProjectList('active');
const finishedProjectsList = new ProjectList('finished');
