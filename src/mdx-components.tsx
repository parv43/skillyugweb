import type { MDXComponents } from 'mdx/types';
import Image, { ImageProps } from 'next/image';

// This file is required to use MDX in `app` directory.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
  };
}
