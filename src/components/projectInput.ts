/// <reference path="./baseComponent.ts" />

namespace App {
  /**
   * Deal with form rendering submission and validating
   */
  export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
}
