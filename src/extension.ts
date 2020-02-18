import * as vscode from 'vscode';
import * as find from "find";
import * as path from "path";

// TODO: ほんとはこのへんカスタマイズしたいよね
const SRC_PATH = "src";
const SRC_PREFIX = "~/";
const ASSET_PREFIX = "ASSETS_";
const PATTERN = /\.(png|jpe?g|gif|mp3|wav)$/;

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage("Error: active editor is not found.");
			return;
		}

		const folders = vscode.workspace.workspaceFolders;
		if (!folders) {
			return;
		}
		const [root] = [...folders.values()];
		const srcRoot = path.join(root.uri.path, SRC_PATH);
		find.file(PATTERN, srcRoot, (files) => {
			const items = files.map((p) => {
				const baseName = path.basename(p);
				const subPath = path.relative(srcRoot, p);
				const dirName = path.dirname(subPath);
				return {
					label: baseName,
					detail: dirName,
					baseName,
					subPath
				};
			});

			if (!items.length) {
				vscode.window.showErrorMessage("Error: assets is not found.");
				return;
			}

			vscode.window.showQuickPick(items, { matchOnDetail: true }).then((res) => {
				if (!res) {
					return;
				}
				const { subPath, baseName } = res;
				const varName = baseName.replace(PATTERN, "").replace(/-/g, "_").toUpperCase();
				const tmpAssetName = `${ASSET_PREFIX}${varName}`;
				const importStatement = `import ${tmpAssetName} from "${SRC_PREFIX}${subPath}";`;

				editor.edit((e) => {
					e.insert(editor.selection.start, importStatement);
				});
			});
		});
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
