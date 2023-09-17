import { type ZodError, type ZodIssue, ZodIssueCode } from 'zod';

import { arrayGroupToMap } from './array-group-to-map.js';
import { arrayUniqWith } from './array-uniq-with.js';
import { coerceArray } from './coerce-array.js';

export interface ZodErrorFormatted {
  path: string;
  message: string;
}

export function formatZodErrorString(
  zod_error_or_errors: ZodError | ZodError[],
): string {
  const errors = formatZodError(zod_error_or_errors);
  return errors
    .map((error) => `${error.path ? `${error.path}: ` : ''}${error.message}`)
    .join(', ');
}

/**
 * @description Flatten one or multiple {@link ZodError} into an array of objects
 */
export function formatZodError(
  zod_error_or_errors: ZodError | ZodError[],
): ZodErrorFormatted[] {
  // Get all errors in an array of objects
  const errors = format_zod_error_internal(zod_error_or_errors);
  // Filter only unique errors
  const unique_errors = arrayUniqWith(
    errors,
    (error_a, error_b) =>
      error_a.path === error_b.path && error_a.message === error_b.message,
  );
  // Group errors by the path
  const grouped_errors = arrayGroupToMap(unique_errors, (item) => item.path);
  const final_errors: ZodErrorFormatted[] = [];
  // Loop through all grouped errors and join their descriptions
  for (const [key, value] of grouped_errors) {
    final_errors.push({
      path: key,
      message: value.map((item) => item.message).join(' | '),
    });
  }
  return final_errors;
}

function format_zod_error_internal(
  zodErrorOrErrors: ZodError | ZodError[],
): ZodErrorFormatted[] {
  const zod_errors = coerceArray(zodErrorOrErrors);
  const get_initial = (): ZodErrorFormatted[] => [];
  return zod_errors.reduce(
    (errorsLevel1, error) => [
      ...errorsLevel1,
      ...error.issues.reduce(
        (errorsLevel2, issue) => [...errorsLevel2, ...formatZodIssue(issue)],
        get_initial(),
      ),
    ],
    get_initial(),
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
      errors.push(...format_zod_error_internal(issue.unionErrors));
      break;
    }
    case ZodIssueCode.invalid_arguments: {
      errors.push(...format_zod_error_internal(issue.argumentsError));
      break;
    }
    case ZodIssueCode.invalid_return_type: {
      errors.push(...format_zod_error_internal(issue.returnTypeError));
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
  return path.reduce((fullPath: string, item: string | number) => {
    if (typeof item === 'number') {
      return `${fullPath}[${item}]`;
    }
    return `${fullPath && fullPath + '.'}${item}`;
  }, '');
}
