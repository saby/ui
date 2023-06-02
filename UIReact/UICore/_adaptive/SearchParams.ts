/**
 * Decode a URI component.
 */
const decode = (s: string) => {
   // Treat plus signs as spaces, unlike the default implementation.
   return decodeURIComponent(s.replace(/\+/g, ' '));
};

/**
 * Fill for URLSearchParams, which is not available on all React Native
 * JavaScript environments (like iOS).
 *
 * Behavior should be identical to what's described here:
 * https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
 * @private private
 */
export class SearchParams {
   private params: Map<string, string | string[]>;

   constructor(url: string) {
      this.params = new Map();
      this.parse(url);
   }

   /**
    * Get the value set for the given key. If there were multiple values, only
    * return the first parsed one.
    *
    * If no value was set, returns null.
    */
   get(key: string) {
      const value = this.params.get(key);
      if (!value) {
         return null;
      }

      if (Array.isArray(value)) {
         return value[0] || '';
      }

      return value;
   }

   /**
    * Parse the given query into the param map.
    */
   private parse(url: string) {
      // Trim initial query string.
      const index = url.indexOf('?');
      const query = url.substring(index + 1);

      if (!query.length) {
         return;
      }

      const vars = query.split('&');
      for (const v of vars) {
         const [key, value] = v.split('=', 2);
         if (value === undefined) {
            // This is consistent with the URLSearchParams behavior, even though
            // this scenario is usually interpretted as a boolean instead of the
            // empty string.
            this.addValue(key, '');
            continue;
         }

         const cleanKey = decode(key);
         const cleanValue = decode(value);
         this.addValue(cleanKey, cleanValue);
      }
   }

   /**
    * Add a new value to the parsed params.
    */
   private addValue(key: string, value: string) {
      const existing = this.params.get(key);

      if (existing !== undefined) {
         // If the existing key is already an array, just append. Otherwise
         // convert it to an array and append.
         if (Array.isArray(existing)) {
            existing.push(value);
         } else {
            this.params.set(key, [existing, value]);
         }
      } else {
         // If no key exists yet, set it.
         this.params.set(key, value);
      }
   }
}