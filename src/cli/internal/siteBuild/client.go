package siteBuild

import (
	"os"
	"path/filepath"

	"github.com/evanw/esbuild/pkg/api"
)

const siteClientDir string = "./src/site/client"
const siteClientEntrypoint string = "main.tsx"
const siteClientBuildOutputDir string = "./build/site/client"

func BuildClient() {
	result := api.Build(api.BuildOptions{
		EntryPoints: []string{filepath.Join(siteClientDir, siteClientEntrypoint)},
		Outfile:     filepath.Join(siteClientBuildOutputDir, "index.js"),
		Platform:    api.PlatformBrowser,
		Sourcemap:   api.SourceMapExternal,
		Incremental: true,
		Bundle:      true,
		Write:       true,
		LogLevel:    api.LogLevelInfo,
		Metafile:    true,
		Loader: map[string]api.Loader{
			".ttf":   api.LoaderFile,
			".woff":  api.LoaderFile,
			".woff2": api.LoaderFile,
		},
		Plugins: ,
	})

	if len(result.Errors) > 0 {
		os.Exit(1)
	}
}
