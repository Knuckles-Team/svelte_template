#!/bin/bash

function usage(){
  echo -e "\nUsage: "
  echo -e "deploy-svelte -h [Help]"
  echo -e "deploy-svelte --help [Help]"
  echo -e "deploy-svelte -e 'prod'"
  echo -e "\nFlags: "
  echo -e "-h | --help "
  echo -e "-e | --environment [ <development/production> ] "
}

environment='development'

# Check if arguments were provided
if [ -z "$1" ]; then
  usage
  exit 0
fi

while test -n "$1"; do
  case "$1" in
    h | -h | --help)
      usage
      exit 0
      ;;
    e | -e | --environment)
      if [ "${2}" ]; then
        environment="${2}"
        shift
      else
        echo 'ERROR: "-f | --file" requires a non-empty option argument.'
        exit 0
      fi
      shift
      ;;
    --)# End of all options.
      shift
      break
      ;;
    -?*)
      printf 'WARNING: Unknown option (ignored): %s\n' "$1" >&2
      ;;
    *)
      shift
      break
      ;;
  esac
done

pushd /usr/src/app || echo "Unable to enter /usr/src/app"
  if [ ${environment} == "development" ] || [ ${environment} == "dev" ]; then
    echo "Standing up Development Environment"
    npm run dev
  elif [ ${environment} == "production" ] || [ ${environment} == "prod" ]; then
    echo "Standing up Production Environment"
    npm run build
    npm run start
  fi
popd || echo "Unable to exit /usr/src/app"
