package run

import (
	"github.com/samhuk/exhibitor/src/cli/internal/siteBuild"
)

func Command() {
	siteBuild.BuildClient()
	siteBuild.BuildServer()
}
