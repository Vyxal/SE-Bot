export function linkDiscussion(discussion) {
    return `[${discussion.title}](${discussion.html_url})`;
}

export function linkIssue(issue, caps = true) {
    return `[${caps ? "I" : "i"}ssue #${issue.number}](${issue.html_url})`;
}

export function linkPullRequest(pr, includeRepo = true) {
    let message = `[PR #${pr.number}](${pr.html_url})`;

    if (includeRepo) {
        const src = pr.head.repo;
        const dst = pr.base.repo;

        if (src.full_name == dst.full_name) {
            message += ` (${linkRepo(src)})`;
        } else {
            message += ` (${linkRepo(src)} → ${linkRepo(dst)})`;
        }
    }

    return message;
}

export function linkRef(refname, data) {
    return `[${data.repository.name}/${refname}](${data.repository.html_url}/tree/${refname})`;
}

export function linkRepo(repo, fullName = true) {
    return `[${fullName ? repo.full_name : repo.name}](${repo.html_url})`;
}

export function linkUser(user) {
    if (user.endsWith("[bot]")) {
        return user.slice(0, user.length - 5) + " (bot)";
    }
    return `[${user}](https://github.com/${user})`;
}

export function msgify(text) {
    return text
        .split("\n")[0]
        .split("\r")[0]
        .split("\f")[0]
        .replaceAll("_", "\\_")
        .replaceAll("*", "\\*")
        .replaceAll("`", "\\`");
}

export function truncate(text, length = 500) {
    return text.length > length ? text.substring(0, length - 3) + "..." : text;
}
