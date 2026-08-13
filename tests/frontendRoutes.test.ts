import { describe, expect, it } from '@jest/globals';
import { Dirent, readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const repoRoot = process.cwd();
const appDir = join(repoRoot, 'frontend/src/app');
const navigationSidebarPath = join(repoRoot, 'frontend/src/components/organisms/NavigationSidebar.tsx');

type FrontendRoute = {
  activeItem?: string;
  importPath: string;
  navHref?: string;
  navLabel?: string;
  pageFile: string;
  routePath: string;
  screenFile: string;
  screenName: string;
};

const frontendRoutes: FrontendRoute[] = [
  {
    activeItem: 'dashboard',
    importPath: '@/screens/dashboard',
    navHref: '/',
    navLabel: 'Dashboard',
    pageFile: 'frontend/src/app/page.tsx',
    routePath: '/',
    screenFile: 'frontend/src/screens/dashboard/DashboardPage.tsx',
    screenName: 'DashboardPage',
  },
  {
    importPath: '@/screens/auth',
    pageFile: 'frontend/src/app/auth/page.tsx',
    routePath: '/auth',
    screenFile: 'frontend/src/screens/auth/AuthPage.tsx',
    screenName: 'AuthPage',
  },
  {
    activeItem: 'policy-explorer',
    importPath: '@/screens/policies',
    navHref: '/policies',
    navLabel: 'Policy Explorer',
    pageFile: 'frontend/src/app/policies/page.tsx',
    routePath: '/policies',
    screenFile: 'frontend/src/screens/policies/PolicyExplorerPage.tsx',
    screenName: 'PolicyExplorerPage',
  },
  {
    activeItem: 'policy-explorer',
    importPath: '@/screens/policies',
    pageFile: 'frontend/src/app/policies/[id]/page.tsx',
    routePath: '/policies/[id]',
    screenFile: 'frontend/src/screens/policies/PolicyDetailPage.tsx',
    screenName: 'PolicyDetailPage',
  },
  {
    activeItem: 'companies',
    importPath: '@/screens/companies',
    navHref: '/companies',
    navLabel: 'Companies',
    pageFile: 'frontend/src/app/companies/page.tsx',
    routePath: '/companies',
    screenFile: 'frontend/src/screens/companies/CompanyExplorerPage.tsx',
    screenName: 'CompanyExplorerPage',
  },
  {
    activeItem: 'countries',
    importPath: '@/screens/countries',
    navHref: '/countries',
    navLabel: 'Countries',
    pageFile: 'frontend/src/app/countries/page.tsx',
    routePath: '/countries',
    screenFile: 'frontend/src/screens/countries/CountryExplorerPage.tsx',
    screenName: 'CountryExplorerPage',
  },
  {
    activeItem: 'technology-explorer',
    importPath: '@/screens/technologies',
    navHref: '/technologies',
    navLabel: 'Technology Explorer',
    pageFile: 'frontend/src/app/technologies/page.tsx',
    routePath: '/technologies',
    screenFile: 'frontend/src/screens/technologies/TechnologyExplorerPage.tsx',
    screenName: 'TechnologyExplorerPage',
  },
  {
    activeItem: 'timeline',
    importPath: '@/screens/timeline',
    navHref: '/timeline',
    navLabel: 'Timeline',
    pageFile: 'frontend/src/app/timeline/page.tsx',
    routePath: '/timeline',
    screenFile: 'frontend/src/screens/timeline/TimelinePage.tsx',
    screenName: 'TimelinePage',
  },
  {
    activeItem: 'developer-settings',
    importPath: '@/screens/settings',
    navHref: '/developer/settings',
    navLabel: 'Developer Settings',
    pageFile: 'frontend/src/app/developer/settings/page.tsx',
    routePath: '/developer/settings',
    screenFile: 'frontend/src/screens/settings/DeveloperSettingsPage.tsx',
    screenName: 'DeveloperSettingsPage',
  },
];

const expectedPageFiles = frontendRoutes.map((route) => route.pageFile).sort();

const normalizePath = (value: string): string => value.split(sep).join('/');

const readProjectFile = (relativePath: string): string =>
  readFileSync(join(repoRoot, relativePath), 'utf8');

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const collectPageFiles = (directory: string): string[] => {
  const entries: Dirent[] = readdirSync(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectPageFiles(entryPath));
      continue;
    }

    if (entry.name === 'page.tsx') {
      files.push(normalizePath(relative(repoRoot, entryPath)));
    }
  }

  return files;
};

describe('frontend route smoke coverage', () => {
  it('keeps the expected Next app page routes in place', () => {
    expect(collectPageFiles(appDir).sort()).toEqual(expectedPageFiles);
  });

  it.each(frontendRoutes)('wires $routePath to $screenName through a screen barrel', (route) => {
    const pageSource = readProjectFile(route.pageFile);
    const screenDirectory = route.importPath.replace('@/screens/', '');
    const barrelSource = readProjectFile(`frontend/src/screens/${screenDirectory}/index.ts`);
    const screenSource = readProjectFile(route.screenFile);
    const screenModuleName = route.screenFile.split('/').pop()?.replace(/\.tsx$/, '');

    expect(pageSource).toMatch(
      new RegExp(
        `import\\s+\\{\\s*${route.screenName}\\s*\\}\\s+from\\s+['"]${escapeRegExp(route.importPath)}['"];`,
      ),
    );
    expect(pageSource).toContain(`<${route.screenName}`);
    expect(barrelSource).toContain(`export { ${route.screenName} } from './${screenModuleName}';`);
    expect(screenSource).toMatch(new RegExp(`export\\s+function\\s+${route.screenName}\\b`));
  });

  it('keeps sidebar navigation aligned with authenticated route screens', () => {
    const navigationSource = readFileSync(navigationSidebarPath, 'utf8');
    const navigationRoutes = frontendRoutes.filter((route) => route.navHref && route.activeItem);

    for (const route of navigationRoutes) {
      const screenSource = readProjectFile(route.screenFile);

      expect(navigationSource).toContain(`href: '${route.navHref}'`);
      expect(navigationSource).toContain(`id: '${route.activeItem}'`);
      expect(navigationSource).toContain(`label: '${route.navLabel}'`);
      expect(screenSource).toContain(`activeItem="${route.activeItem}"`);
    }
  });
});
