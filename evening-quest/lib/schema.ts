import {
  type KeySchemaElement,
  type AttributeDefinition,
  type GlobalSecondaryIndex,
} from "@aws-sdk/client-dynamodb";

export const TableName = {
  SERVICES: "services",
  QUEST_HISTORY: "quest-history",
} as const;

export type TableName = (typeof TableName)[keyof typeof TableName];

export interface TableSchema {
  name: TableName;
  keySchema: KeySchemaElement[];
  attributeDefinitions: AttributeDefinition[];
  globalSecondaryIndexes?: GlobalSecondaryIndex[];
}

export const TABLE_SCHEMAS: Record<TableName, TableSchema> = {
  [TableName.SERVICES]: {
    name: TableName.SERVICES,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "status", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "status-index",
        KeySchema: [{ AttributeName: "status", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
  [TableName.QUEST_HISTORY]: {
    name: TableName.QUEST_HISTORY,
    keySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    attributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "completedAt", AttributeType: "S" },
    ],
    globalSecondaryIndexes: [
      {
        IndexName: "completed-index",
        KeySchema: [{ AttributeName: "completedAt", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
  },
};

export const TABLE_NAMES: TableName[] = Object.values(TableName);

export const IndexName = {
  SERVICES_STATUS: "status-index",
  QUEST_HISTORY_COMPLETED: "completed-index",
} as const;

export type IndexName = (typeof IndexName)[keyof typeof IndexName];
