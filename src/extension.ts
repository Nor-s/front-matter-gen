import * as vscode from 'vscode';

import {formatFilename, getFileNameFromUser,
        openFile, createFile, postSnippet,
        getDateTime, shouldInsertFrontMatter, setFrontMatter, findTemplate} from './utils';

export function
activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.frontmattergen.createPost',
    async (uri: vscode.Uri) => {
      const dirName = uri.fsPath;
      try {
		  // get template
		var userTemplateFile = await findTemplate(dirName);
        var filename = await getFileNameFromUser();
      } catch(e) {
        return;
      }
      const userFilePath = formatFilename(filename);
      try {
        let editor = await openFile(await createFile(dirName, userFilePath, userTemplateFile));
        // Insert snippet only if the user did not provide a template file and
        // a new post file had to be created
        if (shouldInsertFrontMatter()) {
          const snippetStr = postSnippet.replace('YYYY', getDateTime());
          editor.insertSnippet(new vscode.SnippetString(snippetStr));
          setFrontMatter(false);
        }
      } catch (err) {
		    if (err instanceof Error) {
      			vscode.window.showErrorMessage(err.message);
  			}
      }
    }
  );

  context.subscriptions.push(disposable);
}