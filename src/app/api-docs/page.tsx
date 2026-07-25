"use client";

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

const spec = {
  openapi: '3.0.0',
  info: {
    title: 'Miva Maintenance API',
    version: '1.0.0',
    description: 'API documentation for the University Maintenance platform.',
  },
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' },
                  role: { type: 'string', enum: ['STUDENT', 'STAFF', 'MAINTENANCE', 'ADMIN'] }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'User created' },
          '400': { description: 'Bad request (e.g. user exists)' }
        }
      }
    },
    '/api/requests': {
      get: {
        summary: 'Get service requests (Filtered by Role)',
        responses: {
          '200': { description: 'Returns a list of requests' },
          '401': { description: 'Unauthorized' }
        }
      },
      post: {
        summary: 'Create a new service request',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  location: { type: 'string' },
                  categoryId: { type: 'string', description: 'Name of category e.g. Plumbing' },
                  evidenceUrl: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'Request created' },
          '400': { description: 'Missing fields' }
        }
      }
    },
    '/api/requests/{id}/assign': {
      post: {
        summary: 'Assign a request to a maintenance officer (Admin only)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  maintenanceId: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Assignment successful' },
          '401': { description: 'Unauthorized' }
        }
      }
    }
  }
};

export default function ApiDocs() {
  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh', padding: '20px' }}>
      <SwaggerUI spec={spec} />
    </div>
  );
}
