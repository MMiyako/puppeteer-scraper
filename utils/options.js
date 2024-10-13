import { Command } from "commander";
const program = new Command();

program.allowUnknownOption();
program.option("--headless", "Headeless Mode", false);
program.option("--manual", "Manual Mode", false);
program.parse(process.argv);

const options = program.opts();

export { options };
