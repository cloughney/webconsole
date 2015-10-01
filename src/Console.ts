module Klochwork.Console {
	export interface IConsole {
		init(): void;
		onStdIn: (input: string) => void;
	}

	export class SimpleConsole implements IConsole {
		private static noCommandMessage = "No such command.";
		private commandHistory: string[];
		private onStdOut: (output: string) => void;

		constructor(onStdOut: (output: string) => void) {
			this.onStdOut = onStdOut;
		}

		public init = (): void => {
			this.commandHistory = [];
		}

		public onStdIn = (input: string): void => {
			var inputTokens = input.split(" ");

			var command = Commands.ConsoleCommandFactory.getFromCommandText(inputTokens[0]);
			if (!command) {
				this.onStdOut(SimpleConsole.noCommandMessage);
				return;
			}

			command.execute(inputTokens.slice(1)).done((output: string) => {
				this.onStdOut(output);
			}).fail((ex: any /*CommandFailureException*/) => {
				this.onStdOut(ex.message);
			});

			this.commandHistory.push(input);
		}
	}
}

module Klochwork.Console.Commands {
	export interface IConsoleCommand {
		execute(parameters: string[]): JQueryPromise<string>;
	}

	export class ConsoleCommandFactory {
		private static commandMap: { [key: string]: new () => IConsoleCommand } = {};

		public static registerCommand(commandText: string, commandClass: new () => IConsoleCommand): void {
			ConsoleCommandFactory.commandMap[commandText] = commandClass;
			console.log("Registered: " + commandText);
		}

		public static getFromCommandText(commandText: string): IConsoleCommand {
			var CommandClass = ConsoleCommandFactory.commandMap[commandText];
			return CommandClass ? new CommandClass() : null;
		}

		public static getRegisteredCommands(): string[] {
			var output = new Array<string>();

			for (var prop in ConsoleCommandFactory.commandMap) {
				if (ConsoleCommandFactory.commandMap.hasOwnProperty(prop)) {
					output.push(prop.toLowerCase());
				}
			}

			return output.sort();
		}
	}

	export class HelpCommand implements IConsoleCommand  {
		public execute(parameters: string[]): JQueryPromise<string> {
			var $d = jQuery.Deferred();

			var commands = ConsoleCommandFactory.getRegisteredCommands();

			var output = "--------------------<br>";
			output += "Available commands:<br>";

			for (var i = 0; i < commands.length; i++) {
				output += "&nbsp;&nbsp;-&nbsp;" + commands[i] + "<br>";
			}

			output += "--------------------";

			$d.resolve(output);

			return $d.promise();
		}
	}

	export class YodaSpeakCommand implements IConsoleCommand {
		public execute(parameters: string[]): JQueryPromise<string> {
			var $d = jQuery.Deferred();

			var firstParam = parameters[0];
			var helpFlags = ["--h", "-h", "--help", "-h"];

			if (!firstParam || helpFlags.indexOf(firstParam) !== -1) {
				$d.resolve("Usage: yoda &lt;phrase to be yoda-fied&gt;");
				return $d.promise();
			}

			$.ajax({
				url: 'https://yoda.p.mashape.com/yoda',
				method: 'GET',
				traditional: true,
				data: { sentence: parameters.join(" ") },
				beforeSend: (xhr: JQueryXHR) => {
					xhr.setRequestHeader("X-Mashape-Key", window["mashapeApiKey"]);
				}
			}).done((data: string) => {
				$d.resolve(data);
			}).fail(() => {
				$d.reject({ message: "Failed to make API call!" })
			});

			return $d.promise();
		}
	}

	export class QuoteCommand implements IConsoleCommand {
		public execute(params: string[]): JQueryPromise<string> {
			var $d = jQuery.Deferred();

			var firstParam = params[0];
			var helpFlags = ["--h", "-h", "--help", "-h"];

			if (helpFlags.indexOf(firstParam) !== -1) {
				$d.resolve("Usage: quote [category]");
				return $d.promise();
			}

			$.ajax({
				url: 'https://andruxnet-random-famous-quotes.p.mashape.com' + (firstParam ? '/cat=' + firstParam : ''),
				method: 'POST',
				contentType: 'application/json',
				beforeSend: (xhr: JQueryXHR) => {
					xhr.setRequestHeader("X-Mashape-Key", window["mashapeApiKey"]);
				}
			}).done((response: any) => {
				var data = JSON.parse(response);

				var output = "";
				output += "\"" + data.quote + "\"<br>";
				output += "&nbsp;-&nbsp;" + data.author + "&nbsp;(" + data.category + ")";

				$d.resolve(output);
			}).fail(() => {
				$d.reject({ message: "Failed to make API call!" })
			});

			return $d.promise();
		}
	}

	ConsoleCommandFactory.registerCommand("help", HelpCommand);
	ConsoleCommandFactory.registerCommand("yoda", YodaSpeakCommand);
	ConsoleCommandFactory.registerCommand("quote", QuoteCommand);
}
