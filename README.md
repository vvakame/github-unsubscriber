# github-unsubscriber

unwatch repositories in 1 action

```
# required repo:status, public_repo, notifications
#   from https://github.com/settings/tokens
$ export GITHUB_TOKEN=<your github personal access token place here>

# setup config
$ curl -L -o unsubscribe-config.yml https://raw.githubusercontent.com/vvakame/github-unsubscriber/master/unsubscribe-config.yml.sample
$ cat unsubscribe-config.yml
unwatch:
  # subscribed repository will be filtered by ... new RegExp(pattern).test(`${repo.owner.name}/${repo.name}`)
  rules:
    - foobar-org/
  ignores:
    - my-favorite-repo

$ npx github-unsubscriber
Below list will be unwatch...
	foobar-org/suddenly-created-repo
Let's use the --run option if you really want to unwatch...

$ npx github-unsubscriber --run
Below list will be unwatch...
	foobar-org/suddenly-created-repo
done!
```
