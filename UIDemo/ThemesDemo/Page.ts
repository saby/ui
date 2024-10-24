import { Control } from 'UI/Base';
// @ts-ignore
import template = require('wml!UIDemo/ThemesDemo/Page');

const LIGHT_THEME = 'default__light';
const DARK_THEME = 'default__dark';
const invertTheme = (theme: string) => {
    return theme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME;
};

export default class Page extends Control {
    _template = template;
    theme1 = LIGHT_THEME;
    theme2 = LIGHT_THEME;
    switchFirst() {
        this.theme1 = invertTheme(this.theme1);
    }
    switchSecond() {
        this.theme2 = invertTheme(this.theme2);
    }
}
