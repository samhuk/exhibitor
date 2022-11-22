package exhibitor

import (
	"log"
	"os"

	"github.com/samhuk/exhibitor/src/cli/internal/commands/run"
	"github.com/urfave/cli/v2"
)

func Command() {
	app := &cli.App{
		Name:  "run",
		Usage: "Starts the exhibitor app, consuming your defined components",
		Action: func(*cli.Context) error {
			run.Command()
			return nil
		},
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}
