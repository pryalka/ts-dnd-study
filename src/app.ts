/// <reference path="./components/projectInput.ts" />
/// <reference path="./components/projectList.ts" />

namespace App {
  new ProjectInput();
  new ProjectList('active');
  new ProjectList('finished');
}
