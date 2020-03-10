/**
 * Autobind decorator
 */
export function Autobind(_target: any, _methodName: string, descriptor: PropertyDescriptor) {
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
