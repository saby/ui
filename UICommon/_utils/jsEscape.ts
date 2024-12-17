/** XSS prevent best practice https://portswigger.net/web-security/cross-site-scripting/preventing */
export function jsEscape(str: string): string {
    return String(str).replace(/[^\w. ]/gi, (c) => {
        return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
    });
}
