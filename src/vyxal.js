import { Jar, request } from "stackchat.js";

function error(message) {
    return { stdout: "", stderr: message };
}

export async function execute(flags, code, inputs, header = "", footer = "") {
    const jar = new Jar();

    const payload = { flags, code, inputs, header, footer };

    let res = await request("https://vyxal.pythonanywhere.com", { jar });

    if (res.statusCode != 200) {
        return error(`[GET /] returned status code \`${res.statusCode}\``);
    }

    try {
        payload.session = res.body.match(
            /<session-code>(.+?)<\/session-code>/
        )[1];
    } catch {
        return error(
            "[GET /] returned 200 but the session code could not be located."
        );
    }

    res = await request("https://vyxal.pythonanywhere.com/execute", {
        payload,
        jar,
    });

    if (res.statusCode != 200) {
        return error(
            `[POST /execute] returned status code \`${res.statusCode}\``
        );
    }

    try {
        return JSON.parse(res.body);
    } catch {
        return error(
            "[POST /execute] returned 200 but the output could not be parsed."
        );
    }
}
