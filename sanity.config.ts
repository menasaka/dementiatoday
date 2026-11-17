"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes, singletonIds } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

export default defineConfig({
  name: "allfordiabetes",
  title: "All for Diabetes",
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    // Site settings are single documents: hide them from "Create new".
    templates: (templates) => templates.filter(({ schemaType }) => !singletonIds.includes(schemaType)),
  },
  document: {
    actions: (actions, { schemaType }) =>
      singletonIds.includes(schemaType) ? actions.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action)) : actions,
  },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
});
