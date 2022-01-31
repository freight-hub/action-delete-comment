import * as github from "@actions/github";
import * as core from "@actions/core";

async function run(): Promise<void> {
  try {
    const githubToken = core.getInput("github_token", { required: true });
    const body = core.getInput("body", { required: true });

    const octokit = github.getOctokit(githubToken);

    let { owner, repo } = github.context.repo;
    if (core.getInput("repo")) {
      [owner, repo] = core.getInput("repo").split("/");
    }

    const number = core.getInput("number") === ""
      ? github.context.issue.number
      : parseInt(core.getInput("number"));

    const comments = await octokit.issues.listComments({
      owner,
      repo,
      issue_number: number,
    });
    const comment_ids = comments.data.filter((comment) =>
      comment.body?.startsWith(body)
    ).map((comment) => comment.id);
    for (const comment_id of comment_ids) {
      await octokit.issues.deleteComment({
        owner,
        repo,
        issue_number: number,
        comment_id,
      });
    }
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

run();
