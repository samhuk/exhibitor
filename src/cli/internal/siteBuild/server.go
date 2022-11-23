package siteBuild

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/evanw/esbuild/pkg/api"
)

const siteServerDir string = "./src/site/server"
const siteServerEntrypointFile string = "index.ts"
const siteServerBuildOutputDir string = "./build/site/server"

var nativeNodePlugin = api.Plugin{
	Name: "native-node-modules",
	Setup: func(build api.PluginBuild) {
		// If a ".node" file is imported within a module in the "file" namespace, resolve
		// it to an absolute path and put it into the "node-file" virtual namespace.
		build.OnResolve(
			api.OnResolveOptions{Filter: `\.node$`, Namespace: "file"},
			func(args api.OnResolveArgs) (api.OnResolveResult, error) {
				return api.OnResolveResult{
					Path:      filepath.Join(args.ResolveDir, args.Path),
					Namespace: "node-file",
				}, nil
			},
		)

		// Files in the "node-file" virtual namespace call "require()" on the
		// path from esbuild of the ".node" file in the output directory.
		build.OnLoad(
			api.OnLoadOptions{Filter: `.*`, Namespace: "node-file"},
			func(args api.OnLoadArgs) (api.OnLoadResult, error) {
				contents := fmt.Sprintf(`import path from "%v"
try { module.exports = require(path) }
catch {}`, args.Path)
				return api.OnLoadResult{
					Contents: &contents,
				}, nil
			},
		)

		// If a ".node" file is imported within a module in the "node-file" namespace, put
		// it in the "file" namespace where esbuild's default loading behavior will handle
		// it. It is already an absolute path since we resolved it to one above.
		build.OnResolve(
			api.OnResolveOptions{Filter: `\.node$`, Namespace: "node-file"},
			func(args api.OnResolveArgs) (api.OnResolveResult, error) {
				return api.OnResolveResult{
					Path:      args.Path,
					Namespace: "file",
				}, nil
			},
		)

		if build.InitialOptions.Loader == nil {
			build.InitialOptions.Loader = make(map[string]api.Loader)
		}
		build.InitialOptions.Loader[".node"] = api.LoaderFile
	},
}

func BuildServer() {
	result := api.Build(api.BuildOptions{
		EntryPoints: []string{filepath.Join(siteServerDir, siteServerEntrypointFile)},
		Outfile:     filepath.Join(siteServerBuildOutputDir, "index.js"),
		Platform:    api.PlatformNode,
		Sourcemap:   api.SourceMapExternal,
		External:    []string{"livereload-js"},
		Incremental: true,
		Bundle:      true,
		Write:       true,
		LogLevel:    api.LogLevelInfo,
		Metafile:    true,
		Plugins: []api.Plugin{
			nativeNodePlugin,
		},
	})

	if len(result.Errors) > 0 {
		os.Exit(1)
	}
}
