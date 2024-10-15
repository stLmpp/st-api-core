export interface Handler {
  handle(...args: any[]): Promise<any>;
}
