import ejs from "ejs";
import path from "path";
import { ITemplateRenderer } from "../interfaces/ITemplateRenderer";

export class EJSTemplateRenderer implements ITemplateRenderer {
  async render(template: string, data: any): Promise<string> {
    const templatePath = path.join(
      __dirname,
      "..",
      "views",
      "emails",
      `${template}.ejs`
    );
    return ejs.renderFile(templatePath, data);
  }
}
