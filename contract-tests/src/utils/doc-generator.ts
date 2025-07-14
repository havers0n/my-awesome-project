import fs from 'fs';
import path from 'path';
import { Schema } from 'joi';

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  requestSchema?: Schema;
  responseSchema?: Schema;
  examples?: {
    request?: any;
    response?: any;
  };
}

interface ApiDocumentation {
  service: string;
  version: string;
  baseUrl: string;
  endpoints: ApiEndpoint[];
}

export class DocumentationGenerator {
  private docs: ApiDocumentation[] = [];

  addService(service: ApiDocumentation) {
    this.docs.push(service);
  }

  private schemaToMarkdown(schema: Schema | undefined, indent: string = ''): string {
    if (!schema) return 'No schema defined';

    const description = schema.describe();
    return this.describeToMarkdown(description, indent);
  }

  private describeToMarkdown(description: any, indent: string = ''): string {
    let markdown = '';

    if (description.type === 'object' && description.keys) {
      Object.entries(description.keys).forEach(([key, value]: [string, any]) => {
        const required = description.flags?.presence === 'required' || 
                        value.flags?.presence === 'required' ? ' *(required)*' : '';
        markdown += `${indent}- **${key}**${required}: ${value.type}`;
        
        if (value.flags?.description) {
          markdown += ` - ${value.flags.description}`;
        }
        
        if (value.valids && value.valids.length > 0) {
          markdown += ` (valid values: ${value.valids.join(', ')})`;
        }
        
        markdown += '\n';
        
        if (value.type === 'object' && value.keys) {
          markdown += this.describeToMarkdown(value, indent + '  ');
        } else if (value.type === 'array' && value.items) {
          markdown += `${indent}  - Array of:\n`;
          value.items.forEach((item: any) => {
            markdown += this.describeToMarkdown(item, indent + '    ');
          });
        }
      });
    } else if (description.type === 'array' && description.items) {
      markdown += `${indent}Array of:\n`;
      description.items.forEach((item: any) => {
        markdown += this.describeToMarkdown(item, indent + '  ');
      });
    } else {
      markdown += `${indent}${description.type}`;
      if (description.flags?.description) {
        markdown += ` - ${description.flags.description}`;
      }
      if (description.valids && description.valids.length > 0) {
        markdown += ` (valid values: ${description.valids.join(', ')})`;
      }
      markdown += '\n';
    }

    return markdown;
  }

  generateMarkdown(): string {
    let markdown = '# API Documentation\n\n';
    markdown += 'This documentation is automatically generated from contract tests.\n\n';

    this.docs.forEach(service => {
      markdown += `## ${service.service}\n\n`;
      markdown += `**Version:** ${service.version}\n`;
      markdown += `**Base URL:** ${service.baseUrl}\n\n`;

      service.endpoints.forEach(endpoint => {
        markdown += `### ${endpoint.method} ${endpoint.path}\n\n`;
        markdown += `${endpoint.description}\n\n`;

        if (endpoint.requestSchema) {
          markdown += '#### Request Schema\n\n';
          markdown += this.schemaToMarkdown(endpoint.requestSchema);
          markdown += '\n';
        }

        if (endpoint.responseSchema) {
          markdown += '#### Response Schema\n\n';
          markdown += this.schemaToMarkdown(endpoint.responseSchema);
          markdown += '\n';
        }

        if (endpoint.examples) {
          markdown += '#### Examples\n\n';
          
          if (endpoint.examples.request) {
            markdown += '**Request:**\n```json\n';
            markdown += JSON.stringify(endpoint.examples.request, null, 2);
            markdown += '\n```\n\n';
          }

          if (endpoint.examples.response) {
            markdown += '**Response:**\n```json\n';
            markdown += JSON.stringify(endpoint.examples.response, null, 2);
            markdown += '\n```\n\n';
          }
        }
      });
    });

    return markdown;
  }

  generateOpenAPI(): any {
    const openapi = {
      openapi: '3.0.0',
      info: {
        title: 'API Documentation',
        version: '1.0.0',
        description: 'Automatically generated from contract tests'
      },
      servers: this.docs.map(doc => ({
        url: doc.baseUrl,
        description: doc.service
      })),
      paths: {} as any
    };

    this.docs.forEach(service => {
      service.endpoints.forEach(endpoint => {
        const pathKey = endpoint.path;
        if (!openapi.paths[pathKey]) {
          openapi.paths[pathKey] = {};
        }

        const method = endpoint.method.toLowerCase();
        openapi.paths[pathKey][method] = {
          summary: endpoint.description,
          operationId: `${method}${endpoint.path.replace(/\//g, '_')}`,
          requestBody: endpoint.requestSchema ? {
            required: true,
            content: {
              'application/json': {
                schema: this.joiToOpenAPISchema(endpoint.requestSchema)
              }
            }
          } : undefined,
          responses: {
            '200': {
              description: 'Successful response',
              content: endpoint.responseSchema ? {
                'application/json': {
                  schema: this.joiToOpenAPISchema(endpoint.responseSchema)
                }
              } : undefined
            }
          }
        };
      });
    });

    return openapi;
  }

  private joiToOpenAPISchema(schema: Schema): any {
    const description = schema.describe();
    return this.describeToOpenAPISchema(description);
  }

  private describeToOpenAPISchema(description: any): any {
    const schema: any = {
      type: description.type
    };

    if (description.flags?.description) {
      schema.description = description.flags.description;
    }

    if (description.type === 'object' && description.keys) {
      schema.properties = {};
      schema.required = [];

      Object.entries(description.keys).forEach(([key, value]: [string, any]) => {
        schema.properties[key] = this.describeToOpenAPISchema(value);
        if (value.flags?.presence === 'required') {
          schema.required.push(key);
        }
      });
    } else if (description.type === 'array' && description.items) {
      schema.items = this.describeToOpenAPISchema(description.items[0]);
    } else if (description.valids && description.valids.length > 0) {
      schema.enum = description.valids;
    }

    return schema;
  }

  saveDocumentation(outputDir: string) {
    // Save Markdown
    const markdownPath = path.join(outputDir, 'API.md');
    fs.writeFileSync(markdownPath, this.generateMarkdown());
    console.log(`Markdown documentation saved to: ${markdownPath}`);

    // Save OpenAPI
    const openApiPath = path.join(outputDir, 'openapi.json');
    fs.writeFileSync(openApiPath, JSON.stringify(this.generateOpenAPI(), null, 2));
    console.log(`OpenAPI documentation saved to: ${openApiPath}`);
  }
}
