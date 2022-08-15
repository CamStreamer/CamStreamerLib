import * as fs from 'fs';
import * as Path from 'path';
import * as AdmZip from 'adm-zip';

function isDirectory(path: string) {
    const stat = fs.statSync(path);
    return stat.isDirectory();
}

type ZipOptions = {
    includeNodeModules: boolean;
    typeScriptPackage: boolean;
};

function createZipArchive(zip: AdmZip, folder: string, options: ZipOptions) {
    const files = fs.readdirSync(folder);

    for (let file of files) {
        const path = Path.join(folder, file);
        const isDir = isDirectory(path);
        if (
            file[0] == '.' ||
            (file == 'node_modules' && !options.includeNodeModules) ||
            (file == 'src' && options.typeScriptPackage)
        ) {
            continue;
        } else if (file == 'dist' && options.typeScriptPackage) {
            zip.addLocalFolder(path);
        } else if (isDir) {
            zip.addLocalFolder(path, file);
        } else {
            zip.addLocalFile(path);
        }
    }
}

function main(args: string[]) {
    const folder = Path.resolve('.');
    const zipFile = Path.basename(folder) + '.zip';
    const options: ZipOptions = {
        includeNodeModules: false,
        typeScriptPackage: false,
    };

    for (let arg of args) {
        if (arg == '-i' || arg == '-includeNodeModules') {
            options.includeNodeModules = true;
        }
    }

    if (fs.existsSync('dist')) {
        options.typeScriptPackage = true;
    }

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
