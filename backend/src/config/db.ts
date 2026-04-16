import mongoose from "mongoose";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

// ─── Schema field summary builder ────────────────────────────────────────────
function summarizeSchema(schema: mongoose.Schema): string {
  const paths = Object.entries(schema.paths)
    .filter(([key]) => !["__v", "_id"].includes(key))
    .map(([key, schemaType]) => {
      const type = (schemaType as mongoose.SchemaType & { instance?: string }).instance || "Mixed";
      const isRequired = !!(schemaType as mongoose.SchemaType & { isRequired?: boolean }).isRequired;
      const hasDefault = (schemaType as mongoose.SchemaType & { defaultValue?: unknown }).defaultValue !== undefined;
      const flags: string[] = [];
      if (isRequired) flags.push("required");
      if (hasDefault) flags.push("default");
      return `    • ${key}: ${type}${flags.length ? ` [${flags.join(", ")}]` : ""}`;
    });
  return paths.join("\n");
}

// ─── Startup database info log ────────────────────────────────────────────────
async function logDatabaseInfo(): Promise<void> {
  const conn = mongoose.connection;
  const dbName = conn.name || conn.db?.databaseName || "unknown";
  const host = conn.host || "unknown";
  const port = conn.port;

  // Fetch real collection list from MongoDB
  let collectionList: string[] = [];
  try {
    const collections = await conn.db?.listCollections().toArray() ?? [];
    collectionList = collections.map((c) => c.name);
  } catch {
    collectionList = Object.keys(conn.collections);
  }

  const models = mongoose.modelNames();

  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║              🗄️  DATABASE CONNECTION INFO                   ║");
  console.log("╠══════════════════════════════════════════════════════════════╣");
  console.log(`║  Database  : ${dbName.padEnd(48)}║`);
  console.log(`║  Host      : ${host.padEnd(48)}║`);
  console.log(`║  Port      : ${String(port || 27017).padEnd(48)}║`);
  console.log(`║  Cluster   : HireFusion (MongoDB Atlas)                      ║`);
  console.log(`║  Auth DB   : admin                                           ║`);
  console.log(`║  App Name  : HireFusion                                      ║`);
  console.log("╠══════════════════════════════════════════════════════════════╣");
  console.log(`║  Registered Models : ${String(models.length).padEnd(40)}║`);
  console.log(`║  Atlas Collections : ${String(collectionList.length).padEnd(40)}║`);
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  // Log each registered model with its schema
  console.log("📋  REGISTERED MONGOOSE MODELS & SCHEMAS\n" + "─".repeat(64));
  for (const modelName of models.sort()) {
    const model = mongoose.model(modelName);
    const collectionName = model.collection.collectionName;
    const schemaFields = summarizeSchema(model.schema);
    const inAtlas = collectionList.includes(collectionName);

    console.log(`\n┌─ Model: ${modelName}`);
    console.log(`│  Collection : ${collectionName} ${inAtlas ? "✅ (exists in Atlas)" : "🔄 (will be created on first write)"}`);
    console.log(`│  Fields:`);
    if (schemaFields) {
      console.log(schemaFields);
    } else {
      console.log("    (no fields registered)");
    }
    console.log("└" + "─".repeat(63));
  }

  if (collectionList.length > 0) {
    const unregistered = collectionList.filter(
      (c) => !models.map((m) => mongoose.model(m).collection.collectionName).includes(c)
    );
    if (unregistered.length > 0) {
      console.log(`\n⚠️  Atlas collections without Mongoose model: [${unregistered.join(", ")}]`);
    }
  }

  console.log("\n" + "═".repeat(64) + "\n");
}

// ─── Connect ──────────────────────────────────────────────────────────────────
export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  // Extract and display database name from URI before connecting
  const uriDbMatch = uri.match(/\/([^/?]+)\?/);
  const dbNameFromUri = uriDbMatch?.[1] || "(not set — defaulting to 'test')";
  console.log(`\n🔌 Connecting to MongoDB Atlas...`);
  console.log(`   Database: ${dbNameFromUri}`);

  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
      console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);

      // Log full database info after all models are registered
      // Small delay to ensure all model imports have completed
      setImmediate(() => logDatabaseInfo());
      return;
    } catch (err) {
      attempt++;
      console.error(`❌ MongoDB connection attempt ${attempt} failed:`, err);
      if (attempt < MAX_RETRIES) {
        console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000}s...`);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }
  }
  throw new Error(`Failed to connect to MongoDB after ${MAX_RETRIES} attempts`);
}

// ─── Event listeners ─────────────────────────────────────────────────────────
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error:", err);
});
