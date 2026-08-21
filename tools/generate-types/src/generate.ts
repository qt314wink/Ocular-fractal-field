import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from 'json-schema-to-typescript';
import { format, resolveConfig } from 'prettier';

const toolDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(toolDirectory, '../../..');
const schemaPath = resolve(repositoryRoot, 'packages/contracts/schemas/manifest.schema.json');
const outputPath = resolve(repositoryRoot, 'packages/contracts/src/generated/manifest.ts');

const schemaBytes = await readFile(schemaPath);
const schema = JSON.parse(schemaBytes.toString('utf8'));
const schemaSha256 = createHash('sha256').update(schemaBytes).digest('hex');
const bannerComment = [
  '/*',
  ' * GENERATED FILE - DO NOT EDIT.',
  ' * Source: packages/contracts/schemas/manifest.schema.json',
  ` * Source SHA-256: ${schemaSha256}`,
  ' */',
].join('\n');

const generated = await compile(schema, 'OcularFractalFieldManifest', {
  bannerComment,
  declareExternallyReferenced: true,
  enableConstEnums: false,
  unreachableDefinitions: true,
});
const prettierConfig = (await resolveConfig(outputPath)) ?? {};
const formatted = await format(generated, { ...prettierConfig, parser: 'typescript' });

await mkdir(dirname(outputPath), { recursive: true });
let current = '';
try {
  current = await readFile(outputPath, 'utf8');
} catch (error: unknown) {
  if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error;
}
if (current !== formatted) await writeFile(outputPath, formatted, 'utf8');
