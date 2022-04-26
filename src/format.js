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
