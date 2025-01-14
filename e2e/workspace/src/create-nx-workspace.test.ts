import {
  checkFilesDoNotExist,
  checkFilesExist,
  e2eCwd,
  expectNoAngularDevkit,
  getPackageManagerCommand,
  getSelectedPackageManager,
  packageManagerLockFile,
  readJson,
  removeProject,
  runCreateWorkspace,
  uniq,
} from '@nrwl/e2e/utils';
import { existsSync, mkdirSync } from 'fs-extra';
import { execSync } from 'child_process';

describe('create-nx-workspace', () => {
  let packageManager;

  beforeEach(() => (packageManager = getSelectedPackageManager() || 'npm'));
  afterAll(() => removeProject({ onlyOnCI: true }));

  it('should be able to create an empty workspace', () => {
    const wsName = uniq('empty');
    runCreateWorkspace(wsName, {
      preset: 'empty',
      packageManager,
    });

    checkFilesExist(
      'workspace.json',
      'package.json',
      packageManagerLockFile[packageManager],
      'apps/.gitkeep',
      'libs/.gitkeep'
    );
    const foreignLockFiles = Object.keys(packageManagerLockFile)
      .filter((pm) => pm !== packageManager)
      .map((pm) => packageManagerLockFile[pm]);

    checkFilesDoNotExist(...foreignLockFiles);

    expectNoAngularDevkit();
  });

  it('should be able to create an oss workspace', () => {
    const wsName = uniq('oss');
    runCreateWorkspace(wsName, {
      preset: 'oss',
      packageManager,
    });

    expectNoAngularDevkit();
  });

  it('should be able to create an angular workspace', () => {
    const wsName = uniq('angular');
    const appName = uniq('app');
    runCreateWorkspace(wsName, {
      preset: 'angular',
      style: 'css',
      appName,
      packageManager,
    });
  });

  it('should be able to create an react workspace', () => {
    const wsName = uniq('react');
    const appName = uniq('app');
    runCreateWorkspace(wsName, {
      preset: 'react',
      style: 'css',
      appName,
      packageManager,
    });

    expectNoAngularDevkit();
  });

  it('should be able to create an next workspace', () => {
    const wsName = uniq('next');
    const appName = uniq('app');
    runCreateWorkspace(wsName, {
      preset: 'next',
      style: 'css',
      appName,
      packageManager,
    });

    expectNoAngularDevkit();
  });

  it('should be able to create an gatsby workspace', () => {
    const wsName = uniq('gatsby');
    const appName = uniq('app');
    runCreateWorkspace(wsName, {
      preset: 'gatsby',
      style: 'css',
      appName,
      packageManager,
    });

    expectNoAngularDevkit();
  });

  it('should be able to create an web-components workspace', () => {
    const wsName = uniq('web-components');
    const appName = uniq('app');
    runCreateWorkspace(wsName, {
      preset: 'web-components',
      style: 'css',
      appName,
      packageManager,
    });

    expectNoAngularDevkit();
  });

  it('should be able to create an angular + nest workspace', () => {
    const wsName = uniq('angular-nest');
    const appName = uniq('app');
    runCreateWorkspace(wsName, {
      preset: 'angular-nest',
      style: 'css',
      appName,
      packageManager,
    });
  });

  it('should be able to create an react + express workspace', () => {
    const wsName = uniq('react-express');
    const appName = uniq('app');
    runCreateWorkspace(wsName, {
      preset: 'react-express',
      style: 'css',
      appName,
      packageManager,
    });

    expectNoAngularDevkit();
  });

  it('should be able to create an express workspace', () => {
    const wsName = uniq('express');
    const appName = uniq('app');
    runCreateWorkspace(wsName, {
      preset: 'express',
      style: 'css',
      appName,
      packageManager,
    });

    expectNoAngularDevkit();
  });

  it('should be able to create a workspace with a custom base branch and HEAD', () => {
    const wsName = uniq('branch');
    runCreateWorkspace(wsName, {
      preset: 'empty',
      base: 'main',
      packageManager,
    });
  });

  it('should be able to create a workspace with custom commit information', () => {
    const wsName = uniq('branch');
    runCreateWorkspace(wsName, {
      preset: 'empty',
      extraArgs:
        '--commit.name="John Doe" --commit.email="myemail@test.com" --commit.message="Custom commit message!"',
      packageManager,
    });
  });

  it('should be able to create a nest workspace', () => {
    const wsName = uniq('nest');
    const appName = uniq('app');
    runCreateWorkspace(wsName, {
      preset: 'nest',
      appName,
      packageManager,
    });
  });

  it('should handle spaces in workspace path', () => {
    const wsName = uniq('empty');

    const tmpDir = `${e2eCwd}/${uniq('with space')}`;

    mkdirSync(tmpDir, { recursive: true });

    const createCommand = getPackageManagerCommand({
      packageManager,
    }).createWorkspace;
    const fullCommand = `${createCommand} ${wsName} --cli=nx --preset=empty --no-nxCloud --no-interactive`;
    execSync(fullCommand, {
      cwd: tmpDir,
      stdio: [0, 1, 2],
      env: process.env,
    });

    expect(existsSync(`${tmpDir}/${wsName}/package.json`)).toBeTruthy();
  });

  it('should respect package manager preference', () => {
    const wsName = uniq('pm');
    const appName = uniq('app');

    process.env.YARN_REGISTRY = `http://localhost:4872`;
    process.env.SELECTED_PM = 'yarn';

    runCreateWorkspace(wsName, {
      preset: 'react',
      style: 'css',
      appName,
      packageManager: 'yarn',
    });

    checkFilesExist('yarn.lock');
    checkFilesDoNotExist('package-lock.json');
    process.env.SELECTED_PM = packageManager;
  });

  it('should store package manager preference for angular cli', () => {
    const wsName = uniq('pm');
    const appName = uniq('app');

    process.env.YARN_REGISTRY = `http://localhost:4872`;
    process.env.SELECTED_PM = 'yarn';

    runCreateWorkspace(wsName, {
      preset: 'angular',
      appName,
      style: 'css',
      packageManager: 'yarn',
      cli: 'angular',
    });

    const workspaceJson = readJson('angular.json');
    expect(workspaceJson.cli.packageManager).toEqual('yarn');
    checkFilesExist('yarn.lock');
    checkFilesDoNotExist('package-lock.json');
    process.env.SELECTED_PM = packageManager;
  });
});
