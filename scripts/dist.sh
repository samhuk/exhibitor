npm run build

rm -rf ./dist/npm/exhibitor/lib/
cp -r ./build/site/server/ ./dist/npm/exhibitor/lib/site/server/
cp -r ./build/site/client/ ./dist/npm/exhibitor/lib/site/client/
cp -r ./build/api/ ./dist/npm/exhibitor/lib/api/
cp -r ./build/cli/ ./dist/npm/exhibitor/lib/cli/