import * as AdmZip from 'adm-zip';
import * as Path from 'path';
import * as fs from 'fs';

import { execSync } from 'child_process';

function isDirectory(path: string) {
    const stat = fs.statSync(path);
    return stat.isDirectory();
}

type ZipOptions = {
    includeNodeModules: boolean;
    typeScriptPackage: boolean;
    excludedFileNames: string[];
};

const productionModulesFolder = 'production_modules';

function getPackageVersion(folder: string) {
    try {
        const manifest = fs.readFileSync(Path.join(folder, 'manifest.json'));
        const manifestParsed = JSON.parse(manifest.toString());
        return manifestParsed.package_version.replace(/\./g, '_');
    } catch (err) {
        console.error('Get package version:', err);
    }
}

function createZipArchive(zip: AdmZip, folder: string, options: ZipOptions) {
    const zipFileRegex = new RegExp(`${Path.basename(folder)}(_[0-9]){3}\\.zip`);
    const files = fs.readdirSync(folder);
    for (const file of files) {
        const path = Path.join(folder, file);
        const isDir = isDirectory(path);
        if (
            file[0] === '.' ||
            zipFileRegex.test(file) ||
            file === 'node_modules' ||
            (file === 'src' && options.typeScriptPackage) ||
            options.excludedFileNames.includes(file)
        ) {
            continue;
        } else if (file === 'dist' && options.typeScriptPackage) {
            zip.addLocalFolder(path);
        } else if (file === productionModulesFolder && options.includeNodeModules) {
            zip.addLocalFolder(Path.join(productionModulesFolder, 'node_modules'), 'node_modules');
        } else if (isDir) {
            zip.addLocalFolder(path, file);
        } else {
            zip.addLocalFile(path);
        }
    }
}

function installDependencies() {
    if (!fs.existsSync(productionModulesFolder)) {
        fs.mkdirSync(productionModulesFolder, {});
    }

    fs.cpSync('package.json', Path.join(productionModulesFolder, 'package.json'));
    fs.cpSync('package-lock.json', Path.join(productionModulesFolder, 'package-lock.json'));

    execSync(`npm ci --omit=dev`, {
        cwd: Path.join(process.cwd(), productionModulesFolder),
    });
}

function main(args: string[]) {
    const options: ZipOptions = {
        includeNodeModules: false,
        typeScriptPackage: false,
        excludedFileNames: [],
    };
    for (const arg of args) {
        if (arg === '-i' || arg === '-includeNodeModules') {
            options.includeNodeModules = true;
        }
        if (arg.startsWith('-e=') || arg.startsWith('-exclude=')) {
            options.excludedFileNames = arg.substring(arg.indexOf('=') + 1).split(',');
        }
    }

    if (options.includeNodeModules) {
        installDependencies();
    }
    if (fs.existsSync('dist')) {
        options.typeScriptPackage = true;
    }

    const folder = Path.resolve('.');
    const packageVersion = getPackageVersion(folder);
    const zipFile = `${Path.basename(folder)}_${packageVersion}.zip`;

    if (fs.existsSync(zipFile)) {
        try {
            fs.unlinkSync(zipFile);
        } catch (error) {
            console.log('An error occured: ', error);
            process.exit(1);
        }
    }

    const zip: AdmZip = new AdmZip();
    createZipArchive(zip, folder, options);
    zip.writeZip(zipFile);
}

main(process.argv.slice(2));
