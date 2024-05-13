import {
  formatFiles,
  generateFiles,
  joinPathFragments,
  ProjectConfiguration,
  readProjectConfiguration,
  Tree,
  updateProjectConfiguration,
} from '@nx/devkit';
import { ComponentGeneratorSchema } from './schema';
import { applicationGenerator } from '@nx/web';

let tree: Tree;
let options: ComponentGeneratorSchema;
let filePath: string;
let fileName: string;
let tagName: string;
let projectConfig: ProjectConfiguration;
let componentRoot: string;
let relativePath: string;

export async function islandGenerator(
  argTree: Tree,
  argOptions: ComponentGeneratorSchema
) {
  setOptions(argTree, argOptions);

  await generateProject();

  projectConfig = readProjectConfiguration(tree, fileName);
  componentRoot = projectConfig.root;

  await writeFiles();

  updateTargets();
  updateTsConfig();

  deleteFiles();
}

export default islandGenerator;

function setOptions(argTree: Tree, argOptions: ComponentGeneratorSchema) {
  tree = argTree;
  options = argOptions;
  filePath = `islands/${options.name}`;
  fileName = options.name.replace('/', '-');
  tagName = `atoll-${fileName}`;
  relativePath = `${filePath
    .split('/')
    .map(() => '..')
    .join('/')}/`;
}

async function generateProject() {
  await applicationGenerator(tree, {
    name: fileName,
    directory: filePath,
    projectNameAndRootFormat: 'as-provided',
    bundler: 'vite',
    e2eTestRunner: 'none',
  });
}

async function writeFiles() {
  generateFiles(
    tree,
    joinPathFragments(__dirname, 'files'),
    joinPathFragments(componentRoot),
    {
      ...options,
      tagName,
      fileName,
      relativePath,
    }
  );

  await formatFiles(tree);
}

function updateTargets() {
  projectConfig.targets = {
    test: {
      executor: '@nx/vite:test',
      dependsOn: [
        {
          target: 'build',
          projects: 'self',
        },
      ],
    },
    build: {
      executor: '@nx/vite:build',
      outputs: ['{options.outputPath}'],
      options: {
        outputPath: `ui/islands/${fileName}`,
        main: `${filePath}/src/${fileName}.element.ts`,
        tsConfig: `${filePath}/tsconfig.json`,
        assets: [`${filePath}/*.md`],
        emptyOutDir: true,
      },
    },
    lint: {
      executor: '@nx/eslint:lint',
    },
  };

  updateProjectConfiguration(tree, fileName, projectConfig);
}

function updateTsConfig() {
  let tsConfig = JSON.parse(
    tree.read(`${componentRoot}/tsconfig.json`, 'utf-8')
  );

  tsConfig.compilerOptions = {
    jsx: 'preserve',
    jsxImportSource: 'solid-js',
    outDir: '../dist/out-tsc',
    types: ['node'],
    noEmit: false,
  };

  tsConfig = {
    ...tsConfig,
    composite: true,
    exclude: ['src/**/*.spec.ts', 'src/**/*.test.ts', 'src/**/*.stories.ts'],
    include: ['src/**/*.tsx', 'src/**/*.ts'],
  };

  tree.write(
    `${componentRoot}/tsconfig.json`,
    JSON.stringify(tsConfig, null, 2)
  );
}

function deleteFiles() {
  const files = [
    'src/app',
    'src/assets',
    'src/main.ts',
    'public',
    'src/styles.css',
    'index.html',
    '.babelrc',
    'tsconfig.app.json',
  ];

  files.forEach((file) => tree.delete(`${componentRoot}/${file}`));
}
