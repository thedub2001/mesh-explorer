# Roadmap

## Phase 0 — Foundations

* [ ] Define graph.schema.json v1
* [ ] Define DB table model
* [ ] Define blob storage model
* [ ] Define ID strategy

## Phase 1 — Storage

* [ ] IndexedDBAdapter
* [ ] BlobStore
* [ ] Atomic transaction layer
* [ ] Basic persistence API

## Phase 2 — Memory Model

* [ ] MemoryGraph structure
* [ ] In-memory indexing by id
* [ ] Sync DB <-> MemoryGraph

## Phase 3 — Core Graph

* [ ] CoreGraphEngine

  * [ ] createNode
  * [ ] updateNode
  * [ ] deleteNode
  * [ ] createRelation
  * [ ] deleteRelation
  * [ ] attachFile
  * [ ] detachFile

## Phase 4 — Actions

* [ ] ActionLog
* [ ] Undo
* [ ] Redo
* [ ] Transaction model

## Phase 5 — Types

* [ ] TypeEngine
* [ ] ConstraintEngine
* [ ] Type mutation system

## Phase 6 — Query

* [ ] QueryEngine
* [ ] Exact search
* [ ] Relation traversal
* [ ] DSLParser

## Phase 7 — Projection

* [ ] ProjectionEngine
* [ ] Filters
* [ ] Groups
* [ ] Views

## Phase 8 — Export/Import

* [ ] ExportEngine
* [ ] ImportEngine
* [ ] Project snapshot export
* [ ] FS export
* [ ] Graph import

## Phase 9 — Migration

* [ ] Migration engine
* [ ] Assisted migration UI hooks
