import * as vscode from 'vscode';
import {CustomTextEditor} from "./CustomTextEditor";

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(CustomTextEditor.register(context));
}

export function deactivate() {}
