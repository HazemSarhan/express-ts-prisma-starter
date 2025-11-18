import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError, ZodTypeAny, ZodSchema } from 'zod';
import { BadRequestError } from '../errors';
import { ValidationError } from '../../types/validation';

type ValidationSource = 'body' | 'params' | 'query' | 'auto';

export const validate = (
  schema: ZodSchema,
  source: ValidationSource = 'auto'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let dataToValidate: unknown;

      if (source === 'auto') {
        // Auto-detect: Check if schema expects body, query, params structure
        const schemaShape = (schema as ZodObject<Record<string, ZodTypeAny>>)
          .shape;
        const hasBodyKey = schemaShape && 'body' in schemaShape;
        const hasQueryKey = schemaShape && 'query' in schemaShape;
        const hasParamsKey = schemaShape && 'params' in schemaShape;

        if (hasBodyKey || hasQueryKey || hasParamsKey) {
          // Schema expects full structure
          dataToValidate = {
            body: req.body,
            query: req.query,
            params: req.params,
          };
        } else {
          // Default to body validation
          dataToValidate = req.body;
        }
      } else {
        // Explicit source
        switch (source) {
          case 'body':
            dataToValidate = req.body;
            break;
          case 'params':
            dataToValidate = req.params;
            break;
          case 'query':
            dataToValidate = req.query;
            break;
        }
      }

      await schema.parseAsync(dataToValidate);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors: ValidationError[] = error.issues.map(
          (issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })
        );

        throw new BadRequestError(
          validationErrors
            .map((err) => `${err.field}: ${err.message}`)
            .join(', ')
        );
      }
      next(error);
    }
  };
};
