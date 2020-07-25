# Be Like Jekyll
Markdown Jekyll-like New Post Generator for VS Code.

This extension makes it easier to create new blog posts for Jekyll-like
websites using the Visual Studio Code editor.

Using this extension, a user can create new post file with pre-filled
"front matter". The template for front matter can either be provided by the
user or the extension will use its built-in template.

## Usage instructions

If a user wants to provide a template file for new posts, they should create
a file: `.vscode/template/post` relative to current project root directory.

Here's an example of the template file:

```bash
$ cat $PROJECT_ROOT/.vscode/template/post
---
layout: post
title: This is a new article
author: User
summary: Summary of the article
---
```

If no template is provided, the extension will use its built-in template for
new posts. The default template is as follows:

```
---
layout: post,
title: This is a new article
date: %yyyy%-%mm%-%dd% %hh%:%ii%
category: Category
author: User
tags: [tag1, tag2]
summary: Summary of the article
---
```

To create a new post, a user must right click on a directory in the explorer
menu and select the "New Post" option. Then, a dialog box prompts the user
to provide the name of the file.

## Features

- Adds a new explorer context menu option to create new blog posts
- Sets up the file name automatically in the configurable format
- Ability to provide a template file for new post, use predefined if not supplied

### Supported Placeholder
The following placeholder can be used both in filename and inside template.

- %yyyy%: Year
- %mm%: Month
- %dd%: Day of month
- %hh%: Hour
- %ii%: Minute
- %ss%: Second
- %filename%: Name of supplied file plus extension

## Requirements

This has only been tested on the latest release (v.1.34.0) of Visual Studio
Code. It may or may not work on earlier releases.

## Extension Settings

There are no extension-specific settings for now.