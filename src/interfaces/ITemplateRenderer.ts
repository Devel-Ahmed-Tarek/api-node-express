export interface ITemplateRenderer {
  render(template: string, data: any): Promise<string>;
}
