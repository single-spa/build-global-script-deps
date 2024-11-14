import { x } from "tar";
import fs from "node:fs/promises";

interface Options {
  globalScripts: string[];
  outputDir: string;
}

export async function buildGlobalScripts(options: Options) {
  const outputDir = options.outputDir.startsWith(".")
    ? options.outputDir
    : `./${options.outputDir}`;

  for (let globalScript of options.globalScripts) {
    console.log(globalScript);
    const packageName = globalScript.slice(0, globalScript.lastIndexOf("@"));
    const version = globalScript.slice(globalScript.lastIndexOf("@") + 1);
    const registryResponse = await fetch(
      `https://registry.npmjs.org/${packageName}`,
    );
    if (!registryResponse.ok) {
      throw Error(`Unable to find package '${packageName}' in npm registry`);
    }
    const registryJson = await registryResponse.json();
    const versionInfo = registryJson.versions[version];
    if (!versionInfo) {
      throw Error(
        `package '${packageName}' has not published version '${version}'`,
      );
    }

    const tarballResponse = await fetch(versionInfo.dist.tarball);

    if (!tarballResponse.ok) {
      throw Error(`Could not download tarball for package '${globalScript}'`);
    }

    await fs.mkdir(outputDir, { recursive: true });

    // To-do figure out how to pipe the fetch response into tar
    const contents = await tarballResponse.arrayBuffer();

    const tarballPath = `${outputDir}/tarball.tar`;

    await fs.writeFile(tarballPath, Buffer.from(contents), "utf-8");

    await x({
      f: tarballPath,
      cwd: outputDir,
    });

    const outputFolder = `${outputDir}/npm:${globalScript}`;

    // Create top-level folder for scoped packages
    const outputFolderParts = outputFolder.split("/");
    if (outputFolderParts.length > 2) {
      const pathParts = outputFolder.split("/");
      pathParts.pop();
      await fs.mkdir(pathParts.join("/"), { recursive: true });
    }

    await fs.rename(`${outputDir}/package`, outputFolder);

    await fs.unlink(tarballPath);
  }
}
