import { z, type ZodError } from 'zod/v4';

import { arrayGroupToMap } from './array-group-to-map.js';
import { arrayUniqWith } from './array-uniq-with.js';
import { coerceArray } from './coerce-array.js';

export interface ZodErrorFormatted {
  path: string;
  message: string;
}

export function formatZodErrorString(
  zodErrorOrErrors: ZodError | ZodError[],
): string {
  const errors = formatZodError(zodErrorOrErrors);
  return errors
    .map((error) => `${error.path ? `${error.path}: ` : ''}${error.message}`)
    .join(', ');
}

/**
 * @description Flatten one or multiple {@link ZodError} into an array of objects
 */
export function formatZodError(
  zodErrorOrErrors: ZodError | ZodError[],
): ZodErrorFormatted[] {
  // Get all errors in an array of objects
  const errors = formatZodErrorInternal(zodErrorOrErrors);
  // Filter only unique errors
  const uniqueErrors = arrayUniqWith(
    errors,
    (errorA, errorB) =>
      errorA.path === errorB.path && errorA.message === errorB.message,
  );
  // Group errors by the path
  const groupedErrors = arrayGroupToMap(uniqueErrors, (item) => item.path);
  const finalErrors: ZodErrorFormatted[] = [];
  // Loop through all grouped errors and join their descriptions
  for (const [key, value] of groupedErrors) {
    finalErrors.push({
      path: key,
      message: value.map((item) => item.message).join(' | '),
    });
  }
  return finalErrors;
}

function formatZodErrorInternal(
  zodErrorOrErrors: ZodError | ZodError[],
): ZodErrorFormatted[] {
  const zodErrors = coerceArray(zodErrorOrErrors);
  const getInitial = (): ZodErrorFormatted[] => [];
  return zodErrors.reduce((errorsLevel1, error) => {
    errorsLevel1.push(
      ...error.issues.reduce((errorsLevel2, issue) => {
        errorsLevel2.push(...formatZodIssue(issue));
        return errorsLevel2;
      }, getInitial()),
    );
    return errorsLevel1;
  }, getInitial());
}

/**
 * @description Flatten a {@link z.core.$ZodIssue} into an array of objects
 */
export function formatZodIssue(issue: z.core.$ZodIssue): ZodErrorFormatted[] {
  const errors: ZodErrorFormatted[] = [
    {
      message: issue.message,
      path: formatZodIssuePath(issue.path),
    },
  ];
  switch (issue.code) {
    case 'invalid_union': {
      errors.push(
        ...issue.errors.flatMap((issues) =>
          issues.flatMap((innerIssue) => formatZodIssue(innerIssue)),
        ),
      );
      break;
    }
  }
  return errors;
}

/**
 * @description Transform a path array into a string
 * Example: ["config", "requests", 0, "name"] --> "config.requests[0].name"
 */
export function formatZodIssuePath(path: (keyof any)[]): string {
  const [first, ...paths] = path;
  return (
    String(typeof first === 'number' ? `[${first}]` : first) +
    paths
      .map((item) =>
        typeof item === 'number' ? `[${item}]` : `.${String(item)}`,
      )
      .join('')
  );
}
