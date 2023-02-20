import { loadFilesSync, loadFiles } from "@graphql-tools/load-files";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ** : 모든 폴더
// * : 모든 파일
const loadedTypes = await loadFiles(`${__dirname}/**/*.typeDefs.{ts,js}`, {
  requireMethod: async (path) => {
    return await import(pathToFileURL(path).toString());
  },
});
const loadedResolvers = await loadFiles(`${__dirname}/**/*.resolvers.{ts,js}`, {
  requireMethod: async (path) => {
    return await import(pathToFileURL(path).toString());
  },
});

export const typeDefs = mergeTypeDefs(loadedTypes);
export const resolvers = mergeResolvers(loadedResolvers);
