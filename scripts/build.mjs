import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve('.');
const output = resolve(root, 'dist');
if (output !== resolve(root, 'dist')) throw new Error('Unexpected build output');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(resolve(root, 'site'), output, { recursive: true });
console.log('Static site built in dist/');
