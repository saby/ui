export class TranslatableString extends String {
    i18n: boolean = true;
    constructor(private value: string) {
        super();
    }
    toString(): string {
        return this.translatedValue;
    }

    toJSON(): string {
        return this.translatedValue;
    }

    valueOf(): string {
        return this.translatedValue;
    }

    get length(): number {
        return this.translatedValue.length;
    }

    protected get translatedValue(): string {
        return String(this.value);
    }
}

export default function rk(text: string) {
    return new TranslatableString(text);
}
