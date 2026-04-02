import { File } from 'node:buffer';
if (!globalThis.File) (globalThis as typeof globalThis & { File: typeof File }).File = File;

import serverless from 'serverless-http';
import { app } from '../../api/index';

export const handler = serverless(app);
