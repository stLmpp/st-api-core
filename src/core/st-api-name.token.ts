import { ValueProvider } from '@nestjs/common';

export const StApiName = 'StApiName';

export function provideStApiName(name: string): ValueProvider {
  return {
    provide: StApiName,
    useValue: name,
  };
}
