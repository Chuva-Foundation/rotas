const fs = require('fs');
const path = require('path');

const base_path = './';
const package_json_path = path.join(base_path, 'package.json');
const dependenciesToRemove = [];

fs.readdirSync('./src/shared', { withFileTypes: true }).forEach((file) => {
    if (file.isDirectory() && file.name !== 'node_modules') {
      const directory_name = file.name;
      dependenciesToRemove.push(directory_name);
    }
  });

fs.readFile(package_json_path, 'utf8', (err, package_json_content) => {
  if (err) {
    console.error('Error reading package.json:', err);
    return;
  }

  try {
    const package_json = JSON.parse(package_json_content);

    // Remove the specified dependencies from the package_json
    for (const dependency of dependenciesToRemove) {
      delete package_json.devDependencies[dependency];
    }

    const updated_package_json_content = JSON.stringify(package_json, null, 2);

    fs.writeFile(package_json_path, updated_package_json_content, 'utf8', (err) => {
      if (err) {
        console.error('Error writing to package.json:', err);
        return;
      }
      console.log('Dependencies removed from package.json');
    });
  } catch (jsonError) {
    console.error('Error parsing package.json:', jsonError);
  }
});
