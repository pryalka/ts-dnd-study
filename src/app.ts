/**
 * Drag and drop logic
 */
interface Dragable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarger {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

/**
 * Project status enum
 */
enum ProjectStatus {
  ACTIVE,
  FINISHED
}

/**
 * Poject class
 */
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

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
class ProjectState extends State<Project> {
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

  addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      people,
      ProjectStatus.ACTIVE
    );

    this.projects.push(newProject);

    // Call all listeners functions
    for (const listenerFn of this.listeners) {
      // Return new copy of state
      listenerFn(this.projects.slice());
    }
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
 * Base class
 */
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;

    // Render content of the template inside the host element
    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as U;

    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBeginning ? 'afterbegin' : 'beforeend',
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

/**
 * Project item class
 */
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Dragable {
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
    console.log(event);
  }

  dragEndHandler(_event: DragEvent) {
    console.log('Drag end event');
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

/**
 * Deal with lists
 */
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];
    this.configure();
    this.renderContent();
  }

  configure() {
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

/**
 * Deal with form rendering submission and validating
 */
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  // Form input fields
  titleInputElement: HTMLInputElement;
  desctiptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input');
    // Setup form input elements
    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
    this.desctiptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

    this.configure();
  }

  // Attach event listeners to the form inputs
  configure() {
    // Bind submitHandler method here to the class 'this' not the event target 'this'
    this.element.addEventListener('submit', this.submitHandler);
  }

  renderContent() {}

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
    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
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
}

const projectInput = new ProjectInput();
const activeProjectsList = new ProjectList('active');
const finishedProjectsList = new ProjectList('finished');
