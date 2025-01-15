realpath() {
  cwd="$(cd "$(dirname "$0")" && pwd -P)"
  [[ $1 = /* ]] && echo "$1" || echo "$cwd/${1#./}"
}

if [ -z "$1" ]; then
  echo -e 'Error: new version should be passed as a parameter\n(example: v2.6.1)'
  exit 1
fi

# define package.json file absolute path
package=`realpath ../package.json`
manifest=`realpath ../public/manifest.json`

# parse version from arguments
version=`echo "$1" | sed -E 's|^.*([0-9]{1,2}.[0-9]{1,2}.[0-9]{1,2}$)|\1|'`

# defines branches
mainBranch="main"
currentBranch=`git rev-parse --abbrev-ref HEAD`

# exit, on empty version
if [ -z "$version" ]; then
  echo -e 'Error: cannot detect a version in passed argument\n'
  exit 2
fi

# exit, on invalid version format
if ! [[ "$version" =~ ^[0-9]{1,2}.[0-9]{1,2}.[0-9]{1,2}$ ]]; then
  echo -e 'Error: version has invalid format, expected v0.0.0\n'
  exit 3
fi

# exit, currently checkout branch and main branch missmatch
if [ "$mainBranch" != "$currentBranch" ]; then
  echo -e "Error: cannot make a release from \033[1m'$currentBranch'\033[0m, you need to checkout \033[1m'$mainBranch'\033[0m instead\n"
  exit 4
fi

printf "\n\n"
read -n 1 -p "Are you making a PRODUCTION release (y/n)? " answer
printf "\n\n"

if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
  version="$version-rc"
  printf "\nYou are going to make a release for:\n"
else
  printf "\nYou are going to make a PRODUCTION release for:\n"
fi

echo -e "Branch: \033[1m'$mainBranch'\033[0m"
echo -e "Version: \033[1m'$version'\033[0m"

printf "\n\n"
read -n 1 -p "Confirm (y/n)? " answer
printf "\n\n"

# exit, release process canceled
if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
  exit 0
fi

# set new version
echo "Replace version in package.json and manifest.json"
sed -i.bak -E 's/"version.*/"version": "'$version'",/' $package
rm package.json.bak
sed -i.bak -E 's/"version.*/"version": "'$version'",/' $manifest
rm "$manifest.bak"

# commit version change
echo "Commit & Push package version change"
git add $package $manifest
git commit -m "set version to $version"
git push origin $currentBranch

# set a new tag
tag="v$version"

# create and push version tag
echo "Create a new git tag $tag"
git tag -a $tag
git push origin $tag

# zip contents of dist folder to release folder
echo "Create a new release archive"
rm -rf dist
npm run build

zip -r ./releases/$tag.zip ./dist

echo "Release process completed"