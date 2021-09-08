export interface Schema {
    name: string;
    flag: string[];
    required?: boolean;
    default?: string | number | boolean;
}

export interface TypeSchema {
    _: string[];
}

export class ValidationError extends Error {
    public code: 0 | 1;
    constructor(code: 0 | 1, message: string) {
        super(message);
        this.code = code;
    }
}

export class Parser {
    constructor(private args: string[]) {}

    private validate(schemas: Schema[]) {
        let name: string[] = [];
        let flags: string[] = [];
        for (const scheme of schemas) {
            if (name.includes(scheme.name)) throw new ValidationError(0, `duplicate key of ${scheme.name}`);
            name.push(scheme.name);
            for (const flag of scheme.flag) {
                if (flags.includes(flag)) throw new ValidationError(0, `duplicate flag of ${flag}`);
                flags.push(flag);
            }
        }
        return true;
    }

    check<Type extends TypeSchema>(schemas: Schema[]): Type {
        try {
            this.validate(schemas);
        } catch (error) {
            throw error;
        }

        let data: string[] = [];
        let pair: [string[]] = [[]];
        let dash = false; // for checking if - or -- flag start
        let require = false;
        let x = 0;
        for (const args of this.args) {
            if (args.startsWith("-") || args.startsWith("--")) dash = true;

            if (!dash) data.push(args);

            if (dash) {
                if (require) {
                    if (args.startsWith("-") || args.startsWith("--")) {
                        pair.push([args]);
                        x += 1;
                    } else {
                        pair[x].push(args);
                        require = false;
                    }
                } else {
                    if (args.startsWith("-") || args.startsWith("--")) {
                        const haveValue = args.split("=");
                        if (haveValue.length >= 2) {
                            const value = haveValue.slice(1).join("=");
                            pair.push([haveValue[0], value]);
                        } else {
                            pair.push([args]);
                            require = true;
                        }
                        x += 1;
                    } else {
                        throw new ValidationError(1, `${args} dont have pair, please check your arguments`);
                    }
                }
            }
        }
        let filtered = { _: data };
        for (const scheme of schemas) {
            // @ts-ignore
            if (scheme.default) filtered[scheme.name] = scheme.default;
            let answer = false;
            let finalValue;
            pair.forEach((v) => {
                if (scheme.flag.includes(v[0])) {
                    // @ts-ignore
                    filtered[scheme.name] = v[1];
                    finalValue = v[1];
                    answer = true;
                }
            });
            if (scheme.required && !answer) throw new ValidationError(1, `${scheme.flag.join(" / ")} is required`);
            if (scheme.required && finalValue === undefined)
                throw new ValidationError(1, `${scheme.flag.join(" / ")} expect a value`);
            if (scheme.required === undefined && finalValue === undefined && !scheme.default)
                // @ts-ignore
                filtered[scheme.name] = answer;
        }
        return filtered as Type;
    }
}
