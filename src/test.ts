import { Parser, ValidationError } from "./index";

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
