import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('merges basic string classes', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('handles object conditionals', () => {
    expect(cn('class1', { class2: true, class3: false })).toBe('class1 class2');
  });

  it('resolves conflicting tailwind classes', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('handles falsy values', () => {
    expect(cn('class1', null, undefined, false, 0, '', 'class2')).toBe('class1 class2');
  });

  it('handles arrays of classes', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });
});
