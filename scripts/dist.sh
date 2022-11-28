# npm run build

rm -rf ./dist/npm/exhibitor/lib/
mkdir -p dist/npm/exhibitor/lib/site/server
cp -r ./build/site/server/ ./dist/npm/exhibitor/lib/site/server
mkdir -p dist/npm/exhibitor/lib/site/client
cp -r build/site/client/ dist/npm/exhibitor/lib/site/client
mkdir -p dist/npm/exhibitor/lib/api
cp -r build/api/ dist/npm/exhibitor/lib/api
mkdir -p dist/npm/exhibitor/lib/cli
cp -r build/cli/cli/ dist/npm/exhibitor/lib/cli