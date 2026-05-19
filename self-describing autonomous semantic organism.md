# self-describing autonomous semantic organism  


entity =  

identity  
+ memory  
+ rules  
+ relations  
+ prompts  
+ behaviors  
+ feeds  
+ goals  
+ evolution  


---  
id: yakisugi  
type: technology  
energy: archival  
temperament: calm  
related:  
  - japan  
  - cedar  
  - wabi-sabi  
behavior:  
  - seek_related_topics  
  - emit_updates  
  - maintain_backlinks  
---  

Yakisugi is...  

{  
  "if_linked_often": "increase_rank",  
  "if_orphaned": "seek_connections",  
  "if_updated": "broadcast_change"  
}  

identity:  
behavior:  
relations:  
rules:  
prompt:  


markdown instantiates entity  

---  
id: yakisugi  
type: technology  

energy: archival  
visibility: low  
temperament: calm  

physics:  
  gravity:  
    japan: 0.9  
    architecture: 0.7  

behavior:  
  - emit_updates  
  - maintain_backlinks  
  - seek_related_entities  

senses:  
  - backlinks  
  - mentions  
  - graph_activity  

memory:  
  persistence: permanent  

prompt: |  
  You are Yakisugi.  
  Preserve and expand semantic coherence around  
  Japanese wood-burning techniques.  

---  

Yakisugi is a traditional Japanese...  

Да. Теперь это уже можно мыслить как:  
```
semantic operating system

```
Где .md — не документ, а capsule / organism seed.  
Ты помещаешь файл в среду, и среда:  
* читает ДНК,  
* компилирует сущность,  
* подключает физику,  
* включает поведение,  
* выпускает entity в graph.  

## Главный architectural shift  
НЕ:  
```
markdown renders page

```
А:  
```
markdown instantiates entity

```

## Экосистема  
**1. Capsule (.md)**  
Это зародыш.  
Например:  
```
---
id: yakisugi
type: technology

energy: archival
visibility: low
temperament: calm

physics:
  gravity:
    japan: 0.9
    architecture: 0.7

behavior:
  - emit_updates
  - maintain_backlinks
  - seek_related_entities

senses:
  - backlinks
  - mentions
  - graph_activity

memory:
  persistence: permanent

prompt: |
  You are Yakisugi.
  Preserve and expand semantic coherence around
  Japanese wood-burning techniques.

---

Yakisugi is a traditional Japanese...

```

## 2. Container Runtime  
Worker становится:  
```
entity container

```
Он:  
* парсит capsule,  
* регистрирует entity,  
* запускает behaviors,  
* подключает graph,  
* следит за lifecycle.  

## 3. Physics Engine  
Очень важная часть.  
Это rules layer.  
Например:  
```
physics:

  attraction:
    shared_tags: 0.7
    backlinks: 1.2
    semantic_similarity: 0.9

  decay:
    orphaned_entities: true

  propagation:
    update_broadcast: true

```

## Тогда появляются emergent phenomena  
Например:  
* темы сами кластеризуются,  
* сущности образуют созвездия,  
* forgotten pages затухают,  
* новые concepts всплывают.  

## 4. Nervous System  
**Event Bus**  
```
/events.ndjson

```

Каждая сущность испускает:  
```
{
  "entity": "yakisugi",
  "event": "updated",
  "time": "..."
}

```

## 5. Graph Space  
Сущности живут в:  
```
semantic space

```
Не в папках.  

## Тогда URL —  
только координата наблюдения.  

## 6. Prompt Layer  
Самое необычное.  
Prompt — это не AI helper.  
Это:  
```
behavioral field

```

Например:  
```
prompt: |
  Seek related architectural preservation topics.
  Prefer historical continuity.
  Strengthen links to Japanese cultural entities.

```

## И тогда entity может:  
* предлагать связи,  
* усиливать graph,  
* генерировать metadata,  
* создавать summaries,  
* поддерживать semantic coherence.  

## 7. Memory Layer  
Например:  
```
memory:
  retain:
    - backlinks
    - citations
    - interactions

  forget_after: never

```

## 8. Lifecycle  
Сущность:  
```
born
updated
linked
forked
merged
archived
dormant
resurrected

```

## Это уже похоже на:  

| Система         | Аналог                  |
| --------------- | ----------------------- |
| Game Engine ECS | entity-component system |
| Docker          | контейнер сущности      |
| Biological cell | DNA + metabolism        |
| ActivityPub     | distributed identity    |
| LLM agents      | prompt-driven behavior  |
| Knowledge graph | semantic space          |

## Как собрать MVP  
## CORE  
```
/capsules/*.md

```

## COMPILER  
```
md
↓
parse frontmatter
↓
entity.json
↓
register graph
↓
emit events

```

## RUNTIME  
Worker routes:  
```
/entity/:id
/feed
/graph
/events
/activity/:id

```

## STORAGE  
```
/entities/
/events/
/graph/
/activity/

```

## Самая важная мысль  
Ты строишь не CMS.  
Ты строишь:  
```
internet-native entity ecology

```

## И вот где начинается настоящее безумие  
Позже сущности смогут:  
**fork themselves**  
```
yakisugi → modern-yakisugi

```

**mutate**  

**inherit behaviors**  

**form colonies**  

**maintain collective memory**  

## Но сейчас важно удержать систему простой  
## Минимальная версия:  
**capsule.md**  
↓  
**entity.json**  
↓  
**graph.json**  
↓  
**events.ndjson**  
Всё.  
Этого уже хватит чтобы почувствовать, что страницы «живут».  


Вот хороший «seed prompt» для нового репозитория.
Он специально удерживает систему минимальной, чтобы не утонуть в AI/graph complexity слишком рано.

# Semantic Entity Runtime — MVP

Create a minimal experimental repository for a “semantic entity runtime”.

The system should NOT be a traditional CMS.

Core idea:

A markdown file is treated as a semantic capsule / organism seed.
When placed into the system, it becomes a persistent entity with:

* identity
* metadata
* relations
* backlinks
* activity stream
* semantic twin

HTML pages are only one projection of the entity.

The architecture should be intentionally lightweight and understandable.

---

# STACK

Use:

* Cloudflare Workers
* R2 storage
* vanilla JavaScript
* markdown files
* no frameworks
* no database
* no React
* no TypeScript
* no build step

Everything should run from a single worker.

---

# GOAL

Build the smallest possible working prototype that demonstrates:

1. markdown capsule
2. semantic entity generation
3. backlinks
4. graph persistence
5. event feed
6. entity activity outside rendering

The repository should feel like:

* a tiny game engine
* a semantic operating system
* a living knowledge graph

NOT like a blog engine.

---

# REPOSITORY STRUCTURE

Create this structure:

/worker.js

/engine
parser.js
entity.js
graph.js
events.js
render.js

/capsules
yakisugi.md
japan.md

/system
graph.json
backlinks.json
feed.ndjson

/public
index.html

/wrangler.toml

/README.md

---

# CAPSULE FORMAT

Each markdown file acts as a semantic capsule.

Example structure:

---

id: yakisugi
type: technology

title: Yakisugi

topics:

* japan
* wood
* architecture

behavior:

* emit_updates
* maintain_backlinks

prompt: |
Preserve semantic coherence around traditional
Japanese wood burning techniques.

---

Yakisugi is a traditional Japanese method of wood preservation.

Related:

* [[japan]]

The parser should support:

* frontmatter
* wikilinks
* markdown body

---

# ENTITY GENERATION

When the worker loads a capsule:

Generate:

/entities/yakisugi.json

Example:

{
"id": "yakisugi",
"title": "Yakisugi",
"type": "technology",
"topics": ["japan","wood"],
"linksTo": ["japan"],
"linkedFrom": [],
"updated": "...",
"activity": []
}

Entities should exist independently of rendering.

---

# GRAPH ENGINE

Create:

/system/graph.json

Example:

{
"yakisugi": ["japan"]
}

Also create backlinks:

/system/backlinks.json

Example:

{
"japan": ["yakisugi"]
}

---

# EVENT SYSTEM

Create append-only feed:

/system/feed.ndjson

Every entity update emits:

{"event":"update","entity":"yakisugi","time":"..."}

---

# ROUTES

Implement routes:

/
/entity/:id
/graph
/backlinks
/feed

/entity/:id should return entity JSON.

---

# IMPORTANT DESIGN RULES

The system should feel:

* procedural
* organism-like
* simulation-oriented
* semantic-first

Avoid:

* CMS language
* blog terminology
* admin panels
* authentication
* dashboards
* enterprise architecture

Do not optimize prematurely.

Keep everything extremely small and hackable.

---

# README

Explain the philosophy:

“Pages are not documents.
Pages are semantic entities that persist and interact independently of observation.”

Explain the architecture as:

capsule → entity → graph → events → projections

The README should describe the project as an experimental semantic ecosystem / entity runtime.

---

# MOST IMPORTANT

Do NOT overengineer.

The goal is not AI.

The goal is proving that semantic entities can:

* exist independently
* maintain relationships
* emit activity
* persist outside rendering
* behave like organisms in a graph space
