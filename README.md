# arg-parser-ts

## Installation

```bash
npm install arg-parser-ts
```

or

```bash
yarn add arg-parser-ts
```

## Types

name: string -> required
flag: string[] ->required
required: boolean -> optional
default: string -> optional

## Note

default cant be use if required is in use and vice versa

## Usage

```typescript
import { Parser, ValidationError } from "arg-parser-ts";

interface Response {
    _: string[];
    hi: string;
    low: string;
}
try {
    const args = new Parser(process.argv.slice(2));
    const s = args.check<Response>([
        { name: "okay", flag: ["-o"] },
        { name: "name", flag: ["-n", "--name"], required: true },
        { name: "doing", flag: ["-d", "--doing"], default: "great" },
    ]);
    console.log(s);
} catch (e) {
    const err = e as ValidationError;
    if (err.code == 0) console.log("developer error", err.message);
    if (err.code == 1) console.log("user error", err.message);
}
```

## Test

```bash
yarn test
//user error -n / --name is required

yarn test -n
//user error -n / --name expect a value

yarn test -n John
//{ _: [], okay: false, name: 'John', doing: 'great' }

yarn test -n John -o
//{ _: [], okay: true, name: 'John', doing: 'great' }

yarn test -n John -o yes
// { _: [], okay: 'yes', name: 'John', doing: 'great' }

yarn test -n John -o yes -d
// { _: [], okay: 'yes', name: 'John', doing: undefined }

yarn test -n John -o yes -d bad
//{ _: [], okay: 'yes', name: 'John', doing: 'bad' }

yarn test -n John forError -o yes -d bad
//user error forError dont have pair, please check your arguments

yarn test v1 v2 -n John -o yes -d bad
//{ _: [ 'v1', 'v2' ], okay: 'yes', name: 'John', doing: 'bad' }

```
