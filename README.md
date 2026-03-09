# Recmaths Website

Official Website for _Recreational Maths Zürich_
> available at [recmaths.ch](https://recmaths.ch)

## Code Structure

The website is written in pure html, js and css. We do not use any third party software - maybe because we're stupid but also because it's more "fun".  

Each page is it's own `index.html`. The files use an additional custom build syntax to merge common html elements like the `<head>`. Run `python scripts/build.py` to rebuild the html files. The build system includes the following syntax, constructed to be work inside the html files itself:

- Use `<!-- SET key=value -->` to set page-wide variables which might be used in the template files.
- Use `<!-- BEGIN default_head -->` followed by a `<!-- END -->` to include an html template file located at `/scripts/templates/`. The included template indent will match the indent present on the `BEGIN` statement. You may not nest templates.
- `$base-path$` in template files will be replaced by the filepath to the current file, enabling relative import statements from template files.
- Use `<!-- JS_IMPORT path/to/script.js -->` to add a file to the js imports
- Use `<!-- BEGIN js_imports -->` (followed by an END of course) to include the js files.
  - If the `js_version` key is set, that's appended to the imports to force a reload on all browsers.
  - If the `js_minify` key is set to `true`, the javascript files will be bundled, minified and put under `js/minified/<hash>.js` and included automatically.
  - If the `js_module` key is set to `true`, the javascript import will use the `type=module` mode.

This custom build system is used because it makes it easy to work with the html files directly.