import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import mongoose from "mongoose";

// Global Containers
export const models = {};
export const controllers = {};
export const services = {};

const loadRelevantFile = async (file, folderPath, globalContainers) => {
  const fileUrl = pathToFileURL(path.join(folderPath, file)).href;
  const { default: relevantFile } = await import(fileUrl);

  const baseFileName = path.parse(file).name;
  const type = baseFileName.substring(baseFileName.lastIndexOf("-") + 1);

  if (
    (type === "model" && !(relevantFile.prototype instanceof mongoose.Model)) ||
    (!relevantFile?.modelName &&
      !relevantFile?.controllerName &&
      !relevantFile?.serviceName)
  ) {
    throw new Error(`Invalid ${type} export in ${file}`);
  }

  const containerKey = type + "s";
  const nameKey = relevantFile[`${type}Name`];
  // ---> Eg. controllers[user-controller.js[controllerName]] = user-controller.js <---
  globalContainers[containerKey][nameKey] = relevantFile;
};

export const loadModules = async (app) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const modulesDir = path.join(__dirname, "modules");
  const folders = fs.readdirSync(modulesDir);

  const acceptedFileTypes = ["-model.js", "-controller.js", "-service.js"];
  const globalContainers = { models, controllers, services };
  const registeredRoutes = []; // For logging purposes

  const folderImportPromises = folders.map(async (folder) => {
    const folderPath = path.join(modulesDir, folder);
    if (!fs.statSync(folderPath).isDirectory()) return; // Return if not a file directory/folder

    const files = fs.readdirSync(folderPath);

    // ---- Import relevant files in parallel ----
    const relevantFiles = files.filter((file) =>
      acceptedFileTypes.some((val) => file.endsWith(val))
    );

    await Promise.all(
      relevantFiles.map((file) =>
        loadRelevantFile(file, folderPath, globalContainers).catch((err) => {
          console.error(`❌ Failed to load ${file}:`, err.message);
          process.exit(1);
        })
      )
    );

    // ----- Load routes if index.js exists -----
    const indexFile = path.join(folderPath, "index.js");
    if (fs.existsSync(indexFile)) {
      try {
        const moduleUrl = pathToFileURL(indexFile).href;
        const { default: routeIndexFile } = await import(moduleUrl);

        if (app && "indexRoute" in routeIndexFile && routeIndexFile.router) {
          app.use(routeIndexFile.indexRoute, routeIndexFile.router);
          registeredRoutes.push(routeIndexFile.indexRoute);
        }
      } catch (err) {
        console.error(
          `❌ Failed to load routes from module ${folder}:`,
          err.message
        );
        process.exit(1);
      }
    }
  });

  await Promise.all(folderImportPromises);

  Object.entries(globalContainers).forEach(([containerName, container]) => {
    const keys = Object.keys(container);

    if (keys.length > 0) {
      console.log(`✅ Loaded ${containerName}: ${keys.join(", ")}`);
    }
  });

  // Log routes together
  if (registeredRoutes.length > 0) {
    console.log(`✅ Loaded Routes: ${registeredRoutes.join(", ")}`);
  }
};
