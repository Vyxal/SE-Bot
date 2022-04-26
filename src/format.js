export function linkRepo(repo, fullName = true) {
    return `[${fullName ? repo.full_name : repo.name}](${repo.html_url})`;
}
