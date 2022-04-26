import { res } from "file-ez";
import fs from "fs";

export default JSON.parse(fs.readFileSync(res("../config.json")));
