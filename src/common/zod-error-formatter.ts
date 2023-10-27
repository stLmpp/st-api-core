import { type ZodError, type ZodIssue, ZodIssueCode } from 'zod';

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
  return zodErrors.reduce(
    (errorsLevel1, error) => [
      ...errorsLevel1,
      ...error.issues.reduce(
        (errorsLevel2, issue) => [...errorsLevel2, ...formatZodIssue(issue)],
        getInitial(),
      ),
    ],
    getInitial(),
  );
}

/**
 * @description Flatten a {@link ZodIssue} into an array of objects
 */
export function formatZodIssue(issue: ZodIssue): ZodErrorFormatted[] {
  const errors: ZodErrorFormatted[] = [
    {
      message: issue.message,
      path: formatZodIssuePath(issue.path),
    },
  ];
  switch (issue.code) {
    case ZodIssueCode.invalid_union: {
      errors.push(...formatZodErrorInternal(issue.unionErrors));
      break;
    }
    case ZodIssueCode.invalid_arguments: {
      errors.push(...formatZodErrorInternal(issue.argumentsError));
      break;
    }
    case ZodIssueCode.invalid_return_type: {
      errors.push(...formatZodErrorInternal(issue.returnTypeError));
      break;
    }
  }
  return errors;
}

/**
 * @description Transform a path array into a string
 * Example: ["config", "requests", 0, "name"] --> "config.requests[0].name"
 */
export function formatZodIssuePath(path: (string | number)[]): string {
  const [first, ...paths] = path;
  return (
    (typeof first === 'number' ? `[${first}]` : first) +
    paths
      .map((item) => (typeof item === 'number' ? `[${item}]` : `.${item}`))
      .join('')
  );
}
