# mesh-explorer

Core engine for the 3D cognitive graph system.

Not an app. Not a UI project.
A cognitive graph engine.
Human-first. DB-first. Exploration-first.

---

# Philosophy

* Graph = cognitive space
* DB = memory
* RAM = consciousness
* 3D = spatial language
* Types = laws
* Relations = forces
* Projections = points of view
* Export = photograph
* Import = rebirth

---

# Repository Structure

```
/skull01-core
  /src
    /schema
      graph.schema.json

    /storage
      StorageEngine.ts
      IndexedDBAdapter.ts
      BlobStore.ts

    /memory
      MemoryGraph.ts
      GraphIndex.ts

    /core
      CoreGraphEngine.ts
      ActionLog.ts

    /types
      TypeEngine.ts
      ConstraintEngine.ts

    /query
      QueryEngine.ts
      DSLParser.ts

    /projection
      ProjectionEngine.ts

    /export
      ExportEngine.ts
      ImportEngine.ts
      FSExporter.ts

    /utils
      ids.ts
      hashing.ts
      validation.ts

  /docs
    ARCHITECTURE.md
    DSL.md
    MIGRATION.md

  README.md
  TODO.md
  package.json
  tsconfig.json
```
