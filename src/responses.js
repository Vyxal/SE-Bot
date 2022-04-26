import { res } from "file-ez";
import fs from "fs";
import { parse } from "yaml";

export default parse(fs.readFileSync(res("./responses.yml"), "utf-8"));
