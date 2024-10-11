import { InjectionToken, ValueProvider } from '@stlmpp/di';

export const StApiName = new InjectionToken<string>('StApiName');

export function provideStApiName(name: string): ValueProvider {
  return {
    provide: StApiName,
    useValue: name,
  };
}
