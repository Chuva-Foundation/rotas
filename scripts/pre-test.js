const fs = require('fs');
const path = require('path');

const base_path = './';
const package_json_path = path.join(base_path, 'package.json');
const new_dependencies = {};

fs.readdirSync('./src/shared', { withFileTypes: true }).forEach((file) => {
  if (file.isDirectory() && file.name !== 'node_modules') {
    const directory_name = file.name;
    new_dependencies[directory_name] = `file:./src/shared/${directory_name}`;
  }
});

fs.readFile(package_json_path, 'utf8', (err, package_json_content) => {
  if (err) {
    console.error('Error reading package.json:', err);
    return;
  }

  try {
    const package_json = JSON.parse(package_json_content);

    package_json.devDependencies = {
      ...package_json.devDependencies,
      ...new_dependencies,
    };

    const updated_package_json_content = JSON.stringify(package_json, null, 2);

    fs.writeFile(package_json_path, updated_package_json_content, 'utf8', (err) => {
      if (err) {
        console.error('Error writing to package.json:', err);
        return;
      }
      console.log('New dependencies added to package.json');
    });
  } catch (jsonError) {
    console.error('Error parsing package.json:', jsonError);
  }
});
