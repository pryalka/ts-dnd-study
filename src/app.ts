/**
 * Autobind decorator
 */
function Autobind(
  _target: any,
  _methodName: string,
  descriptor: PropertyDescriptor
) {
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
 * Deal with html template tags content
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

    // Trivial validation
    if (enteredTitle.trim().length === 0 ||
        enteredDescription.trim().length === 0 ||
        enteredPeople.trim().length === 0) {
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
      console.log(title, description, people);
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
