import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { error } from 'console';

export const postSnippet: string =
`---
layout: $\{1:post\}
title: $\{2\}
date: YYYY
category: $\{3\}
author: $\{4\}
tags: [$\{5\}]
summary: $\{6\}
---

$\{7\}`;

var insertFrontMatter: boolean = false;

export function shouldInsertFrontMatter(): boolean {
  return insertFrontMatter;
}

export function setFrontMatter(flag: boolean): void {
  insertFrontMatter = flag;
}

export async function createFile(dirName: string, newFileName: string, userTemplateName: string): Promise<string> {
  let folders = vscode.workspace.workspaceFolders;
  let folder = folders?.filter(f => dirName.indexOf(f.uri.fsPath) !== -1)[0];
  if (folder === undefined || dirName === null || dirName === undefined) {
    return newFileName;
  }

  if (!fs.lstatSync(dirName).isDirectory() && fs.lstatSync(dirName).isFile()) {
    dirName = path.dirname(dirName);
  }

  const templateName: string = vscode.workspace.getConfiguration().get('frontmattergen.template.path') + "/" + userTemplateName ;
  const templatePath = path.resolve(folder.uri.fsPath, templateName);
  const fileName = path.resolve(dirName, newFileName);
  const templateExists: boolean = templatePath !== undefined &&
                                  fs.existsSync(templatePath);
  const fileExists: boolean = fs.existsSync(fileName);
  const frontMatter = templateExists ? fs.readFileSync(templatePath) : '';
  setFrontMatter(!fileExists && !templateExists);
  if (!fileExists) {
    // placeholder
    let cparam: any = {'filename' : newFileName ,};
    dirName = dirName.replace(/\\/g,"/");
    const dirs = dirName.split(/\//g);
    if(dirs != null) {
      for(let i = dirs.length-1 ; i >= 0; i-- ) {
        cparam['dir' + (dirs.length-1 - i)] = dirs[i];
      }
    } 
      
    var frontMatterStr = compileString(frontMatter.toString(),new Date, cparam);
    fs.appendFileSync(fileName, frontMatterStr);
  }

  return fileName;
}

export async function openFile(fileName: string): Promise<vscode.TextEditor> {
  const stats = fs.statSync(fileName);

  if (stats.isDirectory()) {
    throw new Error("This file is a directory!");
  }

  const doc = await vscode.workspace.openTextDocument(fileName);
  if (!doc) {
    throw new Error('Could not open file!');
  }

  const editor = vscode.window.showTextDocument(doc);
  if (!editor) {
    throw new Error('Could not show document!');
  }
  return editor;
}

export async function getFileNameFromUser(): Promise<string> {
  const defaultFileName:any = vscode.workspace.getConfiguration().get<string>("frontmattergen.filename.default");
  let question = `What's the name of the new post?`;

  let filePath = await vscode.window.showInputBox({
    prompt: question,
    value: defaultFileName,
  });
  if (filePath === null || filePath === undefined) {
    throw new Error("Abort");
  }
  return filePath || defaultFileName;
}

export function getDateTime(): string {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yyyy = today.getFullYear();
  var time = String(today.getHours()).padStart(2, '0') +
             ":" +
             String(today.getMinutes()).padStart(2, '0');
  return yyyy + '-' + mm + '-' + dd + ' ' + time;
}

interface CompileParam {
  [key: string]: string | number;
}

function compileString(template: string, cdate: Date, params: CompileParam) {
  var dd = String(cdate.getDate()).padStart(2, '0');
  var mm = String(cdate.getMonth() + 1).padStart(2, '0');
  var yyyy = String(cdate.getFullYear());
  var yy = yyyy.substr(2, 2);

  var hh = String(cdate.getHours()).padStart(2, '0');
  var ii = String(cdate.getMinutes()).padStart(2, '0');
  var ss = String(cdate.getSeconds()).padStart(2, '0');

  var result = template
  .replace(/%yyyy%/gi, yyyy)
  .replace(/%yy%/gi, yy)
  .replace(/%mm%/gi, mm)
  .replace(/%dd%/gi, dd)
  .replace(/%hh%/gi, hh)
  .replace(/%ii%/gi, ii)
  .replace(/%ss%/gi, ss);

  for (var k in params) {
    const regex =  new RegExp(`%${k}%`, 'gi');
    result = result.replace(regex, String(params[k]));
  }
  return result;
}

export function formatFilename(fileName: string): string {
  if (fileName === null) {
    throw error;
  }
  if(fileName.indexOf(".") === -1) {
    fileName += vscode.workspace.getConfiguration().get('frontmattergen.filename.extension');
  }

  const filenamefmt: string = vscode.workspace.getConfiguration().get('frontmattergen.instance.filename') || "%yyyy%-%mm%-%dd%-%filename%";
  var today = new Date();
  return compileString(filenamefmt, today, { 'filename': fileName });
}

export async function findTemplate(dirName: string): Promise<string> {
    const tFolder = vscode.workspace.getConfiguration().get<string>('frontmattergen.template.path');
    let folders = vscode.workspace.workspaceFolders;
    let wsFolder = folders?.filter(f => dirName.indexOf(f.uri.fsPath) !== -1)[0];
    
    if (!tFolder || !wsFolder) {
      return "";
    }
    
    const templates = await vscode.workspace.findFiles(`${tFolder}/**/*`, "**/node_modules/**,**/archetypes/**");
    if (!templates || templates.length === 0) {
      return " ";
    }
    if(templates.length === 1) {
      return  templates.map(t => path.basename(t.fsPath))[0];
    }
    const selectedTemplate: any = await vscode.window.showQuickPick(templates.map(t => path.basename(t.fsPath)), {
      placeHolder: `Select the template to use`
    });
    return selectedTemplate;
}
