/* eslint-disable @typescript-eslint/no-namespace */
import type { Controller } from 'UICommon/theme/controller';

const fakeInstance = {} as Controller;

// Нужен только для тестов сборки html.tmpl, где нет полноценной сборки фича-модулей.
export const getThemeController: () => Controller = () => fakeInstance;
